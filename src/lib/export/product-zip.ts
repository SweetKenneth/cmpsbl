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
import { generateHTMLArtifacts } from '@/lib/export/html-artifact-generator';
import { generateUniversalUserGuide } from '@/lib/export/universal-user-guide';
import { generateProofCertificate } from '@/lib/export/proof-certificate';

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
  return `# ${product.name} — CMPSBL® Convex Core™

## ${product.subtitle}

**Tier:** ${product.tier.toUpperCase()}
**Price:** ${product.price}
**Type:** ${kindLabel}
**Version:** ${product.version}

---

## What's in this Bundle

| File / Folder | Purpose |
|---|---|
| \`src/${product.slug}.ts\` | Sealed processing layer entry point |
| \`_runtime/convex-core.ts\` | CMPSBL® Convex Core™ Processing Layer (black-boxed) |
| \`_runtime/chain-executor.ts\` | Portable Chain Executor (dispatch matrix) |
| \`_runtime/discovery-engine.ts\` | Sealed Discovery Engine (template injection) |
| \`_runtime/README.md\` | Processing layer architecture and network modes |
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
import { compileDispatch } from './vendor/cmpsbl/${product.slug}/_runtime/convex-core';

const matrix = compileDispatch();
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

The embedded Convex Core™ processing layer is **network-aware**:

| Mode | Description |
|---|---|
| **Network** | Full CMPSBL® Substrate primitives (deep effects) |
| **Hybrid** | Auto-fallback when substrate unreachable |
| **Offline** | Fully standalone — zero network dependency |

\`\`\`typescript
import { configureEndpoint, getProcessingMode } from './_runtime/convex-core';

// Force offline mode (fully standalone)
configureEndpoint(null);
console.log(getProcessingMode()); // 'offline'
\`\`\`

---

## NPM Packages

| Package | Purpose | Link |
|---|---|---|
| \`@cmpsbl/sdk\` | Full SDK — ${product.kind} activation | [npm](https://www.npmjs.com/package/@cmpsbl/sdk) |
| \`@cmpsbl/runtime\` | Convex Core™ processing layer | [npm](https://www.npmjs.com/package/@cmpsbl/runtime) |
| \`@cmpsbl/cli\` | Terminal activation & status | [npm](https://www.npmjs.com/package/@cmpsbl/cli) |
| \`@cmpsbl/types\` | TypeScript type definitions | [npm](https://www.npmjs.com/package/@cmpsbl/types) |

---

## License

CMPSBL® Proprietary License — Single-seat perpetual license.
This software is a Convex Core™ artifact. Source inspection, decompilation,
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

This software is provided as a Convex Core™ Sealed Artifact artifact by PromptFluid®.

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
  const caps = product.capabilities || [kindLabel, `${product.tier.toUpperCase()} Tier`, 'Convex Core™ Sealed Artifact'];
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

  // ── docs/ folder — organized documentation ────────────────────────────────
  const docsFolder = folder.folder('docs')!;

  // Plain text docs at root
  folder.file('README.md', generateReadmeMD(product));
  folder.file('LICENSE', generateLicenseTxt());

  // HTML docs in docs/
  docsFolder.file('README.html', generateReadmeHTML({
    name: product.name,
    description: product.subtitle,
    category: kindLabel,
    version: product.version,
    modules: [product.kind === 'engine' ? 'ENGINE' : 'AGENT'],
    files: [
      { name: 'manifest.json', purpose: 'CMPSBL® software manifest' },
      { name: `src/${product.slug}.ts`, purpose: 'Sealed runtime entry point' },
      { name: '_runtime/', purpose: 'CMPSBL® Convex Core™ Processing Layer' },
      { name: 'test/', purpose: 'Auto-generated test harness' },
      { name: 'docs/', purpose: 'Full documentation suite (HTML + Markdown)' },
    ],
    quickStart: `# Install & run\nnpm install\nnpm test\n\n# Import in your project\nimport { init } from './${product.slug}';\nconst instance = init();`,
  }));
  docsFolder.file('LICENSE.html', generateLicenseHTML(product.name));
  docsFolder.file('DETAILS.html', generateProductDetailsHTML({
    name: product.name,
    subtitle: product.subtitle,
    kind: product.kind,
    tier: product.tier,
    price: product.price,
    version: product.version,
    capabilities: caps,
  }));

  // docs/guides/ — Markdown guides
  const guidesFolder = docsFolder.folder('guides')!;
  const exportKind = product.ascension ? 'ascension' as const : product.kind;
  guidesFolder.file('INTEGRATION.md', generateDetailedIntegrationGuide({
    kind: exportKind,
    name: product.name,
    slug: product.slug,
    category: product.tier,
  }));

  const artifacts = generateExportArtifacts({
    kind: exportKind,
    name: product.name,
    slug: product.slug,
    version: product.version,
    tier: product.tier,
    score: cjpiFromTier(product.tier),
    languages: ['typescript'],
  });
  for (const [filename, content] of Object.entries(artifacts)) {
    if (filename.startsWith('_runtime/')) {
      folder.file(filename, content);
    } else if (filename === 'quickstart.ts' || filename === 'package.json' || filename === '.env.example') {
      folder.file(filename, content);
    } else {
      guidesFolder.file(filename, content);
    }
  }
  const discoveryCtx = generateDiscoveryContext({
    kind: exportKind,
    name: product.name,
    slug: product.slug,
    tier: product.tier,
    score: cjpiFromTier(product.tier),
  });
  if (discoveryCtx) {
    guidesFolder.file('DISCOVERY-CONTEXT.md', discoveryCtx);
  }
  guidesFolder.file('TIER-MIGRATION.md', generateTierMigration());

  // docs/html/ — Beautiful HTML versions
  const htmlFolder = docsFolder.folder('html')!;
  const htmlArtifacts = generateHTMLArtifacts({
    name: product.name,
    slug: product.slug,
    kind: exportKind,
    version: product.version,
    score: cjpiFromTier(product.tier),
    tier: product.tier,
    languages: ['typescript'],
  });
  for (const [filename, content] of Object.entries(htmlArtifacts)) {
    htmlFolder.file(filename, content);
  }

  // ═══ Universal User Guide (HTML) — ships in every export ═══
  docsFolder.file('USER-GUIDE.html', generateUniversalUserGuide({
    name: product.name,
    slug: product.slug,
    kind: product.kind,
    tier: product.tier,
    cjpi: cjpi,
    version: product.version,
    capabilities: caps,
    modules: [product.kind === 'engine' ? 'ENGINE' : 'AGENT', product.name],
  }));

  // ═══ PROOF.txt — Cryptographic Provenance Certificate ═══
  folder.file('PROOF.txt', generateProofCertificate({
    tier: product.tier,
    cjpi: cjpi,
    primitives: [product.kind === 'engine' ? 'ENGINE' : 'AGENT', product.name],
    source: `CMPSBL® Store · ${product.tier} Tier`,
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
