/**
 * Matrix Node Optimizations — CCR Sector
 * Nodes: SYSTEM, BRAIN, MEMORY, DREAM
 * 
 * SYSTEM: #3 Heal Latency Profiling, #4 Heal Priority Queueing
 * BRAIN:  #5 Reasoning Chain Caching, #6 Cognitive Load Shedding
 * MEMORY: #7 Hot-Tier Promotion Heuristics, #8 Memory Compaction Scheduling
 * DREAM:  #9 Dream Confidence Gating, #10 Dream Deduplication
 */

// ═══════════════════════════════════════
// SYSTEM — Heal Latency Profiling (#3)
// ═══════════════════════════════════════

export interface HealLatencyRecord {
  targetNode: string;
  durationMs: number;
  success: boolean;
  timestamp: number;
}

const healLatencyRecords: HealLatencyRecord[] = [];
const MAX_HEAL_RECORDS = 5000;

export function recordHealLatency(targetNode: string, durationMs: number, success: boolean): void {
  healLatencyRecords.push({ targetNode, durationMs, success, timestamp: Date.now() });
  if (healLatencyRecords.length > MAX_HEAL_RECORDS) healLatencyRecords.splice(0, healLatencyRecords.length - MAX_HEAL_RECORDS);
}

export function getHealLatencyProfile(targetNode?: string): {
  perNode: Array<{ node: string; avgMs: number; p95Ms: number; successRate: number; count: number }>;
  slowestNodes: string[];
  recommendedTimeouts: Record<string, number>;
} {
  const filtered = targetNode ? healLatencyRecords.filter(r => r.targetNode === targetNode) : healLatencyRecords;
  const byNode = new Map<string, HealLatencyRecord[]>();
  for (const r of filtered) {
    const arr = byNode.get(r.targetNode) ?? [];
    arr.push(r);
    byNode.set(r.targetNode, arr);
  }

  const perNode = Array.from(byNode.entries()).map(([node, records]) => {
    const durations = records.map(r => r.durationMs).sort((a, b) => a - b);
    return {
      node,
      avgMs: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
      p95Ms: durations[Math.floor(durations.length * 0.95)] ?? 0,
      successRate: records.filter(r => r.success).length / records.length,
      count: records.length,
    };
  }).sort((a, b) => b.avgMs - a.avgMs);

  const recommendedTimeouts: Record<string, number> = {};
  for (const p of perNode) {
    recommendedTimeouts[p.node] = Math.round(p.p95Ms * 1.5);
  }

  return { perNode, slowestNodes: perNode.slice(0, 3).map(p => p.node), recommendedTimeouts };
}

// ═══════════════════════════════════════
// SYSTEM — Heal Priority Queueing (#4)
// ═══════════════════════════════════════

export interface HealRequest {
  id: string;
  targetNode: string;
  priority: number; // higher = more urgent
  weightImpact: number;
  requestedAt: number;
  processedAt?: number;
}

const healQueue: HealRequest[] = [];
let healReqCounter = 0;

export function enqueueHealRequest(targetNode: string, nodeWeight: number, currentHealth: number): HealRequest {
  const priority = nodeWeight * (100 - currentHealth); // weight × degradation
  const req: HealRequest = {
    id: `heal_${++healReqCounter}`,
    targetNode,
    priority: Math.round(priority * 1000) / 1000,
    weightImpact: nodeWeight,
    requestedAt: Date.now(),
  };
  healQueue.push(req);
  healQueue.sort((a, b) => b.priority - a.priority);
  return req;
}

export function dequeueNextHeal(): HealRequest | null {
  const next = healQueue.find(r => !r.processedAt);
  if (next) next.processedAt = Date.now();
  return next ?? null;
}

export function getHealQueueState(): { pending: number; queue: HealRequest[] } {
  const pending = healQueue.filter(r => !r.processedAt);
  return { pending: pending.length, queue: pending.slice(0, 20) };
}

// ═══════════════════════════════════════
// BRAIN — Reasoning Chain Caching (#5)
// ═══════════════════════════════════════

interface CachedChain {
  inputHash: string;
  result: unknown;
  createdAt: number;
  hitCount: number;
  lastHitAt: number;
  ttlMs: number;
}

const chainCache = new Map<string, CachedChain>();
const MAX_CACHE = 500;
const DEFAULT_TTL = 5 * 60 * 1000; // 5 min

function hashInput(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) - h + input.charCodeAt(i)) | 0;
  }
  return `chain_${h.toString(36)}`;
}

export function getCachedChain(inputKey: string): unknown | null {
  const hash = hashInput(inputKey);
  const entry = chainCache.get(hash);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > entry.ttlMs) {
    chainCache.delete(hash);
    return null;
  }
  entry.hitCount++;
  entry.lastHitAt = Date.now();
  return entry.result;
}

