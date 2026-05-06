const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { parseNaturalTransaction, normalizeNaturalText } = require("./parser");

admin.initializeApp();
const db = admin.firestore();

const WHATSAPP_TOKEN = defineSecret("WHATSAPP_TOKEN");
const WHATSAPP_PHONE_NUMBER_ID = defineSecret("WHATSAPP_PHONE_NUMBER_ID");
const WHATSAPP_VERIFY_TOKEN = defineSecret("WHATSAPP_VERIFY_TOKEN");

function digitsOnly(v) {
  return String(v || "").replace(/\D/g,"");
}

function getMessageTexts(body) {
  const out = [];
  const entries = body?.entry || [];
  for (const entry of entries) {
    for (const change of entry.changes || []) {
      const messages = change.value?.messages || [];
      for (const msg of messages) {
        if (msg.type === "text" && msg.text?.body) out.push({ from: digitsOnly(msg.from), text: msg.text.body });
      }
    }
  }
  return out;
}

async function sendWhatsAppText(to, body) {
  const token = (process.env.WHATSAPP_TOKEN || "").trim();
  const phoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || "").trim();
  if (!token || !phoneNumberId || !to) {
    console.log("WhatsApp reply skipped: missing token/phoneNumberId/to");
    return;
  }
  const graphVersion = process.env.WHATSAPP_GRAPH_VERSION || "v20.0";
  const res = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { preview_url: false, body }
    })
  });
  if (!res.ok) console.error("WhatsApp send failed", res.status, await res.text());
}

async function connectPhoneByCode(phone, text) {
  const match = normalizeNaturalText(text).trim().match(/^conectar\s+([a-z0-9]{4,12})$/i);
  if (!match) return false;
  const code = match[1].toUpperCase();
  const snap = await db.collection("users").where("whatsappConnectCode","==",code).limit(1).get();
  if (snap.empty) {
    await sendWhatsAppText(phone, "Código não encontrado. Gere um novo código no Spend Wise em Perfil > WhatsApp.");
    return true;
  }
  const userDoc = snap.docs[0];
  const user = userDoc.data();
  await db.collection("whatsappConnections").doc(phone).set({
    uid: userDoc.id,
    email: user.email || "",
    name: user.name || "",
    activeHouseholdId: user.activeHouseholdId || "",
    phone,
    connectedAtMs: Date.now(),
    updatedAtMs: Date.now()
  }, { merge: true });
  await userDoc.ref.set({ whatsappConnectedPhone: phone, whatsappConnectedAtMs: Date.now() }, { merge: true });
  await sendWhatsAppText(phone, "WhatsApp conectado ao Spend Wise. Agora envie frases como: paguei 89,90 no mercado hoje categoria Alimentação");
  return true;
}

async function saveTransactionFromWhatsApp(phone, text) {
  const connDoc = await db.collection("whatsappConnections").doc(phone).get();
  if (!connDoc.exists) {
    await sendWhatsAppText(phone, "Antes de lançar, conecte sua conta. No Spend Wise, abra Perfil > WhatsApp e envie aqui: conectar SEU_CODIGO");
    return;
  }
  const conn = connDoc.data();
  const tx = parseNaturalTransaction(text);
  if (!tx.amount || Number(tx.amount) <= 0) {
    await sendWhatsAppText(phone, "Não encontrei um valor válido. Ex: paguei 89,90 no mercado hoje categoria Alimentação");
    return;
  }
  const userRef = db.collection("users").doc(conn.uid);
  const userSnap = await userRef.get();
  const user = userSnap.exists ? userSnap.data() : {};
  const householdId = conn.activeHouseholdId || user.activeHouseholdId || "";
  const base = householdId ? db.collection("households").doc(householdId) : userRef;
  const owner = householdId ? "casal" : conn.uid;
  await base.collection("transactions").add({
    ...tx,
    owner,
    createdByUid: conn.uid,
    createdByEmail: conn.email || user.email || "",
    createdByName: conn.name || user.name || "WhatsApp",
    createdAtMs: Date.now()
  });
  await connDoc.ref.set({ activeHouseholdId: householdId, updatedAtMs: Date.now() }, { merge: true });
  const prefix = tx.type === "income" ? "Receita" : "Despesa";
  await sendWhatsAppText(phone, `${prefix} criada: ${tx.desc} | R$ ${Number(tx.amount).toFixed(2).replace(".", ",")} | ${tx.category} | ${tx.date}`);
}

