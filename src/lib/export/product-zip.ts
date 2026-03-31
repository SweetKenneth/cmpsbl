/**
 * Shared Product ZIP Generator — reusable by Store cards + Governor panel.
 * Generates full sealed-runtime bundles with HTML docs, manifest, runtime stubs,
 * discovery engine, and common pipeline (matching Memory Stream exports).
 */

import JSZip from 'jszip';
import { generateCmpsblManifest, serializeCmpsblManifest } from '@/lib/export/cmpsbl-manifest';
import { generateReadmeHTML, generateLicenseHTML } from '@/lib/export/elegant-html-docs';
import { generateProductDetailsHTML } from '@/lib/export/product-details-page';
import {
  generateSealedRuntime,
  generateSealedChainExecutor,
  generateSealedRuntimeReadme,
  generateSealedDiscoveryEngine,
} from '@/lib/export/sealed-runtime-generator';
import { generateIntegrationGuide as generateDetailedIntegrationGuide } from '@/lib/export/integration-guide-generator';
import { generateExportArtifacts, generateDiscoveryContext, generateTierMigration } from '@/lib/export/export-artifacts-generator';

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
  /** When true, uses Ascension-extended runtime with handler registry */
  ascension?: boolean;
}

function cjpiFromTier(tier: string): number {
  const t = tier.toLowerCase();
  if (t === 'apex' || t === 's-tier') return 95;
  if (t === 'meta') return 88;
  if (t === 'elite') return 80;
  if (t === 'pro') return 65;
  if (t === 'core') return 50;
  if (t === 'starter' || t === 'free') return 30;
  return 45;
}

