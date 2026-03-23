/**
 * IMMUNITY Ultimate — Autoimmune Disorder Detector
 * 
 * Detects when immune rules incorrectly target healthy substrate behavior.
 * - False positive correlation with downstream errors
 * - Healthy traffic fingerprinting
 * - Auto-whitelist proposals
 * - Autoimmune severity scoring
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface AutoimmuneIncident {
  id: string;
  ruleId: string;              // immune rule that triggered
  blockedPattern: string;
  wasLegitimate: boolean;
  downstreamErrors: number;
  detectedAt: number;
  severity: number;            // 0–10
  whitelistProposed: boolean;
}

export interface HealthyFingerprint {
  pattern: string;
  confidence: number;          // 0–1
  sampleCount: number;
  lastSeenAt: number;
}

export interface WhitelistProposal {
  pattern: string;
  ruleId: string;
  falsePositiveCount: number;
  confidence: number;
  proposedAt: number;
  approved: boolean;
}

export interface AutoimmuneDetectorHealth {
  totalIncidents: number;
  activeAutoimmune: number;
  whitelistProposals: number;
  approvedWhitelists: number;
  avgSeverity: number;
  healthyFingerprints: number;
}

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const MAX_INCIDENTS = 500;
const AUTOIMMUNE_THRESHOLD = 3; // 3+ FPs from same rule = autoimmune
const EMA_ALPHA = 0.2;

const incidents: AutoimmuneIncident[] = [];
const healthyFingerprints = new Map<string, HealthyFingerprint>();
const ruleFalsePositives = new Map<string, number>(); // ruleId → FP count
const whitelistProposals = new Map<string, WhitelistProposal>();
let avgSeverityEma = 0;

// ═══════════════════════════════════════════════════════════════
// CORE LOGIC
// ═══════════════════════════════════════════════════════════════

/** Record a potential false positive from an immune rule */
export function recordFalsePositive(
  ruleId: string,
  blockedPattern: string,
  downstreamErrors: number,
): AutoimmuneIncident {
  const severity = Math.min(10, Math.round(downstreamErrors * 0.5 + 2));
  const now = Date.now();

  const incident: AutoimmuneIncident = {
    id: `ai_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    ruleId,
    blockedPattern,
    wasLegitimate: true,
    downstreamErrors,
    detectedAt: now,
    severity,
    whitelistProposed: false,
  };

  incidents.push(incident);
  if (incidents.length > MAX_INCIDENTS) incidents.shift();

  // Track per-rule false positives
  const fpCount = (ruleFalsePositives.get(ruleId) ?? 0) + 1;
  ruleFalsePositives.set(ruleId, fpCount);

  // Update EMA
  avgSeverityEma = avgSeverityEma === 0
    ? severity
    : EMA_ALPHA * severity + (1 - EMA_ALPHA) * avgSeverityEma;

  // Auto-propose whitelist if threshold reached
  if (fpCount >= AUTOIMMUNE_THRESHOLD && !whitelistProposals.has(blockedPattern)) {
    const proposal: WhitelistProposal = {
      pattern: blockedPattern,
      ruleId,
      falsePositiveCount: fpCount,
      confidence: Math.min(1, fpCount / (AUTOIMMUNE_THRESHOLD * 2)),
      proposedAt: now,
      approved: false,
    };
    whitelistProposals.set(blockedPattern, proposal);
    incident.whitelistProposed = true;
  }

  return incident;
}

/** Register a healthy traffic fingerprint */
export function registerHealthyPattern(pattern: string, confidence = 0.5): HealthyFingerprint {
  const existing = healthyFingerprints.get(pattern);
  if (existing) {
    existing.confidence = EMA_ALPHA * confidence + (1 - EMA_ALPHA) * existing.confidence;
    existing.sampleCount++;
    existing.lastSeenAt = Date.now();
    return existing;
  }

  const fp: HealthyFingerprint = {
    pattern,
    confidence,
    sampleCount: 1,
    lastSeenAt: Date.now(),
  };
  healthyFingerprints.set(pattern, fp);
  return fp;
}

/** Check if a pattern matches a known healthy fingerprint */
export function isKnownHealthy(pattern: string): HealthyFingerprint | null {
  return healthyFingerprints.get(pattern) ?? null;
}

/** Approve a whitelist proposal */
export function approveWhitelist(pattern: string): boolean {
  const proposal = whitelistProposals.get(pattern);
  if (!proposal) return false;
  proposal.approved = true;
  return true;
}

/** Get rules with autoimmune behavior (high false positives) */
export function getAutoimmunRules(): Array<{ ruleId: string; fpCount: number }> {
  return Array.from(ruleFalsePositives.entries())
    .filter(([, count]) => count >= AUTOIMMUNE_THRESHOLD)
    .map(([ruleId, fpCount]) => ({ ruleId, fpCount }))
    .sort((a, b) => b.fpCount - a.fpCount);
}

/** Get pending whitelist proposals */
export function getPendingWhitelists(): WhitelistProposal[] {
  return Array.from(whitelistProposals.values()).filter(w => !w.approved);
}

/** Get detector health */
export function getAutoimmuneDetectorHealth(): AutoimmuneDetectorHealth {
  const autoimmune = Array.from(ruleFalsePositives.values())
    .filter(c => c >= AUTOIMMUNE_THRESHOLD).length;
  const proposals = Array.from(whitelistProposals.values());

  return {
    totalIncidents: incidents.length,
    activeAutoimmune: autoimmune,
    whitelistProposals: proposals.length,
    approvedWhitelists: proposals.filter(w => w.approved).length,
    avgSeverity: Math.round(avgSeverityEma * 10) / 10,
    healthyFingerprints: healthyFingerprints.size,
  };
}
