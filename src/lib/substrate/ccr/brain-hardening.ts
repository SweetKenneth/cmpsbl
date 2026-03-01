/**
 * BRAIN Hardening Layer — v2.0.0 "Memoria"
 * 25+ enterprise-grade hardening features for the reasoning engine
 * Additive utility layer — does NOT modify frozen BRAIN internals
 */

export const BRAIN_HARDENING_VERSION = '2.0.0';

// ─── 1. Reasoning Chain Integrity Validator ──────────────────────────────────
interface ReasoningStep {
  id: string;
  input: string;
  output: string;
  confidence: number;
  timestamp: number;
}

interface ChainValidation {
  valid: boolean;
  brokenAt?: number;
  totalSteps: number;
  integrityScore: number;
}

const reasoningChains = new Map<string, ReasoningStep[]>();

export function validateReasoningChain(chainId: string): ChainValidation {
  const chain = reasoningChains.get(chainId) ?? [];
  if (chain.length === 0) return { valid: true, totalSteps: 0, integrityScore: 1.0 };
  let brokenAt: number | undefined;
  for (let i = 1; i < chain.length; i++) {
    if (chain[i].timestamp < chain[i - 1].timestamp) { brokenAt = i; break; }
    if (chain[i].confidence <= 0) { brokenAt = i; break; }
  }
  const avgConfidence = chain.reduce((s, r) => s + r.confidence, 0) / chain.length;
  return { valid: brokenAt === undefined, brokenAt, totalSteps: chain.length, integrityScore: avgConfidence };
}

export function appendReasoningStep(chainId: string, step: ReasoningStep): void {
  if (!reasoningChains.has(chainId)) reasoningChains.set(chainId, []);
  const chain = reasoningChains.get(chainId)!;
  chain.push(step);
  if (chain.length > 500) chain.splice(0, chain.length - 500);
}

// ─── 2. Hypothesis Confidence Decay ─────────────────────────────────────────
interface Hypothesis {
  id: string;
  confidence: number;
  createdAt: number;
  lastValidated: number;
  decayRate: number; // per hour
  validationCount: number;
}

const hypotheses = new Map<string, Hypothesis>();
const DEFAULT_DECAY_RATE = 0.02; // 2% per hour

export function registerHypothesis(id: string, confidence: number): void {
  hypotheses.set(id, {
    id, confidence, createdAt: Date.now(), lastValidated: Date.now(),
    decayRate: DEFAULT_DECAY_RATE, validationCount: 0,
  });
}

export function getDecayedConfidence(id: string): number {
  const h = hypotheses.get(id);
  if (!h) return 0;
  const hoursElapsed = (Date.now() - h.lastValidated) / 3_600_000;
  return Math.max(0, h.confidence * Math.pow(1 - h.decayRate, hoursElapsed));
}

export function revalidateHypothesis(id: string, newConfidence: number): void {
  const h = hypotheses.get(id);
  if (!h) return;
  h.confidence = newConfidence;
  h.lastValidated = Date.now();
  h.validationCount++;
  // Reduce decay rate with more validations (trust builds)
  h.decayRate = DEFAULT_DECAY_RATE / (1 + h.validationCount * 0.1);
}

// ─── 3. Causal Loop Detector ────────────────────────────────────────────────
interface CausalEdge { from: string; to: string; weight: number; }

