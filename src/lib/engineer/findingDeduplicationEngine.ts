/**
 * ENGINEER — Finding Deduplication Engine
 * Fingerprint-based coalescing with severity escalation.
 * Repeated findings for the same root cause merge into a single high-priority signal.
 * @module engineer/findingDeduplicationEngine
 * @version 9.0.0 — Foundry
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface RawFinding {
  fingerprint: string;     // unique signature (e.g., "engineer:health:CLM Kill Switch Active")
  title: string;
  description: string;
  severity: Severity;
  source: string;
  timestamp: number;
  evidence?: Record<string, unknown>;
}

export interface CoalescedFinding {
  fingerprint: string;
  title: string;
  description: string;
  severity: Severity;         // escalated severity
  originalSeverity: Severity; // first occurrence severity
  source: string;
  firstSeen: number;
  lastSeen: number;
  occurrences: number;
  escalated: boolean;
  evidence?: Record<string, unknown>;
}

// ── Constants ──────────────────────────────────────────────────────────────

const SEVERITY_ORDER: Severity[] = ['info', 'low', 'medium', 'high', 'critical'];

const ESCALATION_RULES: Array<{ minOccurrences: number; escalateTo: Severity }> = [
  { minOccurrences: 10, escalateTo: 'critical' },
  { minOccurrences: 5, escalateTo: 'high' },
  { minOccurrences: 3, escalateTo: 'medium' },
];

// ── State ──────────────────────────────────────────────────────────────────

const coalescedMap = new Map<string, CoalescedFinding>();

// ── Core ───────────────────────────────────────────────────────────────────

function severityRank(sev: Severity): number {
  return SEVERITY_ORDER.indexOf(sev);
}

function maxSeverity(a: Severity, b: Severity): Severity {
  return severityRank(a) >= severityRank(b) ? a : b;
}

export function ingestFinding(finding: RawFinding): CoalescedFinding {
  const existing = coalescedMap.get(finding.fingerprint);

  if (existing) {
    existing.occurrences++;
    existing.lastSeen = finding.timestamp;
    existing.evidence = finding.evidence ?? existing.evidence;

    // Escalate severity based on occurrence count
    let escalatedSev = existing.originalSeverity;
    for (const rule of ESCALATION_RULES) {
      if (existing.occurrences >= rule.minOccurrences) {
        escalatedSev = maxSeverity(escalatedSev, rule.escalateTo);
      }
    }

    // Also take the max of incoming severity
    existing.severity = maxSeverity(escalatedSev, finding.severity);
    existing.escalated = severityRank(existing.severity) > severityRank(existing.originalSeverity);

    return { ...existing };
  }

  const coalesced: CoalescedFinding = {
    fingerprint: finding.fingerprint,
    title: finding.title,
    description: finding.description,
    severity: finding.severity,
    originalSeverity: finding.severity,
    source: finding.source,
    firstSeen: finding.timestamp,
    lastSeen: finding.timestamp,
    occurrences: 1,
    escalated: false,
    evidence: finding.evidence,
  };

  coalescedMap.set(finding.fingerprint, coalesced);
  return { ...coalesced };
}

export function getCoalescedFindings(): CoalescedFinding[] {
  return Array.from(coalescedMap.values())
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}

export function getFinding(fingerprint: string): CoalescedFinding | undefined {
  const f = coalescedMap.get(fingerprint);
  return f ? { ...f } : undefined;
}

export function dismissFinding(fingerprint: string): boolean {
  return coalescedMap.delete(fingerprint);
}

export function getStats() {
  const findings = Array.from(coalescedMap.values());
  return {
    total: findings.length,
    escalated: findings.filter(f => f.escalated).length,
    bySeverity: SEVERITY_ORDER.reduce((acc, sev) => {
      acc[sev] = findings.filter(f => f.severity === sev).length;
      return acc;
    }, {} as Record<Severity, number>),
    totalOccurrences: findings.reduce((s, f) => s + f.occurrences, 0),
  };
}

export function resetDeduplication(): void {
  coalescedMap.clear();
}
