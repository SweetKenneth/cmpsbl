/**
 * Agency Tasks — Type Definitions and Research Domains
 * Defines task types, research domains, and task execution helpers
 */

import type { Specialization } from './agencyTypes';

// ============================================================================
// RESEARCH DOMAINS — Real online resources agents can visit
// ============================================================================
export const RESEARCH_DOMAINS = {
  // General Research
  perplexity: { 
    url: 'https://www.perplexity.ai', 
    name: 'Perplexity AI', 
    category: 'research',
    description: 'AI-powered research and question answering',
    specializations: ['Research', 'Intel', 'Analyst'] as Specialization[]
  },
  wikipedia: { 
    url: 'https://www.wikipedia.org', 
    name: 'Wikipedia', 
    category: 'research',
    description: 'Encyclopedia for general knowledge',
    specializations: ['Research', 'Writing', 'Intel'] as Specialization[]
  },
  
  // Code & Technical
  github: { 
    url: 'https://github.com', 
    name: 'GitHub', 
    category: 'code',
    description: 'Code repositories and open source projects',
    specializations: ['Coding', 'Data', 'OPS'] as Specialization[]
  },
  stackoverflow: { 
    url: 'https://stackoverflow.com', 
    name: 'Stack Overflow', 
    category: 'code',
    description: 'Programming Q&A and solutions',
    specializations: ['Coding', 'Data', 'OPS'] as Specialization[]
  },
  npmjs: { 
    url: 'https://www.npmjs.com', 
    name: 'npm Registry', 
    category: 'code',
    description: 'JavaScript package registry',
    specializations: ['Coding', 'OPS'] as Specialization[]
  },
  
  // SEO & Marketing
  semrush: { 
    url: 'https://www.semrush.com', 
    name: 'SEMrush', 
    category: 'seo',
    description: 'SEO and marketing analytics',
    specializations: ['SEO', 'Marketing', 'Growth'] as Specialization[]
  },
  ahrefs: { 
    url: 'https://ahrefs.com', 
    name: 'Ahrefs', 
    category: 'seo',
    description: 'SEO tools and backlink analysis',
    specializations: ['SEO', 'Marketing'] as Specialization[]
  },
  
  // Business & Market
  crunchbase: { 
    url: 'https://www.crunchbase.com', 
    name: 'Crunchbase', 
    category: 'business',
    description: 'Company and funding data',
    specializations: ['Intel', 'Finance', 'Sales'] as Specialization[]
  },
  linkedin: { 
    url: 'https://www.linkedin.com', 
    name: 'LinkedIn', 
    category: 'business',
    description: 'Professional networking and company info',
    specializations: ['Sales', 'Intel', 'Marketing'] as Specialization[]
  },
  
  // Design & Creative
  dribbble: { 
    url: 'https://dribbble.com', 
    name: 'Dribbble', 
    category: 'design',
    description: 'Design inspiration and portfolios',
    specializations: ['Designer', 'Dreamer', 'Marketing'] as Specialization[]
  },
  behance: { 
    url: 'https://www.behance.net', 
    name: 'Behance', 
    category: 'design',
    description: 'Creative portfolios and inspiration',
    specializations: ['Designer', 'Dreamer'] as Specialization[]
  },
  
  // Legal & Compliance
  courtlistener: { 
    url: 'https://www.courtlistener.com', 
    name: 'CourtListener', 
    category: 'legal',
    description: 'Legal case search and opinions',
    specializations: ['Legal', 'Audit'] as Specialization[]
  },
  
  // Security
  cvedetails: { 
    url: 'https://www.cvedetails.com', 
    name: 'CVE Details', 
    category: 'security',
    description: 'Security vulnerability database',
    specializations: ['Defense', 'Audit', 'Coding'] as Specialization[]
  },
} as const;

export type ResearchDomainId = keyof typeof RESEARCH_DOMAINS;

// ============================================================================
// TASK TYPES
// ============================================================================
export const TASK_TYPES = {
  research: {
    id: 'research',
    name: 'Research',
    description: 'Deep research on a topic using online sources',
    icon: '🔍',
    color: 'blue',
    command: '/research',
    estimatedMinutes: 5,
    specializations: ['Research', 'Intel', 'Analyst'] as Specialization[]
  },
  seo_scan: {
    id: 'seo_scan',
    name: 'SEO Analysis',
    description: 'Analyze a URL for SEO tactics and recommendations',
    icon: '📊',
    color: 'teal',
    command: '/seo',
    estimatedMinutes: 3,
    specializations: ['SEO', 'Marketing', 'Growth'] as Specialization[]
  },
  code_study: {
    id: 'code_study',
    name: 'Code Study',
    description: 'Study a codebase or repository for patterns',
    icon: '💻',
    color: 'amber',
    command: '/code',
    estimatedMinutes: 10,
    specializations: ['Coding', 'Data', 'OPS'] as Specialization[]
  },
  company_research: {
    id: 'company_research',
    name: 'Company Intel',
    description: 'Research a company for competitive intelligence',
    icon: '🏢',
    color: 'indigo',
    command: '/intel',
    estimatedMinutes: 8,
    specializations: ['Intel', 'Sales', 'Finance'] as Specialization[]
  },
  content_creation: {
    id: 'content_creation',
    name: 'Content Creation',
    description: 'Create content based on research and guidelines',
    icon: '✍️',
    color: 'violet',
    command: '/write',
    estimatedMinutes: 15,
    specializations: ['Writing', 'Marketing', 'Dreamer'] as Specialization[]
  },
  analysis: {
    id: 'analysis',
    name: 'Data Analysis',
    description: 'Analyze data and generate insights',
    icon: '📈',
    color: 'cyan',
    command: '/analyze',
    estimatedMinutes: 7,
    specializations: ['Analyst', 'Data', 'Finance'] as Specialization[]
  },
  audit: {
    id: 'audit',
    name: 'Audit',
    description: 'Perform compliance or quality audit',
    icon: '✅',
    color: 'slate',
    command: '/audit',
    estimatedMinutes: 10,
    specializations: ['Audit', 'Legal', 'Defense'] as Specialization[]
  },
  idle_learning: {
    id: 'idle_learning',
    name: 'Self-Study',
    description: 'Agent learns from their specialized domain when idle',
    icon: '📚',
    color: 'purple',
    command: null,
    estimatedMinutes: 0,
    specializations: [] as Specialization[] // All agents can do this
  },
} as const;

