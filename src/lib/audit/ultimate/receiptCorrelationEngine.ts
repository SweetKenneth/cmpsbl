/**
 * AUDIT — Receipt Correlation Engine
 * Links related receipts across types to reconstruct causal event sequences.
 * E.g., config_change → breaker_trip → cascade_containment.
 * @module audit/receiptCorrelationEngine
 * @version 9.0.0 — Sentinel
 */

import type { AuditReceipt, ReceiptType } from '../receipts';

// ── Types ──────────────────────────────────────────────────────────────────

export interface CorrelationRule {
  id: string;
  name: string;
  trigger: ReceiptType;
  followUp: ReceiptType[];
  windowMs: number;
  description: string;
}

export interface CorrelatedSequence {
  ruleId: string;
  ruleName: string;
  triggerReceipt: AuditReceipt;
  followUpReceipts: AuditReceipt[];
  spanMs: number;
  complete: boolean;        // all follow-ups found
}

export interface CorrelationAnalysis {
  sequences: CorrelatedSequence[];
  totalCorrelations: number;
  completeSequences: number;
  partialSequences: number;
}

// ── Built-in Rules ─────────────────────────────────────────────────────────

const BUILT_IN_RULES: CorrelationRule[] = [
  {
    id: 'cor-config-breaker',
    name: 'Config Change → Breaker Trip',
    trigger: 'config_change',
    followUp: ['breaker_trip'],
    windowMs: 60_000,
    description: 'Config change followed by circuit breaker trip within 1 minute',
  },
  {
    id: 'cor-breaker-cascade',
    name: 'Breaker Trip → Cascade Containment',
    trigger: 'breaker_trip',
    followUp: ['cascade_containment'],
    windowMs: 30_000,
    description: 'Breaker trip followed by cascade containment within 30 seconds',
  },
  {
    id: 'cor-evolution-full',
    name: 'Evolution Promotion Lifecycle',
    trigger: 'evolution_promotion',
    followUp: ['config_change', 'module_invoke'],
    windowMs: 300_000,
    description: 'Promotion followed by config change and module invoke within 5 minutes',
  },
  {
    id: 'cor-safe-mode-cascade',
    name: 'Safe Mode → Cascade Response',
    trigger: 'safe_mode_toggle',
    followUp: ['breaker_trip', 'cascade_containment'],
    windowMs: 120_000,
    description: 'Safe mode toggle triggering breaker trips and containment',
  },
];

// ── State ──────────────────────────────────────────────────────────────────

const customRules: CorrelationRule[] = [];

// ── Core ───────────────────────────────────────────────────────────────────

export function addCorrelationRule(rule: CorrelationRule): void {
  customRules.push(rule);
}

function getAllRules(): CorrelationRule[] {
  return [...BUILT_IN_RULES, ...customRules];
}

export function correlateReceipts(receipts: AuditReceipt[]): CorrelationAnalysis {
  const rules = getAllRules();
  const sequences: CorrelatedSequence[] = [];
  const sorted = [...receipts].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  for (const rule of rules) {
    for (let i = 0; i < sorted.length; i++) {
      const trigger = sorted[i];
      if (trigger.type !== rule.trigger) continue;

      const triggerTime = new Date(trigger.timestamp).getTime();
      const windowEnd = triggerTime + rule.windowMs;

      // Find follow-ups within window
      const followUps: AuditReceipt[] = [];
      const foundTypes = new Set<ReceiptType>();

      for (let j = i + 1; j < sorted.length; j++) {
        const candidate = sorted[j];
        const candidateTime = new Date(candidate.timestamp).getTime();
        if (candidateTime > windowEnd) break;

        if (rule.followUp.includes(candidate.type) && !foundTypes.has(candidate.type)) {
          followUps.push(candidate);
          foundTypes.add(candidate.type);
        }
      }

      if (followUps.length > 0) {
        const lastTime = Math.max(...followUps.map(r => new Date(r.timestamp).getTime()));
        sequences.push({
          ruleId: rule.id,
          ruleName: rule.name,
          triggerReceipt: trigger,
          followUpReceipts: followUps,
          spanMs: lastTime - triggerTime,
          complete: rule.followUp.every(t => foundTypes.has(t)),
        });
      }
    }
  }

  return {
    sequences,
    totalCorrelations: sequences.length,
    completeSequences: sequences.filter(s => s.complete).length,
    partialSequences: sequences.filter(s => !s.complete).length,
  };
}

export function getCorrelationRules(): CorrelationRule[] {
  return getAllRules();
}

export function resetCorrelationRules(): void {
  customRules.length = 0;
}
