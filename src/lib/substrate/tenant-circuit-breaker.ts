/**
 * Tenant-Scoped Circuit Breaker
 * Isolates failures per tenant to prevent cascading impact across subscribers.
 * Each tenant has independent circuit state and recovery timers.
 */

export type CircuitState = 'closed' | 'open' | 'half_open';

export interface TenantCircuit {
  tenantId: string;
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureAt: number | null;
  lastStateChange: number;
  cooldownMs: number;
  failureThreshold: number;
  halfOpenSuccessThreshold: number;
  totalTrips: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  cooldownMs: number;
  halfOpenSuccessThreshold: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  cooldownMs: 30_000,
  halfOpenSuccessThreshold: 3,
};

const circuits = new Map<string, TenantCircuit>();
const tenantConfigs = new Map<string, CircuitBreakerConfig>();

function getConfig(tenantId: string): CircuitBreakerConfig {
  return tenantConfigs.get(tenantId) ?? DEFAULT_CONFIG;
}

function getOrCreateCircuit(tenantId: string): TenantCircuit {
  let circuit = circuits.get(tenantId);
  if (!circuit) {
    const config = getConfig(tenantId);
    circuit = {
      tenantId,
      state: 'closed',
      failureCount: 0,
      successCount: 0,
      lastFailureAt: null,
      lastStateChange: Date.now(),
      cooldownMs: config.cooldownMs,
      failureThreshold: config.failureThreshold,
      halfOpenSuccessThreshold: config.halfOpenSuccessThreshold,
      totalTrips: 0,
    };
    circuits.set(tenantId, circuit);
  }
  return circuit;
}

export function configureTenantCircuit(tenantId: string, config: Partial<CircuitBreakerConfig>): void {
  const current = getConfig(tenantId);
  tenantConfigs.set(tenantId, { ...current, ...config });
}

export function canExecute(tenantId: string): { allowed: boolean; state: CircuitState; reason?: string } {
  const circuit = getOrCreateCircuit(tenantId);

  if (circuit.state === 'closed') {
    return { allowed: true, state: 'closed' };
  }

  if (circuit.state === 'open') {
    const elapsed = Date.now() - circuit.lastStateChange;
    if (elapsed >= circuit.cooldownMs) {
      circuit.state = 'half_open';
      circuit.successCount = 0;
      circuit.lastStateChange = Date.now();
      return { allowed: true, state: 'half_open' };
    }
    const remaining = Math.ceil((circuit.cooldownMs - elapsed) / 1000);
    return { allowed: false, state: 'open', reason: `Circuit open. Retry in ${remaining}s.` };
  }

  // half_open
  return { allowed: true, state: 'half_open' };
}

export function recordSuccess(tenantId: string): void {
  const circuit = getOrCreateCircuit(tenantId);
  circuit.successCount++;

  if (circuit.state === 'half_open' && circuit.successCount >= circuit.halfOpenSuccessThreshold) {
    circuit.state = 'closed';
    circuit.failureCount = 0;
    circuit.lastStateChange = Date.now();
  }
}

export function recordFailure(tenantId: string): void {
  const circuit = getOrCreateCircuit(tenantId);
  circuit.failureCount++;
  circuit.lastFailureAt = Date.now();

  if (circuit.state === 'half_open') {
    circuit.state = 'open';
    circuit.totalTrips++;
    circuit.lastStateChange = Date.now();
    return;
  }

  if (circuit.state === 'closed' && circuit.failureCount >= circuit.failureThreshold) {
    circuit.state = 'open';
    circuit.totalTrips++;
    circuit.lastStateChange = Date.now();
  }
}

export function forceOpen(tenantId: string): void {
  const circuit = getOrCreateCircuit(tenantId);
  circuit.state = 'open';
  circuit.totalTrips++;
  circuit.lastStateChange = Date.now();
}

export function forceClose(tenantId: string): void {
  const circuit = getOrCreateCircuit(tenantId);
  circuit.state = 'closed';
  circuit.failureCount = 0;
  circuit.successCount = 0;
  circuit.lastStateChange = Date.now();
}

export function getCircuitState(tenantId: string): TenantCircuit {
  return { ...getOrCreateCircuit(tenantId) };
}

export function getAllCircuits(): TenantCircuit[] {
  return Array.from(circuits.values()).map(c => ({ ...c }));
}

export function getCircuitStats(): {
  total: number;
  open: number;
  closed: number;
  halfOpen: number;
  totalTrips: number;
} {
  let open = 0, closed = 0, halfOpen = 0, totalTrips = 0;
  for (const c of circuits.values()) {
    if (c.state === 'open') open++;
    else if (c.state === 'closed') closed++;
    else halfOpen++;
    totalTrips += c.totalTrips;
  }
  return { total: circuits.size, open, closed, halfOpen, totalTrips };
}
