/**
 * Agency Quick Commands v3.0 — Comprehensive executable task commands
 * Aligned with expanded task primitives for business, SEO, learning, substrate
 */

import { SPECIALIZATIONS, type Specialization } from './agencyTypes';
import { TASK_PRIMITIVES, type TaskPrimitiveId } from './skills/taskPrimitives';

export interface QuickCommand {
  id: string;
  command: string;
  label: string;
  description: string;
  prompt: string;
  category: 'research' | 'seo' | 'content' | 'analysis' | 'data' | 'business' | 'learning' | 'general';
  taskPrimitive?: TaskPrimitiveId;
  requiredSpecs?: Specialization[];
  icon?: string;
}

// Base commands available to all agencies
const BASE_COMMANDS: QuickCommand[] = [
  {
    id: 'help',
    command: '/help',
    label: 'Show Help',
    description: 'Display all available commands and team capabilities',
    prompt: '',
    category: 'general',
    icon: '❓',
  },
  {
    id: 'status',
    command: '/status',
    label: 'Team Status',
    description: 'Check current team status and capacity',
    prompt: 'Report the current status of all team members, their availability, and ongoing tasks.',
    category: 'general',
    icon: '📊',
  },
  {
    id: 'capabilities',
    command: '/capabilities',
    label: 'Show Capabilities',
    description: 'List what the team can and cannot do',
    prompt: 'List all the tasks and actions this team can perform, and what is currently out of scope.',
    category: 'general',
    icon: '🔧',
  },
];

