/**
 * Agency Quick Commands — Pre-built prompts that map to EXECUTABLE tasks
 * v2026.01.22 — Aligned with actual backend capabilities
 */

import { SPECIALIZATIONS, SKILL_DIMENSIONS, type Specialization } from './agencyTypes';
import { TASK_PRIMITIVES, type TaskPrimitiveId } from './skills/taskPrimitives';

export interface QuickCommand {
  id: string;
  command: string;
  label: string;
  description: string;
  prompt: string;
  category: 'research' | 'seo' | 'content' | 'analysis' | 'data' | 'general';
  // Maps directly to an executable task primitive
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
    description: 'Display all available commands',
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
];

// Commands that map to EXECUTABLE task primitives only
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

    // Check if team has at least one of the required specializations
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
  
  // Replace placeholders with args
  let prompt = command.prompt;
  const placeholders = prompt.match(/\[([A-Z_/]+)\]/g) || [];
  
  if (placeholders.length > 0 && args) {
    // Replace first placeholder with args
    prompt = prompt.replace(placeholders[0], args);
    // Remove remaining placeholders
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
export const CATEGORY_INFO: Record<string, { label: string; color: string }> = {
  general: { label: 'General', color: 'text-muted-foreground' },
  research: { label: 'Research', color: 'text-blue-400' },
  seo: { label: 'SEO', color: 'text-emerald-400' },
  content: { label: 'Content', color: 'text-pink-400' },
  analysis: { label: 'Analysis', color: 'text-purple-400' },
  data: { label: 'Data Extraction', color: 'text-cyan-400' },
};

/**
 * Capabilities that the leader CANNOT do
 * Leader should be honest about these limitations
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
  'execute_javascript',
  'bypass_captchas',
];

/**
 * Get a human-readable explanation of what the team can/cannot do
 */
export function getCapabilitiesSummary(): { canDo: string[]; cannotDo: string[] } {
  return {
    canDo: [
      'Web research and information gathering',
      'SEO audits and keyword research',
      'Competitor and market analysis',
      'Content generation (articles, emails, social posts)',
      'Data extraction and site mapping',
      'Trend and brand analysis',
      'Backlink opportunity research',
    ],
    cannotDo: [
      'Submit sites to search engines (need API credentials)',
      'Post to forums or external sites (need authentication)',
      'Send actual emails (need SMTP/email service)',
      'Create accounts on external services',
      'Access paid third-party APIs without credentials',
      'Execute actions that require CAPTCHA solving',
    ],
  };
}
