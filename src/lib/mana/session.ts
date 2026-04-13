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
  ManaConfig,
  ManaManifest,
  ManaProof,
  ManaTelemetryEvent,
  LexRule,
  LexVerdict,
  LexEvalContext,
  AnyFn,
} from './types';
import { CAPABILITY_PHASE, WrapperPhase } from './types';

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
  capability: ManaCapability,
  target: string,
  verdict: LexVerdict,
  reason: string,
  priority = 100,
): LexRule {
  lex.idCounter++;
  const rule: LexRule = {
    id: `lex-${Date.now().toString(36)}-${lex.idCounter.toString(36)}`,
    capability,
    target,
    verdict,
    reason,
    createdAt: Date.now(),
    priority,
  };
  lex.rules.set(rule.id, rule);
  return rule;
}

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
    const capMatch = rule.capability === capability || rule.capability === ('*' as ManaCapability);
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
  registerRule(capability: ManaCapability, target: string, verdict: LexVerdict, reason: string, priority?: number): LexRule;
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
  detach(hostModule: Record<string, unknown>): ManaManifest;

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
    invocations: number; blocked: number; observed: number;
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
    telemetry.push({ timestamp: Date.now(), capability, functionName, action, evalContext, metadata });
    if (telemetry.length > config.maxTelemetryEvents) {
      telemetry.splice(0, telemetry.length - config.maxTelemetryEvents);
    }
    if (traceEnabled) {
      traceLog.push(`[${new Date().toISOString()}] ${action.toUpperCase()} ${capability}::${functionName}${evalContext ? ` (${evalContext})` : ''}${metadata ? ` ${JSON.stringify(metadata)}` : ''}`);
    }
  }

  /** Simplified wrapper factory — uses session-scoped Lex */
  function wrapFunction(
    originalFn: AnyFn, functionName: string, capability: ManaCapability, point: AttachmentPoint,
  ): AnyFn {
    const phase = CAPABILITY_PHASE[capability] ?? WrapperPhase.OBSERVE;

    // GATE phase — blocking
    if (phase === WrapperPhase.GATE) {
      return function manaSessionGate(this: unknown, ...args: unknown[]) {
        point.invocations++;
        const { verdict } = lexEvaluate(lex, capability, functionName, config.lexMode, 'runtime');
        if (verdict === 'deny') {
          point.blocked++;
          emitTelemetry(capability, functionName, 'blocked', { reason: `${capability}_denied` }, 'runtime');
          throw new Error(`[MANA/${capability.toUpperCase()}] ${functionName} blocked by Lex`);
        }
        if (verdict === 'observe') {
          point.observed++;
          emitTelemetry(capability, functionName, 'observed', { note: 'Lex observation' }, 'runtime');
        }
        return originalFn.apply(this, args);
      } as AnyFn;
    }

    // VALIDATE phase
    if (phase === WrapperPhase.VALIDATE) {
      return function manaSessionValidate(this: unknown, ...args: unknown[]) {
        point.invocations++;
        emitTelemetry(capability, functionName, 'invoked', { argCount: args.length });
        return originalFn.apply(this, args);
      } as AnyFn;
    }

    // FAILSAFE phase
    if (phase === WrapperPhase.FAILSAFE) {
      return function manaSessionFailsafe(this: unknown, ...args: unknown[]) {
        point.invocations++;
        try {
          const result = originalFn.apply(this, args);
          if (result && typeof result === 'object' && typeof (result as Promise<unknown>).then === 'function') {
            return (result as Promise<unknown>).catch((err: unknown) => {
              point.observed++;
              emitTelemetry(capability, functionName, 'observed', { error: (err as Error)?.message?.slice(0, 80) });
              return undefined;
            });
          }
          return result;
        } catch (err) {
          point.observed++;
          emitTelemetry(capability, functionName, 'observed', { error: (err as Error)?.message?.slice(0, 80) });
          return undefined;
        }
      } as AnyFn;
    }

    // ANALYZE phase
    if (phase === WrapperPhase.ANALYZE) {
      return function manaSessionAnalyze(this: unknown, ...args: unknown[]) {
        point.invocations++;
        const start = performance.now();
        const result = originalFn.apply(this, args);
        if (result && typeof (result as Promise<unknown>).then === 'function') {
          return (result as Promise<unknown>).then(resolved => {
            emitTelemetry(capability, functionName, 'observed', {
              durationMs: Math.round((performance.now() - start) * 100) / 100,
            });
            return resolved;
          });
        }
        emitTelemetry(capability, functionName, 'observed', {
          durationMs: Math.round((performance.now() - start) * 100) / 100,
        });
        return result;
      } as AnyFn;
    }

    // OBSERVE phase (default)
    return function manaSessionObserve(this: unknown, ...args: unknown[]) {
      point.invocations++;
      const start = performance.now();
      const result = originalFn.apply(this, args);
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        return (result as Promise<unknown>).then(resolved => {
          emitTelemetry(capability, functionName, 'observed', {
            durationMs: Math.round((performance.now() - start) * 100) / 100,
            argCount: args.length,
          });
          return resolved;
        });
      }
      emitTelemetry(capability, functionName, 'observed', {
        durationMs: Math.round((performance.now() - start) * 100) / 100,
        argCount: args.length,
      });
      return result;
    } as AnyFn;
  }

  // ── Public Session API ──
  const session: ManaSession = {
    get id() { return id; },
    get hostPackage() { return hostPkg; },

    configure(partial) {
      config = { ...config, ...partial };
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
      // Detect recursive layering
      for (const [, val] of Object.entries(hostModule)) {
        if (typeof val === 'function' && val.name?.startsWith('mana')) {
          parentLayerHash = await computeHash(sourceForHash);
          layerDepth++;
        }
      }

      sessionState = 'attaching';
      hostSourceHash = await computeHash(sourceForHash);
      attachmentPoints.clear();
      originals.clear();
      telemetry.length = 0;

      const sorted = [...capabilities].sort((a, b) =>
        (CAPABILITY_PHASE[a.capability] ?? 3) - (CAPABILITY_PHASE[b.capability] ?? 3),
      );

      for (const cap of sorted) {
        const originalFn = hostModule[cap.functionName] as AnyFn;
        if (typeof originalFn !== 'function') continue;

        const { verdict } = lexEvaluate(lex, cap.capability, cap.functionName, config.lexMode, 'attachment');
        if (verdict === 'deny') {
          emitTelemetry(cap.capability, cap.functionName, 'blocked', { reason: 'lex_denied_attachment' }, 'attachment');
          continue;
        }

        if (!originals.has(cap.functionName)) {
          originals.set(cap.functionName, originalFn);
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

        hostModule[cap.functionName] = wrapFunction(originalFn, cap.functionName, cap.capability, point);
        emitTelemetry(cap.capability, cap.functionName, 'invoked', { action: 'attached', layerDepth }, 'attachment');
      }

      sessionState = 'symbiotic';
      attachedAt = Date.now();
      detachedAt = null;
      return session.getManifest();
    },

    detach(hostModule) {
      if (sessionState !== 'symbiotic') {
        throw new Error(`[MANA/SESSION:${id}] Not attached.`);
      }
      sessionState = 'detaching';
      for (const [functionName, originalFn] of originals.entries()) {
        hostModule[functionName] = originalFn;
      }
      sessionState = 'detached';
      detachedAt = Date.now();
      const manifest = session.getManifest();
      originals.clear();
      attachmentPoints.clear();
      if (layerDepth > 0) layerDepth--;
      return manifest;
    },

    async generateProof(sourceForHash) {
      const currentHash = await computeHash(sourceForHash);
      const points = Array.from(attachmentPoints.values());
      const capabilities = [...new Set(points.map(p => p.capability))];
      const manifestForHash = { hostPackage: hostPkg, hostVersion: hostVer, attachmentState: sessionState, attachmentPoints: points, layerDepth };
      const manifestHash = await computeHash(JSON.stringify(manifestForHash));

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
      for (const point of attachmentPoints.values()) {
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
        invocations: number; blocked: number; observed: number;
      }> = [];
      for (const point of attachmentPoints.values()) {
        if (point.functionName === functionName) {
          results.push({
            capability: point.capability,
            phase: point.phase,
            phaseName: PHASE_NAMES[point.phase] ?? 'UNKNOWN',
            invocations: point.invocations,
            blocked: point.blocked,
            observed: point.observed,
          });
        }
      }
      return results.sort((a, b) => a.phase - b.phase);
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
    },
  };

  return session;
}
