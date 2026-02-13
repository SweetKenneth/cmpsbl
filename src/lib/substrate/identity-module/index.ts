/**
 * IDENTITY Module — Universal Actor Attribution
 * v9.1.0 ARCHITECT Epoch — Human/agent/system identity, signatures, provenance
 * Passwordless WebAuthn passkey authentication
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';

export type ActorType = 'human' | 'agent' | 'system';

export interface ActorIdentity {
  id: string;
  type: ActorType;
  displayName: string;
  signature: string;
  createdAt: number;
  lastActiveAt: number;
  metadata: Record<string, unknown>;
  /** Registered passkey credential IDs */
  passkeys: string[];
  /** Whether this actor uses passwordless auth */
  passwordless: boolean;
}

export interface IdentityModuleState {
  initialized: boolean;
  currentActor: ActorIdentity | null;
  registeredActors: number;
  signaturesIssued: number;
  /** Total passkeys registered across all actors */
  passkeyCount: number;
  /** Whether passwordless mode is enforced */
  passwordlessEnforced: boolean;
}

const actors = new Map<string, ActorIdentity>();
const state: IdentityModuleState = {
  initialized: false,
  currentActor: null,
  registeredActors: 0,
  signaturesIssued: 0,
  passkeyCount: 0,
  passwordlessEnforced: true,
};

function generateSignature(actorId: string): string {
  const data = `${actorId}:${Date.now()}:${Math.random()}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash |= 0;
  }
  return `sig-${Math.abs(hash).toString(16).padStart(16, '0')}`;
}

export function initIdentity(): void {
  emitStarted('identity', 'init', {});
  state.initialized = true;
  // Register system actor
  registerActor('system', 'system', 'Substrate System');
  emitSucceeded('identity', 'init', {});
}

export function registerActor(id: string, type: ActorType, displayName: string, metadata: Record<string, unknown> = {}): ActorIdentity {
  const sig = generateSignature(id);
  const actor: ActorIdentity = {
    id, type, displayName, signature: sig,
    createdAt: Date.now(), lastActiveAt: Date.now(), metadata,
    passkeys: [], passwordless: true,
  };
  actors.set(id, actor);
  state.registeredActors = actors.size;
  state.signaturesIssued++;
  emit({ module: 'identity', event_type: 'actor_registered', outcome: 'succeeded', data: { actorId: id, type } });
  return actor;
}

export function whoami(): ActorIdentity | null {
  return state.currentActor;
}

export function setCurrentActor(id: string): ActorIdentity | null {
  const actor = actors.get(id);
  if (actor) {
    actor.lastActiveAt = Date.now();
    state.currentActor = actor;
  }
  return actor ?? null;
}

export function signAction(actorId: string, action: string): { actorId: string; action: string; signature: string; timestamp: number } {
  const actor = actors.get(actorId);
  const signature = actor?.signature ?? generateSignature(actorId);
  return { actorId, action, signature, timestamp: Date.now() };
}

export function addPasskeyToActor(actorId: string, credentialId: string): boolean {
  const actor = actors.get(actorId);
  if (!actor) return false;
  if (!actor.passkeys.includes(credentialId)) {
    actor.passkeys.push(credentialId);
    state.passkeyCount++;
    emit({ module: 'identity', event_type: 'passkey_bound', outcome: 'succeeded', data: { actorId, credentialId } });
  }
  return true;
}

export function removePasskeyFromActor(actorId: string, credentialId: string): boolean {
  const actor = actors.get(actorId);
  if (!actor) return false;
  const idx = actor.passkeys.indexOf(credentialId);
  if (idx === -1) return false;
  actor.passkeys.splice(idx, 1);
  state.passkeyCount = Math.max(0, state.passkeyCount - 1);
  return true;
}

export function getActorPasskeys(actorId: string): string[] {
  return actors.get(actorId)?.passkeys || [];
}

export function getIdentityState(): IdentityModuleState { return { ...state }; }
export function getIdentityHealth(): number { return state.initialized ? 100 : 0; }

// Re-exports for WebAuthn and auth config
export { registerPasskey, authenticateWithPasskey, isWebAuthnSupported, isPlatformAuthenticatorAvailable, getUserPasskeys, revokePasskey } from './webauthn';
export type { PasskeyCredential, PasskeyRegistrationResult, PasskeyAuthenticationResult } from './webauthn';
export { AUTH_CONFIG, isPasswordAuthAllowed, isPasskeyPrimary, setAuthMode } from './auth-config';
export type { AuthConfig, AuthMode } from './auth-config';
export { AUTH_AUDIT_EVENTS, auditPasskeyRegistered, auditPasskeyAuthenticated, auditDeviceRejected, auditPasskeyRevoked } from './audit-events';
