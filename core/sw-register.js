/* core/sw-register.js — registra o service worker do PWA (só em http/https) */
if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(new URL("sw.js", document.baseURI)).catch((err) => {
      console.warn("service worker não registrou:", err);
    });
  });
}
