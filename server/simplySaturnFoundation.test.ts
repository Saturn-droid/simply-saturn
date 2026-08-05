import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { dashboardNavigation, landingCtas, publicNavigation } from "../client/src/lib/siteConfig";

const clientSource = (relativePath: string) =>
  readFile(path.resolve(import.meta.dirname, "../client/src", relativePath), "utf8");

describe("Simply Saturn product foundation", () => {
  it("preserves the restored dark-CRM landing CTAs and destinations", () => {
    expect(landingCtas.map((cta) => cta.label)).toEqual(["Book a Demo", "Sign In to CRM"]);
    expect(landingCtas.map((cta) => cta.href)).toEqual(["/contact", "/login"]);
  });

  it("preserves the required sidebar navigation order", () => {
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

  it("keeps the restored dark-CRM public navigation routes available", () => {
    expect(publicNavigation.map((item) => item.label)).toEqual(["Solutions", "Features", "Pricing", "About", "Book a Demo"]);
    expect(publicNavigation.map((item) => item.href)).toEqual(["/product", "/features", "/pricing", "/about", "/contact"]);
  });

  it("wires the public, access-flow, and workspace destinations into the application router", async () => {
    const app = await readFile(path.resolve(import.meta.dirname, "../client/src/App.tsx"), "utf8");

    [
      "/",
      "/product",
      "/features",
      "/pricing",
      "/about",
      "/contact",
      "/login",
      "/signup",
      "/invite",
      "/forgot-password",
      "/app",
      "/app/inbox",
    ].forEach((route) => expect(app).toContain(`path="${route}"`));

    expect(app.indexOf('path="/app/inbox"')).toBeLessThan(app.indexOf('path="/app"'));
  });

  it("keeps every sales page in the shared marketing shell rather than the authenticated workspace shell", async () => {
    const pages = ["Home", "Product", "Features", "Pricing", "About", "Contact"];
    const sources = await Promise.all(pages.map((page) => clientSource(`pages/${page}.tsx`)));

    sources.forEach((source) => {
      expect(source).toContain('import { MarketingLayout } from "@/components/marketing/MarketingLayout"');
      expect(source).toContain("<MarketingLayout>");
      expect(source).not.toContain("<DashboardLayout");
    });
  });

  it("preserves the reference-aligned dark CRM hero and shared navigation hooks", async () => {
    const [home, header, styles] = await Promise.all([
      clientSource("pages/Home.tsx"),
      clientSource("components/marketing/SiteHeader.tsx"),
      clientSource("index.css"),
    ]);

    expect(home).toContain('className="ssm-hero"');
    expect(home).toContain('className="ssm-wave"');
    expect(home).toContain("Now with AI-powered contact intelligence");
    expect(header).toContain('className="ssm-header"');
    expect(header).toContain('className="ssm-signin-pill"');
    expect(styles).toContain(".ssm-hero, .ssm-page-hero");
    expect(styles).toContain("#10d8c7");
    expect(styles).toContain(".ssm-wave");
  });

  it("keeps the Solutions control as a usable menu of clickable solution destinations", async () => {
    const header = await clientSource("components/marketing/SiteHeader.tsx");

    expect(header).toContain("ssm-solutions-panel");
    expect(header).toContain('role="menuitem"');
    expect(header).toContain('href: "/product#relationship-intelligence"');
    expect(header).toContain('href: "/product#team-execution"');
    const styles = await clientSource("index.css");
    expect(styles).toContain(".ssm-solutions-panel { position: absolute; z-index: 60");
    expect(styles).toContain("pointer-events: auto");
  });

  it("keeps the demo, sign-in, onboarding, invite, and recovery foundations accessible and clearly staged", async () => {
    const [contact, login, signUp, invite, recovery] = await Promise.all([
      clientSource("pages/Contact.tsx"),
      clientSource("pages/Login.tsx"),
      clientSource("pages/SignUp.tsx"),
      clientSource("pages/Invite.tsx"),
      clientSource("pages/ForgotPassword.tsx"),
    ]);

    expect(contact).toContain("<form onSubmit={(event) =>");
    expect(contact).toContain("type=\"email\"");
    expect(contact).toContain("required");
    expect(contact).toContain("PROTOTYPE FORM");
    expect(login).toContain("Need account help?");
    expect(login).toContain("Create an organization");
    expect(login).toContain("Accept an invite");
    expect(login).toContain("role-based access");
    expect(signUp).toContain("Step {step} of 2");
    expect(signUp).toContain("Organization name");
    expect(signUp).toContain("Organization type");
    expect(invite).toContain("Accept invite");
    expect(recovery).toContain("Request reset link");
  });

  it("applies the shared SEO component to every required public page", async () => {
    const pages = ["Home", "Product", "Features", "Pricing", "About", "Contact"];
    const sources = await Promise.all(pages.map((page) => clientSource(`pages/${page}.tsx`)));

    sources.forEach((source) => {
      expect(source).toContain('import { Seo } from "@/components/Seo"');
      expect(source).toMatch(/<Seo\s+title=/);
    });
  });

  it("declares a reduced-motion safety override for animation and transitions", async () => {
    const styles = await readFile(path.resolve(import.meta.dirname, "../client/src/index.css"), "utf8");

    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain("animation-duration: 0.01ms !important");
    expect(styles).toContain("transition-duration: 0.01ms !important");
  });

  it("preserves baseline keyboard-focus styling in the global design system", async () => {
    const styles = await readFile(path.resolve(import.meta.dirname, "../client/src/index.css"), "utf8");

    expect(styles).toContain("outline-ring/50");
    expect(styles).toContain("box-shadow: 0 0 0 3px rgba(75, 116, 169, 0.14)");
  });
});
