/**
 * Restoration Scan Team — ENCODE + ORACLE + ENGINEER + MEDIC + DEFENSE + FAILSAFE
 * Six-primitive diagnostic squad for the Ascension Lab.
 * All 40 primitives available as recommendations.
 * Capabilities classified as Active/Passive/Hybrid archetypes.
 * ENCODE drives selection logic with randomization for unique builds.
 * Deep pattern analysis with 6-8 findings per analyzer.
 */

import type { RateLimitDecision } from '@/lib/substrate/adaptive-rate-limit';
import { analyzeCodeMetrics, type CodeMetrics } from './code-metrics';
import { getCyberSecurityEngines, getCyberSecurityAgents } from './verticals/cybersecurity';
import { getRoboticsEngines, getRoboticsAgents } from './verticals/robotics';
import { getQuantumEngines, getQuantumAgents } from './verticals/quantum';
import { getLLMEngines, getLLMAgents } from './verticals/llm';
import { getAgencyEngines, getAgencyAgents } from './verticals/agency';
import { getVerticalSubdomain } from '@/config/domains';
import { getDynamicVerticalPrimitives, getDynamicSignalMap } from './vertical-factory-engine';
import { runUniversalPoolScan } from './universal-pool-scanner';

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
  /** Position in the deterministic execution chain (1-indexed) */
  chainPosition: number;
  /** Cascading collision score from the chain sequencer */
  collisionScore: number;
}

/** Core 24 spine primitives (12 Organs + 12 Layers) — shared across all verticals */
const SPINE_PRIMITIVES: Omit<PrimitiveRecommendation, 'impactScore' | 'rationale' | 'chainPosition' | 'collisionScore'>[] = [
  // 12 Organs
  { primitiveId: 'core', name: 'CORE', category: 'Organ' },
  { primitiveId: 'system', name: 'SYSTEM', category: 'Organ' },
  { primitiveId: 'brain', name: 'BRAIN', category: 'Organ' },
  { primitiveId: 'memory', name: 'MEMORY', category: 'Organ' },
  { primitiveId: 'nerve', name: 'NERVE', category: 'Organ' },
  { primitiveId: 'nexus', name: 'NEXUS', category: 'Organ' },
  { primitiveId: 'identity', name: 'IDENTITY', category: 'Organ' },
  { primitiveId: 'sovereign', name: 'SOVEREIGN', category: 'Organ' },
  { primitiveId: 'atlas', name: 'ATLAS', category: 'Organ' },
  { primitiveId: 'medic', name: 'MEDIC', category: 'Organ' },
  { primitiveId: 'relay', name: 'RELAY', category: 'Organ' },
  { primitiveId: 'conscience', name: 'CONSCIENCE', category: 'Organ' },
  // 12 Layers
  { primitiveId: 'defense', name: 'DEFENSE', category: 'Layer' },
  { primitiveId: 'immunity', name: 'IMMUNITY', category: 'Layer' },
  { primitiveId: 'governance', name: 'GOVERNANCE', category: 'Layer' },
  { primitiveId: 'treaty', name: 'TREATY', category: 'Layer' },
  { primitiveId: 'evolution', name: 'EVOLUTION', category: 'Layer' },
  { primitiveId: 'reflex', name: 'REFLEX', category: 'Layer' },
  { primitiveId: 'compass', name: 'COMPASS', category: 'Layer' },
  { primitiveId: 'integration', name: 'INTEGRATION', category: 'Layer' },
  { primitiveId: 'intent', name: 'INTENT', category: 'Layer' },
  { primitiveId: 'access', name: 'ACCESS', category: 'Layer' },
  { primitiveId: 'vision', name: 'VISION', category: 'Layer' },
  { primitiveId: 'shadow', name: 'SHADOW', category: 'Layer' },
];

/** Standard 8 Engines + 8 Agents — canonical primitives (cmpsbl.com default) */
const STANDARD_ENGINES_AGENTS: Omit<PrimitiveRecommendation, 'impactScore' | 'rationale'>[] = [
  // 8 Engines
  { primitiveId: 'dream', name: 'DREAM', category: 'Engine' },
  { primitiveId: 'harvest', name: 'HARVEST', category: 'Engine' },
  { primitiveId: 'forge', name: 'FORGE', category: 'Engine' },
  { primitiveId: 'lingua', name: 'LINGUA', category: 'Engine' },
  { primitiveId: 'echo', name: 'ECHO', category: 'Engine' },
  { primitiveId: 'phantom', name: 'PHANTOM', category: 'Engine' },
  { primitiveId: 'sandbox', name: 'SANDBOX', category: 'Engine' },
  { primitiveId: 'ripple', name: 'RIPPLE', category: 'Engine' },
  // 8 Agents
  { primitiveId: 'encode', name: 'ENCODE', category: 'Agent' },
  { primitiveId: 'decode', name: 'DECODE', category: 'Agent' },
  { primitiveId: 'audit', name: 'AUDIT', category: 'Agent' },
  { primitiveId: 'economy', name: 'ECONOMY', category: 'Agent' },
  { primitiveId: 'inclusive', name: 'INCLUSIVE', category: 'Agent' },
  { primitiveId: 'cortex', name: 'CORTEX', category: 'Agent' },
  { primitiveId: 'oracle', name: 'ORACLE', category: 'Agent' },
  { primitiveId: 'engineer', name: 'ENGINEER', category: 'Agent' },
];

/**
 * Build the 40-primitive catalog for the active vertical.
 * Each vertical gets its own specialized engines/agents; default falls back to standard.
 */
function buildVerticalCatalog(): {
  spine: Omit<PrimitiveRecommendation, 'impactScore' | 'rationale'>[];
  expansion: Omit<PrimitiveRecommendation, 'impactScore' | 'rationale'>[];
} {
  const vertical = getVerticalSubdomain();

  if (vertical === 'security') {
    const cyberEngines = getCyberSecurityEngines().map(e => ({
      primitiveId: e.id.toLowerCase(),
      name: e.name,
      category: 'Engine' as const,
    }));
    const cyberAgents = getCyberSecurityAgents().map(a => ({
      primitiveId: a.id.toLowerCase(),
      name: a.name,
      category: 'Agent' as const,
    }));
    return { spine: [...SPINE_PRIMITIVES], expansion: [...cyberEngines, ...cyberAgents] };
  }

  if (vertical === 'robotics') {
    const roboEngines = getRoboticsEngines().map(e => ({
      primitiveId: e.id.toLowerCase(),
      name: e.name,
      category: 'Engine' as const,
    }));
    const roboAgents = getRoboticsAgents().map(a => ({
      primitiveId: a.id.toLowerCase(),
      name: a.name,
      category: 'Agent' as const,
    }));
    return { spine: [...SPINE_PRIMITIVES], expansion: [...roboEngines, ...roboAgents] };
  }

  if (vertical === 'quantum') {
    const qEngines = getQuantumEngines().map(e => ({
      primitiveId: e.id.toLowerCase(),
      name: e.name,
      category: 'Engine' as const,
    }));
    const qAgents = getQuantumAgents().map(a => ({
      primitiveId: a.id.toLowerCase(),
      name: a.name,
      category: 'Agent' as const,
    }));
    return { spine: [...SPINE_PRIMITIVES], expansion: [...qEngines, ...qAgents] };
  }

  if (vertical === 'llm') {
    const llmEngines = getLLMEngines().map(e => ({
      primitiveId: e.id.toLowerCase(),
      name: e.name,
      category: 'Engine' as const,
    }));
    const llmAgents = getLLMAgents().map(a => ({
      primitiveId: a.id.toLowerCase(),
      name: a.name,
      category: 'Agent' as const,
    }));
    return { spine: [...SPINE_PRIMITIVES], expansion: [...llmEngines, ...llmAgents] };
  }

  if (vertical === 'agency') {
    const agencyEngines = getAgencyEngines().map(e => ({
      primitiveId: e.id.toLowerCase(),
      name: e.name,
      category: 'Engine' as const,
    }));
    const agencyAgents = getAgencyAgents().map(a => ({
      primitiveId: a.id.toLowerCase(),
      name: a.name,
      category: 'Agent' as const,
    }));
    return { spine: [...SPINE_PRIMITIVES], expansion: [...agencyEngines, ...agencyAgents] };
  }

  // Dynamic verticals — auto-discovered from the factory engine
  if (vertical) {
    const dynamicPrimitives = getDynamicVerticalPrimitives(vertical);
    if (dynamicPrimitives) {
      const dynEngines = dynamicPrimitives.engines.map(e => ({
        primitiveId: e.id.toLowerCase(),
        name: e.name,
        category: 'Engine' as const,
      }));
      const dynAgents = dynamicPrimitives.agents.map(a => ({
        primitiveId: a.id.toLowerCase(),
        name: a.name,
        category: 'Agent' as const,
      }));
      return { spine: [...SPINE_PRIMITIVES], expansion: [...dynEngines, ...dynAgents] };
    }
  }

  return { spine: [...SPINE_PRIMITIVES], expansion: [...STANDARD_ENGINES_AGENTS] };
}

