/**
 * IMMUNITY Ultimate — Pathogen Evolution Tracker
 * 
 * Tracks how attack patterns mutate over time and pre-generates
 * defenses for predicted variants.
 * 
 * - Mutation tree modeling: signature drift across threat families
 * - Predictive variant generation
 * - Evasion technique catalog
 * - Arms race scoring
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface PathogenVariant {
  id: string;
  family: string;
  generation: number;
  signature: string;
  parentId: string | null;
  firstSeenAt: number;
  frequency: number;
  evasionTechniques: string[];
}

export interface MutationEdge {
  fromVariantId: string;
  toVariantId: string;
  mutationType: 'polymorphic' | 'obfuscation' | 'structural' | 'behavioral';
  detectedAt: number;
}

export interface PredictedVariant {
  baseVariantId: string;
  predictedSignature: string;
  probability: number;
  generatedAt: number;
  confirmed: boolean;
}

export interface ArmsRaceScore {
  family: string;
  defenseGenerations: number;
  attackGenerations: number;
  velocityRatio: number;       // >1 = defense ahead, <1 = attack ahead
  status: 'ahead' | 'parity' | 'behind';
}

export interface EvolutionTrackerHealth {
  trackedFamilies: number;
  totalVariants: number;
  mutationEdges: number;
  predictedVariants: number;
  confirmedPredictions: number;
  avgArmsRaceScore: number;
}

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const MAX_VARIANTS = 3000;

const variants = new Map<string, PathogenVariant>();
const familyTrees = new Map<string, string[]>();      // family → variant IDs ordered by generation
const mutationEdges: MutationEdge[] = [];
const predictions: PredictedVariant[] = [];
const evasionCatalog = new Map<string, number>();      // technique → occurrence count
const armsRaceScores = new Map<string, ArmsRaceScore>();

// ═══════════════════════════════════════════════════════════════
// CORE LOGIC
// ═══════════════════════════════════════════════════════════════

/** Register a new pathogen variant */
export function registerVariant(
  family: string,
  signature: string,
  parentId: string | null,
  evasionTechniques: string[] = [],
): PathogenVariant {
  const parentGen = parentId ? (variants.get(parentId)?.generation ?? 0) : 0;

  const variant: PathogenVariant = {
    id: `pv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    family,
    generation: parentGen + 1,
    signature,
    parentId,
    firstSeenAt: Date.now(),
    frequency: 1,
    evasionTechniques: [...evasionTechniques],
  };

  variants.set(variant.id, variant);

  // Update family tree
  const tree = familyTrees.get(family) ?? [];
  tree.push(variant.id);
  familyTrees.set(family, tree);

  // Record mutation edge
  if (parentId) {
    mutationEdges.push({
      fromVariantId: parentId,
      toVariantId: variant.id,
      mutationType: classifyMutation(parentId, variant),
      detectedAt: Date.now(),
    });
  }

  // Update evasion catalog
  for (const tech of evasionTechniques) {
    evasionCatalog.set(tech, (evasionCatalog.get(tech) ?? 0) + 1);
  }

  // Check if this confirms any prediction
  for (const pred of predictions) {
    if (!pred.confirmed && pred.predictedSignature === signature) {
      pred.confirmed = true;
    }
  }

  // Evict if over cap
  if (variants.size > MAX_VARIANTS) {
    const oldest = Array.from(variants.entries())
      .sort((a, b) => a[1].firstSeenAt - b[1].firstSeenAt)[0];
    if (oldest) variants.delete(oldest[0]);
  }

  return variant;
}

/** Generate predicted variants for a family */
export function predictVariants(family: string, count = 3): PredictedVariant[] {
  const tree = familyTrees.get(family);
  if (!tree || tree.length === 0) return [];

  const latest = variants.get(tree[tree.length - 1]);
  if (!latest) return [];

  const generated: PredictedVariant[] = [];
  const topEvasions = Array.from(evasionCatalog.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(e => e[0]);

  for (let i = 0; i < count; i++) {
    const mutated = mutatePrediction(latest.signature, i, topEvasions);
    const pred: PredictedVariant = {
      baseVariantId: latest.id,
      predictedSignature: mutated,
      probability: Math.round((0.8 - i * 0.15) * 100) / 100,
      generatedAt: Date.now(),
      confirmed: false,
    };
    predictions.push(pred);
    generated.push(pred);
  }

  if (predictions.length > 500) predictions.splice(0, predictions.length - 500);
  return generated;
}

/** Compute arms race score for a family */
export function computeArmsRace(family: string, defenseGenerations: number): ArmsRaceScore {
  const tree = familyTrees.get(family) ?? [];
  const attackGens = tree.length > 0
    ? Math.max(...tree.map(id => variants.get(id)?.generation ?? 0))
    : 0;

  const ratio = attackGens > 0 ? defenseGenerations / attackGens : 1;
  const status: ArmsRaceScore['status'] =
    ratio > 1.1 ? 'ahead' : ratio < 0.9 ? 'behind' : 'parity';

  const score: ArmsRaceScore = {
    family,
    defenseGenerations,
    attackGenerations: attackGens,
    velocityRatio: Math.round(ratio * 100) / 100,
    status,
  };

  armsRaceScores.set(family, score);
  return score;
}

/** Get mutation tree for a family */
export function getMutationTree(family: string): PathogenVariant[] {
  const tree = familyTrees.get(family) ?? [];
  return tree
    .map(id => variants.get(id))
    .filter((v): v is PathogenVariant => v !== undefined)
    .sort((a, b) => a.generation - b.generation);
}

/** Get top evasion techniques */
export function getTopEvasionTechniques(limit = 10): Array<{ technique: string; count: number }> {
  return Array.from(evasionCatalog.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([technique, count]) => ({ technique, count }));
}

function classifyMutation(parentId: string, child: PathogenVariant): MutationEdge['mutationType'] {
  const parent = variants.get(parentId);
  if (!parent) return 'structural';
  if (child.evasionTechniques.length > parent.evasionTechniques.length) return 'obfuscation';
  if (child.signature.length !== parent.signature.length) return 'structural';
  return 'polymorphic';
}

function mutatePrediction(sig: string, index: number, evasions: string[]): string {
  const chars = sig.split('');
  const pos = (sig.length * (index + 1)) % Math.max(1, chars.length);
  chars[pos] = String.fromCharCode(chars[pos].charCodeAt(0) + 1);
  return chars.join('') + (evasions[index] ? `_${evasions[index]}` : '');
}

/** Get health summary */
export function getEvolutionTrackerHealth(): EvolutionTrackerHealth {
  const confirmed = predictions.filter(p => p.confirmed).length;
  const scores = Array.from(armsRaceScores.values());
  const avgScore = scores.length > 0
    ? scores.reduce((s, a) => s + a.velocityRatio, 0) / scores.length
    : 1;

  return {
    trackedFamilies: familyTrees.size,
    totalVariants: variants.size,
    mutationEdges: mutationEdges.length,
    predictedVariants: predictions.length,
    confirmedPredictions: confirmed,
    avgArmsRaceScore: Math.round(avgScore * 100) / 100,
  };
}
