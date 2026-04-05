/**
 * CMPSBL® Universal User Guide Generator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates a comprehensive, mobile-friendly HTML guide shipped in EVERY
 * export ZIP across all substrates. Covers:
 *   - Activation (standalone, SDK, CLI)
 *   - Commands reference
 *   - Error codes and resolution
 *   - Deployment (standalone, Docker, cloud)
 *   - Testing with @cmpsbl/test-harness
 *   - Black-box explanation
 *   - Support / fingerprint lookup
 *
 * © 2025–2026 CMPSBL® · PromptFluid™. All rights reserved.
 */

import { wrapPremiumHtml } from './premium-html-wrapper';

export interface UserGuideInput {
  name: string;
  slug: string;
  kind: string; // 'engine' | 'agent' | 'crown-jewel' | 'ascension' | 'memory-stream' | 'discovery'
  tier?: string;
  cjpi?: number;
  version?: string;
  substrate?: string;
  fingerprint?: string;
  modules?: string[];
  capabilities?: string[];
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function kindLabel(kind: string): string {
  const labels: Record<string, string> = {
    engine: 'Composable Engine',
    agent: 'Meta-Agent',
    'crown-jewel': 'Crown Jewel Capability',
    ascension: 'Ascension Export',
    'memory-stream': 'Memory Stream Discovery',
    discovery: 'Discovery Artifact',
  };
  return labels[kind] || 'Software Artifact';
}

export function generateUniversalUserGuide(input: UserGuideInput): string {
  const { name, slug, kind, tier = 'Standard', cjpi, version = '1.0.0', substrate, fingerprint, modules = [], capabilities = [] } = input;
  const label = kindLabel(kind);
  const modList = modules.length > 0 ? modules.join(', ') : 'SYSTEM';

  const body = `
<div class="section">
  <div class="section-title"><span class="dot"></span> About This Software</div>
  <div class="card">
    <p><strong>${esc(name)}</strong> is a <strong>${esc(label)}</strong> from the CMPSBL® Substrate${substrate ? ` (${esc(substrate)} vertical)` : ''}.</p>
    <p>This is a <strong>Convex Core™ Sealed Artifact</strong> — a production-grade, zero-dependency artifact that runs standalone in any TypeScript/JavaScript environment. The Convex Core™ Processing Layer is embedded directly in the source file. No additional packages required.</p>
    ${cjpi != null ? `<p><strong>CJPI Score:</strong> ${cjpi}/100 · <strong>Tier:</strong> ${esc(tier)} · <strong>Version:</strong> ${esc(version)}</p>` : ''}
    ${modules.length > 0 ? `<p><strong>Primitive Chain:</strong> ${esc(modList)}</p>` : ''}
  </div>
</div>

<div class="section">
  <div class="section-title"><span class="dot"></span> 1. Activation</div>

  <h3>Option A: Standalone (Recommended)</h3>
  <p>Copy the source file into your project and import directly. Zero config.</p>
  <pre><code># Copy into your project
cp ${esc(slug)}.ts ./src/vendor/cmpsbl/

# Import and use
import { init, process } from './vendor/cmpsbl/${esc(slug)}';

const instance = init();
const result = await instance.process({ input: 'your-data' });</code></pre>

  <h3>Option B: SDK Activation</h3>
  <pre><code>npm install @cmpsbl/sdk

import CMPSBL from '@cmpsbl/sdk';
const client = new CMPSBL();
// Your ${esc(kind)} activates automatically via the SDK</code></pre>

  <h3>Option C: CLI Activation</h3>
  <pre><code>npm install -g @cmpsbl/cli
cmpsbl activate ${esc(slug)}
cmpsbl status</code></pre>
</div>

<div class="section">
  <div class="section-title"><span class="dot"></span> 2. Commands Reference</div>
  <table>
    <thead><tr><th>Command</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><code>init(config?)</code></td><td>Initialize the runtime with optional configuration</td></tr>
      <tr><td><code>process(input)</code></td><td>Execute the primary capability pipeline</td></tr>
      <tr><td><code>getStatus()</code></td><td>Returns current runtime health and state</td></tr>
      <tr><td><code>getMetrics()</code></td><td>Returns execution metrics (latency, throughput, errors)</td></tr>
      <tr><td><code>reset()</code></td><td>Clear internal state and restart the runtime</td></tr>
      <tr><td><code>configure(opts)</code></td><td>Update runtime configuration at runtime</td></tr>
      <tr><td><code>dispose()</code></td><td>Gracefully shut down and release resources</td></tr>
    </tbody>
  </table>

  <h3>CLI Commands</h3>
  <table>
    <thead><tr><th>CLI Command</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><code>cmpsbl activate &lt;slug&gt;</code></td><td>Activate a Convex Core™ artifact in your project</td></tr>
      <tr><td><code>cmpsbl status</code></td><td>Show all active runtimes and their health</td></tr>
      <tr><td><code>cmpsbl test</code></td><td>Run the bundled test harness</td></tr>
      <tr><td><code>cmpsbl upgrade</code></td><td>Check for and apply runtime updates</td></tr>
      <tr><td><code>cmpsbl deactivate &lt;slug&gt;</code></td><td>Remove a runtime from your project</td></tr>
      <tr><td><code>cmpsbl export --format &lt;lang&gt;</code></td><td>Re-export in a different language bridge</td></tr>
    </tbody>
  </table>
</div>

<div class="section">
  <div class="section-title"><span class="dot"></span> 3. Error Codes</div>
  <p>All CMPSBL® runtimes use standardized error codes. Below are the codes you may encounter:</p>
  <table>
    <thead><tr><th>Code</th><th>Meaning</th><th>Resolution</th></tr></thead>
    <tbody>
      <tr><td><code>CMPSBL-E001</code></td><td>Runtime initialization failed</td><td>Check that <code>init()</code> is called before <code>process()</code>. Verify config is valid JSON.</td></tr>
      <tr><td><code>CMPSBL-E002</code></td><td>Pipeline execution timeout</td><td>Increase <code>maxExecutionMs</code> in config, or reduce input complexity.</td></tr>
      <tr><td><code>CMPSBL-E003</code></td><td>Invalid input schema</td><td>Ensure input matches the expected interface. See <code>runtime.d.ts</code> for types.</td></tr>
      <tr><td><code>CMPSBL-E004</code></td><td>Circuit breaker tripped</td><td>The FAILSAFE primitive detected repeated failures. Wait for auto-reset or call <code>reset()</code>.</td></tr>
      <tr><td><code>CMPSBL-E005</code></td><td>Memory capacity exceeded</td><td>The runtime's bounded buffer is full. Call <code>reset()</code> or increase <code>maxMemoryEntries</code>.</td></tr>
      <tr><td><code>CMPSBL-E006</code></td><td>Sealed method access denied</td><td>Attempted to access a black-boxed internal. Use the public API surface only.</td></tr>
      <tr><td><code>CMPSBL-E007</code></td><td>Bridge adapter connection failed</td><td>The runtime is in offline mode. Use <code>configureEndpoint(null)</code> for standalone operation.</td></tr>
      <tr><td><code>CMPSBL-E008</code></td><td>CJPI validation failed</td><td>Manifest CJPI score does not match computed score. Re-export from the source substrate.</td></tr>
      <tr><td><code>CMPSBL-E009</code></td><td>License validation error</td><td>Ensure your LICENSE file is present and unmodified in the bundle root.</td></tr>
      <tr><td><code>CMPSBL-E010</code></td><td>Primitive dependency not found</td><td>A required primitive is missing. Verify all <code>_runtime/</code> files are present.</td></tr>
    </tbody>
  </table>
</div>

<div class="section">
  <div class="section-title"><span class="dot"></span> 4. Deployment</div>

  <h3>A. Node.js / Bun / Deno</h3>
  <pre><code># Run directly
npx tsx src/${esc(slug)}.ts

# Or compile and run
npx tsc src/${esc(slug)}.ts --outDir dist
node dist/${esc(slug)}.js</code></pre>

  <h3>B. Docker</h3>
  <pre><code>FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install -g tsx
CMD ["npx", "tsx", "src/${esc(slug)}.ts"]</code></pre>

  <h3>C. Serverless (AWS Lambda / Vercel / Cloudflare)</h3>
  <pre><code># Bundle as a single file — zero dependencies
npx esbuild src/${esc(slug)}.ts --bundle --platform=node --outfile=handler.js

# Deploy the single handler.js file to your serverless provider</code></pre>

  <h3>D. Embed in Existing Stack</h3>
  <pre><code>// Express.js example
import express from 'express';
import { init, process } from './${esc(slug)}';

const app = express();
const runtime = init();

app.post('/api/${esc(slug)}', async (req, res) =&gt; {
  const result = await runtime.process(req.body);
  res.json(result);
});

app.listen(3000);</code></pre>
</div>

<div class="section">
  <div class="section-title"><span class="dot"></span> 5. Testing with @cmpsbl/test-harness</div>
  <p>Every export includes a <code>test-harness.config.json</code> and a pre-generated test file.</p>

  <h3>Quick Test</h3>
  <pre><code># Install the test harness
npm install @cmpsbl/test-harness

# Run tests against your export
npx cmpsbl-test --config ./test-harness.config.json

# Or use the test file directly
npx vitest run test/</code></pre>

  <h3>Writing Custom Tests</h3>
  <pre><code>import { validateManifest, formatTestResults } from '@cmpsbl/test-harness';
import manifest from './manifest.json';

const result = validateManifest(JSON.stringify(manifest));
console.log(formatTestResults(result));
// Should output: ✓ All validations passed</code></pre>

  <h3>CI/CD Integration</h3>
  <pre><code># Add to your CI pipeline (GitHub Actions example)
- name: Test CMPSBL Runtime
  run: |
    npm install @cmpsbl/test-harness
    npx cmpsbl-test --config ./test-harness.config.json --ci</code></pre>
</div>

<div class="section">
  <div class="section-title"><span class="dot"></span> 6. About Black-Boxed Components</div>
  <div class="callout">
    <p><strong>Why is some code sealed?</strong></p>
    <p>The <code>_runtime/</code> directory contains the CMPSBL® Convex Core™ Processing Layer — a proprietary scoring, tiering, and orchestration engine protected under trade secret law. The internal algorithms (CJPI weight allocations, tier thresholds, synergy formulas, discovery templates) are sealed to protect the intellectual property that makes this software unique.</p>
  </div>

  <h3>What is sealed</h3>
  <ul>
    <li>CJPI scoring weights and tier boundary calculations</li>
    <li>Synergy multiplier formulas between primitives</li>
    <li>Discovery engine heuristics and template injection</li>
    <li>Internal orchestration and routing logic</li>
  </ul>

  <h3>What is fully open</h3>
  <ul>
    <li>All public API interfaces (<code>init</code>, <code>process</code>, <code>getStatus</code>, etc.)</li>
    <li>TypeScript type definitions (<code>runtime.d.ts</code>)</li>
    <li>Configuration schema and environment variables</li>
    <li>Test harness and validation tools</li>
    <li>Bridge adapters for non-TypeScript languages</li>
  </ul>

  <h3>How to verify sealed components</h3>
  <pre><code># Use the test harness to verify sealed components work correctly
npx cmpsbl-test --config ./test-harness.config.json --verify-sealed

# The test harness validates:
# ✓ CJPI scoring produces consistent results
# ✓ Tier boundaries are stable
# ✓ Pipeline execution completes within timeout
# ✓ All public APIs respond correctly</code></pre>
</div>

<div class="section">
  <div class="section-title"><span class="dot"></span> 7. Network Modes</div>
  <p>The embedded Convex Core™ operates in three modes:</p>
  <table>
    <thead><tr><th>Mode</th><th>Description</th><th>When to Use</th></tr></thead>
    <tbody>
      <tr><td><strong>Network</strong></td><td>Full substrate connectivity, deep primitive effects</td><td>Production with CMPSBL SDK</td></tr>
      <tr><td><strong>Hybrid</strong></td><td>Auto-fallback when substrate is unreachable</td><td>Intermittent connectivity</td></tr>
      <tr><td><strong>Offline</strong></td><td>Fully standalone, zero network dependency</td><td>Air-gapped, local, embedded</td></tr>
    </tbody>
  </table>
  <pre><code>import { configureEndpoint, getRuntimeMode } from './_runtime/convex-core';

// Force offline (fully standalone)
configureEndpoint(null);
console.log(getRuntimeMode()); // 'offline'

// Connect to substrate
configureEndpoint('https://api.cmpsbl.com');
console.log(getRuntimeMode()); // 'network'</code></pre>
</div>

<div class="section">
  <div class="section-title"><span class="dot"></span> 8. Support</div>
  <div class="card">
    <p>Visit <strong>cmpsbl.com</strong> for documentation, updates, and support.</p>
    ${fingerprint ? `<p>Use your <strong>Fingerprint ID</strong> (<code>${esc(fingerprint)}</code>) to have DECODE retrieve your export context for personalized support.</p>` : ''}
    <p><strong>NPM Packages:</strong></p>
    <ul>
      <li><code>@cmpsbl/sdk</code> — Full SDK for runtime activation</li>
      <li><code>@cmpsbl/runtime</code> — Convex Core™ standalone package</li>
      <li><code>@cmpsbl/cli</code> — Terminal activation and status</li>
      <li><code>@cmpsbl/test-harness</code> — Validation and testing</li>
      <li><code>@cmpsbl/types</code> — TypeScript type definitions</li>
    </ul>
  </div>
</div>
`;

  return wrapPremiumHtml({
    title: `${name} — User Guide`,
    subtitle: `Complete activation, deployment, and testing guide for this ${label}`,
    tier,
    cjpi,
    serial: fingerprint,
    substrate,
    bodyContent: body,
  });
}
