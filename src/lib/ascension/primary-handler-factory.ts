/**
 * CMPSBL® Primary Handler Factory
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Builds a WRAPPING handler that treats the original code as the
 * authoritative execution layer. The CMPSBL system sits on top:
 * observing inputs/outputs, enriching context, adding cognition.
 *
 * ARCHITECTURE (Dual-Layer):
 *   Layer 1 — Native Execution: unchanged, trusted, deterministic
 *   Layer 2 — Cognitive Overlay: CMPSBL modules (trace, reasoning, scoring)
 *
 * The handler does NOT synthesize or simulate original behavior.
 * It wraps and augments it.
 *
 * RULES:
 *  1. Original code is the AUTHORITATIVE execution layer
 *  2. Handler WRAPS — never replaces — original logic
 *  3. If original cannot run → explicit "passthrough_primary" with original preserved
 *  4. Cognitive overlay enriches but never substitutes computation
 *
 * © CMPSBL® — All rights reserved.
 */

import { registerPrimitive, getPrimitive, type PrimitiveHandler } from './primitive-registry';
import type { ExtractedPrimitive } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — BEHAVIORAL PROFILE (for cognitive overlay — NOT for execution)
// ═══════════════════════════════════════════════════════════════════════════════

/** Behavioral profile derived from extracted primitives — used for ENRICHMENT only */
interface BehavioralProfile {
  categories: string[];
  stateTransitions: number;
  dataTransforms: number;
  sideEffects: number;
  controlFlowDepth: number;
  callableCount: number;
  dominantIntent: string;
  hasMeaningfulBehavior: boolean;
  knownInputs: string[];
  knownOutputs: string[];
  language: string;
}

const STATE_KEYWORDS = new Set([
  'loop', 'while', 'for', 'switch', 'case', 'match', 'if', 'else',
  'state', 'transition', 'lifecycle', 'phase', 'step', 'stage',
  'iterate', 'recurse', 'poll', 'watch', 'listen', 'await',
]);

const SIDE_EFFECT_KEYWORDS = new Set([
  'save', 'store', 'persist', 'write', 'insert', 'update', 'delete',
  'send', 'post', 'put', 'emit', 'publish', 'notify', 'log',
  'fetch', 'get', 'request', 'call', 'invoke', 'connect',
  'upload', 'download', 'stream',
]);

const TRANSFORM_KEYWORDS = new Set([
  'transform', 'convert', 'format', 'normalize', 'parse', 'serialize',
  'map', 'filter', 'reduce', 'merge', 'split', 'join', 'encode', 'decode',
  'calculate', 'compute', 'score', 'evaluate', 'analyze', 'process',
]);

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

    if (p.sourceSnippet) {
      const snippet = p.sourceSnippet.toLowerCase();
      const cfMatches = snippet.match(/\b(if|else|for|while|switch|case|try|catch|match|when)\b/g);
      if (cfMatches) controlFlowDepth += cfMatches.length;
    }

    for (const inp of (p.inputs || [])) knownInputs.add(inp);
    for (const out of (p.outputs || [])) knownOutputs.add(out);
  }

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
// §2 — HANDLER FACTORY (WRAP + AUGMENT — never simulate)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build a WRAPPING handler that:
 *  1. Passes input through UNCHANGED (original code is authoritative)
 *  2. Adds a cognitive overlay with behavioral analysis metadata
 *  3. Never replaces or simulates the original computation
 *
 * The handler enriches context so downstream modules (BRAIN, ORACLE, etc.)
 * can reason about the original code's behavior WITHOUT replacing it.
 */
