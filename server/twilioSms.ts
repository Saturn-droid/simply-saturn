import { getTwilioEnv } from "./_core/env";

export type SmsProviderConfiguration = {
  configured: boolean;
  deliveryMode: "messaging-service" | "direct-sender" | "unconfigured";
  authenticationMode: "api-key" | "auth-token" | "unconfigured";
  senderLabel: string | null;
};

export type TwilioSmsResult = {
  sid: string;
  status: "queued" | "sent" | "delivered" | "undelivered" | "failed";
  errorCode?: string;
  errorMessage?: string;
};

export class TwilioSmsError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "TwilioSmsError";
  }
}

const supportedStatuses = new Set<TwilioSmsResult["status"]>([
  "queued",
  "sent",
  "delivered",
  "undelivered",
  "failed",
]);

export function getSmsProviderConfiguration(): SmsProviderConfiguration {
  const twilio = getTwilioEnv();
  const hasApiKey = Boolean(twilio.apiKeySid && twilio.apiKeySecret);
  const hasAuthToken = Boolean(twilio.authToken);
  const credentialsPresent = Boolean(twilio.accountSid && (hasApiKey || hasAuthToken));
  const authenticationMode = hasApiKey ? "api-key" : hasAuthToken ? "auth-token" : "unconfigured";

  if (credentialsPresent && twilio.messagingServiceSid) {
    return {
      configured: true,
      deliveryMode: "messaging-service",
      authenticationMode,
      senderLabel: "Messaging Service",
    };
  }

  if (credentialsPresent && twilio.fromNumber) {
    return {
      configured: true,
      deliveryMode: "direct-sender",
      authenticationMode,
      senderLabel: "Approved direct sender",
    };
  }

  return {
    configured: false,
    deliveryMode: "unconfigured",
    authenticationMode: "unconfigured",
    senderLabel: null,
  };
}

export function isE164PhoneNumber(value: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(value);
}

function normalizeTwilioStatus(status: unknown): TwilioSmsResult["status"] {
  const normalized = typeof status === "string" ? status.toLowerCase() : "queued";
  return supportedStatuses.has(normalized as TwilioSmsResult["status"])
    ? (normalized as TwilioSmsResult["status"])
    : "queued";
}

export async function sendTwilioSms(input: { to: string; body: string }): Promise<TwilioSmsResult> {
  const twilio = getTwilioEnv();
  const configuration = getSmsProviderConfiguration();

  if (!configuration.configured) {
    throw new TwilioSmsError(
      "SMS is not configured. Add fresh server-side Twilio credentials and an approved sender before sending.",
    );
  }

  if (!isE164PhoneNumber(input.to)) {
    throw new TwilioSmsError("The recipient number must use E.164 format, for example +15551234567.");
  }

  const payload = new URLSearchParams({
    To: input.to,
    Body: input.body,
  });

  if (configuration.deliveryMode === "messaging-service") {
    payload.set("MessagingServiceSid", twilio.messagingServiceSid);
  } else {
    payload.set("From", twilio.fromNumber);
  }

  const username = configuration.authenticationMode === "api-key" ? twilio.apiKeySid : twilio.accountSid;
  const password = configuration.authenticationMode === "api-key" ? twilio.apiKeySecret : twilio.authToken;
  const authorization = Buffer.from(`${username}:${password}`).toString("base64");

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${authorization}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload.toString(),
    },
  );

  const data = (await response.json().catch(() => ({}))) as {
    sid?: string;
    status?: string;
    code?: number | string;
    message?: string;
  };

  if (!response.ok || !data.sid) {
    throw new TwilioSmsError(
      data.message || "Twilio could not accept the SMS request.",
      data.code ? String(data.code) : undefined,
      response.status,
    );
  }

  return {
    sid: data.sid,
    status: normalizeTwilioStatus(data.status),
    errorCode: data.code ? String(data.code) : undefined,
    errorMessage: data.message,
  };
}
