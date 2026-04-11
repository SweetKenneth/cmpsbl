/**
 * DeferredDecodeFloat — Delays DecodeFloat render until browser is idle.
 * WHY: DecodeFloat imports DecodeMarkdown → react-markdown (~47KB).
 * Deferring by 3s keeps markdown-vendor out of the LCP measurement window.
 */

import { lazy, Suspense, useEffect, useState } from "react";

const DecodeFloat = lazy(() => import("@/components/decode/DecodeFloat"));

export function DeferredDecodeFloat() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Use requestIdleCallback if available, otherwise setTimeout
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    } else {
      const id = setTimeout(() => setReady(true), 3000);
      return () => clearTimeout(id);
    }
  }, []);

  if (!ready) return null;

  return (
    <Suspense fallback={null}>
      <DecodeFloat />
    </Suspense>
  );
}
