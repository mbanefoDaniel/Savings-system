import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    channel: string;
    paid_at: string;
    customer: {
      email: string;
      first_name: string | null;
      last_name: string | null;
    };
    metadata: Record<string, unknown>;
  };
}

export async function initializeTransaction(params: {
  email: string;
  amount: number; // in kobo
  reference: string;
  callback_url: string;
  metadata: Record<string, unknown>;
}): Promise<PaystackInitResponse> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Paystack initialization failed: ${error}`);
  }

  return res.json();
}

export async function verifyTransaction(
  reference: string
): Promise<PaystackVerifyResponse> {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Paystack verification failed: ${error}`);
  }

  return res.json();
}

export function validateWebhookSignature(
  body: string,
  signature: string
): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");
  return hash === signature;
}

// ─── Bank / Transfer APIs ──────────────────────────────────

interface PaystackBank {
  id: number;
  name: string;
  slug: string;
  code: string;
  active: boolean;
  country: string;
  currency: string;
  type: string;
}

interface ResolveAccountResponse {
  status: boolean;
  message: string;
  data: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
}

interface TransferRecipientResponse {
  status: boolean;
  message: string;
  data: {
    active: boolean;
    currency: string;
    name: string;
    recipient_code: string;
    type: string;
  };
}

interface InitiateTransferResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    integration: number;
    domain: string;
    amount: number;
    currency: string;
    source: string;
    reason: string;
    status: string;
    transfer_code: string;
    id: number;
  };
}

/** Fetch list of Nigerian banks from Paystack. */
export async function listBanks(): Promise<PaystackBank[]> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/bank?country=nigeria&perPage=100`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
  });
  if (!res.ok) throw new Error("Failed to fetch banks");
  const data = await res.json();
  return data.data;
}

/** Resolve an account number to get the account name. */
export async function resolveAccount(
  accountNumber: string,
  bankCode: string
): Promise<ResolveAccountResponse> {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
    { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Account resolution failed: ${error}`);
  }
  return res.json();
}

/** Create a transfer recipient (required before initiating a transfer). */
export async function createTransferRecipient(params: {
  name: string;
  account_number: string;
  bank_code: string;
}): Promise<TransferRecipientResponse> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transferrecipient`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "nuban",
      ...params,
      currency: "NGN",
    }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create transfer recipient: ${error}`);
  }
  return res.json();
}

/** Initiate a transfer to a recipient. */
export async function initiateTransfer(params: {
  amount: number; // in kobo
  recipient: string; // recipient_code
  reason: string;
  reference: string;
}): Promise<InitiateTransferResponse> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transfer`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: "balance",
      ...params,
    }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Transfer initiation failed: ${error}`);
  }
  return res.json();
}
