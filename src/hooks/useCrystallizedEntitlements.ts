/**
 * useCrystallizedEntitlements — Client hook for crystallized asset access checks.
 * Queries the `can_use_crystallized` RPC and caches results.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserLimits } from '@/hooks/useUserLimits';

const ENTITLEMENT_KEY = ['crystallized-entitlements'];

interface CrystallizedAsset {
  id: string;
  asset_key: string;
  asset_type: string;
  display_name: string;
  status: string;
  tier_min: string;
  pack_id: string | null;
}

export function useCrystallizedEntitlements() {
  const { user } = useAuth();
  const { crystallizedAssetCap, isLoading: limitsLoading } = useUserLimits();

  // Fetch all released assets for display purposes
  const assetsQuery = useQuery({
    queryKey: [...ENTITLEMENT_KEY, 'assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crystallized_assets')
        .select('*')
        .order('asset_key');
      if (error) throw error;
      return (data ?? []) as CrystallizedAsset[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const assets = assetsQuery.data ?? [];
  const releasedAssets = assets.filter(a => a.status === 'released');
  const reservedCount = assets.filter(a => a.status === 'reserved').length;

  /**
   * Check if the current user can use a specific crystallized asset.
   * Uses the server-side RPC for authoritative checks.
   */
  const canUseAsset = async (assetKey: string): Promise<boolean> => {
    if (!user?.id) return false;
    const { data, error } = await supabase.rpc('can_use_crystallized', {
      p_user_id: user.id,
      p_asset_key: assetKey,
    });
    if (error) return false;
    return data === true;
  };

  return {
    assets,
    releasedAssets,
    releasedCount: releasedAssets.length,
    reservedCount,
    crystallizedAssetCap,
    canUseAsset,
    isLoading: assetsQuery.isLoading || limitsLoading,
  };
}
