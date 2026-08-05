import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "/home/ubuntu/simply-saturn";
const authLayout = readFileSync(`${root}/client/src/components/auth/AuthLayout.tsx`, "utf8");
const login = readFileSync(`${root}/client/src/pages/Login.tsx`, "utf8");
const routes = readFileSync(`${root}/client/src/App.tsx`, "utf8");

describe("public authentication branding", () => {
  it("uses the sales-brand auth shell while retaining the login route and secure entry action", () => {
    expect(authLayout).toContain("ss-auth-shell");
    expect(authLayout).toContain("The CRM built for real estate teams");
    expect(authLayout).toContain("<BrandMark inverse");
    expect(login).toContain("startLogin()");
    expect(routes).toContain('path="/login"');
  });
});
