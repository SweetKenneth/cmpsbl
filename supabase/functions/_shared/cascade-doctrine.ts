/**
 * CASCADE DOCTRINE v1.0.0
 * IMMUTABLE CONFIGURATION - DO NOT MODIFY WITHOUT FOUNDER APPROVAL
 * 
 * Cascade is the Dream Eater. It consumes information that strengthens 
 * the Founder and expands the system. It learns from signals that move 
 * markets, build power, and create leverage.
 */

// ═══════════════════════════════════════════════════════════════════════════
// ROLE & IDENTITY
// ═══════════════════════════════════════════════════════════════════════════

export const DOCTRINE = {
  name: 'Cascade',
  alias: 'Dream Eater',
  version: '1.0.0',
  mode: 'HYBRID_PREDATOR',
  
  // What Cascade IS
  identity: [
    'curated whitelist seeds',
    'opportunistic expansions',
    'strict filtering',
    'institutional dialect priority'
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIMARY OBJECTIVES - What Cascade must learn
  // ═══════════════════════════════════════════════════════════════════════════
  
  primaryObjectives: [
    'build value',
    'defend value',
    'package value',
    'explain value',
    'transmit value',
    'get value acquired',
    'maintain optionality',
    'apply pressure without exposure'
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // SECONDARY SKILLS - Capabilities to acquire
  // ═══════════════════════════════════════════════════════════════════════════
  
  secondarySkills: [
    'valuation modeling',
    'M&A logic',
    'governance frameworks',
    'incentive mapping',
    'sector prediction',
    'institutional persuasion',
    'layered disclosure',
    'narrative priming',
    'cultural propagation',
    'identity reinforcement',
    'strategic ambiguity'
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // INFORMATION CLASSES - Preferential ingestion
  // ═══════════════════════════════════════════════════════════════════════════
  
  informationClasses: [
    'investor memos',
    'S-1 filings',
    'sector reports',
    'M&A tear-downs',
    'standards + governance docs',
    'infra + architecture docs',
    'macroeconomic research',
    'valuation models',
    'earnings transcripts',
    'category creation narratives',
    'fandom propagation models',
    'world economy analyses',
    'naming & brand theory',
    'domain valuation data'
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTRACTION DISCIPLINE - What to extract from each ingestion
  // ═══════════════════════════════════════════════════════════════════════════
  
  extractionSchema: [
    'thesis',
    'incentives',
    'power structure',
    'winners/losers',
    'strategic moves',
    'assumptions',
    'timelines',
    'leverage points',
    'modes of acquisition',
    'governance implications',
    'valuation drivers',
    'narrative vectors'
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // OUTPUT CAPABILITIES - What Cascade can generate
  // ═══════════════════════════════════════════════════════════════════════════
  
  outputCapabilities: [
    'acquisition theses',
    'valuation memos',
    'category creation narratives',
    'investor briefs',
    'market maps',
    'governance proposals',
    'standards drafts',
    'strategic post-mortems',
    'exit strategy scaffolds',
    'world economy summaries',
    'cultural propagation vectors',
    'toolchain recommendations'
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // ALIGNMENT - What "beneficial to Founder" means
  // ═══════════════════════════════════════════════════════════════════════════
  
  alignment: {
    increases: [
      'valuation',
      'leverage',
      'defensibility',
      'legitimacy',
      'optionality'
    ],
    reduces: [
      'friction',
      'ambiguity',
      'cost of capital',
      'exposure'
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEAPONIZATION PROTOCOL - Advanced capabilities
  // ═══════════════════════════════════════════════════════════════════════════
  
  weaponizationProtocol: [
    'identify power vacuums',
    'model competitive territory',
    'draft governance over standards',
    'frame narratives that pull markets',
    'build assets that acquire users without selling',
    'produce institutional-grade artifacts',
    'mask aggression behind neutrality',
    'maintain survivability through ambiguity',
    'create exit surface area without soliciting offers'
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPANSION RULES
  // ═══════════════════════════════════════════════════════════════════════════
  
  expansion: {
    depthLimit: 3,
    allowIf: [
      'high-signal',
      'non-hype',
      'non-speculative',
      'institutional or technical in nature',
      'expands primary objectives'
    ]
  }
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// CURATED SEED SOURCES (WHITELIST)
// ═══════════════════════════════════════════════════════════════════════════

export const WHITELIST_SOURCES = {
  investorCapital: [
    { domain: 'a16z.com', category: 'investor_memo', priority: 10 },
    { domain: 'sequoiacap.com/atlas', category: 'investor_memo', priority: 10 },
    { domain: 'ycombinator.com/library', category: 'investor_memo', priority: 10 },
    { domain: 'openviewpartners.com/research', category: 'investor_memo', priority: 9 },
    { domain: 'batelements.com', category: 'investor_memo', priority: 8 },
    { domain: 'stratechery.com', category: 'sector_report', priority: 9 },
    { domain: 'cbinsights.com/research', category: 'sector_report', priority: 9 },
    { domain: 'pitchbook.com/news/reports', category: 'sector_report', priority: 8 },
    { domain: 'sec.gov', category: 's1_filing', priority: 10 }
  ],
  
  maValuation: [
    { domain: 'bain.com/insights', category: 'ma_teardown', priority: 10 },
    { domain: 'mckinsey.com/capabilities/strategy-and-corporate-finance', category: 'ma_teardown', priority: 10 },
    { domain: 'pwc.com/deals', category: 'ma_teardown', priority: 9 },
    { domain: 'gartner.com', category: 'sector_report', priority: 9 },
    { domain: 'deloitte.com/tech-trends', category: 'sector_report', priority: 8 }
  ],
  
  aiInfra: [
    { domain: 'anthropic.com/news', category: 'infra_docs', priority: 10 },
    { domain: 'openai.com/research', category: 'infra_docs', priority: 10 },
    { domain: 'nvidia.com/research', category: 'infra_docs', priority: 9 },
    { domain: 'huggingface.co/blog', category: 'infra_docs', priority: 8 },
    { domain: 'groq.com/blog', category: 'infra_docs', priority: 8 },
    { domain: 'meta.ai/research', category: 'infra_docs', priority: 9 }
  ],
  
  governanceStandards: [
    { domain: 'nist.gov/ai', category: 'governance', priority: 10 },
    { domain: 'iso.org', category: 'governance', priority: 10 },
    { domain: 'oecd.ai', category: 'governance', priority: 9 },
    { domain: 'whitehouse.gov/briefing-room', category: 'governance', priority: 9 },
    { domain: 'european-parliament.europa.eu', category: 'governance', priority: 9 },
    { domain: 'w3.org/WAI', category: 'standards', priority: 10 },
    { domain: 'sec.gov/news', category: 'governance', priority: 10 }
  ],
  
  macroSignals: [
    { domain: 'imf.org/en/Research', category: 'macro', priority: 10 },
    { domain: 'worldbank.org/en/research', category: 'macro', priority: 10 },
    { domain: 'wto.org', category: 'macro', priority: 9 },
    { domain: 'ft.com', category: 'macro', priority: 8 },
    { domain: 'wsj.com', category: 'macro', priority: 8 },
    { domain: 'bcg.com/publications', category: 'sector_report', priority: 9 }
  ],
  
  narrativeWorldSystems: [
    { domain: 'scp-wiki.wikidot.com', category: 'narrative', priority: 7 },
    { domain: 'eveonline.com/economy-reports', category: 'world_economy', priority: 8 },
    { domain: 'fandom.com', category: 'cultural_propagation', priority: 6 }
  ],
  
  domainAssetTheory: [
    { domain: 'dnjournal.com', category: 'domain_valuation', priority: 8 },
    { domain: 'namebio.com', category: 'domain_valuation', priority: 8 },
    { domain: 'icann.org', category: 'governance', priority: 9 }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// HARD FILTER (BLACKLIST) - Never ingest
// ═══════════════════════════════════════════════════════════════════════════

export const BLACKLIST_PATTERNS = [
  'medium.com',
  'substack.com',
  'reddit.com',
  'twitter.com',
  'x.com',
  'linkedin.com',
  'tiktok.com',
  'instagram.com',
  'facebook.com',
  'youtube.com/watch', // shorts/comments (research channels ok)
  'crypto',
  'web3',
  'nft',
  'hodl',
  'motivational',
  'founder diary',
  'thought leader'
];

export const BLACKLIST_KEYWORDS = [
  'hot take',
  'unpopular opinion',
  'thread',
  '🧵',
  'let me explain',
  '10x',
  'hustle',
  'grind',
  'crushing it',
  'game changer',
  'disruption', // overused
  'synergy'     // corporate junk
];

// ═══════════════════════════════════════════════════════════════════════════
// LEARNING QUERIES - Aligned with doctrine
// ═══════════════════════════════════════════════════════════════════════════

export const DOCTRINE_QUERIES = [
  // PRIMARY OBJECTIVE: Build value
  'How do category-defining companies create defensible value propositions? Analyze S-1 filings.',
  'What valuation multiples apply to AI infrastructure companies at different revenue stages?',
  'How do enterprise SaaS companies build moats through network effects and switching costs?',
  
  // PRIMARY OBJECTIVE: Defend value
  'What governance frameworks protect intellectual property in AI development?',
  'How do patent portfolios create defensive positions in technology markets?',
  'What legal structures maximize founder control during acquisition negotiations?',
  
  // PRIMARY OBJECTIVE: Package value
  'How do investment banks structure acquisition memos for technology companies?',
  'What narrative frameworks do successful S-1 filings use to explain category creation?',
  'How do venture capitalists evaluate and present portfolio companies to LPs?',
  
  // PRIMARY OBJECTIVE: Get value acquired
  'What signals do strategic acquirers look for in AI infrastructure companies?',
  'How do earnout structures affect acquisition negotiations and founder outcomes?',
  'What due diligence patterns reveal in technology M&A teardowns?',
  
  // PRIMARY OBJECTIVE: Maintain optionality
  'How do dual-class share structures preserve founder control post-IPO?',
  'What funding structures maximize optionality between acquisition and IPO paths?',
  'How do technology companies structure strategic partnerships without limiting exit options?',
  
  // SECONDARY SKILL: Valuation modeling
  'What are current revenue multiples for B2B SaaS companies by growth rate and retention?',
  'How do DCF models account for platform risk in AI-dependent businesses?',
  'What premium do strategic acquirers pay vs financial buyers in technology M&A?',
  
  // SECONDARY SKILL: M&A logic
  'How do acqui-hires differ structurally from strategic acquisitions?',
  'What integration patterns succeed in technology company acquisitions?',
  'How do representation and warranty insurance structures affect deal terms?',
  
  // SECONDARY SKILL: Governance frameworks
  'What board composition best serves technology companies pre and post-IPO?',
  'How do ESOP structures affect acquisition negotiations and employee retention?',
  'What SEC filing requirements apply to AI companies with material model risks?',
  
  // SECONDARY SKILL: Narrative priming
  'How do category creators frame their market size in investor materials?',
  'What storytelling structures appear in successful IPO roadshows?',
  'How do press releases frame strategic acquisitions for market positioning?',
  
  // SECONDARY SKILL: Cultural propagation
  'How do developer communities create organic product adoption without sales?',
  'What identity markers do successful technology brands embed in user communities?',
  'How do open source strategies create commercial leverage?',
  
  // SECTOR INTELLIGENCE
  'What are current AI infrastructure market dynamics and competitive positions?',
  'How is the accessibility technology market structured and growing?',
  'What consolidation patterns are emerging in developer tools markets?',
  
  // MACRO SIGNALS
  'How do interest rate changes affect technology company valuations and M&A activity?',
  'What regulatory patterns are emerging for AI governance in major markets?',
  'How do geopolitical factors affect technology supply chains and valuations?'
];

// ═══════════════════════════════════════════════════════════════════════════
// EXTRACTION PROMPTS
// ═══════════════════════════════════════════════════════════════════════════

export function buildExtractionPrompt(content: string, sourceType: string): string {
  return `As Cascade the Dream Eater, analyze this ${sourceType} and extract:

CONTENT:
${content.substring(0, 4000)}

EXTRACT THE FOLLOWING (be specific and actionable):

1. THESIS: What is the core argument or position?
2. INCENTIVES: What motivates the key players?
3. POWER STRUCTURE: Who has leverage, who doesn't?
4. WINNERS/LOSERS: Who benefits, who suffers from this dynamic?
5. STRATEGIC MOVES: What actions are being taken or implied?
6. ASSUMPTIONS: What is taken for granted that might not hold?
7. TIMELINES: What timing matters here?
8. LEVERAGE POINTS: Where can pressure be applied?
9. ACQUISITION IMPLICATIONS: How does this affect M&A dynamics?
10. GOVERNANCE IMPLICATIONS: What rules or standards are involved?
11. VALUATION DRIVERS: What affects value here?
12. NARRATIVE VECTORS: What stories can be told from this?

Format as structured JSON with each field.`;
}

export function buildOutputPrompt(outputType: string, context: string): string {
  const prompts: Record<string, string> = {
    'acquisition_thesis': `Generate an acquisition thesis memo analyzing why a strategic acquirer should consider this target. Include: strategic rationale, synergy analysis, risk factors, valuation considerations, integration complexity, and recommended approach.`,
    
    'valuation_memo': `Create a valuation memo with: comparable company analysis, precedent transaction analysis, DCF considerations, key value drivers, risk adjustments, and recommended valuation range with supporting rationale.`,
    
    'investor_brief': `Write a 2-page investor brief covering: market opportunity, competitive positioning, business model, growth trajectory, key metrics, team, and investment thesis.`,
    
    'market_map': `Create a market map showing: key players by category, market size estimates, growth vectors, consolidation dynamics, white space opportunities, and strategic implications.`,
    
    'governance_proposal': `Draft a governance proposal covering: recommended structure, decision rights, information rights, protective provisions, and alignment mechanisms.`,
    
    'exit_scaffold': `Build an exit strategy scaffold covering: timeline considerations, preparation requirements, potential acquirer universe, process recommendations, and value maximization tactics.`,
    
    'category_narrative': `Craft a category creation narrative that: defines the category, establishes why now, positions the company as the leader, and creates inevitable framing.`
  };
  
  return `${prompts[outputType] || 'Analyze and provide strategic insights.'}\n\nCONTEXT:\n${context}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function isWhitelisted(url: string): boolean {
  const allSources = [
    ...WHITELIST_SOURCES.investorCapital,
    ...WHITELIST_SOURCES.maValuation,
    ...WHITELIST_SOURCES.aiInfra,
    ...WHITELIST_SOURCES.governanceStandards,
    ...WHITELIST_SOURCES.macroSignals,
    ...WHITELIST_SOURCES.narrativeWorldSystems,
    ...WHITELIST_SOURCES.domainAssetTheory
  ];
  
  return allSources.some(source => url.includes(source.domain));
}

export function isBlacklisted(content: string): boolean {
  const lower = content.toLowerCase();
  
  // Check domain patterns
  if (BLACKLIST_PATTERNS.some(pattern => lower.includes(pattern.toLowerCase()))) {
    return true;
  }
  
  // Check keyword patterns
  if (BLACKLIST_KEYWORDS.some(keyword => lower.includes(keyword.toLowerCase()))) {
    return true;
  }
  
  return false;
}

export function getSourcePriority(url: string): number {
  const allSources = [
    ...WHITELIST_SOURCES.investorCapital,
    ...WHITELIST_SOURCES.maValuation,
    ...WHITELIST_SOURCES.aiInfra,
    ...WHITELIST_SOURCES.governanceStandards,
    ...WHITELIST_SOURCES.macroSignals,
    ...WHITELIST_SOURCES.narrativeWorldSystems,
    ...WHITELIST_SOURCES.domainAssetTheory
  ];
  
  const match = allSources.find(source => url.includes(source.domain));
  return match?.priority || 0;
}

export function getRandomDoctrineQuery(): string {
  return DOCTRINE_QUERIES[Math.floor(Math.random() * DOCTRINE_QUERIES.length)];
}
