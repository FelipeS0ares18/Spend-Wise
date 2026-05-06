import { useState } from "react";

function useFinanceModals() {
  const [showTxForm, setShowTxForm] = useState(false);
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showGoal, setShowGoal] = useState(false);
  const [showShortcut, setShowShortcut] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatDraft, setChatDraft] = useState("");
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [purchaseCard, setPurchaseCard] = useState(null);
  const [showShoppingForm, setShowShoppingForm] = useState(false);
  const [depositGoal, setDepositGoal] = useState(null);

  const openChat = transaction => setActiveChat(transaction);
  const closeChat = () => {
    setActiveChat(null);
    setChatDraft("");
  };
  const closeTxForm = () => {
    setShowTxForm(false);
    setEditing(null);
  };
  const closeShortcutForm = () => {
    setShowShortcut(false);
    setEditingShortcut(null);
  };

  return {
    showTxForm,
    setShowTxForm,
    showQuickEntry,
    setShowQuickEntry,
    editing,
    setEditing,
    showGoal,
    setShowGoal,
    showShortcut,
    setShowShortcut,
    editingShortcut,
    setEditingShortcut,
    activeChat,
    setActiveChat,
    chatMessages,
    setChatMessages,
    chatDraft,
    setChatDraft,
    showRecurringForm,
    setShowRecurringForm,
    showCardForm,
    setShowCardForm,
    purchaseCard,
    setPurchaseCard,
    showShoppingForm,
    setShowShoppingForm,
    depositGoal,
    setDepositGoal,
    openChat,
    closeChat,
    closeTxForm,
    closeShortcutForm
  };
}

export { useFinanceModals };
