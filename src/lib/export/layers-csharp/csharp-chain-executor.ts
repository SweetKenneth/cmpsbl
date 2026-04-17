/**
 * CMPSBL® C# Chain Executor — Phase-Locked Wrapper Template
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates the deterministic `CmpsblExecute` chain executor in C#.
 * Phase order matches the canonical TS/Python/Go/Java executor:
 *
 *   Hardening → Governance → Foresight → Resilience → Intelligence →
 *   Performance → [Layer 1 — original code] → Evolution → Post Audit + Compliance
 *
 * C#-specific design:
 *   - Single static `Cmpsbl` class hosts every nested layer class.
 *   - The customer's Layer 1 is rendered as a nested `static class Layer1`
 *     with `Apply(string, Dictionary<string,object>) -> Dictionary<string,object>`.
 *   - Caller isolation: `CmpsblExecute` clones the input dictionary and strips
 *     CMPSBL sidecar keys from the output before returning.
 *
 * © CMPSBL® — All rights reserved.
 */

import { CSHARP_LAYER_BODIES, CSHARP_STD_USINGS } from './csharp-layers';

/** Canonical phase ordering — matches TS/Go/Rust/Java executor exactly. */
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
 * Returns the IDs that have a C# implementation, in execution order.
 */
export function orderCsharpLayersByPhase(selectedIds: ReadonlyArray<string>): string[] {
  const selected = new Set(selectedIds);
  const ordered: string[] = [];
  for (const phase of PHASE_ORDER) {
    for (const id of phase.layerIds) {
      if (selected.has(id) && id in CSHARP_LAYER_BODIES) ordered.push(id);
    }
  }
  return ordered;
}

/**
 * Emit the full C# file — namespace, usings, the `Cmpsbl` class containing
 * all layer nested classes, the user Layer 1, and the phase-locked
 * `CmpsblExecute` static method.
 *
 * @param namespaceName  C# namespace (defaults to `Cmpsbl.Ascension`)
 * @param selectedIds    Layer IDs the user picked. Order normalized to phase.
 * @param userLayer1     C# method body for Layer 1. If empty, identity passthrough.
 *                       Must be a method body — receives `string capabilityName`
 *                       and `Dictionary<string,object> input`, returns
 *                       `Dictionary<string,object>`.
 */
