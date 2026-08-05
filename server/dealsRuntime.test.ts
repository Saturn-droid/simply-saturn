import { beforeEach, describe, expect, it, vi } from "vitest";

const dealsDb = vi.hoisted(() => ({
  createCrmDeal: vi.fn(),
  listCrmDeals: vi.fn(),
  updateCrmDealStage: vi.fn(),
}));

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, ...dealsDb };
});

import { appRouter } from "./routers";

const owner = { id: 41, openId: "deals-owner", name: "Pipeline Owner", email: "owner@example.com", loginMethod: null, role: "admin" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
function caller() { return appRouter.createCaller({ user: owner } as never); }

describe("Deals runtime contract", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    dealsDb.listCrmDeals.mockResolvedValue([{ id: 91, ownerUserId: 41, contactId: 81, contactName: "Tiffany Hoskins", contactEmail: "tiffany@example.com", title: "Main Street listing", propertyAddress: "123 Main Street", stage: "lead", estimatedValueCents: 50000000, targetCloseAt: null, createdAt: new Date(), updatedAt: new Date() }]);
    dealsDb.createCrmDeal.mockImplementation(async (input: unknown) => ({ id: 91, ...input as object, contactName: "Tiffany Hoskins", contactEmail: "tiffany@example.com", propertyAddress: "123 Main Street", createdAt: new Date(), updatedAt: new Date() }));
    dealsDb.updateCrmDealStage.mockImplementation(async (input: { dealId: number; stage: string }) => ({ id: input.dealId, ownerUserId: 41, contactId: 81, contactName: "Tiffany Hoskins", contactEmail: "tiffany@example.com", title: "Main Street listing", propertyAddress: "123 Main Street", stage: input.stage, estimatedValueCents: 50000000, targetCloseAt: null, createdAt: new Date(), updatedAt: new Date() }));
  });

  it("creates an owner-scoped deal tied to a saved contact", async () => {
    const created = await caller().deals.create({ contactId: 81, title: "Main Street listing", propertyAddress: "123 Main Street", stage: "lead", estimatedValueCents: 50000000 });
    expect(dealsDb.createCrmDeal).toHaveBeenCalledWith(expect.objectContaining({ ownerUserId: 41, contactId: 81, stage: "lead", estimatedValueCents: 50000000 }));
    expect(created).toMatchObject({ contactId: 81, contactName: "Tiffany Hoskins" });
  });

  it("lists only the current owner’s pipeline and supports controlled stage changes", async () => {
    const listed = await caller().deals.list();
    const updated = await caller().deals.updateStage({ dealId: 91, stage: "under_contract" });
    expect(dealsDb.listCrmDeals).toHaveBeenCalledWith(41);
    expect(listed[0]).toMatchObject({ title: "Main Street listing", stage: "lead" });
    expect(dealsDb.updateCrmDealStage).toHaveBeenCalledWith({ ownerUserId: 41, dealId: 91, stage: "under_contract" });
    expect(updated).toMatchObject({ id: 91, stage: "under_contract" });
  });
});
