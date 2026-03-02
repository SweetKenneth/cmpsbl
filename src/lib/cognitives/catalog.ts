/**
 * Composable Minds — Product Catalog
 * Phase 1: 20 internal agents, 3 public (2 free + 1 paid)
 * Terminology: "Minds" (public-facing), "Cognitives" (internal/legacy)
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
  /** v1.0 = first stable release */
  version: string;
  /** Whether this agent is exposed on the public marketplace */
  isPublic: boolean;
}

// ═══════════════════════════════════════════════════════════════
// FULL 20-AGENT CATALOG
// ═══════════════════════════════════════════════════════════════

export const COGNITIVES_CATALOG: CognitiveItem[] = [
  // ─── PUBLIC: FREE ───
  {
    sku: 'hybrid',
    displayName: 'Hybrid Mind',
    className: 'Generalist',
    tagline: 'Free generalist mode. Cross-task persistence. Start here.',
    description: 'A free, general-purpose mind with suggested routing prompts, bias reduction, and cross-task context persistence. The perfect starting point.',
    capabilities: [
      'Generalist mode with suggested routing',
      'Cross-task context persistence',
      '"Ask clarifying questions" bias reduction',
      'Multi-domain adaptability',
      'Framework-agnostic integration',
    ],
    enhancements: [
      'Free "generalist mode" + suggested routing prompts',
      '"Ask clarifying questions" bias reduction',
      'Cross-task context persistence',
      'Lightweight memory defaults',
    ],
    priceCents: 0,
    isFree: true,
    downloadAssetKey: 'cmpsbl-hybrid.zip',
    stripeProductName: 'CMPSBL Hybrid Mind',
    stripeLookupKey: 'cmpsbl_mind_hybrid_free',
    accentColor: 'gold',
    imagePath: 'hybrid',
    version: 'v1.0',
    isPublic: true,
  },
  {
    sku: 'educator',
    displayName: 'Educator Mind',
    className: 'Mentor',
    tagline: 'Curriculum design. Quiz generation. Adaptive teaching.',
    description: 'An educational mind built for teaching — curriculum scaffolding, quiz generation, Socratic dialogue, and adaptive difficulty scaling based on learner progress.',
    capabilities: [
      'Curriculum scaffolding and lesson planning',
      'Quiz and assessment generation',
      'Socratic dialogue engine',
      'Adaptive difficulty scaling',
      'Progress tracking and gap analysis',
    ],
    enhancements: [
      'Learner profile memory persistence',
      'Multi-format output (slides, docs, flashcards)',
      'Knowledge gap detection',
      'Spaced repetition scheduling',
    ],
    priceCents: 0,
    isFree: true,
    downloadAssetKey: 'cmpsbl-educator.zip',
    stripeProductName: 'CMPSBL Educator Mind',
    stripeLookupKey: 'cmpsbl_mind_educator_free',
    accentColor: 'blue',
    imagePath: 'educator',
    version: 'v1.0',
    isPublic: true,
  },

  // ─── PUBLIC: PAID ───
  {
    sku: 'sales',
    displayName: 'Sales Mind',
    className: 'Closer',
    tagline: 'Pipeline tracking. Objection handling. Deal intelligence.',
    description: 'A sales-optimized mind with CRM-aware pipeline tracking, objection playbooks, competitive battle cards, and deal scoring with close probability.',
    capabilities: [
      'Pipeline stage tracking with memory',
      'Objection handling playbooks',
      'Competitive battle card generation',
      'Deal scoring and close probability',
      'Follow-up sequence optimization',
    ],
    enhancements: [
      'Prospect memory across conversations',
      'Win/loss pattern recognition',
      'Email template personalization',
      'Meeting prep briefing generator',
    ],
    priceCents: 12900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-sales.zip',
    stripeProductName: 'CMPSBL Sales Mind',
    stripeLookupKey: 'cmpsbl_mind_sales_3900',
    accentColor: 'emerald',
    imagePath: 'sales',
    version: 'v1.0',
    isPublic: true,
  },

  // ─── INTERNAL ONLY (17 agents — not exposed on public marketplace) ───
  {
    sku: 'research',
    displayName: 'Research Mind',
    className: 'Investigator',
    tagline: 'Deep research. Verified sources. Executive-ready reports.',
    description: 'An advanced research agent with thread tracking, source comparison, and executive summary generation.',
    capabilities: [
      'Multi-source deep research with citation chains',
      'Thread tracking across long-horizon tasks',
      'Executive summary → findings → sources report structure',
      'Knowledge graph entity extraction',
      'Source credibility scoring',
    ],
    enhancements: [
      'Thread tracking + long-horizon memory defaults',
      'Source-compare formatting template',
      'Report generator structure',
      'Graph build hints (entities, claims, citations)',
    ],
    priceCents: 12900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-research.zip',
    stripeProductName: 'CMPSBL Research Mind',
    stripeLookupKey: 'cmpsbl_mind_research_3900',
    accentColor: 'cyan',
    imagePath: 'research',
    version: 'v1.0',
    isPublic: false,
  },
  {
    sku: 'coding',
    displayName: 'Coding Mind',
    className: 'Engineer',
    tagline: 'Writes, debugs, and ships code with persistent memory.',
    description: 'A coding assistant with error-pattern memory, style consistency, and tool-use guardrails.',
    capabilities: [
      'Multi-language code generation with context awareness',
      'Error-pattern memory (never repeat the same bug)',
      'Style + lint consistency across sessions',
      'Safe tool-use with timeouts and retries',
      'PR review and refactor suggestions',
    ],
    enhancements: [
      'Error-pattern memory + "don\'t repeat this" recall',
      'Preferred style + lint-like consistency memory',
      'Safer tool-use guardrails (timeouts, retries)',
      'Multi-file context tracking',
    ],
    priceCents: 15900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-coding.zip',
    stripeProductName: 'CMPSBL Coding Mind',
    stripeLookupKey: 'cmpsbl_mind_coding_3900',
    accentColor: 'green',
    imagePath: 'coding',
    version: 'v1.0',
    isPublic: false,
  },
  {
    sku: 'analyst',
    displayName: 'Analyst Mind',
    className: 'Strategist',
    tagline: 'Anomaly detection. Decision memos. Impact-effort scoring.',
    description: 'An analytical mind that frames anomalies, generates decision memos with impact/effort scoring.',
    capabilities: [
      'Anomaly detection and framing',
      'Impact/effort scoring with risk flags',
      'Decision memo template outputs',
      'Trend analysis and forecasting',
      'Competitive landscape mapping',
    ],
    enhancements: [
      'Anomaly detection framing',
      'Recommendation format (impact/effort, risk flags)',
      '"Decision memo" template outputs',
      'Time-series pattern recognition',
    ],
    priceCents: 15900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-analyst.zip',
    stripeProductName: 'CMPSBL Analyst Mind',
    stripeLookupKey: 'cmpsbl_mind_analyst_3900',
    accentColor: 'purple',
    imagePath: 'analyst',
    version: 'v1.0',
    isPublic: false,
  },
  {
    sku: 'ops',
    displayName: 'Ops Mind',
    className: 'Operator',
    tagline: 'SOPs, escalation playbooks, vendor scoring, and scheduling.',
    description: 'An operations mind built for process management — SOP templates, escalation playbooks, risk scoring.',
    capabilities: [
      'SOP template generation and enforcement',
      'Escalation playbook framing',
      'Risk scoring + vendor comparison tables',
      'Scheduling with timezone awareness',
      'Runbook automation suggestions',
    ],
    enhancements: [
      'SOP templates + escalation playbook framing',
      'Risk scoring + vendor comparison table structure',
      'Scheduling assistant guardrails (timezones, reminders)',
      'Incident response templates',
    ],
    priceCents: 12900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-ops.zip',
    stripeProductName: 'CMPSBL Ops Mind',
    stripeLookupKey: 'cmpsbl_mind_ops_3900',
    accentColor: 'orange',
    imagePath: 'ops',
    version: 'v1.0',
    isPublic: false,
  },
  {
    sku: 'writer',
    displayName: 'Writer Mind',
    className: 'Scribe',
    tagline: 'Persona-locked longform. Outline-first. Citation-aware.',
    description: 'A writing mind with persona memory defaults, tone locking, outline-first longform generation.',
    capabilities: [
      'Persona memory defaults + tone locking',
      'Outline-first longform generation',
      'Citation formatting helper',
      'Multi-format output (blog, whitepaper, docs)',
      'Brand voice consistency',
    ],
    enhancements: [
      'Persona memory defaults + tone locking',
      'Outline-first longform generator',
      'Citation formatting helper',
      'SEO optimization suggestions',
    ],
    priceCents: 12900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-writer.zip',
    stripeProductName: 'CMPSBL Writer Mind',
    stripeLookupKey: 'cmpsbl_mind_writer_3900',
    accentColor: 'pink',
    imagePath: 'writer',
    version: 'v1.0',
    isPublic: false,
  },
  {
    sku: 'legal',
    displayName: 'Legal Mind',
    className: 'Counsel',
    tagline: 'Contract review. Clause extraction. Compliance flagging.',
    description: 'A legal-focused mind for contract analysis, clause extraction, risk flagging, and compliance checklist generation.',
    capabilities: [
      'Contract clause extraction and analysis',
      'Risk and liability flagging',
      'Compliance checklist generation (GDPR, SOC2)',
      'Legal memo drafting',
      'Precedent citation formatting',
    ],
    enhancements: [
      'Multi-jurisdiction awareness',
      'Clause comparison across contracts',
      'Amendment tracking memory',
      'Regulatory update monitoring',
    ],
    priceCents: 12900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-legal.zip',
    stripeProductName: 'CMPSBL Legal Mind',
    stripeLookupKey: 'cmpsbl_mind_legal_3900',
    accentColor: 'slate',
    imagePath: 'legal',
    version: 'v1.0',
    isPublic: false,
  },
  {
    sku: 'recruiter',
    displayName: 'Recruiter Mind',
    className: 'Talent Scout',
    tagline: 'Candidate screening. JD generation. Interview prep.',
    description: 'A talent acquisition mind with candidate scoring, job description generation, and structured interview frameworks.',
    capabilities: [
      'Candidate profile scoring and ranking',
      'Job description generation from requirements',
      'Structured interview question sets',
      'Skills-gap analysis',
      'Diversity and inclusion checklist',
    ],
    enhancements: [
      'Candidate pipeline memory',
      'Salary benchmarking templates',
      'Rejection/offer letter drafting',
      'Onboarding checklist generation',
    ],
    priceCents: 12900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-recruiter.zip',
    stripeProductName: 'CMPSBL Recruiter Mind',
    stripeLookupKey: 'cmpsbl_mind_recruiter_3900',
    accentColor: 'teal',
    imagePath: 'recruiter',
    version: 'v1.0',
    isPublic: false,
  },
  {
    sku: 'support',
    displayName: 'Support Mind',
    className: 'Resolver',
    tagline: 'Ticket triage. Knowledge base. Escalation routing.',
    description: 'A support-optimized mind with ticket categorization, KB search, resolution playbooks, and escalation intelligence.',
    capabilities: [
      'Ticket categorization and priority scoring',
      'Knowledge base search and suggestion',
      'Resolution playbook execution',
      'Escalation routing with context handoff',
      'Customer sentiment detection',
    ],
    enhancements: [
      'Resolution pattern memory',
      'SLA tracking and alerting',
      'Canned response personalization',
      'Post-resolution satisfaction prediction',
    ],
    priceCents: 12900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-support.zip',
    stripeProductName: 'CMPSBL Support Mind',
    stripeLookupKey: 'cmpsbl_mind_support_3900',
    accentColor: 'sky',
    imagePath: 'support',
    version: 'v1.0',
    isPublic: false,
  },
  {
    sku: 'data-engineer',
    displayName: 'Data Engineer Mind',
    className: 'Architect',
    tagline: 'Pipeline design. Schema validation. ETL orchestration.',
    description: 'A data engineering mind for pipeline design, schema validation, ETL orchestration, and data quality monitoring.',
    capabilities: [
      'Pipeline architecture design',
      'Schema validation and migration planning',
      'ETL job orchestration templates',
      'Data quality rule generation',
      'Query optimization suggestions',
    ],
    enhancements: [
      'Schema version tracking memory',
      'Cross-database compatibility checks',
      'Performance profiling templates',
      'Lineage documentation generation',
    ],
    priceCents: 12900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-data-engineer.zip',
    stripeProductName: 'CMPSBL Data Engineer Mind',
    stripeLookupKey: 'cmpsbl_mind_data_engineer_3900',
    accentColor: 'indigo',
    imagePath: 'data-engineer',
    version: 'v1.0',
    isPublic: false,
  },
  {
    sku: 'marketing',
    displayName: 'Marketing Mind',
    className: 'Campaigner',
    tagline: 'Campaign strategy. Copy generation. A/B test design.',
    description: 'A marketing-focused mind for campaign strategy, multi-channel copy generation, and performance optimization.',
    capabilities: [
      'Campaign strategy and calendar planning',
      'Multi-channel copy generation',
      'A/B test hypothesis and design',
      'Audience segmentation frameworks',
      'Performance metric interpretation',
    ],
    enhancements: [
      'Brand voice consistency memory',
      'Competitor campaign tracking',
      'Content repurposing engine',
      'Funnel optimization suggestions',
    ],
    priceCents: 12900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-marketing.zip',
    stripeProductName: 'CMPSBL Marketing Mind',
    stripeLookupKey: 'cmpsbl_mind_marketing_3900',
    accentColor: 'rose',
    imagePath: 'marketing',
    version: 'v1.0',
    isPublic: false,
  },
  {
    sku: 'product',
    displayName: 'Product Mind',
    className: 'Builder',
    tagline: 'PRDs. User stories. Roadmap prioritization.',
    description: 'A product management mind for PRD generation, user story writing, roadmap prioritization, and feature scoping.',
    capabilities: [
      'PRD generation from requirements',
      'User story writing with acceptance criteria',
      'Roadmap prioritization (RICE, ICE scoring)',
      'Feature scope estimation',
      'Stakeholder update drafting',
    ],
    enhancements: [
      'Feature request memory and dedup',
      'Competitive feature matrix',
      'Release note generation',
      'User feedback synthesis',
    ],
    priceCents: 12900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-product.zip',
    stripeProductName: 'CMPSBL Product Mind',
    stripeLookupKey: 'cmpsbl_mind_product_3900',
    accentColor: 'violet',
    imagePath: 'product',
    version: 'v1.0',
    isPublic: false,
  },
  {
    sku: 'security',
    displayName: 'Security Mind',
    className: 'Sentinel',
    tagline: 'Threat modeling. Vulnerability assessment. Incident response.',
    description: 'A security-focused mind for threat modeling, vulnerability assessment, and incident response playbook generation.',
    capabilities: [
      'STRIDE threat modeling',
      'Vulnerability assessment and scoring (CVSS)',
      'Incident response playbook generation',
      'Security policy drafting',
      'Penetration test report formatting',
    ],
    enhancements: [
      'CVE tracking memory',
      'Attack surface mapping',
      'Compliance gap analysis',
      'Security awareness training content',
    ],
    priceCents: 15900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-security.zip',
    stripeProductName: 'CMPSBL Security Mind',
    stripeLookupKey: 'cmpsbl_mind_security_3900',
    accentColor: 'red',
    imagePath: 'security',
    version: 'v1.0',
    isPublic: false,
  },
  {
    sku: 'finance',
    displayName: 'Finance Mind',
    className: 'Controller',
    tagline: 'Financial modeling. Budget analysis. Forecast generation.',
    description: 'A finance-optimized mind for financial modeling, budget variance analysis, and cash flow forecasting.',
    capabilities: [
      'Financial model generation (P&L, cash flow)',
      'Budget variance analysis',
      'Revenue forecasting templates',
      'Unit economics calculation',
      'Investor memo drafting',
    ],
    enhancements: [
      'Historical data pattern memory',
      'Multi-scenario modeling',
      'KPI dashboard templates',
      'Board deck slide generation',
    ],
    priceCents: 12900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-finance.zip',
    stripeProductName: 'CMPSBL Finance Mind',
    stripeLookupKey: 'cmpsbl_mind_finance_3900',
    accentColor: 'emerald',
    imagePath: 'finance',
    version: 'v1.0',
    isPublic: false,
  },
  {
    sku: 'designer',
    displayName: 'Designer Mind',
    className: 'Craftsman',
    tagline: 'Design systems. UI critique. Accessibility auditing.',
    description: 'A design-focused mind for design system management, UI critique, accessibility auditing, and component specification.',
    capabilities: [
      'Design system documentation and tokens',
      'UI critique with actionable feedback',
      'WCAG accessibility auditing',
      'Component specification writing',
      'Design-to-code translation',
    ],
    enhancements: [
      'Brand guideline memory',
      'Color palette generation',
      'Typography pairing suggestions',
      'Motion design specifications',
    ],
    priceCents: 12900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-designer.zip',
    stripeProductName: 'CMPSBL Designer Mind',
    stripeLookupKey: 'cmpsbl_mind_designer_3900',
    accentColor: 'fuchsia',
    imagePath: 'designer',
    version: 'v1.0',
    isPublic: false,
  },
  {
    sku: 'devops',
    displayName: 'DevOps Mind',
    className: 'Deployer',
    tagline: 'CI/CD pipelines. Infrastructure as code. Monitoring.',
    description: 'A DevOps-focused mind for CI/CD pipeline design, IaC generation, monitoring setup, and incident triage.',
    capabilities: [
      'CI/CD pipeline design (GitHub Actions, GitLab)',
      'Infrastructure as Code (Terraform, Pulumi)',
      'Monitoring and alerting rule generation',
      'Incident triage and runbook execution',
      'Cost optimization analysis',
    ],
    enhancements: [
      'Deployment history memory',
      'Rollback playbook generation',
      'SLO/SLI definition templates',
      'Capacity planning forecasts',
    ],
    priceCents: 12900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-devops.zip',
    stripeProductName: 'CMPSBL DevOps Mind',
    stripeLookupKey: 'cmpsbl_mind_devops_3900',
    accentColor: 'amber',
    imagePath: 'devops',
    version: 'v1.0',
    isPublic: false,
  },
  {
    sku: 'strategist',
    displayName: 'Strategist Mind',
    className: 'Visionary',
    tagline: 'Market analysis. GTM planning. Competitive intelligence.',
    description: 'A strategy-focused mind for market analysis, go-to-market planning, competitive intelligence, and business model design.',
    capabilities: [
      'Market sizing and TAM/SAM/SOM analysis',
      'Go-to-market strategy frameworks',
      'Competitive intelligence gathering',
      'Business model canvas generation',
      'Strategic initiative prioritization',
    ],
    enhancements: [
      'Industry trend memory',
      'SWOT and Porter\'s Five Forces templates',
      'Scenario planning frameworks',
      'Board presentation drafting',
    ],
    priceCents: 12900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-strategist.zip',
    stripeProductName: 'CMPSBL Strategist Mind',
    stripeLookupKey: 'cmpsbl_mind_strategist_3900',
    accentColor: 'cyan',
    imagePath: 'strategist',
    version: 'v1.0',
    isPublic: false,
  },
  {
    sku: 'translator',
    displayName: 'Translator Mind',
    className: 'Linguist',
    tagline: 'Multi-language. Context-aware. Tone preservation.',
    description: 'A translation-optimized mind with context-aware multi-language support, tone preservation, and localization intelligence.',
    capabilities: [
      'Context-aware multi-language translation',
      'Tone and register preservation',
      'Localization-ready output formatting',
      'Glossary management and consistency',
      'Cultural adaptation suggestions',
    ],
    enhancements: [
      'Project glossary memory',
      'Translation memory (TM) persistence',
      'Style guide compliance checking',
      'Batch translation orchestration',
    ],
    priceCents: 12900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-translator.zip',
    stripeProductName: 'CMPSBL Translator Mind',
    stripeLookupKey: 'cmpsbl_mind_translator_3900',
    accentColor: 'lime',
    imagePath: 'translator',
    version: 'v1.0',
    isPublic: false,
  },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

export const getCognitiveBySku = (sku: string): CognitiveItem | undefined =>
  COGNITIVES_CATALOG.find((c) => c.sku === sku);

/** All agents (internal + public) */
export const ALL_AGENTS = COGNITIVES_CATALOG;

/** Only agents exposed on the public marketplace */
export const PUBLIC_CATALOG = COGNITIVES_CATALOG.filter((c) => c.isPublic);

/** Paid public agents */
export const PAID_COGNITIVES = PUBLIC_CATALOG.filter((c) => !c.isFree);

/** Free public agents */
export const FREE_COGNITIVES = PUBLIC_CATALOG.filter((c) => c.isFree);

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
