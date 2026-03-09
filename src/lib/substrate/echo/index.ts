/**
 * ECHO Node — Expansion Perception Zone (EPZ)
 * Digital twin simulation, what-if scenarios, system modeling.
 *
 * Re-exports core echo-module and adds CLM + hardening layers.
 */

export {
  initEcho,
  createTwin,
  syncTwin,
  runScenario,
  getEchoState,
  getEchoHealth,
  getEchoResilience,
  getEchoEngine,
  getEchoHardening,
  upgradeEchoEngine,
  type DigitalTwin,
  type TwinSnapshot,
  type Scenario,
  type Intervention,
  type ScenarioResult,
  type EchoModuleState,
} from '../echo-module';

export { echoCLM, runEchoCLMCycle, type EchoCLMInsight, type EchoCLMReport } from './clm';
export { echoHardeningReport, validateEchoInput, ECHO_LIMITS } from './hardening';
