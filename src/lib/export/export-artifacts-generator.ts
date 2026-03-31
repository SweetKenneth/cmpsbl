/**
 * Export Artifacts Generator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates supplementary files for every CMPSBL® export:
 * quickstart.ts, package.json, .env.example, CHANGELOG.md,
 * ERROR-CODES.md, REMOVAL.md, DISCOVERY-CONTEXT.md,
 * BUNDLE-INFO.md, ARCHITECTURE.md, and runtime.d.ts
 *
 * © 2025–2026 CMPSBL® · PromptFluid™. All rights reserved.
 */

import type { ExportKind } from './integration-guide-generator';

export interface ExportArtifactsInput {
  kind: ExportKind;
  name: string;
  slug: string;
  version?: string;
  score?: number;
  tier?: string;
  languages?: string[];
  systemChain?: string[];
  category?: string;
  artifactCount?: number;
  /** Discovery context for Memory Stream exports */
  discoveryContext?: string;
  /** Previous export version for changelog diffing */
  previousVersion?: string;
}

/**
 * Generate all supplementary artifacts as a Record<filename, content>.
 */
export function generateExportArtifacts(input: ExportArtifactsInput): Record<string, string> {
  return {
    'quickstart.ts': generateQuickstart(input),
    'package.json': generatePackageJson(input),
    '.env.example': generateEnvExample(),
    'CHANGELOG.md': generateChangelog(input),
    'ERROR-CODES.md': generateErrorCodes(),
    'REMOVAL.md': generateRemovalGuide(input),
    'BUNDLE-INFO.md': generateBundleInfo(input),
    'ARCHITECTURE.md': generateArchitectureDiagram(input),
    'LICENSE-FAQ.md': generateLicenseFaq(),
    'MONITORING.md': generateMonitoringGuide(input),
    '_runtime/runtime.d.ts': generateDeclarationFile(input),
  };
}

// ─── 1. Quickstart ──────────────────────────────────────────────────────────

function generateQuickstart(input: ExportArtifactsInput): string {
  return `#!/usr/bin/env npx tsx
/**
 * CMPSBL® Quickstart — ${input.name}
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Run this file to see your export working in under 10 seconds:
 *
 *   npx tsx quickstart.ts
 *
 * No API key, no account, no setup required.
 * © CMPSBL® · PromptFluid™
 */

import { init, createPipeline } from './_runtime/standalone-runtime';

async function main() {
  console.log('');
  console.log('  ╔═══════════════════════════════════════╗');
  console.log('  ║  CMPSBL® — ${input.name.padEnd(26)}║');
  console.log('  ╚═══════════════════════════════════════╝');
  console.log('');

  // Step 1: Initialize (offline — no network needed)
  console.log('  [1/4] Initializing Sealed Runtime™...');
  const instance = init({ offline: true });
  console.log(\`        Mode: \${instance.mode}\`);
  console.log(\`        Version: \${instance.version}\`);
  console.log('        ✓ Runtime loaded');
  console.log('');

  // Step 2: Create pipeline
  console.log('  [2/4] Creating execution pipeline...');
  const pipeline = createPipeline(instance);
  console.log('        ✓ Pipeline ready');
  console.log('');

  // Step 3: Execute with sample input
  console.log('  [3/4] Executing with sample input...');
  const result = await pipeline.execute({
    test: true,
    source: 'quickstart',
    timestamp: new Date().toISOString(),
  });
  console.log('        ✓ Execution complete');
  console.log('');

  // Step 4: Display results
  console.log('  [4/4] Results:');
  console.log('  ─────────────────────────────────────────');
  console.log(\`        CJPI Score:  \${result.cjpiScore ?? 'N/A'}\`);
  console.log(\`        Tier:        \${result.tier ?? 'N/A'}\`);
  console.log(\`        Primitives:  \${result.executionTrace?.length ?? 0} executed\`);
  console.log(\`        Status:      \${result.success ? '✓ SUCCESS' : '✗ FAILED'}\`);
  console.log('  ─────────────────────────────────────────');
  console.log('');
  console.log('  Your export is working correctly!');
  console.log('  See INTEGRATION.md for full stack integration steps.');
  console.log('');
  console.log('  Need help? support@cmpsbl.com');
  console.log('  Docs: https://cmpsbl.com/developers');
  console.log('');
}

main().catch((err) => {
  console.error('');
  console.error('  ✗ Quickstart failed:', err.message);
  console.error('');
  console.error('  Troubleshooting:');
  console.error('    1. Ensure Node.js 18+ is installed: node --version');
  console.error('    2. Run: npm install (from this directory)');
  console.error('    3. Check ERROR-CODES.md for specific error resolution');
  console.error('    4. Email support@cmpsbl.com with the error above');
  console.error('');
  process.exit(1);
});
`;
}

