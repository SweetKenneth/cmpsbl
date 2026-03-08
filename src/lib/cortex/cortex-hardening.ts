/**
 * CORTEX Orchestration Hardening v2.0.0 — "Conductor"
 * Enterprise-grade orchestration resilience, pipeline integrity,
 * and workflow safety primitives.
 *
 * Non-breaking additive layer. All frozen CORTEX internals preserved.
 */

import { fnv1aHash, boundArray } from '@/lib/system/hardening';

export const CORTEX_HARDENING_VERSION = '2.0.0';
export const CORTEX_HARDENING_CODENAME = 'Conductor';

// ─── 1. Pipeline Integrity Seal ───────────────────────────────────────────────
// Hash-chain pipeline step outputs for tamper detection

interface PipelineSeal {
  pipelineId: string;
  stepIndex: number;
  stepId: string;
  outputHash: number;
  chainHash: number;
  timestamp: number;
}

const pipelineSeals = new Map<string, PipelineSeal[]>();

export function sealPipelineStep(
  pipelineId: string,
  stepId: string,
  stepIndex: number,
  output: unknown
): PipelineSeal {
  const outputHash = fnv1aHash(JSON.stringify(output ?? 'null'));
  const chain = pipelineSeals.get(pipelineId) ?? [];
  const prevHash = chain.length > 0 ? chain[chain.length - 1].chainHash : 0;
  const chainHash = fnv1aHash(`${prevHash}:${outputHash}:${stepIndex}`);

  const seal: PipelineSeal = {
    pipelineId,
    stepIndex,
    stepId,
    outputHash,
    chainHash,
    timestamp: Date.now(),
  };

  chain.push(seal);
  pipelineSeals.set(pipelineId, boundArray(chain, 200));
  return seal;
}

export function verifyPipelineChain(pipelineId: string): { valid: boolean; brokenAt?: number } {
  const chain = pipelineSeals.get(pipelineId);
  if (!chain || chain.length === 0) return { valid: true };

  let prevHash = 0;
  for (let i = 0; i < chain.length; i++) {
    const seal = chain[i];
    const expected = fnv1aHash(`${prevHash}:${seal.outputHash}:${seal.stepIndex}`);
    if (expected !== seal.chainHash) return { valid: false, brokenAt: i };
    prevHash = seal.chainHash;
  }
  return { valid: true };
}

// ─── 2. Orchestration Admission Control ───────────────────────────────────────
// Gate orchestrations based on system load and module health

interface AdmissionPolicy {
  maxConcurrentOrchestrations: number;
  maxStepsPerOrchestration: number;
  maxDepthNesting: number;
  minSystemHealthScore: number;
  cooldownMs: number;
}

const DEFAULT_ADMISSION: AdmissionPolicy = {
  maxConcurrentOrchestrations: 15,
  maxStepsPerOrchestration: 50,
  maxDepthNesting: 5,
  minSystemHealthScore: 0.3,
  cooldownMs: 500,
};

let admissionPolicy = { ...DEFAULT_ADMISSION };
let activeOrchestrationCount = 0;
let lastOrchestrationTime = 0;

export function setAdmissionPolicy(updates: Partial<AdmissionPolicy>): AdmissionPolicy {
  admissionPolicy = { ...admissionPolicy, ...updates };
  return { ...admissionPolicy };
}

export function evaluateAdmission(request: {
  stepCount: number;
  nestingDepth: number;
  systemHealth: number;
}): { admitted: boolean; reason?: string } {
  const now = Date.now();

  if (activeOrchestrationCount >= admissionPolicy.maxConcurrentOrchestrations) {
    return { admitted: false, reason: `Concurrency cap (${admissionPolicy.maxConcurrentOrchestrations}) reached` };
  }
  if (request.stepCount > admissionPolicy.maxStepsPerOrchestration) {
    return { admitted: false, reason: `Step count ${request.stepCount} exceeds max ${admissionPolicy.maxStepsPerOrchestration}` };
  }
  if (request.nestingDepth > admissionPolicy.maxDepthNesting) {
    return { admitted: false, reason: `Nesting depth ${request.nestingDepth} exceeds max ${admissionPolicy.maxDepthNesting}` };
  }
  if (request.systemHealth < admissionPolicy.minSystemHealthScore) {
    return { admitted: false, reason: `System health ${request.systemHealth} below minimum ${admissionPolicy.minSystemHealthScore}` };
  }
  if (now - lastOrchestrationTime < admissionPolicy.cooldownMs) {
    return { admitted: false, reason: `Cooldown active (${admissionPolicy.cooldownMs}ms)` };
  }

  return { admitted: true };
}

