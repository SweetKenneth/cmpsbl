/**
 * SIMULATE Ultimate — System 2: Multi-Dimensional Scenario Engine
 * 
 * Define scenarios with multiple simultaneous variable mutations,
 * parameter sweeps, composable templates, and compound scenarios.
 * 
 * @module simulate/ultimate/scenarioEngine
 */

// ── Types ────────────────────────────────────────────────────────

export type ScenarioTemplate =
  | 'node_failure' | 'traffic_spike' | 'security_breach' | 'upgrade_rollout'
  | 'capacity_exhaust' | 'data_corruption' | 'cascade_failure' | 'latency_degradation'
  | 'resource_contention' | 'dependency_outage' | 'custom';

export interface ScenarioDimension {
  name: string;
  parameter: string;
  range: { min: number; max: number; step: number };
  distribution: 'uniform' | 'normal' | 'exponential';
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  template: ScenarioTemplate;
  description: string;
  dimensions: ScenarioDimension[];
  baseParameters: Record<string, number>;
  compoundWith?: string[];   // Other scenario IDs to compose
  duration?: number;         // Simulation time horizon (seconds)
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export interface ScenarioRun {
  id: string;
  scenarioId: string;
  name: string;
  template: ScenarioTemplate;
  parameterSnapshot: Record<string, number>;
  dimensionValues: Record<string, number>;
  outcome: ScenarioOutcome;
  startedAt: string;
  completedAt: string;
  durationMs: number;
}

export interface ScenarioOutcome {
  impactScore: number;      // 0-100 (100 = catastrophic)
  affectedNodes: string[];
  metrics: Record<string, number>;
  riskLevel: 'negligible' | 'low' | 'moderate' | 'high' | 'critical';
  narrative: string;
}

// ── State ────────────────────────────────────────────────────────

const scenarioLibrary: Map<string, ScenarioDefinition> = new Map();
const scenarioRuns: ScenarioRun[] = [];
const MAX_RUNS = 500;

// ── Template Defaults ────────────────────────────────────────────

const TEMPLATE_DEFAULTS: Record<ScenarioTemplate, {
  dimensions: ScenarioDimension[];
  baseParameters: Record<string, number>;
  description: string;
}> = {
  node_failure: {
    description: 'Simulates one or more nodes going offline',
    dimensions: [
      { name: 'Failure Count', parameter: 'failedNodes', range: { min: 1, max: 10, step: 1 }, distribution: 'uniform' },
      { name: 'Recovery Time', parameter: 'recoveryMs', range: { min: 1000, max: 60000, step: 1000 }, distribution: 'normal' },
    ],
    baseParameters: { failedNodes: 1, recoveryMs: 5000, cascadeRisk: 0.3 },
  },
  traffic_spike: {
    description: 'Simulates sudden traffic increase',
    dimensions: [
      { name: 'Multiplier', parameter: 'multiplier', range: { min: 2, max: 100, step: 5 }, distribution: 'exponential' },
      { name: 'Duration', parameter: 'durationSec', range: { min: 10, max: 3600, step: 60 }, distribution: 'uniform' },
    ],
    baseParameters: { multiplier: 10, durationSec: 300, rampUpSec: 5 },
  },
  security_breach: {
    description: 'Simulates a security incident',
    dimensions: [
      { name: 'Severity', parameter: 'severity', range: { min: 1, max: 10, step: 1 }, distribution: 'uniform' },
      { name: 'Detection Delay', parameter: 'detectionMs', range: { min: 100, max: 30000, step: 500 }, distribution: 'exponential' },
    ],
    baseParameters: { severity: 5, detectionMs: 2000, exfiltratedRecords: 0 },
  },
  upgrade_rollout: {
    description: 'Simulates a rolling upgrade across primitives',
    dimensions: [
      { name: 'Batch Size', parameter: 'batchSize', range: { min: 1, max: 10, step: 1 }, distribution: 'uniform' },
      { name: 'Rollback Probability', parameter: 'rollbackProb', range: { min: 0, max: 0.5, step: 0.05 }, distribution: 'uniform' },
    ],
    baseParameters: { batchSize: 3, rollbackProb: 0.05, upgradeTimeMs: 10000 },
  },
  capacity_exhaust: {
    description: 'Simulates resource exhaustion (memory, CPU, storage)',
    dimensions: [
      { name: 'Resource Type', parameter: 'resourceType', range: { min: 0, max: 2, step: 1 }, distribution: 'uniform' },
      { name: 'Fill Rate', parameter: 'fillRatePercent', range: { min: 50, max: 100, step: 5 }, distribution: 'uniform' },
    ],
    baseParameters: { resourceType: 0, fillRatePercent: 90, headroomPercent: 10 },
  },
  data_corruption: {
    description: 'Simulates data integrity failure',
    dimensions: [
      { name: 'Corruption Rate', parameter: 'corruptionRate', range: { min: 0.001, max: 0.1, step: 0.005 }, distribution: 'exponential' },
    ],
    baseParameters: { corruptionRate: 0.01, affectedTables: 1, detectionDelayMs: 5000 },
  },
  cascade_failure: {
    description: 'Simulates cascading failure across dependent nodes',
    dimensions: [
      { name: 'Initial Node Count', parameter: 'initialNodes', range: { min: 1, max: 5, step: 1 }, distribution: 'uniform' },
      { name: 'Cascade Probability', parameter: 'cascadeProb', range: { min: 0.1, max: 0.9, step: 0.1 }, distribution: 'uniform' },
    ],
    baseParameters: { initialNodes: 1, cascadeProb: 0.4, maxDepth: 5 },
  },
  latency_degradation: {
    description: 'Simulates progressive latency increase',
    dimensions: [
      { name: 'Latency Multiplier', parameter: 'latencyMult', range: { min: 2, max: 50, step: 2 }, distribution: 'exponential' },
      { name: 'Affected Paths', parameter: 'pathCount', range: { min: 1, max: 20, step: 1 }, distribution: 'uniform' },
    ],
    baseParameters: { latencyMult: 5, pathCount: 3, baseLatencyMs: 50 },
  },
  resource_contention: {
    description: 'Simulates resource contention between competing processes',
    dimensions: [
      { name: 'Contenders', parameter: 'contenderCount', range: { min: 2, max: 20, step: 1 }, distribution: 'uniform' },
    ],
    baseParameters: { contenderCount: 5, resourceCapacity: 100, starvationThresholdMs: 5000 },
  },
  dependency_outage: {
    description: 'Simulates external dependency becoming unavailable',
    dimensions: [
      { name: 'Outage Duration', parameter: 'outageSec', range: { min: 10, max: 3600, step: 30 }, distribution: 'exponential' },
    ],
    baseParameters: { outageSec: 300, fallbackAvailable: 1, retryIntervalMs: 1000 },
  },
  custom: {
    description: 'User-defined scenario',
    dimensions: [],
    baseParameters: {},
  },
};

const SUBSTRATE_NODES = [
  'core', 'brain', 'memory', 'nerve', 'decode', 'encode', 'cortex', 'defense',
  'oracle', 'conscience', 'phantom', 'harvest', 'evolution', 'shadow', 'immunity',
  'intent', 'governance', 'atlas', 'forge', 'lingua', 'echo', 'sovereign',
  'reflex', 'treaty', 'engineer', 'compass', 'vision', 'dream', 'simulate',
  'relay', 'sandbox', 'integration', 'inclusive', 'medic', 'audit', 'system',
  'nexus', 'economy', 'identity', 'analytics',
];

// ── Core API ────────────────────────────────────────────────────

/** Register a scenario definition */
export function defineScenario(scenario: ScenarioDefinition): ScenarioDefinition {
  scenarioLibrary.set(scenario.id, scenario);
  return scenario;
}

/** Create a scenario from a template with optional overrides */
export function createFromTemplate(
  id: string,
  name: string,
  template: ScenarioTemplate,
  paramOverrides?: Record<string, number>,
): ScenarioDefinition {
  const defaults = TEMPLATE_DEFAULTS[template];
  const scenario: ScenarioDefinition = {
    id,
    name,
    template,
    description: defaults.description,
    dimensions: [...defaults.dimensions],
    baseParameters: { ...defaults.baseParameters, ...paramOverrides },
    priority: 'normal',
  };
  scenarioLibrary.set(id, scenario);
  return scenario;
}

/** Compose two scenarios into a compound scenario */
export function composeScenarios(
  id: string,
  name: string,
  scenarioIds: string[],
): ScenarioDefinition | null {
  const scenarios = scenarioIds.map(sid => scenarioLibrary.get(sid)).filter(Boolean) as ScenarioDefinition[];
  if (scenarios.length < 2) return null;

  const merged: ScenarioDefinition = {
    id,
    name,
    template: 'custom',
    description: `Compound: ${scenarios.map(s => s.name).join(' × ')}`,
    dimensions: scenarios.flatMap(s => s.dimensions),
    baseParameters: Object.assign({}, ...scenarios.map(s => s.baseParameters)),
    compoundWith: scenarioIds,
    priority: 'high',
  };
  scenarioLibrary.set(id, merged);
  return merged;
}

/** Execute a scenario */
export function executeScenario(scenarioId: string, dimensionOverrides?: Record<string, number>): ScenarioRun | null {
  const scenario = scenarioLibrary.get(scenarioId);
  if (!scenario) return null;

  const start = Date.now();

  // Resolve dimension values
  const dimValues: Record<string, number> = {};
  for (const dim of scenario.dimensions) {
    dimValues[dim.parameter] = dimensionOverrides?.[dim.parameter] ?? scenario.baseParameters[dim.parameter] ?? dim.range.min;
  }

  const params = { ...scenario.baseParameters, ...dimValues };

  // Simulate outcome based on template
  const impactScore = computeImpact(scenario.template, params);
  const affectedNodes = selectAffectedNodes(scenario.template, params);
  const riskLevel = impactScore >= 80 ? 'critical' : impactScore >= 60 ? 'high' : impactScore >= 40 ? 'moderate' : impactScore >= 20 ? 'low' : 'negligible';

  const outcome: ScenarioOutcome = {
    impactScore,
    affectedNodes,
    metrics: {
      estimatedDowntimeMs: impactScore * 100 + Math.random() * 5000,
      estimatedRecoveryMs: (100 - impactScore) * 50 + 1000,
      dataLossRisk: Math.min(1, impactScore / 100 * 0.3),
      userImpactPercent: Math.min(100, impactScore * 1.2),
    },
    riskLevel,
    narrative: `${scenario.template} scenario with impact score ${impactScore}/100. ${affectedNodes.length} nodes affected. Risk: ${riskLevel}.`,
  };

  const run: ScenarioRun = {
    id: crypto.randomUUID(),
    scenarioId,
    name: scenario.name,
    template: scenario.template,
    parameterSnapshot: params,
    dimensionValues: dimValues,
    outcome,
    startedAt: new Date(start).toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - start,
  };

  scenarioRuns.push(run);
  if (scenarioRuns.length > MAX_RUNS) scenarioRuns.splice(0, scenarioRuns.length - MAX_RUNS);

  return run;
}

/** Parameter sweep — run a scenario across a dimension range */
export function parameterSweep(
  scenarioId: string,
  dimension: string,
  steps: number = 10,
): ScenarioRun[] {
  const scenario = scenarioLibrary.get(scenarioId);
  if (!scenario) return [];

  const dim = scenario.dimensions.find(d => d.parameter === dimension);
  if (!dim) return [];

  const results: ScenarioRun[] = [];
  const stepSize = (dim.range.max - dim.range.min) / steps;

  for (let i = 0; i <= steps; i++) {
    const value = dim.range.min + stepSize * i;
    const run = executeScenario(scenarioId, { [dimension]: value });
    if (run) results.push(run);
  }

  return results;
}

// ── Impact Calculation ───────────────────────────────────────────

function computeImpact(template: ScenarioTemplate, params: Record<string, number>): number {
  switch (template) {
    case 'node_failure':
      return Math.min(100, (params.failedNodes || 1) * 15 + (1 - (params.recoveryMs || 5000) / 60000) * 30);
    case 'traffic_spike':
      return Math.min(100, Math.log2(params.multiplier || 2) * 20);
    case 'security_breach':
      return Math.min(100, (params.severity || 5) * 10);
    case 'cascade_failure':
      return Math.min(100, (params.initialNodes || 1) * 10 + (params.cascadeProb || 0.4) * 60);
    case 'capacity_exhaust':
      return Math.min(100, (params.fillRatePercent || 90) * 0.9);
    case 'latency_degradation':
      return Math.min(100, Math.log2(params.latencyMult || 2) * 15 + (params.pathCount || 1) * 5);
    default:
      return Math.min(100, Object.values(params).reduce((s, v) => s + Math.abs(v) * 0.1, 0));
  }
}

function selectAffectedNodes(template: ScenarioTemplate, params: Record<string, number>): string[] {
  const count = Math.max(1, Math.min(40, Math.ceil(computeImpact(template, params) / 10)));
  const shuffled = [...SUBSTRATE_NODES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ── Query ────────────────────────────────────────────────────────

export function getScenario(id: string): ScenarioDefinition | undefined { return scenarioLibrary.get(id); }
export function getAllScenarios(): ScenarioDefinition[] { return Array.from(scenarioLibrary.values()); }
export function getScenarioRuns(scenarioId?: string): ScenarioRun[] {
  return scenarioId ? scenarioRuns.filter(r => r.scenarioId === scenarioId) : [...scenarioRuns];
}
export function getAvailableTemplates(): ScenarioTemplate[] { return Object.keys(TEMPLATE_DEFAULTS) as ScenarioTemplate[]; }

export function getScenarioEngineHealth() {
  const recent = scenarioRuns.slice(-50);
  return {
    definedScenarios: scenarioLibrary.size,
    totalRuns: scenarioRuns.length,
    templatesAvailable: Object.keys(TEMPLATE_DEFAULTS).length,
    avgImpactScore: recent.length > 0
      ? Math.round(recent.reduce((s, r) => s + r.outcome.impactScore, 0) / recent.length)
      : 0,
    criticalScenarios: recent.filter(r => r.outcome.riskLevel === 'critical').length,
  };
}

export function resetScenarioEngine(): void {
  scenarioLibrary.clear();
  scenarioRuns.length = 0;
}
