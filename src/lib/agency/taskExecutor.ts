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
 * Now with extended learning time and deeper crawling
 */
export async function startIdleLearning(
  agencyId: string,
  memberId: string,
  specialization: string
): Promise<void> {
  try {
    // Extended topic pool organized by specialization with real-world relevance
    const learningTopics: Record<string, string[]> = {
      research: [
        'latest AI research methodologies 2025',
        'advanced data collection techniques',
        'academic research best practices',
        'systematic literature review methods',
        'primary vs secondary research approaches',
      ],
      seo: [
        'Google algorithm updates 2025',
        'technical SEO audit checklist',
        'backlink building strategies that work',
        'Core Web Vitals optimization',
        'semantic SEO and entity optimization',
        'local SEO ranking factors',
      ],
      coding: [
        'TypeScript 5.0 advanced patterns',
        'React Server Components best practices',
        'microservices architecture patterns',
        'performance optimization techniques',
        'security best practices for web apps',
        'API design patterns RESTful GraphQL',
      ],
      creative: [
        'content marketing trends 2025',
        'viral copywriting techniques',
        'brand storytelling frameworks',
        'emotional marketing psychology',
        'content repurposing strategies',
      ],
      strategy: [
        'business strategy frameworks OKRs',
        'competitive positioning models',
        'market entry strategies',
        'blue ocean strategy principles',
        'digital transformation playbook',
      ],
      analytics: [
        'predictive analytics techniques',
        'data visualization best practices',
        'cohort analysis methods',
        'attribution modeling approaches',
        'A/B testing statistical significance',
      ],
      audit: [
        'SOC 2 compliance requirements',
        'GDPR compliance checklist',
        'security audit frameworks',
        'code quality metrics',
        'accessibility WCAG guidelines',
      ],
      security: [
        'OWASP top 10 vulnerabilities 2025',
        'zero trust architecture',
        'incident response playbook',
        'penetration testing methodologies',
        'cloud security best practices AWS Azure',
      ],
      design: [
        'UI design trends 2025',
        'accessibility in design systems',
        'motion design principles',
        'design token architecture',
        'responsive design patterns',
      ],
      marketing: [
        'growth marketing playbook',
        'influencer marketing ROI',
        'email marketing automation',
        'social media algorithm changes',
        'B2B marketing strategies',
      ],
      sales: [
        'sales prospecting techniques',
        'account based selling strategies',
        'sales enablement best practices',
        'CRM optimization tips',
        'cold outreach that converts',
      ],
      finance: [
        'financial modeling techniques',
        'startup valuation methods',
        'unit economics analysis',
        'SaaS metrics and benchmarks',
        'cash flow management',
      ],
      ops: [
        'DevOps automation patterns',
        'CI/CD pipeline optimization',
        'infrastructure as code',
        'monitoring and observability',
        'incident management processes',
      ],
    };

    const specKey = specialization.toLowerCase();
    const topics = learningTopics[specKey] || learningTopics.research;
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    console.log(`📚 Starting deep learning for ${specialization}: ${randomTopic}`);

    // Create a learning task with extended duration
    const { data: task } = await supabase
      .from('agency_tasks')
      .insert({
        agency_id: agencyId,
        title: `[Learning] ${randomTopic}`,
        description: `Deep learning task: Researching "${randomTopic}" across multiple sources`,
        task_type: 'research',
        status: 'queued',
        priority: 10, // Low priority
        progress: 0,
        input_data: { 
          rawInput: randomTopic, 
          isLearning: true,
          learningDomain: specialization,
          crawlDepth: 5, // Go 5 links deep
          estimatedMinutes: 5, // Extended learning time
        },
        assigned_member_id: memberId,
        metadata: { 
          source: 'idle_learning',
          extended: true,
          startedAt: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (task) {
      // Execute in background (fire and forget)
      executeTask({
        taskId: task.id,
        agencyId,
        taskType: 'research',
        inputData: { 
          rawInput: randomTopic, 
          isLearning: true,
          crawlDepth: 5,
        },
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
