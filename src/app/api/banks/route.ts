import { NextResponse } from "next/server";
import { listBanks } from "@/lib/paystack";

// GET /api/banks — list Nigerian banks (cached for 1 hour)
export async function GET() {
  try {
    const banks = await listBanks();
    const filtered = banks
      .filter((b) => b.active)
      .map((b) => ({ name: b.name, code: b.code }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(
      { banks: filtered },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" } }
    );
  } catch {
    return NextResponse.json({ error: "Failed to load banks" }, { status: 500 });
  }
}
