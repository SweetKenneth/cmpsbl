/**
 * AUDIT — Compliance Rule Engine
 * Declarative compliance rules (DENY, REQUIRE, LIMIT) evaluated against receipt stream.
 * Produces pass/fail compliance reports with evidence citations.
 * @module audit/complianceRuleEngine
 * @version 9.0.0 — Sentinel
 */

import type { AuditReceipt, ReceiptType } from '../receipts';

// ── Types ──────────────────────────────────────────────────────────────────

export type RuleOperator = 'deny' | 'require' | 'limit' | 'scope_match';

export interface ComplianceRule {
  id: string;
  name: string;
  operator: RuleOperator;
  target: {
    receiptType?: ReceiptType;
    actor?: string;
    field?: string;
  };
  params: {
    maxCount?: number;
    windowMs?: number;
    requiredField?: string;
    requiredValue?: unknown;
    pattern?: string;
  };
  severity: 'info' | 'warn' | 'error' | 'critical';
}

export interface ComplianceViolation {
  ruleId: string;
  ruleName: string;
  severity: string;
  description: string;
  evidence: Record<string, unknown>;
  receiptIds: string[];
}

export interface ComplianceReport {
  timestamp: number;
  rulesEvaluated: number;
  passed: number;
  failed: number;
  violations: ComplianceViolation[];
  overallPass: boolean;
}

// ── State ──────────────────────────────────────────────────────────────────

const ruleRegistry: ComplianceRule[] = [];

// ── Built-in Rules ─────────────────────────────────────────────────────────

const BUILT_IN_RULES: ComplianceRule[] = [
  {
    id: 'cr-no-anon-config',
    name: 'No anonymous config changes',
    operator: 'deny',
    target: { receiptType: 'config_change', actor: 'anonymous' },
    params: {},
    severity: 'critical',
  },
  {
    id: 'cr-require-prev-hash',
    name: 'All receipts must have prev_hash',
    operator: 'require',
    target: {},
    params: { requiredField: 'prev_hash' },
    severity: 'error',
  },
  {
    id: 'cr-limit-breaker-trips',
    name: 'Max 50 breaker trips per hour',
    operator: 'limit',
    target: { receiptType: 'breaker_trip' },
    params: { maxCount: 50, windowMs: 3600 * 1000 },
    severity: 'warn',
  },
  {
    id: 'cr-require-policy-version',
    name: 'All receipts must have policy_version',
    operator: 'require',
    target: {},
    params: { requiredField: 'policy_version' },
    severity: 'error',
  },
];

// ── Core ───────────────────────────────────────────────────────────────────

export function initComplianceRules(): void {
  for (const rule of BUILT_IN_RULES) {
    if (!ruleRegistry.find(r => r.id === rule.id)) {
      ruleRegistry.push(rule);
    }
  }
}

export function addRule(rule: ComplianceRule): void {
  ruleRegistry.push(rule);
}

export function evaluateCompliance(receipts: AuditReceipt[]): ComplianceReport {
  const violations: ComplianceViolation[] = [];

  for (const rule of ruleRegistry) {
    const filtered = filterReceipts(receipts, rule);
    const violation = evaluateRule(rule, filtered, receipts);
    if (violation) violations.push(violation);
  }

  return {
    timestamp: Date.now(),
    rulesEvaluated: ruleRegistry.length,
    passed: ruleRegistry.length - violations.length,
    failed: violations.length,
    violations,
    overallPass: violations.filter(v => v.severity === 'critical' || v.severity === 'error').length === 0,
  };
}

function filterReceipts(receipts: AuditReceipt[], rule: ComplianceRule): AuditReceipt[] {
  return receipts.filter(r => {
    if (rule.target.receiptType && r.type !== rule.target.receiptType) return false;
    if (rule.target.actor && r.actor !== rule.target.actor) return false;
    return true;
  });
}

function evaluateRule(
  rule: ComplianceRule,
  filtered: AuditReceipt[],
  all: AuditReceipt[],
): ComplianceViolation | null {
  switch (rule.operator) {
    case 'deny': {
      if (filtered.length > 0) {
        return {
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          description: `DENY violation: ${filtered.length} matching receipt(s) found`,
          evidence: { matchCount: filtered.length },
          receiptIds: filtered.map(r => r.id),
        };
      }
      return null;
    }
    case 'require': {
      const field = rule.params.requiredField;
      if (!field) return null;
      const missing = all.filter(r => {
        const val = (r as unknown as Record<string, unknown>)[field];
        return val === undefined || val === null || val === '';
      });
      if (missing.length > 0) {
        return {
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          description: `REQUIRE violation: ${missing.length} receipt(s) missing "${field}"`,
          evidence: { field, missingCount: missing.length },
          receiptIds: missing.slice(0, 10).map(r => r.id),
        };
      }
      return null;
    }
    case 'limit': {
      const max = rule.params.maxCount ?? Infinity;
      const windowMs = rule.params.windowMs;
      let inWindow = filtered;
      if (windowMs) {
        const cutoff = Date.now() - windowMs;
        inWindow = filtered.filter(r => new Date(r.timestamp).getTime() >= cutoff);
      }
      if (inWindow.length > max) {
        return {
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          description: `LIMIT violation: ${inWindow.length} receipts exceed max ${max}`,
          evidence: { count: inWindow.length, max, windowMs },
          receiptIds: inWindow.slice(0, 10).map(r => r.id),
        };
      }
      return null;
    }
    case 'scope_match': {
      // Pattern matching against metadata
      const pattern = rule.params.pattern;
      if (!pattern) return null;
      const regex = new RegExp(pattern);
      const nonMatching = filtered.filter(r => !regex.test(JSON.stringify(r.metadata)));
      if (nonMatching.length > 0) {
        return {
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          description: `SCOPE_MATCH violation: ${nonMatching.length} receipt(s) don't match pattern`,
          evidence: { pattern, nonMatchCount: nonMatching.length },
          receiptIds: nonMatching.slice(0, 10).map(r => r.id),
        };
      }
      return null;
    }
    default:
      return null;
  }
}

export function getRules(): ComplianceRule[] {
  return [...ruleRegistry];
}

export function resetRules(): void {
  ruleRegistry.length = 0;
}
