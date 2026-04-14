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
  ManaCapabilityOrWildcard,
  ManaConfig,
  ManaManifest,
  ManaProof,
  ManaTelemetryEvent,
  LexEvalContext,
  AnyFn,
  CapabilityContract,
} from './types';
import {
  CAPABILITY_PHASE, CAPABILITY_CONTRACTS, CONTRACT_MAP, WrapperPhase,
  MANA_LAYER_TAG, assertContractMapComplete, normalizePriority,
} from './types';
import { evaluate, getRules, resetLex } from './lex';
import {
  verifyFingerprint,
  registerCandidateBaseline,
  computeCanonicalFingerprint,
  checkIdentity,
  type FingerprintResult,
  type FingerprintVerdict,
  type TrustState,
} from '../../core/boot/fingerprintGate';
import { recordAuditEvent } from '../../core/audit/auditChain';
import {
  safeDetach,
  enterExecutionBoundary,
  exitExecutionBoundary,
  resetSafeDetach,
} from './detach-safe';

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
const originals: Map<string, AnyFn> = new Map();

/** Debug trace log — populated when trace mode is on */
let traceLog: string[] = [];
let traceEnabled = false;

/** Last generated proof — integrated into manifest */
let lastProof: ManaProof | null = null;

// ═══════════════════════════════════════════════════════════════
// Primitives — Type-Safe Helpers
// ═══════════════════════════════════════════════════════════════

/** Type-narrowing promise check — replaces all manual .then typeof checks */
function isThenable(val: unknown): val is Promise<unknown> {
  return val != null && typeof val === 'object' && typeof (val as Promise<unknown>).then === 'function';
}

/** Backoff delay for retry logic */
function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Normalize sync/async execution for wrappers.
 * Guarantees: sync → handled inline; thenable → preserves exact async semantics;
 * rejection → onError still fires; never silently converts async to sync.
 */
function withAsyncSafety(
  result: unknown,
  onSync: (value: unknown) => void,
  onError: (err: unknown) => void,
): unknown {
  if (isThenable(result)) {
    return result.then(
      (resolved) => { onSync(resolved); return resolved; },
      (err) => { onError(err); throw err; },
    );
  }
  onSync(result);
  return result;
}

/**
 * Deterministic secondary sort for capabilities.
 * Primary: phase (ascending). Secondary: capability name (alphabetical).
 * Guarantees equivalent manifests always produce identical execution order.
 */
function byPhaseThenName(
  a: { capability: ManaCapability },
  b: { capability: ManaCapability },
): number {
  const phaseA = CAPABILITY_PHASE[a.capability] ?? 3;
  const phaseB = CAPABILITY_PHASE[b.capability] ?? 3;
  if (phaseA !== phaseB) return phaseA - phaseB;
  return a.capability.localeCompare(b.capability);
}

/** O(1) contract lookup via pre-computed map */
function getContract(capability: ManaCapability): CapabilityContract | undefined {
  return CONTRACT_MAP[capability];
}

// ═══════════════════════════════════════════════════════════════
// Assertions — Structural Integrity Checks (delegated to types.ts)
// ═══════════════════════════════════════════════════════════════

/** Verify CAPABILITY_PHASE covers all capabilities from contracts */
function assertAllPhasesMapped(): void {
  for (const contract of CAPABILITY_CONTRACTS) {
    if (!(contract.capability in CAPABILITY_PHASE)) {
      throw new Error(`[MANA] Missing phase mapping: ${contract.capability}`);
    }
  }
}

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
// Telemetry — Expanded with phase, position, and rule context
// ═══════════════════════════════════════════════════════════════

