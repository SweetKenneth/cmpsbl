/**
 * CONSCIENCE Node — Expansion Sovereignty Zone (ESZ)
 * Ethical reasoning, bias detection, value alignment scoring.
 *
 * Re-exports core conscience-module and adds CLM + hardening + ultimate layers.
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

// ── Ultimate CONSCIENCE capabilities ──
export { storePrecedent, findPrecedents, recordOutcome, getConsistencyScore, getPrecedentStats, type EthicalPrecedent, type PrecedentMatch } from '../conscience-module/ethical-memory';
export { generateExplainabilityChain, type ExplainabilityChain, type ReasoningStep } from '../conscience-module/explainability';
export { recordPostActionOutcome, getCalibrationHealth, getRecentReports, type PostActionReport } from '../conscience-module/post-action-audit';
export { propagateEthicalFlag, getFlagHistory, getFlagStats, type EthicalFlag, type EthicalFlagSeverity } from '../conscience-module/cross-module-propagation';
export { runGate, configureGate, getGateStats, getGateLog, type GateResult, type GateVerdict } from '../conscience-module/mandatory-gate';
export { setJurisdiction, getActiveJurisdiction, getJurisdictionalRules, checkJurisdictionalCompliance, listJurisdictions, type Jurisdiction, type JurisdictionalRule } from '../conscience-module/jurisdictional';
