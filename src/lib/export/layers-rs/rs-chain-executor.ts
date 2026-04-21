/**
 * @deprecated V2 PARITY SCAFFOLDING — NOT ON THE V2 EXPORT PATH.
 *
 * The V2 Ascension export uses the V1 polyglot template engine
 * (`polyglot-templates.ts` + `cmpsbl-layer-polyglot.ts`) for non-canonical
 * languages. The per-language chain-executor / parity-harness files in
 * `layers-{rs,go,java,csharp,swift,kotlin}/` were scaffolded for a parity
 * model that never landed end-to-end. They are kept for reference only.
 *
 * Do not wire these into `unified-capability-file.ts`. If you find yourself
 * reaching for these, you probably want `polyglot-templates.ts` instead.
 *
 * Canonical export path: TS / JS / Python = first-class generators.
 * Beta polyglot path:    everything else  = polyglot-templates.ts.
 */

/**
 * CMPSBL® Rust Chain Executor — Phase-Locked Wrapper Template
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates the deterministic `cmpsbl_execute` chain entry point in Rust.
 *
 *   Hardening → Governance → Foresight → Resilience → Security →
 *   Intelligence → Performance → [Layer 1] → Evolution → Audit → Compliance
 *
 * Caller isolation:
 *   - The input `CmpsblMap` is cloned before any layer touches it.
 *   - Sidecar keys (`_cmpsbl_provider`, `_cmpsbl_routed_to`,
 *     `_cmpsbl_session_trust`) are stripped from the final output.
 *
 * © CMPSBL® — All rights reserved.
 */

import { RS_LAYER_BODIES, RS_SHARED_PRELUDE } from './rs-layers';

const PHASE_ORDER: ReadonlyArray<{ phase: string; layerIds: ReadonlyArray<string> }> = [
  { phase: 'GOVERNANCE',    layerIds: ['governance-shield'] },
  { phase: 'FORESIGHT',     layerIds: ['oracle-ripple-precognition', 'anomaly-correlation-engine'] },
  { phase: 'RESILIENCE',    layerIds: ['self-healing', 'autonomous-triage', 'distributed-consensus'] },
  { phase: 'SECURITY',      layerIds: ['adaptive-defense', 'zero-trust', 'cyber-defense', 'ai-safety'] },
  { phase: 'INTELLIGENCE',  layerIds: ['fleet-intelligence', 'ai-cost', 'cognitive-memory', 'universal-input', 'pipeline-composition'] },
  { phase: 'PERFORMANCE',   layerIds: ['performance-surgery', 'pipeline-resilience'] },
  { phase: 'EVOLUTION',     layerIds: ['self-evolution'] },
  { phase: 'AUDIT',         layerIds: ['audit-chain'] },
  { phase: 'COMPLIANCE',    layerIds: ['regulatory-compliance'] },
];

/** Order selected layer IDs into the canonical phase order (Rust-implemented only). */
export function orderRsLayersByPhase(selectedIds: ReadonlyArray<string>): string[] {
  const selected = new Set(selectedIds);
  const ordered: string[] = [];
  for (const phase of PHASE_ORDER) {
    for (const id of phase.layerIds) {
      if (selected.has(id) && id in RS_LAYER_BODIES) ordered.push(id);
    }
  }
  return ordered;
}

/**
 * Emit the full Rust file — crate header, shared prelude, layer modules,
 * and the phase-locked `cmpsbl_execute` wrapper.
 *
 * @param crateName    cosmetic crate name written into the header banner
 * @param selectedIds  layer IDs the user picked (order normalized to phase)
 * @param userLayer1   Rust source for `pub fn cmpsbl_layer1(...)`. If empty,
 *                     an identity passthrough is emitted.
 */
