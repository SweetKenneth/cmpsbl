/**
 * DREAM Hardening Layer — v2.0.0 "Nocturne"
 * 25+ enterprise-grade hardening features for offline synthesis & creative recombination
 * Additive utility layer — does NOT modify frozen DREAM internals
 */

export const DREAM_HARDENING_VERSION = '2.0.0';

// ─── 1. Dream Chain Integrity Validator ─────────────────────────────────────
interface DreamStep { id: string; depth: number; input: string; output: string; coherence: number; timestamp: number; }
const dreamChains = new Map<string, DreamStep[]>();
const MAX_DREAM_CHAINS = 100;

export function appendDreamStep(chainId: string, step: DreamStep): void {
  if (!dreamChains.has(chainId)) {
    // Evict oldest chain if at capacity
    if (dreamChains.size >= MAX_DREAM_CHAINS) {
      const oldest = dreamChains.keys().next().value;
      if (oldest) dreamChains.delete(oldest);
    }
    dreamChains.set(chainId, []);
  }
  const chain = dreamChains.get(chainId)!;
  chain.push(step);
  if (chain.length > 200) chain.splice(0, chain.length - 200);
}

export function validateDreamChain(chainId: string): { valid: boolean; avgCoherence: number; brokenAt?: number; depth: number } {
  const chain = dreamChains.get(chainId) ?? [];
  if (chain.length === 0) return { valid: true, avgCoherence: 1.0, depth: 0 };
  let brokenAt: number | undefined;
  for (let i = 0; i < chain.length; i++) {
    if (chain[i].coherence < 0.1) { brokenAt = i; break; }
    if (i > 0 && chain[i].depth !== chain[i - 1].depth + 1) { brokenAt = i; break; }
  }
  const avgCoherence = chain.reduce((s, d) => s + d.coherence, 0) / chain.length;
  return { valid: brokenAt === undefined, avgCoherence, brokenAt, depth: chain.length };
}

// ─── 2. Synthesis Convergence Detector ──────────────────────────────────────
interface ConvergencePoint { iteration: number; divergence: number; timestamp: number; }
const convergenceHistory = new Map<string, ConvergencePoint[]>();
const MAX_CONVERGENCE_HISTORY = 50;

export function recordConvergence(chainId: string, iteration: number, divergence: number): boolean {
  if (!convergenceHistory.has(chainId)) convergenceHistory.set(chainId, []);
  const history = convergenceHistory.get(chainId)!;
  history.push({ iteration, divergence, timestamp: Date.now() });
  if (history.length > MAX_CONVERGENCE_HISTORY) history.splice(0, history.length - MAX_CONVERGENCE_HISTORY);
  // Converged if divergence below threshold for 3+ consecutive
  const recent = history.slice(-3);
  return recent.length >= 3 && recent.every(p => p.divergence < 0.05);
}

export function getConvergenceRate(chainId: string): number {
  const history = convergenceHistory.get(chainId) ?? [];
  if (history.length < 2) return 0;
  const first = history[0].divergence;
  const last = history.at(-1)!.divergence;
  return first > 0 ? (first - last) / first : 0;
}

// ─── 3. Dream Depth Limiter ────────────────────────────────────────────────
interface DepthLimit { maxDepth: number; currentDepth: number; softLimit: number; aborted: number; }
const depthLimits = new Map<string, DepthLimit>();
const MAX_DEPTH_LIMITS = 100;

export function configureDreamDepth(chainId: string, maxDepth = 20, softLimit = 15): void {
  if (depthLimits.size >= MAX_DEPTH_LIMITS && !depthLimits.has(chainId)) {
    const oldest = depthLimits.keys().next().value;
    if (oldest) depthLimits.delete(oldest);
  }
  depthLimits.set(chainId, { maxDepth, currentDepth: 0, softLimit, aborted: 0 });
}

