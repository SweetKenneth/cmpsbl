/**
 * Capability Auto-Activation Engine — Unified API v2.0.0
 * 
 * The substrate's autonomic nervous system. Transforms 100 idle capabilities
 * into event-reactive behaviors by wiring them through the NERVE signal router.
 * 
 * Architecture:
 *   System Event → processSignal() → Pattern Match → Arbitration → Confidence Gate → Guard Layer → Execute → Stats → Telemetry
 */

// Engine core
export {
  processSignal,
  governanceBlock,
  governanceUnblock,
  getGovernanceBlocks,
  configure as configureEngine,
  getConfig as getEngineConfig,
  setEnabled,
  getHealth as getEngineHealth,
  getRecentEvents,
  getEventsForRule,
  getLastArbitrationPlan,
  resetEngine,
  type ActivationOutcome,
  type ActivationEvent,
  type EngineConfig,
  type EngineHealth,
} from './activationEngine';

// Arbitration
export {
  arbitrate,
  type ArbitrationContext,
  type ArbitrationPlan,
} from './activationArbitrator';

// Confidence Gating
export {
  computeConfidence,
  recordSuccess,
  recordFailure,
  getRuleStats,
  getAllStats as getAllConfidenceStats,
  getThresholds as getConfidenceThresholds,
  resetStats as resetConfidenceStats,
  type RuleStats,
  type ConfidenceResult,
  type ConfidenceContext,
} from './confidenceGating';

// Registry
export {
  ACTIVATION_RULES,
  getRule,
  getRulesByTier,
  getRulesForNode,
  getEnabledRules,
  getRegistryStats,
  type ActivationTier,
  type ActivationTrigger,
  type CapabilityActivationRule,
} from './capabilityActivationRegistry';
