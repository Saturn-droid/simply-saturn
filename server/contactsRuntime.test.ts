import { beforeEach, describe, expect, it, vi } from "vitest";

const contactsDb = vi.hoisted(() => ({
  createCrmContact: vi.fn(),
  getCrmContact: vi.fn(),
  listCrmContacts: vi.fn(),
  recordCrmContactActivity: vi.fn(),
  setCrmContactStatus: vi.fn(),
  updateCrmContact: vi.fn(),
}));

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, ...contactsDb };
});

import { appRouter } from "./routers";

const owner = {
  id: 41,
  openId: "contacts-owner",
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

describe("contacts runtime contract", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    contactsDb.listCrmContacts.mockResolvedValue([]);
    contactsDb.createCrmContact.mockImplementation(async (input: unknown) => ({ id: 81, ...input as object }));
    contactsDb.updateCrmContact.mockImplementation(async (input: unknown) => ({ ...input }));
    contactsDb.setCrmContactStatus.mockImplementation(async (input: unknown) => ({ ...input }));
    contactsDb.recordCrmContactActivity.mockImplementation(async (input: unknown) => ({ ...input }));
    contactsDb.getCrmContact.mockResolvedValue({ id: 81, displayName: "Tiffany Hoskins" });
  });

  it("lists contacts with only useful search and optional status filters", async () => {
    await caller().contacts.list({ query: "tiffany", status: "prospect" });

    expect(contactsDb.listCrmContacts).toHaveBeenCalledWith({ ownerUserId: 41, query: "tiffany", status: "prospect" });
  });

  it("creates a contact with multiple operational types and an optional ISA status", async () => {
    await caller().contacts.create({
      displayName: "Tiffany Hoskins",
      email: "tiffany@example.com",
      phone: "+12819022722",
      types: ["seller", "investor"],
      status: "prospect",
      dealCount: 1,
    });

    expect(contactsDb.createCrmContact).toHaveBeenCalledWith({
      ownerUserId: 41,
      displayName: "Tiffany Hoskins",
      email: "tiffany@example.com",
      phone: "+12819022722",
      types: ["seller", "investor"],
      status: "prospect",
      dealCount: 1,
    });
  });

  it("allows an ISA status to be removed without removing the contact", async () => {
    await caller().contacts.setStatus({ contactId: 81, status: null });

    expect(contactsDb.setCrmContactStatus).toHaveBeenCalledWith({ ownerUserId: 41, contactId: 81, status: null });
  });

  it("records text, call, and email handoffs against the selected contact", async () => {
    await caller().contacts.recordActivity({ contactId: 81, channel: "text" });
    await caller().contacts.recordActivity({ contactId: 81, channel: "call" });
    await caller().contacts.recordActivity({ contactId: 81, channel: "email" });

    expect(contactsDb.recordCrmContactActivity).toHaveBeenNthCalledWith(1, { ownerUserId: 41, contactId: 81, channel: "text" });
    expect(contactsDb.recordCrmContactActivity).toHaveBeenNthCalledWith(2, { ownerUserId: 41, contactId: 81, channel: "call" });
    expect(contactsDb.recordCrmContactActivity).toHaveBeenNthCalledWith(3, { ownerUserId: 41, contactId: 81, channel: "email" });
  });

  it("returns updated email and call contact summaries after completed handoffs", async () => {
    const emailCompletedAt = new Date("2026-08-05T15:00:00.000Z");
    const callCompletedAt = new Date("2026-08-05T16:00:00.000Z");
    contactsDb.recordCrmContactActivity
      .mockResolvedValueOnce({ id: 81, lastEmailAt: emailCompletedAt, lastCallAt: null, lastTextAt: null })
      .mockResolvedValueOnce({ id: 81, lastEmailAt: emailCompletedAt, lastCallAt: callCompletedAt, lastTextAt: null });

    const emailResult = await caller().contacts.recordActivity({ contactId: 81, channel: "email" });
    const callResult = await caller().contacts.recordActivity({ contactId: 81, channel: "call" });

    expect(emailResult).toMatchObject({ id: 81, lastEmailAt: emailCompletedAt, lastCallAt: null });
    expect(callResult).toMatchObject({ id: 81, lastEmailAt: emailCompletedAt, lastCallAt: callCompletedAt });
  });
});
