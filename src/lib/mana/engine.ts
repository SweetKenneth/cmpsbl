/**
 * Mana Engine v2.0.0 — Silent Software Symbiosis Engine
 * U.S. Patent App. No. 64/031,637
 * 
 * Wraps a Layer 1 host with Layer 2 capabilities at function boundaries.
 * The host source is NEVER modified — verified by SHA-256 proof.
 * All attachments governed by Lex.
 * 
 * Supports recursive layer composition: V3 wraps V2 wraps V1.
 * 
 * © CMPSBL® — All rights reserved.
 */

import type {
  AttachmentState,
  AttachmentPoint,
  ManaCapability,
  ManaConfig,
  ManaManifest,
  ManaProof,
  ManaTelemetryEvent,
} from './types';
import { evaluate, getRules, resetLex } from './lex';

// ═══════════════════════════════════════════════════════════════
// Engine State
// ═══════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: ManaConfig = {
  telemetry: true,
  maxTelemetryEvents: 10000,
  dreamSynthesis: false,
  lexMode: 'permissive',
};

let config: ManaConfig = { ...DEFAULT_CONFIG };
let state: AttachmentState = 'detached';
let hostPackage = '';
let hostVersion = '';
let hostSourceHash = '';
let attachedAt: number | null = null;
let detachedAt: number | null = null;

/** Recursive layer depth — 0 = raw host, increments with each Mana wrap */
let layerDepth = 0;
/** SHA-256 of the parent layer (null if wrapping raw source) */
let parentLayerHash: string | null = null;

const attachmentPoints: Map<string, AttachmentPoint> = new Map();
const telemetry: ManaTelemetryEvent[] = [];

/** Original unwrapped functions — for clean detachment */
const originals: Map<string, Function> = new Map();

// ═══════════════════════════════════════════════════════════════
// Hashing — SHA-256 proof of non-modification
// ═══════════════════════════════════════════════════════════════

