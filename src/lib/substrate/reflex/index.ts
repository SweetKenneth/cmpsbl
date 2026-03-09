/**
 * REFLEX Node — Expansion Perception Zone (EPZ)
 * Real-time edge decisions, reactive triggers, sub-10ms response loops.
 *
 * Re-exports core reflex-module and adds CLM + hardening layers.
 */

export {
  initReflex,
  registerNode,
  addRule,
  decide,
  heartbeat,
  getReflexState,
  getReflexHealth,
  getReflexResilience,
  getReflexEngine,
  getReflexHardening,
  upgradeReflexEngine,
  type EdgeNodeStatus,
  type DecisionPriority,
  type EdgeNode,
  type ReflexDecision,
  type ReflexRule,
  type ReflexModuleState,
} from '../reflex-module';

export { reflexCLM, runReflexCLMCycle, type ReflexCLMInsight, type ReflexCLMReport } from './clm';
export { reflexHardeningReport, validateReflexInput, REFLEX_LIMITS } from './hardening';
