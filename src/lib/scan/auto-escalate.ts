/**
 * Auto-Escalating Scan Depth Engine
 * Dynamically increases scan depth when initial results indicate risk.
 * Subscribers benefit from efficient shallow scans that deepen only when needed.
 */

export type ScanDepth = 'shallow' | 'standard' | 'deep' | 'forensic';

export interface EscalationRule {
  trigger: 'error_count' | 'fatal_found' | 'category_cluster' | 'severity_ratio';
  threshold: number;
  escalateTo: ScanDepth;
}

export interface EscalationContext {
  currentDepth: ScanDepth;
  errorCount: number;
  fatalCount: number;
  findingsByCategory: Record<string, number>;
  totalFindings: number;
  escalationHistory: Array<{ from: ScanDepth; to: ScanDepth; reason: string; timestamp: number }>;
}

const DEPTH_RANK: Record<ScanDepth, number> = {
  shallow: 0,
  standard: 1,
  deep: 2,
  forensic: 3,
};

const DEFAULT_RULES: EscalationRule[] = [
  { trigger: 'fatal_found', threshold: 1, escalateTo: 'forensic' },
  { trigger: 'error_count', threshold: 5, escalateTo: 'deep' },
  { trigger: 'error_count', threshold: 2, escalateTo: 'standard' },
  { trigger: 'severity_ratio', threshold: 0.3, escalateTo: 'deep' },
  { trigger: 'category_cluster', threshold: 3, escalateTo: 'deep' },
];

let customRules: EscalationRule[] = [];

export function setEscalationRules(rules: EscalationRule[]): void {
  customRules = rules;
}

function getActiveRules(): EscalationRule[] {
  return customRules.length > 0 ? customRules : DEFAULT_RULES;
}

export function evaluateEscalation(ctx: EscalationContext): {
  shouldEscalate: boolean;
  targetDepth: ScanDepth;
  reason: string;
} {
  const rules = getActiveRules();
  let targetDepth = ctx.currentDepth;
  let reason = '';

  for (const rule of rules) {
    let triggered = false;

    switch (rule.trigger) {
      case 'fatal_found':
        triggered = ctx.fatalCount >= rule.threshold;
        if (triggered) reason = `${ctx.fatalCount} fatal finding(s) detected`;
        break;
      case 'error_count':
        triggered = ctx.errorCount >= rule.threshold;
        if (triggered) reason = `${ctx.errorCount} errors exceed threshold (${rule.threshold})`;
        break;
      case 'severity_ratio':
        const errorRatio = ctx.totalFindings > 0
          ? (ctx.errorCount + ctx.fatalCount) / ctx.totalFindings
          : 0;
        triggered = errorRatio >= rule.threshold;
        if (triggered) reason = `Error ratio ${(errorRatio * 100).toFixed(1)}% exceeds ${rule.threshold * 100}%`;
        break;
      case 'category_cluster': {
        const clustered = Object.values(ctx.findingsByCategory)
          .filter(c => c >= rule.threshold).length;
        triggered = clustered > 0;
        if (triggered) reason = `${clustered} category(ies) with ${rule.threshold}+ findings`;
        break;
      }
    }

    if (triggered && DEPTH_RANK[rule.escalateTo] > DEPTH_RANK[targetDepth]) {
      targetDepth = rule.escalateTo;
    }
  }

  const shouldEscalate = DEPTH_RANK[targetDepth] > DEPTH_RANK[ctx.currentDepth];

  return { shouldEscalate, targetDepth, reason };
}

export function buildEscalationContext(
  currentDepth: ScanDepth,
  findings: Array<{ severity: string; category: string }>,
): EscalationContext {
  const findingsByCategory: Record<string, number> = {};
  let errorCount = 0;
  let fatalCount = 0;

  for (const f of findings) {
    findingsByCategory[f.category] = (findingsByCategory[f.category] ?? 0) + 1;
    if (f.severity === 'error') errorCount++;
    if (f.severity === 'fatal') fatalCount++;
  }

  return {
    currentDepth,
    errorCount,
    fatalCount,
    findingsByCategory,
    totalFindings: findings.length,
    escalationHistory: [],
  };
}

export function getDepthConfig(depth: ScanDepth): {
  includeSources: string[];
  maxFindingsPerSource: number;
  enableCorrelation: boolean;
  enableDiff: boolean;
} {
  switch (depth) {
    case 'shallow':
      return { includeSources: ['seo', 'branding'], maxFindingsPerSource: 10, enableCorrelation: false, enableDiff: false };
    case 'standard':
      return { includeSources: ['seo', 'branding', 'ui', 'routes', 'hooks'], maxFindingsPerSource: 25, enableCorrelation: true, enableDiff: false };
    case 'deep':
      return { includeSources: ['seo', 'branding', 'ui', 'routes', 'hooks', 'security', 'supabase', 'modules', 'runtime'], maxFindingsPerSource: 50, enableCorrelation: true, enableDiff: true };
    case 'forensic':
      return { includeSources: ['seo', 'branding', 'ui', 'routes', 'hooks', 'security', 'supabase', 'modules', 'runtime', 'a11y', 'performance', 'docs'], maxFindingsPerSource: 100, enableCorrelation: true, enableDiff: true };
  }
}
