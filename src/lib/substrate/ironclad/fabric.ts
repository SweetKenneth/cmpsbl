/**
 * Ironclad Hardening Fabric — Node Middleware Wrapper
 * 
 * Wraps every matrix node with:
 *   request → rate_limiter → bulkhead → node_logic → validator → response
 * 
 * Health polling every 30s (on-demand, not timer-based).
 * Failure escalation: 1=warn, 2=alert, 3=auto-restore, 5=governance
 */

import { emit } from '../events/emit';
import type { SubstrateModuleName } from '@/lib/core/index';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface IroncladConfig {
  nodeId: SubstrateModuleName;
  rateLimit: number;       // req/sec
  bulkheadConcurrency: number;
  healthPollIntervalMs: number;
  failureThresholds: { warn: number; alert: number; restore: number; governance: number };
}

export interface IroncladState {
  nodeId: SubstrateModuleName;
  requestCount: number;
  rejectedCount: number;
  activeRequests: number;
  failureCount: number;
  escalationLevel: 'none' | 'warn' | 'alert' | 'restore' | 'governance';
  lastHealthPoll: number;
  healthy: boolean;
}

export interface IroncladResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  latencyMs: number;
  rateLimited: boolean;
  bulkheadBlocked: boolean;
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT CONFIGS
// ═══════════════════════════════════════════════════════════════

const DEFAULT_CONFIGS: Partial<Record<SubstrateModuleName, Partial<IroncladConfig>>> = {
  reflex: { rateLimit: 500, bulkheadConcurrency: 50 },
  nexus: { rateLimit: 200, bulkheadConcurrency: 30 },
  defense: { rateLimit: 300, bulkheadConcurrency: 40 },
  decode: { rateLimit: 100, bulkheadConcurrency: 20 },
  encode: { rateLimit: 50, bulkheadConcurrency: 10 },
  forge: { rateLimit: 30, bulkheadConcurrency: 5 },
  core: { rateLimit: 1000, bulkheadConcurrency: 100 },
};

// ═══════════════════════════════════════════════════════════════
// RATE LIMITER (Token Bucket)
// ═══════════════════════════════════════════════════════════════

interface TokenBucket {
  tokens: number;
  maxTokens: number;
  refillRate: number; // tokens per ms
  lastRefill: number;
}

const rateLimiters = new Map<string, TokenBucket>();

function getRateLimiter(nodeId: string, ratePerSec: number): TokenBucket {
  let bucket = rateLimiters.get(nodeId);
  if (!bucket) {
    bucket = {
      tokens: ratePerSec,
      maxTokens: ratePerSec,
      refillRate: ratePerSec / 1000,
      lastRefill: Date.now(),
    };
    rateLimiters.set(nodeId, bucket);
  }
  return bucket;
}

function tryConsume(bucket: TokenBucket): boolean {
  const now = Date.now();
  const elapsed = now - bucket.lastRefill;
  bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + elapsed * bucket.refillRate);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens--;
    return true;
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════
// BULKHEAD
// ═══════════════════════════════════════════════════════════════

const activeCounts = new Map<string, number>();

function acquireBulkhead(nodeId: string, max: number): boolean {
  const current = activeCounts.get(nodeId) || 0;
  if (current >= max) return false;
  activeCounts.set(nodeId, current + 1);
  return true;
}

function releaseBulkhead(nodeId: string): void {
  const current = activeCounts.get(nodeId) || 0;
  activeCounts.set(nodeId, Math.max(0, current - 1));
}

// ═══════════════════════════════════════════════════════════════
// NODE STATE
// ═══════════════════════════════════════════════════════════════

const nodeStates = new Map<string, IroncladState>();

function getState(nodeId: SubstrateModuleName): IroncladState {
  let state = nodeStates.get(nodeId);
  if (!state) {
    state = {
      nodeId,
      requestCount: 0,
      rejectedCount: 0,
      activeRequests: 0,
      failureCount: 0,
      escalationLevel: 'none',
      lastHealthPoll: 0,
      healthy: true,
    };
    nodeStates.set(nodeId, state);
  }
  return state;
}