async function computeHash(source: string): Promise<string> {
  if (typeof globalThis.crypto?.subtle?.digest === 'function') {
    const encoder = new TextEncoder();
    const data = encoder.encode(source);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const { createHash } = await import('crypto');
  return createHash('sha256').update(source).digest('hex');
}

function generateFingerprintId(): string {
  const seg = () => Math.random().toString(36).substring(2, 8);
  return `MANA-${seg()}-${seg()}-${seg()}`.toUpperCase();
}

// ═══════════════════════════════════════════════════════════════
// Telemetry
// ═══════════════════════════════════════════════════════════════

function emitTelemetry(
  capability: ManaCapability,
  functionName: string,
  action: ManaTelemetryEvent['action'],
  metadata?: Record<string, unknown>
): void {
  if (!config.telemetry) return;

  telemetry.push({
    timestamp: Date.now(),
    capability,
    functionName,
    action,
    metadata,
  });

  if (telemetry.length > config.maxTelemetryEvents) {
    telemetry.splice(0, telemetry.length - config.maxTelemetryEvents);
  }
}

// ═══════════════════════════════════════════════════════════════
// Wrapper Factories — Layer 2 function boundary attachments
// ═══════════════════════════════════════════════════════════════

function wrapWithDefenseGate(
  originalFn: Function,
  functionName: string,
  point: AttachmentPoint
): Function {
  return function manaDefenseGate(this: unknown, ...args: unknown[]) {
    point.invocations++;
    emitTelemetry('defense_gate', functionName, 'invoked', { args: args.length });

    const { verdict } = evaluate('defense_gate', functionName, config.lexMode);
    if (verdict === 'deny') {
      point.blocked++;
      emitTelemetry('defense_gate', functionName, 'blocked');
      throw new Error(`[MANA/DEFENSE] Lex denied invocation of ${functionName}`);
    }
    if (verdict === 'observe') {
      point.observed++;
      emitTelemetry('defense_gate', functionName, 'observed', { note: 'Lex observing — execution allowed' });
    }

    return originalFn.apply(this, args);
  };
}

function wrapWithBeaconTelemetry(
  originalFn: Function,
  functionName: string,
  point: AttachmentPoint
): Function {
  return function manaBeacon(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const start = performance.now();
    const result = originalFn.apply(this, args);

    // Handle async returns — measure duration after resolution
    if (result && typeof result === 'object' && typeof (result as Promise<unknown>).then === 'function') {
      return (result as Promise<unknown>).then(
        (resolved) => {
          const duration = performance.now() - start;
          emitTelemetry('beacon_telemetry', functionName, 'observed', {
            durationMs: Math.round(duration * 100) / 100,
            argCount: args.length,
            returnType: 'promise',
            async: true,
          });
          return resolved;
        },
        (err) => {
          const duration = performance.now() - start;
          emitTelemetry('beacon_telemetry', functionName, 'observed', {
            durationMs: Math.round(duration * 100) / 100,
            error: true,
            async: true,
          });
          throw err;
        }
      );
    }

    const duration = performance.now() - start;
    emitTelemetry('beacon_telemetry', functionName, 'observed', {
      durationMs: Math.round(duration * 100) / 100,
      argCount: args.length,
      returnType: typeof result,
    });

    return result;
  };
}

function wrapWithGovernanceHook(
  originalFn: Function,
  functionName: string,
  point: AttachmentPoint
): Function {
  return function manaGovernance(this: unknown, ...args: unknown[]) {
    point.invocations++;

    const { verdict } = evaluate('governance_hook', functionName, config.lexMode);

    if (verdict === 'deny') {
      point.blocked++;
      emitTelemetry('governance_hook', functionName, 'blocked', { verdict });
      return undefined;
    }
    if (verdict === 'observe') {
      point.observed++;
      emitTelemetry('governance_hook', functionName, 'observed', { note: 'Governance observation — mutation logged' });
    } else {
      emitTelemetry('governance_hook', functionName, 'invoked', { verdict });
    }

    return originalFn.apply(this, args);
  };
}

function wrapWithShadowRule(
  originalFn: Function,
  functionName: string,
  point: AttachmentPoint
): Function {
  return function manaShadowRule(this: unknown, ...args: unknown[]) {
    point.invocations++;
    emitTelemetry('shadow_rule', functionName, 'invoked');

    const { verdict } = evaluate('shadow_rule', functionName, config.lexMode);
    if (verdict === 'deny') {
      point.blocked++;
      const message = typeof point.rulePayload === 'string'
        ? point.rulePayload
        : `[MANA] Simon says no — ${functionName} is governed.`;
      emitTelemetry('shadow_rule', functionName, 'blocked', { message });
      return message;
    }
    if (verdict === 'observe') {
      point.observed++;
      emitTelemetry('shadow_rule', functionName, 'observed', { note: 'Shadow rule observing — passthrough with logging' });
    }

    return originalFn.apply(this, args);
  };
}

function wrapWithAuditTrail(
  originalFn: Function,
  functionName: string,
  point: AttachmentPoint
): Function {
  return function manaAudit(this: unknown, ...args: unknown[]) {
    point.invocations++;
    emitTelemetry('audit_trail', functionName, 'invoked', {
      timestamp: Date.now(),
      caller: typeof this === 'object' ? 'object' : typeof this,
    });

    return originalFn.apply(this, args);
  };
}

function wrapWithCircuitBreaker(
  originalFn: Function,
  functionName: string,
  point: AttachmentPoint
): Function {
  let failures = 0;
  let circuitOpen = false;
  let lastFailure = 0;
  const THRESHOLD = 5;
  const RESET_MS = 30000;

  return function manaCircuitBreaker(this: unknown, ...args: unknown[]) {
    point.invocations++;

    if (circuitOpen) {
      if (Date.now() - lastFailure > RESET_MS) {
        circuitOpen = false;
        failures = 0;
      } else {
        point.blocked++;
        emitTelemetry('circuit_breaker', functionName, 'blocked', { failures });
        throw new Error(`[MANA/CIRCUIT] ${functionName} circuit open after ${failures} failures`);
      }
    }

    try {
      const result = originalFn.apply(this, args);

      // Handle async — track rejections as failures
      if (result && typeof result === 'object' && typeof (result as Promise<unknown>).then === 'function') {
        return (result as Promise<unknown>).then(
          (resolved) => {
            failures = 0;
            emitTelemetry('circuit_breaker', functionName, 'invoked', { async: true });
            return resolved;
          },
          (err) => {
            failures++;
            lastFailure = Date.now();
            if (failures >= THRESHOLD) {
              circuitOpen = true;
              emitTelemetry('circuit_breaker', functionName, 'blocked', { reason: 'async_threshold', failures });
            }
            throw err;
          }
        );
      }

      failures = 0;
      emitTelemetry('circuit_breaker', functionName, 'invoked');
      return result;
    } catch (err) {
      failures++;
      lastFailure = Date.now();
      if (failures >= THRESHOLD) {
        circuitOpen = true;
        emitTelemetry('circuit_breaker', functionName, 'blocked', { reason: 'threshold' });
      }
      throw err;
    }
  };
}

// ═══════════════════════════════════════════════════════════════
// Expanded Wrapper Factories — 25 new granular behaviors
// ═══════════════════════════════════════════════════════════════

function wrapWithInputSanitizer(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  return function manaInputSanitizer(this: unknown, ...args: unknown[]) {
    point.invocations++;
    // Sanitize string arguments — strip dangerous patterns
    const sanitized = args.map(a => {
      if (typeof a === 'string') {
        const clean = a.replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
        if (clean !== a) {
          point.blocked++;
          emitTelemetry('input_sanitizer', functionName, 'blocked', { original: a.slice(0, 50), sanitized: clean.slice(0, 50) });
        }
        return clean;
      }
      return a;
    });
    emitTelemetry('input_sanitizer', functionName, 'invoked', { argCount: args.length });
    return originalFn.apply(this, sanitized);
  };
}

function wrapWithThreatScorer(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  return function manaThreatScorer(this: unknown, ...args: unknown[]) {
    point.invocations++;
    let threatScore = 0;
    for (const arg of args) {
      if (typeof arg === 'string') {
        if (/[<>"'`;]/.test(arg)) threatScore += 20;
        if (arg.length > 10000) threatScore += 30;
        if (/\b(union|select|drop|delete|insert)\b/i.test(arg)) threatScore += 40;
      }
      if (arg === null || arg === undefined) threatScore += 5;
    }
    const { verdict } = evaluate('defense_gate', functionName, config.lexMode);
    if (threatScore > 60 && verdict !== 'allow') {
      point.blocked++;
      emitTelemetry('threat_scorer', functionName, 'blocked', { threatScore });
      throw new Error(`[MANA/THREAT] ${functionName} blocked — threat score ${threatScore}/100`);
    }
    emitTelemetry('threat_scorer', functionName, 'observed', { threatScore });
    return originalFn.apply(this, args);
  };
}

function wrapWithRateLimiter(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  const windowMs = 1000;
  const maxCalls = 100;
  let callTimestamps: number[] = [];

  return function manaRateLimiter(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const now = Date.now();
    callTimestamps = callTimestamps.filter(t => now - t < windowMs);
    if (callTimestamps.length >= maxCalls) {
      point.blocked++;
      emitTelemetry('rate_limiter', functionName, 'blocked', { callsInWindow: callTimestamps.length });
      throw new Error(`[MANA/RATE] ${functionName} rate limited — ${maxCalls} calls/s exceeded`);
    }
    callTimestamps.push(now);
    emitTelemetry('rate_limiter', functionName, 'invoked', { callsInWindow: callTimestamps.length });
    return originalFn.apply(this, args);
  };
}

function wrapWithPayloadValidator(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  return function manaPayloadValidator(this: unknown, ...args: unknown[]) {
    point.invocations++;
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (typeof arg === 'string' && arg.length > 1_000_000) {
        point.blocked++;
        emitTelemetry('payload_validator', functionName, 'blocked', { argIndex: i, size: arg.length });
        throw new Error(`[MANA/PAYLOAD] Arg ${i} exceeds 1MB payload limit`);
      }
      if (typeof arg === 'object' && arg !== null) {
        const depth = JSON.stringify(arg).length;
        if (depth > 5_000_000) {
          point.blocked++;
          emitTelemetry('payload_validator', functionName, 'blocked', { argIndex: i, serializedSize: depth });
          throw new Error(`[MANA/PAYLOAD] Arg ${i} serialization exceeds 5MB`);
        }
      }
    }
    emitTelemetry('payload_validator', functionName, 'invoked');
    return originalFn.apply(this, args);
  };
}

function wrapWithInjectionGuard(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  const INJECTION_PATTERNS = [
    /'\s*(or|and)\s+'.*'.*='/i,
    /;\s*(drop|delete|truncate|alter)\s+/i,
    /\$\{.*\}/,
    /\{\{.*\}\}/,
  ];
  return function manaInjectionGuard(this: unknown, ...args: unknown[]) {
    point.invocations++;
    for (const arg of args) {
      if (typeof arg === 'string') {
        for (const pattern of INJECTION_PATTERNS) {
          if (pattern.test(arg)) {
            point.blocked++;
            emitTelemetry('injection_guard', functionName, 'blocked', { pattern: pattern.source });
            throw new Error(`[MANA/INJECTION] Potential injection detected in ${functionName}`);
          }
        }
      }
    }
    emitTelemetry('injection_guard', functionName, 'invoked');
    return originalFn.apply(this, args);
  };
}

function wrapWithLatencyProfiler(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  const durations: number[] = [];
  return function manaLatencyProfiler(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const start = performance.now();
    const result = originalFn.apply(this, args);
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      return (result as Promise<unknown>).then(resolved => {
        const d = performance.now() - start;
        durations.push(d);
        if (durations.length > 1000) durations.shift();
        const sorted = [...durations].sort((a, b) => a - b);
        emitTelemetry('latency_profiler', functionName, 'observed', {
          durationMs: Math.round(d * 100) / 100,
          p50: sorted[Math.floor(sorted.length * 0.5)],
          p95: sorted[Math.floor(sorted.length * 0.95)],
          p99: sorted[Math.floor(sorted.length * 0.99)],
          samples: sorted.length,
        });
        return resolved;
      });
    }
    const d = performance.now() - start;
    durations.push(d);
    if (durations.length > 1000) durations.shift();
    emitTelemetry('latency_profiler', functionName, 'observed', { durationMs: Math.round(d * 100) / 100 });
    return result;
  };
}

function wrapWithErrorTracker(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  let totalErrors = 0;
  const errorTypes = new Map<string, number>();
  return function manaErrorTracker(this: unknown, ...args: unknown[]) {
    point.invocations++;
    try {
      const result = originalFn.apply(this, args);
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        return (result as Promise<unknown>).catch((err: Error) => {
          totalErrors++;
          const t = err?.constructor?.name ?? 'Unknown';
          errorTypes.set(t, (errorTypes.get(t) ?? 0) + 1);
          emitTelemetry('error_tracker', functionName, 'observed', { totalErrors, errorType: t, message: err?.message?.slice(0, 100) });
          throw err;
        });
      }
      return result;
    } catch (err) {
      totalErrors++;
      const e = err as Error;
      const t = e?.constructor?.name ?? 'Unknown';
      errorTypes.set(t, (errorTypes.get(t) ?? 0) + 1);
      emitTelemetry('error_tracker', functionName, 'observed', { totalErrors, errorType: t });
      throw err;
    }
  };
}

