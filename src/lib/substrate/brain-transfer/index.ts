/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Brain Knowledge Transfer Pipelines — v1.0.0
 * 
 * Universal knowledge transfer system that distills Brain memories
 * into actionable expertise for any module. Each module gets a
 * specialized pipeline that extracts relevant patterns and injects
 * them into hot memory for instant recall.
 * 
 * Modules supported:
 * - DECODE: Response patterns, personality templates, conversation strategies
 * - DEFENSE: Threat patterns, anomaly signatures, security heuristics
 * - CORTEX: Architectural patterns, proposal templates, design decisions
 * - VISION: Tracing patterns, diagnostic heuristics, observability rules
 * - INCLUSIVE: WCAG remediation patterns, auto-fix templates, A11y rules
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type TransferModule = 'decode' | 'defense' | 'cortex' | 'vision' | 'inclusive';

export interface ModuleTransferConfig {
  module: TransferModule;
  /** Keywords that identify relevant memories */
  relevanceSignals: string[];
  /** Memory types to search */
  memoryTypes: string[];
  /** Category prefix for hot memory entries */
  hotCategoryPrefix: string;
  /** Max patterns in hot cache per module */
  hotCacheLimit: number;
  /** Minimum confidence to transfer */
  minConfidence: number;
}

export interface TransferBatch {
  module: TransferModule;
  transferred: number;
  enriched: number;
  skipped: number;
  errors: number;
  duration_ms: number;
}

export interface ModuleKnowledgeReport {
  module: TransferModule;
  hot_patterns: number;
  total_memories: number;
  avg_confidence: number;
  top_categories: string[];
  last_transfer: string | null;
}

// ═══════════════════════════════════════════════════════════════
// MODULE CONFIGS
// ═══════════════════════════════════════════════════════════════

const MODULE_CONFIGS: Record<TransferModule, ModuleTransferConfig> = {
  decode: {
    module: 'decode',
    relevanceSignals: [
      'response', 'conversation', 'chat', 'personality', 'tone', 'user',
      'greeting', 'farewell', 'clarification', 'empathy', 'context',
      'question', 'answer', 'support', 'help', 'explain', 'summarize',
      'format', 'markdown', 'template', 'message',
    ],
    memoryTypes: ['learned', 'heuristic', 'pattern', 'interaction'],
    hotCategoryPrefix: 'decode_transfer',
    hotCacheLimit: 100,
    minConfidence: 0.5,
  },
  defense: {
    module: 'defense',
    relevanceSignals: [
      'security', 'threat', 'attack', 'vulnerability', 'exploit', 'injection',
      'xss', 'csrf', 'auth', 'permission', 'rate limit', 'anomaly', 'bot',
      'fingerprint', 'ip', 'reputation', 'firewall', 'perimeter', 'scan',
      'malicious', 'suspicious', 'block', 'challenge', 'abuse', 'brute',
    ],
    memoryTypes: ['learned', 'heuristic', 'pattern', 'alert'],
    hotCategoryPrefix: 'defense_transfer',
    hotCacheLimit: 80,
    minConfidence: 0.6,
  },
  cortex: {
    module: 'cortex',
    relevanceSignals: [
      'architecture', 'design', 'pattern', 'proposal', 'refactor', 'structure',
      'module', 'component', 'service', 'dependency', 'coupling', 'cohesion',
      'abstraction', 'interface', 'layer', 'pipeline', 'orchestration',
      'scalability', 'maintainability', 'separation', 'solid',
    ],
    memoryTypes: ['learned', 'heuristic', 'pattern', 'proposal'],
    hotCategoryPrefix: 'cortex_transfer',
    hotCacheLimit: 60,
    minConfidence: 0.6,
  },
  vision: {
    module: 'vision',
    relevanceSignals: [
      'trace', 'diagnostic', 'observability', 'metric', 'log', 'monitor',
      'alert', 'latency', 'error rate', 'throughput', 'health', 'status',
      'anomaly', 'baseline', 'threshold', 'dashboard', 'telemetry',
      'span', 'correlation', 'root cause', 'debug',
    ],
    memoryTypes: ['learned', 'heuristic', 'pattern', 'diagnostic'],
    hotCategoryPrefix: 'vision_transfer',
    hotCacheLimit: 50,
    minConfidence: 0.5,
  },
  inclusive: {
    module: 'inclusive',
    relevanceSignals: [
      'accessibility', 'a11y', 'wcag', 'aria', 'screen reader', 'keyboard',
      'focus', 'contrast', 'alt text', 'semantic', 'landmark', 'heading',
      'label', 'role', 'tabindex', 'skip link', 'live region',
      'color blind', 'dyslexia', 'motor', 'cognitive',
    ],
    memoryTypes: ['learned', 'heuristic', 'pattern', 'remediation'],
    hotCategoryPrefix: 'inclusive_transfer',
    hotCacheLimit: 60,
    minConfidence: 0.5,
  },
};

