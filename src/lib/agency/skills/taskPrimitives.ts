/**
 * Task Primitives v2.0 — Only executable tasks
 * Each primitive maps to actual backend handlers that work
 * Using: Groq (AI) + Firecrawl (Web Scraping/Search) + Lovable AI
 */

import type { AgentSkillId } from './agentSkills';

export type ExecutionProfile = 'single_run' | 'leader_route' | 'batch';

export interface TaskPrimitive {
  id: string;
  name: string;
  description: string;
  icon: string;
  
  // Schema
  inputs: string[];
  outputs: string[];
  
  // Requirements - only use available handlers
  skills: AgentSkillId[];
  handlers: ('groq' | 'firecrawl' | 'lovable')[];
  
  // Execution config
  executionProfiles: ExecutionProfile[];
  estimatedDurationMs: number;
  
  // What telemetry fields to track
  telemetryFields: string[];
}

// ONLY primitives that can actually execute with current infrastructure
export const TASK_PRIMITIVES: Record<string, TaskPrimitive> = {
  // ============ RESEARCH TASKS ============
  web_research: {
    id: 'web_research',
    name: 'Web Research',
    description: 'Search the web and compile research findings using Firecrawl',
    icon: '🔍',
    inputs: ['query_string', 'target_domains?'],
    outputs: ['summary', 'citations', 'sources'],
    skills: ['research', 'analysis'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['single_run', 'leader_route'],
    estimatedDurationMs: 30000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
  },
  
  competitive_profile: {
    id: 'competitive_profile',
    name: 'Competitor Research',
    description: 'Scrape competitor websites and build profiles',
    icon: '🎯',
    inputs: ['competitor_url', 'focus_areas?'],
    outputs: ['profile', 'features', 'pricing', 'weaknesses'],
    skills: ['research', 'competitive', 'analysis'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['single_run', 'leader_route'],
    estimatedDurationMs: 45000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
  },

  market_research: {
    id: 'market_research',
    name: 'Market Research',
    description: 'Research market trends, players, and opportunities',
    icon: '📊',
    inputs: ['market_query', 'industry?'],
    outputs: ['market_overview', 'key_players', 'trends', 'opportunities'],
    skills: ['research', 'analysis'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 40000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
  },

  // ============ SEO TASKS ============
  seo_audit: {
    id: 'seo_audit',
    name: 'SEO Audit',
    description: 'Scrape a URL and analyze SEO factors with recommendations',
    icon: '📈',
    inputs: ['url'],
    outputs: ['audit_report', 'issues', 'recommendations', 'score'],
    skills: ['seo', 'research'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 35000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
  },

  keyword_research: {
    id: 'keyword_research',
    name: 'Keyword Research',
    description: 'Research keywords and search intent for a topic',
    icon: '🔑',
    inputs: ['topic', 'industry?'],
    outputs: ['keywords', 'search_intent', 'difficulty', 'suggestions'],
    skills: ['seo', 'research', 'analysis'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 30000,
    telemetryFields: ['tasks_completed'],
  },

  backlink_research: {
    id: 'backlink_research',
    name: 'Backlink Opportunity Research',
    description: 'Research potential backlink sources and opportunities',
    icon: '🔗',
    inputs: ['domain', 'niche?'],
    outputs: ['opportunities', 'directories', 'forums', 'outreach_targets'],
    skills: ['seo', 'research'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 40000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
  },

  // ============ DATA EXTRACTION TASKS ============
  data_extraction: {
    id: 'data_extraction',
    name: 'Data Extraction',
    description: 'Extract structured data from a URL using Firecrawl',
    icon: '📥',
    inputs: ['url', 'data_schema?'],
    outputs: ['structured_data', 'metadata'],
    skills: ['extraction', 'analysis'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['single_run', 'batch'],
    estimatedDurationMs: 20000,
    telemetryFields: ['websites_crawled', 'datasets_processed'],
  },

  site_mapping: {
    id: 'site_mapping',
    name: 'Site Mapping',
    description: 'Discover all URLs on a website using Firecrawl map',
    icon: '🗺️',
    inputs: ['url', 'include_subdomains?'],
    outputs: ['sitemap', 'page_count', 'structure'],
    skills: ['extraction', 'research'],
    handlers: ['firecrawl'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 25000,
    telemetryFields: ['websites_crawled'],
  },

  content_scrape: {
    id: 'content_scrape',
    name: 'Content Scraping',
    description: 'Scrape and extract content from multiple pages',
    icon: '📄',
    inputs: ['urls', 'content_type?'],
    outputs: ['content', 'metadata', 'links'],
    skills: ['extraction', 'research'],
    handlers: ['firecrawl'],
    executionProfiles: ['single_run', 'batch'],
    estimatedDurationMs: 30000,
    telemetryFields: ['websites_crawled'],
  },

  // ============ CONTENT TASKS ============
  content_generation: {
    id: 'content_generation',
    name: 'Content Generation',
    description: 'Generate SEO-optimized content based on research',
    icon: '✍️',
    inputs: ['topic', 'keywords?', 'tone?'],
    outputs: ['article', 'meta_description', 'title'],
    skills: ['writing', 'analysis'],
    handlers: ['groq', 'lovable'],
    executionProfiles: ['single_run', 'leader_route'],
    estimatedDurationMs: 25000,
    telemetryFields: ['tasks_completed'],
  },

  outreach_draft: {
    id: 'outreach_draft',
    name: 'Outreach Drafting',
    description: 'Draft outreach emails for link building or partnerships',
    icon: '📧',
    inputs: ['target_info', 'purpose', 'offer?'],
    outputs: ['email_draft', 'subject_lines', 'follow_up'],
    skills: ['writing'],
    handlers: ['groq', 'lovable'],
    executionProfiles: ['single_run', 'batch'],
    estimatedDurationMs: 20000,
    telemetryFields: ['tasks_completed'],
  },

  social_content: {
    id: 'social_content',
    name: 'Social Media Content',
    description: 'Create social media posts and content',
    icon: '📱',
    inputs: ['topic', 'platform?', 'tone?'],
    outputs: ['posts', 'hashtags', 'hooks'],
    skills: ['writing'],
    handlers: ['groq', 'lovable'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 15000,
    telemetryFields: ['tasks_completed'],
  },

  // ============ ANALYSIS TASKS ============
  trend_analysis: {
    id: 'trend_analysis',
    name: 'Trend Analysis',
    description: 'Research and analyze trends in a topic or industry',
    icon: '📈',
    inputs: ['topic', 'timeframe?'],
    outputs: ['trends', 'insights', 'predictions'],
    skills: ['analysis', 'research'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 35000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
  },

  brand_analysis: {
    id: 'brand_analysis',
    name: 'Brand Analysis',
    description: 'Analyze a brand\'s online presence and messaging',
    icon: '🏢',
    inputs: ['brand_url', 'focus?'],
    outputs: ['brand_profile', 'messaging', 'recommendations'],
    skills: ['analysis', 'research', 'competitive'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 40000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
  },
};

export type TaskPrimitiveId = keyof typeof TASK_PRIMITIVES;

/**
 * Get primitives that an agent can execute based on their skills
 */
export function getPrimitivesForSkills(skills: AgentSkillId[]): TaskPrimitive[] {
  return Object.values(TASK_PRIMITIVES).filter(primitive => 
    primitive.skills.some(skill => skills.includes(skill))
  );
}

/**
 * Get the best primitive for a task type
 */
export function getPrimitiveForTaskType(taskType: string): TaskPrimitive | null {
  // Map legacy task types to primitives
  const mapping: Record<string, TaskPrimitiveId> = {
    research: 'web_research',
    company_research: 'competitive_profile',
    seo_scan: 'seo_audit',
    content_creation: 'content_generation',
    analysis: 'trend_analysis',
    audit: 'seo_audit',
    code_study: 'web_research',
  };
  
  const primitiveId = mapping[taskType] || taskType;
  return TASK_PRIMITIVES[primitiveId] || null;
}

/**
 * Get all task types for a dropdown/selector
 */
export function getTaskTypeOptions(): { value: string; label: string; icon: string }[] {
  return Object.values(TASK_PRIMITIVES).map(p => ({
    value: p.id,
    label: p.name,
    icon: p.icon,
  }));
}
