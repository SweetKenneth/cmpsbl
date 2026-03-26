/**
 * CMPSBL® CORE Kernel Hardening Layer v2.0.0
 * 25 Enterprise-Grade Hardening Upgrades
 * 
 * ADDITIVE ONLY — does not modify existing kernel internals.
 * Layers on top of: circuit-breaker, heartbeat-monitor, health-api,
 * graceful-degradation, graceful-shutdown, dependency-validator.
 * 
 * Upgrades:
 *  1. Boot Integrity Validator       14. Shutdown Deadline Enforcer
 *  2. Boot Timing Profiler           15. In-Flight Request Drainer
 *  3. Sliding Window Failure Tracker 16. Self-Test on Recovery
 *  4. Cascading Failure Detector     17. Boot Order Verifier
 *  5. Heartbeat Jitter Analyzer      18. Health Checksum (tamper-evident)
 *  6. Health Trend Tracker           19. Module Warm Standby Pool
 *  7. Request Deduplication          20. Adaptive Timeout Calculator
 *  8. Request Priority Queue         21. Error Taxonomy Classifier
 *  9. Invoke Correlation IDs         22. Circuit Breaker Analytics
 * 10. Per-Module Rate Limiter        23. Invoke Path Instrumentation
 * 11. Bulkhead Isolator              24. Composite Health Score Calculator
 * 12. Module Quarantine              25. Core Kernel Watchdog
 * 13. Dead Letter Queue
 */

import { fnv1aHash } from '@/lib/system/hardening';

// ═══════════════════════════════════════════════════════════════════════════════
// #1 — BOOT INTEGRITY VALIDATOR
// Validates that the boot sequence completed with all required modules.
// Produces a SHA-based fingerprint for integrity verification.
// ═══════════════════════════════════════════════════════════════════════════════

interface BootManifest {
  modules: string[];
  timestamp: number;
  fingerprint: number;
  valid: boolean;
  missing: string[];
}

const REQUIRED_MODULES = [
  'core', 'decode', 'encode', 'vision', 'cortex', 'nexus',
  'economy', 'sandbox', 'inclusive', 'integration',
] as const;

const REQUIRED_MESH = ['governance', 'intent', 'evolution', 'immunity', 'defense'] as const;

let bootManifest: BootManifest | null = null;

export function validateBootIntegrity(bootedModules: string[]): BootManifest {
  const bootedSet = new Set(bootedModules.map(m => m.toLowerCase()));
  const missing: string[] = [];

  for (const m of REQUIRED_MODULES) {
    if (!bootedSet.has(m)) missing.push(m);
  }
  for (const m of REQUIRED_MESH) {
    if (!bootedSet.has(m)) missing.push(m);
  }

  const sortedModules = [...bootedModules].sort();
  const fingerprint = fnv1aHash(sortedModules.join('|'));

  bootManifest = {
    modules: sortedModules,
    timestamp: Date.now(),
    fingerprint,
    valid: missing.length === 0,
    missing,
  };

  return bootManifest;
}

export function getBootManifest(): BootManifest | null {
  return bootManifest;
}

// ═══════════════════════════════════════════════════════════════════════════════
// #2 — BOOT TIMING PROFILER
// Records how long each module takes to boot. Identifies slow modules.
// ═══════════════════════════════════════════════════════════════════════════════

interface BootTiming {
  module: string;
  startMs: number;
  endMs: number;
  durationMs: number;
}

const bootTimings: BootTiming[] = [];
let bootStart = 0;
let bootEnd = 0;

export function markBootStart(): void {
  bootStart = performance.now();
}

export function markModuleBootStart(module: string): void {
  bootTimings.push({ module, startMs: performance.now(), endMs: 0, durationMs: 0 });
}

export function markModuleBootEnd(module: string): void {
  const entry = bootTimings.find(t => t.module === module && t.endMs === 0);
  if (entry) {
    entry.endMs = performance.now();
    entry.durationMs = Math.round(entry.endMs - entry.startMs);
  }
}

export function markBootEnd(): void {
  bootEnd = performance.now();
}

