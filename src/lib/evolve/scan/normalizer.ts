/**
 * Proposal Normalization Layer
 * Deterministic Scan → Plan Transformation
 * 
 * Converts raw scan proposals into executable, typed actions.
 * ONLY normalized proposals can become evolution plans.
 * 
 * Rules:
 * - Every proposal MUST resolve to a typed action
 * - Human-readable labels are stripped at this stage
 * - Zero valid actions = NO plan created (system stays healthy)
 */

import type { ScanProposal } from './types';
import { emitEvolveEvent } from '../telemetry';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type NormalizedActionType = 
  | 'code_mutation'     // Direct code changes
  | 'config_mutation'   // Configuration updates
  | 'cleanup_mutation'  // Removal of deprecated/orphaned code
  | 'edge_mutation'     // Edge function modifications
  | 'schema_mutation'   // Database schema changes
  | 'policy_mutation'   // RLS/security policy changes
  | 'monitoring_add'    // Add observability
  | 'manual_review';    // Human intervention required

export type TargetScope = 'module' | 'system' | 'edge' | 'api' | 'database';

export type NormalizationRejectionCode = 
  | 'INVALID_ACTION_TYPE'
  | 'MISSING_SCOPE'
  | 'CONFIDENCE_TOO_LOW'
  | 'UNSUPPORTED_RISK_LEVEL'
  | 'AMBIGUOUS_INTENT'
  | 'MISSING_TARGET';

export interface NormalizedAction {
  action_id: string;
  action_type: NormalizedActionType;
  target_scope: TargetScope;
  target_module?: string;
  target_file?: string;
  risk_level: 'low' | 'medium' | 'high';
  confidence_score: number;
  source_proposal_id: string;
  description: string;
  requires_human: boolean;
  normalized_at: string;
}

export interface RejectedProposal {
  proposal_id: string;
  title: string;
  rejection_code: NormalizationRejectionCode;
  reason: string;
}

