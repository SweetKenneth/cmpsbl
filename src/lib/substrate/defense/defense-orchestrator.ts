/**
 * DEFENSE Orchestrator v1.0.0
 * Thin non-destructive wrapper around the Virus Protection Suite.
 * Converts passive detection → active runtime enforcement.
 *
 * Rules:
 *  - NEVER modifies existing engines
 *  - Wraps unifiedScan() and interprets verdict
 *  - Executes enforcement actions (terminate, throttle, flag)
 *  - Emits UI-safe events via defense-events bus
 *  - Safe fallback on any failure → allow + log
 */

import {
  unifiedScan,
  quarantineActor,
  type UnifiedScanResult,
  type InputContext,
  type ScanOptions,
} from './virus-protection';

import {
  emitDefenseEvent,
  type DefenseAlertEvent,
} from './defense-events';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DefenseContext {
  actorId: string;
  resource?: string;
  context?: InputContext;
  sessionFingerprint?: string;
  scanOptions?: ScanOptions;
}

export interface DefenseResult {
  readonly allowed: boolean;
  readonly scan: UnifiedScanResult;
  readonly action: EnforcementAction;
  readonly event: DefenseAlertEvent;
  readonly durationMs: number;
}

export type EnforcementAction = 'allow' | 'flag' | 'throttle' | 'block';

// ═══════════════════════════════════════════════════════════════════════════════
// VERDICT → ACTION MAPPING (deterministic, no branching)
// ═══════════════════════════════════════════════════════════════════════════════

const VERDICT_ACTION_MAP: Record<string, EnforcementAction> = {
  blocked:    'block',
  malicious:  'throttle',
  suspicious: 'flag',
  clean:      'allow',
};

// ═══════════════════════════════════════════════════════════════════════════════
// ENFORCEMENT STUBS — safe no-op if downstream not available
// ═══════════════════════════════════════════════════════════════════════════════

/** Bounded quarantine payload store — last 50 payloads */
const quarantinedPayloads: Array<{ hash: number; timestamp: number; sizeBytes: number }> = [];
const MAX_QUARANTINE = 50;

/** Rate-limited actors — actorId → { until, level } */
const rateLimitedActors = new Map<string, { until: number; level: number }>();
const RATE_LIMIT_DURATION_MS = 5 * 60_000; // 5 minutes

/** Flagged actors — actorId → { count, firstFlagged } */
const flaggedActors = new Map<string, { count: number; firstFlagged: number; lastFlagged: number }>();

function terminateSession(actorId: string): void {
  try {
    // Integrate with behavioral engine quarantine
    quarantineActor(actorId, 'DEFENSE orchestrator: blocked verdict', 15 * 60_000);
  } catch {
    // Safe no-op — log internally
    console.debug(`[DEFENSE] terminateSession stub: ${actorId}`);
  }
}

function applyRateLimit(actorId: string): void {
  try {
    const existing = rateLimitedActors.get(actorId);
    const level = existing ? Math.min(existing.level + 1, 5) : 1;
    rateLimitedActors.set(actorId, {
      until: Date.now() + RATE_LIMIT_DURATION_MS * level,
      level,
    });
    // Evict expired entries periodically
    if (rateLimitedActors.size > 500) {
      const now = Date.now();
      for (const [key, val] of rateLimitedActors) {
        if (now > val.until) rateLimitedActors.delete(key);
      }
    }
  } catch {
    console.debug(`[DEFENSE] applyRateLimit stub: ${actorId}`);
  }
}

function markActor(actorId: string): void {
  try {
    const existing = flaggedActors.get(actorId);
    if (existing) {
      existing.count++;
      existing.lastFlagged = Date.now();
    } else {
      flaggedActors.set(actorId, { count: 1, firstFlagged: Date.now(), lastFlagged: Date.now() });
    }
    // Evict old flags (>24h)
    if (flaggedActors.size > 1000) {
      const cutoff = Date.now() - 24 * 60 * 60_000;
      for (const [key, val] of flaggedActors) {
        if (val.lastFlagged < cutoff) flaggedActors.delete(key);
      }
    }
  } catch {
    console.debug(`[DEFENSE] markActor stub: ${actorId}`);
  }
}

