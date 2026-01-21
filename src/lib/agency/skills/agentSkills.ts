/**
 * Agent Skills Module — Defines capabilities for agency agents
 * Each skill maps to specific task primitives agents can execute
 */

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'research' | 'content' | 'data' | 'outreach' | 'technical' | 'business';
  handlers: string[]; // API handlers this skill can use
}

// Core agent skills
export const AGENT_SKILLS: Record<string, AgentSkill> = {
  research: {
    id: 'research',
    name: 'Research',
    description: 'Perform competitive, market, and web research',
    icon: '🔍',
    category: 'research',
    handlers: ['firecrawl', 'fetch', 'wikipedia', 'hn_api', 'reddit_api'],
  },
  writing: {
    id: 'writing',
    name: 'Writing',
    description: 'Generate structured content outputs',
    icon: '✍️',
    category: 'content',
    handlers: ['groq', 'lovable'],
  },
  analysis: {
    id: 'analysis',
    name: 'Analysis',
    description: 'Extract structured insights and summaries',
    icon: '📊',
    category: 'data',
    handlers: ['groq', 'lovable'],
  },
  enrichment: {
    id: 'enrichment',
    name: 'Enrichment',
    description: 'Enrich datasets with additional context',
    icon: '🔗',
    category: 'data',
    handlers: ['firecrawl', 'wikipedia', 'whois', 'ipinfo', 'builtwith'],
  },
  outreach: {
    id: 'outreach',
    name: 'Outreach',
    description: 'Generate outreach messaging and campaign copy',
    icon: '📧',
    category: 'outreach',
    handlers: ['groq', 'lovable'],
  },
  seo: {
    id: 'seo',
    name: 'SEO',
    description: 'Analyze SEO signals and surface opportunities',
    icon: '📈',
    category: 'technical',
    handlers: ['firecrawl', 'fetch', 'groq'],
  },
  monitoring: {
    id: 'monitoring',
    name: 'Monitoring',
    description: 'Track changes over time across web targets',
    icon: '👁️',
    category: 'research',
    handlers: ['firecrawl', 'fetch'],
  },
  data_ops: {
    id: 'data_ops',
    name: 'Data Ops',
    description: 'Clean, convert, normalize and export datasets',
    icon: '🔧',
    category: 'data',
    handlers: ['groq', 'lovable'],
  },
  local_business: {
    id: 'local_business',
    name: 'Local Business',
    description: 'Perform local competitive audits and profiles',
    icon: '🏪',
    category: 'business',
    handlers: ['yelp_reviews', 'firecrawl', 'fetch'],
  },
} as const;

export type AgentSkillId = keyof typeof AGENT_SKILLS;

// Map specializations to skills
export const SPECIALIZATION_SKILLS: Record<string, AgentSkillId[]> = {
  Research: ['research', 'analysis', 'monitoring'],
  Intel: ['research', 'analysis', 'enrichment'],
  Writing: ['writing', 'outreach'],
  SEO: ['seo', 'research', 'analysis'],
  Marketing: ['outreach', 'writing', 'seo'],
  Analyst: ['analysis', 'data_ops', 'research'],
  Data: ['data_ops', 'analysis', 'enrichment'],
  Sales: ['outreach', 'research', 'local_business'],
  Growth: ['seo', 'analysis', 'outreach'],
  Coding: ['analysis', 'data_ops'],
  OPS: ['data_ops', 'monitoring'],
  Designer: ['writing', 'analysis'],
  Dreamer: ['writing', 'research'],
  Defense: ['research', 'analysis', 'monitoring'],
  Audit: ['analysis', 'research', 'data_ops'],
  Finance: ['analysis', 'research', 'data_ops'],
  Legal: ['research', 'analysis'],
  Support: ['writing', 'research'],
  Success: ['outreach', 'writing', 'research'],
  Hybrid: ['research', 'analysis', 'writing', 'outreach', 'seo'],
};

/**
 * Get skills available for a specialization
 */
export function getSkillsForSpecialization(specialization: string): AgentSkill[] {
  const skillIds = SPECIALIZATION_SKILLS[specialization] || ['research', 'analysis'];
  return skillIds.map(id => AGENT_SKILLS[id]).filter(Boolean);
}

/**
 * Check if an agent has a specific skill
 */
export function hasSkill(specialization: string, skillId: AgentSkillId): boolean {
  const skills = SPECIALIZATION_SKILLS[specialization] || [];
  return skills.includes(skillId);
}
