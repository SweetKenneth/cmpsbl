/**
 * TierGate — Role-based access gating for OS Dashboard tabs.
 * 
 * Shows all tabs in the sidebar (visible), but wraps gated content
 * with a calm upgrade CTA when the user's tier is insufficient.
 * Free users see enough to understand the system; upgrade pressure
 * comes from seeing what exists, not from being blocked entirely.
 */

import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowUpRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type SubstrateRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';

const TIER_ORDER: SubstrateRole[] = ['free', 'creator', 'studio', 'architect', 'governor'];

const TIER_LABELS: Record<SubstrateRole, string> = {
  free: 'Free',
  creator: 'Creator',
  studio: 'Studio',
  architect: 'Architect',
  governor: 'Governor',
};

const TIER_COLORS: Record<SubstrateRole, string> = {
  free: 'text-muted-foreground',
  creator: 'text-blue-400',
  studio: 'text-violet-400',
  architect: 'text-amber-400',
  governor: 'text-primary',
};

interface TierGateProps {
  /** The minimum tier required to access this content */
  requiredTier: SubstrateRole;
  /** The user's current tier */
  currentTier: SubstrateRole;
  /** Content to render when access is granted */
  children: ReactNode;
  /** Tab label for the upgrade message */
  tabLabel?: string;
  /** Short description of what's behind the gate */
  description?: string;
}

export function TierGate({ requiredTier, currentTier, children, tabLabel, description }: TierGateProps) {
  const currentLevel = TIER_ORDER.indexOf(currentTier);
  const requiredLevel = TIER_ORDER.indexOf(requiredTier);

  if (currentLevel >= requiredLevel) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="max-w-lg w-full border-border/30 bg-gradient-to-b from-muted/10 to-muted/5 shadow-lg">
        <CardContent className="p-8 sm:p-10 text-center space-y-6">
          {/* Lock icon */}
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-primary/5 border border-primary/15" />
            <Lock className="absolute inset-0 m-auto w-7 h-7 text-primary/60" />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-primary" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {tabLabel || 'This Module'} requires {TIER_LABELS[requiredTier]}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Tier comparison */}
          <div className="flex items-center justify-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              <span className="text-muted-foreground">
                Your tier: <span className={cn("font-medium", TIER_COLORS[currentTier])}>{TIER_LABELS[currentTier]}</span>
              </span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/40" />
            <div className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-full", requiredTier === 'creator' ? 'bg-blue-400' : requiredTier === 'studio' ? 'bg-violet-400' : 'bg-amber-400')} />
              <span className={cn("font-medium", TIER_COLORS[requiredTier])}>{TIER_LABELS[requiredTier]}</span>
            </div>
          </div>

          {/* CTA */}
          <Button asChild size="lg" className="w-full sm:w-auto px-8">
            <Link to="/store?tab=plans">
              Upgrade to {TIER_LABELS[requiredTier]}
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>

          <p className="text-[11px] text-muted-foreground/40">
            All tiers include the full substrate runtime. Higher tiers unlock deeper controls and telemetry.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Sidebar lock badge for gated tabs
 */
export function TierLockBadge({ requiredTier, currentTier }: { requiredTier: SubstrateRole; currentTier: SubstrateRole }) {
  const currentLevel = TIER_ORDER.indexOf(currentTier);
  const requiredLevel = TIER_ORDER.indexOf(requiredTier);
  
  if (currentLevel >= requiredLevel) return null;

  return (
    <Lock className="w-2.5 h-2.5 text-muted-foreground/30 shrink-0" />
  );
}

/**
 * Check if a tier meets the minimum requirement
 */
export function meetsMinTier(currentTier: SubstrateRole, requiredTier: SubstrateRole): boolean {
  return TIER_ORDER.indexOf(currentTier) >= TIER_ORDER.indexOf(requiredTier);
}
