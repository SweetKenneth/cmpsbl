/**
 * Module Parity Exports
 * v10.5.4 ARCHITECT Epoch — Cross-module standards enforcement
 * 
 * Ensures all 21 modules adhere to the Module Parity Standard
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
