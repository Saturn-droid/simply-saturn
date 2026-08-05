import { describe, expect, it } from "vitest";
import { contactActionHref, contactStatusLabels, relativeContactTime } from "./contactUtils";

const contact = {
  id: 81,
  displayName: "Tiffany Hoskins",
  email: "tiffany@example.com",
  phone: "+12819022722",
  types: ["seller"],
  status: "prospect" as const,
  dealCount: 1,
  lastTextAt: null,
  lastCallAt: null,
  lastEmailAt: null,
};

describe("contact quick-action helpers", () => {
  it("builds a text handoff that carries the selected contact and destination", () => {
    expect(contactActionHref(contact, "text")).toContain("/app/inbox?channel=text");
    expect(contactActionHref(contact, "text")).toContain("contactId=81");
    expect(contactActionHref(contact, "text")).toContain("phone=%2B12819022722");
  });

  it("keeps the required forever-client label and formats missing activity consistently", () => {
    expect(contactStatusLabels.forever_client).toBe("Forever Client");
    expect(relativeContactTime(null)).toBe("—");
  });
});
