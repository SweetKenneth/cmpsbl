/**
 * CodeLab Templates — 72+ Templates for the promptfluid® Substrate
 * Migrated from DevPortal.tsx for use in CodeLab
 */

import { LucideIcon } from 'lucide-react';
import {
  MessageSquare, Brain, Shield, Network, Activity, Moon, Cpu,
  Lock, GitBranch, Gauge, Search, Timer, Workflow, Target,
  Database, Lightbulb, Flame, Star, Bot, FileText, Bell,
  Sparkles, Key, Radio, Server, Fingerprint, Package, Globe,
  Users, PlayCircle, Code, Zap, Eye, Image
} from 'lucide-react';

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: 'brain' | 'decode' | 'defense' | 'nexus' | 'vision' | 'dream' | 'system' | 'world_engine';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'premium' | 'elite';
  estimatedTime: string;
  features: string[];
  code: string;
}

export const TEMPLATES: Template[] = [
  {
    id: 'chatbot',
    name: 'AI Chatbot',
    description: 'Conversational AI with memory, intent decoding, and multi-turn context',
    icon: MessageSquare,
    category: 'decode',
    difficulty: 'beginner',
    estimatedTime: '15 min',
    features: ['Session memory', 'Intent extraction', 'Context awareness'],
    code: `import { substrate } from './lib/substrate';

// Simple chatbot with session memory
async function chat(message: string, sessionId: string) {
  const response = await substrate.decode.chat(message, sessionId);
  return response.data?.reply;
}

// With intent extraction
async function smartChat(message: string, sessionId: string) {
  const intent = await substrate.decode.intent(message);
  const reply = await substrate.decode.chat(message, sessionId);
  return { 
    intent: intent.data,
    reply: reply.data?.reply,
    confidence: intent.data?.confidence
  };
}`
  },
  {
    id: 'knowledge-base',
    name: 'Knowledge Base',
    description: 'Store, query, and evolve knowledge with confidence scoring',
    icon: Brain,
    category: 'brain',
    difficulty: 'beginner',
    estimatedTime: '20 min',
    features: ['Semantic search', 'Confidence scoring', 'Memory reinforcement'],
    code: `import { substrate } from './lib/substrate';

// Store knowledge with confidence
await substrate.brain.remember(
  'Neural networks learn through backpropagation',
  'fact',
  0.95, // confidence score
  { domain: 'ml', verified: true }
);

// Semantic search
const results = await substrate.brain.query('machine learning', 10);

// Reinforce accurate memories
for (const memory of results.data.memories) {
  if (memory.wasHelpful) {
    await substrate.brain.reinforce(memory.id, 0.1);
  }
}

// Trigger daily reflection
await substrate.brain.reflect();`
  },
  {
    id: 'bot-detection',
    name: 'Bot Detection',
    description: 'Protect your endpoints from bots with fingerprint analysis',
    icon: Shield,
    category: 'defense',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    features: ['Fingerprint analysis', 'IP reputation', 'Risk scoring'],
    code: `import { substrate } from './lib/substrate';

// Analyze incoming request
async function protectEndpoint(req: Request) {
  const fingerprint = await collectFingerprint();
  const clientIp = req.headers.get('x-forwarded-for');
  
  const analysis = await substrate.defense.analyze({
    fingerprint: {
      canvas: fingerprint.canvas,
      webgl: fingerprint.webgl,
      audio: fingerprint.audio,
      fonts: fingerprint.fonts
    }
  }, clientIp);

  // Check risk score
  if (analysis.data?.risk_score > 0.7) {
    return { blocked: true, reason: 'High risk detected' };
  }

  // Check IP reputation
  const reputation = await substrate.defense.reputation(clientIp);
  if (reputation.data?.score < 30) {
    return { blocked: true, reason: 'Bad IP reputation' };
  }

  return { blocked: false };
}`
  },
  {
    id: 'ai-router',
    name: 'Multi-Model Router',
    description: 'Route AI requests to the best available provider automatically',
    icon: Network,
    category: 'nexus',
    difficulty: 'intermediate',
    estimatedTime: '20 min',
    features: ['Provider failover', 'Cost optimization', 'Latency routing'],
    code: `import { substrate } from './lib/substrate';

// Auto-route to best available provider
const response = await substrate.nexus.route('Explain quantum computing');

// Generate with specific requirements
const text = await substrate.nexus.text(
  'Write a technical blog post about microservices',
  'gpt-4' // optional model preference
);

// Generate images
const image = await substrate.nexus.image(
  'A surreal dreamscape with floating islands, digital art'
);

// Check which providers are available
const providers = await substrate.nexus.providers();
console.log('Available:', providers.data.available);

// Get routing analytics
const stats = await substrate.nexus.routeStats();`
  },
  {
    id: 'observability',
    name: 'System Monitoring',
    description: 'Real-time health metrics, alerts, and distributed tracing',
    icon: Activity,
    category: 'vision',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    features: ['Health monitoring', 'Distributed tracing', 'Alerting'],
    code: `import { substrate } from './lib/substrate';

// Quick health check
const health = await substrate.vision.healthSnapshot();
console.log('Health Score:', health.data.healthScore);

// Full dashboard data
const dashboard = await substrate.vision.dashboard();

// Create distributed trace
const trace = await substrate.vision.trace(undefined, {
  create: true,
  module: 'brain',
  action: 'query'
});
const traceId = trace.data.traceId;

// Continue trace in subsequent calls
await substrate.vision.trace(traceId, {
  module: 'nexus',
  action: 'route',
  duration_ms: 150
});

// Create alert for anomalies
if (health.data.healthScore < 80) {
  await substrate.vision.alert('warn', 'Health degradation detected');
}`
  },
  {
    id: 'dream-feeder',
    name: 'Dream Processor',
    description: 'Feed dreams into the cognitive substrate for synthesis',
    icon: Moon,
    category: 'dream',
    difficulty: 'beginner',
    estimatedTime: '15 min',
    features: ['Dream ingestion', 'Mood analysis', 'Dream interpretation'],
    code: `import { substrate } from './lib/substrate';

// Feed a dream for processing
const result = await substrate.dream.feed(
  'I was floating through an endless library...',
  'dream' // or 'nightmare', 'vision', 'memory'
);

// Check Dream-Eater state
const state = await substrate.dream.status();
console.log('Mood:', state.data.current_mood);
console.log('Dreams consumed today:', state.data.dreams_consumed_today);

// Interpret a specific dream
const interpretation = await substrate.dream.interpret(
  'Flying over silver mountains with crystalline wings'
);

// Trigger mutation cycle (advanced)
await substrate.dream.mutate();`
  },
  {
    id: 'learning-agent',
    name: 'Self-Learning Agent',
    description: 'Create an agent that learns and improves from interactions',
    icon: Cpu,
    category: 'brain',
    difficulty: 'advanced',
    estimatedTime: '45 min',
    features: ['Continuous learning', 'Context recall', 'Reflection cycles'],
    code: `import { substrate } from './lib/substrate';

async function learningAgent(userInput: string, sessionId: string) {
  // 1. Recall relevant context from memory
  const context = await substrate.brain.query(userInput, 5);
  
  // 2. Process with Decode (includes context)
  const response = await substrate.decode.chat(userInput, sessionId);
  
  // 3. Learn from this interaction
  await substrate.brain.learn(
    \`User asked: \${userInput}\\nAgent replied: \${response.data?.reply}\`,
    'interaction'
  );
  
  // 4. Periodically trigger reflection for synthesis
  if (shouldReflect()) {
    const reflection = await substrate.brain.reflect();
    console.log('Daily insights:', reflection.data?.insights);
  }
  
  return response.data?.reply;
}

// Helper: reflect once per day
let lastReflection = 0;
function shouldReflect() {
  const now = Date.now();
  if (now - lastReflection > 86400000) {
    lastReflection = now;
    return true;
  }
  return false;
}`
  },
  {
    id: 'security-dashboard',
    name: 'Security Dashboard',
    description: 'Comprehensive security posture monitoring and anomaly detection',
    icon: Lock,
    category: 'defense',
    difficulty: 'advanced',
    estimatedTime: '40 min',
    features: ['Threat detection', 'Anomaly analysis', 'Security posture'],
    code: `import { substrate } from './lib/substrate';

async function getSecurityState() {
  // Get overall security posture
  const posture = await substrate.defense.posture();
  
  // Detect anomalies (statistical z-score analysis)
  const anomalies = await substrate.defense.anomalyProbe(24);
  
  // Check rate limit status
  const limits = await substrate.defense.limits();
  
  // Get threat analytics
  const threats = await substrate.vision.analytics();
  
  return {
    posture: {
      score: posture.data.overall_score,
      rls_enabled: posture.data.rls_enabled,
      threats_blocked: posture.data.threats_blocked_24h
    },
    anomalies: anomalies.data?.anomalies || [],
    rateLimits: limits.data,
    recentThreats: threats.data?.threats || []
  };
}

// Set up monitoring loop
setInterval(async () => {
  const state = await getSecurityState();
  if (state.posture.score < 70) {
    console.warn('Security score degraded!', state);
  }
}, 60000);`
  },
  {
    id: 'knowledge-graph',
    name: 'Knowledge Graph',
    description: 'Build and query interconnected knowledge structures',
    icon: GitBranch,
    category: 'brain',
    difficulty: 'advanced',
    estimatedTime: '50 min',
    features: ['Graph building', 'Relationship mapping', 'Cross-domain synthesis'],
    code: `import { substrate } from './lib/substrate';

// Store interconnected knowledge
await substrate.brain.remember('React is a JavaScript library', 'concept');
await substrate.brain.remember('React uses virtual DOM', 'fact');
await substrate.brain.remember('Virtual DOM improves performance', 'fact');

// Build knowledge graph from memories
await substrate.brain.graphBuild();

// Get graph structure summary
const summary = await substrate.brain.graphSummary();
console.log('Nodes:', summary.data.node_count);
console.log('Edges:', summary.data.edge_count);
console.log('Clusters:', summary.data.clusters);

// Synthesize insights across domains
const insights = await substrate.brain.synthesize();
console.log('Cross-domain insights:', insights.data.insights);

// Reinforce important connections
if (summary.data.top_edges) {
  for (const edge of summary.data.top_edges.slice(0, 5)) {
    await substrate.brain.reinforce(edge.id, 0.15);
  }
}`
  },
  {
    id: 'quota-monitor',
    name: 'AI Cost Monitor',
    description: 'Track AI usage, costs, and quota consumption in real-time',
    icon: Gauge,
    category: 'vision',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    features: ['Usage tracking', 'Cost estimation', 'Quota alerts'],
    code: `import { substrate } from './lib/substrate';

async function monitorAICosts() {
  // Get current quota status
  const quota = await substrate.vision.quota();
  
  // Get routing stats with cost breakdown
  const routeStats = await substrate.nexus.routeStats();
  
  console.log('Daily Usage:', {
    calls: quota.data.daily_calls_used,
    tokens: quota.data.tokens_used,
    estimated_cost: quota.data.estimated_cost_usd,
    pressure: quota.data.pressure // 0-1 scale
  });
  
  console.log('Provider Costs:', routeStats.data.provider_breakdown);
  
  // Alert if approaching limit
  if (quota.data.pressure > 0.8) {
    console.warn('⚠️ Approaching daily quota limit!');
  }
  
  return { quota: quota.data, routes: routeStats.data };
}

// Check every 5 minutes
setInterval(monitorAICosts, 300000);`
  },
  {
    id: 'session-analytics',
    name: 'Session Analytics',
    description: 'Analyze user sessions with cross-module activity tracking',
    icon: Search,
    category: 'brain',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    features: ['Session tracking', 'Activity patterns', 'Curiosity exploration'],
    code: `import { substrate } from './lib/substrate';

// Get session reflection (cross-module activity)
const session = await substrate.brain.sessionReflection(24);
console.log('Session summary:', session.data.summary);
console.log('Top patterns:', session.data.patterns);

// Deep substrate introspection
const introspection = await substrate.vision.introspection();
console.log('Module health:', introspection.data.module_health);
console.log('Memory stats:', introspection.data.memory_stats);

// View curiosity log (what the system wants to learn)
const curiosity = await substrate.brain.curiosity();
console.log('Unexplored topics:', curiosity.data.queries);

// Explore a curiosity topic
if (curiosity.data.queries.length > 0) {
  const topCuriosity = curiosity.data.queries[0];
  await substrate.brain.explore(topCuriosity.query);
}`
  },
  {
    id: 'smart-rate-limiter',
    name: 'Smart Rate Limiter',
    description: 'Intelligent rate limiting with fingerprint-based tracking',
    icon: Timer,
    category: 'defense',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    features: ['Fingerprint tracking', 'Dynamic limits', 'Bypass detection'],
    code: `import { substrate } from './lib/substrate';

async function smartRateLimit(request: Request) {
  const fingerprint = await collectFingerprint();
  const clientIp = getClientIp(request);
  
  // Check current rate limit status
  const limits = await substrate.defense.limits();
  
  // Analyze request pattern
  const analysis = await substrate.defense.analyze({
    fingerprint,
    ip: clientIp,
    userAgent: request.headers.get('user-agent')
  }, clientIp);
  
  // Dynamic rate limiting based on risk
  const riskScore = analysis.data?.risk_score || 0;
  
  if (riskScore > 0.8) {
    return { allowed: false, reason: 'High risk client', wait: 3600 };
  } else if (riskScore > 0.5) {
    if (limits.data.requests_remaining < 10) {
      return { allowed: false, reason: 'Rate limited', wait: 60 };
    }
  }
  
  return { allowed: true, remaining: limits.data.requests_remaining };
}`
  },
  {
    id: 'webhook-processor',
    name: 'Webhook Processor',
    description: 'Process incoming webhooks with security validation',
    icon: Workflow,
    category: 'defense',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    features: ['Signature validation', 'Threat screening', 'Event routing'],
    code: `import { substrate } from './lib/substrate';

async function processWebhook(request: Request) {
  const body = await request.json();
  const signature = request.headers.get('x-webhook-signature');
  const sourceIp = getClientIp(request);
  
  // 1. Security screening
  const security = await substrate.defense.analyze({
    fingerprint: { source: 'webhook', signature }
  }, sourceIp);
  
  if (security.data?.blocked) {
    await substrate.vision.alert('error', 'Blocked webhook attempt', {
      ip: sourceIp,
      reason: security.data.reason
    });
    return { status: 403, error: 'Blocked' };
  }
  
  // 2. Check IP reputation
  const reputation = await substrate.defense.reputation(sourceIp);
  if (reputation.data?.score < 50) {
    return { status: 403, error: 'Untrusted source' };
  }
  
  // 3. Learn from webhook content
  await substrate.brain.learn(
    JSON.stringify(body),
    \`webhook:\${body.event_type || 'unknown'}\`
  );
  
  // 4. Create trace for observability
  const trace = await substrate.vision.trace(undefined, {
    create: true,
    module: 'webhook',
    action: body.event_type
  });
  
  return { status: 200, traceId: trace.data.traceId };
}`
  },
  {
    id: 'content-moderator',
    name: 'Content Moderator',
    description: 'AI-powered content moderation with learning',
    icon: Target,
    category: 'decode',
    difficulty: 'intermediate',
    estimatedTime: '35 min',
    features: ['Content analysis', 'Risk classification', 'Feedback learning'],
    code: `import { substrate } from './lib/substrate';

async function moderateContent(content: string, contentType: string) {
  // 1. Extract intent to understand content purpose
  const intent = await substrate.decode.intent(content);
  
  // 2. Query past moderation decisions for similar content
  const similar = await substrate.brain.query(
    \`moderation \${contentType} \${intent.data?.primary_intent}\`,
    5
  );
  
  // 3. Route to AI for analysis
  const analysis = await substrate.nexus.route(
    \`Analyze this \${contentType} for policy violations: \${content}\`
  );
  
  // 4. Make decision
  const decision = {
    approved: !analysis.data?.violations,
    reason: analysis.data?.reason,
    confidence: analysis.data?.confidence,
    similar_cases: similar.data?.memories?.length || 0
  };
  
  // 5. Learn from this decision
  await substrate.brain.remember(
    \`Moderated \${contentType}: \${decision.approved ? 'approved' : 'rejected'}\`,
    'moderation_decision',
    decision.confidence || 0.8,
    { contentType, decision }
  );
  
  return decision;
}`
  },
  {
    id: 'recommendation-engine',
    name: 'Recommendation Engine',
    description: 'Personalized recommendations based on learned preferences',
    icon: Star,
    category: 'brain',
    difficulty: 'advanced',
    estimatedTime: '45 min',
    features: ['Preference learning', 'Similarity matching', 'Ranking'],
    code: `import { substrate } from './lib/substrate';

class RecommendationEngine {
  constructor(private userId: string) {}

  async recordInteraction(itemId: string, action: 'view' | 'like' | 'purchase') {
    const weight = { view: 0.3, like: 0.6, purchase: 1.0 }[action];
    
    await substrate.brain.remember(
      \`User \${this.userId} \${action}ed item \${itemId}\`,
      'user_preference',
      weight,
      { userId: this.userId, itemId, action }
    );
    
    // Reinforce existing preference if any
    const existing = await substrate.brain.query(
      \`preference \${this.userId} \${itemId}\`, 1
    );
    if (existing.data?.memories?.length) {
      await substrate.brain.reinforce(existing.data.memories[0].id, weight * 0.2);
    }
  }

  async getRecommendations(context: string, limit = 10) {
    // Query similar preferences
    const preferences = await substrate.brain.query(
      \`preferences \${this.userId} \${context}\`,
      limit * 2
    );
    
    // Get cross-domain insights
    const insights = await substrate.brain.synthesize();
    
    return {
      items: preferences.data?.memories || [],
      insights: insights.data?.insights
    };
  }
}`
  },
  {
    id: 'document-qa',
    name: 'Document Q&A',
    description: 'Ask questions about uploaded documents with semantic search',
    icon: FileText,
    category: 'brain',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    features: ['Document ingestion', 'Semantic search', 'Cited answers'],
    code: `import { substrate } from './lib/substrate';

async function ingestDocument(documentText: string, docId: string, docTitle: string) {
  // Split document into chunks
  const chunks = splitIntoChunks(documentText, 500);
  
  for (let i = 0; i < chunks.length; i++) {
    await substrate.brain.remember(
      chunks[i],
      'document_chunk',
      1.0,
      { docId, docTitle, chunkIndex: i, totalChunks: chunks.length }
    );
  }
  
  return { chunksIngested: chunks.length };
}

async function askQuestion(question: string, docId?: string) {
  // 1. Find relevant chunks
  const query = docId ? \`document:\${docId} \${question}\` : question;
  const chunks = await substrate.brain.query(query, 5);
  
  // 2. Build context from chunks
  const context = chunks.data?.memories
    ?.map(m => m.content)
    .join('\\n\\n') || '';
  
  // 3. Generate answer with citations
  const answer = await substrate.nexus.route(
    \`Based on: \${context}\\n\\nQuestion: \${question}\\nProvide answer with chunk references.\`
  );
  
  return {
    answer: answer.data,
    sources: chunks.data?.memories?.map(m => ({
      docId: m.metadata?.docId,
      chunk: m.metadata?.chunkIndex
    }))
  };
}

function splitIntoChunks(text: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}`
  },
  {
    id: 'anomaly-detector',
    name: 'Anomaly Detector',
    description: 'Detect unusual patterns in time-series and event data',
    icon: Bell,
    category: 'defense',
    difficulty: 'advanced',
    estimatedTime: '40 min',
    features: ['Z-score analysis', 'Pattern baseline', 'Alert triggering'],
    code: `import { substrate } from './lib/substrate';

class AnomalyDetector {
  async analyze(timeWindowHours: number = 24) {
    // Get anomaly probe results
    const anomalies = await substrate.defense.anomalyProbe(timeWindowHours);
    
    // Get baseline from vision
    const baseline = await substrate.vision.analytics();
    
    const results = {
      anomalies: anomalies.data?.anomalies || [],
      severity: 'normal' as 'normal' | 'warning' | 'critical',
      recommendations: [] as string[]
    };
    
    // Classify severity
    const zScores = results.anomalies.map(a => Math.abs(a.z_score));
    const maxZ = Math.max(...zScores, 0);
    
    if (maxZ > 3) {
      results.severity = 'critical';
      results.recommendations.push('Immediate investigation required');
    } else if (maxZ > 2) {
      results.severity = 'warning';
      results.recommendations.push('Monitor closely for escalation');
    }
    
    // Log to vision for tracking
    if (results.severity !== 'normal') {
      await substrate.vision.alert(
        results.severity === 'critical' ? 'error' : 'warn',
        \`Anomaly detected: \${results.anomalies.length} unusual patterns\`,
        { maxZScore: maxZ, count: results.anomalies.length }
      );
    }
    
    return results;
  }
  
  async setBaseline() {
    // Use current metrics as baseline
    const health = await substrate.vision.healthSnapshot();
    await substrate.brain.remember(
      JSON.stringify(health.data),
      'baseline_snapshot',
      1.0,
      { timestamp: new Date().toISOString() }
    );
  }
}`
  },
  {
    id: 'auto-responder',
    name: 'Auto-Responder',
    description: 'Automated responses with escalation and handoff logic',
    icon: Bot,
    category: 'decode',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    features: ['Auto-reply', 'Escalation rules', 'Human handoff'],
    code: `import { substrate } from './lib/substrate';

const ESCALATION_KEYWORDS = ['urgent', 'emergency', 'human', 'manager', 'complaint'];
const CONFIDENCE_THRESHOLD = 0.7;

async function autoRespond(message: string, sessionId: string) {
  // 1. Check for escalation triggers
  const needsHuman = ESCALATION_KEYWORDS.some(k => 
    message.toLowerCase().includes(k)
  );
  
  if (needsHuman) {
    await substrate.vision.alert('info', 'Escalation requested', { sessionId });
    return { response: null, escalate: true, reason: 'Escalation keyword detected' };
  }
  
  // 2. Analyze intent and confidence
  const intent = await substrate.decode.intent(message);
  
  if (intent.data?.confidence < CONFIDENCE_THRESHOLD) {
    await substrate.vision.alert('info', 'Low confidence response', { 
      sessionId, 
      confidence: intent.data?.confidence 
    });
    return { 
      response: null, 
      escalate: true, 
      reason: 'Low confidence - needs human review' 
    };
  }
  
  // 3. Generate auto-response
  const response = await substrate.decode.chat(message, sessionId);
  
  // 4. Learn from successful auto-responses
  await substrate.brain.remember(
    \`Auto-response: \${message} → \${response.data?.reply}\`,
    'auto_response',
    intent.data?.confidence
  );
  
  return { 
    response: response.data?.reply, 
    escalate: false,
    intent: intent.data?.primary_intent
  };
}`
  },
  {
    id: 'semantic-cache',
    name: 'Semantic Cache',
    description: 'Cache AI responses using semantic similarity for cost reduction',
    icon: Database,
    category: 'brain',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    features: ['Similarity matching', 'TTL management', 'Cost savings'],
    code: `import { substrate } from './lib/substrate';

const SIMILARITY_THRESHOLD = 0.85;
const CACHE_TTL_HOURS = 24;

async function semanticCache(prompt: string) {
  // 1. Check cache for similar prompts
  const cached = await substrate.brain.query(
    \`cache:\${prompt}\`,
    3
  );
  
  // Find highly similar cached response
  const match = cached.data?.memories?.find(m => 
    m.confidence > SIMILARITY_THRESHOLD &&
    isRecent(m.metadata?.cached_at, CACHE_TTL_HOURS)
  );
  
  if (match) {
    // Cache hit - return cached response
    await substrate.brain.reinforce(match.id, 0.05); // Reinforce popular queries
    return { 
      response: match.metadata?.response, 
      cached: true,
      similarity: match.confidence 
    };
  }
  
  // 2. Cache miss - generate new response
  const response = await substrate.nexus.route(prompt);
  
  // 3. Store in semantic cache
  await substrate.brain.remember(
    \`cache:\${prompt}\`,
    'semantic_cache',
    1.0,
    { 
      response: response.data,
      cached_at: new Date().toISOString(),
      prompt_length: prompt.length
    }
  );
  
  return { response: response.data, cached: false };
}

function isRecent(timestamp: string | undefined, hours: number): boolean {
  if (!timestamp) return false;
  const age = Date.now() - new Date(timestamp).getTime();
  return age < hours * 60 * 60 * 1000;
}`
  },
  {
    id: 'multi-tenant',
    name: 'Multi-Tenant AI',
    description: 'Isolated AI instances for multi-tenant SaaS applications',
    icon: Users,
    category: 'system',
    difficulty: 'advanced',
    estimatedTime: '50 min',
    features: ['Tenant isolation', 'Quota per tenant', 'Custom models'],
    code: `import { substrate } from './lib/substrate';

class TenantAI {
  constructor(private tenantId: string) {}
  
  private prefix(key: string) {
    return \`tenant:\${this.tenantId}:\${key}\`;
  }
  
  async remember(content: string, type: string, confidence = 0.9) {
    return substrate.brain.remember(
      content,
      this.prefix(type),
      confidence,
      { tenantId: this.tenantId }
    );
  }
  
  async query(query: string, limit = 10) {
    // Scoped to tenant data only
    return substrate.brain.query(
      this.prefix(query),
      limit
    );
  }
  
  async chat(message: string, sessionId: string) {
    const tenantSession = this.prefix(sessionId);
    return substrate.decode.chat(message, tenantSession);
  }
  
  async checkQuota() {
    const quota = await substrate.vision.quota();
    return {
      global: quota.data,
      tenantId: this.tenantId
    };
  }
}

// Usage
const tenantA = new TenantAI('acme-corp');
await tenantA.remember('ACME prefers formal tone', 'preference');

const tenantB = new TenantAI('startup-xyz');
await tenantB.remember('Startup XYZ uses casual language', 'preference');`
  },
  {
    id: 'feedback-loop',
    name: 'Feedback Learning',
    description: 'Learn from user feedback to improve responses over time',
    icon: Lightbulb,
    category: 'brain',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    features: ['Feedback collection', 'Response improvement', 'A/B learning'],
    code: `import { substrate } from './lib/substrate';

interface ResponseRecord {
  id: string;
  prompt: string;
  response: string;
  memoryId?: string;
}

async function recordResponse(prompt: string, response: string): Promise<ResponseRecord> {
  const result = await substrate.brain.remember(
    \`Q: \${prompt}\\nA: \${response}\`,
    'response_record',
    0.5, // Start neutral
    { prompt, response, feedback_count: 0 }
  );
  
  return { 
    id: crypto.randomUUID(), 
    prompt, 
    response,
    memoryId: result.data?.id
  };
}

async function recordFeedback(
  record: ResponseRecord, 
  feedback: 'positive' | 'negative',
  comment?: string
) {
  const delta = feedback === 'positive' ? 0.1 : -0.1;
  
  // Reinforce or diminish the memory
  if (record.memoryId) {
    await substrate.brain.reinforce(record.memoryId, delta);
  }
  
  // Store feedback for analysis
  await substrate.brain.remember(
    \`Feedback: \${feedback} for "\${record.prompt.slice(0, 50)}..."\`,
    'user_feedback',
    1.0,
    { 
      originalPrompt: record.prompt,
      feedback,
      comment,
      recordId: record.id
    }
  );
  
  // Trigger learning if enough negative feedback
  const recentNegative = await substrate.brain.query(
    'feedback negative',
    10
  );
  
  if ((recentNegative.data?.memories?.length || 0) > 5) {
    await substrate.brain.reflect(); // Trigger synthesis
  }
}`
  },
  {
    id: 'scheduled-tasks',
    name: 'Scheduled AI Tasks',
    description: 'Schedule recurring AI operations with cron-like timing',
    icon: Timer,
    category: 'system',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    features: ['Scheduled execution', 'Task queuing', 'Result tracking'],
    code: `import { substrate } from './lib/substrate';

interface ScheduledTask {
  id: string;
  name: string;
  action: () => Promise<any>;
  intervalMs: number;
  lastRun?: Date;
}

class AIScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private intervals: Map<string, NodeJS.Timer> = new Map();

  addTask(name: string, action: () => Promise<any>, intervalMs: number) {
    const task: ScheduledTask = {
      id: crypto.randomUUID(),
      name,
      action,
      intervalMs
    };
    this.tasks.set(task.id, task);
    return task.id;
  }

  start(taskId: string) {
    const task = this.tasks.get(taskId);
    if (!task) return;
    
    const run = async () => {
      task.lastRun = new Date();
      try {
        const result = await task.action();
        await substrate.vision.trace(undefined, {
          create: true,
          module: 'scheduler',
          action: task.name,
          metadata: { success: true, result }
        });
      } catch (error) {
        await substrate.vision.alert('error', \`Scheduled task failed: \${task.name}\`);
      }
    };
    
    run(); // Run immediately
    this.intervals.set(taskId, setInterval(run, task.intervalMs));
  }

  stop(taskId: string) {
    const interval = this.intervals.get(taskId);
    if (interval) clearInterval(interval);
  }
}

// Usage
const scheduler = new AIScheduler();

// Daily reflection
scheduler.addTask(
  'daily-reflection',
  () => substrate.brain.reflect(),
  24 * 60 * 60 * 1000
);`
  },
  {
    id: 'context-window',
    name: 'Context Window Manager',
    description: 'Optimize context for token-limited AI models',
    icon: Flame,
    category: 'nexus',
    difficulty: 'advanced',
    estimatedTime: '35 min',
    features: ['Token counting', 'Priority ranking', 'Context compression'],
    code: `import { substrate } from './lib/substrate';

interface ContextItem {
  content: string;
  priority: number;
  tokens: number;
}

class ContextWindowManager {
  private maxTokens: number;
  
  constructor(maxTokens = 4000) {
    this.maxTokens = maxTokens;
  }
  
  estimateTokens(text: string): number {
    // Rough estimation: ~4 chars per token
    return Math.ceil(text.length / 4);
  }
  
  async buildContext(query: string, systemPrompt: string): Promise<string> {
    const items: ContextItem[] = [];
    
    // 1. Get relevant memories (high priority)
    const memories = await substrate.brain.query(query, 10);
    for (const m of memories.data?.memories || []) {
      items.push({
        content: m.content,
        priority: m.confidence * 10, // Scale by confidence
        tokens: this.estimateTokens(m.content)
      });
    }
    
    // 2. Get session context (medium priority)
    const session = await substrate.brain.sessionReflection(1);
    if (session.data?.summary) {
      items.push({
        content: session.data.summary,
        priority: 5,
        tokens: this.estimateTokens(session.data.summary)
      });
    }
    
    // 3. Sort by priority and fit into window
    items.sort((a, b) => b.priority - a.priority);
    
    let totalTokens = this.estimateTokens(systemPrompt);
    const selected: string[] = [];
    
    for (const item of items) {
      if (totalTokens + item.tokens <= this.maxTokens) {
        selected.push(item.content);
        totalTokens += item.tokens;
      }
    }
    
    return \`\${systemPrompt}\\n\\nContext:\\n\${selected.join('\\n---\\n')}\`;
  }
}`
  },
  {
    id: 'workflow-orchestrator',
    name: 'Workflow Orchestrator',
    description: 'Build multi-step AI workflows with branching logic',
    icon: Workflow,
    category: 'system',
    difficulty: 'advanced',
    estimatedTime: '50 min',
    features: ['Step sequencing', 'Conditional branching', 'Error recovery'],
    code: `import { substrate } from './lib/substrate';

interface WorkflowStep {
  id: string;
  name: string;
  action: (context: any) => Promise<any>;
  onError?: 'skip' | 'retry' | 'abort';
  condition?: (context: any) => boolean;
}

class WorkflowOrchestrator {
  private steps: WorkflowStep[] = [];
  
  addStep(step: Omit<WorkflowStep, 'id'>): string {
    const id = crypto.randomUUID();
    this.steps.push({ id, ...step });
    return id;
  }
  
  async execute(initialContext: any = {}) {
    const trace = await substrate.vision.trace(undefined, {
      create: true,
      module: 'workflow',
      action: 'execute'
    });
    
    let context = { ...initialContext, _results: {} };
    
    for (const step of this.steps) {
      // Check condition
      if (step.condition && !step.condition(context)) {
        continue; // Skip this step
      }
      
      try {
        const result = await step.action(context);
        context._results[step.id] = result;
        context = { ...context, ...result };
        
        await substrate.brain.remember(
          \`Workflow step \${step.name} completed\`,
          'workflow_step',
          1.0,
          { stepId: step.id, traceId: trace.data.traceId }
        );
      } catch (error) {
        if (step.onError === 'skip') continue;
        if (step.onError === 'retry') {
          try {
            const result = await step.action(context);
            context._results[step.id] = result;
          } catch {
            if (step.onError !== 'abort') continue;
          }
        }
        if (step.onError === 'abort') {
          await substrate.vision.alert('error', \`Workflow aborted at \${step.name}\`);
          break;
        }
      }
    }
    
    return context;
  }
}`
  },
  {
    id: 'embeddings-search',
    name: 'Embeddings Search',
    description: 'Semantic search using vector embeddings and similarity',
    icon: Search,
    category: 'brain',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    features: ['Vector similarity', 'Hybrid search', 'Relevance ranking'],
    code: `import { substrate } from './lib/substrate';

async function semanticSearch(query: string, options: {
  limit?: number;
  threshold?: number;
  filters?: Record<string, any>;
} = {}) {
  const { limit = 10, threshold = 0.7, filters = {} } = options;
  
  // Query brain with semantic search
  const results = await substrate.brain.query(query, limit * 2);
  
  // Filter by confidence threshold
  const filtered = (results.data?.memories || [])
    .filter(m => m.confidence >= threshold)
    .filter(m => {
      // Apply metadata filters
      for (const [key, value] of Object.entries(filters)) {
        if (m.metadata?.[key] !== value) return false;
      }
      return true;
    })
    .slice(0, limit);
  
  // Track search for learning
  await substrate.brain.learn(
    \`Search: \${query} → \${filtered.length} results\`,
    'search_query'
  );
  
  return {
    results: filtered,
    query,
    total: results.data?.memories?.length || 0,
    filtered: filtered.length
  };
}

// Hybrid search: combine semantic + keyword
async function hybridSearch(query: string, keywords: string[]) {
  // Semantic search
  const semantic = await semanticSearch(query, { limit: 20 });
  
  // Boost results containing keywords
  const boosted = semantic.results.map(result => {
    let boost = 0;
    for (const keyword of keywords) {
      if (result.content.toLowerCase().includes(keyword.toLowerCase())) {
        boost += 0.1;
      }
    }
    return { ...result, boostedScore: result.confidence + boost };
  });
  
  // Re-sort by boosted score
  return boosted.sort((a, b) => b.boostedScore - a.boostedScore);
}`
  },
  {
    id: 'intelligent-rate-limiter',
    name: 'Intelligent Rate Limiter',
    description: 'AI-aware rate limiting with priority queuing',
    icon: Gauge,
    category: 'defense',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    features: ['Token bucket', 'Priority queuing', 'Adaptive limits'],
    code: `import { substrate } from './lib/substrate';

interface RateLimitConfig {
  tokensPerMinute: number;
  burstLimit: number;
  priorityMultiplier: Record<string, number>;
}

class IntelligentRateLimiter {
  private tokens: number;
  private lastRefill: number;
  private config: RateLimitConfig;
  
  constructor(config: RateLimitConfig) {
    this.config = config;
    this.tokens = config.burstLimit;
    this.lastRefill = Date.now();
  }
  
  private refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 60000; // minutes
    const newTokens = elapsed * this.config.tokensPerMinute;
    this.tokens = Math.min(this.config.burstLimit, this.tokens + newTokens);
    this.lastRefill = now;
  }
  
  async acquire(priority: string = 'normal'): Promise<boolean> {
    this.refill();
    
    const multiplier = this.config.priorityMultiplier[priority] || 1;
    const cost = 1 / multiplier; // Higher priority = lower cost
    
    if (this.tokens >= cost) {
      this.tokens -= cost;
      return true;
    }
    
    // Check with defense module
    const limits = await substrate.defense.limits();
    if (limits.data?.remaining <= 0) {
      await substrate.vision.alert('warn', 'Rate limit exceeded');
      return false;
    }
    
    return false;
  }
}

// Usage
const limiter = new IntelligentRateLimiter({
  tokensPerMinute: 60,
  burstLimit: 10,
  priorityMultiplier: { critical: 3, high: 2, normal: 1, low: 0.5 }
});`
  },
  {
    id: 'conversation-memory',
    name: 'Conversation Memory',
    description: 'Long-term conversation memory with summarization',
    icon: MessageSquare,
    category: 'brain',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    features: ['Message history', 'Auto-summarization', 'Context retrieval'],
    code: `import { substrate } from './lib/substrate';

class ConversationMemory {
  private sessionId: string;
  private messages: Array<{ role: string; content: string; timestamp: Date }> = [];
  private maxMessages = 20;
  
  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }
  
  async addMessage(role: 'user' | 'assistant', content: string) {
    this.messages.push({ role, content, timestamp: new Date() });
    
    // Store in brain for long-term
    await substrate.brain.remember(
      \`[\${role}]: \${content}\`,
      \`conversation:\${this.sessionId}\`,
      0.8,
      { role, sessionId: this.sessionId }
    );
    
    // Trim if too long
    if (this.messages.length > this.maxMessages) {
      await this.summarizeOldMessages();
    }
  }
  
  private async summarizeOldMessages() {
    const toSummarize = this.messages.slice(0, 10);
    this.messages = this.messages.slice(10);
    
    const summary = await substrate.nexus.route(
      \`Summarize this conversation in 2-3 sentences:\\n\${
        toSummarize.map(m => \`\${m.role}: \${m.content}\`).join('\\n')
      }\`
    );
    
    await substrate.brain.remember(
      \`Conversation summary: \${summary.data}\`,
      \`conversation:\${this.sessionId}:summary\`,
      1.0
    );
  }
  
  async getContext() {
    const summaries = await substrate.brain.query(
      \`conversation:\${this.sessionId}:summary\`,
      3
    );
    
    return {
      recentMessages: this.messages,
      summaries: summaries.data?.memories?.map(m => m.content) || []
    };
  }
}`
  },
  {
    id: 'agent-tools',
    name: 'AI Agent with Tools',
    description: 'Build autonomous agents that can call functions',
    icon: Bot,
    category: 'decode',
    difficulty: 'advanced',
    estimatedTime: '45 min',
    features: ['Tool calling', 'ReAct pattern', 'Multi-step reasoning'],
    code: `import { substrate } from './lib/substrate';

interface Tool {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string }>;
  execute: (params: any) => Promise<any>;
}

class AIAgent {
  private tools: Map<string, Tool> = new Map();
  private maxIterations = 5;
  
  registerTool(tool: Tool) {
    this.tools.set(tool.name, tool);
  }
  
  private formatToolsPrompt(): string {
    const toolDescriptions = Array.from(this.tools.values())
      .map(t => \`- \${t.name}: \${t.description}\\n  Parameters: \${JSON.stringify(t.parameters)}\`)
      .join('\\n');
    
    return \`You have access to these tools:\\n\${toolDescriptions}\\n
To use a tool, respond with: TOOL: tool_name({"param": "value"})
To give a final answer, respond with: ANSWER: your response\`;
  }
  
  async run(task: string): Promise<string> {
    let iterations = 0;
    let context = \`Task: \${task}\\n\\n\${this.formatToolsPrompt()}\`;
    const history: string[] = [];
    
    while (iterations < this.maxIterations) {
      iterations++;
      
      const response = await substrate.nexus.route(
        \`\${context}\\n\\nHistory:\\n\${history.join('\\n')}\\n\\nThink step by step.\`
      );
      
      const output = response.data as string;
      
      // Check for final answer
      if (output.includes('ANSWER:')) {
        const answer = output.split('ANSWER:')[1].trim();
        await substrate.brain.remember(
          \`Agent task: \${task}\\nAnswer: \${answer}\`,
          'agent_task',
          1.0,
          { iterations, toolsUsed: history.length }
        );
        return answer;
      }
      
      // Check for tool call
      if (output.includes('TOOL:')) {
        const toolMatch = output.match(/TOOL:\\s*(\\w+)\\((.+)\\)/);
        if (toolMatch) {
          const [, toolName, paramsStr] = toolMatch;
          const tool = this.tools.get(toolName);
          
          if (tool) {
            try {
              const params = JSON.parse(paramsStr);
              const result = await tool.execute(params);
              history.push(\`Used \${toolName}: \${JSON.stringify(result)}\`);
            } catch (e) {
              history.push(\`Error using \${toolName}: \${e}\`);
            }
          }
        }
      }
    }
    
    return 'Max iterations reached';
  }
}`
  },
  {
    id: 'realtime-stream',
    name: 'Realtime Streaming',
    description: 'Stream AI responses for real-time user experience',
    icon: Radio,
    category: 'nexus',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    features: ['SSE streaming', 'Token-by-token', 'Progress tracking'],
    code: `import { substrate } from './lib/substrate';

// Server-side streaming handler
async function streamResponse(prompt: string, onChunk: (chunk: string) => void) {
  // Get initial response
  const response = await substrate.nexus.route(prompt);
  const fullText = response.data as string;
  
  // Simulate streaming for demo (real streaming would use SSE)
  const words = fullText.split(' ');
  let accumulated = '';
  
  for (const word of words) {
    accumulated += (accumulated ? ' ' : '') + word;
    onChunk(word + ' ');
    await new Promise(r => setTimeout(r, 50)); // Simulate typing
  }
  
  // Track completion
  await substrate.brain.remember(
    \`Streamed response: \${prompt.slice(0, 50)}...\`,
    'stream_completion',
    1.0,
    { length: fullText.length, wordCount: words.length }
  );
  
  return accumulated;
}

// React hook for streaming
function useStreamingResponse() {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  const stream = async (prompt: string) => {
    setText('');
    setIsStreaming(true);
    
    try {
      await streamResponse(prompt, (chunk) => {
        setText(prev => prev + chunk);
      });
    } finally {
      setIsStreaming(false);
    }
  };
  
  return { text, isStreaming, stream };
}`
  },
  {
    id: 'health-checker',
    name: 'Health Checker',
    description: 'Comprehensive system health monitoring with auto-healing',
    icon: Activity,
    category: 'system',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    features: ['Health probes', 'Auto-healing', 'Status reporting'],
    code: `import { substrate } from './lib/substrate';

interface HealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  score: number;
  checks: HealthCheck[];
  lastChecked: number;
}

interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  latency?: number;
  message?: string;
}

async function runHealthChecks(): Promise<HealthReport> {
  const checks: HealthCheck[] = [];
  
  // 1. System health
  try {
    const health = await substrate.system.health();
    checks.push({
      name: 'system',
      status: health.data?.status === 'ok' ? 'pass' : 'warn',
      message: health.data?.status
    });
  } catch (e) {
    checks.push({ name: 'system', status: 'fail', message: String(e) });
  }
  
  // 2. Vision dashboard
  try {
    const t0 = Date.now();
    const vision = await substrate.vision.healthSnapshot();
    checks.push({
      name: 'vision',
      status: vision.data?.healthScore > 70 ? 'pass' : 'warn',
      latency: Date.now() - t0
    });
  } catch (e) {
    checks.push({ name: 'vision', status: 'fail', message: String(e) });
  }
  
  // 3. Brain query
  try {
    const t0 = Date.now();
    await substrate.brain.query('health check', 1);
    checks.push({ name: 'brain', status: 'pass', latency: Date.now() - t0 });
  } catch (e) {
    checks.push({ name: 'brain', status: 'fail', message: String(e) });
  }
  
  // Calculate overall score
  const passCount = checks.filter(c => c.status === 'pass').length;
  const score = (passCount / checks.length) * 100;
  
  // Determine status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (checks.some(c => c.status === 'fail')) status = 'unhealthy';
  else if (checks.some(c => c.status === 'warn')) status = 'degraded';
  
  // Auto-heal if needed
  if (status === 'unhealthy') {
    await substrate.system.heal();
    await substrate.vision.alert('error', 'Auto-heal triggered', { checks });
  }
  
  return { status, score, checks, lastChecked: Date.now() };
}`
  },
  {
    id: 'notification-hub',
    name: 'Notification Hub',
    description: 'Centralized notification management with priority routing',
    icon: Bell,
    category: 'vision',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    features: ['Priority routing', 'Channel selection', 'Delivery tracking'],
    code: `import { substrate } from './lib/substrate';

type Priority = 'low' | 'medium' | 'high' | 'critical';
type Channel = 'in_app' | 'email' | 'sms' | 'webhook';

interface Notification {
  title: string;
  message: string;
  priority: Priority;
  channels: Channel[];
  metadata?: Record<string, any>;
}

class NotificationHub {
  private channelHandlers: Map<Channel, (n: Notification) => Promise<boolean>> = new Map();
  
  registerChannel(channel: Channel, handler: (n: Notification) => Promise<boolean>) {
    this.channelHandlers.set(channel, handler);
  }
  
  async send(notification: Notification) {
    const results: Record<Channel, boolean> = {} as any;
    
    // Route based on priority
    const channels = this.routeByPriority(notification);
    
    // Send to each channel
    for (const channel of channels) {
      const handler = this.channelHandlers.get(channel);
      if (handler) {
        try {
          results[channel] = await handler(notification);
        } catch (e) {
          results[channel] = false;
          await substrate.vision.alert('error', \`Notification failed: \${channel}\`);
        }
      }
    }
    
    // Log notification
    await substrate.brain.learn(
      \`Notification: \${notification.title} - \${Object.entries(results).map(([k, v]) => \`\${k}:\${v}\`).join(', ')}\`,
      'notification'
    );
    
    // Create trace
    await substrate.vision.trace(undefined, {
      create: true,
      module: 'notifications',
      action: 'send',
      metadata: { ...notification, results }
    });
    
    return results;
  }
  
  private routeByPriority(notification: Notification): Channel[] {
    const channels = [...notification.channels];
    
    // Critical always includes all channels
    if (notification.priority === 'critical') {
      return ['in_app', 'email', 'sms', 'webhook'];
    }
    
    // High priority adds email
    if (notification.priority === 'high' && !channels.includes('email')) {
      channels.push('email');
    }
    
    return channels;
  }
}`
  },
  {
    id: 'similarity-finder',
    name: 'Similarity Finder',
    description: 'Find semantically similar content across your knowledge base',
    icon: Search,
    category: 'brain',
    difficulty: 'beginner',
    estimatedTime: '15 min',
    features: ['Semantic matching', 'Threshold filtering', 'Cluster discovery'],
    code: `import { substrate } from './lib/substrate';

interface SimilarityResult {
  content: string;
  similarity: number;
  source: string;
  metadata: Record<string, any>;
}

async function findSimilar(
  query: string, 
  threshold = 0.7, 
  limit = 10
): Promise<SimilarityResult[]> {
  // 1. Query brain for similar content
  const results = await substrate.brain.query(query, limit * 2);
  
  // 2. Filter by confidence threshold
  const filtered = (results.data?.memories || [])
    .filter(m => m.confidence >= threshold)
    .slice(0, limit)
    .map(m => ({
      content: m.content,
      similarity: m.confidence,
      source: m.source || 'unknown',
      metadata: m.metadata || {}
    }));
  
  // 3. Log search for analytics
  await substrate.vision.trace(undefined, {
    create: true,
    module: 'search',
    action: 'similarity',
    metadata: { query, resultCount: filtered.length, threshold }
  });
  
  return filtered;
}

async function findClusters(topic: string, clusterSize = 5) {
  const all = await substrate.brain.query(topic, 50);
  const clusters: SimilarityResult[][] = [];
  const used = new Set<string>();
  
  for (const memory of all.data?.memories || []) {
    if (used.has(memory.id)) continue;
    
    const similar = await findSimilar(memory.content, 0.85, clusterSize);
    if (similar.length >= 2) {
      clusters.push(similar);
      similar.forEach(s => used.add(s.content));
    }
  }
  
  return clusters;
}`
  },
  {
    id: 'intent-classifier',
    name: 'Intent Classifier',
    description: 'Classify user intents with custom categories',
    icon: Target,
    category: 'decode',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    features: ['Custom categories', 'Confidence scoring', 'Multi-intent detection'],
    code: `import { substrate } from './lib/substrate';

interface IntentResult {
  primary: string;
  secondary: string[];
  confidence: number;
  entities: Record<string, string>;
}

class IntentClassifier {
  private categories: string[];
  
  constructor(categories: string[]) {
    this.categories = categories;
  }
  
  async classify(text: string): Promise<IntentResult> {
    // 1. Get base intent from Decode
    const baseIntent = await substrate.decode.intent(text);
    
    // 2. Map to custom categories
    const mapping = await substrate.nexus.route(
      \`Map this intent to one of: [\${this.categories.join(', ')}]
      Input: "\${text}"
      Base intent: \${baseIntent.data?.primary_intent}
      Return JSON: { primary: string, secondary: string[], entities: {} }\`
    );
    
    const result = JSON.parse(mapping.data || '{}');
    
    // 3. Store for training
    await substrate.brain.remember(
      \`Intent: \${result.primary} - \${text.substring(0, 50)}\`,
      'intent_training',
      baseIntent.data?.confidence || 0.8,
      { ...result, originalText: text }
    );
    
    return {
      primary: result.primary,
      secondary: result.secondary || [],
      confidence: baseIntent.data?.confidence || 0.8,
      entities: result.entities || {}
    };
  }
  
  async addCategory(category: string, examples: string[]) {
    this.categories.push(category);
    
    for (const example of examples) {
      await substrate.brain.remember(
        example,
        \`intent_example:\${category}\`,
        1.0
      );
    }
  }
}`
  },
  {
    id: 'api-gateway',
    name: 'API Gateway',
    description: 'Unified API gateway with authentication and rate limiting',
    icon: Server,
    category: 'defense',
    difficulty: 'advanced',
    estimatedTime: '50 min',
    features: ['Auth validation', 'Rate limiting', 'Request routing'],
    code: `import { substrate } from './lib/substrate';

interface GatewayRequest {
  path: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  clientIp: string;
}

interface GatewayResponse {
  status: number;
  body: any;
  headers: Record<string, string>;
}

class APIGateway {
  async handleRequest(request: GatewayRequest): Promise<GatewayResponse> {
    // 1. Security check
    const security = await substrate.defense.analyze({
      fingerprint: { path: request.path, method: request.method },
      userAgent: request.headers['user-agent']
    }, request.clientIp);
    
    if (security.data?.blocked) {
      return { status: 403, body: { error: 'Blocked' }, headers: {} };
    }
    
    // 2. Check rate limits
    const limits = await substrate.defense.limits();
    if (limits.data?.requests_remaining <= 0) {
      return { 
        status: 429, 
        body: { error: 'Rate limit exceeded' },
        headers: { 'Retry-After': '60' }
      };
    }
    
    // 3. Check IP reputation
    const reputation = await substrate.defense.reputation(request.clientIp);
    if (reputation.data?.score < 30) {
      await substrate.vision.alert('warn', 'Low reputation IP', { ip: request.clientIp });
    }
    
    // 4. Create trace
    const trace = await substrate.vision.trace(undefined, {
      create: true,
      module: 'gateway',
      action: request.path,
      metadata: { method: request.method, ip: request.clientIp }
    });
    
    // 5. Route to appropriate handler
    const result = await this.routeRequest(request);
    
    // 6. Complete trace
    await substrate.vision.trace(trace.data?.traceId, { complete: true });
    
    return result;
  }
  
  private async routeRequest(request: GatewayRequest): Promise<GatewayResponse> {
    // Implement your routing logic here
    return { status: 200, body: { success: true }, headers: {} };
  }
}`
  },
  {
    id: 'data-validator',
    name: 'Data Validator',
    description: 'AI-powered data validation and cleaning',
    icon: Fingerprint,
    category: 'decode',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    features: ['Schema inference', 'Anomaly detection', 'Auto-correction'],
    code: `import { substrate } from './lib/substrate';

interface ValidationResult {
  valid: boolean;
  errors: Array<{ field: string; issue: string; suggestion?: string }>;
  cleaned?: any;
}

async function validateData(data: any, schema?: object): Promise<ValidationResult> {
  // 1. Analyze data structure
  const intent = await substrate.decode.intent(JSON.stringify(data));
  
  // 2. AI-powered validation
  const validation = await substrate.nexus.route(
    \`Validate this data\${schema ? ' against schema: ' + JSON.stringify(schema) : ''}:
    \${JSON.stringify(data)}
    
    Return JSON: { valid: boolean, errors: [{ field, issue, suggestion }], cleaned: {...} }\`
  );
  
  const result = JSON.parse(validation.data || '{ "valid": true, "errors": [] }');
  
  // 3. Check for anomalies
  if (result.errors.length > 0) {
    await substrate.vision.alert('warn', 'Data validation issues', {
      errorCount: result.errors.length,
      fields: result.errors.map(e => e.field)
    });
  }
  
  // 4. Log for pattern analysis
  await substrate.brain.learn(
    \`Validation: \${result.valid ? 'passed' : 'failed'} - \${result.errors.length} issues\`,
    'data_validation'
  );
  
  return result;
}

async function inferSchema(samples: any[]) {
  const inference = await substrate.nexus.route(
    \`Infer a JSON schema from these data samples:
    \${JSON.stringify(samples.slice(0, 5))}
    Return the JSON schema.\`
  );
  
  return JSON.parse(inference.data || '{}');
}`
  },
  {
    id: 'insight-generator',
    name: 'Insight Generator',
    description: 'Generate actionable insights from data patterns',
    icon: Lightbulb,
    category: 'brain',
    difficulty: 'advanced',
    estimatedTime: '45 min',
    features: ['Pattern synthesis', 'Trend detection', 'Recommendation engine'],
    code: `import { substrate } from './lib/substrate';

interface Insight {
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  recommendations: string[];
}

async function generateInsights(domain: string, timeframe = 7): Promise<Insight[]> {
  // 1. Gather data from brain
  const data = await substrate.brain.query(domain, 100);
  
  // 2. Get cross-domain synthesis
  const synthesis = await substrate.brain.synthesize();
  
  // 3. Get session patterns
  const session = await substrate.brain.sessionReflection(timeframe * 24);
  
  // 4. Generate insights with AI
  const analysis = await substrate.nexus.route(
    \`Analyze these patterns and generate actionable insights:
    
    Data: \${JSON.stringify(data.data?.memories?.slice(0, 20))}
    Synthesis: \${JSON.stringify(synthesis.data)}
    Patterns: \${JSON.stringify(session.data)}
    
    Return JSON array: [{ title, description, confidence: 0-1, actionable: bool, recommendations: [] }]\`
  );
  
  const insights: Insight[] = JSON.parse(analysis.data || '[]');
  
  // 5. Store valuable insights
  for (const insight of insights.filter(i => i.confidence > 0.7)) {
    await substrate.brain.remember(
      insight.title + ': ' + insight.description,
      'insight',
      insight.confidence,
      { domain, recommendations: insight.recommendations }
    );
  }
  
  // 6. Trigger reflection to integrate
  await substrate.brain.reflect();
  
  return insights;
}`
  },
  {
    id: 'prompt-optimizer',
    name: 'Prompt Optimizer',
    description: 'Automatically optimize prompts for better AI responses',
    icon: Sparkles,
    category: 'nexus',
    difficulty: 'advanced',
    estimatedTime: '40 min',
    features: ['Prompt testing', 'Performance tracking', 'Auto-optimization'],
    code: `import { substrate } from './lib/substrate';

interface PromptVariant {
  template: string;
  variables: Record<string, string>;
  score?: number;
}

class PromptOptimizer {
  private variants: Map<string, PromptVariant[]> = new Map();
  
  // Register prompt variants
  registerVariants(promptId: string, variants: PromptVariant[]) {
    this.variants.set(promptId, variants);
  }
  
  // Select best performing variant
  async selectVariant(promptId: string): Promise<PromptVariant> {
    const variants = this.variants.get(promptId);
    if (!variants) throw new Error('Prompt not found');
    
    // Get historical performance
    const performance = await substrate.brain.query(
      \`prompt_perf:\${promptId}\`,
      100
    );
    
    // Calculate scores from history
    const scores: Record<number, number[]> = {};
    for (const mem of performance.data?.memories || []) {
      const idx = mem.metadata?.variantIndex;
      if (idx !== undefined) {
        scores[idx] = scores[idx] || [];
        scores[idx].push(mem.metadata?.score || 0);
      }
    }
    
    // Find best variant (exploration vs exploitation)
    let bestIdx = 0;
    let bestScore = -Infinity;
    
    for (let i = 0; i < variants.length; i++) {
      const variantScores = scores[i] || [];
      const avgScore = variantScores.length > 0
        ? variantScores.reduce((a, b) => a + b, 0) / variantScores.length
        : 0.5; // Default for unexplored
      
      // Add exploration bonus for less tested variants
      const explorationBonus = 0.1 / Math.sqrt(variantScores.length + 1);
      const finalScore = avgScore + explorationBonus;
      
      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestIdx = i;
      }
    }
    
    return { ...variants[bestIdx], score: bestScore };
  }
  
  // Record prompt performance
  async recordPerformance(promptId: string, variantIndex: number, score: number) {
    await substrate.brain.remember(
      \`Performance: \${promptId} variant \${variantIndex} = \${score}\`,
      \`prompt_perf:\${promptId}\`,
      score,
      { variantIndex, score, timestamp: Date.now() }
    );
  }
}`
  },
  // ===== PREMIUM WORLD ENGINE TEMPLATES ($99) =====
  {
    id: 'world-engine-core',
    name: 'World Engine Core',
    description: 'Complete world simulation engine with entity management, spatial indexing, and physics integration',
    icon: Globe,
    category: 'world_engine',
    difficulty: 'premium',
    estimatedTime: '2 hours',
    features: ['Entity system', 'Spatial indexing', 'Physics hooks', 'Event propagation', 'State persistence'],
    code: `import { substrate } from './lib/substrate';

// World Engine Core - Premium Template ($99)
// Complete world simulation with entities, physics, and events

interface WorldEntity {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  properties: Record<string, any>;
  lastUpdated: number;
}

interface WorldState {
  entities: Map<string, WorldEntity>;
  spatialIndex: SpatialGrid;
  eventQueue: WorldEvent[];
  tick: number;
}

class WorldEngine {
  private state: WorldState;
  private updateRate: number = 60; // ticks per second
  private running: boolean = false;
  
  constructor() {
    this.state = {
      entities: new Map(),
      spatialIndex: new SpatialGrid(100), // 100 unit cells
      eventQueue: [],
      tick: 0
    };
  }
  
  // Spawn entity into world
  async spawn(type: string, position: { x: number; y: number; z: number }, properties = {}) {
    const entity: WorldEntity = {
      id: crypto.randomUUID(),
      type,
      position,
      velocity: { x: 0, y: 0, z: 0 },
      properties,
      lastUpdated: Date.now()
    };
    
    this.state.entities.set(entity.id, entity);
    this.state.spatialIndex.insert(entity);
    
    // Log to brain for persistence
    await substrate.brain.remember(
      \`Entity spawned: \${type} at \${JSON.stringify(position)}\`,
      'world_event',
      1.0,
      { entityId: entity.id, type, position }
    );
    
    return entity;
  }
  
  // Query entities in radius
  queryRadius(center: { x: number; y: number; z: number }, radius: number) {
    return this.state.spatialIndex.queryRadius(center, radius);
  }
  
  // Apply physics tick
  physicsTick(deltaTime: number) {
    for (const [id, entity] of this.state.entities) {
      entity.position.x += entity.velocity.x * deltaTime;
      entity.position.y += entity.velocity.y * deltaTime;
      entity.position.z += entity.velocity.z * deltaTime;
      entity.lastUpdated = Date.now();
    }
    this.state.tick++;
  }
  
  // Persist world state
  async saveState() {
    const serialized = Array.from(this.state.entities.values());
    await substrate.brain.remember(
      \`World state snapshot: \${serialized.length} entities\`,
      'world_snapshot',
      1.0,
      { entities: serialized, tick: this.state.tick }
    );
  }
}

// Spatial grid for efficient queries
class SpatialGrid {
  private cellSize: number;
  private cells: Map<string, WorldEntity[]> = new Map();
  
  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }
  
  private getCell(pos: { x: number; y: number; z: number }) {
    const cx = Math.floor(pos.x / this.cellSize);
    const cy = Math.floor(pos.y / this.cellSize);
    const cz = Math.floor(pos.z / this.cellSize);
    return \`\${cx},\${cy},\${cz}\`;
  }
  
  insert(entity: WorldEntity) {
    const key = this.getCell(entity.position);
    if (!this.cells.has(key)) this.cells.set(key, []);
    this.cells.get(key)!.push(entity);
  }
  
  queryRadius(center: { x: number; y: number; z: number }, radius: number) {
    const results: WorldEntity[] = [];
    const cellRadius = Math.ceil(radius / this.cellSize);
    const cx = Math.floor(center.x / this.cellSize);
    const cy = Math.floor(center.y / this.cellSize);
    const cz = Math.floor(center.z / this.cellSize);
    
    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        for (let dz = -cellRadius; dz <= cellRadius; dz++) {
          const key = \`\${cx+dx},\${cy+dy},\${cz+dz}\`;
          const cell = this.cells.get(key);
          if (cell) {
            for (const entity of cell) {
              const dist = Math.sqrt(
                (entity.position.x - center.x) ** 2 +
                (entity.position.y - center.y) ** 2 +
                (entity.position.z - center.z) ** 2
              );
              if (dist <= radius) results.push(entity);
            }
          }
        }
      }
    }
    return results;
  }
}

export const worldEngine = new WorldEngine();`
  },
  {
    id: 'world-engine-physics',
    name: 'World Engine Physics',
    description: 'Advanced physics simulation with collision detection, forces, and constraints',
    icon: Zap,
    category: 'world_engine',
    difficulty: 'premium',
    estimatedTime: '3 hours',
    features: ['Collision detection', 'Force systems', 'Constraints', 'Rigid bodies', 'Raycasting'],
    code: `import { substrate } from './lib/substrate';

// World Engine Physics - Premium Template ($99)
// Advanced physics with collisions, forces, and constraints

interface PhysicsBody {
  id: string;
  mass: number;
  position: Vec3;
  velocity: Vec3;
  acceleration: Vec3;
  forces: Vec3[];
  collider: Collider;
  isStatic: boolean;
}

interface Vec3 { x: number; y: number; z: number; }

interface Collider {
  type: 'sphere' | 'box' | 'capsule';
  radius?: number;
  halfExtents?: Vec3;
}

class PhysicsWorld {
  private bodies: Map<string, PhysicsBody> = new Map();
  private gravity: Vec3 = { x: 0, y: -9.81, z: 0 };
  private constraints: Constraint[] = [];
  
  // Add physics body
  addBody(config: Partial<PhysicsBody> & { id: string }): PhysicsBody {
    const body: PhysicsBody = {
      id: config.id,
      mass: config.mass ?? 1,
      position: config.position ?? { x: 0, y: 0, z: 0 },
      velocity: config.velocity ?? { x: 0, y: 0, z: 0 },
      acceleration: { x: 0, y: 0, z: 0 },
      forces: [],
      collider: config.collider ?? { type: 'sphere', radius: 1 },
      isStatic: config.isStatic ?? false
    };
    this.bodies.set(body.id, body);
    return body;
  }
  
  // Apply force to body
  applyForce(bodyId: string, force: Vec3) {
    const body = this.bodies.get(bodyId);
    if (body && !body.isStatic) {
      body.forces.push(force);
    }
  }
  
  // Physics step
  step(deltaTime: number) {
    // Integrate forces
    for (const body of this.bodies.values()) {
      if (body.isStatic) continue;
      
      // Sum all forces
      let totalForce: Vec3 = { x: 0, y: 0, z: 0 };
      for (const f of body.forces) {
        totalForce.x += f.x;
        totalForce.y += f.y;
        totalForce.z += f.z;
      }
      
      // Add gravity
      totalForce.x += this.gravity.x * body.mass;
      totalForce.y += this.gravity.y * body.mass;
      totalForce.z += this.gravity.z * body.mass;
      
      // F = ma -> a = F/m
      body.acceleration = {
        x: totalForce.x / body.mass,
        y: totalForce.y / body.mass,
        z: totalForce.z / body.mass
      };
      
      // Integrate velocity
      body.velocity.x += body.acceleration.x * deltaTime;
      body.velocity.y += body.acceleration.y * deltaTime;
      body.velocity.z += body.acceleration.z * deltaTime;
      
      // Integrate position
      body.position.x += body.velocity.x * deltaTime;
      body.position.y += body.velocity.y * deltaTime;
      body.position.z += body.velocity.z * deltaTime;
      
      // Clear forces
      body.forces = [];
    }
    
    // Detect & resolve collisions
    this.resolveCollisions();
  }
  
  // Sphere-sphere collision
  private resolveCollisions() {
    const bodies = Array.from(this.bodies.values());
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], b = bodies[j];
        if (a.collider.type === 'sphere' && b.collider.type === 'sphere') {
          const dist = this.distance(a.position, b.position);
          const minDist = (a.collider.radius || 1) + (b.collider.radius || 1);
          
          if (dist < minDist) {
            // Collision response
            const normal = this.normalize(this.subtract(b.position, a.position));
            const overlap = minDist - dist;
            
            if (!a.isStatic && !b.isStatic) {
              a.position.x -= normal.x * overlap * 0.5;
              a.position.y -= normal.y * overlap * 0.5;
              a.position.z -= normal.z * overlap * 0.5;
              b.position.x += normal.x * overlap * 0.5;
              b.position.y += normal.y * overlap * 0.5;
              b.position.z += normal.z * overlap * 0.5;
            }
          }
        }
      }
    }
  }
  
  // Raycast
  raycast(origin: Vec3, direction: Vec3, maxDistance: number) {
    let closest: { body: PhysicsBody; distance: number } | null = null;
    
    for (const body of this.bodies.values()) {
      if (body.collider.type === 'sphere') {
        const hit = this.raySphereIntersect(
          origin, direction, body.position, body.collider.radius || 1
        );
        if (hit && hit < maxDistance && (!closest || hit < closest.distance)) {
          closest = { body, distance: hit };
        }
      }
    }
    return closest;
  }
  
  private distance(a: Vec3, b: Vec3) {
    return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2 + (a.z-b.z)**2);
  }
  
  private subtract(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  }
  
  private normalize(v: Vec3): Vec3 {
    const len = Math.sqrt(v.x**2 + v.y**2 + v.z**2);
    return { x: v.x/len, y: v.y/len, z: v.z/len };
  }
  
  private raySphereIntersect(origin: Vec3, dir: Vec3, center: Vec3, radius: number) {
    const oc = this.subtract(origin, center);
    const a = dir.x**2 + dir.y**2 + dir.z**2;
    const b = 2 * (oc.x*dir.x + oc.y*dir.y + oc.z*dir.z);
    const c = oc.x**2 + oc.y**2 + oc.z**2 - radius**2;
    const discriminant = b*b - 4*a*c;
    if (discriminant < 0) return null;
    return (-b - Math.sqrt(discriminant)) / (2*a);
  }
}

export const physics = new PhysicsWorld();`
  },
  {
    id: 'multi-agent-orchestrator',
    name: 'Multi-Agent Orchestrator',
    description: 'Coordinate multiple AI agents with task distribution, consensus, and emergent behavior',
    icon: Users,
    category: 'brain',
    difficulty: 'premium',
    estimatedTime: '2.5 hours',
    features: ['Agent coordination', 'Task distribution', 'Consensus protocols', 'Emergent behavior', 'Role assignment'],
    code: `import { substrate } from './lib/substrate';

// Multi-Agent Orchestrator - Premium Template ($99)
// Coordinate agent swarms with consensus and emergent behavior

interface Agent {
  id: string;
  role: string;
  capabilities: string[];
  currentTask: string | null;
  status: 'idle' | 'working' | 'blocked';
  performance: number;
}

interface Task {
  id: string;
  type: string;
  priority: number;
  requirements: string[];
  assignedTo: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

class AgentOrchestrator {
  private agents: Map<string, Agent> = new Map();
  private taskQueue: Task[] = [];
  private consensusThreshold = 0.66;
  
  // Register agent
  registerAgent(config: Omit<Agent, 'currentTask' | 'status' | 'performance'>) {
    const agent: Agent = {
      ...config,
      currentTask: null,
      status: 'idle',
      performance: 1.0
    };
    this.agents.set(agent.id, agent);
    return agent;
  }
  
  // Submit task
  async submitTask(task: Omit<Task, 'id' | 'assignedTo' | 'status'>) {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      assignedTo: null,
      status: 'pending'
    };
    this.taskQueue.push(newTask);
    this.taskQueue.sort((a, b) => b.priority - a.priority);
    
    await this.assignTasks();
    return newTask;
  }
  
  // Assign tasks to best-fit agents
  private async assignTasks() {
    for (const task of this.taskQueue.filter(t => t.status === 'pending')) {
      const candidates = this.findCandidates(task);
      if (candidates.length > 0) {
        // Pick best performer
        const best = candidates.reduce((a, b) => 
          a.performance > b.performance ? a : b
        );
        
        task.assignedTo = best.id;
        task.status = 'in_progress';
        best.currentTask = task.id;
        best.status = 'working';
        
        await substrate.brain.remember(
          \`Task assigned: \${task.type} -> \${best.role}\`,
          'orchestrator_event',
          1.0,
          { taskId: task.id, agentId: best.id }
        );
      }
    }
  }
  
  // Find agents with required capabilities
  private findCandidates(task: Task): Agent[] {
    return Array.from(this.agents.values()).filter(agent => {
      if (agent.status !== 'idle') return false;
      return task.requirements.every(req => 
        agent.capabilities.includes(req)
      );
    });
  }
  
  // Consensus voting on decision
  async seekConsensus(proposal: string, voters: string[]): Promise<boolean> {
    const votes: boolean[] = [];
    
    for (const voterId of voters) {
      const agent = this.agents.get(voterId);
      if (!agent) continue;
      
      // Each agent evaluates proposal
      const evaluation = await substrate.decode.intent(
        \`As a \${agent.role}, evaluate: \${proposal}\`
      );
      
      votes.push(evaluation.data?.sentiment === 'positive');
    }
    
    const approval = votes.filter(v => v).length / votes.length;
    const passed = approval >= this.consensusThreshold;
    
    await substrate.brain.remember(
      \`Consensus: \${passed ? 'PASSED' : 'FAILED'} (\${(approval * 100).toFixed(0)}%)\`,
      'consensus_result',
      approval,
      { proposal, votes: votes.length, approval }
    );
    
    return passed;
  }
  
  // Get swarm status
  getStatus() {
    const agents = Array.from(this.agents.values());
    return {
      totalAgents: agents.length,
      idle: agents.filter(a => a.status === 'idle').length,
      working: agents.filter(a => a.status === 'working').length,
      pendingTasks: this.taskQueue.filter(t => t.status === 'pending').length,
      avgPerformance: agents.reduce((s, a) => s + a.performance, 0) / agents.length
    };
  }
}

export const orchestrator = new AgentOrchestrator();`
  },
  // ===== ELITE TEMPLATES ($199) =====
  {
    id: 'world-engine-complete',
    name: 'World Engine Complete Suite',
    description: 'Full world simulation package: entities, physics, AI, networking, and persistence',
    icon: Globe,
    category: 'world_engine',
    difficulty: 'elite',
    estimatedTime: '4+ hours',
    features: ['Complete ECS', 'Advanced physics', 'NPC AI', 'Multiplayer sync', 'Save/load', 'Event system'],
    code: `import { substrate } from './lib/substrate';

// World Engine Complete Suite - Elite Template ($199)
// Full-featured world simulation with all components

// ===== ENTITY COMPONENT SYSTEM =====
type ComponentType = 'transform' | 'physics' | 'render' | 'ai' | 'network' | 'custom';

interface Component {
  type: ComponentType;
  data: Record<string, any>;
}

interface Entity {
  id: string;
  name: string;
  components: Map<ComponentType, Component>;
  tags: Set<string>;
  parent: string | null;
  children: string[];
}

// ===== WORLD STATE =====
class WorldEngine {
  private entities: Map<string, Entity> = new Map();
  private systems: System[] = [];
  private tick: number = 0;
  private running: boolean = false;
  
  // Create entity with components
  createEntity(name: string, components: Component[] = []): Entity {
    const entity: Entity = {
      id: crypto.randomUUID(),
      name,
      components: new Map(),
      tags: new Set(),
      parent: null,
      children: []
    };
    
    for (const comp of components) {
      entity.components.set(comp.type, comp);
    }
    
    this.entities.set(entity.id, entity);
    return entity;
  }
  
  // Query entities by component
  query(requiredComponents: ComponentType[]): Entity[] {
    return Array.from(this.entities.values()).filter(entity =>
      requiredComponents.every(comp => entity.components.has(comp))
    );
  }
  
  // Register system
  addSystem(system: System) {
    this.systems.push(system);
    this.systems.sort((a, b) => a.priority - b.priority);
  }
  
  // Main loop
  async start(tickRate: number = 60) {
    this.running = true;
    const tickInterval = 1000 / tickRate;
    
    while (this.running) {
      const startTime = performance.now();
      
      // Run all systems
      for (const system of this.systems) {
        const entities = this.query(system.requiredComponents);
        await system.update(entities, tickInterval / 1000, this);
      }
      
      this.tick++;
      
      // Auto-save every 1000 ticks
      if (this.tick % 1000 === 0) {
        await this.saveWorld();
      }
      
      const elapsed = performance.now() - startTime;
      const sleepTime = Math.max(0, tickInterval - elapsed);
      await new Promise(r => setTimeout(r, sleepTime));
    }
  }
  
  stop() { this.running = false; }
  
  // Persistence
  async saveWorld() {
    const data = {
      tick: this.tick,
      entities: Array.from(this.entities.entries()).map(([id, e]) => ({
        id,
        name: e.name,
        components: Array.from(e.components.entries()),
        tags: Array.from(e.tags),
        parent: e.parent,
        children: e.children
      }))
    };
    
    await substrate.brain.remember(
      \`World save: \${data.entities.length} entities at tick \${this.tick}\`,
      'world_save',
      1.0,
      data
    );
  }
  
  async loadWorld(saveId: string) {
    const result = await substrate.brain.query(\`world_save:\${saveId}\`, 1);
    if (result.data?.memories?.[0]) {
      const data = result.data.memories[0].metadata;
      this.tick = data.tick;
      // Reconstruct entities...
    }
  }
}

// ===== SYSTEM INTERFACE =====
interface System {
  name: string;
  priority: number;
  requiredComponents: ComponentType[];
  update(entities: Entity[], deltaTime: number, world: WorldEngine): Promise<void>;
}

// ===== BUILT-IN SYSTEMS =====
const PhysicsSystem: System = {
  name: 'physics',
  priority: 10,
  requiredComponents: ['transform', 'physics'],
  async update(entities, dt, world) {
    for (const entity of entities) {
      const transform = entity.components.get('transform')!.data;
      const physics = entity.components.get('physics')!.data;
      
      // Apply gravity
      physics.velocity.y -= 9.81 * dt;
      
      // Integrate
      transform.position.x += physics.velocity.x * dt;
      transform.position.y += physics.velocity.y * dt;
      transform.position.z += physics.velocity.z * dt;
    }
  }
};

const AISystem: System = {
  name: 'ai',
  priority: 20,
  requiredComponents: ['transform', 'ai'],
  async update(entities, dt, world) {
    for (const entity of entities) {
      const ai = entity.components.get('ai')!.data;
      
      // Run AI behavior tree
      if (ai.behaviorTree) {
        const decision = await substrate.decode.intent(
          \`AI decision for \${entity.name}: \${ai.currentGoal}\`
        );
        ai.lastDecision = decision.data;
      }
    }
  }
};

const NetworkSystem: System = {
  name: 'network',
  priority: 100,
  requiredComponents: ['transform', 'network'],
  async update(entities, dt, world) {
    // Sync networked entities
    const updates = entities.map(e => ({
      id: e.id,
      transform: e.components.get('transform')!.data,
      owner: e.components.get('network')!.data.owner
    }));
    // Broadcast to connected clients...
  }
};

// ===== EXPORTS =====
export const worldEngine = new WorldEngine();
worldEngine.addSystem(PhysicsSystem);
worldEngine.addSystem(AISystem);
worldEngine.addSystem(NetworkSystem);`
  },
  {
    id: 'enterprise-agency-suite',
    name: 'Enterprise Agency Suite',
    description: 'Complete AI agency management with tasks, billing, analytics, and white-label deployment',
    icon: Server,
    category: 'system',
    difficulty: 'elite',
    estimatedTime: '5+ hours',
    features: ['Agency management', 'Task automation', 'Billing integration', 'Analytics dashboard', 'White-label', 'Multi-tenant'],
    code: `import { substrate } from './lib/substrate';

// Enterprise Agency Suite - Elite Template ($199)
// Complete agency platform with billing and analytics

interface Agency {
  id: string;
  name: string;
  owner: string;
  tier: 'starter' | 'professional' | 'enterprise';
  agents: AgentConfig[];
  billing: BillingConfig;
  usage: UsageMetrics;
}

interface AgentConfig {
  id: string;
  role: string;
  model: string;
  rateLimit: number;
  capabilities: string[];
}

interface BillingConfig {
  stripeCustomerId: string;
  subscription: string;
  usageBasedPricing: boolean;
  pricePerTask: number;
}

interface UsageMetrics {
  tasksCompleted: number;
  tokensUsed: number;
  apiCalls: number;
  costThisMonth: number;
}

class AgencyManager {
  private agencies: Map<string, Agency> = new Map();
  
  // Create agency
  async createAgency(config: {
    name: string;
    owner: string;
    tier: Agency['tier'];
  }): Promise<Agency> {
    const agency: Agency = {
      id: crypto.randomUUID(),
      name: config.name,
      owner: config.owner,
      tier: config.tier,
      agents: this.getDefaultAgents(config.tier),
      billing: {
        stripeCustomerId: '',
        subscription: '',
        usageBasedPricing: config.tier === 'enterprise',
        pricePerTask: this.getPricePerTask(config.tier)
      },
      usage: {
        tasksCompleted: 0,
        tokensUsed: 0,
        apiCalls: 0,
        costThisMonth: 0
      }
    };
    
    this.agencies.set(agency.id, agency);
    
    await substrate.brain.remember(
      \`Agency created: \${agency.name} (\${agency.tier})\`,
      'agency_event',
      1.0,
      { agencyId: agency.id, tier: agency.tier }
    );
    
    return agency;
  }
  
  // Execute task with billing
  async executeTask(agencyId: string, task: {
    type: string;
    input: any;
    agentId?: string;
  }) {
    const agency = this.agencies.get(agencyId);
    if (!agency) throw new Error('Agency not found');
    
    // Find best agent
    const agent = task.agentId 
      ? agency.agents.find(a => a.id === task.agentId)
      : this.selectBestAgent(agency, task.type);
    
    if (!agent) throw new Error('No suitable agent');
    
    // Execute
    const startTime = Date.now();
    const result = await substrate.decode.intent(
      \`Execute \${task.type}: \${JSON.stringify(task.input)}\`
    );
    const duration = Date.now() - startTime;
    
    // Track usage
    const tokensUsed = result.data?.tokensUsed || 100;
    agency.usage.tasksCompleted++;
    agency.usage.tokensUsed += tokensUsed;
    agency.usage.apiCalls++;
    agency.usage.costThisMonth += agency.billing.pricePerTask;
    
    // Log for analytics
    await substrate.brain.remember(
      \`Task completed: \${task.type} in \${duration}ms\`,
      'task_execution',
      result.data?.confidence || 0.8,
      {
        agencyId,
        agentId: agent.id,
        taskType: task.type,
        duration,
        tokensUsed,
        cost: agency.billing.pricePerTask
      }
    );
    
    return {
      result: result.data,
      metrics: {
        duration,
        tokensUsed,
        cost: agency.billing.pricePerTask
      }
    };
  }
  
  // Analytics
  async getAnalytics(agencyId: string, period: 'day' | 'week' | 'month') {
    const agency = this.agencies.get(agencyId);
    if (!agency) throw new Error('Agency not found');
    
    const results = await substrate.brain.query(
      \`task_execution agencyId:\${agencyId}\`,
      1000
    );
    
    // Aggregate metrics
    const tasks = results.data?.memories || [];
    const byAgent = new Map<string, number>();
    const byType = new Map<string, number>();
    let totalCost = 0;
    let totalDuration = 0;
    
    for (const task of tasks) {
      const meta = task.metadata;
      byAgent.set(meta.agentId, (byAgent.get(meta.agentId) || 0) + 1);
      byType.set(meta.taskType, (byType.get(meta.taskType) || 0) + 1);
      totalCost += meta.cost;
      totalDuration += meta.duration;
    }
    
    return {
      period,
      totalTasks: tasks.length,
      totalCost,
      avgDuration: totalDuration / tasks.length,
      tasksByAgent: Object.fromEntries(byAgent),
      tasksByType: Object.fromEntries(byType),
      currentUsage: agency.usage
    };
  }
  
  private getDefaultAgents(tier: Agency['tier']): AgentConfig[] {
    const base = [
      { id: 'researcher', role: 'Researcher', model: 'gpt-4', rateLimit: 100, capabilities: ['research', 'summarize'] },
      { id: 'writer', role: 'Writer', model: 'gpt-4', rateLimit: 100, capabilities: ['write', 'edit'] }
    ];
    
    if (tier === 'professional' || tier === 'enterprise') {
      base.push(
        { id: 'analyst', role: 'Analyst', model: 'gpt-4', rateLimit: 200, capabilities: ['analyze', 'report'] }
      );
    }
    
    if (tier === 'enterprise') {
      base.push(
        { id: 'strategist', role: 'Strategist', model: 'gpt-4', rateLimit: 500, capabilities: ['strategy', 'planning'] }
      );
    }
    
    return base;
  }
  
  private getPricePerTask(tier: Agency['tier']): number {
    switch (tier) {
      case 'starter': return 0.05;
      case 'professional': return 0.03;
      case 'enterprise': return 0.01;
    }
  }
  
  private selectBestAgent(agency: Agency, taskType: string): AgentConfig | undefined {
    return agency.agents.find(a => 
      a.capabilities.some(c => taskType.toLowerCase().includes(c))
    ) || agency.agents[0];
  }
}

export const agencyManager = new AgencyManager();`
  }
];

// Category counts helper
export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const template of TEMPLATES) {
    counts[template.category] = (counts[template.category] || 0) + 1;
  }
  return counts;
}

// Get template by ID
export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find(t => t.id === id);
}
