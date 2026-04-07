import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { initializeTransaction } from "@/lib/paystack";
import { generateReference } from "@/lib/utils";

const SUBSCRIPTION_AMOUNT_KOBO = 500000; // ₦5,000

// POST /api/subscription/initialize — start subscription payment
export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if already has active subscription
  const now = new Date();
  const existing = await prisma.subscription.findFirst({
    where: {
      organizerId: auth.organizerId,
      status: "ACTIVE",
      endDate: { gt: now },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "You already have an active subscription" },
      { status: 400 }
    );
  }

  try {
    const reference = generateReference();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create pending subscription record
    await prisma.subscription.create({
      data: {
        organizerId: auth.organizerId,
        amount: SUBSCRIPTION_AMOUNT_KOBO,
        paystackRef: reference,
        status: "PENDING",
      },
    });

    // Initialize Paystack transaction
    const paystackRes = await initializeTransaction({
      email: auth.email,
      amount: SUBSCRIPTION_AMOUNT_KOBO,
      reference,
      callback_url: `${appUrl}/ajo/new?subscription_ref=${encodeURIComponent(reference)}`,
      metadata: {
        type: "subscription",
        organizerId: auth.organizerId,
      },
    });

    return NextResponse.json({
      authorization_url: paystackRes.data.authorization_url,
      reference,
    });
  } catch (error) {
    console.error("Subscription initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
