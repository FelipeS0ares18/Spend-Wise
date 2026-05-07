import { Bar, CCOLOR, fmt, MONTHS, pct } from "../components/appPrimitives";

const sumByType = (items, type) => items.filter(t => t.type === type).reduce((sum, t) => sum + Number(t.amount || 0), 0);
const csvCell = value => `"${String(value ?? "").replace(/"/g, '""')}"`;

export function ReportView({ ctx }) {
  const { mobile, theme, light, selMonth, selYear, income, expense, balance, monthTxs, topCats, txs, goals, financialSpace } = ctx;
  const prevDate = new Date(selYear, selMonth - 1, 1);
  const prevMonth = prevDate.getMonth();
  const prevYear = prevDate.getFullYear();
  const previousTxs = (txs || []).filter(t => {
    const d = new Date(t.date + "T00:00:00");
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });
  const prevIncome = sumByType(previousTxs, "income");
  const prevExpense = sumByType(previousTxs, "expense");
  const prevBalance = prevIncome - prevExpense;
  const delta = (now, before) => before ? Math.round(((now - before) / Math.abs(before)) * 100) : now ? 100 : 0;
  const paidCount = monthTxs.filter(t => t.paid).length;
  const openGoals = (goals || []).filter(g => Number(g.saved || 0) < Number(g.target || 0));
  const goalTotal = openGoals.reduce((sum, g) => sum + Number(g.target || 0), 0);
  const goalSaved = openGoals.reduce((sum, g) => sum + Number(g.saved || 0), 0);

  function exportCsv() {
    const rows = [
      ["Data", "Descricao", "Tipo", "Categoria", "Valor", "Pago", "Responsavel"],
      ...monthTxs.map(t => [t.date, t.desc, t.type, t.category, t.amount, t.paid ? "sim" : "nao", t.ownerName || t.owner || ""])
    ];
    const csv = rows.map(row => row.map(csvCell).join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spend-wise-relatorio-${selYear}-${String(selMonth + 1).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printReport() {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Relatorio Spend Wise</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#111827}h1{margin:0 0 4px}table{width:100%;border-collapse:collapse;margin-top:20px}td,th{border-bottom:1px solid #e5e7eb;padding:8px;text-align:left;font-size:12px}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0}.kpi{border:1px solid #e5e7eb;border-radius:8px;padding:12px}.value{font-size:18px;font-weight:700}</style></head><body><h1>${financialSpace?.name || "Spend Wise"}</h1><div>${MONTHS[selMonth]} ${selYear}</div><div class="kpis"><div class="kpi">Receitas<div class="value">${fmt(income)}</div></div><div class="kpi">Despesas<div class="value">${fmt(expense)}</div></div><div class="kpi">Saldo<div class="value">${fmt(balance)}</div></div><div class="kpi">Transacoes<div class="value">${monthTxs.length}</div></div></div><table><thead><tr><th>Data</th><th>Descricao</th><th>Categoria</th><th>Valor</th><th>Status</th></tr></thead><tbody>${monthTxs.map(t => `<tr><td>${t.date || ""}</td><td>${t.desc || ""}</td><td>${t.category || ""}</td><td>${t.type === "income" ? "+" : "-"}${fmt(t.amount)}</td><td>${t.paid ? "Pago" : "Pendente"}</td></tr>`).join("")}</tbody></table></body></html>`;
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return alert("Permita pop-ups para imprimir o relatorio.");
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <div className="fade">
      <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", justifyContent: "space-between", gap: 12, marginBottom: mobile ? 16 : 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: mobile ? 20 : 26, color: theme.text }}>Relatorio executivo</h1>
          <p style={{ color: light ? "#334155" : "#64748b", marginTop: 4, fontSize: 12 }}>{financialSpace?.name || "Spend Wise"} - {MONTHS[selMonth]} {selYear}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={exportCsv} style={{ border: "none", borderRadius: 9, padding: "10px 13px", background: "rgba(255,255,255,.06)", color: theme.nav, cursor: "pointer", fontSize: 12 }}>Exportar CSV</button>
          <button onClick={printReport} style={{ border: "none", borderRadius: 9, padding: "10px 13px", background: "#6EE7B722", color: "#6EE7B7", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Imprimir/PDF</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(4,1fr)", gap: mobile ? 12 : 14, marginBottom: mobile ? 14 : 16 }}>
        {[
          { label: "Receitas recebidas", val: income, color: "#6EE7B7", d: delta(income, prevIncome) },
          { label: "Total de despesas", val: expense, color: "#F87171", d: delta(expense, prevExpense) },
          { label: "Transacoes pagas", val: `${paidCount}/${monthTxs.length}`, color: "#93C5FD", text: true },
          { label: "Saldo final", val: balance, color: balance >= 0 ? "#6EE7B7" : "#F87171", d: delta(balance, prevBalance) }
        ].map((r, i) => (
          <div key={i} className="card">
            <div style={{ fontSize: 12, color: theme.nav, marginBottom: 8 }}>{r.label}</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 16, color: r.color, fontWeight: 700 }}>{r.text ? r.val : fmt(r.val)}</div>
            {r.d !== undefined && <div style={{ color: light ? "#334155" : "#64748b", fontSize: 11, marginTop: 8 }}>{r.d >= 0 ? "+" : ""}{r.d}% vs. {MONTHS[prevMonth]}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.25fr .75fr", gap: mobile ? 12 : 14, marginBottom: mobile ? 14 : 16 }}>
        <div className="card">
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: theme.text, marginBottom: 14 }}>Gastos por categoria</h3>
          {topCats.length === 0 ? (
            <div style={{ color: light ? "#334155" : "#64748b", fontSize: 13 }}>Nenhuma despesa este mes</div>
          ) : (
            topCats.map(([cat, val]) => (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                  <span style={{ color: light ? "#1f2937" : "#cbd5e1" }}>{cat}</span>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ color: light ? "#334155" : "#64748b", fontSize: 11 }}>{pct(val, expense)}%</span>
                    <span style={{ color: theme.nav, fontFamily: "'DM Mono',monospace" }}>{fmt(val)}</span>
                  </div>
                </div>
                <Bar val={val} max={expense} color={CCOLOR[cat] || "#6EE7B7"} />
              </div>
            ))
          )}
        </div>

        <div className="card">
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: theme.text, marginBottom: 14 }}>Metas em aberto</h3>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 18, color: "#6EE7B7", fontWeight: 700 }}>{fmt(goalSaved)} / {fmt(goalTotal)}</div>
          <div style={{ color: light ? "#334155" : "#64748b", fontSize: 12, marginTop: 6, marginBottom: 12 }}>{openGoals.length} metas acompanhadas neste espaco</div>
          <Bar val={goalSaved} max={goalTotal || 1} color="#6EE7B7" />
          <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
            {openGoals.slice(0, 4).map(g => <div key={g._id} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12 }}><span style={{ color: theme.nav }}>{g.name}</span><span style={{ color: light ? "#334155" : "#64748b", fontFamily: "'DM Mono',monospace" }}>{pct(g.saved, g.target)}%</span></div>)}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: theme.text, marginBottom: 14 }}>Todas as transacoes - {MONTHS[selMonth]}</h3>
        {monthTxs.length === 0 ? (
          <div style={{ color: light ? "#334155" : "#64748b", fontSize: 13 }}>Nenhuma transacao este mes</div>
        ) : (
          monthTxs.map(t => (
            <div key={t._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,.05)", gap: 8, flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ color: light ? "#1f2937" : "#e2e8f0", fontSize: 13 }}>{t.desc}</span>
                <span style={{ color: light ? "#334155" : "#64748b", marginLeft: 8, fontSize: 12 }}>- {t.category}</span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'DM Mono',monospace", color: t.type === "income" ? "#6EE7B7" : "#F87171", fontSize: 13 }}>{t.type === "income" ? "+" : "-"}{fmt(t.amount)}</span>
                {!t.paid && <span style={{ color: "#FCD34D", fontSize: 11, animation: "pulse 2s infinite" }}>pendente</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
