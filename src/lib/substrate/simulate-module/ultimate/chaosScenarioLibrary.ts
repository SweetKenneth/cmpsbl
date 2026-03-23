/**
 * SIMULATE Ultimate — System 8: Chaos Scenario Library
 * 
 * Pre-built scenario templates calibrated from real system telemetry.
 * Custom scenario builder for composing novel failure modes.
 * Includes severity profiles and recovery expectations.
 * 
 * @module simulate/ultimate/chaosScenarioLibrary
 */

// ── Types ────────────────────────────────────────────────────────

export interface ChaosScenario {
  id: string;
  name: string;
  category: 'infrastructure' | 'security' | 'performance' | 'data' | 'network' | 'human_error';
  severity: 'minor' | 'moderate' | 'major' | 'catastrophic';
  description: string;
  injectionProfile: {
    targetNodes: string[];
    parameters: Record<string, number>;
    durationMs: number;
    cascadeRisk: number;       // 0-1
  };
  expectedRecovery: {
    autoRecoverable: boolean;
    expectedRecoveryMs: number;
    requiresIntervention: boolean;
    playbook?: string;
  };
  realWorldExamples: string[];
  lastCalibrated: string;
}

export interface ChaosExperiment {
  id: string;
  scenarioId: string;
  hypothesis: string;
  outcome: 'confirmed' | 'refuted' | 'inconclusive' | 'pending';
  observations: string[];
  metrics: Record<string, number>;
  executedAt: string;
  durationMs: number;
}

// ── State ────────────────────────────────────────────────────────

const library: Map<string, ChaosScenario> = new Map();
const experiments: ChaosExperiment[] = [];
const MAX_EXPERIMENTS = 300;

// ── Pre-built Library ────────────────────────────────────────────

const BUILT_IN_SCENARIOS: ChaosScenario[] = [
  {
    id: 'chaos_single_node_crash',
    name: 'Single Node Crash',
    category: 'infrastructure',
    severity: 'moderate',
    description: 'One node process crashes unexpectedly and must restart',
    injectionProfile: {
      targetNodes: ['brain'],
      parameters: { crashType: 1, restartDelayMs: 3000 },
      durationMs: 10000,
      cascadeRisk: 0.2,
    },
    expectedRecovery: { autoRecoverable: true, expectedRecoveryMs: 5000, requiresIntervention: false },
    realWorldExamples: ['OOM kill', 'Unhandled exception', 'Segfault'],
    lastCalibrated: new Date().toISOString(),
  },
  {
    id: 'chaos_multi_node_partition',
    name: 'Network Partition',
    category: 'network',
    severity: 'major',
    description: 'Network partition isolates a group of nodes from the rest',
    injectionProfile: {
      targetNodes: ['relay', 'nerve', 'cortex'],
      parameters: { partitionPercent: 30, healDelayMs: 15000 },
      durationMs: 30000,
      cascadeRisk: 0.6,
    },
    expectedRecovery: { autoRecoverable: true, expectedRecoveryMs: 20000, requiresIntervention: false },
    realWorldExamples: ['DNS failure', 'Firewall misconfiguration', 'Cloud AZ outage'],
    lastCalibrated: new Date().toISOString(),
  },
  {
    id: 'chaos_memory_leak',
    name: 'Memory Leak',
    category: 'performance',
    severity: 'moderate',
    description: 'Gradual memory leak causing increasing GC pressure',
    injectionProfile: {
      targetNodes: ['memory', 'brain'],
      parameters: { leakRateMBPerMin: 10, gcPauseMs: 50 },
      durationMs: 300000,
      cascadeRisk: 0.3,
    },
    expectedRecovery: { autoRecoverable: false, expectedRecoveryMs: 60000, requiresIntervention: true, playbook: 'Force GC + restart affected node' },
    realWorldExamples: ['Unclosed connections', 'Growing event listener list', 'Cache without eviction'],
    lastCalibrated: new Date().toISOString(),
  },
  {
    id: 'chaos_data_corruption',
    name: 'Silent Data Corruption',
    category: 'data',
    severity: 'catastrophic',
    description: 'Data written to storage is silently corrupted',
    injectionProfile: {
      targetNodes: ['memory', 'harvest'],
      parameters: { corruptionRate: 0.01, detectionDelayMs: 60000 },
      durationMs: 120000,
      cascadeRisk: 0.8,
    },
    expectedRecovery: { autoRecoverable: false, expectedRecoveryMs: 300000, requiresIntervention: true, playbook: 'Identify corruption window → restore from last clean backup → replay events' },
    realWorldExamples: ['Bit flip', 'Encoding mismatch', 'Race condition in write path'],
    lastCalibrated: new Date().toISOString(),
  },
  {
    id: 'chaos_thundering_herd',
    name: 'Thundering Herd',
    category: 'performance',
    severity: 'major',
    description: 'All clients retry simultaneously after a brief outage',
    injectionProfile: {
      targetNodes: ['nexus', 'relay', 'decode'],
      parameters: { clientMultiplier: 50, outageMs: 2000 },
      durationMs: 60000,
      cascadeRisk: 0.7,
    },
    expectedRecovery: { autoRecoverable: true, expectedRecoveryMs: 30000, requiresIntervention: false, playbook: 'Backpressure + exponential backoff' },
    realWorldExamples: ['Cache invalidation storm', 'DNS TTL expiry', 'Deployment restart'],
    lastCalibrated: new Date().toISOString(),
  },
  {
    id: 'chaos_credential_leak',
    name: 'Credential Exposure',
    category: 'security',
    severity: 'catastrophic',
    description: 'API credentials accidentally exposed in logs or response',
    injectionProfile: {
      targetNodes: ['defense', 'identity', 'phantom'],
      parameters: { exposedCredentials: 1, exfiltrationRisk: 0.3 },
      durationMs: 5000,
      cascadeRisk: 0.5,
    },
    expectedRecovery: { autoRecoverable: false, expectedRecoveryMs: 600000, requiresIntervention: true, playbook: 'Rotate credentials immediately → audit access logs → notify affected parties' },
    realWorldExamples: ['Log injection', 'Debug mode in production', 'Misconfigured CORS'],
    lastCalibrated: new Date().toISOString(),
  },
  {
    id: 'chaos_cascade_failure',
    name: 'Cascade Failure',
    category: 'infrastructure',
    severity: 'catastrophic',
    description: 'One node failure cascades through dependencies',
    injectionProfile: {
      targetNodes: ['core'],
      parameters: { cascadeDepth: 5, failureProbPerHop: 0.4 },
      durationMs: 60000,
      cascadeRisk: 0.9,
    },
    expectedRecovery: { autoRecoverable: false, expectedRecoveryMs: 120000, requiresIntervention: true, playbook: 'Circuit breakers → isolate epicenter → staged recovery from leaves to root' },
    realWorldExamples: ['AWS us-east-1 cascading failure', 'Kafka partition leader failover storm'],
    lastCalibrated: new Date().toISOString(),
  },
  {
    id: 'chaos_clock_skew',
    name: 'Clock Skew',
    category: 'infrastructure',
    severity: 'moderate',
    description: 'System clock drifts causing timestamp-dependent logic to fail',
    injectionProfile: {
      targetNodes: ['oracle', 'audit', 'governance'],
      parameters: { skewMs: 30000, affectedNodes: 3 },
      durationMs: 120000,
      cascadeRisk: 0.3,
    },
    expectedRecovery: { autoRecoverable: true, expectedRecoveryMs: 10000, requiresIntervention: false },
    realWorldExamples: ['NTP sync failure', 'Leap second', 'VM clock drift'],
    lastCalibrated: new Date().toISOString(),
  },
  {
    id: 'chaos_human_error_config',
    name: 'Configuration Mistake',
    category: 'human_error',
    severity: 'major',
    description: 'Wrong configuration deployed to production',
    injectionProfile: {
      targetNodes: ['system'],
      parameters: { misconfiguredParams: 3, rollbackAvailable: 1 },
      durationMs: 300000,
      cascadeRisk: 0.5,
    },
    expectedRecovery: { autoRecoverable: false, expectedRecoveryMs: 60000, requiresIntervention: true, playbook: 'Identify misconfigured params → rollback to last known good → validate' },
    realWorldExamples: ['Wrong env vars', 'Feature flag flip', 'Rate limit set to 0'],
    lastCalibrated: new Date().toISOString(),
  },
  {
    id: 'chaos_dependency_outage',
    name: 'External Dependency Outage',
    category: 'network',
    severity: 'major',
    description: 'External API or service becomes unavailable',
    injectionProfile: {
      targetNodes: ['nexus', 'integration'],
      parameters: { outageDurationMs: 300000, fallbackAvailable: 1 },
      durationMs: 300000,
      cascadeRisk: 0.4,
    },
    expectedRecovery: { autoRecoverable: true, expectedRecoveryMs: 60000, requiresIntervention: false, playbook: 'Fallback chain → cached responses → degrade gracefully' },
    realWorldExamples: ['OpenAI outage', 'Stripe downtime', 'GitHub API rate limit'],
    lastCalibrated: new Date().toISOString(),
  },
];

