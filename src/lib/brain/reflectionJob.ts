/**
 * CMPSBL® BRAIN — Reflection Job
 * Nightly summary of top-accessed memories and learning insights
 */

import { supabase } from '@/integrations/supabase/client';
import { getTopAccessedMemories } from './vectorSearch';

export interface ReflectionInsight {
  pattern: string;
  frequency: number;
  impact: string;
  lesson: boolean;
}

export interface DailyReflection {
  date: string;
  summary: string;
  topMemories: number;
  insights: ReflectionInsight[];
  recommendations: string[];
}

/**
 * Generate nightly reflection from top accessed memories
 */
export async function generateDailyReflection(): Promise<DailyReflection | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if reflection already exists for today
    const { data: existing } = await supabase
      .from('brain_reflections')
      .select('id')
      .eq('reflection_date', today)
      .single();
    
    if (existing) {
      console.log('Reflection already exists for today');
      return null;
    }
    
    // Get top 100 accessed memories from last 24 hours
    const memories = await getTopAccessedMemories(100);
    
    if (memories.length === 0) {
      console.log('No memories to reflect on');
      return null;
    }
    
    // Analyze patterns
    const contextCounts: Record<string, number> = {};
    const goalRefs: Record<string, number> = {};
    const lessonPatterns: ReflectionInsight[] = [];
    
    for (const memory of memories) {
      const context = memory.context || 'unknown';
      contextCounts[context] = (contextCounts[context] || 0) + 1;
      
      const goalRef = memory.tags?.goal_ref || 'unknown';
      goalRefs[goalRef] = (goalRefs[goalRef] || 0) + 1;
      
      // Identify lessons (high relevance + code context)
      if (memory.context === 'code' && memory.relevance > 0.9) {
        lessonPatterns.push({
          pattern: `Code pattern: ${memory.content.substring(0, 100)}...`,
          frequency: 1,
          impact: 'high',
          lesson: true,
        });
      }
    }
    
    // Build insights
    const insights: ReflectionInsight[] = [];
    
    for (const [context, count] of Object.entries(contextCounts)) {
      if (count > 10) {
        insights.push({
          pattern: `High focus on ${context} content`,
          frequency: count,
          impact: count > 30 ? 'high' : 'medium',
          lesson: false,
        });
      }
    }
    
    insights.push(...lessonPatterns.slice(0, 5)); // Top 5 lessons
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    const mostCommonContext = Object.entries(contextCounts)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (mostCommonContext) {
      recommendations.push(
        `Optimize ${mostCommonContext[0]} workflows - ${mostCommonContext[1]} accesses today`
      );
    }
    
    const mostCommonGoal = Object.entries(goalRefs)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (mostCommonGoal && mostCommonGoal[0] !== 'unknown') {
      recommendations.push(
        `Primary focus: "${mostCommonGoal[0]}" - ${mostCommonGoal[1]} related queries`
      );
    }
    
    if (insights.filter(i => i.lesson).length > 0) {
      recommendations.push(
        `${insights.filter(i => i.lesson).length} new code patterns identified - consider documenting`
      );
    }
    
    // Build summary
    const summary = `
Daily Brain Reflection - ${today}

Analyzed ${memories.length} top accessed memories.

Context Distribution:
${Object.entries(contextCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([ctx, count]) => `- ${ctx}: ${count}`)
  .join('\n')}

Top Insights:
${insights
  .slice(0, 10)
  .map(i => `- ${i.pattern} (${i.frequency}x, ${i.impact} impact)`)
  .join('\n')}

Recommendations:
${recommendations.map(r => `- ${r}`).join('\n')}
    `.trim();
    
    // Store reflection
    const { error } = await supabase
      .from('brain_reflections')
      .insert([{
        reflection_date: today,
        summary,
        lessons: insights.filter(i => i.lesson) as unknown as import('@/integrations/supabase/types').Json,
      }]);
    
    if (error) {
      console.error('Error storing reflection:', error);
      return null;
    }
    
    // Log event to brain_events if available
    try {
      await supabase.from('brain_events').insert({
        module: 'brain',
        event_type: 'daily_reflection',
        data: {
          date: today,
          memories_analyzed: memories.length,
          insights_found: insights.length,
          lessons_identified: insights.filter(i => i.lesson).length,
        },
        outcome: 'completed',
      });
    } catch (logError) {
      console.error('Failed to log reflection event:', logError);
    }
    
    console.log('Daily reflection generated successfully');
    
    return {
      date: today,
      summary,
      topMemories: memories.length,
      insights,
      recommendations,
    };
  } catch (err) {
    console.error('Error generating daily reflection:', err);
    return null;
  }
}

/**
 * Get recent reflections
 */
export async function getRecentReflections(days: number = 7): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('brain_reflections')
      .select('id, reflection_date, summary, lessons')
      .order('reflection_date', { ascending: false })
      .limit(days);
    
    if (error) {
      console.error('Error fetching reflections:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Error getting recent reflections:', err);
    return [];
  }
}

/**
 * Get all lessons learned
 */
export async function getAllLessons(): Promise<ReflectionInsight[]> {
  try {
    const { data, error } = await supabase
      .from('brain_reflections')
      .select('lessons')
      .order('reflection_date', { ascending: false })
      .limit(365);
    
    if (error) {
      console.error('Error fetching lessons:', error);
      return [];
    }
    
    const allLessons: ReflectionInsight[] = [];
    
    for (const reflection of data || []) {
      if (Array.isArray(reflection.lessons)) {
        allLessons.push(...(reflection.lessons as unknown as ReflectionInsight[]));
      }
    }
    
    return allLessons;
  } catch (err) {
    console.error('Error getting lessons:', err);
    return [];
  }
}
