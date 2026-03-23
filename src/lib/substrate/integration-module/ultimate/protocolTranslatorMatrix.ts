/**
 * Protocol Translator Matrix
 * 
 * Auto-translates between external protocols (REST, GraphQL, gRPC, WebSocket,
 * MQTT, SSE) and the substrate's Canonical Internal Format (CIF).
 * 
 * @module integration/ultimate/protocolTranslatorMatrix
 * @version 9.0.0 — Babel Gate
 */

// ── Types ──────────────────────────────────────────────────────

export type ExternalProtocol = 'REST' | 'GraphQL' | 'gRPC' | 'WebSocket' | 'MQTT' | 'SSE' | 'UNKNOWN';

export interface CanonicalInternalFormat {
  source: string;
  protocol: ExternalProtocol;
  headers: Record<string, string>;
  body: unknown;
  timestamp: number;
  traceId: string;
  metadata?: Record<string, unknown>;
}

export interface ProtocolCapability {
  protocol: ExternalProtocol;
  supportsStreaming: boolean;
  supportsBidirectional: boolean;
  supportsSubscription: boolean;
  maxPayloadBytes: number;
}

interface InferredSchema {
  fields: Array<{ name: string; type: string; nullable: boolean }>;
  inferredAt: number;
  sampleCount: number;
}

// ── State ──────────────────────────────────────────────────────

const schemaCache = new Map<string, InferredSchema>();
const capabilityCache = new Map<string, ProtocolCapability>();
let traceCounter = 0;

// ── Core ───────────────────────────────────────────────────────

function generateTraceId(): string {
  return `int-${Date.now()}-${++traceCounter}`;
}

/** Detect protocol from URL and headers */
export function detectProtocol(url: string, headers?: Record<string, string>): ExternalProtocol {
  const lower = url.toLowerCase();
  if (lower.startsWith('ws://') || lower.startsWith('wss://')) return 'WebSocket';
  if (lower.startsWith('mqtt://') || lower.startsWith('mqtts://')) return 'MQTT';
  if (headers?.['content-type']?.includes('text/event-stream')) return 'SSE';
  if (headers?.['content-type']?.includes('application/grpc')) return 'gRPC';
  if (lower.includes('/graphql') || headers?.['content-type']?.includes('application/graphql')) return 'GraphQL';
  if (lower.startsWith('http://') || lower.startsWith('https://')) return 'REST';
  return 'UNKNOWN';
}

/** Normalize an external message into Canonical Internal Format */
export function toCIF(
  source: string,
  protocol: ExternalProtocol,
  headers: Record<string, string>,
  body: unknown,
  metadata?: Record<string, unknown>,
): CanonicalInternalFormat {
  return {
    source,
    protocol,
    headers: { ...headers },
    body,
    timestamp: Date.now(),
    traceId: generateTraceId(),
    metadata,
  };
}

/** Infer a schema from a response body */
export function inferSchema(integrationId: string, body: unknown): InferredSchema {
  const existing = schemaCache.get(integrationId);
  const fields: Array<{ name: string; type: string; nullable: boolean }> = [];

  if (body && typeof body === 'object' && !Array.isArray(body)) {
    for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
      fields.push({
        name: key,
        type: value === null ? 'null' : typeof value,
        nullable: value === null || value === undefined,
      });
    }
  }

  const schema: InferredSchema = {
    fields,
    inferredAt: Date.now(),
    sampleCount: (existing?.sampleCount ?? 0) + 1,
  };
  schemaCache.set(integrationId, schema);
  return schema;
}

/** Register protocol capabilities for an endpoint */
export function registerCapability(endpointId: string, cap: ProtocolCapability): void {
  capabilityCache.set(endpointId, cap);
}

/** Get cached capabilities */
export function getCapability(endpointId: string): ProtocolCapability | undefined {
  return capabilityCache.get(endpointId);
}

/** Get health summary */
export function getTranslatorHealth() {
  return {
    cachedSchemas: schemaCache.size,
    cachedCapabilities: capabilityCache.size,
    traceCount: traceCounter,
  };
}

export function resetTranslator(): void {
  schemaCache.clear();
  capabilityCache.clear();
  traceCounter = 0;
}