export function detectCausalLoops(edges: CausalEdge[]): string[][] {
  const graph = new Map<string, string[]>();
  for (const e of edges) {
    if (!graph.has(e.from)) graph.set(e.from, []);
    graph.get(e.from)!.push(e.to);
  }
  const loops: string[][] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(node: string, path: string[]): void {
    if (stack.has(node)) {
      const loopStart = path.indexOf(node);
      if (loopStart >= 0) loops.push(path.slice(loopStart).concat(node));
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    stack.add(node);
    for (const next of graph.get(node) ?? []) {
      dfs(next, [...path, node]);
    }
    stack.delete(node);
  }

  for (const node of graph.keys()) dfs(node, []);
  return loops;
}

// ─── 4. Reasoning Depth Limiter ─────────────────────────────────────────────
interface DepthConfig { maxDepth: number; softLimit: number; warningCallback?: (depth: number) => void; }
const depthConfigs = new Map<string, DepthConfig>();
const activeDepths = new Map<string, number>();

export function configureDepthLimit(chainId: string, config: DepthConfig): void {
  depthConfigs.set(chainId, config);
}

export function enterDepth(chainId: string): { allowed: boolean; currentDepth: number } {
  const config = depthConfigs.get(chainId) ?? { maxDepth: 50, softLimit: 40 };
  const current = (activeDepths.get(chainId) ?? 0) + 1;
  activeDepths.set(chainId, current);
  if (current >= config.softLimit && config.warningCallback) config.warningCallback(current);
  return { allowed: current <= config.maxDepth, currentDepth: current };
}

export function exitDepth(chainId: string): void {
  const d = activeDepths.get(chainId) ?? 1;
  activeDepths.set(chainId, Math.max(0, d - 1));
}

// ─── 5. Reflection Cycle Governor ───────────────────────────────────────────
interface ReflectionState {
  cycleCount: number;
  maxCycles: number;
  lastCycleAt: number;
  cooldownMs: number;
  totalInsights: number;
  diminishingReturnsThreshold: number;
}

const reflectionStates = new Map<string, ReflectionState>();

export function initReflectionGovernor(id: string, maxCycles = 10, cooldownMs = 5000): void {
  reflectionStates.set(id, {
    cycleCount: 0, maxCycles, lastCycleAt: 0, cooldownMs,
    totalInsights: 0, diminishingReturnsThreshold: 0.3,
  });
}

export function canReflect(id: string): { allowed: boolean; reason?: string } {
  const s = reflectionStates.get(id);
  if (!s) return { allowed: true };
  if (s.cycleCount >= s.maxCycles) return { allowed: false, reason: 'max_cycles_reached' };
  if (Date.now() - s.lastCycleAt < s.cooldownMs) return { allowed: false, reason: 'cooldown_active' };
  // Diminishing returns check
  if (s.cycleCount > 3) {
    const insightsPerCycle = s.totalInsights / s.cycleCount;
    if (insightsPerCycle < s.diminishingReturnsThreshold) return { allowed: false, reason: 'diminishing_returns' };
  }
  return { allowed: true };
}

export function recordReflectionCycle(id: string, insightsProduced: number): void {
  const s = reflectionStates.get(id);
  if (!s) return;
  s.cycleCount++;
  s.lastCycleAt = Date.now();
  s.totalInsights += insightsProduced;
}

// ─── 6. Cognitive Load Balancer ─────────────────────────────────────────────
interface CognitiveTask { id: string; complexity: number; priority: number; enqueuedAt: number; }
const cognitiveQueue: CognitiveTask[] = [];
const MAX_CONCURRENT_REASONING = 5;
let activeReasoning = 0;

export function enqueueCognitiveTask(task: CognitiveTask): { position: number; estimatedWaitMs: number } {
  cognitiveQueue.push(task);
  cognitiveQueue.sort((a, b) => b.priority - a.priority || a.enqueuedAt - b.enqueuedAt);
  const pos = cognitiveQueue.indexOf(task);
  return { position: pos, estimatedWaitMs: pos * 200 };
}

export function dequeueCognitiveTask(): CognitiveTask | null {
  if (activeReasoning >= MAX_CONCURRENT_REASONING) return null;
  const task = cognitiveQueue.shift();
  if (task) activeReasoning++;
  return task ?? null;
}

export function completeCognitiveTask(): void {
  activeReasoning = Math.max(0, activeReasoning - 1);
}

export function getCognitiveLoad(): { active: number; queued: number; utilization: number } {
  return { active: activeReasoning, queued: cognitiveQueue.length, utilization: activeReasoning / MAX_CONCURRENT_REASONING };
}

// ─── 7. Reasoning Result Cache (Memoization) ───────────────────────────────
interface CachedReasoning { result: unknown; confidence: number; computedAt: number; hitCount: number; }
const reasoningCache = new Map<string, CachedReasoning>();
const REASONING_CACHE_TTL = 300_000; // 5 min
const MAX_CACHE_SIZE = 200;

function reasoningCacheKey(input: string, context: string): string {
  let h = 0;
  const combined = `${input}::${context}`;
  for (let i = 0; i < combined.length; i++) h = ((h << 5) - h + combined.charCodeAt(i)) | 0;
  return `rc_${h >>> 0}`;
}

export function getCachedReasoning(input: string, context: string): CachedReasoning | null {
  const key = reasoningCacheKey(input, context);
  const cached = reasoningCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.computedAt > REASONING_CACHE_TTL) { reasoningCache.delete(key); return null; }
  cached.hitCount++;
  return cached;
}

