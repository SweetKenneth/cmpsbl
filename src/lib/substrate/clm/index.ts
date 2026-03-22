/**
 * Constant Learning Mode (CLM) Module
 * Always-on, rate-limited, spaced, reflective learning
 * 
 * Now includes dedicated Encoded learning engine for 24/7 code-writing improvement.
 * Integrates with 62 Engines and 20 Meta-Engines for comprehensive skill building.
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

// Encoded Curriculum (Code-Writing Excellence)
export {
  ENCODED_CODE_CURRICULUM,
  getEncodedCurriculum,
  getEncodedTopic,
  getEncodedCurriculumStats,
  ENCODED_CURRICULUM_VERSION,
} from './encoded-curriculum';

// Encoded Learning Engine (24/7 Code Mastery)
export {
  encodedLearningEngine,
  type CodeLearningJob,
  type CodeLearningResult,
  type EncodedLearningState,
} from './encoded-learning-engine';

// Spaced Repetition
export {
  spacedRepetition,
  SpacedRepetitionClient,
  type SpacedRepItem,
  type ReviewResult,
} from './spaced-repetition';

// Deep Dive URL Registry
export {
  DEEP_DIVE_SOURCES,
  selectDeepDiveSource,
  getSourcesForModule,
  getCoveredModules,
  getSourceStats,
  type DeepDiveSource,
} from './deep-dive-urls';

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
import { encodedLearningEngine } from './encoded-learning-engine';

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
  encodedLearning: EncodedLearningState;
} {
  const config = budgetGovernor.getConfig();
  const budgetState = budgetGovernor.getState();
  const tier = tierCommand.getCurrentTier();
  const orchestratorState = learningOrchestrator.getState();
  const srTotal = spacedRepetition.getQueueSize();
  // Avoid calling getCoreCurriculum() + getEncodedCurriculum() every 30s poll;
  // use static lengths from the source arrays.
  const topicsCount = 23 + 50; // CORE_CURRICULUM.length + ENCODED_CODE_CURRICULUM.length (static)

  return {
    enabled: config.enabled && !config.killSwitch,
    running: orchestratorState.isRunning || encodedLearningEngine.getState().isRunning,
    kill_switch: config.killSwitch,
    budget_used: budgetState.usedUnits,
    budget_total: budgetState.totalBudgetUnits,
    topics_count: topicsCount,
    review_queue_size: srTotal,
    budget: budgetState,
    tier,
    srQueueSize: srTotal,
    orchestratorState,
    encodedLearning: encodedLearningEngine.getState(),
  };
}

/**
 * Enable CLM (includes Encoded learning)
 */
export function enableCLM(): void {
  budgetGovernor.setEnabled(true);
  encodedLearningEngine.start();
}

/**
 * Disable CLM
 */
export function disableCLM(): void {
  budgetGovernor.setEnabled(false);
  encodedLearningEngine.stop();
}

/**
 * Activate kill switch
 */
export function activateKillSwitch(): void {
  budgetGovernor.activateKillSwitch();
  encodedLearningEngine.stop();
}

/**
 * Deactivate kill switch
 */
export function deactivateKillSwitch(): void {
  budgetGovernor.deactivateKillSwitch();
  encodedLearningEngine.start();
}

/**
 * Start Encoded 24/7 learning (code-writing only)
 */
export function startEncodedLearning(): void {
  encodedLearningEngine.start();
}

/**
 * Stop Encoded learning
 */
export function stopEncodedLearning(): void {
  encodedLearningEngine.stop();
}

/**
 * Get Encoded learning mastery
 */
export function getEncodedMastery(): number {
  return encodedLearningEngine.getOverallMastery();
}

// Re-export types
import type { OrchestratorState } from './orchestrator';
import type { TierInfo } from './tier-command';
import type { LearningJobResult, BudgetState } from './config';
import type { EncodedLearningState } from './encoded-learning-engine';
