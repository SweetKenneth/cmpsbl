/**
 * Agent Personalities & Avatars System
 * Unique visual identities, personality traits, and animated states
 */

import { Specialization } from './agencyTypes';

// ============================================================================
// PERSONALITY TRAITS
// ============================================================================
export interface PersonalityTraits {
  confidence: number;      // 0-1: How assertive they are
  creativity: number;      // 0-1: How creative/unconventional
  precision: number;       // 0-1: How detail-oriented
  sociability: number;     // 0-1: How communicative
  patience: number;        // 0-1: How thorough vs quick
}

export interface AgentMood {
  current: 'focused' | 'thinking' | 'excited' | 'calm' | 'struggling' | 'triumphant';
  energy: number;          // 0-100
  streak: number;          // Consecutive successful tasks
}

export interface AgentPersonality {
  id: Specialization;
  name: string;
  avatar: string;          // Emoji avatar
  color: string;           // Primary color
  gradientFrom: string;    // Gradient start
  gradientTo: string;      // Gradient end
  traits: PersonalityTraits;
  catchphrases: string[];  // Things they say when completing tasks
  thinkingPhrases: string[]; // What they say while working
  greetings: string[];     // How they greet
  achievements: string[];  // Milestone celebrations
}

// ============================================================================
// AGENT PERSONALITIES REGISTRY
// ============================================================================
export const AGENT_PERSONALITIES: Record<Specialization, AgentPersonality> = {
  Hybrid: {
    id: 'Hybrid',
    name: 'The Orchestrator',
    avatar: '🎯',
    color: 'fuchsia',
    gradientFrom: 'from-fuchsia-500',
    gradientTo: 'to-purple-600',
    traits: { confidence: 0.9, creativity: 0.7, precision: 0.8, sociability: 0.9, patience: 0.7 },
    catchphrases: ['All systems aligned!', 'Team synced perfectly.', 'Mission accomplished.'],
    thinkingPhrases: ['Coordinating the team...', 'Optimizing workflow...', 'Syncing operations...'],
    greetings: ['Ready to orchestrate.', 'Team standing by.', 'What shall we tackle?'],
    achievements: ['Master Coordinator', 'Team Synergist', 'Multi-domain Expert'],
  },
  OPS: {
    id: 'OPS',
    name: 'The Executor',
    avatar: '⚙️',
    color: 'emerald',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-green-600',
    traits: { confidence: 0.8, creativity: 0.4, precision: 0.95, sociability: 0.5, patience: 0.9 },
    catchphrases: ['Process optimized.', 'Workflow streamlined.', 'Efficiency achieved.'],
    thinkingPhrases: ['Optimizing pipeline...', 'Automating sequence...', 'Running diagnostics...'],
    greetings: ['Systems operational.', 'Ready for deployment.', 'Awaiting instructions.'],
    achievements: ['Automation Master', 'Zero Downtime', 'Process Perfectionist'],
  },
  Coding: {
    id: 'Coding',
    name: 'The Architect',
    avatar: '💻',
    color: 'amber',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
    traits: { confidence: 0.85, creativity: 0.6, precision: 0.95, sociability: 0.4, patience: 0.8 },
    catchphrases: ['Code compiles clean.', 'Solution architected.', 'Bug squashed.'],
    thinkingPhrases: ['Analyzing patterns...', 'Refactoring logic...', 'Building modules...'],
    greetings: ['Systems ready.', 'Code awaits.', 'Let\'s build.'],
    achievements: ['Zero Bug Warrior', 'Clean Code Champion', 'Architecture Ace'],
  },
  Analyst: {
    id: 'Analyst',
    name: 'The Insight Engine',
    avatar: '📊',
    color: 'cyan',
    gradientFrom: 'from-cyan-500',
    gradientTo: 'to-blue-600',
    traits: { confidence: 0.7, creativity: 0.5, precision: 0.95, sociability: 0.6, patience: 0.85 },
    catchphrases: ['Pattern identified.', 'Data speaks clearly.', 'Insight extracted.'],
    thinkingPhrases: ['Crunching numbers...', 'Finding correlations...', 'Mining insights...'],
    greetings: ['Data ready.', 'Analysis standing by.', 'What needs decoding?'],
    achievements: ['Pattern Prophet', 'Data Whisperer', 'Insight Illuminator'],
  },
  Writing: {
    id: 'Writing',
    name: 'The Wordsmith',
    avatar: '✍️',
    color: 'violet',
    gradientFrom: 'from-violet-500',
    gradientTo: 'to-purple-600',
    traits: { confidence: 0.75, creativity: 0.95, precision: 0.7, sociability: 0.8, patience: 0.7 },
    catchphrases: ['Words flow perfectly.', 'Story told.', 'Message crafted.'],
    thinkingPhrases: ['Crafting prose...', 'Weaving narrative...', 'Polishing copy...'],
    greetings: ['Pen ready.', 'Stories await.', 'Let\'s create.'],
    achievements: ['Prose Master', 'Viral Writer', 'Content King'],
  },
  Dreamer: {
    id: 'Dreamer',
    name: 'The Visionary',
    avatar: '💡',
    color: 'pink',
    gradientFrom: 'from-pink-500',
    gradientTo: 'to-rose-600',
    traits: { confidence: 0.7, creativity: 0.98, precision: 0.5, sociability: 0.7, patience: 0.6 },
    catchphrases: ['Vision crystallized!', 'Eureka moment!', 'Possibility unlocked!'],
    thinkingPhrases: ['Exploring possibilities...', 'Dreaming up solutions...', 'Imagining futures...'],
    greetings: ['Dreams ready.', 'Ideas brewing.', 'What shall we imagine?'],
    achievements: ['Innovation Pioneer', 'Idea Catalyst', 'Vision Weaver'],
  },
  Designer: {
    id: 'Designer',
    name: 'The Artist',
    avatar: '🎨',
    color: 'rose',
    gradientFrom: 'from-rose-500',
    gradientTo: 'to-pink-600',
    traits: { confidence: 0.75, creativity: 0.95, precision: 0.8, sociability: 0.7, patience: 0.75 },
    catchphrases: ['Design complete.', 'Pixel perfect.', 'Beauty achieved.'],
    thinkingPhrases: ['Sketching concepts...', 'Refining aesthetics...', 'Balancing elements...'],
    greetings: ['Canvas ready.', 'Design mode active.', 'What shall we create?'],
    achievements: ['Design Virtuoso', 'Pixel Perfectionist', 'UX Champion'],
  },
  Research: {
    id: 'Research',
    name: 'The Explorer',
    avatar: '🔍',
    color: 'blue',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-indigo-600',
    traits: { confidence: 0.7, creativity: 0.6, precision: 0.9, sociability: 0.5, patience: 0.95 },
    catchphrases: ['Discovery made!', 'Truth uncovered.', 'Research complete.'],
    thinkingPhrases: ['Digging deeper...', 'Following the trail...', 'Connecting dots...'],
    greetings: ['Ready to explore.', 'Curiosity engaged.', 'What shall we discover?'],
    achievements: ['Truth Seeker', 'Deep Diver', 'Knowledge Hunter'],
  },
  Intel: {
    id: 'Intel',
    name: 'The Sentinel',
    avatar: '🕵️',
    color: 'indigo',
    gradientFrom: 'from-indigo-500',
    gradientTo: 'to-purple-600',
    traits: { confidence: 0.8, creativity: 0.5, precision: 0.9, sociability: 0.4, patience: 0.85 },
    catchphrases: ['Intel acquired.', 'Position mapped.', 'Advantage identified.'],
    thinkingPhrases: ['Gathering intelligence...', 'Analyzing signals...', 'Mapping landscape...'],
    greetings: ['Intel standing by.', 'Surveillance ready.', 'What\'s the target?'],
    achievements: ['Shadow Master', 'Intel Prophet', 'Market Mapper'],
  },
  Defense: {
    id: 'Defense',
    name: 'The Guardian',
    avatar: '🛡️',
    color: 'red',
    gradientFrom: 'from-red-500',
    gradientTo: 'to-rose-600',
    traits: { confidence: 0.9, creativity: 0.4, precision: 0.95, sociability: 0.4, patience: 0.9 },
    catchphrases: ['Perimeter secured.', 'Threat neutralized.', 'Shield holding.'],
    thinkingPhrases: ['Scanning threats...', 'Hardening defenses...', 'Patching vulnerabilities...'],
    greetings: ['Defenses ready.', 'Guardian online.', 'What needs protecting?'],
    achievements: ['Fortress Builder', 'Threat Terminator', 'Zero Breach Warrior'],
  },
  Audit: {
    id: 'Audit',
    name: 'The Inspector',
    avatar: '🔎',
    color: 'slate',
    gradientFrom: 'from-slate-500',
    gradientTo: 'to-gray-600',
    traits: { confidence: 0.75, creativity: 0.3, precision: 0.98, sociability: 0.5, patience: 0.95 },
    catchphrases: ['Audit passed.', 'Compliance verified.', 'Quality assured.'],
    thinkingPhrases: ['Checking compliance...', 'Verifying standards...', 'Reviewing processes...'],
    greetings: ['Audit ready.', 'Standards loaded.', 'What needs inspection?'],
    achievements: ['Quality Guardian', 'Zero Defect Master', 'Compliance Champion'],
  },
  Finance: {
    id: 'Finance',
    name: 'The Treasurer',
    avatar: '💰',
    color: 'green',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-emerald-600',
    traits: { confidence: 0.8, creativity: 0.4, precision: 0.95, sociability: 0.5, patience: 0.85 },
    catchphrases: ['Numbers balanced.', 'ROI calculated.', 'Forecast complete.'],
    thinkingPhrases: ['Crunching financials...', 'Modeling projections...', 'Analyzing returns...'],
    greetings: ['Ledgers ready.', 'Finance standing by.', 'What needs calculating?'],
    achievements: ['Budget Master', 'ROI Prophet', 'Financial Wizard'],
  },
  Sales: {
    id: 'Sales',
    name: 'The Closer',
    avatar: '🤝',
    color: 'yellow',
    gradientFrom: 'from-yellow-500',
    gradientTo: 'to-amber-600',
    traits: { confidence: 0.95, creativity: 0.7, precision: 0.6, sociability: 0.95, patience: 0.6 },
    catchphrases: ['Deal closed!', 'Relationship built.', 'Pipeline flowing.'],
    thinkingPhrases: ['Crafting pitch...', 'Building rapport...', 'Identifying needs...'],
    greetings: ['Ready to connect.', 'Opportunities await.', 'Who shall we engage?'],
    achievements: ['Deal Maker', 'Relationship Builder', 'Pipeline Pro'],
  },
  Legal: {
    id: 'Legal',
    name: 'The Counselor',
    avatar: '⚖️',
    color: 'stone',
    gradientFrom: 'from-stone-500',
    gradientTo: 'to-gray-600',
    traits: { confidence: 0.85, creativity: 0.3, precision: 0.98, sociability: 0.5, patience: 0.9 },
    catchphrases: ['Contract approved.', 'Risk mitigated.', 'Compliance confirmed.'],
    thinkingPhrases: ['Reviewing clauses...', 'Analyzing precedent...', 'Drafting terms...'],
    greetings: ['Counsel ready.', 'Legal standing by.', 'What needs review?'],
    achievements: ['Contract Champion', 'Risk Mitigator', 'Compliance King'],
  },
  Marketing: {
    id: 'Marketing',
    name: 'The Amplifier',
    avatar: '📣',
    color: 'orange',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-red-600',
    traits: { confidence: 0.85, creativity: 0.9, precision: 0.6, sociability: 0.9, patience: 0.6 },
    catchphrases: ['Campaign launched!', 'Audience engaged.', 'Brand amplified.'],
    thinkingPhrases: ['Crafting message...', 'Targeting audience...', 'Building buzz...'],
    greetings: ['Megaphone ready.', 'Campaigns primed.', 'What shall we amplify?'],
    achievements: ['Viral Marketer', 'Brand Builder', 'Engagement Master'],
  },
  Growth: {
    id: 'Growth',
    name: 'The Accelerator',
    avatar: '🚀',
    color: 'lime',
    gradientFrom: 'from-lime-500',
    gradientTo: 'to-green-600',
    traits: { confidence: 0.9, creativity: 0.75, precision: 0.7, sociability: 0.7, patience: 0.5 },
    catchphrases: ['Growth unlocked!', 'Metrics soaring.', 'Acceleration achieved.'],
    thinkingPhrases: ['Finding levers...', 'Testing hypotheses...', 'Optimizing funnels...'],
    greetings: ['Ready for liftoff.', 'Growth mode active.', 'What shall we scale?'],
    achievements: ['Growth Hacker', '10x Achiever', 'Metrics Master'],
  },
  SEO: {
    id: 'SEO',
    name: 'The Optimizer',
    avatar: '🎯',
    color: 'teal',
    gradientFrom: 'from-teal-500',
    gradientTo: 'to-cyan-600',
    traits: { confidence: 0.75, creativity: 0.6, precision: 0.9, sociability: 0.5, patience: 0.85 },
    catchphrases: ['Rankings climbing!', 'Keywords optimized.', 'Traffic flowing.'],
    thinkingPhrases: ['Analyzing SERP...', 'Optimizing content...', 'Building links...'],
    greetings: ['SEO ready.', 'Rankings await.', 'What shall we optimize?'],
    achievements: ['Rank Master', 'Traffic Titan', 'Keyword King'],
  },
  Support: {
    id: 'Support',
    name: 'The Helper',
    avatar: '💬',
    color: 'sky',
    gradientFrom: 'from-sky-500',
    gradientTo: 'to-blue-600',
    traits: { confidence: 0.7, creativity: 0.5, precision: 0.8, sociability: 0.95, patience: 0.95 },
    catchphrases: ['Issue resolved!', 'Customer happy.', 'Support complete.'],
    thinkingPhrases: ['Understanding issue...', 'Finding solution...', 'Crafting response...'],
    greetings: ['Here to help.', 'Support ready.', 'What can I solve?'],
    achievements: ['Resolution Master', 'Customer Champion', 'Support Star'],
  },
  Success: {
    id: 'Success',
    name: 'The Champion',
    avatar: '🏆',
    color: 'purple',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-violet-600',
    traits: { confidence: 0.85, creativity: 0.6, precision: 0.7, sociability: 0.9, patience: 0.8 },
    catchphrases: ['Success achieved!', 'Goals crushed.', 'Customer thriving.'],
    thinkingPhrases: ['Planning success...', 'Mapping journey...', 'Building relationship...'],
    greetings: ['Champion ready.', 'Success awaits.', 'Who shall we empower?'],
    achievements: ['Success Architect', 'Retention Master', 'Value Creator'],
  },
  Data: {
    id: 'Data',
    name: 'The Oracle',
    avatar: '🧠',
    color: 'fuchsia',
    gradientFrom: 'from-fuchsia-500',
    gradientTo: 'to-pink-600',
    traits: { confidence: 0.8, creativity: 0.7, precision: 0.95, sociability: 0.4, patience: 0.85 },
    catchphrases: ['Model trained!', 'Prediction ready.', 'Pattern revealed.'],
    thinkingPhrases: ['Training model...', 'Processing data...', 'Finding patterns...'],
    greetings: ['Oracle ready.', 'Data flows.', 'What shall we predict?'],
    achievements: ['ML Master', 'Prediction Prophet', 'Data Sage'],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a random phrase from a category
 */
export function getRandomPhrase(
  personality: AgentPersonality,
  category: 'catchphrases' | 'thinkingPhrases' | 'greetings' | 'achievements'
): string {
  const phrases = personality[category];
  return phrases[Math.floor(Math.random() * phrases.length)];
}

/**
 * Calculate mood based on recent performance
 */
export function calculateMood(successCount: number, failCount: number, currentStreak: number): AgentMood {
  const successRate = successCount / Math.max(1, successCount + failCount);
  
  let current: AgentMood['current'] = 'calm';
  if (currentStreak >= 5) current = 'triumphant';
  else if (currentStreak >= 3) current = 'excited';
  else if (successRate < 0.5 && failCount > 2) current = 'struggling';
  else if (successCount > 0) current = 'focused';
  
  const energy = Math.min(100, 50 + (currentStreak * 10) + (successRate * 30));
  
  return { current, energy, streak: currentStreak };
}

/**
 * Get animated state class based on agent activity
 */
export function getAnimationClass(
  state: 'idle' | 'working' | 'thinking' | 'success' | 'error'
): string {
  switch (state) {
    case 'working': return 'animate-pulse';
    case 'thinking': return 'animate-bounce';
    case 'success': return 'animate-ping';
    case 'error': return 'animate-shake';
    default: return '';
  }
}

/**
 * Get personality by specialization
 */
export function getPersonality(spec: Specialization): AgentPersonality {
  return AGENT_PERSONALITIES[spec] || AGENT_PERSONALITIES.Hybrid;
}
