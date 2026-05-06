import { Btn, CATS } from "../components/appPrimitives";

export function RulesView({ ctx }) {
  const {
    mobile,
    theme,
    light,
    ruleText,
    setRuleText,
    ruleCategory,
    setRuleCategory,
    saveCategoryRule,
    categoryRules,
    deleteCategoryRule
  } = ctx;

  const fieldStyle = {
    width: "100%",
    background: "rgba(255,255,255,.07)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 10,
    padding: "11px 14px",
    color: theme.text,
    fontSize: 15,
    outline: "none"
  };

  return (
    <div className="fade">
      <div style={{ marginBottom: mobile ? 16 : 24 }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: mobile ? 20 : 26, color: theme.text }}>
          Regras de categorizacao
        </h1>
        <p style={{ color: light ? "#334155" : "#64748b", marginTop: 4, fontSize: 12 }}>
          Termos cadastrados tem prioridade na importacao OFX.
        </p>
      </div>

      <div
        className="card"
        style={{
          marginBottom: 14,
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : "1fr 180px auto",
          gap: 10,
          alignItems: "end"
        }}
      >
        <div>
          <label style={{ fontSize: 12, color: theme.nav, display: "block", marginBottom: 6 }}>Termo</label>
          <input
            value={ruleText}
            onChange={e => setRuleText(e.target.value)}
            placeholder="ex: uber, mercado, netflix"
            style={fieldStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, color: theme.nav, display: "block", marginBottom: 6 }}>Categoria</label>
          <select value={ruleCategory} onChange={e => setRuleCategory(e.target.value)} style={fieldStyle}>
            {CATS.map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <Btn onClick={saveCategoryRule}>Salvar</Btn>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {categoryRules.length === 0 ? (
          <div style={{ padding: 24, color: light ? "#334155" : "#64748b", fontSize: 13 }}>
            Nenhuma regra cadastrada.
          </div>
        ) : (
          categoryRules.map((r, i) => (
            <div
              key={r._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderTop: i ? "1px solid " + theme.border : "none"
              }}
            >
              <div>
                <div style={{ fontSize: 14, color: theme.text, fontWeight: 700 }}>{r.term}</div>
                <div style={{ fontSize: 12, color: light ? "#334155" : "#64748b" }}>{r.category}</div>
              </div>
              <button
                onClick={() => deleteCategoryRule(r)}
                style={{
                  background: "#F8717111",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 10px",
                  color: "#F87171",
                  cursor: "pointer"
                }}
              >
                x
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
