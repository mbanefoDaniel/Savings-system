/**
 * WhatsApp integration via WhatsApp Business Cloud API.
 *
 * Prerequisites:
 * 1. Create a Meta Business account and WhatsApp Business app
 * 2. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env
 * 3. Create message templates in Meta Business Manager:
 *    - "ajo_contribution_reminder" with parameters: {{1}} group name, {{2}} amount, {{3}} due date
 *    - "ajo_payout_completed" with parameters: {{1}} group name, {{2}} amount, {{3}} recipient name
 *
 * If env vars are not set, messages are logged to console (dev mode).
 */

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_URL = "https://graph.facebook.com/v19.0";

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

async function sendTemplate(
  to: string,
  templateName: string,
  parameters: string[]
): Promise<SendResult> {
  // If credentials are missing, log and return (dev mode)
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
    console.log(
      `[WhatsApp-Dev] Template "${templateName}" to ${to}:`,
      parameters
    );
    return { success: true, messageId: "dev-mode" };
  }

  try {
    const res = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: templateName,
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: parameters.map((p) => ({
                  type: "text",
                  text: p,
                })),
              },
            ],
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error(`[WhatsApp] Failed to send to ${to}:`, err);
      return { success: false, error: err };
    }

    const data = await res.json();
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[WhatsApp] Error sending to ${to}:`, message);
    return { success: false, error: message };
  }
}

/**
 * Send contribution reminder to a member.
 */
export async function sendContributionReminder(params: {
  phone: string;
  groupName: string;
  amount: string; // formatted amount like "₦5,000"
  dueDate: string; // formatted date
}): Promise<SendResult> {
  return sendTemplate(params.phone, "ajo_contribution_reminder", [
    params.groupName,
    params.amount,
    params.dueDate,
  ]);
}

/**
 * Notify a member that their payout is completed.
 */
export async function sendPayoutNotification(params: {
  phone: string;
  groupName: string;
  amount: string;
  recipientName: string;
}): Promise<SendResult> {
  return sendTemplate(params.phone, "ajo_payout_completed", [
    params.groupName,
    params.amount,
    params.recipientName,
  ]);
}

/**
 * Send a freeform text message (for admin notices, etc.).
 * Note: This requires an active 24-hour messaging window.
 */
export async function sendTextMessage(
  to: string,
  text: string
): Promise<SendResult> {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
    console.log(`[WhatsApp-Dev] Text to ${to}:`, text);
    return { success: true, messageId: "dev-mode" };
  }

  try {
    const res = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: text },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: err };
    }

    const data = await res.json();
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
