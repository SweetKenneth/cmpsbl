/**
 * DECODE Depth Resolver — vX.IDENTITY.4
 * Controls analytical depth based on access tier.
 *
 * Tone does NOT change. Only layers are appended.
 *
 * LEVEL 1 (CREATOR)    → Summary + scoped impact
 * LEVEL 2 (ARCHITECT)  → + Module attribution, deltas, failure signatures
 * LEVEL 3 (ENTERPRISE) → + Cross-module correlation, snapshots, drift, trend slopes
 *
 * CLM-Granted Upgrades:
 * ✅ [CLM#5]  Context continuity scoring for session coherence
 * ✅ [CLM#18] Architecture pattern awareness tags
 * ✅ [CLM#42] Institutional persuasion depth layers
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
  // CLM#18: Architecture pattern tags
  allowArchitecturePatterns: boolean;
  // CLM#42: Institutional depth
  allowInstitutionalContext: boolean;
}

// ═══ Context Continuity (CLM#5) ═══════════════════════════════════

export interface SessionContinuity {
  sessionId: string;
  messageCount: number;
  topicDrift: number;       // 0-1 how much topic has shifted
  coherenceScore: number;   // 0-1 session coherence
  lastTopicHash: string;
  contextWindowUsed: number; // percentage of context window utilized
}

const sessionContinuityMap = new Map<string, SessionContinuity>();

export function trackSessionContinuity(
  sessionId: string,
  currentTopic: string
): SessionContinuity {
  const existing = sessionContinuityMap.get(sessionId);

  const topicHash = simpleHash(currentTopic.toLowerCase().trim());

  if (!existing) {
    const entry: SessionContinuity = {
      sessionId,
      messageCount: 1,
      topicDrift: 0,
      coherenceScore: 1.0,
      lastTopicHash: topicHash,
      contextWindowUsed: 0.05,
    };
    sessionContinuityMap.set(sessionId, entry);

    // Bound map size — evict oldest entries efficiently
    if (sessionContinuityMap.size > 1000) {
      let evicted = 0;
      for (const key of sessionContinuityMap.keys()) {
        if (evicted >= 200) break;
        sessionContinuityMap.delete(key);
        evicted++;
      }
    }

    return entry;
  }

  existing.messageCount++;

  // Calculate topic drift
  const topicChanged = existing.lastTopicHash !== topicHash;
  if (topicChanged) {
    existing.topicDrift = Math.min(1.0, existing.topicDrift + 0.15);
    existing.coherenceScore = Math.max(0, existing.coherenceScore - 0.1);
  } else {
    existing.topicDrift = Math.max(0, existing.topicDrift - 0.05);
    existing.coherenceScore = Math.min(1.0, existing.coherenceScore + 0.05);
  }

  existing.lastTopicHash = topicHash;
  existing.contextWindowUsed = Math.min(1.0, existing.messageCount * 0.03);

  return existing;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
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

    // LEVEL 2: Attribution + deltas + architecture patterns
    allowCrossModuleCorrelation: level >= 3,
    allowSnapshotCitation: level >= 3,
    allowDriftMetrics: level >= 3,
    allowEventIds: level >= 3,
    allowTrendSlopes: level >= 3,

    // CLM#18: Architecture pattern tags (ARCHITECT+)
    allowArchitecturePatterns: level >= 2,

    // CLM#42: Institutional context (ENTERPRISE only)
    allowInstitutionalContext: level >= 3,

    // STRICT footer only at ENTERPRISE + STRICT mode
    strictFooter: level === 3 && telemetryMode === 'STRICT_TELEMETRY',
  };
}

// ═══ Response Construction ═════════════════════════════════════════

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
  // CLM#18
  architecturePatterns?: string[];
  // CLM#42
  institutionalContext?: string;
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

  // CLM#18: Architecture pattern tags
  if (depth.allowArchitecturePatterns && expansion?.architecturePatterns?.length) {
    lines.push(`Patterns: ${expansion.architecturePatterns.join(' · ')}`);
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

  // CLM#42: Institutional context
  if (depth.allowInstitutionalContext && expansion?.institutionalContext) {
    lines.push(`Institutional signal: ${expansion.institutionalContext}`);
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
 */
export function assembleDecodeResponse(
  globalState: string,
  scopedImpact: string,
  depth: DepthResolution,
  metricsResponse: DecodeMetricsResponse,
  options?: {
    expansion?: Partial<DepthExpansion>;
    governanceBoundary?: string;
    sessionContinuity?: SessionContinuity;
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

  // CLM#5: Session continuity indicator for coherent multi-turn conversations
  if (options?.sessionContinuity && options.sessionContinuity.messageCount > 3) {
    const sc = options.sessionContinuity;
    if (sc.topicDrift > 0.5) {
      sections.push(`[Context shift detected — coherence: ${Math.round(sc.coherenceScore * 100)}%]`);
    }
  }

  return sections.filter(Boolean).join('\n\n');
}
