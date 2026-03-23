/**
 * SHADOW Ultimate — Traffic Mirror
 * Configurable production traffic mirroring (1%–100%).
 * Replays real request patterns with timing preservation.
 */

export interface MirrorConfig {
  id: string;
  sourceNode: string;
  mirrorPercentage: number;     // 1–100
  filterIntentTypes?: string[];
  preserveTiming: boolean;
  active: boolean;
  createdAt: number;
}

export interface MirroredRequest {
  id: string;
  configId: string;
  originalTimestamp: number;
  replayedAt: number;
  sourceNode: string;
  intentType: string;
  payloadSize: number;
  timingDelta: number;          // ms difference from original
}

export interface MirrorStats {
  totalConfigs: number;
  activeConfigs: number;
  totalMirrored: number;
  avgTimingDelta: number;
  avgMirrorPercentage: number;
}

const MAX_CONFIGS = 50;
const MAX_REQUESTS = 2000;

const configs = new Map<string, MirrorConfig>();
const mirroredRequests: MirroredRequest[] = [];

export function createMirrorConfig(
  sourceNode: string, mirrorPercentage: number = 10,
  filterIntentTypes?: string[], preserveTiming: boolean = true
): MirrorConfig {
  const config: MirrorConfig = {
    id: `mirror-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sourceNode, mirrorPercentage: Math.max(1, Math.min(100, mirrorPercentage)),
    filterIntentTypes, preserveTiming, active: true, createdAt: Date.now(),
  };
  if (configs.size >= MAX_CONFIGS) {
    const oldest = [...configs.values()].filter(c => !c.active).sort((a, b) => a.createdAt - b.createdAt)[0];
    if (oldest) configs.delete(oldest.id);
  }
  configs.set(config.id, config);
  return config;
}

export function shouldMirror(configId: string, intentType: string): boolean {
  const config = configs.get(configId);
  if (!config || !config.active) return false;
  if (config.filterIntentTypes && !config.filterIntentTypes.includes(intentType)) return false;
  return Math.random() * 100 < config.mirrorPercentage;
}

export function recordMirroredRequest(
  configId: string, sourceNode: string, intentType: string,
  originalTimestamp: number, payloadSize: number
): MirroredRequest {
  const now = Date.now();
  const req: MirroredRequest = {
    id: `mreq-${now}-${Math.random().toString(36).slice(2, 6)}`,
    configId, originalTimestamp, replayedAt: now,
    sourceNode, intentType, payloadSize,
    timingDelta: now - originalTimestamp,
  };
  if (mirroredRequests.length >= MAX_REQUESTS) mirroredRequests.shift();
  mirroredRequests.push(req);
  return req;
}

export function setMirrorActive(configId: string, active: boolean): void {
  const config = configs.get(configId);
  if (config) config.active = active;
}

export function getMirrorStats(): MirrorStats {
  const all = [...configs.values()];
  const active = all.filter(c => c.active);
  return {
    totalConfigs: all.length,
    activeConfigs: active.length,
    totalMirrored: mirroredRequests.length,
    avgTimingDelta: mirroredRequests.length > 0 ? mirroredRequests.reduce((s, r) => s + r.timingDelta, 0) / mirroredRequests.length : 0,
    avgMirrorPercentage: active.length > 0 ? active.reduce((s, c) => s + c.mirrorPercentage, 0) / active.length : 0,
  };
}

export function resetMirrorState(): void { configs.clear(); mirroredRequests.length = 0; }
