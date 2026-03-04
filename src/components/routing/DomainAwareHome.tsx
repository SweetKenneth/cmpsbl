import { lazy, Suspense } from "react";
import { isFrontendDomain } from "@/config/domains";

const PromptFluidHome = lazy(() => import("@/pages/PromptFluidHome"));
const Explore = lazy(() => import("@/pages/Explore"));

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
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Explore />
    </Suspense>
  );
}
