/**
 * promptfluid® Engine Bus
 * v6.4.0 — Canonical Routing Layer
 * 
 * The Engine Bus is the single execution router for all substrate engines.
 * All engine execution must route through engine_bus.dispatch().
 * 
 * Responsibilities:
 * - Resolve command → engine mapping
 * - Enforce execution order for chained calls
 * - Normalize errors and return codes
 * - Apply retries and timeouts
 * - Emit execution events for observability
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type EngineName = 
  | 'memory_core' 
  | 'learning_engine' 
  | 'imagination_engine' 
  | 'reasoning_engine' 
  | 'governance_guard';

export type DispatchStage = 'pending' | 'routing' | 'executing' | 'completed' | 'failed';

export interface DispatchOptions {
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Number of retries on failure (default: 0) */
  retries?: number;
  /** Retry delay in milliseconds (default: 1000) */
  retryDelay?: number;
  /** Enable deterministic mode (repeatable outputs) */
  deterministicMode?: boolean;
  /** Execution priority (higher = more urgent) */
  priority?: number;
  /** Chain execution context (for linked operations) */
  chainContext?: ChainContext;
}

export interface ChainContext {
  chainId: string;
  step: number;
  totalSteps: number;
  previousResults?: DispatchResult<unknown>[];
}

export interface DispatchResult<T = unknown> {
  success: boolean;
  engine: EngineName;
  command: string;
  data?: T;
  error?: string;
  errorCode?: DispatchErrorCode;
  startTime: string;
  endTime: string;
  durationMs: number;
  retryCount: number;
  stage: DispatchStage;
}

export type DispatchErrorCode = 
  | 'TIMEOUT' 
  | 'ENGINE_NOT_FOUND' 
  | 'COMMAND_NOT_FOUND' 
  | 'EXECUTION_FAILED' 
  | 'RETRY_EXHAUSTED'
  | 'CHAIN_BROKEN'
  | 'GOVERNANCE_BLOCKED';

export interface BusState {
  initialized: boolean;
  activeDispatches: number;
  totalDispatches: number;
  successfulDispatches: number;
  failedDispatches: number;
  averageDurationMs: number;
  lastDispatch: string | null;
}

