import { afterEach, describe, expect, it, vi } from "vitest";
import { CUSTOM_SMS_DELIVERY_DEFERRED_REASON, getSmsProviderConfiguration, sendTwilioSms } from "./twilioSms";

const twilioKeys = [
  "TWILIO_ACCOUNT_SID",
  "TWILIO_API_KEY_SID",
  "TWILIO_API_KEY_SECRET",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_MESSAGING_SERVICE_SID",
  "TWILIO_FROM_NUMBER",
] as const;

const originalEnvironment = Object.fromEntries(twilioKeys.map((key) => [key, process.env[key]]));

function restoreEnvironment() {
  for (const key of twilioKeys) {
    const original = originalEnvironment[key];
    if (original === undefined) delete process.env[key];
    else process.env[key] = original;
  }
  vi.unstubAllGlobals();
}

afterEach(restoreEnvironment);

describe("Twilio SMS gateway", () => {
  it("requires secure server credentials before it can send", async () => {
    for (const key of twilioKeys) delete process.env[key];

    expect(getSmsProviderConfiguration()).toMatchObject({ configured: false, deliveryMode: "unconfigured", authenticationMode: "unconfigured" });
    await expect(sendTwilioSms({ to: "+15551234567", body: "Hello" })).rejects.toThrow("SMS is not configured");
  });

  it("reports a direct approved sender as configured but blocks custom delivery while the trial restriction is active", async () => {
    process.env.TWILIO_ACCOUNT_SID = "ACtest";
    process.env.TWILIO_API_KEY_SID = "SKtest";
    process.env.TWILIO_API_KEY_SECRET = "secret";
    process.env.TWILIO_FROM_NUMBER = "+15557654321";
    delete process.env.TWILIO_MESSAGING_SERVICE_SID;

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendTwilioSms({ to: "+15551234567", body: "Hello" })).rejects.toThrow(CUSTOM_SMS_DELIVERY_DEFERRED_REASON);

    expect(getSmsProviderConfiguration()).toMatchObject({ configured: true, dispatchEnabled: false, deliveryMode: "direct-sender", authenticationMode: "api-key" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("retains server-only Auth Token configuration without permitting dispatch", async () => {
    process.env.TWILIO_ACCOUNT_SID = "ACtest";
    process.env.TWILIO_AUTH_TOKEN = "rotated-token";
    process.env.TWILIO_FROM_NUMBER = "+15557654321";
    delete process.env.TWILIO_API_KEY_SID;
    delete process.env.TWILIO_API_KEY_SECRET;
    delete process.env.TWILIO_MESSAGING_SERVICE_SID;

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendTwilioSms({ to: "+15551234567", body: "Hello" })).rejects.toThrow(CUSTOM_SMS_DELIVERY_DEFERRED_REASON);

    expect(getSmsProviderConfiguration()).toMatchObject({ configured: true, dispatchEnabled: false, authenticationMode: "auth-token" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
