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
