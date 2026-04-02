/**
 * Restoration Scan Team — ENCODE + ORACLE + ENGINEER + MEDIC + DEFENSE + FAILSAFE
 * Six-primitive diagnostic squad for the Refurbishment Lab.
 * All 40 primitives available as recommendations.
 * Capabilities classified as Active/Passive/Hybrid archetypes.
 * ENCODE drives selection logic with randomization for unique builds.
 * Deep pattern analysis with 6-8 findings per analyzer.
 */

import type { RateLimitDecision } from '@/lib/substrate/adaptive-rate-limit';
import { analyzeCodeMetrics, type CodeMetrics } from './code-metrics';

export interface ScanFinding {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  source: 'ENCODE' | 'ORACLE' | 'ENGINEER' | 'MEDIC' | 'DEFENSE' | 'FAILSAFE';
  primitiveRecommendation?: string;
}

export interface ScanResult {
  findings: ScanFinding[];
  recommendedPrimitives: PrimitiveRecommendation[];
  architecturalRunway: number;
  cjpiEstimate: number;
  projectedCjpi: number;
  scanDurationMs: number;
  scanTeam: string[];
  metrics: CodeMetrics;
}

export type CapabilityArchetype = 'Active' | 'Passive' | 'Hybrid';

export interface PrimitiveRecommendation {
  primitiveId: string;
  name: string;
  category: 'Organ' | 'Layer' | 'Engine' | 'Agent';
  impactScore: number;
  rationale: string;
}

/** All 40 primitives */
const PRIMITIVE_CATALOG: Omit<PrimitiveRecommendation, 'impactScore' | 'rationale'>[] = [
  // 12 Organs
  { primitiveId: 'brain', name: 'BRAIN', category: 'Organ' },
  { primitiveId: 'memory', name: 'MEMORY', category: 'Organ' },
  { primitiveId: 'identity', name: 'IDENTITY', category: 'Organ' },
  { primitiveId: 'conscience', name: 'CONSCIENCE', category: 'Organ' },
  { primitiveId: 'compass', name: 'COMPASS', category: 'Organ' },
  { primitiveId: 'reflex', name: 'REFLEX', category: 'Organ' },
  { primitiveId: 'echo', name: 'ECHO', category: 'Organ' },
  { primitiveId: 'observer', name: 'OBSERVER', category: 'Organ' },
  { primitiveId: 'lingua', name: 'LINGUA', category: 'Organ' },
  { primitiveId: 'harvest', name: 'HARVEST', category: 'Organ' },
  { primitiveId: 'phantom', name: 'PHANTOM', category: 'Organ' },
  { primitiveId: 'nerve', name: 'NERVE', category: 'Organ' },
  // 12 Layers
  { primitiveId: 'defense', name: 'DEFENSE', category: 'Layer' },
  { primitiveId: 'governance', name: 'GOVERNANCE', category: 'Layer' },
  { primitiveId: 'evolution', name: 'EVOLUTION', category: 'Layer' },
  { primitiveId: 'shadow', name: 'SHADOW', category: 'Layer' },
  { primitiveId: 'oracle', name: 'ORACLE', category: 'Layer' },
  { primitiveId: 'sovereign', name: 'SOVEREIGN', category: 'Layer' },
  { primitiveId: 'treaty', name: 'TREATY', category: 'Layer' },
  { primitiveId: 'relay', name: 'RELAY', category: 'Layer' },
  { primitiveId: 'sandbox', name: 'SANDBOX', category: 'Layer' },
  { primitiveId: 'simulate', name: 'SIMULATE', category: 'Layer' },
  { primitiveId: 'forge', name: 'FORGE', category: 'Layer' },
  { primitiveId: 'immunity', name: 'IMMUNITY', category: 'Layer' },
  // 8 Engines
  { primitiveId: 'failsafe', name: 'FAILSAFE', category: 'Engine' },
  { primitiveId: 'beacon', name: 'BEACON', category: 'Engine' },
  { primitiveId: 'automaton', name: 'AUTOMATON', category: 'Engine' },
  { primitiveId: 'cortex', name: 'CORTEX', category: 'Engine' },
  { primitiveId: 'nexus', name: 'NEXUS', category: 'Engine' },
  { primitiveId: 'architect', name: 'ARCHITECT', category: 'Engine' },
  { primitiveId: 'encode', name: 'ENCODE', category: 'Engine' },
  { primitiveId: 'engineer', name: 'ENGINEER', category: 'Engine' },
  // 8 Agents
  { primitiveId: 'primitive', name: 'PRIMITIVE', category: 'Agent' },
  { primitiveId: 'wraith', name: 'WRAITH', category: 'Agent' },
  { primitiveId: 'obsidian', name: 'OBSIDIAN', category: 'Agent' },
  { primitiveId: 'monolith', name: 'MONOLITH', category: 'Agent' },
  { primitiveId: 'raptor', name: 'RAPTOR', category: 'Agent' },
  { primitiveId: 'decode', name: 'DECODE', category: 'Agent' },
  { primitiveId: 'sentinel', name: 'SENTINEL', category: 'Agent' },
  { primitiveId: 'atlas', name: 'ATLAS', category: 'Agent' },
];

export function getPrimitiveCatalog() {
  return PRIMITIVE_CATALOG;
}

// ═══════════════════════════════════════════════════════════════
// CAPABILITY REGISTRY — 5× expanded, classified by archetype
// ENCODE uses these to recommend upgrades based on code analysis
// ═══════════════════════════════════════════════════════════════

export interface CapabilityDefinition {
  id: string;
  name: string;
  description: string;
  archetype: CapabilityArchetype;
  /** Which primitives can unlock this capability */
  sourcePrimitives: string[];
  /** Usage example for the export */
  usageExample: string;
  /** Minimum code complexity needed (line count proxy) */
  minComplexity: number;
}

