/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const trpcMocks = vi.hoisted(() => ({ contactsListUseQuery: vi.fn(), createUseMutation: vi.fn(), dealsListUseQuery: vi.fn(), tasksListUseQuery: vi.fn(), setStatusUseMutation: vi.fn(), useUtils: vi.fn() }));
vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: true }) }));
vi.mock("@/components/ui/dialog", () => ({ Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>, DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>, useDialogComposition: () => null }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("@/lib/trpc", () => ({ trpc: { useUtils: trpcMocks.useUtils, contacts: { list: { useQuery: trpcMocks.contactsListUseQuery } }, deals: { list: { useQuery: trpcMocks.dealsListUseQuery } }, tasks: { list: { useQuery: trpcMocks.tasksListUseQuery }, create: { useMutation: trpcMocks.createUseMutation }, setStatus: { useMutation: trpcMocks.setStatusUseMutation } } } }));
import Tasks from "../client/src/pages/Tasks";

const create = vi.fn();
const setStatus = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  trpcMocks.useUtils.mockReturnValue({ tasks: { list: { invalidate: vi.fn() } } });
  trpcMocks.contactsListUseQuery.mockReturnValue({ data: [{ id: 81, displayName: "Tiffany Hoskins" }], isLoading: false });
  trpcMocks.dealsListUseQuery.mockReturnValue({ data: [{ id: 91, title: "Main Street listing", contactName: "Tiffany Hoskins" }], isLoading: false });
  trpcMocks.tasksListUseQuery.mockReturnValue({ data: [{ id: 301, title: "Confirm disclosures", notes: "Ask for initials.", dueAt: new Date(), priority: "high", status: "open", completedAt: null, contactName: "Tiffany Hoskins", dealTitle: "Main Street listing" }], isLoading: false });
  trpcMocks.createUseMutation.mockReturnValue({ isPending: false, mutate: create });
  trpcMocks.setStatusUseMutation.mockReturnValue({ isPending: false, mutate: setStatus });
});
afterEach(() => cleanup());
describe("Tasks workspace", () => {
  it("creates a connected task with due date and priority", () => {
    render(<Tasks />);
    fireEvent.change(screen.getByLabelText("Task title"), { target: { value: "Call Tiffany" } });
    fireEvent.change(screen.getByLabelText(/^Contact/), { target: { value: "81" } });
    fireEvent.change(screen.getByLabelText(/^Deal/), { target: { value: "91" } });
    fireEvent.change(screen.getByLabelText(/^Priority/), { target: { value: "high" } });
    fireEvent.click(within(screen.getByLabelText("Task title").closest("form")!).getByRole("button", { name: "Add task" }));
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ title: "Call Tiffany", contactId: 81, dealId: 91, priority: "high" }));
  });
  it("renders connected context and completes a task", () => {
    render(<Tasks />);
    expect(screen.getAllByText("Tiffany Hoskins").length).toBeGreaterThan(1);
    expect(screen.getByText("Main Street listing")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Complete Confirm disclosures"));
    expect(setStatus).toHaveBeenCalledWith({ taskId: 301, status: "completed" });
  });
});
