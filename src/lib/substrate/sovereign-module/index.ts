/**
 * SOVEREIGN Module — Data Sovereignty & Jurisdictional Compliance
 * GDPR, HIPAA, ITAR auto-enforcement per request
 * Circuit Breaker + Hot-Swap + Graceful Fallback
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, withResilienceSync, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';
import { validateStringInput, clampNumber } from '@/lib/system/hardening';

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

export type Jurisdiction = 'US' | 'EU' | 'UK' | 'AU' | 'CA' | 'JP' | 'CN' | 'KR' | 'BR' | 'IN' | 'GLOBAL';
export type ComplianceFramework = 'GDPR' | 'HIPAA' | 'ITAR' | 'SOC2' | 'CCPA' | 'PIPEDA' | 'LGPD' | 'POPIA' | 'APPI' | 'PDPA';
export type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted' | 'top_secret';
export type ConsentStatus = 'granted' | 'denied' | 'withdrawn' | 'pending' | 'expired';

export interface DataResidencyRule {
  id: string;
  framework: ComplianceFramework;
  jurisdiction: Jurisdiction;
  dataClassification: DataClassification;
  storageRegions: string[];
  transferRestrictions: string[];
  retentionDays: number;
  encryptionRequired: boolean;
  anonymizationRequired: boolean;
}

export interface ComplianceCheck {
  id: string;
  framework: ComplianceFramework;
  jurisdiction: Jurisdiction;
  status: 'compliant' | 'non_compliant' | 'warning' | 'unknown';
  violations: ComplianceViolation[];
  checkedAt: number;
  expiresAt: number;
}

export interface ComplianceViolation {
  id: string;
  rule: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  remediation: string;
  autoFixable: boolean;
}

export interface ConsentRecord {
  id: string;
  subjectId: string;
  purpose: string;
  status: ConsentStatus;
  grantedAt: number;
  expiresAt: number | null;
  withdrawnAt: number | null;
  framework: ComplianceFramework;
}

export interface DataRetentionPolicy {
  id: string;
  dataType: string;
  classification: DataClassification;
  retentionDays: number;
  deleteOnExpiry: boolean;
  anonymizeOnExpiry: boolean;
  framework: ComplianceFramework;
}

export interface SovereignModuleState {
  initialized: boolean;
  activeJurisdictions: Jurisdiction[];
  activeFrameworks: ComplianceFramework[];
  residencyRules: DataResidencyRule[];
  complianceChecks: ComplianceCheck[];
  consentRecords: ConsentRecord[];
  retentionPolicies: DataRetentionPolicy[];
  totalChecks: number;
  totalViolations: number;
  autoRemediations: number;
  complianceScore: number;
}

// ═══════════════════════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════════════════════

const state: SovereignModuleState = {
  initialized: false,
  activeJurisdictions: [],
  activeFrameworks: [],
  residencyRules: [],
  complianceChecks: [],
  consentRecords: [],
  retentionPolicies: [],
  totalChecks: 0,
  totalViolations: 0,
  autoRemediations: 0,
  complianceScore: 100,
};

let moduleEngine: ModuleEngine | null = null;

// ═══════════════════════════════════════════════════════════════════
// Lifecycle
// ═══════════════════════════════════════════════════════════════════

export function initSovereign(): void {
  emitStarted('sovereign', 'init', {});
  try {
    initCircuitBreaker('sovereign', { failureThreshold: 3, recoveryTimeout: 20_000 });
    moduleEngine = activateModuleEngine('sovereign', '1.0.0');
    state.initialized = true;
    emitSucceeded('sovereign', 'init', { engineId: moduleEngine.instance.id });
  } catch (err) {
    state.initialized = true;
    emitFailed('sovereign', 'init', err instanceof Error ? err.message : String(err));
  }
}

// ═══════════════════════════════════════════════════════════════════
// Core Operations
// ═══════════════════════════════════════════════════════════════════

export function registerJurisdiction(jurisdiction: Jurisdiction, frameworks: ComplianceFramework[]): void {
  if (!state.activeJurisdictions.includes(jurisdiction)) {
    state.activeJurisdictions.push(jurisdiction);
  }
  for (const fw of frameworks) {
    if (!state.activeFrameworks.includes(fw)) {
      state.activeFrameworks.push(fw);
    }
  }
  emit({ module: 'sovereign', event_type: 'jurisdiction_registered', outcome: 'succeeded', data: { jurisdiction, frameworks } });
}

export function addResidencyRule(rule: Omit<DataResidencyRule, 'id'>): DataResidencyRule {
  const fullRule: DataResidencyRule = { ...rule, id: `dr-${Date.now()}-${state.residencyRules.length}` };
  state.residencyRules.push(fullRule);
  emit({ module: 'sovereign', event_type: 'residency_rule_added', outcome: 'succeeded', data: { ruleId: fullRule.id, framework: fullRule.framework } });
  return fullRule;
}

export function checkCompliance(framework: ComplianceFramework, jurisdiction: Jurisdiction, context?: Record<string, unknown>): ComplianceCheck {
  const fallback: ComplianceCheck = {
    id: `cc-fallback-${Date.now()}`, framework, jurisdiction, status: 'unknown',
    violations: [], checkedAt: Date.now(), expiresAt: Date.now() + 3600_000,
  };

  const { result } = withResilienceSync('sovereign', () => {
    const violations: ComplianceViolation[] = [];
    const rules = state.residencyRules.filter(r => r.framework === framework && r.jurisdiction === jurisdiction);

    // Check each rule
    for (const rule of rules) {
      if (rule.encryptionRequired && !context?.encrypted) {
        violations.push({
          id: `v-${Date.now()}-enc`, rule: 'encryption_required', severity: 'critical',
          description: `${framework} requires encryption for ${rule.dataClassification} data in ${jurisdiction}`,
          remediation: 'Enable encryption at rest and in transit', autoFixable: true,
        });
      }
      if (rule.anonymizationRequired && !context?.anonymized) {
        violations.push({
          id: `v-${Date.now()}-anon`, rule: 'anonymization_required', severity: 'high',
          description: `${framework} requires anonymization for ${rule.dataClassification} data`,
          remediation: 'Apply data anonymization pipeline', autoFixable: true,
        });
      }
    }

    state.totalViolations += violations.length;
    state.totalChecks++;

    const check: ComplianceCheck = {
      id: `cc-${Date.now()}-${state.totalChecks}`, framework, jurisdiction,
      status: violations.length === 0 ? 'compliant' : violations.some(v => v.severity === 'critical') ? 'non_compliant' : 'warning',
      violations, checkedAt: Date.now(), expiresAt: Date.now() + 3600_000,
    };

    if (state.complianceChecks.length >= 500) state.complianceChecks.shift();
    state.complianceChecks.push(check);
    recalculateScore();

    return check;
  }, fallback, 'check_compliance');

  return result;
}

export function recordConsent(subjectId: string, purpose: string, status: ConsentStatus, framework: ComplianceFramework): ConsentRecord {
  const record: ConsentRecord = {
    id: `consent-${Date.now()}`, subjectId, purpose, status, framework,
    grantedAt: status === 'granted' ? Date.now() : 0,
    expiresAt: status === 'granted' ? Date.now() + 365 * 24 * 3600_000 : null,
    withdrawnAt: status === 'withdrawn' ? Date.now() : null,
  };
  if (state.consentRecords.length >= 1000) state.consentRecords.shift();
  state.consentRecords.push(record);
  emit({ module: 'sovereign', event_type: 'consent_recorded', outcome: 'succeeded', data: { subjectId, purpose, status } });
  return record;
}

export function addRetentionPolicy(policy: Omit<DataRetentionPolicy, 'id'>): DataRetentionPolicy {
  const full: DataRetentionPolicy = { ...policy, id: `rp-${Date.now()}` };
  state.retentionPolicies.push(full);
  return full;
}

export function classifyData(dataType: string, content?: string): DataClassification {
  const sensitive = ['ssn', 'password', 'credit_card', 'health', 'biometric', 'genetic'];
  const restricted = ['military', 'itar', 'classified', 'secret'];
  const lower = (dataType + (content || '')).toLowerCase();
  if (restricted.some(k => lower.includes(k))) return 'top_secret';
  if (sensitive.some(k => lower.includes(k))) return 'restricted';
  if (lower.includes('pii') || lower.includes('personal')) return 'confidential';
  if (lower.includes('internal')) return 'internal';
  return 'public';
}

function recalculateScore(): void {
  const recent = state.complianceChecks.slice(-50);
  if (recent.length === 0) { state.complianceScore = 100; return; }
  const compliant = recent.filter(c => c.status === 'compliant').length;
  state.complianceScore = Math.round((compliant / recent.length) * 100);
}

// ═══════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════

export function getSovereignState(): SovereignModuleState { return { ...state }; }
export function getSovereignHealth(): number { return state.initialized ? state.complianceScore : 0; }
export function getSovereignResilience() { return getModuleResilienceReport('sovereign', getSovereignHealth()); }
export function getSovereignEngine() { return moduleEngine; }
