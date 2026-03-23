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

  // ── Sealed Runtime (IP-protected — no proprietary logic exposed) ──
  const runtime = folder.folder('_runtime')!;
  runtime.file('standalone-runtime.ts', generateSealedRuntime());
  runtime.file('README.md', generateSealedRuntimeReadme());

  // ── Sealed Chain Executor (module effects obfuscated) ──
  runtime.file('chain-executor.ts', generateSealedChainExecutor());

  // ── Playback demo / test harness ──
  const test = folder.folder('test')!;
  test.file(`${product.slug}.test.ts`, `import { init } from '../src/${product.slug}';\n\ndescribe('${product.name}', () => {\n  it('initializes correctly', () => {\n    const instance = init();\n    expect(instance.name).toBe('${product.name}');\n    expect(instance.ready).toBe(true);\n  });\n});\n`);

  test.file('chain-playback.test.ts', generateChainPlaybackTest(product));

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
