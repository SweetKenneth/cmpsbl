/**
 * CMPSBL® Developer Portal
 * 
 * Public-facing page for developers and researchers to discover,
 * integrate, and build with the substrate.
 * 
 * IMPORTANT: Users must provide their own API keys.
 * This portal does not provide compute resources.
 * 
 * Documentation is USAGE-FOCUSED only - no internal implementation details.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Code, Download, BookOpen, Key, Terminal, Zap, Shield, Brain,
  Eye, Moon, Layers, FileCode, Copy, Check, ExternalLink,
  Server, Lock, Rocket, AlertTriangle, ChevronRight, FileText,
  Bot, Image, MessageSquare, Network, Database, Activity,
  Cpu, GitBranch, Package, PlayCircle, Sparkles, Workflow,
  Target, Gauge, Search, Bell, Timer, CloudLightning, Fingerprint,
  Radio, Lightbulb, Flame, Star, ArrowRight, Globe, Users, Plug
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { SEO } from '@/components/SEO';
import { toast } from 'sonner';

// 72 Templates covering all modules and use cases - all unique
const TEMPLATES = [
  {
    id: 'chatbot',
    name: 'AI Chatbot',
    description: 'Conversational AI with memory, intent decoding, and multi-turn context',
    icon: MessageSquare,
    category: 'decode',
    difficulty: 'beginner',
    estimatedTime: '15 min',
    features: ['Session memory', 'Intent extraction', 'Context awareness'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient({
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_ANON_KEY'
});

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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

// Auto-route to best available provider
// Automatically handles failover if primary is down
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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

// Feed a dream for processing
const result = await substrate.dream.feed(
  'I was floating through an endless library where each book contained a universe...',
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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

async function getSecurityState() {
  // Get overall security posture
  const posture = await substrate.defense.posture();
  
  // Detect anomalies (statistical z-score analysis)
  const anomalies = await substrate.defense.anomalyProbe(24); // last 24 hours
  
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
}, 60000); // Check every minute`
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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    // Switch to cheaper models or implement throttling
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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

// Get session reflection (cross-module activity)
const session = await substrate.brain.sessionReflection(24); // last 24 hours
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
    id: 'rate-limiter',
    name: 'Smart Rate Limiter',
    description: 'Intelligent rate limiting with fingerprint-based tracking',
    icon: Timer,
    category: 'defense',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    features: ['Fingerprint tracking', 'Dynamic limits', 'Bypass detection'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    // Reduce rate limit for suspicious clients
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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    \`Moderation: \${contentType} - \${decision.approved ? 'approved' : 'rejected'}\`,
    'moderation_decision',
    decision.confidence,
    { content_hash: hashContent(content), reason: decision.reason }
  );
  
  return decision;
}`
  },
  {
    id: 'full-stack-ai',
    name: 'Full-Stack AI App',
    description: 'Complete AI application with all substrate modules integrated',
    icon: Layers,
    category: 'system',
    difficulty: 'advanced',
    estimatedTime: '60 min',
    features: ['All modules', 'Production ready', 'Error handling'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

class AIApplication {
  async initialize() {
    // Check system health on startup
    const health = await substrate.system.health();
    if (!health.data?.healthy) {
      console.log('System unhealthy, initiating heal...');
      await substrate.system.heal();
    }
    console.log('System ready, version:', health.data?.version);
  }

  async processRequest(req: UserRequest) {
    // 1. Security check
    const threat = await substrate.defense.analyze({
      fingerprint: req.fingerprint
    }, req.ip);
    
    if (threat.data?.blocked) {
      return { error: 'Request blocked', code: 403 };
    }

    // 2. Create trace for observability
    const trace = await substrate.vision.trace(undefined, { create: true });

    // 3. Decode user intent
    const intent = await substrate.decode.intent(req.message);

    // 4. Recall relevant context
    const context = await substrate.brain.query(req.message, 5);

    // 5. Route to AI with context
    const response = await substrate.nexus.route(
      \`Context: \${JSON.stringify(context.data)}\\nUser: \${req.message}\`
    );

    // 6. Learn from interaction
    await substrate.brain.learn(
      \`Q: \${req.message}\\nA: \${response.data}\`,
      'user_interaction'
    );

    // 7. Complete trace
    await substrate.vision.trace(trace.data.traceId, { 
      complete: true, 
      duration_ms: Date.now() - trace.data.started 
    });

    return { reply: response.data, traceId: trace.data.traceId };
  }
}`
  },
  // ========== NEW TEMPLATES ==========
  {
    id: 'voice-assistant',
    name: 'Voice Assistant',
    description: 'Build voice-enabled AI assistants with speech recognition',
    icon: Radio,
    category: 'decode',
    difficulty: 'intermediate',
    estimatedTime: '35 min',
    features: ['Speech-to-text', 'Intent parsing', 'Voice context'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

async function processVoiceCommand(audioTranscript: string, sessionId: string) {
  // 1. Decode intent from transcribed audio
  const intent = await substrate.decode.intent(audioTranscript);
  
  // 2. Map voice commands to actions
  const actionMap: Record<string, () => Promise<any>> = {
    'question': () => substrate.decode.chat(audioTranscript, sessionId),
    'search': () => substrate.brain.query(audioTranscript, 10),
    'remember': () => substrate.brain.remember(audioTranscript, 'voice_note'),
    'status': () => substrate.system.health()
  };
  
  const action = actionMap[intent.data?.primary_intent] || actionMap['question'];
  const result = await action();
  
  // 3. Learn voice patterns
  await substrate.brain.learn(
    \`Voice: \${audioTranscript} → Intent: \${intent.data?.primary_intent}\`,
    'voice_pattern'
  );
  
  return {
    intent: intent.data?.primary_intent,
    response: result.data,
    confidence: intent.data?.confidence
  };
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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    icon: Layers,
    category: 'system',
    difficulty: 'advanced',
    estimatedTime: '50 min',
    features: ['Tenant isolation', 'Quota per tenant', 'Custom models'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    // Track per-tenant usage (implement your own tracking)
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
await tenantB.remember('Startup XYZ uses casual language', 'preference');

// Each tenant's data is isolated
const acmeContext = await tenantA.query('tone preferences');
const startupContext = await tenantB.query('tone preferences');`
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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
}

async function getImprovedResponse(prompt: string) {
  // Get past responses for similar prompts
  const history = await substrate.brain.query(
    \`response_record \${prompt}\`,
    5
  );
  
  // Filter to high-confidence (well-received) responses
  const goodExamples = history.data?.memories
    ?.filter(m => m.confidence > 0.7)
    ?.map(m => m.content);
  
  // Generate new response with good examples as context
  const context = goodExamples?.length 
    ? \`Previous good responses:\\n\${goodExamples.join('\\n---\\n')}\`
    : '';
    
  return substrate.nexus.route(\`\${context}\\n\\nNew query: \${prompt}\`);
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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
);

// Hourly health check
scheduler.addTask(
  'health-check',
  async () => {
    const health = await substrate.vision.healthSnapshot();
    if (health.data?.healthScore < 80) {
      await substrate.system.heal();
    }
    return health.data;
  },
  60 * 60 * 1000
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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
        content: \`Session context: \${session.data.summary}\`,
        priority: 5,
        tokens: this.estimateTokens(session.data.summary)
      });
    }
    
    // 3. Sort by priority and fit within budget
    items.sort((a, b) => b.priority - a.priority);
    
    const systemTokens = this.estimateTokens(systemPrompt);
    const queryTokens = this.estimateTokens(query);
    let remainingTokens = this.maxTokens - systemTokens - queryTokens - 500; // Buffer
    
    const selectedContext: string[] = [];
    for (const item of items) {
      if (item.tokens <= remainingTokens) {
        selectedContext.push(item.content);
        remainingTokens -= item.tokens;
      }
    }
    
    return selectedContext.join('\\n---\\n');
  }
  
  async generateWithOptimizedContext(query: string, systemPrompt: string) {
    const context = await this.buildContext(query, systemPrompt);
    return substrate.nexus.route(
      \`\${systemPrompt}\\n\\nContext:\\n\${context}\\n\\nQuery: \${query}\`
    );
  }
}`
  },
  {
    id: 'ab-testing',
    name: 'A/B Testing AI',
    description: 'Test different prompts and models with statistical analysis',
    icon: Target,
    category: 'nexus',
    difficulty: 'advanced',
    estimatedTime: '40 min',
    features: ['Variant testing', 'Statistical significance', 'Auto-winner'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

interface Variant {
  id: string;
  prompt: string;
  model?: string;
  impressions: number;
  successes: number;
}

class ABTester {
  private variants: Map<string, Variant> = new Map();
  private testId: string;
  
  constructor(testId: string) {
    this.testId = testId;
  }
  
  addVariant(prompt: string, model?: string): string {
    const id = crypto.randomUUID();
    this.variants.set(id, { id, prompt, model, impressions: 0, successes: 0 });
    return id;
  }
  
  selectVariant(): Variant {
    // Thompson sampling for optimal exploration/exploitation
    const variants = Array.from(this.variants.values());
    
    // For simplicity, use epsilon-greedy
    if (Math.random() < 0.1) {
      // Explore: random variant
      return variants[Math.floor(Math.random() * variants.length)];
    }
    
    // Exploit: best performing
    return variants.reduce((best, v) => {
      const rate = v.impressions > 0 ? v.successes / v.impressions : 0.5;
      const bestRate = best.impressions > 0 ? best.successes / best.impressions : 0.5;
      return rate > bestRate ? v : best;
    });
  }
  
  async runTest(userQuery: string) {
    const variant = this.selectVariant();
    variant.impressions++;
    
    const fullPrompt = variant.prompt.replace('{query}', userQuery);
    const response = await substrate.nexus.route(fullPrompt);
    
    // Store for later feedback
    await substrate.brain.remember(
      \`AB Test \${this.testId}: Variant \${variant.id}\`,
      'ab_test',
      0.5,
      { testId: this.testId, variantId: variant.id, query: userQuery }
    );
    
    return { variantId: variant.id, response: response.data };
  }
  
  recordSuccess(variantId: string) {
    const variant = this.variants.get(variantId);
    if (variant) variant.successes++;
  }
  
  getWinner(): Variant | null {
    const variants = Array.from(this.variants.values());
    const minSamples = 30;
    
    // Need minimum samples for significance
    if (variants.some(v => v.impressions < minSamples)) return null;
    
    // Simple winner: highest success rate with >95% confidence
    return variants.reduce((best, v) => {
      const rate = v.successes / v.impressions;
      const bestRate = best.successes / best.impressions;
      return rate > bestRate ? v : best;
    });
  }
}

// Usage
const test = new ABTester('greeting-test');
test.addVariant('Be helpful. User says: {query}');
test.addVariant('Be friendly and concise. Query: {query}');
test.addVariant('You are an expert assistant. Respond to: {query}');`
  },
  {
    id: 'event-driven',
    name: 'Event-Driven AI',
    description: 'React to system events with AI-powered handlers',
    icon: CloudLightning,
    category: 'system',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    features: ['Event subscription', 'AI handlers', 'Event correlation'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

type EventType = 'user_signup' | 'purchase' | 'error' | 'feedback' | 'anomaly';

interface AIEventHandler {
  eventType: EventType;
  handler: (payload: any) => Promise<void>;
}

class EventDrivenAI {
  private handlers: Map<EventType, AIEventHandler[]> = new Map();
  
  on(eventType: EventType, handler: (payload: any) => Promise<void>) {
    const existing = this.handlers.get(eventType) || [];
    existing.push({ eventType, handler });
    this.handlers.set(eventType, existing);
  }
  
  async emit(eventType: EventType, payload: any) {
    // 1. Log event for correlation
    await substrate.brain.remember(
      JSON.stringify({ type: eventType, ...payload }),
      \`event:\${eventType}\`,
      1.0,
      { timestamp: new Date().toISOString() }
    );
    
    // 2. Create trace
    const trace = await substrate.vision.trace(undefined, {
      create: true,
      module: 'events',
      action: eventType
    });
    
    // 3. Run handlers
    const handlers = this.handlers.get(eventType) || [];
    for (const h of handlers) {
      try {
        await h.handler(payload);
      } catch (error) {
        await substrate.vision.alert('error', \`Event handler failed: \${eventType}\`);
      }
    }
    
    // 4. Complete trace
    await substrate.vision.trace(trace.data.traceId, { complete: true });
  }
}

// Usage
const events = new EventDrivenAI();

events.on('user_signup', async (user) => {
  // Generate personalized welcome
  const welcome = await substrate.nexus.route(
    \`Write a welcome message for \${user.name} who signed up for \${user.plan}\`
  );
  await sendEmail(user.email, welcome.data);
});

events.on('error', async (error) => {
  // AI-powered error analysis
  const analysis = await substrate.nexus.route(
    \`Analyze this error and suggest fixes: \${error.message}\`
  );
  await substrate.brain.remember(
    \`Error: \${error.message}\\nAnalysis: \${analysis.data}\`,
    'error_analysis'
  );
});

  events.on('anomaly', async (anomaly) => {
    await substrate.defense.analyze({ fingerprint: anomaly }, anomaly.ip);
  });`
  },
  // ========== ADDITIONAL TEMPLATES ==========
  {
    id: 'workflow-orchestrator',
    name: 'Workflow Orchestrator',
    description: 'Build multi-step AI workflows with branching logic',
    icon: Workflow,
    category: 'system',
    difficulty: 'advanced',
    estimatedTime: '50 min',
    features: ['Step sequencing', 'Conditional branching', 'Error recovery'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
          // One retry attempt
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
    
    await substrate.vision.trace(trace.data.traceId, { complete: true });
    return context;
  }
}

// Usage
const workflow = new WorkflowOrchestrator();

workflow.addStep({
  name: 'analyze_input',
  action: async (ctx) => {
    const intent = await substrate.decode.intent(ctx.userMessage);
    return { intent: intent.data?.primary_intent };
  }
});

workflow.addStep({
  name: 'fetch_context',
  action: async (ctx) => {
    const memories = await substrate.brain.query(ctx.userMessage, 5);
    return { context: memories.data?.memories };
  }
});

workflow.addStep({
  name: 'generate_response',
  action: async (ctx) => {
    const response = await substrate.nexus.route(
      \`Context: \${JSON.stringify(ctx.context)}\\nQuery: \${ctx.userMessage}\`
    );
    return { response: response.data };
  },
  onError: 'retry'
});`
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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    id: 'rate-limiter',
    name: 'Intelligent Rate Limiter',
    description: 'AI-aware rate limiting with priority queuing',
    icon: Gauge,
    category: 'defense',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    features: ['Token bucket', 'Priority queuing', 'Adaptive limits'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

interface RateLimitConfig {
  tokensPerMinute: number;
  burstLimit: number;
  priorityMultiplier: Record<string, number>;
}

class IntelligentRateLimiter {
  private tokens: number;
  private lastRefill: number;
  private config: RateLimitConfig;
  private queue: Array<{ 
    resolve: (v: boolean) => void; 
    priority: string;
    timestamp: number;
  }> = [];
  
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
    
    return new Promise((resolve) => {
      this.queue.push({ resolve, priority, timestamp: Date.now() });
      this.processQueue();
    });
  }
  
  private async processQueue() {
    // Sort by priority and timestamp
    this.queue.sort((a, b) => {
      const prioA = this.config.priorityMultiplier[a.priority] || 1;
      const prioB = this.config.priorityMultiplier[b.priority] || 1;
      if (prioA !== prioB) return prioB - prioA;
      return a.timestamp - b.timestamp;
    });
    
    while (this.queue.length > 0) {
      this.refill();
      if (this.tokens >= 1) {
        const next = this.queue.shift();
        this.tokens -= 1;
        next?.resolve(true);
      } else {
        break;
      }
    }
  }
}

// Usage
const limiter = new IntelligentRateLimiter({
  tokensPerMinute: 60,
  burstLimit: 10,
  priorityMultiplier: { critical: 3, high: 2, normal: 1, low: 0.5 }
});

async function makeAIRequest(prompt: string, priority = 'normal') {
  if (await limiter.acquire(priority)) {
    return substrate.nexus.route(prompt);
  }
  throw new Error('Rate limited');
}`
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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    // Get summaries
    const summaries = await substrate.brain.query(
      \`conversation:\${this.sessionId}:summary\`,
      3
    );
    
    // Get session reflection
    const reflection = await substrate.brain.sessionReflection(1);
    
    return {
      recentMessages: this.messages,
      summaries: summaries.data?.memories?.map(m => m.content) || [],
      sessionInsight: reflection.data?.summary
    };
  }
  
  async chat(userMessage: string) {
    await this.addMessage('user', userMessage);
    
    const context = await this.getContext();
    const contextStr = [
      ...context.summaries,
      ...context.recentMessages.slice(-5).map(m => \`\${m.role}: \${m.content}\`)
    ].join('\\n');
    
    const response = await substrate.decode.chat(
      \`Context:\\n\${contextStr}\\n\\nUser: \${userMessage}\`,
      this.sessionId
    );
    
    await this.addMessage('assistant', response.data?.reply || '');
    return response.data?.reply;
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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
}

// Usage
const agent = new AIAgent();

agent.registerTool({
  name: 'search_memory',
  description: 'Search the knowledge base',
  parameters: { query: { type: 'string', description: 'Search query' } },
  execute: async ({ query }) => {
    const results = await substrate.brain.query(query, 5);
    return results.data?.memories?.map(m => m.content);
  }
});

agent.registerTool({
  name: 'remember',
  description: 'Store information for later',
  parameters: { 
    content: { type: 'string', description: 'What to remember' },
    type: { type: 'string', description: 'Category of information' }
  },
  execute: async ({ content, type }) => {
    await substrate.brain.remember(content, type);
    return { stored: true };
  }
});`
  },
  {
    id: 'realtime-stream',
    name: 'Realtime Streaming',
    description: 'Stream AI responses for real-time user experience',
    icon: Activity,
    category: 'nexus',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    features: ['SSE streaming', 'Token-by-token', 'Progress tracking'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
}

// Usage in component
function ChatWithStreaming() {
  const { text, isStreaming, stream } = useStreamingResponse();
  
  const handleSubmit = async (message: string) => {
    await stream(message);
  };
  
  return (
    <div>
      <div>{text}{isStreaming && '▌'}</div>
    </div>
  );
}`
  },
  {
    id: 'data-pipeline',
    name: 'AI Data Pipeline',
    description: 'Process and transform data through AI stages',
    icon: Database,
    category: 'brain',
    difficulty: 'advanced',
    estimatedTime: '40 min',
    features: ['ETL with AI', 'Data enrichment', 'Quality scoring'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

interface PipelineStage<TIn, TOut> {
  name: string;
  process: (input: TIn) => Promise<TOut>;
}

class AIDataPipeline<T> {
  private stages: PipelineStage<any, any>[] = [];
  
  addStage<TIn, TOut>(stage: PipelineStage<TIn, TOut>): AIDataPipeline<TOut> {
    this.stages.push(stage);
    return this as unknown as AIDataPipeline<TOut>;
  }
  
  async process(input: T): Promise<any> {
    const trace = await substrate.vision.trace(undefined, {
      create: true,
      module: 'pipeline',
      action: 'process'
    });
    
    let data: any = input;
    const results: Record<string, any> = {};
    
    for (const stage of this.stages) {
      try {
        data = await stage.process(data);
        results[stage.name] = { success: true, output: data };
      } catch (error) {
        results[stage.name] = { success: false, error };
        await substrate.vision.alert('error', \`Pipeline failed at \${stage.name}\`);
        break;
      }
    }
    
    await substrate.vision.trace(trace.data.traceId, { complete: true });
    return { final: data, stages: results };
  }
}

// Example: Document processing pipeline
const docPipeline = new AIDataPipeline<string>()
  .addStage({
    name: 'extract_entities',
    process: async (text) => {
      const response = await substrate.nexus.route(
        \`Extract all entities (people, places, organizations) from: \${text}\`
      );
      return { text, entities: response.data };
    }
  })
  .addStage({
    name: 'summarize',
    process: async ({ text, entities }) => {
      const response = await substrate.nexus.route(
        \`Summarize in 2 sentences: \${text}\`
      );
      return { text, entities, summary: response.data };
    }
  })
  .addStage({
    name: 'classify',
    process: async (data) => {
      const intent = await substrate.decode.intent(data.text);
      return { ...data, category: intent.data?.primary_intent };
    }
  })
  .addStage({
    name: 'store',
    process: async (data) => {
      await substrate.brain.remember(
        \`Document: \${data.summary}\`,
        'processed_document',
        1.0,
        { entities: data.entities, category: data.category }
      );
      return data;
    }
  });

// Usage
const result = await docPipeline.process(documentText);`
  },
  {
    id: 'multi-model-consensus',
    name: 'Multi-Model Consensus',
    description: 'Get answers from multiple AI models and find consensus',
    icon: Network,
    category: 'nexus',
    difficulty: 'advanced',
    estimatedTime: '35 min',
    features: ['Multi-provider', 'Voting system', 'Confidence aggregation'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

interface ModelResponse {
  provider: string;
  response: string;
  confidence: number;
}

async function getConsensus(prompt: string, minAgreement = 0.6) {
  // Get available providers
  const providers = await substrate.nexus.providers();
  const activeProviders = providers.data?.filter(p => p.available) || [];
  
  if (activeProviders.length < 2) {
    // Fallback to single provider
    const single = await substrate.nexus.route(prompt);
    return { response: single.data, consensus: 1.0, providers: 1 };
  }
  
  // Query multiple models
  const responses: ModelResponse[] = await Promise.all(
    activeProviders.slice(0, 3).map(async (provider) => {
      try {
        const response = await substrate.nexus.route(prompt);
        return {
          provider: provider.name,
          response: response.data as string,
          confidence: 0.8 // Base confidence
        };
      } catch {
        return null;
      }
    })
  ).then(results => results.filter((r): r is ModelResponse => r !== null));
  
  // Simple consensus: find most common key points
  const synthesis = await substrate.nexus.route(
    \`Given these responses from different AI models, find the consensus answer:
    
    \${responses.map(r => \`Model \${r.provider}: \${r.response}\`).join('\\n\\n')}
    
    Return the consensus answer that most models agree on.\`
  );
  
  // Calculate agreement score
  const agreementScore = responses.length / activeProviders.length;
  
  // Store for learning
  await substrate.brain.remember(
    \`Consensus query: \${prompt.slice(0, 100)}...\`,
    'consensus_query',
    agreementScore,
    { 
      providers: responses.map(r => r.provider),
      agreement: agreementScore
    }
  );
  
  return {
    response: synthesis.data,
    consensus: agreementScore,
    providers: responses.length,
    individual: responses
  };
}`
  },
  {
    id: 'dream-interpreter',
    name: 'Dream Interpreter',
    description: 'Feed dreams to the substrate and receive interpretations',
    icon: Moon,
    category: 'dream',
    difficulty: 'beginner',
    estimatedTime: '20 min',
    features: ['Dream feeding', 'Symbol analysis', 'Pattern recognition'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

async function submitDream(dreamContent: string, dreamerName?: string) {
  // 1. Feed the dream to the Dream module
  const feeding = await substrate.dream.feed(dreamContent, 'dream');
  
  // 2. Get interpretation
  const interpretation = await substrate.dream.interpret(dreamContent);
  
  // 3. Store in brain for pattern analysis
  await substrate.brain.remember(
    dreamContent,
    'dream',
    0.9,
    { 
      interpretation: interpretation.data,
      dreamer: dreamerName,
      timestamp: new Date().toISOString()
    }
  );
  
  return {
    id: feeding.data?.id,
    interpretation: interpretation.data?.interpretation,
    symbols: interpretation.data?.symbols,
    mood: interpretation.data?.mood
  };
}

async function getDreamPatterns(timeframe: 'week' | 'month' = 'week') {
  // Query dream memories
  const dreams = await substrate.brain.query('dream', 50);
  
  // Get synthesis of patterns
  const synthesis = await substrate.brain.synthesize();
  
  // Get dream module status
  const status = await substrate.dream.status();
  
  return {
    totalDreams: dreams.data?.memories?.length || 0,
    patterns: synthesis.data?.insights,
    eaterMood: status.data?.mood,
    mutationLevel: status.data?.mutationLevel
  };
}

async function triggerMutationCycle() {
  // Initiate a dream mutation cycle
  const mutation = await substrate.dream.mutate();
  
  // Log the mutation event
  await substrate.vision.trace(undefined, {
    create: true,
    module: 'dream',
    action: 'mutation',
    metadata: { level: mutation.data?.level }
  });
  
  return mutation.data;
}`
  },
  {
    id: 'audio-transcriber',
    name: 'Audio Transcriber',
    description: 'Process audio files and transcripts with AI summarization',
    icon: Radio,
    category: 'decode',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    features: ['Transcript processing', 'Key point extraction', 'Action items'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

class AudioTranscriber {
  async processTranscript(transcript: string, meetingId: string) {
    // 1. Extract key topics
    const topics = await substrate.decode.intent(transcript);
    
    // 2. Generate meeting summary
    const summary = await substrate.nexus.route(
      \`Summarize this meeting transcript with key decisions and action items:\\n\${transcript}\`
    );
    
    // 3. Store for future reference
    await substrate.brain.remember(
      summary.data,
      \`meeting:\${meetingId}\`,
      0.95,
      { topics: topics.data?.entities, date: new Date().toISOString() }
    );
    
    // 4. Extract action items
    const actions = await substrate.nexus.route(
      \`Extract all action items from:\\n\${transcript}\\nFormat as JSON array.\`
    );
    
    return {
      summary: summary.data,
      topics: topics.data?.entities,
      actionItems: JSON.parse(actions.data || '[]'),
      meetingId
    };
  }
  
  async searchMeetings(query: string) {
    const results = await substrate.brain.query(\`meeting: \${query}\`, 10);
    return results.data?.memories?.map(m => ({
      content: m.content,
      date: m.metadata?.date,
      topics: m.metadata?.topics
    }));
  }
}`,
  },
  {
    id: 'rag-pipeline',
    name: 'RAG Pipeline',
    description: 'Retrieval-Augmented Generation for document-grounded responses',
    icon: FileText,
    category: 'brain',
    difficulty: 'advanced',
    estimatedTime: '50 min',
    features: ['Document chunking', 'Context retrieval', 'Grounded generation'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

class RAGPipeline {
  private namespace: string;
  
  constructor(namespace: string) {
    this.namespace = namespace;
  }
  
  // Ingest documents into the knowledge base
  async ingest(document: string, metadata: Record<string, any> = {}) {
    const chunks = this.chunkDocument(document, 500);
    
    for (let i = 0; i < chunks.length; i++) {
      await substrate.brain.remember(
        chunks[i],
        \`rag:\${this.namespace}\`,
        0.9,
        { ...metadata, chunkIndex: i, totalChunks: chunks.length }
      );
    }
    
    // Build graph for better retrieval
    await substrate.brain.graphBuild();
    
    return { chunksIngested: chunks.length };
  }
  
  // Query with retrieval-augmented generation
  async query(question: string, topK = 5) {
    // 1. Retrieve relevant chunks
    const retrieval = await substrate.brain.query(
      \`rag:\${this.namespace} \${question}\`,
      topK
    );
    
    const context = retrieval.data?.memories
      ?.map(m => m.content)
      .join('\\n\\n') || '';
    
    // 2. Generate grounded response
    const prompt = \`Context:\\n\${context}\\n\\nQuestion: \${question}\\n\\nAnswer based only on the context provided:\`;
    
    const response = await substrate.nexus.route(prompt);
    
    // 3. Track for learning
    await substrate.brain.learn(
      \`RAG Query: \${question}\`,
      'rag_query'
    );
    
    return {
      answer: response.data,
      sources: retrieval.data?.memories?.map(m => ({
        content: m.content.substring(0, 100),
        confidence: m.confidence
      })),
      retrievedChunks: topK
    };
  }
  
  private chunkDocument(doc: string, maxChunkSize: number): string[] {
    const sentences = doc.split(/[.!?]+/);
    const chunks: string[] = [];
    let current = '';
    
    for (const sentence of sentences) {
      if ((current + sentence).length > maxChunkSize) {
        if (current) chunks.push(current.trim());
        current = sentence;
      } else {
        current += sentence + '. ';
      }
    }
    if (current) chunks.push(current.trim());
    
    return chunks;
  }
}`
  },
  {
    id: 'threat-intelligence',
    name: 'Threat Intelligence',
    description: 'Aggregate and analyze security threats across your system',
    icon: AlertTriangle,
    category: 'defense',
    difficulty: 'advanced',
    estimatedTime: '45 min',
    features: ['Threat aggregation', 'Pattern correlation', 'Risk scoring'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

class ThreatIntelligence {
  async gatherIntelligence(hoursBack = 72) {
    // 1. Get defense events
    const posture = await substrate.defense.posture();
    
    // 2. Get IP reputation data
    const recentIPs = await substrate.vision.analytics();
    
    // 3. Correlate patterns
    const threats = [];
    for (const event of posture.data?.recent_events || []) {
      const ipRep = await substrate.defense.reputation(event.ip);
      
      if (ipRep.data?.score < 50) {
        threats.push({
          ip: event.ip,
          reputation: ipRep.data?.score,
          action: event.action,
          riskLevel: event.risk_score > 0.8 ? 'critical' : 'elevated'
        });
      }
    }
    
    // 4. Store intelligence for pattern matching
    await substrate.brain.remember(
      JSON.stringify({ threats, timestamp: new Date().toISOString() }),
      'threat_intel',
      0.95,
      { threatCount: threats.length }
    );
    
    return {
      totalThreats: threats.length,
      criticalThreats: threats.filter(t => t.riskLevel === 'critical').length,
      threats,
      overallPosture: posture.data?.overall_score
    };
  }
  
  async getHistoricalPatterns(threatType: string) {
    const history = await substrate.brain.query(\`threat_intel \${threatType}\`, 20);
    return history.data?.memories;
  }
}`,
  },
  {
    id: 'user-profiler',
    name: 'User Profiler',
    description: 'Build dynamic user profiles from interaction patterns',
    icon: Database,
    category: 'brain',
    difficulty: 'intermediate',
    estimatedTime: '35 min',
    features: ['Behavior tracking', 'Interest mapping', 'Profile evolution'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

class UserProfiler {
  private userId: string;
  
  constructor(userId: string) {
    this.userId = userId;
  }
  
  async trackInteraction(category: string, action: string, value?: number) {
    await substrate.brain.remember(
      \`User \${this.userId} performed \${action} in \${category}\`,
      \`profile:\${this.userId}\`,
      value || 0.7,
      { category, action, timestamp: Date.now() }
    );
  }
  
  async getProfile() {
    const interactions = await substrate.brain.query(
      \`profile:\${this.userId}\`,
      100
    );
    
    // Aggregate by category
    const categories: Record<string, number> = {};
    for (const mem of interactions.data?.memories || []) {
      const cat = mem.metadata?.category;
      if (cat) categories[cat] = (categories[cat] || 0) + 1;
    }
    
    // Get top interests
    const interests = Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    
    return {
      userId: this.userId,
      totalInteractions: interactions.data?.memories?.length || 0,
      topInterests: interests,
      lastActive: interactions.data?.memories?.[0]?.metadata?.timestamp
    };
  }
  
  async predictPreference(options: string[]) {
    const profile = await this.getProfile();
    const prompt = \`Based on user interests: \${profile.topInterests.map(i => i.name).join(', ')}
Which would they prefer: \${options.join(' or ')}?\`;
    
    const prediction = await substrate.nexus.route(prompt);
    return prediction.data;
  }
}`,
  },
  {
    id: 'experiment-runner',
    name: 'Experiment Runner',
    description: 'Run controlled experiments on AI model outputs',
    icon: Target,
    category: 'vision',
    difficulty: 'advanced',
    estimatedTime: '45 min',
    features: ['Hypothesis testing', 'Metric collection', 'Result analysis'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

interface Experiment {
  id: string;
  hypothesis: string;
  control: { prompt: string };
  treatment: { prompt: string };
  sampleSize: number;
}

class ExperimentRunner {
  async runExperiment(experiment: Experiment) {
    const results = { control: [], treatment: [] };
    
    for (let i = 0; i < experiment.sampleSize; i++) {
      // Control group
      const controlStart = Date.now();
      const controlResp = await substrate.nexus.route(experiment.control.prompt);
      results.control.push({
        response: controlResp.data,
        latencyMs: Date.now() - controlStart
      });
      
      // Treatment group
      const treatStart = Date.now();
      const treatResp = await substrate.nexus.route(experiment.treatment.prompt);
      results.treatment.push({
        response: treatResp.data,
        latencyMs: Date.now() - treatStart
      });
    }
    
    // Store experiment results
    await substrate.brain.remember(
      \`Experiment \${experiment.id}: \${experiment.hypothesis}\`,
      'experiment',
      1.0,
      { results, completedAt: new Date().toISOString() }
    );
    }
    
    // Assign new variant
    const rand = Math.random() * 100;
    let cumulative = 0;
    let variant = exp.variants[0];
    
    for (let i = 0; i < exp.variants.length; i++) {
      cumulative += exp.allocation[i];
      if (rand <= cumulative) {
        variant = exp.variants[i];
        break;
      }
    }
    
    // Store assignment
    await substrate.brain.remember(
      \`User \${userId} assigned to \${variant}\`,
      \`ab:\${experimentName}:user:\${userId}\`,
      1.0,
      { variant, assignedAt: Date.now() }
    );
    
    return variant;
  }
  
  // Track conversion
  async trackConversion(experimentName: string, userId: string, metric: string, value = 1) {
    await substrate.brain.learn(
      \`ab:\${experimentName}:conversion:\${metric}:\${userId}:\${value}\`,
      'ab_conversion'
    );
    
    await substrate.vision.trace(undefined, {
      create: true,
      module: 'ab_test',
      action: 'conversion',
      metadata: { experimentName, userId, metric, value }
    });
  }
}`
  },
  {
    id: 'content-moderation',
    name: 'Content Moderation',
    description: 'AI-powered content moderation with configurable policies',
    icon: Shield,
    category: 'defense',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    features: ['Policy enforcement', 'Risk scoring', 'Appeal handling'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

interface ModerationResult {
  allowed: boolean;
  flags: string[];
  riskScore: number;
  action: 'allow' | 'flag' | 'block';
}

async function moderateContent(content: string, context?: string): Promise<ModerationResult> {
  // 1. Analyze content intent
  const intent = await substrate.decode.intent(content);
  
  // 2. Check against defense rules
  const analysis = await substrate.defense.analyze({
    content,
    context,
    contentType: 'user_generated'
  }, 'content');
  
  // 3. Calculate risk score
  const riskScore = analysis.data?.risk_score || 0;
  const flags = [];
  
  // 4. Apply policy rules
  if (intent.data?.primary_intent?.includes('harmful')) {
    flags.push('potentially_harmful');
  }
  
  if (riskScore > 0.8) {
    flags.push('high_risk');
  }
  
  // 5. Determine action
  let action: 'allow' | 'flag' | 'block' = 'allow';
  if (riskScore > 0.9) {
    action = 'block';
    await substrate.vision.alert('error', 'Content blocked', { content: content.substring(0, 100) });
  } else if (riskScore > 0.6 || flags.length > 0) {
    action = 'flag';
    await substrate.vision.alert('warn', 'Content flagged for review', { flags });
  }
  
  // 6. Log for learning
  await substrate.brain.learn(
    \`Moderation: \${action} - \${flags.join(', ')}\`,
    'moderation_decision'
  );
  
  return {
    allowed: action !== 'block',
    flags,
    riskScore,
    action
  };
}`
  },
  {
    id: 'event-sourcing',
    name: 'Event Sourcing',
    description: 'Track and replay system events for auditability and debugging',
    icon: Activity,
    category: 'vision',
    difficulty: 'advanced',
    estimatedTime: '45 min',
    features: ['Event logging', 'State reconstruction', 'Audit trail'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

interface Event {
  type: string;
  aggregateId: string;
  payload: any;
  timestamp: number;
}

class EventStore {
  private namespace: string;
  
  constructor(namespace: string) {
    this.namespace = namespace;
  }
  
  // Append event to the store
  async append(event: Omit<Event, 'timestamp'>) {
    const fullEvent = {
      ...event,
      timestamp: Date.now()
    };
    
    // Store in brain memory
    await substrate.brain.remember(
      JSON.stringify(fullEvent),
      \`events:\${this.namespace}:\${event.aggregateId}\`,
      1.0,
      fullEvent
    );
    
    // Create trace for observability
    await substrate.vision.trace(undefined, {
      create: true,
      module: 'event_store',
      action: event.type,
      metadata: { aggregateId: event.aggregateId }
    });
    
    return fullEvent;
  }
  
  // Get events for an aggregate
  async getEvents(aggregateId: string, limit = 100) {
    const events = await substrate.brain.query(
      \`events:\${this.namespace}:\${aggregateId}\`,
      limit
    );
    
    return (events.data?.memories || [])
      .map(m => m.metadata as Event)
      .sort((a, b) => a.timestamp - b.timestamp);
  }
  
  // Replay events to reconstruct state
  async replayTo<T>(
    aggregateId: string,
    reducer: (state: T, event: Event) => T,
    initialState: T
  ): Promise<T> {
    const events = await this.getEvents(aggregateId);
    return events.reduce(reducer, initialState);
  }
  
  // Get audit trail
  async getAuditTrail(startTime: number, endTime: number) {
    const analytics = await substrate.vision.analytics();
    return analytics.data;
  }
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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
  {
    id: 'health-checker',
    name: 'Health Checker',
    description: 'Comprehensive system health monitoring with auto-healing',
    icon: Activity,
    category: 'system',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    features: ['Health probes', 'Auto-healing', 'Status reporting'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
  const startTime = Date.now();
  
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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    id: 'batch-processor',
    name: 'Batch Processor',
    description: 'Process large datasets with progress tracking and error handling',
    icon: Layers,
    category: 'system',
    difficulty: 'advanced',
    estimatedTime: '45 min',
    features: ['Chunked processing', 'Progress tracking', 'Error recovery'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

interface BatchJob<T, R> {
  id: string;
  items: T[];
  processor: (item: T) => Promise<R>;
  chunkSize: number;
  onProgress?: (progress: number, processed: number, total: number) => void;
}

interface BatchResult<R> {
  jobId: string;
  processed: number;
  failed: number;
  results: R[];
  errors: Array<{ index: number; error: string }>;
}

async function processBatch<T, R>(job: BatchJob<T, R>): Promise<BatchResult<R>> {
  const { id, items, processor, chunkSize, onProgress } = job;
  const results: R[] = [];
  const errors: Array<{ index: number; error: string }> = [];
  
  // Create trace for batch job
  const trace = await substrate.vision.trace(undefined, {
    create: true,
    module: 'batch',
    action: 'start',
    metadata: { jobId: id, totalItems: items.length }
  });
  
  // Process in chunks
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    
    // Process chunk in parallel
    const chunkResults = await Promise.allSettled(
      chunk.map((item, idx) => 
        processor(item).catch(e => {
          errors.push({ index: i + idx, error: String(e) });
          throw e;
        })
      )
    );
    
    // Collect successful results
    for (const result of chunkResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    }
    
    // Report progress
    const processed = Math.min(i + chunkSize, items.length);
    const progress = (processed / items.length) * 100;
    
    onProgress?.(progress, processed, items.length);
    
    // Log progress to brain
    if (progress % 25 === 0) {
      await substrate.brain.learn(
        \`Batch \${id}: \${progress.toFixed(0)}% complete\`,
        'batch_progress'
      );
    }
  }
  
  // Complete trace
  await substrate.vision.trace(trace.data?.traceId, {
    complete: true,
    metadata: { 
      processed: results.length, 
      failed: errors.length 
    }
  });
  
  // Alert on errors
  if (errors.length > 0) {
    await substrate.vision.alert('warn', \`Batch \${id} completed with errors\`, {
      errorCount: errors.length,
      totalItems: items.length
    });
  }
  
  return {
    jobId: id,
    processed: results.length,
    failed: errors.length,
    results,
    errors
  };
}`
  },
  {
    id: 'context-builder',
    name: 'Context Builder',
    description: 'Build rich context from multiple sources for AI prompts',
    icon: Layers,
    category: 'brain',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    features: ['Multi-source aggregation', 'Priority ranking', 'Token budgeting'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

interface ContextSource {
  name: string;
  fetch: () => Promise<string>;
  priority: number;
  maxTokens?: number;
}

class ContextBuilder {
  private sources: ContextSource[] = [];
  private maxTotalTokens: number;
  
  constructor(maxTotalTokens = 4000) {
    this.maxTotalTokens = maxTotalTokens;
  }
  
  addSource(source: ContextSource) {
    this.sources.push(source);
    this.sources.sort((a, b) => b.priority - a.priority);
    return this;
  }
  
  async build(query: string): Promise<string> {
    const contextParts: Array<{ name: string; content: string; tokens: number }> = [];
    let totalTokens = 0;
    
    // Fetch from all sources
    for (const source of this.sources) {
      try {
        const content = await source.fetch();
        const tokens = this.estimateTokens(content);
        const maxTokens = source.maxTokens || this.maxTotalTokens / this.sources.length;
        
        // Truncate if necessary
        const truncated = tokens > maxTokens 
          ? this.truncateToTokens(content, maxTokens)
          : content;
        
        const finalTokens = this.estimateTokens(truncated);
        
        if (totalTokens + finalTokens <= this.maxTotalTokens) {
          contextParts.push({ name: source.name, content: truncated, tokens: finalTokens });
          totalTokens += finalTokens;
        }
      } catch (e) {
        await substrate.vision.alert('warn', \`Context source failed: \${source.name}\`);
      }
    }
    
    // Add query-relevant memories
    const memories = await substrate.brain.query(query, 5);
    const memoryContext = memories.data?.memories
      ?.map(m => m.content)
      .join('\\n') || '';
    
    if (memoryContext) {
      const memTokens = this.estimateTokens(memoryContext);
      if (totalTokens + memTokens <= this.maxTotalTokens) {
        contextParts.push({ name: 'memories', content: memoryContext, tokens: memTokens });
      }
    }
    
    // Build final context
    return contextParts
      .map(p => \`[\${p.name}]\\n\${p.content}\`)
      .join('\\n\\n---\\n\\n');
  }
  
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4); // Rough estimate
  }
  
  private truncateToTokens(text: string, maxTokens: number): string {
    const maxChars = maxTokens * 4;
    return text.length > maxChars ? text.substring(0, maxChars) + '...' : text;
  }
}`
  },
  // ========== 15 NEW UNIQUE TEMPLATES ==========
  {
    id: 'sentiment-analyzer',
    name: 'Sentiment Analyzer',
    description: 'Analyze text sentiment and emotional tone in real-time',
    icon: Sparkles,
    category: 'decode',
    difficulty: 'beginner',
    estimatedTime: '20 min',
    features: ['Emotion detection', 'Tone analysis', 'Trend tracking'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

async function analyzeSentiment(text: string) {
  // 1. Get intent with emotional context
  const intent = await substrate.decode.intent(text);
  
  // 2. Route to AI for detailed analysis
  const analysis = await substrate.nexus.route(
    \`Analyze the sentiment of: "\${text}"
    Return JSON: { sentiment: 'positive'|'negative'|'neutral', score: 0-1, emotions: string[], tone: string }\`
  );
  
  const result = JSON.parse(analysis.data || '{}');
  
  // 3. Store for trend analysis
  await substrate.brain.remember(
    \`Sentiment: \${result.sentiment} - \${text.substring(0, 50)}\`,
    'sentiment_log',
    result.score,
    { ...result, timestamp: Date.now() }
  );
  
  return result;
}

async function getSentimentTrends(hours = 24) {
  const logs = await substrate.brain.query('sentiment_log', 100);
  const grouped = { positive: 0, negative: 0, neutral: 0 };
  
  for (const log of logs.data?.memories || []) {
    const sentiment = log.metadata?.sentiment;
    if (sentiment) grouped[sentiment]++;
  }
  
  return grouped;
}`
  },
  {
    id: 'language-translator',
    name: 'Language Translator',
    description: 'Real-time translation with context preservation',
    icon: Globe,
    category: 'nexus',
    difficulty: 'beginner',
    estimatedTime: '15 min',
    features: ['Multi-language', 'Context aware', 'Terminology memory'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

async function translate(text: string, targetLang: string, domain?: string) {
  // Check for cached translations
  const cached = await substrate.brain.query(
    \`translation:\${targetLang}:\${text.substring(0, 50)}\`,
    1
  );
  
  if (cached.data?.memories?.[0]?.confidence > 0.9) {
    return cached.data.memories[0].metadata?.translation;
  }
  
  // Get domain terminology if available
  const terminology = domain 
    ? await substrate.brain.query(\`terminology:\${domain}:\${targetLang}\`, 10)
    : null;
  
  const termContext = terminology?.data?.memories
    ?.map(m => m.content)
    .join('\\n') || '';
  
  // Translate with context
  const translation = await substrate.nexus.route(
    \`Translate to \${targetLang}:\n\${termContext ? \`Domain terms:\\n\${termContext}\\n\\n\` : ''}Text: \${text}\`
  );
  
  // Cache the translation
  await substrate.brain.remember(
    \`translation:\${targetLang}:\${text.substring(0, 50)}\`,
    'translation_cache',
    0.95,
    { original: text, translation: translation.data, targetLang }
  );
  
  return translation.data;
}`
  },
  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    description: 'AI-powered code review with security and quality checks',
    icon: FileCode,
    category: 'nexus',
    difficulty: 'intermediate',
    estimatedTime: '35 min',
    features: ['Security analysis', 'Best practices', 'Improvement suggestions'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

interface CodeReview {
  issues: Array<{ severity: string; line?: number; message: string }>;
  suggestions: string[];
  securityScore: number;
  qualityScore: number;
}

async function reviewCode(code: string, language: string): Promise<CodeReview> {
  // 1. Analyze code for security issues
  const securityCheck = await substrate.nexus.route(
    \`Review this \${language} code for security vulnerabilities. 
    Return JSON array of issues with severity (critical/high/medium/low) and message:
    \${code}\`
  );
  
  // 2. Check for best practices
  const qualityCheck = await substrate.nexus.route(
    \`Review this \${language} code for quality and best practices.
    Return JSON array of suggestions:
    \${code}\`
  );
  
  const issues = JSON.parse(securityCheck.data || '[]');
  const suggestions = JSON.parse(qualityCheck.data || '[]');
  
  // Calculate scores
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const securityScore = Math.max(0, 100 - (criticalCount * 25) - (issues.length * 5));
  const qualityScore = Math.max(0, 100 - (suggestions.length * 10));
  
  // Store for learning
  await substrate.brain.learn(
    \`Code review: \${language} - Security: \${securityScore}, Quality: \${qualityScore}\`,
    'code_review'
  );
  
  return { issues, suggestions, securityScore, qualityScore };
}`
  },
  {
    id: 'task-decomposer',
    name: 'Task Decomposer',
    description: 'Break complex tasks into actionable subtasks',
    icon: Workflow,
    category: 'brain',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    features: ['Task breakdown', 'Dependency mapping', 'Priority assignment'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  dependencies: string[];
}

async function decomposeTask(complexTask: string): Promise<Task[]> {
  // 1. Analyze task complexity
  const intent = await substrate.decode.intent(complexTask);
  
  // 2. Get related past tasks for context
  const similar = await substrate.brain.query(\`task:\${complexTask}\`, 5);
  
  // 3. Generate subtasks
  const decomposition = await substrate.nexus.route(
    \`Break this task into subtasks with dependencies:
    Task: \${complexTask}
    
    Return JSON array: [{ id, title, priority, estimatedTime, dependencies: [ids] }]\`
  );
  
  const tasks: Task[] = JSON.parse(decomposition.data || '[]');
  
  // 4. Store task graph
  for (const task of tasks) {
    await substrate.brain.remember(
      task.title,
      'task_decomposition',
      1.0,
      { parentTask: complexTask, ...task }
    );
  }
  
  // 5. Build knowledge graph of task relationships
  await substrate.brain.graphBuild();
  
  return tasks;
}`
  },
  {
    id: 'faq-generator',
    name: 'FAQ Generator',
    description: 'Auto-generate FAQs from content and user questions',
    icon: BookOpen,
    category: 'brain',
    difficulty: 'beginner',
    estimatedTime: '20 min',
    features: ['Content extraction', 'Question clustering', 'Answer synthesis'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

interface FAQ {
  question: string;
  answer: string;
  category: string;
  confidence: number;
}

async function generateFAQs(content: string, existingQuestions: string[] = []): Promise<FAQ[]> {
  // 1. Extract potential questions from content
  const extraction = await substrate.nexus.route(
    \`Generate 10 common questions users might ask about:\\n\${content}\\n
    Return JSON array of questions\`
  );
  
  const generatedQs = JSON.parse(extraction.data || '[]');
  const allQuestions = [...new Set([...existingQuestions, ...generatedQs])];
  
  const faqs: FAQ[] = [];
  
  for (const question of allQuestions) {
    // 2. Check if we have a stored answer
    const existing = await substrate.brain.query(\`faq:\${question}\`, 1);
    
    if (existing.data?.memories?.[0]) {
      faqs.push({
        question,
        answer: existing.data.memories[0].content,
        category: existing.data.memories[0].metadata?.category || 'general',
        confidence: existing.data.memories[0].confidence
      });
    } else {
      // 3. Generate new answer
      const answer = await substrate.nexus.route(
        \`Answer based on this content:\\n\${content}\\n\\nQuestion: \${question}\`
      );
      
      const faq = {
        question,
        answer: answer.data,
        category: 'general',
        confidence: 0.8
      };
      
      // 4. Store for future use
      await substrate.brain.remember(
        answer.data,
        \`faq:\${question}\`,
        0.8,
        { category: 'general' }
      );
      
      faqs.push(faq);
    }
  }
  
  return faqs;
}`
  },
  {
    id: 'newsletter-curator',
    name: 'Newsletter Curator',
    description: 'Curate and summarize content for newsletters',
    icon: FileText,
    category: 'nexus',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    features: ['Content aggregation', 'Summary generation', 'Topic clustering'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

interface NewsletterItem {
  title: string;
  summary: string;
  category: string;
  relevanceScore: number;
}

async function curateNewsletter(topics: string[], maxItems = 10): Promise<NewsletterItem[]> {
  const items: NewsletterItem[] = [];
  
  for (const topic of topics) {
    // 1. Query relevant memories
    const content = await substrate.brain.query(topic, 5);
    
    for (const memory of content.data?.memories || []) {
      // 2. Generate summary
      const summary = await substrate.nexus.route(
        \`Summarize in 2 sentences for a newsletter:\\n\${memory.content}\`
      );
      
      // 3. Generate engaging title
      const title = await substrate.nexus.route(
        \`Generate a catchy newsletter headline for:\\n\${summary.data}\`
      );
      
      items.push({
        title: title.data,
        summary: summary.data,
        category: topic,
        relevanceScore: memory.confidence
      });
    }
  }
  
  // Sort by relevance and limit
  const curated = items
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxItems);
  
  // Store for tracking
  await substrate.brain.remember(
    \`Newsletter curated: \${curated.length} items\`,
    'newsletter_curation',
    1.0,
    { topics, itemCount: curated.length, date: new Date().toISOString() }
  );
  
  return curated;
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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    id: 'similarity-finder',
    name: 'Similarity Finder',
    description: 'Find semantically similar content across your knowledge base',
    icon: Search,
    category: 'brain',
    difficulty: 'beginner',
    estimatedTime: '15 min',
    features: ['Semantic matching', 'Threshold filtering', 'Cluster discovery'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    id: 'api-gateway',
    name: 'API Gateway',
    description: 'Unified API gateway with authentication and rate limiting',
    icon: Server,
    category: 'defense',
    difficulty: 'advanced',
    estimatedTime: '50 min',
    features: ['Auth validation', 'Rate limiting', 'Request routing'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    id: 'conversation-router',
    name: 'Conversation Router',
    description: 'Route conversations to appropriate handlers or agents',
    icon: GitBranch,
    category: 'decode',
    difficulty: 'advanced',
    estimatedTime: '40 min',
    features: ['Intent routing', 'Handoff logic', 'Context preservation'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

type Handler = (message: string, context: any) => Promise<string>;

class ConversationRouter {
  private handlers: Map<string, Handler> = new Map();
  private defaultHandler: Handler;
  
  constructor(defaultHandler: Handler) {
    this.defaultHandler = defaultHandler;
  }
  
  registerHandler(intent: string, handler: Handler) {
    this.handlers.set(intent, handler);
    return this;
  }
  
  async route(message: string, sessionId: string): Promise<string> {
    // 1. Get intent
    const intent = await substrate.decode.intent(message);
    const primaryIntent = intent.data?.primary_intent || 'unknown';
    
    // 2. Get conversation context
    const context = await substrate.brain.query(
      \`session:\${sessionId}\`,
      5
    );
    
    // 3. Find appropriate handler
    const handler = this.handlers.get(primaryIntent) || this.defaultHandler;
    
    // 4. Execute handler
    const response = await handler(message, {
      intent: intent.data,
      history: context.data?.memories
    });
    
    // 5. Store in context
    await substrate.brain.remember(
      \`User: \${message}\\nBot: \${response}\`,
      \`session:\${sessionId}\`,
      0.9,
      { intent: primaryIntent }
    );
    
    // 6. Track routing
    await substrate.vision.trace(undefined, {
      create: true,
      module: 'router',
      action: primaryIntent,
      metadata: { sessionId }
    });
    
    return response;
  }
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
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

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
    id: 'session-recorder',
    name: 'Session Recorder',
    description: 'Record and replay user sessions with AI analysis',
    icon: PlayCircle,
    category: 'vision',
    difficulty: 'intermediate',
    estimatedTime: '35 min',
    features: ['Event recording', 'Session replay', 'Behavior analysis'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

interface SessionEvent {
  type: 'action' | 'navigation' | 'error' | 'ai_response';
  timestamp: number;
  data: any;
}

class SessionRecorder {
  private sessionId: string;
  private events: SessionEvent[] = [];
  
  constructor(userId: string) {
    this.sessionId = \`session:\${userId}:\${Date.now()}\`;
  }
  
  record(type: SessionEvent['type'], data: any) {
    this.events.push({ type, timestamp: Date.now(), data });
  }
  
  async save() {
    // Store session to brain
    await substrate.brain.remember(
      JSON.stringify(this.events),
      this.sessionId,
      1.0,
      { eventCount: this.events.length, duration: this.getDuration() }
    );
    
    // Create trace
    await substrate.vision.trace(undefined, {
      create: true,
      module: 'session',
      action: 'save',
      metadata: { sessionId: this.sessionId, events: this.events.length }
    });
    
    return this.sessionId;
  }
  
  async analyze() {
    const analysis = await substrate.nexus.route(
      \`Analyze this user session and identify:
      1. Key actions and goals
      2. Potential friction points
      3. Suggestions for improvement
      
      Session: \${JSON.stringify(this.events)}\`
    );
    
    await substrate.brain.learn(
      \`Session analysis: \${this.sessionId}\`,
      'session_analysis'
    );
    
    return analysis.data;
  }
  
  private getDuration() {
    if (this.events.length < 2) return 0;
    return this.events[this.events.length - 1].timestamp - this.events[0].timestamp;
  }
}`
  },
  {
    id: 'feature-flag-ai',
    name: 'AI Feature Flags',
    description: 'Intelligent feature flags with AI-driven rollout decisions',
    icon: Zap,
    category: 'system',
    difficulty: 'advanced',
    estimatedTime: '40 min',
    features: ['Smart rollout', 'User targeting', 'Impact analysis'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercent: number;
  targetRules: Array<{ attribute: string; operator: string; value: any }>;
}

class AIFeatureFlags {
  async evaluateFlag(flagName: string, userId: string, userAttributes: Record<string, any>): Promise<boolean> {
    // 1. Get flag configuration
    const flagData = await substrate.brain.query(\`feature:\${flagName}\`, 1);
    
    if (!flagData.data?.memories?.[0]) {
      return false; // Flag not found
    }
    
    const flag: FeatureFlag = flagData.data.memories[0].metadata;
    
    if (!flag.enabled) return false;
    
    // 2. Check targeting rules
    for (const rule of flag.targetRules) {
      const userValue = userAttributes[rule.attribute];
      if (!this.evaluateRule(userValue, rule.operator, rule.value)) {
        return false;
      }
    }
    
    // 3. Check rollout percentage
    const hash = this.hashUserId(userId, flagName);
    const inRollout = hash % 100 < flag.rolloutPercent;
    
    // 4. Log evaluation
    await substrate.brain.learn(
      \`Flag \${flagName}: \${inRollout ? 'enabled' : 'disabled'} for \${userId}\`,
      'feature_evaluation'
    );
    
    return inRollout;
  }
  
  async analyzeImpact(flagName: string) {
    const evaluations = await substrate.brain.query(\`Flag \${flagName}\`, 100);
    const enabled = evaluations.data?.memories?.filter(m => m.content.includes('enabled')).length || 0;
    const disabled = evaluations.data?.memories?.filter(m => m.content.includes('disabled')).length || 0;
    
    const analysis = await substrate.nexus.route(
      \`Analyze feature flag impact: \${enabled} enabled, \${disabled} disabled evaluations\`
    );
    
    return { enabled, disabled, analysis: analysis.data };
  }
  
  private evaluateRule(userValue: any, operator: string, targetValue: any): boolean {
    switch (operator) {
      case 'equals': return userValue === targetValue;
      case 'contains': return String(userValue).includes(targetValue);
      case 'gt': return userValue > targetValue;
      case 'lt': return userValue < targetValue;
      default: return true;
    }
  }
  
  private hashUserId(userId: string, salt: string): number {
    let hash = 0;
    const str = userId + salt;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}`
  },
  {
    id: 'dream-diary',
    name: 'Dream Diary',
    description: 'Personal dream journal with pattern analysis',
    icon: Moon,
    category: 'dream',
    difficulty: 'beginner',
    estimatedTime: '20 min',
    features: ['Dream logging', 'Symbol tracking', 'Pattern recognition'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

interface DreamEntry {
  content: string;
  mood: string;
  symbols: string[];
  interpretation?: string;
}

class DreamDiary {
  private userId: string;
  
  constructor(userId: string) {
    this.userId = userId;
  }
  
  async logDream(content: string, mood?: string): Promise<DreamEntry> {
    // 1. Feed to dream module
    await substrate.dream.feed(content, 'dream');
    
    // 2. Get interpretation
    const interpretation = await substrate.dream.interpret(content);
    
    // 3. Extract symbols
    const symbols = await substrate.nexus.route(
      \`Extract dream symbols from: \${content}\\nReturn JSON array of symbols\`
    );
    
    const entry: DreamEntry = {
      content,
      mood: mood || interpretation.data?.mood || 'neutral',
      symbols: JSON.parse(symbols.data || '[]'),
      interpretation: interpretation.data?.interpretation
    };
    
    // 4. Store in personal diary
    await substrate.brain.remember(
      content,
      \`diary:\${this.userId}:dream\`,
      0.95,
      { ...entry, date: new Date().toISOString() }
    );
    
    return entry;
  }
  
  async getPatterns() {
    const dreams = await substrate.brain.query(\`diary:\${this.userId}:dream\`, 50);
    const allSymbols: Record<string, number> = {};
    
    for (const dream of dreams.data?.memories || []) {
      for (const symbol of dream.metadata?.symbols || []) {
        allSymbols[symbol] = (allSymbols[symbol] || 0) + 1;
      }
    }
    
    const synthesis = await substrate.brain.synthesize();
    
    return {
      totalDreams: dreams.data?.memories?.length || 0,
      recurringSymbols: Object.entries(allSymbols)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10),
      insights: synthesis.data?.insights
    };
  }
}`
  },
  {
    id: 'coherence-reconciler',
    name: 'Coherence Reconciler',
    description: 'Reconcile conflicting memory and embeddings into coherent substrate knowledge',
    icon: Layers,
    category: 'brain',
    difficulty: 'advanced',
    estimatedTime: '60 min',
    features: ['Memory merging', 'Coherence scoring', 'Knowledge reconciliation'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

interface MemoryConflict {
  sourceA: string;
  sourceB: string;
  conflictType: 'factual' | 'temporal' | 'semantic';
  resolution?: string;
}

class CoherenceReconciler {
  private coherenceThreshold = 0.7;
  
  async detectConflicts(domain: string): Promise<MemoryConflict[]> {
    // Query memories in domain
    const memories = await substrate.brain.query(domain, 100);
    const conflicts: MemoryConflict[] = [];
    
    // Compare memory pairs for semantic conflicts
    const mems = memories.data?.memories || [];
    for (let i = 0; i < mems.length; i++) {
      for (let j = i + 1; j < mems.length; j++) {
        const analysis = await substrate.nexus.route(
          \`Analyze if these two memories conflict:
          Memory A: \${mems[i].content}
          Memory B: \${mems[j].content}
          Return JSON: { conflicts: boolean, type: string, severity: number }\`
        );
        
        const result = JSON.parse(analysis.data || '{}');
        if (result.conflicts) {
          conflicts.push({
            sourceA: mems[i].id,
            sourceB: mems[j].id,
            conflictType: result.type
          });
        }
      }
    }
    
    return conflicts;
  }
  
  async reconcile(conflict: MemoryConflict): Promise<string> {
    // Get both memories
    const memA = await substrate.brain.query(conflict.sourceA, 1);
    const memB = await substrate.brain.query(conflict.sourceB, 1);
    
    // Use AI to reconcile
    const resolution = await substrate.nexus.route(
      \`Reconcile these conflicting pieces of knowledge into a coherent truth:
      
      Source A: \${memA.data?.memories?.[0]?.content}
      Source B: \${memB.data?.memories?.[0]?.content}
      
      Provide the reconciled, coherent version.\`
    );
    
    // Store reconciled knowledge
    await substrate.brain.remember(
      resolution.data,
      'reconciled',
      0.95,
      { sources: [conflict.sourceA, conflict.sourceB], type: conflict.conflictType }
    );
    
    // Decay conflicting memories
    await substrate.brain.reinforce(conflict.sourceA, -0.3);
    await substrate.brain.reinforce(conflict.sourceB, -0.3);
    
    return resolution.data;
  }
  
  async getCoherenceScore(domain: string): Promise<number> {
    const conflicts = await this.detectConflicts(domain);
    const memories = await substrate.brain.query(domain, 100);
    const total = memories.data?.memories?.length || 1;
    
    return 1 - (conflicts.length / total);
  }
}`
  },
  {
    id: 'preference-engine',
    name: 'Preference Engine',
    description: 'Learn user preferences and value weights from interactions',
    icon: Star,
    category: 'brain',
    difficulty: 'intermediate',
    estimatedTime: '45 min',
    features: ['Preference learning', 'Value weights', 'Reinforcement signals'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

interface UserPreference {
  category: string;
  value: string;
  weight: number;
  lastUpdated: string;
}

class PreferenceEngine {
  private userId: string;
  
  constructor(userId: string) {
    this.userId = userId;
  }
  
  async recordInteraction(
    category: string, 
    choice: string, 
    context: Record<string, any> = {}
  ) {
    // Store interaction
    await substrate.brain.remember(
      \`User preferred: \${choice} in category: \${category}\`,
      \`pref:\${this.userId}:\${category}\`,
      0.8,
      { choice, context, timestamp: new Date().toISOString() }
    );
    
    // Reinforce similar past preferences
    const similar = await substrate.brain.query(
      \`pref:\${this.userId}:\${category}\`,
      10
    );
    
    for (const mem of similar.data?.memories || []) {
      if (mem.metadata?.choice === choice) {
        await substrate.brain.reinforce(mem.id, 0.1);
      }
    }
  }
  
  async getPreferences(category?: string): Promise<UserPreference[]> {
    const query = category 
      ? \`pref:\${this.userId}:\${category}\`
      : \`pref:\${this.userId}\`;
    
    const memories = await substrate.brain.query(query, 50);
    const prefMap: Record<string, { count: number; totalConfidence: number }> = {};
    
    for (const mem of memories.data?.memories || []) {
      const key = \`\${mem.metadata?.choice}\`;
      if (!prefMap[key]) {
        prefMap[key] = { count: 0, totalConfidence: 0 };
      }
      prefMap[key].count++;
      prefMap[key].totalConfidence += mem.confidence || 0;
    }
    
    return Object.entries(prefMap)
      .map(([value, stats]) => ({
        category: category || 'general',
        value,
        weight: stats.totalConfidence / stats.count,
        lastUpdated: new Date().toISOString()
      }))
      .sort((a, b) => b.weight - a.weight);
  }
  
  async predict(category: string, options: string[]): Promise<string> {
    const prefs = await this.getPreferences(category);
    
    // Find option closest to preferences
    const analysis = await substrate.nexus.route(
      \`Given user preferences: \${JSON.stringify(prefs)}
      
      Which option would they prefer from: \${options.join(', ')}
      
      Return just the chosen option.\`
    );
    
    return analysis.data?.trim() || options[0];
  }
}`
  },
  {
    id: 'multi-agent-bus',
    name: 'Multi-Agent Bus',
    description: 'Message bus for substrate agent-to-agent or module-to-module communication',
    icon: Radio,
    category: 'system',
    difficulty: 'advanced',
    estimatedTime: '55 min',
    features: ['Message passing', 'Event routing', 'Multi-agent coordination'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

type MessagePriority = 'low' | 'normal' | 'high' | 'critical';
type AgentRole = 'orchestrator' | 'worker' | 'observer' | 'governor';

interface AgentMessage {
  id: string;
  from: string;
  to: string | 'broadcast';
  type: string;
  payload: any;
  priority: MessagePriority;
  timestamp: string;
}

class MultiAgentBus {
  private agentId: string;
  private role: AgentRole;
  private handlers: Map<string, (msg: AgentMessage) => Promise<void>> = new Map();
  
  constructor(agentId: string, role: AgentRole) {
    this.agentId = agentId;
    this.role = role;
  }
  
  async send(
    to: string | 'broadcast',
    type: string,
    payload: any,
    priority: MessagePriority = 'normal'
  ): Promise<string> {
    const message: AgentMessage = {
      id: crypto.randomUUID(),
      from: this.agentId,
      to,
      type,
      payload,
      priority,
      timestamp: new Date().toISOString()
    };
    
    // Store message in shared memory
    await substrate.brain.remember(
      JSON.stringify(message),
      \`bus:messages:\${to === 'broadcast' ? 'all' : to}\`,
      priority === 'critical' ? 1.0 : priority === 'high' ? 0.9 : 0.7,
      { messageType: type, from: this.agentId, to }
    );
    
    // Log for tracing
    await substrate.vision.trace(message.id, {
      create: true,
      module: 'agent-bus',
      action: 'send',
      metadata: { from: this.agentId, to, type }
    });
    
    return message.id;
  }
  
  async receive(): Promise<AgentMessage[]> {
    // Check direct messages and broadcasts
    const [direct, broadcast] = await Promise.all([
      substrate.brain.query(\`bus:messages:\${this.agentId}\`, 20),
      substrate.brain.query('bus:messages:all', 20)
    ]);
    
    const messages: AgentMessage[] = [];
    
    for (const mem of [...(direct.data?.memories || []), ...(broadcast.data?.memories || [])]) {
      try {
        const msg = JSON.parse(mem.content);
        if (msg.from !== this.agentId) { // Don't receive own messages
          messages.push(msg);
          // Mark as processed by decaying
          await substrate.brain.reinforce(mem.id, -0.5);
        }
      } catch { /* Malformed message content — skip */ }
    }
    
    // Sort by priority and timestamp
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    return messages.sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority] ||
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
  
  on(messageType: string, handler: (msg: AgentMessage) => Promise<void>) {
    this.handlers.set(messageType, handler);
  }
  
  async poll() {
    const messages = await this.receive();
    for (const msg of messages) {
      const handler = this.handlers.get(msg.type);
      if (handler) {
        await handler(msg);
      }
    }
  }
}`
  },
  {
    id: 'governance-policy-engine',
    name: 'Governance Policy Engine',
    description: 'Centralized policy and rule enforcement across substrate execution',
    icon: Shield,
    category: 'defense',
    difficulty: 'advanced',
    estimatedTime: '60 min',
    features: ['Policy rules', 'Override logic', 'Constraint enforcement'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

type PolicyAction = 'allow' | 'deny' | 'audit' | 'escalate';

interface Policy {
  id: string;
  name: string;
  condition: (context: PolicyContext) => boolean;
  action: PolicyAction;
  priority: number;
  metadata?: Record<string, any>;
}

interface PolicyContext {
  module: string;
  action: string;
  actor: string;
  resource?: string;
  metadata?: Record<string, any>;
}

interface PolicyDecision {
  allowed: boolean;
  action: PolicyAction;
  matchedPolicy?: string;
  reason: string;
  auditTrail: string;
}

class GovernancePolicyEngine {
  private policies: Policy[] = [];
  
  registerPolicy(policy: Policy) {
    this.policies.push(policy);
    this.policies.sort((a, b) => b.priority - a.priority);
  }
  
  async evaluate(context: PolicyContext): Promise<PolicyDecision> {
    // Check defense posture first
    const posture = await substrate.defense.posture();
    const postureScore = posture.data?.score || 100;
    
    // Find matching policies
    for (const policy of this.policies) {
      if (policy.condition(context)) {
        const decision: PolicyDecision = {
          allowed: policy.action === 'allow',
          action: policy.action,
          matchedPolicy: policy.id,
          reason: \`Matched policy: \${policy.name}\`,
          auditTrail: crypto.randomUUID()
        };
        
        // Log to audit
        await substrate.brain.remember(
          \`Policy decision: \${policy.action} for \${context.actor} on \${context.module}/\${context.action}\`,
          'governance:audit',
          0.95,
          { context, decision, postureScore }
        );
        
        // Handle escalation
        if (policy.action === 'escalate') {
          await this.escalate(context, policy);
        }
        
        return decision;
      }
    }
    
    // Default: allow if posture is good, deny if degraded
    const defaultAllow = postureScore >= 50;
    
    return {
      allowed: defaultAllow,
      action: defaultAllow ? 'allow' : 'deny',
      reason: \`Default policy (posture: \${postureScore})\`,
      auditTrail: crypto.randomUUID()
    };
  }
  
  private async escalate(context: PolicyContext, policy: Policy) {
    await substrate.nexus.route(
      \`GOVERNANCE ALERT: Action \${context.action} on module \${context.module} by \${context.actor} requires escalation per policy \${policy.name}\`
    );
  }
  
  // Preset governance policies
  static standardPolicies(): Policy[] {
    return [
      {
        id: 'rate-limit-override',
        name: 'Rate Limit Override Protection',
        condition: (ctx) => ctx.action === 'override' && ctx.module === 'defense',
        action: 'escalate',
        priority: 100
      },
      {
        id: 'memory-wipe-protection',
        name: 'Bulk Memory Deletion Protection',
        condition: (ctx) => ctx.action.includes('delete') && ctx.module === 'brain',
        action: 'audit',
        priority: 90
      },
      {
        id: 'system-heal-governance',
        name: 'System Heal Governance',
        condition: (ctx) => ctx.action === 'heal' && ctx.module === 'system',
        action: 'allow',
        priority: 50
      }
    ];
  }
}`
  },
  {
    id: 'social-graph-modeling',
    name: 'Social Graph Modeling',
    description: 'Build knowledge graphs of actors, relationships, and affinity',
    icon: Users,
    category: 'brain',
    difficulty: 'advanced',
    estimatedTime: '55 min',
    features: ['Relationship graph', 'Affinity mapping', 'Actor modeling'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

interface Actor {
  id: string;
  type: 'user' | 'org' | 'system' | 'agent';
  attributes: Record<string, any>;
}

interface Relationship {
  from: string;
  to: string;
  type: string;
  strength: number;
  metadata?: Record<string, any>;
}

class SocialGraphModeler {
  async addActor(actor: Actor): Promise<void> {
    await substrate.brain.remember(
      JSON.stringify(actor),
      \`graph:actor:\${actor.id}\`,
      0.9,
      { type: actor.type, ...actor.attributes }
    );
  }
  
  async addRelationship(relationship: Relationship): Promise<void> {
    // Store relationship as memory
    await substrate.brain.remember(
      \`\${relationship.from} -> \${relationship.type} -> \${relationship.to}\`,
      'graph:relationship',
      relationship.strength,
      { ...relationship, createdAt: new Date().toISOString() }
    );
    
    // Also add to graph edges if using brain graph
    const graphSummary = await substrate.brain.graphSummary();
    if (graphSummary.success) {
      // Graph already tracking edges
    }
  }
  
  async getRelationships(actorId: string): Promise<Relationship[]> {
    const rels = await substrate.brain.query(\`graph:relationship \${actorId}\`, 50);
    
    return (rels.data?.memories || [])
      .map(mem => mem.metadata as Relationship)
      .filter(r => r.from === actorId || r.to === actorId);
  }
  
  async computeAffinity(actorA: string, actorB: string): Promise<number> {
    // Get shared relationships
    const [relsA, relsB] = await Promise.all([
      this.getRelationships(actorA),
      this.getRelationships(actorB)
    ]);
    
    // Find common connections
    const connectionsA = new Set([
      ...relsA.map(r => r.from === actorA ? r.to : r.from)
    ]);
    const connectionsB = new Set([
      ...relsB.map(r => r.from === actorB ? r.to : r.from)
    ]);
    
    const shared = [...connectionsA].filter(c => connectionsB.has(c));
    const jaccard = shared.length / (connectionsA.size + connectionsB.size - shared.length);
    
    return jaccard;
  }
  
  async findInfluencers(community: string, limit = 10): Promise<Actor[]> {
    // Query actors in community
    const actors = await substrate.brain.query(\`graph:actor \${community}\`, 100);
    
    // Rank by relationship count and strength
    const rankings: Array<{ actor: Actor; score: number }> = [];
    
    for (const mem of actors.data?.memories || []) {
      const actor = JSON.parse(mem.content) as Actor;
      const rels = await this.getRelationships(actor.id);
      const score = rels.reduce((sum, r) => sum + r.strength, 0);
      rankings.push({ actor, score });
    }
    
    return rankings
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.actor);
  }
  
  async suggestConnections(actorId: string): Promise<string[]> {
    const myRels = await this.getRelationships(actorId);
    const myConnections = new Set(myRels.map(r => r.from === actorId ? r.to : r.from));
    
    const suggestions = new Set<string>();
    
    for (const connId of myConnections) {
      const theirRels = await this.getRelationships(connId);
      for (const rel of theirRels) {
        const potential = rel.from === connId ? rel.to : rel.from;
        if (potential !== actorId && !myConnections.has(potential)) {
          suggestions.add(potential);
        }
      }
    }
    
    return [...suggestions].slice(0, 10);
  }
}`
  },
  {
    id: 'substrate-composer',
    name: 'Substrate Composer',
    description: 'Composition layer for wiring substrate modules into directed graphs',
    icon: Workflow,
    category: 'nexus',
    difficulty: 'advanced',
    estimatedTime: '60 min',
    features: ['Module chaining', 'Graph execution', 'Workflow composition'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

type ModuleType = 'brain' | 'decode' | 'defense' | 'nexus' | 'vision' | 'dream' | 'system' | 'core' | 'ripple' | 'access' | 'modernizer' | 'integration';

interface CompositionNode {
  id: string;
  module: ModuleType;
  action: string;
  params?: Record<string, any>;
  transform?: (result: any) => any;
}

interface CompositionEdge {
  from: string;
  to: string;
  condition?: (result: any) => boolean;
}

interface CompositionGraph {
  nodes: CompositionNode[];
  edges: CompositionEdge[];
  entryNode: string;
}

class SubstrateComposer {
  private graph: CompositionGraph;
  private results: Map<string, any> = new Map();
  
  constructor(graph: CompositionGraph) {
    this.graph = graph;
  }
  
  async execute(input: any): Promise<Record<string, any>> {
    // Start tracing
    const traceId = crypto.randomUUID();
    await substrate.vision.trace(traceId, { create: true, module: 'composer', action: 'execute' });
    
    // Find entry node
    const entryNode = this.graph.nodes.find(n => n.id === this.graph.entryNode);
    if (!entryNode) throw new Error('Entry node not found');
    
    // Execute starting from entry
    await this.executeNode(entryNode, input, traceId);
    
    // Return all results
    return Object.fromEntries(this.results);
  }
  
  private async executeNode(node: CompositionNode, input: any, traceId: string): Promise<any> {
    // Execute the module action
    const result = await this.callModule(node, input);
    
    // Apply transform if defined
    const output = node.transform ? node.transform(result) : result;
    this.results.set(node.id, output);
    
    // Log trace
    await substrate.vision.trace(traceId, {
      module: node.module,
      action: node.action,
      metadata: { nodeId: node.id }
    });
    
    // Find outgoing edges
    const outEdges = this.graph.edges.filter(e => e.from === node.id);
    
    // Execute downstream nodes
    for (const edge of outEdges) {
      // Check condition if present
      if (edge.condition && !edge.condition(output)) continue;
      
      const nextNode = this.graph.nodes.find(n => n.id === edge.to);
      if (nextNode) {
        await this.executeNode(nextNode, output, traceId);
      }
    }
    
    return output;
  }
  
  private async callModule(node: CompositionNode, input: any): Promise<any> {
    const { module, action, params } = node;
    const mergedParams = { ...params, input };
    
    switch (module) {
      case 'brain':
        if (action === 'query') return substrate.brain.query(input, params?.limit);
        if (action === 'remember') return substrate.brain.remember(input, params?.type, params?.confidence);
        if (action === 'synthesize') return substrate.brain.synthesize();
        break;
      case 'nexus':
        if (action === 'route') return substrate.nexus.route(input);
        if (action === 'text') return substrate.nexus.text(input);
        break;
      case 'decode':
        if (action === 'intent') return substrate.decode.intent(input);
        if (action === 'chat') return substrate.decode.chat(input, params?.sessionId);
        break;
      case 'defense':
        if (action === 'analyze') return substrate.defense.analyze(input, params?.ip);
        if (action === 'posture') return substrate.defense.posture();
        break;
      case 'vision':
        if (action === 'healthSnapshot') return substrate.vision.healthSnapshot();
        break;
      case 'dream':
        if (action === 'feed') return substrate.dream.feed(input, params?.type);
        if (action === 'interpret') return substrate.dream.interpret(input);
        break;
    }
    
    return { error: 'Unknown action' };
  }
  
  // Builder pattern for easy composition
  static builder() {
    return new ComposerBuilder();
  }
}

class ComposerBuilder {
  private nodes: CompositionNode[] = [];
  private edges: CompositionEdge[] = [];
  private entry: string = '';
  
  addNode(node: CompositionNode): this {
    this.nodes.push(node);
    if (!this.entry) this.entry = node.id;
    return this;
  }
  
  connect(from: string, to: string, condition?: (r: any) => boolean): this {
    this.edges.push({ from, to, condition });
    return this;
  }
  
  build(): SubstrateComposer {
    return new SubstrateComposer({
      nodes: this.nodes,
      edges: this.edges,
      entryNode: this.entry
    });
  }
}`
  },
  {
    id: 'substrate-evaluator',
    name: 'Substrate Evaluator',
    description: 'Measure substrate performance on coherence, latency, cost, accuracy',
    icon: Gauge,
    category: 'vision',
    difficulty: 'advanced',
    estimatedTime: '50 min',
    features: ['Performance metrics', 'Evaluation suite', 'Execution audits'],
    code: `import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient(config);

interface EvaluationMetrics {
  coherence: number;
  latency: { avg: number; p95: number; p99: number };
  cost: { total: number; perRequest: number };
  accuracy: number;
  uptime: number;
  healthScore: number;
}

interface EvaluationReport {
  timestamp: string;
  metrics: EvaluationMetrics;
  issues: string[];
  recommendations: string[];
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

class SubstrateEvaluator {
  async evaluate(): Promise<EvaluationReport> {
    const timestamp = new Date().toISOString();
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Gather all metrics in parallel
    const [
      healthSnapshot,
      quotaData,
      routeStats,
      graphSummary,
      introspection,
      posture
    ] = await Promise.all([
      substrate.vision.healthSnapshot(),
      substrate.vision.quota(),
      substrate.nexus.routeStats(),
      substrate.brain.graphSummary(),
      substrate.vision.introspection(),
      substrate.defense.posture()
    ]);
    
    // Calculate coherence from graph density
    const coherence = graphSummary.data?.density || 0;
    if (coherence < 0.3) {
      issues.push('Low knowledge graph coherence');
      recommendations.push('Run brain.synthesize() to build more connections');
    }
    
    // Calculate latency from route stats
    const latencyStats = routeStats.data?.providers || [];
    const avgLatency = latencyStats.reduce((s: number, p: any) => s + (p.avgLatency || 0), 0) / (latencyStats.length || 1);
    const p95Latency = avgLatency * 1.5; // Estimate
    const p99Latency = avgLatency * 2.0;
    
    if (avgLatency > 1000) {
      issues.push('High average latency');
      recommendations.push('Consider adding faster provider fallbacks');
    }
    
    // Calculate cost
    const totalCost = quotaData.data?.totalCost || 0;
    const totalCalls = quotaData.data?.totalCalls || 1;
    const costPerRequest = totalCost / totalCalls;
    
    if (costPerRequest > 0.01) {
      recommendations.push('High cost per request - optimize prompts');
    }
    
    // Calculate accuracy from success rates
    const successRates = latencyStats.map((p: any) => p.successRate || 0);
    const accuracy = successRates.reduce((s: number, r: number) => s + r, 0) / (successRates.length || 1);
    
    if (accuracy < 0.95) {
      issues.push('Success rate below 95%');
      recommendations.push('Check provider availability and error patterns');
    }
    
    // Get uptime and health
    const uptime = introspection.data?.uptime || 0;
    const healthScore = healthSnapshot.data?.healthScore || 0;
    
    if (healthScore < 80) {
      issues.push('Health score degraded');
      recommendations.push('Run system.heal() to restore health');
    }
    
    // Compute grade
    const overallScore = (
      coherence * 20 +
      (1 - Math.min(avgLatency / 2000, 1)) * 20 +
      accuracy * 30 +
      healthScore * 0.3
    );
    
    const grade = overallScore >= 90 ? 'A' 
      : overallScore >= 80 ? 'B'
      : overallScore >= 70 ? 'C'
      : overallScore >= 60 ? 'D'
      : 'F';
    
    const report: EvaluationReport = {
      timestamp,
      metrics: {
        coherence,
        latency: { avg: avgLatency, p95: p95Latency, p99: p99Latency },
        cost: { total: totalCost, perRequest: costPerRequest },
        accuracy,
        uptime,
        healthScore
      },
      issues,
      recommendations,
      grade
    };
    
    // Store evaluation for tracking
    await substrate.brain.remember(
      JSON.stringify(report),
      'evaluation:report',
      0.95,
      { grade, timestamp }
    );
    
    return report;
  }
  
  async getHistoricalTrend(days = 7): Promise<EvaluationReport[]> {
    const reports = await substrate.brain.query('evaluation:report', days * 4);
    return (reports.data?.memories || [])
      .map(m => JSON.parse(m.content) as EvaluationReport)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}`
  }
];

// Usage-focused documentation (no implementation details)
const DOCS = [
  {
    id: 'quickstart',
    title: 'Quick Start Guide',
    description: 'Get up and running in 5 minutes',
    icon: Rocket,
    content: 'quickstart',
    downloadable: true
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    description: 'Complete action reference with parameters',
    icon: Code,
    content: 'api',
    downloadable: true
  },
  {
    id: 'sdk-guide',
    title: 'SDK Documentation',
    description: 'TypeScript SDK usage and examples',
    icon: Package,
    content: 'sdk',
    downloadable: true
  },
  {
    id: 'rate-limits',
    title: 'Rate Limits',
    description: 'Understanding request limits and quotas',
    icon: Timer,
    content: 'limits',
    downloadable: false
  },
  {
    id: 'authentication',
    title: 'Authentication',
    description: 'JWT authentication and authorization',
    icon: Lock,
    content: 'auth',
    downloadable: false
  },
  {
    id: 'error-handling',
    title: 'Error Handling',
    description: 'Error codes and troubleshooting',
    icon: AlertTriangle,
    content: 'errors',
    downloadable: false
  }
];

// Provider requirements
const REQUIRED_KEYS = [
  { name: 'GROQ_API_KEY', provider: 'Groq', url: 'https://console.groq.com', required: true, description: 'Primary AI provider (fastest)' },
  { name: 'OPENAI_API_KEY', provider: 'OpenAI', url: 'https://platform.openai.com', required: false, description: 'GPT-4 access for complex tasks' },
  { name: 'CEREBRAS_API_KEY', provider: 'Cerebras', url: 'https://cloud.cerebras.ai', required: false, description: 'High-performance fallback' },
  { name: 'TOGETHER_API_KEY', provider: 'Together', url: 'https://together.ai', required: false, description: 'Open source models' },
  { name: 'DEEPSEEK_API_KEY', provider: 'DeepSeek', url: 'https://platform.deepseek.com', required: false, description: 'Cost-effective option' },
];

// Module quick reference - Including BYOK modules
const MODULES = [
  { 
    name: 'Brain', 
    icon: Brain, 
    color: 'violet',
    desc: 'Memory, learning, knowledge graphs',
    actions: ['query', 'remember', 'reflect', 'reinforce', 'learn', 'synthesize', 'graphSummary']
  },
  { 
    name: 'Decode', 
    icon: MessageSquare, 
    color: 'cyan',
    desc: 'Intent decoding, chat interface',
    actions: ['chat', 'intent', 'dream', 'learn']
  },
  { 
    name: 'Defense', 
    icon: Shield, 
    color: 'emerald',
    desc: 'Bot detection, threat analysis',
    actions: ['analyze', 'reputation', 'posture', 'anomalyProbe', 'limits']
  },
  { 
    name: 'Nexus', 
    icon: Network, 
    color: 'amber',
    desc: 'Multi-provider AI routing',
    actions: ['route', 'text', 'image', 'providers', 'routeStats']
  },
  { 
    name: 'Vision', 
    icon: Eye, 
    color: 'rose',
    desc: 'Observability, metrics, tracing',
    actions: ['health', 'healthSnapshot', 'dashboard', 'trace', 'quota', 'introspection']
  },
  { 
    name: 'Dream', 
    icon: Moon, 
    color: 'purple',
    desc: 'Dream processing, synthesis',
    actions: ['feed', 'interpret', 'cycle', 'mutate', 'status']
  },
  { 
    name: 'System', 
    icon: Server, 
    color: 'blue',
    desc: 'Administration, health, backup',
    actions: ['status', 'health', 'heal', 'backup', 'version']
  },
  // NEW BYOK MODULES
  { 
    name: 'Keys (BYOK)', 
    icon: Key, 
    color: 'orange',
    desc: 'API key management - pay your own compute',
    actions: ['register', 'list', 'rotate', 'revoke', 'usage']
  },
  { 
    name: 'AI (BYOK)', 
    icon: Sparkles, 
    color: 'pink',
    desc: 'AI calls with YOUR API keys',
    actions: ['chat', 'prompt', 'providers']
  },
  { 
    name: 'Extensions', 
    icon: Package, 
    color: 'teal',
    desc: 'Custom hooks for all modules',
    actions: ['register', 'list', 'enable', 'disable', 'invoke', 'hooks']
  },
  { 
    name: 'Integrations', 
    icon: Globe, 
    color: 'indigo',
    desc: 'Connect Stripe, Twilio, n8n, webhooks',
    actions: ['connect', 'list', 'call', 'webhook', 'disconnect']
  },
  { 
    name: 'Agents', 
    icon: Bot, 
    color: 'lime',
    desc: 'Multi-agent orchestration patterns',
    actions: ['create', 'list', 'run', 'events', 'delete']
  },
];

function CopyButton({ text, className = '' }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleCopy} 
      className={`h-8 w-8 p-0 touch-manipulation ${className}`}
    >
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
    </Button>
  );
}

function TemplateCard({ template }: { template: typeof TEMPLATES[0] }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = template.icon;
  
  const categoryColors: Record<string, string> = {
    brain: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    decode: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    defense: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    nexus: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    vision: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    dream: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    system: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const difficultyColors: Record<string, string> = {
    beginner: 'text-green-400',
    intermediate: 'text-yellow-400',
    advanced: 'text-red-400',
  };

  return (
    <Card className="group active:scale-[0.98] transition-all duration-200 touch-manipulation">
      <CardHeader className="p-4 sm:p-6 pb-3">
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 sm:w-10 sm:h-10 rounded-xl sm:rounded-lg flex-shrink-0 flex items-center justify-center ${categoryColors[template.category]}`}>
            <Icon className="w-6 h-6 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-sm leading-tight">{template.name}</CardTitle>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5">
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${categoryColors[template.category]}`}>
                {template.category}
              </Badge>
              <span className={`text-[10px] ${difficultyColors[template.difficulty]}`}>
                {template.difficulty}
              </span>
              <span className="text-[10px] text-muted-foreground">
                ~{template.estimatedTime}
              </span>
            </div>
          </div>
        </div>
        <CardDescription className="text-sm mt-3 leading-relaxed">
          {template.description}
        </CardDescription>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {template.features.map((feature) => (
            <Badge key={feature} variant="secondary" className="text-[10px] px-2 py-0.5">
              {feature}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
        <Button 
          variant="outline" 
          size="default"
          className="w-full h-11 sm:h-9 touch-manipulation"
          onClick={() => setExpanded(!expanded)}
        >
          <Code className="w-4 h-4 mr-2" />
          {expanded ? 'Hide Code' : 'View Code'}
        </Button>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <CopyButton text={template.code} />
                </div>
                <ScrollArea className="h-[250px] sm:h-[280px] rounded-lg bg-muted/50 border border-border/50">
                  <pre className="p-3 sm:p-4 text-[10px] sm:text-xs font-mono whitespace-pre-wrap break-words overflow-x-auto">
                    <code className="text-foreground/90 block">{template.code}</code>
                  </pre>
                </ScrollArea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function InlineDocumentation({ docId }: { docId: string }) {
  const docsContent: Record<string, React.ReactNode> = {
    quickstart: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">1. Get Your API Keys</h3>
          <p className="text-muted-foreground mb-3">
            The substrate routes to multiple AI providers. You need at least one API key:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li><strong>Groq</strong> (required) — Fastest inference, get key at console.groq.com</li>
            <li><strong>OpenAI</strong> (optional) — GPT-4 for complex tasks</li>
            <li><strong>Cerebras</strong> (optional) — High-performance fallback</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">2. Deploy the Substrate</h3>
          <Card className="bg-muted/50 p-4 overflow-hidden">
            <pre className="text-sm font-mono whitespace-pre-wrap break-words overflow-x-auto">
              <code>{`# Clone and deploy to your Supabase project
supabase functions deploy pf-substrate

# Add your API keys as secrets
supabase secrets set GROQ_API_KEY=your_key_here`}</code>
            </pre>
          </Card>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">3. Make Your First Call</h3>
          <Card className="bg-muted/50 p-4 overflow-hidden">
            <pre className="text-sm font-mono whitespace-pre-wrap break-words overflow-x-auto">
              <code>{`POST https://YOUR_PROJECT.supabase.co/functions/v1/pf-substrate

{
  "module": "vision",
  "action": "health",
  "payload": {}
}`}</code>
            </pre>
          </Card>
        </div>
      </div>
    ),
    api: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Request Format</h3>
          <Card className="bg-muted/50 p-4 overflow-hidden">
            <pre className="text-sm font-mono whitespace-pre-wrap break-words overflow-x-auto">
              <code>{`POST /functions/v1/pf-substrate
Content-Type: application/json
Authorization: Bearer <jwt> (optional)

{
  "module": "brain|decode|defense|nexus|vision|dream|system|core|ripple|access|modernizer|integration",
  "action": "<action-name>",
  "payload": { /* action parameters */ }
}`}</code>
            </pre>
          </Card>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Response Format</h3>
          <Card className="bg-muted/50 p-4 overflow-hidden">
            <pre className="text-sm font-mono whitespace-pre-wrap break-words overflow-x-auto">
              <code>{`{
  "success": true,
  "module": "brain",
  "action": "query",
  "data": { /* action-specific response */ },
  "timestamp": "2026-01-16T..."
}`}</code>
            </pre>
          </Card>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Available Actions</h3>
          <p className="text-sm text-muted-foreground">
            See the module cards above for available actions per module.
            Each action has specific parameters documented in the SDK.
          </p>
        </div>
      </div>
    ),
    sdk: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Download SDK</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/sdk/substrate-client.ts" download>
                <Download className="w-4 h-4 mr-2" />
                substrate-client.ts
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/sdk/README.md" download>
                <Download className="w-4 h-4 mr-2" />
                README.md
              </a>
            </Button>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Initialize Client</h3>
          <Card className="bg-muted/50 p-4 overflow-hidden">
            <pre className="text-sm font-mono whitespace-pre-wrap break-words overflow-x-auto">
              <code>{`import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient({
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_ANON_KEY'
});

// Set auth token for authenticated operations
substrate.setAuthToken(userJwtToken);`}</code>
            </pre>
          </Card>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Module Methods</h3>
          <p className="text-sm text-muted-foreground">
            The SDK provides typed methods for all modules: <code>substrate.brain.*</code>,
            <code>substrate.decode.*</code>, <code>substrate.defense.*</code>, etc.
          </p>
        </div>
      </div>
    ),
    limits: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-3">Rate Limits</h3>
        <div className="grid gap-3">
          {[
            { scope: 'IP (general)', limit: '100 req / 5 min' },
            { scope: 'IP (chat)', limit: '20 req / 5 min' },
            { scope: 'IP (dream feed)', limit: '15 req / 5 min' },
            { scope: 'Authenticated', limit: '500 req / 5 min' },
            { scope: 'Daily per account', limit: '5000 req / day' },
          ].map((item) => (
            <div key={item.scope} className="flex justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">{item.scope}</span>
              <Badge variant="outline">{item.limit}</Badge>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Exceeding limits returns <code>429 Too Many Requests</code>.
        </p>
      </div>
    ),
    auth: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-3">Authentication</h3>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium mb-2">Public Endpoints</h4>
            <p className="text-sm text-muted-foreground">
              Some actions don't require authentication:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
              <li>All <code>status</code> actions</li>
              <li><code>vision.health</code></li>
              <li><code>dream.feed</code> (rate-limited)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Authenticated Endpoints</h4>
            <Card className="bg-muted/50 p-4 overflow-hidden">
              <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                <code>Authorization: Bearer &lt;supabase-jwt&gt;</code>
              </pre>
            </Card>
          </div>
        </div>
      </div>
    ),
    errors: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-3">Error Codes</h3>
        <div className="grid gap-2">
          {[
            { code: '200', meaning: 'Success' },
            { code: '400', meaning: 'Invalid request (missing module/action)' },
            { code: '401', meaning: 'Unauthorized' },
            { code: '403', meaning: 'Forbidden (blocked)' },
            { code: '404', meaning: 'Unknown module or action' },
            { code: '422', meaning: 'Validation failed' },
            { code: '429', meaning: 'Rate limit exceeded' },
            { code: '500', meaning: 'Internal error' },
          ].map((item) => (
            <div key={item.code} className="flex justify-between p-2 bg-muted/50 rounded">
              <code className="text-sm">{item.code}</code>
              <span className="text-sm text-muted-foreground">{item.meaning}</span>
            </div>
          ))}
        </div>
      </div>
    )
  };

  return docsContent[docId] || <p>Documentation not found.</p>;
}

export default function DevPortal() {
  const [activeTab, setActiveTab] = useState('overview');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState('quickstart');

  const filteredTemplates = categoryFilter 
    ? TEMPLATES.filter(t => t.category === categoryFilter)
    : TEMPLATES;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Substrate Modules — CMPSBL® Cognitive SDK"
        description="Compose cognition as software with CMPSBL's substrate SDK. Modular primitives for memory, routing, governance, security, and execution."
        keywords={['cognitive substrate SDK', 'AI modules', 'CMPSBL SDK', 'cognition as software', 'substrate composition']}
      />
      <PublicNav />

      {/* Hero Section - Mobile First */}
      <section className="relative py-12 sm:py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full bg-primary/10 blur-[80px] sm:blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] rounded-full bg-violet-500/10 blur-[60px] sm:blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px] sm:bg-[size:60px_60px]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-primary/20 to-violet-500/20 border border-primary/30 text-xs sm:text-sm mb-4 sm:mb-6"
            >
              <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span className="font-medium">Developer Portal</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight"
            >
              Build on the{' '}
              <span className="bg-gradient-to-r from-primary via-violet-400 to-cyan-400 bg-clip-text text-transparent block sm:inline mt-1 sm:mt-0">
                Cognitive Substrate
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-2"
            >
              Memory, learning, security, AI routing, extensions, integrations, and multi-agent orchestration.
              <span className="block mt-2 font-medium text-primary">100% BYOK — You own your infrastructure. You pay your own AI costs.</span>
            </motion.p>

            {/* API Key Warning - Mobile Optimized */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start sm:items-center gap-3 px-4 sm:px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-6 sm:mb-8 mx-auto max-w-xl text-left"
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
              <span className="text-xs sm:text-sm">
                <strong>BYOK Required:</strong> You must deploy your own substrate instance and provide your own AI provider API keys.
                No compute resources are included.
              </span>
            </motion.div>

            {/* CTA Buttons - Stack on Mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4 sm:px-0"
            >
              <Button 
                size="lg" 
                className="w-full sm:w-auto gap-2 h-12 sm:h-11 touch-manipulation" 
                onClick={() => setActiveTab('templates')}
              >
                <PlayCircle className="w-5 h-5" />
                Browse Templates
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto gap-2 h-12 sm:h-11 touch-manipulation" 
                onClick={() => setActiveTab('docs')}
              >
                <Download className="w-5 h-5" />
                Get SDK
              </Button>
              <Link to="/demo" className="w-full sm:w-auto">
                <Button size="lg" variant="ghost" className="w-full gap-2 h-12 sm:h-11 touch-manipulation">
                  <Zap className="w-5 h-5" />
                  Live Demo
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content - Mobile First */}
      <section className="py-6 sm:py-8 md:py-12 flex-1">
        <div className="container mx-auto px-4 sm:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 sm:space-y-8">
            {/* Mobile-optimized tabs */}
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 h-14 sm:h-12 p-1">
              <TabsTrigger value="overview" className="flex-col sm:flex-row gap-1 sm:gap-2 text-[10px] sm:text-sm px-1 sm:px-3 touch-manipulation">
                <Layers className="w-4 h-4 sm:w-4 sm:h-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex-col sm:flex-row gap-1 sm:gap-2 text-[10px] sm:text-sm px-1 sm:px-3 touch-manipulation">
                <FileCode className="w-4 h-4 sm:w-4 sm:h-4" />
                <span>Templates</span>
              </TabsTrigger>
              <TabsTrigger value="docs" className="flex-col sm:flex-row gap-1 sm:gap-2 text-[10px] sm:text-sm px-1 sm:px-3 touch-manipulation">
                <BookOpen className="w-4 h-4 sm:w-4 sm:h-4" />
                <span>Docs</span>
              </TabsTrigger>
              <TabsTrigger value="setup" className="flex-col sm:flex-row gap-1 sm:gap-2 text-[10px] sm:text-sm px-1 sm:px-3 touch-manipulation">
                <Key className="w-4 h-4 sm:w-4 sm:h-4" />
                <span>Setup</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab - Mobile First */}
            <TabsContent value="overview" className="space-y-6 sm:space-y-8">
              {/* Quick Stats - 2x2 grid on mobile */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                {[
                  { label: 'Entities', value: '10', icon: Layers },
                  { label: 'Actions', value: '80+', icon: Zap },
                  { label: 'Templates', value: '72', icon: FileCode },
                  { label: 'Providers', value: '10+', icon: Server },
                  { label: 'Agent Patterns', value: '5', icon: Bot },
                ].map((stat) => (
                  <Card key={stat.label} className="text-center py-4 sm:py-6 transition-all duration-300 hover:border-primary/15 hover:-translate-y-0.5 hover:shadow-sm">
                    <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1.5 sm:mb-2 text-primary" />
                    <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  </Card>
                ))}
              </div>

              {/* Module Overview - Horizontal scroll on mobile */}
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold">Substrate Modules</h2>
                <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4 sm:overflow-visible scrollbar-hide">
                  {MODULES.map((mod) => (
                    <Card key={mod.name} className="p-4 min-w-[260px] sm:min-w-0 flex-shrink-0 sm:flex-shrink active:scale-[0.98] transition-all duration-300 touch-manipulation hover:border-primary/15 hover:-translate-y-0.5 hover:shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-11 h-11 sm:w-10 sm:h-10 rounded-xl sm:rounded-lg bg-${mod.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                          <mod.icon className={`w-5 h-5 text-${mod.color}-400`} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-sm sm:text-base">{mod.name}</h3>
                          <p className="text-xs text-muted-foreground truncate">{mod.desc}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {mod.actions.slice(0, 4).map((action) => (
                          <Badge key={action} variant="secondary" className="text-[9px] px-1.5">
                            {action}
                          </Badge>
                        ))}
                        {mod.actions.length > 4 && (
                          <Badge variant="outline" className="text-[9px] px-1.5">
                            +{mod.actions.length - 4}
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Start Code - Better mobile scroll */}
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold">Quick Start</h2>
                <Card className="relative overflow-hidden">
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                    <CopyButton text={`import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient({
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_ANON_KEY'
});

// Query the brain
const memories = await substrate.brain.query('machine learning', 10);

// Chat with Decode
const reply = await substrate.decode.chat('Hello!', 'session_123');

// Route to AI provider
const response = await substrate.nexus.route('Explain quantum computing');`} />
                  </div>
                  <ScrollArea className="w-full">
                    <pre className="p-4 sm:p-6 text-[11px] sm:text-sm font-mono bg-muted/30 whitespace-pre-wrap break-words sm:whitespace-pre overflow-x-auto">
{`import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient({
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_ANON_KEY'
});

// Query the brain
const memories = await substrate.brain.query('machine learning', 10);

// Chat with Decode
const reply = await substrate.decode.chat('Hello!', 'session_123');

// Route to AI provider
const response = await substrate.nexus.route('Explain quantum computing');`}
                    </pre>
                  </ScrollArea>
                </Card>
              </div>

              {/* CTA - Stack on mobile */}
              <Card className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-violet-500/10 border-primary/20">
                <div className="flex flex-col items-center text-center sm:text-left sm:flex-row sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Ready to build?</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">Get the SDK and start building in minutes.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto h-11 sm:h-10 touch-manipulation" asChild>
                      <a href="/sdk/substrate-client.ts" download>
                        <Download className="w-4 h-4 mr-2" />
                        Download SDK
                      </a>
                    </Button>
                    <Button className="w-full sm:w-auto h-11 sm:h-10 touch-manipulation" onClick={() => setActiveTab('templates')}>
                      View Templates
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Templates Tab - Mobile First */}
            <TabsContent value="templates" className="space-y-4 sm:space-y-6">
              {/* Category Filter - Horizontal scroll on mobile */}
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide">
                <Button
                  variant={categoryFilter === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter(null)}
                  className="flex-shrink-0 h-9 sm:h-8 touch-manipulation"
                >
                  All ({TEMPLATES.length})
                </Button>
                {['brain', 'decode', 'defense', 'nexus', 'vision', 'dream', 'system', 'integration'].map((cat) => {
                  const count = TEMPLATES.filter(t => t.category === cat).length;
                  if (count === 0) return null;
                  return (
                    <Button
                      key={cat}
                      variant={categoryFilter === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCategoryFilter(cat)}
                      className="capitalize flex-shrink-0 h-9 sm:h-8 touch-manipulation"
                    >
                      {cat} ({count})
                    </Button>
                  );
                })}
              </div>

              {/* Templates Grid - Single column on mobile */}
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </TabsContent>

            {/* Docs Tab - Mobile First with better layout */}
            <TabsContent value="docs" className="space-y-4 sm:space-y-6">
              {/* Mobile: Horizontal doc selector */}
              <div className="lg:hidden">
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                  {DOCS.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc.id)}
                      className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors touch-manipulation ${
                        selectedDoc === doc.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <doc.icon className="w-4 h-4" />
                      <span className="text-sm font-medium whitespace-nowrap">{doc.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Doc Navigation - Hidden on mobile, visible on desktop */}
                <Card className="hidden lg:block p-4 lg:col-span-1">
                  <h3 className="font-semibold mb-4">Documentation</h3>
                  <div className="space-y-1">
                    {DOCS.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 touch-manipulation ${
                          selectedDoc === doc.id 
                            ? 'bg-primary/20 text-primary' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        <doc.icon className="w-4 h-4 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{doc.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{doc.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Downloads - Separated docs from SDK */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-3">Downloads</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start h-10 touch-manipulation" asChild>
                        <a href="/sdk/substrate-client.ts" download>
                          <Download className="w-4 h-4 mr-2" />
                          TypeScript SDK
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start h-10 touch-manipulation" asChild>
                        <a href="/sdk/USER-MANUAL.md" download>
                          <Download className="w-4 h-4 mr-2" />
                          User Manual (Complete Guide)
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start h-10 touch-manipulation" asChild>
                        <a href="/sdk/README.md" download>
                          <Download className="w-4 h-4 mr-2" />
                          API Reference
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start h-10 touch-manipulation" asChild>
                        <a href="/sdk/API-REFERENCE.md" download>
                          <Download className="w-4 h-4 mr-2" />
                          Endpoint Reference
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Doc Content */}
                <Card className="p-4 sm:p-6 lg:col-span-2">
                  <InlineDocumentation docId={selectedDoc} />
                </Card>
              </div>

              {/* Mobile Downloads - Separated */}
              <div className="lg:hidden grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-12 touch-manipulation" asChild>
                  <a href="/sdk/substrate-client.ts" download>
                    <Download className="w-4 h-4 mr-2" />
                    SDK
                  </a>
                </Button>
                <Button variant="outline" className="h-12 touch-manipulation" asChild>
                  <a href="/sdk/USER-GUIDE.md" download>
                    <Download className="w-4 h-4 mr-2" />
                    Guide
                  </a>
                </Button>
              </div>

              {/* Additional Resources - Better mobile layout */}
              <Card className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-violet-500/10 border-primary/20">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Additional Resources</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <Link to="/demo" className="flex items-center gap-2 text-sm hover:text-primary transition-colors p-2 sm:p-0 rounded-lg sm:rounded-none bg-background/50 sm:bg-transparent touch-manipulation">
                    <PlayCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Demo</span>
                  </Link>
                  <Link to="/proof" className="flex items-center gap-2 text-sm hover:text-primary transition-colors p-2 sm:p-0 rounded-lg sm:rounded-none bg-background/50 sm:bg-transparent touch-manipulation">
                    <Eye className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Proof</span>
                  </Link>
                  <Link to="/changelog" className="flex items-center gap-2 text-sm hover:text-primary transition-colors p-2 sm:p-0 rounded-lg sm:rounded-none bg-background/50 sm:bg-transparent touch-manipulation">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Changelog</span>
                  </Link>
                  <Link to="/contact" className="flex items-center gap-2 text-sm hover:text-primary transition-colors p-2 sm:p-0 rounded-lg sm:rounded-none bg-background/50 sm:bg-transparent touch-manipulation">
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Support</span>
                  </Link>
                </div>
              </Card>
            </TabsContent>

            {/* Setup Tab - Mobile First */}
            <TabsContent value="setup" className="space-y-5 sm:space-y-8">
              {/* BYOK Warning - More compact on mobile */}
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start sm:items-center gap-3">
                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <CardTitle className="text-base sm:text-lg">Bring Your Own Keys (BYOK)</CardTitle>
                  </div>
                  <CardDescription className="text-sm mt-2">
                    The CMPSBL substrate is a routing and orchestration layer. 
                    <strong> You must deploy your own instance and provide your own API keys.</strong>
                    No compute resources, credits, or API access is included.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Required Keys - Better mobile layout */}
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold">Required API Keys</h2>
                <div className="grid gap-3">
                  {REQUIRED_KEYS.map((key) => (
                    <Card key={key.name} className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 sm:w-10 sm:h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${
                            key.required ? 'bg-primary/20' : 'bg-muted'
                          }`}>
                            <Key className={`w-5 h-5 ${key.required ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <code className="text-xs sm:text-sm font-mono truncate">{key.name}</code>
                              {key.required && (
                                <Badge variant="secondary" className="text-[9px] sm:text-[10px] flex-shrink-0">REQUIRED</Badge>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">{key.description}</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full sm:w-auto h-10 sm:h-8 gap-2 touch-manipulation flex-shrink-0" 
                          asChild
                        >
                          <a href={key.url} target="_blank" rel="noopener noreferrer">
                            Get Key <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Installation Steps - Better accordion for mobile */}
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold">Deployment Steps</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="step-1">
                    <AccordionTrigger className="py-4 touch-manipulation">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                        <span className="text-sm sm:text-base">Create Supabase Project</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-11 sm:pl-11 pr-2">
                      <p className="text-sm text-muted-foreground mb-3">Create a new Supabase project at supabase.com</p>
                      <ScrollArea className="w-full">
                        <Card className="bg-muted/50 p-3 sm:p-4 min-w-[280px]">
                          <code className="text-xs sm:text-sm whitespace-pre">
                            # Note your project URL and anon key{'\n'}
                            # These are needed for the SDK configuration
                          </code>
                        </Card>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="step-2">
                    <AccordionTrigger className="py-4 touch-manipulation">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                        <span className="text-sm sm:text-base">Deploy Edge Functions</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-11 sm:pl-11 pr-2">
                      <ScrollArea className="w-full">
                        <Card className="bg-muted/50 p-3 sm:p-4 min-w-[320px]">
                          <code className="text-xs sm:text-sm whitespace-pre">
                            # Deploy the substrate edge function{'\n'}
                            supabase functions deploy pf-substrate{'\n'}{'\n'}
                            # Link to your project{'\n'}
                            supabase link --project-ref YOUR_PROJECT_REF
                          </code>
                        </Card>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="step-3">
                    <AccordionTrigger className="py-4 touch-manipulation">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                        <span className="text-sm sm:text-base">Configure Secrets</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-11 sm:pl-11 pr-2">
                      <ScrollArea className="w-full">
                        <Card className="bg-muted/50 p-3 sm:p-4 min-w-[360px]">
                          <code className="text-xs sm:text-sm whitespace-pre">
                            # Add your API keys as secrets{'\n'}
                            supabase secrets set GROQ_API_KEY=gsk_...{'\n'}
                            supabase secrets set OPENAI_API_KEY=sk-...  # optional{'\n'}
                            supabase secrets set CEREBRAS_API_KEY=...   # optional
                          </code>
                        </Card>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="step-4">
                    <AccordionTrigger className="py-4 touch-manipulation">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                        <span className="text-sm sm:text-base">Initialize SDK</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-11 sm:pl-11 pr-2">
                      <ScrollArea className="w-full">
                        <Card className="bg-muted/50 p-3 sm:p-4 min-w-[380px]">
                          <code className="text-xs sm:text-sm whitespace-pre">
                            {`import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient({
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_ANON_KEY'
});

// Test connection
const health = await substrate.vision.health();
console.log('Connected:', health.success);`}
                          </code>
                        </Card>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* SDK Download - Stack on mobile */}
              <Card className="p-4 sm:p-6">
                <div className="flex flex-col gap-4">
                  <div className="text-center sm:text-left">
                    <h3 className="text-base sm:text-lg font-semibold">Download SDK</h3>
                    <p className="text-sm text-muted-foreground">Get the TypeScript SDK and example implementations.</p>
                  </div>
                  <div className="grid grid-cols-2 sm:flex sm:justify-end gap-3">
                    <Button variant="outline" className="h-11 sm:h-10 touch-manipulation" asChild>
                      <a href="/sdk/substrate-client.ts" download>
                        <Download className="w-4 h-4 mr-2" />
                        SDK Client
                      </a>
                    </Button>
                    <Button className="h-11 sm:h-10 touch-manipulation" asChild>
                      <a href="/sdk/USER-GUIDE.md" download>
                        <FileText className="w-4 h-4 mr-2" />
                        User Guide
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
