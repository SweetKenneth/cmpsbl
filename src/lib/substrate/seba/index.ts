/**
 * SEBA Module Exports
 * Self-Evolving Bounded Agent (Full Spectrum Autonomy)
 * 
 * SEBA runs continuously in the background, scanning for improvements,
 * generating proposals, and (when approved) applying changes with full
 * rollback capability and cryptographic audit trails.
 * 
 * Architecture: 9 Specialized Analysis Engines → Shadow-to-Production Pipeline
 */

// Main Agent
export { sebaAgent, SEBAAgent } from './seba-agent';

// Types
export {
  SEBA_VERSION,
  SEBA_CODENAME,
  DEFAULT_SEBA_CONFIG,
  SEBA_SAFETY_CONTROLS,
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

// LLM-Enhanced Analysis (v1.0.0)
export { 
  LLMAnalyzer, 
  formatPredictedImpact, 
  summarizePredictedImpacts,
  type PredictedImpact,
  type EnhancedInsight,
  type LLMAnalysisResult,
} from './llm-analyzer';

// Persistence
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


// Cross-Validator & Proposal Chaining (v3.1.0)
export {
  validateExecution,
  createProposalChain,
  executeChainStep,
  completeChainStep,
  type ValidationResult,
  type Deviation,
  type ProposalChain,
  type ChainedProposal,
} from './cross-validator';
