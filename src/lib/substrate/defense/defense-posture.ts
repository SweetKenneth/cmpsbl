/**
 * DEFENSE — Posture Dashboard Engine v1.0.0
 * Real-time security posture grade, attack timeline, and enforcement history.
 *
 * Aggregates signals from all DEFENSE subsystems into a unified posture score.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type PostureGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface SecurityPosture {
  readonly grade: PostureGrade;
  readonly score: number;                   // 0-100
  readonly timestamp: number;
  readonly dimensions: PostureDimensions;
  readonly activeThreats: number;
  readonly recentBlocks: number;
  readonly lockdownLevel: string;
  readonly recommendations: readonly string[];
}

export interface PostureDimensions {
  readonly authentication: number;          // 0-100
  readonly rateProtection: number;
  readonly threatDetection: number;
  readonly encryptionCompliance: number;
  readonly incidentResponse: number;
  readonly meshIntegrity: number;
  readonly dataProtection: number;
  readonly intelligenceCoverage: number;
}

export interface AttackTimelineEntry {
  readonly id: string;
  readonly timestamp: number;
  readonly type: string;
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly actorId: string | null;
  readonly description: string;
  readonly action: string;
  readonly resolved: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_TIMELINE = 200;
const timeline: AttackTimelineEntry[] = [];
const postureHistory: Array<{ timestamp: number; score: number; grade: PostureGrade }> = [];
const MAX_HISTORY = 100;
let timelineSeq = 0;

// Dimension scores (updated by subsystem integrations)
const dimensions: Record<string, number> = {
  authentication: 80,
  rateProtection: 75,
  threatDetection: 70,
  encryptionCompliance: 90,
  incidentResponse: 60,
  meshIntegrity: 50,
  dataProtection: 85,
  intelligenceCoverage: 40,
};

// ═══════════════════════════════════════════════════════════════════════════════
// CORE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate the current security posture.
 */
export function calculatePosture(): SecurityPosture {
  const weights: Record<keyof PostureDimensions, number> = {
    authentication: 0.20,
    rateProtection: 0.15,
    threatDetection: 0.20,
    encryptionCompliance: 0.10,
    incidentResponse: 0.10,
    meshIntegrity: 0.10,
    dataProtection: 0.10,
    intelligenceCoverage: 0.05,
  };

  let score = 0;
  for (const [key, weight] of Object.entries(weights)) {
    score += (dimensions[key] || 0) * weight;
  }
  score = Math.round(Math.min(100, Math.max(0, score)));

  const grade = scoreToGrade(score);
  const recommendations = generateRecommendations(dimensions as unknown as PostureDimensions);

  // Count recent timeline activity
  const recentWindow = Date.now() - 60 * 60_000;
  const recentBlocks = timeline.filter(t => t.timestamp > recentWindow && t.action === 'blocked').length;
  const activeThreats = timeline.filter(t => t.timestamp > recentWindow && !t.resolved).length;

  const posture: SecurityPosture = Object.freeze({
    grade,
    score,
    timestamp: Date.now(),
    dimensions: Object.freeze({ ...dimensions }) as PostureDimensions,
    activeThreats,
    recentBlocks,
    lockdownLevel: 'NONE',
    recommendations: Object.freeze(recommendations),
  });

  // Record history
  postureHistory.push({ timestamp: Date.now(), score, grade });
  if (postureHistory.length > MAX_HISTORY) postureHistory.splice(0, 1);

  return posture;
}

function scoreToGrade(score: number): PostureGrade {
  if (score >= 95) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function generateRecommendations(dims: PostureDimensions): string[] {
  const recs: string[] = [];
  if (dims.intelligenceCoverage < 60) recs.push('Expand threat intelligence feed coverage');
  if (dims.meshIntegrity < 60) recs.push('Bootstrap mTLS certificates for all nodes');
  if (dims.incidentResponse < 60) recs.push('Configure incident response playbooks');
  if (dims.threatDetection < 70) recs.push('Enable adaptive threat learning');
  if (dims.rateProtection < 70) recs.push('Review and tighten rate limiting policies');
  if (dims.authentication < 70) recs.push('Strengthen authentication policies');
  if (dims.dataProtection < 70) recs.push('Deploy canary tokens across data layers');
  if (dims.encryptionCompliance < 80) recs.push('Audit encryption compliance');
  return recs;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DIMENSION UPDATES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Update a posture dimension score.
 */
export function updateDimension(dimension: keyof PostureDimensions, score: number): void {
  dimensions[dimension] = Math.min(100, Math.max(0, score));
}

/**
 * Boost a dimension by delta.
 */
export function boostDimension(dimension: keyof PostureDimensions, delta: number): void {
  dimensions[dimension] = Math.min(100, Math.max(0, (dimensions[dimension] || 0) + delta));
}

// ═══════════════════════════════════════════════════════════════════════════════
// ATTACK TIMELINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Record an attack event on the timeline.
 */
export function recordAttackEvent(
  type: string,
  severity: AttackTimelineEntry['severity'],
  description: string,
  action: string,
  actorId: string | null = null,
): AttackTimelineEntry {
  const entry: AttackTimelineEntry = Object.freeze({
    id: `ATK-${(++timelineSeq).toString(36).padStart(4, '0')}`,
    timestamp: Date.now(),
    type,
    severity,
    actorId,
    description,
    action,
    resolved: action === 'blocked' || action === 'allowed',
  });

  timeline.push(entry);
  if (timeline.length > MAX_TIMELINE) timeline.splice(0, 1);

  // Update threat detection dimension based on activity
  if (severity === 'critical' || severity === 'high') {
    boostDimension('threatDetection', action === 'blocked' ? 2 : -5);
  }

  return entry;
}

/**
 * Get attack timeline.
 */
export function getAttackTimeline(limit = 50): readonly AttackTimelineEntry[] {
  const start = Math.max(0, timeline.length - limit);
  return Object.freeze(timeline.slice(start).reverse());
}

/**
 * Get posture history.
 */
export function getPostureHistory(limit = 50) {
  const start = Math.max(0, postureHistory.length - limit);
  return postureHistory.slice(start);
}

/**
 * Get posture stats.
 */
export function getPostureStats() {
  const current = calculatePosture();
  return {
    version: '1.0.0',
    currentGrade: current.grade,
    currentScore: current.score,
    timelineSize: timeline.length,
    historySize: postureHistory.length,
    activeThreats: current.activeThreats,
    recommendationCount: current.recommendations.length,
  };
}
