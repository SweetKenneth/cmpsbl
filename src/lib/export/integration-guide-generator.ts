/**
 * Integration Guide Generator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates detailed, export-type-specific INTEGRATION.md files
 * with step-by-step instructions for placing exported CMPSBL® software
 * into the user's existing stack, plus verification/testing steps.
 *
 * © 2025–2026 CMPSBL® · PromptFluid™. All rights reserved.
 */

export type ExportKind = 'engine' | 'agent' | 'ascension' | 'crown-jewel' | 'memory-pack';

export interface IntegrationGuideInput {
  kind: ExportKind;
  name: string;
  slug: string;
  /** Languages included in this export */
  languages?: string[];
  /** Primitive chain involved */
  systemChain?: string[];
  /** CJPI score */
  score?: number;
  /** Category label */
  category?: string;
  /** Number of artifacts (for multi-artifact exports) */
  artifactCount?: number;
}

/**
 * Generate a comprehensive INTEGRATION.md for any export type.
 */
export function generateIntegrationGuide(input: IntegrationGuideInput): string {
  const sections = [
    generateHeader(input),
    generatePrerequisites(input),
    generateFileInventory(input),
    generateStepByStepIntegration(input),
    generateFrameworkExamples(input),
    generateTestingVerification(input),
    generateTroubleshooting(input),
    generateNetworkModes(input),
    generateUpgrading(input),
    generateFooter(),
  ];

  return sections.join('\n\n');
}

// ─── Header ──────────────────────────────────────────────────────────────────

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

function generateHeader(input: IntegrationGuideInput): string {
  const kindLabel = getKindLabel(input.kind);
  return `# Integration Guide — ${input.name}

> **Export Type:** ${kindLabel}
> **Generated:** ${new Date().toISOString().split('T')[0]}
> **Runtime:** CMPSBL® Sealed Runtime™
> **Zero Dependencies Required:** Yes — this export is fully self-contained.

This guide walks you through exactly how to place this ${kindLabel.toLowerCase()} into your existing stack, configure it for your environment, and verify it works correctly.`;
}

// ─── Prerequisites ───────────────────────────────────────────────────────────

function generatePrerequisites(input: IntegrationGuideInput): string {
  const base = `---

## 1. Prerequisites

Before integrating, ensure your environment meets these requirements:

| Requirement | Minimum | Recommended |
|------------|---------|-------------|
| Node.js | 18.x | 20.x or 22.x LTS |
| TypeScript | 5.0+ | 5.4+ |
| Package Manager | npm 9+ | pnpm 8+ or bun 1.x |
| Disk Space | 10 MB | 50 MB (with test artifacts) |`;

  if (input.kind === 'ascension') {
    return base + `

### Ascension-Specific Requirements

- The **original source file** you uploaded to Ascension (for reference)
- Your project's existing build pipeline (Webpack, Vite, esbuild, Rollup, etc.)
- If your original code was non-JS/TS: the appropriate language runtime for Layer 1 execution
  (e.g., Python 3.8+, Rust toolchain, Go 1.21+, PHP 8.0+)`;
  }

  return base;
}

// ─── File Inventory ──────────────────────────────────────────────────────────

