/**
 * IMMUNITY — Closed-Loop Escalation Learning System
 * 
 * Capabilities:
 * - Retroactive learning from DB-resolved escalations
 * - Adaptive frequency thresholds per executor
 * - Cross-executor pattern transfer
 * - Feedback-driven rule confidence scoring
 * - Auto-synthesis from resolution notes
 * - Warm-start from historical data
 * - Multi-strategy resolution cascading
 * 
 * Flow: Capture → Cluster → Frequency Check → Synthesize → Shadow Validate → Promote → Feedback
 */

import { log } from '@/lib/system/log';
import { deterministicRepair } from './deterministic-repair';
import { validateInput, type InputArchetype } from './schema-validator';
import { PILOT_EXECUTORS } from './pilotExecutors';
import { contributeRule, autoPropagateRules } from './shared-rule-registry';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface EscalationSignal {
  executor: string;
  inputShape: string;
  failureReason: string;
  archetype: InputArchetype;
  deterministicApplied: string | null;
  legacyApplied: boolean;
  timestamp: number;
  /** The actual failing input for replay-based learning */
  failingInput?: Record<string, unknown>;
}

export interface PatternCluster {
  signature: string;
  executor: string;
  inputShape: string;
  failureReason: string;
  archetype: InputArchetype;
  count: number;
  firstSeen: number;
  lastSeen: number;
  eligible: boolean;
  candidateGenerated: boolean;
  promoted: boolean;
  /** Cross-executor applicability */
  applicableExecutors: string[];
  /** Confidence score based on feedback (0-1) */
  confidence: number;
  /** Sample failing inputs for replay */
  sampleInputs: Record<string, unknown>[];
  /** How many times a fix for this pattern succeeded */
  fixSuccesses: number;
  /** How many times a fix for this pattern failed */
  fixFailures: number;
  /** Resolution method that worked (if any) */
  effectiveMethod?: string;
}

export interface CandidateRule {
  id: string;
  originSignature: string;
  executor: string;
  description: string;
  targetArchetype: InputArchetype;
  inputShapePattern: string;
  status: 'pending' | 'validated' | 'promoted' | 'rejected' | 'rolled_back';
  createdAt: number;
  validatedAt?: number;
  promotedAt?: number;
  validationMetrics?: {
    repairSuccessDelta: number;
    escalationDelta: number;
    falsePosRate: number;
    samplesRun: number;
  };
  version: number;
  /** Confidence from feedback loops */
  feedbackConfidence: number;
  /** Times this rule resolved an escalation */
  resolutionCount: number;
  /** Times this rule failed to resolve */
  failureCount: number;
  /** Applicable to multiple executors */
  crossExecutorApplicable: boolean;
  /** Specific repair strategy this rule encodes */
  repairStrategy: RepairStrategy;
}

/** Named repair strategies that rules can encode */
export type RepairStrategy =
  | 'input_reconstruction'   // Rebuild input from error context
  | 'shape_normalization'    // Fix input shape to match executor schema
  | 'value_sanitization'     // Clean dangerous/invalid values
  | 'type_coercion'          // Fix type mismatches
  | 'default_injection'      // Inject missing required fields
  | 'cross_executor_port'    // Port a fix from another executor
  | 'pattern_match_resolve'  // Resolve via known error pattern
  | 'composite';             // Multiple strategies combined

// ═══════════════════════════════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════════════════════════════

/** Adaptive threshold — starts low, rises with pattern maturity */
const BASE_FREQUENCY_THRESHOLD = 2;
const MAX_FREQUENCY_THRESHOLD = 8;
const TIME_WINDOW_MS = 60 * 60 * 1000; // 1 hour (was 30 min)
const MAX_SAMPLE_INPUTS = 5;

const patternClusters = new Map<string, PatternCluster>();
const candidateRules = new Map<string, CandidateRule>();
const promotionLog: Array<{ ruleId: string; timestamp: number; metrics: CandidateRule['validationMetrics'] }> = [];

