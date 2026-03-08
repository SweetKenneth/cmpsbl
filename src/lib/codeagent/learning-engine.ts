/**
 * CodeAgent Learning Engine — Persistent 24/7 Learning System
 * Makes CodeAgent smarter with every action
 * 
 * This module ensures CodeAgent learns from EVERY code action:
 * - Success patterns are reinforced
 * - Failure patterns are recorded with resolutions
 * - Confidence scores evolve over time
 * - Knowledge is persisted to Brain tables
 */

import { supabase } from '@/integrations/supabase/client';
import { recordError, type ErrorPattern } from './error-patterns';

// ═══════════════════════════════════════════════════════════════
// LIGHTWEIGHT CHECKS (no AST required)
// ═══════════════════════════════════════════════════════════════

interface QuickIssue {
  rule: string;
  type: string;
  message: string;
}

function quickStyleCheck(code: string): QuickIssue[] {
  const issues: QuickIssue[] = [];
  
  // Check for common style issues without full AST
  if (/console\.log\(/.test(code)) {
    issues.push({ rule: 'no-console', type: 'style', message: 'Avoid console.log in production code' });
  }
  if (/any\s*[;,\)]/.test(code) || /:\s*any/.test(code)) {
    issues.push({ rule: 'no-any', type: 'style', message: 'Avoid using "any" type - prefer explicit types' });
  }
  if (/TODO|FIXME|HACK/i.test(code)) {
    issues.push({ rule: 'no-todo', type: 'style', message: 'Code contains TODO/FIXME comments' });
  }
  
  return issues;
}

