/**
 * ManaSession — Session-Scoped Engine Instance
 * U.S. Patent App. No. 64/031,637
 *
 * Replaces global mutable state with scoped session objects.
 * Each session owns its own attachment points, telemetry, proof,
 * and Lex rules — making multi-module and concurrent usage safe.
 *
 * The global engine API remains for single-session convenience.
 * Use createSession() when you need isolation.
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
  LexRule,
  LexVerdict,
  LexEvalContext,
  AnyFn,
  CapabilityContract,
} from './types';
import {
  CAPABILITY_PHASE, CAPABILITY_CONTRACTS, CONTRACT_MAP, WrapperPhase,
  MANA_LAYER_TAG, assertContractMapComplete, normalizePriority,
} from './types';
import {
  verifyFingerprint,
  registerCandidateBaseline,
  checkIdentity,
  type FingerprintResult,
} from '../../core/boot/fingerprintGate';
import { recordAuditEvent } from '../../core/audit/auditChain';
import {
  safeDetach,
  enterExecutionBoundary,
  exitExecutionBoundary,
} from './detach-safe';

// ═══════════════════════════════════════════════════════════════
// Primitives — Type-Safe Helpers (mirrored from engine.ts)
// ═══════════════════════════════════════════════════════════════

/** Type-narrowing promise check */
function isThenable(val: unknown): val is Promise<unknown> {
  return val != null && typeof val === 'object' && typeof (val as Promise<unknown>).then === 'function';
}

/**
 * Normalize sync/async execution for wrappers.
 * Guarantees: sync → handled inline; thenable → preserves exact async semantics.
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

/** Backoff delay for retry logic */
function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Deterministic secondary sort for capabilities.
 * Primary: phase (ascending). Secondary: capability name (alphabetical).
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
// Assertions — delegates to shared assertContractMapComplete from types.ts
// ═══════════════════════════════════════════════════════════════