/** Cross-executor knowledge transfer map */
const executorSimilarity = new Map<string, Set<string>>();
initExecutorSimilarity();

/** Resolution feedback buffer — records what actually worked */
const resolutionFeedback: Array<{
  executor: string;
  errorSignature: string;
  method: string;
  success: boolean;
  timestamp: number;
  ruleId?: string;
}> = [];
const MAX_FEEDBACK = 200;

/** Historical warm-start flag */
let warmStartComplete = false;

// ═══════════════════════════════════════════════════════════════════════════
// Cross-Executor Similarity
// ═══════════════════════════════════════════════════════════════════════════

function initExecutorSimilarity() {
  // Group executors by functional similarity for pattern transfer
  const groups: string[][] = [
    // UI adaptation cluster
    ['adaptive-ui', 'personalized-accessibility-engine'],
    // Content analysis/validation cluster
    ['cognitive-load-optimization', 'comprehensive-accessibility-audit', 'inclusive-content', 'audit-compliance-check'],
    // Cognitive processing cluster
    ['reasoning-engine', 'learning-engine', 'imagination-engine'],
    // Governance cluster
    ['economy-cost-tracker', 'seba-proposal-evaluator', 'audit-compliance-check'],
    // Routing/orchestration cluster
    ['relay-event-dispatcher', 'mesh-pipeline-resolver'],
    // Cross-module: content analysis ↔ cognitive
    ['cognitive-load-optimization', 'reasoning-engine'],
    // Cross-module: orchestration ↔ governance
    ['mesh-pipeline-resolver', 'seba-proposal-evaluator'],
  ];
  for (const group of groups) {
    for (const exec of group) {
      const similar = executorSimilarity.get(exec) ?? new Set<string>();
      for (const peer of group) {
        if (peer !== exec) similar.add(peer);
      }
      executorSimilarity.set(exec, similar);
    }
  }
}

/** Get executors similar to a given one */
export function getSimilarExecutors(executor: string): string[] {
  return Array.from(executorSimilarity.get(executor) ?? []);
}

// ═══════════════════════════════════════════════════════════════════════════
// Step 1: Capture Escalation Pattern (v3 — richer signals)
// ═══════════════════════════════════════════════════════════════════════════

function createSignature(signal: EscalationSignal): string {
  // Granular signature — includes archetype + failure category
  const failureCategory = categorizeFailure(signal.failureReason);
  return `${signal.executor}::${signal.archetype}::${failureCategory}::${signal.inputShape}`;
}

/** Categorize failure reasons into buckets for better clustering */
function categorizeFailure(reason: string): string {
  const r = reason.toLowerCase();
  if (r.includes('transient') || r.includes('rare') || r.includes('timeout')) return 'transient';
  if (r.includes('validation') || r.includes('confidence') || r.includes('recoverable')) return 'validation';
  if (r.includes('injection') || r.includes('xss') || r.includes('script') || r.includes('sql')) return 'security';
  if (r.includes('shape') || r.includes('archetype') || r.includes('alien') || r.includes('preflight')) return 'shape';
  if (r.includes('null') || r.includes('undefined') || r.includes('missing')) return 'null_input';
  if (r.includes('type') || r.includes('cast') || r.includes('coerce')) return 'type_mismatch';
  if (r.includes('size') || r.includes('length') || r.includes('overflow')) return 'bounds';
  if (r.includes('postcheck') || r.includes('result')) return 'output_invalid';
  return 'unknown';
}

/** Determine repair strategy from failure category */
function strategyFromCategory(category: string): RepairStrategy {
  switch (category) {
    case 'transient': return 'pattern_match_resolve';
    case 'validation': return 'value_sanitization';
    case 'security': return 'value_sanitization';
    case 'shape': return 'shape_normalization';
    case 'null_input': return 'default_injection';
    case 'type_mismatch': return 'type_coercion';
    case 'bounds': return 'value_sanitization';
    case 'output_invalid': return 'input_reconstruction';
    default: return 'composite';
  }
}

