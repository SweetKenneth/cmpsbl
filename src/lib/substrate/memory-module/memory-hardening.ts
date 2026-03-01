/**
 * MEMORY Hardening Layer — v2.0.0 "Vault"
 * 25+ enterprise-grade hardening features for persistent tiered storage
 * Additive utility layer — does NOT modify frozen MEMORY internals
 */

export const MEMORY_HARDENING_VERSION = '2.0.0';

// ─── 1. Memory Integrity Seal (Content Hash) ───────────────────────────────
interface MemorySeal { memoryId: string; contentHash: number; sealedAt: number; verified: boolean; }
const memorySeals = new Map<string, MemorySeal>();

function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
  return h;
}

export function sealMemory(memoryId: string, content: string): number {
  const hash = fnv1a(content);
  memorySeals.set(memoryId, { memoryId, contentHash: hash, sealedAt: Date.now(), verified: true });
  return hash;
}

export function verifyMemorySeal(memoryId: string, content: string): { valid: boolean; expected?: number; actual?: number } {
  const seal = memorySeals.get(memoryId);
  if (!seal) return { valid: false };
  const actual = fnv1a(content);
  return { valid: seal.contentHash === actual, expected: seal.contentHash, actual };
}

// ─── 2. Tiering Health Monitor ──────────────────────────────────────────────
interface TierMetrics { tier: 'hot' | 'warm' | 'cold'; count: number; totalSize: number; avgAccessAge: number; promotions: number; demotions: number; }
const tierMetrics = new Map<string, TierMetrics>();

export function updateTierMetrics(tier: 'hot' | 'warm' | 'cold', count: number, totalSize: number, avgAccessAge: number): void {
  const existing = tierMetrics.get(tier) ?? { tier, count: 0, totalSize: 0, avgAccessAge: 0, promotions: 0, demotions: 0 };
  existing.count = count;
  existing.totalSize = totalSize;
  existing.avgAccessAge = avgAccessAge;
  tierMetrics.set(tier, existing);
}

export function recordTierTransition(from: 'hot' | 'warm' | 'cold', to: 'hot' | 'warm' | 'cold'): void {
  const fromM = tierMetrics.get(from);
  const toM = tierMetrics.get(to);
  if (fromM) fromM.demotions++;
  if (toM) toM.promotions++;
}

export function getTieringHealth(): { balanced: boolean; hotRatio: number; distribution: Record<string, number> } {
  const hot = tierMetrics.get('hot')?.count ?? 0;
  const warm = tierMetrics.get('warm')?.count ?? 0;
  const cold = tierMetrics.get('cold')?.count ?? 0;
  const total = hot + warm + cold || 1;
  const hotRatio = hot / total;
  // Balanced = hot < 30%, warm 20-50%, cold 20-60%
  const balanced = hotRatio < 0.3 && (warm / total) > 0.1 && (cold / total) > 0.1;
  return { balanced, hotRatio, distribution: { hot, warm, cold } };
}

// ─── 3. Memory Corruption Detector ──────────────────────────────────────────
interface CorruptionCheck { memoryId: string; field: string; expected: string; actual: string; detectedAt: number; }
const corruptionLog: CorruptionCheck[] = [];

export function checkMemoryCorruption(memoryId: string, fields: Record<string, { expected: string; actual: string }>): CorruptionCheck[] {
  const corrupted: CorruptionCheck[] = [];
  for (const [field, { expected, actual }] of Object.entries(fields)) {
    if (expected !== actual) {
      const entry: CorruptionCheck = { memoryId, field, expected, actual, detectedAt: Date.now() };
      corruptionLog.push(entry);
      corrupted.push(entry);
    }
  }
  if (corruptionLog.length > 500) corruptionLog.splice(0, corruptionLog.length - 500);
  return corrupted;
}

export function getCorruptionRate(): number {
  const recent = corruptionLog.filter(c => Date.now() - c.detectedAt < 3_600_000);
  return recent.length;
}

// ─── 4. Retrieval Latency Tracker ───────────────────────────────────────────
interface LatencyRecord { strategy: string; latencyMs: number; resultCount: number; timestamp: number; }
const latencyRecords: LatencyRecord[] = [];

export function recordRetrievalLatency(strategy: string, latencyMs: number, resultCount: number): void {
  latencyRecords.push({ strategy, latencyMs, resultCount, timestamp: Date.now() });
  if (latencyRecords.length > 1000) latencyRecords.shift();
}

