/**
 * Terminal Exports
 * Command execution, validation, governance, synergy, SEBA, encoded commands, infrastructure
 */

// Command execution with governance
export {
  executeCommand,
  dryRunCommand,
  executeWithApproval,
  executeImmediate,
  type ExecuteOptions,
  type CommandResult,
} from './execute';

// Registry validation
export {
  registerHandler,
  hasHandler,
  getHandler,
  validateRegistry,
  validateCommandOutput,
  getRegistrationStats,
  clearHandlers,
  type CommandDefinition,
  type ValidationResult,
} from './validate-registry';

// Synergy handlers
export {
  registerSynergyHandlers,
  executeSynergyCommand,
  getSynergiesByModuleCommand,
} from './synergy-handlers';

// Encoded handlers
export {
  registerEncodedHandlers,
  executeEncodedCommand,
  setEncodedMode,
} from './encoded-handlers';

// SEBA handlers
export {
  registerSEBAHandlers,
  executeSEBACommand,
} from './seba-handlers';

// Infrastructure handlers
export {
  registerInfraHandlers,
} from './infra-handlers';

// ENCODE module handlers
export {
  registerEncodeModuleHandlers,
} from './encode-handlers';

// Infrastructure Six module handlers
export {
  registerInfraModuleHandlers,
} from './infra-module-handlers';

// Intent Mesh handlers
export {
  registerMeshHandlers,
} from './mesh-handlers';

// Observability handlers
export {
  registerObservabilityHandlers,
} from './observability-handlers';

// Governance handlers
export {
  registerGovernanceHandlers,
} from './governance-handlers';

// Analytics handlers
export {
  registerAnalyticsHandlers,
} from './analytics-handlers';

// Spine & CCR handlers (CORE, SYSTEM, BRAIN, DREAM)
export {
  registerSpineHandlers,
} from './spine-handlers';

// OCG & Shell handlers (RIPPLE, ACCESS, DEFENSE)
export {
  registerOCGHandlers,
} from './ocg-handlers';

// Execution layer handlers (DECODE, NEXUS, VISION, CORTEX, INCLUSIVE, INTEGRATION, EVOLUTION)
export {
  registerExecutionHandlers,
} from './execution-handlers';

// Hardening observability handlers (all 8 hardened modules)
export {
  registerHardeningHandlers,
} from './hardening-handlers';

// Expansion module handlers (40-Primitive / 12-Category Architecture)
export {
  registerExpansionHandlers,
} from './expansion-handlers';

// System audit & self-repair handlers
export {
  registerSystemAuditHandlers,
} from './system-audit-handlers';
