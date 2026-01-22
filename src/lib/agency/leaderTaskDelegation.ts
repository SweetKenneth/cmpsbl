/**
 * Leader Task Delegation v3.0 — Comprehensive task creation from chat
 * Parses intents and creates real tasks for the expanded primitive set
 */

import { supabase } from '@/integrations/supabase/client';
import { TASK_PRIMITIVES, type TaskPrimitiveId } from './skills/taskPrimitives';
import { getCapabilitiesSummary, OUT_OF_SCOPE_CAPABILITIES } from './agencyCommands';
import type { Specialization } from './agencyTypes';

export interface DelegationIntent {
  action: 'create_task' | 'cannot_do' | 'info' | 'clarify';
  taskType?: TaskPrimitiveId;
  title?: string;
  description?: string;
  input?: string;
  reason?: string;
  suggestedAlternative?: string;
  wouldNeed?: string[];
}

export interface DelegationResult {
  success: boolean;
  taskId?: string;
  message: string;
  intent: DelegationIntent;
}

// Action keywords that indicate user wants to CREATE a task
const ACTION_KEYWORDS = [
  'do', 'run', 'execute', 'start', 'begin', 'launch', 'perform',
  'create', 'make', 'generate', 'build', 'write', 'draft', 'compose',
  'research', 'analyze', 'audit', 'scan', 'find', 'search', 'discover',
  'extract', 'scrape', 'map', 'crawl', 'pull', 'get', 'fetch',
  'validate', 'check', 'review', 'assess', 'evaluate',
  'please', 'can you', 'could you', 'would you', 'i need', 'i want',
  'help me', 'show me', 'give me', 'tell me how',
];