export function trackOrchestrationStart(): void {
  activeOrchestrationCount++;
  lastOrchestrationTime = Date.now();
}

export function trackOrchestrationEnd(): void {
  activeOrchestrationCount = Math.max(0, activeOrchestrationCount - 1);
}

// ─── 3. Step Dependency Validator ─────────────────────────────────────────────
// Detect cycles, missing refs, and unreachable steps before execution

interface DependencyValidation {
  valid: boolean;
  cycles: string[][];
  missingRefs: string[];
  unreachable: string[];
  executionOrder: string[];
}

export function validateStepDependencies(
  steps: Array<{ id: string; dependsOn?: string[] }>
): DependencyValidation {
  const ids = new Set(steps.map(s => s.id));
  const missingRefs: string[] = [];
  const adj = new Map<string, string[]>();

  for (const step of steps) {
    adj.set(step.id, []);
    for (const dep of step.dependsOn ?? []) {
      if (!ids.has(dep)) missingRefs.push(dep);
      else adj.get(step.id)!.push(dep);
    }
  }

  // Topological sort + cycle detection
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const order: string[] = [];
  const cycles: string[][] = [];

  function dfs(node: string, path: string[]): void {
    if (inStack.has(node)) {
      const cycleStart = path.indexOf(node);
      cycles.push(path.slice(cycleStart).concat(node));
      return;
    }
    if (visited.has(node)) return;

    inStack.add(node);
    path.push(node);

    for (const dep of adj.get(node) ?? []) {
      dfs(dep, [...path]);
    }

    inStack.delete(node);
    visited.add(node);
    order.push(node);
  }

  for (const step of steps) dfs(step.id, []);

  // Unreachable: steps with deps that can't be resolved
  const reachable = new Set(order);
  const unreachable = steps.filter(s => !reachable.has(s.id)).map(s => s.id);

  return {
    valid: cycles.length === 0 && missingRefs.length === 0 && unreachable.length === 0,
    cycles,
    missingRefs,
    unreachable,
    executionOrder: order,
  };
}

// ─── 4. Pipeline Cost Estimator ───────────────────────────────────────────────
// Predict resource consumption before execution

interface CostEstimate {
  estimatedTokens: number;
  estimatedLatencyMs: number;
  estimatedCostMillicents: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  breakdown: Array<{ stepId: string; tokens: number; latencyMs: number; cost: number }>;
}

const MODULE_COST_WEIGHTS: Record<string, { tokensPerCall: number; latencyMs: number; costPerCall: number }> = {
  brain: { tokensPerCall: 2000, latencyMs: 3000, costPerCall: 50 },
  decode: { tokensPerCall: 1500, latencyMs: 2000, costPerCall: 30 },
  nexus: { tokensPerCall: 4000, latencyMs: 5000, costPerCall: 100 },
  dream: { tokensPerCall: 3000, latencyMs: 8000, costPerCall: 80 },
  vision: { tokensPerCall: 5000, latencyMs: 4000, costPerCall: 120 },
  encode: { tokensPerCall: 2500, latencyMs: 6000, costPerCall: 60 },
  default: { tokensPerCall: 1000, latencyMs: 2000, costPerCall: 20 },
};

export function estimatePipelineCost(
  steps: Array<{ id: string; module: string }>
): CostEstimate {
  const breakdown = steps.map(step => {
    const weights = MODULE_COST_WEIGHTS[step.module] ?? MODULE_COST_WEIGHTS.default;
    return {
      stepId: step.id,
      tokens: weights.tokensPerCall,
      latencyMs: weights.latencyMs,
      cost: weights.costPerCall,
    };
  });

  const totalTokens = breakdown.reduce((s, b) => s + b.tokens, 0);
  const totalLatency = breakdown.reduce((s, b) => s + b.latencyMs, 0);
  const totalCost = breakdown.reduce((s, b) => s + b.cost, 0);

  let riskLevel: CostEstimate['riskLevel'] = 'low';
  if (totalCost > 500 || totalLatency > 30_000) riskLevel = 'medium';
  if (totalCost > 2000 || totalLatency > 60_000) riskLevel = 'high';
  if (totalCost > 5000 || totalLatency > 120_000) riskLevel = 'critical';

  return {
    estimatedTokens: totalTokens,
    estimatedLatencyMs: totalLatency,
    estimatedCostMillicents: totalCost,
    riskLevel,
    breakdown,
  };
}