export function captureEscalation(signal: EscalationSignal): PatternCluster {
  const sig = createSignature(signal);
  const now = Date.now();

  const existing = patternClusters.get(sig);
  if (existing) {
    if (now - existing.firstSeen > TIME_WINDOW_MS) {
      // Don't fully reset — carry forward confidence and fix history
      existing.count = 1;
      existing.firstSeen = now;
      existing.lastSeen = now;
      existing.eligible = false;
      // Keep confidence, fixSuccesses, fixFailures, effectiveMethod
    } else {
      existing.count++;
      existing.lastSeen = now;
      // Adaptive threshold based on executor maturity
      const threshold = getAdaptiveThreshold(signal.executor);
      existing.eligible = existing.count >= threshold;
    }

    // Capture sample inputs for replay
    if (signal.failingInput && existing.sampleInputs.length < MAX_SAMPLE_INPUTS) {
      const inputStr = JSON.stringify(signal.failingInput);
      const hasDupe = existing.sampleInputs.some(s => JSON.stringify(s) === inputStr);
      if (!hasDupe) {
        existing.sampleInputs.push(signal.failingInput);
      }
    }

    patternClusters.set(sig, existing);
    return existing;
  }

  // Check cross-executor patterns — if similar executor had this pattern, inherit knowledge
  const similarExecutors = getSimilarExecutors(signal.executor);
  let inheritedConfidence = 0;
  let inheritedMethod: string | undefined;
  for (const peer of similarExecutors) {
    const peerSig = sig.replace(signal.executor, peer);
    const peerCluster = patternClusters.get(peerSig);
    if (peerCluster?.effectiveMethod && peerCluster.fixSuccesses > 0) {
      inheritedConfidence = Math.min(0.6, peerCluster.confidence * 0.7);
      inheritedMethod = peerCluster.effectiveMethod;
      log.info('encode', `Cross-executor transfer: ${peer} → ${signal.executor} for ${categorizeFailure(signal.failureReason)} (confidence: ${(inheritedConfidence * 100).toFixed(0)}%)`);
      break;
    }
  }

  const cluster: PatternCluster = {
    signature: sig,
    executor: signal.executor,
    inputShape: signal.inputShape,
    failureReason: signal.failureReason,
    archetype: signal.archetype,
    count: 1,
    firstSeen: now,
    lastSeen: now,
    eligible: false,
    candidateGenerated: false,
    promoted: false,
    applicableExecutors: [signal.executor, ...similarExecutors],
    confidence: inheritedConfidence,
    sampleInputs: signal.failingInput ? [signal.failingInput] : [],
    fixSuccesses: 0,
    fixFailures: 0,
    effectiveMethod: inheritedMethod,
  };
  patternClusters.set(sig, cluster);
  return cluster;
}

// ═══════════════════════════════════════════════════════════════════════════
// Adaptive Frequency Threshold
// ═══════════════════════════════════════════════════════════════════════════

/** Per-executor maturity tracking */
const executorMaturity = new Map<string, number>();

function getAdaptiveThreshold(executor: string): number {
  const maturity = executorMaturity.get(executor) ?? 0;
  // New executors: lower threshold (learn faster)
  // Mature executors: higher threshold (avoid noise)
  return Math.min(MAX_FREQUENCY_THRESHOLD, BASE_FREQUENCY_THRESHOLD + Math.floor(maturity / 10));
}

/** Called when an executor's pattern is successfully resolved */
function incrementMaturity(executor: string) {
  executorMaturity.set(executor, (executorMaturity.get(executor) ?? 0) + 1);
}

// ═══════════════════════════════════════════════════════════════════════════
// Step 2: Pattern Frequency Threshold Check
// ═══════════════════════════════════════════════════════════════════════════

