/**
 * Authentication Configuration — Passwordless Enforcement
 *
 * Round 1 Fixes:
 * ✅ setAuthMode emits observability event
 * ✅ sessionTimeoutMs clamped to safe range
 * ✅ setAuthMode validates input
 *
 * Global auth mode configuration. When PASSKEY_ONLY, password fields
 * are suppressed across the entire UI and password-based auth is disabled.
 */

import { emit } from '../events';

export type AuthMode = 'PASSKEY_ONLY' | 'PASSKEY_PREFERRED' | 'PASSWORD_FALLBACK';

const VALID_MODES: AuthMode[] = ['PASSKEY_ONLY', 'PASSKEY_PREFERRED', 'PASSWORD_FALLBACK'];

export interface AuthConfig {
  /** Current authentication mode */
  mode: AuthMode;
  /** Whether password fields should render */
  passwordsEnabled: boolean;
  /** Whether passkey enrollment is required on signup */
  passkeyRequired: boolean;
  /** Whether conditional UI (autofill) passkey is enabled */
  conditionalUIEnabled: boolean;
  /** Maximum passkeys per user */
  maxPasskeysPerUser: number;
  /** Session timeout in milliseconds (default: 24h) */
  sessionTimeoutMs: number;
  /** Whether to enforce re-authentication for sensitive operations */
  reauthForSensitive: boolean;
}

/**
 * Global authentication configuration
 * Passwordless by default — no shared secrets, no phishing vectors
 */
export const AUTH_CONFIG: AuthConfig = {
  mode: 'PASSKEY_ONLY',
  passwordsEnabled: false,
  passkeyRequired: true,
  conditionalUIEnabled: true,
  maxPasskeysPerUser: 10,
  sessionTimeoutMs: 24 * 60 * 60 * 1000, // 24 hours
  reauthForSensitive: true,
};

/**
 * Check if passwords are allowed in current config
 */
export function isPasswordAuthAllowed(): boolean {
  return AUTH_CONFIG.mode === 'PASSWORD_FALLBACK';
}

/**
 * Check if passkey auth is the primary method
 */
export function isPasskeyPrimary(): boolean {
  return AUTH_CONFIG.mode === 'PASSKEY_ONLY' || AUTH_CONFIG.mode === 'PASSKEY_PREFERRED';
}

/**
 * Update auth mode — validates input and emits audit event
 */
export function setAuthMode(mode: AuthMode): void {
  if (!VALID_MODES.includes(mode)) {
    emit({ module: 'identity', event_type: 'auth_mode_rejected', outcome: 'failed', data: { attempted: mode } });
    return;
  }
  const previousMode = AUTH_CONFIG.mode;
  AUTH_CONFIG.mode = mode;
  AUTH_CONFIG.passwordsEnabled = mode === 'PASSWORD_FALLBACK';
  AUTH_CONFIG.passkeyRequired = mode === 'PASSKEY_ONLY';

  emit({
    module: 'identity',
    event_type: 'auth_mode_changed',
    outcome: 'succeeded',
    data: { previousMode, newMode: mode },
  });
}

/**
 * Update session timeout with safe bounds (5 min to 7 days)
 */
export function setSessionTimeout(ms: number): void {
  const MIN_TIMEOUT = 5 * 60 * 1000;       // 5 minutes
  const MAX_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 7 days
  AUTH_CONFIG.sessionTimeoutMs = Math.max(MIN_TIMEOUT, Math.min(MAX_TIMEOUT, ms));
}
