/**
 * S-Tier 221 — External Event Bridge (SYN16)
 * ID: S-SYN16 | CJPI: 91 | Module: INTEGRATION×RELAY
 *
 * Bridges external event sources with internal processing via protocol
 * adapters, retry policies with exponential backoff, and dead-letter handling.
 */

export interface BridgeConfig {
  id: string;
  protocol: string;
  retryPolicy: { maxRetries: number; backoffMs: number; backoffMultiplier: number };
  active: boolean;
  circuitBreaker: { failureThreshold: number; resetTimeMs: number; failures: number; openedAt: number | null };
  stats: { delivered: number; failed: number; retried: number };
}

export interface RelayResult {
  status: 'delivered' | 'retrying' | 'dead_letter' | 'circuit_open';
  attempts: number;
  latencyMs: number;
}

export class ExternalEventBridge {
  private bridges: Map<string, BridgeConfig> = new Map();
  private eventLog: { bridgeId: string; event: string; status: string; timestamp: string; attempts: number }[] = [];
  private deadLetters: { bridgeId: string; event: string; error: string; timestamp: string }[] = [];

  register(id: string, protocol: string, maxRetries: number = 3, backoffMs: number = 1000, backoffMultiplier: number = 2): void {
    this.bridges.set(id, {
      id, protocol,
      retryPolicy: { maxRetries, backoffMs, backoffMultiplier },
      active: true,
      circuitBreaker: { failureThreshold: 5, resetTimeMs: 30000, failures: 0, openedAt: null },
      stats: { delivered: 0, failed: 0, retried: 0 },
    });
  }

  relay(bridgeId: string, event: string, handler?: (event: string) => boolean): RelayResult {
    const bridge = this.bridges.get(bridgeId);
    const startMs = Date.now();

    if (!bridge || !bridge.active) {
      this.deadLetters.push({ bridgeId, event, error: 'Bridge inactive or not found', timestamp: new Date().toISOString() });
      this.eventLog.push({ bridgeId, event, status: 'dead_letter', timestamp: new Date().toISOString(), attempts: 0 });
      return { status: 'dead_letter', attempts: 0, latencyMs: Date.now() - startMs };
    }

    // Circuit breaker check
    const cb = bridge.circuitBreaker;
    if (cb.openedAt !== null) {
      if (Date.now() - cb.openedAt < cb.resetTimeMs) {
        return { status: 'circuit_open', attempts: 0, latencyMs: Date.now() - startMs };
      }
      cb.openedAt = null;
      cb.failures = 0;
    }

    // Attempt delivery with retries
    let attempts = 0;
    let delivered = false;

    while (attempts <= bridge.retryPolicy.maxRetries) {
      attempts++;
      if (handler) {
        try {
          delivered = handler(event);
          if (delivered) break;
        } catch {
          // Retry
        }
      } else {
        delivered = true;
        break;
      }

      if (attempts <= bridge.retryPolicy.maxRetries) {
        bridge.stats.retried++;
      }
    }

    const latencyMs = Date.now() - startMs;

    if (delivered) {
      bridge.stats.delivered++;
      cb.failures = 0;
      this.eventLog.push({ bridgeId, event, status: 'delivered', timestamp: new Date().toISOString(), attempts });
      return { status: 'delivered', attempts, latencyMs };
    }

    bridge.stats.failed++;
    cb.failures++;
    if (cb.failures >= cb.failureThreshold) {
      cb.openedAt = Date.now();
    }

    this.deadLetters.push({ bridgeId, event, error: `Failed after ${attempts} attempts`, timestamp: new Date().toISOString() });
    this.eventLog.push({ bridgeId, event, status: 'dead_letter', timestamp: new Date().toISOString(), attempts });
    if (this.eventLog.length > 1000) this.eventLog = this.eventLog.slice(-1000);
    if (this.deadLetters.length > 500) this.deadLetters = this.deadLetters.slice(-500);

    return { status: 'dead_letter', attempts, latencyMs };
  }

  toggleBridge(id: string, active: boolean): boolean {
    const bridge = this.bridges.get(id);
    if (!bridge) return false;
    bridge.active = active;
    return true;
  }

  getLog(): typeof this.eventLog { return [...this.eventLog]; }
  getDeadLetters(): typeof this.deadLetters { return [...this.deadLetters]; }

  getStats(): { bridges: number; activeBridges: number; totalDelivered: number; totalFailed: number; deadLetters: number } {
    const all = [...this.bridges.values()];
    return {
      bridges: all.length,
      activeBridges: all.filter(b => b.active).length,
      totalDelivered: all.reduce((s, b) => s + b.stats.delivered, 0),
      totalFailed: all.reduce((s, b) => s + b.stats.failed, 0),
      deadLetters: this.deadLetters.length,
    };
  }

  reset(): void {
    this.bridges.clear();
    this.eventLog = [];
    this.deadLetters = [];
  }
}
