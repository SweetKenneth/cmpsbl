/**
 * CONSCIENCE — Jurisdictional Integration
 * Links with SOVEREIGN to adjust ethical thresholds based on
 * regional legal frameworks (GDPR, CCPA, AI Act, etc.).
 *
 * Pure data — no external calls. Framework rules are embedded.
 */

export type Jurisdiction = 'eu' | 'us_california' | 'us_federal' | 'uk' | 'global';

export interface JurisdictionalRule {
  jurisdiction: Jurisdiction;
  framework: string;
  consentRequired: boolean;
  dataMinimization: boolean;
  explainabilityRequired: boolean;
  privacyFloor: number;        // 0-100, minimum privacy score
  transparencyFloor: number;   // 0-100, minimum transparency score
  biasAuditRequired: boolean;
  humanOversightRequired: boolean;
}

const RULES: Record<Jurisdiction, JurisdictionalRule> = {
  eu: {
    jurisdiction: 'eu',
    framework: 'GDPR + EU AI Act',
    consentRequired: true,
    dataMinimization: true,
    explainabilityRequired: true,
    privacyFloor: 80,
    transparencyFloor: 75,
    biasAuditRequired: true,
    humanOversightRequired: true,
  },
  us_california: {
    jurisdiction: 'us_california',
    framework: 'CCPA / CPRA',
    consentRequired: true,
    dataMinimization: false,
    explainabilityRequired: false,
    privacyFloor: 60,
    transparencyFloor: 50,
    biasAuditRequired: false,
    humanOversightRequired: false,
  },
  us_federal: {
    jurisdiction: 'us_federal',
    framework: 'FTC Guidelines',
    consentRequired: false,
    dataMinimization: false,
    explainabilityRequired: false,
    privacyFloor: 40,
    transparencyFloor: 40,
    biasAuditRequired: false,
    humanOversightRequired: false,
  },
  uk: {
    jurisdiction: 'uk',
    framework: 'UK GDPR + ICO',
    consentRequired: true,
    dataMinimization: true,
    explainabilityRequired: true,
    privacyFloor: 75,
    transparencyFloor: 70,
    biasAuditRequired: true,
    humanOversightRequired: false,
  },
  global: {
    jurisdiction: 'global',
    framework: 'CMPSBL Global Baseline',
    consentRequired: true,
    dataMinimization: true,
    explainabilityRequired: true,
    privacyFloor: 70,
    transparencyFloor: 60,
    biasAuditRequired: true,
    humanOversightRequired: false,
  },
};

let activeJurisdiction: Jurisdiction = 'global';

/** Set the active jurisdiction */
export function setJurisdiction(j: Jurisdiction): void {
  activeJurisdiction = j;
}

/** Get the active jurisdiction */
export function getActiveJurisdiction(): Jurisdiction {
  return activeJurisdiction;
}

/** Get rules for a jurisdiction */
export function getJurisdictionalRules(j?: Jurisdiction): JurisdictionalRule {
  return { ...RULES[j ?? activeJurisdiction] };
}

/** Check if an evaluation passes jurisdictional requirements */
export function checkJurisdictionalCompliance(
  compositeScore: number,
  context: {
    hasConsent?: boolean;
    privacyScore?: number;
    transparencyScore?: number;
    hasBiasAudit?: boolean;
    hasHumanOversight?: boolean;
  },
  j?: Jurisdiction,
): { compliant: boolean; violations: string[]; jurisdiction: Jurisdiction } {
  const rules = RULES[j ?? activeJurisdiction];
  const violations: string[] = [];

  if (rules.consentRequired && !context.hasConsent) {
    violations.push(`${rules.framework}: User consent required`);
  }
  if ((context.privacyScore ?? 100) < rules.privacyFloor) {
    violations.push(`${rules.framework}: Privacy score ${context.privacyScore} below floor ${rules.privacyFloor}`);
  }
  if ((context.transparencyScore ?? 100) < rules.transparencyFloor) {
    violations.push(`${rules.framework}: Transparency score ${context.transparencyScore} below floor ${rules.transparencyFloor}`);
  }
  if (rules.biasAuditRequired && !context.hasBiasAudit) {
    violations.push(`${rules.framework}: Bias audit required`);
  }
  if (rules.humanOversightRequired && !context.hasHumanOversight) {
    violations.push(`${rules.framework}: Human oversight required`);
  }

  return {
    compliant: violations.length === 0,
    violations,
    jurisdiction: j ?? activeJurisdiction,
  };
}

/** Get all available jurisdictions */
export function listJurisdictions(): Jurisdiction[] {
  return Object.keys(RULES) as Jurisdiction[];
}
