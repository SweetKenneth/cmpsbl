/**
 * Marketplace Product Configuration v9.1.0
 * PATCH pricing-stripe-unification-v1
 * 
 * PRICING RULES:
 * - Price floor: $19
 * - Price ceiling: $299
 * - All templates and capabilities capped at $299
 * - Self-improvement/autonomous items are off-menu (Contact Us)
 * 
 * CMPSBL Positioning: Premium cognitive AI templates at accessible prices
 */

export const MARKETPLACE_PRODUCTS = {
  // Developer License — $299/year or $39/month subscription
  developer_license: {
    monthly: {
      product_id: 'prod_TuzDdndKiASplG',
      price_id: 'price_1Sx9F1Q7FtTiAL4aPvHMDh9r',
      amount: 3900, // $39/month
      name: 'Developer License Monthly',
      description: 'Monthly developer access to CMPSBL Substrate SDK and documentation.',
      billing: 'monthly',
    },
    annual: {
      product_id: 'prod_TuzDyllhVhku0B',
      price_id: 'price_1Sx9F2Q7FtTiAL4a6vQtPPLe',
      amount: 29900, // $299/year (2 months free)
      name: 'Developer License Annual',
      description: 'Annual developer access to CMPSBL Substrate SDK and documentation. Save 2 months!',
      billing: 'annual',
    },
  },

  // World Engine License - $299 (one-time)
  os_license: {
    product_id: 'prod_TrNHM2ONKXkipj',
    price_id: 'price_1SteXGQ7FtTiAL4aFfqLPytS',
    amount: 29900, // $299
    name: 'CMPSBL World Engine License',
    description: 'Full CMPSBL World Engine with BYOK support. 10 entities + 5 mesh overlays, single-install license with domain binding.',
    includes: ['World Engine', '10 Entities', '5 Mesh Overlays', 'BYOK Configuration', 'Single-Install License', 'Domain Binding'],
  },
  
  // World Engine - $299
  world_engine: {
    product_id: 'prod_TrNHPBGWkXxyQr',
    price_id: 'price_1SteXHQ7FtTiAL4ae0ZrtL9S',
    amount: 29900, // $299
    name: 'World Engine Complete',
    description: 'Full game world engine with NPC memory, physics integration, dream cycles, and persistent world state.',
    includes: ['NPC Memory System', 'Dream Cycles', 'Physics Integration', 'World Persistence', 'Multi-Agent Coordination'],
  },

  // Template tiers - Normalized pricing (Feb 2026)
  // All tiers capped at $299 max
  templates: {
    starter: {
      product_id: 'prod_TtqCfqsTbEotq7',
      price_id: 'price_1Sw2WDQ7FtTiAL4aTYgwWe14',
      amount: 1900, // $19
      label: 'Starter',
      difficulty: 'beginner',
    },
    advanced: {
      product_id: 'prod_TtqCPOOhWdDsSC',
      price_id: 'price_1Sw2WEQ7FtTiAL4a8JGOAyvU',
      amount: 4900, // $49
      label: 'Advanced',
      difficulty: 'intermediate',
    },
    enterprise: {
      product_id: 'prod_TtqCBeeI0qxL64',
      price_id: 'price_1Sw2WFQ7FtTiAL4aDuTRW0Np',
      amount: 9900, // $99 (normalized from $79)
      label: 'Enterprise',
      difficulty: 'advanced',
    },
    premium: {
      product_id: 'prod_TtqCTxAuwBlaNs',
      price_id: 'price_1Sw2WGQ7FtTiAL4aOxUZzchj',
      amount: 14900, // $149 (normalized from $99)
      label: 'Premium',
      difficulty: 'premium',
    },
    elite: {
      product_id: 'prod_TtqCmkCJUmwoBP',
      price_id: 'price_1Sw2WHQ7FtTiAL4aTh3BJ5tE',
      amount: 19900, // $199 (normalized from $129)
      label: 'Elite',
      difficulty: 'elite',
    },
    pro: {
      product_id: 'prod_TtqCBUjvTa45Tm',
      price_id: 'price_1Sw2WIQ7FtTiAL4a2MBwpMWi',
      amount: 29900, // $299 (normalized ceiling)
      label: 'Pro',
      difficulty: 'pro',
    },
  },
} as const;

