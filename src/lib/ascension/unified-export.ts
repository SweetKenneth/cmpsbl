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
  serializeAttachmentPlan,
} from '@/lib/mana/findings-bridge';
import { generateManaActivationArtifacts } from '@/lib/capability-lifecycle/mana-bridge';
import {
  buildAscensionLifecycleArtifacts,
} from '@/lib/capability-lifecycle/export-bridge';
import { generateUnifiedCapabilityFile, getUnifiedFilename } from '@/lib/export/unified-capability-file';
import { generateLicenseHTML, generateReadmeHTML } from '@/lib/export/elegant-html-docs';
import { generatePipelineDetailsHTML } from '@/lib/export/pipeline-details-page';
import { humanizeCapabilityName } from '@/lib/export/humanize-name';
import { serializeCmpsblManifest } from '@/lib/export/cmpsbl-manifest';
import { estimateMarketValue, formatMarketValue, getTierFromScore } from '@/lib/pipeline-valuation';
import type { AscensionResults, DiscoveredCapability } from './orchestrator';
import { deterministicFingerprint } from './orchestrator';
import type { ManaCapability, AscensionFinding, AttachmentPoint, ManaManifest } from '@/lib/mana/types';

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

/**
 * Generate Mana-wrapped version of a single source file.
 * Produces a new file that imports the original and wraps detected functions
 * with Layer 2 capabilities — exactly as Mana does at runtime, but static.
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
    return `${line} ═══════════════════════════════════════════════════════
${line}  CMPSBL® Layer 2 Wrapper — ${sourceFile.name}
${line}  No attachment points detected in this file.
${line}  Original code passes through unchanged.
${line} ═══════════════════════════════════════════════════════
${line}
${line}  Re-export everything from the original file.
${line}  Mana found no function boundaries requiring wrapping.

export * from '../original/${sourceFile.name.replace(/\.[^.]+$/, '')}';
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

  // Generic — structured header + findings manifest
  return generateGenericWrapped(sourceFile, fileFindings, language, runId);
}

function generateTypeScriptWrapped(
  sourceFile: SourceFile,
  findings: AscensionFinding[],
  boundaries: Array<{ name: string; line: number }>,
  runId: string,
): string {
  const modName = sourceFile.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_$]/g, '_');
  
  // Group findings by function
  const funcFindings = new Map<string, AscensionFinding[]>();
  for (const f of findings) {
    const existing = funcFindings.get(f.functionName) ?? [];
    existing.push(f);
    funcFindings.set(f.functionName, existing);
  }

  const wrapperBlocks: string[] = [];
  for (const [funcName, caps] of funcFindings) {
    const capList = caps.map(c => `'${c.capability}'`).join(', ');
    const primList = [...new Set(caps.map(c => c.primitive))].join(', ');
    
    wrapperBlocks.push(`
// ── ${funcName} ──
// Primitives: ${primList}
// Capabilities: ${caps.map(c => c.capability).join(', ')}
// Reason: ${caps[0].reason}
export const ${funcName} = manaWrap(
  original.${funcName} as (...args: unknown[]) => unknown,
  '${funcName}',
  [${capList}],
  '${runId}',
);`);
  }

  // Re-export non-wrapped items
  const wrappedNames = new Set(funcFindings.keys());
  const passthroughBoundaries = boundaries.filter(b => !wrappedNames.has(b.name));

  return `// ═══════════════════════════════════════════════════════════════════════════════
//  CMPSBL® Layer 2 — Mana-Wrapped: ${sourceFile.name}
//  U.S. Patent App. Nos. 64/029,678 & 64/031,637
//
//  This file wraps your original code with Layer 2 capabilities.
//  Your original source is NEVER modified — it lives in ../original/
//
//  Wrapped functions: ${wrappedNames.size}
//  Passthrough functions: ${passthroughBoundaries.length}
//  Total attachment points: ${findings.length}
// ═══════════════════════════════════════════════════════════════════════════════

import * as original from '../original/${modName}';
import { manaWrap, type ManaWrapConfig } from '../cmpsbl';

// ═══ MANA WRAPPER CONFIG ═══
// Each wrapped function gets Layer 2 capabilities attached at the function boundary.
// The original function executes first (Layer 1), then Layer 2 observes/enriches/protects.

${wrapperBlocks.join('\n')}

// ═══ PASSTHROUGH — These functions pass through unwrapped ═══
${passthroughBoundaries.map(b => `export const ${b.name} = original.${b.name};`).join('\n')}

// ═══ Re-export all other bindings from original ═══
export { default } from '../original/${modName}';
`;
}

function generatePythonWrapped(
  sourceFile: SourceFile,
  findings: AscensionFinding[],
  _boundaries: Array<{ name: string; line: number }>,
  runId: string,
): string {
  const modName = sourceFile.name.replace(/\.py$/i, '');
  
  const funcFindings = new Map<string, AscensionFinding[]>();
  for (const f of findings) {
    const existing = funcFindings.get(f.functionName) ?? [];
    existing.push(f);
    funcFindings.set(f.functionName, existing);
  }

  const wrapLines = Array.from(funcFindings.entries()).map(([funcName, caps]) => {
    const primList = [...new Set(caps.map(c => c.primitive))].join(', ');
    return `# Primitives: ${primList} | Reason: ${caps[0].reason}
${funcName} = mana_wrap(original_module.${funcName}, '${funcName}', [${caps.map(c => `'${c.capability}'`).join(', ')}], '${runId}')`;
  });

  return `"""
═══════════════════════════════════════════════════════════════════════════════
 CMPSBL® Layer 2 — Mana-Wrapped: ${sourceFile.name}
 U.S. Patent App. Nos. 64/029,678 & 64/031,637

 This file wraps your original code with Layer 2 capabilities.
 Your original source is NEVER modified — it lives in ../original/
═══════════════════════════════════════════════════════════════════════════════
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
import importlib
from cmpsbl import mana_wrap

original_module = importlib.import_module('original.${modName}')

# ═══ MANA-WRAPPED FUNCTIONS ═══

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

  const wrapLines = Array.from(funcFindings.entries()).map(([funcName, caps]) => {
    const primList = [...new Set(caps.map(c => c.primitive))].join(', ');
    return `// Primitives: ${primList} | Reason: ${caps[0].reason}
$${funcName} = cmpsbl_mana_wrap('${funcName}', [${caps.map(c => `'${c.capability}'`).join(', ')}], '${runId}');`;
  });

  return `<?php
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  CMPSBL® Layer 2 — Mana-Wrapped: ${sourceFile.name}
 *  U.S. Patent App. Nos. 64/029,678 & 64/031,637
 * ═══════════════════════════════════════════════════════════════════════════════
 */

