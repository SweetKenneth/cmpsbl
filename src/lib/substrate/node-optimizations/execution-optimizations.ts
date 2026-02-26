/**
 * Matrix Node Optimizations — Execution Sector
 * Nodes: DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE, INTEGRATION
 *
 * DECODE:      #21 Interpretation Confidence, #22 Ambiguity Branching
 * ENCODE:      #23 Incremental Encoding, #24 Template Warm Cache
 * VISION:      #25 Adaptive Sampling, #26 Anomaly-Triggered Zoom
 * CORTEX:      #27 Task Dependency DAG, #28 Orchestration Replay Buffer
 * NEXUS:       #29 Latency-Weighted Selection, #30 Cost-Per-Token Tracking
 * ECONOMY:     #31 Usage Spike Detection, #32 Metering Reconciliation
 * SANDBOX:     #33 Pool Pre-Warming, #34 Resource Leak Detection
 * INCLUSIVE:    #35 Progressive Enhancement Scoring, #36 Accessibility Regression Gate
 * INTEGRATION: #37 Dependency Health Pre-Check, #38 Version Conflict Prediction
 */

// ═══════════════════════════════════════
// DECODE — Interpretation Confidence (#21)
// ═══════════════════════════════════════

export interface InterpretationResult {
  id: string;
  input: string;
  interpretation: string;
  confidence: number;
  alternatives?: Array<{ interpretation: string; confidence: number }>;
  timestamp: number;
}

const interpretations: InterpretationResult[] = [];
let interpCounter = 0;

export function recordInterpretation(input: string, interpretation: string, confidence: number): InterpretationResult {
  const result: InterpretationResult = {
    id: `interp_${++interpCounter}`,
    input: input.slice(0, 200),
    interpretation,
    confidence: Math.round(Math.max(0, Math.min(1, confidence)) * 1000) / 1000,
    timestamp: Date.now(),
  };
  interpretations.push(result);
  if (interpretations.length > 5000) interpretations.splice(0, interpretations.length - 5000);
  return result;
}

export function getInterpretationConfidenceStats(): { avgConfidence: number; lowConfidenceRate: number; total: number } {
  if (interpretations.length === 0) return { avgConfidence: 0, lowConfidenceRate: 0, total: 0 };
  const avg = interpretations.reduce((s, i) => s + i.confidence, 0) / interpretations.length;
  const low = interpretations.filter(i => i.confidence < 0.5).length;
  return { avgConfidence: Math.round(avg * 1000) / 1000, lowConfidenceRate: low / interpretations.length, total: interpretations.length };
}

// ═══════════════════════════════════════
// DECODE — Ambiguity Branching (#22)
// ═══════════════════════════════════════

export interface AmbiguityBranch {
  inputId: string;
  candidates: Array<{ interpretation: string; rank: number; confidence: number }>;
  selectedIndex: number;
  ambiguityScore: number; // 0 = clear, 1 = very ambiguous
}

export function branchAmbiguousInput(
  inputId: string,
  candidates: Array<{ interpretation: string; confidence: number }>,
): AmbiguityBranch {
  const sorted = candidates
    .sort((a, b) => b.confidence - a.confidence)
    .map((c, i) => ({ ...c, rank: i + 1 }));

  const topTwo = sorted.slice(0, 2);
  const ambiguityScore = topTwo.length >= 2
    ? Math.round((1 - (topTwo[0].confidence - topTwo[1].confidence)) * 1000) / 1000
    : 0;

  return { inputId, candidates: sorted, selectedIndex: 0, ambiguityScore };
}

// ═══════════════════════════════════════
// ENCODE — Incremental Encoding (#23)
// ═══════════════════════════════════════

export interface IncrementalPatch {
  fileId: string;
  changedSegments: number;
  totalSegments: number;
  reusedPercent: number;
  patchDurationMs: number;
  fullRegenDurationMs: number;
  savings: number; // time saved vs full regen
}

const patchHistory: IncrementalPatch[] = [];

export function recordIncrementalPatch(
  fileId: string, changedSegments: number, totalSegments: number,
  patchDurationMs: number, fullRegenDurationMs: number,
): IncrementalPatch {
  const patch: IncrementalPatch = {
    fileId,
    changedSegments,
    totalSegments,
    reusedPercent: totalSegments > 0 ? Math.round(((totalSegments - changedSegments) / totalSegments) * 1000) / 1000 : 0,
    patchDurationMs,
    fullRegenDurationMs,
    savings: fullRegenDurationMs - patchDurationMs,
  };
  patchHistory.push(patch);
  if (patchHistory.length > 2000) patchHistory.splice(0, patchHistory.length - 2000);
  return patch;
}

