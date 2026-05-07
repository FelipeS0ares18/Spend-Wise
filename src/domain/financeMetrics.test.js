import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildFinanceHealth, buildFinanceInsights } from "./financeMetrics";

describe("financeMetrics", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-05T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rewards positive balance and goal progress in the health score", () => {
    const health = buildFinanceHealth({
      income: 5000,
      expense: 3500,
      balance: 1500,
      pending: 0,
      monthTxs: [{ date: "2026-05-01", type: "income", paid: true }, { date: "2026-05-02", type: "expense", paid: true }, { date: "2026-05-03", type: "expense", paid: true }, { date: "2026-05-04", type: "expense", paid: true }],
      goals: [{ saved: 500, target: 1000 }],
      recurring: []
    });

    expect(health.score).toBeGreaterThanOrEqual(80);
    expect(health.label).toBe("Muito boa");
  });

  it("emits useful empty-state insight when there are no upcoming bills", () => {
    const insights = buildFinanceInsights({
      income: 0,
      expense: 0,
      balance: 0,
      monthTxs: [],
      recurring: [],
      goals: [],
      topCats: []
    });

    expect(insights[0].title).toBe("Nenhuma conta vencendo nos proximos 7 dias");
    expect(insights.some(item => item.title === "Adicione uma receita do mes")).toBe(true);
  });

  it("personalizes investment targets from onboarding answers", () => {
    const insights = buildFinanceInsights({
      income: 5000,
      expense: 4300,
      balance: 700,
      monthTxs: [],
      recurring: [],
      goals: [],
      topCats: [],
      onboardingAnswers: { mainGoal: "investir" }
    });

    expect(insights[0].title).toBe("Falta margem para investir");
    expect(insights[0].body).toContain("20%");
  });

  it("penalizes heavy card usage when the user reports installments", () => {
    const base = {
      income: 5000,
      expense: 3000,
      balance: 2000,
      pending: 0,
      monthTxs: [
        { desc: "cartao mercado", date: "2026-05-01", type: "expense", paid: true },
        { desc: "parcela celular", date: "2026-05-02", type: "expense", paid: true },
        { desc: "credito farmacia", date: "2026-05-03", type: "expense", paid: true },
        { desc: "salario", date: "2026-05-04", type: "income", paid: true }
      ],
      goals: [],
      recurring: []
    };

    const neutral = buildFinanceHealth(base);
    const cardProfile = buildFinanceHealth({ ...base, onboardingAnswers: { usesCards: "parcelas" } });

    expect(cardProfile.score).toBeLessThan(neutral.score);
  });
});
