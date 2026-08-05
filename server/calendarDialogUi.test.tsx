/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const trpcMocks = vi.hoisted(() => ({
  addTeamMemberUseMutation: vi.fn(),
  createUseMutation: vi.fn(),
  updateUseMutation: vi.fn(),
  eventsUseQuery: vi.fn(),
  participantSuggestionsUseQuery: vi.fn(),
  teamDirectoryUseQuery: vi.fn(),
  useUtils: vi.fn(),
}));

vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: true, user: { role: "admin" } }) }));
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));
vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <section role="dialog" aria-label="Events on selected day">{children}</section>,
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), message: vi.fn(), success: vi.fn() } }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: trpcMocks.useUtils,
    calendar: {
      list: { useQuery: trpcMocks.eventsUseQuery },
      teamDirectory: { useQuery: trpcMocks.teamDirectoryUseQuery },
      participantSuggestions: { useQuery: trpcMocks.participantSuggestionsUseQuery },
      create: { useMutation: trpcMocks.createUseMutation },
      update: { useMutation: trpcMocks.updateUseMutation },
      addTeamMember: { useMutation: trpcMocks.addTeamMemberUseMutation },
    },
  },
}));

import Calendar from "../client/src/pages/Calendar";

const emptyMutation = { isPending: false, mutate: vi.fn() };
const invalidate = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  trpcMocks.useUtils.mockReturnValue({
    calendar: {
      list: { invalidate },
      participantSuggestions: { invalidate },
      teamDirectory: { invalidate },
    },
  });
  trpcMocks.eventsUseQuery.mockReturnValue({ data: [], isLoading: false });
  trpcMocks.teamDirectoryUseQuery.mockReturnValue({
    data: [{ id: 1, kind: "team", displayName: "Workspace Owner", email: "owner@example.com", userId: 1, isOwner: true }],
    isLoading: false,
  });
  trpcMocks.participantSuggestionsUseQuery.mockReturnValue({
    data: {
      teamMembers: [{ id: 7, kind: "team", displayName: "Alex Agent", email: "alex@example.com", userId: 7 }],
      contacts: [{ id: 9, kind: "contact", displayName: "Priya Prospect", email: "priya@example.com" }],
    },
  });
  trpcMocks.createUseMutation.mockReturnValue(emptyMutation);
  trpcMocks.updateUseMutation.mockReturnValue(emptyMutation);
  trpcMocks.addTeamMemberUseMutation.mockReturnValue(emptyMutation);
});

afterEach(() => cleanup());

describe("calendar participant dialog", () => {
  it("renders team and contact suggestions, adds each kind, and accepts a complete external email", async () => {
    const user = userEvent.setup();
    render(<Calendar />);

    const participantInput = screen.getByLabelText("Participants");
    await user.click(participantInput);
    expect(screen.getByRole("option", { name: /Alex Agent/i })).toBeTruthy();
    expect(screen.getByRole("option", { name: /Priya Prospect/i })).toBeTruthy();

    await user.click(screen.getByRole("option", { name: /Alex Agent/i }));
    expect(screen.getByLabelText("Remove Alex Agent")).toBeTruthy();

    await user.type(participantInput, "priya");
    await user.click(screen.getByRole("option", { name: /Priya Prospect/i }));
    expect(screen.getByLabelText("Remove Priya Prospect")).toBeTruthy();

    await user.type(participantInput, "outside@example.org");
    await user.click(screen.getByRole("button", { name: /Add outside@example\.org as an external guest/i }));
    expect(screen.getByLabelText("Remove outside@example.org")).toBeTruthy();
  });

  it("preserves the current duration when a new-event start time changes", () => {
    render(<Calendar />);
    const start = screen.getByLabelText("Start time") as HTMLInputElement;
    const end = screen.getByLabelText(/End time/i) as HTMLInputElement;

    fireEvent.change(start, { target: { value: "2026-08-05T09:00" } });
    expect(end.value).toBe("2026-08-05T10:00");
    fireEvent.change(end, { target: { value: "2026-08-05T09:30" } });
    fireEvent.change(start, { target: { value: "2026-08-05T11:00" } });

    expect(end.value).toBe("2026-08-05T11:30");
  });

  it("preserves an edited event's adjusted duration when its start time changes", async () => {
    trpcMocks.eventsUseQuery.mockReturnValue({
      data: [{
        id: 72,
        title: "Buyer strategy call",
        startsAt: new Date("2026-08-05T09:00:00.000Z"),
        endsAt: new Date("2026-08-05T10:00:00.000Z"),
        location: null,
        notes: null,
        participants: [],
      }],
      isLoading: false,
    });
    const user = userEvent.setup();
    render(<Calendar />);

    await user.click(screen.getByRole("button", { name: /Buyer strategy call/i }));
    const start = screen.getByLabelText("Start time") as HTMLInputElement;
    const end = screen.getByLabelText(/End time/i) as HTMLInputElement;
    fireEvent.change(end, { target: { value: "2026-08-05T09:30" } });
    fireEvent.change(start, { target: { value: "2026-08-05T11:00" } });

    expect(screen.getByText("Edit calendar event")).toBeTruthy();
    expect(end.value).toBe("2026-08-05T11:30");
  });

  it("keeps all-day indicators separate and opens the remaining timed and multi-day events from See more", async () => {
    const now = new Date(); const year = now.getFullYear(); const month = now.getMonth(); const day = Math.min(15, new Date(year, month + 1, 0).getDate());
    const starts = (hour: number) => new Date(year, month, day, hour); const ends = (hour: number) => new Date(year, month, day, hour);
    trpcMocks.eventsUseQuery.mockReturnValue({ data: [
      { id: 201, title: "All-day inspection", startsAt: new Date(year, month, day, 0), endsAt: new Date(year, month, day + 1, 0), location: null, notes: null, participants: [] },
      { id: 202, title: "Morning call", startsAt: starts(9), endsAt: ends(10), location: null, notes: null, participants: [] },
      { id: 203, title: "Listing review", startsAt: starts(10), endsAt: ends(11), location: null, notes: null, participants: [] },
      { id: 204, title: "Multi-day escrow", startsAt: new Date(year, month, day - 1, 15), endsAt: new Date(year, month, day + 2, 11), location: null, notes: null, participants: [] },
    ], isLoading: false });
    const user = userEvent.setup(); render(<Calendar />);
    expect(screen.getByText("All day · 1")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /See 1 more events on/i }));
    const moreEvents = screen.getByRole("dialog", { name: /Events on/i });
    expect(moreEvents).toBeTruthy();
    expect(within(moreEvents).getByText("Multi-day escrow")).toBeTruthy();
  });
});