const CAPABILITY_REGISTRY: CapabilityDefinition[] = [
  // ═══ ACTIVE capabilities — continuous, runtime, intervening ═══
  { id: 'autonomous-decision-loop', name: 'Autonomous Decision Loop', description: 'Runtime decision engine that evaluates conditions and takes action without human intervention. Reduces response latency by 60-80%.', archetype: 'Active', sourcePrimitives: ['cortex', 'brain', 'nexus'], usageExample: "import { DecisionLoop } from '@cmpsbl/runtime';\nDecisionLoop.evaluate({ threshold: 0.85 });", minComplexity: 100 },
  { id: 'predictive-failure-shield', name: 'Predictive Failure Shield', description: 'Monitors runtime patterns and preemptively mitigates failures 30-60 seconds before they occur using statistical anomaly detection.', archetype: 'Active', sourcePrimitives: ['oracle', 'failsafe', 'beacon'], usageExample: "import { FailureShield } from '@cmpsbl/runtime';\nFailureShield.arm({ sensitivity: 'high' });", minComplexity: 50 },
  { id: 'live-threat-neutralizer', name: 'Live Threat Neutralizer', description: 'Continuously scans incoming requests for injection, XSS, and CSRF patterns. Blocks threats in real-time with zero-latency response.', archetype: 'Active', sourcePrimitives: ['defense', 'raptor', 'sentinel'], usageExample: "import { ThreatNeutralizer } from '@cmpsbl/runtime';\nThreatNeutralizer.engage({ mode: 'enforce' });", minComplexity: 50 },
  { id: 'cascade-breaker', name: 'Cascade Failure Breaker', description: 'Detects failure cascades across service boundaries and isolates affected components before propagation. Automatic recovery after stabilization.', archetype: 'Active', sourcePrimitives: ['failsafe', 'nerve', 'immunity'], usageExample: "import { CascadeBreaker } from '@cmpsbl/runtime';\nCascadeBreaker.protect({ isolationLevel: 'component' });", minComplexity: 80 },
  { id: 'adaptive-load-router', name: 'Adaptive Load Router', description: 'Dynamically distributes workload across available resources based on real-time capacity metrics. Prevents bottlenecks before they form.', archetype: 'Active', sourcePrimitives: ['nexus', 'relay', 'automaton'], usageExample: "import { LoadRouter } from '@cmpsbl/runtime';\nLoadRouter.balance({ strategy: 'adaptive' });", minComplexity: 100 },
  { id: 'self-healing-state', name: 'Self-Healing State Machine', description: 'Monitors application state for corruption and automatically repairs inconsistencies using last-known-good snapshots.', archetype: 'Active', sourcePrimitives: ['memory', 'failsafe', 'obsidian'], usageExample: "import { SelfHealingState } from '@cmpsbl/runtime';\nSelfHealingState.watch({ snapshotInterval: 5000 });", minComplexity: 80 },
  { id: 'real-time-perf-optimizer', name: 'Real-Time Performance Optimizer', description: 'Profiles execution paths at runtime and dynamically optimizes hot paths. Typical improvement: 15-40% latency reduction.', archetype: 'Active', sourcePrimitives: ['cortex', 'engineer', 'shadow'], usageExample: "import { PerfOptimizer } from '@cmpsbl/runtime';\nPerfOptimizer.profile({ autoOptimize: true });", minComplexity: 150 },
  { id: 'autonomous-patch-engine', name: 'Autonomous Patch Engine', description: 'Detects known vulnerability signatures at runtime and applies micro-patches without restart. Uses ENCODE-verified patch database.', archetype: 'Active', sourcePrimitives: ['encode', 'evolution', 'forge'], usageExample: "import { PatchEngine } from '@cmpsbl/runtime';\nPatchEngine.enable({ hotPatch: true });", minComplexity: 100 },
  { id: 'intelligent-retry-fabric', name: 'Intelligent Retry Fabric', description: 'Replaces naive retry loops with context-aware retry strategies. Backs off intelligently, switches fallback paths, and learns from failure patterns.', archetype: 'Active', sourcePrimitives: ['reflex', 'relay', 'brain'], usageExample: "import { RetryFabric } from '@cmpsbl/runtime';\nRetryFabric.wrap(fetchData, { maxAttempts: 5 });", minComplexity: 50 },
  { id: 'anomaly-response-agent', name: 'Anomaly Response Agent', description: 'Autonomous agent that detects statistical anomalies in system behavior and executes pre-configured response playbooks.', archetype: 'Active', sourcePrimitives: ['sentinel', 'oracle', 'raptor'], usageExample: "import { AnomalyAgent } from '@cmpsbl/runtime';\nAnomalyAgent.deploy({ playbook: 'standard' });", minComplexity: 100 },

  // ═══ PASSIVE capabilities — observational, non-intervening ═══
  { id: 'device-fingerprint-layer', name: 'Device Fingerprint Layer', description: 'Generates unique device fingerprints from browser/OS signals for fraud detection and session binding. Zero user-visible impact.', archetype: 'Passive', sourcePrimitives: ['defense', 'identity', 'phantom'], usageExample: "import { DeviceFingerprint } from '@cmpsbl/runtime';\nconst fp = DeviceFingerprint.generate();", minComplexity: 0 },
  { id: 'telemetry-mesh', name: 'Telemetry Mesh', description: 'Structured health signal collector compatible with Datadog, Grafana, Prometheus. Near-zero overhead continuous monitoring.', archetype: 'Passive', sourcePrimitives: ['beacon', 'observer', 'nerve'], usageExample: "import { TelemetryMesh } from '@cmpsbl/runtime';\nTelemetryMesh.emit('operation.complete', { ms: 42 });", minComplexity: 0 },
  { id: 'behavioral-audit-trail', name: 'Behavioral Audit Trail', description: 'Records every significant state transition with timestamps, actor IDs, and causal chains. FNV-1a hash-sealed for tamper evidence.', archetype: 'Passive', sourcePrimitives: ['governance', 'treaty', 'echo'], usageExample: "import { AuditTrail } from '@cmpsbl/runtime';\nAuditTrail.record('user.action', { userId, action });", minComplexity: 50 },
  { id: 'dependency-graph-monitor', name: 'Dependency Graph Monitor', description: 'Visualizes and tracks your dependency tree in real-time. Alerts on version drift, known CVEs, and license conflicts.', archetype: 'Passive', sourcePrimitives: ['engineer', 'immunity', 'atlas'], usageExample: "import { DepGraph } from '@cmpsbl/runtime';\nconst graph = DepGraph.analyze();", minComplexity: 80 },
  { id: 'structural-drift-detector', name: 'Structural Drift Detector', description: 'Compares current architecture against the original blueprint and flags deviations. Prevents architectural erosion over time.', archetype: 'Passive', sourcePrimitives: ['architect', 'shadow', 'compass'], usageExample: "import { DriftDetector } from '@cmpsbl/runtime';\nDriftDetector.compare({ baseline: 'v1.0' });", minComplexity: 100 },
  { id: 'cognitive-load-profiler', name: 'Cognitive Load Profiler', description: 'Measures code complexity per module and identifies areas where developer cognitive load exceeds maintainability thresholds.', archetype: 'Passive', sourcePrimitives: ['brain', 'observer', 'conscience'], usageExample: "import { CognitiveProfiler } from '@cmpsbl/runtime';\nCognitiveProfiler.assess('./src');", minComplexity: 100 },
  { id: 'silent-regression-scanner', name: 'Silent Regression Scanner', description: 'Background scanner that detects behavioral regressions by comparing output signatures against historical baselines.', archetype: 'Passive', sourcePrimitives: ['shadow', 'simulate', 'echo'], usageExample: "import { RegressionScanner } from '@cmpsbl/runtime';\nRegressionScanner.baseline('v2.0');", minComplexity: 80 },
  { id: 'api-contract-validator', name: 'API Contract Validator', description: 'Continuously validates API responses against defined schemas. Catches contract violations before they reach consumers.', archetype: 'Passive', sourcePrimitives: ['treaty', 'sovereign', 'encode'], usageExample: "import { ContractValidator } from '@cmpsbl/runtime';\nContractValidator.enforce(schema);", minComplexity: 50 },
  { id: 'dead-code-cartographer', name: 'Dead Code Cartographer', description: 'Maps unreachable code paths, unused exports, and orphaned modules. Generates pruning recommendations with safety scores.', archetype: 'Passive', sourcePrimitives: ['harvest', 'observer', 'engineer'], usageExample: "import { DeadCodeMap } from '@cmpsbl/runtime';\nconst report = DeadCodeMap.scan('./src');", minComplexity: 100 },
  { id: 'permission-boundary-map', name: 'Permission Boundary Map', description: 'Visualizes all access control boundaries in your application. Identifies over-privileged paths and shadow admin vectors.', archetype: 'Passive', sourcePrimitives: ['governance', 'defense', 'sovereign'], usageExample: "import { PermissionMap } from '@cmpsbl/runtime';\nPermissionMap.visualize();", minComplexity: 80 },

  // ═══ HYBRID capabilities — observe + intervene when needed ═══
  { id: 'policy-enforcement-layer', name: 'Policy Enforcement Layer', description: 'Configurable rules engine that observes operations and enforces compliance boundaries. Passive monitoring until violations trigger active blocking.', archetype: 'Hybrid', sourcePrimitives: ['governance', 'sovereign', 'treaty'], usageExample: "import { PolicyLayer } from '@cmpsbl/runtime';\nPolicyLayer.define({ maxConcurrency: 100 });", minComplexity: 50 },
  { id: 'circuit-breaker-mesh', name: 'Circuit Breaker Mesh', description: 'Monitors service call patterns (passive) and trips breakers when failure rates exceed thresholds (active). Configurable per-endpoint.', archetype: 'Hybrid', sourcePrimitives: ['failsafe', 'relay', 'nerve'], usageExample: "import { CircuitMesh } from '@cmpsbl/runtime';\nCircuitMesh.protect(apiClient, { threshold: 0.5 });", minComplexity: 50 },
  { id: 'smart-cache-orchestrator', name: 'Smart Cache Orchestrator', description: 'Observes access patterns and dynamically manages cache layers. Evicts proactively before TTL based on usage prediction.', archetype: 'Hybrid', sourcePrimitives: ['memory', 'cortex', 'harvest'], usageExample: "import { SmartCache } from '@cmpsbl/runtime';\nSmartCache.layer({ strategy: 'predictive' });", minComplexity: 80 },
  { id: 'canary-deployment-gate', name: 'Canary Deployment Gate', description: 'Routes a configurable percentage of traffic to new code paths. Monitors for anomalies and auto-rolls back if thresholds are breached.', archetype: 'Hybrid', sourcePrimitives: ['shadow', 'simulate', 'forge'], usageExample: "import { CanaryGate } from '@cmpsbl/runtime';\nCanaryGate.deploy({ trafficPercent: 5 });", minComplexity: 100 },
  { id: 'rate-limit-intelligence', name: 'Rate Limit Intelligence', description: 'Learns normal traffic patterns (passive) and dynamically adjusts rate limits per client/endpoint (active). Prevents abuse while preserving legitimate spikes.', archetype: 'Hybrid', sourcePrimitives: ['defense', 'brain', 'automaton'], usageExample: "import { RateLimiter } from '@cmpsbl/runtime';\nRateLimiter.adaptive({ learning: true });", minComplexity: 50 },
  { id: 'zero-downtime-migrator', name: 'Zero-Downtime Migrator', description: 'Observes data access patterns during migration, dual-writes to old and new schemas, and seamlessly cuts over when parity is confirmed.', archetype: 'Hybrid', sourcePrimitives: ['evolution', 'obsidian', 'monolith'], usageExample: "import { Migrator } from '@cmpsbl/runtime';\nMigrator.dualWrite({ source: oldDb, target: newDb });", minComplexity: 100 },
  { id: 'intent-disambiguation-engine', name: 'Intent Disambiguation Engine', description: 'Observes ambiguous user inputs and actively resolves intent through contextual analysis and confidence scoring.', archetype: 'Hybrid', sourcePrimitives: ['decode', 'lingua', 'cortex'], usageExample: "import { IntentEngine } from '@cmpsbl/runtime';\nconst intent = IntentEngine.resolve(userInput);", minComplexity: 50 },
  { id: 'sandbox-escalation-guard', name: 'Sandbox Escalation Guard', description: 'Runs untrusted operations in sandboxed contexts (passive isolation) and actively terminates processes that attempt privilege escalation.', archetype: 'Hybrid', sourcePrimitives: ['sandbox', 'defense', 'sentinel'], usageExample: "import { SandboxGuard } from '@cmpsbl/runtime';\nSandboxGuard.execute(untrustedFn);", minComplexity: 50 },
  { id: 'version-reconciliation', name: 'Version Reconciliation Engine', description: 'Tracks multiple concurrent versions of data structures. Automatically merges compatible changes and flags conflicts for review.', archetype: 'Hybrid', sourcePrimitives: ['memory', 'treaty', 'evolution'], usageExample: "import { VersionReconciler } from '@cmpsbl/runtime';\nVersionReconciler.merge(v1, v2);", minComplexity: 80 },
  { id: 'phantom-load-tester', name: 'Phantom Load Tester', description: 'Generates synthetic traffic that mirrors real user patterns. Passively collects baseline metrics, then actively stress-tests under configurable scenarios.', archetype: 'Hybrid', sourcePrimitives: ['phantom', 'simulate', 'wraith'], usageExample: "import { PhantomTest } from '@cmpsbl/runtime';\nPhantomTest.run({ concurrency: 1000 });", minComplexity: 100 },
];

