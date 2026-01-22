/**
 * Leader Task Delegation — Allows the leader to actually create and queue tasks
 * Parses AI responses and intents to create real tasks for the team
 */

import { supabase } from '@/integrations/supabase/client';
import { TASK_PRIMITIVES, type TaskPrimitiveId } from './skills/taskPrimitives';
import { 
  getTaskPrimitiveForCommand, 
  getCapabilitiesSummary, 
  OUT_OF_SCOPE_CAPABILITIES 
} from './agencyCommands';
import type { Specialization } from './agencyTypes';

export interface DelegationIntent {
  action: 'create_task' | 'cannot_do' | 'info' | 'clarify';
  taskType?: TaskPrimitiveId;
  title?: string;
  description?: string;
  input?: string;
  reason?: string;
  suggestedAlternative?: string;
}

export interface DelegationResult {
  success: boolean;
  taskId?: string;
  message: string;
  intent: DelegationIntent;
}

/**
 * Keywords that indicate the user wants to CREATE a task (not just discuss)
 */
const ACTION_KEYWORDS = [
  'do', 'run', 'execute', 'start', 'begin', 'launch',
  'create', 'make', 'generate', 'build', 'write',
  'research', 'analyze', 'audit', 'scan', 'find', 'search',
  'extract', 'scrape', 'map', 'crawl',
  'please', 'can you', 'could you', 'would you', 'i need', 'i want',
];

/**
 * Keywords that indicate out-of-scope requests
 */
const OUT_OF_SCOPE_KEYWORDS = [
  'submit', 'register', 'post to', 'sign up', 'create account',
  'send email', 'email them', 'contact them', 'reach out',
  'buy', 'purchase', 'pay', 'subscribe',
  'login', 'authenticate', 'access their',
];

/**
 * Detect if user wants to take action vs just chat
 */
export function detectActionIntent(message: string): boolean {
  const lower = message.toLowerCase();
  return ACTION_KEYWORDS.some(kw => lower.includes(kw));
}

/**
 * Detect if request is out of scope
 */
export function detectOutOfScope(message: string): { isOutOfScope: boolean; reason?: string } {
  const lower = message.toLowerCase();
  
  for (const kw of OUT_OF_SCOPE_KEYWORDS) {
    if (lower.includes(kw)) {
      if (kw.includes('submit') || kw.includes('register')) {
        return { 
          isOutOfScope: true, 
          reason: 'Submitting to external services requires API credentials we don\'t have configured.' 
        };
      }
      if (kw.includes('email') || kw.includes('contact')) {
        return { 
          isOutOfScope: true, 
          reason: 'Sending emails requires an email service (SMTP, SendGrid, etc.) to be connected.' 
        };
      }
      if (kw.includes('post to')) {
        return { 
          isOutOfScope: true, 
          reason: 'Posting to external sites requires authentication credentials for those platforms.' 
        };
      }
      if (kw.includes('buy') || kw.includes('purchase')) {
        return { 
          isOutOfScope: true, 
          reason: 'Making purchases requires payment integration we don\'t have access to.' 
        };
      }
      if (kw.includes('account') || kw.includes('login')) {
        return { 
          isOutOfScope: true, 
          reason: 'Creating accounts or logging into external services requires captcha solving and is not supported.' 
        };
      }
    }
  }
  
  return { isOutOfScope: false };
}

/**
 * Parse message to determine what task type to create
 */
export function parseTaskIntent(message: string): TaskPrimitiveId | null {
  const lower = message.toLowerCase();
  
  // Research intents
  if (lower.includes('research') || lower.includes('find information') || lower.includes('look up')) {
    if (lower.includes('competitor') || lower.includes('competition')) return 'competitive_profile';
    if (lower.includes('market') || lower.includes('industry')) return 'market_research';
    if (lower.includes('backlink')) return 'backlink_research';
    if (lower.includes('keyword')) return 'keyword_research';
    return 'web_research';
  }
  
  // SEO intents
  if (lower.includes('seo') || lower.includes('audit site') || lower.includes('check site')) {
    return 'seo_audit';
  }
  if (lower.includes('keyword')) return 'keyword_research';
  if (lower.includes('backlink')) return 'backlink_research';
  
  // Data intents
  if (lower.includes('extract') || lower.includes('pull data')) return 'data_extraction';
  if (lower.includes('map') || lower.includes('sitemap') || lower.includes('all pages')) return 'site_mapping';
  if (lower.includes('scrape') || lower.includes('crawl')) return 'content_scrape';
  
  // Content intents
  if (lower.includes('write') || lower.includes('create content') || lower.includes('blog')) return 'content_generation';
  if (lower.includes('outreach') || lower.includes('email draft')) return 'outreach_draft';
  if (lower.includes('social') || lower.includes('post') || lower.includes('tweet')) return 'social_content';
  
  // Analysis intents
  if (lower.includes('trend') || lower.includes('trending')) return 'trend_analysis';
  if (lower.includes('brand') || lower.includes('company')) return 'brand_analysis';
  if (lower.includes('analyze') || lower.includes('analysis')) return 'trend_analysis';
  
  return null;
}

