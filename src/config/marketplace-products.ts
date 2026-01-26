/**
 * Marketplace Product Configuration
 * Stripe product/price mappings for templates and OS
 * Updated: Tripled base prices, $3999 OS, $1999 World Engine
 */

export const MARKETPLACE_PRODUCTS = {
  // Substrate OS License - $3,999
  os_license: {
    product_id: 'prod_TrNHM2ONKXkipj',
    price_id: 'price_1SteXGQ7FtTiAL4aFfqLPytS',
    amount: 399900, // cents
    name: 'Substrate OS License',
    description: 'Full promptfluid® Substrate OS with BYOK support. 13 modules, single-install license with domain binding.',
    includes: ['Core OS', '13 Modules', 'BYOK Configuration', 'Single-Install License', 'Domain Binding'],
  },
  
  // World Engine - $1,999
  world_engine: {
    product_id: 'prod_TrNHPBGWkXxyQr',
    price_id: 'price_1SteXHQ7FtTiAL4ae0ZrtL9S',
    amount: 199900,
    name: 'World Engine Complete',
    description: 'Full game world engine with NPC memory, physics integration, dream cycles, and persistent world state.',
    includes: ['NPC Memory System', 'Dream Cycles', 'Physics Integration', 'World Persistence', 'Multi-Agent Coordination'],
  },

  // Template tiers by difficulty (tripled from original)
  templates: {
    starter: {
      product_id: 'prod_TrNIeWc11aZXQH',
      price_id: 'price_1SteXUQ7FtTiAL4aC3pLc3U2',
      amount: 2700, // $27 (was $9)
      label: 'Starter',
      difficulty: 'beginner',
    },
    advanced: {
      product_id: 'prod_TrNIEVGUUZAIui',
      price_id: 'price_1SteXVQ7FtTiAL4aa5XLW33U',
      amount: 8700, // $87 (was $29)
      label: 'Advanced',
      difficulty: 'intermediate',
    },
    enterprise: {
      product_id: 'prod_TrNIAiAbjgJWCz',
      price_id: 'price_1SteXWQ7FtTiAL4aKfd2qxqN',
      amount: 14700, // $147 (was $49)
      label: 'Enterprise',
      difficulty: 'advanced',
    },
    premium: {
      product_id: 'prod_TrNIgrPVXQo9DL',
      price_id: 'price_1SteXRQ7FtTiAL4a6trXwxvb',
      amount: 29900, // $299
      label: 'Premium',
      difficulty: 'premium',
    },
    elite: {
      product_id: 'prod_TrNHcsTcQp0T1a',
      price_id: 'price_1SteXPQ7FtTiAL4a3hCkMTpo',
      amount: 39900, // $399
      label: 'Elite',
      difficulty: 'elite',
    },
    pro: {
      product_id: 'prod_TrNIfBeckAvirt',
      price_id: 'price_1SteXSQ7FtTiAL4azZw0I4bb',
      amount: 49900, // $499
      label: 'Pro',
      difficulty: 'pro',
    },
  },
} as const;

