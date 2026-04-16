/**
 * CMPSBL® Layer Catalog — Public API
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Selectable capability layers that merge into Layer 2 during Ascension.
 * Each layer provides production-grade infrastructure that auto-wires
 * to the customer's exported functions — Layer 1 stays untouched.
 *
 * Layer code lives in per-pillar files under `./layers/`. This file is
 * a thin barrel that assembles the public catalog and utility helpers.
 *
 * NOTE: Circuit Breaker is core infrastructure, not a selectable layer.
 * It is inlined into every Layer 2 export unconditionally and is NOT
 * part of `LAYER_CATALOG`. See `./layers/_circuit-breaker-core.ts`.
 *
 * U.S. Patent App. No. 64/029,678 · No. 64/031,637
 * © CMPSBL® — All rights reserved.
 */

export type { CmpsblLayerDefinition } from './layers/types';
import type { CmpsblLayerDefinition } from './layers/types';

import { RESILIENCE_LAYERS } from './layers/resilience';
import { FORESIGHT_LAYERS } from './layers/foresight';
import { SECURITY_LAYERS } from './layers/security';
import { INTELLIGENCE_LAYERS } from './layers/intelligence';
import { PERFORMANCE_LAYERS } from './layers/performance';
import { ORCHESTRATION_LAYERS } from './layers/orchestration';
import { EVOLUTION_LAYERS } from './layers/evolution';
import { GOVERNANCE_LAYERS } from './layers/governance';
import { COMPLIANCE_LAYERS } from './layers/compliance';
import { CIRCUIT_BREAKER_CORE } from './layers/_circuit-breaker-core';
import { TIMEOUT_CORE } from './layers/_timeout-core';
import { RETRY_CORE } from './layers/_retry-core';
import { ENVELOPE_CORE } from './layers/_envelope-core';
import { TRACE_CORE } from './layers/_trace-core';
import { DEGRADATION_CORE } from './layers/_degradation-core';
import { BEACON_CORE } from './layers/_beacon-core';

// ── Always-On Core ───────────────────────────────────────────────────────────
// Standard hardening primitives auto-inlined into every Layer 2 export.
// Not user-selectable, not removable. Order = wrapper composition order
// (innermost wraps cmpsbl_execute first; BEACON is the outermost observer).
//
//   Circuit Breaker  → cascade prevention      (innermost)
//   Timeout Guard    → deadline enforcement
//   Retry            → transient recovery
//   Envelope         → typed result contract
//   Trace ID         → correlation propagation
//   Degradation      → fallback envelope
//   BEACON           → structured signal       (outermost)
export const CMPSBL_CORE_LAYERS: readonly CmpsblLayerDefinition[] = Object.freeze([
  CIRCUIT_BREAKER_CORE,
  TIMEOUT_CORE,
  RETRY_CORE,
  ENVELOPE_CORE,
  TRACE_CORE,
  DEGRADATION_CORE,
  BEACON_CORE,
]);

// ── Selectable Layer Catalog ────────────────────────────────────────────────
const LAYER_CATALOG: CmpsblLayerDefinition[] = [
  ...RESILIENCE_LAYERS,
  ...FORESIGHT_LAYERS,
  ...SECURITY_LAYERS,
  ...INTELLIGENCE_LAYERS,
  ...PERFORMANCE_LAYERS,
  ...ORCHESTRATION_LAYERS,
  ...EVOLUTION_LAYERS,
  ...GOVERNANCE_LAYERS,
  ...COMPLIANCE_LAYERS,
];

