/**
 * Smart Suggestions System — Uses ONLY executable tasks
 */

import { AgencyTask } from './agencyTasks';
import { Specialization } from './agencyTypes';
import { EXECUTABLE_TASKS, type ExecutableTask } from './executableTasks';

// ============================================================================
// SUGGESTION TYPES
// ============================================================================
export interface SmartSuggestion {
  id: string;
  type: 'follow_up' | 'next_action' | 'optimization' | 'insight' | 'workflow';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionLabel: string;
  actionType: 'task' | 'workflow' | 'command' | 'setting';
  actionPayload: Record<string, any>;
  icon: string;
  expiresAt?: Date;
}

export interface SuggestionContext {
  recentTasks: AgencyTask[];
  teamSpecs: Specialization[];
  agencyMetrics?: {
    successRate: number;
    avgTaskTime: number;
    topSkills: string[];
  };
  currentTime: Date;
}

// ============================================================================
// SUGGESTION RULES — All reference EXECUTABLE_TASKS
// ============================================================================

interface SuggestionRule {
  id: string;
  condition: (ctx: SuggestionContext) => boolean;
  generate: (ctx: SuggestionContext) => SmartSuggestion | null;
}

const SUGGESTION_RULES: SuggestionRule[] = [
  // Follow-up on research tasks
  {
    id: 'research_follow_up',
    condition: (ctx) => {
      const lastTask = ctx.recentTasks[0];
      return lastTask?.task_type === 'research' && lastTask?.status === 'completed';
    },
    generate: (ctx) => {
      const lastTask = ctx.recentTasks[0];
      return {
        id: 'sug_research_content',
        type: 'follow_up',
        priority: 'high',
        title: 'Create Content from Research',
        description: `Turn your "${lastTask.title}" research into an SEO article`,
        actionLabel: 'Create Article',
        actionType: 'task',
        actionPayload: { 
          taskId: 'seo_article', 
          input: `Based on research: ${lastTask.title}`,
        },
        icon: '✍️',
      };
    },
  },
  
  // SEO follow-up
  {
    id: 'seo_follow_up',
    condition: (ctx) => {
      const lastTask = ctx.recentTasks[0];
      return lastTask?.task_type === 'seo_scan' && lastTask?.status === 'completed';
    },
    generate: (ctx) => {
      const lastTask = ctx.recentTasks[0];
      return {
        id: 'sug_backlink_research',
        type: 'follow_up',
        priority: 'high',
        title: 'Find Backlink Opportunities',
        description: 'Research backlink sources to improve SEO',
        actionLabel: 'Find Backlinks',
        actionType: 'task',
        actionPayload: { 
          taskId: 'backlink_research', 
          input: lastTask.input_data?.url || lastTask.title,
        },
        icon: '🔗',
      };
    },
  },
  
  // Competitor research follow-up
  {
    id: 'intel_follow_up',
    condition: (ctx) => {
      const lastTask = ctx.recentTasks[0];
      return lastTask?.task_type === 'company_research' && lastTask?.status === 'completed';
    },
    generate: (ctx) => {
      const lastTask = ctx.recentTasks[0];
      return {
        id: 'sug_content_gap',
        type: 'follow_up',
        priority: 'medium',
        title: 'Analyze Content Gaps',
        description: 'Find content opportunities they\'re missing',
        actionLabel: 'Find Gaps',
        actionType: 'task',
        actionPayload: { 
          taskId: 'content_gap_analysis',
          input: lastTask.input_data?.target || lastTask.title,
        },
        icon: '🕳️',
      };
    },
  },
  
  // After content creation
  {
    id: 'content_follow_up',
    condition: (ctx) => {
      const lastTask = ctx.recentTasks[0];
      return lastTask?.task_type === 'content_creation' && lastTask?.status === 'completed';
    },
    generate: () => ({
      id: 'sug_social_content',
      type: 'follow_up',
      priority: 'medium',
      title: 'Create Social Posts',
      description: 'Promote your content on social media',
      actionLabel: 'Create Posts',
      actionType: 'task',
      actionPayload: { taskId: 'social_content' },
      icon: '📱',
    }),
  },

  // Learning suggestion after multiple tasks
  {
    id: 'learning_synthesis',
    condition: (ctx) => {
      const completedTasks = ctx.recentTasks.filter(t => t.status === 'completed');
      return completedTasks.length >= 3;
    },
    generate: () => ({
      id: 'sug_learn',
      type: 'optimization',
      priority: 'medium',
      title: 'Synthesize Learnings',
      description: 'Combine insights from recent tasks to improve',
      actionLabel: 'Synthesize',
      actionType: 'task',
      actionPayload: { taskId: 'knowledge_synthesis' },
      icon: '🔮',
    }),
  },

  // Skill improvement suggestion
  {
    id: 'skill_improvement',
    condition: (ctx) => {
      const failedTasks = ctx.recentTasks.filter(t => t.status === 'failed');
      return failedTasks.length > 0;
    },
    generate: () => ({
      id: 'sug_skill',
      type: 'optimization',
      priority: 'high',
      title: 'Improve Agent Skills',
      description: 'Assess and improve skills after failed task',
      actionLabel: 'Assess',
      actionType: 'task',
      actionPayload: { taskId: 'skill_assessment' },
      icon: '🎯',
    }),
  },

  // Workflow discovery after varied tasks
  {
    id: 'workflow_suggestion',
    condition: (ctx) => {
      const uniqueTypes = new Set(ctx.recentTasks.map(t => t.task_type));
      return uniqueTypes.size >= 3;
    },
    generate: () => ({
      id: 'sug_workflow',
      type: 'workflow',
      priority: 'medium',
      title: 'Discover Workflows',
      description: 'Find optimal multi-step sequences',
      actionLabel: 'Discover',
      actionType: 'task',
      actionPayload: { taskId: 'workflow_discovery' },
      icon: '🔄',
    }),
  },

  // Idle team suggestion
  {
    id: 'idle_research',
    condition: (ctx) => {
      const recentTaskCount = ctx.recentTasks.filter(t => {
        const created = new Date(t.created_at);
        const hourAgo = new Date(ctx.currentTime.getTime() - 3600000);
        return created > hourAgo;
      }).length;
      return recentTaskCount === 0;
    },
    generate: () => ({
      id: 'sug_idle_research',
      type: 'next_action',
      priority: 'low',
      title: 'Your Team is Ready',
      description: 'No recent activity - start with some research',
      actionLabel: 'Start Research',
      actionType: 'task',
      actionPayload: { taskId: 'web_research' },
      icon: '🔍',
    }),
  },
  
  // Business building suggestion
  {
    id: 'business_validation',
    condition: (ctx) => {
      const hasBusinessTasks = ctx.recentTasks.some(t => 
        t.task_type === 'research' && t.title.toLowerCase().includes('business')
      );
      return hasBusinessTasks;
    },
    generate: () => ({
      id: 'sug_validate',
      type: 'next_action',
      priority: 'medium',
      title: 'Validate Your Idea',
      description: 'Get market validation for your business concept',
      actionLabel: 'Validate',
      actionType: 'task',
      actionPayload: { taskId: 'startup_idea_validation' },
      icon: '✅',
    }),
  },

  // Domain expertise suggestion
  {
    id: 'domain_learning',
    condition: (ctx) => {
      const researchTasks = ctx.recentTasks.filter(t => t.task_type === 'research');
      // If multiple research on same topic, suggest deep dive
      const topics = researchTasks.map(t => t.title.toLowerCase());
      const topicCounts = topics.reduce((acc, t) => {
        acc[t] = (acc[t] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      return Object.values(topicCounts).some(c => c >= 2);
    },
    generate: () => ({
      id: 'sug_deep_dive',
      type: 'optimization',
      priority: 'medium',
      title: 'Industry Deep Dive',
      description: 'Become an expert in this domain',
      actionLabel: 'Deep Dive',
      actionType: 'task',
      actionPayload: { taskId: 'industry_deep_dive' },
      icon: '🏭',
    }),
  },
];

// ============================================================================
// QUICK REPLY SUGGESTIONS
// ============================================================================
export interface QuickReply {
  id: string;
  label: string;
  prompt: string;
  icon: string;
}

export function generateQuickReplies(context: {
  lastMessage?: string;
  lastTask?: AgencyTask;
  teamSpecs: Specialization[];
}): QuickReply[] {
  const replies: QuickReply[] = [];
  
  if (context.lastTask) {
    const taskType = context.lastTask.task_type;
    const taskTitle = context.lastTask.title;
    
    if (taskType === 'research') {
      replies.push(
        { id: 'dig_deeper', label: 'Dig Deeper', prompt: `Research more about ${taskTitle}`, icon: '🔍' },
        { id: 'create_content', label: 'Write Article', prompt: `Create an SEO article about ${taskTitle}`, icon: '✍️' },
        { id: 'find_competitors', label: 'Find Competitors', prompt: `Research competitors in ${taskTitle}`, icon: '🎯' },
      );
    } else if (taskType === 'seo_scan') {
      replies.push(
        { id: 'find_backlinks', label: 'Find Backlinks', prompt: 'Research backlink opportunities', icon: '🔗' },
        { id: 'keywords', label: 'Keyword Research', prompt: 'Do keyword research for this site', icon: '🔑' },
        { id: 'content_gaps', label: 'Content Gaps', prompt: 'Find content gaps vs competitors', icon: '🕳️' },
      );
    } else if (taskType === 'company_research') {
      replies.push(
        { id: 'seo_audit', label: 'SEO Audit', prompt: 'Run an SEO audit on their site', icon: '📈' },
        { id: 'pricing', label: 'Extract Pricing', prompt: 'Extract their pricing information', icon: '💰' },
        { id: 'outreach', label: 'Draft Outreach', prompt: 'Draft outreach email to them', icon: '📧' },
      );
    } else if (taskType === 'content_creation') {
      replies.push(
        { id: 'social', label: 'Social Posts', prompt: 'Create social media posts', icon: '📱' },
        { id: 'guest_pitch', label: 'Guest Pitch', prompt: 'Create a guest post pitch', icon: '✉️' },
      );
    }
  }
  
  // Default quick actions
  if (replies.length === 0) {
    replies.push(
      { id: 'research', label: 'Research', prompt: 'Research ', icon: '🔍' },
      { id: 'seo', label: 'SEO Audit', prompt: 'Run SEO audit on ', icon: '📈' },
      { id: 'competitor', label: 'Competitor Intel', prompt: 'Research competitor ', icon: '🎯' },
      { id: 'learn', label: 'Learn Domain', prompt: 'Learn about ', icon: '📚' },
    );
  }
  
  return replies.slice(0, 4);
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

export function generateSuggestions(context: SuggestionContext): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];
  
  for (const rule of SUGGESTION_RULES) {
    if (rule.condition(context)) {
      const suggestion = rule.generate(context);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }
  }
  
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return suggestions.slice(0, 3);
}

export function getNextBestAction(context: SuggestionContext): SmartSuggestion | null {
  const suggestions = generateSuggestions(context);
  return suggestions[0] || null;
}

export function getTaskSuggestions(task: AgencyTask, teamSpecs: Specialization[]): SmartSuggestion[] {
  const context: SuggestionContext = {
    recentTasks: [task],
    teamSpecs,
    currentTime: new Date(),
  };
  return generateSuggestions(context);
}
