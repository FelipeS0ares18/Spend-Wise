import { Badge } from "../components/appPrimitives";

export function SearchView({ ctx }) {
  const {
    mobile,
    theme,
    light,
    globalSearch,
    setGlobalSearch,
    searchQ,
    searchResults,
    setView
  } = ctx;

  return (
    <div className="fade">
      <div style={{ marginBottom: mobile ? 16 : 24 }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: mobile ? 20 : 26, color: theme.text }}>
          Busca global
        </h1>
        <p style={{ color: light ? "#334155" : "#64748b", marginTop: 4, fontSize: 12 }}>
          Procure lancamentos, metas, cartoes, recorrentes, compras e atalhos.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <input
          autoFocus
          value={globalSearch}
          onChange={e => setGlobalSearch(e.target.value)}
          placeholder="Buscar por mercado, cartao, meta, valor..."
          style={{
            width: "100%",
            background: "rgba(255,255,255,.07)",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 10,
            padding: "12px 14px",
            color: theme.text,
            fontSize: 15,
            outline: "none"
          }}
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {!searchQ ? (
          <div style={{ padding: 24, color: light ? "#334155" : "#64748b", fontSize: 13 }}>
            Digite algo para buscar.
          </div>
        ) : searchResults.length === 0 ? (
          <div style={{ padding: 24, color: light ? "#334155" : "#64748b", fontSize: 13 }}>
            Nada encontrado.
          </div>
        ) : (
          searchResults.map((r, i) => (
            <button
              key={i}
              onClick={() => setView(r.view)}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                textAlign: "left",
                padding: "13px 16px",
                border: "none",
                borderTop: i ? "1px solid " + theme.border : "none",
                background: "transparent",
                cursor: "pointer",
                color: theme.text
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: light ? "#334155" : "#64748b", marginTop: 2 }}>{r.meta}</div>
              </div>
              <Badge color="#93C5FD">{r.kind}</Badge>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
