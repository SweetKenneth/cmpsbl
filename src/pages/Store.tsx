/**
 * Store — Responsive wrapper with mobile/desktop split
 */

import { lazy, Suspense } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const StoreMobile = lazy(() => import("@/components/store/StoreMobile"));
const StoreDesktop = lazy(() => import("@/components/store/StoreDesktop"));

export default function Store() {
  const isMobile = useIsMobile();

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      {isMobile ? <StoreMobile /> : <StoreDesktop />}
    </Suspense>
  );
}
