import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

// GET /api/campaigns/[id] - get campaign detail (public by slug, or by id for organizer)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Try as slug first (public access)
  let campaign = await prisma.campaign.findUnique({
    where: { slug: id },
    include: {
      contributions: {
        where: { status: "SUCCESS" },
        select: {
          id: true,
          contributorName: true,
          amount: true,
          paidAt: true,
        },
        orderBy: { paidAt: "desc" },
      },
    },
  });

  // If not found by slug, try by ID (organizer access)
  if (!campaign) {
    campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        contributions: {
          where: { status: "SUCCESS" },
          select: {
            id: true,
            contributorName: true,
            amount: true,
            paidAt: true,
          },
          orderBy: { paidAt: "desc" },
        },
      },
    });
  }

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  // Hide contributors if toggle is off (unless organizer is requesting)
  const auth = getAuthFromRequest(req);
  const isOrganizer = auth?.organizerId === campaign.organizerId;

  const response = {
    ...campaign,
    contributions:
      campaign.showContributors || isOrganizer ? campaign.contributions : [],
    isOrganizer,
  };

  return NextResponse.json({ campaign: response });
}

// PATCH /api/campaigns/[id] - update campaign (organizer only)
export async function PATCH(
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

  const body = await req.json();
  const { title, description, isActive, showContributors, deadline } = body;

  const updated = await prisma.campaign.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive }),
      ...(showContributors !== undefined && { showContributors }),
      ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
    },
  });

  return NextResponse.json({ campaign: updated });
}
