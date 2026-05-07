import { Btn } from "../components/appPrimitives";

const inputStyle = theme => ({
  width: "100%",
  background: "rgba(255,255,255,.07)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 10,
  padding: "12px 14px",
  color: theme.text,
  fontSize: 15,
  outline: "none"
});

export function ProfileView({ ctx }) {
  const {
    mobile,
    theme,
    light,
    user,
    userName,
    profileName,
    setProfileName,
    profilePhone,
    setProfilePhone,
    profileSaving,
    saveProfile,
    whatsappCode,
    generateWhatsappCode,
    sync,
    syncColor,
    householdId,
    exportAccountData,
    sendPasswordResetFromProfile,
    deleteAccount
  } = ctx;

  return (
    <div className="fade">
      <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", justifyContent: "space-between", gap: 12, marginBottom: mobile ? 16 : 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: mobile ? 20 : 26, color: theme.text }}>Perfil</h1>
          <p style={{ color: light ? "#334155" : "#64748b", marginTop: 4, fontSize: 12 }}>Dados da sua conta de acesso</p>
        </div>
        <Btn onClick={saveProfile} disabled={profileSaving}>{profileSaving ? "Salvando..." : "Salvar perfil"}</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.15fr .85fr", gap: mobile ? 12 : 14 }}>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#6EE7B733", border: "2px solid #6EE7B7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 22, color: "#6EE7B7", flexShrink: 0 }}>{(userName[0] || "?").toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: theme.text, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</div>
              <div style={{ fontSize: 12, color: light ? "#334155" : "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
            </div>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            <div><label style={{ display: "block", fontSize: 12, color: theme.nav, marginBottom: 6 }}>Nome</label><input value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Seu nome" style={inputStyle(theme)} /></div>
            <div><label style={{ display: "block", fontSize: 12, color: theme.nav, marginBottom: 6 }}>E-mail</label><input value={user.email || ""} readOnly style={{ ...inputStyle(theme), background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)", color: theme.nav }} /></div>
            <div><label style={{ display: "block", fontSize: 12, color: theme.nav, marginBottom: 6 }}>Telefone</label><input value={profilePhone} onChange={e => setProfilePhone(e.target.value)} placeholder="(00) 00000-0000" inputMode="tel" style={inputStyle(theme)} /></div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: theme.text, marginBottom: 14 }}>WhatsApp</h3>
          <div style={{ color: light ? "#334155" : "#64748b", fontSize: 13, lineHeight: 1.4, marginBottom: 12 }}>Gere um codigo e envie no WhatsApp do Spend Wise: <span style={{ color: "#6EE7B7", fontFamily: "'DM Mono',monospace" }}>conectar CODIGO</span></div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
            <div style={{ flex: 1, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "11px 12px", fontFamily: "'DM Mono',monospace", fontSize: 16, color: whatsappCode ? "#6EE7B7" : theme.nav, textAlign: "center", letterSpacing: 1 }}>{whatsappCode || "SEM CODIGO"}</div>
            <button onClick={generateWhatsappCode} style={{ padding: "11px 12px", borderRadius: 10, border: "none", background: "#6EE7B722", color: "#6EE7B7", cursor: "pointer", fontWeight: 700 }}>Gerar</button>
          </div>
          <div style={{ color: light ? "#334155" : "#64748b", fontSize: 12, lineHeight: 1.4, marginBottom: 16 }}>Depois de conectado, envie frases como: paguei 89,90 no mercado hoje categoria Alimentacao.</div>

          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: theme.text, marginBottom: 14 }}>Resumo</h3>
          <div style={{ display: "grid", gap: 12, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, borderBottom: "1px solid rgba(255,255,255,.06)", paddingBottom: 10 }}><span style={{ color: light ? "#334155" : "#64748b" }}>Status</span><span style={{ color: syncColor, fontFamily: "'DM Mono',monospace" }}>{sync === "saving" ? "salvando" : sync === "err" ? "erro" : "sincronizado"}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, borderBottom: "1px solid rgba(255,255,255,.06)", paddingBottom: 10 }}><span style={{ color: light ? "#334155" : "#64748b" }}>Conta</span><span style={{ color: theme.nav, textAlign: "right" }}>{householdId ? "Compartilhada" : "Individual"}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span style={{ color: light ? "#334155" : "#64748b" }}>ID</span><span style={{ color: theme.nav, textAlign: "right", fontSize: 11, wordBreak: "break-all" }}>{user.uid}</span></div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: mobile ? 12 : 14 }}>
        <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", justifyContent: "space-between", gap: 14, alignItems: mobile ? "stretch" : "center" }}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: theme.text, marginBottom: 6 }}>Administracao da conta</h3>
            <div style={{ color: light ? "#334155" : "#64748b", fontSize: 12, lineHeight: 1.45 }}>Seguranca, portabilidade e encerramento da conta em um unico lugar.</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={sendPasswordResetFromProfile} style={{ padding: "10px 12px", borderRadius: 9, border: "none", background: "rgba(255,255,255,.06)", color: theme.nav, cursor: "pointer", fontSize: 12 }}>Redefinir senha</button>
            <button onClick={exportAccountData} style={{ padding: "10px 12px", borderRadius: 9, border: "none", background: "#6EE7B722", color: "#6EE7B7", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Exportar dados</button>
            <button onClick={deleteAccount} style={{ padding: "10px 12px", borderRadius: 9, border: "1px solid rgba(248,113,113,.35)", background: "rgba(248,113,113,.10)", color: "#F87171", cursor: "pointer", fontSize: 12 }}>Excluir conta</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3,1fr)", gap: 10, marginTop: 14 }}>
          <div style={{ background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "11px 12px" }}>
            <div style={{ color: theme.nav, fontSize: 12, marginBottom: 5 }}>Autenticacao</div>
            <div style={{ color: light ? "#334155" : "#64748b", fontSize: 12 }}>O e-mail de redefinicao usa a tela personalizada do Spend Wise.</div>
          </div>
          <div style={{ background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "11px 12px" }}>
            <div style={{ color: theme.nav, fontSize: 12, marginBottom: 5 }}>Portabilidade</div>
            <div style={{ color: light ? "#334155" : "#64748b", fontSize: 12 }}>O JSON exportado inclui perfil, base atual e estado financeiro carregado no app.</div>
          </div>
          <div style={{ background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "11px 12px" }}>
            <div style={{ color: theme.nav, fontSize: 12, marginBottom: 5 }}>Encerramento</div>
            <div style={{ color: light ? "#334155" : "#64748b", fontSize: 12 }}>O Firebase pode pedir login recente antes de excluir a conta.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
