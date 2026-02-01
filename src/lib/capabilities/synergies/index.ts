/**
 * Synergy System Exports
 * v7.0.0 — Cross-Module Pipeline Infrastructure
 */

// Types
export type {
  SynergyCategory,
  SynergyStatus,
  SynergyModule,
  SynergyDefinition,
  SynergyExecutionContext,
  SynergyStepResult,
  SynergyResult,
  SynergyRegistry,
  SynergyExecutor,
} from './types';

// Registry
export {
  SYNERGY_DEFINITIONS,
  initSynergyRegistry,
  registerSynergyExecutor,
  getSynergy,
  getSynergyExecutor,
  listSynergies,
  getSynergiesByModule,
  getSynergyCategories,
} from './registry';

// Engine
export {
  executeSynergy,
  dryRunSynergy,
  getRecommendedSynergies,
} from './engine';

// Executors
export {
  registerAllExecutors,
  executeSmartRecall,
  executeAdaptiveRouting,
  executeGracefulDegradation,
  executeLearningAcceleration,
  executeCascadePrevention,
  executeAnomalyCorrelation,
  executeCognitiveFusion,
  executeIntentAmplification,
} from './executors';

// Auto-register executors
import { registerSynergyExecutor } from './registry';
import { registerAllExecutors } from './executors';
registerAllExecutors(registerSynergyExecutor);
