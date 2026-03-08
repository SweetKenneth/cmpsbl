/**
 * GOAL — DECODE Access Policy
 * Governs how DECODE queries and narrativizes system metrics.
 * vX.STRUCTURE.2
 *
 * Modes:
 *   NARRATIVE_ONLY — No numeric backing required
 *   HYBRID — Numeric when available, narrative fallback (DEFAULT)
 *   STRICT_TELEMETRY — No responses without numeric backing
 */

import { getAllLiveMetrics } from '../metrics/metricsRegistry';
import { getLatestSnapshot } from '../metrics/snapshotEngine';
import { runIntegrityCheck, shouldBlockDecodeForModule } from '../metrics/integrityValidator';
import { getCachedIntegrity, cacheIntegrity } from './integrityCache';
import { validateTone, enforceTone } from './voiceProfile';
import type { ModuleLiveMetrics } from '../metrics/metricsSchema';
import type { MetricSnapshot } from '../metrics/snapshotEngine';
import type { IntegrityReport } from '../metrics/integrityValidator';

// ═══ Types ════════════════════════════════════════════════════════

export type DecodeMode = 'NARRATIVE_ONLY' | 'HYBRID' | 'STRICT_TELEMETRY';

export interface DecodeMetricsQuery {
  moduleId?: string;
  metricNames?: string[];
}

export interface DecodeMetricsResponse {
  allowed: boolean;
  mode: DecodeMode;
  liveMetrics: Map<string, ModuleLiveMetrics> | null;
  snapshot: MetricSnapshot | null;
  integrity: IntegrityReport | null;
  blockReason?: string;
  mismatchWarning?: string;
}

// ═══ State ═════════════════════════════════════════════════════════

let currentMode: DecodeMode = 'HYBRID';

export function setDecodeMode(mode: DecodeMode): void {
  currentMode = mode;
}

export function getDecodeMode(): DecodeMode {
  return currentMode;
}

// ═══ Access Policy ════════════════════════════════════════════════

/**
 * DECODE queries system metrics through this single entry point.
 *
 * 1. Pull live metrics from registry
 * 2. Pull last snapshot
 * 3. Validate numeric consistency via integrityValidator
 * 4. Only then allow narrativization
 */
export async function queryMetricsForDecode(
  query?: DecodeMetricsQuery
): Promise<DecodeMetricsResponse> {
  // NARRATIVE_ONLY mode skips all checks
  if (currentMode === 'NARRATIVE_ONLY') {
    return {
      allowed: true,
      mode: currentMode,
      liveMetrics: null,
      snapshot: null,
      integrity: null,
    };
  }

  // Step 1: Pull live metrics
  const liveMetrics = await getAllLiveMetrics();

  // Step 2: Pull last snapshot
  const snapshot = getLatestSnapshot();

  // Step 3: Run integrity validation (with cache)
  let integrity = getCachedIntegrity();
  if (!integrity) {
    integrity = await runIntegrityCheck();
    cacheIntegrity(integrity);
  }

  // Step 4: Check for module-specific blocks
  if (query?.moduleId) {
    const blockCheck = await shouldBlockDecodeForModule(query.moduleId);
    if (blockCheck.blocked && currentMode === 'STRICT_TELEMETRY') {
      return {
        allowed: false,
        mode: currentMode,
        liveMetrics,
        snapshot,
        integrity,
        blockReason: blockCheck.reason,
      };
    }

    // In HYBRID mode, warn but allow
    if (blockCheck.blocked) {
      return {
        allowed: true,
        mode: currentMode,
        liveMetrics,
        snapshot,
        integrity,
        mismatchWarning: `Metric mismatch detected for module "${query.moduleId}": ${blockCheck.reason}`,
      };
    }
  }

  // In STRICT_TELEMETRY mode, check if we have ANY data
  if (currentMode === 'STRICT_TELEMETRY') {
    if (liveMetrics.size === 0 && !snapshot) {
      return {
        allowed: false,
        mode: currentMode,
        liveMetrics,
        snapshot,
        integrity,
        blockReason: 'No telemetry available.',
      };
    }

    // Check global integrity
    if (!integrity.valid) {
      const mismatchModules = integrity.discrepancies
        .filter(d => d.type === 'cross_module_mismatch')
        .map(d => `${d.moduleA} ↔ ${d.moduleB}`)
        .join(', ');

      if (mismatchModules) {
        return {
          allowed: false,
          mode: currentMode,
          liveMetrics,
          snapshot,
          integrity,
          blockReason: `Metric mismatch detected between [${mismatchModules}]. Integrity review required.`,
        };
      }
    }
  }

  return {
    allowed: true,
    mode: currentMode,
    liveMetrics,
    snapshot,
    integrity,
    mismatchWarning: !integrity.valid
      ? `Integrity issues detected: ${integrity.discrepancies.length} discrepancies found.`
      : undefined,
  };
}

/**
 * Format a DECODE response with proper telemetry citation.
 * In STRICT_TELEMETRY mode, all responses must cite snapshotId + timestamp.
 * Voice profile enforcement is applied before returning.
 */
export function formatDecodeResponse(
  narrative: string,
  metricsResponse: DecodeMetricsResponse
): string {
  // Import inline to avoid circular deps at module level
  const { validateTone, enforceTone } = require('./voiceProfile');

  if (!metricsResponse.allowed) {
    return metricsResponse.blockReason ?? 'No telemetry available.';
  }

  // Enforce immutable voice profile — strip assistant tone drift
  let output = narrative;
  const toneCheck = validateTone(output);
  if (!toneCheck.valid) {
    output = enforceTone(output);
  }

  if (currentMode === 'STRICT_TELEMETRY' && metricsResponse.snapshot) {
    const snapshot = metricsResponse.snapshot;
    const integrity = metricsResponse.integrity;
    return [
      output,
      '',
      `[Snapshot: ${snapshot.timestamp}]`,
      `[Scope: GLOBAL]`,
      `[Integrity: ${integrity?.valid ? 'VALID' : 'MISMATCH DETECTED'}]`,
    ].join('\n');
  }

  if (metricsResponse.mismatchWarning) {
    return `${output}\n\n⚠ ${metricsResponse.mismatchWarning}`;
  }

  return output;
}
