/**
 * Telemetry — Rate Sampler
 * Reduces noise from debug-level events by applying probabilistic sampling.
 * Only affects debug severity; all other events pass through unsampled.
 */

export interface SamplerConfig {
  debugSampleRate: number;    // 0.0–1.0, fraction of debug events to keep
  infoSampleRate: number;     // typically 1.0
  burstWindowMs: number;      // window for burst detection
  burstThreshold: number;     // max events per window before sampling kicks in
}

const DEFAULT_CONFIG: SamplerConfig = {
  debugSampleRate: 0.1,       // Keep 10% of debug events
  infoSampleRate: 1.0,        // Keep all info events
  burstWindowMs: 5_000,
  burstThreshold: 50,
};

let config = { ...DEFAULT_CONFIG };
let eventCountInWindow = 0;
let windowStart = Date.now();

/**
 * Configure the sampler.
 */
export function configureSampler(overrides: Partial<SamplerConfig>): void {
  config = { ...config, ...overrides };
}

/**
 * Determine if an event should be emitted based on severity and sampling config.
 * Returns true if the event should pass through.
 */
export function shouldSample(severity: string): boolean {
  // Always pass error/critical/warn
  if (severity === 'error' || severity === 'critical' || severity === 'warn') {
    return true;
  }

  // Check burst window
  const now = Date.now();
  if (now - windowStart > config.burstWindowMs) {
    eventCountInWindow = 0;
    windowStart = now;
  }
  eventCountInWindow++;

  // Under burst threshold, pass everything
  if (eventCountInWindow <= config.burstThreshold) {
    return true;
  }

  // Apply sampling rate
  const rate = severity === 'debug' ? config.debugSampleRate : config.infoSampleRate;
  return Math.random() < rate;
}

/**
 * Get sampler stats.
 */
export function getSamplerStats(): {
  config: SamplerConfig;
  currentWindowCount: number;
  isBursting: boolean;
} {
  return {
    config: { ...config },
    currentWindowCount: eventCountInWindow,
    isBursting: eventCountInWindow > config.burstThreshold,
  };
}
