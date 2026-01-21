/**
 * Task Primitives — Atomic units of work agents can execute
 * Each primitive defines inputs, outputs, required skills, and API handlers
 */

import type { AgentSkillId } from './agentSkills';

export type ExecutionProfile = 'single_run' | 'leader_route' | 'scheduled' | 'batch';

export interface TaskPrimitive {
  id: string;
  name: string;
  description: string;
  icon: string;
  
  // Schema
  inputs: string[];
  outputs: string[];
  
  // Requirements
  skills: AgentSkillId[];
  handlers: string[];
  
  // Execution config
  executionProfiles: ExecutionProfile[];
  estimatedDurationMs: number;
  
  // Telemetry
  telemetryFields: string[]; // Which counters to increment
}

export const TASK_PRIMITIVES: Record<string, TaskPrimitive> = {
  web_research: {
    id: 'web_research',
    name: 'Web Research',
    description: 'Search the web and compile research findings',
    icon: '🔍',
    inputs: ['query_string', 'websites?'],
    outputs: ['summary', 'citations'],
    skills: ['research', 'analysis'],
    handlers: ['firecrawl', 'fetch'],
    executionProfiles: ['single_run', 'leader_route'],
    estimatedDurationMs: 30000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
  },
  
  data_extraction: {
    id: 'data_extraction',
    name: 'Data Extraction',
    description: 'Extract structured data from a URL',
    icon: '📥',
    inputs: ['url'],
    outputs: ['json'],
    skills: ['analysis'],
    handlers: ['firecrawl', 'fetch'],
    executionProfiles: ['single_run', 'batch'],
    estimatedDurationMs: 15000,
    telemetryFields: ['websites_crawled', 'datasets_processed'],
  },
  
  data_enrichment: {
    id: 'data_enrichment',
    name: 'Data Enrichment',
    description: 'Enrich datasets with additional context',
    icon: '🔗',
    inputs: ['csv', 'json'],
    outputs: ['csv_enriched', 'json_enriched'],
    skills: ['enrichment', 'analysis'],
    handlers: ['firecrawl', 'wikipedia', 'whois', 'ipinfo'],
    executionProfiles: ['batch'],
    estimatedDurationMs: 60000,
    telemetryFields: ['enrichment_operations', 'datasets_processed'],
  },
  
  content_generation: {
    id: 'content_generation',
    name: 'Content Generation',
    description: 'Generate structured content from a brief',
    icon: '✍️',
    inputs: ['brief'],
    outputs: ['markdown', 'html', 'text'],
    skills: ['writing'],
    handlers: ['groq', 'lovable'],
    executionProfiles: ['single_run', 'leader_route'],
    estimatedDurationMs: 20000,
    telemetryFields: ['tasks_completed'],
  },
  
  outreach_generation: {
    id: 'outreach_generation',
    name: 'Outreach Generation',
    description: 'Generate email sequences and outreach scripts',
    icon: '📧',
    inputs: ['persona', 'offer'],
    outputs: ['email_sequence', 'script'],
    skills: ['writing', 'outreach'],
    handlers: ['groq', 'lovable'],
    executionProfiles: ['single_run', 'batch'],
    estimatedDurationMs: 25000,
    telemetryFields: ['tasks_completed'],
  },
  
  seo_audit: {
    id: 'seo_audit',
    name: 'SEO Audit',
    description: 'Analyze a domain for SEO opportunities',
    icon: '📊',
    inputs: ['domain'],
    outputs: ['audit_report', 'keyword_targets'],
    skills: ['seo', 'research'],
    handlers: ['firecrawl', 'fetch'],
    executionProfiles: ['single_run', 'scheduled'],
    estimatedDurationMs: 45000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
  },
  
  competitive_profile: {
    id: 'competitive_profile',
    name: 'Competitive Profile',
    description: 'Research competitors and build profiles',
    icon: '🎯',
    inputs: ['domain', 'query'],
    outputs: ['matrix', 'weaknesses', 'pricing'],
    skills: ['research', 'analysis'],
    handlers: ['firecrawl', 'fetch'],
    executionProfiles: ['single_run', 'leader_route'],
    estimatedDurationMs: 60000,
    telemetryFields: ['websites_crawled', 'tasks_completed'],
  },
  
  monitoring_check: {
    id: 'monitoring_check',
    name: 'Monitoring Check',
    description: 'Check a target for changes over time',
    icon: '👁️',
    inputs: ['target'],
    outputs: ['diff', 'trend', 'alert'],
    skills: ['monitoring', 'analysis'],
    handlers: ['firecrawl', 'fetch'],
    executionProfiles: ['scheduled'],
    estimatedDurationMs: 20000,
    telemetryFields: ['monitoring_cycles', 'websites_crawled'],
  },
  
  dataset_operations: {
    id: 'dataset_operations',
    name: 'Dataset Operations',
    description: 'Clean, convert, and normalize datasets',
    icon: '🔧',
    inputs: ['csv', 'json', 'xml'],
    outputs: ['cleaned_dataset', 'converted_dataset'],
    skills: ['data_ops'],
    handlers: ['groq', 'lovable'],
    executionProfiles: ['batch'],
    estimatedDurationMs: 30000,
    telemetryFields: ['datasets_processed'],
  },
  
  local_business_analysis: {
    id: 'local_business_analysis',
    name: 'Local Business Analysis',
    description: 'Analyze local businesses and competition',
    icon: '🏪',
    inputs: ['industry', 'geo'],
    outputs: ['local_comp_matrix', 'pricing', 'reviews'],
    skills: ['local_business', 'analysis'],
    handlers: ['yelp_reviews', 'firecrawl', 'fetch'],
    executionProfiles: ['single_run'],
    estimatedDurationMs: 45000,
    telemetryFields: ['api_calls', 'tasks_completed'],
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
    analysis: 'data_extraction',
    audit: 'seo_audit',
    code_study: 'web_research',
  };
  
  const primitiveId = mapping[taskType] || taskType;
  return TASK_PRIMITIVES[primitiveId] || null;
}
