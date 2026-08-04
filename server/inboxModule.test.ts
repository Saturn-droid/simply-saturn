import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectFile = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("Inbox/Text module foundation", () => {
  it("wires a dedicated workspace route and requires an explicit review-and-send confirmation gate", () => {
    const app = projectFile("client/src/App.tsx");
    const inbox = projectFile("client/src/pages/Inbox.tsx");
    const router = projectFile("server/routers.ts");

    expect(app).toContain('path="/app/inbox"');
    expect(inbox).toContain("confirmLiveSend: true");
    expect(inbox).toContain("<Dialog open={confirmationOpen}");
    expect(inbox).toContain("Confirm & send text");
    expect(inbox).toContain("Final review");
    expect(router).toContain("sms: router");
    expect(router).toContain("confirmLiveSend: z.literal(true)");
  });

  it("uses accessible native compose controls with contextual recipient help", () => {
    const inbox = projectFile("client/src/pages/Inbox.tsx");

    expect(inbox).toContain("{conversations.map((conversation) => <button");
    expect(inbox).toContain('key={conversation.id} type="button"');
    expect(inbox).toContain("<form className=\"mt-6 space-y-4\" onSubmit={submitMessage}>");
    expect(inbox).toContain('inputMode="tel"');
    expect(inbox).toContain('aria-describedby="recipient-help"');
    expect(inbox).toContain('id="recipient-help"');
    expect(inbox).toContain("<Textarea value={body}");
    expect(inbox).toContain('type="submit"');
  });
});
