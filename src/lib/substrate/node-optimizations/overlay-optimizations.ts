/**
 * Matrix Node Optimizations — Overlay Sector
 * Nodes: DEFENSE, IMMUNITY, EVOLUTION, INTENT, GOVERNANCE
 * Boot order: DEFENSE → IMMUNITY → EVOLUTION → INTENT → GOVERNANCE
 *
 * DEFENSE:    #39 Threat Pattern Fingerprinting, #40 Rule Impact Scoring
 * IMMUNITY:   #41 Shadow Run Resource Budgets, #42 Shadow-to-Production Drift Detection
 * EVOLUTION:  #43 Mutation Batch Coalescing, #44 Evolution Cooldown Scaling
 * INTENT:     #45 Intent Caching with TTL, #46 Capability Gap Surfacing
 * GOVERNANCE: #47 Policy Hot-Reload, #48 Policy Conflict Detection
 */

// ═══════════════════════════════════════
// DEFENSE — Threat Pattern Fingerprinting (#39)
// ═══════════════════════════════════════

export interface ThreatFingerprint {
  id: string;
  pattern: string;
  category: string;
  firstSeen: number;
  lastSeen: number;
  hitCount: number;
  autoBlocked: boolean;
}

const threatFingerprints = new Map<string, ThreatFingerprint>();
let threatCounter = 0;

function computeThreatHash(pattern: string): string {
  let h = 0;
  for (let i = 0; i < pattern.length; i++) { h = ((h << 5) - h + pattern.charCodeAt(i)) | 0; }
  return `tf_${(h >>> 0).toString(36)}`;
}

export function registerThreatPattern(pattern: string, category: string): ThreatFingerprint {
  const hash = computeThreatHash(pattern);
  const existing = threatFingerprints.get(hash);
  if (existing) {
    existing.hitCount++;
    existing.lastSeen = Date.now();
    if (existing.hitCount >= 5) existing.autoBlocked = true;
    return existing;
  }
  const fp: ThreatFingerprint = {
    id: `threat_${++threatCounter}`,
    pattern: pattern.slice(0, 200),
    category,
    firstSeen: Date.now(),
    lastSeen: Date.now(),
    hitCount: 1,
    autoBlocked: false,
  };
  threatFingerprints.set(hash, fp);
  return fp;
}

export function isThreatKnown(pattern: string): { known: boolean; blocked: boolean; fingerprint?: ThreatFingerprint } {
  const hash = computeThreatHash(pattern);
  const fp = threatFingerprints.get(hash);
  if (!fp) return { known: false, blocked: false };
  return { known: true, blocked: fp.autoBlocked, fingerprint: fp };
}

export function getThreatFingerprints(limit: number = 50): ThreatFingerprint[] {
  return Array.from(threatFingerprints.values())
    .sort((a, b) => b.hitCount - a.hitCount)
    .slice(0, limit);
}

// ═══════════════════════════════════════
// DEFENSE — Rule Impact Scoring (#40)
// ═══════════════════════════════════════

export interface RuleImpact {
  ruleId: string;
  triggerCount: number;
  truePositives: number;
  falsePositives: number;
  falsePositiveRate: number;
  effectivenessScore: number; // 0.0–1.0
  recommendation: 'keep' | 'tune' | 'deprioritize' | 'remove';
}

const ruleStats = new Map<string, { triggers: number; tp: number; fp: number }>();

export function recordRuleTrigger(ruleId: string, truePositive: boolean): void {
  const entry = ruleStats.get(ruleId) ?? { triggers: 0, tp: 0, fp: 0 };
  entry.triggers++;
  if (truePositive) entry.tp++;
  else entry.fp++;
  ruleStats.set(ruleId, entry);
}

export function getRuleImpactScores(): RuleImpact[] {
  return Array.from(ruleStats.entries()).map(([ruleId, data]) => {
    const fpRate = data.triggers > 0 ? data.fp / data.triggers : 0;
    const effectiveness = data.triggers > 0 ? data.tp / data.triggers : 0;

    let recommendation: RuleImpact['recommendation'] = 'keep';
    if (fpRate > 0.5) recommendation = 'remove';
    else if (fpRate > 0.3) recommendation = 'deprioritize';
    else if (fpRate > 0.15) recommendation = 'tune';

    return {
      ruleId,
      triggerCount: data.triggers,
      truePositives: data.tp,
      falsePositives: data.fp,
      falsePositiveRate: Math.round(fpRate * 1000) / 1000,
      effectivenessScore: Math.round(effectiveness * 1000) / 1000,
      recommendation,
    };
  }).sort((a, b) => a.effectivenessScore - b.effectivenessScore);
}

// ═══════════════════════════════════════
// IMMUNITY — Shadow Run Resource Budgets (#41)
// ═══════════════════════════════════════

export interface ShadowBudget {
  maxDurationMs: number;
  maxMemoryBytes: number;
  maxCpuPercent: number;
  enforced: boolean;
}

export interface ShadowRunUsage {
  runId: string;
  durationMs: number;
  peakMemoryBytes: number;
  cpuPercent: number;
  withinBudget: boolean;
  terminatedEarly: boolean;
}

