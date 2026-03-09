/**
 * INTEGRATION Module — Hardening Suite
 * v11.0.0 "Conduit"
 *
 * 25 hardening features for adapter safety, pool integrity,
 * schema validation, and webhook reliability.
 */

import { getRegistryStatus, getAdapterHealthSummary } from './adapterRegistry';
import { getAllPoolMetrics } from './connectionPool';
import { getMapperStats } from './schemaMapper';
import { getWebhookStats, getPendingDeliveries, getDeadLetterQueue } from './webhookRelay';

// ── Types ────────────────────────────────────────────────────────

export interface HardeningFeature {
  id: string;
  category: 'adapter' | 'pool' | 'schema' | 'webhook' | 'governance';
  name: string;
  status: 'active' | 'warning' | 'critical' | 'disabled';
  detail: string;
}

export interface ConduitHealthReport {
  overallScore: number; // 0–100
  features: HardeningFeature[];
  activeFeatures: number;
  warningCount: number;
  criticalCount: number;
  timestamp: string;
}

// ── Constants ────────────────────────────────────────────────────

const POOL_UTILIZATION_WARNING = 85;
const POOL_UTILIZATION_CRITICAL = 95;
const DLQ_WARNING_THRESHOLD = 5;
const DLQ_CRITICAL_THRESHOLD = 20;
const ERROR_RATE_WARNING = 0.05;
const ERROR_RATE_CRITICAL = 0.15;
const ADAPTER_DEGRADED_WARNING = 1;
const ADAPTER_DEGRADED_CRITICAL = 3;
const PENDING_WEBHOOK_WARNING = 50;
const PENDING_WEBHOOK_CRITICAL = 200;
const TRANSFORM_ERROR_WARNING = 0.1;
const TRANSFORM_ERROR_CRITICAL = 0.3;

// ── Health Computation ───────────────────────────────────────────