export function getIncrementalEncodingStats(): { avgReuse: number; totalTimeSavedMs: number; patchCount: number } {
  if (patchHistory.length === 0) return { avgReuse: 0, totalTimeSavedMs: 0, patchCount: 0 };
  return {
    avgReuse: Math.round((patchHistory.reduce((s, p) => s + p.reusedPercent, 0) / patchHistory.length) * 1000) / 1000,
    totalTimeSavedMs: patchHistory.reduce((s, p) => s + p.savings, 0),
    patchCount: patchHistory.length,
  };
}

// ═══════════════════════════════════════
// ENCODE — Template Warm Cache (#24)
// ═══════════════════════════════════════

const templateCache = new Map<string, { template: unknown; warmedAt: number; hitCount: number }>();

export function warmTemplate(templateId: string, template: unknown): void {
  templateCache.set(templateId, { template, warmedAt: Date.now(), hitCount: 0 });
}

export function getWarmedTemplate(templateId: string): unknown | null {
  const entry = templateCache.get(templateId);
  if (!entry) return null;
  entry.hitCount++;
  return entry.template;
}

export function getTemplateCacheStats(): { cached: number; totalHits: number } {
  const entries = Array.from(templateCache.values());
  return { cached: entries.length, totalHits: entries.reduce((s, e) => s + e.hitCount, 0) };
}

// ═══════════════════════════════════════
// VISION — Adaptive Sampling (#25)
// ═══════════════════════════════════════

export interface SamplingConfig {
  baseSampleRate: number; // 0.0–1.0
  currentRate: number;
  incidentMultiplier: number;
  idleMultiplier: number;
  isIncident: boolean;
}

const samplingConfig: SamplingConfig = {
  baseSampleRate: 0.1,
  currentRate: 0.1,
  incidentMultiplier: 10, // 100% during incidents
  idleMultiplier: 0.5,
  isIncident: false,
};

export function setIncidentMode(active: boolean): void {
  samplingConfig.isIncident = active;
  samplingConfig.currentRate = active
    ? Math.min(1, samplingConfig.baseSampleRate * samplingConfig.incidentMultiplier)
    : samplingConfig.baseSampleRate;
}

export function shouldSample(): boolean {
  return Math.random() < samplingConfig.currentRate;
}

export function getSamplingConfig(): SamplingConfig {
  return { ...samplingConfig };
}

// ═══════════════════════════════════════
// VISION — Anomaly-Triggered Zoom (#26)
// ═══════════════════════════════════════

export interface AnomalyZoom {
  metricName: string;
  triggeredAt: number;
  expiresAt: number;
  originalGranularityMs: number;
  zoomedGranularityMs: number;
  active: boolean;
}

const activeZooms = new Map<string, AnomalyZoom>();

export function triggerAnomalyZoom(metricName: string, zoomDurationMs: number = 5 * 60 * 1000, zoomedGranularityMs: number = 1000): AnomalyZoom {
  const zoom: AnomalyZoom = {
    metricName,
    triggeredAt: Date.now(),
    expiresAt: Date.now() + zoomDurationMs,
    originalGranularityMs: 60_000,
    zoomedGranularityMs,
    active: true,
  };
  activeZooms.set(metricName, zoom);
  return zoom;
}

export function getActiveZooms(): AnomalyZoom[] {
  const now = Date.now();
  for (const [k, z] of activeZooms) { if (now > z.expiresAt) { z.active = false; activeZooms.delete(k); } }
  return Array.from(activeZooms.values());
}

export function getGranularity(metricName: string): number {
  const zoom = activeZooms.get(metricName);
  return zoom?.active ? zoom.zoomedGranularityMs : 60_000;
}

// ═══════════════════════════════════════
// CORTEX — Task Dependency DAG (#27)
// ═══════════════════════════════════════

export interface DAGNode {
  taskId: string;
  dependencies: string[];
  status: 'pending' | 'ready' | 'running' | 'done' | 'failed';
}

export function buildDAG(tasks: Array<{ id: string; dependsOn: string[] }>): DAGNode[] {
  return tasks.map(t => ({
    taskId: t.id,
    dependencies: t.dependsOn,
    status: 'pending',
  }));
}

export function getReadyTasks(dag: DAGNode[]): DAGNode[] {
  const doneIds = new Set(dag.filter(n => n.status === 'done').map(n => n.taskId));
  return dag.filter(n =>
    n.status === 'pending' &&
    n.dependencies.every(d => doneIds.has(d))
  ).map(n => { n.status = 'ready'; return n; });
}

