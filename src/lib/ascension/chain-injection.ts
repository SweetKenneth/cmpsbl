/**
 * CMPSBL® Chain Injection System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Allows Candidate Nodes (Node 41+) to participate in discovery chains
 * as first-class citizens alongside canonical substrate nodes.
 *
 * Behavior:
 *   - Insert Node 41 primitives into module chains dynamically
 *   - Execute primitives during runtime playback
 *   - Track CJPI delta and output changes
 *   - Integrate with chain-executor's module effect system
 *
 * Node 41 must behave EXACTLY like canonical nodes during execution.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { PipelineContext, ModuleEffect, EffectVerb } from '@/lib/export/module-effects';
import { buildPrimitiveHandler, type ExtractedPrimitive } from './primitive-extractor';
import type { AscensionNode } from './node-registry';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface InjectionResult {
  /** Whether injection was successful */
  success: boolean;
  /** Number of primitives injected */
  primitivesInjected: number;
  /** Module effect registered */
  effectRegistered: boolean;
  /** Warnings */
  warnings: string[];
}

export interface ChainParticipation {
  nodeId: string;
  nodeName: string;
  chainModules: string[];
  position: number;
  cjpiDelta: number;
  primitivesExecuted: number;
  outputChanges: string[];
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — NODE EFFECT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

/** Category → EffectVerb mapping */
const CATEGORY_VERB_MAP: Record<string, EffectVerb> = {
  analysis: 'score',
  execution: 'transform',
  validation: 'validate',
  transformation: 'transform',
  prediction: 'predict',
  storage: 'persist',
  routing: 'route',
  security: 'validate',
  communication: 'route',
  scheduling: 'orchestrate',
  monitoring: 'observe',
  computation: 'transform',
  rendering: 'transform',
  configuration: 'enrich',
  io: 'transform',
  unknown: 'enrich',
};

/**
 * Build a ModuleEffect for a candidate node based on its extracted primitives.
 * This makes Node 41 behave like a canonical module in the chain executor.
 */
export function buildNodeEffect(node: AscensionNode): ModuleEffect {
  const primitives = node.primitives;
  const dominantCategory = getDominantCategory(primitives);
  const verb = CATEGORY_VERB_MAP[dominantCategory] || 'enrich';
  const nodeName = node.surface?.nodeName || node.name;

  return {
    module: `Ψ₄₁_${nodeName}`,
    verb,
    description: `Ascension Node "${nodeName}" — ${primitives.length} primitives (${dominantCategory}), ${node.language}`,
    depth: primitives.length >= 5 ? 'deep' : primitives.length >= 1 ? 'standard' : 'fallback',
    apply: async (ctx: PipelineContext): Promise<PipelineContext> => {
      const moduleKey = `_node41_${nodeName.toLowerCase()}`;

      // Execute each primitive handler against context
      let executedCount = 0;
      const outputChanges: string[] = [];

      for (const primitive of primitives.slice(0, 20)) {
        try {
          const handler = buildPrimitiveHandler(primitive);
          const before = Object.keys(ctx.data).length;
          ctx.data = { ...handler(ctx.data) };
          const after = Object.keys(ctx.data).length;

          if (after > before) {
            outputChanges.push(`+${primitive.name}(${primitive.category})`);
          }
          executedCount++;
        } catch {
          // Individual primitive failure should not halt chain
          ctx.transformationNotes.push(
            `[Ψ₄₁ ${nodeName}] Primitive "${primitive.name}" failed — skipped`
          );
        }
      }

      // Annotate context with node participation
      ctx.data[moduleKey] = {
        participated: true,
        depth: primitives.length >= 5 ? 'deep' : 'standard',
        nodeName,
        language: node.language,
        primitivesExecuted: executedCount,
        totalPrimitives: primitives.length,
        dominantCategory,
        surface: node.surface,
        stageIndex: ctx.stageIndex,
        timestamp: Date.now(),
      };

      ctx.annotations[`node41.${nodeName.toLowerCase()}.executed`] = true;
      ctx.annotations[`node41.${nodeName.toLowerCase()}.primitives`] = executedCount;

      // Confidence adjustment based on extraction quality
      const avgConfidence = primitives.reduce((s, p) => s + p.confidence, 0) / Math.max(1, primitives.length);
      ctx.confidence = Math.min(1, ctx.confidence * (0.85 + avgConfidence * 0.15));

      ctx.transformationNotes.push(
        `[Ψ₄₁ ${nodeName}] Injected ${executedCount}/${primitives.length} primitives — ` +
        `dominant: ${dominantCategory}, confidence: ${(avgConfidence * 100).toFixed(0)}%` +
        (outputChanges.length > 0 ? ` — changes: ${outputChanges.slice(0, 5).join(', ')}` : '')
      );

      return ctx;
    },
  };
}

/**
 * Determine the dominant category among primitives
 */
function getDominantCategory(primitives: ExtractedPrimitive[]): string {
  if (primitives.length === 0) return 'unknown';

  const counts: Record<string, number> = {};
  for (const p of primitives) {
    counts[p.category] = (counts[p.category] || 0) + 1;
  }

  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0];
}

/**
 * Inject a node's effect into a live module chain.
 * Returns the chain with Node 41 inserted at the specified position.
 */
export function injectNodeIntoChain(
  existingChain: string[],
  node: AscensionNode,
  position?: number
): { chain: string[]; injectedAt: number } {
  const nodeName = `Ψ₄₁_${node.surface?.nodeName || node.name}`;
  const insertAt = position !== undefined
    ? Math.min(Math.max(0, position), existingChain.length)
    : Math.floor(existingChain.length / 2); // Default: middle of chain

  const chain = [...existingChain];
  chain.splice(insertAt, 0, nodeName);

  return { chain, injectedAt: insertAt };
}

/**
 * Registry of active node effects for the chain executor.
 * The chain executor can look up effects by module name.
 */
const nodeEffectRegistry = new Map<string, ModuleEffect>();

/**
 * Register a node's effect so the chain executor can resolve it
 */
export function registerNodeEffect(node: AscensionNode): InjectionResult {
  const warnings: string[] = [];

  if (node.primitives.length === 0) {
    warnings.push('No primitives extracted — node will use fallback effect');
  }

  if (node.status === 'archived' || node.status === 'rejected') {
    warnings.push(`Node status is "${node.status}" — may not participate in new chains`);
  }

  const effect = buildNodeEffect(node);
  nodeEffectRegistry.set(effect.module, effect);

  return {
    success: true,
    primitivesInjected: node.primitives.length,
    effectRegistered: true,
    warnings,
  };
}

/**
 * Look up a registered node effect by module name
 */
export function getNodeEffect(moduleName: string): ModuleEffect | undefined {
  return nodeEffectRegistry.get(moduleName);
}

/**
 * Clear all registered node effects
 */
export function clearNodeEffects(): void {
  nodeEffectRegistry.clear();
}

/**
 * Get count of registered node effects
 */
export function getRegisteredNodeCount(): number {
  return nodeEffectRegistry.size;
}
