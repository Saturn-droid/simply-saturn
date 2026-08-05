/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const trpcMocks = vi.hoisted(() => ({
  enrollUseMutation: vi.fn(),
  listUseQuery: vi.fn(),
  removeUseMutation: vi.fn(),
  updateMyPhoneUseMutation: vi.fn(),
  useUtils: vi.fn(),
}));

vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: true, user: { id: 41, role: "admin" } }) }));
vi.mock("@/components/ui/dialog", () => ({ Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>, DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2> }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("@/lib/trpc", () => ({ trpc: { useUtils: trpcMocks.useUtils, team: { list: { useQuery: trpcMocks.listUseQuery }, enroll: { useMutation: trpcMocks.enrollUseMutation }, remove: { useMutation: trpcMocks.removeUseMutation }, updateMyPhone: { useMutation: trpcMocks.updateMyPhoneUseMutation } } } }));

import Team from "../client/src/pages/Team";

const invalidate = vi.fn();
const updatePhone = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  trpcMocks.useUtils.mockReturnValue({ team: { list: { invalidate } }, calendar: { teamDirectory: { invalidate }, participantSuggestions: { invalidate } } });
  trpcMocks.listUseQuery.mockReturnValue({ data: [
    { id: 41, kind: "team", displayName: "Workspace Owner", email: "owner@example.com", phone: "+15551234567", userId: 41, isOwner: true, role: "admin" },
    { id: 57, kind: "team", displayName: "Alex Agent", email: "alex@example.com", phone: "+15557654321", userId: 57, isOwner: false, role: "user" },
  ], isLoading: false });
  trpcMocks.enrollUseMutation.mockReturnValue({ isPending: false, mutate: vi.fn() });
  trpcMocks.removeUseMutation.mockReturnValue({ isPending: false, mutate: vi.fn() });
  trpcMocks.updateMyPhoneUseMutation.mockReturnValue({ isPending: false, mutate: updatePhone });
});

afterEach(() => cleanup());

describe("Team Management contact details", () => {
  it("renders registered member email and phone details from the directory data", () => {
    render(<Team />);

    expect(screen.getByText("owner@example.com")).toBeTruthy();
    expect(screen.getByText("alex@example.com")).toBeTruthy();
    expect(screen.getByLabelText("Phone for Workspace Owner: +15551234567")).toBeTruthy();
    expect(screen.getByLabelText("Phone for Alex Agent: +15557654321")).toBeTruthy();
  });

  it("submits the authenticated member’s new directory phone through the protected update flow", () => {
    render(<Team />);
    const input = screen.getByLabelText("Your team directory phone") as HTMLInputElement;
    expect(input.value).toBe("+15551234567");
    fireEvent.change(input, { target: { value: "+15559876543" } });
    fireEvent.click(screen.getByRole("button", { name: "Save phone" }));
    expect(updatePhone).toHaveBeenCalledWith({ phone: "+15559876543" });
  });
});