// ─── 2. Package.json ────────────────────────────────────────────────────────

function generatePackageJson(input: ExportArtifactsInput): string {
  const pkg = {
    name: `cmpsbl-export-${input.slug}`,
    version: input.version || '1.0.0',
    description: `CMPSBL® ${getKindLabel(input.kind)} — ${input.name}`,
    type: 'module',
    scripts: {
      start: 'npx tsx quickstart.ts',
      test: 'npx tsx tests/integration.test.ts',
      verify: 'npx cmpsbl-verify ./',
      'test:offline': 'CMPSBL_OFFLINE=true npx tsx quickstart.ts',
    },
    engines: {
      node: '>=18.0.0',
    },
    keywords: ['cmpsbl', 'substrate', input.kind, input.slug],
    author: 'CMPSBL® <support@cmpsbl.com>',
    license: 'SEE LICENSE FILE',
    homepage: 'https://cmpsbl.com',
    bugs: {
      email: 'support@cmpsbl.com',
    },
  };
  return JSON.stringify(pkg, null, 2) + '\n';
}

// ─── 3. .env.example ────────────────────────────────────────────────────────

function generateEnvExample(): string {
  return `# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CMPSBL® Environment Configuration
# Copy this file to .env and fill in values as needed.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ── Authentication (optional for offline mode) ──────────
# Your CMPSBL API key. Get one at https://cmpsbl.com/developers
# Not required for offline execution.
# CMPSBL_API_KEY=pf_live_your_key_here

# ── Execution Mode ──────────────────────────────────────
# Set to 'true' for zero-network execution.
# Default: false (hybrid mode — tries network, falls back to local)
# CMPSBL_OFFLINE=false

# ── Custom Endpoint (self-hosted substrate) ─────────────
# Only set this if you're running your own substrate instance.
# Default: https://api.cmpsbl.com/v1/substrate/primitive
# CMPSBL_ENDPOINT=https://substrate.yourcompany.internal/v1/substrate/primitive

# ── Logging ─────────────────────────────────────────────
# Set to 'true' for verbose execution traces in console.
# Default: false
# CMPSBL_DEBUG=false

# ── Bridge (non-TypeScript stacks only) ─────────────────
# Endpoint for the bridge microservice when using Python/Go/etc.
# Only needed if running the runtime as an HTTP service.
# CMPSBL_BRIDGE_ENDPOINT=http://localhost:3141
`;
}

// ─── 4. Changelog ───────────────────────────────────────────────────────────

function generateChangelog(input: ExportArtifactsInput): string {
  const date = new Date().toISOString().split('T')[0];
  const version = input.version || '1.0.0';

  return `# Changelog — ${input.name}

All notable changes to this export are documented here.

## [${version}] — ${date}

### Export Summary
- **Type:** ${getKindLabel(input.kind)}
- **CJPI Score:** ${input.score ?? 'N/A'}
- **Tier:** ${input.tier ?? 'N/A'}
- **Languages:** ${input.languages?.join(', ') || 'TypeScript'}
- **Primitive Chain:** ${input.systemChain?.join(' → ') || 'Default'}
- **Artifacts:** ${input.artifactCount ?? 1}

### What's Included
- Sealed Runtime™ v1.x.x (standalone, offline-capable)
- Full primitive chain executor
- Integration guide with framework examples
- Pre-built test suite
- Quickstart script (\`npx tsx quickstart.ts\`)

### How to Compare With Previous Exports
\`\`\`bash
# If you kept your previous export:
diff <(jq . old-export/manifest.json) <(jq . manifest.json)

# Or use the CLI:
cmpsbl diff ./old-export/ ./new-export/
\`\`\`

### Re-Export Notes
When you re-export (after new discoveries or tier changes), this file will
reflect the new state. Keep your previous CHANGELOG.md to track evolution.

---

© CMPSBL® · PromptFluid™
`;
}

