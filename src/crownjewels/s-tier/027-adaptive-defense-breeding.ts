/**
 * S-Tier Crown Jewel #228 — Immunity-Evolution Adaptive Defense Breeding
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 228 | CJPI: 95 | Version: 1.0.0
 * Module: IMMUNITY×EVOLUTION | Type: Architecture (Cross-Module)
 * Signature: e456f1a2
 *
 * Breeds progressively stronger immune responses by applying evolutionary
 * pressure to defense strategies — mutations that survive attacks are promoted.
 */

type DefenseState = 'candidate' | 'testing' | 'surviving' | 'promoted' | 'extinct';

interface DefenseStrain {
  id: string;
  name: string;
  generation: number;
  parentIds: string[];
  rules: DefenseRule[];
  survivalScore: number;      // 0-100
  attacksSurvived: number;
  attacksFailed: number;
  state: DefenseState;
  createdAt: number;
}

interface DefenseRule {
  type: 'block' | 'throttle' | 'redirect' | 'honeypot' | 'quarantine';
  pattern: string;
  sensitivity: number;  // 0-1 (lower = more sensitive)
  confidence: number;
  source: 'bred' | 'mutated' | 'seeded';
}

interface AttackSimulation {
  id: string;
  attackType: string;
  intensity: number;     // 0-100
  vectors: string[];
  simulatedAt: number;
}

interface BreedingResult {
  generation: number;
  strainsTested: number;
  survived: number;
  extinct: number;
  promoted: number;
  bestStrain: string;
  bestScore: number;
}

