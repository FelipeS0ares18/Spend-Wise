const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"] as const;
const CATS = ["SalÃ¡rio", "Moradia", "AlimentaÃ§Ã£o", "Transporte", "SaÃºde", "Lazer", "Utilidades", "EducaÃ§Ã£o", "Outros"] as const;
const CCOLOR: Record<string, string> = {
  "SalÃ¡rio": "#6EE7B7",
  Moradia: "#93C5FD",
  "AlimentaÃ§Ã£o": "#FCD34D",
  Transporte: "#C4B5FD",
  "SaÃºde": "#F9A8D4",
  Lazer: "#FB923C",
  Utilidades: "#94A3B8",
  "EducaÃ§Ã£o": "#67E8F9",
  Outros: "#CBD5E1"
};
const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 100));
const baseThemeForSharedComponents = { text: "#fff", nav: "#94a3b8" };
const theme = baseThemeForSharedComponents;
const light = false;

export { MONTHS, CATS, CCOLOR, fmt, pct, theme, light };
