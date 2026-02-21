/**
 * Clockless Habitat — Decode Interface
 * vX.UI.ULTIMATE
 *
 * Sovereign DECODE integration for habitat.
 * Default: silent. Speaks only when addressed or on threshold breach.
 */

import {
  queryMetricsForDecode,
  formatDecodeResponse,
  getDecodeMode,
} from '@/core/goal';
import { validateTone, enforceTone } from '@/core/decode/voiceProfile';
import { resolveDepth, type UserTier } from '@/core/decode/depthResolver';
import type { NamespaceContext } from './namespaceLens';
import type { HabitatIntegrity } from './integrityLayer';

// ═══ Types ═════════════════════════════════════════════════════════

export interface DecodeUtterance {
  content: string;
  timestamp: string;
  trigger: 'user_query' | 'integrity_mismatch' | 'escalation_threshold' | 'repair_collapse';
  metadata: {
    snapshotId: string | null;
    integrityState: string;
    driftPercent: number;
    tier: UserTier;
    depthLevel: number;
  };
}

export interface DecodeAutoWatchConfig {
  enabled: boolean;
  integrityMismatchThreshold: boolean;
  escalationThreshold: number;
  repairVelocityCollapseThreshold: number;
}

// ═══ Defaults ═════════════════════════════════════════════════════

const DEFAULT_AUTOWATCH: DecodeAutoWatchConfig = {
  enabled: false,
  integrityMismatchThreshold: true,
  escalationThreshold: 10,
  repairVelocityCollapseThreshold: 0.5,
};

// ═══ State ═════════════════════════════════════════════════════════

let autoWatchConfig = { ...DEFAULT_AUTOWATCH };
const utteranceLog: DecodeUtterance[] = [];

// ═══ Public API ════════════════════════════════════════════════════

export function configureAutoWatch(config: Partial<DecodeAutoWatchConfig>): void {
  autoWatchConfig = { ...autoWatchConfig, ...config };
}

export function getAutoWatchConfig(): DecodeAutoWatchConfig {
  return { ...autoWatchConfig };
}

/**
 * User-addressed DECODE query within the habitat.
 * Follows: resolve namespace → pull snapshot → validate integrity → respond sovereign.
 */
export async function queryDecode(
  content: string,
  namespace: NamespaceContext,
  integrity: HabitatIntegrity
): Promise<DecodeUtterance> {
  const metricsResponse = await queryMetricsForDecode();
  const depth = resolveDepth(namespace.tier, getDecodeMode());

  let reply: string;
  if (!metricsResponse.allowed) {
    reply = metricsResponse.blockReason ?? 'No telemetry available.';
  } else {
    // Format with GOAL governance
    reply = formatDecodeResponse(content, metricsResponse);
  }

  // Enforce tone
  const toneCheck = validateTone(reply);
  if (!toneCheck.valid) {
    reply = enforceTone(reply);
  }

  const utterance: DecodeUtterance = {
    content: reply,
    timestamp: new Date().toISOString(),
    trigger: 'user_query',
    metadata: {
      snapshotId: metricsResponse.snapshot?.snapshotId ?? null,
      integrityState: integrity.state,
      driftPercent: integrity.driftPercent,
      tier: namespace.tier,
      depthLevel: depth.level,
    },
  };

  utteranceLog.push(utterance);
  return utterance;
}

/**
 * Check if autowatch should produce an utterance.
 */
export function checkAutoWatch(
  integrity: HabitatIntegrity,
  escalationCount: number,
  repairVelocity: number
): DecodeUtterance | null {
  if (!autoWatchConfig.enabled) return null;

  let trigger: DecodeUtterance['trigger'] | null = null;
  let content = '';

  if (autoWatchConfig.integrityMismatchThreshold && integrity.state === 'MISMATCH') {
    trigger = 'integrity_mismatch';
    content = `Integrity mismatch detected across ${integrity.discrepancyCount} check points. Drift at ${integrity.driftPercent}%. Review required.`;
  } else if (escalationCount >= autoWatchConfig.escalationThreshold) {
    trigger = 'escalation_threshold';
    content = `Escalation threshold breached. ${escalationCount} escalations in current window. System pressure elevated.`;
  } else if (repairVelocity <= autoWatchConfig.repairVelocityCollapseThreshold && repairVelocity > 0) {
    trigger = 'repair_collapse';
    content = `Repair velocity collapsed to ${repairVelocity.toFixed(1)}/hr. Self-healing capacity degraded.`;
  }

  if (!trigger) return null;

  const utterance: DecodeUtterance = {
    content,
    timestamp: new Date().toISOString(),
    trigger,
    metadata: {
      snapshotId: null,
      integrityState: integrity.state,
      driftPercent: integrity.driftPercent,
      tier: 'ENTERPRISE',
      depthLevel: 3,
    },
  };

  utteranceLog.push(utterance);
  return utterance;
}

export function getRecentUtterances(limit = 10): DecodeUtterance[] {
  return utteranceLog.slice(-limit);
}
