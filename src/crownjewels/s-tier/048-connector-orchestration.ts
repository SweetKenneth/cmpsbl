/**
 * S-Tier 048 — Connector Orchestration Engine
 * CJPI: 93 | Node: INTEGRATION | ID: S-101
 *
 * Manages external connector lifecycle: registration, health checks,
 * retry policies, and graceful degradation.
 */

export interface Connector {
  id: string;
  name: string;
  type: 'api' | 'webhook' | 'stream' | 'database';
  endpoint: string;
  status: 'active' | 'degraded' | 'disconnected';
  retryPolicy: { maxRetries: number; backoffMs: number };
  lastPing: number;
  metadata?: Record<string, unknown>;
}

const connectors = new Map<string, Connector>();

export function registerConnector(conn: Omit<Connector, 'status' | 'lastPing'>): Connector {
  const full: Connector = { ...conn, status: 'active', lastPing: Date.now() };
  connectors.set(conn.id, full);
  return full;
}

export function pingConnector(id: string, success: boolean): Connector {
  const conn = connectors.get(id);
  if (!conn) throw new Error(`Connector ${id} not found`);
  conn.lastPing = Date.now();
  if (success) {
    conn.status = 'active';
  } else {
    conn.status = conn.status === 'active' ? 'degraded' : 'disconnected';
  }
  return conn;
}

export function getConnector(id: string): Connector | null {
  return connectors.get(id) ?? null;
}

export function listConnectors(status?: Connector['status']): Connector[] {
  const all = [...connectors.values()];
  return status ? all.filter(c => c.status === status) : all;
}

export function removeConnector(id: string): boolean {
  return connectors.delete(id);
}

export async function executeWithRetry<T>(
  connectorId: string,
  fn: () => Promise<T>
): Promise<T> {
  const conn = connectors.get(connectorId);
  const maxRetries = conn?.retryPolicy.maxRetries ?? 3;
  const backoff = conn?.retryPolicy.backoffMs ?? 1000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      if (conn) pingConnector(connectorId, true);
      return result;
    } catch (err) {
      if (attempt === maxRetries) {
        if (conn) pingConnector(connectorId, false);
        throw err;
      }
      await new Promise(r => setTimeout(r, backoff * Math.pow(2, attempt)));
    }
  }
  throw new Error('Unreachable');
}