// ============================================
// DRIFT PREVENTION TEMPLATES - Our Core USP
// ============================================
export const DRIFT_PREVENTION_TEMPLATES = [
  {
    id: 'drift-prevention-engine',
    name: 'Drift Prevention Engine',
    description: 'THE solution for AI behavioral drift. Memory anchoring, self-correction loops, and personality stability.',
    product_id: 'prod_TrNUK82cim3vP7',
    price_id: 'price_1StejiQ7FtTiAL4a4axcHYQv',
    amount: 29900, // $299 (normalized from $399)
    category: 'brain',
    difficulty: 'elite',
    tags: ['drift-prevention', 'core'],
    features: ['Memory Anchoring', 'Self-Correction Loops', 'Behavioral Stability', 'Personality Lock'],
  },
  {
    id: 'memory-persistence-core',
    name: 'Memory Persistence Core',
    description: '3-tier memory system (working, episodic, semantic) that prevents AI amnesia across sessions.',
    product_id: 'prod_TrNUtnvNOI8A7o',
    price_id: 'price_1StejjQ7FtTiAL4abQJ5BmyA',
    amount: 29900, // $299 (normalized from $349)
    category: 'brain',
    difficulty: 'premium',
    tags: ['memory', 'persistence'],
    features: ['Working Memory', 'Episodic Memory', 'Semantic Memory', 'Cross-Session Recall'],
  },
  {
    id: 'self-healing-chatbot',
    name: 'Self-Healing Chatbot',
    description: 'Chatbot that detects its own behavioral errors and auto-corrects drift in real-time.',
    product_id: 'prod_TrNUwfKCUk06WV',
    price_id: 'price_1StejkQ7FtTiAL4azxvOUmBh',
    amount: 29900, // $299 (normalized from $449)
    category: 'decode',
    difficulty: 'elite',
    tags: ['chatbot', 'self-healing'],
    features: ['Error Detection', 'Auto-Correction', 'Drift Monitoring', 'Health Scoring'],
  },
  {
    id: 'behavioral-anchor-system',
    name: 'Behavioral Anchor System',
    description: 'Anchors AI personality and behavior patterns to prevent drift over time.',
    product_id: 'prod_TrNU4sW4CdG8r2',
    price_id: 'price_1StejlQ7FtTiAL4aItBweWfQ',
    amount: 19900, // $199 (normalized from $299)
    category: 'brain',
    difficulty: 'premium',
    tags: ['behavior', 'anchor'],
    features: ['Personality Anchoring', 'Behavior Baseline', 'Drift Thresholds', 'Recovery Triggers'],
  },
  {
    id: 'context-continuity-engine',
    name: 'Context Continuity Engine',
    description: 'Maintains conversation context across sessions, preventing context collapse and drift.',
    product_id: 'prod_TrNUEvaAyTdRuo',
    price_id: 'price_1StejmQ7FtTiAL4aOJNUMiuY',
    amount: 19900, // $199 (normalized from $299)
    category: 'decode',
    difficulty: 'premium',
    tags: ['context', 'continuity'],
    features: ['Session Bridging', 'Context Recall', 'Coherence Scoring', 'Thread Memory'],
  },
  {
    id: 'autonomous-improvement-loop',
    name: 'Autonomous Improvement Loop',
    description: 'AI that learns and improves autonomously through overnight dream cycles.',
    product_id: 'prod_TrNUXjUXIE7DxP',
    price_id: 'price_1StejnQ7FtTiAL4aq3NSiByW',
    amount: 29900, // $299 (normalized from $499)
    category: 'dream',
    difficulty: 'pro',
    tags: ['autonomous', 'learning'],
    features: ['Dream Cycles', 'Memory Consolidation', 'Pattern Recognition', 'Self-Improvement'],
  },
  {
    id: 'personality-guard-system',
    name: 'Personality Guard System',
    description: 'Protects AI personality consistency, preventing identity drift and jailbreak attempts.',
    product_id: 'prod_TrNUHTtOuxwm5N',
    price_id: 'price_1StejoQ7FtTiAL4aYggLSaZC',
    amount: 29900, // $299 (normalized from $349)
    category: 'defense',
    difficulty: 'premium',
    tags: ['personality', 'security'],
    features: ['Identity Protection', 'Jailbreak Defense', 'Personality Lock', 'Consistency Scoring'],
  },
  {
    id: 'goal-persistence-module',
    name: 'Goal Persistence Module',
    description: 'Ensures AI maintains goal-directed behavior without drifting from objectives.',
    product_id: 'prod_TrNUjbHlVdaPL1',
    price_id: 'price_1StejpQ7FtTiAL4a4Qkxgpf1',
    amount: 29900, // $299 (normalized from $349)
    category: 'brain',
    difficulty: 'premium',
    tags: ['goals', 'persistence'],
    features: ['Goal Tracking', 'Objective Memory', 'Progress Scoring', 'Deviation Alerts'],
  },
  {
    id: 'cognitive-firewall',
    name: 'Cognitive Firewall',
    description: 'Security layer preventing prompt injection, jailbreaks, and adversarial attacks.',
    product_id: 'prod_TrNURsxSSouyVF',
    price_id: 'price_1StejrQ7FtTiAL4aJfSdBWmc',
    amount: 29900, // $299 (normalized from $399)
    category: 'defense',
    difficulty: 'elite',
    tags: ['security', 'firewall'],
    features: ['Injection Detection', 'Jailbreak Prevention', 'PII Filtering', 'Threat Analysis'],
  },
  {
    id: 'learning-consolidation-engine',
    name: 'Learning Consolidation Engine',
    description: 'Overnight memory consolidation for durable AI learning that persists.',
    product_id: 'prod_TrNUJlfB2tV3mN',
    price_id: 'price_1StejrQ7FtTiAL4aeAU6axbp',
    amount: 29900, // $299 (normalized from $449)
    category: 'dream',
    difficulty: 'elite',
    tags: ['learning', 'consolidation'],
    features: ['Memory Synthesis', 'Pattern Extraction', 'Durable Storage', 'Dream Processing'],
  },
  {
    id: 'observability-dashboard',
    name: 'Observability Dashboard',
    description: 'Real-time AI behavior monitoring, drift detection, and health scoring.',
    product_id: 'prod_TrNU8VgLTavbOL',
    price_id: 'price_1StejsQ7FtTiAL4acDh3gyNr',
    amount: 19900, // $199 (normalized from $299)
    category: 'vision',
    difficulty: 'premium',
    tags: ['observability', 'monitoring'],
    features: ['Drift Detection', 'Health Metrics', 'Behavior Tracking', 'Alert System'],
  },
  {
    id: 'knowledge-graph-builder',
    name: 'Knowledge Graph Builder',
    description: 'Build interconnected knowledge structures for persistent AI understanding.',
    product_id: 'prod_TrNU3q3MytMWk4',
    price_id: 'price_1StejtQ7FtTiAL4aWC1L9syI',
    amount: 29900, // $299 (normalized from $399)
    category: 'brain',
    difficulty: 'elite',
    tags: ['knowledge', 'graph'],
    features: ['Semantic Graphs', 'Relationship Mapping', 'Cross-Domain Links', 'Synthesis Engine'],
  },
] as const;

