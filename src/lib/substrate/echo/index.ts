/**
 * ECHO v9.0.0 "Resonance" — Barrel Export
 * Re-exports core echo-module + CLM + Hardening + S-Tier
 */
export {
  // Types
  type SignalPriority,
  type SignalDecayTier,
  type EchoSignal,
  type ResonancePattern,
  type SignalCorrelation,
  type CompressedBurst,
  type SignalSchema,
  type RoutingRule,
  type SignalForecast,
  type BusMetrics,
  type DigitalTwin,
  type TwinSnapshot,
  type Scenario,
  type Intervention,
  type ScenarioResult,
  type EchoModuleState,
  // Lifecycle
  initEcho,
  getEchoState,
  getEchoHealth,
  getEchoResilience,
  getEchoEngine,
  getEchoHardening,
  upgradeEchoEngine,
  // Signal Processing
  emitSignal,
  recordSignalOutcome,
  // Temporal Replay
  replayTimeWindow,
  replayByNode,
  // Schema Registry
  registerSignalSchema,
  getSchemaForType,
  // Routing Rules
  addRoutingRule,
  removeRoutingRule,
  // Digital Twins
  createTwin,
  syncTwin,
  runScenario,
  // Telemetry
  getBusMetrics,
  getResonancePatterns,
  getCorrelations,
  getForecasts,
  getCompressedBursts,
  getRoutingRules,
  getAmplificationScores,
} from '../echo-module';

export { echoCLM, runEchoCLMCycle, type EchoCLMInsight, type EchoCLMReport } from './clm';
export { echoHardeningReport, validateEchoInput, ECHO_LIMITS } from './hardening';
