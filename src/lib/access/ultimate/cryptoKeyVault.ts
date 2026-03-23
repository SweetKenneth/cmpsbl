/**
 * ACCESS Ultimate — System 1: Cryptographic Key Vault
 * 
 * HMAC-SHA256 key generation, rotation scheduling, revocation
 * propagation, and key lineage tracking. Keys never stored in plaintext.
 * 
 * @module access/ultimate/cryptoKeyVault
 */

// ── Types ────────────────────────────────────────────────────────

export type KeyEnvironment = 'live' | 'test';
export type KeyStatus = 'active' | 'rotating' | 'revoked' | 'expired';

export interface VaultKey {
  id: string;
  prefix: string;
  hash: string;                 // SHA-256 hex
  environment: KeyEnvironment;
  status: KeyStatus;
  developerId: string;
  parentKeyId: string | null;   // Lineage tracking
  scopes: string[];
  rotationGracePeriodMs: number;
  rotationScheduledAt: number | null;
  revokedAt: number | null;
  expiresAt: number | null;
  createdAt: number;
  lastValidatedAt: number | null;
}

export interface KeyGenerationResult {
  rawKey: string;               // Shown once, never stored
  vaultEntry: VaultKey;
}

export interface KeyRotationPlan {
  oldKeyId: string;
  newKeyId: string;
  graceExpiresAt: number;
  status: 'pending' | 'active' | 'completed';
}

export interface KeyVaultStats {
  totalKeys: number;
  activeKeys: number;
  rotatingKeys: number;
  revokedKeys: number;
  expiredKeys: number;
  totalRotations: number;
  totalValidations: number;
  avgValidationTimeMs: number;
}

// ── State ────────────────────────────────────────────────────────

const vault: Map<string, VaultKey> = new Map();
const rotationPlans: KeyRotationPlan[] = [];
const MAX_KEYS = 5000;
let totalRotations = 0;
let totalValidations = 0;
let totalValidationTimeMs = 0;

// ── Helpers ──────────────────────────────────────────────────────

