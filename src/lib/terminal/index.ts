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

// Infrastructure handlers (v8.5.0)
export {
  registerInfraHandlers,
} from './infra-handlers';

// ENCODE module handlers (v9.1.0)
export {
  registerEncodeModuleHandlers,
} from './encode-handlers';

// Infrastructure Six module handlers (v9.2.0)
export {
  registerInfraModuleHandlers,
} from './infra-module-handlers';

// Intent Mesh handlers (v10.0)
export {
  registerMeshHandlers,
} from './mesh-handlers';

// Observability handlers (v11.5.0)
export {
  registerObservabilityHandlers,
} from './observability-handlers';

// Governance handlers (v11.5.0)
export {
  registerGovernanceHandlers,
} from './governance-handlers';

// Analytics handlers (v11.5.2)
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

// Execution layer handlers (DECODE, NEXUS, VISION, CORTEX, INCLUSIVE, INTEGRATION, MODERNIZER)
export {
  registerExecutionHandlers,
} from './execution-handlers';

// Hardening observability handlers (all 8 hardened modules)
export {
  registerHardeningHandlers,
} from './hardening-handlers';

// Expansion module handlers (37-Node Architecture)
export {
  registerExpansionHandlers,
} from './expansion-handlers';
