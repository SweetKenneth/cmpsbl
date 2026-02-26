/**
 * PASS 8 — COST / ECONOMY PASS (Gated: RELEASE_GATE_COST=1)
 * Ensures the release does not introduce runaway cost behavior
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { PassResult } from '../types';

export async function runCostPass(): Promise<PassResult> {
  const start = Date.now();
  const enabled = process.env.RELEASE_GATE_COST === '1';

  if (!enabled) {
    return {
      pass: 8,
      name: 'COST / ECONOMY',
      status: 'SKIP',
      required: false,
      durationMs: Date.now() - start,
      notes: ['Gated pass — set RELEASE_GATE_COST=1 to enable'],
      artifacts: [],
    };
  }

  const notes: string[] = [];
  let failed = 0;

  // Check if ECONOMY module exists
  const economyPath = join(process.cwd(), 'src/lib/substrate/economy');
  if (!existsSync(economyPath)) {
    return {
      pass: 8,
      name: 'COST / ECONOMY',
      status: 'SKIP',
      required: false,
      durationMs: Date.now() - start,
      notes: ['ECONOMY module not found — skipping cost analysis'],
      artifacts: [],
    };
  }

  // Check for cost config
  try {
    const configCandidates = [
      join(economyPath, 'cost-config.ts'),
      join(economyPath, 'pricing.ts'),
      join(economyPath, 'index.ts'),
    ];

    let foundConfig = false;
    for (const cfg of configCandidates) {
      if (existsSync(cfg)) {
        foundConfig = true;
        const content = readFileSync(cfg, 'utf-8');
        
        // Check for cost caps
        if (content.includes('maxCost') || content.includes('costCap') || content.includes('budget')) {
          notes.push('✓ Cost caps/budgets defined');
        } else {
          notes.push('⚠ No cost caps found in economy config');
          failed++;
        }

        // Check for spike detection
        if (content.includes('spike') || content.includes('anomaly') || content.includes('threshold')) {
          notes.push('✓ Spike/anomaly detection present');
        } else {
          notes.push('⚠ No spike detection logic found');
        }
        break;
      }
    }

    if (!foundConfig) {
      notes.push('⚠ ECONOMY module exists but no config file found');
    }
  } catch (e: any) {
    notes.push(`⚠ Cost analysis error: ${e.message}`);
  }

  return {
    pass: 8,
    name: 'COST / ECONOMY',
    status: failed > 0 ? 'FAIL' : 'PASS',
    required: false,
    durationMs: Date.now() - start,
    notes,
    artifacts: [],
  };
}
