import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

// GET /api/ajo/[id]/schedule — get payout schedule for the group
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const group = await prisma.ajoGroup.findUnique({
    where: { id },
    include: { members: { where: { status: "ACTIVE" }, orderBy: { position: "asc" } } },
  });
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  // Check membership
  const isMember = group.members.some((m) => m.userId === auth.organizerId);
  if (!isMember && group.creatorId !== auth.organizerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payouts = await prisma.payoutSchedule.findMany({
    where: { groupId: id },
    orderBy: { cycle: { cycleNumber: "asc" } },
    include: {
      member: { include: { user: { select: { id: true, name: true, email: true } } } },
      cycle: { select: { cycleNumber: true, dueDate: true, status: true } },
    },
  });

  return NextResponse.json({ payouts });
}