// Commands that map to EXECUTABLE task primitives
const EXECUTABLE_COMMANDS: QuickCommand[] = [
  // ============ RESEARCH COMMANDS ============
  {
    id: 'research',
    command: '/research',
    label: 'Web Research',
    description: 'Research any topic using web sources',
    prompt: 'Research [TOPIC] comprehensively. Find key insights, statistics, and cite sources.',
    category: 'research',
    taskPrimitive: 'web_research',
    requiredSpecs: ['Research', 'Intel', 'Analyst'],
    icon: '🔍',
  },
  {
    id: 'competitor',
    command: '/competitor',
    label: 'Competitor Analysis',
    description: 'Analyze a competitor\'s website and strategy',
    prompt: 'Analyze competitor [URL/NAME]. Profile their features, pricing, positioning, and weaknesses.',
    category: 'research',
    taskPrimitive: 'competitive_profile',
    requiredSpecs: ['Intel', 'Research', 'Marketing'],
    icon: '🎯',
  },
  {
    id: 'market',
    command: '/market',
    label: 'Market Research',
    description: 'Research market trends and players',
    prompt: 'Research market for [INDUSTRY/PRODUCT]. Identify trends, key players, and opportunities.',
    category: 'research',
    taskPrimitive: 'market_research',
    requiredSpecs: ['Research', 'Analyst', 'Growth'],
    icon: '📊',
  },
  {
    id: 'niche',
    command: '/niche',
    label: 'Niche Discovery',
    description: 'Find underserved niches and opportunities',
    prompt: 'Discover underserved niches in [INDUSTRY]. Find gaps, opportunities, and competition levels.',
    category: 'research',
    taskPrimitive: 'niche_discovery',
    requiredSpecs: ['Research', 'Intel', 'Growth'],
    icon: '💎',
  },
  {
    id: 'audience',
    command: '/audience',
    label: 'Audience Research',
    description: 'Research target audience demographics',
    prompt: 'Research target audience for [PRODUCT/SERVICE]. Find demographics, pain points, and channels.',
    category: 'research',
    taskPrimitive: 'audience_research',
    requiredSpecs: ['Research', 'Marketing'],
    icon: '👥',
  },

  // ============ SEO COMMANDS ============
  {
    id: 'seo',
    command: '/seo',
    label: 'SEO Audit',
    description: 'Audit a website for SEO issues',
    prompt: 'Perform SEO audit on [URL]. Identify issues, score the site, and provide recommendations.',
    category: 'seo',
    taskPrimitive: 'seo_audit',
    requiredSpecs: ['SEO', 'Research'],
    icon: '📈',
  },
  {
    id: 'keywords',
    command: '/keywords',
    label: 'Keyword Research',
    description: 'Research keywords for a topic',
    prompt: 'Research keywords for [TOPIC]. Find search volume, difficulty, and related terms.',
    category: 'seo',
    taskPrimitive: 'keyword_research',
    requiredSpecs: ['SEO', 'Research', 'Marketing'],
    icon: '🔑',
  },
  {
    id: 'backlinks',
    command: '/backlinks',
    label: 'Backlink Research',
    description: 'Find backlink opportunities',
    prompt: 'Research backlink opportunities for [DOMAIN]. Find directories, forums, and outreach targets.',
    category: 'seo',
    taskPrimitive: 'backlink_research',
    requiredSpecs: ['SEO', 'Research'],
    icon: '🔗',
  },
  {
    id: 'directories',
    command: '/directories',
    label: 'Directory Discovery',
    description: 'Find relevant directories for listings',
    prompt: 'Discover directories for [INDUSTRY]. Find listing sites and submission requirements.',
    category: 'seo',
    taskPrimitive: 'directory_discovery',
    requiredSpecs: ['SEO', 'Research'],
    icon: '📁',
  },
  {
    id: 'serp',
    command: '/serp',
    label: 'SERP Analysis',
    description: 'Analyze search results for a keyword',
    prompt: 'Analyze SERP for [KEYWORD]. Find top results, features, and content gaps.',
    category: 'seo',
    taskPrimitive: 'serp_analysis',
    requiredSpecs: ['SEO', 'Research', 'Analyst'],
    icon: '🔎',
  },
  {
    id: 'contentgap',
    command: '/contentgap',
    label: 'Content Gap Analysis',
    description: 'Find content opportunities',
    prompt: 'Find content gaps for [DOMAIN] vs competitors. Identify missing topics and keywords.',
    category: 'seo',
    taskPrimitive: 'content_gap_analysis',
    requiredSpecs: ['SEO', 'Research'],
    icon: '🕳️',
  },
  {
    id: 'local',
    command: '/local',
    label: 'Local SEO Research',
    description: 'Research local SEO opportunities',
    prompt: 'Research local SEO for [BUSINESS TYPE] in [LOCATION]. Find directories and citations.',
    category: 'seo',
    taskPrimitive: 'local_seo_research',
    requiredSpecs: ['SEO', 'Research'],
    icon: '📍',
  },

  // ============ DATA EXTRACTION COMMANDS ============
  {
    id: 'extract',
    command: '/extract',
    label: 'Data Extraction',
    description: 'Extract structured data from a URL',
    prompt: 'Extract structured data from [URL]. Parse content and return organized data.',
    category: 'data',
    taskPrimitive: 'data_extraction',
    requiredSpecs: ['Data', 'Research', 'Analyst'],
    icon: '📥',
  },
  {
    id: 'map',
    command: '/map',
    label: 'Site Mapping',
    description: 'Discover all pages on a website',
    prompt: 'Map all pages on [URL]. Create sitemap with page structure.',
    category: 'data',
    taskPrimitive: 'site_mapping',
    requiredSpecs: ['Research', 'SEO', 'Data'],
    icon: '🗺️',
  },
  {
    id: 'scrape',
    command: '/scrape',
    label: 'Content Scraping',
    description: 'Scrape content from pages',
    prompt: 'Scrape content from [URL]. Extract text, metadata, and links.',
    category: 'data',
    taskPrimitive: 'content_scrape',
    requiredSpecs: ['Research', 'Data'],
    icon: '📄',
  },
  {
    id: 'contacts',
    command: '/contacts',
    label: 'Contact Extraction',
    description: 'Extract contact information',
    prompt: 'Extract contacts from [URL]. Find emails, phones, and social profiles.',
    category: 'data',
    taskPrimitive: 'contact_extraction',
    requiredSpecs: ['Data', 'Research'],
    icon: '📇',
  },
  {
    id: 'pricing',
    command: '/pricing',
    label: 'Pricing Extraction',
    description: 'Extract competitor pricing',
    prompt: 'Extract pricing from [URL]. Get tiers, features, and comparison data.',
    category: 'data',
    taskPrimitive: 'pricing_extraction',
    requiredSpecs: ['Data', 'Research', 'Intel'],
    icon: '💰',
  },
  {
    id: 'reviews',
    command: '/reviews',
    label: 'Review Aggregation',
    description: 'Collect and analyze reviews',
    prompt: 'Aggregate reviews for [PRODUCT/BRAND]. Analyze sentiment and themes.',
    category: 'data',
    taskPrimitive: 'review_aggregation',
    requiredSpecs: ['Data', 'Research', 'Analyst'],
    icon: '⭐',
  },

  // ============ CONTENT COMMANDS ============
  {
    id: 'write',
    command: '/write',
    label: 'Content Generation',
    description: 'Generate SEO-optimized content',
    prompt: 'Write content about [TOPIC]. Include meta description, title, and optimized body.',
    category: 'content',
    taskPrimitive: 'content_generation',
    requiredSpecs: ['Writing', 'SEO', 'Marketing'],
    icon: '✍️',
  },
  {
    id: 'seoarticle',
    command: '/seoarticle',
    label: 'SEO Article',
    description: 'Create fully optimized SEO article',
    prompt: 'Write SEO article about [TOPIC] targeting [KEYWORD]. Include backlink anchors.',
    category: 'content',
    taskPrimitive: 'seo_article',
    requiredSpecs: ['Writing', 'SEO'],
    icon: '📝',
  },
  {
    id: 'outreach',
    command: '/outreach',
    label: 'Outreach Drafting',
    description: 'Draft outreach emails',
    prompt: 'Draft outreach email for [TARGET]. Include subject lines and follow-up.',
    category: 'content',
    taskPrimitive: 'outreach_draft',
    requiredSpecs: ['Writing', 'Sales', 'Marketing'],
    icon: '📧',
  },
  {
    id: 'guestpost',
    command: '/guestpost',
    label: 'Guest Post Pitch',
    description: 'Create guest post pitches',
    prompt: 'Create guest post pitch for [TARGET SITE]. Include topic proposals and bio.',
    category: 'content',
    taskPrimitive: 'guest_post_pitch',
    requiredSpecs: ['Writing', 'SEO'],
    icon: '✉️',
  },
  {
    id: 'pressrelease',
    command: '/pressrelease',
    label: 'Press Release',
    description: 'Draft a press release',
    prompt: 'Draft press release for [ANNOUNCEMENT]. Include boilerplate and distribution targets.',
    category: 'content',
    taskPrimitive: 'press_release',
    requiredSpecs: ['Writing', 'Marketing'],
    icon: '📰',
  },
  {
    id: 'comments',
    command: '/comments',
    label: 'Comment Drafts',
    description: 'Draft forum/blog comments',
    prompt: 'Draft valuable comments for [TOPIC]. Include engagement strategies.',
    category: 'content',
    taskPrimitive: 'comment_drafts',
    requiredSpecs: ['Writing', 'SEO'],
    icon: '💬',
  },
  {
    id: 'social',
    command: '/social',
    label: 'Social Content',
    description: 'Create social media posts',
    prompt: 'Create social media posts about [TOPIC]. Include hashtags and hooks.',
    category: 'content',
    taskPrimitive: 'social_content',
    requiredSpecs: ['Writing', 'Marketing'],
    icon: '📱',
  },
  {
    id: 'product',
    command: '/product',
    label: 'Product Description',
    description: 'Create product descriptions',
    prompt: 'Create product description for [PRODUCT]. Include SEO-optimized copy.',
    category: 'content',
    taskPrimitive: 'product_description',
    requiredSpecs: ['Writing'],
    icon: '🏷️',
  },

  // ============ BUSINESS COMMANDS ============
  {
    id: 'names',
    command: '/names',
    label: 'Business Name Ideas',
    description: 'Generate business name ideas',
    prompt: 'Generate business names for [INDUSTRY]. Include domain suggestions.',
    category: 'business',
    taskPrimitive: 'business_name_ideas',
    requiredSpecs: ['Writing', 'Research'],
    icon: '💡',
  },
  {
    id: 'valueprop',
    command: '/valueprop',
    label: 'Value Proposition',
    description: 'Craft value proposition',
    prompt: 'Create value proposition for [PRODUCT/SERVICE]. Include taglines and USPs.',
    category: 'business',
    taskPrimitive: 'value_proposition',
    requiredSpecs: ['Writing', 'Analyst'],
    icon: '🎯',
  },
  {
    id: 'validate',
    command: '/validate',
    label: 'Idea Validation',
    description: 'Validate startup idea',
    prompt: 'Validate startup idea: [IDEA]. Research market size, competitors, and risks.',
    category: 'business',
    taskPrimitive: 'startup_idea_validation',
    requiredSpecs: ['Research', 'Analyst', 'Intel'],
    icon: '✅',
  },
  {
    id: 'landing',
    command: '/landing',
    label: 'Landing Page Copy',
    description: 'Create landing page copy',
    prompt: 'Write landing page copy for [PRODUCT]. Include headlines, CTAs, and trust elements.',
    category: 'business',
    taskPrimitive: 'landing_page_copy',
    requiredSpecs: ['Writing', 'Marketing'],
    icon: '🚀',
  },
  {
    id: 'pitch',
    command: '/pitch',
    label: 'Pitch Deck Outline',
    description: 'Create pitch deck outline',
    prompt: 'Create pitch deck outline for [BUSINESS]. Include key slides and narrative.',
    category: 'business',
    taskPrimitive: 'pitch_deck_outline',
    requiredSpecs: ['Writing', 'Analyst'],
    icon: '📊',
  },

  // ============ ANALYSIS COMMANDS ============
  {
    id: 'trends',
    command: '/trends',
    label: 'Trend Analysis',
    description: 'Analyze trends in a topic',
    prompt: 'Analyze trends for [TOPIC]. Provide insights and predictions.',
    category: 'analysis',
    taskPrimitive: 'trend_analysis',
    requiredSpecs: ['Analyst', 'Research'],
    icon: '📈',
  },
  {
    id: 'brand',
    command: '/brand',
    label: 'Brand Analysis',
    description: 'Analyze a brand\'s presence',
    prompt: 'Analyze brand [URL/NAME]. Profile messaging, positioning, and recommendations.',
    category: 'analysis',
    taskPrimitive: 'brand_analysis',
    requiredSpecs: ['Marketing', 'Research', 'Analyst'],
    icon: '🏢',
  },
  {
    id: 'sentiment',
    command: '/sentiment',
    label: 'Sentiment Analysis',
    description: 'Analyze sentiment around topic',
    prompt: 'Analyze sentiment for [BRAND/TOPIC]. Find themes and recommendations.',
    category: 'analysis',
    taskPrimitive: 'sentiment_analysis',
    requiredSpecs: ['Analyst', 'Research'],
    icon: '😊',
  },
  {
    id: 'techstack',
    command: '/techstack',
    label: 'Tech Stack Analysis',
    description: 'Analyze website tech stack',
    prompt: 'Analyze tech stack for [URL]. Identify technologies and frameworks.',
    category: 'analysis',
    taskPrimitive: 'tech_stack_analysis',
    requiredSpecs: ['Research', 'Analyst'],
    icon: '⚙️',
  },

  // ============ LEARNING COMMANDS ============
  {
    id: 'assess',
    command: '/assess',
    label: 'Skill Assessment',
    description: 'Evaluate and improve agent skills',
    prompt: 'Assess agent skills for [SKILL AREA]. Identify improvements and training needs.',
    category: 'learning',
    taskPrimitive: 'skill_assessment',
    requiredSpecs: ['Analyst'],
    icon: '🎯',
  },
  {
    id: 'domain',
    command: '/domain',
    label: 'Domain Learning',
    description: 'Deep research on a domain',
    prompt: 'Learn comprehensively about [DOMAIN]. Build expertise and knowledge base.',
    category: 'learning',
    taskPrimitive: 'domain_learning',
    requiredSpecs: ['Research'],
    icon: '📚',
  },
  {
    id: 'heuristics',
    command: '/heuristics',
    label: 'Heuristic Extraction',
    description: 'Extract patterns from successful tasks',
    prompt: 'Extract best practice heuristics for [TOPIC]. Find patterns and success factors.',
    category: 'learning',
    taskPrimitive: 'heuristic_extraction',
    requiredSpecs: ['Analyst', 'Intel'],
    icon: '🧬',
  },
  {
    id: 'reflect',
    command: '/reflect',
    label: 'Substrate Reflection',
    description: 'Reflect and improve memory',
    prompt: 'Reflect on [TOPIC] to improve substrate memory. Extract insights for future use.',
    category: 'learning',
    taskPrimitive: 'substrate_reflection',
    requiredSpecs: ['Dreamer', 'Analyst'],
    icon: '🪞',
  },
  {
    id: 'optimize',
    command: '/optimize',
    label: 'Prompt Optimization',
    description: 'Improve task execution prompts',
    prompt: 'Optimize prompts for [TASK TYPE]. Improve accuracy and efficiency.',
    category: 'learning',
    taskPrimitive: 'prompt_optimization',
    requiredSpecs: ['Analyst'],
    icon: '⚡',
  },
  {
    id: 'synthesize',
    command: '/synthesize',
    label: 'Knowledge Synthesis',
    description: 'Combine learnings into insights',
    prompt: 'Synthesize knowledge about [TOPIC]. Create actionable insights.',
    category: 'learning',
    taskPrimitive: 'knowledge_synthesis',
    requiredSpecs: ['Analyst', 'Research'],
    icon: '🔮',
  },
  {
    id: 'workflow',
    command: '/workflow',
    label: 'Workflow Discovery',
    description: 'Find optimal multi-step workflows',
    prompt: 'Discover optimal workflow for [GOAL]. Create step-by-step process.',
    category: 'learning',
    taskPrimitive: 'workflow_discovery',
    requiredSpecs: ['Analyst', 'OPS'],
    icon: '🔄',
  },
  {
    id: 'deepdive',
    command: '/deepdive',
    label: 'Industry Deep Dive',
    description: 'Intensive industry research',
    prompt: 'Deep dive into [INDUSTRY]. Become an expert with comprehensive research.',
    category: 'learning',
    taskPrimitive: 'industry_deep_dive',
    requiredSpecs: ['Research'],
    icon: '🏭',
  },
];

