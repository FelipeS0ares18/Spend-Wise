import { Btn, CATS } from "../components/appPrimitives";

const inputStyle = theme => ({
  background: "rgba(255,255,255,.07)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 8,
  padding: 9,
  color: theme.text,
  fontSize: 13,
  outline: "none"
});

export function ImportView({ ctx }) {
  const {
    mobile,
    theme,
    light,
    importRows,
    importSaving,
    importFileName,
    setImportRows,
    setImportFileName,
    setImportText,
    saveImportedRows,
    handleOfxFile,
    updateImportRow,
    removeImportRow,
    guessCategory
  } = ctx;

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
            Importar OFX
          </h1>
          <p style={{ color: light ? "#334155" : "#64748b", marginTop: 4, fontSize: 12 }}>
            Envie o arquivo OFX do banco, revise as categorias e importe.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {importRows.length > 0 && (
            <Btn onClick={saveImportedRows} disabled={importSaving}>
              {importSaving ? "Importando..." : "Importar " + importRows.length}
            </Btn>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: mobile ? 14 : 16, display: "grid", gap: 14 }}>
        <input
          id="ofx-file-input"
          type="file"
          accept=".ofx,.OFX,application/x-ofx,text/plain"
          onChange={handleOfxFile}
          style={{ display: "none" }}
        />
        <div
          style={{
            border: "1px dashed " + (light ? "rgba(15,23,42,.22)" : "rgba(255,255,255,.18)"),
            borderRadius: 14,
            padding: mobile ? "22px 16px" : "30px",
            display: "flex",
            flexDirection: mobile ? "column" : "row",
            alignItems: mobile ? "stretch" : "center",
            justifyContent: "space-between",
            gap: 14,
            background: light ? "rgba(15,23,42,.03)" : "rgba(255,255,255,.03)"
          }}
        >
          <div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: theme.text, marginBottom: 6 }}>
              Arquivo OFX
            </h3>
            <div style={{ color: light ? "#334155" : "#64748b", fontSize: 13 }}>
              {importFileName || "Selecione o arquivo .ofx exportado pelo seu banco."}
            </div>
          </div>
          <Btn onClick={() => document.getElementById("ofx-file-input")?.click()} style={{ whiteSpace: "nowrap" }}>
            {importFileName ? "Trocar arquivo" : "Escolher OFX"}
          </Btn>
        </div>

        {importRows.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              fontSize: 13,
              color: light ? "#334155" : "#64748b"
            }}
          >
            <span>{importRows.length} lancamento(s) encontrados.</span>
            <button
              onClick={() => {
                setImportRows([]);
                setImportFileName("");
                setImportText("");
              }}
              style={{
                background: "rgba(255,255,255,.05)",
                border: "none",
                borderRadius: 8,
                padding: "8px 10px",
                color: theme.nav,
                cursor: "pointer"
              }}
            >
              Limpar
            </button>
          </div>
        )}
      </div>

      {importRows.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {importRows.map((r, i) => (
            <div
              key={r.id}
              style={{
                display: "grid",
                gridTemplateColumns: mobile ? "1fr" : "110px 1fr 120px 150px 90px 40px",
                gap: 8,
                alignItems: "center",
                padding: "12px 14px",
                borderTop: i ? "1px solid rgba(255,255,255,.06)" : "none"
              }}
            >
              <input
                type="date"
                value={r.date}
                onChange={e => updateImportRow(r.id, { date: e.target.value })}
                style={{ ...inputStyle(theme), fontSize: 12 }}
              />
              <input
                value={r.desc}
                onChange={e => updateImportRow(r.id, { desc: e.target.value, category: guessCategory(e.target.value, r.type) })}
                style={inputStyle(theme)}
              />
              <input
                value={r.amount}
                type="number"
                step="0.01"
                onChange={e => updateImportRow(r.id, { amount: parseFloat(e.target.value) || 0 })}
                style={inputStyle(theme)}
              />
              <select value={r.category} onChange={e => updateImportRow(r.id, { category: e.target.value })} style={inputStyle(theme)}>
                {CATS.map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select
                value={r.type}
                onChange={e => updateImportRow(r.id, { type: e.target.value, category: guessCategory(r.desc, e.target.value) })}
                style={inputStyle(theme)}
              >
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>
              <button
                onClick={() => removeImportRow(r.id)}
                style={{
                  background: "#F8717111",
                  border: "none",
                  borderRadius: 8,
                  padding: 9,
                  color: "#F87171",
                  cursor: "pointer"
                }}
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
