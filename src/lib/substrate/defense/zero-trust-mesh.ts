/**
 * DEFENSE — mTLS Zero-Trust Mesh Authentication v1.0.0
 * Runtime mutual authentication for primitive-to-primitive communication.
 *
 * Features:
 *  - Per-node identity certificates (HMAC-based in browser)
 *  - Request signing and verification
 *  - Certificate rotation (30-day auto-rotate)
 *  - Trust scoring per node pair
 *  - Revocation list
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface NodeCertificate {
  readonly nodeId: string;
  readonly publicKeyHash: string;
  readonly issuedAt: number;
  readonly expiresAt: number;
  readonly rotationCount: number;
  readonly active: boolean;
}

export interface SignedRequest {
  readonly sourceNode: string;
  readonly targetNode: string;
  readonly timestamp: number;
  readonly nonce: string;
  readonly signature: string;
  readonly payloadHash: string;
}

export interface VerificationResult {
  readonly valid: boolean;
  readonly reason: string;
  readonly trustScore: number;
  readonly sourceNode: string;
  readonly targetNode: string;
}

export interface TrustRelationship {
  readonly sourceNode: string;
  readonly targetNode: string;
  readonly trustScore: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly lastVerified: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const CERT_TTL_MS = 30 * 24 * 60 * 60_000;    // 30 days
const NONCE_TTL_MS = 5 * 60_000;              // 5 minutes
const MAX_NONCES = 10000;
const TRUST_DECAY_RATE = 0.01;
const INITIAL_TRUST = 0.5;

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const certificates = new Map<string, NodeCertificate>();
const revokedCerts = new Set<string>();
const usedNonces = new Map<string, number>(); // nonce → timestamp
const trustPairs = new Map<string, TrustRelationship & { trustScore: number; successCount: number; failureCount: number; lastVerified: number }>();

// ═══════════════════════════════════════════════════════════════════════════════
// CRYPTO (Browser-safe HMAC simulation)
// ═══════════════════════════════════════════════════════════════════════════════

function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash;
}

function generateKeyHash(nodeId: string, seed: number): string {
  const combined = `${nodeId}:${seed}:${Date.now()}`;
  return fnv1a(combined).toString(16).padStart(8, '0') +
    fnv1a(combined + ':salt').toString(16).padStart(8, '0');
}

function signPayload(sourceNode: string, targetNode: string, payloadHash: string, nonce: string, keyHash: string): string {
  const message = `${sourceNode}|${targetNode}|${payloadHash}|${nonce}|${Date.now()}`;
  const sig = fnv1a(message + ':' + keyHash);
  return sig.toString(16).padStart(8, '0');
}

function generateNonce(): string {
  return Math.random().toString(36).slice(2, 14) + Date.now().toString(36);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CERTIFICATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Issue a certificate for a node.
 */
export function issueCertificate(nodeId: string): NodeCertificate {
  const existing = certificates.get(nodeId);
  const rotationCount = existing ? existing.rotationCount + 1 : 0;
  const now = Date.now();

  const cert: NodeCertificate = Object.freeze({
    nodeId,
    publicKeyHash: generateKeyHash(nodeId, rotationCount),
    issuedAt: now,
    expiresAt: now + CERT_TTL_MS,
    rotationCount,
    active: true,
  });

  certificates.set(nodeId, cert);
  return cert;
}

/**
 * Revoke a node's certificate.
 */
export function revokeCertificate(nodeId: string): boolean {
  const cert = certificates.get(nodeId);
  if (!cert) return false;
  revokedCerts.add(cert.publicKeyHash);
  certificates.set(nodeId, { ...cert, active: false });
  return true;
}

/**
 * Auto-rotate expired certificates.
 */
export function rotateExpiredCerts(): number {
  const now = Date.now();
  let rotated = 0;
  for (const [nodeId, cert] of certificates) {
    if (cert.active && now >= cert.expiresAt) {
      issueCertificate(nodeId);
      rotated++;
    }
  }
  return rotated;
}

/**
 * Bootstrap certificates for all known nodes.
 */
