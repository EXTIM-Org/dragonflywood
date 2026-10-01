import { getLogger } from "@/lib/logger";

const log = getLogger("zarinpal");

const isSandbox = process.env.ZARINPAL_SANDBOX === "true";
const BASE_URL = isSandbox
  ? "https://sandbox.zarinpal.com/pg"
  : "https://payment.zarinpal.com/pg";

const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID || "";

/**
 * Maps Zarinpal error code to Persian descriptive message
 */
export function getZarinpalErrorMessage(code: number): string {
  switch (code) {
    case -9:
      return "اطلاعات ارسالی به درگاه پرداخت نامعتبر است.";
    case -10:
      return "مرچنت‌کد یا آی‌پی سرور درگاه نامعتبر است.";
    case -11:
      return "درگاه پرداخت فعال نیست یا تایید نشده است.";
    case -12:
      return "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی بعد تلاش کنید.";
    case -15:
      return "درگاه پرداخت به حالت تعلیق درآمده است.";
    case -16:
      return "سطح تایید پذیرنده کافی نیست.";
    case -34:
      return "مبلغ تراکنش بیش از سقف مجاز درگاه است.";
    case -50:
      return "مبلغ پرداخت شده با مبلغ فاکتور همخوانی ندارد.";
    case -51:
      return "پرداخت ناموفق بود یا توسط کاربر لغو گردید.";
    case -52:
      return "خطای غیرمنتظره رخ داده است. در صورت کسر وجه ظرف ۷۲ ساعت عودت داده می‌شود.";
    case -53:
      return "کد پیگیری تراکنش نامعتبر است.";
    case -54:
      return "درخواست پرداخت منقضی شده یا نامعتبر است.";
    default:
      return `خطا در پردازش درگاه پرداخت (کد: ${code})`;
  }
}

export interface ZarinpalRequestParams {
  amount: number; // in Tomans
  description: string;
  callbackUrl: string;
  mobile?: string;
  email?: string;
}

export interface ZarinpalRequestResult {
  success: boolean;
  authority?: string;
  paymentUrl?: string;
  error?: string;
  code?: number;
}

export interface ZarinpalVerifyParams {
  authority: string;
  amount: number; // in Tomans
}

export interface ZarinpalVerifyResult {
  success: boolean;
  refId?: string;
  cardPan?: string;
  code?: number;
  error?: string;
}

/**
 * Initiates a payment request with Zarinpal REST API v4
 */
export async function requestZarinpalPayment(
  params: ZarinpalRequestParams
): Promise<ZarinpalRequestResult> {
  if (!MERCHANT_ID) {
    log.error("ZARINPAL_MERCHANT_ID is missing in environment variables");
    return {
      success: false,
      error: "کد پذیرنده درگاه پرداخت زرین‌پال (ZARINPAL_MERCHANT_ID) در تنظیمات سرور (.env) تعریف نشده است.",
    };
  }

  try {
    const endpoint = `${BASE_URL}/v4/payment/request.json`;

    const payload = {
      merchant_id: MERCHANT_ID,
      amount: Math.round(params.amount),
      currency: "IRT", // Iranian Toman
      description: params.description,
      callback_url: params.callbackUrl,
      metadata: {
        ...(params.mobile ? { mobile: params.mobile } : {}),
        ...(params.email ? { email: params.email } : {}),
      },
    };

    log.info({ endpoint, amount: params.amount }, "Sending payment request to Zarinpal");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      log.error({ status: response.status }, "Zarinpal HTTP error on payment request");
      return {
        success: false,
        error: "ارتباط با درگاه پرداخت زرین‌پال برقرار نشد.",
      };
    }

    const resJson = await response.json();

    if (resJson?.data?.code === 100 && resJson?.data?.authority) {
      const authority = resJson.data.authority as string;
      const paymentUrl = `${BASE_URL}/StartPay/${authority}`;
      log.info({ authority }, "Zarinpal payment request successful");

      return {
        success: true,
        authority,
        paymentUrl,
        code: resJson.data.code,
      };
    }

    const errorCode = resJson?.errors?.code || resJson?.data?.code || -1;
    const errorMessage = getZarinpalErrorMessage(errorCode);
    log.warn({ resJson, errorCode }, "Zarinpal rejected payment request");

    return {
      success: false,
      code: errorCode,
      error: errorMessage,
    };
  } catch (error) {
    log.error({ err: error }, "Exception during Zarinpal payment request");
    return {
      success: false,
      error: "خطای سیستمی در اتصال به درگاه پرداخت.",
    };
  }
}

/**
 * Verifies a completed payment with Zarinpal REST API v4
 */
export async function verifyZarinpalPayment(
  params: ZarinpalVerifyParams
): Promise<ZarinpalVerifyResult> {
  if (!MERCHANT_ID) {
    log.error("ZARINPAL_MERCHANT_ID is missing in environment variables");
    return {
      success: false,
      error: "کد پذیرنده درگاه پرداخت زرین‌پال (ZARINPAL_MERCHANT_ID) در تنظیمات سرور (.env) تعریف نشده است.",
    };
  }

  try {
    const endpoint = `${BASE_URL}/v4/payment/verify.json`;

    const payload = {
      merchant_id: MERCHANT_ID,
      amount: Math.round(params.amount),
      authority: params.authority,
    };

    log.info({ endpoint, authority: params.authority, amount: params.amount }, "Verifying payment with Zarinpal");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      log.error({ status: response.status }, "Zarinpal HTTP error on verify request");
      return {
        success: false,
        error: "خطا در تایید تراکنش بانکی با زرین‌پال.",
      };
    }

    const resJson = await response.json();
    const code = resJson?.data?.code;

    // 100: First time successful verification
    // 101: Already verified
    if (code === 100 || code === 101) {
      const refId = String(resJson.data.ref_id);
      const cardPan = resJson.data.card_pan;
      log.info({ refId, code }, "Zarinpal payment verified successfully");

      return {
        success: true,
        refId,
        cardPan,
        code,
      };
    }

    const errorCode = resJson?.errors?.code || code || -51;
    const errorMessage = getZarinpalErrorMessage(errorCode);
    log.warn({ resJson, errorCode }, "Zarinpal verify returned non-success code");

    return {
      success: false,
      code: errorCode,
      error: errorMessage,
    };
  } catch (error) {
    log.error({ err: error }, "Exception during Zarinpal verification");
    return {
      success: false,
      error: "خطای سیستمی در تایید پرداخت.",
    };
  }
}
