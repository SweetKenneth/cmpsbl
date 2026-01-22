/**
 * Task Primitives v3.0 — Comprehensive executable tasks
 * Expanded for business building, SEO, domain reputation, agent learning
 * Using: Groq (AI) + Firecrawl (Web Scraping/Search) + Lovable AI
 */

import type { AgentSkillId } from './agentSkills';

export type ExecutionProfile = 'single_run' | 'leader_route' | 'batch' | 'learning';

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
  
  // New: Category for grouping
  category: 'research' | 'seo' | 'data' | 'content' | 'business' | 'learning' | 'substrate';
}

// ============ RESEARCH PRIMITIVES ============
const RESEARCH_PRIMITIVES: Record<string, TaskPrimitive> = {
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
    category: 'research',
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
    category: 'research',
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
    category: 'research',
  },

  niche_discovery: {
    id: 'niche_discovery',
    name: 'Niche Discovery',
    description: 'Find underserved niches and business opportunities',
    icon: '💎',
    inputs: ['industry', 'keywords?'],
    outputs: ['niches', 'gaps', 'opportunity_scores', 'competition_level'],
    skills: ['research', 'analysis', 'competitive'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 50000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
    category: 'research',
  },

  audience_research: {
    id: 'audience_research',
    name: 'Audience Research',
    description: 'Research target audience demographics and behavior',
    icon: '👥',
    inputs: ['industry', 'product_type?'],
    outputs: ['demographics', 'pain_points', 'channels', 'messaging_angles'],
    skills: ['research', 'analysis'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 35000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
    category: 'research',
  },
};

// ============ SEO PRIMITIVES ============
const SEO_PRIMITIVES: Record<string, TaskPrimitive> = {
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
    category: 'seo',
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
    category: 'seo',
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
    category: 'seo',
  },

  directory_discovery: {
    id: 'directory_discovery',
    name: 'Directory Discovery',
    description: 'Find relevant directories and listing sites for your niche',
    icon: '📁',
    inputs: ['industry', 'location?'],
    outputs: ['directories', 'listing_sites', 'review_platforms', 'submission_requirements'],
    skills: ['seo', 'research'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['single_run', 'batch'],
    estimatedDurationMs: 35000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
    category: 'seo',
  },

  serp_analysis: {
    id: 'serp_analysis',
    name: 'SERP Analysis',
    description: 'Analyze search results page for a keyword',
    icon: '🔎',
    inputs: ['keyword', 'location?'],
    outputs: ['top_results', 'serp_features', 'content_gaps', 'ranking_factors'],
    skills: ['seo', 'research', 'analysis'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 30000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
    category: 'seo',
  },

  content_gap_analysis: {
    id: 'content_gap_analysis',
    name: 'Content Gap Analysis',
    description: 'Find content opportunities competitors are missing',
    icon: '🕳️',
    inputs: ['domain', 'competitor_domains?'],
    outputs: ['content_gaps', 'topic_opportunities', 'keyword_gaps', 'priority_list'],
    skills: ['seo', 'research', 'competitive'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 45000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
    category: 'seo',
  },

  local_seo_research: {
    id: 'local_seo_research',
    name: 'Local SEO Research',
    description: 'Research local SEO opportunities for a business',
    icon: '📍',
    inputs: ['business_type', 'location'],
    outputs: ['local_directories', 'citation_sources', 'local_keywords', 'gmb_optimization'],
    skills: ['seo', 'research'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 35000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
    category: 'seo',
  },
};

// ============ DATA EXTRACTION PRIMITIVES ============
const DATA_PRIMITIVES: Record<string, TaskPrimitive> = {
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
    category: 'data',
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
    category: 'data',
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
    category: 'data',
  },

  contact_extraction: {
    id: 'contact_extraction',
    name: 'Contact Extraction',
    description: 'Extract contact information from websites',
    icon: '📇',
    inputs: ['url', 'contact_types?'],
    outputs: ['emails', 'phones', 'social_profiles', 'addresses'],
    skills: ['extraction', 'research'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['single_run', 'batch'],
    estimatedDurationMs: 25000,
    telemetryFields: ['websites_crawled', 'datasets_processed'],
    category: 'data',
  },

  pricing_extraction: {
    id: 'pricing_extraction',
    name: 'Pricing Extraction',
    description: 'Extract pricing information from competitor sites',
    icon: '💰',
    inputs: ['url'],
    outputs: ['pricing_tiers', 'features_by_tier', 'comparison_table'],
    skills: ['extraction', 'competitive', 'analysis'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 30000,
    telemetryFields: ['websites_crawled', 'datasets_processed'],
    category: 'data',
  },

  review_aggregation: {
    id: 'review_aggregation',
    name: 'Review Aggregation',
    description: 'Collect and analyze reviews from multiple sources',
    icon: '⭐',
    inputs: ['brand_or_product', 'review_sources?'],
    outputs: ['reviews', 'sentiment_analysis', 'common_themes', 'rating_breakdown'],
    skills: ['extraction', 'analysis', 'research'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 40000,
    telemetryFields: ['websites_crawled', 'datasets_processed'],
    category: 'data',
  },
};

// ============ CONTENT PRIMITIVES ============
const CONTENT_PRIMITIVES: Record<string, TaskPrimitive> = {
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
    category: 'content',
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
    category: 'content',
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
    category: 'content',
  },

  seo_article: {
    id: 'seo_article',
    name: 'SEO Article',
    description: 'Create a fully optimized SEO article with backlink opportunities',
    icon: '📝',
    inputs: ['topic', 'target_keyword', 'word_count?'],
    outputs: ['article', 'meta_tags', 'internal_links', 'backlink_anchors'],
    skills: ['writing', 'seo'],
    handlers: ['groq', 'lovable'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 35000,
    telemetryFields: ['tasks_completed'],
    category: 'content',
  },

  guest_post_pitch: {
    id: 'guest_post_pitch',
    name: 'Guest Post Pitch',
    description: 'Create pitches for guest posting opportunities',
    icon: '✉️',
    inputs: ['target_site', 'topic_ideas', 'credentials?'],
    outputs: ['pitch_email', 'topic_proposals', 'bio', 'samples_summary'],
    skills: ['writing', 'seo'],
    handlers: ['groq', 'lovable'],
    executionProfiles: ['single_run', 'batch'],
    estimatedDurationMs: 20000,
    telemetryFields: ['tasks_completed'],
    category: 'content',
  },

  press_release: {
    id: 'press_release',
    name: 'Press Release Draft',
    description: 'Draft a press release for business news',
    icon: '📰',
    inputs: ['announcement', 'company_info', 'quotes?'],
    outputs: ['press_release', 'boilerplate', 'distribution_targets'],
    skills: ['writing'],
    handlers: ['groq', 'lovable'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 25000,
    telemetryFields: ['tasks_completed'],
    category: 'content',
  },

  comment_drafts: {
    id: 'comment_drafts',
    name: 'Forum/Blog Comment Drafts',
    description: 'Draft valuable comments for forums and blogs with backlink potential',
    icon: '💬',
    inputs: ['topic', 'target_urls?', 'brand_mention?'],
    outputs: ['comments', 'engagement_strategies', 'best_practices'],
    skills: ['writing', 'seo'],
    handlers: ['groq', 'lovable'],
    executionProfiles: ['single_run', 'batch'],
    estimatedDurationMs: 20000,
    telemetryFields: ['tasks_completed'],
    category: 'content',
  },

  product_description: {
    id: 'product_description',
    name: 'Product Description',
    description: 'Create compelling product descriptions',
    icon: '🏷️',
    inputs: ['product_info', 'target_audience?', 'keywords?'],
    outputs: ['description', 'bullet_points', 'seo_title', 'meta_description'],
    skills: ['writing'],
    handlers: ['groq', 'lovable'],
    executionProfiles: ['single_run', 'batch'],
    estimatedDurationMs: 15000,
    telemetryFields: ['tasks_completed'],
    category: 'content',
  },
};

// ============ BUSINESS BUILDING PRIMITIVES ============
const BUSINESS_PRIMITIVES: Record<string, TaskPrimitive> = {
  business_name_ideas: {
    id: 'business_name_ideas',
    name: 'Business Name Ideas',
    description: 'Generate business name ideas with domain availability hints',
    icon: '💡',
    inputs: ['industry', 'keywords?', 'style?'],
    outputs: ['name_ideas', 'domain_suggestions', 'social_handle_availability'],
    skills: ['writing', 'research'],
    handlers: ['groq', 'lovable'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 20000,
    telemetryFields: ['tasks_completed'],
    category: 'business',
  },

  value_proposition: {
    id: 'value_proposition',
    name: 'Value Proposition',
    description: 'Craft a compelling value proposition',
    icon: '🎯',
    inputs: ['product_service', 'target_audience', 'competitors?'],
    outputs: ['value_prop', 'taglines', 'elevator_pitch', 'unique_selling_points'],
    skills: ['writing', 'analysis'],
    handlers: ['groq', 'lovable'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 25000,
    telemetryFields: ['tasks_completed'],
    category: 'business',
  },

  business_model_analysis: {
    id: 'business_model_analysis',
    name: 'Business Model Analysis',
    description: 'Analyze and suggest business model improvements',
    icon: '📋',
    inputs: ['business_description', 'revenue_model?'],
    outputs: ['model_analysis', 'revenue_streams', 'cost_structure', 'recommendations'],
    skills: ['analysis', 'research'],
    handlers: ['groq', 'lovable'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 30000,
    telemetryFields: ['tasks_completed'],
    category: 'business',
  },

  startup_idea_validation: {
    id: 'startup_idea_validation',
    name: 'Startup Idea Validation',
    description: 'Research and validate a startup idea',
    icon: '✅',
    inputs: ['idea_description', 'target_market?'],
    outputs: ['validation_score', 'market_size', 'competitors', 'risks', 'next_steps'],
    skills: ['research', 'analysis', 'competitive'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 45000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
    category: 'business',
  },

  landing_page_copy: {
    id: 'landing_page_copy',
    name: 'Landing Page Copy',
    description: 'Create conversion-focused landing page copy',
    icon: '🚀',
    inputs: ['product_service', 'target_action', 'audience?'],
    outputs: ['headline', 'subheadline', 'body_copy', 'cta_options', 'trust_elements'],
    skills: ['writing'],
    handlers: ['groq', 'lovable'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 25000,
    telemetryFields: ['tasks_completed'],
    category: 'business',
  },

  pitch_deck_outline: {
    id: 'pitch_deck_outline',
    name: 'Pitch Deck Outline',
    description: 'Create an investor pitch deck outline',
    icon: '📊',
    inputs: ['business_description', 'funding_goal?', 'stage?'],
    outputs: ['slide_outline', 'key_metrics', 'narrative', 'investor_faqs'],
    skills: ['writing', 'analysis'],
    handlers: ['groq', 'lovable'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 30000,
    telemetryFields: ['tasks_completed'],
    category: 'business',
  },
};

// ============ ANALYSIS PRIMITIVES ============
const ANALYSIS_PRIMITIVES: Record<string, TaskPrimitive> = {
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
    category: 'research',
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
    category: 'research',
  },

  sentiment_analysis: {
    id: 'sentiment_analysis',
    name: 'Sentiment Analysis',
    description: 'Analyze sentiment around a brand or topic',
    icon: '😊',
    inputs: ['brand_or_topic', 'sources?'],
    outputs: ['sentiment_score', 'positive_themes', 'negative_themes', 'recommendations'],
    skills: ['analysis', 'research'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 35000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
    category: 'research',
  },

  tech_stack_analysis: {
    id: 'tech_stack_analysis',
    name: 'Tech Stack Analysis',
    description: 'Analyze a website\'s technology stack',
    icon: '⚙️',
    inputs: ['url'],
    outputs: ['technologies', 'frameworks', 'analytics', 'recommendations'],
    skills: ['analysis', 'research'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 25000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
    category: 'research',
  },
};

// ============ LEARNING/SUBSTRATE PRIMITIVES ============
const LEARNING_PRIMITIVES: Record<string, TaskPrimitive> = {
  skill_improvement: {
    id: 'skill_improvement',
    name: 'Skill Improvement Study',
    description: 'Agent learns new techniques from web resources',
    icon: '📚',
    inputs: ['skill_area', 'current_level?'],
    outputs: ['learning_materials', 'best_practices', 'techniques', 'improvement_plan'],
    skills: ['research', 'analysis'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['learning'],
    estimatedDurationMs: 40000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
    category: 'learning',
  },

  domain_knowledge: {
    id: 'domain_knowledge',
    name: 'Domain Knowledge Acquisition',
    description: 'Agent builds expertise in a specific domain',
    icon: '🧠',
    inputs: ['domain', 'depth_level?'],
    outputs: ['knowledge_base', 'key_concepts', 'industry_terms', 'expert_sources'],
    skills: ['research', 'analysis'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['learning'],
    estimatedDurationMs: 45000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
    category: 'learning',
  },

  tool_research: {
    id: 'tool_research',
    name: 'Tool & API Research',
    description: 'Research tools and APIs that could extend agent capabilities',
    icon: '🔧',
    inputs: ['capability_needed', 'budget?'],
    outputs: ['tools', 'apis', 'integration_requirements', 'recommendations'],
    skills: ['research', 'analysis'],
    handlers: ['firecrawl', 'groq'],
    executionProfiles: ['learning'],
    estimatedDurationMs: 35000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
    category: 'learning',
  },

  workflow_optimization: {
    id: 'workflow_optimization',
    name: 'Workflow Optimization',
    description: 'Analyze and suggest improvements to task workflows',
    icon: '⚡',
    inputs: ['current_workflow', 'pain_points?'],
    outputs: ['optimizations', 'automations', 'efficiency_gains', 'implementation_steps'],
    skills: ['analysis'],
    handlers: ['groq', 'lovable'],
    executionProfiles: ['learning'],
    estimatedDurationMs: 25000,
    telemetryFields: ['tasks_completed'],
    category: 'learning',
  },

  heuristic_extraction: {
    id: 'heuristic_extraction',
    name: 'Heuristic Extraction',
    description: 'Extract reusable patterns from successful tasks',
    icon: '🎓',
    inputs: ['task_history', 'success_criteria?'],
    outputs: ['heuristics', 'patterns', 'shortcuts', 'best_practices'],
    skills: ['analysis'],
    handlers: ['groq', 'lovable'],
    executionProfiles: ['learning'],
    estimatedDurationMs: 30000,
    telemetryFields: ['tasks_completed'],
    category: 'learning',
  },

  substrate_contribution: {
    id: 'substrate_contribution',
    name: 'Substrate Memory Contribution',
    description: 'Contribute learned insights to the shared substrate memory',
    icon: '🌐',
    inputs: ['insight_type', 'content'],
    outputs: ['contribution_id', 'validation_status', 'impact_score'],
    skills: ['analysis'],
    handlers: ['groq', 'lovable'],
    executionProfiles: ['learning'],
    estimatedDurationMs: 15000,
    telemetryFields: ['tasks_completed'],
    category: 'substrate',
  },

  template_generation: {
    id: 'template_generation',
    name: 'Template Generation',
    description: 'Generate reusable templates from successful outputs',
    icon: '📋',
    inputs: ['output_samples', 'use_case'],
    outputs: ['template', 'variables', 'usage_guide', 'variations'],
    skills: ['writing', 'analysis'],
    handlers: ['groq', 'lovable'],
    executionProfiles: ['learning'],
    estimatedDurationMs: 25000,
    telemetryFields: ['tasks_completed'],
    category: 'substrate',
  },
};

// Combine all primitives
export const TASK_PRIMITIVES: Record<string, TaskPrimitive> = {
  ...RESEARCH_PRIMITIVES,
  ...SEO_PRIMITIVES,
  ...DATA_PRIMITIVES,
  ...CONTENT_PRIMITIVES,
  ...BUSINESS_PRIMITIVES,
  ...ANALYSIS_PRIMITIVES,
  ...LEARNING_PRIMITIVES,
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
 * Get primitives by category
 */
export function getPrimitivesByCategory(category: TaskPrimitive['category']): TaskPrimitive[] {
  return Object.values(TASK_PRIMITIVES).filter(p => p.category === category);
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
export function getTaskTypeOptions(): { value: string; label: string; icon: string; category: string }[] {
  return Object.values(TASK_PRIMITIVES).map(p => ({
    value: p.id,
    label: p.name,
    icon: p.icon,
    category: p.category,
  }));
}

/**
 * Get task types grouped by category for UI
 */
export function getGroupedTaskTypes(): Record<string, { value: string; label: string; icon: string }[]> {
  const grouped: Record<string, { value: string; label: string; icon: string }[]> = {};
  
  for (const p of Object.values(TASK_PRIMITIVES)) {
    if (!grouped[p.category]) {
      grouped[p.category] = [];
    }
    grouped[p.category].push({
      value: p.id,
      label: p.name,
      icon: p.icon,
    });
  }
  
  return grouped;
}
