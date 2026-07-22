import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("client root mount", () => {
  it("creates at most one React root and reuses it when startup code is re-evaluated", async () => {
    const source = await readFile(path.resolve(import.meta.dirname, "../client/src/main.tsx"), "utf8");

    expect(source.match(/createRoot\(/g)).toHaveLength(1);
    expect(source).toContain("window.__SIMPLY_SATURN_REACT_ROOT__ ?? createRoot(rootElement)");
    expect(source).toContain("window.__SIMPLY_SATURN_REACT_ROOT__ = root");
    expect(source).toContain("root.render(");
  });
});
