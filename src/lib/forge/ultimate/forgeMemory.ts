/**
 * FORGE Ultimate #8 — Forge Memory (Institutional Knowledge)
 * Remembers every blueprint ever forged — what worked, what failed.
 * Success correlation, anti-pattern detection, seasonal trends.
 */

// ── Types ──

export interface ForgeRecord {
  id: string;
  blueprintId: string;
  modules: string[];
  pattern: string;
  cjpiScore: number;
  outcome: 'success' | 'partial' | 'failure';
  failureReason?: string;
  forgedAt: number;
}

export interface AntiPattern {
  modules: string[];
  pattern: string;
  failureCount: number;
  avgCJPI: number;
  firstSeen: number;
  lastSeen: number;
  flagged: boolean;
}

export interface SuccessCorrelation {
  modules: string[];
  avgCJPI: number;
  count: number;
  successRate: number;
}

// ── State ──

const records: ForgeRecord[] = [];
const antiPatterns = new Map<string, AntiPattern>();
const MAX_RECORDS = 10000;
let idCounter = 0;

// ── Helpers ──

function comboKey(modules: string[], pattern: string): string {
  return [...modules].sort().join('+') + ':' + pattern;
}

// ── Core ──

export function remember(blueprintId: string, modules: string[], pattern: string, cjpiScore: number, outcome: ForgeRecord['outcome'], failureReason?: string): ForgeRecord {
  const record: ForgeRecord = {
    id: `fmem-${++idCounter}`,
    blueprintId, modules: [...modules], pattern,
    cjpiScore, outcome, failureReason, forgedAt: Date.now(),
  };
  records.push(record);
  if (records.length > MAX_RECORDS) records.splice(0, records.length - MAX_RECORDS);

  // Track anti-patterns
  if (outcome === 'failure') {
    const key = comboKey(modules, pattern);
    const ap = antiPatterns.get(key) ?? {
      modules: [...modules], pattern, failureCount: 0, avgCJPI: 0, firstSeen: Date.now(), lastSeen: 0, flagged: false,
    };
    ap.failureCount++;
    ap.avgCJPI = (ap.avgCJPI * (ap.failureCount - 1) + cjpiScore) / ap.failureCount;
    ap.lastSeen = Date.now();
    if (ap.failureCount >= 3) ap.flagged = true;
    antiPatterns.set(key, ap);
  }

  return record;
}

export function isKnownAntiPattern(modules: string[], pattern: string): { flagged: boolean; failureCount: number } {
  const key = comboKey(modules, pattern);
  const ap = antiPatterns.get(key);
  return { flagged: ap?.flagged ?? false, failureCount: ap?.failureCount ?? 0 };
}

export function getSuccessCorrelations(minCount: number = 3): SuccessCorrelation[] {
  const combos = new Map<string, { modules: string[]; scores: number[]; successes: number }>();

  for (const r of records) {
    const key = comboKey(r.modules, r.pattern);
    const entry = combos.get(key) ?? { modules: r.modules, scores: [], successes: 0 };
    entry.scores.push(r.cjpiScore);
    if (r.outcome === 'success') entry.successes++;
    combos.set(key, entry);
  }

  const correlations: SuccessCorrelation[] = [];
  for (const [, entry] of combos) {
    if (entry.scores.length < minCount) continue;
    correlations.push({
      modules: entry.modules,
      avgCJPI: Math.round(entry.scores.reduce((s, v) => s + v, 0) / entry.scores.length),
      count: entry.scores.length,
      successRate: Math.round(entry.successes / entry.scores.length * 1000) / 1000,
    });
  }

  return correlations.sort((a, b) => b.avgCJPI - a.avgCJPI);
}

export function getFlaggedAntiPatterns(): AntiPattern[] {
  return Array.from(antiPatterns.values()).filter(ap => ap.flagged);
}

export function getMemoryStats(): { totalRecords: number; antiPatterns: number; flaggedAntiPatterns: number; avgCJPI: number; successRate: number } {
  const successes = records.filter(r => r.outcome === 'success').length;
  return {
    totalRecords: records.length,
    antiPatterns: antiPatterns.size,
    flaggedAntiPatterns: Array.from(antiPatterns.values()).filter(ap => ap.flagged).length,
    avgCJPI: records.length > 0 ? Math.round(records.reduce((s, r) => s + r.cjpiScore, 0) / records.length) : 0,
    successRate: records.length > 0 ? Math.round(successes / records.length * 1000) / 1000 : 0,
  };
}

export function resetMemoryState(): void { records.length = 0; antiPatterns.clear(); idCounter = 0; }
