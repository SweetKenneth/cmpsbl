/**
 * PackGate — Entitlement guard component
 * Renders children only if the specified pack is active.
 * Otherwise shows a compact "Pack not active" card with CTA.
 */
import { Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useArtifactSlots } from '@/hooks/useArtifactSlots';
import { useEngineSubscription } from '@/hooks/useEngineSubscription';
import { ARTIFACT_PACKS } from '@/lib/quarry/types';
import type { ReactNode } from 'react';

interface PackGateProps {
  packId: string;
  children: ReactNode;
  /** Optional custom fallback UI instead of the default card */
  fallback?: ReactNode;
  /** If true, renders nothing instead of the fallback card */
  silent?: boolean;
}

export function PackGate({ packId, children, fallback, silent }: PackGateProps) {
  const { tier } = useEngineSubscription();
  const { isPackActive, isLoading } = useArtifactSlots(tier);

  if (isLoading) return null;

  if (isPackActive(packId)) {
    return <>{children}</>;
  }

  if (silent) return null;
  if (fallback) return <>{fallback}</>;

  const pack = ARTIFACT_PACKS.find(p => p.id === packId);
  const packName = pack?.name ?? packId;

  return (
    <Card className="border-border/50 bg-muted/20">
      <CardContent className="p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Package className="w-5 h-5 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{packName}</p>
            <p className="text-xs text-muted-foreground">This feature requires an active pipeline pack.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild className="shrink-0">
          <Link to="/packs">
            Manage Packs <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * requirePack — Imperative entitlement check utility
 * Use in event handlers or effects, not for rendering.
 */
export function usePackEntitlement() {
  const { tier } = useEngineSubscription();
  const slotState = useArtifactSlots(tier);

  return {
    isPackActive: slotState.isPackActive,
    requirePack: (packId: string): boolean => slotState.isPackActive(packId),
    slotState,
  };
}
