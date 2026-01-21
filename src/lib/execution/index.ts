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
