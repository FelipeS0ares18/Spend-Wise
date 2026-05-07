const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { parseNaturalTransaction, normalizeNaturalText } = require("./parser");

admin.initializeApp();
const db = admin.firestore();

const WHATSAPP_TOKEN = defineSecret("WHATSAPP_TOKEN");
const WHATSAPP_PHONE_NUMBER_ID = defineSecret("WHATSAPP_PHONE_NUMBER_ID");
const WHATSAPP_VERIFY_TOKEN = defineSecret("WHATSAPP_VERIFY_TOKEN");
const PLUGGY_CLIENT_ID = defineSecret("PLUGGY_CLIENT_ID");
const PLUGGY_CLIENT_SECRET = defineSecret("PLUGGY_CLIENT_SECRET");
const PLUGGY_API_BASE = "https://api.pluggy.ai";

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

function applyCors(req, res) {
  res.set("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true;
  }
  return false;
}

async function getAuthedUid(req) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) throw Object.assign(new Error("Login necessario."), { status: 401 });
  const decoded = await admin.auth().verifyIdToken(token);
  return decoded.uid;
}

async function ownerBaseFor(uid, householdId) {
  if (!householdId) return { ref: db.collection("users").doc(uid), owner: uid };
  const householdRef = db.collection("households").doc(householdId);
  const snap = await householdRef.get();
  const members = snap.exists ? snap.data().members || [] : [];
  if (!members.includes(uid)) throw Object.assign(new Error("Voce nao participa deste espaco financeiro."), { status: 403 });
  return { ref: householdRef, owner: "casal" };
}

