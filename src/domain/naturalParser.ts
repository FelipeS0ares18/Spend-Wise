import { CATS } from "./constants";

type CurrentUser = {
  uid?: string;
  displayName?: string | null;
} | null;

type NaturalTransaction = {
  desc: string;
  amount: number | "";
  type: "income" | "expense";
  category: string;
  owner: "casal";
  date: string;
  paid: boolean;
  notesCount: number;
  source: "quick-natural";
  rawText: string;
};

function addDaysToISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function dateFromNaturalText(text: string): string {
  const q = (text || "").toLowerCase();
  if (/\banteontem\b/.test(q)) return addDaysToISO(-2);
  if (/\bontem\b/.test(q)) return addDaysToISO(-1);
  if (/\bamanh[aÃ£]\b/.test(q)) return addDaysToISO(1);
  const explicit = q.match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/);
  if (explicit) {
    const now = new Date();
    const day = explicit[1].padStart(2, "0");
    const month = explicit[2].padStart(2, "0");
    const year = explicit[3] ? (explicit[3].length === 2 ? "20" + explicit[3] : explicit[3]) : String(now.getFullYear());
    return year + "-" + month + "-" + day;
  }
  const dayOnly = q.match(/\b(?:dia|vence dia|vencimento dia)\s+(\d{1,2})\b/);
  if (dayOnly) {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), Number(dayOnly[1]), 12);
    return d.toISOString().split("T")[0];
  }
  return addDaysToISO(0);
}

function amountFromNaturalText(text: string): number | "" {
  const q = (text || "").replace(/reais?/gi, "").replace(/,/g, ".");
  const match = q.match(/(?:r\$\s*)?(\d+(?:\.\d{1,2})?)/i);
  return match ? Number(match[1]) : "";
}

function normalizeNaturalText(text: string): string {
  return (text || "").replace(/\bpics\b/gi, "pix").replace(/\bpic\b/gi, "pix");
}

