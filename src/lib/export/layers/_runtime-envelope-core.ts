/**
 * CMPSBL® Always-On Core — Runtime Envelope (Kernel Component #30)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * The execution control envelope. Owns the uniform CmpsblRuntimeCtx
 * contract and the cmpsbl_chain runner that drives every layer through
 * a deterministic phase order with explicit short-circuit gates.
 *
 * Architecture:
 *   ① init(input)                     → fresh ctx with blocked/override/error
 *   ② run Phase 0 hardening layers   → if ctx.blocked → finalize early
 *   ③ run Phase 1–5 pre-execution    → if ctx.blocked|override → finalize
 *   ④ run Phase 6 (cmpsbl_execute)   → fills ctx.output or ctx.error
 *   ⑤ run Phase 7–8 post-execution   → can recover via ctx.override
 *   ⑥ finalize(ctx)                   → emit chain receipt + seal
 *
 * Every layer writes to ctx.metadata.actionsTaken — proof-of-firing.
 * A layer that doesn't append cannot pass the pre-export harness.
 *
 * This core ONLY hosts the contract and runner. It does NOT modify
 * Layer 1, IsolatedExecutor, or the Discovery Engine. Pure envelope.
 *
 * Module: GOVERNANCE  ·  CJPI: 98  ·  Crown Jewel #30
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const RUNTIME_ENVELOPE_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION KERNEL — Runtime Envelope (sealed module, proprietary).            ║
// ║  Uniform CmpsblRuntimeCtx + deterministic cmpsbl_chain runner.                ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/**
 * The single shared shape every layer reads + writes.
 * Layers MUST append to metadata.actionsTaken (even if "no-op this call")
 * — a layer that never appends is a layer that never ran.
 */
interface CmpsblRuntimeCtx {
  input: unknown;
  output: unknown;
  blocked: boolean;          // any pre-exec layer can stop the chain
  override: boolean;         // any layer can replace ctx.output
  error: Error | null;       // post-exec layers can recover by setting override
  blockReason: string | null;
  metadata: {
    phase: number;
    layerId: string;
    startTime: number;
    recentFailures: number;
    actionsTaken: Array<{ layerId: string; phase: number; action: string; ts: number }>;
  };
  receipts: unknown[];       // appended by Receipt Emitter
}

interface CmpsblChainLayer {
  id: string;
  phase: number;
  execute: (ctx: CmpsblRuntimeCtx) => CmpsblRuntimeCtx | Promise<CmpsblRuntimeCtx>;
}

interface CmpsblChainResult {
  ok: boolean;
  output: unknown;
  blocked: boolean;
  blockReason: string | null;
  error: { message: string; name: string } | null;
  shortCircuited: boolean;
  shortCircuitedAt: number | null;  // phase number where chain stopped
  actionsTaken: ReadonlyArray<{ layerId: string; phase: number; action: string; ts: number }>;
  durationMs: number;
}

function _cmpsbl_kernel_enabled_re(): boolean {
  const v = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_ENABLED) || 'true';
  return String(v).toLowerCase() !== 'false';
}

/**
 * Initialize a fresh runtime context for a single chain invocation.
 * Phase 0 = hardening (initial). Layer ID is set per-layer by the runner.
 */
function cmpsbl_runtime_init(input: unknown): CmpsblRuntimeCtx {
  return {
    input,
    output: undefined,
    blocked: false,
    override: false,
    error: null,
    blockReason: null,
    metadata: {
      phase: 0,
      layerId: 'envelope-init',
      startTime: Date.now(),
      recentFailures: 0,
      actionsTaken: [],
    },
    receipts: [],
  };
}

/**
 * Append a proof-of-firing entry. Every layer MUST call this exactly once
 * per chain pass — including no-op decisions (action: 'noop').
 */
function cmpsbl_record_action(ctx: CmpsblRuntimeCtx, layerId: string, action: string): void {
  ctx.metadata.actionsTaken.push({
    layerId,
    phase: ctx.metadata.phase,
    action,
    ts: Date.now(),
  });
}

/**
 * Finalize the chain — emit a single chain-level receipt summarising the
 * full traversal. Per-call receipts (from cmpsbl_execute) remain separate
 * and chain-linked via Receipt Emitter.
 */