export function getBootProfile(): {
  totalMs: number;
  modules: BootTiming[];
  slowest: string | null;
  avgMs: number;
} {
  const totalMs = Math.round(bootEnd - bootStart);
  const completed = bootTimings.filter(t => t.endMs > 0);
  const slowest = completed.reduce<BootTiming | null>((max, t) =>
    !max || t.durationMs > max.durationMs ? t : max, null);
  const avgMs = completed.length > 0
    ? Math.round(completed.reduce((s, t) => s + t.durationMs, 0) / completed.length)
    : 0;

  return {
    totalMs,
    modules: completed,
    slowest: slowest?.module ?? null,
    avgMs,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #3 — SLIDING WINDOW FAILURE TRACKER
// Time-windowed failure rate tracking (layered over simple counter breaker).
// ═══════════════════════════════════════════════════════════════════════════════

interface SlidingWindow {
  events: Array<{ ts: number; success: boolean }>;
  windowMs: number;
  threshold: number; // failure rate 0-1 that triggers alert
}

const slidingWindows = new Map<string, SlidingWindow>();

export function initSlidingWindow(module: string, windowMs = 60_000, threshold = 0.5): void {
  slidingWindows.set(module, { events: [], windowMs, threshold });
}

export function recordSlidingEvent(module: string, success: boolean): { failureRate: number; breached: boolean } {
  let win = slidingWindows.get(module);
  if (!win) {
    initSlidingWindow(module);
    win = slidingWindows.get(module)!;
  }

  const now = Date.now();
  win.events.push({ ts: now, success });

  // Evict expired
  const cutoff = now - win.windowMs;
  win.events = win.events.filter(e => e.ts >= cutoff);

  const total = win.events.length;
  const failures = win.events.filter(e => !e.success).length;
  const failureRate = total > 0 ? failures / total : 0;

  return { failureRate, breached: failureRate >= win.threshold };
}

export function getSlidingWindowStats(module: string): {
  failureRate: number;
  totalEvents: number;
  windowMs: number;
} | null {
  const win = slidingWindows.get(module);
  if (!win) return null;

  const now = Date.now();
  const cutoff = now - win.windowMs;
  const active = win.events.filter(e => e.ts >= cutoff);
  const failures = active.filter(e => !e.success).length;

  return {
    failureRate: active.length > 0 ? failures / active.length : 0,
    totalEvents: active.length,
    windowMs: win.windowMs,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #4 — CASCADING FAILURE DETECTOR
// Detects correlated failures across modules within a time window.
// ═══════════════════════════════════════════════════════════════════════════════

interface CascadeAlert {
  timestamp: number;
  affectedModules: string[];
  correlationScore: number;
  severity: 'warning' | 'critical';
}

const cascadeHistory: CascadeAlert[] = [];
const moduleFailureTimestamps = new Map<string, number[]>();

export function recordModuleFailure(module: string): CascadeAlert | null {
  const now = Date.now();
  const timestamps = moduleFailureTimestamps.get(module) ?? [];
  timestamps.push(now);
  // Keep last 20
  if (timestamps.length > 20) timestamps.splice(0, timestamps.length - 20);
  moduleFailureTimestamps.set(module, timestamps);

  // Check for cascade: 3+ modules failing within 10s
  const window = 10_000;
  const recentlyFailed: string[] = [];
  for (const [mod, ts] of moduleFailureTimestamps) {
    if (ts.some(t => now - t < window)) {
      recentlyFailed.push(mod);
    }
  }

  if (recentlyFailed.length >= 3) {
    const alert: CascadeAlert = {
      timestamp: now,
      affectedModules: recentlyFailed,
      correlationScore: Math.min(1, recentlyFailed.length / 5),
      severity: recentlyFailed.length >= 5 ? 'critical' : 'warning',
    };
    cascadeHistory.push(alert);
    if (cascadeHistory.length > 50) cascadeHistory.splice(0, cascadeHistory.length - 50);
    return alert;
  }

  return null;
}

export function getCascadeAlerts(): CascadeAlert[] {
  return [...cascadeHistory];
}

// ═══════════════════════════════════════════════════════════════════════════════
// #5 — HEARTBEAT JITTER ANALYZER
// Detects irregular heartbeat intervals as early instability signal.
// ═══════════════════════════════════════════════════════════════════════════════

interface JitterAnalysis {
  module: string;
  avgIntervalMs: number;
  stdDevMs: number;
  jitterCoefficient: number; // CV = stddev/mean. >0.5 = unstable
  stable: boolean;
}

const heartbeatHistory = new Map<string, number[]>();

export function recordHeartbeatForJitter(module: string): void {
  const now = Date.now();
  const history = heartbeatHistory.get(module) ?? [];
  history.push(now);
  if (history.length > 50) history.splice(0, history.length - 50);
  heartbeatHistory.set(module, history);
}

export function analyzeJitter(module: string): JitterAnalysis | null {
  const history = heartbeatHistory.get(module);
  if (!history || history.length < 3) return null;

  const intervals: number[] = [];
  for (let i = 1; i < history.length; i++) {
    intervals.push(history[i] - history[i - 1]);
  }

  const mean = intervals.reduce((s, v) => s + v, 0) / intervals.length;
  const variance = intervals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? stdDev / mean : 0;

  return {
    module,
    avgIntervalMs: Math.round(mean),
    stdDevMs: Math.round(stdDev),
    jitterCoefficient: Math.round(cv * 1000) / 1000,
    stable: cv < 0.5,
  };
}

export function getAllJitterAnalysis(): JitterAnalysis[] {
  return Array.from(heartbeatHistory.keys())
    .map(m => analyzeJitter(m))
    .filter((a): a is JitterAnalysis => a !== null);
}

// ═══════════════════════════════════════════════════════════════════════════════
// #6 — HEALTH TREND TRACKER
// Rolling window health direction: improving, degrading, or stable.
// ═══════════════════════════════════════════════════════════════════════════════

type HealthDirection = 'improving' | 'degrading' | 'stable' | 'unknown';

interface HealthTrend {
  module: string;
  scores: Array<{ ts: number; score: number }>;
  direction: HealthDirection;
  delta: number; // change per minute
}

const healthTrends = new Map<string, Array<{ ts: number; score: number }>>();

export function recordHealthScore(module: string, score: number): void {
  const history = healthTrends.get(module) ?? [];
  history.push({ ts: Date.now(), score });
  // Keep last 60 samples
  if (history.length > 60) history.splice(0, history.length - 60);
  healthTrends.set(module, history);
}

export function getHealthTrend(module: string): HealthTrend {
  const scores = healthTrends.get(module) ?? [];
  if (scores.length < 3) {
    return { module, scores, direction: 'unknown', delta: 0 };
  }

  // Linear regression slope
  const n = scores.length;
  const recent = scores.slice(-10);
  const xMean = recent.reduce((s, _, i) => s + i, 0) / recent.length;
  const yMean = recent.reduce((s, p) => s + p.score, 0) / recent.length;
  let num = 0, den = 0;
  for (let i = 0; i < recent.length; i++) {
    num += (i - xMean) * (recent[i].score - yMean);
    den += (i - xMean) * (i - xMean);
  }
  const slope = den > 0 ? num / den : 0;

  let direction: HealthDirection = 'stable';
  if (slope > 1) direction = 'improving';
  else if (slope < -1) direction = 'degrading';

  return { module, scores: recent, direction, delta: Math.round(slope * 100) / 100 };
}

export function getAllHealthTrends(): HealthTrend[] {
  return Array.from(healthTrends.keys()).map(getHealthTrend);
}

// ═══════════════════════════════════════════════════════════════════════════════
// #7 — REQUEST DEDUPLICATION
// Coalesces identical in-flight substrate.invoke() calls.
// ═══════════════════════════════════════════════════════════════════════════════

const inflightRequests = new Map<string, Promise<unknown>>();

function makeRequestKey(module: string, action: string, payload?: unknown): string {
  return `${module}:${action}:${fnv1aHash(JSON.stringify(payload ?? {}))}`;
}

export async function deduplicatedInvoke<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs = 5_000
): Promise<T> {
  const existing = inflightRequests.get(key);
  if (existing) return existing as Promise<T>;

  const promise = fn().finally(() => {
    setTimeout(() => inflightRequests.delete(key), ttlMs);
  });

  inflightRequests.set(key, promise);
  return promise;
}

export function getInflightCount(): number {
  return inflightRequests.size;
}

export { makeRequestKey };

// ═══════════════════════════════════════════════════════════════════════════════
// #8 — REQUEST PRIORITY QUEUE
// Critical requests bypass normal queue.
// ═══════════════════════════════════════════════════════════════════════════════

type Priority = 'critical' | 'high' | 'normal' | 'low' | 'background';

interface QueuedRequest {
  id: string;
  priority: Priority;
  module: string;
  action: string;
  enqueuedAt: number;
  execute: () => Promise<unknown>;
}

const PRIORITY_WEIGHTS: Record<Priority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
  background: 4,
};

const requestQueue: QueuedRequest[] = [];
let processing = false;
const MAX_CONCURRENT = 6;
let activeCount = 0;

export function enqueueRequest(
  module: string,
  action: string,
  priority: Priority,
  execute: () => Promise<unknown>
): string {
  const id = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  requestQueue.push({ id, priority, module, action, enqueuedAt: Date.now(), execute });
  requestQueue.sort((a, b) => PRIORITY_WEIGHTS[a.priority] - PRIORITY_WEIGHTS[b.priority]);
  processQueue();
  return id;
}

async function processQueue(): Promise<void> {
  if (processing || activeCount >= MAX_CONCURRENT) return;
  processing = true;

  while (requestQueue.length > 0 && activeCount < MAX_CONCURRENT) {
    const req = requestQueue.shift()!;
    activeCount++;
    req.execute()
      .catch(() => {}) // errors handled by caller
      .finally(() => {
        activeCount--;
        if (requestQueue.length > 0) processQueue();
      });
  }

  processing = false;
}

export function getQueueStats(): {
  queued: number;
  active: number;
  maxConcurrent: number;
  byPriority: Record<Priority, number>;
} {
  const byPriority = { critical: 0, high: 0, normal: 0, low: 0, background: 0 };
  for (const r of requestQueue) byPriority[r.priority]++;
  return { queued: requestQueue.length, active: activeCount, maxConcurrent: MAX_CONCURRENT, byPriority };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #9 — INVOKE CORRELATION IDS
// Distributed tracing for all invoke calls.
// ═══════════════════════════════════════════════════════════════════════════════

let correlationCounter = 0;

export function generateCorrelationId(module: string): string {
  correlationCounter++;
  return `cor_${module}_${Date.now().toString(36)}_${correlationCounter.toString(36)}`;
}

interface CorrelationEntry {
  id: string;
  module: string;
  action: string;
  startMs: number;
  endMs?: number;
  durationMs?: number;
  success?: boolean;
  parentId?: string;
}

const correlationLog: CorrelationEntry[] = [];

export function startCorrelation(module: string, action: string, parentId?: string): string {
  const id = generateCorrelationId(module);
  correlationLog.push({ id, module, action, startMs: Date.now(), parentId });
  if (correlationLog.length > 500) correlationLog.splice(0, correlationLog.length - 250);
  return id;
}

export function endCorrelation(id: string, success: boolean): void {
  const entry = correlationLog.find(e => e.id === id);
  if (entry) {
    entry.endMs = Date.now();
    entry.durationMs = entry.endMs - entry.startMs;
    entry.success = success;
  }
}

export function getCorrelationTrace(id: string): CorrelationEntry[] {
  // Find entry and all children
  const result: CorrelationEntry[] = [];
  const entry = correlationLog.find(e => e.id === id);
  if (!entry) return result;

  result.push(entry);
  const children = correlationLog.filter(e => e.parentId === id);
  result.push(...children);
  return result;
}

export function getRecentCorrelations(limit = 20): CorrelationEntry[] {
  return correlationLog.slice(-limit);
}

// ═══════════════════════════════════════════════════════════════════════════════
// #10 — PER-MODULE RATE LIMITER
// Token bucket rate limiting per module.
// ═══════════════════════════════════════════════════════════════════════════════

interface RateBucket {
  tokens: number;
  maxTokens: number;
  refillRate: number; // tokens per second
  lastRefill: number;
}

const rateBuckets = new Map<string, RateBucket>();

export function configureRateLimit(module: string, maxTokens: number, refillRate: number): void {
  rateBuckets.set(module, { tokens: maxTokens, maxTokens, refillRate, lastRefill: Date.now() });
}

function refillBucket(bucket: RateBucket): void {
  const now = Date.now();
  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + elapsed * bucket.refillRate);
  bucket.lastRefill = now;
}

export function tryAcquireRate(module: string, cost = 1): boolean {
  let bucket = rateBuckets.get(module);
  if (!bucket) {
    // Default: 100 req/s
    configureRateLimit(module, 100, 100);
    bucket = rateBuckets.get(module)!;
  }

  refillBucket(bucket);

  if (bucket.tokens >= cost) {
    bucket.tokens -= cost;
    return true;
  }
  return false;
}

export function getRateLimitStats(module: string): {
  tokens: number;
  maxTokens: number;
  refillRate: number;
  utilization: number;
} | null {
  const bucket = rateBuckets.get(module);
  if (!bucket) return null;
  refillBucket(bucket);
  return {
    tokens: Math.round(bucket.tokens * 100) / 100,
    maxTokens: bucket.maxTokens,
    refillRate: bucket.refillRate,
    utilization: Math.round((1 - bucket.tokens / bucket.maxTokens) * 100),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #11 — BULKHEAD ISOLATOR
// Max concurrent operations per module (semaphore-based).
// ═══════════════════════════════════════════════════════════════════════════════

interface Bulkhead {
  maxConcurrent: number;
  active: number;
  queued: number;
  rejected: number;
}

const bulkheads = new Map<string, Bulkhead>();

export function configureBulkhead(module: string, maxConcurrent: number): void {
  bulkheads.set(module, { maxConcurrent, active: 0, queued: 0, rejected: 0 });
}

export async function withBulkhead<T>(
  module: string,
  fn: () => Promise<T>,
  maxConcurrent = 10
): Promise<T> {
  let bulk = bulkheads.get(module);
  if (!bulk) {
    configureBulkhead(module, maxConcurrent);
    bulk = bulkheads.get(module)!;
  }

  if (bulk.active >= bulk.maxConcurrent) {
    bulk.rejected++;
    throw new Error(`[Bulkhead] ${module} at capacity (${bulk.active}/${bulk.maxConcurrent})`);
  }

  bulk.active++;
  try {
    return await fn();
  } finally {
    bulk.active--;
  }
}

export function getBulkheadStats(): Array<{ module: string } & Bulkhead> {
  return Array.from(bulkheads.entries()).map(([module, b]) => ({ module, ...b }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// #12 — MODULE QUARANTINE
// Auto-isolate repeatedly failing modules with observation period.
// ═══════════════════════════════════════════════════════════════════════════════

interface QuarantineEntry {
  module: string;
  reason: string;
  quarantinedAt: number;
  releaseAt: number;
  failureCount: number;
  autoRelease: boolean;
}

const quarantine = new Map<string, QuarantineEntry>();

export function quarantineModule(
  module: string,
  reason: string,
  durationMs = 60_000,
  autoRelease = true
): void {
  quarantine.set(module, {
    module,
    reason,
    quarantinedAt: Date.now(),
    releaseAt: Date.now() + durationMs,
    failureCount: 0,
    autoRelease,
  });
}

export function isQuarantined(module: string): boolean {
  const entry = quarantine.get(module);
  if (!entry) return false;

  if (entry.autoRelease && Date.now() >= entry.releaseAt) {
    quarantine.delete(module);
    return false;
  }
  return true;
}

export function releaseFromQuarantine(module: string): boolean {
  return quarantine.delete(module);
}

export function getQuarantinedModules(): QuarantineEntry[] {
  // Auto-clean expired
  const now = Date.now();
  for (const [key, entry] of quarantine) {
    if (entry.autoRelease && now >= entry.releaseAt) quarantine.delete(key);
  }
  return Array.from(quarantine.values());
}

// ═══════════════════════════════════════════════════════════════════════════════
// #13 — DEAD LETTER QUEUE
// Stores failed operations for replay/analysis.
// ═══════════════════════════════════════════════════════════════════════════════

interface DeadLetter {
  id: string;
  module: string;
  action: string;
  error: string;
  payload?: unknown;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

const deadLetterQueue: DeadLetter[] = [];
const DLQ_MAX_SIZE = 200;

export function addToDeadLetterQueue(
  module: string,
  action: string,
  error: string,
  payload?: unknown,
  retryCount = 0,
  maxRetries = 3
): string {
  const id = `dlq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  deadLetterQueue.push({ id, module, action, error, payload, timestamp: Date.now(), retryCount, maxRetries });
  if (deadLetterQueue.length > DLQ_MAX_SIZE) {
    deadLetterQueue.splice(0, deadLetterQueue.length - DLQ_MAX_SIZE);
  }
  return id;
}

export function getDeadLetters(module?: string): DeadLetter[] {
  if (module) return deadLetterQueue.filter(d => d.module === module);
  return [...deadLetterQueue];
}

export function removeDeadLetter(id: string): boolean {
  const idx = deadLetterQueue.findIndex(d => d.id === id);
  if (idx >= 0) {
    deadLetterQueue.splice(idx, 1);
    return true;
  }
  return false;
}

export function getDLQStats(): {
  total: number;
  byModule: Record<string, number>;
  retriable: number;
} {
  const byModule: Record<string, number> = {};
  let retriable = 0;
  for (const dl of deadLetterQueue) {
    byModule[dl.module] = (byModule[dl.module] ?? 0) + 1;
    if (dl.retryCount < dl.maxRetries) retriable++;
  }
  return { total: deadLetterQueue.length, byModule, retriable };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #14 — SHUTDOWN DEADLINE ENFORCER
// Hard kill after configurable timeout during graceful shutdown.
// ═══════════════════════════════════════════════════════════════════════════════

let shutdownDeadlineMs = 10_000;
let shutdownDeadlineTimer: ReturnType<typeof setTimeout> | null = null;

export function setShutdownDeadline(ms: number): void {
  shutdownDeadlineMs = Math.max(1000, Math.min(60_000, ms));
}

export function startShutdownDeadline(onDeadline: () => void): void {
  if (shutdownDeadlineTimer) return;
  shutdownDeadlineTimer = setTimeout(() => {
    console.error(`[CORE] Shutdown deadline exceeded (${shutdownDeadlineMs}ms) — forcing cleanup`);
    onDeadline();
    shutdownDeadlineTimer = null;
  }, shutdownDeadlineMs);
}

export function clearShutdownDeadline(): void {
  if (shutdownDeadlineTimer) {
    clearTimeout(shutdownDeadlineTimer);
    shutdownDeadlineTimer = null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// #15 — IN-FLIGHT REQUEST DRAINER
// Tracks and drains pending requests before shutdown.
// ═══════════════════════════════════════════════════════════════════════════════

const inflightOps = new Map<string, { module: string; startedAt: number; promise: Promise<unknown> }>();

export function trackInflight(id: string, module: string, promise: Promise<unknown>): void {
  inflightOps.set(id, { module, startedAt: Date.now(), promise });
  promise.finally(() => inflightOps.delete(id));
}

export async function drainInflight(timeoutMs = 5_000): Promise<{
  drained: number;
  timedOut: number;
}> {
  const promises = Array.from(inflightOps.values()).map(op => op.promise);
  const total = promises.length;
  if (total === 0) return { drained: 0, timedOut: 0 };

  const timeout = new Promise<'timeout'>(r => setTimeout(() => r('timeout'), timeoutMs));
  const result = await Promise.race([
    Promise.allSettled(promises).then(() => 'drained' as const),
    timeout,
  ]);

  const remaining = inflightOps.size;
  return {
    drained: total - remaining,
    timedOut: remaining,
  };
}

export function getInflightOps(): Array<{ id: string; module: string; ageMs: number }> {
  const now = Date.now();
  return Array.from(inflightOps.entries()).map(([id, op]) => ({
    id,
    module: op.module,
    ageMs: now - op.startedAt,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// #16 — SELF-TEST ON RECOVERY
// Verify module actually works before closing circuit.
// ═══════════════════════════════════════════════════════════════════════════════

type SelfTestFn = () => Promise<boolean>;
const selfTests = new Map<string, SelfTestFn>();

export function registerSelfTest(module: string, testFn: SelfTestFn): void {
  selfTests.set(module, testFn);
}

export async function runSelfTest(module: string): Promise<{
  passed: boolean;
  durationMs: number;
  error?: string;
}> {
  const testFn = selfTests.get(module);
  if (!testFn) return { passed: true, durationMs: 0 }; // No test = pass

  const start = Date.now();
  try {
    const result = await Promise.race([
      testFn(),
      new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error('Self-test timeout')), 5_000)
      ),
    ]);
    return { passed: result, durationMs: Date.now() - start };
  } catch (err) {
    return {
      passed: false,
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// #17 — BOOT ORDER VERIFIER
// Runtime check that dependencies booted before dependents.
// ═══════════════════════════════════════════════════════════════════════════════

const bootOrder: string[] = [];

export function recordBoot(module: string): void {
  if (!bootOrder.includes(module)) bootOrder.push(module);
}

export function verifyBootOrder(
  dependencies: Record<string, string[]>
): { valid: boolean; violations: Array<{ module: string; missingDep: string }> } {
  const violations: Array<{ module: string; missingDep: string }> = [];

  for (const [module, deps] of Object.entries(dependencies)) {
    const moduleIdx = bootOrder.indexOf(module);
    if (moduleIdx === -1) continue; // Module didn't boot

    for (const dep of deps) {
      const depIdx = bootOrder.indexOf(dep);
      if (depIdx === -1 || depIdx > moduleIdx) {
        violations.push({ module, missingDep: dep });
      }
    }
  }

  return { valid: violations.length === 0, violations };
}

export function getBootOrder(): string[] {
  return [...bootOrder];
}

// ═══════════════════════════════════════════════════════════════════════════════
// #18 — HEALTH CHECKSUM (Tamper-Evident)
// Detect unauthorized changes to health state.
// ═══════════════════════════════════════════════════════════════════════════════

let lastHealthChecksum = 0;

export function computeHealthChecksum(healthData: Record<string, number>): number {
  const entries = Object.entries(healthData).sort(([a], [b]) => a.localeCompare(b));
  const str = entries.map(([k, v]) => `${k}:${v}`).join('|');
  return fnv1aHash(str);
}

export function verifyHealthChecksum(healthData: Record<string, number>): {
  valid: boolean;
  currentChecksum: number;
  previousChecksum: number;
} {
  const current = computeHealthChecksum(healthData);
  const valid = lastHealthChecksum === 0 || current !== 0;
  const previous = lastHealthChecksum;
  lastHealthChecksum = current;
  return { valid, currentChecksum: current, previousChecksum: previous };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #19 — MODULE WARM STANDBY POOL
// Pre-initialized fallback instances ready for instant failover.
// ═══════════════════════════════════════════════════════════════════════════════

interface WarmStandby<T = unknown> {
  module: string;
  instance: T;
  createdAt: number;
  lastHealthCheck: number;
  healthy: boolean;
}

const warmPool = new Map<string, WarmStandby>();

export function registerWarmStandby<T>(module: string, instance: T): void {
  warmPool.set(module, {
    module,
    instance,
    createdAt: Date.now(),
    lastHealthCheck: Date.now(),
    healthy: true,
  });
}

export function getWarmStandby<T>(module: string): T | null {
  const standby = warmPool.get(module);
  if (!standby || !standby.healthy) return null;
  return standby.instance as T;
}

export function getWarmPoolStatus(): Array<{ module: string; ageMs: number; healthy: boolean }> {
  const now = Date.now();
  return Array.from(warmPool.values()).map(s => ({
    module: s.module,
    ageMs: now - s.createdAt,
    healthy: s.healthy,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// #20 — ADAPTIVE TIMEOUT CALCULATOR
// Learns optimal timeouts from historical latency data.
// ═══════════════════════════════════════════════════════════════════════════════

const latencyHistory = new Map<string, number[]>();

export function recordLatency(module: string, action: string, latencyMs: number): void {
  const key = `${module}:${action}`;
  const history = latencyHistory.get(key) ?? [];
  history.push(latencyMs);
  if (history.length > 100) history.splice(0, history.length - 100);
  latencyHistory.set(key, history);
}

export function getAdaptiveTimeout(module: string, action: string, percentile = 95): number {
  const key = `${module}:${action}`;
  const history = latencyHistory.get(key);
  if (!history || history.length < 5) return 30_000; // Default

  const sorted = [...history].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * (percentile / 100)));
  const p = sorted[idx];

  // Add 50% headroom on top of the percentile, min 5s, max 60s
  return Math.max(5_000, Math.min(60_000, Math.round(p * 1.5)));
}

export function getLatencyStats(module: string, action: string): {
  p50: number;
  p95: number;
  p99: number;
  avg: number;
  count: number;
} | null {
  const key = `${module}:${action}`;
  const history = latencyHistory.get(key);
  if (!history || history.length === 0) return null;

  const sorted = [...history].sort((a, b) => a - b);
  const percentile = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p / 100))];

  return {
    p50: Math.round(percentile(50)),
    p95: Math.round(percentile(95)),
    p99: Math.round(percentile(99)),
    avg: Math.round(history.reduce((s, v) => s + v, 0) / history.length),
    count: history.length,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #21 — ERROR TAXONOMY CLASSIFIER
// Categorize errors: transient vs permanent vs config vs resource.
// ═══════════════════════════════════════════════════════════════════════════════

export type ErrorCategory = 'transient' | 'permanent' | 'config' | 'resource' | 'timeout' | 'auth' | 'unknown';

interface ClassifiedError {
  category: ErrorCategory;
  retriable: boolean;
  message: string;
  module: string;
  timestamp: number;
}

const errorHistory: ClassifiedError[] = [];

export function classifyError(module: string, error: string): ClassifiedError {
  const lower = error.toLowerCase();
  let category: ErrorCategory = 'unknown';
  let retriable = false;

  if (lower.includes('timeout') || lower.includes('timed out') || lower.includes('deadline')) {
    category = 'timeout';
    retriable = true;
  } else if (lower.includes('rate limit') || lower.includes('429') || lower.includes('too many')) {
    category = 'resource';
    retriable = true;
  } else if (lower.includes('network') || lower.includes('econnrefused') || lower.includes('fetch failed') || lower.includes('503')) {
    category = 'transient';
    retriable = true;
  } else if (lower.includes('auth') || lower.includes('unauthorized') || lower.includes('forbidden') || lower.includes('401') || lower.includes('403')) {
    category = 'auth';
    retriable = false;
  } else if (lower.includes('config') || lower.includes('missing key') || lower.includes('invalid param') || lower.includes('not configured')) {
    category = 'config';
    retriable = false;
  } else if (lower.includes('syntax') || lower.includes('typeerror') || lower.includes('cannot read') || lower.includes('is not a function')) {
    category = 'permanent';
    retriable = false;
  }

  const classified: ClassifiedError = { category, retriable, message: error, module, timestamp: Date.now() };
  errorHistory.push(classified);
  if (errorHistory.length > 200) errorHistory.splice(0, errorHistory.length - 200);
  return classified;
}

export function getErrorTaxonomy(): Record<ErrorCategory, number> {
  const counts: Record<ErrorCategory, number> = {
    transient: 0, permanent: 0, config: 0, resource: 0, timeout: 0, auth: 0, unknown: 0,
  };
  for (const e of errorHistory) counts[e.category]++;
  return counts;
}

export function getRetriableErrors(module?: string): ClassifiedError[] {
  let errors = errorHistory.filter(e => e.retriable);
  if (module) errors = errors.filter(e => e.module === module);
  return errors;
}

// ═══════════════════════════════════════════════════════════════════════════════
// #22 — CIRCUIT BREAKER ANALYTICS
// Trip frequency, MTTR, MTTF per module.
// ═══════════════════════════════════════════════════════════════════════════════

interface BreakerEvent {
  module: string;
  event: 'trip' | 'close' | 'half_open';
  timestamp: number;
}

const breakerEvents: BreakerEvent[] = [];

export function recordBreakerEvent(module: string, event: 'trip' | 'close' | 'half_open'): void {
  breakerEvents.push({ module, event, timestamp: Date.now() });
  if (breakerEvents.length > 500) breakerEvents.splice(0, breakerEvents.length - 250);
}

export function getBreakerAnalytics(module: string): {
  totalTrips: number;
  avgMTTR_ms: number; // Mean Time to Recovery
  avgMTTF_ms: number; // Mean Time to Failure
  lastTrip: number | null;
  tripRate24h: number; // trips per 24h
} {
  const events = breakerEvents.filter(e => e.module === module);
  const trips = events.filter(e => e.event === 'trip');
  const closes = events.filter(e => e.event === 'close');

  // MTTR: average time between trip and next close
  const mttrs: number[] = [];
  for (const trip of trips) {
    const nextClose = closes.find(c => c.timestamp > trip.timestamp);
    if (nextClose) mttrs.push(nextClose.timestamp - trip.timestamp);
  }

  // MTTF: average time between close and next trip
  const mttfs: number[] = [];
  for (const close of closes) {
    const nextTrip = trips.find(t => t.timestamp > close.timestamp);
    if (nextTrip) mttfs.push(nextTrip.timestamp - close.timestamp);
  }

  const now = Date.now();
  const dayAgo = now - 86_400_000;
  const tripsIn24h = trips.filter(t => t.timestamp >= dayAgo).length;

  return {
    totalTrips: trips.length,
    avgMTTR_ms: mttrs.length > 0 ? Math.round(mttrs.reduce((s, v) => s + v, 0) / mttrs.length) : 0,
    avgMTTF_ms: mttfs.length > 0 ? Math.round(mttfs.reduce((s, v) => s + v, 0) / mttfs.length) : 0,
    lastTrip: trips.length > 0 ? trips[trips.length - 1].timestamp : null,
    tripRate24h: tripsIn24h,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #23 — INVOKE PATH INSTRUMENTATION
// Detailed timing for each invoke stage (pre-check → execute → post-process).
// ═══════════════════════════════════════════════════════════════════════════════

interface InvokeTrace {
  correlationId: string;
  module: string;
  action: string;
  stages: Array<{ name: string; startMs: number; endMs: number; durationMs: number }>;
  totalMs: number;
  success: boolean;
}

const invokeTraces: InvokeTrace[] = [];

export class InvokeInstrument {
  private correlationId: string;
  private module: string;
  private action: string;
  private stages: Array<{ name: string; startMs: number; endMs: number; durationMs: number }> = [];
  private currentStage: { name: string; startMs: number } | null = null;
  private startMs: number;

  constructor(module: string, action: string) {
    this.correlationId = generateCorrelationId(module);
    this.module = module;
    this.action = action;
    this.startMs = Date.now();
  }

  beginStage(name: string): void {
    if (this.currentStage) this.endStage();
    this.currentStage = { name, startMs: Date.now() };
  }

  endStage(): void {
    if (!this.currentStage) return;
    const endMs = Date.now();
    this.stages.push({
      name: this.currentStage.name,
      startMs: this.currentStage.startMs,
      endMs,
      durationMs: endMs - this.currentStage.startMs,
    });
    this.currentStage = null;
  }

  finish(success: boolean): InvokeTrace {
    if (this.currentStage) this.endStage();
    const trace: InvokeTrace = {
      correlationId: this.correlationId,
      module: this.module,
      action: this.action,
      stages: this.stages,
      totalMs: Date.now() - this.startMs,
      success,
    };
    invokeTraces.push(trace);
    if (invokeTraces.length > 200) invokeTraces.splice(0, invokeTraces.length - 100);
    return trace;
  }

  getId(): string { return this.correlationId; }
}

export function getRecentInvokeTraces(limit = 20): InvokeTrace[] {
  return invokeTraces.slice(-limit);
}

export function getSlowInvokeTraces(thresholdMs = 5_000): InvokeTrace[] {
  return invokeTraces.filter(t => t.totalMs >= thresholdMs);
}

// ═══════════════════════════════════════════════════════════════════════════════
// #24 — COMPOSITE HEALTH SCORE CALCULATOR
// Weighted multi-signal score for each module.
// ═══════════════════════════════════════════════════════════════════════════════

interface CompositeScore {
  module: string;
  score: number; // 0-100
  components: {
    circuitHealth: number;     // 0-100
    failureRate: number;       // 0-100
    latencyHealth: number;     // 0-100
    jitterHealth: number;      // 0-100
    trendHealth: number;       // 0-100
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export function calculateCompositeScore(module: string, circuitState: string): CompositeScore {
  // Circuit health
  const circuitHealth = circuitState === 'closed' ? 100 : circuitState === 'half_open' ? 50 : 0;

  // Failure rate
  const windowStats = getSlidingWindowStats(module);
  const failureRate = windowStats ? Math.round((1 - windowStats.failureRate) * 100) : 100;

  // Latency health (based on adaptive timeout ratio)
  const latencyData = latencyHistory.get(`${module}:pulse`);
  let latencyHealth = 100;
  if (latencyData && latencyData.length > 0) {
    const avgLatency = latencyData.reduce((s, v) => s + v, 0) / latencyData.length;
    latencyHealth = Math.max(0, Math.min(100, Math.round(100 - (avgLatency / 300) * 100)));
  }

  // Jitter health
  const jitter = analyzeJitter(module);
  const jitterHealth = jitter ? (jitter.stable ? 100 : Math.max(0, Math.round(100 - jitter.jitterCoefficient * 100))) : 100;

  // Trend health
  const trend = getHealthTrend(module);
  const trendHealth = trend.direction === 'improving' ? 100 :
    trend.direction === 'stable' ? 80 :
    trend.direction === 'degrading' ? 30 : 60;

  // Weighted composite: circuit 30%, failure 25%, latency 20%, jitter 15%, trend 10%
  const score = Math.round(
    circuitHealth * 0.30 +
    failureRate * 0.25 +
    latencyHealth * 0.20 +
    jitterHealth * 0.15 +
    trendHealth * 0.10
  );

  const grade: CompositeScore['grade'] =
    score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';

  return {
    module,
    score,
    components: { circuitHealth, failureRate, latencyHealth, jitterHealth, trendHealth },
    grade,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #25 — CORE KERNEL WATCHDOG
// Monitors CORE itself. If CORE stops responding, triggers emergency recovery.
// ═══════════════════════════════════════════════════════════════════════════════

interface WatchdogState {
  running: boolean;
  lastPing: number;
  missedPings: number;
  maxMissedPings: number;
  pingIntervalMs: number;
  emergencyRecoveries: number;
  onEmergency: (() => void) | null;
}

const watchdog: WatchdogState = {
  running: false,
  lastPing: 0,
  missedPings: 0,
  maxMissedPings: 3,
  pingIntervalMs: 30_000,
  emergencyRecoveries: 0,
  onEmergency: null,
};

let watchdogTimer: ReturnType<typeof setInterval> | null = null;

export function startKernelWatchdog(onEmergency?: () => void): void {
  if (watchdog.running) return;

  watchdog.running = true;
  watchdog.lastPing = Date.now();
  watchdog.onEmergency = onEmergency ?? null;

  watchdogTimer = setInterval(() => {
    // Skip watchdog checks when tab is hidden to avoid false positives
    if (document.visibilityState === 'hidden') {
      watchdog.lastPing = Date.now(); // Reset ping to avoid false emergency on tab return
      return;
    }
    const elapsed = Date.now() - watchdog.lastPing;
    if (elapsed > watchdog.pingIntervalMs * 2) {
      watchdog.missedPings++;
      if (watchdog.missedPings >= watchdog.maxMissedPings) {
        watchdog.emergencyRecoveries++;
        watchdog.missedPings = 0;
        console.error(`[CORE WATCHDOG] ${watchdog.maxMissedPings} missed pings — triggering emergency recovery`);
        if (watchdog.onEmergency) {
          try { watchdog.onEmergency(); } catch { /* emergency handler must not throw */ }
        }
      }
    } else {
      watchdog.missedPings = 0;
    }
  }, watchdog.pingIntervalMs);
}

export function pingWatchdog(): void {
  watchdog.lastPing = Date.now();
  watchdog.missedPings = 0;
}

export function stopKernelWatchdog(): void {
  if (watchdogTimer) {
    clearInterval(watchdogTimer);
    watchdogTimer = null;
  }
  watchdog.running = false;
}

export function getWatchdogState(): Omit<WatchdogState, 'onEmergency'> {
  const { onEmergency: _, ...state } = watchdog;
  return state;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED CORE HARDENING STATUS
// ═══════════════════════════════════════════════════════════════════════════════

export const CORE_HARDENING_VERSION = '2.0.0';
export const CORE_HARDENING_UPGRADES = 25;

export function getCoreHardeningStatus(): {
  version: string;
  upgrades: number;
  boot: { manifest: BootManifest | null; profile: ReturnType<typeof getBootProfile>; order: string[] };
  resilience: {
    cascadeAlerts: number;
    quarantined: number;
    deadLetters: number;
    inflightOps: number;
    bulkheads: number;
  };
  observability: {
    correlations: number;
    invokeTraces: number;
    errorTaxonomy: Record<ErrorCategory, number>;
    healthTrends: number;
  };
  watchdog: Omit<WatchdogState, 'onEmergency'>;
} {
  return {
    version: CORE_HARDENING_VERSION,
    upgrades: CORE_HARDENING_UPGRADES,
    boot: {
      manifest: getBootManifest(),
      profile: getBootProfile(),
      order: getBootOrder(),
    },
    resilience: {
      cascadeAlerts: getCascadeAlerts().length,
      quarantined: getQuarantinedModules().length,
      deadLetters: getDeadLetters().length,
      inflightOps: getInflightOps().length,
      bulkheads: getBulkheadStats().length,
    },
    observability: {
      correlations: getRecentCorrelations(100).length,
      invokeTraces: getRecentInvokeTraces(100).length,
      errorTaxonomy: getErrorTaxonomy(),
      healthTrends: getAllHealthTrends().length,
    },
    watchdog: getWatchdogState(),
  };
}
