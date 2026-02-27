/**
 * ENCODE Error-Pattern Library
 * Crown Jewel Capability
 * 
 * CLM Request: ENCODE module identified need to map and learn from failed task chains,
 * building a persistent library of error patterns to prevent repeat failures.
 * 
 * Resolution: Error fingerprinting, pattern clustering, failure-chain tracing,
 * and proactive prevention via pattern matching on new task submissions.
 * 
 * Tier: Pro (Pattern lookup), Enterprise (Prevention engine), CMPSBL (Meta-learning)
 */

import { emit } from '../events';
import type { EncodeTaskResult, EncodeTaskPacket } from '../encode-module/index';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ErrorPattern {
  id: string;
  fingerprint: string;
  category: ErrorCategory;
  description: string;
  frequency: number;
  firstSeen: string;
  lastSeen: string;
  affectedSurfaces: string[];
  rootCause?: string;
  resolution?: string;
  preventionRule?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  learnings: string[];
  relatedPatterns: string[];
}

export type ErrorCategory =
  | 'type_error'
  | 'import_failure'
  | 'schema_mismatch'
  | 'permission_denied'
  | 'timeout'
  | 'resource_exhaustion'
  | 'circular_dependency'
  | 'validation_failure'
  | 'runtime_exception'
  | 'network_error'
  | 'unknown';

export interface ErrorChain {
  chainId: string;
  taskIds: string[];
  rootPatternId: string;
  cascadeDepth: number;
  totalFailures: number;
  timestamp: string;
}

export interface PreventionCheck {
  safe: boolean;
  matchedPatterns: ErrorPattern[];
  riskScore: number;
  recommendations: string[];
}

// ─── State ───────────────────────────────────────────────────────────────────

const patterns = new Map<string, ErrorPattern>();
const chains: ErrorChain[] = [];
let patternIdCounter = 0;

// ─── Error Fingerprinting ────────────────────────────────────────────────────

/**
 * Generate a fingerprint from an error/failure
 */