// Complex application templates with real-world use cases
export const COMPLEX_TEMPLATES = [
  // Learning & Memory Systems ($299)
  {
    id: 'adaptive-chatbot',
    name: 'Adaptive Learning Chatbot',
    description: 'Self-improving conversational AI with memory persistence, personality evolution, and user preference learning',
    product_id: 'prod_TrNKjGI3bP28xD',
    price_id: 'price_1SteZkQ7FtTiAL4aGeq1CA0C',
    amount: 29900,
    category: 'chatbot',
    difficulty: 'premium',
    features: ['Memory Persistence', 'Personality Evolution', 'Preference Learning', 'Self-Improvement Loops'],
  },
  {
    id: 'knowledge-base-brain',
    name: 'Knowledge Base Brain',
    description: 'RAG-powered document intelligence with memory consolidation and self-improving retrieval accuracy',
    product_id: 'prod_TrNKhkCdPtPKF8',
    price_id: 'price_1SteZlQ7FtTiAL4aodqhA3nL',
    amount: 34900,
    category: 'rag',
    difficulty: 'premium',
    features: ['RAG Pipeline', 'Memory Consolidation', 'Accuracy Evolution', 'Document Understanding'],
  },
  {
    id: 'personal-assistant',
    name: 'Personal Assistant Brain',
    description: 'Cognitive personal assistant with preference memory, schedule learning, and proactive task automation',
    product_id: 'prod_TrNKtC4J9q1yXC',
    price_id: 'price_1SteZqQ7FtTiAL4avm1K0pIh',
    amount: 29900,
    category: 'agent',
    difficulty: 'premium',
    features: ['Preference Memory', 'Schedule Learning', 'Proactive Automation', 'Context Awareness'],
  },

  // Business Applications ($349-$399)
  {
    id: 'customer-support-agent',
    name: 'Customer Support Agent',
    description: 'Autonomous support agent that learns from resolutions, remembers customer history, improves over time',
    product_id: 'prod_TrNKO7u4yBy1hp',
    price_id: 'price_1SteZnQ7FtTiAL4a6jKzoNhz',
    amount: 39900,
    category: 'agent',
    difficulty: 'elite',
    features: ['Resolution Learning', 'Customer Memory', 'Escalation Intelligence', 'Satisfaction Optimization'],
  },
  {
    id: 'content-creator',
    name: 'Content Creator Brain',
    description: 'Self-improving content generation with brand memory, style learning, and audience preference tracking',
    product_id: 'prod_TrNKQHUbrESlOB',
    price_id: 'price_1SteZoQ7FtTiAL4ap2KaU3yA',
    amount: 34900,
    category: 'agent',
    difficulty: 'premium',
    features: ['Brand Memory', 'Style Evolution', 'Audience Learning', 'Multi-Format Output'],
  },
  {
    id: 'sales-intelligence',
    name: 'Sales Intelligence Agent',
    description: 'Lead scoring brain with prospect memory, deal pattern learning, and win rate optimization',
    product_id: 'prod_TrNKwhEOnkWNyh',
    price_id: 'price_1SteZtQ7FtTiAL4ajFFcgUai',
    amount: 44900,
    category: 'agent',
    difficulty: 'elite',
    features: ['Prospect Memory', 'Deal Pattern Learning', 'Win Rate Optimization', 'Pipeline Intelligence'],
  },

  // Developer Tools ($449)
  {
    id: 'code-review-assistant',
    name: 'Code Review Assistant',
    description: 'Self-improving code reviewer that learns team patterns, remembers past issues, evolves best practices',
    product_id: 'prod_TrNKq8uCVlmc05',
    price_id: 'price_1SteZpQ7FtTiAL4aNgUk7jgL',
    amount: 44900,
    category: 'utility',
    difficulty: 'elite',
    features: ['Pattern Learning', 'Issue Memory', 'Best Practice Evolution', 'Team Style Adaptation'],
  },

  // Research & Analysis ($499)
  {
    id: 'research-analyst',
    name: 'Research Analyst Engine',
    description: 'Deep research agent with source memory, insight accumulation, and self-improving analysis quality',
    product_id: 'prod_TrNK1l0D4sIN4s',
    price_id: 'price_1SteZsQ7FtTiAL4aL4O2uaro',
    amount: 49900,
    category: 'agent',
    difficulty: 'pro',
    features: ['Source Memory', 'Insight Accumulation', 'Analysis Evolution', 'Citation Management'],
  },

  // Education & Coaching ($399-$499)
  {
    id: 'educational-tutor',
    name: 'Educational Tutor Brain',
    description: 'Adaptive learning system with student progress memory, concept mastery tracking, personalized curriculum',
    product_id: 'prod_TrNKReyFhNHzMn',
    price_id: 'price_1SteZyQ7FtTiAL4aExD682bb',
    amount: 49900,
    category: 'agent',
    difficulty: 'pro',
    features: ['Progress Memory', 'Mastery Tracking', 'Adaptive Difficulty', 'Personalized Curriculum'],
  },
  {
    id: 'interview-coach',
    name: 'Interview Coach Engine',
    description: 'Interview preparation brain that learns user strengths, remembers practice sessions, improves coaching',
    product_id: 'prod_TrNKnOfpMvVsYA',
    price_id: 'price_1SteZwQ7FtTiAL4ar79o9mCb',
    amount: 39900,
    category: 'agent',
    difficulty: 'elite',
    features: ['Strength Analysis', 'Session Memory', 'Coaching Evolution', 'Industry Adaptation'],
  },
  {
    id: 'language-learning',
    name: 'Language Learning Engine',
    description: 'Language tutor with learner progress memory, error pattern detection, adaptive difficulty',
    product_id: 'prod_TrNKrXV1ep8IO2',
    price_id: 'price_1Stea3Q7FtTiAL4a7TYqHwy9',
    amount: 39900,
    category: 'agent',
    difficulty: 'elite',
    features: ['Progress Memory', 'Error Pattern Detection', 'Adaptive Difficulty', 'Pronunciation Learning'],
  },

  // Creative Applications ($349-$449)
  {
    id: 'story-writer',
    name: 'Story Writer Brain',
    description: 'Creative writing assistant with style memory, story continuity, and evolving narrative capabilities',
    product_id: 'prod_TrNKC5Q65wcVez',
    price_id: 'price_1SteZzQ7FtTiAL4aWGtc4Uos',
    amount: 44900,
    category: 'agent',
    difficulty: 'elite',
    features: ['Style Memory', 'Story Continuity', 'Character Consistency', 'Narrative Evolution'],
  },
  {
    id: 'chef-recipe',
    name: 'Chef & Recipe Brain',
    description: 'Recipe and meal planning brain with taste memory, nutrition learning, and preference evolution',
    product_id: 'prod_TrNKDivcG8Z2BW',
    price_id: 'price_1Stea1Q7FtTiAL4aVtf45PXV',
    amount: 34900,
    category: 'utility',
    difficulty: 'premium',
    features: ['Taste Preference Memory', 'Nutrition Tracking', 'Ingredient Substitution', 'Meal Planning'],
  },

  // Professional Services ($449)
  {
    id: 'legal-document',
    name: 'Legal Document Assistant',
    description: 'Legal document analyzer with clause memory, precedent learning, and contract intelligence',
    product_id: 'prod_TrNKUC7ARd4kQK',
    price_id: 'price_1Stea2Q7FtTiAL4aDC3Q2AeE',
    amount: 44900,
    category: 'utility',
    difficulty: 'elite',
    features: ['Clause Memory', 'Precedent Learning', 'Risk Analysis', 'Contract Intelligence'],
  },

  // Existing premium templates (updated to new pricing)
  {
    id: 'npc-dream-cycle',
    name: 'NPC Dream Cycle Engine',
    description: 'Persistent NPC memory with overnight learning and personality evolution for games',
    product_id: 'prod_TrNIgrPVXQo9DL',
    price_id: 'price_1SteXRQ7FtTiAL4a6trXwxvb',
    amount: 29900,
    category: 'gaming',
    difficulty: 'premium',
    features: ['Dream Cycles', 'Personality Evolution', 'Memory Persistence', 'Behavior Learning'],
  },
  {
    id: 'multi-agent-orchestrator',
    name: 'Multi-Agent Orchestrator',
    description: 'Cognitive agency framework for autonomous agent teams with shared learning',
    product_id: 'prod_TrNHcsTcQp0T1a',
    price_id: 'price_1SteXPQ7FtTiAL4a3hCkMTpo',
    amount: 39900,
    category: 'agent',
    difficulty: 'elite',
    features: ['Agent Coordination', 'Shared Learning', 'Task Distribution', 'Collective Intelligence'],
  },
  {
    id: 'enterprise-rag',
    name: 'Enterprise RAG Pipeline',
    description: 'Production-grade retrieval augmented generation with memory persistence',
    product_id: 'prod_TrNHPvIRLnJEiT',
    price_id: 'price_1SteXOQ7FtTiAL4aMXLWx6a2',
    amount: 29900,
    category: 'rag',
    difficulty: 'premium',
    features: ['Production RAG', 'Memory Persistence', 'Source Attribution', 'Query Optimization'],
  },
  {
    id: 'financial-predictor',
    name: 'Financial Predictor System',
    description: 'Market pattern recognition, risk assessment, portfolio optimization with learning',
    product_id: 'prod_TrNIfBeckAvirt',
    price_id: 'price_1SteXSQ7FtTiAL4azZw0I4bb',
    amount: 49900,
    category: 'agent',
    difficulty: 'pro',
    features: ['Pattern Recognition', 'Risk Assessment', 'Portfolio Optimization', 'Market Learning'],
  },
  {
    id: 'healthcare-diagnostic',
    name: 'Healthcare Diagnostic Engine',
    description: 'Patient history learning, treatment optimization, outcome prediction',
    product_id: 'prod_TrNIhUwnEzFjxU',
    price_id: 'price_1SteXTQ7FtTiAL4ayxz7qV7v',
    amount: 49900,
    category: 'agent',
    difficulty: 'pro',
    features: ['Patient History Memory', 'Treatment Optimization', 'Outcome Prediction', 'Protocol Learning'],
  },
] as const;

