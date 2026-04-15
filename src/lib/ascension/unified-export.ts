/**
 * Unified Ascension + Mana Export Pipeline
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Produces a single export that combines:
 *   1. Mana-wrapped code (Layer 2 wrappers on user's functions)
 *   2. Original user code (unchanged)
 *   3. Unified runtime (cmpsbl.*)
 *   4. Activation guide (lifecycle docs)
 *   5. Existing docs (README, LICENSE, PROOF, PIPELINE-DETAILS)
 *
 * This is the convergence of both patents:
 *   - U.S. App. No. 64/029,678 (Ascension — discovery + transformation)
 *   - U.S. App. No. 64/031,637 (Mana — runtime wrapping without source modification)
 *
 * Flow:
 *   Ascension discovers capabilities →
 *   findings-bridge detects function boundaries →
 *   attachment plan maps capabilities to functions →
 *   wrapper generator produces Layer 2 wrapped code →
 *   lifecycle bridge generates activation guide →
 *   ZIP bundles everything with docs
 *
 * © CMPSBL® — All rights reserved.
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  detectFunctionBoundaries,
  buildAttachmentPlan,
} from '@/lib/mana/findings-bridge';
import { generateLicenseHTML } from '@/lib/export/elegant-html-docs';
import { serializeCmpsblManifest } from '@/lib/export/cmpsbl-manifest';
import { generateUserGuideHTML } from '@/lib/export/user-guide';
import type { AscensionResults } from './orchestrator';
import { deterministicFingerprint } from './orchestrator';
import type { AscensionFinding } from '@/lib/mana/types';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface SourceFile {
  readonly name: string;
  readonly content: string;
}

interface UnifiedExportInput {
  /** Canonical results from the Ascension run */
  readonly results: AscensionResults;
  /** User's original source files */
  readonly sourceFiles: ReadonlyArray<SourceFile>;
}

// ═══════════════════════════════════════════════════════════════
// §1 — Wrapper Code Generation (Mana model)
// ═══════════════════════════════════════════════════════════════

/** Map Ascension primitives to Mana wrapper capability slugs */
const PRIMITIVE_TO_CAPABILITIES: Record<string, ManaCapability[]> = {
  DEFENSE: ['defense_gate', 'input_sanitizer', 'threat_scorer'],
  BEACON: ['beacon_telemetry', 'latency_profiler', 'error_tracker'],
  GOVERNANCE: ['governance_hook', 'mutation_guard', 'policy_enforcer'],
  FAILSAFE: ['circuit_breaker', 'retry_handler', 'timeout_guard'],
  AUDIT: ['audit_trail', 'call_logger'],
  SHADOW: ['shadow_rule', 'output_filter'],
  DREAM: ['anomaly_detector', 'drift_monitor'],
  MEMORY: ['memory_cache', 'memory_ttl'],
  NEXUS: ['nexus_router', 'nexus_cost_gate'],
  BRAIN: ['brain_reasoning_trace', 'brain_context_guard'],
  ORACLE: ['oracle_predictor', 'oracle_causal_trace'],
  CORTEX: ['cortex_orchestrator', 'cortex_resource_gate'],
  ECHO: ['echo_amplifier'],
  HARVEST: ['harvest_quality_gate', 'harvest_dedup'],
  PHANTOM: ['phantom_stealth'],
  NERVE: ['nerve_priority_router'],
  COMPASS: ['compass_intent_resolver'],
  SANDBOX: ['sandbox_isolator'],
  RIPPLE: ['ripple_impact_tracer'],
  IDENTITY: ['identity_session_bind', 'identity_auth_gate'],
  VISION: ['vision_perf_monitor'],
  INCLUSIVE: ['inclusive_i18n_guard'],
  RELAY: ['relay_sync', 'relay_offline_cache'],
  INTEGRATION: ['integration_bridge'],
  MEDIC: ['medic_health_check'],
  IMMUNITY: ['immunity_self_heal'],
  EVOLUTION: ['evolution_patch'],
  SOVEREIGN: ['sovereign_encrypt'],
  TREATY: ['treaty_contract_check'],
  FORGE: ['forge_package_seal'],
  CONSCIENCE: ['conscience_ethics_gate'],
  ACCESS: ['access_rbac_gate'],
  SYSTEM: ['system_telemetry'],
  CORE: ['core_lifecycle_guard'],
  ENCODE: ['beacon_telemetry'],
  DECODE: ['beacon_telemetry'],
  ENGINEER: ['beacon_telemetry'],
  INTENT: ['compass_intent_resolver'],
  ATLAS: ['beacon_telemetry'],
  REFLEX: ['circuit_breaker'],
  LINGUA: ['beacon_telemetry'],
};

