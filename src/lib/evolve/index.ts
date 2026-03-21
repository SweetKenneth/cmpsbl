/**
 * Evolve Module — Unified Exports
 * Scan Normalization Era
 */

// Core context
export * from './context';

// Shadow mode
export * from './shadow-store';
export * from './shadow-executor';
export * from './verify';

// Production mode
export * from './apply';
export * from './production-executor';

// Evolution state (single source of truth)
export * from './evolution-runs';
export * from './evolution-receipts';

// CodeAgent
export * from './codeagent-types';
export * from './write-guard';
export * from './ts-verify';
export * from './codeagent-controller';

// Commands & diagnostics
export * from './evolution-commands';
export * from './decode-fallback';
export * from './diagnostics';

// Telemetry
export * from './telemetry';

// v0.7.6 — Governed Autonomy
export * from './circuit-breaker';
export * from './autonomy';
export * from './self-repair';
export * from './public-receipts';

// v0.7.7 — Intelligent Scan
export * from './scan';

// v1.0.0 — Omega Observer Engine
export * from './change-ledger';
export * from './eligibility-gate';
export * from './forward-analyzer';
export * from './forensics';
export * from './omega-observer';

// v1.1.0 — Stabilization Gates (12 pre-flight checks)
export * from './stabilization-gates';

// v1.2.0 — Dual-Executor (Writer + Validator)
export * from './dual-executor';

// ═══════════════════════════════════════════════════════════════
// RE-EXPORT MAIN EVOLVE FUNCTION
// ═══════════════════════════════════════════════════════════════

import { 
  createEvolveContext, 
  validateContext,
  type EvolveContext, 
  type EvolveMode,
  type InvocationSource,
  isShadowMode,
  isProductionMode,
  getShortId,
} from './context';
import { shadowStore } from './shadow-store';
import { verifyShadowArtifacts, requireVerifiedShadow } from './verify';
import { applyProduction } from './apply';
import { executeCodeAgent } from './codeagent-controller';
import { emitEvolveEvent } from './telemetry';
import { runStabilizationGates } from './stabilization-gates';
import { executeDualExecutor, getDefaultDualConfig, type DualExecutorResult } from './dual-executor';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface EvolveOptions {
  mode: EvolveMode;
  evolution_id?: string;
  invoked_from?: InvocationSource;
  /** Enable dual-executor (Writer + Validator) pattern. Default: true */
  dual_executor?: boolean;
  request?: {
    description: string;
    module: string;
    changeType: string;
    filePath?: string;
  };
  metadata?: Record<string, unknown>;
}