export function getParallelizableGroups(dag: DAGNode[]): string[][] {
  const groups: string[][] = [];
  const done = new Set<string>();
  const remaining = [...dag];

  while (remaining.some(n => !done.has(n.taskId))) {
    const ready = remaining.filter(n => !done.has(n.taskId) && n.dependencies.every(d => done.has(d)));
    if (ready.length === 0) break;
    groups.push(ready.map(n => n.taskId));
    for (const n of ready) done.add(n.taskId);
  }

  return groups;
}

// ═══════════════════════════════════════
// CORTEX — Orchestration Replay Buffer (#28)
// ═══════════════════════════════════════

export interface OrchestrationStep {
  stepId: string;
  action: string;
  status: 'success' | 'failed';
  timestamp: number;
  input: unknown;
  output?: unknown;
}

export interface OrchestrationReplay {
  orchestrationId: string;
  steps: OrchestrationStep[];
  lastSuccessfulStep: number;
  replayableFrom: number;
}

const replayBuffers = new Map<string, OrchestrationReplay>();

export function recordOrchestrationStep(orchestrationId: string, step: OrchestrationStep): void {
  const replay = replayBuffers.get(orchestrationId) ?? {
    orchestrationId,
    steps: [],
    lastSuccessfulStep: -1,
    replayableFrom: 0,
  };
  replay.steps.push(step);
  if (step.status === 'success') replay.lastSuccessfulStep = replay.steps.length - 1;
  replay.replayableFrom = replay.lastSuccessfulStep + 1;
  replayBuffers.set(orchestrationId, replay);
}

export function getReplayPoint(orchestrationId: string): { replayFrom: number; steps: OrchestrationStep[] } | null {
  const replay = replayBuffers.get(orchestrationId);
  if (!replay || replay.lastSuccessfulStep < 0) return null;
  return { replayFrom: replay.replayableFrom, steps: replay.steps.slice(replay.replayableFrom) };
}

// ═══════════════════════════════════════
// NEXUS — Latency-Weighted Selection (#29)
// ═══════════════════════════════════════

export interface ProviderLatency {
  providerId: string;
  avgLatencyMs: number;
  p95LatencyMs: number;
  availability: number; // 0.0–1.0
  lastMeasured: number;
}

const providerLatencies = new Map<string, number[]>();

export function recordProviderLatency(providerId: string, latencyMs: number): void {
  const arr = providerLatencies.get(providerId) ?? [];
  arr.push(latencyMs);
  if (arr.length > 500) arr.splice(0, arr.length - 500);
  providerLatencies.set(providerId, arr);
}

export function getLatencyWeightedRanking(): ProviderLatency[] {
  const results: ProviderLatency[] = [];
  for (const [id, latencies] of providerLatencies) {
    const sorted = [...latencies].sort((a, b) => a - b);
    results.push({
      providerId: id,
      avgLatencyMs: Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length),
      p95LatencyMs: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
      availability: 1.0, // would be computed from health checks
      lastMeasured: Date.now(),
    });
  }
  return results.sort((a, b) => a.avgLatencyMs - b.avgLatencyMs);
}

// ═══════════════════════════════════════
// NEXUS — Cost-Per-Token Tracking (#30)
// ═══════════════════════════════════════

const providerCosts = new Map<string, { totalCost: number; totalTokens: number }>();

export function recordProviderCost(providerId: string, tokens: number, costCents: number): void {
  const entry = providerCosts.get(providerId) ?? { totalCost: 0, totalTokens: 0 };
  entry.totalCost += costCents;
  entry.totalTokens += tokens;
  providerCosts.set(providerId, entry);
}

export function getCostPerTokenRanking(): Array<{ providerId: string; costPerMillionTokens: number; totalSpent: number }> {
  return Array.from(providerCosts.entries())
    .map(([id, data]) => ({
      providerId: id,
      costPerMillionTokens: data.totalTokens > 0 ? Math.round((data.totalCost / data.totalTokens) * 1_000_000) : 0,
      totalSpent: Math.round(data.totalCost),
    }))
    .sort((a, b) => a.costPerMillionTokens - b.costPerMillionTokens);
}

// ═══════════════════════════════════════
// ECONOMY — Usage Spike Detection (#31)
// ═══════════════════════════════════════

const usageHistory: Array<{ value: number; timestamp: number }> = [];

export function recordUsagePoint(value: number): void {
  usageHistory.push({ value, timestamp: Date.now() });
  if (usageHistory.length > 10_000) usageHistory.splice(0, usageHistory.length - 10_000);
}

