/**
 * FORGE Ultimate #3 — Material Science Engine (Dependency Analyzer)
 * Analyzes "materials" (modules, resolvers, APIs) for compatibility.
 * Strength scoring, substitution suggestions, conflict detection.
 */

// ── Types ──

export interface Material {
  id: string;
  name: string;
  type: 'module' | 'resolver' | 'api' | 'library';
  strengthScore: number;        // 0-100 battle-tested rating
  usageCount: number;
  lastUsedAt: number;
  deprecated: boolean;
  deprecationReason?: string;
  substitutes: string[];        // Material IDs
}

export interface CompatibilityResult {
  materialA: string;
  materialB: string;
  compatible: boolean;
  score: number;                // 0-1
  warnings: string[];
  recommendation: string;
}

export interface MaterialReport {
  totalMaterials: number;
  avgStrength: number;
  deprecatedCount: number;
  conflictCount: number;
  topMaterials: { id: string; strength: number }[];
  weakMaterials: { id: string; strength: number }[];
}

// ── State ──

const materials = new Map<string, Material>();
const conflicts = new Map<string, string[]>(); // materialId → conflicting IDs
const EMA_ALPHA = 0.2;

// ── Core ──

export function registerMaterial(id: string, name: string, type: Material['type'], initialStrength?: number): Material {
  const mat: Material = {
    id, name, type,
    strengthScore: initialStrength ?? 50,
    usageCount: 0, lastUsedAt: Date.now(),
    deprecated: false, substitutes: [],
  };
  materials.set(id, mat);
  return mat;
}

export function recordUsage(materialId: string, success: boolean): void {
  const mat = materials.get(materialId);
  if (!mat) return;
  mat.usageCount++;
  mat.lastUsedAt = Date.now();
  // EMA strength update
  const outcome = success ? 100 : 0;
  mat.strengthScore = Math.round((EMA_ALPHA * outcome + (1 - EMA_ALPHA) * mat.strengthScore) * 10) / 10;
}

export function deprecateMaterial(id: string, reason: string, substituteIds?: string[]): boolean {
  const mat = materials.get(id);
  if (!mat) return false;
  mat.deprecated = true;
  mat.deprecationReason = reason;
  if (substituteIds) mat.substitutes = substituteIds;
  return true;
}

export function registerConflict(materialA: string, materialB: string): void {
  const aConflicts = conflicts.get(materialA) ?? [];
  const bConflicts = conflicts.get(materialB) ?? [];
  if (!aConflicts.includes(materialB)) aConflicts.push(materialB);
  if (!bConflicts.includes(materialA)) bConflicts.push(materialA);
  conflicts.set(materialA, aConflicts);
  conflicts.set(materialB, bConflicts);
}

export function checkCompatibility(materialAId: string, materialBId: string): CompatibilityResult {
  const a = materials.get(materialAId);
  const b = materials.get(materialBId);
  const warnings: string[] = [];

  if (!a || !b) {
    return { materialA: materialAId, materialB: materialBId, compatible: false, score: 0, warnings: ['Material not found'], recommendation: 'Register materials first' };
  }

  // Check direct conflicts
  const aConflicts = conflicts.get(materialAId) ?? [];
  if (aConflicts.includes(materialBId)) {
    warnings.push('Direct conflict registered');
    return { materialA: materialAId, materialB: materialBId, compatible: false, score: 0, warnings, recommendation: `Use ${a.substitutes[0] ?? b.substitutes[0] ?? 'alternative'} instead` };
  }

  // Check deprecation
  if (a.deprecated) warnings.push(`${a.name} is deprecated: ${a.deprecationReason}`);
  if (b.deprecated) warnings.push(`${b.name} is deprecated: ${b.deprecationReason}`);

  // Strength-based compatibility score
  const avgStrength = (a.strengthScore + b.strengthScore) / 200;
  const deprecationPenalty = (a.deprecated ? 0.3 : 0) + (b.deprecated ? 0.3 : 0);
  const score = Math.max(0, Math.round((avgStrength - deprecationPenalty) * 1000) / 1000);

  return {
    materialA: materialAId, materialB: materialBId,
    compatible: score > 0.3 && !a.deprecated && !b.deprecated,
    score, warnings,
    recommendation: score > 0.7 ? 'Excellent pairing' : score > 0.4 ? 'Acceptable with monitoring' : 'Consider alternatives',
  };
}

export function getSuggestedSubstitutes(materialId: string): Material[] {
  const mat = materials.get(materialId);
  if (!mat) return [];
  return mat.substitutes.map(id => materials.get(id)).filter((m): m is Material => !!m);
}

export function getMaterialReport(): MaterialReport {
  const all = Array.from(materials.values());
  const sorted = [...all].sort((a, b) => b.strengthScore - a.strengthScore);
  let conflictCount = 0;
  for (const c of conflicts.values()) conflictCount += c.length;

  return {
    totalMaterials: all.length,
    avgStrength: all.length > 0 ? Math.round(all.reduce((s, m) => s + m.strengthScore, 0) / all.length) : 0,
    deprecatedCount: all.filter(m => m.deprecated).length,
    conflictCount: Math.floor(conflictCount / 2), // Each conflict counted twice
    topMaterials: sorted.slice(0, 5).map(m => ({ id: m.id, strength: m.strengthScore })),
    weakMaterials: sorted.slice(-5).reverse().map(m => ({ id: m.id, strength: m.strengthScore })),
  };
}

export function resetMaterialState(): void { materials.clear(); conflicts.clear(); }
