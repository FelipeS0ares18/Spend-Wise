import { Btn, fmt, MONTHS } from "../components/appPrimitives";

export function ClosingView({ ctx }) {
  const {
    mobile,
    theme,
    light,
    selMonth,
    income,
    expense,
    balance,
    pending,
    closings,
    closeSelectedMonth,
    reopenClosing
  } = ctx;

  const summary = [
    { l: "Receitas", v: income, c: "#059669" },
    { l: "Despesas", v: expense, c: "#dc2626" },
    { l: "Saldo", v: balance, c: balance >= 0 ? "#059669" : "#dc2626" },
    { l: "Pendentes", v: pending, c: "#FCD34D", n: true }
  ];

  return (
    <div className="fade">
      <div
        style={{
          display: "flex",
          flexDirection: mobile ? "column" : "row",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: mobile ? 16 : 24
        }}
      >
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: mobile ? 20 : 26, color: theme.text }}>
            Fechamento mensal
          </h1>
          <p style={{ color: light ? "#334155" : "#64748b", marginTop: 4, fontSize: 12 }}>
            Salve um resumo congelado do mes atual.
          </p>
        </div>
        <Btn onClick={closeSelectedMonth}>Fechar {MONTHS[selMonth]}</Btn>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : "repeat(4,1fr)",
          gap: 12,
          marginBottom: 14
        }}
      >
        {summary.map(x => (
          <div key={x.l} className="card">
            <div style={{ fontSize: 11, color: light ? "#334155" : "#64748b", marginBottom: 6 }}>{x.l}</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 18, color: x.c, fontWeight: 700 }}>
              {x.n ? x.v : fmt(x.v)}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: theme.text, marginBottom: 14 }}>
          Historico de fechamentos
        </h3>
        {closings.length === 0 ? (
          <div style={{ color: light ? "#334155" : "#64748b", fontSize: 13 }}>Nenhum mes fechado ainda.</div>
        ) : (
          closings.map(c => (
            <div
              key={c._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderTop: "1px solid " + theme.border
              }}
            >
              <div>
                <div style={{ color: theme.text, fontWeight: 700, fontSize: 13 }}>
                  {MONTHS[c.month]} {c.year}
                </div>
                <div style={{ color: light ? "#334155" : "#64748b", fontSize: 12 }}>
                  {c.transactionsCount || 0} lancamentos · {c.closedAtText}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div
                  style={{
                    textAlign: "right",
                    fontFamily: "'DM Mono',monospace",
                    color: (c.balance || 0) >= 0 ? "#059669" : "#dc2626"
                  }}
                >
                  {fmt(c.balance || 0)}
                </div>
                <button
                  onClick={() => reopenClosing(c)}
                  style={{
                    background: "rgba(255,255,255,.05)",
                    border: "1px solid " + theme.border,
                    borderRadius: 8,
                    padding: "7px 10px",
                    color: theme.nav,
                    cursor: "pointer",
                    fontSize: 12
                  }}
                >
                  Reabrir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
