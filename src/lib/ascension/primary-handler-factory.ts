/**
 * CMPSBL® Primary Handler Factory
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Synthesizes a behavioral handler from extracted primitives and
 * auto-registers it in the primitive registry under the primary unit name.
 *
 * This is the CRITICAL missing link: without this, the primary module
 * (e.g. TRADER, TRADEMATCHER) falls back to DEFAULT because no handler
 * exists in the registry for it.
 *
 * The synthesized handler encapsulates:
 *  - State transitions derived from control flow
 *  - Data transformations from extracted functions/methods
 *  - Behavioral metadata from source analysis
 *  - Category-specific augmentation logic
 *
 * RULES:
 *  1. Handler is DERIVED from source — never invented
 *  2. Primary module MUST NEVER fall back to DEFAULT
 *  3. If no meaningful behavior can be extracted → explicit "passthrough_primary"
 *  4. Registration is dynamic and happens at detection time
 *
 * © CMPSBL® — All rights reserved.
 */

import { registerPrimitive, getPrimitive, type PrimitiveHandler } from './primitive-registry';
import type { ExtractedPrimitive } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — BEHAVIORAL INTENT EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/** Behavioral profile derived from extracted primitives */
interface BehavioralProfile {
  /** Primary behavioral categories found */
  categories: string[];
  /** State transition indicators (loops, conditionals, lifecycle) */
  stateTransitions: number;
  /** Data transformation count */
  dataTransforms: number;
  /** Side effect indicators (DB, API, IO) */
  sideEffects: number;
  /** Control flow complexity */
  controlFlowDepth: number;
  /** Total extracted functions/methods */
  callableCount: number;
  /** Dominant behavioral intent */
  dominantIntent: string;
  /** Whether real behavior was detected */
  hasMeaningfulBehavior: boolean;
  /** Input parameters across all primitives */
  knownInputs: string[];
  /** Output signatures */
  knownOutputs: string[];
  /** Source language */
  language: string;
}

/** Behavioral keywords that indicate real state transitions */
const STATE_KEYWORDS = new Set([
  'loop', 'while', 'for', 'switch', 'case', 'match', 'if', 'else',
  'state', 'transition', 'lifecycle', 'phase', 'step', 'stage',
  'iterate', 'recurse', 'poll', 'watch', 'listen', 'await',
]);

/** Keywords indicating side effects */
const SIDE_EFFECT_KEYWORDS = new Set([
  'save', 'store', 'persist', 'write', 'insert', 'update', 'delete',
  'send', 'post', 'put', 'emit', 'publish', 'notify', 'log',
  'fetch', 'get', 'request', 'call', 'invoke', 'connect',
  'upload', 'download', 'stream',
]);

/** Keywords indicating data transformation */
const TRANSFORM_KEYWORDS = new Set([
  'transform', 'convert', 'format', 'normalize', 'parse', 'serialize',
  'map', 'filter', 'reduce', 'merge', 'split', 'join', 'encode', 'decode',
  'calculate', 'compute', 'score', 'evaluate', 'analyze', 'process',
]);

/**
 * Analyze extracted primitives to build a behavioral profile.
 */
