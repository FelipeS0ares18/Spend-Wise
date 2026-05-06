import { CATS } from "../domain/constants";
import type { CategoryRule } from "../domain/types";
import { validateCategoryRule } from "../domain/validation";

type FirestoreRuleApi = {
  addDoc: (collectionRef: unknown, data: Record<string, unknown>) => Promise<{ id: string }>;
  deleteDoc: (docRef: unknown) => Promise<void>;
};

type CategoryRuleRefs = {
  categoryRuleCol: () => unknown;
  ownerCollectionDoc: (collection: string, id: string) => unknown;
};

function categoryAt(index: number, fallback: string): string {
  return CATS[index] || fallback;
}

function normalizeRuleText(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function matchCategoryRule(desc: string, categoryRules: CategoryRule[] = []): string {
  const normalizedDesc = normalizeRuleText(desc);
  const custom = categoryRules.find(
    rule => rule.active !== false && rule.term && normalizedDesc.includes(normalizeRuleText(rule.term))
  );
  return custom ? custom.category || "Outros" : "";
}

function guessCategory(desc: string, type: string, categoryRules: CategoryRule[] = []): string {
  const d = normalizeRuleText(desc);
  const custom = matchCategoryRule(desc, categoryRules);
  if (custom) return custom;
  if (type === "income" || /salario|pix recebido|credito recebido|deposito|ted recebida|recebido/.test(d)) return categoryAt(0, "Salario");
  if (/mercado|supermercado|ifood|restaurante|padaria|lanch|almoco|jantar|comida|hortifruti/.test(d)) return categoryAt(2, "Alimentacao");
  if (/uber|99|posto|gasolina|combustivel|metro|onibus|transporte|estacionamento/.test(d)) return "Transporte";
  if (/aluguel|condominio|imovel|moradia/.test(d)) return "Moradia";
  if (/farmacia|medico|hospital|consulta|saude|drogaria/.test(d)) return categoryAt(4, "Saude");
  if (/netflix|spotify|cinema|show|lazer|amazon prime|disney|jogo|bar /.test(d)) return "Lazer";
  if (/energia|luz|agua|internet|telefone|celular|claro|vivo|tim|conta/.test(d)) return "Utilidades";
  if (/curso|faculdade|escola|educacao|livro/.test(d)) return categoryAt(7, "Educacao");
  return "Outros";
}

function createCategoryRulesRepository({ fs, refs }: { fs: FirestoreRuleApi; refs: CategoryRuleRefs }) {
  return {
    async saveRule({ term, category }: { term: string; category: string }) {
      const data = { ...validateCategoryRule({ term, category, active: true }), createdAtMs: Date.now() };
      const ref = await fs.addDoc(refs.categoryRuleCol(), data);
      return { ...data, _id: ref.id };
    },

    deleteRule(rule: CategoryRule) {
      if (!rule._id) throw new Error("Regra sem identificador.");
      return fs.deleteDoc(refs.ownerCollectionDoc("categoryRules", rule._id));
    }
  };
}

export { createCategoryRulesRepository, guessCategory, matchCategoryRule, normalizeRuleText };