// ============================================
// BUSINESS APPLICATION TEMPLATES
// ============================================
export const BUSINESS_TEMPLATES = [
  {
    id: 'smart-recommendation-engine',
    name: 'Smart Recommendation Engine',
    description: 'E-commerce product recommendations with customer preference memory.',
    product_id: 'prod_TrNUnjsyDF6IIu',
    price_id: 'price_1StejxQ7FtTiAL4aBA3BR7Xy',
    amount: 29900, // $299 (normalized from $349)
    category: 'brain',
    difficulty: 'premium',
    features: ['Preference Learning', 'Purchase History', 'Personalization', 'Collaborative Filtering'],
  },
  {
    id: 'support-memory-agent',
    name: 'Support Memory Agent',
    description: 'Customer service bot that remembers past interactions and learns resolutions.',
    product_id: 'prod_TrNUVLOg8zU1qf',
    price_id: 'price_1StejyQ7FtTiAL4abNlWwkNG',
    amount: 29900, // $299 (normalized from $449)
    category: 'decode',
    difficulty: 'elite',
    features: ['Interaction Memory', 'Resolution Learning', 'Escalation Intelligence', 'Customer History'],
  },
  {
    id: 'fitness-coach-brain',
    name: 'Fitness Coach Brain',
    description: 'Personal fitness coach that adapts to user progress and preferences.',
    product_id: 'prod_TrNU6eBk8uit3b',
    price_id: 'price_1StejzQ7FtTiAL4a339rbjFH',
    amount: 19900, // $199 (normalized from $299)
    category: 'brain',
    difficulty: 'premium',
    features: ['Progress Tracking', 'Workout Memory', 'Goal Adaptation', 'Performance Learning'],
  },
  {
    id: 'wellness-companion-engine',
    name: 'Wellness Companion Engine',
    description: 'Mental wellness companion with emotional state tracking and support.',
    product_id: 'prod_TrNVhh1qidWO92',
    price_id: 'price_1Stek0Q7FtTiAL4adHBlkBMQ',
    amount: 29900, // $299 (normalized from $349)
    category: 'brain',
    difficulty: 'premium',
    features: ['Emotional Memory', 'Mood Tracking', 'Supportive Responses', 'Progress Insights'],
  },
  {
    id: 'financial-advisor-brain',
    name: 'Financial Advisor Brain',
    description: 'Financial advisor that learns spending habits, goals, and risk tolerance.',
    product_id: 'prod_TrNVeZuKLBVMNk',
    price_id: 'price_1Stek1Q7FtTiAL4aYViloOy8',
    amount: 29900, // $299 (normalized from $399)
    category: 'brain',
    difficulty: 'elite',
    features: ['Spending Analysis', 'Goal Tracking', 'Risk Profiling', 'Investment Memory'],
  },
  {
    id: 'hr-intelligence-agent',
    name: 'HR Intelligence Agent',
    description: 'HR assistant with employee interaction memory and policy learning.',
    product_id: 'prod_TrNVCX9kO6iOcX',
    price_id: 'price_1Stek3Q7FtTiAL4ajrkyqk5a',
    amount: 29900, // $299 (normalized from $499)
    category: 'decode',
    difficulty: 'pro',
    features: ['Employee Memory', 'Policy Knowledge', 'Onboarding Assistance', 'FAQ Learning'],
  },
  {
    id: 'it-helpdesk-brain',
    name: 'IT Helpdesk Brain',
    description: 'IT helpdesk with solution memory and escalation intelligence.',
    product_id: 'prod_TrNVLnSVNxFGF2',
    price_id: 'price_1Stek4Q7FtTiAL4aBHma1eXw',
    amount: 29900, // $299 (normalized from $399)
    category: 'decode',
    difficulty: 'elite',
    features: ['Solution Memory', 'Issue Patterns', 'Escalation Rules', 'Knowledge Base'],
  },
  {
    id: 'travel-planner-engine',
    name: 'Travel Planner Engine',
    description: 'Travel planning assistant with destination preference learning.',
    product_id: 'prod_TrNVpisHa7urvX',
    price_id: 'price_1Stek4Q7FtTiAL4ajxq2h1vq',
    amount: 29900, // $299 (normalized from $449)
    category: 'brain',
    difficulty: 'elite',
    features: ['Preference Memory', 'Budget Tracking', 'Destination Learning', 'Itinerary Memory'],
  },
  {
    id: 'music-discovery-brain',
    name: 'Music Discovery Brain',
    description: 'Music discovery assistant that learns taste patterns and preferences.',
    product_id: 'prod_TrNVjF7RqHH1UB',
    price_id: 'price_1Stek6Q7FtTiAL4atl10wSfw',
    amount: 29900, // $299 (normalized from $349)
    category: 'brain',
    difficulty: 'premium',
    features: ['Taste Learning', 'Mood Mapping', 'Discovery Engine', 'Playlist Memory'],
  },
  {
    id: 'real-estate-agent-brain',
    name: 'Real Estate Agent Brain',
    description: 'Real estate assistant with property and client preference memory.',
    product_id: 'prod_TrNVoRmoRCr9KO',
    price_id: 'price_1Stek7Q7FtTiAL4albJAtOWB',
    amount: 29900, // $299 (normalized from $399)
    category: 'brain',
    difficulty: 'elite',
    features: ['Property Memory', 'Client Preferences', 'Market Learning', 'Showing History'],
  },
] as const;

