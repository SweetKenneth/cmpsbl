/**
 * CrystallizedGate — Guards UI behind crystallized asset entitlement.
 * Similar to PackGate but checks the crystallized_assets registry.
 */
import { useState, useEffect, type ReactNode } from 'react';
import { ArrowUpRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCrystallizedEntitlements } from '@/hooks/useCrystallizedEntitlements';

interface CrystallizedGateProps {
  assetKey: string;
  children: ReactNode;
  fallback?: ReactNode;
  silent?: boolean;
}

export function CrystallizedGate({ assetKey, children, fallback, silent }: CrystallizedGateProps) {
  const { canUseAsset, isLoading, assets } = useCrystallizedEntitlements();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoading) {
      canUseAsset(assetKey).then(setAllowed);
    }
  }, [assetKey, isLoading]);

  if (isLoading || allowed === null) return null;
  if (allowed) return <>{children}</>;
  if (silent) return null;
  if (fallback) return <>{fallback}</>;

  const asset = assets.find(a => a.asset_key === assetKey);
  const isReserved = asset?.status === 'reserved';

  return (
    <Card className="border-border/50 bg-muted/20">
      <CardContent className="p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {isReserved ? 'Reserved Capability' : 'Pack Required'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isReserved
                ? 'This capability is reserved for a future release.'
                : 'Activate the required capability pack to unlock this capability.'}
            </p>
          </div>
        </div>
        {!isReserved && (
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <Link to="/packs">
              Manage Packs <ArrowUpRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
