/**
 * Evolution Telemetry Collector — EVOLUTION v9.0.0
 * Structured event emitter for proposal lifecycle, gate pass/fail,
 * MTTR, velocity trends, and rollback frequency.
 */

// --- Types ---

export type EvolutionEventType =
  | 'proposal_created'
  | 'proposal_advanced'
  | 'proposal_failed'
  | 'proposal_completed'
  | 'gate_passed'
  | 'gate_failed'
  | 'mutation_applied'
  | 'mutation_rolled_back'
  | 'velocity_blocked'
  | 'probe_executed'
  | 'shadow_completed';

export interface EvolutionTelemetryEvent {
  id: string;
  type: EvolutionEventType;
  proposalId?: string;
  data: Record<string, unknown>;
  timestamp: number;
}

export interface EvolutionMetrics {
  totalProposals: number;
  completedProposals: number;
  failedProposals: number;
  successRate: number;
  avgTimeToPromote: number; // ms
  rollbackRate: number;
  gatePassRate: number;
  velocityUtilization: number;
  probePassRate: number;
  calculatedAt: number;
}

type EvolutionListener = (event: EvolutionTelemetryEvent) => void;

// --- Constants ---

const MAX_EVENTS = 1000;

// --- State ---

const events: EvolutionTelemetryEvent[] = [];
const listeners: Set<EvolutionListener> = new Set();
let eventCounter = 0;

// Metric accumulators
const accumulators = {
  proposals: 0,
  completed: 0,
  failed: 0,
  totalPromoteTime: 0,
  rollbacks: 0,
  mutations: 0,
  gatesPassed: 0,
  gatesFailed: 0,
  probesPassed: 0,
  probesFailed: 0,
  velocityBlocked: 0,
  velocityRequested: 0,
};

// --- Core ---

export function emitEvolution(
  type: EvolutionEventType,
  data: Record<string, unknown>,
  proposalId?: string
): EvolutionTelemetryEvent {
  const event: EvolutionTelemetryEvent = {
    id: `evo_${++eventCounter}`,
    type,
    proposalId,
    data,
    timestamp: Date.now(),
  };

  events.push(event);
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);

  // Update accumulators
  switch (type) {
    case 'proposal_created': accumulators.proposals++; break;
    case 'proposal_completed':
      accumulators.completed++;
      if (typeof data.durationMs === 'number') accumulators.totalPromoteTime += data.durationMs;
      break;
    case 'proposal_failed': accumulators.failed++; break;
    case 'gate_passed': accumulators.gatesPassed++; break;
    case 'gate_failed': accumulators.gatesFailed++; break;
    case 'mutation_applied': accumulators.mutations++; break;
    case 'mutation_rolled_back': accumulators.rollbacks++; break;
    case 'velocity_blocked': accumulators.velocityBlocked++; break;
    case 'probe_executed':
      if (data.passed) accumulators.probesPassed++;
      else accumulators.probesFailed++;
      break;
  }

  // Non-blocking fan-out
  for (const listener of listeners) {
    try { listener(event); } catch { /* non-blocking */ }
  }

  return event;
}

export function subscribeEvolution(listener: EvolutionListener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function computeMetrics(): EvolutionMetrics {
  const totalGates = accumulators.gatesPassed + accumulators.gatesFailed;
  const totalProbes = accumulators.probesPassed + accumulators.probesFailed;

  return {
    totalProposals: accumulators.proposals,
    completedProposals: accumulators.completed,
    failedProposals: accumulators.failed,
    successRate: accumulators.proposals > 0
      ? Math.round((accumulators.completed / accumulators.proposals) * 100) / 100 : 0,
    avgTimeToPromote: accumulators.completed > 0
      ? Math.round(accumulators.totalPromoteTime / accumulators.completed) : 0,
    rollbackRate: accumulators.mutations > 0
      ? Math.round((accumulators.rollbacks / accumulators.mutations) * 100) / 100 : 0,
    gatePassRate: totalGates > 0
      ? Math.round((accumulators.gatesPassed / totalGates) * 100) / 100 : 0,
    velocityUtilization: 0, // computed externally from velocity governor
    probePassRate: totalProbes > 0
      ? Math.round((accumulators.probesPassed / totalProbes) * 100) / 100 : 0,
    calculatedAt: Date.now(),
  };
}

export function getEvolutionEvents(count: number = 50): EvolutionTelemetryEvent[] {
  return events.slice(-count);
}

export function getEventsByType(type: EvolutionEventType, count: number = 50): EvolutionTelemetryEvent[] {
  return events.filter(e => e.type === type).slice(-count);
}

export function clearEvolutionTelemetry(): void {
  events.length = 0;
  listeners.clear();
  eventCounter = 0;
  Object.keys(accumulators).forEach(k => {
    (accumulators as Record<string, number>)[k] = 0;
  });
}
