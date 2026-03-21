/**
 * Capability Gate System
 * Governance wrapper for all substrate actions
 */

import { generateTraceId } from '@/lib/system/trace';
import { emit, emitStarted, emitSucceeded, emitFailed } from '@/lib/substrate/events/emit';
import { redactSecrets } from '@/lib/defense/redact';
import { circuitBreaker, type CircuitState, type CircuitStatus } from '@/lib/defense/circuit-breaker';
import { log } from '@/lib/system/log';
import { createAppError, type AppError } from '@/lib/system/errors';

export type ExecutionMode = 'manual' | 'advisory' | 'governed' | 'emergency';

export interface CapabilityConfig {
  enabled: boolean;
  mode: ExecutionMode;
  requiresApproval: boolean;
  rateLimit?: {
    maxPerMinute: number;
    maxPerHour: number;
  };
  circuitBreaker?: {
    enabled: boolean;
    failureThreshold: number;
    recoveryTimeMs: number;
  };
}

export interface GateRequest {
  module: string;
  action: string;
  payload?: Record<string, unknown>;
  dryRun?: boolean;
  skipApproval?: boolean;
  traceId?: string;
}

export interface GateResult {
  allowed: boolean;
  trace_id: string;
  reason?: string;
  preview?: {
    description: string;
    impact: string;
    rollbackAvailable: boolean;
    payload_redacted: Record<string, unknown>;
  };
  circuitState?: CircuitState;
}

export interface ExecuteResult<T = unknown> {
  success: boolean;
  trace_id: string;
  data?: T;
  error?: AppError;
  executionTimeMs: number;
}

// Default configs per module
const defaultConfigs: Record<string, CapabilityConfig> = {
  // Kernel
  core: { enabled: true, mode: 'governed', requiresApproval: false },
  // CCR Zones
  system: { enabled: true, mode: 'governed', requiresApproval: true },
  brain: { enabled: true, mode: 'governed', requiresApproval: false },
  memory: { enabled: true, mode: 'governed', requiresApproval: false },
  dream: { enabled: true, mode: 'governed', requiresApproval: false },
  // OCG Zones
  ripple: { enabled: true, mode: 'governed', requiresApproval: false },
  access: { enabled: true, mode: 'governed', requiresApproval: true },
  identity: { enabled: true, mode: 'governed', requiresApproval: true },
  relay: { enabled: true, mode: 'governed', requiresApproval: true },
  audit: { enabled: true, mode: 'governed', requiresApproval: false },
  // Execution Modules
  decode: { enabled: true, mode: 'governed', requiresApproval: false },
  encode: { enabled: true, mode: 'governed', requiresApproval: true },
  vision: { enabled: true, mode: 'governed', requiresApproval: false },
  cortex: { enabled: true, mode: 'governed', requiresApproval: true },
  nexus: { enabled: true, mode: 'governed', requiresApproval: false },
  economy: { enabled: true, mode: 'governed', requiresApproval: false },
  sandbox: { enabled: true, mode: 'governed', requiresApproval: false },
  inclusive: { enabled: true, mode: 'governed', requiresApproval: false },
  integration: { enabled: true, mode: 'governed', requiresApproval: true },
  // Mesh Overlays
  defense: { enabled: true, mode: 'governed', requiresApproval: true },
  immunity: { enabled: true, mode: 'governed', requiresApproval: false },
  intent: { enabled: true, mode: 'governed', requiresApproval: false },
  governance: { enabled: true, mode: 'governed', requiresApproval: false },
  gov: { enabled: true, mode: 'governed', requiresApproval: false },
  // Supervisory Planes
  obs: { enabled: true, mode: 'governed', requiresApproval: false },
  observability: { enabled: true, mode: 'governed', requiresApproval: false },
  analytics: { enabled: true, mode: 'governed', requiresApproval: false },
  // Control Planes
  seba: { enabled: true, mode: 'governed', requiresApproval: true },
  encoded: { enabled: true, mode: 'governed', requiresApproval: true },
  synergy: { enabled: true, mode: 'governed', requiresApproval: false },
  atlas: { enabled: true, mode: 'governed', requiresApproval: false },
  clm: { enabled: true, mode: 'governed', requiresApproval: false },
};

// Read-only actions that never require approval
const READ_ONLY_ACTIONS = ['status', 'health', 'info', 'summary', 'list', 'get', 'check', 'version'];

// Rate limit tracking
const rateLimitBuckets = new Map<string, { minute: number[]; hour: number[] }>();

function checkRateLimit(module: string, action: string, config: CapabilityConfig): boolean {
  if (!config.rateLimit) return true;

  const key = `${module}:${action}`;
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  const oneHourAgo = now - 3600000;

  let bucket = rateLimitBuckets.get(key);
  if (!bucket) {
    bucket = { minute: [], hour: [] };
    rateLimitBuckets.set(key, bucket);
  }

  // Clean old entries
  bucket.minute = bucket.minute.filter(t => t > oneMinuteAgo);
  bucket.hour = bucket.hour.filter(t => t > oneHourAgo);

  if (bucket.minute.length >= config.rateLimit.maxPerMinute) {
    return false;
  }
  if (bucket.hour.length >= config.rateLimit.maxPerHour) {
    return false;
  }

  bucket.minute.push(now);
  bucket.hour.push(now);
  return true;
}

