/**
 * CMPSBL® DREAM — Consolidation Orchestrator
 * End-to-end dream consolidation cycle:
 * 1. Fetch eligible candidates → 2. Filter → 3. Pair → 4. Synthesize →
 * 5. Compute confidence → 6. Store heuristics → 7. Emit signal
 */

import { filterDreamCandidates, pairCandidates, type DreamCandidate } from './candidateFilter';
import { buildHeuristic, type DreamHeuristic } from './heuristicBuilder';
import { analyzeDrift, isDreamPaused } from './semanticDrift';
import { getLineageChain } from './lineageTracker';
import { recordInJournal, type DreamJournalEntry } from './dreamJournal';

export interface ConsolidationResult {
  cycleId: string;
  candidatesEvaluated: number;
  candidatesEligible: number;
  pairsFormed: number;
  heuristicsCreated: DreamHeuristic[];
  heuristicsFailed: number;
  driftChecked: boolean;
  paused: boolean;
  durationMs: number;
  timestamp: string;
}

export interface ConsolidationConfig {
  maxBatchSize: number;
  minInterCycleMs: number;
  enableDriftCheck: boolean;
  synthesizer: (a: DreamCandidate, b: DreamCandidate) => string | null;
}

const DEFAULT_CONFIG: ConsolidationConfig = {
  maxBatchSize: 50,
  minInterCycleMs: 15 * 60 * 1000, // 15 minutes
  enableDriftCheck: true,
  synthesizer: defaultSynthesizer,
};

let lastCycleAt = 0;

/**
 * Run a full consolidation cycle
 */
export async function runConsolidationCycle(
  memories: Array<{
    id: string;
    content: string;
    generation?: number;
    importance?: number;
    lastAccessedAt?: string;
    domain?: string;
    confidence?: number;
  }>,
  config?: Partial<ConsolidationConfig>
): Promise<ConsolidationResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const start = Date.now();
  const cycleId = `cycle_${start.toString(36)}`;

  // Check pause state
  if (isDreamPaused()) {
    return {
      cycleId,
      candidatesEvaluated: 0,
      candidatesEligible: 0,
      pairsFormed: 0,
      heuristicsCreated: [],
      heuristicsFailed: 0,
      driftChecked: false,
      paused: true,
      durationMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    };
  }

  // Check inter-cycle interval
  if (start - lastCycleAt < cfg.minInterCycleMs && lastCycleAt > 0) {
    return {
      cycleId,
      candidatesEvaluated: 0,
      candidatesEligible: 0,
      pairsFormed: 0,
      heuristicsCreated: [],
      heuristicsFailed: 0,
      driftChecked: false,
      paused: false,
      durationMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    };
  }

  // Step 1-2: Filter candidates
  const filterResult = filterDreamCandidates(memories, {
    maxCandidates: cfg.maxBatchSize,
  });

  // Step 3: Pair candidates
  const pairs = pairCandidates(filterResult.eligible, Math.floor(cfg.maxBatchSize / 2));

  // Step 4-6: Synthesize and build heuristics
  const created: DreamHeuristic[] = [];
  let failed = 0;

  for (const [a, b] of pairs) {
    const rule = cfg.synthesizer(a, b);
    if (!rule) {
      failed++;
      continue;
    }

    const heuristic = buildHeuristic(
      rule,
      [a.id, b.id],
      [a.confidence, b.confidence],
      a.domain !== b.domain ? `${a.domain}+${b.domain}` : a.domain
    );

    if (heuristic) {
      created.push(heuristic);
    } else {
      failed++;
    }
  }

  // Step 7: Drift check
  let driftChecked = false;
  if (cfg.enableDriftCheck && created.length > 0) {
    for (const h of created) {
      const chain = getLineageChain(h.id);
      if (chain && chain.nodes.length >= 2) {
        const genScores: Array<{ generation: number; avgConfidence: number }> = [];
        const genMap = new Map<number, number[]>();
        for (const n of chain.nodes) {
          if (!genMap.has(n.generation)) genMap.set(n.generation, []);
          genMap.get(n.generation)!.push(n.confidence);
        }
        for (const [gen, confs] of genMap) {
          genScores.push({
            generation: gen,
            avgConfidence: confs.reduce((a, b) => a + b, 0) / confs.length,
          });
        }
        analyzeDrift(chain.rootId, genScores);
        driftChecked = true;
      }
    }
  }

  lastCycleAt = Date.now();

  // Record in journal
  recordInJournal({
    cycleId,
    cycleType: 'consolidation',
    candidatesEvaluated: memories.length,
    heuristicsCreated: created.length,
    heuristicsFailed: failed,
    driftDetected: isDreamPaused(),
    insights: created.map(h => h.rule),
    durationMs: Date.now() - start,
  });

  return {
    cycleId,
    candidatesEvaluated: memories.length,
    candidatesEligible: filterResult.eligible.length,
    pairsFormed: pairs.length,
    heuristicsCreated: created,
    heuristicsFailed: failed,
    driftChecked,
    paused: false,
    durationMs: Date.now() - start,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Default synthesizer: combines content from two candidates
 */
function defaultSynthesizer(a: DreamCandidate, b: DreamCandidate): string | null {
  if (!a.content || !b.content) return null;

  const aWords = a.content.split(/\s+/).slice(0, 20);
  const bWords = b.content.split(/\s+/).slice(0, 20);

  // Find shared concepts (simple word overlap)
  const aSet = new Set(aWords.map(w => w.toLowerCase()));
  const overlap = bWords.filter(w => aSet.has(w.toLowerCase()));

  if (overlap.length > 0) {
    return `When ${a.domain} patterns involving [${overlap.slice(0, 3).join(', ')}] co-occur with ${b.domain} signals, expect correlated behavior`;
  }

  return `Cross-domain synthesis: ${a.domain} ↔ ${b.domain} — potential latent connection detected`;
}

/**
 * Get last cycle timestamp
 */
export function getLastCycleTime(): number {
  return lastCycleAt;
}
