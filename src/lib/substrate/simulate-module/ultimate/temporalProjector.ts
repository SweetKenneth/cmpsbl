/**
 * SIMULATE Ultimate — System 4: Temporal Simulation Projector
 * 
 * Time-series projection engine — simulates system evolution over
 * configurable time horizons. Supports event injection at specific
 * timestamps, decay curves, and recovery modeling.
 * 
 * @module simulate/ultimate/temporalProjector
 */

// ── Types ────────────────────────────────────────────────────────

export interface TemporalEvent {
  id: string;
  timestamp: number;          // Offset from simulation start (ms)
  type: 'inject_failure' | 'restore' | 'scale_up' | 'scale_down' | 'config_change' | 'load_change';
  parameters: Record<string, number>;
  description: string;
}

export interface TemporalConfig {
  id: string;
  name: string;
  durationMs: number;         // Total simulation time horizon
  tickIntervalMs: number;     // Resolution of time steps
  initialState: Record<string, number>;
  events: TemporalEvent[];
  decayRates: Record<string, number>;      // Per-metric decay per tick
  recoveryRates: Record<string, number>;   // Per-metric recovery per tick
}

export interface TimePoint {
  offsetMs: number;
  state: Record<string, number>;
  activeEvents: string[];     // Event IDs active at this point
  anomalies: string[];
}

export interface TemporalResult {
  id: string;
  configId: string;
  name: string;
  timeline: TimePoint[];
  peakDegradation: { metric: string; value: number; atMs: number };
  recoveryTime: number | null;  // Ms until all metrics return to ≥90% of initial
  eventImpacts: Array<{ eventId: string; immediateImpact: Record<string, number>; sustainedImpact: Record<string, number> }>;
  projectedEndState: Record<string, number>;
  durationMs: number;
  computeTimeMs: number;
  simulatedAt: string;
}

// ── State ────────────────────────────────────────────────────────

const temporalResults: TemporalResult[] = [];
const MAX_RESULTS = 200;

// ── Core Engine ──────────────────────────────────────────────────

