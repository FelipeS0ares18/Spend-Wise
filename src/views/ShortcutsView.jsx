import { Badge, Btn, fmt } from "../components/appPrimitives";

export function ShortcutsView({ ctx }) {
  const { mobile, theme, light, shortcuts, setEditingShortcut, setShowShortcut, launchShortcut, deleteShortcut } = ctx;

  return (
    <div className="fade">
      <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", justifyContent: "space-between", gap: 12, marginBottom: mobile ? 14 : 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: mobile ? 20 : 26, color: theme.text }}>Atalhos rapidos</h1>
          <p style={{ color: light ? "#334155" : "#64748b", marginTop: 4, fontSize: 12 }}>Transacoes frequentes com lancamento em um toque</p>
        </div>
        <Btn onClick={() => { setEditingShortcut(null); setShowShortcut(true); }}>+ Novo Atalho</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3,1fr)", gap: mobile ? 12 : 14 }}>
        {shortcuts.length === 0 ? (
          <div className="card" style={{ color: light ? "#334155" : "#64748b", fontSize: 13 }}>Salve um atalho como "Almoco R$25" e ele aparecera no dashboard.</div>
        ) : (
          shortcuts.map(s => (
            <div key={s._id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: theme.text, marginBottom: 4 }}>{s.label}</h3>
                  <div style={{ color: light ? "#334155" : "#64748b", fontSize: 13 }}>{s.desc}</div>
                </div>
                <Badge color={s.type === "income" ? "#6EE7B7" : "#F87171"}>{s.type === "income" ? "Receita" : "Despesa"}</Badge>
              </div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 20, color: s.type === "income" ? "#6EE7B7" : "#F87171", marginBottom: 14 }}>{fmt(s.amount)}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => launchShortcut(s)} style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "none", background: "#6EE7B722", color: "#6EE7B7", cursor: "pointer", fontWeight: 700 }}>Lancar</button>
                <button onClick={() => { setEditingShortcut(s); setShowShortcut(true); }} style={{ padding: "9px 12px", borderRadius: 8, border: "none", background: "rgba(255,255,255,.05)", color: theme.nav, cursor: "pointer" }}>Editar</button>
                <button onClick={() => deleteShortcut(s)} style={{ padding: "9px 12px", borderRadius: 8, border: "none", background: "#F8717111", color: "#F87171", cursor: "pointer" }}>x</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
