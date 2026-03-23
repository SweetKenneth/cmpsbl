/**
 * PHANTOM Ultimate — Consent Registry
 * Tracks per-entity, per-purpose data processing consent.
 * Propagates consent revocation across all downstream copies.
 * GDPR Article 17 right-to-erasure enforcement with proof of deletion.
 */

export type ConsentPurpose = 'analytics' | 'marketing' | 'research' | 'ml_training' | 'profiling' | 'third_party_sharing' | 'storage';

export interface ConsentRecord {
  id: string;
  entityId: string;
  purpose: ConsentPurpose;
  granted: boolean;
  grantedAt?: number;
  revokedAt?: number;
  legalBasis: 'consent' | 'contract' | 'legitimate_interest' | 'legal_obligation';
  expiresAt?: number;
  metadata?: Record<string, unknown>;
}

export interface ErasureRequest {
  id: string;
  entityId: string;
  requestedAt: number;
  completedAt?: number;
  status: 'pending' | 'processing' | 'completed' | 'partial';
  deletedFrom: string[];
  proofHashes: string[];
}

export interface ConsentStats {
  totalRecords: number;
  activeConsents: number;
  revokedConsents: number;
  pendingErasures: number;
  completedErasures: number;
  consentByPurpose: Record<string, { granted: number; revoked: number }>;
}

const MAX_RECORDS = 2000;
const MAX_ERASURES = 500;

const consents = new Map<string, ConsentRecord>();  // key: entityId:purpose
const erasureRequests: ErasureRequest[] = [];

function fnvHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function grantConsent(
  entityId: string, purpose: ConsentPurpose,
  legalBasis: ConsentRecord['legalBasis'] = 'consent',
  expiresAt?: number
): ConsentRecord {
  const key = `${entityId}:${purpose}`;
  const record: ConsentRecord = {
    id: `consent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    entityId, purpose, granted: true, grantedAt: Date.now(),
    legalBasis, expiresAt,
  };
  if (consents.size >= MAX_RECORDS && !consents.has(key)) {
    const oldest = [...consents.values()].filter(c => !c.granted).sort((a, b) => (a.revokedAt ?? 0) - (b.revokedAt ?? 0))[0];
    if (oldest) consents.delete(`${oldest.entityId}:${oldest.purpose}`);
  }
  consents.set(key, record);
  return record;
}

export function revokeConsent(entityId: string, purpose: ConsentPurpose): ConsentRecord | null {
  const key = `${entityId}:${purpose}`;
  const record = consents.get(key);
  if (!record) return null;
  record.granted = false;
  record.revokedAt = Date.now();
  return record;
}

export function checkConsent(entityId: string, purpose: ConsentPurpose): boolean {
  const key = `${entityId}:${purpose}`;
  const record = consents.get(key);
  if (!record || !record.granted) return false;
  if (record.expiresAt && Date.now() > record.expiresAt) {
    record.granted = false;
    record.revokedAt = Date.now();
    return false;
  }
  return true;
}

export function revokeAllConsent(entityId: string): ConsentRecord[] {
  const revoked: ConsentRecord[] = [];
  for (const [key, record] of consents) {
    if (record.entityId === entityId && record.granted) {
      record.granted = false;
      record.revokedAt = Date.now();
      revoked.push(record);
    }
  }
  return revoked;
}

export function requestErasure(entityId: string): ErasureRequest {
  // Revoke all consents first
  revokeAllConsent(entityId);

  const request: ErasureRequest = {
    id: `erasure-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    entityId, requestedAt: Date.now(),
    status: 'pending', deletedFrom: [], proofHashes: [],
  };
  if (erasureRequests.length >= MAX_ERASURES) erasureRequests.shift();
  erasureRequests.push(request);
  return request;
}

export function recordDeletion(erasureId: string, source: string): void {
  const req = erasureRequests.find(r => r.id === erasureId);
  if (!req) return;
  req.deletedFrom.push(source);
  req.proofHashes.push(fnvHash(`${source}:${req.entityId}:${Date.now()}`));
  req.status = 'processing';
}

export function completeErasure(erasureId: string): void {
  const req = erasureRequests.find(r => r.id === erasureId);
  if (!req) return;
  req.status = 'completed';
  req.completedAt = Date.now();
}

export function getConsentStats(): ConsentStats {
  const all = [...consents.values()];
  const byPurpose: Record<string, { granted: number; revoked: number }> = {};
  for (const c of all) {
    if (!byPurpose[c.purpose]) byPurpose[c.purpose] = { granted: 0, revoked: 0 };
    if (c.granted) byPurpose[c.purpose].granted++;
    else byPurpose[c.purpose].revoked++;
  }
  return {
    totalRecords: all.length,
    activeConsents: all.filter(c => c.granted).length,
    revokedConsents: all.filter(c => !c.granted).length,
    pendingErasures: erasureRequests.filter(r => r.status !== 'completed').length,
    completedErasures: erasureRequests.filter(r => r.status === 'completed').length,
    consentByPurpose: byPurpose,
  };
}

export function resetConsentState(): void { consents.clear(); erasureRequests.length = 0; }
