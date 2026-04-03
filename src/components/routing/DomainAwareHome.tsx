import { lazy, Suspense } from "react";
import { getVerticalSubdomain } from "@/config/domains";

const PromptFluidHome = lazy(() => import("@/pages/PromptFluidHome"));
const FactoryHome = lazy(() => import("@/pages/FactoryHome"));
const VerticalSubstrateHome = lazy(() => import("@/pages/VerticalSubstrateHome"));

/**
 * Domain-aware routing:
 * - promptfluid.com → PromptFluid landing
 * - security.cmpsbl.com → CyberSecurity vertical substrate
 * - cmpsbl.com (default) → Factory-era CMPSBL homepage
 */
function isPromptFluidDomain(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "promptfluid.com" || host === "www.promptfluid.com";
}

export default function DomainAwareHome() {
  const verticalKey = getVerticalSubdomain();

  if (isPromptFluidDomain()) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <PromptFluidHome />
      </Suspense>
    );
  }

  if (verticalKey) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <VerticalSubstrateHome verticalKey={verticalKey} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <FactoryHome />
    </Suspense>
  );
}
