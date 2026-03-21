/**
 * CORTEX Cascade Failure Prevention — Predictive Risk Scoring
 * Analyzes dependency chains and predicts cascade failures before they propagate.
 * Aligned with CORTEX Node Deep Dive documentation.
 *
 * cascade_risk(pipeline):
 *   1. Build dependency graph from current pipeline
 *   2. For each node in critical path: query health, backpressure, diagnostics
 *   3. Risk score = max(dependency_health_issues) × chain_depth_factor
 *   4. If risk > 80% → pre-emptively reroute or shed load
 */

import { MODULE_REGISTRY, type ModuleRegistryEntry } from './index';
import type { SubstrateModule } from '../substrate';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CascadeRiskReport {
  timestamp: number;
  pipelineId: string;
  overallRisk: number;        // 0-100
  riskLevel: 'safe' | 'elevated' | 'warning' | 'critical';
  nodeRisks: NodeRiskAssessment[];
  criticalPath: string[];
  recommendation: CascadeRecommendation;
  chainDepth: number;
}

export interface NodeRiskAssessment {
  module: string;
  health: number;             // 0-100
  backpressure: number;       // 0-1
  dependencyCount: number;
  downstreamCount: number;
  riskContribution: number;   // how much this node contributes to cascade risk
}

export type CascadeRecommendation =
  | { action: 'none'; reason: string }
  | { action: 'reroute'; module: string; reason: string }
  | { action: 'shed_load'; priority: 'non-critical' | 'low' | 'all-but-critical'; reason: string }
  | { action: 'circuit_break'; module: string; reason: string };

// ─── Health Provider Interface ────────────────────────────────────────────────

type HealthProvider = (module: string) => number; // returns 0-100

let healthProvider: HealthProvider = () => 100; // default: assume healthy

export function setCascadeHealthProvider(provider: HealthProvider): void {
  healthProvider = provider;
}

// ─── Backpressure Tracking ────────────────────────────────────────────────────

const backpressureMap = new Map<string, number>();

export function reportBackpressure(module: string, pressure: number): void {
  backpressureMap.set(module, Math.max(0, Math.min(1, pressure)));
}

function getBackpressure(module: string): number {
  return backpressureMap.get(module) ?? 0;
}

// ─── Dependency Graph ─────────────────────────────────────────────────────────

function buildDependencyGraph(): Map<string, string[]> {
  const graph = new Map<string, string[]>();
  for (const [module, config] of Object.entries(MODULE_REGISTRY)) {
    graph.set(module, [...config.dependencies]);
  }
  return graph;
}

function buildDownstreamGraph(): Map<string, string[]> {
  const downstream = new Map<string, string[]>();
  for (const module of Object.keys(MODULE_REGISTRY)) {
    downstream.set(module, []);
  }
  for (const [module, config] of Object.entries(MODULE_REGISTRY)) {
    for (const dep of config.dependencies) {
      downstream.get(dep)?.push(module);
    }
  }
  return downstream;
}

function computeChainDepth(module: string, downstream: Map<string, string[]>, visited = new Set<string>()): number {
  if (visited.has(module)) return 0;
  visited.add(module);
  const children = downstream.get(module) ?? [];
  if (children.length === 0) return 1;
  return 1 + Math.max(...children.map(c => computeChainDepth(c, downstream, visited)));
}

// ─── Cascade Risk Assessment ──────────────────────────────────────────────────

const LOAD_SHED_THRESHOLD = 80; // risk > 80% → shed load

/**
 * Assess cascade failure risk for a pipeline involving specified modules.
 */
