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
 * CMPSBL® Go Chain Executor — Phase-Locked Wrapper Template
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates the deterministic `cmpsbl_execute` chain executor in Go.
 * Phase order matches the canonical TS/Python executor:
 *
 *   Hardening → Governance → Foresight → Resilience → Intelligence →
 *   Performance → [Layer 1 — original code] → Evolution → Post Audit + Compliance
 *
 * Caller isolation:
 *   - The `input` map is never mutated.
 *   - Sidecar keys (e.g. `_cmpsbl_provider`, `_cmpsbl_routed_to`) are stripped
 *     from the output if Layer 1 returns a passthrough/identity map.
 *
 * © CMPSBL® — All rights reserved.
 */

import { GO_LAYER_BODIES, GO_STD_IMPORTS } from './go-layers';

/** Canonical phase ordering — matches TS executor exactly. */
const PHASE_ORDER: ReadonlyArray<{ phase: string; layerIds: ReadonlyArray<string> }> = [
  { phase: 'HARDENING',     layerIds: ['circuit-breaker', 'retry-backoff', 'timeout-guard', 'graceful-degradation', 'error-envelope', 'beacon-signal', 'trace-id'] },
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

/**
 * Order a set of selected layer IDs into the canonical phase order.
 * Returns the IDs that have a Go implementation, in execution order.
 */
export function orderGoLayersByPhase(selectedIds: ReadonlyArray<string>): string[] {
  const selected = new Set(selectedIds);
  const ordered: string[] = [];
  for (const phase of PHASE_ORDER) {
    for (const id of phase.layerIds) {
      if (selected.has(id) && id in GO_LAYER_BODIES) ordered.push(id);
    }
  }
  return ordered;
}

/**
 * Emit the full Go file — package header, imports, layer bodies, and the
 * phase-locked `CmpsblExecute` wrapper.
 *
 * @param packageName  Go package name (defaults to `cmpsbl`)
 * @param selectedIds  Layer IDs the user picked. Order is normalized to phase.
 * @param userLayer1   The Go user code that becomes Layer 1. Should declare
 *                     `func CmpsblLayer1(capabilityName string, input map[string]interface{}) map[string]interface{}`.
 *                     If empty, an identity passthrough is emitted.
 */
export function emitGoCmpsblFile(
  packageName: string,
  selectedIds: ReadonlyArray<string>,
  userLayer1: string = '',
): string {
  const orderedIds = orderGoLayersByPhase(selectedIds);
  const usedImports = new Set<string>(['context', ...GO_STD_IMPORTS]);

  const layerBodies = orderedIds.map(id => {
    const body = GO_LAYER_BODIES[id];
    return body ? `\n// ─── Layer: ${id} ───\n${body.trim()}\n` : '';
  }).join('\n');

  const importBlock = [...usedImports]
    .sort()
    .map(i => `\t"${i}"`)
    .join('\n');

  const layer1Block = userLayer1.trim() || `
// Default identity Layer 1 — caller must override CmpsblLayer1.
func CmpsblLayer1(capabilityName string, input map[string]interface{}) map[string]interface{} {
\tout := make(map[string]interface{}, len(input))
\tfor k, v := range input { out[k] = v }
\treturn out
}`.trim();

  // Sidecar keys to scrub from output (caller isolation invariant).
  const sidecarKeys = [
    '_cmpsbl_provider',
    '_cmpsbl_routed_to',
    '_cmpsbl_session_trust',
  ];

  const wrapperBlock = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  CMPSBL® EXECUTE — Phase-Locked Chain Executor (Go)                          ║
// ║  Phases: HARDENING → GOVERNANCE → FORESIGHT → RESILIENCE → SECURITY →        ║
// ║          INTELLIGENCE → PERFORMANCE → [Layer 1] → EVOLUTION → AUDIT → COMPL  ║
// ║  Patent: U.S. App. No. 64/029,678                                            ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// CmpsblExecutionResult is the return type from the chain executor.
type CmpsblExecutionResult = map[string]interface{}

// _cmpsbl_sidecar_keys — internal context keys that must never leak to output.
var _cmpsbl_sidecar_keys = []string{
${sidecarKeys.map(k => `\t"${k}",`).join('\n')}
}

// _cmpsbl_strip_sidecars returns a shallow copy of m without the sidecar keys.
func _cmpsbl_strip_sidecars(m map[string]interface{}) map[string]interface{} {
\tout := make(map[string]interface{}, len(m))
\tfor k, v := range m { out[k] = v }
\tfor _, k := range _cmpsbl_sidecar_keys { delete(out, k) }
\treturn out
}

// _cmpsbl_clone_input — never mutate the caller's input.
func _cmpsbl_clone_input(input map[string]interface{}) map[string]interface{} {
\tif input == nil { return map[string]interface{}{} }
\tout := make(map[string]interface{}, len(input))
\tfor k, v := range input { out[k] = v }
\treturn out
}

// CmpsblExecute is the canonical phase-locked entry point. Customer code
// invokes this instead of CmpsblLayer1 directly. Each enabled layer wraps
// Layer 1 in the order defined by the CMPSBL phase chain.
func CmpsblExecute(ctx context.Context, capabilityName string, input map[string]interface{}) CmpsblExecutionResult {
\t_ = ctx
\tworkingInput := _cmpsbl_clone_input(input)

\t// PRE phases: governance + foresight + security gates run before Layer 1.
${orderedIds.includes('governance-shield') ? `
\t// GOVERNANCE — veto on policy violation (no-op if no policies registered).
\tif ok, _ := cmpsbl_check_policies(capabilityName, workingInput); !ok {
\t\treturn map[string]interface{}{"_cmpsbl_blocked": "governance"}
\t}` : ''}
${orderedIds.includes('zero-trust') ? `
\t// SECURITY (zero-trust) — sidecar trust score, never mutates input.
\tworkingInput["_cmpsbl_session_trust"] = 1.0` : ''}
${orderedIds.includes('ai-safety') ? `
\t// INTELLIGENCE (ai-safety) — sanitize any prompt-shaped string fields.
\tfor k, v := range workingInput {
\t\tif s, ok := v.(string); ok { workingInput[k] = cmpsbl_sanitize_prompt(s); _ = k }
\t}` : ''}
${orderedIds.includes('fleet-intelligence') ? `
\t// INTELLIGENCE (fleet) — pick provider sidecar.
\tif p := cmpsbl_pick_provider(); p != nil {
\t\tworkingInput["_cmpsbl_provider"] = p.ID
\t}` : ''}
${orderedIds.includes('regulatory-compliance') ? `
\t// COMPLIANCE — annotate routing decision sidecar.
\tworkingInput["_cmpsbl_routed_to"] = "default"` : ''}

\t// ── Layer 1 — original customer code ───────────────────────────────────────
\trawResult := CmpsblLayer1(capabilityName, workingInput)
\tif rawResult == nil { rawResult = map[string]interface{}{} }

\t// POST phases: audit + post-record. Always strip sidecars from output.
\tcleaned := _cmpsbl_strip_sidecars(rawResult)
${orderedIds.includes('fleet-intelligence') ? `
\tif provID, ok := workingInput["_cmpsbl_provider"].(string); ok {
\t\tcmpsbl_record_provider_call(provID, true)
\t}` : ''}
${orderedIds.includes('audit-chain') ? `
\tcmpsbl_append_audit("execute", capabilityName, fmt.Sprintf("%v", cleaned))` : ''}

\treturn cleaned
}
`;

  return [
    `// Code generated by CMPSBL® Ascension. DO NOT EDIT.`,
    `// Generator: Ascension V2 / Go emitter`,
    `// Patent: U.S. App. No. 64/029,678 · No. 64/031,637`,
    `// © CMPSBL® — All rights reserved.`,
    ``,
    `package ${packageName}`,
    ``,
    `import (`,
    importBlock,
    `)`,
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