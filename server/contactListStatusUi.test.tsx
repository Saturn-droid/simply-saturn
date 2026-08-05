/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/ContactQuickActions", () => ({ ContactQuickActions: () => <div>Quick contact controls</div> }));

import { ContactListTable } from "../client/src/components/ContactListTable";

afterEach(() => cleanup());

const contact = {
  id: 7,
  displayName: "Tiffany Hoskins",
  email: "tiffany@example.com",
  phone: "+12819022722",
  types: ["seller"],
  status: "prospect",
  dealCount: 2,
  lastTextAt: null,
  lastCallAt: null,
  lastEmailAt: null,
};

describe("controlled Contacts status field", () => {
  it("keeps a custom saved label visible and clears it immediately on removal", () => {
    const onStatusChange = vi.fn();
    render(<ContactListTable contacts={[contact]} onOpenContact={vi.fn()} onStatusChange={onStatusChange} />);
    const input = screen.getByLabelText("Update status for Tiffany Hoskins") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Nurture next quarter" } });
    fireEvent.blur(input);
    expect(onStatusChange).toHaveBeenCalledWith(7, "Nurture next quarter");
    expect(input.value).toBe("Nurture next quarter");
    fireEvent.click(screen.getByRole("button", { name: "Remove Tiffany Hoskins status" }));
    expect(onStatusChange).toHaveBeenLastCalledWith(7, null);
    expect(input.value).toBe("");
  });
});
