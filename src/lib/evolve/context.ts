/**
 * Evolve Context — Single Source of Truth for Evolution Execution
 * v1.0.0 — Unified context for shadow and production modes
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type EvolveMode = 'shadow' | 'production';
export type InvocationSource = 'terminal' | 'dashboard' | 'api';
export type PersistTarget = 'shadow_store' | 'prod_store';

export interface EvolveContext {
  mode: EvolveMode;
  evolution_id: string;
  allow_write: boolean;
  persist_target: PersistTarget;
  verification_required: boolean;
  invoked_from: InvocationSource;
  started_at: Date;
  max_retries: number;
  timeout_ms: number;
  metadata?: Record<string, unknown>;
}

export interface EvolveContextOptions {
  mode: EvolveMode;
  invoked_from?: InvocationSource;
  evolution_id?: string;
  metadata?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════
// CONTEXT FACTORY
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new EvolveContext with proper defaults
 */
export function createEvolveContext(options: EvolveContextOptions): EvolveContext {
  const evolution_id = options.evolution_id || crypto.randomUUID();
  const mode = options.mode;
  
  return {
    mode,
    evolution_id,
    allow_write: true, // Always allow writes (shadow writes to shadow, prod writes to prod)
    persist_target: mode === 'shadow' ? 'shadow_store' : 'prod_store',
    verification_required: mode === 'production', // Production requires verification
    invoked_from: options.invoked_from || 'terminal',
    started_at: new Date(),
    max_retries: mode === 'shadow' ? 3 : 1, // More lenient in shadow
    timeout_ms: mode === 'shadow' ? 60000 : 30000,
    metadata: options.metadata,
  };
}

/**
 * Validate that a context is properly formed
 */
export function validateContext(context: EvolveContext): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!context.evolution_id) {
    errors.push('evolution_id is required');
  }
  
  if (!['shadow', 'production'].includes(context.mode)) {
    errors.push(`Invalid mode: ${context.mode}`);
  }
  
  if (context.mode === 'production' && !context.verification_required) {
    errors.push('Production mode must require verification');
  }
  
  if (context.persist_target === 'prod_store' && context.mode === 'shadow') {
    errors.push('Shadow mode cannot write to production store');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Context utilities
 */
export function isWriteAllowed(context: EvolveContext): boolean {
  return context.allow_write === true;
}

export function isShadowMode(context: EvolveContext): boolean {
  return context.mode === 'shadow';
}

export function isProductionMode(context: EvolveContext): boolean {
  return context.mode === 'production';
}

export function getShortId(context: EvolveContext): string {
  return context.evolution_id.substring(0, 8);
}
