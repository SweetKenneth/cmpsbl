/**
 * ORACLE Node — Expansion Sovereignty Zone (ESZ)
 * Predictive modeling, Bayesian inference, Monte Carlo simulation.
 *
 * Re-exports core oracle-module and adds CLM + hardening layers.
 */

export {
  initOracle,
  createNetwork,
  updateBelief,
  runMonteCarlo,
  predict,
  getOracleState,
  getOracleHealth,
  getOracleResilience,
  getOracleEngine,
  getOracleHardening,
  upgradeOracleEngine,
  type BayesianNetwork,
  type BayesianNode,
  type CausalEdge,
  type MonteCarloSimulation,
  type Prediction,
  type OracleModuleState,
} from '../oracle-module';

export { oracleCLM, runOracleCLMCycle, type OracleCLMInsight, type OracleCLMReport } from './clm';
export { oracleHardeningReport, validateOracleInput, ORACLE_LIMITS } from './hardening';
