/**
 * PhaseGateRoute — Wraps a route with phase-based access control
 * If the route is gated for the current phase, shows ComingSoonGate
 * If unlocked via password, renders the child component
 */

import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { getGateInfo } from '@/config/gtm-phase';
import { ComingSoonGate } from './ComingSoonGate';

interface PhaseGateRouteProps {
  children: ReactNode;
}

export function PhaseGateRoute({ children }: PhaseGateRouteProps) {
  const location = useLocation();
  const gate = getGateInfo(location.pathname);

  if (!gate) return <>{children}</>;

  // Check session-based password override
  const unlocked = sessionStorage.getItem(`gate-${gate.path}`) === 'unlocked';
  if (unlocked) return <>{children}</>;

  return <ComingSoonGate />;
}
