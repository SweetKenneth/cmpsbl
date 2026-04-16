/**
 * Ascension V2 ↔ V1 Bridge
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Phase A wiring (gaps 1-6) — exposes the V1 quality, integrity,
 * audit, scoring, and contract engines to the V2 pipeline without
 * forking them. V2 stays thin; V1 stays canonical.
 *
 * Gaps wired here:
 *   1. confidence-banding   → bandDiscovery()
 *   2. quality-gate         → runV2QualityGate()
 *   3. scan-integrity       → fingerprintSourceFiles() + aggregate
 *   4. ingest-audit         → logV2Ingest*() helpers (DB-backed)
 *   5. compatibility-scoring→ scoreCollision()  (4-axis)
 *   6. contract-extractor   → extractFileContracts()
 *
 * © CMPSBL® — All rights reserved.
 */

import {
  classifyBand,
  type ConfidenceBand,
} from '@/lib/ascension/confidence-banding';
import {
  runQualityGate,
  type QualityGateConfig,
  DEFAULT_QUALITY_CONFIG,
} from '@/lib/ascension/quality-gate';
import {
  fingerprintFile,
  aggregateProfile,
  type FileFingerprint,
  type AggregatedProfile,
} from '@/lib/ascension/scan-integrity';
import {
  logUpload,
  logExtraction,
  logQualityGate,
  logChainParticipation,
  logAuditEvent,
} from '@/lib/ascension/ingest-audit';
import {
  computeCompatibility,
  type CompatibilityReport,
} from '@/lib/ascension/compatibility-scoring';
import {
  extractContract,
  profileEnvironment,
  type InterfaceContract,
  type EnvironmentProfile,
} from '@/lib/ascension/contract-extractor';
import type { ExtractedPrimitive, QualityReport } from '@/lib/ascension/types';
import type { StructuralMatch } from '@/lib/ascension/structural-signatures';
import { extractPrimitives } from '@/lib/ascension/primitive-extractor';

