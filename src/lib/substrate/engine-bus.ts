/**
 * promptfluid® Engine Bus
 * Canonical Routing Layer with Telemetry Integration
 * 
 * The Engine Bus is the single execution router for all substrate engines.
 * All engine execution must route through engine_bus.dispatch().
 * 
 * Capabilities:
 * - Integrated with Telemetry Engine for observability
 * - Emits telemetry before/after execution and on failure
 * - Chain execution support for linked operations
 * 
 * Responsibilities:
 * - Resolve command → engine mapping
 * - Enforce execution order for chained calls
 * - Normalize errors and return codes
 * - Apply retries and timeouts
 * - Emit execution events for observability
 * - Emit telemetry events via TelemetryEngine
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
  /** Timeout in milliseconds (default: 60000 for long ops, 30000 otherwise) */
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

// ═══════════════════════════════════════════════════════════════════════════════
// COGNITIVE LOAD BALANCER — Prevents brain overload from concurrent dispatches
// ═══════════════════════════════════════════════════════════════════════════════

interface LoadBalancerConfig {
  maxConcurrentDispatches: number;
  maxQueueDepth: number;
  shedThreshold: number;       // Active dispatch count where we start shedding
  cooldownMs: number;          // Minimum gap between dispatches to same engine
  backpressureEnabled: boolean;
}

const DEFAULT_LOAD_CONFIG: LoadBalancerConfig = {
  maxConcurrentDispatches: 8,
  maxQueueDepth: 20,
  shedThreshold: 6,
  cooldownMs: 200,
  backpressureEnabled: true,
};

class CognitiveLoadBalancer {
  private config: LoadBalancerConfig;
  private lastDispatchByEngine = new Map<EngineName, number>();
  private queuedCount = 0;
  private shedCount = 0;

  constructor(config: LoadBalancerConfig = DEFAULT_LOAD_CONFIG) {
    this.config = config;
  }

  /** Check if a dispatch should be allowed, shed, or queued */
  shouldAllow(engine: EngineName, activeDispatches: number): 'allow' | 'shed' | 'backpressure' {
    // Hard limit — shed immediately
    if (activeDispatches >= this.config.maxConcurrentDispatches) {
      this.shedCount++;
      return 'shed';
    }

    // Soft limit — apply backpressure (delay)
    if (this.config.backpressureEnabled && activeDispatches >= this.config.shedThreshold) {
      const lastDispatch = this.lastDispatchByEngine.get(engine) ?? 0;
      const elapsed = Date.now() - lastDispatch;
      if (elapsed < this.config.cooldownMs) {
        return 'backpressure';
      }
    }

    return 'allow';
  }

  recordDispatch(engine: EngineName): void {
    this.lastDispatchByEngine.set(engine, Date.now());
  }

  getBackpressureDelay(engine: EngineName): number {
    const lastDispatch = this.lastDispatchByEngine.get(engine) ?? 0;
    const elapsed = Date.now() - lastDispatch;
    return Math.max(0, this.config.cooldownMs - elapsed);
  }

  getStats() {
    return {
      shedCount: this.shedCount,
      queuedCount: this.queuedCount,
      cooldownMs: this.config.cooldownMs,
      maxConcurrent: this.config.maxConcurrentDispatches,
    };
  }

  configure(updates: Partial<LoadBalancerConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

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
  private loadBalancer = new CognitiveLoadBalancer();

  private constructor() {
    this.state.initialized = true;
  }

  static getInstance(): EngineBusClient {
    if (!EngineBusClient.instance) {
      EngineBusClient.instance = new EngineBusClient();
    }
    return EngineBusClient.instance;
  }

  /** Get cognitive load balancer stats */
  getLoadStats() {
    return this.loadBalancer.getStats();
  }

  /** Configure load balancer */
  configureLoadBalancer(updates: Partial<LoadBalancerConfig>): void {
    this.loadBalancer.configure(updates);
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
    const correlationId = crypto.randomUUID();
    // Dynamic timeout: long-running cognitive commands get 60s
    const longRunning = ['optimize', 'tier', 'cognitive_cycle', 'deep_think', 'synthesize', 'graph_build', 'reflect', 'dream', 'cycle', 'scan', 'evolve', 'heal'].some(k => command.includes(k));
    const {
      timeout = longRunning ? 60000 : 30000,
      retries = 0,
      retryDelay = 1000,
      deterministicMode = false,
    } = options;

    // Resolve engine from command
    const engine = this.resolveEngine(command);
    
    if (!engine) {
      return this.createErrorResult<T>(command, 'memory_core', startTime, 'COMMAND_NOT_FOUND');
    }

    // ── Cognitive Load Balancer Gate ──
    const loadDecision = this.loadBalancer.shouldAllow(engine, this.state.activeDispatches);
    
    if (loadDecision === 'shed') {
      const endTime = new Date();
      this.logEvent(engine, command, false, endTime.getTime() - startTime.getTime(), 'EXECUTION_FAILED');
      return {
        success: false,
        engine,
        command,
        error: `Load shed: ${this.state.activeDispatches} concurrent dispatches exceeds limit. Brain is overloaded — retry after cooldown.`,
        errorCode: 'EXECUTION_FAILED',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationMs: endTime.getTime() - startTime.getTime(),
        retryCount: 0,
        stage: 'failed',
      };
    }

    if (loadDecision === 'backpressure') {
      const delay = this.loadBalancer.getBackpressureDelay(engine);
      if (delay > 0) await this.sleep(delay);
    }

    this.loadBalancer.recordDispatch(engine);

    // Emit telemetry start (lazy import to avoid circular dep)
    this.emitTelemetryStart(engine, command, correlationId);

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

        const successResult: DispatchResult<T> = {
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

        // Emit telemetry end
        this.emitTelemetryEnd(successResult, correlationId);

        return successResult;
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

    const failResult: DispatchResult<T> = {
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

    // Emit telemetry end (with failure)
    this.emitTelemetryEnd(failResult, correlationId);

    return failResult;
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
    // Use Promise.race with a proper timeout promise for correct cancellation
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`TIMEOUT: ${command} exceeded ${timeout}ms limit`)), timeout);
    });

    const execPromise = (async () => {
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
    })();

    return Promise.race([execPromise, timeoutPromise]);
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

  // Telemetry integration (lazy import to avoid circular dependency)
  private emitTelemetryStart(engine: EngineName, command: string, correlationId: string): void {
    import('./telemetry-engine').then(({ telemetryEngine }) => {
      telemetryEngine.emitDispatchStart(engine, command, correlationId);
    }).catch(() => { /* silently fail */ });
  }

  private emitTelemetryEnd<T>(result: DispatchResult<T>, correlationId: string): void {
    import('./telemetry-engine').then(({ telemetryEngine }) => {
      telemetryEngine.emitDispatchEnd(result, correlationId);
    }).catch(() => { /* silently fail */ });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const engineBus = EngineBusClient.getInstance();
export { EngineBusClient };
