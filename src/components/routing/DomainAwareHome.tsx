import { lazy, Suspense } from "react";

const PromptFluidHome = lazy(() => import("@/pages/PromptFluidHome"));
const Explore = lazy(() => import("@/pages/Explore"));

/**
 * Shows PromptFluidHome only when accessed via promptfluid.com,
 * otherwise shows the default Explore/CMPSBL homepage.
 */
function isPromptFluidDomain(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "promptfluid.com" || host === "www.promptfluid.com";
}

export default function DomainAwareHome() {
  if (isPromptFluidDomain()) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <PromptFluidHome />
      </Suspense>
    );
  }
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Explore />
    </Suspense>
  );
}