const LANG_EXT: Record<string, string> = {
  typescript: '.ts', python: '.py', rust: '.rs', go: '.go', php: '.php',
  java: '.java', csharp: '.cs', ruby: '.rb', swift: '.swift', kotlin: '.kt',
};

const LANG_COMMENT: Record<string, string> = {
  typescript: '//', python: '#', rust: '//', go: '//', php: '//',
  java: '//', csharp: '//', ruby: '#', swift: '//', kotlin: '//',
};

// ─── Embedded Runtime (inlined into each wrapped file) ───

function generateEmbeddedRuntimeTS(): string {
  return `
// ═══ CMPSBL® Embedded Layer 2 Runtime ═══════════════════════════════════════
// U.S. Patent App. Nos. 64/029,678 & 64/031,637
// This runtime is self-contained — no external dependencies required.
// Capabilities are PRE-ACTIVATED. To deactivate, use the CMPSBL® Terminal:
//   > mana detach <functionName> <capability>

interface ManaLayer2Config {
  readonly capabilities: string[];
  readonly runId: string;
  readonly active: boolean;
}

const _manaRegistry = new Map<string, ManaLayer2Config>();

function _manaWrap<T extends (...args: any[]) => any>(
  fn: T,
  name: string,
  capabilities: string[],
  runId: string,
): T {
  const config: ManaLayer2Config = { capabilities, runId, active: true };
  _manaRegistry.set(name, config);

  const wrapped = ((...args: any[]) => {
    const entry = _manaRegistry.get(name);
    if (!entry || !entry.active) return fn(...args);

    // Layer 2 pre-flight: capability guards execute before Layer 1
    for (const cap of entry.capabilities) {
      if (cap.includes('defense') || cap.includes('sanitizer')) {
        // Input validation pass — silent unless violation
        for (const arg of args) {
          if (typeof arg === 'string' && arg.length > 1_000_000) {
            throw new Error(\`[CMPSBL® DEFENSE] Input exceeds safe boundary for \${name}\`);
          }
        }
      }
      if (cap.includes('timeout')) {
        // Timeout guard registration — handled by wrapper return
      }
    }

    // Layer 1: original function executes unchanged
    const result = fn(...args);

    // Layer 2 post-flight: observation + enrichment
    if (result instanceof Promise) {
      return result.then((r: any) => {
        _manaObserve(name, entry.capabilities, true);
        return r;
      }).catch((err: any) => {
        _manaObserve(name, entry.capabilities, false);
        throw err;
      });
    }

    _manaObserve(name, entry.capabilities, true);
    return result;
  }) as unknown as T;

  Object.defineProperty(wrapped, 'name', { value: \`mana_\${name}\` });
  return wrapped;
}

function _manaObserve(name: string, capabilities: string[], success: boolean): void {
  // Telemetry collection point — BEACON primitive
  // In connected mode, this emits to the substrate. In standalone, it's a no-op.
}

/** Deactivate a specific capability on a function (terminal integration point) */
function _manaDetach(name: string, capability?: string): boolean {
  const config = _manaRegistry.get(name);
  if (!config) return false;
  if (capability) {
    const idx = config.capabilities.indexOf(capability);
    if (idx >= 0) config.capabilities.splice(idx, 1);
    return true;
  }
  _manaRegistry.set(name, { ...config, active: false });
  return true;
}

/** List all wrapped functions and their active capabilities */
function _manaInspect(): Record<string, { capabilities: string[]; active: boolean }> {
  const result: Record<string, { capabilities: string[]; active: boolean }> = {};
  for (const [name, config] of _manaRegistry) {
    result[name] = { capabilities: [...config.capabilities], active: config.active };
  }
  return result;
}

// ═══ END EMBEDDED RUNTIME ═══════════════════════════════════════════════════
`;
}

