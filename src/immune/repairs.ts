/**
 * IMMUNITY — Repair Registry
 * Scope-safe repairs for all executor categories
 * (INCLUSIVE, COGNITIVE, OPERATIONAL, ORCHESTRATOR, INFRASTRUCTURE, INTELLIGENCE)
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

// ═══════════════════════════════════════════════════════════════════════════
// COGNITIVE MODULE REPAIRS
// ═══════════════════════════════════════════════════════════════════════════

registerRepair('reasoning-engine', (input) => {
  const repaired = { ...input };
  const notes: string[] = [];
  if (!input.query || typeof input.query !== 'string') {
    repaired.query = typeof input.query === 'number' ? String(input.query) : 'default query';
    notes.push('defaulted/coerced query');
  } else { repaired.query = sanitizeString(input.query); if (repaired.query !== input.query) notes.push('sanitized query'); }
  if (input.constraints !== undefined && typeof input.constraints !== 'object') { repaired.constraints = {}; notes.push('reset invalid constraints'); }
  if (input.depth !== undefined) { repaired.depth = clampNumber(input.depth, 1, 10, 3); if (repaired.depth !== input.depth) notes.push('clamped depth'); }
  if (notes.length > 0) repaired.__repaired = true;
  return notes.length > 0 ? { repairedInput: repaired, note: notes.join('; ') } : null;
});

registerRepair('learning-engine', (input) => {
  const repaired = { ...input };
  const notes: string[] = [];
  if (!input.signal || typeof input.signal !== 'string') {
    repaired.signal = typeof input.signal === 'number' ? String(input.signal) : 'default signal';
    notes.push('defaulted/coerced signal');
  } else { repaired.signal = sanitizeString(input.signal); if (repaired.signal !== input.signal) notes.push('sanitized signal'); }
  if (input.feedback !== undefined && typeof input.feedback !== 'object') { repaired.feedback = {}; notes.push('reset invalid feedback'); }
  if (input.reinforcement !== undefined) { repaired.reinforcement = clampNumber(input.reinforcement, 0, 1, 0.5); if (repaired.reinforcement !== input.reinforcement) notes.push('clamped reinforcement'); }
  if (notes.length > 0) repaired.__repaired = true;
  return notes.length > 0 ? { repairedInput: repaired, note: notes.join('; ') } : null;
});

registerRepair('imagination-engine', (input) => {
  const repaired = { ...input };
  const notes: string[] = [];
  if (!input.prompt || typeof input.prompt !== 'string') {
    repaired.prompt = typeof input.prompt === 'number' ? String(input.prompt) : 'default prompt';
    notes.push('defaulted/coerced prompt');
  } else { repaired.prompt = sanitizeString(input.prompt); if (repaired.prompt !== input.prompt) notes.push('sanitized prompt'); }
  if (input.mode !== undefined && typeof input.mode !== 'string') { repaired.mode = 'GENERATE'; notes.push('defaulted mode'); }
  if (input.creativity !== undefined) { repaired.creativity = clampNumber(input.creativity, 0, 1, 0.7); if (repaired.creativity !== input.creativity) notes.push('clamped creativity'); }
  if (input.constraints !== undefined && typeof input.constraints !== 'object') { repaired.constraints = {}; notes.push('reset invalid constraints'); }
  if (notes.length > 0) repaired.__repaired = true;
  return notes.length > 0 ? { repairedInput: repaired, note: notes.join('; ') } : null;
});

// ═══════════════════════════════════════════════════════════════════════════
// OPERATIONAL MODULE REPAIRS
// ═══════════════════════════════════════════════════════════════════════════

registerRepair('relay-event-dispatcher', (input) => {
  const repaired = { ...input };
  const notes: string[] = [];
  if (!input.event || typeof input.event !== 'string') {
    repaired.event = typeof input.event === 'number' ? String(input.event) : 'system.default';
    notes.push('defaulted/coerced event');
  } else { repaired.event = sanitizeString(input.event); if (repaired.event !== input.event) notes.push('sanitized event'); }
  if (input.payload !== undefined && typeof input.payload !== 'object') { repaired.payload = {}; notes.push('reset invalid payload'); }
  if (input.priority !== undefined) { repaired.priority = clampNumber(input.priority, 0, 10, 1); if (repaired.priority !== input.priority) notes.push('clamped priority'); }
  if (notes.length > 0) repaired.__repaired = true;
  return notes.length > 0 ? { repairedInput: repaired, note: notes.join('; ') } : null;
});

registerRepair('economy-cost-tracker', (input) => {
  const repaired = { ...input };
  const notes: string[] = [];
  if (!input.action || typeof input.action !== 'string') {
    repaired.action = typeof input.action === 'number' ? String(input.action) : 'compute';
    notes.push('defaulted/coerced action');
  } else { repaired.action = sanitizeString(input.action); if (repaired.action !== input.action) notes.push('sanitized action'); }
  if (!input.module || typeof input.module !== 'string') {
    repaired.module = typeof input.module === 'number' ? String(input.module) : 'unknown';
    notes.push('defaulted/coerced module');
  } else { repaired.module = sanitizeString(input.module); if (repaired.module !== input.module) notes.push('sanitized module'); }
  if (input.tokens !== undefined) { repaired.tokens = clampNumber(input.tokens, 0, 1000000, 0); if (repaired.tokens !== input.tokens) notes.push('clamped tokens'); }
  if (input.costMillicents !== undefined) { repaired.costMillicents = clampNumber(input.costMillicents, 0, 10000000, 0); if (repaired.costMillicents !== input.costMillicents) notes.push('clamped costMillicents'); }
  if (notes.length > 0) repaired.__repaired = true;
  return notes.length > 0 ? { repairedInput: repaired, note: notes.join('; ') } : null;
});

registerRepair('audit-compliance-check', (input) => {
  const repaired = { ...input };
  const notes: string[] = [];
  if (!input.content || typeof input.content !== 'string') {
    repaired.content = typeof input.content === 'number' ? String(input.content) : 'audit target';
    notes.push('defaulted/coerced content');
  } else { repaired.content = sanitizeString(input.content); if (repaired.content !== input.content) notes.push('sanitized content'); }
  if (input.standard !== undefined) {
    const std = sanitizeString(input.standard).toUpperCase();
    if (!['WCAG', 'ADA', 'GDPR', 'SOC2', 'GENERAL'].includes(std)) { repaired.standard = 'GENERAL'; notes.push('defaulted standard'); }
    else repaired.standard = std;
  }
  if (input.severity !== undefined && typeof input.severity !== 'string') { repaired.severity = 'MEDIUM'; notes.push('defaulted severity'); }
  if (notes.length > 0) repaired.__repaired = true;
  return notes.length > 0 ? { repairedInput: repaired, note: notes.join('; ') } : null;
});

// ═══════════════════════════════════════════════════════════════════════════
// ORCHESTRATOR MODULE REPAIRS
// ═══════════════════════════════════════════════════════════════════════════

registerRepair('mesh-pipeline-resolver', (input) => {
  const repaired = { ...input };
  const notes: string[] = [];
  if (!input.intent || typeof input.intent !== 'string') {
    repaired.intent = typeof input.intent === 'number' ? String(input.intent) : 'resolve pipeline';
    notes.push('defaulted/coerced intent');
  } else { repaired.intent = sanitizeString(input.intent); if (repaired.intent !== input.intent) notes.push('sanitized intent'); }
  if (input.modules !== undefined && !Array.isArray(input.modules)) { repaired.modules = []; notes.push('reset invalid modules'); }
  if (input.constraints !== undefined && typeof input.constraints !== 'object') { repaired.constraints = {}; notes.push('reset invalid constraints'); }
  if (notes.length > 0) repaired.__repaired = true;
  return notes.length > 0 ? { repairedInput: repaired, note: notes.join('; ') } : null;
});

registerRepair('seba-proposal-evaluator', (input) => {
  const repaired = { ...input };
  const notes: string[] = [];
  if (!input.proposal || typeof input.proposal !== 'string') {
    repaired.proposal = typeof input.proposal === 'number' ? String(input.proposal) : 'default proposal';
    notes.push('defaulted/coerced proposal');
  } else { repaired.proposal = sanitizeString(input.proposal); if (repaired.proposal !== input.proposal) notes.push('sanitized proposal'); }
  if (input.riskLevel !== undefined) {
    const rl = sanitizeString(input.riskLevel).toUpperCase();
    if (!['LOW', 'MEDIUM', 'HIGH'].includes(rl)) { repaired.riskLevel = 'MEDIUM'; notes.push('defaulted riskLevel'); }
    else repaired.riskLevel = rl;
  }
  if (input.impactMetrics !== undefined && typeof input.impactMetrics !== 'object') { repaired.impactMetrics = {}; notes.push('reset invalid impactMetrics'); }
  if (input.confidence !== undefined) { repaired.confidence = clampNumber(input.confidence, 0, 1, 0.5); if (repaired.confidence !== input.confidence) notes.push('clamped confidence'); }
  if (notes.length > 0) repaired.__repaired = true;
  return notes.length > 0 ? { repairedInput: repaired, note: notes.join('; ') } : null;
});

// ═══════════════════════════════════════════════════════════════════════════
// INFRASTRUCTURE MODULE REPAIRS
// ═══════════════════════════════════════════════════════════════════════════

registerRepair('memory-consolidation-engine', (input) => {
  const repaired = { ...input };
  const notes: string[] = [];
  if (!input.content || typeof input.content !== 'string') { repaired.content = 'consolidation target'; notes.push('defaulted content'); }
  if (!input.userId || typeof input.userId !== 'string') { repaired.userId = 'anonymous'; notes.push('defaulted userId'); }
  if (input.action !== undefined && typeof input.action !== 'string') { repaired.action = 'CONSOLIDATE'; notes.push('defaulted action'); }
  if (notes.length > 0) repaired.__repaired = true;
  return notes.length > 0 ? { repairedInput: repaired, note: notes.join('; ') } : null;
});

registerRepair('identity-verification-engine', (input) => {
  const repaired = { ...input };
  const notes: string[] = [];
  if (!input.userId || typeof input.userId !== 'string') { repaired.userId = 'anonymous'; notes.push('defaulted userId'); }
  if (!input.action || typeof input.action !== 'string') { repaired.action = 'verify'; notes.push('defaulted action'); }
  if (notes.length > 0) repaired.__repaired = true;
  return notes.length > 0 ? { repairedInput: repaired, note: notes.join('; ') } : null;
});

registerRepair('sandbox-isolation-guard', (input) => {
  const repaired = { ...input };
  const notes: string[] = [];
  if (!input.content || typeof input.content !== 'string') { repaired.content = 'isolation test'; notes.push('defaulted content'); }
  if (!input.target || typeof input.target !== 'string') { repaired.target = 'sandbox'; notes.push('defaulted target'); }
  if (notes.length > 0) repaired.__repaired = true;
  return notes.length > 0 ? { repairedInput: repaired, note: notes.join('; ') } : null;
});

registerRepair('encode-task-scheduler', (input) => {
  const repaired = { ...input };
  const notes: string[] = [];
  if (!input.action || typeof input.action !== 'string') { repaired.action = 'schedule'; notes.push('defaulted action'); }
  if (input.priority !== undefined) { repaired.priority = clampNumber(input.priority, 0, 10, 1); if (repaired.priority !== input.priority) notes.push('clamped priority'); }
  if (notes.length > 0) repaired.__repaired = true;
  return notes.length > 0 ? { repairedInput: repaired, note: notes.join('; ') } : null;
});

// ═══════════════════════════════════════════════════════════════════════════
// INTELLIGENCE MODULE REPAIRS
// ═══════════════════════════════════════════════════════════════════════════

registerRepair('dream-pattern-synthesizer', (input) => {
  const repaired = { ...input };
  const notes: string[] = [];
  if (!input.prompt || typeof input.prompt !== 'string') { repaired.prompt = 'synthesize pattern'; notes.push('defaulted prompt'); }
  if (input.mode !== undefined && typeof input.mode !== 'string') { repaired.mode = 'SYNTHESIZE'; notes.push('defaulted mode'); }
  if (notes.length > 0) repaired.__repaired = true;
  return notes.length > 0 ? { repairedInput: repaired, note: notes.join('; ') } : null;
});

registerRepair('decode-intent-classifier', (input) => {
  const repaired = { ...input };
  const notes: string[] = [];
  if (!input.content || typeof input.content !== 'string') { repaired.content = 'classify intent'; notes.push('defaulted content'); }
  if (input.context !== undefined && typeof input.context !== 'object') { repaired.context = {}; notes.push('reset invalid context'); }
  if (notes.length > 0) repaired.__repaired = true;
  return notes.length > 0 ? { repairedInput: repaired, note: notes.join('; ') } : null;
});

registerRepair('vision-anomaly-detector', (input) => {
  const repaired = { ...input };
  const notes: string[] = [];
  if (!input.content || typeof input.content !== 'string') { repaired.content = 'detect anomalies'; notes.push('defaulted content'); }
  if (!input.target || typeof input.target !== 'string') { repaired.target = 'metrics'; notes.push('defaulted target'); }
  if (input.threshold !== undefined) { repaired.threshold = clampNumber(input.threshold, 0, 1, 0.5); if (repaired.threshold !== input.threshold) notes.push('clamped threshold'); }
  if (notes.length > 0) repaired.__repaired = true;
  return notes.length > 0 ? { repairedInput: repaired, note: notes.join('; ') } : null;
});