/** Verify CAPABILITY_PHASE covers all capabilities from contracts */
function assertAllPhasesMapped(): void {
  for (const contract of CAPABILITY_CONTRACTS) {
    if (!(contract.capability in CAPABILITY_PHASE)) {
      throw new Error(`[MANA/SESSION] Missing phase mapping: ${contract.capability}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// Session-Scoped Lex Governor
// ═══════════════════════════════════════════════════════════════

interface SessionLex {
  rules: Map<string, LexRule>;
  idCounter: number;
}

function createSessionLex(): SessionLex {
  return { rules: new Map(), idCounter: 0 };
}

function lexRegisterRule(
  lex: SessionLex,
  capability: ManaCapabilityOrWildcard,
  target: string,
  verdict: LexVerdict,
  reason: string,
  priority = 100,
): LexRule {
  const safePriority = normalizePriority(priority);
  lex.idCounter++;
  const rule: LexRule = {
    id: `lex-${Date.now().toString(36)}-${lex.idCounter.toString(36)}`,
    capability,
    target,
    verdict,
    reason,
    createdAt: Date.now(),
    priority: safePriority,
  };
  lex.rules.set(rule.id, rule);
  return rule;
}

/**
 * Session-scoped Lex evaluation.
 * Wildcards:
 * - capability '*' matches any capability (explicit, not cast)
 * - target '*' matches any function name
 */
function lexEvaluate(
  lex: SessionLex,
  capability: ManaCapability,
  target: string,
  mode: 'permissive' | 'strict',
  context: LexEvalContext = 'runtime',
): { verdict: LexVerdict; rule: LexRule | null; context: LexEvalContext } {
  const sorted = Array.from(lex.rules.values()).sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.createdAt - b.createdAt;
  });

  for (const rule of sorted) {
    // Explicit wildcard handling — '*' on capability matches any
    const capMatch = rule.capability === capability || rule.capability === '*';
    // Wildcards on target — '*' matches any function name
    const targetMatch = rule.target === target || rule.target === '*';
    if (capMatch && targetMatch) {
      return { verdict: rule.verdict, rule, context };
    }
  }

  return {
    verdict: mode === 'permissive' ? 'allow' : 'deny',
    rule: null,
    context,
  };
}

// ═══════════════════════════════════════════════════════════════
// Hashing
// ═══════════════════════════════════════════════════════════════

async function computeHash(source: string): Promise<string> {
  if (typeof globalThis.crypto?.subtle?.digest === 'function') {
    const encoder = new TextEncoder();
    const data = encoder.encode(source);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const { createHash } = await import('crypto');
  return createHash('sha256').update(source).digest('hex');
}

function generateFingerprintId(): string {
  const seg = () => Math.random().toString(36).substring(2, 8);
  return `MANA-${seg()}-${seg()}-${seg()}`.toUpperCase();
}

// ═══════════════════════════════════════════════════════════════
// ManaSession — The Session-Scoped Engine
// ═══════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: ManaConfig = {
  telemetry: true,
  maxTelemetryEvents: 10000,
  dreamSynthesis: false,
  lexMode: 'permissive',
};

export interface ManaSession {
  /** Unique session identifier */
  readonly id: string;
  /** Host package this session is attached to */
  readonly hostPackage: string;

  // ── Configuration ──
  configure(partial: Partial<ManaConfig>): ManaConfig;

  // ── Lex ──
  registerRule(capability: ManaCapabilityOrWildcard, target: string, verdict: LexVerdict, reason: string, priority?: number): LexRule;
  revokeRule(ruleId: string): boolean;
  getRules(): ReadonlyArray<LexRule>;

  // ── Lifecycle ──
  getState(): AttachmentState;
  getLayerDepth(): number;
  scan(hostModule: Record<string, unknown>, packageName: string, version: string): string[];
  attach(
    hostModule: Record<string, unknown>,
    capabilities: Array<{ functionName: string; capability: ManaCapability; rulePayload?: unknown }>,
    sourceForHash: string,
  ): Promise<ManaManifest>;
  detach(hostModule: Record<string, unknown>): Promise<ManaManifest>;

  // ── Proof ──
  generateProof(sourceForHash: string): Promise<ManaProof>;
  getManifest(): ManaManifest;

  // ── Telemetry ──
  getTelemetry(): ReadonlyArray<ManaTelemetryEvent>;
  getTelemetrySummary(): Record<string, { invocations: number; blocked: number; observed: number }>;

  // ── Debug ──
  enableTrace(): void;
  disableTrace(): void;
  getTrace(): ReadonlyArray<string>;
  inspectFunction(functionName: string): ReadonlyArray<{
    capability: ManaCapability; phase: number; phaseName: string;
    position: number; invocations: number; blocked: number; observed: number;
  }>;
  getExecutionChain(functionName: string): ReadonlyArray<{
    capability: ManaCapability; phase: WrapperPhase; phaseName: string;
    position: number; contract: CapabilityContract | undefined;
  }>;

  // ── Cleanup ──
  destroy(): void;
}

/**
 * Create a session-scoped Mana engine instance.
 * All state is isolated — no global mutation.
 */
export function createSession(sessionId?: string): ManaSession {
  // ── Session State ──
  const id = sessionId ?? `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  let config: ManaConfig = { ...DEFAULT_CONFIG };
  let sessionState: AttachmentState = 'detached';
  let hostPkg = '';
  let hostVer = '';
  let hostSourceHash = '';
  let attachedAt: number | null = null;
  let detachedAt: number | null = null;
  let layerDepth = 0;
  let parentLayerHash: string | null = null;
  let lastProof: ManaProof | null = null;
  let traceEnabled = false;
  let traceLog: string[] = [];
  let assertionsVerified = false;

  const lex = createSessionLex();
  const attachmentPoints = new Map<string, AttachmentPoint>();
  const telemetry: ManaTelemetryEvent[] = [];
  const originals = new Map<string, AnyFn>();

  // ── Internal helpers ──
  function emitTelemetry(
    capability: ManaCapability, functionName: string,
    action: ManaTelemetryEvent['action'],
    metadata?: Record<string, unknown>, evalContext?: LexEvalContext,
  ): void {
    if (!config.telemetry) return;

    const point = attachmentPoints.get(`${functionName}:${capability}`);
    // Defaults BEFORE spread — guarantees stable telemetry shape
    const enriched: Record<string, unknown> = {
      phase: point?.phase ?? CAPABILITY_PHASE[capability] ?? -1,
      position: point?.position ?? -1,
      ...metadata,
    };

    telemetry.push({ timestamp: Date.now(), capability, functionName, action, evalContext, metadata: enriched });
    if (telemetry.length > config.maxTelemetryEvents) {
      telemetry.splice(0, telemetry.length - config.maxTelemetryEvents);
    }
    if (traceEnabled) {
      traceLog.push(`[${new Date().toISOString()}] ${action.toUpperCase()} ${capability}::${functionName}${evalContext ? ` (${evalContext})` : ''} phase=${enriched.phase} pos=${enriched.position}${metadata ? ` ${JSON.stringify(metadata)}` : ''}`);
    }
  }

  /**
   * Contract-driven wrapper factory — uses session-scoped Lex.
   * Behavior determined by CapabilityContract, not hardcoded switches.
   * ALL wrappers use withAsyncSafety — no manual promise checks.
   */
  function wrapFunction(
    originalFn: AnyFn, functionName: string, capability: ManaCapability, point: AttachmentPoint,
  ): AnyFn {
    const contract = getContract(capability);
    const phase = CAPABILITY_PHASE[capability] ?? WrapperPhase.OBSERVE;

    // ── GATE phase — blocking ──
    if (phase === WrapperPhase.GATE) {
      const denySemantic = contract?.denySemantic ?? 'throw';
      const lexKey = contract?.lexKey ?? capability;
      return function manaSessionGate(this: unknown, ...args: unknown[]) {
        point.invocations++;
        const { verdict } = lexEvaluate(lex, lexKey, functionName, config.lexMode, 'runtime');
        if (verdict === 'deny') {
          point.blocked++;
          emitTelemetry(capability, functionName, 'blocked', { reason: `${capability}_denied`, denySemantic }, 'runtime');
          switch (denySemantic) {
            case 'return_undefined': return undefined;
            case 'return_message': return `[MANA/${capability.toUpperCase()}] ${functionName} is governed.`;
            case 'swallow': return undefined;
            default: throw new Error(`[MANA/${capability.toUpperCase()}] ${functionName} blocked by Lex`);
          }
        }
        if (verdict === 'observe') {
          point.observed++;
          emitTelemetry(capability, functionName, 'observed', { note: 'Lex observation' }, 'runtime');
        }
        return originalFn.apply(this, args);
      } as AnyFn;
    }

    // ── VALIDATE phase — async-safe ──
    if (phase === WrapperPhase.VALIDATE) {
      return function manaSessionValidate(this: unknown, ...args: unknown[]) {
        point.invocations++;
        const result = originalFn.apply(this, args);
        return withAsyncSafety(
          result,
          () => { emitTelemetry(capability, functionName, 'invoked', { argCount: args.length }); },
          () => { emitTelemetry(capability, functionName, 'observed', { error: true }); },
        );
      } as AnyFn;
    }

    // ── FAILSAFE phase — async-safe ──
    if (phase === WrapperPhase.FAILSAFE) {
      // Retry handler gets special treatment — needs backoff
      if (capability === 'retry_handler') {
        const MAX_RETRIES = 3;
        return function manaSessionRetry(this: unknown, ...args: unknown[]) {
          point.invocations++;
          const attemptSync = (attempt: number): unknown => {
            try {
              const result = originalFn.apply(this, args);
              if (isThenable(result)) {
                return result.catch(async (err: unknown) => {
                  if (attempt < MAX_RETRIES) {
                    await delay(10 * (attempt + 1));
                    emitTelemetry(capability, functionName, 'observed', { attempt, async: true });
                    return attemptSync(attempt + 1);
                  }
                  point.blocked++;
                  emitTelemetry(capability, functionName, 'blocked', { reason: 'max_retries_exhausted' });
                  throw err;
                });
              }
              return result;
            } catch (err) {
              if (attempt < MAX_RETRIES) {
                emitTelemetry(capability, functionName, 'observed', { attempt });
                return attemptSync(attempt + 1);
              }
              point.blocked++;
              emitTelemetry(capability, functionName, 'blocked', { reason: 'max_retries_exhausted' });
              throw err;
            }
          };
          return attemptSync(0);
        } as AnyFn;
      }

      // Generic failsafe — catch and swallow, async-safe
      return function manaSessionFailsafe(this: unknown, ...args: unknown[]) {
        point.invocations++;
        try {
          const result = originalFn.apply(this, args);
          return withAsyncSafety(
            result,
            () => { /* success — no action */ },
            (err) => {
              point.observed++;
              emitTelemetry(capability, functionName, 'observed', { error: (err as Error)?.message?.slice(0, 80) });
            },
          );
        } catch (err) {
          point.observed++;
          emitTelemetry(capability, functionName, 'observed', { error: (err as Error)?.message?.slice(0, 80) });
          return undefined;
        }
      } as AnyFn;
    }

    // ── ANALYZE phase — async-safe ──
    if (phase === WrapperPhase.ANALYZE) {
      return function manaSessionAnalyze(this: unknown, ...args: unknown[]) {
        point.invocations++;
        const start = performance.now();
        const result = originalFn.apply(this, args);
        return withAsyncSafety(
          result,
          () => {
            emitTelemetry(capability, functionName, 'observed', {
              durationMs: Math.round((performance.now() - start) * 100) / 100,
            });
          },
          () => {
            emitTelemetry(capability, functionName, 'observed', {
              durationMs: Math.round((performance.now() - start) * 100) / 100,
              error: true,
            });
          },
        );
      } as AnyFn;
    }

    // ── OBSERVE phase (default) — async-safe ──
    return function manaSessionObserve(this: unknown, ...args: unknown[]) {
      point.invocations++;
      const start = performance.now();
      const result = originalFn.apply(this, args);
      return withAsyncSafety(
        result,
        () => {
          emitTelemetry(capability, functionName, 'observed', {
            durationMs: Math.round((performance.now() - start) * 100) / 100,
            argCount: args.length,
          });
        },
        () => {
          emitTelemetry(capability, functionName, 'observed', {
            durationMs: Math.round((performance.now() - start) * 100) / 100,
            error: true,
          });
        },
      );
    } as AnyFn;
  }

  // ── Public Session API ──
  const session: ManaSession = {
    get id() { return id; },
    get hostPackage() { return hostPkg; },

    configure(partial) {
      config = { ...config, ...partial };
      if (!assertionsVerified) {
        assertContractMapComplete();
        assertAllPhasesMapped();
        assertionsVerified = true;
      }
      return { ...config };
    },

    registerRule(capability, target, verdict, reason, priority) {
      return lexRegisterRule(lex, capability, target, verdict, reason, priority);
    },
    revokeRule(ruleId) { return lex.rules.delete(ruleId); },
    getRules() { return Array.from(lex.rules.values()); },

    getState() { return sessionState; },
    getLayerDepth() { return layerDepth; },

    scan(hostModule, packageName, version) {
      sessionState = 'scanning';
      hostPkg = packageName;
      hostVer = version;
      const names: string[] = [];
      for (const [key, value] of Object.entries(hostModule)) {
        if (typeof value === 'function') names.push(key);
      }
      sessionState = 'detached';
      return names;
    },

    async attach(hostModule, capabilities, sourceForHash) {
      // V1 WIRING: Fingerprint gate
      const fpResult = verifyFingerprint(hostModule, hostPkg || 'unknown', hostVer || '0.0.0');
      
      recordAuditEvent(`mana.session.${id}`, 'fingerprint_verify', fpResult.verdict, {
        fingerprint: fpResult.fingerprint,
        mismatchType: fpResult.mismatchType,
      });

      if (fpResult.verdict === 'invalid') {
        sessionState = 'detached';
        throw new Error(`[MANA/SESSION:${id}] Attachment denied — invalid fingerprint`);
      }

      let filteredCaps = capabilities;
      if (fpResult.verdict === 'suspect') {
        const limited = new Set(fpResult.limitedCapabilities);
        filteredCaps = capabilities.filter(c => !limited.has(c.capability));
      }

      // Detect recursive layering
      for (const [, val] of Object.entries(hostModule)) {
        if (typeof val === 'function' && (val as unknown as Record<symbol, unknown>)[MANA_LAYER_TAG] === true) {
          parentLayerHash = await computeHash(sourceForHash);
          layerDepth++;
          break;
        }
      }

      sessionState = 'attaching';
      hostSourceHash = await computeHash(sourceForHash);
      attachmentPoints.clear();
      originals.clear();
      telemetry.length = 0;

      const sorted = [...filteredCaps].sort(byPhaseThenName).reverse();

      const capsByFunction = new Map<string, typeof sorted>();
      for (const cap of sorted) {
        const list = capsByFunction.get(cap.functionName) ?? [];
        list.push(cap);
        capsByFunction.set(cap.functionName, list);
      }

      let position = 0;
      for (const [functionName, caps] of Array.from(capsByFunction.entries())) {
        const rawOriginal = hostModule[functionName] as AnyFn;
        if (typeof rawOriginal !== 'function') continue;

        if (!originals.has(functionName)) {
          originals.set(functionName, rawOriginal);
        }

        let wrapped: AnyFn = rawOriginal;
        for (const cap of caps) {
          const { verdict } = lexEvaluate(lex, cap.capability, cap.functionName, config.lexMode, 'attachment');
          if (verdict === 'deny') {
            emitTelemetry(cap.capability, cap.functionName, 'blocked', { reason: 'lex_denied_attachment' }, 'attachment');
            continue;
          }

          const point: AttachmentPoint = {
            functionName: cap.functionName,
            capability: cap.capability,
            phase: CAPABILITY_PHASE[cap.capability] ?? 3,
            position: position++,
            active: true,
            invocations: 0,
            blocked: 0,
            observed: 0,
            rulePayload: cap.rulePayload,
          };
          attachmentPoints.set(`${cap.functionName}:${cap.capability}`, point);

          // V1 WIRING: Execution boundary tracking for safe detach
          const innerWrapped = wrapFunction(wrapped, cap.functionName, cap.capability, point);
          wrapped = function manaBoundaryTracked(this: unknown, ...args: unknown[]) {
            enterExecutionBoundary();
            try {
              const result = (innerWrapped as Function).apply(this, args);
              if (result != null && typeof result === 'object' && typeof (result as Promise<unknown>).then === 'function') {
                return (result as Promise<unknown>).then(
                  (v) => { exitExecutionBoundary(); return v; },
                  (e) => { exitExecutionBoundary(); throw e; },
                );
              }
              exitExecutionBoundary();
              return result;
            } catch (err) {
              exitExecutionBoundary();
              throw err;
            }
          } as AnyFn;
          
          (wrapped as unknown as Record<symbol, unknown>)[MANA_LAYER_TAG] = true;
          emitTelemetry(cap.capability, cap.functionName, 'invoked', {
            action: 'attached', layerDepth, position: point.position, phase: point.phase,
          }, 'attachment');
        }

        hostModule[functionName] = wrapped;
      }

      sessionState = 'symbiotic';
      attachedAt = Date.now();
      detachedAt = null;

      // Auto-register on first boot
      if (fpResult.verdict === 'suspect' && fpResult.expectedFingerprint === null) {
        registerFingerprint(hostPkg, fpResult.fingerprint);
      }

      recordAuditEvent(`mana.session.${id}`, 'attach_complete', 'success', {
        hostPackage: hostPkg, attachmentPointCount: attachmentPoints.size,
      });

      return session.getManifest();
    },

    async detach(hostModule) {
      if (sessionState !== 'symbiotic') {
        throw new Error(`[MANA/SESSION:${id}] Not attached.`);
      }
      sessionState = 'detaching';
      const manifest = session.getManifest();

      recordAuditEvent(`mana.session.${id}`, 'detach_start', 'initiated', {
        hostPackage: hostPkg, attachmentPointCount: attachmentPoints.size,
      });

      const receipt = await safeDetach(hostModule, originals, `${hostPkg}-${id}`, manifest);

      if (!receipt.success) {
        // Fallback: direct restore
        for (const [functionName, originalFn] of Array.from(originals.entries())) {
          hostModule[functionName] = originalFn;
        }
      }

      sessionState = 'detached';
      detachedAt = Date.now();

      recordAuditEvent(`mana.session.${id}`, 'detach_complete', receipt.success ? 'clean' : 'fallback', {
        receiptId: receipt.receiptId,
        restoredFunctions: receipt.restoredFunctions,
        verificationPassed: receipt.verificationPassed,
      });

      originals.clear();
      attachmentPoints.clear();
      if (layerDepth > 0) layerDepth--;
      return manifest;
    },

    async generateProof(sourceForHash) {
      const currentHash = await computeHash(sourceForHash);
      const points = Array.from(attachmentPoints.values());

      // Deterministic sort for proof — by functionName then capability
      points.sort((a, b) =>
        a.functionName.localeCompare(b.functionName) || a.capability.localeCompare(b.capability)
      );

      const capabilities = Array.from(new Set(points.map(p => p.capability))).sort();

      const snapshot = {
        hostPackage: hostPkg,
        hostVersion: hostVer,
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
        hostPackage: hostPkg,
        hostVersion: hostVer,
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
    },

    getManifest() {
      return {
        hostPackage: hostPkg,
        hostVersion: hostVer,
        attachmentState: sessionState,
        attachmentPoints: Array.from(attachmentPoints.values()),
        lexRules: Array.from(lex.rules.values()),
        proof: lastProof,
        telemetry: [...telemetry],
        attachedAt,
        detachedAt,
        layerDepth,
      };
    },

    getTelemetry() { return [...telemetry]; },
    getTelemetrySummary() {
      const summary: Record<string, { invocations: number; blocked: number; observed: number }> = {};
      for (const point of Array.from(attachmentPoints.values())) {
        summary[point.functionName] = {
          invocations: point.invocations,
          blocked: point.blocked,
          observed: point.observed,
        };
      }
      return summary;
    },

    enableTrace() { traceEnabled = true; traceLog = []; },
    disableTrace() { traceEnabled = false; },
    getTrace() { return [...traceLog]; },

    inspectFunction(functionName) {
      const PHASE_NAMES = ['GATE', 'VALIDATE', 'FAILSAFE', 'OBSERVE', 'ANALYZE'];
      const results: Array<{
        capability: ManaCapability; phase: number; phaseName: string;
        position: number; invocations: number; blocked: number; observed: number;
      }> = [];
      for (const point of Array.from(attachmentPoints.values())) {
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
    },

    getExecutionChain(functionName) {
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
    },

    destroy() {
      sessionState = 'detached';
      hostPkg = '';
      hostVer = '';
      hostSourceHash = '';
      attachedAt = null;
      detachedAt = null;
      layerDepth = 0;
      parentLayerHash = null;
      lastProof = null;
      attachmentPoints.clear();
      originals.clear();
      telemetry.length = 0;
      lex.rules.clear();
      lex.idCounter = 0;
      traceLog = [];
      traceEnabled = false;
      assertionsVerified = false;
    },
  };

  return session;
}
