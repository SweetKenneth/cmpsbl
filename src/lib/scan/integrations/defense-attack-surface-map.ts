/**
 * DEFENSE — Attack Surface Mapping (#36)
 * Builds a comprehensive attack surface inventory from scanner
 * findings + DEFENSE threat intelligence, scoring each endpoint
 * by exposure level and known attack vectors.
 */

export interface AttackSurfaceEntry {
  entryId: string;
  type: 'endpoint' | 'storage_bucket' | 'rls_gap' | 'secret_exposure' | 'unauthed_route';
  path: string;
  exposureLevel: 'public' | 'authenticated' | 'admin' | 'internal';
  attackVectors: string[];
  relatedFindings: string[];
  riskScore: number; // 0-100
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

/**
 * Build attack surface map from scanner findings and threat intelligence
 */
export function buildAttackSurfaceMap(
  findings: ScanFinding[],
  threats: ThreatSignature[],
  knownEndpoints: Array<{ path: string; method: string; auth: boolean }> = [],
): AttackSurfaceMap {
  const entries: AttackSurfaceEntry[] = [];

  // Map endpoints to surface entries
  for (const ep of knownEndpoints) {
    const relatedFindings = findings.filter(f =>
      f.filePath?.includes(ep.path) || f.description.includes(ep.path)
    ).map(f => f.id);

    const matchingThreats = threats.filter(t =>
      ['security', 'rls_policy', 'rate_limit'].includes(t.targetCategory)
    );

    const riskScore = calculateEndpointRisk(ep, relatedFindings.length, matchingThreats.length);

    entries.push({
      entryId: `surface_${entries.length + 1}`,
      type: ep.auth ? 'endpoint' : 'unauthed_route',
      path: `${ep.method} ${ep.path}`,
      exposureLevel: ep.auth ? 'authenticated' : 'public',
      attackVectors: matchingThreats.map(t => t.attackVector),
      relatedFindings,
      riskScore,
      mitigations: ep.auth ? ['authentication required'] : [],
      mitigated: ep.auth && relatedFindings.length === 0,
    });
  }

  // Add RLS gap entries from security findings
  for (const f of findings.filter(f => f.category === 'rls_policy' || f.category === 'security')) {
    entries.push({
      entryId: `surface_${entries.length + 1}`,
      type: f.category === 'rls_policy' ? 'rls_gap' : 'secret_exposure',
      path: f.filePath ?? 'unknown',
      exposureLevel: 'public',
      attackVectors: threats.filter(t => t.targetCategory === f.category).map(t => t.attackVector),
      relatedFindings: [f.id],
      riskScore: f.severity * 10,
      mitigations: [],
      mitigated: false,
    });
  }

  entries.sort((a, b) => b.riskScore - a.riskScore);
  const riskDist: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const e of entries) {
    if (e.riskScore >= 80) riskDist.critical++;
    else if (e.riskScore >= 60) riskDist.high++;
    else if (e.riskScore >= 30) riskDist.medium++;
    else riskDist.low++;
  }

  return {
    entries,
    totalExposed: entries.length,
    criticalExposures: riskDist.critical,
    publicEndpoints: entries.filter(e => e.exposureLevel === 'public').length,
    unmitigatedCount: entries.filter(e => !e.mitigated).length,
    riskDistribution: riskDist,
    topRecommendations: generateRecommendations(entries),
    generatedAt: new Date().toISOString(),
  };
}

function calculateEndpointRisk(ep: { auth: boolean }, findingCount: number, threatCount: number): number {
  let risk = ep.auth ? 20 : 50;
  risk += Math.min(30, findingCount * 10);
  risk += Math.min(20, threatCount * 5);
  return Math.min(100, risk);
}

function generateRecommendations(entries: AttackSurfaceEntry[]): string[] {
  const recs: string[] = [];
  const unauthed = entries.filter(e => e.exposureLevel === 'public' && !e.mitigated);
  if (unauthed.length > 0) recs.push(`Add authentication to ${unauthed.length} public endpoints`);
  const rlsGaps = entries.filter(e => e.type === 'rls_gap');
  if (rlsGaps.length > 0) recs.push(`Close ${rlsGaps.length} RLS policy gaps`);
  const critical = entries.filter(e => e.riskScore >= 80);
  if (critical.length > 0) recs.push(`Remediate ${critical.length} critical-risk surface entries immediately`);
  return recs.slice(0, 5);
}
