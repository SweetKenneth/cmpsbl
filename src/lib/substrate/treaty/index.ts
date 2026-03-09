/**
 * TREATY Node — Expansion Sovereignty Zone (ESZ)
 * Inter-node contracts, SLA enforcement, penalty management.
 *
 * Re-exports core treaty-module and adds CLM + hardening layers.
 */

export {
  initTreaty,
  createContract,
  activateContract,
  evaluateSLA,
  getTreatyState,
  getTreatyHealth,
  getTreatyResilience,
  getTreatyEngine,
  getTreatyHardening,
  upgradeTreatyEngine,
  type ContractStatus,
  type SLAMetric,
  type Contract,
  type ContractTerm,
  type SLADefinition,
  type PenaltyClause,
  type SLAReport,
  type TreatyModuleState,
} from '../treaty-module';

export { treatyCLM, runTreatyCLMCycle, type TreatyCLMInsight, type TreatyCLMReport } from './clm';
export { treatyHardeningReport, validateTreatyInput, TREATY_LIMITS } from './hardening';
