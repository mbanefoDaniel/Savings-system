import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { openNextCycle } from "@/lib/ajo";

// GET /api/ajo/[id] — get full group details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Try by slug first, then by id
  let group = await prisma.ajoGroup.findUnique({
    where: { slug: id },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      members: {
        orderBy: { position: "asc" },
        select: { id: true, position: true, status: true, userId: true, bankCode: true, accountNumber: true, accountName: true, user: { select: { id: true, name: true, email: true } } },
      },
      cycles: {
        orderBy: { cycleNumber: "desc" },
        take: 5,
        include: {
          contributions: {
            include: { member: { include: { user: { select: { name: true } } } } },
          },
          payout: {
            include: { member: { include: { user: { select: { name: true } } } } },
          },
        },
      },
      payoutSchedule: {
        orderBy: { cycle: { cycleNumber: "asc" } },
        include: {
          member: { include: { user: { select: { name: true } } } },
          cycle: { select: { cycleNumber: true, dueDate: true } },
        },
      },
    },
  });

  if (!group) {
    group = await prisma.ajoGroup.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: {
          orderBy: { position: "asc" },
          select: { id: true, position: true, status: true, userId: true, bankCode: true, accountNumber: true, accountName: true, user: { select: { id: true, name: true, email: true } } },
        },
        cycles: {
          orderBy: { cycleNumber: "desc" },
          take: 5,
          include: {
            contributions: {
              include: { member: { include: { user: { select: { name: true } } } } },
            },
            payout: {
              include: { member: { include: { user: { select: { name: true } } } } },
            },
          },
        },
        payoutSchedule: {
          orderBy: { cycle: { cycleNumber: "asc" } },
          include: {
            member: { include: { user: { select: { name: true } } } },
            cycle: { select: { cycleNumber: true, dueDate: true } },
          },
        },
      },
    });
  }

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  // Only members / creator can view
  const isMember = group.members.some((m) => m.userId === auth.organizerId);
  const isCreator = group.creatorId === auth.organizerId;
  if (!isMember && !isCreator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ group, isCreator });
}

// PATCH /api/ajo/[id] — group admin actions (start, cancel)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const group = await prisma.ajoGroup.findUnique({ where: { id } });
  if (!group || group.creatorId !== auth.organizerId) {
    return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "start") {
      if (group.status !== "PENDING") {
        return NextResponse.json({ error: "Group is not in PENDING status" }, { status: 400 });
      }

      const memberCount = await prisma.groupMember.count({
        where: { groupId: id, status: "ACTIVE" },
      });

      if (memberCount < 2) {
        return NextResponse.json({ error: "Need at least 2 members to start" }, { status: 400 });
      }

      await prisma.ajoGroup.update({
        where: { id },
        data: { status: "ACTIVE" },
      });

      // Open the first cycle
      const cycle = await openNextCycle(id);

      return NextResponse.json({ message: "Group started", cycle });
    }

    if (action === "cancel") {
      await prisma.ajoGroup.update({
        where: { id },
        data: { status: "CANCELLED" },
      });
      return NextResponse.json({ message: "Group cancelled" });
    }

    if (action === "next_cycle") {
      if (group.status !== "ACTIVE") {
        return NextResponse.json({ error: "Group is not active" }, { status: 400 });
      }
      const cycle = await openNextCycle(id);
      return NextResponse.json({ message: "New cycle opened", cycle });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Ajo group action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
