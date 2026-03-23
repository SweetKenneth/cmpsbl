/**
 * CORTEX — Backpressure Controller
 * Prevents queue overflow with adaptive rate control per pipeline.
 */

export interface BackpressureState {
  pipelineId: string;
  queueDepth: number;
  maxQueueDepth: number;
  pressure: number;           // 0-1
  ingestRate: number;         // items/sec
  drainRate: number;          // items/sec
  isThrottled: boolean;
  throttleRatio: number;      // 0-1, 1 = no throttle
  lastUpdated: string;
}

export interface BackpressureConfig {
  maxQueueDepth: number;
  softLimitRatio: number;     // start throttling at this %
  hardLimitRatio: number;     // reject at this %
  decayRate: number;          // how fast pressure decays
  samplingWindowMs: number;
}

const DEFAULT_CONFIG: BackpressureConfig = {
  maxQueueDepth: 1000,
  softLimitRatio: 0.6,
  hardLimitRatio: 0.9,
  decayRate: 0.05,
  samplingWindowMs: 5000,
};

const pipelineStates = new Map<string, BackpressureState>();
const ingestCounters = new Map<string, { count: number; windowStart: number }>();

export function initBackpressure(pipelineId: string, config?: Partial<BackpressureConfig>): void {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  pipelineStates.set(pipelineId, {
    pipelineId,
    queueDepth: 0,
    maxQueueDepth: cfg.maxQueueDepth,
    pressure: 0,
    ingestRate: 0,
    drainRate: 0,
    isThrottled: false,
    throttleRatio: 1,
    lastUpdated: new Date().toISOString(),
  });
}

export function recordIngest(pipelineId: string, count = 1): void {
  const counter = ingestCounters.get(pipelineId) ?? { count: 0, windowStart: Date.now() };
  counter.count += count;

  const elapsed = Date.now() - counter.windowStart;
  if (elapsed > DEFAULT_CONFIG.samplingWindowMs) {
    const state = pipelineStates.get(pipelineId);
    if (state) {
      state.ingestRate = counter.count / (elapsed / 1000);
    }
    counter.count = 0;
    counter.windowStart = Date.now();
  }

  ingestCounters.set(pipelineId, counter);
}

export function updateQueueDepth(pipelineId: string, depth: number): BackpressureState {
  let state = pipelineStates.get(pipelineId);
  if (!state) {
    initBackpressure(pipelineId);
    state = pipelineStates.get(pipelineId)!;
  }

  state.queueDepth = depth;
  state.pressure = Math.min(1, depth / state.maxQueueDepth);

  // Calculate throttle ratio
  if (state.pressure >= DEFAULT_CONFIG.hardLimitRatio) {
    state.isThrottled = true;
    state.throttleRatio = 0.1; // near-reject
  } else if (state.pressure >= DEFAULT_CONFIG.softLimitRatio) {
    state.isThrottled = true;
    const range = DEFAULT_CONFIG.hardLimitRatio - DEFAULT_CONFIG.softLimitRatio;
    const excess = state.pressure - DEFAULT_CONFIG.softLimitRatio;
    state.throttleRatio = Math.max(0.1, 1 - (excess / range) * 0.9);
  } else {
    state.isThrottled = false;
    state.throttleRatio = 1;
  }

  state.lastUpdated = new Date().toISOString();
  return state;
}

export function shouldAccept(pipelineId: string): boolean {
  const state = pipelineStates.get(pipelineId);
  if (!state) return true;

  if (state.pressure >= DEFAULT_CONFIG.hardLimitRatio) return false;
  if (!state.isThrottled) return true;

  // Probabilistic acceptance based on throttle ratio
  return Math.random() < state.throttleRatio;
}

export function getBackpressureState(pipelineId: string): BackpressureState | undefined {
  return pipelineStates.get(pipelineId);
}

export function getAllBackpressureStates(): BackpressureState[] {
  return Array.from(pipelineStates.values());
}

export function resetBackpressure(pipelineId: string): void {
  pipelineStates.delete(pipelineId);
  ingestCounters.delete(pipelineId);
}
