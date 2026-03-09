/**
 * INTEGRATION Module — Adapter Registry
 * v11.0.0 "Conduit"
 *
 * Manages the lifecycle of enterprise adapter connections:
 * registration, health tracking, credential rotation, and auto-discovery.
 */

import { boundArray } from '@/lib/system/hardening';

// ── Types ────────────────────────────────────────────────────────

export type AdapterType =
  | 'rest_api' | 'graphql' | 'grpc' | 'webhook'
  | 'database' | 'message_queue' | 'file_storage'
  | 'erp' | 'crm' | 'hr' | 'analytics'
  | 'custom';

export type AdapterStatus = 'connected' | 'disconnected' | 'degraded' | 'error' | 'initializing';

export interface AdapterDefinition {
  id: string;
  type: AdapterType;
  name: string;
  description: string;
  version: string;
  config: Record<string, unknown>;
  credentialFields: string[];
  capabilities: string[];
  healthEndpoint?: string;
  rateLimits?: { perMinute: number; perHour: number; perDay: number };
}

export interface AdapterConnection {
  adapterId: string;
  definition: AdapterDefinition;
  status: AdapterStatus;
  connectedAt: string;
  lastHealthCheck: string | null;
  lastHealthScore: number; // 0–100
  consecutiveFailures: number;
  totalRequests: number;
  totalErrors: number;
  avgLatencyMs: number;
  metadata: Record<string, unknown>;
}

export interface DiscoveredEndpoint {
  adapterId: string;
  path: string;
  method: string;
  description: string;
  parameters: Array<{ name: string; type: string; required: boolean; description?: string }>;
  responseSchema?: Record<string, unknown>;
  discoveredAt: string;
  confidence: number; // 0–1
}

export interface TerminalCommandMapping {
  id: string;
  adapterId: string;
  discoveredEndpoint: string;
  terminalCommand: string;
  description: string;
  parameters: Array<{ name: string; type: string; required: boolean }>;
  createdAt: string;
  usageCount: number;
}

export interface AdapterHealthEvent {
  adapterId: string;
  timestamp: string;
  score: number;
  latencyMs: number;
  statusCode?: number;
  error?: string;
}

// ── Constants ────────────────────────────────────────────────────

const MAX_CONNECTIONS = 50;
const MAX_DISCOVERED_PER_ADAPTER = 500;
const MAX_MAPPINGS = 200;
const MAX_HEALTH_HISTORY = 100;
const HEALTH_CHECK_INTERVAL_MS = 60_000;
const DEGRADED_THRESHOLD = 3; // consecutive failures

// ── In-Memory Stores ─────────────────────────────────────────────

const definitions = new Map<string, AdapterDefinition>();
const connections = new Map<string, AdapterConnection>();
const discovered = new Map<string, DiscoveredEndpoint[]>();
const mappings = new Map<string, TerminalCommandMapping>();
const healthHistory = new Map<string, AdapterHealthEvent[]>();

// ── Registration ─────────────────────────────────────────────────

export function registerAdapter(def: AdapterDefinition): { success: boolean; error?: string } {
  if (!def.id || !def.type || !def.name) {
    return { success: false, error: 'Missing required fields: id, type, name' };
  }
  if (definitions.has(def.id)) {
    return { success: false, error: `Adapter "${def.id}" already registered` };
  }
  definitions.set(def.id, Object.freeze({ ...def }));
  return { success: true };
}

export function getAdapterDefinition(id: string): AdapterDefinition | null {
  return definitions.get(id) ?? null;
}

export function listAdapterDefinitions(): AdapterDefinition[] {
  return Array.from(definitions.values());
}

// ── Connection Lifecycle ─────────────────────────────────────────

export function connectAdapter(
  adapterId: string,
  config: Record<string, unknown> = {},
  metadata: Record<string, unknown> = {}
): { success: boolean; connection?: AdapterConnection; error?: string } {
  const def = definitions.get(adapterId);
  if (!def) return { success: false, error: `Unknown adapter: ${adapterId}` };
  if (connections.has(adapterId)) return { success: false, error: `Adapter "${adapterId}" already connected` };
  if (connections.size >= MAX_CONNECTIONS) return { success: false, error: `Connection limit reached (${MAX_CONNECTIONS})` };

  const conn: AdapterConnection = {
    adapterId,
    definition: { ...def, config: { ...def.config, ...config } },
    status: 'connected',
    connectedAt: new Date().toISOString(),
    lastHealthCheck: null,
    lastHealthScore: 100,
    consecutiveFailures: 0,
    totalRequests: 0,
    totalErrors: 0,
    avgLatencyMs: 0,
    metadata,
  };
  connections.set(adapterId, conn);
  return { success: true, connection: conn };
}

export function disconnectAdapter(adapterId: string): { success: boolean; error?: string } {
  if (!connections.has(adapterId)) return { success: false, error: `No connection for adapter: ${adapterId}` };
  connections.delete(adapterId);
  discovered.delete(adapterId);
  return { success: true };
}

export function getConnection(adapterId: string): AdapterConnection | null {
  return connections.get(adapterId) ?? null;
}

export function listConnections(): AdapterConnection[] {
  return Array.from(connections.values());
}

// ── Health Tracking ──────────────────────────────────────────────

