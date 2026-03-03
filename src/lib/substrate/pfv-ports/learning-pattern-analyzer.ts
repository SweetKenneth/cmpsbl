/**
 * PFV Port → Learning Pattern Analyzer
 * Meta-learning layer surfacing error/success/frequency patterns
 * Benefits: CLM, BRAIN, EVOLUTION
 * Source: PromptFluid-Vision learning/analyzer.ts
 */

import { supabase } from '@/integrations/supabase/client';

export interface LearningPattern {
  pattern_type: string;
  pattern_name: string;
  description: string;
  confidence: number;
  frequency: number;
  success_rate: number;
  recommendations: any[];
  metadata: Record<string, any>;
}

/**
 * Learning Pattern Analyzer
 * Queries learning_patterns table and generates actionable insights
 */
export class LearningPatternAnalyzer {
  /**
   * Trigger pattern analysis via edge function
   */
  static async analyzePatterns(periodHours: number = 24): Promise<{
    success: boolean;
    patterns_generated: number;
    patterns: LearningPattern[];
  }> {
    const { data, error } = await supabase.functions.invoke('pf-learning-analyze', {
      body: { period_hours: periodHours },
    });
    if (error) throw error;
    return data;
  }

  /**
   * Get high-confidence patterns
   */
  static async getHighConfidencePatterns(minConfidence: number = 0.75): Promise<LearningPattern[]> {
    const { data, error } = await supabase
      .from('learning_patterns')
      .select('*')
      .gte('confidence', minConfidence)
      .order('confidence', { ascending: false })
      .limit(50);

    if (error) return [];
    return (data || []).map(normalizePattern);
  }

  /**
   * Get patterns by type (error, success, frequency)
   */
  static async getPatternsByType(patternType: string): Promise<LearningPattern[]> {
    const { data, error } = await supabase
      .from('learning_patterns')
      .select('*')
      .eq('pattern_type', patternType)
      .order('frequency', { ascending: false })
      .limit(20);

    if (error) return [];
    return (data || []).map(normalizePattern);
  }

  /**
   * Get error patterns for a specific module
   */
  static async getErrorPatterns(module?: string): Promise<LearningPattern[]> {
    let query = supabase
      .from('learning_patterns')
      .select('*')
      .eq('pattern_type', 'error')
      .order('frequency', { ascending: false });

    if (module) query = query.contains('metadata', { module });
    const { data, error } = await query.limit(20);
    if (error) return [];
    return (data || []).map(normalizePattern);
  }

  /**
   * Get success patterns (best practices above threshold)
   */
  static async getSuccessPatterns(minRate: number = 80): Promise<LearningPattern[]> {
    const { data, error } = await supabase
      .from('learning_patterns')
      .select('*')
      .eq('pattern_type', 'success')
      .gte('success_rate', minRate)
      .order('success_rate', { ascending: false })
      .limit(20);

    if (error) return [];
    return (data || []).map(normalizePattern);
  }

  /**
   * Get recommendations for a specific node
   */
  static async getModuleRecommendations(module: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('learning_patterns')
      .select('*')
      .contains('metadata', { module })
      .gte('confidence', 0.6)
      .order('confidence', { ascending: false });

    if (error) return [];

    const recs: any[] = [];
    for (const pattern of data || []) {
      if (Array.isArray(pattern.recommendations)) {
        recs.push(...pattern.recommendations.map((r: any) => ({
          ...r,
          pattern_name: pattern.pattern_name,
          confidence: pattern.confidence,
          success_rate: pattern.success_rate,
        })));
      }
    }
    return recs;
  }

  /**
   * Generate adaptive suggestions for BRAIN
   */
  static async generateBrainSuggestions(): Promise<string[]> {
    const patterns = await this.getHighConfidencePatterns(0.75);
    const suggestions: string[] = [];

    for (const p of patterns) {
      if (p.pattern_type === 'error' && p.frequency > 5) {
        suggestions.push(`⚠️ Frequent error in ${p.metadata.module}: ${p.pattern_name}`);
      }
      if (p.pattern_type === 'success' && p.success_rate > 90) {
        suggestions.push(`✅ Reliable: ${p.pattern_name} (${p.success_rate.toFixed(1)}%)`);
      }
      if (p.pattern_type === 'frequency' && p.frequency > 50) {
        suggestions.push(`📊 High-frequency: ${p.pattern_name} — consider caching`);
      }
    }

    return suggestions;
  }
}

function normalizePattern(d: any): LearningPattern {
  return {
    ...d,
    recommendations: Array.isArray(d.recommendations) ? d.recommendations : [],
    metadata: typeof d.metadata === 'object' && d.metadata !== null ? d.metadata : {},
  };
}
