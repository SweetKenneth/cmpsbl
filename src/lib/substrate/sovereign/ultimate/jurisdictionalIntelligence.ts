/**
 * SOVEREIGN Ultimate — Jurisdictional Intelligence Engine
 * Dynamic regulatory knowledge graph with conflict resolution and adequacy scoring.
 * v9.0.0 "Crown Prime"
 */

// ─── Types ────────────────────────────────────────────────────────

export interface JurisdictionNode {
  code: string;                    // e.g., 'EU', 'DE', 'US-CA'
  name: string;
  parentCode: string | null;       // e.g., 'DE' → 'EU'
  frameworks: string[];            // Applicable frameworks
  adequacyScore: number;           // 0–100
  transferRestrictions: string[];  // Codes of restricted destinations
  dataLocalizationRequired: boolean;
  registeredAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface JurisdictionConflict {
  id: string;
  jurisdictionA: string;
  jurisdictionB: string;
  conflictType: 'transfer_restriction' | 'framework_clash' | 'localization_conflict' | 'retention_mismatch';
  description: string;
  resolution: string | null;
  resolvedAt: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

export interface AdequacyAssessment {
  sourceJurisdiction: string;
  targetJurisdiction: string;
  frameworkCoverage: number;      // 0–100
  enforcementStrength: number;    // 0–100
  transferSafety: number;         // 0–100
  overallScore: number;           // weighted composite
  adequate: boolean;              // score >= threshold
  assessedAt: string;
}

// ─── Storage ──────────────────────────────────────────────────────

const jurisdictionGraph = new Map<string, JurisdictionNode>();
const conflicts: JurisdictionConflict[] = [];
const assessmentCache = new Map<string, AdequacyAssessment>();
const MAX_CONFLICTS = 500;
const ADEQUACY_THRESHOLD = 60;

// ─── Registration ─────────────────────────────────────────────────

export function registerJurisdictionNode(node: Omit<JurisdictionNode, 'registeredAt' | 'updatedAt' | 'adequacyScore'>): JurisdictionNode {
  const full: JurisdictionNode = {
    ...node,
    adequacyScore: 50, // default, computed on assessment
    registeredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  jurisdictionGraph.set(node.code, full);
  return full;
}

export function getJurisdictionNode(code: string): JurisdictionNode | undefined {
  return jurisdictionGraph.get(code);
}

export function getJurisdictionChildren(parentCode: string): JurisdictionNode[] {
  return Array.from(jurisdictionGraph.values()).filter(j => j.parentCode === parentCode);
}

export function getJurisdictionAncestors(code: string): JurisdictionNode[] {
  const ancestors: JurisdictionNode[] = [];
  let current = jurisdictionGraph.get(code);
  while (current?.parentCode) {
    const parent = jurisdictionGraph.get(current.parentCode);
    if (!parent) break;
    ancestors.push(parent);
    current = parent;
  }
  return ancestors;
}

// ─── Conflict Resolution ──────────────────────────────────────────

export function detectJurisdictionConflict(
  codeA: string,
  codeB: string,
  conflictType: JurisdictionConflict['conflictType'],
  description: string
): JurisdictionConflict {
  const conflict: JurisdictionConflict = {
    id: `jc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    jurisdictionA: codeA,
    jurisdictionB: codeB,
    conflictType,
    description,
    resolution: null,
    resolvedAt: null,
    severity: conflictType === 'localization_conflict' ? 'critical' : 'high',
    createdAt: new Date().toISOString(),
  };
  conflicts.push(conflict);
  if (conflicts.length > MAX_CONFLICTS) conflicts.splice(0, conflicts.length - MAX_CONFLICTS);
  return conflict;
}

export function resolveConflict(conflictId: string, resolution: string): boolean {
  const conflict = conflicts.find(c => c.id === conflictId);
  if (!conflict) return false;
  conflict.resolution = resolution;
  conflict.resolvedAt = new Date().toISOString();
  return true;
}

// ─── Adequacy Assessment ──────────────────────────────────────────

/**
 * Assess transfer adequacy between two jurisdictions.
 * adequacy = (framework_coverage × 0.4) + (enforcement_strength × 0.3) + (transfer_safety × 0.3)
 */
export function assessAdequacy(
  sourceCode: string,
  targetCode: string,
  frameworkCoverage: number,
  enforcementStrength: number,
  transferSafety: number
): AdequacyAssessment {
  const overallScore = Math.round(
    frameworkCoverage * 0.4 + enforcementStrength * 0.3 + transferSafety * 0.3
  );

  const assessment: AdequacyAssessment = {
    sourceJurisdiction: sourceCode,
    targetJurisdiction: targetCode,
    frameworkCoverage,
    enforcementStrength,
    transferSafety,
    overallScore,
    adequate: overallScore >= ADEQUACY_THRESHOLD,
    assessedAt: new Date().toISOString(),
  };

  const target = jurisdictionGraph.get(targetCode);
  if (target) {
    target.adequacyScore = overallScore;
    target.updatedAt = new Date().toISOString();
  }

  assessmentCache.set(`${sourceCode}->${targetCode}`, assessment);
  return assessment;
}

// ─── Queries ──────────────────────────────────────────────────────

export function getAllJurisdictions(): JurisdictionNode[] {
  return Array.from(jurisdictionGraph.values());
}

export function getUnresolvedConflicts(): JurisdictionConflict[] {
  return conflicts.filter(c => !c.resolvedAt);
}

export function getAdequacyAssessment(source: string, target: string): AdequacyAssessment | undefined {
  return assessmentCache.get(`${source}->${target}`);
}

export function getJurisdictionIntelligenceHealth(): number {
  const total = jurisdictionGraph.size;
  if (total === 0) return 100;
  const withFrameworks = Array.from(jurisdictionGraph.values()).filter(j => j.frameworks.length > 0).length;
  const unresolvedConflicts = conflicts.filter(c => !c.resolvedAt).length;
  const coverageScore = (withFrameworks / total) * 100;
  const conflictPenalty = Math.min(30, unresolvedConflicts * 5);
  return Math.max(0, Math.round(coverageScore - conflictPenalty));
}