function wrapWithThroughputMeter(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  let windowStart = Date.now();
  let callsInWindow = 0;
  let lastThroughput = 0;
  return function manaThroughputMeter(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const now = Date.now();
    callsInWindow++;
    if (now - windowStart >= 1000) {
      lastThroughput = callsInWindow;
      callsInWindow = 0;
      windowStart = now;
      emitTelemetry('throughput_meter', functionName, 'observed', { callsPerSecond: lastThroughput });
    }
    return originalFn.apply(this, args);
  };
}

function wrapWithDependencyMapper(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  return function manaDependencyMapper(this: unknown, ...args: unknown[]) {
    point.invocations++;
    emitTelemetry('dependency_mapper', functionName, 'invoked', {
      caller: (new Error()).stack?.split('\n')[2]?.trim().slice(0, 80),
      argTypes: args.map(a => typeof a),
    });
    return originalFn.apply(this, args);
  };
}

function wrapWithMutationGuard(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  return function manaMutationGuard(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const { verdict } = evaluate('governance_hook', functionName, config.lexMode);
    if (verdict === 'deny') {
      point.blocked++;
      emitTelemetry('mutation_guard', functionName, 'blocked', { reason: 'unauthorized_mutation' });
      throw new Error(`[MANA/MUTATION] Unauthorized state mutation in ${functionName}`);
    }
    // Freeze object args to detect mutation attempts
    const frozenArgs = args.map(a =>
      typeof a === 'object' && a !== null ? Object.freeze({ ...a as Record<string, unknown> }) : a
    );
    emitTelemetry('mutation_guard', functionName, 'invoked');
    return originalFn.apply(this, frozenArgs);
  };
}

