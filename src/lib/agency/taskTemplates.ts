/**
 * Task Templates & Workflows
 * Pre-built task chains for common jobs
 */

import { TaskTypeId } from './agencyTasks';
import { Specialization } from './agencyTypes';

// ============================================================================
// WORKFLOW STEP
// ============================================================================
export interface WorkflowStep {
  id: string;
  name: string;
  taskType: TaskTypeId;
  description: string;
  inputMapping?: Record<string, string>; // Map previous step outputs to inputs
  requiredSpecs: Specialization[];
  estimatedMinutes: number;
  optional?: boolean;
}

// ============================================================================
// WORKFLOW TEMPLATE
// ============================================================================
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'research' | 'content' | 'analysis' | 'outreach' | 'audit' | 'growth';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedMinutes: number;
  steps: WorkflowStep[];
  tags: string[];
  popularity: number; // 0-100
}

// ============================================================================
// PRE-BUILT WORKFLOWS
// ============================================================================
export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  // Research & Intel
  {
    id: 'competitor_deep_dive',
    name: 'Competitor Deep Dive',
    description: 'Full competitive analysis: research, SEO audit, content analysis, and strategic recommendations',
    icon: '🔍',
    category: 'research',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
    tags: ['competitive', 'research', 'strategy'],
    popularity: 85,
    steps: [
      {
        id: 'research',
        name: 'Company Research',
        taskType: 'company_research',
        description: 'Gather basic company info, products, team, funding',
        requiredSpecs: ['Intel', 'Research'],
        estimatedMinutes: 8,
      },
      {
        id: 'seo_audit',
        name: 'SEO Audit',
        taskType: 'seo_scan',
        description: 'Analyze their SEO strategy and rankings',
        inputMapping: { url: 'research.companyUrl' },
        requiredSpecs: ['SEO', 'Marketing'],
        estimatedMinutes: 5,
      },
      {
        id: 'content_analysis',
        name: 'Content Analysis',
        taskType: 'analysis',
        description: 'Analyze their content strategy and top performers',
        inputMapping: { data: 'seo_audit.content_urls' },
        requiredSpecs: ['Analyst', 'Marketing'],
        estimatedMinutes: 7,
      },
      {
        id: 'report',
        name: 'Strategic Report',
        taskType: 'content_creation',
        description: 'Generate comprehensive competitive report',
        inputMapping: { brief: 'all_previous' },
        requiredSpecs: ['Writing', 'Analyst'],
        estimatedMinutes: 10,
      },
    ],
  },
  
  // SEO & Content
  {
    id: 'seo_content_pipeline',
    name: 'SEO Content Pipeline',
    description: 'End-to-end content creation: keyword research, outline, draft, and optimization',
    icon: '📝',
    category: 'content',
    difficulty: 'intermediate',
    estimatedMinutes: 45,
    tags: ['seo', 'content', 'writing'],
    popularity: 92,
    steps: [
      {
        id: 'keyword_research',
        name: 'Keyword Research',
        taskType: 'research',
        description: 'Find target keywords and search intent',
        requiredSpecs: ['SEO', 'Research'],
        estimatedMinutes: 10,
      },
      {
        id: 'competitor_content',
        name: 'Competitor Content Audit',
        taskType: 'seo_scan',
        description: 'Analyze top-ranking content for target keywords',
        inputMapping: { keywords: 'keyword_research.keywords' },
        requiredSpecs: ['SEO', 'Analyst'],
        estimatedMinutes: 8,
      },
      {
        id: 'outline',
        name: 'Content Outline',
        taskType: 'content_creation',
        description: 'Create detailed content outline',
        inputMapping: { research: 'all_previous' },
        requiredSpecs: ['Writing', 'SEO'],
        estimatedMinutes: 7,
      },
      {
        id: 'draft',
        name: 'Content Draft',
        taskType: 'content_creation',
        description: 'Write the full content piece',
        inputMapping: { outline: 'outline.output' },
        requiredSpecs: ['Writing'],
        estimatedMinutes: 15,
      },
      {
        id: 'optimize',
        name: 'SEO Optimization',
        taskType: 'analysis',
        description: 'Optimize content for target keywords',
        inputMapping: { content: 'draft.output', keywords: 'keyword_research.keywords' },
        requiredSpecs: ['SEO'],
        estimatedMinutes: 5,
      },
    ],
  },
  
  // Outreach
  {
    id: 'outreach_campaign',
    name: 'Outreach Campaign',
    description: 'Build and execute an outreach campaign: prospect research, personalization, and sequence creation',
    icon: '📧',
    category: 'outreach',
    difficulty: 'advanced',
    estimatedMinutes: 40,
    tags: ['sales', 'outreach', 'email'],
    popularity: 78,
    steps: [
      {
        id: 'prospect_research',
        name: 'Prospect Research',
        taskType: 'company_research',
        description: 'Research target companies and decision makers',
        requiredSpecs: ['Intel', 'Sales'],
        estimatedMinutes: 12,
      },
      {
        id: 'personalization',
        name: 'Personalization Analysis',
        taskType: 'analysis',
        description: 'Identify personalization hooks for each prospect',
        inputMapping: { prospects: 'prospect_research.output' },
        requiredSpecs: ['Analyst', 'Sales'],
        estimatedMinutes: 8,
      },
      {
        id: 'sequence_creation',
        name: 'Email Sequence',
        taskType: 'content_creation',
        description: 'Create personalized email sequences',
        inputMapping: { hooks: 'personalization.output' },
        requiredSpecs: ['Writing', 'Sales'],
        estimatedMinutes: 15,
      },
      {
        id: 'review',
        name: 'Quality Review',
        taskType: 'audit',
        description: 'Review sequences for quality and compliance',
        inputMapping: { emails: 'sequence_creation.output' },
        requiredSpecs: ['Audit', 'Legal'],
        estimatedMinutes: 5,
        optional: true,
      },
    ],
  },
  
  // Technical Audit
  {
    id: 'security_audit',
    name: 'Security Audit',
    description: 'Comprehensive security review: vulnerability scan, code analysis, and recommendations',
    icon: '🛡️',
    category: 'audit',
    difficulty: 'expert',
    estimatedMinutes: 60,
    tags: ['security', 'audit', 'compliance'],
    popularity: 65,
    steps: [
      {
        id: 'surface_scan',
        name: 'Attack Surface Scan',
        taskType: 'seo_scan', // Repurposed for surface scan
        description: 'Map external attack surface and entry points',
        requiredSpecs: ['Defense', 'Research'],
        estimatedMinutes: 15,
      },
      {
        id: 'code_analysis',
        name: 'Code Analysis',
        taskType: 'code_study',
        description: 'Analyze codebase for security vulnerabilities',
        requiredSpecs: ['Coding', 'Defense'],
        estimatedMinutes: 20,
      },
      {
        id: 'compliance_check',
        name: 'Compliance Check',
        taskType: 'audit',
        description: 'Check against security standards and best practices',
        inputMapping: { findings: 'all_previous' },
        requiredSpecs: ['Audit', 'Defense'],
        estimatedMinutes: 15,
      },
      {
        id: 'report',
        name: 'Security Report',
        taskType: 'content_creation',
        description: 'Generate comprehensive security report with recommendations',
        inputMapping: { audit: 'all_previous' },
        requiredSpecs: ['Writing', 'Defense'],
        estimatedMinutes: 10,
      },
    ],
  },
  
  // Growth Hacking
  {
    id: 'growth_sprint',
    name: 'Growth Sprint',
    description: 'Rapid growth experimentation: opportunity research, hypothesis generation, and test planning',
    icon: '🚀',
    category: 'growth',
    difficulty: 'advanced',
    estimatedMinutes: 35,
    tags: ['growth', 'experimentation', 'analytics'],
    popularity: 72,
    steps: [
      {
        id: 'opportunity_research',
        name: 'Opportunity Research',
        taskType: 'research',
        description: 'Identify growth opportunities and benchmarks',
        requiredSpecs: ['Growth', 'Research'],
        estimatedMinutes: 10,
      },
      {
        id: 'data_analysis',
        name: 'Data Analysis',
        taskType: 'analysis',
        description: 'Analyze current metrics and identify levers',
        requiredSpecs: ['Analyst', 'Data'],
        estimatedMinutes: 10,
      },
      {
        id: 'hypothesis',
        name: 'Hypothesis Generation',
        taskType: 'content_creation',
        description: 'Generate prioritized growth hypotheses',
        inputMapping: { insights: 'all_previous' },
        requiredSpecs: ['Growth', 'Dreamer'],
        estimatedMinutes: 8,
      },
      {
        id: 'test_plan',
        name: 'Test Plan',
        taskType: 'content_creation',
        description: 'Create detailed test plans for top hypotheses',
        inputMapping: { hypotheses: 'hypothesis.output' },
        requiredSpecs: ['Growth', 'Analyst'],
        estimatedMinutes: 7,
      },
    ],
  },
  
  // Quick Tasks
  {
    id: 'quick_seo_check',
    name: 'Quick SEO Check',
    description: 'Fast SEO health check for any URL',
    icon: '⚡',
    category: 'analysis',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    tags: ['seo', 'quick', 'audit'],
    popularity: 95,
    steps: [
      {
        id: 'scan',
        name: 'SEO Scan',
        taskType: 'seo_scan',
        description: 'Quick SEO analysis of the target URL',
        requiredSpecs: ['SEO'],
        estimatedMinutes: 3,
      },
      {
        id: 'summary',
        name: 'Summary',
        taskType: 'content_creation',
        description: 'Generate quick summary with top recommendations',
        inputMapping: { scan: 'scan.output' },
        requiredSpecs: ['Writing', 'SEO'],
        estimatedMinutes: 2,
      },
    ],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get workflows by category
 */
export function getWorkflowsByCategory(category: WorkflowTemplate['category']): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES.filter(w => w.category === category);
}

