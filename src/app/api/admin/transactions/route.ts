import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin-auth";

// GET /api/admin/transactions — all transactions (campaign + ajo)
export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return unauthorizedResponse();

  const [campaignTx, ajoTx] = await Promise.all([
    prisma.contribution.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        campaign: { select: { title: true, slug: true } },
      },
    }),
    prisma.ajoContribution.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        cycle: {
          select: {
            cycleNumber: true,
            group: { select: { name: true, slug: true } },
          },
        },
        member: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    }),
  ]);

  const transactions = [
    ...campaignTx.map((tx) => ({
      id: tx.id,
      type: "campaign" as const,
      user: tx.contributorName,
      email: tx.contributorEmail,
      amount: tx.amount,
      status: tx.status,
      reference: tx.paystackRef,
      label: tx.campaign.title,
      date: tx.createdAt,
    })),
    ...ajoTx.map((tx) => ({
      id: tx.id,
      type: "ajo" as const,
      user: tx.member.user.name,
      email: tx.member.user.email,
      amount: tx.amount,
      status: tx.status,
      reference: tx.paystackRef,
      label: `${tx.cycle.group.name} · Cycle ${tx.cycle.cycleNumber}`,
      date: tx.createdAt,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json({ transactions });
}
