import { getLogger } from "@/lib/logger";

const log = getLogger("sms");

export type SendSmsOptions = {
  to: string;
  text: string;
  templateId?: number;
  parameters?: Array<{ name: string; value: string }>;
};

/**
 * Normalizes an Iranian mobile phone number to 09xxxxxxxxx format
 */
export function normalizeIranianMobile(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("98") && digits.length === 12) {
    return "0" + digits.slice(2);
  }
  if (digits.startsWith("9") && digits.length === 10) {
    return "0" + digits;
  }
  return digits;
}

/**
 * Sends SMS via SMS.ir REST API v1
 * Supports both bulk line delivery and fast template (verify) delivery
 */
async function sendViaSmsIr({
  to,
  text,
  templateId,
  parameters,
}: SendSmsOptions): Promise<{ success: boolean; data?: any; error?: string }> {
  const apiKey = process.env.SMS_API_KEY || "";
  const lineNumber = process.env.SMS_LINE_NUMBER
    ? Number(process.env.SMS_LINE_NUMBER)
    : 30002108020242;

  const normalizedTo = normalizeIranianMobile(to);

  // If a templateId is specified (or configured via environment for verification), use the fast template endpoint
  const activeTemplateId = templateId || (process.env.SMS_IR_VERIFY_TEMPLATE_ID ? Number(process.env.SMS_IR_VERIFY_TEMPLATE_ID) : undefined);

  if (activeTemplateId && parameters && parameters.length > 0) {
    log.info({ to: normalizedTo, templateId: activeTemplateId }, "Sending verify SMS via SMS.ir template");
    const response = await fetch("https://api.sms.ir/v1/send/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/plain",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify({
        mobile: normalizedTo,
        templateId: activeTemplateId,
        parameters,
      }),
    });

    const resJson = await response.json();
    if (!response.ok || (resJson.status !== 1 && resJson.status !== 200)) {
      log.error({ resJson, status: response.status }, "SMS.ir template verify send error");
      return { success: false, error: resJson.message || "خطا در ارسال پیامک الگو SMS.ir" };
    }

    log.info({ resJson }, "SMS.ir template SMS sent successfully");
    return { success: true, data: resJson.data };
  }

  // Standard line-based delivery (https://api.sms.ir/v1/send/bulk)
  log.info({ to: normalizedTo, lineNumber }, "Sending SMS via SMS.ir bulk endpoint");
  const response = await fetch("https://api.sms.ir/v1/send/bulk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/plain",
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify({
      lineNumber,
      messageText: text,
      mobiles: [normalizedTo],
      sendDateTime: null,
    }),
  });

  const resJson = await response.json();
  if (!response.ok || (resJson.status !== 1 && resJson.status !== 200)) {
    log.error({ resJson, status: response.status }, "SMS.ir bulk send error");
    return { success: false, error: resJson.message || "خطا در ارسال پیامک با خط SMS.ir" };
  }

  log.info({ resJson }, "SMS.ir message sent successfully");
  return { success: true, data: resJson.data };
}

/**
 * Universal SMS Dispatcher
 */
export async function sendSms({
  to,
  text,
  templateId,
  parameters,
}: SendSmsOptions): Promise<{ success: boolean; mocked?: boolean; error?: any }> {
  const { SMS_PROVIDER, SMS_API_KEY } = process.env;

  // If SMS provider or API key is not configured, mock sending
  if (!SMS_PROVIDER || !SMS_API_KEY) {
    console.log("\n==================================================");
    console.log("📱 [MOCK SMS] - SMS Provider not configured.");
    console.log(`To: ${to}`);
    console.log(`Message: ${text}`);
    console.log("==================================================\n");
    return { success: true, mocked: true };
  }

  try {
    const provider = SMS_PROVIDER.toLowerCase().trim();

    if (provider === "sms.ir" || provider === "smsir") {
      const result = await sendViaSmsIr({ to, text, templateId, parameters });
      return result;
    }

    console.log(`[SMS] Sending to ${to} via generic provider ${SMS_PROVIDER}...`);
    return { success: true };
  } catch (error) {
    log.error({ err: error, to }, "Exception while sending SMS");
    return { success: false, error };
  }
}