export function assessCascadeRisk(
  pipelineId: string,
  involvedModules: string[],
): CascadeRiskReport {
  const depGraph = buildDependencyGraph();
  const downstreamGraph = buildDownstreamGraph();

  // Expand to include all transitive dependencies
  const allModules = new Set<string>(involvedModules);
  const queue = [...involvedModules];
  while (queue.length > 0) {
    const mod = queue.shift()!;
    const deps = depGraph.get(mod) ?? [];
    for (const dep of deps) {
      if (!allModules.has(dep)) {
        allModules.add(dep);
        queue.push(dep);
      }
    }
  }

  // Assess each node
  const nodeRisks: NodeRiskAssessment[] = [];
  let maxHealthIssue = 0;

  for (const module of allModules) {
    const health = healthProvider(module);
    const bp = getBackpressure(module);
    const deps = depGraph.get(module) ?? [];
    const downstream = downstreamGraph.get(module) ?? [];

    const healthIssue = (100 - health) / 100; // 0 = perfect, 1 = dead
    const riskContribution = healthIssue * 0.6 + bp * 0.4;
    maxHealthIssue = Math.max(maxHealthIssue, riskContribution);

    nodeRisks.push({
      module,
      health,
      backpressure: bp,
      dependencyCount: deps.length,
      downstreamCount: downstream.length,
      riskContribution: Math.round(riskContribution * 100) / 100,
    });
  }

  // Critical path: modules with highest downstream impact
  const criticalPath = [...nodeRisks]
    .sort((a, b) => b.downstreamCount - a.downstreamCount)
    .map(n => n.module);

  // Chain depth factor
  const maxChainDepth = Math.max(1, ...involvedModules.map(m => computeChainDepth(m, downstreamGraph)));
  const depthFactor = 1 + (maxChainDepth - 1) * 0.15; // deeper chains amplify risk

  // Overall risk = max health issue × chain depth factor
  const overallRisk = Math.min(100, Math.round(maxHealthIssue * depthFactor * 100));

  // Risk level
  let riskLevel: CascadeRiskReport['riskLevel'] = 'safe';
  if (overallRisk >= 80) riskLevel = 'critical';
  else if (overallRisk >= 60) riskLevel = 'warning';
  else if (overallRisk >= 30) riskLevel = 'elevated';

  // Recommendation
  let recommendation: CascadeRecommendation;
  if (overallRisk >= LOAD_SHED_THRESHOLD) {
    const worstNode = nodeRisks.reduce((a, b) => a.riskContribution > b.riskContribution ? a : b);
    if (worstNode.health < 20) {
      recommendation = { action: 'circuit_break', module: worstNode.module, reason: `${worstNode.module} health at ${worstNode.health}% — circuit break recommended` };
    } else {
      recommendation = { action: 'shed_load', priority: 'non-critical', reason: `Cascade risk at ${overallRisk}% — shed non-essential tasks. Critical tasks proceed through degraded paths.` };
    }
  } else if (overallRisk >= 60) {
    const highBPNode = nodeRisks.find(n => n.backpressure > 0.7);
    if (highBPNode) {
      recommendation = { action: 'reroute', module: highBPNode.module, reason: `${highBPNode.module} backpressure at ${(highBPNode.backpressure * 100).toFixed(0)}% — consider rerouting` };
    } else {
      recommendation = { action: 'none', reason: `Risk elevated at ${overallRisk}% but no single module critical. Monitor closely.` };
    }
  } else {
    recommendation = { action: 'none', reason: `Cascade risk at ${overallRisk}% — within safe operating parameters.` };
  }

  return {
    timestamp: Date.now(),
    pipelineId,
    overallRisk,
    riskLevel,
    nodeRisks,
    criticalPath,
    recommendation,
    chainDepth: maxChainDepth,
  };
}

/**
 * Quick check: should we shed load for this pipeline?
 */
export function shouldShedLoad(pipelineId: string, modules: string[]): boolean {
  const report = assessCascadeRisk(pipelineId, modules);
  return report.overallRisk >= LOAD_SHED_THRESHOLD;
}

/**
 * Get cascade risk summary for the entire substrate.
 */
export function getSubstrateCascadeRisk(): CascadeRiskReport {
  const allModules = Object.keys(MODULE_REGISTRY);
  return assessCascadeRisk('substrate-global', allModules);
}