/**
 * Extract the target/subject from a message
 */
export function extractTarget(message: string): string {
  // Look for URLs
  const urlMatch = message.match(/https?:\/\/[^\s]+/);
  if (urlMatch) return urlMatch[0];
  
  // Look for quoted text
  const quotedMatch = message.match(/"([^"]+)"|'([^']+)'/);
  if (quotedMatch) return quotedMatch[1] || quotedMatch[2];
  
  // Look for "about X", "for X", "on X"
  const aboutMatch = message.match(/(?:about|for|on|regarding)\s+(.+?)(?:\.|$)/i);
  if (aboutMatch) return aboutMatch[1].trim();
  
  // Fallback: use the message itself
  return message.slice(0, 100);
}

/**
 * Create a task based on the delegation intent
 */
export async function delegateTask(
  agencyId: string,
  intent: DelegationIntent,
  assignToMemberId?: string
): Promise<DelegationResult> {
  if (intent.action !== 'create_task' || !intent.taskType) {
    return {
      success: false,
      message: intent.reason || 'No task to create',
      intent,
    };
  }
  
  const primitive = TASK_PRIMITIVES[intent.taskType];
  if (!primitive) {
    return {
      success: false,
      message: `Unknown task type: ${intent.taskType}`,
      intent,
    };
  }
  
  try {
    const { data, error } = await supabase
      .from('agency_tasks')
      .insert({
        agency_id: agencyId,
        title: intent.title || `${primitive.name}: ${intent.input?.slice(0, 50) || 'New task'}`,
        description: intent.description || intent.input,
        task_type: intent.taskType,
        status: 'queued',
        priority: 50,
        progress: 0,
        input_data: { query: intent.input, raw_message: intent.description },
        output_data: {},
        assigned_member_id: assignToMemberId || null,
        metadata: { createdViaChat: true },
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      success: true,
      taskId: data.id,
      message: `I've created a "${primitive.name}" task and added it to the queue. The team will process it shortly.`,
      intent,
    };
  } catch (err) {
    console.error('Error delegating task:', err);
    return {
      success: false,
      message: 'Failed to create the task. Please try again.',
      intent,
    };
  }
}

/**
 * Main function: Analyze user message and create appropriate response/task
 */
export async function processUserRequest(
  agencyId: string,
  message: string,
  teamSpecs: Specialization[],
  assignToMemberId?: string
): Promise<{ 
  shouldCreateTask: boolean; 
  delegationResult?: DelegationResult;
  leaderResponse: string;
}> {
  // Check if out of scope
  const { isOutOfScope, reason } = detectOutOfScope(message);
  if (isOutOfScope) {
    const capabilities = getCapabilitiesSummary();
    return {
      shouldCreateTask: false,
      leaderResponse: `I need to be upfront with you — **${reason}**\n\n**What we CAN do:**\n${capabilities.canDo.map(c => `• ${c}`).join('\n')}\n\n**What would be needed:**\nTo enable this capability, you'd need to connect an appropriate API or service (like SendGrid for emails, or platform OAuth for posting).`,
    };
  }
  
  // Check if user wants action
  const wantsAction = detectActionIntent(message);
  if (!wantsAction) {
    // Just chatting, no task needed
    return {
      shouldCreateTask: false,
      leaderResponse: '', // Let the AI handle the response
    };
  }
  
  // Parse what task they want
  const taskType = parseTaskIntent(message);
  if (!taskType) {
    return {
      shouldCreateTask: false,
      leaderResponse: `I understand you want to take action. Could you be more specific about what you'd like us to do?\n\n**Available actions:**\n• Research topics or competitors\n• SEO audits and keyword research\n• Data extraction from websites\n• Content generation\n• Trend and brand analysis\n\nJust tell me what you need and I'll assign it to the right team member.`,
    };
  }
  
  // Extract target
  const target = extractTarget(message);
  
  // Create the intent
  const intent: DelegationIntent = {
    action: 'create_task',
    taskType,
    title: `${TASK_PRIMITIVES[taskType].name}`,
    description: message,
    input: target,
  };
  
  // Delegate the task
  const result = await delegateTask(agencyId, intent, assignToMemberId);
  
  if (result.success) {
    const primitive = TASK_PRIMITIVES[taskType];
    return {
      shouldCreateTask: true,
      delegationResult: result,
      leaderResponse: `**Task Created:** ${primitive.name}\n\n${primitive.icon} I've assigned this to the team. Target: *${target}*\n\nThe task is now in the queue and will be processed automatically. You can check the Tasks tab for progress.`,
    };
  }
  
  return {
    shouldCreateTask: false,
    delegationResult: result,
    leaderResponse: result.message,
  };
}
