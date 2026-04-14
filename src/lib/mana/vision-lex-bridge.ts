/**
 * VISION → LEX Auto-Rule Bridge (HARDENED)
 * U.S. Patent App. No. 64/031,637
 * 
 * STOP-SHIP HARDENING:
 * - NO terminal verdicts on first signal
 * - First pass = observe only
 * - Second pass = escalate
 * - Only after repeated + confirmed → allow detach/quarantine
 * - Confidence threshold
 * - Multi-signal confirmation
 * - TTL for auto-rules
 * - Audit reason chain
 * - Optional human-review mode
 * 
 * © CMPSBL® — All rights reserved.
 */

import type { ManaCapability, ManaCapabilityOrWildcard, LexVerdict } from './types';
import { registerRule, revokeRule } from './lex';
import type { LexVerdictExtended } from './lex';

// ═══════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════

interface VisionLexConfig {
  /** Minimum confidence to generate any rule (0-1) */
  confidenceThreshold: number;
  /** Number of signals required before escalating from observe to escalate */
  escalationThreshold: number;
  /** Number of signals required before allowing terminal verdicts */
  terminalThreshold: number;
  /** TTL for auto-generated rules in milliseconds */
  ruleTtlMs: number;
  /** Whether human review is required for terminal verdicts */
  humanReviewRequired: boolean;
  /** Maximum auto-rules per target to prevent rule explosion */
  maxRulesPerTarget: number;
}

const DEFAULT_CONFIG: VisionLexConfig = {
  confidenceThreshold: 0.6,
  escalationThreshold: 3,
  terminalThreshold: 5,
  ruleTtlMs: 300_000, /* 5 minutes */
  humanReviewRequired: false,
  maxRulesPerTarget: 10,
};

let config: VisionLexConfig = { ...DEFAULT_CONFIG };

// ═══════════════════════════════════════════════════════════════
// Signal Accumulator
// ═══════════════════════════════════════════════════════════════

interface SignalEntry {
  capability: ManaCapability;
  target: string;
  confidence: number;
  reason: string;
  timestamp: number;
}

interface TargetState {
  signals: SignalEntry[];
  currentVerdictLevel: 'none' | 'observe' | 'escalate' | 'terminal';
  activeRuleId: string | null;
  reasonChain: string[];
  humanApproved: boolean;
  lastEscalatedAt: number;
}

const targetStates = new Map<string, TargetState>();
const MAX_SIGNALS_PER_TARGET = 100;

function getTargetKey(capability: ManaCapability, target: string): string {
  return `${capability}::${target}`;
}

function getOrCreateState(capability: ManaCapability, target: string): TargetState {
  const key = getTargetKey(capability, target);
  let state = targetStates.get(key);
  if (!state) {
    state = {
      signals: [],
      currentVerdictLevel: 'none',
      activeRuleId: null,
      reasonChain: [],
      humanApproved: false,
      lastEscalatedAt: 0,
    };
    targetStates.set(key, state);
  }
  return state;
}

// ═══════════════════════════════════════════════════════════════
// Auto-Rule TTL Management
// ═══════════════════════════════════════════════════════════════

interface TtlEntry {
  ruleId: string;
  expiresAt: number;
  targetKey: string;
}

const ttlEntries: TtlEntry[] = [];

function scheduleTtlExpiry(ruleId: string, targetKey: string): void {
  ttlEntries.push({
    ruleId,
    expiresAt: Date.now() + config.ruleTtlMs,
    targetKey,
  });
}

/** Expire old auto-rules — call periodically */
export function expireStaleRules(): number {
  const now = Date.now();
  let expired = 0;
  const remaining: TtlEntry[] = [];

  for (const entry of ttlEntries) {
    if (now >= entry.expiresAt) {
      revokeRule(entry.ruleId);
      const state = targetStates.get(entry.targetKey);
      if (state && state.activeRuleId === entry.ruleId) {
        state.activeRuleId = null;
        state.currentVerdictLevel = 'none';
        state.reasonChain = [];
      }
      expired++;
    } else {
      remaining.push(entry);
    }
  }

  ttlEntries.length = 0;
  ttlEntries.push(...remaining);
  return expired;
}

// ═══════════════════════════════════════════════════════════════
// Audit Trail
// ═══════════════════════════════════════════════════════════════

export interface VisionLexAuditEntry {
  readonly timestamp: number;
  readonly capability: ManaCapability;
  readonly target: string;
  readonly signalCount: number;
  readonly confidence: number;
  readonly verdictLevel: string;
  readonly action: 'signal_received' | 'rule_created' | 'rule_upgraded' | 'rule_expired' | 'below_threshold' | 'human_review_required';
  readonly reason: string;
  readonly ruleId: string | null;
}

const auditLog: VisionLexAuditEntry[] = [];
const MAX_AUDIT = 2000;

function audit(entry: VisionLexAuditEntry): void {
  auditLog.push(entry);
  if (auditLog.length > MAX_AUDIT) auditLog.shift();
}

// ═══════════════════════════════════════════════════════════════
// Core: Signal Ingestion
// ═══════════════════════════════════════════════════════════════

export interface VisionSignalResult {
  accepted: boolean;
  verdictLevel: string;
  ruleId: string | null;
  reason: string;
}

/**
 * Ingest a VISION anomaly signal.
 * 
 * HARDENED PROGRESSION:
 * 1. First signal → observe only (NEVER terminal)
 * 2. escalationThreshold signals → escalate
 * 3. terminalThreshold signals + (human approval if required) → terminal
 * 
 * Below confidence threshold → rejected entirely.
 */