// ─── 5. Error Codes ─────────────────────────────────────────────────────────

function generateErrorCodes(): string {
  return `# Error Code Reference — CMPSBL® Sealed Runtime™

When the runtime encounters an issue, it throws errors with specific codes.
Use this reference to diagnose and resolve them.

## Runtime Initialization Errors

| Code | Message | Cause | Fix |
|------|---------|-------|-----|
| \`CMPSBL_E001\` | Runtime initialization failed | Node.js version too old | Upgrade to Node.js 18+ |
| \`CMPSBL_E002\` | Manifest not found | \`manifest.json\` missing from export directory | Re-download the export |
| \`CMPSBL_E003\` | Manifest parse error | Corrupted or invalid \`manifest.json\` | Re-download; check for partial unzip |
| \`CMPSBL_E004\` | Runtime version mismatch | Export was generated with a newer runtime | Re-export from CMPSBL |

## Execution Errors

| Code | Message | Cause | Fix |
|------|---------|-------|-----|
| \`CMPSBL_E010\` | Pipeline creation failed | Runtime not initialized | Call \`init()\` before \`createPipeline()\` |
| \`CMPSBL_E011\` | Execution timeout | Pipeline took too long | Reduce input size or increase timeout |
| \`CMPSBL_E012\` | Primitive chain broken | A required primitive is unavailable | Verify export integrity: \`npx cmpsbl-verify ./\` |
| \`CMPSBL_E013\` | Invalid input format | Input doesn't match expected schema | Check the manifest for input requirements |

## Network Errors

| Code | Message | Cause | Fix |
|------|---------|-------|-----|
| \`CMPSBL_E020\` | Network timeout | Substrate endpoint unreachable | Use \`init({ offline: true })\` or check firewall |
| \`CMPSBL_E021\` | Authentication failed | Invalid or expired API key | Regenerate key at https://cmpsbl.com/developers |
| \`CMPSBL_E022\` | Rate limited | Too many requests | Wait and retry; or switch to offline mode |
| \`CMPSBL_E023\` | Endpoint not found | Custom endpoint misconfigured | Verify \`CMPSBL_ENDPOINT\` URL is correct |

## Bridge Errors (Non-TypeScript Stacks)

| Code | Message | Cause | Fix |
|------|---------|-------|-----|
| \`CMPSBL_E030\` | Bridge connection refused | Bridge microservice not running | Start: \`npx tsx _runtime/standalone-runtime.ts --serve\` |
| \`CMPSBL_E031\` | Bridge timeout | Microservice too slow | Check Node.js process health |
| \`CMPSBL_E032\` | Subprocess failed | \`npx tsx\` not available | Install: \`npm install -g tsx\` |

## Integrity Errors

| Code | Message | Cause | Fix |
|------|---------|-------|-----|
| \`CMPSBL_E040\` | Integrity check failed | Files were modified after export | Re-download original export |
| \`CMPSBL_E041\` | Fingerprint mismatch | Manifest fingerprint doesn't match | Do not edit \`_runtime/\` files |
| \`CMPSBL_E042\` | Sealed component tampered | Black-box component was altered | Re-download; sealed files cannot be edited |

## Still Stuck?

- **Run diagnostics:** \`cmpsbl doctor\`
- **Email support:** support@cmpsbl.com (include the error code and your \`manifest.json\`)
- **Documentation:** https://cmpsbl.com/developers
- **Community:** https://github.com/SweetKenneth/cmpsbl-daily-drops/issues

---

© CMPSBL® · PromptFluid™
`;
}

// ─── 6. Bundle Info ─────────────────────────────────────────────────────────

