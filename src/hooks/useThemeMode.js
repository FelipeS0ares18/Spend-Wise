import { useEffect, useState } from "react";

function useThemeMode() {
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem("financas-theme") || "dark");

  useEffect(() => {
    localStorage.setItem("financas-theme", themeMode);
    document.body.dataset.theme = themeMode;
    let el = document.getElementById("financas-theme-overrides");
    if (!el) {
      el = document.createElement("style");
      el.id = "financas-theme-overrides";
      document.head.appendChild(el);
    }
    el.textContent =
      themeMode === "light"
        ? `body[data-theme="light"]{background:#f1f4f8!important;color:#0f172a!important;}body[data-theme="light"] .card{background:#ffffff!important;border-color:rgba(15,23,42,.20)!important;box-shadow:0 12px 30px rgba(15,23,42,.13)!important;}body[data-theme="light"] .card:hover{box-shadow:0 16px 38px rgba(15,23,42,.18)!important;}body[data-theme="light"] input,body[data-theme="light"] select,body[data-theme="light"] textarea{background:#ffffff!important;border-color:rgba(15,23,42,.28)!important;color:#0f172a!important;}body[data-theme="light"] input::placeholder,body[data-theme="light"] textarea::placeholder{color:#475569!important;}body[data-theme="light"] h1,body[data-theme="light"] h2,body[data-theme="light"] h3{color:#0f172a!important;}body[data-theme="light"] p{color:#334155!important;}body[data-theme="light"] .tx-row:hover{background:rgba(15,23,42,.06)!important;}`
        : "";
  }, [themeMode]);

  const light = themeMode === "light";
  const theme = {
    page: light ? "linear-gradient(180deg,#f1f4f8,#e7edf4)" : "radial-gradient(ellipse at 20% 50%,#0d1b2a,#0A0F1A)",
    panel: light ? "rgba(248,250,252,.97)" : "rgba(10,15,26,.96)",
    side: light ? "#f8fafc" : "rgba(255,255,255,.025)",
    drawer: light ? "#f8fafc" : "#0f1724",
    border: light ? "rgba(15,23,42,.20)" : "rgba(255,255,255,.07)",
    text: light ? "#0f172a" : "#fff",
    muted: light ? "#334155" : "#64748b",
    nav: light ? "#1e293b" : "#94a3b8",
    soft: light ? "rgba(15,23,42,.08)" : "rgba(255,255,255,.05)"
  };
  const toggleTheme = () => setThemeMode(m => (m === "light" ? "dark" : "light"));

  return { themeMode, setThemeMode, light, theme, toggleTheme };
}

export { useThemeMode };
