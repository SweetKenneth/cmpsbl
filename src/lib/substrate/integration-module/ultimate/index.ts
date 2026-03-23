/**
 * INTEGRATION Ultimate — "Babel Gate" v9.0.0
 * 
 * The substrate's Universal Protocol Fabric — polyglot nervous system
 * for all external communication with 10 specialized sub-systems.
 * 
 * @module integration/ultimate
 * @version 9.0.0 — Babel Gate
 */

// System 1: Protocol Translator Matrix
export {
  detectProtocol,
  toCIF,
  inferSchema,
  registerCapability,
  getCapability,
  getTranslatorHealth,
  resetTranslator,
  type ExternalProtocol,
  type CanonicalInternalFormat,
  type ProtocolCapability,
} from './protocolTranslatorMatrix';

// System 2: Credential Vault & Rotation Engine
export {
  storeCredential,
  checkRotationNeeds,
  recordRotation,
  scanForLeaks,
  emergencyRevoke,
  getCredentialHealth,
  getLeakAlerts,
  getRotationHistory,
  getVaultHealth,
  resetVault,
  type StoredCredential,
  type RotationEvent,
  type LeakCanaryAlert,
} from './credentialVault';

// System 3: Adaptive Rate Governor
export {
  learnFromHeaders,
  setLimits,
  shouldAllow,
  recordRequest,
  getRateGovernorHealth,
  resetRateGovernor,
  type ProviderLimits,
  type ThrottleDecision,
} from './adaptiveRateGovernor';

// System 4: Contract Testing Engine
export {
  captureSnapshot,
  detectDrift,
  registerDependency,
  getAffectedFeatures,
  getDriftHistory,
  getSnapshots,
  getContractHealth,
  resetContractEngine,
  type SchemaSnapshot,
  type DriftReport,
  type DriftSeverity,
} from './contractTestingEngine';

// System 5: Webhook Orchestrator
export {
  validateInbound,
  registerEndpoint,
  enqueueDelivery,
  fanOut,
  recordDeliveryResult,
  getPendingDeliveries,
  getDeadLetterQueue,
  getWebhookHealth,
  resetWebhookOrchestrator,
  type WebhookEndpoint,
  type WebhookDelivery,
  type InboundValidation,
} from './webhookOrchestrator';

// System 6: Circuit Breaker Mesh
export {
  getCircuit,
  canExecute,
  recordResult,
  configureCircuit,
  setFallback,
  tripCircuit,
  closeCircuit,
  getCircuitBreakerHealth,
  resetCircuitBreakerMesh,
  type CircuitState,
  type CircuitBreaker,
  type CircuitBreakerHealth,
} from './circuitBreakerMesh';

// System 7: Schema Negotiation Engine
export {
  negotiateFormat,
  registerAdapter,
  findAdapter,
  applyMappings,
  setFieldMappings,
  getFieldMappings,
  recordEvolution,
  getEvolutionHistory,
  getSchemaNegotiationHealth,
  resetSchemaNegotiation,
  type SerializationFormat,
  type FieldMapping,
  type VersionAdapter,
  type NegotiationResult,
} from './schemaNegotiationEngine';

// System 8: Integration Health Profiler
export {
  getOrCreateProfile,
  recordCall,
  setSlaTarget,
  getProfilesByRisk,
  getProfile,
  getHealthProfilerSummary,
  resetHealthProfiler,
  type IntegrationProfile,
} from './integrationHealthProfiler';

// System 9: Event Bridge & Transformation Pipeline
export {
  registerSource,
  registerPipeline,
  processEvent,
  replayEvents,
  getEventBridgeHealth,
  resetEventBridge,
  type EventSource,
  type FilterRule,
  type TransformationPipeline,
  type NormalizedEvent,
} from './eventBridge';

// System 10: Integration Discovery & Auto-Connect
export {
  importFromSpec,
  registerTemplate,
  matchCapabilities,
  recordConnectivityCheck,
  getConnectivityStatus,
  getCatalog,
  searchByCapability,
  getDiscoveryHealth,
  resetDiscovery,
  type IntegrationTemplate,
  type CapabilityMatch,
  type ConnectivityCheck,
} from './integrationDiscovery';

// ── Unified Health ─────────────────────────────────────────────

import { getTranslatorHealth } from './protocolTranslatorMatrix';
import { getVaultHealth } from './credentialVault';
import { getRateGovernorHealth } from './adaptiveRateGovernor';
import { getContractHealth } from './contractTestingEngine';
import { getWebhookHealth } from './webhookOrchestrator';
import { getCircuitBreakerHealth } from './circuitBreakerMesh';
import { getSchemaNegotiationHealth } from './schemaNegotiationEngine';
import { getHealthProfilerSummary } from './integrationHealthProfiler';
import { getEventBridgeHealth } from './eventBridge';
import { getDiscoveryHealth } from './integrationDiscovery';

export interface IntegrationUltimateHealth {
  version: '9.0.0';
  codename: 'Babel Gate';
  systems: {
    protocolTranslator: ReturnType<typeof getTranslatorHealth>;
    credentialVault: ReturnType<typeof getVaultHealth>;
    rateGovernor: ReturnType<typeof getRateGovernorHealth>;
    contractTesting: ReturnType<typeof getContractHealth>;
    webhookOrchestrator: ReturnType<typeof getWebhookHealth>;
    circuitBreakerMesh: ReturnType<typeof getCircuitBreakerHealth>;
    schemaNegotiation: ReturnType<typeof getSchemaNegotiationHealth>;
    healthProfiler: ReturnType<typeof getHealthProfilerSummary>;
    eventBridge: ReturnType<typeof getEventBridgeHealth>;
    discovery: ReturnType<typeof getDiscoveryHealth>;
  };
  overallHealth: number;
}

/** Unified health assessment across all 10 INTEGRATION systems */
export function getIntegrationUltimateHealth(): IntegrationUltimateHealth {
  const vault = getVaultHealth();
  const circuit = getCircuitBreakerHealth();
  const profiler = getHealthProfilerSummary();
  const webhook = getWebhookHealth();

  // Composite health: weighted average
  const vaultScore = vault.avgHealthScore * 100;
  const circuitScore = circuit.totalCircuits > 0
    ? (circuit.closedCircuits / circuit.totalCircuits) * 100
    : 100;
  const availabilityScore = profiler.avgAvailability * 100;
  const webhookScore = webhook.avgHealthScore * 100;

  const overallHealth = Math.round(
    (vaultScore * 0.20) +
    (circuitScore * 0.25) +
    (availabilityScore * 0.30) +
    (webhookScore * 0.25)
  );

  return {
    version: '9.0.0',
    codename: 'Babel Gate',
    systems: {
      protocolTranslator: getTranslatorHealth(),
      credentialVault: vault,
      rateGovernor: getRateGovernorHealth(),
      contractTesting: getContractHealth(),
      webhookOrchestrator: webhook,
      circuitBreakerMesh: circuit,
      schemaNegotiation: getSchemaNegotiationHealth(),
      healthProfiler: profiler,
      eventBridge: getEventBridgeHealth(),
      discovery: getDiscoveryHealth(),
    },
    overallHealth,
  };
}
