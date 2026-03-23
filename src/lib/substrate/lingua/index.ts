/**
 * LINGUA v9.0.0 "Polyglot" — Barrel Export
 * Re-exports core module + CLM + Hardening + S-Tier
 */
export {
  // Types
  type Modality,
  type TranslationQuality,
  type BridgeStatus,
  type Translation,
  type ModalityBridge,
  type SchemaMapping,
  type FieldMapping,
  type FidelityProfile,
  type FormatCapability,
  type TransitivePath,
  type BatchTranslation,
  type LinguaModuleState,
  // Core
  initLingua,
  translate,
  mapSchema,
  getLinguaState,
  getLinguaHealth,
  getLinguaResilience,
  getLinguaEngine,
  getLinguaHardening,
  upgradeLinguaEngine,
  // Adaptive Fidelity
  getCoercionSafety,
  // Schema Intelligence
  generateSchemaMigration,
  inferSchemaMapping,
  // Protocol Bridge Mesh
  findTransitivePath,
  verifyBridgeRoundTrip,
  hotSwapBridge,
  // Multi-Modal Pipeline
  streamTranslate,
  queueBatchTranslation,
  processBatchQueue,
  partialTranslate,
  // Format Negotiation
  registerNodeFormats,
  negotiateFormat,
  getFallbackChain,
  // Telemetry
  getAnomalyAlerts,
  getBridgeStats,
  getFidelityHeatMap,
  getSchemaStats,
} from '../lingua-module';

export { runLinguaCLM, type LinguaCLMDiagnostic, type LinguaCLMReport } from './clm';
export {
  LINGUA_LIMITS,
  validateTranslationInput,
  validateSchemaInput,
  type LinguaValidationResult,
} from './hardening';