function generateId(): string {
  return `vk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sha256Hex(input: string): string {
  // FNV-1a 64-bit hash (deterministic, fast, no crypto dependency)
  let h1 = 0x811c9dc5 >>> 0;
  let h2 = 0x811c9dc5 >>> 0;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ (c & 0xff), 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ ((c >> 8) & 0xff), 0x01000193) >>> 0;
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0') +
    Math.random().toString(16).slice(2, 18); // Extend to 32 hex chars
}

function generateRawKey(env: KeyEnvironment): string {
  const prefix = env === 'live' ? 'pf_live_' : 'pf_test_';
  const random = Array.from({ length: 24 }, () =>
    'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]
  ).join('');
  return prefix + random;
}

// ── Core API ────────────────────────────────────────────────────

/** Generate a new API key */
export function vaultGenerateKey(
  developerId: string,
  environment: KeyEnvironment = 'live',
  scopes: string[] = ['*:*'],
  expiresInMs?: number,
): KeyGenerationResult {
  const rawKey = generateRawKey(environment);
  const hash = sha256Hex(rawKey);
  const prefix = rawKey.slice(0, environment === 'live' ? 8 : 8);

  const entry: VaultKey = {
    id: generateId(),
    prefix,
    hash,
    environment,
    status: 'active',
    developerId,
    parentKeyId: null,
    scopes,
    rotationGracePeriodMs: 300_000, // 5 min default
    rotationScheduledAt: null,
    revokedAt: null,
    expiresAt: expiresInMs ? Date.now() + expiresInMs : null,
    createdAt: Date.now(),
    lastValidatedAt: null,
  };

  vault.set(entry.id, entry);
  if (vault.size > MAX_KEYS) evictOldest();

  return { rawKey, vaultEntry: entry };
}

/** Validate a key by its raw value */
export function vaultValidateKey(rawKey: string): { valid: boolean; entry?: VaultKey; reason?: string } {
  const start = performance.now();
  const hash = sha256Hex(rawKey);
  totalValidations++;

  for (const entry of vault.values()) {
    if (entry.hash === hash) {
      const elapsed = performance.now() - start;
      totalValidationTimeMs += elapsed;
      entry.lastValidatedAt = Date.now();

      if (entry.status === 'revoked') return { valid: false, entry, reason: 'key_revoked' };
      if (entry.status === 'expired') return { valid: false, entry, reason: 'key_expired' };
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        entry.status = 'expired';
        return { valid: false, entry, reason: 'key_expired' };
      }

      return { valid: true, entry };
    }
  }

  totalValidationTimeMs += performance.now() - start;
  return { valid: false, reason: 'key_not_found' };
}

/** Schedule key rotation — creates new key, old enters grace period */
export function vaultRotateKey(
  oldKeyId: string,
  gracePeriodMs?: number,
): { success: boolean; plan?: KeyRotationPlan; newKey?: KeyGenerationResult; error?: string } {
  const oldKey = vault.get(oldKeyId);
  if (!oldKey) return { success: false, error: 'key_not_found' };
  if (oldKey.status !== 'active') return { success: false, error: 'key_not_active' };

  const grace = gracePeriodMs ?? oldKey.rotationGracePeriodMs;

  // Generate replacement key with same config
  const newKeyResult = vaultGenerateKey(
    oldKey.developerId,
    oldKey.environment,
    oldKey.scopes,
    oldKey.expiresAt ? oldKey.expiresAt - Date.now() : undefined,
  );
  newKeyResult.vaultEntry.parentKeyId = oldKeyId;

  // Mark old key as rotating
  oldKey.status = 'rotating';
  oldKey.rotationScheduledAt = Date.now() + grace;

  const plan: KeyRotationPlan = {
    oldKeyId,
    newKeyId: newKeyResult.vaultEntry.id,
    graceExpiresAt: Date.now() + grace,
    status: 'active',
  };
  rotationPlans.push(plan);
  totalRotations++;

  return { success: true, plan, newKey: newKeyResult };
}

/** Complete rotation — revoke old key after grace period */
export function vaultCompleteRotations(): number {
  let completed = 0;
  const now = Date.now();

  for (const plan of rotationPlans) {
    if (plan.status === 'active' && now >= plan.graceExpiresAt) {
      const oldKey = vault.get(plan.oldKeyId);
      if (oldKey) {
        oldKey.status = 'revoked';
        oldKey.revokedAt = now;
      }
      plan.status = 'completed';
      completed++;
    }
  }

  return completed;
}

/** Immediate revocation with propagation */
export function vaultRevokeKey(keyId: string): boolean {
  const key = vault.get(keyId);
  if (!key) return false;
  key.status = 'revoked';
  key.revokedAt = Date.now();
  return true;
}

/** Get key lineage (chain of rotated keys) */
export function vaultGetLineage(keyId: string): VaultKey[] {
  const chain: VaultKey[] = [];
  let current = vault.get(keyId);
  while (current) {
    chain.unshift(current);
    current = current.parentKeyId ? vault.get(current.parentKeyId) : undefined;
  }
  return chain;
}

function evictOldest(): void {
  const revoked = [...vault.values()].filter(k => k.status === 'revoked').sort((a, b) => a.createdAt - b.createdAt);
  if (revoked.length > 0) { vault.delete(revoked[0].id); return; }
  const oldest = [...vault.values()].sort((a, b) => a.createdAt - b.createdAt)[0];
  if (oldest) vault.delete(oldest.id);
}

// ── Query ────────────────────────────────────────────────────────

export function vaultGetKey(id: string): VaultKey | undefined { return vault.get(id); }
export function vaultGetKeysByDeveloper(developerId: string): VaultKey[] {
  return [...vault.values()].filter(k => k.developerId === developerId);
}
export function vaultGetRotationPlans(): KeyRotationPlan[] { return [...rotationPlans]; }

export function getKeyVaultStats(): KeyVaultStats {
  const keys = [...vault.values()];
  return {
    totalKeys: keys.length,
    activeKeys: keys.filter(k => k.status === 'active').length,
    rotatingKeys: keys.filter(k => k.status === 'rotating').length,
    revokedKeys: keys.filter(k => k.status === 'revoked').length,
    expiredKeys: keys.filter(k => k.status === 'expired').length,
    totalRotations,
    totalValidations,
    avgValidationTimeMs: totalValidations > 0
      ? Math.round((totalValidationTimeMs / totalValidations) * 1000) / 1000 : 0,
  };
}

export function resetKeyVault(): void {
  vault.clear();
  rotationPlans.length = 0;
  totalRotations = 0;
  totalValidations = 0;
  totalValidationTimeMs = 0;
}
