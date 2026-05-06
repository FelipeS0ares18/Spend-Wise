import type { Transaction } from "./types";

type TransactionStatus = {
  label: string;
  color: string;
};

type CreatorInfo = {
  name: string;
  initials: string;
};

type CreatorTransaction = Partial<Transaction> & {
  createdByName?: string;
  createdByEmail?: string;
};

function txStatus(t: Pick<Transaction, "date" | "paid" | "type">): TransactionStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = t.date ? new Date(t.date + "T12:00:00") : null;
  const overdue = !t.paid && t.type === "expense" && due && due < today;
  if (t.paid) return { label: t.type === "income" ? "Recebido" : "Pago", color: "#6EE7B7" };
  if (overdue) return { label: "Vencido", color: "#F87171" };
  if (due && due > today) return { label: "Previsto", color: "#93C5FD" };
  return { label: "Pendente", color: "#FCD34D" };
}

function initialsFrom(v?: string): string {
  const raw = (v || "Eu").trim();
  const clean = raw.includes("@") ? raw.split("@")[0].replace(/[._-]+/g, " ") : raw;
  const parts = clean.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "E";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
}

function creatorInfo(t: CreatorTransaction, fallbackName?: string): CreatorInfo {
  const name = t.createdByName || t.createdByEmail || (t.owner === "casal" ? "Conta" : fallbackName) || "Eu";
  return { name, initials: initialsFrom(name) };
}

export { txStatus, initialsFrom, creatorInfo };
