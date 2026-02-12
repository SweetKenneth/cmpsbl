/**
 * Terminal Module Exports
 * v8.5.0 SYNERGY+ — Command execution, validation, governance, synergy, SEBA, encoded commands, and infrastructure (340+ commands)
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
