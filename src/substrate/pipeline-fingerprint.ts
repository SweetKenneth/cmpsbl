/**
 * Pipeline Fingerprint Generator — Structural Identity
 * Produces deterministic SHA-256 fingerprints from ordered pipeline steps.
 * Identity is derived ONLY from executable architecture (steps + epoch).
 * CJPI, name, and category are explicitly excluded from identity.
 * 
 * v13.3.1: Epoch from config, "unknown" capability placeholder, optional version field.
 */

import { canonicalizeJson, sha256 } from '@/lib/control-plane/hash';
import { PIPELINE_FINGERPRINT_EPOCH, LEGACY_CAPABILITY_PLACEHOLDER } from '@/config/substrate';

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

/**
 * Generate a deterministic SHA-256 fingerprint from pipeline steps.
 * Identity = steps + epoch. Order is preserved. Duplicates are preserved.
 */
export async function generateStructuralFingerprint(input: StructuralFingerprintInput): Promise<string> {
  const payload = {
    steps: input.steps.map(s => ({
      module: s.module.toUpperCase(),
      capability: s.capability,
      ...(s.params && Object.keys(s.params).length > 0 ? { params: s.params } : {}),
    })),
    epoch: PIPELINE_FINGERPRINT_EPOCH,
  };
  const canonical = canonicalizeJson(payload);
  return sha256(canonical);
}

/**
 * Convert a module chain to pipeline steps (backward compat).
 * Legacy discoveries without pipeline_steps use "unknown" capability
 * to clarify that capability was not recorded historically.
 */
export function moduleChainToSteps(moduleChain: string[]): PipelineStep[] {
  return moduleChain.map(m => ({ module: m.toUpperCase(), capability: LEGACY_CAPABILITY_PLACEHOLDER }));
}

/**
 * Derive module_chain from pipeline steps (preserves order + duplicates).
 */
export function stepsToModuleChain(steps: PipelineStep[]): string[] {
  return steps.map(s => s.module.toUpperCase());
}

/**
 * Generate fingerprint — accepts either structural steps or legacy input.
 * For legacy input, converts moduleChain to steps with "unknown" capability.
 * CJPI/name/category are IGNORED in the fingerprint.
 */
export async function generatePipelineFingerprint(
  input: PipelineFingerprintInput | StructuralFingerprintInput
): Promise<string> {
  if ('steps' in input) {
    return generateStructuralFingerprint(input);
  }
  // Legacy path: convert moduleChain to steps
  const steps = moduleChainToSteps(input.moduleChain);
  return generateStructuralFingerprint({ steps });
}

/**
 * Build canonical payload string for edge functions (Deno crypto.subtle).
 */
export function buildFingerprintPayload(
  input: PipelineFingerprintInput | StructuralFingerprintInput
): string {
  let steps: PipelineStep[];
  if ('steps' in input) {
    steps = input.steps;
  } else {
    steps = moduleChainToSteps(input.moduleChain);
  }
  const payload = {
    steps: steps.map(s => ({
      module: s.module.toUpperCase(),
      capability: s.capability,
      ...(s.params && Object.keys(s.params).length > 0 ? { params: s.params } : {}),
    })),
    epoch: PIPELINE_FINGERPRINT_EPOCH,
  };
  return canonicalizeJson(payload);
}

/** Truncate fingerprint for display: first 12 hex chars + ellipsis */
export function truncateFingerprint(fp: string): string {
  if (!fp || fp.length <= 12) return fp || '';
  return fp.slice(0, 12).toUpperCase() + '…';
}

/** Format pipeline steps for display: MODULE.capability → MODULE.capability */
export function formatPipelineSteps(steps: PipelineStep[]): string {
  return steps.map(s => `${s.module.toUpperCase()}.${s.capability}`).join(' → ');
}
