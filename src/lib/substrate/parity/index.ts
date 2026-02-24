/**
 * Module Parity Exports
 * SPARTA Epoch — Cross-entity standards enforcement
 * 
 * Ensures all entities + zones adhere to the Parity Standard
 */

export {
  checkModuleParity,
  runParityCheck,
  getModulesNeedingWork,
  getModuleConfig,
  getModuleHookInfo,
  SUBSTRATE_MODULES_LIST,
  type ParityRequirement,
  type ModuleParityResult,
  type ParityReport,
  type SubstrateModuleName,
} from './check';
