/**
 * Clockless Habitat — Page
 * vX.UI.ULTIMATE
 *
 * Dimensional cognitive habitat route.
 * Full-screen, immersive, no traditional dashboard patterns.
 */

import { lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';

const HabitatCanvas = lazy(() => import('@/habitat/habitatCanvas'));

export default function HabitatPage() {
  return (
    <>
      <Helmet>
        <title>Habitat — Clockless Cognitive Control Plane</title>
        <meta
          name="description"
          content="Dimensional cognitive habitat. Namespace-scoped, telemetry-backed, sovereign control plane."
        />
      </Helmet>
      <Suspense
        fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
          </div>
        }
      >
        <HabitatCanvas />
      </Suspense>
    </>
  );
}