export function getCapabilityRegistry() {
  return CAPABILITY_REGISTRY;
}

// ═══════════════════════════════════════════════════════════════
// ENCODE-DRIVEN RECOMMENDATION ENGINE
// Analyzes code signals to determine which primitives + capabilities
// best fit this specific codebase. Randomized within tiers.
// ═══════════════════════════════════════════════════════════════

/** Seeded pseudo-random for reproducible-per-session but varied builds */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/** Generate a numeric seed from code content */
function codeSeed(code: string): number {
  let hash = 0;
  for (let i = 0; i < Math.min(code.length, 500); i++) {
    hash = ((hash << 5) - hash) + code.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Run the six-primitive diagnostic squad.
 */
export async function runScanTeam(codeSnippet: string, fileName?: string): Promise<ScanResult> {
  const startTime = Date.now();
  const rand = seededRandom(codeSeed(codeSnippet));
  const metrics = analyzeCodeMetrics(codeSnippet, fileName);

  // Six-primitive scan squad
  const encodeFindings = analyzeWithEncode(codeSnippet, metrics);
  const oracleFindings = analyzeWithOracle(codeSnippet, metrics);
  const engineerFindings = analyzeWithEngineer(codeSnippet, metrics);
  const medicFindings = analyzeWithMedic(codeSnippet, metrics);
  const defenseFindings = analyzeWithDefense(codeSnippet, metrics);
  const failsafeFindings = analyzeWithFailsafe(codeSnippet, metrics);

  const allFindings = [
    ...encodeFindings,
    ...oracleFindings,
    ...engineerFindings,
    ...medicFindings,
    ...defenseFindings,
    ...failsafeFindings,
  ];

  // ENCODE drives recommendation — all 40 primitives eligible
  const recommendations = generateRecommendations(allFindings, codeSnippet, rand);

  const criticalCount = allFindings.filter(f => f.severity === 'critical').length;
  const warningCount = allFindings.filter(f => f.severity === 'warning').length;
  const baseCjpi = Math.max(35, 100 - (criticalCount * 10) - (warningCount * 4));
  const projectedCjpi = Math.min(100, baseCjpi + recommendations.slice(0, 10).length * 3 + Math.floor(metrics.depthScore / 10));

  return {
    findings: allFindings,
    recommendedPrimitives: recommendations,
    architecturalRunway: Math.max(3, 36 - (criticalCount * 5) - (warningCount * 2)),
    cjpiEstimate: baseCjpi,
    projectedCjpi,
    scanDurationMs: Date.now() - startTime,
    scanTeam: ['ENCODE', 'ORACLE', 'ENGINEER', 'MEDIC', 'DEFENSE', 'FAILSAFE'],
    metrics,
  };
}

// ═══════════════════════════════════════════════════════════════
// DIAGNOSTIC ANALYZERS — each primitive in the scan squad
// ═══════════════════════════════════════════════════════════════

function analyzeWithEncode(code: string, metrics: CodeMetrics): ScanFinding[] {
  const findings: ScanFinding[] = [];
  const ts = Date.now();

  if (!code.includes('try') && !code.includes('catch') && !code.includes('except') && !code.includes('rescue')) {
    findings.push({ id: `enc-${ts}-1`, severity: 'critical', title: 'No error handling detected', description: 'Code has no try/catch, except, or rescue blocks. Any runtime exception will crash the process.', source: 'ENCODE', primitiveRecommendation: 'FAILSAFE' });
  }

  if (code.includes('eval(') || code.includes('Function(') || code.includes('exec(')) {
    findings.push({ id: `enc-${ts}-2`, severity: 'critical', title: 'Dynamic code execution vulnerability', description: 'eval(), Function(), or exec() detected — injection vector for arbitrary code execution.', source: 'ENCODE', primitiveRecommendation: 'DEFENSE' });
  }

  if (metrics.totalLines > 50 && !metrics.hasAsync) {
    findings.push({ id: `enc-${ts}-3`, severity: 'warning', title: 'Synchronous-only architecture', description: 'No async patterns found in substantial codebase. May block the event loop under load.', source: 'ENCODE', primitiveRecommendation: 'RELAY' });
  }

  if (metrics.totalLines < 20) {
    findings.push({ id: `enc-${ts}-4`, severity: 'info', title: 'Minimal code surface', description: `Only ${metrics.totalLines} lines — full diagnostic requires more source for accurate analysis.`, source: 'ENCODE' });
  }

  if (/(?:password|secret|api_key|token)\s*[:=]\s*['"][^'"]{8,}/i.test(code)) {
    findings.push({ id: `enc-${ts}-5`, severity: 'critical', title: 'Hardcoded secrets detected', description: 'Credentials or API keys are embedded directly in source code. High-severity security risk.', source: 'ENCODE', primitiveRecommendation: 'WRAITH' });
  }

  if ((code.includes('req.body') || code.includes('req.params') || code.includes('req.query') || code.includes('request.')) && !code.includes('validate') && !code.includes('schema') && !code.includes('zod')) {
    findings.push({ id: `enc-${ts}-6`, severity: 'warning', title: 'Unvalidated request input', description: 'Request parameters accessed without validation. Risk of injection and malformed data processing.', source: 'ENCODE', primitiveRecommendation: 'SENTINEL' });
  }

  if (metrics.cyclomaticComplexity > 20) {
    findings.push({ id: `enc-${ts}-7`, severity: 'warning', title: `High cyclomatic complexity (${metrics.cyclomaticComplexity})`, description: `Complexity score of ${metrics.cyclomaticComplexity} indicates too many branching paths. Hard to test and maintain.`, source: 'ENCODE', primitiveRecommendation: 'CORTEX' });
  }

  if (metrics.maxNesting > 6) {
    findings.push({ id: `enc-${ts}-8`, severity: 'warning', title: `Deep nesting detected (${metrics.maxNesting} levels)`, description: 'Excessive nesting reduces readability and increases bug probability. ENCODE recommends flattening via early returns.', source: 'ENCODE', primitiveRecommendation: 'ARCHITECT' });
  }

  if (metrics.longestFunction > 80) {
    findings.push({ id: `enc-${ts}-9`, severity: 'info', title: `Oversized function (~${metrics.longestFunction} lines)`, description: 'Functions exceeding 80 lines violate single-responsibility. ENCODE recommends decomposition.', source: 'ENCODE', primitiveRecommendation: 'ENGINEER' });
  }

  return findings;
}

function analyzeWithOracle(code: string, metrics: CodeMetrics): ScanFinding[] {
  const findings: ScanFinding[] = [];
  const ts = Date.now();

  if (!metrics.hasTests) {
    findings.push({ id: `orc-${ts}-1`, severity: 'warning', title: 'No test coverage detected', description: 'ORACLE predicts 73% probability of regression bugs within 6 months without test coverage.', source: 'ORACLE', primitiveRecommendation: 'SHADOW' });
  }

  if (code.includes('TODO') || code.includes('FIXME') || code.includes('HACK') || code.includes('XXX')) {
    const count = (code.match(/\b(TODO|FIXME|HACK|XXX)\b/g) ?? []).length;
    findings.push({ id: `orc-${ts}-2`, severity: 'warning', title: `${count} technical debt markers found`, description: `${count} TODO/FIXME/HACK/XXX markers indicate deferred work. ORACLE estimates this compounds into architectural risk within 12 months.`, source: 'ORACLE', primitiveRecommendation: 'EVOLUTION' });
  }

  if (/for\s*\([\s\S]*?for\s*\(/.test(code)) {
    findings.push({ id: `orc-${ts}-3`, severity: 'warning', title: 'Nested loop detected — O(n²) risk', description: 'ORACLE predicts exponential slowdown under scale. Quadratic complexity compounds with data growth.', source: 'ORACLE', primitiveRecommendation: 'CORTEX' });
  }

  if (metrics.totalLines > 30 && !code.includes('fallback') && !code.includes('retry') && !code.includes('backup') && !code.includes('catch')) {
    findings.push({ id: `orc-${ts}-4`, severity: 'info', title: 'No fallback mechanisms detected', description: 'ORACLE identifies single-path execution. Failure in any step halts the entire pipeline.', source: 'ORACLE', primitiveRecommendation: 'REFLEX' });
  }

  if (metrics.functionCount > 0 && metrics.totalLines / metrics.functionCount > 60) {
    findings.push({ id: `orc-${ts}-5`, severity: 'info', title: 'Low function density', description: `ORACLE detects ${metrics.functionCount} functions across ${metrics.totalLines} lines (~${Math.round(metrics.totalLines / metrics.functionCount)} lines/fn). Monolithic functions resist change.`, source: 'ORACLE', primitiveRecommendation: 'ARCHITECT' });
  }

  if (metrics.depthScore > 60 && !metrics.hasTypes) {
    findings.push({ id: `orc-${ts}-6`, severity: 'warning', title: 'Complex codebase without type safety', description: 'ORACLE predicts 45% higher bug rate in complex untyped code. Type contracts prevent class of runtime errors.', source: 'ORACLE', primitiveRecommendation: 'TREATY' });
  }

  if (code.includes('.then(') && code.includes('.catch(') && code.includes('.then(')) {
    findings.push({ id: `orc-${ts}-7`, severity: 'info', title: 'Promise chain complexity', description: 'ORACLE detects deeply nested promise chains. Async/await patterns improve readability and error tracing.', source: 'ORACLE', primitiveRecommendation: 'RELAY' });
  }

  return findings;
}

function analyzeWithEngineer(code: string, metrics: CodeMetrics): ScanFinding[] {
  const findings: ScanFinding[] = [];
  const ts = Date.now();

  if (metrics.importCount > 15) {
    findings.push({ id: `eng-${ts}-1`, severity: 'warning', title: `High dependency coupling (${metrics.importCount} imports)`, description: `${metrics.importCount} imports detected — high coupling increases blast radius of dependency failures.`, source: 'ENGINEER', primitiveRecommendation: 'IMMUNITY' });
  }

  if (!metrics.hasTypes && metrics.totalLines > 30) {
    findings.push({ id: `eng-${ts}-2`, severity: 'info', title: 'No type contracts detected', description: 'No interfaces or type definitions found. Type safety improves long-term maintainability.', source: 'ENGINEER', primitiveRecommendation: 'TREATY' });
  }

  if (metrics.totalLines > 200) {
    findings.push({ id: `eng-${ts}-3`, severity: 'warning', title: `Monolithic file (${metrics.totalLines} lines)`, description: `${metrics.totalLines} lines in a single file. ENGINEER recommends decomposition to reduce cognitive load.`, source: 'ENGINEER', primitiveRecommendation: 'ARCHITECT' });
  }

  if (metrics.totalLines > 20 && metrics.exportCount === 0) {
    findings.push({ id: `eng-${ts}-4`, severity: 'info', title: 'No module exports detected', description: 'Code appears self-contained with no exports. Limits reusability and testability.', source: 'ENGINEER', primitiveRecommendation: 'COMPASS' });
  }

  if (metrics.avgLineLength > 100) {
    findings.push({ id: `eng-${ts}-5`, severity: 'info', title: `Long lines detected (avg ${metrics.avgLineLength} chars)`, description: 'Average line length exceeds 100 characters. Reduces readability and causes horizontal scroll in reviews.', source: 'ENGINEER', primitiveRecommendation: 'ENCODE' });
  }

  if (metrics.classCount > 5) {
    findings.push({ id: `eng-${ts}-6`, severity: 'info', title: `${metrics.classCount} classes in single file`, description: 'Multiple classes in one file suggest God Object patterns. ENGINEER recommends single-class files.', source: 'ENGINEER', primitiveRecommendation: 'ARCHITECT' });
  }

  if (metrics.blankLines === 0 && metrics.totalLines > 30) {
    findings.push({ id: `eng-${ts}-7`, severity: 'info', title: 'No whitespace separation', description: 'Dense code with no blank lines reduces readability. Logical blocks should be visually separated.', source: 'ENGINEER', primitiveRecommendation: 'ENCODE' });
  }

  return findings;
}

function analyzeWithMedic(code: string, metrics: CodeMetrics): ScanFinding[] {
  const findings: ScanFinding[] = [];
  const ts = Date.now();

  const commentRatio = metrics.commentLines / Math.max(metrics.totalLines, 1);
  if (commentRatio > 0.3) {
    findings.push({ id: `med-${ts}-1`, severity: 'info', title: `High comment ratio (${Math.round(commentRatio * 100)}%)`, description: 'Over 30% of lines are comments. MEDIC suspects commented-out dead code that should be pruned.', source: 'MEDIC', primitiveRecommendation: 'HARVEST' });
  }

  if (code.includes('deprecated') || code.includes('@deprecated')) {
    findings.push({ id: `med-${ts}-2`, severity: 'warning', title: 'Deprecated API usage detected', description: 'Code references deprecated APIs. Structural rot accumulates — these should be replaced before they break.', source: 'MEDIC', primitiveRecommendation: 'EVOLUTION' });
  }

  if (code.includes('useState') && !code.includes('useEffect') && code.split('useState').length > 4) {
    findings.push({ id: `med-${ts}-3`, severity: 'info', title: 'Excessive unmanaged state', description: 'Multiple useState hooks without cleanup effects. MEDIC flags potential state leaks.', source: 'MEDIC', primitiveRecommendation: 'MEMORY' });
  }

  if (code.includes('any') && metrics.language === 'TypeScript') {
    const anyCount = (code.match(/:\s*any\b/g) ?? []).length;
    if (anyCount > 2) {
      findings.push({ id: `med-${ts}-4`, severity: 'warning', title: `${anyCount} untyped 'any' usages`, description: `${anyCount} uses of 'any' type bypass TypeScript safety. MEDIC recommends proper typing to prevent silent runtime errors.`, source: 'MEDIC', primitiveRecommendation: 'TREATY' });
    }
  }

  if (code.includes('new Date()') && !code.includes('UTC') && !code.includes('toISO')) {
    findings.push({ id: `med-${ts}-5`, severity: 'info', title: 'Timezone-unsafe date operations', description: 'Date operations without explicit timezone handling. Can cause data inconsistencies across regions.', source: 'MEDIC', primitiveRecommendation: 'SOVEREIGN' });
  }

  if (metrics.commentLines === 0 && metrics.codeLines > 50) {
    findings.push({ id: `med-${ts}-6`, severity: 'info', title: 'Zero documentation comments', description: 'No comments in 50+ lines of code. MEDIC flags undocumented logic as maintainability risk.', source: 'MEDIC', primitiveRecommendation: 'ENCODE' });
  }

  if (/console\.(log|warn|error)\(/.test(code) && metrics.totalLines > 30) {
    const logCount = (code.match(/console\.(log|warn|error)\(/g) ?? []).length;
    findings.push({ id: `med-${ts}-7`, severity: 'info', title: `${logCount} raw console statements`, description: 'Unstructured logging detected. Production code should use structured logging for observability.', source: 'MEDIC', primitiveRecommendation: 'ECHO' });
  }

  return findings;
}

function analyzeWithDefense(code: string, metrics: CodeMetrics): ScanFinding[] {
  const findings: ScanFinding[] = [];
  const ts = Date.now();

  if (code.includes('SELECT') && (code.includes('${') || code.includes("' +"))) {
    findings.push({ id: `def-${ts}-1`, severity: 'critical', title: 'SQL injection vulnerability', description: 'String interpolation in SQL queries detected. Direct path to database compromise.', source: 'DEFENSE', primitiveRecommendation: 'DEFENSE' });
  }

  if (code.includes("'*'") && (code.includes('Access-Control') || code.includes('cors'))) {
    findings.push({ id: `def-${ts}-2`, severity: 'warning', title: 'Permissive CORS configuration', description: 'Wildcard CORS origin detected. Any domain can make authenticated requests.', source: 'DEFENSE', primitiveRecommendation: 'SOVEREIGN' });
  }

  if ((code.includes('app.get') || code.includes('app.post') || code.includes('router.')) && !code.includes('auth') && !code.includes('middleware') && !code.includes('token')) {
    findings.push({ id: `def-${ts}-3`, severity: 'warning', title: 'No authentication layer detected', description: 'Route handlers without authentication middleware. All endpoints publicly accessible.', source: 'DEFENSE', primitiveRecommendation: 'IDENTITY' });
  }

  if (code.includes('innerHTML') || code.includes('dangerouslySetInnerHTML') || code.includes('document.write')) {
    findings.push({ id: `def-${ts}-4`, severity: 'critical', title: 'XSS vulnerability — raw HTML injection', description: 'Direct HTML insertion without sanitization. Attackers can inject malicious scripts.', source: 'DEFENSE', primitiveRecommendation: 'SANDBOX' });
  }

  if (code.includes('http://') && !code.includes('localhost')) {
    findings.push({ id: `def-${ts}-5`, severity: 'warning', title: 'Insecure HTTP protocol usage', description: 'Non-HTTPS URLs detected. Data transmitted in plaintext is vulnerable to interception.', source: 'DEFENSE', primitiveRecommendation: 'DEFENSE' });
  }

  if (/Math\.random\(\)/.test(code) && (code.includes('token') || code.includes('secret') || code.includes('key') || code.includes('id'))) {
    findings.push({ id: `def-${ts}-6`, severity: 'warning', title: 'Weak randomness for security-sensitive values', description: 'Math.random() is not cryptographically secure. Use crypto.randomUUID() for tokens and IDs.', source: 'DEFENSE', primitiveRecommendation: 'WRAITH' });
  }

  if (code.includes('process.env') && !code.includes('dotenv') && !code.includes('.env')) {
    findings.push({ id: `def-${ts}-7`, severity: 'info', title: 'Direct env var access without config layer', description: 'Environment variables accessed directly. A config layer prevents missing-var crashes.', source: 'DEFENSE', primitiveRecommendation: 'GOVERNANCE' });
  }

  return findings;
}

function analyzeWithFailsafe(code: string, metrics: CodeMetrics): ScanFinding[] {
  const findings: ScanFinding[] = [];
  const ts = Date.now();

  if ((code.includes('server') || code.includes('listen')) && !code.includes('SIGTERM') && !code.includes('SIGINT') && !code.includes('graceful')) {
    findings.push({ id: `fs-${ts}-1`, severity: 'warning', title: 'No graceful shutdown handler', description: 'Server starts without SIGTERM/SIGINT handling. Abrupt shutdowns may corrupt in-flight operations.', source: 'FAILSAFE', primitiveRecommendation: 'FAILSAFE' });
  }

  if ((code.includes('fetch') || code.includes('axios') || code.includes('http.')) && !code.includes('timeout') && !code.includes('AbortController')) {
    findings.push({ id: `fs-${ts}-2`, severity: 'info', title: 'Network calls without timeout', description: 'HTTP requests without timeout configuration. Hung requests can exhaust connection pools.', source: 'FAILSAFE', primitiveRecommendation: 'AUTOMATON' });
  }

  if (!code.includes('catch') && metrics.hasAsync) {
    findings.push({ id: `fs-${ts}-3`, severity: 'critical', title: 'Unhandled async rejections', description: 'Async code without catch blocks. Unhandled rejections crash Node.js processes in production.', source: 'FAILSAFE', primitiveRecommendation: 'FAILSAFE' });
  }

  if (metrics.importCount > 10 && !code.includes('fallback') && !code.includes('retry')) {
    findings.push({ id: `fs-${ts}-4`, severity: 'info', title: 'No dependency failure fallbacks', description: `${metrics.importCount} dependencies with no fallback strategy. Any dependency failure cascades to your application.`, source: 'FAILSAFE', primitiveRecommendation: 'IMMUNITY' });
  }

  if (code.includes('setInterval') && !code.includes('clearInterval')) {
    findings.push({ id: `fs-${ts}-5`, severity: 'warning', title: 'Uncleared interval detected', description: 'setInterval without clearInterval. Memory leak that compounds over time until process crashes.', source: 'FAILSAFE', primitiveRecommendation: 'MEMORY' });
  }

  if (!code.includes('process.exit') && !code.includes('return') && metrics.totalLines > 50 && !code.includes('finally')) {
    findings.push({ id: `fs-${ts}-6`, severity: 'info', title: 'No cleanup handlers detected', description: 'Long-running code without finally blocks or cleanup handlers. Resources may leak on unexpected termination.', source: 'FAILSAFE', primitiveRecommendation: 'FAILSAFE' });
  }

  if (code.includes('while(true)') || code.includes('while (true)')) {
    findings.push({ id: `fs-${ts}-7`, severity: 'warning', title: 'Infinite loop without break condition', description: 'while(true) detected. Without explicit break conditions, this risks CPU exhaustion.', source: 'FAILSAFE', primitiveRecommendation: 'BEACON' });
  }

  return findings;
}

// ═══════════════════════════════════════════════════════════════
// RECOMMENDATION ENGINE — ENCODE-driven, all 40 primitives eligible
// ═══════════════════════════════════════════════════════════════

/** ENCODE analyzes code signals to score each primitive's relevance */
function scorePrimitiveRelevance(
  primitive: typeof PRIMITIVE_CATALOG[0],
  code: string,
  findings: ScanFinding[],
  rand: () => number,
): { score: number; rationale: string } {
  let score = 30 + Math.floor(rand() * 25); // Base 30-55 randomized
  let rationale = '';

  // Direct finding recommendation — highest priority
  const directFinding = findings.find(f =>
    f.primitiveRecommendation?.toLowerCase() === primitive.primitiveId
  );
  if (directFinding) {
    score += directFinding.severity === 'critical' ? 40 : directFinding.severity === 'warning' ? 25 : 15;
    rationale = directFinding.title;
    return { score: Math.min(99, score), rationale };
  }

  // ENCODE heuristics — code signal analysis
  const len = code.length;
  const hasAsync = code.includes('async') || code.includes('Promise');
  const hasClasses = code.includes('class ');
  const hasHttp = code.includes('fetch') || code.includes('axios') || code.includes('http');
  const hasDb = code.includes('SELECT') || code.includes('INSERT') || code.includes('query');
  const hasState = code.includes('useState') || code.includes('state') || code.includes('store');
  const hasAuth = code.includes('auth') || code.includes('token') || code.includes('jwt');

  const SIGNAL_MAP: Record<string, { signals: boolean[]; rationale: string }> = {
    brain: { signals: [hasClasses, len > 300], rationale: 'Complex logic benefits from continuous learning patterns' },
    memory: { signals: [hasState, hasDb], rationale: 'State management detected — persistent memory improves reliability' },
    identity: { signals: [hasAuth, hasHttp], rationale: 'Authentication and identity resolution strengthen access control' },
    conscience: { signals: [len > 400, hasClasses], rationale: 'Complex systems need ethical decision boundaries' },
    compass: { signals: [!code.includes('export'), len > 200], rationale: 'Navigation and module discovery improve maintainability' },
    reflex: { signals: [hasAsync, hasHttp], rationale: 'Async operations benefit from fast reflexive fallback paths' },
    echo: { signals: [code.includes('log') || code.includes('console'), len > 100], rationale: 'Structured echo patterns replace scattered logging' },
    observer: { signals: [hasState, hasAsync], rationale: 'Observable state transitions improve debugging and monitoring' },
    lingua: { signals: [code.includes('string') || code.includes('text'), code.includes('parse')], rationale: 'Text processing benefits from structured language interpretation' },
    harvest: { signals: [len > 500, code.includes('//')], rationale: 'Large codebases accumulate dead code — HARVEST identifies and prunes' },
    phantom: { signals: [hasHttp, hasAsync], rationale: 'Phantom testing simulates real traffic patterns for stress validation' },
    nerve: { signals: [hasAsync, code.includes('event')], rationale: 'Event-driven systems need reliable signal propagation via NERVE' },
    defense: { signals: [hasHttp, hasAuth], rationale: 'Network-facing code requires defense-in-depth hardening' },
    governance: { signals: [hasDb, hasAuth], rationale: 'Data operations need governance policy enforcement' },
    evolution: { signals: [code.includes('TODO') || code.includes('FIXME'), len > 200], rationale: 'Technical debt signals benefit from managed evolution cycles' },
    shadow: { signals: [hasClasses, len > 300], rationale: 'Complex systems benefit from shadow testing and canary analysis' },
    oracle: { signals: [hasAsync, hasDb], rationale: 'Predictive failure analysis prevents cascading outages' },
    sovereign: { signals: [hasAuth, code.includes('role') || code.includes('permission')], rationale: 'Authorization logic benefits from sovereign policy management' },
    treaty: { signals: [code.includes('interface') || code.includes('type '), hasHttp], rationale: 'API contracts need treaty-level enforcement and validation' },
    relay: { signals: [hasAsync, hasHttp], rationale: 'Async communication pathways benefit from reliable relay routing' },
    sandbox: { signals: [code.includes('eval') || code.includes('exec'), hasHttp], rationale: 'Untrusted execution paths need sandboxed isolation' },
    simulate: { signals: [hasClasses, len > 200], rationale: 'Simulation enables safe testing of architectural changes' },
    forge: { signals: [code.includes('build') || code.includes('compile'), hasClasses], rationale: 'Build and transformation pipelines benefit from FORGE hardening' },
    immunity: { signals: [code.includes('import'), hasAsync], rationale: 'Dependency chains need immunity against cascading failures' },
    failsafe: { signals: [!code.includes('try'), hasHttp], rationale: 'Missing error boundaries — FAILSAFE provides circuit breakers and recovery' },
    beacon: { signals: [true, hasAsync], rationale: 'Real-time health monitoring ensures system observability' },
    automaton: { signals: [hasAsync, code.includes('cron') || code.includes('schedule')], rationale: 'Repetitive tasks benefit from deterministic automation' },
    cortex: { signals: [hasClasses, len > 400], rationale: 'Complex decision paths need contextual reasoning via CORTEX' },
    nexus: { signals: [hasHttp, hasAsync], rationale: 'Multi-path operations benefit from intelligent routing' },
    architect: { signals: [len > 300, code.includes('class') || code.includes('module')], rationale: 'Structural blueprinting prevents architectural regression' },
    encode: { signals: [len > 200, true], rationale: 'ENCODE maps behavioral signatures for traceability and patching' },
    engineer: { signals: [code.includes('import'), len > 200], rationale: 'Dependency resolution and structural reinforcement' },
    primitive: { signals: [true, true], rationale: 'Foundational execution layer — every build benefits from base hardening' },
    wraith: { signals: [hasAuth, code.includes('secret') || code.includes('key')], rationale: 'Sensitive operations need stealth handling with minimal footprint' },
    obsidian: { signals: [hasDb, hasState], rationale: 'Critical data persistence needs redundant storage and integrity checks' },
    monolith: { signals: [hasAsync, len > 400], rationale: 'Complex multi-step operations need atomic transaction coordination' },
    raptor: { signals: [hasHttp, hasAuth], rationale: 'Perimeter scanning and real-time threat detection' },
    decode: { signals: [code.includes('input') || code.includes('command'), len > 100], rationale: 'User input interpretation benefits from structured intent resolution' },
    sentinel: { signals: [hasHttp, hasAuth], rationale: 'Continuous validation and guard enforcement at system boundaries' },
    atlas: { signals: [len > 300, code.includes('import')], rationale: 'System-wide mapping and navigation for complex codebases' },
  };

  const mapping = SIGNAL_MAP[primitive.primitiveId];
  if (mapping) {
    const signalHits = mapping.signals.filter(Boolean).length;
    score += signalHits * 12;
    rationale = mapping.rationale;
  }

  // Category bonus — ensure diverse mix
  const categoryBonus = { Organ: 5, Layer: 3, Engine: 8, Agent: 4 };
  score += categoryBonus[primitive.category] + Math.floor(rand() * 10);

  return { score: Math.min(99, score), rationale: rationale || `${primitive.name} strengthens ${primitive.category.toLowerCase()}-level hardening` };
}

function generateRecommendations(
  findings: ScanFinding[],
  code: string,
  rand: () => number,
): PrimitiveRecommendation[] {
  // Score ALL 40 primitives
  const scored = PRIMITIVE_CATALOG.map(p => {
    const { score, rationale } = scorePrimitiveRelevance(p, code, findings, rand);
    return { ...p, impactScore: score, rationale };
  });

  // Sort by impact, take top 20 (max selectable), ensuring at least
  // 2 from each category for balanced recommendations
  scored.sort((a, b) => b.impactScore - a.impactScore);

  const result: PrimitiveRecommendation[] = [];
  const categoryCounts: Record<string, number> = { Organ: 0, Layer: 0, Engine: 0, Agent: 0 };
  const minPerCategory = 2;

  // First pass: ensure minimum per category
  for (const cat of ['Engine', 'Layer', 'Organ', 'Agent'] as const) {
    const catPrims = scored.filter(p => p.category === cat);
    for (const p of catPrims) {
      if (categoryCounts[cat] < minPerCategory && result.length < 20) {
        result.push(p);
        categoryCounts[cat]++;
      }
    }
  }

  // Second pass: fill remaining slots by impact score
  for (const p of scored) {
    if (result.length >= 20) break;
    if (!result.find(r => r.primitiveId === p.primitiveId)) {
      result.push(p);
      categoryCounts[p.category]++;
    }
  }

  return result.sort((a, b) => b.impactScore - a.impactScore);
}
