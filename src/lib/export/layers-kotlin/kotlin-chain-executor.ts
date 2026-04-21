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
 * CMPSBL® Kotlin Chain Executor — Phase-Locked Wrapper Template
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates the deterministic `cmpsblExecute` chain executor in Kotlin.
 * Phase order matches the canonical TS/Python/Go/Java/C#/Swift executor:
 *
 *   Hardening → Governance → Foresight → Resilience → Intelligence →
 *   Performance → [Layer 1 — original code] → Evolution → Audit → Compliance
 *
 * Kotlin-specific design:
 *   - Single top-level `object Cmpsbl` namespaces every nested layer object.
 *   - The customer's Layer 1 is rendered as a nested `object Layer1` with
 *     `fun apply(capability: String, input: MutableMap<String, Any>): MutableMap<String, Any>`.
 *   - Caller isolation: `cmpsblExecute` clones the input map and strips
 *     CMPSBL sidecar keys from the output before returning.
 *
 * © CMPSBL® — All rights reserved.
 */

import { KOTLIN_LAYER_BODIES } from './kotlin-layers';

/** Canonical phase ordering — matches all SHIPPING executors exactly. */
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
 * Returns the IDs that have a Kotlin implementation, in execution order.
 */
export function orderKotlinLayersByPhase(selectedIds: ReadonlyArray<string>): string[] {
  const selected = new Set(selectedIds);
  const ordered: string[] = [];
  for (const phase of PHASE_ORDER) {
    for (const id of phase.layerIds) {
      if (selected.has(id) && id in KOTLIN_LAYER_BODIES) ordered.push(id);
    }
  }
  return ordered;
}

/**
 * Emit the full Kotlin file — package, imports, the top-level `Cmpsbl` object
 * containing all layer nested objects, the user Layer 1, and the phase-locked
 * `cmpsblExecute` function.
 *
 * @param packageName    Kotlin package (defaults to `com.cmpsbl.ascension`)
 * @param selectedIds    Layer IDs the user picked. Order normalized to phase.
 * @param userLayer1     Kotlin function body for Layer 1. If empty, identity passthrough.
 *                       Receives `capability: String` and `input: MutableMap<String, Any>`,
 *                       returns `MutableMap<String, Any>`.
 */