const defaultShadowBudget: ShadowBudget = {
  maxDurationMs: 30_000,
  maxMemoryBytes: 256 * 1024 * 1024, // 256MB
  maxCpuPercent: 25,
  enforced: true,
};

let shadowBudget = { ...defaultShadowBudget };
const shadowUsageLog: ShadowRunUsage[] = [];

export function setShadowBudget(budget: Partial<ShadowBudget>): void {
  shadowBudget = { ...shadowBudget, ...budget };
}

export function checkShadowBudget(runId: string, durationMs: number, memoryBytes: number, cpuPercent: number): ShadowRunUsage {
  const withinBudget = durationMs <= shadowBudget.maxDurationMs &&
    memoryBytes <= shadowBudget.maxMemoryBytes &&
    cpuPercent <= shadowBudget.maxCpuPercent;

  const usage: ShadowRunUsage = {
    runId,
    durationMs,
    peakMemoryBytes: memoryBytes,
    cpuPercent,
    withinBudget,
    terminatedEarly: !withinBudget && shadowBudget.enforced,
  };
  shadowUsageLog.push(usage);
  if (shadowUsageLog.length > 1000) shadowUsageLog.splice(0, shadowUsageLog.length - 1000);
  return usage;
}

export function getShadowBudgetStats(): { totalRuns: number; budgetExceeded: number; exceedRate: number } {
  const exceeded = shadowUsageLog.filter(u => !u.withinBudget).length;
  return { totalRuns: shadowUsageLog.length, budgetExceeded: exceeded, exceedRate: shadowUsageLog.length > 0 ? exceeded / shadowUsageLog.length : 0 };
}

// ═══════════════════════════════════════
// IMMUNITY — Shadow-to-Production Drift (#42)
// ═══════════════════════════════════════

export interface DriftReport {
  metricName: string;
  shadowValue: number;
  productionValue: number;
  driftPercent: number;
  significant: boolean;
  measuredAt: number;
}

export function measureDrift(metricName: string, shadowValue: number, productionValue: number, threshold: number = 10): DriftReport {
  const drift = productionValue !== 0 ? Math.abs(shadowValue - productionValue) / Math.abs(productionValue) * 100 : 0;
  return {
    metricName,
    shadowValue,
    productionValue,
    driftPercent: Math.round(drift * 100) / 100,
    significant: drift >= threshold,
    measuredAt: Date.now(),
  };
}

// ═══════════════════════════════════════
// EVOLUTION — Mutation Batch Coalescing (#43)
// ═══════════════════════════════════════

export interface MutationBatch {
  batchId: string;
  mutations: Array<{ id: string; type: string; scope: string }>;
  coalesced: boolean;
  originalCount: number;
  coalescedCount: number;
  createdAt: number;
}

let mutBatchCounter = 0;

export function coalesceMutations(
  mutations: Array<{ id: string; type: string; scope: string }>,
): MutationBatch {
  // Group by type+scope, merge compatible ones
  const groups = new Map<string, typeof mutations>();
  for (const m of mutations) {
    const key = `${m.type}:${m.scope}`;
    const arr = groups.get(key) ?? [];
    arr.push(m);
    groups.set(key, arr);
  }

  const coalesced: typeof mutations = [];
  for (const [, group] of groups) {
    coalesced.push(group[0]); // representative mutation per group
  }

  return {
    batchId: `mbatch_${++mutBatchCounter}`,
    mutations: coalesced,
    coalesced: coalesced.length < mutations.length,
    originalCount: mutations.length,
    coalescedCount: coalesced.length,
    createdAt: Date.now(),
  };
}

// ═══════════════════════════════════════
// EVOLUTION — Cooldown Scaling (#44)
// ═══════════════════════════════════════

const recentOutcomes: Array<{ success: boolean; timestamp: number }> = [];

export function recordMutationOutcome(success: boolean): void {
  recentOutcomes.push({ success, timestamp: Date.now() });
  if (recentOutcomes.length > 100) recentOutcomes.splice(0, recentOutcomes.length - 100);
}

export function getAdaptiveCooldownMs(baseCooldownMs: number = 60_000): number {
  if (recentOutcomes.length < 5) return baseCooldownMs;

  const recent = recentOutcomes.slice(-10);
  const successRate = recent.filter(o => o.success).length / recent.length;

  // Success streak → shorter cooldown (min 25% of base)
  // Failure streak → longer cooldown (max 400% of base)
  if (successRate >= 0.8) return Math.round(baseCooldownMs * 0.25);
  if (successRate >= 0.6) return Math.round(baseCooldownMs * 0.5);
  if (successRate >= 0.4) return baseCooldownMs;
  if (successRate >= 0.2) return Math.round(baseCooldownMs * 2);
  return Math.round(baseCooldownMs * 4);
}

// ═══════════════════════════════════════
// INTENT — Caching with TTL (#45)
// ═══════════════════════════════════════

const intentCache = new Map<string, { result: unknown; resolvedAt: number; ttlMs: number; hits: number }>();
const DEFAULT_INTENT_TTL = 3 * 60 * 1000; // 3 min