export interface EvolveResult {
  success: boolean;
  mode: EvolveMode;
  evolution_id: string;
  short_id: string;
  phase: string;
  message: string;
  files_written?: number;
  ts_verified?: boolean;
  artifacts?: number;
  error?: string;
  data?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════
// MAIN EVOLVE FUNCTION
// ═══════════════════════════════════════════════════════════════

/**
 * Execute evolution with proper context
 * This is the SINGLE entry point for all evolve operations
 * 
 * v0.7.8 SAFETY GUARANTEE:
 * - Refuses any plan not marked normalized=true
 * - Logs rejection with receipt entry
 * - Never auto-repairs malformed plans
 */
export async function evolve(options: EvolveOptions): Promise<EvolveResult> {
  // Create context
  const context = createEvolveContext({
    mode: options.mode,
    evolution_id: options.evolution_id,
    invoked_from: options.invoked_from || 'terminal',
    metadata: options.metadata,
  });

  // Validate context
  const validation = validateContext(context);
  if (!validation.valid) {
    return {
      success: false,
      mode: options.mode,
      evolution_id: context.evolution_id,
      short_id: getShortId(context),
      phase: 'validation',
      message: `Invalid context: ${validation.errors.join(', ')}`,
      error: validation.errors.join(', '),
    };
  }

  // v1.1.0 STABILIZATION: Run all 12 pre-flight gates
  if (isProductionMode(context)) {
    const stabilization = await runStabilizationGates();
    if (!stabilization.all_passed) {
      const blockers = stabilization.gates
        .filter(g => !g.passed && g.severity === 'blocker')
        .map(g => `#${g.gate_id} ${g.name}`);
      emitEvolveEvent('evolve_error', {
        evolution_id: context.evolution_id,
        error: 'Stabilization gates blocked evolution',
        rejection_type: 'STABILIZATION_BLOCKED',
        blockers,
      });
      return {
        success: false,
        mode: options.mode,
        evolution_id: context.evolution_id,
        short_id: getShortId(context),
        phase: 'stabilization_gate',
        message: `Evolution blocked by stabilization gates: ${blockers.join(', ')}`,
        error: 'STABILIZATION_BLOCKED',
        data: { stabilization },
      };
    }
  }

  // v0.7.8 SAFETY: Validate plan normalization for production mode
  if (isProductionMode(context) && options.metadata) {
    const planData = options.metadata as { normalized?: boolean; actions?: unknown[] };
    if (!planData.normalized) {
      emitEvolveEvent('evolve_error', {
        evolution_id: context.evolution_id,
        error: 'Plan is not normalized. Only normalized plans can be evolved.',
        rejection_type: 'UNNORMALIZED_PLAN',
      });
      return {
        success: false,
        mode: options.mode,
        evolution_id: context.evolution_id,
        short_id: getShortId(context),
        phase: 'gate',
        message: 'Evolution rejected: Plan is not normalized. Only normalized plans can be evolved.',
        error: 'UNNORMALIZED_PLAN',
      };
    }
  }

  // Route based on mode
  if (isShadowMode(context)) {
    return await executeShadow(context, options.request, options.dual_executor);
  } else {
    return await executeProduction(context);
  }
}

// ═══════════════════════════════════════════════════════════════
// SHADOW EXECUTION
// ═══════════════════════════════════════════════════════════════

async function executeShadow(
  context: EvolveContext, 
  request?: EvolveOptions['request'],
  dualExecutorEnabled?: boolean
): Promise<EvolveResult> {
  const short_id = getShortId(context);
  
  emitEvolveEvent('evolve_shadow_started', {
    evolution_id: context.evolution_id,
    invoked_from: context.invoked_from,
  });

  // Must have a request for shadow mode
  if (!request) {
    return {
      success: false,
      mode: 'shadow',
      evolution_id: context.evolution_id,
      short_id,
      phase: 'shadow',
      message: 'Shadow mode requires a request (description, module, changeType)',
      error: 'Missing request',
    };
  }

  // Determine if dual-executor mode is active (default: true)
  const useDualExecutor = dualExecutorEnabled !== false;

  try {
    // Execute with Writer + Validator dual-executor pattern or single executor
    const result = useDualExecutor
      ? await executeDualExecutor(context, request, getDefaultDualConfig())
      : await executeCodeAgent(context, request);

    if (!result.success) {
      return {
        success: false,
        mode: 'shadow',
        evolution_id: context.evolution_id,
        short_id,
        phase: result.phase,
        message: `Shadow apply failed: ${result.error}`,
        error: result.error,
        files_written: result.files_written.length,
        ts_verified: result.ts_verified,
      };
    }

    // Verify shadow artifacts
    const verification = verifyShadowArtifacts(context.evolution_id);
    
    emitEvolveEvent('evolve_shadow_verified', {
      evolution_id: context.evolution_id,
      passed: verification.passed,
      artifact_count: verification.artifact_count,
    });

    return {
      success: true,
      mode: 'shadow',
      evolution_id: context.evolution_id,
      short_id,
      phase: 'shadow_complete',
      message: `✓ Shadow applied: ${result.files_written.length} file(s) written, TS ${result.ts_verified ? 'verified' : 'not verified'}. Run \`evolve.apply\` to promote.`,
      files_written: result.files_written.length,
      ts_verified: result.ts_verified,
      artifacts: verification.artifact_count,
      data: {
        files: result.files_written.map(f => f.file_path),
        verification,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Shadow execution failed';
    
    emitEvolveEvent('evolve_error', {
      evolution_id: context.evolution_id,
      mode: 'shadow',
      error: errorMessage,
    });

    return {
      success: false,
      mode: 'shadow',
      evolution_id: context.evolution_id,
      short_id,
      phase: 'failed',
      message: `Shadow apply failed: ${errorMessage}`,
      error: errorMessage,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// PRODUCTION EXECUTION
// ═══════════════════════════════════════════════════════════════

async function executeProduction(context: EvolveContext): Promise<EvolveResult> {
  const short_id = getShortId(context);

  // Gate: Must have verified shadow
  const shadowCheck = requireVerifiedShadow(context);
  if (!shadowCheck.allowed) {
    return {
      success: false,
      mode: 'production',
      evolution_id: context.evolution_id,
      short_id,
      phase: 'gate',
      message: shadowCheck.reason,
      error: shadowCheck.reason,
    };
  }

  try {
    const result = await applyProduction(context);

    if (!result.success) {
      return {
        success: false,
        mode: 'production',
        evolution_id: context.evolution_id,
        short_id,
        phase: 'apply',
        message: `Production apply failed: ${result.error}`,
        error: result.error,
      };
    }

    return {
      success: true,
      mode: 'production',
      evolution_id: context.evolution_id,
      short_id,
      phase: 'complete',
      message: `✓ Production apply complete: ${result.artifacts_applied} artifact(s) applied.`,
      artifacts: result.artifacts_applied,
      data: {
        applied_at: result.applied_at,
        verification: result.verification,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Production apply failed';

    emitEvolveEvent('evolve_error', {
      evolution_id: context.evolution_id,
      mode: 'production',
      error: errorMessage,
    });

    return {
      success: false,
      mode: 'production',
      evolution_id: context.evolution_id,
      short_id,
      phase: 'failed',
      message: `Production apply failed: ${errorMessage}`,
      error: errorMessage,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// COMMAND ALIASES (for terminal/dashboard)
// ═══════════════════════════════════════════════════════════════

/**
 * evolve.shadow — Apply to shadow environment
 */
export async function evolveShadow(
  request: {
    description: string;
    module: string;
    changeType: string;
    filePath?: string;
  },
  invoked_from: InvocationSource = 'terminal'
): Promise<EvolveResult> {
  return evolve({
    mode: 'shadow',
    request,
    invoked_from,
  });
}

/**
 * evolve.apply — Apply verified shadow to production
 */
export async function evolveApply(
  evolution_id: string,
  invoked_from: InvocationSource = 'terminal'
): Promise<EvolveResult> {
  return evolve({
    mode: 'production',
    evolution_id,
    invoked_from,
  });
}

/**
 * evolve.status — Get current evolution status
 */
export async function evolveStatus(evolution_id?: string): Promise<{
  has_shadow: boolean;
  is_verified: boolean;
  artifacts: number;
  entry?: ReturnType<typeof shadowStore.getEntry>;
}> {
  if (evolution_id) {
    const entry = shadowStore.getEntry(evolution_id);
    return {
      has_shadow: !!entry,
      is_verified: shadowStore.isVerified(evolution_id),
      artifacts: entry?.artifacts.length || 0,
      entry,
    };
  }

  return {
    has_shadow: false,
    is_verified: false,
    artifacts: 0,
  };
}