export function emitKotlinCmpsblFile(
  packageName: string,
  selectedIds: ReadonlyArray<string>,
  userLayer1: string = '',
): string {
  const orderedIds = orderKotlinLayersByPhase(selectedIds);

  const layerBodies = orderedIds.map(id => {
    const body = KOTLIN_LAYER_BODIES[id];
    return body ? `\n    // ─── Layer: ${id} ───\n${indent(body.trim(), 4)}\n` : '';
  }).join('\n');

  const layer1Body = userLayer1.trim() || `
            // Default identity Layer 1 — caller must override.
            return input`.trim();

  // Sidecar keys to scrub from output (caller isolation invariant).
  const sidecarKeys = [
    '_cmpsbl_provider',
    '_cmpsbl_routed_to',
    '_cmpsbl_session_trust',
  ];

  const preBlocks: string[] = [];
  if (orderedIds.includes('governance-shield')) {
    preBlocks.push(`
        // GOVERNANCE — veto on policy violation (no-op if no policies registered).
        val (govOk, _) = GovernanceShield.check(capability, workingInput)
        if (!govOk) {
            return mutableMapOf("_cmpsbl_blocked" to "governance")
        }`);
  }
  if (orderedIds.includes('zero-trust')) {
    preBlocks.push(`
        // SECURITY (zero-trust) — sidecar trust score, never mutates caller input.
        workingInput["_cmpsbl_session_trust"] = 1.0`);
  }
  if (orderedIds.includes('ai-safety')) {
    preBlocks.push(`
        // INTELLIGENCE (ai-safety) — sanitize any prompt-shaped string fields.
        for (key in workingInput.keys.toList()) {
            val v = workingInput[key]
            if (v is String) workingInput[key] = AiSafety.sanitizePrompt(v)
        }`);
  }
  if (orderedIds.includes('fleet-intelligence')) {
    preBlocks.push(`
        // INTELLIGENCE (fleet) — pick provider sidecar.
        FleetIntelligence.pick()?.let { workingInput["_cmpsbl_provider"] = it.id }`);
  }
  if (orderedIds.includes('regulatory-compliance')) {
    preBlocks.push(`
        // COMPLIANCE — annotate routing decision sidecar.
        workingInput["_cmpsbl_routed_to"] = "default"`);
  }

  const postBlocks: string[] = [];
  if (orderedIds.includes('fleet-intelligence')) {
    postBlocks.push(`
        (workingInput["_cmpsbl_provider"] as? String)?.let {
            FleetIntelligence.recordCall(it, true)
        }`);
  }
  if (orderedIds.includes('audit-chain')) {
    postBlocks.push(`
        AuditChain.append("execute", capability, cleaned.toString())`);
  }

  return [
    `// Code generated by CMPSBL® Ascension. DO NOT EDIT.`,
    `// Generator: Ascension V2 / Kotlin emitter`,
    `// Patent:    U.S. App. No. 64/029,678 · No. 64/031,637`,
    `// © CMPSBL® — All rights reserved.`,
    ``,
    `package ${packageName}`,
    ``,
    `// ═══════════════════════════════════════════════════════════════════════════`,
    `// CMPSBL® EXECUTE — Phase-Locked Chain Executor (Kotlin)`,
    `// Phases: HARDENING → GOVERNANCE → FORESIGHT → RESILIENCE → SECURITY →`,
    `//         INTELLIGENCE → PERFORMANCE → [Layer 1] → EVOLUTION → AUDIT → COMPL`,
    `// ═══════════════════════════════════════════════════════════════════════════`,
    `object Cmpsbl {`,
    ``,
    `    // _cmpsbl_sidecar_keys — internal context keys that must never leak to output.`,
    `    private val _cmpsbl_sidecar_keys: List<String> = listOf(`,
    sidecarKeys.map(k => `        "${k}",`).join('\n'),
    `    )`,
    ``,
    `    // _cmpsbl_strip_sidecars returns a shallow copy of m without the sidecar keys.`,
    `    private fun _cmpsbl_strip_sidecars(m: MutableMap<String, Any>): MutableMap<String, Any> {`,
    `        val output = m.toMutableMap()`,
    `        for (k in _cmpsbl_sidecar_keys) output.remove(k)`,
    `        return output`,
    `    }`,
    ``,
    `    // _cmpsbl_clone_input — never mutate the caller's input map.`,
    `    private fun _cmpsbl_clone_input(input: MutableMap<String, Any>?): MutableMap<String, Any> {`,
    `        return input?.toMutableMap() ?: mutableMapOf()`,
    `    }`,
    ``,
    `    // ═══════════════════════════════════════════════════════════════════════`,
    `    // LAYER 1 — Original customer code (untouched).`,
    `    // ═══════════════════════════════════════════════════════════════════════`,
    `    object Layer1 {`,
    `        fun apply(capability: String, input: MutableMap<String, Any>): MutableMap<String, Any> {`,
    indent(layer1Body, 12),
    `        }`,
    `    }`,
    `    // ═══════════════════════════════════════════════════════════════════════`,
    `    // END LAYER 1 — Customer source above is preserved byte-for-byte by the seal.`,
    `    // ═══════════════════════════════════════════════════════════════════════`,
    ``,
    `    // ═══════════════════════════════════════════════════════════════════════`,
    `    // LAYER 2 — CMPSBL® Ascension Layers (${orderedIds.length} active).`,
    `    // ═══════════════════════════════════════════════════════════════════════`,
    layerBodies,
    ``,
    `    /// Phase-locked entry point. Customer code calls this instead of Layer1.apply.`,
    `    /// Each enabled layer wraps Layer 1 in canonical CMPSBL phase order.`,
    `    fun cmpsblExecute(capability: String, input: MutableMap<String, Any>): MutableMap<String, Any> {`,
    `        val workingInput = _cmpsbl_clone_input(input)`,
    preBlocks.join('\n'),
    ``,
    `        // ── Layer 1 — original customer code ─────────────────────────────────`,
    `        val rawResult = Layer1.apply(capability, workingInput)`,
    ``,
    `        // POST phases: audit + post-record. Always strip sidecars from output.`,
    `        val cleaned = _cmpsbl_strip_sidecars(rawResult)`,
    postBlocks.join('\n'),
    ``,
    `        return cleaned`,
    `    }`,
    `}`,
  ].join('\n');
}

/** Indent every line of `text` by `spaces` spaces. Preserves blank lines. */
function indent(text: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return text.split('\n').map(line => (line.length === 0 ? line : pad + line)).join('\n');
}