import { describe, expect, it } from "vitest";
import { getTwilioEnv } from "./_core/env";

describe("Twilio trial credential configuration", () => {
  it("authenticates a lightweight account lookup with the secure server-only credentials", async () => {
    const twilio = getTwilioEnv();

    expect(twilio.accountSid).toMatch(/^AC[\w]+$/);
    expect(twilio.authToken.length).toBeGreaterThan(0);

    const authorization = Buffer.from(`${twilio.accountSid}:${twilio.authToken}`).toString("base64");
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilio.accountSid}.json`,
      {
        headers: {
          Authorization: `Basic ${authorization}`,
        },
      },
    );

    expect(response.ok, `Twilio credential probe returned HTTP ${response.status}`).toBe(true);
    const account = (await response.json()) as { sid?: string };
    expect(account.sid).toBe(twilio.accountSid);
  }, 15_000);
});
