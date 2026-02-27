/**
 * Pack Density Protection — Internal Release Safety
 * 
 * Prevents pack releases from unbalancing the ecosystem.
 * Scores each pack's "density" based on crystallized pipeline count,
 * component complexity, and overlap with other packs.
 */

import { ARTIFACT_PACKS, type ArtifactPack } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// DENSITY SCORING
// ═══════════════════════════════════════════════════════════════════════════════

export interface PackDensityReport {
  packId: string;
  packName: string;
  componentCount: number;
  crystallizedCount: number;
  densityScore: number;        // 0–1
  overlapPercent: number;      // 0–100: % of components shared with other packs
  overlapPacks: string[];      // IDs of packs with shared components
}

export interface EcosystemDensityReport {
  packs: PackDensityReport[];
  avgDensity: number;
  maxDensity: number;
  totalCrystallized: number;
  totalComponents: number;
  uniqueComponents: number;
}

// Thresholds — internal admin config
export const DENSITY_THRESHOLDS = {
  /** Max crystallized pipelines per pack */
  maxCrystallizedPerPack: 4,
  /** Warning threshold for crystallized per pack */
  warnCrystallizedPerPack: 3,
  /** Max density score for any single pack */
  maxPackDensity: 0.85,
  /** Max average density across all packs */
  maxAvgDensity: 0.65,
  /** Max component overlap % before warning */
  maxOverlapPercent: 40,
} as const;

/**
 * Compute density score for a single pack.
 * Score = weighted combination of crystallized ratio + component count normalization.
 */
function computePackDensity(pack: ArtifactPack): number {
  const crystallizedRatio = pack._crystallizedPipelines.length / Math.max(1, pack.components.length + pack._crystallizedPipelines.length);
  const componentWeight = Math.min(1, pack.components.length / 8); // Normalize against 8 components
  return crystallizedRatio * 0.6 + componentWeight * 0.4;
}

/**
 * Compute component overlap for a pack against all other packs.
 */
function computeOverlap(pack: ArtifactPack, allPacks: ArtifactPack[]): { percent: number; overlapping: string[] } {
  const myComponents = new Set([...pack.components, ...pack._crystallizedPipelines]);
  const overlapping: string[] = [];

  for (const other of allPacks) {
    if (other.id === pack.id) continue;
    const otherComponents = new Set([...other.components, ...other._crystallizedPipelines]);
    let shared = 0;
    for (const c of myComponents) {
      if (otherComponents.has(c)) shared++;
    }
    if (shared > 0) overlapping.push(other.id);
  }

  // Count total shared components across all other packs
  const allOtherComponents = new Set<string>();
  for (const other of allPacks) {
    if (other.id === pack.id) continue;
    for (const c of [...other.components, ...other._crystallizedPipelines]) {
      allOtherComponents.add(c);
    }
  }
  let sharedCount = 0;
  for (const c of myComponents) {
    if (allOtherComponents.has(c)) sharedCount++;
  }

  const percent = myComponents.size > 0 ? (sharedCount / myComponents.size) * 100 : 0;
  return { percent, overlapping };
}

/**
 * Generate a full ecosystem density report for all 24 packs.
 */
