/**
 * Encoded Skills Module — Capability definitions and skill metrics
 * Defines what ENCODE can do and tracks proficiency
 */

/**
 * Skill categories ENCODE is proficient in
 */
export type SkillCategory = 
  | 'typescript'
  | 'react'
  | 'edge_function'
  | 'database'
  | 'testing'
  | 'refactoring'
  | 'documentation'
  | 'styling'
  | 'substrate'
  | 'security'
  | 'state_management'
  | 'navigation'
  | 'architecture'
  | 'resilience'
  | 'observability'
  | 'data_engineering'
  | 'api_design'
  | 'devops'
  | 'performance';

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
 * ENCODE's core skill registry
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
  {
    id: 'db_rls',
    name: 'Row Level Security',
    category: 'database',
    description: 'Designs RLS policies with security-definer functions to avoid recursion',
    proficiency: 80,
    examples: ['has_role() security definer', 'Tenant isolation policies', 'Read vs write policies'],
    constraints: ['Never store roles on users table', 'Use security definer for role checks', 'Test with anon and authenticated roles'],
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

  // ─── NEW: Styling ──────────────────────────────────────────
  {
    id: 'style_tailwind',
    name: 'Tailwind CSS & Design Tokens',
    category: 'styling',
    description: 'Uses semantic design tokens from index.css and tailwind.config.ts. Never uses hardcoded colors.',
    proficiency: 88,
    examples: ['bg-primary', 'text-muted-foreground', 'hsl(var(--accent))'],
    constraints: ['All colors through semantic tokens', 'HSL values in index.css', 'Dark mode support'],
  },
  {
    id: 'style_shadcn',
    name: 'shadcn/ui Components',
    category: 'styling',
    description: 'Extends shadcn components with proper variants via class-variance-authority',
    proficiency: 85,
    examples: ['Button variants', 'Dialog composition', 'Form field patterns'],
    constraints: ['Use cva for variants', 'Never override shadcn defaults directly', 'Accessible by default'],
  },
  {
    id: 'style_responsive',
    name: 'Responsive Design',
    category: 'styling',
    description: 'Mobile-first responsive layouts with Tailwind breakpoints',
    proficiency: 82,
    examples: ['sm:, md:, lg: breakpoints', 'Grid/flex responsive patterns', 'Container queries'],
    constraints: ['Mobile-first approach', 'Test at 320px, 768px, 1280px'],
  },

  // ─── NEW: Substrate Awareness ──────────────────────────────
  {
    id: 'substrate_navigation',
    name: 'Substrate Navigator',
    category: 'substrate',
    description: 'Uses navigateIntent() and resolveModule() to locate code before modifying it',
    proficiency: 90,
    examples: ['navigateIntent("rate limit BRAIN")', 'resolveAlias("cognition")', 'whereIs("security")'],
    constraints: ['Never guess file paths', 'Always resolve through navigator', 'Check conventions first'],
  },
  {
    id: 'substrate_conventions',
    name: 'Substrate Conventions',
    category: 'substrate',
    description: 'Knows where adapters, handlers, hooks, and hardening files live by convention',
    proficiency: 88,
    examples: ['moduleAdapters/{id}.adapter.ts', 'terminal/{group}-handlers.ts', 'hooks/substrate/use{Module}.ts'],
    constraints: ['Follow naming patterns', 'Check system-manifest.ts for corePath', 'Never create duplicate modules'],
  },
  {
    id: 'substrate_events',
    name: 'Substrate Event System',
    category: 'substrate',
    description: 'Emits proper events using emit/emitStarted/emitSucceeded/emitFailed',
    proficiency: 85,
    examples: ['emit({ module, event_type, outcome, data })', 'emitStarted/emitSucceeded pairs'],
    constraints: ['Always emit on state transitions', 'Include module and event_type', 'Use structured data'],
  },
  {
    id: 'substrate_hardening',
    name: 'Module Hardening',
    category: 'substrate',
    description: 'Implements 25-point hardening checklists per module with codenames',
    proficiency: 80,
    examples: ['Circuit breakers', 'Input validation', 'Timeout guards', 'Correlation IDs'],
    constraints: ['Resilience baseline required', 'No version numbers in output', 'Fail-closed by default'],
  },

  // ─── NEW: Security ─────────────────────────────────────────
  {
    id: 'security_input',
    name: 'Input Validation & Sanitization',
    category: 'security',
    description: 'Validates all inputs with Zod schemas, sanitizes strings, rejects dangerous patterns',
    proficiency: 88,
    examples: ['z.string().email()', 'DOMPurify sanitize', 'Path traversal rejection'],
    constraints: ['Deny by default', 'Validate at boundary', 'Never trust client input'],
  },
  {
    id: 'security_auth',
    name: 'Authentication & Authorization',
    category: 'security',
    description: 'Implements proper auth flows, role checks, and session management',
    proficiency: 82,
    examples: ['JWT validation', 'has_role() security definer', 'Session refresh'],
    constraints: ['Never store roles on profile table', 'Use separate user_roles table', 'Server-side validation only'],
  },
  {
    id: 'security_secrets',
    name: 'Secret Management',
    category: 'security',
    description: 'Handles API keys, secrets, and sensitive data without exposure',
    proficiency: 90,
    examples: ['Edge function env vars', 'Anon key vs service role', 'Secret rotation'],
    constraints: ['Never commit secrets', 'Never expose service role key', 'Use backend secrets for private keys'],
  },

  // ─── NEW: State Management ────────────────────────────────
  {
    id: 'state_zustand',
    name: 'Zustand State Management',
    category: 'state_management',
    description: 'Creates Zustand stores with slices, selectors, and devtools',
    proficiency: 85,
    examples: ['Store slices', 'Computed selectors', 'Persist middleware'],
    constraints: ['Keep stores small and focused', 'Use selectors to prevent re-renders', 'Separate server state from client state'],
  },
  {
    id: 'state_tanstack',
    name: 'TanStack Query Patterns',
    category: 'state_management',
    description: 'Server state management with query keys, stale times, and invalidation',
    proficiency: 87,
    examples: ['useQuery with typed keys', 'Optimistic mutations', 'Prefetching'],
    constraints: ['Structure query keys hierarchically', 'Set appropriate staleTime', 'Invalidate on mutations'],
  },

  // ─── NEW: Navigation Intelligence ────────────────────────
  {
    id: 'nav_module_resolution',
    name: 'Module Resolution',
    category: 'navigation',
    description: 'Resolves natural-language module references to file paths using the navigator',
    proficiency: 92,
    examples: ['resolveModule("brain")', 'resolveAlias("cognition")', 'getModuleTables("defense")'],
    constraints: ['Always verify paths exist', 'Use navigator before file operations', 'Cross-reference with system manifest'],
  },
  {
    id: 'nav_concern_detection',
    name: 'Cross-Cutting Concern Detection',
    category: 'navigation',
    description: 'Detects when an intent touches multiple systems (rate limiting, auth, audit, etc.)',
    proficiency: 88,
    examples: ['detectConcerns("rate limit")', 'getConcernFiles("circuit_breaker")', 'navigateIntent("secure BRAIN")'],
    constraints: ['Check all concern types', 'Include cross-cutting files in patch scope', 'Verify impact chain'],
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
 * Get skill recommendations based on task type — substrate-aware
 */
export function getRelevantSkills(taskType: string): Skill[] {
  const keywords: Record<string, SkillCategory[]> = {
    'component': ['react', 'typescript', 'styling'],
    'hook': ['react', 'typescript', 'state_management'],
    'function': ['typescript', 'edge_function'],
    'api': ['edge_function', 'database', 'security'],
    'query': ['database', 'state_management'],
    'test': ['testing'],
    'refactor': ['refactoring', 'typescript', 'navigation'],
    'document': ['documentation'],
    'style': ['styling', 'react'],
    'tailwind': ['styling'],
    'css': ['styling'],
    'design': ['styling', 'react'],
    'auth': ['security', 'database'],
    'rls': ['database', 'security'],
    'policy': ['database', 'security'],
    'secret': ['security'],
    'rate limit': ['security', 'substrate'],
    'circuit': ['substrate', 'security'],
    'substrate': ['substrate', 'navigation'],
    'module': ['substrate', 'navigation'],
    'navigate': ['navigation', 'substrate'],
    'brain': ['substrate', 'database', 'navigation'],
    'decode': ['substrate', 'navigation'],
    'encode': ['substrate', 'navigation'],
    'defense': ['substrate', 'security', 'navigation'],
    'nexus': ['substrate', 'navigation'],
    'state': ['state_management', 'react'],
    'zustand': ['state_management'],
    'tanstack': ['state_management', 'react'],
    'edge': ['edge_function', 'security'],
    'migration': ['database'],
  };
  
  const lower = taskType.toLowerCase();
  for (const [key, cats] of Object.entries(keywords)) {
    if (lower.includes(key)) {
      return ENCODED_SKILLS.filter(s => cats.includes(s.category));
    }
  }
  
  return ENCODED_SKILLS.filter(s => s.category === 'typescript');
}