export function emitRsCmpsblFile(
  crateName: string,
  selectedIds: ReadonlyArray<string>,
  userLayer1: string = '',
): string {
  const orderedIds = orderRsLayersByPhase(selectedIds);

  const layerBodies = orderedIds.map(id => {
    const body = RS_LAYER_BODIES[id];
    return body ? `\n// ─── Layer: ${id} ───\n${body.trim()}\n` : '';
  }).join('\n');

  const layer1Block = userLayer1.trim() || `
// Default identity Layer 1 — caller must override cmpsbl_layer1.
pub fn cmpsbl_layer1(_capability: &str, input: &CmpsblMap) -> CmpsblMap {
    input.clone()
}`.trim();

  const preGovernance = orderedIds.includes('governance-shield')
    ? `    if let Err(_) = cmpsbl_governance::check(capability, &working) {
        let mut blocked = CmpsblMap::new();
        blocked.insert("_cmpsbl_blocked".to_string(), CmpsblValue::Str("governance".to_string()));
        return blocked;
    }`
    : '';

  const preZeroTrust = orderedIds.includes('zero-trust')
    ? `    working.insert("_cmpsbl_session_trust".to_string(), CmpsblValue::Num(1.0));`
    : '';

  const preAiSafety = orderedIds.includes('ai-safety')
    ? `    let keys: Vec<String> = working.keys().cloned().collect();
    for k in keys {
        if let Some(CmpsblValue::Str(s)) = working.get(&k).cloned() {
            working.insert(k, CmpsblValue::Str(cmpsbl_ai_safety::sanitize_prompt(&s)));
        }
    }`
    : '';

  const preFleet = orderedIds.includes('fleet-intelligence')
    ? `    if let Some(p) = cmpsbl_fleet_intel::pick() {
        working.insert("_cmpsbl_provider".to_string(), CmpsblValue::Str(p.id));
    }`
    : '';

  const preCompliance = orderedIds.includes('regulatory-compliance')
    ? `    working.insert("_cmpsbl_routed_to".to_string(), CmpsblValue::Str("default".to_string()));`
    : '';

  const postFleetRecord = orderedIds.includes('fleet-intelligence')
    ? `    if let Some(CmpsblValue::Str(prov_id)) = working.get("_cmpsbl_provider").cloned() {
        cmpsbl_fleet_intel::record(&prov_id, true);
    }`
    : '';

  const postAudit = orderedIds.includes('audit-chain')
    ? `    cmpsbl_audit_chain::append("execute", capability);`
    : '';

  const wrapperBlock = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  CMPSBL® EXECUTE — Phase-Locked Chain Executor (Rust)                        ║
// ║  Phases: HARDENING → GOVERNANCE → FORESIGHT → RESILIENCE → SECURITY →        ║
// ║          INTELLIGENCE → PERFORMANCE → [Layer 1] → EVOLUTION → AUDIT → COMPL  ║
// ║  Patent: U.S. App. No. 64/029,678                                            ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

const _CMPSBL_SIDECAR_KEYS: &[&str] = &[
    "_cmpsbl_provider",
    "_cmpsbl_routed_to",
    "_cmpsbl_session_trust",
];

fn _cmpsbl_strip_sidecars(m: CmpsblMap) -> CmpsblMap {
    let mut out = m;
    for k in _CMPSBL_SIDECAR_KEYS { out.remove(*k); }
    out
}

fn _cmpsbl_clone_input(input: &CmpsblMap) -> CmpsblMap { input.clone() }

pub fn cmpsbl_execute(capability: &str, input: &CmpsblMap) -> CmpsblMap {
    let mut working = _cmpsbl_clone_input(input);
${preGovernance}
${preZeroTrust}
${preAiSafety}
${preFleet}
${preCompliance}

    // ── Layer 1 — original customer code ───────────────────────────────────────
    let raw_result = cmpsbl_layer1(capability, &working);
    let cleaned = _cmpsbl_strip_sidecars(raw_result);
${postFleetRecord}
${postAudit}
    cleaned
}
`;

  return [
    `// Code generated by CMPSBL® Ascension. DO NOT EDIT.`,
    `// Generator: Ascension V2 / Rust emitter`,
    `// Crate: ${crateName}`,
    `// Patent: U.S. App. No. 64/029,678 · No. 64/031,637`,
    `// © CMPSBL® — All rights reserved.`,
    ``,
    `#![allow(dead_code, unused_imports, unused_variables, non_snake_case)]`,
    ``,
    `// ═══════════════════════════════════════════════════════════════════════════════`,
    `// SHARED PRELUDE`,
    `// ═══════════════════════════════════════════════════════════════════════════════`,
    RS_SHARED_PRELUDE.trim(),
    ``,
    `// ═══════════════════════════════════════════════════════════════════════════════`,
    `// LAYER 1 — Original customer code (untouched).`,
    `// ═══════════════════════════════════════════════════════════════════════════════`,
    layer1Block,
    ``,
    `// ═══════════════════════════════════════════════════════════════════════════════`,
    `// LAYER 2 — CMPSBL® Ascension Layers (${orderedIds.length} active).`,
    `// ═══════════════════════════════════════════════════════════════════════════════`,
    layerBodies,
    wrapperBlock,
  ].join('\n');
}