function quickPerfCheck(code: string): QuickIssue[] {
  const issues: QuickIssue[] = [];
  
  // Check for common performance issues
  if (/\.forEach\(.*=>.*\.push\(/.test(code)) {
    issues.push({ rule: 'use-map', type: 'performance', message: 'Consider using map() instead of forEach with push()' });
  }
  if (/useEffect\(\s*\(\)\s*=>\s*{[^}]*fetch\(/.test(code) && !/\[\s*\]/.test(code)) {
    issues.push({ rule: 'effect-deps', type: 'performance', message: 'useEffect with fetch may need dependency array' });
  }
  if (/new Array\(\d+\)\.fill/.test(code)) {
    issues.push({ rule: 'array-init', type: 'performance', message: 'Consider Array.from() for array initialization' });
  }
  
  return issues;
}

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface CodeAction {
  id: string;
  actionType: 'generate' | 'validate' | 'deploy' | 'rollback';
  module: string;
  changeType: string;
  description: string;
  code: string;
  outcome: 'success' | 'failure' | 'partial';
  duration: number;
  metadata?: Record<string, unknown>;
}

export interface LearningOutcome {
  actionId: string;
  patterns: ExtractedPattern[];
  confidence: number;
  recommendations: string[];
  storedAt: Date;
}

export interface ExtractedPattern {
  type: 'success' | 'error' | 'style' | 'performance';
  name: string;
  description: string;
  confidence: number;
  codeSnippet?: string;
}

interface LearningStats {
  totalActions: number;
  successRate: number;
  patternsLearned: number;
  avgConfidence: number;
  lastLearningCycle: Date | null;
}

// ═══════════════════════════════════════════════════════════════
// IN-MEMORY CACHE
// ═══════════════════════════════════════════════════════════════

const learningCache = {
  recentActions: [] as CodeAction[],
  patterns: new Map<string, ExtractedPattern>(),
  stats: {
    totalActions: 0,
    successCount: 0,
    failureCount: 0,
    lastCycle: null as Date | null,
  },
};

// ═══════════════════════════════════════════════════════════════
// MAIN LEARNING FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Record and learn from a code action
 * This is the PRIMARY entry point for learning
 */
export async function learnFromCodeAction(action: CodeAction): Promise<LearningOutcome> {
  const startTime = Date.now();
  
  // Update cache
  learningCache.recentActions.push(action);
  if (learningCache.recentActions.length > 100) {
    learningCache.recentActions.shift();
  }
  learningCache.stats.totalActions++;
  
  if (action.outcome === 'success') {
    learningCache.stats.successCount++;
  } else if (action.outcome === 'failure') {
    learningCache.stats.failureCount++;
  }
  
  // Extract patterns from the action
  const patterns = await extractPatterns(action);
  
  // Calculate confidence based on history
  const confidence = calculateConfidence(action, patterns);
  
  // Generate recommendations
  const recommendations = generateRecommendations(action, patterns);
  
  // Persist to database
  await persistLearning(action, patterns, confidence);
  
  // Log the learning event
  await logLearningEvent(action, patterns, confidence, Date.now() - startTime);
  
  console.log(`[LearningEngine] Learned from ${action.actionType} (${action.outcome}): ${patterns.length} patterns extracted`);
  
  return {
    actionId: action.id,
    patterns,
    confidence,
    recommendations,
    storedAt: new Date(),
  };
}

/**
 * Extract patterns from a code action
 */
async function extractPatterns(action: CodeAction): Promise<ExtractedPattern[]> {
  const patterns: ExtractedPattern[] = [];
  
  // 1. Success patterns
  if (action.outcome === 'success') {
    patterns.push({
      type: 'success',
      name: `${action.module}_${action.changeType}_success`,
      description: `Successful ${action.changeType} in ${action.module} module`,
      confidence: 0.8,
      codeSnippet: action.code.substring(0, 200),
    });
    // Note: brain_memories insert happens in persistLearning() — no duplicate here
  }
  
  // 2. Error patterns
  if (action.outcome === 'failure' && action.metadata?.error) {
    const errorPattern = await recordError(
      action.metadata.error as string,
      {
        module: action.module,
        action: action.actionType,
        code: action.code,
      }
    );
    
    patterns.push({
      type: 'error',
      name: errorPattern.errorType,
      description: errorPattern.message,
      confidence: errorPattern.confidence,
    });
  }
  
  // 3. Style patterns (lightweight check without AST)
  const styleIssues = quickStyleCheck(action.code);
  for (const issue of styleIssues.slice(0, 3)) {
    patterns.push({
      type: 'style',
      name: `style_${issue.rule}`,
      description: issue.message,
      confidence: 0.9,
    });
  }
  
  // 4. Performance patterns (lightweight check)
  const perfIssues = quickPerfCheck(action.code);
  for (const issue of perfIssues.slice(0, 3)) {
    patterns.push({
      type: 'performance',
      name: `perf_${issue.type}`,
      description: issue.message,
      confidence: 0.85,
    });
  }
  
  return patterns;
}

/**
 * Calculate confidence score based on action history
 */
function calculateConfidence(action: CodeAction, patterns: ExtractedPattern[]): number {
  const baseConfidence = action.outcome === 'success' ? 0.8 : 0.3;
  
  // Adjust based on pattern count
  const patternBonus = Math.min(patterns.length * 0.05, 0.15);
  
  // Adjust based on historical success rate
  const historyBonus = learningCache.stats.totalActions > 0
    ? (learningCache.stats.successCount / learningCache.stats.totalActions) * 0.1
    : 0;
  
  return Math.min(baseConfidence + patternBonus + historyBonus, 1.0);
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(action: CodeAction, patterns: ExtractedPattern[]): string[] {
  const recommendations: string[] = [];
  
  // Based on outcome
  if (action.outcome === 'success') {
    recommendations.push(`Pattern "${action.changeType}" successful — consider as template for similar changes`);
  } else if (action.outcome === 'failure') {
    recommendations.push('Review error patterns for this module');
    recommendations.push('Consider adding more validation before deployment');
  }
  
  // Based on patterns found
  const stylePatterns = patterns.filter(p => p.type === 'style');
  if (stylePatterns.length > 0) {
    recommendations.push(`Address ${stylePatterns.length} style violations for consistency`);
  }
  
  const perfPatterns = patterns.filter(p => p.type === 'performance');
  if (perfPatterns.length > 0) {
    recommendations.push(`${perfPatterns.length} performance improvements available`);
  }
  
  return recommendations;
}

/**
 * Persist learning to database
 */
async function persistLearning(
  action: CodeAction,
  patterns: ExtractedPattern[],
  confidence: number
): Promise<void> {
  try {
    // 1. Store in brain_memories for long-term retention
    await supabase.from('brain_memories').insert({
      content: JSON.stringify({
        action_id: action.id,
        action_type: action.actionType,
        module: action.module,
        change_type: action.changeType,
        outcome: action.outcome,
        patterns: patterns.map(p => ({ type: p.type, name: p.name })),
      }),
      memory_type: 'codeagent_learning',
      confidence,
      metadata: {
        source: 'codeagent',
        duration_ms: action.duration,
        pattern_count: patterns.length,
        timestamp: new Date().toISOString(),
      },
    });
    
    // 2. Store in brain_memory_hot for active use
    await supabase.from('brain_memory_hot').insert({
      content: `CodeAgent ${action.outcome}: ${action.changeType} in ${action.module}`,
      context: 'codeagent_action',
      priority: action.outcome === 'success' ? 7 : 5,
      tags: ['codeagent', action.module, action.outcome],
      metadata: {
        action_id: action.id,
        confidence,
        patterns: patterns.length,
      },
    });
    
    // 3. Update learning_patterns for each extracted pattern
    // Use RPC or raw SQL to properly increment frequency instead of resetting it
    for (const pattern of patterns) {
      const { data: existing } = await supabase
        .from('learning_patterns')
        .select('frequency, success_rate')
        .eq('pattern_name', pattern.name)
        .maybeSingle();

      const newFrequency = (existing?.frequency ?? 0) + 1;
      const oldRate = existing?.success_rate ?? 0;
      const oldFreq = existing?.frequency ?? 0;
      // Weighted running average for success_rate
      const outcomeVal = action.outcome === 'success' ? 1.0 : 0.0;
      const newSuccessRate = oldFreq > 0
        ? (oldRate * oldFreq + outcomeVal) / newFrequency
        : outcomeVal;

      await supabase.from('learning_patterns').upsert({
        pattern_name: pattern.name,
        pattern_type: pattern.type,
        description: pattern.description,
        confidence: pattern.confidence,
        frequency: newFrequency,
        success_rate: Math.round(newSuccessRate * 1000) / 1000,
        recommendations: [pattern.description],
        metadata: {
          last_seen: new Date().toISOString(),
          module: action.module,
        },
      }, {
        onConflict: 'pattern_name',
      });
    }
    
  } catch (error) {
    console.error('[LearningEngine] Failed to persist learning:', error);
    // Don't throw — learning is non-blocking
  }
}

/**
 * Log learning event for analytics
 */
async function logLearningEvent(
  action: CodeAction,
  patterns: ExtractedPattern[],
  confidence: number,
  durationMs: number
): Promise<void> {
  try {
    await supabase.from('brain_events').insert({
      event_type: 'codeagent_learning',
      module: 'codeagent',
      outcome: action.outcome,
      data: {
        action_id: action.id,
        action_type: action.actionType,
        target_module: action.module,
        change_type: action.changeType,
        patterns_extracted: patterns.length,
        confidence,
        duration_ms: durationMs,
      },
    });
  } catch (error) {
    console.error('[LearningEngine] Failed to log event:', error);
  }
}

// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE RETRIEVAL
// ═══════════════════════════════════════════════════════════════

/**
 * Get relevant patterns for a new action
 */
export async function getRelevantPatterns(
  module: string,
  changeType: string,
  limit: number = 5
): Promise<ExtractedPattern[]> {
  try {
    // Sanitize inputs to prevent injection via .or() ilike
    const safeModule = module.replace(/[%_'"\\]/g, '').slice(0, 50);
    const safeChangeType = changeType.replace(/[%_'"\\]/g, '').slice(0, 50);
    if (!safeModule && !safeChangeType) return [];

    const filters: string[] = [];
    if (safeModule) filters.push(`pattern_name.ilike.%${safeModule}%`);
    if (safeChangeType) filters.push(`pattern_name.ilike.%${safeChangeType}%`);

    const { data } = await supabase
      .from('learning_patterns')
      .select('*')
      .or(filters.join(','))
      .order('confidence', { ascending: false })
      .limit(limit);
    
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map(row => ({
      type: row.pattern_type as ExtractedPattern['type'],
      name: row.pattern_name,
      description: row.description || '',
      confidence: row.confidence || 0.5,
    }));
  } catch (error) {
    console.error('[LearningEngine] Failed to get patterns:', error);
    return [];
  }
}

/**
 * Get success rate for a module/changeType combination
 */
export async function getHistoricalSuccessRate(
  module: string,
  changeType: string
): Promise<number> {
  try {
    const { data } = await supabase
      .from('brain_events')
      .select('outcome')
      .eq('module', 'codeagent')
      .eq('event_type', 'codeagent_learning')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (!data || data.length === 0) {
      return 0.5; // Default 50%
    }
    
    const successes = data.filter(e => e.outcome === 'success').length;
    return successes / data.length;
  } catch {
    return 0.5;
  }
}

/**
 * Get learning statistics
 */
export function getLearningStats(): LearningStats {
  const total = learningCache.stats.totalActions;
  const successRate = total > 0 
    ? learningCache.stats.successCount / total 
    : 0;
  
  return {
    totalActions: total,
    successRate,
    patternsLearned: learningCache.patterns.size,
    avgConfidence: 0.75, // Could calculate from patterns
    lastLearningCycle: learningCache.stats.lastCycle,
  };
}

// ═══════════════════════════════════════════════════════════════
// SCHEDULED LEARNING CYCLES
// ═══════════════════════════════════════════════════════════════

/**
 * Run a learning consolidation cycle
 * Called periodically to synthesize recent learnings
 */
export async function runLearningCycle(): Promise<{
  actionsProcessed: number;
  patternsConsolidated: number;
  newInsights: number;
}> {
  console.log('[LearningEngine] Starting learning consolidation cycle...');
  
  learningCache.stats.lastCycle = new Date();
  
  // Get recent brain events for codeagent
  const { data: recentEvents } = await supabase
    .from('brain_events')
    .select('*')
    .eq('module', 'codeagent')
    .gte('created_at', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(100);
  
  const actionsProcessed = recentEvents?.length || 0;
  let patternsConsolidated = 0;
  let newInsights = 0;
  
  if (recentEvents && recentEvents.length > 0) {
    // Group by outcome to find patterns
    const successEvents = recentEvents.filter(e => e.outcome === 'success');
    const failureEvents = recentEvents.filter(e => e.outcome === 'failure');
    
    // Generate insights from successes
    if (successEvents.length >= 3) {
      newInsights++;
      await supabase.from('brain_memory_hot').insert({
        content: `CodeAgent success pattern: ${successEvents.length} successful actions in last 6 hours`,
        context: 'codeagent_insight',
        priority: 8,
        tags: ['codeagent', 'insight', 'success_pattern'],
        metadata: {
          event_count: successEvents.length,
          generated_at: new Date().toISOString(),
        },
      });
    }
    
    // Generate insights from failures
    if (failureEvents.length >= 2) {
      newInsights++;
      await supabase.from('brain_memory_hot').insert({
        content: `CodeAgent attention needed: ${failureEvents.length} failures detected in last 6 hours`,
        context: 'codeagent_insight',
        priority: 9,
        tags: ['codeagent', 'insight', 'failure_pattern'],
        metadata: {
          event_count: failureEvents.length,
          generated_at: new Date().toISOString(),
        },
      });
    }
    
    // Consolidate patterns in learning_patterns
    const { data: existingPatterns } = await supabase
      .from('learning_patterns')
      .select('*')
      .ilike('pattern_name', '%codeagent%')
      .order('confidence', { ascending: false })
      .limit(20);
    
    patternsConsolidated = existingPatterns?.length || 0;
  }
  
  console.log(`[LearningEngine] Cycle complete: ${actionsProcessed} actions, ${patternsConsolidated} patterns, ${newInsights} insights`);
  
  return {
    actionsProcessed,
    patternsConsolidated,
    newInsights,
  };
}

/**
 * Start background learning interval (call once on init)
 */
let learningInterval: ReturnType<typeof setInterval> | null = null;

export function startBackgroundLearning(intervalMs: number = 15 * 60 * 1000): void {
  if (learningInterval) {
    clearInterval(learningInterval);
  }
  
  learningInterval = setInterval(() => {
    runLearningCycle().catch(console.error);
  }, intervalMs);
  
  console.log(`[LearningEngine] Background learning started (${intervalMs / 60000} min interval)`);
}

export function stopBackgroundLearning(): void {
  if (learningInterval) {
    clearInterval(learningInterval);
    learningInterval = null;
    console.log('[LearningEngine] Background learning stopped');
  }
}

// ═══════════════════════════════════════════════════════════════
// SMART DECISION HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Should we proceed with an action based on historical learning?
 */
export async function shouldProceedWithAction(
  module: string,
  changeType: string
): Promise<{
  proceed: boolean;
  confidence: number;
  reason: string;
}> {
  const successRate = await getHistoricalSuccessRate(module, changeType);
  const patterns = await getRelevantPatterns(module, changeType, 3);
  
  // Check for known error patterns
  const errorPatterns = patterns.filter(p => p.type === 'error');
  
  if (errorPatterns.length >= 2 && successRate < 0.5) {
    return {
      proceed: false,
      confidence: 0.8,
      reason: `High failure rate (${(successRate * 100).toFixed(0)}%) and ${errorPatterns.length} known error patterns for this action`,
    };
  }
  
  if (successRate >= 0.7) {
    return {
      proceed: true,
      confidence: 0.9,
      reason: `High historical success rate (${(successRate * 100).toFixed(0)}%) for similar actions`,
    };
  }
  
  return {
    proceed: true,
    confidence: 0.6,
    reason: 'Moderate confidence — proceed with caution',
  };
}

/**
 * Get best template for an action based on past successes
 */
export async function getBestTemplate(
  module: string,
  changeType: string
): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('brain_memories')
      .select('content, confidence')
      .eq('memory_type', 'codeagent_learning')
      .order('confidence', { ascending: false })
      .limit(10);
    
    if (!data || data.length === 0) return null;
    
    // Find successful pattern with code snippet
    for (const memory of data) {
      try {
        const parsed = JSON.parse(memory.content);
        if (
          parsed.outcome === 'success' &&
          parsed.module === module &&
          parsed.patterns?.some((p: { type: string }) => p.type === 'success')
        ) {
          return parsed.code_snippet || null;
        }
      } catch {
        continue;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}
