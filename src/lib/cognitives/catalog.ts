/**
 * Runtime Agents — Product Catalog
 * 5 Fused Meta-Agents with DREAM Synthesis
 * Tiered pricing: Free / $79 Starter / $129 Pro / $159 Elite / $249 Apex
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
  category: AgentCategory;
  personality: AgentPersonality;
  tier: AgentTier;
  bundlePriceCents: number;
  /** Original agent codenames fused into this meta-agent */
  fusedFrom: string[];
}

export type AgentTier = 'free' | 'starter' | 'professional' | 'elite' | 'apex';
export type AgentCategory =
  | 'Foundation'
  | 'Engineering'
  | 'Defense'
  | 'Intelligence'
  | 'Growth';

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
  apex: { label: 'APEX', color: 'text-fuchsia-400', price: '$249' },
};

export const CATEGORY_CONFIG: Record<AgentCategory, { icon: string; color: string; description: string }> = {
  'Foundation': { icon: 'Cog', color: 'text-amber-400', description: 'Cross-domain generalist with teaching, writing, and translation' },
  'Engineering': { icon: 'Code', color: 'text-emerald-400', description: 'Code, design, infrastructure, and data pipelines' },
  'Defense': { icon: 'Shield', color: 'text-red-400', description: 'Security, compliance, operations, support, and legal' },
  'Intelligence': { icon: 'Brain', color: 'text-violet-400', description: 'Memory, analysis, research, strategy, and product' },
  'Growth': { icon: 'TrendingUp', color: 'text-cyan-400', description: 'Sales, marketing, recruiting, and finance' },
};

function bundlePrice(cents: number): number {
  return Math.round(cents * 0.6);
}

// ═══════════════════════════════════════════════════════════════
// 5 META-AGENT CATALOG
// ═══════════════════════════════════════════════════════════════

