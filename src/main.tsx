import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <App />
  </ThemeProvider>
);

// Defer service worker registration to avoid render-blocking
if ('serviceWorker' in navigator) {
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
