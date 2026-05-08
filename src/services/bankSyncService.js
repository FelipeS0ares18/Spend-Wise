import { auth } from "./firebase";

const FUNCTIONS_BASE = "https://us-central1-appfinance-e6d2d.cloudfunctions.net";
const PLUGGY_SCRIPT = "https://cdn.pluggy.ai/pluggy-connect/v2.7.0/pluggy-connect.js";

async function idToken(userOverride) {
  const user =
    auth.currentUser && typeof auth.currentUser.getIdToken === "function"
      ? auth.currentUser
      : userOverride;
  if (!user) throw new Error("Faca login para conectar bancos.");
  if (typeof user.getIdToken === "function") return user.getIdToken(true);
  if (user.accessToken) return user.accessToken;
  if (user.stsTokenManager?.accessToken) return user.stsTokenManager.accessToken;
  console.warn("Usuario sem getIdToken para integracao bancaria", { uid: user.uid, keys: Object.keys(user || {}) });
  throw new Error("Autenticacao bancaria indisponivel neste ambiente. Saia e entre novamente para renovar a sessao.");
}

async function callBankFunction(name, payload = {}, user) {
  const token = await idToken(user);
  const res = await fetch(`${FUNCTIONS_BASE}/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || (res.status === 404 ? "Backend bancario ainda nao publicado. Configure as secrets da Pluggy e publique as Functions." : "Erro na integracao bancaria."));
    err.status = res.status;
    err.configured = data.configured;
    throw err;
  }
  return data;
}

function loadPluggyConnect() {
  if (window.PluggyConnect) return Promise.resolve(window.PluggyConnect);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${PLUGGY_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.PluggyConnect));
      existing.addEventListener("error", () => reject(new Error("Nao foi possivel carregar o widget bancario.")));
      return;
    }
    const script = document.createElement("script");
    script.src = PLUGGY_SCRIPT;
    script.async = true;
    script.onload = () => window.PluggyConnect ? resolve(window.PluggyConnect) : reject(new Error("Widget bancario indisponivel."));
    script.onerror = () => reject(new Error("Nao foi possivel carregar o widget bancario."));
    document.head.appendChild(script);
  });
}

async function openBankConnect({ householdId = "", user, onSuccess, onError } = {}) {
  const tokenData = await callBankFunction("createBankConnectToken", { householdId }, user);
  const PluggyConnect = await loadPluggyConnect();
  const widget = new PluggyConnect({
    connectToken: tokenData.accessToken,
    includeSandbox: true,
    onSuccess: async itemData => {
      const itemId = itemData?.item?.id || itemData?.itemId || itemData?.id;
      const connectorName = itemData?.item?.connector?.name || itemData?.connector?.name || itemData?.connectorName || "";
      if (!itemId) throw new Error("Banco conectado, mas nao recebi o identificador da conexao.");
      const result = await callBankFunction("registerBankConnection", { householdId, itemId, connectorName }, user);
      onSuccess?.(result);
    },
    onError: error => onError?.(error)
  });
  await widget.init();
}

async function syncBankConnection({ householdId = "", itemId, user }) {
  return callBankFunction("syncBankConnection", { householdId, itemId }, user);
}

export { openBankConnect, syncBankConnection };