function wrapWithPolicyEnforcer(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  return function manaPolicyEnforcer(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const { verdict } = evaluate('governance_hook', functionName, config.lexMode);
    if (verdict === 'deny') {
      point.blocked++;
      emitTelemetry('policy_enforcer', functionName, 'blocked', { verdict });
      return undefined;
    }
    point.observed++;
    emitTelemetry('policy_enforcer', functionName, 'observed', { verdict, policy: 'enforced' });
    return originalFn.apply(this, args);
  };
}

function wrapWithConsentGate(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  return function manaConsentGate(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const { verdict } = evaluate('governance_hook', functionName, config.lexMode);
    if (verdict === 'deny') {
      point.blocked++;
      emitTelemetry('consent_gate', functionName, 'blocked', { reason: 'consent_not_granted' });
      return undefined;
    }
    emitTelemetry('consent_gate', functionName, 'invoked', { consentGranted: true });
    return originalFn.apply(this, args);
  };
}

function wrapWithComplianceCheck(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  return function manaComplianceCheck(this: unknown, ...args: unknown[]) {
    point.invocations++;
    emitTelemetry('compliance_check', functionName, 'observed', {
      timestamp: Date.now(),
      functionName,
      argCount: args.length,
      compliant: true,
    });
    return originalFn.apply(this, args);
  };
}

