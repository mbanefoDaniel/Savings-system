import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { initializeTransaction } from "@/lib/paystack";
import { generateReference } from "@/lib/utils";

// POST /api/ajo/[id]/contribute — initialize a contribution payment for the current cycle
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const group = await prisma.ajoGroup.findUnique({ where: { id } });
  if (!group || group.status !== "ACTIVE") {
    return NextResponse.json({ error: "Group not found or not active" }, { status: 404 });
  }

  // Find the member record
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: auth.organizerId } },
    include: { user: true },
  });
  if (!member || member.status !== "ACTIVE") {
    return NextResponse.json({ error: "You are not an active member" }, { status: 403 });
  }

  // Get current open cycle
  const cycle = await prisma.contributionCycle.findFirst({
    where: { groupId: id, status: "OPEN" },
    orderBy: { cycleNumber: "desc" },
  });
  if (!cycle) {
    return NextResponse.json({ error: "No open cycle" }, { status: 400 });
  }

  // Check if already contributed this cycle
  const existingContrib = await prisma.ajoContribution.findUnique({
    where: { cycleId_memberId: { cycleId: cycle.id, memberId: member.id } },
  });
  if (existingContrib && existingContrib.status === "SUCCESS") {
    return NextResponse.json({ error: "You have already contributed this cycle" }, { status: 409 });
  }

  const reference = generateReference();
  const amount = group.contributionAmount;

  // Create or update the contribution record
  if (existingContrib) {
    // Replace the failed/pending one
    await prisma.ajoContribution.update({
      where: { id: existingContrib.id },
      data: { paystackRef: reference, status: "PENDING" },
    });
  } else {
    await prisma.ajoContribution.create({
      data: {
        cycleId: cycle.id,
        memberId: member.id,
        amount,
        paystackRef: reference,
        status: "PENDING",
      },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const paystackResponse = await initializeTransaction({
    email: member.user.email,
    amount,
    reference,
    callback_url: `${appUrl}/ajo/${group.slug}/callback`,
    metadata: {
      type: "ajo_contribution",
      groupId: group.id,
      cycleId: cycle.id,
      memberId: member.id,
      cycleNumber: cycle.cycleNumber,
      custom_fields: [
        { display_name: "Group", variable_name: "group", value: group.name },
        { display_name: "Cycle", variable_name: "cycle", value: `#${cycle.cycleNumber}` },
      ],
    },
  });

  return NextResponse.json({
    authorization_url: paystackResponse.data.authorization_url,
    reference: paystackResponse.data.reference,
  });
}

// GET /api/ajo/[id]/contribute — get contribution status for current cycle
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const group = await prisma.ajoGroup.findUnique({ where: { id } });
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  const cycle = await prisma.contributionCycle.findFirst({
    where: { groupId: id, status: "OPEN" },
    orderBy: { cycleNumber: "desc" },
    include: {
      contributions: {
        include: {
          member: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
      },
    },
  });

  if (!cycle) {
    return NextResponse.json({ cycle: null, message: "No open cycle" });
  }

  return NextResponse.json({ cycle });
}
