import {
  validateCard,
  validateGoal,
  validateRecurring,
  validateShoppingItem,
  validateShortcut,
  validateTransaction
} from "../domain/validation";
import type { Card, CardDraft, Goal, GoalDraft, Recurring, RecurringDraft, ShoppingItem, ShoppingItemDraft, Transaction, TransactionDraft } from "../domain/types";
import type { FirebaseUserLike, FirestoreRefs } from "./firestorePaths";

type FirestoreWriteApi = {
  addDoc: (collectionRef: unknown, data: Record<string, unknown>) => Promise<{ id: string }>;
  updateDoc: (docRef: unknown, data: Record<string, unknown>) => Promise<void>;
  deleteDoc: (docRef: unknown) => Promise<void>;
};

type UserLike = FirebaseUserLike & {
  email?: string | null;
  displayName?: string | null;
};

type CreateFinanceRepositoryInput = {
  fs: FirestoreWriteApi;
  refs: FirestoreRefs;
};

type SaveTransactionInput = {
  form: TransactionDraft;
  editing?: Pick<Transaction, "_id"> | null;
  ruleCategory?: string | null;
  user?: UserLike | null;
  profileName?: string;
};

type SaveShortcutInput = {
  shortcut: TransactionDraft & { label?: string; _id?: string };
  editingShortcut?: { _id?: string } | null;
};

type CardPurchaseInput = {
  card: Card & { _id: string };
  desc: string;
  amount: number;
  installments: number;
  category: string;
  selMonth: number;
  selYear: number;
};

function withoutId<T extends { _id?: string }>(value: T): Omit<T, "_id"> {
  const { _id, ...data } = value;
  void _id;
  return data;
}

function requireId(entity: { _id?: string }, label: string): string {
  if (!entity._id) throw new Error(label + " sem identificador.");
  return entity._id;
}

function createFinanceRepository({ fs, refs }: CreateFinanceRepositoryInput) {
  return {
    async saveTransaction({ form, editing, ruleCategory, user, profileName }: SaveTransactionInput): Promise<string> {
      const formWithRule = validateTransaction(ruleCategory ? { ...form, category: ruleCategory } : form);
      if (editing?._id) {
        await fs.updateDoc(refs.ownerCollectionDoc("transactions", editing._id), withoutId(formWithRule));
        return editing._id;
      }
      const docRef = await fs.addDoc(refs.txCol(), {
        ...formWithRule,
        createdByUid: user?.uid || "",
        createdByEmail: user?.email || "",
        createdByName: profileName || user?.displayName || "Eu",
        createdAtMs: Date.now()
      });
      return docRef.id;
    },

    deleteTransaction(transaction: Pick<Transaction, "_id">) {
      return fs.deleteDoc(refs.ownerCollectionDoc("transactions", requireId(transaction, "Transacao")));
    },

    toggleTransactionPaid(transaction: Pick<Transaction, "_id" | "paid">) {
      return fs.updateDoc(refs.ownerCollectionDoc("transactions", requireId(transaction, "Transacao")), { paid: !transaction.paid });
    },

    createGoal(goal: GoalDraft) {
      return fs.addDoc(refs.goalCol(), validateGoal(goal));
    },

    updateGoalDeposit(goal: Pick<Goal, "_id" | "saved" | "target">, value: number) {
      return fs.updateDoc(refs.ownerCollectionDoc("goals", requireId(goal, "Meta")), {
        saved: Math.min(goal.saved + value, goal.target)
      });
    },

    deleteGoal(goal: Pick<Goal, "_id">) {
      return fs.deleteDoc(refs.ownerCollectionDoc("goals", requireId(goal, "Meta")));
    },

    async saveShortcut({ shortcut, editingShortcut }: SaveShortcutInput): Promise<string> {
      const validatedShortcut = validateShortcut(shortcut);
      if (editingShortcut?._id) {
        await fs.updateDoc(refs.ownerCollectionDoc("shortcuts", editingShortcut._id), withoutId(validatedShortcut));
        return editingShortcut._id;
      }
      const docRef = await fs.addDoc(refs.shortcutCol(), validatedShortcut);
      return docRef.id;
    },

    deleteShortcut(shortcut: { _id: string }) {
      return fs.deleteDoc(refs.ownerCollectionDoc("shortcuts", shortcut._id));
    },

    createRecurring(recurring: RecurringDraft) {
      return fs.addDoc(refs.recurringCol(), { ...validateRecurring(recurring), createdAtMs: Date.now() });
    },

    deleteRecurring(recurring: Pick<Recurring, "_id">) {
      return fs.deleteDoc(refs.ownerCollectionDoc("recurring", requireId(recurring, "Recorrencia")));
    },

    createCard(card: CardDraft) {
      return fs.addDoc(refs.cardCol(), { ...validateCard(card), createdAtMs: Date.now() });
    },

    deleteCard(card: Pick<Card, "_id">) {
      return fs.deleteDoc(refs.ownerCollectionDoc("cards", requireId(card, "Cartao")));
    },

    async createCardPurchase({ card, desc, amount, installments, category, selMonth, selYear }: CardPurchaseInput) {
      if (!Number.isFinite(Number(installments)) || Number(installments) < 1) throw new Error("Numero de parcelas invalido.");
      const per = Math.round((amount / installments) * 100) / 100;
      for (let i = 0; i < installments; i++) {
        const d = new Date(selYear, selMonth + i, card.dueDay || 10);
        const transactionDraft = {
          desc: installments > 1 ? desc + " (" + (i + 1) + "/" + installments + ")" : desc,
          amount: per,
          type: "expense",
          category,
          owner: "casal",
          date: d.toISOString().split("T")[0],
          paid: false
        } as const;
        await fs.addDoc(
          refs.txCol(),
          {
            ...validateTransaction(transactionDraft),
            cardId: card._id,
            cardName: card.name,
            installment: i + 1,
            installments
          }
        );
      }
    },

    addShoppingItem(item: ShoppingItemDraft) {
      return fs.addDoc(refs.shoppingCol(), { ...validateShoppingItem(item), createdAtMs: Date.now() });
    },

    toggleShoppingItem(item: Pick<ShoppingItem, "_id" | "done">) {
      return fs.updateDoc(refs.ownerCollectionDoc("shopping", requireId(item, "Item de compra")), { done: !item.done });
    },

    deleteShoppingItem(item: Pick<ShoppingItem, "_id">) {
      return fs.deleteDoc(refs.ownerCollectionDoc("shopping", requireId(item, "Item de compra")));
    }
  };
}

type FinanceRepository = ReturnType<typeof createFinanceRepository>;

export { createFinanceRepository };
export type { FinanceRepository };