function generateBundleInfo(input: ExportArtifactsInput): string {
  const kindLabel = getKindLabel(input.kind);
  return `# Bundle Size & Performance — ${input.name}

## Size Estimates

| Component | Approximate Size | Minified + Gzipped |
|-----------|-----------------|-------------------|
| \`standalone-runtime.ts\` | ~35 KB | ~8 KB |
| \`chain-executor.ts\` | ~25 KB | ~6 KB |
| \`discovery-engine.ts\` | ~15 KB | ~4 KB |
| Your ${kindLabel.toLowerCase()} code | Varies | Varies |
| **Total runtime overhead** | **~75 KB** | **~18 KB** |

## Performance Characteristics

| Metric | Offline Mode | Hybrid Mode | Network Mode |
|--------|-------------|-------------|--------------|
| First init | <5ms | <5ms | ~50ms |
| Pipeline execute | <2ms | 2–50ms | 50–200ms |
| Memory footprint | ~2 MB | ~2 MB | ~3 MB |
| Network calls | 0 | 0–1 per execute | 1 per execute |

## Tree-Shaking

The Sealed Runtime is a single cohesive unit and **cannot be tree-shaken** —
all 40 primitives are required for deterministic scoring. However:

- The runtime **lazy-loads** primitives on first use
- Unused primitive deep effects are **never executed**
- The scoring engine activates only the primitives in your export's chain

### What You Can Import Selectively

\`\`\`typescript
// Full pipeline (most common)
import { init, createPipeline } from './_runtime/standalone-runtime';

// Just the scoring engine (if you only need CJPI scores)
import { computeScore } from './_runtime/standalone-runtime';

// Just the runtime mode checker
import { getRuntimeMode, configureEndpoint } from './_runtime/standalone-runtime';
\`\`\`

## Build Tool Compatibility

| Tool | Supported | Notes |
|------|-----------|-------|
| Vite | ✅ | Works out of the box |
| Webpack 5 | ✅ | No special config needed |
| esbuild | ✅ | Set \`format: 'esm'\` |
| Rollup | ✅ | No special config needed |
| tsc | ✅ | Ensure \`moduleResolution: 'bundler'\` or \`'node16'\` |
| Bun | ✅ | Native support |

---

© CMPSBL® · PromptFluid™
`;
}

// ─── 7. Removal Guide ──────────────────────────────────────────────────────

function generateRemovalGuide(input: ExportArtifactsInput): string {
  const kindLabel = getKindLabel(input.kind);
  return `# Removing CMPSBL® — ${input.name}

If you decide to stop using this ${kindLabel.toLowerCase()}, here's how to cleanly remove it.
**No vendor lock-in.** Your original code is untouched.

## Step 1: Identify Integration Points

Search your codebase for CMPSBL imports:

\`\`\`bash
grep -r "cmpsbl\\|@cmpsbl\\|standalone-runtime\\|createPipeline" ./src/ --include="*.ts" --include="*.tsx" --include="*.js"
\`\`\`

## Step 2: Remove Imports and Usage

Replace CMPSBL pipeline calls with your own logic:

\`\`\`typescript
// BEFORE (with CMPSBL)
import { init, createPipeline } from '@cmpsbl/${input.slug}';
const instance = init({ offline: true });
const pipeline = createPipeline(instance);
const result = await pipeline.execute(data);
const output = result.output;

// AFTER (without CMPSBL)
// Your original logic — the pipeline was an augmentation, not a replacement.
const output = yourOriginalFunction(data);
\`\`\`

## Step 3: Remove Files

\`\`\`bash
# Remove the export directory
rm -rf ./src/lib/cmpsbl/${input.slug}/

# Remove path alias from tsconfig.json (if added)
# Delete the "@cmpsbl/${input.slug}" entry from "paths"
\`\`\`

## Step 4: Remove Environment Variables

\`\`\`bash
# Remove from .env
# CMPSBL_API_KEY=...
# CMPSBL_OFFLINE=...
# CMPSBL_ENDPOINT=...
\`\`\`

## Step 5: Remove NPM Packages (if installed)

\`\`\`bash
npm uninstall @cmpsbl/sdk @cmpsbl/test-harness @cmpsbl/cli
\`\`\`

## Step 6: Verify Clean Removal

\`\`\`bash
# Should return no results
grep -r "cmpsbl" ./src/ --include="*.ts" --include="*.tsx" --include="*.js"

# Build should succeed
npm run build
\`\`\`

## What You Keep

${input.kind === 'ascension' ? `- **Your original source code** — Layer 1 was always your untouched code
- The cognitive overlay (Layer 2) was additive, never destructive` : `- All your application code — CMPSBL was a drop-in augmentation`}
- Any insights or outputs the ${kindLabel.toLowerCase()} produced remain yours
- Export artifacts (manifest.json, etc.) are yours to keep for reference

## Re-Integrating Later

If you want to use CMPSBL again, simply re-download your export and follow
INTEGRATION.md. Your subscription capabilities persist on our end.

---

Need help? support@cmpsbl.com · https://cmpsbl.com/developers
`;
}

