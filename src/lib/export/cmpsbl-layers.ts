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
import { INVENTORY_LAYERS } from './layers/inventory';
import { CIRCUIT_BREAKER_CORE } from './layers/_circuit-breaker-core';
import { TIMEOUT_CORE } from './layers/_timeout-core';
import { RETRY_CORE } from './layers/_retry-core';
import { ENVELOPE_CORE } from './layers/_envelope-core';
import { TRACE_CORE } from './layers/_trace-core';
import { DEGRADATION_CORE } from './layers/_degradation-core';
import { BEACON_CORE } from './layers/_beacon-core';
import { DEBUG_MODE_CORE } from './layers/_debug-mode-core';
import { STATE_STORE_CORE } from './layers/_state-store-core';
import { CONTRACT_VALIDATOR_CORE } from './layers/_contract-validator-core';
import { QUARANTINE_CORE } from './layers/_quarantine-core';
import { ISOLATED_EXECUTOR_CORE } from './layers/_isolated-executor-core';
import { KERNEL_CLOCK_CORE } from './layers/_kernel-clock-core';
import { CAPABILITY_REGISTRY_CORE } from './layers/_capability-registry-core';
import { KERNEL_BOOTSTRAP_CORE } from './layers/_kernel-bootstrap-core';
import { RECEIPT_EMITTER_CORE } from './layers/_receipt-emitter-core';
import { TELEMETRY_BUS_CORE } from './layers/_telemetry-bus-core';
import { REPLAY_LOG_CORE } from './layers/_replay-log-core';
import { SHADOW_EXECUTION_CORE } from './layers/_shadow-execution-core';
import { EFFECT_TRACKER_CORE } from './layers/_effect-tracker-core';