export function recordHealthCheck(
  adapterId: string,
  score: number,
  latencyMs: number,
  statusCode?: number,
  error?: string
): void {
  const conn = connections.get(adapterId);
  if (!conn) return;

  const event: AdapterHealthEvent = {
    adapterId,
    timestamp: new Date().toISOString(),
    score: Math.max(0, Math.min(100, score)),
    latencyMs: Math.max(0, latencyMs),
    statusCode,
    error,
  };

  // Update connection
  conn.lastHealthCheck = event.timestamp;
  conn.lastHealthScore = event.score;
  conn.totalRequests++;

  if (score < 50 || error) {
    conn.consecutiveFailures++;
    conn.totalErrors++;
    if (conn.consecutiveFailures >= DEGRADED_THRESHOLD) {
      conn.status = 'degraded';
    }
  } else {
    conn.consecutiveFailures = 0;
    if (conn.status === 'degraded') conn.status = 'connected';
  }

  // Running average latency
  conn.avgLatencyMs = conn.avgLatencyMs === 0
    ? latencyMs
    : conn.avgLatencyMs * 0.9 + latencyMs * 0.1;

  // Store history
  const history = healthHistory.get(adapterId) ?? [];
  history.push(event);
  healthHistory.set(adapterId, boundArray(history, MAX_HEALTH_HISTORY));
}

export function getHealthHistory(adapterId: string): AdapterHealthEvent[] {
  return healthHistory.get(adapterId) ?? [];
}

export function getAdapterHealthSummary(): Array<{
  adapterId: string;
  status: AdapterStatus;
  score: number;
  avgLatencyMs: number;
  errorRate: number;
  uptime: number; // percentage
}> {
  return listConnections().map(conn => {
    const history = healthHistory.get(conn.adapterId) ?? [];
    const errorRate = conn.totalRequests > 0 ? conn.totalErrors / conn.totalRequests : 0;
    const uptime = history.length > 0
      ? history.filter(h => h.score >= 50).length / history.length
      : 1;
    return {
      adapterId: conn.adapterId,
      status: conn.status,
      score: conn.lastHealthScore,
      avgLatencyMs: Math.round(conn.avgLatencyMs),
      errorRate: Math.round(errorRate * 10000) / 10000,
      uptime: Math.round(uptime * 10000) / 10000,
    };
  });
}

// ── Auto-Discovery ───────────────────────────────────────────────

export function storeDiscoveredEndpoints(adapterId: string, endpoints: DiscoveredEndpoint[]): void {
  const existing = discovered.get(adapterId) ?? [];
  const deduped = new Map<string, DiscoveredEndpoint>();
  for (const ep of [...existing, ...endpoints]) {
    deduped.set(`${ep.method}:${ep.path}`, ep);
  }
  discovered.set(adapterId, boundArray(Array.from(deduped.values()), MAX_DISCOVERED_PER_ADAPTER));
}

export function getDiscoveredEndpoints(adapterId?: string): DiscoveredEndpoint[] {
  if (adapterId) return discovered.get(adapterId) ?? [];
  const all: DiscoveredEndpoint[] = [];
  for (const eps of discovered.values()) all.push(...eps);
  return all;
}

// ── Terminal Command Mapping ─────────────────────────────────────

export function createCommandMapping(mapping: Omit<TerminalCommandMapping, 'id' | 'createdAt' | 'usageCount'>): {
  success: boolean; mapping?: TerminalCommandMapping; error?: string;
} {
  if (mappings.size >= MAX_MAPPINGS) {
    return { success: false, error: `Mapping limit reached (${MAX_MAPPINGS})` };
  }
  const id = `map_${mapping.adapterId}_${Date.now()}`;
  const full: TerminalCommandMapping = {
    ...mapping,
    id,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  };
  mappings.set(id, full);
  return { success: true, mapping: full };
}

export function getCommandMappings(adapterId?: string): TerminalCommandMapping[] {
  const all = Array.from(mappings.values());
  if (adapterId) return all.filter(m => m.adapterId === adapterId);
  return all;
}

export function incrementMappingUsage(mappingId: string): void {
  const m = mappings.get(mappingId);
  if (m) m.usageCount++;
}

// ── Aggregated Status ────────────────────────────────────────────

export function getRegistryStatus(): {
  registeredAdapters: number;
  activeConnections: number;
  healthyConnections: number;
  degradedConnections: number;
  discoveredEndpoints: number;
  commandMappings: number;
  healthCheckIntervalMs: number;
} {
  const conns = listConnections();
  let totalDiscovered = 0;
  for (const eps of discovered.values()) totalDiscovered += eps.length;

  return {
    registeredAdapters: definitions.size,
    activeConnections: conns.length,
    healthyConnections: conns.filter(c => c.status === 'connected').length,
    degradedConnections: conns.filter(c => c.status === 'degraded' || c.status === 'error').length,
    discoveredEndpoints: totalDiscovered,
    commandMappings: mappings.size,
    healthCheckIntervalMs: HEALTH_CHECK_INTERVAL_MS,
  };
}

// ── Reset (testing) ──────────────────────────────────────────────

export function _resetRegistry(): void {
  definitions.clear();
  connections.clear();
  discovered.clear();
  mappings.clear();
  healthHistory.clear();
}
