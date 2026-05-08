import { auth, authApi } from "./firebase";

const FUNCTIONS_BASE = "https://us-central1-appfinance-e6d2d.cloudfunctions.net";
const PLUGGY_SCRIPT = "https://cdn.pluggy.ai/pluggy-connect/v2.7.0/pluggy-connect.js";

function isJwt(token) {
  return typeof token === "string" && token.split(".").length === 3;
}

function waitForCurrentUser() {
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  return new Promise(resolve => {
    const unsub = authApi.onAuthStateChanged(auth, user => {
      unsub?.();
      resolve(user || null);
    });
  });
}

async function idToken(userOverride) {
  const currentUser = await waitForCurrentUser();
  const candidates = [currentUser, userOverride].filter(Boolean);
  const sdkTokenUser = candidates.find(user => typeof user.getIdToken === "function");
  const user = sdkTokenUser || candidates[0];
  if (!user) throw new Error("Faca login para conectar bancos.");

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (typeof authApi.getIdToken === "function" && typeof candidate.getIdToken === "function") {
      try {
        const token = await authApi.getIdToken(candidate, true);
        if (isJwt(token)) return token;
      } catch (e) {
        console.warn("Falha ao obter ID token pelo SDK", e);
      }
    }
    if (typeof candidate.getIdToken === "function") {
      try {
        const token = await candidate.getIdToken(true);
        if (isJwt(token)) return token;
      } catch (e) {
        console.warn("Falha ao obter ID token pelo usuario", e);
      }
    }
    if (isJwt(candidate.accessToken)) return candidate.accessToken;
    if (isJwt(candidate.stsTokenManager?.accessToken)) return candidate.stsTokenManager.accessToken;
  }

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
