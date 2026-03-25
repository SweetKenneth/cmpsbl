/**
 * Explore — The CMPSBL Gateway
 * Responsive: separate mobile and desktop layouts for optimized viewports
 */

import { lazy, Suspense } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const ExploreMobile = lazy(() => import("@/components/home/ExploreMobile"));
const ExploreDesktop = lazy(() => import("@/components/home/ExploreDesktop"));

export default function Explore() {
  const isMobile = useIsMobile();

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      {isMobile ? <ExploreMobile /> : <ExploreDesktop />}
    </Suspense>
  );
}