/**
 * Get available commands based on team composition
 */
export function getAvailableCommands(teamSpecs: Specialization[]): QuickCommand[] {
  const available = [...BASE_COMMANDS];

  for (const cmd of EXECUTABLE_COMMANDS) {
    if (!cmd.requiredSpecs || cmd.requiredSpecs.length === 0) {
      available.push(cmd);
      continue;
    }

    const hasRequiredSpec = cmd.requiredSpecs.some(spec => teamSpecs.includes(spec));
    if (hasRequiredSpec) {
      available.push(cmd);
    }
  }

  return available;
}

/**
 * Get commands grouped by category
 */
export function getCommandsByCategory(commands: QuickCommand[]): Record<string, QuickCommand[]> {
  const grouped: Record<string, QuickCommand[]> = {};
  
  for (const cmd of commands) {
    if (!grouped[cmd.category]) {
      grouped[cmd.category] = [];
    }
    grouped[cmd.category].push(cmd);
  }

  return grouped;
}

/**
 * Parse command from input string
 */
export function parseCommand(input: string): { command: QuickCommand | null; args: string } {
  const trimmed = input.trim();
  
  if (!trimmed.startsWith('/')) {
    return { command: null, args: trimmed };
  }

  const parts = trimmed.split(/\s+/);
  const cmdStr = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ');

  const allCommands = [...BASE_COMMANDS, ...EXECUTABLE_COMMANDS];
  const found = allCommands.find(c => c.command.toLowerCase() === cmdStr);

  return { command: found || null, args };
}

