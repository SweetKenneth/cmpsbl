/**
 * Combo Retirement — Permanent DB-backed retirement of exhausted primitive combinations.
 * Once a combo is retired, the discovery engine will never re-run it.
 */

import { supabase } from '@/integrations/supabase/client';

export interface RetiredComboRecord {
  id: string;
  combo_hash: string;
  module_chain: string[];
  category: string;
  total_runs: number;
  total_discoveries: number;
  retired_at: string;
  retired_by: string;
}

/** Canonical hash for a module+category combination */
export function comboHash(modules: string[], category: string): string {
  return `${[...modules].sort().join('+')}|${category}`;
}

/** Load all permanently retired combos from DB */
export async function loadRetiredCombos(): Promise<Map<string, RetiredComboRecord>> {
  const { data } = await supabase
    .from('discovery_retired_combos')
    .select('*');
  const map = new Map<string, RetiredComboRecord>();
  for (const row of (data ?? []) as unknown as RetiredComboRecord[]) {
    map.set(row.combo_hash, row);
  }
  return map;
}

/** Permanently retire a combination */
export async function retireComboPermanently(
  modules: string[],
  category: string,
  totalRuns: number,
  totalDiscoveries: number,
  retiredBy = 'auto',
): Promise<void> {
  const hash = comboHash(modules, category);
  await supabase
    .from('discovery_retired_combos')
    .upsert({
      combo_hash: hash,
      module_chain: modules,
      category,
      total_runs: totalRuns,
      total_discoveries: totalDiscoveries,
      retired_by: retiredBy,
    } as any, { onConflict: 'combo_hash' });
}

/** Check if a combo is permanently retired (from a preloaded map) */
export function isComboRetiredInMap(
  retiredMap: Map<string, RetiredComboRecord>,
  modules: string[],
  category: string,
): boolean {
  return retiredMap.has(comboHash(modules, category));
}

/** Get count of permanently retired combos */
export async function getRetiredComboCount(): Promise<number> {
  const { count } = await supabase
    .from('discovery_retired_combos')
    .select('*', { count: 'exact', head: true });
  return count ?? 0;
}

/** Clear all retired combos (admin action) */
export async function clearAllRetiredCombos(): Promise<void> {
  await supabase
    .from('discovery_retired_combos')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
}

/**
 * Estimate the total number of possible combinations for a given pool + category set.
 * Uses C(n,k) for each chain length from minDepth to maxDepth across all categories.
 */
export function estimateTotalCombinations(
  poolSize: number,
  categoryCount: number,
  minDepth: number,
  maxDepth: number,
): number {
  let total = 0;
  for (let k = minDepth; k <= maxDepth; k++) {
    // C(n,k) — order doesn't matter for retirement (sorted hash)
    let cnk = 1;
    for (let i = 0; i < k; i++) {
      cnk = cnk * (poolSize - i) / (i + 1);
    }
    total += Math.floor(cnk) * categoryCount;
  }
  return total;
}