// ── Always-On Core ───────────────────────────────────────────────────────────
// Standard hardening primitives auto-inlined into every Layer 2 export.
// Not user-selectable, not removable. Order = wrapper composition order
// (innermost wraps cmpsbl_execute first; Debug Surface is outermost so the
// activation banner fires before any other wrapper can emit).
//
//   State Store      → persistent kernel substrate (innermost; foundation)
//   Circuit Breaker  → cascade prevention
//   Timeout Guard    → deadline enforcement
//   Retry            → transient recovery
//   Envelope         → typed result contract
//   Trace ID         → correlation propagation
//   Degradation      → fallback envelope
//   BEACON           → structured signal
//   Debug Surface    → opt-in observability    (outermost; off by default)
//
// Kernel components (State Store + future Quarantine, ContractValidator,
// IsolatedExecutor) are gated by CMPSBL_KERNEL_ENABLED env (default ON).
// When OFF, they degrade to no-op shims — exports stay byte-compatible.
export const CMPSBL_CORE_LAYERS: readonly CmpsblLayerDefinition[] = Object.freeze([
  KERNEL_CLOCK_CORE,
  STATE_STORE_CORE,
  CONTRACT_VALIDATOR_CORE,
  QUARANTINE_CORE,
  ISOLATED_EXECUTOR_CORE,
  CAPABILITY_REGISTRY_CORE,
  RECEIPT_EMITTER_CORE,
  TELEMETRY_BUS_CORE,
  REPLAY_LOG_CORE,
  SHADOW_EXECUTION_CORE,
  EFFECT_TRACKER_CORE,
  KERNEL_BOOTSTRAP_CORE,
  CIRCUIT_BREAKER_CORE,
  TIMEOUT_CORE,
  RETRY_CORE,
  ENVELOPE_CORE,
  TRACE_CORE,
  DEGRADATION_CORE,
  BEACON_CORE,
  DEBUG_MODE_CORE,
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
  ...INVENTORY_LAYERS,
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

  // ── Inventory Layers (25 store SKUs) ───────────────────────────────────────
  // Phase 1 — Governance + Security
  'llm-defense-suite':            PHASE_GOV_SECURITY,
  'cyber-perimeter-suite':        PHASE_GOV_SECURITY,
  'topological-security-suite':   PHASE_GOV_SECURITY,
  'holographic-integration-suite': PHASE_GOV_SECURITY,
  'privacy-obfuscation':          PHASE_GOV_SECURITY,
  'zero-trust-identity':          PHASE_GOV_SECURITY,
  'probabilistic-conscience':     PHASE_GOV_SECURITY,
  'neural-broker':                PHASE_GOV_SECURITY,
  // Phase 2 — Foresight + Detection
  'geospatial-intelligence':      PHASE_FORESIGHT,
  'sentinel-evolution':           PHASE_FORESIGHT,
  // Phase 3 — Resilience + Recovery
  'self-healing-scanner':         PHASE_RESILIENCE,
  'reflex-orchestration':         PHASE_RESILIENCE,
  // Phase 4 — Intelligence + Memory
  'quantum-simulation-suite':     PHASE_INTELLIGENCE,
  'symbolic-crafter':             PHASE_INTELLIGENCE,
  'emergent-gateway':             PHASE_INTELLIGENCE,
  'localization-mesh':            PHASE_INTELLIGENCE,
  // Phase 5 — Performance + Orchestration
  'robotics-control-suite':       PHASE_PERFORMANCE,
  'agency-orchestration-suite':   PHASE_PERFORMANCE,
  'kinetic-synthesis':            PHASE_PERFORMANCE,
  'adaptive-forge':               PHASE_PERFORMANCE,
  'synthetic-contracts':          PHASE_PERFORMANCE,
  // Phase 7 — Evolution (post-execution observers)
  'layered-observability-suite':  PHASE_EVOLUTION,
  'resilient-evolution':          PHASE_EVOLUTION,
  // Phase 8 — Post Audit + Compliance
  'spectral-auditor':             PHASE_POST_COMPLIANCE,
  'compliance-audit':             PHASE_POST_COMPLIANCE,
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
 * Render the auto-wire integration code for TypeScript.
 *
 * Layers are emitted in deterministic phase order (Hardening → Governance →
 * Foresight → Resilience → Intelligence → Performance → [Execution] →
 * Evolution → Post Audit + Compliance). Single-pass model: each layer is
 * wired exactly once, in its assigned phase. The composition order is
 * stable across runs — same selection produces the same chain.
 */
export function getAutoWireTs(layers: CmpsblLayerDefinition[]): string {
  const ordered = orderByPhase(layers);
  if (ordered.length === 0) return '';
  const parts: string[] = [
    '',
    '// ╔══════════════════════════════════════════════════════════════════════════╗',
    '// ║  CMPSBL® Ascension Layer — Deterministic Phase-Ordered Auto-Wire        ║',
    '// ║  Layers compose in locked phase order. Same input → same execution.     ║',
    '// ║  LAYER 1 (your code) executes at Phase 6 — never modified, only framed. ║',
    '// ╚══════════════════════════════════════════════════════════════════════════╝',
    '',
  ];
  let lastPhase = -1;
  let spineMarked = false;
  for (const { layer, phase } of ordered) {
    if (phase !== lastPhase) {
      // Insert the EXECUTION SPINE banner once, right before any post-execution
      // phase (Evolution / Post Compliance). Layer 1 (your code) fires inside
      // cmpsbl_execute — every layer above wraps it, every layer below observes it.
      if (!spineMarked && phase >= 7) {
        parts.push('// ╔══════════════════════════════════════════════════════════════════════════╗');
        parts.push('// ║  ▼ CMPSBL® EXECUTION SPINE — cmpsbl_execute (Phase 6: LAYER 1)  ▼      ║');
        parts.push('// ║  Your original code runs here, untouched. All wrappers above resolve   ║');
        parts.push('// ║  before this call; all observers below resolve after it returns.        ║');
        parts.push('// ╚══════════════════════════════════════════════════════════════════════════╝');
        parts.push('');
        spineMarked = true;
      }
      parts.push(`// ── ${PHASE_LABELS[phase] ?? `Phase ${phase}`} ──`);
      lastPhase = phase;
    }
    parts.push(`// • ${layer.name} (Layer #${layer.crownJewelRank})`);
    parts.push(layer.autoWire.tsWire);
    parts.push('');
  }
  // If no post-execution phases were selected, still mark the spine at the end.
  if (!spineMarked) {
    parts.push('// ╔══════════════════════════════════════════════════════════════════════════╗');
    parts.push('// ║  ▼ CMPSBL® EXECUTION SPINE — cmpsbl_execute (Phase 6: LAYER 1)  ▼      ║');
    parts.push('// ║  Your original code runs here, untouched. All wrappers above resolve   ║');
    parts.push('// ║  before this call. No post-execution observers selected.                ║');
    parts.push('// ╚══════════════════════════════════════════════════════════════════════════╝');
    parts.push('');
  }
  return parts.join('\n');
}

/** Render the auto-wire integration code for Python (deterministic phase order). */
export function getAutoWirePy(layers: CmpsblLayerDefinition[]): string {
  const ordered = orderByPhase(layers);
  if (ordered.length === 0) return '';
  const parts: string[] = [
    '',
    '# ╔══════════════════════════════════════════════════════════════════════════╗',
    '# ║  CMPSBL® Ascension Layer — Deterministic Phase-Ordered Auto-Wire        ║',
    '# ║  Layers compose in locked phase order. Same input → same execution.     ║',
    '# ║  LAYER 1 (your code) executes at Phase 6 — never modified, only framed. ║',
    '# ╚══════════════════════════════════════════════════════════════════════════╝',
    '',
  ];
  let lastPhase = -1;
  let spineMarked = false;
  for (const { layer, phase } of ordered) {
    if (phase !== lastPhase) {
      if (!spineMarked && phase >= 7) {
        parts.push('# ╔══════════════════════════════════════════════════════════════════════════╗');
        parts.push('# ║  ▼ CMPSBL® EXECUTION SPINE — cmpsbl_execute (Phase 6: LAYER 1)  ▼      ║');
        parts.push('# ║  Your original code runs here, untouched. All wrappers above resolve   ║');
        parts.push('# ║  before this call; all observers below resolve after it returns.        ║');
        parts.push('# ╚══════════════════════════════════════════════════════════════════════════╝');
        parts.push('');
        spineMarked = true;
      }
      parts.push(`# ── ${PHASE_LABELS[phase] ?? `Phase ${phase}`} ──`);
      lastPhase = phase;
    }
    parts.push(`# • ${layer.name} (Layer #${layer.crownJewelRank})`);
    parts.push(layer.autoWire.pyWire);
    parts.push('');
  }
  if (!spineMarked) {
    parts.push('# ╔══════════════════════════════════════════════════════════════════════════╗');
    parts.push('# ║  ▼ CMPSBL® EXECUTION SPINE — cmpsbl_execute (Phase 6: LAYER 1)  ▼      ║');
    parts.push('# ║  Your original code runs here, untouched. All wrappers above resolve   ║');
    parts.push('# ║  before this call. No post-execution observers selected.                ║');
    parts.push('# ╚══════════════════════════════════════════════════════════════════════════╝');
    parts.push('');
  }
  parts.push('# Re-alias for backwards compat')
  parts.push('execute = cmpsbl_execute')
  return parts.join('\n')
}

/**
 * Render the layer summary block for the file header — grouped by phase so
 * readers can see exactly where in the execution lifecycle each layer runs.
 */
export function getLayerHeaderBlock(
  layers: CmpsblLayerDefinition[],
  commentChar: string = '//',
): string {
  const ordered = orderByPhase(layers);
  if (ordered.length === 0) return '';
  const lines: string[] = [
    `${commentChar} ╔═══════════════════════════════════════════════════════════════════════════════╗`,
    `${commentChar} ║  CMPSBL® ASCENSION LAYER — Deterministic Phase Ordering                      ║`,
  ];
  let lastPhase = -1;
  for (const { layer, phase } of ordered) {
    if (phase !== lastPhase) {
      const label = PHASE_LABELS[phase] ?? `Phase ${phase}`;
      lines.push(`${commentChar} ║  ▸ ${label.padEnd(74)} ║`);
      lastPhase = phase;
    }
    const left = `◆ ${layer.name}`.padEnd(48);
    const right = `Layer #${String(layer.crownJewelRank).padStart(2)} | ${layer.module}`.padEnd(28);
    lines.push(`${commentChar} ║      ${left} ${right} ║`);
  }
  lines.push(`${commentChar} ║  ▸ Phase 6 — Execution (LAYER 1: your code runs here, untouched)             ║`);
  lines.push(`${commentChar} ║  Configure or learn more: https://cmpsbl.com · npx @cmpsbl/cli               ║`);
  lines.push(`${commentChar} ╚═══════════════════════════════════════════════════════════════════════════════╝`);
  return lines.join('\n');
}