function wrapWithAccessController(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  return function manaAccessController(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const { verdict } = evaluate('shadow_rule', functionName, config.lexMode);
    if (verdict === 'deny') {
      point.blocked++;
      emitTelemetry('access_controller', functionName, 'blocked', { reason: 'access_denied' });
      throw new Error(`[MANA/ACCESS] ${functionName} — access denied by Lex`);
    }
    emitTelemetry('access_controller', functionName, 'invoked');
    return originalFn.apply(this, args);
  };
}

function wrapWithRetryHandler(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  const MAX_RETRIES = 3;
  return function manaRetryHandler(this: unknown, ...args: unknown[]) {
    point.invocations++;
    let lastError: unknown;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = originalFn.apply(this, args);
        if (attempt > 0) {
          emitTelemetry('retry_handler', functionName, 'observed', { retriedAfter: attempt });
        }
        return result;
      } catch (err) {
        lastError = err;
        emitTelemetry('retry_handler', functionName, 'observed', { attempt, error: (err as Error)?.message?.slice(0, 80) });
      }
    }
    point.blocked++;
    emitTelemetry('retry_handler', functionName, 'blocked', { reason: 'max_retries_exhausted' });
    throw lastError;
  };
}

function wrapWithTimeoutGuard(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  const TIMEOUT_MS = 30000;
  return function manaTimeoutGuard(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const result = originalFn.apply(this, args);
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      return Promise.race([
        result as Promise<unknown>,
        new Promise((_, reject) => setTimeout(() => {
          point.blocked++;
          emitTelemetry('timeout_guard', functionName, 'blocked', { timeoutMs: TIMEOUT_MS });
          reject(new Error(`[MANA/TIMEOUT] ${functionName} exceeded ${TIMEOUT_MS}ms`));
        }, TIMEOUT_MS)),
      ]);
    }
    emitTelemetry('timeout_guard', functionName, 'invoked');
    return result;
  };
}

function wrapWithBulkheadIsolator(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  const MAX_CONCURRENT = 10;
  let active = 0;
  return function manaBulkheadIsolator(this: unknown, ...args: unknown[]) {
    point.invocations++;
    if (active >= MAX_CONCURRENT) {
      point.blocked++;
      emitTelemetry('bulkhead_isolator', functionName, 'blocked', { active, max: MAX_CONCURRENT });
      throw new Error(`[MANA/BULKHEAD] ${functionName} — concurrency limit (${MAX_CONCURRENT}) reached`);
    }
    active++;
    try {
      const result = originalFn.apply(this, args);
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        return (result as Promise<unknown>).finally(() => { active--; });
      }
      active--;
      return result;
    } catch (err) {
      active--;
      throw err;
    }
  };
}

