/**
 * DEFENSE — Enterprise Virus Protection Suite v1.0.0
 * Unified barrel export combining all protection engines.
 *
 * Three engines:
 *  1. Payload Scanner — malware signatures, entropy, polyglot, encoding
 *  2. Injection Detection — SQLi, XSS, SSRF, cmd injection, template, proto pollution
 *  3. Behavioral Threat Engine — anomaly detection, exfiltration, lateral movement
 */

// Payload Scanner
export {
  scanPayload,
  quickScan,
  getScannerStats,
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
  type BehavioralEvent,
  type BehavioralAlert,
  type BehavioralProfile,
  type BehaviorCategory,
} from './behavioral-threat-engine';

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED SCAN — Run all engines in a single call
// ═══════════════════════════════════════════════════════════════════════════════

import { scanPayload, type ScanResult, type ScanOptions } from './payload-scanner';
import { detectInjection, type InjectionScanResult, type InputContext } from './injection-detection';
import { recordBehavior, type BehavioralAlert, type BehavioralEvent } from './behavioral-threat-engine';

export interface UnifiedScanResult {
  payload: ScanResult;
  injection: InjectionScanResult;
  behavioral: BehavioralAlert[];
  overallVerdict: 'clean' | 'suspicious' | 'malicious' | 'blocked';
  overallRiskScore: number;
  scanDurationMs: number;
}

/**
 * Run all three protection engines against an input.
 * Returns unified verdict based on worst-case across all engines.
 */
export function unifiedScan(
  input: string,
  options?: {
    actorId?: string;
    context?: InputContext;
    scanOptions?: ScanOptions;
    resource?: string;
  },
): UnifiedScanResult {
  const start = performance.now();

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
      metadata: {
        bytes: new Blob([input]).size,
        failed: payloadResult.verdict !== 'clean' || !injectionResult.safe,
      },
    };
    behavioralAlerts = recordBehavior(event);
  }

  // Unified verdict: worst-case across engines
  const verdicts = [payloadResult.verdict];
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
    behavioralAlerts.length * 10,
  ));

  return {
    payload: payloadResult,
    injection: injectionResult,
    behavioral: behavioralAlerts,
    overallVerdict,
    overallRiskScore,
    scanDurationMs: Math.round(performance.now() - start),
  };
}

/**
 * Quick combined safety check — returns true only if ALL engines say clean
 */
export function isClean(input: string, actorId?: string): boolean {
  const result = unifiedScan(input, { actorId });
  return result.overallVerdict === 'clean';
}
