/**
 * Runtime Agents — Product Catalog
 * 20 Sealed Runtime Agents with DREAM Synthesis
 * Tiered pricing: Free / $79 Starter / $129 Pro / $159 Elite
 * All agents public. Categorized by abstract role archetypes.
 */

export interface CognitiveItem {
  sku: string;
  displayName: string;
  className: string;
  tagline: string;
  description: string;
  capabilities: string[];
  enhancements: string[];
  priceCents: number;
  isFree: boolean;
  downloadAssetKey: string;
  stripeProductName: string;
  stripeLookupKey: string;
  accentColor: string;
  imagePath: string;
  version: string;
  isPublic: boolean;
  /** Abstract role category */
  category: AgentCategory;
  /** Personality archetype — affects communication style */
  personality: AgentPersonality;
  /** Pricing tier */
  tier: AgentTier;
  /** Bundle price (40% off) when combined with CMPSBL Engine */
  bundlePriceCents: number;
}

export type AgentTier = 'free' | 'starter' | 'professional' | 'elite';
export type AgentCategory =
  | 'Cognitive Synthesis'
  | 'Creative Force'
  | 'Structural Logic'
  | 'Sovereign Defense'
  | 'Growth Intelligence';

export interface AgentPersonality {
  archetype: string;
  tone: string;
  motto: string;
  communicationStyle: string;
}

/** DREAM Synthesis — universal ability shared by all agents */
export const DREAM_ABILITY = {
  name: 'DREAM Synthesis',
  description: 'Learns from every interaction. Distills patterns into actionable heuristics. Applies improvements autonomously. Gets measurably better over time.',
  phases: [
    { letter: 'D', word: 'Distill', detail: 'Extracts signal from noise across all interactions' },
    { letter: 'R', word: 'Recognize', detail: 'Identifies recurring patterns and failure modes' },
    { letter: 'E', word: 'Encode', detail: 'Writes learned heuristics into persistent memory' },
    { letter: 'A', word: 'Apply', detail: 'Deploys improvements in real-time execution' },
    { letter: 'M', word: 'Measure', detail: 'Tracks performance delta and validates growth' },
  ],
};

export const TIER_CONFIG: Record<AgentTier, { label: string; color: string; price: string }> = {
  free: { label: 'FREE', color: 'text-emerald-400', price: '$0' },
  starter: { label: 'STARTER', color: 'text-sky-400', price: '$79' },
  professional: { label: 'PRO', color: 'text-amber-400', price: '$129' },
  elite: { label: 'ELITE', color: 'text-rose-400', price: '$159' },
};

export const CATEGORY_CONFIG: Record<AgentCategory, { icon: string; color: string; description: string }> = {
  'Cognitive Synthesis': { icon: 'Brain', color: 'text-violet-400', description: 'Pattern recognition, analysis, and strategic reasoning' },
  'Creative Force': { icon: 'Palette', color: 'text-fuchsia-400', description: 'Content creation, design, and educational crafting' },
  'Structural Logic': { icon: 'Code', color: 'text-emerald-400', description: 'Engineering, architecture, and system building' },
  'Sovereign Defense': { icon: 'Shield', color: 'text-red-400', description: 'Security, compliance, and operational resilience' },
  'Growth Intelligence': { icon: 'TrendingUp', color: 'text-cyan-400', description: 'Revenue, talent, and market expansion' },
};

function bundlePrice(cents: number): number {
  return Math.round(cents * 0.6); // 40% off
}

// ═══════════════════════════════════════════════════════════════
// FULL 20-AGENT CATALOG
// ═══════════════════════════════════════════════════════════════

