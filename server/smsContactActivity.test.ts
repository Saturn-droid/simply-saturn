import { beforeEach, describe, expect, it, vi } from "vitest";

const smsDb = vi.hoisted(() => ({
  createOutboundSmsMessage: vi.fn(),
  findOrCreateSmsConversation: vi.fn(),
  findSmsMessageByClientId: vi.fn(),
  getCrmContact: vi.fn(),
  recordCrmContactActivity: vi.fn(),
  touchSmsConversation: vi.fn(),
  updateSmsMessageDelivery: vi.fn(),
}));
const smsProvider = vi.hoisted(() => ({
  getSmsProviderConfiguration: vi.fn(),
  isE164PhoneNumber: vi.fn(),
  sendTwilioSms: vi.fn(),
}));

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, ...smsDb };
});

vi.mock("./twilioSms", () => ({
  ...smsProvider,
  TwilioSmsError: class TwilioSmsError extends Error {},
}));

import { appRouter } from "./routers";

const owner = {
  id: 41,
  openId: "sms-contact-owner",
  name: "Workspace Owner",
  email: "owner@example.com",
  loginMethod: null,
  role: "admin" as const,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  lastSignedIn: new Date("2026-08-05T00:00:00.000Z"),
};

function caller() {
  return appRouter.createCaller({ user: owner } as never);
}

describe("contact-linked SMS activity", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    smsProvider.isE164PhoneNumber.mockReturnValue(true);
    smsProvider.getSmsProviderConfiguration.mockReturnValue({ configured: true, dispatchEnabled: true, senderLabel: "+15551234567" });
    smsProvider.sendTwilioSms.mockResolvedValue({ status: "sent", sid: "SM-contact-activity" });
    smsDb.findSmsMessageByClientId.mockResolvedValue(undefined);
    smsDb.getCrmContact.mockResolvedValue({ id: 81, displayName: "Tiffany Hoskins" });
    smsDb.findOrCreateSmsConversation.mockResolvedValue({ id: 52, contactPhone: "+12819022722" });
    smsDb.createOutboundSmsMessage.mockResolvedValue({ id: 91, conversationId: 52, deliveryStatus: "queued" });
    smsDb.updateSmsMessageDelivery.mockResolvedValue({ id: 91, conversationId: 52, deliveryStatus: "sent" });
    smsDb.recordCrmContactActivity.mockResolvedValue({ id: 81, lastTextAt: new Date() });
  });

  it("updates last-text activity only after the provider accepts a contact-specific text", async () => {
    await caller().sms.send({
      to: "+12819022722",
      contactName: "Tiffany Hoskins",
      contactId: 81,
      body: "Your appointment is confirmed.",
      clientMessageId: "sms-contact-activity-20260805",
      confirmLiveSend: true,
    });

    expect(smsDb.getCrmContact).toHaveBeenCalledWith({ ownerUserId: 41, contactId: 81 });
    expect(smsProvider.sendTwilioSms).toHaveBeenCalledWith({ to: "+12819022722", body: "Your appointment is confirmed." });
    expect(smsDb.recordCrmContactActivity).toHaveBeenCalledWith({ ownerUserId: 41, contactId: 81, channel: "text" });
  });

  it("rejects a missing routed contact before creating a conversation or submitting a provider request", async () => {
    smsDb.getCrmContact.mockResolvedValue(undefined);

    await expect(caller().sms.send({
      to: "+12819022722",
      contactId: 81,
      body: "Your appointment is confirmed.",
      clientMessageId: "sms-contact-missing-20260805",
      confirmLiveSend: true,
    })).rejects.toMatchObject({ code: "NOT_FOUND" });

    expect(smsDb.findOrCreateSmsConversation).not.toHaveBeenCalled();
    expect(smsProvider.sendTwilioSms).not.toHaveBeenCalled();
  });
});
