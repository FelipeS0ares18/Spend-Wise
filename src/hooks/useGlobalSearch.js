import { useState } from "react";

function active(item) {
  return !item.deleted && !item.archived && !item.removed;
}

function useGlobalSearch({ txs, goals, recurring, cards, shopping, shortcuts, fmt }) {
  const [globalSearch, setGlobalSearch] = useState("");
  const searchQ = globalSearch.trim().toLowerCase();

  const searchResults = searchQ
    ? [
        ...txs
          .filter(t => active(t) && [t.desc, t.category, t.cardName, t.owner, t.type].join(" ").toLowerCase().includes(searchQ))
          .map(t => ({ kind: "Lancamento", title: t.desc, meta: (t.category || "") + " · " + fmt(t.amount) + " · " + (t.date || ""), view: "transactions" })),
        ...goals
          .filter(g => active(g) && [g.name, g.icon].join(" ").toLowerCase().includes(searchQ))
          .map(g => ({ kind: "Meta", title: g.name, meta: fmt(g.saved || 0) + " / " + fmt(g.target || 0), view: "goals" })),
        ...recurring
          .filter(r => r.active !== false && active(r) && [r.desc, r.category].join(" ").toLowerCase().includes(searchQ))
          .map(r => ({ kind: "Recorrente", title: r.desc, meta: "Dia " + (r.day || "-") + " · " + fmt(r.amount || 0), view: "recurring" })),
        ...cards
          .filter(c => active(c) && [c.name].join(" ").toLowerCase().includes(searchQ))
          .map(c => ({ kind: "Cartao", title: c.name, meta: "Limite " + fmt(c.limit || 0), view: "cards" })),
        ...shopping
          .filter(i => active(i) && [i.name].join(" ").toLowerCase().includes(searchQ))
          .map(i => ({ kind: "Compra", title: i.name, meta: "Qtd " + (i.qty || 1), view: "shopping" })),
        ...shortcuts
          .filter(x => active(x) && [x.label, x.desc, x.category].join(" ").toLowerCase().includes(searchQ))
          .map(x => ({ kind: "Atalho", title: x.label, meta: fmt(x.amount || 0) + " · " + (x.category || ""), view: "shortcuts" }))
      ]
    : [];

  return { globalSearch, setGlobalSearch, searchQ, searchResults };
}

export { useGlobalSearch };