export type TaskTypeId = keyof typeof TASK_TYPES;

// ============================================================================
// TASK STATUS
// ============================================================================
export const TASK_STATUSES = {
  queued: { id: 'queued', label: 'Queued', color: 'slate', icon: '⏳' },
  in_progress: { id: 'in_progress', label: 'In Progress', color: 'amber', icon: '🔄' },
  completed: { id: 'completed', label: 'Completed', color: 'emerald', icon: '✅' },
  failed: { id: 'failed', label: 'Failed', color: 'red', icon: '❌' },
  paused: { id: 'paused', label: 'Paused', color: 'slate', icon: '⏸️' },
} as const;

export type TaskStatus = keyof typeof TASK_STATUSES;

// ============================================================================
// TASK INTERFACE
// ============================================================================
export interface AgencyTask {
  id: string;
  agency_id: string;
  assigned_member_id: string | null;
  title: string;
  description: string | null;
  task_type: TaskTypeId;
  status: TaskStatus;
  priority: number;
  progress: number;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  research_domain: string | null;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AgencyTaskLog {
  id: string;
  task_id: string;
  member_id: string | null;
  log_type: 'info' | 'progress' | 'insight' | 'error' | 'completion';
  message: string;
  data: Record<string, any>;
  created_at: string;
}

export interface AgencySettings {
  id: string;
  agency_id: string;
  leader_name: string;
  auto_research_enabled: boolean;
  shared_learning_enabled: boolean;
  default_research_domains: string[];
  preset_commands: PresetCommand[];
  notification_preferences: Record<string, any>;
  theme_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PresetCommand {
  id: string;
  name: string;
  command: string;
  description: string;
  icon?: string;
}

// ============================================================================
// DEFAULT PRESETS
// ============================================================================
export const DEFAULT_PRESET_COMMANDS: PresetCommand[] = [
  { id: 'quick_research', name: 'Quick Research', command: '/research', description: 'Start a research task', icon: '🔍' },
  { id: 'seo_audit', name: 'SEO Audit', command: '/seo', description: 'Analyze a URL for SEO', icon: '📊' },
  { id: 'team_status', name: 'Team Status', command: '/status', description: 'Check team status', icon: '📡' },
  { id: 'daily_brief', name: 'Daily Brief', command: '/brief', description: 'Get daily summary', icon: '📋' },
];

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get research domains suitable for a specialization
 */
export function getDomainsForSpecialization(spec: Specialization): typeof RESEARCH_DOMAINS[ResearchDomainId][] {
  return Object.values(RESEARCH_DOMAINS).filter(
    domain => domain.specializations.includes(spec)
  );
}

/**
 * Get task types suitable for a specialization
 */
export function getTaskTypesForSpecialization(spec: Specialization): typeof TASK_TYPES[TaskTypeId][] {
  return Object.values(TASK_TYPES).filter(
    type => type.specializations.length === 0 || type.specializations.includes(spec)
  );
}

/**
 * Get default research domain for idle learning based on specialization
 */
export function getDefaultIdleDomain(spec: Specialization): ResearchDomainId {
  const domains = getDomainsForSpecialization(spec);
  if (domains.length > 0) {
    // Return the first matching domain's key
    const domainEntry = Object.entries(RESEARCH_DOMAINS).find(
      ([, v]) => v.specializations.includes(spec)
    );
    return (domainEntry?.[0] || 'perplexity') as ResearchDomainId;
  }
  return 'perplexity'; // Fallback
}

/**
 * Parse a command into a task configuration
 */
export function parseCommandToTask(command: string, args: string): Partial<AgencyTask> | null {
  const taskType = Object.values(TASK_TYPES).find(t => t.command === command);
  if (!taskType) return null;

  return {
    task_type: taskType.id as TaskTypeId,
    title: `${taskType.name}: ${args.slice(0, 50)}${args.length > 50 ? '...' : ''}`,
    description: args,
    input_data: { rawInput: args },
    priority: 50,
  };
}

/**
 * Format message content with rich formatting (replaces ## with styling)
 */
export function formatAgentMessage(content: string): string {
  // Replace ##text## with <strong>text</strong>
  let formatted = content.replace(/##([^#]+)##/g, '<strong>$1</strong>');
  
  // Replace **text** with <strong>text</strong>
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Replace *text* with <em>text</em>
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Replace - at start of lines with bullet points
  formatted = formatted.replace(/^- /gm, '• ');
  
  return formatted;
}
