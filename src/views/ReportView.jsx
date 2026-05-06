import { Bar, CCOLOR, fmt, MONTHS, pct } from "../components/appPrimitives";

export function ReportView({ ctx }) {
  const { mobile, theme, light, selMonth, selYear, income, expense, balance, monthTxs, topCats } = ctx;

  return (
    <div className="fade">
      <div style={{ marginBottom: mobile ? 16 : 24 }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: mobile ? 20 : 26, color: theme.text }}>Relatorio</h1>
        <p style={{ color: light ? "#334155" : "#64748b", marginTop: 4, fontSize: 12 }}>{MONTHS[selMonth]} {selYear}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 12 : 14, marginBottom: mobile ? 14 : 16 }}>
        {[
          { label: "Receitas recebidas", val: income, color: "#6EE7B7" },
          { label: "Total de despesas", val: expense, color: "#F87171" },
          { label: "Transacoes no mes", val: monthTxs.length, color: "#93C5FD", cnt: true },
          { label: "Saldo final", val: balance, color: balance >= 0 ? "#6EE7B7" : "#F87171" }
        ].map((r, i) => (
          <div key={i} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: theme.nav }}>{r.label}</span>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 15, color: r.color, fontWeight: 700 }}>{r.cnt ? r.val : fmt(r.val)}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: mobile ? 14 : 16 }}>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: theme.text, marginBottom: 14 }}>Gastos por Categoria</h3>
        {topCats.length === 0 ? (
          <div style={{ color: light ? "#334155" : "#64748b", fontSize: 13 }}>Nenhuma despesa este mes</div>
        ) : (
          topCats.map(([cat, val]) => (
            <div key={cat} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                <span style={{ color: "#cbd5e1" }}>{cat}</span>
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
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: theme.text, marginBottom: 14 }}>Todas as Transacoes · {MONTHS[selMonth]}</h3>
        {monthTxs.length === 0 ? (
          <div style={{ color: light ? "#334155" : "#64748b", fontSize: 13 }}>Nenhuma transacao este mes</div>
        ) : (
          monthTxs.map(t => (
            <div key={t._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,.05)", gap: 8, flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ color: light ? "#1f2937" : "#e2e8f0", fontSize: 13 }}>{t.desc}</span>
                <span style={{ color: light ? "#334155" : "#64748b", marginLeft: 8, fontSize: 12 }}>· {t.category}</span>
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
