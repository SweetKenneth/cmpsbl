/**
 * CMPSBL System Audit Runner
 * Runs a full audit across critical subsystems — browser-safe, no timers.
 */

import { cpPut, cpGet, cpDelete, getStorageMode } from '../control-plane/adapters/queueStateAdapter';
import { verifyChain } from '../matrix/receipt-chain';
import { getStreamStats } from '../module-bus/eventStream';
import { planStoreHealth } from '../plans/planStore';
import { discussionHealth } from '../encode-module/discussion';
import { getIroncladState } from '../ironclad/fabric';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface AuditResult {
  ok: boolean;
  module: string;
  detail: string;
}

export interface AuditReport {
  startedAt: number;
  completedAt: number;
  results: AuditResult[];
  success: boolean;
}

// ═══════════════════════════════════════════════════════════════
// INDIVIDUAL CHECKS
// ═══════════════════════════════════════════════════════════════

async function testCPStorage(): Promise<AuditResult> {
  try {
    const key = `audit:test:${Date.now()}`;
    const value = { ok: true };

    await cpPut(key, value);
    const loaded = await cpGet<typeof value>(key);

    if (!loaded || !loaded.ok) {
      return { ok: false, module: 'control_plane', detail: 'cpGet returned invalid data' };
    }

    await cpDelete(key);

    return {
      ok: true,
      module: 'control_plane',
      detail: `CP operational (mode=${getStorageMode()})`,
    };
  } catch (err: any) {
    return { ok: false, module: 'control_plane', detail: err?.message || 'error' };
  }
}

async function testReceiptChain(): Promise<AuditResult> {
  try {
    const integrity = await verifyChain();

    if (!integrity.valid) {
      return {
        ok: false,
        module: 'mutation_chain',
        detail: `chain broken at index ${integrity.brokenAt}`,
      };
    }

    return {
      ok: true,
      module: 'mutation_chain',
      detail: `chain valid, length=${integrity.length}`,
    };
  } catch (err: any) {
    return { ok: false, module: 'mutation_chain', detail: err?.message || 'verification failed' };
  }
}

function testEventStream(): AuditResult {
  try {
    const stats = getStreamStats();
    return {
      ok: true,
      module: 'event_stream',
      detail: `buffer=${stats.buffer_size}/${stats.max_size}, captured=${stats.total_captured}`,
    };
  } catch (err: any) {
    return { ok: false, module: 'event_stream', detail: err?.message || 'stream failure' };
  }
}

async function testPlans(): Promise<AuditResult> {
  try {
    const health = await planStoreHealth();
    return { ok: health.ok, module: 'plan_store', detail: health.detail };
  } catch (err: any) {
    return { ok: false, module: 'plan_store', detail: err?.message || 'plan store error' };
  }
}

async function testDiscussion(): Promise<AuditResult> {
  try {
    const health = await discussionHealth();
    return { ok: health.ok, module: 'discussion', detail: health.detail };
  } catch (err: any) {
    return { ok: false, module: 'discussion', detail: err?.message || 'discussion error' };
  }
}

function testIronclad(): AuditResult {
  try {
    const state = getIroncladState('core');
    return {
      ok: true,
      module: 'ironclad',
      detail: `requests=${state.requestCount}, rejected=${state.rejectedCount}`,
    };
  } catch (err: any) {
    return { ok: false, module: 'ironclad', detail: err?.message || 'ironclad error' };
  }
}

// ═══════════════════════════════════════════════════════════════
// RUNNER
// ═══════════════════════════════════════════════════════════════

export async function runSystemAudit(): Promise<AuditReport> {
  const startedAt = Date.now();

  // Run async checks in parallel, sync checks inline
  const [cpResult, chainResult, planResult, discussionResult] = await Promise.all([
    testCPStorage(),
    testReceiptChain(),
    testPlans(),
    testDiscussion(),
  ]);

  const results: AuditResult[] = [
    cpResult,
    chainResult,
    testEventStream(),
    planResult,
    discussionResult,
    testIronclad(),
  ];

  const success = results.every(r => r.ok);

  return {
    startedAt,
    completedAt: Date.now(),
    results,
    success,
  };
}
