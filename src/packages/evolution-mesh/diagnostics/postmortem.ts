/**
 * Evolution Mesh — Post-Mortem Auto-Generator
 * Automatically generates structured post-mortems from failed evolution attempts.
 * Creates RCA (Root Cause Analysis) indexed records for pattern library.
 */

export interface PostMortem {
  id: string;
  executorId: string;
  mutationId: string;
  title: string;
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  timeline: Array<{
    timestamp: number;
    event: string;
    phase: string;
  }>;
  rootCause: {
    category: string;
    description: string;
    contributing: string[];
  };
  impact: {
    modulesAffected: string[];
    durationMs: number;
    rollbackRequired: boolean;
    dataLoss: boolean;
  };
  resolution: {
    action: string;
    resolvedAt?: number;
    preventionMeasures: string[];
  };
  lessons: string[];
  tags: string[];
  createdAt: number;
}

const postMortems: PostMortem[] = [];
const MAX_POSTMORTEMS = 500;
let pmCounter = 0;

/**
 * Auto-generate a post-mortem from failure context.
 */
export function generatePostMortem(
  executorId: string,
  mutationId: string,
  context: {
    error: string;
    phase: string;
    modulesAffected: string[];
    durationMs: number;
    rollbackRequired: boolean;
    repairStrategies: string[];
    archetype?: string;
    steps?: Array<{ phase: string; event: string; timestamp: number }>;
  },
): PostMortem {
  const severity = deriveSeverity(context);
  const rootCause = deriveRootCause(context);
  const lessons = deriveLessons(context, rootCause);
  const tags = deriveTags(context, rootCause);

  const timeline = context.steps ?? [
    { timestamp: Date.now() - context.durationMs, event: 'Mutation initiated', phase: 'start' },
    { timestamp: Date.now() - Math.round(context.durationMs * 0.5), event: `Failure detected: ${context.error.slice(0, 100)}`, phase: context.phase },
    ...(context.rollbackRequired ? [{ timestamp: Date.now(), event: 'Rollback triggered', phase: 'rollback' }] : []),
  ];

  const pm: PostMortem = {
    id: `pm_${++pmCounter}_${Date.now()}`,
    executorId,
    mutationId,
    title: `Failed ${context.phase} — ${context.error.slice(0, 60)}`,
    severity,
    timeline,
    rootCause: {
      category: rootCause.category,
      description: rootCause.description,
      contributing: rootCause.contributing,
    },
    impact: {
      modulesAffected: context.modulesAffected,
      durationMs: context.durationMs,
      rollbackRequired: context.rollbackRequired,
      dataLoss: false,
    },
    resolution: {
      action: context.rollbackRequired ? 'Automatic rollback executed' : 'Safe-fail — no state change',
      preventionMeasures: derivePrevention(rootCause),
    },
    lessons,
    tags,
    createdAt: Date.now(),
  };

  postMortems.push(pm);
  if (postMortems.length > MAX_POSTMORTEMS) postMortems.splice(0, postMortems.length - MAX_POSTMORTEMS);

  return pm;
}

function deriveSeverity(ctx: { modulesAffected: string[]; rollbackRequired: boolean; durationMs: number }): PostMortem['severity'] {
  if (ctx.rollbackRequired && ctx.modulesAffected.length > 5) return 'P0';
  if (ctx.rollbackRequired || ctx.modulesAffected.length > 3) return 'P1';
  if (ctx.modulesAffected.length > 1) return 'P2';
  return 'P3';
}

function deriveRootCause(ctx: { error: string; phase: string; repairStrategies: string[]; archetype?: string }): {
  category: string; description: string; contributing: string[];
} {
  const lower = ctx.error.toLowerCase();
  let category = 'unknown';
  let description = ctx.error;
  const contributing: string[] = [];

  if (lower.includes('schema') || lower.includes('validation')) {
    category = 'schema_violation';
    description = 'Input structure did not conform to expected schema';
    contributing.push('Insufficient input validation at entry point');
  } else if (lower.includes('repair')) {
    category = 'repair_gap';
    description = 'Deterministic repair strategies insufficient for this input pattern';
    contributing.push('Missing repair strategy for archetype');
    if (ctx.archetype) contributing.push(`Archetype: ${ctx.archetype}`);
  } else if (lower.includes('timeout')) {
    category = 'performance';
    description = 'Operation exceeded time budget';
    contributing.push('Insufficient optimization for input complexity');
  } else if (lower.includes('cascade')) {
    category = 'architecture';
    description = 'Failure propagated across module boundaries';
    contributing.push('Missing circuit breaker between modules');
  } else {
    category = 'operational';
    description = ctx.error.slice(0, 200);
    contributing.push(`Failed during phase: ${ctx.phase}`);
  }

  if (ctx.repairStrategies.length > 0) {
    contributing.push(`Attempted repairs: ${ctx.repairStrategies.join(', ')}`);
  }

  return { category, description, contributing };
}

function deriveLessons(ctx: { error: string; repairStrategies: string[]; archetype?: string }, rootCause: { category: string }): string[] {
  const lessons: string[] = [];

  switch (rootCause.category) {
    case 'schema_violation':
      lessons.push('Add pre-flight schema validation before mutation entry');
      lessons.push('Consider expanding accepted archetypes for this mutation type');
      break;
    case 'repair_gap':
      lessons.push('New repair strategy needed — add to deterministic repair engine');
      lessons.push('Consider archetype-specific repair chains');
      break;
    case 'performance':
      lessons.push('Profile mutation pipeline for bottlenecks');
      lessons.push('Consider async chunking for large-scope mutations');
      break;
    case 'architecture':
      lessons.push('Implement circuit breakers between critical module boundaries');
      lessons.push('Add isolation primitives for mutation scope containment');
      break;
    default:
      lessons.push('Classify failure pattern and add to anti-pattern library');
      break;
  }

  return lessons;
}

function derivePrevention(rootCause: { category: string }): string[] {
  switch (rootCause.category) {
    case 'schema_violation': return ['Add schema pre-check to warm-up sequence', 'Extend validation coverage'];
    case 'repair_gap': return ['Implement new deterministic repair strategy', 'Add gap to replay sandbox'];
    case 'performance': return ['Add timeout budget to mutation complexity score', 'Implement progressive execution'];
    case 'architecture': return ['Add circuit breaker', 'Limit mutation scope width'];
    default: return ['Log pattern for future classification'];
  }
}

/**
 * Get post-mortems for an executor.
 */
export function getPostMortems(executorId?: string): PostMortem[] {
  return postMortems
    .filter(pm => !executorId || pm.executorId === executorId)
    .slice(-50);
}

/**
 * Search post-mortems by tag or root cause category.
 */
export function searchPostMortems(query: { tag?: string; category?: string; severity?: PostMortem['severity'] }): PostMortem[] {
  return postMortems.filter(pm => {
    if (query.tag && !pm.tags.includes(query.tag)) return false;
    if (query.category && pm.rootCause.category !== query.category) return false;
    if (query.severity && pm.severity !== query.severity) return false;
    return true;
  });
}

function deriveTags(ctx: { error: string; phase: string; archetype?: string; modulesAffected: string[] }, rootCause: { category: string }): string[] {
  const tags = [rootCause.category, ctx.phase];
  if (ctx.archetype) tags.push(ctx.archetype);
  if (ctx.modulesAffected.length > 5) tags.push('wide_scope');
  return tags;
}