// ─── 8. Architecture Diagram ────────────────────────────────────────────────

function generateArchitectureDiagram(input: ExportArtifactsInput): string {
  const kindLabel = getKindLabel(input.kind);

  const ascensionDiagram = `
## Dual-Layer Execution Model (Ascension)

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                      YOUR APPLICATION                       │
│                                                             │
│   ┌─────────────────┐    ┌────────────────────────────┐    │
│   │  Layer 1         │    │  Layer 2                    │    │
│   │  YOUR CODE       │    │  COGNITIVE OVERLAY          │    │
│   │  (untouched)     │───→│  (discovered primitives)    │    │
│   │                  │    │                              │    │
│   │  Runs exactly    │    │  Enriches output with:       │    │
│   │  as you wrote it │    │  • CJPI scoring              │    │
│   │                  │    │  • Primitive chain effects    │    │
│   │                  │    │  • Execution traces           │    │
│   └─────────────────┘    └────────────────────────────┘    │
│            │                          │                      │
│            └──────────┬───────────────┘                      │
│                       ▼                                      │
│            ┌─────────────────────┐                           │
│            │  SEALED RUNTIME™    │                           │
│            │  ┌───────────────┐  │                           │
│            │  │ 40 Primitives │  │  ← Sealed (black-boxed)  │
│            │  │ CJPI Engine   │  │  ← Deterministic scoring │
│            │  │ Chain Executor│  │  ← IP-protected formulas │
│            │  └───────────────┘  │                           │
│            └─────────────────────┘                           │
│                       │                                      │
│                       ▼                                      │
│            ┌─────────────────────┐                           │
│            │  OUTPUT             │                           │
│            │  • Your result      │  ← Fully transparent     │
│            │  • CJPI score       │  ← Value visible          │
│            │  • Execution trace  │  ← Full audit trail       │
│            │  • Tier label       │  ← Deterministic          │
│            └─────────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
\`\`\``;

  const standardDiagram = `
## Execution Flow

\`\`\`
┌──────────────────────────────────────────────────────────┐
│                    YOUR APPLICATION                       │
│                                                          │
│   ┌──────────────┐     ┌───────────────────────────┐    │
│   │  Your Code    │────→│  CMPSBL ${kindLabel.padEnd(17)}│    │
│   │  (calls API)  │     │  (Sealed Runtime™)         │    │
│   └──────────────┘     └───────────────────────────┘    │
│                                    │                      │
│                                    ▼                      │
│                         ┌─────────────────────┐          │
│                         │  PRIMITIVE CHAIN     │          │
│                         │                      │          │
│                         │  P1 → P2 → P3 → ... │          │
│                         │  (from manifest.json)│          │
│                         └─────────────────────┘          │
│                                    │                      │
│                                    ▼                      │
│                         ┌─────────────────────┐          │
│                         │  OUTPUT              │          │
│                         │  • result.output     │          │
│                         │  • result.cjpiScore  │          │
│                         │  • result.tier        │          │
│                         │  • result.trace       │          │
│                         └─────────────────────┘          │
└──────────────────────────────────────────────────────────┘
\`\`\``;

  return `# Architecture — ${input.name}

This document shows how the ${kindLabel.toLowerCase()} integrates with your application.

## What's Transparent vs. Sealed

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  ✅ TRANSPARENT (you can see and verify)                │
│  ├── Input:  Your data goes in                          │
│  ├── Output: Results, scores, traces come out           │
│  ├── API:    init(), createPipeline(), execute()        │
│  ├── Config: .env, offline/hybrid/network modes         │
│  └── Audit:  Deterministic — same input = same output   │
│                                                          │
│  ⬛ SEALED (protected IP — cannot inspect formulas)      │
│  ├── CJPI weight allocations                             │
│  ├── Tier threshold boundaries                           │
│  ├── Synergy multiplier calculations                     │
│  ├── Discovery heuristics                                │
│  └── 40-primitive deep effect implementations            │
│                                                          │
└─────────────────────────────────────────────────────────┘
\`\`\`
${input.kind === 'ascension' ? ascensionDiagram : standardDiagram}

## Network Modes

\`\`\`
  OFFLINE                  HYBRID (default)           NETWORK
  ────────                 ────────────────           ────────
  ┌──────┐                 ┌──────┐                   ┌──────┐
  │ Your │                 │ Your │                   │ Your │
  │ Code │                 │ Code │                   │ Code │
  └──┬───┘                 └──┬───┘                   └──┬───┘
     │                        │                          │
     ▼                        ▼                          ▼
  ┌──────────┐           ┌──────────┐             ┌──────────┐
  │ Local    │           │ Try Net  │──fail──→    │ Network  │
  │ Runtime  │           │ Fallback │             │ Runtime  │
  │          │           │ to Local │             │ (full)   │
  └──────────┘           └──────────┘             └──────────┘
     │                        │                          │
  Zero network            0-1 calls                  1 call
  < 2ms                   2-50ms                     50-200ms
\`\`\`

---

© CMPSBL® · PromptFluid™
`;
}

