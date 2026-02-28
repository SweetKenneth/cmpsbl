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

// Defer service worker registration to avoid render-blocking
// AND avoid registering SW in editor/preview (can cause mobile reload/cache loops)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const qs = new URLSearchParams(window.location.search);
  const host = window.location.hostname;

  let isEmbedded = false;
  try {
    isEmbedded = window.self !== window.top;
  } catch {
    isEmbedded = true;
  }

  const isEditorPreview =
    qs.has('__lovable_token') ||
    host.includes('lovableproject.com') ||
    host.startsWith('id-preview--') ||
    isEmbedded;

  if (!isEditorPreview) {
    window.addEventListener('load', () => {
      // Use requestIdleCallback if available for non-blocking registration
      const registerSW = () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
          .catch(() => {
            // SW registration failed silently
          });
      };

      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(registerSW);
      } else {
        setTimeout(registerSW, 1000);
      }
    });
  }
}