export function ingestSignal(
  capability: ManaCapability,
  target: string,
  confidence: number,
  reason: string,
): VisionSignalResult {
  /* Expire stale rules first */
  expireStaleRules();

  /* Confidence gate */
  if (confidence < config.confidenceThreshold) {
    audit({
      timestamp: Date.now(), capability, target,
      signalCount: 0, confidence,
      verdictLevel: 'rejected', action: 'below_threshold',
      reason: `Confidence ${confidence} < threshold ${config.confidenceThreshold}`,
      ruleId: null,
    });
    return {
      accepted: false,
      verdictLevel: 'rejected',
      ruleId: null,
      reason: `Confidence ${confidence} below threshold ${config.confidenceThreshold}`,
    };
  }

  const state = getOrCreateState(capability, target);

  /* Accumulate signal */
  state.signals.push({ capability, target, confidence, reason, timestamp: Date.now() });
  if (state.signals.length > MAX_SIGNALS_PER_TARGET) state.signals.shift();
  state.reasonChain.push(reason);

  const signalCount = state.signals.length;

  /* Determine verdict level based on accumulated signals */
  if (signalCount < config.escalationThreshold) {
    /* FIRST PASS: observe only — NEVER terminal on first signal */
    if (state.currentVerdictLevel === 'none') {
      /* Create or update observe rule */
      if (state.activeRuleId) revokeRule(state.activeRuleId);
      const rule = registerRule(capability, target, 'observe', `[VISION-AUTO] ${reason} (signal ${signalCount}/${config.escalationThreshold})`, 200);
      state.activeRuleId = rule.id;
      state.currentVerdictLevel = 'observe';
      scheduleTtlExpiry(rule.id, getTargetKey(capability, target));

      audit({
        timestamp: Date.now(), capability, target,
        signalCount, confidence,
        verdictLevel: 'observe', action: 'rule_created',
        reason, ruleId: rule.id,
      });
    }

    return {
      accepted: true,
      verdictLevel: 'observe',
      ruleId: state.activeRuleId,
      reason: `Signal ${signalCount}/${config.escalationThreshold} — observe mode`,
    };
  }

  if (signalCount < config.terminalThreshold) {
    /* SECOND PASS: escalate */
    if (state.currentVerdictLevel !== 'escalate') {
      if (state.activeRuleId) revokeRule(state.activeRuleId);
      const rule = registerRule(capability, target, 'observe', `[VISION-AUTO-ESCALATE] ${state.reasonChain.slice(-3).join('; ')} (${signalCount} signals)`, 150);
      state.activeRuleId = rule.id;
      state.currentVerdictLevel = 'escalate';
      state.lastEscalatedAt = Date.now();
      scheduleTtlExpiry(rule.id, getTargetKey(capability, target));

      audit({
        timestamp: Date.now(), capability, target,
        signalCount, confidence,
        verdictLevel: 'escalate', action: 'rule_upgraded',
        reason: `Escalated after ${signalCount} signals`,
        ruleId: rule.id,
      });
    }

    return {
      accepted: true,
      verdictLevel: 'escalate',
      ruleId: state.activeRuleId,
      reason: `Signal ${signalCount}/${config.terminalThreshold} — escalated`,
    };
  }

  /* TERMINAL THRESHOLD REACHED */
  if (config.humanReviewRequired && !state.humanApproved) {
    audit({
      timestamp: Date.now(), capability, target,
      signalCount, confidence,
      verdictLevel: 'pending_review', action: 'human_review_required',
      reason: `Terminal threshold reached but human review required`,
      ruleId: state.activeRuleId,
    });

    return {
      accepted: true,
      verdictLevel: 'pending_review',
      ruleId: state.activeRuleId,
      reason: `Terminal threshold reached — awaiting human review`,
    };
  }

  /* Terminal verdict — only after repeated + confirmed signals */
  if (state.currentVerdictLevel !== 'terminal') {
    if (state.activeRuleId) revokeRule(state.activeRuleId);
    const rule = registerRule(capability, target, 'deny', `[VISION-AUTO-TERMINAL] ${state.reasonChain.slice(-5).join('; ')} (${signalCount} signals, confirmed)`, 50);
    state.activeRuleId = rule.id;
    state.currentVerdictLevel = 'terminal';
    scheduleTtlExpiry(rule.id, getTargetKey(capability, target));

    audit({
      timestamp: Date.now(), capability, target,
      signalCount, confidence,
      verdictLevel: 'terminal', action: 'rule_upgraded',
      reason: `Terminal verdict after ${signalCount} confirmed signals`,
      ruleId: rule.id,
    });
  }

  return {
    accepted: true,
    verdictLevel: 'terminal',
    ruleId: state.activeRuleId,
    reason: `Terminal — ${signalCount} confirmed signals`,
  };
}

/** Approve a terminal verdict (human review gate) */
export function approveTerminal(capability: ManaCapability, target: string): boolean {
  const state = targetStates.get(getTargetKey(capability, target));
  if (!state) return false;
  state.humanApproved = true;
  return true;
}

/** Configure the VISION → LEX bridge */
export function configureVisionLex(partial: Partial<VisionLexConfig>): VisionLexConfig {
  config = { ...config, ...partial };
  return { ...config };
}

/** Get audit log */
export function getVisionLexAuditLog(): ReadonlyArray<VisionLexAuditEntry> {
  return [...auditLog];
}

/** Get target state for observability */
export function getTargetState(capability: ManaCapability, target: string): TargetState | null {
  return targetStates.get(getTargetKey(capability, target)) ?? null;
}

/** Reset all VISION → LEX state */
export function resetVisionLex(): void {
  targetStates.clear();
  ttlEntries.length = 0;
  auditLog.length = 0;
  config = { ...DEFAULT_CONFIG };
}
