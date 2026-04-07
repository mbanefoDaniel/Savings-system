import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

// GET /api/subscription/status — check if user has an active subscription
export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      organizerId: auth.organizerId,
      status: "ACTIVE",
      endDate: { gt: now },
    },
    orderBy: { endDate: "desc" },
  });

  if (activeSubscription) {
    return NextResponse.json({
      active: true,
      endDate: activeSubscription.endDate,
    });
  }

  return NextResponse.json({ active: false });
}
