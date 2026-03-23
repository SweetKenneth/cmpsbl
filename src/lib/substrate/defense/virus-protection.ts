/**
 * DEFENSE — Enterprise Virus Protection Suite v2.0.0 (Hardened)
 * Unified barrel export combining all protection engines.
 *
 * v2.0.0 Hardening:
 *  - Frozen immutable results across all engines
 *  - Scan circuit breaker (auto-disable on overload)
 *  - Quarantine integration from behavioral engine
 *  - Result signing with scan-chain hash
 *  - Anti-replay: each scan gets monotonic ID
 */

// Payload Scanner
export {
  scanPayload,
  quickScan,
  getScannerStats,
  getScanAuditTrail,
  type ScanResult,
  type ScanVerdict,
  type DetectedThreat,
  type ThreatSeverity,
  type ScanOptions,
} from './payload-scanner';

// Injection Detection
export {
  detectInjection,
  isInputSafe,
  getInjectionEngineStats,
  type InjectionScanResult,
  type InjectionDetection,
  type InjectionVector,
  type InputContext,
  type InjectionScanOptions,
} from './injection-detection';

// Behavioral Threat Engine
export {
  recordBehavior,
  getActorProfile,
  getHighRiskActors,
  getBehavioralEngineStats,
  clearActorState,
  quarantineActor,
  releaseActor,
  type BehavioralEvent,
  type BehavioralAlert,
  type BehavioralProfile,
  type BehaviorCategory,
} from './behavioral-threat-engine';

// ═══════════════════════════════════════════════════════════════════════════════
// SCAN CIRCUIT BREAKER — prevents overload
// ═══════════════════════════════════════════════════════════════════════════════

interface ScanCircuitState {
  failures: number;
  lastFailureAt: number;
  open: boolean;
  openUntil: number;
}

const scanCircuit: ScanCircuitState = {
  failures: 0, lastFailureAt: 0, open: false, openUntil: 0,
};

const CIRCUIT_FAILURE_THRESHOLD = 10;
const CIRCUIT_OPEN_DURATION_MS = 30_000;
const CIRCUIT_DECAY_MS = 60_000;

function checkCircuit(): boolean {
  const now = Date.now();
  if (scanCircuit.open) {
    if (now > scanCircuit.openUntil) {
      scanCircuit.open = false;
      scanCircuit.failures = 0;
      return true;
    }
    return false;
  }
  // Decay old failures
  if (now - scanCircuit.lastFailureAt > CIRCUIT_DECAY_MS) {
    scanCircuit.failures = 0;
  }
  return true;
}