function generateReadmeMD(product: ProductZipInput): string {
  const kindLabel = product.kind === 'engine' ? 'Composable Engine' : 'Standalone Agent';
  const safeName = product.name.replace(/[^a-zA-Z0-9]/g, '_');
  return `# ${product.name} — CMPSBL® Sealed Runtime™

## ${product.subtitle}

**Tier:** ${product.tier.toUpperCase()}
**Price:** ${product.price}
**Type:** ${kindLabel}
**Version:** ${product.version}

---

## What's in this Bundle

| File / Folder | Purpose |
|---|---|
| \`src/${product.slug}.ts\` | Sealed runtime entry point |
| \`_runtime/standalone-runtime.ts\` | CMPSBL® Mini-Runtime™ Engine (black-boxed) |
| \`_runtime/chain-executor.ts\` | Portable Chain Executor (40-primitive matrix) |
| \`_runtime/discovery-engine.ts\` | Sealed Discovery Engine (template injection) |
| \`_runtime/README.md\` | Runtime architecture and network modes |
| \`manifest.json\` | CMPSBL® software manifest |
| \`DETAILS.html\` | Product specification certificate |
| \`README.html\` | Formatted documentation |
| \`LICENSE\` / \`LICENSE.html\` | Proprietary license terms |
| \`test/\` | Auto-generated test harness |

---

## Quick Start — Drop into Your Stack

### Option 1: Copy & Import (Zero Config)

\`\`\`bash
# Copy the bundle into your project
cp -r ${product.slug}/ ./your-project/vendor/cmpsbl/
\`\`\`

\`\`\`typescript
// Import and use immediately
import { init } from './vendor/cmpsbl/${product.slug}/src/${product.slug}';
import { createRuntime } from './vendor/cmpsbl/${product.slug}/_runtime/standalone-runtime';

const runtime = createRuntime();
const instance = init();
\`\`\`

### Option 2: NPM / SDK Activation

\`\`\`bash
npm install @cmpsbl/sdk
\`\`\`

\`\`\`typescript
import CMPSBL from '@cmpsbl/sdk';

const client = new CMPSBL();
// Your ${product.kind} activates automatically via SDK
// See: https://www.npmjs.com/package/@cmpsbl/sdk
\`\`\`

### Option 3: CLI Activation

\`\`\`bash
npm install -g @cmpsbl/cli
cmpsbl ${product.kind === 'engine' ? 'engines' : 'agents'} activate ${product.slug}
cmpsbl status
\`\`\`

---

## Network Modes

The embedded Mini-Runtime™ is **network-aware**:

| Mode | Description |
|---|---|
| **Network** | Full CMPSBL® Substrate primitives (deep effects) |
| **Hybrid** | Auto-fallback when substrate unreachable |
| **Offline** | Fully standalone — zero network dependency |

\`\`\`typescript
import { configureEndpoint, getRuntimeMode } from './_runtime/standalone-runtime';

// Force offline mode (fully standalone)
configureEndpoint(null);
console.log(getRuntimeMode()); // 'offline'
\`\`\`

---

## NPM Packages

| Package | Purpose | Link |
|---|---|---|
| \`@cmpsbl/sdk\` | Full SDK — ${product.kind} activation | [npm](https://www.npmjs.com/package/@cmpsbl/sdk) |
| \`@cmpsbl/runtime\` | Mini-Runtime™ standalone | [npm](https://www.npmjs.com/package/@cmpsbl/runtime) |
| \`@cmpsbl/cli\` | Terminal activation & status | [npm](https://www.npmjs.com/package/@cmpsbl/cli) |
| \`@cmpsbl/types\` | TypeScript type definitions | [npm](https://www.npmjs.com/package/@cmpsbl/types) |

---

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
  const kindLabel = product.kind === 'engine' ? 'Composable Engine' : 'Standalone Agent';
  const caps = product.capabilities || [kindLabel, `${product.tier.toUpperCase()} Tier`, 'Sealed Runtime'];
  const cjpi = cjpiFromTier(product.tier);

  // ── Manifest ──────────────────────────────────────────────────────────────
  folder.file('manifest.json', serializeCmpsblManifest({
    name: product.name,
    version: product.version,
    cjpi,
    modules: [product.kind === 'engine' ? 'ENGINE' : 'AGENT', product.name],
    targets: ['typescript'],
    category: product.kind,
    source: 'store-download',
  }));

  // ── Plain text docs ───────────────────────────────────────────────────────
  folder.file('README.md', generateReadmeMD(product));
  folder.file('LICENSE', generateLicenseTxt());

  // ── HTML documentation suite ──────────────────────────────────────────────
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
      { name: '_runtime/standalone-runtime.ts', purpose: 'CMPSBL® Mini-Runtime™ Engine (black-boxed)' },
      { name: '_runtime/chain-executor.ts', purpose: 'Portable Chain Executor (40-primitive matrix)' },
      { name: '_runtime/discovery-engine.ts', purpose: 'Sealed Discovery Engine' },
      { name: `test/${product.slug}.test.ts`, purpose: 'Auto-generated test harness' },
    ],
    quickStart: `# Install & run\nnpm install\nnpm test\n\n# Import in your project\nimport { init } from './${product.slug}';\nconst instance = init();\n\n# Or use via NPM\nnpm install @cmpsbl/sdk\nimport CMPSBL from '@cmpsbl/sdk';`,
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

  // ── Stub src (entry point) ────────────────────────────────────────────────
  const src = folder.folder('src')!;
  const safeName = product.name.replace(/[^a-zA-Z0-9]/g, '_');
  src.file(`${product.slug}.ts`, `/**
 * ${product.name} — CMPSBL® Sealed Runtime™
 * ${product.subtitle}
 *
 * This is the sealed runtime entry point.
 * Internal implementation is protected.
 *
 * Usage:
 *   import { init, createPipeline } from './${product.slug}';
 *   const instance = init();
 *   const pipeline = createPipeline(instance);
 *   const result = await pipeline.execute({ input: 'your data' });
 *
 * Network Modes:
 *   import { configureEndpoint } from '../_runtime/standalone-runtime';
 *   configureEndpoint(null); // Force offline
 *
 * NPM Alternative:
 *   npm install @cmpsbl/sdk
 *   import CMPSBL from '@cmpsbl/sdk';
 */

import { createRuntime } from '../_runtime/standalone-runtime';
import { executeChain, formatReport } from '../_runtime/chain-executor';

export const ${safeName}_VERSION = '${product.version}';
export const ${safeName}_TIER = '${product.tier}';
export const ${safeName}_CJPI = ${cjpi};

export interface ${safeName}Config {
  offline?: boolean;
  verbose?: boolean;
  [key: string]: unknown;
}

export function init(config?: ${safeName}Config) {
  const runtime = createRuntime();

  if (config?.offline) {
    // Runtime ships network-aware; force offline if requested
    runtime.configureEndpoint(null);
  }

  return {
    name: '${product.name}',
    tier: '${product.tier}',
    version: '${product.version}',
    cjpi: ${cjpi},
    ready: true,
    runtime,
    config,
  };
}

export function createPipeline(instance: ReturnType<typeof init>) {
  const modules = ${JSON.stringify(caps.slice(0, 6).map(c => c.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 10) || 'CORE'))};
  return {
    execute: async (input: Record<string, unknown> = {}) => {
      return executeChain({
        id: '${product.id}',
        name: '${product.name}',
        description: '${product.subtitle}',
        modules,
        cjpiScore: ${cjpi},
        tier: '${product.tier}',
        category: '${product.kind}',
      }, input);
    },
    formatReport,
    modules,
    instance,
  };
}
`);

  // ── Sealed Runtime (IP-protected — no proprietary logic exposed) ───────
  const runtime = folder.folder('_runtime')!;
  runtime.file('standalone-runtime.ts', generateSealedRuntime());
  runtime.file('chain-executor.ts', generateSealedChainExecutor());
  runtime.file('discovery-engine.ts', generateSealedDiscoveryEngine());
  runtime.file('README.md', generateSealedRuntimeReadme());

  // ── Test harness ──────────────────────────────────────────────────────────
  const test = folder.folder('test')!;
  test.file(`${product.slug}.test.ts`, `import { init, createPipeline } from '../src/${product.slug}';

describe('${product.name}', () => {
  it('initializes correctly', () => {
    const instance = init();
    expect(instance.name).toBe('${product.name}');
    expect(instance.ready).toBe(true);
    expect(instance.cjpi).toBe(${cjpi});
  });

  it('initializes in offline mode', () => {
    const instance = init({ offline: true });
    expect(instance.ready).toBe(true);
  });

  it('creates and executes a pipeline', async () => {
    const instance = init({ offline: true });
    const pipeline = createPipeline(instance);
    const result = await pipeline.execute({ test: true });
    expect(result.success).toBe(true);
    expect(result.trace.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('formats execution reports', async () => {
    const instance = init({ offline: true });
    const pipeline = createPipeline(instance);
    const result = await pipeline.execute({});
    const report = pipeline.formatReport(result);
    expect(report).toContain('CMPSBL');
    expect(report).toContain('SUCCESS');
  });
});
`);

  test.file('chain-playback.test.ts', generateChainPlaybackTest(product));

  // ── Integration guide ─────────────────────────────────────────────────────
  folder.file('INTEGRATION.md', generateDetailedIntegrationGuide({
    kind: product.ascension ? 'ascension' : product.kind,
    name: product.name,
    slug: product.slug,
    category: product.tier,
  }));

  return zip.generateAsync({ type: 'blob' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Portable Chain Executor — now generated by sealed-runtime-generator.ts
// The old inline `generatePortableChainExecutor()` with full 40-primitive deep
// effect handlers has been removed to protect proprietary IP.
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// Chain Playback Test Generator
// ═══════════════════════════════════════════════════════════════════════════════

function generateChainPlaybackTest(product: ProductZipInput): string {
  const modules = product.capabilities?.length
    ? product.capabilities.slice(0, 4).map(c => c.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 10) || 'CORE')
    : ['BRAIN Organ', 'MEMORY Organ', 'ORACLE Engine', 'ECHO Agent'];

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
      description: 'Verifies all primitives participate',
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

// Old inline generateIntegrationGuide removed — now uses integration-guide-generator.ts