// Out-of-scope keywords
const OUT_OF_SCOPE_KEYWORDS = [
  { keywords: ['submit', 'register domain', 'index'], reason: 'Submitting to search engines requires API credentials we don\'t have.', alternative: 'backlink_research', wouldNeed: ['Google Search Console API', 'Bing Webmaster API'] },
  { keywords: ['post to', 'publish to', 'submit to forum', 'post on reddit'], reason: 'Posting to external sites requires authentication credentials.', alternative: 'comment_drafts', wouldNeed: ['OAuth credentials for each platform'] },
  { keywords: ['send email', 'email them', 'reach out to them'], reason: 'Sending emails requires an email service to be connected.', alternative: 'outreach_draft', wouldNeed: ['SendGrid', 'SMTP credentials', 'Email service API'] },
  { keywords: ['create account', 'sign up', 'register for'], reason: 'Creating accounts requires CAPTCHA solving.', alternative: null, wouldNeed: ['CAPTCHA solving service', 'Browser automation'] },
  { keywords: ['buy', 'purchase', 'pay for'], reason: 'Making purchases requires payment integration.', alternative: null, wouldNeed: ['Payment credentials'] },
  { keywords: ['login', 'authenticate', 'log into'], reason: 'Logging into external services is not supported.', alternative: null, wouldNeed: ['OAuth integration'] },
  { keywords: ['click', 'fill form', 'submit form'], reason: 'Interacting with page elements requires browser automation.', alternative: 'data_extraction', wouldNeed: ['Puppeteer/Playwright integration'] },
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
export function detectOutOfScope(message: string): { 
  isOutOfScope: boolean; 
  reason?: string; 
  alternative?: TaskPrimitiveId | null;
  wouldNeed?: string[];
} {
  const lower = message.toLowerCase();
  
  for (const scope of OUT_OF_SCOPE_KEYWORDS) {
    if (scope.keywords.some(kw => lower.includes(kw))) {
      return { 
        isOutOfScope: true, 
        reason: scope.reason,
        alternative: scope.alternative as TaskPrimitiveId | null,
        wouldNeed: scope.wouldNeed,
      };
    }
  }
  
  return { isOutOfScope: false };
}

/**
 * Parse message to determine task type - comprehensive matching
 */
export function parseTaskIntent(message: string): TaskPrimitiveId | null {
  const lower = message.toLowerCase();
  
  // ============ RESEARCH INTENTS ============
  if (lower.includes('niche') || lower.includes('underserved') || lower.includes('gap in market')) {
    return 'niche_discovery';
  }
  if (lower.includes('audience') || lower.includes('demographics') || lower.includes('target market')) {
    return 'audience_research';
  }
  if (lower.includes('competitor') || lower.includes('competition') || lower.includes('rival')) {
    return 'competitive_profile';
  }
  if (lower.includes('market research') || lower.includes('industry analysis')) {
    return 'market_research';
  }
  
  // ============ SEO INTENTS ============
  if (lower.includes('seo audit') || lower.includes('audit site') || lower.includes('check seo')) {
    return 'seo_audit';
  }
  if (lower.includes('keyword') && (lower.includes('research') || lower.includes('find') || lower.includes('discover'))) {
    return 'keyword_research';
  }
  if (lower.includes('backlink') || lower.includes('link building') || lower.includes('link opportunity')) {
    return 'backlink_research';
  }
  if (lower.includes('director') && (lower.includes('find') || lower.includes('discover') || lower.includes('list'))) {
    return 'directory_discovery';
  }
  if (lower.includes('serp') || lower.includes('search results') || lower.includes('ranking')) {
    return 'serp_analysis';
  }
  if (lower.includes('content gap') || lower.includes('missing content') || lower.includes('topic gap')) {
    return 'content_gap_analysis';
  }
  if (lower.includes('local seo') || lower.includes('local search') || lower.includes('citation')) {
    return 'local_seo_research';
  }
  
  // ============ DATA INTENTS ============
  if (lower.includes('extract') && (lower.includes('data') || lower.includes('information'))) {
    return 'data_extraction';
  }
  if (lower.includes('sitemap') || lower.includes('map site') || lower.includes('all pages on')) {
    return 'site_mapping';
  }
  if (lower.includes('scrape') || lower.includes('crawl')) {
    return 'content_scrape';
  }
  if (lower.includes('contact') && (lower.includes('extract') || lower.includes('find') || lower.includes('get'))) {
    return 'contact_extraction';
  }
  if (lower.includes('pricing') && (lower.includes('extract') || lower.includes('get') || lower.includes('compare'))) {
    return 'pricing_extraction';
  }
  if (lower.includes('review') && (lower.includes('aggregate') || lower.includes('collect') || lower.includes('analyze'))) {
    return 'review_aggregation';
  }
  
  // ============ CONTENT INTENTS ============
  if (lower.includes('seo article') || lower.includes('blog post for seo')) {
    return 'seo_article';
  }
  if (lower.includes('guest post') || lower.includes('guest blog') || lower.includes('pitch for blog')) {
    return 'guest_post_pitch';
  }
  if (lower.includes('press release') || lower.includes('pr announcement')) {
    return 'press_release';
  }
  if (lower.includes('comment') && (lower.includes('draft') || lower.includes('write') || lower.includes('forum'))) {
    return 'comment_drafts';
  }
  if (lower.includes('product description') || lower.includes('describe product')) {
    return 'product_description';
  }
  if (lower.includes('outreach') || lower.includes('cold email') || lower.includes('email template')) {
    return 'outreach_draft';
  }
  if (lower.includes('social') && (lower.includes('post') || lower.includes('content') || lower.includes('media'))) {
    return 'social_content';
  }
  if (lower.includes('write') || lower.includes('content') || lower.includes('article') || lower.includes('blog')) {
    return 'content_generation';
  }
  
  // ============ BUSINESS INTENTS ============
  if (lower.includes('business name') || lower.includes('company name') || lower.includes('name ideas')) {
    return 'business_name_ideas';
  }
  if (lower.includes('value prop') || lower.includes('unique selling') || lower.includes('usp')) {
    return 'value_proposition';
  }
  if (lower.includes('validate') && (lower.includes('idea') || lower.includes('startup') || lower.includes('business'))) {
    return 'startup_idea_validation';
  }
  if (lower.includes('landing page') && (lower.includes('copy') || lower.includes('text') || lower.includes('write'))) {
    return 'landing_page_copy';
  }
  if (lower.includes('pitch deck') || lower.includes('investor pitch') || lower.includes('presentation outline')) {
    return 'pitch_deck_outline';
  }
  if (lower.includes('business model') && (lower.includes('analyze') || lower.includes('review'))) {
    return 'business_model_analysis';
  }
  
  // ============ ANALYSIS INTENTS ============
  if (lower.includes('trend') || lower.includes('trending')) {
    return 'trend_analysis';
  }
  if (lower.includes('brand') && (lower.includes('analyze') || lower.includes('analysis') || lower.includes('review'))) {
    return 'brand_analysis';
  }
  if (lower.includes('sentiment') || lower.includes('opinion') || lower.includes('feeling about')) {
    return 'sentiment_analysis';
  }
  if (lower.includes('tech stack') || lower.includes('technologies used') || lower.includes('what tech')) {
    return 'tech_stack_analysis';
  }
  
  // ============ LEARNING INTENTS ============
  if (lower.includes('learn') || lower.includes('improve skill') || lower.includes('get better at')) {
    return 'skill_improvement';
  }
  if (lower.includes('expertise') || lower.includes('domain knowledge') || lower.includes('become expert')) {
    return 'domain_knowledge';
  }
  if (lower.includes('tool') && (lower.includes('research') || lower.includes('find') || lower.includes('recommend'))) {
    return 'tool_research';
  }
  if (lower.includes('optimize') && (lower.includes('workflow') || lower.includes('process'))) {
    return 'workflow_optimization';
  }
  if (lower.includes('heuristic') || lower.includes('pattern') || lower.includes('best practice')) {
    return 'heuristic_extraction';
  }
  
  // ============ FALLBACK - GENERAL RESEARCH ============
  if (lower.includes('research') || lower.includes('find') || lower.includes('search') || lower.includes('look up')) {
    return 'web_research';
  }
  if (lower.includes('analyze') || lower.includes('analysis')) {
    return 'trend_analysis';
  }
  
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
  const aboutMatch = message.match(/(?:about|for|on|regarding|of|in)\s+(.+?)(?:\.|,|$)/i);
  if (aboutMatch) return aboutMatch[1].trim();
  
  // Look for domain names
  const domainMatch = message.match(/([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/);
  if (domainMatch) return domainMatch[1];
  
  // Fallback: clean up the message
  return message.replace(/^(can you |please |i need |i want |help me )/i, '').slice(0, 100);
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
        input_data: { 
          query: intent.input, 
          raw_message: intent.description,
          category: primitive.category,
        },
        output_data: {},
        assigned_member_id: assignToMemberId || null,
        metadata: { 
          createdViaChat: true,
          primitive: {
            id: primitive.id,
            category: primitive.category,
            handlers: primitive.handlers,
          }
        },
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
  const { isOutOfScope, reason, alternative, wouldNeed } = detectOutOfScope(message);
  if (isOutOfScope) {
    const capabilities = getCapabilitiesSummary();
    
    let response = `I need to be upfront with you — **${reason}**\n\n`;
    
    if (alternative && TASK_PRIMITIVES[alternative]) {
      const altPrimitive = TASK_PRIMITIVES[alternative];
      response += `**What I CAN do instead:** ${altPrimitive.icon} ${altPrimitive.name}\n${altPrimitive.description}\n\nWould you like me to do that?\n\n`;
    }
    
    if (wouldNeed && wouldNeed.length > 0) {
      response += `**To enable this, you'd need:**\n${wouldNeed.map(n => `• ${n}`).join('\n')}\n\n`;
    }
    
    response += `**Other things we CAN do:**\n${capabilities.canDo.slice(0, 5).map(c => `• ${c}`).join('\n')}`;
    
    return {
      shouldCreateTask: false,
      leaderResponse: response,
    };
  }
  
  // Check if user wants action
  const wantsAction = detectActionIntent(message);
  if (!wantsAction) {
    // Just chatting, let AI handle
    return {
      shouldCreateTask: false,
      leaderResponse: '',
    };
  }
  
  // Parse what task they want
  const taskType = parseTaskIntent(message);
  if (!taskType) {
    const capabilities = getCapabilitiesSummary();
    return {
      shouldCreateTask: false,
      leaderResponse: `I understand you want to take action. Could you be more specific about what you'd like us to do?\n\n**Available actions:**\n${capabilities.canDo.slice(0, 8).map(c => `• ${c}`).join('\n')}\n\nJust tell me what you need and I'll assign it to the right team member.`,
    };
  }
  
  // Extract target
  const target = extractTarget(message);
  const primitive = TASK_PRIMITIVES[taskType];
  
  // Create the intent
  const intent: DelegationIntent = {
    action: 'create_task',
    taskType,
    title: `${primitive.name}`,
    description: message,
    input: target,
  };
  
  // Delegate the task
  const result = await delegateTask(agencyId, intent, assignToMemberId);
  
  if (result.success) {
    return {
      shouldCreateTask: true,
      delegationResult: result,
      leaderResponse: `**✅ Task Created:** ${primitive.name}\n\n${primitive.icon} I've assigned this to the team.\n**Target:** *${target}*\n**Category:** ${primitive.category}\n\nThe task is now in the queue and will be processed automatically. Check the Tasks tab for progress.`,
    };
  }
  
  return {
    shouldCreateTask: false,
    delegationResult: result,
    leaderResponse: result.message,
  };
}

/**
 * Get a list of suggested tasks based on team composition
 */
export function getSuggestedTasks(teamSpecs: Specialization[]): { id: TaskPrimitiveId; name: string; icon: string; description: string }[] {
  const suggestions: { id: TaskPrimitiveId; name: string; icon: string; description: string }[] = [];
  
  // Always suggest these universal tasks
  suggestions.push(
    { id: 'web_research', name: 'Web Research', icon: '🔍', description: 'Research any topic' },
    { id: 'competitive_profile', name: 'Competitor Analysis', icon: '🎯', description: 'Analyze competitors' },
  );
  
  // Add SEO tasks if team has SEO spec
  if (teamSpecs.includes('SEO')) {
    suggestions.push(
      { id: 'seo_audit', name: 'SEO Audit', icon: '📈', description: 'Audit a website' },
      { id: 'backlink_research', name: 'Backlink Research', icon: '🔗', description: 'Find link opportunities' },
    );
  }
  
  // Add content tasks if team has Writing spec
  if (teamSpecs.includes('Writing')) {
    suggestions.push(
      { id: 'content_generation', name: 'Content Generation', icon: '✍️', description: 'Generate articles' },
      { id: 'guest_post_pitch', name: 'Guest Post Pitch', icon: '✉️', description: 'Create pitches' },
    );
  }
  
  // Add business tasks
  if (teamSpecs.includes('Analyst') || teamSpecs.includes('Intel')) {
    suggestions.push(
      { id: 'startup_idea_validation', name: 'Idea Validation', icon: '✅', description: 'Validate business ideas' },
      { id: 'market_research', name: 'Market Research', icon: '📊', description: 'Research markets' },
    );
  }
  
  return suggestions.slice(0, 6);
}