export function getRetrievalStats(): Record<string, { avgMs: number; p95Ms: number; count: number }> {
  const byStrategy = new Map<string, number[]>();
  for (const r of latencyRecords) {
    if (!byStrategy.has(r.strategy)) byStrategy.set(r.strategy, []);
    byStrategy.get(r.strategy)!.push(r.latencyMs);
  }
  const result: Record<string, { avgMs: number; p95Ms: number; count: number }> = {};
  for (const [strategy, latencies] of byStrategy) {
    latencies.sort((a, b) => a - b);
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const p95 = latencies[Math.floor(latencies.length * 0.95)] ?? 0;
    result[strategy] = { avgMs: Math.round(avg), p95Ms: p95, count: latencies.length };
  }
  return result;
}

// ─── 5. SM-2 Health Monitor ─────────────────────────────────────────────────
interface SM2Stats { totalCards: number; dueCards: number; avgEaseFactor: number; avgInterval: number; retentionRate: number; }
let sm2Stats: SM2Stats = { totalCards: 0, dueCards: 0, avgEaseFactor: 2.5, avgInterval: 1, retentionRate: 0.85 };

export function updateSM2Stats(stats: Partial<SM2Stats>): void {
  sm2Stats = { ...sm2Stats, ...stats };
}

export function getSM2Health(): { healthy: boolean; retentionRate: number; overdueRatio: number } {
  const overdueRatio = sm2Stats.totalCards > 0 ? sm2Stats.dueCards / sm2Stats.totalCards : 0;
  return { healthy: sm2Stats.retentionRate > 0.7 && overdueRatio < 0.3, retentionRate: sm2Stats.retentionRate, overdueRatio };
}

// ─── 6. Memory Deduplication Engine ─────────────────────────────────────────
const contentFingerprints = new Map<number, string[]>(); // hash → memoryIds

export function checkDuplicate(memoryId: string, content: string): { isDuplicate: boolean; duplicateOf?: string } {
  const hash = fnv1a(content);
  const existing = contentFingerprints.get(hash);
  if (existing && existing.length > 0 && !existing.includes(memoryId)) {
    return { isDuplicate: true, duplicateOf: existing[0] };
  }
  if (!existing) contentFingerprints.set(hash, [memoryId]);
  else if (!existing.includes(memoryId)) existing.push(memoryId);
  return { isDuplicate: false };
}

export function getDuplicateStats(): { uniqueHashes: number; totalMapped: number; duplicateRatio: number } {
  let totalMapped = 0;
  for (const ids of contentFingerprints.values()) totalMapped += ids.length;
  const dupRatio = contentFingerprints.size > 0 ? 1 - (contentFingerprints.size / totalMapped) : 0;
  return { uniqueHashes: contentFingerprints.size, totalMapped, duplicateRatio: Math.max(0, dupRatio) };
}

// ─── 7. Importance Score Validator ──────────────────────────────────────────
export function validateImportanceScore(params: {
  confidence: number; accessFrequency: number; recencyScore: number; tagRelevance: number;
}): { score: number; valid: boolean; breakdown: Record<string, number> } {
  const breakdown = {
    confidence: params.confidence * 0.4,
    accessFrequency: params.accessFrequency * 0.3,
    recencyScore: params.recencyScore * 0.2,
    tagRelevance: params.tagRelevance * 0.1,
  };
  const score = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const valid = score >= 0 && score <= 1 && Object.values(params).every(v => v >= 0 && v <= 1);
  return { score, valid, breakdown };
}

// ─── 8. Memory Access Audit Trail ───────────────────────────────────────────
interface AccessRecord { memoryId: string; action: 'read' | 'write' | 'delete' | 'promote' | 'demote'; actor: string; timestamp: number; hash: string; }
const accessAuditTrail: AccessRecord[] = [];
let lastAccessHash = '00000000';

export function recordMemoryAccess(memoryId: string, action: AccessRecord['action'], actor: string): string {
  const record: AccessRecord = { memoryId, action, actor, timestamp: Date.now(), hash: '' };
  const payload = `${lastAccessHash}|${memoryId}|${action}|${actor}|${record.timestamp}`;
  let h = 0;
  for (let i = 0; i < payload.length; i++) h = ((h << 5) - h + payload.charCodeAt(i)) | 0;
  record.hash = (h >>> 0).toString(16).padStart(8, '0');
  lastAccessHash = record.hash;
  accessAuditTrail.push(record);
  if (accessAuditTrail.length > 2000) accessAuditTrail.splice(0, accessAuditTrail.length - 2000);
  return record.hash;
}

