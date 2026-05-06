import { MONTHS } from "../domain/constants";

function useMonthlyClosingActions({
  balance,
  expense,
  goals,
  income,
  monthTxs,
  monthlyClosingRepo,
  pending,
  selMonth,
  selYear,
  setSync,
  topCats
}) {
  async function reopenClosing(c) {
    if (!c?._id) return;
    if (!confirm("Reabrir " + MONTHS[c.month] + " " + c.year + "? O fechamento salvo sera removido.")) return;
    setSync("saving");
    try {
      await monthlyClosingRepo.reopenClosing(c);
      setSync("ok");
    } catch (e) {
      setSync("err");
      alert("Erro ao reabrir mes: " + e.message);
    }
  }

  async function closeSelectedMonth() {
    const monthKey = selYear + "-" + String(selMonth + 1).padStart(2, "0");
    if (!confirm("Fechar " + MONTHS[selMonth] + " " + selYear + "? O resumo sera salvo para historico.")) return;
    setSync("saving");
    try {
      await monthlyClosingRepo.closeMonth({ monthKey, month: selMonth, year: selYear, income, expense, balance, pending, monthTxs, topCats, goals });
      setSync("ok");
      alert("Mes fechado e salvo.");
    } catch (e) {
      setSync("err");
      alert("Erro ao fechar mes: " + e.message);
    }
  }

  return { closeSelectedMonth, reopenClosing };
}

export { useMonthlyClosingActions };
