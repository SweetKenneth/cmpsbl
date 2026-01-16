/**
 * promptfluid® Developer Portal
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
  Radio, Lightbulb, Flame, Star, ArrowRight, Globe
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

// 15 Templates covering all modules and use cases
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

// Module quick reference
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
    <Button variant="ghost" size="sm" onClick={handleCopy} className={`h-7 px-2 ${className}`}>
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
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
    <Card className="group hover:border-primary/40 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryColors[template.category]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`text-[10px] ${categoryColors[template.category]}`}>
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
        </div>
        <CardDescription className="text-sm mt-2">
          {template.description}
        </CardDescription>
        <div className="flex flex-wrap gap-1 mt-2">
          {template.features.map((feature) => (
            <Badge key={feature} variant="secondary" className="text-[10px]">
              {feature}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mb-3"
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
            >
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <CopyButton text={template.code} />
                </div>
                <ScrollArea className="h-[280px] rounded-lg bg-muted/50 border border-border/50">
                  <pre className="p-4 text-xs font-mono overflow-x-auto">
                    <code className="text-foreground/90">{template.code}</code>
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
          <Card className="bg-muted/50 p-4">
            <code className="text-sm">
              # Clone and deploy to your Supabase project<br/>
              supabase functions deploy pf-substrate<br/><br/>
              # Add your API keys as secrets<br/>
              supabase secrets set GROQ_API_KEY=your_key_here
            </code>
          </Card>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">3. Make Your First Call</h3>
          <Card className="bg-muted/50 p-4">
            <code className="text-sm">
              {`POST https://YOUR_PROJECT.supabase.co/functions/v1/pf-substrate
              
{
  "module": "vision",
  "action": "health",
  "payload": {}
}`}
            </code>
          </Card>
        </div>
      </div>
    ),
    api: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Request Format</h3>
          <Card className="bg-muted/50 p-4">
            <code className="text-sm">
              {`POST /functions/v1/pf-substrate
Content-Type: application/json
Authorization: Bearer <jwt> (optional)

{
  "module": "brain|decode|defense|nexus|vision|dream|system",
  "action": "<action-name>",
  "payload": { /* action parameters */ }
}`}
            </code>
          </Card>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Response Format</h3>
          <Card className="bg-muted/50 p-4">
            <code className="text-sm">
              {`{
  "success": true,
  "module": "brain",
  "action": "query",
  "data": { /* action-specific response */ },
  "timestamp": "2026-01-16T..."
}`}
            </code>
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
          <Card className="bg-muted/50 p-4">
            <code className="text-sm">
              {`import { SubstrateClient } from './substrate-client';

const substrate = new SubstrateClient({
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_ANON_KEY'
});

