import { Btn, fmt } from "../components/appPrimitives";

export function ShoppingView({ ctx }) {
  const { mobile, theme, light, shopping, pendingShopping, setShowShoppingForm, toggleShoppingItem, deleteShoppingItem } = ctx;
  const sortedShopping = [...shopping].sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1));

  return (
    <div className="fade">
      <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", justifyContent: "space-between", gap: 12, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: mobile ? 20 : 26, color: theme.text }}>Lista de compras</h1>
          <p style={{ color: light ? "#334155" : "#64748b", marginTop: 4, fontSize: 12 }}>{pendingShopping.length} item(ns) pendente(s)</p>
        </div>
        <Btn onClick={() => setShowShoppingForm(true)}>+ Novo item</Btn>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {shopping.length === 0 ? (
          <div style={{ padding: 30, color: light ? "#334155" : "#64748b", fontSize: 13 }}>Lista vazia.</div>
        ) : (
          sortedShopping.map((item, i) => (
            <div key={item._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 16px", borderTop: i ? "1px solid rgba(255,255,255,.05)" : "none", opacity: item.done ? 0.55 : 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => toggleShoppingItem(item)} style={{ width: 22, height: 22, borderRadius: 6, border: "2px solid " + (item.done ? "#6EE7B7" : "#444"), background: item.done ? "#6EE7B722" : "transparent", color: "#6EE7B7", cursor: "pointer" }}>{item.done ? "✓" : ""}</button>
                <div>
                  <div style={{ color: light ? "#1f2937" : "#e2e8f0", fontSize: 14, textDecoration: item.done ? "line-through" : "none" }}>{item.name}</div>
                  <div style={{ color: light ? "#334155" : "#64748b", fontSize: 12 }}>Qtd: {item.qty} {item.unit || "und"} {item.estimate ? ("- " + fmt(item.estimate)) : ""}</div>
                </div>
              </div>
              <button onClick={() => deleteShoppingItem(item)} style={{ background: "#F8717111", border: "none", borderRadius: 8, padding: "7px 10px", color: "#F87171", cursor: "pointer" }}>x</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
