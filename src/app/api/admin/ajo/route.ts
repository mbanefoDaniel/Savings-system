import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin-auth";

// GET /api/admin/ajo — list all ajo groups
export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return unauthorizedResponse();

  const groups = await prisma.ajoGroup.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      creator: { select: { name: true, email: true } },
      _count: { select: { members: true, cycles: true } },
    },
  });

  return NextResponse.json({ groups });
}
