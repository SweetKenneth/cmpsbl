/**
 * Agency Quick Commands — Pre-built prompts based on team configuration
 * v2026.01
 */

import { SPECIALIZATIONS, SKILL_DIMENSIONS, type Specialization } from './agencyTypes';

export interface QuickCommand {
  id: string;
  command: string;
  label: string;
  description: string;
  prompt: string;
  category: 'research' | 'analysis' | 'execution' | 'creative' | 'strategy' | 'technical' | 'general';
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
  {
    id: 'brief',
    command: '/brief',
    label: 'Daily Brief',
    description: 'Get a summary of priorities and updates',
    prompt: 'Provide a brief summary of today\'s priorities, any pending items, and key updates the team should know about.',
    category: 'general',
    icon: '📋',
  },
];

// Specialized commands based on team composition
const SPECIALIZED_COMMANDS: QuickCommand[] = [
  // Research Commands
  {
    id: 'research-deep',
    command: '/research',
    label: 'Deep Research',
    description: 'Conduct comprehensive research on a topic',
    prompt: 'Conduct thorough research on [TOPIC]. Analyze multiple sources, identify key insights, and compile findings with citations.',
    category: 'research',
    requiredSpecs: ['Research', 'Intel'],
    icon: '🔬',
  },
  {
    id: 'market-scan',
    command: '/market',
    label: 'Market Analysis',
    description: 'Analyze market trends and competitors',
    prompt: 'Perform market analysis including competitor landscape, emerging trends, opportunities, and potential threats for [TARGET].',
    category: 'research',
    requiredSpecs: ['Research', 'Marketing', 'Intel'],
    icon: '📈',
  },

  // Analysis Commands
  {
    id: 'analyze',
    command: '/analyze',
    label: 'Data Analysis',
    description: 'Analyze data and extract insights',
    prompt: 'Analyze the following data/information and provide actionable insights, patterns, and recommendations: [DATA]',
    category: 'analysis',
    requiredSpecs: ['Data', 'Research', 'Analyst'],
    icon: '📉',
  },
  {
    id: 'audit',
    command: '/audit',
    label: 'Audit Review',
    description: 'Conduct a thorough audit',
    prompt: 'Perform a comprehensive audit of [TARGET], identifying issues, risks, compliance gaps, and improvement recommendations.',
    category: 'analysis',
    requiredSpecs: ['Audit', 'Legal'],
    icon: '🔍',
  },

  // Execution Commands
  {
    id: 'build',
    command: '/build',
    label: 'Build Feature',
    description: 'Start building a feature or component',
    prompt: 'Plan and begin implementation of [FEATURE]. Break down into tasks, assign to appropriate team members, and outline the development approach.',
    category: 'execution',
    requiredSpecs: ['Coding', 'OPS'],
    icon: '🔧',
  },
  {
    id: 'deploy',
    command: '/deploy',
    label: 'Deploy Update',
    description: 'Prepare and execute deployment',
    prompt: 'Prepare deployment checklist for [TARGET], verify all requirements, and execute deployment with rollback plan ready.',
    category: 'execution',
    requiredSpecs: ['Coding', 'OPS'],
    icon: '🚀',
  },

  // Creative Commands
  {
    id: 'design',
    command: '/design',
    label: 'Design Sprint',
    description: 'Start a design exploration',
    prompt: 'Begin design exploration for [PROJECT]. Generate creative concepts, mood boards, and initial prototypes that align with brand guidelines.',
    category: 'creative',
    requiredSpecs: ['Designer', 'Writing'],
    icon: '🎨',
  },
  {
    id: 'content',
    command: '/content',
    label: 'Content Creation',
    description: 'Create content for various channels',
    prompt: 'Create engaging content for [CHANNEL/PURPOSE]. Include copy, headlines, and suggestions for visual elements.',
    category: 'creative',
    requiredSpecs: ['Writing', 'Marketing', 'SEO'],
    icon: '✍️',
  },

  // Strategy Commands
  {
    id: 'plan',
    command: '/plan',
    label: 'Strategic Plan',
    description: 'Develop a strategic plan',
    prompt: 'Develop a strategic plan for [OBJECTIVE]. Include goals, milestones, resources needed, risks, and success metrics.',
    category: 'strategy',
    requiredSpecs: ['Analyst', 'Hybrid'],
    icon: '🎯',
  },
  {
    id: 'growth',
    command: '/growth',
    label: 'Growth Strategy',
    description: 'Identify growth opportunities',
    prompt: 'Identify growth opportunities and develop tactical recommendations for [TARGET]. Include quick wins and long-term strategies.',
    category: 'strategy',
    requiredSpecs: ['Growth', 'Marketing', 'Sales'],
    icon: '📈',
  },

  // Technical Commands
  {
    id: 'security',
    command: '/security',
    label: 'Security Review',
    description: 'Perform security assessment',
    prompt: 'Conduct security assessment of [TARGET]. Identify vulnerabilities, assess risks, and provide remediation recommendations.',
    category: 'technical',
    requiredSpecs: ['Defense', 'Audit'],
    icon: '🛡️',
  },
  {
    id: 'optimize',
    command: '/optimize',
    label: 'Performance Optimization',
    description: 'Optimize for better performance',
    prompt: 'Analyze [TARGET] for performance bottlenecks and optimization opportunities. Provide specific recommendations with expected impact.',
    category: 'technical',
    requiredSpecs: ['Coding', 'OPS', 'Data'],
    icon: '⚡',
  },

  // Customer-focused Commands
  {
    id: 'support',
    command: '/support',
    label: 'Customer Support',
    description: 'Handle customer inquiry',
    prompt: 'Address the following customer inquiry with empathy and expertise: [ISSUE]. Provide solutions and next steps.',
    category: 'general',
    requiredSpecs: ['Success', 'Support'],
    icon: '💬',
  },
  {
    id: 'onboard',
    command: '/onboard',
    label: 'Customer Onboarding',
    description: 'Guide new customer onboarding',
    prompt: 'Create personalized onboarding plan for [CUSTOMER]. Include key milestones, training resources, and success criteria.',
    category: 'general',
    requiredSpecs: ['Success', 'Sales'],
    icon: '🎉',
  },
];

/**
 * Get available commands based on team composition
 */
export function getAvailableCommands(teamSpecs: Specialization[]): QuickCommand[] {
  const available = [...BASE_COMMANDS];

  for (const cmd of SPECIALIZED_COMMANDS) {
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

  const allCommands = [...BASE_COMMANDS, ...SPECIALIZED_COMMANDS];
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
 * Get category display info
 */
export const CATEGORY_INFO: Record<string, { label: string; color: string }> = {
  general: { label: 'General', color: 'text-muted-foreground' },
  research: { label: 'Research', color: 'text-blue-400' },
  analysis: { label: 'Analysis', color: 'text-purple-400' },
  execution: { label: 'Execution', color: 'text-emerald-400' },
  creative: { label: 'Creative', color: 'text-pink-400' },
  strategy: { label: 'Strategy', color: 'text-amber-400' },
  technical: { label: 'Technical', color: 'text-cyan-400' },
};