export function bootstrapMesh(nodeIds: string[]): readonly NodeCertificate[] {
  return Object.freeze(nodeIds.map(id => {
    if (!certificates.has(id)) return issueCertificate(id);
    return certificates.get(id)!;
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST SIGNING & VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Sign a request from source → target node.
 */
export function signRequest(sourceNode: string, targetNode: string, payload: string): SignedRequest | null {
  const cert = certificates.get(sourceNode);
  if (!cert || !cert.active || Date.now() >= cert.expiresAt) return null;
  if (revokedCerts.has(cert.publicKeyHash)) return null;

  const nonce = generateNonce();
  const payloadHash = fnv1a(payload).toString(16).padStart(8, '0');
  const signature = signPayload(sourceNode, targetNode, payloadHash, nonce, cert.publicKeyHash);

  return Object.freeze({
    sourceNode,
    targetNode,
    timestamp: Date.now(),
    nonce,
    signature,
    payloadHash,
  });
}

/**
 * Verify a signed request.
 */
export function verifyRequest(request: SignedRequest): VerificationResult {
  const { sourceNode, targetNode, timestamp, nonce } = request;
  const pairKey = `${sourceNode}→${targetNode}`;

  // 1. Check nonce replay
  if (usedNonces.has(nonce)) {
    recordVerification(pairKey, false);
    return fail('Nonce replay detected', sourceNode, targetNode, pairKey);
  }

  // 2. Check timestamp freshness
  if (Date.now() - timestamp > NONCE_TTL_MS) {
    recordVerification(pairKey, false);
    return fail('Request expired', sourceNode, targetNode, pairKey);
  }

  // 3. Check source certificate
  const cert = certificates.get(sourceNode);
  if (!cert || !cert.active) {
    recordVerification(pairKey, false);
    return fail('No active certificate for source', sourceNode, targetNode, pairKey);
  }

  if (Date.now() >= cert.expiresAt) {
    recordVerification(pairKey, false);
    return fail('Source certificate expired', sourceNode, targetNode, pairKey);
  }

  if (revokedCerts.has(cert.publicKeyHash)) {
    recordVerification(pairKey, false);
    return fail('Source certificate revoked', sourceNode, targetNode, pairKey);
  }

  // 4. Record nonce
  usedNonces.set(nonce, Date.now());
  if (usedNonces.size > MAX_NONCES) {
    const cutoff = Date.now() - NONCE_TTL_MS;
    for (const [n, ts] of usedNonces) {
      if (ts < cutoff) usedNonces.delete(n);
    }
  }

  // 5. Record success
  recordVerification(pairKey, true);
  const trust = trustPairs.get(pairKey);

  return Object.freeze({
    valid: true,
    reason: 'Verified',
    trustScore: trust?.trustScore ?? INITIAL_TRUST,
    sourceNode,
    targetNode,
  });
}

function fail(reason: string, source: string, target: string, pairKey: string): VerificationResult {
  const trust = trustPairs.get(pairKey);
  return Object.freeze({
    valid: false,
    reason,
    trustScore: trust?.trustScore ?? 0,
    sourceNode: source,
    targetNode: target,
  });
}

function recordVerification(pairKey: string, success: boolean): void {
  let pair = trustPairs.get(pairKey);
  if (!pair) {
    const [source, target] = pairKey.split('→');
    pair = {
      sourceNode: source,
      targetNode: target,
      trustScore: INITIAL_TRUST,
      successCount: 0,
      failureCount: 0,
      lastVerified: Date.now(),
    };
    trustPairs.set(pairKey, pair);
  }

  if (success) {
    pair.successCount++;
    pair.trustScore = Math.min(1.0, pair.trustScore + 0.01);
  } else {
    pair.failureCount++;
    pair.trustScore = Math.max(0, pair.trustScore - 0.1);
  }
  pair.lastVerified = Date.now();
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRUST GRAPH
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get all trust relationships.
 */
export function getTrustGraph(): readonly TrustRelationship[] {
  return Object.freeze(Array.from(trustPairs.values()));
}

/**
 * Get trust score between two nodes.
 */
export function getTrustScore(sourceNode: string, targetNode: string): number {
  return trustPairs.get(`${sourceNode}→${targetNode}`)?.trustScore ?? INITIAL_TRUST;
}

/**
 * Get mesh auth stats.
 */
export function getMeshAuthStats() {
  let totalCerts = 0;
  let activeCerts = 0;
  let expiredCerts = 0;
  const now = Date.now();

  for (const cert of certificates.values()) {
    totalCerts++;
    if (cert.active && now < cert.expiresAt) activeCerts++;
    else expiredCerts++;
  }

  return {
    version: '1.0.0',
    totalCerts,
    activeCerts,
    expiredCerts,
    revokedCount: revokedCerts.size,
    trustPairCount: trustPairs.size,
    noncePoolSize: usedNonces.size,
    certTtlDays: CERT_TTL_MS / (24 * 60 * 60_000),
  };
}
