import { Btn } from "../components/appPrimitives";

const inputStyle = theme => ({
  flex: 1,
  background: "rgba(255,255,255,.07)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 10,
  padding: "11px 14px",
  color: theme.text,
  fontSize: 15,
  outline: "none"
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
    answerInvite
  } = ctx;

  return (
    <div className="fade">
      <div style={{ marginBottom: mobile ? 16 : 24 }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: mobile ? 20 : 26, color: theme.text }}>Conta compartilhada</h1>
        <p style={{ color: light ? "#334155" : "#64748b", marginTop: 4, fontSize: 12 }}>Base atual: {householdId || user.uid}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 12 : 14, marginBottom: mobile ? 14 : 16 }}>
        <div className="card">
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: theme.text, marginBottom: 12 }}>Seu acesso</h3>
          <div style={{ fontSize: 13, color: theme.nav, marginBottom: 8 }}>{user.email}</div>
          <div style={{ fontSize: 12, color: light ? "#334155" : "#64748b", marginBottom: 12 }}>Ao compartilhar, novos dados usam o household abaixo.</div>
          <div style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "10px 12px", fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#6EE7B7", wordBreak: "break-all" }}>{householdId || "Envie um convite para gerar o codigo"}</div>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: theme.text, marginBottom: 12 }}>Convidar parceiro</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)} placeholder="parceiro@email.com" style={inputStyle(theme)} />
            <Btn onClick={sendInvite} style={{ padding: "11px 14px" }}>Enviar</Btn>
          </div>
          <div style={{ fontSize: 12, color: light ? "#334155" : "#64748b" }}>Se o convite nao aparecer, envie o codigo exibido ao lado para o parceiro colar abaixo.</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 12 : 14, marginBottom: mobile ? 14 : 16 }}>
        <div className="card">
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: theme.text, marginBottom: 12 }}>Entrar por codigo</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="household-..." style={inputStyle(theme)} />
            <Btn onClick={joinHouseholdByCode} style={{ padding: "11px 14px" }}>Entrar</Btn>
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
    </div>
  );
}
