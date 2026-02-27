/**
 * IDENTITY Module — Universal Actor Attribution
 * Human/agent/system identity, signatures, provenance
 * Circuit Breaker + Hot-Swap + Graceful Fallback + Passwordless WebAuthn
 * 
 * CLM-Requested Upgrades Implemented:
 * ✅ Actor reputation scoring (trust/reliability metrics)
 * ✅ Cross-agency identity portability
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, withResilienceSync, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';
import { validateStringInput, clampNumber } from '@/lib/system/hardening';

export type ActorType = 'human' | 'agent' | 'system';

// ═══════════════════════════════════════════════════════════════════
// CLM UPGRADE: Actor Reputation Scoring
// ═══════════════════════════════════════════════════════════════════
export interface ActorReputation {
  trustScore: number;        // 0-100
  reliabilityRate: number;   // 0-1
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  escalations: number;
  lastReputationUpdate: number;
  tier: 'untrusted' | 'basic' | 'trusted' | 'verified' | 'elite';
}

// ═══════════════════════════════════════════════════════════════════
// CLM UPGRADE: Cross-Agency Identity Portability
// ═══════════════════════════════════════════════════════════════════
export interface PortableIdentity {
  actorId: string;
  originAgency: string;
  linkedAgencies: string[];
  portabilityToken: string;
  createdAt: number;
  lastSyncedAt: number;
}

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
  reputation: ActorReputation;
  portableIdentity?: PortableIdentity;
}

export interface IdentityModuleState {
  initialized: boolean;
  currentActor: ActorIdentity | null;
  registeredActors: number;
  signaturesIssued: number;
  passkeyCount: number;
  passwordlessEnforced: boolean;
  avgTrustScore: number;
  portableIdentities: number;
}

const actors = new Map<string, ActorIdentity>();
const state: IdentityModuleState = {
  initialized: false,
  currentActor: null,
  registeredActors: 0,
  signaturesIssued: 0,
  passkeyCount: 0,
  passwordlessEnforced: true,
  avgTrustScore: 0,
  portableIdentities: 0,
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

function createDefaultReputation(): ActorReputation {
  return {
    trustScore: 50,
    reliabilityRate: 1.0,
    totalActions: 0,
    successfulActions: 0,
    failedActions: 0,
    escalations: 0,
    lastReputationUpdate: Date.now(),
    tier: 'basic',
  };
}

function calculateTier(score: number): ActorReputation['tier'] {
  if (score >= 90) return 'elite';
  if (score >= 75) return 'verified';
  if (score >= 50) return 'trusted';
  if (score >= 25) return 'basic';
  return 'untrusted';
}

export function initIdentity(): void {
  emitStarted('identity', 'init', {});
  try {
    initCircuitBreaker('identity', { failureThreshold: 5, recoveryTimeout: 30_000 });
    moduleEngine = activateModuleEngine('identity', '10.5.1');
    state.initialized = true;
    registerActor('system', 'system', 'Substrate System');
    emitSucceeded('identity', 'init', { engineId: moduleEngine.instance.id });
  } catch (err) {
    state.initialized = true;
    registerActor('system', 'system', 'Substrate System');
    emitFailed('identity', 'init', err instanceof Error ? err.message : String(err));
  }
}

const MAX_ACTORS = 1000;
const MAX_PASSKEYS_PER_ACTOR = 20;

export function registerActor(id: string, type: ActorType, displayName: string, metadata: Record<string, unknown> = {}): ActorIdentity {
  // Input validation
  const validId = validateStringInput(id, { maxLength: 128, minLength: 1, label: 'identity.actorId' });
  const validName = validateStringInput(displayName, { maxLength: 256, minLength: 1 }) ?? 'Unknown Actor';
  const validType: ActorType = (['human', 'agent', 'system'] as ActorType[]).includes(type) ? type : 'system';

  if (!validId) {
    throw new Error('[IDENTITY] Invalid actor ID: must be 1-128 characters');
  }

  // Enforce max actors limit
  if (actors.size >= MAX_ACTORS && !actors.has(validId)) {
    emit({ module: 'identity', event_type: 'actor_limit_reached', outcome: 'failed', data: { limit: MAX_ACTORS } });
    throw new Error(`[IDENTITY] Max actors limit reached (${MAX_ACTORS})`);
  }

  const { result } = withResilienceSync(
    'identity',
    () => {
      const sig = generateSignature(validId);
      const actor: ActorIdentity = {
        id: validId, type: validType, displayName: validName, signature: sig,
        createdAt: Date.now(), lastActiveAt: Date.now(), metadata,
        passkeys: [], passwordless: true,
        reputation: createDefaultReputation(),
      };
      // System actors start with higher trust
      if (type === 'system') {
        actor.reputation.trustScore = 95;
        actor.reputation.tier = 'elite';
      }
      actors.set(id, actor);
      state.registeredActors = actors.size;
      state.signaturesIssued++;
      updateAvgTrustScore();
      emit({ module: 'identity', event_type: 'actor_registered', outcome: 'succeeded', data: { actorId: id, type } });
      return actor;
    },
    {
      id, type, displayName, signature: 'fallback-sig',
      createdAt: Date.now(), lastActiveAt: Date.now(), metadata,
      passkeys: [], passwordless: true,
      reputation: createDefaultReputation(),
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
  const validCred = validateStringInput(credentialId, { maxLength: 512, minLength: 1 });
  if (!validCred) return false;
  if (actor.passkeys.length >= MAX_PASSKEYS_PER_ACTOR) {
    emit({ module: 'identity', event_type: 'passkey_limit_reached', outcome: 'failed', data: { actorId, limit: MAX_PASSKEYS_PER_ACTOR } });
    return false;
  }
  if (!actor.passkeys.includes(validCred)) {
    actor.passkeys.push(validCred);
    state.passkeyCount++;
    emit({ module: 'identity', event_type: 'passkey_bound', outcome: 'succeeded', data: { actorId, credentialId: validCred } });
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

// ═══════════════════════════════════════════════════════════════════
// CLM UPGRADE: Actor Reputation Scoring
// ═══════════════════════════════════════════════════════════════════

export function recordActorOutcome(actorId: string, success: boolean, escalated: boolean = false): ActorReputation | null {
  const actor = actors.get(actorId);
  if (!actor) return null;

  const rep = actor.reputation;
  rep.totalActions++;
  if (success) {
    rep.successfulActions++;
  } else {
    rep.failedActions++;
  }
  if (escalated) {
    rep.escalations++;
  }

  // Calculate reliability rate
  rep.reliabilityRate = rep.totalActions > 0 ? rep.successfulActions / rep.totalActions : 1.0;

  // Update trust score (weighted formula)
  const reliabilityWeight = 0.5;
  const volumeWeight = 0.2;
  const escalationPenalty = 0.3;

  const volumeBonus = Math.min(20, Math.log2(rep.totalActions + 1) * 5);
  const escalationCost = rep.totalActions > 0 ? (rep.escalations / rep.totalActions) * 100 : 0;

  rep.trustScore = Math.max(0, Math.min(100, Math.round(
    (rep.reliabilityRate * 100 * reliabilityWeight) +
    (volumeBonus * volumeWeight * 5) -
    (escalationCost * escalationPenalty)
  )));

  rep.tier = calculateTier(rep.trustScore);
  rep.lastReputationUpdate = Date.now();

  updateAvgTrustScore();

  emit({
    module: 'identity',
    event_type: 'reputation_updated',
    outcome: 'succeeded',
    data: { actorId, trustScore: rep.trustScore, tier: rep.tier, reliability: rep.reliabilityRate },
  });

  return { ...rep };
}

export function getActorReputation(actorId: string): ActorReputation | null {
  return actors.get(actorId)?.reputation ?? null;
}

export function getReputationLeaderboard(limit: number = 10): Array<{ actorId: string; displayName: string; reputation: ActorReputation }> {
  return Array.from(actors.values())
    .sort((a, b) => b.reputation.trustScore - a.reputation.trustScore)
    .slice(0, limit)
    .map(a => ({ actorId: a.id, displayName: a.displayName, reputation: { ...a.reputation } }));
}

function updateAvgTrustScore(): void {
  const allActors = Array.from(actors.values());
  state.avgTrustScore = allActors.length > 0
    ? Math.round(allActors.reduce((sum, a) => sum + a.reputation.trustScore, 0) / allActors.length)
    : 0;
}

// ═══════════════════════════════════════════════════════════════════
// CLM UPGRADE: Cross-Agency Identity Portability
// ═══════════════════════════════════════════════════════════════════

export function createPortableIdentity(actorId: string, originAgency: string): PortableIdentity | null {
  const actor = actors.get(actorId);
  if (!actor) return null;

  // Require minimum trust for portability
  if (actor.reputation.trustScore < 50) {
    emit({ module: 'identity', event_type: 'portability_denied', outcome: 'failed', data: { actorId, reason: 'Insufficient trust score', trustScore: actor.reputation.trustScore } });
    return null;
  }

  const portable: PortableIdentity = {
    actorId,
    originAgency,
    linkedAgencies: [originAgency],
    portabilityToken: generateSignature(`portable-${actorId}-${originAgency}`),
    createdAt: Date.now(),
    lastSyncedAt: Date.now(),
  };

  actor.portableIdentity = portable;
  state.portableIdentities++;

  emit({
    module: 'identity',
    event_type: 'portable_identity_created',
    outcome: 'succeeded',
    data: { actorId, originAgency, token: portable.portabilityToken.slice(0, 12) + '...' },
  });

  return portable;
}

export function linkAgency(actorId: string, agencyId: string): boolean {
  const actor = actors.get(actorId);
  if (!actor?.portableIdentity) return false;

  if (!actor.portableIdentity.linkedAgencies.includes(agencyId)) {
    actor.portableIdentity.linkedAgencies.push(agencyId);
    actor.portableIdentity.lastSyncedAt = Date.now();

    emit({
      module: 'identity',
      event_type: 'agency_linked',
      outcome: 'succeeded',
      data: { actorId, agencyId, totalLinked: actor.portableIdentity.linkedAgencies.length },
    });
  }

  return true;
}

export function getPortableIdentity(actorId: string): PortableIdentity | null {
  return actors.get(actorId)?.portableIdentity ?? null;
}

export function verifyPortabilityToken(actorId: string, token: string): boolean {
  const actor = actors.get(actorId);
  return actor?.portableIdentity?.portabilityToken === token;
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
export { registerPasskey, authenticateWithPasskey, isWebAuthnSupported, isPlatformAuthenticatorAvailable, getUserPasskeys, revokePasskey, linkPasskeyToEmail, getEmailForPasskey } from './webauthn';
export type { PasskeyCredential, PasskeyRegistrationResult, PasskeyAuthenticationResult } from './webauthn';
export { AUTH_CONFIG, isPasswordAuthAllowed, isPasskeyPrimary, setAuthMode } from './auth-config';
export type { AuthConfig, AuthMode } from './auth-config';
export { AUTH_AUDIT_EVENTS, auditPasskeyRegistered, auditPasskeyAuthenticated, auditDeviceRejected, auditPasskeyRevoked } from './audit-events';
