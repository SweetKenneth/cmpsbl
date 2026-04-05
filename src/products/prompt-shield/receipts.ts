/**
 * PROMPT-SHIELD — Audit Receipt Chain
 * Primitive: AUDIT (provenance), BEACON (health signal)
 *
 * Merkle-chained receipts for every shield run.
 * Each receipt links to the previous, creating a tamper-evident log.
 */

import type {
  ShieldReceipt,
  ConversationContext,
  DetectedThreat,
  GovernanceDecision,
  AnalysisVerdict,
  GroundingReport,
} from './types';

// ── Hash Utility ───────────────────────────────────────────────────────

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function hashContent(content: string): string {
  return `ps_${fnv1a(content)}`;
}

// ── Receipt State ──────────────────────────────────────────────────────

let prevHash = 'ps_genesis_00000000';
let receiptCount = 0;

/**
 * Mint a new receipt for a shield run.
 */
export function mintReceipt(
  ctx: ConversationContext,
  threats: readonly DetectedThreat[],
  groundingReport: GroundingReport | null,
  decisions: readonly GovernanceDecision[],
  processingMs: number,
): ShieldReceipt {
  const inputHash = hashContent(ctx.messages.map(m => m.content).join('|'));
  const outputHash = hashContent(JSON.stringify({ threats: threats.length, decisions: decisions.length }));

  const verdict = deriveVerdict(threats, decisions, groundingReport);

  const payload = `${receiptCount}:${inputHash}:${outputHash}:${prevHash}:${threats.length}:${verdict}`;
  const receiptHash = hashContent(payload);

  const receipt: ShieldReceipt = {
    receiptId: `psr-${String(receiptCount).padStart(6, '0')}`,
    sessionId: ctx.sessionId,
    timestamp: new Date().toISOString(),
    inputHash,
    outputHash,
    threatsDetected: threats.length,
    threatsBlocked: decisions.filter(d => d.action === 'block').length,
    hallucinationsFound: groundingReport?.hallucinatedClaims ?? 0,
    governanceDecisions: decisions.length,
    verdict,
    processingMs,
    prevReceiptHash: prevHash,
    receiptHash,
  };

  prevHash = receiptHash;
  receiptCount++;

  return receipt;
}

function deriveVerdict(
  threats: readonly DetectedThreat[],
  decisions: readonly GovernanceDecision[],
  groundingReport: GroundingReport | null,
): AnalysisVerdict {
  if (threats.length === 0 && (!groundingReport || groundingReport.hallucinatedClaims === 0)) {
    return 'clean';
  }

  const hasCritical = threats.some(t => t.severity === 'critical');
  const hasBlocks = decisions.some(d => d.action === 'block');

  if (hasCritical || hasBlocks) return 'malicious';

  if (groundingReport && groundingReport.hallucinatedClaims > 0) return 'hallucinated';

  const hasHighConfidence = threats.some(t => t.confidence > 0.8);
  if (hasHighConfidence) return 'suspicious';

  return 'uncertain';
}

/** Reset receipt chain (for testing) */
export function resetReceiptChain(): void {
  prevHash = 'ps_genesis_00000000';
  receiptCount = 0;
}
