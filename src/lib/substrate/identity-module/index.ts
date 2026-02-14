/**
 * IDENTITY Module — Universal Actor Attribution
 * v9.3.0 ARCHITECT Epoch — Human/agent/system identity, signatures, provenance
 * Circuit Breaker + Hot-Swap + Graceful Fallback + Passwordless WebAuthn
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, withResilienceSync, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';

export type ActorType = 'human' | 'agent' | 'system';

export interface ActorIdentity {
  id: string;
  type: ActorType;
  displayName: string;
  signature: string;
  createdAt: number;
  lastActiveAt: number;
  metadata: Record<string, unknown>;
  passkeys: string[];
  passwordless: boolean;
}

export interface IdentityModuleState {
  initialized: boolean;
  currentActor: ActorIdentity | null;
  registeredActors: number;
  signaturesIssued: number;
  passkeyCount: number;
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

let moduleEngine: ModuleEngine | null = null;

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
  try {
    initCircuitBreaker('identity', { failureThreshold: 5, recoveryTimeout: 30_000 });
    moduleEngine = activateModuleEngine('identity', '9.3.0');
    state.initialized = true;
    registerActor('system', 'system', 'Substrate System');
    emitSucceeded('identity', 'init', { engineId: moduleEngine.instance.id });
  } catch (err) {
    state.initialized = true;
    registerActor('system', 'system', 'Substrate System');
    emitFailed('identity', 'init', err instanceof Error ? err.message : String(err));
  }
}

export function registerActor(id: string, type: ActorType, displayName: string, metadata: Record<string, unknown> = {}): ActorIdentity {
  const { result } = withResilienceSync(
    'identity',
    () => {
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
    },
    {
      id, type, displayName, signature: 'fallback-sig',
      createdAt: Date.now(), lastActiveAt: Date.now(), metadata,
      passkeys: [], passwordless: true,
    },
    'register_actor'
  );
  return result;
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

export function getIdentityResilience() {
  return getModuleResilienceReport('identity', getIdentityHealth());
}

export function getIdentityEngine() {
  return moduleEngine;
}

// Re-exports for WebAuthn and auth config
export { registerPasskey, authenticateWithPasskey, isWebAuthnSupported, isPlatformAuthenticatorAvailable, getUserPasskeys, revokePasskey } from './webauthn';
export type { PasskeyCredential, PasskeyRegistrationResult, PasskeyAuthenticationResult } from './webauthn';
export { AUTH_CONFIG, isPasswordAuthAllowed, isPasskeyPrimary, setAuthMode } from './auth-config';
export type { AuthConfig, AuthMode } from './auth-config';
export { AUTH_AUDIT_EVENTS, auditPasskeyRegistered, auditPasskeyAuthenticated, auditDeviceRejected, auditPasskeyRevoked } from './audit-events';
