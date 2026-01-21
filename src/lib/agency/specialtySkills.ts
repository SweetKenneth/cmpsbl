/**
 * Specialty Skills System
 * Unique abilities for each agent class that only they can perform
 */

import type { Specialization } from './agencyTypes';
import type { TaskTypeId } from './agencyTasks';

export interface SpecialtySkill {
  id: string;
  name: string;
  description: string;
  icon: string;
  specialization: Specialization;
  taskType: TaskTypeId;
  inputPlaceholder: string;
  estimatedMinutes: number;
  crawlDepth: number; // How many links deep to crawl
}

/**
 * Unique specialty skills - one per agent type
 */
export const SPECIALTY_SKILLS: Record<Specialization, SpecialtySkill> = {
  // Leadership
  Hybrid: {
    id: 'strategic_synthesis',
    name: 'Strategic Synthesis',
    description: 'Synthesize insights from all team members into unified strategy',
    icon: '🎯',
    specialization: 'Hybrid',
    taskType: 'analysis',
    inputPlaceholder: 'Enter strategic goal to synthesize...',
    estimatedMinutes: 8,
    crawlDepth: 3,
  },

  // Core Operations
  OPS: {
    id: 'workflow_automation',
    name: 'Workflow Automation',
    description: 'Design automated workflows and process optimization plans',
    icon: '⚙️',
    specialization: 'OPS',
    taskType: 'analysis',
    inputPlaceholder: 'Describe the workflow to automate...',
    estimatedMinutes: 10,
    crawlDepth: 2,
  },
  Coding: {
    id: 'deep_code_audit',
    name: 'Deep Code Audit',
    description: 'Analyze repositories 5 levels deep for patterns and vulnerabilities',
    icon: '🔬',
    specialization: 'Coding',
    taskType: 'code_study',
    inputPlaceholder: 'Enter repository URL or codebase description...',
    estimatedMinutes: 15,
    crawlDepth: 5,
  },
  Analyst: {
    id: 'predictive_modeling',
    name: 'Predictive Modeling',
    description: 'Build predictive models and trend forecasts from data patterns',
    icon: '📈',
    specialization: 'Analyst',
    taskType: 'analysis',
    inputPlaceholder: 'Describe the data or trend to model...',
    estimatedMinutes: 12,
    crawlDepth: 4,
  },

  // Creative & Content
  Writing: {
    id: 'seo_content_creation',
    name: 'SEO Blog Generator',
    description: 'Create fully optimized blog posts with internal linking strategy',
    icon: '✍️',
    specialization: 'Writing',
    taskType: 'content_creation',
    inputPlaceholder: 'Enter blog topic and target keywords...',
    estimatedMinutes: 20,
    crawlDepth: 3,
  },
  Dreamer: {
    id: 'innovation_workshop',
    name: 'Innovation Workshop',
    description: 'Generate breakthrough ideas through creative exploration',
    icon: '💡',
    specialization: 'Dreamer',
    taskType: 'research',
    inputPlaceholder: 'Describe the innovation challenge...',
    estimatedMinutes: 10,
    crawlDepth: 4,
  },
  Designer: {
    id: 'design_system_audit',
    name: 'Design System Audit',
    description: 'Analyze design patterns and create improvement recommendations',
    icon: '🎨',
    specialization: 'Designer',
    taskType: 'audit',
    inputPlaceholder: 'Enter URL or design system to audit...',
    estimatedMinutes: 12,
    crawlDepth: 3,
  },

  // Research & Intelligence
  Research: {
    id: 'deep_web_research',
    name: 'Deep Web Research',
    description: 'Comprehensive research crawling 5+ sources with citations',
    icon: '🔍',
    specialization: 'Research',
    taskType: 'research',
    inputPlaceholder: 'Enter research topic or question...',
    estimatedMinutes: 15,
    crawlDepth: 5,
  },
  Intel: {
    id: 'competitive_intelligence',
    name: 'Competitive Intelligence',
    description: 'Deep competitor analysis with market positioning insights',
    icon: '🕵️',
    specialization: 'Intel',
    taskType: 'company_research',
    inputPlaceholder: 'Enter competitor name or market segment...',
    estimatedMinutes: 18,
    crawlDepth: 5,
  },

  // Security & Defense
  Defense: {
    id: 'threat_assessment',
    name: 'Threat Assessment',
    description: 'Comprehensive security threat analysis and risk scoring',
    icon: '🛡️',
    specialization: 'Defense',
    taskType: 'audit',
    inputPlaceholder: 'Enter domain or system to assess...',
    estimatedMinutes: 15,
    crawlDepth: 4,
  },
  Audit: {
    id: 'compliance_check',
    name: 'Compliance Check',
    description: 'Full compliance audit against industry standards',
    icon: '✅',
    specialization: 'Audit',
    taskType: 'audit',
    inputPlaceholder: 'Enter system or process to audit...',
    estimatedMinutes: 20,
    crawlDepth: 3,
  },

  // Business & Finance
  Finance: {
    id: 'financial_analysis',
    name: 'Financial Analysis',
    description: 'Deep financial modeling and investment analysis',
    icon: '💰',
    specialization: 'Finance',
    taskType: 'analysis',
    inputPlaceholder: 'Enter company or financial scenario...',
    estimatedMinutes: 15,
    crawlDepth: 4,
  },
  Sales: {
    id: 'lead_enrichment',
    name: 'Lead Enrichment',
    description: 'Enrich leads with company data and buying signals',
    icon: '📞',
    specialization: 'Sales',
    taskType: 'company_research',
    inputPlaceholder: 'Enter company name or lead info...',
    estimatedMinutes: 8,
    crawlDepth: 3,
  },
  Legal: {
    id: 'legal_research',
    name: 'Legal Research',
    description: 'Research case law and regulatory requirements',
    icon: '⚖️',
    specialization: 'Legal',
    taskType: 'research',
    inputPlaceholder: 'Enter legal question or topic...',
    estimatedMinutes: 20,
    crawlDepth: 4,
  },

  // Marketing & Growth
  Marketing: {
    id: 'campaign_strategy',
    name: 'Campaign Strategy',
    description: 'Design multi-channel marketing campaigns with messaging',
    icon: '📣',
    specialization: 'Marketing',
    taskType: 'content_creation',
    inputPlaceholder: 'Describe the campaign goal and audience...',
    estimatedMinutes: 15,
    crawlDepth: 3,
  },
  Growth: {
    id: 'growth_hacking',
    name: 'Growth Hacking',
    description: 'Identify viral loops and growth optimization opportunities',
    icon: '🚀',
    specialization: 'Growth',
    taskType: 'analysis',
    inputPlaceholder: 'Enter product or company to analyze...',
    estimatedMinutes: 12,
    crawlDepth: 4,
  },
  SEO: {
    id: 'backlink_analysis',
    name: 'Backlink Analysis',
    description: 'Deep backlink profile analysis with link building opportunities',
    icon: '🔗',
    specialization: 'SEO',
    taskType: 'seo_scan',
    inputPlaceholder: 'Enter domain to analyze...',
    estimatedMinutes: 15,
    crawlDepth: 5,
  },

  // Customer-Facing
  Support: {
    id: 'knowledge_base_builder',
    name: 'Knowledge Base Builder',
    description: 'Create comprehensive FAQ and documentation from queries',
    icon: '📚',
    specialization: 'Support',
    taskType: 'content_creation',
    inputPlaceholder: 'Enter product or topic for knowledge base...',
    estimatedMinutes: 18,
    crawlDepth: 3,
  },
  Success: {
    id: 'customer_health_analysis',
    name: 'Customer Health Analysis',
    description: 'Analyze customer engagement and churn risk factors',
    icon: '❤️',
    specialization: 'Success',
    taskType: 'analysis',
    inputPlaceholder: 'Enter customer segment or account...',
    estimatedMinutes: 10,
    crawlDepth: 2,
  },

  // Data & ML
  Data: {
    id: 'data_pipeline_design',
    name: 'Data Pipeline Design',
    description: 'Design ETL pipelines and data architecture recommendations',
    icon: '🔄',
    specialization: 'Data',
    taskType: 'analysis',
    inputPlaceholder: 'Describe the data sources and requirements...',
    estimatedMinutes: 15,
    crawlDepth: 3,
  },
};

