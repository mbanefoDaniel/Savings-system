import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest, unauthorizedResponse } from "@/lib/admin-auth";

// GET /api/admin/verify — check if the token belongs to an admin
export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return unauthorizedResponse();
  return NextResponse.json({ admin: true, email: admin.email });
}
