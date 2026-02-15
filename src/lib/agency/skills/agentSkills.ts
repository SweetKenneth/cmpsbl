/**
 * Agent Skills Module v3.0 — Expanded executable capabilities
 * Each skill maps to task primitives agents CAN actually execute
 * Using: Groq (AI) + Firecrawl (Web) + Cloud AI Gateway
 */

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'research' | 'content' | 'data' | 'seo' | 'analysis' | 'business' | 'learning';
  handlers: string[]; // Available: groq, firecrawl, cloud
  isExecutable: boolean;
}

// Core agent skills - ALL executable with current infrastructure
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
    category: 'analysis',
    handlers: ['groq', 'cloud'],
    isExecutable: true,
  },
  writing: {
    id: 'writing',
    name: 'Content Writing',
    description: 'Generate optimized content, articles, and copy',
    icon: '✍️',
    category: 'content',
    handlers: ['groq', 'cloud'],
    isExecutable: true,
  },
  seo: {
    id: 'seo',
    name: 'SEO Optimization',
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
    handlers: ['firecrawl', 'groq'],
    isExecutable: true,
  },
  business: {
    id: 'business',
    name: 'Business Strategy',
    description: 'Business planning, validation, and growth strategies',
    icon: '💼',
    category: 'business',
    handlers: ['groq', 'cloud'],
    isExecutable: true,
  },
  learning: {
    id: 'learning',
    name: 'Self-Improvement',
    description: 'Learn new techniques and improve capabilities',
    icon: '🎓',
    category: 'learning',
    handlers: ['firecrawl', 'groq', 'cloud'],
    isExecutable: true,
  },
  outreach: {
    id: 'outreach',
    name: 'Outreach Content',
    description: 'Create outreach emails, pitches, and messaging',
    icon: '📧',
    category: 'content',
    handlers: ['groq', 'cloud'],
    isExecutable: true,
  },
  local_seo: {
    id: 'local_seo',
    name: 'Local SEO',
    description: 'Local search optimization and citation building',
    icon: '📍',
    category: 'seo',
    handlers: ['firecrawl', 'groq'],
    isExecutable: true,
  },
} as const;

export type AgentSkillId = keyof typeof AGENT_SKILLS;

// Map specializations to executable skills
export const SPECIALIZATION_SKILLS: Record<string, AgentSkillId[]> = {
  Research: ['research', 'analysis', 'competitive', 'extraction'],
  Intel: ['research', 'analysis', 'competitive', 'extraction', 'business'],
  Writing: ['writing', 'outreach', 'analysis', 'seo'],
  SEO: ['seo', 'research', 'analysis', 'local_seo', 'writing'],
  Marketing: ['writing', 'seo', 'research', 'outreach', 'business'],
  Analyst: ['analysis', 'research', 'extraction', 'competitive', 'business'],
  Data: ['extraction', 'analysis', 'research'],
  Sales: ['research', 'competitive', 'writing', 'outreach', 'business'],
  Growth: ['seo', 'analysis', 'research', 'business', 'competitive'],
  Coding: ['analysis', 'research', 'extraction'],
  OPS: ['research', 'analysis', 'extraction', 'learning'],
  Designer: ['writing', 'analysis', 'research'],
  Dreamer: ['writing', 'research', 'learning', 'business'],
  Defense: ['research', 'analysis', 'extraction', 'competitive'],
  Audit: ['analysis', 'research', 'seo', 'extraction'],
  Finance: ['analysis', 'research', 'extraction', 'business'],
  Legal: ['research', 'analysis', 'extraction', 'writing'],
  Support: ['writing', 'research', 'analysis', 'outreach'],
  Success: ['research', 'writing', 'analysis', 'outreach', 'business'],
  Hybrid: ['research', 'analysis', 'writing', 'seo', 'competitive', 'extraction', 'business', 'learning'],
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

/**
 * Get skills grouped by category
 */
export function getSkillsByCategory(): Record<string, AgentSkill[]> {
  const grouped: Record<string, AgentSkill[]> = {};
  
  for (const skill of Object.values(AGENT_SKILLS)) {
    if (!grouped[skill.category]) {
      grouped[skill.category] = [];
    }
    grouped[skill.category].push(skill);
  }
  
  return grouped;
}

/**
 * Get category display info
 */
export const SKILL_CATEGORY_INFO: Record<string, { label: string; color: string; icon: string }> = {
  research: { label: 'Research', color: 'text-blue-400', icon: '🔍' },
  analysis: { label: 'Analysis', color: 'text-purple-400', icon: '📊' },
  content: { label: 'Content', color: 'text-pink-400', icon: '✍️' },
  data: { label: 'Data', color: 'text-cyan-400', icon: '📥' },
  seo: { label: 'SEO', color: 'text-emerald-400', icon: '📈' },
  business: { label: 'Business', color: 'text-amber-400', icon: '💼' },
  learning: { label: 'Learning', color: 'text-indigo-400', icon: '🎓' },
};
