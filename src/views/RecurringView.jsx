import { Btn, EmptyState, fmt } from "../components/appPrimitives";

export function RecurringView({ ctx }) {
  const { mobile, theme, light, recurring, setShowRecurringForm, generateRecurring, deleteRecurring } = ctx;

  return (
    <div className="fade">
      <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", justifyContent: "space-between", gap: 12, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: mobile ? 20 : 26, color: theme.text }}>Contas recorrentes</h1>
          <p style={{ color: light ? "#334155" : "#64748b", marginTop: 4, fontSize: 12 }}>Cadastre contas fixas e gere lancamentos do mes.</p>
        </div>
        <Btn onClick={() => setShowRecurringForm(true)}>+ Nova recorrencia</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3,1fr)", gap: 14 }}>
        {recurring.length === 0 ? (
          <div className="card">
            <EmptyState
              title="Nenhuma conta recorrente cadastrada"
              body="Cadastre aluguel, internet, escola ou outras contas fixas para gerar lancamentos todo mes."
              action="Use + Nova recorrencia."
            />
          </div>
        ) : (
          recurring.map(r => (
            <div key={r._id} className="card">
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: theme.text, marginBottom: 6 }}>{r.desc}</h3>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 20, color: "#F87171", marginBottom: 8 }}>{fmt(r.amount)}</div>
              <div style={{ color: light ? "#334155" : "#64748b", fontSize: 12, marginBottom: 12 }}>Vence todo dia {r.day} - {r.category}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => generateRecurring(r)} style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "none", background: "#6EE7B722", color: "#6EE7B7", cursor: "pointer", fontWeight: 700 }}>Gerar</button>
                <button onClick={() => deleteRecurring(r)} style={{ padding: "9px 12px", borderRadius: 8, border: "none", background: "#F8717111", color: "#F87171", cursor: "pointer" }}>x</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