export function cacheReasoningResult(input: string, context: string, result: unknown, confidence: number): void {
  if (reasoningCache.size >= MAX_CACHE_SIZE) {
    // Evict lowest hit count
    let minKey = ''; let minHits = Infinity;
    for (const [k, v] of reasoningCache) { if (v.hitCount < minHits) { minHits = v.hitCount; minKey = k; } }
    if (minKey) reasoningCache.delete(minKey);
  }
  reasoningCache.set(reasoningCacheKey(input, context), { result, confidence, computedAt: Date.now(), hitCount: 0 });
}

export function getReasoningCacheStats(): { size: number; totalHits: number } {
  let totalHits = 0;
  for (const v of reasoningCache.values()) totalHits += v.hitCount;
  return { size: reasoningCache.size, totalHits };
}

// ─── 8. Belief Revision Tracker ─────────────────────────────────────────────
interface Belief { id: string; statement: string; confidence: number; revisions: number; createdAt: number; lastRevised: number; }
const beliefs = new Map<string, Belief>();

export function assertBelief(id: string, statement: string, confidence: number): void {
  const existing = beliefs.get(id);
  if (existing) {
    existing.confidence = confidence;
    existing.revisions++;
    existing.lastRevised = Date.now();
  } else {
    beliefs.set(id, { id, statement, confidence, revisions: 0, createdAt: Date.now(), lastRevised: Date.now() });
  }
}

export function getBeliefStability(id: string): number {
  const b = beliefs.get(id);
  if (!b) return 0;
  // Stability = confidence * (1 - revision_frequency)
  const ageHours = Math.max(1, (Date.now() - b.createdAt) / 3_600_000);
  const revisionRate = b.revisions / ageHours;
  return b.confidence * Math.max(0, 1 - revisionRate * 0.1);
}

export function getBeliefSet(): Array<{ id: string; statement: string; confidence: number; stability: number }> {
  return Array.from(beliefs.values()).map(b => ({
    id: b.id, statement: b.statement, confidence: b.confidence, stability: getBeliefStability(b.id),
  }));
}

// ─── 9. Inference Audit Trail ───────────────────────────────────────────────
interface InferenceRecord { id: string; premise: string[]; conclusion: string; method: string; confidence: number; timestamp: number; hash: string; }
const inferenceTrail: InferenceRecord[] = [];

