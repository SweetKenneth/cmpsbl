/**
 * Mobile Watchdog - Crash Signal Capture
 * Monitors for reload loops, errors, memory issues
 */

import { diagEnabled, diagLog } from "./diag";

let watchdogInstalled = false;
let tickInterval: ReturnType<typeof setInterval> | null = null;
let resizeCount = 0;
let resizeCheckInterval: ReturnType<typeof setInterval> | null = null;

export function installMobileWatchdog(): () => void {
  if (!diagEnabled() || typeof window === "undefined") {
    return () => {};
  }

  if (watchdogInstalled) {
    diagLog("warn", "watchdog: already installed, skipping");
    return () => {};
  }
  watchdogInstalled = true;

  const ua = navigator.userAgent || "";
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
  diagLog("log", "watchdog: enabled", { isMobile, ua: ua.slice(0, 100) });

  // Heartbeat tick to detect if we're stuck in a loop
  let ticks = 0;
  tickInterval = setInterval(() => {
    ticks += 1;
    diagLog("log", "watchdog: tick", { ticks, href: location.href.slice(0, 100) });
  }, 3000);

  // Global error handler
  const errorHandler = (e: ErrorEvent) => {
    diagLog("error", "window.error", {
      message: e.message,
      filename: e.filename?.slice(-80),
      lineno: e.lineno,
      colno: e.colno,
    });
  };
  window.addEventListener("error", errorHandler);

  // Unhandled promise rejection handler
  const rejectionHandler = (e: PromiseRejectionEvent) => {
    diagLog("error", "unhandledrejection", { reason: String(e.reason).slice(0, 200) });
  };
  window.addEventListener("unhandledrejection", rejectionHandler);

  // Navigation timing - detect reload patterns
  try {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav) {
      diagLog("log", "nav.timing", {
        type: nav.type,
        domComplete: Math.round(nav.domComplete),
        loadEventEnd: Math.round(nav.loadEventEnd),
      });
    }
  } catch {
    // Navigation timing not available
  }

  // Memory hints (Chrome only)
  try {
    const anyPerf = performance as unknown as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } };
    if (anyPerf.memory) {
      diagLog("log", "perf.memory", {
        usedMB: Math.round(anyPerf.memory.usedJSHeapSize / 1024 / 1024),
        limitMB: Math.round(anyPerf.memory.jsHeapSizeLimit / 1024 / 1024),
      });
    }
  } catch {
    // Memory API not available
  }

  // Resize storm detection
  const resizeHandler = () => {
    resizeCount += 1;
  };
  window.addEventListener("resize", resizeHandler);

  // Check resize frequency every 5 seconds
  resizeCheckInterval = setInterval(() => {
    if (resizeCount > 20) {
      diagLog("warn", "resize-storm detected", { resizesPer5s: resizeCount });
    } else if (resizeCount > 0) {
      diagLog("log", "resize-count", { resizesPer5s: resizeCount });
    }
    resizeCount = 0;
  }, 5000);

  // Service worker lifecycle monitoring
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then(reg => {
      diagLog("log", "sw:ready", { scope: reg.scope });
      
      reg.addEventListener("updatefound", () => {
        diagLog("warn", "sw:updatefound");
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            diagLog("log", "sw:statechange", { state: newWorker.state });
          });
        }
      });
    }).catch(err => {
      diagLog("log", "sw:not-registered", { err: String(err).slice(0, 100) });
    });
  }

  // Cleanup function
  return () => {
    if (tickInterval) clearInterval(tickInterval);
    if (resizeCheckInterval) clearInterval(resizeCheckInterval);
    window.removeEventListener("error", errorHandler);
    window.removeEventListener("unhandledrejection", rejectionHandler);
    window.removeEventListener("resize", resizeHandler);
    watchdogInstalled = false;
  };
}
