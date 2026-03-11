/**
 * Knowledge Distillery — ENCODE → Executor Knowledge Transfer
 * 
 * Distills ENCODE's codebase learnings, error patterns, and templates
 * into specialty-scoped knowledge packs that executors pull during execution.
 * 
 * Design:
 * - ENCODE is the SINGLE source of truth for codebase knowledge
 * - Executors do NOT get raw CLM — they get filtered, relevant knowledge packs
 * - Each executor category gets a tailored pack based on its specialty
 * - Knowledge packs are versioned and refreshed each CLM cycle
 * - Staleness detection ensures executors never use outdated knowledge
 */

import { log } from '@/lib/system/log';
import {
  EXECUTOR_MODULE_META,
  PILOT_EXECUTORS,
  getExecutorsByCategory,
  type PilotExecutorId,
  type ExecutorModuleMeta,
} from './pilotExecutors';
import type { CodebaseInsight, CLMReport } from '@/lib/substrate/encode-module/clm';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface KnowledgePack {
  id: string;
  category: ExecutorModuleMeta['category'];
  version: number;
  createdAt: number;
  expiresAt: number;
  /** Codebase patterns relevant to this category */
  patterns: DistilledPattern[];
  /** Error signatures this category should watch for */
  errorSignatures: ErrorSignature[];
  /** Code templates for common operations */
  templates: CodeTemplate[];
  /** Architectural constraints this category must respect */
  constraints: ArchConstraint[];
  /** Quality score of this pack (0-1) */
  quality: number;
}

export interface DistilledPattern {
  name: string;
  description: string;
  applicability: string;
  confidence: number;
  example?: string;
}

export interface ErrorSignature {
  fingerprint: string;
  category: string;
  description: string;
  preventionStrategy: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  skeleton: string;
  applicableModules: string[];
  qualityScore: number;
}

export interface ArchConstraint {
  id: string;
  rule: string;
  severity: 'warning' | 'error' | 'fatal';
  scope: string[];
}

export interface DistilleryStats {
  totalPacks: number;
  totalPatterns: number;
  totalErrors: number;
  totalTemplates: number;
  totalConstraints: number;
  lastDistillation: number;
  packVersions: Record<string, number>;
  coverageByCategory: Record<string, number>;
}

// ═══════════════════════════════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════════════════════════════

const knowledgePacks = new Map<ExecutorModuleMeta['category'], KnowledgePack>();
const PACK_TTL_MS = 30 * 60 * 1000; // 30 minutes — refreshed each CLM cycle
let distillationVersion = 0;

// ═══════════════════════════════════════════════════════════════════════════
// Category-Specific Knowledge Maps
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Maps each category to the codebase areas it needs to understand.
 * This is the FILTER — executors only see what's relevant to them.
 */
