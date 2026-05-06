import type { Goal, Transaction } from "../domain/types";

type MonthlyClosingFirestoreApi = {
  deleteDoc: (docRef: unknown) => Promise<void>;
  setDoc: (docRef: unknown, data: Record<string, unknown>, options?: { merge?: boolean }) => Promise<void>;
};

type MonthlyClosingRefs = {
  ownerCollectionDoc: (collection: string, id: string) => unknown;
};

type MonthlyClosing = {
  _id?: string;
};

type TopCategory = [string, number];

type CloseMonthPayload = {
  monthKey: string;
  month: number;
  year: number;
  income: number;
  expense: number;
  balance: number;
  pending: number;
  monthTxs: Transaction[];
  topCats: TopCategory[];
  goals: Goal[];
};

function createMonthlyClosingRepository({
  fs,
  refs,
  pct
}: {
  fs: MonthlyClosingFirestoreApi;
  refs: MonthlyClosingRefs;
  pct: (value: number, total: number) => number;
}) {
  return {
    reopenClosing(closing: MonthlyClosing) {
      if (!closing._id) throw new Error("Fechamento sem identificador.");
      return fs.deleteDoc(refs.ownerCollectionDoc("monthlyClosings", closing._id));
    },

    closeMonth({ monthKey, month, year, income, expense, balance, pending, monthTxs, topCats, goals }: CloseMonthPayload) {
      return fs.setDoc(
        refs.ownerCollectionDoc("monthlyClosings", monthKey),
        {
          monthKey,
          month,
          year,
          income,
          expense,
          balance,
          pending,
          transactionsCount: monthTxs.length,
          categories: topCats.map(([category, value]) => ({ category, value, percent: pct(value, expense) })),
          goals: goals.map(goal => ({
            name: goal.name,
            target: goal.target,
            saved: goal.saved,
            color: goal.color,
            percent: pct(goal.saved, goal.target)
          })),
          closedAtMs: Date.now(),
          closedAtText: new Date().toLocaleString("pt-BR")
        },
        { merge: true }
      );
    }
  };
}

export { createMonthlyClosingRepository };
