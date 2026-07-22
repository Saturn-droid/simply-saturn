import { describe, expect, it } from "vitest";
import { dashboardNavigation, landingCtas, publicNavigation } from "./siteConfig";

describe("Simply Saturn navigation configuration", () => {
  it("keeps the public navigation destinations stable", () => {
    expect(publicNavigation).toEqual([
      { label: "Product", href: "/product" },
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Vision", href: "/about" },
    ]);
  });

  it("uses the exact required landing page CTA labels and destinations", () => {
    expect(landingCtas.map((cta) => cta.label)).toEqual(["Get Started", "Request Demo", "Sign In"]);
    expect(landingCtas.map((cta) => cta.href)).toEqual(["/signup", "/contact", "/login"]);
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