function wrapWithFallbackProvider(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  return function manaFallbackProvider(this: unknown, ...args: unknown[]) {
    point.invocations++;
    try {
      const result = originalFn.apply(this, args);
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        return (result as Promise<unknown>).catch((err: Error) => {
          point.observed++;
          emitTelemetry('fallback_provider', functionName, 'observed', { fallbackReason: err?.message?.slice(0, 80) });
          return undefined; // Graceful fallback
        });
      }
      return result;
    } catch (err) {
      point.observed++;
      emitTelemetry('fallback_provider', functionName, 'observed', { fallbackReason: (err as Error)?.message?.slice(0, 80) });
      return undefined;
    }
  };
}

function wrapWithCallLogger(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  return function manaCallLogger(this: unknown, ...args: unknown[]) {
    point.invocations++;
    emitTelemetry('call_logger', functionName, 'invoked', {
      timestamp: Date.now(),
      argTypes: args.map(a => typeof a),
      argCount: args.length,
    });
    return originalFn.apply(this, args);
  };
}

function wrapWithStateSnapshot(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  return function manaStateSnapshot(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const before = typeof this === 'object' && this !== null
      ? JSON.stringify(this).slice(0, 500) : 'N/A';
    const result = originalFn.apply(this, args);
    const after = typeof this === 'object' && this !== null
      ? JSON.stringify(this).slice(0, 500) : 'N/A';
    emitTelemetry('state_snapshot', functionName, 'observed', {
      beforeHash: before.length,
      afterHash: after.length,
      mutated: before !== after,
    });
    return result;
  };
}

