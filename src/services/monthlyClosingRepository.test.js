import { describe, expect, it, vi } from "vitest";
import { createMonthlyClosingRepository } from "./monthlyClosingRepository";

describe("monthlyClosingRepository", () => {
  it("saves monthly closing summaries with category and goal percentages", async () => {
    const fs = { setDoc: vi.fn(async () => {}), deleteDoc: vi.fn(async () => {}) };
    const refs = { ownerCollectionDoc: vi.fn((collection, id) => `${collection}/${id}`) };
    const repo = createMonthlyClosingRepository({ fs, refs, pct: (a, b) => (b ? Math.round((a / b) * 100) : 0) });

    await repo.closeMonth({
      monthKey: "2026-05",
      month: 4,
      year: 2026,
      income: 1000,
      expense: 400,
      balance: 600,
      pending: 1,
      monthTxs: [{ _id: "1" }, { _id: "2" }],
      topCats: [["Alimentacao", 200]],
      goals: [{ name: "Reserva", target: 1000, saved: 250, color: "#fff" }]
    });

    expect(fs.setDoc).toHaveBeenCalledWith(
      "monthlyClosings/2026-05",
      expect.objectContaining({
        monthKey: "2026-05",
        transactionsCount: 2,
        categories: [{ category: "Alimentacao", value: 200, percent: 50 }],
        goals: [expect.objectContaining({ name: "Reserva", percent: 25 })]
      }),
      { merge: true }
    );
  });
});
