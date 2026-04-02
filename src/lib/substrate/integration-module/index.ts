/**
 * INTEGRATION Module — Enterprise Adapter Bridge
 * v11.0.0 "Conduit"
 *
 * Full-stack integration node: adapter registry, connection pooling,
 * schema mapping/transforms, webhook relay, and hardening suite.
 *
 * Part of the 40-Primitive / 12-Sector Architecture (Execution Zone)
 */

export const INTEGRATION_MODULE_VERSION = '11.0.0';
export const INTEGRATION_CODENAME = 'Conduit';

// ── Adapter Registry ─────────────────────────────────────────────
export {
  registerAdapter,
  getAdapterDefinition,
  listAdapterDefinitions,
  connectAdapter,
  disconnectAdapter,
  getConnection,
  listConnections,
  recordHealthCheck,
  getHealthHistory,
  getAdapterHealthSummary,
  storeDiscoveredEndpoints,
  getDiscoveredEndpoints,
  createCommandMapping,
  getCommandMappings,
  incrementMappingUsage,
  getRegistryStatus,
  type AdapterType,
  type AdapterStatus,
  type AdapterDefinition,
  type AdapterConnection,
  type DiscoveredEndpoint,
  type TerminalCommandMapping,
  type AdapterHealthEvent,
} from './adapterRegistry';

// ── Connection Pool ──────────────────────────────────────────────
export {
  createPool,
  destroyPool,
  acquireSlot,
  releaseSlot,
  evaluatePoolScaling,
  getPoolMetrics,
  getAllPoolMetrics,
  getScaleEvents,
  type PoolSlot,
  type PoolConfig,
  type PoolMetrics,
  type PoolScaleEvent,
} from './connectionPool';

// ── Schema Mapper ────────────────────────────────────────────────
export {
  createSchemaMapping,
  getSchemaMapping,
  listSchemaMappings,
  updateSchemaMapping,
  deleteSchemaMapping,
  executeTransform,
  executeBatchTransform,
  resolveConflict,
  getConflictLog,
  getMapperStats,
  type TransformStepKind,
  type TransformStep,
  type SchemaMapping,
  type TransformResult,
  type TransformBatchResult,
  type ConflictResolution,
} from './schemaMapper';

// ── Webhook Relay ────────────────────────────────────────────────
export {
  registerEndpoint,
  deactivateEndpoint,
  listEndpoints,
  enqueueDelivery,
  recordDeliveryAttempt,
  getPendingDeliveries,
  getDeadLetterQueue,
  getDeliveryReceipts,
  replayDeadLetter,
  getWebhookStats,
  type WebhookStatus,
  type WebhookEndpoint,
  type WebhookDelivery,
  type DeliveryReceipt,
  type WebhookStats,
} from './webhookRelay';

// ── Hardening ────────────────────────────────────────────────────
export {
  computeConduitHealth,
  type HardeningFeature,
  type ConduitHealthReport,
} from './integration-hardening';

// ── Ultimate Systems ─────────────────────────────────────────────
export * as IntegrationUltimate from './ultimate';

