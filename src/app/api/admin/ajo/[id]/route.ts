import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin-auth";

// GET /api/admin/ajo/[id] — full group detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = getAdminFromRequest(req);
  if (!admin) return unauthorizedResponse();

  const { id } = await params;

  const group = await prisma.ajoGroup.findUnique({
    where: { id },
    include: {
      creator: { select: { name: true, email: true } },
      members: {
        orderBy: { position: "asc" },
        include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      },
      cycles: {
        orderBy: { cycleNumber: "desc" },
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
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  return NextResponse.json({ group });
}
