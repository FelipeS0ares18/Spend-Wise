if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.getRegistrations?.()
          .then(registrations => Promise.all(
            registrations
              .filter(r => !r.active?.scriptURL?.endsWith("/sw.js"))
              .map(r => r.unregister())
          ))
          .catch(e => console.log("SW cleanup erro:", e));
        navigator.serviceWorker.register("/sw.js")
          .then(r => {
            console.log("SW registrado:", r.scope);
            r.update?.();
          })
          .catch(e => console.log("SW erro:", e));
      });
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!window.__swReloaded) {
          window.__swReloaded = true;
          window.location.reload();
        }
      });
    }

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const btn = document.getElementById('installBtn');
  if (btn) btn.style.display = 'block';
});

document.getElementById('installBtn')?.addEventListener('click', async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === 'accepted') {
    document.getElementById('installBtn').style.display = 'none';
  }
});
