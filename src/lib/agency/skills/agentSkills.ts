/**
 * Agent Skills Module v2.0 — Executable capabilities only
 * Each skill maps to task primitives agents CAN actually execute
 * Using: Groq (AI) + Firecrawl (Web) + Lovable AI Gateway
 */

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'research' | 'content' | 'data' | 'seo' | 'outreach';
  handlers: string[]; // Available: groq, firecrawl, lovable
  isExecutable: boolean; // Can this skill actually be executed with current infra?
}

// Core agent skills - ONLY those with working infrastructure
export const AGENT_SKILLS: Record<string, AgentSkill> = {
  research: {
    id: 'research',
    name: 'Web Research',
    description: 'Search and scrape websites for information using Firecrawl',
    icon: '🔍',
    category: 'research',
    handlers: ['firecrawl', 'groq'],
    isExecutable: true,
  },
  analysis: {
    id: 'analysis',
    name: 'Data Analysis',
    description: 'Analyze and synthesize information with AI',
    icon: '📊',
    category: 'data',
    handlers: ['groq', 'lovable'],
    isExecutable: true,
  },
  writing: {
    id: 'writing',
    name: 'Content Writing',
    description: 'Generate optimized content and articles',
    icon: '✍️',
    category: 'content',
    handlers: ['groq', 'lovable'],
    isExecutable: true,
  },
  seo: {
    id: 'seo',
    name: 'SEO Analysis',
    description: 'Analyze pages for SEO and provide recommendations',
    icon: '📈',
    category: 'seo',
    handlers: ['firecrawl', 'groq'],
    isExecutable: true,
  },
  competitive: {
    id: 'competitive',
    name: 'Competitive Intel',
    description: 'Research competitors and build profiles',
    icon: '🎯',
    category: 'research',
    handlers: ['firecrawl', 'groq'],
    isExecutable: true,
  },
  extraction: {
    id: 'extraction',
    name: 'Data Extraction',
    description: 'Extract structured data from web pages',
    icon: '📥',
    category: 'data',
    handlers: ['firecrawl'],
    isExecutable: true,
  },
} as const;

export type AgentSkillId = keyof typeof AGENT_SKILLS;

// Map specializations to only executable skills
export const SPECIALIZATION_SKILLS: Record<string, AgentSkillId[]> = {
  Research: ['research', 'analysis', 'competitive'],
  Intel: ['research', 'analysis', 'competitive', 'extraction'],
  Writing: ['writing', 'analysis'],
  SEO: ['seo', 'research', 'analysis'],
  Marketing: ['writing', 'seo', 'research'],
  Analyst: ['analysis', 'research', 'extraction'],
  Data: ['extraction', 'analysis', 'research'],
  Sales: ['research', 'competitive', 'writing'],
  Growth: ['seo', 'analysis', 'research'],
  Coding: ['analysis', 'research'],
  OPS: ['research', 'analysis'],
  Designer: ['writing', 'analysis'],
  Dreamer: ['writing', 'research'],
  Defense: ['research', 'analysis'],
  Audit: ['analysis', 'research', 'seo'],
  Finance: ['analysis', 'research'],
  Legal: ['research', 'analysis'],
  Support: ['writing', 'research'],
  Success: ['research', 'writing', 'analysis'],
  Hybrid: ['research', 'analysis', 'writing', 'seo', 'competitive'],
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

/**
 * Get all executable skill IDs
 */
export function getExecutableSkills(): AgentSkillId[] {
  return Object.keys(AGENT_SKILLS) as AgentSkillId[];
}