function cmpsbl_runtime_finalize(ctx: CmpsblRuntimeCtx, shortCircuitedAt: number | null): CmpsblChainResult {
  const result: CmpsblChainResult = {
    ok: !ctx.blocked && !ctx.error,
    output: ctx.output,
    blocked: ctx.blocked,
    blockReason: ctx.blockReason,
    error: ctx.error ? { message: ctx.error.message, name: ctx.error.name } : null,
    shortCircuited: shortCircuitedAt !== null,
    shortCircuitedAt,
    actionsTaken: Object.freeze(ctx.metadata.actionsTaken.slice()),
    durationMs: Date.now() - ctx.metadata.startTime,
  };

  // Best-effort chain-receipt emission — kernel envelope marker.
  try {
    if (typeof cmpsbl_receipts === 'function' && _cmpsbl_kernel_enabled_re()) {
      cmpsbl_receipts().emit(
        'cmpsbl_chain',
        cmpsbl_receipt_hash({ blocked: result.blocked, shortCircuited: result.shortCircuited }),
        cmpsbl_receipt_hash(result.output ?? null),
        result.durationMs,
        result.ok ? 'OK' : (result.blocked ? 'BLOCKED' : 'ERROR'),
      );
    }
  } catch { /* receipts not present — chain still valid */ }

  return result;
}

/**
 * Deterministic chain runner. Layers are executed in the exact order
 * provided (caller is responsible for phase ordering — orderByPhase()).
 *
 * Short-circuit semantics:
 *   • Phase 0 sets ctx.blocked=true → skip ALL downstream phases
 *   • Phase 1–5 sets ctx.blocked → skip execution + remaining pre-layers
 *   • Phase 1–5 sets ctx.override → skip execution, run post-layers (so
 *     observers still see the synthesised output)
 *   • Phase 6 (execution) error → ctx.error set; post-layers can recover
 *   • Phase 7–8 always run if reached (they're observers + recovery)
 */
