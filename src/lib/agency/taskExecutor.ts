/**
 * Agency Task Executor — Invokes edge functions to actually execute tasks
 * Handles real-time progress updates and error recovery
 */

import { supabase } from '@/integrations/supabase/client';
import type { AgencyTask, TaskTypeId } from './agencyTasks';

interface ExecuteTaskOptions {
  taskId: string;
  agencyId: string;
  taskType: TaskTypeId;
  inputData: Record<string, any>;
  memberId?: string;
  researchDomain?: string;
}

interface ExecuteTaskResult {
  success: boolean;
  cancelled?: boolean;
  result?: string;
  insights?: string[];
  error?: string;
  provider?: string;
  executionTimeMs?: number;
}

/**
 * Execute a task by invoking the edge function
 * This is the main entry point for real task execution
 */
export async function executeTask(options: ExecuteTaskOptions): Promise<ExecuteTaskResult> {
  const startTime = Date.now();
  
  try {
    console.log(`🚀 Executing task ${options.taskId} (${options.taskType})`);
    
    // Call the edge function to execute the task
    const { data, error } = await supabase.functions.invoke('pf-agency-execute-task', {
      body: {
        taskId: options.taskId,
        agencyId: options.agencyId,
        taskType: options.taskType,
        inputData: options.inputData,
        memberId: options.memberId,
        researchDomain: options.researchDomain,
      },
    });

    const executionTimeMs = Date.now() - startTime;

    if (error) {
      console.error('❌ Task execution error:', error);
      return {
        success: false,
        error: error.message || 'Task execution failed',
        executionTimeMs,
      };
    }

    if (data?.cancelled) {
      return {
        success: true,
        cancelled: true,
        executionTimeMs,
      };
    }

    if (!data?.success) {
      return {
        success: false,
        error: data?.error || 'Unknown execution error',
        executionTimeMs,
      };
    }

    console.log(`✅ Task ${options.taskId} completed in ${executionTimeMs}ms`);
    
    return {
      success: true,
      result: data.result,
      insights: data.insights,
      provider: data.provider,
      executionTimeMs,
    };

  } catch (err) {
    const executionTimeMs = Date.now() - startTime;
    console.error('❌ Task execution exception:', err);
    
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error',
      executionTimeMs,
    };
  }
}

/**
 * Start idle learning for an agent
 * Triggers background research on the agent's specialty domain
 */
export async function startIdleLearning(
  agencyId: string,
  memberId: string,
  specialization: string
): Promise<void> {
  try {
    // Map specializations to research topics
    const learningTopics: Record<string, string[]> = {
      research: ['latest AI developments', 'research methodologies', 'data analysis techniques'],
      seo: ['SEO best practices 2025', 'Google algorithm updates', 'backlink strategies'],
      code: ['software architecture patterns', 'TypeScript advanced patterns', 'performance optimization'],
      creative: ['content marketing trends', 'copywriting techniques', 'brand storytelling'],
      strategy: ['business strategy frameworks', 'competitive analysis methods', 'market positioning'],
      analytics: ['data visualization best practices', 'analytics interpretation', 'KPI frameworks'],
      audit: ['compliance frameworks', 'quality assurance methods', 'risk assessment'],
      security: ['cybersecurity trends', 'vulnerability assessment', 'security best practices'],
    };

    const topics = learningTopics[specialization.toLowerCase()] || learningTopics.research;
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    console.log(`📚 Starting idle learning for ${specialization}: ${randomTopic}`);

    // Create a low-priority learning task
    const { data: task } = await supabase
      .from('agency_tasks')
      .insert({
        agency_id: agencyId,
        title: `[Learning] ${randomTopic}`,
        description: `Background learning task: ${randomTopic}`,
        task_type: 'research',
        status: 'queued',
        priority: 10, // Low priority
        progress: 0,
        input_data: { 
          rawInput: randomTopic, 
          isLearning: true,
          learningDomain: specialization,
        },
        assigned_member_id: memberId,
        metadata: { source: 'idle_learning' },
      })
      .select()
      .single();

    if (task) {
      // Execute in background (fire and forget)
      executeTask({
        taskId: task.id,
        agencyId,
        taskType: 'research',
        inputData: { rawInput: randomTopic, isLearning: true },
        memberId,
      }).catch(err => console.warn('Idle learning error (non-critical):', err));
    }

  } catch (err) {
    console.warn('Failed to start idle learning (non-critical):', err);
  }
}

/**
 * Execute web research using available connectors
 */
export async function executeWebResearch(
  query: string,
  options: {
    depth?: number;
    domains?: string[];
    includeLinks?: boolean;
  } = {}
): Promise<{ content: string; sources: string[] }> {
  try {
    // Try Perplexity first for AI-powered search
    const { data: perplexityData, error: perplexityError } = await supabase.functions.invoke('pf-perplexity-search', {
      body: { query, options },
    });

    if (!perplexityError && perplexityData?.success) {
      return {
        content: perplexityData.content,
        sources: perplexityData.citations || [],
      };
    }

    // Fallback to Firecrawl for web scraping
    const { data: firecrawlData, error: firecrawlError } = await supabase.functions.invoke('firecrawl-search', {
      body: { query, options: { limit: 5 } },
    });

    if (!firecrawlError && firecrawlData?.success) {
      const results = firecrawlData.data || [];
      return {
        content: results.map((r: any) => r.markdown || r.description).join('\n\n'),
        sources: results.map((r: any) => r.url),
      };
    }

    // Final fallback - use AI gateway
    return {
      content: `Research query: ${query} (external search unavailable, using AI knowledge)`,
      sources: [],
    };

  } catch (err) {
    console.warn('Web research failed:', err);
    return {
      content: `Research query: ${query}`,
      sources: [],
    };
  }
}