// ============================================
// NEW PREMIUM TEMPLATES - January 2026
// ============================================
export const NEW_PREMIUM_TEMPLATES = [
  // Reasoning & Logic ($299 - Elite)
  {
    id: 'neural-reasoning-engine',
    name: 'Neural Reasoning Engine',
    description: 'Multi-step reasoning with chain-of-thought memory, inference caching, and explanation generation',
    product_id: 'prod_Trkh3EJ5m0Yvcc',
    price_id: 'price_1Su1CFQ7FtTiAL4alBl7SXlx',
    amount: 29900, // $299 (normalized from $399)
    category: 'brain',
    difficulty: 'elite',
    features: ['Chain-of-Thought', 'Inference Caching', 'Explanation Gen', 'Logic Memory'],
  },
  // Sentiment & Emotion ($199 - Premium)
  {
    id: 'sentiment-evolution-tracker',
    name: 'Sentiment Evolution Tracker',
    description: 'Track emotional sentiment across conversations with drift alerts and mood stabilization',
    product_id: 'prod_Trkhx7n5rVP3qc',
    price_id: 'price_1Su1CGQ7FtTiAL4ayPLEGrMi',
    amount: 19900, // $199 (normalized from $299)
    category: 'vision',
    difficulty: 'premium',
    features: ['Sentiment Tracking', 'Drift Alerts', 'Mood Stabilization', 'Emotional Memory'],
  },
  // Multi-Agent ($299 - Pro)
  {
    id: 'multi-agent-orchestrator',
    name: 'Multi-Agent Orchestrator',
    description: 'Coordinate multiple AI agents with shared memory, task delegation, and conflict resolution',
    product_id: 'prod_Trkh3wqgZlXNEV',
    price_id: 'price_1Su1CHQ7FtTiAL4andrza7AD',
    amount: 29900, // $299 (normalized from $499)
    category: 'nexus',
    difficulty: 'pro',
    features: ['Shared Memory', 'Task Delegation', 'Conflict Resolution', 'Agent Coordination'],
  },
  // Compliance ($299 - Elite)
  {
    id: 'compliance-audit-brain',
    name: 'Compliance Audit Brain',
    description: 'Regulatory compliance monitoring with policy memory, violation detection, and audit trails',
    product_id: 'prod_TrkhUkinE1CKX4',
    price_id: 'price_1Su1CIQ7FtTiAL4aOGnNtXCI',
    amount: 29900, // $299 (normalized from $449)
    category: 'defense',
    difficulty: 'elite',
    features: ['Policy Memory', 'Violation Detection', 'Audit Trails', 'Regulatory Learning'],
  },
  // Creative Writing ($199 - Premium)
  {
    id: 'creative-writing-engine',
    name: 'Creative Writing Engine',
    description: 'Story generation with character memory, plot continuity, and style consistency across chapters',
    product_id: 'prod_TrkhyuQ6N7SFSb',
    price_id: 'price_1Su1CJQ7FtTiAL4a5yh9HC77',
    amount: 19900, // $199 (normalized from $349)
    category: 'decode',
    difficulty: 'premium',
    features: ['Character Memory', 'Plot Continuity', 'Style Consistency', 'World Building'],
  },
  // Data Pipeline ($299 - Elite)
  {
    id: 'data-pipeline-intelligence',
    name: 'Data Memory Intelligence',
    description: 'ETL monitoring with anomaly learning, schema memory, and self-healing data flows',
    product_id: 'prod_TrkhDZ6X7rCDbN',
    price_id: 'price_1Su1CLQ7FtTiAL4aIOajfDAN',
    amount: 29900, // $299 (normalized from $399)
    category: 'system',
    difficulty: 'elite',
    features: ['Anomaly Learning', 'Schema Memory', 'Self-Healing', 'Data Flow Optimization'],
  },
  // Threat Intelligence ($299 - Elite)
  {
    id: 'threat-intelligence-brain',
    name: 'Threat Intelligence Brain',
    description: 'Security threat detection with attack pattern learning, incident memory, and auto-response',
    product_id: 'prod_TrkhoHJ7NbVxSy',
    price_id: 'price_1Su1COQ7FtTiAL4atw0i0KWC',
    amount: 29900, // $299 (normalized from $449)
    category: 'defense',
    difficulty: 'elite',
    features: ['Attack Pattern Learning', 'Incident Memory', 'Auto-Response', 'Threat Scoring'],
  },
  // Revenue Prediction ($299 - Pro)
  {
    id: 'revenue-prediction-engine',
    name: 'Revenue Prediction Engine',
    description: 'Revenue optimization with pricing memory, market learning, and forecast generation',
    product_id: 'prod_Trkh7vcnYhleUy',
    price_id: 'price_1Su1CPQ7FtTiAL4aUJTJLoCs',
    amount: 29900, // $299 (normalized from $499)
    category: 'brain',
    difficulty: 'pro',
    features: ['Pricing Memory', 'Market Learning', 'Forecast Generation', 'Revenue Optimization'],
  },
  // Legal Document ($199 - Premium)
  {
    id: 'legal-document-analyzer',
    name: 'Legal Document Analyzer',
    description: 'Contract extraction with clause memory, version tracking, and risk identification',
    product_id: 'prod_TrkhbXqqjb5myJ',
    price_id: 'price_1Su1CQQ7FtTiAL4atcpmnqij',
    amount: 19900, // $199 (normalized from $349)
    category: 'decode',
    difficulty: 'premium',
    features: ['Clause Memory', 'Version Tracking', 'Risk Identification', 'Contract Extraction'],
  },
  // Game Session ($199 - Premium)
  {
    id: 'game-session-memory',
    name: 'Game Session Memory',
    description: 'Session-based game AI with player preference memory, challenge adaptation, and NPC learning',
    product_id: 'prod_TrkhHs2M8gjIFj',
    price_id: 'price_1Su1CSQ7FtTiAL4aJ4uREitJ',
    amount: 19900, // $199 (normalized from $299)
    category: 'world_engine',
    difficulty: 'premium',
    features: ['Player Preference Memory', 'Challenge Adaptation', 'NPC Learning', 'Session Persistence'],
  },
  // Anomaly Detection ($299 - Elite)
  {
    id: 'anomaly-detection-system',
    name: 'Anomaly Detection System',
    description: 'Anomaly detection with baseline learning, drift alerting, and auto-recovery triggers',
    product_id: 'prod_TrkhMJz5hVdflX',
    price_id: 'price_1Su1CSQ7FtTiAL4a94IYYc6f',
    amount: 29900, // $299 (normalized from $399)
    category: 'vision',
    difficulty: 'elite',
    features: ['Baseline Learning', 'Drift Alerting', 'Auto-Recovery', 'Pattern Recognition'],
  },
  // Project Intelligence ($299 - Elite)
  {
    id: 'project-intelligence-agent',
    name: 'Project Intelligence Agent',
    description: 'Project tracking with task dependency memory, resource learning, and deadline prediction',
    product_id: 'prod_TrkhGLTTFbYbkl',
    price_id: 'price_1Su1CTQ7FtTiAL4agOW9aAs9',
    amount: 29900, // $299 (normalized from $449)
    category: 'brain',
    difficulty: 'elite',
    features: ['Task Dependency Memory', 'Resource Learning', 'Deadline Prediction', 'Progress Tracking'],
  },
] as const;

