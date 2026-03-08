/**
 * Cross-Dream Pattern Recognition
 * Identifies patterns and insights across multiple dream cycles
 */

import { supabase } from '@/integrations/supabase/client';

export interface DreamPattern {
  id: string;
  patternType: 'recurring' | 'emergent' | 'declining' | 'correlative';
  description: string;
  frequency: number;
  confidence: number;
  relatedCycles: string[];
  insights: string[];
  detectedAt: string;
}

export interface PatternCluster {
  category: string;
  patterns: DreamPattern[];
  strength: number;
  actionable: boolean;
}

interface DreamCycleData {
  id: string;
  improvements: string[];
  templates: string[];
  heuristics: string[];
  artifacts: number;
  timestamp: string;
}

/**
 * Extract tokens from improvement descriptions
 */
function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

/**
 * Calculate Jaccard similarity between token sets
 */
function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / Math.max(union.size, 1);
}

/**
 * Detect recurring patterns across dream cycles
 */
function detectRecurringPatterns(cycles: DreamCycleData[]): DreamPattern[] {
  const patterns: DreamPattern[] = [];
  const improvementFrequency = new Map<string, { count: number; cycles: string[] }>();
  
  // Count improvement occurrences
  cycles.forEach(cycle => {
    cycle.improvements.forEach(imp => {
      const tokens = tokenize(imp).slice(0, 5).join(' ');
      if (!tokens) return;
      
      const existing = improvementFrequency.get(tokens) || { count: 0, cycles: [] };
      existing.count++;
      existing.cycles.push(cycle.id);
      improvementFrequency.set(tokens, existing);
    });
  });
  
  // Find recurring ones (appear in 3+ cycles)
  improvementFrequency.forEach((data, key) => {
    if (data.count >= 3) {
      patterns.push({
        id: crypto.randomUUID(),
        patternType: 'recurring',
        description: `Recurring improvement focus: "${key}"`,
        frequency: data.count,
        confidence: Math.min(0.95, 0.5 + data.count * 0.1),
        relatedCycles: data.cycles,
        insights: [`This area has been improved ${data.count} times - consider deeper refactoring`],
        detectedAt: new Date().toISOString(),
      });
    }
  });
  
  return patterns;
}

/**
 * Detect emergent patterns (new trends)
 */