/**
 * Generate prompt from command with arguments
 */
export function buildPromptFromCommand(command: QuickCommand, args: string): string {
  if (!command.prompt) return args;
  
  let prompt = command.prompt;
  const placeholders = prompt.match(/\[([A-Z_/\s]+)\]/g) || [];
  
  if (placeholders.length > 0 && args) {
    prompt = prompt.replace(placeholders[0], args);
    for (const ph of placeholders.slice(1)) {
      prompt = prompt.replace(ph, '');
    }
  }

  return prompt.trim();
}

/**
 * Get the task primitive ID for a command
 */
export function getTaskPrimitiveForCommand(commandId: string): TaskPrimitiveId | null {
  const cmd = [...BASE_COMMANDS, ...EXECUTABLE_COMMANDS].find(c => c.id === commandId);
  return cmd?.taskPrimitive || null;
}

/**
 * Get all executable commands (for UI display)
 */
export function getAllExecutableCommands(): QuickCommand[] {
  return [...EXECUTABLE_COMMANDS];
}

/**
 * Get category display info
 */
export const CATEGORY_INFO: Record<string, { label: string; color: string; icon: string }> = {
  general: { label: 'General', color: 'text-muted-foreground', icon: '📋' },
  research: { label: 'Research', color: 'text-blue-400', icon: '🔍' },
  seo: { label: 'SEO', color: 'text-emerald-400', icon: '📈' },
  content: { label: 'Content', color: 'text-pink-400', icon: '✍️' },
  analysis: { label: 'Analysis', color: 'text-purple-400', icon: '📊' },
  data: { label: 'Data', color: 'text-cyan-400', icon: '📥' },
  business: { label: 'Business', color: 'text-amber-400', icon: '💼' },
  learning: { label: 'Learning', color: 'text-indigo-400', icon: '🎓' },
};