export function detectUsageSpike(windowMs: number = 60 * 60 * 1000, thresholdMultiplier: number = 3): {
  spikeDetected: boolean;
  currentRate: number;
  baselineRate: number;
  multiplier: number;
} {
  const now = Date.now();
  const recent = usageHistory.filter(u => u.timestamp > now - windowMs);
  const older = usageHistory.filter(u => u.timestamp <= now - windowMs && u.timestamp > now - windowMs * 4);

  const currentRate = recent.length > 0 ? recent.reduce((s, u) => s + u.value, 0) / recent.length : 0;
  const baselineRate = older.length > 0 ? older.reduce((s, u) => s + u.value, 0) / older.length : currentRate;
  const multiplier = baselineRate > 0 ? currentRate / baselineRate : 1;

  return { spikeDetected: multiplier >= thresholdMultiplier, currentRate, baselineRate, multiplier: Math.round(multiplier * 100) / 100 };
}

// ═══════════════════════════════════════
// ECONOMY — Metering Reconciliation (#32)
// ═══════════════════════════════════════

export interface ReconciliationResult {
  meteredValue: number;
  actualValue: number;
  drift: number;
  driftPercent: number;
  withinTolerance: boolean;
  checkedAt: number;
}

export function reconcileMetering(meteredValue: number, actualValue: number, tolerancePercent: number = 5): ReconciliationResult {
  const drift = Math.abs(meteredValue - actualValue);
  const driftPercent = actualValue > 0 ? Math.round((drift / actualValue) * 10000) / 100 : 0;
  return {
    meteredValue,
    actualValue,
    drift,
    driftPercent,
    withinTolerance: driftPercent <= tolerancePercent,
    checkedAt: Date.now(),
  };
}

// ═══════════════════════════════════════
// SANDBOX — Pool Pre-Warming (#33)
// ═══════════════════════════════════════

export interface SandboxPool {
  poolSize: number;
  warmInstances: number;
  coldStartAvgMs: number;
  warmStartAvgMs: number;
  savingsMs: number;
}

let poolConfig = { targetSize: 3, warmInstances: 0, coldStarts: [] as number[], warmStarts: [] as number[] };

export function recordSandboxStart(durationMs: number, wasWarm: boolean): void {
  if (wasWarm) { poolConfig.warmStarts.push(durationMs); if (poolConfig.warmStarts.length > 500) poolConfig.warmStarts.splice(0, 200); }
  else { poolConfig.coldStarts.push(durationMs); if (poolConfig.coldStarts.length > 500) poolConfig.coldStarts.splice(0, 200); }
}

export function getSandboxPoolStats(): SandboxPool {
  const coldAvg = poolConfig.coldStarts.length > 0 ? Math.round(poolConfig.coldStarts.reduce((a, b) => a + b, 0) / poolConfig.coldStarts.length) : 0;
  const warmAvg = poolConfig.warmStarts.length > 0 ? Math.round(poolConfig.warmStarts.reduce((a, b) => a + b, 0) / poolConfig.warmStarts.length) : 0;
  return {
    poolSize: poolConfig.targetSize,
    warmInstances: poolConfig.warmInstances,
    coldStartAvgMs: coldAvg,
    warmStartAvgMs: warmAvg,
    savingsMs: coldAvg - warmAvg,
  };
}

// ═══════════════════════════════════════
// SANDBOX — Resource Leak Detection (#34)
// ═══════════════════════════════════════

export interface LeakReport {
  sandboxId: string;
  memoryDeltaBytes: number;
  handleDelta: number;
  leakSuspected: boolean;
  checkedAt: number;
}

export function checkResourceLeak(sandboxId: string, preMemory: number, postMemory: number, preHandles: number, postHandles: number): LeakReport {
  const memDelta = postMemory - preMemory;
  const handleDelta = postHandles - preHandles;
  return {
    sandboxId,
    memoryDeltaBytes: memDelta,
    handleDelta,
    leakSuspected: memDelta > 10 * 1024 * 1024 || handleDelta > 5, // >10MB or >5 handles
    checkedAt: Date.now(),
  };
}

// ═══════════════════════════════════════
// INCLUSIVE — Progressive Enhancement Scoring (#35)
// ═══════════════════════════════════════

export interface AccessibilityScore {
  surfaceId: string;
  score: number; // 0–100
  level: 'A' | 'AA' | 'AAA' | 'fail';
  issues: Array<{ rule: string; impact: 'minor' | 'moderate' | 'serious' | 'critical' }>;
  userImpact: number; // estimated users affected 0.0–1.0
}

