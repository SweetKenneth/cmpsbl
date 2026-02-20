/**
 * Phase 3 — ENCODE Closed-Loop Escalation Learning System
 * 
 * Converts escalation patterns into structured learning signals,
 * synthesizes candidate deterministic rules, validates in shadow mode,
 * and promotes validated rules with full audit trail.
 * 
 * Flow: Capture → Frequency Check → Synthesize → Shadow Validate → Promote
 */

import { log } from '@/lib/system/log';
import { deterministicRepair } from './deterministic-repair';
import { validateInput, type InputArchetype } from './schema-validator';
import { PILOT_EXECUTORS } from './pilotExecutors';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface EscalationSignal {
  executor: string;
  inputShape: string;          // sorted keys signature
  failureReason: string;
  archetype: InputArchetype;
  deterministicApplied: string | null;
  legacyApplied: boolean;
  timestamp: number;
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
  eligible: boolean;           // meets frequency threshold
  candidateGenerated: boolean;
  promoted: boolean;
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
}

// ═══════════════════════════════════════════════════════════════════════════
// State — in-memory (persisted via immune_metrics cycle)
// ═══════════════════════════════════════════════════════════════════════════

const FREQUENCY_THRESHOLD = 3;
const TIME_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

const patternClusters = new Map<string, PatternCluster>();
const candidateRules = new Map<string, CandidateRule>();
const promotionLog: Array<{ ruleId: string; timestamp: number; metrics: CandidateRule['validationMetrics'] }> = [];

// ═══════════════════════════════════════════════════════════════════════════
// Step 1: Capture Escalation Pattern
// ═══════════════════════════════════════════════════════════════════════════

function createSignature(signal: EscalationSignal): string {
  // Structural signature — deduplicates by shape, not raw payload
  return `${signal.executor}::${signal.archetype}::${signal.inputShape}::${signal.failureReason.slice(0, 60)}`;
}

export function captureEscalation(signal: EscalationSignal): PatternCluster {
  const sig = createSignature(signal);
  const now = Date.now();

  const existing = patternClusters.get(sig);
  if (existing) {
    // Prune old entries outside time window
    if (now - existing.firstSeen > TIME_WINDOW_MS) {
      // Reset window
      existing.count = 1;
      existing.firstSeen = now;
      existing.lastSeen = now;
      existing.eligible = false;
    } else {
      existing.count++;
      existing.lastSeen = now;
      existing.eligible = existing.count >= FREQUENCY_THRESHOLD;
    }
    patternClusters.set(sig, existing);
    return existing;
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
  };
  patternClusters.set(sig, cluster);
  return cluster;
}

// ═══════════════════════════════════════════════════════════════════════════
// Step 2: Pattern Frequency Threshold Check
// ═══════════════════════════════════════════════════════════════════════════

export function getEligiblePatterns(): PatternCluster[] {
  return Array.from(patternClusters.values())
    .filter(p => p.eligible && !p.candidateGenerated)
    .sort((a, b) => b.count - a.count);
}

// ═══════════════════════════════════════════════════════════════════════════
// Step 3: Synthesize Candidate Rule
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generates a candidate rule spec from an eligible pattern.
 * Rules operate at input normalization level and are generic.
 */
export function synthesizeCandidateRule(cluster: PatternCluster): CandidateRule | null {
  if (!cluster.eligible || cluster.candidateGenerated) return null;

  const ruleId = `CR_${cluster.archetype}_${Date.now().toString(36)}`;

  const candidate: CandidateRule = {
    id: ruleId,
    originSignature: cluster.signature,
    executor: cluster.executor,
    description: `Auto-synthesized rule for ${cluster.archetype} pattern on ${cluster.executor}: ${cluster.failureReason.slice(0, 80)}`,
    targetArchetype: cluster.archetype,
    inputShapePattern: cluster.inputShape,
    status: 'pending',
    createdAt: Date.now(),
    version: 1,
  };

  cluster.candidateGenerated = true;
  candidateRules.set(ruleId, candidate);

  log.info('encode', `Candidate rule synthesized: ${ruleId} for ${cluster.archetype} (${cluster.count}x escalations)`);
  return candidate;
}

// ═══════════════════════════════════════════════════════════════════════════
// Step 4: Shadow Validation
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validate a candidate rule by running it through shadow probes.
 * Measures repair success delta and ensures no regression.
 */
export function shadowValidateRule(
  candidateId: string,
  testInputs: Record<string, unknown>[],
): { passed: boolean; metrics: CandidateRule['validationMetrics'] } {
  const candidate = candidateRules.get(candidateId);
  if (!candidate) return { passed: false, metrics: undefined };

  let successBefore = 0;
  let successAfter = 0;
  let escalationsBefore = 0;
  let escalationsAfter = 0;
  let falsePositives = 0;

  for (const input of testInputs) {
    // Before: validate raw input
    const beforeReport = validateInput(candidate.executor, input);
    if (beforeReport.valid) successBefore++;
    else escalationsBefore++;

    // After: repair then validate
    const repairResult = deterministicRepair(input);
    const afterReport = validateInput(candidate.executor, repairResult.repaired_input);
    if (afterReport.valid) successAfter++;
    else escalationsAfter++;

    // False positive: repair changed a valid input to invalid
    if (beforeReport.valid && !afterReport.valid) falsePositives++;
  }

  const total = testInputs.length || 1;
  const metrics: CandidateRule['validationMetrics'] = {
    repairSuccessDelta: (successAfter - successBefore) / total,
    escalationDelta: (escalationsAfter - escalationsBefore) / total,
    falsePosRate: falsePositives / total,
    samplesRun: testInputs.length,
  };

  // Validation criteria: improvement or stable, no false positives
  const passed = metrics.repairSuccessDelta >= 0
    && metrics.escalationDelta <= 0
    && metrics.falsePosRate === 0;

  candidate.status = passed ? 'validated' : 'rejected';
  candidate.validatedAt = Date.now();
  candidate.validationMetrics = metrics;

  log.info('encode', `Shadow validation ${passed ? 'PASSED' : 'FAILED'} for ${candidateId}: delta=${(metrics.repairSuccessDelta * 100).toFixed(1)}%, falsePos=${(metrics.falsePosRate * 100).toFixed(1)}%`);

  return { passed, metrics };
}

