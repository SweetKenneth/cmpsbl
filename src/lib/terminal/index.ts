/**
 * Terminal Module Exports
 * v9.2.0 ARCHITECT — Command execution, validation, governance, synergy, SEBA, encoded commands, infrastructure, and all 21 modules (360+ commands)
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
