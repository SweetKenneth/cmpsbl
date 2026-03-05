/**
 * Public Mining Engine
 * Client-side mining request handler.
 * High-Value Bias: FORCED OFF. No client parameter accepted.
 * Quality floor: >= 68. Enforced server-side.
 */

import { supabase } from '@/integrations/supabase/client';
import { scoreToPublicTier, computeDisplayValuation, QUALITY_FLOOR, type PublicTier } from './public-tiers';

export interface MineResult {
  id: string;
  name: string;
  description: string;
  score: number;
  publicTier: PublicTier;
  valuationDisplay: number;
  category: string;
  systemChain: string[];
}

export interface MineResponse {
  ok: boolean;
  results: MineResult[];
  bestScore: number | null;
  tierBreakdown: Record<string, number>;
  rerollCredit: boolean;
  persistedCount: number;
  alreadyOwnedCount: number;
  error?: string;
  retryAfterMs?: number;
}

/**
 * Execute a public mine request.
 * Calls the foundry-mine edge function.
 * Bias parameter is NEVER sent — server enforces bias=false.
 */
export async function executeMine(): Promise<MineResponse> {
  const { data, error } = await supabase.functions.invoke('foundry-mine', {
    body: {
      variant: 'public',
    },
  });

  if (error) {
    if (error.message?.includes('429') || error.message?.includes('rate')) {
      return {
        ok: false,
        results: [],
        bestScore: null,
        tierBreakdown: {},
        rerollCredit: false,
        persistedCount: 0,
        alreadyOwnedCount: 0,
        error: 'Rate limited. Try again later.',
        retryAfterMs: 60000,
      };
    }
    return {
      ok: false,
      results: [],
      bestScore: null,
      tierBreakdown: {},
      rerollCredit: false,
      persistedCount: 0,
      alreadyOwnedCount: 0,
      error: error.message || 'Mining failed',
    };
  }

  return data as MineResponse;
}

/**
 * Client-side filter: defensive quality floor.
 * Server already enforces this, but belt-and-suspenders.
 */
export function filterByQualityFloor(results: MineResult[]): MineResult[] {
  return results.filter(r => r.score >= QUALITY_FLOOR);
}
