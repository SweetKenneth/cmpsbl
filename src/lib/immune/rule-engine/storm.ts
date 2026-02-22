/**
 * Immunity Mesh — Mutation Storm Simulator (shadow-only)
 * Generates adversarial payloads and runs them against executors.
 * NEVER touches production data.
 */

import { isShadowMeshEnabled } from '@/lib/system/flags';
import { PILOT_EXECUTORS } from '@/immune/pilotExecutors';
import { runShadowProbe } from '@/lib/shadow/probe';
import { registerShadowStubs } from '@/lib/shadow/stubs';
import { createMeshRun, completeMeshRun, upsertRule, recordInvocation } from './db';
import { STORM_CATEGORIES, STORM_DEFAULT_MUTATIONS_PER_EXECUTOR, type StormCategory } from './constants';

interface StormPayload {
  category: StormCategory;
  input: Record<string, unknown>;
}

function generateStormPayloads(count: number): StormPayload[] {
  const payloads: StormPayload[] = [];
  for (let i = 0; i < count; i++) {
    const cat = STORM_CATEGORIES[i % STORM_CATEGORIES.length];
    payloads.push({ category: cat, input: generatePayloadForCategory(cat, i) });
  }
  return payloads;
}

function generatePayloadForCategory(cat: StormCategory, seed: number): Record<string, unknown> {
  switch (cat) {
    case 'schema_mismatch': return { text: 42, count: 'not_a_number', valid: 'yes' };
    case 'unicode_surrogate': return { text: `\uD800\uDC00 test ${String.fromCharCode(0xFFFD)}`, query: '🔥'.repeat(100) };
    case 'missing_required': return {};
    case 'rate_limit': return { text: 'x'.repeat(100000), items: Array(1000).fill('flood') };
    case 'auth_edge': return { user_id: '../../../etc/passwd', token: 'null', role: '__proto__' };
    case 'injection': return { text: '<script>alert(1)</script>', query: "'; DROP TABLE --", path: '{{constructor.constructor}}' };
    case 'overflow': return { count: Number.MAX_SAFE_INTEGER, depth: -1, ratio: Infinity };
    case 'null_coercion': return { text: null, count: undefined, flag: NaN, items: [null, undefined] };
    default: return { seed };
  }
}

export interface StormResult {
  runId: string;
  executorsProbed: number;
  totalEvents: number;
  safeFails: number;
  repaired: number;
  repairFailures: number;
  escalations: number;
  categoryBreakdown: Record<StormCategory, { total: number; safe: number; repaired: number }>;
}

/**
 * Run a mutation storm. Shadow-only, gated by mesh toggle.
 */
export async function runMutationStorm(
  executors?: string[],
  mutationsPerExecutor = STORM_DEFAULT_MUTATIONS_PER_EXECUTOR,
): Promise<StormResult | null> {
  if (!(await isShadowMeshEnabled())) {
    console.warn('[storm] Mesh is OFF — skipping storm');
    return null;
  }

  registerShadowStubs();

  const targetExecutors = executors?.length ? executors : [...PILOT_EXECUTORS].slice(0, 20);
  const runId = await createMeshRun('storm', '6h', `Storm: ${targetExecutors.length} executors × ${mutationsPerExecutor} mutations`);

  let totalEvents = 0, safeFails = 0, repaired = 0, repairFailures = 0, escalations = 0;
  const catBreak = {} as Record<StormCategory, { total: number; safe: number; repaired: number }>;
  for (const c of STORM_CATEGORIES) catBreak[c] = { total: 0, safe: 0, repaired: 0 };

  for (const executor of targetExecutors) {
    const payloads = generateStormPayloads(mutationsPerExecutor);
    for (const payload of payloads) {
      try {
        const report = await runShadowProbe(executor, payload.input);
        totalEvents += report.totalRuns;
        safeFails += report.summary.failedSafe;
        repaired += report.summary.repaired;
        repairFailures += report.summary.escalated;
        escalations += report.summary.escalated;

        catBreak[payload.category].total += report.totalRuns;
        catBreak[payload.category].safe += report.summary.failedSafe;
        catBreak[payload.category].repaired += report.summary.repaired;
      } catch (err) {
        console.error(`[storm] ${executor}:`, err);
        totalEvents++;
        safeFails++;
      }
    }
  }

  await completeMeshRun(runId, {
    total_events: totalEvents,
    safe_fails: safeFails,
    repaired,
    repair_failures: repairFailures,
    escalations,
  });

  return {
    runId, executorsProbed: targetExecutors.length,
    totalEvents, safeFails, repaired, repairFailures, escalations,
    categoryBreakdown: catBreak,
  };
}
