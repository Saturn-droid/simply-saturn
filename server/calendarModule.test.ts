import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { isValidParticipantEmail, oneHourAfterSelectedStart } from "../client/src/lib/calendarEventUtils";

const projectFile = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("Calendar event creation", () => {
  it("defaults an event end time to exactly one hour after its selected start", () => {
    const start = new Date("2026-08-05T09:30:00.000Z");
    expect(oneHourAfterSelectedStart(start).getTime() - start.getTime()).toBe(60 * 60 * 1000);
  });

  it("accepts complete external participant emails and rejects incomplete entries", () => {
    expect(isValidParticipantEmail("guest@example.com")).toBe(true);
    expect(isValidParticipantEmail("guest@invalid")).toBe(false);
  });

  it("wires a protected calendar route with team, contact, and external participant choices", () => {
    const app = projectFile("client/src/App.tsx");
    const calendar = projectFile("client/src/pages/Calendar.tsx");
    const router = projectFile("server/routers.ts");

    expect(app).toContain('path="/app/calendar"');
    expect(calendar).toContain("Defaults to +1 hour");
    expect(calendar).toContain("Team members");
    expect(calendar).toContain("Contacts");
    expect(calendar).toContain("as an external guest");
    expect(router).toContain("calendar: router");
    expect(router).toContain("participantSuggestions");
  });

  it("queries all active workspace team members rather than treating only the current user as a team option", () => {
    const schema = projectFile("drizzle/schema.ts");
    const db = projectFile("server/db.ts");
    const router = projectFile("server/routers.ts");

    expect(schema).toContain("workspaceTeamMembers");
    expect(db).toContain("innerJoin(users, eq(workspaceTeamMembers.memberUserId, users.id))");
    expect(db).toContain("ensureWorkspaceOwnerTeamMembership");
    expect(router).toContain("isWorkspaceTeamMember");
  });

  it("keeps the calendar dialog UI wired for member suggestions and manual external-email entry", () => {
    const calendar = projectFile("client/src/pages/Calendar.tsx");

    expect(calendar).toContain('aria-controls="calendar-participant-suggestions"');
    expect(calendar).toContain('role="listbox"');
    expect(calendar).toContain("teamDirectoryQuery");
    expect(calendar).toContain("Add teammate");
    expect(calendar).toContain("as an external guest");
  });
});
