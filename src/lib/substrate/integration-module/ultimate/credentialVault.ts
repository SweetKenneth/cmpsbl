/**
 * Credential Vault & Rotation Engine
 * 
 * Centralized management of all external credentials with automatic rotation,
 * leak detection, and health scoring.
 * 
 * @module integration/ultimate/credentialVault
 * @version 9.0.0 — Babel Gate
 */

// ── Types ──────────────────────────────────────────────────────

export interface StoredCredential {
  id: string;
  integrationId: string;
  credentialType: 'api_key' | 'oauth_token' | 'basic_auth' | 'certificate' | 'hmac_secret';
  /** Masked value — never store plaintext in memory longer than needed */
  maskedValue: string;
  createdAt: number;
  rotatedAt: number;
  expiresAt: number | null;
  rotationIntervalDays: number;
  scopeMinimal: boolean;
  healthScore: number;
}

export interface RotationEvent {
  credentialId: string;
  integrationId: string;
  rotatedAt: number;
  reason: 'scheduled' | 'leak_detected' | 'emergency' | 'manual';
  success: boolean;
}

export interface LeakCanaryAlert {
  credentialId: string;
  detectedIn: 'log' | 'response' | 'error_message' | 'telemetry';
  detectedAt: number;
  snippet: string;
}

// ── State ──────────────────────────────────────────────────────

const vault = new Map<string, StoredCredential>();
const rotationHistory: RotationEvent[] = [];
const leakAlerts: LeakCanaryAlert[] = [];

// ── Core ───────────────────────────────────────────────────────

/** Store a credential (value is immediately masked) */
export function storeCredential(
  id: string,
  integrationId: string,
  credentialType: StoredCredential['credentialType'],
  rawValue: string,
  options?: { rotationIntervalDays?: number; expiresAt?: number },
): StoredCredential {
  const masked = rawValue.slice(0, 4) + '****' + rawValue.slice(-4);
  const cred: StoredCredential = {
    id,
    integrationId,
    credentialType,
    maskedValue: masked,
    createdAt: Date.now(),
    rotatedAt: Date.now(),
    expiresAt: options?.expiresAt ?? null,
    rotationIntervalDays: options?.rotationIntervalDays ?? 90,
    scopeMinimal: true,
    healthScore: 1.0,
  };
  vault.set(id, cred);
  return cred;
}

/** Check all credentials for rotation needs */
export function checkRotationNeeds(): StoredCredential[] {
  const now = Date.now();
  const needsRotation: StoredCredential[] = [];
  for (const cred of vault.values()) {
    const msSinceRotation = now - cred.rotatedAt;
    const rotationMs = cred.rotationIntervalDays * 86_400_000;
    if (msSinceRotation >= rotationMs * 0.9) {
      needsRotation.push(cred);
    }
    // Update health based on expiry proximity
    if (cred.expiresAt) {
      const timeToExpiry = cred.expiresAt - now;
      cred.healthScore = Math.max(0, Math.min(1, timeToExpiry / rotationMs));
    }
  }
  return needsRotation;
}

/** Record a rotation event */
export function recordRotation(credentialId: string, reason: RotationEvent['reason'], success: boolean): void {
  const cred = vault.get(credentialId);
  if (cred && success) {
    cred.rotatedAt = Date.now();
    cred.healthScore = 1.0;
  }
  rotationHistory.push({ credentialId, integrationId: cred?.integrationId ?? 'unknown', rotatedAt: Date.now(), reason, success });
}

/** Scan a string for potential credential leaks */
export function scanForLeaks(credentialId: string, content: string, source: LeakCanaryAlert['detectedIn']): LeakCanaryAlert | null {
  const cred = vault.get(credentialId);
  if (!cred) return null;
  // Check if the unmasked prefix+suffix appear together in content
  const prefix = cred.maskedValue.slice(0, 4);
  const suffix = cred.maskedValue.slice(-4);
  if (prefix.length >= 4 && suffix.length >= 4 && content.includes(prefix) && content.includes(suffix)) {
    const alert: LeakCanaryAlert = {
      credentialId,
      detectedIn: source,
      detectedAt: Date.now(),
      snippet: content.slice(0, 100),
    };
    leakAlerts.push(alert);
    cred.healthScore = 0;
    return alert;
  }
  return null;
}

/** Emergency revoke */
export function emergencyRevoke(credentialId: string): boolean {
  const cred = vault.get(credentialId);
  if (!cred) return false;
  cred.healthScore = 0;
  cred.expiresAt = Date.now();
  recordRotation(credentialId, 'emergency', true);
  return true;
}

/** Get credential health scores */
export function getCredentialHealth(): Array<{ id: string; integrationId: string; healthScore: number; daysSinceRotation: number }> {
  const now = Date.now();
  return Array.from(vault.values()).map(c => ({
    id: c.id,
    integrationId: c.integrationId,
    healthScore: Math.round(c.healthScore * 100) / 100,
    daysSinceRotation: Math.round((now - c.rotatedAt) / 86_400_000),
  }));
}

export function getLeakAlerts(): LeakCanaryAlert[] { return [...leakAlerts]; }
export function getRotationHistory(): RotationEvent[] { return [...rotationHistory]; }

export function getVaultHealth() {
  return {
    totalCredentials: vault.size,
    avgHealthScore: vault.size > 0 ? Array.from(vault.values()).reduce((s, c) => s + c.healthScore, 0) / vault.size : 1,
    leakAlertCount: leakAlerts.length,
    rotationsPending: checkRotationNeeds().length,
  };
}

export function resetVault(): void {
  vault.clear();
  rotationHistory.length = 0;
  leakAlerts.length = 0;
}