// ─── 5. Orchestration Replay Journal ──────────────────────────────────────────
// Record deterministic replay-capable orchestration traces

interface ReplayEntry {
  orchestrationId: string;
  stepId: string;
  input: unknown;
  output: unknown;
  timestamp: number;
  durationMs: number;
  module: string;
  action: string;
}

const replayJournal: ReplayEntry[] = [];
const MAX_JOURNAL_SIZE = 500;

export function recordReplayEntry(entry: Omit<ReplayEntry, 'timestamp'>): void {
  replayJournal.push({ ...entry, timestamp: Date.now() });
  if (replayJournal.length > MAX_JOURNAL_SIZE) {
    replayJournal.splice(0, replayJournal.length - MAX_JOURNAL_SIZE);
  }
}

export function getReplayJournal(orchestrationId?: string): ReplayEntry[] {
  if (!orchestrationId) return [...replayJournal];
  return replayJournal.filter(e => e.orchestrationId === orchestrationId);
}

export function clearReplayJournal(): number {
  const count = replayJournal.length;
  replayJournal.length = 0;
  return count;
}

// ─── 6. Step Timeout Escalation ───────────────────────────────────────────────
// Progressive timeout tightening based on step position in pipeline

export function calculateStepTimeout(
  baseTimeoutMs: number,
  stepIndex: number,
  totalSteps: number,
  remainingBudgetMs: number
): number {
  // Later steps get tighter timeouts to prevent pipeline stall
  const positionFactor = 1 - (stepIndex / totalSteps) * 0.3;
  const adjustedTimeout = Math.min(
    baseTimeoutMs * positionFactor,
    remainingBudgetMs * 0.8 // Never consume more than 80% of remaining budget
  );
  return Math.max(adjustedTimeout, 1000); // Floor at 1s
}

// ─── 7. Pipeline Backpressure Controller ──────────────────────────────────────
// Dynamically throttle pipeline ingestion based on queue depth

interface BackpressureState {
  queueDepth: number;
  maxDepth: number;
  pressure: number; // 0.0–1.0
  throttled: boolean;
  rejectNew: boolean;
}

let backpressureConfig = { maxDepth: 50, throttleAt: 0.7, rejectAt: 0.9 };

export function calculateBackpressure(currentQueueDepth: number): BackpressureState {
  const pressure = Math.min(currentQueueDepth / backpressureConfig.maxDepth, 1.0);
  return {
    queueDepth: currentQueueDepth,
    maxDepth: backpressureConfig.maxDepth,
    pressure,
    throttled: pressure >= backpressureConfig.throttleAt,
    rejectNew: pressure >= backpressureConfig.rejectAt,
  };
}

export function setBackpressureConfig(config: Partial<typeof backpressureConfig>): void {
  backpressureConfig = { ...backpressureConfig, ...config };
}

// ─── 8. Workflow Checkpoint Manager ───────────────────────────────────────────
// Save/restore workflow execution state for crash recovery

interface Checkpoint {
  workflowId: string;
  executionId: string;
  completedSteps: string[];
  stepOutputs: Record<string, unknown>;
  timestamp: number;
  sequenceNumber: number;
}

const MAX_CHECKPOINTS = 200;
const checkpoints = new Map<string, Checkpoint>();

export function saveCheckpoint(
  executionId: string,
  workflowId: string,
  completedSteps: string[],
  stepOutputs: Record<string, unknown>
): Checkpoint {
  const existing = checkpoints.get(executionId);
  const checkpoint: Checkpoint = {
    workflowId,
    executionId,
    completedSteps: [...completedSteps],
    stepOutputs: { ...stepOutputs },
    timestamp: Date.now(),
    sequenceNumber: (existing?.sequenceNumber ?? 0) + 1,
  };
  checkpoints.set(executionId, checkpoint);
  if (checkpoints.size > MAX_CHECKPOINTS) {
    const first = checkpoints.keys().next().value;
    if (first !== undefined) checkpoints.delete(first);
  }
  return checkpoint;
}

