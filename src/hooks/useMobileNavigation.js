import { useState } from "react";

const DEFAULT_MOBILE_NAV = ["dashboard", "transactions", "cards", "shopping"];

const NAV_ITEMS = [
  { id: "dashboard", l: "Inicio", i: "◈" },
  { id: "transactions", l: "Lancamentos", i: "⇄" },
  { id: "search", l: "Busca", i: "⌕" },
  { id: "calendar", l: "Calendario", i: "□" },
  { id: "closing", l: "Fechamento", i: "▣" },
  { id: "rules", l: "Regras", i: "≡" },
  { id: "import", l: "Importar", i: "⇩" },
  { id: "recurring", l: "Recorrentes", i: "↻" },
  { id: "cards", l: "Cartoes", i: "▤" },
  { id: "shopping", l: "Compras", i: "☑" },
  { id: "notifications", l: "Alertas", i: "!" },
  { id: "shortcuts", l: "Atalhos", i: "↯" },
  { id: "shared", l: "Conta", i: "●" },
  { id: "profile", l: "Perfil", i: "◌" },
  { id: "goals", l: "Metas", i: "◎" },
  { id: "report", l: "Relatorio", i: "▦" }
];

function loadMobileNavIds() {
  try {
    const saved = JSON.parse(localStorage.getItem("financas-mobile-nav") || "null");
    return Array.isArray(saved) && saved.length ? saved.slice(0, 4) : DEFAULT_MOBILE_NAV;
  } catch (e) {
    return DEFAULT_MOBILE_NAV;
  }
}

function useMobileNavigation({ setView }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileNavSettings, setShowMobileNavSettings] = useState(false);
  const [mobileNavIds, setMobileNavIds] = useState(loadMobileNavIds);

  const navItems = NAV_ITEMS;
  const mobileNavItems = navItems.filter(item => mobileNavIds.includes(item.id)).slice(0, 4);

  const goView = id => {
    setView(id);
    setMobileMenuOpen(false);
  };

  const toggleMobileNav = id =>
    setMobileNavIds(current => {
      let next = current.includes(id) ? current.filter(item => item !== id) : [...current, id];
      if (next.length < 1) next = [id];
      if (next.length > 4) {
        alert("Escolha no maximo 4 itens para a barra inferior.");
        return current;
      }
      localStorage.setItem("financas-mobile-nav", JSON.stringify(next));
      return next;
    });

  return {
    mobileMenuOpen,
    setMobileMenuOpen,
    showMobileNavSettings,
    setShowMobileNavSettings,
    mobileNavIds,
    navItems,
    mobileNavItems,
    goView,
    toggleMobileNav
  };
}

export { DEFAULT_MOBILE_NAV, NAV_ITEMS, useMobileNavigation };