/**
 * Get workflows by difficulty
 */
export function getWorkflowsByDifficulty(difficulty: WorkflowTemplate['difficulty']): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES.filter(w => w.difficulty === difficulty);
}

/**
 * Get workflows available for a team composition
 */
export function getAvailableWorkflows(teamSpecs: Specialization[]): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES.filter(workflow => {
    // Check if team has all required specializations for all steps
    return workflow.steps.every(step => {
      if (step.optional) return true;
      return step.requiredSpecs.some(spec => teamSpecs.includes(spec));
    });
  });
}

/**
 * Get popular workflows
 */
export function getPopularWorkflows(limit: number = 5): WorkflowTemplate[] {
  return [...WORKFLOW_TEMPLATES]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

/**
 * Search workflows by tag or name
 */
export function searchWorkflows(query: string): WorkflowTemplate[] {
  const q = query.toLowerCase();
  return WORKFLOW_TEMPLATES.filter(w => 
    w.name.toLowerCase().includes(q) ||
    w.description.toLowerCase().includes(q) ||
    w.tags.some(t => t.includes(q))
  );
}

/**
 * Calculate workflow completion estimate
 */
export function estimateWorkflowDuration(workflow: WorkflowTemplate, teamSize: number): number {
  // Parallel execution bonus for larger teams
  const parallelBonus = Math.min(0.3, (teamSize - 1) * 0.1);
  return Math.round(workflow.estimatedMinutes * (1 - parallelBonus));
}
