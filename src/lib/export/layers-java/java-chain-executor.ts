/**
 * CMPSBL® Java Chain Executor — Phase-Locked Wrapper Template
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates the deterministic `cmpsblExecute` chain executor in Java.
 * Phase order matches the canonical TS/Python/Go executor:
 *
 *   Hardening → Governance → Foresight → Resilience → Intelligence →
 *   Performance → [Layer 1 — original code] → Evolution → Post Audit + Compliance
 *
 * Java-specific design:
 *   - Single top-level `Cmpsbl` class hosts every nested layer class.
 *   - The customer's Layer 1 is rendered as a nested `static class Layer1`
 *     with `apply(String, Map<String,Object>) -> Map<String,Object>`.
 *   - Caller isolation: `cmpsblExecute` clones the input map and strips
 *     CMPSBL sidecar keys from the output before returning.
 *
 * © CMPSBL® — All rights reserved.
 */

import { JAVA_LAYER_BODIES, JAVA_STD_IMPORTS } from './java-layers';

/** Canonical phase ordering — matches TS/Go/Rust executor exactly. */
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
 * Returns the IDs that have a Java implementation, in execution order.
 */
export function orderJavaLayersByPhase(selectedIds: ReadonlyArray<string>): string[] {
  const selected = new Set(selectedIds);
  const ordered: string[] = [];
  for (const phase of PHASE_ORDER) {
    for (const id of phase.layerIds) {
      if (selected.has(id) && id in JAVA_LAYER_BODIES) ordered.push(id);
    }
  }
  return ordered;
}

/**
 * Emit the full Java file — package header, imports, the `Cmpsbl` class
 * containing all layer nested classes, the user Layer 1, and the
 * phase-locked `cmpsblExecute` static method.
 *
 * @param packageName  Java package (defaults to `com.cmpsbl.ascension`)
 * @param selectedIds  Layer IDs the user picked. Order is normalized to phase.
 * @param userLayer1   Java method body for Layer 1. If empty, identity passthrough.
 *                     Must be a method body — receives `String capabilityName`
 *                     and `Map<String,Object> input`, returns `Map<String,Object>`.
 */
