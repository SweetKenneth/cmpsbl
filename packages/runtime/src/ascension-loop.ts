/**
 * CMPSBL® Ascension Loop — Phase 5: End-to-End Pipeline
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Unifies scanning, attachment, and runtime into one closed loop.
 *
 * Pipeline: Source Code → Scan → Attachments → Artifact → Activate → Proof
 *
 * Exit criteria:
 *   - End-to-end flow works on real software repeatedly
 *   - No manual stitching between phases
 *   - Output artifact is self-contained and executable
 *
 * © CMPSBL® — All rights reserved.
 */

import type { ScanPipelineResult, ScanPipelineOptions } from './scan-pipeline';
import { runScanPipeline } from './scan-pipeline';
import type { PolicyAttachmentEntry } from './scan-to-policy';
import type { ArtifactManifest, InitializationResult } from './artifact-initializer';
import { initializeArtifact } from './artifact-initializer';
import type { ActivationReport } from './engines/activation-proof';
import { generateActivationReport } from './engines/activation-proof';
import type { VerificationSummary, ArtifactFingerprint } from './engines/verification-ledger';
import {
  computeFingerprint,
  record,
  generateVerificationSummary,
  renderVerificationReport,
} from './engines/verification-ledger';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** Complete Ascension artifact — self-contained, executable, provable */
export interface AscensionArtifact<T extends Record<string, unknown> = Record<string, unknown>> {
  /** The wrapped module exports — drop-in replacement for the original */
  readonly exports: T;
  /** Build-time manifest (embeddable in artifact ZIP) */
  readonly manifest: ArtifactManifest;
  /** All attachment entries (embeddable as __MANA_ATTACHMENTS__) */
  readonly attachments: readonly PolicyAttachmentEntry[];
  /** Scan diagnostics (what was found, what was recommended) */
  readonly scan: ScanPipelineResult;
  /** Runtime activation result (what was wrapped, what was skipped) */
  readonly activation: InitializationResult;
  /** Activation proof (what primitives are active, what rules are registered) */
  readonly proof: ActivationReport;
  /** Phase 6: Artifact fingerprint for identity verification */
  readonly fingerprint: ArtifactFingerprint;
  /** Phase 6: Verification summary — what was attached, executed, blocked, and why */
  readonly verification: VerificationSummary;
  /** Pipeline execution metadata */
  readonly pipeline: PipelineTrace;
}

/** End-to-end pipeline execution trace */
export interface PipelineTrace {
  /** Total wall-clock time for full pipeline */
  readonly totalMs: number;
  /** Time spent in each phase */
  readonly phases: {
    readonly scanMs: number;
    readonly buildMs: number;
    readonly activateMs: number;
    readonly proofMs: number;
  };
  /** Summary counts */
  readonly functionsDetected: number;
  readonly findingsGenerated: number;
  readonly attachmentsProduced: number;
  readonly exportsWrapped: number;
  readonly enforcingBehaviors: number;
  readonly observingBehaviors: number;
}