// Premium template IDs that cost more
export const PREMIUM_TEMPLATE_IDS = COMPLEX_TEMPLATES
  .filter(t => t.difficulty === 'premium')
  .map(t => t.id);

export const ELITE_TEMPLATE_IDS = COMPLEX_TEMPLATES
  .filter(t => t.difficulty === 'elite')
  .map(t => t.id);

export const PRO_TEMPLATE_IDS = COMPLEX_TEMPLATES
  .filter(t => t.difficulty === 'pro')
  .map(t => t.id);

// Map difficulty to price tier
export function getTemplatePricing(
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'premium' | 'elite' | 'pro', 
  templateId?: string
) {
  // Check for specific template first
  if (templateId) {
    const template = COMPLEX_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      return {
        product_id: template.product_id,
        price_id: template.price_id,
        amount: template.amount,
        label: template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1),
        difficulty: template.difficulty,
      };
    }
  }
  
  switch (difficulty) {
    case 'beginner':
      return MARKETPLACE_PRODUCTS.templates.starter;
    case 'intermediate':
      return MARKETPLACE_PRODUCTS.templates.advanced;
    case 'advanced':
      return MARKETPLACE_PRODUCTS.templates.enterprise;
    case 'premium':
      return MARKETPLACE_PRODUCTS.templates.premium;
    case 'elite':
      return MARKETPLACE_PRODUCTS.templates.elite;
    case 'pro':
      return MARKETPLACE_PRODUCTS.templates.pro;
    default:
      return MARKETPLACE_PRODUCTS.templates.starter;
  }
}

// Get template by ID
export function getTemplateById(id: string) {
  return COMPLEX_TEMPLATES.find(t => t.id === id);
}

// Format price for display
export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}k`.replace('.0k', 'k');
  }
  return `$${dollars.toFixed(0)}`;
}

// SDK is free messaging
export const SDK_FREE_MESSAGE = "The promptfluid® SDK is 100% free for developers to build on. Templates and OS licenses are sold separately for those who want pre-built solutions or self-hosted deployments.";
