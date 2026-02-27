/**
 * Intent Pattern Recognition Engine
 * Detect recurring intent sequences and auto-suggest pipeline crystallization
 * 
 * Analyzes temporal sequences of mesh intents to discover:
 * 1. Frequently co-occurring intent types (always fired together)
 * 2. Sequential chains (A always triggers B within N seconds)
 * 3. Module collaboration patterns (sets of modules that consistently co-resolve)
 * 4. Auto-suggests pipeline crystallization for stable patterns
 */

import { supabase } from '@/integrations/supabase/client';

// ─── Types ───

export interface IntentPattern {
  id: string;
  patternType: 'co_occurrence' | 'sequential' | 'collaboration';
  intents: string[];
  modules: string[];
  frequency: number;
  confidence: number;
  avgIntervalMs: number;
  stability: number; // 0-1, how consistent this pattern is over time
  firstSeen: string;
  lastSeen: string;
  suggestPipeline: boolean;
  pipelineName: string;
}

export interface PatternReport {
  patternsFound: number;
  coOccurrencePatterns: IntentPattern[];
  sequentialPatterns: IntentPattern[];
  collaborationPatterns: IntentPattern[];
  pipelineSuggestions: Array<{
    name: string;
    intents: string[];
    modules: string[];
    confidence: number;
    reasoning: string;
  }>;
  durationMs: number;
  analyzedReceipts: number;
}

// ─── Pattern Detection ───

/**
 * Run full pattern recognition on recent mesh receipts
 */
export async function detectPatterns(): Promise<PatternReport> {
  const startTime = performance.now();

  const { data } = await supabase
    .from('mesh_intents')
    .select('intent_type, source_module, resolved_by, target_modules, success, duration_ms, created_at')
    .eq('success', true)
    .order('created_at', { ascending: true })
    .limit(500);

  const rows = (data || []) as any[];

  if (rows.length < 5) {
    return {
      patternsFound: 0, coOccurrencePatterns: [], sequentialPatterns: [],
      collaborationPatterns: [], pipelineSuggestions: [],
      durationMs: Math.round(performance.now() - startTime), analyzedReceipts: 0,
    };
  }

  // Phase 1: Co-occurrence patterns — intent types that appear in the same time window
  const coOccurrence = findCoOccurrencePatterns(rows);

  // Phase 2: Sequential patterns — intent A consistently followed by intent B
  const sequential = findSequentialPatterns(rows);

  // Phase 3: Collaboration patterns — module sets that consistently co-resolve
  const collaboration = findCollaborationPatterns(rows);

  // Phase 4: Generate pipeline suggestions from stable patterns
  const allPatterns = [...coOccurrence, ...sequential, ...collaboration];
  const pipelineSuggestions = allPatterns
    .filter(p => p.suggestPipeline && p.confidence >= 0.6)
    .map(p => ({
      name: p.pipelineName,
      intents: p.intents,
      modules: p.modules,
      confidence: p.confidence,
      reasoning: p.patternType === 'co_occurrence'
        ? `These ${p.intents.length} intents co-occur ${p.frequency}x — bundling them into a pipeline would reduce latency`
        : p.patternType === 'sequential'
        ? `${p.intents[0]} consistently triggers ${p.intents[1]} (avg ${p.avgIntervalMs}ms apart) — chain them for predictive execution`
        : `Modules [${p.modules.join(', ')}] consistently co-resolve — formalizing this collaboration as a named pipeline increases reliability`,
    }));

  const report: PatternReport = {
    patternsFound: allPatterns.length,
    coOccurrencePatterns: coOccurrence,
    sequentialPatterns: sequential,
    collaborationPatterns: collaboration,
    pipelineSuggestions,
    durationMs: Math.round(performance.now() - startTime),
    analyzedReceipts: rows.length,
  };

  // Persist
  await persistPatternReport(report);

  return report;
}

// ─── Co-occurrence ───

