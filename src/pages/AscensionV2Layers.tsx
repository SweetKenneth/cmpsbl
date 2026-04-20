/**
 * Ascension V2 — My Layers
 *
 * Auth-gated dashboard at /ascension-v2/layers.
 * Lists every layer the signed-in user owns or has recently attached:
 *   - Crown Jewel layers from getAvailableLayers() the user has rights to
 *   - Store-purchased layers from user_layer_entitlements
 *   - Run-attached layers pulled from analytics_events (layer_attached)
 *
 * Each row shows source + last-attached date and offers a one-click
 * "Re-attach to next run" that hands the IDs to V2EnhanceStep via
 * sessionStorage and routes the user to /ascension-v2.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Layers, ShoppingBag, Crown, Repeat, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getAvailableLayers, type CmpsblLayerDefinition } from '@/lib/export/cmpsbl-layers';
import { useLayerEntitlements } from '@/hooks/useLayerEntitlements';
import { setReattachLayers } from '@/lib/ascension-v2/reattach';

type LayerSource = 'crown-jewel' | 'store' | 'sdk';

interface OwnedLayer {
  id: string;
  name: string;
  description: string;
  cjpi: number;
  source: LayerSource;
  lastAttachedAt: string | null;
}

const SOURCE_META: Record<LayerSource, { label: string; icon: typeof Crown; tone: string }> = {
  'crown-jewel': { label: 'Crown Jewel', icon: Crown, tone: 'bg-primary/10 text-primary border-primary/30' },
  store: { label: 'Store', icon: ShoppingBag, tone: 'bg-accent/10 text-accent-foreground border-accent/30' },
  sdk: { label: 'SDK', icon: Layers, tone: 'bg-muted text-muted-foreground border-border' },
};

export default function AscensionV2Layers() {
  const { user, loading: authLoading } = useAuth();
  const { ownedLayerIds, loading: entitlementsLoading } = useLayerEntitlements();
  const navigate = useNavigate();

  const [lastAttached, setLastAttached] = useState<Record<string, string>>({});
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Pull last-attach timestamps from funnel telemetry.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('analytics_events')
        .select('metadata, created_at')
        .eq('user_id', user.id)
        .eq('event_type', 'layer_attached')
        .order('created_at', { ascending: false })
        .limit(200);
      if (cancelled) return;
      const map: Record<string, string> = {};
      for (const row of data ?? []) {
        const meta = (row.metadata ?? {}) as { layer_ids?: string[] };
        const ids = Array.isArray(meta.layer_ids) ? meta.layer_ids : [];
        for (const id of ids) {
          if (!map[id]) map[id] = row.created_at as string;
        }
      }
      setLastAttached(map);
      setLoadingHistory(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const allLayerDefs: CmpsblLayerDefinition[] = useMemo(() => getAvailableLayers(), []);

  const ownedLayers: OwnedLayer[] = useMemo(() => {
    const result: OwnedLayer[] = [];
    for (const def of allLayerDefs) {
      const fromStore = ownedLayerIds.has(def.id);
      const everAttached = lastAttached[def.id] != null;
      if (!fromStore && !everAttached) continue;
      result.push({
        id: def.id,
        name: def.name,
        description: def.description,
        cjpi: def.cjpi,
        source: fromStore ? 'store' : 'crown-jewel',
        lastAttachedAt: lastAttached[def.id] ?? null,
      });
    }
    return result.sort((a, b) => b.cjpi - a.cjpi);
  }, [allLayerDefs, ownedLayerIds, lastAttached]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth?next=/ascension-v2/layers" replace />;

  const isLoading = entitlementsLoading || loadingHistory;

  const reattach = (ids: string[]) => {
    setReattachLayers(ids);
    navigate('/ascension-v2');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="h-5 w-5 text-primary" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Ascension V2</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">My Layers</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
            Every layer you own or have attached to a run. Re-attach any layer to your next
            ascension with one click — your picks pre-load in the Enhance step.
          </p>
        </header>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your layers…
          </div>
        )}

        {!isLoading && ownedLayers.length === 0 && (
          <Card className="p-8 text-center border-dashed">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <h2 className="text-lg font-semibold mb-1">No layers yet</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Attach Crown Jewel layers during your next run, or browse the Store to add
              specialized capabilities to your Layer 2.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button asChild>
                <Link to="/ascension-v2">Run Ascension <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/store">Visit Store</Link>
              </Button>
            </div>
          </Card>
        )}

        {!isLoading && ownedLayers.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {ownedLayers.length} layer{ownedLayers.length === 1 ? '' : 's'} available
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => reattach(ownedLayers.map((l) => l.id))}
              >
                <Repeat className="mr-1.5 h-3.5 w-3.5" />
                Re-attach all
              </Button>
            </div>

            <div className="space-y-3">
              {ownedLayers.map((layer) => {
                const meta = SOURCE_META[layer.source];
                const Icon = meta.icon;
                return (
                  <Card key={layer.id} className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <h3 className="text-sm sm:text-base font-semibold truncate">{layer.name}</h3>
                          <Badge variant="outline" className={meta.tone}>
                            <Icon className="mr-1 h-3 w-3" />
                            {meta.label}
                          </Badge>
                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                            CJPI {layer.cjpi}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {layer.description}
                        </p>
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          {layer.lastAttachedAt
                            ? `Last attached ${new Date(layer.lastAttachedAt).toLocaleDateString()}`
                            : 'Not yet attached to a run'}
                        </p>
                      </div>
                      <div className="flex sm:flex-col sm:items-end gap-2 shrink-0">
                        <Button size="sm" onClick={() => reattach([layer.id])}>
                          <Repeat className="mr-1.5 h-3.5 w-3.5" />
                          Re-attach
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <Button asChild variant="ghost">
                <Link to="/store">Browse more layers in the Store →</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