function generateFileInventory(input: IntegrationGuideInput): string {
  const kindLabel = getKindLabel(input.kind);

  let fileTree: string;

  switch (input.kind) {
    case 'ascension':
      fileTree = `\`\`\`
📦 ${input.slug}/
├── 📄 manifest.json              ← Export metadata, CJPI score, primitive chain
├── 📁 _runtime/
│   ├── standalone-runtime.ts     ← Mini-Runtime™ (network-aware, offline-capable)
│   ├── chain-executor.ts         ← Sealed 40-primitive execution matrix
│   └── discovery-engine.ts       ← Template injection and synthesis reactor
├── 📁 src/
│   ├── original.*                ← Your original source code (UNTOUCHED)
│   ├── cognitive-overlay.ts      ← Layer 2: Discovered primitive augmentations
│   └── index.ts                  ← Unified entry point (Layer 1 + Layer 2)
├── 📁 tests/
│   ├── integration.test.ts       ← Verify both layers execute correctly
│   └── standalone.test.ts        ← Offline-mode validation
├── 📄 INTEGRATION.md             ← This file
├── 📄 README.md                  ← Auto-generated documentation
└── 📄 LICENSE                    ← Export license terms
\`\`\``;
      break;

    case 'crown-jewel':
      fileTree = `\`\`\`
📦 ${input.slug}/
├── 📄 manifest.json              ← Capability metadata, CJPI tier, fingerprint
├── 📄 export-tier.json           ← Score, tier, valuation, unlocked languages
├── 📁 _runtime/
│   └── standalone-runtime.ts     ← Mini-Runtime™ (network-aware, offline-capable)
├── 📁 src/
│   ├── ${input.slug}.ts          ← Primary capability implementation
│   └── [language-variants]/      ← Additional language exports (if unlocked)
├── 📄 MEMORY-CHAIN-DETAILS.html  ← In-depth capability report
├── 📄 INTEGRATION.md             ← This file
└── 📄 README.md                  ← Auto-generated documentation
\`\`\``;
      break;

    default:
      fileTree = `\`\`\`
📦 ${input.slug}/
├── 📄 manifest.json              ← ${kindLabel} metadata and configuration
├── 📁 _runtime/
│   ├── standalone-runtime.ts     ← Mini-Runtime™ (network-aware, offline-capable)
│   ├── chain-executor.ts         ← Sealed 40-primitive execution matrix
│   └── discovery-engine.ts       ← Template injection and synthesis reactor
├── 📁 src/
│   └── ${input.slug}.ts          ← Primary ${kindLabel.toLowerCase()} implementation
├── 📁 tests/
│   └── integration.test.ts       ← Verification test suite
├── 📄 INTEGRATION.md             ← This file
└── 📄 README.md                  ← Auto-generated documentation
\`\`\``;
  }

  return `---

## 2. What's In This Export

${fileTree}

### Key Files to Understand

| File | Purpose | Do You Edit It? |
|------|---------|----------------|
| \`manifest.json\` | Describes the export, its CJPI score, and primitive chain | ❌ No — read-only reference |
| \`_runtime/standalone-runtime.ts\` | Self-contained runtime engine | ❌ No — sealed artifact |
| \`src/index.ts\` or \`src/${input.slug}.ts\` | Your entry point for using this capability | ✅ Yes — import from here |
| \`tests/\` | Pre-built verification suite | ✅ Yes — extend with your own tests |`;
}

// ─── Step-by-Step Integration ────────────────────────────────────────────────

function generateStepByStepIntegration(input: IntegrationGuideInput): string {
  const kindLabel = getKindLabel(input.kind);

  const dropInSteps = generateDropInSteps(input);
  const npmSteps = generateNpmSteps(input);
  const cliSteps = generateCliSteps(input);

  return `---

## 3. Step-by-Step Integration

Choose the integration method that fits your workflow:

### Method A: Drop-In (Copy to Your Project)

Best for: Prototyping, air-gapped environments, or when you want full control.

${dropInSteps}

### Method B: NPM / SDK (Recommended for Production)

Best for: Teams, CI/CD pipelines, automatic updates.

${npmSteps}

### Method C: CLI Activation

Best for: Quick activation of subscription-included capabilities.

${cliSteps}`;
}

function generateDropInSteps(input: IntegrationGuideInput): string {
  const targetDir = input.kind === 'ascension'
    ? `lib/cmpsbl/${input.slug}`
    : input.kind === 'crown-jewel'
      ? `lib/cmpsbl/capabilities/${input.slug}`
      : `lib/cmpsbl/${input.kind}s/${input.slug}`;

  return `**Step 1: Copy the export folder into your project**

\`\`\`bash
# From your project root
cp -r ./${input.slug}/ ./src/${targetDir}/
\`\`\`

**Step 2: Add the path alias (recommended)**

If using TypeScript with path aliases, add to your \`tsconfig.json\`:

\`\`\`json
{
  "compilerOptions": {
    "paths": {
      "@cmpsbl/${input.slug}": ["./src/${targetDir}/src/index.ts"],
      "@cmpsbl/${input.slug}/*": ["./src/${targetDir}/src/*"]
    }
  }
}
\`\`\`

**Step 3: Import and use**

\`\`\`typescript
// With path alias
import { init, createPipeline } from '@cmpsbl/${input.slug}';

// Or with relative import
import { init, createPipeline } from './src/${targetDir}/src/index';

// Initialize (standalone — no network required)
const instance = init({ offline: true });

// Create a pipeline and execute
const pipeline = createPipeline(instance);
const result = await pipeline.execute({ your: 'input-data' });
console.log(result.output);
\`\`\`

**Step 4: Verify the runtime loads**

\`\`\`typescript
import { getRuntimeMode } from './src/${targetDir}/_runtime/standalone-runtime';

// Should print 'offline' or 'hybrid' depending on network
console.log('Runtime mode:', getRuntimeMode());
\`\`\``;
}

