/**
 * Encoded Skills Module — Capability definitions and skill metrics
 * Defines what Encoded can do and tracks proficiency
 */

/**
 * Skill categories Encoded is proficient in
 */
export type SkillCategory = 
  | 'typescript'
  | 'react'
  | 'edge_function'
  | 'database'
  | 'testing'
  | 'refactoring'
  | 'documentation';

/**
 * Individual skill definition
 */
export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  proficiency: number; // 0-100
  examples: string[];
  constraints: string[];
}

/**
 * Encoded's core skill registry
 */
export const ENCODED_SKILLS: Skill[] = [
  // TypeScript
  {
    id: 'ts_strict',
    name: 'TypeScript Strict Mode',
    category: 'typescript',
    description: 'Generates fully typed TypeScript code with strict mode compliance',
    proficiency: 95,
    examples: ['interface definitions', 'generic functions', 'type guards'],
    constraints: ['No any types', 'Explicit return types on exports'],
  },
  {
    id: 'ts_patterns',
    name: 'Design Patterns',
    category: 'typescript',
    description: 'Implements common patterns: factory, singleton, observer, etc.',
    proficiency: 88,
    examples: ['Factory functions', 'Event emitters', 'State machines'],
    constraints: ['Single responsibility', 'Keep under 50 lines per function'],
  },
  {
    id: 'ts_advanced_types',
    name: 'Advanced Type System',
    category: 'typescript',
    description: 'Branded types, mapped types, conditional types, template literals',
    proficiency: 82,
    examples: ['Branded IDs', 'Mapped conditional types', 'Template literal types'],
    constraints: ['Derive types from source of truth', 'No manual type duplication'],
  },

  // React
  {
    id: 'react_hooks',
    name: 'React Hooks',
    category: 'react',
    description: 'Creates custom hooks following React best practices',
    proficiency: 92,
    examples: ['useDebounce', 'useLocalStorage', 'useFetch'],
    constraints: ['Rules of hooks', 'Memoization where needed'],
  },
  {
    id: 'react_components',
    name: 'React Components',
    category: 'react',
    description: 'Builds accessible, performant React components',
    proficiency: 90,
    examples: ['Form components', 'Modal dialogs', 'Data tables'],
    constraints: ['Prop validation', 'Event handler naming conventions'],
  },
  {
    id: 'react_performance',
    name: 'React Performance',
    category: 'react',
    description: 'Optimizes renders, memoization, virtualization, and code splitting',
    proficiency: 78,
    examples: ['useMemo/useCallback', 'React.memo', 'Suspense boundaries'],
    constraints: ['Measure before optimizing', 'No premature memoization'],
  },
  {
    id: 'react_state',
    name: 'State Architecture',
    category: 'react',
    description: 'Separates server state (TanStack Query) from client state (Zustand)',
    proficiency: 85,
    examples: ['Query cache', 'Zustand slices', 'Optimistic updates'],
    constraints: ['Never copy server data into useState', 'Proper staleTime'],
  },

  // Edge Functions
  {
    id: 'edge_deno',
    name: 'Deno Edge Functions',
    category: 'edge_function',
    description: 'Creates Supabase/Deno edge functions with proper structure',
    proficiency: 94,
    examples: ['API endpoints', 'Webhooks', 'Scheduled jobs'],
    constraints: ['CORS headers', 'Error handling', 'serve() entrypoint'],
  },
  {
    id: 'edge_auth',
    name: 'Edge Authentication',
    category: 'edge_function',
    description: 'Implements auth patterns in edge functions',
    proficiency: 85,
    examples: ['JWT validation', 'API key checks', 'Role guards'],
    constraints: ['Never expose secrets', 'Validate all inputs'],
  },
  {
    id: 'edge_security',
    name: 'Edge Security Hardening',
    category: 'edge_function',
    description: 'Rate limiting, input validation, safe error responses',
    proficiency: 80,
    examples: ['Zod validation', 'Rate limiting', 'Error sanitization'],
    constraints: ['Never leak stack traces', 'No raw SQL', 'Parameterized queries only'],
  },

  // Database
  {
    id: 'db_queries',
    name: 'Database Queries',
    category: 'database',
    description: 'Writes efficient Supabase/SQL queries',
    proficiency: 87,
    examples: ['Complex joins', 'Aggregations', 'RLS policies'],
    constraints: ['Parameterized queries', 'No SQL injection'],
  },
  {
    id: 'db_migrations',
    name: 'Database Migrations',
    category: 'database',
    description: 'Schema changes with RLS, triggers, and safe rollbacks',
    proficiency: 83,
    examples: ['Table creation', 'RLS policies', 'Trigger functions'],
    constraints: ['Always enable RLS', 'Use validation triggers not CHECK'],
  },

  // Testing
  {
    id: 'test_unit',
    name: 'Unit Testing',
    category: 'testing',
    description: 'Creates unit tests with Vitest/Jest',
    proficiency: 82,
    examples: ['Function tests', 'Mock implementations', 'Assertions'],
    constraints: ['Describe-it pattern', 'Clear test names'],
  },
  {
    id: 'test_integration',
    name: 'Integration Testing',
    category: 'testing',
    description: 'Tests component integration and async flows',
    proficiency: 72,
    examples: ['Hook testing', 'Async assertions', 'Mock Supabase'],
    constraints: ['Test behavior not implementation', 'Isolate side effects'],
  },

  // Refactoring
  {
    id: 'refactor_extract',
    name: 'Extract & Simplify',
    category: 'refactoring',
    description: 'Extracts functions, reduces complexity, improves readability',
    proficiency: 91,
    examples: ['Extract helper', 'Reduce nesting', 'Inline variables'],
    constraints: ['Preserve behavior', 'Keep tests passing'],
  },
  {
    id: 'refactor_decompose',
    name: 'File Decomposition',
    category: 'refactoring',
    description: 'Splits large files into focused modules with barrel exports',
    proficiency: 84,
    examples: ['Type extraction', 'Hook separation', 'Barrel exports'],
    constraints: ['Max 200 lines per file', 'No circular imports'],
  },

  // Documentation
  {
    id: 'doc_jsdoc',
    name: 'JSDoc Comments',
    category: 'documentation',
    description: 'Adds comprehensive JSDoc documentation',
    proficiency: 93,
    examples: ['Function docs', 'Type annotations', 'Examples'],
    constraints: ['Concise descriptions', 'Accurate types'],
  },
];

