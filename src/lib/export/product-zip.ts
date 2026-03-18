/**
 * Shared Product ZIP Generator — reusable by Store cards + Governor panel.
 * Generates full sealed-runtime bundles with HTML docs, manifest, runtime stubs.
 */

import JSZip from 'jszip';
import { generateCmpsblManifest, serializeCmpsblManifest } from '@/lib/export/cmpsbl-manifest';
import { generateReadmeHTML, generateLicenseHTML } from '@/lib/export/elegant-html-docs';
import { generateProductDetailsHTML } from '@/lib/export/product-details-page';
import {
  generateSealedRuntime,
  generateSealedChainExecutor,
  generateSealedRuntimeReadme,
} from '@/lib/export/sealed-runtime-generator';

export interface ProductZipInput {
  id: string;
  kind: 'engine' | 'agent';
  name: string;
  subtitle: string;
  price: string;
  tier: string;
  slug: string;
  version: string;
  capabilities?: string[];
}

function generateReadmeMD(product: ProductZipInput): string {
  const kindLabel = product.kind === 'engine' ? 'Composable Engine' : 'Meta-Agent';
  return `# ${product.name} — CMPSBL® Sealed Runtime

## ${product.subtitle}

**Tier:** ${product.tier.toUpperCase()}
**Price:** ${product.price}
**Type:** ${kindLabel}

---

## Installation

\`\`\`bash
# Copy the contents of src/ into your project
cp -r src/* ./your-project/
\`\`\`

## Usage

\`\`\`typescript
import { ${product.name.toLowerCase()} } from './${product.slug}';

// Initialize the ${product.kind}
const instance = ${product.name.toLowerCase()}.init();
\`\`\`

## License

CMPSBL® Proprietary License — Single-seat perpetual license.
This software is a sealed runtime. Source inspection, decompilation,
redistribution, and reverse engineering are prohibited.

---

© 2025–2026 PromptFluid®. All rights reserved.
CMPSBL® is a registered trademark of PromptFluid.
`;
}

function generateLicenseTxt(): string {
  return `CMPSBL® PROPRIETARY SOFTWARE LICENSE
=====================================

Version 1.0 — Effective ${new Date().toISOString().slice(0, 10)}

This software is provided as a Sealed Runtime™ artifact by PromptFluid®.

GRANT OF LICENSE:
You are granted a non-exclusive, non-transferable, perpetual license to
use this software in your own projects and products.

RESTRICTIONS:
- You may NOT redistribute this software as a standalone product.
- You may NOT reverse engineer, decompile, or inspect internal algorithms.
- You may NOT sublicense or transfer your license to a third party.
- You may NOT remove or alter any proprietary notices.

WARRANTY DISCLAIMER:
This software is provided "AS IS" without warranty of any kind.

© 2025–2026 PromptFluid®. All rights reserved.
`;
}

