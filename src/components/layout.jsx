import { MONTHS, fmt } from "../domain/constants";
import { creatorInfo, txStatus } from "../domain/transactions";
import { Btn, EmptyState, Modal, ModalCard, Portal } from "./ui";

function MobileTopBar({ light, logout, MonthPicker, setMobileMenuOpen, syncColor, theme, toggleTheme }) {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100, background: theme.panel, backdropFilter: "blur(14px)", borderBottom: "1px solid " + theme.border, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <button onClick={() => setMobileMenuOpen(true)} title="Menu" style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.05)", color: light ? "#1f2937" : "#e2e8f0", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>☰</button>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: theme.text, whiteSpace: "nowrap" }}>Spend Wise</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={toggleTheme} title="Tema" style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid " + theme.border, background: theme.soft, color: theme.nav, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{light ? "☀" : "☾"}</button>
        <MonthPicker compact />
        <span style={{ fontSize: 12, color: syncColor }}>●</span>
        <button onClick={logout} style={{ background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.3)", borderRadius: 6, padding: "4px 8px", color: "#F87171", cursor: "pointer", fontSize: 12 }}>⏻</button>
      </div>
    </div>
  );
}

function MobileDrawer({ goView, light, navItems, setMobileMenuOpen, setShowMobileNavSettings, sync, syncColor, theme, toggleTheme, user, userName, view }) {
  return (
    <Portal>
      <div onClick={() => setMobileMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.62)", zIndex: 9000, backdropFilter: "blur(4px)" }}>
        <aside onClick={e => e.stopPropagation()} style={{ width: "min(82vw,300px)", height: "100vh", background: theme.drawer, borderRight: "1px solid " + theme.border, boxShadow: "18px 0 50px rgba(0,0,0,.45)", padding: "20px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px 8px" }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: theme.text }}>Spend Wise</div>
              <div style={{ fontSize: 11, color: syncColor, marginTop: 3, fontFamily: "'DM Mono',monospace" }}>● {sync === "saving" ? "salvando..." : sync === "err" ? "erro sync" : "sincronizado"}</div>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.05)", color: theme.nav, cursor: "pointer" }}>×</button>
          </div>
          <div style={{ padding: "10px 12px", background: light ? "#eef4fb" : "rgba(255,255,255,.03)", borderRadius: 12, border: "1px solid " + theme.border, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#6EE7B733", border: "2px solid #6EE7B7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 14, color: "#6EE7B7", flexShrink: 0 }}>{(userName[0] || "?").toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, color: light ? "#1f2937" : "#e2e8f0", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</div>
              <div style={{ fontSize: 11, color: light ? "#334155" : "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
            </div>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 4, overflowY: "auto", paddingBottom: 8 }}>
            {navItems.map(n => (
              <button key={n.id} onClick={() => goView(n.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 13px", borderRadius: 10, border: "none", background: view === n.id ? (light ? "#c8f4e5" : "rgba(110,231,183,.12)") : "transparent", color: view === n.id ? (light ? "#047857" : "#6EE7B7") : theme.nav, cursor: "pointer", width: "100%", fontSize: 14, fontWeight: view === n.id ? 600 : 400, textAlign: "left" }}>
                <span style={{ fontSize: 16, width: 18, textAlign: "center", color: view === n.id ? (light ? "#047857" : "#6EE7B7") : theme.nav, fontFamily: "'DM Mono',monospace", lineHeight: 1 }}>{n.i}</span>{n.l}
              </button>
            ))}
          </nav>
          <div style={{ marginTop: "auto", display: "grid", gap: 8 }}>
            <button onClick={toggleTheme} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "12px", borderRadius: 10, border: "1px solid " + theme.border, background: theme.soft, color: theme.nav, fontWeight: 700, cursor: "pointer" }}><span>Tema</span><span style={{ color: "#6EE7B7" }}>{light ? "Claro" : "Escuro"}</span></button>
            <button onClick={() => { setShowMobileNavSettings(true); setMobileMenuOpen(false); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 10, border: "1px solid rgba(110,231,183,.25)", background: "rgba(110,231,183,.08)", color: "#6EE7B7", fontWeight: 700, cursor: "pointer" }}>⚙ Personalizar barra</button>
          </div>
        </aside>
      </div>
    </Portal>
  );
}

