/**
 * Evolution Mesh — Pattern & Anti-Pattern Library
 * Curated collection of successful patterns and known anti-patterns.
 * RCA-indexed for lookup by failure category.
 */

export type PatternType = 'pattern' | 'anti_pattern';

export interface PatternEntry {
  id: string;
  type: PatternType;
  name: string;
  description: string;
  category: string;
  /** When this pattern applies */
  applicableWhen: string;
  /** What to do (pattern) or what NOT to do (anti-pattern) */
  guidance: string;
  /** Root cause analysis categories this maps to */
  rcaCategories: string[];
  /** Related archetypes */
  archetypes: string[];
  /** Success rate when pattern is followed */
  observedSuccessRate?: number;
  /** Times this pattern was referenced */
  referenceCount: number;
  /** Evidence trail */
  evidenceIds: string[];
  createdAt: number;
  updatedAt: number;
}

const library = new Map<string, PatternEntry>();
let patternCounter = 0;

// ── SEED: Built-in patterns ──
const SEED_PATTERNS: Omit<PatternEntry, 'id' | 'referenceCount' | 'evidenceIds' | 'createdAt' | 'updatedAt'>[] = [
  {
    type: 'pattern',
    name: 'Pre-Flight Schema Validation',
    description: 'Always validate inputs against schema before mutation execution.',
    category: 'input_handling',
    applicableWhen: 'Any mutation that accepts external input.',
    guidance: 'Run validateInput() against the executor schema. Reject early on shape_alien or empty_shell archetypes.',
    rcaCategories: ['schema_violation', 'input_quality'],
    archetypes: ['shape_alien', 'empty_shell', 'type_mismatch'],
    observedSuccessRate: 0.94,
  },
  {
    type: 'pattern',
    name: 'Deterministic Repair Before Escalation',
    description: 'Always attempt deterministic repair before escalating to safe-fail.',
    category: 'repair',
    applicableWhen: 'Input classified as repairable archetype (type_mismatch, missing_required).',
    guidance: 'Run deterministicRepair() pipeline. Apply learned rules. Only escalate if all strategies exhausted.',
    rcaCategories: ['repair_gap'],
    archetypes: ['type_mismatch', 'missing_required', 'partial_valid'],
    observedSuccessRate: 0.78,
  },
  {
    type: 'pattern',
    name: 'Shadow Mode for High-Risk Mutations',
    description: 'Run candidate mutations in shadow mode before production application.',
    category: 'safety',
    applicableWhen: 'Mutations with risk_score > 0.3 or affecting > 3 modules.',
    guidance: 'Use shadow() to run baseline and candidate in parallel. Only promote if match && no performance degradation.',
    rcaCategories: ['architecture', 'regression'],
    archetypes: [],
    observedSuccessRate: 0.91,
  },
  {
    type: 'pattern',
    name: 'Atomic Rollback',
    description: 'Always capture full state before mutation. Never allow partial rollbacks.',
    category: 'rollback',
    applicableWhen: 'Any mutation that modifies production state.',
    guidance: 'Snapshot all affected module configs, prompts, weights, and rules. Restore ALL or NONE.',
    rcaCategories: ['architecture'],
    archetypes: [],
    observedSuccessRate: 0.99,
  },
  {
    type: 'anti_pattern',
    name: 'Partial State Rollback',
    description: 'Never roll back individual modules — inconsistent state is worse than full revert.',
    category: 'rollback',
    applicableWhen: 'Multi-module mutations where only some modules show regression.',
    guidance: 'DO NOT selectively revert. Full atomic rollback or no rollback. Partial reverts create hidden state bugs.',
    rcaCategories: ['architecture'],
    archetypes: [],
  },
  {
    type: 'anti_pattern',
    name: 'Repair Without Validation',
    description: 'Never apply repair output without re-validating the repaired input.',
    category: 'repair',
    applicableWhen: 'After any deterministic repair pass.',
    guidance: 'DO NOT trust repair output blindly. Re-validate repaired input against schema before proceeding.',
    rcaCategories: ['repair_gap', 'schema_violation'],
    archetypes: ['type_mismatch', 'partial_valid'],
  },
  {
    type: 'anti_pattern',
    name: 'Stacking Evolutions Without Cooldown',
    description: 'Do not apply multiple evolutions in rapid succession without monitoring gaps.',
    category: 'evolution_cadence',
    applicableWhen: 'When evolution budget allows multiple applications per day.',
    guidance: 'DO NOT stack evolutions within 30 minutes. Allow monitoring period to detect delayed regressions.',
    rcaCategories: ['performance', 'regression'],
    archetypes: [],
  },
  {
    type: 'pattern',
    name: 'Warm-Up Before High-Stakes Mutations',
    description: 'Run warm-up sequence before complex mutations to verify executor readiness.',
    category: 'preparation',
    applicableWhen: 'Mutations scored as "complex" or "critical" by complexity scorer.',
    guidance: 'Execute full warm-up: schema_check → repair_check → shadow_dry_run → rollback_verify.',
    rcaCategories: ['operational'],
    archetypes: [],
    observedSuccessRate: 0.88,
  },
];

