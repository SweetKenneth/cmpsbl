/**
 * CMPSBL® Always-On Core — Governed Execution Pipeline
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Authority-bearing layered runtime embedded into every Layer 2 export.
 *
 * Each pre-layer can BLOCK, OVERRIDE, or ENRICH the call before the
 * customer's original function runs. Post-layers always run — even when
 * blocked or failed — so the audit chain is never broken.
 *
 * Maps to CMPSBL primitives:
 *   before: DEFENSE → GOVERNANCE → MEMORY → FORESIGHT → NEXUS
 *   exec  : (Layer 1 customer code)
 *   after : EVOLUTION → AUDIT → COMPLIANCE
 *
 * Inline-embedded — never required as a sibling. Self-contained per polyglot.
 *
 * U.S. Patent App. No. 64/029,678 · © CMPSBL® · PromptFluid™
 */
import type { CmpsblLayerDefinition } from './types';

const GOVERNED_PIPELINE_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

export type CmpsblGovernedLayerName =
  | 'DEFENSE' | 'GOVERNANCE' | 'MEMORY' | 'FORESIGHT' | 'NEXUS'
  | 'EXECUTION' | 'EVOLUTION' | 'AUDIT' | 'COMPLIANCE';

export type CmpsblGovernedResult = 'continue' | 'blocked' | 'override' | 'failed';

export interface CmpsblGovernedContext<I = unknown, O = unknown> {
  input: I; output: O | null; error: Error | null;
  blocked: boolean; overridden: boolean; completed: boolean;
  metadata: Record<string, unknown>; memory: Record<string, unknown>;
  audit: Array<{ layer: string; timestamp: number; result: CmpsblGovernedResult; detail?: string }>;
  runtime: { startedAt: number; durationMs: number; retries: number; layerIndex: number; originalExecuted: boolean };
}

export interface CmpsblGovernedLayer<I = unknown, O = unknown> {
  name: CmpsblGovernedLayerName | string;
  phase: 'before' | 'after';
  order: number;
  enabled: boolean;
  execute: (ctx: CmpsblGovernedContext<I, O>) => Promise<CmpsblGovernedContext<I, O>> | CmpsblGovernedContext<I, O>;
}

function _cmpsbl_clone<I, O>(c: CmpsblGovernedContext<I, O>): CmpsblGovernedContext<I, O> {
  return { ...c, metadata: { ...c.metadata }, memory: { ...c.memory }, audit: [...c.audit], runtime: { ...c.runtime } };
}
function _cmpsbl_audit<I, O>(c: CmpsblGovernedContext<I, O>, layer: string, result: CmpsblGovernedResult, detail?: string): CmpsblGovernedContext<I, O> {
  const n = _cmpsbl_clone(c);
  n.audit.push({ layer, timestamp: Date.now(), result, detail });
  return n;
}

