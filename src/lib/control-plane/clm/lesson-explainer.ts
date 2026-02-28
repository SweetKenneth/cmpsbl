/**
 * Lesson Explainer — Plain-language descriptions for evolution topics
 * 
 * Every evolution proposal includes a `lesson_explainer` block so that
 * vibe coders (and any consuming agent) understand exactly what a topic
 * means, why it matters, what changes, and a real-world analogy.
 */

export interface LessonExplainer {
  /** What this lesson teaches — one sentence, no jargon */
  what_it_is: string;
  /** What breaks or degrades without it */
  why_it_matters: string;
  /** Concrete changes the agent would make */
  what_changes: string[];
  /** Non-technical analogy */
  real_world_analogy: string;
  /** Which tier this belongs to and what tier means */
  tier: {
    level: number;
    name: string;
    description: string;
  };
  /** What comes after this lesson */
  whats_next: string;
}

const TIER_NAMES: Record<number, { name: string; description: string }> = {
  1: { name: 'Foundation', description: 'Harden what exists — make your system crash-proof and resilient before adding new things' },
  2: { name: 'Intelligence', description: 'Make the system smarter — better observability, governance, and cost awareness' },
  3: { name: 'Capability', description: 'Add new features — the system gains new abilities like prediction, learning, and integrations' },
  4: { name: 'Autonomy', description: 'Self-operating system — it can optimize, heal, and evolve with minimal human intervention' },
};

