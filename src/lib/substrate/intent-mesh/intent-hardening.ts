/**
 * INTENT Field Hardening v2.0.0 — Codename "Navigator"
 * 27 enterprise-grade features for intent resolution, goal tracking, and context amplification
 *
 * Non-breaking additive layer — respects substrate core freeze
 */

export const INTENT_HARDENING_VERSION = '2.0.0';
export const INTENT_HARDENING_CODENAME = 'Navigator';

// ─── 1. Intent Resolution Audit Trail ──────────────────────────────────────
interface IntentResolution {
  id: string;
  rawInput: string;
  resolvedIntent: string;
  confidence: number;
  ts: number;
  amplified: boolean;
  sources: string[];
}

const resolutionTrail: IntentResolution[] = [];

export function recordResolution(rawInput: string, resolvedIntent: string, confidence: number, sources: string[] = []): string {
  const id = `ir_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  resolutionTrail.push({ id, rawInput: rawInput.slice(0, 200), resolvedIntent, confidence, ts: Date.now(), amplified: sources.length > 0, sources });
  if (resolutionTrail.length > 500) resolutionTrail.splice(0, resolutionTrail.length - 500);
  return id;
}

export function getResolutionTrail(limit = 20): IntentResolution[] {
  return resolutionTrail.slice(-limit);
}

export function getResolutionAccuracy(): number {
  if (resolutionTrail.length === 0) return 1;
  return resolutionTrail.reduce((s, r) => s + r.confidence, 0) / resolutionTrail.length;
}

// ─── 2. Goal Lifecycle Manager ─────────────────────────────────────────────
interface Goal {
  id: string;
  description: string;
  status: 'active' | 'completed' | 'abandoned' | 'stalled';
  progress: number;
  createdAt: number;
  updatedAt: number;
  milestones: string[];
  completedMilestones: string[];
}

const goals = new Map<string, Goal>();

export function createGoal(description: string, milestones: string[] = []): string {
  const id = `goal_${Date.now()}`;
  goals.set(id, { id, description, status: 'active', progress: 0, createdAt: Date.now(), updatedAt: Date.now(), milestones, completedMilestones: [] });
  return id;
}

export function updateGoalProgress(goalId: string, progress: number, completedMilestone?: string): void {
  const goal = goals.get(goalId);
  if (!goal) return;
  goal.progress = Math.max(0, Math.min(100, progress));
  goal.updatedAt = Date.now();
  if (completedMilestone && !goal.completedMilestones.includes(completedMilestone)) {
    goal.completedMilestones.push(completedMilestone);
  }
  if (goal.progress >= 100) goal.status = 'completed';
}

export function getActiveGoals(): Goal[] {
  return Array.from(goals.values()).filter(g => g.status === 'active');
}

export function getGoalStats(): { total: number; active: number; completed: number; abandoned: number; avgProgress: number } {
  const all = Array.from(goals.values());
  return {
    total: all.length,
    active: all.filter(g => g.status === 'active').length,
    completed: all.filter(g => g.status === 'completed').length,
    abandoned: all.filter(g => g.status === 'abandoned').length,
    avgProgress: all.length > 0 ? Math.round(all.reduce((s, g) => s + g.progress, 0) / all.length) : 0,
  };
}

// ─── 3. Context Amplification Metrics ──────────────────────────────────────
interface AmplificationEvent {
  ts: number;
  inputTokens: number;
  outputTokens: number;
  sourcesUsed: string[];
  enrichmentScore: number;
}

const amplificationEvents: AmplificationEvent[] = [];

export function recordAmplification(inputTokens: number, outputTokens: number, sources: string[], enrichmentScore: number): void {
  amplificationEvents.push({ ts: Date.now(), inputTokens, outputTokens, sourcesUsed: sources, enrichmentScore });
  if (amplificationEvents.length > 500) amplificationEvents.splice(0, amplificationEvents.length - 500);
}

export function getAmplificationStats(): { avgEnrichment: number; avgSourcesUsed: number; totalAmplifications: number } {
  if (amplificationEvents.length === 0) return { avgEnrichment: 0, avgSourcesUsed: 0, totalAmplifications: 0 };
  return {
    avgEnrichment: amplificationEvents.reduce((s, a) => s + a.enrichmentScore, 0) / amplificationEvents.length,
    avgSourcesUsed: amplificationEvents.reduce((s, a) => s + a.sourcesUsed.length, 0) / amplificationEvents.length,
    totalAmplifications: amplificationEvents.length,
  };
}

// ─── 4. Intent Confidence Thresholds ───────────────────────────────────────
const CONFIDENCE_THRESHOLDS = { high: 0.85, medium: 0.6, low: 0.3 };

export function classifyConfidence(confidence: number): 'high' | 'medium' | 'low' | 'ambiguous' {
  if (confidence >= CONFIDENCE_THRESHOLDS.high) return 'high';
  if (confidence >= CONFIDENCE_THRESHOLDS.medium) return 'medium';
  if (confidence >= CONFIDENCE_THRESHOLDS.low) return 'low';
  return 'ambiguous';
}

export function getConfidenceDistribution(): Record<string, number> {
  const dist: Record<string, number> = { high: 0, medium: 0, low: 0, ambiguous: 0 };
  for (const r of resolutionTrail) dist[classifyConfidence(r.confidence)]++;
  return dist;
}

// ─── 5. Disambiguation Engine ──────────────────────────────────────────────
interface DisambiguationEvent {
  intentId: string;
  candidates: string[];
  selectedIndex: number;
  ts: number;
  strategy: 'context' | 'history' | 'user_clarification' | 'fallback';
}

const disambiguationEvents: DisambiguationEvent[] = [];

export function recordDisambiguation(intentId: string, candidates: string[], selectedIndex: number, strategy: DisambiguationEvent['strategy']): void {
  disambiguationEvents.push({ intentId, candidates, selectedIndex, ts: Date.now(), strategy });
  if (disambiguationEvents.length > 300) disambiguationEvents.splice(0, disambiguationEvents.length - 300);
}

export function getDisambiguationStats(): { total: number; byStrategy: Record<string, number>; avgCandidates: number } {
  if (disambiguationEvents.length === 0) return { total: 0, byStrategy: {}, avgCandidates: 0 };
  const byStrategy: Record<string, number> = {};
  for (const d of disambiguationEvents) byStrategy[d.strategy] = (byStrategy[d.strategy] ?? 0) + 1;
  return {
    total: disambiguationEvents.length,
    byStrategy,
    avgCandidates: disambiguationEvents.reduce((s, d) => s + d.candidates.length, 0) / disambiguationEvents.length,
  };
}

// ─── 6. Intent Routing Map ─────────────────────────────────────────────────
interface IntentRoute {
  pattern: string;
  targetModule: string;
  priority: number;
  hitCount: number;
}

const intentRoutes = new Map<string, IntentRoute>();

export function registerIntentRoute(pattern: string, targetModule: string, priority = 0): void {
  intentRoutes.set(pattern, { pattern, targetModule, priority, hitCount: 0 });
}

export function matchIntentRoute(input: string): IntentRoute | null {
  for (const [pattern, route] of intentRoutes.entries()) {
    if (input.toLowerCase().includes(pattern.toLowerCase())) {
      route.hitCount++;
      return route;
    }
  }
  return null;
}

export function getIntentRoutes(): IntentRoute[] {
  return Array.from(intentRoutes.values()).sort((a, b) => b.priority - a.priority);
}

// ─── 7. Session Context Tracker ────────────────────────────────────────────
interface SessionContext {
  sessionId: string;
  intentsResolved: number;
  goalsTracked: number;
  startedAt: number;
  lastActivityAt: number;
  contextDepth: number;
}

const sessions = new Map<string, SessionContext>();

export function getOrCreateSession(sessionId: string): SessionContext {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { sessionId, intentsResolved: 0, goalsTracked: 0, startedAt: Date.now(), lastActivityAt: Date.now(), contextDepth: 0 });
  }
  const session = sessions.get(sessionId)!;
  session.lastActivityAt = Date.now();
  return session;
}

export function incrementSessionIntents(sessionId: string): void {
  const session = getOrCreateSession(sessionId);
  session.intentsResolved++;
  session.contextDepth = Math.min(10, session.contextDepth + 1);
}

export function getSessionStats(): { activeSessions: number; avgIntentsPerSession: number; avgContextDepth: number } {
  const all = Array.from(sessions.values());
  const active = all.filter(s => Date.now() - s.lastActivityAt < 1800_000);
  return {
    activeSessions: active.length,
    avgIntentsPerSession: all.length > 0 ? all.reduce((s, a) => s + a.intentsResolved, 0) / all.length : 0,
    avgContextDepth: all.length > 0 ? all.reduce((s, a) => s + a.contextDepth, 0) / all.length : 0,
  };
}

// ─── 8. Intent Priority Scorer ─────────────────────────────────────────────
export function scoreIntentPriority(confidence: number, goalRelevance: number, userUrgency: number): number {
  return Math.round((confidence * 0.4 + goalRelevance * 0.35 + userUrgency * 0.25) * 100);
}

// ─── 9. Intent Cache (Memoization) ─────────────────────────────────────────
interface CachedIntent {
  key: string;
  resolvedIntent: string;
  confidence: number;
  cachedAt: number;
  hitCount: number;
}

const intentCache = new Map<string, CachedIntent>();
const CACHE_TTL_MS = 600_000; // 10min

export function cacheIntent(key: string, resolvedIntent: string, confidence: number): void {
  intentCache.set(key, { key, resolvedIntent, confidence, cachedAt: Date.now(), hitCount: 0 });
  if (intentCache.size > 500) {
    const oldest = Array.from(intentCache.entries()).sort((a, b) => a[1].cachedAt - b[1].cachedAt)[0];
    if (oldest) intentCache.delete(oldest[0]);
  }
}

export function getCachedIntent(key: string): CachedIntent | null {
  const entry = intentCache.get(key);
  if (!entry || Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    if (entry) intentCache.delete(key);
    return null;
  }
  entry.hitCount++;
  return entry;
}

export function getIntentCacheStats(): { size: number; totalHits: number; hitRate: number } {
  const entries = Array.from(intentCache.values());
  const totalHits = entries.reduce((s, e) => s + e.hitCount, 0);
  return { size: entries.length, totalHits, hitRate: entries.length > 0 ? totalHits / Math.max(1, entries.length) : 0 };
}

// ─── 10. Personality Context Injector ──────────────────────────────────────
interface PersonalityProfile {
  traits: Record<string, number>;
  communicationStyle: string;
  updatedAt: number;
}

let activePersonality: PersonalityProfile = { traits: {}, communicationStyle: 'neutral', updatedAt: Date.now() };

export function setPersonalityProfile(traits: Record<string, number>, style: string): void {
  activePersonality = { traits, communicationStyle: style, updatedAt: Date.now() };
}

export function getPersonalityProfile(): PersonalityProfile {
  return { ...activePersonality };
}

// ─── 11. Intent Conflict Detector ──────────────────────────────────────────
interface IntentConflict {
  intentA: string;
  intentB: string;
  conflictType: 'contradictory' | 'redundant' | 'competing';
  detectedAt: number;
  resolved: boolean;
}

const intentConflicts: IntentConflict[] = [];

export function reportIntentConflict(intentA: string, intentB: string, conflictType: IntentConflict['conflictType']): void {
  intentConflicts.push({ intentA, intentB, conflictType, detectedAt: Date.now(), resolved: false });
  if (intentConflicts.length > 200) intentConflicts.splice(0, intentConflicts.length - 200);
}

export function getIntentConflicts(): IntentConflict[] {
  return [...intentConflicts];
}

export function getUnresolvedConflicts(): number {
  return intentConflicts.filter(c => !c.resolved).length;
}

// ─── 12. Feedback Loop Tracker ─────────────────────────────────────────────
interface FeedbackEvent {
  intentId: string;
  rating: 'positive' | 'negative' | 'neutral';
  ts: number;
}

const feedbackEvents: FeedbackEvent[] = [];

export function recordIntentFeedback(intentId: string, rating: FeedbackEvent['rating']): void {
  feedbackEvents.push({ intentId, rating, ts: Date.now() });
  if (feedbackEvents.length > 500) feedbackEvents.splice(0, feedbackEvents.length - 500);
}

export function getFeedbackStats(): { total: number; positiveRate: number; negativeRate: number } {
  if (feedbackEvents.length === 0) return { total: 0, positiveRate: 0, negativeRate: 0 };
  return {
    total: feedbackEvents.length,
    positiveRate: feedbackEvents.filter(f => f.rating === 'positive').length / feedbackEvents.length,
    negativeRate: feedbackEvents.filter(f => f.rating === 'negative').length / feedbackEvents.length,
  };
}

// ─── 13. Intent Latency Tracker ────────────────────────────────────────────
const resolutionLatencies: number[] = [];

export function recordResolutionLatency(ms: number): void {
  resolutionLatencies.push(ms);
  if (resolutionLatencies.length > 500) resolutionLatencies.splice(0, resolutionLatencies.length - 500);
}

export function getResolutionLatencyStats(): { avg: number; p95: number; min: number; max: number } {
  if (resolutionLatencies.length === 0) return { avg: 0, p95: 0, min: 0, max: 0 };
  const sorted = [...resolutionLatencies].sort((a, b) => a - b);
  return {
    avg: Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length),
    p95: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

// ─── 14. Multi-Turn Context Window ─────────────────────────────────────────
interface ContextWindow {
  turns: Array<{ role: string; content: string; ts: number }>;
  maxTurns: number;
}

const contextWindows = new Map<string, ContextWindow>();

export function addToContextWindow(sessionId: string, role: string, content: string, maxTurns = 20): void {
  if (!contextWindows.has(sessionId)) contextWindows.set(sessionId, { turns: [], maxTurns });
  const window = contextWindows.get(sessionId)!;
  window.turns.push({ role, content: content.slice(0, 500), ts: Date.now() });
  if (window.turns.length > window.maxTurns) window.turns.splice(0, window.turns.length - window.maxTurns);
}

export function getContextWindow(sessionId: string): ContextWindow | null {
  return contextWindows.get(sessionId) ?? null;
}

export function getContextWindowDepth(sessionId: string): number {
  return contextWindows.get(sessionId)?.turns.length ?? 0;
}

// ─── 15. Source Attribution Tracker ────────────────────────────────────────
const sourceUsage: Record<string, number> = {};

export function recordSourceUsage(source: string): void {
  sourceUsage[source] = (sourceUsage[source] ?? 0) + 1;
}

export function getSourceUsageStats(): Record<string, number> {
  return { ...sourceUsage };
}

// ─── 16. Intent Taxonomy Mapper ────────────────────────────────────────────
interface TaxonomyNode {
  category: string;
  subcategories: string[];
  intentCount: number;
}

const taxonomy = new Map<string, TaxonomyNode>();

export function mapIntentToTaxonomy(category: string, subcategory: string): void {
  if (!taxonomy.has(category)) taxonomy.set(category, { category, subcategories: [], intentCount: 0 });
  const node = taxonomy.get(category)!;
  if (!node.subcategories.includes(subcategory)) node.subcategories.push(subcategory);
  node.intentCount++;
}

export function getTaxonomy(): TaxonomyNode[] {
  return Array.from(taxonomy.values());
}

// ─── 17. Ambiguity Score Calculator ────────────────────────────────────────
export function calculateAmbiguityScore(candidates: number, topConfidence: number, secondConfidence: number): number {
  if (candidates <= 1) return 0;
  const margin = topConfidence - secondConfidence;
  return Math.round(Math.max(0, 1 - margin) * 100);
}

// ─── 18. Intent Deduplication ──────────────────────────────────────────────
const recentIntentHashes = new Set<string>();

function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

export function isDuplicateIntent(input: string): boolean {
  const hash = simpleHash(input.toLowerCase().trim());
  if (recentIntentHashes.has(hash)) return true;
  recentIntentHashes.add(hash);
  if (recentIntentHashes.size > 500) {
    const iter = recentIntentHashes.values();
    for (let i = 0; i < 100; i++) iter.next();
  }
  return false;
}

// ─── 19. Goal Dependency Graph ─────────────────────────────────────────────
const goalDependencies = new Map<string, string[]>();

export function addGoalDependency(goalId: string, dependsOn: string): void {
  const deps = goalDependencies.get(goalId) ?? [];
  if (!deps.includes(dependsOn)) deps.push(dependsOn);
  goalDependencies.set(goalId, deps);
}

export function getGoalDependencies(goalId: string): string[] {
  return goalDependencies.get(goalId) ?? [];
}

export function canProceedWithGoal(goalId: string): boolean {
  const deps = getGoalDependencies(goalId);
  for (const dep of deps) {
    const goal = goals.get(dep);
    if (!goal || goal.status !== 'completed') return false;
  }
  return true;
}

// ─── 20. Intent Throughput Monitor ─────────────────────────────────────────
const throughputTimestamps: number[] = [];

export function recordIntentProcessed(): void {
  throughputTimestamps.push(Date.now());
  if (throughputTimestamps.length > 1000) throughputTimestamps.splice(0, throughputTimestamps.length - 1000);
}

export function getIntentThroughput(windowMs = 60_000): number {
  return throughputTimestamps.filter(t => Date.now() - t < windowMs).length;
}

// ─── 21. Fallback Strategy Logger ──────────────────────────────────────────
interface FallbackEvent {
  intentId: string;
  fallbackType: 'default_intent' | 'user_prompt' | 'nearest_match' | 'abort';
  ts: number;
}

const fallbackEvents: FallbackEvent[] = [];

export function recordFallback(intentId: string, fallbackType: FallbackEvent['fallbackType']): void {
  fallbackEvents.push({ intentId, fallbackType, ts: Date.now() });
  if (fallbackEvents.length > 300) fallbackEvents.splice(0, fallbackEvents.length - 300);
}

export function getFallbackRate(): number {
  const total = resolutionTrail.length;
  if (total === 0) return 0;
  return fallbackEvents.length / total;
}

export function getFallbackStats(): { total: number; byType: Record<string, number> } {
  const byType: Record<string, number> = {};
  for (const f of fallbackEvents) byType[f.fallbackType] = (byType[f.fallbackType] ?? 0) + 1;
  return { total: fallbackEvents.length, byType };
}

// ─── 22. Historical Pattern Learner ────────────────────────────────────────
interface IntentPattern {
  pattern: string;
  frequency: number;
  avgConfidence: number;
  lastSeen: number;
}

const learnedPatterns = new Map<string, IntentPattern>();

export function learnIntentPattern(pattern: string, confidence: number): void {
  const existing = learnedPatterns.get(pattern);
  if (existing) {
    existing.frequency++;
    existing.avgConfidence = (existing.avgConfidence * (existing.frequency - 1) + confidence) / existing.frequency;
    existing.lastSeen = Date.now();
  } else {
    learnedPatterns.set(pattern, { pattern, frequency: 1, avgConfidence: confidence, lastSeen: Date.now() });
  }
}

export function getLearnedPatterns(): IntentPattern[] {
  return Array.from(learnedPatterns.values()).sort((a, b) => b.frequency - a.frequency);
}

// ─── 23. Intent Governance Gate ────────────────────────────────────────────
interface GovernanceDecision {
  intentId: string;
  allowed: boolean;
  reason: string;
  ts: number;
}

const governanceDecisions: GovernanceDecision[] = [];

export function recordGovernanceDecision(intentId: string, allowed: boolean, reason: string): void {
  governanceDecisions.push({ intentId, allowed, reason, ts: Date.now() });
  if (governanceDecisions.length > 500) governanceDecisions.splice(0, governanceDecisions.length - 500);
}

export function getGovernanceStats(): { total: number; blockedRate: number; topBlockReasons: Array<{ reason: string; count: number }> } {
  if (governanceDecisions.length === 0) return { total: 0, blockedRate: 0, topBlockReasons: [] };
  const blocked = governanceDecisions.filter(d => !d.allowed);
  const reasonCounts: Record<string, number> = {};
  for (const d of blocked) reasonCounts[d.reason] = (reasonCounts[d.reason] ?? 0) + 1;
  return {
    total: governanceDecisions.length,
    blockedRate: blocked.length / governanceDecisions.length,
    topBlockReasons: Object.entries(reasonCounts).map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count).slice(0, 5),
  };
}

// ─── 24. Cross-Module Signal Aggregator ────────────────────────────────────
const moduleSignals: Array<{ module: string; signal: string; weight: number; ts: number }> = [];

export function ingestModuleSignal(module: string, signal: string, weight: number): void {
  moduleSignals.push({ module, signal, weight, ts: Date.now() });
  if (moduleSignals.length > 500) moduleSignals.splice(0, moduleSignals.length - 500);
}

export function getSignalAggregation(): Record<string, { totalWeight: number; signalCount: number }> {
  const agg: Record<string, { totalWeight: number; signalCount: number }> = {};
  for (const s of moduleSignals) {
    if (!agg[s.module]) agg[s.module] = { totalWeight: 0, signalCount: 0 };
    agg[s.module].totalWeight += s.weight;
    agg[s.module].signalCount++;
  }
  return agg;
}

// ─── 25. Intent Replay Buffer ──────────────────────────────────────────────
const replayBuffer: Array<{ input: string; resolvedIntent: string; ts: number }> = [];

export function addToReplayBuffer(input: string, resolvedIntent: string): void {
  replayBuffer.push({ input: input.slice(0, 200), resolvedIntent, ts: Date.now() });
  if (replayBuffer.length > 200) replayBuffer.splice(0, replayBuffer.length - 200);
}

export function getReplayBuffer(limit = 20): Array<{ input: string; resolvedIntent: string; ts: number }> {
  return replayBuffer.slice(-limit);
}

// ─── 26. Intent Mesh Permeation Monitor ────────────────────────────────────
interface MeshPermeation {
  sourceNode: string;
  targetNode: string;
  intentType: string;
  latencyMs: number;
  ts: number;
}

const meshPermeations: MeshPermeation[] = [];

export function recordMeshPermeation(sourceNode: string, targetNode: string, intentType: string, latencyMs: number): void {
  meshPermeations.push({ sourceNode, targetNode, intentType, latencyMs, ts: Date.now() });
  if (meshPermeations.length > 500) meshPermeations.splice(0, meshPermeations.length - 500);
}

export function getMeshPermeationStats(): { totalPermeations: number; avgLatencyMs: number; uniquePaths: number } {
  if (meshPermeations.length === 0) return { totalPermeations: 0, avgLatencyMs: 0, uniquePaths: 0 };
  const paths = new Set(meshPermeations.map(p => `${p.sourceNode}->${p.targetNode}`));
  return {
    totalPermeations: meshPermeations.length,
    avgLatencyMs: Math.round(meshPermeations.reduce((s, p) => s + p.latencyMs, 0) / meshPermeations.length),
    uniquePaths: paths.size,
  };
}

// ─── 27. Intent Health Composite ───────────────────────────────────────────
export interface IntentHealthReport {
  grade: string;
  score: number;
  factors: {
    resolutionAccuracy: number;
    goalCompletionRate: number;
    amplificationQuality: number;
    feedbackPositivity: number;
    latencyHealth: number;
    conflictFreeness: number;
  };
}

export function calculateIntentHealth(): IntentHealthReport {
  const accuracy = getResolutionAccuracy();
  const goalStats = getGoalStats();
  const ampStats = getAmplificationStats();
  const fbStats = getFeedbackStats();
  const latencyStats = getResolutionLatencyStats();
  const conflicts = getUnresolvedConflicts();

  const resolutionAccuracy = Math.round(accuracy * 100);
  const goalCompletionRate = goalStats.total > 0 ? Math.round((goalStats.completed / goalStats.total) * 100) : 100;
  const amplificationQuality = Math.round((ampStats.avgEnrichment || 1) * 100);
  const feedbackPositivity = fbStats.total > 0 ? Math.round(fbStats.positiveRate * 100) : 100;
  const latencyHealth = latencyStats.p95 < 100 ? 100 : latencyStats.p95 < 500 ? 80 : latencyStats.p95 < 1000 ? 60 : 40;
  const conflictFreeness = Math.max(0, 100 - conflicts * 10);

  const score = Math.round(
    resolutionAccuracy * 0.25 +
    goalCompletionRate * 0.15 +
    amplificationQuality * 0.15 +
    feedbackPositivity * 0.15 +
    latencyHealth * 0.15 +
    conflictFreeness * 0.15
  );

  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';

  return {
    grade, score,
    factors: { resolutionAccuracy, goalCompletionRate, amplificationQuality, feedbackPositivity, latencyHealth, conflictFreeness },
  };
}