async function cmpsbl_chain(
  input: unknown,
  preLayers: CmpsblChainLayer[],
  execute: (input: unknown) => unknown | Promise<unknown>,
  postLayers: CmpsblChainLayer[],
): Promise<CmpsblChainResult> {
  const ctx = cmpsbl_runtime_init(input);
  let shortCircuitedAt: number | null = null;

  // Pre-execution phases (0–5)
  for (const layer of preLayers) {
    ctx.metadata.phase = layer.phase;
    ctx.metadata.layerId = layer.id;
    try {
      await layer.execute(ctx);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      // Hardening (phase 0) errors are authoritative — block the chain.
      if (layer.phase === 0) {
        ctx.blocked = true;
        ctx.blockReason = 'hardening_error: ' + err.message;
        cmpsbl_record_action(ctx, layer.id, 'block_on_error');
        shortCircuitedAt = layer.phase;
        return cmpsbl_runtime_finalize(ctx, shortCircuitedAt);
      }
      // Pre-exec layer errors don't block by default — record + continue.
      cmpsbl_record_action(ctx, layer.id, 'layer_error: ' + err.message);
      continue;
    }
    if (ctx.blocked) {
      shortCircuitedAt = layer.phase;
      return cmpsbl_runtime_finalize(ctx, shortCircuitedAt);
    }
    if (ctx.override) {
      // Override before execution — skip Layer 1, jump straight to post-layers
      shortCircuitedAt = layer.phase;
      break;
    }
  }

  // Phase 6 — Layer 1 execution (only if not overridden)
  if (!ctx.override) {
    ctx.metadata.phase = 6;
    ctx.metadata.layerId = 'layer-1-execution';
    try {
      ctx.output = await execute(ctx.input);
    } catch (e) {
      ctx.error = e instanceof Error ? e : new Error(String(e));
    }
    cmpsbl_record_action(ctx, 'layer-1-execution', ctx.error ? 'execution_error' : 'execution_ok');
  }

  // Post-execution phases (7–8) — always run if we reached here
  for (const layer of postLayers) {
    ctx.metadata.phase = layer.phase;
    ctx.metadata.layerId = layer.id;
    try {
      await layer.execute(ctx);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      cmpsbl_record_action(ctx, layer.id, 'post_layer_error: ' + err.message);
    }
  }

  return cmpsbl_runtime_finalize(ctx, shortCircuitedAt);
}
`;

const RUNTIME_ENVELOPE_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION KERNEL — Runtime Envelope (sealed module, proprietary).            ║
# ║  Uniform CmpsblRuntimeCtx + deterministic cmpsbl_chain runner.                ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import os
import time
import inspect
from typing import Any, Awaitable, Callable, Dict, List, Optional, Union


def _cmpsbl_kernel_enabled_re() -> bool:
    return str(os.environ.get("CMPSBL_KERNEL_ENABLED", "true")).lower() != "false"


def cmpsbl_runtime_init(input_value: Any) -> Dict[str, Any]:
    """Fresh runtime context. Layers mutate this single dict in place."""
    return {
        "input": input_value,
        "output": None,
        "blocked": False,
        "override": False,
        "error": None,
        "block_reason": None,
        "metadata": {
            "phase": 0,
            "layer_id": "envelope-init",
            "start_time": int(time.time() * 1000),
            "recent_failures": 0,
            "actions_taken": [],
        },
        "receipts": [],
    }


def cmpsbl_record_action(ctx: Dict[str, Any], layer_id: str, action: str) -> None:
    """Proof-of-firing — every layer MUST call this exactly once per chain pass."""
    ctx["metadata"]["actions_taken"].append({
        "layer_id": layer_id,
        "phase": ctx["metadata"]["phase"],
        "action": action,
        "ts": int(time.time() * 1000),
    })


def cmpsbl_runtime_finalize(ctx: Dict[str, Any], short_circuited_at: Optional[int]) -> Dict[str, Any]:
    duration_ms = int(time.time() * 1000) - ctx["metadata"]["start_time"]
    error = None
    if ctx["error"] is not None:
        err = ctx["error"]
        error = {"message": str(err), "name": type(err).__name__}
    result = {
        "ok": (not ctx["blocked"]) and (ctx["error"] is None),
        "output": ctx["output"],
        "blocked": ctx["blocked"],
        "block_reason": ctx["block_reason"],
        "error": error,
        "short_circuited": short_circuited_at is not None,
        "short_circuited_at": short_circuited_at,
        "actions_taken": list(ctx["metadata"]["actions_taken"]),
        "duration_ms": duration_ms,
    }
    try:
        if _cmpsbl_kernel_enabled_re():
            cmpsbl_receipts().emit(  # type: ignore[name-defined]
                "cmpsbl_chain",
                cmpsbl_receipt_hash({"blocked": result["blocked"], "shortCircuited": result["short_circuited"]}),  # type: ignore[name-defined]
                cmpsbl_receipt_hash(result["output"]),  # type: ignore[name-defined]
                duration_ms,
                "OK" if result["ok"] else ("BLOCKED" if result["blocked"] else "ERROR"),
            )
    except Exception:
        pass
    return result


async def cmpsbl_chain(
    input_value: Any,
    pre_layers: List[Dict[str, Any]],
    execute: Callable[[Any], Any],
    post_layers: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Deterministic chain runner with explicit short-circuit gates.

    Each layer dict has shape: {"id": str, "phase": int, "execute": Callable[[ctx], ctx | Awaitable[ctx]]}.
    """
    ctx = cmpsbl_runtime_init(input_value)
    short_circuited_at: Optional[int] = None

    # Pre-execution phases (0–5)
    for layer in pre_layers:
        ctx["metadata"]["phase"] = layer["phase"]
        ctx["metadata"]["layer_id"] = layer["id"]
        try:
            result = layer["execute"](ctx)
            if inspect.isawaitable(result):
                await result
        except Exception as e:
            if layer["phase"] == 0:
                ctx["blocked"] = True
                ctx["block_reason"] = "hardening_error: " + str(e)
                cmpsbl_record_action(ctx, layer["id"], "block_on_error")
                short_circuited_at = layer["phase"]
                return cmpsbl_runtime_finalize(ctx, short_circuited_at)
            cmpsbl_record_action(ctx, layer["id"], "layer_error: " + str(e))
            continue
        if ctx["blocked"]:
            short_circuited_at = layer["phase"]
            return cmpsbl_runtime_finalize(ctx, short_circuited_at)
        if ctx["override"]:
            short_circuited_at = layer["phase"]
            break

    # Phase 6 — Layer 1 execution (only if not overridden)
    if not ctx["override"]:
        ctx["metadata"]["phase"] = 6
        ctx["metadata"]["layer_id"] = "layer-1-execution"
        try:
            value = execute(ctx["input"])
            if inspect.isawaitable(value):
                value = await value
            ctx["output"] = value
        except Exception as e:
            ctx["error"] = e
        cmpsbl_record_action(
            ctx, "layer-1-execution",
            "execution_error" if ctx["error"] is not None else "execution_ok",
        )

    # Post-execution phases (7–8)
    for layer in post_layers:
        ctx["metadata"]["phase"] = layer["phase"]
        ctx["metadata"]["layer_id"] = layer["id"]
        try:
            result = layer["execute"](ctx)
            if inspect.isawaitable(result):
                await result
        except Exception as e:
            cmpsbl_record_action(ctx, layer["id"], "post_layer_error: " + str(e))

    return cmpsbl_runtime_finalize(ctx, short_circuited_at)
`;