function twiml(message) {
  const escaped = String(message || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`;
}

function twilioPhone(v) {
  return digitsOnly(String(v || "").replace(/^whatsapp:/i,""));
}

exports.twilioWhatsappWebhook = onRequest({ region: "us-central1", maxInstances: 1, concurrency: 10, invoker: "public" }, async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.status(200).type("text/xml").send(twiml("Webhook do Spend Wise ativo. Envie mensagens pelo WhatsApp Sandbox da Twilio."));
      return;
    }
    const phone = twilioPhone(req.body?.From);
    const text = req.body?.Body || "";
    if (!phone || !text) {
      res.status(200).type("text/xml").send(twiml("Não recebi telefone ou mensagem. Tente novamente."));
      return;
    }
    const connected = await connectPhoneByCode(phone, text);
    if (connected) {
      res.status(200).type("text/xml").send(twiml("Código processado. Se ele for válido, sua conta já está conectada."));
      return;
    }
    const connDoc = await db.collection("whatsappConnections").doc(phone).get();
    if (!connDoc.exists) {
      res.status(200).type("text/xml").send(twiml("Antes de lançar, conecte sua conta. No Spend Wise, abra Perfil > WhatsApp e envie aqui: conectar SEU_CODIGO"));
      return;
    }
    const conn = connDoc.data();
    const userRef = db.collection("users").doc(conn.uid);
    const userSnap = await userRef.get();
    const user = userSnap.exists ? userSnap.data() : {};
    const tx = parseNaturalTransaction(text);
    if (!tx.amount || Number(tx.amount) <= 0) {
      res.status(200).type("text/xml").send(twiml("Não encontrei um valor válido. Ex: paguei 89,90 no mercado hoje categoria Alimentação"));
      return;
    }
    const householdId = conn.activeHouseholdId || user.activeHouseholdId || "";
    const base = householdId ? db.collection("households").doc(householdId) : userRef;
    await base.collection("transactions").add({
      ...tx,
      owner: householdId ? "casal" : conn.uid,
      source: "twilio-whatsapp",
      createdByUid: conn.uid,
      createdByEmail: conn.email || user.email || "",
      createdByName: conn.name || user.name || "WhatsApp",
      createdAtMs: Date.now()
    });
    await connDoc.ref.set({ activeHouseholdId: householdId, updatedAtMs: Date.now() }, { merge: true });
    const prefix = tx.type === "income" ? "Receita" : "Despesa";
    res.status(200).type("text/xml").send(twiml(`${prefix} criada: ${tx.desc} | R$ ${Number(tx.amount).toFixed(2).replace(".", ",")} | ${tx.category} | ${tx.date}`));
  } catch (e) {
    console.error("twilioWhatsappWebhook error", e);
    res.status(200).type("text/xml").send(twiml("Erro ao processar mensagem no Spend Wise. Tente novamente."));
  }
});

exports.whatsappWebhook = onRequest({
  region: "us-central1",
  maxInstances: 1,
  concurrency: 10,
  invoker: "public",
  secrets: [WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_VERIFY_TOKEN]
}, async (req, res) => {
  try {
    if (req.method === "GET") {
      const mode = req.query["hub.mode"];
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];
      if (mode === "subscribe" && token === (process.env.WHATSAPP_VERIFY_TOKEN || "").trim()) {
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
      return;
    }
    if (req.method !== "POST") {
      res.sendStatus(405);
      return;
    }
    const messages = getMessageTexts(req.body);
    res.sendStatus(200);
    for (const msg of messages) {
      if (!msg.from || !msg.text) continue;
      const connected = await connectPhoneByCode(msg.from, msg.text);
      if (!connected) await saveTransactionFromWhatsApp(msg.from, msg.text);
    }
  } catch (e) {
    console.error("whatsappWebhook error", e);
    if (!res.headersSent) res.sendStatus(500);
  }
});
