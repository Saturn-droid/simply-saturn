/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/auth/AuthLayout", () => ({ AuthLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("@/components/Seo", () => ({ Seo: () => null }));
const authMocks = vi.hoisted(() => ({ startLogin: vi.fn(), useSearch: vi.fn() }));
vi.mock("@/const", () => ({ startLogin: authMocks.startLogin }));
vi.mock("wouter", () => ({ Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>, useSearch: authMocks.useSearch }));

import Login from "../client/src/pages/Login";

afterEach(() => cleanup());
describe("login credential feedback", () => {
  it("explains an invalid-credentials callback while retaining the secure sign-in action", () => {
    authMocks.useSearch.mockReturnValue("error=invalid_credentials");
    render(<Login />);
    expect(screen.getByRole("alert").textContent).toMatch(/couldn't verify/i);
    fireEvent.click(screen.getByRole("button", { name: /continue to sign in/i }));
    expect(authMocks.startLogin).toHaveBeenCalledTimes(1);
  });
});
