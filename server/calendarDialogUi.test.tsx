/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const trpcMocks = vi.hoisted(() => ({
  addTeamMemberUseMutation: vi.fn(),
  createUseMutation: vi.fn(),
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
vi.mock("sonner", () => ({ toast: { error: vi.fn(), message: vi.fn(), success: vi.fn() } }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: trpcMocks.useUtils,
    calendar: {
      list: { useQuery: trpcMocks.eventsUseQuery },
      teamDirectory: { useQuery: trpcMocks.teamDirectoryUseQuery },
      participantSuggestions: { useQuery: trpcMocks.participantSuggestionsUseQuery },
      create: { useMutation: trpcMocks.createUseMutation },
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
});
