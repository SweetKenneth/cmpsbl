/**
 * CORE — Heartbeat Engine
 * Periodic liveness probes across all registered modules.
 * Auto-marks nodes degraded if heartbeat missed for 3 consecutive cycles.
 * Ultimate Form v1.0.0
 */

import { getAllModuleStates, transition } from './lifecycleManager';

export interface HeartbeatRecord {
  moduleId: string;
  lastBeat: string;
  missedCount: number;
  alive: boolean;
  latencyMs: number;
}

type HeartbeatProbe = (moduleId: string) => Promise<{ alive: boolean; latencyMs: number }>;

const HEARTBEAT_INTERVAL_MS = 30_000; // 30 seconds
const MAX_MISSED_BEFORE_DEGRADE = 3;

const records = new Map<string, HeartbeatRecord>();
const probes = new Map<string, HeartbeatProbe>();
let interval: ReturnType<typeof setInterval> | null = null;

/**
 * Register a heartbeat probe for a module.
 */
export function registerHeartbeatProbe(moduleId: string, probe: HeartbeatProbe): void {
  probes.set(moduleId, probe);
  records.set(moduleId, {
    moduleId,
    lastBeat: new Date().toISOString(),
    missedCount: 0,
    alive: true,
    latencyMs: 0,
  });
}

/**
 * Execute a single heartbeat cycle across all probes.
 */
export async function executeHeartbeatCycle(): Promise<HeartbeatRecord[]> {
  const results: HeartbeatRecord[] = [];

  const entries = Array.from(probes.entries());
  const settled = await Promise.allSettled(
    entries.map(async ([moduleId, probe]) => {
      const start = performance.now();
      try {
        const result = await Promise.race([
          probe(moduleId),
          new Promise<{ alive: false; latencyMs: number }>((resolve) =>
            setTimeout(() => resolve({ alive: false, latencyMs: 5000 }), 5000)
          ),
        ]);
        return { moduleId, ...result, latencyMs: result.latencyMs || Math.round(performance.now() - start) };
      } catch {
        return { moduleId, alive: false, latencyMs: Math.round(performance.now() - start) };
      }
    })
  );

  for (const result of settled) {
    if (result.status !== 'fulfilled') continue;
    const { moduleId, alive, latencyMs } = result.value;

    const record = records.get(moduleId) || {
      moduleId, lastBeat: '', missedCount: 0, alive: false, latencyMs: 0,
    };

    if (alive) {
      record.lastBeat = new Date().toISOString();
      record.missedCount = 0;
      record.alive = true;
      record.latencyMs = latencyMs;
    } else {
      record.missedCount++;
      record.alive = false;

      if (record.missedCount >= MAX_MISSED_BEFORE_DEGRADE) {
        transition(moduleId, 'degraded', `Heartbeat missed ${record.missedCount} consecutive cycles`);
      }
    }

    records.set(moduleId, record);
    results.push({ ...record });
  }

  return results;
}

/**
 * Start the heartbeat engine. Returns teardown function.
 */
export function startHeartbeatEngine(): () => void {
  // Register default probes for all lifecycle modules that don't have custom probes
  for (const entry of getAllModuleStates()) {
    if (!probes.has(entry.moduleId)) {
      registerHeartbeatProbe(entry.moduleId, async () => ({
        alive: entry.state === 'running' || entry.state === 'ready',
        latencyMs: 0,
      }));
    }
  }

  interval = setInterval(() => {
    executeHeartbeatCycle().catch(() => { /* silent */ });
  }, HEARTBEAT_INTERVAL_MS);

  console.log(`[HeartbeatEngine] Started — ${probes.size} probes, ${HEARTBEAT_INTERVAL_MS}ms interval`);

  return () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  };
}

export function getHeartbeatRecords(): HeartbeatRecord[] {
  return Array.from(records.values());
}

export function getHeartbeat(moduleId: string): HeartbeatRecord | undefined {
  return records.get(moduleId);
}

export function getUnhealthyModules(): HeartbeatRecord[] {
  return Array.from(records.values()).filter(r => !r.alive || r.missedCount > 0);
}