export function createDefenseBreeder(config: {
  maxStrains?: number;
  survivalThreshold?: number;
  breedingRate?: number;
} = {}) {
  const strains = new Map<string, DefenseStrain>();
  const simulations: AttackSimulation[] = [];
  const results: BreedingResult[] = [];

  const maxStrains = config.maxStrains ?? 50;
  const survivalThreshold = config.survivalThreshold ?? 60;
  const breedingRate = config.breedingRate ?? 0.2;

  let generation = 0;
  let idCounter = 0;
  const nextId = (prefix: string) => `${prefix}-${Date.now()}-${++idCounter}`;

  function seedStrain(params: {
    name: string;
    rules: DefenseRule[];
  }): DefenseStrain {
    const strain: DefenseStrain = {
      id: nextId('def'),
      name: params.name,
      generation,
      parentIds: [],
      rules: params.rules,
      survivalScore: 50,
      attacksSurvived: 0,
      attacksFailed: 0,
      state: 'candidate',
      createdAt: Date.now(),
    };
    strains.set(strain.id, strain);
    return strain;
  }

  function simulateAttack(attack: Omit<AttackSimulation, 'id' | 'simulatedAt'>): AttackSimulation {
    const sim: AttackSimulation = {
      id: nextId('atk'),
      ...attack,
      simulatedAt: Date.now(),
    };
    simulations.push(sim);

    // Test all active strains
    for (const strain of strains.values()) {
      if (strain.state === 'extinct' || strain.state === 'promoted') continue;

      const survived = testStrainAgainstAttack(strain, sim);
      if (survived) {
        strain.attacksSurvived++;
        strain.survivalScore = Math.min(100, strain.survivalScore + 2);
        strain.state = 'surviving';
      } else {
        strain.attacksFailed++;
        strain.survivalScore = Math.max(0, strain.survivalScore - 5);
        if (strain.survivalScore < 20) strain.state = 'extinct';
      }
    }

    return sim;
  }

  function testStrainAgainstAttack(strain: DefenseStrain, attack: AttackSimulation): boolean {
    // Check if any rule matches the attack
    for (const rule of strain.rules) {
      const patternMatch = attack.vectors.some(v =>
        v.toLowerCase().includes(rule.pattern.toLowerCase())
      );
      if (patternMatch && rule.confidence > 0.5) {
        // Sensitivity check — lower sensitivity catches more
        if (rule.sensitivity <= attack.intensity / 100) {
          return true;
        }
      }
    }
    return strain.rules.length > 0 && Math.random() < strain.survivalScore / 200;
  }

  function breed(): DefenseStrain | null {
    const survivors = [...strains.values()]
      .filter(s => s.state === 'surviving' && s.survivalScore >= survivalThreshold)
      .sort((a, b) => b.survivalScore - a.survivalScore);

    if (survivors.length < 2) return null;

    const parentA = survivors[0];
    const parentB = survivors[Math.floor(Math.random() * Math.min(5, survivors.length))];

    // Crossover rules
    const childRules: DefenseRule[] = [];
    const allRules = [...parentA.rules, ...parentB.rules];
    for (const rule of allRules) {
      if (Math.random() < 0.6) { // 60% chance to inherit each rule
        const mutatedRule = { ...rule, source: 'bred' as const };
        // Apply mutation
        if (Math.random() < breedingRate) {
          mutatedRule.sensitivity = Math.max(0, Math.min(1, mutatedRule.sensitivity + (Math.random() - 0.5) * 0.2));
          mutatedRule.confidence = Math.max(0.1, Math.min(1, mutatedRule.confidence + (Math.random() - 0.5) * 0.1));
          mutatedRule.source = 'mutated';
        }
        childRules.push(mutatedRule);
      }
    }

    const child: DefenseStrain = {
      id: nextId('def'),
      name: `${parentA.name}×${parentB.name}-G${generation}`,
      generation,
      parentIds: [parentA.id, parentB.id],
      rules: childRules,
      survivalScore: (parentA.survivalScore + parentB.survivalScore) / 2 * 0.8, // Start slightly lower
      attacksSurvived: 0,
      attacksFailed: 0,
      state: 'candidate',
      createdAt: Date.now(),
    };

    strains.set(child.id, child);
    return child;
  }

  function runGeneration(): BreedingResult {
    generation++;

    // Breed new strains
    const breedCount = Math.ceil([...strains.values()].filter(s => s.state === 'surviving').length * 0.3);
    for (let i = 0; i < breedCount; i++) breed();

    // Cull excess
    const active = [...strains.values()].filter(s => s.state !== 'extinct');
    if (active.length > maxStrains) {
      active.sort((a, b) => a.survivalScore - b.survivalScore);
      for (let i = 0; i < active.length - maxStrains; i++) {
        active[i].state = 'extinct';
      }
    }

    // Promote top performers
    const promoted = [...strains.values()]
      .filter(s => s.state === 'surviving' && s.survivalScore >= 90 && s.attacksSurvived >= 5);
    for (const s of promoted) s.state = 'promoted';

    const allActive = [...strains.values()].filter(s => s.state !== 'extinct');
    const result: BreedingResult = {
      generation,
      strainsTested: allActive.length,
      survived: allActive.filter(s => s.state === 'surviving').length,
      extinct: [...strains.values()].filter(s => s.state === 'extinct').length,
      promoted: promoted.length,
      bestStrain: allActive.sort((a, b) => b.survivalScore - a.survivalScore)[0]?.id ?? '',
      bestScore: allActive[0]?.survivalScore ?? 0,
    };

    results.push(result);
    return result;
  }

  return {
    seedStrain,
    simulateAttack,
    breed,
    runGeneration,
    getStrain: (id: string) => strains.get(id),
    listStrains: (state?: DefenseState) => {
      const all = [...strains.values()];
      return state ? all.filter(s => s.state === state) : all;
    },
    getBreedingResults: () => [...results],
    getCurrentGeneration: () => generation,
    stats: () => ({
      totalStrains: strains.size,
      generation,
      activeStrains: [...strains.values()].filter(s => s.state !== 'extinct').length,
      promotedStrains: [...strains.values()].filter(s => s.state === 'promoted').length,
      totalSimulations: simulations.length,
    }),
  };
}