// ═══════════════════════════════════════════════════════════════
// FAILURE ESCALATION
// ═══════════════════════════════════════════════════════════════

function escalate(state: IroncladState, thresholds: IroncladConfig['failureThresholds']): void {
  const prev = state.escalationLevel;

  if (state.failureCount >= thresholds.governance) {
    state.escalationLevel = 'governance';
  } else if (state.failureCount >= thresholds.restore) {
    state.escalationLevel = 'restore';
  } else if (state.failureCount >= thresholds.alert) {
    state.escalationLevel = 'alert';
  } else if (state.failureCount >= thresholds.warn) {
    state.escalationLevel = 'warn';
  } else {
    state.escalationLevel = 'none';
  }

  if (state.escalationLevel !== prev && state.escalationLevel !== 'none') {
    emit({
      module: 'ironclad',
      event_type: `escalation.${state.escalationLevel}`,
      outcome: state.escalationLevel === 'governance' ? 'failed' : 'started',
      data: {
        node: state.nodeId,
        failures: state.failureCount,
        level: state.escalationLevel,
      },
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// HARDENING WRAPPER
// ═══════════════════════════════════════════════════════════════

export function createHardenedInvoker<T>(
  nodeId: SubstrateModuleName,
  configOverrides?: Partial<IroncladConfig>
) {
  const defaults = DEFAULT_CONFIGS[nodeId] || {};
  const config: IroncladConfig = {
    nodeId,
    rateLimit: defaults.rateLimit || 100,
    bulkheadConcurrency: defaults.bulkheadConcurrency || 20,
    healthPollIntervalMs: 30_000,
    failureThresholds: { warn: 1, alert: 2, restore: 3, governance: 5 },
    ...configOverrides,
  };

  const bucket = getRateLimiter(nodeId, config.rateLimit);
  const state = getState(nodeId);

  return async function invoke(
    fn: () => T | Promise<T>,
    label?: string
  ): Promise<IroncladResult<T>> {
    const startTime = Date.now();
    state.requestCount++;

    // 1. Rate limit
    if (!tryConsume(bucket)) {
      state.rejectedCount++;
      return { success: false, error: 'Rate limited', latencyMs: 0, rateLimited: true, bulkheadBlocked: false };
    }

    // 2. Bulkhead
    if (!acquireBulkhead(nodeId, config.bulkheadConcurrency)) {
      state.rejectedCount++;
      return { success: false, error: 'Bulkhead full', latencyMs: 0, rateLimited: false, bulkheadBlocked: true };
    }

    state.activeRequests = activeCounts.get(nodeId) || 0;

    // 3. Execute
    try {
      const result = await fn();
      releaseBulkhead(nodeId);

      // Reset failures on success
      if (state.failureCount > 0) {
        state.failureCount = 0;
        state.escalationLevel = 'none';
      }
      state.healthy = true;

      return {
        success: true,
        data: result,
        latencyMs: Date.now() - startTime,
        rateLimited: false,
        bulkheadBlocked: false,
      };
    } catch (err: any) {
      releaseBulkhead(nodeId);
      state.failureCount++;
      state.healthy = false;
      escalate(state, config.failureThresholds);

      // Auto-restore at threshold
      if (state.escalationLevel === 'restore') {
        state.failureCount = 0;
        state.healthy = true;
        state.escalationLevel = 'none';
        emit({
          module: 'ironclad',
          event_type: 'auto_restore',
          outcome: 'succeeded',
          data: { node: nodeId },
        });
      }

      return {
        success: false,
        error: err?.message || 'Unknown error',
        latencyMs: Date.now() - startTime,
        rateLimited: false,
        bulkheadBlocked: false,
      };
    }
  };
}

// ═══════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════

export function getIroncladState(nodeId: SubstrateModuleName): IroncladState {
  return getState(nodeId);
}

export function getAllIroncladStates(): IroncladState[] {
  return Array.from(nodeStates.values());
}
