/**
 * pf-proprietary-evolution — Proprietary Evolution Lifecycle Engine
 * 
 * Handles:
 *   - discovery.collide: Bounce Candidate Node #41 against substrate nodes
 *   - discovery.batch: Run full collision sweep across all 40 nodes
 *   - crystallize.lock: Lock a discovered capability into deterministic memory
 *   - crystallize.batch-lock: Batch crystallize all eligible discoveries
 *   - export.capability-pack: Generate capability pack from crystallized memories
 * 
 * @classification FOUNDER EYES ONLY
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ═══ RATE LIMITING ═══
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxPerMinute = 30): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  entry.count++;
  return entry.count <= maxPerMinute;
}

// ═══ INPUT VALIDATION ═══
function validateString(val: unknown, maxLen = 200): string | null {
  if (typeof val !== 'string') return null;
  return val.trim().slice(0, maxLen).replace(/[^\w\s\-_.]/g, '') || null;
}

function validateStringArray(val: unknown, maxLen = 50, maxItems = 100): string[] {
  if (!Array.isArray(val)) return [];
  return val
    .filter((v): v is string => typeof v === 'string')
    .slice(0, maxItems)
    .map(v => v.trim().slice(0, maxLen));
}

function validatePositiveInt(val: unknown, max = 100): number {
  const n = Number(val);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(Math.floor(n), max);
}

// ═══ SUBSTRATE NODE MATRIX ═══
const SUBSTRATE_NODES = [
  'CORE','BRAIN','MEMORY','NERVE','DECODE','ENCODE','CORTEX','DEFENSE','ORACLE',
  'CONSCIENCE','PHANTOM','HARVEST','EVOLUTION','SHADOW','IMMUNITY','INTENT',
  'GOVERNANCE','ATLAS','FORGE','LINGUA','ECHO','SOVEREIGN','REFLEX','TREATY',
  'ENGINEER','COMPASS','OBSERVER','GENESIS','ANCHOR','PRISM','SENTRY','MEDIC',
  'SIGNAL','TENSOR','ARBITER','FLUX','VECTOR','SYNTH','RELAY','NEXUS',
];

const VALID_NODES = new Set(SUBSTRATE_NODES);

// ═══ NODE CAPABILITY SIGNATURES ═══
const NODE_CAPABILITIES: Record<string, string[]> = {
  CORE: ['init', 'pulse', 'heartbeat', 'lifecycle'],
  BRAIN: ['reasoning', 'inference', 'semantic_embed', 'context_window'],
  MEMORY: ['store', 'recall', 'semantic_search', 'consolidate'],
  NERVE: ['signal_emit', 'signal_route', 'threshold_gate', 'cascade'],
  DECODE: ['parse', 'interpret', 'nlp_extract', 'intent_classify'],
  ENCODE: ['code_gen', 'transform', 'compile', 'optimize'],
  CORTEX: ['orchestrate', 'coordinate', 'priority_queue', 'workflow'],
  DEFENSE: ['threat_score', 'anomaly_detect', 'rate_limit', 'quarantine'],
  ORACLE: ['predict', 'forecast', 'bayesian_update', 'monte_carlo'],
  CONSCIENCE: ['bias_detect', 'ethic_check', 'fairness_score', 'alignment'],
  PHANTOM: ['anonymize', 'proxy', 'obfuscate', 'stealth_route'],
  HARVEST: ['crawl', 'extract', 'deduplicate', 'enrich'],
  EVOLUTION: ['mutate', 'fitness_score', 'select', 'crossover'],
  SHADOW: ['diff', 'snapshot', 'compare', 'rollback'],
  IMMUNITY: ['adaptive_filter', 'whitelist', 'pattern_match', 'quarantine'],
  INTENT: ['route', 'resolve', 'dag_plan', 'broadcast'],
  GOVERNANCE: ['policy_check', 'approve', 'audit', 'compliance'],
  ATLAS: ['registry_lookup', 'capability_map', 'topology', 'discover'],
  FORGE: ['template', 'scaffold', 'generate', 'instantiate'],
  LINGUA: ['translate', 'localize', 'sentiment', 'summarize'],
  ECHO: ['replay', 'mirror', 'feedback_loop', 'amplify'],
  SOVEREIGN: ['seal', 'license', 'entitle', 'verify'],
  REFLEX: ['auto_respond', 'trigger', 'react', 'shortcut'],
  TREATY: ['negotiate', 'contract', 'handshake', 'protocol'],
  ENGINEER: ['debug', 'profile', 'benchmark', 'tech_debt'],
  COMPASS: ['navigate', 'recommend', 'rank', 'prioritize'],
  OBSERVER: ['monitor', 'telemetry', 'alert', 'dashboard'],
  GENESIS: ['bootstrap', 'seed', 'initialize', 'provision'],
  ANCHOR: ['persist', 'checkpoint', 'backup', 'restore'],
  PRISM: ['decompose', 'spectrum', 'facet', 'refract'],
  SENTRY: ['guard', 'validate', 'gatekeep', 'authorize'],
  MEDIC: ['diagnose', 'heal', 'patch', 'recover'],
  SIGNAL: ['emit', 'subscribe', 'broadcast', 'filter'],
  TENSOR: ['compute', 'matrix_op', 'gradient', 'transform'],
  ARBITER: ['judge', 'arbitrate', 'resolve_conflict', 'consensus'],
  FLUX: ['stream', 'buffer', 'throttle', 'backpressure'],
  VECTOR: ['embed', 'similarity', 'cluster', 'dimension_reduce'],
  SYNTH: ['synthesize', 'compose', 'blend', 'harmonize'],
  RELAY: ['forward', 'proxy', 'load_balance', 'circuit_break'],
  NEXUS: ['route_ai', 'failover', 'cost_track', 'provider_select'],
};

const VALID_MODULES = new Set(['discovery', 'crystallize', 'export']);
const VALID_ACTIONS: Record<string, Set<string>> = {
  discovery: new Set(['collide', 'batch']),
  crystallize: new Set(['lock', 'batch-lock']),
  export: new Set(['capability-pack']),
};
const VALID_LANGUAGES = new Set(['typescript', 'python', 'rust', 'go', 'zig', 'java', 'csharp', 'ruby', 'swift', 'kotlin', 'verilog', 'systemverilog', 'vhdl', 'systemc', 'elixir', 'lua', 'c', 'cpp', 'dart', 'scala', 'haskell', 'php', 'chisel', 'amaranth', 'spice']);

// ═══ COLLISION SCORING ═══

interface CollisionResult {
  name: string;
  description: string;
  cjpi_score: number;
  tier: string;
  chain: string[];
  capability_type: string;
}

function scoreTier(cjpi: number): string {
  if (cjpi >= 92) return 'apex';
  if (cjpi >= 80) return 'mythic';
  if (cjpi >= 65) return 'relic';
  if (cjpi >= 45) return 'prime';
  return 'mint';
}

function collideNodes(
  candidateName: string,
  candidateMeta: Record<string, unknown>,
  targetNode: string,
  permutationDepth: number
): CollisionResult[] {
  const capabilities = NODE_CAPABILITIES[targetNode] || ['generic'];
  const candidateResolvers = Number(candidateMeta.resolver_count || 1);
  const candidateLanguage = String(candidateMeta.language || 'Unknown');
  const candidateSize = Number(candidateMeta.size_kb || 0);

  const results: CollisionResult[] = [];

  for (const cap of capabilities) {
    const nameHash = hashString(`${candidateName}:${targetNode}:${cap}`);
    let cjpi = 30 + (nameHash % 60);

    if (candidateResolvers > 10) cjpi += 5;
    if (candidateSize > 100) cjpi += 3;
    if (candidateLanguage.includes('TypeScript')) cjpi += 2;
    
    for (let d = 1; d < permutationDepth; d++) {
      const depthHash = hashString(`${candidateName}:${targetNode}:${cap}:depth${d}`);
      if (depthHash % 10 === 0) cjpi += 5;
    }

    cjpi = Math.min(cjpi, 99);

    if (cjpi >= 40) {
      const capName = `${candidateName}_${targetNode}_${cap}`.toUpperCase();
      const desc = generateCapabilityDescription(candidateName, targetNode, cap, cjpi);
      results.push({
        name: capName,
        description: desc,
        cjpi_score: cjpi,
        tier: scoreTier(cjpi),
        chain: [candidateName, targetNode],
        capability_type: cap,
      });
    }
  }

  results.sort((a, b) => b.cjpi_score - a.cjpi_score);
  return results.slice(0, Math.min(results.length, permutationDepth + 1));
}

// ═══ CAPABILITY DESCRIPTION GENERATOR ═══

const CAPABILITY_DESCRIPTIONS: Record<string, Record<string, string>> = {
  BRAIN: {
    reasoning: 'Autonomous reasoning engine that decomposes complex problems into inferential chains, enabling multi-step logical deduction across unstructured data.',
    inference: 'Real-time inference pipeline that applies Bayesian updating to streaming inputs, producing confidence-weighted predictions with explainable reasoning paths.',
    semantic_embed: 'Semantic embedding layer that maps arbitrary text into dense vector spaces, enabling similarity search and conceptual clustering at sub-millisecond latency.',
    context_window: 'Dynamic context window manager that intelligently prioritizes and compresses information to maximize effective reasoning within token constraints.',
  },
  MEMORY: {
    store: 'Persistent memory substrate that indexes and stores structured knowledge with automatic deduplication and version-aware conflict resolution.',
    recall: 'Associative recall engine that retrieves contextually relevant memories using semantic proximity scoring and temporal decay weighting.',
    semantic_search: 'Full-spectrum semantic search across the memory graph, supporting hybrid keyword + vector queries with re-ranking.',
    consolidate: 'Memory consolidation pipeline that merges redundant entries, strengthens high-signal patterns, and prunes low-confidence fragments during idle cycles.',
  },
  CORTEX: {
    orchestrate: 'Multi-agent orchestration layer that decomposes complex workflows into parallelizable sub-tasks with automatic dependency resolution and failure recovery.',
    coordinate: 'Real-time coordination protocol that synchronizes concurrent processes through lock-free message passing and consensus-based state reconciliation.',
    priority_queue: 'Adaptive priority scheduler that dynamically reorders execution queues based on urgency signals, resource availability, and downstream impact analysis.',
    workflow: 'Declarative workflow engine that compiles high-level intent specifications into executable DAGs with built-in retry, compensation, and observability.',
  },
  DEFENSE: {
    threat_score: 'Behavioral threat scoring system that evaluates request patterns against learned attack signatures and anomaly baselines in real-time.',
    anomaly_detect: 'Statistical anomaly detector that identifies deviations from established behavioral norms using adaptive thresholds and ensemble methods.',
    rate_limit: 'Intelligent rate limiter with per-entity token bucket allocation that adapts quotas based on trust level and historical usage patterns.',
    quarantine: 'Automated quarantine system that isolates suspicious operations into sandboxed execution environments for forensic analysis.',
  },
  ORACLE: {
    predict: 'Predictive analytics engine that generates probabilistic forecasts by synthesizing historical patterns, real-time signals, and domain heuristics.',
    forecast: 'Time-series forecasting module that models seasonal patterns, trend shifts, and external shocks to project future system behavior.',
    bayesian_update: 'Live Bayesian updating framework that continuously refines probability distributions as new evidence arrives, maintaining calibrated uncertainty estimates.',
    monte_carlo: 'Monte Carlo simulation engine that explores outcome spaces through stochastic sampling, producing risk-adjusted decision recommendations.',
  },
  FORGE: {
    template: 'Code template engine that generates language-idiomatic scaffolds from abstract specifications with embedded best practices and test harnesses.',
    scaffold: 'Project scaffolding system that instantiates full application architectures from declarative blueprints, including CI/CD and deployment configs.',
    generate: 'Generative code synthesis pipeline that translates natural language specifications into production-ready implementations with type safety guarantees.',
    instantiate: 'Runtime instantiation engine that compiles abstract capability definitions into executable modules with automatic dependency injection.',
  },
  EVOLUTION: {
    mutate: 'Controlled mutation engine that introduces targeted variations into capability parameters to explore neighboring solution spaces.',
    fitness_score: 'Multi-objective fitness evaluator that scores capability variants across performance, reliability, cost, and composability dimensions.',
    select: 'Tournament selection mechanism that promotes high-fitness variants while maintaining population diversity for continued exploration.',
    crossover: 'Capability crossover operator that recombines successful traits from multiple variants to produce hybrid capabilities with emergent properties.',
  },
  ENCODE: {
    code_gen: 'Multi-language code generation engine that translates abstract behavioral specifications into optimized, idiomatic source code.',
    transform: 'AST transformation pipeline that restructures code patterns for performance optimization while preserving semantic equivalence.',
    compile: 'Just-in-time compilation layer that converts dynamic capability chains into optimized native execution paths.',
    optimize: 'Profile-guided optimizer that identifies hot paths and applies targeted optimizations including loop unrolling, dead code elimination, and constant folding.',
  },
  DECODE: {
    parse: 'Universal parser that handles structured, semi-structured, and unstructured inputs with automatic schema inference and error recovery.',
    interpret: 'Semantic interpreter that transforms raw parsed data into domain-specific knowledge representations with relationship extraction.',
    nlp_extract: 'NLP extraction pipeline that identifies entities, relationships, sentiments, and intents from natural language with configurable precision/recall tradeoffs.',
    intent_classify: 'Multi-label intent classifier that maps user inputs to actionable system operations with confidence scoring and disambiguation.',
  },
  PHANTOM: {
    anonymize: 'Data anonymization engine that applies differential privacy techniques while preserving statistical utility for downstream analysis.',
    proxy: 'Transparent proxy layer that routes operations through privacy-preserving intermediaries with automatic credential rotation.',
    obfuscate: 'Code and data obfuscation system that protects intellectual property through semantic-preserving transformations.',
    stealth_route: 'Stealth routing protocol that masks operation origins and patterns through randomized path selection and timing jitter.',
  },
  NEXUS: {
    route_ai: 'Intelligent AI model router that selects optimal providers based on task complexity, latency requirements, and cost constraints.',
    failover: 'Multi-provider failover system with health-aware routing that maintains service continuity across provider outages.',
    cost_track: 'Real-time cost tracking and budget enforcement layer that monitors token usage and applies spend limits per capability.',
    provider_select: 'Dynamic provider selector that evaluates model capabilities against task requirements to minimize cost while meeting quality thresholds.',
  },
  SIGNAL: {
    emit: 'High-throughput event emission system that publishes typed signals to subscriber networks with guaranteed delivery semantics.',
    subscribe: 'Reactive subscription manager that enables fine-grained event filtering with backpressure-aware consumption.',
    broadcast: 'Fan-out broadcast engine that efficiently distributes signals across distributed subscriber networks with configurable consistency levels.',
    filter: 'Signal filtering pipeline that applies composable predicate chains to event streams for real-time pattern matching.',
  },
  VECTOR: {
    embed: 'High-dimensional embedding engine that maps diverse data types into unified vector spaces for cross-modal similarity analysis.',
    similarity: 'Vector similarity search with approximate nearest neighbor algorithms supporting billions of vectors at sub-millisecond latency.',
    cluster: 'Dynamic clustering engine that discovers natural groupings in high-dimensional data with automatic cluster count estimation.',
    dimension_reduce: 'Dimensionality reduction pipeline that projects complex data into interpretable low-dimensional representations while preserving topological structure.',
  },
};

function generateCapabilityDescription(candidateName: string, targetNode: string, cap: string, cjpi: number): string {
  const nodeDescs = CAPABILITY_DESCRIPTIONS[targetNode];
  if (nodeDescs && nodeDescs[cap]) {
    return nodeDescs[cap];
  }
  // Fallback with richer generic description
  const tierLabel = cjpi >= 92 ? 'apex-tier' : cjpi >= 80 ? 'mythic-tier' : cjpi >= 65 ? 'relic-tier' : 'emerging';
  return `${tierLabel} collision capability discovered at the intersection of ${candidateName} and ${targetNode}.${cap} — a proprietary behavioral pattern that enables automated ${cap.replace(/_/g, ' ')} operations with substrate-level integration.`;
}

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

async function generateFingerprint(chain: string[], epoch: string): Promise<string> {
  const payload = JSON.stringify({ steps: chain.map(m => ({ module: m, capability: 'collision' })), epoch });
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ═══ MAIN HANDLER ═══

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(clientIp, 60)) {
    return jsonResponse({ success: false, error: 'Rate limit exceeded. Try again in a minute.' }, 429);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Auth check — require authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ success: false, error: 'Authentication required' }, 401);
    }
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const anonClient = createClient(supabaseUrl, anonKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await anonClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return jsonResponse({ success: false, error: 'Invalid or expired auth token' }, 401);
    }
    const userId = userData.user.id;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
    }

    const module = validateString(body.module, 50);
    const action = validateString(body.action, 50);
    const input = (typeof body.input === 'object' && body.input !== null) ? body.input as Record<string, unknown> : {};

    if (!module || !VALID_MODULES.has(module)) {
      return jsonResponse({ success: false, error: `Invalid module: ${module}` }, 400);
    }
    if (!action || !VALID_ACTIONS[module]?.has(action)) {
      return jsonResponse({ success: false, error: `Invalid action: ${module}.${action}` }, 400);
    }

    // ═══ DISCOVERY MODULE ═══
    if (module === 'discovery') {
      
      if (action === 'collide') {
        const candidate_node = validateString(input.candidate_node, 100);
        const target_node = validateString(input.target_node, 50);
        const permutation_depth = validatePositiveInt(input.permutation_depth, 10);
        
        if (!candidate_node) {
          return jsonResponse({ success: false, error: 'Missing or invalid candidate_node' }, 400);
        }
        if (!target_node || !VALID_NODES.has(target_node)) {
          return jsonResponse({ success: false, error: `Invalid target_node: ${target_node}` }, 400);
        }

        const { data: candidateData } = await supabase
          .from('artifact_registry')
          .select('name, metadata')
          .eq('user_id', userId)
          .eq('category', 'proprietary-evolution')
          .eq('tier', 'candidate')
          .ilike('name', `%${candidate_node}%`)
          .limit(1)
          .maybeSingle();

        if (!candidateData) {
          return jsonResponse({ success: false, error: 'Candidate node not found for this account' }, 404);
        }

        const candidateMeta = (candidateData.metadata as Record<string, unknown>) || {};
        const results = collideNodes(candidate_node, candidateMeta, target_node, permutation_depth);

        for (const result of results) {
          const fingerprint = await generateFingerprint(result.chain, 'SPARTA');
          await supabase.from('artifact_registry').upsert({
            user_id: userId,
            name: result.name,
            slug: result.name.toLowerCase().replace(/_/g, '-').slice(0, 200),
            tier: result.tier,
            category: 'proprietary-discovery',
            description: result.description.slice(0, 500),
            metadata: {
              node_a: candidate_node,
              node_b: target_node,
              cjpi_score: result.cjpi_score,
              capability_type: result.capability_type,
              chain: result.chain,
              fingerprint,
              discovered_at: new Date().toISOString(),
              crystallized: false,
            },
          }, { onConflict: 'user_id,slug' });
        }

        return jsonResponse({
          success: true,
          capabilities: results,
          collision: { candidate: candidate_node, target: target_node, depth: permutation_depth },
          timestamp: new Date().toISOString(),
        });
      }

      if (action === 'batch') {
        const candidate_node = validateString(input.candidate_node, 100);
        const permutation_depth = validatePositiveInt(input.permutation_depth, 10);
        
        if (!candidate_node) {
          return jsonResponse({ success: false, error: 'Missing or invalid candidate_node' }, 400);
        }

        const { data: candidateData } = await supabase
          .from('artifact_registry')
          .select('name, metadata')
          .eq('user_id', userId)
          .eq('category', 'proprietary-evolution')
          .eq('tier', 'candidate')
          .ilike('name', `%${candidate_node}%`)
          .limit(1)
          .maybeSingle();

        if (!candidateData) {
          return jsonResponse({ success: false, error: 'Candidate node not found for this account' }, 404);
        }

        const candidateMeta = (candidateData.metadata as Record<string, unknown>) || {};
        const allResults: CollisionResult[] = [];

        for (const node of SUBSTRATE_NODES) {
          const results = collideNodes(candidate_node, candidateMeta, node, permutation_depth);
          allResults.push(...results);
        }

        allResults.sort((a, b) => b.cjpi_score - a.cjpi_score);
        const topResults = allResults.slice(0, 50);

        for (const result of topResults) {
          const fingerprint = await generateFingerprint(result.chain, 'SPARTA');
          await supabase.from('artifact_registry').upsert({
            user_id: userId,
            name: result.name,
            slug: result.name.toLowerCase().replace(/_/g, '-').slice(0, 200),
            tier: result.tier,
            category: 'proprietary-discovery',
            description: result.description.slice(0, 500),
            metadata: {
              node_a: result.chain[0],
              node_b: result.chain[1],
              cjpi_score: result.cjpi_score,
              capability_type: result.capability_type,
              chain: result.chain,
              fingerprint,
              discovered_at: new Date().toISOString(),
              crystallized: false,
            },
          }, { onConflict: 'user_id,slug' });
        }

        return jsonResponse({
          success: true,
          total_collisions: SUBSTRATE_NODES.length,
          total_capabilities: allResults.length,
          top_capabilities: topResults,
          s_tier_count: allResults.filter(r => r.cjpi_score >= 85).length,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // ═══ CRYSTALLIZE MODULE ═══
    if (module === 'crystallize') {
      
      if (action === 'lock') {
        const discovery_id = validateString(input.discovery_id, 100);
        if (!discovery_id) {
          return jsonResponse({ success: false, error: 'Missing or invalid discovery_id' }, 400);
        }

        const { data: discovery } = await supabase
          .from('artifact_registry')
          .select('*')
          .eq('id', discovery_id)
          .eq('user_id', userId)
          .maybeSingle();

        if (!discovery) {
          return jsonResponse({ success: false, error: 'Discovery not found' }, 404);
        }

        const meta = (discovery.metadata as Record<string, unknown>) || {};
        if (meta.crystallized === true) {
          return jsonResponse({ success: false, error: 'Already crystallized' }, 409);
        }

        const chain = (meta.chain as string[]) || [];
        const fingerprint = await generateFingerprint(chain, 'SPARTA');
        const moatSignature = crypto.randomUUID();

        const { error } = await supabase
          .from('artifact_registry')
          .update({
            category: 'proprietary-crystallized',
            metadata: {
              ...meta,
              crystallized: true,
              crystallized_at: new Date().toISOString(),
              moat_signature: moatSignature,
              structural_fingerprint: fingerprint,
              lock_version: 1,
            },
          })
          .eq('id', discovery_id)
          .eq('user_id', userId);

        if (error) {
          return jsonResponse({ success: false, error: error.message }, 500);
        }

        return jsonResponse({
          success: true,
          crystallized: {
            id: discovery_id,
            moat_signature: moatSignature,
            fingerprint: fingerprint.slice(0, 12).toUpperCase(),
          },
          timestamp: new Date().toISOString(),
        });
      }

      if (action === 'batch-lock') {
        const min_cjpi = validatePositiveInt(input.min_cjpi, 99) || 70;

        const { data: discoveries } = await supabase
          .from('artifact_registry')
          .select('id, name, metadata, tier')
          .eq('user_id', userId)
          .eq('category', 'proprietary-discovery')
          .order('created_at', { ascending: false })
          .limit(100);

        const eligible = (discoveries || []).filter((d: any) => {
          const meta = (d.metadata as Record<string, unknown>) || {};
          return Number(meta.cjpi_score || 0) >= min_cjpi && !meta.crystallized;
        });

        let crystallized = 0;
        for (const d of eligible) {
          const meta = (d.metadata as Record<string, unknown>) || {};
          const chain = (meta.chain as string[]) || [];
          const fingerprint = await generateFingerprint(chain, 'SPARTA');

          const { error } = await supabase.from('artifact_registry').update({
            category: 'proprietary-crystallized',
            metadata: {
              ...meta,
              crystallized: true,
              crystallized_at: new Date().toISOString(),
              moat_signature: crypto.randomUUID(),
              structural_fingerprint: fingerprint,
              lock_version: 1,
            },
          }).eq('id', d.id).eq('user_id', userId);

          if (!error) crystallized++;
        }

        return jsonResponse({
          success: true,
          crystallized_count: crystallized,
          threshold: min_cjpi,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // ═══ EXPORT MODULE ═══
    if (module === 'export') {
      
      if (action === 'capability-pack') {
        const capability_ids = validateStringArray(input.capability_ids, 100, 100);
        const target_language = validateString(input.target_language, 30) || 'typescript';
        const include_mini_runtime = input.include_mini_runtime !== false;

        if (capability_ids.length === 0) {
          return jsonResponse({ success: false, error: 'No valid capability_ids provided' }, 400);
        }

        if (!VALID_LANGUAGES.has(target_language)) {
          return jsonResponse({ success: false, error: `Unsupported target language: ${target_language}` }, 400);
        }

        const { data: capabilities } = await supabase
          .from('artifact_registry')
          .select('id, name, metadata, tier, description')
          .in('id', capability_ids)
          .eq('user_id', userId)
          .eq('category', 'proprietary-crystallized');

        if (!capabilities || capabilities.length === 0) {
          return jsonResponse({ success: false, error: 'No crystallized capabilities found for provided IDs' }, 404);
        }

        const packId = crypto.randomUUID();
        const manifest = {
          pack_id: packId,
          version: '1.0.0',
          target_language,
          created_at: new Date().toISOString(),
          includes_mini_runtime: include_mini_runtime,
          capabilities: capabilities.map((c: any) => {
            const meta = (c.metadata as Record<string, unknown>) || {};
            return {
              id: c.id,
              name: c.name,
              tier: c.tier,
              cjpi_score: meta.cjpi_score,
              fingerprint: String(meta.structural_fingerprint || '').slice(0, 12).toUpperCase(),
              moat_signature: meta.moat_signature,
              chain: meta.chain,
            };
          }),
          mini_runtime: include_mini_runtime ? {
            engine: 'CMPSBL® Mini-Runtime™ Engine',
            lines: target_language === 'typescript' ? 700 : 900,
            subsystems: ['cjpi_scorer', 'saga_orchestrator', 'fsm_engine', 'manifest_parser'],
          } : null,
        };

        for (const cap of capabilities) {
          const meta = (cap.metadata as Record<string, unknown>) || {};
          await supabase.from('artifact_registry').update({
            metadata: {
              ...meta,
              exported: true,
              retired: true,
              exported_at: new Date().toISOString(),
              retired_at: new Date().toISOString(),
              export_target: target_language,
              export_pack_id: packId,
            },
          }).eq('id', cap.id).eq('user_id', userId);
        }

        try {
          await supabase.from('audit_logs').insert({
            action: 'proprietary_evolution_export',
            entity_type: 'capability_pack',
            entity_id: packId,
            performed_by: userId,
            details: {
              target_language,
              capability_count: capabilities.length,
              include_mini_runtime,
            },
          });
        } catch (_) { /* non-blocking audit */ }

        return jsonResponse({
          success: true,
          pack_id: packId,
          manifest,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return jsonResponse({ success: false, error: `Unknown module/action: ${module}.${action}` }, 400);

  } catch (err) {
    console.error('[proprietary-evolution] Error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
