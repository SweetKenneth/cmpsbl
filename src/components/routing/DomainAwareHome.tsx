import { lazy, Suspense } from "react";
import { getVerticalSubdomain } from "@/config/domains";

const PromptFluidHome = lazy(() => import("@/pages/PromptFluidHome"));
const FactoryHome = lazy(() => import("@/pages/FactoryHome"));
const CyberSecurityHome = lazy(() => import("@/pages/CyberSecurityHome"));
const RoboticsHome = lazy(() => import("@/pages/RoboticsHome"));

/**
 * Domain-aware routing:
 * - promptfluid.com → PromptFluid landing (parent company)
 * - security.cmpsbl.com → CMPSBL CYBER™ (custom security landing)
 * - robotics.cmpsbl.com → CMPSBL ROBOTICS™ (custom robotics landing)
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
