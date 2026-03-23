/**
 * SHADOW Ultimate — Chaos Injection Engine
 * Controlled fault injection into shadow chambers.
 * Proves resilience of proposed changes before promotion.
 */

export type ChaosType = 'latency_spike' | 'partial_failure' | 'resource_starvation' | 'data_corruption' | 'network_partition' | 'clock_skew';

export interface ChaosScenario {
  id: string;
  sessionId: string;
  chaosType: ChaosType;
  intensity: number;          // 0–1
  durationMs: number;
  targetNode?: string;
  status: 'pending' | 'active' | 'completed' | 'aborted';
  startedAt?: number;
  completedAt?: number;
  survived: boolean;
  impactScore: number;        // 0–1, how much it affected execution
}

export interface ChaosStats {
  totalScenarios: number;
  survivalRate: number;
  avgImpact: number;
  byChaosType: Record<string, { count: number; survivalRate: number }>;
}

const MAX_SCENARIOS = 500;
const scenarios: ChaosScenario[] = [];

export function injectChaos(
  sessionId: string, chaosType: ChaosType,
  intensity: number = 0.5, durationMs: number = 5000, targetNode?: string
): ChaosScenario {
  const scenario: ChaosScenario = {
    id: `chaos-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sessionId, chaosType,
    intensity: Math.max(0, Math.min(1, intensity)),
    durationMs, targetNode,
    status: 'pending', survived: false, impactScore: 0,
  };
  if (scenarios.length >= MAX_SCENARIOS) scenarios.shift();
  scenarios.push(scenario);
  return scenario;
}

export function activateChaos(scenarioId: string): boolean {
  const s = scenarios.find(sc => sc.id === scenarioId);
  if (!s || s.status !== 'pending') return false;
  s.status = 'active';
  s.startedAt = Date.now();
  return true;
}

export function completeChaos(scenarioId: string, survived: boolean, impactScore: number): void {
  const s = scenarios.find(sc => sc.id === scenarioId);
  if (!s) return;
  s.status = 'completed';
  s.completedAt = Date.now();
  s.survived = survived;
  s.impactScore = Math.max(0, Math.min(1, impactScore));
}

export function abortChaos(scenarioId: string): void {
  const s = scenarios.find(sc => sc.id === scenarioId);
  if (!s || s.status !== 'active') return;
  s.status = 'aborted';
  s.completedAt = Date.now();
}

export function getChaosStats(): ChaosStats {
  const completed = scenarios.filter(s => s.status === 'completed');
  const byType: Record<string, { count: number; survivalRate: number }> = {};
  for (const s of completed) {
    if (!byType[s.chaosType]) byType[s.chaosType] = { count: 0, survivalRate: 0 };
    byType[s.chaosType].count++;
  }
  for (const [type, data] of Object.entries(byType)) {
    const typeScenarios = completed.filter(s => s.chaosType === type);
    data.survivalRate = typeScenarios.length > 0 ? typeScenarios.filter(s => s.survived).length / typeScenarios.length : 0;
  }

  return {
    totalScenarios: scenarios.length,
    survivalRate: completed.length > 0 ? completed.filter(s => s.survived).length / completed.length : 0,
    avgImpact: completed.length > 0 ? completed.reduce((s, c) => s + c.impactScore, 0) / completed.length : 0,
    byChaosType: byType,
  };
}

export function resetChaosState(): void { scenarios.length = 0; }
