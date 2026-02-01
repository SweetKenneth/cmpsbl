/**
 * SEBA Module Exports
 * v1.0.0 — Self-Evolving Bounded Agent
 */

// Main Agent
export { sebaAgent, SEBAAgent } from './seba-agent';

// Types
export {
  DEFAULT_SEBA_CONFIG,
  type SEBAPhase,
  type SEBAMode,
  type ImprovementCategory,
  type RiskLevel,
  type ImprovementProposal,
  type ProposedAction,
  type GovernanceDecision,
  type EvolutionExecution,
  type SEBAState,
  type SEBACycleResult,
  type SEBAAuditEntry,
  type CognitiveInsight,
  type SEBAConfig,
  type SEBACommand,
  type SEBACommandResult,
} from './types';

// Sub-modules (for direct access if needed)
export { CognitiveAnalyzer } from './cognitive-analyzer';
export { ProposalGenerator } from './proposal-generator';
export { GovernanceGate } from './governance-gate';
export { EvolutionExecutor } from './evolution-executor';

// React Hook
export { useSEBA, type UseSEBAReturn } from './useSEBA';
