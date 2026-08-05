/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const routing = vi.hoisted(() => ({ search: "" }));
const state = vi.hoisted(() => ({
  contact: {
    id: 81,
    displayName: "Tiffany Hoskins",
    email: "tiffany@example.com",
    phone: "+12819022722",
    types: ["seller"],
    status: "prospect" as const,
    dealCount: 1,
    lastTextAt: null as Date | null,
    lastCallAt: null as Date | null,
    lastEmailAt: null as Date | null,
  },
}));
const trpcMocks = vi.hoisted(() => ({
  configurationUseQuery: vi.fn(),
  contactsListUseQuery: vi.fn(),
  createUseMutation: vi.fn(),
  listUseQuery: vi.fn(),
  recordActivityUseMutation: vi.fn(),
  sendUseMutation: vi.fn(),
  setStatusUseMutation: vi.fn(),
  teamListUseQuery: vi.fn(),
  threadUseQuery: vi.fn(),
  useUtils: vi.fn(),
}));

vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: true, loading: false }) }));
vi.mock("@/components/ui/dialog", () => ({ Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>, DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>, DialogClose: ({ children }: { children: React.ReactNode }) => <>{children}</>, useDialogComposition: () => null }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("wouter", () => ({ useLocation: () => ["/app/inbox", vi.fn()], useSearch: () => routing.search }));
vi.mock("@/lib/trpc", () => ({ trpc: { useUtils: trpcMocks.useUtils, contacts: { create: { useMutation: trpcMocks.createUseMutation }, list: { useQuery: trpcMocks.contactsListUseQuery }, recordActivity: { useMutation: trpcMocks.recordActivityUseMutation }, setStatus: { useMutation: trpcMocks.setStatusUseMutation } }, team: { list: { useQuery: trpcMocks.teamListUseQuery } }, sms: { configuration: { useQuery: trpcMocks.configurationUseQuery }, list: { useQuery: trpcMocks.listUseQuery }, thread: { useQuery: trpcMocks.threadUseQuery }, send: { useMutation: trpcMocks.sendUseMutation } } } }));

import Contacts from "../client/src/pages/Contacts";
import Inbox from "../client/src/pages/Inbox";

const blankMutation = { isPending: false, mutate: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  state.contact = { id: 81, displayName: "Tiffany Hoskins", email: "tiffany@example.com", phone: "+12819022722", types: ["seller"], status: "prospect", dealCount: 1, lastTextAt: null, lastCallAt: null, lastEmailAt: null };
  trpcMocks.useUtils.mockReturnValue({ contacts: { list: { invalidate: vi.fn() } }, sms: { list: { invalidate: vi.fn() }, thread: { invalidate: vi.fn() } } });
  trpcMocks.configurationUseQuery.mockReturnValue({ data: { configured: true, dispatchEnabled: false, restrictionReason: "Delivery deferred" } });
  trpcMocks.listUseQuery.mockReturnValue({ data: [], isLoading: false });
  trpcMocks.threadUseQuery.mockReturnValue({ data: undefined, isLoading: false });
  trpcMocks.teamListUseQuery.mockReturnValue({ data: [], isLoading: false });
  trpcMocks.sendUseMutation.mockImplementation((options: { onSuccess?: (result: { message: { conversationId: number }; idempotent: boolean }) => void }) => ({
    isPending: false,
    mutate: () => {
      state.contact = { ...state.contact, lastTextAt: new Date() };
      options.onSuccess?.({ message: { conversationId: 52 }, idempotent: false });
    },
  }));
  trpcMocks.createUseMutation.mockReturnValue(blankMutation);
  trpcMocks.setStatusUseMutation.mockReturnValue(blankMutation);
  trpcMocks.contactsListUseQuery.mockImplementation(() => ({ data: [state.contact], isLoading: false }));
  trpcMocks.recordActivityUseMutation.mockImplementation((options: { onSuccess?: (contact: typeof state.contact, variables: { channel: "email" | "call" }) => void }) => ({
    isPending: false,
    mutate: (variables: { contactId: number; channel: "email" | "call" }) => {
      const now = new Date();
      state.contact = { ...state.contact, lastEmailAt: variables.channel === "email" ? now : state.contact.lastEmailAt, lastCallAt: variables.channel === "call" ? now : state.contact.lastCallAt };
      options.onSuccess?.(state.contact, variables);
    },
  }));
});

afterEach(() => cleanup());

describe("contact list activity integration", () => {
  it("renders a fresh email last-contact value after explicit email handoff completion", async () => {
    routing.search = "?channel=email&contactId=81&name=Tiffany%20Hoskins&email=tiffany%40example.com";
    const user = userEvent.setup();
    render(<Inbox />);
    await user.click(screen.getByLabelText("I completed the email handoff."));
    await user.click(screen.getByRole("button", { name: "Mark email handoff complete" }));
    cleanup();
    render(<Contacts />);

    expect(screen.getByLabelText("Last email for Tiffany Hoskins: Now")).toBeTruthy();
    expect(screen.getByLabelText("Last call for Tiffany Hoskins: —")).toBeTruthy();
    expect(screen.getByLabelText("Last text for Tiffany Hoskins: —")).toBeTruthy();
  });

  it("renders a fresh call last-contact value after explicit call handoff completion", async () => {
    routing.search = "?channel=call&contactId=81&name=Tiffany%20Hoskins&phone=%2B12819022722";
    const user = userEvent.setup();
    render(<Inbox />);
    await user.click(screen.getByLabelText("I completed the call handoff."));
    await user.click(screen.getByRole("button", { name: "Mark call handoff complete" }));
    cleanup();
    render(<Contacts />);

    expect(screen.getByLabelText("Last email for Tiffany Hoskins: —")).toBeTruthy();
    expect(screen.getByLabelText("Last call for Tiffany Hoskins: Now")).toBeTruthy();
    expect(screen.getByLabelText("Last text for Tiffany Hoskins: —")).toBeTruthy();
  });

  it("renders the text cell as recently contacted after a confirmed contact-specific SMS flow", async () => {
    routing.search = "?channel=text&contactId=81&name=Tiffany%20Hoskins&phone=%2B12819022722";
    trpcMocks.configurationUseQuery.mockReturnValue({ data: { configured: true, dispatchEnabled: true, senderLabel: "+15551234567" } });
    const user = userEvent.setup();
    render(<Inbox />);
    fireEvent.change(screen.getByPlaceholderText("Write a clear, helpful text…"), { target: { value: "Your appointment is confirmed." } });
    await user.click(screen.getByRole("button", { name: "Review & send text" }));
    await user.click(screen.getByRole("button", { name: "Confirm & send text" }));
    cleanup();
    render(<Contacts />);

    expect(screen.getByLabelText("Last text for Tiffany Hoskins: Now")).toBeTruthy();
    expect(screen.getByLabelText("Last call for Tiffany Hoskins: —")).toBeTruthy();
    expect(screen.getByLabelText("Last email for Tiffany Hoskins: —")).toBeTruthy();
  });
});
