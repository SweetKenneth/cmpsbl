/**
 * CLM Deep Dive URL Registry
 * Curated external knowledge sources for autonomous learning
 * 
 * Each module has domain-relevant URLs the CLM can fetch during deep dive cycles
 * to bring in real-world knowledge rather than just re-studying internal topics.
 */

export interface DeepDiveSource {
  url: string;
  label: string;
  module: string;
  category: 'docs' | 'blog' | 'research' | 'reference' | 'changelog';
  priority: number; // 1 = highest
}

// ═══════════════════════════════════════════════════════════════════════════════
// CURATED KNOWLEDGE SOURCES — grouped by substrate module
// ═══════════════════════════════════════════════════════════════════════════════

export const DEEP_DIVE_SOURCES: DeepDiveSource[] = [
  // ── BRAIN / MEMORY ─────────────────────────────────────────────────────────
  { url: 'https://supabase.com/docs/guides/ai/vector-columns', label: 'Supabase pgvector guide', module: 'MEMORY', category: 'docs', priority: 1 },
  { url: 'https://supabase.com/docs/guides/database/extensions/pgvector', label: 'pgvector extension', module: 'MEMORY', category: 'docs', priority: 1 },
  { url: 'https://www.pinecone.io/learn/retrieval-augmented-generation/', label: 'RAG fundamentals', module: 'MEMORY', category: 'research', priority: 2 },
  { url: 'https://lilianweng.github.io/posts/2023-06-23-agent/', label: 'LLM agent memory patterns', module: 'BRAIN', category: 'research', priority: 1 },
  { url: 'https://www.anthropic.com/research/building-effective-agents', label: 'Effective agent architectures', module: 'BRAIN', category: 'research', priority: 1 },

  // ── DEFENSE ────────────────────────────────────────────────────────────────
  { url: 'https://owasp.org/www-project-top-ten/', label: 'OWASP Top 10', module: 'DEFENSE', category: 'reference', priority: 1 },
  { url: 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html', label: 'Input validation cheatsheet', module: 'DEFENSE', category: 'reference', priority: 2 },
  { url: 'https://portswigger.net/web-security/all-topics', label: 'PortSwigger web security topics', module: 'DEFENSE', category: 'reference', priority: 2 },
  { url: 'https://supabase.com/docs/guides/auth/row-level-security', label: 'RLS best practices', module: 'DEFENSE', category: 'docs', priority: 1 },

  // ── NEXUS / ROUTING ────────────────────────────────────────────────────────
  { url: 'https://platform.openai.com/docs/guides/rate-limits', label: 'OpenAI rate limits', module: 'NEXUS', category: 'docs', priority: 1 },
  { url: 'https://docs.anthropic.com/en/api/rate-limits', label: 'Anthropic rate limits', module: 'NEXUS', category: 'docs', priority: 1 },
  { url: 'https://openrouter.ai/docs/limits', label: 'OpenRouter limits', module: 'NEXUS', category: 'docs', priority: 1 },
  { url: 'https://docs.mistral.ai/getting-started/models/models_overview/', label: 'Mistral models overview', module: 'NEXUS', category: 'docs', priority: 2 },
  { url: 'https://docs.cohere.com/docs/rate-limits', label: 'Cohere rate limits', module: 'NEXUS', category: 'docs', priority: 2 },

  // ── ENCODE / CODE QUALITY ──────────────────────────────────────────────────
  { url: 'https://typescript-eslint.io/rules/', label: 'TypeScript ESLint rules', module: 'ENCODE', category: 'reference', priority: 2 },
  { url: 'https://react.dev/reference/react', label: 'React reference docs', module: 'ENCODE', category: 'docs', priority: 1 },
  { url: 'https://react.dev/learn/you-might-not-need-an-effect', label: 'React effect patterns', module: 'ENCODE', category: 'docs', priority: 2 },
  { url: 'https://tanstack.com/query/latest/docs/framework/react/overview', label: 'TanStack Query overview', module: 'ENCODE', category: 'docs', priority: 2 },
  { url: 'https://vitest.dev/guide/', label: 'Vitest testing guide', module: 'ENCODE', category: 'docs', priority: 3 },

  // ── DECODE / VALIDATION ────────────────────────────────────────────────────
  { url: 'https://zod.dev/', label: 'Zod schema validation', module: 'DECODE', category: 'docs', priority: 1 },
  { url: 'https://json-schema.org/understanding-json-schema/', label: 'JSON Schema reference', module: 'DECODE', category: 'reference', priority: 2 },

  // ── SYSTEM / RELIABILITY ───────────────────────────────────────────────────
  { url: 'https://sre.google/sre-book/table-of-contents/', label: 'Google SRE book', module: 'SYSTEM', category: 'reference', priority: 1 },
  { url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker', label: 'Circuit breaker pattern', module: 'SYSTEM', category: 'docs', priority: 2 },
  { url: 'https://martinfowler.com/articles/patterns-of-distributed-systems/', label: 'Distributed systems patterns', module: 'SYSTEM', category: 'research', priority: 2 },

  // ── VISION / OBSERVABILITY ─────────────────────────────────────────────────
  { url: 'https://opentelemetry.io/docs/concepts/', label: 'OpenTelemetry concepts', module: 'VISION', category: 'docs', priority: 2 },
  { url: 'https://recharts.org/en-US/api', label: 'Recharts API reference', module: 'VISION', category: 'docs', priority: 3 },

  // ── ACCESS / AUTH ──────────────────────────────────────────────────────────
  { url: 'https://supabase.com/docs/guides/auth', label: 'Supabase Auth guide', module: 'ACCESS', category: 'docs', priority: 1 },
  { url: 'https://oauth.net/2/', label: 'OAuth 2.0 specification', module: 'ACCESS', category: 'reference', priority: 2 },

  // ── INCLUSIVE / A11Y ───────────────────────────────────────────────────────
  { url: 'https://www.w3.org/WAI/WCAG22/quickref/', label: 'WCAG 2.2 quick reference', module: 'INCLUSIVE', category: 'reference', priority: 1 },
  { url: 'https://www.radix-ui.com/primitives/docs/overview/accessibility', label: 'Radix UI accessibility', module: 'INCLUSIVE', category: 'docs', priority: 2 },

  // ── AUDIT / COMPLIANCE ─────────────────────────────────────────────────────
  { url: 'https://www.soc2.co.uk/soc-2-requirements', label: 'SOC2 requirements overview', module: 'AUDIT', category: 'reference', priority: 2 },

  // ── ECONOMY / COST ─────────────────────────────────────────────────────────
  { url: 'https://supabase.com/pricing', label: 'Supabase pricing tiers', module: 'ECONOMY', category: 'reference', priority: 3 },

  // ── DREAM / SYNTHESIS ──────────────────────────────────────────────────────
  { url: 'https://arxiv.org/abs/2305.10601', label: 'Reflexion: Language agents with verbal reinforcement', module: 'DREAM', category: 'research', priority: 2 },
  { url: 'https://arxiv.org/abs/2310.06775', label: 'Self-RAG: Learning to retrieve, generate, reflect', module: 'DREAM', category: 'research', priority: 2 },

  // ── CORTEX / ORCHESTRATION ─────────────────────────────────────────────────
  { url: 'https://www.microsoft.com/en-us/research/blog/autogen-enabling-next-gen-llm-applications-via-multi-agent-conversation/', label: 'Multi-agent orchestration patterns', module: 'CORTEX', category: 'research', priority: 2 },

  // ── RIPPLE / INTEGRATIONS ──────────────────────────────────────────────────
  { url: 'https://supabase.com/docs/guides/functions', label: 'Edge Functions guide', module: 'RIPPLE', category: 'docs', priority: 1 },
  { url: 'https://supabase.com/docs/guides/realtime', label: 'Realtime subscriptions', module: 'RIPPLE', category: 'docs', priority: 2 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SELECTION LOGIC (with pre-built indexes)
// ═══════════════════════════════════════════════════════════════════════════════

/** Pre-built module→sources index for O(1) lookups */
const _moduleSourceIndex = new Map<string, DeepDiveSource[]>();
/** Pre-computed total weight for the full pool */
let _totalWeight = 0;
/** Pre-computed per-source weights */
const _sourceWeights: number[] = [];
/** Pre-computed covered modules */
let _coveredModules: string[] | null = null;

// Build indexes once at module load
for (const s of DEEP_DIVE_SOURCES) {
  const key = s.module.toLowerCase();
  const arr = _moduleSourceIndex.get(key);
  if (arr) arr.push(s);
  else _moduleSourceIndex.set(key, [s]);
  const w = 1 / s.priority;
  _sourceWeights.push(w);
  _totalWeight += w;
}
// Sort each module's sources by priority
for (const arr of _moduleSourceIndex.values()) {
  arr.sort((a, b) => a.priority - b.priority);
}

/** Get sources for a specific module (O(1) lookup) */
export function getSourcesForModule(moduleId: string): DeepDiveSource[] {
  return _moduleSourceIndex.get(moduleId.toLowerCase()) || [];
}

/** Select a random high-priority source for deep dive learning */
export function selectDeepDiveSource(preferModule?: string): DeepDiveSource | null {
  let candidates = DEEP_DIVE_SOURCES;
  let weights = _sourceWeights;
  let total = _totalWeight;

  if (preferModule) {
    const moduleSources = getSourcesForModule(preferModule);
    if (moduleSources.length > 0) {
      candidates = moduleSources;
      weights = moduleSources.map(s => 1 / s.priority);
      total = 0;
      for (const w of weights) total += w;
    }
  }

  let roll = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return candidates[i];
  }

  return candidates[0] || null;
}

/** Get all unique modules with sources (cached) */
export function getCoveredModules(): string[] {
  if (_coveredModules) return _coveredModules;
  _coveredModules = Array.from(_moduleSourceIndex.keys());
  return _coveredModules;
}

/** Get source count summary */
export function getSourceStats(): { total: number; byModule: Record<string, number>; byCategory: Record<string, number> } {
  const byModule: Record<string, number> = {};
  const byCategory: Record<string, number> = {};

  for (const s of DEEP_DIVE_SOURCES) {
    byModule[s.module] = (byModule[s.module] || 0) + 1;
    byCategory[s.category] = (byCategory[s.category] || 0) + 1;
  }

  return { total: DEEP_DIVE_SOURCES.length, byModule, byCategory };
}