export function computeEcosystemDensity(packs: ArtifactPack[] = ARTIFACT_PACKS): EcosystemDensityReport {
  const allComponents = new Set<string>();
  let totalComponents = 0;
  let totalCrystallized = 0;

  const reports: PackDensityReport[] = packs.map(pack => {
    const densityScore = computePackDensity(pack);
    const overlap = computeOverlap(pack, packs);

    for (const c of pack.components) allComponents.add(c);
    for (const c of pack._crystallizedPipelines) allComponents.add(c);
    totalComponents += pack.components.length;
    totalCrystallized += pack._crystallizedPipelines.length;

    return {
      packId: pack.id,
      packName: pack.name,
      componentCount: pack.components.length,
      crystallizedCount: pack._crystallizedPipelines.length,
      densityScore,
      overlapPercent: Math.round(overlap.percent),
      overlapPacks: overlap.overlapping,
    };
  });

  const avgDensity = reports.length > 0 ? reports.reduce((s, r) => s + r.densityScore, 0) / reports.length : 0;
  const maxDensity = reports.length > 0 ? Math.max(...reports.map(r => r.densityScore)) : 0;

  return {
    packs: reports,
    avgDensity,
    maxDensity,
    totalCrystallized,
    totalComponents,
    uniqueComponents: allComponents.size,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// RELEASE VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface ValidationIssue {
  packId: string;
  packName: string;
  severity: 'error' | 'warning';
  rule: string;
  message: string;
  value: number;
  threshold: number;
}

export interface ReleaseValidation {
  canRelease: boolean;
  issues: ValidationIssue[];
  ecosystem: EcosystemDensityReport;
}

/**
 * Validate whether a pack (or the ecosystem) is safe to release.
 * Returns blocking errors and warnings.
 */
export function validatePackRelease(targetPackId?: string): ReleaseValidation {
  const ecosystem = computeEcosystemDensity();
  const issues: ValidationIssue[] = [];

  const packsToCheck = targetPackId
    ? ecosystem.packs.filter(p => p.packId === targetPackId)
    : ecosystem.packs;

  for (const pack of packsToCheck) {
    // Rule 1: Crystallized count per pack
    if (pack.crystallizedCount > DENSITY_THRESHOLDS.maxCrystallizedPerPack) {
      issues.push({
        packId: pack.packId,
        packName: pack.packName,
        severity: 'error',
        rule: 'MAX_CRYSTALLIZED',
        message: `Pack contains ${pack.crystallizedCount} crystallized pipelines (max ${DENSITY_THRESHOLDS.maxCrystallizedPerPack})`,
        value: pack.crystallizedCount,
        threshold: DENSITY_THRESHOLDS.maxCrystallizedPerPack,
      });
    } else if (pack.crystallizedCount > DENSITY_THRESHOLDS.warnCrystallizedPerPack) {
      issues.push({
        packId: pack.packId,
        packName: pack.packName,
        severity: 'warning',
        rule: 'WARN_CRYSTALLIZED',
        message: `Pack is near crystallized limit (${pack.crystallizedCount}/${DENSITY_THRESHOLDS.maxCrystallizedPerPack})`,
        value: pack.crystallizedCount,
        threshold: DENSITY_THRESHOLDS.maxCrystallizedPerPack,
      });
    }

    // Rule 2: Individual pack density
    if (pack.densityScore > DENSITY_THRESHOLDS.maxPackDensity) {
      issues.push({
        packId: pack.packId,
        packName: pack.packName,
        severity: 'error',
        rule: 'MAX_PACK_DENSITY',
        message: `Density score ${pack.densityScore.toFixed(2)} exceeds max ${DENSITY_THRESHOLDS.maxPackDensity}`,
        value: pack.densityScore,
        threshold: DENSITY_THRESHOLDS.maxPackDensity,
      });
    }

    // Rule 3: Overlap
    if (pack.overlapPercent > DENSITY_THRESHOLDS.maxOverlapPercent) {
      issues.push({
        packId: pack.packId,
        packName: pack.packName,
        severity: 'warning',
        rule: 'HIGH_OVERLAP',
        message: `${pack.overlapPercent}% component overlap with other packs`,
        value: pack.overlapPercent,
        threshold: DENSITY_THRESHOLDS.maxOverlapPercent,
      });
    }
  }

  // Rule 4: Ecosystem average density
  if (ecosystem.avgDensity > DENSITY_THRESHOLDS.maxAvgDensity) {
    issues.push({
      packId: '*',
      packName: 'Ecosystem',
      severity: 'error',
      rule: 'MAX_AVG_DENSITY',
      message: `Average ecosystem density ${ecosystem.avgDensity.toFixed(2)} exceeds max ${DENSITY_THRESHOLDS.maxAvgDensity}`,
      value: ecosystem.avgDensity,
      threshold: DENSITY_THRESHOLDS.maxAvgDensity,
    });
  }

  const hasBlocker = issues.some(i => i.severity === 'error');

  return {
    canRelease: !hasBlocker,
    issues,
    ecosystem,
  };
}
