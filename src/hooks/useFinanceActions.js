function useFinanceActions({
  financeRepo,
  matchCategoryRule,
  user,
  profileName,
  editing,
  editingShortcut,
  selMonth,
  selYear,
  closeTxForm,
  closeShortcutForm,
  setDepositGoal,
  setPurchaseCard,
  setShowCardForm,
  setShowGoal,
  setShowQuickEntry,
  setShowRecurringForm,
  setShowShoppingForm,
  setSync
}) {
  async function saveTx(form) {
    setSync("saving");
    try {
      const ruleCategory = matchCategoryRule(form.desc);
      await financeRepo.saveTransaction({ form, editing, ruleCategory, user, profileName });
      setSync("ok");
    } catch (e) {
      setSync("err");
      alert("Erro: " + e.message);
    }
    closeTxForm();
  }

  async function deleteTx(t) {
    setSync("saving");
    try {
      await financeRepo.deleteTransaction(t);
      setSync("ok");
    } catch (e) {
      setSync("err");
    }
  }

  async function togglePaid(t) {
    setSync("saving");
    try {
      await financeRepo.toggleTransactionPaid(t);
      setSync("ok");
    } catch (e) {
      setSync("err");
    }
  }

  async function saveGoal(g) {
    setSync("saving");
    try {
      await financeRepo.createGoal(g);
      setSync("ok");
    } catch (e) {
      setSync("err");
      alert("Erro: " + e.message);
    }
    setShowGoal(false);
  }

  async function saveGoalDeposit(g, value) {
    setSync("saving");
    try {
      await financeRepo.updateGoalDeposit(g, value);
      setSync("ok");
      setDepositGoal(null);
    } catch (e) {
      setSync("err");
    }
  }

  async function deleteGoal(g) {
    try {
      await financeRepo.deleteGoal(g);
    } catch (e) {
      setSync("err");
    }
  }

  async function saveShortcut(s) {
    setSync("saving");
    try {
      await financeRepo.saveShortcut({ shortcut: s, editingShortcut });
      setSync("ok");
    } catch (e) {
      setSync("err");
      alert("Erro: " + e.message);
    }
    closeShortcutForm();
  }

  async function deleteShortcut(s) {
    try {
      await financeRepo.deleteShortcut(s);
    } catch (e) {
      setSync("err");
    }
  }

  async function launchShortcut(s) {
    await saveTx({ desc: s.desc, amount: s.amount, type: s.type, category: s.category, owner: s.owner, paid: s.paid, date: new Date().toISOString().split("T")[0], notesCount: 0 });
  }

  async function saveQuickEntry(form) {
    await saveTx(form);
    setShowQuickEntry(false);
  }

  async function saveRecurring(form) {
    setSync("saving");
    try {
      await financeRepo.createRecurring(form);
      setSync("ok");
      setShowRecurringForm(false);
    } catch (e) {
      setSync("err");
      alert("Erro: " + e.message);
    }
  }

  async function deleteRecurring(item) {
    try {
      await financeRepo.deleteRecurring(item);
    } catch (e) {
      setSync("err");
      alert("Erro: " + e.message);
    }
  }

  async function generateRecurring(item) {
    const date = new Date(selYear, selMonth, item.day || 1).toISOString().split("T")[0];
    await saveTx({ desc: item.desc, amount: item.amount, type: item.type || "expense", category: item.category || "Outros", owner: "casal", date, paid: false, recurringId: item._id });
  }

  async function saveCard(form) {
    try {
      await financeRepo.createCard(form);
      setShowCardForm(false);
    } catch (e) {
      setSync("err");
      alert("Erro: " + e.message);
    }
  }

  async function deleteCard(card) {
    try {
      await financeRepo.deleteCard(card);
    } catch (e) {
      setSync("err");
      alert("Erro: " + e.message);
    }
  }

  async function saveCardPurchase({ card, desc, amount, installments, category }) {
    try {
      await financeRepo.createCardPurchase({ card, desc, amount, installments, category, selMonth, selYear });
      setPurchaseCard(null);
    } catch (e) {
      setSync("err");
      alert("Erro: " + e.message);
    }
  }

  async function addShoppingItem(form) {
    try {
      await financeRepo.addShoppingItem(form);
      setShowShoppingForm(false);
    } catch (e) {
      setSync("err");
      alert("Erro: " + e.message);
    }
  }

  async function toggleShoppingItem(item) {
    try {
      await financeRepo.toggleShoppingItem(item);
    } catch (e) {
      setSync("err");
      alert("Erro: " + e.message);
    }
  }

  async function deleteShoppingItem(item) {
    try {
      await financeRepo.deleteShoppingItem(item);
    } catch (e) {
      setSync("err");
      alert("Erro: " + e.message);
    }
  }

  return {
    addShoppingItem,
    deleteCard,
    deleteGoal,
    deleteRecurring,
    deleteShortcut,
    deleteShoppingItem,
    deleteTx,
    generateRecurring,
    launchShortcut,
    saveCard,
    saveCardPurchase,
    saveGoal,
    saveGoalDeposit,
    saveQuickEntry,
    saveRecurring,
    saveShortcut,
    saveTx,
    togglePaid,
    toggleShoppingItem
  };
}

export { useFinanceActions };
