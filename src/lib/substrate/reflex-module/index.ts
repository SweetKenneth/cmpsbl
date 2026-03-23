/**
 * REFLEX Module — Real-Time Edge Computing Orchestration
 * Sub-10ms decision loops for IoT/robotics/autonomous systems
 * Circuit Breaker + Hot-Swap + Graceful Fallback
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, withResilienceSync, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';
import { validateStringInput, clampNumber } from '@/lib/system/hardening';
import { createModuleHardening, type ModuleHardening } from '../module-hardening';

export type EdgeNodeStatus = 'online' | 'offline' | 'degraded' | 'overloaded';
export type DecisionPriority = 'critical' | 'high' | 'normal' | 'low';

export interface EdgeNode {
  id: string;
  name: string;
  region: string;
  status: EdgeNodeStatus;
  latencyMs: number;
  capacityPercent: number;
  decisionsProcessed: number;
  lastHeartbeat: number;
}

export interface ReflexDecision {
  id: string;
  nodeId: string;
  trigger: string;
  action: string;
  priority: DecisionPriority;
  latencyMs: number;
  confidence: number;
  timestamp: number;
}

export interface ReflexRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: DecisionPriority;
  maxLatencyMs: number;
  enabled: boolean;
  hitCount: number;
}

export interface ReflexModuleState {
  initialized: boolean;
  nodes: EdgeNode[];
  decisions: ReflexDecision[];
  rules: ReflexRule[];
  totalDecisions: number;
  avgLatencyMs: number;
  p99LatencyMs: number;
  activeNodes: number;
  throughputPerSec: number;
}

const state: ReflexModuleState = {
  initialized: false,
  nodes: [],
  decisions: [],
  rules: [],
  totalDecisions: 0,
  avgLatencyMs: 0,
  p99LatencyMs: 0,
  activeNodes: 0,
  throughputPerSec: 0,
};

let moduleEngine: ModuleEngine | null = null;
let hardening: ModuleHardening | null = null;

export function initReflex(): void {
  emitStarted('reflex', 'init', {});
  try {
    initCircuitBreaker('reflex', { failureThreshold: 3, recoveryTimeout: 10_000 });
    moduleEngine = activateModuleEngine('reflex', '1.0.0');
    hardening = createModuleHardening('reflex', { maxConcurrent: 20, rateLimit: 500, healthThreshold: 30 });
    state.initialized = true;
    hardening.startAutoRestore(() => getReflexHealth(), () => { state.p99LatencyMs = 0; state.avgLatencyMs = 0; }, 15_000);
    hardening.snapshot(state);
    emitSucceeded('reflex', 'init', { engineId: moduleEngine.instance.id });
  } catch (err) {
    state.initialized = true;
    emitFailed('reflex', 'init', err instanceof Error ? err.message : String(err));
  }
}

export function registerNode(name: string, region: string): EdgeNode {
  const node: EdgeNode = {
    id: `edge-${Date.now()}-${state.nodes.length}`,
    name: validateStringInput(name, { maxLength: 100 }) ?? 'node',
    region, status: 'online', latencyMs: 1 + Math.random() * 5,
    capacityPercent: 0, decisionsProcessed: 0, lastHeartbeat: Date.now(),
  };
  if (state.nodes.length >= 100) state.nodes.shift();
  state.nodes.push(node);
  recalculate();
  emit({ module: 'reflex', event_type: 'node_registered', outcome: 'succeeded', data: { id: node.id, region } });
  return node;
}

export function addRule(name: string, condition: string, action: string, priority: DecisionPriority = 'normal', maxLatencyMs: number = 10): ReflexRule {
  const rule: ReflexRule = {
    id: `rule-${Date.now()}-${state.rules.length}`, name, condition, action,
    priority, maxLatencyMs: clampNumber(maxLatencyMs, 1, 1000, 10), enabled: true, hitCount: 0,
  };
  if (state.rules.length >= 200) state.rules.shift();
  state.rules.push(rule);
  return rule;
}

export function decide(trigger: string, context?: Record<string, unknown>): ReflexDecision {
  const fallback: ReflexDecision = {
    id: `dec-fallback-${Date.now()}`, nodeId: 'none', trigger, action: 'noop',
    priority: 'low', latencyMs: 0, confidence: 0, timestamp: Date.now(),
  };

  const { result } = withResilienceSync('reflex', () => {
    const start = performance.now();

    // Find matching rule
    const matchedRule = state.rules.find(r => r.enabled && trigger.includes(r.condition));
    const bestNode = state.nodes
      .filter(n => n.status === 'online')
      .sort((a, b) => a.latencyMs - b.latencyMs)[0];

    const latency = performance.now() - start;

    const decision: ReflexDecision = {
      id: `dec-${Date.now()}-${state.totalDecisions}`,
      nodeId: bestNode?.id ?? 'local',
      trigger, action: matchedRule?.action ?? 'default_action',
      priority: matchedRule?.priority ?? 'normal',
      latencyMs: latency, confidence: matchedRule ? 0.95 : 0.5,
      timestamp: Date.now(),
    };

    if (matchedRule) matchedRule.hitCount++;
    if (bestNode) { bestNode.decisionsProcessed++; bestNode.lastHeartbeat = Date.now(); }

    if (state.decisions.length >= 1000) state.decisions.shift();
    state.decisions.push(decision);
    state.totalDecisions++;
    recalculate();

    return decision;
  }, fallback, 'decide');

  return result;
}

export function heartbeat(nodeId: string, metrics?: { latencyMs?: number; capacityPercent?: number }): boolean {
  const node = state.nodes.find(n => n.id === nodeId);
  if (!node) return false;
  node.lastHeartbeat = Date.now();
  if (metrics?.latencyMs !== undefined) node.latencyMs = clampNumber(metrics.latencyMs, 0, 10000, node.latencyMs);
  if (metrics?.capacityPercent !== undefined) node.capacityPercent = clampNumber(metrics.capacityPercent, 0, 100, node.capacityPercent);
  node.status = node.capacityPercent > 90 ? 'overloaded' : 'online';
  recalculate();
  return true;
}

function recalculate(): void {
  state.activeNodes = state.nodes.filter(n => n.status === 'online').length;
  const recent = state.decisions.slice(-100);
  if (recent.length > 0) {
    state.avgLatencyMs = recent.reduce((s, d) => s + d.latencyMs, 0) / recent.length;
    const sorted = [...recent].sort((a, b) => a.latencyMs - b.latencyMs);
    state.p99LatencyMs = sorted[Math.floor(sorted.length * 0.99)]?.latencyMs ?? 0;
  }
  // Approximate throughput
  if (recent.length >= 2) {
    const span = (recent[recent.length - 1].timestamp - recent[0].timestamp) / 1000;
    state.throughputPerSec = span > 0 ? recent.length / span : 0;
  }
}

export function getReflexState(): ReflexModuleState { return { ...state }; }
export function getReflexHealth(): number { if (!state.initialized) return 0; const h = clampNumber(100 - (state.p99LatencyMs > 10 ? 20 : 0), 0, 100, 100); if (hardening?.isDegraded()) return Math.min(h, 40); return h; }
export function getReflexResilience() { return getModuleResilienceReport('reflex', getReflexHealth()); }
export function getReflexEngine() { return moduleEngine; }
export function getReflexHardening() { return hardening?.getHardeningReport() ?? null; }
export function upgradeReflexEngine(v: string) { if (moduleEngine && hardening) { hardening.snapshot(state); moduleEngine = hardening.upgradeEngine(moduleEngine, v); } return moduleEngine; }

// ── Ultimate Systems ─────────────────────────────────────────────
export * as ReflexUltimate from './ultimate';

