/**
 * VerticalAccessGate — Tier-based access control for vertical substrates
 * 
 * Free: Prime only (read-only everywhere else)
 * Studio ($29): Choose 3 verticals
 * Creator ($49): Choose 6 verticals
 * Architect ($79): All verticals + ULTIMATE
 * Enterprise ($999+): Everything + white-label
 * Governor: Full bypass
 * 
 * Non-subscribed users see read-only content with upgrade CTA overlay.
 */

import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowUpRight, Crown, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserRole, type SubstrateRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { useTrialAccess } from '@/hooks/useTrialAccess';

/** Vertical tier mapping — which tier unlocks which verticals */
export type VerticalId = 
  | 'prime' | 'security' | 'robotics' | 'quantum' | 'llm' 
  | 'agency' | 'media' | 'fintech' | 'healthcare' | 'legal' 
  | 'gaming' | 'education' | 'ultimate' | string;

/** Minimum tier required to interact (not just view) each vertical */
const VERTICAL_MIN_TIER: Record<string, SubstrateRole> = {
  prime: 'free',        // Free for everyone
  security: 'studio',   // Paid verticals
  robotics: 'studio',
  quantum: 'studio',
  llm: 'studio',
  agency: 'studio',
  media: 'studio',
  fintech: 'studio',
  healthcare: 'studio',
  legal: 'studio',
  gaming: 'studio',
  education: 'studio',
  ultimate: 'architect', // Architect-only
};

/** How many verticals each tier can select */
export const TIER_VERTICAL_LIMITS: Record<SubstrateRole, number> = {
  free: 0,       // Prime only (no selectable verticals)
  studio: 3,     // Choose 3
  creator: 6,    // Choose 6
  architect: 999, // All
  governor: 999,  // All
};

const TIER_LABELS: Record<SubstrateRole, string> = {
  free: 'Free',
  studio: 'Studio ($29/mo)',
  creator: 'Creator ($49/mo)',
  architect: 'Architect ($79/mo)',
  governor: 'Governor',
};

interface VerticalAccessGateProps {
  /** The vertical being accessed */
  verticalId: string;
  /** Content to render when access is granted */
  children: ReactNode;
  /** If true, show read-only version instead of full block */
  allowReadOnly?: boolean;
}

export function VerticalAccessGate({ verticalId, children, allowReadOnly = true }: VerticalAccessGateProps) {
  const { user } = useAuth();
  const { role, isGovernor } = useUserRole();

  // Governor always bypasses
  if (isGovernor) return <>{children}</>;

  // Prime is free for everyone
  if (verticalId === 'prime') return <>{children}</>;

  // Check if the user's tier can access this vertical
  const minTier = VERTICAL_MIN_TIER[verticalId] || 'studio';
  const tierOrder: SubstrateRole[] = ['free', 'studio', 'creator', 'architect', 'governor'];
  const currentLevel = tierOrder.indexOf(role);
  const requiredLevel = tierOrder.indexOf(minTier);

  // Ultimate requires architect
  if (verticalId === 'ultimate' && currentLevel < tierOrder.indexOf('architect')) {
    return <ReadOnlyOverlay verticalId={verticalId} requiredTier="architect">{children}</ReadOnlyOverlay>;
  }

  // Free users get read-only on all paid verticals
  if (currentLevel < requiredLevel) {
    if (allowReadOnly) {
      return <ReadOnlyOverlay verticalId={verticalId} requiredTier={minTier}>{children}</ReadOnlyOverlay>;
    }
    return <BlockedOverlay verticalId={verticalId} requiredTier={minTier} />;
  }

  // Paid user — they have access
  return <>{children}</>;
}

/** Read-only overlay — shows content but disables interaction */
function ReadOnlyOverlay({ 
  verticalId, 
  requiredTier, 
  children 
}: { 
  verticalId: string; 
  requiredTier: SubstrateRole; 
  children: ReactNode;
}) {
  return (
    <div className="relative">
      {/* Render the actual content but disable pointer events */}
      <div className="pointer-events-none select-none">
        {children}
      </div>

      {/* Sticky upgrade banner at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-background via-background/95 to-transparent pt-8 pb-4 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-card border border-border/50 rounded-xl p-4 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Read-Only Preview</p>
                <p className="text-xs text-muted-foreground truncate">
                  Subscribe to {TIER_LABELS[requiredTier]} to unlock full interaction
                </p>
              </div>
              <Button size="sm" className="shrink-0 gap-1.5" asChild>
                <Link to="/plans">
                  Upgrade <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Full block overlay — no content visible */
function BlockedOverlay({ verticalId, requiredTier }: { verticalId: string; requiredTier: SubstrateRole }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">Substrate Locked</h2>
          <p className="text-sm text-muted-foreground">
            This vertical substrate requires a {TIER_LABELS[requiredTier]} subscription to access.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button size="lg" className="w-full gap-2" asChild>
            <Link to="/plans">
              View Plans <ArrowUpRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full" asChild>
            <Link to="/verticals">
              <Layers className="w-4 h-4 mr-2" /> Browse Verticals
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Check if a vertical is accessible for a given tier */
export function isVerticalAccessible(verticalId: string, role: SubstrateRole): boolean {
  if (role === 'governor') return true;
  if (verticalId === 'prime') return true;
  if (verticalId === 'ultimate') return role === 'architect';
  
  const minTier = VERTICAL_MIN_TIER[verticalId] || 'studio';
  const tierOrder: SubstrateRole[] = ['free', 'studio', 'creator', 'architect', 'governor'];
  return tierOrder.indexOf(role) >= tierOrder.indexOf(minTier);
}
