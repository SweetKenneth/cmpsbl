/**
 * useLayerEntitlements
 * ━━━━━━━━━━━━━━━━━━━━
 * Returns the set of inventory layer IDs the current user has purchased.
 *
 * Source: public.user_layer_entitlements (granted via Stripe webhook or
 * Governor admin grant). Governors automatically see every inventory layer
 * as entitled — they own the substrate.
 *
 * Read path uses the security-definer `get_active_layer_entitlements` RPC
 * so RLS still scopes to the calling user without exposing the table shape.
 */
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { INVENTORY_LAYERS } from '@/lib/export/layers/inventory';

export interface LayerEntitlement {
  layerId: string;
  source: string;
  grantedAt: string;
}

export interface UseLayerEntitlementsResult {
  /** Set of layer_id strings the user owns (active, non-revoked). */
  ownedLayerIds: Set<string>;
  /** Detailed entitlement records (real DB rows, governor view is synthesized). */
  entitlements: LayerEntitlement[];
  /** True while the initial fetch is running. */
  loading: boolean;
  /** Last error from the RPC, if any. */
  error: string | null;
  /** Re-fetch entitlements (e.g. after a successful checkout). */
  refresh: () => Promise<void>;
}

export function useLayerEntitlements(): UseLayerEntitlementsResult {
  const { user } = useAuth();
  const { isGovernor } = useUserRole();
  const [entitlements, setEntitlements] = useState<LayerEntitlement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntitlements = async () => {
    if (!user) {
      setEntitlements([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    // Governor sees all inventory layers as entitled — they own the substrate.
    if (isGovernor) {
      const synthetic: LayerEntitlement[] = INVENTORY_LAYERS.map((layer) => ({
        layerId: layer.id,
        source: 'governor',
        grantedAt: new Date(0).toISOString(),
      }));
      setEntitlements(synthetic);
      setLoading(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: rpcError } = await (supabase as any).rpc('get_active_layer_entitlements', {
      _user_id: user.id,
    });

    if (rpcError) {
      setError(rpcError.message);
      setEntitlements([]);
      setLoading(false);
      return;
    }

    const rows: LayerEntitlement[] = (data ?? []).map((r: any) => ({
      layerId: r.layer_id,
      source: r.source,
      grantedAt: r.granted_at,
    }));
    setEntitlements(rows);
    setLoading(false);
  };

  useEffect(() => {
    fetchEntitlements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isGovernor]);

  const ownedLayerIds = useMemo(
    () => new Set(entitlements.map((e) => e.layerId)),
    [entitlements],
  );

  return {
    ownedLayerIds,
    entitlements,
    loading,
    error,
    refresh: fetchEntitlements,
  };
}
