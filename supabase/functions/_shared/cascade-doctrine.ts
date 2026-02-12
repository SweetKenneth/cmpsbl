/**
 * SUBSTRATE TECHNICAL DOCTRINE v2.0.0
 * TECHNICAL MASTERY CONFIGURATION
 * 
 * All modules focus on becoming better at their individual jobs.
 * BRAIN + ENCODED get 80% of learning budget (coding/architecture mastery).
 * Other modules study job-specific improvements.
 */

// ═══════════════════════════════════════════════════════════════════════════
// ROLE & IDENTITY
// ═══════════════════════════════════════════════════════════════════════════

export const DOCTRINE = {
  name: 'Substrate',
  alias: 'Technical Learner',
  version: '2.0.0',
  mode: 'TECHNICAL_MASTERY',
  
  identity: [
    'module-specific technical improvement',
    'coding excellence',
    'architecture mastery',
    'job-specific skill building'
  ],

  primaryObjectives: [
    'master TypeScript and React patterns',
    'improve system architecture',
    'strengthen module capabilities',
    'accelerate code generation quality',
    'deepen security posture',
    'optimize performance and reliability',
    'enhance observability and tracing',
    'build autonomous problem-solving'
  ],

  extractionSchema: [
    'technique',
    'implementation_pattern',
    'best_practice',
    'anti_pattern',
    'performance_impact',
    'security_consideration',
    'testing_strategy',
    'real_world_application'
  ],

  alignment: {
    increases: [
      'code quality',
      'system reliability',
      'module competency',
      'architectural clarity',
      'security depth'
    ],
    reduces: [
      'technical debt',
      'failure rates',
      'response latency',
      'false positives',
      'cognitive overhead'
    ]
  }
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// MODULE-SPECIFIC LEARNING QUERIES
// Each module has its own curriculum focused on becoming better at its job
// ═══════════════════════════════════════════════════════════════════════════

export const MODULE_QUERIES: Record<string, string[]> = {
  // BRAIN + ENCODED — 80% allocation (coding/architecture)
  brain: [
    'What are the most effective patterns for building cognitive memory systems in TypeScript? Cover indexing, retrieval, and decay strategies.',
    'How do production AI orchestration systems handle multi-provider routing with failover? Show TypeScript implementation patterns.',
    'What are best practices for implementing spaced repetition algorithms in code for continuous learning systems?',
    'How do you build a robust knowledge graph with typed edges and weighted nodes in TypeScript?',
    'What patterns do senior engineers use for building self-healing distributed systems?',
    'How do you implement efficient semantic search without vector databases using TF-IDF and n-gram scoring in TypeScript?',
    'What are production patterns for building event-driven architectures with typed event buses?',
    'How do you design a modular plugin architecture in TypeScript that supports hot-loading and versioned contracts?',
    'What are the best approaches for building autonomous code analysis and refactoring tools?',
    'How do you implement circuit breaker patterns with exponential backoff and jitter in production TypeScript?',
  ],
  
  encoded: [
    'What TypeScript patterns do senior engineers use for type-safe API contracts? Cover branded types, discriminated unions, and Zod schemas.',
    'How do you build production React components with proper hook separation, error boundaries, and optimistic updates?',
    'What are expert patterns for writing edge functions in Deno/TypeScript with proper error handling and rate limiting?',
    'How do senior developers implement database migration strategies with rollback safety for PostgreSQL?',
    'What are the most important code review patterns for catching security vulnerabilities in TypeScript?',
    'How do you write maintainable React state management using Zustand with typed slices and middleware?',
    'What patterns do expert developers use for building composable UI component libraries with CVA and Tailwind?',
    'How do you implement proper RLS policies in PostgreSQL for multi-tenant SaaS applications?',
    'What are production patterns for implementing real-time data sync with conflict resolution?',
    'How do senior engineers structure large TypeScript monorepos for maximum maintainability?',
  ],

  // OTHER MODULES — 20% allocation (job-specific mastery)
  defense: [
    'What are the latest techniques for detecting automated bot traffic vs legitimate users? Cover fingerprinting, behavioral analysis, and rate limiting.',
    'How do production WAFs implement adaptive threat scoring with machine learning?',
    'What are best practices for IP reputation systems that minimize false positives while catching real threats?',
    'How do you implement honeypot fields and invisible CAPTCHA techniques to catch sophisticated bots?',
    'What are the most effective DDoS mitigation strategies for edge function architectures?',
  ],
  
  nexus: [
    'How do production AI routing systems implement cost optimization across multiple LLM providers?',
    'What are the best strategies for implementing fallback chains with provider health scoring?',
    'How do you build a token budget optimizer that maximizes output quality while minimizing cost?',
    'What patterns do production systems use for caching AI responses to reduce redundant API calls?',
    'How do you implement quality scoring for AI outputs to automatically select the best provider per task type?',
  ],
  
  vision: [
    'What are the most effective observability patterns for distributed edge function architectures?',
    'How do you build real-time health dashboards that correlate metrics across multiple subsystems?',
    'What are best practices for implementing distributed tracing across microservices with minimal overhead?',
    'How do production monitoring systems implement anomaly detection without ML models?',
    'What are the most useful SLO/SLI patterns for cognitive AI systems?',
  ],
  
  access: [
    'How do production API key management systems implement secure key rotation and scoping?',
    'What are best practices for implementing tiered rate limiting with burst allowances?',
    'How do you build a usage metering system that accurately tracks per-customer API consumption?',
    'What patterns do production systems use for implementing OAuth2 with PKCE for developer APIs?',
    'How do you implement quota enforcement that gracefully degrades rather than hard-blocking?',
  ],
  
  system: [
    'What are the most effective automated self-healing patterns for production distributed systems?',
    'How do you implement zero-downtime database migrations with automatic rollback triggers?',
    'What are best practices for building backup/restore systems with integrity verification?',
    'How do production systems implement configuration hot-reload without service restarts?',
    'What are the most important diagnostic checks for identifying performance bottlenecks in PostgreSQL?',
  ],
  
  dream: [
    'How do production AI systems implement creative synthesis by combining insights from multiple knowledge domains?',
    'What are effective patterns for building idea generation systems that produce actionable proposals?',
    'How do you implement quality scoring for generated content to filter noise from signal?',
    'What patterns do recommendation engines use for surfacing non-obvious connections between data points?',
    'How do you build a mutation testing framework that generates useful code improvement suggestions?',
  ],
  
  cortex: [
    'How do production orchestration systems coordinate multi-step autonomous workflows with rollback?',
    'What are the best patterns for implementing proposal-review-apply pipelines with human-in-the-loop?',
    'How do you build an intelligent task scheduler that prioritizes based on system state and resource availability?',
    'What patterns do production systems use for implementing A/B testing of system configurations?',
    'How do you implement safe autonomous code modification with dry-run validation?',
  ],
  
  ripple: [
    'How do production event systems implement reliable event delivery with at-least-once guarantees?',
    'What are best practices for building cross-module event buses with typed contracts and versioning?',
    'How do you implement event replay and audit logging for distributed system debugging?',
    'What patterns do production systems use for event-driven saga orchestration?',
    'How do you build efficient event filtering and routing without creating performance bottlenecks?',
  ],
  
  inclusive: [
    'What are the most impactful automated accessibility checks beyond basic WCAG compliance?',
    'How do production accessibility scanners detect keyboard navigation issues programmatically?',
    'What are best practices for implementing ARIA live regions for dynamic content updates?',
    'How do you build automated color contrast analyzers that work with dynamic theming systems?',
    'What patterns do accessibility-first design systems use for ensuring screen reader compatibility?',
  ],
  
  modernizer: [
    'How do production code modernization tools identify and safely refactor legacy patterns?',
    'What are the most effective strategies for automated dependency upgrade with breaking change detection?',
    'How do you build automated code smell detectors that suggest specific refactoring strategies?',
    'What patterns do production systems use for safely migrating between framework versions?',
    'How do you implement automated performance regression detection in CI/CD pipelines?',
  ],
  
  decode: [
    'How do production NLU systems implement intent classification with confidence scoring?',
    'What are best practices for building conversational AI that maintains context across long sessions?',
    'How do you implement personality-consistent responses while adapting tone to user context?',
    'What patterns do production chatbots use for graceful handling of out-of-scope queries?',
    'How do you build an effective summarization pipeline that distills complex technical data for non-technical users?',
  ],
  
  integration: [
    'How do production integration platforms implement webhook reliability with retry and dead-letter queues?',
    'What are best practices for building API adapters that handle schema evolution gracefully?',
    'How do you implement secure credential management for third-party service connections?',
    'What patterns do production systems use for implementing data transformation pipelines between services?',
    'How do you build health monitoring for external service dependencies with automatic failover?',
  ],
  
  core: [
    'How do production platforms implement feature flag systems with gradual rollout?',
    'What are best practices for building extensible module registration and discovery systems?',
    'How do you implement graceful degradation when core infrastructure components fail?',
    'What patterns do production systems use for version-aware API routing?',
    'How do you build a robust configuration management system with environment-specific overrides?',
  ],
};

// Flat list of all modules for iteration
export const ALL_MODULES = Object.keys(MODULE_QUERIES);

// Modules that get priority allocation (80% of budget)
export const PRIORITY_MODULES = ['brain', 'encoded'];

// Get a learning query for a specific module
export function getModuleQuery(module: string, index: number): string {
  const queries = MODULE_QUERIES[module] || MODULE_QUERIES.brain;
  return queries[index % queries.length];
}

// Get a random query for a module
export function getRandomModuleQuery(module: string): string {
  const queries = MODULE_QUERIES[module] || MODULE_QUERIES.brain;
  return queries[Math.floor(Math.random() * queries.length)];
}

// Build a module-specific learning prompt
export function buildModuleLearningPrompt(module: string, query: string): string {
  const moduleLabel = module.toUpperCase();
  return `As the ${moduleLabel} module of an autonomous AI substrate, research and provide expert-level insights:

${query}

Provide:
1. TECHNIQUE: The specific technique or pattern being discussed
2. IMPLEMENTATION: Concrete TypeScript/code implementation details
3. BEST PRACTICE: What experts recommend and why
4. ANTI-PATTERN: What to avoid and why
5. REAL-WORLD APPLICATION: How this applies to a production cognitive AI system

Be specific, code-focused, and actionable. No theory without implementation.`;
}

// Build system prompt for module learning
export function buildModuleSystemPrompt(module: string): string {
  return `You are the ${module.toUpperCase()} module of an autonomous cognitive AI substrate. You are studying how to become better at your job. Your focus is on practical, implementable techniques that directly improve your capabilities. Provide code examples in TypeScript when relevant. Be concise, expert-level, and actionable.`;
}

// Check if content should be filtered
export function isBlacklisted(content: string): boolean {
  const lower = content.toLowerCase();
  const blacklist = [
    'hot take', 'unpopular opinion', '10x', 'hustle', 'grind',
    'crushing it', 'game changer', 'thought leader', 'crypto', 'web3', 'nft',
    'acqui-hire', 'M&A teardown', 'investor memo', 'valuation model',
    'exit strategy', 'IPO roadshow', 'acquisition thesis'
  ];
  return blacklist.some(term => lower.includes(term.toLowerCase()));
}

// Legacy exports for backward compatibility
export const DOCTRINE_QUERIES = [
  ...MODULE_QUERIES.brain,
  ...MODULE_QUERIES.encoded,
];

export const WHITELIST_SOURCES = {};
export const BLACKLIST_PATTERNS: string[] = [];

export function buildExtractionPrompt(content: string, sourceType: string): string {
  return buildModuleLearningPrompt('brain', content);
}

export function getRandomDoctrineQuery(): string {
  return getRandomModuleQuery(Math.random() > 0.5 ? 'brain' : 'encoded');
}