export async function cmpsbl_run_governed<I, O>(
  input: I,
  layers: CmpsblGovernedLayer<I, O>[],
  originalExecution: (ctx: CmpsblGovernedContext<I, O>) => Promise<O> | O,
  maxRetries: number = 2,
): Promise<CmpsblGovernedContext<I, O>> {
  const enabled = layers.filter(l => l.enabled);
  const before = enabled.filter(l => l.phase === 'before').sort((a, b) => a.order - b.order);
  const after = enabled.filter(l => l.phase === 'after').sort((a, b) => a.order - b.order);

  let ctx: CmpsblGovernedContext<I, O> = {
    input, output: null, error: null, blocked: false, overridden: false, completed: false,
    metadata: {}, memory: {}, audit: [],
    runtime: { startedAt: Date.now(), durationMs: 0, retries: 0, layerIndex: -1, originalExecuted: false },
  };

  for (let i = 0; i < before.length; i++) {
    const layer = before[i];
    ctx.runtime.layerIndex = i;
    if (ctx.blocked || ctx.overridden) break;
    try {
      ctx = await layer.execute(_cmpsbl_clone(ctx));
      const r: CmpsblGovernedResult = ctx.blocked ? 'blocked' : ctx.overridden ? 'override' : 'continue';
      ctx = _cmpsbl_audit(ctx, layer.name, r);
    } catch (err) {
      ctx.error = err instanceof Error ? err : new Error(String(err));
      ctx = _cmpsbl_audit(ctx, layer.name, 'failed', ctx.error.message);
      if (layer.name === 'DEFENSE' && ctx.runtime.retries < maxRetries) {
        ctx.runtime.retries += 1; i -= 1; continue;
      }
      ctx.blocked = true; break;
    }
  }

  if (!ctx.blocked && !ctx.overridden) {
    try {
      const v = await originalExecution(_cmpsbl_clone(ctx));
      ctx.output = v; ctx.runtime.originalExecuted = true;
      ctx = _cmpsbl_audit(ctx, 'EXECUTION', 'continue');
    } catch (err) {
      ctx.error = err instanceof Error ? err : new Error(String(err));
      ctx = _cmpsbl_audit(ctx, 'EXECUTION', 'failed', ctx.error.message);
      ctx.blocked = true;
    }
  }

  for (const layer of after) {
    try {
      ctx = await layer.execute(_cmpsbl_clone(ctx));
      ctx = _cmpsbl_audit(ctx, layer.name, 'continue');
    } catch (err) {
      ctx = _cmpsbl_audit(ctx, layer.name, 'failed', err instanceof Error ? err.message : String(err));
    }
  }

  ctx.runtime.durationMs = Date.now() - ctx.runtime.startedAt;
  ctx.completed = true;
  return ctx;
}
`;

const GOVERNED_PIPELINE_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import time
import asyncio
from typing import Any, Awaitable, Callable, Dict, List, Optional, Union

def _cmpsbl_clone(c: Dict[str, Any]) -> Dict[str, Any]:
    return {
        **c,
        "metadata": dict(c.get("metadata", {})),
        "memory": dict(c.get("memory", {})),
        "audit": list(c.get("audit", [])),
        "runtime": dict(c.get("runtime", {})),
    }

def _cmpsbl_audit(c: Dict[str, Any], layer: str, result: str, detail: Optional[str] = None) -> Dict[str, Any]:
    n = _cmpsbl_clone(c)
    n["audit"].append({"layer": layer, "timestamp": int(time.time() * 1000), "result": result, "detail": detail})
    return n

async def cmpsbl_run_governed(
    input_value: Any,
    layers: List[Dict[str, Any]],
    original_execution: Callable[[Dict[str, Any]], Union[Any, Awaitable[Any]]],
    max_retries: int = 2,
) -> Dict[str, Any]:
    enabled = [l for l in layers if l.get("enabled")]
    before = sorted([l for l in enabled if l.get("phase") == "before"], key=lambda l: l.get("order", 0))
    after = sorted([l for l in enabled if l.get("phase") == "after"], key=lambda l: l.get("order", 0))

    ctx: Dict[str, Any] = {
        "input": input_value, "output": None, "error": None,
        "blocked": False, "overridden": False, "completed": False,
        "metadata": {}, "memory": {}, "audit": [],
        "runtime": {
            "startedAt": int(time.time() * 1000), "durationMs": 0,
            "retries": 0, "layerIndex": -1, "originalExecuted": False,
        },
    }

    i = 0
    while i < len(before):
        layer = before[i]
        ctx["runtime"]["layerIndex"] = i
        if ctx["blocked"] or ctx["overridden"]:
            break
        try:
            result = layer["execute"](_cmpsbl_clone(ctx))
            if asyncio.iscoroutine(result):
                result = await result
            ctx = result
            r = "blocked" if ctx["blocked"] else "override" if ctx["overridden"] else "continue"
            ctx = _cmpsbl_audit(ctx, layer["name"], r)
        except BaseException as err:
            ctx["error"] = err
            ctx = _cmpsbl_audit(ctx, layer["name"], "failed", str(err))
            if layer["name"] == "DEFENSE" and ctx["runtime"]["retries"] < max_retries:
                ctx["runtime"]["retries"] += 1
                continue
            ctx["blocked"] = True
            break
        i += 1

    if not ctx["blocked"] and not ctx["overridden"]:
        try:
            v = original_execution(_cmpsbl_clone(ctx))
            if asyncio.iscoroutine(v):
                v = await v
            ctx["output"] = v
            ctx["runtime"]["originalExecuted"] = True
            ctx = _cmpsbl_audit(ctx, "EXECUTION", "continue")
        except BaseException as err:
            ctx["error"] = err
            ctx = _cmpsbl_audit(ctx, "EXECUTION", "failed", str(err))
            ctx["blocked"] = True

    for layer in after:
        try:
            result = layer["execute"](_cmpsbl_clone(ctx))
            if asyncio.iscoroutine(result):
                result = await result
            ctx = result
            ctx = _cmpsbl_audit(ctx, layer["name"], "continue")
        except BaseException as err:
            ctx = _cmpsbl_audit(ctx, layer["name"], "failed", str(err))

    ctx["runtime"]["durationMs"] = int(time.time() * 1000) - ctx["runtime"]["startedAt"]
    ctx["completed"] = True
    return ctx
`;

const GOVERNED_PIPELINE_WIRE_TS = `
// Sealed wrapper — proprietary. Pipeline activation handled by kernel bootstrap.`;

const GOVERNED_PIPELINE_WIRE_PY = `
# Sealed wrapper — proprietary. Pipeline activation handled by kernel bootstrap.`;

export const GOVERNED_PIPELINE_CORE: CmpsblLayerDefinition = {
  id: 'governed-pipeline',
  name: 'Governed Execution Pipeline',
  crownJewelRank: 11,
  cjpi: 96,
  module: 'CORTEX',
  description:
    'Authority-bearing layered runtime. Pre-layers (DEFENSE, GOVERNANCE, MEMORY, FORESIGHT, NEXUS) gate execution; original code runs as one controlled step; post-layers (EVOLUTION, AUDIT, COMPLIANCE) always run for audit integrity. Layers can block, override, or enrich.',
  priceCents: 0,
  tsCode: GOVERNED_PIPELINE_TS,
  pyCode: GOVERNED_PIPELINE_PY,
  autoWire: {
    wrapperName: 'cmpsbl_run_governed',
    behavior:
      'Wraps every governed call in a deterministic before→execute→after pipeline. Any pre-layer can block or override; post-layers always run for audit chain integrity.',
    tsWire: GOVERNED_PIPELINE_WIRE_TS,
    pyWire: GOVERNED_PIPELINE_WIRE_PY,
  },
};