export function getEligiblePatterns(): PatternCluster[] {
  return Array.from(patternClusters.values())
    .filter(p => p.eligible && !p.candidateGenerated)
    .sort((a, b) => {
      // Sort by confidence (inherited fixes first), then by count
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      return b.count - a.count;
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// Step 3: Synthesize Candidate Rule (v3 — strategy-aware)
// ═══════════════════════════════════════════════════════════════════════════

export function synthesizeCandidateRule(cluster: PatternCluster): CandidateRule | null {
  if (!cluster.eligible || cluster.candidateGenerated) return null;

  const failureCategory = categorizeFailure(cluster.failureReason);
  const strategy = strategyFromCategory(failureCategory);
  const ruleId = `CR_${cluster.archetype}_${strategy}_${Date.now().toString(36)}`;

  const candidate: CandidateRule = {
    id: ruleId,
    originSignature: cluster.signature,
    executor: cluster.executor,
    description: `${strategy} rule for ${cluster.archetype} on ${cluster.executor}: ${failureCategory} errors (${cluster.count}x). ${cluster.effectiveMethod ? `Inherited: ${cluster.effectiveMethod}` : ''}`,
    targetArchetype: cluster.archetype,
    inputShapePattern: cluster.inputShape,
    status: 'pending',
    createdAt: Date.now(),
    version: 1,
    feedbackConfidence: cluster.confidence,
    resolutionCount: 0,
    failureCount: 0,
    crossExecutorApplicable: cluster.applicableExecutors.length > 1,
    repairStrategy: strategy,
  };

  cluster.candidateGenerated = true;
  candidateRules.set(ruleId, candidate);

  log.info('encode', `Candidate rule synthesized: ${ruleId} [${strategy}] for ${cluster.archetype} (${cluster.count}x, confidence: ${(cluster.confidence * 100).toFixed(0)}%)`);
  return candidate;
}

// ═══════════════════════════════════════════════════════════════════════════
// Step 4: Shadow Validation (v3 — uses sample inputs from cluster)
// ═══════════════════════════════════════════════════════════════════════════

export function shadowValidateRule(
  candidateId: string,
  testInputs?: Record<string, unknown>[],
): { passed: boolean; metrics: CandidateRule['validationMetrics'] } {
  const candidate = candidateRules.get(candidateId);
  if (!candidate) return { passed: false, metrics: undefined };

  // Use cluster sample inputs if available, augmented with defaults
  const cluster = patternClusters.get(candidate.originSignature);
  const clusterInputs = cluster?.sampleInputs ?? [];
  const inputs = [
    ...clusterInputs,
    ...(testInputs ?? generateStrategyTestInputs(candidate.repairStrategy)),
  ];

  if (inputs.length === 0) {
    // Can't validate without inputs
    candidate.status = 'pending';
    return { passed: false, metrics: undefined };
  }

  let successBefore = 0;
  let successAfter = 0;
  let escalationsBefore = 0;
  let escalationsAfter = 0;
  let falsePositives = 0;

  for (const input of inputs) {
    const beforeReport = validateInput(candidate.executor, input);
    if (beforeReport.valid) successBefore++;
    else escalationsBefore++;

    const repairResult = deterministicRepair(input);
    const afterReport = validateInput(candidate.executor, repairResult.repaired_input);
    if (afterReport.valid) successAfter++;
    else escalationsAfter++;

    if (beforeReport.valid && !afterReport.valid) falsePositives++;
  }

  const total = inputs.length || 1;
  const metrics: CandidateRule['validationMetrics'] = {
    repairSuccessDelta: (successAfter - successBefore) / total,
    escalationDelta: (escalationsAfter - escalationsBefore) / total,
    falsePosRate: falsePositives / total,
    samplesRun: inputs.length,
  };

  // More lenient validation for high-confidence inherited rules
  const confidenceBonus = candidate.feedbackConfidence > 0.5;
  const passed = metrics.repairSuccessDelta >= (confidenceBonus ? -0.05 : 0)
    && metrics.escalationDelta <= (confidenceBonus ? 0.05 : 0)
    && metrics.falsePosRate <= (confidenceBonus ? 0.02 : 0);

  candidate.status = passed ? 'validated' : 'rejected';
  candidate.validatedAt = Date.now();
  candidate.validationMetrics = metrics;

  log.info('encode', `Shadow validation ${passed ? 'PASSED' : 'FAILED'} for ${candidateId} [${candidate.repairStrategy}]: delta=${(metrics.repairSuccessDelta * 100).toFixed(1)}%, falsePos=${(metrics.falsePosRate * 100).toFixed(1)}%`);

  return { passed, metrics };
}

/** v3: Generate test inputs specific to the repair strategy */
function generateStrategyTestInputs(strategy: RepairStrategy): Record<string, unknown>[] {
  const base: Record<string, unknown>[] = [
    { content: 'Hello world', target: 'self' },
    { url: 'https://example.com', wcagLevel: 'AA' },
  ];

  switch (strategy) {
    case 'input_reconstruction':
      return [...base, {}, { content: null }, { unrecognized: true }];
    case 'shape_normalization':
      return [...base, { foo: 'bar' }, { irrelevant_key: 'value' }, { content: 12345 }];
    case 'value_sanitization':
      return [...base, { content: '<script>alert(1)</script>' }, { content: '"; DROP TABLE users; --' }, { url: 'javascript:alert(1)' }];
    case 'type_coercion':
      return [...base, { content: 12345 }, { content: true }, { wcagLevel: 999 }];
    case 'default_injection':
      return [...base, {}, { content: '' }, { content: null, target: null }];
    case 'cross_executor_port':
      return [...base, { content: 'test', target: 'self', userId: 'user-123' }];
    default:
      return [...base, {}, { content: '<script>xss</script>' }, { content: 'x'.repeat(10000) }];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Step 5: Controlled Promotion (v3 — with feedback confidence)
// ═══════════════════════════════════════════════════════════════════════════

export function promoteRule(candidateId: string): boolean {
  const candidate = candidateRules.get(candidateId);
  if (!candidate || candidate.status !== 'validated') {
    log.warn('encode', `Cannot promote ${candidateId}: status is ${candidate?.status ?? 'not found'}`);
    return false;
  }

  candidate.status = 'promoted';
  candidate.promotedAt = Date.now();
  candidate.feedbackConfidence = Math.max(candidate.feedbackConfidence, 0.5);

  const cluster = patternClusters.get(candidate.originSignature);
  if (cluster) {
    cluster.promoted = true;
    incrementMaturity(cluster.executor);
  }

  promotionLog.push({
    ruleId: candidateId,
    timestamp: Date.now(),
    metrics: candidate.validationMetrics,
  });

  log.info('encode', `Rule promoted: ${candidateId} [${candidate.repairStrategy}] (confidence: ${(candidate.feedbackConfidence * 100).toFixed(0)}%)`);
  return true;
}

export function rollbackRule(candidateId: string): boolean {
  const candidate = candidateRules.get(candidateId);
  if (!candidate || candidate.status !== 'promoted') return false;

  candidate.status = 'rolled_back';
  candidate.feedbackConfidence *= 0.3; // Heavily penalize
  log.warn('encode', `Rule rolled back: ${candidateId}`);
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// Feedback Loop — Record what actually worked
// ═══════════════════════════════════════════════════════════════════════════

export function recordResolutionFeedback(
  executor: string,
  errorSignature: string,
  method: string,
  success: boolean,
  ruleId?: string,
): void {
  if (resolutionFeedback.length >= MAX_FEEDBACK) resolutionFeedback.shift();
  resolutionFeedback.push({ executor, errorSignature, method, success, timestamp: Date.now(), ruleId });

  // Update pattern cluster confidence
  for (const [, cluster] of patternClusters) {
    if (cluster.executor === executor && cluster.signature.includes(categorizeFailure(errorSignature))) {
      if (success) {
        cluster.fixSuccesses++;
        cluster.effectiveMethod = method;
        cluster.confidence = Math.min(1, cluster.confidence + 0.1);
      } else {
        cluster.fixFailures++;
        cluster.confidence = Math.max(0, cluster.confidence - 0.05);
      }
    }
  }

  // Update candidate rule feedback
  if (ruleId) {
    const rule = candidateRules.get(ruleId);
    if (rule) {
      if (success) {
        rule.resolutionCount++;
        rule.feedbackConfidence = Math.min(1, rule.feedbackConfidence + 0.05);
      } else {
        rule.failureCount++;
        rule.feedbackConfidence = Math.max(0, rule.feedbackConfidence - 0.1);
        // Auto-rollback if effectiveness drops below 30%
        if (rule.resolutionCount + rule.failureCount >= 5) {
          const effectiveness = rule.resolutionCount / (rule.resolutionCount + rule.failureCount);
          if (effectiveness < 0.3 && rule.status === 'promoted') {
            rollbackRule(ruleId);
            log.warn('encode', `Auto-rollback: ${ruleId} effectiveness ${(effectiveness * 100).toFixed(0)}% < 30%`);
          }
        }
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Retroactive Learning — Learn from already-resolved escalations
// ═══════════════════════════════════════════════════════════════════════════

export function learnFromResolution(
  executor: string,
  errorSummary: string,
  resolutionMethod: string,
  resolutionNote: string,
): void {
  const failureCategory = categorizeFailure(errorSummary);
  const strategy = strategyFromCategory(failureCategory);

  // Find or create a cluster for this pattern
  const sig = `${executor}::unknown::${failureCategory}::resolved`;
  const existing = patternClusters.get(sig);

  if (existing) {
    existing.fixSuccesses++;
    existing.effectiveMethod = resolutionMethod;
    existing.confidence = Math.min(1, existing.confidence + 0.15);
  } else {
    patternClusters.set(sig, {
      signature: sig,
      executor,
      inputShape: 'resolved',
      failureReason: errorSummary.slice(0, 100),
      archetype: 'well_formed' as InputArchetype,
      count: 1,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      eligible: false,
      candidateGenerated: false,
      promoted: false,
      applicableExecutors: [executor, ...getSimilarExecutors(executor)],
      confidence: 0.6,
      sampleInputs: [],
      fixSuccesses: 1,
      fixFailures: 0,
      effectiveMethod: resolutionMethod,
    });
  }

  // Transfer knowledge to similar executors
  for (const peer of getSimilarExecutors(executor)) {
    const peerSig = sig.replace(executor, peer);
    if (!patternClusters.has(peerSig)) {
      patternClusters.set(peerSig, {
        signature: peerSig,
        executor: peer,
        inputShape: 'transferred',
        failureReason: errorSummary.slice(0, 100),
        archetype: 'well_formed' as InputArchetype,
        count: 0,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        eligible: false,
        candidateGenerated: false,
        promoted: false,
        applicableExecutors: [peer],
        confidence: 0.3,
        sampleInputs: [],
        fixSuccesses: 0,
        fixFailures: 0,
        effectiveMethod: resolutionMethod,
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// v3: Warm Start — Initialize from historical data
// ═══════════════════════════════════════════════════════════════════════════

export async function warmStartFromDB(): Promise<{ patternsLoaded: number; rulesSeeded: number }> {
  if (warmStartComplete) return { patternsLoaded: 0, rulesSeeded: 0 };

  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Load resolved escalations from last 24h
    const { data: resolved } = await supabase
      .from('immune_escalations')
      .select('executor, payload, resolution_note, severity, created_at')
      .eq('status', 'resolved')
      .order('created_at', { ascending: false })
      .limit(100);

    let patternsLoaded = 0;
    if (resolved) {
      for (const row of resolved) {
        const payload = row.payload as any;
        const errorSummary = payload?.errorSummary ?? 'unknown';
        const method = (row.resolution_note ?? '').includes('deterministic') ? 'deterministic'
          : (row.resolution_note ?? '').includes('learning_rule') ? 'learning_rule'
          : (row.resolution_note ?? '').includes('pattern_match') ? 'pattern_match'
          : 'auto_expire';

        learnFromResolution(row.executor, errorSummary, method, row.resolution_note ?? '');
        patternsLoaded++;
      }
    }

    // Also load open/claimed to understand current backlog
    const { data: open } = await supabase
      .from('immune_escalations')
      .select('executor, payload, severity')
      .in('status', ['open', 'claimed'])
      .limit(50);

    if (open) {
      for (const row of open) {
        const payload = row.payload as any;
        captureEscalation({
          executor: row.executor,
          inputShape: 'db-load',
          failureReason: payload?.errorSummary ?? 'unknown',
          archetype: 'well_formed' as InputArchetype,
          deterministicApplied: null,
          legacyApplied: false,
          timestamp: Date.now(),
          failingInput: payload?.failingInput,
        });
      }
    }

    warmStartComplete = true;
    log.info('encode', `Warm start complete: ${patternsLoaded} historical patterns loaded`);
    return { patternsLoaded, rulesSeeded: 0 };
  } catch (err) {
    log.warn('encode', `Warm start failed: ${(err as Error).message}`);
    warmStartComplete = true;
    return { patternsLoaded: 0, rulesSeeded: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Full Learning Cycle (v3 — with warm start + feedback + cross-executor)
// ═══════════════════════════════════════════════════════════════════════════

export function runLearningCycle(testInputs?: Record<string, unknown>[]): {
  patternsChecked: number;
  candidatesSynthesized: number;
  validated: number;
  promoted: number;
  rejected: number;
  crossExecutorTransfers: number;
  sharedRulesPropagated: number;
} {
  const eligible = getEligiblePatterns();
  let candidatesSynthesized = 0;
  let validated = 0;
  let promoted = 0;
  let rejected = 0;
  let crossExecutorTransfers = 0;
  let sharedRulesPropagated = 0;

  for (const cluster of eligible) {
    const candidate = synthesizeCandidateRule(cluster);
    if (!candidate) continue;
    candidatesSynthesized++;

    // v3: Use cluster's sample inputs + strategy-specific inputs
    const inputs = [
      ...cluster.sampleInputs,
      ...(testInputs ?? generateStrategyTestInputs(candidate.repairStrategy)),
    ];

    const { passed } = shadowValidateRule(candidate.id, inputs);
    if (passed) {
      validated++;
      if (promoteRule(candidate.id)) {
        promoted++;
        // v3: Auto-transfer to similar executors
        if (candidate.crossExecutorApplicable) {
          for (const peer of cluster.applicableExecutors) {
            if (peer !== cluster.executor) {
              crossExecutorTransfers++;
              learnFromResolution(peer, cluster.failureReason, candidate.repairStrategy, `Cross-executor from ${cluster.executor}`);
            }
          }
        }

        // Contribute to shared rule registry for central cross-executor learning
        try {
          contributeRule(
            candidate.executor,
            candidate.repairStrategy,
            candidate.targetArchetype,
            candidate.feedbackConfidence,
            candidate.description,
          );
        } catch { /* non-critical */ }
      }
    } else {
      rejected++;
    }
  }

  // v3: Also process high-confidence patterns that aren't yet eligible
  const highConfidence = Array.from(patternClusters.values())
    .filter(p => !p.candidateGenerated && p.confidence >= 0.7 && !p.promoted);
  
  for (const cluster of highConfidence.slice(0, 3)) {
    cluster.eligible = true; // Force eligibility for high-confidence patterns
    const candidate = synthesizeCandidateRule(cluster);
    if (!candidate) continue;
    candidatesSynthesized++;

    const { passed } = shadowValidateRule(candidate.id);
    if (passed) {
      validated++;
      if (promoteRule(candidate.id)) promoted++;
    } else {
      rejected++;
    }
  }

  // Auto-propagate shared rules to compatible executors
  try {
    const propagation = autoPropagateRules();
    sharedRulesPropagated = propagation.adopted;
  } catch { /* non-critical */ }

  if (candidatesSynthesized > 0 || sharedRulesPropagated > 0) {
    log.info('encode', `Learning cycle: ${eligible.length}+${highConfidence.length} patterns → ${candidatesSynthesized} candidates → ${validated} validated → ${promoted} promoted, ${rejected} rejected, ${crossExecutorTransfers} transfers, ${sharedRulesPropagated} shared rules propagated`);
  }

  return {
    patternsChecked: eligible.length + highConfidence.length,
    candidatesSynthesized,
    validated,
    promoted,
    rejected,
    crossExecutorTransfers,
    sharedRulesPropagated,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// v3: Find Best Rule for Escalation (used by processor)
// ═══════════════════════════════════════════════════════════════════════════

export function findBestRuleForEscalation(executor: string, errorSummary: string): CandidateRule | null {
  const failureCategory = categorizeFailure(errorSummary);
  const promoted = Array.from(candidateRules.values())
    .filter(r => r.status === 'promoted');

  // Direct executor match
  const direct = promoted
    .filter(r => r.executor === executor)
    .sort((a, b) => b.feedbackConfidence - a.feedbackConfidence);
  if (direct.length > 0) return direct[0];

  // Cross-executor match
  const similarExecs = getSimilarExecutors(executor);
  const cross = promoted
    .filter(r => similarExecs.includes(r.executor) && r.crossExecutorApplicable)
    .sort((a, b) => b.feedbackConfidence - a.feedbackConfidence);
  if (cross.length > 0) return cross[0];

  // Strategy match (any executor with same repair strategy)
  const strategy = strategyFromCategory(failureCategory);
  const strategyMatch = promoted
    .filter(r => r.repairStrategy === strategy && r.feedbackConfidence >= 0.5)
    .sort((a, b) => b.feedbackConfidence - a.feedbackConfidence);
  if (strategyMatch.length > 0) return strategyMatch[0];

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// Dashboard / Telemetry API (v3 — richer stats)
// ═══════════════════════════════════════════════════════════════════════════

export function getLearningStats(): {
  totalPatterns: number;
  eligiblePatterns: number;
  totalCandidates: number;
  promotedRules: number;
  rejectedRules: number;
  rolledBackRules: number;
  promotionHistory: typeof promotionLog;
  crossExecutorTransfers: number;
  avgRuleConfidence: number;
  warmStarted: boolean;
  feedbackCount: number;
  highConfidencePatterns: number;
} {
  const candidates = Array.from(candidateRules.values());
  const promoted = candidates.filter(c => c.status === 'promoted');
  const avgConf = promoted.length > 0
    ? promoted.reduce((s, c) => s + c.feedbackConfidence, 0) / promoted.length
    : 0;

  return {
    totalPatterns: patternClusters.size,
    eligiblePatterns: Array.from(patternClusters.values()).filter(p => p.eligible).length,
    totalCandidates: candidates.length,
    promotedRules: promoted.length,
    rejectedRules: candidates.filter(c => c.status === 'rejected').length,
    rolledBackRules: candidates.filter(c => c.status === 'rolled_back').length,
    promotionHistory: [...promotionLog],
    crossExecutorTransfers: resolutionFeedback.filter(f => f.method === 'cross_executor_port').length,
    avgRuleConfidence: avgConf,
    warmStarted: warmStartComplete,
    feedbackCount: resolutionFeedback.length,
    highConfidencePatterns: Array.from(patternClusters.values()).filter(p => p.confidence >= 0.7).length,
  };
}

export function getPatternClusters(): PatternCluster[] {
  return Array.from(patternClusters.values()).sort((a, b) => {
    // Sort by confidence first, then count
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    return b.count - a.count;
  });
}

export function getCandidateRules(): CandidateRule[] {
  return Array.from(candidateRules.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function resetLearningState(): void {
  patternClusters.clear();
  candidateRules.clear();
  promotionLog.length = 0;
  resolutionFeedback.length = 0;
  executorMaturity.clear();
  warmStartComplete = false;
  log.info('encode', 'Escalation learning state reset');
}
