/**
 * SOVEREIGN Ultimate — Retention Policy Engine
 * Intelligent lifecycle with legal hold, conflict resolution, and auto-purge.
 * v9.0.0 "Crown Prime"
 */

// ─── Types ────────────────────────────────────────────────────────

export type RetentionStatus = 'active' | 'held' | 'expired' | 'purged';

export interface RetentionRule {
  id: string;
  name: string;
  dataClassification: string;
  jurisdiction: string;
  framework: string;
  retentionDays: number;
  deleteOnExpiry: boolean;
  status: RetentionStatus;
  legalHold: boolean;
  legalHoldReason: string | null;
  legalHoldAt: string | null;
  appliedAt: string;
  expiresAt: string;
  purgedAt: string | null;
}

export interface RetentionConflict {
  ruleA: string;
  ruleB: string;
  conflictType: 'overlapping_scope' | 'contradictory_period' | 'delete_vs_hold';
  resolution: string;          // 'longest_period_wins' always
  resolvedRetentionDays: number;
}

// ─── Framework Minimums ───────────────────────────────────────────

const FRAMEWORK_MINIMUMS: Record<string, number> = {
  GDPR: 0,       // purpose-limited (no fixed minimum, but must justify)
  HIPAA: 2190,   // 6 years
  SOX: 2555,     // 7 years
  ITAR: 1825,    // 5 years
  SOC2: 365,     // 1 year
  CCPA: 365,     // 1 year
  PIPEDA: 365,
  LGPD: 0,
  POPIA: 0,
  APPI: 0,
  PDPA: 0,
};

// ─── Storage ──────────────────────────────────────────────────────

const retentionRules: RetentionRule[] = [];
const conflictLog: RetentionConflict[] = [];
const MAX_RULES = 2000;

// ─── Core Operations ─────────────────────────────────────────────

export function addRetentionRule(
  name: string,
  dataClassification: string,
  jurisdiction: string,
  framework: string,
  retentionDays: number,
  deleteOnExpiry: boolean = true
): { rule: RetentionRule; conflicts: RetentionConflict[] } {
  // Enforce framework minimum
  const minimum = FRAMEWORK_MINIMUMS[framework] || 0;
  const effectiveDays = Math.max(retentionDays, minimum);

  const now = new Date();
  const rule: RetentionRule = {
    id: `ret_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name,
    dataClassification,
    jurisdiction,
    framework,
    retentionDays: effectiveDays,
    deleteOnExpiry,
    status: 'active',
    legalHold: false,
    legalHoldReason: null,
    legalHoldAt: null,
    appliedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + effectiveDays * 86400000).toISOString(),
    purgedAt: null,
  };

  // Detect conflicts with existing rules for same scope
  const conflicts = detectConflicts(rule);

  retentionRules.push(rule);
  if (retentionRules.length > MAX_RULES) retentionRules.splice(0, retentionRules.length - MAX_RULES);

  return { rule, conflicts };
}

function detectConflicts(newRule: RetentionRule): RetentionConflict[] {
  const found: RetentionConflict[] = [];
  for (const existing of retentionRules) {
    if (existing.status === 'purged') continue;
    if (existing.dataClassification === newRule.dataClassification &&
        existing.jurisdiction === newRule.jurisdiction) {
      const conflict: RetentionConflict = {
        ruleA: existing.id,
        ruleB: newRule.id,
        conflictType: existing.retentionDays !== newRule.retentionDays ? 'contradictory_period' : 'overlapping_scope',
        resolution: 'longest_period_wins',
        resolvedRetentionDays: Math.max(existing.retentionDays, newRule.retentionDays),
      };
      found.push(conflict);
      conflictLog.push(conflict);
    }
  }
  return found;
}

export function applyLegalHold(ruleId: string, reason: string): boolean {
  const rule = retentionRules.find(r => r.id === ruleId);
  if (!rule || rule.status === 'purged') return false;
  rule.legalHold = true;
  rule.legalHoldReason = reason;
  rule.legalHoldAt = new Date().toISOString();
  rule.status = 'held';
  return true;
}

export function releaseLegalHold(ruleId: string): boolean {
  const rule = retentionRules.find(r => r.id === ruleId);
  if (!rule || !rule.legalHold) return false;
  rule.legalHold = false;
  rule.status = new Date(rule.expiresAt).getTime() <= Date.now() ? 'expired' : 'active';
  return true;
}

export function processExpiredRules(): { expired: string[]; purged: string[] } {
  const now = Date.now();
  const expired: string[] = [];
  const purged: string[] = [];

  for (const rule of retentionRules) {
    if (rule.status === 'active' && new Date(rule.expiresAt).getTime() <= now) {
      rule.status = 'expired';
      expired.push(rule.id);
      if (rule.deleteOnExpiry && !rule.legalHold) {
        rule.status = 'purged';
        rule.purgedAt = new Date().toISOString();
        purged.push(rule.id);
      }
    }
  }
  return { expired, purged };
}

// ─── Queries ──────────────────────────────────────────────────────

export function getRetentionRules(): RetentionRule[] { return [...retentionRules]; }
export function getActiveRetentionRules(): RetentionRule[] { return retentionRules.filter(r => r.status === 'active' || r.status === 'held'); }
export function getLegalHolds(): RetentionRule[] { return retentionRules.filter(r => r.legalHold); }
export function getRetentionConflicts(): RetentionConflict[] { return [...conflictLog]; }
export function getFrameworkMinimums(): Record<string, number> { return { ...FRAMEWORK_MINIMUMS }; }
export function getRetentionHealth(): number {
  if (retentionRules.length === 0) return 100;
  const activeOrHeld = retentionRules.filter(r => r.status === 'active' || r.status === 'held').length;
  const conflictPenalty = Math.min(20, conflictLog.length * 2);
  return Math.max(0, Math.round((activeOrHeld / retentionRules.length) * 100 - conflictPenalty));
}
