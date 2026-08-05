import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const project = process.cwd();
const read = (path: string) => readFileSync(resolve(project, path), "utf8");

describe("contacts module contract", () => {
  it("wires dedicated contacts list and detail routes", () => {
    const app = read("client/src/App.tsx");
    const shell = read("client/src/components/DashboardLayout.tsx");

    expect(app).toContain('path="/app/contacts/:contactId"');
    expect(app).toContain('path="/app/contacts"');
    expect(shell).toContain('href: "/app/contacts"');
  });

  it("renders the requested operational columns and omits a relationship filter", () => {
    const contacts = read("client/src/pages/Contacts.tsx");
    const table = read("client/src/components/ContactListTable.tsx");

    expect(table).toContain(">Contact info<");
    expect(table).toContain(">Type(s)<");
    expect(table).toContain(">Deals<");
    expect(table).toContain(">Last contact<");
    expect(table).toContain(">Status<");
    expect(contacts).toContain("All statuses");
    expect(contacts).not.toContain("relationship filter");
  });

  it("exposes optional removable ISA statuses and quick contact actions", () => {
    const contacts = read("client/src/pages/Contacts.tsx");
    const table = read("client/src/components/ContactListTable.tsx");
    const detail = read("client/src/pages/ContactDetail.tsx");
    const actions = read("client/src/components/ContactQuickActions.tsx");
    const utils = read("client/src/lib/contactUtils.ts");

    expect(utils).toContain("forever_client");
    expect(table).toContain("Remove ${contact.displayName} status");
    expect(detail).toContain("Remove status");
    expect(actions).toContain("contactActionHref");
    expect(actions).toContain("Call ${contact.displayName}");
    expect(actions).toContain("Text ${contact.displayName}");
    expect(actions).toContain("Email ${contact.displayName}");
  });

  it("opens existing text threads or routed email and call handoffs in Inbox", () => {
    const inbox = read("client/src/pages/Inbox.tsx");

    expect(inbox).toContain('channel !== "text" && channel !== "email" && channel !== "call"');
    expect(inbox).toContain("conversations.find((conversation) => conversation.contactPhone === contactHandoff.phone)");
    expect(inbox).toContain("Open email composer");
    expect(inbox).toContain("Open phone dialer");
    expect(inbox).toContain('channel: "email"');
    expect(inbox).toContain('channel: "call"');
    expect(inbox).toContain("contactActivityMutation.mutate");
    expect(inbox).toContain("contactId: contactHandoff?.channel === \"text\" ? routedContactId : undefined");
  });
});
