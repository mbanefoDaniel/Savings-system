import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/paystack";
import { tryCompleteCycle } from "@/lib/ajo";

// GET /api/pay/verify?reference=xxx - verify payment after Paystack redirect
export async function GET(req: NextRequest) {
  try {
    const reference = req.nextUrl.searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 }
      );
    }

    // ── Campaign contribution ───────────────────────────────
    const contribution = await prisma.contribution.findUnique({
      where: { paystackRef: reference },
    });

    if (contribution) {
      if (contribution.status === "SUCCESS") {
        return NextResponse.json({
          status: "success",
          message: "Payment already verified",
        });
      }

      const verification = await verifyTransaction(reference);

      if (verification.data.status === "success") {
        if (verification.data.amount !== contribution.amount) {
          await prisma.contribution.update({
            where: { id: contribution.id },
            data: { status: "FAILED" },
          });
          return NextResponse.json(
            { error: "Amount mismatch detected" },
            { status: 400 }
          );
        }

        await prisma.$transaction([
          prisma.contribution.update({
            where: { id: contribution.id },
            data: {
              status: "SUCCESS",
              paidAt: new Date(verification.data.paid_at),
              metadata: JSON.stringify(verification.data),
            },
          }),
          prisma.campaign.update({
            where: { id: contribution.campaignId },
            data: {
              collectedAmount: { increment: contribution.amount },
            },
          }),
        ]);

        return NextResponse.json({
          status: "success",
          message: "Payment verified successfully",
        });
      } else {
        await prisma.contribution.update({
          where: { id: contribution.id },
          data: { status: "FAILED" },
        });
        return NextResponse.json({
          status: "failed",
          message: "Payment verification failed",
        });
      }
    }

    // ── Ajo contribution ────────────────────────────────────
    const ajoContrib = await prisma.ajoContribution.findUnique({
      where: { paystackRef: reference },
    });

    if (ajoContrib) {
      if (ajoContrib.status === "SUCCESS") {
        return NextResponse.json({
          status: "success",
          message: "Payment already verified",
        });
      }

      const verification = await verifyTransaction(reference);

      if (verification.data.status === "success") {
        if (verification.data.amount !== ajoContrib.amount) {
          await prisma.ajoContribution.update({
            where: { id: ajoContrib.id },
            data: { status: "FAILED" },
          });
          return NextResponse.json(
            { error: "Amount mismatch detected" },
            { status: 400 }
          );
        }

        await prisma.ajoContribution.update({
          where: { id: ajoContrib.id },
          data: {
            status: "SUCCESS",
            paidAt: new Date(verification.data.paid_at),
            metadata: JSON.stringify(verification.data),
          },
        });

        // Check if cycle is now complete
        try {
          await tryCompleteCycle(ajoContrib.cycleId);
        } catch (err) {
          console.error("tryCompleteCycle error:", err);
        }

        return NextResponse.json({
          status: "success",
          message: "Ajo contribution verified successfully",
        });
      } else {
        await prisma.ajoContribution.update({
          where: { id: ajoContrib.id },
          data: { status: "FAILED" },
        });
        return NextResponse.json({
          status: "failed",
          message: "Payment verification failed",
        });
      }
    }

    return NextResponse.json(
      { error: "Contribution not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
