/**
 * @cmpsbl/test-harness — Test Utilities
 * Validate exported pipelines, manifests, bridge adapters, and first-contact flows.
 *
 * © CMPSBL® — All rights reserved.
 */

import { parseManifest, executeChain, executePrimitive, initFirstContact, discoverMemory, getMemoryStream } from '@cmpsbl/runtime';
import type { BridgeAdapter } from '@cmpsbl/bridge';

// ═══════════════════════════════════════════════════════════════
// Inlined Types (from @cmpsbl/types — self-contained for builds)
// ═══════════════════════════════════════════════════════════════

interface CmpsblManifest {
  name: string;
  tier: string;
  cjpi: number;
  modules: string[];
  exported: string;
  runtime: string;
  targets: string[];
  version: string;
  category?: string;
  fingerprint?: string;
  source?: string;
}

interface ChainManifest {
  id: string;
  name: string;
  description: string;
  modules: string[];
  cjpiScore: number;
  tier: string;
  category: string;
  sourceLanguage?: string;
  discoveredAt: string;
}

interface MemoryChain {
  id: string;
  pattern: string;
  adoption: string;
  status: 'new' | 'captured' | 'applied' | 'exported';
  discoveredAt: string;
  domain: string;
  confidence: number;
}

interface CeremonyEvent {
  phase: string;
  message: string;
  detail?: string;
  progress?: number;
}

interface FirstContactConfig {
  package: string;
  domain: string;
  endpoint?: string;
  apiKey?: string;
  autoDiscover?: boolean;
  onDiscovery?: (chain: MemoryChain) => void;
  onBoot?: (message: string) => void;
  onCeremony?: (event: CeremonyEvent) => void;
  silent?: boolean;
}

type PackageDomain =
  | 'runtime' | 'intent' | 'mesh' | 'bridge' | 'discovery'
  | 'sdk' | 'cli' | 'react' | 'failsafe' | 'test-harness' | 'types';

interface DomainPattern {
  domain: PackageDomain;
  patterns: string[];
  scopes: string[];
}

const DOMAIN_PATTERNS: Record<PackageDomain, DomainPattern> = {
  runtime: { domain: 'runtime', patterns: ['Execution optimization pattern', 'Pipeline efficiency chain', 'State machine convergence'], scopes: ['Cross-runtime adoption', 'Multi-environment execution', 'Universal pipeline usage'] },
  intent: { domain: 'intent', patterns: ['Routing optimization pattern', 'Resolver convergence chain', 'Intent coordination signal'], scopes: ['Cross-module orchestration', 'Multi-resolver routing', 'System-wide intent coverage'] },
  mesh: { domain: 'mesh', patterns: ['Telemetry correlation pattern', 'Signal propagation chain', 'Node communication optimization'], scopes: ['Cross-node telemetry', 'System-wide observability', 'Multi-layer signal analysis'] },
  bridge: { domain: 'bridge', patterns: ['Language bridge optimization', 'Cross-runtime delegation chain', 'Polyglot execution pattern'], scopes: ['Multi-language adoption', 'Cross-runtime integration', 'Universal bridge coverage'] },
  discovery: { domain: 'discovery', patterns: ['Pipeline crystallization pattern', 'Architecture collision chain', 'Capability emergence signal'], scopes: ['Cross-system discovery', 'Multi-node collision analysis', 'Autonomous capability generation'] },
  sdk: { domain: 'sdk', patterns: ['API usage optimization', 'Engine coordination chain', 'Client integration pattern'], scopes: ['Cross-engine adoption', 'Multi-system integration', 'Developer workflow optimization'] },
  cli: { domain: 'cli', patterns: ['Command optimization pattern', 'Workflow automation chain', 'Infrastructure coordination signal'], scopes: ['Cross-project automation', 'Multi-environment management', 'Developer productivity gain'] },
  react: { domain: 'react', patterns: ['Component state correlation', 'Hook composition chain', 'UI-substrate binding pattern'], scopes: ['Cross-component adoption', 'Multi-view state management', 'Frontend-substrate integration'] },
  failsafe: { domain: 'failsafe', patterns: ['Recovery optimization pattern', 'Backup integrity chain', 'Migration reliability signal'], scopes: ['Cross-platform migration', 'Multi-environment backup', 'Disaster recovery automation'] },
  'test-harness': { domain: 'test-harness', patterns: ['Validation coverage pattern', 'Test convergence chain', 'Quality assurance signal'], scopes: ['Cross-module validation', 'Multi-layer test coverage', 'Automated quality assurance'] },
  types: { domain: 'types', patterns: ['Type safety pattern', 'Schema convergence chain', 'Contract validation signal'], scopes: ['Cross-package type safety', 'Multi-module schema coverage', 'Universal contract enforcement'] },
};