/**
 * Out of scope capabilities - be honest about limitations
 */
export const OUT_OF_SCOPE_CAPABILITIES = [
  'submit_to_search_engines',
  'post_to_forums',
  'create_accounts',
  'send_emails',
  'make_purchases',
  'access_paid_apis',
  'authenticate_external_services',
  'write_to_external_databases',
  'execute_javascript_on_sites',
  'bypass_captchas',
  'click_buttons_on_sites',
  'fill_forms_on_sites',
];

/**
 * Get comprehensive capabilities summary
 */
export function getCapabilitiesSummary(): { canDo: string[]; cannotDo: string[]; wouldNeed: string[] } {
  return {
    canDo: [
      'Web research and information gathering',
      'SEO audits, keyword research, and backlink analysis',
      'Competitor and market analysis',
      'Content generation (articles, emails, social posts)',
      'Data extraction and site mapping',
      'Trend, sentiment, and brand analysis',
      'Business strategy and idea validation',
      'Directory and citation discovery',
      'Contact and pricing extraction',
      'Review aggregation and analysis',
      'Guest post and outreach drafting',
      'Self-improvement and learning tasks',
      'Skill assessment and domain learning',
      'Heuristic extraction from tasks',
      'Knowledge synthesis and reflection',
      'Workflow discovery and optimization',
      'Prompt optimization for better execution',
      'Industry deep dives for expertise',
    ],
    cannotDo: [
      'Submit sites to search engines (no API)',
      'Post to forums or external sites (no auth)',
      'Send actual emails (no SMTP)',
      'Create accounts on external services',
      'Click buttons or fill forms on websites',
      'Bypass CAPTCHAs',
      'Access paid APIs without credentials',
    ],
    wouldNeed: [
      'SendGrid/SMTP integration for email sending',
      'OAuth credentials for forum/social posting',
      'Search engine submission APIs',
      'Browser automation for form filling',
      'Paid tool APIs (Ahrefs, SEMrush, etc.)',
    ],
  };
}

/**
 * Get command count by category
 */
export function getCommandCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  
  for (const cmd of EXECUTABLE_COMMANDS) {
    counts[cmd.category] = (counts[cmd.category] || 0) + 1;
  }
  
  return counts;
}
