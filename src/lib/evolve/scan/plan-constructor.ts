/**
 * Plan Constructor — Strict Schema Validation
 * v0.7.8 — Accepts ONLY normalized proposals
 * 
 * PLAN CREATION CONTRACT:
 * - Input MUST be normalized actions (not raw proposals)
 * - Strict schema validation with explicit failure codes
 * - No silent failures
 * - No implicit coercion
 */

import type { NormalizedAction, NormalizationResult } from './normalizer';
import { evolutionRuns, type CreateRunOptions } from '../evolution-runs';
import { emitEvolveEvent } from '../telemetry';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type PlanRejectionCode = 
  | 'NO_NORMALIZED_ACTIONS'
  | 'NORMALIZATION_FAILED'
  | 'ACTIVE_RUN_EXISTS'
  | 'CIRCUIT_OPEN'
  | 'VALIDATION_FAILED'
  | 'INTERNAL_ERROR';

export interface NormalizedPlan {
  plan_id: string;
  scan_id: string;
  normalized: true;  // Always true for valid plans
  actions: NormalizedAction[];
  total_actions: number;
  risk_summary: {
    low: number;
    medium: number;
  };
  requires_human_review: boolean;
  created_at: string;
  metadata: {
    normalization_summary: NormalizationResult['summary'];
    source_proposals_count: number;
  };
}

export interface PlanCreationResult {
  success: boolean;
  plan?: NormalizedPlan;
  run_id?: string;
  error?: {
    code: PlanRejectionCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ═══════════════════════════════════════════════════════════════
// PLAN CONSTRUCTOR
// ═══════════════════════════════════════════════════════════════

/**
 * Create evolution plan from normalized actions
 * This is the ONLY way to create a valid plan
 */
export async function createPlanFromNormalized(
  scanId: string,
  normalizationResult: NormalizationResult
): Promise<PlanCreationResult> {
  
  // GATE 1: Normalization must have succeeded
  if (!normalizationResult.success) {
    return {
      success: false,
      error: {
        code: 'NORMALIZATION_FAILED',
        message: 'Normalization did not produce valid actions',
        details: {
          rejected_count: normalizationResult.rejected_proposals.length,
          rejection_breakdown: normalizationResult.summary.rejection_breakdown,
        },
      },
    };
  }

  // GATE 2: Must have normalized actions
  if (!normalizationResult.can_create_plan || normalizationResult.normalized_actions.length === 0) {
    return {
      success: false,
      error: {
        code: 'NO_NORMALIZED_ACTIONS',
        message: normalizationResult.blocking_reason || 'No executable actions available',
        details: {
          total_proposals: normalizationResult.summary.total_proposals,
          rejected_count: normalizationResult.summary.rejected_count,
        },
      },
    };
  }

  // GATE 3: Validate each action passes schema
  const validationResult = validateActionsSchema(normalizationResult.normalized_actions);
  if (!validationResult.valid) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: validationResult.error || 'Schema validation failed',
        details: validationResult.details,
      },
    };
  }

  try {
    // Calculate risk summary
    const riskSummary = {
      low: normalizationResult.normalized_actions.filter(a => a.risk_level === 'low').length,
      medium: normalizationResult.normalized_actions.filter(a => a.risk_level === 'medium').length,
    };

    // Determine if human review required
    const requiresHumanReview = normalizationResult.normalized_actions.some(a => a.requires_human);

    // Build normalized plan object
    // plan_id must be a valid UUID for database compatibility
    const plan: NormalizedPlan = {
      plan_id: crypto.randomUUID(),
      scan_id: scanId,
      normalized: true,
      actions: normalizationResult.normalized_actions,
      total_actions: normalizationResult.normalized_actions.length,
      risk_summary: riskSummary,
      requires_human_review: requiresHumanReview,
      created_at: new Date().toISOString(),
      metadata: {
        normalization_summary: normalizationResult.summary,
        source_proposals_count: normalizationResult.summary.total_proposals,
      },
    };

    // Create evolution run in database
    const runOptions: CreateRunOptions = {
      plan_id: plan.plan_id,
      initiated_by: 'system',
      confidence_score: Math.max(...normalizationResult.normalized_actions.map(a => a.confidence_score)),
      risk_level: riskSummary.medium > 0 ? 'medium' : 'low',
      metadata: {
        normalized: true,
        total_actions: plan.total_actions,
        scan_id: scanId,
      },
    };

    const runResult = await evolutionRuns.createRun(runOptions);
    
    if (!runResult.success) {
      // Check for specific error conditions
      if (runResult.error?.includes('Active evolution run exists')) {
        return {
          success: false,
          error: {
            code: 'ACTIVE_RUN_EXISTS',
            message: runResult.error,
          },
        };
      }
      
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: runResult.error || 'Failed to create evolution run',
        },
      };
    }

    emitEvolveEvent('plan_created', {
      plan_id: plan.plan_id,
      run_id: runResult.run?.run_id,
      actions_count: plan.total_actions,
      normalized: true,
    });

    return {
      success: true,
      plan,
      run_id: runResult.run?.run_id,
    };

  } catch (error) {
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Plan creation failed',
      },
    };
  }
}

/**
 * Validate actions against strict schema
 */
function validateActionsSchema(actions: NormalizedAction[]): {
  valid: boolean;
  error?: string;
  details?: Record<string, unknown>;
} {
  const errors: string[] = [];

  for (const action of actions) {
    // Required fields
    if (!action.action_id) {
      errors.push(`Action missing action_id`);
    }
    if (!action.action_type) {
      errors.push(`Action ${action.action_id} missing action_type`);
    }
    if (!action.target_scope) {
      errors.push(`Action ${action.action_id} missing target_scope`);
    }
    if (typeof action.confidence_score !== 'number' || action.confidence_score < 0 || action.confidence_score > 1) {
      errors.push(`Action ${action.action_id} has invalid confidence_score`);
    }
    if (!action.risk_level || !['low', 'medium'].includes(action.risk_level)) {
      errors.push(`Action ${action.action_id} has invalid risk_level`);
    }
    if (!action.source_proposal_id) {
      errors.push(`Action ${action.action_id} missing source_proposal_id`);
    }
    if (!action.normalized_at) {
      errors.push(`Action ${action.action_id} missing normalized_at timestamp`);
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      error: `Schema validation failed: ${errors.length} error(s)`,
      details: { errors },
    };
  }

  return { valid: true };
}

export const planConstructor = {
  create: createPlanFromNormalized,
};
