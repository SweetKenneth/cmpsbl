/**
 * CMPSBL® Chain Injection System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Allows Candidate Nodes (Node 41+) to participate in discovery chains
 * as first-class citizens alongside canonical substrate nodes.
 *
 * Hardened: safe naming, traceable execution, graceful failure.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { PipelineContext, ModuleEffect, EffectVerb } from '@/lib/export/module-effects';
import { buildPrimitiveHandler } from './primitive-extractor';
import {
  type AscensionNode,
  type InjectionResult,
  type ChainParticipation,
  buildAscensionModuleName,
  isAscensionModule,
  generateCorrelationId,
} from './types';
import { applyEffectInjection, ensureChain, detectPrimaryUnit } from './effect-injection';

// Re-export types
export type { InjectionResult, ChainParticipation };

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — CATEGORY → VERB MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

const CATEGORY_VERB_MAP: Record<string, EffectVerb> = {
  analysis: 'score', execution: 'transform', validation: 'validate',
  transformation: 'transform', prediction: 'predict', storage: 'persist',
  routing: 'route', security: 'validate', communication: 'route',
  scheduling: 'orchestrate', monitoring: 'observe', computation: 'transform',
  rendering: 'transform', configuration: 'enrich', io: 'transform', unknown: 'enrich',
};

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — NODE EFFECT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

function getDominantCategory(primitives: AscensionNode['primitives']): string {
  if (primitives.length === 0) return 'unknown';
  const counts: Record<string, number> = {};
  for (const p of primitives) counts[p.category] = (counts[p.category] || 0) + 1;
  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0];
}

/**
 * Build a ModuleEffect for an ascension node.
 * Uses collision-safe naming. Individual primitive failures are isolated.
 */
export function buildNodeEffect(node: AscensionNode): ModuleEffect {
  const primitives = node.primitives;
  const dominantCategory = getDominantCategory(primitives);
  const verb = CATEGORY_VERB_MAP[dominantCategory] || 'enrich';
  const moduleName = buildAscensionModuleName(node.surface?.nodeName || node.name);

  return {
    module: moduleName,
    verb,
    description: `Ascension Node "${node.name}" — ${primitives.length} primitives (${dominantCategory}), ${node.language}`,
    depth: primitives.length >= 5 ? 'deep' : primitives.length >= 1 ? 'standard' : 'fallback',
    apply: async (ctx: PipelineContext): Promise<PipelineContext> => {
      const moduleKey = `_node41_${moduleName}`;
      let executedCount = 0;
      let failedCount = 0;
      const outputChanges: string[] = [];

      // Execute each primitive handler — isolate failures
      for (const primitive of primitives.slice(0, 20)) {
        try {
          const handler = buildPrimitiveHandler(primitive);
          const beforeKeys = new Set(Object.keys(ctx.data));
          ctx.data = { ...handler(ctx.data) };
          const afterKeys = Object.keys(ctx.data);

          for (const k of afterKeys) {
            if (!beforeKeys.has(k)) outputChanges.push(`+${primitive.name}(${primitive.category})`);
          }
          executedCount++;
        } catch {
          failedCount++;
          ctx.transformationNotes.push(
            `[${moduleName}] Primitive "${primitive.name}" failed — skipped`
          );
        }
      }

      // Annotate context
      ctx.data[moduleKey] = {
        participated: true,
        moduleType: 'ascension',
        depth: primitives.length >= 5 ? 'deep' : 'standard',
        nodeName: node.name,
        language: node.language,
        primitivesExecuted: executedCount,
        primitivesFailed: failedCount,
        totalPrimitives: primitives.length,
        dominantCategory,
        surface: node.surface,
        stageIndex: ctx.stageIndex,
        timestamp: Date.now(),
      };

      ctx.annotations[`node41.${node.id}.executed`] = true;
      ctx.annotations[`node41.${node.id}.primitives`] = executedCount;
      ctx.annotations[`node41.${node.id}.failed`] = failedCount;

      // Confidence adjustment
      const avgConfidence = primitives.reduce((s, p) => s + p.confidence, 0) / Math.max(1, primitives.length);
      ctx.confidence = Math.min(1, ctx.confidence * (0.85 + avgConfidence * 0.15));

      ctx.transformationNotes.push(
        `[${moduleName}] Injected ${executedCount}/${primitives.length} primitives ` +
        `(${failedCount} failed) — dominant: ${dominantCategory}, ` +
        `confidence: ${(avgConfidence * 100).toFixed(0)}%` +
        (outputChanges.length > 0 ? ` — changes: ${outputChanges.slice(0, 5).join(', ')}` : '')
      );

      return ctx;
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — CHAIN INJECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inject a node into a module chain at the specified position.
 */
export function injectNodeIntoChain(
  existingChain: string[],
  node: AscensionNode,
  position?: number
): { chain: string[]; injectedAt: number } {
  const moduleName = buildAscensionModuleName(node.surface?.nodeName || node.name);
  const insertAt = position !== undefined
    ? Math.min(Math.max(0, position), existingChain.length)
    : Math.floor(existingChain.length / 2);

  const chain = [...existingChain];
  chain.splice(insertAt, 0, moduleName);

  return { chain, injectedAt: insertAt };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — EFFECT REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

const nodeEffectRegistry = new Map<string, ModuleEffect>();

export function registerNodeEffect(node: AscensionNode): InjectionResult {
  const correlationId = generateCorrelationId();
  const warnings: string[] = [];

  if (node.primitives.length === 0) {
    warnings.push('No primitives extracted — node will use fallback effect');
  }
  if (node.status === 'archived' || node.status === 'rejected') {
    warnings.push(`Node status is "${node.status}" — may not participate in new chains`);
  }

  const effect = buildNodeEffect(node);

  // Validate no collision with existing canonical modules
  if (!isAscensionModule(effect.module)) {
    return {
      success: false,
      primitivesInjected: 0,
      effectRegistered: false,
      warnings: [...warnings, `Module name "${effect.module}" does not have ascension prefix`],
      correlationId,
    };
  }

  nodeEffectRegistry.set(effect.module, effect);

  return {
    success: true,
    primitivesInjected: node.primitives.length,
    effectRegistered: true,
    warnings,
    correlationId,
  };
}

export function getNodeEffect(moduleName: string): ModuleEffect | undefined {
  return nodeEffectRegistry.get(moduleName);
}

export function clearNodeEffects(): void {
  nodeEffectRegistry.clear();
}

export function getRegisteredNodeCount(): number {
  return nodeEffectRegistry.size;
}
