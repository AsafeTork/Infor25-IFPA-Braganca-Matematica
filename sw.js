/* sw.js — service worker do PWA: precache (stale-while-revalidate) + runtime p/ fontes externas */
const VERSION = "v1";
const PRECACHE = `precache-${VERSION}`;
const RUNTIME = `runtime-${VERSION}`;

const PRECACHE_URLS = [
  "./manifest.webmanifest",
  "./aluno.html",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/logo.svg",
  "./components/formulaLab.js",
  "./components/katex.js",
  "./components/keypad.js",
  "./core/aluno.js",
  "./core/home.js",
  "./core/mathEngine.js",
  "./core/overlayRenderers.js",
  "./core/overlays.js",
  "./core/plotEngine.js",
  "./core/professor/board.js",
  "./core/professor/formulas.js",
  "./core/professor/panel.js",
  "./core/professor/plot.js",
  "./core/professor/presets.js",
  "./core/professor/scale.js",
  "./core/professor/tools.js",
  "./core/professor/unitCircle.js",
  "./core/theme.js",
  "./core/trigData.js",
  "./core/trigVisuals.js",
  "./features/exponencial/index.js",
  "./features/potenciacao/index.js",
  "./features/sequencias/index.js",
  "./features/trigonometria/index.js",
  "./index.html",
  "./professor.html",
  "./styles/aluno.css",
  "./styles/base.css",
  "./styles/boxes.css",
  "./styles/explorer.css",
  "./styles/professor.css",
  "./styles/tokens.css",
  "./styles/trigVisuals.css",
  "./utils/content.js",
  "./vendor/katex/contrib/auto-render.min.js",
  "./vendor/katex/fonts/KaTeX_AMS-Regular.woff2",
  "./vendor/katex/fonts/KaTeX_Caligraphic-Bold.woff2",
  "./vendor/katex/fonts/KaTeX_Caligraphic-Regular.woff2",
  "./vendor/katex/fonts/KaTeX_Fraktur-Bold.woff2",
  "./vendor/katex/fonts/KaTeX_Fraktur-Regular.woff2",
  "./vendor/katex/fonts/KaTeX_Main-Bold.woff2",
  "./vendor/katex/fonts/KaTeX_Main-BoldItalic.woff2",
  "./vendor/katex/fonts/KaTeX_Main-Italic.woff2",
  "./vendor/katex/fonts/KaTeX_Main-Regular.woff2",
  "./vendor/katex/fonts/KaTeX_Math-BoldItalic.woff2",
  "./vendor/katex/fonts/KaTeX_Math-Italic.woff2",
  "./vendor/katex/fonts/KaTeX_SansSerif-Bold.woff2",
  "./vendor/katex/fonts/KaTeX_SansSerif-Italic.woff2",
  "./vendor/katex/fonts/KaTeX_SansSerif-Regular.woff2",
  "./vendor/katex/fonts/KaTeX_Script-Regular.woff2",
  "./vendor/katex/fonts/KaTeX_Size1-Regular.woff2",
  "./vendor/katex/fonts/KaTeX_Size2-Regular.woff2",
  "./vendor/katex/fonts/KaTeX_Size3-Regular.woff2",
  "./vendor/katex/fonts/KaTeX_Size4-Regular.woff2",
  "./vendor/katex/fonts/KaTeX_Typewriter-Regular.woff2",
  "./vendor/katex/katex.min.css",
  "./vendor/katex/katex.min.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(PRECACHE).then((c) => c.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => (k.startsWith("precache-") || k.startsWith("runtime-")) && k !== PRECACHE && k !== RUNTIME)
          .map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    // res.ok cobre CORS; res.type === "opaque" cobre no-cors (ex.: <link> de CSS externo)
    if (res && (res.ok || res.type === "opaque")) {
      const c = await caches.open(cacheName);
      c.put(request, res.clone());
    }
    return res;
  } catch (err) {
    const fallback = await caches.match(request, { ignoreSearch: true });
    if (fallback) return fallback;
    throw err;
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  const network = fetch(request).then(async (res) => {
    if (res && res.ok) {
      const c = await caches.open(PRECACHE);
      c.put(request, res.clone());
    }
    return res;
  }).catch(() => null);
  if (cached) {
    network.catch(() => null);
    return cached;
  }
  const res = await network;
  if (res) return res;
  throw new Error("offline e sem cache: " + request.url);
}

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    // fontes externas (Google Fonts): cache primeiro p/ funcionar offline
    e.respondWith(cacheFirst(request, RUNTIME));
    return;
  }
  if (request.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const cached = await caches.match(request, { ignoreSearch: true });
        if (cached) return cached;
        return await fetch(request);
      } catch (err) {
        const cached = await caches.match(request, { ignoreSearch: true });
        if (cached) return cached;
        throw err;
      }
    })());
    return;
  }
  e.respondWith(staleWhileRevalidate(request));
});
