import { beforeEach, describe, expect, it, vi } from "vitest";

const teamDb = vi.hoisted(() => ({
  addWorkspaceTeamMemberByEmail: vi.fn(),
  listWorkspaceTeamMembers: vi.fn(),
  removeWorkspaceTeamMember: vi.fn(),
  resolveWorkspaceOwnerUserId: vi.fn(),
  updateWorkspaceMemberPhone: vi.fn(),
}));

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, ...teamDb };
});

import { appRouter } from "./routers";

const owner = { id: 41, openId: "team-owner", name: "Workspace Owner", email: "owner@example.com", loginMethod: null, role: "admin" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const member = { ...owner, id: 57, openId: "team-member", name: "Alex Agent", email: "alex@example.com", role: "user" as const };

function leaderCaller() { return appRouter.createCaller({ user: owner } as never); }
function memberCaller() { return appRouter.createCaller({ user: member } as never); }

describe("Team Management runtime contract", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    teamDb.resolveWorkspaceOwnerUserId.mockResolvedValue(41);
    teamDb.listWorkspaceTeamMembers.mockResolvedValue([
      { id: 41, kind: "team", displayName: "Workspace Owner", email: "owner@example.com", phone: "+15551234567", userId: 41, isOwner: true, role: "admin" },
      { id: 57, kind: "team", displayName: "Alex Agent", email: "alex@example.com", phone: "+15557654321", userId: 57, isOwner: false, role: "user" },
    ]);
    teamDb.addWorkspaceTeamMemberByEmail.mockResolvedValue({ id: 57, kind: "team", displayName: "Alex Agent", email: "alex@example.com", phone: "+15557654321", userId: 57, isOwner: false, role: "user" });
    teamDb.removeWorkspaceTeamMember.mockResolvedValue(true);
    teamDb.updateWorkspaceMemberPhone.mockResolvedValue({ id: 57, kind: "team", displayName: "Alex Agent", email: "alex@example.com", phone: "+15557654321", userId: 57, isOwner: false, role: "user" });
  });

  it("returns the shared directory for an active workspace member", async () => {
    const directory = await memberCaller().team.list();
    expect(teamDb.resolveWorkspaceOwnerUserId).toHaveBeenCalledWith(57);
    expect(teamDb.listWorkspaceTeamMembers).toHaveBeenCalledWith(41);
    expect(directory).toHaveLength(2);
    expect(directory[1]).toMatchObject({ email: "alex@example.com", phone: "+15557654321", role: "user" });
  });

  it("allows leadership to enroll a registered teammate and remove a non-owner member", async () => {
    const enrolled = await leaderCaller().team.enroll({ email: "alex@example.com" });
    const removed = await leaderCaller().team.remove({ memberUserId: 57 });
    expect(enrolled).toMatchObject({ userId: 57, email: "alex@example.com" });
    expect(teamDb.addWorkspaceTeamMemberByEmail).toHaveBeenCalledWith({ ownerUserId: 41, email: "alex@example.com" });
    expect(removed).toEqual({ success: true });
    expect(teamDb.removeWorkspaceTeamMember).toHaveBeenCalledWith({ ownerUserId: 41, memberUserId: 57 });
  });

  it("keeps enrollment and removal controls restricted to leadership", async () => {
    await expect(memberCaller().team.enroll({ email: "new@example.com" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(memberCaller().team.remove({ memberUserId: 41 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(teamDb.addWorkspaceTeamMemberByEmail).not.toHaveBeenCalled();
    expect(teamDb.removeWorkspaceTeamMember).not.toHaveBeenCalled();
  });

  it("allows each registered member to update their own directory phone", async () => {
    const updated = await memberCaller().team.updateMyPhone({ phone: "+15557654321" });
    expect(teamDb.updateWorkspaceMemberPhone).toHaveBeenCalledWith({ memberUserId: 57, phone: "+15557654321" });
    expect(updated).toMatchObject({ email: "alex@example.com", phone: "+15557654321" });
  });
});