/** Options for the full Ascension pipeline */
export interface AscensionOptions extends ScanPipelineOptions {
  /** Artifact name (used in manifest) */
  readonly name?: string;
  /** Artifact version */
  readonly version?: string;
  /** CJPI score override (default: auto-computed from scan quality) */
  readonly cjpi?: number;
  /** Category tag */
  readonly category?: string;
  /** Source language hint */
  readonly sourceLanguage?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — CJPI AUTO-COMPUTATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compute CJPI from scan results when no override is provided.
 * Based on finding density, enforcement ratio, and confidence distribution.
 */
function autoComputeCJPI(scan: ScanPipelineResult): number {
  const { meta, policyResult } = scan;
  if (meta.findingsCount === 0) return 10;

  // Density: findings per function boundary (0–1)
  const density = Math.min(
    meta.findingsCount / Math.max(meta.boundariesDetected, 1),
    1
  );

  // Enforcement ratio: enforcing vs total
  const enforcementRatio = meta.enforcingCount / Math.max(meta.attachmentsGenerated, 1);

  // Confidence: average across recommendations
  const avgConfidence = policyResult.recommendations.length > 0
    ? policyResult.recommendations.reduce((s, r) => s + r.confidence, 0) / policyResult.recommendations.length
    : 0;

  // Engine diversity: more engines = higher complexity score
  const engineDiversity = Math.min(policyResult.enginesActivated.length / 5, 1);

  // Weighted composite
  const raw = Math.round(
    density * 20 +
    enforcementRatio * 25 +
    avgConfidence * 30 +
    engineDiversity * 25
  );

  // Stabilize score (avoid noisy spikes from small samples)
  const smoothed = Math.round(raw * 0.9 + 10);
  return Math.max(10, Math.min(100, smoothed));
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — MANIFEST BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

function buildManifest(
  scan: ScanPipelineResult,
  options: AscensionOptions,
  cjpi: number,
): ArtifactManifest {
  return {
    name: options.name ?? 'ascension-artifact',
    tier: cjpi >= 90 ? 'Apex' : cjpi >= 75 ? 'Enterprise' : cjpi >= 55 ? 'Architect' : cjpi >= 35 ? 'Creator' : 'Raw',
    cjpi,
    modules: scan.policyResult.primitivesUsed as string[],
    version: options.version ?? '1.0.0',
    ...(options.category ? { category: options.category } : {}),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — THE ASCENSION LOOP (unified entry point)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run the complete Ascension pipeline on source code + module exports.
 *
 * This is the Phase 5 entry point:
 *   Source → Scan → Attach → Build Manifest → Activate → Proof
 *
 * The returned artifact is self-contained:
 *   - `.exports` is a drop-in replacement for the original module
 *   - `.manifest` + `.attachments` can be serialized into an artifact ZIP
 *   - `.proof` provides deterministic behavioral evidence
 *
 * No manual stitching. No drift between declared and executed behavior.
 */
export function ascend<T extends Record<string, unknown>>(
  sourceCode: string,
  moduleExports: T,
  options: AscensionOptions = {},
): AscensionArtifact<T> {
  const pipelineStart = performance.now();

  // ── Phase A: Scan ──────────────────────────────────────────
  const scanStart = performance.now();
  const scan = runScanPipeline(sourceCode, options);
  const scanMs = Math.round(performance.now() - scanStart);

  // ── Phase B: Build manifest + attachments ──────────────────
  const buildStart = performance.now();
  const cjpi = options.cjpi ?? autoComputeCJPI(scan);
  const manifest = buildManifest(scan, options, cjpi);

  // Convert PolicyAttachmentEntries to AttachmentEntry format for initializer
  const attachmentEntries = scan.attachments.map(a => ({
    functionName: a.functionName,
    capability: a.capability,
    primitive: a.primitive,
    policy: a.policy,
  }));
  const buildMs = Math.round(performance.now() - buildStart);

  // ── Phase C: Fingerprint (Phase 6) ─────────────────────────
  const fingerprint = computeFingerprint(
    manifest as unknown as Record<string, unknown>,
    attachmentEntries as unknown as Record<string, unknown>[],
  );

  record('artifact_bound', 'SYSTEM', 'ascension', 'Artifact manifest and attachments bound', {
    name: manifest.name,
    cjpi,
    attachmentCount: attachmentEntries.length,
    primitivesUsed: scan.policyResult.primitivesUsed,
  });

  // ── Phase D: Activate runtime ──────────────────────────────
  const activateStart = performance.now();
  const { wrapped, result: activation } = initializeArtifact(
    moduleExports,
    manifest,
    attachmentEntries,
  );
  const activateMs = Math.round(performance.now() - activateStart);

  // Record activation events into verification ledger
  const activationSeq = record('function_wrapped', 'SYSTEM', 'ascension',
    `${activation.wrappedCount} functions wrapped across ${manifest.modules.length} primitives`, {
    wrappedCount: activation.wrappedCount,
    skippedCount: activation.skippedCount,
  });

  // ── Phase E: Generate proof ────────────────────────────────
  const proofStart = performance.now();
  const proof = generateActivationReport();
  const proofMs = Math.round(performance.now() - proofStart);

  record('proof_generated', 'SYSTEM', 'ascension',
    `Activation proof: ${proof.activatedCount} activated, ${proof.boundCount} bound, ${proof.unresolvedCount} unresolved`, {
    dropInSuccess: proof.dropInSuccess,
    totalPrimitives: proof.totalPrimitives,
  }, { causedBy: activationSeq });

  // ── Phase F: Verification summary ──────────────────────────
  const verification = generateVerificationSummary();

  const totalMs = Math.round(performance.now() - pipelineStart);

  // Pipeline integrity check — sanity guard with quantified coverage
  const coverageRatio = activation.wrappedCount / Math.max(scan.meta.boundariesDetected, 1);
  const coveragePct = Math.round(coverageRatio * 100);
  const health = coverageRatio >= 0.8 ? 'healthy' : coverageRatio >= 0.5 ? 'partial' : 'degraded';
  const integrityOk = health !== 'degraded' && proof.totalPrimitives > 0;

  if (!integrityOk) {
    record('integrity_check', 'SYSTEM', 'verification',
      `Low activation integrity (${coveragePct}%) — potential scan/runtime mismatch`, {
      wrappedCount: activation.wrappedCount,
      boundariesDetected: scan.meta.boundariesDetected,
      coveragePct,
      coverageRatio,
      health,
    });
    console.warn(`CMPSBL: Low activation integrity (${coveragePct}%, ${health}) — potential scan/runtime mismatch`);
  }

  return {
    exports: wrapped,
    manifest,
    attachments: scan.attachments,
    scan,
    activation,
    proof,
    fingerprint,
    verification,
    pipeline: {
      totalMs,
      phases: { scanMs, buildMs, activateMs, proofMs },
      functionsDetected: scan.meta.boundariesDetected,
      findingsGenerated: scan.meta.findingsCount,
      attachmentsProduced: scan.meta.attachmentsGenerated,
      exportsWrapped: activation.wrappedCount,
      enforcingBehaviors: scan.meta.enforcingCount,
      observingBehaviors: scan.meta.observingCount,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — ARTIFACT SERIALIZER (for ZIP/export embedding)
// ═══════════════════════════════════════════════════════════════════════════════

/** Serializable artifact payload — everything needed to reconstruct at runtime */
export interface SerializedArtifact {
  readonly __MANA_MANIFEST__: ArtifactManifest;
  readonly __MANA_ATTACHMENTS__: readonly PolicyAttachmentEntry[];
  readonly __MANA_BEHAVIOR_REPORT__: string;
  readonly __MANA_PROOF__: ActivationReport;
  readonly __MANA_FINGERPRINT__: ArtifactFingerprint;
  readonly __MANA_VERIFICATION__: VerificationSummary;
  readonly __MANA_PIPELINE_TRACE__: PipelineTrace;
}

/**
 * Serialize an Ascension artifact for embedding in export ZIPs.
 */
export function serializeArtifact(artifact: AscensionArtifact): SerializedArtifact {
  return {
    __MANA_MANIFEST__: artifact.manifest,
    __MANA_ATTACHMENTS__: artifact.attachments,
    __MANA_BEHAVIOR_REPORT__: artifact.scan.behaviorReportText,
    __MANA_PROOF__: artifact.proof,
    __MANA_FINGERPRINT__: artifact.fingerprint,
    __MANA_VERIFICATION__: artifact.verification,
    __MANA_PIPELINE_TRACE__: artifact.pipeline,
  };
}

/**
 * Generate the globalThis injection code for artifact boot.
 * This string can be prepended to any artifact entry point.
 */
export function generateBootstrap(artifact: AscensionArtifact): string {
  const serialized = serializeArtifact(artifact);
  return [
    '// CMPSBL® Ascension Bootstrap — Auto-generated',
    '// Do not edit — regenerated on each export',
    `globalThis.__MANA_MANIFEST__ = ${JSON.stringify(serialized.__MANA_MANIFEST__)};`,
    `globalThis.__MANA_ATTACHMENTS__ = ${JSON.stringify(serialized.__MANA_ATTACHMENTS__)};`,
    '',
  ].join('\n');
}

/**
 * Render a human-readable pipeline summary.
 */
export function renderPipelineSummary(artifact: AscensionArtifact): string {
  const { pipeline: p, manifest: m, verification: v, fingerprint: fp } = artifact;
  return [
    `═══ CMPSBL® Ascension Loop — ${m.name} v${m.version} ═══`,
    '',
    `Tier: ${m.tier} | CJPI: ${m.cjpi} | Primitives: ${m.modules.join(', ')}`,
    `Fingerprint: ${fp.composite}`,
    '',
    `Pipeline: ${p.totalMs}ms total`,
    `  Scan:     ${p.phases.scanMs}ms → ${p.findingsGenerated} findings`,
    `  Build:    ${p.phases.buildMs}ms → ${p.attachmentsProduced} attachments`,
    `  Activate: ${p.phases.activateMs}ms → ${p.exportsWrapped} exports wrapped`,
    `  Proof:    ${p.phases.proofMs}ms`,
    '',
    `Behaviors: ${p.enforcingBehaviors} enforcing, ${p.observingBehaviors} observing`,
    '',
    `── Verification ──`,
    `  Events: ${v.totalEvents} | Enforcements: ${v.enforcements} | Anomalies: ${v.anomalies}`,
    `  Causal depth: ${v.causalChainDepth} | Integrity checks: ${v.integrityChecks}`,
    '',
    artifact.scan.behaviorReportText,
  ].join('\n');
}
