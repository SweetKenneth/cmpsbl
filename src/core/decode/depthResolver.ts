/**
 * DECODE Depth Resolver — vX.IDENTITY.3
 * Controls analytical depth based on access tier.
 *
 * Tone does NOT change. Only layers are appended.
 *
 * LEVEL 1 (CREATOR)    → Summary + scoped impact
 * LEVEL 2 (ARCHITECT)  → + Module attribution, deltas, failure signatures
 * LEVEL 3 (ENTERPRISE) → + Cross-module correlation, snapshots, drift, trend slopes
 */

import type { DecodeMetricsResponse } from './decodeAccessPolicy';

// ═══ Types ═════════════════════════════════════════════════════════

export type UserTier = 'CREATOR' | 'ARCHITECT' | 'ENTERPRISE';
export type DepthLevel = 1 | 2 | 3;
export type TelemetryMode = 'NARRATIVE_ONLY' | 'HYBRID' | 'STRICT_TELEMETRY';

export interface DepthResolution {
  level: DepthLevel;
  tier: UserTier;
  allowCrossModuleCorrelation: boolean;
  allowSnapshotCitation: boolean;
  allowDriftMetrics: boolean;
  allowEventIds: boolean;
  allowTrendSlopes: boolean;
  allowFailureSignatures: boolean;
  allowModuleAttribution: boolean;
  allowRawCounts: boolean;
  strictFooter: boolean;
}

// ═══ Resolver ══════════════════════════════════════════════════════

const TIER_TO_LEVEL: Record<UserTier, DepthLevel> = {
  CREATOR: 1,
  ARCHITECT: 2,
  ENTERPRISE: 3,
};

/**
 * Resolve the depth level for a given user tier and telemetry mode.
 * Depth is purely additive — higher tiers see more layers, not different tone.
 */
export function resolveDepth(
  userTier: UserTier,
  telemetryMode: TelemetryMode = 'HYBRID'
): DepthResolution {
  const level = TIER_TO_LEVEL[userTier];

  return {
    level,
    tier: userTier,

    // LEVEL 1: Summary only
    allowModuleAttribution: level >= 2,
    allowFailureSignatures: level >= 2,
    allowRawCounts: level >= 2,

    // LEVEL 2: Attribution + deltas
    allowCrossModuleCorrelation: level >= 3,
    allowSnapshotCitation: level >= 3,
    allowDriftMetrics: level >= 3,
    allowEventIds: level >= 3,
    allowTrendSlopes: level >= 3,

    // STRICT footer only at ENTERPRISE + STRICT mode
    strictFooter: level === 3 && telemetryMode === 'STRICT_TELEMETRY',
  };
}

// ═══ Response Construction ═════════════════════════════════════════

/**
 * DECODE response construction order (all tiers):
 *
 * 1. Global state statement
 * 2. Scoped lens impact
 * 3. Depth expansion (tier-based)
 * 4. Governance boundary (if applicable)
 * 5. Optional STRICT footer (ENTERPRISE only)
 */

export interface DepthExpansion {
  moduleAttribution?: string;
  deltas?: string;
  failureSignatures?: string;
  scopedEventCounts?: string;
  crossModuleCorrelation?: string;
  snapshotCitation?: string;
  integrityResult?: string;
  driftPercent?: string;
  correlationIds?: string[];
  trendSlope?: string;
  eventWindow?: string;
}

/**
 * Build the depth expansion block for a DECODE response.
 * Only includes layers allowed by the resolved depth.
 */
export function buildDepthExpansion(
  depth: DepthResolution,
  metricsResponse: DecodeMetricsResponse,
  expansion?: Partial<DepthExpansion>
): string {
  const lines: string[] = [];

  // LEVEL 2+: Module attribution
  if (depth.allowModuleAttribution && expansion?.moduleAttribution) {
    lines.push(expansion.moduleAttribution);
  }

  if (depth.allowFailureSignatures && expansion?.failureSignatures) {
    lines.push(expansion.failureSignatures);
  }

  if (depth.allowRawCounts && expansion?.scopedEventCounts) {
    lines.push(expansion.scopedEventCounts);
  }

  if (depth.allowRawCounts && expansion?.deltas) {
    lines.push(expansion.deltas);
  }

  // LEVEL 3: Cross-module + snapshots + drift
  if (depth.allowCrossModuleCorrelation && expansion?.crossModuleCorrelation) {
    lines.push(expansion.crossModuleCorrelation);
  }

  if (depth.allowTrendSlopes && expansion?.trendSlope) {
    lines.push(`Trend slope: ${expansion.trendSlope}`);
  }

  if (depth.allowEventIds && expansion?.correlationIds?.length) {
    lines.push(`Correlation IDs: ${expansion.correlationIds.join(', ')}`);
  }

  // STRICT footer (ENTERPRISE + STRICT_TELEMETRY only)
  if (depth.strictFooter && metricsResponse.snapshot) {
    const snapshot = metricsResponse.snapshot;
    const integrity = metricsResponse.integrity;
    const driftStr = expansion?.driftPercent ?? '0.0%';
    const windowStr = expansion?.eventWindow ?? '24h';

    lines.push('');
    lines.push(`[Snapshot: ${snapshot.timestamp}]`);
    lines.push(`[Scope: GLOBAL]`);
    lines.push(`[Integrity: ${integrity?.valid ? 'VALID' : 'MISMATCH DETECTED'}]`);
    lines.push(`[Drift: ${driftStr}]`);
    lines.push(`[Event Window: ${windowStr}]`);
  }

  return lines.join('\n');
}

/**
 * Assemble a full DECODE response following the mandated construction order.
 *
 * 1. Global state statement
 * 2. Scoped lens impact
 * 3. Depth expansion
 * 4. Governance boundary
 * 5. Optional STRICT footer
 */
export function assembleDecodeResponse(
  globalState: string,
  scopedImpact: string,
  depth: DepthResolution,
  metricsResponse: DecodeMetricsResponse,
  options?: {
    expansion?: Partial<DepthExpansion>;
    governanceBoundary?: string;
  }
): string {
  const sections: string[] = [globalState, scopedImpact];

  const depthBlock = buildDepthExpansion(
    depth,
    metricsResponse,
    options?.expansion
  );
  if (depthBlock) {
    sections.push(depthBlock);
  }

  if (options?.governanceBoundary) {
    sections.push(options.governanceBoundary);
  }

  return sections.filter(Boolean).join('\n\n');
}