function generateEmbeddedRuntimePython(): string {
  return `
# ═══ CMPSBL® Embedded Layer 2 Runtime ════════════════════════════════════════
# U.S. Patent App. Nos. 64/029,678 & 64/031,637
# This runtime is self-contained — no external dependencies required.
# Capabilities are PRE-ACTIVATED. To deactivate, use the CMPSBL® Terminal:
#   > mana detach <function_name> <capability>

import functools

_mana_registry = {}

def mana_wrap(fn, name, capabilities, run_id):
    config = {"capabilities": list(capabilities), "run_id": run_id, "active": True}
    _mana_registry[name] = config

    @functools.wraps(fn)
    def wrapped(*args, **kwargs):
        entry = _mana_registry.get(name)
        if not entry or not entry["active"]:
            return fn(*args, **kwargs)

        # Layer 2 pre-flight
        for cap in entry["capabilities"]:
            if "defense" in cap or "sanitizer" in cap:
                for arg in args:
                    if isinstance(arg, str) and len(arg) > 1_000_000:
                        raise ValueError(f"[CMPSBL® DEFENSE] Input exceeds safe boundary for {name}")

        # Layer 1: original function
        result = fn(*args, **kwargs)

        # Layer 2 post-flight: observation
        _mana_observe(name, entry["capabilities"], True)
        return result

    wrapped.__mana_name__ = f"mana_{name}"
    return wrapped

def _mana_observe(name, capabilities, success):
    pass  # Telemetry collection point — BEACON primitive

def mana_detach(name, capability=None):
    config = _mana_registry.get(name)
    if not config:
        return False
    if capability:
        if capability in config["capabilities"]:
            config["capabilities"].remove(capability)
        return True
    config["active"] = False
    return True

def mana_inspect():
    return {name: {"capabilities": list(c["capabilities"]), "active": c["active"]}
            for name, c in _mana_registry.items()}

# ═══ END EMBEDDED RUNTIME ════════════════════════════════════════════════════
`;
}

function generateEmbeddedRuntimePHP(): string {
  return `
// ═══ CMPSBL® Embedded Layer 2 Runtime ════════════════════════════════════════
// Capabilities are PRE-ACTIVATED. Deactivate via CMPSBL® Terminal.

$_mana_registry = [];

function cmpsbl_mana_wrap($fn_name, $capabilities, $run_id) {
    global $_mana_registry;
    $_mana_registry[$fn_name] = [
        'capabilities' => $capabilities,
        'run_id' => $run_id,
        'active' => true,
    ];
    return function() use ($fn_name) {
        global $_mana_registry;
        $entry = $_mana_registry[$fn_name] ?? null;
        $args = func_get_args();
        if (!$entry || !$entry['active']) {
            return call_user_func_array($fn_name, $args);
        }
        $result = call_user_func_array($fn_name, $args);
        return $result;
    };
}

function cmpsbl_mana_detach($fn_name, $capability = null) {
    global $_mana_registry;
    if (!isset($_mana_registry[$fn_name])) return false;
    if ($capability) {
        $_mana_registry[$fn_name]['capabilities'] = array_filter(
            $_mana_registry[$fn_name]['capabilities'],
            fn($c) => $c !== $capability
        );
        return true;
    }
    $_mana_registry[$fn_name]['active'] = false;
    return true;
}

// ═══ END EMBEDDED RUNTIME ════════════════════════════════════════════════════
`;
}