const RUNTIME_ENVELOPE_WIRE_TS = `
// Runtime Envelope — owns CmpsblRuntimeCtx + the cmpsbl_chain runner.
// Every chain invocation goes through cmpsbl_chain(input, preLayers, execute, postLayers).
// Phase 0 hardening is authoritative: a blocked ctx skips ALL downstream phases.
// Layers MUST call cmpsbl_record_action(ctx, layerId, action) — proof-of-firing
// is verified by the pre-export harness; silent layers fail export.
if (_cmpsbl_kernel_enabled_re()) {
  void cmpsbl_chain;
  void cmpsbl_record_action;
}`;

const RUNTIME_ENVELOPE_WIRE_PY = `
# Runtime Envelope — owns CmpsblRuntimeCtx + the cmpsbl_chain runner.
# Every chain invocation goes through cmpsbl_chain(input, pre_layers, execute, post_layers).
# Phase 0 hardening is authoritative: a blocked ctx skips ALL downstream phases.
# Layers MUST call cmpsbl_record_action(ctx, layer_id, action) — proof-of-firing
# is verified by the pre-export harness; silent layers fail export.
if _cmpsbl_kernel_enabled_re():
    _ = cmpsbl_chain
    _ = cmpsbl_record_action`;

const RUNTIME_ENVELOPE_CORE: CmpsblLayerDefinition = {
  id: 'runtime-envelope',
  name: 'Runtime Envelope',
  crownJewelRank: 30,
  cjpi: 98,
  module: 'GOVERNANCE',
  description:
    'Kernel-grade execution control envelope. Owns the uniform CmpsblRuntimeCtx contract and the cmpsbl_chain runner that drives every layer through deterministic phase order with explicit short-circuit gates. Phase 0 hardening is authoritative — blocked ctx skips all downstream phases. Pre-execution overrides skip Layer 1 but still run post-layer observers. Every layer must record an action (proof-of-firing) — silent layers fail the pre-export harness. Layer 1 untouched. Determinism preserved. Gated by CMPSBL_KERNEL_ENABLED.',
  priceCents: 0,
  tsCode: RUNTIME_ENVELOPE_TS,
  pyCode: RUNTIME_ENVELOPE_PY,
  autoWire: {
    wrapperName: 'cmpsbl_chain',
    behavior:
      'Initializes the runtime envelope contract at module load. Layers compose via cmpsbl_chain(input, preLayers, execute, postLayers) with deterministic phase ordering. Short-circuits on ctx.blocked (any pre-exec phase) or ctx.override (skip Layer 1, still run post-observers). Every layer mutates the shared ctx and records an action — the actions log is the proof-of-firing trail.',
    tsWire: RUNTIME_ENVELOPE_WIRE_TS,
    pyWire: RUNTIME_ENVELOPE_WIRE_PY,
  },
};

export { RUNTIME_ENVELOPE_CORE };