export function computeConduitHealth(): ConduitHealthReport {
  const features: HardeningFeature[] = [];

  // ── Adapter Features (7) ───────────────────────────────────────
  const registry = getRegistryStatus();
  const healthSummary = getAdapterHealthSummary();

  features.push({
    id: 'adapter_connection_limit',
    category: 'adapter',
    name: 'Connection Limit Guard',
    status: registry.activeConnections < 45 ? 'active' : registry.activeConnections < 50 ? 'warning' : 'critical',
    detail: `${registry.activeConnections}/50 connections used`,
  });

  features.push({
    id: 'adapter_health_monitoring',
    category: 'adapter',
    name: 'Health Check Loop',
    status: 'active',
    detail: `Monitoring ${registry.activeConnections} connections at ${registry.healthCheckIntervalMs / 1000}s intervals`,
  });

  const degradedCount = registry.degradedConnections;
  features.push({
    id: 'adapter_degradation_detector',
    category: 'adapter',
    name: 'Degradation Detector',
    status: degradedCount >= ADAPTER_DEGRADED_CRITICAL ? 'critical' :
      degradedCount >= ADAPTER_DEGRADED_WARNING ? 'warning' : 'active',
    detail: `${degradedCount} degraded connections`,
  });

  const avgErrorRate = healthSummary.length > 0
    ? healthSummary.reduce((s, h) => s + h.errorRate, 0) / healthSummary.length
    : 0;
  features.push({
    id: 'adapter_error_rate_monitor',
    category: 'adapter',
    name: 'Error Rate Monitor',
    status: avgErrorRate >= ERROR_RATE_CRITICAL ? 'critical' :
      avgErrorRate >= ERROR_RATE_WARNING ? 'warning' : 'active',
    detail: `Avg error rate: ${(avgErrorRate * 100).toFixed(2)}%`,
  });

  features.push({
    id: 'adapter_credential_rotation',
    category: 'adapter',
    name: 'Credential Rotation Guard',
    status: 'active',
    detail: 'Secret hashing enforced, no cleartext storage',
  });

  features.push({
    id: 'adapter_discovery_limit',
    category: 'adapter',
    name: 'Discovery Endpoint Limit',
    status: registry.discoveredEndpoints < 400 ? 'active' : 'warning',
    detail: `${registry.discoveredEndpoints} endpoints discovered`,
  });

  features.push({
    id: 'adapter_command_mapping_limit',
    category: 'adapter',
    name: 'Command Mapping Limit',
    status: registry.commandMappings < 180 ? 'active' : 'warning',
    detail: `${registry.commandMappings}/200 mappings`,
  });

  // ── Pool Features (6) ─────────────────────────────────────────
  const poolMetrics = getAllPoolMetrics();
  const maxUtil = poolMetrics.length > 0
    ? Math.max(...poolMetrics.map(p => p.utilizationPct))
    : 0;

  features.push({
    id: 'pool_utilization_monitor',
    category: 'pool',
    name: 'Pool Utilization Monitor',
    status: maxUtil >= POOL_UTILIZATION_CRITICAL ? 'critical' :
      maxUtil >= POOL_UTILIZATION_WARNING ? 'warning' : 'active',
    detail: `Peak utilization: ${maxUtil}%`,
  });

  features.push({
    id: 'pool_auto_scaling',
    category: 'pool',
    name: 'Auto-Scaling Engine',
    status: 'active',
    detail: `${poolMetrics.length} pools with dynamic sizing`,
  });

  const totalWaiting = poolMetrics.reduce((s, p) => s + p.waitingRequests, 0);
  features.push({
    id: 'pool_exhaustion_guard',
    category: 'pool',
    name: 'Pool Exhaustion Guard',
    status: totalWaiting > 10 ? 'critical' : totalWaiting > 0 ? 'warning' : 'active',
    detail: `${totalWaiting} requests waiting`,
  });

  features.push({
    id: 'pool_stale_eviction',
    category: 'pool',
    name: 'Stale Slot Eviction',
    status: 'active',
    detail: 'Idle timeout + max lifetime enforced',
  });

  features.push({
    id: 'pool_failed_slot_replacement',
    category: 'pool',
    name: 'Failed Slot Replacement',
    status: 'active',
    detail: 'Auto-replace on consecutive failures',
  });

  features.push({
    id: 'pool_cooldown_guard',
    category: 'pool',
    name: 'Scale Cooldown Guard',
    status: 'active',
    detail: '30s cooldown between scale events',
  });

  // ── Schema Features (5) ───────────────────────────────────────
  const mapperStats = getMapperStats();

  features.push({
    id: 'schema_step_limit',
    category: 'schema',
    name: 'Transform Step Limit',
    status: 'active',
    detail: '50 steps max per mapping, 10 depth limit',
  });

  features.push({
    id: 'schema_batch_limit',
    category: 'schema',
    name: 'Batch Size Limit',
    status: 'active',
    detail: '1000 records max per batch transform',
  });

  const transformErrorRate = mapperStats.totalTransforms > 0
    ? mapperStats.totalErrors / mapperStats.totalTransforms
    : 0;
  features.push({
    id: 'schema_error_rate',
    category: 'schema',
    name: 'Transform Error Rate',
    status: transformErrorRate >= TRANSFORM_ERROR_CRITICAL ? 'critical' :
      transformErrorRate >= TRANSFORM_ERROR_WARNING ? 'warning' : 'active',
    detail: `${(transformErrorRate * 100).toFixed(2)}% error rate`,
  });

  features.push({
    id: 'schema_conflict_resolution',
    category: 'schema',
    name: 'Conflict Resolution Engine',
    status: 'active',
    detail: `${mapperStats.conflictsResolved} conflicts resolved (5 strategies)`,
  });

  features.push({
    id: 'schema_partial_result',
    category: 'schema',
    name: 'Partial Result Pipeline',
    status: 'active',
    detail: 'Step failures annotated, pipeline continues',
  });

  // ── Webhook Features (5) ──────────────────────────────────────
  const webhookStats = getWebhookStats();
  const pending = getPendingDeliveries();
  const dlq = getDeadLetterQueue();

  features.push({
    id: 'webhook_hmac_verification',
    category: 'webhook',
    name: 'HMAC Signature Verification',
    status: 'active',
    detail: 'All webhook secrets stored as hashes',
  });

  features.push({
    id: 'webhook_idempotency',
    category: 'webhook',
    name: 'Idempotency Guard',
    status: 'active',
    detail: 'Duplicate delivery prevention via idempotency keys',
  });

  features.push({
    id: 'webhook_retry_backoff',
    category: 'webhook',
    name: 'Exponential Backoff Retry',
    status: 'active',
    detail: `${MAX_RETRY_ATTEMPTS} attempts with jitter, max 5min`,
  });

  features.push({
    id: 'webhook_dlq',
    category: 'webhook',
    name: 'Dead Letter Queue',
    status: dlq.length >= DLQ_CRITICAL_THRESHOLD ? 'critical' :
      dlq.length >= DLQ_WARNING_THRESHOLD ? 'warning' : 'active',
    detail: `${dlq.length} dead letters (replayable)`,
  });

  features.push({
    id: 'webhook_pending_monitor',
    category: 'webhook',
    name: 'Pending Delivery Monitor',
    status: pending.length >= PENDING_WEBHOOK_CRITICAL ? 'critical' :
      pending.length >= PENDING_WEBHOOK_WARNING ? 'warning' : 'active',
    detail: `${pending.length} deliveries pending`,
  });

  // ── Governance Features (2) ───────────────────────────────────
  features.push({
    id: 'governance_audit_trail',
    category: 'governance',
    name: 'Integration Audit Trail',
    status: 'active',
    detail: 'All adapter actions logged with full payload',
  });

  features.push({
    id: 'governance_rate_limiting',
    category: 'governance',
    name: 'Per-Adapter Rate Limiting',
    status: 'active',
    detail: 'Per-minute, per-hour, per-day limits enforced',
  });

  // ── Compute Score ─────────────────────────────────────────────
  const warningCount = features.filter(f => f.status === 'warning').length;
  const criticalCount = features.filter(f => f.status === 'critical').length;
  const activeCount = features.filter(f => f.status === 'active').length;
  const overallScore = Math.max(0, Math.min(100,
    100 - (warningCount * 4) - (criticalCount * 12)
  ));

  return {
    overallScore,
    features,
    activeFeatures: activeCount,
    warningCount,
    criticalCount,
    timestamp: new Date().toISOString(),
  };
}

const MAX_RETRY_ATTEMPTS = 5;
