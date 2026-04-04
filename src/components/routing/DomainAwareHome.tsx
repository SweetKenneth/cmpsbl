import { lazy, Suspense } from "react";
import { getVerticalSubdomain, isMarketplaceDomain } from "@/config/domains";
import { isDynamicVertical } from "@/lib/factory/vertical-factory-engine";

const PromptFluidHome = lazy(() => import("@/pages/PromptFluidHome"));
const FactoryHome = lazy(() => import("@/pages/FactoryHome"));
const CyberSecurityHome = lazy(() => import("@/pages/CyberSecurityHome"));
const RoboticsHome = lazy(() => import("@/pages/RoboticsHome"));
const QuantumHome = lazy(() => import("@/pages/QuantumHome"));
const LLMHome = lazy(() => import("@/pages/LLMHome"));
const AgencyHome = lazy(() => import("@/pages/AgencyHome"));
const MarketplaceHome = lazy(() => import("@/pages/MarketplaceHome"));

/**
 * Domain-aware routing:
 * - promptfluid.com → PromptFluid landing (parent company)
 * - security.cmpsbl.com → CMPSBL CYBER™ (custom security landing)
 * - robotics.cmpsbl.com → CMPSBL ROBOTICS™ (custom robotics landing)
 * - quantum.cmpsbl.com → CMPSBL QUANTUM™ (custom quantum landing)
 * - llm.cmpsbl.com → CMPSBL LLM™ (custom LLM landing)
 * - {dynamic}.cmpsbl.com → Dynamic vertical substrate landing
 * - cmpsbl.com (default) → Factory-era CMPSBL homepage
 */
function isPromptFluidDomain(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "promptfluid.com" || host === "www.promptfluid.com";
}

export default function DomainAwareHome() {
  const verticalKey = getVerticalSubdomain();

  if (isMarketplaceDomain()) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <MarketplaceHome />
      </Suspense>
    );
  }

  if (isPromptFluidDomain()) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <PromptFluidHome />
      </Suspense>
    );
  }

  if (verticalKey === 'security') {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ background: "hsl(220 30% 3%)" }} />}>
        <CyberSecurityHome />
      </Suspense>
    );
  }

  if (verticalKey === 'robotics') {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ background: "hsl(215 25% 5%)" }} />}>
        <RoboticsHome />
      </Suspense>
    );
  }

  if (verticalKey === 'quantum') {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ background: "hsl(260 30% 4%)" }} />}>
        <QuantumHome />
      </Suspense>
    );
  }

  if (verticalKey === 'llm') {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ background: "hsl(170 30% 3%)" }} />}>
        <LLMHome />
      </Suspense>
    );
  }

  if (verticalKey === 'agency') {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ background: "hsl(30 20% 4%)" }} />}>
        <AgencyHome />
      </Suspense>
    );
  }

  // Dynamic verticals from the factory engine + generic fallback
  if (verticalKey) {
    const VerticalSubstrateHome = lazy(() => import("@/pages/VerticalSubstrateHome"));
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