function generateNpmSteps(input: IntegrationGuideInput): string {
  return `**Step 1: Install the SDK**

\`\`\`bash
npm install @cmpsbl/sdk
# or
pnpm add @cmpsbl/sdk
# or
bun add @cmpsbl/sdk
\`\`\`

**Step 2: Configure your API key**

\`\`\`bash
# Option A: Environment variable (recommended for CI/CD)
export CMPSBL_API_KEY=pf_live_your_key_here

# Option B: .env file
echo "CMPSBL_API_KEY=pf_live_your_key_here" >> .env

# Option C: CLI login (stores in ~/.cmpsbl/credentials)
npx @cmpsbl/cli login
\`\`\`

**Step 3: Import and use**

\`\`\`typescript
import CMPSBL from '@cmpsbl/sdk';

const client = new CMPSBL(); // Auto-resolves credentials

// The ${input.name} capability activates automatically
// based on your subscription tier
const result = await client.execute({
  capability: '${input.slug}',
  input: { your: 'data' },
});

console.log(result.output);
\`\`\`

**Step 4: Verify activation**

\`\`\`bash
npx @cmpsbl/cli status
# Should show: ${input.name} ✓ Active
\`\`\``;
}

function generateCliSteps(input: IntegrationGuideInput): string {
  const activateCmd = input.kind === 'crown-jewel'
    ? `cmpsbl capabilities activate ${input.slug}`
    : input.kind === 'ascension'
      ? `cmpsbl ascension activate ${input.slug}`
      : `cmpsbl ${input.kind}s activate ${input.slug}`;

  return `**Step 1: Install the CLI**

\`\`\`bash
npm install -g @cmpsbl/cli
\`\`\`

**Step 2: Authenticate**

\`\`\`bash
cmpsbl login
\`\`\`

**Step 3: Activate the capability**

\`\`\`bash
${activateCmd}
\`\`\`

**Step 4: Verify**

\`\`\`bash
cmpsbl status
# ┌─────────────────────┬────────┬──────────┐
# │ Capability          │ Status │ Mode     │
# ├─────────────────────┼────────┼──────────┤
# │ ${input.name.padEnd(20)}│ Active │ Hybrid   │
# └─────────────────────┴────────┴──────────┘
\`\`\``;
}

// ─── Framework Examples ──────────────────────────────────────────────────────

function generateFrameworkExamples(input: IntegrationGuideInput): string {
  return `---

## 4. Framework-Specific Integration

### React / Next.js

\`\`\`typescript
// hooks/use-${input.slug}.ts
import { useState, useCallback } from 'react';
import { init, createPipeline } from '@cmpsbl/${input.slug}';

const instance = init({ offline: false }); // hybrid mode

export function use${toPascalCase(input.slug)}() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const execute = useCallback(async (input: Record<string, any>) => {
    setLoading(true);
    try {
      const pipeline = createPipeline(instance);
      const output = await pipeline.execute(input);
      setResult(output);
      return output;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, result, loading };
}
\`\`\`

### Express / Node.js Server

\`\`\`typescript
// routes/${input.slug}.ts
import { Router } from 'express';
import { init, createPipeline } from '@cmpsbl/${input.slug}';

const router = Router();
const instance = init({ offline: false });

router.post('/process', async (req, res) => {
  try {
    const pipeline = createPipeline(instance);
    const result = await pipeline.execute(req.body);
    res.json({ success: true, data: result.output });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
\`\`\`

### Python (via Bridge Adapter)

If your stack is Python-based, use the bridge adapter pattern:

\`\`\`python
# cmpsbl_bridge.py
import subprocess
import json

def execute_capability(input_data: dict) -> dict:
    """Execute the CMPSBL capability via the Node.js bridge."""
    result = subprocess.run(
        ['node', '-e', f"""
          const {{ init, createPipeline }} = require('./_runtime/standalone-runtime');
          const instance = init({{ offline: true }});
          const pipeline = createPipeline(instance);
          pipeline.execute({json.dumps(input_data)}).then(r => {{
            process.stdout.write(JSON.stringify(r.output));
          }});
        """],
        capture_output=True, text=True, cwd='./lib/cmpsbl/${input.slug}'
    )
    return json.loads(result.stdout)

# Usage
result = execute_capability({"your": "data"})
print(result)
\`\`\`

### Docker / Containerized Deployment

\`\`\`dockerfile
# Include the export in your container
COPY ./${input.slug}/ /app/lib/cmpsbl/${input.slug}/

# Ensure Node.js is available for the runtime
RUN npm install --prefix /app/lib/cmpsbl/${input.slug}/ || true
\`\`\``;
}

