import { Btn } from "../components/appPrimitives";

const inputStyle = theme => ({
  flex: 1,
  background: "rgba(255,255,255,.07)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 10,
  padding: "11px 14px",
  color: theme.text,
  fontSize: 15,
  outline: "none",
  minWidth: 0
});

const selectStyle = theme => ({
  ...inputStyle(theme),
  width: "100%"
});

export function SharedAccountView({ ctx }) {
  const {
    mobile,
    theme,
    light,
    householdId,
    user,
    partnerEmail,
    setPartnerEmail,
    sendInvite,
    joinCode,
    setJoinCode,
    joinHouseholdByCode,
    refreshInvites,
    invites,
    answerInvite,
    financialSpace,
    setFinancialSpace,
    saveFinancialSpace,
    spaceSaving
  } = ctx;

  const updateSpace = (key, value) => setFinancialSpace({ ...financialSpace, [key]: value });
  const badge = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "5px 9px",
    background: "rgba(110,231,183,.12)",
    color: "#6EE7B7",
    fontSize: 11,
    fontWeight: 700
  };

  return (
    <div className="fade">
      <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", justifyContent: "space-between", gap: 12, marginBottom: mobile ? 16 : 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: mobile ? 20 : 26, color: theme.text }}>Espaco financeiro</h1>
          <p style={{ color: light ? "#334155" : "#64748b", marginTop: 4, fontSize: 12 }}>Base atual: {householdId || user.uid}</p>
        </div>
        <Btn onClick={() => saveFinancialSpace()} disabled={spaceSaving}>{spaceSaving ? "Salvando..." : "Salvar espaco"}</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.1fr .9fr", gap: mobile ? 12 : 14, marginBottom: mobile ? 14 : 16 }}>
        <div className="card">
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: theme.text, marginBottom: 12 }}>Configuracoes da organizacao</h3>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
            <label style={{ display: "grid", gap: 6, fontSize: 12, color: theme.nav }}>Nome do espaco
              <input value={financialSpace.name || ""} onChange={e => updateSpace("name", e.target.value)} placeholder="Minha familia, casal, empresa..." style={inputStyle(theme)} />
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 12, color: theme.nav }}>Seu papel
              <select value={financialSpace.role || "owner"} onChange={e => updateSpace("role", e.target.value)} style={selectStyle(theme)}>
                <option value="owner">Dono da conta</option>
                <option value="admin">Administrador</option>
                <option value="member">Membro</option>
                <option value="viewer">Somente leitura</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 12, color: theme.nav }}>Moeda principal
              <select value={financialSpace.currency || "BRL"} onChange={e => updateSpace("currency", e.target.value)} style={selectStyle(theme)}>
                <option value="BRL">Real brasileiro (BRL)</option>
                <option value="USD">Dolar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 12, color: theme.nav }}>Inicio do periodo
              <select value={financialSpace.periodStart || "1"} onChange={e => updateSpace("periodStart", e.target.value)} style={selectStyle(theme)}>
                <option value="1">Dia 1</option>
                <option value="5">Dia 5</option>
                <option value="10">Dia 10</option>
                <option value="15">Dia 15</option>
                <option value="20">Dia 20</option>
                <option value="25">Dia 25</option>
              </select>
            </label>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: theme.text, marginBottom: 12 }}>Membros e permissoes</h3>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: light ? "#1f2937" : "#e2e8f0", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
                <div style={{ color: light ? "#334155" : "#64748b", fontSize: 12 }}>Usuario atual</div>
              </div>
              <span style={badge}>{financialSpace.role === "viewer" ? "Leitura" : financialSpace.role === "member" ? "Membro" : financialSpace.role === "admin" ? "Admin" : "Dono"}</span>
            </div>
            <div style={{ color: light ? "#334155" : "#64748b", fontSize: 12, lineHeight: 1.45 }}>Convites entram com acesso de membro. A proxima evolucao natural aqui e permitir trocar permissao por pessoa e remover membros.</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 12 : 14, marginBottom: mobile ? 14 : 16 }}>
        <div className="card">
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: theme.text, marginBottom: 12 }}>Convidar parceiro</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)} placeholder="parceiro@email.com" style={inputStyle(theme)} />
            <Btn onClick={sendInvite} style={{ padding: "11px 14px" }}>Enviar</Btn>
          </div>
          <div style={{ fontSize: 12, color: light ? "#334155" : "#64748b" }}>Se o convite nao aparecer, envie o codigo exibido abaixo para o parceiro colar no app.</div>
          <div style={{ marginTop: 12, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "10px 12px", fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#6EE7B7", wordBreak: "break-all" }}>{householdId || "Envie um convite para gerar o codigo"}</div>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: theme.text, marginBottom: 12 }}>Entrar por codigo</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="household-..." style={inputStyle(theme)} />
            <Btn onClick={joinHouseholdByCode} style={{ padding: "11px 14px" }}>Entrar</Btn>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: theme.text, marginBottom: 12 }}>Convites recebidos</h3>
        <button onClick={refreshInvites} style={{ background: "rgba(255,255,255,.05)", border: "none", borderRadius: 8, padding: "8px 12px", color: theme.nav, cursor: "pointer", fontSize: 12, marginBottom: 10 }}>Buscar convites</button>
        {invites.length === 0 ? (
          <div style={{ color: light ? "#334155" : "#64748b", fontSize: 13 }}>Nenhum convite pendente para este email.</div>
        ) : (
          invites.map(i => (
            <div key={i._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid rgba(255,255,255,.05)" }}>
              <div>
                <div style={{ color: light ? "#1f2937" : "#e2e8f0", fontSize: 13 }}>{i.fromName || i.fromEmail}</div>
                <div style={{ color: light ? "#334155" : "#64748b", fontSize: 12 }}>Household: {i.householdId}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => answerInvite(i, "accepted")} style={{ background: "#6EE7B722", border: "none", borderRadius: 8, padding: "8px 12px", color: "#6EE7B7", cursor: "pointer" }}>Aceitar</button>
                <button onClick={() => answerInvite(i, "declined")} style={{ background: "#F8717111", border: "none", borderRadius: 8, padding: "8px 12px", color: "#F87171", cursor: "pointer" }}>Recusar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