function findCoOccurrencePatterns(rows: any[]): IntentPattern[] {
  const WINDOW_MS = 10000; // 10-second window
  const patterns = new Map<string, { count: number; intervals: number[]; first: string; last: string; intents: string[]; modules: Set<string> }>();

  for (let i = 0; i < rows.length; i++) {
    const window: any[] = [rows[i]];
    const baseTime = new Date(rows[i].created_at).getTime();

    // Collect intents within the time window
    for (let j = i + 1; j < rows.length; j++) {
      const time = new Date(rows[j].created_at).getTime();
      if (time - baseTime > WINDOW_MS) break;
      if (rows[j].intent_type !== rows[i].intent_type) {
        window.push(rows[j]);
      }
    }

    if (window.length < 2) continue;

    const intentTypes = [...new Set(window.map(r => r.intent_type))].sort();
    if (intentTypes.length < 2) continue;

    const key = intentTypes.join('+');
    if (!patterns.has(key)) {
      patterns.set(key, { count: 0, intervals: [], first: rows[i].created_at, last: rows[i].created_at, intents: intentTypes, modules: new Set() });
    }
    const p = patterns.get(key)!;
    p.count++;
    p.last = rows[i].created_at;
    for (const r of window) {
      for (const m of (r.resolved_by as string[]) || []) p.modules.add(m);
      p.modules.add(r.source_module);
    }
  }

  return [...patterns.values()]
    .filter(p => p.count >= 3)
    .map(p => ({
      id: `cooc_${p.intents.join('_').slice(0, 40)}`,
      patternType: 'co_occurrence' as const,
      intents: p.intents,
      modules: [...p.modules],
      frequency: p.count,
      confidence: Math.min(0.95, 0.3 + p.count * 0.1),
      avgIntervalMs: 0,
      stability: Math.min(1, p.count / 10),
      firstSeen: p.first,
      lastSeen: p.last,
      suggestPipeline: p.count >= 5,
      pipelineName: `auto_${p.intents.slice(0, 2).join('_then_')}`,
    }))
    .sort((a, b) => b.frequency - a.frequency);
}

// ─── Sequential ───

function findSequentialPatterns(rows: any[]): IntentPattern[] {
  const MAX_GAP_MS = 30000; // 30-second max gap for sequence
  const sequences = new Map<string, { count: number; intervals: number[]; first: string; last: string; modules: Set<string> }>();

  for (let i = 0; i < rows.length - 1; i++) {
    const current = rows[i];
    const next = rows[i + 1];
    if (current.intent_type === next.intent_type) continue;

    const gap = new Date(next.created_at).getTime() - new Date(current.created_at).getTime();
    if (gap > MAX_GAP_MS || gap < 0) continue;

    const key = `${current.intent_type}→${next.intent_type}`;
    if (!sequences.has(key)) {
      sequences.set(key, { count: 0, intervals: [], first: current.created_at, last: current.created_at, modules: new Set() });
    }
    const s = sequences.get(key)!;
    s.count++;
    s.intervals.push(gap);
    s.last = next.created_at;
    s.modules.add(current.source_module);
    s.modules.add(next.source_module);
    for (const m of (current.resolved_by as string[]) || []) s.modules.add(m);
    for (const m of (next.resolved_by as string[]) || []) s.modules.add(m);
  }

  return [...sequences.entries()]
    .filter(([, s]) => s.count >= 3)
    .map(([key, s]) => {
      const [a, b] = key.split('→');
      const avgInterval = s.intervals.reduce((sum, v) => sum + v, 0) / s.intervals.length;
      return {
        id: `seq_${key.replace(/[^a-z0-9]/gi, '_').slice(0, 40)}`,
        patternType: 'sequential' as const,
        intents: [a, b],
        modules: [...s.modules],
        frequency: s.count,
        confidence: Math.min(0.95, 0.3 + s.count * 0.08),
        avgIntervalMs: Math.round(avgInterval),
        stability: Math.min(1, s.count / 8),
        firstSeen: s.first,
        lastSeen: s.last,
        suggestPipeline: s.count >= 5 && avgInterval < 5000,
        pipelineName: `chain_${a}_then_${b}`.slice(0, 60),
      };
    })
    .sort((a, b) => b.frequency - a.frequency);
}

