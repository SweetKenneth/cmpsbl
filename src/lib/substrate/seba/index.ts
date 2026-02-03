/**
 * SEBA Module Exports
 * v2.0.0 — Self-Evolving Bounded Agent (24/7 Autonomous Evolution)
 * 
 * SEBA runs continuously in the background, scanning for improvements,
 * generating proposals, and (when approved) applying changes with full
 * rollback capability and cryptographic audit trails.
 */

// Main Agent
export { sebaAgent, SEBAAgent } from './seba-agent';

// Types
export {
  SEBA_VERSION,
  SEBA_CODENAME,
  DEFAULT_SEBA_CONFIG,
  type SEBAPhase,
  type SEBAMode,
  type ImprovementCategory,
  type RiskLevel,
  type ProposalStatus,
  type ImprovementProposal,
  type ProposedAction,
  type GovernanceDecision,
  type EvolutionExecution,
  type ActionResult,
  type SEBAState,
  type SEBACycleResult,
  type SEBAAuditEntry,
  type CognitiveInsight,
  type SEBAConfig,
  type SEBACommand,
  type SEBACommandResult,
  type SEBAMetrics,
  type SEBAHealth,
} from './types';

// Sub-modules (for direct access if needed)
export { CognitiveAnalyzer } from './cognitive-analyzer';
export { ProposalGenerator } from './proposal-generator';
export { GovernanceGate } from './governance-gate';
export { EvolutionExecutor } from './evolution-executor';
export { ProposalStore, type StoredProposal } from './proposal-store';
export { 
  SEBAReceiptStore,
  type SEBAReceipt,
  type SEBAProposalSummary,
} from './receipt-store';
export { 
  EvolutionStampGenerator, 
  EvolutionStampStore, 
  generateEvolutionComment,
  parseEvolutionComment,
  type EvolutionStamp,
} from './evolution-stamp';

// React Hook (deprecated - use src/hooks/useSEBA.ts instead)
export { useSEBA, type UseSEBAReturn } from './useSEBA';
