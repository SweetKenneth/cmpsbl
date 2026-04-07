/**
 * Mana Engine — Silent Symbiotic Attachment Runtime
 * U.S. Patent App. No. 64/031,637
 * 
 * Wraps a Layer 1 host with Layer 2 capabilities at function boundaries.
 * The host source is NEVER modified — verified by SHA-256 proof.
 * All attachments governed by Lex.
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
  // Node.js fallback
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

  // Evict oldest if over limit
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

    // Lex check — can this invocation proceed?
    const { verdict } = evaluate('defense_gate', functionName, config.lexMode);
    if (verdict === 'deny') {
      point.blocked++;
      emitTelemetry('defense_gate', functionName, 'blocked');
      throw new Error(`[MANA/DEFENSE] Lex denied invocation of ${functionName}`);
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
    emitTelemetry('governance_hook', functionName, verdict === 'deny' ? 'blocked' : 'invoked', {
      verdict,
    });

    if (verdict === 'deny') {
      point.blocked++;
      return undefined;
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

      // Shadow rules return a modified result, not throw
      return message;
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

/** Get wrapper factory for a capability */
function getWrapper(capability: ManaCapability) {
  switch (capability) {
    case 'defense_gate': return wrapWithDefenseGate;
    case 'beacon_telemetry': return wrapWithBeaconTelemetry;
    case 'governance_hook': return wrapWithGovernanceHook;
    case 'shadow_rule': return wrapWithShadowRule;
    case 'audit_trail': return wrapWithAuditTrail;
    case 'circuit_breaker': return wrapWithCircuitBreaker;
    case 'dream_synthesis': return wrapWithBeaconTelemetry; // DREAM uses telemetry collection
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
    throw new Error('[MANA] Already attached. Detach first.');
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
      continue; // Skip non-functions silently
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
      rulePayload,
    };
    attachmentPoints.set(`${functionName}:${capability}`, point);

    // Wrap the function — Layer 2 boundary injection
    const wrapper = getWrapper(capability);
    hostModule[functionName] = wrapper(originalFn, functionName, point);

    emitTelemetry(capability, functionName, 'invoked', { action: 'attached' });
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

  // Clean up
  originals.clear();
  attachmentPoints.clear();

  return manifest;
}

/**
 * Generate cryptographic proof of non-modification.
 * Compares host source hash before and after attachment.
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
    proof: null, // Proof is generated on-demand via generateProof()
    telemetry: [...telemetry],
    attachedAt,
    detachedAt,
  };
}

/** Get telemetry events */
export function getTelemetry(): ReadonlyArray<ManaTelemetryEvent> {
  return [...telemetry];
}

/** Get telemetry summary */
export function getTelemetrySummary(): Record<string, { invocations: number; blocked: number }> {
  const summary: Record<string, { invocations: number; blocked: number }> = {};

  for (const point of attachmentPoints.values()) {
    summary[point.functionName] = {
      invocations: point.invocations,
      blocked: point.blocked,
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
  attachmentPoints.clear();
  originals.clear();
  telemetry.length = 0;
  resetLex();
  config = { ...DEFAULT_CONFIG };
}