// Initialize seed patterns
function seedLibrary(): void {
  if (library.size > 0) return;
  for (const seed of SEED_PATTERNS) {
    const id = `pat_${++patternCounter}`;
    library.set(id, {
      ...seed,
      id,
      referenceCount: 0,
      evidenceIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
}

seedLibrary();

/**
 * Add a pattern or anti-pattern to the library.
 */
export function addPattern(entry: Omit<PatternEntry, 'id' | 'referenceCount' | 'evidenceIds' | 'createdAt' | 'updatedAt'>): PatternEntry {
  const id = `pat_${++patternCounter}`;
  const pattern: PatternEntry = {
    ...entry,
    id,
    referenceCount: 0,
    evidenceIds: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  library.set(id, pattern);
  return pattern;
}

/**
 * Find patterns relevant to a given RCA category.
 */
export function findPatternsByRCA(rcaCategory: string): PatternEntry[] {
  return Array.from(library.values())
    .filter(p => p.rcaCategories.includes(rcaCategory))
    .sort((a, b) => b.referenceCount - a.referenceCount);
}

/**
 * Find patterns relevant to an archetype.
 */
export function findPatternsByArchetype(archetype: string): PatternEntry[] {
  return Array.from(library.values())
    .filter(p => p.archetypes.includes(archetype))
    .sort((a, b) => b.referenceCount - a.referenceCount);
}

/**
 * Record a pattern reference (increments usage count).
 */
export function referencePattern(patternId: string, evidenceId?: string): void {
  const pattern = library.get(patternId);
  if (!pattern) return;
  pattern.referenceCount++;
  if (evidenceId) pattern.evidenceIds.push(evidenceId);
  pattern.updatedAt = Date.now();
}

/**
 * Get all patterns of a given type.
 */
export function getPatterns(type?: PatternType): PatternEntry[] {
  return Array.from(library.values())
    .filter(p => !type || p.type === type)
    .sort((a, b) => b.referenceCount - a.referenceCount);
}

/**
 * Get library statistics.
 */
export function getLibraryStats(): {
  totalPatterns: number;
  totalAntiPatterns: number;
  mostReferenced: Array<{ name: string; references: number }>;
  categories: string[];
} {
  const all = Array.from(library.values());
  return {
    totalPatterns: all.filter(p => p.type === 'pattern').length,
    totalAntiPatterns: all.filter(p => p.type === 'anti_pattern').length,
    mostReferenced: all
      .sort((a, b) => b.referenceCount - a.referenceCount)
      .slice(0, 5)
      .map(p => ({ name: p.name, references: p.referenceCount })),
    categories: [...new Set(all.map(p => p.category))],
  };
}