const EXPLAINERS: Record<string, Omit<LessonExplainer, 'tier' | 'whats_next'>> = {
  'Stability Patterns': {
    what_it_is: 'Teaches your system 8 ways to handle failure gracefully instead of crashing — things like automatically retrying failed operations, isolating broken parts, and recovering without human intervention.',
    why_it_matters: 'Without stability patterns, a single API timeout or database hiccup can cascade into a full system crash. Your users see white screens, lost data, and broken experiences.',
    what_changes: [
      'Wraps critical operations with circuit breakers that auto-recover',
      'Adds retry logic with backoff so transient failures resolve themselves',
      'Isolates modules so one failure doesn\'t take down everything',
      'Adds timeout guards to prevent hung operations from blocking the system',
    ],
    real_world_analogy: 'Like installing circuit breakers in your house — when one room shorts out, the whole house doesn\'t go dark. The breaker trips, protects everything else, and you can reset it.',
  },
  'Performance Optimization': {
    what_it_is: 'Speeds up your system by caching frequently-used data, loading things only when needed, and reusing expensive resources instead of creating them fresh every time.',
    why_it_matters: 'Without optimization, every page load queries the database fresh, every API call waits for a cold start, and your system gets slower as it grows.',
    what_changes: [
      'Adds intelligent caching with automatic expiration',
      'Implements lazy loading for heavy components',
      'Pools database connections and API clients for reuse',
      'Reduces redundant network calls with request deduplication',
    ],
    real_world_analogy: 'Like a restaurant kitchen that preps common ingredients in advance instead of starting from scratch for every order.',
  },
  'Reliability Engineering': {
    what_it_is: 'Ensures your system keeps working even when parts of it fail — through redundancy, automatic failover, and data consistency guarantees.',
    why_it_matters: 'Without reliability engineering, you\'re one server error away from data loss or extended downtime with no recovery path.',
    what_changes: [
      'Adds redundancy for critical data paths',
      'Implements automatic failover between providers',
      'Ensures data consistency across operations',
      'Creates health check endpoints for monitoring',
    ],
    real_world_analogy: 'Like a hospital having backup generators — when the power grid fails, critical systems stay running because there\'s always a Plan B.',
  },
  'Security Hardening': {
    what_it_is: 'Strengthens your system\'s defenses by assuming nothing is trusted, layering security controls, and proactively modeling how attackers would try to break in.',
    why_it_matters: 'Without hardening, a single vulnerability in one layer exposes everything — user data, API keys, and system internals.',
    what_changes: [
      'Enforces zero-trust principles across module boundaries',
      'Adds defense-in-depth with multiple security layers',
      'Implements threat modeling for known attack patterns',
      'Hardens input validation and output sanitization',
    ],
    real_world_analogy: 'Like a bank vault — you don\'t just lock the front door, you also have cameras, guards, time-locked doors, and alarms at every level.',
  },
  'Resilience Architecture': {
    what_it_is: 'Makes your system self-healing — it can detect when something breaks and fix it automatically, isolate damage, and even test its own resilience.',
    why_it_matters: 'Without self-healing, every failure requires a human to notice, diagnose, and fix it — which means downtime until someone wakes up.',
    what_changes: [
      'Adds self-healing recovery loops for common failure modes',
      'Implements bulkhead isolation between critical services',
      'Creates chaos testing harnesses to verify resilience',
      'Auto-scales recovery based on failure severity',
    ],
    real_world_analogy: 'Like the human immune system — it detects infections automatically, isolates them, fights them off, and remembers the threat for next time.',
  },
  'Governance Patterns': {
    what_it_is: 'Adds automated policy enforcement, audit trails, and compliance checks so your system follows the rules even when no one is watching.',
    why_it_matters: 'Without governance, there\'s no record of what changed, who changed it, or whether changes followed proper procedures — a compliance and debugging nightmare.',
    what_changes: [
      'Automates policy enforcement for data access and mutations',
      'Creates immutable audit trails for all system operations',
      'Adds compliance validation checkpoints',
      'Implements role-based access controls at the substrate level',
    ],
    real_world_analogy: 'Like corporate accounting rules — every transaction must be recorded, approved, and auditable, not just for legality but so you can trace any problem back to its source.',
  },
  'Observability Excellence': {
    what_it_is: 'Gives you deep visibility into what your system is actually doing — tracing requests across modules, correlating metrics, and alerting on anomalies before users notice.',
    why_it_matters: 'Without observability, debugging production issues is guesswork. You can\'t fix what you can\'t see.',
    what_changes: [
      'Adds distributed tracing across module boundaries',
      'Implements metric correlation to detect cascading failures',
      'Tunes alerting to reduce noise and catch real issues',
      'Creates dashboards for real-time system health visibility',
    ],
    real_world_analogy: 'Like a car\'s dashboard — speed, fuel, temperature, check engine light. Without it, you\'re driving blind until something breaks.',
  },
  'Cost Efficiency': {
    what_it_is: 'Optimizes how your system spends resources — API calls, compute time, storage — so you get more value per dollar without sacrificing performance.',
    why_it_matters: 'Without cost awareness, AI API calls, database queries, and compute can spiral out of control as usage grows.',
    what_changes: [
      'Implements cost-aware routing for AI model selection',
      'Adds resource budgets with automatic throttling',
      'Reduces waste by identifying and eliminating redundant operations',
      'Creates cost dashboards showing spend per module',
    ],
    real_world_analogy: 'Like switching from leaving all the lights on 24/7 to smart sensors that turn things on only when needed — same comfort, fraction of the cost.',
  },
  'Adaptive Learning': {
    what_it_is: 'Your system starts learning from how people actually use it and auto-tunes its own settings — cache sizes, rate limits, model selection — based on real patterns.',
    why_it_matters: 'Without adaptive learning, every threshold and configuration is static. As usage patterns change, the system becomes increasingly mistuned.',
    what_changes: [
      'Analyzes usage patterns to identify optimization opportunities',
      'Auto-adjusts cache TTLs based on access frequency',
      'Tunes rate limits based on actual traffic patterns',
      'Adapts AI model selection based on task success rates',
    ],
    real_world_analogy: 'Like a smart thermostat that learns your schedule and adjusts the temperature automatically — no more manually setting it every day.',
  },
  'Predictive Analytics': {
    what_it_is: 'Your system can forecast problems before they happen — predicting traffic spikes, resource exhaustion, and failure patterns so you can act proactively.',
    why_it_matters: 'Without prediction, you\'re always reacting to problems after they\'ve already impacted users.',
    what_changes: [
      'Adds trend analysis for key system metrics',
      'Implements early warning signals for capacity limits',
      'Creates forecast models for traffic and resource usage',
      'Enables proactive scaling before demand spikes hit',
    ],
    real_world_analogy: 'Like a weather forecast for your system — you don\'t wait for the storm to hit, you see it coming and prepare.',
  },
  'Cross-Module Orchestration': {
    what_it_is: 'Modules start coordinating with each other autonomously to handle complex multi-step workflows — like a scan triggering analysis, which triggers recommendations, which triggers notifications.',
    why_it_matters: 'Without orchestration, complex workflows require manual wiring and break when any step fails, with no automatic recovery.',
    what_changes: [
      'Implements saga patterns for multi-step operations',
      'Adds automatic rollback when workflow steps fail',
      'Creates event-driven coordination between modules',
      'Enables parallel execution where steps are independent',
    ],
    real_world_analogy: 'Like an assembly line where each station knows what to do, when to do it, and how to handle problems without stopping the whole factory.',
  },
  'External Integration Patterns': {
    what_it_is: 'Safely connect your system to third-party APIs, webhooks, and data sources with proper error handling, rate limiting, and security.',
    why_it_matters: 'Without integration patterns, every external connection is a liability — one API outage can crash your system, and one leaked key can compromise everything.',
    what_changes: [
      'Adds standardized integration adapters with circuit breakers',
      'Implements webhook validation and replay protection',
      'Creates credential vaulting for third-party API keys',
      'Adds health monitoring for external dependencies',
    ],
    real_world_analogy: 'Like a building\'s utility connections — water, power, internet all come from outside, but with shutoff valves, surge protectors, and backup plans for each one.',
  },
  'Self-Optimization Loops': {
    what_it_is: 'Your system continuously measures its own performance and makes tuning adjustments automatically — no human needed for routine optimization.',
    why_it_matters: 'Without self-optimization, performance slowly degrades as data grows, usage changes, and configurations drift from optimal values.',
    what_changes: [
      'Implements continuous performance profiling',
      'Adds automatic index and query optimization suggestions',
      'Creates feedback loops that measure optimization impact',
      'Enables gradual rollout of optimizations with automatic rollback',
    ],
    real_world_analogy: 'Like a self-tuning piano — it continuously monitors its own sound and makes micro-adjustments to stay in perfect tune.',
  },
  'Autonomous Incident Response': {
    what_it_is: 'Your system can detect, diagnose, and resolve common incidents on its own — from restarting failed services to rolling back bad deployments.',
    why_it_matters: 'Without autonomous response, every incident requires a human to wake up, log in, diagnose, and fix — which means extended downtime for every issue.',
    what_changes: [
      'Adds runbook automation for common failure scenarios',
      'Implements automatic rollback on health degradation',
      'Creates escalation policies that try self-healing before alerting humans',
      'Adds post-incident analysis and learning',
    ],
    real_world_analogy: 'Like a self-driving car that can handle a flat tire on its own — pull over, swap to the spare, and keep going, only calling you if it\'s something it truly can\'t handle.',
  },
  'Evolutionary Architecture': {
    what_it_is: 'The system can propose and safely apply its own structural improvements — refactoring, optimization, and capability additions — with full governance and rollback.',
    why_it_matters: 'This is the end goal: a system that doesn\'t just run reliably but actively improves itself over time, compounding its own capabilities.',
    what_changes: [
      'Enables system-proposed architectural improvements',
      'Adds fitness functions that measure architectural health',
      'Creates safe mutation pipelines with shadow testing',
      'Implements evolutionary selection of best-performing configurations',
    ],
    real_world_analogy: 'Like biological evolution — the system creates variations, tests them against reality, keeps what works, and discards what doesn\'t. But faster and governed.',
  },
};

