/**
 * Defense Circuit Breaker
 * Per-module failure isolation
 * 
 * Implements the circuit breaker pattern to prevent cascading failures:
 * - CLOSED: Normal operation
 * - OPEN: Module is failing, reject requests
 * - HALF_OPEN: Trial period to check if module recovered
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { ripple } from '@/lib/ripple';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type CircuitState = 'closed' | 'open' | 'half_open';

export interface CircuitConfig {
  failureThreshold: number;     // Failures before opening
  successThreshold: number;     // Successes in half-open to close
  timeoutMs: number;            // Request timeout
  resetTimeoutMs: number;       // Time before half-open
  monitorWindowMs: number;      // Window for counting failures
}

export interface CircuitStatus {
  module: string;
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: string | null;
  lastStateChange: string;
  nextRetryAt: string | null;
  health: number; // 0-100
}

export interface CircuitBreakersState {
  circuits: Map<string, CircuitStatus>;
  globalHealth: number;
  openCircuits: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: CircuitConfig = {
  failureThreshold: 5,
  successThreshold: 3,
  timeoutMs: 30000,
  resetTimeoutMs: 60000, // 1 minute
  monitorWindowMs: 300000, // 5 minutes
};

// All substrate execution surfaces
const SUBSTRATE_MODULES = [
  'core', 'ripple', 'access', 'brain', 'vision', 'cortex',
  'evolution', 'decode', 'defense', 'nexus', 'dream',
  'integration', 'inclusive', 'system',
  'memory', 'relay', 'audit', 'identity', 'economy', 'sandbox',
  'encode'
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// CIRCUIT BREAKER CLIENT
// ═══════════════════════════════════════════════════════════════════════════════

class CircuitBreakerManager {
  private static instance: CircuitBreakerManager;
  
  private circuits: Map<string, CircuitStatus> = new Map();
  private configs: Map<string, CircuitConfig> = new Map();
  private failureHistory: Map<string, Date[]> = new Map();

  private constructor() {
    // Initialize all modules with default config
    for (const module of SUBSTRATE_MODULES) {
      this.initializeCircuit(module);
    }
  }

  static getInstance(): CircuitBreakerManager {
    if (!CircuitBreakerManager.instance) {
      CircuitBreakerManager.instance = new CircuitBreakerManager();
    }
    return CircuitBreakerManager.instance;
  }

  private initializeCircuit(module: string): void {
    this.circuits.set(module, {
      module,
      state: 'closed',
      failures: 0,
      successes: 0,
      lastFailure: null,
      lastStateChange: new Date().toISOString(),
      nextRetryAt: null,
      health: 100,
    });
    this.configs.set(module, { ...DEFAULT_CONFIG });
    this.failureHistory.set(module, []);
  }

  // ═══ EXECUTION WRAPPER ═══

  async execute<T>(
    module: string,
    operation: () => Promise<T>,
    fallback?: () => T
  ): Promise<{ success: boolean; data?: T; error?: string; circuitOpen?: boolean }> {
    const circuit = this.circuits.get(module);
    if (!circuit) {
      this.initializeCircuit(module);
    }

    const currentCircuit = this.circuits.get(module)!;

    // Check if circuit is open
    if (currentCircuit.state === 'open') {
      // Check if it's time to try half-open
      if (currentCircuit.nextRetryAt && new Date() >= new Date(currentCircuit.nextRetryAt)) {
        this.transitionTo(module, 'half_open');
      } else {
        // Circuit is open, reject request
        if (fallback) {
          return { success: true, data: fallback(), circuitOpen: true };
        }
        return { success: false, error: 'Circuit breaker open', circuitOpen: true };
      }
    }

    // Execute operation
    const config = this.configs.get(module)!;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Operation timeout')), config.timeoutMs);
    });

    try {
      const result = await Promise.race([operation(), timeoutPromise]);
      clearTimeout(timeoutId);
      this.recordSuccess(module);
      return { success: true, data: result };
    } catch (error) {
      clearTimeout(timeoutId);
      this.recordFailure(module, error instanceof Error ? error.message : 'Unknown error');
      if (fallback) {
        return { success: true, data: fallback(), circuitOpen: false };
      }
      return { success: false, error: error instanceof Error ? error.message : 'Operation failed' };
    }
  }

  // ═══ STATE TRANSITIONS ═══

  private recordSuccess(module: string): void {
    const circuit = this.circuits.get(module);
    if (!circuit) return;

    circuit.successes++;

    // In half-open, check if we should close
    if (circuit.state === 'half_open') {
      const config = this.configs.get(module)!;
      if (circuit.successes >= config.successThreshold) {
        this.transitionTo(module, 'closed');
      }
    }

    this.updateHealth(module);
  }

  private recordFailure(module: string, error: string): void {
    const circuit = this.circuits.get(module);
    if (!circuit) return;

    const config = this.configs.get(module)!;
    const now = new Date();

    circuit.failures++;
    circuit.lastFailure = now.toISOString();

    // Track failure in history
    const history = this.failureHistory.get(module)!;
    history.push(now);
    
    // Clean old failures outside monitoring window
    const windowStart = new Date(now.getTime() - config.monitorWindowMs);
    this.failureHistory.set(module, history.filter(d => d >= windowStart));

    // Count recent failures
    const recentFailures = this.failureHistory.get(module)!.length;

    // Check if we should open circuit
    if (circuit.state === 'closed' && recentFailures >= config.failureThreshold) {
      this.transitionTo(module, 'open');
    }

    // In half-open, any failure opens the circuit again
    if (circuit.state === 'half_open') {
      this.transitionTo(module, 'open');
    }

    this.updateHealth(module);
  }

  private transitionTo(module: string, newState: CircuitState): void {
    const circuit = this.circuits.get(module);
    if (!circuit || circuit.state === newState) return;

    const oldState = circuit.state;
    const config = this.configs.get(module)!;
    const now = new Date();

    circuit.state = newState;
    circuit.lastStateChange = now.toISOString();

    if (newState === 'open') {
      circuit.nextRetryAt = new Date(now.getTime() + config.resetTimeoutMs).toISOString();
      circuit.successes = 0;
    } else if (newState === 'half_open') {
      circuit.successes = 0;
      circuit.nextRetryAt = null;
    } else if (newState === 'closed') {
      circuit.failures = 0;
      circuit.successes = 0;
      circuit.nextRetryAt = null;
      this.failureHistory.set(module, []);
    }

    // Emit RIPPLE event
    ripple.publish('circuit.state_changed', 'defense', {
      module,
      oldState,
      newState,
      health: circuit.health,
    });

    // Persist to database
    this.persistCircuitState(module);
  }

  private updateHealth(module: string): void {
    const circuit = this.circuits.get(module);
    if (!circuit) return;

    const config = this.configs.get(module)!;
    const recentFailures = this.failureHistory.get(module)?.length || 0;

    // Health = 100 - (failures / threshold * 100)
    const failureRatio = Math.min(recentFailures / config.failureThreshold, 1);
    circuit.health = Math.round(100 * (1 - failureRatio));

    // State penalties
    if (circuit.state === 'open') circuit.health = 0;
    if (circuit.state === 'half_open') circuit.health = Math.min(circuit.health, 40);
  }

  // ═══ PERSISTENCE ═══

  private async persistCircuitState(module: string): Promise<void> {
    const circuit = this.circuits.get(module);
    if (!circuit) return;

    try {
      // Use brain_events for circuit state persistence
      await supabase.from('brain_events').insert({
        module: 'defense',
        event_type: 'circuit_state',
        data: {
          targetModule: module,
          state: circuit.state,
          health: circuit.health,
          failures: circuit.failures,
        } as unknown as Json,
        outcome: circuit.state,
      });
    } catch {
      // Silent fail
    }
  }

  // ═══ MANUAL CONTROLS ═══

  forceOpen(module: string): void {
    this.transitionTo(module, 'open');
  }

  forceClose(module: string): void {
    this.transitionTo(module, 'closed');
  }

  reset(module: string): void {
    this.initializeCircuit(module);
  }

  setConfig(module: string, config: Partial<CircuitConfig>): void {
    const current = this.configs.get(module) || DEFAULT_CONFIG;
    this.configs.set(module, { ...current, ...config });
  }

  // ═══ STATE ACCESS ═══

  getCircuitStatus(module: string): CircuitStatus | null {
    return this.circuits.get(module) || null;
  }

  getAllCircuits(): CircuitStatus[] {
    return Array.from(this.circuits.values());
  }

  // Single-pass computation for all aggregate stats
  private computeAggregates(): { openCircuits: string[]; globalHealth: number } {
    let totalHealth = 0;
    const openCircuits: string[] = [];
    for (const c of this.circuits.values()) {
      totalHealth += c.health;
      if (c.state === 'open') openCircuits.push(c.module);
    }
    const globalHealth = this.circuits.size > 0 ? Math.round(totalHealth / this.circuits.size) : 100;
    return { openCircuits, globalHealth };
  }

  getState(): CircuitBreakersState {
    const { openCircuits, globalHealth } = this.computeAggregates();
    return { circuits: this.circuits, globalHealth, openCircuits };
  }

  getOpenCircuits(): string[] {
    return this.computeAggregates().openCircuits;
  }

  getGlobalHealth(): number {
    return this.computeAggregates().globalHealth;
  }
}

// Singleton export
export const circuitBreaker = CircuitBreakerManager.getInstance();