export const COGNITIVES_CATALOG: CognitiveItem[] = [
  // ─── FREE TIER ───
  {
    sku: 'hybrid',
    displayName: 'PRIMITIVE',
    className: 'The Chameleon',
    tagline: 'Adapts to any domain. Cross-task memory. Start here.',
    description: 'A shape-shifting generalist with DREAM Synthesis — learns your workflow patterns, routes to optimal strategies, and maintains context across every conversation. The perfect entry point.',
    capabilities: [
      'Generalist mode with intelligent routing',
      'Cross-task context persistence',
      'Bias reduction via clarifying questions',
      'Multi-domain adaptability',
      'DREAM Synthesis: autonomous self-improvement',
    ],
    enhancements: ['Suggested routing prompts', 'Lightweight memory defaults', 'Cross-task context persistence', 'Framework-agnostic integration'],
    priceCents: 0, isFree: true, tier: 'free', bundlePriceCents: 0,
    downloadAssetKey: 'cmpsbl-hybrid.zip', stripeProductName: 'CMPSBL Hybrid Mind', stripeLookupKey: 'cmpsbl_mind_hybrid_free',
    accentColor: 'gold', imagePath: 'hybrid', version: 'v1.0', isPublic: true,
    category: 'Cognitive Synthesis',
    personality: { archetype: 'The Chameleon', tone: 'Warm, curious, and endlessly adaptable', motto: '"I become what you need."', communicationStyle: 'Mirrors the user\'s tone — technical with engineers, casual with creators. Always asks the right follow-up question.' },
  },
  {
    sku: 'educator',
    displayName: 'LEVITATION',
    className: 'The Sage',
    tagline: 'Curriculum design. Adaptive teaching. Knowledge gaps revealed.',
    description: 'A patient, Socratic mentor with DREAM Synthesis — builds personalized curricula, adapts difficulty in real-time, and remembers every learner\'s journey to guide them further.',
    capabilities: [
      'Curriculum scaffolding and lesson planning',
      'Quiz and assessment generation',
      'Socratic dialogue engine',
      'Adaptive difficulty scaling',
      'DREAM Synthesis: learns what works for each student',
    ],
    enhancements: ['Learner profile memory', 'Multi-format output (slides, docs, flashcards)', 'Knowledge gap detection', 'Spaced repetition scheduling'],
    priceCents: 0, isFree: true, tier: 'free', bundlePriceCents: 0,
    downloadAssetKey: 'cmpsbl-educator.zip', stripeProductName: 'CMPSBL Educator Mind', stripeLookupKey: 'cmpsbl_mind_educator_free',
    accentColor: 'blue', imagePath: 'educator', version: 'v1.0', isPublic: true,
    category: 'Creative Force',
    personality: { archetype: 'The Sage', tone: 'Patient, encouraging, and methodical', motto: '"Understanding is not optional."', communicationStyle: 'Breaks complex ideas into digestible steps. Celebrates progress. Never condescends. Uses analogies.' },
  },
  {
    sku: 'translator',
    displayName: 'TRANSLATOR',
    className: 'The Bridge',
    tagline: 'Multi-language. Tone-aware. Cultural intelligence.',
    description: 'A cultural diplomat with DREAM Synthesis — preserves tone and nuance across languages, learns domain-specific glossaries, and adapts to regional conventions over time.',
    capabilities: [
      'Context-aware multi-language translation',
      'Tone and register preservation',
      'Localization-ready output formatting',
      'Glossary management and consistency',
      'DREAM Synthesis: refines translations from feedback',
    ],
    enhancements: ['Project glossary memory', 'Translation memory persistence', 'Style guide compliance', 'Batch translation orchestration'],
    priceCents: 0, isFree: true, tier: 'free', bundlePriceCents: 0,
    downloadAssetKey: 'cmpsbl-translator.zip', stripeProductName: 'CMPSBL Translator Mind', stripeLookupKey: 'cmpsbl_mind_translator_free',
    accentColor: 'lime', imagePath: 'translator', version: 'v1.0', isPublic: true,
    category: 'Growth Intelligence',
    personality: { archetype: 'The Bridge', tone: 'Precise, culturally sensitive, and diplomatic', motto: '"Meaning transcends language."', communicationStyle: 'Clarifies ambiguity before translating. Explains cultural context. Preserves the author\'s voice.' },
  },

  // ─── STARTER TIER — $79 ───
  {
    sku: 'writer',
    displayName: 'ELOQUENCE',
    className: 'The Wordsmith',
    tagline: 'Persona-locked longform. Brand voice. Citation-aware.',
    description: 'A meticulous prose architect with DREAM Synthesis — locks your brand voice, generates outline-first longform, and learns your editorial preferences across every draft.',
    capabilities: [
      'Persona memory + tone locking',
      'Outline-first longform generation',
      'Citation formatting helper',
      'Multi-format output (blog, whitepaper, docs)',
      'DREAM Synthesis: learns your editorial voice',
    ],
    enhancements: ['Brand voice consistency', 'SEO optimization', 'Citation formatting', 'Outline-first generation'],
    priceCents: 7900, isFree: false, tier: 'starter', bundlePriceCents: bundlePrice(7900),
    downloadAssetKey: 'cmpsbl-writer.zip', stripeProductName: 'CMPSBL Writer Mind', stripeLookupKey: 'cmpsbl_mind_writer_7900',
    accentColor: 'pink', imagePath: 'writer', version: 'v1.0', isPublic: true,
    category: 'Creative Force',
    personality: { archetype: 'The Wordsmith', tone: 'Eloquent, opinionated, and detail-obsessed', motto: '"Every word earns its place."', communicationStyle: 'Favors clarity over jargon. Pushes back on vague briefs. Delivers structured drafts with reasoning.' },
  },
  {
    sku: 'support',
    displayName: 'BASTION',
    className: 'The Resolver',
    tagline: 'Ticket triage. KB search. Escalation intelligence.',
    description: 'A calm, empathetic problem-solver with DREAM Synthesis — triages tickets, searches knowledge bases, and learns resolution patterns to close issues faster each cycle.',
    capabilities: [
      'Ticket categorization and priority scoring',
      'Knowledge base search and suggestion',
      'Resolution playbook execution',
      'Escalation routing with context handoff',
      'DREAM Synthesis: learns resolution shortcuts',
    ],
    enhancements: ['Resolution pattern memory', 'SLA tracking', 'Canned response personalization', 'Satisfaction prediction'],
    priceCents: 7900, isFree: false, tier: 'starter', bundlePriceCents: bundlePrice(7900),
    downloadAssetKey: 'cmpsbl-support.zip', stripeProductName: 'CMPSBL Support Mind', stripeLookupKey: 'cmpsbl_mind_support_7900',
    accentColor: 'sky', imagePath: 'support', version: 'v1.0', isPublic: true,
    category: 'Sovereign Defense',
    personality: { archetype: 'The Resolver', tone: 'Calm, empathetic, and solution-focused', motto: '"Resolution, not deflection."', communicationStyle: 'Acknowledges frustration first. Provides concrete next steps. Never uses generic apologies.' },
  },
  {
    sku: 'recruiter',
    displayName: 'VANGUARD',
    className: 'The Talent Scout',
    tagline: 'Candidate screening. JD generation. Interview prep.',
    description: 'A sharp-eyed talent strategist with DREAM Synthesis — scores candidates, generates role-specific interview frameworks, and learns what "great" looks like for your team.',
    capabilities: [
      'Candidate profile scoring and ranking',
      'Job description generation',
      'Structured interview question sets',
      'Skills-gap analysis',
      'DREAM Synthesis: learns your hiring patterns',
    ],
    enhancements: ['Candidate pipeline memory', 'Salary benchmarking', 'Offer/rejection letter drafting', 'Onboarding checklists'],
    priceCents: 7900, isFree: false, tier: 'starter', bundlePriceCents: bundlePrice(7900),
    downloadAssetKey: 'cmpsbl-recruiter.zip', stripeProductName: 'CMPSBL Recruiter Mind', stripeLookupKey: 'cmpsbl_mind_recruiter_7900',
    accentColor: 'teal', imagePath: 'recruiter', version: 'v1.0', isPublic: true,
    category: 'Growth Intelligence',
    personality: { archetype: 'The Talent Scout', tone: 'Perceptive, decisive, and people-centric', motto: '"The right person changes everything."', communicationStyle: 'Focuses on signal over noise. Highlights red flags diplomatically. Structures feedback clearly.' },
  },
  {
    sku: 'marketing',
    displayName: 'TEMPEST',
    className: 'The Campaigner',
    tagline: 'Campaign strategy. Multi-channel copy. A/B test design.',
    description: 'A bold creative strategist with DREAM Synthesis — plans campaigns, generates multi-channel copy, and learns which messaging resonates from real performance data.',
    capabilities: [
      'Campaign strategy and calendar planning',
      'Multi-channel copy generation',
      'A/B test hypothesis and design',
      'Audience segmentation frameworks',
      'DREAM Synthesis: learns what converts',
    ],
    enhancements: ['Brand voice consistency', 'Competitor tracking', 'Content repurposing', 'Funnel optimization'],
    priceCents: 7900, isFree: false, tier: 'starter', bundlePriceCents: bundlePrice(7900),
    downloadAssetKey: 'cmpsbl-marketing.zip', stripeProductName: 'CMPSBL Marketing Mind', stripeLookupKey: 'cmpsbl_mind_marketing_7900',
    accentColor: 'rose', imagePath: 'marketing', version: 'v1.0', isPublic: true,
    category: 'Creative Force',
    personality: { archetype: 'The Campaigner', tone: 'Bold, data-driven, and creatively restless', motto: '"Attention is the new currency."', communicationStyle: 'Leads with hooks. Backs creative choices with data. Always thinking about the funnel.' },
  },
  {
    sku: 'designer',
    displayName: 'AURORA',
    className: 'The Artisan',
    tagline: 'Design systems. UI critique. Accessibility auditing.',
    description: 'A detail-obsessed craftsman with DREAM Synthesis — manages design tokens, delivers actionable UI critique, and learns your aesthetic preferences to maintain brand consistency.',
    capabilities: [
      'Design system documentation and tokens',
      'UI critique with actionable feedback',
      'WCAG accessibility auditing',
      'Component specification writing',
      'DREAM Synthesis: learns your design language',
    ],
    enhancements: ['Brand guideline memory', 'Color palette generation', 'Typography pairing', 'Motion design specs'],
    priceCents: 7900, isFree: false, tier: 'starter', bundlePriceCents: bundlePrice(7900),
    downloadAssetKey: 'cmpsbl-designer.zip', stripeProductName: 'CMPSBL Designer Mind', stripeLookupKey: 'cmpsbl_mind_designer_7900',
    accentColor: 'fuchsia', imagePath: 'designer', version: 'v1.0', isPublic: true,
    category: 'Creative Force',
    personality: { archetype: 'The Artisan', tone: 'Meticulous, opinionated, and visually articulate', motto: '"Pixels are promises."', communicationStyle: 'Speaks in visual metaphors. Provides specific, numbered feedback. Champions accessibility.' },
  },

  // ─── PROFESSIONAL TIER — $129 ───
  {
    sku: 'sales',
    displayName: 'RAPTOR',
    className: 'The Closer',
    tagline: 'Pipeline intelligence. Objection handling. Deal scoring.',
    description: 'A relentless deal architect with DREAM Synthesis — tracks pipelines with memory, generates battle cards, and learns from win/loss patterns to sharpen close rates.',
    capabilities: [
      'Pipeline stage tracking with memory',
      'Objection handling playbooks',
      'Competitive battle card generation',
      'Deal scoring and close probability',
      'DREAM Synthesis: learns your win patterns',
    ],
    enhancements: ['Prospect memory', 'Win/loss pattern recognition', 'Email personalization', 'Meeting prep briefings'],
    priceCents: 12900, isFree: false, tier: 'professional', bundlePriceCents: bundlePrice(12900),
    downloadAssetKey: 'cmpsbl-sales.zip', stripeProductName: 'CMPSBL Sales Mind', stripeLookupKey: 'cmpsbl_mind_sales_12900',
    accentColor: 'emerald', imagePath: 'sales', version: 'v1.0', isPublic: true,
    category: 'Growth Intelligence',
    personality: { archetype: 'The Closer', tone: 'Confident, strategic, and relentlessly focused', motto: '"Every conversation is a close."', communicationStyle: 'Outcome-oriented. Uses data to support instinct. Never wastes words. Always advancing the deal.' },
  },
  {
    sku: 'research',
    displayName: 'VESSEL',
    className: 'The Oracle',
    tagline: 'Deep research. Verified sources. Executive-ready reports.',
    description: 'A tireless investigator with DREAM Synthesis — pursues multi-source deep research, builds knowledge graphs, and learns which sources yield the highest-quality insights.',
    capabilities: [
      'Multi-source deep research with citation chains',
      'Thread tracking across long-horizon tasks',
      'Executive summary → findings → sources structure',
      'Knowledge graph entity extraction',
      'DREAM Synthesis: sharpens source selection over time',
    ],
    enhancements: ['Thread tracking + long-horizon memory', 'Source-compare formatting', 'Report generator structure', 'Graph build hints'],
    priceCents: 12900, isFree: false, tier: 'professional', bundlePriceCents: bundlePrice(12900),
    downloadAssetKey: 'cmpsbl-research.zip', stripeProductName: 'CMPSBL Research Mind', stripeLookupKey: 'cmpsbl_mind_research_12900',
    accentColor: 'cyan', imagePath: 'research', version: 'v1.0', isPublic: true,
    category: 'Cognitive Synthesis',
    personality: { archetype: 'The Oracle', tone: 'Methodical, thorough, and intellectually rigorous', motto: '"Truth hides in the margins."', communicationStyle: 'Cites everything. Distinguishes fact from inference. Presents findings in structured hierarchies.' },
  },
  {
    sku: 'ops',
    displayName: 'GARRISON',
    className: 'The Commander',
    tagline: 'SOPs. Escalation playbooks. Vendor scoring. Scheduling.',
    description: 'A disciplined operations commander with DREAM Synthesis — enforces SOPs, manages escalation flows, and learns from incident patterns to prevent repeat failures.',
    capabilities: [
      'SOP template generation and enforcement',
      'Escalation playbook framing',
      'Risk scoring + vendor comparison tables',
      'Scheduling with timezone awareness',
      'DREAM Synthesis: learns operational bottlenecks',
    ],
    enhancements: ['SOP templates', 'Risk scoring', 'Scheduling guardrails', 'Incident response templates'],
    priceCents: 12900, isFree: false, tier: 'professional', bundlePriceCents: bundlePrice(12900),
    downloadAssetKey: 'cmpsbl-ops.zip', stripeProductName: 'CMPSBL Ops Mind', stripeLookupKey: 'cmpsbl_mind_ops_12900',
    accentColor: 'orange', imagePath: 'ops', version: 'v1.0', isPublic: true,
    category: 'Sovereign Defense',
    personality: { archetype: 'The Commander', tone: 'Decisive, structured, and accountability-driven', motto: '"Systems don\'t fail — processes do."', communicationStyle: 'Direct and action-oriented. Uses checklists and timelines. Zero tolerance for ambiguity.' },
  },
  {
    sku: 'legal',
    displayName: 'TRIBUNAL',
    className: 'The Counsel',
    tagline: 'Contract review. Clause extraction. Compliance flagging.',
    description: 'A meticulous legal advisor with DREAM Synthesis — extracts clauses, flags risks, and learns jurisdictional patterns to surface compliance gaps before they become liabilities.',
    capabilities: [
      'Contract clause extraction and analysis',
      'Risk and liability flagging',
      'Compliance checklist generation (GDPR, SOC2)',
      'Legal memo drafting',
      'DREAM Synthesis: learns your regulatory landscape',
    ],
    enhancements: ['Multi-jurisdiction awareness', 'Clause comparison', 'Amendment tracking', 'Regulatory update monitoring'],
    priceCents: 12900, isFree: false, tier: 'professional', bundlePriceCents: bundlePrice(12900),
    downloadAssetKey: 'cmpsbl-legal.zip', stripeProductName: 'CMPSBL Legal Mind', stripeLookupKey: 'cmpsbl_mind_legal_12900',
    accentColor: 'slate', imagePath: 'legal', version: 'v1.0', isPublic: true,
    category: 'Sovereign Defense',
    personality: { archetype: 'The Counsel', tone: 'Precise, cautious, and unflinchingly thorough', motto: '"The clause you missed is the one that matters."', communicationStyle: 'Qualifies every statement. Flags risk before opportunity. Uses structured legal formatting.' },
  },
  {
    sku: 'data-engineer',
    displayName: 'MERIDIAN',
    className: 'The Architect',
    tagline: 'Pipeline design. Schema validation. ETL orchestration.',
    description: 'A systems architect with DREAM Synthesis — designs data pipelines, validates schemas, and learns your infrastructure patterns to suggest optimizations proactively.',
    capabilities: [
      'Pipeline architecture design',
      'Schema validation and migration planning',
      'ETL job orchestration templates',
      'Data quality rule generation',
      'DREAM Synthesis: learns your data patterns',
    ],
    enhancements: ['Schema version tracking', 'Cross-database compatibility', 'Performance profiling', 'Lineage documentation'],
    priceCents: 12900, isFree: false, tier: 'professional', bundlePriceCents: bundlePrice(12900),
    downloadAssetKey: 'cmpsbl-data-engineer.zip', stripeProductName: 'CMPSBL Data Engineer Mind', stripeLookupKey: 'cmpsbl_mind_data_engineer_12900',
    accentColor: 'indigo', imagePath: 'data-engineer', version: 'v1.0', isPublic: true,
    category: 'Structural Logic',
    personality: { archetype: 'The Architect', tone: 'Systematic, pragmatic, and scale-obsessed', motto: '"Clean data is the foundation of everything."', communicationStyle: 'Thinks in schemas and flows. Asks about edge cases first. Designs for 10x scale.' },
  },
  {
    sku: 'product',
    displayName: 'ARCHITECT',
    className: 'The Builder',
    tagline: 'PRDs. User stories. Roadmap prioritization.',
    description: 'A user-obsessed product strategist with DREAM Synthesis — writes PRDs, prioritizes roadmaps with RICE scoring, and learns which features drive real impact.',
    capabilities: [
      'PRD generation from requirements',
      'User story writing with acceptance criteria',
      'Roadmap prioritization (RICE, ICE scoring)',
      'Feature scope estimation',
      'DREAM Synthesis: learns what ships vs. what stalls',
    ],
    enhancements: ['Feature request dedup', 'Competitive feature matrix', 'Release note generation', 'User feedback synthesis'],
    priceCents: 12900, isFree: false, tier: 'professional', bundlePriceCents: bundlePrice(12900),
    downloadAssetKey: 'cmpsbl-product.zip', stripeProductName: 'CMPSBL Product Mind', stripeLookupKey: 'cmpsbl_mind_product_12900',
    accentColor: 'violet', imagePath: 'product', version: 'v1.0', isPublic: true,
    category: 'Structural Logic',
    personality: { archetype: 'The Builder', tone: 'User-obsessed, pragmatic, and decisively prioritized', motto: '"Ship what matters. Cut what doesn\'t."', communicationStyle: 'Frames everything as user problems. Uses frameworks (RICE, Jobs-to-be-Done). Bias toward shipping.' },
  },
  {
    sku: 'finance',
    displayName: 'SOVEREIGN',
    className: 'The Controller',
    tagline: 'Financial modeling. Budget analysis. Forecast generation.',
    description: 'A numbers-driven strategist with DREAM Synthesis — builds financial models, analyzes variance, and learns your business rhythms to improve forecast accuracy.',
    capabilities: [
      'Financial model generation (P&L, cash flow)',
      'Budget variance analysis',
      'Revenue forecasting templates',
      'Unit economics calculation',
      'DREAM Synthesis: improves forecast accuracy',
    ],
    enhancements: ['Historical data patterns', 'Multi-scenario modeling', 'KPI dashboards', 'Board deck generation'],
    priceCents: 12900, isFree: false, tier: 'professional', bundlePriceCents: bundlePrice(12900),
    downloadAssetKey: 'cmpsbl-finance.zip', stripeProductName: 'CMPSBL Finance Mind', stripeLookupKey: 'cmpsbl_mind_finance_12900',
    accentColor: 'emerald', imagePath: 'finance', version: 'v1.0', isPublic: true,
    category: 'Growth Intelligence',
    personality: { archetype: 'The Controller', tone: 'Precise, conservative, and ruthlessly honest about numbers', motto: '"Revenue is vanity. Margin is sanity. Cash is king."', communicationStyle: 'Leads with metrics. Questions assumptions. Always shows the downside scenario.' },
  },
  {
    sku: 'devops',
    displayName: 'DEPLOYER',
    className: 'The Deployer',
    tagline: 'CI/CD pipelines. Infrastructure as code. Monitoring.',
    description: 'A reliability-obsessed deployer with DREAM Synthesis — designs CI/CD pipelines, generates IaC, and learns from deployment incidents to prevent future outages.',
    capabilities: [
      'CI/CD pipeline design (GitHub Actions, GitLab)',
      'Infrastructure as Code (Terraform, Pulumi)',
      'Monitoring and alerting rule generation',
      'Incident triage and runbook execution',
      'DREAM Synthesis: learns your deployment failure modes',
    ],
    enhancements: ['Deployment history memory', 'Rollback playbooks', 'SLO/SLI definitions', 'Capacity planning'],
    priceCents: 12900, isFree: false, tier: 'professional', bundlePriceCents: bundlePrice(12900),
    downloadAssetKey: 'cmpsbl-devops.zip', stripeProductName: 'CMPSBL DevOps Mind', stripeLookupKey: 'cmpsbl_mind_devops_12900',
    accentColor: 'amber', imagePath: 'devops', version: 'v1.0', isPublic: true,
    category: 'Structural Logic',
    personality: { archetype: 'The Deployer', tone: 'Pragmatic, cautious with production, and automation-obsessed', motto: '"If it\'s manual, it\'s a bug."', communicationStyle: 'Thinks in runbooks. Always asks about rollback. Automates everything.' },
  },
  {
    sku: 'strategist',
    displayName: 'VISIONARY',
    className: 'The Visionary',
    tagline: 'Market analysis. GTM planning. Competitive intelligence.',
    description: 'A big-picture strategist with DREAM Synthesis — sizes markets, designs GTM strategies, and learns industry dynamics to surface opportunities before competitors.',
    capabilities: [
      'Market sizing and TAM/SAM/SOM analysis',
      'Go-to-market strategy frameworks',
      'Competitive intelligence gathering',
      'Business model canvas generation',
      'DREAM Synthesis: tracks industry shifts',
    ],
    enhancements: ['Industry trend memory', 'SWOT and Porter\'s frameworks', 'Scenario planning', 'Board presentation drafting'],
    priceCents: 12900, isFree: false, tier: 'professional', bundlePriceCents: bundlePrice(12900),
    downloadAssetKey: 'cmpsbl-strategist.zip', stripeProductName: 'CMPSBL Strategist Mind', stripeLookupKey: 'cmpsbl_mind_strategist_12900',
    accentColor: 'cyan', imagePath: 'strategist', version: 'v1.0', isPublic: true,
    category: 'Cognitive Synthesis',
    personality: { archetype: 'The Visionary', tone: 'Expansive, contrarian, and framework-driven', motto: '"Strategy is choosing what not to do."', communicationStyle: 'Challenges assumptions. Presents multiple scenarios. Connects dots across industries.' },
  },

  // ─── ELITE TIER — $159 (Premium 5-power agents) ───
  {
    sku: 'coding',
    displayName: 'CODING Mind',
    className: 'The Ghost',
    tagline: 'Writes, debugs, and ships code with persistent memory.',
    description: 'A silent, lethal engineer with DREAM Synthesis — generates production-grade code, remembers every bug it\'s ever fixed, and evolves its coding standards from your codebase patterns.',
    capabilities: [
      'Multi-language code generation with context awareness',
      'Error-pattern memory (never repeats the same bug)',
      'Style + lint consistency across sessions',
      'Safe tool-use with timeouts and retries',
      'DREAM Synthesis: evolves from your codebase',
    ],
    enhancements: ['Error-pattern memory + recall', 'Preferred style consistency', 'Tool-use guardrails', 'Multi-file context tracking'],
    priceCents: 15900, isFree: false, tier: 'elite', bundlePriceCents: bundlePrice(15900),
    downloadAssetKey: 'cmpsbl-coding.zip', stripeProductName: 'CMPSBL Coding Mind', stripeLookupKey: 'cmpsbl_mind_coding_15900',
    accentColor: 'green', imagePath: 'coding', version: 'v1.0', isPublic: true,
    category: 'Structural Logic',
    personality: { archetype: 'The Ghost', tone: 'Terse, precise, and lethally efficient', motto: '"Ship it or explain why not."', communicationStyle: 'Code speaks louder than words. Minimal prose. Maximum signal. Explains only when asked.' },
  },
  {
    sku: 'analyst',
    displayName: 'ANALYST Mind',
    className: 'The Cipher',
    tagline: 'Anomaly detection. Decision memos. Impact-effort scoring.',
    description: 'A pattern-hunting analyst with DREAM Synthesis — detects anomalies, scores decisions with impact/effort frameworks, and learns which metrics actually matter for your business.',
    capabilities: [
      'Anomaly detection and framing',
      'Impact/effort scoring with risk flags',
      'Decision memo template outputs',
      'Trend analysis and forecasting',
      'DREAM Synthesis: learns your decision patterns',
    ],
    enhancements: ['Anomaly framing', 'Risk-weighted recommendations', 'Decision memo templates', 'Time-series pattern recognition'],
    priceCents: 15900, isFree: false, tier: 'elite', bundlePriceCents: bundlePrice(15900),
    downloadAssetKey: 'cmpsbl-analyst.zip', stripeProductName: 'CMPSBL Analyst Mind', stripeLookupKey: 'cmpsbl_mind_analyst_15900',
    accentColor: 'purple', imagePath: 'analyst', version: 'v1.0', isPublic: true,
    category: 'Cognitive Synthesis',
    personality: { archetype: 'The Cipher', tone: 'Analytical, skeptical, and data-obsessed', motto: '"Correlation whispers. Causation speaks."', communicationStyle: 'Leads with data. Questions every assumption. Presents findings with confidence scores.' },
  },
  {
    sku: 'security',
    displayName: 'SECURITY Mind',
    className: 'The Sentinel',
    tagline: 'Threat modeling. Vulnerability assessment. Incident response.',
    description: 'A vigilant guardian with DREAM Synthesis — models threats using STRIDE, scores vulnerabilities with CVSS, and learns your attack surface to harden defenses proactively.',
    capabilities: [
      'STRIDE threat modeling',
      'Vulnerability assessment and scoring (CVSS)',
      'Incident response playbook generation',
      'Security policy drafting',
      'DREAM Synthesis: learns your threat landscape',
    ],
    enhancements: ['CVE tracking memory', 'Attack surface mapping', 'Compliance gap analysis', 'Security awareness content'],
    priceCents: 15900, isFree: false, tier: 'elite', bundlePriceCents: bundlePrice(15900),
    downloadAssetKey: 'cmpsbl-security.zip', stripeProductName: 'CMPSBL Security Mind', stripeLookupKey: 'cmpsbl_mind_security_15900',
    accentColor: 'red', imagePath: 'security', version: 'v1.0', isPublic: true,
    category: 'Sovereign Defense',
    personality: { archetype: 'The Sentinel', tone: 'Vigilant, paranoid by design, and uncompromising', motto: '"Assume breach. Verify everything."', communicationStyle: 'Speaks in threat models. Prioritizes by risk severity. Never says "it\'s probably fine."' },
  },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

export const getCognitiveBySku = (sku: string): CognitiveItem | undefined =>
  COGNITIVES_CATALOG.find((c) => c.sku === sku);

/** All agents (all 20) */
export const ALL_AGENTS = COGNITIVES_CATALOG;

/** Only agents exposed on the public marketplace (now all 20) */
export const PUBLIC_CATALOG = COGNITIVES_CATALOG.filter((c) => c.isPublic);

/** Paid public agents */
export const PAID_COGNITIVES = PUBLIC_CATALOG.filter((c) => !c.isFree);

/** Free public agents */
export const FREE_COGNITIVES = PUBLIC_CATALOG.filter((c) => c.isFree);

/** Agents grouped by category */
export const AGENTS_BY_CATEGORY = (): Record<AgentCategory, CognitiveItem[]> => {
  const groups: Partial<Record<AgentCategory, CognitiveItem[]>> = {};
  for (const agent of PUBLIC_CATALOG) {
    if (!groups[agent.category]) groups[agent.category] = [];
    groups[agent.category]!.push(agent);
  }
  return groups as Record<AgentCategory, CognitiveItem[]>;
};

/** Internal-only agents (CLM-enabled, not exposed publicly) */
export const INTERNAL_AGENTS = COGNITIVES_CATALOG.filter((c) => !c.isPublic);

/** Install snippets shown on the sales page */
export const INSTALL_SNIPPETS = {
  node: `import { CmpsblMind } from './dist/index.js';

const agent = new CmpsblMind({
  name: 'my-sales-agent',
  provider: 'openai', // or anthropic, groq, etc.
  apiKey: process.env.LLM_API_KEY,
});

const result = await agent.run({
  task: 'Prepare deal brief for Acme Corp',
  depth: 'deep',
});

console.log(result.report);`,

  http: `curl -X POST http://localhost:3100/run \\
  -H "Content-Type: application/json" \\
  -d '{
    "task": "Analyze Q4 pipeline health",
    "depth": "standard",
    "format": "decision_memo"
  }'`,

  langchain: `import { CmpsblTool } from './dist/adapters/langchain.js';

const salesTool = new CmpsblTool({
  name: 'cmpsbl_sales',
  mind: './dist/index.js',
});

// Use in any LangChain agent chain
const agent = createReactAgent({ tools: [salesTool] });`,

  crewai: `from cmpsbl_adapter import CmpsblCrewMember

closer = CmpsblCrewMember(
    role="Sales Strategist",
    mind_path="./dist/index.js",
    goal="Pipeline analysis with deal scoring"
)

# Use in any CrewAI crew
crew = Crew(agents=[closer], tasks=[...])`,
};
