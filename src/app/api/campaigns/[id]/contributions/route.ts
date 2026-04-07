import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

// GET /api/campaigns/[id]/contributions - full contributor list for organizer
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign || campaign.organizerId !== auth.organizerId) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const contributions = await prisma.contribution.findMany({
    where: { campaignId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ contributions });
}
