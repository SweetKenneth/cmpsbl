/**
 * SOVEREIGN Ultimate — Consent Lifecycle Manager
 * Full state machine for consent with purpose-binding, decay, withdrawal cascade, and receipts.
 * v9.0.0 "Crown Prime"
 */

// ─── Types ────────────────────────────────────────────────────────

export type ConsentState = 'requested' | 'granted' | 'active' | 'renewed' | 'withdrawn' | 'expired' | 'purged';

export interface ConsentEntry {
  id: string;
  subjectId: string;
  purpose: string;
  jurisdiction: string;
  framework: string;
  state: ConsentState;
  grantedAt: string | null;
  expiresAt: string | null;
  withdrawnAt: string | null;
  renewedAt: string | null;
  receiptHash: string;         // FNV-1a hash chain
  stateHistory: { state: ConsentState; timestamp: string; reason?: string }[];
  createdAt: string;
}

export interface ConsentReceipt {
  consentId: string;
  subjectId: string;
  purpose: string;
  state: ConsentState;
  hash: string;
  previousHash: string;
  issuedAt: string;
}

// ─── Storage ──────────────────────────────────────────────────────

const consentStore = new Map<string, ConsentEntry>();
const receiptChain: ConsentReceipt[] = [];
let lastReceiptHash = 'genesis_consent_0000';
const MAX_CONSENTS = 5000;
const MAX_RECEIPTS = 10000;

// ─── FNV-1a Hashing ──────────────────────────────────────────────

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

// ─── Valid Transitions ────────────────────────────────────────────

const VALID_TRANSITIONS: Record<ConsentState, ConsentState[]> = {
  requested: ['granted', 'expired'],
  granted: ['active', 'withdrawn', 'expired'],
  active: ['renewed', 'withdrawn', 'expired'],
  renewed: ['active', 'withdrawn', 'expired'],
  withdrawn: ['purged'],
  expired: ['renewed', 'purged'],
  purged: [],
};

// ─── Core Operations ─────────────────────────────────────────────

export function requestConsent(
  subjectId: string,
  purpose: string,
  jurisdiction: string,
  framework: string,
  expiresInDays?: number
): ConsentEntry {
  const now = new Date();
  const expiresAt = expiresInDays
    ? new Date(now.getTime() + expiresInDays * 86400000).toISOString()
    : null;

  const entry: ConsentEntry = {
    id: `consent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    subjectId,
    purpose,
    jurisdiction,
    framework,
    state: 'requested',
    grantedAt: null,
    expiresAt,
    withdrawnAt: null,
    renewedAt: null,
    receiptHash: '',
    stateHistory: [{ state: 'requested', timestamp: now.toISOString() }],
    createdAt: now.toISOString(),
  };

  entry.receiptHash = issueReceipt(entry).hash;
  consentStore.set(entry.id, entry);
  enforceCapacity();
  return entry;
}

export function transitionConsent(
  consentId: string,
  newState: ConsentState,
  reason?: string
): ConsentEntry | null {
  const entry = consentStore.get(consentId);
  if (!entry) return null;

  if (!VALID_TRANSITIONS[entry.state]?.includes(newState)) return null;

  entry.state = newState;
  const now = new Date().toISOString();
  entry.stateHistory.push({ state: newState, timestamp: now, reason });

  if (newState === 'granted' || newState === 'active') entry.grantedAt = now;
  if (newState === 'renewed') entry.renewedAt = now;
  if (newState === 'withdrawn') entry.withdrawnAt = now;

  entry.receiptHash = issueReceipt(entry).hash;
  return entry;
}

/**
 * Withdraw consent and cascade to all downstream entries for the same subject+purpose.
 */
export function withdrawConsentCascade(subjectId: string, purpose: string): ConsentEntry[] {
  const affected: ConsentEntry[] = [];
  for (const entry of consentStore.values()) {
    if (entry.subjectId === subjectId && entry.purpose === purpose) {
      if (['granted', 'active', 'renewed'].includes(entry.state)) {
        const result = transitionConsent(entry.id, 'withdrawn', 'cascade_withdrawal');
        if (result) affected.push(result);
      }
    }
  }
  return affected;
}

/**
 * Check and expire consents past their expiration date.
 */
export function expireStaleConsents(): ConsentEntry[] {
  const now = Date.now();
  const expired: ConsentEntry[] = [];
  for (const entry of consentStore.values()) {
    if (['granted', 'active', 'renewed'].includes(entry.state) && entry.expiresAt) {
      if (new Date(entry.expiresAt).getTime() <= now) {
        const result = transitionConsent(entry.id, 'expired', 'auto_expiry');
        if (result) expired.push(result);
      }
    }
  }
  return expired;
}

// ─── Receipt Chain ────────────────────────────────────────────────

function issueReceipt(entry: ConsentEntry): ConsentReceipt {
  const payload = `${entry.id}:${entry.subjectId}:${entry.state}:${lastReceiptHash}`;
  const hash = `cr_${fnv1a(payload)}`;

  const receipt: ConsentReceipt = {
    consentId: entry.id,
    subjectId: entry.subjectId,
    purpose: entry.purpose,
    state: entry.state,
    hash,
    previousHash: lastReceiptHash,
    issuedAt: new Date().toISOString(),
  };

  receiptChain.push(receipt);
  lastReceiptHash = hash;
  if (receiptChain.length > MAX_RECEIPTS) receiptChain.splice(0, receiptChain.length - MAX_RECEIPTS);
  return receipt;
}

// ─── Queries ──────────────────────────────────────────────────────

function enforceCapacity(): void {
  if (consentStore.size > MAX_CONSENTS) {
    const entries = Array.from(consentStore.entries())
      .sort((a, b) => new Date(a[1].createdAt).getTime() - new Date(b[1].createdAt).getTime());
    const toRemove = entries.slice(0, consentStore.size - MAX_CONSENTS);
    for (const [id] of toRemove) consentStore.delete(id);
  }
}

export function getConsentEntry(id: string): ConsentEntry | undefined { return consentStore.get(id); }
export function getConsentsBySubject(subjectId: string): ConsentEntry[] {
  return Array.from(consentStore.values()).filter(c => c.subjectId === subjectId);
}
export function getActiveConsents(): ConsentEntry[] {
  return Array.from(consentStore.values()).filter(c => ['granted', 'active', 'renewed'].includes(c.state));
}
export function getConsentReceiptChain(): ConsentReceipt[] { return [...receiptChain]; }
export function getConsentHealth(): number {
  const total = consentStore.size;
  if (total === 0) return 100;
  const active = getActiveConsents().length;
  const withdrawn = Array.from(consentStore.values()).filter(c => c.state === 'withdrawn').length;
  const withdrawalRate = withdrawn / total;
  return Math.max(0, Math.round(100 - withdrawalRate * 50 - (total === active ? 0 : 10)));
}