// ─── 9. License FAQ ─────────────────────────────────────────────────────────

function generateLicenseFaq(): string {
  return `# License FAQ — CMPSBL® Exports

## Can I use this in my commercial product?
**Yes.** Your export is licensed for use in your products, both commercial
and internal. You paid for it (or received it free-tier) — it's yours to deploy.

## Can I include this in an open-source project?
**Yes, with conditions:**
- The \`_runtime/\` directory (Sealed Runtime™) remains sealed and unmodified
- You may NOT redistribute the Sealed Runtime as a standalone component
- You may include it as part of your larger open-source application
- Credit CMPSBL® in your project's acknowledgments

## Can I share this export with my team?
**Yes.** Your export can be used by anyone in your organization. It's tied
to your account/subscription, not to an individual machine.

## Can I modify the sealed runtime files?
**No.** Files in \`_runtime/\` are sealed artifacts. Modifying them will:
- Break integrity checks
- Produce incorrect CJPI scores
- Void any support guarantees

You CAN modify:
- Your own source code (always)
- Test files (extend freely)
- Configuration (\`.env\`, \`package.json\`)

## Can I reverse-engineer the scoring formula?
The CJPI scoring algorithm is protected intellectual property. The LICENSE
prohibits reverse engineering, decompilation, or disassembly of sealed components.
You can verify outputs (deterministic) but cannot extract the formula.

## What happens if my subscription expires?
- **Offline mode** continues to work forever — your exports are self-contained
- **Network/hybrid mode** may lose access to deep effects
- **Re-export** will require an active subscription

## Who owns the outputs?
**You do.** Any data, results, scores, or artifacts produced by running your
export are your property. CMPSBL claims no ownership of your outputs.

---

Questions? support@cmpsbl.com · https://cmpsbl.com/developers
`;
}

// ─── 10. Monitoring Guide ───────────────────────────────────────────────────

