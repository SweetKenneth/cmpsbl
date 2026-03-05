/**
 * Public Mining Engine
 * Client-side mining request handler.
 * High-Value Bias: FORCED OFF. No client parameter accepted.
 * Quality floor: >= 68. Enforced server-side.
 * 
 * v13.3.1: Import quality floor from config.
 */

import { supabase } from '@/integrations/supabase/client';
import { scoreToPublicTier, computeDisplayValuation, type PublicTier } from './public-tiers';
import { QUALITY_FLOOR } from '@/config/substrate';
import { fromError } from '@/lib/system/errors';
import type { PipelineStep } from '@/substrate/pipeline-fingerprint';

export type { PipelineStep };

export interface MineResult {
  id: string;
  name: string;
  description: string;
  score: number;
  publicTier: PublicTier;
  valuationDisplay: number;
  category: string;
  systemChain: string[];
  pipelineSteps?: PipelineStep[];
  fingerprint?: string;
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

function buildFailureResponse(error: string, retryAfterMs?: number): MineResponse {
  return {
    ok: false,
    results: [],
    bestScore: null,
    tierBreakdown: {},
    rerollCredit: false,
    persistedCount: 0,
    alreadyOwnedCount: 0,
    error,
    retryAfterMs,
  };
}

function sanitizeMineError(message?: string): string {
  const normalized = (message || '').toLowerCase();

  if (normalized.includes('429') || normalized.includes('rate')) {
    return 'Rate limited. Try again in a moment.';
  }
  if (normalized.includes('401') || normalized.includes('unauthorized') || normalized.includes('auth')) {
    return 'Authentication required. Please sign in and try again.';
  }
  if (normalized.includes('timeout') || normalized.includes('timed out')) {
    return 'Crystallization timed out. Please retry.';
  }
  if (normalized.includes('network') || normalized.includes('fetch')) {
    return 'Network issue detected. Check your connection and retry.';
  }

  return 'Crystallization is temporarily unavailable. Recovery is in progress. Please try again.';
}

/**
 * Execute a public mine request.
 * Calls the foundry-mine edge function.
 * Bias parameter is NEVER sent — server enforces bias=false.
 */
export async function executeMine(): Promise<MineResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('foundry-mine', {
      body: {
        variant: 'public',
      },
    });

    if (error) {
      const retryAfter = error.message?.includes('429') || error.message?.toLowerCase().includes('rate')
        ? 60000
        : undefined;
      return buildFailureResponse(sanitizeMineError(error.message), retryAfter);
    }

    if (!data || typeof data !== 'object') {
      return buildFailureResponse('Crystallization temporarily unavailable. Please try again.');
    }

    const response = data as Partial<MineResponse>;

    if (response.ok === false) {
      return buildFailureResponse(
        sanitizeMineError(response.error),
        response.retryAfterMs,
      );
    }

    if (!Array.isArray(response.results)) {
      return buildFailureResponse('Crystallization response was invalid. Please try again.');
    }

    return response as MineResponse;
  } catch (error) {
    const appError = fromError(error, 'MODULE_ERROR');
    return buildFailureResponse(appError.safe_message);
  }
}

/**
 * Client-side filter: defensive quality floor.
 * Server already enforces this, but belt-and-suspenders.
 */
export function filterByQualityFloor(results: MineResult[]): MineResult[] {
  return results.filter(r => r.score >= QUALITY_FLOOR);
}
