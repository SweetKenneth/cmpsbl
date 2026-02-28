/**
 * #4 — Self-Assessment Prompt Generator
 * Generate structured self-assessment questionnaires that surface known pain points,
 * tech debt admissions, and architectural decisions from the target software.
 */

import type { RepoFingerprint } from './repo-fingerprint';
import type { SchemaMap } from './schema-introspection';

export interface SelfAssessmentPrompt {
  questions: AssessmentQuestion[];
  contextHints: string[];
  suggestedImprovements: SuggestedImprovement[];
  frameworkSpecificChecks: string[];
  totalQuestions: number;
  generatedAt: string;
}

export interface AssessmentQuestion {
  id: string;
  category: 'architecture' | 'security' | 'performance' | 'maintainability' | 'reliability' | 'scalability';
  priority: 'critical' | 'high' | 'medium' | 'low';
  question: string;
  context: string;
  expectedAnswer: string | null;
  automatable: boolean;
}

export interface SuggestedImprovement {
  id: string;
  category: string;
  title: string;
  description: string;
  effort: 'trivial' | 'small' | 'medium' | 'large' | 'major';
  impact: 'low' | 'medium' | 'high' | 'critical';
  source: 'fingerprint' | 'schema' | 'heuristic';
}

const BASE_QUESTIONS: Omit<AssessmentQuestion, 'id'>[] = [
  // Security
  { category: 'security', priority: 'critical', question: 'Are all database tables protected with Row-Level Security policies?', context: 'Missing RLS allows any authenticated user to read/write all data', expectedAnswer: null, automatable: true },
  { category: 'security', priority: 'critical', question: 'Are API keys and secrets stored in environment variables, never in source code?', context: 'Hardcoded secrets in git history are permanently exposed', expectedAnswer: null, automatable: true },
  { category: 'security', priority: 'high', question: 'Is input validation applied at both client and server boundaries?', context: 'Client-only validation can be bypassed with direct API calls', expectedAnswer: null, automatable: false },
  { category: 'security', priority: 'high', question: 'Are authentication tokens rotated and do they expire within a reasonable timeframe?', context: 'Long-lived tokens increase the window of exploitation', expectedAnswer: null, automatable: false },
  { category: 'security', priority: 'high', question: 'Is rate limiting applied to authentication, payment, and mutation endpoints?', context: 'Missing rate limits enable brute-force and abuse', expectedAnswer: null, automatable: true },
  
  // Architecture
  { category: 'architecture', priority: 'high', question: 'Is there a clear separation between business logic and presentation layers?', context: 'Mixed concerns increase coupling and make testing harder', expectedAnswer: null, automatable: false },
  { category: 'architecture', priority: 'medium', question: 'Are error boundaries implemented to prevent cascading failures?', context: 'Unhandled errors in one component should not crash the entire app', expectedAnswer: null, automatable: true },
  { category: 'architecture', priority: 'medium', question: 'Is there a consistent data fetching strategy (hooks, services, or state management)?', context: 'Inconsistent patterns increase cognitive load and bug surface', expectedAnswer: null, automatable: false },

  // Performance
  { category: 'performance', priority: 'high', question: 'Are database queries optimized with proper indexes on frequently queried columns?', context: 'Missing indexes on large tables cause exponential slowdowns', expectedAnswer: null, automatable: true },
  { category: 'performance', priority: 'medium', question: 'Is code splitting or lazy loading implemented for large page bundles?', context: 'Loading everything upfront hurts Time to Interactive', expectedAnswer: null, automatable: true },
  { category: 'performance', priority: 'medium', question: 'Are images optimized with proper formats (WebP/AVIF), lazy loading, and responsive sizes?', context: 'Unoptimized images are the #1 cause of slow page loads', expectedAnswer: null, automatable: true },

  // Maintainability
  { category: 'maintainability', priority: 'medium', question: 'Is there consistent error handling with structured error types?', context: 'Inconsistent error handling makes debugging and monitoring harder', expectedAnswer: null, automatable: false },
  { category: 'maintainability', priority: 'medium', question: 'Are there dead imports, unused variables, or unreachable code paths?', context: 'Dead code increases bundle size and cognitive overhead', expectedAnswer: null, automatable: true },
  { category: 'maintainability', priority: 'low', question: 'Is there a consistent naming convention across files, functions, and variables?', context: 'Inconsistent naming increases onboarding time and bug risk', expectedAnswer: null, automatable: true },

  // Reliability
  { category: 'reliability', priority: 'high', question: 'Are external API calls wrapped with timeout, retry, and fallback logic?', context: 'Unprotected external calls can cascade failures through the system', expectedAnswer: null, automatable: true },
  { category: 'reliability', priority: 'medium', question: 'Is there a health check or readiness endpoint for deployment verification?', context: 'Without health checks, broken deployments go undetected', expectedAnswer: null, automatable: true },

  // Scalability
  { category: 'scalability', priority: 'medium', question: 'Are database queries paginated to prevent unbounded result sets?', context: 'Fetching all rows crashes under growth — use cursor or offset pagination', expectedAnswer: null, automatable: true },
  { category: 'scalability', priority: 'medium', question: 'Is there a caching strategy for frequently accessed, rarely changing data?', context: 'Repeated identical queries waste compute and increase latency', expectedAnswer: null, automatable: false },
];