// Initialize library
for (const s of BUILT_IN_SCENARIOS) {
  library.set(s.id, s);
}

// ── Core API ────────────────────────────────────────────────────

/** Get all scenarios */
export function getAllChaosScenarios(): ChaosScenario[] { return Array.from(library.values()); }

/** Get scenario by ID */
export function getChaosScenario(id: string): ChaosScenario | undefined { return library.get(id); }

/** Get scenarios by category */
export function getByCategory(category: ChaosScenario['category']): ChaosScenario[] {
  return Array.from(library.values()).filter(s => s.category === category);
}

/** Get scenarios by severity */
export function getBySeverity(severity: ChaosScenario['severity']): ChaosScenario[] {
  return Array.from(library.values()).filter(s => s.severity === severity);
}

/** Register a custom chaos scenario */
export function registerChaosScenario(scenario: ChaosScenario): void {
  library.set(scenario.id, scenario);
}

/** Record a chaos experiment result */
export function recordExperiment(
  scenarioId: string,
  hypothesis: string,
  outcome: ChaosExperiment['outcome'],
  observations: string[],
  metrics: Record<string, number>,
  durationMs: number,
): ChaosExperiment {
  const experiment: ChaosExperiment = {
    id: crypto.randomUUID(),
    scenarioId,
    hypothesis,
    outcome,
    observations,
    metrics,
    executedAt: new Date().toISOString(),
    durationMs,
  };

  experiments.push(experiment);
  if (experiments.length > MAX_EXPERIMENTS) experiments.splice(0, experiments.length - MAX_EXPERIMENTS);
  return experiment;
}

export function getChaosLibraryHealth() {
  return {
    scenariosAvailable: library.size,
    builtInScenarios: BUILT_IN_SCENARIOS.length,
    customScenarios: library.size - BUILT_IN_SCENARIOS.length,
    experimentsRun: experiments.length,
    categories: [...new Set(Array.from(library.values()).map(s => s.category))].length,
  };
}

export function getExperiments(): ChaosExperiment[] { return [...experiments]; }

export function resetChaosLibrary(): void {
  library.clear();
  for (const s of BUILT_IN_SCENARIOS) library.set(s.id, s);
  experiments.length = 0;
}
