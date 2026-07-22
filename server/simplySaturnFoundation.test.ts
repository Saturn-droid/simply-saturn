import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { dashboardNavigation, landingCtas, publicNavigation } from "../client/src/lib/siteConfig";

const clientSource = (relativePath: string) =>
  readFile(path.resolve(import.meta.dirname, "../client/src", relativePath), "utf8");

describe("Simply Saturn product foundation", () => {
  it("preserves the exact required landing CTAs and destinations", () => {
    expect(landingCtas.map((cta) => cta.label)).toEqual(["Get Started", "Request Demo", "Sign In"]);
    expect(landingCtas.map((cta) => cta.href)).toEqual(["/signup", "/contact", "/login"]);
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

  it("keeps the approved public navigation routes available", () => {
    expect(publicNavigation.map((item) => item.href)).toEqual(["/product", "/features", "/pricing", "/about"]);
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
    ].forEach((route) => expect(app).toContain(`path="${route}"`));
  });

  it("keeps the demo, sign-in, onboarding, invite, and recovery foundations accessible and clearly staged", async () => {
    const [contact, login, signUp, invite, recovery] = await Promise.all([
      clientSource("pages/Contact.tsx"),
      clientSource("pages/Login.tsx"),
      clientSource("pages/SignUp.tsx"),
      clientSource("pages/Invite.tsx"),
      clientSource("pages/ForgotPassword.tsx"),
    ]);

    expect(contact).toContain("<form onSubmit={submitRequest}");
    expect(contact).toContain("type=\"email\"");
    expect(contact).toContain("required");
    expect(contact).toContain("Prototype form");
    expect(login).toContain("Forgot password?");
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
    expect(styles).toContain("box-shadow: 0 0 0 3px rgba(80, 65, 111, 0.12)");
  });
});
