import { CATS } from "./constants";
import type { Card, CardDraft, CategoryRule, Goal, GoalDraft, Recurring, RecurringDraft, ShoppingItem, ShoppingItemDraft, Transaction, TransactionDraft, TransactionType } from "./types";

function isValidDate(value: unknown): value is string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
  const d = new Date(String(value) + "T12:00:00");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function positiveNumber(value: unknown): boolean {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

function assertFinanceData(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function isTransactionType(value: unknown): value is TransactionType {
  return value === "income" || value === "expense";
}

function isKnownCategory(value: string): boolean {
  return (CATS as readonly string[]).includes(value);
}

function validateTransaction(tx: TransactionDraft): Transaction {
  const desc = (tx.desc || "").trim();
  const category = tx.category || "Outros";
  const owner = tx.owner || "";
  assertFinanceData(desc, "Informe a descricao.");
  assertFinanceData(positiveNumber(tx.amount), "Informe um valor valido.");
  assertFinanceData(isTransactionType(tx.type), "Tipo de transacao invalido.");
  assertFinanceData(isKnownCategory(category), "Categoria invalida.");
  assertFinanceData(owner.trim(), "Informe o responsavel.");
  assertFinanceData(isValidDate(tx.date), "Data invalida.");
  return { ...tx, desc, amount: Number(tx.amount), type: tx.type, category, owner, date: tx.date, paid: !!tx.paid };
}

function validateGoal(goal: GoalDraft): Goal {
  const name = (goal.name || "").trim();
  assertFinanceData(name, "Informe o nome da meta.");
  assertFinanceData(positiveNumber(goal.target), "Informe um valor alvo valido.");
  return { ...goal, name, target: Number(goal.target), saved: Number(goal.saved || 0) };
}

function validateShortcut<T extends TransactionDraft & { label?: string }>(shortcut: T): T & Transaction & { label: string } {
  const tx = validateTransaction({
    ...shortcut,
    date: shortcut.date || new Date().toISOString().slice(0, 10)
  });
  return { ...shortcut, ...tx, label: (shortcut.label || shortcut.desc || "").trim() };
}

function validateRecurring(recurring: RecurringDraft): Recurring {
  const desc = (recurring.desc || "").trim();
  const category = recurring.category || "Outros";
  const type = recurring.type || "expense";
  assertFinanceData(desc, "Informe a descricao.");
  assertFinanceData(positiveNumber(recurring.amount), "Informe um valor valido.");
  assertFinanceData(Number(recurring.day) >= 1 && Number(recurring.day) <= 31, "Dia de vencimento invalido.");
  assertFinanceData(isTransactionType(type), "Tipo de recorrencia invalido.");
  assertFinanceData(isKnownCategory(category), "Categoria invalida.");
  return { ...recurring, desc, amount: Number(recurring.amount), type, day: Number(recurring.day), category };
}

function validateCard(card: CardDraft): Card {
  const name = (card.name || "").trim();
  assertFinanceData(name, "Informe o nome do cartao.");
  assertFinanceData(positiveNumber(card.limit), "Informe um limite valido.");
  assertFinanceData(Number(card.dueDay) >= 1 && Number(card.dueDay) <= 31, "Dia de vencimento invalido.");
  return { ...card, name, limit: Number(card.limit), dueDay: Number(card.dueDay) };
}

function validateShoppingItem(item: ShoppingItemDraft): ShoppingItem {
  const name = (item.name || "").trim();
  assertFinanceData(name, "Informe o item.");
  assertFinanceData(positiveNumber(item.qty || 1), "Informe uma quantidade valida.");
  return { ...item, name, qty: Number(item.qty || 1) };
}

function validateCategoryRule(rule: Partial<CategoryRule>): CategoryRule {
  const term = (rule.term || "").trim().toLowerCase();
  const category = rule.category || "";
  assertFinanceData(term, "Informe o termo da regra.");
  assertFinanceData(isKnownCategory(category), "Categoria invalida.");
  return { ...rule, term, category, active: rule.active !== false };
}

export {
  isValidDate,
  positiveNumber,
  validateCard,
  validateCategoryRule,
  validateGoal,
  validateRecurring,
  validateShoppingItem,
  validateShortcut,
  validateTransaction
};
