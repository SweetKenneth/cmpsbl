/**
 * Module Parity Exports
 * v7.0.0 — Cross-module standards enforcement
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
