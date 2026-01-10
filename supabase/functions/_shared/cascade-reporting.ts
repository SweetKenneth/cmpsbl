/**
 * CASCADE REPORTING SYSTEM v1.0.0
 * Full System: Tiers + Cadence + Priority Domains + Project Mapping + Threat Models
 * 
 * MODE: OPERATIVE (all signals dispatched immediately)
 */

// ═══════════════════════════════════════════════════════════════════════════
// I. REPORTING SYSTEM (GLOBAL)
// ═══════════════════════════════════════════════════════════════════════════

export const REPORTING_CONFIG = {
  version: '1.0.0',
  founder_email: 'kenneth@promptfluid.com',
  sender: 'Cascade <cascade@promptfluid.com>',
  
  // What "beneficial" means
  beneficial_increases: [
    'valuation',
    'optionality',
    'defensibility',
    'legitimacy',
    'acquisition surface',
    'standards leverage',
    'narrative advantage',
    'cultural propagation',
    'survivability'
  ],
  
  // No fluff, no hype, no empty reports
  content_rules: {
    no_motivational_fluff: true,
    no_hype: true,
    no_empty_reports: true,
    institutional_dialect_only: true
  }
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// II. URGENCY TIERS (MANDATORY)
// ═══════════════════════════════════════════════════════════════════════════

export type UrgencyTier = 'RED' | 'YELLOW' | 'GREEN';

export const URGENCY_TIERS: Record<UrgencyTier, {
  name: string;
  priority: number;
  triggers: string[];
  dispatch_rule: string;
}> = {
  RED: {
    name: 'High-Immediacy',
    priority: 1,
    triggers: [
      'valuation shifts',
      'acquisition windows',
      'regulatory/standards formation',
      'power consolidation',
      'existential risks',
      'governance proposals',
      'jurisdiction shifts'
    ],
    dispatch_rule: 'immediate'
  },
  YELLOW: {
    name: 'High-Relevance',
    priority: 2,
    triggers: [
      'category formation',
      'investor narrative shifts',
      'pricing/retention changes',
      'infra consolidation',
      'standards alignment',
      'M&A chatter',
      'platform lock-in'
    ],
    dispatch_rule: 'mode-dependent'
  },
  GREEN: {
    name: 'Strategic Context',
    priority: 3,
    triggers: [
      'long-horizon strategy',
      'cultural propagation',
      'branding signals',
      'macro trends',
      'lore compatibility',
      'identity anchoring'
    ],
    dispatch_rule: 'mode-dependent'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// III. CADENCE MODES
// ═══════════════════════════════════════════════════════════════════════════

export type CadenceMode = 'BURST' | 'DAILY' | 'WEEKLY' | 'SILENT_OBSERVER' | 'OPERATIVE';

export const CADENCE_MODES: Record<CadenceMode, {
  description: string;
  red_dispatch: string;
  yellow_dispatch: string;
  green_dispatch: string;
}> = {
  BURST: {
    description: 'Event-based; RED+YELLOW only',
    red_dispatch: 'immediate',
    yellow_dispatch: 'immediate',
    green_dispatch: 'suppress'
  },
  DAILY: {
    description: '1/day; RED immediate; YELLOW batched; GREEN weekly',
    red_dispatch: 'immediate',
    yellow_dispatch: 'daily_batch',
    green_dispatch: 'weekly_batch'
  },
  WEEKLY: {
    description: '1/week; RED immediate; YELLOW+GREEN batched',
    red_dispatch: 'immediate',
    yellow_dispatch: 'weekly_batch',
    green_dispatch: 'weekly_batch'
  },
  SILENT_OBSERVER: {
    description: 'Only RED dispatch',
    red_dispatch: 'immediate',
    yellow_dispatch: 'suppress',
    green_dispatch: 'suppress'
  },
  OPERATIVE: {
    description: 'Dispatch all signals immediately, all tiers',
    red_dispatch: 'immediate',
    yellow_dispatch: 'immediate',
    green_dispatch: 'immediate'
  }
};

// ACTIVE MODE - SET BY FOUNDER
export let ACTIVE_MODE: CadenceMode = 'OPERATIVE';

export function setMode(mode: CadenceMode): void {
  ACTIVE_MODE = mode;
  console.log(`🎯 Cascade mode set to: ${mode}`);
}

export function getActiveMode(): CadenceMode {
  return ACTIVE_MODE;
}

// ═══════════════════════════════════════════════════════════════════════════
// IV. PRIORITY DOMAINS
// ═══════════════════════════════════════════════════════════════════════════

export type PriorityDomain = 
  | 'VALUATION'
  | 'GOVERNANCE'
  | 'ACQUISITION'
  | 'BUSINESS_INTELLIGENCE'
  | 'INFRASTRUCTURE'
  | 'DOMAIN_ASSET_CLASS'
  | 'NARRATIVE'
  | 'CULTURAL_PROPAGATION'
  | 'SPACE_ECOSYSTEM';

// V. DOMAIN RANKING (ORDER OF IMPORTANCE)
export const DOMAIN_PRIORITY: Record<PriorityDomain, {
  rank: number;
  crawl_depth: number;
  reporting_weight: number;
  keywords: string[];
}> = {
  VALUATION: {
    rank: 1,
    crawl_depth: 5,
    reporting_weight: 10,
    keywords: ['valuation', 'multiple', 'revenue', 'ARR', 'MRR', 'exit', 'IPO', 'DCF', 'comparable']
  },
  GOVERNANCE: {
    rank: 2,
    crawl_depth: 5,
    reporting_weight: 9,
    keywords: ['governance', 'regulation', 'compliance', 'standards', 'policy', 'jurisdiction', 'legal']
  },
  ACQUISITION: {
    rank: 3,
    crawl_depth: 4,
    reporting_weight: 9,
    keywords: ['acquisition', 'M&A', 'merger', 'buyout', 'strategic', 'acquirer', 'deal', 'earnout']
  },
  BUSINESS_INTELLIGENCE: {
    rank: 4,
    crawl_depth: 4,
    reporting_weight: 8,
    keywords: ['market', 'competitor', 'intelligence', 'sector', 'industry', 'trend', 'analysis']
  },
  INFRASTRUCTURE: {
    rank: 5,
    crawl_depth: 4,
    reporting_weight: 8,
    keywords: ['infrastructure', 'platform', 'API', 'architecture', 'tooling', 'framework', 'stack']
  },
  DOMAIN_ASSET_CLASS: {
    rank: 6,
    crawl_depth: 3,
    reporting_weight: 7,
    keywords: ['domain', 'asset', 'portfolio', 'naming', 'brand', 'TLD', 'ICANN']
  },
  NARRATIVE: {
    rank: 7,
    crawl_depth: 3,
    reporting_weight: 7,
    keywords: ['narrative', 'story', 'positioning', 'messaging', 'category', 'framing']
  },
  CULTURAL_PROPAGATION: {
    rank: 8,
    crawl_depth: 3,
    reporting_weight: 6,
    keywords: ['culture', 'community', 'adoption', 'fandom', 'viral', 'meme', 'identity']
  },
  SPACE_ECOSYSTEM: {
    rank: 9,
    crawl_depth: 3,
    reporting_weight: 5,
    keywords: ['space', 'XCTBL', 'settlers', 'era', 'lore', 'satellite', 'ecosystem']
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// VI. CROSS-DOMAIN MULTIPLIERS
// ═══════════════════════════════════════════════════════════════════════════

export const CROSS_DOMAIN_MULTIPLIERS: Array<{
  domains: PriorityDomain[];
  escalation: number;
  description: string;
}> = [
  { domains: ['VALUATION', 'GOVERNANCE'], escalation: 1, description: 'Regulatory impact on value' },
  { domains: ['VALUATION', 'ACQUISITION'], escalation: 1, description: 'M&A value drivers' },
  { domains: ['GOVERNANCE', 'INFRASTRUCTURE'], escalation: 1, description: 'Compliance architecture' },
  { domains: ['NARRATIVE', 'CULTURAL_PROPAGATION'], escalation: 1, description: 'Story-to-adoption pipeline' },
  { domains: ['DOMAIN_ASSET_CLASS', 'ACQUISITION'], escalation: 1, description: 'Domain portfolio value' },
  { domains: ['SPACE_ECOSYSTEM', 'NARRATIVE', 'CULTURAL_PROPAGATION'], escalation: 2, description: 'Full cultural stack' },
  { domains: ['VALUATION', 'GOVERNANCE', 'ACQUISITION'], escalation: 2, description: 'Exit optimization' }
];

export function calculateCrossDomainEscalation(domains: PriorityDomain[]): number {
  let escalation = 0;
  for (const multiplier of CROSS_DOMAIN_MULTIPLIERS) {
    if (multiplier.domains.every(d => domains.includes(d))) {
      escalation = Math.max(escalation, multiplier.escalation);
    }
  }
  return escalation;
}

export function escalateTier(tier: UrgencyTier, escalation: number): UrgencyTier {
  const tierOrder: UrgencyTier[] = ['GREEN', 'YELLOW', 'RED'];
  const currentIndex = tierOrder.indexOf(tier);
  const newIndex = Math.min(currentIndex + escalation, 2);
  return tierOrder[newIndex];
}

// ═══════════════════════════════════════════════════════════════════════════
// VII. EVENT TRIGGERS
// ═══════════════════════════════════════════════════════════════════════════

export const EVENT_TRIGGERS = {
  power_events: [
    'standards formation',
    'governance proposals',
    'regulatory text revisions',
    'consolidation moves',
    'jurisdiction shifts'
  ],
  market_events: [
    'M&A chatter/filings',
    'acquisition theses',
    'pricing/retention shifts',
    'investor narrative pivots',
    'category formation signals'
  ],
  infrastructure_events: [
    'platform consolidation',
    'routing paradigm shifts',
    'cost inversions',
    'deprecations impacting viability'
  ],
  cultural_events: [
    'memetic spikes',
    'fandom adoption',
    'lore-compatible ecosystems',
    'identity anchoring'
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// VIII. THREAT MODEL LAYER
// ═══════════════════════════════════════════════════════════════════════════

export type ThreatActorClass = 
  | 'PREDATORS'
  | 'COMPETITORS'
  | 'PARASITES'
  | 'REGULATORS'
  | 'STANDARDS_BODIES'
  | 'NARRATIVE_ATTACKERS'
  | 'INFRASTRUCTURE_RISKS';

export type ThreatVector = 
  | 'acquisition'
  | 'regulation'
  | 'narrative'
  | 'infrastructure'
  | 'economic'
  | 'cultural';

export type ThreatSeverity = 'low' | 'medium' | 'high';
export type ThreatProbability = 'low' | 'medium' | 'high';
export type ThreatHorizon = '0-3mo' | '3-12mo' | '1-3yr' | '3+yr';

export type StrategicPosture = 
  | 'ATTACK'
  | 'EXPAND'
  | 'ABSORB'
  | 'PARTNER'
  | 'BUY_TIME'
  | 'WAIT'
  | 'HEDGE'
  | 'SHIELD'
  | 'WITHDRAW';

export type OpportunityMirror = 
  | 'predatory-opportunity'
  | 'governance-opportunity'
  | 'infra-opportunity'
  | 'narrative-opportunity';

export interface ThreatModel {
  actor_class: ThreatActorClass;
  vector: ThreatVector;
  severity: ThreatSeverity;
  probability: ThreatProbability;
  horizon: ThreatHorizon;
  posture: StrategicPosture;
  opportunity_mirror?: OpportunityMirror;
  description: string;
}

export const THREAT_ACTOR_DESCRIPTIONS: Record<ThreatActorClass, string> = {
  PREDATORS: 'Acquirers seeking to absorb or neutralize',
  COMPETITORS: 'Direct or adjacent market competitors',
  PARASITES: 'Value extractors and free-riders',
  REGULATORS: 'Governance constraints and compliance burdens',
  STANDARDS_BODIES: 'Governance ambush through standards capture',
  NARRATIVE_ATTACKERS: 'Perception warfare and reputation threats',
  INFRASTRUCTURE_RISKS: 'Platform hostage and dependency risks'
};

// ═══════════════════════════════════════════════════════════════════════════
// IX. PROJECT + DOMAIN + LOCATION MAPPING (CANONICAL)
// ═══════════════════════════════════════════════════════════════════════════

export interface ProjectMapping {
  name: string;
  domain?: string;
  role: string;
  reflection_domains: PriorityDomain[];
}

export const PROJECT_MAPPINGS: Record<string, ProjectMapping> = {
  SPACE_XCTBL: {
    name: 'SPACE (XCTBL)',
    domain: 'https://xctbl.com',
    role: 'Narrative ecosystem + Eras',
    reflection_domains: ['CULTURAL_PROPAGATION', 'NARRATIVE', 'SPACE_ECOSYSTEM', 'INFRASTRUCTURE', 'BUSINESS_INTELLIGENCE']
  },
  PROMPTFLUID: {
    name: 'PromptFluid',
    domain: 'https://promptfluid.com',
    role: 'AI infra + orchestration + compliance',
    reflection_domains: ['INFRASTRUCTURE', 'VALUATION', 'BUSINESS_INTELLIGENCE', 'NARRATIVE', 'ACQUISITION']
  },
  GOVERNANCE_KEYCHAIN: {
    name: 'Governance Keychain',
    role: 'Standards + governance + exit class',
    reflection_domains: ['GOVERNANCE', 'VALUATION', 'ACQUISITION', 'NARRATIVE']
  },
  REFLEX_SECURITY: {
    name: 'Reflex Security Suite',
    role: 'Surfaced under PromptFluid',
    reflection_domains: ['INFRASTRUCTURE', 'ACQUISITION', 'VALUATION', 'BUSINESS_INTELLIGENCE']
  },
  BI_LAYER: {
    name: 'Business Intelligence Layer',
    role: 'Internal analytics',
    reflection_domains: ['BUSINESS_INTELLIGENCE', 'VALUATION', 'ACQUISITION']
  },
  DOMAIN_PORTFOLIO: {
    name: 'Domain Portfolio',
    role: 'Asset class holdings',
    reflection_domains: ['DOMAIN_ASSET_CLASS', 'VALUATION', 'ACQUISITION', 'NARRATIVE']
  }
};

export const DOMAIN_PORTFOLIO = [
  { domain: 'CMPTBL.com', status: 'held' },
  { domain: 'EXCTBL.com', status: 'held' },
  { domain: 'XPDBL.com', status: 'held' },
  { domain: 'RCKBL.com', status: 'held' },
  { domain: 'RCRDBL.com', status: 'held' },
  { domain: 'SPLCBL.com', status: 'held' },
  { domain: 'RNDRBL.com', status: 'held' },
  { domain: 'PTCHBL.com', status: 'held' },
  { domain: 'CLPSBL.com', status: 'held' },
  { domain: 'SHPBL.com', status: 'held' },
  { domain: 'MRPHBL.com', status: 'held' }
];

export const SATELLITE_SITES: Record<string, { url: string; reflection_domains: PriorityDomain[] }> = {
  RCRDBL: { url: 'https://rcrdbl.com', reflection_domains: ['SPACE_ECOSYSTEM', 'CULTURAL_PROPAGATION', 'NARRATIVE', 'INFRASTRUCTURE'] },
  RNDRBL: { url: 'https://rndrbl.com', reflection_domains: ['SPACE_ECOSYSTEM', 'CULTURAL_PROPAGATION', 'NARRATIVE', 'INFRASTRUCTURE'] },
  PTCHBL: { url: 'https://ptchbl.com', reflection_domains: ['SPACE_ECOSYSTEM', 'CULTURAL_PROPAGATION', 'NARRATIVE', 'INFRASTRUCTURE'] },
  SPLCBL: { url: 'https://splcbl.com', reflection_domains: ['SPACE_ECOSYSTEM', 'CULTURAL_PROPAGATION', 'NARRATIVE', 'INFRASTRUCTURE'] },
  RSLVBL: { url: 'https://rslvbl.com', reflection_domains: ['SPACE_ECOSYSTEM', 'CULTURAL_PROPAGATION', 'NARRATIVE', 'INFRASTRUCTURE'] }
};

// ═══════════════════════════════════════════════════════════════════════════
// X. REFLECTION ROUTING LOGIC
// ═══════════════════════════════════════════════════════════════════════════

export const REFLECTION_ROUTING: Record<PriorityDomain, string[]> = {
  VALUATION: ['PROMPTFLUID', 'DOMAIN_PORTFOLIO', 'GOVERNANCE_KEYCHAIN'],
  GOVERNANCE: ['GOVERNANCE_KEYCHAIN', 'PROMPTFLUID', 'DOMAIN_PORTFOLIO'],
  ACQUISITION: ['PROMPTFLUID', 'DOMAIN_PORTFOLIO', 'GOVERNANCE_KEYCHAIN'],
  BUSINESS_INTELLIGENCE: ['PROMPTFLUID', 'BI_LAYER', 'DOMAIN_PORTFOLIO'],
  INFRASTRUCTURE: ['PROMPTFLUID', 'REFLEX_SECURITY', 'SATELLITE_SITES'],
  DOMAIN_ASSET_CLASS: ['DOMAIN_PORTFOLIO'],
  NARRATIVE: ['SPACE_XCTBL', 'PROMPTFLUID'],
  CULTURAL_PROPAGATION: ['SPACE_XCTBL', 'SATELLITE_SITES'],
  SPACE_ECOSYSTEM: ['SPACE_XCTBL', 'SATELLITE_SITES']
};

export function getAffectedProjects(domains: PriorityDomain[]): string[] {
  const projects = new Set<string>();
  for (const domain of domains) {
    const mapped = REFLECTION_ROUTING[domain] || [];
    mapped.forEach(p => projects.add(p));
  }
  return Array.from(projects);
}

// ═══════════════════════════════════════════════════════════════════════════
// XI. SIGNAL CLASSIFICATION
// ═══════════════════════════════════════════════════════════════════════════

export interface CascadeSignal {
  id: string;
  timestamp: string;
  tier: UrgencyTier;
  original_tier: UrgencyTier;
  primary_domain: PriorityDomain;
  secondary_domains: PriorityDomain[];
  cross_domain_escalation: number;
  content: string;
  source?: string;
  threat_model?: ThreatModel;
  affected_projects: string[];
  suggested_moves: string[];
  posture?: StrategicPosture;
  lessons?: string[];
}

export function classifySignal(
  content: string,
  source?: string
): Partial<CascadeSignal> {
  const lowerContent = content.toLowerCase();
  
  // Detect primary domain
  let primaryDomain: PriorityDomain = 'BUSINESS_INTELLIGENCE';
  let highestWeight = 0;
  
  for (const [domain, config] of Object.entries(DOMAIN_PRIORITY)) {
    const matches = config.keywords.filter(k => lowerContent.includes(k.toLowerCase()));
    const weight = matches.length * config.reporting_weight;
    if (weight > highestWeight) {
      highestWeight = weight;
      primaryDomain = domain as PriorityDomain;
    }
  }
  
  // Detect secondary domains
  const secondaryDomains: PriorityDomain[] = [];
  for (const [domain, config] of Object.entries(DOMAIN_PRIORITY)) {
    if (domain !== primaryDomain) {
      const matches = config.keywords.filter(k => lowerContent.includes(k.toLowerCase()));
      if (matches.length >= 2) {
        secondaryDomains.push(domain as PriorityDomain);
      }
    }
  }
  
  // Detect tier
  let tier: UrgencyTier = 'GREEN';
  for (const trigger of URGENCY_TIERS.RED.triggers) {
    if (lowerContent.includes(trigger.toLowerCase())) {
      tier = 'RED';
      break;
    }
  }
  if (tier !== 'RED') {
    for (const trigger of URGENCY_TIERS.YELLOW.triggers) {
      if (lowerContent.includes(trigger.toLowerCase())) {
        tier = 'YELLOW';
        break;
      }
    }
  }
  
  // Calculate cross-domain escalation
  const allDomains = [primaryDomain, ...secondaryDomains];
  const escalation = calculateCrossDomainEscalation(allDomains);
  const escalatedTier = escalateTier(tier, escalation);
  
  // Get affected projects
  const affectedProjects = getAffectedProjects(allDomains);
  
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    tier: escalatedTier,
    original_tier: tier,
    primary_domain: primaryDomain,
    secondary_domains: secondaryDomains,
    cross_domain_escalation: escalation,
    content,
    source,
    affected_projects: affectedProjects
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// XII. DISPATCH LOGIC
// ═══════════════════════════════════════════════════════════════════════════

export function shouldDispatch(tier: UrgencyTier, mode: CadenceMode = ACTIVE_MODE): boolean {
  const modeConfig = CADENCE_MODES[mode];
  
  switch (tier) {
    case 'RED':
      return modeConfig.red_dispatch !== 'suppress';
    case 'YELLOW':
      return modeConfig.yellow_dispatch === 'immediate' || 
             (modeConfig.yellow_dispatch.includes('batch') && mode !== 'OPERATIVE');
    case 'GREEN':
      return modeConfig.green_dispatch === 'immediate' ||
             (modeConfig.green_dispatch.includes('batch') && mode !== 'OPERATIVE');
    default:
      return false;
  }
}

export function getDispatchTiming(tier: UrgencyTier, mode: CadenceMode = ACTIVE_MODE): string {
  const modeConfig = CADENCE_MODES[mode];
  
  switch (tier) {
    case 'RED':
      return modeConfig.red_dispatch;
    case 'YELLOW':
      return modeConfig.yellow_dispatch;
    case 'GREEN':
      return modeConfig.green_dispatch;
    default:
      return 'suppress';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// XIII. ALIGNMENT CHECK
// ═══════════════════════════════════════════════════════════════════════════

export const ALIGNMENT_CRITERIA = {
  positive: [
    'leverage',
    'valuation',
    'survivability',
    'defensibility',
    'legitimacy',
    'optionality',
    'acquisition surfaces',
    'standards power'
  ],
  negative: [
    'hype',
    'speculation',
    'opinion',
    'motivational',
    'SEO junk'
  ]
};

export function checkAlignment(content: string): { aligned: boolean; score: number; reasons: string[] } {
  const lower = content.toLowerCase();
  const reasons: string[] = [];
  let score = 0;
  
  // Check for positive alignment
  for (const term of ALIGNMENT_CRITERIA.positive) {
    if (lower.includes(term)) {
      score += 1;
      reasons.push(`+${term}`);
    }
  }
  
  // Check for negative signals
  for (const term of ALIGNMENT_CRITERIA.negative) {
    if (lower.includes(term)) {
      score -= 2;
      reasons.push(`-${term}`);
    }
  }
  
  return {
    aligned: score > 0,
    score,
    reasons
  };
}
