import { lazy, Suspense } from "react";
import { PinGate } from "@/components/gates/PinGate";
import { VerticalAccessGate } from "@/components/gates/VerticalAccessGate";
import { getVerticalSubdomain, isMarketplaceDomain, isControlDomain, isManaDomain } from "@/config/domains";
import { isDynamicVertical } from "@/lib/factory/vertical-factory-engine";

const PromptFluidHome = lazy(() => import("@/pages/PromptFluidHome"));
// FactoryHome is eagerly imported — it's the default (99%) path.
// Lazy-loading it adds an extra waterfall hop that increases Speed Index by ~200ms.
import FactoryHome from "@/pages/FactoryHome";
const CyberSecurityHome = lazy(() => import("@/pages/CyberSecurityHome"));
const RoboticsHome = lazy(() => import("@/pages/RoboticsHome"));
const QuantumHome = lazy(() => import("@/pages/QuantumHome"));
const LLMHome = lazy(() => import("@/pages/LLMHome"));
const AgencyHome = lazy(() => import("@/pages/AgencyHome"));
const UltimateHome = lazy(() => import("@/pages/UltimateHome"));
const MediaHome = lazy(() => import("@/pages/MediaHome"));
const MarketplaceHome = lazy(() => import("@/pages/MarketplaceHome"));
const ControlCenterHome = lazy(() => import("@/pages/ControlCenterHome"));
const ManaHome = lazy(() => import("@/pages/ManaHome"));

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

  if (isManaDomain()) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <ManaHome />
      </Suspense>
    );
  }

  if (isControlDomain()) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <ControlCenterHome />
      </Suspense>
    );
  }

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
        <VerticalAccessGate verticalId="security">
          <CyberSecurityHome />
        </VerticalAccessGate>
      </Suspense>
    );
  }

  if (verticalKey === 'robotics') {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ background: "hsl(215 25% 5%)" }} />}>
        <VerticalAccessGate verticalId="robotics">
          <RoboticsHome />
        </VerticalAccessGate>
      </Suspense>
    );
  }

  if (verticalKey === 'quantum') {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ background: "hsl(260 30% 4%)" }} />}>
        <VerticalAccessGate verticalId="quantum">
          <QuantumHome />
        </VerticalAccessGate>
      </Suspense>
    );
  }

  if (verticalKey === 'llm') {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ background: "hsl(170 30% 3%)" }} />}>
        <VerticalAccessGate verticalId="llm">
          <LLMHome />
        </VerticalAccessGate>
      </Suspense>
    );
  }

  if (verticalKey === 'agency') {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ background: "hsl(30 20% 4%)" }} />}>
        <VerticalAccessGate verticalId="agency">
          <AgencyHome />
        </VerticalAccessGate>
      </Suspense>
    );
  }

  if (verticalKey === 'ultimate') {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ background: "hsl(270 30% 4%)" }} />}>
        <VerticalAccessGate verticalId="ultimate">
          <UltimateHome />
        </VerticalAccessGate>
      </Suspense>
    );
  }

  if (verticalKey === 'media') {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ background: "hsl(330 25% 4%)" }} />}>
        <VerticalAccessGate verticalId="media">
          <MediaHome />
        </VerticalAccessGate>
      </Suspense>
    );
  }

  // Dynamic verticals from the factory engine + generic fallback
  if (verticalKey) {
    const VerticalSubstrateHome = lazy(() => import("@/pages/VerticalSubstrateHome"));
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <VerticalAccessGate verticalId={verticalKey}>
          <VerticalSubstrateHome verticalKey={verticalKey} />
        </VerticalAccessGate>
      </Suspense>
    );
  }

  // No Suspense needed — FactoryHome is eagerly imported for faster Speed Index
  return <FactoryHome />;
}