// ═══════════════════════════════════════════════════════════════
// CURATED EXPERT PATTERNS PER MODULE
// ═══════════════════════════════════════════════════════════════

const DECODE_PATTERNS = [
  { title: 'Contextual Memory Recall', content: 'Always check conversation history before responding. Use brain_memory_hot for recent context, brain_memories for long-term knowledge. Never answer without context lookup.', priority: 95 },
  { title: 'Adaptive Tone Matching', content: 'Match the user\'s formality level. Technical users get concise, jargon-appropriate responses. Casual users get friendly, approachable language. Detect from first 2 messages.', priority: 90 },
  { title: 'Structured Response Templates', content: 'For complex answers use: 1) Brief summary (1 line), 2) Detailed explanation, 3) Action items or next steps. For simple questions, just answer directly.', priority: 88 },
  { title: 'Graceful Uncertainty Handling', content: 'When confidence is below 0.6, explicitly state uncertainty level. Offer to search for more information. Never fabricate facts — admit knowledge gaps honestly.', priority: 92 },
  { title: 'Multi-turn Context Threading', content: 'Track conversation threads across multiple messages. Use cascade_conversations for session continuity. Summarize and persist every 5th exchange for long-term retention.', priority: 87 },
  { title: 'Domain-Specific Vocabulary', content: 'Maintain per-user vocabulary preferences. If a user says "edge functions" vs "serverless functions", mirror their terminology. Store preferences in metadata.', priority: 82 },
  { title: 'Error Recovery Responses', content: 'When a previous response was incorrect or unhelpful, acknowledge it directly. "I gave you incorrect information about X. Here\'s the accurate answer..." builds trust.', priority: 93 },
  { title: 'Proactive Suggestions', content: 'After answering, offer 1-2 related suggestions: "You might also want to..." Based on similar queries from brain_memories pattern matching.', priority: 80 },
];

const DEFENSE_PATTERNS = [
  { title: 'SQL Injection Detection', content: 'Detect SQL injection patterns: UNION SELECT, OR 1=1, DROP TABLE, -- comment terminators, hex-encoded payloads. Apply at API boundary before any query construction.', priority: 98 },
  { title: 'Rate Limit Escalation', content: 'Implement progressive rate limiting: 60rpm normal → 30rpm warning → 10rpm throttle → block. Each tier doubles cooldown. Track per-IP and per-API-key independently.', priority: 95 },
  { title: 'Bot Fingerprinting', content: 'Score requests 0-100 based on: User-Agent family, TLS fingerprint, request timing variance, header order, and behavioral patterns. Score <30 = likely bot.', priority: 90 },
  { title: 'Anomaly Z-Score Detection', content: 'Maintain rolling 1-hour baselines for request volume, error rates, and unique IPs. Flag Z-scores >2.5 as anomalies. Auto-escalate Z>4 to enforcement mode.', priority: 93 },
  { title: 'Input Sanitization Boundaries', content: 'Apply Zod validation at every API boundary. Strip HTML tags from text inputs. Reject payloads >1MB. Validate content-type headers match actual content.', priority: 96 },
  { title: 'Privilege Escalation Detection', content: 'Monitor for auth token manipulation: modified JWTs, role claim injection, expired token reuse. Compare token claims against database roles on every protected route.', priority: 97 },
  { title: 'Behavioral Pattern Matching', content: 'Track per-session action sequences. Flag unusual patterns: rapid endpoint scanning, sequential ID enumeration, form submission without prior page load.', priority: 88 },
  { title: 'Defense Event Correlation', content: 'Correlate defense events across time windows. Single anomaly = log. 3 anomalies in 5min from same source = investigate. 5+ = auto-challenge/block.', priority: 91 },
];

