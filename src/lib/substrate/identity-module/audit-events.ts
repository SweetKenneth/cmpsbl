/**
 * Identity Audit Events — Legally Defensible Authentication Logging
 * v10.5.4 ARCHITECT Epoch
 * 
 * Every authentication event is recorded into the AUDIT chain.
 * These records are immutable and cryptographically linked.
 */

import { recordAuditEntry } from '../audit-module';

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const AUTH_AUDIT_EVENTS = {
  PASSKEY_REGISTERED: 'AUTH_PASSKEY_REGISTERED',
  PASSKEY_AUTHENTICATED: 'AUTH_PASSKEY_AUTHENTICATED',
  PASSKEY_REVOKED: 'AUTH_PASSKEY_REVOKED',
  DEVICE_REJECTED: 'AUTH_DEVICE_REJECTED',
  SESSION_CREATED: 'AUTH_SESSION_CREATED',
  SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  REAUTH_REQUESTED: 'AUTH_REAUTH_REQUESTED',
  REAUTH_COMPLETED: 'AUTH_REAUTH_COMPLETED',
  AUTH_MODE_CHANGED: 'AUTH_MODE_CHANGED',
} as const;

export type AuthAuditEvent = typeof AUTH_AUDIT_EVENTS[keyof typeof AUTH_AUDIT_EVENTS];

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT LOGGERS
// ═══════════════════════════════════════════════════════════════════════════════

export function auditPasskeyRegistered(
  actorId: string,
  credentialId: string,
  deviceType: string
): void {
  recordAuditEntry(
    { id: actorId, type: 'human' },
    'identity',
    AUTH_AUDIT_EVENTS.PASSKEY_REGISTERED,
    'passkey',
    credentialId,
    null,
    { credentialId, deviceType },
    { deviceType, timestamp: new Date().toISOString() }
  );
}

export function auditPasskeyAuthenticated(
  actorId: string,
  credentialId: string
): void {
  recordAuditEntry(
    { id: actorId, type: 'human' },
    'identity',
    AUTH_AUDIT_EVENTS.PASSKEY_AUTHENTICATED,
    'session',
    credentialId,
    null,
    { credentialId, authenticated: true },
    { timestamp: new Date().toISOString() }
  );
}

export function auditDeviceRejected(
  actorId: string,
  reason: string,
  metadata: Record<string, string> = {}
): void {
  recordAuditEntry(
    { id: actorId, type: 'system' },
    'identity',
    AUTH_AUDIT_EVENTS.DEVICE_REJECTED,
    'device',
    actorId,
    null,
    { rejected: true, reason },
    { reason, ...metadata }
  );
}

export function auditPasskeyRevoked(
  actorId: string,
  credentialId: string
): void {
  recordAuditEntry(
    { id: actorId, type: 'human' },
    'identity',
    AUTH_AUDIT_EVENTS.PASSKEY_REVOKED,
    'passkey',
    credentialId,
    { active: true },
    { active: false, revoked: true },
    { timestamp: new Date().toISOString() }
  );
}

export function auditSessionCreated(
  actorId: string,
  sessionId: string,
  method: 'passkey' | 'password'
): void {
  recordAuditEntry(
    { id: actorId, type: 'human' },
    'identity',
    AUTH_AUDIT_EVENTS.SESSION_CREATED,
    'session',
    sessionId,
    null,
    { active: true, method },
    { method, timestamp: new Date().toISOString() }
  );
}

export function auditAuthModeChanged(
  actorId: string,
  previousMode: string,
  newMode: string
): void {
  recordAuditEntry(
    { id: actorId, type: 'system' },
    'identity',
    AUTH_AUDIT_EVENTS.AUTH_MODE_CHANGED,
    'config',
    'auth_mode',
    { mode: previousMode },
    { mode: newMode },
    { previousMode, newMode, timestamp: new Date().toISOString() }
  );
}
