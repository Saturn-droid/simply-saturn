import { beforeEach, describe, expect, it, vi } from "vitest";

const tasksDb = vi.hoisted(() => ({ createCrmTask: vi.fn(), listCrmTasks: vi.fn(), setCrmTaskStatus: vi.fn() }));
vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, ...tasksDb };
});
import { appRouter } from "./routers";

const owner = { id: 41, openId: "tasks-owner", name: "Task Owner", email: "owner@example.com", loginMethod: null, role: "admin" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
function caller() { return appRouter.createCaller({ user: owner } as never); }

describe("Tasks runtime contract", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    tasksDb.listCrmTasks.mockResolvedValue([{ id: 301, ownerUserId: 41, contactId: 81, contactName: "Tiffany Hoskins", dealId: 91, dealTitle: "Main Street listing", title: "Confirm disclosures", notes: null, dueAt: new Date("2026-08-12T12:00:00Z"), priority: "high", status: "open", completedAt: null, createdAt: new Date(), updatedAt: new Date() }]);
    tasksDb.createCrmTask.mockImplementation(async (input: unknown) => ({ id: 301, ...input as object, contactName: "Tiffany Hoskins", dealTitle: "Main Street listing", notes: null, status: "open", completedAt: null, createdAt: new Date(), updatedAt: new Date() }));
    tasksDb.setCrmTaskStatus.mockImplementation(async (input: { taskId: number; status: string }) => ({ id: input.taskId, ownerUserId: 41, contactId: 81, contactName: "Tiffany Hoskins", dealId: 91, dealTitle: "Main Street listing", title: "Confirm disclosures", notes: null, dueAt: null, priority: "high", status: input.status, completedAt: input.status === "completed" ? new Date() : null, createdAt: new Date(), updatedAt: new Date() }));
  });
  it("creates an owner-scoped task with optional contact and deal context", async () => {
    const task = await caller().tasks.create({ title: "Confirm disclosures", contactId: 81, dealId: 91, priority: "high" });
    expect(tasksDb.createCrmTask).toHaveBeenCalledWith(expect.objectContaining({ ownerUserId: 41, contactId: 81, dealId: 91, priority: "high" }));
    expect(task).toMatchObject({ contactName: "Tiffany Hoskins", dealTitle: "Main Street listing" });
  });
  it("lists a scoped task list and records a controlled completion", async () => {
    const listed = await caller().tasks.list();
    const completed = await caller().tasks.setStatus({ taskId: 301, status: "completed" });
    expect(tasksDb.listCrmTasks).toHaveBeenCalledWith(41);
    expect(listed[0]).toMatchObject({ title: "Confirm disclosures", status: "open" });
    expect(tasksDb.setCrmTaskStatus).toHaveBeenCalledWith({ ownerUserId: 41, taskId: 301, status: "completed" });
    expect(completed).toMatchObject({ status: "completed" });
  });
});