function emitTelemetry(
  capability: ManaCapability,
  functionName: string,
  action: ManaTelemetryEvent['action'],
  metadata?: Record<string, unknown>,
  evalContext?: LexEvalContext
): void {
  if (!config.telemetry) return;

  // Enrich metadata with structural context — defaults BEFORE spread to guarantee shape
  const point = attachmentPoints.get(`${functionName}:${capability}`);
  const enriched: Record<string, unknown> = {
    phase: point?.phase ?? CAPABILITY_PHASE[capability] ?? -1,
    position: point?.position ?? -1,
    ...metadata,
  };

  telemetry.push({
    timestamp: Date.now(),
    capability,
    functionName,
    action,
    evalContext,
    metadata: enriched,
  });

  if (telemetry.length > config.maxTelemetryEvents) {
    telemetry.splice(0, telemetry.length - config.maxTelemetryEvents);
  }

  // Trace mode — human-readable debug output
  if (traceEnabled) {
    traceLog.push(`[${new Date().toISOString()}] ${action.toUpperCase()} ${capability}::${functionName}${evalContext ? ` (${evalContext})` : ''} phase=${enriched.phase} pos=${enriched.position}${metadata ? ` ${JSON.stringify(metadata)}` : ''}`);
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

    const { verdict, rule } = evaluate('defense_gate', functionName, config.lexMode);
    if (verdict === 'deny') {
      point.blocked++;
      emitTelemetry('defense_gate', functionName, 'blocked', { ruleId: rule?.id });
      throw new Error(`[MANA/DEFENSE] Lex denied invocation of ${functionName}`);
    }
    if (verdict === 'observe') {
      point.observed++;
      emitTelemetry('defense_gate', functionName, 'observed', { note: 'Lex observing — execution allowed', ruleId: rule?.id });
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

    return withAsyncSafety(
      result,
      () => {
        const duration = performance.now() - start;
        emitTelemetry('beacon_telemetry', functionName, 'observed', {
          durationMs: Math.round(duration * 100) / 100,
          argCount: args.length,
          returnType: isThenable(result) ? 'promise' : typeof result,
        });
      },
      () => {
        const duration = performance.now() - start;
        emitTelemetry('beacon_telemetry', functionName, 'observed', {
          durationMs: Math.round(duration * 100) / 100,
          error: true,
        });
      },
    );
  };
}

function wrapWithGovernanceHook(
  originalFn: Function,
  functionName: string,
  point: AttachmentPoint
): Function {
  return function manaGovernance(this: unknown, ...args: unknown[]) {
    point.invocations++;

    const { verdict, rule } = evaluate('governance_hook', functionName, config.lexMode);

    if (verdict === 'deny') {
      point.blocked++;
      emitTelemetry('governance_hook', functionName, 'blocked', { verdict, ruleId: rule?.id });
      return undefined;
    }
    if (verdict === 'observe') {
      point.observed++;
      emitTelemetry('governance_hook', functionName, 'observed', { note: 'Governance observation — mutation logged', ruleId: rule?.id });
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

    const { verdict, rule } = evaluate('shadow_rule', functionName, config.lexMode);
    if (verdict === 'deny') {
      point.blocked++;
      const message = typeof point.rulePayload === 'string'
        ? point.rulePayload
        : `[MANA] Simon says no — ${functionName} is governed.`;
      emitTelemetry('shadow_rule', functionName, 'blocked', { message, ruleId: rule?.id });
      return message;
    }
    if (verdict === 'observe') {
      point.observed++;
      emitTelemetry('shadow_rule', functionName, 'observed', { note: 'Shadow rule observing — passthrough with logging', ruleId: rule?.id });
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

      if (isThenable(result)) {
        return result.then(
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
// Expanded Wrapper Factories — 25 granular behaviors
// ═══════════════════════════════════════════════════════════════

function wrapWithInputSanitizer(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  return function manaInputSanitizer(this: unknown, ...args: unknown[]) {
    point.invocations++;
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

    return withAsyncSafety(
      result,
      () => {
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
      },
      () => {
        const d = performance.now() - start;
        emitTelemetry('latency_profiler', functionName, 'observed', { durationMs: Math.round(d * 100) / 100, error: true });
      },
    );
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
      if (isThenable(result)) {
        return result.catch((err: Error) => {
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
    const { verdict, rule } = evaluate('governance_hook', functionName, config.lexMode);
    if (verdict === 'deny') {
      point.blocked++;
      emitTelemetry('mutation_guard', functionName, 'blocked', { reason: 'unauthorized_mutation', ruleId: rule?.id });
      throw new Error(`[MANA/MUTATION] Unauthorized state mutation in ${functionName}`);
    }
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
    const { verdict, rule } = evaluate('governance_hook', functionName, config.lexMode);
    if (verdict === 'deny') {
      point.blocked++;
      emitTelemetry('policy_enforcer', functionName, 'blocked', { verdict, ruleId: rule?.id });
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
    const { verdict, rule } = evaluate('governance_hook', functionName, config.lexMode);
    if (verdict === 'deny') {
      point.blocked++;
      emitTelemetry('consent_gate', functionName, 'blocked', { reason: 'consent_not_granted', ruleId: rule?.id });
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
    const { verdict, rule } = evaluate('shadow_rule', functionName, config.lexMode);
    if (verdict === 'deny') {
      point.blocked++;
      emitTelemetry('access_controller', functionName, 'blocked', { reason: 'access_denied', ruleId: rule?.id });
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

    const attemptSync = (attempt: number): unknown => {
      try {
        const result = originalFn.apply(this, args);
        if (isThenable(result)) {
          return result.catch(async (err: unknown) => {
            if (attempt < MAX_RETRIES) {
              await delay(10 * (attempt + 1));
              emitTelemetry('retry_handler', functionName, 'observed', { attempt, error: (err as Error)?.message?.slice(0, 80), async: true });
              return attemptSync(attempt + 1);
            }
            point.blocked++;
            emitTelemetry('retry_handler', functionName, 'blocked', { reason: 'max_retries_exhausted', async: true });
            throw err;
          });
        }
        if (attempt > 0) {
          emitTelemetry('retry_handler', functionName, 'observed', { retriedAfter: attempt });
        }
        return result;
      } catch (err) {
        if (attempt < MAX_RETRIES) {
          emitTelemetry('retry_handler', functionName, 'observed', { attempt, error: (err as Error)?.message?.slice(0, 80) });
          return attemptSync(attempt + 1);
        }
        point.blocked++;
        emitTelemetry('retry_handler', functionName, 'blocked', { reason: 'max_retries_exhausted' });
        throw err;
      }
    };

    return attemptSync(0);
  };
}

function wrapWithTimeoutGuard(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  const TIMEOUT_MS = 30000;
  return function manaTimeoutGuard(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const result = originalFn.apply(this, args);
    if (isThenable(result)) {
      return Promise.race([
        result,
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
      if (isThenable(result)) {
        return result.finally(() => { active--; });
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
      if (isThenable(result)) {
        return result.catch((err: Error) => {
          point.observed++;
          emitTelemetry('fallback_provider', functionName, 'observed', { fallbackReason: err?.message?.slice(0, 80) });
          return undefined;
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

    const emitSnapshot = () => {
      const after = typeof this === 'object' && this !== null
        ? JSON.stringify(this).slice(0, 500) : 'N/A';
      emitTelemetry('state_snapshot', functionName, 'observed', {
        beforeHash: before.length,
        afterHash: after.length,
        mutated: before !== after,
      });
    };

    return withAsyncSafety(result, emitSnapshot, emitSnapshot);
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
  const filterString = (val: unknown): unknown => {
    if (typeof val === 'string') {
      const filtered = val.replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '****-****-****-****');
      if (filtered !== val) {
        point.observed++;
        emitTelemetry('output_filter', functionName, 'observed', { filtered: true });
      }
      return filtered;
    }
    return val;
  };

  return function manaOutputFilter(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const result = originalFn.apply(this, args);

    if (isThenable(result)) {
      return result.then((resolved) => filterString(resolved));
    }

    return filterString(result);
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

    const checkAnomaly = () => {
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
    };

    return withAsyncSafety(result, checkAnomaly, checkAnomaly);
  };
}

function wrapWithDriftMonitor(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  const returnHistory: string[] = [];

  const checkDrift = (resultType: string) => {
    returnHistory.push(resultType);
    if (returnHistory.length > 50) returnHistory.shift();
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
  };

  return function manaDriftMonitor(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const result = originalFn.apply(this, args);

    return withAsyncSafety(
      result,
      (resolved) => { checkDrift(typeof resolved); },
      () => { checkDrift('error'); },
    );
  };
}

// ═══════════════════════════════════════════════════════════════
// Primitive-Family Wrapper Factories — 60 deployable behaviors
// ═══════════════════════════════════════════════════════════════

/** Generic observation wrapper — emits telemetry for any capability */
function wrapWithObservation(
  originalFn: Function, functionName: string, point: AttachmentPoint, capName: ManaCapability
): Function {
  return function manaObservation(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const start = performance.now();
    const result = originalFn.apply(this, args);

    return withAsyncSafety(
      result,
      () => {
        emitTelemetry(capName, functionName, 'observed', {
          durationMs: Math.round((performance.now() - start) * 100) / 100,
          argCount: args.length,
        });
      },
      () => {
        emitTelemetry(capName, functionName, 'observed', {
          durationMs: Math.round((performance.now() - start) * 100) / 100,
          error: true,
        });
      },
    );
  };
}

/** Generic gating wrapper — evaluates Lex before allowing execution */
function wrapWithGate(
  originalFn: Function, functionName: string, point: AttachmentPoint, capName: ManaCapability, lexKey: ManaCapability
): Function {
  return function manaGate(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const { verdict, rule } = evaluate(lexKey, functionName, config.lexMode);
    if (verdict === 'deny') {
      point.blocked++;
      emitTelemetry(capName, functionName, 'blocked', { reason: `${capName}_denied`, ruleId: rule?.id });
      throw new Error(`[MANA/${capName.toUpperCase()}] ${functionName} blocked by Lex`);
    }
    if (verdict === 'observe') {
      point.observed++;
      emitTelemetry(capName, functionName, 'observed', { note: 'Lex observation mode', ruleId: rule?.id });
    }
    return originalFn.apply(this, args);
  };
}

// ── MEMORY family ──
function wrapWithMemoryCache(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  const cache = new Map<string, { value: unknown; ts: number }>();
  const TTL = 60000;
  return function manaMemoryCache(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const key = JSON.stringify(args).slice(0, 200);
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < TTL) {
      point.observed++;
      emitTelemetry('memory_cache', functionName, 'observed', { cacheHit: true, cacheSize: cache.size });
      return cached.value;
    }
    const result = originalFn.apply(this, args);
    cache.set(key, { value: result, ts: Date.now() });
    if (cache.size > 500) {
      const oldest = cache.keys().next().value;
      if (oldest) cache.delete(oldest);
    }
    emitTelemetry('memory_cache', functionName, 'invoked', { cacheHit: false, cacheSize: cache.size });
    return result;
  };
}

// ── NEXUS family ──
function wrapWithNexusCostGate(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  let totalCost = 0;
  const BUDGET = 10000;
  return function manaNexusCostGate(this: unknown, ...args: unknown[]) {
    point.invocations++;
    if (totalCost >= BUDGET) {
      point.blocked++;
      emitTelemetry('nexus_cost_gate', functionName, 'blocked', { totalCost, budget: BUDGET });
      throw new Error(`[MANA/NEXUS] ${functionName} budget exhausted (${totalCost}/${BUDGET} millicents)`);
    }
    const result = originalFn.apply(this, args);
    totalCost += 10;
    emitTelemetry('nexus_cost_gate', functionName, 'invoked', { totalCost });
    return result;
  };
}

// ── BRAIN family ──
function wrapWithBrainConfidenceGate(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  const checkConfidence = (val: unknown): void => {
    if (val && typeof val === 'object' && 'confidence' in (val as Record<string, unknown>)) {
      const conf = (val as Record<string, unknown>).confidence;
      if (typeof conf === 'number' && conf < 0.5) {
        point.observed++;
        emitTelemetry('brain_confidence_gate', functionName, 'observed', {
          confidence: conf, action: 'low_confidence_flagged',
        });
      }
    }
  };

  return function manaBrainConfidence(this: unknown, ...args: unknown[]) {
    point.invocations++;
    const result = originalFn.apply(this, args);

    return withAsyncSafety(
      result,
      (resolved) => { checkConfidence(resolved); },
      () => { /* error path — no confidence to check */ },
    );
  };
}

// ── IMMUNITY family ──
function wrapWithImmunitySelfHeal(
  originalFn: Function, functionName: string, point: AttachmentPoint
): Function {
  let consecutiveFailures = 0;
  return function manaImmunitySelfHeal(this: unknown, ...args: unknown[]) {
    point.invocations++;
    try {
      const result = originalFn.apply(this, args);
      if (isThenable(result)) {
        return result.then(resolved => {
          consecutiveFailures = 0;
          return resolved;
        }).catch((err: Error) => {
          consecutiveFailures++;
          if (consecutiveFailures >= 3) {
            point.observed++;
            emitTelemetry('immunity_self_heal', functionName, 'observed', {
              consecutiveFailures, action: 'self_heal_triggered',
            });
            consecutiveFailures = 0;
            return undefined;
          }
          throw err;
        });
      }
      consecutiveFailures = 0;
      return result;
    } catch (err) {
      consecutiveFailures++;
      if (consecutiveFailures >= 3) {
        point.observed++;
        emitTelemetry('immunity_self_heal', functionName, 'observed', {
          consecutiveFailures, action: 'self_heal_triggered',
        });
        consecutiveFailures = 0;
        return undefined;
      }
      throw err;
    }
  };
}

// ═══════════════════════════════════════════════════════════════
// Wrapper Routing — Contract-Driven with Dedicated Overrides
// ═══════════════════════════════════════════════════════════════

/** Get wrapper factory for a capability — uses contracts for routing */
function getWrapper(capability: ManaCapability) {
  // Dedicated wrappers for capabilities with specialized logic
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
    case 'anomaly_detector': return wrapWithAnomalyDetector;
    case 'drift_monitor': return wrapWithDriftMonitor;
    case 'memory_cache': return wrapWithMemoryCache;
    case 'nexus_cost_gate': return wrapWithNexusCostGate;
    case 'brain_confidence_gate': return wrapWithBrainConfidenceGate;
    case 'immunity_self_heal': return wrapWithImmunitySelfHeal;

    // Aliases — reuse dedicated wrappers with matching semantics
    case 'reflex_circuit_breaker': return wrapWithCircuitBreaker;
    case 'reflex_fallback_chain': return wrapWithFallbackProvider;
    case 'immunity_quarantine': return wrapWithBulkheadIsolator;
    case 'sandbox_isolator': return wrapWithBulkheadIsolator;
    case 'nerve_backpressure': return wrapWithBulkheadIsolator;
    case 'system_telemetry': return wrapWithBeaconTelemetry;
    case 'vision_perf_monitor': return wrapWithLatencyProfiler;
    case 'atlas_dependency_map': return wrapWithDependencyMapper;
    case 'relay_offline_cache': return wrapWithMemoryCache;
    case 'oracle_anomaly_alert': return wrapWithAnomalyDetector;

    // Contract-driven routing — all remaining capabilities
    default: {
      const contract = getContract(capability);
      if (contract) {
        if (contract.blocking) {
          // Gate wrapper — uses contract's lexKey for evaluation
          return (fn: Function, name: string, pt: AttachmentPoint) =>
            wrapWithGate(fn, name, pt, capability, contract.lexKey);
        }
        // Observation wrapper — non-blocking telemetry
        return (fn: Function, name: string, pt: AttachmentPoint) =>
          wrapWithObservation(fn, name, pt, capability);
      }
      // Ultimate fallback — should never reach here if contracts are complete
      return wrapWithBeaconTelemetry;
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════

/** Configure the Mana Engine — runs structural assertions on first call */
let assertionsVerified = false;
export function configure(partial: Partial<ManaConfig>): ManaConfig {
  config = { ...config, ...partial };

  // Run structural integrity checks once
  if (!assertionsVerified) {
    assertContractMapComplete();
    assertAllPhasesMapped();
    assertionsVerified = true;
  }

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
 * Attach Layer 2 capabilities to a host module.
 * Functions are wrapped at their boundaries — source is NEVER modified.
 * 
 * Execution order is deterministic:
 *   Sort ascending by phase → reverse → wrap
 *   Result: GATE is outermost (executes first), ANALYZE is innermost (executes last)
 */
export async function attach(
  hostModule: Record<string, unknown>,
  capabilities: Array<{ functionName: string; capability: ManaCapability; rulePayload?: unknown }>,
  sourceForHash: string,
): Promise<ManaManifest> {
  // ── #1: Identity enforcement — reject placeholder identity ──
  const identity = checkIdentity(hostPackage, hostVersion);
  if (!identity.complete) {
    state = 'detached';
    throw new Error(
      `[MANA/IDENTITY] Attachment denied — ${identity.reason}. Call scan() or configure identity first.`
    );
  }

  // ── Fingerprint Gate — verify before attaching ──
  const fpResult = verifyFingerprint(hostModule, hostPackage, hostVersion);
  
  recordAuditEvent('mana.engine', 'fingerprint_verify', fpResult.verdict, {
    fingerprint: fpResult.fingerprint,
    expected: fpResult.expectedFingerprint,
    mismatchType: fpResult.mismatchType,
    trustState: fpResult.trustState,
  }, undefined, undefined, {
    phase: 'boot',
    outcome: fpResult.verdict === 'valid' ? 'success' : fpResult.verdict === 'suspect' ? 'degraded' : 'denied',
    trustState: fpResult.trustState as 'candidate_baseline' | 'trusted_baseline' | 'uninitialized',
  });

  if (fpResult.verdict === 'invalid') {
    state = 'detached';
    throw new Error(
      `[MANA/FINGERPRINT] Attachment denied — invalid fingerprint: ${fpResult.mismatchDetails ?? 'hash tamper or structural change'}`
    );
  }

  // #3: Suspect = limited mode — filter using domain-typed restrictions
  let filteredCapabilities = capabilities;
  if (fpResult.verdict === 'suspect') {
    const restricted = new Set(fpResult.limitedCapabilities);
    filteredCapabilities = capabilities.filter(c => !restricted.has(c.capability));
    
    recordAuditEvent('mana.engine', 'fingerprint_limited', 'suspect', {
      removedCapabilities: capabilities.length - filteredCapabilities.length,
      restrictions: fpResult.restrictions,
    }, undefined, undefined, {
      phase: 'boot',
      outcome: 'degraded',
      trustState: fpResult.trustState as 'candidate_baseline' | 'trusted_baseline' | 'uninitialized',
    });
  }

  // Detect recursive layering
  for (const [, val] of Object.entries(hostModule)) {
    if (typeof val === 'function' && (val as unknown as Record<symbol, unknown>)[MANA_LAYER_TAG] === true) {
      parentLayerHash = await computeHash(sourceForHash);
      layerDepth++;
      break;
    }
  }

  state = 'attaching';
  hostSourceHash = await computeHash(sourceForHash);
  attachmentPoints.clear();
  originals.clear();
  telemetry.length = 0;

  const sorted = [...filteredCapabilities].sort(byPhaseThenName).reverse();

  const capsByFunction = new Map<string, typeof sorted>();
  for (const cap of sorted) {
    const list = capsByFunction.get(cap.functionName) ?? [];
    list.push(cap);
    capsByFunction.set(cap.functionName, list);
  }

  // #8: Host-scoped double-wrap registry — persists across attach cycles
  const hostKey = hostPackage;

  let position = 0;
  for (const [functionName, caps] of Array.from(capsByFunction.entries())) {
    const rawOriginal = hostModule[functionName] as AnyFn;
    if (typeof rawOriginal !== 'function') continue;

    if (!originals.has(functionName)) {
      originals.set(functionName, rawOriginal);
    }

    // #4 + #8: Compose all wrappers first, then apply ONE outer boundary
    let composed: AnyFn = rawOriginal;

    // #8: Check existing attached capabilities on the function itself
    const existingCaps = (rawOriginal as unknown as Record<string, Set<ManaCapability>>).__mana_attached_caps;
    const attachedSet = existingCaps instanceof Set ? new Set(existingCaps) : new Set<ManaCapability>();

    for (const cap of caps) {
      // #8: Persistent double-wrap prevention
      if (attachedSet.has(cap.capability)) {
        emitTelemetry(cap.capability, functionName, 'observed', { reason: 'double_wrap_prevented' }, 'attachment');
        continue;
      }

      const { verdict } = evaluate(cap.capability, functionName, config.lexMode, 'attachment');
      if (verdict === 'deny') {
        emitTelemetry(cap.capability, functionName, 'blocked', { reason: 'lex_denied_attachment' }, 'attachment');
        continue;
      }

      const point: AttachmentPoint = {
        functionName,
        capability: cap.capability,
        phase: CAPABILITY_PHASE[cap.capability] ?? 3,
        position,
        active: true,
        invocations: 0,
        blocked: 0,
        observed: 0,
        rulePayload: cap.rulePayload,
      };
      attachmentPoints.set(`${functionName}:${cap.capability}`, point);

      // Wrap — NO boundary here, just the capability wrapper
      const wrapper = getWrapper(cap.capability);
      composed = wrapper(composed as Function, functionName, point) as AnyFn;

      attachedSet.add(cap.capability);
      emitTelemetry(cap.capability, functionName, 'invoked', {
        action: 'attached', layerDepth, position,
        phase: point.phase,
      }, 'attachment');
      position++;
    }

    // #4: Apply ONE outer execution boundary wrapper after all capabilities composed
    const fullyComposed = composed;
    const boundaryWrapped = function manaOuterBoundary(this: unknown, ...args: unknown[]) {
      enterExecutionBoundary(hostKey);
      try {
        const result = (fullyComposed as Function).apply(this, args);
        if (result != null && typeof result === 'object' && typeof (result as Promise<unknown>).then === 'function') {
          return (result as Promise<unknown>).then(
            (v) => { exitExecutionBoundary(hostKey); return v; },
            (e) => { exitExecutionBoundary(hostKey); throw e; },
          );
        }
        exitExecutionBoundary(hostKey);
        return result;
      } catch (err) {
        exitExecutionBoundary(hostKey);
        throw err;
      }
    } as AnyFn;

    // Tag with MANA_LAYER_TAG
    (boundaryWrapped as unknown as Record<symbol, unknown>)[MANA_LAYER_TAG] = true;
    // #8: Persist attached capability set on the function
    (boundaryWrapped as unknown as Record<string, Set<ManaCapability>>).__mana_attached_caps = attachedSet;

    hostModule[functionName] = boundaryWrapped;
  }

  state = 'symbiotic';
  attachedAt = Date.now();
  detachedAt = null;

  // #2: First boot registers candidate baseline only — NOT trusted
  if (fpResult.verdict === 'suspect' && fpResult.expectedFingerprint === null) {
    registerCandidateBaseline(hostPackage, fpResult.fingerprint, fpResult.integrityFingerprint);
  }

  recordAuditEvent('mana.engine', 'attach_complete', 'success', {
    hostPackage,
    hostVersion,
    attachmentPointCount: attachmentPoints.size,
    layerDepth,
    fingerprintVerdict: fpResult.verdict,
    trustState: fpResult.trustState,
  }, undefined, undefined, {
    phase: 'attachment',
    outcome: 'success',
    trustState: fpResult.trustState as 'candidate_baseline' | 'trusted_baseline' | 'uninitialized',
  });

  return getManifest();
}

/**
 * Detach all Layer 2 capabilities — restore original functions.
 * V1 WIRING: Uses Safe Detach protocol + Audit Chain integration.
 * 
 * HARDENED GUARANTEES:
 * - Will not detach mid-execution (waits for boundary clear)
 * - Idempotent — same host returns same receipt
 * - Post-detach verification that all wrappers are removed
 * - Audit trail for every detach operation
 */
export async function detach(hostModule: Record<string, unknown>): Promise<ManaManifest> {
  if (state !== 'symbiotic') {
    throw new Error('[MANA] Not attached. Nothing to detach.');
  }

  state = 'detaching';
  const manifest = getManifest();

  recordAuditEvent('mana.engine', 'detach_start', 'initiated', {
    hostPackage,
    hostVersion,
    attachmentPointCount: attachmentPoints.size,
  }, undefined, undefined, {
    phase: 'detachment',
    outcome: 'success',
  });

  // #6: safeDetach is the SINGLE detach authority — no fallback logic here
  const receipt = await safeDetach(hostModule, originals, hostPackage, manifest);

  state = 'detached';
  detachedAt = Date.now();

  // #7: Structured audit event for detach completion
  recordAuditEvent('mana.engine', 'detach_complete', receipt.success ? 'clean' : 'fallback', {
    receiptId: receipt.receiptId,
    restoredFunctions: receipt.restoredFunctions,
    verificationPassed: receipt.verificationPassed,
    idempotencyKey: receipt.idempotencyKey,
    recoveryPath: receipt.recoveryPath,
  }, undefined, undefined, {
    phase: 'detachment',
    outcome: receipt.success ? 'success' : 'degraded',
    recoveryPath: receipt.recoveryPath,
  });

  originals.clear();
  attachmentPoints.clear();
  if (layerDepth > 0) layerDepth--;

  return manifest;
}

/**
 * Generate cryptographic proof of non-modification.
 * Deterministic: sorted attachment points ensure identical manifests produce identical hashes.
 */
export async function generateProof(sourceForHash: string): Promise<ManaProof> {
  const currentHash = await computeHash(sourceForHash);
  const points = Array.from(attachmentPoints.values());

  // Deterministic sort for proof — by functionName then capability
  points.sort((a, b) =>
    a.functionName.localeCompare(b.functionName) || a.capability.localeCompare(b.capability)
  );

  const capabilities = [...new Set(points.map(p => p.capability))].sort();

  // Deterministic snapshot — field order and sort order are canonical
  const snapshot = {
    hostPackage,
    hostVersion,
    attachmentPoints: points.map(p => ({
      functionName: p.functionName,
      capability: p.capability,
      phase: p.phase,
      position: p.position,
    })),
    capabilities,
    telemetryCount: telemetry.length,
    layerDepth,
    parentLayerHash,
  };
  const manifestHash = await computeHash(JSON.stringify(snapshot));

  const proof: ManaProof = {
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
    manifestHash,
    telemetryEventCount: telemetry.length,
  };

  lastProof = proof;
  return proof;
}

/** Get full attachment manifest — includes proof when in symbiotic state */
export function getManifest(): ManaManifest {
  return {
    hostPackage,
    hostVersion,
    attachmentState: state,
    attachmentPoints: Array.from(attachmentPoints.values()),
    lexRules: getRules(),
    proof: lastProof,
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
    const key = `${point.functionName}:${point.capability}`;
    summary[key] = {
      invocations: point.invocations,
      blocked: point.blocked,
      observed: point.observed,
    };
  }

  return summary;
}

/** Full engine reset — clears ALL state back to defaults */
export function reset(): void {
  state = 'detached';
  hostPackage = '';
  hostVersion = '';
  hostSourceHash = '';
  attachedAt = null;
  detachedAt = null;
  layerDepth = 0;
  parentLayerHash = null;
  lastProof = null;
  attachmentPoints.clear();
  originals.clear();
  telemetry.length = 0;
  traceLog = [];
  traceEnabled = false;
  assertionsVerified = false;
  resetLex();
  config = { ...DEFAULT_CONFIG };
}

// ═══════════════════════════════════════════════════════════════
// Debug / Trace Mode
// ═══════════════════════════════════════════════════════════════

/** Enable debug trace mode — captures human-readable execution log */
export function enableTrace(): void {
  traceEnabled = true;
  traceLog = [];
}

/** Disable debug trace mode */
export function disableTrace(): void {
  traceEnabled = false;
}

/**
 * Get trace execution log — answers:
 * - Which wrappers are attached to each function?
 * - In what order?
 * - Which Lex rule fired?
 * - Why was something blocked?
 * - What telemetry was emitted?
 */
export function getTrace(): ReadonlyArray<string> {
  return [...traceLog];
}

/**
 * Inspect a specific function — returns all wrappers attached,
 * their phases, positions, and current invocation stats.
 */
export function inspectFunction(functionName: string): ReadonlyArray<{
  capability: ManaCapability;
  phase: number;
  phaseName: string;
  position: number;
  invocations: number;
  blocked: number;
  observed: number;
}> {
  const PHASE_NAMES = ['GATE', 'VALIDATE', 'FAILSAFE', 'OBSERVE', 'ANALYZE'];
  const results: Array<{
    capability: ManaCapability;
    phase: number;
    phaseName: string;
    position: number;
    invocations: number;
    blocked: number;
    observed: number;
  }> = [];

  for (const point of attachmentPoints.values()) {
    if (point.functionName === functionName) {
      results.push({
        capability: point.capability,
        phase: point.phase,
        phaseName: PHASE_NAMES[point.phase] ?? 'UNKNOWN',
        position: point.position,
        invocations: point.invocations,
        blocked: point.blocked,
        observed: point.observed,
      });
    }
  }

  return results.sort((a, b) => a.phase - b.phase);
}

/**
 * Get the full execution chain for a function — ordered by phase.
 * Shows the deterministic wrapper stack from outermost (GATE) to innermost (ANALYZE).
 */
export function getExecutionChain(functionName: string): ReadonlyArray<{
  capability: ManaCapability;
  phase: WrapperPhase;
  phaseName: string;
  position: number;
  contract: CapabilityContract | undefined;
}> {
  const PHASE_NAMES = ['GATE', 'VALIDATE', 'FAILSAFE', 'OBSERVE', 'ANALYZE'];

  return Array.from(attachmentPoints.values())
    .filter(p => p.functionName === functionName)
    .sort((a, b) => a.phase - b.phase)
    .map(p => ({
      capability: p.capability,
      phase: p.phase as WrapperPhase,
      phaseName: PHASE_NAMES[p.phase] ?? 'UNKNOWN',
      position: p.position,
      contract: getContract(p.capability),
    }));
}