export function loadCheckpoint(executionId: string): Checkpoint | null {
  return checkpoints.get(executionId) ?? null;
}

export function deleteCheckpoint(executionId: string): boolean {
  return checkpoints.delete(executionId);
}

// ─── 9. Orchestration SLA Monitor ─────────────────────────────────────────────
// Track orchestration latency against SLA budgets

interface SLARecord {
  orchestrationId: string;
  slaBudgetMs: number;
  actualMs: number;
  met: boolean;
  overshootMs: number;
  timestamp: number;
}

const slaRecords: SLARecord[] = [];

export function recordSLA(
  orchestrationId: string,
  slaBudgetMs: number,
  actualMs: number
): SLARecord {
  const record: SLARecord = {
    orchestrationId,
    slaBudgetMs,
    actualMs,
    met: actualMs <= slaBudgetMs,
    overshootMs: Math.max(0, actualMs - slaBudgetMs),
    timestamp: Date.now(),
  };
  slaRecords.push(record);
  if (slaRecords.length > 200) slaRecords.splice(0, slaRecords.length - 200);
  return record;
}

export function getSLACompliance(windowMs = 3_600_000): {
  total: number;
  met: number;
  violated: number;
  complianceRate: number;
  avgOvershootMs: number;
} {
  const cutoff = Date.now() - windowMs;
  const recent = slaRecords.filter(r => r.timestamp >= cutoff);
  const met = recent.filter(r => r.met).length;
  const violated = recent.length - met;
  const avgOvershoot = violated > 0
    ? recent.filter(r => !r.met).reduce((s, r) => s + r.overshootMs, 0) / violated
    : 0;

  return {
    total: recent.length,
    met,
    violated,
    complianceRate: recent.length > 0 ? met / recent.length : 1.0,
    avgOvershootMs: Math.round(avgOvershoot),
  };
}

// ─── 10. Cross-Pipeline Deduplication ─────────────────────────────────────────
// Detect and coalesce identical pipeline submissions

const MAX_FINGERPRINTS = 500;
const activePipelineFingerprints = new Map<number, { pipelineId: string; timestamp: number }>();

export function deduplicatePipeline(
  name: string,
  steps: Array<{ module: string; action: string }>,
  windowMs = 10_000
): { duplicate: boolean; existingPipelineId?: string } {
  const fingerprint = fnv1aHash(
    `${name}:${steps.map(s => `${s.module}.${s.action}`).join(',')}`
  );

  const existing = activePipelineFingerprints.get(fingerprint);
  if (existing && Date.now() - existing.timestamp < windowMs) {
    return { duplicate: true, existingPipelineId: existing.pipelineId };
  }

  return { duplicate: false };
}

export function registerPipelineFingerprint(
  pipelineId: string,
  name: string,
  steps: Array<{ module: string; action: string }>
): void {
  const fingerprint = fnv1aHash(
    `${name}:${steps.map(s => `${s.module}.${s.action}`).join(',')}`
  );
  activePipelineFingerprints.set(fingerprint, { pipelineId, timestamp: Date.now() });
  // Evict stale fingerprints
  if (activePipelineFingerprints.size > MAX_FINGERPRINTS) {
    const now = Date.now();
    for (const [k, v] of activePipelineFingerprints) {
      if (now - v.timestamp > 60_000) activePipelineFingerprints.delete(k);
      if (activePipelineFingerprints.size <= MAX_FINGERPRINTS) break;
    }
  }
}

export function clearPipelineFingerprint(
  name: string,
  steps: Array<{ module: string; action: string }>
): void {
  const fingerprint = fnv1aHash(
    `${name}:${steps.map(s => `${s.module}.${s.action}`).join(',')}`
  );
  activePipelineFingerprints.delete(fingerprint);
}

// ─── 11. Step Result Cache ────────────────────────────────────────────────────
// Cache deterministic step results to skip re-execution on replay/retry

interface CachedResult {
  key: number;
  output: unknown;
  timestamp: number;
  ttlMs: number;
  hits: number;
}

const stepCache = new Map<number, CachedResult>();
const MAX_CACHE_SIZE = 200;

