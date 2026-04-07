import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin-auth";

// GET /api/admin/stats — dashboard overview stats
export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return unauthorizedResponse();

  const [
    userCount,
    campaignCount,
    ajoGroupCount,
    campaignContributions,
    ajoContributions,
  ] = await Promise.all([
    prisma.organizer.count(),
    prisma.campaign.count(),
    prisma.ajoGroup.count(),
    prisma.contribution.aggregate({
      _sum: { amount: true },
      _count: true,
      where: { status: "SUCCESS" },
    }),
    prisma.ajoContribution.aggregate({
      _sum: { amount: true },
      _count: true,
      where: { status: "SUCCESS" },
    }),
  ]);

  return NextResponse.json({
    users: userCount,
    campaigns: campaignCount,
    ajoGroups: ajoGroupCount,
    totalCampaignVolume: campaignContributions._sum.amount || 0,
    totalCampaignTx: campaignContributions._count,
    totalAjoVolume: ajoContributions._sum.amount || 0,
    totalAjoTx: ajoContributions._count,
  });
}