export function getCachedIntent(intentKey: string): unknown | null {
  const entry = intentCache.get(intentKey);
  if (!entry) return null;
  if (Date.now() - entry.resolvedAt > entry.ttlMs) { intentCache.delete(intentKey); return null; }
  entry.hits++;
  return entry.result;
}

export function cacheIntent(intentKey: string, result: unknown, ttlMs: number = DEFAULT_INTENT_TTL): void {
  intentCache.set(intentKey, { result, resolvedAt: Date.now(), ttlMs, hits: 0 });
  if (intentCache.size > 500) {
    // Evict oldest
    let oldest: string | null = null; let oldestTime = Infinity;
    for (const [k, v] of intentCache) { if (v.resolvedAt < oldestTime) { oldest = k; oldestTime = v.resolvedAt; } }
    if (oldest) intentCache.delete(oldest);
  }
}

export function getIntentCacheStats(): { size: number; totalHits: number } {
  const entries = Array.from(intentCache.values());
  return { size: entries.length, totalHits: entries.reduce((s, e) => s + e.hits, 0) };
}

// ═══════════════════════════════════════
// INTENT — Capability Gap Surfacing (#46)
// ═══════════════════════════════════════

export interface CapabilityGap {
  intentKey: string;
  requestCount: number;
  firstRequested: number;
  lastRequested: number;
  priorityScore: number;
}

const unresolvedIntents = new Map<string, { count: number; first: number; last: number }>();

export function recordUnresolvedIntent(intentKey: string): void {
  const entry = unresolvedIntents.get(intentKey) ?? { count: 0, first: Date.now(), last: Date.now() };
  entry.count++;
  entry.last = Date.now();
  unresolvedIntents.set(intentKey, entry);
}

export function getCapabilityGaps(limit: number = 20): CapabilityGap[] {
  return Array.from(unresolvedIntents.entries())
    .map(([intentKey, data]) => ({
      intentKey,
      requestCount: data.count,
      firstRequested: data.first,
      lastRequested: data.last,
      priorityScore: Math.round(data.count * (1 + (Date.now() - data.first) / (7 * 24 * 60 * 60 * 1000))),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, limit);
}

// ═══════════════════════════════════════
// GOVERNANCE — Policy Hot-Reload (#47)
// ═══════════════════════════════════════

export interface GovernancePolicy {
  id: string;
  name: string;
  rule: string;
  version: number;
  active: boolean;
  loadedAt: number;
}

const activePolicies = new Map<string, GovernancePolicy>();
let policyVersion = 0;

export function loadPolicy(id: string, name: string, rule: string): GovernancePolicy {
  const policy: GovernancePolicy = {
    id,
    name,
    rule,
    version: ++policyVersion,
    active: true,
    loadedAt: Date.now(),
  };
  activePolicies.set(id, policy);
  return policy;
}

export function hotReloadPolicy(id: string, newRule: string): GovernancePolicy | null {
  const existing = activePolicies.get(id);
  if (!existing) return null;
  existing.rule = newRule;
  existing.version = ++policyVersion;
  existing.loadedAt = Date.now();
  return existing;
}

export function getActivePolicies(): GovernancePolicy[] {
  return Array.from(activePolicies.values()).filter(p => p.active);
}

// ═══════════════════════════════════════
// GOVERNANCE — Policy Conflict Detection (#48)
// ═══════════════════════════════════════

export interface PolicyConflict {
  policyA: string;
  policyB: string;
  conflictType: 'contradiction' | 'overlap' | 'ambiguity';
  description: string;
  severity: 'warning' | 'error';
  detectedAt: number;
}

export function detectPolicyConflicts(): PolicyConflict[] {
  const policies = Array.from(activePolicies.values()).filter(p => p.active);
  const conflicts: PolicyConflict[] = [];

  for (let i = 0; i < policies.length; i++) {
    for (let j = i + 1; j < policies.length; j++) {
      const a = policies[i];
      const b = policies[j];

      // Simple heuristic: check for opposing allow/deny patterns
      const aLower = a.rule.toLowerCase();
      const bLower = b.rule.toLowerCase();

      if ((aLower.includes('allow') && bLower.includes('deny')) || (aLower.includes('deny') && bLower.includes('allow'))) {
        // Check if they target similar subjects
        const aWords = new Set(aLower.split(/\W+/));
        const bWords = new Set(bLower.split(/\W+/));
        const overlap = [...aWords].filter(w => bWords.has(w) && w.length > 3).length;

        if (overlap >= 2) {
          conflicts.push({
            policyA: a.id,
            policyB: b.id,
            conflictType: 'contradiction',
            description: `"${a.name}" and "${b.name}" have opposing directives with ${overlap} shared terms`,
            severity: 'error',
            detectedAt: Date.now(),
          });
        }
      }

      // Check for overlapping scope
      if (a.name === b.name && a.id !== b.id) {
        conflicts.push({
          policyA: a.id,
          policyB: b.id,
          conflictType: 'overlap',
          description: `Duplicate policy names: "${a.name}"`,
          severity: 'warning',
          detectedAt: Date.now(),
        });
      }
    }
  }

  return conflicts;
}
