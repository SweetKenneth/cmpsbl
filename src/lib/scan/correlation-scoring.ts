/**
 * Multi-Source Correlation Scoring Engine
 * Correlates findings across scanner sources to produce weighted confidence scores.
 * Subscribers use this to prioritize high-signal issues over noise.
 */

export interface ScanFinding {
  id: string;
  source: string;
  category: string;
  severity: 'info' | 'warn' | 'error' | 'fatal';
  title: string;
  detail: string;
  fingerprint?: string;
}

export interface CorrelatedFinding {
  fingerprint: string;
  findings: ScanFinding[];
  sourceCount: number;
  correlationScore: number; // 0-1
  severity: 'info' | 'warn' | 'error' | 'fatal';
  category: string;
  title: string;
}

const SEVERITY_WEIGHT: Record<string, number> = {
  fatal: 1.0,
  error: 0.8,
  warn: 0.5,
  info: 0.2,
};

const SOURCE_TRUST: Record<string, number> = {
  seo: 0.9,
  security: 1.0,
  supabase: 0.95,
  ui: 0.7,
  hooks: 0.85,
  runtime: 0.9,
  modules: 0.8,
  routes: 0.85,
  branding: 0.95,
  a11y: 0.75,
  performance: 0.8,
};

function generateFingerprint(f: ScanFinding): string {
  if (f.fingerprint) return f.fingerprint;
  const normalized = `${f.category}:${f.title.toLowerCase().replace(/\s+/g, '_')}`;
  return normalized;
}

export function correlateFindings(findings: ScanFinding[]): CorrelatedFinding[] {
  const groups = new Map<string, ScanFinding[]>();

  for (const f of findings) {
    const fp = generateFingerprint(f);
    const group = groups.get(fp) || [];
    group.push(f);
    groups.set(fp, group);
  }

  const correlated: CorrelatedFinding[] = [];

  for (const [fingerprint, group] of groups) {
    const sources = new Set(group.map(f => f.source));
    const sourceCount = sources.size;

    // Multi-source correlation: more sources = higher confidence
    const sourceCorrelation = Math.min(1, sourceCount / 3);

    // Severity aggregation: take the worst
    const maxSeverity = group.reduce((max, f) => {
      return (SEVERITY_WEIGHT[f.severity] ?? 0) > (SEVERITY_WEIGHT[max] ?? 0)
        ? f.severity
        : max;
    }, 'info' as string) as ScanFinding['severity'];

    // Trust-weighted score
    const trustSum = group.reduce((sum, f) => {
      return sum + (SOURCE_TRUST[f.source] ?? 0.5);
    }, 0);
    const avgTrust = trustSum / group.length;

    const correlationScore = Math.min(1,
      sourceCorrelation * 0.4 +
      (SEVERITY_WEIGHT[maxSeverity] ?? 0) * 0.35 +
      avgTrust * 0.25
    );

    correlated.push({
      fingerprint,
      findings: group,
      sourceCount,
      correlationScore,
      severity: maxSeverity,
      category: group[0].category,
      title: group[0].title,
    });
  }

  return correlated.sort((a, b) => b.correlationScore - a.correlationScore);
}

export function getHighConfidenceFindings(
  findings: ScanFinding[],
  threshold = 0.6,
): CorrelatedFinding[] {
  return correlateFindings(findings).filter(f => f.correlationScore >= threshold);
}