// Topic -> tier mapping from GLOBAL_TOPICS
const TOPIC_TIERS: Record<string, number> = {
  'Stability Patterns': 1,
  'Performance Optimization': 1,
  'Reliability Engineering': 1,
  'Security Hardening': 1,
  'Resilience Architecture': 2,
  'Governance Patterns': 2,
  'Observability Excellence': 2,
  'Cost Efficiency': 2,
  'Adaptive Learning': 3,
  'Predictive Analytics': 3,
  'Cross-Module Orchestration': 3,
  'External Integration Patterns': 3,
  'Self-Optimization Loops': 4,
  'Autonomous Incident Response': 4,
  'Evolutionary Architecture': 4,
};

const TIER_PROGRESSION: string[] = [
  'Stability Patterns', 'Performance Optimization', 'Reliability Engineering', 'Security Hardening',
  'Resilience Architecture', 'Governance Patterns', 'Observability Excellence', 'Cost Efficiency',
  'Adaptive Learning', 'Predictive Analytics', 'Cross-Module Orchestration', 'External Integration Patterns',
  'Self-Optimization Loops', 'Autonomous Incident Response', 'Evolutionary Architecture',
];

/**
 * Get a full lesson explainer for any evolution topic.
 * Falls back to a generic explainer for unknown topics.
 */