// Set auth token for authenticated operations
substrate.setAuthToken(userJwtToken);`}
            </code>
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
            <Card className="bg-muted/50 p-4">
              <code className="text-sm">
                Authorization: Bearer &lt;supabase-jwt&gt;
              </code>
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
        title="Developer Portal — promptfluid® Substrate"
        description="Build autonomous AI systems with the promptfluid substrate. Templates, SDK, and integration guides for developers and researchers."
        keywords={['ai substrate', 'developer portal', 'ai api', 'cognitive orchestration', 'ai templates']}
      />
      <PublicNav />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-violet-500/20 border border-primary/30 text-sm mb-6"
            >
              <Code className="w-4 h-4 text-primary" />
              <span className="font-medium">Developer Portal v2026.01</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Build on the{' '}
              <span className="bg-gradient-to-r from-primary via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Cognitive Substrate
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            >
              Memory, learning, security, and AI routing for autonomous systems.
              Deploy your own instance. Bring your own keys.
            </motion.p>

            {/* API Key Warning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-8"
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm text-left">
                <strong>BYOK Required:</strong> You must deploy your own substrate instance and provide your own AI provider API keys.
                No compute resources are included.
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3"
            >
              <Button size="lg" className="gap-2" onClick={() => setActiveTab('templates')}>
                <PlayCircle className="w-5 h-5" />
                Browse Templates
              </Button>
              <Button size="lg" variant="outline" className="gap-2" onClick={() => setActiveTab('docs')}>
                <Download className="w-5 h-5" />
                Get SDK
              </Button>
              <Link to="/demo">
                <Button size="lg" variant="ghost" className="gap-2">
                  <Zap className="w-5 h-5" />
                  Live Demo
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 flex-1">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 h-12">
              <TabsTrigger value="overview" className="gap-2">
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2">
                <FileCode className="w-4 h-4" />
                <span className="hidden sm:inline">Templates</span>
              </TabsTrigger>
              <TabsTrigger value="docs" className="gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Docs</span>
              </TabsTrigger>
              <TabsTrigger value="setup" className="gap-2">
                <Key className="w-4 h-4" />
                <span className="hidden sm:inline">Setup</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Quick Stats */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Modules', value: '7', icon: Layers },
                  { label: 'Actions', value: '50+', icon: Zap },
                  { label: 'Templates', value: '15', icon: FileCode },
                  { label: 'Providers', value: '4+', icon: Server },
                ].map((stat) => (
                  <Card key={stat.label} className="text-center py-6">
                    <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </Card>
                ))}
              </div>

              {/* Module Overview with Actions */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Substrate Modules</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {MODULES.map((mod) => (
                    <Card key={mod.name} className="p-4 hover:border-primary/40 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-${mod.color}-500/20 flex items-center justify-center`}>
                          <mod.icon className={`w-5 h-5 text-${mod.color}-400`} />
                        </div>
                        <div>
                          <h3 className="font-medium">{mod.name}</h3>
                          <p className="text-xs text-muted-foreground">{mod.desc}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {mod.actions.slice(0, 4).map((action) => (
                          <Badge key={action} variant="secondary" className="text-[9px]">
                            {action}
                          </Badge>
                        ))}
                        {mod.actions.length > 4 && (
                          <Badge variant="outline" className="text-[9px]">
                            +{mod.actions.length - 4}
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Start Code */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Quick Start</h2>
                <Card className="relative overflow-hidden">
                  <div className="absolute top-4 right-4">
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
                  <pre className="p-6 text-sm font-mono overflow-x-auto bg-muted/30">
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
                </Card>
              </div>

              {/* CTA */}
              <Card className="p-6 bg-gradient-to-r from-primary/10 to-violet-500/10 border-primary/20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Ready to build?</h3>
                    <p className="text-muted-foreground">Get the SDK and start building in minutes.</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" asChild>
                      <a href="/sdk/substrate-client.ts" download>
                        <Download className="w-4 h-4 mr-2" />
                        Download SDK
                      </a>
                    </Button>
                    <Button onClick={() => setActiveTab('templates')}>
                      View Templates
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={categoryFilter === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter(null)}
                >
                  All ({TEMPLATES.length})
                </Button>
                {['brain', 'decode', 'defense', 'nexus', 'vision', 'dream', 'system'].map((cat) => {
                  const count = TEMPLATES.filter(t => t.category === cat).length;
                  if (count === 0) return null;
                  return (
                    <Button
                      key={cat}
                      variant={categoryFilter === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCategoryFilter(cat)}
                      className="capitalize"
                    >
                      {cat} ({count})
                    </Button>
                  );
                })}
              </div>

              {/* Templates Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </TabsContent>

            {/* Docs Tab */}
            <TabsContent value="docs" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Doc Navigation */}
                <Card className="p-4 lg:col-span-1">
                  <h3 className="font-semibold mb-4">Documentation</h3>
                  <div className="space-y-1">
                    {DOCS.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                          selectedDoc === doc.id 
                            ? 'bg-primary/20 text-primary' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        <doc.icon className="w-4 h-4" />
                        <div>
                          <p className="text-sm font-medium">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">{doc.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Downloads */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-3">Downloads</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <a href="/sdk/substrate-client.ts" download>
                          <Download className="w-4 h-4 mr-2" />
                          TypeScript SDK
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <a href="/sdk/README.md" download>
                          <Download className="w-4 h-4 mr-2" />
                          SDK Readme
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Doc Content */}
                <Card className="p-6 lg:col-span-2">
                  <InlineDocumentation docId={selectedDoc} />
                </Card>
              </div>

              {/* Additional Resources */}
              <Card className="p-6 bg-gradient-to-r from-primary/10 to-violet-500/10 border-primary/20">
                <h3 className="text-lg font-semibold mb-4">Additional Resources</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link to="/demo" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                    <PlayCircle className="w-4 h-4" />
                    Interactive Demo
                  </Link>
                  <Link to="/proof" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                    <Eye className="w-4 h-4" />
                    Proof Mode
                  </Link>
                  <Link to="/changelog" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                    <FileText className="w-4 h-4" />
                    Changelog
                  </Link>
                  <Link to="/contact" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    Get Support
                  </Link>
                </div>
              </Card>
            </TabsContent>

            {/* Setup Tab */}
            <TabsContent value="setup" className="space-y-8">
              {/* BYOK Warning */}
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                    <CardTitle>Bring Your Own Keys (BYOK)</CardTitle>
                  </div>
                  <CardDescription>
                    The promptfluid substrate is a routing and orchestration layer. 
                    <strong> You must deploy your own instance and provide your own API keys.</strong>
                    No compute resources, credits, or API access is included.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Required Keys */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Required API Keys</h2>
                <div className="grid gap-3">
                  {REQUIRED_KEYS.map((key) => (
                    <Card key={key.name} className="p-4">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            key.required ? 'bg-primary/20' : 'bg-muted'
                          }`}>
                            <Key className={`w-5 h-5 ${key.required ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono">{key.name}</code>
                              {key.required && (
                                <Badge variant="secondary" className="text-[10px]">REQUIRED</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{key.description}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2" asChild>
                          <a href={key.url} target="_blank" rel="noopener noreferrer">
                            Get Key <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Installation Steps */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Deployment Steps</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="step-1">
                    <AccordionTrigger>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">1</div>
                        Create Supabase Project
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-11">
                      <p className="text-muted-foreground mb-3">Create a new Supabase project at supabase.com</p>
                      <Card className="bg-muted/50 p-4">
                        <code className="text-sm">
                          # Note your project URL and anon key<br/>
                          # These are needed for the SDK configuration
                        </code>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="step-2">
                    <AccordionTrigger>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">2</div>
                        Deploy Edge Functions
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-11">
                      <Card className="bg-muted/50 p-4">
                        <code className="text-sm">
                          # Deploy the substrate edge function<br/>
                          supabase functions deploy pf-substrate<br/><br/>
                          # Link to your project<br/>
                          supabase link --project-ref YOUR_PROJECT_REF
                        </code>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="step-3">
                    <AccordionTrigger>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">3</div>
                        Configure Secrets
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-11">
                      <Card className="bg-muted/50 p-4">
                        <code className="text-sm">
                          # Add your API keys as secrets<br/>
                          supabase secrets set GROQ_API_KEY=gsk_...<br/>
                          supabase secrets set OPENAI_API_KEY=sk-...  # optional<br/>
                          supabase secrets set CEREBRAS_API_KEY=...   # optional
                        </code>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="step-4">
                    <AccordionTrigger>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">4</div>
                        Initialize SDK
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-11">
                      <Card className="bg-muted/50 p-4">
                        <code className="text-sm">
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
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* SDK Download */}
              <Card className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Download SDK</h3>
                    <p className="text-muted-foreground">Get the TypeScript SDK and example implementations.</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" asChild>
                      <a href="/sdk/substrate-client.ts" download>
                        <Download className="w-4 h-4 mr-2" />
                        SDK Client
                      </a>
                    </Button>
                    <Button asChild>
                      <a href="/sdk/README.md" download>
                        <FileText className="w-4 h-4 mr-2" />
                        Documentation
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
