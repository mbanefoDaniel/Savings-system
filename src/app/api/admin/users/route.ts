import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin-auth";

// GET /api/admin/users — list all users
export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return unauthorizedResponse();

  const users = await prisma.organizer.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      _count: { select: { campaigns: true, ajoGroups: true, memberships: true } },
    },
  });

  return NextResponse.json({ users });
}
