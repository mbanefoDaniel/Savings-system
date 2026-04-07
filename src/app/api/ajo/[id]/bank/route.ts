import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import {
  resolveAccount,
  createTransferRecipient,
} from "@/lib/paystack";

// GET /api/ajo/[id]/bank — get current member's bank details for this group
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: auth.organizerId } },
    select: {
      bankCode: true,
      accountNumber: true,
      accountName: true,
      recipientCode: true,
    },
  });

  if (!member) {
    return NextResponse.json({ error: "Not a member of this group" }, { status: 404 });
  }

  return NextResponse.json({ bank: member });
}

// POST /api/ajo/[id]/bank — resolve & save bank details
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { bankCode, accountNumber } = body;

  if (!bankCode || !accountNumber) {
    return NextResponse.json(
      { error: "bankCode and accountNumber are required" },
      { status: 400 }
    );
  }

  if (!/^\d{10}$/.test(accountNumber)) {
    return NextResponse.json(
      { error: "Account number must be 10 digits" },
      { status: 400 }
    );
  }

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: auth.organizerId } },
    include: { user: { select: { name: true } } },
  });

  if (!member) {
    return NextResponse.json({ error: "Not a member of this group" }, { status: 404 });
  }

  try {
    // 1. Resolve account with Paystack
    const resolved = await resolveAccount(accountNumber, bankCode);
    const accountName = resolved.data.account_name;

    // 2. Create a transfer recipient
    const recipient = await createTransferRecipient({
      name: accountName,
      account_number: accountNumber,
      bank_code: bankCode,
    });

    // 3. Save to database
    const updated = await prisma.groupMember.update({
      where: { id: member.id },
      data: {
        bankCode,
        accountNumber,
        accountName,
        recipientCode: recipient.data.recipient_code,
      },
      select: {
        bankCode: true,
        accountNumber: true,
        accountName: true,
        recipientCode: true,
      },
    });

    return NextResponse.json({ bank: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to resolve account";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