async function pluggyApiKey() {
  const clientId = (process.env.PLUGGY_CLIENT_ID || "").trim();
  const clientSecret = (process.env.PLUGGY_CLIENT_SECRET || "").trim();
  if (!clientId || !clientSecret) throw Object.assign(new Error("Pluggy nao configurada. Defina PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET nos secrets do Firebase."), { status: 412, configured: false });
  const res = await fetch(`${PLUGGY_API_BASE}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, clientSecret })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.apiKey) throw Object.assign(new Error(data.message || "Nao foi possivel autenticar na Pluggy."), { status: res.status || 502 });
  return data.apiKey;
}

async function pluggyFetch(path, options = {}) {
  const apiKey = await pluggyApiKey();
  const res = await fetch(`${PLUGGY_API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", "X-API-KEY": apiKey, ...(options.headers || {}) }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.message || `Erro Pluggy ${res.status}`), { status: res.status || 502 });
  return data;
}

function mapPluggyTransaction(tx, account, owner) {
  const amount = Math.abs(Number(tx.amount || 0));
  const type = tx.type === "CREDIT" ? "income" : "expense";
  const desc = tx.description || tx.descriptionRaw || tx.providerCode || "Lancamento bancario";
  const date = String(tx.date || new Date().toISOString()).slice(0, 10);
  return {
    desc,
    amount,
    type,
    category: tx.category || tx.merchant?.category || "Outros",
    owner,
    date,
    paid: tx.status !== "PENDING",
    source: "pluggy",
    externalProvider: "pluggy",
    externalId: tx.id,
    externalAccountId: tx.accountId || account.id,
    externalAccountName: account.name || account.marketingName || account.type || "Conta bancaria",
    externalRawType: tx.type || "",
    importedAtMs: Date.now(),
    notesCount: 0
  };
}

async function syncPluggyItem({ uid, householdId, itemId }) {
  if (!itemId) throw Object.assign(new Error("itemId obrigatorio."), { status: 400 });
  const { ref: baseRef, owner } = await ownerBaseFor(uid, householdId);
  const connectionRef = baseRef.collection("bankConnections").doc(itemId);
  const connSnap = await connectionRef.get();
  if (connSnap.exists && connSnap.data().uid !== uid && !householdId) throw Object.assign(new Error("Conexao nao pertence a este usuario."), { status: 403 });
  const accountsData = await pluggyFetch(`/accounts?itemId=${encodeURIComponent(itemId)}`);
  const accounts = accountsData.results || [];
  let imported = 0;
  for (const account of accounts) {
    const firstPage = await pluggyFetch(`/transactions?accountId=${encodeURIComponent(account.id)}&pageSize=500`);
    const pages = Math.max(Number(firstPage.totalPages || 1), 1);
    const batches = [firstPage, ...await Promise.all(Array.from({ length: pages - 1 }, (_, i) => pluggyFetch(`/transactions?accountId=${encodeURIComponent(account.id)}&page=${i + 2}&pageSize=500`)))];
    for (const page of batches) {
      for (const tx of page.results || []) {
        if (!tx.id || !Number.isFinite(Number(tx.amount)) || Number(tx.amount) === 0) continue;
        const mapped = mapPluggyTransaction(tx, account, owner);
        await baseRef.collection("transactions").doc(`pluggy-${tx.id}`).set(mapped, { merge: true });
        imported += 1;
      }
    }
  }
  await connectionRef.set({
    provider: "pluggy",
    itemId,
    uid,
    householdId: householdId || "",
    accountsCount: accounts.length,
    lastSyncAtMs: Date.now(),
    status: "active"
  }, { merge: true });
  return { imported, accountsCount: accounts.length };
}

exports.createBankConnectToken = onRequest({ region: "us-central1", maxInstances: 2, concurrency: 10, secrets: [PLUGGY_CLIENT_ID, PLUGGY_CLIENT_SECRET] }, async (req, res) => {
  try {
    if (applyCors(req, res)) return;
    if (req.method !== "POST") return res.sendStatus(405);
    const uid = await getAuthedUid(req);
    const { householdId = "", itemId = "" } = req.body || {};
    await ownerBaseFor(uid, householdId);
    const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || "appfinance-e6d2d";
    const webhookUrl = `https://us-central1-${projectId}.cloudfunctions.net/pluggyWebhook`;
    const data = await pluggyFetch("/connect_token", {
      method: "POST",
      body: JSON.stringify({
        ...(itemId ? { itemId } : {}),
        options: { clientUserId: uid, webhookUrl, avoidDuplicates: true }
      })
    });
    res.json({ configured: true, accessToken: data.accessToken });
  } catch (e) {
    console.error("createBankConnectToken error", e);
    res.status(e.status || 500).json({ configured: e.configured !== false, error: e.message || "Erro ao criar token bancario." });
  }
});

exports.registerBankConnection = onRequest({ region: "us-central1", maxInstances: 2, concurrency: 10, secrets: [PLUGGY_CLIENT_ID, PLUGGY_CLIENT_SECRET] }, async (req, res) => {
  try {
    if (applyCors(req, res)) return;
    if (req.method !== "POST") return res.sendStatus(405);
    const uid = await getAuthedUid(req);
    const { householdId = "", itemId = "", connectorName = "" } = req.body || {};
    if (!itemId) return res.status(400).json({ error: "itemId obrigatorio." });
    const { ref: baseRef } = await ownerBaseFor(uid, householdId);
    await baseRef.collection("bankConnections").doc(itemId).set({
      provider: "pluggy",
      itemId,
      uid,
      householdId,
      connectorName,
      status: "connected",
      createdAtMs: Date.now(),
      updatedAtMs: Date.now()
    }, { merge: true });
    const sync = await syncPluggyItem({ uid, householdId, itemId });
    res.json({ ok: true, itemId, ...sync });
  } catch (e) {
    console.error("registerBankConnection error", e);
    res.status(e.status || 500).json({ error: e.message || "Erro ao registrar conexao bancaria." });
  }
});

exports.syncBankConnection = onRequest({ region: "us-central1", maxInstances: 2, concurrency: 10, secrets: [PLUGGY_CLIENT_ID, PLUGGY_CLIENT_SECRET] }, async (req, res) => {
  try {
    if (applyCors(req, res)) return;
    if (req.method !== "POST") return res.sendStatus(405);
    const uid = await getAuthedUid(req);
    const { householdId = "", itemId = "" } = req.body || {};
    const result = await syncPluggyItem({ uid, householdId, itemId });
    res.json({ ok: true, itemId, ...result });
  } catch (e) {
    console.error("syncBankConnection error", e);
    res.status(e.status || 500).json({ error: e.message || "Erro ao sincronizar banco." });
  }
});

exports.pluggyWebhook = onRequest({ region: "us-central1", maxInstances: 2, concurrency: 10, secrets: [PLUGGY_CLIENT_ID, PLUGGY_CLIENT_SECRET] }, async (req, res) => {
  try {
    if (req.method !== "POST") return res.sendStatus(405);
    res.sendStatus(200);
    const itemId = req.body?.itemId || req.body?.id;
    const clientUserId = req.body?.clientUserId;
    if (!itemId || !clientUserId) return;
    const userSnap = await db.collection("users").doc(clientUserId).get();
    const user = userSnap.exists ? userSnap.data() : {};
    await syncPluggyItem({ uid: clientUserId, householdId: user.activeHouseholdId || "", itemId });
  } catch (e) {
    console.error("pluggyWebhook error", e);
    if (!res.headersSent) res.sendStatus(500);
  }
});

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
