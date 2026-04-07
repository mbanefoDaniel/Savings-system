import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { generateSlug, nairaToKobo } from "@/lib/utils";

// GET /api/campaigns - list organizer's campaigns
export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaigns = await prisma.campaign.findMany({
    where: { organizerId: auth.organizerId },
    include: { _count: { select: { contributions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ campaigns });
}

// POST /api/campaigns - create a new campaign
export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, targetAmount, fixedAmount, deadline, showContributors } = body;

    if (!title || !targetAmount) {
      return NextResponse.json(
        { error: "Title and target amount are required" },
        { status: 400 }
      );
    }

    if (targetAmount <= 0) {
      return NextResponse.json(
        { error: "Target amount must be positive" },
        { status: 400 }
      );
    }

    const slug = generateSlug();

    const campaign = await prisma.campaign.create({
      data: {
        slug,
        title,
        description: description || null,
        targetAmount: nairaToKobo(targetAmount),
        fixedAmount: fixedAmount ? nairaToKobo(fixedAmount) : null,
        deadline: deadline ? new Date(deadline) : null,
        showContributors: showContributors ?? true,
        organizerId: auth.organizerId,
      },
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
