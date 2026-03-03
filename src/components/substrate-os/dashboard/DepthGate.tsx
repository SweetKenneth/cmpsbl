/**
 * DepthGate — Tier-based depth dimming wrapper
 * Renders children normally if user has access, otherwise shows dimmed overlay with upgrade CTA
 * Governor always bypasses all gates.
 */

import { cn } from '@/lib/utils';
import { useUserRole, type SubstrateRole } from '@/hooks/useUserRole';
import { Lock, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';

const TIER_LABELS: Record<SubstrateRole, string> = {
  free: 'Free',
  creator: 'Creator',
  studio: 'Studio',
  architect: 'Architect',
  governor: 'Governor',
};

const TIER_PRICES: Record<SubstrateRole, string> = {
  free: '',
  creator: '$29/mo',
  studio: '$49/mo',
  architect: '$79/mo',
  governor: '',
};

interface DepthGateProps {
  /** Minimum tier required to interact */
  requiredTier: SubstrateRole;
  /** Feature name shown in tooltip */
  featureLabel: string;
  /** Optional description for the upgrade CTA */
  description?: string;
  children: React.ReactNode;
  className?: string;
  /** Show inline badge instead of overlay */
  variant?: 'overlay' | 'badge' | 'tooltip-only';
}

export function DepthGate({
  requiredTier,
  featureLabel,
  description,
  children,
  className,
  variant = 'overlay',
}: DepthGateProps) {
  const { role, isGovernor } = useUserRole();

  // Governor always has full access
  if (isGovernor) return <>{children}</>;

  const tierOrder: SubstrateRole[] = ['free', 'creator', 'architect', 'governor'];
  const currentLevel = tierOrder.indexOf(role);
  const requiredLevel = tierOrder.indexOf(requiredTier);
  const hasAccess = currentLevel >= requiredLevel;

  if (hasAccess) return <>{children}</>;

  const upgradeLabel = `Requires ${TIER_LABELS[requiredTier]} ${TIER_PRICES[requiredTier]}`;

  if (variant === 'tooltip-only') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('relative opacity-40 pointer-events-none select-none', className)}>
              {children}
            </div>
          </TooltipTrigger>
          <TooltipContent className="text-xs">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              <span>{upgradeLabel}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={cn('relative', className)}>
        <div className="opacity-30 pointer-events-none select-none blur-[1px]">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/80 border border-border/50 backdrop-blur-sm">
            <Lock className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{upgradeLabel}</span>
          </div>
        </div>
      </div>
    );
  }

  // Default: overlay
  return (
    <div className={cn('relative group', className)}>
      <div className="opacity-25 pointer-events-none select-none blur-[2px] transition-all duration-300 group-hover:opacity-35 group-hover:blur-[1px]">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
        <div className="w-10 h-10 rounded-xl bg-muted/60 border border-border/40 flex items-center justify-center backdrop-blur-sm">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-semibold text-foreground/80">{featureLabel}</p>
          <p className="text-[10px] text-muted-foreground font-mono">{upgradeLabel}</p>
          {description && (
            <p className="text-[10px] text-muted-foreground/60 max-w-[200px]">{description}</p>
          )}
        </div>
        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1.5" asChild>
          <Link to="/upgrade">
            Upgrade <ArrowUpRight className="w-3 h-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
