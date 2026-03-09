/**
 * REFLEX CLM — Continuous Learning Module
 * Monitors latency, node health, rule effectiveness, throughput, and decision confidence.
 */

import { getReflexState, getReflexHealth } from '../reflex-module';

export interface ReflexCLMInsight {
  id: string;
  type: 'latency_spike' | 'node_degradation' | 'rule_ineffective' | 'throughput_drop' | 'low_confidence';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: number;
  threshold: number;
  timestamp: number;
}

export interface ReflexCLMReport {
  health: number;
  totalDecisions: number;
  avgLatencyMs: number;
  p99LatencyMs: number;
  activeNodes: number;
  throughputPerSec: number;
  ruleCount: number;
  insights: ReflexCLMInsight[];
  lastCycleAt: number;
}

let lastCycleAt = 0;
const insightHistory: ReflexCLMInsight[] = [];
const MAX_INSIGHTS = 100;

function createInsight(
  type: ReflexCLMInsight['type'],
  severity: ReflexCLMInsight['severity'],
  message: string,
  metric: number,
  threshold: number,
): ReflexCLMInsight {
  const insight: ReflexCLMInsight = {
    id: `reflex-clm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type, severity, message, metric, threshold, timestamp: Date.now(),
  };
  if (insightHistory.length >= MAX_INSIGHTS) insightHistory.shift();
  insightHistory.push(insight);
  return insight;
}

export function runReflexCLMCycle(): ReflexCLMReport {
  const state = getReflexState();
  const health = getReflexHealth();
  const insights: ReflexCLMInsight[] = [];

  // 1. P99 latency spike
  if (state.p99LatencyMs > 10) {
    insights.push(createInsight(
      'latency_spike', state.p99LatencyMs > 50 ? 'critical' : state.p99LatencyMs > 25 ? 'high' : 'medium',
      `P99 latency at ${state.p99LatencyMs.toFixed(2)}ms (target: <10ms)`,
      state.p99LatencyMs, 10,
    ));
  }

  // 2. Node degradation
  const degradedNodes = state.nodes.filter(n => n.status === 'degraded' || n.status === 'overloaded');
  const offlineNodes = state.nodes.filter(n => n.status === 'offline');
  if (degradedNodes.length > 0 || offlineNodes.length > 0) {
    insights.push(createInsight(
      'node_degradation', offlineNodes.length > 0 ? 'high' : 'medium',
      `${degradedNodes.length} degraded, ${offlineNodes.length} offline out of ${state.nodes.length} nodes`,
      degradedNodes.length + offlineNodes.length, 0,
    ));
  }

  // 3. Ineffective rules — enabled but never hit
  const deadRules = state.rules.filter(r => r.enabled && r.hitCount === 0);
  if (deadRules.length >= 5 && state.totalDecisions > 50) {
    insights.push(createInsight(
      'rule_ineffective', 'low',
      `${deadRules.length} enabled rules with zero hits after ${state.totalDecisions} decisions`,
      deadRules.length, 5,
    ));
  }

  // 4. Low decision confidence
  const recentDecisions = state.decisions.slice(-50);
  const lowConf = recentDecisions.filter(d => d.confidence < 0.5);
  if (lowConf.length >= 10) {
    insights.push(createInsight(
      'low_confidence', lowConf.length >= 25 ? 'high' : 'medium',
      `${lowConf.length} of last ${recentDecisions.length} decisions below 50% confidence`,
      lowConf.length, 10,
    ));
  }

  // 5. Throughput drop (only meaningful if we've had traffic)
  if (state.totalDecisions > 100 && state.throughputPerSec < 1) {
    insights.push(createInsight(
      'throughput_drop', 'medium',
      `Throughput at ${state.throughputPerSec.toFixed(2)}/sec — possible stall`,
      state.throughputPerSec, 1,
    ));
  }

  lastCycleAt = Date.now();

  return {
    health,
    totalDecisions: state.totalDecisions,
    avgLatencyMs: state.avgLatencyMs,
    p99LatencyMs: state.p99LatencyMs,
    activeNodes: state.activeNodes,
    throughputPerSec: state.throughputPerSec,
    ruleCount: state.rules.length,
    insights,
    lastCycleAt,
  };
}

export function reflexCLM() {
  return {
    run: runReflexCLMCycle,
    getInsights: () => [...insightHistory],
    getLastCycleAt: () => lastCycleAt,
  };
}
