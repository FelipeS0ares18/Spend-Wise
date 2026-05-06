import { Bar, Btn, fmt } from "../components/appPrimitives";

export function CardsView({ ctx }) {
  const { mobile, theme, light, cardSpend, setShowCardForm, setPurchaseCard, deleteCard } = ctx;

  return (
    <div className="fade">
      <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", justifyContent: "space-between", gap: 12, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: mobile ? 20 : 26, color: theme.text }}>Cartao de credito</h1>
          <p style={{ color: light ? "#334155" : "#64748b", marginTop: 4, fontSize: 12 }}>Controle limite, fechamento e compras parceladas.</p>
        </div>
        <Btn onClick={() => setShowCardForm(true)}>+ Novo cartao</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3,1fr)", gap: 14 }}>
        {cardSpend.length === 0 ? (
          <div className="card" style={{ color: light ? "#334155" : "#64748b", fontSize: 13 }}>Nenhum cartao cadastrado.</div>
        ) : (
          cardSpend.map(c => (
            <div key={c._id} className="card">
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: theme.text, marginBottom: 6 }}>{c.name}</h3>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 20, color: "#93C5FD", marginBottom: 8 }}>{fmt(c.used)} / {fmt(c.limit || 0)}</div>
              <Bar val={c.used} max={c.limit || 1} color="#93C5FD" />
              <div style={{ color: light ? "#334155" : "#64748b", fontSize: 12, margin: "12px 0" }}>Fecha dia {c.closingDay} - vence dia {c.dueDay}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setPurchaseCard(c)} style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "none", background: "#6EE7B722", color: "#6EE7B7", cursor: "pointer", fontWeight: 700 }}>Compra</button>
                <button onClick={() => deleteCard(c)} style={{ padding: "9px 12px", borderRadius: 8, border: "none", background: "#F8717111", color: "#F87171", cursor: "pointer" }}>x</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