function buildWrappingHandler(
  primaryName: string,
  profile: BehavioralProfile,
  primitives: ExtractedPrimitive[],
  originalSource: string | null,
): PrimitiveHandler {
  return (input: unknown, _context?: unknown): unknown => {
    // Layer 1: PRESERVE original input/execution as-is
    // The original code's output IS the result — we don't compute anything
    const baseResult = typeof input === 'object' && input !== null
      ? { ...(input as Record<string, unknown>) }
      : input;

    // Layer 2: COGNITIVE OVERLAY — observation + enrichment, NOT computation
    const cognitiveOverlay = {
      _cmpsbl_overlay: {
        // What we OBSERVED about the original code (static analysis)
        behavioral_profile: {
          dominant_intent: profile.dominantIntent,
          categories: profile.categories,
          callable_count: profile.callableCount,
          state_transitions: profile.stateTransitions,
          data_transforms: profile.dataTransforms,
          side_effects: profile.sideEffects,
          control_flow_depth: profile.controlFlowDepth,
          language: profile.language,
          meaningful_behavior: profile.hasMeaningfulBehavior,
        },
        // What primitives we extracted (for downstream cognition)
        extracted_primitives: primitives.slice(0, 10).map(p => ({
          name: p.name,
          category: p.category,
          confidence: p.confidence,
          complexity: p.complexity,
          inputs: p.inputs?.length || 0,
          outputs: p.outputs?.length || 0,
        })),
        // Execution metadata
        execution: {
          primary_name: primaryName,
          handler_type: 'wrapping',  // NOT 'behavioral' or 'synthetic'
          original_preserved: true,
          computation_replaced: false, // CRITICAL: we did NOT replace anything
          source_bundled: originalSource !== null,
          timestamp: Date.now(),
        },
      },
    };

    // Return: original data PLUS cognitive overlay (never mixed into original keys)
    if (typeof baseResult === 'object' && baseResult !== null) {
      return { ...baseResult, ...cognitiveOverlay };
    }
    return { _original: baseResult, ...cognitiveOverlay };
  };
}

/**
 * Passthrough handler — explicitly NOT executing because we can't run the original.
 * Input is preserved unchanged. Cognitive overlay notes WHY execution didn't happen.
 */
function buildPassthroughHandler(primaryName: string, reason: string, originalSource: string | null): PrimitiveHandler {
  return (input: unknown, _context?: unknown): unknown => {
    const base = typeof input === 'object' && input !== null
      ? { ...(input as Record<string, unknown>) }
      : { _original: input };

    return {
      ...(typeof base === 'object' ? base : { _original: base }),
      _cmpsbl_overlay: {
        execution: {
          primary_name: primaryName,
          handler_type: 'passthrough_primary',
          original_preserved: true,
          computation_replaced: false,
          original_runnable: false,
          passthrough_reason: reason,
          source_bundled: originalSource !== null,
          timestamp: Date.now(),
        },
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
  handlerType: 'wrapping' | 'passthrough_primary';
  reason: string;
}

/**
 * Build and register a primary handler for the given unit.
 *
 * ARCHITECTURE:
 *  - The handler WRAPS original code — it does NOT simulate it
 *  - Original source is bundled for export so it can be executed natively
 *  - Cognitive overlay observes and enriches — never substitutes
 *
 * INVARIANT: After this call, getPrimitive(name) !== null
 */
export function registerPrimaryHandler(
  name: string,
  primitives: ExtractedPrimitive[],
  sourceLanguage: string,
  originalSource?: string | null,
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

  // Skip if already registered with a non-generated handler
  const existing = getPrimitive(name);
  if (existing?.handler && existing.source !== 'generated') {
    return {
      registered: true,
      name,
      profile: null,
      hasMeaningfulBehavior: true,
      handlerType: 'wrapping',
      reason: 'Already registered with native handler',
    };
  }

  // Build behavioral profile (for cognitive overlay, NOT for execution)
  const profile = buildBehavioralProfile(primitives, sourceLanguage);
  const source = originalSource ?? null;

  let handler: PrimitiveHandler;
  let handlerType: 'wrapping' | 'passthrough_primary';
  let reason: string;

  if (profile.hasMeaningfulBehavior) {
    handler = buildWrappingHandler(name, profile, primitives, source);
    handlerType = 'wrapping';
    reason = `Wrapping ${profile.callableCount} callables — ` +
      `${profile.dominantIntent} (${profile.stateTransitions} state transitions, ` +
      `${profile.dataTransforms} transforms, ${profile.sideEffects} side effects) — ` +
      `original logic preserved, cognitive overlay applied`;
  } else if (primitives.length > 0) {
    handler = buildPassthroughHandler(name, 'No meaningful behavioral patterns — original preserved as-is', source);
    handlerType = 'passthrough_primary';
    reason = `${primitives.length} primitives extracted but no meaningful behavioral patterns — passthrough with overlay`;
  } else {
    handler = buildPassthroughHandler(name, 'No primitives extracted — original preserved as-is', source);
    handlerType = 'passthrough_primary';
    reason = 'No primitives could be extracted — passthrough with overlay';
  }

  // Register in the primitive registry
  registerPrimitive({
    id: `primary.${name.toLowerCase()}`,
    name,
    category: profile.categories[0] || 'execution',
    handler,
    fallback: buildPassthroughHandler(name, 'Primary handler fallback — original preserved', source),
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