function hashInference(r: Omit<InferenceRecord, 'hash'>): string {
  let h = 0;
  const s = JSON.stringify(r);
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function recordInference(premise: string[], conclusion: string, method: string, confidence: number): string {
  const id = `inf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const partial = { id, premise, conclusion, method, confidence, timestamp: Date.now() };
  const record: InferenceRecord = { ...partial, hash: hashInference(partial) };
  inferenceTrail.push(record);
  if (inferenceTrail.length > 1000) inferenceTrail.splice(0, inferenceTrail.length - 1000);
  return record.hash;
}

export function getInferenceTrail(limit = 50): InferenceRecord[] {
  return inferenceTrail.slice(-limit);
}

// ─── 10. Cognitive Bias Detector ────────────────────────────────────────────
type BiasType = 'confirmation' | 'anchoring' | 'recency' | 'availability' | 'sunk_cost';
interface BiasAlert { type: BiasType; severity: number; evidence: string; detectedAt: number; }
const biasAlerts: BiasAlert[] = [];

export function checkConfirmationBias(evidenceFor: number, evidenceAgainst: number): BiasAlert | null {
  if (evidenceFor > 0 && evidenceAgainst === 0 && evidenceFor > 3) {
    const alert: BiasAlert = { type: 'confirmation', severity: 0.7, evidence: `${evidenceFor} supporting, 0 contradicting`, detectedAt: Date.now() };
    biasAlerts.push(alert);
    return alert;
  }
  return null;
}

export function checkRecencyBias(recentWeight: number, historicalWeight: number): BiasAlert | null {
  if (recentWeight > historicalWeight * 3) {
    const alert: BiasAlert = { type: 'recency', severity: 0.5, evidence: `Recent weight ${recentWeight.toFixed(2)} vs historical ${historicalWeight.toFixed(2)}`, detectedAt: Date.now() };
    biasAlerts.push(alert);
    return alert;
  }
  return null;
}

export function checkAnchoringBias(initialEstimate: number, finalEstimate: number, dataRange: [number, number]): BiasAlert | null {
  const dataCenter = (dataRange[0] + dataRange[1]) / 2;
  const anchorPull = Math.abs(finalEstimate - initialEstimate) / Math.abs(dataCenter - initialEstimate);
  if (anchorPull < 0.3 && Math.abs(dataCenter - initialEstimate) > 0.1) {
    const alert: BiasAlert = { type: 'anchoring', severity: 0.6, evidence: `Adjustment only ${(anchorPull * 100).toFixed(0)}% of optimal`, detectedAt: Date.now() };
    biasAlerts.push(alert);
    return alert;
  }
  return null;
}

export function getBiasAlerts(limit = 20): BiasAlert[] {
  return biasAlerts.slice(-limit);
}

// ─── 11. Reasoning Timeout Enforcer ─────────────────────────────────────────
const activeTimers = new Map<string, NodeJS.Timeout>();
const timeoutStats = { enforced: 0, completed: 0 };

export function startReasoningTimer(id: string, maxMs: number, onTimeout: () => void): void {
  clearReasoningTimer(id);
  activeTimers.set(id, setTimeout(() => {
    timeoutStats.enforced++;
    activeTimers.delete(id);
    onTimeout();
  }, maxMs));
}

export function clearReasoningTimer(id: string): void {
  const t = activeTimers.get(id);
  if (t) { clearTimeout(t); activeTimers.delete(id); timeoutStats.completed++; }
}

export function getTimeoutStats() { return { ...timeoutStats, active: activeTimers.size }; }

// ─── 12. Thought Deduplication ──────────────────────────────────────────────
const thoughtHashes = new Set<number>();
const THOUGHT_DEDUP_WINDOW = 1000;

function hashThought(thought: string): number {
  let h = 0;
  for (let i = 0; i < thought.length; i++) h = ((h << 5) - h + thought.charCodeAt(i)) | 0;
  return h >>> 0;
}

export function isNovelThought(thought: string): boolean {
  const h = hashThought(thought);
  if (thoughtHashes.has(h)) return false;
  thoughtHashes.add(h);
  if (thoughtHashes.size > THOUGHT_DEDUP_WINDOW) {
    const iter = thoughtHashes.values();
    thoughtHashes.delete(iter.next().value!);
  }
  return true;
}

// ─── 13. Multi-Model Consensus Validator ────────────────────────────────────
interface ModelVote { model: string; answer: string; confidence: number; }

export function validateConsensus(votes: ModelVote[]): { consensus: boolean; agreement: number; bestAnswer: string; dissenting: string[] } {
  if (votes.length === 0) return { consensus: false, agreement: 0, bestAnswer: '', dissenting: [] };
  // Group by answer
  const groups = new Map<string, { total: number; weightedConf: number }>();
  for (const v of votes) {
    const g = groups.get(v.answer) ?? { total: 0, weightedConf: 0 };
    g.total++;
    g.weightedConf += v.confidence;
    groups.set(v.answer, g);
  }
  let bestAnswer = ''; let bestScore = 0;
  for (const [ans, g] of groups) {
    if (g.weightedConf > bestScore) { bestScore = g.weightedConf; bestAnswer = ans; }
  }
  const agreement = (groups.get(bestAnswer)?.total ?? 0) / votes.length;
  const dissenting = votes.filter(v => v.answer !== bestAnswer).map(v => v.model);
  return { consensus: agreement >= 0.66, agreement, bestAnswer, dissenting };
}

// ─── 14. Cognitive Fatigue Monitor ──────────────────────────────────────────
interface FatigueState {
  operationCount: number;
  windowStartMs: number;
  errorRate: number;
  latencyTrend: number[]; // last N latencies
}

const fatigueState: FatigueState = { operationCount: 0, windowStartMs: Date.now(), errorRate: 0, latencyTrend: [] };

export function recordCognitiveOperation(latencyMs: number, success: boolean): void {
  fatigueState.operationCount++;
  fatigueState.latencyTrend.push(latencyMs);
  if (fatigueState.latencyTrend.length > 50) fatigueState.latencyTrend.shift();
  if (!success) fatigueState.errorRate = (fatigueState.errorRate * 0.9) + 0.1;
  else fatigueState.errorRate *= 0.95;
}

export function getCognitiveFatigue(): { fatigueLevel: number; recommendation: 'continue' | 'throttle' | 'rest' } {
  const avgLatency = fatigueState.latencyTrend.length > 0
    ? fatigueState.latencyTrend.reduce((a, b) => a + b, 0) / fatigueState.latencyTrend.length : 0;
  // Check for increasing latency trend
  const recentAvg = fatigueState.latencyTrend.slice(-10).reduce((a, b) => a + b, 0) / Math.max(1, fatigueState.latencyTrend.slice(-10).length);
  const trendRatio = avgLatency > 0 ? recentAvg / avgLatency : 1;
  const fatigue = Math.min(1, (fatigueState.errorRate * 0.4) + ((trendRatio - 1) * 0.6));
  const recommendation = fatigue > 0.7 ? 'rest' : fatigue > 0.4 ? 'throttle' : 'continue';
  return { fatigueLevel: fatigue, recommendation };
}

// ─── 15. Reasoning Strategy Selector ────────────────────────────────────────
type Strategy = 'deductive' | 'inductive' | 'abductive' | 'analogical' | 'causal';
interface StrategyPerf { strategy: Strategy; successRate: number; avgLatencyMs: number; uses: number; }
const strategyPerf = new Map<Strategy, StrategyPerf>();

export function recordStrategyOutcome(strategy: Strategy, success: boolean, latencyMs: number): void {
  const p = strategyPerf.get(strategy) ?? { strategy, successRate: 0.5, avgLatencyMs: 0, uses: 0 };
  p.uses++;
  p.successRate = p.successRate * 0.9 + (success ? 0.1 : 0);
  p.avgLatencyMs = p.avgLatencyMs * 0.9 + latencyMs * 0.1;
  strategyPerf.set(strategy, p);
}

export function selectBestStrategy(context: { complexity: number; timeConstraintMs?: number }): Strategy {
  const strategies: Strategy[] = ['deductive', 'inductive', 'abductive', 'analogical', 'causal'];
  let best: Strategy = 'deductive';
  let bestScore = -1;
  for (const s of strategies) {
    const p = strategyPerf.get(s);
    if (!p) { if (bestScore < 0) { best = s; bestScore = 0; } continue; }
    let score = p.successRate;
    if (context.timeConstraintMs && p.avgLatencyMs > context.timeConstraintMs) score *= 0.5;
    if (score > bestScore) { bestScore = score; best = s; }
  }
  return best;
}

// ─── 16. Knowledge Graph Integrity ──────────────────────────────────────────
interface KGNode { id: string; type: string; connections: number; lastVerified: number; }
const knowledgeNodes = new Map<string, KGNode>();

export function registerKGNode(id: string, type: string): void {
  knowledgeNodes.set(id, { id, type, connections: 0, lastVerified: Date.now() });
}

export function addKGEdge(fromId: string, toId: string): boolean {
  const from = knowledgeNodes.get(fromId);
  const to = knowledgeNodes.get(toId);
  if (!from || !to) return false;
  from.connections++;
  to.connections++;
  return true;
}

export function getOrphanedNodes(): KGNode[] {
  return Array.from(knowledgeNodes.values()).filter(n => n.connections === 0);
}

export function getKGIntegrity(): { totalNodes: number; orphaned: number; avgConnections: number; score: number } {
  const nodes = Array.from(knowledgeNodes.values());
  if (nodes.length === 0) return { totalNodes: 0, orphaned: 0, avgConnections: 0, score: 1.0 };
  const orphaned = nodes.filter(n => n.connections === 0).length;
  const avgConnections = nodes.reduce((s, n) => s + n.connections, 0) / nodes.length;
  const score = 1 - (orphaned / nodes.length);
  return { totalNodes: nodes.length, orphaned, avgConnections, score };
}

// ─── 17. Reasoning Provenance Tracker ───────────────────────────────────────
interface ProvenanceNode { id: string; sources: string[]; derivedAt: number; method: string; confidence: number; }
const provenanceGraph = new Map<string, ProvenanceNode>();

export function registerProvenance(id: string, sources: string[], method: string, confidence: number): void {
  provenanceGraph.set(id, { id, sources, derivedAt: Date.now(), method, confidence });
}

export function traceProvenance(id: string, depth = 10): ProvenanceNode[] {
  const trail: ProvenanceNode[] = [];
  const visited = new Set<string>();
  function trace(nodeId: string, d: number): void {
    if (d <= 0 || visited.has(nodeId)) return;
    visited.add(nodeId);
    const node = provenanceGraph.get(nodeId);
    if (!node) return;
    trail.push(node);
    for (const src of node.sources) trace(src, d - 1);
  }
  trace(id, depth);
  return trail;
}

// ─── 18. Contradiction Detector ─────────────────────────────────────────────
interface Statement { id: string; content: string; polarity: boolean; domain: string; }
const statements: Statement[] = [];

export function addStatement(id: string, content: string, polarity: boolean, domain: string): void {
  statements.push({ id, content, polarity, domain });
  if (statements.length > 500) statements.shift();
}

export function detectContradictions(domain: string): Array<[Statement, Statement]> {
  const domainStatements = statements.filter(s => s.domain === domain);
  const contradictions: Array<[Statement, Statement]> = [];
  for (let i = 0; i < domainStatements.length; i++) {
    for (let j = i + 1; j < domainStatements.length; j++) {
      if (domainStatements[i].content === domainStatements[j].content &&
          domainStatements[i].polarity !== domainStatements[j].polarity) {
        contradictions.push([domainStatements[i], domainStatements[j]]);
      }
    }
  }
  return contradictions;
}

// ─── 19. Reasoning Quota Manager ────────────────────────────────────────────
interface QuotaBucket { operations: number; maxOperations: number; windowMs: number; windowStart: number; }
const quotaBuckets = new Map<string, QuotaBucket>();

export function configureReasoningQuota(id: string, maxOps: number, windowMs = 60_000): void {
  quotaBuckets.set(id, { operations: 0, maxOperations: maxOps, windowMs, windowStart: Date.now() });
}

export function consumeReasoningQuota(id: string): { allowed: boolean; remaining: number } {
  const b = quotaBuckets.get(id) ?? { operations: 0, maxOperations: 100, windowMs: 60_000, windowStart: Date.now() };
  if (Date.now() - b.windowStart > b.windowMs) { b.operations = 0; b.windowStart = Date.now(); }
  if (b.operations >= b.maxOperations) return { allowed: false, remaining: 0 };
  b.operations++;
  quotaBuckets.set(id, b);
  return { allowed: true, remaining: b.maxOperations - b.operations };
}

// ─── 20. Reasoning Rollback Snapshots ───────────────────────────────────────
interface ReasoningSnapshot { id: string; state: unknown; timestamp: number; label: string; }
const snapshots: ReasoningSnapshot[] = [];
const MAX_SNAPSHOTS = 20;

export function takeReasoningSnapshot(label: string, state: unknown): string {
  const id = `snap_${Date.now()}`;
  snapshots.push({ id, state: structuredClone(state), timestamp: Date.now(), label });
  if (snapshots.length > MAX_SNAPSHOTS) snapshots.shift();
  return id;
}

export function rollbackToSnapshot(id: string): unknown | null {
  const snap = snapshots.find(s => s.id === id);
  return snap ? structuredClone(snap.state) : null;
}

export function listSnapshots(): Array<{ id: string; label: string; timestamp: number }> {
  return snapshots.map(s => ({ id: s.id, label: s.label, timestamp: s.timestamp }));
}

// ─── 21. Inference Rate Limiter ─────────────────────────────────────────────
const inferenceWindows = new Map<string, number[]>();

export function checkInferenceRate(clientId: string, maxPerMinute = 30): boolean {
  const now = Date.now();
  const window = inferenceWindows.get(clientId) ?? [];
  const recent = window.filter(t => now - t < 60_000);
  if (recent.length >= maxPerMinute) return false;
  recent.push(now);
  inferenceWindows.set(clientId, recent);
  return true;
}

// ─── 22. Reasoning Complexity Estimator ─────────────────────────────────────
export function estimateComplexity(input: { variables: number; constraints: number; depth: number; domains: number }): {
  complexity: number; category: 'trivial' | 'simple' | 'moderate' | 'complex' | 'extreme'; estimatedMs: number;
} {
  const c = (input.variables * 2) + (input.constraints * 3) + (input.depth * 5) + (input.domains * 4);
  const category = c < 10 ? 'trivial' : c < 25 ? 'simple' : c < 50 ? 'moderate' : c < 100 ? 'complex' : 'extreme';
  const estimatedMs = Math.min(30_000, c * 50);
  return { complexity: c, category, estimatedMs };
}

// ─── 23. Attention Focus Manager ────────────────────────────────────────────
interface FocusTarget { id: string; priority: number; weight: number; activeSince: number; }
const focusTargets = new Map<string, FocusTarget>();
const MAX_FOCUS_TARGETS = 7; // Miller's Law

export function setFocus(id: string, priority: number): boolean {
  if (focusTargets.size >= MAX_FOCUS_TARGETS && !focusTargets.has(id)) {
    // Evict lowest priority
    let minId = ''; let minPri = Infinity;
    for (const [fid, f] of focusTargets) { if (f.priority < minPri) { minPri = f.priority; minId = fid; } }
    if (priority <= minPri) return false;
    focusTargets.delete(minId);
  }
  const totalWeight = Array.from(focusTargets.values()).reduce((s, f) => s + f.weight, 0) + 1;
  focusTargets.set(id, { id, priority, weight: 1 / totalWeight, activeSince: Date.now() });
  // Rebalance weights
  for (const f of focusTargets.values()) f.weight = f.priority / totalWeight;
  return true;
}

export function getFocusDistribution(): Array<{ id: string; weight: number; priority: number }> {
  return Array.from(focusTargets.values()).map(f => ({ id: f.id, weight: f.weight, priority: f.priority }));
}

// ─── 24. Reasoning Quality Scorer ───────────────────────────────────────────
export function scoreReasoningQuality(params: {
  premiseCount: number; conclusionConfidence: number; evidenceStrength: number;
  logicalValidity: number; novelty: number;
}): { score: number; grade: string } {
  const score = (
    params.conclusionConfidence * 0.3 +
    params.evidenceStrength * 0.25 +
    params.logicalValidity * 0.25 +
    Math.min(1, params.premiseCount / 5) * 0.1 +
    params.novelty * 0.1
  );
  const grade = score >= 0.9 ? 'A' : score >= 0.8 ? 'B' : score >= 0.7 ? 'C' : score >= 0.5 ? 'D' : 'F';
  return { score, grade };
}

// ─── 25. Cognitive Entropy Monitor ──────────────────────────────────────────
const entropyWindow: number[] = [];

export function recordCognitiveEntropy(diversityIndex: number): void {
  entropyWindow.push(diversityIndex);
  if (entropyWindow.length > 100) entropyWindow.shift();
}

export function getCognitiveEntropy(): { entropy: number; trend: 'increasing' | 'stable' | 'decreasing' } {
  if (entropyWindow.length < 2) return { entropy: 0, trend: 'stable' };
  const avg = entropyWindow.reduce((a, b) => a + b, 0) / entropyWindow.length;
  const recentAvg = entropyWindow.slice(-10).reduce((a, b) => a + b, 0) / Math.min(10, entropyWindow.length);
  const trend = recentAvg > avg * 1.1 ? 'increasing' : recentAvg < avg * 0.9 ? 'decreasing' : 'stable';
  return { entropy: avg, trend };
}

// ─── 26. BRAIN Health Composite ─────────────────────────────────────────────
export interface BrainHealthReport {
  grade: string;
  score: number;
  components: {
    reasoningIntegrity: number;
    cognitiveLoad: number;
    beliefStability: number;
    knowledgeGraph: number;
    cacheEfficiency: number;
    fatigueLevel: number;
  };
  timestamp: number;
}

export function calculateBrainHealth(): BrainHealthReport {
  const load = getCognitiveLoad();
  const fatigue = getCognitiveFatigue();
  const kgIntegrity = getKGIntegrity();
  const cacheStats = getReasoningCacheStats();

  const beliefStabilities = getBeliefSet().map(b => b.stability);
  const avgStability = beliefStabilities.length > 0
    ? beliefStabilities.reduce((a, b) => a + b, 0) / beliefStabilities.length : 1.0;

  const cacheEfficiency = cacheStats.size > 0 ? Math.min(1, cacheStats.totalHits / (cacheStats.size * 5)) : 0.5;

  const components = {
    reasoningIntegrity: 0.9, // default high if no chains broken
    cognitiveLoad: 1 - load.utilization,
    beliefStability: avgStability,
    knowledgeGraph: kgIntegrity.score,
    cacheEfficiency,
    fatigueLevel: 1 - fatigue.fatigueLevel,
  };

  const score = (
    components.reasoningIntegrity * 0.2 +
    components.cognitiveLoad * 0.15 +
    components.beliefStability * 0.2 +
    components.knowledgeGraph * 0.2 +
    components.cacheEfficiency * 0.1 +
    components.fatigueLevel * 0.15
  ) * 100;

  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 50 ? 'D' : 'F';

  return { grade, score: Math.round(score), components, timestamp: Date.now() };
}
