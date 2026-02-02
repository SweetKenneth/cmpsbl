/**
 * Terminal Module Exports
 * v7.5.0 — Command execution, validation, governance, and synergy commands
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