// Phase B (gaps 7-11)
import {
  simulateMerge,
  type MergeSimulation,
} from '@/lib/ascension/merge-simulation';
import {
  recordPrimitiveOutcome,
  getPrimitiveLearningStats,
  isPrimitiveReliable,
} from '@/lib/ascension/primitive-learning';
import {
  extractContext,
  recordConfirmedMatch,
  getHighConfidenceSignals,
  getFeedbackStats,
  type FeedbackExtraction,
  type LearnedSignal,
  type FeedbackStats,
} from '@/lib/ascension/feedback-loop';
import {
  detectEcosystem,
  detectDrift,
  type DriftDetection,
} from '@/lib/ascension/semantic-drift';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — CONFIDENCE BANDING (Gap #1)
// ═══════════════════════════════════════════════════════════════════════════════

export type { ConfidenceBand };

export interface BandedDiscovery {
  band: ConfidenceBand;
  hasStructural: boolean;
  hasLexical: boolean;
  hasIntent: boolean;
  channelCount: number;
}

/**
 * Classify a single discovery into a confidence band.
 * V2 uses three observable signals:
 *   - structural: chain depth ≥ 3 (real composition, not just a 2-node pair)
 *   - lexical:    cjpiScore ≥ 50 (meaningful collision strength)
 *   - intent:     description present and > 8 chars (substrate produced reasoning)
 */
export function bandDiscovery(input: {
  cjpiScore: number;
  chainDepth: number;
  description: string;
}): BandedDiscovery {
  const hasStructural = input.chainDepth >= 3;
  const hasLexical = input.cjpiScore >= 50;
  const hasIntent = (input.description?.trim().length ?? 0) > 8;
  const compounding = Math.min(1, input.cjpiScore / 100);

  return {
    band: classifyBand(hasStructural, hasLexical, hasIntent, compounding),
    hasStructural,
    hasLexical,
    hasIntent,
    channelCount: [hasStructural, hasLexical, hasIntent].filter(Boolean).length,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — QUALITY GATE (Gap #2)
// ═══════════════════════════════════════════════════════════════════════════════

export interface V2QualityGateInput {
  files: ReadonlyArray<{ name: string; content: string; language?: string }>;
  config?: Partial<QualityGateConfig>;
}

export interface V2QualityGateResult {
  acceptedNames: string[];
  rejectedNames: string[];
  avgQuality: number;
  totalExtracted: number;
  rawReport: QualityReport;
}

/**
 * Run the V1 quality gate over the user's source files.
 * Returns the names of primitives that survived the gate so the
 * processing step can keep only those when registering Primitive #41.
 */
export function runV2QualityGate(input: V2QualityGateInput): V2QualityGateResult {
  const cfg = { ...DEFAULT_QUALITY_CONFIG, ...(input.config ?? {}) };
  const extractable = input.files
    .filter((f) => typeof f.content === 'string' && f.content.length > 0)
    .map((f) => ({
      name: f.name || 'source',
      content: f.content,
      language: f.language || 'typescript',
    }));

  if (extractable.length === 0) {
    return {
      acceptedNames: [],
      rejectedNames: [],
      avgQuality: 0,
      totalExtracted: 0,
      rawReport: {
        accepted: [],
        rejected: [],
        summary: {
          totalExtracted: 0,
          totalAccepted: 0,
          totalRejected: 0,
          avgQualityScore: 0,
          avgConfidence: 0,
          topCategories: [],
          extractionTrustBreakdown: {},
        },
      },
    };
  }

  const { primitives } = extractPrimitives(extractable);
  const report = runQualityGate(primitives as ExtractedPrimitive[], cfg);

  return {
    acceptedNames: report.accepted.map((p) => (p.canonicalName || p.name)),
    rejectedNames: report.rejected.map((r) => (r.primitive.canonicalName || r.primitive.name)),
    avgQuality: report.summary.avgQualityScore,
    totalExtracted: report.summary.totalExtracted,
    rawReport: report,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — SCAN INTEGRITY (Gap #3)
// ═══════════════════════════════════════════════════════════════════════════════

export type { FileFingerprint, AggregatedProfile };

export interface SourceIntegrityReport {
  fingerprints: FileFingerprint[];
  duplicateCount: number;
  totalBytes: number;
  totalLines: number;
  uniqueHashes: number;
}

/**
 * Per-file FNV-1a fingerprints with tamper-detection metadata.
 * V2 already gates the run as a whole via fingerprint-gate.ts, but this
 * adds the per-file granularity needed for the audit chain.
 */
export function fingerprintSourceFiles(
  files: ReadonlyArray<{ name: string; content: string }>,
): SourceIntegrityReport {
  const fingerprints = files.map((f) => fingerprintFile(f.content, f.name));
  const seen = new Set<string>();
  let duplicates = 0;
  let bytes = 0;
  let lines = 0;

  for (const fp of fingerprints) {
    if (seen.has(fp.hash)) duplicates++;
    seen.add(fp.hash);
    bytes += fp.byteLength;
    lines += fp.lineCount;
  }

  return {
    fingerprints,
    duplicateCount: duplicates,
    totalBytes: bytes,
    totalLines: lines,
    uniqueHashes: seen.size,
  };
}

export { aggregateProfile };

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — INGEST AUDIT (Gap #4)
// ═══════════════════════════════════════════════════════════════════════════════
//
// Thin re-exports so V2 callers can use the typed event loggers without
// reaching into @/lib/ascension. Every call writes to the audit_logs table
// (non-blocking) and tags the entry with v2 correlation.
//

export function logV2Upload(
  fileName: string,
  fileSizeBytes: number,
  language: string,
  userId?: string,
  runId?: string,
): void {
  logUpload(fileName, fileSizeBytes, language, userId, runId);
}

export function logV2Extraction(
  candidateNode: string,
  totalExtracted: number,
  acceptedCount: number,
  rejectedCount: number,
  durationMs: number,
  userId?: string,
  runId?: string,
): void {
  logExtraction(candidateNode, totalExtracted, acceptedCount, rejectedCount, durationMs, userId, runId);
}

export function logV2QualityGate(
  candidateNode: string,
  avgQuality: number,
  acceptedCount: number,
  rejectedCount: number,
  userId?: string,
  runId?: string,
): void {
  logQualityGate(candidateNode, avgQuality, acceptedCount, rejectedCount, userId, runId);
}

export function logV2ChainParticipation(
  capabilityName: string,
  chain: ReadonlyArray<string>,
  cjpiScore: number,
  userId?: string,
  runId?: string,
): void {
  logChainParticipation(capabilityName, [...chain], cjpiScore, userId, runId);
}

export function logV2Discovery(
  candidateNode: string,
  count: number,
  userId?: string,
  runId?: string,
): void {
  logAuditEvent(
    'extraction',
    { candidate: candidateNode, discoveries: count, source: 'ascension-v2' },
    undefined,
    userId,
    runId,
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — 4-AXIS COMPATIBILITY SCORING (Gap #5)
// ═══════════════════════════════════════════════════════════════════════════════

export type { CompatibilityReport };

/**
 * Score a candidate↔target collision on the 4-axis compatibility model.
 * Falls back gracefully when contract extraction can't run (e.g. no source).
 */
export function scoreCollision(
  primitiveName: string,
  cjpiScore: number,
  candidateContract: InterfaceContract | null,
  candidateProfile: EnvironmentProfile | null,
  selectedPrimitives: Set<string>,
): CompatibilityReport {
  const signalScore = Math.min(1, cjpiScore / 100);
  // Empty fallbacks for when contract data is unavailable
  const contract: InterfaceContract = candidateContract ?? {
    exports: [],
    dependencies: [],
    dataShapes: [],
    runtimeAssumptions: [],
    errorPatterns: [],
    asyncPatterns: [],
  };
  const profile: EnvironmentProfile = candidateProfile ?? {
    ecosystem: 'unknown',
    frameworks: [],
    storagePatterns: [],
    apiStyles: [],
    architecturalPatterns: [],
    dependencyComplexity: 'minimal',
    maturitySignals: [],
  };
  // V2 doesn't run structural pattern analysis yet — pass empty matches.
  // Synergy/gap-closure axes will use base values until structural is wired.
  const structuralMatches: StructuralMatch[] = [];

  return computeCompatibility(
    primitiveName,
    signalScore,
    contract,
    profile,
    structuralMatches,
    selectedPrimitives,
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — CONTRACT EXTRACTOR (Gap #6)
// ═══════════════════════════════════════════════════════════════════════════════

export type { InterfaceContract, EnvironmentProfile };

export interface CandidateContractBundle {
  contract: InterfaceContract;
  profile: EnvironmentProfile;
  exportCount: number;
  dataShapeCount: number;
  dependencyCount: number;
  runtimeAssumptionCount: number;
}

/**
 * Extract the interface contract + environment profile from a candidate's
 * source files. Concatenates files into a single corpus for matching —
 * matches V1 behaviour where the scanner sees the whole module.
 */
export function extractFileContracts(
  files: ReadonlyArray<{ name: string; content: string; language?: string }>,
  ecosystemHint?: string,
): CandidateContractBundle | null {
  const usable = files.filter((f) => typeof f.content === 'string' && f.content.length > 0);
  if (usable.length === 0) return null;

  const corpus = usable.map((f) => f.content).join('\n\n// ── file boundary ──\n\n');
  const ecosystem = (ecosystemHint || usable[0]?.language || 'unknown').toLowerCase();
  const contract = extractContract(corpus);
  const profile = profileEnvironment(corpus, ecosystem);

  return {
    contract,
    profile,
    exportCount: contract.exports.length,
    dataShapeCount: contract.dataShapes.length,
    dependencyCount: contract.dependencies.length,
    runtimeAssumptionCount: contract.runtimeAssumptions.length,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — MERGE SIMULATION (Gap #7)
// ═══════════════════════════════════════════════════════════════════════════════

export type { MergeSimulation };

export interface V2MergeBatchReport {
  simulations: MergeSimulation[];
  beneficial: number;
  neutral: number;
  risky: number;
  topImpact: string[];
  avgNetImprovement: number;
}

/**
 * Dry-run a batch of compatibility reports through merge simulation.
 * V2 doesn't compute structural matches yet, so we pass an empty list —
 * the simulator degrades gracefully and still scores tension/synergy.
 */
export function simulateMergeBatch(
  reports: ReadonlyArray<CompatibilityReport>,
  selection: Set<string>,
): V2MergeBatchReport {
  const structural: StructuralMatch[] = [];
  const sims = reports
    .map((r) => simulateMerge(r.primitive, r, structural, selection))
    .sort((a, b) => b.netImprovement - a.netImprovement);
  const total = sims.length || 1;
  const sumNet = sims.reduce((s, x) => s + x.netImprovement, 0);
  return {
    simulations: sims,
    beneficial: sims.filter((s) => s.verdict === 'beneficial').length,
    neutral: sims.filter((s) => s.verdict === 'neutral').length,
    risky: sims.filter((s) => s.verdict === 'risky').length,
    topImpact: sims.slice(0, 3).map((s) => s.primitive),
    avgNetImprovement: Math.round((sumNet / total) * 1000) / 1000,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §8 — DELTA MEASUREMENT (Gap #8 — V2-shaped)
// ═══════════════════════════════════════════════════════════════════════════════
//
// V1 delta-measurement requires a PipelineContext snapshot that V2 doesn't run.
// Instead, we measure the discovery-set delta: pre-dedup → post-dedup →
// post-lock. This proves the pipeline mutated state without fabricating
// runtime data we don't have.
//

export interface DiscoverySetDelta {
  rawCount: number;
  uniqueCount: number;
  ascendedCount: number;
  collapseRatio: number;       // unique / raw
  retentionRatio: number;      // ascended / unique
  topScoreDelta: number;       // post-dedup top - pre-dedup top
  bandShift: {
    high: number;
    medium: number;
    low: number;
    hypothesis: number;
  };
  verdict: 'amplified' | 'preserved' | 'compressed';
}

interface BandedItem { cjpiScore: number; band?: string }

export function measureDiscoveryDelta(
  preDedup: ReadonlyArray<BandedItem>,
  postDedup: ReadonlyArray<BandedItem>,
  ascendedCount: number,
): DiscoverySetDelta {
  const raw = preDedup.length;
  const unique = postDedup.length;
  const collapse = raw === 0 ? 0 : Math.round((unique / raw) * 1000) / 1000;
  const retention = unique === 0 ? 0 : Math.round((ascendedCount / unique) * 1000) / 1000;

  const topPre = preDedup.reduce((m, c) => (c.cjpiScore > m ? c.cjpiScore : m), 0);
  const topPost = postDedup.reduce((m, c) => (c.cjpiScore > m ? c.cjpiScore : m), 0);
  const topScoreDelta = Math.round((topPost - topPre) * 100) / 100;

  const tally = (items: ReadonlyArray<BandedItem>) =>
    items.reduce(
      (acc, c) => {
        const k = (c.band ?? 'hypothesis') as 'high' | 'medium' | 'low' | 'hypothesis';
        acc[k] = (acc[k] ?? 0) + 1;
        return acc;
      },
      { high: 0, medium: 0, low: 0, hypothesis: 0 },
    );
  const pre = tally(preDedup);
  const post = tally(postDedup);
  const bandShift = {
    high: post.high - pre.high,
    medium: post.medium - pre.medium,
    low: post.low - pre.low,
    hypothesis: post.hypothesis - pre.hypothesis,
  };

  // Verdict: dedup is "amplified" when high-band proportion ROSE, "compressed"
  // when more than half the raw discoveries were collapsed, otherwise "preserved".
  const preHighShare = raw === 0 ? 0 : pre.high / raw;
  const postHighShare = unique === 0 ? 0 : post.high / unique;
  const verdict: DiscoverySetDelta['verdict'] =
    postHighShare > preHighShare || topScoreDelta > 0
      ? 'amplified'
      : collapse < 0.5
        ? 'compressed'
        : 'preserved';

  return {
    rawCount: raw,
    uniqueCount: unique,
    ascendedCount,
    collapseRatio: collapse,
    retentionRatio: retention,
    topScoreDelta,
    bandShift,
    verdict,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §9 — PRIMITIVE LEARNING (Gap #9)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Record per-collision outcome so the substrate compounds across runs.
 * Success = collision produced a banded discovery; failure = collision
 * was attempted but yielded nothing.
 */
export function recordCollisionOutcome(primitiveName: string, success: boolean): void {
  recordPrimitiveOutcome(primitiveName, success);
}

export function getCollisionLearning(primitiveName: string) {
  return {
    stats: getPrimitiveLearningStats(primitiveName),
    reliable: isPrimitiveReliable(primitiveName),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §10 — FEEDBACK LOOP (Gap #10)
// ═══════════════════════════════════════════════════════════════════════════════

export type { LearnedSignal, FeedbackStats, FeedbackExtraction };

/**
 * Confirm a discovery match and feed its surrounding context back into the
 * learned-signal vocabulary. Only call this for high/medium-band discoveries
 * to avoid polluting the glossary with hypothesis noise.
 */
export function recordV2Confirmation(input: {
  codeContent: string;
  primitive: string;
  archetypeId: string;
  matchTerms: ReadonlyArray<string>;
}): { added: number; total: number } {
  const extraction = extractContext(
    input.codeContent,
    input.primitive,
    input.archetypeId,
    [...input.matchTerms],
  );
  const added = recordConfirmedMatch(extraction);
  const stats = getFeedbackStats();
  return { added: added.length, total: stats.totalSignals };
}

export function getV2FeedbackVocabulary(minWeight = 0.5): Map<string, string[]> {
  return getHighConfidenceSignals(minWeight);
}

export function getV2FeedbackStats(): FeedbackStats {
  return getFeedbackStats();
}

// ═══════════════════════════════════════════════════════════════════════════════
// §11 — SEMANTIC DRIFT (Gap #11)
// ═══════════════════════════════════════════════════════════════════════════════

export type { DriftDetection };

export interface V2DriftReport {
  ecosystem: string;
  detections: DriftDetection[];
  highConfidenceCount: number;
  uniqueCanonicals: number;
}

/**
 * Detect cross-ecosystem synonyms in the candidate corpus so the discovery
 * loop knows which canonical archetypes are likely present even when the
 * code uses a different vocabulary (e.g. Go "limiter" → rate_limiting).
 */
export function detectV2Drift(
  files: ReadonlyArray<{ name: string; content: string }>,
  ecosystemHint?: string,
): V2DriftReport {
  const usable = files.filter((f) => typeof f.content === 'string' && f.content.length > 0);
  if (usable.length === 0) {
    return { ecosystem: 'unknown', detections: [], highConfidenceCount: 0, uniqueCanonicals: 0 };
  }
  const corpus = usable.map((f) => f.content).join('\n\n');
  const ecosystem = (ecosystemHint || detectEcosystem(corpus)).toLowerCase();
  const detections = detectDrift(corpus, ecosystem);
  const canonicals = new Set(detections.map((d) => d.canonical));
  return {
    ecosystem,
    detections,
    highConfidenceCount: detections.filter((d) => d.confidence >= 0.8).length,
    uniqueCanonicals: canonicals.size,
  };
}