export function cacheStepResult(
  module: string,
  action: string,
  inputHash: string,
  output: unknown,
  ttlMs = 300_000
): void {
  const key = fnv1aHash(`${module}:${action}:${inputHash}`);
  stepCache.set(key, { key, output, timestamp: Date.now(), ttlMs, hits: 0 });

  // Evict LRU if over capacity
  if (stepCache.size > MAX_CACHE_SIZE) {
    let oldest: number | null = null;
    let oldestTime = Infinity;
    for (const [k, v] of stepCache) {
      if (v.timestamp < oldestTime) {
        oldestTime = v.timestamp;
        oldest = k;
      }
    }
    if (oldest !== null) stepCache.delete(oldest);
  }
}

export function getCachedStepResult(
  module: string,
  action: string,
  inputHash: string
): unknown | null {
  const key = fnv1aHash(`${module}:${action}:${inputHash}`);
  const cached = stepCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > cached.ttlMs) {
    stepCache.delete(key);
    return null;
  }
  cached.hits++;
  return cached.output;
}

// ─── 12. Orchestration Priority Rebalancer ────────────────────────────────────
// Dynamically adjust pipeline priorities based on wait time aging

export function rebalancePriorities(
  pipelines: Array<{ id: string; priority: number; queuedAtMs: number }>
): Array<{ id: string; newPriority: number; boosted: boolean }> {
  const now = Date.now();
  const AGING_THRESHOLD_MS = 30_000; // 30s before aging kicks in
  const AGING_BOOST_PER_30S = 5;

  return pipelines.map(p => {
    const waitMs = now - p.queuedAtMs;
    const agingPeriods = Math.floor(Math.max(0, waitMs - AGING_THRESHOLD_MS) / 30_000);
    const boost = agingPeriods * AGING_BOOST_PER_30S;
    return {
      id: p.id,
      newPriority: Math.min(p.priority + boost, 100),
      boosted: boost > 0,
    };
  });
}

// ─── 13. Pipeline Abort Controller ────────────────────────────────────────────
// Centralized abort signal management for pipeline cancellation

const MAX_ABORT_CONTROLLERS = 200;
const abortControllers = new Map<string, AbortController>();

export function createPipelineAbort(pipelineId: string): AbortSignal {
  const controller = new AbortController();
  abortControllers.set(pipelineId, controller);
  // Evict FIFO if over capacity
  if (abortControllers.size > MAX_ABORT_CONTROLLERS) {
    const first = abortControllers.keys().next().value;
    if (first !== undefined) abortControllers.delete(first);
  }
  return controller.signal;
}

export function abortPipeline(pipelineId: string, reason = 'cancelled'): boolean {
  const controller = abortControllers.get(pipelineId);
  if (!controller) return false;
  controller.abort(reason);
  abortControllers.delete(pipelineId);
  return true;
}

export function cleanupAbortController(pipelineId: string): void {
  abortControllers.delete(pipelineId);
}

// ─── 14. Workflow Versioning ──────────────────────────────────────────────────
// Track workflow definition changes with immutable snapshots

interface WorkflowSnapshot {
  workflowId: string;
  version: number;
  definitionHash: number;
  timestamp: number;
  changedFields: string[];
}

const workflowVersions = new Map<string, WorkflowSnapshot[]>();

export function snapshotWorkflow(
  workflowId: string,
  definition: Record<string, unknown>,
  changedFields: string[] = []
): WorkflowSnapshot {
  const versions = workflowVersions.get(workflowId) ?? [];
  const snapshot: WorkflowSnapshot = {
    workflowId,
    version: versions.length + 1,
    definitionHash: fnv1aHash(JSON.stringify(definition)),
    timestamp: Date.now(),
    changedFields,
  };
  versions.push(snapshot);
  workflowVersions.set(workflowId, boundArray(versions, 50));
  return snapshot;
}

export function getWorkflowVersions(workflowId: string): WorkflowSnapshot[] {
  return [...(workflowVersions.get(workflowId) ?? [])];
}

// ─── 15. Module Affinity Scheduler ────────────────────────────────────────────
// Co-locate pipeline steps that share data to reduce transfer overhead

export function calculateModuleAffinity(
  steps: Array<{ id: string; module: string; dependsOn?: string[] }>
): Map<string, string[]> {
  const affinity = new Map<string, string[]>();

  for (const step of steps) {
    for (const dep of step.dependsOn ?? []) {
      const depStep = steps.find(s => s.id === dep);
      if (depStep && depStep.module === step.module) {
        const group = affinity.get(step.module) ?? [];
        if (!group.includes(step.id)) group.push(step.id);
        if (!group.includes(depStep.id)) group.push(depStep.id);
        affinity.set(step.module, group);
      }
    }
  }

  return affinity;
}

