/**
 * Execution Layer — Main exports
 * Provides execution capabilities for agents
 */

// Action Grammar
export {
  type ActionType,
  type ActionStatus,
  type ActionPrimitive,
  type ActionResult,
  type EvidenceBundle,
  type ExecutionPlan,
  Actions,
  parseActionIntent,
  validatePlan,
} from './actionGrammar';

// Web Actuator
export {
  type WebActuatorConfig,
  type FetchResult,
  webFetch,
  webExtract,
  webSearch,
  webCrawl,
  executeAction,
} from './webActuator';

// Integrations
export {
  type Integration,
  type IntegrationEndpoint,
  type IntegrationStatus,
  INTEGRATIONS,
  INTEGRATION_CATEGORIES,
  getIntegrationsByCategory,
  getFreeIntegrations,
  isIntegrationAvailable,
  buildIntegrationUrl,
} from './integrations';

// Verifier
export {
  type VerificationResult,
  type CreditAssignment,
  verifyExecution,
  calculateCredit,
  determineRecoveryStrategy,
  storeExecutionTrace,
  updateAgentCompetency,
} from './verifier';

// Governed Pipeline (authority-bearing layered runtime)
export {
  type GovernedLayerName,
  type GovernedLayerResult,
  type GovernedPhase,
  type GovernedExecutionContext,
  type GovernedLayer,
  type GovernedPipelineOptions,
  executeGovernedPipeline,
  DEFENSE_LAYER,
  GOVERNANCE_LAYER,
  MEMORY_LAYER,
  FORESIGHT_LAYER,
  NEXUS_LAYER,
  EVOLUTION_LAYER,
  AUDIT_LAYER,
  COMPLIANCE_LAYER,
  DEFAULT_GOVERNED_LAYERS,
} from './governedPipeline';

// SENTINEL — Audit-Chain Witness Agent (paired with Governed Pipeline)
export {
  type SentinelVerdict,
  type SentinelReading,
  witnessAuditChain,
  persistWitnessReading,
  sentinelObserve,
} from './sentinel';

// Planner
export {
  type PlannerConfig,
  type ExecutionContext,
  type ExecutionOutcome,
  createPlan,
  executePlan,
  executeSimpleTask,
  isTaskExecutable,
  estimateExecutionTime,
} from './planner';
