import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@nefotech.ng";

export function getAdminFromRequest(
  req: NextRequest
): { organizerId: string; email: string } | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const payload = verifyToken(authHeader.slice(7));
  if (!payload) return null;
  if (payload.email !== ADMIN_EMAIL) return null;

  return { organizerId: payload.organizerId, email: payload.email };
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Admin access required" }, { status: 403 });
}
