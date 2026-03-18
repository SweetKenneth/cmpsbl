/**
 * CMPSBL® Primitive Defaults — Bootstrap Handlers
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Safe, deterministic default handlers that seed the primitive registry
 * on boot. These provide baseline execution capability for common
 * extraction patterns before user-specific primitives are loaded.
 *
 * © CMPSBL® — All rights reserved.
 */

import { registerPrimitive } from './primitive-registry';

// ─── Identity pass-through ───────────────────────────────────────────────────

function identity(input: unknown): unknown {
  return input;
}

// ─── Numeric diff (bid/ask spread) ───────────────────────────────────────────

function numericDiff(input: unknown): unknown {
  if (!input || typeof input !== 'object') return null;
  const obj = input as Record<string, unknown>;
  if ('bid' in obj && 'ask' in obj) {
    const bid = Number(obj.bid);
    const ask = Number(obj.ask);
    if (!isNaN(bid) && !isNaN(ask)) return bid - ask;
  }
  return null;
}

// ─── Key extraction ──────────────────────────────────────────────────────────

function extractKeys(input: unknown): string[] {
  if (typeof input !== 'object' || input === null) return [];
  return Object.keys(input);
}

// ─── Type classifier ─────────────────────────────────────────────────────────

function classifyType(input: unknown): string {
  if (input === null) return 'null';
  if (Array.isArray(input)) return 'array';
  return typeof input;
}

// ─── Safe merge ──────────────────────────────────────────────────────────────

function safeMerge(input: unknown, context?: unknown): unknown {
  if (typeof input !== 'object' || input === null) return input;
  if (typeof context !== 'object' || context === null) return input;
  return { ...input as Record<string, unknown>, ...context as Record<string, unknown> };
}

// ─── Register all defaults ───────────────────────────────────────────────────

export function registerDefaults(): void {
  registerPrimitive({
    id: 'primitive.identity',
    name: 'identity',
    category: 'transformation',
    handler: identity,
    source: 'native',
  });

  registerPrimitive({
    id: 'primitive.diff',
    name: 'resolveArbitrageSpread',
    category: 'computation',
    handler: numericDiff,
    source: 'native',
  });

  registerPrimitive({
    id: 'primitive.extract_keys',
    name: 'extractSignals',
    category: 'analysis',
    handler: extractKeys,
    source: 'native',
  });

  registerPrimitive({
    id: 'primitive.classify_type',
    name: 'classifyType',
    category: 'analysis',
    handler: classifyType,
    source: 'native',
  });

  registerPrimitive({
    id: 'primitive.safe_merge',
    name: 'safeMerge',
    category: 'transformation',
    handler: safeMerge,
    source: 'native',
  });
}

// Auto-register on import
registerDefaults();
