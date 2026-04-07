import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { generateSlug, nairaToKobo } from "@/lib/utils";

// GET /api/ajo — list the logged-in user's groups (created + joined)
export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [created, joined] = await Promise.all([
    prisma.ajoGroup.findMany({
      where: { creatorId: auth.organizerId },
      include: {
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.groupMember.findMany({
      where: { userId: auth.organizerId },
      include: {
        group: {
          include: { _count: { select: { members: true } } },
        },
      },
      orderBy: { joinedAt: "desc" },
    }),
  ]);

  // Merge, de-duplicate (creator could also be a member)
  const createdIds = new Set(created.map((g) => g.id));
  const joinedGroups = joined
    .filter((m) => !createdIds.has(m.groupId))
    .map((m) => m.group);

  return NextResponse.json({
    created,
    joined: joinedGroups,
  });
}

// POST /api/ajo — create a new Ajo group
export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check for active subscription
  const now = new Date();
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      organizerId: auth.organizerId,
      status: "ACTIVE",
      endDate: { gt: now },
    },
  });

  if (!activeSubscription) {
    return NextResponse.json(
      { error: "Active subscription required to create a group. Please subscribe (₦5,000/month)." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { name, description, contributionAmount, frequency, maxMembers, startDate } = body;

    if (!name || !contributionAmount || !frequency || !maxMembers || !startDate) {
      return NextResponse.json(
        { error: "name, contributionAmount, frequency, maxMembers, and startDate are required" },
        { status: 400 }
      );
    }

    if (!["DAILY", "WEEKLY"].includes(frequency)) {
      return NextResponse.json({ error: "frequency must be DAILY or WEEKLY" }, { status: 400 });
    }

    if (maxMembers < 2 || maxMembers > 50) {
      return NextResponse.json({ error: "maxMembers must be between 2 and 50" }, { status: 400 });
    }

    if (contributionAmount <= 0) {
      return NextResponse.json({ error: "Contribution amount must be positive" }, { status: 400 });
    }

    const slug = generateSlug();
    const amountKobo = nairaToKobo(contributionAmount);

    const group = await prisma.ajoGroup.create({
      data: {
        slug,
        name,
        description: description || null,
        contributionAmount: amountKobo,
        frequency,
        maxMembers,
        startDate: new Date(startDate),
        creatorId: auth.organizerId,
      },
    });

    // Auto-add creator as member at position 1
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: auth.organizerId,
        position: 1,
      },
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error("Create ajo group error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
