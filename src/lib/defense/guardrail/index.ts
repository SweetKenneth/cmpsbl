/**
 * DEFENSE Guardrail Layer — Barrel Export
 * 
 * Prevents automatic self-locking, runaway threshold escalation,
 * and anomaly-triggered instability.
 * 
 * Phase 1: Proposal Gate (no direct auto-enforcement)
 */

// Types
export type {
  ProposalStatus,
  ProposalCategory,
  ProposedAdjustment,
  ShadowMetrics,
  PromotionGateResult,
  GuardrailLogEntry,
} from './types';

// Proposal Store
export {
  createProposal,
  checkPromotionGate,
  transitionProposal,
  getProposals,
  getProposal,
  getProposalStats,
  setEvaluationWindow,
  clearProposals,
  setSpikeActive,
  isSpikeActive,
} from './proposal-store';

// Structured Logger
export {
  guardrailLog,
  getGuardrailLogs,
  clearGuardrailLogs,
} from './logger';
