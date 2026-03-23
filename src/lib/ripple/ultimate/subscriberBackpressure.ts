/**
 * RIPPLE Per-Subscriber Adaptive Backpressure — v9.0.0 "Tsunami"
 * 
 * Independent throttling per slow subscriber — fast subscribers never blocked.
 * Adaptive delivery windows that learn subscriber processing speed (EMA-tracked).
 * Subscriber health scoring feeding into delivery decisions.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SubscriberProfile {
  subscriberId: string;
  module: string;
  avgProcessingMs: number;
  p95ProcessingMs: number;
  throughput: number;        // events/sec EMA
  healthScore: number;       // 0-100
  throttleLevel: ThrottleLevel;
  windowSize: number;        // current delivery window
  pendingCount: number;
  totalDelivered: number;
  totalDropped: number;
  lastDeliveryAt: string | null;
  consecutiveTimeouts: number;
}

export type ThrottleLevel = 'none' | 'light' | 'moderate' | 'heavy' | 'paused';

export interface BackpressureConfig {
  maxPendingPerSubscriber: number;
  healthScoreThreshold: number;
  windowGrowthFactor: number;
  windowShrinkFactor: number;
  minWindowSize: number;
  maxWindowSize: number;
  timeoutMs: number;
}

export interface BackpressureReport {
  totalSubscribers: number;
  healthyCount: number;
  throttledCount: number;
  pausedCount: number;
  avgHealthScore: number;
  bottleneckSubscribers: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: BackpressureConfig = {
  maxPendingPerSubscriber: 100,
  healthScoreThreshold: 40,
  windowGrowthFactor: 1.5,
  windowShrinkFactor: 0.5,
  minWindowSize: 1,
  maxWindowSize: 50,
  timeoutMs: 5000,
};

const EMA_ALPHA = 0.15;
const P95_SAMPLES = 100;
const HEALTH_DECAY = 0.98; // Slow decay per check cycle

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const subscribers = new Map<string, SubscriberProfile>();
const processingTimes = new Map<string, number[]>(); // Rolling window for p95
let config = { ...DEFAULT_CONFIG };

// ═══════════════════════════════════════════════════════════════════════════════
// CORE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/** Register a subscriber for backpressure tracking. */
export function registerSubscriber(subscriberId: string, module: string): SubscriberProfile {
  const profile: SubscriberProfile = {
    subscriberId,
    module,
    avgProcessingMs: 0,
    p95ProcessingMs: 0,
    throughput: 0,
    healthScore: 100,
    throttleLevel: 'none',
    windowSize: config.maxWindowSize / 2,
    pendingCount: 0,
    totalDelivered: 0,
    totalDropped: 0,
    lastDeliveryAt: null,
    consecutiveTimeouts: 0,
  };
  subscribers.set(subscriberId, profile);
  processingTimes.set(subscriberId, []);
  return profile;
}

/** Unregister a subscriber. */
export function unregisterSubscriber(subscriberId: string): boolean {
  processingTimes.delete(subscriberId);
  return subscribers.delete(subscriberId);
}

/** Check if subscriber can accept delivery right now. */
export function canDeliver(subscriberId: string): boolean {
  const profile = subscribers.get(subscriberId);
  if (!profile) return true; // Unknown subscriber — allow

  if (profile.throttleLevel === 'paused') return false;
  if (profile.pendingCount >= config.maxPendingPerSubscriber) return false;
  if (profile.healthScore < config.healthScoreThreshold) return false;

  return true;
}

/** Get the current delivery window size for a subscriber. */
export function getWindowSize(subscriberId: string): number {
  const profile = subscribers.get(subscriberId);
  return profile?.windowSize ?? config.maxWindowSize;
}