/**
 * Get specialty skill for a specialization
 */
export function getSpecialtySkill(specialization: Specialization): SpecialtySkill | null {
  return SPECIALTY_SKILLS[specialization] || null;
}

/**
 * Check if a specialization has a specialty skill
 */
export function hasSpecialtySkill(specialization: Specialization): boolean {
  return specialization in SPECIALTY_SKILLS;
}

// ============================================================================
// TEAM TASKS — Multi-agent coordinated missions
// ============================================================================

export interface TeamTask {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredSpecs: Specialization[];
  steps: TeamTaskStep[];
  estimatedMinutes: number;
}

export interface TeamTaskStep {
  order: number;
  specialization: Specialization;
  taskType: TaskTypeId;
  action: string;
  dependsOn?: number[]; // Step orders this depends on
}

/**
 * Pre-defined team tasks that chain multiple agents together
 */
export const TEAM_TASKS: TeamTask[] = [
  {
    id: 'company_reputation_report',
    name: 'Company Reputation Report',
    description: 'Research company reputation across web, analyze sentiment, and create report',
    icon: '🏢',
    requiredSpecs: ['Research', 'Analyst', 'Writing'],
    steps: [
      { order: 1, specialization: 'Research', taskType: 'research', action: 'Gather online mentions and reviews' },
      { order: 2, specialization: 'Intel', taskType: 'company_research', action: 'Deep competitor positioning analysis', dependsOn: [1] },
      { order: 3, specialization: 'Analyst', taskType: 'analysis', action: 'Analyze sentiment and patterns', dependsOn: [1, 2] },
      { order: 4, specialization: 'Writing', taskType: 'content_creation', action: 'Create comprehensive report', dependsOn: [3] },
    ],
    estimatedMinutes: 25,
  },
  {
    id: 'seo_content_campaign',
    name: 'SEO Content Campaign',
    description: 'Full SEO audit, keyword research, and content creation for rankings',
    icon: '📈',
    requiredSpecs: ['SEO', 'Research', 'Writing'],
    steps: [
      { order: 1, specialization: 'SEO', taskType: 'seo_scan', action: 'Comprehensive site audit' },
      { order: 2, specialization: 'Research', taskType: 'research', action: 'Keyword and topic research', dependsOn: [1] },
      { order: 3, specialization: 'Writing', taskType: 'content_creation', action: 'Create optimized blog posts', dependsOn: [2] },
    ],
    estimatedMinutes: 30,
  },
  {
    id: 'backlink_building_campaign',
    name: 'Backlink Building Campaign',
    description: 'Analyze backlink profile, find opportunities, and create outreach content',
    icon: '🔗',
    requiredSpecs: ['SEO', 'Sales', 'Writing'],
    steps: [
      { order: 1, specialization: 'SEO', taskType: 'seo_scan', action: 'Backlink profile analysis' },
      { order: 2, specialization: 'Research', taskType: 'research', action: 'Find link building opportunities', dependsOn: [1] },
      { order: 3, specialization: 'Sales', taskType: 'company_research', action: 'Identify outreach targets', dependsOn: [2] },
      { order: 4, specialization: 'Writing', taskType: 'content_creation', action: 'Create outreach templates', dependsOn: [3] },
    ],
    estimatedMinutes: 35,
  },
  {
    id: 'competitive_intel_brief',
    name: 'Competitive Intel Brief',
    description: 'Deep competitor analysis with market positioning and strategic recommendations',
    icon: '🕵️',
    requiredSpecs: ['Intel', 'Analyst', 'Writing'],
    steps: [
      { order: 1, specialization: 'Intel', taskType: 'company_research', action: 'Deep competitor research' },
      { order: 2, specialization: 'SEO', taskType: 'seo_scan', action: 'Competitor SEO analysis', dependsOn: [1] },
      { order: 3, specialization: 'Analyst', taskType: 'analysis', action: 'SWOT and market analysis', dependsOn: [1, 2] },
      { order: 4, specialization: 'Writing', taskType: 'content_creation', action: 'Executive brief creation', dependsOn: [3] },
    ],
    estimatedMinutes: 40,
  },
  {
    id: 'security_audit_report',
    name: 'Security Audit Report',
    description: 'Comprehensive security assessment with threat analysis and recommendations',
    icon: '🛡️',
    requiredSpecs: ['Defense', 'Audit', 'Writing'],
    steps: [
      { order: 1, specialization: 'Defense', taskType: 'audit', action: 'Threat landscape assessment' },
      { order: 2, specialization: 'Audit', taskType: 'audit', action: 'Compliance and vulnerability check', dependsOn: [1] },
      { order: 3, specialization: 'Coding', taskType: 'code_study', action: 'Code security review', dependsOn: [2] },
      { order: 4, specialization: 'Writing', taskType: 'content_creation', action: 'Security report and recommendations', dependsOn: [3] },
    ],
    estimatedMinutes: 45,
  },
  {
    id: 'product_launch_research',
    name: 'Product Launch Research',
    description: 'Market research, competitor analysis, and launch strategy for new products',
    icon: '🚀',
    requiredSpecs: ['Research', 'Marketing', 'Growth'],
    steps: [
      { order: 1, specialization: 'Research', taskType: 'research', action: 'Market size and trends research' },
      { order: 2, specialization: 'Intel', taskType: 'company_research', action: 'Competitor product analysis', dependsOn: [1] },
      { order: 3, specialization: 'Marketing', taskType: 'content_creation', action: 'Positioning and messaging', dependsOn: [2] },
      { order: 4, specialization: 'Growth', taskType: 'analysis', action: 'Growth strategy and channels', dependsOn: [3] },
    ],
    estimatedMinutes: 35,
  },
];

/**
 * Get available team tasks based on team composition
 */
export function getAvailableTeamTasks(teamSpecs: Specialization[]): TeamTask[] {
  return TEAM_TASKS.filter(task => {
    // Check if team has at least 2 of the required specs (flexible matching)
    const matchedSpecs = task.requiredSpecs.filter(spec => teamSpecs.includes(spec));
    return matchedSpecs.length >= 2 || matchedSpecs.length === task.requiredSpecs.length;
  });
}

/**
 * Check if a team can execute a specific team task
 */
export function canExecuteTeamTask(teamSpecs: Specialization[], taskId: string): boolean {
  const task = TEAM_TASKS.find(t => t.id === taskId);
  if (!task) return false;
  
  const matchedSpecs = task.requiredSpecs.filter(spec => teamSpecs.includes(spec));
  return matchedSpecs.length >= 2;
}
