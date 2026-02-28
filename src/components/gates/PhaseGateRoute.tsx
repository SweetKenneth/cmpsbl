/**
 * PhaseGateRoute — temporarily pass-through to avoid full-screen gate overlays
 */

import { ReactNode } from 'react';

interface PhaseGateRouteProps {
  children: ReactNode;
}

export function PhaseGateRoute({ children }: PhaseGateRouteProps) {
  return <>{children}</>;
}

