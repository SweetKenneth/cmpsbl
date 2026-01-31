/**
 * AutoBlog Brain Integration
 * Connects AutoBlog to Brain for research, learning, and reflection
 */

import { supabase } from '@/integrations/supabase/client';
import type { ResearchInsight, EvolutionDigest } from './types';

export interface SelfAuditResult {
  posts_reviewed: number;
  patterns_found: string[];
  recommendations: string[];
  quality_score: number;
  improvement_areas: string[];
}
  { name: 'OpenAI Blog', domain: 'openai.com/blog', focus: ['GPT', 'reasoning', 'agents'] },
  { name: 'DeepMind Research', domain: 'deepmind.google/research', focus: ['reinforcement learning', 'neuroscience', 'AGI'] },
  { name: 'Meta AI', domain: 'ai.meta.com', focus: ['open source', 'multimodal', 'efficiency'] },
  { name: 'Google AI Blog', domain: 'blog.google/technology/ai', focus: ['transformers', 'scaling', 'applications'] },
  { name: 'Cognitive Architecture', domain: 'cogarch.org', focus: ['cognitive substrate', 'memory systems', 'reasoning'] },
];

/**
 * Gather research insights from brain knowledge and external sources
 */
export async function gatherResearchInsights(topics: string[]): Promise<ResearchInsight[]> {
  const insights: ResearchInsight[] = [];

  try {
    // Query brain's knowledge graph for related concepts
    const { data: nodes } = await supabase
      .from('brain_graph_nodes')
      .select('*')
      .or(topics.map(t => `label.ilike.%${t}%`).join(','))
      .order('weight', { ascending: false })
      .limit(20);

    if (nodes) {
      for (const node of nodes) {
        insights.push({
          source: 'brain_knowledge_graph',
          title: node.label,
          summary: node.description || `Knowledge node: ${node.node_type}`,
          relevance: node.weight || 0.5,
          topics: [node.node_type, node.cluster_id].filter(Boolean) as string[],
          discovered_at: new Date().toISOString(),
        });
      }
    }

    // Get recent brain reflections
    const { data: reflections } = await supabase
      .from('brain_reflections')
      .select('*')
      .order('reflection_date', { ascending: false })
      .limit(5);

    if (reflections) {
      for (const reflection of reflections) {
        insights.push({
          source: 'brain_reflection',
          title: `Daily Reflection: ${reflection.reflection_date}`,
          summary: reflection.summary?.substring(0, 500) || 'Reflection on system learning',
          relevance: 0.8,
          topics: ['learning', 'patterns', 'insights'],
          discovered_at: reflection.created_at,
        });
      }
    }

    // Get hot memories related to topics
    const { data: memories } = await supabase
      .from('brain_memory_hot')
      .select('*')
      .order('importance_score', { ascending: false })
      .limit(30);

    if (memories) {
      const relevantMemories = memories.filter(m => 
        topics.some(t => m.content?.toLowerCase().includes(t.toLowerCase()))
      );

      for (const memory of relevantMemories.slice(0, 10)) {
        insights.push({
          source: 'brain_hot_memory',
          title: memory.context || 'System Memory',
          summary: memory.content?.substring(0, 300) || '',
          relevance: memory.importance_score || 0.5,
          topics: memory.tags ? Object.keys(memory.tags) : [],
          discovered_at: memory.created_at,
        });
      }
    }

  } catch (error) {
    console.error('[AutoBlog] Error gathering research insights:', error);
  }

  return insights;
}

/**
 * Get recent evolution cycle results for blog content
 */
export async function getEvolutionDigests(limit = 5): Promise<EvolutionDigest[]> {
  const digests: EvolutionDigest[] = [];

  try {
    // Get verified evolution runs
    const { data: runs } = await supabase
      .from('evolution_runs')
      .select('*')
      .eq('phase', 'verified')
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (runs) {
      for (const run of runs) {
        // Get metadata which may contain improvement info
        const metadata = run.metadata as Record<string, unknown> | null;
        const improvements = metadata?.improvements as string[] || ['System optimization'];
        
        digests.push({
          run_id: run.run_id,
          phase: run.phase,
          improvements,
          health_delta: (metadata?.health_delta as number) || 0,
          summary: `Evolution cycle completed with ${improvements.length} improvements applied.`,
          completed_at: run.completed_at || run.updated_at,
        });
      }
    }
  } catch (error) {
    console.error('[AutoBlog] Error getting evolution digests:', error);
  }

  return digests;
}

/**
 * Perform self-audit of recent blog posts
 */