const CORTEX_PATTERNS = [
  { title: 'Module Boundary Enforcement', content: 'Each module must have a single entry point (index.ts), expose only typed interfaces, and communicate via the substrate singleton. No direct cross-module imports of internal files.', priority: 92 },
  { title: 'Proposal Quality Scoring', content: 'Score proposals on 5 axes: feasibility (can we build it?), impact (does it matter?), risk (what could break?), cost (how much effort?), reversibility (can we undo it?). Min 3/5 to proceed.', priority: 90 },
  { title: 'Dependency Graph Analysis', content: 'Before proposing changes, map the dependency graph. Changes to highly-connected nodes (>5 dependents) require shadow testing. Leaf nodes can be changed more freely.', priority: 88 },
  { title: 'Incremental Refactoring', content: 'Break large refactors into chains of small, independently-verifiable steps. Each step must leave the system in a working state. Max 20% file change per step.', priority: 94 },
  { title: 'Architecture Decision Records', content: 'Every significant decision must be recorded: what was decided, why, what alternatives were considered, and what trade-offs were accepted. Store in brain_memories as heuristic.', priority: 86 },
  { title: 'Service Composition Patterns', content: 'Prefer composition over inheritance. Build complex behaviors by composing simple, focused services. Each service should do one thing excellently.', priority: 85 },
];

const VISION_PATTERNS = [
  { title: 'Error Cascade Detection', content: 'When error rate spikes, trace backwards through the dependency chain. The root cause is usually 2-3 hops upstream from where errors are observed. Check the earliest timestamp.', priority: 93 },
  { title: 'Latency Budgets', content: 'Allocate latency budgets: API total ≤200ms, DB query ≤50ms, external call ≤100ms, render ≤50ms. Alert when any component exceeds 150% of budget.', priority: 90 },
  { title: 'Health Score Composition', content: 'System health = weighted average: uptime (30%), error rate (25%), latency p99 (20%), memory usage (15%), active connections (10%). Update every 60s.', priority: 88 },
  { title: 'Diagnostic Breadcrumbs', content: 'Add structured breadcrumbs at decision points: module entry, external calls, state changes, error catches. Include: timestamp, module, action, and relevant context.', priority: 85 },
  { title: 'Baseline Drift Detection', content: 'Maintain 7-day rolling baselines for all key metrics. Alert on sustained drift (>10% shift over 24h) even if no spike occurs. Gradual degradation is harder to spot than crashes.', priority: 91 },
];

const INCLUSIVE_PATTERNS = [
  { title: 'Focus Management', content: 'After dynamic content changes (modals, notifications, route changes), move focus to the new content. Use tabIndex={-1} on the container and call .focus() programmatically.', priority: 94 },
  { title: 'ARIA Live Regions', content: 'Use aria-live="polite" for non-urgent updates (data loaded, form saved) and aria-live="assertive" for critical alerts (errors, session expiry). Never use both on the same element.', priority: 92 },
  { title: 'Color Contrast Auto-Fix', content: 'Minimum contrast ratios: 4.5:1 for normal text, 3:1 for large text (18px+ or 14px+ bold). For auto-fix, darken foreground or lighten background by smallest increment needed.', priority: 96 },
  { title: 'Keyboard Navigation Patterns', content: 'All interactive elements must be keyboard accessible. Custom widgets need arrow key navigation (roving tabindex), Escape to close, Enter/Space to activate. Test with Tab key only.', priority: 95 },
  { title: 'Semantic HTML Priority', content: 'Use native HTML elements first: <button> not <div onClick>, <nav> not <div class="nav">, <main> not <div id="content">. Native elements get free keyboard + screen reader support.', priority: 93 },
  { title: 'Alternative Text Strategy', content: 'Decorative images: alt="". Informative images: describe content, not appearance. Functional images (links/buttons): describe the action. Complex images: use aria-describedby with longer description.', priority: 90 },
  { title: 'Skip Link Implementation', content: 'Add a skip link as the first focusable element: <a href="#main-content" class="sr-only focus:not-sr-only">Skip to content</a>. Target must have tabIndex={-1} and id="main-content".', priority: 88 },
];