function generateFingerprint(error: string, surface?: string): string {
  // Normalize: strip IDs, timestamps, paths, line numbers
  const normalized = error
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<UUID>')
    .replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z?/g, '<TIMESTAMP>')
    .replace(/\/[^\s]+\.(ts|tsx|js|jsx)/g, '<FILE>')
    .replace(/line \d+/gi, 'line <N>')
    .replace(/:\d+:\d+/g, ':<N>:<N>')
    .toLowerCase()
    .trim();

  // Simple hash
  let hash = 0;
  const input = `${surface || 'unknown'}::${normalized}`;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `ep-${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

/**
 * Classify an error into a category
 */
function classifyError(error: string): ErrorCategory {
  const lower = error.toLowerCase();
  if (lower.includes('type') && (lower.includes('error') || lower.includes('mismatch'))) return 'type_error';
  if (lower.includes('import') || lower.includes('module not found') || lower.includes('cannot find')) return 'import_failure';
  if (lower.includes('schema') || lower.includes('column') || lower.includes('relation')) return 'schema_mismatch';
  if (lower.includes('permission') || lower.includes('denied') || lower.includes('unauthorized')) return 'permission_denied';
  if (lower.includes('timeout') || lower.includes('timed out')) return 'timeout';
  if (lower.includes('memory') || lower.includes('quota') || lower.includes('limit')) return 'resource_exhaustion';
  if (lower.includes('circular') || lower.includes('cycle')) return 'circular_dependency';
  if (lower.includes('valid') || lower.includes('constraint')) return 'validation_failure';
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('connection')) return 'network_error';
  if (lower.includes('error') || lower.includes('exception')) return 'runtime_exception';
  return 'unknown';
}

// ─── Core Engine ─────────────────────────────────────────────────────────────

/**
 * Record a failed task and extract/update error patterns
 */
export function recordFailure(
  taskResult: EncodeTaskResult,
  errorMessage: string,
  surface?: string
): ErrorPattern {
  const fingerprint = generateFingerprint(errorMessage, surface);

  let pattern = patterns.get(fingerprint);

  if (pattern) {
    // Update existing pattern
    pattern.frequency++;
    pattern.lastSeen = new Date().toISOString();
    if (surface && !pattern.affectedSurfaces.includes(surface)) {
      pattern.affectedSurfaces.push(surface);
    }
    if (taskResult.learnings.length > 0) {
      pattern.learnings.push(...taskResult.learnings.filter(l => !pattern!.learnings.includes(l)));
    }
    // Escalate severity based on frequency
    if (pattern.frequency >= 10) pattern.severity = 'critical';
    else if (pattern.frequency >= 5) pattern.severity = 'high';
    else if (pattern.frequency >= 3) pattern.severity = 'medium';
  } else {
    // Create new pattern
    pattern = {
      id: `epl-${++patternIdCounter}`,
      fingerprint,
      category: classifyError(errorMessage),
      description: errorMessage.substring(0, 200),
      frequency: 1,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      affectedSurfaces: surface ? [surface] : [],
      learnings: [...taskResult.learnings],
      severity: 'low',
      relatedPatterns: [],
    };
    patterns.set(fingerprint, pattern);
  }

  // Find related patterns (same category)
  for (const [fp, p] of patterns) {
    if (fp !== fingerprint && p.category === pattern.category && !pattern.relatedPatterns.includes(p.id)) {
      pattern.relatedPatterns.push(p.id);
      if (pattern.relatedPatterns.length >= 5) break;
    }
  }

  emit({
    module: 'encode',
    event_type: 'error_pattern_recorded',
    outcome: 'succeeded',
    data: { patternId: pattern.id, fingerprint, category: pattern.category, frequency: pattern.frequency },
  });

  return pattern;
}

/**
 * Record a failure chain (multiple related failures)
 */
export function recordChain(taskIds: string[], rootError: string, surface?: string): ErrorChain {
  const fingerprint = generateFingerprint(rootError, surface);
  const rootPattern = patterns.get(fingerprint);

  const chain: ErrorChain = {
    chainId: `chain-${Date.now().toString(36)}`,
    taskIds,
    rootPatternId: rootPattern?.id || 'unknown',
    cascadeDepth: taskIds.length,
    totalFailures: taskIds.length,
    timestamp: new Date().toISOString(),
  };

  chains.push(chain);
  if (chains.length > 100) chains.shift();

  return chain;
}

/**
 * Check a new task against known error patterns for prevention
 */
export function checkPrevention(task: Partial<EncodeTaskPacket>): PreventionCheck {
  const matchedPatterns: ErrorPattern[] = [];
  let riskScore = 0;
  const recommendations: string[] = [];

  for (const pattern of patterns.values()) {
    // Check surface match
    if (task.targetSurface && pattern.affectedSurfaces.includes(task.targetSurface)) {
      matchedPatterns.push(pattern);
      riskScore += pattern.severity === 'critical' ? 40 : pattern.severity === 'high' ? 25 : pattern.severity === 'medium' ? 15 : 5;

      if (pattern.resolution) {
        recommendations.push(`Known issue (${pattern.category}): ${pattern.resolution}`);
      }
      if (pattern.preventionRule) {
        recommendations.push(`Prevention: ${pattern.preventionRule}`);
      }
    }

    // Check intent similarity (simple keyword match)
    if (task.intentSummary && pattern.description) {
      const intentWords = task.intentSummary.toLowerCase().split(/\s+/);
      const patternWords = pattern.description.toLowerCase().split(/\s+/);
      const overlap = intentWords.filter(w => patternWords.includes(w)).length;
      if (overlap >= 3) {
        if (!matchedPatterns.includes(pattern)) {
          matchedPatterns.push(pattern);
          riskScore += 10;
        }
      }
    }
  }

  riskScore = Math.min(100, riskScore);

  return {
    safe: riskScore < 50,
    matchedPatterns,
    riskScore,
    recommendations: recommendations.length > 0 ? recommendations : ['No known patterns matched. Proceed with standard safeguards.'],
  };
}

/**
 * Add a resolution to a known pattern
 */
export function addResolution(patternId: string, resolution: string, preventionRule?: string): boolean {
  for (const pattern of patterns.values()) {
    if (pattern.id === patternId) {
      pattern.resolution = resolution;
      if (preventionRule) pattern.preventionRule = preventionRule;
      return true;
    }
  }
  return false;
}

/**
 * Get all known patterns
 */
export function getPatterns(options?: { category?: ErrorCategory; minFrequency?: number; severity?: string }): ErrorPattern[] {
  let result = Array.from(patterns.values());

  if (options?.category) result = result.filter(p => p.category === options.category);
  if (options?.minFrequency) result = result.filter(p => p.frequency >= options.minFrequency!);
  if (options?.severity) result = result.filter(p => p.severity === options.severity);

  return result.sort((a, b) => b.frequency - a.frequency);
}

/**
 * Get error pattern library stats
 */
export function getLibraryStats(): {
  totalPatterns: number;
  totalChains: number;
  topCategories: Array<{ category: ErrorCategory; count: number }>;
  criticalPatterns: number;
  resolvedPatterns: number;
} {
  const categoryMap = new Map<ErrorCategory, number>();
  let criticalCount = 0;
  let resolvedCount = 0;

  for (const pattern of patterns.values()) {
    categoryMap.set(pattern.category, (categoryMap.get(pattern.category) || 0) + 1);
    if (pattern.severity === 'critical') criticalCount++;
    if (pattern.resolution) resolvedCount++;
  }

  const topCategories = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalPatterns: patterns.size,
    totalChains: chains.length,
    topCategories,
    criticalPatterns: criticalCount,
    resolvedPatterns: resolvedCount,
  };
}