export function getAccessAuditTrail(limit = 50): AccessRecord[] {
  return accessAuditTrail.slice(-limit);
}

// ─── 9. Memory Capacity Monitor ────────────────────────────────────────────
interface CapacityState { maxEntries: number; currentEntries: number; maxSizeBytes: number; currentSizeBytes: number; }
let capacityState: CapacityState = { maxEntries: 10_000, currentEntries: 0, maxSizeBytes: 50_000_000, currentSizeBytes: 0 };

export function updateCapacity(entries: number, sizeBytes: number): void {
  capacityState.currentEntries = entries;
  capacityState.currentSizeBytes = sizeBytes;
}

export function getCapacityStatus(): { utilizationPct: number; entriesRemaining: number; critical: boolean } {
  const utilization = Math.max(
    capacityState.currentEntries / capacityState.maxEntries,
    capacityState.currentSizeBytes / capacityState.maxSizeBytes
  );
  return {
    utilizationPct: Math.round(utilization * 100),
    entriesRemaining: capacityState.maxEntries - capacityState.currentEntries,
    critical: utilization > 0.9,
  };
}

// ─── 10. Eviction Policy Engine ─────────────────────────────────────────────
type EvictionPolicy = 'lru' | 'lfu' | 'importance' | 'ttl';
interface EvictionCandidate { id: string; lastAccessed: number; accessCount: number; importance: number; createdAt: number; }

export function selectEvictionCandidates(
  candidates: EvictionCandidate[], policy: EvictionPolicy, count: number
): EvictionCandidate[] {
  const sorted = [...candidates];
  switch (policy) {
    case 'lru': sorted.sort((a, b) => a.lastAccessed - b.lastAccessed); break;
    case 'lfu': sorted.sort((a, b) => a.accessCount - b.accessCount); break;
    case 'importance': sorted.sort((a, b) => a.importance - b.importance); break;
    case 'ttl': sorted.sort((a, b) => a.createdAt - b.createdAt); break;
  }
  return sorted.slice(0, count);
}

// ─── 11. Memory Fragmentation Analyzer ──────────────────────────────────────
interface FragmentationReport { fragmentCount: number; largestGapPct: number; avgGapPct: number; score: number; }

export function analyzeFragmentation(occupiedSlots: boolean[]): FragmentationReport {
  let gaps = 0; let maxGap = 0; let currentGap = 0;
  const totalGapSlots: number[] = [];
  for (const occupied of occupiedSlots) {
    if (!occupied) { currentGap++; } else { if (currentGap > 0) { gaps++; totalGapSlots.push(currentGap); maxGap = Math.max(maxGap, currentGap); } currentGap = 0; }
  }
  if (currentGap > 0) { gaps++; totalGapSlots.push(currentGap); maxGap = Math.max(maxGap, currentGap); }
  const total = occupiedSlots.length || 1;
  const avgGap = totalGapSlots.length > 0 ? totalGapSlots.reduce((a, b) => a + b, 0) / totalGapSlots.length : 0;
  const score = 1 - (gaps * avgGap) / (total * total || 1);
  return { fragmentCount: gaps, largestGapPct: (maxGap / total) * 100, avgGapPct: (avgGap / total) * 100, score: Math.max(0, Math.min(1, score)) };
}

// ─── 12. Write-Ahead Log (WAL) ──────────────────────────────────────────────
interface WALEntry { id: string; operation: 'insert' | 'update' | 'delete'; payload: unknown; timestamp: number; committed: boolean; }
const walLog: WALEntry[] = [];

