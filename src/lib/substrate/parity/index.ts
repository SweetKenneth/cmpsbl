/**
 * Module Parity Exports
 * v8.0.0 SYNERGY+ Epoch — Cross-module standards enforcement
 * 
 * Ensures all 14 modules adhere to the Module Parity Standard
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