export interface NormalizationResult {
  success: boolean;
  normalized_actions: NormalizedAction[];
  rejected_proposals: RejectedProposal[];
  summary: {
    total_proposals: number;
    normalized_count: number;
    rejected_count: number;
    rejection_breakdown: Record<NormalizationRejectionCode, number>;
  };
  can_create_plan: boolean;
  blocking_reason?: string;
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const NORMALIZATION_CONFIG = {
  min_confidence: 0.6,           // Proposals below this are rejected
  allowed_risk_levels: ['low', 'medium', 'high'] as const,
  require_target_scope: true,
  min_actions_for_plan: 1,       // Minimum normalized actions to create plan
};

// Action type mapping from proposal categories
const CATEGORY_TO_ACTION: Record<string, NormalizedActionType> = {
  security: 'policy_mutation',
  hardening: 'code_mutation',
  resilience: 'code_mutation',
  capability: 'code_mutation',
  cleanup: 'cleanup_mutation',
};

// Infer target scope from proposal content
const SCOPE_KEYWORDS: Record<TargetScope, string[]> = {
  module: ['module', 'component', 'service', 'brain', 'decode', 'dream', 'vision', 'nexus', 'defense', 'core', 'ripple', 'access', 'system', 'modernizer', 'integration', 'cortex', 'inclusive'],
  edge: ['edge', 'function', 'supabase', 'pf-', 'deno'],
  api: ['api', 'endpoint', 'route', 'router', 'webhook'],
  database: ['table', 'schema', 'rls', 'policy', 'migration', 'database'],
  system: ['system', 'config', 'global', 'architecture'],
};

// ═══════════════════════════════════════════════════════════════
// NORMALIZER
// ═══════════════════════════════════════════════════════════════

/**
 * Normalize scan proposals into executable actions
 * This is the ONLY path from scan to plan
 */
export function normalizeProposals(proposals: ScanProposal[]): NormalizationResult {
  const normalizedActions: NormalizedAction[] = [];
  const rejectedProposals: RejectedProposal[] = [];
  const rejectionBreakdown: Record<NormalizationRejectionCode, number> = {
    INVALID_ACTION_TYPE: 0,
    MISSING_SCOPE: 0,
    CONFIDENCE_TOO_LOW: 0,
    UNSUPPORTED_RISK_LEVEL: 0,
    AMBIGUOUS_INTENT: 0,
    MISSING_TARGET: 0,
  };

  for (const proposal of proposals) {
    const result = normalizeProposal(proposal);
    
    if (result.success && result.action) {
      normalizedActions.push(result.action);
    } else if (result.rejection) {
      rejectedProposals.push(result.rejection);
      rejectionBreakdown[result.rejection.rejection_code]++;
    }
  }

  const canCreatePlan = normalizedActions.length >= NORMALIZATION_CONFIG.min_actions_for_plan;
  let blockingReason: string | undefined;

  if (!canCreatePlan && proposals.length > 0) {
    blockingReason = `Proposals could not be normalized: ${rejectedProposals.length} rejected, 0 executable actions`;
  }

  const result: NormalizationResult = {
    success: normalizedActions.length > 0 || proposals.length === 0,
    normalized_actions: normalizedActions,
    rejected_proposals: rejectedProposals,
    summary: {
      total_proposals: proposals.length,
      normalized_count: normalizedActions.length,
      rejected_count: rejectedProposals.length,
      rejection_breakdown: rejectionBreakdown,
    },
    can_create_plan: canCreatePlan,
    blocking_reason: blockingReason,
  };

  emitEvolveEvent('proposals_normalized', {
    total: proposals.length,
    normalized: normalizedActions.length,
    rejected: rejectedProposals.length,
    can_create_plan: canCreatePlan,
  });

  return result;
}

/**
 * Normalize a single proposal
 */
function normalizeProposal(proposal: ScanProposal): {
  success: boolean;
  action?: NormalizedAction;
  rejection?: RejectedProposal;
} {
  // Check confidence threshold
  if (proposal.confidence_score < NORMALIZATION_CONFIG.min_confidence) {
    return {
      success: false,
      rejection: {
        proposal_id: proposal.proposal_id,
        title: proposal.title,
        rejection_code: 'CONFIDENCE_TOO_LOW',
        reason: `Confidence ${(proposal.confidence_score * 100).toFixed(0)}% below threshold ${NORMALIZATION_CONFIG.min_confidence * 100}%`,
      },
    };
  }

  // Check risk level
  if (!NORMALIZATION_CONFIG.allowed_risk_levels.includes(proposal.risk_level as 'low' | 'medium' | 'high')) {
    return {
      success: false,
      rejection: {
        proposal_id: proposal.proposal_id,
        title: proposal.title,
        rejection_code: 'UNSUPPORTED_RISK_LEVEL',
        reason: `Risk level '${proposal.risk_level}' not allowed (only ${NORMALIZATION_CONFIG.allowed_risk_levels.join('/')})`,
      },
    };
  }

  // Resolve action type
  const actionType = resolveActionType(proposal);
  if (!actionType) {
    return {
      success: false,
      rejection: {
        proposal_id: proposal.proposal_id,
        title: proposal.title,
        rejection_code: 'INVALID_ACTION_TYPE',
        reason: `Cannot determine executable action type from category '${proposal.category}'`,
      },
    };
  }

  // Resolve target scope
  const targetScope = resolveTargetScope(proposal);
  if (!targetScope) {
    return {
      success: false,
      rejection: {
        proposal_id: proposal.proposal_id,
        title: proposal.title,
        rejection_code: 'MISSING_SCOPE',
        reason: 'Cannot determine target scope from proposal content',
      },
    };
  }

  // Resolve target module (if applicable)
  const targetModule = resolveTargetModule(proposal);

  // Create normalized action
  // action_id uses UUID for database compatibility
  // High risk proposals always require human review
  const isHighRisk = proposal.risk_level === 'high';
  const action: NormalizedAction = {
    action_id: crypto.randomUUID(),
    action_type: actionType,
    target_scope: targetScope,
    target_module: targetModule,
    risk_level: proposal.risk_level as 'low' | 'medium' | 'high',
    confidence_score: proposal.confidence_score,
    source_proposal_id: proposal.proposal_id,
    description: stripDecorations(proposal.description),
    requires_human: isHighRisk || proposal.requires_human || actionType === 'manual_review',
    normalized_at: new Date().toISOString(),
  };

  return { success: true, action };
}

/**
 * Resolve action type from proposal
 */
function resolveActionType(proposal: ScanProposal): NormalizedActionType | null {
  // Direct mapping from proposal action_type if valid
  const directMapping: Record<string, NormalizedActionType> = {
    code_change: 'code_mutation',
    config_change: 'config_mutation',
    cleanup: 'cleanup_mutation',
    monitoring: 'monitoring_add',
    manual_review: 'manual_review',
  };

  if (proposal.action_type && directMapping[proposal.action_type]) {
    return directMapping[proposal.action_type];
  }

  // Fallback to category mapping
  if (proposal.category && CATEGORY_TO_ACTION[proposal.category]) {
    return CATEGORY_TO_ACTION[proposal.category];
  }

  // Infer from title/description keywords
  const content = `${proposal.title} ${proposal.description}`.toLowerCase();
  
  if (content.includes('edge function') || content.includes('supabase function')) {
    return 'edge_mutation';
  }
  if (content.includes('policy') || content.includes('rls') || content.includes('permission')) {
    return 'policy_mutation';
  }
  if (content.includes('schema') || content.includes('table') || content.includes('migration')) {
    return 'schema_mutation';
  }
  if (content.includes('remove') || content.includes('delete') || content.includes('cleanup') || content.includes('orphan')) {
    return 'cleanup_mutation';
  }
  if (content.includes('config') || content.includes('setting') || content.includes('environment')) {
    return 'config_mutation';
  }
  if (content.includes('monitor') || content.includes('observe') || content.includes('metric') || content.includes('log')) {
    return 'monitoring_add';
  }
  if (content.includes('review') || content.includes('investigate') || content.includes('audit')) {
    return 'manual_review';
  }

  // Default to code_mutation for any fix/update/add/improve
  if (content.includes('fix') || content.includes('update') || content.includes('add') || content.includes('improve')) {
    return 'code_mutation';
  }

  // Final fallback: any proposal that has an action_type field gets code_mutation
  // This prevents rejecting otherwise valid proposals due to category mismatch
  if (proposal.action_type) {
    return 'code_mutation';
  }

  return null;
}

/**
 * Resolve target scope from proposal
 */
function resolveTargetScope(proposal: ScanProposal): TargetScope | null {
  const content = `${proposal.title} ${proposal.description} ${proposal.rationale || ''}`.toLowerCase();

  // Check each scope's keywords
  for (const [scope, keywords] of Object.entries(SCOPE_KEYWORDS)) {
    if (keywords.some(kw => content.includes(kw))) {
      return scope as TargetScope;
    }
  }

  // Default to 'module' for proposals with source phases
  if (proposal.source_phases?.length > 0) {
    return 'module';
  }

  // Final fallback: always return 'system' rather than null
  // This prevents rejection of valid proposals that lack scope keywords
  return 'system';
}

/**
 * Resolve target module from proposal
 */
function resolveTargetModule(proposal: ScanProposal): string | undefined {
  const content = `${proposal.title} ${proposal.description}`.toLowerCase();
  
  const modules = ['brain', 'decode', 'dream', 'vision', 'nexus', 'defense', 'core', 'ripple', 'access', 'system', 'modernizer', 'integration', 'cortex', 'inclusive'];
  
  for (const mod of modules) {
    if (content.includes(mod)) {
      return mod.toUpperCase();
    }
  }

  return undefined;
}

/**
 * Strip decorative elements from text
 * (Emojis, severity colors, markdown formatting)
 */
function stripDecorations(text: string): string {
  return text
    // Remove emojis
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    // Remove markdown formatting
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    // Remove severity markers
    .replace(/\[(low|medium|high|critical)\]/gi, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION FOR EVOLVE
// ═══════════════════════════════════════════════════════════════

/**
 * Validate that a plan contains only normalized actions
 * Used by modernizer.evolve to reject malformed plans
 */
export function validateNormalizedPlan(planData: {
  actions?: NormalizedAction[];
  normalized?: boolean;
}): { valid: boolean; error?: string } {
  // Check normalized flag
  if (!planData.normalized) {
    return { 
      valid: false, 
      error: 'Plan is not marked as normalized. Only normalized plans can be evolved.' 
    };
  }

  // Check actions array
  if (!planData.actions || planData.actions.length === 0) {
    return { 
      valid: false, 
      error: 'Plan contains no normalized actions.' 
    };
  }

  // Validate each action has required fields
  for (const action of planData.actions) {
    if (!action.action_type || !action.target_scope || typeof action.confidence_score !== 'number') {
      return { 
        valid: false, 
        error: `Action ${action.action_id} missing required fields (action_type, target_scope, confidence_score).` 
      };
    }
  }

  return { valid: true };
}

export const proposalNormalizer = {
  normalize: normalizeProposals,
  validatePlan: validateNormalizedPlan,
};