export function canDeepen(chainId: string): { allowed: boolean; currentDepth: number; reason?: string } {
  const l = depthLimits.get(chainId) ?? { maxDepth: 20, currentDepth: 0, softLimit: 15, aborted: 0 };
  if (l.currentDepth >= l.maxDepth) return { allowed: false, currentDepth: l.currentDepth, reason: 'max_depth' };
  l.currentDepth++;
  depthLimits.set(chainId, l);
  if (l.currentDepth >= l.softLimit) return { allowed: true, currentDepth: l.currentDepth, reason: 'approaching_limit' };
  return { allowed: true, currentDepth: l.currentDepth };
}

export function resetDreamDepth(chainId: string): void {
  const l = depthLimits.get(chainId);
  if (l) l.currentDepth = 0;
}

// ─── 4. Creative Output Quality Scorer ──────────────────────────────────────
export function scoreDreamOutput(params: {
  novelty: number; coherence: number; relevance: number; actionability: number; surprise: number;
}): { score: number; grade: string; category: 'dream' | 'insight' | 'fusion' | 'noise' } {
  const score = (
    params.novelty * 0.25 + params.coherence * 0.25 + params.relevance * 0.2 +
    params.actionability * 0.15 + params.surprise * 0.15
  );
  const grade = score >= 0.9 ? 'A' : score >= 0.75 ? 'B' : score >= 0.6 ? 'C' : score >= 0.4 ? 'D' : 'F';
  const category = score >= 0.75 ? (params.actionability > 0.7 ? 'insight' : 'fusion')
    : score >= 0.4 ? 'dream' : 'noise';
  return { score, grade, category };
}

// ─── 5. Hallucination Guard ─────────────────────────────────────────────────
interface HallucinationCheck { outputId: string; groundedFacts: number; ungroundedClaims: number; confidence: number; flagged: boolean; }
const hallucinationLog: HallucinationCheck[] = [];
const MAX_HALLUCINATION_LOG = 500;

export function checkHallucination(outputId: string, groundedFacts: number, totalClaims: number): HallucinationCheck {
  const ungrounded = totalClaims - groundedFacts;
  const confidence = totalClaims > 0 ? groundedFacts / totalClaims : 0;
  const flagged = confidence < 0.5 || ungrounded > 3;
  const result: HallucinationCheck = { outputId, groundedFacts, ungroundedClaims: ungrounded, confidence, flagged };
  hallucinationLog.push(result);
  if (hallucinationLog.length > MAX_HALLUCINATION_LOG) hallucinationLog.splice(0, hallucinationLog.length - MAX_HALLUCINATION_LOG);
  return result;
}

export function getHallucinationRate(): number {
  if (hallucinationLog.length === 0) return 0;
  return hallucinationLog.filter(h => h.flagged).length / hallucinationLog.length;
}

// ─── 6. Latent Pattern Cache ────────────────────────────────────────────────
interface CachedPattern { id: string; domain: string; pattern: string; usageCount: number; discoveredAt: number; lastUsed: number; }
const patternCache = new Map<string, CachedPattern>();
const MAX_PATTERNS = 300;

export function cachePattern(id: string, domain: string, pattern: string): void {
  if (patternCache.size >= MAX_PATTERNS) {
    // FIFO eviction — O(1) via iterator
    const oldest = patternCache.keys().next().value;
    if (oldest) patternCache.delete(oldest);
  }
  patternCache.set(id, { id, domain, pattern, usageCount: 0, discoveredAt: Date.now(), lastUsed: Date.now() });
}

export function usePattern(id: string): CachedPattern | null {
  const p = patternCache.get(id);
  if (!p) return null;
  p.usageCount++;
  p.lastUsed = Date.now();
  return p;
}

export function getPatternStats(): { total: number; avgUsage: number; topPatterns: Array<{ id: string; usage: number }> } {
  const patterns = Array.from(patternCache.values());
  const avgUsage = patterns.length > 0 ? patterns.reduce((s, p) => s + p.usageCount, 0) / patterns.length : 0;
  const top = [...patterns].sort((a, b) => b.usageCount - a.usageCount).slice(0, 5).map(p => ({ id: p.id, usage: p.usageCount }));
  return { total: patterns.length, avgUsage, topPatterns: top };
}