export function scoreAccessibility(
  surfaceId: string,
  issues: Array<{ rule: string; impact: 'minor' | 'moderate' | 'serious' | 'critical' }>,
): AccessibilityScore {
  const weights = { minor: 2, moderate: 5, serious: 15, critical: 30 };
  const totalPenalty = issues.reduce((s, i) => s + (weights[i.impact] ?? 5), 0);
  const score = Math.max(0, Math.round(100 - totalPenalty));

  let level: AccessibilityScore['level'] = 'fail';
  if (score >= 95 && !issues.some(i => i.impact === 'critical' || i.impact === 'serious')) level = 'AAA';
  else if (score >= 80 && !issues.some(i => i.impact === 'critical')) level = 'AA';
  else if (score >= 60) level = 'A';

  const userImpact = Math.round((issues.filter(i => i.impact === 'critical' || i.impact === 'serious').length / Math.max(1, issues.length)) * 1000) / 1000;

  return { surfaceId, score, level, issues, userImpact };
}

// ═══════════════════════════════════════
// INCLUSIVE — Accessibility Regression Gate (#36)
// ═══════════════════════════════════════

const accessibilityBaselines = new Map<string, number>();

export function setAccessibilityBaseline(surfaceId: string, score: number): void {
  accessibilityBaselines.set(surfaceId, score);
}

export function checkAccessibilityRegression(surfaceId: string, newScore: number): {
  passed: boolean;
  baseline: number;
  newScore: number;
  delta: number;
} {
  const baseline = accessibilityBaselines.get(surfaceId) ?? 0;
  return {
    passed: newScore >= baseline,
    baseline,
    newScore,
    delta: newScore - baseline,
  };
}

// ═══════════════════════════════════════
// INTEGRATION — Dependency Health Pre-Check (#37)
// ═══════════════════════════════════════

export interface DependencyHealthCheck {
  dependencyId: string;
  healthy: boolean;
  latencyMs: number;
  fallbackAvailable: boolean;
  lastChecked: number;
}

const depHealthCache = new Map<string, DependencyHealthCheck>();

export function recordDependencyHealth(dependencyId: string, healthy: boolean, latencyMs: number, fallbackAvailable: boolean): DependencyHealthCheck {
  const check: DependencyHealthCheck = { dependencyId, healthy, latencyMs, fallbackAvailable, lastChecked: Date.now() };
  depHealthCache.set(dependencyId, check);
  return check;
}

export function shouldUseFallback(dependencyId: string): boolean {
  const check = depHealthCache.get(dependencyId);
  if (!check) return false;
  return !check.healthy && check.fallbackAvailable;
}

export function getDependencyHealthSummary(): DependencyHealthCheck[] {
  return Array.from(depHealthCache.values()).sort((a, b) => (a.healthy ? 1 : 0) - (b.healthy ? 1 : 0));
}

// ═══════════════════════════════════════
// INTEGRATION — Version Conflict Prediction (#38)
// ═══════════════════════════════════════

export interface VersionConflict {
  packageA: string;
  packageB: string;
  requiredVersionA: string;
  requiredVersionB: string;
  conflictType: 'major' | 'minor' | 'peer';
  severity: 'warning' | 'error';
}

export function predictVersionConflicts(
  deps: Array<{ name: string; version: string; peerDeps?: Record<string, string> }>,
): VersionConflict[] {
  const conflicts: VersionConflict[] = [];
  const versionMap = new Map<string, Array<{ requester: string; version: string }>>();

  for (const dep of deps) {
    if (dep.peerDeps) {
      for (const [peer, version] of Object.entries(dep.peerDeps)) {
        const arr = versionMap.get(peer) ?? [];
        arr.push({ requester: dep.name, version });
        versionMap.set(peer, arr);
      }
    }
  }

  for (const [pkg, requesters] of versionMap) {
    if (requesters.length < 2) continue;
    for (let i = 0; i < requesters.length - 1; i++) {
      for (let j = i + 1; j < requesters.length; j++) {
        if (requesters[i].version !== requesters[j].version) {
          const majorA = requesters[i].version.split('.')[0];
          const majorB = requesters[j].version.split('.')[0];
          conflicts.push({
            packageA: requesters[i].requester,
            packageB: requesters[j].requester,
            requiredVersionA: requesters[i].version,
            requiredVersionB: requesters[j].version,
            conflictType: majorA !== majorB ? 'major' : 'minor',
            severity: majorA !== majorB ? 'error' : 'warning',
          });
        }
      }
    }
  }

  return conflicts;
}