// ═══════════════════════════════════════════════════════════════════════════
// Step 5: Controlled Promotion
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Promote a validated candidate rule. Records audit trail.
 */
export function promoteRule(candidateId: string): boolean {
  const candidate = candidateRules.get(candidateId);
  if (!candidate || candidate.status !== 'validated') {
    log.warn('encode', `Cannot promote ${candidateId}: status is ${candidate?.status ?? 'not found'}`);
    return false;
  }

  candidate.status = 'promoted';
  candidate.promotedAt = Date.now();

  // Mark the originating cluster as promoted
  const cluster = patternClusters.get(candidate.originSignature);
  if (cluster) cluster.promoted = true;

  // Record in promotion log
  promotionLog.push({
    ruleId: candidateId,
    timestamp: Date.now(),
    metrics: candidate.validationMetrics,
  });

  log.info('encode', `Rule promoted: ${candidateId} (origin: ${candidate.targetArchetype}, delta: ${candidate.validationMetrics?.repairSuccessDelta})`);
  return true;
}

/**
 * Rollback a promoted rule by ID.
 */
export function rollbackRule(candidateId: string): boolean {
  const candidate = candidateRules.get(candidateId);
  if (!candidate || candidate.status !== 'promoted') return false;

  candidate.status = 'rolled_back';
  log.warn('encode', `Rule rolled back: ${candidateId}`);
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// Full Learning Cycle
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Run a full learning cycle: check eligible patterns, synthesize, validate, promote.
 * Called periodically or after a batch of shadow probes.
 */
export function runLearningCycle(testInputs?: Record<string, unknown>[]): {
  patternsChecked: number;
  candidatesSynthesized: number;
  validated: number;
  promoted: number;
  rejected: number;
} {
  const eligible = getEligiblePatterns();
  let candidatesSynthesized = 0;
  let validated = 0;
  let promoted = 0;
  let rejected = 0;

  // Default test inputs if none provided
  const inputs = testInputs ?? generateDefaultTestInputs();

  for (const cluster of eligible) {
    const candidate = synthesizeCandidateRule(cluster);
    if (!candidate) continue;
    candidatesSynthesized++;

    const { passed } = shadowValidateRule(candidate.id, inputs);
    if (passed) {
      validated++;
      if (promoteRule(candidate.id)) promoted++;
    } else {
      rejected++;
    }
  }

  if (candidatesSynthesized > 0) {
    log.info('encode', `Learning cycle: ${eligible.length} patterns → ${candidatesSynthesized} candidates → ${validated} validated → ${promoted} promoted, ${rejected} rejected`);
  }

  return {
    patternsChecked: eligible.length,
    candidatesSynthesized,
    validated,
    promoted,
    rejected,
  };
}

/**
 * Generate default test inputs covering all archetypes
 */
function generateDefaultTestInputs(): Record<string, unknown>[] {
  return [
    {},
    { content: null },
    { content: '', target: '' },
    { content: 12345 },
    { content: true },
    { irrelevant_key: 'value' },
    { content: 'x'.repeat(10000) },
    { content: '<script>alert(1)</script>' },
    { foo: 'bar', baz: 42 },
    { content: 'Hello world', target: 'self' },
    { url: 'https://example.com', wcagLevel: 'AA' },
    { userId: 'user-123', preferences: { theme: 'dark' } },
    { content: 'valid', wcagLevel: 'INVALID' },
    { content: '"; DROP TABLE users; --' },
    { url: 'javascript:alert(1)' },
    { content: '() => alert(1)' },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// Dashboard / Telemetry API
// ═══════════════════════════════════════════════════════════════════════════

export function getLearningStats(): {
  totalPatterns: number;
  eligiblePatterns: number;
  totalCandidates: number;
  promotedRules: number;
  rejectedRules: number;
  rolledBackRules: number;
  promotionHistory: typeof promotionLog;
} {
  const candidates = Array.from(candidateRules.values());
  return {
    totalPatterns: patternClusters.size,
    eligiblePatterns: Array.from(patternClusters.values()).filter(p => p.eligible).length,
    totalCandidates: candidates.length,
    promotedRules: candidates.filter(c => c.status === 'promoted').length,
    rejectedRules: candidates.filter(c => c.status === 'rejected').length,
    rolledBackRules: candidates.filter(c => c.status === 'rolled_back').length,
    promotionHistory: [...promotionLog],
  };
}

export function getPatternClusters(): PatternCluster[] {
  return Array.from(patternClusters.values()).sort((a, b) => b.count - a.count);
}

export function getCandidateRules(): CandidateRule[] {
  return Array.from(candidateRules.values()).sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Reset all learning state (for telemetry reset)
 */
export function resetLearningState(): void {
  patternClusters.clear();
  candidateRules.clear();
  promotionLog.length = 0;
  log.info('encode', 'Escalation learning state reset');
}
