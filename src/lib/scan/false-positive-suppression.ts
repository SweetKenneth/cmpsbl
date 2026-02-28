/**
 * False Positive Suppression Engine
 * Allows subscribers to suppress known false positives by fingerprint,
 * category, or pattern match. Suppressions are auditable.
 */

export interface SuppressionRule {
  id: string;
  type: 'fingerprint' | 'category' | 'pattern' | 'source';
  value: string;
  reason: string;
  createdAt: number;
  createdBy: string;
  expiresAt?: number;
  hitCount: number;
}

export interface SuppressibleFinding {
  id: string;
  category: string;
  source?: string;
  title: string;
  detail: string;
  severity: string;
}

export interface SuppressionResult<T extends SuppressibleFinding> {
  findings: T[];
  suppressed: Array<{ finding: T; rule: SuppressionRule }>;
  stats: { total: number; passed: number; suppressed: number };
}

const rules = new Map<string, SuppressionRule>();

export function addSuppressionRule(
  rule: Omit<SuppressionRule, 'id' | 'createdAt' | 'hitCount'>,
): SuppressionRule {
  const entry: SuppressionRule = {
    ...rule,
    id: `supp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: Date.now(),
    hitCount: 0,
  };
  rules.set(entry.id, entry);
  return entry;
}

export function removeSuppressionRule(id: string): boolean {
  return rules.delete(id);
}

function isExpired(rule: SuppressionRule): boolean {
  return rule.expiresAt !== undefined && Date.now() > rule.expiresAt;
}

function matchesRule(finding: SuppressibleFinding, rule: SuppressionRule): boolean {
  if (isExpired(rule)) return false;
  switch (rule.type) {
    case 'fingerprint':
      return finding.id === rule.value;
    case 'category':
      return finding.category === rule.value;
    case 'source':
      return finding.source === rule.value;
    case 'pattern':
      try {
        return new RegExp(rule.value, 'i').test(finding.title) ||
               new RegExp(rule.value, 'i').test(finding.detail);
      } catch {
        return false;
      }
    default:
      return false;
  }
}

export function applySuppressions<T extends SuppressibleFinding>(
  findings: T[],
): SuppressionResult<T> {
  const passed: T[] = [];
  const suppressed: Array<{ finding: T; rule: SuppressionRule }> = [];

  for (const finding of findings) {
    let wasSuppressed = false;
    for (const rule of rules.values()) {
      if (matchesRule(finding, rule)) {
        rule.hitCount++;
        suppressed.push({ finding, rule });
        wasSuppressed = true;
        break;
      }
    }
    if (!wasSuppressed) passed.push(finding);
  }

  return {
    findings: passed,
    suppressed,
    stats: {
      total: findings.length,
      passed: passed.length,
      suppressed: suppressed.length,
    },
  };
}

export function getSuppressionRules(): SuppressionRule[] {
  // Clean expired
  for (const [id, rule] of rules) {
    if (isExpired(rule)) rules.delete(id);
  }
  return Array.from(rules.values());
}

export function getSuppressionStats(): {
  activeRules: number;
  totalHits: number;
  byType: Record<string, number>;
} {
  let totalHits = 0;
  const byType: Record<string, number> = {};
  for (const rule of rules.values()) {
    if (!isExpired(rule)) {
      totalHits += rule.hitCount;
      byType[rule.type] = (byType[rule.type] ?? 0) + 1;
    }
  }
  return { activeRules: rules.size, totalHits, byType };
}