function DesktopSidebar({ balance, goMonth, light, logout, navItems, selMonth, selYear, setView, sync, syncColor, theme, toggleTheme, user, userName, view }) {
  return (
    <aside style={{ width: 250, flexShrink: 0, background: theme.side, borderRight: "1px solid " + theme.border, display: "flex", flexDirection: "column", padding: "24px 0", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: theme.text }}>Spend Wise</div>
        <div style={{ fontSize: 11, color: syncColor, marginTop: 4, fontFamily: "'DM Mono',monospace" }}>● {sync === "saving" ? "salvando..." : sync === "err" ? "erro sync" : "sincronizado"}</div>
      </div>
      <div style={{ margin: "0 12px 16px", minHeight: 64, padding: "11px 46px 11px 12px", background: light ? "#e3edf8" : "rgba(255,255,255,.03)", borderRadius: 12, border: "1px solid " + theme.border, display: "flex", alignItems: "center", gap: 10, position: "relative", overflow: "visible", boxShadow: light ? "0 8px 18px rgba(15,23,42,.10)" : "none" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#6EE7B733", border: "2px solid #6EE7B7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 14, color: "#6EE7B7", flexShrink: 0 }}>{(userName[0] || "?").toUpperCase()}</div>
        <div style={{ minWidth: 0, flex: 1, display: "grid", gap: 2 }}>
          <div title={userName} style={{ fontSize: 13, color: light ? "#0f172a" : "#e2e8f0", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.25 }}>{userName}</div>
          <div title={user.email} style={{ fontSize: 11, color: light ? "#334155" : "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.25 }}>{user.email}</div>
        </div>
        <button onClick={logout} title="Sair" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: light ? "#fee2e2" : "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.45)", borderRadius: 8, padding: 0, width: 30, height: 30, color: light ? "#dc2626" : "#F87171", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>⏻</button>
      </div>
      <button onClick={toggleTheme} style={{ margin: "0 12px 12px", padding: "10px 12px", borderRadius: 10, border: "1px solid " + theme.border, background: theme.soft, color: theme.nav, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}><span>Tema</span><strong style={{ color: "#6EE7B7" }}>{light ? "Claro" : "Escuro"}</strong></button>
      <div style={{ borderTop: "1px solid " + theme.border, paddingTop: 12 }} />
      <nav style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map(n => (
          <button key={n.id} onClick={() => setView(n.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, border: "none", background: view === n.id ? (light ? "#c8f4e5" : "rgba(110,231,183,.12)") : "transparent", color: view === n.id ? (light ? "#047857" : "#6EE7B7") : theme.nav, cursor: "pointer", width: "100%", fontSize: 14, fontWeight: view === n.id ? 600 : 400, transition: "all .15s" }}>
            <span style={{ fontSize: 16, width: 18, textAlign: "center", color: view === n.id ? (light ? "#047857" : "#6EE7B7") : theme.nav, fontFamily: "'DM Mono',monospace", lineHeight: 1 }}>{n.i}</span>{n.l}
          </button>
        ))}
      </nav>
      <div style={{ margin: "0 12px 8px", padding: "9px 12px", background: light ? "#eef4fb" : "rgba(255,255,255,.03)", borderRadius: 12, border: "1px solid " + theme.border }}>
        <div style={{ fontSize: 10, color: light ? "#334155" : "#64748b", marginBottom: 6, fontFamily: "'DM Mono',monospace", letterSpacing: ".06em" }}>PERIODO</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          <button onClick={() => goMonth(1)} style={{ background: "rgba(255,255,255,.07)", border: "none", borderRadius: 6, width: 24, height: 24, color: light ? "#475569" : "#888", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, color: theme.text, fontWeight: 700, lineHeight: 1.05 }}>{MONTHS[selMonth]}</div>
            <div style={{ fontSize: 10, color: light ? "#334155" : "#64748b", fontFamily: "'DM Mono',monospace", lineHeight: 1.05 }}>{selYear}</div>
          </div>
          <button onClick={() => goMonth(-1)} style={{ background: "rgba(255,255,255,.07)", border: "none", borderRadius: 6, width: 24, height: 24, color: light ? "#475569" : "#888", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        </div>
      </div>
      <div style={{ margin: "0 12px", background: balance >= 0 ? "rgba(110,231,183,.08)" : "rgba(248,113,113,.08)", border: `1px solid ${balance >= 0 ? "#6EE7B733" : "#F8717133"}`, borderRadius: 12, padding: "14px 16px" }}>
        <div style={{ fontSize: 11, color: light ? "#475569" : "#888", marginBottom: 4 }}>SALDO · {MONTHS[selMonth].toUpperCase()}</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: balance >= 0 ? "#6EE7B7" : "#F87171" }}>{fmt(balance)}</div>
      </div>
    </aside>
  );
}

function FloatingActionButton({ mobile, theme, onAdd }) {
  return (
    <button
      onClick={onAdd}
      style={{
        position: "fixed",
        bottom: mobile ? "calc(78px + env(safe-area-inset-bottom, 0px))" : 28,
        right: mobile ? 14 : 28,
        width: mobile ? 44 : 52,
        height: mobile ? 44 : 52,
        borderRadius: "50%",
        border: "none",
        background: "linear-gradient(135deg,#6EE7B7,#3B82F6)",
        color: theme.text,
        fontSize: mobile ? 22 : 24,
        cursor: "pointer",
        boxShadow: "0 6px 24px #6EE7B755",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 500
      }}
    >
      +
    </button>
  );
}

function MobileBottomNav({ light, mobileNavItems, setMobileMenuOpen, goView, view }) {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(10,15,26,.97)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(255,255,255,.08)",
        display: "grid",
        gridTemplateColumns: `repeat(${mobileNavItems.length + 1},minmax(0,1fr))`,
        alignItems: "center",
        padding: "7px 4px calc(13px + env(safe-area-inset-bottom, 0px))",
        zIndex: 200
      }}
    >
      <button onClick={() => setMobileMenuOpen(true)} style={mobileNavButtonStyle}>
        <span style={{ ...mobileNavIconStyle, color: light ? "#334155" : "#64748b" }}>☰</span>
        <span style={{ ...mobileNavLabelStyle, color: light ? "#334155" : "#64748b" }}>Menu</span>
      </button>
      {mobileNavItems.map(n => (
        <button key={n.id} onClick={() => goView(n.id)} style={mobileNavButtonStyle}>
          <span style={{ ...mobileNavIconStyle, color: view === n.id ? "#6EE7B7" : "#64748b" }}>{n.i}</span>
          <span style={{ ...mobileNavLabelStyle, color: view === n.id ? "#6EE7B7" : "#64748b", fontWeight: view === n.id ? 600 : 400 }}>{n.l}</span>
        </button>
      ))}
    </nav>
  );
}

const mobileNavButtonStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 3,
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "4px 2px",
  minWidth: 0
};

