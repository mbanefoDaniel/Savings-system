import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin-auth";

// GET /api/admin/campaigns/[id] — campaign detail with contributions
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = getAdminFromRequest(req);
  if (!admin) return unauthorizedResponse();

  const { id } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      organizer: { select: { name: true, email: true } },
      contributions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  return NextResponse.json({ campaign });
}
