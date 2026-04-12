/**
 * CMPSBL® Portable Artifact — Phase 7: Deployment Model
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Makes Ascension artifacts deployable in real environments.
 *
 * Goals:
 *   - Artifacts drop into existing stacks without modification
 *   - Runtime behaves consistently across environments
 *   - No lock-in required to execute behavior
 *   - Clear integration story for Node, browser, edge, and bundlers
 *
 * This module provides:
 *   1. Environment detection (Node, browser, Deno, edge worker, unknown)
 *   2. Portable loader (reads artifact payload from any environment)
 *   3. Deployment manifest (machine-readable integration contract)
 *   4. Integration code generators (ESM, CJS, script tag, globalThis)
 *   5. Health check endpoint factory (for production monitoring)
 *
 * Constraints:
 *   - Zero dependencies beyond @cmpsbl/runtime internals
 *   - No environment-specific APIs in core path
 *   - Deterministic across all targets
 *
 * © CMPSBL® — All rights reserved.
 */

import type { ArtifactManifest } from './artifact-initializer';
import type { PolicyAttachmentEntry } from './scan-to-policy';
import type { ArtifactFingerprint, VerificationSummary } from './engines/verification-ledger';
import { generateVerificationSummary, getActiveFingerprint } from './engines/verification-ledger';
import { resolveHealthFromSummary, getLatchedCoverageRatio } from './engines/unified-health';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — ENVIRONMENT DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

export type RuntimeEnvironment =
  | 'node'
  | 'browser'
  | 'deno'
  | 'edge-worker'
  | 'bun'
  | 'unknown';

/**
 * Detect the current runtime environment without triggering errors.
 * Uses feature detection — no user-agent sniffing.
 */