/** Record a successful delivery. */
export function recordDeliverySuccess(subscriberId: string, processingMs: number): void {
  const profile = subscribers.get(subscriberId);
  if (!profile) return;

  // Update processing time EMA
  if (profile.totalDelivered === 0) {
    profile.avgProcessingMs = processingMs;
  } else {
    profile.avgProcessingMs = EMA_ALPHA * processingMs + (1 - EMA_ALPHA) * profile.avgProcessingMs;
  }

  // Update p95
  const times = processingTimes.get(subscriberId) ?? [];
  times.push(processingMs);
  if (times.length > P95_SAMPLES) times.shift();
  processingTimes.set(subscriberId, times);
  profile.p95ProcessingMs = calculateP95(times);

  // Update throughput EMA
  const now = Date.now();
  if (profile.lastDeliveryAt) {
    const intervalMs = now - new Date(profile.lastDeliveryAt).getTime();
    if (intervalMs > 0) {
      const instantThroughput = 1000 / intervalMs;
      profile.throughput = EMA_ALPHA * instantThroughput + (1 - EMA_ALPHA) * profile.throughput;
    }
  }

  profile.totalDelivered++;
  profile.pendingCount = Math.max(0, profile.pendingCount - 1);
  profile.lastDeliveryAt = new Date(now).toISOString();
  profile.consecutiveTimeouts = 0;

  // Improve health
  profile.healthScore = Math.min(100, profile.healthScore + 2);

  // Grow window
  if (profile.healthScore > 80) {
    profile.windowSize = Math.min(
      config.maxWindowSize,
      Math.ceil(profile.windowSize * config.windowGrowthFactor)
    );
  }

  recalculateThrottleLevel(profile);
}

/** Record a delivery failure / timeout. */
export function recordDeliveryFailure(subscriberId: string, timedOut: boolean = false): void {
  const profile = subscribers.get(subscriberId);
  if (!profile) return;

  profile.totalDropped++;
  profile.pendingCount = Math.max(0, profile.pendingCount - 1);

  if (timedOut) {
    profile.consecutiveTimeouts++;
  }

  // Degrade health
  profile.healthScore = Math.max(0, profile.healthScore - (timedOut ? 15 : 5));

  // Shrink window
  profile.windowSize = Math.max(
    config.minWindowSize,
    Math.floor(profile.windowSize * config.windowShrinkFactor)
  );

  recalculateThrottleLevel(profile);
}

/** Increment pending count when event dispatched to subscriber. */
export function markPending(subscriberId: string): void {
  const profile = subscribers.get(subscriberId);
  if (profile) profile.pendingCount++;
}

/** Run periodic health decay on all subscribers. */
export function decayHealthScores(): void {
  for (const profile of subscribers.values()) {
    profile.healthScore = Math.max(0, profile.healthScore * HEALTH_DECAY);
    recalculateThrottleLevel(profile);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function calculateP95(times: number[]): number {
  if (times.length === 0) return 0;
  const sorted = [...times].sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * 0.95);
  return sorted[Math.min(idx, sorted.length - 1)];
}

function recalculateThrottleLevel(profile: SubscriberProfile): void {
  if (profile.healthScore >= 80) {
    profile.throttleLevel = 'none';
  } else if (profile.healthScore >= 60) {
    profile.throttleLevel = 'light';
  } else if (profile.healthScore >= 40) {
    profile.throttleLevel = 'moderate';
  } else if (profile.healthScore >= 20) {
    profile.throttleLevel = 'heavy';
  } else {
    profile.throttleLevel = 'paused';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTING
// ═══════════════════════════════════════════════════════════════════════════════

/** Get profile for a specific subscriber. */
export function getSubscriberProfile(subscriberId: string): SubscriberProfile | null {
  return subscribers.get(subscriberId) ?? null;
}

/** Get all subscriber profiles. */
export function getAllProfiles(): SubscriberProfile[] {
  return Array.from(subscribers.values());
}

/** Generate a system-wide backpressure report. */
export function getBackpressureReport(): BackpressureReport {
  const profiles = Array.from(subscribers.values());
  const healthy = profiles.filter(p => p.throttleLevel === 'none');
  const throttled = profiles.filter(p => p.throttleLevel !== 'none' && p.throttleLevel !== 'paused');
  const paused = profiles.filter(p => p.throttleLevel === 'paused');
  const avgHealth = profiles.length > 0
    ? profiles.reduce((s, p) => s + p.healthScore, 0) / profiles.length
    : 100;
  const bottlenecks = profiles
    .filter(p => p.healthScore < 50)
    .sort((a, b) => a.healthScore - b.healthScore)
    .slice(0, 5)
    .map(p => p.subscriberId);

  return {
    totalSubscribers: profiles.length,
    healthyCount: healthy.length,
    throttledCount: throttled.length,
    pausedCount: paused.length,
    avgHealthScore: Math.round(avgHealth * 10) / 10,
    bottleneckSubscribers: bottlenecks,
  };
}

/** Update configuration. */
export function updateBackpressureConfig(partial: Partial<BackpressureConfig>): void {
  config = { ...config, ...partial };
}

/** Reset all subscriber tracking. */
export function resetBackpressureState(): void {
  subscribers.clear();
  processingTimes.clear();
  config = { ...DEFAULT_CONFIG };
}
