/**
 * Plan Store — In-memory store for PatchPlan lifecycle management.
 * Provides CRUD + approval/rejection + history queries.
 */

import type { PatchPlan, PlanStatus } from './types';
import { verifyPlan } from './verifyPlan';
import { emit } from '../events';

const plans: Map<string, PatchPlan> = new Map();
const MAX_PLANS = 200;

// ═══════════════════════════════════════════════════════════════
// CRUD
// ═══════════════════════════════════════════════════════════════

export function storePlan(plan: PatchPlan): PatchPlan {
  // Enforce capacity
  if (plans.size >= MAX_PLANS) {
    const oldest = [...plans.values()]
      .filter(p => p.status === 'executed' || p.status === 'rejected')
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    if (oldest.length > 0) {
      plans.delete(oldest[0].plan_id);
    }
  }

  plans.set(plan.plan_id, plan);
  emit({
    module: 'encode',
    event_type: 'plan_stored',
    outcome: 'succeeded',
    data: { plan_id: plan.plan_id, status: plan.status },
  });
  return plan;
}

export function loadPlan(planId: string): PatchPlan | null {
  return plans.get(planId) ?? null;
}

export function listPlans(filter?: { status?: PlanStatus }): PatchPlan[] {
  let result = [...plans.values()];
  if (filter?.status) {
    result = result.filter(p => p.status === filter.status);
  }
  return result.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// ═══════════════════════════════════════════════════════════════
// LIFECYCLE
// ═══════════════════════════════════════════════════════════════

export function approvePlan(planId: string, approver?: string): { success: boolean; error?: string } {
  const plan = plans.get(planId);
  if (!plan) return { success: false, error: `Plan ${planId} not found` };
  if (plan.status !== 'review' && plan.status !== 'draft') {
    return { success: false, error: `Plan ${planId} is in status "${plan.status}" — only draft/review plans can be approved` };
  }

  // Verify before approving
  const verification = verifyPlan(plan);
  if (!verification.valid) {
    return { success: false, error: `Verification failed: ${verification.errors.join('; ')}` };
  }

  plan.status = 'approved';
  plan.approved_at = new Date().toISOString();
  plan.approved_by = approver ?? 'user';

  emit({
    module: 'encode',
    event_type: 'plan_approved',
    outcome: 'succeeded',
    data: { plan_id: planId, approver: plan.approved_by },
  });

  return { success: true };
}

export function rejectPlan(planId: string, reason: string): { success: boolean; error?: string } {
  const plan = plans.get(planId);
  if (!plan) return { success: false, error: `Plan ${planId} not found` };

  plan.status = 'rejected';
  plan.rejected_reason = reason;

  emit({
    module: 'encode',
    event_type: 'plan_rejected',
    outcome: 'succeeded',
    data: { plan_id: planId, reason },
  });

  return { success: true };
}

export function markPlanExecuted(planId: string): { success: boolean; error?: string } {
  const plan = plans.get(planId);
  if (!plan) return { success: false, error: `Plan ${planId} not found` };
  if (plan.status !== 'approved') {
    return { success: false, error: `Plan ${planId} must be approved before execution (current: ${plan.status})` };
  }

  plan.status = 'executed';
  plan.executed_at = new Date().toISOString();

  emit({
    module: 'encode',
    event_type: 'plan_executed',
    outcome: 'succeeded',
    data: { plan_id: planId },
  });

  return { success: true };
}