// ─── 16. Orchestration Deadlock Detector ──────────────────────────────────────
// Detect resource wait cycles across concurrent orchestrations

interface ResourceLock {
  orchestrationId: string;
  resource: string;
  acquiredAt: number;
}

const resourceLocks = new Map<string, ResourceLock>();
const waitGraph = new Map<string, Set<string>>(); // orchId → Set<waitingForOrchId>

export function acquireResource(
  orchestrationId: string,
  resource: string
): { acquired: boolean; deadlock: boolean; holder?: string } {
  const existing = resourceLocks.get(resource);
  if (existing && existing.orchestrationId !== orchestrationId) {
    // Record wait edge
    const waits = waitGraph.get(orchestrationId) ?? new Set();
    waits.add(existing.orchestrationId);
    waitGraph.set(orchestrationId, waits);

    // Check for cycle
    if (detectCycle(orchestrationId)) {
      waitGraph.get(orchestrationId)?.delete(existing.orchestrationId);
      return { acquired: false, deadlock: true, holder: existing.orchestrationId };
    }

    return { acquired: false, deadlock: false, holder: existing.orchestrationId };
  }

  resourceLocks.set(resource, { orchestrationId, resource, acquiredAt: Date.now() });
  return { acquired: true, deadlock: false };
}

export function releaseResource(resource: string): void {
  const lock = resourceLocks.get(resource);
  if (lock) {
    resourceLocks.delete(resource);
    waitGraph.delete(lock.orchestrationId);
  }
}

function detectCycle(startId: string): boolean {
  // BFS: check if any path from startId's wait targets leads back to startId
  const visited = new Set<string>();
  const queue: string[] = [];

  // Seed with what startId is waiting on
  const initial = waitGraph.get(startId);
  if (!initial) return false;
  for (const n of initial) queue.push(n);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === startId) return true; // cycle back to origin
    if (visited.has(current)) continue;
    visited.add(current);

    const neighbors = waitGraph.get(current);
    if (neighbors) {
      for (const n of neighbors) queue.push(n);
    }
  }
  return false;
}

// ─── 17. Pipeline Quota Enforcer ──────────────────────────────────────────────
// Per-source pipeline execution quotas

interface QuotaBucket {
  source: string;
  limit: number;
  used: number;
  windowMs: number;
  windowStart: number;
}

const MAX_QUOTA_BUCKETS = 200;
const quotaBuckets = new Map<string, QuotaBucket>();

export function checkPipelineQuota(source: string, limit = 100, windowMs = 3_600_000): boolean {
  const now = Date.now();
  let bucket = quotaBuckets.get(source);

  if (!bucket || now - bucket.windowStart > bucket.windowMs) {
    bucket = { source, limit, used: 0, windowMs, windowStart: now };
    quotaBuckets.set(source, bucket);
    // Evict expired buckets if over capacity
    if (quotaBuckets.size > MAX_QUOTA_BUCKETS) {
      for (const [k, v] of quotaBuckets) {
        if (now - v.windowStart > v.windowMs) quotaBuckets.delete(k);
        if (quotaBuckets.size <= MAX_QUOTA_BUCKETS) break;
      }
    }
  }

  if (bucket.used >= bucket.limit) return false;
  bucket.used++;
  return true;
}

export function getQuotaUsage(source: string): { used: number; limit: number; remaining: number } | null {
  const bucket = quotaBuckets.get(source);
  if (!bucket) return null;
  return { used: bucket.used, limit: bucket.limit, remaining: Math.max(0, bucket.limit - bucket.used) };
}

// ─── 18. Orchestration Telemetry Aggregator ───────────────────────────────────
// Rolling window statistics for orchestration performance

interface TelemetryWindow {
  successCount: number;
  failureCount: number;
  totalLatencyMs: number;
  maxLatencyMs: number;
  minLatencyMs: number;
  stepCounts: number[];
  windowStart: number;
}

let telemetryWindow: TelemetryWindow = {
  successCount: 0,
  failureCount: 0,
  totalLatencyMs: 0,
  maxLatencyMs: 0,
  minLatencyMs: Infinity,
  stepCounts: [],
  windowStart: Date.now(),
};