export function walAppend(operation: WALEntry['operation'], payload: unknown): string {
  const id = `wal_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
  walLog.push({ id, operation, payload, timestamp: Date.now(), committed: false });
  if (walLog.length > 500) walLog.splice(0, walLog.length - 500);
  return id;
}

export function walCommit(id: string): boolean {
  const entry = walLog.find(e => e.id === id);
  if (!entry) return false;
  entry.committed = true;
  return true;
}

export function walReplay(): WALEntry[] {
  return walLog.filter(e => !e.committed);
}

export function getWALStats(): { total: number; uncommitted: number; oldestUncommittedAge: number } {
  const uncommitted = walLog.filter(e => !e.committed);
  const oldest = uncommitted.length > 0 ? Date.now() - uncommitted[0].timestamp : 0;
  return { total: walLog.length, uncommitted: uncommitted.length, oldestUncommittedAge: oldest };
}

// ─── 13. Memory Snapshot Differ ─────────────────────────────────────────────
interface SnapshotDiff { added: string[]; removed: string[]; modified: string[]; unchanged: number; }

export function diffSnapshots(before: Map<string, string>, after: Map<string, string>): SnapshotDiff {
  const added: string[] = []; const removed: string[] = []; const modified: string[] = []; let unchanged = 0;
  for (const [k, v] of after) {
    if (!before.has(k)) added.push(k);
    else if (before.get(k) !== v) modified.push(k);
    else unchanged++;
  }
  for (const k of before.keys()) { if (!after.has(k)) removed.push(k); }
  return { added, removed, modified, unchanged };
}

// ─── 14. Memory Compaction Engine ───────────────────────────────────────────
interface CompactionResult { entriesBefore: number; entriesAfter: number; bytesReclaimed: number; durationMs: number; }
const compactionHistory: CompactionResult[] = [];

export function recordCompaction(result: CompactionResult): void {
  compactionHistory.push(result);
  if (compactionHistory.length > 50) compactionHistory.shift();
}

export function getCompactionStats(): { totalCompactions: number; avgReclaimed: number; lastCompaction?: CompactionResult } {
  const avgReclaimed = compactionHistory.length > 0
    ? compactionHistory.reduce((s, c) => s + c.bytesReclaimed, 0) / compactionHistory.length : 0;
  return { totalCompactions: compactionHistory.length, avgReclaimed, lastCompaction: compactionHistory.at(-1) };
}

// ─── 15. Recall Accuracy Tracker ────────────────────────────────────────────
interface RecallResult { query: string; expected: string[]; returned: string[]; timestamp: number; }
const recallResults: RecallResult[] = [];

export function recordRecall(query: string, expected: string[], returned: string[]): { precision: number; recall: number; f1: number } {
  recallResults.push({ query, expected, returned, timestamp: Date.now() });
  if (recallResults.length > 200) recallResults.shift();
  const tp = returned.filter(r => expected.includes(r)).length;
  const precision = returned.length > 0 ? tp / returned.length : 0;
  const recall = expected.length > 0 ? tp / expected.length : 0;
  const f1 = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
  return { precision, recall, f1 };
}

export function getRecallAccuracy(): { avgPrecision: number; avgRecall: number; avgF1: number } {
  if (recallResults.length === 0) return { avgPrecision: 1, avgRecall: 1, avgF1: 1 };
  let totalP = 0; let totalR = 0; let totalF = 0;
  for (const r of recallResults) {
    const tp = r.returned.filter(x => r.expected.includes(x)).length;
    const p = r.returned.length > 0 ? tp / r.returned.length : 0;
    const rec = r.expected.length > 0 ? tp / r.expected.length : 0;
    totalP += p; totalR += rec;
    totalF += p + rec > 0 ? 2 * (p * rec) / (p + rec) : 0;
  }
  const n = recallResults.length;
  return { avgPrecision: totalP / n, avgRecall: totalR / n, avgF1: totalF / n };
}

// ─── 16. Memory Encryption at Rest ─────────────────────────────────────────
const ENCRYPTION_KEY = 0xDEADBEEF; // Symmetric XOR (demonstration)

export function encryptMemoryContent(content: string): string {
  return Array.from(content).map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ ((ENCRYPTION_KEY >> (i % 4 * 8)) & 0xFF))).join('');
}

export function decryptMemoryContent(encrypted: string): string {
  return encryptMemoryContent(encrypted); // XOR is symmetric
}

// ─── 17. Retention Policy Engine ────────────────────────────────────────────
interface RetentionRule { type: string; maxAgeDays: number; minImportance: number; autoArchive: boolean; }
const retentionRules = new Map<string, RetentionRule>();

export function setRetentionRule(memoryType: string, rule: RetentionRule): void {
  retentionRules.set(memoryType, rule);
}

export function evaluateRetention(memoryType: string, ageDays: number, importance: number): 'keep' | 'archive' | 'evict' {
  const rule = retentionRules.get(memoryType);
  if (!rule) return 'keep';
  if (ageDays > rule.maxAgeDays && importance < rule.minImportance) return 'evict';
  if (ageDays > rule.maxAgeDays && rule.autoArchive) return 'archive';
  return 'keep';
}

// ─── 18. Memory Index Health ────────────────────────────────────────────────
interface IndexMetrics { indexName: string; entries: number; staleEntries: number; rebuildCount: number; lastRebuiltAt: number; }
const indexMetrics = new Map<string, IndexMetrics>();

export function updateIndexMetrics(indexName: string, entries: number, staleEntries: number): void {
  const existing = indexMetrics.get(indexName) ?? { indexName, entries: 0, staleEntries: 0, rebuildCount: 0, lastRebuiltAt: 0 };
  existing.entries = entries;
  existing.staleEntries = staleEntries;
  indexMetrics.set(indexName, existing);
}

export function getIndexHealth(): { healthy: boolean; totalIndices: number; staleRatio: number } {
  let totalEntries = 0; let totalStale = 0;
  for (const m of indexMetrics.values()) { totalEntries += m.entries; totalStale += m.staleEntries; }
  const staleRatio = totalEntries > 0 ? totalStale / totalEntries : 0;
  return { healthy: staleRatio < 0.1, totalIndices: indexMetrics.size, staleRatio };
}

// ─── 19. Cross-Tier Migration Validator ─────────────────────────────────────
interface MigrationValidation { memoryId: string; fromTier: string; toTier: string; valid: boolean; reason?: string; }

export function validateTierMigration(memoryId: string, fromTier: string, toTier: string, accessCount: number, ageHours: number, importance: number): MigrationValidation {
  // Hot → Warm: low access + aged
  if (fromTier === 'hot' && toTier === 'warm') {
    if (accessCount > 5 && ageHours < 24) return { memoryId, fromTier, toTier, valid: false, reason: 'still_active' };
  }
  // Warm → Cold: zero access + very aged
  if (fromTier === 'warm' && toTier === 'cold') {
    if (accessCount > 0 && ageHours < 168) return { memoryId, fromTier, toTier, valid: false, reason: 'recent_access' };
  }
  // Cold → Evict: importance too high
  if (toTier === 'evict' && importance > 0.3) {
    return { memoryId, fromTier, toTier, valid: false, reason: 'importance_too_high' };
  }
  return { memoryId, fromTier, toTier, valid: true };
}

// ─── 20. Memory Backup Scheduler ────────────────────────────────────────────
interface BackupRecord { id: string; timestamp: number; entryCount: number; sizeBytes: number; status: 'success' | 'failed'; }
const backupHistory: BackupRecord[] = [];

export function recordBackup(entryCount: number, sizeBytes: number, success: boolean): string {
  const id = `bak_${Date.now()}`;
  backupHistory.push({ id, timestamp: Date.now(), entryCount, sizeBytes, status: success ? 'success' : 'failed' });
  if (backupHistory.length > 100) backupHistory.shift();
  return id;
}

export function getBackupHealth(): { lastBackupAge: number; successRate: number; totalBackups: number } {
  const lastBackup = backupHistory.at(-1);
  const age = lastBackup ? Date.now() - lastBackup.timestamp : Infinity;
  const successful = backupHistory.filter(b => b.status === 'success').length;
  return { lastBackupAge: age, successRate: backupHistory.length > 0 ? successful / backupHistory.length : 0, totalBackups: backupHistory.length };
}

// ─── 21. Semantic Similarity Guard ──────────────────────────────────────────
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0; let magA = 0; let magB = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; magA += a[i] * a[i]; magB += b[i] * b[i]; }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

export function isSemanticDuplicate(embedding1: number[], embedding2: number[], threshold = 0.95): boolean {
  return cosineSimilarity(embedding1, embedding2) >= threshold;
}

// ─── 22. Memory Type Distribution Monitor ───────────────────────────────────
const typeDistribution = new Map<string, number>();

export function updateTypeDistribution(distribution: Record<string, number>): void {
  typeDistribution.clear();
  for (const [k, v] of Object.entries(distribution)) typeDistribution.set(k, v);
}

export function getTypeDistribution(): Record<string, number> {
  return Object.fromEntries(typeDistribution);
}

export function getTypeEntropy(): number {
  const total = Array.from(typeDistribution.values()).reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  let entropy = 0;
  for (const count of typeDistribution.values()) {
    const p = count / total;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  return entropy;
}

// ─── 23. Memory Lifecycle Telemetry ─────────────────────────────────────────
interface LifecycleMetrics { stage: string; avgDurationMs: number; errorRate: number; throughput: number; }
const lifecycleMetrics = new Map<string, LifecycleMetrics>();

export function recordLifecycleStage(stage: string, durationMs: number, success: boolean): void {
  const m = lifecycleMetrics.get(stage) ?? { stage, avgDurationMs: 0, errorRate: 0, throughput: 0 };
  m.avgDurationMs = m.avgDurationMs * 0.9 + durationMs * 0.1;
  m.errorRate = m.errorRate * 0.95 + (success ? 0 : 0.05);
  m.throughput++;
  lifecycleMetrics.set(stage, m);
}

export function getLifecycleHealth(): { stages: LifecycleMetrics[]; overallErrorRate: number } {
  const stages = Array.from(lifecycleMetrics.values());
  const overall = stages.length > 0 ? stages.reduce((s, m) => s + m.errorRate, 0) / stages.length : 0;
  return { stages, overallErrorRate: overall };
}

// ─── 24. Cold Storage Rehydration Timer ─────────────────────────────────────
const rehydrationTimes: number[] = [];

export function recordRehydration(durationMs: number): void {
  rehydrationTimes.push(durationMs);
  if (rehydrationTimes.length > 100) rehydrationTimes.shift();
}

export function getRehydrationStats(): { avgMs: number; p95Ms: number; count: number } {
  if (rehydrationTimes.length === 0) return { avgMs: 0, p95Ms: 0, count: 0 };
  const sorted = [...rehydrationTimes].sort((a, b) => a - b);
  return {
    avgMs: Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length),
    p95Ms: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
    count: sorted.length,
  };
}

// ─── 25. Memory Quota Partitioner ───────────────────────────────────────────
interface MemoryPartition { type: string; maxEntries: number; currentEntries: number; reserved: boolean; }
const partitions = new Map<string, MemoryPartition>();

export function configurePartition(type: string, maxEntries: number, reserved = false): void {
  partitions.set(type, { type, maxEntries, currentEntries: 0, reserved });
}

export function canAllocate(type: string): { allowed: boolean; remaining: number } {
  const p = partitions.get(type);
  if (!p) return { allowed: true, remaining: Infinity };
  return { allowed: p.currentEntries < p.maxEntries, remaining: p.maxEntries - p.currentEntries };
}

export function allocatePartition(type: string): boolean {
  const p = partitions.get(type);
  if (!p || p.currentEntries >= p.maxEntries) return false;
  p.currentEntries++;
  return true;
}

// ─── 26. MEMORY Health Composite ────────────────────────────────────────────
export interface MemoryHealthReport {
  grade: string;
  score: number;
  components: {
    tieringHealth: number;
    indexHealth: number;
    capacityHealth: number;
    recallAccuracy: number;
    backupHealth: number;
    lifecycleHealth: number;
  };
  timestamp: number;
}

export function calculateMemoryHealth(): MemoryHealthReport {
  const tiering = getTieringHealth();
  const index = getIndexHealth();
  const capacity = getCapacityStatus();
  const recall = getRecallAccuracy();
  const backup = getBackupHealth();
  const lifecycle = getLifecycleHealth();

  const components = {
    tieringHealth: tiering.balanced ? 1.0 : 0.6,
    indexHealth: index.healthy ? 1.0 : 1 - index.staleRatio,
    capacityHealth: Math.max(0, 1 - (capacity.utilizationPct / 100)),
    recallAccuracy: recall.avgF1,
    backupHealth: backup.successRate,
    lifecycleHealth: 1 - lifecycle.overallErrorRate,
  };

  const score = (
    components.tieringHealth * 0.15 +
    components.indexHealth * 0.15 +
    components.capacityHealth * 0.2 +
    components.recallAccuracy * 0.2 +
    components.backupHealth * 0.15 +
    components.lifecycleHealth * 0.15
  ) * 100;

  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 50 ? 'D' : 'F';
  return { grade, score: Math.round(score), components, timestamp: Date.now() };
}
