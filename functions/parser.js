const CATS = ["Salário","Moradia","Alimentação","Transporte","Saúde","Lazer","Utilidades","Educação","Outros"];

function addDaysToISO(days) {
  const d = new Date();
  d.setDate(d.getDate()+days);
  return d.toISOString().split("T")[0];
}

function normalizeNaturalText(text) {
  return String(text || "").replace(/\bpics\b/gi,"pix").replace(/\bpic\b/gi,"pix");
}

function plainText(v) {
  return String(v || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
}

function dateFromNaturalText(text) {
  const q = plainText(text);
  if (/\banteontem\b/.test(q)) return addDaysToISO(-2);
  if (/\bontem\b/.test(q)) return addDaysToISO(-1);
  if (/\bamanha\b/.test(q)) return addDaysToISO(1);
  const explicit = q.match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/);
  if (explicit) {
    const now = new Date();
    const day = explicit[1].padStart(2,"0");
    const month = explicit[2].padStart(2,"0");
    const year = explicit[3] ? (explicit[3].length===2 ? "20"+explicit[3] : explicit[3]) : String(now.getFullYear());
    return year+"-"+month+"-"+day;
  }
  const dayOnly = q.match(/\b(?:dia|vence dia|vencimento dia)\s+(\d{1,2})\b/);
  if (dayOnly) {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), Number(dayOnly[1]), 12);
    return d.toISOString().split("T")[0];
  }
  return addDaysToISO(0);
}

function amountFromNaturalText(text) {
  const q = normalizeNaturalText(text).replace(/reais?/gi,"").replace(/,/g,".");
  const match = q.match(/(?:r\$\s*)?(\d+(?:\.\d{1,2})?)/i);
  return match ? Number(match[1]) : "";
}

const NATURAL_CATEGORY_ALIASES = [
  {cat:CATS[0], terms:["salario","ordenado","pagamento"]},
  {cat:CATS[1], terms:["moradia","aluguel","condominio","casa"]},
  {cat:CATS[2], terms:["alimentacao","mercado","supermercado","comida","restaurante"]},
  {cat:CATS[3], terms:["transporte","uber","taxi","gasolina","combustivel","onibus","metro"]},
  {cat:CATS[4], terms:["saude","farmacia","remedio","medico","consulta","exame"]},
  {cat:CATS[5], terms:["lazer","cinema","bar","viagem","show"]},
  {cat:CATS[6], terms:["utilidades","luz","energia","agua","internet","telefone","celular","gas"]},
  {cat:CATS[7], terms:["educacao","escola","faculdade","curso"]},
  {cat:CATS[8], terms:["outros","outro"]}
];

function findNaturalCategory(text) {
  const plain = plainText(text);
  const explicit = plain.match(/\b(?:categoria|categorizar como|na categoria|como categoria)\s+(.+?)$/);
  const scope = explicit ? explicit[1] : plain;
  const hit = NATURAL_CATEGORY_ALIASES.find(item=>item.terms.some(term=>scope.includes(plainText(term))));
  return hit ? hit.cat : null;
}

function categoryFromNaturalText(text, type) {
  const normalized = normalizeNaturalText(text);
  const explicitOrDirect = findNaturalCategory(normalized);
  if (explicitOrDirect) return explicitOrDirect;
  const q = normalized.toLowerCase();
  const rules = [
    [CATS[0], /sal[aá]rio|ordenado|pagamento|recebi|receita|entrada|pix recebido|freela|bonus|b[oô]nus/],
    [CATS[2], /mercado|supermercado|padaria|ifood|i food|restaurante|lanche|almo[cç]o|jantar|pizza|comida|a[cç]ougue|hortifruti/],
    [CATS[3], /uber|99|taxi|t[aá]xi|gasolina|combust[ií]vel|posto|estacionamento|ped[aá]gio|onibus|[ôo]nibus|metro|metr[oô]/],
    [CATS[1], /aluguel|condom[ií]nio|financiamento|casa|apartamento|iptu/],
    [CATS[6], /luz|energia|[aá]gua|internet|telefone|celular|g[aá]s|netflix|spotify|streaming|assinatura/],
    [CATS[4], /farm[aá]cia|rem[eé]dio|m[eé]dico|consulta|exame|hospital|plano de sa[uú]de|dentista/],
    [CATS[7], /escola|faculdade|curso|livro|material escolar|mensalidade/],
    [CATS[5], /cinema|bar|viagem|hotel|show|jogo|presente|shopping|lazer/]
  ];
  const hit = rules.find(([,rx])=>rx.test(q));
  if (hit) return hit[0];
  return type==="income" ? CATS[0] : CATS[8];
}

function stripCategoryFromDescription(text) {
  let d = normalizeNaturalText(text);
  d = d.replace(/\b(?:categoria|categorizar como|na categoria|como categoria)\b[\s\S]*$/i," ");
  ["salario","moradia","alimentacao","alimentação","transporte","saude","saúde","lazer","utilidades","educacao","educação","outros","outro"].forEach(term=>{
    d = d.replace(new RegExp("\\b"+term+"\\b","gi")," ");
  });
  return d;
}

function descFromNaturalText(text, amount) {
  let d = stripCategoryFromDescription(text).trim();
  d = d.replace(/\b(gastei|paguei|comprei|lancei|lançar|lancar|registre|recebi|ganhei|entrada de|despesa de|receita de|no valor de|valor de)\b/gi," ");
  d = d.replace(/(?:r\$\s*)?\d+(?:[,.]\d{1,2})?/gi," ");
  d = d.replace(/\b(hoje|ontem|anteontem|amanh[aã]|dia\s+\d{1,2}|em\s+\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)\b/gi," ");
  d = d.replace(/\s+/g," ").trim();
  return d || "Entrada rápida";
}

function parseNaturalTransaction(text) {
  const normalizedText = normalizeNaturalText(text);
  const q = normalizedText.toLowerCase();
  const amount = amountFromNaturalText(normalizedText);
  const income = /\b(recebi|ganhei|sal[aá]rio|receita|entrada|pix recebido|freela|bonus|b[oô]nus)\b/.test(q);
  const due = /\b(vence|vencimento|pagar|pendente|boleto)\b/.test(q);
  const type = income ? "income" : "expense";
  return {
    desc: descFromNaturalText(normalizedText, amount),
    amount,
    type,
    category: categoryFromNaturalText(normalizedText,type),
    owner: "casal",
    date: dateFromNaturalText(normalizedText),
    paid: income || (/\b(gastei|paguei|comprei|recebi|ganhei)\b/.test(q) && !due),
    notesCount: 0,
    source: "whatsapp",
    rawText: normalizedText || ""
  };
}

module.exports = { parseNaturalTransaction, normalizeNaturalText };
