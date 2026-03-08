/**
 * Veto Scope Matrix
 * 
 * Requires all vetoes to declare explicit scope of effect.
 * Vetoes without scope default to healing_actions only.
 */

import type { VetoScope } from './veto-authority';

// ═══════════════════════════════════════════════════════════════════════════════
// SCOPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const ALLOWED_SCOPES: readonly VetoScope[] = [
  'healing_actions',
  'routing_changes',
  'scaling_operations',
  'write_access',
  'external_integrations',
] as const;

export const DEFAULT_SCOPE: VetoScope = 'healing_actions';

export interface ScopeDefinition {
  scope: VetoScope;
  description: string;
  affected_modules: string[];
  risk_level: 'low' | 'medium' | 'high';
}

export const SCOPE_MATRIX: Record<VetoScope, ScopeDefinition> = {
  healing_actions: {
    scope: 'healing_actions',
    description: 'Self-healing and auto-recovery operations',
    affected_modules: ['system', 'cortex', 'medic'],
    risk_level: 'low',
  },
  routing_changes: {
    scope: 'routing_changes',
    description: 'Intent routing and pipeline modifications',
    affected_modules: ['decode', 'cortex', 'ripple'],
    risk_level: 'medium',
  },
  scaling_operations: {
    scope: 'scaling_operations',
    description: 'Resource scaling and capacity changes',
    affected_modules: ['system', 'economy', 'sandbox'],
    risk_level: 'medium',
  },
  write_access: {
    scope: 'write_access',
    description: 'Database writes, state mutations, and persistence',
    affected_modules: ['brain', 'memory', 'encode', 'audit'],
    risk_level: 'high',
  },
  external_integrations: {
    scope: 'external_integrations',
    description: 'Outbound API calls, webhooks, and relay operations',
    affected_modules: ['relay', 'integration', 'nexus'],
    risk_level: 'high',
  },
};

/**
 * Validate and normalize a veto scope.
 * Returns the default scope if the provided scope is invalid or missing.
 */
export function normalizeScope(scope?: string): VetoScope {
  if (!scope) return DEFAULT_SCOPE;
  if ((ALLOWED_SCOPES as readonly string[]).includes(scope)) return scope as VetoScope;
  console.warn(`[VetoScope] Invalid scope "${scope}", defaulting to "${DEFAULT_SCOPE}"`);
  return DEFAULT_SCOPE;
}

/**
 * Check if a module is affected by a given scope
 */
export function isModuleAffected(module: string, scope: VetoScope): boolean {
  return SCOPE_MATRIX[scope].affected_modules.includes(module.toLowerCase());
}

/**
 * Get all scopes that affect a given module
 */
export function getScopesForModule(module: string): VetoScope[] {
  return ALLOWED_SCOPES.filter(s => SCOPE_MATRIX[s].affected_modules.includes(module.toLowerCase()));
}