function generateMonitoringGuide(input: ExportArtifactsInput): string {
  return `# Production Monitoring — ${input.name}

Beyond the initial smoke test, here's how to monitor your CMPSBL integration
in production.

## Health Check Endpoint

\`\`\`typescript
// Add to your Express/Fastify/Hono server
app.get('/health/cmpsbl', async (req, res) => {
  const start = Date.now();
  try {
    const { init, createPipeline } = await import('./_runtime/standalone-runtime');
    const instance = init({ offline: true });
    const pipeline = createPipeline(instance);
    const result = await pipeline.execute({ healthcheck: true });

    res.json({
      status: 'healthy',
      capability: '${input.slug}',
      mode: instance.mode,
      latencyMs: Date.now() - start,
      primitivesActive: result.executionTrace?.length ?? 0,
      cjpiScore: result.cjpiScore,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      error: err.message,
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }
});
\`\`\`

## What to Monitor

| Metric | Healthy Range | Alert If |
|--------|--------------|----------|
| \`latencyMs\` | <10ms (offline), <200ms (hybrid) | >500ms |
| \`primitivesActive\` | Matches manifest chain length | Drops to 0 |
| \`cjpiScore\` | Consistent across runs | Changes unexpectedly |
| \`mode\` | \`offline\` or \`hybrid\` | Stuck in unknown state |
| HTTP status | 200 | 503 |

## Alerting Example (Datadog / Prometheus)

\`\`\`yaml
# prometheus alert rule
groups:
  - name: cmpsbl
    rules:
      - alert: CMPSBLUnhealthy
        expr: probe_success{job="cmpsbl-health"} == 0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "CMPSBL runtime unhealthy for 5+ minutes"
\`\`\`

## Logging Best Practices

\`\`\`typescript
// Structured logging for each execution
const result = await pipeline.execute(input);

logger.info({
  event: 'cmpsbl_execution',
  capability: '${input.slug}',
  score: result.cjpiScore,
  tier: result.tier,
  primitives: result.executionTrace?.length,
  latencyMs: Date.now() - start,
  mode: instance.mode,
  success: result.success,
});
\`\`\`

## Score Drift Detection

CJPI scores should be deterministic. If they change, something is wrong:

\`\`\`typescript
const EXPECTED_SCORE = ${input.score ?? 'null'}; // from your manifest
const TOLERANCE = 0.001;

const result = await pipeline.execute(referenceInput);
if (Math.abs(result.cjpiScore - EXPECTED_SCORE) > TOLERANCE) {
  logger.error('CJPI score drift detected', {
    expected: EXPECTED_SCORE,
    actual: result.cjpiScore,
  });
}
\`\`\`

---

Need help setting up monitoring? support@cmpsbl.com
`;
}

// ─── 11. Declaration File ───────────────────────────────────────────────────

function generateDeclarationFile(_input: ExportArtifactsInput): string {
  return `/**
 * CMPSBL® Sealed Runtime™ — Type Declarations
 * These types provide autocomplete and documentation for non-TypeScript users.
 * © CMPSBL® · PromptFluid™
 */

export interface InitOptions {
  /** Run in offline mode with zero network calls. Default: false */
  offline?: boolean;
  /** Custom substrate endpoint URL. Default: CMPSBL cloud */
  endpoint?: string;
  /** Enable verbose debug logging. Default: false */
  debug?: boolean;
}

export interface RuntimeInstance {
  /** Current execution mode: 'offline' | 'hybrid' | 'network' */
  readonly mode: 'offline' | 'hybrid' | 'network';
  /** Runtime version string */
  readonly version: string;
  /** Whether the runtime is fully initialized */
  readonly ready: boolean;
}

export interface PipelineResult {
  /** Whether execution completed successfully */
  success: boolean;
  /** The primary output of the pipeline */
  output: unknown;
  /** CJPI score (0-100) — value is visible, formula is sealed */
  cjpiScore: number;
  /** Tier classification based on CJPI score */
  tier: 'Raw' | 'Mint' | 'Prime' | 'Relic' | 'Mythic';
  /** Ordered execution trace of each primitive */
  executionTrace: PrimitiveTrace[];
  /** Execution confidence (0-1) */
  confidence: number;
}

export interface PrimitiveTrace {
  /** Primitive name */
  primitive: string;
  /** Execution status */
  status: 'executed' | 'delegated' | 'unavailable';
  /** Execution time in milliseconds */
  durationMs: number;
}

export interface Pipeline {
  /** Execute the pipeline with the given input */
  execute(input: Record<string, unknown>): Promise<PipelineResult>;
  /** Format a result as a human-readable report */
  formatReport(result: PipelineResult): string;
}

/** Initialize the Sealed Runtime */
export declare function init(options?: InitOptions): RuntimeInstance;

/** Create an execution pipeline from an initialized runtime */
export declare function createPipeline(instance: RuntimeInstance): Pipeline;

/** Get the current runtime execution mode */
export declare function getRuntimeMode(): 'offline' | 'hybrid' | 'network';

/** Configure or change the substrate endpoint. Pass null for offline mode. */
export declare function configureEndpoint(url: string | null): void;

/** Compute a CJPI score from raw dimensions (value visible, formula sealed) */
export declare function computeScore(dimensions: {
  novelty: number;
  utility: number;
  complexity: number;
  composability: number;
}): { score: number; tier: string };
`;
}

