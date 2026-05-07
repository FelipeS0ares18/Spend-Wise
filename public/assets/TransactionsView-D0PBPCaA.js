try {
  sessionStorage.removeItem("spend-wise-stale-chunk-reload");
  window.location.replace(window.location.pathname + window.location.search + (window.location.search ? "&" : "?") + "refresh=" + Date.now());
} catch {
  window.location.reload();
}

export function TransactionsView() {
  return null;
}
