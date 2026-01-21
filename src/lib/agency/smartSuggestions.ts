/**
 * Smart Suggestions System
 * AI-powered follow-up suggestions and next-best-action recommendations
 */

import { TaskTypeId, TASK_TYPES, AgencyTask } from './agencyTasks';
import { Specialization } from './agencyTypes';
import { WorkflowTemplate, getAvailableWorkflows } from './taskTemplates';

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
// SUGGESTION RULES
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
        description: `Turn your "${lastTask.title}" research into a blog post or report`,
        actionLabel: 'Create Content',
        actionType: 'task',
        actionPayload: { 
          taskType: 'content_creation', 
          input: `Based on research: ${lastTask.title}`,
          context: lastTask.output_data 
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
        id: 'sug_seo_content',
        type: 'follow_up',
        priority: 'high',
        title: 'Fix SEO Issues',
        description: 'Create an action plan to address the SEO issues found',
        actionLabel: 'Create Action Plan',
        actionType: 'task',
        actionPayload: { 
          taskType: 'content_creation', 
          input: `SEO action plan for: ${lastTask.input_data?.url || 'target site'}`,
          context: lastTask.output_data 
        },
        icon: '📈',
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
        id: 'sug_intel_seo',
        type: 'follow_up',
        priority: 'medium',
        title: 'Analyze Their SEO',
        description: 'Run an SEO scan to understand their search strategy',
        actionLabel: 'Run SEO Scan',
        actionType: 'task',
        actionPayload: { 
          taskType: 'seo_scan',
          input: lastTask.output_data?.companyUrl || lastTask.input_data?.target
        },
        icon: '🔍',
      };
    },
  },
  
  // Suggest workflow when multiple related tasks
  {
    id: 'suggest_workflow',
    condition: (ctx) => {
      const researchCount = ctx.recentTasks.filter(t => 
        t.task_type === 'research' && t.status === 'completed'
      ).length;
      return researchCount >= 2;
    },
    generate: (ctx) => {
      const availableWorkflows = getAvailableWorkflows(ctx.teamSpecs);
      const topWorkflow = availableWorkflows[0];
      if (!topWorkflow) return null;
      
      return {
        id: 'sug_workflow',
        type: 'workflow',
        priority: 'medium',
        title: `Try: ${topWorkflow.name}`,
        description: topWorkflow.description,
        actionLabel: 'Start Workflow',
        actionType: 'workflow',
        actionPayload: { workflowId: topWorkflow.id },
        icon: topWorkflow.icon,
      };
    },
  },
  
  // Morning productivity suggestion
  {
    id: 'morning_brief',
    condition: (ctx) => {
      const hour = ctx.currentTime.getHours();
      return hour >= 6 && hour <= 10;
    },
    generate: () => ({
      id: 'sug_morning_brief',
      type: 'next_action',
      priority: 'low',
      title: 'Get Your Daily Brief',
      description: 'Start your day with a summary of pending tasks and opportunities',
      actionLabel: 'Get Brief',
      actionType: 'command',
      actionPayload: { command: '/brief' },
      icon: '☀️',
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
    generate: (ctx) => ({
      id: 'sug_idle_research',
      type: 'next_action',
      priority: 'low',
      title: 'Your Team is Ready',
      description: 'No recent activity - put your agents to work with some research',
      actionLabel: 'Start Research',
      actionType: 'command',
      actionPayload: { command: '/research' },
      icon: '🔍',
    }),
  },
  
  // Success rate optimization
  {
    id: 'optimize_success',
    condition: (ctx) => {
      return (ctx.agencyMetrics?.successRate || 1) < 0.85;
    },
    generate: () => ({
      id: 'sug_optimize',
      type: 'optimization',
      priority: 'medium',
      title: 'Improve Success Rate',
      description: 'Some tasks are failing. Review recent errors and adjust settings',
      actionLabel: 'View Issues',
      actionType: 'setting',
      actionPayload: { tab: 'tasks', filter: 'failed' },
      icon: '⚠️',
    }),
  },
  
  // Dream learning suggestion
  {
    id: 'enable_dream',
    condition: (ctx) => {
      const completedTasks = ctx.recentTasks.filter(t => t.status === 'completed').length;
      return completedTasks >= 10;
    },
    generate: () => ({
      id: 'sug_dream',
      type: 'insight',
      priority: 'low',
      title: 'Enable Dream Learning',
      description: 'Your agents have enough data to start learning and improving',
      actionLabel: 'Enable',
      actionType: 'setting',
      actionPayload: { tab: 'settings', setting: 'dream_learning' },
      icon: '🌙',
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

/**
 * Generate contextual quick replies based on last message/task
 */
export function generateQuickReplies(context: {
  lastMessage?: string;
  lastTask?: AgencyTask;
  teamSpecs: Specialization[];
}): QuickReply[] {
  const replies: QuickReply[] = [];
  
  // Context-based replies
  if (context.lastTask) {
    const taskType = context.lastTask.task_type;
    const taskTitle = context.lastTask.title;
    
    if (taskType === 'research') {
      replies.push(
        { id: 'dig_deeper', label: 'Dig Deeper', prompt: `Tell me more about ${taskTitle}`, icon: '🔍' },
        { id: 'summarize', label: 'Summarize', prompt: 'Give me a brief summary of the key findings', icon: '📋' },
        { id: 'create_content', label: 'Write About It', prompt: `Create a blog post about ${taskTitle}`, icon: '✍️' },
      );
    } else if (taskType === 'seo_scan') {
      replies.push(
        { id: 'fix_issues', label: 'Fix Issues', prompt: 'What are the top 3 issues I should fix?', icon: '🔧' },
        { id: 'compare', label: 'Compare', prompt: 'Compare this to my competitors', icon: '⚖️' },
        { id: 'action_plan', label: 'Action Plan', prompt: 'Create a prioritized action plan', icon: '📝' },
      );
    } else if (taskType === 'company_research') {
      replies.push(
        { id: 'swot', label: 'SWOT Analysis', prompt: 'Create a SWOT analysis for this company', icon: '📊' },
        { id: 'positioning', label: 'Positioning', prompt: 'How should I position against them?', icon: '🎯' },
        { id: 'opportunities', label: 'Opportunities', prompt: 'What opportunities do you see?', icon: '💡' },
      );
    }
  }
  
  // Default quick actions if no context
  if (replies.length === 0) {
    replies.push(
      { id: 'research', label: 'Research', prompt: '/research ', icon: '🔍' },
      { id: 'status', label: 'Status', prompt: '/status', icon: '📡' },
      { id: 'help', label: 'Help', prompt: '/help', icon: '❓' },
    );
  }
  
  return replies.slice(0, 4);
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Generate smart suggestions based on context
 */
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
  
  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  // Limit to top 3
  return suggestions.slice(0, 3);
}

/**
 * Get next best action for an agency
 */
export function getNextBestAction(context: SuggestionContext): SmartSuggestion | null {
  const suggestions = generateSuggestions(context);
  return suggestions[0] || null;
}

/**
 * Generate task-specific suggestions
 */
export function getTaskSuggestions(task: AgencyTask, teamSpecs: Specialization[]): SmartSuggestion[] {
  const context: SuggestionContext = {
    recentTasks: [task],
    teamSpecs,
    currentTime: new Date(),
  };
  
  return generateSuggestions(context);
}
