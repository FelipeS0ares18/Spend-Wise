import { Btn, EmptyState, fmt } from "../components/appPrimitives";

export function NotificationsView({ ctx }) {
  const { mobile, theme, light, notifEnabled, enableNotifications, monthTxs, dueRecurring } = ctx;
  const pendingTxs = monthTxs.filter(t => !t.paid);

  return (
    <div className="fade">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 22,
          flexDirection: mobile ? "column" : "row"
        }}
      >
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: mobile ? 20 : 26, color: theme.text }}>
            Notificacoes
          </h1>
          <p style={{ color: light ? "#334155" : "#64748b", marginTop: 4, fontSize: 12 }}>
            Alertas locais para contas vencidas e recorrencias proximas.
          </p>
        </div>
        <Btn onClick={enableNotifications}>{notifEnabled ? "Notificacoes ativas" : "Ativar notificacoes"}</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 14 }}>
        <div className="card">
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: theme.text, marginBottom: 12 }}>
            Pendencias
          </h3>
          {pendingTxs.length === 0 ? (
            <EmptyState
              title="Nenhuma pendencia no mes"
              body="Tudo que precisava de acao neste mes ja esta pago ou recebido."
            />
          ) : (
            pendingTxs.map(t => (
              <div
                key={t._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderTop: "1px solid rgba(255,255,255,.05)",
                  fontSize: 13
                }}
              >
                <span>{t.desc}</span>
                <span style={{ color: "#F87171" }}>{fmt(t.amount)}</span>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: theme.text, marginBottom: 12 }}>
            Recorrentes proximas
          </h3>
          {dueRecurring.length === 0 ? (
            <EmptyState
              title="Nenhuma conta vencendo nos proximos 7 dias"
              body="As recorrencias futuras continuam cadastradas e aparecerao aqui quando estiverem proximas."
            />
          ) : (
            dueRecurring.map(r => (
              <div
                key={r._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderTop: "1px solid rgba(255,255,255,.05)",
                  fontSize: 13
                }}
              >
                <span>
                  {r.desc} - dia {r.day}
                </span>
                <span style={{ color: "#FCD34D" }}>{fmt(r.amount)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
