import { describe, expect, it, vi } from "vitest";
import { CATS } from "../domain/constants";
import { createCategoryRulesRepository, guessCategory, matchCategoryRule, normalizeRuleText } from "./categoryRulesRepository";

describe("categoryRulesRepository", () => {
  it("normalizes accents and casing for rule matching", () => {
    expect(normalizeRuleText("  Alimentação  ")).toBe("alimentacao");
    expect(matchCategoryRule("Compra no MERCADO hoje", [{ term: "mercado", category: CATS[2], active: true }])).toBe(CATS[2]);
  });

  it("uses custom category rules before automatic guesses", () => {
    const rules = [{ term: "academia", category: CATS[4], active: true }];

    expect(guessCategory("academia mensal", "expense", rules)).toBe(CATS[4]);
  });

  it("persists and removes category rules through Firestore refs", async () => {
    const fs = {
      addDoc: vi.fn(async () => ({ id: "rule-1" })),
      deleteDoc: vi.fn(async () => {})
    };
    const refs = {
      categoryRuleCol: vi.fn(() => "categoryRulesRef"),
      ownerCollectionDoc: vi.fn((collection, id) => `${collection}/${id}`)
    };
    const repo = createCategoryRulesRepository({ fs, refs });

    const saved = await repo.saveRule({ term: "Mercado", category: CATS[2] });
    await repo.deleteRule(saved);

    expect(fs.addDoc).toHaveBeenCalledWith("categoryRulesRef", expect.objectContaining({ term: "mercado", category: CATS[2] }));
    expect(fs.deleteDoc).toHaveBeenCalledWith("categoryRules/rule-1");
  });
});
