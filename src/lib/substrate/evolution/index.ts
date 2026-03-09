/**
 * EVOLUTION — Barrel Export
 * Re-exports core module, control-center, CLM, and hardening
 */

// Core module state & health
export {
  initEvolution,
  getEvolutionState,
  getEvolutionHealth,
  getEvolutionResilience,
  getEvolutionEngine,
  getEvolutionHardening,
  upgradeEvolutionEngine,
  type EvolutionModuleState,
} from './module';

// Control center lifecycle
export {
  runEvolutionCycle,
  rollbackEvolution,
  getRecentCycles,
  getActiveCycle,
  type EvolutionCycle,
} from './control-center';

// CLM
export { runEvolutionCLM, type EvolutionCLMDiagnostic, type EvolutionCLMReport } from './clm';

// Hardening
export {
  EVOLUTION_LIMITS,
  validateCycleInput,
  validateRollbackInput,
  type EvolutionValidationResult,
} from './hardening';
