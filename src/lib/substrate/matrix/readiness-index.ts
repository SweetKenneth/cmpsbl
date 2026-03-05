/**
 * Mutation Readiness Index — Pre-Execution Fitness Assessment
 * 
 * Computes a readiness score (0–1) for proposed mutations.
 * 
 * Factors:
 * - Integrity health of target modules
 * - Error rates across affected nodes
 * - Dependency stability (all deps healthy)
 * - Governance plane status
 * 
 * Mutation cannot execute if readiness < threshold (default 0.7).
 */

import type { SubstrateModuleName } from '@/lib/core/index';
import { getNodeState, areDependenciesHealthy } from './registry';
import { getPlaneState } from './control-planes';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ReadinessReport {
  score: number; // 0–1
  factors: ReadinessFactor[];
  blockers: string[];
  timestamp: number;
}

export interface ReadinessFactor {
  name: string;
  weight: number;
  value: number; // 0–1
  detail: string;
}

// ═══════════════════════════════════════════════════════════════
// COMPUTATION
// ═══════════════════════════════════════════════════════════════

const FACTOR_WEIGHTS = {
  targetHealth: 0.30,
  errorRate: 0.25,
  dependencyStability: 0.25,
  governanceStatus: 0.20,
};

export function computeReadiness(targetModules: SubstrateModuleName[]): ReadinessReport {
  const factors: ReadinessFactor[] = [];
  const blockers: string[] = [];

  // Factor 1: Target module health
  const healthScores = targetModules.map(id => {
    const state = getNodeState(id);
    return state ? state.health / 100 : 0;
  });
  const avgHealth = healthScores.length > 0
    ? healthScores.reduce((a, b) => a + b, 0) / healthScores.length
    : 0;

  factors.push({
    name: 'Target Module Health',
    weight: FACTOR_WEIGHTS.targetHealth,
    value: avgHealth,
    detail: `Average health: ${(avgHealth * 100).toFixed(0)}% across ${targetModules.length} modules`,
  });

  if (avgHealth < 0.5) {
    blockers.push(`Target modules health too low (${(avgHealth * 100).toFixed(0)}%)`);
  }

  // Factor 2: Error rate
  const errorRates = targetModules.map(id => {
    const state = getNodeState(id);
    if (!state || state.opsCount === 0) return 0;
    return state.errorCount / state.opsCount;
  });
  const avgErrorRate = errorRates.length > 0
    ? errorRates.reduce((a, b) => a + b, 0) / errorRates.length
    : 0;
  const errorScore = Math.max(0, 1 - avgErrorRate * 5); // 20% error rate = 0 score

  factors.push({
    name: 'Error Rate',
    weight: FACTOR_WEIGHTS.errorRate,
    value: errorScore,
    detail: `Average error rate: ${(avgErrorRate * 100).toFixed(1)}%`,
  });

  if (avgErrorRate > 0.1) {
    blockers.push(`Error rate too high (${(avgErrorRate * 100).toFixed(1)}%)`);
  }

  // Factor 3: Dependency stability
  const depsHealthy = targetModules.map(id => areDependenciesHealthy(id) ? 1 : 0);
  const depScore = depsHealthy.length > 0
    ? depsHealthy.reduce((a, b) => a + b, 0) / depsHealthy.length
    : 1;

  factors.push({
    name: 'Dependency Stability',
    weight: FACTOR_WEIGHTS.dependencyStability,
    value: depScore,
    detail: `${depsHealthy.filter(d => d === 1).length}/${targetModules.length} modules have healthy dependencies`,
  });

  if (depScore < 0.5) {
    blockers.push('Too many target modules have unhealthy dependencies');
  }

  // Factor 4: Governance plane status
  const govPlane = getPlaneState('governance');
  const govScore = govPlane.status === 'active' ? 1 : govPlane.status === 'degraded' ? 0.5 : 0;

  factors.push({
    name: 'Governance Status',
    weight: FACTOR_WEIGHTS.governanceStatus,
    value: govScore,
    detail: `Governance plane: ${govPlane.status}`,
  });

  if (govPlane.status === 'suspended') {
    blockers.push('Governance plane is suspended');
  }

  // Compute weighted score
  const score = factors.reduce((sum, f) => sum + f.value * f.weight, 0);

  return {
    score: Math.round(score * 1000) / 1000,
    factors,
    blockers,
    timestamp: Date.now(),
  };
}
