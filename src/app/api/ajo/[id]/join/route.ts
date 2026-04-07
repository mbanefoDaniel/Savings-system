import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

// POST /api/ajo/[id]/join — join a group by its slug or id
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find group by slug or id
  let group = await prisma.ajoGroup.findUnique({
    where: { slug: id },
    include: { members: { orderBy: { position: "desc" }, take: 1 } },
  });
  if (!group) {
    group = await prisma.ajoGroup.findUnique({
      where: { id },
      include: { members: { orderBy: { position: "desc" }, take: 1 } },
    });
  }
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  if (group.status !== "PENDING") {
    return NextResponse.json(
      { error: "This group is no longer accepting new members" },
      { status: 400 }
    );
  }

  // Check if already a member
  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId: auth.organizerId } },
  });
  if (existing) {
    return NextResponse.json({ error: "You are already a member" }, { status: 409 });
  }

  // Check capacity
  const memberCount = await prisma.groupMember.count({ where: { groupId: group.id } });
  if (memberCount >= group.maxMembers) {
    return NextResponse.json({ error: "Group is full" }, { status: 400 });
  }

  // Assign next position
  const lastPosition = group.members[0]?.position ?? 0;
  const newPosition = lastPosition + 1;

  const member = await prisma.groupMember.create({
    data: {
      groupId: group.id,
      userId: auth.organizerId,
      position: newPosition,
    },
  });

  return NextResponse.json({ member, position: newPosition }, { status: 201 });
}