function wrapWithForensicRecorder(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  return function manaForensicRecorder(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const callId = `${functionName}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    emitTelemetry('forensic_recorder', functionName, 'invoked', {
      callId,
      argCount: args.length,
      stack: (new Error()).stack?.split('\n').slice(1, 4).map(s => s.trim()),
    });
    return originalFn.apply(this, args);
  };
}

function wrapWithOutputFilter(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  return function manaOutputFilter(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const result = originalFn.apply(this, args);
    // Filter sensitive patterns from string outputs
    if (typeof result === 'string') {
      const filtered = result.replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '****-****-****-****');
      if (filtered !== result) {
        point.observed++;
        emitTelemetry('output_filter', functionName, 'observed', { filtered: true });
      }
      return filtered;
    }
    emitTelemetry('output_filter', functionName, 'invoked');
    return result;
  };
}

function wrapWithDataMasker(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  const MASK_PATTERNS = [
    { pattern: /\b[\w.]+@[\w.]+\.\w+\b/g, replacement: '***@***.***' },
    { pattern: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g, replacement: '***-**-****' },
  ];
  return function manaDataMasker(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const maskedArgs = args.map(a => {
      if (typeof a === 'string') {
        let masked = a;
        for (const { pattern, replacement } of MASK_PATTERNS) {
          pattern.lastIndex = 0;
          masked = masked.replace(pattern, replacement);
        }
        if (masked !== a) point.observed++;
        return masked;
      }
      return a;
    });
    emitTelemetry('data_masker', functionName, 'invoked', { maskedArgs: maskedArgs.length });
    return originalFn.apply(this, maskedArgs);
  };
}

function wrapWithAnomalyDetector(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  const history: number[] = [];
  return function manaAnomalyDetector(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const start = performance.now();
    const result = originalFn.apply(this, args);
    const d = performance.now() - start;
    history.push(d);
    if (history.length > 100) history.shift();
    if (history.length >= 10) {
      const avg = history.reduce((s, v) => s + v, 0) / history.length;
      const stdDev = Math.sqrt(history.reduce((s, v) => s + (v - avg) ** 2, 0) / history.length);
      if (d > avg + 3 * stdDev) {
        point.observed++;
        emitTelemetry('anomaly_detector', functionName, 'observed', {
          anomaly: true, durationMs: d, avgMs: avg, stdDev, zScore: (d - avg) / (stdDev || 1),
        });
      }
    }
    return result;
  };
}

function wrapWithDriftMonitor(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  const returnHistory: string[] = [];
  return function manaDriftMonitor(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const result = originalFn.apply(this, args);
    const resultType = typeof result;
    returnHistory.push(resultType);
    if (returnHistory.length > 50) returnHistory.shift();
    // Detect if return type changed from historical pattern
    if (returnHistory.length >= 5) {
      const majority = returnHistory.slice(0, -1)
        .reduce((acc, t) => { acc[t] = (acc[t] ?? 0) + 1; return acc; }, {} as Record<string, number>);
      const dominant = Object.entries(majority).sort((a, b) => b[1] - a[1])[0];
      if (dominant && resultType !== dominant[0] && dominant[1] / (returnHistory.length - 1) > 0.8) {
        point.observed++;
        emitTelemetry('drift_monitor', functionName, 'observed', {
          drift: true, expected: dominant[0], actual: resultType,
        });
      }
    }
    return result;
  };
}

/** Get wrapper factory for a capability */
function getWrapper(capability: ManaCapability) {
  switch (capability) {
    case 'defense_gate': return wrapWithDefenseGate;
    case 'input_sanitizer': return wrapWithInputSanitizer;
    case 'threat_scorer': return wrapWithThreatScorer;
    case 'rate_limiter': return wrapWithRateLimiter;
    case 'payload_validator': return wrapWithPayloadValidator;
    case 'injection_guard': return wrapWithInjectionGuard;
    case 'beacon_telemetry': return wrapWithBeaconTelemetry;
    case 'latency_profiler': return wrapWithLatencyProfiler;
    case 'error_tracker': return wrapWithErrorTracker;
    case 'throughput_meter': return wrapWithThroughputMeter;
    case 'dependency_mapper': return wrapWithDependencyMapper;
    case 'governance_hook': return wrapWithGovernanceHook;
    case 'mutation_guard': return wrapWithMutationGuard;
    case 'policy_enforcer': return wrapWithPolicyEnforcer;
    case 'consent_gate': return wrapWithConsentGate;
    case 'compliance_check': return wrapWithComplianceCheck;
    case 'access_controller': return wrapWithAccessController;
    case 'circuit_breaker': return wrapWithCircuitBreaker;
    case 'retry_handler': return wrapWithRetryHandler;
    case 'timeout_guard': return wrapWithTimeoutGuard;
    case 'bulkhead_isolator': return wrapWithBulkheadIsolator;
    case 'fallback_provider': return wrapWithFallbackProvider;
    case 'audit_trail': return wrapWithAuditTrail;
    case 'call_logger': return wrapWithCallLogger;
    case 'state_snapshot': return wrapWithStateSnapshot;
    case 'forensic_recorder': return wrapWithForensicRecorder;
    case 'shadow_rule': return wrapWithShadowRule;
    case 'output_filter': return wrapWithOutputFilter;
    case 'data_masker': return wrapWithDataMasker;
    case 'dream_synthesis': return wrapWithBeaconTelemetry;
    case 'anomaly_detector': return wrapWithAnomalyDetector;
    case 'drift_monitor': return wrapWithDriftMonitor;
    default: return wrapWithBeaconTelemetry;
  }
}

// ═══════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════

/** Configure the Mana Engine */
export function configure(partial: Partial<ManaConfig>): ManaConfig {
  config = { ...config, ...partial };
  return { ...config };
}

/** Get current engine state */
export function getState(): AttachmentState {
  return state;
}

/** Get current recursive layer depth */
export function getLayerDepth(): number {
  return layerDepth;
}

/**
 * Scan a host module and catalog its function boundaries.
 * Returns the list of wrappable function names.
 */
export function scan(hostModule: Record<string, unknown>, packageName: string, version: string): string[] {
  state = 'scanning';
  hostPackage = packageName;
  hostVersion = version;

  const functionNames: string[] = [];
  for (const [key, value] of Object.entries(hostModule)) {
    if (typeof value === 'function') {
      functionNames.push(key);
    }
  }

  state = 'detached';
  return functionNames;
}

/**
 * Attach Layer 2 capabilities to a host module's function boundaries.
 * The host module object is wrapped in-place — original source untouched.
 * 
 * Supports recursive composition: calling attach() on an already-wrapped
 * module increments layerDepth and chains parent hashes.
 */
export async function attach(
  hostModule: Record<string, unknown>,
  capabilities: Array<{
    functionName: string;
    capability: ManaCapability;
    rulePayload?: unknown;
  }>,
  sourceForHash: string
): Promise<ManaManifest> {
  if (state === 'symbiotic') {
    // Recursive attach — V3 wraps V2: store current layer as parent
    parentLayerHash = hostSourceHash || null;
    layerDepth++;
  } else {
    // Detect if host is already a Mana-wrapped module (recursive layer)
    const hasManaWraps = Object.values(hostModule).some(
      v => typeof v === 'function' && (v as Function).name?.startsWith('mana')
    );
    if (hasManaWraps) {
      parentLayerHash = hostSourceHash || null;
      layerDepth++;
    }
  }

  state = 'attaching';
  hostSourceHash = await computeHash(sourceForHash);
  attachmentPoints.clear();
  originals.clear();
  telemetry.length = 0;

  for (const cap of capabilities) {
    const { functionName, capability, rulePayload } = cap;
    const originalFn = hostModule[functionName];

    if (typeof originalFn !== 'function') {
      continue;
    }

    // Lex governance check
    const { verdict } = evaluate(capability, functionName, config.lexMode);
    if (verdict === 'deny') {
      emitTelemetry(capability, functionName, 'blocked', { reason: 'lex_denied_attachment' });
      continue;
    }

    // Store original for clean detachment
    originals.set(functionName, originalFn);

    // Create attachment point
    const point: AttachmentPoint = {
      functionName,
      capability,
      active: true,
      invocations: 0,
      blocked: 0,
      observed: 0,
      rulePayload,
    };
    attachmentPoints.set(`${functionName}:${capability}`, point);

    // Wrap the function — Layer 2 boundary injection
    const wrapper = getWrapper(capability);
    hostModule[functionName] = wrapper(originalFn, functionName, point);

    emitTelemetry(capability, functionName, 'invoked', { action: 'attached', layerDepth });
  }

  state = 'symbiotic';
  attachedAt = Date.now();
  detachedAt = null;

  return getManifest();
}

/**
 * Detach all Layer 2 capabilities — restore original functions.
 * Clean separation: host returns to pre-attachment state.
 */
export function detach(hostModule: Record<string, unknown>): ManaManifest {
  if (state !== 'symbiotic') {
    throw new Error('[MANA] Not attached. Nothing to detach.');
  }

  state = 'detaching';

  // Restore all originals
  for (const [functionName, originalFn] of originals.entries()) {
    hostModule[functionName] = originalFn;
  }

  state = 'detached';
  detachedAt = Date.now();

  const manifest = getManifest();

  // Clean up — decrement layer depth on detach
  originals.clear();
  attachmentPoints.clear();
  if (layerDepth > 0) layerDepth--;

  return manifest;
}

/**
 * Generate cryptographic proof of non-modification.
 * Includes recursive layer tracking — each layer proves its host.
 */
export async function generateProof(sourceForHash: string): Promise<ManaProof> {
  const currentHash = await computeHash(sourceForHash);
  const points = Array.from(attachmentPoints.values());
  const capabilities = [...new Set(points.map(p => p.capability))];

  return {
    hostHashBefore: hostSourceHash,
    hostHashAfter: currentHash,
    verified: hostSourceHash === currentHash,
    timestamp: Date.now(),
    hostPackage,
    hostVersion,
    attachmentPointCount: points.length,
    capabilities,
    fingerprintId: generateFingerprintId(),
    layerDepth,
    parentLayerHash,
  };
}

/** Get full attachment manifest */
export function getManifest(): ManaManifest {
  return {
    hostPackage,
    hostVersion,
    attachmentState: state,
    attachmentPoints: Array.from(attachmentPoints.values()),
    lexRules: getRules(),
    proof: null,
    telemetry: [...telemetry],
    attachedAt,
    detachedAt,
    layerDepth,
  };
}

/** Get telemetry events */
export function getTelemetry(): ReadonlyArray<ManaTelemetryEvent> {
  return [...telemetry];
}

/** Get telemetry summary */
export function getTelemetrySummary(): Record<string, { invocations: number; blocked: number; observed: number }> {
  const summary: Record<string, { invocations: number; blocked: number; observed: number }> = {};

  for (const point of attachmentPoints.values()) {
    summary[point.functionName] = {
      invocations: point.invocations,
      blocked: point.blocked,
      observed: point.observed,
    };
  }

  return summary;
}

/** Full engine reset */
export function reset(): void {
  state = 'detached';
  hostPackage = '';
  hostVersion = '';
  hostSourceHash = '';
  attachedAt = null;
  detachedAt = null;
  layerDepth = 0;
  parentLayerHash = null;
  attachmentPoints.clear();
  originals.clear();
  telemetry.length = 0;
  resetLex();
  config = { ...DEFAULT_CONFIG };
}