function detectEmergentPatterns(cycles: DreamCycleData[]): DreamPattern[] {
  const patterns: DreamPattern[] = [];
  
  if (cycles.length < 3) return patterns;
  
  // Sort by timestamp
  const sorted = [...cycles].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // Compare recent vs older cycles
  const midpoint = Math.floor(sorted.length / 2);
  const older = sorted.slice(0, midpoint);
  const newer = sorted.slice(midpoint);
  
  const olderTokens = new Set(older.flatMap(c => c.improvements.flatMap(tokenize)));
  const newerTokens = newer.flatMap(c => c.improvements.flatMap(tokenize));
  
  // Find tokens that appear frequently in new but not old
  const emergingTerms = new Map<string, number>();
  newerTokens.forEach(token => {
    if (!olderTokens.has(token)) {
      emergingTerms.set(token, (emergingTerms.get(token) || 0) + 1);
    }
  });
  
  // Top emerging terms
  const topEmerging = [...emergingTerms.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  if (topEmerging.length > 0) {
    patterns.push({
      id: crypto.randomUUID(),
      patternType: 'emergent',
      description: `Emerging focus areas: ${topEmerging.map(([t]) => t).join(', ')}`,
      frequency: topEmerging.reduce((sum, [, c]) => sum + c, 0),
      confidence: 0.7,
      relatedCycles: newer.map(c => c.id),
      insights: ['New improvement areas detected - potential system evolution'],
      detectedAt: new Date().toISOString(),
    });
  }
  
  return patterns;
}

/**
 * Detect correlative patterns between improvements
 */
function detectCorrelativePatterns(cycles: DreamCycleData[]): DreamPattern[] {
  const patterns: DreamPattern[] = [];
  // Track co-occurrence by sorted pair key
  const coOccurrence = new Map<string, number>();
  
  cycles.forEach(cycle => {
    const tokens = cycle.improvements.flatMap(tokenize);
    const uniqueTokens = [...new Set(tokens)];
    
    // Count co-occurrences using canonical pair keys
    for (let i = 0; i < uniqueTokens.length; i++) {
      for (let j = i + 1; j < uniqueTokens.length; j++) {
        const key = [uniqueTokens[i], uniqueTokens[j]].sort().join('|');
        coOccurrence.set(key, (coOccurrence.get(key) || 0) + 1);
      }
    }
  });
  
  // Find strong correlations
  for (const [pairKey, count] of coOccurrence) {
    if (count >= 3) {
      const [term1, term2] = pairKey.split('|');
      
      patterns.push({
        id: crypto.randomUUID(),
        patternType: 'correlative',
        description: `"${term1}" frequently improves alongside "${term2}"`,
        frequency: count,
        confidence: Math.min(0.9, 0.4 + count * 0.15),
        relatedCycles: [],
        insights: [`Consider unified improvement strategy for ${term1} and ${term2}`],
        detectedAt: new Date().toISOString(),
      });
    }
  }
  
  return patterns.slice(0, 10); // Limit results
}

/**
 * Cluster patterns by category
 */
function clusterPatterns(patterns: DreamPattern[]): PatternCluster[] {
  const categories = new Map<string, DreamPattern[]>();
  
  patterns.forEach(pattern => {
    const category = pattern.patternType;
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(pattern);
  });
  
  return [...categories.entries()].map(([category, patternList]) => ({
    category,
    patterns: patternList,
    strength: patternList.reduce((sum, p) => sum + p.confidence, 0) / patternList.length,
    actionable: patternList.some(p => p.confidence > 0.7),
  }));
}

/**
 * Run cross-dream pattern analysis
 */
export async function analyzeCrossDreamPatterns(
  lookbackDays: number = 30
): Promise<{
  patterns: DreamPattern[];
  clusters: PatternCluster[];
  summary: string;
}> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);
    
    // Fetch dream cycle logs
    const { data: dreamLogs, error } = await supabase
      .from('dream_cycle_logs')
      .select('*')
      .gte('started_at', cutoffDate.toISOString())
      .order('started_at', { ascending: false });
    
    if (error || !dreamLogs || dreamLogs.length < 2) {
      return {
        patterns: [],
        clusters: [],
        summary: 'Insufficient dream cycle data for pattern analysis',
      };
    }
    
    // Transform to analysis format
    const cycles: DreamCycleData[] = dreamLogs.map(log => {
      // improvements_generated, templates_created, heuristics_learned are integers in DB
      // Extract text from metadata if available, else create placeholder strings
      const meta = (log.metadata as Record<string, any>) || {};
      return {
        id: log.id,
        improvements: Array.isArray(meta.improvements)
          ? meta.improvements.map(String)
          : Array.isArray(meta.reasoning_shortcuts)
            ? meta.reasoning_shortcuts.map(String)
            : [],
        templates: Array.isArray(meta.templates)
          ? meta.templates.map(String)
          : [],
        heuristics: Array.isArray(meta.heuristics)
          ? meta.heuristics.map(String)
          : [],
        artifacts: log.artifacts_processed || 0,
        timestamp: log.started_at,
      };
    });
    
    // Run pattern detection
    const recurring = detectRecurringPatterns(cycles);
    const emergent = detectEmergentPatterns(cycles);
    const correlative = detectCorrelativePatterns(cycles);
    
    const allPatterns = [...recurring, ...emergent, ...correlative];
    const clusters = clusterPatterns(allPatterns);
    
    // Generate summary
    const summary = allPatterns.length > 0
      ? `Found ${allPatterns.length} patterns across ${cycles.length} dream cycles: ${recurring.length} recurring, ${emergent.length} emergent, ${correlative.length} correlative`
      : 'No significant patterns detected in recent dream cycles';
    
    // Store analysis results (fire-and-forget)
    supabase.from('brain_cross_insights').insert({
      insight_text: summary,
      domains: ['dream', 'pattern'],
      confidence: clusters.length > 0 ? clusters[0].strength : 0,
      metadata: {
        patterns_count: allPatterns.length,
        clusters: clusters.map(c => c.category),
        analyzed_cycles: cycles.length,
      },
    }).then(({ error: insertErr }) => {
      if (insertErr) console.error('Failed to store cross-dream analysis:', insertErr);
    });
    
    return { patterns: allPatterns, clusters, summary };
  } catch (err) {
    console.error('Cross-dream pattern analysis error:', err);
    return { patterns: [], clusters: [], summary: 'Analysis failed' };
  }
}

/**
 * Get pattern history
 */
export async function getPatternHistory(limit: number = 10): Promise<Array<{
  id: string;
  insight: string;
  confidence: number;
  timestamp: string;
}>> {
  try {
    const { data } = await supabase
      .from('brain_cross_insights')
      .select('id, insight_text, confidence, created_at')
      .contains('domains', ['dream', 'pattern'])
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return (data || []).map(d => ({
      id: d.id,
      insight: d.insight_text,
      confidence: d.confidence || 0,
      timestamp: d.created_at,
    }));
  } catch {
    return [];
  }
}