export function detectEnvironment(): RuntimeEnvironment {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const g = globalThis as any;

  if (typeof g.Bun !== 'undefined') return 'bun';
  if (typeof g.Deno !== 'undefined') return 'deno';

  // Edge workers (Cloudflare, Vercel) expose these
  if (typeof g.caches !== 'undefined' && typeof g.HTMLElement === 'undefined') return 'edge-worker';

  if (typeof g.window !== 'undefined' && typeof g.document !== 'undefined') return 'browser';
  if (typeof g.process !== 'undefined' && typeof g.process.versions?.node === 'string') return 'node';

  return 'unknown';
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — DEPLOYMENT MANIFEST
// ═══════════════════════════════════════════════════════════════════════════════

/** Machine-readable deployment contract */
export interface DeploymentManifest {
  readonly format: 'cmpsbl-deployment-v1';
  readonly artifact: {
    readonly name: string;
    readonly version: string;
    readonly tier: string;
    readonly cjpi: number;
    readonly fingerprint: string;
  };
  readonly runtime: {
    readonly engine: '@cmpsbl/runtime';
    readonly version: '2.1.0';
    readonly minVersion: '2.0.0';
  };
  readonly compatibility: {
    readonly environments: readonly RuntimeEnvironment[];
    readonly moduleFormats: readonly ('esm' | 'cjs' | 'iife')[];
    readonly bundlers: readonly string[];
    readonly requiresGlobalThis: boolean;
  };
  readonly behaviors: {
    readonly total: number;
    readonly enforcing: number;
    readonly observing: number;
    readonly primitives: readonly string[];
  };
  readonly verification: {
    readonly fingerprintAlgorithm: 'fnv1a-stable';
    readonly hasIntegrityCheck: boolean;
    readonly hasVerificationLedger: boolean;
  };
  readonly generatedAt: string;
}

/**
 * Generate a deployment manifest from an artifact's metadata.
 * This is the contract that tells integrators exactly what to expect.
 */
export function generateDeploymentManifest(
  manifest: ArtifactManifest,
  fingerprint: ArtifactFingerprint,
  enforcingCount: number,
  observingCount: number,
): DeploymentManifest {
  return {
    format: 'cmpsbl-deployment-v1',
    artifact: {
      name: manifest.name,
      version: manifest.version,
      tier: manifest.tier,
      cjpi: manifest.cjpi,
      fingerprint: fingerprint.composite,
    },
    runtime: {
      engine: '@cmpsbl/runtime',
      version: '2.1.0',
      minVersion: '2.0.0',
    },
    compatibility: {
      environments: ['node', 'browser', 'deno', 'bun', 'edge-worker'],
      moduleFormats: ['esm', 'cjs', 'iife'],
      bundlers: ['vite', 'webpack', 'esbuild', 'rollup', 'parcel'],
      requiresGlobalThis: true,
    },
    behaviors: {
      total: enforcingCount + observingCount,
      enforcing: enforcingCount,
      observing: observingCount,
      primitives: manifest.modules as string[],
    },
    verification: {
      fingerprintAlgorithm: 'fnv1a-stable',
      hasIntegrityCheck: true,
      hasVerificationLedger: true,
    },
    generatedAt: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — PORTABLE LOADER
// ═══════════════════════════════════════════════════════════════════════════════

/** Loaded artifact payload — environment-agnostic */
export interface LoadedArtifactPayload {
  readonly manifest: ArtifactManifest | null;
  readonly attachments: readonly PolicyAttachmentEntry[];
  readonly environment: RuntimeEnvironment;
  readonly loadedFrom: 'globalThis' | 'argument' | 'none';
}

/**
 * Load artifact payload from any environment.
 * Checks globalThis for injected bootstrap data, falls back to explicit args.
 */
export function loadArtifactPayload(
  explicitManifest?: ArtifactManifest,
  explicitAttachments?: readonly PolicyAttachmentEntry[],
): LoadedArtifactPayload {
  const env = detectEnvironment();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const g = globalThis as any;

  // Priority 1: explicit arguments
  if (explicitManifest) {
    return {
      manifest: explicitManifest,
      attachments: explicitAttachments ?? [],
      environment: env,
      loadedFrom: 'argument',
    };
  }

  // Priority 2: globalThis bootstrap (from generateBootstrap())
  if (g.__MANA_MANIFEST__) {
    return {
      manifest: g.__MANA_MANIFEST__ as ArtifactManifest,
      attachments: (g.__MANA_ATTACHMENTS__ ?? []) as PolicyAttachmentEntry[],
      environment: env,
      loadedFrom: 'globalThis',
    };
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return {
    manifest: null,
    attachments: [],
    environment: env,
    loadedFrom: 'none',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — INTEGRATION CODE GENERATORS
// ═══════════════════════════════════════════════════════════════════════════════

export type IntegrationFormat = 'esm' | 'cjs' | 'script-tag' | 'global';

/**
 * Generate integration code for a specific target format.
 * Returns copy-paste-ready code for the developer.
 */
export function generateIntegrationCode(
  artifactName: string,
  format: IntegrationFormat,
): string {
  const safeName = artifactName.replace(/[^a-zA-Z0-9_]/g, '_');

  switch (format) {
    case 'esm':
      return [
        `// ESM — Import ascended module`,
        `import { initializeArtifact } from '@cmpsbl/runtime';`,
        `import * as ${safeName} from './${artifactName}/ascended-source';`,
        ``,
        `const { wrapped, result } = initializeArtifact(${safeName});`,
        `export default wrapped;`,
      ].join('\n');

    case 'cjs':
      return [
        `// CommonJS — Require ascended module`,
        `const { initializeArtifact } = require('@cmpsbl/runtime');`,
        `const ${safeName} = require('./${artifactName}/ascended-source');`,
        ``,
        `const { wrapped, result } = initializeArtifact(${safeName});`,
        `module.exports = wrapped;`,
      ].join('\n');

    case 'script-tag':
      return [
        `<!-- Browser — Script tag integration -->`,
        `<script src="./${artifactName}/bootstrap.js"><\/script>`,
        `<script src="./${artifactName}/ascended-source.js"><\/script>`,
        `<script>`,
        `  // Artifact auto-activates via globalThis bootstrap`,
        `  console.log('${artifactName} loaded:', globalThis.__MANA_MANIFEST__);`,
        `<\/script>`,
      ].join('\n');

    case 'global':
      return [
        `// Global — Works everywhere (Node, Deno, Bun, browser)`,
        `// 1. Load bootstrap (sets globalThis.__MANA_MANIFEST__)`,
        `// 2. Load ascended source`,
        `// 3. Runtime auto-detects and activates`,
        ``,
        `import './${artifactName}/bootstrap.js';`,
        `import './${artifactName}/ascended-source.js';`,
      ].join('\n');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — HEALTH CHECK FACTORY
// ═══════════════════════════════════════════════════════════════════════════════

/** Health check response — suitable for /health or monitoring endpoints */
export interface HealthCheckResponse {
  readonly status: 'healthy' | 'partial' | 'degraded' | 'uninitialized';
  readonly artifact: string | null;
  readonly fingerprint: string | null;
  readonly environment: RuntimeEnvironment;
  readonly uptime: number;
  readonly verification: VerificationSummary | null;
  readonly timestamp: string;
}

const bootTime = Date.now();

/**
 * Generate a health check response for production monitoring.
 * Can be wired to any HTTP framework's /health endpoint.
 *
 * When called with an artifact fingerprint + coverage ratio,
 * the response is scoped to that session (no global state dependency).
 * Without arguments, falls back to global latched state.
 */
export function getHealthCheck(
  opts?: {
    readonly fingerprint: ArtifactFingerprint | null;
    readonly coverageRatio: number;
    readonly verification: VerificationSummary;
  },
): HealthCheckResponse {
  const env = detectEnvironment();

  // Session-scoped path — deterministic, no global reads
  if (opts) {
    const unified = resolveHealthFromSummary(opts.coverageRatio, opts.verification);
    return {
      status: unified.status,
      artifact: opts.verification.artifactFingerprint,
      fingerprint: opts.fingerprint?.composite ?? null,
      environment: env,
      uptime: Date.now() - bootTime,
      verification: opts.verification,
      timestamp: new Date().toISOString(),
    };
  }

  // Global fallback path (backward compat)
  const fp = getActiveFingerprint();

  if (!fp) {
    return {
      status: 'uninitialized',
      artifact: null,
      fingerprint: null,
      environment: env,
      uptime: Date.now() - bootTime,
      verification: null,
      timestamp: new Date().toISOString(),
    };
  }

  const verification = generateVerificationSummary();
  const coverageRatio = getLatchedCoverageRatio() ?? 0;
  const unified = resolveHealthFromSummary(coverageRatio, verification);

  return {
    status: unified.status,
    artifact: verification.artifactFingerprint,
    fingerprint: fp.composite,
    environment: env,
    uptime: Date.now() - bootTime,
    verification,
    timestamp: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — DEPLOYMENT README GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a deployment README for the artifact ZIP.
 * Human-readable integration guide tailored to the artifact.
 */
export function generateDeploymentReadme(
  manifest: ArtifactManifest,
  fingerprint: ArtifactFingerprint,
): string {
  return [
    `# ${manifest.name} — CMPSBL® Ascended Artifact`,
    '',
    `**Tier:** ${manifest.tier} | **CJPI:** ${manifest.cjpi} | **Version:** ${manifest.version}`,
    `**Fingerprint:** \`${fingerprint.composite}\``,
    '',
    '## Quick Start',
    '',
    '### Node.js / Bun / Deno (ESM)',
    '```js',
    generateIntegrationCode(manifest.name, 'esm'),
    '```',
    '',
    '### Browser (Script Tag)',
    '```html',
    generateIntegrationCode(manifest.name, 'script-tag'),
    '```',
    '',
    '## How It Works',
    '',
    '1. **Bootstrap** loads the manifest and attachments into `globalThis`',
    '2. **Runtime** auto-detects the environment and activates wrappers',
    '3. **Behavior** executes deterministically — same input, same result',
    '4. **Verification** is available via `renderVerificationReport()`',
    '',
    '## Verification',
    '',
    '```js',
    `import { verifyIntegrity, renderVerificationReport } from '@cmpsbl/runtime';`,
    '',
    '// Check artifact identity has not been tampered with',
    `verifyIntegrity(globalThis.__MANA_MANIFEST__, globalThis.__MANA_ATTACHMENTS__);`,
    '',
    '// Print full verification report',
    'console.log(renderVerificationReport());',
    '```',
    '',
    '## Compatibility',
    '',
    '| Environment | Status |',
    '|-------------|--------|',
    '| Node.js 18+ | ✔ Supported |',
    '| Bun | ✔ Supported |',
    '| Deno | ✔ Supported |',
    '| Browser (ESM) | ✔ Supported |',
    '| Cloudflare Workers | ✔ Supported |',
    '| Vercel Edge | ✔ Supported |',
    '',
    '## Health Check',
    '',
    '```js',
    `import { getHealthCheck } from '@cmpsbl/runtime';`,
    '',
    '// Wire to your framework (Express, Hono, etc.)',
    `app.get('/health', (req, res) => res.json(getHealthCheck()));`,
    '```',
    '',
    '---',
    '© CMPSBL® — All rights reserved. Patent Pending — U.S. App. No. 64/029,678',
  ].join('\n');
}