// ── Deterministic Phase Ordering ────────────────────────────────────────────
// Locks the runtime composition order so every export produces the same
// wrapper chain regardless of catalog import order or user selection order.
//
//   Phase 0 — Hardening Layer            (always first; safety + boundaries)
//   Phase 1 — Governance + Security      (define what is allowed)
//   Phase 2 — Foresight + Detection      (predict before execution)
//   Phase 3 — Resilience + Recovery      (failure handling + stability)
//   Phase 4 — Intelligence + Memory      (decision augmentation)
//   Phase 5 — Performance + Orchestration (control execution flow)
//   Phase 6 — Execution                  (Layer 1 — your code runs here)
//   Phase 7 — Evolution                  (post-execution observation)
//   Phase 8 — Post Audit + Compliance    (finalize, prove, comply)
//
// Single-pass model: each layer executes once per cycle in its assigned phase.
// No layer may jump phases; no circular influence; no dynamic reordering.
const PHASE_HARDENING        = 0;
const PHASE_GOV_SECURITY     = 1;
const PHASE_FORESIGHT        = 2;
const PHASE_RESILIENCE       = 3;
const PHASE_INTELLIGENCE     = 4;
const PHASE_PERFORMANCE      = 5;
// Phase 6 = Execution (Layer 1) — no wrappers live here
const PHASE_EVOLUTION        = 7;
const PHASE_POST_COMPLIANCE  = 8;

const LAYER_PHASE_MAP: Readonly<Record<string, number>> = Object.freeze({
  // Phase 1 — Governance + Security
  'governance-shield':            PHASE_GOV_SECURITY,
  'audit-chain':                  PHASE_GOV_SECURITY,
  'zero-trust':                   PHASE_GOV_SECURITY,
  'adaptive-defense':             PHASE_GOV_SECURITY,
  'cyber-defense':                PHASE_GOV_SECURITY,
  // Phase 2 — Foresight + Detection
  'oracle-ripple-precognition':   PHASE_FORESIGHT,
  'anomaly-correlation-engine':   PHASE_FORESIGHT,
  // Phase 3 — Resilience + Recovery
  'self-healing':                 PHASE_RESILIENCE,
  'autonomous-triage':            PHASE_RESILIENCE,
  'distributed-consensus':        PHASE_RESILIENCE,
  // Phase 4 — Intelligence + Memory
  'fleet-intelligence':           PHASE_INTELLIGENCE,
  'ai-safety':                    PHASE_INTELLIGENCE,
  'ai-cost':                      PHASE_INTELLIGENCE,
  'cognitive-memory':             PHASE_INTELLIGENCE,
  // Phase 5 — Performance + Orchestration
  'performance-surgery':          PHASE_PERFORMANCE,
  'pipeline-resilience':          PHASE_PERFORMANCE,
  'pipeline-composition':         PHASE_PERFORMANCE,
  'universal-input':              PHASE_PERFORMANCE,
  // Phase 7 — Evolution (post-execution)
  'self-evolution':               PHASE_EVOLUTION,
  // Phase 8 — Post Audit + Compliance
  'regulatory-compliance':        PHASE_POST_COMPLIANCE,
});

const PHASE_LABELS: Readonly<Record<number, string>> = Object.freeze({
  0: 'Phase 0 — Hardening Layer',
  1: 'Phase 1 — Governance + Security',
  2: 'Phase 2 — Foresight + Detection',
  3: 'Phase 3 — Resilience + Recovery',
  4: 'Phase 4 — Intelligence + Memory',
  5: 'Phase 5 — Performance + Orchestration',
  7: 'Phase 7 — Evolution (post-execution)',
  8: 'Phase 8 — Post Audit + Compliance',
});

/**
 * Resolve the deterministic phase for a layer. Always-on core (Hardening) is
 * Phase 0. Selectable layers are looked up in LAYER_PHASE_MAP. Unmapped layers
 * default to PHASE_POST_COMPLIANCE so new additions never silently break the
 * chain — they land in the safe terminal phase until explicitly placed.
 */
function resolvePhase(layer: CmpsblLayerDefinition, isCore: boolean): number {
  if (isCore) return PHASE_HARDENING;
  return LAYER_PHASE_MAP[layer.id] ?? PHASE_POST_COMPLIANCE;
}

/**
 * Sort layers into deterministic phase order. Within a phase, original
 * catalog order (which mirrors crownJewelRank) is preserved for stability.
 * This guarantees: same input → same execution chain, every time.
 */
