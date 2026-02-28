/**
 * Fix Verification Loop (#30)
 * Closed-loop verification: after a fix is applied, re-scans the affected
 * area to confirm the finding is resolved. Blocks promotion if not.
 */

import type { ScanFixProposal } from './evolution-proposal-chain';
import type { RegressionGateResult } from './vision-regression-loop';

export type VerificationVerdict = 'fixed' | 'partial' | 'unchanged' | 'worsened' | 'error';

export interface FixVerification {
  fixId: string;
  findingId: string;
  category: string;
  preScanFingerprint: string;
  postScanFingerprint: string | null;
  verdict: VerificationVerdict;
  preSeverity: string;
  postSeverity: string | null;
  confidenceScore: number; // 0-1
  verifiedAt: string;
  verificationDurationMs: number;
  details: string;
}

export interface VerificationBatchResult {
  verifications: FixVerification[];
  fixedCount: number;
  partialCount: number;
  unchangedCount: number;
  worsenedCount: number;
  errorCount: number;
  overallSuccessRate: number;
  summary: string;
}

/**
 * Verify a single fix by comparing pre/post scan findings
 */
export function verifyFix(
  fix: ScanFixProposal,
  preScanFindings: Array<{ id: string; fingerprint: string; severity: string; category: string }>,
  postScanFindings: Array<{ id: string; fingerprint: string; severity: string; category: string }>,
): FixVerification {
  const startTime = Date.now();

  // Find the original finding in pre-scan
  const preFinding = preScanFindings.find(
    f => f.id === fix.findingId || f.fingerprint === `${fix.category}:${fix.title.toLowerCase().replace(/\s+/g, '_')}`
  );

  if (!preFinding) {
    return {
      fixId: fix.id,
      findingId: fix.findingId,
      category: fix.category,
      preScanFingerprint: fix.findingId,
      postScanFingerprint: null,
      verdict: 'error',
      preSeverity: 'unknown',
      postSeverity: null,
      confidenceScore: 0,
      verifiedAt: new Date().toISOString(),
      verificationDurationMs: Date.now() - startTime,
      details: 'Original finding not found in pre-scan results',
    };
  }

  // Check if the finding still exists in post-scan
  const postFinding = postScanFindings.find(f => f.fingerprint === preFinding.fingerprint);

  let verdict: VerificationVerdict;
  let confidenceScore: number;
  let details: string;

  if (!postFinding) {
    verdict = 'fixed';
    confidenceScore = 0.95;
    details = `Finding "${fix.title}" no longer appears in post-fix scan. Fix confirmed.`;
  } else {
    const sevRank: Record<string, number> = { info: 0, warn: 1, error: 2, fatal: 3 };
    const preSev = sevRank[preFinding.severity] ?? 0;
    const postSev = sevRank[postFinding.severity] ?? 0;

    if (postSev < preSev) {
      verdict = 'partial';
      confidenceScore = 0.6;
      details = `Finding severity reduced from ${preFinding.severity} to ${postFinding.severity}. Partial improvement.`;
    } else if (postSev > preSev) {
      verdict = 'worsened';
      confidenceScore = 0.9;
      details = `Finding severity INCREASED from ${preFinding.severity} to ${postFinding.severity}. Fix may have introduced regression.`;
    } else {
      verdict = 'unchanged';
      confidenceScore = 0.85;
      details = `Finding still present at same severity (${preFinding.severity}). Fix did not resolve the issue.`;
    }
  }

  return {
    fixId: fix.id,
    findingId: fix.findingId,
    category: fix.category,
    preScanFingerprint: preFinding.fingerprint,
    postScanFingerprint: postFinding?.fingerprint ?? null,
    verdict,
    preSeverity: preFinding.severity,
    postSeverity: postFinding?.severity ?? null,
    confidenceScore,
    verifiedAt: new Date().toISOString(),
    verificationDurationMs: Date.now() - startTime,
    details,
  };
}

/**
 * Batch verify multiple fixes
 */
export function batchVerifyFixes(
  fixes: ScanFixProposal[],
  preScanFindings: Array<{ id: string; fingerprint: string; severity: string; category: string }>,
  postScanFindings: Array<{ id: string; fingerprint: string; severity: string; category: string }>,
): VerificationBatchResult {
  const verifications = fixes.map(fix => verifyFix(fix, preScanFindings, postScanFindings));

  const fixedCount = verifications.filter(v => v.verdict === 'fixed').length;
  const partialCount = verifications.filter(v => v.verdict === 'partial').length;
  const unchangedCount = verifications.filter(v => v.verdict === 'unchanged').length;
  const worsenedCount = verifications.filter(v => v.verdict === 'worsened').length;
  const errorCount = verifications.filter(v => v.verdict === 'error').length;
  const total = verifications.length;

  const overallSuccessRate = total > 0 ? (fixedCount + partialCount * 0.5) / total : 0;

  let summary: string;
  if (worsenedCount > 0) {
    summary = `⚠️ ${worsenedCount}/${total} fixes caused regressions. Review immediately.`;
  } else if (unchangedCount > total / 2) {
    summary = `⚠️ ${unchangedCount}/${total} fixes had no effect. Investigate fix quality.`;
  } else if (fixedCount === total) {
    summary = `✅ All ${total} fixes verified successfully.`;
  } else {
    summary = `${fixedCount}/${total} fully fixed, ${partialCount} partial, ${unchangedCount} unchanged.`;
  }

  return {
    verifications,
    fixedCount,
    partialCount,
    unchangedCount,
    worsenedCount,
    errorCount,
    overallSuccessRate,
    summary,
  };
}

/**
 * Determine if a fix should be promoted based on verification + regression gate
 */
export function shouldPromoteFix(
  verification: FixVerification,
  regressionGate: RegressionGateResult | null,
): { promote: boolean; reason: string } {
  if (verification.verdict === 'worsened') {
    return { promote: false, reason: 'Fix worsened the finding severity' };
  }

  if (verification.verdict === 'unchanged') {
    return { promote: false, reason: 'Fix had no effect on the finding' };
  }

  if (verification.verdict === 'error') {
    return { promote: false, reason: 'Verification encountered an error' };
  }

  if (regressionGate && !regressionGate.passed) {
    return { promote: false, reason: `Regression gate failed: ${regressionGate.recommendation}` };
  }

  if (verification.verdict === 'fixed') {
    return { promote: true, reason: 'Fix verified and regression gate passed' };
  }

  if (verification.verdict === 'partial' && verification.confidenceScore >= 0.5) {
    return { promote: true, reason: 'Partial fix accepted with acceptable confidence' };
  }

  return { promote: false, reason: 'Insufficient confidence for promotion' };
}
