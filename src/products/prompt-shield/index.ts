/**
 * PROMPT-SHIELD v1.0.0
 * Cross-Vertical LLM Prompt Defense System
 *
 * The first CMPSBL® product to require cross-vertical primitive selection.
 * Scanner must autonomously pull from LLM + Cyber + Spine pools.
 *
 * LLM Vertical:  VERITAS, RAMPART, SIEVE, GAUNTLET
 * Cyber Vertical: BASTION, WATCHTOWER
 * Spine:          DEFENSE, GOVERNANCE, CONSCIENCE, COMPASS, AUDIT, BEACON
 *
 * © CMPSBL® — All rights reserved.
 */

export { PromptShield } from './shield';
export type {
  PromptInput,
  ConversationContext,
  DetectedThreat,
  HallucinationCheck,
  GroundingReport,
  SanitizationResult,
  GovernanceDecision,
  ShieldReceipt,
  ShieldRunResult,
  ShieldMetrics,
  PromptShieldConfig,
  GovernancePolicy,
  ThreatCategory,
  ThreatSeverity,
  DefenseAction,
  AnalysisVerdict,
} from './types';

// Lifecycle bridge
export { getLifecycleSummary } from './shield';
