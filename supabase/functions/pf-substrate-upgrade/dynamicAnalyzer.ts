/**
 * Dynamic Codebase Analyzer for Modernizer
 * v1.0.0 — Real-time analysis based on actual system state
 * 
 * Replaces static ALL_IMPROVEMENTS with intelligent, data-driven suggestions
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface DynamicImprovement {
  improvement_id: string;
  module: string;
  change_type: 'optimization' | 'enhancement' | 'feature' | 'fix' | 'infrastructure' | 'refactor';
  description: string;
  file_path?: string;
  risk: 'low' | 'medium' | 'high';
  rationale: string;
  action: string;
  priority: number; // 1-10, higher = more urgent
  source: 'error_analysis' | 'metric_analysis' | 'pattern_analysis' | 'health_analysis' | 'usage_analysis';
  evidence?: Record<string, unknown>;
}

interface AnalysisContext {
  errors: Array<{ event_type: string; module: string; data: unknown; created_at: string }>;
  events: Array<{ event_type: string; module: string; outcome: string; count: number }>;
  moduleHealth: Record<string, { health: number; status: string }>;
  patterns: Array<{ pattern_name: string; pattern_type: string; confidence: number; success_rate: number }>;
  appliedImprovements: Set<string>;
}

/**
 * Analyze recent errors to identify fix opportunities
 */
function analyzeErrors(context: AnalysisContext): DynamicImprovement[] {
  const improvements: DynamicImprovement[] = [];
  const errorCounts: Record<string, { count: number; modules: Set<string>; lastError: unknown }> = {};
  
  // Count and categorize errors
  for (const error of context.errors) {
    const key = `${error.module}:${error.event_type}`;
    if (!errorCounts[key]) {
      errorCounts[key] = { count: 0, modules: new Set(), lastError: error.data };
    }
    errorCounts[key].count++;
    errorCounts[key].modules.add(error.module);
  }
  
  // Generate improvements based on error patterns
  for (const [key, data] of Object.entries(errorCounts)) {
    const [module, eventType] = key.split(':');
    
    if (data.count >= 2) {
      const impKey = `fix:${key}`;
      if (context.appliedImprovements.has(impKey)) continue;
      
      improvements.push({
        improvement_id: `fix_${module}_${Date.now().toString(36)}`,
        module,
        change_type: 'fix',
        description: `Fix recurring ${eventType} failures in ${module} module (${data.count} occurrences)`,
        risk: data.count >= 5 ? 'high' : 'medium',
        rationale: `${data.count} failures detected in the last 7 days. Root cause analysis needed.`,
        action: `Investigate ${eventType} failures and implement error handling or fix underlying issue`,
        priority: Math.min(10, 5 + data.count),
        source: 'error_analysis',
        evidence: { error_count: data.count, last_error: data.lastError }
      });
    }
  }
  
  return improvements;
}

/**
 * Analyze event patterns to identify optimization opportunities
 */
function analyzeEventPatterns(context: AnalysisContext): DynamicImprovement[] {
  const improvements: DynamicImprovement[] = [];
  
  // High-frequency events that could benefit from optimization
  const highFrequencyThreshold = 100;
  
  for (const event of context.events) {
    if (event.count > highFrequencyThreshold && event.outcome === 'completed') {
      const impKey = `optimize:${event.module}:${event.event_type}`;
      if (context.appliedImprovements.has(impKey)) continue;
      
      improvements.push({
        improvement_id: `opt_${event.module}_${Date.now().toString(36)}`,
        module: event.module,
        change_type: 'optimization',
        description: `Optimize high-frequency ${event.event_type} operation (${event.count} calls/week)`,
        risk: 'low',
        rationale: `High call volume detected. Consider caching, batching, or async processing.`,
        action: `Add caching layer or batch processing for ${event.event_type}`,
        priority: Math.min(8, 3 + Math.floor(event.count / 200)),
        source: 'metric_analysis',
        evidence: { weekly_count: event.count, event_type: event.event_type }
      });
    }
    
    // Identify redirect patterns that might indicate inefficiency
    if (event.outcome === 'redirected' && event.count > 50) {
      const impKey = `streamline:${event.module}:${event.event_type}`;
      if (context.appliedImprovements.has(impKey)) continue;
      
      improvements.push({
        improvement_id: `stream_${event.module}_${Date.now().toString(36)}`,
        module: event.module,
        change_type: 'refactor',
        description: `Streamline ${event.event_type} workflow (${event.count} redirects/week)`,
        risk: 'medium',
        rationale: `High redirect volume suggests potential workflow inefficiency.`,
        action: `Review ${event.event_type} pipeline and consider direct routing`,
        priority: 5,
        source: 'pattern_analysis',
        evidence: { redirect_count: event.count }
      });
    }
  }
  
  return improvements;
}

/**
 * Analyze module health to identify stability improvements
 */
