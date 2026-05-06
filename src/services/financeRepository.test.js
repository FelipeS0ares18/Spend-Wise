import { describe, expect, it, vi } from "vitest";
import { createFinanceRepository } from "./financeRepository";

function makeRepo() {
  const fs = {
    addDoc: vi.fn(async () => ({ id: "new-id" })),
    updateDoc: vi.fn(async () => {}),
    deleteDoc: vi.fn(async () => {})
  };
  const refs = {
    txCol: vi.fn(() => "transactionsRef"),
    goalCol: vi.fn(() => "goalsRef"),
    shortcutCol: vi.fn(() => "shortcutsRef"),
    recurringCol: vi.fn(() => "recurringRef"),
    cardCol: vi.fn(() => "cardsRef"),
    shoppingCol: vi.fn(() => "shoppingRef"),
    ownerCollectionDoc: vi.fn((collection, id) => `${collection}/${id}`)
  };
  return { fs, refs, repo: createFinanceRepository({ fs, refs }) };
}

describe("financeRepository", () => {
  it("creates transactions with creator metadata and rule category", async () => {
    const { fs, repo } = makeRepo();

    await repo.saveTransaction({
      form: { desc: "Mercado", amount: 89.9, type: "expense", category: "Outros", owner: "casal", date: "2026-05-05" },
      ruleCategory: "Outros",
      user: { uid: "u1", email: "u@test.com", displayName: "Felipe" },
      profileName: "Felipe Soares"
    });

    expect(fs.addDoc).toHaveBeenCalledWith(
      "transactionsRef",
      expect.objectContaining({
        desc: "Mercado",
        category: "Outros",
        createdByUid: "u1",
        createdByEmail: "u@test.com",
        createdByName: "Felipe Soares"
      })
    );
  });

  it("updates existing transactions without the _id payload", async () => {
    const { fs, repo } = makeRepo();

    await repo.saveTransaction({
      form: { _id: "tx-1", desc: "Editada", amount: 20, type: "expense", category: "Outros", owner: "casal", date: "2026-05-05" },
      editing: { _id: "tx-1" },
      user: { uid: "u1" }
    });

    expect(fs.updateDoc).toHaveBeenCalledWith("transactions/tx-1", { desc: "Editada", amount: 20, type: "expense", category: "Outros", owner: "casal", date: "2026-05-05", paid: false });
  });

  it("rejects invalid transactions before writing", async () => {
    const { fs, repo } = makeRepo();

    await expect(
      repo.saveTransaction({
        form: { desc: "Sem valor", amount: 0, type: "expense", category: "Outros", owner: "casal", date: "2026-05-05" },
        user: { uid: "u1" }
      })
    ).rejects.toThrow("valor valido");

    expect(fs.addDoc).not.toHaveBeenCalled();
  });

  it("splits card purchases into monthly installments", async () => {
    const { fs, repo } = makeRepo();

    await repo.createCardPurchase({ card: { _id: "card-1", name: "Nubank", dueDay: 10 }, desc: "Notebook", amount: 300, installments: 3, category: "Outros", selMonth: 4, selYear: 2026 });

    expect(fs.addDoc).toHaveBeenCalledTimes(3);
    expect(fs.addDoc.mock.calls[0][1]).toMatchObject({ desc: "Notebook (1/3)", amount: 100, date: "2026-05-10", installment: 1 });
    expect(fs.addDoc.mock.calls[2][1]).toMatchObject({ desc: "Notebook (3/3)", amount: 100, date: "2026-07-10", installment: 3 });
  });
});
