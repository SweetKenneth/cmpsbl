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
  /** Showroom pool (status = 'showroom') */
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
// §2 — QUERY HELPER (avoids deep TS inference chains)
// ═══════════════════════════════════════════════════════════════

async function dbCount(rpcName: string, params: Record<string, unknown> = {}): Promise<number> {
  // Use raw PostgREST count queries to avoid deep type chains
  return 0; // Fallback — actual implementation below
}

/**
 * Simple count using .select with head: true.
 * We cast early to avoid TS depth explosion from chained .eq().
 */
async function simpleCount(
  filters: Array<[string, unknown]>,
  rangeFilters?: Array<['gte' | 'lte', string, number]>,
  inFilters?: Array<[string, string[]]>,
): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = supabase.from('discoveries').select('id', { count: 'exact', head: true });
  for (const [col, val] of filters) {
    q = q.eq(col, val);
  }
  if (rangeFilters) {
    for (const [op, col, val] of rangeFilters) {
      q = op === 'gte' ? q.gte(col, val) : q.lte(col, val);
    }
  }
  if (inFilters) {
    for (const [col, vals] of inFilters) {
      q = q.in(col, vals);
    }
  }
  const { count, error } = await q;
  if (error) return 0;
  return (count as number) ?? 0;
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
        simpleCount([]),
        simpleCount([['status', 'registry']]),
        simpleCount([['status', 'showroom']]),
        simpleCount([['status', 'junkyard']]),
        simpleCount([['is_crown_jewel', true]]),
        simpleCount(
          [['status', 'registry']],
          [['gte', 'cjpi', 85], ['lte', 'cjpi', 91]],
        ),
        simpleCount([], [['gte', 'generation', 1]]),
        simpleCount(
          [['is_crown_jewel', false]],
          undefined,
          [['status', ['showroom', 'discovered']]],
        ),
      ]);

      setCounts({ total, registry, showroom, junkyard, memoryStreamPool, crownJewels, aTier, mutations });

      const verticalResults = await Promise.all(
        ALL_VERTICALS.map(async (vertical) => {
          const [vTotal, vRegistry, vShowroom, vJunkyard, vCJ] = await Promise.all([
            simpleCount([['vertical', vertical]]),
            simpleCount([['vertical', vertical], ['status', 'registry']]),
            simpleCount([['vertical', vertical], ['status', 'showroom']]),
            simpleCount([['vertical', vertical], ['status', 'junkyard']]),
            simpleCount([['vertical', vertical], ['is_crown_jewel', true]]),
          ]);
          return { vertical, total: vTotal, registry: vRegistry, showroom: vShowroom, junkyard: vJunkyard, crownJewels: vCJ };
        }),
      );

      setVerticals(verticalResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch discovery counts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

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
      simpleCount([['vertical', vertical]]),
      simpleCount([['vertical', vertical], ['is_crown_jewel', true]]),
      simpleCount([['vertical', vertical], ['status', 'showroom']]),
      simpleCount([['vertical', vertical], ['status', 'junkyard']]),
    ]);
    setData({ total, crownJewels, showroom, junkyard });
    setLoading(false);
  }, [vertical]);

  useEffect(() => { refresh(); }, [refresh]);

  return { ...data, loading, refresh };
}

// Re-export for convenience in non-hook contexts
export { simpleCount as queryDiscoveryCount };
