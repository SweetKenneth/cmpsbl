/**
 * S-Tier 035 — Data Sovereignty Partitioner
 * CJPI: 94 | Node: SOVEREIGN | ID: S-SOV02
 *
 * Enforces jurisdictional data partitioning rules.
 * Routes data to the correct storage zone based on sovereignty classification.
 */

export type Jurisdiction = 'EU' | 'US' | 'APAC' | 'GLOBAL' | 'RESTRICTED';

export interface SovereigntyRule {
  dataClass: string;
  allowedJurisdictions: Jurisdiction[];
  encryptionRequired: boolean;
  retentionDays: number | null;
}

export interface PartitionDecision {
  dataClass: string;
  requestedJurisdiction: Jurisdiction;
  allowed: boolean;
  encryptionRequired: boolean;
  retentionDays: number | null;
  reason: string;
}

const rules = new Map<string, SovereigntyRule>();

export function registerSovereigntyRule(rule: SovereigntyRule): void {
  rules.set(rule.dataClass, rule);
}

export function evaluatePartition(dataClass: string, jurisdiction: Jurisdiction): PartitionDecision {
  const rule = rules.get(dataClass);
  if (!rule) {
    return {
      dataClass,
      requestedJurisdiction: jurisdiction,
      allowed: true,
      encryptionRequired: false,
      retentionDays: null,
      reason: 'No sovereignty rule registered — default allow',
    };
  }

  const allowed = rule.allowedJurisdictions.includes(jurisdiction) || rule.allowedJurisdictions.includes('GLOBAL');
  return {
    dataClass,
    requestedJurisdiction: jurisdiction,
    allowed,
    encryptionRequired: rule.encryptionRequired,
    retentionDays: rule.retentionDays,
    reason: allowed
      ? `Jurisdiction ${jurisdiction} permitted for ${dataClass}`
      : `Jurisdiction ${jurisdiction} BLOCKED for ${dataClass} — allowed: ${rule.allowedJurisdictions.join(', ')}`,
  };
}

export function listRules(): SovereigntyRule[] {
  return [...rules.values()];
}

export function clearRules(): void {
  rules.clear();
}