// ============================================
// ORIGINAL COMPLEX TEMPLATES (Updated)
// ============================================
export const COMPLEX_TEMPLATES = [
  // Learning & Memory Systems ($199-$299)
  {
    id: 'adaptive-chatbot',
    name: 'Adaptive Learning Chatbot',
    description: 'Self-improving conversational AI with memory persistence, personality evolution, and user preference learning',
    product_id: 'prod_TrNKjGI3bP28xD',
    price_id: 'price_1SteZkQ7FtTiAL4aGeq1CA0C',
    amount: 19900, // $199 (normalized from $299)
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
    amount: 29900, // $299 (normalized from $349)
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
    amount: 19900, // $199 (normalized from $299)
    category: 'agent',
    difficulty: 'premium',
    features: ['Preference Memory', 'Schedule Learning', 'Proactive Automation', 'Context Awareness'],
  },

  // Business Applications ($199-$299)
  {
    id: 'customer-support-agent',
    name: 'Customer Support Agent',
    description: 'Autonomous support agent that learns from resolutions, remembers customer history, improves over time',
    product_id: 'prod_TrNKO7u4yBy1hp',
    price_id: 'price_1SteZnQ7FtTiAL4a6jKzoNhz',
    amount: 29900, // $299 (normalized from $399)
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
    amount: 29900, // $299 (normalized from $349)
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
    amount: 29900, // $299 (normalized from $449)
    category: 'agent',
    difficulty: 'elite',
    features: ['Prospect Memory', 'Deal Pattern Learning', 'Win Rate Optimization', 'Memory Intelligence'],
  },

  // Developer Tools ($299)
  {
    id: 'code-review-assistant',
    name: 'Code Review Assistant',
    description: 'Self-improving code reviewer that learns team patterns, remembers past issues, evolves best practices',
    product_id: 'prod_TrNKq8uCVlmc05',
    price_id: 'price_1SteZpQ7FtTiAL4aNgUk7jgL',
    amount: 29900, // $299 (normalized from $449)
    category: 'utility',
    difficulty: 'elite',
    features: ['Pattern Learning', 'Issue Memory', 'Best Practice Evolution', 'Team Style Adaptation'],
  },

  // Research & Analysis ($299)
  {
    id: 'research-analyst',
    name: 'Research Analyst Engine',
    description: 'Deep research agent with source memory, insight accumulation, and self-improving analysis quality',
    product_id: 'prod_TrNK1l0D4sIN4s',
    price_id: 'price_1SteZsQ7FtTiAL4aL4O2uaro',
    amount: 29900, // $299 (normalized from $499)
    category: 'agent',
    difficulty: 'pro',
    features: ['Source Memory', 'Insight Accumulation', 'Analysis Evolution', 'Citation Management'],
  },

  // Education & Coaching ($199-$299)
  {
    id: 'educational-tutor',
    name: 'Educational Tutor Brain',
    description: 'Adaptive learning system with student progress memory, concept mastery tracking, personalized curriculum',
    product_id: 'prod_TrNKReyFhNHzMn',
    price_id: 'price_1SteZyQ7FtTiAL4aExD682bb',
    amount: 29900, // $299 (normalized from $499)
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
    amount: 29900, // $299 (normalized from $399)
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
    amount: 29900, // $299 (normalized from $399)
    category: 'agent',
    difficulty: 'elite',
    features: ['Progress Memory', 'Error Pattern Detection', 'Adaptive Difficulty', 'Pronunciation Learning'],
  },

  // Creative Applications ($199-$299)
  {
    id: 'story-writer',
    name: 'Story Writer Brain',
    description: 'Creative writing assistant with style memory, story continuity, and evolving narrative capabilities',
    product_id: 'prod_TrNKC5Q65wcVez',
    price_id: 'price_1SteZzQ7FtTiAL4aWGtc4Uos',
    amount: 29900, // $299 (normalized from $449)
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
    amount: 29900, // $299 (normalized from $349)
    category: 'utility',
    difficulty: 'premium',
    features: ['Taste Preference Memory', 'Nutrition Tracking', 'Ingredient Substitution', 'Meal Planning'],
  },

  // Professional Services ($299)
  {
    id: 'legal-document',
    name: 'Legal Document Assistant',
    description: 'Legal document analyzer with clause memory, precedent learning, and contract intelligence',
    product_id: 'prod_TrNKUC7ARd4kQK',
    price_id: 'price_1Stea2Q7FtTiAL4aDC3Q2AeE',
    amount: 29900, // $299 (normalized from $449)
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
    amount: 19900, // $199 (normalized from $299)
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
    amount: 29900, // $299 (normalized from $399)
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
    amount: 19900, // $199 (normalized from $299)
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
    amount: 29900, // $299 (normalized from $499)
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
    amount: 29900, // $299 (normalized from $499)
    category: 'agent',
    difficulty: 'pro',
    features: ['Patient History Memory', 'Treatment Optimization', 'Outcome Prediction', 'Protocol Learning'],
  },
] as const;

