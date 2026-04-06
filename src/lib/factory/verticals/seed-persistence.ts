/**
 * CMPSBL® — Seed Engine DB Persistence Layer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Writes seed engine discoveries directly to the unified discoveries table.
 * Replaces in-memory vault/pool storage with database persistence.
 *
 * © CMPSBL® — All rights reserved.
 */

import { supabase } from '@/integrations/supabase/client';

export interface SeedDiscoveryRow {
  id: string;
  name: string;
  description: string;
  cjpiScore: number;
  primitiveChain: string[];
  tier: string;
  route: string;
  category: string;
  vertical: string;
  runId: string;
}

/**
 * Persist an array of seed discoveries to the unified discoveries table.
 * - CJPI ≥ 95 → status='registry', is_crown_jewel=true
 * - CJPI 68–94 → status='showroom'
 * - CJPI < 68  → status='junkyard'
 *
 * Uses upsert (ON CONFLICT DO NOTHING) so re-seeding is safe.
 */
export async function persistSeedDiscoveries(
  discoveries: SeedDiscoveryRow[],
  vertical: string,
  runId: string,
): Promise<{ persisted: number; errors: number }> {
  let persisted = 0;
  let errors = 0;

  // Batch in groups of 50 to avoid payload limits
  const BATCH_SIZE = 50;

  for (let i = 0; i < discoveries.length; i += BATCH_SIZE) {
    const batch = discoveries.slice(i, i + BATCH_SIZE);

    const rows = batch.map(d => {
      const isRegistry = d.cjpiScore >= 95;
      const status = isRegistry ? 'registry' : d.cjpiScore >= 68 ? 'showroom' : 'junkyard';
      const isCrownJewel = isRegistry;

      return {
        id: d.id,
        run_id: runId,
        name: d.name,
        description: d.description,
        category: d.category,
        tier: d.tier,
        cjpi: d.cjpiScore,
        synergy_multiplier: 1.0,
        components: JSON.stringify([]),
        module_chain: d.primitiveChain,
        status,
        is_crown_jewel: isCrownJewel,
        vertical,
        crown_jewel_capabilities: isRegistry
          ? JSON.stringify(d.primitiveChain.map(p => ({
              primitive: p,
              capability: d.name,
              cjpi: d.cjpiScore,
            })))
          : JSON.stringify([]),
      };
    });

    const { error } = await supabase
      .from('discoveries')
      .upsert(rows as any, { onConflict: 'id', ignoreDuplicates: true });

    if (error) {
      errors += batch.length;
    } else {
      persisted += batch.length;
    }
  }

  return { persisted, errors };
}

/**
 * Ensure a discovery_run record exists for seed operations.
 * Creates one if it doesn't exist (idempotent).
 */
export async function ensureSeedRun(runId: string, vertical: string, totalCandidates: number): Promise<void> {
  await supabase.from('discovery_runs').upsert({
    id: runId,
    started_at: new Date().toISOString(),
    finished_at: new Date().toISOString(),
    status: 'completed',
    total_candidates: totalCandidates,
    accepted_count: totalCandidates,
    top_find_name: `${vertical} Genesis Seed`,
    top_find_cjpi: 98,
    scoring_version: 'genesis-seed-v1',
    dry_run: false,
    exploratory_mode: false,
    logs: { source: 'genesis-seed', vertical },
  } as any, { onConflict: 'id', ignoreDuplicates: true });
}