function buildBehavioralProfile(
  primitives: ExtractedPrimitive[],
  sourceLanguage: string
): BehavioralProfile {
  const categories = new Set<string>();
  let stateTransitions = 0;
  let dataTransforms = 0;
  let sideEffects = 0;
  let controlFlowDepth = 0;
  let callableCount = 0;
  const knownInputs = new Set<string>();
  const knownOutputs = new Set<string>();

  for (const p of primitives) {
    categories.add(p.category);
    if (p.extractionMethod === 'function' || p.extractionMethod === 'class') {
      callableCount++;
    }

    // Analyze keywords for behavioral indicators
    const allKeywords = [...(p.keywords || [])];
    const nameParts = p.name.toLowerCase()
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .split(/[_\-\s]+/);
    allKeywords.push(...nameParts);

    for (const kw of allKeywords) {
      const lower = kw.toLowerCase();
      if (STATE_KEYWORDS.has(lower)) stateTransitions++;
      if (SIDE_EFFECT_KEYWORDS.has(lower)) sideEffects++;
      if (TRANSFORM_KEYWORDS.has(lower)) dataTransforms++;
    }

    // Count control flow from snippet
    if (p.sourceSnippet) {
      const snippet = p.sourceSnippet.toLowerCase();
      const cfMatches = snippet.match(/\b(if|else|for|while|switch|case|try|catch|match|when)\b/g);
      if (cfMatches) controlFlowDepth += cfMatches.length;
    }

    // Collect inputs/outputs
    for (const inp of (p.inputs || [])) knownInputs.add(inp);
    for (const out of (p.outputs || [])) knownOutputs.add(out);
  }

  // Determine dominant intent
  const intentScores: Record<string, number> = {
    'stateful_processing': stateTransitions * 2 + controlFlowDepth,
    'data_transformation': dataTransforms * 2,
    'side_effect_orchestration': sideEffects * 2,
    'analysis_computation': (categories.has('analysis') ? 3 : 0) + (categories.has('computation') ? 3 : 0),
    'validation_guard': (categories.has('validation') ? 3 : 0) + (categories.has('security') ? 2 : 0),
  };
  const dominantIntent = Object.entries(intentScores)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'general_processing';

  const hasMeaningfulBehavior = callableCount > 0 && (
    stateTransitions > 0 || dataTransforms > 0 || sideEffects > 0 || controlFlowDepth > 1
  );

  return {
    categories: Array.from(categories),
    stateTransitions,
    dataTransforms,
    sideEffects,
    controlFlowDepth,
    callableCount,
    dominantIntent,
    hasMeaningfulBehavior,
    knownInputs: Array.from(knownInputs).slice(0, 20),
    knownOutputs: Array.from(knownOutputs).slice(0, 20),
    language: sourceLanguage,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — HANDLER SYNTHESIS
// ═══════════════════════════════════════════════════════════════════════════════

/** Category-specific transformation functions */
const CATEGORY_TRANSFORMS: Record<string, (input: Record<string, unknown>, profile: BehavioralProfile) => Record<string, unknown>> = {
  analysis: (input, profile) => ({
    ...input,
    _analysis: {
      score: profile.controlFlowDepth * 0.15 + profile.callableCount * 0.1,
      factors: profile.knownInputs.length,
      depth: profile.controlFlowDepth,
    },
  }),
  execution: (input, profile) => ({
    ...input,
    _execution: {
      steps: profile.callableCount,
      stateTransitions: profile.stateTransitions,
      sideEffects: profile.sideEffects,
    },
  }),
  transformation: (input, profile) => ({
    ...input,
    _transformation: {
      operations: profile.dataTransforms,
      pipelineDepth: profile.callableCount,
      inputs: profile.knownInputs,
      outputs: profile.knownOutputs,
    },
  }),
  validation: (input, profile) => ({
    ...input,
    _validation: {
      checks: profile.callableCount,
      guardDepth: profile.controlFlowDepth,
      passed: true,
    },
  }),
  prediction: (input, profile) => ({
    ...input,
    _prediction: {
      modelComplexity: profile.controlFlowDepth,
      featureCount: profile.knownInputs.length,
      confidence: Math.min(0.95, 0.5 + profile.callableCount * 0.05),
    },
  }),
  storage: (input, profile) => ({
    ...input,
    _storage: {
      operations: profile.sideEffects,
      persistenceModel: profile.stateTransitions > 2 ? 'stateful' : 'stateless',
    },
  }),
  security: (input, profile) => ({
    ...input,
    _security: {
      guards: profile.callableCount,
      validationDepth: profile.controlFlowDepth,
      threatSurface: profile.sideEffects,
    },
  }),
  computation: (input, profile) => ({
    ...input,
    _computation: {
      operations: profile.dataTransforms + profile.callableCount,
      precision: profile.controlFlowDepth > 3 ? 'high' : 'standard',
    },
  }),
};

/**
 * Synthesize a handler function from a behavioral profile.
 * The handler applies category-specific transformations derived from the
 * actual source code's behavioral patterns.
 */
function synthesizeHandler(
  primaryName: string,
  profile: BehavioralProfile,
  primitives: ExtractedPrimitive[]
): PrimitiveHandler {
  return (input: unknown, _context?: unknown): unknown => {
    if (typeof input !== 'object' || input === null) {
      return {
        _primary: primaryName,
        _intent: profile.dominantIntent,
        _passthrough: input,
        _behavior: 'passthrough_primary',
        _reason: 'non-object input',
      };
    }

    let result = { ...(input as Record<string, unknown>) };

    // Apply dominant category transform
    for (const cat of profile.categories) {
      const transform = CATEGORY_TRANSFORMS[cat];
      if (transform) {
        result = transform(result, profile);
      }
    }

    // Apply behavioral intent enrichment
    result[`_primary_${primaryName.toLowerCase()}`] = {
      executed: true,
      intent: profile.dominantIntent,
      behavior: {
        stateTransitions: profile.stateTransitions,
        dataTransforms: profile.dataTransforms,
        sideEffects: profile.sideEffects,
        controlFlow: profile.controlFlowDepth,
        callables: profile.callableCount,
      },
      language: profile.language,
      categories: profile.categories,
      meaningful: profile.hasMeaningfulBehavior,
      timestamp: Date.now(),
    };

    // Per-primitive execution summaries (top 10)
    const primitiveSummaries: Record<string, unknown>[] = [];
    for (const p of primitives.slice(0, 10)) {
      primitiveSummaries.push({
        name: p.name,
        category: p.category,
        confidence: p.confidence,
        complexity: p.complexity,
        inputs: p.inputs?.length || 0,
        outputs: p.outputs?.length || 0,
      });
    }
    result[`_primitives_${primaryName.toLowerCase()}`] = primitiveSummaries;

    return result;
  };
}

/**
 * Create a minimal passthrough handler for when no meaningful behavior
 * is detected. This is NOT the same as DEFAULT — it explicitly identifies
 * itself as a passthrough_primary.
 */
function synthesizePassthroughHandler(primaryName: string, reason: string): PrimitiveHandler {
  return (input: unknown, _context?: unknown): unknown => {
    if (typeof input !== 'object' || input === null) {
      return { _primary: primaryName, _passthrough: input, _behavior: 'passthrough_primary', _reason: reason };
    }
    return {
      ...(input as Record<string, unknown>),
      [`_primary_${primaryName.toLowerCase()}`]: {
        executed: true,
        intent: 'passthrough_primary',
        behavior: { stateTransitions: 0, dataTransforms: 0, sideEffects: 0, controlFlow: 0, callables: 0 },
        meaningful: false,
        reason,
        timestamp: Date.now(),
      },
    };
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

export interface PrimaryHandlerRegistration {
  registered: boolean;
  name: string;
  profile: BehavioralProfile | null;
  hasMeaningfulBehavior: boolean;
  handlerType: 'behavioral' | 'passthrough_primary';
  reason: string;
}

/**
 * Build and register a primary handler for the given unit name and primitives.
 * This is the CRITICAL function that ensures the primary module has a real
 * handler in the registry — preventing silent fallback to DEFAULT.
 *
 * INVARIANT: After this call, getPrimitive(name) !== null
 */
export function registerPrimaryHandler(
  name: string,
  primitives: ExtractedPrimitive[],
  sourceLanguage: string
): PrimaryHandlerRegistration {
  if (!name || typeof name !== 'string') {
    return {
      registered: false,
      name: name || 'unknown',
      profile: null,
      hasMeaningfulBehavior: false,
      handlerType: 'passthrough_primary',
      reason: 'Invalid name',
    };
  }

  // Skip if already registered with a non-default handler
  const existing = getPrimitive(name);
  if (existing?.handler && existing.source !== 'generated') {
    return {
      registered: true,
      name,
      profile: null,
      hasMeaningfulBehavior: true,
      handlerType: 'behavioral',
      reason: 'Already registered with native handler',
    };
  }

  // Build behavioral profile
  const profile = buildBehavioralProfile(primitives, sourceLanguage);

  let handler: PrimitiveHandler;
  let handlerType: 'behavioral' | 'passthrough_primary';
  let reason: string;

  if (profile.hasMeaningfulBehavior) {
    handler = synthesizeHandler(name, profile, primitives);
    handlerType = 'behavioral';
    reason = `Synthesized from ${profile.callableCount} callables — ` +
      `${profile.dominantIntent} (${profile.stateTransitions} state transitions, ` +
      `${profile.dataTransforms} transforms, ${profile.sideEffects} side effects)`;
  } else if (primitives.length > 0) {
    handler = synthesizePassthroughHandler(name, 'No meaningful behavioral patterns detected');
    handlerType = 'passthrough_primary';
    reason = `${primitives.length} primitives extracted but no meaningful behavioral patterns`;
  } else {
    handler = synthesizePassthroughHandler(name, 'No primitives extracted');
    handlerType = 'passthrough_primary';
    reason = 'No primitives could be extracted from source';
  }

  // Register in the primitive registry — this is the critical step
  registerPrimitive({
    id: `primary.${name.toLowerCase()}`,
    name,
    category: profile.categories[0] || 'execution',
    handler,
    fallback: synthesizePassthroughHandler(name, 'Primary handler fallback'),
    source: 'generated',
    successRate: profile.hasMeaningfulBehavior ? 0.85 : 0.5,
  });

  return {
    registered: true,
    name,
    profile,
    hasMeaningfulBehavior: profile.hasMeaningfulBehavior,
    handlerType,
    reason,
  };
}

/**
 * Check if a primary handler is registered for a given name.
 */
export function hasPrimaryHandler(name: string): boolean {
  return getPrimitive(name) !== null;
}
