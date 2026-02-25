/**
 * Minds Intelligence Layer — Domain Vocabulary Registry
 * GATED: vocabulary_auto_growth = INTERNAL_ONLY
 * Seed glossary per Mind. Autonomous growth disabled publicly.
 * CLM refinement internal only.
 */

import { isFeatureAvailable } from './featureFlags';

export interface VocabularyEntry {
  term: string;
  definition: string;
  aliases: string[];
  domain: string;
  /** Whether this was seeded or learned */
  source: 'seed' | 'learned';
  confidence: number;
  usageCount: number;
  addedAt: number;
}

export interface VocabularyRegistry {
  mindSku: string;
  entries: Map<string, VocabularyEntry>;
  lastUpdated: number;
}

/** Per-Mind vocabulary registries */
const registries = new Map<string, VocabularyRegistry>();

/** Seed vocabularies per Mind domain */
const SEED_VOCABULARIES: Record<string, Array<Omit<VocabularyEntry, 'source' | 'confidence' | 'usageCount' | 'addedAt'>>> = {
  sales: [
    { term: 'MEDDIC', definition: 'Sales qualification framework: Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion', aliases: ['meddic framework'], domain: 'sales' },
    { term: 'ARR', definition: 'Annual Recurring Revenue — total yearly subscription revenue', aliases: ['annual recurring revenue'], domain: 'sales' },
    { term: 'MRR', definition: 'Monthly Recurring Revenue — total monthly subscription revenue', aliases: ['monthly recurring revenue'], domain: 'sales' },
    { term: 'ACV', definition: 'Annual Contract Value — average annual revenue per customer contract', aliases: ['annual contract value'], domain: 'sales' },
    { term: 'CAC', definition: 'Customer Acquisition Cost — total cost to acquire a new customer', aliases: ['customer acquisition cost'], domain: 'sales' },
    { term: 'LTV', definition: 'Lifetime Value — total revenue expected from a customer over their lifetime', aliases: ['lifetime value', 'CLV'], domain: 'sales' },
    { term: 'SQL', definition: 'Sales Qualified Lead — a prospect vetted by sales as ready for direct engagement', aliases: ['sales qualified lead'], domain: 'sales' },
    { term: 'Churn Rate', definition: 'Percentage of customers who cancel their subscription in a given period', aliases: ['customer churn', 'attrition rate'], domain: 'sales' },
  ],
  coding: [
    { term: 'DRY', definition: 'Don\'t Repeat Yourself — principle of reducing code duplication', aliases: ['dont repeat yourself'], domain: 'engineering' },
    { term: 'SOLID', definition: 'Five principles of object-oriented design: Single responsibility, Open-closed, Liskov substitution, Interface segregation, Dependency inversion', aliases: ['solid principles'], domain: 'engineering' },
    { term: 'CI/CD', definition: 'Continuous Integration / Continuous Deployment — automated build, test, and deployment pipeline', aliases: ['continuous integration', 'continuous deployment'], domain: 'engineering' },
    { term: 'Tech Debt', definition: 'Implied cost of future rework caused by choosing expedient solutions over better approaches', aliases: ['technical debt'], domain: 'engineering' },
    { term: 'RFC', definition: 'Request for Comments — a proposal document for architectural decisions', aliases: ['request for comments'], domain: 'engineering' },
  ],
  legal: [
    { term: 'IRAC', definition: 'Issue, Rule, Application, Conclusion — standard legal analysis framework', aliases: ['irac method'], domain: 'legal' },
    { term: 'Force Majeure', definition: 'Unforeseeable circumstances that prevent fulfillment of a contract', aliases: ['act of god'], domain: 'legal' },
    { term: 'Indemnification', definition: 'Contractual obligation where one party agrees to compensate the other for losses', aliases: ['indemnity', 'hold harmless'], domain: 'legal' },
    { term: 'SOC 2', definition: 'Service Organization Control 2 — compliance framework for data security', aliases: ['soc2', 'soc type 2'], domain: 'legal' },
    { term: 'GDPR', definition: 'General Data Protection Regulation — EU data privacy law', aliases: ['general data protection regulation'], domain: 'legal' },
  ],
  research: [
    { term: 'Systematic Review', definition: 'Structured, reproducible method for identifying and evaluating all relevant studies on a topic', aliases: ['systematic literature review'], domain: 'research' },
    { term: 'Meta-Analysis', definition: 'Statistical combination of results from multiple studies to produce a single estimate', aliases: ['meta analysis'], domain: 'research' },
    { term: 'p-value', definition: 'Probability that observed results occurred by chance under the null hypothesis', aliases: ['p value', 'significance level'], domain: 'research' },
    { term: 'Effect Size', definition: 'Quantitative measure of the magnitude of a phenomenon', aliases: ["cohen's d", 'effect magnitude'], domain: 'research' },
  ],
  educator: [
    { term: "Bloom's Taxonomy", definition: 'Hierarchical model of cognitive learning: Remember, Understand, Apply, Analyze, Evaluate, Create', aliases: ['blooms taxonomy', 'cognitive taxonomy'], domain: 'education' },
    { term: 'Scaffolding', definition: 'Instructional technique of providing support structures that are gradually removed as learners gain proficiency', aliases: ['instructional scaffolding'], domain: 'education' },
    { term: 'Formative Assessment', definition: 'Ongoing assessment during learning to monitor progress and adjust instruction', aliases: ['formative evaluation'], domain: 'education' },
    { term: 'ZPD', definition: 'Zone of Proximal Development — the gap between what a learner can do independently and with guidance', aliases: ['zone of proximal development'], domain: 'education' },
  ],
  security: [
    { term: 'STRIDE', definition: 'Threat modeling framework: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege', aliases: ['stride model'], domain: 'security' },
    { term: 'CVSS', definition: 'Common Vulnerability Scoring System — standardized severity rating for vulnerabilities', aliases: ['cvss score'], domain: 'security' },
    { term: 'Zero-Day', definition: 'Previously unknown vulnerability with no available patch', aliases: ['0-day', 'zero day'], domain: 'security' },
    { term: 'OWASP Top 10', definition: 'Standard awareness document for the ten most critical web application security risks', aliases: ['owasp top ten'], domain: 'security' },
  ],
  finance: [
    { term: 'EBITDA', definition: 'Earnings Before Interest, Taxes, Depreciation, and Amortization', aliases: ['earnings before interest'], domain: 'finance' },
    { term: 'DCF', definition: 'Discounted Cash Flow — valuation method using projected future cash flows', aliases: ['discounted cash flow'], domain: 'finance' },
    { term: 'P/E Ratio', definition: 'Price-to-Earnings Ratio — stock price relative to earnings per share', aliases: ['price to earnings', 'pe ratio'], domain: 'finance' },
    { term: 'Burn Rate', definition: 'Rate at which a company spends cash reserves before generating positive cash flow', aliases: ['cash burn'], domain: 'finance' },
  ],
};

