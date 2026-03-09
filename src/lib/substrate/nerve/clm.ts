/**
 * NERVE CLM — Constant Learning Mode
 * Tracks signal quality, routing efficiency, and failure patterns.
 */

import {
  getNerveStats,
  getAllCircuits,
  getAllBackpressure,
  getHeartbeats,
  type NerveStats,
} from './index';

export interface NerveCLMCycle {
  cycleId: string;
  timestamp: number;
  stats: NerveStats;
  insights: NerveCLMInsight[];
  healthScore: number;
}

export interface NerveCLMInsight {
  type: 'info' | 'warning' | 'critical';
  code: string;
  message: string;
  data?: Record<string, unknown>;
}

const cycles: NerveCLMCycle[] = [];
const MAX_CYCLES = 50;

export function runNerveCLMCycle(): NerveCLMCycle {
  const stats = getNerveStats();
  const circuits = getAllCircuits();
  const bp = getAllBackpressure();
  const hb = getHeartbeats();
  const insights: NerveCLMInsight[] = [];

  // Check for dead nodes
  const deadNodes = hb.filter(h => h.status === 'dead');
  if (deadNodes.length > 0) {
    insights.push({
      type: 'critical',
      code: 'DEAD_NODES',
      message: `${deadNodes.length} node(s) unresponsive: ${deadNodes.map(d => d.nodeId).join(', ')}`,
      data: { nodes: deadNodes.map(d => d.nodeId) },
    });
  }

  // Check for open circuits
  const openCircuits = circuits.filter(c => c.state === 'open');
  if (openCircuits.length > 0) {
    insights.push({
      type: 'warning',
      code: 'OPEN_CIRCUITS',
      message: `${openCircuits.length} circuit(s) open: ${openCircuits.map(c => c.nodeId).join(', ')}`,
      data: { nodes: openCircuits.map(c => c.nodeId) },
    });
  }

  // Check for high backpressure
  const criticalBP = bp.filter(b => b.pressureLevel === 'critical' || b.pressureLevel === 'high');
  if (criticalBP.length > 0) {
    insights.push({
      type: 'warning',
      code: 'BACKPRESSURE_HIGH',
      message: `${criticalBP.length} node(s) under heavy backpressure`,
      data: { nodes: criticalBP.map(b => b.nodeId) },
    });
  }

  // Check dedup effectiveness
  const totalSignals = stats.signalsSent + stats.signalsDeduped;
  if (totalSignals > 100 && stats.signalsDeduped / totalSignals > 0.3) {
    insights.push({
      type: 'info',
      code: 'HIGH_DEDUP_RATE',
      message: `${((stats.signalsDeduped / totalSignals) * 100).toFixed(1)}% signals deduplicated — possible upstream redundancy`,
    });
  }

  // Check latency
  if (stats.avgLatencyMs > 200) {
    insights.push({
      type: 'warning',
      code: 'HIGH_LATENCY',
      message: `Average signal latency ${stats.avgLatencyMs.toFixed(1)}ms exceeds 200ms threshold`,
    });
  }

  // Derive health score (0-100)
  let healthScore = 100;
  healthScore -= deadNodes.length * 15;
  healthScore -= openCircuits.length * 10;
  healthScore -= criticalBP.length * 5;
  if (stats.avgLatencyMs > 200) healthScore -= 10;
  if (stats.avgLatencyMs > 500) healthScore -= 15;
  healthScore = Math.max(0, Math.min(100, healthScore));

  const cycle: NerveCLMCycle = {
    cycleId: `nrv-clm-${Date.now()}`,
    timestamp: Date.now(),
    stats,
    insights,
    healthScore,
  };

  cycles.push(cycle);
  if (cycles.length > MAX_CYCLES) cycles.splice(0, cycles.length - MAX_CYCLES);

  return cycle;
}

export function getNerveCLMHistory(limit = 10): NerveCLMCycle[] {
  return cycles.slice(-limit);
}

export function getLatestNerveCLMCycle(): NerveCLMCycle | null {
  return cycles.length > 0 ? cycles[cycles.length - 1] : null;
}
