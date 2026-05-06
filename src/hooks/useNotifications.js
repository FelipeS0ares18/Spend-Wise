import { useEffect, useState } from "react";

function getNotificationGranted() {
  return typeof Notification !== "undefined" && Notification.permission === "granted";
}

function useNotifications({ uid, monthTxs, recurring, householdId }) {
  const [notifEnabled, setNotifEnabled] = useState(getNotificationGranted);
  const todayDay = new Date().getDate();
  const dueRecurring = recurring.filter(r => r.active !== false && r.day && Number(r.day) >= todayDay && Number(r.day) <= todayDay + 7);

  async function enableNotifications() {
    if (!("Notification" in window)) {
      alert("Seu navegador nao suporta notificacoes.");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotifEnabled(permission === "granted");
  }

  function notifyNow(title, body) {
    if ("Notification" in window && Notification.permission === "granted") new Notification(title, { body });
  }

  useEffect(() => {
    if (!notifEnabled || !("Notification" in window) || Notification.permission !== "granted") return;
    const key = "financas-notified-" + new Date().toISOString().split("T")[0] + "-" + uid();
    if (localStorage.getItem(key)) return;
    const due = monthTxs.filter(t => !t.paid && t.type === "expense" && new Date(t.date + "T12:00:00") <= new Date());
    if (due.length) notifyNow("Contas pendentes", due.length + " conta(s) vencendo ou vencidas.");
    if (dueRecurring.length) notifyNow("Contas recorrentes", dueRecurring.length + " recorrencia(s) perto do vencimento.");
    localStorage.setItem(key, "1");
  }, [notifEnabled, monthTxs.length, dueRecurring.length, householdId]);

  return { notifEnabled, enableNotifications, notifyNow, dueRecurring };
}

export { getNotificationGranted, useNotifications };
