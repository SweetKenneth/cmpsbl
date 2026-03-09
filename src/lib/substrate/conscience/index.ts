/**
 * CONSCIENCE Node — Expansion Sovereignty Zone (ESZ)
 * Ethical reasoning, bias detection, value alignment scoring.
 *
 * Re-exports core conscience-module and adds CLM + hardening layers.
 */

export {
  initConscience,
  evaluate,
  checkAlignment,
  getConscienceState,
  getConscienceHealth,
  getConscienceResilience,
  getConscienceEngine,
  getConscienceHardening,
  upgradeConscienceEngine,
  type EthicalFramework,
  type BiasType,
  type EthicalEvaluation,
  type BiasDetection,
  type AlignmentScore,
  type ConscienceModuleState,
} from '../conscience-module';

export { conscienceCLM, runConscienceCLMCycle, type ConscienceCLMInsight, type ConscienceCLMReport } from './clm';
export { conscienceHardeningReport, validateConscienceInput, CONSCIENCE_LIMITS } from './hardening';
