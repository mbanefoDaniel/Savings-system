import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin-auth";
import { tryCompleteCycle } from "@/lib/ajo";

// POST /api/admin/ajo/[id]/payout — manually trigger payout for the current open cycle
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = getAdminFromRequest(req);
  if (!admin) return unauthorizedResponse();

  const { id } = await params;

  const group = await prisma.ajoGroup.findUnique({
    where: { id },
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  if (group.status !== "ACTIVE") {
    return NextResponse.json({ error: "Group is not active" }, { status: 400 });
  }

  // Find the latest open or closed cycle
  const cycle = await prisma.contributionCycle.findFirst({
    where: { groupId: id, status: { in: ["OPEN", "CLOSED"] } },
    orderBy: { cycleNumber: "desc" },
    include: {
      contributions: { where: { status: "SUCCESS" } },
      group: { include: { members: { where: { status: "ACTIVE" } } } },
      payout: true,
    },
  });

  if (!cycle) {
    return NextResponse.json({ error: "No open or closed cycle found" }, { status: 400 });
  }

  const activeCount = cycle.group.members.length;
  const paidCount = cycle.contributions.length;

  // Try auto-complete first
  try {
    const result = await tryCompleteCycle(cycle.id);
    if (result) {
      return NextResponse.json({
        message: "Payout triggered — all contributions received",
        cycleNumber: cycle.cycleNumber,
        paidCount,
        activeCount,
      });
    }
  } catch (err) {
    console.error("tryCompleteCycle error:", err);
  }

  // If not all paid, allow admin to force-complete
  const body = await req.json().catch(() => ({}));
  if (body.force === true) {
    const [updatedCycle] = await prisma.$transaction([
      prisma.contributionCycle.update({
        where: { id: cycle.id },
        data: { status: "PAID_OUT" },
      }),
      ...(cycle.payout
        ? [
            prisma.payoutSchedule.update({
              where: { id: cycle.payout.id },
              data: { status: "COMPLETED", paidAt: new Date() },
            }),
          ]
        : []),
    ]);

    return NextResponse.json({
      message: "Payout force-triggered by admin",
      cycleNumber: updatedCycle.cycleNumber,
      paidCount,
      activeCount,
      warning: paidCount < activeCount ? `Only ${paidCount}/${activeCount} members contributed` : undefined,
    });
  }

  return NextResponse.json({
    message: "Not all members have contributed yet",
    cycleNumber: cycle.cycleNumber,
    paidCount,
    activeCount,
    hint: 'Send { "force": true } to force the payout',
  }, { status: 400 });
}
