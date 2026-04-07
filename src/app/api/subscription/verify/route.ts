import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { verifyTransaction } from "@/lib/paystack";

// POST /api/subscription/verify — verify subscription payment after callback
export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reference } = await req.json();
    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { paystackRef: reference },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    if (subscription.organizerId !== auth.organizerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (subscription.status === "ACTIVE") {
      return NextResponse.json({ status: "active", endDate: subscription.endDate });
    }

    // Verify with Paystack
    const verification = await verifyTransaction(reference);

    if (verification.data.status === "success" && verification.data.amount === subscription.amount) {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "ACTIVE",
          startDate,
          endDate,
          paidAt: new Date(verification.data.paid_at),
          metadata: JSON.stringify(verification.data),
        },
      });

      return NextResponse.json({ status: "active", endDate });
    }

    return NextResponse.json({ status: "failed" }, { status: 400 });
  } catch (error) {
    console.error("Subscription verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
