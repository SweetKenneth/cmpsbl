/**
 * Decode Identity Context — Cryptographic User Recognition
 * 
 * Binds Decode's conversational memory to cryptographically verified identities.
 * No passwords, no cookies — device-bound secure enclave signatures.
 */

import { whoami, type ActorIdentity } from '../identity-module';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DecodeIdentityContext {
  /** Cryptographic identity signature from IDENTITY module */
  identitySignature: string | null;
  /** Device trust score (0-100) based on passkey authentication */
  deviceTrustScore: number;
  /** Whether the current session is cryptographically verified */
  verified: boolean;
  /** Actor identity from IDENTITY module */
  actor: ActorIdentity | null;
  /** Authentication method used */
  authMethod: 'passkey' | 'session' | 'anonymous';
  /** Number of successful authentications from this identity */
  authCount: number;
  /** First seen timestamp */
  firstSeen: number | null;
  /** Recognition confidence (0-1) */
  recognitionConfidence: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT STATE
// ═══════════════════════════════════════════════════════════════════════════════

const identityContexts = new Map<string, DecodeIdentityContext>();
const MAX_IDENTITY_CONTEXTS = 500;

// Context cleanup configuration
const CONTEXT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Cleanup expired identity contexts to prevent memory leaks
 */
function cleanupExpiredContexts(): void {
  const now = Date.now();
  const expiredKeys: string[] = [];
  
  for (const [key, context] of identityContexts.entries()) {
    const contextAge = now - (context.firstSeen ?? 0);
    if (contextAge > CONTEXT_MAX_AGE_MS) {
      expiredKeys.push(key);
    }
  }
  
  for (const key of expiredKeys) {
    identityContexts.delete(key);
  }
  
  if (expiredKeys.length > 0) {
    console.debug(`[IDENTITY-CONTEXT] Cleaned up ${expiredKeys.length} expired contexts`);
  }
}

// Set up periodic cleanup
setInterval(cleanupExpiredContexts, CLEANUP_INTERVAL_MS);

/**
 * Build identity context for Decode from current IDENTITY module state
 */
export function buildIdentityContext(sessionId?: string): DecodeIdentityContext {
  const actor = whoami();

  if (!actor) {
    return {
      identitySignature: null,
      deviceTrustScore: 0,
      verified: false,
      actor: null,
      authMethod: 'anonymous',
      authCount: 0,
      firstSeen: null,
      recognitionConfidence: 0,
    };
  }

  // Check for existing context (returning user recognition)
  const existing = identityContexts.get(actor.id);

  const context: DecodeIdentityContext = {
    identitySignature: actor.signature,
    deviceTrustScore: computeDeviceTrust(actor),
    verified: !!actor.signature,
    actor,
    authMethod: 'passkey',
    authCount: existing ? existing.authCount + 1 : 1,
    firstSeen: existing?.firstSeen ?? actor.createdAt,
    recognitionConfidence: existing ? Math.min(1, 0.5 + (existing.authCount * 0.1)) : 0.5,
  };

  // Persist for future recognition — evict oldest if over limit
  if (identityContexts.size >= MAX_IDENTITY_CONTEXTS && !identityContexts.has(actor.id)) {
    const oldestKey = identityContexts.keys().next().value;
    if (oldestKey) identityContexts.delete(oldestKey);
  }
  identityContexts.set(actor.id, context);

  return context;
}

/**
 * Compute device trust score based on actor metadata
 */
function computeDeviceTrust(actor: ActorIdentity): number {
  let score = 50; // Base score for authenticated user

  // Passkey-authenticated users get higher trust
  if (actor.signature) score += 20;

  // Longer-active accounts get more trust
  const ageMs = Date.now() - actor.createdAt;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays > 1) score += 10;
  if (ageDays > 7) score += 10;
  if (ageDays > 30) score += 10;

  return Math.min(100, score);
}

/**
 * Get identity context for a specific actor
 */
export function getIdentityContext(actorId: string): DecodeIdentityContext | null {
  return identityContexts.get(actorId) || null;
}

/**
 * Clear identity context (on sign-out)
 */
export function clearIdentityContext(actorId: string): void {
  identityContexts.delete(actorId);
}

/**
 * Check if Decode recognizes a returning user
 */
export function isReturningUser(actorId: string): boolean {
  const ctx = identityContexts.get(actorId);
  return !!ctx && ctx.authCount > 1;
}
