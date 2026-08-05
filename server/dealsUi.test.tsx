/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const trpcMocks = vi.hoisted(() => ({
  contactsListUseQuery: vi.fn(),
  createUseMutation: vi.fn(),
  dealsListUseQuery: vi.fn(),
  updateStageUseMutation: vi.fn(),
  useUtils: vi.fn(),
}));

vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: true }) }));
vi.mock("@/components/ui/dialog", () => ({ Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>, DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2> }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("@/lib/trpc", () => ({ trpc: { useUtils: trpcMocks.useUtils, contacts: { list: { useQuery: trpcMocks.contactsListUseQuery } }, deals: { list: { useQuery: trpcMocks.dealsListUseQuery }, create: { useMutation: trpcMocks.createUseMutation }, updateStage: { useMutation: trpcMocks.updateStageUseMutation } } } }));

import Deals from "../client/src/pages/Deals";

const create = vi.fn();
const updateStage = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  trpcMocks.useUtils.mockReturnValue({ deals: { list: { invalidate: vi.fn() } }, contacts: { list: { invalidate: vi.fn() } } });
  trpcMocks.contactsListUseQuery.mockReturnValue({ data: [{ id: 81, displayName: "Tiffany Hoskins", email: "tiffany@example.com" }], isLoading: false });
  trpcMocks.dealsListUseQuery.mockReturnValue({ data: [{ id: 91, contactId: 81, contactName: "Tiffany Hoskins", contactEmail: "tiffany@example.com", title: "Main Street listing", propertyAddress: "123 Main Street", stage: "lead", estimatedValueCents: 50000000, targetCloseAt: null }], isLoading: false });
  trpcMocks.createUseMutation.mockReturnValue({ isPending: false, mutate: create });
  trpcMocks.updateStageUseMutation.mockReturnValue({ isPending: false, mutate: updateStage });
});

afterEach(() => cleanup());

describe("Deals workspace", () => {
  it("submits a contact-linked real estate deal from the creation form", () => {
    render(<Deals />);
    fireEvent.change(screen.getByLabelText("Contact"), { target: { value: "81" } });
    fireEvent.change(screen.getByLabelText("Deal title"), { target: { value: "Lakeview purchase" } });
    fireEvent.change(screen.getByLabelText("Estimated value"), { target: { value: "650000" } });
    fireEvent.click(within(screen.getByLabelText("Deal title").closest("form")!).getByRole("button", { name: "Add deal" }));
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ contactId: 81, title: "Lakeview purchase", stage: "lead", estimatedValueCents: 65000000 }));
  });

  it("renders the connected contact and submits a selected stage change", () => {
    render(<Deals />);
    expect(screen.getByText("Tiffany Hoskins")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Update stage for Main Street listing"), { target: { value: "under_contract" } });
    expect(updateStage).toHaveBeenCalledWith({ dealId: 91, stage: "under_contract" });
  });
});
