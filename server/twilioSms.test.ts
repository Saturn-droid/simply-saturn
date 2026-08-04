import { afterEach, describe, expect, it, vi } from "vitest";
import { getSmsProviderConfiguration, sendTwilioSms } from "./twilioSms";

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

  it("uses a direct approved sender as the trial-compatible fallback without making a real network call", async () => {
    process.env.TWILIO_ACCOUNT_SID = "ACtest";
    process.env.TWILIO_API_KEY_SID = "SKtest";
    process.env.TWILIO_API_KEY_SECRET = "secret";
    process.env.TWILIO_FROM_NUMBER = "+15557654321";
    delete process.env.TWILIO_MESSAGING_SERVICE_SID;

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ sid: "SMtest", status: "queued" }), { status: 201 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendTwilioSms({ to: "+15551234567", body: "Hello" });
    const request = fetchMock.mock.calls[0];
    const payload = new URLSearchParams(String(request[1]?.body));

    expect(getSmsProviderConfiguration()).toMatchObject({ configured: true, deliveryMode: "direct-sender", authenticationMode: "api-key" });
    expect(payload.get("From")).toBe("+15557654321");
    expect(payload.get("MessagingServiceSid")).toBeNull();
    expect(result).toEqual({ sid: "SMtest", status: "queued", errorCode: undefined, errorMessage: undefined });
  });

  it("supports a fresh server-only Auth Token when a trial account has no API key available", async () => {
    process.env.TWILIO_ACCOUNT_SID = "ACtest";
    process.env.TWILIO_AUTH_TOKEN = "rotated-token";
    process.env.TWILIO_FROM_NUMBER = "+15557654321";
    delete process.env.TWILIO_API_KEY_SID;
    delete process.env.TWILIO_API_KEY_SECRET;
    delete process.env.TWILIO_MESSAGING_SERVICE_SID;

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ sid: "SMtoken", status: "queued" }), { status: 201 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await sendTwilioSms({ to: "+15551234567", body: "Hello" });
    const authorization = String(fetchMock.mock.calls[0]?.[1]?.headers?.Authorization);

    expect(getSmsProviderConfiguration()).toMatchObject({ configured: true, authenticationMode: "auth-token" });
    expect(Buffer.from(authorization.replace("Basic ", ""), "base64").toString()).toBe("ACtest:rotated-token");
  });
});