// ─── Testing & Verification ─────────────────────────────────────────────────

function generateTestingVerification(input: IntegrationGuideInput): string {
  return `---

## 5. Testing & Verification

### Quick Smoke Test

Run this immediately after integration to confirm everything works:

\`\`\`bash
# From the export directory
npx tsx tests/integration.test.ts
\`\`\`

### Manual Verification Checklist

Run through each of these checks after placing the files in your stack:

- [ ] **Import resolves** — No "module not found" errors when importing
- [ ] **Runtime initializes** — \`init()\` returns without throwing
- [ ] **Offline mode works** — \`init({ offline: true })\` succeeds without network
- [ ] **Pipeline executes** — \`pipeline.execute({})\` returns a result object
- [ ] **Manifest is valid** — \`manifest.json\` parses correctly and contains expected fields
- [ ] **No dependency conflicts** — Your existing \`node_modules\` has no version collisions

### Automated Test Script

Create this file in your project to run a full integration test:

\`\`\`typescript
// tests/cmpsbl-integration.test.ts
import { describe, it, expect } from 'vitest'; // or jest, mocha, etc.
import { init, createPipeline } from '@cmpsbl/${input.slug}';

describe('${input.name} Integration', () => {
  it('should initialize in offline mode', () => {
    const instance = init({ offline: true });
    expect(instance).toBeDefined();
    expect(instance.mode).toBe('offline');
  });

  it('should create a pipeline', () => {
    const instance = init({ offline: true });
    const pipeline = createPipeline(instance);
    expect(pipeline).toBeDefined();
    expect(typeof pipeline.execute).toBe('function');
  });

  it('should execute and return a result', async () => {
    const instance = init({ offline: true });
    const pipeline = createPipeline(instance);
    const result = await pipeline.execute({ test: true });

    expect(result).toBeDefined();
    expect(result.output).toBeDefined();
    expect(result.executionTrace).toBeDefined();
    expect(result.executionTrace.length).toBeGreaterThan(0);
  });

  it('should include CJPI score in execution trace', async () => {
    const instance = init({ offline: true });
    const pipeline = createPipeline(instance);
    const result = await pipeline.execute({ test: true });

    // Verify the primitive chain executed
    expect(result.executionTrace).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          primitive: expect.any(String),
          status: expect.stringMatching(/^(executed|delegated)$/),
        }),
      ])
    );
  });
});
\`\`\`

### Runtime Mode Verification

\`\`\`typescript
import { getRuntimeMode, configureEndpoint } from './_runtime/standalone-runtime';

// Test each mode
console.log('Current mode:', getRuntimeMode()); // 'hybrid'

// Force offline
configureEndpoint(null);
console.log('Offline mode:', getRuntimeMode()); // 'offline'

// Test custom endpoint (self-hosted substrate)
configureEndpoint('https://your-substrate.internal/v1/substrate/primitive');
console.log('Custom mode:', getRuntimeMode()); // 'network'
\`\`\`

### Health Check Endpoint (for Production)

Add this to your server to monitor the integration:

\`\`\`typescript
app.get('/health/cmpsbl', async (req, res) => {
  try {
    const instance = init({ offline: true });
    const pipeline = createPipeline(instance);
    const result = await pipeline.execute({ healthcheck: true });

    res.json({
      status: 'healthy',
      capability: '${input.slug}',
      mode: instance.mode,
      primitivesAvailable: result.executionTrace.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});
\`\`\``;
}

// ─── Troubleshooting ─────────────────────────────────────────────────────────

