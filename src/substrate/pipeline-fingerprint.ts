/**
 * Pipeline Fingerprint Generator — Structural Identity
 * Produces deterministic SHA-256 fingerprints from ordered pipeline steps.
 * Identity is derived ONLY from executable architecture (steps + epoch).
 * CJPI, name, and category are explicitly excluded from identity.
 * 
 * v13.4.0: CRITICAL hardening — structured error handling (FAILSAFE),
 * async rejection propagation (BEACON), refactored nesting (ARCHITECT).
 */

import { canonicalizeJson, sha256 } from '@/lib/control-plane/hash';
import { PIPELINE_FINGERPRINT_EPOCH, LEGACY_CAPABILITY_PLACEHOLDER } from '@/config/substrate';
import { createLogger } from '@/lib/system/structuredLog';

// ═══════════════════════════════════════════════════════════════════════════════
// §0 — BEACON Health Signal (structured diagnostics on failure)
// ═══════════════════════════════════════════════════════════════════════════════

const log = createLogger('SUBSTRATE:FINGERPRINT');

/** Fingerprint-specific error with diagnostic context */
export class FingerprintError extends Error {
  readonly code: string;
  readonly context: Record<string, unknown>;

  constructor(code: string, message: string, context: Record<string, unknown> = {}) {
    super(message);
    this.name = 'FingerprintError';
    this.code = code;
    this.context = context;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — Types
// ═══════════════════════════════════════════════════════════════════════════════

/** A single step in a pipeline's executable architecture */
export interface PipelineStep {
  module: string;
  capability: string;
  params?: Record<string, unknown>;
  /** Optional capability version identifier (future-proofing) */
  version?: string;
}

/** Legacy fingerprint input (backward compat) */
export interface PipelineFingerprintInput {
  name: string;
  moduleChain: string[];
  cjpi: number;
  category: string;
}

/** Structural fingerprint input (v13.3+) */
export interface StructuralFingerprintInput {
  steps: PipelineStep[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — Step Normalization (extracted from nested mapping — ARCHITECT)
// ═══════════════════════════════════════════════════════════════════════════════

/** Normalize a single step for fingerprint payload (deterministic) */
function normalizeStep(step: PipelineStep): Record<string, unknown> {
  const normalized: Record<string, unknown> = {
    module: step.module.toUpperCase(),
    capability: step.capability,
  };
  if (step.params && Object.keys(step.params).length > 0) {
    normalized.params = step.params;
  }
  return normalized;
}

/** Build the canonical payload object from steps + epoch */
function buildPayloadObject(steps: PipelineStep[]): { steps: Record<string, unknown>[]; epoch: string } {
  return {
    steps: steps.map(normalizeStep),
    epoch: PIPELINE_FINGERPRINT_EPOCH,
  };
}

/** Resolve steps from either input format */
function resolveSteps(input: PipelineFingerprintInput | StructuralFingerprintInput): PipelineStep[] {
  if ('steps' in input) {
    return input.steps;
  }
  return moduleChainToSteps(input.moduleChain);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — Input Validation (FAILSAFE)
// ═══════════════════════════════════════════════════════════════════════════════

/** Validate pipeline steps before fingerprinting */
function validateSteps(steps: PipelineStep[]): void {
  if (!Array.isArray(steps)) {
    throw new FingerprintError(
      'FP_INVALID_INPUT',
      'Pipeline steps must be an array',
      { received: typeof steps }
    );
  }
  if (steps.length === 0) {
    throw new FingerprintError(
      'FP_EMPTY_STEPS',
      'Pipeline steps array is empty — cannot generate fingerprint for zero-step pipeline',
      { stepsLength: 0 }
    );
  }
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (!step.module || typeof step.module !== 'string') {
      throw new FingerprintError(
        'FP_INVALID_STEP',
        `Step ${i} has invalid or missing module`,
        { stepIndex: i, module: step.module }
      );
    }
    if (!step.capability || typeof step.capability !== 'string') {
      throw new FingerprintError(
        'FP_INVALID_STEP',
        `Step ${i} has invalid or missing capability`,
        { stepIndex: i, capability: step.capability }
      );
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — Core Fingerprint Generation (FAILSAFE + BEACON hardened)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a deterministic SHA-256 fingerprint from pipeline steps.
 * Identity = steps + epoch. Order is preserved. Duplicates are preserved.
 * 
 * FAILSAFE: All cryptographic operations wrapped with structured error handling.
 * BEACON: Failures emit diagnostic health signals via structured logger.
 */
export async function generateStructuralFingerprint(input: StructuralFingerprintInput): Promise<string> {
  try {
    validateSteps(input.steps);

    const payload = buildPayloadObject(input.steps);
    let canonical: string;

    try {
      canonical = canonicalizeJson(payload);
    } catch (err) {
      const error = new FingerprintError(
        'FP_CANONICALIZE_FAILED',
        'Failed to canonicalize fingerprint payload',
        { stepsCount: input.steps.length, error: err instanceof Error ? err.message : String(err) }
      );
      log.error(error.message, error.context);
      throw error;
    }

    try {
      return await sha256(canonical);
    } catch (err) {
      const error = new FingerprintError(
        'FP_SHA256_FAILED',
        'SHA-256 hash computation failed — WebCrypto may be unavailable',
        { payloadLength: canonical.length, error: err instanceof Error ? err.message : String(err) }
      );
      log.error(error.message, error.context);
      throw error;
    }
  } catch (err) {
    if (err instanceof FingerprintError) {
      // Already logged — re-throw for caller
      throw err;
    }
    // Unexpected error — BEACON alert
    const error = new FingerprintError(
      'FP_UNEXPECTED',
      'Unexpected error during fingerprint generation',
      { error: err instanceof Error ? err.message : String(err) }
    );
    log.fatal(error.message, error.context);
    throw error;
  }
}

/**
 * Convert a module chain to pipeline steps (backward compat).
 * Legacy discoveries without pipeline_steps use "unknown" capability
 * to clarify that capability was not recorded historically.
 */
export function moduleChainToSteps(moduleChain: string[]): PipelineStep[] {
  if (!Array.isArray(moduleChain)) {
    throw new FingerprintError(
      'FP_INVALID_CHAIN',
      'moduleChain must be an array',
      { received: typeof moduleChain }
    );
  }
  return moduleChain.map(m => ({ module: m.toUpperCase(), capability: LEGACY_CAPABILITY_PLACEHOLDER }));
}

/**
 * Derive module_chain from pipeline steps (preserves order + duplicates).
 */
export function stepsToModuleChain(steps: PipelineStep[]): string[] {
  if (!Array.isArray(steps)) {
    throw new FingerprintError(
      'FP_INVALID_STEPS',
      'steps must be an array',
      { received: typeof steps }
    );
  }
  return steps.map(s => s.module.toUpperCase());
}

/**
 * Generate fingerprint — accepts either structural steps or legacy input.
 * For legacy input, converts moduleChain to steps with "unknown" capability.
 * CJPI/name/category are IGNORED in the fingerprint.
 * 
 * FAILSAFE: Structured error handling with diagnostic context.
 * BEACON: All failures logged with structured health signals.
 */
export async function generatePipelineFingerprint(
  input: PipelineFingerprintInput | StructuralFingerprintInput
): Promise<string> {
  try {
    const steps = resolveSteps(input);
    return await generateStructuralFingerprint({ steps });
  } catch (err) {
    if (err instanceof FingerprintError) {
      throw err;
    }
    const error = new FingerprintError(
      'FP_PIPELINE_FAILED',
      'Pipeline fingerprint generation failed',
      { inputType: 'steps' in input ? 'structural' : 'legacy', error: err instanceof Error ? err.message : String(err) }
    );
    log.error(error.message, error.context);
    throw error;
  }
}

/**
 * Build canonical payload string for edge functions (Deno crypto.subtle).
 * 
 * FAILSAFE: Validates input and wraps canonicalization with error handling.
 */
export function buildFingerprintPayload(
  input: PipelineFingerprintInput | StructuralFingerprintInput
): string {
  try {
    const steps = resolveSteps(input);
    validateSteps(steps);
    const payload = buildPayloadObject(steps);
    return canonicalizeJson(payload);
  } catch (err) {
    if (err instanceof FingerprintError) {
      throw err;
    }
    const error = new FingerprintError(
      'FP_PAYLOAD_FAILED',
      'Failed to build fingerprint payload',
      { error: err instanceof Error ? err.message : String(err) }
    );
    log.error(error.message, error.context);
    throw error;
  }
}

/** Truncate fingerprint for display: first 12 hex chars + ellipsis */
export function truncateFingerprint(fp: string): string {
  if (!fp || fp.length <= 12) return fp || '';
  return fp.slice(0, 12).toUpperCase() + '…';
}

/** Format pipeline steps for display: MODULE.capability → MODULE.capability */
export function formatPipelineSteps(steps: PipelineStep[]): string {
  if (!Array.isArray(steps) || steps.length === 0) return '';
  return steps.map(s => `${s.module.toUpperCase()}.${s.capability}`).join(' → ');
}
