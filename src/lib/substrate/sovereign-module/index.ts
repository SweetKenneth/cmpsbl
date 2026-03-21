/**
 * SOVEREIGN Module — Data Sovereignty & Jurisdictional Compliance
 * Full compliance engine: residency enforcement, consent lifecycle, retention
 * validation, jurisdiction gap detection, framework-specific minimums.
 * Circuit Breaker + Hot-Swap + Graceful Fallback
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, withResilienceSync, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';
import { validateStringInput, clampNumber } from '@/lib/system/hardening';
import { createModuleHardening, type ModuleHardening } from '../module-hardening';

// ─── Types ────────────────────────────────────────────────────────────────────

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
  status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'warning' | 'unknown';
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
  jurisdictionGaps: Jurisdiction[];
  expiringConsents: number;
}

// ─── Framework Retention Minimums (days) ──────────────────────────────────────

const FRAMEWORK_RETENTION_MINIMUMS: Record<ComplianceFramework, number> = {
  GDPR: 30,
  HIPAA: 2190, // 6 years
  ITAR: 1825,  // 5 years
  SOC2: 365,
  CCPA: 365,
  PIPEDA: 365,
  LGPD: 365,
  POPIA: 365,
  APPI: 365,
  PDPA: 365,
};

// ─── Classification Encryption Requirements ───────────────────────────────────

const CLASSIFICATION_REQUIREMENTS: Record<DataClassification, { encryptAtRest: boolean; encryptInTransit: boolean; keyRotation: boolean }> = {
  public: { encryptAtRest: false, encryptInTransit: false, keyRotation: false },
  internal: { encryptAtRest: true, encryptInTransit: false, keyRotation: false },
  confidential: { encryptAtRest: true, encryptInTransit: true, keyRotation: false },
  restricted: { encryptAtRest: true, encryptInTransit: true, keyRotation: true },
  top_secret: { encryptAtRest: true, encryptInTransit: true, keyRotation: true },
};

// ─── State ────────────────────────────────────────────────────────────────────

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
  jurisdictionGaps: [],
  expiringConsents: 0,
};

let moduleEngine: ModuleEngine | null = null;
let hardening: ModuleHardening | null = null;

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initSovereign(): void {
  emitStarted('sovereign', 'init', {});
  try {
    initCircuitBreaker('sovereign', { failureThreshold: 3, recoveryTimeout: 20_000 });
    moduleEngine = activateModuleEngine('sovereign', '2.0.0');
    hardening = createModuleHardening('sovereign', { maxConcurrent: 8, rateLimit: 50, healthThreshold: 40 });
    state.initialized = true;
    hardening.startAutoRestore(
      () => getSovereignHealth(),
      () => { state.complianceScore = 100; state.totalViolations = 0; },
      30_000,
    );
    hardening.snapshot(state);
    emitSucceeded('sovereign', 'init', { engineId: moduleEngine.instance.id });
  } catch (err) {
    state.initialized = true;
    emitFailed('sovereign', 'init', err instanceof Error ? err.message : String(err));
  }
}

// ─── Jurisdiction Management ──────────────────────────────────────────────────

export function registerJurisdiction(jurisdiction: Jurisdiction, frameworks: ComplianceFramework[]): void {
  if (!state.activeJurisdictions.includes(jurisdiction)) {
    state.activeJurisdictions.push(jurisdiction);
  }
  for (const fw of frameworks) {
    if (!state.activeFrameworks.includes(fw)) {
      state.activeFrameworks.push(fw);
    }
  }
  detectJurisdictionGaps();
  emit({ module: 'sovereign', event_type: 'jurisdiction_registered', outcome: 'succeeded', data: { jurisdiction, frameworks } });
}

export function addResidencyRule(rule: Omit<DataResidencyRule, 'id'>): DataResidencyRule {
  if (state.residencyRules.length >= 500) state.residencyRules.shift();
  const fullRule: DataResidencyRule = { ...rule, id: `dr-${Date.now()}-${state.residencyRules.length}` };
  state.residencyRules.push(fullRule);
  detectJurisdictionGaps();
  emit({ module: 'sovereign', event_type: 'residency_rule_added', outcome: 'succeeded', data: { ruleId: fullRule.id, framework: fullRule.framework } });
  return fullRule;
}

// ─── Jurisdiction Gap Detection ───────────────────────────────────────────────

function detectJurisdictionGaps(): void {
  const gaps: Jurisdiction[] = [];
  for (const jurisdiction of state.activeJurisdictions) {
    const hasRules = state.residencyRules.some(r => r.jurisdiction === jurisdiction);
    if (!hasRules) gaps.push(jurisdiction);
  }
  state.jurisdictionGaps = gaps;
  if (gaps.length > 0) {
    emit({ module: 'sovereign', event_type: 'jurisdiction_gaps_detected', outcome: 'failed', data: { gaps } });
  }
}

// ─── Full Compliance Check ────────────────────────────────────────────────────

export function checkCompliance(framework: ComplianceFramework, jurisdiction: Jurisdiction, context?: Record<string, unknown>): ComplianceCheck {
  const fallback: ComplianceCheck = {
    id: `cc-fallback-${Date.now()}`, framework, jurisdiction, status: 'unknown',
    violations: [], checkedAt: Date.now(), expiresAt: Date.now() + 3600_000,
  };

  const { result } = withResilienceSync('sovereign', () => {
    const violations: ComplianceViolation[] = [];
    const rules = state.residencyRules.filter(r => r.framework === framework && r.jurisdiction === jurisdiction);

    // 1. Residency rule checks
    for (const rule of rules) {
      const reqs = CLASSIFICATION_REQUIREMENTS[rule.dataClassification];

      // Encryption at rest
      if (reqs.encryptAtRest && !context?.encrypted) {
        violations.push({
          id: `v-${Date.now()}-enc-rest`, rule: 'encryption_at_rest',
          severity: rule.dataClassification === 'top_secret' ? 'critical' : 'high',
          description: `${framework} requires encryption at rest for ${rule.dataClassification} data in ${jurisdiction}`,
          remediation: 'Enable encryption at rest using AES-256 or equivalent', autoFixable: true,
        });
      }

      // Encryption in transit
      if (reqs.encryptInTransit && !context?.encryptedInTransit) {
        violations.push({
          id: `v-${Date.now()}-enc-transit`, rule: 'encryption_in_transit',
          severity: 'high',
          description: `${framework} requires encryption in transit for ${rule.dataClassification} data`,
          remediation: 'Enforce TLS 1.3 for all data transfers', autoFixable: true,
        });
      }

      // Anonymization
      if (rule.anonymizationRequired && !context?.anonymized) {
        violations.push({
          id: `v-${Date.now()}-anon`, rule: 'anonymization_required',
          severity: 'high',
          description: `${framework} requires anonymization for ${rule.dataClassification} data`,
          remediation: 'Apply PHANTOM anonymization pipeline', autoFixable: true,
        });
      }

      // Storage region check
      if (context?.storageRegion && rule.storageRegions.length > 0) {
        const region = String(context.storageRegion);
        if (!rule.storageRegions.includes(region)) {
          violations.push({
            id: `v-${Date.now()}-residency`, rule: 'data_residency',
            severity: 'critical',
            description: `Data stored in ${region} violates ${jurisdiction} residency rules. Allowed: ${rule.storageRegions.join(', ')}`,
            remediation: `Migrate data to approved region: ${rule.storageRegions[0]}`, autoFixable: false,
          });
        }
      }
    }

    // 2. Consent status check
    if (context?.subjectId) {
      const subjectConsents = state.consentRecords.filter(c =>
        c.subjectId === String(context.subjectId) && c.framework === framework
      );
      const activeConsent = subjectConsents.find(c => c.status === 'granted' && (!c.expiresAt || c.expiresAt > Date.now()));
      if (!activeConsent && (framework === 'GDPR' || framework === 'CCPA' || framework === 'LGPD')) {
        violations.push({
          id: `v-${Date.now()}-consent`, rule: 'consent_required',
          severity: 'critical',
          description: `No active consent for subject under ${framework}. Processing without consent is prohibited.`,
          remediation: 'Obtain explicit consent before processing', autoFixable: false,
        });
      }
    }

    // 3. Retention policy check
    const retentionMin = FRAMEWORK_RETENTION_MINIMUMS[framework];
    const policies = state.retentionPolicies.filter(p => p.framework === framework);
    for (const policy of policies) {
      if (policy.retentionDays < retentionMin) {
        violations.push({
          id: `v-${Date.now()}-retention-${policy.id}`, rule: 'retention_minimum',
          severity: 'medium',
          description: `Retention policy "${policy.dataType}" (${policy.retentionDays}d) below ${framework} minimum (${retentionMin}d)`,
          remediation: `Increase retention to at least ${retentionMin} days`, autoFixable: true,
        });
      }
      if (policy.retentionDays < 30 && policy.deleteOnExpiry) {
        violations.push({
          id: `v-${Date.now()}-retention-risk-${policy.id}`, rule: 'retention_risk',
          severity: 'low',
          description: `Short retention (${policy.retentionDays}d) with auto-delete may cause premature data loss`,
          remediation: 'Review retention period and consider anonymization instead of deletion', autoFixable: false,
        });
      }
    }

    state.totalViolations += violations.length;
    state.totalChecks++;

    // Auto-remediation count
    const autoFixable = violations.filter(v => v.autoFixable).length;
    state.autoRemediations += autoFixable;

    // Determine status: compliant / partially_compliant / non_compliant
    let status: ComplianceCheck['status'];
    if (violations.length === 0) status = 'compliant';
    else if (violations.some(v => v.severity === 'critical')) status = 'non_compliant';
    else if (violations.some(v => v.severity === 'high')) status = 'partially_compliant';
    else status = 'warning';

    const check: ComplianceCheck = {
      id: `cc-${Date.now()}-${state.totalChecks}`, framework, jurisdiction, status,
      violations, checkedAt: Date.now(), expiresAt: Date.now() + 3600_000,
    };

    if (state.complianceChecks.length >= 500) state.complianceChecks.shift();
    state.complianceChecks.push(check);
    recalculateScore();

    emit({ module: 'sovereign', event_type: 'compliance_checked', outcome: status === 'compliant' ? 'succeeded' : 'failed', data: { framework, jurisdiction, status, violationCount: violations.length } });
    return check;
  }, fallback, 'check_compliance');

  return result;
}

// ─── Consent Management (Immutable Append-Only) ───────────────────────────────

export function recordConsent(subjectId: string, purpose: string, status: ConsentStatus, framework: ComplianceFramework): ConsentRecord {
  const safeSubject = validateStringInput(subjectId, { maxLength: 256 }) ?? 'unknown';
  const safePurpose = validateStringInput(purpose, { maxLength: 1000 }) ?? 'unspecified';

  // Immutable: withdrawals create new records, never modify existing
  const record: ConsentRecord = {
    id: `consent-${Date.now()}-${state.consentRecords.length}`,
    subjectId: safeSubject,
    purpose: safePurpose,
    status,
    framework,
    grantedAt: status === 'granted' ? Date.now() : 0,
    expiresAt: status === 'granted' ? Date.now() + 365 * 24 * 3600_000 : null,
    withdrawnAt: status === 'withdrawn' ? Date.now() : null,
  };
  if (state.consentRecords.length >= 1000) state.consentRecords.shift();
  state.consentRecords.push(record);
  checkExpiringConsents();
  emit({ module: 'sovereign', event_type: 'consent_recorded', outcome: 'succeeded', data: { subjectId: safeSubject, purpose: safePurpose, status } });
  return record;
}

// ─── Consent Expiry Detection ─────────────────────────────────────────────────

function checkExpiringConsents(): void {
  const thirtyDays = Date.now() + 30 * 24 * 3600_000;
  const expiring = state.consentRecords.filter(c =>
    c.status === 'granted' && c.expiresAt && c.expiresAt <= thirtyDays && c.expiresAt > Date.now()
  );
  state.expiringConsents = expiring.length;

  if (expiring.length >= 5) {
    emit({ module: 'sovereign', event_type: 'consent_expiry_warning', outcome: 'failed', data: { count: expiring.length } });
  }
}

// ─── Retention Policies ───────────────────────────────────────────────────────

export function addRetentionPolicy(policy: Omit<DataRetentionPolicy, 'id'>): DataRetentionPolicy {
  if (state.retentionPolicies.length >= 200) state.retentionPolicies.shift();
  const safeRetention = clampNumber(policy.retentionDays, 1, 36500, 365);
  const full: DataRetentionPolicy = { ...policy, retentionDays: safeRetention, id: `rp-${Date.now()}` };
  state.retentionPolicies.push(full);

  // Warn if below framework minimum
  const min = FRAMEWORK_RETENTION_MINIMUMS[policy.framework];
  if (safeRetention < min) {
    emit({ module: 'sovereign', event_type: 'retention_below_minimum', outcome: 'failed', data: { dataType: policy.dataType, retentionDays: safeRetention, frameworkMinimum: min } });
  }

  return full;
}

// ─── Data Classification ──────────────────────────────────────────────────────

export function classifyData(dataType: string, content?: string): DataClassification {
  const topSecret = ['military', 'itar', 'classified', 'secret', 'nuclear', 'weapon'];
  const restricted = ['ssn', 'password', 'credit_card', 'health', 'biometric', 'genetic', 'hipaa'];
  const confidential = ['pii', 'personal', 'financial', 'salary', 'tax', 'medical'];
  const internal = ['internal', 'employee', 'strategy', 'roadmap'];

  const lower = (dataType + ' ' + (content || '')).toLowerCase();

  if (topSecret.some(k => lower.includes(k))) return 'top_secret';
  if (restricted.some(k => lower.includes(k))) return 'restricted';
  if (confidential.some(k => lower.includes(k))) return 'confidential';
  if (internal.some(k => lower.includes(k))) return 'internal';
  return 'public';
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function recalculateScore(): void {
  const recent = state.complianceChecks.slice(-50);
  if (recent.length === 0) { state.complianceScore = 100; return; }
  const compliant = recent.filter(c => c.status === 'compliant').length;
  const partial = recent.filter(c => c.status === 'partially_compliant').length;
  state.complianceScore = Math.round(((compliant + partial * 0.5) / recent.length) * 100);
}

// ─── Health (multi-factor) ────────────────────────────────────────────────────

export function getSovereignHealth(): number {
  if (!state.initialized) return 0;
  if (hardening?.isDegraded()) return Math.min(state.complianceScore, 40);

  let score = 100;

  // Factor 1: Compliance score (weight: 35)
  if (state.complianceScore < 50) score -= 35;
  else if (state.complianceScore < 70) score -= 20;
  else if (state.complianceScore < 85) score -= 10;

  // Factor 2: Violation spike (weight: 25)
  const recentChecks = state.complianceChecks.slice(-20);
  const nonCompliant = recentChecks.filter(c => c.status === 'non_compliant').length;
  if (nonCompliant >= 5) score -= 25;
  else if (nonCompliant >= 3) score -= 15;
  else if (nonCompliant > 0) score -= 5;

  // Factor 3: Jurisdiction gaps (weight: 20)
  if (state.jurisdictionGaps.length > 3) score -= 20;
  else if (state.jurisdictionGaps.length > 0) score -= 10;

  // Factor 4: Expiring consents + retention risks (weight: 20)
  if (state.expiringConsents >= 10) score -= 10;
  else if (state.expiringConsents >= 5) score -= 5;

  const riskyPolicies = state.retentionPolicies.filter(p => p.retentionDays < 30 && p.deleteOnExpiry);
  if (riskyPolicies.length > 3) score -= 10;
  else if (riskyPolicies.length > 0) score -= 5;

  return clampNumber(score, 0, 100, 50);
}

// ─── Accessors ────────────────────────────────────────────────────────────────

export function getSovereignState(): SovereignModuleState { return { ...state }; }
export function getSovereignResilience() { return getModuleResilienceReport('sovereign', getSovereignHealth()); }
export function getSovereignEngine() { return moduleEngine; }
export function getSovereignHardening() { return hardening?.getHardeningReport() ?? null; }
export function upgradeSovereignEngine(newVersion: string) {
  if (moduleEngine && hardening) {
    hardening.snapshot(state);
    moduleEngine = hardening.upgradeEngine(moduleEngine, newVersion);
  }
  return moduleEngine;
}
