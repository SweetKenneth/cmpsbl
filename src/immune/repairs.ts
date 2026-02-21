/**
 * Executor Immune Pilot — Repair Registry
 * Scope-safe repairs for INCLUSIVE pilot executors
 * 
 * HARD RULE: If repair would require calling other modules
 * or modifying DB schema => return null and escalate.
 */

import type { RepairResult } from './types';

type RepairFn = (
  input: Record<string, unknown>,
  ctx: Record<string, unknown>,
  error?: string,
) => RepairResult | null;

const repairRegistry = new Map<string, RepairFn>();

/**
 * Register a repair function for a scope
 */
export function registerRepair(scope: string, fn: RepairFn): void {
  repairRegistry.set(scope, fn);
}

/**
 * Attempt repair for the given scope. Returns null if out-of-scope.
 */
export function repair(
  scope: string,
  input: Record<string, unknown>,
  ctx: Record<string, unknown>,
  error?: string,
): RepairResult | null {
  const fn = repairRegistry.get(scope);
  if (!fn) return null;
  try {
    return fn(input, ctx, error);
  } catch {
    return null; // repair itself failed — escalate
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PILOT REPAIRS — INCLUSIVE scope only
// ═══════════════════════════════════════════════════════════════════════════

/** Generic string sanitizer */
function sanitizeString(val: unknown, fallback = ''): string {
  if (typeof val === 'string') return val.trim().slice(0, 10_000);
  if (val === null || val === undefined) return fallback;
  return String(val).trim().slice(0, 10_000);
}

/** Clamp number to safe range */
function clampNumber(val: unknown, min: number, max: number, fallback: number): number {
  if (typeof val === 'number' && !Number.isNaN(val)) return Math.min(max, Math.max(min, val));
  const n = Number(val);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** Ensure boolean */
function ensureBool(val: unknown, fallback = false): boolean {
  if (typeof val === 'boolean') return val;
  if (val === 'true' || val === 1) return true;
  if (val === 'false' || val === 0) return false;
  return fallback;
}

// ── adaptive-ui ──
registerRepair('adaptive-ui', (input) => {
  const repaired = { ...input };
  let notes: string[] = [];

  // Default missing locator fields
  if (!input.target && !input.url && !input.resource_id) {
    repaired.target = 'self';
    notes.push('defaulted target to self');
  }

  // Sanitize target if present but wrong type or dirty
  if (input.target !== undefined) {
    if (typeof input.target !== 'string') {
      repaired.target = 'self';
      notes.push('coerced non-string target to self');
    } else {
      repaired.target = sanitizeString(input.target, 'self');
      if (repaired.target === '') { repaired.target = 'self'; notes.push('empty target defaulted to self'); }
      else if (repaired.target !== input.target) notes.push('sanitized target');
    }
  }

  // Sanitize url if present
  if (input.url !== undefined) {
    if (typeof input.url !== 'string') {
      delete repaired.url;
      notes.push('removed non-string url');
    } else {
      repaired.url = sanitizeString(input.url);
      if (repaired.url !== input.url) notes.push('sanitized url');
    }
  }

  // Sanitize resource_id
  if (input.resource_id !== undefined) {
    if (typeof input.resource_id !== 'string') {
      delete repaired.resource_id;
      notes.push('removed non-string resource_id');
    } else {
      repaired.resource_id = sanitizeString(input.resource_id);
      if (repaired.resource_id !== input.resource_id) notes.push('sanitized resource_id');
    }
  }

  // Sanitize content if present
  if (input.content !== undefined) {
    if (typeof input.content !== 'string') {
      repaired.content = typeof input.content === 'object' ? JSON.stringify(input.content).slice(0, 10_000) : String(input.content).slice(0, 10_000);
      notes.push('coerced non-string content');
    } else {
      repaired.content = sanitizeString(input.content);
      if (repaired.content !== input.content) notes.push('sanitized content');
    }
  }

  // Mark as repaired for fast-path
  if (notes.length > 0) {
    repaired.__repaired = true;
  }

  return notes.length > 0
    ? { repairedInput: repaired, note: notes.join('; ') }
    : null;
});

// ── cognitive-load-optimization ──
registerRepair('cognitive-load-optimization', (input) => {
  const repaired = { ...input };
  let notes: string[] = [];

  // Handle missing / null / empty content
  if (input.content === undefined || input.content === null || input.content === '') {
    repaired.content = '[empty content]';
    notes.push('filled empty content');
  } else if (typeof input.content !== 'string') {
    // Coerce non-string content (numbers, booleans, arrays, objects)
    if (Array.isArray(input.content)) {
      repaired.content = input.content.map(String).join(', ').slice(0, 10_000);
      notes.push('coerced array content to string');
    } else if (typeof input.content === 'object') {
      repaired.content = JSON.stringify(input.content).slice(0, 10_000);
      notes.push('coerced object content to string');
    } else {
      repaired.content = String(input.content).slice(0, 10_000);
      notes.push('coerced non-string content');
    }
  } else {
    repaired.content = sanitizeString(input.content);
    if (repaired.content !== input.content) notes.push('sanitized content string');
  }

  // Default missing target/url
  if (!input.target && !input.url && !input.resource_id) {
    repaired.target = 'self';
    notes.push('defaulted target to self');
  }

  // Sanitize target if wrong type
  if (input.target !== undefined && typeof input.target !== 'string') {
    repaired.target = 'self';
    notes.push('coerced non-string target');
  }

  // Clamp priority if present
  if (input.priority !== undefined) {
    repaired.priority = clampNumber(input.priority, 0, 100, 50);
    if (repaired.priority !== input.priority) notes.push('clamped priority');
  }

  // Mark as repaired for fast-path
  if (notes.length > 0) {
    repaired.__repaired = true;
  }

  return notes.length > 0
    ? { repairedInput: repaired, note: notes.join('; ') }
    : null;
});

// ── comprehensive-accessibility-audit ──
registerRepair('comprehensive-accessibility-audit', (input) => {
  const repaired = { ...input };
  let notes: string[] = [];

  // Normalize WCAG level
  if (input.wcagLevel !== undefined) {
    const level = sanitizeString(input.wcagLevel).toUpperCase();
    if (!['A', 'AA', 'AAA'].includes(level)) {
      repaired.wcagLevel = 'AA';
      notes.push('defaulted wcagLevel to AA');
    } else {
      repaired.wcagLevel = level;
    }
  }

  // Ensure target exists
  if (!input.url && !input.target && !input.domain) {
    repaired.target = 'self';
    notes.push('defaulted target to self');
  }

  return notes.length > 0
    ? { repairedInput: repaired, note: notes.join('; ') }
    : null;
});

// ── personalized-accessibility-engine ──
registerRepair('personalized-accessibility-engine', (input) => {
  const repaired = { ...input };
  let notes: string[] = [];

  if (input.preferences !== undefined && !Array.isArray(input.preferences) && typeof input.preferences !== 'object') {
    repaired.preferences = {};
    notes.push('reset invalid preferences to empty object');
  }

  if (input.userId !== undefined) {
    repaired.userId = sanitizeString(input.userId);
    if (repaired.userId !== input.userId) notes.push('sanitized userId');
  }

  return notes.length > 0
    ? { repairedInput: repaired, note: notes.join('; ') }
    : null;
});

// ── inclusive-content ──
registerRepair('inclusive-content', (input) => {
  const repaired = { ...input };
  let notes: string[] = [];

  if (input.content === undefined || input.content === null) {
    repaired.content = '';
    notes.push('defaulted null content to empty string');
  } else {
    repaired.content = sanitizeString(input.content);
    if (repaired.content !== input.content) notes.push('sanitized content');
  }

  // Normalize aria-related fields
  if (input.ariaLabel !== undefined && input.ariaLabel === null) {
    repaired.ariaLabel = '';
    notes.push('defaulted null ariaLabel');
  }

  return notes.length > 0
    ? { repairedInput: repaired, note: notes.join('; ') }
    : null;
});