/**
 * Get skills by category
 */
export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return ENCODED_SKILLS.filter(s => s.category === category);
}

/**
 * Get overall proficiency across all skills
 */
export function getOverallProficiency(): number {
  const total = ENCODED_SKILLS.reduce((sum, s) => sum + s.proficiency, 0);
  return Math.round(total / ENCODED_SKILLS.length);
}

/**
 * Get skills summary for display
 */
export function getSkillsSummary(): {
  total: number;
  byCategory: Record<SkillCategory, { count: number; avgProficiency: number }>;
  overall: number;
  topSkills: Skill[];
} {
  const categories = [...new Set(ENCODED_SKILLS.map(s => s.category))] as SkillCategory[];
  const byCategory = {} as Record<SkillCategory, { count: number; avgProficiency: number }>;
  
  for (const cat of categories) {
    const skills = getSkillsByCategory(cat);
    byCategory[cat] = {
      count: skills.length,
      avgProficiency: Math.round(skills.reduce((s, sk) => s + sk.proficiency, 0) / skills.length),
    };
  }
  
  return {
    total: ENCODED_SKILLS.length,
    byCategory,
    overall: getOverallProficiency(),
    topSkills: [...ENCODED_SKILLS].sort((a, b) => b.proficiency - a.proficiency).slice(0, 5),
  };
}

/**
 * Format skill for display
 */
export function formatSkill(skill: Skill): string {
  const bar = '█'.repeat(Math.floor(skill.proficiency / 10)) + 
              '░'.repeat(10 - Math.floor(skill.proficiency / 10));
  return `${skill.name} [${bar}] ${skill.proficiency}%`;
}

/**
 * Get skill recommendations based on task type
 */
export function getRelevantSkills(taskType: string): Skill[] {
  const keywords: Record<string, SkillCategory[]> = {
    'component': ['react', 'typescript'],
    'hook': ['react', 'typescript'],
    'function': ['typescript', 'edge_function'],
    'api': ['edge_function', 'database'],
    'query': ['database'],
    'test': ['testing'],
    'refactor': ['refactoring', 'typescript'],
    'document': ['documentation'],
  };
  
  const lower = taskType.toLowerCase();
  for (const [key, cats] of Object.entries(keywords)) {
    if (lower.includes(key)) {
      return ENCODED_SKILLS.filter(s => cats.includes(s.category));
    }
  }
  
  return ENCODED_SKILLS.filter(s => s.category === 'typescript');
}
