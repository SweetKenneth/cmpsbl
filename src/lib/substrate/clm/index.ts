/**
 * Constant Learning Mode (CLM) Module
 * v6.7.0 — Always-on, rate-limited, spaced, reflective learning
 * 
 * Exports all CLM components for substrate integration.
 */

// Configuration
export {
  type CLMConfig,
  type BudgetState,
  type LearningJobResult,
  DEFAULT_CLM_CONFIG,
  loadCLMConfigFromEnv,
  isInQuietHours,
  calculateJitteredDelay,
  calculateBackoffDelay,
} from './config';

// Budget Governor
export {
  budgetGovernor,
  BudgetGovernorClient,
} from './budget-governor';

// Topic Bank
export {
  topicBank,
  TopicBankClient,
  CORE_CURRICULUM,
  type Topic,
  type TopicCategory,
  type TopicSelection,
} from './topic-bank';

// Spaced Repetition
export {
  spacedRepetition,
  SpacedRepetitionClient,
  type SpacedRepItem,
  type ReviewResult,
} from './spaced-repetition';

// Orchestrator
export {
  learningOrchestrator,
  LearningOrchestratorClient,
  type LearningJob,
  type OrchestratorState,
} from './orchestrator';

// Tier Command
export {
  tierCommand,
  TierCommandClient,
  TIERS,
  type TierInfo,
  type TierLimits,
  type TierCommandResult,
} from './tier-command';

// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

import { budgetGovernor } from './budget-governor';
import { learningOrchestrator } from './orchestrator';
import { tierCommand } from './tier-command';
import { spacedRepetition } from './spaced-repetition';
import { topicBank } from './topic-bank';

/**
 * Check if CLM is ready to run
 */
export function isCLMReady(): { ready: boolean; reason: string } {
  const check = budgetGovernor.canExecute();
  return { ready: check.allowed, reason: check.reason };
}

/**
 * Run a single CLM cycle
 */
export async function runCLMCycle(): Promise<LearningJobResult | null> {
  return learningOrchestrator.runCycle();
}

/**
 * Get CLM status summary (terminal-compatible format)
 */
export function getCLMStatus(): {
  enabled: boolean;
  running: boolean;
  kill_switch: boolean;
  budget_used: number;
  budget_total: number;
  topics_count: number;
  review_queue_size: number;
  budget: BudgetState;
  tier: TierInfo;
  srQueueSize: number;
  orchestratorState: OrchestratorState;
} {
  const config = budgetGovernor.getConfig();
  const budgetState = budgetGovernor.getState();
  const tier = tierCommand.getCurrentTier();
  const orchestratorState = learningOrchestrator.getState();
  const srSummary = spacedRepetition.getQueueSummary();
  const curriculum = topicBank.getCoreCurriculum();

  return {
    enabled: config.enabled && !config.killSwitch,
    running: orchestratorState.isRunning,
    kill_switch: config.killSwitch,
    budget_used: budgetState.usedUnits,
    budget_total: budgetState.totalBudgetUnits,
    topics_count: curriculum.length,
    review_queue_size: srSummary.total,
    budget: budgetState,
    tier,
    srQueueSize: srSummary.total,
    orchestratorState,
  };
}

/**
 * Enable CLM
 */
export function enableCLM(): void {
  budgetGovernor.setEnabled(true);
}

/**
 * Disable CLM
 */
export function disableCLM(): void {
  budgetGovernor.setEnabled(false);
}

/**
 * Activate kill switch
 */
export function activateKillSwitch(): void {
  budgetGovernor.activateKillSwitch();
}

/**
 * Deactivate kill switch
 */
export function deactivateKillSwitch(): void {
  budgetGovernor.deactivateKillSwitch();
}

// Re-export types
import type { OrchestratorState } from './orchestrator';
import type { TierInfo } from './tier-command';
import type { LearningJobResult, BudgetState } from './config';
