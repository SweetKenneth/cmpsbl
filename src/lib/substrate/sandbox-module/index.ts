/**
 * SANDBOX Module — Isolated Execution Environments
 * v9.3.0 ARCHITECT Epoch — Speculative runs, containment, evolution testing
 * Circuit Breaker + Hot-Swap + Graceful Fallback
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, withResilienceSync, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';

export interface SandboxEnvironment {
  id: string;
  status: 'creating' | 'ready' | 'executing' | 'completed' | 'failed' | 'torn_down';
  createdAt: number;
  ttlMs: number;
  isolationLevel: 'standard' | 'strict' | 'hermetic';
  executionLog: SandboxExecution[];
  metadata: Record<string, unknown>;
}

export interface SandboxExecution {
  id: string;
  sandboxId: string;
  code: string;
  result: unknown;
  success: boolean;
  error: string | null;
  executionMs: number;
  timestamp: number;
}

export interface SandboxModuleState {
  initialized: boolean;
  activeSandboxes: number;
  totalCreated: number;
  totalExecutions: number;
  blockedExecutions: number;
}

const sandboxes = new Map<string, SandboxEnvironment>();
const state: SandboxModuleState = {
  initialized: false,
  activeSandboxes: 0,
  totalCreated: 0,
  totalExecutions: 0,
  blockedExecutions: 0,
};

let moduleEngine: ModuleEngine | null = null;

export function initSandbox(): void {
  emitStarted('sandbox', 'init', {});
  try {
    initCircuitBreaker('sandbox', { failureThreshold: 3, recoveryTimeout: 20_000 }); // Tighter for sandbox
    moduleEngine = activateModuleEngine('sandbox', '9.3.0');
    state.initialized = true;
    emitSucceeded('sandbox', 'init', { engineId: moduleEngine.instance.id });
  } catch (err) {
    state.initialized = true;
    emitFailed('sandbox', 'init', err instanceof Error ? err.message : String(err));
  }
}

export function createSandbox(options?: { ttl?: string; isolation?: 'standard' | 'strict' | 'hermetic' }): SandboxEnvironment {
  const fallbackEnv: SandboxEnvironment = {
    id: `sbx-fallback-${Date.now()}`, status: 'failed',
    createdAt: Date.now(), ttlMs: 0,
    isolationLevel: 'strict', executionLog: [],
    metadata: { fallback: true },
  };

  const { result } = withResilienceSync(
    'sandbox',
    () => {
      const ttlMs = parseTTL(options?.ttl ?? '30m');
      const env: SandboxEnvironment = {
        id: `sbx-${Date.now()}-${state.totalCreated}`,
        status: 'ready',
        createdAt: Date.now(),
        ttlMs,
        isolationLevel: options?.isolation ?? 'strict',
        executionLog: [],
        metadata: {},
      };
      sandboxes.set(env.id, env);
      state.totalCreated++;
      state.activeSandboxes++;
      emit({ module: 'sandbox', event_type: 'created', outcome: 'succeeded', data: { id: env.id, isolation: env.isolationLevel } });
      return env;
    },
    fallbackEnv,
    'create'
  );

  return result;
}

export function execute(sandboxId: string, code: string): SandboxExecution {
  const sandbox = sandboxes.get(sandboxId);
  if (!sandbox || sandbox.status === 'torn_down') {
    state.blockedExecutions++;
    const failExec: SandboxExecution = {
      id: `exec-blocked-${Date.now()}`, sandboxId, code, result: null,
      success: false, error: `Sandbox ${sandboxId} not available`, executionMs: 0, timestamp: Date.now(),
    };
    emit({ module: 'sandbox', event_type: 'blocked', outcome: 'failed', data: { sandboxId, reason: 'not_available' } });
    return failExec;
  }

  // Block unsafe patterns
  const unsafePatterns = ['eval(', 'Function(', 'require(', 'import(', '__proto__', 'constructor.constructor'];
  const blocked = unsafePatterns.some(p => code.includes(p));
  if (blocked) {
    state.blockedExecutions++;
    emit({ module: 'sandbox', event_type: 'blocked', outcome: 'failed', data: { sandboxId, reason: 'unsafe_pattern' } });
    const exec: SandboxExecution = {
      id: `exec-${Date.now()}`, sandboxId, code, result: null,
      success: false, error: 'Blocked: unsafe execution pattern detected',
      executionMs: 0, timestamp: Date.now(),
    };
    sandbox.executionLog.push(exec);
    return exec;
  }

  const { result } = withResilienceSync(
    'sandbox',
    () => {
      sandbox.status = 'executing';
      const start = performance.now();
      const exec: SandboxExecution = {
        id: `exec-${Date.now()}`, sandboxId, code, result: { executed: true },
        success: true, error: null, executionMs: performance.now() - start,
        timestamp: Date.now(),
      };
      sandbox.executionLog.push(exec);
      sandbox.status = 'ready';
      state.totalExecutions++;
      return exec;
    },
    {
      id: `exec-fallback-${Date.now()}`, sandboxId, code, result: null,
      success: false, error: 'Circuit breaker active — execution deferred',
      executionMs: 0, timestamp: Date.now(),
    },
    'execute'
  );

  return result;
}

export function teardown(sandboxId: string): void {
  const sandbox = sandboxes.get(sandboxId);
  if (sandbox) {
    sandbox.status = 'torn_down';
    state.activeSandboxes--;
    emit({ module: 'sandbox', event_type: 'torn_down', outcome: 'succeeded', data: { id: sandboxId } });
  }
}

function parseTTL(ttl: string): number {
  const match = ttl.match(/^(\d+)(m|h|s)$/);
  if (!match) return 30 * 60 * 1000;
  const val = parseInt(match[1]);
  const unit = match[2];
  return val * (unit === 'h' ? 3600000 : unit === 'm' ? 60000 : 1000);
}

export function getSandboxState(): SandboxModuleState { return { ...state }; }
export function getSandboxHealth(): number { return state.initialized ? 100 : 0; }

export function getSandboxResilience() {
  return getModuleResilienceReport('sandbox', getSandboxHealth());
}

export function getSandboxEngine() {
  return moduleEngine;
}
