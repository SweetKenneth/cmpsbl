/**
 * DepthGate — Graceful degradation guard for tier depth features.
 * 
 * Unlike PackGate (which gates pack activation), DepthGate controls
 * depth-limited features: background optimization, automation scheduling,
 * evolution access, and trace export.
 * 
 * When the feature is unavailable for the user's tier:
 * - Renders a calm, non-error CTA directing to /upgrade
 * - Optionally shows disabled UI instead of hiding it entirely
 */
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserLimits } from '@/hooks/useUserLimits';
import type { ProductLimits } from '@/lib/substrate/product-limits';
import type { ReactNode } from 'react';

type DepthFeatureKey = 'allowBackgroundOptimization' | 'allowAutomationScheduling' | 'safeEvolutionAccess' | 'exportTraceAccess';

const FEATURE_LABELS: Record<DepthFeatureKey, { name: string; description: string }> = {
  allowBackgroundOptimization: {
    name: 'Background Optimization',
    description: 'Autonomous off-peak processing that consolidates memory and evolves heuristics.',
  },
  allowAutomationScheduling: {
    name: 'Automation Scheduling',
    description: 'Cron and event-driven automation scheduling for recurring workflows.',
  },
  safeEvolutionAccess: {
    name: 'Safe Evolution',
    description: 'Controlled system evolution with shadow-apply and verification phases.',
  },
  exportTraceAccess: {
    name: 'Trace Export',
    description: 'Export execution traces and audit events for external analysis.',
  },
};

interface DepthGateProps {
  /** Which depth feature to gate */
  feature: DepthFeatureKey;
  children: ReactNode;
  /** If true, renders nothing when gated instead of the CTA card */
  silent?: boolean;
  /** Custom fallback UI */
  fallback?: ReactNode;
  /** If true, renders children but visually disabled (opacity + pointer-events-none) */
  showDisabled?: boolean;
}

export function DepthGate({ feature, children, silent, fallback, showDisabled }: DepthGateProps) {
  const limits = useUserLimits();

  if (limits.isLoading) return null;

  const isAvailable = limits[feature] as boolean;

  if (isAvailable) return <>{children}</>;

  if (showDisabled) {
    return (
      <div className="relative">
        <div className="opacity-40 pointer-events-none select-none" aria-hidden="true">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <UpgradeCTA feature={feature} compact />
        </div>
      </div>
    );
  }

  if (silent) return null;
  if (fallback) return <>{fallback}</>;

  return <UpgradeCTA feature={feature} />;
}

function UpgradeCTA({ feature, compact }: { feature: DepthFeatureKey; compact?: boolean }) {
  const meta = FEATURE_LABELS[feature];

  if (compact) {
    return (
      <Button variant="outline" size="sm" asChild className="bg-background/80 backdrop-blur-sm">
        <Link to="/store?tab=plans">
          Unlock {meta.name} <ArrowUpRight className="w-3 h-3 ml-1" />
        </Link>
      </Button>
    );
  }

  return (
    <Card className="border-border/50 bg-muted/20">
      <CardContent className="p-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium">{meta.name}</p>
          <p className="text-xs text-muted-foreground">{meta.description}</p>
        </div>
        <Button variant="outline" size="sm" asChild className="shrink-0">
          <Link to="/upgrade">
            Upgrade <ArrowUpRight className="w-3 h-3 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * useDepthCheck — Imperative depth feature check for event handlers.
 */
export function useDepthCheck() {
  const limits = useUserLimits();

  return {
    canUse: (feature: DepthFeatureKey): boolean => limits[feature] as boolean,
    limits,
  };
}
