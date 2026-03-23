/**
 * Curriculum Advancement Tracker — EVOLUTION v9.0.0
 * EMA-weighted proficiency scores per mutation type,
 * gating access to higher-risk mutation classes.
 */

// --- Types ---

export type MutationClass =
  | 'config_change'
  | 'schema_migration'
  | 'module_addition'
  | 'module_removal'
  | 'api_change'
  | 'security_patch'
  | 'performance_optimization'
  | 'architectural_refactor';

export type ProficiencyTier = 'novice' | 'competent' | 'proficient' | 'expert' | 'master';

export interface ProficiencyRecord {
  mutationClass: MutationClass;
  successCount: number;
  failureCount: number;
  totalAttempts: number;
  emaScore: number; // 0-1
  tier: ProficiencyTier;
  lastAttempt: number;
  unlocked: boolean;
}

export interface AdvancementResult {
  mutationClass: MutationClass;
  allowed: boolean;
  reason: string;
  currentTier: ProficiencyTier;
  requiredTier: ProficiencyTier;
  emaScore: number;
}

// --- Constants ---

const EMA_ALPHA = 0.25;

const TIER_THRESHOLDS: Record<ProficiencyTier, number> = {
  novice: 0,
  competent: 0.4,
  proficient: 0.6,
  expert: 0.8,
  master: 0.95,
};

const CLASS_REQUIRED_TIER: Record<MutationClass, ProficiencyTier> = {
  config_change: 'novice',
  schema_migration: 'competent',
  module_addition: 'competent',
  module_removal: 'proficient',
  api_change: 'proficient',
  security_patch: 'expert',
  performance_optimization: 'proficient',
  architectural_refactor: 'expert',
};

const CLASS_RISK: Record<MutationClass, number> = {
  config_change: 0.1,
  schema_migration: 0.4,
  module_addition: 0.3,
  module_removal: 0.6,
  api_change: 0.5,
  security_patch: 0.7,
  performance_optimization: 0.4,
  architectural_refactor: 0.8,
};

// --- State ---

const records: Map<MutationClass, ProficiencyRecord> = new Map();

// --- Helpers ---

function getTier(score: number): ProficiencyTier {
  if (score >= TIER_THRESHOLDS.master) return 'master';
  if (score >= TIER_THRESHOLDS.expert) return 'expert';
  if (score >= TIER_THRESHOLDS.proficient) return 'proficient';
  if (score >= TIER_THRESHOLDS.competent) return 'competent';
  return 'novice';
}

function tierIndex(tier: ProficiencyTier): number {
  const order: ProficiencyTier[] = ['novice', 'competent', 'proficient', 'expert', 'master'];
  return order.indexOf(tier);
}

function getOrCreate(mutationClass: MutationClass): ProficiencyRecord {
  let rec = records.get(mutationClass);
  if (!rec) {
    rec = {
      mutationClass,
      successCount: 0,
      failureCount: 0,
      totalAttempts: 0,
      emaScore: 0.5, // neutral prior
      tier: 'novice',
      lastAttempt: 0,
      unlocked: CLASS_REQUIRED_TIER[mutationClass] === 'novice',
    };
    records.set(mutationClass, rec);
  }
  return rec;
}

// --- Core ---

export function recordAttempt(mutationClass: MutationClass, success: boolean): ProficiencyRecord {
  const rec = getOrCreate(mutationClass);
  rec.totalAttempts++;
  if (success) rec.successCount++;
  else rec.failureCount++;

  const sample = success ? 1 : 0;
  rec.emaScore = EMA_ALPHA * sample + (1 - EMA_ALPHA) * rec.emaScore;
  rec.tier = getTier(rec.emaScore);
  rec.lastAttempt = Date.now();
  rec.unlocked = tierIndex(rec.tier) >= tierIndex(CLASS_REQUIRED_TIER[mutationClass]);

  return { ...rec };
}

export function checkAdvancement(mutationClass: MutationClass): AdvancementResult {
  const rec = getOrCreate(mutationClass);
  const requiredTier = CLASS_REQUIRED_TIER[mutationClass];
  const allowed = tierIndex(rec.tier) >= tierIndex(requiredTier);

  return {
    mutationClass,
    allowed,
    reason: allowed
      ? `Tier ${rec.tier} meets requirement ${requiredTier}`
      : `Tier ${rec.tier} below required ${requiredTier} (score: ${rec.emaScore.toFixed(2)})`,
    currentTier: rec.tier,
    requiredTier,
    emaScore: Math.round(rec.emaScore * 100) / 100,
  };
}

export function getProficiency(mutationClass: MutationClass): ProficiencyRecord {
  return { ...getOrCreate(mutationClass) };
}

export function getAllProficiencies(): ProficiencyRecord[] {
  const allClasses: MutationClass[] = [
    'config_change', 'schema_migration', 'module_addition', 'module_removal',
    'api_change', 'security_patch', 'performance_optimization', 'architectural_refactor',
  ];
  return allClasses.map(c => ({ ...getOrCreate(c) }));
}

export function getUnlockedClasses(): MutationClass[] {
  return getAllProficiencies().filter(p => p.unlocked).map(p => p.mutationClass);
}

export function getLockedClasses(): MutationClass[] {
  return getAllProficiencies().filter(p => !p.unlocked).map(p => p.mutationClass);
}

export function getRiskForClass(mutationClass: MutationClass): number {
  return CLASS_RISK[mutationClass] ?? 0.5;
}

export function clearCurriculumState(): void {
  records.clear();
}
