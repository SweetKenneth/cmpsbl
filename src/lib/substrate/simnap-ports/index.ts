/**
 * SimNap Ports — Barrel Export
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * All architectural patterns ported from the SimNap (mind-reconstruction-lab)
 * project, adapted for the substrate's 40-node matrix.
 * 
 * 7 core patterns serving 28+ nodes.
 */

// 1. Autonomous Decision Policy — DREAM, ENGINEER, EVOLUTION, MEDIC, CLM
export {
  evaluatePolicy,
  clearCooldown,
  clearAllCooldowns,
  DREAM_POLICY,
  ENGINEER_POLICY,
  EVOLUTION_POLICY,
  MEDIC_POLICY,
  CLM_POLICY,
  type DecisionContext,
  type PolicyRule,
  type DecisionResult,
  type ConditionFn,
  type ActionId,
} from './autonomous-decision-policy';

// 2. Tiered Memory Decay — MEMORY, DREAM, BRAIN, DECODE, ANALYTICS
export {
  computeDecayScore,
  targetTier,
  rebalanceMemory,
  recordAccess,
  createMemoryEntry,
  getTierDistribution,
  DEFAULT_REBALANCE_CONFIG,
  type MemoryTier,
  type MemoryEntry,
  type TierConfig,
  type RebalanceConfig,
  type RebalanceResult,
} from './tiered-memory-decay';

// 3. Module State Machine & Self-Repair — NERVE, ENGINEER, EVOLUTION, SHADOW, PHANTOM, IMMUNITY, MEDIC, RELAY, BRAIN
export {
  createModuleStateMachine,
  STANDARD_TRANSITIONS,
  type ModulePhase,
  type PhaseTransition,
  type ModuleState,
  type ErrorEvent,
  type HeartbeatConfig,
  type SelfRepairConfig,
  type ModuleStateMachine,
} from './module-state-machine';

// 4. Intent Parser — INTENT, DECODE, DREAM, NEXUS
export {
  parseIntent,
  parseIntents,
  type IntentCategory,
  type ParsedIntent,
  type IntentSlot,
  type IntentPattern,
} from './intent-parser';

// 5. Context Hydration — BRAIN, NEXUS, DREAM, ORACLE
export {
  hydrateContext,
  createContextSource,
  createCachedContextSource,
  DEFAULT_HYDRATION_CONFIG,
  type ContextSource,
  type ContextFragment,
  type HydratedContext,
  type HydrationConfig,
} from './context-hydration';

// 6. Windowed Reflection — DREAM, GOVERNANCE, AUDIT, CONSCIENCE, ORACLE
export {
  addReflectionEntry,
  getWindowEntries,
  synthesizeWindow,
  getSynthesisHistory,
  clearReflectionBuffer,
  DEFAULT_REFLECTION_CONFIG,
  type ReflectionWindow,
  type ReflectionEntry,
  type ReflectionSynthesis,
  type SynthesizedPattern,
  type ReflectionConfig,
} from './windowed-reflection';

// 7a. Domain-Focused Learning — CLM, MEMORY, BRAIN
export {
  registerDomain,
  getDomains,
  getDomain,
  submitLearning,
  getNextLearningDomain,
  getLearningStats,
  applyMasteryDecay,
  clearDomainRegistry,
  DEFAULT_DOMAIN_CONFIG,
  type LearningDomain,
  type LearningEvent,
  type DomainLearningConfig,
} from './domain-focused-learning';

// 7b. Safe Patching & Sanitization — ENCODE, EVOLUTION, DEFENSE, RELAY, IDENTITY
export {
  createPatch,
  validatePatch,
  applyPatch,
  getPatchHistory,
  sanitizeInput,
  constrainInput,
  DEFAULT_SANITIZATION_RULES,
  type PatchOperation,
  type PatchResult,
  type PatchHistory,
  type SanitizationRule,
  type SanitizationResult,
} from './safe-patching-sanitization';

// 7c. Real-State Diagnostics — VISION, MEDIC, ANALYTICS
export {
  runDiagnostics,
  createProbe,
  type DiagnosticProbe,
  type ProbeResult,
  type DiagnosticReport,
  type DiagnosticAnomaly,
} from './real-state-diagnostics';

// ── Version ───────────────────────────────────────────────────────
export const SIMNAP_PORTS_VERSION = '1.0.0';
export const SIMNAP_PORTS_CODENAME = 'Transplant';
export const SIMNAP_PORT_COUNT = 7;
export const SIMNAP_NODE_COVERAGE = 28;
