/**
 * Inter-Module Communication Bus
 * Real-time pub/sub for cross-module alerts and coordination.
 * Modules can publish signals and subscribe to other modules' events.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ModuleName =
  | 'core' | 'ripple' | 'access'                          // Kernel
  | 'brain' | 'decode' | 'dream'                           // Cognitive
  | 'defense' | 'nexus' | 'vision' | 'encode'              // Operational
  | 'system' | 'evolution' | 'integration' | 'inclusive'    // Administrative
  | 'cortex' | 'atlas'                                      // Orchestrator
  | 'memory' | 'relay' | 'audit' | 'identity' | 'economy' | 'sandbox' | 'nerve' // Infrastructure + OCG
  | 'forge' | 'lingua' | 'harvest'                                               // EMZ — Manufacturing
  | 'phantom' | 'shadow' | 'evolution'                                             // CSZ — Covert Systems
  | 'sovereign' | 'conscience' | 'treaty' | 'oracle'                               // ESZ — Sovereignty
  | 'compass' | 'echo' | 'reflex';                                                 // EPZ — Perception

export type SignalPriority = 'low' | 'normal' | 'high' | 'critical';

export interface ModuleSignal {
  id: string;
  from: ModuleName;
  to: ModuleName | '*'; // '*' = broadcast
  type: string;
  priority: SignalPriority;
  payload: Record<string, any>;
  timestamp: string;
  ttl_ms: number; // time-to-live
  acknowledged: boolean;
}

export type SignalHandler = (signal: ModuleSignal) => void | Promise<void>;

export interface Subscription {
  id: string;
  module: ModuleName;
  signalType: string | '*';
  handler: SignalHandler;
}

// ═══════════════════════════════════════════════════════════════
// IN-MEMORY BUS (for same-process communication)
// ═══════════════════════════════════════════════════════════════

const subscriptions: Map<string, Subscription> = new Map();
const signalHistory: ModuleSignal[] = [];
const MAX_HISTORY = 500;

// ═══════════════════════════════════════════════════════════════
// PREDEFINED SIGNAL TYPES
// ═══════════════════════════════════════════════════════════════

export const SIGNAL_TYPES = {
  // Health & Status
  HEALTH_DEGRADED: 'health.degraded',
  HEALTH_RECOVERED: 'health.recovered',
  MODULE_OVERLOADED: 'module.overloaded',

  // Security
  THREAT_DETECTED: 'threat.detected',
  RATE_LIMIT_BREACH: 'rate_limit.breach',
  AUTH_ANOMALY: 'auth.anomaly',

  // Evolution
  PROPOSAL_CREATED: 'evolution.proposal_created',
  EVOLUTION_APPLIED: 'evolution.applied',
  REGRESSION_DETECTED: 'evolution.regression',

  // Knowledge
  PATTERN_LEARNED: 'knowledge.pattern_learned',
  MEMORY_PROMOTED: 'knowledge.memory_promoted',
  INSIGHT_GENERATED: 'knowledge.insight',

  // Operational
  QUOTA_WARNING: 'operational.quota_warning',
  PROVIDER_DOWN: 'operational.provider_down',
  COST_SPIKE: 'operational.cost_spike',

  // Dream
  DREAM_INSIGHT: 'dream.insight',
  DREAM_WARNING: 'dream.warning',

  // Planning & Orchestration
  PLAN_CREATED: 'plan.created',
  PLAN_APPROVED: 'plan.approved',
  PLAN_REJECTED: 'plan.rejected',
  PLAN_EXECUTED: 'plan.executed',
  PLAN_QUESTION: 'encode.plan.question',
  PLAN_RISK: 'encode.plan.risk',
  PLAN_ANSWER: 'encode.plan.answer',
  PLAN_READY: 'encode.plan.ready',
} as const;

// ═══════════════════════════════════════════════════════════════
// CROSS-MODULE ROUTING TABLE
// ═══════════════════════════════════════════════════════════════

/** Auto-routing: which modules should receive which signal types */
const AUTO_ROUTES: Record<string, ModuleName[]> = {
  [SIGNAL_TYPES.THREAT_DETECTED]: ['access', 'system', 'vision', 'audit', 'identity'],
  [SIGNAL_TYPES.RATE_LIMIT_BREACH]: ['nexus', 'access', 'defense', 'economy'],
  [SIGNAL_TYPES.PROVIDER_DOWN]: ['nexus', 'decode', 'dream', 'relay'],
  [SIGNAL_TYPES.REGRESSION_DETECTED]: ['evolution', 'system', 'cortex', 'audit'],
  [SIGNAL_TYPES.PATTERN_LEARNED]: ['cortex', 'dream', 'evolution', 'memory'],
  [SIGNAL_TYPES.QUOTA_WARNING]: ['nexus', 'system', 'access', 'economy'],
  [SIGNAL_TYPES.COST_SPIKE]: ['nexus', 'system', 'access', 'economy'],
  [SIGNAL_TYPES.DREAM_INSIGHT]: ['cortex', 'evolution', 'brain', 'memory'],
  [SIGNAL_TYPES.HEALTH_DEGRADED]: ['system', 'vision', 'cortex', 'audit'],
};

// ═══════════════════════════════════════════════════════════════
// PUBLISH / SUBSCRIBE
// ═══════════════════════════════════════════════════════════════

/**
 * Publish a signal to the module bus
 */