const mobileNavIconStyle = {
  fontSize: 20,
  width: 20,
  textAlign: "center",
  fontFamily: "'DM Mono',monospace",
  lineHeight: 1
};

const mobileNavLabelStyle = {
  fontSize: 10,
  whiteSpace: "nowrap",
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

function MobileNavSettingsModal({ theme, navItems, mobileNavIds, toggleMobileNav, onClose }) {
  return (
    <Modal onClose={onClose}>
      <ModalCard>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: theme.text, marginBottom: 6 }}>Barra inferior</h2>
        <p style={{ fontSize: 13, color: theme.nav, marginBottom: 18 }}>Escolha ate 4 opcoes para aparecer no menu inferior do celular.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
          {navItems.map(n => {
            const checked = mobileNavIds.includes(n.id);
            return (
              <button
                key={n.id}
                onClick={() => toggleMobileNav(n.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "11px 10px",
                  borderRadius: 10,
                  border: checked ? "1px solid rgba(110,231,183,.45)" : "1px solid rgba(255,255,255,.08)",
                  background: checked ? "rgba(110,231,183,.12)" : "rgba(255,255,255,.04)",
                  color: checked ? "#6EE7B7" : "#cbd5e1",
                  cursor: "pointer",
                  fontSize: 13,
                  textAlign: "left"
                }}
              >
                <span style={{ width: 18, textAlign: "center", fontFamily: "'DM Mono',monospace" }}>{n.i}</span>
                <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.l}</span>
              </button>
            );
          })}
        </div>
        <Btn onClick={onClose} style={{ width: "100%" }}>
          Concluir
        </Btn>
      </ModalCard>
    </Modal>
  );
}

