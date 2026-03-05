/**
 * Plan Store — CP-backed durable store for PatchPlan lifecycle.
 * Falls back to in-memory if DB unreachable (degraded mode).
 * Provides CRUD + approval/rejection + history queries.
 */

import type { PatchPlan, PlanStatus } from './types';
import { verifyPlan } from './verifyPlan';
import { emit } from '../events';
import { cpPut, cpGet, cpList, cpDelete } from '../control-plane/adapters/queueStateAdapter';

const MAX_PLANS = 200;

function planKey(planId: string): string {
  return `encode:plan:${planId}`;
}

// ═══════════════════════════════════════════════════════════════
// CRUD
// ═══════════════════════════════════════════════════════════════

export async function storePlan(plan: PatchPlan): Promise<PatchPlan> {
  // Enforce capacity via eviction
  const existing = await cpList<PatchPlan>('encode:plan:');
  if (existing.length >= MAX_PLANS) {
    const evictable = existing
      .filter(e => e.value.status === 'executed' || e.value.status === 'rejected')
      .sort((a, b) => {
        const dateA = new Date(a.value.created_at).getTime();
        const dateB = new Date(b.value.created_at).getTime();
        return dateA - dateB; // oldest first
      });
    if (evictable.length > 0) {
      await cpDelete(evictable[0].key);
    }
  }

  await cpPut<PatchPlan>(planKey(plan.plan_id), plan, {
    status: plan.status,
    created_at: plan.created_at,
  });

  emit({
    module: 'encode',
    event_type: 'plan_stored',
    outcome: 'succeeded',
    data: { plan_id: plan.plan_id, status: plan.status },
  });

  return plan;
}

export async function loadPlan(planId: string): Promise<PatchPlan | null> {
  return cpGet<PatchPlan>(planKey(planId));
}

export async function listPlans(filter?: { status?: PlanStatus }): Promise<PatchPlan[]> {
  const all = await cpList<PatchPlan>('encode:plan:');
  let result = all.map(e => ({ ...e.value })); // clone to avoid mutating cache

  if (filter?.status) {
    result = result.filter(p => p.status === filter.status);
  }

  return result.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA; // newest first
  });
}

// ═══════════════════════════════════════════════════════════════
// LIFECYCLE
// ═══════════════════════════════════════════════════════════════

export async function approvePlan(planId: string, approver?: string): Promise<{ success: boolean; error?: string }> {
  const plan = await loadPlan(planId);
  if (!plan) return { success: false, error: `Plan ${planId} not found` };
  if (plan.status !== 'review' && plan.status !== 'draft') {
    return { success: false, error: `Plan ${planId} is in status "${plan.status}" — only draft/review plans can be approved` };
  }

  const verification = verifyPlan(plan);
  if (!verification.valid) {
    return { success: false, error: `Verification failed: ${verification.errors.join('; ')}` };
  }

  const updated: PatchPlan = {
    ...plan,
    status: 'approved',
    approved_at: new Date().toISOString(),
    approved_by: approver ?? 'user',
  };

  await cpPut<PatchPlan>(planKey(planId), updated, { status: 'approved' });

  emit({
    module: 'encode',
    event_type: 'plan_approved',
    outcome: 'succeeded',
    data: { plan_id: planId, approver: updated.approved_by },
  });

  return { success: true };
}

export async function rejectPlan(planId: string, reason: string): Promise<{ success: boolean; error?: string }> {
  const plan = await loadPlan(planId);
  if (!plan) return { success: false, error: `Plan ${planId} not found` };

  const updated: PatchPlan = {
    ...plan,
    status: 'rejected',
    rejected_reason: reason,
  };

  await cpPut<PatchPlan>(planKey(planId), updated, { status: 'rejected' });

  emit({
    module: 'encode',
    event_type: 'plan_rejected',
    outcome: 'succeeded',
    data: { plan_id: planId, reason },
  });

  return { success: true };
}

export async function markPlanExecuted(planId: string): Promise<{ success: boolean; error?: string }> {
  const plan = await loadPlan(planId);
  if (!plan) return { success: false, error: `Plan ${planId} not found` };
  if (plan.status !== 'approved') {
    return { success: false, error: `Plan ${planId} must be approved before execution (current: ${plan.status})` };
  }

  const updated: PatchPlan = {
    ...plan,
    status: 'executed',
    executed_at: new Date().toISOString(),
  };

  await cpPut<PatchPlan>(planKey(planId), updated, { status: 'executed' });

  emit({
    module: 'encode',
    event_type: 'plan_executed',
    outcome: 'succeeded',
    data: { plan_id: planId },
  });

  return { success: true };
}

// ═══════════════════════════════════════════════════════════════
// HEALTH CHECK (on-demand, no timers)
// ═══════════════════════════════════════════════════════════════

export async function planStoreHealth(): Promise<{ ok: boolean; detail: string }> {
  try {
    const testId = `health-check-${Date.now()}`;
    const testPlan: PatchPlan = {
      plan_id: testId,
      created_at: new Date().toISOString(),
      title: 'Health check',
      intent: 'Validate plan store CRUD',
      modules: [],
      changes: [],
      risks: [],
      questions: [],
      status: 'draft',
    };
    await storePlan(testPlan);
    const loaded = await loadPlan(testId);
    await cpDelete(`encode:plan:${testId}`);

    if (loaded && loaded.plan_id === testId) {
      return { ok: true, detail: 'Plan store CRUD operational' };
    }
    return { ok: false, detail: 'Load returned null after store' };
  } catch (err: unknown) {
    return { ok: false, detail: err instanceof Error ? err.message : 'Unknown error' };
  }
}