// ─── 7. Dream Cycle Scheduler ───────────────────────────────────────────────
interface ScheduledDream { id: string; priority: number; seeds: string[]; scheduledAt: number; status: 'pending' | 'running' | 'completed' | 'failed'; }
const dreamQueue: ScheduledDream[] = [];
const MAX_DREAM_QUEUE = 200;
let activeDreamCount = 0;
const MAX_CONCURRENT_DREAMS = 3;

export function scheduleDream(seeds: string[], priority = 5): string {
  const id = `dream_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
  dreamQueue.push({ id, priority, seeds, scheduledAt: Date.now(), status: 'pending' });
  dreamQueue.sort((a, b) => b.priority - a.priority);
  // Evict oldest completed/failed entries when over capacity
  if (dreamQueue.length > MAX_DREAM_QUEUE) {
    for (let i = dreamQueue.length - 1; i >= 0 && dreamQueue.length > MAX_DREAM_QUEUE; i--) {
      if (dreamQueue[i].status === 'completed' || dreamQueue[i].status === 'failed') {
        dreamQueue.splice(i, 1);
      }
    }
  }
  return id;
}

export function dequeueNextDream(): ScheduledDream | null {
  if (activeDreamCount >= MAX_CONCURRENT_DREAMS) return null;
  const next = dreamQueue.find(d => d.status === 'pending');
  if (next) { next.status = 'running'; activeDreamCount++; }
  return next ?? null;
}

export function completeDream(id: string, success: boolean): void {
  const dream = dreamQueue.find(d => d.id === id);
  if (dream) { dream.status = success ? 'completed' : 'failed'; activeDreamCount = Math.max(0, activeDreamCount - 1); }
}

export function getDreamQueueStats(): { pending: number; running: number; completed: number; failed: number } {
  let pending = 0, running = 0, completed = 0, failed = 0;
  for (const d of dreamQueue) {
    switch (d.status) {
      case 'pending': pending++; break;
      case 'running': running++; break;
      case 'completed': completed++; break;
      case 'failed': failed++; break;
    }
  }
  return { pending, running, completed, failed };
}

// ─── 8. Cross-Domain Fusion Validator ───────────────────────────────────────
interface FusionResult { domains: string[]; fusionScore: number; conflicts: string[]; synergies: string[]; }

export function validateFusion(domainA: string, domainB: string, overlap: number, conflictCount: number, synergyCount: number): FusionResult {
  const fusionScore = (overlap * 0.4 + synergyCount * 0.1) / Math.max(1, 1 + conflictCount * 0.2);
  return {
    domains: [domainA, domainB],
    fusionScore: Math.min(1, fusionScore),
    conflicts: Array(conflictCount).fill('').map((_, i) => `conflict_${i}`),
    synergies: Array(synergyCount).fill('').map((_, i) => `synergy_${i}`),
  };
}

// ─── 9. Dream Output Deduplicator ───────────────────────────────────────────
const dreamOutputHashes = new Set<number>();

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h >>> 0;
}

export function isNovelDreamOutput(output: string): boolean {
  const h = hashString(output);
  if (dreamOutputHashes.has(h)) return false;
  dreamOutputHashes.add(h);
  if (dreamOutputHashes.size > 2000) {
    const iter = dreamOutputHashes.values();
    dreamOutputHashes.delete(iter.next().value!);
  }
  return true;
}

// ─── 10. Seed Quality Assessor ──────────────────────────────────────────────
interface SeedAssessment { seedId: string; diversity: number; relevance: number; freshness: number; quality: number; }

export function assessSeedQuality(seedId: string, params: { diversity: number; relevance: number; ageHours: number }): SeedAssessment {
  const freshness = Math.max(0, 1 - params.ageHours / 720); // Decays over 30 days
  const quality = params.diversity * 0.35 + params.relevance * 0.4 + freshness * 0.25;
  return { seedId, diversity: params.diversity, relevance: params.relevance, freshness, quality };
}

// ─── 11. Dream Energy Budget ────────────────────────────────────────────────
interface EnergyBudget { maxEnergy: number; currentEnergy: number; rechargeRate: number; lastRecharge: number; }
let energyBudget: EnergyBudget = { maxEnergy: 100, currentEnergy: 100, rechargeRate: 5, lastRecharge: Date.now() };

export function consumeDreamEnergy(cost: number): boolean {
  // Recharge
  const elapsed = (Date.now() - energyBudget.lastRecharge) / 60_000; // minutes
  energyBudget.currentEnergy = Math.min(energyBudget.maxEnergy, energyBudget.currentEnergy + elapsed * energyBudget.rechargeRate);
  energyBudget.lastRecharge = Date.now();
  if (energyBudget.currentEnergy < cost) return false;
  energyBudget.currentEnergy -= cost;
  return true;
}

export function getDreamEnergy(): { current: number; max: number; pct: number } {
  const elapsed = (Date.now() - energyBudget.lastRecharge) / 60_000;
  const current = Math.min(energyBudget.maxEnergy, energyBudget.currentEnergy + elapsed * energyBudget.rechargeRate);
  return { current: Math.round(current), max: energyBudget.maxEnergy, pct: Math.round((current / energyBudget.maxEnergy) * 100) };
}

// ─── 12. Synthesis Audit Trail ──────────────────────────────────────────────
interface SynthesisRecord { id: string; inputs: string[]; output: string; method: string; quality: number; timestamp: number; hash: string; }
const synthesisTrail: SynthesisRecord[] = [];
let lastSynthHash = '00000000';

export function recordSynthesis(inputs: string[], output: string, method: string, quality: number): string {
  const id = `syn_${Date.now()}`;
  const payload = `${lastSynthHash}|${inputs.join(',')}|${output.slice(0, 50)}|${method}`;
  let h = 0;
  for (let i = 0; i < payload.length; i++) h = ((h << 5) - h + payload.charCodeAt(i)) | 0;
  const hash = (h >>> 0).toString(16).padStart(8, '0');
  synthesisTrail.push({ id, inputs, output, method, quality, timestamp: Date.now(), hash });
  lastSynthHash = hash;
  if (synthesisTrail.length > 500) synthesisTrail.splice(0, synthesisTrail.length - 500);
  return hash;
}

export function getSynthesisTrail(limit = 50): SynthesisRecord[] {
  return synthesisTrail.slice(-limit);
}

// ─── 13. Dream Coherence Trend ──────────────────────────────────────────────
const coherenceScores: number[] = [];

export function recordCoherence(score: number): void {
  coherenceScores.push(score);
  if (coherenceScores.length > 100) coherenceScores.splice(0, coherenceScores.length - 100);
}

export function getCoherenceTrend(): { avg: number; trend: 'improving' | 'stable' | 'degrading'; recent: number } {
  if (coherenceScores.length < 2) return { avg: 1, trend: 'stable', recent: 1 };
  const avg = coherenceScores.reduce((a, b) => a + b, 0) / coherenceScores.length;
  const recentAvg = coherenceScores.slice(-10).reduce((a, b) => a + b, 0) / Math.min(10, coherenceScores.length);
  const trend = recentAvg > avg * 1.05 ? 'improving' : recentAvg < avg * 0.95 ? 'degrading' : 'stable';
  return { avg, trend, recent: recentAvg };
}

// ─── 14. Recombination Strategy Selector ────────────────────────────────────
type RecombStrategy = 'random' | 'weighted' | 'adversarial' | 'complementary' | 'evolutionary';
interface StrategyRecord { strategy: RecombStrategy; successRate: number; avgQuality: number; uses: number; }
const strategyRecords = new Map<RecombStrategy, StrategyRecord>();

export function recordStrategyOutcome(strategy: RecombStrategy, quality: number, success: boolean): void {
  const r = strategyRecords.get(strategy) ?? { strategy, successRate: 0.5, avgQuality: 0.5, uses: 0 };
  r.uses++;
  r.successRate = r.successRate * 0.9 + (success ? 0.1 : 0);
  r.avgQuality = r.avgQuality * 0.9 + quality * 0.1;
  strategyRecords.set(strategy, r);
}

export function selectBestStrategy(): RecombStrategy {
  let best: RecombStrategy = 'weighted'; let bestScore = -1;
  for (const [s, r] of strategyRecords) {
    const score = r.successRate * 0.6 + r.avgQuality * 0.4;
    if (score > bestScore) { bestScore = score; best = s; }
  }
  return best;
}

// ─── 15. Idle Cycle Detector ────────────────────────────────────────────────
interface IdleState { isIdle: boolean; idleSince: number; totalIdleMs: number; dreamCyclesTriggered: number; }
let idleState: IdleState = { isIdle: false, idleSince: 0, totalIdleMs: 0, dreamCyclesTriggered: 0 };

export function markIdle(): void {
  if (!idleState.isIdle) { idleState.isIdle = true; idleState.idleSince = Date.now(); }
}

export function markActive(): void {
  if (idleState.isIdle) { idleState.totalIdleMs += Date.now() - idleState.idleSince; idleState.isIdle = false; }
}

export function shouldTriggerDream(minIdleMs = 30_000): boolean {
  if (!idleState.isIdle) return false;
  return Date.now() - idleState.idleSince >= minIdleMs;
}

export function getIdleStats(): { isIdle: boolean; currentIdleMs: number; totalIdleMs: number; dreamCycles: number } {
  return {
    isIdle: idleState.isIdle,
    currentIdleMs: idleState.isIdle ? Date.now() - idleState.idleSince : 0,
    totalIdleMs: idleState.totalIdleMs,
    dreamCycles: idleState.dreamCyclesTriggered,
  };
}

// ─── 16. Dream Result Archiver ──────────────────────────────────────────────
interface ArchivedDream { id: string; chainId: string; result: unknown; quality: number; archivedAt: number; tags: string[]; }
const dreamArchive: ArchivedDream[] = [];
const MAX_ARCHIVE = 200;

export function archiveDream(chainId: string, result: unknown, quality: number, tags: string[]): string {
  const id = `arch_${Date.now()}`;
  dreamArchive.push({ id, chainId, result, quality, archivedAt: Date.now(), tags });
  if (dreamArchive.length > MAX_ARCHIVE) dreamArchive.splice(0, dreamArchive.length - MAX_ARCHIVE);
  return id;
}

export function searchArchive(tag: string): ArchivedDream[] {
  return dreamArchive.filter(d => d.tags.includes(tag));
}

export function getArchiveStats(): { total: number; avgQuality: number; topTags: Array<{ tag: string; count: number }> } {
  const tagCounts = new Map<string, number>();
  let totalQ = 0;
  for (const d of dreamArchive) {
    totalQ += d.quality;
    for (const t of d.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  }
  const topTags = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag, count]) => ({ tag, count }));
  return { total: dreamArchive.length, avgQuality: dreamArchive.length > 0 ? totalQ / dreamArchive.length : 0, topTags };
}

// ─── 17. Pattern Fusion Conflict Resolver ───────────────────────────────────
interface ConflictResolution { id: string; patterns: string[]; resolution: 'merge' | 'prefer_a' | 'prefer_b' | 'discard'; confidence: number; }

export function resolvePatternConflict(patternA: string, patternB: string, overlapRatio: number, qualityA: number, qualityB: number): ConflictResolution {
  const id = `cr_${Date.now()}`;
  let resolution: ConflictResolution['resolution'];
  let confidence: number;
  if (overlapRatio > 0.8) { resolution = 'merge'; confidence = overlapRatio; }
  else if (qualityA > qualityB * 1.5) { resolution = 'prefer_a'; confidence = qualityA; }
  else if (qualityB > qualityA * 1.5) { resolution = 'prefer_b'; confidence = qualityB; }
  else { resolution = 'discard'; confidence = 0.3; }
  return { id, patterns: [patternA, patternB], resolution, confidence };
}

// ─── 18. Dream Throttle (Backpressure) ──────────────────────────────────────
interface ThrottleState { windowMs: number; maxDreamsPerWindow: number; dreamsInWindow: number; windowStart: number; }
let throttle: ThrottleState = { windowMs: 60_000, maxDreamsPerWindow: 10, dreamsInWindow: 0, windowStart: Date.now() };

export function canDream(): boolean {
  if (Date.now() - throttle.windowStart > throttle.windowMs) {
    throttle.dreamsInWindow = 0;
    throttle.windowStart = Date.now();
  }
  return throttle.dreamsInWindow < throttle.maxDreamsPerWindow;
}

export function recordDreamExecution(): void {
  throttle.dreamsInWindow++;
}

export function configureDreamThrottle(maxPerMinute: number): void {
  throttle.maxDreamsPerWindow = maxPerMinute;
}

// ─── 19. Insight Promotion Pipeline ─────────────────────────────────────────
interface InsightCandidate { id: string; content: string; quality: number; promoted: boolean; promotedAt?: number; }
const insightPipeline: InsightCandidate[] = [];

export function submitInsight(content: string, quality: number): string {
  const id = `ins_${Date.now()}`;
  insightPipeline.push({ id, content, quality, promoted: false });
  if (insightPipeline.length > 100) insightPipeline.splice(0, insightPipeline.length - 100);
  return id;
}

export function promoteTopInsights(threshold = 0.7): InsightCandidate[] {
  const promoted: InsightCandidate[] = [];
  for (const ins of insightPipeline) {
    if (!ins.promoted && ins.quality >= threshold) {
      ins.promoted = true;
      ins.promotedAt = Date.now();
      promoted.push(ins);
    }
  }
  return promoted;
}

export function getInsightStats(): { total: number; promoted: number; promotionRate: number } {
  const promoted = insightPipeline.filter(i => i.promoted).length;
  return { total: insightPipeline.length, promoted, promotionRate: insightPipeline.length > 0 ? promoted / insightPipeline.length : 0 };
}

// ─── 20. Dream Sandbox Isolation ────────────────────────────────────────────
interface DreamSandbox { id: string; isolationLevel: 'strict' | 'permissive'; allowedDomains: string[]; memoryLimit: number; timeoutMs: number; }
const sandboxes = new Map<string, DreamSandbox>();
const MAX_SANDBOXES = 50;

export function createDreamSandbox(id: string, config?: Partial<DreamSandbox>): DreamSandbox {
  if (sandboxes.size >= MAX_SANDBOXES && !sandboxes.has(id)) {
    const oldest = sandboxes.keys().next().value;
    if (oldest) sandboxes.delete(oldest);
  }
  const sandbox: DreamSandbox = {
    id, isolationLevel: 'strict', allowedDomains: [], memoryLimit: 50_000, timeoutMs: 10_000,
    ...config,
  };
  sandboxes.set(id, sandbox);
  return sandbox;
}

export function validateSandboxAccess(sandboxId: string, domain: string): boolean {
  const s = sandboxes.get(sandboxId);
  if (!s) return false;
  if (s.isolationLevel === 'permissive') return true;
  return s.allowedDomains.includes(domain);
}

// ─── 21. Dream Replay Engine ────────────────────────────────────────────────
interface ReplayableChain { chainId: string; steps: DreamStep[]; originalQuality: number; replayCount: number; }
const replayRegistry = new Map<string, ReplayableChain>();
const MAX_REPLAYS = 50;

export function markForReplay(chainId: string, quality: number): void {
  const chain = dreamChains.get(chainId);
  if (!chain) return;
  if (replayRegistry.size >= MAX_REPLAYS && !replayRegistry.has(chainId)) {
    const oldest = replayRegistry.keys().next().value;
    if (oldest) replayRegistry.delete(oldest);
  }
  replayRegistry.set(chainId, { chainId, steps: [...chain], originalQuality: quality, replayCount: 0 });
}

export function replayDreamChain(chainId: string): DreamStep[] | null {
  const entry = replayRegistry.get(chainId);
  if (!entry) return null;
  entry.replayCount++;
  return [...entry.steps];
}

// ─── 22. Novelty Decay Tracker ──────────────────────────────────────────────
const noveltyScores = new Map<string, { score: number; recordedAt: number; decayRate: number }>();

export function recordNovelty(domain: string, score: number, decayRate = 0.01): void {
  noveltyScores.set(domain, { score, recordedAt: Date.now(), decayRate });
}

export function getDecayedNovelty(domain: string): number {
  const entry = noveltyScores.get(domain);
  if (!entry) return 0;
  const hoursElapsed = (Date.now() - entry.recordedAt) / 3_600_000;
  return Math.max(0, entry.score * Math.pow(1 - entry.decayRate, hoursElapsed));
}

// ─── 23. Dream Temperature Controller ──────────────────────────────────────
let temperature = 0.7; // creativity dial
const temperatureHistory: Array<{ value: number; timestamp: number }> = [];

export function setDreamTemperature(t: number): void {
  temperature = Math.max(0, Math.min(1, t));
  temperatureHistory.push({ value: temperature, timestamp: Date.now() });
  if (temperatureHistory.length > 100) temperatureHistory.splice(0, temperatureHistory.length - 100);
}

export function getDreamTemperature(): number { return temperature; }

export function getTemperatureHistory(): Array<{ value: number; timestamp: number }> {
  return [...temperatureHistory];
}

// ─── 24. Cross-Module Dream Feed ────────────────────────────────────────────
interface DreamFeedItem { source: string; content: string; priority: number; consumedBy: string[]; timestamp: number; }
const dreamFeed: DreamFeedItem[] = [];

export function publishToDreamFeed(source: string, content: string, priority = 5): void {
  dreamFeed.push({ source, content, priority, consumedBy: [], timestamp: Date.now() });
  dreamFeed.sort((a, b) => b.priority - a.priority);
  if (dreamFeed.length > 200) dreamFeed.splice(200);
}

export function consumeDreamFeed(consumer: string, limit = 10): DreamFeedItem[] {
  const available = dreamFeed.filter(f => !f.consumedBy.includes(consumer));
  const items = available.slice(0, limit);
  for (const item of items) item.consumedBy.push(consumer);
  return items;
}

// ─── 25. Dream Governance Gate ──────────────────────────────────────────────
interface GovernanceCheck { dreamId: string; allowed: boolean; reason?: string; checkedAt: number; }
const governanceChecks: GovernanceCheck[] = [];

export function checkDreamGovernance(dreamId: string, domains: string[], riskScore: number): GovernanceCheck {
  let allowed = true; let reason: string | undefined;
  if (riskScore > 0.8) { allowed = false; reason = 'risk_too_high'; }
  if (domains.length > 5) { allowed = false; reason = 'too_many_domains'; }
  const check: GovernanceCheck = { dreamId, allowed, reason, checkedAt: Date.now() };
  governanceChecks.push(check);
  if (governanceChecks.length > 200) governanceChecks.splice(0, governanceChecks.length - 200);
  return check;
}

export function getGovernanceStats(): { total: number; allowed: number; blocked: number; blockRate: number } {
  const blocked = governanceChecks.filter(c => !c.allowed).length;
  return { total: governanceChecks.length, allowed: governanceChecks.length - blocked, blocked, blockRate: governanceChecks.length > 0 ? blocked / governanceChecks.length : 0 };
}

// ─── 26. DREAM Health Composite ─────────────────────────────────────────────
export interface DreamHealthReport {
  grade: string;
  score: number;
  components: {
    chainIntegrity: number;
    coherenceTrend: number;
    hallucinationGuard: number;
    energyLevel: number;
    noveltyOutput: number;
    governanceCompliance: number;
  };
  timestamp: number;
}

export function calculateDreamHealth(): DreamHealthReport {
  const coherence = getCoherenceTrend();
  const hallRate = getHallucinationRate();
  const energy = getDreamEnergy();
  const gov = getGovernanceStats();
  const insights = getInsightStats();

  const components = {
    chainIntegrity: 0.9, // default high
    coherenceTrend: coherence.avg,
    hallucinationGuard: 1 - hallRate,
    energyLevel: energy.pct / 100,
    noveltyOutput: insights.promotionRate > 0 ? Math.min(1, insights.promotionRate * 2) : 0.5,
    governanceCompliance: gov.total > 0 ? 1 - gov.blockRate : 1.0,
  };

  const score = (
    components.chainIntegrity * 0.2 +
    components.coherenceTrend * 0.2 +
    components.hallucinationGuard * 0.2 +
    components.energyLevel * 0.1 +
    components.noveltyOutput * 0.15 +
    components.governanceCompliance * 0.15
  ) * 100;

  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 50 ? 'D' : 'F';
  return { grade, score: Math.round(score), components, timestamp: Date.now() };
}