export async function performSelfAudit(): Promise<SelfAuditResult> {
  const result: SelfAuditResult = {
    posts_reviewed: 0,
    patterns_found: [],
    recommendations: [],
    quality_score: 0.8,
    improvement_areas: [],
  };

  try {
    // Get recent published posts
    const { data: recentPosts } = await supabase
      .from('autoblog_queue')
      .select('*, autoblog_drafts(*)')
      .eq('status', 'published')
      .order('completed_at', { ascending: false })
      .limit(20);

    if (recentPosts) {
      result.posts_reviewed = recentPosts.length;

      // Analyze channel distribution
      const channelCounts: Record<string, number> = {};
      for (const post of recentPosts) {
        channelCounts[post.channel] = (channelCounts[post.channel] || 0) + 1;
      }

      // Find patterns
      const dominantChannel = Object.entries(channelCounts)
        .sort((a, b) => b[1] - a[1])[0];
      
      if (dominantChannel && dominantChannel[1] > result.posts_reviewed * 0.5) {
        result.patterns_found.push(`Heavy focus on ${dominantChannel[0]} (${dominantChannel[1]}/${result.posts_reviewed})`);
        result.recommendations.push(`Diversify content across more channels`);
      }

      // Check topic diversity
      const topics = new Set(recentPosts.map(p => p.topic).filter(Boolean));
      if (topics.size < result.posts_reviewed * 0.3) {
        result.patterns_found.push('Limited topic diversity');
        result.improvement_areas.push('Explore broader range of topics');
      }

      // Calculate quality score based on completion rate
      const failedCount = recentPosts.filter(p => p.status === 'failed').length;
      result.quality_score = Math.max(0.5, 1 - (failedCount / result.posts_reviewed));
    }

    // Get runs to assess learning
    const { data: runs } = await supabase
      .from('autoblog_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (runs) {
      const successRate = runs.filter(r => r.outcome === 'success').length / runs.length;
      if (successRate < 0.7) {
        result.improvement_areas.push('Improve success rate (currently ' + Math.round(successRate * 100) + '%)');
      }
    }

  } catch (error) {
    console.error('[AutoBlog] Error performing self-audit:', error);
  }

  return result;
}

/**
 * Store learning from AutoBlog activity into Brain
 */
export async function captureAutoblogLearning(input: {
  topic: string;
  insights: string[];
  source: string;
  confidence: number;
}): Promise<boolean> {
  try {
    // Store as hot memory
    const { error } = await supabase
      .from('brain_memory_hot')
      .insert({
        content: `AutoBlog Learning: ${input.topic}\n\nInsights:\n${input.insights.join('\n')}\n\nSource: ${input.source}`,
        context: 'autoblog_learning',
        importance_score: input.confidence,
        tags: {
          source: 'autoblog',
          topic: input.topic,
          type: 'learning',
        },
      });

    if (error) {
      console.error('[AutoBlog] Failed to store learning:', error);
      return false;
    }

    // Log the learning event
    await supabase.from('brain_events').insert({
      module: 'autoblog',
      event_type: 'learning_captured',
      data: {
        topic: input.topic,
        insights_count: input.insights.length,
        confidence: input.confidence,
      },
      outcome: 'completed',
    });

    return true;
  } catch (error) {
    console.error('[AutoBlog] Error capturing learning:', error);
    return false;
  }
}

/**
 * Get cognitive substrate research topics
 */
export function getCognitiveSubstrateTopics(): string[] {
  return [
    'cognitive architecture',
    'memory tiering',
    'knowledge graph',
    'self-improvement',
    'autonomous systems',
    'machine consciousness',
    'recursive self-improvement',
    'neural symbolic integration',
    'multi-agent systems',
    'emergent behavior',
    'substrate independence',
    'cognitive enhancement',
  ];
}

/**
 * Generate content ideas from research and evolution
 */
export async function generateContentIdeas(): Promise<Array<{
  channel: string;
  topic: string;
  source_type: string;
  confidence: number;
  rationale: string;
}>> {
  const ideas: Array<{
    channel: string;
    topic: string;
    source_type: string;
    confidence: number;
    rationale: string;
  }> = [];

  // Check for new evolution results
  const digests = await getEvolutionDigests(1);
  if (digests.length > 0) {
    const latest = digests[0];
    ideas.push({
      channel: 'user_updates',
      topic: `System Enhancement: ${latest.improvements[0] || 'Performance Update'}`,
      source_type: 'evolution_cycle',
      confidence: 0.9,
      rationale: `Fresh evolution cycle completed with ${latest.improvements.length} improvements`,
    });
  }

  // Get brain insights for internal log
  const insights = await gatherResearchInsights(['learning', 'optimization']);
  if (insights.length > 0) {
    const topInsight = insights[0];
    ideas.push({
      channel: 'internal_log',
      topic: `Internal Planning: ${topInsight.title}`,
      source_type: 'brain_reflection',
      confidence: topInsight.relevance,
      rationale: 'Brain generated insight worth documenting',
    });
  }

  // Cognitive substrate digest opportunity
  const cogTopics = getCognitiveSubstrateTopics();
  const randomTopic = cogTopics[Math.floor(Math.random() * cogTopics.length)];
  ideas.push({
    channel: 'substrate_digest',
    topic: `Cognitive Substrate: ${randomTopic}`,
    source_type: 'knowledge_synthesis',
    confidence: 0.7,
    rationale: `Explore ${randomTopic} for substrate development`,
  });

  return ideas;
}