function generateTroubleshooting(input: IntegrationGuideInput): string {
  return `---

## 6. Troubleshooting

### Common Issues

| Problem | Cause | Solution |
|---------|-------|---------|
| \`Cannot find module\` | Path alias not configured | Add the tsconfig path alias from Step 2 above |
| \`init() is not a function\` | Wrong import path | Import from \`src/index.ts\`, not from \`_runtime/\` |
| \`Network timeout\` | Substrate endpoint unreachable | Use \`init({ offline: true })\` or check firewall rules |
| \`CJPI score is 0\` | Running in offline mode without cached data | Execute once in hybrid/network mode to cache scores |
| \`TypeScript errors\` | Incompatible TS version | Ensure TypeScript 5.0+ in your project |
| \`ESM/CJS conflict\` | Module format mismatch | See the module format section below |

### Module Format (ESM vs CommonJS)

This export uses **ESM** (ES Modules) by default. If your project uses CommonJS:

\`\`\`javascript
// CommonJS import
const { init, createPipeline } = require('./src/${input.slug}/src/index');

// Or add "type": "module" to your package.json for ESM
\`\`\`

### Firewall / Proxy Configuration

If your environment uses a proxy or restricts outbound traffic:

\`\`\`bash
# The Mini-Runtime™ connects to this endpoint (when not in offline mode)
# Allow outbound HTTPS to:
#   https://api.cmpsbl.ai/v1/substrate/primitive

# Or force offline mode (no network needed)
export CMPSBL_OFFLINE=true
\`\`\`

### Getting Help

- **Documentation:** https://cmpsbl.ai/developers
- **CLI diagnostics:** \`cmpsbl doctor\`
- **Email:** support@cmpsbl.ai`;
}

// ─── Network Modes ───────────────────────────────────────────────────────────

function generateNetworkModes(input: IntegrationGuideInput): string {
  return `---

## 7. Network Modes & Offline Execution

The Mini-Runtime™ included in this export supports three execution modes:

| Mode | Primitives Available | Latency | When to Use |
|------|---------------------|---------|-------------|
| **Network** | Full 40-primitive deep effects | ~50ms | Production with substrate access |
| **Hybrid** (default) | Auto-fallback on network failure | Variable | Standard deployment |
| **Offline** | Local deterministic fallback | <1ms | Air-gapped, embedded, or edge |

### Configuring the Mode

\`\`\`typescript
import { configureEndpoint, getRuntimeMode } from './_runtime/standalone-runtime';

// Hybrid (default) — tries network, falls back to local
// No configuration needed

// Force offline — zero network calls
configureEndpoint(null);

// Self-hosted substrate
configureEndpoint('https://substrate.yourcompany.internal/v1/substrate/primitive');

// Verify
console.log(getRuntimeMode());
\`\`\`

### Environment Variable Override

\`\`\`bash
# Force offline mode globally
export CMPSBL_OFFLINE=true

# Custom endpoint
export CMPSBL_ENDPOINT=https://substrate.yourcompany.internal/v1/substrate/primitive
\`\`\``;
}

// ─── Upgrading ───────────────────────────────────────────────────────────────

function generateUpgrading(input: IntegrationGuideInput): string {
  return `---

## 8. Upgrading & Re-Exporting

When you re-export from CMPSBL (after new discoveries or score changes):

1. **Back up** your current integration directory
2. **Replace** the \`_runtime/\` and \`src/\` directories with the new export
3. **Keep** any custom test files you added to \`tests/\`
4. **Re-run** the smoke test: \`npx tsx tests/integration.test.ts\`
5. **Compare** the new \`manifest.json\` with your backup to see what changed

\`\`\`bash
# Quick diff to see changes
diff <(jq . old-backup/manifest.json) <(jq . ${input.slug}/manifest.json)
\`\`\`

### SDK Users

If using \`@cmpsbl/sdk\`, upgrades happen automatically:

\`\`\`bash
npm update @cmpsbl/sdk
cmpsbl status  # Verify new capabilities
\`\`\``;
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function generateFooter(): string {
  return `---

## What's Sealed & Protected

The following components are sealed (black-boxed) and cannot be modified:

- ⬛ CJPI scoring weight allocations
- ⬛ Auto-tiering threshold values
- ⬛ 40-primitive deep effect implementations
- ⬛ Synergy multiplier formulas
- ⬛ Discovery heuristics and synthesis templates

The public API surface is fully functional regardless of sealing.
The sealed components ensure consistent behavior across all deployments.

---

© 2025–2026 PromptFluid®. All rights reserved.
CMPSBL® and Sealed Runtime™ are trademarks of PromptFluid.
`;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}
