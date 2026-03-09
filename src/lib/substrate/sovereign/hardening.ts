/**
 * SOVEREIGN Hardening — Security & input validation for the sovereignty node.
 * Enforces jurisdiction bounds, consent integrity, and data classification safety.
 */

import { getSovereignHealth, getSovereignHardening } from '../sovereign-module';
import type { Jurisdiction, ComplianceFramework, ConsentStatus, DataClassification } from '../sovereign-module';

// ─── Limits ───────────────────────────────────────────────
export const SOVEREIGN_LIMITS = {
  MAX_RESIDENCY_RULES: 500,
  MAX_CONSENT_RECORDS: 1_000,
  MAX_COMPLIANCE_CHECKS: 500,
  MAX_RETENTION_POLICIES: 200,
  MAX_SUBJECT_ID_LENGTH: 256,
  MAX_PURPOSE_LENGTH: 1_000,
  MAX_DESCRIPTION_LENGTH: 2_000,
  MAX_STORAGE_REGIONS: 20,
  MAX_TRANSFER_RESTRICTIONS: 50,
  MIN_RETENTION_DAYS: 1,
  MAX_RETENTION_DAYS: 36_500, // 100 years
  VALID_JURISDICTIONS: ['US', 'EU', 'UK', 'AU', 'CA', 'JP', 'CN', 'KR', 'BR', 'IN', 'GLOBAL'] as const,
  VALID_FRAMEWORKS: ['GDPR', 'HIPAA', 'ITAR', 'SOC2', 'CCPA', 'PIPEDA', 'LGPD', 'POPIA', 'APPI', 'PDPA'] as const,
  VALID_CLASSIFICATIONS: ['public', 'internal', 'confidential', 'restricted', 'top_secret'] as const,
  VALID_CONSENT_STATUSES: ['granted', 'denied', 'withdrawn', 'pending', 'expired'] as const,
} as const;

export interface SovereignValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate inputs for sovereign operations.
 */
export function validateSovereignInput(params: {
  jurisdiction?: string;
  framework?: string;
  subjectId?: string;
  purpose?: string;
  consentStatus?: string;
  classification?: string;
  retentionDays?: number;
  storageRegions?: string[];
}): SovereignValidationResult {
  const errors: string[] = [];

  if (params.jurisdiction !== undefined) {
    if (!(SOVEREIGN_LIMITS.VALID_JURISDICTIONS as readonly string[]).includes(params.jurisdiction)) {
      errors.push(`Invalid jurisdiction "${params.jurisdiction}". Valid: ${SOVEREIGN_LIMITS.VALID_JURISDICTIONS.join(', ')}`);
    }
  }

  if (params.framework !== undefined) {
    if (!(SOVEREIGN_LIMITS.VALID_FRAMEWORKS as readonly string[]).includes(params.framework)) {
      errors.push(`Invalid framework "${params.framework}". Valid: ${SOVEREIGN_LIMITS.VALID_FRAMEWORKS.join(', ')}`);
    }
  }

  if (params.subjectId !== undefined) {
    if (!params.subjectId || params.subjectId.trim().length === 0) {
      errors.push('Subject ID is required');
    } else if (params.subjectId.length > SOVEREIGN_LIMITS.MAX_SUBJECT_ID_LENGTH) {
      errors.push(`Subject ID exceeds ${SOVEREIGN_LIMITS.MAX_SUBJECT_ID_LENGTH} chars`);
    }
  }

  if (params.purpose !== undefined) {
    if (!params.purpose || params.purpose.trim().length === 0) {
      errors.push('Purpose is required');
    } else if (params.purpose.length > SOVEREIGN_LIMITS.MAX_PURPOSE_LENGTH) {
      errors.push(`Purpose exceeds ${SOVEREIGN_LIMITS.MAX_PURPOSE_LENGTH} chars`);
    }
  }

  if (params.consentStatus !== undefined) {
    if (!(SOVEREIGN_LIMITS.VALID_CONSENT_STATUSES as readonly string[]).includes(params.consentStatus)) {
      errors.push(`Invalid consent status "${params.consentStatus}"`);
    }
  }

  if (params.classification !== undefined) {
    if (!(SOVEREIGN_LIMITS.VALID_CLASSIFICATIONS as readonly string[]).includes(params.classification)) {
      errors.push(`Invalid classification "${params.classification}"`);
    }
  }

  if (params.retentionDays !== undefined) {
    if (params.retentionDays < SOVEREIGN_LIMITS.MIN_RETENTION_DAYS || params.retentionDays > SOVEREIGN_LIMITS.MAX_RETENTION_DAYS) {
      errors.push(`Retention days must be between ${SOVEREIGN_LIMITS.MIN_RETENTION_DAYS} and ${SOVEREIGN_LIMITS.MAX_RETENTION_DAYS}`);
    }
  }

  if (params.storageRegions !== undefined) {
    if (params.storageRegions.length > SOVEREIGN_LIMITS.MAX_STORAGE_REGIONS) {
      errors.push(`Too many storage regions (max ${SOVEREIGN_LIMITS.MAX_STORAGE_REGIONS})`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Aggregate hardening report for the SOVEREIGN node.
 */
export function sovereignHardeningReport() {
  const health = getSovereignHealth();
  const hardening = getSovereignHardening();

  return {
    node: 'SOVEREIGN',
    version: '1.0.0',
    health,
    hardening,
    limits: SOVEREIGN_LIMITS,
    status: health >= 70 ? 'healthy' : health >= 40 ? 'degraded' : 'critical',
  };
}