function plainText(v: unknown): string {
  return String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const NATURAL_CATEGORY_ALIASES = [
  { cat: () => CATS[0], terms: ["salario", "ordenado", "pagamento"] },
  { cat: () => CATS[1], terms: ["moradia", "aluguel", "condominio", "casa"] },
  { cat: () => CATS[2], terms: ["alimentacao", "alimentaÃ§Ã£o", "mercado", "supermercado", "comida", "restaurante"] },
  { cat: () => CATS[3], terms: ["transporte", "uber", "taxi", "gasolina", "combustivel", "onibus", "metro"] },
  { cat: () => CATS[4], terms: ["saude", "saÃºde", "farmacia", "remedio", "medico", "consulta", "exame"] },
  { cat: () => CATS[5], terms: ["lazer", "cinema", "bar", "viagem", "show"] },
  { cat: () => CATS[6], terms: ["utilidades", "luz", "energia", "agua", "internet", "telefone", "celular", "gas"] },
  { cat: () => CATS[7], terms: ["educacao", "educaÃ§Ã£o", "escola", "faculdade", "curso"] },
  { cat: () => CATS[8], terms: ["outros", "outro"] }
];

function findNaturalCategory(text: string): string | null {
  const plain = plainText(text);
  const explicit = plain.match(/\b(?:categoria|categorizar como|na categoria|como categoria)\s+(.+?)$/);
  const scope = explicit ? explicit[1] : plain;
  const hit = NATURAL_CATEGORY_ALIASES.find(item => item.terms.some(term => scope.includes(plainText(term))));
  return hit ? hit.cat() : null;
}

function categoryFromNaturalText(text: string, type: "income" | "expense"): string {
  const normalized = normalizeNaturalText(text);
  const explicitOrDirect = findNaturalCategory(normalized);
  if (explicitOrDirect) return explicitOrDirect;
  const q = normalized.toLowerCase();
  const rules: [string, RegExp][] = [
    [CATS[0], /sal[aÃ¡]rio|ordenado|pagamento|recebi|receita|entrada|pix recebido|freela|bonus|b[oÃ´]nus/],
    [CATS[2], /mercado|supermercado|padaria|ifood|i food|restaurante|lanche|almo[cÃ§]o|jantar|pizza|comida|a[cÃ§]ougue|hortifruti/],
    [CATS[3], /uber|99|taxi|t[aÃ¡]xi|gasolina|combust[iÃ­]vel|posto|estacionamento|ped[aÃ¡]gio|onibus|[Ã´o]nibus|metro|metr[oÃ´]/],
    [CATS[1], /aluguel|condom[iÃ­]nio|financiamento|casa|apartamento|iptu/],
    [CATS[6], /luz|energia|[aÃ¡]gua|internet|telefone|celular|g[aÃ¡]s|netflix|spotify|streaming|assinatura/],
    [CATS[4], /farm[aÃ¡]cia|rem[eÃ©]dio|m[eÃ©]dico|consulta|exame|hospital|plano de sa[uÃº]de|dentista/],
    [CATS[7], /escola|faculdade|curso|livro|material escolar|mensalidade/],
    [CATS[5], /cinema|bar|viagem|hotel|show|jogo|presente|shopping|lazer/]
  ];
  const hit = rules.find(([, rx]) => rx.test(q));
  if (hit) return hit[0];
  return type === "income" ? CATS[0] : CATS[8];
}

function stripCategoryFromDescription(text: string): string {
  let d = normalizeNaturalText(text);
  d = d.replace(/\b(?:categoria|categorizar como|na categoria|como categoria)\b[\s\S]*$/i, " ");
  ["salario", "moradia", "alimentacao", "alimentaÃ§Ã£o", "transporte", "saude", "saÃºde", "lazer", "utilidades", "educacao", "educaÃ§Ã£o", "outros", "outro"].forEach(term => {
    d = d.replace(new RegExp("\\b" + term + "\\b", "gi"), " ");
  });
  return d;
}

function descFromNaturalText(text: string, amount: number | ""): string {
  let d = stripCategoryFromDescription(text).trim();
  d = d.replace(/\b(gastei|paguei|comprei|lancei|lanÃ§ar|lancar|registre|recebi|ganhei|entrada de|despesa de|receita de|no valor de|valor de)\b/gi, " ");
  d = d.replace(/(?:r\$\s*)?\d+(?:[,.]\d{1,2})?/gi, " ");
  d = d.replace(/\b(hoje|ontem|anteontem|amanh[aÃ£]|dia\s+\d{1,2}|em\s+\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)\b/gi, " ");
  d = d.replace(/\s+/g, " ").trim();
  return d || "Entrada rÃ¡pida";
}

function parseNaturalTransaction(text: string, currentUser?: CurrentUser): NaturalTransaction {
  void currentUser;
  const normalizedText = normalizeNaturalText(text);
  const q = normalizedText.toLowerCase();
  const amount = amountFromNaturalText(normalizedText);
  const income = /\b(recebi|ganhei|sal[aÃ¡]rio|receita|entrada|pix recebido|freela|bonus|b[oÃ´]nus)\b/.test(q);
  const due = /\b(vence|vencimento|pagar|pendente|boleto)\b/.test(q);
  const type = income ? "income" : "expense";
  const date = dateFromNaturalText(normalizedText);
  const category = categoryFromNaturalText(normalizedText, type);
  const paid = income || (/\b(gastei|paguei|comprei|recebi|ganhei)\b/.test(q) && !due);
  return {
    desc: descFromNaturalText(normalizedText, amount),
    amount,
    type,
    category,
    owner: "casal",
    date,
    paid,
    notesCount: 0,
    source: "quick-natural",
    rawText: normalizedText || ""
  };
}

export {
  addDaysToISO,
  dateFromNaturalText,
  amountFromNaturalText,
  normalizeNaturalText,
  plainText,
  parseNaturalTransaction
};
