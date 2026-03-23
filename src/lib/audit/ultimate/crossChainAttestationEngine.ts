/**
 * AUDIT — Cross-Chain Attestation Engine
 * Generates cryptographic attestation reports summarizing chain state
 * at a point in time, suitable for external verification.
 * @module audit/crossChainAttestationEngine
 * @version 9.0.0 — Sentinel
 */

import type { AuditReceipt } from '../receipts';
import { hashReceipt } from '../receipts';

// ── Types ──────────────────────────────────────────────────────────────────

export interface Attestation {
  id: string;
  chainHead: string;
  chainLength: number;
  windowStart: string;
  windowEnd: string;
  receiptCount: number;
  merkleRoot: string;
  actorSummary: Record<string, number>;
  typeSummary: Record<string, number>;
  generatedAt: string;
  signature: string;   // SHA-256 of the attestation content
}

// ── Core ───────────────────────────────────────────────────────────────────

async function hashContent(content: string): Promise<string> {
  const data = new TextEncoder().encode(content);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function computeMerkleRoot(receipts: AuditReceipt[]): Promise<string> {
  if (receipts.length === 0) return 'empty';

  let hashes: string[] = [];
  for (const r of receipts) {
    hashes.push(await hashReceipt(r));
  }

  while (hashes.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = hashes[i + 1] ?? left; // duplicate if odd
      nextLevel.push(await hashContent(left + right));
    }
    hashes = nextLevel;
  }

  return hashes[0];
}

export async function generateAttestation(
  receipts: AuditReceipt[],
  chainHead: string,
): Promise<Attestation> {
  const sorted = [...receipts].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const actorSummary: Record<string, number> = {};
  const typeSummary: Record<string, number> = {};

  for (const r of sorted) {
    actorSummary[r.actor] = (actorSummary[r.actor] ?? 0) + 1;
    typeSummary[r.type] = (typeSummary[r.type] ?? 0) + 1;
  }

  const merkleRoot = await computeMerkleRoot(sorted);

  const attestationContent = {
    chainHead,
    chainLength: sorted.length,
    windowStart: sorted[0]?.timestamp ?? '',
    windowEnd: sorted[sorted.length - 1]?.timestamp ?? '',
    receiptCount: sorted.length,
    merkleRoot,
    actorSummary,
    typeSummary,
  };

  const signature = await hashContent(JSON.stringify(attestationContent));

  return {
    id: `attest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    ...attestationContent,
    generatedAt: new Date().toISOString(),
    signature,
  };
}

export async function verifyAttestation(
  attestation: Attestation,
  receipts: AuditReceipt[],
): Promise<{ valid: boolean; reason?: string }> {
  // Recompute merkle root
  const sorted = [...receipts].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const recomputedRoot = await computeMerkleRoot(sorted);

  if (recomputedRoot !== attestation.merkleRoot) {
    return { valid: false, reason: `Merkle root mismatch: expected ${attestation.merkleRoot}, got ${recomputedRoot}` };
  }

  if (sorted.length !== attestation.receiptCount) {
    return { valid: false, reason: `Receipt count mismatch: expected ${attestation.receiptCount}, got ${sorted.length}` };
  }

  // Recompute signature
  const content = {
    chainHead: attestation.chainHead,
    chainLength: attestation.chainLength,
    windowStart: attestation.windowStart,
    windowEnd: attestation.windowEnd,
    receiptCount: attestation.receiptCount,
    merkleRoot: attestation.merkleRoot,
    actorSummary: attestation.actorSummary,
    typeSummary: attestation.typeSummary,
  };
  const recomputedSig = await hashContent(JSON.stringify(content));

  if (recomputedSig !== attestation.signature) {
    return { valid: false, reason: 'Signature mismatch — attestation content may have been tampered' };
  }

  return { valid: true };
}