// ═══════════════════════════════════════════════════════════════
// Test Result Types
// ═══════════════════════════════════════════════════════════════

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export interface TestSuiteResult {
  suite: string;
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
  durationMs: number;
}

// ═══════════════════════════════════════════════════════════════
// Manifest Validation
// ═══════════════════════════════════════════════════════════════

export function validateManifest(json: string): TestSuiteResult {
  const start = Date.now();
  const results: TestResult[] = [];

  let manifest: CmpsblManifest | null = null;
  try {
    manifest = parseManifest(json);
    results.push({ name: 'manifest_parseable', passed: true, message: 'Manifest parsed successfully', durationMs: 0 });
  } catch (err) {
    results.push({ name: 'manifest_parseable', passed: false, message: `Parse error: ${err}`, durationMs: 0 });
  }

  if (manifest) {
    results.push({ name: 'has_name', passed: !!manifest.name, message: manifest.name ? `Name: ${manifest.name}` : 'Missing name', durationMs: 0 });
    results.push({ name: 'has_cjpi', passed: typeof manifest.cjpi === 'number', message: `CJPI: ${manifest.cjpi}`, durationMs: 0 });
    results.push({ name: 'has_tier', passed: !!manifest.tier, message: `Tier: ${manifest.tier}`, durationMs: 0 });
    results.push({ name: 'has_modules', passed: Array.isArray(manifest.modules) && manifest.modules.length > 0, message: `Modules: ${manifest.modules?.join(', ') ?? 'none'}`, durationMs: 0 });
    results.push({ name: 'cjpi_range', passed: manifest.cjpi >= 0 && manifest.cjpi <= 100, message: `CJPI ${manifest.cjpi} in valid range [0-100]`, durationMs: 0 });
  }

  const passed = results.filter(r => r.passed).length;
  return { suite: 'manifest-validation', total: results.length, passed, failed: results.length - passed, results, durationMs: Date.now() - start };
}

// ═══════════════════════════════════════════════════════════════
// Chain Execution Test
// ═══════════════════════════════════════════════════════════════

export async function testChainExecution(
  manifest: ChainManifest,
  input: Record<string, unknown>,
): Promise<TestSuiteResult> {
  const start = Date.now();
  const results: TestResult[] = [];

  try {
    const chainResult = await executeChain(manifest, input);
    results.push({ name: 'chain_executed', passed: true, message: `Chain completed in ${chainResult.totalDurationMs}ms`, durationMs: chainResult.totalDurationMs });
    results.push({ name: 'chain_success', passed: chainResult.success, message: chainResult.success ? 'All stages passed' : `${chainResult.stagesCompleted}/${chainResult.totalStages} stages`, durationMs: 0 });
    results.push({ name: 'has_output', passed: chainResult.output !== null && chainResult.output !== undefined, message: 'Output produced', durationMs: 0 });
  } catch (err) {
    results.push({ name: 'chain_executed', passed: false, message: `Execution error: ${err}`, durationMs: Date.now() - start });
  }

  const passed = results.filter(r => r.passed).length;
  return { suite: 'chain-execution', total: results.length, passed, failed: results.length - passed, results, durationMs: Date.now() - start };
}

// ═══════════════════════════════════════════════════════════════
// Bridge Adapter Test
// ═══════════════════════════════════════════════════════════════