// ============================================
// HIGH-VALUE TEMPLATES - February 2026
// Strategic templates for enterprise buyers
// ============================================
export const HIGH_VALUE_TEMPLATES = [
  // === ENTERPRISE AI GOVERNANCE ===
  {
    id: 'ai-governance-framework',
    name: 'AI Governance Framework',
    description: 'Enterprise-grade AI governance with policy enforcement, audit trails, approval workflows, and compliance monitoring.',
    product_id: 'prod_TuzEGovFramework',
    price_id: 'price_1Sx9GGQ7FtTiAL4aGovernance',
    amount: 29900, // $299
    category: 'defense',
    difficulty: 'pro',
    features: ['Policy Enforcement', 'Approval Workflows', 'Audit Trails', 'Compliance Reporting', 'Role-Based Access'],
  },
  {
    id: 'model-registry-manager',
    name: 'Model Registry Manager',
    description: 'ML model versioning, deployment tracking, A/B testing orchestration, and rollback management with memory.',
    product_id: 'prod_TuzEModelRegistry',
    price_id: 'price_1Sx9GHQ7FtTiAL4aModelReg',
    amount: 29900, // $299
    category: 'system',
    difficulty: 'elite',
    features: ['Model Versioning', 'Deployment Tracking', 'A/B Testing', 'Rollback Management', 'Performance Memory'],
  },
  
  // === STRATEGIC INTELLIGENCE ===
  {
    id: 'competitive-intelligence-engine',
    name: 'Competitive Intelligence Engine',
    description: 'Market analysis with competitor tracking, trend detection, strategic insights, and historical pattern memory.',
    product_id: 'prod_TuzECompetitive',
    price_id: 'price_1Sx9GIQ7FtTiAL4aCompetitive',
    amount: 29900, // $299
    category: 'brain',
    difficulty: 'elite',
    features: ['Competitor Tracking', 'Trend Detection', 'Strategic Insights', 'Market Memory', 'Alert System'],
  },
  {
    id: 'decision-support-system',
    name: 'Decision Support System',
    description: 'Executive decision support with scenario modeling, risk analysis, outcome prediction, and decision memory.',
    product_id: 'prod_TuzEDecisionSupport',
    price_id: 'price_1Sx9GJQ7FtTiAL4aDecision',
    amount: 29900, // $299
    category: 'brain',
    difficulty: 'pro',
    features: ['Scenario Modeling', 'Risk Analysis', 'Outcome Prediction', 'Decision History', 'Recommendation Engine'],
  },
  
  // === DEVELOPER PRODUCTIVITY ===
  {
    id: 'codebase-intelligence',
    name: 'Codebase Intelligence Agent',
    description: 'Codebase analysis with architectural insights, technical debt tracking, refactoring suggestions, and pattern memory.',
    product_id: 'prod_TuzECodebaseIntel',
    price_id: 'price_1Sx9GKQ7FtTiAL4aCodebase',
    amount: 29900, // $299
    category: 'system',
    difficulty: 'elite',
    features: ['Architecture Analysis', 'Tech Debt Tracking', 'Refactoring Hints', 'Pattern Memory', 'PR Intelligence'],
  },
  {
    id: 'devops-autopilot',
    name: 'DevOps Autopilot',
    description: 'Infrastructure automation with incident prediction, capacity planning, deployment optimization, and operational memory.',
    product_id: 'prod_TuzEDevOpsAuto',
    price_id: 'price_1Sx9GLQ7FtTiAL4aDevOps',
    amount: 29900, // $299
    category: 'system',
    difficulty: 'pro',
    features: ['Incident Prediction', 'Capacity Planning', 'Deploy Optimization', 'Operational Memory', 'Runbook Automation'],
  },
  {
    id: 'api-design-assistant',
    name: 'API Design Assistant',
    description: 'API design intelligence with schema validation, versioning strategy, breaking change detection, and design pattern memory.',
    product_id: 'prod_TuzEAPIDesign',
    price_id: 'price_1Sx9GMQ7FtTiAL4aAPIDesign',
    amount: 19900, // $199
    category: 'system',
    difficulty: 'premium',
    features: ['Schema Validation', 'Version Strategy', 'Breaking Change Detection', 'Design Patterns', 'Documentation Gen'],
  },
  
  // === CUSTOMER SUCCESS ===
  {
    id: 'customer-success-brain',
    name: 'Customer Success Brain',
    description: 'Customer health scoring, churn prediction, expansion opportunities, and complete interaction memory.',
    product_id: 'prod_TuzECustomerSuccess',
    price_id: 'price_1Sx9GNQ7FtTiAL4aCustomerSuccess',
    amount: 29900, // $299
    category: 'brain',
    difficulty: 'elite',
    features: ['Health Scoring', 'Churn Prediction', 'Expansion Detection', 'Interaction Memory', 'Success Playbooks'],
  },
  {
    id: 'voice-of-customer-engine',
    name: 'Voice of Customer Engine',
    description: 'Customer feedback analysis with sentiment tracking, theme extraction, priority scoring, and feedback memory.',
    product_id: 'prod_TuzEVoiceCustomer',
    price_id: 'price_1Sx9GOQ7FtTiAL4aVoiceCustomer',
    amount: 19900, // $199
    category: 'brain',
    difficulty: 'premium',
    features: ['Sentiment Analysis', 'Theme Extraction', 'Priority Scoring', 'Trend Detection', 'Feedback Memory'],
  },
  
  // === CONTENT & MARKETING ===
  {
    id: 'content-strategy-engine',
    name: 'Content Strategy Engine',
    description: 'Content planning with SEO intelligence, topic clustering, performance prediction, and content performance memory.',
    product_id: 'prod_TuzEContentStrategy',
    price_id: 'price_1Sx9GPQ7FtTiAL4aContentStrat',
    amount: 19900, // $199
    category: 'brain',
    difficulty: 'premium',
    features: ['SEO Intelligence', 'Topic Clustering', 'Performance Prediction', 'Calendar Planning', 'Content Memory'],
  },
  {
    id: 'brand-voice-guardian',
    name: 'Brand Voice Guardian',
    description: 'Brand consistency enforcement with tone detection, style guidance, terminology management, and brand memory.',
    product_id: 'prod_TuzEBrandVoice',
    price_id: 'price_1Sx9GQQ7FtTiAL4aBrandVoice',
    amount: 19900, // $199
    category: 'decode',
    difficulty: 'premium',
    features: ['Tone Detection', 'Style Guidance', 'Terminology Management', 'Consistency Scoring', 'Brand Memory'],
  },
  
  // === LEGAL & COMPLIANCE ===
  {
    id: 'contract-intelligence',
    name: 'Contract Intelligence Agent',
    description: 'Contract analysis with clause extraction, risk identification, obligation tracking, and contract memory.',
    product_id: 'prod_TuzEContractIntel',
    price_id: 'price_1Sx9GRQ7FtTiAL4aContractIntel',
    amount: 29900, // $299
    category: 'brain',
    difficulty: 'elite',
    features: ['Clause Extraction', 'Risk Identification', 'Obligation Tracking', 'Comparison Analysis', 'Contract Memory'],
  },
  {
    id: 'privacy-compliance-engine',
    name: 'Privacy Compliance Engine',
    description: 'GDPR/CCPA compliance automation with data mapping, consent tracking, breach detection, and regulation memory.',
    product_id: 'prod_TuzEPrivacyCompliance',
    price_id: 'price_1Sx9GSQ7FtTiAL4aPrivacyComp',
    amount: 29900, // $299
    category: 'defense',
    difficulty: 'elite',
    features: ['Data Mapping', 'Consent Tracking', 'Breach Detection', 'SAR Automation', 'Regulation Memory'],
  },
  
  // === OPERATIONS ===
  {
    id: 'supply-chain-intelligence',
    name: 'Supply Chain Intelligence',
    description: 'Supply chain optimization with demand forecasting, risk assessment, supplier scoring, and supply memory.',
    product_id: 'prod_TuzESupplyChain',
    price_id: 'price_1Sx9GTQ7FtTiAL4aSupplyChain',
    amount: 29900, // $299
    category: 'brain',
    difficulty: 'pro',
    features: ['Demand Forecasting', 'Risk Assessment', 'Supplier Scoring', 'Route Optimization', 'Supply Memory'],
  },
  {
    id: 'resource-allocation-optimizer',
    name: 'Resource Allocation Optimizer',
    description: 'Resource planning with capacity modeling, skill matching, utilization optimization, and allocation memory.',
    product_id: 'prod_TuzEResourceAlloc',
    price_id: 'price_1Sx9GUQ7FtTiAL4aResourceAlloc',
    amount: 19900, // $199
    category: 'brain',
    difficulty: 'premium',
    features: ['Capacity Modeling', 'Skill Matching', 'Utilization Optimization', 'Conflict Resolution', 'Allocation Memory'],
  },
  
  // === RESEARCH & ANALYTICS ===
  {
    id: 'research-synthesis-engine',
    name: 'Research Synthesis Engine',
    description: 'Research aggregation with source validation, insight extraction, citation management, and research memory.',
    product_id: 'prod_TuzEResearchSynth',
    price_id: 'price_1Sx9GVQ7FtTiAL4aResearchSynth',
    amount: 29900, // $299
    category: 'brain',
    difficulty: 'elite',
    features: ['Source Validation', 'Insight Extraction', 'Citation Management', 'Cross-Reference', 'Research Memory'],
  },
  {
    id: 'anomaly-detection-suite',
    name: 'Anomaly Detection Suite',
    description: 'Multi-dimensional anomaly detection with pattern learning, alert prioritization, root cause analysis, and anomaly memory.',
    product_id: 'prod_TuzEAnomalyDetect',
    price_id: 'price_1Sx9GWQ7FtTiAL4aAnomalyDetect',
    amount: 29900, // $299
    category: 'vision',
    difficulty: 'elite',
    features: ['Pattern Learning', 'Alert Prioritization', 'Root Cause Analysis', 'Trend Detection', 'Anomaly Memory'],
  },
  
  // === SPECIALIZED AGENTS ===
  {
    id: 'sales-intelligence-agent',
    name: 'Sales Intelligence Agent',
    description: 'Sales enablement with prospect scoring, opportunity analysis, competitive positioning, and deal memory.',
    product_id: 'prod_TuzESalesIntel',
    price_id: 'price_1Sx9GXQ7FtTiAL4aSalesIntel',
    amount: 29900, // $299
    category: 'brain',
    difficulty: 'elite',
    features: ['Prospect Scoring', 'Opportunity Analysis', 'Competitive Intel', 'Deal Intelligence', 'Sales Memory'],
  },
  {
    id: 'talent-acquisition-brain',
    name: 'Talent Acquisition Brain',
    description: 'Recruiting intelligence with candidate matching, skill assessment, culture fit analysis, and hiring memory.',
    product_id: 'prod_TuzETalentAcq',
    price_id: 'price_1Sx9GYQ7FtTiAL4aTalentAcq',
    amount: 29900, // $299
    category: 'brain',
    difficulty: 'elite',
    features: ['Candidate Matching', 'Skill Assessment', 'Culture Fit Analysis', 'Memory Intelligence', 'Hiring Memory'],
  },
  {
    id: 'product-feedback-loop',
    name: 'Product Feedback Loop',
    description: 'Product intelligence with feature request analysis, user behavior learning, roadmap prioritization, and product memory.',
    product_id: 'prod_TuzEProductFeedback',
    price_id: 'price_1Sx9GZQ7FtTiAL4aProductFeedback',
    amount: 19900, // $199
    category: 'brain',
    difficulty: 'premium',
    features: ['Feature Analysis', 'Behavior Learning', 'Roadmap Prioritization', 'User Segmentation', 'Product Memory'],
  },
] as const;

