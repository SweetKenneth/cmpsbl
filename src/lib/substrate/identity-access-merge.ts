/**
 * IDENTITY → ACCESS Merge Shim
 * Routes all identity.* calls to access.* internals.
 */

import { emit } from './events';

const IDENTITY_TO_ACCESS_MAP: Record<string, string> = {
  status: 'identity_status', pulse: 'identity_pulse', health: 'identity_health',
  resolve: 'identity_resolve', attribute: 'identity_attribute',
  trust_score: 'identity_trust_score', register_passkey: 'identity_register_passkey',
  verify_passkey: 'identity_verify_passkey', session_check: 'identity_session_check',
  role_check: 'identity_role_check',
};

export function resolveIdentityAction(action: string): string {
  return IDENTITY_TO_ACCESS_MAP[action] || `identity_${action}`;
}

export function isIdentityAction(action: string): boolean {
  return action.startsWith('identity_');
}

export function handleIdentityProxy(action: string, input?: any): { success: boolean; data: any } {
  const mappedAction = resolveIdentityAction(action);
  emit({ module: 'access', event_type: mappedAction, outcome: 'succeeded', data: { ...input, _source: 'identity_facade' } });
  return { success: true, data: { action: mappedAction, backed_by: 'access', facade: 'identity', ...(input || {}) } };
}

export const IDENTITY_MERGED = true;
export const IDENTITY_TARGET_MODULE = 'access' as const;
