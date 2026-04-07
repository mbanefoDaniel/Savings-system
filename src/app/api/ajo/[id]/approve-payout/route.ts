import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { approvePayout } from "@/lib/ajo";

// POST /api/ajo/[id]/approve-payout — creator approves and triggers payout
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { payoutId } = body;

  if (!payoutId) {
    return NextResponse.json({ error: "payoutId is required" }, { status: 400 });
  }

  // Verify the caller is the group creator
  const group = await prisma.ajoGroup.findUnique({ where: { id } });
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }
  if (group.creatorId !== auth.organizerId) {
    return NextResponse.json({ error: "Only the group creator can approve payouts" }, { status: 403 });
  }

  // Verify the payout belongs to this group
  const payout = await prisma.payoutSchedule.findUnique({ where: { id: payoutId } });
  if (!payout || payout.groupId !== id) {
    return NextResponse.json({ error: "Payout not found in this group" }, { status: 404 });
  }

  try {
    const result = await approvePayout(payoutId);
    return NextResponse.json({ message: "Payout approved and transfer initiated", ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to process payout";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
