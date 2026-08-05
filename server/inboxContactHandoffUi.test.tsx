/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const routing = vi.hoisted(() => ({ search: "" }));
const trpcMocks = vi.hoisted(() => ({
  configurationUseQuery: vi.fn(),
  listUseQuery: vi.fn(),
  recordActivityUseMutation: vi.fn(),
  sendUseMutation: vi.fn(),
  threadUseQuery: vi.fn(),
  useUtils: vi.fn(),
}));

vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: true, loading: false }) }));
vi.mock("@/components/ui/dialog", () => ({ Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogClose: ({ children }: { children: React.ReactNode }) => <>{children}</>, DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>, DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>, useDialogComposition: () => null }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("wouter", () => ({ useLocation: () => ["/app/inbox", vi.fn()], useSearch: () => routing.search }));
vi.mock("@/lib/trpc", () => ({ trpc: { useUtils: trpcMocks.useUtils, contacts: { recordActivity: { useMutation: trpcMocks.recordActivityUseMutation } }, sms: { configuration: { useQuery: trpcMocks.configurationUseQuery }, list: { useQuery: trpcMocks.listUseQuery }, thread: { useQuery: trpcMocks.threadUseQuery }, send: { useMutation: trpcMocks.sendUseMutation } } } }));

import Inbox from "../client/src/pages/Inbox";

const mutate = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  trpcMocks.useUtils.mockReturnValue({ sms: { list: { invalidate: vi.fn() }, thread: { invalidate: vi.fn() } } });
  trpcMocks.configurationUseQuery.mockReturnValue({ data: { configured: true, dispatchEnabled: false, restrictionReason: "Delivery deferred" } });
  trpcMocks.listUseQuery.mockReturnValue({ data: [], isLoading: false });
  trpcMocks.threadUseQuery.mockReturnValue({ data: undefined, isLoading: false });
  trpcMocks.sendUseMutation.mockReturnValue({ isPending: false, mutate: vi.fn() });
  trpcMocks.recordActivityUseMutation.mockImplementation((options: { onSuccess?: (contact: { lastEmailAt: Date | null; lastCallAt: Date | null }, variables: { channel: "email" | "call" }) => void }) => ({
    isPending: false,
    mutate: (variables: { contactId: number; channel: "email" | "call" }) => {
      mutate(variables);
      options.onSuccess?.({
        lastEmailAt: variables.channel === "email" ? new Date("2026-08-05T15:00:00.000Z") : null,
        lastCallAt: variables.channel === "call" ? new Date("2026-08-05T16:00:00.000Z") : null,
      }, variables);
    },
  }));
});

afterEach(() => cleanup());

describe("Inbox contact handoff completion", () => {
  it("updates email activity only after explicit completion acknowledgement", async () => {
    routing.search = "?channel=email&contactId=81&name=Tiffany%20Hoskins&email=tiffany%40example.com";
    const user = userEvent.setup();
    render(<Inbox />);

    expect(mutate).not.toHaveBeenCalled();
    await user.click(screen.getByLabelText("I completed the email handoff."));
    await user.click(screen.getByRole("button", { name: "Mark email handoff complete" }));
    expect(mutate).toHaveBeenCalledWith({ contactId: 81, channel: "email" });
    expect(screen.getByRole("status").textContent).toContain("Last email contact updated");
  });

  it("updates call activity only after explicit completion acknowledgement", async () => {
    routing.search = "?channel=call&contactId=81&name=Tiffany%20Hoskins&phone=%2B12819022722";
    const user = userEvent.setup();
    render(<Inbox />);

    expect(mutate).not.toHaveBeenCalled();
    await user.click(screen.getByLabelText("I completed the call handoff."));
    await user.click(screen.getByRole("button", { name: "Mark call handoff complete" }));
    expect(mutate).toHaveBeenCalledWith({ contactId: 81, channel: "call" });
    expect(screen.getByRole("status").textContent).toContain("Last call contact updated");
  });
});
