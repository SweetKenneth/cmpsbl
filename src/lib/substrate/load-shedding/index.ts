/**
 * Autonomous Load Shedding
 * Deprioritizes non-critical modules during system pressure
 * 
 * Monitors system load indicators and automatically throttles
 * lower-priority modules to protect core functionality.
 */

export type LoadLevel = 'normal' | 'elevated' | 'high' | 'critical';
export type ModulePriority = 'essential' | 'important' | 'standard' | 'deferrable';

export interface LoadState {
  level: LoadLevel;
  activeModules: number;
  shedModules: string[];
  throttledModules: Record<string, number>; // module → throttle %
  lastCheck: number;
  pressure: number; // 0-100
}

export interface SheddingConfig {
  pressureThresholds: Record<LoadLevel, number>;
  modulePriorities: Record<string, ModulePriority>;
  throttleRates: Record<LoadLevel, Record<ModulePriority, number>>; // 0-1 (0=blocked, 1=full)
  checkInterval: number;
}

// Module priority classifications — all entities + zones
const MODULE_PRIORITIES: Record<string, ModulePriority> = {
  CORE: 'essential',
  BRAIN: 'essential',
  SYSTEM: 'essential',
  ACCESS: 'essential',
  DEFENSE: 'essential',
  NEXUS: 'important',
  VISION: 'important',
  DECODE: 'important',
  RIPPLE: 'important',
  IDENTITY: 'important',
  EVOLUTION: 'standard',
  INTEGRATION: 'standard',
  CORTEX: 'standard',
  MEMORY: 'standard',
  RELAY: 'standard',
  AUDIT: 'standard',
  ECONOMY: 'standard',
  ENCODE: 'standard',
  SANDBOX: 'deferrable',
  INCLUSIVE: 'deferrable',
  DREAM: 'deferrable',
};

const DEFAULT_CONFIG: SheddingConfig = {
  pressureThresholds: {
    normal: 0,
    elevated: 40,
    high: 65,
    critical: 85,
  },
  modulePriorities: MODULE_PRIORITIES,
  throttleRates: {
    normal:   { essential: 1, important: 1, standard: 1, deferrable: 1 },
    elevated: { essential: 1, important: 1, standard: 0.8, deferrable: 0.5 },
    high:     { essential: 1, important: 0.8, standard: 0.4, deferrable: 0 },
    critical: { essential: 1, important: 0.5, standard: 0, deferrable: 0 },
  },
  checkInterval: 10_000,
};

let currentState: LoadState = {
  level: 'normal',
  activeModules: Object.keys(MODULE_PRIORITIES).length,
  shedModules: [],
  throttledModules: {},
  lastCheck: Date.now(),
  pressure: 0,
};

let config = { ...DEFAULT_CONFIG };

/** Update system pressure reading */
export function updatePressure(pressure: number): LoadState {
  currentState.pressure = Math.max(0, Math.min(100, pressure));
  currentState.lastCheck = Date.now();

  // Determine load level
  if (pressure >= config.pressureThresholds.critical) currentState.level = 'critical';
  else if (pressure >= config.pressureThresholds.high) currentState.level = 'high';
  else if (pressure >= config.pressureThresholds.elevated) currentState.level = 'elevated';
  else currentState.level = 'normal';

  // Apply throttling
  const rates = config.throttleRates[currentState.level];
  currentState.throttledModules = {};
  currentState.shedModules = [];

  for (const [module, priority] of Object.entries(config.modulePriorities)) {
    const rate = rates[priority];
    if (rate < 1) {
      currentState.throttledModules[module] = Math.round(rate * 100);
    }
    if (rate === 0) {
      currentState.shedModules.push(module);
    }
  }

  currentState.activeModules = Object.keys(config.modulePriorities).length - currentState.shedModules.length;

  if (currentState.level !== 'normal') {
    console.log(`[load-shedding] Level: ${currentState.level} | Pressure: ${pressure}% | Shed: ${currentState.shedModules.join(', ') || 'none'}`);
  }

  return currentState;
}

/** Check if a module is allowed to execute at current load */
export function isModuleAllowed(module: string): boolean {
  return !currentState.shedModules.includes(module.toUpperCase());
}

/** Get throttle rate for a module (0-100%) */
export function getThrottleRate(module: string): number {
  return currentState.throttledModules[module.toUpperCase()] ?? 100;
}

/** Should this request be dropped based on throttle? */
export function shouldThrottle(module: string): boolean {
  const rate = getThrottleRate(module);
  if (rate >= 100) return false;
  if (rate <= 0) return true;
  return Math.random() * 100 > rate;
}

/** Get current load state */
export function getLoadState(): LoadState {
  return { ...currentState };
}

/** Configure shedding parameters */
export function configureLoadShedding(cfg: Partial<SheddingConfig>) {
  config = { ...config, ...cfg };
}

/** Auto-calculate pressure from observable metrics */
export function calculatePressure(metrics: {
  errorRate?: number;       // 0-1
  latencyMs?: number;       // avg response time
  queueDepth?: number;      // pending items
  memoryUsage?: number;     // 0-1
}): number {
  const errorWeight = (metrics.errorRate ?? 0) * 40;
  const latencyWeight = Math.min((metrics.latencyMs ?? 0) / 100, 30);
  const queueWeight = Math.min((metrics.queueDepth ?? 0) / 10, 15);
  const memWeight = (metrics.memoryUsage ?? 0) * 15;

  return Math.round(errorWeight + latencyWeight + queueWeight + memWeight);
}

/** Get shedding summary */
export function getSheddingSummary() {
  return {
    level: currentState.level,
    pressure: `${currentState.pressure}%`,
    active: `${currentState.activeModules}/${Object.keys(config.modulePriorities).length}`,
    shed: currentState.shedModules,
    throttled: Object.entries(currentState.throttledModules)
      .filter(([, rate]) => rate < 100)
      .map(([mod, rate]) => `${mod}:${rate}%`),
  };
}
