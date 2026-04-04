/**
 * useMarketplaceInventory — Reads marketplace inventory from the database
 * Falls back to static seed if DB is empty (initial load before first scan)
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MarketplaceItem, SourceSubstrate, SourceVault, ListingCategory } from '@/agents/merchant/merchant-engine';
import { getMarketplaceTier } from '@/agents/merchant/merchant-engine';
import { MERCHANT_INVENTORY } from '@/agents/merchant/merchant-inventory';

interface DBInventoryRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  pain_points: string[] | null;
  features: string[] | null;
  source_substrate: string;
  source_vault: string;
  source_id: string;
  category: string;
  cjpi_score: number;
  tier: string;
  price_cents: number;
  original_value_cents: number | null;
  primitive_chain: string[] | null;
  downloads: number | null;
  rating: number | null;
  is_featured: boolean | null;
  is_active: boolean | null;
  tags: string[] | null;
  version: string | null;
  created_at: string | null;
  last_verified_at: string | null;
}

function rowToItem(row: DBInventoryRow): MarketplaceItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? '',
    description: row.description ?? '',
    painPoints: row.pain_points ?? [],
    features: row.features ?? [],
    sourceSubstrate: row.source_substrate as SourceSubstrate,
    sourceVault: row.source_vault as SourceVault,
    sourceId: row.source_id,
    category: row.category as ListingCategory,
    cjpiScore: Number(row.cjpi_score),
    tier: getMarketplaceTier(Number(row.cjpi_score)),
    priceCents: row.price_cents,
    originalValueCents: row.original_value_cents ?? 0,
    primitiveChain: row.primitive_chain ?? [],
    downloads: row.downloads ?? 0,
    rating: Number(row.rating ?? 0),
    isFeatured: row.is_featured ?? false,
    isNew: isRecent(row.created_at),
    addedAt: row.created_at ?? new Date().toISOString(),
    lastVerifiedAt: row.last_verified_at ?? new Date().toISOString(),
    version: row.version ?? '1.0.0',
    tags: row.tags ?? [],
  };
}

function isRecent(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const weekAgo = Date.now() - 7 * 86_400_000;
  return new Date(dateStr).getTime() > weekAgo;
}

export function useMarketplaceInventory() {
  return useQuery({
    queryKey: ['marketplace-inventory'],
    queryFn: async (): Promise<MarketplaceItem[]> => {
      const { data, error } = await supabase
        .from('marketplace_inventory')
        .select('*')
        .eq('is_active', true)
        .order('cjpi_score', { ascending: false });

      if (error || !data || data.length === 0) {
        /** Fallback to static seed if DB read fails or is empty */
        return MERCHANT_INVENTORY;
      }

      const dbItems = (data as unknown as DBInventoryRow[]).map(rowToItem);

      /** Use whichever source has more items — DB may lag behind seed after expansion */
      return dbItems.length >= MERCHANT_INVENTORY.length ? dbItems : MERCHANT_INVENTORY;
    },
    staleTime: 5 * 60_000, // 5 min — MERCHANT scans every 8h so no need for rapid refresh
    refetchOnWindowFocus: false,
  });
}

export function useMarketplaceScanLogs() {
  return useQuery({
    queryKey: ['merchant-scan-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchant_scan_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) return [];
      return data ?? [];
    },
    staleTime: 60_000,
  });
}