/**
 * Generate a tailored self-assessment based on fingerprint and schema analysis
 */
export function generateSelfAssessment(
  fingerprint: RepoFingerprint | null,
  schema: SchemaMap | null,
): SelfAssessmentPrompt {
  const questions: AssessmentQuestion[] = BASE_QUESTIONS.map((q, i) => ({
    ...q,
    id: `sa-${q.category}-${i}`,
  }));

  const contextHints: string[] = [];
  const suggestedImprovements: SuggestedImprovement[] = [];
  const frameworkSpecificChecks: string[] = [];

  // Generate framework-specific questions
  if (fingerprint?.framework.detected) {
    const fw = fingerprint.framework.name;
    
    if (fw === 'Next.js') {
      frameworkSpecificChecks.push(
        'Are API routes using proper middleware for auth validation?',
        'Is ISR/SSG used for static content to reduce server load?',
        'Are server actions validated with zod or similar schema validation?',
        'Is the middleware.ts properly protecting authenticated routes?',
      );
    } else if (fw === 'React') {
      frameworkSpecificChecks.push(
        'Are expensive computations memoized with useMemo/useCallback?',
        'Is React.lazy used for route-level code splitting?',
        'Are effect dependencies correctly specified to prevent infinite loops?',
      );
    } else if (fw === 'Express' || fw === 'Fastify' || fw === 'NestJS') {
      frameworkSpecificChecks.push(
        'Is helmet or equivalent security middleware applied?',
        'Are request bodies size-limited to prevent payload attacks?',
        'Is CORS configured restrictively, not with wildcard origins?',
      );
    }

    contextHints.push(`Detected framework: ${fw} (${fingerprint.framework.type})`);
  }

  // Generate schema-specific improvements
  if (schema) {
    if (schema.securityPosture.tablesWithoutRLS > 0) {
      suggestedImprovements.push({
        id: 'si-rls-missing',
        category: 'security',
        title: 'Enable RLS on unprotected tables',
        description: `${schema.securityPosture.tablesWithoutRLS} tables lack Row-Level Security policies`,
        effort: 'small',
        impact: 'critical',
        source: 'schema',
      });
    }

    if (schema.securityPosture.sensitiveColumnsExposed > 0) {
      suggestedImprovements.push({
        id: 'si-sensitive-exposed',
        category: 'security',
        title: 'Protect sensitive columns',
        description: `${schema.securityPosture.sensitiveColumnsExposed} sensitive columns (passwords, tokens, PII) are in tables without RLS`,
        effort: 'medium',
        impact: 'critical',
        source: 'schema',
      });
    }

    const tablesWithoutTimestamps = schema.tables.filter(t => !t.hasTimestamps);
    if (tablesWithoutTimestamps.length > 0) {
      suggestedImprovements.push({
        id: 'si-timestamps',
        category: 'maintainability',
        title: 'Add created_at/updated_at timestamps',
        description: `${tablesWithoutTimestamps.length} tables lack audit timestamps`,
        effort: 'trivial',
        impact: 'medium',
        source: 'schema',
      });
    }

    const tablesWithoutPK = schema.tables.filter(t => !t.hasPrimaryKey);
    if (tablesWithoutPK.length > 0) {
      suggestedImprovements.push({
        id: 'si-primary-keys',
        category: 'reliability',
        title: 'Add primary keys to all tables',
        description: `${tablesWithoutPK.length} tables lack primary keys, preventing reliable referencing`,
        effort: 'small',
        impact: 'high',
        source: 'schema',
      });
    }

    contextHints.push(
      `Database: ${schema.totalTables} tables, ${schema.totalColumns} columns, ${schema.totalRelationships} relationships`,
      `Security grade: ${schema.securityPosture.grade}`,
    );
  }

  // Fingerprint-derived improvements
  if (fingerprint) {
    if (!fingerprint.testFramework.detected) {
      suggestedImprovements.push({
        id: 'si-no-tests',
        category: 'reliability',
        title: 'Add automated testing',
        description: 'No test framework detected — critical paths are unverified',
        effort: 'large',
        impact: 'high',
        source: 'fingerprint',
      });
    }

    if (!fingerprint.cicd.detected) {
      suggestedImprovements.push({
        id: 'si-no-cicd',
        category: 'reliability',
        title: 'Add CI/CD pipeline',
        description: 'No CI/CD configuration detected — deployments are manual and error-prone',
        effort: 'medium',
        impact: 'high',
        source: 'fingerprint',
      });
    }

    if (!fingerprint.containerization.detected && fingerprint.framework.type === 'backend') {
      suggestedImprovements.push({
        id: 'si-no-container',
        category: 'scalability',
        title: 'Containerize the application',
        description: 'Backend without containerization may have environment inconsistencies',
        effort: 'medium',
        impact: 'medium',
        source: 'fingerprint',
      });
    }
  }

  // Add framework-specific checks as questions
  for (const check of frameworkSpecificChecks) {
    questions.push({
      id: `sa-fw-${questions.length}`,
      category: 'architecture',
      priority: 'medium',
      question: check,
      context: `Framework-specific check for ${fingerprint?.framework.name}`,
      expectedAnswer: null,
      automatable: false,
    });
  }

  return {
    questions,
    contextHints,
    suggestedImprovements,
    frameworkSpecificChecks,
    totalQuestions: questions.length,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Build a structured LLM prompt for software self-improvement
 */
export function buildSelfImprovementPrompt(
  fingerprint: RepoFingerprint | null,
  schema: SchemaMap | null,
  assessment: SelfAssessmentPrompt,
): string {
  const sections: string[] = [];

  sections.push('# Software Self-Assessment Report\n');
  sections.push('Analyze your own codebase and suggest improvements for the following areas:\n');

  // Context
  if (assessment.contextHints.length > 0) {
    sections.push('## Detected Context');
    for (const hint of assessment.contextHints) {
      sections.push(`- ${hint}`);
    }
    sections.push('');
  }

  // Automated findings
  if (assessment.suggestedImprovements.length > 0) {
    sections.push('## Pre-Identified Issues');
    for (const improvement of assessment.suggestedImprovements) {
      sections.push(`- **[${improvement.impact.toUpperCase()}]** ${improvement.title}: ${improvement.description}`);
    }
    sections.push('');
  }

  // Questions grouped by category
  const categories = [...new Set(assessment.questions.map(q => q.category))];
  for (const category of categories) {
    const catQuestions = assessment.questions.filter(q => q.category === category);
    sections.push(`## ${category.charAt(0).toUpperCase() + category.slice(1)}`);
    for (const q of catQuestions) {
      sections.push(`- [${q.priority}] ${q.question}`);
      if (q.context) sections.push(`  _Context: ${q.context}_`);
    }
    sections.push('');
  }

  sections.push('## Instructions');
  sections.push('For each question, respond with:');
  sections.push('1. Current status (pass/fail/partial)');
  sections.push('2. Evidence from the codebase');
  sections.push('3. Specific remediation steps if failing');
  sections.push('4. Priority ranking (1-10)');

  return sections.join('\n');
}
