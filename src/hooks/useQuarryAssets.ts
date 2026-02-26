/**
 * useQuarryAssets — CRUD hook for Quarry asset registry
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { QuarryAsset, QuarryTier, QuarryVisibility, QuarryAssetType } from '@/lib/quarry/types';

const QUARRY_KEY = ['quarry-assets'];

export function useQuarryAssets(options?: {
  tierFilter?: QuarryTier;
  typeFilter?: QuarryAssetType;
  visibilityFilter?: QuarryVisibility;
  publicOnly?: boolean;
}) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [...QUARRY_KEY, options],
    queryFn: async () => {
      let q = supabase
        .from('quarry_assets')
        .select('*')
        .order('asset_type')
        .order('tier')
        .order('name');

      if (options?.tierFilter) q = q.eq('tier', options.tierFilter);
      if (options?.typeFilter) q = q.eq('asset_type', options.typeFilter);
      if (options?.visibilityFilter) q = q.eq('visibility', options.visibilityFilter);
      if (options?.publicOnly) q = q.in('visibility', ['tier_exposed', 'public_curated']);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as QuarryAsset[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (asset: Partial<QuarryAsset> & { asset_key: string; asset_type: QuarryAssetType; name: string }) => {
      const { data, error } = await supabase
        .from('quarry_assets')
        .upsert(asset as any, { onConflict: 'asset_key' })
        .select()
        .single();
      if (error) throw error;
      return data as QuarryAsset;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUARRY_KEY });
      toast.success('Asset updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('quarry_assets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUARRY_KEY });
      toast.success('Asset removed');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkUpdateTier = useMutation({
    mutationFn: async ({ ids, tier }: { ids: string[]; tier: QuarryTier }) => {
      const { error } = await supabase
        .from('quarry_assets')
        .update({ tier } as any)
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUARRY_KEY });
      toast.success('Tier updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    assets: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    upsert,
    remove,
    bulkUpdateTier,
    refetch: query.refetch,
  };
}

/** Public hook — only reads visible assets for /upgrade page */
export function usePublicQuarryAssets(tier?: QuarryTier) {
  return useQuery({
    queryKey: ['quarry-public', tier],
    queryFn: async () => {
      let q = supabase
        .from('quarry_assets')
        .select('*')
        .in('visibility', ['tier_exposed', 'public_curated'])
        .eq('future_release', false)
        .order('asset_type')
        .order('name');

      if (tier) q = q.eq('tier', tier);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as QuarryAsset[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