// Combined templates for marketplace display
export const ALL_PREMIUM_TEMPLATES = [
  ...DRIFT_PREVENTION_TEMPLATES,
  ...BUSINESS_TEMPLATES,
  ...NEW_PREMIUM_TEMPLATES,
  ...COMPLEX_TEMPLATES,
  ...HIGH_VALUE_TEMPLATES,
] as const;

// Premium template IDs that cost more
export const PREMIUM_TEMPLATE_IDS = ALL_PREMIUM_TEMPLATES
  .filter(t => t.difficulty === 'premium')
  .map(t => t.id);

export const ELITE_TEMPLATE_IDS = ALL_PREMIUM_TEMPLATES
  .filter(t => t.difficulty === 'elite')
  .map(t => t.id);

export const PRO_TEMPLATE_IDS = ALL_PREMIUM_TEMPLATES
  .filter(t => t.difficulty === 'pro')
  .map(t => t.id);

// Map difficulty to price tier
export function getTemplatePricing(
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'premium' | 'elite' | 'pro', 
  templateId?: string
) {
  // Check for specific template first
  if (templateId) {
    const template = ALL_PREMIUM_TEMPLATES.find(t => t.id === templateId);
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
  return ALL_PREMIUM_TEMPLATES.find(t => t.id === id);
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
export const SDK_FREE_MESSAGE = "The CMPSBL® SDK is 100% free for developers to build on. Templates and OS licenses are sold separately for those who want pre-built solutions or self-hosted deployments.";

// SEO Keywords for AI Drift Prevention
export const DRIFT_PREVENTION_KEYWORDS = [
  'AI chatbot drift',
  'chatbot behavioral drift',
  'AI personality drift',
  'LLM memory persistence',
  'chatbot memory loss',
  'AI context collapse',
  'prevent AI drift',
  'AI self-correction',
  'chatbot consistency',
  'AI behavioral stability',
  'persistent AI memory',
  'cognitive AI architecture',
  'AI governance OS',
  'autonomous AI improvement',
  'AI dream cycles',
  'chatbot self-healing',
] as const;

// ============================================
// NEW BUDGET TEMPLATES — $19-$49 range
// ============================================
export const BUDGET_TEMPLATES = [
  {
    id: 'faq-bot-starter',
    name: 'FAQ Bot Starter',
    description: 'Simple FAQ chatbot with basic question-answer memory. Perfect for getting started.',
    product_id: 'prod_TuzDBRthnFACMC',
    price_id: 'price_1Sx9FLQ7FtTiAL4aa8UGWSof',
    amount: 1900, // $19
    category: 'chatbot',
    difficulty: 'beginner',
    features: ['Basic Q&A', 'Simple Memory', 'Quick Setup', 'Customizable'],
  },
  {
    id: 'sentiment-analyzer-lite',
    name: 'Sentiment Analyzer Lite',
    description: 'Basic sentiment analysis for customer feedback and reviews.',
    product_id: 'prod_TuzDpDitaFEcgS',
    price_id: 'price_1Sx9FMQ7FtTiAL4aR7Mi7oAE',
    amount: 1900, // $19
    category: 'utility',
    difficulty: 'beginner',
    features: ['Positive/Negative Detection', 'Confidence Scores', 'Batch Processing', 'API Ready'],
  },
  {
    id: 'email-template-engine',
    name: 'Email Template Engine',
    description: 'Email template generator with personalization and variable substitution.',
    product_id: 'prod_TuzDGG8RdYbCzN',
    price_id: 'price_1Sx9FNQ7FtTiAL4aP813cT5b',
    amount: 2900, // $29
    category: 'utility',
    difficulty: 'beginner',
    features: ['Template Variables', 'Personalization', 'HTML Output', 'Preview Mode'],
  },
  {
    id: 'task-prioritizer',
    name: 'Task Prioritizer',
    description: 'Basic AI-powered task prioritization for productivity workflows.',
    product_id: 'prod_TuzDZvzi34F2l6',
    price_id: 'price_1Sx9FOQ7FtTiAL4a99iZkQVz',
    amount: 2900, // $29
    category: 'agent',
    difficulty: 'beginner',
    features: ['Priority Scoring', 'Deadline Awareness', 'Dependency Tracking', 'Simple UI'],
  },
  {
    id: 'document-summarizer-lite',
    name: 'Document Summarizer Lite',
    description: 'Simple text summarization for documents and articles.',
    product_id: 'prod_TuzDtuVp2AD85R',
    price_id: 'price_1Sx9FPQ7FtTiAL4aCyjVIY77',
    amount: 3900, // $39
    category: 'utility',
    difficulty: 'intermediate',
    features: ['Key Point Extraction', 'Adjustable Length', 'Multiple Formats', 'Batch Mode'],
  },
  {
    id: 'meeting-notes-parser',
    name: 'Meeting Notes Parser',
    description: 'Meeting notes extractor with action items and attendee tracking.',
    product_id: 'prod_TuzDCZ3WaCpdYV',
    price_id: 'price_1Sx9FQQ7FtTiAL4aEJcrLgz6',
    amount: 3900, // $39
    category: 'utility',
    difficulty: 'intermediate',
    features: ['Action Item Extraction', 'Attendee Detection', 'Date Parsing', 'Export Options'],
  },
  {
    id: 'contact-form-handler',
    name: 'Contact Form Handler',
    description: 'Contact form processor with spam filtering and categorization.',
    product_id: 'prod_TuzD6jqj2E1BQL',
    price_id: 'price_1Sx9FRQ7FtTiAL4aeHw2sr2x',
    amount: 3900, // $39
    category: 'utility',
    difficulty: 'beginner',
    features: ['Spam Detection', 'Category Routing', 'Auto-Response', 'CRM Integration'],
  },
  {
    id: 'rss-feed-aggregator',
    name: 'RSS Feed Aggregator',
    description: 'RSS feed aggregator with basic categorization and filtering.',
    product_id: 'prod_TuzD3ZA4Zs6mYe',
    price_id: 'price_1Sx9FRQ7FtTiAL4aAdUvWPbN',
    amount: 4900, // $49
    category: 'utility',
    difficulty: 'intermediate',
    features: ['Multi-Feed Support', 'Category Filters', 'Update Scheduling', 'Export Options'],
  },
  {
    id: 'bookmark-organizer',
    name: 'Bookmark Organizer',
    description: 'Simple bookmark manager with tagging and search.',
    product_id: 'prod_TuzDLQmG2OyXPS',
    price_id: 'price_1Sx9FSQ7FtTiAL4a1n16VTT0',
    amount: 4900, // $49
    category: 'utility',
    difficulty: 'beginner',
    features: ['Tag System', 'Search', 'Import/Export', 'Folder Organization'],
  },
  {
    id: 'quote-generator',
    name: 'Quote Generator',
    description: 'Quote generator with attribution tracking and category filtering.',
    product_id: 'prod_TuzDkVoD272eEe',
    price_id: 'price_1Sx9FTQ7FtTiAL4azBYrcIF9',
    amount: 4900, // $49
    category: 'utility',
    difficulty: 'beginner',
    features: ['Category Filters', 'Attribution', 'Random Selection', 'API Access'],
  },
] as const;

// Combined templates including budget
export const ALL_TEMPLATES = [
  ...BUDGET_TEMPLATES,
  ...ALL_PREMIUM_TEMPLATES,
] as const;