export async function publish(
  from: ModuleName,
  type: string,
  payload: Record<string, any>,
  options: {
    to?: ModuleName | '*';
    priority?: SignalPriority;
    ttl_ms?: number;
    persist?: boolean;
  } = {}
): Promise<ModuleSignal> {
  const signal: ModuleSignal = {
    id: crypto.randomUUID(),
    from,
    to: options.to || '*',
    type,
    priority: options.priority || 'normal',
    payload,
    timestamp: new Date().toISOString(),
    ttl_ms: options.ttl_ms || 60000, // 1 minute default
    acknowledged: false,
  };

  // Add to history
  signalHistory.unshift(signal);
  if (signalHistory.length > MAX_HISTORY) signalHistory.pop();

  // Deliver to in-memory subscribers
  const deliveries: Promise<void>[] = [];
  for (const sub of subscriptions.values()) {
    const typeMatch = sub.signalType === '*' || sub.signalType === type;
    const moduleMatch = signal.to === '*' || signal.to === sub.module;
    const autoRouted = AUTO_ROUTES[type]?.includes(sub.module);

    if (typeMatch && (moduleMatch || autoRouted)) {
      deliveries.push(
        Promise.resolve(sub.handler(signal)).catch(err => {
          console.error(`[ModuleBus] Handler error in ${sub.module}:`, err);
        })
      );
    }
  }

  await Promise.allSettled(deliveries);

  // Persist critical signals to database
  if (options.persist || signal.priority === 'critical') {
    await supabase.from('brain_events').insert({
      module: from,
      event_type: `bus:${type}`,
      data: {
        signal_id: signal.id,
        to: signal.to,
        priority: signal.priority,
        payload: signal.payload,
      } as any,
      outcome: 'success',
    });
  }

  return signal;
}

/**
 * Subscribe to signals on the bus
 */
export function subscribe(
  module: ModuleName,
  signalType: string | '*',
  handler: SignalHandler
): string {
  const id = crypto.randomUUID();
  subscriptions.set(id, { id, module, signalType, handler });
  return id;
}

/**
 * Unsubscribe from the bus
 */
export function unsubscribe(subscriptionId: string): boolean {
  return subscriptions.delete(subscriptionId);
}

/**
 * Acknowledge a signal (prevents re-delivery)
 */
export function acknowledge(signalId: string): void {
  const signal = signalHistory.find(s => s.id === signalId);
  if (signal) signal.acknowledged = true;
}

// ═══════════════════════════════════════════════════════════════
// CONVENIENCE PUBLISHERS
// ═══════════════════════════════════════════════════════════════

/** Alert all security-related modules of a threat */
export async function alertThreat(
  from: ModuleName,
  threatType: string,
  details: Record<string, any>
): Promise<void> {
  await publish(from, SIGNAL_TYPES.THREAT_DETECTED, {
    threat_type: threatType,
    ...details,
  }, { priority: 'critical', persist: true });
}

/** Broadcast a health degradation signal */
export async function alertDegraded(
  module: ModuleName,
  reason: string,
  metrics: Record<string, number>
): Promise<void> {
  await publish(module, SIGNAL_TYPES.HEALTH_DEGRADED, {
    reason,
    metrics,
  }, { priority: 'high', persist: true });
}

/** Share a learned pattern with interested modules */
export async function sharePattern(
  from: ModuleName,
  pattern: string,
  confidence: number
): Promise<void> {
  await publish(from, SIGNAL_TYPES.PATTERN_LEARNED, {
    pattern,
    confidence,
  }, { priority: 'normal', persist: true });
}

/** Alert about a potential regression */
export async function alertRegression(
  from: ModuleName,
  details: { metric: string; before: number; after: number; delta: number }
): Promise<void> {
  await publish(from, SIGNAL_TYPES.REGRESSION_DETECTED, details, {
    priority: 'critical',
    persist: true,
  });
}

// ═══════════════════════════════════════════════════════════════
// QUERIES & DIAGNOSTICS
// ═══════════════════════════════════════════════════════════════

/** Get recent signals (optionally filtered) */
export function getRecentSignals(options?: {
  from?: ModuleName;
  type?: string;
  priority?: SignalPriority;
  limit?: number;
}): ModuleSignal[] {
  let signals = [...signalHistory];

  if (options?.from) signals = signals.filter(s => s.from === options.from);
  if (options?.type) signals = signals.filter(s => s.type === options.type);
  if (options?.priority) signals = signals.filter(s => s.priority === options.priority);

  return signals.slice(0, options?.limit || 50);
}

/** Get bus statistics */
export function getBusStats(): {
  total_signals: number;
  active_subscriptions: number;
  signals_by_type: Record<string, number>;
  signals_by_module: Record<string, number>;
  unacknowledged: number;
} {
  const byType: Record<string, number> = {};
  const byModule: Record<string, number> = {};
  let unacked = 0;

  for (const signal of signalHistory) {
    byType[signal.type] = (byType[signal.type] || 0) + 1;
    byModule[signal.from] = (byModule[signal.from] || 0) + 1;
    if (!signal.acknowledged) unacked++;
  }

  return {
    total_signals: signalHistory.length,
    active_subscriptions: subscriptions.size,
    signals_by_type: byType,
    signals_by_module: byModule,
    unacknowledged: unacked,
  };
}

/** Clear expired signals from history */
export function cleanupExpired(): number {
  const now = Date.now();
  const before = signalHistory.length;
  
  const active = signalHistory.filter(s => {
    const age = now - new Date(s.timestamp).getTime();
    return age < s.ttl_ms;
  });
  
  signalHistory.length = 0;
  signalHistory.push(...active);
  
  return before - active.length;
}