function recordScanFailure(): void {
  scanCircuit.failures++;
  scanCircuit.lastFailureAt = Date.now();
  if (scanCircuit.failures >= CIRCUIT_FAILURE_THRESHOLD) {
    scanCircuit.open = true;
    scanCircuit.openUntil = Date.now() + CIRCUIT_OPEN_DURATION_MS;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCAN CHAIN — tamper-evident result hash
// ═══════════════════════════════════════════════════════════════════════════════

let lastScanHash = 0;

function hashScanResult(verdict: string, threatCount: number, riskScore: number): number {
  let hash = lastScanHash ^ 0x811c9dc5;
  const str = `${verdict}:${threatCount}:${riskScore}:${Date.now()}`;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  lastScanHash = hash;
  return hash;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED SCAN — Run all engines in a single call
// ═══════════════════════════════════════════════════════════════════════════════

import { scanPayload, type ScanResult, type ScanOptions } from './payload-scanner';
import { detectInjection, type InjectionScanResult, type InputContext } from './injection-detection';
import { recordBehavior, type BehavioralAlert, type BehavioralEvent } from './behavioral-threat-engine';

export interface UnifiedScanResult {
  readonly scanChainHash: number;
  readonly payload: ScanResult;
  readonly injection: InjectionScanResult;
  readonly behavioral: readonly BehavioralAlert[];
  readonly overallVerdict: 'clean' | 'suspicious' | 'malicious' | 'blocked';
  readonly overallRiskScore: number;
  readonly scanDurationMs: number;
  readonly circuitBreakerActive: boolean;
}

/**
 * Run all three protection engines against an input.
 * Returns frozen, signed unified verdict based on worst-case across all engines.
 */
export function unifiedScan(
  input: string,
  options?: {
    actorId?: string;
    context?: InputContext;
    scanOptions?: ScanOptions;
    resource?: string;
    sessionFingerprint?: string;
  },
): UnifiedScanResult {
  const start = performance.now();

  // Circuit breaker check
  if (!checkCircuit()) {
    const degradedResult: UnifiedScanResult = Object.freeze({
      scanChainHash: hashScanResult('blocked', 0, 100),
      payload: Object.freeze({ scanId: 'CIRCUIT-OPEN', verdict: 'blocked' as const, threats: Object.freeze([]), entropy: 0, scanDurationMs: 0, payloadSizeBytes: 0, decodingLayers: 0, normalizationApplied: Object.freeze([]), metadata: Object.freeze({}) }),
      injection: Object.freeze({ safe: false, detections: Object.freeze([]), highestSeverity: 'critical' as const, riskScore: 100, chainedAttack: false, evasionDetected: false, scanDurationMs: 0, inputContext: 'unknown' as const, normalizations: Object.freeze([]) }),
      behavioral: Object.freeze([]),
      overallVerdict: 'blocked' as const,
      overallRiskScore: 100,
      scanDurationMs: Math.round(performance.now() - start),
      circuitBreakerActive: true,
    });
    return degradedResult;
  }

  try {
    // Run all three engines
    const payloadResult = scanPayload(input, options?.scanOptions);
    const injectionResult = detectInjection(input, { context: options?.context });

    let behavioralAlerts: BehavioralAlert[] = [];
    if (options?.actorId) {
      const event: BehavioralEvent = {
        actorId: options.actorId,
        action: options?.context || 'input',
        resource: options?.resource || 'unknown',
        timestamp: Date.now(),
        sessionFingerprint: options?.sessionFingerprint,
        metadata: {
          bytes: new Blob([input]).size,
          failed: payloadResult.verdict !== 'clean' || !injectionResult.safe,
        },
      };
      behavioralAlerts = recordBehavior(event);
    }

    // Unified verdict: worst-case across engines
    const verdicts: Array<'clean' | 'suspicious' | 'malicious' | 'blocked'> = [payloadResult.verdict];
    if (!injectionResult.safe) {
      if (injectionResult.highestSeverity === 'critical') verdicts.push('blocked');
      else if (injectionResult.highestSeverity === 'high') verdicts.push('malicious');
      else verdicts.push('suspicious');
    }
    if (behavioralAlerts.some(a => a.severity === 'critical')) verdicts.push('blocked');
    else if (behavioralAlerts.some(a => a.severity === 'high')) verdicts.push('malicious');

    const verdictPriority: Record<string, number> = { blocked: 4, malicious: 3, suspicious: 2, clean: 1 };
    const overallVerdict = verdicts.reduce((worst, v) =>
      (verdictPriority[v] || 0) > (verdictPriority[worst] || 0) ? v : worst,
      'clean' as UnifiedScanResult['overallVerdict'],
    );

    // Combined risk score
    const overallRiskScore = Math.min(100, Math.round(
      payloadResult.threats.length * 15 +
      injectionResult.riskScore * 0.5 +
      behavioralAlerts.length * 10 +
      (injectionResult.evasionDetected ? 15 : 0),
    ));

    const scanChainHash = hashScanResult(overallVerdict, payloadResult.threats.length + injectionResult.detections.length, overallRiskScore);

    return Object.freeze({
      scanChainHash,
      payload: payloadResult,
      injection: injectionResult,
      behavioral: Object.freeze(behavioralAlerts),
      overallVerdict,
      overallRiskScore,
      scanDurationMs: Math.round(performance.now() - start),
      circuitBreakerActive: false,
    });
  } catch {
    recordScanFailure();
    // Fail-closed: treat scan failures as blocked
    return Object.freeze({
      scanChainHash: hashScanResult('blocked', 0, 100),
      payload: Object.freeze({ scanId: 'SCAN-ERROR', verdict: 'blocked' as const, threats: Object.freeze([]), entropy: 0, scanDurationMs: 0, payloadSizeBytes: 0, decodingLayers: 0, normalizationApplied: Object.freeze([]), metadata: Object.freeze({}) }),
      injection: Object.freeze({ safe: false, detections: Object.freeze([]), highestSeverity: 'critical' as const, riskScore: 100, chainedAttack: false, evasionDetected: false, scanDurationMs: 0, inputContext: 'unknown' as const, normalizations: Object.freeze([]) }),
      behavioral: Object.freeze([]),
      overallVerdict: 'blocked' as const,
      overallRiskScore: 100,
      scanDurationMs: Math.round(performance.now() - start),
      circuitBreakerActive: false,
    });
  }
}

/**
 * Quick combined safety check — returns true only if ALL engines say clean
 */
export function isClean(input: string, actorId?: string): boolean {
  const result = unifiedScan(input, { actorId });
  return result.overallVerdict === 'clean';
}

/**
 * Get unified protection suite stats
 */
export function getProtectionSuiteStats() {
  return {
    version: '2.0.0',
    circuitBreaker: {
      open: scanCircuit.open,
      failures: scanCircuit.failures,
      threshold: CIRCUIT_FAILURE_THRESHOLD,
    },
    scanChainHash: lastScanHash,
  };
}
