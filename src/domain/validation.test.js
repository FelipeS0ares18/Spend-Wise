import { describe, expect, it } from "vitest";
import { validateCard, validateCategoryRule, validateGoal, validateTransaction } from "./validation";

describe("finance data validation", () => {
  it("normalizes valid transactions", () => {
    expect(
      validateTransaction({
        desc: " Mercado ",
        amount: "89.90",
        type: "expense",
        category: "Outros",
        owner: "casal",
        date: "2026-05-05"
      })
    ).toMatchObject({ desc: "Mercado", amount: 89.9 });
  });

  it("rejects invalid transaction dates", () => {
    expect(() =>
      validateTransaction({
        desc: "Mercado",
        amount: 89.9,
        type: "expense",
        category: "Outros",
        owner: "casal",
        date: "2026-02-31"
      })
    ).toThrow("Data invalida");
  });

  it("validates goals and cards before persistence", () => {
    expect(validateGoal({ name: "Reserva", target: "1000" })).toMatchObject({ name: "Reserva", target: 1000 });
    expect(() => validateCard({ name: "Cartao", limit: 0, dueDay: 10 })).toThrow("limite valido");
  });

  it("validates category rules before persistence", () => {
    expect(validateCategoryRule({ term: " Mercado ", category: "Outros" })).toMatchObject({ term: "mercado", active: true });
    expect(() => validateCategoryRule({ term: "Mercado", category: "Inexistente" })).toThrow("Categoria invalida");
  });
});