export interface ExecutionEvent {
  id: string;
  engine: EngineName;
  command: string;
  success: boolean;
  durationMs: number;
  errorCode?: DispatchErrorCode;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE ROUTING MAP
// ═══════════════════════════════════════════════════════════════════════════════

const ENGINE_ROUTING_MAP: Record<EngineName, string[]> = {
  memory_core: [
    'ingest', 'store', 'index', 'reflect', 'retrieve',
    'memory_ingest', 'memory_retrieve', 'memory_state', 'memory_cycle',
    'remember', 'recall', 'query',
  ],
  learning_engine: [
    'input', 'feedback', 'adjustment', 'reinforcement', 'stabilization',
    'train', 'optimize', 'reinforce', 'learning_cycle',
  ],
  imagination_engine: [
    'latent_extraction', 'recombination', 'simulation', 'synthesis',
    'dream', 'synthesize', 'pattern_fusion', 'imagination_cycle',
  ],
  reasoning_engine: [
    'causal_mapping', 'dependency_analysis', 'hypothesis_generation', 
    'hypothesis_validation', 'impact_projection',
    'causal', 'systems_reason', 'hypothesis_test', 'reasoning_cycle',
  ],
  governance_guard: [
    'coherence_validation', 'ethical_constraint_check', 'governance_signal_emission',
    'ethical', 'coherence_check', 'governance_cycle',
  ],
};

// Reverse lookup: command → engine
const COMMAND_TO_ENGINE: Record<string, EngineName> = {};
for (const [engine, commands] of Object.entries(ENGINE_ROUTING_MAP)) {
  for (const command of commands) {
    COMMAND_TO_ENGINE[command] = engine as EngineName;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE BUS CLIENT
// ═══════════════════════════════════════════════════════════════════════════════

class EngineBusClient {
  private static instance: EngineBusClient;
  private state: BusState = {
    initialized: false,
    activeDispatches: 0,
    totalDispatches: 0,
    successfulDispatches: 0,
    failedDispatches: 0,
    averageDurationMs: 0,
    lastDispatch: null,
  };
  private eventLog: ExecutionEvent[] = [];
  private readonly MAX_EVENT_LOG = 100;

  private constructor() {
    this.state.initialized = true;
  }

  static getInstance(): EngineBusClient {
    if (!EngineBusClient.instance) {
      EngineBusClient.instance = new EngineBusClient();
    }
    return EngineBusClient.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE DISPATCH
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Main dispatch method - routes all engine execution
   */
  async dispatch<T = unknown>(
    command: string,
    payload?: Record<string, unknown>,
    options: DispatchOptions = {}
  ): Promise<DispatchResult<T>> {
    const startTime = new Date();
    const {
      timeout = 30000,
      retries = 0,
      retryDelay = 1000,
      deterministicMode = false,
    } = options;

    // Resolve engine from command
    const engine = this.resolveEngine(command);
    
    if (!engine) {
      return this.createErrorResult<T>(command, 'memory_core', startTime, 'COMMAND_NOT_FOUND');
    }

    this.state.activeDispatches++;
    this.state.totalDispatches++;
    this.state.lastDispatch = startTime.toISOString();

    let lastError: Error | null = null;
    let retryCount = 0;

    // Retry loop
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await this.executeWithTimeout<T>(
          engine,
          command,
          { ...payload, deterministicMode },
          timeout
        );

        const endTime = new Date();
        const durationMs = endTime.getTime() - startTime.getTime();

        // Update state
        this.state.activeDispatches--;
        this.state.successfulDispatches++;
        this.updateAverageDuration(durationMs);

        // Log event
        this.logEvent(engine, command, true, durationMs);

        return {
          success: true,
          engine,
          command,
          data: result,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          durationMs,
          retryCount: attempt,
          stage: 'completed',
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        retryCount = attempt;

        if (attempt < retries) {
          await this.sleep(retryDelay);
        }
      }
    }

    // All retries exhausted
    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();

    this.state.activeDispatches--;
    this.state.failedDispatches++;
    this.updateAverageDuration(durationMs);

    const errorCode: DispatchErrorCode = retryCount > 0 ? 'RETRY_EXHAUSTED' : 'EXECUTION_FAILED';
    this.logEvent(engine, command, false, durationMs, errorCode);

    return {
      success: false,
      engine,
      command,
      error: lastError?.message || 'Unknown error',
      errorCode,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationMs,
      retryCount,
      stage: 'failed',
    };
  }

  /**
   * Dispatch with explicit engine target (bypasses routing)
   */
  async dispatchToEngine<T = unknown>(
    engine: EngineName,
    command: string,
    payload?: Record<string, unknown>,
    options: DispatchOptions = {}
  ): Promise<DispatchResult<T>> {
    // Validate engine exists
    if (!ENGINE_ROUTING_MAP[engine]) {
      const startTime = new Date();
      return this.createErrorResult<T>(command, engine, startTime, 'ENGINE_NOT_FOUND');
    }

    // Route through main dispatch with engine override
    return this.dispatch<T>(command, { ...payload, _targetEngine: engine }, options);
  }

  /**
   * Chain multiple dispatches in sequence
   */
  async dispatchChain(
    chain: Array<{ command: string; payload?: Record<string, unknown> }>,
    options: DispatchOptions = {}
  ): Promise<DispatchResult<DispatchResult<unknown>[]>> {
    const startTime = new Date();
    const chainId = crypto.randomUUID();
    const results: DispatchResult<unknown>[] = [];

    for (let i = 0; i < chain.length; i++) {
      const { command, payload } = chain[i];
      const chainContext: ChainContext = {
        chainId,
        step: i + 1,
        totalSteps: chain.length,
        previousResults: results,
      };

      const result = await this.dispatch(command, payload, { ...options, chainContext });
      results.push(result);

      // Break chain on failure
      if (!result.success) {
        const endTime = new Date();
        return {
          success: false,
          engine: 'memory_core',
          command: `chain:${chainId}`,
          data: results,
          error: `Chain broken at step ${i + 1}: ${result.error}`,
          errorCode: 'CHAIN_BROKEN',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          durationMs: endTime.getTime() - startTime.getTime(),
          retryCount: 0,
          stage: 'failed',
        };
      }
    }

    const endTime = new Date();
    return {
      success: true,
      engine: 'memory_core',
      command: `chain:${chainId}`,
      data: results,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationMs: endTime.getTime() - startTime.getTime(),
      retryCount: 0,
      stage: 'completed',
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGINE RESOLUTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Resolve command to engine
   */
  resolveEngine(command: string): EngineName | null {
    return COMMAND_TO_ENGINE[command] || null;
  }

  /**
   * Get all commands for an engine
   */
  getEngineCommands(engine: EngineName): string[] {
    return ENGINE_ROUTING_MAP[engine] || [];
  }

  /**
   * Check if command is valid
   */
  isValidCommand(command: string): boolean {
    return command in COMMAND_TO_ENGINE;
  }

  /**
   * Get full routing map
   */
  getRoutingMap(): Record<EngineName, string[]> {
    return { ...ENGINE_ROUTING_MAP };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE & OBSERVABILITY
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get current bus state
   */
  getState(): BusState {
    return { ...this.state };
  }

  /**
   * Get recent execution events
   */
  getEvents(limit: number = 20): ExecutionEvent[] {
    return this.eventLog.slice(-limit);
  }

  /**
   * Get events by engine
   */
  getEventsByEngine(engine: EngineName, limit: number = 10): ExecutionEvent[] {
    return this.eventLog
      .filter(e => e.engine === engine)
      .slice(-limit);
  }

  /**
   * Get failure rate (last N dispatches)
   */
  getFailureRate(windowSize: number = 100): number {
    const recentEvents = this.eventLog.slice(-windowSize);
    if (recentEvents.length === 0) return 0;
    
    const failures = recentEvents.filter(e => !e.success).length;
    return failures / recentEvents.length;
  }

  /**
   * Reset state (for testing)
   */
  resetState(): void {
    this.state = {
      initialized: true,
      activeDispatches: 0,
      totalDispatches: 0,
      successfulDispatches: 0,
      failedDispatches: 0,
      averageDurationMs: 0,
      lastDispatch: null,
    };
    this.eventLog = [];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private async executeWithTimeout<T>(
    engine: EngineName,
    command: string,
    payload: Record<string, unknown>,
    timeout: number
  ): Promise<T> {
    const timeoutId = setTimeout(() => {
      throw new Error('TIMEOUT');
    }, timeout);

    try {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: {
          module: 'brain',
          action: command,
          payload,
          _engine: engine,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.success === false) throw new Error(data.error || data.message || 'Command failed');

      return data as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private createErrorResult<T>(
    command: string,
    engine: EngineName,
    startTime: Date,
    errorCode: DispatchErrorCode
  ): DispatchResult<T> {
    const endTime = new Date();
    return {
      success: false,
      engine,
      command,
      error: `${errorCode}: ${command}`,
      errorCode,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationMs: endTime.getTime() - startTime.getTime(),
      retryCount: 0,
      stage: 'failed',
    };
  }

  private updateAverageDuration(durationMs: number): void {
    const total = this.state.successfulDispatches + this.state.failedDispatches;
    if (total === 1) {
      this.state.averageDurationMs = durationMs;
    } else {
      // Rolling average
      this.state.averageDurationMs = 
        (this.state.averageDurationMs * (total - 1) + durationMs) / total;
    }
  }

  private logEvent(
    engine: EngineName,
    command: string,
    success: boolean,
    durationMs: number,
    errorCode?: DispatchErrorCode
  ): void {
    const event: ExecutionEvent = {
      id: crypto.randomUUID(),
      engine,
      command,
      success,
      durationMs,
      errorCode,
      timestamp: new Date().toISOString(),
    };

    this.eventLog.push(event);

    // Trim log to max size
    if (this.eventLog.length > this.MAX_EVENT_LOG) {
      this.eventLog = this.eventLog.slice(-this.MAX_EVENT_LOG);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const engineBus = EngineBusClient.getInstance();
export { EngineBusClient };