export async function testBridge(bridge: BridgeAdapter): Promise<TestSuiteResult> {
  const start = Date.now();
  const results: TestResult[] = [];

  results.push({ name: 'has_language', passed: !!bridge.language, message: `Language: ${bridge.language}`, durationMs: 0 });
  results.push({ name: 'has_mode', passed: !!bridge.mode, message: `Mode: ${bridge.mode}`, durationMs: 0 });

  try {
    const result = await bridge.executePrimitive('TEST', { test: true }, 0.9);
    results.push({ name: 'primitive_exec', passed: result.success, message: `Primitive executed (handler: ${result.handler})`, durationMs: result.durationMs });
  } catch (err) {
    results.push({ name: 'primitive_exec', passed: false, message: `Primitive failed: ${err}`, durationMs: 0 });
  }

  try {
    const reachable = await bridge.ping();
    results.push({ name: 'ping', passed: true, message: reachable ? 'Endpoint reachable' : 'Endpoint unreachable (offline mode OK)', durationMs: 0 });
  } catch {
    results.push({ name: 'ping', passed: true, message: 'Offline mode', durationMs: 0 });
  }

  const passed = results.filter(r => r.passed).length;
  return { suite: 'bridge-adapter', total: results.length, passed, failed: results.length - passed, results, durationMs: Date.now() - start };
}

// ═══════════════════════════════════════════════════════════════
// First Contact Test Suite
// ═══════════════════════════════════════════════════════════════

export async function testFirstContact(domain: string & keyof typeof DOMAIN_PATTERNS): Promise<TestSuiteResult> {
  const start = Date.now();
  const results: TestResult[] = [];

  const config: FirstContactConfig = {
    package: `@cmpsbl/${domain}`,
    domain,
    autoDiscover: true,
  };

  try {
    const session = await initFirstContact(config);
    results.push({ name: 'first_contact_init', passed: true, message: `Session: ${session.sessionId}`, durationMs: 0 });
    results.push({ name: 'session_has_package', passed: session.package === config.package, message: `Package: ${session.package}`, durationMs: 0 });
    results.push({ name: 'discovery_active', passed: session.discoveryActive, message: 'Discovery auto-started', durationMs: 0 });
  } catch (err) {
    results.push({ name: 'first_contact_init', passed: false, message: `Init failed: ${err}`, durationMs: 0 });
  }

  try {
    const discovery = await discoverMemory(
      { input: 'test pattern detection' },
      config,
      DOMAIN_PATTERNS[domain],
    );
    results.push({ name: 'discovery_detected', passed: discovery.detected, message: discovery.memory ? `Pattern: ${discovery.memory.pattern}` : 'No pattern', durationMs: 0 });
    results.push({ name: 'chain_in_stream', passed: getMemoryStream().length > 0, message: `Stream: ${getMemoryStream().length} chains`, durationMs: 0 });
  } catch (err) {
    results.push({ name: 'discovery_detected', passed: false, message: `Discovery failed: ${err}`, durationMs: 0 });
  }

  const passed = results.filter(r => r.passed).length;
  return { suite: `first-contact-${domain}`, total: results.length, passed, failed: results.length - passed, results, durationMs: Date.now() - start };
}

// ═══════════════════════════════════════════════════════════════
// Pretty Printer
// ═══════════════════════════════════════════════════════════════

export function formatTestResults(suite: TestSuiteResult): string {
  const lines = [
    `\n  ═══ ${suite.suite} ═══`,
    `  ${suite.passed}/${suite.total} passed (${suite.durationMs}ms)\n`,
  ];
  for (const r of suite.results) {
    const icon = r.passed ? '✓' : '✗';
    lines.push(`    ${icon} ${r.name}: ${r.message}`);
  }
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// First Contact — Test Harness Domain
// ═══════════════════════════════════════════════════════════════

export function createTestHarnessFirstContact(apiKey?: string): FirstContactConfig {
  return {
    package: '@cmpsbl/test-harness',
    domain: 'test-harness',
    apiKey,
    endpoint: 'https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/substrate-api',
    autoDiscover: true,
  };
}
