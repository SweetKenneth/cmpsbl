/**
 * CMPSBL® Evolve Apply — Production Apply with Verified Shadow Gate
 * Requires verified shadow artifacts before production apply
 */

import { type EvolveContext, isProductionMode, getShortId } from './context';
import { shadowStore, type ShadowArtifact } from './shadow-store';
import { requireVerifiedShadow, type VerificationResult } from './verify';
import { emitEvolveEvent } from './telemetry';
import { enforceExecutionBarrier, isExternalAIMode } from './execution-mode';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ApplyResult {
  success: boolean;
  evolution_id: string;
  short_id: string;
  artifacts_applied: number;
  verification?: VerificationResult;
  error?: string;
  applied_at?: Date;
}

// ═══════════════════════════════════════════════════════════════
// APPLY LOGIC
// ═══════════════════════════════════════════════════════════════

/**
 * Apply evolution to production
 * REQUIRES: verified shadow artifacts
 */
export async function applyProduction(context: EvolveContext): Promise<ApplyResult> {
  const short_id = getShortId(context);

  // GOVERNANCE BARRIER: Block all internal apply when in external-ai mode
  if (isExternalAIMode()) {
    enforceExecutionBarrier('applyProduction');
    // enforceExecutionBarrier throws, but return for type safety
    return {
      success: false,
      evolution_id: context.evolution_id,
      short_id,
      artifacts_applied: 0,
      error: 'Internal apply blocked by external-ai execution mode.',
    };
  }
  
  emitEvolveEvent('evolve_apply_started', {
    evolution_id: context.evolution_id,
    mode: 'production',
  });

  // Gate 1: Must be production mode
  if (!isProductionMode(context)) {
    return {
      success: false,
      evolution_id: context.evolution_id,
      short_id,
      artifacts_applied: 0,
      error: 'applyProduction requires production mode context',
    };
  }

  // Gate 2: Must have verified shadow
  const shadowCheck = requireVerifiedShadow(context);
  if (!shadowCheck.allowed) {
    emitEvolveEvent('evolve_apply_blocked', {
      evolution_id: context.evolution_id,
      reason: shadowCheck.reason,
    });

    return {
      success: false,
      evolution_id: context.evolution_id,
      short_id,
      artifacts_applied: 0,
      verification: shadowCheck.verification,
      error: shadowCheck.reason,
    };
  }

  // Gate 3: Load shadow artifacts
  const artifacts = shadowStore.getArtifacts(context.evolution_id);
  if (artifacts.length === 0) {
    return {
      success: false,
      evolution_id: context.evolution_id,
      short_id,
      artifacts_applied: 0,
      error: 'Memory Stream score too weak — no pipelines crystallized for export.',
    };
  }

  // Hardening 13: Idempotency — block re-apply of already-applied evolutions
  const entry = shadowStore.getEntry(context.evolution_id);
  if (entry?.status === 'applied') {
    return {
      success: false,
      evolution_id: context.evolution_id,
      short_id,
      artifacts_applied: 0,
      error: 'This evolution has already been applied — Memory Stream recorded it as complete.',
    };
  }

  // Apply each artifact
  try {
    for (const artifact of artifacts) {
      await applyArtifact(artifact);
    }

    // Mark as applied
    shadowStore.markApplied(context.evolution_id);

    emitEvolveEvent('evolve_apply_completed', {
      evolution_id: context.evolution_id,
      artifacts_applied: artifacts.length,
    });

    return {
      success: true,
      evolution_id: context.evolution_id,
      short_id,
      artifacts_applied: artifacts.length,
      verification: shadowCheck.verification,
      applied_at: new Date(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Apply failed';
    
    shadowStore.markFailed(context.evolution_id, errorMessage);

    return {
      success: false,
      evolution_id: context.evolution_id,
      short_id,
      artifacts_applied: 0,
      error: errorMessage,
    };
  }
}

/**
 * Apply a single artifact
 */
async function applyArtifact(artifact: ShadowArtifact): Promise<void> {
  // In a real implementation, this would write to the actual file system
  // or call an API to apply the change
  
  console.log(`[Evolve] Applying artifact: ${artifact.file_path} (${artifact.operation})`);
  
  // For now, we just log the application
  // The actual file writing would be done by the Evolution pipeline
  
  emitEvolveEvent('artifact_applied', {
    artifact_id: artifact.id,
    file_path: artifact.file_path,
    operation: artifact.operation,
  });
}

/**
 * Check if production apply is possible
 */
export function canApply(context: EvolveContext): { allowed: boolean; reason: string } {
  // GOVERNANCE BARRIER
  if (isExternalAIMode()) {
    return { allowed: false, reason: 'Internal apply disabled. Execution mode is external-ai. Use Export to AI instead.' };
  }

  if (!isProductionMode(context)) {
    return { allowed: false, reason: 'Not in production mode' };
  }

  const shadowCheck = requireVerifiedShadow(context);
  if (!shadowCheck.allowed) {
    return { allowed: false, reason: shadowCheck.reason };
  }

  const artifacts = shadowStore.getArtifacts(context.evolution_id);
  if (artifacts.length === 0) {
    return { allowed: false, reason: 'Memory Stream score too weak — no pipelines available to apply.' };
  }

  return { allowed: true, reason: 'Ready to apply' };
}
