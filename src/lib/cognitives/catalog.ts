/**
 * Composable Cognitives — Product Catalog
 * 6 downloadable cognitive agents: 5 paid ($39) + 1 free (Hybrid)
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
}

export const COGNITIVES_CATALOG: CognitiveItem[] = [
  {
    sku: 'research',
    displayName: 'Research Cognitive',
    className: 'Investigator',
    tagline: 'Deep research. Verified sources. Executive-ready reports.',
    description: 'An advanced research agent with thread tracking, source comparison, and executive summary generation. Designed for multi-hop knowledge synthesis.',
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
      'Report generator structure (executive summary → findings → sources)',
      'Graph build hints (entities, claims, citations)',
    ],
    priceCents: 3900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-research-cognitive.zip',
    stripeProductName: 'CMPSBL Research Cognitive',
    stripeLookupKey: 'cmpsbl_cognitive_research_3900',
    accentColor: 'cyan',
    imagePath: 'research',
  },
  {
    sku: 'coding',
    displayName: 'Coding Agent',
    className: 'Engineer',
    tagline: 'Writes, debugs, and ships code with persistent memory.',
    description: 'A coding assistant with error-pattern memory, style consistency, and tool-use guardrails. Remembers what went wrong so it doesn\'t repeat mistakes.',
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
    priceCents: 3900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-coding-agent.zip',
    stripeProductName: 'CMPSBL Coding Agent',
    stripeLookupKey: 'cmpsbl_cognitive_coding_3900',
    accentColor: 'green',
    imagePath: 'coding',
  },
  {
    sku: 'analyst',
    displayName: 'Analyst',
    className: 'Strategist',
    tagline: 'Anomaly detection. Decision memos. Impact-effort scoring.',
    description: 'An analytical cognitive that frames anomalies, generates decision memos with impact/effort scoring, and produces recommendation formats with risk flags.',
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
    priceCents: 3900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-analyst.zip',
    stripeProductName: 'CMPSBL Analyst Cognitive',
    stripeLookupKey: 'cmpsbl_cognitive_analyst_3900',
    accentColor: 'purple',
    imagePath: 'analyst',
  },
  {
    sku: 'ops',
    displayName: 'Ops',
    className: 'Operator',
    tagline: 'SOPs, escalation playbooks, vendor scoring, and scheduling.',
    description: 'An operations cognitive built for process management — SOP templates, escalation playbooks, risk scoring, vendor comparisons, and scheduling with timezone awareness.',
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
    priceCents: 3900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-ops.zip',
    stripeProductName: 'CMPSBL Ops Cognitive',
    stripeLookupKey: 'cmpsbl_cognitive_ops_3900',
    accentColor: 'orange',
    imagePath: 'ops',
  },
  {
    sku: 'writer',
    displayName: 'Cognitive Writer',
    className: 'Scribe',
    tagline: 'Persona-locked longform. Outline-first. Citation-aware.',
    description: 'A writing cognitive with persona memory defaults, tone locking, outline-first longform generation, and citation formatting helpers.',
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
    priceCents: 3900,
    isFree: false,
    downloadAssetKey: 'cmpsbl-writer.zip',
    stripeProductName: 'CMPSBL Cognitive Writer',
    stripeLookupKey: 'cmpsbl_cognitive_writer_3900',
    accentColor: 'pink',
    imagePath: 'writer',
  },
  {
    sku: 'hybrid',
    displayName: 'Hybrid Cognitive',
    className: 'Generalist',
    tagline: 'Free generalist mode. Cross-task persistence. Start here.',
    description: 'A free, general-purpose cognitive with suggested routing prompts, bias reduction, and cross-task context persistence. The perfect starting point.',
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
    stripeProductName: 'CMPSBL Hybrid Cognitive',
    stripeLookupKey: 'cmpsbl_cognitive_hybrid_free',
    accentColor: 'gold',
    imagePath: 'hybrid',
  },
];

export const getCognitiveBySku = (sku: string): CognitiveItem | undefined =>
  COGNITIVES_CATALOG.find((c) => c.sku === sku);

export const PAID_COGNITIVES = COGNITIVES_CATALOG.filter((c) => !c.isFree);
export const FREE_COGNITIVES = COGNITIVES_CATALOG.filter((c) => c.isFree);

/** Install snippets shown on the sales page */
export const INSTALL_SNIPPETS = {
  node: `import { CmpsblCognitive } from './dist/index.js';

const agent = new CmpsblCognitive({
  name: 'my-research-agent',
  provider: 'openai', // or anthropic, groq, etc.
  apiKey: process.env.LLM_API_KEY,
});

const result = await agent.run({
  task: 'Research the latest AI governance frameworks',
  depth: 'deep',
});

console.log(result.report);`,

  http: `curl -X POST http://localhost:3100/run \\
  -H "Content-Type: application/json" \\
  -d '{
    "task": "Analyze Q4 revenue trends",
    "depth": "standard",
    "format": "decision_memo"
  }'`,

  langchain: `import { CmpsblTool } from './dist/adapters/langchain.js';

const researchTool = new CmpsblTool({
  name: 'cmpsbl_research',
  cognitive: './dist/index.js',
});

// Use in any LangChain agent chain
const agent = createReactAgent({ tools: [researchTool] });`,

  crewai: `from cmpsbl_adapter import CmpsblCrewMember

researcher = CmpsblCrewMember(
    role="Senior Researcher",
    cognitive_path="./dist/index.js",
    goal="Deep research with citations"
)

# Use in any CrewAI crew
crew = Crew(agents=[researcher], tasks=[...])`,
};