export function getPrimitiveCatalog() {
  return buildVerticalCatalog();
}

function toRecommendationCategory(
  role: 'organ' | 'layer' | 'engine' | 'agent',
): PrimitiveRecommendation['category'] {
  switch (role) {
    case 'organ':
      return 'Organ';
    case 'layer':
      return 'Layer';
    case 'engine':
      return 'Engine';
    case 'agent':
      return 'Agent';
  }
}

/** Map vertical subdomain to scanner source label */
const SUBDOMAIN_TO_SOURCE: Record<string, string> = {
  security: 'cyber', robotics: 'robotics', quantum: 'quantum',
  llm: 'llm', agency: 'agency', media: 'media', ultimate: '',
};

function buildUltimateRecommendations(code: string): PrimitiveRecommendation[] {
  const subdomain = getVerticalSubdomain();
  // Resolve vertical affinity — Ultimate gets no boost (it's the universal tier)
  const verticalAffinity = subdomain
    ? (SUBDOMAIN_TO_SOURCE[subdomain] ?? subdomain) || undefined
    : undefined;
  const scan = runUniversalPoolScan(code, 'ascension', verticalAffinity);

  return scan.selectedPrimitives
    .map((candidate) => {
      const sourceLabel = candidate.sourceVertical === 'spine'
        ? 'Shared substrate'
        : `${candidate.sourceVertical.charAt(0).toUpperCase()}${candidate.sourceVertical.slice(1)} source`;
      const signalSummary = candidate.totalSignals > 0
        ? `${candidate.signalHits}/${candidate.totalSignals} signal hits`
        : 'collision surfaced';

      return {
        primitiveId: candidate.primitive.id.toLowerCase(),
        name: candidate.primitive.name,
        category: toRecommendationCategory(candidate.primitive.role),
        impactScore: Math.max(55, Math.min(99, Math.round(candidate.compoundingScore * 100))),
        rationale: `${sourceLabel} · ${signalSummary} · collision ${Math.round(candidate.compoundingScore * 100)}`,
      };
    })
    .sort((a, b) => b.impactScore - a.impactScore);
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
  { id: 'predictive-failure-shield', name: 'Predictive Failure Shield', description: 'Monitors runtime patterns and preemptively mitigates failures 30-60 seconds before they occur using statistical anomaly detection.', archetype: 'Active', sourcePrimitives: ['oracle', 'ripple', 'vision'], usageExample: "import { FailureShield } from '@cmpsbl/runtime';\nFailureShield.arm({ sensitivity: 'high' });", minComplexity: 50 },
  { id: 'live-threat-neutralizer', name: 'Live Threat Neutralizer', description: 'Continuously scans incoming requests for injection, XSS, and CSRF patterns. Blocks threats in real-time with zero-latency response.', archetype: 'Active', sourcePrimitives: ['defense', 'reflex', 'access'], usageExample: "import { ThreatNeutralizer } from '@cmpsbl/runtime';\nThreatNeutralizer.engage({ mode: 'enforce' });", minComplexity: 50 },
  { id: 'cascade-breaker', name: 'Cascade Failure Breaker', description: 'Detects failure cascades across service boundaries and isolates affected components before propagation. Automatic recovery after stabilization.', archetype: 'Active', sourcePrimitives: ['ripple', 'nerve', 'immunity'], usageExample: "import { CascadeBreaker } from '@cmpsbl/runtime';\nCascadeBreaker.protect({ isolationLevel: 'component' });", minComplexity: 80 },
  { id: 'adaptive-load-router', name: 'Adaptive Load Router', description: 'Dynamically distributes workload across available resources based on real-time capacity metrics. Prevents bottlenecks before they form.', archetype: 'Active', sourcePrimitives: ['nexus', 'relay', 'cortex'], usageExample: "import { LoadRouter } from '@cmpsbl/runtime';\nLoadRouter.balance({ strategy: 'adaptive' });", minComplexity: 100 },
  { id: 'self-healing-state', name: 'Self-Healing State Machine', description: 'Monitors application state for corruption and automatically repairs inconsistencies using last-known-good snapshots.', archetype: 'Active', sourcePrimitives: ['memory', 'ripple', 'medic'], usageExample: "import { SelfHealingState } from '@cmpsbl/runtime';\nSelfHealingState.watch({ snapshotInterval: 5000 });", minComplexity: 80 },
  { id: 'real-time-perf-optimizer', name: 'Real-Time Performance Optimizer', description: 'Profiles execution paths at runtime and dynamically optimizes hot paths. Typical improvement: 15-40% latency reduction.', archetype: 'Active', sourcePrimitives: ['cortex', 'engineer', 'shadow'], usageExample: "import { PerfOptimizer } from '@cmpsbl/runtime';\nPerfOptimizer.profile({ autoOptimize: true });", minComplexity: 150 },
  { id: 'autonomous-patch-engine', name: 'Autonomous Patch Engine', description: 'Detects known vulnerability signatures at runtime and applies micro-patches without restart. Uses ENCODE-verified patch database.', archetype: 'Active', sourcePrimitives: ['encode', 'evolution', 'forge'], usageExample: "import { PatchEngine } from '@cmpsbl/runtime';\nPatchEngine.enable({ hotPatch: true });", minComplexity: 100 },
  { id: 'intelligent-retry-fabric', name: 'Intelligent Retry Fabric', description: 'Replaces naive retry loops with context-aware retry strategies. Backs off intelligently, switches fallback paths, and learns from failure patterns.', archetype: 'Active', sourcePrimitives: ['reflex', 'relay', 'brain'], usageExample: "import { RetryFabric } from '@cmpsbl/runtime';\nRetryFabric.wrap(fetchData, { maxAttempts: 5 });", minComplexity: 50 },
  { id: 'anomaly-response-agent', name: 'Anomaly Response Agent', description: 'Autonomous agent that detects statistical anomalies in system behavior and executes pre-configured response playbooks.', archetype: 'Active', sourcePrimitives: ['defense', 'oracle', 'reflex'], usageExample: "import { AnomalyAgent } from '@cmpsbl/runtime';\nAnomalyAgent.deploy({ playbook: 'standard' });", minComplexity: 100 },

  // ═══ PASSIVE capabilities — observational, non-intervening ═══
  { id: 'device-fingerprint-layer', name: 'Device Fingerprint Layer', description: 'Generates unique device fingerprints from browser/OS signals for fraud detection and session binding. Zero user-visible impact.', archetype: 'Passive', sourcePrimitives: ['defense', 'identity', 'phantom'], usageExample: "import { DeviceFingerprint } from '@cmpsbl/runtime';\nconst fp = DeviceFingerprint.generate();", minComplexity: 0 },
  { id: 'telemetry-mesh', name: 'Telemetry Mesh', description: 'Structured health signal collector compatible with Datadog, Grafana, Prometheus. Near-zero overhead continuous monitoring.', archetype: 'Passive', sourcePrimitives: ['vision', 'relay', 'nerve'], usageExample: "import { TelemetryMesh } from '@cmpsbl/runtime';\nTelemetryMesh.emit('operation.complete', { ms: 42 });", minComplexity: 0 },
  { id: 'behavioral-audit-trail', name: 'Behavioral Audit Trail', description: 'Records every significant state transition with timestamps, actor IDs, and causal chains. FNV-1a hash-sealed for tamper evidence.', archetype: 'Passive', sourcePrimitives: ['governance', 'treaty', 'echo'], usageExample: "import { AuditTrail } from '@cmpsbl/runtime';\nAuditTrail.record('user.action', { userId, action });", minComplexity: 50 },
  { id: 'dependency-graph-monitor', name: 'Dependency Graph Monitor', description: 'Visualizes and tracks your dependency tree in real-time. Alerts on version drift, known CVEs, and license conflicts.', archetype: 'Passive', sourcePrimitives: ['engineer', 'immunity', 'atlas'], usageExample: "import { DepGraph } from '@cmpsbl/runtime';\nconst graph = DepGraph.analyze();", minComplexity: 80 },
  { id: 'structural-drift-detector', name: 'Structural Drift Detector', description: 'Compares current architecture against the original blueprint and flags deviations. Prevents architectural erosion over time.', archetype: 'Passive', sourcePrimitives: ['forge', 'shadow', 'compass'], usageExample: "import { DriftDetector } from '@cmpsbl/runtime';\nDriftDetector.compare({ baseline: 'v1.0' });", minComplexity: 100 },
  { id: 'cognitive-load-profiler', name: 'Cognitive Load Profiler', description: 'Measures code complexity per module and identifies areas where developer cognitive load exceeds maintainability thresholds.', archetype: 'Passive', sourcePrimitives: ['brain', 'vision', 'conscience'], usageExample: "import { CognitiveProfiler } from '@cmpsbl/runtime';\nCognitiveProfiler.assess('./src');", minComplexity: 100 },
  { id: 'silent-regression-scanner', name: 'Silent Regression Scanner', description: 'Background scanner that detects behavioral regressions by comparing output signatures against historical baselines.', archetype: 'Passive', sourcePrimitives: ['shadow', 'sandbox', 'echo'], usageExample: "import { RegressionScanner } from '@cmpsbl/runtime';\nRegressionScanner.baseline('v2.0');", minComplexity: 80 },
  { id: 'api-contract-validator', name: 'API Contract Validator', description: 'Continuously validates API responses against defined schemas. Catches contract violations before they reach consumers.', archetype: 'Passive', sourcePrimitives: ['treaty', 'sovereign', 'encode'], usageExample: "import { ContractValidator } from '@cmpsbl/runtime';\nContractValidator.enforce(schema);", minComplexity: 50 },
  { id: 'dead-code-cartographer', name: 'Dead Code Cartographer', description: 'Maps unreachable code paths, unused exports, and orphaned modules. Generates pruning recommendations with safety scores.', archetype: 'Passive', sourcePrimitives: ['harvest', 'vision', 'engineer'], usageExample: "import { DeadCodeMap } from '@cmpsbl/runtime';\nconst report = DeadCodeMap.scan('./src');", minComplexity: 100 },
  { id: 'permission-boundary-map', name: 'Permission Boundary Map', description: 'Visualizes all access control boundaries in your application. Identifies over-privileged paths and shadow admin vectors.', archetype: 'Passive', sourcePrimitives: ['governance', 'defense', 'sovereign'], usageExample: "import { PermissionMap } from '@cmpsbl/runtime';\nPermissionMap.visualize();", minComplexity: 80 },

  // ═══ HYBRID capabilities — observe + intervene when needed ═══
  { id: 'policy-enforcement-layer', name: 'Policy Enforcement Layer', description: 'Configurable rules engine that observes operations and enforces compliance boundaries. Passive monitoring until violations trigger active blocking.', archetype: 'Hybrid', sourcePrimitives: ['governance', 'sovereign', 'treaty'], usageExample: "import { PolicyLayer } from '@cmpsbl/runtime';\nPolicyLayer.define({ maxConcurrency: 100 });", minComplexity: 50 },
  { id: 'circuit-breaker-mesh', name: 'Circuit Breaker Mesh', description: 'Monitors service call patterns (passive) and trips breakers when failure rates exceed thresholds (active). Configurable per-endpoint.', archetype: 'Hybrid', sourcePrimitives: ['ripple', 'relay', 'nerve'], usageExample: "import { CircuitMesh } from '@cmpsbl/runtime';\nCircuitMesh.protect(apiClient, { threshold: 0.5 });", minComplexity: 50 },
  { id: 'smart-cache-orchestrator', name: 'Smart Cache Orchestrator', description: 'Observes access patterns and dynamically manages cache layers. Evicts proactively before TTL based on usage prediction.', archetype: 'Hybrid', sourcePrimitives: ['memory', 'cortex', 'harvest'], usageExample: "import { SmartCache } from '@cmpsbl/runtime';\nSmartCache.layer({ strategy: 'predictive' });", minComplexity: 80 },
  { id: 'canary-deployment-gate', name: 'Canary Deployment Gate', description: 'Routes a configurable percentage of traffic to new code paths. Monitors for anomalies and auto-rolls back if thresholds are breached.', archetype: 'Hybrid', sourcePrimitives: ['shadow', 'sandbox', 'forge'], usageExample: "import { CanaryGate } from '@cmpsbl/runtime';\nCanaryGate.deploy({ trafficPercent: 5 });", minComplexity: 100 },
  { id: 'rate-limit-intelligence', name: 'Rate Limit Intelligence', description: 'Learns normal traffic patterns (passive) and dynamically adjusts rate limits per client/endpoint (active). Prevents abuse while preserving legitimate spikes.', archetype: 'Hybrid', sourcePrimitives: ['defense', 'brain', 'cortex'], usageExample: "import { RateLimiter } from '@cmpsbl/runtime';\nRateLimiter.adaptive({ learning: true });", minComplexity: 50 },
  { id: 'zero-downtime-migrator', name: 'Zero-Downtime Migrator', description: 'Observes data access patterns during migration, dual-writes to old and new schemas, and seamlessly cuts over when parity is confirmed.', archetype: 'Hybrid', sourcePrimitives: ['evolution', 'memory', 'forge'], usageExample: "import { Migrator } from '@cmpsbl/runtime';\nMigrator.dualWrite({ source: oldDb, target: newDb });", minComplexity: 100 },
  { id: 'intent-disambiguation-engine', name: 'Intent Disambiguation Engine', description: 'Observes ambiguous user inputs and actively resolves intent through contextual analysis and confidence scoring.', archetype: 'Hybrid', sourcePrimitives: ['decode', 'lingua', 'cortex'], usageExample: "import { IntentEngine } from '@cmpsbl/runtime';\nconst intent = IntentEngine.resolve(userInput);", minComplexity: 50 },
  { id: 'sandbox-escalation-guard', name: 'Sandbox Escalation Guard', description: 'Runs untrusted operations in sandboxed contexts (passive isolation) and actively terminates processes that attempt privilege escalation.', archetype: 'Hybrid', sourcePrimitives: ['sandbox', 'defense', 'access'], usageExample: "import { SandboxGuard } from '@cmpsbl/runtime';\nSandboxGuard.execute(untrustedFn);", minComplexity: 50 },
  { id: 'version-reconciliation', name: 'Version Reconciliation Engine', description: 'Tracks multiple concurrent versions of data structures. Automatically merges compatible changes and flags conflicts for review.', archetype: 'Hybrid', sourcePrimitives: ['memory', 'treaty', 'evolution'], usageExample: "import { VersionReconciler } from '@cmpsbl/runtime';\nVersionReconciler.merge(v1, v2);", minComplexity: 80 },
  { id: 'phantom-load-tester', name: 'Phantom Load Tester', description: 'Generates synthetic traffic that mirrors real user patterns. Passively collects baseline metrics, then actively stress-tests under configurable scenarios.', archetype: 'Hybrid', sourcePrimitives: ['phantom', 'sandbox', 'echo'], usageExample: "import { PhantomTest } from '@cmpsbl/runtime';\nPhantomTest.run({ concurrency: 1000 });", minComplexity: 100 },

  // ═══ CYBERSECURITY VERTICAL — Security-specific capabilities ═══
  { id: 'real-time-ioc-correlator', name: 'Real-Time IOC Correlator', description: 'Ingests threat intelligence feeds and correlates Indicators of Compromise across telemetry streams in real-time. Maps findings to MITRE ATT&CK techniques.', archetype: 'Active', sourcePrimitives: ['defense', 'audit', 'identity'], usageExample: "import { IOCCorrelator } from '@cmpsbl/cyber';\nIOCCorrelator.ingest(feed, { mitre: true });", minComplexity: 50 },
  { id: 'zero-trust-perimeter', name: 'Zero-Trust Perimeter Enforcer', description: 'Enforces micro-segmentation and least-privilege access across every service boundary. Continuous identity verification with trust scoring.', archetype: 'Active', sourcePrimitives: ['bastion', 'identity', 'governance'], usageExample: "import { ZeroTrust } from '@cmpsbl/cyber';\nZeroTrust.enforce({ segment: 'api', trustThreshold: 0.9 });", minComplexity: 50 },
  { id: 'adaptive-ddos-shield', name: 'Adaptive DDoS Shield', description: 'Multi-layer DDoS mitigation with adaptive rate limiting, geo-blocking, bot detection, and challenge-response protocols. Scales with attack volume.', archetype: 'Active', sourcePrimitives: ['aegis', 'defense', 'reflex'], usageExample: "import { DDoSShield } from '@cmpsbl/cyber';\nDDoSShield.arm({ geoBlock: ['CN', 'RU'], rateLimit: 1000 });", minComplexity: 30 },
  { id: 'cryptographic-agility-layer', name: 'Cryptographic Agility Layer', description: 'Manages key rotation, certificate lifecycle, and encryption protocol enforcement. Includes quantum-resistant algorithm preparation.', archetype: 'Hybrid', sourcePrimitives: ['cipher', 'evolution', 'sovereign'], usageExample: "import { CryptoAgility } from '@cmpsbl/cyber';\nCryptoAgility.rotateKeys({ algorithm: 'AES-256-GCM' });", minComplexity: 50 },
  { id: 'attack-surface-scanner', name: 'Attack Surface Scanner', description: 'Automated reconnaissance mapping exposed services, open ports, vulnerable endpoints, and misconfigured assets. Continuous exposure scoring.', archetype: 'Active', sourcePrimitives: ['recon', 'engineer', 'vision'], usageExample: "import { SurfaceScanner } from '@cmpsbl/cyber';\nconst report = SurfaceScanner.map({ depth: 'deep' });", minComplexity: 30 },
  { id: 'forensic-incident-response', name: 'Forensic Incident Response', description: 'Automates incident containment, evidence preservation, forensic timeline reconstruction, and root cause analysis. Executes playbooks autonomously.', archetype: 'Active', sourcePrimitives: ['vanguard', 'tracer', 'memory'], usageExample: "import { ForensicIR } from '@cmpsbl/cyber';\nForensicIR.contain({ incidentId, preserveEvidence: true });", minComplexity: 80 },
  { id: 'chaos-pen-test-engine', name: 'Chaos Pen Test Engine', description: 'Automated penetration testing via chaos injection, adversarial simulation, blast radius analysis, and red team automation. Validates resilience postures.', archetype: 'Active', sourcePrimitives: ['tempest', 'shadow', 'sandbox'], usageExample: "import { ChaosPenTest } from '@cmpsbl/cyber';\nChaosPenTest.run({ scenario: 'ransomware', blastRadius: true });", minComplexity: 100 },
  { id: 'apt-threat-hunter', name: 'APT Threat Hunter', description: 'Autonomous advanced persistent threat detection. Operates silently across network segments with behavioral profiling and persistence detection.', archetype: 'Active', sourcePrimitives: ['phantom', 'shadow', 'defense'], usageExample: "import { APTHunter } from '@cmpsbl/cyber';\nAPTHunter.deploy({ stealth: true, segments: ['dmz', 'internal'] });", minComplexity: 80 },
  { id: 'deception-grid', name: 'Deception Grid Orchestrator', description: 'Deploys and manages honeypots, canary tokens, and decoy infrastructure. Profiles attackers through interaction analysis and lure patterns.', archetype: 'Hybrid', sourcePrimitives: ['specter', 'phantom', 'nerve'], usageExample: "import { DeceptionGrid } from '@cmpsbl/cyber';\nDeceptionGrid.deploy({ honeypots: 12, canaryTokens: true });", minComplexity: 50 },
  { id: 'emergency-breach-containment', name: 'Emergency Breach Containment', description: 'Kill-switch protocols for active breaches — connection severing, quarantine enforcement, and automated isolation of compromised segments.', archetype: 'Active', sourcePrimitives: ['blackout', 'ripple', 'defense'], usageExample: "import { BreachContain } from '@cmpsbl/cyber';\nBreachContain.killSwitch({ segment: 'compromised-zone' });", minComplexity: 30 },
  { id: 'attack-chain-reconstructor', name: 'Attack Chain Reconstructor', description: 'Traces lateral movement paths, reconstructs full attack timelines, detects privilege escalation, and identifies credential abuse chains.', archetype: 'Passive', sourcePrimitives: ['tracer', 'audit', 'memory'], usageExample: "import { AttackChain } from '@cmpsbl/cyber';\nconst timeline = AttackChain.reconstruct({ incidentId });", minComplexity: 80 },
  { id: 'dark-web-intelligence', name: 'Dark Web Intelligence Monitor', description: 'Monitors underground forums, paste sites, and threat actor communications. Detects credential leaks, brand abuse, and emerging threat campaigns.', archetype: 'Passive', sourcePrimitives: ['nocturne', 'harvest', 'defense'], usageExample: "import { DarkWebIntel } from '@cmpsbl/cyber';\nDarkWebIntel.monitor({ brand: 'acme', alertThreshold: 'high' });", minComplexity: 50 },
  { id: 'compliance-continuous-validator', name: 'Compliance Continuous Validator', description: 'Continuously validates security postures against SOC2, ISO 27001, NIST, and CIS benchmarks. Generates gap analysis and remediation priorities.', archetype: 'Hybrid', sourcePrimitives: ['ironclad', 'governance', 'treaty'], usageExample: "import { ComplianceValidator } from '@cmpsbl/cyber';\nconst report = ComplianceValidator.audit({ frameworks: ['SOC2', 'NIST'] });", minComplexity: 50 },
  { id: 'supply-chain-integrity', name: 'Supply Chain Integrity Monitor', description: 'Audits dependencies, generates SBOMs, detects compromised packages, typosquatting, and validates software provenance chains.', archetype: 'Hybrid', sourcePrimitives: ['bulwark', 'immunity', 'engineer'], usageExample: "import { SupplyChainMonitor } from '@cmpsbl/cyber';\nconst sbom = SupplyChainMonitor.audit({ depth: 'transitive' });", minComplexity: 30 },

  // ═══ QUANTUM VERTICAL — Quantum physics-specific capabilities ═══
  { id: 'quantum-circuit-optimizer', name: 'Quantum Circuit Optimizer', description: 'Transpiles and optimizes quantum gate sequences for target hardware. Reduces gate depth, minimizes CNOT count, and applies noise-aware routing.', archetype: 'Active', sourcePrimitives: ['qubit', 'entangle', 'brain'], usageExample: "import { CircuitOptimizer } from '@cmpsbl/quantum';\nCircuitOptimizer.transpile({ backend: 'ibm_eagle', optimization: 3 });", minComplexity: 50 },
  { id: 'particle-collision-analyzer', name: 'Particle Collision Analyzer', description: 'Reconstructs collision events from detector data, clusters jets, identifies decay products, and computes invariant mass distributions.', archetype: 'Active', sourcePrimitives: ['hadron', 'muon', 'meson'], usageExample: "import { CollisionAnalyzer } from '@cmpsbl/quantum';\nconst events = CollisionAnalyzer.reconstruct({ cms_energy: 13000 });", minComplexity: 80 },
  { id: 'entanglement-verifier', name: 'Entanglement Verification Protocol', description: 'Performs Bell inequality tests, computes concurrence and entanglement entropy, and certifies quantum correlations for QKD channels.', archetype: 'Hybrid', sourcePrimitives: ['entangle', 'photon', 'oracle'], usageExample: "import { EntanglementVerifier } from '@cmpsbl/quantum';\nconst result = EntanglementVerifier.bellTest({ pairs: 1000 });", minComplexity: 50 },
  { id: 'wavefunction-solver', name: 'Wavefunction Evolution Solver', description: 'Numerically solves time-dependent Schrödinger and Dirac equations for multi-particle systems using split-operator and Crank-Nicolson methods.', archetype: 'Active', sourcePrimitives: ['fermion', 'lattice', 'brain'], usageExample: "import { WaveSolver } from '@cmpsbl/quantum';\nWaveSolver.evolve({ potential: V, dt: 1e-15 });", minComplexity: 100 },
  { id: 'spectral-line-identifier', name: 'Spectral Line Identifier', description: 'Matches emission and absorption spectra against atomic databases, identifies elements, and computes Doppler shifts for redshift analysis.', archetype: 'Passive', sourcePrimitives: ['prism', 'photon', 'vision'], usageExample: "import { SpectralID } from '@cmpsbl/quantum';\nconst elements = SpectralID.match(spectrum, { db: 'NIST' });", minComplexity: 30 },
  { id: 'fusion-reactor-modeler', name: 'Fusion Reactor Modeler', description: 'Simulates tokamak plasma confinement, computes Lawson criterion parameters, models instabilities, and optimizes magnetic field configurations.', archetype: 'Active', sourcePrimitives: ['plasma', 'cryogen', 'engineer'], usageExample: "import { FusionModeler } from '@cmpsbl/quantum';\nFusionModeler.simulate({ geometry: 'toroidal', B_field: 5.3 });", minComplexity: 100 },
  { id: 'quantum-error-correction', name: 'Quantum Error Correction Engine', description: 'Implements surface codes, Steane codes, and Shor codes. Monitors syndrome measurements and applies real-time correction cycles.', archetype: 'Active', sourcePrimitives: ['qubit', 'ripple', 'defense'], usageExample: "import { QEC } from '@cmpsbl/quantum';\nQEC.protect({ code: 'surface', distance: 3 });", minComplexity: 80 },
  { id: 'qcd-color-simulator', name: 'QCD Color Charge Simulator', description: 'Lattice QCD Monte Carlo simulation for gluon exchange, asymptotic freedom verification, and hadron mass computation from first principles.', archetype: 'Active', sourcePrimitives: ['gluon', 'meson', 'hadron'], usageExample: "import { QCDSim } from '@cmpsbl/quantum';\nconst mass = QCDSim.lattice({ quarks: ['u', 'd'], beta: 6.0 });", minComplexity: 100 },
  { id: 'gravitational-wave-matcher', name: 'Gravitational Wave Template Matcher', description: 'Generates and cross-correlates binary merger waveform templates against detector strain data for LIGO/Virgo signal identification.', archetype: 'Hybrid', sourcePrimitives: ['graviton', 'oracle', 'memory'], usageExample: "import { GWMatcher } from '@cmpsbl/quantum';\nconst match = GWMatcher.correlate(strainData, { snrThreshold: 8 });", minComplexity: 80 },
  { id: 'neutrino-oscillation-predictor', name: 'Neutrino Oscillation Predictor', description: 'Computes PMNS matrix parameters, predicts flavor transition probabilities over baseline distances, and models MSW matter effects.', archetype: 'Passive', sourcePrimitives: ['neutrino', 'boson', 'oracle'], usageExample: "import { NeutrinoOsc } from '@cmpsbl/quantum';\nconst prob = NeutrinoOsc.predict({ flavor: 'mu', baseline_km: 295 });", minComplexity: 50 },
  { id: 'cryogenic-decoherence-shield', name: 'Cryogenic Decoherence Shield', description: 'Models T1/T2 relaxation times, thermal photon flux, and Johnson-Nyquist noise to optimize dilution refrigerator staging for qubit coherence.', archetype: 'Hybrid', sourcePrimitives: ['cryogen', 'qubit', 'defense'], usageExample: "import { DecoherenceShield } from '@cmpsbl/quantum';\nDecoherenceShield.optimize({ stages: 4, base_temp_mK: 15 });", minComplexity: 50 },
  { id: 'tachyonic-causality-analyzer', name: 'Tachyonic Causality Analyzer', description: 'Explores Lorentz invariance violation bounds, models closed timelike curves, and evaluates tachyonic field condensation in theoretical frameworks.', archetype: 'Passive', sourcePrimitives: ['tachyon', 'graviton', 'conscience'], usageExample: "import { CausalityAnalyzer } from '@cmpsbl/quantum';\nCausalityAnalyzer.evaluate({ violation_bound: 1e-23 });", minComplexity: 80 },
  { id: 'band-structure-calculator', name: 'Band Structure Calculator', description: 'Computes electronic band structures using tight-binding and DFT methods. Maps Brillouin zones, identifies Dirac cones, and predicts topological properties.', archetype: 'Passive', sourcePrimitives: ['lattice', 'fermion', 'engineer'], usageExample: "import { BandCalc } from '@cmpsbl/quantum';\nconst bands = BandCalc.compute({ material: 'graphene', method: 'tb' });", minComplexity: 80 },
  { id: 'quantum-teleportation-protocol', name: 'Quantum Teleportation Protocol', description: 'End-to-end quantum state transfer using EPR pairs, Bell measurements, and classical communication channels. Includes fidelity verification.', archetype: 'Active', sourcePrimitives: ['entangle', 'photon', 'relay'], usageExample: "import { QTeleport } from '@cmpsbl/quantum';\nconst fidelity = QTeleport.transfer(qubitState, { channel: eprPair });", minComplexity: 50 },

  // ═══ AGENCY VERTICAL — Autonomous agent-specific capabilities ═══
  { id: 'mission-decomposer', name: 'Mission Decomposer', description: 'Breaks complex user objectives into executable sub-tasks with dependency graphs, priority scoring, and deadline-aware scheduling. Handles re-planning on failure.', archetype: 'Active', sourcePrimitives: ['mandate', 'reason', 'brain'], usageExample: "import { MissionDecomposer } from '@cmpsbl/agency';\nconst plan = MissionDecomposer.plan({ objective, deadline });", minComplexity: 50 },
  { id: 'skill-router', name: 'Skill-Based Task Router', description: 'Matches tasks to agents based on competency matrices, current workload, and historical success rates. Detects bottlenecks and re-routes in real-time.', archetype: 'Active', sourcePrimitives: ['delegate', 'operator', 'cortex'], usageExample: "import { SkillRouter } from '@cmpsbl/agency';\nSkillRouter.assign(task, { strategy: 'competency' });", minComplexity: 50 },
  { id: 'deep-research-synthesizer', name: 'Deep Research Synthesizer', description: 'Crawls, aggregates, and synthesizes multi-source research with citation tracking, source credibility scoring, and competitive intelligence extraction.', archetype: 'Active', sourcePrimitives: ['reconn', 'scholar', 'harvest'], usageExample: "import { ResearchSynth } from '@cmpsbl/agency';\nconst report = ResearchSynth.research({ topic, depth: 'deep' });", minComplexity: 30 },
  { id: 'inter-agent-protocol', name: 'Inter-Agent Communication Protocol', description: 'Structured message passing between agents with priority channels, knowledge broadcast, and conflict-free shared memory access.', archetype: 'Active', sourcePrimitives: ['uplink', 'liaison', 'relay'], usageExample: "import { AgentComms } from '@cmpsbl/agency';\nAgentComms.broadcast({ channel: 'research', payload });", minComplexity: 30 },
  { id: 'content-generation-engine', name: 'Content Generation Engine', description: 'Structured content drafting with style adherence, audience targeting, format templating, and iterative revision loops.', archetype: 'Active', sourcePrimitives: ['scribe', 'lingua', 'encode'], usageExample: "import { ContentGen } from '@cmpsbl/agency';\nconst draft = ContentGen.write({ brief, style: 'technical' });", minComplexity: 30 },
  { id: 'reinforcement-loop', name: 'Reinforcement Learning Loop', description: 'Tracks agent performance, applies reward signals, adjusts skill weights, and drives continuous improvement via competency scoring.', archetype: 'Hybrid', sourcePrimitives: ['incentive', 'scholar', 'memory'], usageExample: "import { ReinforcementLoop } from '@cmpsbl/agency';\nReinforcementLoop.reward(agentId, { taskScore: 0.92 });", minComplexity: 50 },
  { id: 'chain-of-thought-reasoner', name: 'Chain-of-Thought Reasoner', description: 'Structured multi-step reasoning with evidence tracking, confidence scoring, and transparent decision audit trails for agent actions.', archetype: 'Active', sourcePrimitives: ['reason', 'brain', 'conscience'], usageExample: "import { CoTReasoner } from '@cmpsbl/agency';\nconst decision = CoTReasoner.reason({ problem, evidence });", minComplexity: 50 },
  { id: 'tool-orchestrator', name: 'Tool Use Orchestrator', description: 'Manages API integrations, plugin lifecycle, and tool selection strategies. Agents discover, authenticate, and invoke tools autonomously.', archetype: 'Active', sourcePrimitives: ['toolkit', 'nexus', 'access'], usageExample: "import { ToolOrch } from '@cmpsbl/agency';\nToolOrch.invoke('github', { action: 'create_pr', params });", minComplexity: 50 },
  { id: 'agent-self-healer', name: 'Agent Self-Healing System', description: 'Monitors agent health, detects degradation, triggers graceful fallback, and autonomously restarts failed agents with state recovery.', archetype: 'Hybrid', sourcePrimitives: ['overseer', 'medic', 'ripple'], usageExample: "import { AgentHealer } from '@cmpsbl/agency';\nAgentHealer.monitor({ agents: fleet, checkInterval: 5000 });", minComplexity: 50 },
  { id: 'team-conflict-resolver', name: 'Team Conflict Resolver', description: 'Detects competing objectives, resource contention, and priority conflicts between agents. Applies negotiation protocols and consensus building.', archetype: 'Hybrid', sourcePrimitives: ['liaison', 'warden', 'treaty'], usageExample: "import { ConflictResolver } from '@cmpsbl/agency';\nConflictResolver.mediate({ agents: [a1, a2], conflict });", minComplexity: 30 },
  { id: 'progress-reporter', name: 'Progress Reporter', description: 'User-facing real-time status updates with milestone tracking, ETA prediction, and human-readable summaries of agent activity.', archetype: 'Passive', sourcePrimitives: ['envoy', 'vision', 'nerve'], usageExample: "import { ProgressReporter } from '@cmpsbl/agency';\nProgressReporter.update({ missionId, status: 'in_progress' });", minComplexity: 0 },
  { id: 'safety-boundary-enforcer', name: 'Safety Boundary Enforcer', description: 'Enforces governance policies, resource limits, and ethical constraints on agent actions. Prevents unbounded autonomy and policy violations.', archetype: 'Active', sourcePrimitives: ['warden', 'governance', 'sovereign'], usageExample: "import { SafetyEnforcer } from '@cmpsbl/agency';\nSafetyEnforcer.check(action, { policy: 'production' });", minComplexity: 30 },
  { id: 'creative-problem-solver', name: 'Creative Problem Solver', description: 'Generates unconventional approaches when standard strategies fail. Applies lateral thinking, analogical reasoning, and constraint relaxation.', archetype: 'Active', sourcePrimitives: ['rogue', 'reason', 'dream'], usageExample: "import { CreativeSolver } from '@cmpsbl/agency';\nconst approach = CreativeSolver.diverge({ problem, constraints });", minComplexity: 50 },
  { id: 'context-persistence-layer', name: 'Context Persistence Layer', description: 'Maintains agent context across sessions with long-term memory, conversation threading, and knowledge graph integration for continuity.', archetype: 'Passive', sourcePrimitives: ['anchor', 'memory', 'echo'], usageExample: "import { ContextLayer } from '@cmpsbl/agency';\nContextLayer.persist({ sessionId, context, ttl: '30d' });", minComplexity: 30 },
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

  // All verticals now route through the Universal Pool Scanner (v21)
  // for consistent IDF-weighted scoring, structural analysis, confidence
  // banding, and dynamic slot selection. The pool contains primitives
  // from every vertical — each vertical's expansion primitives surface
  // naturally when the code matches their domain signals.
  const recommendations = buildUltimateRecommendations(codeSnippet);

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
    findings.push({ id: `enc-${ts}-6`, severity: 'warning', title: 'Unvalidated request input', description: 'Request parameters accessed without validation. Risk of injection and malformed data processing.', source: 'ENCODE', primitiveRecommendation: 'ACCESS' });
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
  primitive: Omit<PrimitiveRecommendation, 'impactScore' | 'rationale'>,
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
    access: { signals: [hasHttp, hasAuth], rationale: 'Continuous validation and guard enforcement at system boundaries' },
    atlas: { signals: [len > 300, code.includes('import')], rationale: 'System-wide mapping and navigation for complex codebases' },
    // CyberSecurity vertical primitives
    watchtower: { signals: [hasHttp, hasAuth], rationale: 'Real-time threat detection and classification with behavioral telemetry fusion' },
    shade: { signals: [hasHttp, code.includes('stealth') || code.includes('covert')], rationale: 'Stealth operations and covert reconnaissance with exfiltration detection' },
    aegis: { signals: [hasHttp, code.includes('rate') || code.includes('limit')], rationale: 'Traffic-facing code needs adaptive DDoS shielding and bot detection' },
    cipher: { signals: [code.includes('encrypt') || code.includes('hash') || code.includes('key'), hasAuth], rationale: 'Cryptographic operations require managed key lifecycle and rotation' },
    recon: { signals: [hasHttp, code.includes('port') || code.includes('scan')], rationale: 'Network exposure requires continuous attack surface reconnaissance' },
    vanguard: { signals: [code.includes('incident') || code.includes('error'), hasAsync], rationale: 'Incident response automation with forensic evidence preservation' },
    bastion: { signals: [hasAuth, code.includes('trust') || code.includes('verify')], rationale: 'Zero-trust enforcement with micro-segmentation and continuous verification' },
    tempest: { signals: [code.includes('test') || code.includes('sandbox'), hasAsync], rationale: 'Chaos engineering validates resilience against adversarial scenarios' },
    specter: { signals: [hasHttp, code.includes('trap') || code.includes('decoy')], rationale: 'Deception infrastructure lures attackers into observable honeypots' },
    blackout: { signals: [code.includes('kill') || code.includes('shutdown'), hasHttp], rationale: 'Emergency kill-switch protocols for active breach containment' },
    tracer: { signals: [hasAuth, code.includes('trace') || code.includes('chain')], rationale: 'Attack chain reconstruction traces lateral movement and credential abuse' },
    nocturne: { signals: [hasHttp, code.includes('monitor') || code.includes('intel')], rationale: 'Dark web intelligence monitors credential leaks and threat actor activity' },
    ironclad: { signals: [code.includes('compliance') || code.includes('audit'), hasAuth], rationale: 'Continuous compliance validation against SOC2, NIST, and ISO 27001' },
    citadel: { signals: [code.includes('import') || code.includes('require'), code.includes('package')], rationale: 'Supply chain auditing detects compromised packages and typosquatting' },
    // Robotics vertical primitives — Engines
    fabricator: { signals: [code.includes('build') || code.includes('manufacture') || code.includes('cad'), hasAsync], rationale: 'Hardware fabrication and component lifecycle with CAD-to-part pipelines and predictive maintenance' },
    servo: { signals: [code.includes('motor') || code.includes('actuator') || code.includes('pid'), hasAsync], rationale: 'Motor control and actuator orchestration with PID tuning and torque profiling' },
    kinetic: { signals: [code.includes('trajectory') || code.includes('motion') || code.includes('velocity'), len > 200], rationale: 'Motion planning and trajectory optimization for multi-axis coordination' },
    lidar: { signals: [code.includes('sensor') || code.includes('point') || code.includes('scan'), hasAsync], rationale: 'Spatial perception and 3D point cloud mapping for environment modeling' },
    flux: { signals: [code.includes('power') || code.includes('battery') || code.includes('energy'), hasState], rationale: 'Power management and energy distribution across robotic subsystems' },
    vector: { signals: [code.includes('path') || code.includes('navigate') || code.includes('position'), hasAsync], rationale: 'Navigation, pathfinding, and localization with SLAM integration' },
    tensor: { signals: [code.includes('sensor') || code.includes('signal') || code.includes('fusion'), len > 300], rationale: 'Sensor fusion and multi-modal signal processing for situational awareness' },
    caliber: { signals: [code.includes('calibrat') || code.includes('precision') || code.includes('tolerance'), hasState], rationale: 'Precision calibration and tolerance enforcement for repeatable operations' },
    // Robotics vertical primitives — Agents
    gripper: { signals: [code.includes('grip') || code.includes('grasp') || code.includes('manipulat'), hasAsync], rationale: 'Manipulation and dexterous object handling with adaptive grasp planning' },
    swarm: { signals: [code.includes('fleet') || code.includes('multi') || code.includes('coordinat'), len > 300], rationale: 'Multi-robot coordination and fleet management with consensus protocols' },
    environ: { signals: [code.includes('environment') || code.includes('scene') || code.includes('obstacle'), hasState], rationale: 'Environmental awareness and scene understanding for safe operation' },
    marshal: { signals: [code.includes('safety') || code.includes('collision') || code.includes('emergency'), hasAsync], rationale: 'Safety monitoring and collision avoidance with emergency stop protocols' },
    dispatch: { signals: [hasAsync, code.includes('task') || code.includes('sequence') || code.includes('workflow')], rationale: 'Task sequencing and workflow automation for multi-step robotic operations' },
    welder: { signals: [code.includes('weld') || code.includes('assemble') || code.includes('join'), hasAsync], rationale: 'Assembly operations and joining processes with seam tracking' },
    inspector: { signals: [code.includes('inspect') || code.includes('defect') || code.includes('quality'), hasState], rationale: 'Quality inspection and defect detection with machine vision classification' },
    pioneer: { signals: [code.includes('explor') || code.includes('frontier') || code.includes('unknown'), hasAsync], rationale: 'Autonomous exploration and frontier mapping in unknown environments' },
    // Quantum vertical primitives — Engines
    hadron: { signals: [code.includes('particle') || code.includes('collision') || code.includes('scatter'), len > 200], rationale: 'Particle collision simulation and cross-section computation for high-energy physics' },
    qubit: { signals: [code.includes('qubit') || code.includes('gate') || code.includes('circuit'), hasAsync], rationale: 'Quantum gate orchestration and circuit transpilation for quantum algorithms' },
    photon: { signals: [code.includes('photon') || code.includes('optic') || code.includes('laser') || code.includes('interferom'), hasAsync], rationale: 'Optical computing and photonic signal processing with interferometry modeling' },
    fermion: { signals: [code.includes('wavefunction') || code.includes('schrodinger') || code.includes('hamiltonian') || code.includes('eigenvalue'), len > 200], rationale: 'Many-body quantum state evolution with Schrödinger equation solvers' },
    entangle: { signals: [code.includes('entangle') || code.includes('bell') || code.includes('teleport') || code.includes('epr'), hasAsync], rationale: 'Quantum entanglement management and Bell state preparation for quantum communication' },
    lattice: { signals: [code.includes('lattice') || code.includes('crystal') || code.includes('phonon') || code.includes('band'), hasState], rationale: 'Crystal structure simulation and phonon modeling for condensed matter physics' },
    plasma: { signals: [code.includes('plasma') || code.includes('tokamak') || code.includes('fusion') || code.includes('mhd'), hasAsync], rationale: 'Plasma dynamics and magneto-hydrodynamics for fusion reactor modeling' },
    cryogen: { signals: [code.includes('cryogen') || code.includes('dilution') || code.includes('thermal') || code.includes('decoher'), hasState], rationale: 'Cryogenic system modeling and thermal noise reduction for quantum hardware' },
    // Quantum vertical primitives — Agents
    muon: { signals: [code.includes('muon') || code.includes('decay') || code.includes('lepton'), len > 100], rationale: 'Decay chain analysis and lepton tracking for particle detector data' },
    boson: { signals: [code.includes('boson') || code.includes('higgs') || code.includes('gauge') || code.includes('electroweak'), len > 200], rationale: 'Force carrier simulation and gauge field mapping for the Standard Model' },
    neutrino: { signals: [code.includes('neutrino') || code.includes('oscillat') || code.includes('weak') || code.includes('flavor'), hasAsync], rationale: 'Weak interaction modeling and neutrino flavor oscillation prediction' },
    gluon: { signals: [code.includes('gluon') || code.includes('qcd') || code.includes('quark') || code.includes('color charge'), len > 200], rationale: 'Strong force coupling and QCD color charge simulation' },
    graviton: { signals: [code.includes('graviton') || code.includes('gravity') || code.includes('spacetime') || code.includes('relativi'), hasAsync], rationale: 'Gravitational wave detection and spacetime curvature modeling' },
    tachyon: { signals: [code.includes('tachyon') || code.includes('superluminal') || code.includes('lorentz') || code.includes('causal'), hasAsync], rationale: 'Superluminal signal modeling and causality analysis in relativistic frameworks' },
    meson: { signals: [code.includes('meson') || code.includes('hadron') || code.includes('quark') || code.includes('fragmentation'), len > 200], rationale: 'Quark confinement and hadronization processes for jet formation modeling' },
    prism: { signals: [code.includes('spectro') || code.includes('wavelength') || code.includes('emission') || code.includes('raman'), hasState], rationale: 'Spectroscopy analysis and wavelength decomposition for atomic line identification' },
    // Agency vertical primitives — Engines
    mandate: { signals: [code.includes('task') || code.includes('mission') || code.includes('objective'), hasAsync], rationale: 'Mission decomposition and autonomous task planning with dependency graphs' },
    delegate: { signals: [code.includes('route') || code.includes('assign') || code.includes('dispatch'), hasAsync], rationale: 'Skill-based task routing and workload distribution across agents' },
    reconn: { signals: [code.includes('search') || code.includes('crawl') || code.includes('research'), hasHttp], rationale: 'Deep research and web crawling with source verification and citation tracking' },
    uplink: { signals: [code.includes('message') || code.includes('channel') || code.includes('broadcast'), hasAsync], rationale: 'Inter-agent communication bus and knowledge sharing protocol' },
    scribe: { signals: [code.includes('write') || code.includes('draft') || code.includes('content'), len > 100], rationale: 'Writing, drafting, and content generation with structured output' },
    incentive: { signals: [code.includes('reward') || code.includes('score') || code.includes('progress'), hasState], rationale: 'Reward programs and reinforcement loops for skill progression' },
    reason: { signals: [code.includes('reason') || code.includes('logic') || code.includes('decision'), len > 200], rationale: 'Chain-of-thought reasoning and structured decision-making' },
    toolkit: { signals: [code.includes('tool') || code.includes('api') || code.includes('plugin'), hasHttp], rationale: 'Tool use orchestration and API integration layer for agent capabilities' },
    // Agency vertical primitives — Agents
    operator: { signals: [code.includes('execute') || code.includes('run') || code.includes('perform'), hasAsync], rationale: 'Autonomous mission executor with minimal direction and self-correction' },
    overseer: { signals: [code.includes('health') || code.includes('monitor') || code.includes('heal'), hasAsync], rationale: 'Agent health monitoring, self-healing, and graceful degradation' },
    liaison: { signals: [code.includes('team') || code.includes('collaborat') || code.includes('coordinat'), hasAsync], rationale: 'Teamwork coordination and conflict resolution across agent groups' },
    scholar: { signals: [code.includes('learn') || code.includes('knowledge') || code.includes('skill'), hasState], rationale: 'Continuous skill acquisition and knowledge distillation for agent improvement' },
    envoy: { signals: [code.includes('report') || code.includes('status') || code.includes('notify'), hasAsync], rationale: 'User-facing communication and progress reporting agent' },
    warden: { signals: [code.includes('policy') || code.includes('rule') || code.includes('govern'), hasAuth], rationale: 'Governance enforcement and safety boundary management' },
    rogue: { signals: [code.includes('creative') || code.includes('alternative') || code.includes('experiment'), len > 200], rationale: 'Creative problem-solving and unconventional approach generation' },
    anchor: { signals: [code.includes('context') || code.includes('session') || code.includes('persist'), hasState], rationale: 'Context persistence and long-term memory for continuous agent operation' },
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

/**
 * Generate up to 20 capability recommendations with vertical-aware weighting.
 *
 * Strategy: 10 SPINE slots (Organs/Layers for stabilization) +
 *           10 EXPANSION slots (vertical-specific Engines/Agents for specialization).
 *
 * The expansion primitives are the randomized deciding factor — they determine
 * what the software actually becomes after Ascension, producing unique loadouts
 * per vertical substrate.
 */
function generateRecommendations(
  findings: ScanFinding[],
  code: string,
  rand: () => number,
): PrimitiveRecommendation[] {
  const MAX_TOTAL = 20;
  const SPINE_SLOTS = 10;
  const EXPANSION_SLOTS = 10;

  const { spine, expansion } = buildVerticalCatalog();

  // Score spine primitives (Organs + Layers) — stabilization
  const scoredSpine = spine.map(p => {
    const { score, rationale } = scorePrimitiveRelevance(p, code, findings, rand);
    return { ...p, impactScore: score, rationale };
  });
  scoredSpine.sort((a, b) => b.impactScore - a.impactScore);

  // Score expansion primitives (vertical Engines + Agents) — specialization
  // Apply a vertical-specialization bonus to make these primitives more impactful
  const scoredExpansion = expansion.map(p => {
    const { score, rationale } = scorePrimitiveRelevance(p, code, findings, rand);
    const verticalBonus = 10 + Math.floor(rand() * 15);
    return { ...p, impactScore: Math.min(99, score + verticalBonus), rationale };
  });
  scoredExpansion.sort((a, b) => b.impactScore - a.impactScore);

  const result: PrimitiveRecommendation[] = [];

  // Phase 1: Fill SPINE slots — balanced Organ/Layer mix
  const spineOrgans = scoredSpine.filter(p => p.category === 'Organ');
  const spineLayers = scoredSpine.filter(p => p.category === 'Layer');
  const minOrgans = 5;
  const minLayers = 5;

  for (const o of spineOrgans) {
    if (result.filter(r => r.category === 'Organ').length < minOrgans) result.push(o);
  }
  for (const l of spineLayers) {
    if (result.filter(r => r.category === 'Layer').length < minLayers) result.push(l);
  }
  // If either category is short, fill from the other
  for (const p of scoredSpine) {
    if (result.length >= SPINE_SLOTS) break;
    if (!result.find(r => r.primitiveId === p.primitiveId)) result.push(p);
  }

  // Phase 2: Fill EXPANSION slots — vertical-specific specialization
  // These are the randomized primitives that define what the software becomes
  const expansionEngines = scoredExpansion.filter(p => p.category === 'Engine');
  const expansionAgents = scoredExpansion.filter(p => p.category === 'Agent');
  const minEngines = 5;
  const minAgents = 5;

  for (const e of expansionEngines) {
    if (result.filter(r => r.category === 'Engine').length < minEngines) result.push(e);
  }
  for (const a of expansionAgents) {
    if (result.filter(r => r.category === 'Agent').length < minAgents) result.push(a);
  }
  // Fill remaining expansion slots
  for (const p of scoredExpansion) {
    if (result.length >= MAX_TOTAL) break;
    if (!result.find(r => r.primitiveId === p.primitiveId)) result.push(p);
  }

  return result.sort((a, b) => b.impactScore - a.impactScore);
}