require_once __DIR__ . '/../cmpsbl.php';
require_once __DIR__ . '/../original/${sourceFile.name}';

// ═══ MANA-WRAPPED FUNCTIONS ═══

${wrapLines.join('\n\n')}
`;
}

function generateGenericWrapped(
  sourceFile: SourceFile,
  findings: AscensionFinding[],
  language: string,
  runId: string,
): string {
  const line = LANG_COMMENT[language] || '//';
  const findingLines = findings.map(f =>
    `${line}   ${f.functionName} → ${f.capability} (${f.primitive}) — ${f.reason}`
  );

  return `${line} ═══════════════════════════════════════════════════════════════════════════════
${line}  CMPSBL® Layer 2 — Mana-Wrapped: ${sourceFile.name}
${line}  Run ID: ${runId}
${line}  
${line}  ATTACHMENT PLAN — ${findings.length} attachment points:
${findingLines.join('\n')}
${line}
${line}  Import your original file and wrap each function listed above
${line}  with the corresponding capability from cmpsbl.*.
${line} ═══════════════════════════════════════════════════════════════════════════════
`;
}

// ═══════════════════════════════════════════════════════════════
// §2 — Mana Manifest Builder (for lifecycle bridge)
// ═══════════════════════════════════════════════════════════════

function buildManaManifest(
  findings: AscensionFinding[],
  packageName: string,
  _runId: string,
): ManaManifest {
  const attachmentPoints: AttachmentPoint[] = findings.map((f, i) => ({
    functionName: f.functionName,
    capability: f.capability as ManaCapability,
    phase: WrapperPhase.OBSERVE,
    position: i,
    active: true,
    invocations: 0,
    blocked: 0,
    observed: 0,
  }));

  return {
    hostPackage: packageName,
    hostVersion: '1.0.0',
    attachmentState: 'symbiotic' as AttachmentState,
    attachmentPoints,
    lexRules: [],
    proof: null,
    telemetry: [],
    attachedAt: Date.now(),
    detachedAt: null,
    layerDepth: 1,
  };
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

  // ─── Step 3: Generate wrapped code per source file ───
  const wrappedFolder = zip.folder('wrapped')!;
  for (const sf of sourceFiles) {
    const wrapped = generateWrappedFile(sf, allFindings, sourceLanguage, runId);
    wrappedFolder.file(
      sf.name.replace(/\.[^.]+$/, `_wrapped${ext}`),
      wrapped,
    );
  }

  // ─── Step 4: Original source files (untouched) ───
  const originalFolder = zip.folder('original')!;
  for (const sf of sourceFiles) {
    originalFolder.file(sf.name, sf.content);
  }
  originalFolder.file('README.md', [
    `# Original Source — ${sourceLanguage}`,
    '',
    'These are your original source files — **unchanged and authoritative**.',
    '',
    '## Dual-Layer Architecture',
    '',
    '- **Layer 1** (this folder) — Your original code. Never modified.',
    '- **Layer 2** (../wrapped/) — CMPSBL Mana wrappers. Observe, enrich, protect.',
    '',
    'The wrapped versions import from this folder and attach capabilities',
    'at function boundaries without touching your source.',
    '',
    '---',
    '© Your original work. Layer 2 overlay © 2025–2026 CMPSBL®.',
  ].join('\n'));

  // ─── Step 5: Unified runtime (cmpsbl.*) ───
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

  const userSourceFiles = sourceFiles.map(f => ({
    name: f.name,
    extension: ext,
    language: sourceLanguage,
    content: f.content,
  }));

  const unifiedCode = generateUnifiedCapabilityFile(
    capabilitiesForExport, packName, sourceLanguage, userSourceFiles,
  );
  const unifiedFilename = getUnifiedFilename(sourceLanguage);
  zip.file(unifiedFilename, unifiedCode);

  // ─── Step 6: Activation Guide (lifecycle bridge) ───
  const manaManifest = buildManaManifest(allFindings, candidateName, runId);
  const fingerprintId = deterministicFingerprint(candidateName, 'MANA', 'ASCENSION', runId);

  const activationArtifacts = generateManaActivationArtifacts(
    manaManifest,
    fingerprintId,
    sourceLanguage,
  );

  const docsFolder = zip.folder('docs')!;
  docsFolder.file('ACTIVATION-GUIDE.html', activationArtifacts.guideHtml);
  docsFolder.file('activation-ledger.json', activationArtifacts.ledgerJson);

  // ─── Step 7: Attachment Plan (findings manifest) ───
  const serializedPlan = serializeAttachmentPlan(allFindings);
  docsFolder.file('attachment-plan.json', JSON.stringify({
    runId,
    candidateName,
    sourceLanguage,
    totalBoundaries: allBoundaries.length,
    totalAttachments: allFindings.length,
    attachments: serializedPlan,
    generatedAt: new Date().toISOString(),
  }, null, 2));

  // ─── Step 8: Standard docs ───
  const avgCjpi = Math.round(capabilities.reduce((s, c) => s + c.score, 0) / capabilities.length);
  const topCap = capabilities.reduce((a, b) => a.score > b.score ? a : b);
  const allModules = [...new Set(capabilities.flatMap(c => [c.nodeA, c.nodeB]))];
  const totalValue = capabilitiesForExport.reduce((sum, c) =>
    sum + estimateMarketValue(c.cjpiScore, c.category || 'general', c.chain.length), 0);

  // Manifest
  zip.file('manifest.json', serializeCmpsblManifest({
    name: packName,
    cjpi: avgCjpi,
    modules: allModules,
    targets: [sourceLanguage],
    version: '1.0.0',
    category: 'ascended-wrapped',
    fingerprint: capabilitiesForExport[0]?.fingerprint?.slice(0, 12).toUpperCase(),
    source: 'unified-ascension-mana-pipeline',
  }));

  // README.html
  zip.file('README.html', generateReadmeHTML({
    name: candidateName,
    description: `Ascended & Wrapped Pack · ${capabilities.length} capabilities · ${sourceLanguage.toUpperCase()} · Est. ${formatMarketValue(totalValue)}`,
    category: 'Unified Ascension + Mana',
    modules: allModules,
    files: [
      { name: 'wrapped/', purpose: 'Mana-wrapped versions of your code with Layer 2 capabilities attached' },
      { name: 'original/', purpose: 'Your original source files (unchanged, authoritative)' },
      { name: unifiedFilename, purpose: 'Single-file runtime — Convex Core™ + Effects + Bridge (drop-in)' },
      { name: 'docs/ACTIVATION-GUIDE.html', purpose: 'Per-primitive integration and activation instructions' },
      { name: 'docs/attachment-plan.json', purpose: 'Mana attachment plan — function-to-capability mapping' },
      { name: 'docs/activation-ledger.json', purpose: 'Capability lifecycle ledger with full provenance' },
      { name: 'PIPELINE-DETAILS.html', purpose: 'Per-capability technical dossier with valuation' },
      { name: 'LICENSE.html', purpose: 'CMPSBL® Commercial Distribution License' },
      { name: 'manifest.json', purpose: 'Pack metadata and capability registry' },
      { name: 'PROOF.txt', purpose: 'Cryptographic verification certificate' },
    ],
    quickStart: [
      `// Wrapped code: import from wrapped/ to get Layer 2 capabilities`,
      `import { yourFunction } from './wrapped/${sourceFiles[0]?.name.replace(/\.[^.]+$/, '_wrapped') || 'module'}';`,
      ``,
      `// Or use the unified runtime directly:`,
      `import { execute, executeChain } from './${unifiedFilename.replace(/\.[^.]+$/, '')}';`,
      `const result = execute('${topCap.name.replace(/\s+/g, '_')}', { query: 'hello' });`,
    ].join('\n'),
  }));

  // LICENSE
  zip.file('LICENSE.html', generateLicenseHTML(candidateName));
  zip.file('LICENSE', generateLicenseText());

  // PIPELINE-DETAILS
  try {
    zip.file('PIPELINE-DETAILS.html', generatePipelineDetailsHTML({
      name: humanizeCapabilityName(topCap.name, [topCap.nodeA, topCap.nodeB], 'general'),
      description: `${capabilities.length} capabilities discovered and wrapped`,
      category: 'general',
      score: avgCjpi,
      tier: getTierFromScore(avgCjpi),
      systemChain: allModules,
      exportLanguages: [sourceLanguage],
      source: 'Unified Ascension + Mana Pipeline',
    }));
  } catch {
    // Supplementary — non-fatal
  }

  // PROOF.txt
  const { generateProofCertificate } = await import('@/lib/export/proof-certificate');
  zip.file('PROOF.txt', generateProofCertificate({
    serial: packName,
    fingerprint: capabilitiesForExport[0]?.fingerprint?.slice(0, 12).toUpperCase() ?? 'UNKNOWN',
    tier: getTierFromScore(avgCjpi),
    cjpi: avgCjpi,
    primitives: allModules,
    source: 'CMPSBL® Unified Ascension + Mana',
    language: sourceLanguage,
  }));

  // ─── Generate and download ───
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
  saveAs(blob, `${packName}.zip`);
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function generateLicenseText(): string {
  return `CMPSBL® SOFTWARE LICENSE
========================

Copyright (c) 2025–2026 CMPSBL®. All rights reserved.

This Ascended & Wrapped Pack was generated by the CMPSBL® Unified Pipeline
combining Ascension (U.S. App. No. 64/029,678) and Mana (U.S. App. No. 64/031,637).

GRANT OF LICENSE:
Subject to the terms of this license, you are granted a non-exclusive,
non-transferable license to use the enclosed software capabilities,
Mana-wrapped code, and Convex Core™ Processing Layer in your own projects.

RESTRICTIONS:
1. You may not redistribute the Convex Core™ Processing Layer as a standalone product.
2. You may not reverse-engineer the discovery or wrapping algorithms.
3. You may not claim independent creation of the capability patterns herein.
4. The Convex Core™ and Mana Layer 2 wrappers are sealed proprietary components.

PROPRIETARY NOTICE:
The structural fingerprints, attachment plans, and CJPI scores embedded in this
pack are the intellectual property of the originating substrate instance.

DISCLAIMER:
THIS SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.

CMPSBL® and Convex Core™ are trademarks of CMPSBL.
`;
}
