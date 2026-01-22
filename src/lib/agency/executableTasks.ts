/**
 * Executable Tasks Registry — Single source of truth for what the agency can actually do
 * 
 * This file maps task IDs to edge function handlers.
 * ONLY tasks listed here with `executable: true` will be shown in the UI.
 */

import type { TaskTypeId } from './agencyTasks';
import type { Specialization } from './agencyTypes';

export interface ExecutableTask {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'research' | 'seo' | 'data' | 'content' | 'business' | 'learning';
  taskType: TaskTypeId;
  handlers: ('firecrawl' | 'groq' | 'lovable')[];
  executable: boolean;
  estimatedMinutes: number;
  inputPlaceholder: string;
  requiredSpecs?: Specialization[];
}

/**
 * EXECUTABLE TASKS — All tasks that can actually be completed by the edge function
 * 
 * To add a new task:
 * 1. Add the handler to pf-agency-execute-task/index.ts
 * 2. Add the task definition here with `executable: true`
 * 3. The UI will automatically show it
 */
export const EXECUTABLE_TASKS: Record<string, ExecutableTask> = {
  // ========== RESEARCH CATEGORY ==========
  web_research: {
    id: 'web_research',
    name: 'Web Research',
    description: 'Search the web and compile research findings',
    icon: '🔍',
    category: 'research',
    taskType: 'research',
    handlers: ['firecrawl', 'groq'],
    executable: true,
    estimatedMinutes: 5,
    inputPlaceholder: 'Enter topic to research...',
  },
  competitive_profile: {
    id: 'competitive_profile',
    name: 'Competitor Research',
    description: 'Scrape competitor websites and build profiles',
    icon: '🎯',
    category: 'research',
    taskType: 'company_research',
    handlers: ['firecrawl', 'groq'],
    executable: true,
    estimatedMinutes: 8,
    inputPlaceholder: 'Enter competitor URL or name...',
  },
  market_research: {
    id: 'market_research',
    name: 'Market Research',
    description: 'Research market trends, players, and opportunities',
    icon: '📊',
    category: 'research',
    taskType: 'research',
    handlers: ['firecrawl', 'groq'],
    executable: true,
    estimatedMinutes: 7,
    inputPlaceholder: 'Enter market or industry...',
  },
  trend_analysis: {
    id: 'trend_analysis',
    name: 'Trend Analysis',
    description: 'Analyze emerging trends and future predictions',
    icon: '📈',
    category: 'research',
    taskType: 'analysis',
    handlers: ['firecrawl', 'groq'],
    executable: true,
    estimatedMinutes: 6,
    inputPlaceholder: 'Enter topic to analyze trends...',
  },
  brand_analysis: {
    id: 'brand_analysis',
    name: 'Brand Analysis',
    description: 'Analyze brand identity and online presence',
    icon: '🏷️',
    category: 'research',
    taskType: 'company_research',
    handlers: ['firecrawl', 'groq'],
    executable: true,
    estimatedMinutes: 8,
    inputPlaceholder: 'Enter brand URL or name...',
  },
  niche_discovery: {
    id: 'niche_discovery',
    name: 'Niche Discovery',
    description: 'Find underserved niches and business opportunities',
    icon: '💎',
    category: 'research',
    taskType: 'research',
    handlers: ['firecrawl', 'groq'],
    executable: true,
    estimatedMinutes: 8,
    inputPlaceholder: 'Enter industry to find niches...',
  },
  audience_research: {
    id: 'audience_research',
    name: 'Audience Research',
    description: 'Research target audience demographics and behavior',
    icon: '👥',
    category: 'research',
    taskType: 'research',
    handlers: ['firecrawl', 'groq'],
    executable: true,
    estimatedMinutes: 6,
    inputPlaceholder: 'Enter product or industry...',
  },

  // ========== SEO CATEGORY ==========
  seo_audit: {
    id: 'seo_audit',
    name: 'SEO Audit',
    description: 'Comprehensive SEO analysis with recommendations',
    icon: '📈',
    category: 'seo',
    taskType: 'seo_scan',
    handlers: ['firecrawl', 'groq'],
    executable: true,
    estimatedMinutes: 5,
    inputPlaceholder: 'Enter URL to audit...',
  },
  keyword_research: {
    id: 'keyword_research',
    name: 'Keyword Research',
    description: 'Research keywords and search intent for a topic',
    icon: '🔑',
    category: 'seo',
    taskType: 'seo_scan',
    handlers: ['firecrawl', 'groq'],
    executable: true,
    estimatedMinutes: 5,
    inputPlaceholder: 'Enter topic for keyword research...',
  },
  backlink_research: {
    id: 'backlink_research',
    name: 'Backlink Opportunities',
    description: 'Research potential backlink sources and opportunities',
    icon: '🔗',
    category: 'seo',
    taskType: 'seo_scan',
    handlers: ['firecrawl', 'groq'],
    executable: true,
    estimatedMinutes: 7,
    inputPlaceholder: 'Enter domain or niche...',
  },
  directory_discovery: {
    id: 'directory_discovery',
    name: 'Directory Discovery',
    description: 'Find relevant directories and listing sites',
    icon: '📁',
    category: 'seo',
    taskType: 'seo_scan',
    handlers: ['firecrawl', 'groq'],
    executable: true,
    estimatedMinutes: 6,
    inputPlaceholder: 'Enter industry and location...',
  },
  serp_analysis: {
    id: 'serp_analysis',
    name: 'SERP Analysis',
    description: 'Analyze search results page for a keyword',
    icon: '🔎',
    category: 'seo',
    taskType: 'seo_scan',
    handlers: ['firecrawl', 'groq'],
    executable: true,
    estimatedMinutes: 5,
    inputPlaceholder: 'Enter keyword to analyze...',
  },
  content_gap_analysis: {
    id: 'content_gap_analysis',
    name: 'Content Gap Analysis',
    description: 'Find content opportunities competitors are missing',
    icon: '🕳️',
    category: 'seo',
    taskType: 'seo_scan',
    handlers: ['firecrawl', 'groq'],
    executable: true,
    estimatedMinutes: 8,
    inputPlaceholder: 'Enter domain and competitors...',
  },
  local_seo_research: {
    id: 'local_seo_research',
    name: 'Local SEO Research',
    description: 'Research local SEO opportunities for a business',
    icon: '📍',
    category: 'seo',
    taskType: 'seo_scan',
    handlers: ['firecrawl', 'groq'],
    executable: true,
    estimatedMinutes: 6,
    inputPlaceholder: 'Enter business type and location...',
  },

  // ========== DATA CATEGORY ==========
  data_extraction: {
    id: 'data_extraction',
    name: 'Data Extraction',
    description: 'Extract structured data from a URL',
    icon: '📥',
    category: 'data',
    taskType: 'analysis',
    handlers: ['firecrawl', 'groq'],
    executable: true,
    estimatedMinutes: 4,
    inputPlaceholder: 'Enter URL to extract data from...',
  },
  site_mapping: {
    id: 'site_mapping',
    name: 'Site Mapping',
    description: 'Discover all URLs on a website',
    icon: '🗺️',
    category: 'data',
    taskType: 'analysis',
    handlers: ['firecrawl'],
    executable: true,
    estimatedMinutes: 4,
    inputPlaceholder: 'Enter URL to map...',
  },
  content_scrape: {
    id: 'content_scrape',
    name: 'Content Scraping',
    description: 'Scrape and extract content from multiple pages',
    icon: '📄',
    category: 'data',
    taskType: 'research',
    handlers: ['firecrawl'],
    executable: true,
    estimatedMinutes: 5,
    inputPlaceholder: 'Enter URLs to scrape (comma separated)...',
  },
  contact_extraction: {
    id: 'contact_extraction',
    name: 'Contact Extraction',
    description: 'Extract contact information from websites',
    icon: '📇',
    category: 'data',
    taskType: 'analysis',
    handlers: ['firecrawl', 'groq'],
    executable: true,
    estimatedMinutes: 5,
    inputPlaceholder: 'Enter URL to extract contacts from...',
  },
  pricing_extraction: {
    id: 'pricing_extraction',
    name: 'Pricing Extraction',
    description: 'Extract pricing information from competitor sites',
    icon: '💰',
    category: 'data',
    taskType: 'analysis',
    handlers: ['firecrawl', 'groq'],
    executable: true,
    estimatedMinutes: 5,
    inputPlaceholder: 'Enter pricing page URL...',
  },
  review_aggregation: {
    id: 'review_aggregation',
    name: 'Review Aggregation',
    description: 'Collect and analyze reviews from multiple sources',
    icon: '⭐',
    category: 'data',
    taskType: 'research',
    handlers: ['firecrawl', 'groq'],
    executable: true,
    estimatedMinutes: 7,
    inputPlaceholder: 'Enter brand or product name...',
  },

  // ========== CONTENT CATEGORY ==========
  content_generation: {
    id: 'content_generation',
    name: 'Content Generation',
    description: 'Generate SEO-optimized content based on research',
    icon: '✍️',
    category: 'content',
    taskType: 'content_creation',
    handlers: ['groq', 'lovable'],
    executable: true,
    estimatedMinutes: 10,
    inputPlaceholder: 'Enter topic and keywords...',
  },
  outreach_draft: {
    id: 'outreach_draft',
    name: 'Outreach Drafting',
    description: 'Draft outreach emails for link building or partnerships',
    icon: '📧',
    category: 'content',
    taskType: 'content_creation',
    handlers: ['groq', 'lovable'],
    executable: true,
    estimatedMinutes: 5,
    inputPlaceholder: 'Describe the outreach purpose and target...',
  },
  social_content: {
    id: 'social_content',
    name: 'Social Media Content',
    description: 'Create social media posts and content',
    icon: '📱',
    category: 'content',
    taskType: 'content_creation',
    handlers: ['groq', 'lovable'],
    executable: true,
    estimatedMinutes: 4,
    inputPlaceholder: 'Enter topic and platform...',
  },
  seo_article: {
    id: 'seo_article',
    name: 'SEO Article',
    description: 'Create a fully optimized SEO article',
    icon: '📝',
    category: 'content',
    taskType: 'content_creation',
    handlers: ['groq', 'lovable'],
    executable: true,
    estimatedMinutes: 15,
    inputPlaceholder: 'Enter topic and target keyword...',
  },
  guest_post_pitch: {
    id: 'guest_post_pitch',
    name: 'Guest Post Pitch',
    description: 'Create pitches for guest posting opportunities',
    icon: '✉️',
    category: 'content',
    taskType: 'content_creation',
    handlers: ['groq', 'lovable'],
    executable: true,
    estimatedMinutes: 6,
    inputPlaceholder: 'Enter target site and topic ideas...',
  },
  press_release: {
    id: 'press_release',
    name: 'Press Release Draft',
    description: 'Draft a press release for business news',
    icon: '📰',
    category: 'content',
    taskType: 'content_creation',
    handlers: ['groq', 'lovable'],
    executable: true,
    estimatedMinutes: 8,
    inputPlaceholder: 'Describe the announcement...',
  },
  comment_drafts: {
    id: 'comment_drafts',
    name: 'Forum/Blog Comments',
    description: 'Draft valuable comments with backlink potential',
    icon: '💬',
    category: 'content',
    taskType: 'content_creation',
    handlers: ['groq', 'lovable'],
    executable: true,
    estimatedMinutes: 5,
    inputPlaceholder: 'Enter topic and brand mention...',
  },
  product_description: {
    id: 'product_description',
    name: 'Product Description',
    description: 'Create compelling product descriptions',
    icon: '🏷️',
    category: 'content',
    taskType: 'content_creation',
    handlers: ['groq', 'lovable'],
    executable: true,
    estimatedMinutes: 5,
    inputPlaceholder: 'Enter product info and audience...',
  },

  // ========== BUSINESS CATEGORY ==========
  business_name_ideas: {
    id: 'business_name_ideas',
    name: 'Business Name Ideas',
    description: 'Generate business name ideas with domain hints',
    icon: '💡',
    category: 'business',
    taskType: 'content_creation',
    handlers: ['groq', 'lovable'],
    executable: true,
    estimatedMinutes: 4,
    inputPlaceholder: 'Enter industry and keywords...',
  },
  value_proposition: {
    id: 'value_proposition',
    name: 'Value Proposition',
    description: 'Craft a compelling value proposition',
    icon: '🎯',
    category: 'business',
    taskType: 'content_creation',
    handlers: ['groq', 'lovable'],
    executable: true,
    estimatedMinutes: 6,
    inputPlaceholder: 'Describe your product and audience...',
  },
  business_model_analysis: {
    id: 'business_model_analysis',
    name: 'Business Model Analysis',
    description: 'Analyze and suggest business model improvements',
    icon: '📋',
    category: 'business',
    taskType: 'analysis',
    handlers: ['groq', 'lovable'],
    executable: true,
    estimatedMinutes: 8,
    inputPlaceholder: 'Describe your business model...',
  },
  startup_idea_validation: {
    id: 'startup_idea_validation',
    name: 'Startup Idea Validation',
    description: 'Research and validate a startup idea',
    icon: '✅',
    category: 'business',
    taskType: 'research',
    handlers: ['firecrawl', 'groq'],
    executable: true,
    estimatedMinutes: 10,
    inputPlaceholder: 'Describe your startup idea...',
  },
  landing_page_copy: {
    id: 'landing_page_copy',
    name: 'Landing Page Copy',
    description: 'Create conversion-focused landing page copy',
    icon: '📄',
    category: 'business',
    taskType: 'content_creation',
    handlers: ['groq', 'lovable'],
    executable: true,
    estimatedMinutes: 10,
    inputPlaceholder: 'Describe product and goal...',
  },
  pitch_deck_outline: {
    id: 'pitch_deck_outline',
    name: 'Pitch Deck Outline',
    description: 'Create a pitch deck structure with key points',
    icon: '📊',
    category: 'business',
    taskType: 'content_creation',
    handlers: ['groq', 'lovable'],
    executable: true,
    estimatedMinutes: 8,
    inputPlaceholder: 'Describe your startup for investors...',
  },
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get all executable tasks
 */
export function getExecutableTasks(): ExecutableTask[] {
  return Object.values(EXECUTABLE_TASKS).filter(t => t.executable);
}

/**
 * Get executable tasks by category
 */
export function getExecutableTasksByCategory(category: ExecutableTask['category']): ExecutableTask[] {
  return getExecutableTasks().filter(t => t.category === category);
}

/**
 * Get executable tasks that match a specialization
 */
export function getExecutableTasksForSpec(spec: Specialization): ExecutableTask[] {
  const specTaskMap: Record<Specialization, string[]> = {
    Research: ['web_research', 'market_research', 'niche_discovery', 'audience_research', 'trend_analysis'],
    Intel: ['competitive_profile', 'brand_analysis', 'startup_idea_validation'],
    SEO: ['seo_audit', 'keyword_research', 'backlink_research', 'directory_discovery', 'serp_analysis', 'content_gap_analysis', 'local_seo_research'],
    Writing: ['content_generation', 'seo_article', 'guest_post_pitch', 'press_release', 'comment_drafts', 'product_description'],
    Marketing: ['social_content', 'outreach_draft', 'landing_page_copy'],
    Analyst: ['data_extraction', 'pricing_extraction', 'review_aggregation', 'business_model_analysis'],
    Data: ['site_mapping', 'content_scrape', 'contact_extraction'],
    Sales: ['outreach_draft', 'contact_extraction'],
    Growth: ['startup_idea_validation', 'pitch_deck_outline', 'value_proposition'],
    Coding: ['site_mapping', 'data_extraction'],
    Designer: ['brand_analysis'],
    Finance: ['business_model_analysis', 'pricing_extraction'],
    Legal: ['review_aggregation'],
    Hybrid: Object.keys(EXECUTABLE_TASKS), // Leader can do anything
    OPS: ['site_mapping', 'data_extraction'],
    Dreamer: ['business_name_ideas', 'value_proposition'],
    Defense: ['seo_audit'],
    Audit: ['seo_audit', 'content_gap_analysis'],
    Support: ['review_aggregation', 'comment_drafts'],
    Success: ['outreach_draft', 'review_aggregation'],
  };
  
  const taskIds = specTaskMap[spec] || [];
  return taskIds.map(id => EXECUTABLE_TASKS[id]).filter(Boolean);
}

/**
 * Check if a task ID is executable
 */
export function isTaskExecutable(taskId: string): boolean {
  return EXECUTABLE_TASKS[taskId]?.executable === true;
}

/**
 * Get quick launch presets for the UI (top tasks)
 */
export function getQuickLaunchTasks(): ExecutableTask[] {
  return [
    EXECUTABLE_TASKS.web_research,
    EXECUTABLE_TASKS.seo_audit,
    EXECUTABLE_TASKS.competitive_profile,
    EXECUTABLE_TASKS.content_generation,
    EXECUTABLE_TASKS.backlink_research,
    EXECUTABLE_TASKS.keyword_research,
  ].filter(Boolean);
}

/**
 * Category metadata for UI display
 */
export const TASK_CATEGORIES = {
  research: { name: 'Research', icon: '🔍', color: 'text-blue-400' },
  seo: { name: 'SEO & Backlinks', icon: '📈', color: 'text-green-400' },
  data: { name: 'Data Extraction', icon: '📊', color: 'text-cyan-400' },
  content: { name: 'Content Creation', icon: '✍️', color: 'text-purple-400' },
  business: { name: 'Business Building', icon: '💼', color: 'text-amber-400' },
  learning: { name: 'Agent Learning', icon: '🧠', color: 'text-fuchsia-400' },
} as const;
