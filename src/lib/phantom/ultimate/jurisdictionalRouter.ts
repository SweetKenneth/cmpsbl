/**
 * PHANTOM Ultimate — Jurisdictional Privacy Router
 * Routes data processing through jurisdiction-appropriate privacy rules.
 * GDPR, CCPA, HIPAA, LGPD, PIPEDA support. Works with SOVEREIGN for residency.
 */

export type Jurisdiction = 'GDPR' | 'CCPA' | 'HIPAA' | 'LGPD' | 'PIPEDA' | 'POPIA' | 'APPI' | 'DEFAULT';

export interface JurisdictionRule {
  jurisdiction: Jurisdiction;
  maxEpsilon: number;
  requireExplicitConsent: boolean;
  rightToErasure: boolean;
  dataMinimization: boolean;
  retentionMaxDays: number;
  crossBorderAllowed: boolean;
  specialCategories: string[];  // fields requiring extra protection
  description: string;
}

export interface RoutingDecision {
  id: string;
  entityId: string;
  detectedJurisdiction: Jurisdiction;
  appliedRules: JurisdictionRule;
  overrides: string[];
  decidedAt: number;
}

export interface JurisdictionalStats {
  totalDecisions: number;
  decisionsByJurisdiction: Record<string, number>;
  crossBorderBlocks: number;
  avgEpsilonCap: number;
}

const MAX_DECISIONS = 1000;

const JURISDICTION_RULES: Record<Jurisdiction, JurisdictionRule> = {
  GDPR: {
    jurisdiction: 'GDPR', maxEpsilon: 1.0,
    requireExplicitConsent: true, rightToErasure: true,
    dataMinimization: true, retentionMaxDays: 365 * 3,
    crossBorderAllowed: false,
    specialCategories: ['health', 'biometric', 'genetic', 'political', 'religious', 'sexual_orientation'],
    description: 'EU General Data Protection Regulation',
  },
  CCPA: {
    jurisdiction: 'CCPA', maxEpsilon: 3.0,
    requireExplicitConsent: false, rightToErasure: true,
    dataMinimization: false, retentionMaxDays: 365 * 5,
    crossBorderAllowed: true,
    specialCategories: ['financial', 'geolocation'],
    description: 'California Consumer Privacy Act',
  },
  HIPAA: {
    jurisdiction: 'HIPAA', maxEpsilon: 0.5,
    requireExplicitConsent: true, rightToErasure: false,
    dataMinimization: true, retentionMaxDays: 365 * 6,
    crossBorderAllowed: false,
    specialCategories: ['health', 'medical_record', 'insurance', 'treatment'],
    description: 'Health Insurance Portability and Accountability Act',
  },
  LGPD: {
    jurisdiction: 'LGPD', maxEpsilon: 1.5,
    requireExplicitConsent: true, rightToErasure: true,
    dataMinimization: true, retentionMaxDays: 365 * 3,
    crossBorderAllowed: false,
    specialCategories: ['health', 'biometric', 'genetic', 'political', 'religious'],
    description: 'Brazil Lei Geral de Proteção de Dados',
  },
  PIPEDA: {
    jurisdiction: 'PIPEDA', maxEpsilon: 2.0,
    requireExplicitConsent: true, rightToErasure: true,
    dataMinimization: true, retentionMaxDays: 365 * 5,
    crossBorderAllowed: true,
    specialCategories: ['health', 'financial'],
    description: 'Canada Personal Information Protection',
  },
  POPIA: {
    jurisdiction: 'POPIA', maxEpsilon: 1.5,
    requireExplicitConsent: true, rightToErasure: true,
    dataMinimization: true, retentionMaxDays: 365 * 3,
    crossBorderAllowed: false,
    specialCategories: ['health', 'biometric', 'religious', 'political'],
    description: 'South Africa Protection of Personal Information Act',
  },
  APPI: {
    jurisdiction: 'APPI', maxEpsilon: 2.0,
    requireExplicitConsent: true, rightToErasure: false,
    dataMinimization: true, retentionMaxDays: 365 * 5,
    crossBorderAllowed: false,
    specialCategories: ['health', 'criminal', 'racial'],
    description: 'Japan Act on Protection of Personal Information',
  },
  DEFAULT: {
    jurisdiction: 'DEFAULT', maxEpsilon: 5.0,
    requireExplicitConsent: false, rightToErasure: false,
    dataMinimization: false, retentionMaxDays: 365 * 7,
    crossBorderAllowed: true,
    specialCategories: [],
    description: 'Default baseline privacy rules',
  },
};

const decisions: RoutingDecision[] = [];
let crossBorderBlocks = 0;

export function getJurisdictionRules(jurisdiction: Jurisdiction): JurisdictionRule {
  return JURISDICTION_RULES[jurisdiction] ?? JURISDICTION_RULES.DEFAULT;
}

export function routeByJurisdiction(entityId: string, jurisdiction: Jurisdiction): RoutingDecision {
  const rules = getJurisdictionRules(jurisdiction);
  const overrides: string[] = [];

  // Apply strictest interpretation
  if (rules.requireExplicitConsent) overrides.push('explicit_consent_required');
  if (rules.dataMinimization) overrides.push('data_minimization_enforced');
  if (!rules.crossBorderAllowed) {
    overrides.push('cross_border_blocked');
    crossBorderBlocks++;
  }

  const decision: RoutingDecision = {
    id: `jrd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    entityId, detectedJurisdiction: jurisdiction,
    appliedRules: rules, overrides, decidedAt: Date.now(),
  };

  if (decisions.length >= MAX_DECISIONS) decisions.shift();
  decisions.push(decision);
  return decision;
}

export function getStrictestRules(jurisdictions: Jurisdiction[]): JurisdictionRule {
  const rules = jurisdictions.map(j => JURISDICTION_RULES[j] ?? JURISDICTION_RULES.DEFAULT);
  return {
    jurisdiction: 'DEFAULT',
    maxEpsilon: Math.min(...rules.map(r => r.maxEpsilon)),
    requireExplicitConsent: rules.some(r => r.requireExplicitConsent),
    rightToErasure: rules.some(r => r.rightToErasure),
    dataMinimization: rules.some(r => r.dataMinimization),
    retentionMaxDays: Math.min(...rules.map(r => r.retentionMaxDays)),
    crossBorderAllowed: rules.every(r => r.crossBorderAllowed),
    specialCategories: [...new Set(rules.flatMap(r => r.specialCategories))],
    description: `Composite of ${jurisdictions.join(', ')}`,
  };
}

export function getJurisdictionalStats(): JurisdictionalStats {
  const byJurisdiction: Record<string, number> = {};
  for (const d of decisions) {
    byJurisdiction[d.detectedJurisdiction] = (byJurisdiction[d.detectedJurisdiction] ?? 0) + 1;
  }
  const allRules = decisions.map(d => d.appliedRules);
  return {
    totalDecisions: decisions.length,
    decisionsByJurisdiction: byJurisdiction,
    crossBorderBlocks,
    avgEpsilonCap: allRules.length > 0 ? allRules.reduce((s, r) => s + r.maxEpsilon, 0) / allRules.length : 5,
  };
}

export function resetJurisdictionalState(): void { decisions.length = 0; crossBorderBlocks = 0; }