function analyzeModuleHealth(context: AnalysisContext): DynamicImprovement[] {
  const improvements: DynamicImprovement[] = [];
  
  for (const [module, health] of Object.entries(context.moduleHealth)) {
    if (health.health < 80) {
      const impKey = `health:${module}:stability`;
      if (context.appliedImprovements.has(impKey)) continue;
      
      improvements.push({
        improvement_id: `health_${module}_${Date.now().toString(36)}`,
        module,
        change_type: 'infrastructure',
        description: `Improve ${module} module stability (current health: ${health.health}%)`,
        risk: health.health < 50 ? 'high' : 'medium',
        rationale: `Module health is below optimal. Status: ${health.status}`,
        action: `Add circuit breaker patterns, retry logic, and fallback mechanisms`,
        priority: health.health < 50 ? 9 : 6,
        source: 'health_analysis',
        evidence: { current_health: health.health, status: health.status }
      });
    }
    
    if (health.status === 'degraded' || health.status === 'down') {
      const impKey = `resilience:${module}`;
      if (context.appliedImprovements.has(impKey)) continue;
      
      improvements.push({
        improvement_id: `resil_${module}_${Date.now().toString(36)}`,
        module,
        change_type: 'enhancement',
        description: `Add resilience patterns to ${module} module`,
        risk: 'medium',
        rationale: `Module is in ${health.status} state. Needs defensive programming.`,
        action: `Implement graceful degradation, timeouts, and health checks`,
        priority: 8,
        source: 'health_analysis',
        evidence: { status: health.status }
      });
    }
  }
  
  return improvements;
}

/**
 * Analyze learning patterns to identify enhancement opportunities
 */
function analyzePatterns(context: AnalysisContext): DynamicImprovement[] {
  const improvements: DynamicImprovement[] = [];
  
  for (const pattern of context.patterns) {
    // Low confidence patterns need improvement
    if (pattern.confidence < 0.7) {
      const impKey = `confidence:${pattern.pattern_name}`;
      if (context.appliedImprovements.has(impKey)) continue;
      
      improvements.push({
        improvement_id: `conf_${pattern.pattern_name}_${Date.now().toString(36)}`,
        module: 'brain',
        change_type: 'enhancement',
        description: `Improve ${pattern.pattern_name} pattern recognition accuracy`,
        risk: 'low',
        rationale: `Pattern confidence is ${Math.round(pattern.confidence * 100)}%, below optimal 70%`,
        action: `Enhance pattern detection with more training data and refined algorithms`,
        priority: 4,
        source: 'pattern_analysis',
        evidence: { pattern_name: pattern.pattern_name, confidence: pattern.confidence }
      });
    }
    
    // Low success rate patterns need fixes
    if (pattern.success_rate < 85 && pattern.pattern_type !== 'error') {
      const impKey = `success:${pattern.pattern_name}`;
      if (context.appliedImprovements.has(impKey)) continue;
      
      improvements.push({
        improvement_id: `succ_${pattern.pattern_name}_${Date.now().toString(36)}`,
        module: 'brain',
        change_type: 'fix',
        description: `Address ${pattern.pattern_name} success rate issues`,
        risk: 'medium',
        rationale: `Success rate is ${pattern.success_rate}%, below target 85%`,
        action: `Analyze failure cases and implement targeted improvements`,
        priority: 6,
        source: 'pattern_analysis',
        evidence: { pattern_name: pattern.pattern_name, success_rate: pattern.success_rate }
      });
    }
  }
  
  return improvements;
}

/**
 * Generate context-aware improvements based on system gaps
 */
function analyzeSystemGaps(context: AnalysisContext): DynamicImprovement[] {
  const improvements: DynamicImprovement[] = [];
  const now = Date.now();
  
  // Check for missing observability
  const hasVisionEvents = context.events.some(e => e.module === 'vision');
  if (!hasVisionEvents) {
    const impKey = 'feature:vision:observability';
    if (!context.appliedImprovements.has(impKey)) {
      improvements.push({
        improvement_id: `gap_vision_${now.toString(36)}`,
        module: 'vision',
        change_type: 'feature',
        description: 'Implement comprehensive observability pipeline',
        risk: 'low',
        rationale: 'Limited vision module activity detected. Enhanced monitoring needed.',
        action: 'Add distributed tracing, metrics aggregation, and alerting',
        priority: 5,
        source: 'usage_analysis',
        evidence: { vision_events: 0 }
      });
    }
  }
  
  // Check for backup health
  const backupEvents = context.events.filter(e => e.event_type.includes('backup'));
  const totalBackups = backupEvents.reduce((sum, e) => sum + e.count, 0);
  if (totalBackups < 7) { // Less than 1 per day
    const impKey = 'infrastructure:backup:frequency';
    if (!context.appliedImprovements.has(impKey)) {
      improvements.push({
        improvement_id: `gap_backup_${now.toString(36)}`,
        module: 'system',
        change_type: 'infrastructure',
        description: 'Increase backup frequency and validation',
        risk: 'medium',
        rationale: `Only ${totalBackups} backups in the last 7 days. Increase frequency.`,
        action: 'Implement automated daily backups with integrity validation',
        priority: 7,
        source: 'usage_analysis',
        evidence: { backup_count: totalBackups }
      });
    }
  }
  
  // Check for dream cycle health
  const dreamEvents = context.events.filter(e => e.module === 'dream' || e.module === 'dream_eater');
  const dreamCompleted = dreamEvents.filter(e => e.outcome === 'success').reduce((s, e) => s + e.count, 0);
  if (dreamCompleted < 10) {
    const impKey = 'enhancement:dream:frequency';
    if (!context.appliedImprovements.has(impKey)) {
      improvements.push({
        improvement_id: `gap_dream_${now.toString(36)}`,
        module: 'dream',
        change_type: 'enhancement',
        description: 'Optimize dream cycle scheduling and completion',
        risk: 'low',
        rationale: `Only ${dreamCompleted} successful dream cycles. Consider increasing frequency.`,
        action: 'Add adaptive dream scheduling based on system load',
        priority: 4,
        source: 'usage_analysis',
        evidence: { dream_count: dreamCompleted }
      });
    }
  }
  
  return improvements;
}

