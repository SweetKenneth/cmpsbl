import { lazy, Suspense } from "react";
import { isFrontendDomain } from "@/config/domains";
import Explore from "@/pages/Explore";

const PromptFluidHome = lazy(() => import("@/pages/PromptFluidHome"));

/**
 * Shows PromptFluidHome when accessed via promptfluid.com,
 * otherwise shows the default Explore/CMPSBL homepage.
 */
export default function DomainAwareHome() {
  if (isFrontendDomain()) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <PromptFluidHome />
      </Suspense>
    );
  }
  return <Explore />;
}
