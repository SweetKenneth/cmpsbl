/**
 * DEFENSE — Attack Surface Mapping v2.0.0 (#36)
 * Builds a comprehensive attack surface inventory from scanner
 * findings + DEFENSE threat intelligence.
 *
 * v2 optimizations:
 *  - Pre-indexed findings by filePath for O(1) endpoint matching
 *  - Pre-filtered security findings for RLS gap pass
 *  - Single-pass risk distribution calculation
 */

export interface AttackSurfaceEntry {
  entryId: string;
  type: 'endpoint' | 'storage_bucket' | 'rls_gap' | 'secret_exposure' | 'unauthed_route';
  path: string;
  exposureLevel: 'public' | 'authenticated' | 'admin' | 'internal';
  attackVectors: string[];
  relatedFindings: string[];
  riskScore: number;
  mitigations: string[];
  mitigated: boolean;
}

export interface AttackSurfaceMap {
  entries: AttackSurfaceEntry[];
  totalExposed: number;
  criticalExposures: number;
  publicEndpoints: number;
  unmitigatedCount: number;
  riskDistribution: Record<string, number>;
  topRecommendations: string[];
  generatedAt: string;
}

interface ScanFinding {
  id: string;
  category: string;
  severity: number;
  filePath?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

interface ThreatSignature {
  id: string;
  attackVector: string;
  targetCategory: string;
  severity: number;
}

// Pre-filter categories that generate surface entries
const SECURITY_CATEGORIES = new Set(['rls_policy', 'security']);

/**
 * Build attack surface map from scanner findings and threat intelligence
 */
export function buildAttackSurfaceMap(
  findings: ScanFinding[],
  threats: ThreatSignature[],
  knownEndpoints: Array<{ path: string; method: string; auth: boolean }> = [],
): AttackSurfaceMap {
  // Pre-index: findings by filePath for O(1) endpoint matching
  const findingsByPath = new Map<string, ScanFinding[]>();
  const securityFindings: ScanFinding[] = [];

  for (const f of findings) {
    if (f.filePath) {
      const arr = findingsByPath.get(f.filePath);
      if (arr) arr.push(f); else findingsByPath.set(f.filePath, [f]);
    }
    if (SECURITY_CATEGORIES.has(f.category)) {
      securityFindings.push(f);
    }
  }

  // Pre-collect threat vectors for security categories
  const securityVectors: string[] = [];
  for (const t of threats) {
    if (SECURITY_CATEGORIES.has(t.targetCategory)) {
      securityVectors.push(t.attackVector);
    }
  }

  const entries: AttackSurfaceEntry[] = [];
  let entryId = 0;
  const riskDist = { critical: 0, high: 0, medium: 0, low: 0 };
  let publicCount = 0;
  let unmitigatedCount = 0;

  // Pass 1: Endpoints
  for (const ep of knownEndpoints) {
    // Find related findings via path index + description scan
    const relatedIds: string[] = [];
    const pathFindings = findingsByPath.get(ep.path);
    if (pathFindings) {
      for (const f of pathFindings) relatedIds.push(f.id);
    }
    // Also check description mentions (only for findings not already matched)
    for (const f of findings) {
      if (!relatedIds.includes(f.id) && f.description.includes(ep.path)) {
        relatedIds.push(f.id);
      }
    }

    const riskScore = calculateEndpointRisk(ep.auth, relatedIds.length, securityVectors.length);
    const mitigated = ep.auth && relatedIds.length === 0;
    const isPublic = !ep.auth;

    entries.push({
      entryId: `surface_${++entryId}`,
      type: ep.auth ? 'endpoint' : 'unauthed_route',
      path: `${ep.method} ${ep.path}`,
      exposureLevel: ep.auth ? 'authenticated' : 'public',
      attackVectors: securityVectors,
      relatedFindings: relatedIds,
      riskScore,
      mitigations: ep.auth ? ['authentication required'] : [],
      mitigated,
    });

    // Accumulate stats inline
    if (isPublic) publicCount++;
    if (!mitigated) unmitigatedCount++;
    if (riskScore >= 80) riskDist.critical++;
    else if (riskScore >= 60) riskDist.high++;
    else if (riskScore >= 30) riskDist.medium++;
    else riskDist.low++;
  }

  // Pass 2: Security findings → RLS gaps / secret exposures
  for (const f of securityFindings) {
    const vectors: string[] = [];
    for (const t of threats) {
      if (t.targetCategory === f.category) vectors.push(t.attackVector);
    }
    const riskScore = Math.min(100, f.severity * 10);

    entries.push({
      entryId: `surface_${++entryId}`,
      type: f.category === 'rls_policy' ? 'rls_gap' : 'secret_exposure',
      path: f.filePath ?? 'unknown',
      exposureLevel: 'public',
      attackVectors: vectors,
      relatedFindings: [f.id],
      riskScore,
      mitigations: [],
      mitigated: false,
    });

    publicCount++;
    unmitigatedCount++;
    if (riskScore >= 80) riskDist.critical++;
    else if (riskScore >= 60) riskDist.high++;
    else if (riskScore >= 30) riskDist.medium++;
    else riskDist.low++;
  }

  // Sort by risk (in-place)
  entries.sort((a, b) => b.riskScore - a.riskScore);

  return {
    entries,
    totalExposed: entries.length,
    criticalExposures: riskDist.critical,
    publicEndpoints: publicCount,
    unmitigatedCount,
    riskDistribution: riskDist,
    topRecommendations: generateRecommendations(entries),
    generatedAt: new Date().toISOString(),
  };
}

function calculateEndpointRisk(auth: boolean, findingCount: number, threatCount: number): number {
  return Math.min(100, (auth ? 20 : 50) + Math.min(30, findingCount * 10) + Math.min(20, threatCount * 5));
}

function generateRecommendations(entries: AttackSurfaceEntry[]): string[] {
  const recs: string[] = [];
  let unauthed = 0, rlsGaps = 0, critical = 0;
  for (const e of entries) {
    if (e.exposureLevel === 'public' && !e.mitigated) unauthed++;
    if (e.type === 'rls_gap') rlsGaps++;
    if (e.riskScore >= 80) critical++;
  }
  if (unauthed > 0) recs.push(`Add authentication to ${unauthed} public endpoints`);
  if (rlsGaps > 0) recs.push(`Close ${rlsGaps} RLS policy gaps`);
  if (critical > 0) recs.push(`Remediate ${critical} critical-risk surface entries immediately`);
  return recs.slice(0, 5);
}
