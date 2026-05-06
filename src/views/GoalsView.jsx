import { Bar, Btn, fmt, GoalForm, pct } from "../components/appPrimitives";

export function GoalsView({ ctx }) {
  const { mobile, theme, light, goals, showGoal, setShowGoal, saveGoal, setDepositGoal, deleteGoal } = ctx;

  return (
    <div className="fade">
      <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", justifyContent: "space-between", gap: 12, marginBottom: mobile ? 14 : 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: mobile ? 20 : 26, color: theme.text }}>Metas & Caixinhas</h1>
          <p style={{ color: light ? "#334155" : "#64748b", marginTop: 4, fontSize: 12 }}>Acompanhe seus objetivos financeiros</p>
        </div>
        <Btn onClick={() => setShowGoal(true)}>+ Nova Meta</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3,1fr)", gap: mobile ? 12 : 14 }}>
        {goals.length === 0 ? (
          <div style={{ color: light ? "#334155" : "#64748b", fontSize: 13 }}>Nenhuma meta criada ainda</div>
        ) : (
          goals.map(g => {
            const p = pct(g.saved, g.target);
            return (
              <div key={g._id} className="card" style={{ position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, height: 3, background: `linear-gradient(90deg,${g.color}66,${g.color})`, width: p + "%" }} />
                <div style={{ fontSize: 30, marginBottom: 10 }}>{g.icon}</div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: theme.text, marginBottom: 4 }}>{g.name}</h3>
                <div style={{ fontSize: mobile ? 18 : 22, fontFamily: "'Playfair Display',serif", color: g.color, fontWeight: 700, marginBottom: 3 }}>{fmt(g.saved)}</div>
                <div style={{ fontSize: 12, color: light ? "#334155" : "#64748b", marginBottom: 14 }}>de {fmt(g.target)} · faltam {fmt(g.target - g.saved)}</div>
                <Bar val={g.saved} max={g.target} color={g.color} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <span style={{ fontSize: 12, color: light ? "#334155" : "#64748b" }}>{p}% concluido</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setDepositGoal(g)} style={{ background: g.color + "22", border: "none", borderRadius: 6, padding: "5px 12px", color: g.color, cursor: "pointer", fontSize: 12 }}>+ Depositar</button>
                    <button onClick={() => deleteGoal(g)} style={{ background: "#F8717122", border: "none", borderRadius: 6, padding: "5px 10px", color: "#F87171", cursor: "pointer", fontSize: 12 }}>x</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {showGoal && <GoalForm onSave={saveGoal} onClose={() => setShowGoal(false)} />}
    </div>
  );
}
