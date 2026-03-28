/**
 * TREATY Node — Expansion Sovereignty Zone (ESZ)
 * Inter-node contracts, bilateral SLA enforcement, penalty escalation,
 * automatic contract renewal.
 *
 * Re-exports core treaty-module and adds CLM + hardening layers.
 */

export {
  initTreaty,
  createContract,
  activateContract,
  evaluateSLA,
  checkExpiringContracts,
  getTreatyState,
  getTreatyHealth,
  getTreatyResilience,
  getTreatyEngine,
  getTreatyHardening,
  upgradeTreatyEngine,
  type ContractStatus,
  type SLAMetric,
  type PenaltyEscalation,
  type Contract,
  type ContractTerm,
  type SLADefinition,
  type PenaltyClause,
  type SLAReport,
  type TreatyModuleState,
} from '../treaty-module';

export { treatyCLM, runTreatyCLMCycle, type TreatyCLMInsight, type TreatyCLMReport } from './clm';
export { treatyHardeningReport, validateTreatyInput, TREATY_LIMITS } from './hardening';

// ═══════════════════════════════════════════════════════════════════════════════
// TREATY Ultimate Form — v9.0.0 "Pact Sovereign"
// ═══════════════════════════════════════════════════════════════════════════════
import * as TreatyUltimate from '../../treaty/ultimate';
export { TreatyUltimate };
