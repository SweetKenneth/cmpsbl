/**
 * S-Tier 067 — Technical Debt Quantifier
 * CJPI: 93 | Node: EVOLUTION | ID: S-MOD02
 *
 * Scores and tracks technical debt across substrate modules.
 * Provides prioritized remediation recommendations.
 */

export interface DebtItem {
  id: string;
  module: string;
  category: 'code' | 'dependency' | 'architecture' | 'test' | 'docs';
  description: string;
  severity: number;  // 1-10
  effort: number;    // estimated hours
  createdAt: number;
}

export interface DebtReport {
  totalItems: number;
  totalSeverity: number;
  totalEffort: number;
  byCategory: Record<string, number>;
  topPriority: DebtItem[];
  debtScore: number; // 0-100 (0 = no debt)
}

const items: DebtItem[] = [];
let debtSeq = 0;

export function addDebt(item: Omit<DebtItem, 'id' | 'createdAt'>): DebtItem {
  const full: DebtItem = { ...item, id: `debt-${++debtSeq}`, createdAt: Date.now() };
  items.push(full);
  return full;
}

export function resolveDebt(id: string): boolean {
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return false;
  items.splice(idx, 1);
  return true;
}

export function generateReport(): DebtReport {
  const byCategory: Record<string, number> = {};
  for (const item of items) {
    byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;
  }

  const sorted = [...items].sort((a, b) => (b.severity / b.effort) - (a.severity / a.effort));
  const totalSeverity = items.reduce((s, i) => s + i.severity, 0);

  return {
    totalItems: items.length,
    totalSeverity,
    totalEffort: items.reduce((s, i) => s + i.effort, 0),
    byCategory,
    topPriority: sorted.slice(0, 5),
    debtScore: Math.min(100, totalSeverity * 2),
  };
}

export function getItems(module?: string): DebtItem[] {
  return module ? items.filter(i => i.module === module) : [...items];
}
