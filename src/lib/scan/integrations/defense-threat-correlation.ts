/**
 * DEFENSE Threat-Correlated Scanning v2.0.0 (#14)
 * Correlates scanner findings with DEFENSE threat intelligence
 * to prioritize exploitable debt over theoretical vulnerabilities.
 *
 * v2 optimizations:
 *  - Pre-indexed signatures by category for O(1) lookup
 *  - Single-pass correlation with early exits
 *  - Set-based dedup for top threats
 */

export interface ThreatSignature {
  id: string;
  pattern: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  cveId?: string;
  description: string;
  exploitability: number;
  lastSeenInWild: string | null;
}

export interface ThreatCorrelation {
  findingId: string;
  findingCategory: string;
  matchedThreats: ThreatSignature[];
  exploitabilityScore: number;
  attackSurfaceArea: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'none';
  recommendation: string;
}

export interface ThreatCorrelationReport {
  correlations: ThreatCorrelation[];
  exploitableCount: number;
  theoreticalCount: number;
  priorityOverrides: Array<{ findingId: string; newPriority: number; reason: string }>;
  generatedAt: string;
}

// ── Known signatures — static, pre-indexed at module load ──

const KNOWN_SIGNATURES: ThreatSignature[] = [
  { id: 'sig_sql_injection', pattern: 'sql_injection', severity: 'critical', category: 'security', description: 'SQL injection via unparameterized queries', exploitability: 0.95, lastSeenInWild: '2026-02-01' },
  { id: 'sig_rls_bypass', pattern: 'rls_missing', severity: 'critical', category: 'rls_policy', description: 'Missing RLS allows unrestricted data access', exploitability: 0.9, lastSeenInWild: '2026-02-15' },
  { id: 'sig_secret_leak', pattern: 'hardcoded_secret', severity: 'critical', category: 'secret_exposure', description: 'API keys or tokens exposed in client bundle', exploitability: 0.85, lastSeenInWild: '2026-02-20' },
  { id: 'sig_cors_wildcard', pattern: 'cors_wildcard', severity: 'high', category: 'security', description: 'CORS wildcard allows cross-origin data exfiltration', exploitability: 0.7, lastSeenInWild: '2026-01-15' },
  { id: 'sig_no_rate_limit', pattern: 'no_rate_limit', severity: 'high', category: 'security', description: 'Missing rate limiting enables brute force attacks', exploitability: 0.75, lastSeenInWild: '2026-02-10' },
  { id: 'sig_priv_escalation', pattern: 'privilege_escalation', severity: 'critical', category: 'security', description: 'Role boundary bypass allows unauthorized access', exploitability: 0.8, lastSeenInWild: '2026-01-28' },
  { id: 'sig_xss', pattern: 'dangerouslysetinnerhtml', severity: 'high', category: 'security', description: 'XSS via unescaped HTML injection', exploitability: 0.65, lastSeenInWild: '2026-02-05' },
  { id: 'sig_open_redirect', pattern: 'open_redirect', severity: 'medium', category: 'security', description: 'Unvalidated redirects enable phishing', exploitability: 0.5, lastSeenInWild: '2025-12-20' },
];

// Pre-build category index + pattern list for O(1) category match
const sigByCategory = new Map<string, ThreatSignature[]>();
for (const sig of KNOWN_SIGNATURES) {
  const arr = sigByCategory.get(sig.category);
  if (arr) arr.push(sig); else sigByCategory.set(sig.category, [sig]);
}

/** Risk classification thresholds */
function classifyRisk(score: number): ThreatCorrelation['riskLevel'] {
  if (score > 0.8) return 'critical';
  if (score > 0.6) return 'high';
  if (score > 0.3) return 'medium';
  if (score > 0) return 'low';
  return 'none';
}

const RECOMMENDATION_MAP: Record<ThreatCorrelation['riskLevel'], (cves: string) => string> = {
  critical: (cves) => `CRITICAL: Actively exploitable vulnerability. ${cves ? `CVEs: ${cves}. ` : ''}Fix immediately — this pattern has been seen in the wild.`,
  high: () => `HIGH: Matches known attack patterns with significant exploitability. Prioritize in current sprint.`,
  medium: () => `MEDIUM: Theoretical vulnerability with moderate exploitability. Schedule for remediation.`,
  low: () => `LOW: Minor attack surface. Monitor but low urgency.`,
  none: () => 'No known threat patterns matched. Treat as standard technical debt.',
};