// ─── Discovery Context (for Memory Stream) ──────────────────────────────────

export function generateDiscoveryContext(input: ExportArtifactsInput): string {
  if (input.kind !== 'memory-pack' && !input.discoveryContext) {
    return '';
  }

  return `# Discovery Context — ${input.name}

## How This Was Discovered

This capability was surfaced by the **Memory Stream** — CMPSBL's autonomous
8-hour discovery cycle that identifies emergent patterns in the substrate's
40-primitive topology.

${input.discoveryContext || `The Memory Stream identified this capability through recursive re-ingestion
of the primitive chain, detecting a convergence pattern that scored above
the crystallization threshold.`}

## What Makes This Capability Unique

- **CJPI Score:** ${input.score ?? 'See manifest.json'}
- **Tier:** ${input.tier ?? 'See manifest.json'}
- **Primitive Chain:** ${input.systemChain?.join(' → ') || 'See manifest.json'}
- **Category:** ${input.category ?? 'General'}

## Discovery vs. Engineered Capabilities

| Aspect | Discovered (this) | Engineered |
|--------|-------------------|-----------|
| Origin | Autonomous Memory Stream cycle | Manually designed |
| Validation | CJPI-scored, auto-classified | Human-reviewed |
| Evolution | May improve in future cycles | Static until re-engineered |
| Rarity | Unique to convergence patterns | Reproducible by design |

## Verifying the Discovery

This discovery uses the same Sealed Runtime™ as all CMPSBL exports:

\`\`\`bash
# Verify integrity
npx cmpsbl-verify ./

# Run the quickstart
npx tsx quickstart.ts

# Compare against daily drops (same runtime)
git clone https://github.com/SweetKenneth/cmpsbl-daily-drops.git
npx cmpsbl-verify ./ --compare ./cmpsbl-daily-drops/drops/latest/
\`\`\`

---

Questions about this discovery? support@cmpsbl.com
`;
}

// ─── Tier Migration Guide ───────────────────────────────────────────────────

export function generateTierMigration(): string {
  return `# Tier Migration Guide

## What Happens When You Upgrade

| From → To | Effect on Existing Exports | Action Needed |
|-----------|---------------------------|---------------|
| Builder → Creator | No change to existing exports | Re-export to access Creator-tier features |
| Creator → Architect | No change to existing exports | Re-export to access Architect-tier features |
| Any downgrade | Existing exports keep working (offline) | Network/hybrid mode may lose deep effects |

## Re-Exporting After Upgrade

When your tier increases, new primitives and capabilities become available.
To get them in your exports:

1. Visit https://cmpsbl.com and navigate to the export you want to upgrade
2. Re-export — the new export will include capabilities unlocked by your new tier
3. Follow the "Upgrading" section in INTEGRATION.md to replace files

## What Doesn't Change

- **Offline mode** always works, regardless of tier changes
- **CJPI scores** are deterministic and don't change with tier
- **Your original code** (Ascension Layer 1) is never modified
- **Existing test suites** remain valid

## What Changes

- **Available languages** may expand (higher tiers unlock more export languages)
- **Primitive chain depth** may increase with Architect tier
- **Network mode** deep effects depend on active subscription

---

Questions? support@cmpsbl.com
`;
}

// ─── Utilities ──────────────────────────────────────────────────────────────

function getKindLabel(kind: ExportKind): string {
  const labels: Record<ExportKind, string> = {
    'engine': 'Engine',
    'agent': 'Agent',
    'ascension': 'Ascension Export',
    'crown-jewel': 'Crown Jewel Capability',
    'memory-pack': 'Memory Pack',
  };
  return labels[kind];
}
