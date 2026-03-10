/**
 * S-Tier 070 — Adversarial Wargame Engine
 * CJPI: 93 | Node: ECHO | ID: S-SYN05
 *
 * Simulates adversarial attacks against the substrate to test resilience.
 * Red-team / blue-team simulation framework.
 */

export interface WargameScenario {
  id: string;
  name: string;
  attackVector: string;
  targetModule: string;
  intensity: number; // 1-10
}

export interface WargameResult {
  scenarioId: string;
  defended: boolean;
  responseTimeMs: number;
  defenseModule: string;
  damageScore: number; // 0-100
  lessonsLearned: string[];
  completedAt: string;
}

const scenarios: WargameScenario[] = [];
const results: WargameResult[] = [];
let scenarioSeq = 0;

export function createScenario(
  name: string, attackVector: string, targetModule: string, intensity = 5
): WargameScenario {
  const scenario: WargameScenario = { id: `wg-${++scenarioSeq}`, name, attackVector, targetModule, intensity };
  scenarios.push(scenario);
  return scenario;
}

export function simulateAttack(scenario: WargameScenario, defenseStrength: number): WargameResult {
  const responseTime = Math.round(50 + Math.random() * 200);
  const defended = defenseStrength > scenario.intensity * 10;
  const damageScore = defended ? Math.max(0, scenario.intensity * 5 - defenseStrength) : scenario.intensity * 10;

  const lessons: string[] = [];
  if (!defended) lessons.push(`${scenario.targetModule.toUpperCase()} vulnerable to ${scenario.attackVector}`);
  if (responseTime > 200) lessons.push('Response time exceeds 200ms threshold');
  if (damageScore > 50) lessons.push('Significant damage — review defense layers');

  const result: WargameResult = {
    scenarioId: scenario.id,
    defended,
    responseTimeMs: responseTime,
    defenseModule: 'defense',
    damageScore: Math.round(damageScore),
    lessonsLearned: lessons,
    completedAt: new Date().toISOString(),
  };
  results.push(result);
  return result;
}

export function getResults(): WargameResult[] { return [...results]; }
export function getScenarios(): WargameScenario[] { return [...scenarios]; }
