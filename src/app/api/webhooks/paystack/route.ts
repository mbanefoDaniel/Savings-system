import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateWebhookSignature } from "@/lib/paystack";
import { tryCompleteCycle } from "@/lib/ajo";

// POST /api/webhooks/paystack - handle Paystack webhook events
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // Validate webhook signature (critical security check)
    if (!signature || !validateWebhookSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === "charge.success") {
      const { reference, amount } = event.data;

      // ── Try Campaign contribution first ───────────────────
      const contribution = await prisma.contribution.findUnique({
        where: { paystackRef: reference },
      });

      if (contribution) {
        if (contribution.status === "SUCCESS") {
          return NextResponse.json({ received: true });
        }
        if (amount !== contribution.amount) {
          console.error(
            `Webhook: amount mismatch for ${reference}. Expected ${contribution.amount}, got ${amount}`
          );
          await prisma.contribution.update({
            where: { id: contribution.id },
            data: { status: "FAILED" },
          });
          return NextResponse.json({ received: true });
        }

        await prisma.$transaction([
          prisma.contribution.update({
            where: { id: contribution.id },
            data: {
              status: "SUCCESS",
              paidAt: new Date(event.data.paid_at),
              metadata: JSON.stringify(event.data),
            },
          }),
          prisma.campaign.update({
            where: { id: contribution.campaignId },
            data: {
              collectedAmount: { increment: contribution.amount },
            },
          }),
        ]);

        return NextResponse.json({ received: true });
      }

      // ── Try Ajo contribution ──────────────────────────────
      const ajoContrib = await prisma.ajoContribution.findUnique({
        where: { paystackRef: reference },
      });

      if (ajoContrib) {
        if (ajoContrib.status === "SUCCESS") {
          return NextResponse.json({ received: true });
        }
        if (amount !== ajoContrib.amount) {
          console.error(
            `Webhook: ajo amount mismatch for ${reference}. Expected ${ajoContrib.amount}, got ${amount}`
          );
          await prisma.ajoContribution.update({
            where: { id: ajoContrib.id },
            data: { status: "FAILED" },
          });
          return NextResponse.json({ received: true });
        }

        await prisma.ajoContribution.update({
          where: { id: ajoContrib.id },
          data: {
            status: "SUCCESS",
            paidAt: new Date(event.data.paid_at),
            metadata: JSON.stringify(event.data),
          },
        });

        // Check if all members have now paid — if so, trigger payout
        try {
          await tryCompleteCycle(ajoContrib.cycleId);
        } catch (err) {
          console.error("Webhook: tryCompleteCycle error:", err);
        }

        return NextResponse.json({ received: true });
      }

      // ── Try Subscription payment ─────────────────────────
      const subscription = await prisma.subscription.findUnique({
        where: { paystackRef: reference },
      });

      if (subscription) {
        if (subscription.status === "ACTIVE") {
          return NextResponse.json({ received: true });
        }
        if (amount !== subscription.amount) {
          console.error(
            `Webhook: subscription amount mismatch for ${reference}. Expected ${subscription.amount}, got ${amount}`
          );
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: "FAILED" },
          });
          return NextResponse.json({ received: true });
        }

        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 30);

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: "ACTIVE",
            startDate,
            endDate,
            paidAt: new Date(event.data.paid_at),
            metadata: JSON.stringify(event.data),
          },
        });

        return NextResponse.json({ received: true });
      }

      // Unknown reference
      console.warn(`Webhook: unknown reference ${reference}`);
    }

    // ── Handle transfer events (payouts) ──────────────────
    if (event.event === "transfer.success") {
      const { reference } = event.data;
      const payout = await prisma.payoutSchedule.findFirst({
        where: { transferRef: reference },
      });
      if (payout && payout.status !== "COMPLETED") {
        await prisma.payoutSchedule.update({
          where: { id: payout.id },
          data: { status: "COMPLETED", paidAt: new Date() },
        });
      }
    }

    if (event.event === "transfer.failed" || event.event === "transfer.reversed") {
      const { reference } = event.data;
      const payout = await prisma.payoutSchedule.findFirst({
        where: { transferRef: reference },
      });
      if (payout && payout.status !== "FAILED") {
        await prisma.payoutSchedule.update({
          where: { id: payout.id },
          data: { status: "FAILED" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Always return 200 to Paystack to prevent retries on our processing errors
    return NextResponse.json({ received: true });
  }
}
