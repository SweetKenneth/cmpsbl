/**
 * CMPSBL® — Live Discovery Counts Hook
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Single source of truth for all discovery counts across the substrate.
 * Queries the `discoveries` table directly — replaces every hardcoded
 * and static-file count in the UI.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════

export interface DiscoveryCounts {
  /** Total discoveries across all verticals */
  total: number;
  /** Registry (Crown Jewels + promoted items, status = 'registry') */
  registry: number;
  /** Showroom pool (status = 'showroom', not Crown Jewels) */
  showroom: number;
  /** Junkyard (status = 'junkyard') */
  junkyard: number;
  /** Memory Stream pool (showroom + discovered, not Crown Jewels) */
  memoryStreamPool: number;
  /** Crown Jewels (is_crown_jewel = true) */
  crownJewels: number;
  /** A-Tier count (registry, CJPI 85–91) */
  aTier: number;
  /** Mutations (generation > 0) */
  mutations: number;
}

export interface VerticalCounts {
  vertical: string;
  total: number;
  registry: number;
  showroom: number;
  junkyard: number;
  crownJewels: number;
}

export interface LiveDiscoveryData {
  counts: DiscoveryCounts;
  verticals: VerticalCounts[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════
// §2 — QUERY HELPERS
// ═══════════════════════════════════════════════════════════════

async function countWhere(
  filters: Record<string, unknown>,
  gte?: { col: string; val: number },
  lte?: { col: string; val: number },
): Promise<number> {
  let query = supabase.from('discoveries').select('*', { count: 'exact', head: true });
  for (const [key, val] of Object.entries(filters)) {
    query = query.eq(key, val);
  }
  if (gte) query = query.gte(gte.col, gte.val);
  if (lte) query = query.lte(lte.col, lte.val);
  const { count, error } = await query;
  if (error) return 0;
  return count ?? 0;
}

async function countIn(
  col: string,
  values: string[],
  extras?: Record<string, unknown>,
): Promise<number> {
  let query = supabase.from('discoveries').select('*', { count: 'exact', head: true }).in(col, values);
  if (extras) {
    for (const [key, val] of Object.entries(extras)) {
      query = query.eq(key, val);
    }
  }
  const { count, error } = await query;
  if (error) return 0;
  return count ?? 0;
}

// ═══════════════════════════════════════════════════════════════
// §3 — MAIN HOOK
// ═══════════════════════════════════════════════════════════════

const ALL_VERTICALS = ['primary', 'cyber', 'robotics', 'llm', 'quantum', 'agency', 'media', 'ultimate'];

/**
 * Fetch all discovery counts in parallel from the `discoveries` table.
 * One hook to rule them all — used across admin, showroom, foundry, and vertical pages.
 */
export function useDiscoveryCounts(): LiveDiscoveryData {
  const [counts, setCounts] = useState<DiscoveryCounts>({
    total: 0, registry: 0, showroom: 0, junkyard: 0,
    memoryStreamPool: 0, crownJewels: 0, aTier: 0, mutations: 0,
  });
  const [verticals, setVerticals] = useState<VerticalCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Global counts — fire all in parallel
      const [
        total,
        registry,
        showroom,
        junkyard,
        crownJewels,
        aTier,
        mutations,
        memoryStreamPool,
      ] = await Promise.all([
        countWhere({}),
        countWhere({ status: 'registry' }),
        countWhere({ status: 'showroom' }),
        countWhere({ status: 'junkyard' }),
        countWhere({ is_crown_jewel: true }),
        countWhere(
          { status: 'registry' },
          { col: 'cjpi', val: 85 },
          { col: 'cjpi', val: 91 },
        ),
        countWhere({}, { col: 'generation', val: 1 }),
        countIn('status', ['showroom', 'discovered'], { is_crown_jewel: false }),
      ]);

      setCounts({ total, registry, showroom, junkyard, memoryStreamPool, crownJewels, aTier, mutations });

      // Per-vertical counts — fire all in parallel
      const verticalResults = await Promise.all(
        ALL_VERTICALS.map(async (vertical) => {
          const [vTotal, vRegistry, vShowroom, vJunkyard, vCJ] = await Promise.all([
            countWhere({ vertical }),
            countWhere({ vertical, status: 'registry' }),
            countWhere({ vertical, status: 'showroom' }),
            countWhere({ vertical, status: 'junkyard' }),
            countWhere({ vertical, is_crown_jewel: true }),
          ]);
          return {
            vertical,
            total: vTotal,
            registry: vRegistry,
            showroom: vShowroom,
            junkyard: vJunkyard,
            crownJewels: vCJ,
          };
        }),
      );

      setVerticals(verticalResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch discovery counts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { counts, verticals, loading, error, refresh };
}

/**
 * Lightweight hook for a single vertical's counts.
 */
export function useVerticalCounts(vertical: string): {
  total: number;
  crownJewels: number;
  showroom: number;
  junkyard: number;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState({ total: 0, crownJewels: 0, showroom: 0, junkyard: 0 });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [total, crownJewels, showroom, junkyard] = await Promise.all([
      countWhere({ vertical }),
      countWhere({ vertical, is_crown_jewel: true }),
      countWhere({ vertical, status: 'showroom' }),
      countWhere({ vertical, status: 'junkyard' }),
    ]);
    setData({ total, crownJewels, showroom, junkyard });
    setLoading(false);
  }, [vertical]);

  useEffect(() => { refresh(); }, [refresh]);

  return { ...data, loading, refresh };
}
