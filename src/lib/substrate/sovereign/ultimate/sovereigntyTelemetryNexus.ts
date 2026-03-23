/**
 * SOVEREIGN Ultimate — Sovereignty Telemetry Nexus
 * Unified health dashboard for all 10 SOVEREIGN systems.
 * v9.0.0 "Crown Prime"
 *
 * sovereign_health = jurisdiction(15%) + transfer(15%) + consent(15%)
 *                  + classification(10%) + retention(10%) + pia(10%)
 *                  + breach(10%) + audit(10%) + genome(5%)
 */

import { getJurisdictionIntelligenceHealth } from './jurisdictionalIntelligence';
import { getTransferHealth } from './crossBorderArbiter';
import { getConsentHealth } from './consentLifecycleManager';
import { getClassificationHealth } from './dataClassificationAutomator';
import { getRetentionHealth } from './retentionPolicyEngine';
import { getPIAHealth } from './privacyImpactEngine';
import { getBreachHealth } from './breachResponseOrchestrator';
import { getChainHealth } from './sovereigntyAuditChain';
import { getGenomeHealth } from './regulatoryGenomeMapper';

// ─── Types ────────────────────────────────────────────────────────

export interface SovereigntyHealthReport {
  overallHealth: number;
  systems: {
    jurisdiction: number;
    transfer: number;
    consent: number;
    classification: number;
    retention: number;
    pia: number;
    breach: number;
    audit: number;
    genome: number;
  };
  alerts: SovereigntyAlert[];
  lastUpdated: string;
}

export interface SovereigntyAlert {
  level: 'warning' | 'critical';
  system: string;
  message: string;
  timestamp: string;
}

// ─── Weights ──────────────────────────────────────────────────────

const SYSTEM_WEIGHTS = {
  jurisdiction: 0.15,
  transfer: 0.15,
  consent: 0.15,
  classification: 0.10,
  retention: 0.10,
  pia: 0.10,
  breach: 0.10,
  audit: 0.10,
  genome: 0.05,
};

// ─── Storage ──────────────────────────────────────────────────────

const snapshots: SovereigntyHealthReport[] = [];
const MAX_SNAPSHOTS = 200;

// ─── Health Computation ───────────────────────────────────────────

export function computeSovereigntyHealth(): SovereigntyHealthReport {
  const systems = {
    jurisdiction: getJurisdictionIntelligenceHealth(),
    transfer: getTransferHealth(),
    consent: getConsentHealth(),
    classification: getClassificationHealth(),
    retention: getRetentionHealth(),
    pia: getPIAHealth(),
    breach: getBreachHealth(),
    audit: getChainHealth(),
    genome: getGenomeHealth(),
  };

  const overallHealth = Math.round(
    systems.jurisdiction * SYSTEM_WEIGHTS.jurisdiction +
    systems.transfer * SYSTEM_WEIGHTS.transfer +
    systems.consent * SYSTEM_WEIGHTS.consent +
    systems.classification * SYSTEM_WEIGHTS.classification +
    systems.retention * SYSTEM_WEIGHTS.retention +
    systems.pia * SYSTEM_WEIGHTS.pia +
    systems.breach * SYSTEM_WEIGHTS.breach +
    systems.audit * SYSTEM_WEIGHTS.audit +
    systems.genome * SYSTEM_WEIGHTS.genome
  );

  // Alert detection
  const alerts: SovereigntyAlert[] = [];
  const now = new Date().toISOString();

  for (const [name, score] of Object.entries(systems)) {
    if (score < 30) {
      alerts.push({ level: 'critical', system: name, message: `${name} health critically low: ${score}%`, timestamp: now });
    } else if (score < 60) {
      alerts.push({ level: 'warning', system: name, message: `${name} health degraded: ${score}%`, timestamp: now });
    }
  }

  const report: SovereigntyHealthReport = {
    overallHealth,
    systems,
    alerts,
    lastUpdated: now,
  };

  snapshots.push(report);
  if (snapshots.length > MAX_SNAPSHOTS) snapshots.splice(0, snapshots.length - MAX_SNAPSHOTS);

  return report;
}

// ─── Queries ──────────────────────────────────────────────────────

export function getSovereigntyHealthHistory(): SovereigntyHealthReport[] { return [...snapshots]; }
export function getLatestSovereigntyHealth(): SovereigntyHealthReport | null {
  return snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
}