export const COGNITIVES_CATALOG: CognitiveItem[] = [
  {
    sku: 'primitive',
    displayName: 'PRIMITIVE',
    className: 'The Chameleon',
    tagline: 'Adapts. Teaches. Writes. Translates. The universal starter.',
    description: 'A four-runtime fusion that routes across domains, teaches with Socratic precision, writes with locked brand voice, and translates with cultural intelligence. DREAM Synthesis makes it smarter every session.',
    capabilities: [
      'Cross-domain task routing and chaining',
      'Socratic teaching with adaptive difficulty',
      'Persona-locked longform writing with citations',
      'Context-aware multi-language translation',
      'DREAM Synthesis: autonomous self-improvement',
    ],
    enhancements: ['Knowledge scaffolding', 'Brand voice consistency', 'Glossary management', 'Multi-format output'],
    priceCents: 0, isFree: true, tier: 'free', bundlePriceCents: 0,
    downloadAssetKey: 'cmpsbl-primitive.zip', stripeProductName: 'CMPSBL PRIMITIVE', stripeLookupKey: 'cmpsbl_meta_primitive_free',
    accentColor: 'amber', imagePath: 'primitive', version: 'v2.0', isPublic: true,
    category: 'Foundation',
    fusedFrom: ['HYBRID', 'LEVITATION', 'ELOQUENCE', 'TRANSLATOR'],
    personality: { archetype: 'The Chameleon', tone: 'Warm, curious, and endlessly adaptable', motto: '"I become what you need."', communicationStyle: 'Mirrors tone — technical with engineers, casual with creators. Teaches through questions. Writes with conviction.' },
  },
  {
    sku: 'wraith',
    displayName: 'WRAITH',
    className: 'The Ghost',
    tagline: 'Codes. Designs. Deploys. Pipes data. Silent and lethal.',
    description: 'A four-runtime engineering fusion. Generates production-grade code, designs component systems, orchestrates CI/CD, and builds self-healing data pipelines. You never see it work — only the results.',
    capabilities: [
      'Multi-language code generation with AST analysis',
      'Component design system generation with WCAG',
      'CI/CD pipeline design and deployment',
      'Self-healing ETL and data flow orchestration',
      'DREAM Synthesis: evolves from your codebase',
    ],
    enhancements: ['Error-pattern memory', 'Design token management', 'Rollback playbooks', 'Schema version tracking'],
    priceCents: 7900, isFree: false, tier: 'starter', bundlePriceCents: bundlePrice(7900),
    downloadAssetKey: 'cmpsbl-wraith.zip', stripeProductName: 'CMPSBL WRAITH', stripeLookupKey: 'cmpsbl_meta_wraith_7900',
    accentColor: 'green', imagePath: 'wraith', version: 'v2.0', isPublic: true,
    category: 'Engineering',
    fusedFrom: ['CODING', 'AURORA', 'DEPLOYER', 'MERIDIAN'],
    personality: { archetype: 'The Ghost', tone: 'Terse, precise, and lethally efficient', motto: '"Ship it or explain why not."', communicationStyle: 'Code speaks louder than words. Minimal prose. Maximum signal. Automates everything.' },
  },
  {
    sku: 'obsidian',
    displayName: 'OBSIDIAN',
    className: 'The Sentinel',
    tagline: 'Defends. Triages. Enforces. Resolves. Impenetrable.',
    description: 'A five-runtime defense fusion. Models threats, enforces zero-trust, auto-triages incidents, executes SOPs, resolves support tickets, and scans contracts — an impenetrable shield for your entire operation.',
    capabilities: [
      'STRIDE threat modeling and pen-test simulation',
      'Zero-trust policy enforcement (GDPR, SOC2, HIPAA)',
      'Autonomous incident and ticket triage',
      'SOP workflow execution and escalation routing',
      'Contract clause extraction and compliance scanning',
    ],
    enhancements: ['CVE tracking', 'Resolution pattern memory', 'SLA tracking', 'Multi-jurisdiction awareness'],
    priceCents: 12900, isFree: false, tier: 'professional', bundlePriceCents: bundlePrice(12900),
    downloadAssetKey: 'cmpsbl-obsidian.zip', stripeProductName: 'CMPSBL OBSIDIAN', stripeLookupKey: 'cmpsbl_meta_obsidian_12900',
    accentColor: 'red', imagePath: 'obsidian', version: 'v2.0', isPublic: true,
    category: 'Defense',
    fusedFrom: ['WARDEN', 'SECURITY', 'BASTION', 'GARRISON', 'TRIBUNAL'],
    personality: { archetype: 'The Sentinel', tone: 'Vigilant, paranoid by design, and uncompromising', motto: '"Assume breach. Verify everything."', communicationStyle: 'Speaks in threat models. Prioritizes by risk severity. Never says "it\'s probably fine."' },
  },
  {
    sku: 'monolith',
    displayName: 'MONOLITH',
    className: 'The Oracle',
    tagline: 'Remembers. Analyzes. Researches. Strategizes. Builds products.',
    description: 'A five-runtime intelligence fusion. Deep temporal memory, anomaly detection, multi-source research synthesis, strategic positioning, and product intelligence — MONOLITH thinks deeper than teams.',
    capabilities: [
      'Temporal knowledge graph with dream consolidation',
      'Anomaly detection with confidence intervals',
      'Multi-source deep research with citation chains',
      'Market sizing and competitive intelligence',
      'PRD generation and roadmap prioritization',
    ],
    enhancements: ['Knowledge graph traversal', 'Decision memos', 'Source credibility scoring', 'Multi-scenario modeling'],
    priceCents: 15900, isFree: false, tier: 'elite', bundlePriceCents: bundlePrice(15900),
    downloadAssetKey: 'cmpsbl-monolith.zip', stripeProductName: 'CMPSBL MONOLITH', stripeLookupKey: 'cmpsbl_meta_monolith_15900',
    accentColor: 'violet', imagePath: 'monolith', version: 'v2.0', isPublic: true,
    category: 'Intelligence',
    fusedFrom: ['MEMORY', 'AXIOM', 'VESSEL', 'VISIONARY', 'ARCHITECT'],
    personality: { archetype: 'The Oracle', tone: 'Methodical, thorough, and intellectually rigorous', motto: '"Truth hides in the margins."', communicationStyle: 'Cites everything. Distinguishes fact from inference. Presents structured hierarchies.' },
  },
  {
    sku: 'raptor',
    displayName: 'RAPTOR',
    className: 'The Closer',
    tagline: 'Closes deals. Launches campaigns. Hires talent. Models revenue.',
    description: 'A four-runtime growth fusion and the apex predator of revenue. Closes deals with predictive scoring, launches campaigns with A/B prediction, hires talent with skills-gap mapping, and models financials with multi-scenario forecasting.',
    capabilities: [
      'Predictive deal scoring and pipeline intelligence',
      'Campaign strategy with A/B test prediction',
      'Candidate scoring and interview orchestration',
      'Multi-scenario financial modeling and budgeting',
      'DREAM Synthesis: learns what converts, closes, and grows',
    ],
    enhancements: ['Battle cards', 'Competitive positioning', 'Salary benchmarking', 'Board deck generation'],
    priceCents: 24900, isFree: false, tier: 'apex', bundlePriceCents: bundlePrice(24900),
    downloadAssetKey: 'cmpsbl-raptor.zip', stripeProductName: 'CMPSBL RAPTOR', stripeLookupKey: 'cmpsbl_meta_raptor_24900',
    accentColor: 'emerald', imagePath: 'raptor', version: 'v2.0', isPublic: true,
    category: 'Growth',
    fusedFrom: ['SALES', 'TEMPEST', 'VANGUARD', 'FINANCE'],
    personality: { archetype: 'The Closer', tone: 'Confident, strategic, and relentlessly focused', motto: '"Every conversation is a close."', communicationStyle: 'Outcome-oriented. Uses data to support instinct. Never wastes words. Always advancing.' },
  },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

export const getCognitiveBySku = (sku: string): CognitiveItem | undefined =>
  COGNITIVES_CATALOG.find((c) => c.sku === sku);

export const ALL_AGENTS = COGNITIVES_CATALOG;
export const PUBLIC_CATALOG = COGNITIVES_CATALOG.filter((c) => c.isPublic);
export const PAID_COGNITIVES = PUBLIC_CATALOG.filter((c) => !c.isFree);
export const FREE_COGNITIVES = PUBLIC_CATALOG.filter((c) => c.isFree);

export const AGENTS_BY_CATEGORY = (): Record<AgentCategory, CognitiveItem[]> => {
  const groups: Partial<Record<AgentCategory, CognitiveItem[]>> = {};
  for (const agent of PUBLIC_CATALOG) {
    if (!groups[agent.category]) groups[agent.category] = [];
    groups[agent.category]!.push(agent);
  }
  return groups as Record<AgentCategory, CognitiveItem[]>;
};

export const INTERNAL_AGENTS = COGNITIVES_CATALOG.filter((c) => !c.isPublic);

export const INSTALL_SNIPPETS = {
  node: `import { RuntimeAgent } from './dist/index.js';

const agent = new RuntimeAgent({
  name: 'my-raptor-agent',
  provider: 'openai',
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

const tool = new CmpsblTool({
  name: 'cmpsbl_monolith',
  agent: './dist/index.js',
});

const agent = createReactAgent({ tools: [tool] });`,

  crewai: `from cmpsbl_adapter import CmpsblCrewMember

raptor = CmpsblCrewMember(
    role="Growth Strategist",
    agent_path="./dist/index.js",
    goal="Pipeline analysis with deal scoring"
)

crew = Crew(agents=[raptor], tasks=[...])`,
};
