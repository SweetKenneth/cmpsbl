/**
 * Per-Node Canary Deployment Engine
 * Staged rollouts at matrix node level
 * 
 * Allows promoting changes to 5% → 25% → 50% → 100% of traffic per node,
 * with automatic rollback on health degradation.
 */

import { emit } from '../events';
import type { SubstrateModuleName } from '@/lib/core';

export interface NodeCanary {
  id: string;
  nodeId: SubstrateModuleName;
  stage: number; // index into CANARY_STAGES
  healthBaseline: number;
  healthCurrent: number;
  status: 'active' | 'promoted' | 'rolled_back' | 'paused';
  createdAt: number;
  lastAdvanced: number;
  rollbackReason: string | null;
}

const CANARY_STAGES = [5, 25, 50, 100];
const HEALTH_DROP_THRESHOLD = 15; // rollback if health drops more than 15%

const canaries = new Map<string, NodeCanary>();

export function createNodeCanary(nodeId: SubstrateModuleName, baselineHealth: number): NodeCanary {
  const canary: NodeCanary = {
    id: `nc-${nodeId}-${Date.now()}`,
    nodeId,
    stage: 0,
    healthBaseline: baselineHealth,
    healthCurrent: baselineHealth,
    status: 'active',
    createdAt: Date.now(),
    lastAdvanced: Date.now(),
    rollbackReason: null,
  };
  canaries.set(canary.id, canary);

  emit({
    module: 'system',
    event_type: 'node_canary_created',
    outcome: 'succeeded',
    data: { nodeId, stage: CANARY_STAGES[0], canaryId: canary.id },
  });

  return canary;
}

export function advanceCanary(canaryId: string): NodeCanary | null {
  const c = canaries.get(canaryId);
  if (!c || c.status !== 'active') return null;

  // Check health before advancing
  const healthDrop = c.healthBaseline - c.healthCurrent;
  if (healthDrop > HEALTH_DROP_THRESHOLD) {
    c.status = 'rolled_back';
    c.rollbackReason = `Health dropped ${healthDrop}% (baseline: ${c.healthBaseline}, current: ${c.healthCurrent})`;
    emit({
      module: 'system',
      event_type: 'node_canary_rolled_back',
      outcome: 'failed',
      data: { nodeId: c.nodeId, reason: c.rollbackReason },
    });
    return c;
  }

  if (c.stage >= CANARY_STAGES.length - 1) {
    c.status = 'promoted';
    emit({
      module: 'system',
      event_type: 'node_canary_promoted',
      outcome: 'succeeded',
      data: { nodeId: c.nodeId },
    });
    return c;
  }

  c.stage++;
  c.lastAdvanced = Date.now();
  emit({
    module: 'system',
    event_type: 'node_canary_advanced',
    outcome: 'succeeded',
    data: { nodeId: c.nodeId, stage: CANARY_STAGES[c.stage], percent: CANARY_STAGES[c.stage] },
  });
  return c;
}

export function updateCanaryHealth(canaryId: string, health: number): void {
  const c = canaries.get(canaryId);
  if (c) c.healthCurrent = health;
}

export function rollbackCanary(canaryId: string, reason: string): NodeCanary | null {
  const c = canaries.get(canaryId);
  if (!c || c.status !== 'active') return null;
  c.status = 'rolled_back';
  c.rollbackReason = reason;
  emit({
    module: 'system',
    event_type: 'node_canary_rolled_back',
    outcome: 'failed',
    data: { nodeId: c.nodeId, reason },
  });
  return c;
}

export function getCanaryTrafficPercent(canaryId: string): number {
  const c = canaries.get(canaryId);
  if (!c || c.status !== 'active') return 0;
  return CANARY_STAGES[c.stage] ?? 0;
}

export function getActiveCanaries(): NodeCanary[] {
  return Array.from(canaries.values()).filter(c => c.status === 'active');
}

export function getAllCanaries(): NodeCanary[] {
  return Array.from(canaries.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function getCanaryStages(): number[] {
  return [...CANARY_STAGES];
}