// ─── Collaboration ───

function findCollaborationPatterns(rows: any[]): IntentPattern[] {
  const moduleSetCounts = new Map<string, { count: number; intents: Set<string>; first: string; last: string }>();

  for (const row of rows) {
    const resolved = (row.resolved_by as string[]) || [];
    if (resolved.length < 2) continue;

    const moduleSet = [...new Set(resolved)].sort().join('+');
    if (!moduleSetCounts.has(moduleSet)) {
      moduleSetCounts.set(moduleSet, { count: 0, intents: new Set(), first: row.created_at, last: row.created_at });
    }
    const entry = moduleSetCounts.get(moduleSet)!;
    entry.count++;
    entry.intents.add(row.intent_type);
    entry.last = row.created_at;
  }

  return [...moduleSetCounts.entries()]
    .filter(([, s]) => s.count >= 3)
    .map(([key, s]) => ({
      id: `collab_${key.replace(/\+/g, '_').slice(0, 40)}`,
      patternType: 'collaboration' as const,
      intents: [...s.intents],
      modules: key.split('+'),
      frequency: s.count,
      confidence: Math.min(0.95, 0.35 + s.count * 0.07),
      avgIntervalMs: 0,
      stability: Math.min(1, s.count / 10),
      firstSeen: s.first,
      lastSeen: s.last,
      suggestPipeline: s.count >= 5,
      pipelineName: `team_${key.split('+').slice(0, 3).join('_')}`.toLowerCase(),
    }))
    .sort((a, b) => b.frequency - a.frequency);
}

// ─── Persistence ───

async function persistPatternReport(report: PatternReport): Promise<void> {
  try {
    await supabase.from('mesh_discovery_runs').insert([{
      run_type: 'pattern_recognition',
      gaps_found: 0,
      recommendations_generated: report.pipelineSuggestions.length,
      capabilities_expanded: 0,
      modules_analyzed: new Set([
        ...report.coOccurrencePatterns.flatMap(p => p.modules),
        ...report.sequentialPatterns.flatMap(p => p.modules),
        ...report.collaborationPatterns.flatMap(p => p.modules),
      ]).size,
      duration_ms: report.durationMs,
      summary: {
        text: `Pattern recognition: ${report.patternsFound} patterns (${report.coOccurrencePatterns.length} co-occurrence, ${report.sequentialPatterns.length} sequential, ${report.collaborationPatterns.length} collaboration), ${report.pipelineSuggestions.length} pipeline suggestions`,
        top_patterns: [
          ...report.coOccurrencePatterns.slice(0, 3),
          ...report.sequentialPatterns.slice(0, 3),
        ].map(p => ({ type: p.patternType, intents: p.intents, freq: p.frequency })),
        pipeline_suggestions: report.pipelineSuggestions.slice(0, 5),
      },
    } as any]);
  } catch { /* non-blocking */ }
}

/**
 * Get recognized patterns from the latest run
 */
export async function getLatestPatterns(): Promise<PatternReport | null> {
  const { data } = await supabase
    .from('mesh_discovery_runs')
    .select('summary, duration_ms, created_at')
    .eq('run_type', 'pattern_recognition')
    .order('created_at', { ascending: false })
    .limit(1);

  if (!data?.[0]) return null;
  const summary = data[0].summary as any;
  return {
    patternsFound: summary?.top_patterns?.length || 0,
    coOccurrencePatterns: [],
    sequentialPatterns: [],
    collaborationPatterns: [],
    pipelineSuggestions: summary?.pipeline_suggestions || [],
    durationMs: data[0].duration_ms || 0,
    analyzedReceipts: 0,
  };
}
