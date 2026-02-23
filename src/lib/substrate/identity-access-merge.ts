/**
 * IDENTITY → ACCESS Merge Shim
 * 
 * IDENTITY module capabilities are now part of ACCESS.
 * This shim routes all identity.* calls to access.* internals.
 * 
 * Preserved capabilities:
 *   - Actor attribution & reputation
 *   - WebAuthn / passkey operations
 *   - Trust scoring
 *   - Session/role checks
 * 
 * All now accessible via access.identity_* actions.
 */

import { emit } from './events';

// Identity actions that route into ACCESS
const IDENTITY_TO_ACCESS_MAP: Record<string, string> = {
  'status': 'identity_status',
  'pulse': 'identity_pulse',
  'health': 'identity_health',
  'resolve': 'identity_resolve',
  'attribute': 'identity_attribute',
  'trust_score': 'identity_trust_score',
  'register_passkey': 'identity_register_passkey',
  'verify_passkey': 'identity_verify_passkey',
  'session_check': 'identity_session_check',
  'role_check': 'identity_role_check',
};

/**
 * Route an identity.* command to access.* 
 * Returns the remapped action name for the ACCESS module.
 */
export function resolveIdentityAction(action: string): string {
  return IDENTITY_TO_ACCESS_MAP[action] || `identity_${action}`;
}

/**
 * Check if a given action was originally an IDENTITY action.
 */
export function isIdentityAction(action: string): boolean {
  return action.startsWith('identity_');
}

/**
 * Handle identity.* calls locally when ACCESS module handles them.
 * This is a pass-through shim that emits proper events.
 */
export function handleIdentityProxy(action: string, input?: any): { success: boolean; data: any } {
  const mappedAction = resolveIdentityAction(action);

  emit({
    module: 'access',
    action: mappedAction,
    data: { ...input, _source: 'identity_facade', _deprecated: true },
  });

  // Return success with facade metadata
  return {
    success: true,
    data: {
      action: mappedAction,
      backed_by: 'access',
      facade: 'identity',
      ...(input || {}),
    },
  };
}

/** Modules that were merged into ACCESS */
export const IDENTITY_MERGED = true;
export const IDENTITY_TARGET_MODULE = 'access' as const;
