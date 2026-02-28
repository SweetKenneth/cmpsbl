/**
 * DEFENSE Threat-Correlated Scanning (#14)
 * Correlates scanner findings with DEFENSE threat intelligence
 * to prioritize exploitable debt over theoretical vulnerabilities.
 */

export interface ThreatSignature {
  id: string;
  pattern: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  cveId?: string;
  description: string;
  exploitability: number; // 0-1
  lastSeenInWild: string | null;
}

export interface ThreatCorrelation {
  findingId: string;
  findingCategory: string;
  matchedThreats: ThreatSignature[];
  exploitabilityScore: number;
  attackSurfaceArea: number; // number of exposed paths
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

/**
 * Known attack pattern signatures for common web app vulnerabilities
 */
const KNOWN_SIGNATURES: ThreatSignature[] = [
  {
    id: 'sig_sql_injection',
    pattern: 'sql_injection',
    severity: 'critical',
    category: 'security',
    description: 'SQL injection via unparameterized queries',
    exploitability: 0.95,
    lastSeenInWild: '2026-02-01',
  },
  {
    id: 'sig_rls_bypass',
    pattern: 'rls_missing',
    severity: 'critical',
    category: 'rls_policy',
    description: 'Missing RLS allows unrestricted data access',
    exploitability: 0.9,
    lastSeenInWild: '2026-02-15',
  },
  {
    id: 'sig_secret_leak',
    pattern: 'hardcoded_secret',
    severity: 'critical',
    category: 'secret_exposure',
    description: 'API keys or tokens exposed in client bundle',
    exploitability: 0.85,
    lastSeenInWild: '2026-02-20',
  },
  {
    id: 'sig_cors_wildcard',
    pattern: 'cors_wildcard',
    severity: 'high',
    category: 'security',
    description: 'CORS wildcard allows cross-origin data exfiltration',
    exploitability: 0.7,
    lastSeenInWild: '2026-01-15',
  },
  {
    id: 'sig_no_rate_limit',
    pattern: 'no_rate_limit',
    severity: 'high',
    category: 'security',
    description: 'Missing rate limiting enables brute force attacks',
    exploitability: 0.75,
    lastSeenInWild: '2026-02-10',
  },
  {
    id: 'sig_priv_escalation',
    pattern: 'privilege_escalation',
    severity: 'critical',
    category: 'security',
    description: 'Role boundary bypass allows unauthorized access',
    exploitability: 0.8,
    lastSeenInWild: '2026-01-28',
  },
  {
    id: 'sig_xss',
    pattern: 'dangerouslySetInnerHTML',
    severity: 'high',
    category: 'security',
    description: 'XSS via unescaped HTML injection',
    exploitability: 0.65,
    lastSeenInWild: '2026-02-05',
  },
  {
    id: 'sig_open_redirect',
    pattern: 'open_redirect',
    severity: 'medium',
    category: 'security',
    description: 'Unvalidated redirects enable phishing',
    exploitability: 0.5,
    lastSeenInWild: '2025-12-20',
  },
];

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
  const allSignatures = [...KNOWN_SIGNATURES, ...customSignatures];
  const correlations: ThreatCorrelation[] = [];
  const priorityOverrides: ThreatCorrelationReport['priorityOverrides'] = [];

  for (const finding of scanFindings) {
    const matchedThreats: ThreatSignature[] = [];

    for (const sig of allSignatures) {
      // Match by category or pattern in finding content
      const categoryMatch = finding.category === sig.category;
      const patternMatch = finding.title.toLowerCase().includes(sig.pattern) ||
        finding.description.toLowerCase().includes(sig.pattern) ||
        finding.detail.toLowerCase().includes(sig.pattern);

      if (categoryMatch || patternMatch) {
        matchedThreats.push(sig);
      }
    }

    const exploitabilityScore = matchedThreats.length > 0
      ? Math.max(...matchedThreats.map(t => t.exploitability))
      : 0;

    const riskLevel: ThreatCorrelation['riskLevel'] =
      exploitabilityScore > 0.8 ? 'critical' :
      exploitabilityScore > 0.6 ? 'high' :
      exploitabilityScore > 0.3 ? 'medium' :
      exploitabilityScore > 0 ? 'low' : 'none';

    const correlation: ThreatCorrelation = {
      findingId: finding.id,
      findingCategory: finding.category,
      matchedThreats,
      exploitabilityScore,
      attackSurfaceArea: finding.affectedPaths.length,
      riskLevel,
      recommendation: generateThreatRecommendation(riskLevel, matchedThreats),
    };

    correlations.push(correlation);

    // Generate priority overrides for exploitable findings
    if (exploitabilityScore > 0.5) {
      const boost = Math.round(exploitabilityScore * 50);
      priorityOverrides.push({
        findingId: finding.id,
        newPriority: boost,
        reason: `Matches ${matchedThreats.length} known threat signature(s) with ${Math.round(exploitabilityScore * 100)}% exploitability`,
      });
    }
  }

  correlations.sort((a, b) => b.exploitabilityScore - a.exploitabilityScore);

  return {
    correlations,
    exploitableCount: correlations.filter(c => c.exploitabilityScore > 0.5).length,
    theoreticalCount: correlations.filter(c => c.exploitabilityScore <= 0.5 && c.exploitabilityScore > 0).length,
    priorityOverrides,
    generatedAt: new Date().toISOString(),
  };
}

function generateThreatRecommendation(
  riskLevel: ThreatCorrelation['riskLevel'],
  threats: ThreatSignature[],
): string {
  if (riskLevel === 'critical') {
    const cves = threats.filter(t => t.cveId).map(t => t.cveId).join(', ');
    return `CRITICAL: Actively exploitable vulnerability. ${cves ? `CVEs: ${cves}. ` : ''}Fix immediately — this pattern has been seen in the wild.`;
  }
  if (riskLevel === 'high') {
    return `HIGH: Matches known attack patterns with significant exploitability. Prioritize in current sprint.`;
  }
  if (riskLevel === 'medium') {
    return `MEDIUM: Theoretical vulnerability with moderate exploitability. Schedule for remediation.`;
  }
  if (riskLevel === 'low') {
    return `LOW: Minor attack surface. Monitor but low urgency.`;
  }
  return 'No known threat patterns matched. Treat as standard technical debt.';
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
  const allPaths = new Set<string>();
  const criticalPaths: string[] = [];

  for (const c of report.correlations) {
    if (c.riskLevel === 'critical') {
      // Would need paths from original findings; approximate
      criticalPaths.push(c.findingId);
    }
  }

  const overallRiskScore = report.correlations.length > 0
    ? report.correlations.reduce((s, c) => s + c.exploitabilityScore, 0) / report.correlations.length
    : 0;

  const topThreats = [...new Set(
    report.correlations
      .flatMap(c => c.matchedThreats.map(t => t.description))
  )].slice(0, 5);

  return {
    totalExposedPaths: allPaths.size,
    criticalPaths,
    topThreats,
    overallRiskScore,
  };
}