function orderByPhase(
  selected: CmpsblLayerDefinition[],
): Array<{ layer: CmpsblLayerDefinition; phase: number; isCore: boolean }> {
  const tagged = [
    ...CMPSBL_CORE_LAYERS.map((layer, idx) => ({
      layer, phase: resolvePhase(layer, true), isCore: true, originalIdx: idx,
    })),
    ...selected.map((layer, idx) => ({
      layer, phase: resolvePhase(layer, false), isCore: false, originalIdx: idx,
    })),
  ];
  // Stable sort by phase, then by original index within phase.
  tagged.sort((a, b) => a.phase - b.phase || a.originalIdx - b.originalIdx);
  return tagged.map(({ layer, phase, isCore }) => ({ layer, phase, isCore }));
}

/** Get all user-selectable layers (excludes always-on core like Circuit Breaker) */
export function getAvailableLayers(): CmpsblLayerDefinition[] {
  return [...LAYER_CATALOG];
}

/** Get a layer by ID — checks both selectable catalog and always-on core */
export function getLayerById(id: string): CmpsblLayerDefinition | null {
  return (
    LAYER_CATALOG.find(l => l.id === id) ??
    CMPSBL_CORE_LAYERS.find(l => l.id === id) ??
    null
  );
}

/** Get layer code for a specific language */
export function getLayerCode(layerId: string, lang: string): string | null {
  const layer = getLayerById(layerId);
  if (!layer) return null;
  if (lang === 'typescript' || lang === 'javascript') return layer.tsCode;
  if (lang === 'python') return layer.pyCode;
  return null;
}

/**
 * Get the auto-wire integration code that modifies cmpsbl_execute to use
 * selected layers. The user's selected layers are always wired AFTER the
 * always-on core layers (Circuit Breaker first, then user selections).
 */
export function getAutoWireTs(layers: CmpsblLayerDefinition[]): string {
  const allLayers = [...CMPSBL_CORE_LAYERS, ...layers];
  if (allLayers.length === 0) return '';
  const parts: string[] = [
    '',
    '// ── Ascension Layer Auto-Wire ───────────────────────────────────────────────',
    '// Active layers attach automatically to every capability invocation.',
    '// LAYER 1 (your code) is never modified — layers operate above it only.',
    '',
  ];
  for (const layer of allLayers) {
    parts.push(`// ── ${layer.name} (Layer #${layer.crownJewelRank}) ──`);
    parts.push(layer.autoWire.tsWire);
    parts.push('');
  }
  return parts.join('\n');
}

/** Get the auto-wire integration code for Python */
export function getAutoWirePy(layers: CmpsblLayerDefinition[]): string {
  const allLayers = [...CMPSBL_CORE_LAYERS, ...layers];
  if (allLayers.length === 0) return '';
  const parts: string[] = [
    '',
    '# ── Ascension Layer Auto-Wire ───────────────────────────────────────────────',
    '# Active layers attach automatically to every capability invocation.',
    '# LAYER 1 (your code) is never modified — layers operate above it only.',
    '',
  ];
  for (const layer of allLayers) {
    parts.push(`# ── ${layer.name} (Layer #${layer.crownJewelRank}) ──`);
    parts.push(layer.autoWire.pyWire);
    parts.push('');
  }
  parts.push('# Re-alias for backwards compat');
  parts.push('execute = cmpsbl_execute');
  return parts.join('\n');
}

/** Get the layer summary block for the file header */
export function getLayerHeaderBlock(
  layers: CmpsblLayerDefinition[],
  commentChar: string = '//',
): string {
  const allLayers = [...CMPSBL_CORE_LAYERS, ...layers];
  if (allLayers.length === 0) return '';
  const lines = [
    `${commentChar} ╔═══════════════════════════════════════════════════════════════════════════════╗`,
    `${commentChar} ║  CMPSBL® ASCENSION LAYER — Active Layers (auto-wired)                        ║`,
    ...allLayers.map(l =>
      `${commentChar} ║  ◆ ${l.name.padEnd(20)} — Layer #${String(l.crownJewelRank).padStart(3)} | ${l.module.padEnd(10)}                ║`,
    ),
    `${commentChar} ║  Layers protect, enrich, and govern your code — LAYER 1 stays untouched.     ║`,
    `${commentChar} ║  Configure or learn more: https://cmpsbl.com · npx @cmpsbl/cli               ║`,
    `${commentChar} ╚═══════════════════════════════════════════════════════════════════════════════╝`,
  ];
  return lines.join('\n');
}
