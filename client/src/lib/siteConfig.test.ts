import { describe, expect, it } from "vitest";
import { dashboardNavigation, landingCtas, publicNavigation } from "./siteConfig";

describe("Simply Saturn navigation configuration", () => {
  it("keeps the restored dark-CRM public navigation destinations stable", () => {
    expect(publicNavigation).toEqual([
      { label: "Solutions", href: "/product" },
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "About", href: "/about" },
      { label: "Book a Demo", href: "/contact" },
    ]);
  });

  it("uses the restored dark-CRM landing page CTA labels and destinations", () => {
    expect(landingCtas.map((cta) => cta.label)).toEqual(["Book a Demo", "Sign In to CRM"]);
    expect(landingCtas.map((cta) => cta.href)).toEqual(["/contact", "/login"]);
  });

  it("preserves the required authenticated sidebar order", () => {
    expect(dashboardNavigation.map((item) => item.label)).toEqual([
      "Dashboard",
      "Contacts",
      "Deals",
      "Calendar",
      "Tasks",
      "Documents",
      "Marketing",
      "Automations",
      "Reports",
      "Administration",
    ]);
  });
});
