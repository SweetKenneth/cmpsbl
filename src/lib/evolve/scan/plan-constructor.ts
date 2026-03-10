/**
 * Plan Constructor — v0.7.9 — Always Produces Valid Plans
 * 
 * CRITICAL FIX: Plans are ALWAYS created, even when blocked.
 * - Blocked plans have status='blocked' and are inspectable
 * - No more "INTERNAL_ERROR - invalid input" failures
 * - Zero undefined or malformed fields
 */

import type { NormalizedAction, NormalizationResult } from './normalizer';
import { evolutionRuns, type CreateRunOptions } from '../evolution-runs';
import { emitEvolveEvent } from '../telemetry';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type PlanStatus = 'ready' | 'blocked' | 'pending_review';

export type PlanBlockerCode = 
  | 'NO_NORMALIZED_ACTIONS'
  | 'NORMALIZATION_FAILED'
  | 'ACTIVE_RUN_EXISTS'
  | 'CIRCUIT_OPEN'
  | 'LOW_CONFIDENCE'
  | 'HIGH_RISK';

export interface PlanBlocker {
  code: PlanBlockerCode;
  message: string;
  details?: Record<string, unknown>;
}

export interface NormalizedPlan {
  plan_id: string;
  scan_id: string;
  normalized: true;
  status: PlanStatus;
  actions: NormalizedAction[];
  total_actions: number;
  risk_summary: {
    low: number;
    medium: number;
    high: number;
  };
  requires_human_review: boolean;
  blockers: PlanBlocker[];
  created_at: string;
  metadata: {
    normalization_summary: NormalizationResult['summary'];
    source_proposals_count: number;
  };
}

export interface PlanCreationResult {
  success: boolean;
  plan: NormalizedPlan;
  run_id?: string;
  stored: boolean; // Whether plan was persisted to DB
}

// ═══════════════════════════════════════════════════════════════
// PLAN CONSTRUCTOR — v0.7.9
// ═══════════════════════════════════════════════════════════════

/**
 * Create evolution plan from normalized actions
 * ALWAYS returns a valid plan - blocked plans are inspectable
 */
export async function createPlanFromNormalized(
  scanId: string,
  normalizationResult: NormalizationResult
): Promise<PlanCreationResult> {
  const planId = crypto.randomUUID();
  const blockers: PlanBlocker[] = [];
  
  // Collect blockers instead of failing
  if (!normalizationResult.success) {
    blockers.push({
      code: 'NORMALIZATION_FAILED',
      message: 'Normalization did not produce valid actions',
      details: {
        rejected_count: normalizationResult.rejected_proposals.length,
        rejection_breakdown: normalizationResult.summary.rejection_breakdown,
      },
    });
  }

  if (!normalizationResult.can_create_plan || normalizationResult.normalized_actions.length === 0) {
    blockers.push({
      code: 'NO_NORMALIZED_ACTIONS',
      message: normalizationResult.blocking_reason || 'No executable actions available',
      details: {
        total_proposals: normalizationResult.summary.total_proposals,
        rejected_count: normalizationResult.summary.rejected_count,
      },
    });
  }

  // Calculate risk summary (use empty arrays safely)
  const actions = normalizationResult.normalized_actions || [];
  const riskSummary = {
    low: actions.filter(a => a.risk_level === 'low').length,
    medium: actions.filter(a => a.risk_level === 'medium').length,
    high: actions.filter(a => a.risk_level === 'high').length,
  };

  // Determine if human review required
  const requiresHumanReview = actions.some(a => a.requires_human);

  // Determine plan status
  const status: PlanStatus = blockers.length > 0 
    ? 'blocked' 
    : requiresHumanReview 
      ? 'pending_review' 
      : 'ready';

  // Build normalized plan object - ALWAYS valid, no undefined fields
  const plan: NormalizedPlan = {
    plan_id: planId,
    scan_id: scanId,
    normalized: true,
    status,
    actions,
    total_actions: actions.length,
    risk_summary: riskSummary,
    requires_human_review: requiresHumanReview,
    blockers,
    created_at: new Date().toISOString(),
    metadata: {
      normalization_summary: normalizationResult.summary || {
        total_proposals: 0,
        normalized_count: 0,
        rejected_count: 0,
        rejection_breakdown: {
          INVALID_ACTION_TYPE: 0,
          MISSING_SCOPE: 0,
          CONFIDENCE_TOO_LOW: 0,
          UNSUPPORTED_RISK_LEVEL: 0,
          AMBIGUOUS_INTENT: 0,
          MISSING_TARGET: 0,
        },
      },
      source_proposals_count: normalizationResult.summary?.total_proposals || 0,
    },
  };

  emitEvolveEvent('plan_created', {
    plan_id: planId,
    status,
    actions_count: plan.total_actions,
    blockers_count: blockers.length,
    normalized: true,
  });

  // Only persist to DB if plan is ready or pending review
  if (status === 'ready' || status === 'pending_review') {
    try {
      const runOptions: CreateRunOptions = {
        plan_id: planId,
        initiated_by: 'system',
        confidence_score: actions.length > 0 
          ? Math.max(...actions.map(a => a.confidence_score))
          : 0,
        risk_level: riskSummary.high > 0 ? 'high' : riskSummary.medium > 0 ? 'medium' : 'low',
        metadata: {
          normalized: true,
          total_actions: plan.total_actions,
          scan_id: scanId,
          status,
        },
      };

      const runResult = await evolutionRuns.createRun(runOptions);
      
      if (runResult.success && runResult.run) {
        return {
          success: true,
          plan,
          run_id: runResult.run.run_id,
          stored: true,
        };
      } else if (runResult.error?.includes('Active evolution run exists')) {
        // Add active run blocker but still return the plan
        plan.blockers.push({
          code: 'ACTIVE_RUN_EXISTS',
          message: runResult.error,
        });
        plan.status = 'blocked';
        
        return {
          success: false,
          plan,
          stored: false,
        };
      }
    } catch (error) {
      // Log but don't fail - return the plan anyway
      console.error('[PlanConstructor] Failed to persist plan:', error);
    }
  }

  // Return the plan even if not stored
  return {
    success: status === 'ready' || status === 'pending_review',
    plan,
    stored: false,
  };
}

/**
 * Validate that a plan contains only normalized actions
 * Used by evolution.evolve to reject malformed plans
 */
export function validatePlanForEvolution(plan: NormalizedPlan): { 
  valid: boolean; 
  error?: string;
  can_evolve: boolean;
} {
  // Check normalized flag
  if (!plan.normalized) {
    return { 
      valid: false, 
      can_evolve: false,
      error: 'Plan is not marked as normalized. Only normalized plans can be evolved.' 
    };
  }

  // Check status
  if (plan.status === 'blocked') {
    return { 
      valid: true, 
      can_evolve: false,
      error: `Plan is blocked: ${plan.blockers.map(b => b.message).join(', ')}` 
    };
  }

  // Check actions array
  if (!plan.actions || plan.actions.length === 0) {
    return { 
      valid: true, 
      can_evolve: false,
      error: 'Plan contains no normalized actions.' 
    };
  }

  // Validate each action has required fields
  for (const action of plan.actions) {
    if (!action.action_type || !action.target_scope || typeof action.confidence_score !== 'number') {
      return { 
        valid: false, 
        can_evolve: false,
        error: `Action ${action.action_id} missing required fields (action_type, target_scope, confidence_score).` 
      };
    }
  }

  return { valid: true, can_evolve: true };
}

export const planConstructor = {
  create: createPlanFromNormalized,
  validate: validatePlanForEvolution,
};