function quarantinePayload(input: string): void {
  try {
    // Store only a hash + metadata, NEVER the raw payload
    let hash = 0x811c9dc5;
    for (let i = 0; i < Math.min(input.length, 1000); i++) {
      hash ^= input.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    quarantinedPayloads.push({
      hash,
      timestamp: Date.now(),
      sizeBytes: new Blob([input]).size,
    });
    if (quarantinedPayloads.length > MAX_QUARANTINE) {
      quarantinedPayloads.splice(0, quarantinedPayloads.length - MAX_QUARANTINE);
    }
  } catch {
    console.debug('[DEFENSE] quarantinePayload stub');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRE-FLIGHT CHECKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if an actor is currently rate-limited.
 * Returns remaining ms if limited, 0 if clear.
 */
export function isRateLimited(actorId: string): number {
  const entry = rateLimitedActors.get(actorId);
  if (!entry) return 0;
  const remaining = entry.until - Date.now();
  if (remaining <= 0) {
    rateLimitedActors.delete(actorId);
    return 0;
  }
  return remaining;
}

/**
 * Check if an actor is flagged.
 */
export function isActorFlagged(actorId: string): boolean {
  return flaggedActors.has(actorId);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Execute the full DEFENSE pipeline:
 *  1. Run unifiedScan (all three engines)
 *  2. Map verdict → enforcement action
 *  3. Execute enforcement (terminate/throttle/flag/allow)
 *  4. Emit redacted UI event
 *  5. Return structured result
 *
 * On ANY failure → fallback to allow (fail-open for orchestrator, engines fail-closed).
 */
export function executeDefense(input: string, context: DefenseContext): DefenseResult {
  const start = performance.now();

  try {
    // Pre-flight: if actor is already rate-limited, fast-reject
    const rateLimitRemaining = isRateLimited(context.actorId);
    if (rateLimitRemaining > 0) {
      const blockedScan = unifiedScan('', { actorId: context.actorId });
      const event = emitDefenseEvent({
        actorId: context.actorId,
        verdict: 'blocked',
        riskScore: 100,
        threats: [{ category: 'rate_limited', severity: 'high', description: `Actor rate-limited for ${Math.ceil(rateLimitRemaining / 1000)}s` }],
        behavioralAlertCount: 0,
        actionTaken: 'block',
      });
      return Object.freeze({
        allowed: false,
        scan: blockedScan,
        action: 'block',
        event,
        durationMs: Math.round(performance.now() - start),
      });
    }

    // 1. Run unified scan
    const scan = unifiedScan(input, {
      actorId: context.actorId,
      context: context.context,
      resource: context.resource,
      sessionFingerprint: context.sessionFingerprint,
      scanOptions: context.scanOptions,
    });

    // 2. Map verdict → action
    const action = VERDICT_ACTION_MAP[scan.overallVerdict] || 'allow';

    // 3. Execute enforcement
    switch (action) {
      case 'block':
        terminateSession(context.actorId);
        quarantinePayload(input);
        break;
      case 'throttle':
        applyRateLimit(context.actorId);
        markActor(context.actorId);
        break;
      case 'flag':
        markActor(context.actorId);
        break;
      case 'allow':
      default:
        break;
    }

    // 4. Collect redacted threats for event emission
    const allThreats: Array<{ category: string; severity: string; description: string }> = [];
    for (const t of scan.payload.threats) {
      allThreats.push({ category: t.category, severity: t.severity, description: t.description });
    }
    for (const d of scan.injection.detections) {
      allThreats.push({ category: d.vector, severity: d.severity, description: d.description });
    }
    for (const b of scan.behavioral) {
      allThreats.push({ category: b.category, severity: b.severity, description: b.description });
    }

    // 5. Emit UI event
    const event = emitDefenseEvent({
      actorId: context.actorId,
      verdict: scan.overallVerdict,
      riskScore: scan.overallRiskScore,
      threats: allThreats,
      behavioralAlertCount: scan.behavioral.length,
      actionTaken: action,
    });

    return Object.freeze({
      allowed: action === 'allow' || action === 'flag',
      scan,
      action,
      event,
      durationMs: Math.round(performance.now() - start),
    });
  } catch (err) {
    // FAIL-OPEN for orchestrator — engines already fail-closed internally
    console.error('[DEFENSE] Orchestrator error, failing open:', err);
    const fallbackEvent = emitDefenseEvent({
      actorId: context.actorId,
      verdict: 'clean',
      riskScore: 0,
      threats: [],
      behavioralAlertCount: 0,
      actionTaken: 'allow',
    });
    return Object.freeze({
      allowed: true,
      scan: {} as UnifiedScanResult,
      action: 'allow',
      event: fallbackEvent,
      durationMs: Math.round(performance.now() - start),
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════════════════════════

export function getOrchestratorStats() {
  return {
    version: '1.0.0',
    rateLimitedActors: rateLimitedActors.size,
    flaggedActors: flaggedActors.size,
    quarantinedPayloads: quarantinedPayloads.length,
    maxQuarantine: MAX_QUARANTINE,
    rateLimitDurationMs: RATE_LIMIT_DURATION_MS,
  };
}
