/**
 * Redundant Node Pairs (Hot-Standby)
 * SPARTA Epoch — Shadow nodes for critical paths
 * 
 * Maintains hot-standby shadow nodes for critical matrix nodes
 * that auto-activate on breaker open.
 */

import { emit } from '../events';
import type { SubstrateModuleName } from '@/lib/core';

export interface RedundantPair {
  primaryId: SubstrateModuleName;
  standbyId: string;
  status: 'standby' | 'active' | 'failed';
  activatedAt: string | null;
  activationCount: number;
  lastHealthCheck: number;
  standbyHealth: number;
}

// Critical nodes that get hot-standby pairs
const CRITICAL_NODES: SubstrateModuleName[] = ['core', 'brain', 'system', 'nexus', 'defense'];

const pairs = new Map<SubstrateModuleName, RedundantPair>();

function initPairs(): void {
  for (const nodeId of CRITICAL_NODES) {
    if (!pairs.has(nodeId)) {
      pairs.set(nodeId, {
        primaryId: nodeId,
        standbyId: `${nodeId}-standby`,
        status: 'standby',
        activatedAt: null,
        activationCount: 0,
        lastHealthCheck: Date.now(),
        standbyHealth: 100,
      });
    }
  }
}

initPairs();

export function activateStandby(primaryId: SubstrateModuleName): RedundantPair | null {
  const pair = pairs.get(primaryId);
  if (!pair || pair.status === 'active') return pair ?? null;

  pair.status = 'active';
  pair.activatedAt = new Date().toISOString();
  pair.activationCount++;

  emit({
    module: 'system',
    event_type: 'standby_activated',
    outcome: 'succeeded',
    data: { primaryId, standbyId: pair.standbyId, activationCount: pair.activationCount },
  });

  console.warn(`[redundant-nodes] Standby activated for ${primaryId.toUpperCase()}`);
  return pair;
}

export function deactivateStandby(primaryId: SubstrateModuleName): RedundantPair | null {
  const pair = pairs.get(primaryId);
  if (!pair || pair.status !== 'active') return pair ?? null;

  pair.status = 'standby';

  emit({
    module: 'system',
    event_type: 'standby_deactivated',
    outcome: 'succeeded',
    data: { primaryId },
  });

  return pair;
}

export function checkStandbyHealth(primaryId: SubstrateModuleName): number {
  const pair = pairs.get(primaryId);
  if (!pair) return 0;
  pair.lastHealthCheck = Date.now();
  // Standby health degrades slightly over time without exercise
  const age = Date.now() - (pair.lastHealthCheck || Date.now());
  pair.standbyHealth = Math.max(80, 100 - Math.floor(age / 3600000) * 2);
  return pair.standbyHealth;
}

export function getPair(primaryId: SubstrateModuleName): RedundantPair | null {
  return pairs.get(primaryId) ?? null;
}

export function getAllPairs(): RedundantPair[] {
  return Array.from(pairs.values());
}

export function getActivePairs(): RedundantPair[] {
  return Array.from(pairs.values()).filter(p => p.status === 'active');
}

export function isStandbyActive(primaryId: SubstrateModuleName): boolean {
  return (pairs.get(primaryId)?.status === 'active') || false;
}

export function getCriticalNodes(): SubstrateModuleName[] {
  return [...CRITICAL_NODES];
}
