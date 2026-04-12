/**
 * CMPSBL® Function Identity System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Phase 3: Stable, collision-free function identities for deterministic
 * wrapper binding. Every wrapped function gets a unique, reproducible ID.
 *
 * Identity = primitive + functionName + source hash
 * This ensures the same function wrapped twice produces the same ID,
 * preventing duplicate binding and enabling proof-layer correlation.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface FunctionIdentity {
  /** Stable deterministic ID: `{primitive}::{functionName}` */
  readonly id: string;
  /** Primitive this function is bound to */
  readonly primitive: string;
  /** Resolved function name */
  readonly functionName: string;
  /** FNV-1a hash of the function source (if available) */
  readonly sourceHash: number;
  /** Timestamp of identity creation */
  readonly createdAt: number;
}

/** Global identity registry — prevents duplicate wrapping */
const identityRegistry = new Map<string, FunctionIdentity>();

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — FNV-1a HASH (deterministic, zero-dependency)
// ═══════════════════════════════════════════════════════════════════════════════

const FNV_OFFSET = 2166136261;
const FNV_PRIME = 16777619;

/**
 * FNV-1a 32-bit hash — fast, deterministic, zero-dependency.
 * Used for source fingerprinting, NOT cryptographic security.
 */
export function fnv1a(input: string): number {
  let hash = FNV_OFFSET;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * FNV_PRIME) >>> 0;
  }
  return hash;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — IDENTITY RESOLUTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Resolve a stable function name from a function reference.
 * Priority: explicit name > function.name > toString() signature > 'anonymous'
 */
export function resolveFunctionName(
  fn: (...args: unknown[]) => unknown,
  explicitName?: string,
): string {
  if (explicitName && explicitName.length > 0) return explicitName;
  if (fn.name && fn.name.length > 0 && fn.name !== 'anonymous') return fn.name;

  // Extract name from toString() — covers arrow functions assigned to variables
  const src = fn.toString().slice(0, 100);
  const match = src.match(/^(?:function\s+)?(\w+)\s*\(/);
  if (match) return match[1];

  return 'anonymous';
}

/**
 * Create a deterministic identity key.
 * Format: `{PRIMITIVE}::{functionName}`
 */
function makeIdentityKey(primitive: string, functionName: string): string {
  return `${primitive.toUpperCase()}::${functionName}`;
}

/**
 * Resolve or create a function identity.
 * If the same primitive+function combo was already registered, returns
 * the existing identity (idempotent).
 */
export function resolveIdentity(
  primitive: string,
  fn: (...args: unknown[]) => unknown,
  explicitName?: string,
): FunctionIdentity {
  const functionName = resolveFunctionName(fn, explicitName);
  const key = makeIdentityKey(primitive, functionName);

  const existing = identityRegistry.get(key);
  if (existing) return existing;

  const sourceHash = fnv1a(fn.toString());

  const identity: FunctionIdentity = {
    id: key,
    primitive: primitive.toUpperCase(),
    functionName,
    sourceHash,
    createdAt: Date.now(),
  };

  identityRegistry.set(key, identity);
  return identity;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — COLLISION DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if a function identity already exists (already wrapped).
 * Used to prevent double-wrapping.
 */
export function isAlreadyWrapped(primitive: string, functionName: string): boolean {
  return identityRegistry.has(makeIdentityKey(primitive, functionName));
}

/**
 * Check if two function sources are the same (by hash).
 * Used to detect when the same function is wrapped under different names.
 */
export function isSameSource(
  fnA: (...args: unknown[]) => unknown,
  fnB: (...args: unknown[]) => unknown,
): boolean {
  return fnv1a(fnA.toString()) === fnv1a(fnB.toString());
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — REGISTRY QUERIES
// ═══════════════════════════════════════════════════════════════════════════════

/** Get all registered identities */
export function getAllIdentities(): readonly FunctionIdentity[] {
  return Array.from(identityRegistry.values());
}

/** Get identity by key */
export function getIdentity(primitive: string, functionName: string): FunctionIdentity | undefined {
  return identityRegistry.get(makeIdentityKey(primitive, functionName));
}

/** Get all identities for a specific primitive */
export function getIdentitiesForPrimitive(primitive: string): readonly FunctionIdentity[] {
  const upper = primitive.toUpperCase();
  return Array.from(identityRegistry.values()).filter(id => id.primitive === upper);
}

/** Get total wrapped function count */
export function getWrappedFunctionCount(): number {
  return identityRegistry.size;
}

/** Reset registry (testing only) */
export function resetIdentityRegistry(): void {
  identityRegistry.clear();
}
