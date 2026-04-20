/**
 * CMPSBL® Capability Scanner Primitive
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Wires the structural signature scanner into the Ascension pipeline
 * as a callable primitive. The Memory Stream discovery cycle invokes
 * this to automatically profile incoming frameworks and surface
 * capability gaps as CJPI-scored discoveries.
 *
 * This is the bridge between "standalone diagnostic" and
 * "pipeline-integrated intelligence layer."
 *
 * © CMPSBL® — All rights reserved.
 */

import {
  runStructuralAnalysis,
  buildStructuralBoostMap,
  getArchetypes,
  type StructuralMatch,
} from './structural-signatures';
import {
  classifyBand,
  bandResults,
  getBandDistribution,
  type ConfidenceBand,
  type BandedResult,
} from './confidence-banding';
import {
  extractContext,
  recordConfirmedMatch,
  getFeedbackStats,
  type FeedbackStats,
} from './feedback-loop';
import {
  suggestForGaps,
  type RegistrySuggestion,
} from './ecosystem-registry';
import { detectEcosystem, detectDrift, type DriftDetection } from './semantic-drift';
import { fingerprintFile, getCachedScan, cacheScanResult } from './scan-integrity';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ScanRequest {
  /** Raw source code to profile */
  code: string;
  /** Optional filename for language hinting */
  filename?: string;
  /** Minimum confidence band to include in results */
  minimumBand?: ConfidenceBand;
  /** Whether to record confirmed matches into the feedback loop */
  learn?: boolean;
}

export interface ScanResult {
  /** Structural archetype matches with tristate classification */
  matches: StructuralMatch[];
  /** Primitive boost map derived from structural analysis */
  boostMap: Record<string, number>;
  /** Confidence-banded results for pipeline consumption */
  bandedResults: BandedResult[];
  /** Band distribution summary */
  bandDistribution: Record<ConfidenceBand, number>;
  /** Detected ecosystem */
  ecosystem: string;
  /** Semantic drift detections */
  driftDetections: DriftDetection[];
  /** Capability gaps identified (archetype IDs with no HIGH/MEDIUM match) */
  gaps: string[];
  /** Ecosystem registry suggestions for closing gaps */
  suggestions: RegistrySuggestion[];
  /** Feedback loop stats after this scan */
  feedbackStats: FeedbackStats;
  /** Scan timing */
  durationMs: number;
  /** Per-archetype floor: which archetypes achieved ≥1 HIGH match */
  archetypeFloor: { total: number; withHigh: number; ids: string[] };
  /** First-class security smell findings — surfaced from the security-gaps archetype */
  securityGaps: Array<{
    pattern: string;
    severity: 'low' | 'medium' | 'high';
    primitives: string[];
    confidence: number;
  }>;
}

