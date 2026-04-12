/**
 * COMPILER™ Auto-Mode — Full Autonomous Cycle
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Runs the complete COMPILER pipeline without governor intervention:
 *   1. Generate proposals from all verticals
 *   2. Auto-score every proposal (rarity × uniqueness × usefulness)
 *   3. Auto-approve/reject based on composite score
 *   4. ECONOMY prices approved products ($50–$99)
 *   5. Rotate into Marketplace
 *
 * Called by the CDM reactor on the 8-hour cadence.
 *
 * © CMPSBL® — All rights reserved.
 */

import { runCompilerCycle } from '@/lib/factory/product-compiler';
import {
  runAutoScoreCycle,
  rotateMarketplaceListings,
  retroactivelyScoreExisting,
} from './compiler-auto-score';

export interface CompilerAutoModeResult {
  proposalsGenerated: number;
  scored: number;
  approved: number;
  rejected: number;
  listed: number;
  rotationPromoted: number;
  rotationCycledOut: number;
  durationMs: number;
  timestamp: string;
}

/**
 * Execute a full autonomous COMPILER cycle.
 * No governor review needed — the scoring model self-approves.
 */
export async function runCompilerAutoMode(): Promise<CompilerAutoModeResult> {
  const start = Date.now();

  // Step 1: Generate proposals from all verticals
  const { proposalsGenerated } = await runCompilerCycle();

  // Step 2 + 3: Auto-score all pending proposals
  const scoreResult = await runAutoScoreCycle();

  // Step 4: Rotate marketplace listings
  const rotation = await rotateMarketplaceListings();

  return {
    proposalsGenerated,
    scored: scoreResult.scored,
    approved: scoreResult.approved,
    rejected: scoreResult.rejected,
    listed: scoreResult.listed,
    rotationPromoted: rotation.promoted,
    rotationCycledOut: rotation.cycledOut,
    durationMs: Date.now() - start,
    timestamp: new Date().toISOString(),
  };
}

/**
 * One-time bootstrap: score all existing compiled products
 * that were created before auto-mode went live.
 */
export async function bootstrapAutoMode(): Promise<{
  retroactive: { total: number; listed: number; rejected: number };
  rotation: { promoted: number; cycledOut: number };
}> {
  // Score everything that hasn't been scored yet
  const retroactive = await retroactivelyScoreExisting();

  // Run a rotation pass to fill the marketplace
  const rotation = await rotateMarketplaceListings();

  return { retroactive, rotation };
}