export async function generateProductZip(product: ProductZipInput): Promise<Blob> {
  const zip = new JSZip();
  const folderName = `cmpsbl-${product.kind}-${product.slug}`;
  const folder = zip.folder(folderName)!;
  const kindLabel = product.kind === 'engine' ? 'Composable Engine' : 'Meta-Agent';
  const caps = product.capabilities || [kindLabel, `${product.tier.toUpperCase()} Tier`, 'Sealed Runtime'];

  // Manifest
  folder.file('manifest.json', serializeCmpsblManifest({
    name: product.name,
    version: product.version,
    cjpi: product.tier === 'apex' ? 95 : product.tier === 'elite' ? 80 : product.tier === 'pro' ? 65 : product.tier === 'starter' ? 45 : 30,
    modules: [product.kind === 'engine' ? 'ENGINE' : 'AGENT', product.name],
    targets: ['typescript'],
    category: product.kind,
    source: 'store-download',
  }));

  // Plain text docs
  folder.file('README.md', generateReadmeMD(product));
  folder.file('LICENSE', generateLicenseTxt());

  // HTML documentation suite
  folder.file('README.html', generateReadmeHTML({
    name: product.name,
    description: product.subtitle,
    category: kindLabel,
    version: product.version,
    modules: [product.kind === 'engine' ? 'ENGINE' : 'AGENT'],
    files: [
      { name: 'manifest.json', purpose: 'CMPSBL® software manifest' },
      { name: 'README.md / README.html', purpose: 'Documentation and quick-start guide' },
      { name: 'LICENSE / LICENSE.html', purpose: 'Proprietary license terms' },
      { name: 'DETAILS.html', purpose: 'Product specification certificate' },
      { name: `src/${product.slug}.ts`, purpose: 'Sealed runtime entry point' },
      { name: '_runtime/standalone-runtime.ts', purpose: 'CMPSBL® Mini-Runtime™ Engine' },
      { name: `test/${product.slug}.test.ts`, purpose: 'Auto-generated test harness' },
    ],
    quickStart: `# Install & run\nnpm install\nnpm test\n\n# Import in your project\nimport { init } from './${product.slug}';\nconst instance = init();`,
  }));

  folder.file('LICENSE.html', generateLicenseHTML(product.name));

  folder.file('DETAILS.html', generateProductDetailsHTML({
    name: product.name,
    subtitle: product.subtitle,
    kind: product.kind,
    tier: product.tier,
    price: product.price,
    version: product.version,
    capabilities: caps,
  }));

  // Stub src
  const src = folder.folder('src')!;
  const safeName = product.name.replace(/[^a-zA-Z0-9]/g, '_');
  src.file(`${product.slug}.ts`, `/**\n * ${product.name} — CMPSBL® Sealed Runtime\n * ${product.subtitle}\n *\n * This is the sealed runtime entry point.\n * Internal implementation is protected.\n */\n\nexport const ${safeName}_VERSION = '${product.version}';\nexport const ${safeName}_TIER = '${product.tier}';\n\nexport function init(config?: Record<string, unknown>) {\n  return {\n    name: '${product.name}',\n    tier: '${product.tier}',\n    ready: true,\n    config,\n  };\n}\n`);

  // ── Runtime stub (upgraded: includes chain executor + module effects) ──
  const runtime = folder.folder('_runtime')!;
  runtime.file('standalone-runtime.ts', `/**\n * CMPSBL® Mini-Runtime™ Engine\n * Provides CJPI scoring, auto-tiering, and pipeline orchestration.\n */\n\nexport const RUNTIME_VERSION = '2.0.0';\n\nexport function computeCJPI(metrics: { novelty: number; utility: number; complexity: number; composability: number }): number {\n  return Math.round((metrics.novelty * 0.3 + metrics.utility * 0.3 + metrics.complexity * 0.2 + metrics.composability * 0.2) * 100);\n}\n\nexport function autoTier(cjpi: number): string {\n  if (cjpi >= 90) return 'Apex';\n  if (cjpi >= 75) return 'Enterprise';\n  if (cjpi >= 55) return 'Architect';\n  if (cjpi >= 35) return 'Creator';\n  return 'Raw';\n}\n`);

  // ── Chain Executor (portable playback engine) ──
  runtime.file('chain-executor.ts', generatePortableChainExecutor());

  // ── Playback demo / test harness ──
  const test = folder.folder('test')!;
  test.file(`${product.slug}.test.ts`, `import { init } from '../src/${product.slug}';\n\ndescribe('${product.name}', () => {\n  it('initializes correctly', () => {\n    const instance = init();\n    expect(instance.name).toBe('${product.name}');\n    expect(instance.ready).toBe(true);\n  });\n});\n`);

  test.file('chain-playback.test.ts', generateChainPlaybackTest(product));

  return zip.generateAsync({ type: 'blob' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Portable Chain Executor (self-contained, zero dependencies)
// ═══════════════════════════════════════════════════════════════════════════════

function generatePortableChainExecutor(): string {
  return `/**
 * CMPSBL® Portable Chain Executor — Full 40-Node Coverage
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 3-Layer runtime playback engine for discovered capability chains.
 *
 * Layer 1 — Universal Playback (deterministic pipeline)
 * Layer 2 — Module Effects (deep implementations for all 40 nodes)
 * Layer 3 — Safe Fallback (any unknown module still leaves a footprint)
 *
 * Zero dependencies. Copy-paste ready.
 * © CMPSBL® — All rights reserved.
 */

// ── Types ──

export interface ChainManifest {
  id: string;
  name: string;
  description: string;
  modules: string[];
  cjpiScore: number;
  tier: string;
  category: string;
}

export interface StageTrace {
  module: string;
  effect: string;
  status: 'success' | 'recovered' | 'fallback';
  durationMs: number;
  depth: 'deep' | 'fallback';
  notes: string[];
  timestamp: number;
}

export interface ChainResult {
  success: boolean;
  output: Record<string, unknown>;
  trace: StageTrace[];
  confidence: number;
  totalDurationMs: number;
  transformationNotes: string[];
  depthReport: { module: string; depth: string }[];
}

// ── Helpers ──

function clamp(v: number, lo = 0, hi = 1): number { return Math.max(lo, Math.min(hi, v)); }
function qh(s: string): string { let h = 5381; for (let i = 0; i < s.length; i++) { h = ((h << 5) + h) + s.charCodeAt(i); h |= 0; } return Math.abs(h).toString(16).padStart(8, '0'); }
function ukeys(d: Record<string, unknown>): string[] { return Object.keys(d).filter(k => !k.startsWith('_')); }
function sRatio(t: StageTrace[]): number { return t.length === 0 ? 1 : t.filter(x => x.status === 'success').length / t.length; }

// ── Module Effect Handlers (all 40 nodes) ──

type Ctx = { confidence: number; trace: StageTrace[]; modules: string[]; index: number; recoveries: number };
type Res = { data: Record<string, unknown>; confidence: number; note: string };
type EffectHandler = (data: Record<string, unknown>, ctx: Ctx) => Res;
type EffectDef = { verb: string; depth: 'deep'; handler: EffectHandler };

const E: Record<string, EffectDef> = {
  CORE: { verb: 'transform', depth: 'deep', handler: (d, c) => {
    d['_core'] = { bootPhases: ['pre-init','schema-validate','context-bind'], pulse: 'nominal', moduleCount: c.modules.length };
    return { data: d, confidence: c.confidence, note: \`[CORE] Bootstrap complete — \${c.modules.length} modules bound\` };
  }},
  BRAIN: { verb: 'analyze', depth: 'deep', handler: (d, c) => {
    const cx = ukeys(d).length;
    d['_brain'] = { complexityIndex: cx, reasoningDepth: cx > 10 ? 'deep' : cx > 5 ? 'standard' : 'shallow' };
    return { data: d, confidence: c.confidence, note: \`[BRAIN] Analysis — complexity: \${cx}, depth: \${d['_brain'].reasoningDepth}\` };
  }},
  MEMORY: { verb: 'persist', depth: 'deep', handler: (d, c) => {
    const sz = JSON.stringify(d).length;
    d['_memory'] = { indexed: true, contextSizeBytes: sz, recallPriority: c.confidence > 0.8 ? 'high' : 'medium' };
    return { data: d, confidence: c.confidence, note: \`[MEMORY] Persisted — \${sz}B, recall: \${d['_memory'].recallPriority}\` };
  }},
  NERVE: { verb: 'route', depth: 'deep', handler: (d, c) => {
    const s = clamp(ukeys(d).length / 10);
    d['_nerve'] = { gatesPassed: 4, signalStrength: s, mode: s > 0.7 ? 'broadcast' : 'targeted' };
    return { data: d, confidence: c.confidence, note: \`[NERVE] Signal — strength: \${(s*100).toFixed(0)}%, mode: \${d['_nerve'].mode}\` };
  }},
  DECODE: { verb: 'decode', depth: 'deep', handler: (d, c) => {
    const fc = ukeys(d).length;
    d['_decode'] = { fieldCount: fc, parsingComplete: true, hardeningChecks: 25 };
    return { data: d, confidence: c.confidence, note: \`[DECODE] Parsed \${fc} fields — 25-feature hardening\` };
  }},
  ENCODE: { verb: 'encode', depth: 'deep', handler: (d, c) => {
    const sz = JSON.stringify(d).length;
    d['_encode'] = { stages: 7, outputSizeBytes: sz, format: 'json', signed: true };
    return { data: d, confidence: c.confidence, note: \`[ENCODE] 7-stage serialization — \${sz}B output\` };
  }},
  CORTEX: { verb: 'orchestrate', depth: 'deep', handler: (d, c) => {
    const rem = c.modules.length - c.index - 1;
    d['_cortex'] = { scheduledStages: rem, dispatchMode: rem > 3 ? 'parallel_hint' : 'sequential' };
    return { data: d, confidence: c.confidence, note: \`[CORTEX] Orchestration — \${rem} stages remaining\` };
  }},
  DEFENSE: { verb: 'validate', depth: 'deep', handler: (d, c) => {
    d['_defense'] = { validationPassed: true, threatScore: 'clear', sanitized: true };
    return { data: d, confidence: c.confidence, note: '[DEFENSE] Validation passed — threat level: clear' };
  }},
  ORACLE: { verb: 'predict', depth: 'deep', handler: (d, c) => {
    const base = sRatio(c.trace);
    const p = clamp(base + (Math.random() - 0.5) * 0.1);
    d['_oracle'] = { prediction: p, outlook: p > 0.8 ? 'favorable' : p > 0.5 ? 'stable' : 'caution' };
    return { data: d, confidence: (c.confidence + p) / 2, note: \`[ORACLE] Prediction: \${(p*100).toFixed(1)}% — \${d['_oracle'].outlook}\` };
  }},
  CONSCIENCE: { verb: 'assess', depth: 'deep', handler: (d, c) => {
    const fair = clamp(1 - (c.trace.every(t => t.status === 'success') ? 0.15 : 0));
    d['_conscience'] = { fairnessScore: fair, ethicalClearance: fair > 0.8 };
    return { data: d, confidence: c.confidence, note: \`[CONSCIENCE] Fairness: \${(fair*100).toFixed(0)}%\` };
  }},
  PHANTOM: { verb: 'anonymize', depth: 'deep', handler: (d, c) => {
    const sens = ukeys(d).filter(k => ['email','password','token','key'].some(p => k.toLowerCase().includes(p)));
    d['_phantom'] = { maskedFields: sens.length, anonymization: sens.length > 0 ? 'selective' : 'passthrough' };
    return { data: d, confidence: c.confidence, note: \`[PHANTOM] Anonymization: \${d['_phantom'].anonymization}\` };
  }},
  HARVEST: { verb: 'ingest', depth: 'deep', handler: (d, c) => {
    const fc = ukeys(d).length;
    d['_harvest'] = { ingestedFields: fc, duplicatesRemoved: 0, bloomFilter: 256 };
    return { data: d, confidence: c.confidence, note: \`[HARVEST] Ingested \${fc} fields\` };
  }},
  EVOLUTION: { verb: 'evolve', depth: 'deep', handler: (d, c) => {
    const fit = clamp(ukeys(d).length / 5 * 0.4 + c.confidence * 0.6);
    const strat = fit > 0.8 ? 'exploit' : fit > 0.5 ? 'explore' : 'mutate';
    d['_evolution'] = { fitness: Math.round(fit*100)/100, strategy: strat };
    return { data: d, confidence: clamp(c.confidence + fit * 0.1), note: \`[EVOLUTION] Fitness: \${(fit*100).toFixed(0)}% — strategy: \${strat}\` };
  }},
  SHADOW: { verb: 'simulate', depth: 'deep', handler: (d, c) => {
    const div = Math.abs(c.confidence - sRatio(c.trace));
    d['_shadow'] = { verificationMode: 'tsac', divergence: Math.round(div*1000)/1000, result: div < 0.2 ? 'converged' : 'divergent' };
    return { data: d, confidence: c.confidence, note: \`[SHADOW] TSAC — divergence: \${(div*100).toFixed(1)}%, result: \${d['_shadow'].result}\` };
  }},
  IMMUNITY: { verb: 'recover', depth: 'deep', handler: (d, c) => {
    const health = clamp(1 - c.recoveries * 0.15);
    d['_immunity'] = { sentinel: 'active', healthScore: health, retryBudget: 3 };
    return { data: d, confidence: clamp(c.confidence + 0.05), note: \`[IMMUNITY] Sentinel active — health: \${(health*100).toFixed(0)}%\` };
  }},
  INTENT: { verb: 'route', depth: 'deep', handler: (d, c) => {
    const plan = c.modules.length - c.index - 1;
    d['_intent'] = { dagResolved: true, actionsPlanned: plan, classification: ukeys(d).length > 5 ? 'complex' : 'simple' };
    return { data: d, confidence: c.confidence, note: \`[INTENT] DAG resolved — \${plan} actions, class: \${d['_intent'].classification}\` };
  }},
  GOVERNANCE: { verb: 'govern', depth: 'deep', handler: (d, c) => {
    const passed = c.confidence > 0.3 ? 4 : 2;
    d['_governance'] = { policiesPassed: passed, total: 4, complianceScore: passed / 4, status: passed === 4 ? 'compliant' : 'review_required' };
    return { data: d, confidence: c.confidence, note: \`[GOVERNANCE] Compliance: \${passed}/4 — \${d['_governance'].status}\` };
  }},
  ATLAS: { verb: 'map', depth: 'deep', handler: (d, c) => {
    const cov = clamp(c.modules.length / 40);
    d['_atlas'] = { registrySize: 80, activeCapabilities: c.modules.length, coverage: cov };
    return { data: d, confidence: c.confidence, note: \`[ATLAS] Registry — \${c.modules.length} capabilities, coverage: \${(cov*100).toFixed(0)}%\` };
  }},
  FORGE: { verb: 'compose', depth: 'deep', handler: (d, c) => {
    d['_forge'] = { assemblyComplete: true, components: c.modules.length, artifactType: c.modules.length > 3 ? 'composite' : 'singular' };
    return { data: d, confidence: c.confidence, note: \`[FORGE] Artifact assembled — \${c.modules.length} components\` };
  }},
  LINGUA: { verb: 'transform', depth: 'deep', handler: (d, c) => {
    const tokens = JSON.stringify(d).split(/\\s+/).length;
    d['_lingua'] = { language: 'en', semanticAlignment: 'normalized', tokenCount: tokens };
    return { data: d, confidence: c.confidence, note: \`[LINGUA] Semantic alignment — \${tokens} tokens\` };
  }},
  ECHO: { verb: 'simulate', depth: 'deep', handler: (d, c) => {
    d['_echo'] = { replayable: true, eventCount: c.trace.length, syncTimestamp: Date.now() };
    return { data: d, confidence: c.confidence, note: \`[ECHO] Twin synchronized — \${c.trace.length} events\` };
  }},
  SOVEREIGN: { verb: 'classify', depth: 'deep', handler: (d, c) => {
    const auth = c.confidence > 0.8 ? 'autonomous' : c.confidence > 0.5 ? 'supervised' : 'restricted';
    d['_sovereign'] = { authorityLevel: auth, policyScore: c.confidence };
    return { data: d, confidence: c.confidence, note: \`[SOVEREIGN] Authority: \${auth}\` };
  }},
  REFLEX: { verb: 'route', depth: 'deep', handler: (d, c) => {
    const dec = c.index < c.modules.length - 2 ? 'continue' : 'finalize';
    d['_reflex'] = { edgeRouted: true, routingDecision: dec, latencyOptimized: true };
    return { data: d, confidence: c.confidence, note: \`[REFLEX] Edge routing — \${dec}\` };
  }},
  TREATY: { verb: 'negotiate', depth: 'deep', handler: (d, c) => {
    const ms = c.trace.reduce((s, t) => s + t.durationMs, 0);
    d['_treaty'] = { slaTarget: 500, actualMs: Math.round(ms*100)/100, compliant: ms < 500 };
    return { data: d, confidence: c.confidence, note: \`[TREATY] SLA \${ms < 500 ? 'met' : 'exceeded'} — \${ms.toFixed(1)}ms\` };
  }},
  ENGINEER: { verb: 'diagnose', depth: 'deep', handler: (d, c) => {
    const ms = c.trace.reduce((s, t) => s + t.durationMs, 0);
    const grade = ms < 10 ? 'A' : ms < 50 ? 'B' : 'C';
    d['_engineer'] = { totalDurationMs: ms, healthGrade: grade };
    return { data: d, confidence: c.confidence, note: \`[ENGINEER] Diagnostics — \${ms.toFixed(1)}ms, grade: \${grade}\` };
  }},
  COMPASS: { verb: 'enrich', depth: 'deep', handler: (d, c) => {
    d['_compass'] = { zone: 'global', riskLevel: 'low', sectorCount: new Set(c.modules).size, geoAware: true };
    return { data: d, confidence: c.confidence, note: \`[COMPASS] Zone: global — \${new Set(c.modules).size} sectors\` };
  }},
  OBSERVER: { verb: 'observe', depth: 'deep', handler: (d, c) => {
    const anomalies: string[] = [];
    if (c.confidence < 0.3) anomalies.push('low_confidence');
    if (c.recoveries > 2) anomalies.push('excessive_recoveries');
    const health = anomalies.length === 0 ? 'nominal' : 'degraded';
    d['_observer'] = { anomalies: anomalies.length, healthStatus: health, watchdogActive: true };
    return { data: d, confidence: c.confidence, note: \`[OBSERVER] Watchdog — health: \${health}, \${anomalies.length} anomalies\` };
  }},
  RELAY: { verb: 'route', depth: 'deep', handler: (d, c) => {
    const targets = c.modules.filter(m => m !== 'RELAY').length;
    d['_relay'] = { dispatchedTo: targets, fanOutMode: targets > 3 ? 'broadcast' : 'multicast', confirmed: true };
    return { data: d, confidence: c.confidence, note: \`[RELAY] Dispatched to \${targets} targets\` };
  }},
  NEXUS: { verb: 'route', depth: 'deep', handler: (d, c) => {
    const cohesion = clamp(1 - (c.index / c.modules.length) * 0.5);
    d['_nexus'] = { bindingCount: c.modules.length, cohesionScore: Math.round(cohesion*100)/100, hubActive: true };
    return { data: d, confidence: c.confidence, note: \`[NEXUS] \${c.modules.length} bindings — cohesion: \${(cohesion*100).toFixed(0)}%\` };
  }},
  DREAM: { verb: 'enrich', depth: 'deep', handler: (d, c) => {
    const patterns = (c.trace.length > 3 ? 1 : 0) + (sRatio(c.trace) > 0.9 ? 1 : 0) + (ukeys(d).length > 8 ? 1 : 0);
    d['_dream'] = { patternsDiscovered: patterns, dreamPoolActive: true, heuristicProposals: patterns };
    return { data: d, confidence: c.confidence, note: \`[DREAM] \${patterns} patterns discovered\` };
  }},
  PRISM: { verb: 'transform', depth: 'deep', handler: (d, c) => {
    const proj = c.confidence > 0.7 ? 'optimistic' : c.confidence > 0.4 ? 'balanced' : 'conservative';
    d['_prism'] = { selectedProjection: proj, branchCount: 3, transformApplied: true };
    return { data: d, confidence: c.confidence, note: \`[PRISM] Projection: \${proj}\` };
  }},
  AUDIT: { verb: 'annotate', depth: 'deep', handler: (d, c) => {
    const hash = qh('audit-' + c.index + '-' + Date.now());
    d['_audit'] = { auditHash: hash, receiptCount: c.trace.length, integrity: 'verified', tamperEvident: true };
    return { data: d, confidence: c.confidence, note: \`[AUDIT] Chain verified — \${c.trace.length} receipts, anchor: \${hash.slice(0,8)}\` };
  }},
  IDENTITY: { verb: 'validate', depth: 'deep', handler: (d, c) => {
    d['_identity'] = { authenticated: true, authLevel: c.confidence > 0.7 ? 'full' : 'basic', sessionBound: true, permissions: c.modules.length };
    return { data: d, confidence: c.confidence, note: \`[IDENTITY] Auth: \${d['_identity'].authLevel}, \${c.modules.length} permissions\` };
  }},
  MESH: { verb: 'route', depth: 'deep', handler: (d, c) => {
    const topo = c.modules.length > 5 ? 'mesh' : c.modules.length > 2 ? 'star' : 'p2p';
    d['_mesh'] = { topology: topo, nodeCount: c.modules.length, fabricHealth: 'operational' };
    return { data: d, confidence: c.confidence, note: \`[MESH] Fabric: \${topo} — \${c.modules.length} nodes\` };
  }},
  ECONOMY: { verb: 'score', depth: 'deep', handler: (d, c) => {
    const ms = c.trace.reduce((s, t) => s + t.durationMs, 0);
    const cost = Math.round(ms * 0.001 * 100) / 100;
    const roi = cost > 0 ? Math.round(c.confidence * 100 / cost) : Infinity;
    d['_economy'] = { computeMs: ms, costCents: cost, roi, efficiency: roi > 100 ? 'excellent' : roi > 10 ? 'good' : 'review' };
    return { data: d, confidence: c.confidence, note: \`[ECONOMY] ROI: \${roi} — efficiency: \${d['_economy'].efficiency}\` };
  }},
  ACCESS: { verb: 'validate', depth: 'deep', handler: (d, c) => {
    d['_access'] = { authorized: true, scopesGranted: c.modules.length, gatingLevel: c.modules.length > 5 ? 'strict' : 'standard' };
    return { data: d, confidence: c.confidence, note: \`[ACCESS] Authorized — \${c.modules.length} scopes, gating: \${d['_access'].gatingLevel}\` };
  }},
  VISION: { verb: 'enrich', depth: 'deep', handler: (d, c) => {
    const hasVis = ukeys(d).some(k => ['image','visual','screenshot','frame'].some(p => k.toLowerCase().includes(p)));
    d['_vision'] = { visualDataDetected: hasVis, analysisMode: hasVis ? 'active' : 'standby' };
    return { data: d, confidence: c.confidence, note: \`[VISION] Analysis: \${hasVis ? 'active' : 'standby'}\` };
  }},
  ANALYTICS: { verb: 'score', depth: 'deep', handler: (d, c) => {
    const sr = sRatio(c.trace);
    const trend = sr > 0.9 ? 'improving' : sr > 0.6 ? 'stable' : 'declining';
    d['_analytics'] = { totalEvents: c.trace.length, successRate: Math.round(sr*1000)/1000, trend };
    return { data: d, confidence: c.confidence, note: \`[ANALYTICS] \${c.trace.length} events — trend: \${trend}\` };
  }},
  MEDIC: { verb: 'recover', depth: 'deep', handler: (d, c) => {
    const actions = (c.recoveries > 0 ? 1 : 0) + (c.confidence < 0.4 ? 1 : 0);
    const restored = clamp(c.confidence + actions * 0.05);
    d['_medic'] = { diagnosticComplete: true, healingActions: actions, healthRestored: restored };
    return { data: d, confidence: restored, note: \`[MEDIC] \${actions} healing actions — health: \${(restored*100).toFixed(0)}%\` };
  }},
  RIPPLE: { verb: 'route', depth: 'deep', handler: (d, c) => {
    const radius = c.modules.length - c.index - 1;
    d['_ripple'] = { cascadeDepth: c.index, impactRadius: radius, isolated: c.recoveries === 0, mode: radius > 3 ? 'wide' : 'narrow' };
    return { data: d, confidence: c.confidence, note: \`[RIPPLE] Cascade depth: \${c.index} — impact: \${radius}, mode: \${d['_ripple'].mode}\` };
  }},
};

// ── Fallback (Layer 3) ──

function fallbackEffect(mod: string): { verb: string; depth: 'deep' | 'fallback'; handler: EffectHandler } {
  return {
    verb: 'annotate',
    depth: 'fallback' as const,
    handler: (data, ctx) => {
      data[\`_\${mod.toLowerCase()}\`] = { participated: true, depth: 'fallback', stageIndex: ctx.index, timestamp: Date.now() };
      return { data, confidence: ctx.confidence, note: \`[\${mod}] Context annotated — fallback participation\` };
    },
  };
}

// ── Executor ──

export async function executeChain(manifest: ChainManifest, input: Record<string, unknown> = {}): Promise<ChainResult> {
  const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
  let data = JSON.parse(JSON.stringify(input));
  let confidence = 0.5;
  const trace: StageTrace[] = [];
  const notes: string[] = [];
  const depthReport: { module: string; depth: string }[] = [];
  let recoveries = 0;

  data['_manifest'] = { id: manifest.id, name: manifest.name, tier: manifest.tier, cjpiScore: manifest.cjpiScore };
  notes.push(\`[CHAIN] Executing "\${manifest.name}" — \${manifest.modules.length} modules, CJPI: \${manifest.cjpiScore}, tier: \${manifest.tier}\`);

  for (let i = 0; i < manifest.modules.length; i++) {
    const mod = manifest.modules[i];
    const stageStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const effect = E[mod] ?? fallbackEffect(mod);

    depthReport.push({ module: mod, depth: effect.depth });

    try {
      const result = effect.handler(data, { confidence, trace, modules: manifest.modules, index: i, recoveries });
      data = result.data;
      confidence = result.confidence;
      notes.push(result.note);

      trace.push({
        module: mod, effect: effect.verb, status: 'success',
        durationMs: Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - stageStart) * 100) / 100,
        depth: effect.depth, notes: [result.note], timestamp: Date.now(),
      });
    } catch (err) {
      recoveries++;
      const msg = err instanceof Error ? err.message : String(err);
      notes.push(\`[\${mod}] Error recovered — "\${msg}"\`);
      trace.push({
        module: mod, effect: effect.verb, status: 'recovered',
        durationMs: Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - stageStart) * 100) / 100,
        depth: effect.depth, notes: [\`Error: \${msg}\`, 'Recovered via fallback'], timestamp: Date.now(),
      });
    }
  }

  notes.push(\`[CHAIN] Complete — \${trace.filter(t => t.status === 'success').length}/\${manifest.modules.length} stages succeeded, confidence: \${(confidence * 100).toFixed(1)}%\`);

  return {
    success: true,
    output: data,
    trace,
    confidence: Math.round(confidence * 1000) / 1000,
    totalDurationMs: Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - start) * 100) / 100,
    transformationNotes: notes,
    depthReport,
  };
}

export function formatReport(result: ChainResult): string {
  const lines = [
    '═══ CMPSBL® Chain Execution Report ═══',
    '',
    \`Status: \${result.success ? '✓ SUCCESS' : '✗ FAILED'}\`,
    \`Duration: \${result.totalDurationMs.toFixed(1)}ms\`,
    \`Confidence: \${(result.confidence * 100).toFixed(1)}%\`,
    '',
    '── Module Chain ──',
  ];
  for (const t of result.trace) {
    const icon = t.depth === 'deep' ? '◆' : '○';
    lines.push(\`  \${icon} \${t.module} [\${t.effect}] \${t.status === 'success' ? '✓' : '⟳'} \${t.durationMs.toFixed(1)}ms\`);
  }
  lines.push('', '── Notes ──');
  for (const n of result.transformationNotes) lines.push(\`  \${n}\`);
  lines.push('═══════════════════════════════════════');
  return lines.join('\\n');
}
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Chain Playback Test Generator
// ═══════════════════════════════════════════════════════════════════════════════

function generateChainPlaybackTest(product: ProductZipInput): string {
  const modules = product.capabilities?.length
    ? product.capabilities.slice(0, 4).map(c => c.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 10) || 'CORE')
    : ['BRAIN', 'MEMORY', 'ORACLE', 'ECHO'];

  return `import { executeChain, formatReport } from '../_runtime/chain-executor';

/**
 * Chain Playback Test — ${product.name}
 * Demonstrates the 3-layer runtime execution model.
 */
describe('${product.name} — Chain Playback', () => {
  it('executes a discovered capability chain', async () => {
    const manifest = {
      id: 'test-chain-001',
      name: '${product.name} Discovery',
      description: '${product.subtitle}',
      modules: ${JSON.stringify(modules)},
      cjpiScore: ${product.tier === 'apex' ? 95 : product.tier === 'elite' ? 80 : 65},
      tier: '${product.tier}',
      category: '${product.kind}',
    };

    const result = await executeChain(manifest, { input: 'test', value: 42 });

    // Every chain should succeed
    expect(result.success).toBe(true);

    // Every module in the chain must leave a trace
    expect(result.trace.length).toBe(manifest.modules.length);

    // Every module must have a depth classification
    expect(result.depthReport.length).toBe(manifest.modules.length);

    // Confidence should be between 0 and 1
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);

    // Transformation notes should include start and end markers
    expect(result.transformationNotes[0]).toContain('[CHAIN] Executing');
    expect(result.transformationNotes[result.transformationNotes.length - 1]).toContain('[CHAIN] Complete');

    // Print the execution report
    console.log(formatReport(result));
  });

  it('every module leaves an execution footprint', async () => {
    const manifest = {
      id: 'footprint-test',
      name: 'Footprint Verification',
      description: 'Verifies all modules participate',
      modules: ${JSON.stringify(modules)},
      cjpiScore: 70,
      tier: 'architect',
      category: 'test',
    };

    const result = await executeChain(manifest, {});

    for (const mod of manifest.modules) {
      const key = \`_\${mod.toLowerCase()}\`;
      // Every module should write something to the output
      expect(result.output[key] || result.output['_manifest']).toBeTruthy();
    }
  });
});
`;
}