const CATEGORY_KNOWLEDGE_SCOPE: Record<ExecutorModuleMeta['category'], {
  relevantModules: string[];
  relevantPatterns: string[];
  criticalFiles: string[];
}> = {
  ui_adaptation: {
    relevantModules: ['INCLUSIVE', 'pages', 'navigation', 'toast', 'os-ui'],
    relevantPatterns: ['componentPattern', 'hookPattern'],
    criticalFiles: ['src/index.css', 'tailwind.config.ts', 'src/App.tsx'],
  },
  content_analysis: {
    relevantModules: ['INCLUSIVE', 'COGNITIVE', 'brain', 'encode'],
    relevantPatterns: ['componentPattern', 'hookPattern', 'substrateSingleton'],
    criticalFiles: ['src/lib/substrate/memory-core.ts', 'src/lib/substrate/brain-transfer/index.ts'],
  },
  content_validation: {
    relevantModules: ['INCLUSIVE', 'audit', 'defense', 'contracts'],
    relevantPatterns: ['rlsPolicy', 'edgeFunctionHandler'],
    criticalFiles: ['src/lib/contracts/DecodeContract.ts', 'src/lib/substrate/audit-module/index.ts'],
  },
  cognitive_processing: {
    relevantModules: ['COGNITIVE', 'brain', 'encode', 'intent-mesh', 'engines'],
    relevantPatterns: ['substrateSingleton', 'memoryStore', 'brainTransfer', 'eventEmit'],
    criticalFiles: ['src/lib/substrate/engine-bus.ts', 'src/lib/substrate/memory-core.ts', 'src/lib/substrate/encode-module/index.ts'],
  },
  event_routing: {
    relevantModules: ['OPERATIONAL', 'relay', 'brain', 'substrate-core'],
    relevantPatterns: ['eventEmit', 'substrateSingleton'],
    criticalFiles: ['src/lib/substrate/events.ts', 'src/lib/substrate/relay-module/index.ts'],
  },
  governance: {
    relevantModules: ['OPERATIONAL', 'ORCHESTRATOR', 'audit', 'economy', 'contracts'],
    relevantPatterns: ['rlsPolicy', 'edgeFunctionHandler', 'supabaseQuery'],
    criticalFiles: ['src/lib/substrate/governance-guard.ts', 'src/lib/substrate/audit-module/index.ts'],
  },
  orchestration: {
    relevantModules: ['ORCHESTRATOR', 'substrate-core', 'intent-mesh', 'encode', 'engines'],
    relevantPatterns: ['substrateSingleton', 'eventEmit', 'moduleExport'],
    criticalFiles: ['src/lib/substrate/index.ts', 'src/lib/substrate/engine-bus.ts', 'src/lib/substrate/intent-mesh/index.ts'],
  },
  infrastructure: {
    relevantModules: ['INFRASTRUCTURE', 'substrate-core', 'hot-swap', 'resilience', 'memory'],
    relevantPatterns: ['substrateSingleton', 'moduleExport', 'supabaseQuery'],
    criticalFiles: ['src/lib/substrate/circuit-breaker/index.ts', 'src/lib/substrate/hot-swap/index.ts', 'src/lib/substrate/memory-module/index.ts'],
  },
  intelligence: {
    relevantModules: ['INTELLIGENCE', 'COGNITIVE', 'brain', 'dream', 'defense'],
    relevantPatterns: ['memoryStore', 'brainTransfer', 'eventEmit', 'substrateSingleton'],
    criticalFiles: ['src/lib/substrate/dream-chains/index.ts', 'src/lib/substrate/anomaly-correlation/index.ts'],
  },
  security: {
    relevantModules: ['SECURITY', 'defense', 'audit', 'identity', 'contracts'],
    relevantPatterns: ['rlsPolicy', 'edgeFunctionHandler', 'supabaseQuery'],
    criticalFiles: ['src/lib/substrate/identity-module/index.ts', 'src/lib/substrate/governance-guard.ts'],
  },
  optimization: {
    relevantModules: ['OPTIMIZATION', 'economy', 'cost-attribution', 'engines'],
    relevantPatterns: ['substrateSingleton', 'supabaseQuery'],
    criticalFiles: ['src/lib/substrate/cost-attribution/index.ts', 'src/lib/substrate/economy-module/index.ts'],
  },
  autonomy: {
    relevantModules: ['AUTONOMY', 'evolution', 'encode', 'intent-mesh', 'substrate-core'],
    relevantPatterns: ['substrateSingleton', 'eventEmit', 'moduleExport', 'memoryStore'],
    criticalFiles: ['src/lib/substrate/evolution-cycle.ts', 'src/lib/substrate/encode-module/pipeline.ts'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// Universal Constraints — ALL executors must respect these
// ═══════════════════════════════════════════════════════════════════════════

const UNIVERSAL_CONSTRAINTS: ArchConstraint[] = [
  { id: 'UC-001', rule: 'All modules use single-entrypoint pattern (index.ts) with typed exports', severity: 'error', scope: ['*'] },
  { id: 'UC-002', rule: 'Never modify src/integrations/supabase/types.ts or client.ts', severity: 'fatal', scope: ['*'] },
  { id: 'UC-003', rule: 'Edge functions are archived unless explicitly repurposed for substrate', severity: 'warning', scope: ['*'] },
  { id: 'UC-004', rule: 'State management: Zustand for versioning, React Query for async — no Redux', severity: 'error', scope: ['*'] },
  { id: 'UC-005', rule: 'All substrate modules follow emit() pattern for cross-module events', severity: 'error', scope: ['*'] },
  { id: 'UC-006', rule: 'Use NEXUS router for AI calls — never bypass governance', severity: 'fatal', scope: ['*'] },
  { id: 'UC-007', rule: 'Module names are always ALL CAPS (BRAIN, ENCODE, DECODE, etc.)', severity: 'error', scope: ['*'] },
  { id: 'UC-008', rule: 'Hooks in src/hooks/substrate/ follow use[Module] naming convention', severity: 'error', scope: ['*'] },
  { id: 'UC-009', rule: 'All colors must use HSL via semantic design tokens — never raw hex/rgb in components', severity: 'error', scope: ['*'] },
  { id: 'UC-010', rule: 'Input validation required on all executor entry points — no raw user input', severity: 'fatal', scope: ['*'] },
];

// ═══════════════════════════════════════════════════════════════════════════
// Category-Specific Constraints
// ═══════════════════════════════════════════════════════════════════════════

const CATEGORY_CONSTRAINTS: Partial<Record<ExecutorModuleMeta['category'], ArchConstraint[]>> = {
  security: [
    { id: 'SC-001', rule: 'Never expose service role keys in client-side code', severity: 'fatal', scope: ['security'] },
    { id: 'SC-002', rule: 'All new tables require RLS policies before code changes', severity: 'fatal', scope: ['security'] },
    { id: 'SC-003', rule: 'Edge functions must validate JWT in code when verify_jwt=false', severity: 'error', scope: ['security'] },
  ],
  infrastructure: [
    { id: 'IN-001', rule: 'Circuit breakers required for all external service calls', severity: 'error', scope: ['infrastructure'] },
    { id: 'IN-002', rule: 'Hot-swap compatible: modules must support runtime replacement', severity: 'warning', scope: ['infrastructure'] },
  ],
  governance: [
    { id: 'GV-001', rule: 'All mutations require rollback plan before execution', severity: 'fatal', scope: ['governance'] },
    { id: 'GV-002', rule: 'Evolution rate limit: max 60 proposals per day', severity: 'error', scope: ['governance'] },
    { id: 'GV-003', rule: 'Only 1 active evolution run at a time', severity: 'fatal', scope: ['governance'] },
  ],
  autonomy: [
    { id: 'AU-001', rule: 'Auto-promotion OFF by default — human approval required', severity: 'fatal', scope: ['autonomy'] },
    { id: 'AU-002', rule: 'Shadow must pass ≥2 runs with 0 regressions before promotion', severity: 'error', scope: ['autonomy'] },
    { id: 'AU-003', rule: 'TSAC pre-criteria must be generated before code execution', severity: 'error', scope: ['autonomy'] },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// Core Distillation Engine
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Distill ENCODE's CLM report into category-scoped knowledge packs.
 * Called after each ENCODE CLM cycle completes.
 */
export function distillFromCLMReport(report: CLMReport): Map<ExecutorModuleMeta['category'], KnowledgePack> {
  distillationVersion++;
  const now = Date.now();
  const categories = Object.keys(CATEGORY_KNOWLEDGE_SCOPE) as ExecutorModuleMeta['category'][];

  for (const category of categories) {
    const scope = CATEGORY_KNOWLEDGE_SCOPE[category];

    // 1. Filter patterns relevant to this category
    const patterns = distillPatterns(report, scope);

    // 2. Filter error signatures relevant to this category
    const errorSignatures = distillErrorSignatures(report, category);

    // 3. Build code templates from ENCODE's insights
    const templates = distillTemplates(report, scope, category);

    // 4. Collect constraints
    const constraints = [
      ...UNIVERSAL_CONSTRAINTS,
      ...(CATEGORY_CONSTRAINTS[category] ?? []),
    ];

    // 5. Calculate pack quality
    const quality = calculatePackQuality(patterns, errorSignatures, templates, constraints);

    const pack: KnowledgePack = {
      id: `kp-${category}-v${distillationVersion}`,
      category,
      version: distillationVersion,
      createdAt: now,
      expiresAt: now + PACK_TTL_MS,
      patterns,
      errorSignatures,
      templates,
      constraints,
      quality,
    };

    knowledgePacks.set(category, pack);
  }

  log.info('immune', `Knowledge Distillery: distilled ${categories.length} packs from CLM report (v${distillationVersion})`);
  return new Map(knowledgePacks);
}

/**
 * Get the knowledge pack for a specific executor.
 * Returns null if no pack exists or it's stale.
 */
export function getKnowledgeForExecutor(executorId: string): KnowledgePack | null {
  const meta = EXECUTOR_MODULE_META[executorId as PilotExecutorId];
  if (!meta) return null;

  const pack = knowledgePacks.get(meta.category);
  if (!pack) return null;

  // Staleness check
  if (Date.now() > pack.expiresAt) {
    log.warn('immune', `Knowledge pack for ${meta.category} is stale (v${pack.version})`);
    return null; // Force refresh
  }

  return pack;
}

/**
 * Get constraints that apply to a specific executor.
 * Used as a pre-flight check before execution.
 */
export function getConstraintsForExecutor(executorId: string): ArchConstraint[] {
  const pack = getKnowledgeForExecutor(executorId);
  if (!pack) return UNIVERSAL_CONSTRAINTS; // Always return universal at minimum
  return pack.constraints;
}

/**
 * Validate executor output against its knowledge pack constraints.
 * Returns violations found.
 */
export function validateAgainstConstraints(
  executorId: string,
  output: Record<string, unknown>,
): { valid: boolean; violations: string[] } {
  const constraints = getConstraintsForExecutor(executorId);
  const violations: string[] = [];

  // Check for known violations in output
  const outputStr = JSON.stringify(output);

  for (const constraint of constraints) {
    // Fatal: service role key exposure
    if (constraint.id === 'SC-001' && /service_role|SUPABASE_SERVICE_ROLE/.test(outputStr)) {
      violations.push(`FATAL [${constraint.id}]: ${constraint.rule}`);
    }
    // Fatal: NEXUS routing
    if (constraint.id === 'UC-006' && /lovable\.ai|ai\.gateway\.lovable/.test(outputStr)) {
      violations.push(`FATAL [${constraint.id}]: ${constraint.rule}`);
    }
    // Error: raw colors
    if (constraint.id === 'UC-009' && /(?:text|bg|border)-(?:#[0-9a-f]{3,8}|rgb\()/.test(outputStr)) {
      violations.push(`ERROR [${constraint.id}]: ${constraint.rule}`);
    }
  }

  return { valid: violations.length === 0, violations };
}

// ═══════════════════════════════════════════════════════════════════════════
// Distillation Helpers
// ═══════════════════════════════════════════════════════════════════════════

function distillPatterns(
  report: CLMReport,
  scope: (typeof CATEGORY_KNOWLEDGE_SCOPE)[ExecutorModuleMeta['category']],
): DistilledPattern[] {
  const patterns: DistilledPattern[] = [];

  // Extract from CLM learnings
  for (const learning of report.learnings) {
    for (const patternName of scope.relevantPatterns) {
      if (learning.toLowerCase().includes(patternName.toLowerCase())) {
        patterns.push({
          name: patternName,
          description: learning,
          applicability: scope.relevantModules.join(', '),
          confidence: report.confidence,
        });
      }
    }
  }

  // Extract from codebase insights
  for (const insight of report.codebaseInsights ?? []) {
    if (scope.relevantModules.some(m => insight.area.includes(m.toLowerCase()))) {
      patterns.push({
        name: insight.area,
        description: insight.finding,
        applicability: insight.area,
        confidence: insight.priority / 100,
      });
    }
  }

  return patterns;
}

function distillErrorSignatures(
  report: CLMReport,
  category: ExecutorModuleMeta['category'],
): ErrorSignature[] {
  const signatures: ErrorSignature[] = [];

  for (const risk of report.risks) {
    const severity = risk.includes('CRITICAL') ? 'critical'
      : risk.includes('CIRCUIT OPEN') ? 'high'
      : risk.includes('degraded') ? 'medium'
      : 'low';

    signatures.push({
      fingerprint: `err_${category}_${risk.slice(0, 30).replace(/\W/g, '_').toLowerCase()}`,
      category,
      description: risk,
      preventionStrategy: `Pre-check for ${risk.split('—')[0].trim()} before execution`,
      severity,
    });
  }

  return signatures;
}

function distillTemplates(
  report: CLMReport,
  scope: (typeof CATEGORY_KNOWLEDGE_SCOPE)[ExecutorModuleMeta['category']],
  category: ExecutorModuleMeta['category'],
): CodeTemplate[] {
  const templates: CodeTemplate[] = [];

  // Module entry-point template
  templates.push({
    id: `tpl-${category}-module-entry`,
    name: 'Module Entry Point',
    description: 'Standard module index.ts with typed exports and event emission',
    skeleton: `// Module Entry — ${category}\nimport { emit } from '../events';\nimport { memoryCore } from '../memory-core';\n\nexport function init${category.replace(/_/g, '')}() {\n  emit({ module: '${category}', event_type: 'init', outcome: 'succeeded', data: {} });\n}`,
    applicableModules: scope.relevantModules,
    qualityScore: 0.9,
  });

  // Hook template
  templates.push({
    id: `tpl-${category}-hook`,
    name: 'React Hook Pattern',
    description: 'Standard useQuery/useMutation hook for substrate modules',
    skeleton: `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';\n\nexport function use${category.charAt(0).toUpperCase() + category.slice(1).replace(/_./g, m => m[1].toUpperCase())}() {\n  const qc = useQueryClient();\n  const invalidate = () => qc.invalidateQueries({ queryKey: ['substrate', '${category}'] });\n  // ... queries and mutations\n}`,
    applicableModules: ['hooks'],
    qualityScore: 0.85,
  });

  // Category-specific templates
  if (category === 'security') {
    templates.push({
      id: 'tpl-security-rls',
      name: 'RLS Policy Template',
      description: 'Standard row-level security policy pattern',
      skeleton: `CREATE POLICY "Users access own data"\n  ON public.table_name\n  FOR ALL\n  USING (auth.uid() = user_id)\n  WITH CHECK (auth.uid() = user_id);`,
      applicableModules: ['security', 'audit'],
      qualityScore: 0.95,
    });
  }

  if (category === 'infrastructure') {
    templates.push({
      id: 'tpl-infra-circuit',
      name: 'Circuit Breaker Pattern',
      description: 'Standard circuit breaker for external calls',
      skeleton: `import { withGracefulExec } from '../graceful-degradation';\n\nexport async function callExternal(params: unknown) {\n  return withGracefulExec(\n    async () => { /* primary call */ },\n    { fallback: () => ({ ok: false, degraded: true }), timeoutMs: 5000 }\n  );\n}`,
      applicableModules: ['infrastructure', 'resilience'],
      qualityScore: 0.9,
    });
  }

  if (category === 'event_routing') {
    templates.push({
      id: 'tpl-event-emit',
      name: 'Event Emission Pattern',
      description: 'Standard event emission with module attribution',
      skeleton: `import { emit } from '../events';\n\nemit({\n  module: 'MODULE_NAME',\n  event_type: 'action_name',\n  outcome: 'succeeded',\n  data: { /* structured payload */ },\n});`,
      applicableModules: ['relay', 'brain'],
      qualityScore: 0.9,
    });
  }

  return templates;
}

function calculatePackQuality(
  patterns: DistilledPattern[],
  errors: ErrorSignature[],
  templates: CodeTemplate[],
  constraints: ArchConstraint[],
): number {
  const patternScore = Math.min(1, patterns.length / 5) * 0.3;
  const errorScore = Math.min(1, errors.length / 3) * 0.2;
  const templateScore = Math.min(1, templates.length / 3) * 0.3;
  const constraintScore = Math.min(1, constraints.length / 5) * 0.2;
  return Math.min(1, patternScore + errorScore + templateScore + constraintScore);
}

// ═══════════════════════════════════════════════════════════════════════════
// Telemetry
// ═══════════════════════════════════════════════════════════════════════════

export function getDistilleryStats(): DistilleryStats {
  const packs = Array.from(knowledgePacks.values());
  const packVersions: Record<string, number> = {};
  const coverageByCategory: Record<string, number> = {};

  for (const pack of packs) {
    packVersions[pack.category] = pack.version;
    const total = pack.patterns.length + pack.errorSignatures.length + pack.templates.length;
    coverageByCategory[pack.category] = total;
  }

  return {
    totalPacks: packs.length,
    totalPatterns: packs.reduce((s, p) => s + p.patterns.length, 0),
    totalErrors: packs.reduce((s, p) => s + p.errorSignatures.length, 0),
    totalTemplates: packs.reduce((s, p) => s + p.templates.length, 0),
    totalConstraints: packs.reduce((s, p) => s + p.constraints.length, 0),
    lastDistillation: packs[0]?.createdAt ?? 0,
    packVersions,
    coverageByCategory,
  };
}

/**
 * Check if an executor has access to fresh knowledge.
 * Used by the training system to decide if an executor is "ready".
 */
export function isExecutorKnowledgeFresh(executorId: string): boolean {
  const pack = getKnowledgeForExecutor(executorId);
  return pack !== null && Date.now() < pack.expiresAt;
}

/**
 * Get all executor IDs that currently have stale or missing knowledge.
 * Used by CLM to prioritize distillation.
 */
export function getStaleExecutors(): string[] {
  return PILOT_EXECUTORS.filter(id => !isExecutorKnowledgeFresh(id)) as string[];
}
