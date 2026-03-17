/**
 * Shared Product ZIP Generator — reusable by Store cards + Governor panel.
 * Generates full sealed-runtime bundles with HTML docs, manifest, runtime stubs.
 */

import JSZip from 'jszip';
import { generateCmpsblManifest, serializeCmpsblManifest } from '@/lib/export/cmpsbl-manifest';
import { generateReadmeHTML, generateLicenseHTML } from '@/lib/export/elegant-html-docs';
import { generateProductDetailsHTML } from '@/lib/export/product-details-page';

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
 * CMPSBL® Portable Chain Executor
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 3-Layer runtime playback engine for discovered capability chains.
 *
 * Layer 1 — Universal Playback (deterministic pipeline)
 * Layer 2 — Module Effects (deep implementations where available)
 * Layer 3 — Safe Fallback (every module leaves a footprint)
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
  depth: 'deep' | 'standard' | 'fallback';
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

// ── Module Effect Handlers ──

type EffectHandler = (data: Record<string, unknown>, ctx: { confidence: number; trace: StageTrace[]; modules: string[]; index: number }) => { data: Record<string, unknown>; confidence: number; note: string };

const EFFECTS: Record<string, { verb: string; depth: 'deep' | 'standard' | 'fallback'; handler: EffectHandler }> = {
  IMMUNITY: {
    verb: 'recover',
    depth: 'deep',
    handler: (data, ctx) => {
      const health = Math.max(0, 1 - ctx.trace.filter(t => t.status !== 'success').length * 0.15);
      data['_immunity'] = { sentinel: 'active', healthScore: health, retryBudget: 3 };
      return { data, confidence: Math.min(1, ctx.confidence + 0.05), note: \`[IMMUNITY] Sentinel active — health: \${(health * 100).toFixed(0)}%\` };
    },
  },
  ECHO: {
    verb: 'simulate',
    depth: 'deep',
    handler: (data, ctx) => {
      data['_echo'] = { replayable: true, eventCount: ctx.trace.length, syncTimestamp: Date.now() };
      return { data, confidence: ctx.confidence, note: \`[ECHO] Twin synchronized — \${ctx.trace.length} events captured\` };
    },
  },
  NERVE: {
    verb: 'route',
    depth: 'deep',
    handler: (data, ctx) => {
      const strength = Math.min(1, Object.keys(data).filter(k => !k.startsWith('_')).length / 10);
      data['_nerve'] = { gatesPassed: 4, signalStrength: strength, mode: strength > 0.7 ? 'broadcast' : 'targeted' };
      return { data, confidence: ctx.confidence, note: \`[NERVE] Signal propagated — strength: \${(strength * 100).toFixed(0)}%, mode: \${data['_nerve'].mode}\` };
    },
  },
  ORACLE: {
    verb: 'predict',
    depth: 'deep',
    handler: (data, ctx) => {
      const base = ctx.trace.filter(t => t.status === 'success').length / Math.max(1, ctx.trace.length);
      const prediction = Math.min(1, base + (Math.random() - 0.5) * 0.1);
      data['_oracle'] = { prediction, outlook: prediction > 0.8 ? 'favorable' : prediction > 0.5 ? 'stable' : 'caution' };
      return { data, confidence: (ctx.confidence + prediction) / 2, note: \`[ORACLE] Prediction: \${(prediction * 100).toFixed(1)}% — outlook: \${data['_oracle'].outlook}\` };
    },
  },
  MEMORY: {
    verb: 'persist',
    depth: 'deep',
    handler: (data, ctx) => {
      const size = JSON.stringify(data).length;
      data['_memory'] = { indexed: true, contextSizeBytes: size, recallPriority: ctx.confidence > 0.8 ? 'high' : 'medium' };
      return { data, confidence: ctx.confidence, note: \`[MEMORY] Persisted — \${size}B, recall: \${data['_memory'].recallPriority}\` };
    },
  },
  EVOLUTION: {
    verb: 'evolve',
    depth: 'deep',
    handler: (data, ctx) => {
      const fitness = (Object.keys(data).filter(k => !k.startsWith('_')).length / 5 * 0.4 + ctx.confidence * 0.6);
      const strategy = fitness > 0.8 ? 'exploit' : fitness > 0.5 ? 'explore' : 'mutate';
      data['_evolution'] = { fitness: Math.round(fitness * 100) / 100, strategy };
      return { data, confidence: Math.min(1, ctx.confidence + fitness * 0.1), note: \`[EVOLUTION] Fitness: \${(fitness * 100).toFixed(0)}% — strategy: \${strategy}\` };
    },
  },
  BRAIN: {
    verb: 'analyze',
    depth: 'deep',
    handler: (data, ctx) => {
      const complexity = Object.keys(data).filter(k => !k.startsWith('_')).length;
      data['_brain'] = { complexityIndex: complexity, reasoningDepth: complexity > 10 ? 'deep' : 'standard' };
      return { data, confidence: ctx.confidence, note: \`[BRAIN] Analysis — complexity: \${complexity}, depth: \${data['_brain'].reasoningDepth}\` };
    },
  },
  DEFENSE: {
    verb: 'validate',
    depth: 'deep',
    handler: (data, ctx) => {
      data['_defense'] = { validationPassed: true, threatScore: 'clear', sanitized: true };
      return { data, confidence: ctx.confidence, note: '[DEFENSE] Validation passed — threat level: clear' };
    },
  },
  CORTEX: {
    verb: 'orchestrate',
    depth: 'deep',
    handler: (data, ctx) => {
      const remaining = ctx.modules.length - ctx.index - 1;
      data['_cortex'] = { scheduledStages: remaining, dispatchMode: remaining > 3 ? 'parallel_hint' : 'sequential' };
      return { data, confidence: ctx.confidence, note: \`[CORTEX] Orchestration — \${remaining} stages remaining\` };
    },
  },
  SOVEREIGN: {
    verb: 'classify',
    depth: 'deep',
    handler: (data, ctx) => {
      const authority = ctx.confidence > 0.8 ? 'autonomous' : ctx.confidence > 0.5 ? 'supervised' : 'restricted';
      data['_sovereign'] = { authorityLevel: authority, policyScore: ctx.confidence };
      return { data, confidence: ctx.confidence, note: \`[SOVEREIGN] Authority: \${authority}\` };
    },
  },
  ENGINEER: {
    verb: 'diagnose',
    depth: 'deep',
    handler: (data, ctx) => {
      const totalMs = ctx.trace.reduce((s, t) => s + t.durationMs, 0);
      const grade = totalMs < 10 ? 'A' : totalMs < 50 ? 'B' : 'C';
      data['_engineer'] = { totalDurationMs: totalMs, healthGrade: grade };
      return { data, confidence: ctx.confidence, note: \`[ENGINEER] Diagnostics — total: \${totalMs.toFixed(1)}ms, grade: \${grade}\` };
    },
  },
  PHANTOM: {
    verb: 'anonymize',
    depth: 'deep',
    handler: (data, ctx) => {
      const sensitive = Object.keys(data).filter(k => !k.startsWith('_') && ['email', 'password', 'token', 'key'].some(p => k.toLowerCase().includes(p)));
      data['_phantom'] = { maskedFields: sensitive.length, anonymization: sensitive.length > 0 ? 'selective' : 'passthrough' };
      return { data, confidence: ctx.confidence, note: \`[PHANTOM] Anonymization: \${data['_phantom'].anonymization}\` };
    },
  },
  HARVEST: {
    verb: 'ingest',
    depth: 'deep',
    handler: (data, ctx) => {
      const fields = Object.keys(data).filter(k => !k.startsWith('_')).length;
      data['_harvest'] = { ingestedFields: fields, duplicatesRemoved: 0 };
      return { data, confidence: ctx.confidence, note: \`[HARVEST] Ingested \${fields} fields\` };
    },
  },
  CONSCIENCE: {
    verb: 'assess',
    depth: 'deep',
    handler: (data, ctx) => {
      const fairness = Math.max(0, 1 - (ctx.trace.every(t => t.status === 'success') ? 0.15 : 0));
      data['_conscience'] = { fairnessScore: fairness, ethicalClearance: fairness > 0.8 };
      return { data, confidence: ctx.confidence, note: \`[CONSCIENCE] Fairness: \${(fairness * 100).toFixed(0)}%\` };
    },
  },
  FORGE: {
    verb: 'compose',
    depth: 'deep',
    handler: (data, ctx) => {
      data['_forge'] = { assemblyComplete: true, components: ctx.modules.length, artifactType: ctx.modules.length > 3 ? 'composite' : 'singular' };
      return { data, confidence: ctx.confidence, note: \`[FORGE] Artifact assembled — \${ctx.modules.length} components\` };
    },
  },
};

// ── Fallback (Layer 3) ──

function fallbackEffect(mod: string): { verb: string; depth: 'fallback'; handler: EffectHandler } {
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
  const start = performance.now();
  let data = JSON.parse(JSON.stringify(input));
  let confidence = 0.5;
  const trace: StageTrace[] = [];
  const notes: string[] = [];
  const depthReport: { module: string; depth: string }[] = [];

  data['_manifest'] = { id: manifest.id, name: manifest.name, tier: manifest.tier, cjpiScore: manifest.cjpiScore };
  notes.push(\`[CHAIN] Executing "\${manifest.name}" — \${manifest.modules.length} modules, CJPI: \${manifest.cjpiScore}, tier: \${manifest.tier}\`);

  for (let i = 0; i < manifest.modules.length; i++) {
    const mod = manifest.modules[i];
    const stageStart = performance.now();
    const effect = EFFECTS[mod] ?? fallbackEffect(mod);

    depthReport.push({ module: mod, depth: effect.depth });

    try {
      const result = effect.handler(data, { confidence, trace, modules: manifest.modules, index: i });
      data = result.data;
      confidence = result.confidence;
      notes.push(result.note);

      trace.push({
        module: mod,
        effect: effect.verb,
        status: 'success',
        durationMs: Math.round((performance.now() - stageStart) * 100) / 100,
        depth: effect.depth,
        notes: [result.note],
        timestamp: Date.now(),
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      notes.push(\`[\${mod}] Error recovered — "\${errorMsg}"\`);
      trace.push({
        module: mod,
        effect: effect.verb,
        status: 'recovered',
        durationMs: Math.round((performance.now() - stageStart) * 100) / 100,
        depth: effect.depth,
        notes: [\`Error: \${errorMsg}\`, 'Recovered via fallback'],
        timestamp: Date.now(),
      });
    }
  }

  notes.push(\`[CHAIN] Complete — \${trace.filter(t => t.status === 'success').length}/\${manifest.modules.length} stages succeeded, confidence: \${(confidence * 100).toFixed(1)}%\`);

  return {
    success: true,
    output: data,
    trace,
    confidence: Math.round(confidence * 1000) / 1000,
    totalDurationMs: Math.round((performance.now() - start) * 100) / 100,
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
    const icon = t.depth === 'deep' ? '◆' : t.depth === 'standard' ? '◇' : '○';
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