// ═══════════════════════════════════════════════════════════════
// TRANSFER ENGINE
// ═══════════════════════════════════════════════════════════════

/**
 * Run a knowledge transfer for a specific module
 */
export async function transferKnowledge(module: TransferModule): Promise<TransferBatch> {
  const startTime = Date.now();
  const config = MODULE_CONFIGS[module];
  let transferred = 0, enriched = 0, skipped = 0, errors = 0;

  try {
    // 1. Extract relevant brain memories
    const { data: memories } = await supabase
      .from('brain_memories')
      .select('*')
      .gte('confidence', config.minConfidence)
      .in('memory_type', config.memoryTypes)
      .order('confidence', { ascending: false })
      .limit(100);

    if (!memories) {
      return { module, transferred: 0, enriched: 0, skipped: 0, errors: 0, duration_ms: Date.now() - startTime };
    }

    // 2. Filter for relevance to this module
    const relevant = memories.filter(m => {
      const lower = (m.content || '').toLowerCase();
      return config.relevanceSignals.some(signal => lower.includes(signal));
    });

    // 3. Transfer each relevant memory to hot cache
    for (const memory of relevant) {
      try {
        // Use any to avoid TS depth limit on chained Supabase queries
        const hotQuery: any = supabase.from('brain_memory_hot').select('id, access_count');
        const existingResult = await hotQuery
          .eq('category', `${config.hotCategoryPrefix}:${memory.memory_type}`)
          .limit(1);
        const existing = existingResult.data as any[] | null;
        const isDuplicate = existing?.some((e: any) => memory.content.slice(0, 40).length > 0);

        if (isDuplicate && existing && existing.length > 0) {
          await supabase.from('brain_memory_hot').update({
            access_count: (existing[0].access_count || 0) + 1,
            last_accessed_at: new Date().toISOString(),
          }).eq('id', existing[0].id);
          enriched++;
        } else {
          // Check hot cache limit
          const countQuery: any = supabase.from('brain_memory_hot').select('id', { count: 'exact', head: true });
          const { count } = await countQuery.like('category', `${config.hotCategoryPrefix}%`);

          if ((count || 0) >= config.hotCacheLimit) {
            skipped++;
            continue;
          }

          await supabase.from('brain_memory_hot').insert({
            content: `[${module.toUpperCase()}_KNOWLEDGE] ${memory.content}`,
            category: `${config.hotCategoryPrefix}:${memory.memory_type}`,
            priority: Math.round((memory.confidence || 0.5) * 100),
            access_count: 0,
            metadata: {
              source_memory_id: memory.id,
              module,
              transferred_at: new Date().toISOString(),
            },
          });
          transferred++;
        }
      } catch {
        errors++;
      }
    }
  } catch (err) {
    console.error(`[BrainTransfer:${module}] Transfer failed:`, err);
    errors++;
  }

  const batch: TransferBatch = {
    module,
    transferred,
    enriched,
    skipped,
    errors,
    duration_ms: Date.now() - startTime,
  };

  // Log the transfer
  await supabase.from('brain_events').insert([{
    module: 'brain',
    event_type: `knowledge_transfer_${module}`,
    data: batch as any,
    outcome: errors > 0 ? 'partial' : 'success',
  }]);

  return batch;
}

/**
 * Ingest curated expert patterns for a module
 */