export function emitJavaCmpsblFile(
  packageName: string,
  selectedIds: ReadonlyArray<string>,
  userLayer1: string = '',
): string {
  const orderedIds = orderJavaLayersByPhase(selectedIds);

  const layerBodies = orderedIds.map(id => {
    const body = JAVA_LAYER_BODIES[id];
    return body ? `\n    // ─── Layer: ${id} ───\n${indent(body.trim(), 4)}\n` : '';
  }).join('\n');

  const importBlock = JAVA_STD_IMPORTS.map(i => `import ${i};`).join('\n');

  const layer1Body = userLayer1.trim() || `
        // Default identity Layer 1 — caller must override.
        Map<String, Object> out = new LinkedHashMap<>(input);
        return out;`.trim();

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
        Object[] govResult = GovernanceShield.check(capabilityName, workingInput);
        if (!((Boolean) govResult[0])) {
            Map<String, Object> blocked = new LinkedHashMap<>();
            blocked.put("_cmpsbl_blocked", "governance");
            return blocked;
        }`);
  }
  if (orderedIds.includes('zero-trust')) {
    preBlocks.push(`
        // SECURITY (zero-trust) — sidecar trust score, never mutates caller input.
        workingInput.put("_cmpsbl_session_trust", 1.0);`);
  }
  if (orderedIds.includes('ai-safety')) {
    preBlocks.push(`
        // INTELLIGENCE (ai-safety) — sanitize any prompt-shaped string fields.
        for (Map.Entry<String, Object> e : new ArrayList<>(workingInput.entrySet())) {
            if (e.getValue() instanceof String) {
                workingInput.put(e.getKey(), AiSafety.sanitizePrompt((String) e.getValue()));
            }
        }`);
  }
  if (orderedIds.includes('fleet-intelligence')) {
    preBlocks.push(`
        // INTELLIGENCE (fleet) — pick provider sidecar.
        FleetIntelligence.Provider _p = FleetIntelligence.pick();
        if (_p != null) workingInput.put("_cmpsbl_provider", _p.id);`);
  }
  if (orderedIds.includes('regulatory-compliance')) {
    preBlocks.push(`
        // COMPLIANCE — annotate routing decision sidecar.
        workingInput.put("_cmpsbl_routed_to", "default");`);
  }

  const postBlocks: string[] = [];
  if (orderedIds.includes('fleet-intelligence')) {
    postBlocks.push(`
        Object _provId = workingInput.get("_cmpsbl_provider");
        if (_provId instanceof String) FleetIntelligence.recordCall((String) _provId, true);`);
  }
  if (orderedIds.includes('audit-chain')) {
    postBlocks.push(`
        AuditChain.append("execute", capabilityName, String.valueOf(cleaned));`);
  }

  return [
    `// Code generated by CMPSBL® Ascension. DO NOT EDIT.`,
    `// Generator: Ascension V2 / Java emitter`,
    `// Patent: U.S. App. No. 64/029,678 · No. 64/031,637`,
    `// © CMPSBL® — All rights reserved.`,
    ``,
    `package ${packageName};`,
    ``,
    importBlock,
    ``,
    `// ═══════════════════════════════════════════════════════════════════════════════`,
    `// CMPSBL® EXECUTE — Phase-Locked Chain Executor (Java)`,
    `// Phases: HARDENING → GOVERNANCE → FORESIGHT → RESILIENCE → SECURITY →`,
    `//         INTELLIGENCE → PERFORMANCE → [Layer 1] → EVOLUTION → AUDIT → COMPL`,
    `// ═══════════════════════════════════════════════════════════════════════════════`,
    `public final class Cmpsbl {`,
    ``,
    `    private Cmpsbl() {}`,
    ``,
    `    // _cmpsbl_sidecar_keys — internal context keys that must never leak to output.`,
    `    private static final String[] _cmpsbl_sidecar_keys = new String[] {`,
    sidecarKeys.map(k => `        "${k}",`).join('\n'),
    `    };`,
    ``,
    `    // _cmpsbl_strip_sidecars returns a shallow copy of m without the sidecar keys.`,
    `    private static Map<String, Object> _cmpsbl_strip_sidecars(Map<String, Object> m) {`,
    `        Map<String, Object> out = new LinkedHashMap<>(m);`,
    `        for (String k : _cmpsbl_sidecar_keys) out.remove(k);`,
    `        return out;`,
    `    }`,
    ``,
    `    // _cmpsbl_clone_input — never mutate the caller's input map.`,
    `    private static Map<String, Object> _cmpsbl_clone_input(Map<String, Object> input) {`,
    `        return input == null ? new LinkedHashMap<>() : new LinkedHashMap<>(input);`,
    `    }`,
    ``,
    `    // ═══════════════════════════════════════════════════════════════════════════`,
    `    // LAYER 1 — Original customer code (untouched).`,
    `    // ═══════════════════════════════════════════════════════════════════════════`,
    `    public static final class Layer1 {`,
    `        public static Map<String, Object> apply(String capabilityName, Map<String, Object> input) {`,
    indent(layer1Body, 12),
    `        }`,
    `    }`,
    ``,
    `    // ═══════════════════════════════════════════════════════════════════════════`,
    `    // LAYER 2 — CMPSBL® Ascension Layers (${orderedIds.length} active).`,
    `    // ═══════════════════════════════════════════════════════════════════════════`,
    layerBodies,
    ``,
    `    /**`,
    `     * Phase-locked entry point. Customer code calls this instead of Layer1.apply.`,
    `     * Each enabled layer wraps Layer 1 in canonical CMPSBL phase order.`,
    `     */`,
    `    public static Map<String, Object> cmpsblExecute(String capabilityName, Map<String, Object> input) {`,
    `        Map<String, Object> workingInput = _cmpsbl_clone_input(input);`,
    preBlocks.join('\n'),
    ``,
    `        // ── Layer 1 — original customer code ─────────────────────────────────`,
    `        Map<String, Object> rawResult = Layer1.apply(capabilityName, workingInput);`,
    `        if (rawResult == null) rawResult = new LinkedHashMap<>();`,
    ``,
    `        // POST phases: audit + post-record. Always strip sidecars from output.`,
    `        Map<String, Object> cleaned = _cmpsbl_strip_sidecars(rawResult);`,
    postBlocks.join('\n'),
    ``,
    `        return cleaned;`,
    `    }`,
    `}`,
  ].join('\n');
}

/** Indent every line of `text` by `spaces` spaces. Preserves blank lines. */
function indent(text: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return text.split('\n').map(line => (line.length === 0 ? line : pad + line)).join('\n');
}