function CalendarDayModal({ generateRecurring, light, onClose, onEditTransaction, selectedCalendarDay, selectedCalendarRecurring, selectedCalendarTxs, selMonth, theme, togglePaid, userName }) {
  return (
    <Modal onClose={onClose}>
      <ModalCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: theme.text }}>Dia {selectedCalendarDay} · {MONTHS[selMonth]}</h2>
            <div style={{ color: light ? "#334155" : "#64748b", fontSize: 13, marginTop: 4 }}>{selectedCalendarTxs.length} transacao(oes) · {selectedCalendarRecurring.length} vencimento(s)</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.08)", border: "none", borderRadius: 8, width: 32, height: 32, color: theme.nav, cursor: "pointer", fontSize: 18 }}>×</button>
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: theme.text, marginBottom: 10 }}>Transacoes</h3>
            {selectedCalendarTxs.length === 0 ? (
              <EmptyState title="Nenhuma transacao nesse dia" body="Sem receitas, despesas ou lancamentos previstos para esta data." />
            ) : (
              selectedCalendarTxs.map(t => {
                const st = txStatus(t);
                const creator = creatorInfo(t, userName);
                return (
                  <div key={t._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "10px 0", borderTop: "1px solid " + theme.border, borderLeft: "3px solid " + st.color, paddingLeft: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <div title={"Criado por " + creator.name} style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#334155,#0f172a)", border: "1px solid " + st.color + "66", color: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{creator.initials}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: theme.text, fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.paid ? "✓ " : ""}{t.desc}</div>
                        <div style={{ color: light ? "#334155" : "#64748b", fontSize: 12 }}>{t.category} · <span style={{ color: st.color }}>{st.label}</span> · {creator.name}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span style={{ fontFamily: "'DM Mono',monospace", color: t.type === "income" ? "#059669" : "#dc2626", fontSize: 13 }}>{t.type === "income" ? "+" : "-"}{fmt(t.amount)}</span>
                      <button onClick={() => togglePaid(t)} style={{ background: t.paid ? "#6EE7B722" : "rgba(255,255,255,.05)", border: "1px solid " + theme.border, borderRadius: 8, padding: "7px 9px", color: t.paid ? "#6EE7B7" : theme.nav, cursor: "pointer", fontSize: 12 }}>{t.paid ? "Pago" : "Pagar"}</button>
                      <button onClick={() => onEditTransaction(t)} style={{ background: "rgba(255,255,255,.05)", border: "1px solid " + theme.border, borderRadius: 8, padding: "7px 9px", color: theme.nav, cursor: "pointer", fontSize: 12 }}>Editar</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: theme.text, marginBottom: 10 }}>Vencimentos recorrentes</h3>
            {selectedCalendarRecurring.length === 0 ? (
              <div style={{ color: light ? "#334155" : "#64748b", fontSize: 13 }}>Nenhum vencimento recorrente nesse dia.</div>
            ) : (
              selectedCalendarRecurring.map(r => (
                <div key={r._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "10px 0", borderTop: "1px solid " + theme.border }}>
                  <div>
                    <div style={{ color: theme.text, fontSize: 14, fontWeight: 700 }}>↻ {r.desc}</div>
                    <div style={{ color: light ? "#334155" : "#64748b", fontSize: 12 }}>{r.category} · vence dia {r.day}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "'DM Mono',monospace", color: "#dc2626", fontSize: 13 }}>{fmt(r.amount || 0)}</span>
                    <button onClick={() => generateRecurring(r)} style={{ background: "#6EE7B722", border: "1px solid " + theme.border, borderRadius: 8, padding: "7px 9px", color: "#6EE7B7", cursor: "pointer", fontSize: 12 }}>Gerar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </ModalCard>
    </Modal>
  );
}

export { CalendarDayModal, DesktopSidebar, FloatingActionButton, MobileBottomNav, MobileDrawer, MobileNavSettingsModal, MobileTopBar };