export function getLessonExplainer(topicTitle: string): LessonExplainer {
  const tierLevel = TOPIC_TIERS[topicTitle] ?? 1;
  const tierInfo = TIER_NAMES[tierLevel] ?? TIER_NAMES[1];

  const currentIndex = TIER_PROGRESSION.indexOf(topicTitle);
  const nextTopic = currentIndex >= 0 && currentIndex < TIER_PROGRESSION.length - 1
    ? TIER_PROGRESSION[currentIndex + 1]
    : null;
  
  const nextTier = nextTopic ? (TOPIC_TIERS[nextTopic] ?? tierLevel) : tierLevel;
  const tierChange = nextTier > tierLevel;

  const whatsNext = nextTopic
    ? tierChange
      ? `After mastering this, you advance to Tier ${nextTier} (${TIER_NAMES[nextTier]?.name ?? 'Advanced'}) starting with "${nextTopic}" — where the system starts gaining new capabilities beyond hardening.`
      : `Next up: "${nextTopic}" — continuing to strengthen your system's ${tierInfo.name.toLowerCase()} layer.`
    : 'This is the final evolution tier — your system has reached full autonomy.';

  const explainer = EXPLAINERS[topicTitle];

  if (explainer) {
    return {
      ...explainer,
      tier: { level: tierLevel, name: tierInfo.name, description: tierInfo.description },
      whats_next: whatsNext,
    };
  }

  // Generic fallback for unknown/dynamic topics
  return {
    what_it_is: `Advances your system's ${topicTitle.toLowerCase()} capabilities through guided curriculum.`,
    why_it_matters: 'Each evolution step compounds on previous ones, making the system progressively more capable and resilient.',
    what_changes: ['Applies targeted improvements identified by the scan engine'],
    real_world_analogy: 'Like leveling up in a game — each level builds on what you\'ve already earned.',
    tier: { level: tierLevel, name: tierInfo.name, description: tierInfo.description },
    whats_next: whatsNext,
  };
}

/** Get the full tier progression for display */
export function getTierProgression(): Array<{ tier: number; name: string; description: string; topics: string[] }> {
  return [1, 2, 3, 4].map(level => ({
    tier: level,
    name: TIER_NAMES[level].name,
    description: TIER_NAMES[level].description,
    topics: TIER_PROGRESSION.filter(t => TOPIC_TIERS[t] === level),
  }));
}
