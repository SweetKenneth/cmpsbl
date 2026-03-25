/**
 * Architecture — Responsive wrapper with mobile/desktop split
 */

import { lazy, Suspense } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const ArchitectureMobile = lazy(() => import("@/components/architecture/ArchitectureMobile"));
const ArchitectureDesktop = lazy(() => import("@/components/architecture/ArchitectureDesktop"));

export default function ArchitecturePage() {
  const isMobile = useIsMobile();

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      {isMobile ? <ArchitectureMobile /> : <ArchitectureDesktop />}
    </Suspense>
  );
}