const TELEMETRY_WINDOW_MS = 300_000; // 5 minutes

export function recordOrchestrationTelemetry(
  success: boolean,
  latencyMs: number,
  stepCount: number
): void {
  const now = Date.now();
  if (now - telemetryWindow.windowStart > TELEMETRY_WINDOW_MS) {
    telemetryWindow = {
      successCount: 0,
      failureCount: 0,
      totalLatencyMs: 0,
      maxLatencyMs: 0,
      minLatencyMs: Infinity,
      stepCounts: [],
      windowStart: now,
    };
  }

  if (success) telemetryWindow.successCount++;
  else telemetryWindow.failureCount++;

  telemetryWindow.totalLatencyMs += latencyMs;
  telemetryWindow.maxLatencyMs = Math.max(telemetryWindow.maxLatencyMs, latencyMs);
  telemetryWindow.minLatencyMs = Math.min(telemetryWindow.minLatencyMs, latencyMs);
  telemetryWindow.stepCounts.push(stepCount);
  // Cap stepCounts within window
  if (telemetryWindow.stepCounts.length > 1000) {
    telemetryWindow.stepCounts = telemetryWindow.stepCounts.slice(-500);
  }
}

export function getOrchestrationTelemetry(): {
  successRate: number;
  avgLatencyMs: number;
  maxLatencyMs: number;
  p95LatencyEstimate: number;
  avgStepsPerOrchestration: number;
  throughput: number;
} {
  const total = telemetryWindow.successCount + telemetryWindow.failureCount;
  const elapsed = Math.max(1, Date.now() - telemetryWindow.windowStart);

  return {
    successRate: total > 0 ? telemetryWindow.successCount / total : 1.0,
    avgLatencyMs: total > 0 ? Math.round(telemetryWindow.totalLatencyMs / total) : 0,
    maxLatencyMs: telemetryWindow.maxLatencyMs,
    p95LatencyEstimate: Math.round(telemetryWindow.maxLatencyMs * 0.85),
    avgStepsPerOrchestration: telemetryWindow.stepCounts.length > 0
      ? Math.round(telemetryWindow.stepCounts.reduce((a, b) => a + b, 0) / telemetryWindow.stepCounts.length)
      : 0,
    throughput: Math.round((total / elapsed) * 60_000), // per minute
  };
}

// ─── 19. Pipeline Dry-Run Simulator ───────────────────────────────────────────
// Simulate pipeline execution without side effects

export function dryRunPipeline(
  steps: Array<{ id: string; module: string; action: string; dependsOn?: string[]; timeoutMs?: number }>
): {
  feasible: boolean;
  estimatedDurationMs: number;
  criticalPath: string[];
  parallelGroups: string[][];
  warnings: string[];
} {
  const warnings: string[] = [];
  const depValidation = validateStepDependencies(steps);

  if (!depValidation.valid) {
    return {
      feasible: false,
      estimatedDurationMs: 0,
      criticalPath: [],
      parallelGroups: [],
      warnings: [
        ...depValidation.cycles.map(c => `Cycle: ${c.join(' → ')}`),
        ...depValidation.missingRefs.map(r => `Missing ref: ${r}`),
      ],
    };
  }

  // Build parallel groups (steps with no inter-dependencies can run together)
  const groups: string[][] = [];
  const placed = new Set<string>();

  for (const stepId of depValidation.executionOrder) {
    const step = steps.find(s => s.id === stepId)!;
    const deps = step.dependsOn ?? [];

    // Find first group where all deps are in previous groups
    let groupIdx = 0;
    for (const dep of deps) {
      for (let g = 0; g < groups.length; g++) {
        if (groups[g].includes(dep)) groupIdx = Math.max(groupIdx, g + 1);
      }
    }

    if (!groups[groupIdx]) groups[groupIdx] = [];
    groups[groupIdx].push(stepId);
    placed.add(stepId);
  }

  // Estimate duration: sum of max-per-group
  const costEstimate = estimatePipelineCost(steps);
  const stepCosts = new Map(costEstimate.breakdown.map(b => [b.stepId, b.latencyMs]));

  let totalMs = 0;
  const criticalPath: string[] = [];

  for (const group of groups) {
    let maxInGroup = 0;
    let slowest = '';
    for (const id of group) {
      const cost = stepCosts.get(id) ?? 2000;
      if (cost > maxInGroup) {
        maxInGroup = cost;
        slowest = id;
      }
    }
    totalMs += maxInGroup;
    criticalPath.push(slowest);
  }

  if (steps.length > 20) warnings.push('Large pipeline (>20 steps) — consider decomposition');
  if (totalMs > 60_000) warnings.push(`Estimated duration ${Math.round(totalMs / 1000)}s exceeds 60s threshold`);

  return {
    feasible: true,
    estimatedDurationMs: totalMs,
    criticalPath,
    parallelGroups: groups,
    warnings,
  };
}

