/**
 * Terminal Module Exports
 * v7.5.4 — Command execution, validation, governance, synergy, SEBA, and encoded commands (310+ commands)
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