export function cacheChain(inputKey: string, result: unknown, ttlMs: number = DEFAULT_TTL): void {
  const hash = hashInput(inputKey);
  if (chainCache.size >= MAX_CACHE) {
    // Evict least recently hit
    let oldest: string | null = null;
    let oldestTime = Infinity;
    for (const [k, v] of chainCache) {
      if (v.lastHitAt < oldestTime) { oldest = k; oldestTime = v.lastHitAt; }
    }
    if (oldest) chainCache.delete(oldest);
  }
  chainCache.set(hash, { inputHash: hash, result, createdAt: Date.now(), hitCount: 0, lastHitAt: Date.now(), ttlMs });
}

export function getChainCacheStats(): { size: number; hitRate: number; totalHits: number } {
  const entries = Array.from(chainCache.values());
  const totalHits = entries.reduce((s, e) => s + e.hitCount, 0);
  return { size: chainCache.size, hitRate: entries.length > 0 ? totalHits / (totalHits + entries.length) : 0, totalHits };
}

// ═══════════════════════════════════════
// BRAIN — Cognitive Load Shedding (#6)
// ═══════════════════════════════════════

export interface LoadSheddingState {
  currentLoad: number; // 0.0–1.0
  threshold: number;
  shedding: boolean;
  deferredCount: number;
  processedCount: number;
  lastUpdated: number;
}

const loadState: LoadSheddingState = {
  currentLoad: 0,
  threshold: 0.85,
  shedding: false,
  deferredCount: 0,
  processedCount: 0,
  lastUpdated: Date.now(),
};

export function updateCognitiveLoad(load: number): LoadSheddingState {
  loadState.currentLoad = Math.max(0, Math.min(1, load));
  loadState.shedding = loadState.currentLoad >= loadState.threshold;
  loadState.lastUpdated = Date.now();
  return { ...loadState };
}

export function shouldDeferTask(priority: 'critical' | 'high' | 'normal' | 'low'): boolean {
  if (!loadState.shedding) { loadState.processedCount++; return false; }
  if (priority === 'critical') { loadState.processedCount++; return false; }
  if (priority === 'high' && loadState.currentLoad < 0.95) { loadState.processedCount++; return false; }
  loadState.deferredCount++;
  return true;
}

export function getLoadSheddingState(): LoadSheddingState {
  return { ...loadState };
}

// ═══════════════════════════════════════
// MEMORY — Hot-Tier Promotion Heuristics (#7)
// ═══════════════════════════════════════

export interface PromotionCandidate {
  memoryId: string;
  currentTier: 'cold' | 'warm' | 'hot';
  accessCount: number;
  accessFrequency: number; // accesses per day
  recency: number; // ms since last access
  promotionScore: number;
  recommendedTier: 'cold' | 'warm' | 'hot';
}

const accessLog = new Map<string, { count: number; firstAccess: number; lastAccess: number; tier: 'cold' | 'warm' | 'hot' }>();

export function recordMemoryAccess(memoryId: string, currentTier: 'cold' | 'warm' | 'hot'): void {
  const entry = accessLog.get(memoryId) ?? { count: 0, firstAccess: Date.now(), lastAccess: Date.now(), tier: currentTier };
  entry.count++;
  entry.lastAccess = Date.now();
  entry.tier = currentTier;
  accessLog.set(memoryId, entry);
}

export function getPromotionCandidates(limit: number = 20): PromotionCandidate[] {
  const now = Date.now();
  const candidates: PromotionCandidate[] = [];

  for (const [memoryId, entry] of accessLog) {
    const spanDays = Math.max(1, (now - entry.firstAccess) / (24 * 60 * 60 * 1000));
    const accessFrequency = entry.count / spanDays;
    const recency = now - entry.lastAccess;
    // Score: weighted blend of frequency (70%) and recency (30%)
    const recencyScore = Math.max(0, 1 - recency / (7 * 24 * 60 * 60 * 1000)); // decays over 7 days
    const promotionScore = Math.round((accessFrequency * 0.7 + recencyScore * 0.3) * 1000) / 1000;

    let recommendedTier: 'cold' | 'warm' | 'hot' = 'cold';
    if (promotionScore > 0.6) recommendedTier = 'hot';
    else if (promotionScore > 0.3) recommendedTier = 'warm';

    if (recommendedTier !== entry.tier) {
      candidates.push({
        memoryId,
        currentTier: entry.tier,
        accessCount: entry.count,
        accessFrequency: Math.round(accessFrequency * 100) / 100,
        recency,
        promotionScore,
        recommendedTier,
      });
    }
  }

  return candidates.sort((a, b) => b.promotionScore - a.promotionScore).slice(0, limit);
}

// ═══════════════════════════════════════
// MEMORY — Compaction Scheduling (#8)
// ═══════════════════════════════════════

export interface CompactionWindow {
  startHour: number; // 0-23
  endHour: number;
  dayOfWeek?: number; // 0=Sun..6=Sat, undefined=daily
}