/**
 * Correlate scanner findings with DEFENSE threat intelligence
 */
export function correlateThreatIntelligence(
  scanFindings: Array<{
    id: string;
    category: string;
    title: string;
    description: string;
    severity: string;
    affectedPaths: string[];
    detail: string;
  }>,
  customSignatures: ThreatSignature[] = [],
): ThreatCorrelationReport {
  // Merge custom sigs into category index (temporary)
  const mergedIndex = new Map(sigByCategory);
  for (const sig of customSignatures) {
    const arr = mergedIndex.get(sig.category);
    if (arr) arr.push(sig); else mergedIndex.set(sig.category, [sig]);
  }

  const allSigs = customSignatures.length > 0
    ? [...KNOWN_SIGNATURES, ...customSignatures]
    : KNOWN_SIGNATURES;

  const correlations: ThreatCorrelation[] = [];
  const priorityOverrides: ThreatCorrelationReport['priorityOverrides'] = [];
  let exploitableCount = 0;
  let theoreticalCount = 0;

  for (const finding of scanFindings) {
    const matched = new Set<ThreatSignature>();
    let maxExploit = 0;

    // Phase 1: O(1) category match
    const catSigs = mergedIndex.get(finding.category);
    if (catSigs) {
      for (const sig of catSigs) {
        matched.add(sig);
        if (sig.exploitability > maxExploit) maxExploit = sig.exploitability;
      }
    }

    // Phase 2: Pattern match (only non-category-matched sigs)
    const searchText = `${finding.title}\n${finding.description}\n${finding.detail}`.toLowerCase();
    for (const sig of allSigs) {
      if (matched.has(sig)) continue;
      if (searchText.includes(sig.pattern)) {
        matched.add(sig);
        if (sig.exploitability > maxExploit) maxExploit = sig.exploitability;
      }
    }

    const matchedArr = Array.from(matched);
    const riskLevel = classifyRisk(maxExploit);
    const cves = matchedArr.filter(t => t.cveId).map(t => t.cveId).join(', ');

    correlations.push({
      findingId: finding.id,
      findingCategory: finding.category,
      matchedThreats: matchedArr,
      exploitabilityScore: maxExploit,
      attackSurfaceArea: finding.affectedPaths.length,
      riskLevel,
      recommendation: RECOMMENDATION_MAP[riskLevel](cves),
    });

    if (maxExploit > 0.5) {
      exploitableCount++;
      priorityOverrides.push({
        findingId: finding.id,
        newPriority: Math.round(maxExploit * 50),
        reason: `Matches ${matchedArr.length} known threat signature(s) with ${Math.round(maxExploit * 100)}% exploitability`,
      });
    } else if (maxExploit > 0) {
      theoreticalCount++;
    }
  }

  // In-place sort — avoid allocation
  correlations.sort((a, b) => b.exploitabilityScore - a.exploitabilityScore);

  return {
    correlations,
    exploitableCount,
    theoreticalCount,
    priorityOverrides,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Get attack surface summary for the entire scan
 */
export function getAttackSurfaceSummary(
  report: ThreatCorrelationReport,
): {
  totalExposedPaths: number;
  criticalPaths: string[];
  topThreats: string[];
  overallRiskScore: number;
} {
  const criticalPaths: string[] = [];
  const threatDescs = new Set<string>();
  let riskSum = 0;

  for (const c of report.correlations) {
    riskSum += c.exploitabilityScore;
    if (c.riskLevel === 'critical') criticalPaths.push(c.findingId);
    for (const t of c.matchedThreats) {
      if (threatDescs.size < 5) threatDescs.add(t.description);
    }
  }

  return {
    totalExposedPaths: report.correlations.reduce((s, c) => s + c.attackSurfaceArea, 0),
    criticalPaths,
    topThreats: Array.from(threatDescs),
    overallRiskScore: report.correlations.length > 0 ? riskSum / report.correlations.length : 0,
  };
}