/** Run a temporal simulation */
export function runTemporalSimulation(config: TemporalConfig): TemporalResult {
  const start = performance.now();
  const timeline: TimePoint[] = [];
  const state = { ...config.initialState };
  const initialState = { ...config.initialState };

  // Sort events by timestamp
  const sortedEvents = [...config.events].sort((a, b) => a.timestamp - b.timestamp);
  let eventIdx = 0;

  // Track active events and their end times
  const activeEvents = new Map<string, number>(); // eventId → end time

  let peakDegradation = { metric: '', value: Infinity, atMs: 0 };

  const eventImpacts: TemporalResult['eventImpacts'] = [];
  const preEventStates = new Map<string, Record<string, number>>();

  const totalTicks = Math.ceil(config.durationMs / config.tickIntervalMs);

  for (let tick = 0; tick <= totalTicks; tick++) {
    const offsetMs = tick * config.tickIntervalMs;

    // Apply scheduled events
    while (eventIdx < sortedEvents.length && sortedEvents[eventIdx].timestamp <= offsetMs) {
      const event = sortedEvents[eventIdx];
      preEventStates.set(event.id, { ...state });

      switch (event.type) {
        case 'inject_failure':
          for (const [key, impact] of Object.entries(event.parameters)) {
            if (key in state) state[key] = Math.max(0, state[key] - impact);
          }
          activeEvents.set(event.id, offsetMs + (event.parameters.durationMs || 30000));
          break;
        case 'restore':
          for (const [key, val] of Object.entries(event.parameters)) {
            if (key in state) state[key] = Math.min(initialState[key] || 100, state[key] + val);
          }
          break;
        case 'scale_up':
          for (const [key, factor] of Object.entries(event.parameters)) {
            if (key in state) state[key] = state[key] * factor;
          }
          break;
        case 'scale_down':
          for (const [key, factor] of Object.entries(event.parameters)) {
            if (key in state) state[key] = state[key] / Math.max(1, factor);
          }
          break;
        case 'load_change':
          for (const [key, val] of Object.entries(event.parameters)) {
            if (key in state) state[key] = val;
          }
          break;
        case 'config_change':
          for (const [key, val] of Object.entries(event.parameters)) {
            state[key] = val;
          }
          break;
      }

      eventIdx++;
    }

    // Expire active events
    for (const [eid, endTime] of activeEvents) {
      if (offsetMs >= endTime) activeEvents.delete(eid);
    }

    // Apply decay/recovery
    for (const [metric, rate] of Object.entries(config.decayRates)) {
      if (metric in state && activeEvents.size > 0) {
        state[metric] = Math.max(0, state[metric] * (1 - rate));
      }
    }
    for (const [metric, rate] of Object.entries(config.recoveryRates)) {
      if (metric in state && activeEvents.size === 0) {
        const target = initialState[metric] || 100;
        state[metric] = Math.min(target, state[metric] + (target - state[metric]) * rate);
      }
    }

    // Track peak degradation
    for (const [metric, val] of Object.entries(state)) {
      const initial = initialState[metric] || 100;
      const ratio = val / initial;
      if (ratio < (peakDegradation.value / (initialState[peakDegradation.metric] || 100) || 1)) {
        peakDegradation = { metric, value: Math.round(val * 100) / 100, atMs: offsetMs };
      }
    }

    // Detect anomalies
    const anomalies: string[] = [];
    for (const [metric, val] of Object.entries(state)) {
      const initial = initialState[metric] || 100;
      if (val < initial * 0.5) anomalies.push(`${metric} at ${Math.round(val)}% of baseline`);
    }

    timeline.push({
      offsetMs,
      state: { ...state },
      activeEvents: Array.from(activeEvents.keys()),
      anomalies,
    });
  }

  // Calculate recovery time
  let recoveryTime: number | null = null;
  for (let i = timeline.length - 1; i >= 0; i--) {
    const allRecovered = Object.entries(timeline[i].state).every(([k, v]) => {
      const initial = initialState[k] || 100;
      return v >= initial * 0.9;
    });
    if (!allRecovered) {
      recoveryTime = i < timeline.length - 1 ? timeline[i + 1]?.offsetMs ?? null : null;
      break;
    }
  }

  // Compute event impacts
  for (const event of config.events) {
    const preState = preEventStates.get(event.id);
    if (preState) {
      const immediateImpact: Record<string, number> = {};
      const postEventPoint = timeline.find(tp => tp.offsetMs >= event.timestamp);
      if (postEventPoint) {
        for (const key of Object.keys(preState)) {
          immediateImpact[key] = Math.round((postEventPoint.state[key] - preState[key]) * 100) / 100;
        }
      }
      eventImpacts.push({ eventId: event.id, immediateImpact, sustainedImpact: immediateImpact });
    }
  }

  const result: TemporalResult = {
    id: crypto.randomUUID(),
    configId: config.id,
    name: config.name,
    timeline,
    peakDegradation,
    recoveryTime,
    eventImpacts,
    projectedEndState: { ...state },
    durationMs: config.durationMs,
    computeTimeMs: Math.round((performance.now() - start) * 100) / 100,
    simulatedAt: new Date().toISOString(),
  };

  temporalResults.push(result);
  if (temporalResults.length > MAX_RESULTS) temporalResults.splice(0, temporalResults.length - MAX_RESULTS);

  return result;
}

export function getTemporalResults(): TemporalResult[] { return [...temporalResults]; }

export function getTemporalHealth() {
  return {
    totalSimulations: temporalResults.length,
    avgTimelineLength: temporalResults.length > 0
      ? Math.round(temporalResults.reduce((s, r) => s + r.timeline.length, 0) / temporalResults.length)
      : 0,
    avgComputeTimeMs: temporalResults.length > 0
      ? Math.round(temporalResults.reduce((s, r) => s + r.computeTimeMs, 0) / temporalResults.length * 100) / 100
      : 0,
  };
}

export function resetTemporalProjector(): void {
  temporalResults.length = 0;
}