export interface CJPIDiscovery {
  /** Archetype that produced the discovery */
  archetypeId: string;
  /** Which primitives benefit */
  primitives: string[];
  /** CJPI-equivalent score (0–100) derived from confidence */
  cjpiScore: number;
  /** Discovery type: 'capability' | 'gap' | 'drift' */
  discoveryType: 'capability' | 'gap' | 'drift';
  /** Human-readable description */
  description: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — SCANNER PRIMITIVE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run a full capability scan against source code.
 * This is the primitive entry point — callable from the Memory Stream
 * discovery cycle, Ascension pipeline, or manual diagnostics.
 *
 * Flow: code → structural analysis → confidence banding → gap detection
 *       → ecosystem suggestions → feedback loop → CJPI discoveries
 */
export function scanCapabilities(request: ScanRequest): ScanResult {
  const start = performance.now();
  const { code, filename = 'unknown', minimumBand = 'low', learn = true } = request;

  // ── Step 0: Integrity & Caching ──
  const fingerprint = fingerprintFile(code, filename);
  const cached = getCachedScan(fingerprint.hash);
  if (cached) return cached as ScanResult;

  // ── Step 1: Structural analysis ──
  const matches = runStructuralAnalysis(code);
  const boostMap = buildStructuralBoostMap(matches);

  // ── Step 2: Ecosystem detection + drift ──
  const ecosystem = detectEcosystem(code);
  const driftDetections = detectDrift(code, ecosystem);

  // ── Step 3: Confidence banding ──
  const intentPrimitives = new Set<string>();
  const structuralBoosts = new Map<string, number>();

  for (const match of matches) {
    if (match.intentHits > 0) {
      for (const p of match.primitives) intentPrimitives.add(p);
    }
    const boost = boostMap.get(match.primitives[0]) ?? 0;
    for (const p of match.primitives) {
      const existing = structuralBoosts.get(p) ?? 0;
      structuralBoosts.set(p, Math.max(existing, boost));
    }
  }

  const bandable = matches.map(m => ({
    primitive: { name: m.primitives[0] },
    sourceVertical: 'scanner',
    compoundingScore: m.confidence,
    signalHits: m.lexicalHits,
  }));

  const banded = bandResults(bandable, structuralBoosts, intentPrimitives);
  const bandDist = getBandDistribution(banded);

  // ── Step 4: Gap detection ──
  const archetypes = getArchetypes();

  const highOrMediumArchetypes = new Set(
    matches
      .filter(m => {
        const band = classifyBand(
          m.structuralHits > 0,
          m.lexicalHits >= 2,
          m.intentHits > 0,
          m.confidence,
        );
        return band === 'high' || band === 'medium';
      })
      .map(m => m.archetypeId)
  );

  const gaps = archetypes
    .filter(a => !highOrMediumArchetypes.has(a.id))
    .map(a => `no-${a.id}`);

  // ── Step 5: Ecosystem suggestions ──
  const suggestions = suggestForGaps(gaps, ecosystem);

  // ── Step 6: Feedback loop (learn from confirmed matches) ──
  if (learn) {
    for (const match of matches) {
      const band = classifyBand(
        match.structuralHits > 0,
        match.lexicalHits >= 2,
        match.intentHits > 0,
        match.confidence,
      );
      if (band === 'high' || band === 'medium') {
        const extraction = extractContext(
          code,
          match.primitives[0],
          match.archetypeId,
          match.primitives,
        );
        recordConfirmedMatch(extraction);
      }
    }
  }

  // ── Step 7: Per-archetype floor ──
  const archetypeHighIds: string[] = [];
  for (const arch of archetypes) {
    const archMatch = matches.find(m => m.archetypeId === arch.id);
    if (archMatch) {
      const band = classifyBand(
        archMatch.structuralHits > 0,
        archMatch.lexicalHits >= 2,
        archMatch.intentHits > 0,
        archMatch.confidence,
      );
      if (band === 'high') archetypeHighIds.push(arch.id);
    }
  }

  const durationMs = Math.round(performance.now() - start);

  // Surface security-gaps as first-class findings (separate from the gap list,
  // because security smells are *present* anti-patterns, not missing capabilities).
  const securityGaps: ScanResult['securityGaps'] = [];
  const securityMatch = matches.find(m => m.archetypeId === 'security-gaps');
  if (securityMatch && securityMatch.structuralHits > 0) {
    const severity: 'low' | 'medium' | 'high' =
      securityMatch.confidence >= 0.7 ? 'high' :
      securityMatch.confidence >= 0.4 ? 'medium' : 'low';
    securityGaps.push({
      pattern: securityMatch.archetypeName,
      severity,
      primitives: securityMatch.primitives,
      confidence: securityMatch.confidence,
    });
  }

  const result: ScanResult = {
    matches,
    boostMap: Object.fromEntries(boostMap),
    bandedResults: banded,
    bandDistribution: bandDist,
    ecosystem,
    driftDetections,
    gaps,
    suggestions,
    feedbackStats: getFeedbackStats(),
    durationMs,
    archetypeFloor: {
      total: archetypes.length,
      withHigh: archetypeHighIds.length,
      ids: archetypeHighIds,
    },
    securityGaps,
  };

  cacheScanResult(fingerprint.hash, result);
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — CJPI DISCOVERY EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

export function extractDiscoveries(result: ScanResult): CJPIDiscovery[] {
  const discoveries: CJPIDiscovery[] = [];

  for (const match of result.matches) {
    const band = classifyBand(
      match.structuralHits > 0,
      match.lexicalHits >= 2,
      match.intentHits > 0,
      match.confidence,
    );

    if (band === 'high' || band === 'medium') {
      const multiplier = band === 'high' ? 100 : 85;
      discoveries.push({
        archetypeId: match.archetypeId,
        primitives: match.primitives,
        cjpiScore: Math.round(match.confidence * multiplier),
        discoveryType: 'capability',
        description: `Detected ${match.archetypeName} (${band} confidence, ${match.structuralHits} structural hits)`,
      });
    }
  }

  for (const gap of result.gaps) {
    const archetypeId = gap.replace('no-', '');
    const archetype = getArchetypes().find(a => a.id === archetypeId);
    if (!archetype) continue;

    discoveries.push({
      archetypeId,
      primitives: archetype.primitives,
      cjpiScore: 0,
      discoveryType: 'gap',
      description: `Missing capability: ${archetype.name}. Consider adding ${archetype.primitives.join(', ')} primitives.`,
    });
  }

  for (const drift of result.driftDetections) {
    if (drift.confidence >= 0.75) {
      discoveries.push({
        archetypeId: drift.canonical,
        primitives: [],
        cjpiScore: Math.round(drift.confidence * 70),
        discoveryType: 'drift',
        description: `Semantic drift: '${drift.term}' maps to '${drift.canonical}' in ${drift.ecosystem} ecosystem`,
      });
    }
  }

  return discoveries.sort((a, b) => b.cjpiScore - a.cjpiScore);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — BATCH SCAN (for Memory Stream cycles)
// ═══════════════════════════════════════════════════════════════════════════════

export function batchScanCapabilities(
  files: Array<{ code: string; filename: string }>,
): {
  perFile: Array<{ filename: string; result: ScanResult }>;
  aggregatedDiscoveries: CJPIDiscovery[];
  totalDurationMs: number;
} {
  const start = performance.now();
  const perFile: Array<{ filename: string; result: ScanResult }> = [];
  const allDiscoveries: CJPIDiscovery[] = [];

  for (const file of files) {
    const result = scanCapabilities({
      code: file.code,
      filename: file.filename,
      learn: true,
    });
    perFile.push({ filename: file.filename, result });
    allDiscoveries.push(...extractDiscoveries(result));
  }

  const deduped = new Map<string, CJPIDiscovery>();
  for (const d of allDiscoveries) {
    const key = `${d.archetypeId}::${d.discoveryType}`;
    const existing = deduped.get(key);
    if (!existing || d.cjpiScore > existing.cjpiScore) {
      deduped.set(key, d);
    }
  }

  return {
    perFile,
    aggregatedDiscoveries: [...deduped.values()].sort((a, b) => b.cjpiScore - a.cjpiScore),
    totalDurationMs: Math.round(performance.now() - start),
  };
}
