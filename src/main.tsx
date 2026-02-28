import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";

// Pre-render cache safety: validate persisted Zustand stores before React mounts.
// If any persisted store has corrupted/stale data, clear it so the app starts fresh.
try {
  const storeKey = 'substrate-public-metrics';
  const raw = localStorage.getItem(storeKey);
  if (raw) {
    const parsed = JSON.parse(raw);
    const metrics = parsed?.state?.metrics;
    // If critical string fields are missing or not strings, wipe the store
    if (metrics && (typeof metrics.version !== 'string' || typeof metrics.codename !== 'string' || typeof metrics.linesOfCodeDisplay !== 'string')) {
      localStorage.removeItem(storeKey);
    }
  }
} catch {
  // If parsing fails, clear it
  try { localStorage.removeItem('substrate-public-metrics'); } catch {}
}
createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    storageKey="pf-theme"
    disableTransitionOnChange
  >
    <App />
  </ThemeProvider>
);

// Disable service worker entirely for now — stale cached chunks were causing
// "TypeError: Importing a module script failed" and partial-shell renders.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Unregister any previously installed workers
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().catch(() => {});
        });
      })
      .catch(() => {});

    // Clear app caches that could still hold stale JS/CSS chunks
    if ('caches' in window) {
      caches.keys()
        .then((keys) => Promise.all(
          keys
            .filter((key) => key.startsWith('cmpsbl-'))
            .map((key) => caches.delete(key))
        ))
        .catch(() => {});
    }
  }, { once: true });
}

