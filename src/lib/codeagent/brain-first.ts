/**
 * Brain-First Check System
 * Query brain for coding skills before calling external LLMs
 */

import { supabase } from '@/integrations/supabase/client';
import { CORE_KNOWLEDGE, type KnowledgeEntry } from './knowledge';

export interface BrainCodeSkill {
  id: string;
  skillType: 'pattern' | 'template' | 'solution' | 'heuristic';
  title: string;
  content: string;
  confidence: number;
  successRate: number;
  useCount: number;
  lastUsed: Date | null;
  tags: string[];
}

export interface BrainCheckResult {
  hasRelevantSkills: boolean;
  skills: BrainCodeSkill[];
  canAnswerLocally: boolean;
  localAnswer?: string;
  confidenceThreshold: number;
  recommendedAction: 'use_brain' | 'call_llm' | 'hybrid';
}

// Confidence threshold for using brain-only response
const BRAIN_CONFIDENCE_THRESHOLD = 0.75;

// Minimum skills needed for brain-only response
const MIN_SKILLS_FOR_LOCAL = 2;

/**
 * Check brain for relevant coding skills before calling external LLM
 */
export async function checkBrainFirst(
  query: string,
  module: string,
  changeType: string
): Promise<BrainCheckResult> {
  const skills: BrainCodeSkill[] = [];
  
  try {
    // 1. Check brain_memories for code patterns
    const { data: patterns } = await supabase
      .from('brain_memories')
      .select('id, content, confidence, metadata')
      .eq('memory_type', 'code_pattern')
      .gte('confidence', 0.5)
      .order('confidence', { ascending: false })
      .limit(10);
    
    if (patterns) {
      for (const p of patterns as unknown as Array<{id: string; content: string; confidence: number; metadata: Record<string, unknown> | null}>) {
        const tags = (p.metadata?.tags as string[]) || [];
        const isRelevant = checkRelevance(p.content, tags, query, module, changeType);
        if (isRelevant) {
          skills.push({
            id: p.id,
            skillType: 'pattern',
            title: extractTitle(p.content),
            content: p.content,
            confidence: p.confidence || 0.5,
            successRate: p.metadata?.success_rate as number || 0.7,
            useCount: p.metadata?.use_count as number || 0,
            lastUsed: null,
            tags
          });
        }
      }
    }
    
    // 2. Check learning_patterns for heuristics (sanitize inputs for query)
    const safeModule = module.replace(/[%_'"\\]/g, '');
    const safeChangeType = changeType.replace(/[%_'"\\]/g, '');
    const { data: heuristics } = await supabase
      .from('learning_patterns')
      .select('id, pattern_name, description, confidence, success_rate')
      .or(`pattern_name.ilike.%${safeModule}%,pattern_name.ilike.%${safeChangeType}%`)
      .gte('confidence', 0.5)
      .limit(5);
    
    if (heuristics) {
      for (const h of heuristics as Array<{id: string; pattern_name: string; description: string | null; confidence: number; success_rate: number}>) {
        skills.push({
          id: h.id,
          skillType: 'heuristic',
          title: h.pattern_name,
          content: h.description || '',
          confidence: h.confidence || 0.5,
          successRate: h.success_rate || 0.7,
          useCount: 0,
          lastUsed: null,
          tags: [module, changeType]
        });
      }
    }
    
    // 3. Check static core knowledge
    const coreMatches = CORE_KNOWLEDGE.filter(k => 
      k.tags.some(tag => 
        query.toLowerCase().includes(tag) ||
        module.includes(tag) ||
        changeType.includes(tag)
      )
    );
    
    for (const k of coreMatches) {
      skills.push({
        id: k.id,
        skillType: k.category === 'pattern' ? 'template' : 'heuristic',
        title: k.title,
        content: k.content,
        confidence: k.confidence,
        successRate: k.successRate,
        useCount: k.useCount,
        lastUsed: null,
        tags: k.tags
      });
    }
    
  } catch (error) {
    console.error('Brain check error:', error);
  }
  
  // Calculate if we can answer locally
  const avgConfidence = skills.length > 0
    ? skills.reduce((sum, s) => sum + s.confidence, 0) / skills.length
    : 0;
  
  const canAnswerLocally = skills.length >= MIN_SKILLS_FOR_LOCAL && 
                          avgConfidence >= BRAIN_CONFIDENCE_THRESHOLD;
  
  // Generate local answer if possible
  let localAnswer: string | undefined;
  if (canAnswerLocally) {
    localAnswer = synthesizeLocalAnswer(skills, query, module, changeType);
  }
  
  // Determine recommended action
  let recommendedAction: BrainCheckResult['recommendedAction'];
  if (canAnswerLocally && avgConfidence >= 0.9) {
    recommendedAction = 'use_brain';
  } else if (skills.length > 0) {
    recommendedAction = 'hybrid';
  } else {
    recommendedAction = 'call_llm';
  }
  
  return {
    hasRelevantSkills: skills.length > 0,
    skills,
    canAnswerLocally,
    localAnswer,
    confidenceThreshold: BRAIN_CONFIDENCE_THRESHOLD,
    recommendedAction
  };
}

/**
 * Check if a pattern is relevant to the query
 */
function checkRelevance(
  content: string,
  tags: string[],
  query: string,
  module: string,
  changeType: string
): boolean {
  const queryLower = query.toLowerCase();
  const contentLower = content.toLowerCase();
  
  // Check tag matches
  const tagMatch = tags.some(tag => 
    queryLower.includes(tag.toLowerCase()) ||
    module.includes(tag.toLowerCase()) ||
    changeType.includes(tag.toLowerCase())
  );
  
  // Check content keyword matches
  const keywords = queryLower.split(/\s+/).filter(w => w.length > 3);
  const contentMatch = keywords.some(kw => contentLower.includes(kw));
  
  return tagMatch || contentMatch;
}

/**
 * Extract a title from content
 */
function extractTitle(content: string): string {
  const firstLine = content.split('\n')[0];
  if (firstLine.length <= 50) {
    return firstLine;
  }
  return firstLine.substring(0, 47) + '...';
}

/**
 * Synthesize a local answer from brain skills
 */
function synthesizeLocalAnswer(
  skills: BrainCodeSkill[],
  _query: string,
  module: string,
  changeType: string
): string {
  const templates = skills.filter(s => s.skillType === 'template' || s.skillType === 'pattern');
  const heuristics = skills.filter(s => s.skillType === 'heuristic');
  
  let answer = `Based on ${skills.length} learned patterns for ${module}/${changeType}:\n\n`;
  
  if (templates.length > 0) {
    answer += '**Relevant Patterns:**\n';
    for (const t of templates.slice(0, 3)) {
      answer += `- ${t.title} (${(t.confidence * 100).toFixed(0)}% confidence)\n`;
      answer += `  ${t.content.substring(0, 200)}...\n\n`;
    }
  }
  
  if (heuristics.length > 0) {
    answer += '**Heuristics:**\n';
    for (const h of heuristics.slice(0, 2)) {
      answer += `- ${h.title}: ${h.content.substring(0, 100)}\n`;
    }
  }
  
  return answer;
}

/**
 * Record skill usage for reinforcement learning
 */
export async function recordSkillUsage(
  skillId: string,
  success: boolean
): Promise<void> {
  try {
    // Update confidence based on outcome
    const delta = success ? 0.05 : -0.1;
    
    // Check if it's a brain_memories entry
    const { data } = await supabase
      .from('brain_memories')
      .select('confidence')
      .eq('id', skillId)
      .single();
    
    if (data) {
      const newConfidence = Math.max(0.1, Math.min(1.0, (data.confidence || 0.5) + delta));
      await supabase
        .from('brain_memories')
        .update({ 
          confidence: newConfidence,
          last_accessed: new Date().toISOString()
        })
        .eq('id', skillId);
    }
    
    // Log the usage
    await supabase.from('brain_events').insert({
      event_type: 'skill_used',
      module: 'evolution',
      outcome: success ? 'success' : 'failed',
      data: { skill_id: skillId, confidence_delta: delta }
    });
    
  } catch (error) {
    console.error('Failed to record skill usage:', error);
  }
}

/**
 * Get coding skill statistics from brain
 */
export async function getBrainCodingStats(): Promise<{
  totalSkills: number;
  avgConfidence: number;
  topSkills: BrainCodeSkill[];
  learningRate: number;
}> {
  try {
    const { data, count } = await supabase
      .from('brain_memories')
      .select('id, content, confidence, metadata', { count: 'exact' })
      .eq('memory_type', 'code_pattern')
      .order('confidence', { ascending: false })
      .limit(5);
    
    const skills = ((data || []) as unknown as Array<{id: string; content: string; confidence: number; metadata: Record<string, unknown> | null}>).map((p) => ({
      id: p.id,
      skillType: 'pattern' as const,
      title: extractTitle(p.content),
      content: p.content,
      confidence: p.confidence || 0.5,
      successRate: p.metadata?.success_rate as number || 0.7,
      useCount: p.metadata?.use_count as number || 0,
      lastUsed: null,
      tags: (p.metadata?.tags as string[]) || []
    }));
    
    const avgConfidence = skills.length > 0
      ? skills.reduce((sum, s) => sum + s.confidence, 0) / skills.length
      : 0;
    
    // Calculate learning rate from recent events
    const { count: recentLearning } = await supabase
      .from('brain_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'code_learned')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    return {
      totalSkills: count || 0,
      avgConfidence,
      topSkills: skills,
      learningRate: recentLearning || 0
    };
    
  } catch {
    return {
      totalSkills: 0,
      avgConfidence: 0,
      topSkills: [],
      learningRate: 0
    };
  }
}
