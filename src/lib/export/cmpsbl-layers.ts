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
