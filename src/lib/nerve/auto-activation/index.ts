/**
 * Capability Auto-Activation Engine — Unified API
 * 
 * The substrate's autonomic nervous system. Transforms 50 idle capabilities
 * into event-reactive behaviors by wiring them through the NERVE signal router.
 * 
 * Architecture:
 *   System Event → processSignal() → Pattern Match → Guard Layer → Execute → Telemetry
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
  resetEngine,
  type ActivationOutcome,
  type ActivationEvent,
  type EngineConfig,
  type EngineHealth,
} from './activationEngine';

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
