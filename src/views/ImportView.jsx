import { useState } from "react";
import { Btn, CATS } from "../components/appPrimitives";
import { openBankConnect, syncBankConnection } from "../services/bankSyncService";

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
    guessCategory,
    householdId,
    user
  } = ctx;
  const [bankBusy, setBankBusy] = useState(false);
  const [bankStatus, setBankStatus] = useState("");
  const [lastBankItemId, setLastBankItemId] = useState(localStorage.getItem("spend-wise-last-bank-item") || "");

  async function connectBank() {
    setBankBusy(true);
    setBankStatus("Abrindo conexao segura com o banco...");
    try {
      await openBankConnect({
        householdId,
        user,
        onSuccess: result => {
          if (result.itemId) {
            localStorage.setItem("spend-wise-last-bank-item", result.itemId);
            setLastBankItemId(result.itemId);
          }
          setBankStatus(`Banco conectado. ${result.imported || 0} transacao(oes) sincronizada(s).`);
        },
        onError: error => setBankStatus("Conexao cancelada ou recusada: " + (error?.message || error))
      });
    } catch (e) {
      const setup = e.status === 412 ? " Configure os secrets PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET no Firebase Functions." : "";
      setBankStatus((e.message || "Erro ao conectar banco.") + setup);
    }
    setBankBusy(false);
  }

  async function syncLastBank() {
    if (!lastBankItemId) {
      setBankStatus("Conecte um banco primeiro.");
      return;
    }
    setBankBusy(true);
    setBankStatus("Sincronizando transacoes do banco...");
    try {
      const result = await syncBankConnection({ householdId, itemId: lastBankItemId, user });
      setBankStatus(`${result.imported || 0} transacao(oes) sincronizada(s) de ${result.accountsCount || 0} conta(s).`);
    } catch (e) {
      setBankStatus(e.message || "Erro ao sincronizar banco.");
    }
    setBankBusy(false);
  }

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
            Importar transacoes
          </h1>
          <p style={{ color: light ? "#334155" : "#64748b", marginTop: 4, fontSize: 12 }}>
            Conecte bancos via Open Finance ou envie um arquivo OFX manualmente.
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

      <div className="card" style={{ marginBottom: mobile ? 14 : 16, display: "grid", gap: 14, border: "1px solid rgba(110,231,183,.20)" }}>
        <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", justifyContent: "space-between", alignItems: mobile ? "stretch" : "center", gap: 12 }}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: theme.text, marginBottom: 6 }}>
              Importacao automatica bancaria
            </h3>
            <div style={{ color: light ? "#334155" : "#64748b", fontSize: 13, lineHeight: 1.45 }}>
              Use Pluggy/Open Finance para conectar bancos, salvar a conexao e sincronizar transacoes direto no Spend Wise.
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={connectBank} disabled={bankBusy} style={{ border: "none", borderRadius: 9, padding: "10px 13px", background: "#6EE7B722", color: "#6EE7B7", fontWeight: 700, cursor: bankBusy ? "wait" : "pointer", fontSize: 12 }}>
              {bankBusy ? "Processando..." : "Conectar banco"}
            </button>
            <button onClick={syncLastBank} disabled={bankBusy || !lastBankItemId} style={{ border: "none", borderRadius: 9, padding: "10px 13px", background: "rgba(255,255,255,.06)", color: theme.nav, fontWeight: 700, cursor: bankBusy || !lastBankItemId ? "not-allowed" : "pointer", fontSize: 12 }}>
              Sincronizar ultimo banco
            </button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3,1fr)", gap: 10 }}>
          <div style={{ background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "11px 12px" }}>
            <div style={{ color: theme.nav, fontSize: 12, marginBottom: 5 }}>Seguranca</div>
            <div style={{ color: light ? "#334155" : "#64748b", fontSize: 12 }}>Credenciais ficam no fluxo do provedor; o app recebe apenas transacoes e identificador da conexao.</div>
          </div>
          <div style={{ background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "11px 12px" }}>
            <div style={{ color: theme.nav, fontSize: 12, marginBottom: 5 }}>Deduplicacao</div>
            <div style={{ color: light ? "#334155" : "#64748b", fontSize: 12 }}>Cada transacao bancaria e salva pelo ID externo, evitando duplicar em novas sincronizacoes.</div>
          </div>
          <div style={{ background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "11px 12px" }}>
            <div style={{ color: theme.nav, fontSize: 12, marginBottom: 5 }}>Status</div>
            <div style={{ color: bankStatus.includes("Erro") || bankStatus.includes("Configure") ? "#F87171" : light ? "#334155" : "#64748b", fontSize: 12 }}>{bankStatus || (lastBankItemId ? "Ultima conexao pronta para sincronizar." : "Aguardando configuracao da Pluggy.")}</div>
          </div>
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
