import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { initializeTransaction } from "@/lib/paystack";
import { generateReference } from "@/lib/utils";

// POST /api/pay/initialize - initialize a payment for a contributor
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignSlug, contributorName, contributorEmail, amount } = body;

    if (!campaignSlug || !contributorName || !contributorEmail || !amount) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contributorEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: { slug: campaignSlug },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (!campaign.isActive) {
      return NextResponse.json(
        { error: "This campaign is no longer active" },
        { status: 400 }
      );
    }

    if (campaign.deadline && new Date(campaign.deadline) < new Date()) {
      return NextResponse.json(
        { error: "This campaign has passed its deadline" },
        { status: 400 }
      );
    }

    // Amount in kobo
    const amountKobo = Math.round(amount * 100);

    if (amountKobo < 10000) {
      // Minimum ₦100
      return NextResponse.json(
        { error: "Minimum contribution is ₦100" },
        { status: 400 }
      );
    }

    // If campaign has fixed amount, enforce it
    if (campaign.fixedAmount && amountKobo !== campaign.fixedAmount) {
      return NextResponse.json(
        { error: `This campaign requires a fixed amount of ₦${campaign.fixedAmount / 100}` },
        { status: 400 }
      );
    }

    const reference = generateReference();

    // Create pending contribution
    await prisma.contribution.create({
      data: {
        campaignId: campaign.id,
        contributorName,
        contributorEmail,
        amount: amountKobo,
        paystackRef: reference,
        status: "PENDING",
      },
    });

    // Initialize Paystack transaction
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const paystackResponse = await initializeTransaction({
      email: contributorEmail,
      amount: amountKobo,
      reference,
      callback_url: `${appUrl}/pay/${campaignSlug}/callback`,
      metadata: {
        campaignId: campaign.id,
        campaignSlug: campaign.slug,
        contributorName,
        custom_fields: [
          {
            display_name: "Campaign",
            variable_name: "campaign",
            value: campaign.title,
          },
          {
            display_name: "Contributor",
            variable_name: "contributor",
            value: contributorName,
          },
        ],
      },
    });

    return NextResponse.json({
      authorization_url: paystackResponse.data.authorization_url,
      access_code: paystackResponse.data.access_code,
      reference: paystackResponse.data.reference,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