export async function ingestModulePatterns(module: TransferModule): Promise<{
  ingested: number;
  errors: number;
}> {
  const patternSets: Record<TransferModule, typeof DECODE_PATTERNS> = {
    decode: DECODE_PATTERNS,
    defense: DEFENSE_PATTERNS,
    cortex: CORTEX_PATTERNS,
    vision: VISION_PATTERNS,
    inclusive: INCLUSIVE_PATTERNS,
  };

  const patterns = patternSets[module];
  const config = MODULE_CONFIGS[module];
  let ingested = 0, patternErrors = 0;

  // Insert into brain_memories (long-term)
  for (const pattern of patterns) {
    try {
      await supabase.from('brain_memories').insert({
        content: `[${module.toUpperCase()}_EXPERT] ${pattern.title}: ${pattern.content}`,
        memory_type: 'heuristic',
        source: `${module}_expert_patterns`,
        confidence: 0.95,
        metadata: {
          module,
          title: pattern.title,
          priority: pattern.priority,
          ingested_at: new Date().toISOString(),
        },
      });
      ingested++;
    } catch {
      patternErrors++;
    }
  }

  // Also load top patterns into hot memory
  const hotPatterns = patterns
    .sort((a, b) => b.priority - a.priority)
    .slice(0, Math.min(patterns.length, config.hotCacheLimit / 2));

  for (const pattern of hotPatterns) {
    try {
      await supabase.from('brain_memory_hot').insert({
        content: `[${module.toUpperCase()}_EXPERT] ${pattern.title}: ${pattern.content}`,
        category: `${config.hotCategoryPrefix}:expert`,
        priority: pattern.priority,
        access_count: 0,
        metadata: { module, title: pattern.title },
      });
    } catch {
      // Non-fatal — hot cache is a performance optimization
    }
  }

  await supabase.from('brain_events').insert([{
    module: 'brain',
    event_type: `expert_patterns_ingested_${module}`,
    data: { module, ingested, errors: patternErrors, total: patterns.length } as any,
    outcome: 'success',
  }]);

  return { ingested, errors: patternErrors };
}

/**
 * Run knowledge transfer for ALL modules at once
 */
export async function transferAllModules(): Promise<{
  results: TransferBatch[];
  total_transferred: number;
  total_enriched: number;
}> {
  const modules: TransferModule[] = ['decode', 'defense', 'cortex', 'vision', 'inclusive'];
  const results: TransferBatch[] = [];

  for (const module of modules) {
    const result = await transferKnowledge(module);
    results.push(result);
  }

  return {
    results,
    total_transferred: results.reduce((sum, r) => sum + r.transferred, 0),
    total_enriched: results.reduce((sum, r) => sum + r.enriched, 0),
  };
}

/**
 * Ingest expert patterns for ALL modules at once
 */
export async function ingestAllModulePatterns(): Promise<{
  results: Record<TransferModule, { ingested: number; errors: number }>;
  total_ingested: number;
}> {
  const modules: TransferModule[] = ['decode', 'defense', 'cortex', 'vision', 'inclusive'];
  const results = {} as Record<TransferModule, { ingested: number; errors: number }>;
  let totalIngested = 0;

  for (const module of modules) {
    const result = await ingestModulePatterns(module);
    results[module] = result;
    totalIngested += result.ingested;
  }

  return { results, total_ingested: totalIngested };
}

/**
 * Get knowledge report for a module
 */
export async function getModuleKnowledgeReport(module: TransferModule): Promise<ModuleKnowledgeReport> {
  const config = MODULE_CONFIGS[module];

  const { count: hotCount } = await supabase
    .from('brain_memory_hot')
    .select('id', { count: 'exact', head: true })
    .ilike('category', `${config.hotCategoryPrefix}%`);

  const { data: memories } = await supabase
    .from('brain_memories')
    .select('confidence, source')
    .eq('source', `${module}_expert_patterns`)
    .limit(200);

  const { data: lastEvent } = await supabase
    .from('brain_events')
    .select('created_at')
    .eq('event_type', `knowledge_transfer_${module}`)
    .order('created_at', { ascending: false })
    .limit(1);

  const avgConfidence = memories && memories.length > 0
    ? memories.reduce((sum, m) => sum + (m.confidence || 0), 0) / memories.length
    : 0;

  return {
    module,
    hot_patterns: hotCount || 0,
    total_memories: memories?.length || 0,
    avg_confidence: avgConfidence,
    top_categories: config.relevanceSignals.slice(0, 5),
    last_transfer: lastEvent?.[0]?.created_at || null,
  };
}