export function getCapabilityConfig(module: string): CapabilityConfig {
  return defaultConfigs[module] || { 
    enabled: true, 
    mode: 'governed', 
    requiresApproval: true 
  };
}

/** Check if an action is read-only (never requires approval) */
function isReadOnlyAction(action: string): boolean {
  const actionSuffix = action.includes('.') ? action.split('.').pop()! : action;
  return READ_ONLY_ACTIONS.includes(actionSuffix.toLowerCase());
}

export async function checkGate(request: GateRequest): Promise<GateResult> {
  const trace_id = request.traceId || generateTraceId();
  const config = getCapabilityConfig(request.module);

  // Check if enabled
  if (!config.enabled) {
    return {
      allowed: false,
      trace_id,
      reason: `Module ${request.module} is disabled`,
    };
  }

  // Check circuit breaker
  const circuitStatus = circuitBreaker.getCircuitStatus(request.module);
  const breakerState: CircuitState = circuitStatus?.state || 'closed';
  
  if (breakerState === 'open') {
    return {
      allowed: false,
      trace_id,
      reason: 'Circuit breaker is open due to repeated failures',
      circuitState: breakerState,
    };
  }

  // Check rate limits
  if (!checkRateLimit(request.module, request.action, config)) {
    return {
      allowed: false,
      trace_id,
      reason: 'Rate limit exceeded',
    };
  }

  // In governed mode with dry_run, return preview
  if (config.mode === 'governed' && request.dryRun) {
    return {
      allowed: true,
      trace_id,
      preview: {
        description: `Execute ${request.action} on ${request.module}`,
        impact: config.requiresApproval ? 'Requires explicit approval' : 'Will execute automatically',
        rollbackAvailable: true,
        payload_redacted: redactSecrets(request.payload || {}),
      },
      circuitState: breakerState,
    };
  }

  // Check approval requirement (read-only actions like .status never need approval)
  if (config.requiresApproval && !request.skipApproval && config.mode === 'governed' && !isReadOnlyAction(request.action)) {
    return {
      allowed: false,
      trace_id,
      reason: 'Requires explicit approval',
      preview: {
        description: `Execute ${request.action} on ${request.module}`,
        impact: 'Action requires approval before execution',
        rollbackAvailable: true,
        payload_redacted: redactSecrets(request.payload || {}),
      },
    };
  }

  return {
    allowed: true,
    trace_id,
    circuitState: breakerState,
  };
}

export async function executeWithGate<T>(
  request: GateRequest,
  executor: (traceId: string) => Promise<T>
): Promise<ExecuteResult<T>> {
  const startTime = Date.now();
  const gateResult = await checkGate(request);

  if (!gateResult.allowed) {
    return {
      success: false,
      trace_id: gateResult.trace_id,
      error: createAppError('GOVERNANCE_BLOCKED', gateResult.reason || 'Action blocked', {
        module: request.module,
        action: request.action,
      }, gateResult.trace_id),
      executionTimeMs: Date.now() - startTime,
    };
  }

  try {
    await emitStarted(request.module, request.action, request.payload, gateResult.trace_id);

    // Use circuit breaker's execute wrapper
    const result = await circuitBreaker.execute(
      request.module,
      () => executor(gateResult.trace_id)
    );

    if (result.success && result.data !== undefined) {
      await emitSucceeded(request.module, request.action, { result: redactSecrets(result.data as Record<string, unknown>) }, gateResult.trace_id);

      return {
        success: true,
        trace_id: gateResult.trace_id,
        data: result.data as T,
        executionTimeMs: Date.now() - startTime,
      };
    } else {
      const errorMessage = result.error || 'Execution failed';
      await emitFailed(request.module, request.action, errorMessage, request.payload, gateResult.trace_id);

      return {
        success: false,
        trace_id: gateResult.trace_id,
        error: createAppError('MODULE_ERROR', errorMessage, {
          module: request.module,
          action: request.action,
        }, gateResult.trace_id),
        executionTimeMs: Date.now() - startTime,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    await emitFailed(request.module, request.action, errorMessage, request.payload, gateResult.trace_id);

    log.error(request.module, `${request.action} failed`, { error: errorMessage }, gateResult.trace_id);

    return {
      success: false,
      trace_id: gateResult.trace_id,
      error: createAppError('MODULE_ERROR', errorMessage, {
        module: request.module,
        action: request.action,
      }, gateResult.trace_id),
      executionTimeMs: Date.now() - startTime,
    };
  }
}

// Update capability config (for runtime changes)
export function updateCapabilityConfig(module: string, updates: Partial<CapabilityConfig>): void {
  const current = defaultConfigs[module] || { enabled: false, mode: 'governed' as const, requiresApproval: true };
  defaultConfigs[module] = { ...current, ...updates };
  
  emit({
    module: 'atlas',
    event_type: 'capability.config_updated',
    outcome: 'succeeded',
    data: { module, updates: redactSecrets(updates) },
  });
}
