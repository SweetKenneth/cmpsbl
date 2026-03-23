/**
 * AUDIT — Retention & Archival Manager
 * Policy-driven lifecycle: hot (in-memory) → warm (compressed) → cold (archived).
 * Configurable TTLs and automatic pruning.
 * @module audit/retentionArchivalManager
 * @version 9.0.0 — Sentinel
 */

import type { AuditReceipt } from '../receipts';

// ── Types ──────────────────────────────────────────────────────────────────

export type RetentionTier = 'hot' | 'warm' | 'cold' | 'expired';

export interface RetentionPolicy {
  hotTtlMs: number;
  warmTtlMs: number;
  coldTtlMs: number;
  hotCapacity: number;
  warmCapacity: number;
}

export interface TieredReceipt {
  receipt: AuditReceipt;
  tier: RetentionTier;
  archivedAt?: number;
}

export interface RetentionStats {
  hot: number;
  warm: number;
  cold: number;
  expired: number;
  totalPruned: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_POLICY: RetentionPolicy = {
  hotTtlMs: 14 * 24 * 3600 * 1000,    // 14 days
  warmTtlMs: 30 * 24 * 3600 * 1000,   // 30 days
  coldTtlMs: 180 * 24 * 3600 * 1000,  // 180 days
  hotCapacity: 500,
  warmCapacity: 5000,
};

// ── State ──────────────────────────────────────────────────────────────────

let policy = { ...DEFAULT_POLICY };
const hotStore: TieredReceipt[] = [];
const warmStore: TieredReceipt[] = [];
const coldStore: TieredReceipt[] = [];
let totalPruned = 0;

// ── Core ───────────────────────────────────────────────────────────────────

export function setRetentionPolicy(p: Partial<RetentionPolicy>): void {
  policy = { ...policy, ...p };
}

export function getRetentionPolicy(): RetentionPolicy {
  return { ...policy };
}

export function ingestReceipt(receipt: AuditReceipt): RetentionTier {
  const tiered: TieredReceipt = { receipt, tier: 'hot' };
  hotStore.push(tiered);

  // Enforce hot capacity
  while (hotStore.length > policy.hotCapacity) {
    const demoted = hotStore.shift();
    if (demoted) {
      demoted.tier = 'warm';
      demoted.archivedAt = Date.now();
      warmStore.push(demoted);
    }
  }

  // Enforce warm capacity
  while (warmStore.length > policy.warmCapacity) {
    const demoted = warmStore.shift();
    if (demoted) {
      demoted.tier = 'cold';
      demoted.archivedAt = Date.now();
      coldStore.push(demoted);
    }
  }

  return 'hot';
}

export function runRetentionCycle(): RetentionStats {
  const now = Date.now();
  let pruned = 0;

  // Age-out hot → warm
  const hotCutoff = now - policy.hotTtlMs;
  while (hotStore.length > 0) {
    const oldest = hotStore[0];
    const time = new Date(oldest.receipt.timestamp).getTime();
    if (time < hotCutoff) {
      const demoted = hotStore.shift()!;
      demoted.tier = 'warm';
      demoted.archivedAt = now;
      warmStore.push(demoted);
    } else break;
  }

  // Age-out warm → cold
  const warmCutoff = now - policy.warmTtlMs;
  while (warmStore.length > 0) {
    const oldest = warmStore[0];
    const time = new Date(oldest.receipt.timestamp).getTime();
    if (time < warmCutoff) {
      const demoted = warmStore.shift()!;
      demoted.tier = 'cold';
      demoted.archivedAt = now;
      coldStore.push(demoted);
    } else break;
  }

  // Expire cold
  const coldCutoff = now - policy.coldTtlMs;
  while (coldStore.length > 0) {
    const oldest = coldStore[0];
    const time = new Date(oldest.receipt.timestamp).getTime();
    if (time < coldCutoff) {
      coldStore.shift();
      pruned++;
    } else break;
  }

  totalPruned += pruned;

  return {
    hot: hotStore.length,
    warm: warmStore.length,
    cold: coldStore.length,
    expired: pruned,
    totalPruned,
  };
}

export function queryTier(tier: RetentionTier): AuditReceipt[] {
  switch (tier) {
    case 'hot': return hotStore.map(t => t.receipt);
    case 'warm': return warmStore.map(t => t.receipt);
    case 'cold': return coldStore.map(t => t.receipt);
    default: return [];
  }
}

export function getRetentionStats(): RetentionStats {
  return {
    hot: hotStore.length,
    warm: warmStore.length,
    cold: coldStore.length,
    expired: 0,
    totalPruned,
  };
}

export function resetRetention(): void {
  hotStore.length = 0;
  warmStore.length = 0;
  coldStore.length = 0;
  totalPruned = 0;
  policy = { ...DEFAULT_POLICY };
}
