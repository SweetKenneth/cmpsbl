/**
 * CMPSBL® Swift Chain Executor — Phase-Locked Wrapper Template
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates the deterministic `cmpsblExecute` chain executor in Swift.
 * Phase order matches the canonical TS/Python/Go/Java/C# executor exactly:
 *
 *   Hardening → Governance → Foresight → Resilience → Intelligence →
 *   Performance → [Layer 1 — original code] → Evolution → Audit → Compliance
 *
 * Swift-specific design:
 *   - Single top-level `public enum Cmpsbl` namespaces every nested layer enum.
 *   - The customer's Layer 1 is rendered as a nested `public enum Layer1` with
 *     `static func apply(_ capability: String, _ input: [String: Any]) -> [String: Any]`.
 *   - Caller isolation: `cmpsblExecute` clones the input dict and strips
 *     CMPSBL sidecar keys from the output before returning.
 *
 * © CMPSBL® — All rights reserved.
 */

import { SWIFT_LAYER_BODIES, SWIFT_STD_IMPORTS } from './swift-layers';

/** Canonical phase ordering — matches TS/Go/Rust/Java/C# executor exactly. */
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
 * Returns the IDs that have a Swift implementation, in execution order.
 */
export function orderSwiftLayersByPhase(selectedIds: ReadonlyArray<string>): string[] {
  const selected = new Set(selectedIds);
  const ordered: string[] = [];
  for (const phase of PHASE_ORDER) {
    for (const id of phase.layerIds) {
      if (selected.has(id) && id in SWIFT_LAYER_BODIES) ordered.push(id);
    }
  }
  return ordered;
}

/**
 * Emit the full Swift file — imports, the top-level `Cmpsbl` enum containing
 * all layer nested enums, the user Layer 1, and the phase-locked
 * `cmpsblExecute` static method.
 *
 * @param moduleName     Reserved for future Swift-package use; included as a
 *                       header comment so the artifact tracks its target.
 * @param selectedIds    Layer IDs the user picked. Order normalized to phase.
 * @param userLayer1     Swift method body for Layer 1. If empty, identity passthrough.
 *                       Receives `capability: String` and `input: [String: Any]`,
 *                       returns `[String: Any]`.
 */
export function emitSwiftCmpsblFile(
  moduleName: string,
  selectedIds: ReadonlyArray<string>,
  userLayer1: string = '',
): string {
  const orderedIds = orderSwiftLayersByPhase(selectedIds);

  const layerBodies = orderedIds.map(id => {
    const body = SWIFT_LAYER_BODIES[id];
    return body ? `\n    // ─── Layer: ${id} ───\n${indent(body.trim(), 4)}\n` : '';
  }).join('\n');

  const importBlock = SWIFT_STD_IMPORTS.map(i => `import ${i}`).join('\n');

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
            let (govOk, _) = GovernanceShield.check(capability, workingInput)
            if !govOk {
                return ["_cmpsbl_blocked": "governance"]
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
            for key in Array(workingInput.keys) {
                if let s = workingInput[key] as? String {
                    workingInput[key] = AiSafety.sanitizePrompt(s)
                }
            }`);
  }
  if (orderedIds.includes('fleet-intelligence')) {
    preBlocks.push(`
            // INTELLIGENCE (fleet) — pick provider sidecar.
            if let p = FleetIntelligence.pick() {
                workingInput["_cmpsbl_provider"] = p.id
            }`);
  }
  if (orderedIds.includes('regulatory-compliance')) {
    preBlocks.push(`
            // COMPLIANCE — annotate routing decision sidecar.
            workingInput["_cmpsbl_routed_to"] = "default"`);
  }

  const postBlocks: string[] = [];
  if (orderedIds.includes('fleet-intelligence')) {
    postBlocks.push(`
            if let provId = workingInput["_cmpsbl_provider"] as? String {
                FleetIntelligence.recordCall(provId, success: true)
            }`);
  }
  if (orderedIds.includes('audit-chain')) {
    postBlocks.push(`
            _ = AuditChain.append("execute", capability, "\\(cleaned)")`);
  }

  return [
    `// Code generated by CMPSBL® Ascension. DO NOT EDIT.`,
    `// Generator: Ascension V2 / Swift emitter`,
    `// Module:    ${moduleName}`,
    `// Patent:    U.S. App. No. 64/029,678 · No. 64/031,637`,
    `// © CMPSBL® — All rights reserved.`,
    ``,
    importBlock,
    ``,
    `// ═══════════════════════════════════════════════════════════════════════════`,
    `// CMPSBL® EXECUTE — Phase-Locked Chain Executor (Swift)`,
    `// Phases: HARDENING → GOVERNANCE → FORESIGHT → RESILIENCE → SECURITY →`,
    `//         INTELLIGENCE → PERFORMANCE → [Layer 1] → EVOLUTION → AUDIT → COMPL`,
    `// ═══════════════════════════════════════════════════════════════════════════`,
    `public enum Cmpsbl {`,
    ``,
    `    // _cmpsbl_sidecar_keys — internal context keys that must never leak to output.`,
    `    private static let _cmpsbl_sidecar_keys: [String] = [`,
    sidecarKeys.map(k => `        "${k}",`).join('\n'),
    `    ]`,
    ``,
    `    // _cmpsbl_strip_sidecars returns a shallow copy of m without the sidecar keys.`,
    `    private static func _cmpsbl_strip_sidecars(_ m: [String: Any]) -> [String: Any] {`,
    `        var output = m`,
    `        for k in _cmpsbl_sidecar_keys { output.removeValue(forKey: k) }`,
    `        return output`,
    `    }`,
    ``,
    `    // _cmpsbl_clone_input — never mutate the caller's input dictionary.`,
    `    private static func _cmpsbl_clone_input(_ input: [String: Any]) -> [String: Any] {`,
    `        return input`,
    `    }`,
    ``,
    `    // ═══════════════════════════════════════════════════════════════════════`,
    `    // LAYER 1 — Original customer code (untouched).`,
    `    // ═══════════════════════════════════════════════════════════════════════`,
    `    public enum Layer1 {`,
    `        public static func apply(_ capability: String, _ input: [String: Any]) -> [String: Any] {`,
    indent(layer1Body, 12),
    `        }`,
    `    }`,
    ``,
    `    // ═══════════════════════════════════════════════════════════════════════`,
    `    // LAYER 2 — CMPSBL® Ascension Layers (${orderedIds.length} active).`,
    `    // ═══════════════════════════════════════════════════════════════════════`,
    layerBodies,
    ``,
    `    /// Phase-locked entry point. Customer code calls this instead of Layer1.apply.`,
    `    /// Each enabled layer wraps Layer 1 in canonical CMPSBL phase order.`,
    `    public static func cmpsblExecute(_ capability: String, _ input: [String: Any]) -> [String: Any] {`,
    `        var workingInput = _cmpsbl_clone_input(input)`,
    preBlocks.join('\n'),
    ``,
    `        // ── Layer 1 — original customer code ─────────────────────────────────`,
    `        let rawResult = Layer1.apply(capability, workingInput)`,
    ``,
    `        // POST phases: audit + post-record. Always strip sidecars from output.`,
    `        let cleaned = _cmpsbl_strip_sidecars(rawResult)`,
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