// ─── 20. Orchestration Circuit Breaker ────────────────────────────────────────
// Per-pipeline-type circuit breaker for recurring failures

interface OrchestrationType {
  name: string;
  failures: number;
  successes: number;
  state: 'closed' | 'open' | 'half_open';
  lastFailure: number;
  openedAt: number;
  cooldownMs: number;
}

const MAX_BREAKERS = 100;
const orchestrationBreakers = new Map<string, OrchestrationType>();

export function getOrchestrationBreakerState(name: string): OrchestrationType['state'] {
  const breaker = orchestrationBreakers.get(name);
  if (!breaker) return 'closed';

  if (breaker.state === 'open' && Date.now() - breaker.openedAt > breaker.cooldownMs) {
    breaker.state = 'half_open';
  }
  return breaker.state;
}

export function recordOrchestrationResult(
  name: string,
  success: boolean,
  failThreshold = 5,
  cooldownMs = 60_000
): OrchestrationType['state'] {
  let breaker = orchestrationBreakers.get(name);
  if (!breaker) {
    breaker = { name, failures: 0, successes: 0, state: 'closed', lastFailure: 0, openedAt: 0, cooldownMs };
    orchestrationBreakers.set(name, breaker);
  }

  if (success) {
    breaker.successes++;
    if (breaker.state === 'half_open') {
      breaker.state = 'closed';
      breaker.failures = 0;
    }
  } else {
    breaker.failures++;
    breaker.lastFailure = Date.now();
    if (breaker.failures >= failThreshold && breaker.state === 'closed') {
      breaker.state = 'open';
      breaker.openedAt = Date.now();
    }
  }

  return breaker.state;
}

// ─── 21. CORTEX Health Composite ──────────────────────────────────────────────

export interface CortexHealthReport {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  components: {
    slaCompliance: number;
    telemetrySuccessRate: number;
    backpressure: number;
    breakerHealth: number;
    pipelineIntegrity: number;
  };
  timestamp: number;
}

export function calculateCortexHealth(): CortexHealthReport {
  const sla = getSLACompliance();
  const telemetry = getOrchestrationTelemetry();
  const bp = calculateBackpressure(activeOrchestrationCount);

  // Breaker health: ratio of closed breakers
  let closedBreakers = 0;
  let totalBreakers = 0;
  for (const [, b] of orchestrationBreakers) {
    totalBreakers++;
    if (b.state === 'closed') closedBreakers++;
  }
  const breakerHealth = totalBreakers > 0 ? closedBreakers / totalBreakers : 1.0;

  // Pipeline integrity: ratio of valid chains
  let validChains = 0;
  let totalChains = 0;
  for (const [pid] of pipelineSeals) {
    totalChains++;
    if (verifyPipelineChain(pid).valid) validChains++;
  }
  const pipelineIntegrity = totalChains > 0 ? validChains / totalChains : 1.0;

  const components = {
    slaCompliance: sla.complianceRate,
    telemetrySuccessRate: telemetry.successRate,
    backpressure: 1.0 - bp.pressure,
    breakerHealth,
    pipelineIntegrity,
  };

  const score =
    components.slaCompliance * 0.25 +
    components.telemetrySuccessRate * 0.25 +
    components.backpressure * 0.20 +
    components.breakerHealth * 0.15 +
    components.pipelineIntegrity * 0.15;

  let grade: CortexHealthReport['grade'] = 'F';
  if (score >= 0.95) grade = 'A';
  else if (score >= 0.85) grade = 'B';
  else if (score >= 0.70) grade = 'C';
  else if (score >= 0.50) grade = 'D';

  return { score: Math.round(score * 1000) / 1000, grade, components, timestamp: Date.now() };
}
