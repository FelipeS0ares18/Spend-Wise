// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useGlobalSearch } from "./useGlobalSearch";
import { usePeriodSelection } from "./usePeriodSelection";
import { useTransactionFilters } from "./useTransactionFilters";

const fmt = value => "R$ " + Number(value).toFixed(2);

describe("finance hooks", () => {
  it("selects current month and navigates available transaction months", () => {
    const txs = [
      { date: "2026-05-05", amount: 10 },
      { date: "2026-04-10", amount: 20 }
    ];
    const { result } = renderHook(() => usePeriodSelection(txs, new Date("2026-05-05T12:00:00")));

    expect(result.current.monthTxs).toHaveLength(1);
    expect(result.current.monthTxs[0].amount).toBe(10);

    act(() => result.current.goMonth(1));

    expect(result.current.selMonth).toBe(3);
    expect(result.current.monthTxs[0].amount).toBe(20);
  });

  it("filters monthly transactions by owner and type", () => {
    const txs = [
      { owner: "casal", type: "expense", date: "2026-05-05" },
      { owner: "u1", type: "income", date: "2026-05-06" }
    ];
    const { result } = renderHook(() => useTransactionFilters(txs));

    act(() => result.current.setFOwner("me"));
    act(() => result.current.setFType("income"));

    expect(result.current.filtTxs).toEqual([{ owner: "u1", type: "income", date: "2026-05-06" }]);
  });

  it("searches across active finance entities", () => {
    const { result } = renderHook(() =>
      useGlobalSearch({
        txs: [{ desc: "Mercado", category: "Outros", amount: 80, date: "2026-05-05", owner: "casal", type: "expense" }],
        goals: [],
        recurring: [],
        cards: [],
        shopping: [],
        shortcuts: [],
        fmt
      })
    );

    act(() => result.current.setGlobalSearch("mercado"));

    expect(result.current.searchResults).toMatchObject([{ kind: "Lancamento", title: "Mercado", view: "transactions" }]);
  });
});