/** Initialize registry for a Mind with seed vocabulary */
function initializeRegistry(mindSku: string): VocabularyRegistry {
  const registry: VocabularyRegistry = {
    mindSku,
    entries: new Map(),
    lastUpdated: Date.now(),
  };

  const seeds = SEED_VOCABULARIES[mindSku] ?? [];
  for (const seed of seeds) {
    registry.entries.set(seed.term.toLowerCase(), {
      ...seed,
      source: 'seed',
      confidence: 1.0,
      usageCount: 0,
      addedAt: Date.now(),
    });
  }

  registries.set(mindSku, registry);
  return registry;
}

/** Get vocabulary registry for a Mind */
export function getVocabulary(mindSku: string): VocabularyRegistry {
  return registries.get(mindSku) ?? initializeRegistry(mindSku);
}

/** Look up a term */
export function lookupTerm(mindSku: string, query: string): VocabularyEntry | null {
  const registry = getVocabulary(mindSku);
  const lower = query.toLowerCase();

  // Direct match
  const direct = registry.entries.get(lower);
  if (direct) {
    direct.usageCount++;
    return direct;
  }

  // Alias match
  for (const entry of registry.entries.values()) {
    if (entry.aliases.some(a => a.toLowerCase() === lower)) {
      entry.usageCount++;
      return entry;
    }
  }

  return null;
}

/** Add a learned term (internal only, gated) */
export function learnTerm(
  mindSku: string,
  term: string,
  definition: string,
  domain: string
): boolean {
  if (!isFeatureAvailable('vocabulary_auto_growth')) return false;

  const registry = getVocabulary(mindSku);
  const lower = term.toLowerCase();

  if (registry.entries.has(lower)) return false; // Already exists

  registry.entries.set(lower, {
    term,
    definition,
    aliases: [],
    domain,
    source: 'learned',
    confidence: 0.7,
    usageCount: 0,
    addedAt: Date.now(),
  });

  registry.lastUpdated = Date.now();
  return true;
}

/** Get vocabulary size for a Mind */
export function getVocabularySize(mindSku: string): number {
  return getVocabulary(mindSku).entries.size;
}

/** Get most-used terms */
export function getTopTerms(mindSku: string, limit: number = 10): VocabularyEntry[] {
  const registry = getVocabulary(mindSku);
  return Array.from(registry.entries.values())
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit);
}