export interface CompactionSchedule {
  enabled: boolean;
  windows: CompactionWindow[];
  lastCompactionAt?: number;
  nextScheduledAt?: number;
  avgCompactionMs: number;
  compactionsRun: number;
}

const compactionSchedule: CompactionSchedule = {
  enabled: true,
  windows: [{ startHour: 2, endHour: 5 }], // Default: 2-5 AM
  avgCompactionMs: 0,
  compactionsRun: 0,
};

export function setCompactionWindows(windows: CompactionWindow[]): void {
  compactionSchedule.windows = windows;
}

export function isInCompactionWindow(): boolean {
  if (!compactionSchedule.enabled) return false;
  const now = new Date();
  const hour = now.getHours();
  const dow = now.getDay();
  return compactionSchedule.windows.some(w =>
    hour >= w.startHour && hour < w.endHour &&
    (w.dayOfWeek === undefined || w.dayOfWeek === dow)
  );
}

export function recordCompaction(durationMs: number): void {
  compactionSchedule.compactionsRun++;
  compactionSchedule.lastCompactionAt = Date.now();
  compactionSchedule.avgCompactionMs = Math.round(
    ((compactionSchedule.avgCompactionMs * (compactionSchedule.compactionsRun - 1)) + durationMs) / compactionSchedule.compactionsRun
  );
}

export function getCompactionSchedule(): CompactionSchedule {
  return { ...compactionSchedule };
}

// ═══════════════════════════════════════
// DREAM — Confidence Gating (#9)
// ═══════════════════════════════════════

export interface DreamInsight {
  id: string;
  content: string;
  confidence: number;
  source: string;
  gated: boolean;
  timestamp: number;
}

const dreamInsights: DreamInsight[] = [];
const MAX_INSIGHTS = 2000;
let insightCounter = 0;
let dreamConfidenceThreshold = 0.6;

export function setDreamConfidenceThreshold(threshold: number): void {
  dreamConfidenceThreshold = Math.max(0, Math.min(1, threshold));
}

export function gateDreamInsight(content: string, confidence: number, source: string): DreamInsight {
  const gated = confidence < dreamConfidenceThreshold;
  const insight: DreamInsight = {
    id: `dream_${++insightCounter}`,
    content,
    confidence: Math.round(confidence * 1000) / 1000,
    source,
    gated,
    timestamp: Date.now(),
  };
  dreamInsights.push(insight);
  if (dreamInsights.length > MAX_INSIGHTS) dreamInsights.splice(0, dreamInsights.length - MAX_INSIGHTS);
  return insight;
}

export function getGatedInsights(): DreamInsight[] {
  return dreamInsights.filter(i => i.gated).slice(-50);
}

export function getSurfacedInsights(): DreamInsight[] {
  return dreamInsights.filter(i => !i.gated).slice(-50);
}

export function getDreamGatingStats(): { total: number; surfaced: number; gated: number; gateRate: number; threshold: number } {
  const surfaced = dreamInsights.filter(i => !i.gated).length;
  return {
    total: dreamInsights.length,
    surfaced,
    gated: dreamInsights.length - surfaced,
    gateRate: dreamInsights.length > 0 ? (dreamInsights.length - surfaced) / dreamInsights.length : 0,
    threshold: dreamConfidenceThreshold,
  };
}

// ═══════════════════════════════════════
// DREAM — Deduplication (#10)
// ═══════════════════════════════════════

const dreamFingerprints = new Map<string, { originalId: string; count: number; lastSeen: number }>();

function fingerprintDream(content: string): string {
  // Normalize: lowercase, strip whitespace, take first 200 chars
  const normalized = content.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 200);
  let h = 0;
  for (let i = 0; i < normalized.length; i++) {
    h = ((h << 5) - h + normalized.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

export function isDreamDuplicate(content: string): { duplicate: boolean; originalId?: string; priorCount: number } {
  const fp = fingerprintDream(content);
  const existing = dreamFingerprints.get(fp);
  if (existing) {
    existing.count++;
    existing.lastSeen = Date.now();
    return { duplicate: true, originalId: existing.originalId, priorCount: existing.count };
  }
  return { duplicate: false, priorCount: 0 };
}

export function registerDreamFingerprint(insightId: string, content: string): void {
  const fp = fingerprintDream(content);
  if (!dreamFingerprints.has(fp)) {
    dreamFingerprints.set(fp, { originalId: insightId, count: 1, lastSeen: Date.now() });
  }
}

export function getDreamDedupStats(): { uniqueFingerprints: number; totalDuplicatesBlocked: number } {
  const entries = Array.from(dreamFingerprints.values());
  return {
    uniqueFingerprints: entries.length,
    totalDuplicatesBlocked: entries.reduce((s, e) => s + Math.max(0, e.count - 1), 0),
  };
}
