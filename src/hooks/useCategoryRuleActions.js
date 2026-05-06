function useCategoryRuleActions({
  categoryRulesRepo,
  ruleCategory,
  ruleText,
  setCategoryRules,
  setRuleCategory,
  setRuleText,
  setSync
}) {
  async function saveCategoryRule() {
    const term = ruleText.trim().toLowerCase();
    if (!term) {
      alert("Digite uma palavra ou termo para a regra.");
      return;
    }
    setSync("saving");
    try {
      const data = await categoryRulesRepo.saveRule({ term, category: ruleCategory });
      setCategoryRules(r => [data, ...r.filter(x => x._id !== data._id)]);
      setRuleText("");
      setRuleCategory("Outros");
      setSync("ok");
    } catch (e) {
      setSync("err");
      alert("Erro ao salvar regra: " + e.message);
    }
  }

  async function deleteCategoryRule(rule) {
    try {
      await categoryRulesRepo.deleteRule(rule);
    } catch (e) {
      setSync("err");
      alert("Erro ao remover regra: " + e.message);
    }
  }

  return { deleteCategoryRule, saveCategoryRule };
}

export { useCategoryRuleActions };