export function emitCsharpCmpsblFile(
  namespaceName: string,
  selectedIds: ReadonlyArray<string>,
  userLayer1: string = '',
): string {
  const orderedIds = orderCsharpLayersByPhase(selectedIds);

  const layerBodies = orderedIds.map(id => {
    const body = CSHARP_LAYER_BODIES[id];
    return body ? `\n        // ─── Layer: ${id} ───\n${indent(body.trim(), 8)}\n` : '';
  }).join('\n');

  const usingBlock = CSHARP_STD_USINGS.map(u => `using ${u};`).join('\n');

  const layer1Body = userLayer1.trim() || `
            // Default identity Layer 1 — caller must override.
            var output = new Dictionary<string, object>(input);
            return output;`.trim();

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
            var (govOk, _) = GovernanceShield.Check(capabilityName, workingInput);
            if (!govOk) {
                var blocked = new Dictionary<string, object>();
                blocked["_cmpsbl_blocked"] = "governance";
                return blocked;
            }`);
  }
  if (orderedIds.includes('zero-trust')) {
    preBlocks.push(`
            // SECURITY (zero-trust) — sidecar trust score, never mutates caller input.
            workingInput["_cmpsbl_session_trust"] = 1.0;`);
  }
  if (orderedIds.includes('ai-safety')) {
    preBlocks.push(`
            // INTELLIGENCE (ai-safety) — sanitize any prompt-shaped string fields.
            foreach (var key in new List<string>(workingInput.Keys)) {
                if (workingInput[key] is string s) {
                    workingInput[key] = AiSafety.SanitizePrompt(s);
                }
            }`);
  }
  if (orderedIds.includes('fleet-intelligence')) {
    preBlocks.push(`
            // INTELLIGENCE (fleet) — pick provider sidecar.
            var _p = FleetIntelligence.Pick();
            if (_p != null) workingInput["_cmpsbl_provider"] = _p.Id;`);
  }
  if (orderedIds.includes('regulatory-compliance')) {
    preBlocks.push(`
            // COMPLIANCE — annotate routing decision sidecar.
            workingInput["_cmpsbl_routed_to"] = "default";`);
  }

  const postBlocks: string[] = [];
  if (orderedIds.includes('fleet-intelligence')) {
    postBlocks.push(`
            if (workingInput.TryGetValue("_cmpsbl_provider", out var _provId) && _provId is string _ps)
                FleetIntelligence.RecordCall(_ps, true);`);
  }
  if (orderedIds.includes('audit-chain')) {
    postBlocks.push(`
            AuditChain.Append("execute", capabilityName, cleaned?.ToString() ?? "");`);
  }

  return [
    `// Code generated by CMPSBL® Ascension. DO NOT EDIT.`,
    `// Generator: Ascension V2 / C# emitter`,
    `// Patent: U.S. App. No. 64/029,678 · No. 64/031,637`,
    `// © CMPSBL® — All rights reserved.`,
    ``,
    usingBlock,
    ``,
    `namespace ${namespaceName}`,
    `{`,
    `    // ═══════════════════════════════════════════════════════════════════════════`,
    `    // CMPSBL® EXECUTE — Phase-Locked Chain Executor (C#)`,
    `    // Phases: HARDENING → GOVERNANCE → FORESIGHT → RESILIENCE → SECURITY →`,
    `    //         INTELLIGENCE → PERFORMANCE → [Layer 1] → EVOLUTION → AUDIT → COMPL`,
    `    // ═══════════════════════════════════════════════════════════════════════════`,
    `    public static class Cmpsbl`,
    `    {`,
    ``,
    `        // _cmpsbl_sidecar_keys — internal context keys that must never leak to output.`,
    `        private static readonly string[] _cmpsbl_sidecar_keys = new[] {`,
    sidecarKeys.map(k => `            "${k}",`).join('\n'),
    `        };`,
    ``,
    `        // _cmpsbl_strip_sidecars returns a shallow copy of m without the sidecar keys.`,
    `        private static Dictionary<string, object> _cmpsbl_strip_sidecars(Dictionary<string, object> m)`,
    `        {`,
    `            var output = new Dictionary<string, object>(m);`,
    `            foreach (var k in _cmpsbl_sidecar_keys) output.Remove(k);`,
    `            return output;`,
    `        }`,
    ``,
    `        // _cmpsbl_clone_input — never mutate the caller's input dictionary.`,
    `        private static Dictionary<string, object> _cmpsbl_clone_input(Dictionary<string, object> input)`,
    `        {`,
    `            return input == null ? new Dictionary<string, object>() : new Dictionary<string, object>(input);`,
    `        }`,
    ``,
    `        // ═══════════════════════════════════════════════════════════════════════`,
    `        // LAYER 1 — Original customer code (untouched).`,
    `        // ═══════════════════════════════════════════════════════════════════════`,
    `        public static class Layer1`,
    `        {`,
    `            public static Dictionary<string, object> Apply(string capabilityName, Dictionary<string, object> input)`,
    `            {`,
    indent(layer1Body, 16),
    `            }`,
    `        }`,
    ``,
    `        // ═══════════════════════════════════════════════════════════════════════`,
    `        // LAYER 2 — CMPSBL® Ascension Layers (${orderedIds.length} active).`,
    `        // ═══════════════════════════════════════════════════════════════════════`,
    layerBodies,
    ``,
    `        /// <summary>`,
    `        /// Phase-locked entry point. Customer code calls this instead of Layer1.Apply.`,
    `        /// Each enabled layer wraps Layer 1 in canonical CMPSBL phase order.`,
    `        /// </summary>`,
    `        public static Dictionary<string, object> CmpsblExecute(string capabilityName, Dictionary<string, object> input)`,
    `        {`,
    `            var workingInput = _cmpsbl_clone_input(input);`,
    preBlocks.join('\n'),
    ``,
    `            // ── Layer 1 — original customer code ─────────────────────────────────`,
    `            var rawResult = Layer1.Apply(capabilityName, workingInput);`,
    `            if (rawResult == null) rawResult = new Dictionary<string, object>();`,
    ``,
    `            // POST phases: audit + post-record. Always strip sidecars from output.`,
    `            var cleaned = _cmpsbl_strip_sidecars(rawResult);`,
    postBlocks.join('\n'),
    ``,
    `            return cleaned;`,
    `        }`,
    `    }`,
    `}`,
  ].join('\n');
}

/** Indent every line of `text` by `spaces` spaces. Preserves blank lines. */
function indent(text: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return text.split('\n').map(line => (line.length === 0 ? line : pad + line)).join('\n');
}