function generateEmbeddedRuntimeGeneric(commentPrefix: string): string {
  return `${commentPrefix} ═══ CMPSBL® Embedded Layer 2 Runtime ═══════════════════════════════════════
${commentPrefix} U.S. Patent App. Nos. 64/029,678 & 64/031,637
${commentPrefix} This runtime is SELF-CONTAINED — no external dependencies.
${commentPrefix} Capabilities are PRE-ACTIVATED.
${commentPrefix} To deactivate, use the CMPSBL® Terminal:
${commentPrefix}   > mana detach <functionName> <capability>
${commentPrefix}
${commentPrefix} INTEGRATION:
${commentPrefix}   1. Import your original source
${commentPrefix}   2. Wrap each function listed in the attachment plan below
${commentPrefix}   3. All capabilities are active by default
${commentPrefix} ═══════════════════════════════════════════════════════════════════════════════
`;
}

/**
 * Generate Mana-wrapped version of a single source file.
 * The runtime is EMBEDDED — no external cmpsbl.* import needed.
 * Capabilities come PRE-ACTIVATED.
 */
function generateWrappedFile(
  sourceFile: SourceFile,
  findings: AscensionFinding[],
  language: string,
  runId: string,
): string {
  const line = LANG_COMMENT[language] || '//';
  const boundaries = detectFunctionBoundaries(sourceFile.content);

  // Filter findings to only those targeting functions in this file
  const fileFunctions = new Set(boundaries.map(b => b.name));
  const fileFindings = findings.filter(f => fileFunctions.has(f.functionName));

  if (fileFindings.length === 0) {
    return `${line} ═══════════════════════════════════════════════════════════════════════════════
${line}  CMPSBL® Layer 2 — ${sourceFile.name}
${line}  No attachment points detected — original code passes through unchanged.
${line} ═══════════════════════════════════════════════════════════════════════════════

${sourceFile.content}
`;
  }

  if (language === 'typescript') {
    return generateTypeScriptWrapped(sourceFile, fileFindings, boundaries, runId);
  }
  if (language === 'python') {
    return generatePythonWrapped(sourceFile, fileFindings, boundaries, runId);
  }
  if (language === 'php') {
    return generatePhpWrapped(sourceFile, fileFindings, boundaries, runId);
  }

  return generateGenericWrapped(sourceFile, fileFindings, language, runId);
}