/**
 * Main analysis function - gathers all data and produces dynamic improvements
 */
export async function analyzeDynamically(
  supabase: SupabaseClient,
  scope: string,
  maxChanges: number
): Promise<{
  suggestions: DynamicImprovement[];
  patches: Array<{ target: string; action: string; rationale: string }>;
  analysis_summary: {
    errors_analyzed: number;
    events_analyzed: number;
    patterns_analyzed: number;
    modules_checked: number;
    improvements_found: number;
  };
}> {
  // Get applied improvements
  const { data: appliedData } = await supabase
    .from('substrate_applied_improvements')
    .select('improvement_key')
    .eq('is_active', true);
  
  const appliedImprovements = new Set((appliedData || []).map((r: { improvement_key: string }) => r.improvement_key));
  
  // Get recent errors
  const { data: errors } = await supabase
    .from('brain_events')
    .select('event_type, module, data, created_at')
    .in('outcome', ['failed', 'error', 'failure'])
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(100);
  
  // Get event statistics - use direct query since RPC may not exist
  let eventStats = null;
  let events: Array<{ event_type: string; module: string; outcome: string; count: number }> = [];
  if (!eventStats) {
    const { data: rawEvents } = await supabase
      .from('brain_events')
      .select('event_type, module, outcome')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    
    // Manual aggregation
    const counts: Record<string, { event_type: string; module: string; outcome: string; count: number }> = {};
    for (const e of (rawEvents || [])) {
      const key = `${e.event_type}:${e.module}:${e.outcome}`;
      if (!counts[key]) {
        counts[key] = { event_type: e.event_type, module: e.module, outcome: e.outcome, count: 0 };
      }
      counts[key].count++;
    }
    events = Object.values(counts);
  } else {
    events = eventStats;
  }
  
  // Get module health from substrate
  let moduleHealth: Record<string, { health: number; status: string }> = {};
  try {
    const { data: healthData } = await supabase.functions.invoke('pf-substrate', {
      body: { module: 'system', action: 'health' }
    });
    if (healthData?.diagnostics) {
      for (const d of healthData.diagnostics) {
        moduleHealth[d.module] = { health: d.health_score || 100, status: d.status || 'healthy' };
      }
    }
  } catch {
    // Fallback health
    moduleHealth = {
      brain: { health: 90, status: 'healthy' },
      defense: { health: 90, status: 'healthy' },
      nexus: { health: 90, status: 'healthy' }
    };
  }
  
  // Get learning patterns
  const { data: patterns } = await supabase
    .from('learning_patterns')
    .select('pattern_name, pattern_type, confidence, success_rate')
    .order('created_at', { ascending: false })
    .limit(20);
  
  // Build analysis context
  const context: AnalysisContext = {
    errors: errors || [],
    events,
    moduleHealth,
    patterns: patterns || [],
    appliedImprovements
  };
  
  // Run all analyzers
  const allImprovements: DynamicImprovement[] = [
    ...analyzeErrors(context),
    ...analyzeEventPatterns(context),
    ...analyzeModuleHealth(context),
    ...analyzePatterns(context),
    ...analyzeSystemGaps(context)
  ];
  
  // Filter by scope if specified
  const scopedImprovements = scope === 'all' 
    ? allImprovements 
    : allImprovements.filter(i => i.module === scope);
  
  // Sort by priority (descending) and limit
  const sortedImprovements = scopedImprovements
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxChanges);
  
  // Generate patches from improvements
  const patches = sortedImprovements.map(imp => ({
    target: `${imp.module}.${imp.change_type}`,
    action: imp.action,
    rationale: imp.rationale
  }));
  
  return {
    suggestions: sortedImprovements,
    patches,
    analysis_summary: {
      errors_analyzed: context.errors.length,
      events_analyzed: context.events.length,
      patterns_analyzed: context.patterns.length,
      modules_checked: Object.keys(context.moduleHealth).length,
      improvements_found: allImprovements.length
    }
  };
}
