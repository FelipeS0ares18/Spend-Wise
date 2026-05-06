import type { Goal, Recurring, Transaction } from "./types";

const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 100));

type FinanceHealthInput = {
  income: number;
  expense: number;
  balance: number;
  pending: number;
  monthTxs: Transaction[];
  goals: Goal[];
  recurring: Recurring[];
};

type FinanceInsightInput = Omit<FinanceHealthInput, "pending"> & {
  topCats: [string, number][];
};

function daysBetweenISO(date?: string): number {
  if (!date) return 9999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date + "T12:00:00");
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

function buildFinanceHealth({ income, expense, balance, pending, monthTxs, goals, recurring }: FinanceHealthInput) {
  const paidIncome = income || 0;
  const paidExpense = expense || 0;
  const savingsRate = paidIncome > 0 ? Math.round((balance / paidIncome) * 100) : 0;
  const overdue = monthTxs.filter(t => !t.paid && t.type === "expense" && daysBetweenISO(t.date) < 0).length;
  const nearDue = recurring.filter(r => r.active !== false && r.day && Number(r.day) >= new Date().getDate() && Number(r.day) <= new Date().getDate() + 7).length;
  const goalProgress = goals.length ? Math.round(goals.reduce((sum, g) => sum + pct(Number(g.saved || 0), Number(g.target || 0)), 0) / goals.length) : 0;
  let score = 50;
  if (paidIncome > 0) score += 10;
  if (balance >= 0) score += 18;
  else score -= 14;
  if (savingsRate >= 20) score += 14;
  else if (savingsRate >= 5) score += 8;
  else if (paidIncome > 0) score -= 6;
  score -= Math.min(overdue * 10, 24);
  score -= Math.min(pending * 3, 15);
  if (goals.length && goalProgress >= 40) score += 8;
  if (monthTxs.length >= 4) score += 6;
  score = Math.max(0, Math.min(100, Math.round(score)));
  const label = score >= 80 ? "Muito boa" : score >= 60 ? "Boa" : score >= 40 ? "Em atencao" : "Critica";
  const color = score >= 80 ? "#6EE7B7" : score >= 60 ? "#93C5FD" : score >= 40 ? "#FCD34D" : "#F87171";
  return { score, label, color, savingsRate, overdue, nearDue, goalProgress };
}

function buildFinanceInsights({ income, expense, balance, monthTxs, recurring, goals, topCats }: FinanceInsightInput) {
  const insights = [];
  const today = new Date();
  const overdueTxs = monthTxs.filter(t => !t.paid && t.type === "expense" && daysBetweenISO(t.date) < 0);
  const nextDueTxs = monthTxs.filter(t => !t.paid && t.type === "expense" && daysBetweenISO(t.date) >= 0 && daysBetweenISO(t.date) <= 7);
  const recurringSoon = recurring.filter(r => r.active !== false && r.day && Number(r.day) >= today.getDate() && Number(r.day) <= today.getDate() + 7);
  if (overdueTxs.length) insights.push({ tone: "danger", title: overdueTxs.length + " conta(s) vencida(s)", body: "Regularize ou marque como pago para limpar suas pendencias.", view: "transactions" });
  else if (nextDueTxs.length || recurringSoon.length) insights.push({ tone: "warn", title: nextDueTxs.length + recurringSoon.length + " vencimento(s) nos proximos 7 dias", body: "Confira o calendario e antecipe pagamentos importantes.", view: "calendar" });
  else insights.push({ tone: "good", title: "Nenhuma conta vencendo nos proximos 7 dias", body: "Seu curto prazo esta sob controle.", view: "calendar" });
  if (income > 0) {
    const rate = Math.round((balance / income) * 100);
    if (rate >= 20) insights.push({ tone: "good", title: "Voce guardou " + rate + "% da receita", body: "Bom ritmo para reforcar metas ou reserva.", view: "goals" });
    else if (rate >= 0) insights.push({ tone: "warn", title: "Saldo positivo, mas apertado", body: "Tente manter pelo menos 10% da receita livre.", view: "report" });
    else insights.push({ tone: "danger", title: "Despesas acima das receitas", body: "Revise categorias e recorrentes antes do fechamento.", view: "report" });
  } else {
    insights.push({ tone: "info", title: "Adicione uma receita do mes", body: "Com receita registrada, o app calcula saldo e saude financeira com mais precisao.", view: "transactions" });
  }
  if (topCats[0]) {
    const [cat, val] = topCats[0];
    const share = expense > 0 ? pct(val, expense) : 0;
    insights.push({ tone: share >= 45 ? "warn" : "info", title: "Maior gasto: " + cat, body: fmt(val) + " representa " + share + "% das despesas do mes.", view: "report" });
  }
  if (!goals.length) insights.push({ tone: "info", title: "Crie sua primeira meta", body: "Metas deixam o app mais orientado para decisao, nao so registro.", view: "goals" });
  return insights.slice(0, 4);
}

export { buildFinanceHealth, buildFinanceInsights, daysBetweenISO };