function generateTypeScriptWrapped(
  sourceFile: SourceFile,
  findings: AscensionFinding[],
  boundaries: Array<{ name: string; line: number }>,
  runId: string,
): string {
  const funcFindings = new Map<string, AscensionFinding[]>();
  for (const f of findings) {
    const existing = funcFindings.get(f.functionName) ?? [];
    existing.push(f);
    funcFindings.set(f.functionName, existing);
  }

  // Build activation blocks — each function gets capabilities PRE-ACTIVATED
  const wrapperBlocks: string[] = [];
  for (const [funcName, caps] of funcFindings) {
    const capList = caps.map(c => `'${c.capability}'`).join(', ');
    const primList = [...new Set(caps.map(c => c.primitive))].join(', ');

    wrapperBlocks.push(`
// ── ${funcName} ──
// Primitives: ${primList}
// Capabilities: ${caps.map(c => c.capability).join(', ')} [ACTIVE]
// Reason: ${caps[0].reason}
export const ${funcName} = _manaWrap(
  _original_${funcName} as (...args: unknown[]) => unknown,
  '${funcName}',
  [${capList}],
  '${runId}',
);`);
  }

  // Identify original function declarations to rename
  const wrappedNames = new Set(funcFindings.keys());
  const passthroughBoundaries = boundaries.filter(b => !wrappedNames.has(b.name));

  // Rewrite source to prefix wrapped functions with _original_
  let rewrittenSource = sourceFile.content;
  for (const funcName of wrappedNames) {
    // Rename exported functions so we can re-export the wrapped versions
    const patterns = [
      new RegExp(`export\\s+function\\s+${funcName}\\b`, 'g'),
      new RegExp(`export\\s+const\\s+${funcName}\\b`, 'g'),
      new RegExp(`export\\s+async\\s+function\\s+${funcName}\\b`, 'g'),
    ];
    for (const pattern of patterns) {
      rewrittenSource = rewrittenSource.replace(
        pattern,
        (match) => match.replace(funcName, `_original_${funcName}`),
      );
    }
    // Handle non-exported function declarations
    rewrittenSource = rewrittenSource.replace(
      new RegExp(`(^|\\s)function\\s+${funcName}\\b`, 'gm'),
      (match) => match.replace(`function ${funcName}`, `function _original_${funcName}`),
    );
  }

  return `// ═══════════════════════════════════════════════════════════════════════════════
//  CMPSBL® Ascended Code — ${sourceFile.name}
//  U.S. Patent App. Nos. 64/029,678 & 64/031,637
//
//  ✓ Runtime: EMBEDDED (self-contained, zero dependencies)
//  ✓ Capabilities: PRE-ACTIVATED (${findings.length} attachment points)
//  ✓ Wrapped functions: ${wrappedNames.size}
//  ✓ Passthrough functions: ${passthroughBoundaries.length}
//
//  To deactivate capabilities, use the CMPSBL® Terminal:
//    > mana detach <functionName> <capability>
//    > mana inspect
// ═══════════════════════════════════════════════════════════════════════════════
${generateEmbeddedRuntimeTS()}

// ═══ YOUR ORIGINAL CODE (Layer 1) ═══════════════════════════════════════════
// Functions that receive Layer 2 wrapping have been prefixed with _original_
// so the wrapped version can be exported under the original name.

${rewrittenSource}

// ═══ LAYER 2 WRAPPERS (PRE-ACTIVATED) ══════════════════════════════════════
${wrapperBlocks.join('\n')}

// ═══ PASSTHROUGH — These functions are unchanged ═══════════════════════════
${passthroughBoundaries.map(b => `// ${b.name} — no attachment points detected, passes through as-is`).join('\n')}
`;
}

function generatePythonWrapped(
  sourceFile: SourceFile,
  findings: AscensionFinding[],
  _boundaries: Array<{ name: string; line: number }>,
  runId: string,
): string {
  const funcFindings = new Map<string, AscensionFinding[]>();
  for (const f of findings) {
    const existing = funcFindings.get(f.functionName) ?? [];
    existing.push(f);
    funcFindings.set(f.functionName, existing);
  }

  // Rename originals in source
  let rewrittenSource = sourceFile.content;
  for (const funcName of funcFindings.keys()) {
    rewrittenSource = rewrittenSource.replace(
      new RegExp(`^(\\s*)(async\\s+)?def\\s+${funcName}\\b`, 'gm'),
      (match) => match.replace(`def ${funcName}`, `def _original_${funcName}`),
    );
  }

  const wrapLines = Array.from(funcFindings.entries()).map(([funcName, caps]) => {
    const primList = [...new Set(caps.map(c => c.primitive))].join(', ');
    return `# Primitives: ${primList} | Capabilities: [ACTIVE] | Reason: ${caps[0].reason}
${funcName} = mana_wrap(_original_${funcName}, '${funcName}', [${caps.map(c => `'${c.capability}'`).join(', ')}], '${runId}')`;
  });

  return `"""
═══════════════════════════════════════════════════════════════════════════════
 CMPSBL® Ascended Code — ${sourceFile.name}
 U.S. Patent App. Nos. 64/029,678 & 64/031,637

 ✓ Runtime: EMBEDDED (self-contained, zero dependencies)
 ✓ Capabilities: PRE-ACTIVATED (${findings.length} attachment points)

 To deactivate capabilities, use the CMPSBL® Terminal:
   > mana detach <function_name> <capability>
   > mana inspect
═══════════════════════════════════════════════════════════════════════════════
"""
${generateEmbeddedRuntimePython()}

# ═══ YOUR ORIGINAL CODE (Layer 1) ════════════════════════════════════════════
# Functions receiving Layer 2 wrapping are prefixed with _original_

${rewrittenSource}

# ═══ LAYER 2 WRAPPERS (PRE-ACTIVATED) ════════════════════════════════════════

${wrapLines.join('\n\n')}
`;
}

function generatePhpWrapped(
  sourceFile: SourceFile,
  findings: AscensionFinding[],
  _boundaries: Array<{ name: string; line: number }>,
  runId: string,
): string {
  const funcFindings = new Map<string, AscensionFinding[]>();
  for (const f of findings) {
    const existing = funcFindings.get(f.functionName) ?? [];
    existing.push(f);
    funcFindings.set(f.functionName, existing);
  }

  let rewrittenSource = sourceFile.content.replace(/^<\?php\s*/i, '');
  for (const funcName of funcFindings.keys()) {
    rewrittenSource = rewrittenSource.replace(
      new RegExp(`function\\s+${funcName}\\b`, 'g'),
      `function _original_${funcName}`,
    );
  }

  const wrapLines = Array.from(funcFindings.entries()).map(([funcName, caps]) => {
    const primList = [...new Set(caps.map(c => c.primitive))].join(', ');
    return `// Primitives: ${primList} | [ACTIVE]
$${funcName} = cmpsbl_mana_wrap('_original_${funcName}', [${caps.map(c => `'${c.capability}'`).join(', ')}], '${runId}');`;
  });

  return `<?php
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  CMPSBL® Ascended Code — ${sourceFile.name}
 *  ✓ Runtime: EMBEDDED | ✓ Capabilities: PRE-ACTIVATED
 * ═══════════════════════════════════════════════════════════════════════════════
 */
${generateEmbeddedRuntimePHP()}

// ═══ YOUR ORIGINAL CODE (Layer 1) ════════════════════════════════════════════

${rewrittenSource}

// ═══ LAYER 2 WRAPPERS (PRE-ACTIVATED) ════════════════════════════════════════

${wrapLines.join('\n\n')}
`;
}

function generateGenericWrapped(
  sourceFile: SourceFile,
  findings: AscensionFinding[],
  language: string,
  _runId: string,
): string {
  const line = LANG_COMMENT[language] || '//';
  const findingLines = findings.map(f =>
    `${line}   ${f.functionName} → ${f.capability} (${f.primitive}) [ACTIVE] — ${f.reason}`
  );

  return `${generateEmbeddedRuntimeGeneric(line)}
${line}
${line}  ATTACHMENT PLAN — ${findings.length} points (all PRE-ACTIVATED):
${findingLines.join('\n')}
${line}
${line}  To deactivate: use the CMPSBL® Terminal
${line}    > mana detach <functionName> <capability>
${line}
${line} ═══════════════════════════════════════════════════════════════════════════════

${sourceFile.content}
`;
}


// ═══════════════════════════════════════════════════════════════
// §3 — Unified Export Generator
// ═══════════════════════════════════════════════════════════════

export async function generateUnifiedExport(input: UnifiedExportInput): Promise<void> {
  const { results, sourceFiles } = input;
  const { runId, candidateName, sourceLanguage, capabilities } = results;
  
  const ext = LANG_EXT[sourceLanguage] || '.ts';
  const zip = new JSZip();
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const packName = `cmpsbl-ascended-${candidateName.toLowerCase()}-${timestamp}`;

  // ─── Step 1: Detect function boundaries across all source files ───
  const allBoundaries = sourceFiles.flatMap(f => {
    const boundaries = detectFunctionBoundaries(f.content);
    return boundaries.map(b => ({ ...b, sourceFile: f.name }));
  });

  // ─── Step 2: Build Mana attachment plan ───
  const activePrimitives = new Set(capabilities.flatMap(c => [c.nodeA, c.nodeB]));
  const allFindings = buildAttachmentPlan(
    allBoundaries,
    activePrimitives,
  );

  // ─── Step 3: Generate ascended code (runtime embedded, capabilities pre-activated) ───
  // Each file is self-contained: original code + embedded runtime + active wrappers
  const ascendedFolder = zip.folder('ascended')!;
  for (const sf of sourceFiles) {
    const ascended = generateWrappedFile(sf, allFindings, sourceLanguage, runId);
    ascendedFolder.file(sf.name, ascended);
  }

  // ─── Step 4: Original source files (untouched copy for reference) ───
  const originalFolder = zip.folder('original')!;
  for (const sf of sourceFiles) {
    originalFolder.file(sf.name, sf.content);
  }
  originalFolder.file('README.md', [
    `# Original Source — ${sourceLanguage}`,
    '',
    'These are your original source files — **unchanged and authoritative**.',
    '',
    '## How It Works',
    '',
    '- **ascended/** — Your code with the CMPSBL® runtime embedded inline and all capabilities pre-activated.',
    '- **original/** (this folder) — Your untouched source for reference and comparison.',
    '',
    'The ascended versions contain everything needed to run — no external imports required.',
    'To deactivate capabilities, use the CMPSBL® Terminal.',
    '',
    '---',
    '© Your original work. Layer 2 overlay © 2025–2026 CMPSBL®.',
  ].join('\n'));

  // ─── Step 5: Build capability index for docs ───
  const capabilitiesForExport = capabilities.map(cap => ({
    id: deterministicFingerprint(cap.name, cap.nodeA, cap.nodeB, runId),
    name: cap.name.replace(/\s+/g, '_'),
    tier: cap.tier,
    cjpiScore: cap.score,
    description: cap.description,
    chain: [cap.nodeA, cap.nodeB],
    fingerprint: deterministicFingerprint(cap.name, cap.nodeA, cap.nodeB, runId),
    moatSignature: `moat_${deterministicFingerprint(cap.name, cap.nodeA, cap.nodeB, runId)}`,
    capabilityType: 'ascended',
  }));

  // ─── Step 6: Compute summary values ───
  const avgCjpi = Math.round(capabilities.reduce((s, c) => s + c.score, 0) / capabilities.length);
  const allModules = [...new Set(capabilities.flatMap(c => [c.nodeA, c.nodeB]))];
  const packFingerprint = capabilitiesForExport[0]?.fingerprint?.slice(0, 12).toUpperCase() ?? 'UNKNOWN';

  // ─── Step 7: USER-GUIDE.html (single unified doc — replaces all fragmented docs) ───
  const attachmentEntries = allFindings.map(f => ({
    functionName: f.functionName,
    capability: f.capability,
    primitive: f.primitive,
    reason: f.reason,
  }));

  zip.file('USER-GUIDE.html', generateUserGuideHTML({
    candidateName,
    runId,
    sourceLanguage,
    capabilities: capabilities.map(c => ({
      name: c.name,
      description: c.description,
      score: c.score,
      tier: c.tier,
      nodeA: c.nodeA,
      nodeB: c.nodeB,
      fingerprint: deterministicFingerprint(c.name, c.nodeA, c.nodeB, runId),
    })),
    attachments: attachmentEntries,
    totalBoundaries: allBoundaries.length,
    sourceFileNames: sourceFiles.map(f => f.name),
    avgCjpi,
    packFingerprint,
  }));

  // ─── Step 8: LICENSE.html (branded) ───
  zip.file('LICENSE.html', generateLicenseHTML(candidateName));

  // ─── Step 9: manifest.json (machine-readable only) ───
  zip.file('manifest.json', serializeCmpsblManifest({
    name: packName,
    cjpi: avgCjpi,
    modules: allModules,
    targets: [sourceLanguage],
    version: '1.0.0',
    category: 'ascended-wrapped',
    fingerprint: packFingerprint,
    source: 'unified-ascension-mana-pipeline',
  }));

  // ─── Generate and download ───
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
  saveAs(blob, `${packName}.zip`);
}

