/**
 * Terminal Module Exports
 * v7.0.0 — Command execution, validation, and governance
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
