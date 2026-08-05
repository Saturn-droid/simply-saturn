import { beforeEach, describe, expect, it, vi } from "vitest";

const calendarDb = vi.hoisted(() => ({
  addWorkspaceTeamMemberByEmail: vi.fn(),
  createCalendarEvent: vi.fn(),
  isWorkspaceTeamMember: vi.fn(),
  listCalendarEvents: vi.fn(),
  listCalendarParticipantSuggestions: vi.fn(),
  listWorkspaceTeamMembers: vi.fn(),
}));

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, ...calendarDb };
});

import { appRouter } from "./routers";

const owner = {
  id: 41,
  openId: "calendar-owner",
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

function nonLeaderCaller() {
  return appRouter.createCaller({ user: { ...owner, id: 72, role: "user" as const } } as never);
}

describe("calendar participant runtime contract", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    calendarDb.listCalendarParticipantSuggestions.mockResolvedValue({
      teamMembers: [
        { id: 41, kind: "team", displayName: "Workspace Owner", email: "owner@example.com", userId: 41, isOwner: true },
        { id: 57, kind: "team", displayName: "Alex Agent", email: "alex@example.com", userId: 57, isOwner: false },
      ],
      contacts: [{ id: 83, kind: "contact", displayName: "Priya Prospect", email: "priya@example.com" }],
    });
    calendarDb.listWorkspaceTeamMembers.mockResolvedValue([
      { id: 41, kind: "team", displayName: "Workspace Owner", email: "owner@example.com", userId: 41, isOwner: true },
      { id: 57, kind: "team", displayName: "Alex Agent", email: "alex@example.com", userId: 57, isOwner: false },
    ]);
    calendarDb.isWorkspaceTeamMember.mockResolvedValue(true);
    calendarDb.addWorkspaceTeamMemberByEmail.mockResolvedValue({ id: 57, kind: "team", displayName: "Alex Agent", email: "alex@example.com", userId: 57, isOwner: false });
    calendarDb.createCalendarEvent.mockImplementation(async (input: unknown) => ({ id: 91, ...input as object }));
  });

  it("returns multiple team members alongside matching saved contacts", async () => {
    const result = await caller().calendar.participantSuggestions({ query: "" });

    expect(result.teamMembers.map((member) => member.email)).toEqual(["owner@example.com", "alex@example.com"]);
    expect(result.contacts.map((contact) => contact.email)).toEqual(["priya@example.com"]);
  });

  it("enrolls a registered teammate and keeps the directory scoped to the current workspace owner", async () => {
    const result = await caller().calendar.addTeamMember({ email: "alex@example.com" });

    expect(calendarDb.addWorkspaceTeamMemberByEmail).toHaveBeenCalledWith({ ownerUserId: 41, email: "alex@example.com" });
    expect(result).toMatchObject({ userId: 57, email: "alex@example.com" });
  });

  it("allows only workspace leaders to enroll teammates", async () => {
    await expect(nonLeaderCaller().calendar.addTeamMember({ email: "alex@example.com" })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(calendarDb.addWorkspaceTeamMemberByEmail).not.toHaveBeenCalled();
  });

  it("persists team, saved-contact, and external-email participants through the real calendar router contract", async () => {
    await caller().calendar.create({
      clientEventId: "calendar-runtime-20260805",
      title: "Listing review",
      startsAt: new Date("2026-08-05T14:00:00.000Z"),
      endsAt: new Date("2026-08-05T15:00:00.000Z"),
      participants: [
        { kind: "team", displayName: "Alex Agent", email: "alex@example.com", userId: 57 },
        { kind: "contact", displayName: "Priya Prospect", email: "priya@example.com" },
        { kind: "external", displayName: "Counsel", email: "counsel@example.org" },
      ],
    });

    expect(calendarDb.isWorkspaceTeamMember).toHaveBeenCalledWith({ ownerUserId: 41, memberUserId: 57 });
    expect(calendarDb.createCalendarEvent).toHaveBeenCalledWith(expect.objectContaining({
      ownerUserId: 41,
      participants: [
        { kind: "team", displayName: "Alex Agent", email: "alex@example.com", userId: 57 },
        { kind: "contact", displayName: "Priya Prospect", email: "priya@example.com" },
        { kind: "external", displayName: "Counsel", email: "counsel@example.org" },
      ],
    }));
  });
});
