/**
 * promptfluid® Developer Portal
 * Public-facing page for developers and researchers to discover,
 * integrate, and build with the substrate.
 * 
 * IMPORTANT: Users must provide their own API keys.
 * This portal does not provide compute resources.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Code, Download, BookOpen, Key, Terminal, Zap, Shield, Brain,
  Eye, Moon, Layers, FileCode, Copy, Check, ExternalLink,
  Server, Lock, Rocket, AlertTriangle, ChevronRight, FileText,
  Bot, Image, MessageSquare, Network, Database, Activity,
  Cpu, GitBranch, Package, PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { SEO } from '@/components/SEO';
import { toast } from 'sonner';

// Template definitions
const TEMPLATES = [
  {
    id: 'chatbot',
    name: 'AI Chatbot',
    description: 'Conversational AI with memory, intent decoding, and multi-turn context',
    icon: MessageSquare,
    category: 'decode',
    difficulty: 'beginner',
    estimatedTime: '15 min',
    code: `import { decode } from '@/lib/substrate';

// Simple chatbot with session memory
async function chat(message: string, sessionId: string) {
  const response = await decode.chat(message, sessionId);
  return response.data?.reply;
}

// With intent extraction
async function smartChat(message: string) {
  const intent = await decode.intent(message);
  const reply = await decode.chat(message);
  return { intent: intent.data, reply: reply.data };
}`
  },
  {
    id: 'memory-system',
    name: 'Knowledge Base',
    description: 'Store, query, and evolve knowledge with confidence scoring',
    icon: Brain,
    category: 'brain',
    difficulty: 'beginner',
    estimatedTime: '20 min',
    code: `import { brain } from '@/lib/substrate';

// Store knowledge
await brain.remember(
  'Neural networks learn through backpropagation',
  'fact',
  0.95, // confidence
  { domain: 'ml', verified: true }
);

// Query knowledge
const results = await brain.query('machine learning', 10);

// Reinforce good memories
await brain.reinforce(memoryId, 0.1);`
  },
  {
    id: 'bot-detection',
    name: 'Bot Detection',
    description: 'Protect your endpoints from bots with fingerprint analysis',
    icon: Shield,
    category: 'defense',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    code: `import { defense } from '@/lib/substrate';

// Analyze request
const analysis = await defense.analyze({
  fingerprint: {
    canvas: canvasHash,
    webgl: webglHash,
    audio: audioHash,
    fonts: fontList
  },
  ip: clientIp,
  userAgent: navigator.userAgent
});

// Check if bot
if (analysis.data?.risk_score > 0.7) {
  return blockRequest();
}

// Check IP reputation
const reputation = await defense.reputation(clientIp);`
  },
  {
    id: 'ai-router',
    name: 'Multi-Model Router',
    description: 'Route AI requests to the best available provider automatically',
    icon: Network,
    category: 'nexus',
    difficulty: 'intermediate',
    estimatedTime: '20 min',
    code: `import { nexus } from '@/lib/substrate';

// Auto-route to best provider
const response = await nexus.route('Explain quantum computing');

// Generate text with specific model
const text = await nexus.text(
  'Write a poem about AI',
  'gpt-4' // optional model override
);

// Generate image
const image = await nexus.image(
  'A surreal dreamscape with floating islands'
);

// Check provider status
const providers = await nexus.providers();`
  },
  {
    id: 'observability',
    name: 'System Monitoring',
    description: 'Real-time health metrics, alerts, and distributed tracing',
    icon: Activity,
    category: 'vision',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    code: `import { vision } from '@/lib/substrate';

// Quick health check
const health = await vision.healthSnapshot();

// Full dashboard data
const dashboard = await vision.dashboard();

// Create alert
await vision.alert('warn', 'High latency detected', {
  endpoint: '/api/chat',
  latency_ms: 2500
});

// Distributed tracing
const trace = await vision.trace(undefined, {
  create: true,
  module: 'brain',
  action: 'query'
});`
  },
  {
    id: 'dream-feeder',
    name: 'Dream Processor',
    description: 'Feed dreams into the cognitive substrate for synthesis',
    icon: Moon,
    category: 'dream',
    difficulty: 'beginner',
    estimatedTime: '15 min',
    code: `import { dream } from '@/lib/substrate';

// Feed a dream
await dream.feed(
  'I was floating through an endless library...',
  'dream' // or 'nightmare', 'vision'
);

// Check Dream-Eater state
const state = await dream.status();

// Interpret a dream
const interpretation = await dream.interpret(
  'Flying over mountains with silver wings'
);

// Trigger mutation cycle
await dream.mutate();`
  },
  {
    id: 'learning-loop',
    name: 'Self-Learning Agent',
    description: 'Create an agent that learns and improves from interactions',
    icon: Cpu,
    category: 'brain',
    difficulty: 'advanced',
    estimatedTime: '45 min',
    code: `import { brain, decode } from '@/lib/substrate';

async function learningAgent(input: string) {
  // Recall relevant context
  const context = await brain.query(input, 5);
  
  // Process with context
  const response = await decode.chat(input);
  
  // Learn from interaction
  await brain.learn(
    \`Q: \${input}\\nA: \${response.data?.reply}\`,
    'interaction'
  );
  
  // Trigger reflection periodically
  if (shouldReflect()) {
    await brain.reflect();
  }
  
  return response.data?.reply;
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
    code: `import { defense, vision } from '@/lib/substrate';

// Get security posture
const posture = await defense.posture();

// Detect anomalies (statistical z-score)
const anomalies = await defense.anomalyProbe(24);

// Check rate limits
const limits = await defense.limits();

// Get threat analytics
const threats = await vision.analytics();

// Combined security view
const securityState = {
  posture: posture.data,
  anomalies: anomalies.data?.anomalies,
  rateLimits: limits.data,
  threats24h: threats.data
};`
  },
  {
    id: 'knowledge-graph',
    name: 'Knowledge Graph',
    description: 'Build and query interconnected knowledge structures',
    icon: GitBranch,
    category: 'brain',
    difficulty: 'advanced',
    estimatedTime: '50 min',
    code: `import { brain } from '@/lib/substrate';

// Build knowledge graph
await brain.graphBuild();

// Get graph summary
const summary = await brain.graphSummary();
// Returns: nodes, edges, clusters, connectivity

// Store connected memories
await brain.remember('Concept A', 'concept');
await brain.remember('Concept B', 'concept');

// Reinforce connections
await brain.reinforce(edgeId, 0.2);

// Cross-domain synthesis
const insights = await brain.synthesize();`
  },
  {
    id: 'quota-monitor',
    name: 'AI Cost Monitor',
    description: 'Track AI usage, costs, and quota consumption in real-time',
    icon: Database,
    category: 'vision',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    code: `import { vision, nexus } from '@/lib/substrate';

// Get quota status
const quota = await vision.quota();
// Returns: daily calls, tokens, cost estimates, pressure

// Get routing analytics
const routeStats = await nexus.routeStats();
// Returns: per-provider breakdown, success rates, costs

// Monitor usage
function checkUsage() {
  const { pressure } = quota.data;
  if (pressure > 0.8) {
    alert('Approaching daily limit!');
  }
}`
  },
  {
    id: 'session-analytics',
    name: 'Session Analytics',
    description: 'Analyze user sessions with cross-module activity tracking',
    icon: Eye,
    category: 'brain',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    code: `import { brain, vision } from '@/lib/substrate';

// Session reflection (last 24 hours)
const session = await brain.sessionReflection(24);

// Introspection - deep substrate analysis
const introspection = await vision.introspection();

// Get patterns and insights
const patterns = await brain.patterns();

// Curiosity log - what the system wants to learn
const curiosity = await brain.curiosity();

// Explore a curiosity query
await brain.explore('What is quantum entanglement?');`
  },
  {
    id: 'full-stack-ai',
    name: 'Full-Stack AI App',
    description: 'Complete AI application with all substrate modules integrated',
    icon: Layers,
    category: 'system',
    difficulty: 'advanced',
    estimatedTime: '60 min',
    code: `import { substrate, brain, decode, defense, 
         nexus, vision, system } from '@/lib/substrate';

class AIApplication {
  async initialize() {
    // Check system health
    const health = await system.health();
    if (!health.data?.healthy) {
      await system.heal();
    }
  }

  async processRequest(req: Request) {
    // 1. Security check
    const threat = await defense.analyze(req.fingerprint);
    if (threat.data?.blocked) return { error: 'Blocked' };

    // 2. Decode intent
    const intent = await decode.intent(req.message);

    // 3. Recall context
    const context = await brain.query(req.message, 5);

    // 4. Route to AI
    const response = await nexus.route(req.message);

    // 5. Learn from interaction
    await brain.learn(req.message + response, 'interaction');

    // 6. Log for observability
    await vision.trace(req.id, { create: true });

    return response;
  }
}`
  }
];

// Documentation sections
const DOCS = [
  {
    id: 'quickstart',
    title: 'Quick Start Guide',
    description: 'Get up and running in 5 minutes',
    icon: Rocket,
    path: '/docs/substrate/README.md'
  },
  {
    id: 'user-manual',
    title: 'User Manual',
    description: 'Complete guide to all modules and actions',
    icon: BookOpen,
    path: '/docs/substrate/USER-MANUAL.md'
  },
  {
    id: 'architecture',
    title: 'Architecture',
    description: 'System design and module interactions',
    icon: Layers,
    path: '/docs/substrate/ARCHITECTURE.md'
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    description: 'All 50+ actions with parameters',
    icon: Code,
    path: '/docs/substrate/MODULE-ACTIONS-REGISTRY.md'
  },
  {
    id: 'changelog',
    title: 'Changelog',
    description: 'Version history and updates',
    icon: FileText,
    path: '/docs/substrate/CHANGELOG.md'
  },
  {
    id: 'decode-rfc',
    title: 'Decode RFC',
    description: 'The interpreter primitive specification',
    icon: Terminal,
    path: '/docs/substrate/DecodeRFC.md'
  }
];

// Provider requirements
const REQUIRED_KEYS = [
  { name: 'GROQ_API_KEY', provider: 'Groq', url: 'https://console.groq.com', required: true },
  { name: 'OPENAI_API_KEY', provider: 'OpenAI', url: 'https://platform.openai.com', required: false },
  { name: 'CEREBRAS_API_KEY', provider: 'Cerebras', url: 'https://cloud.cerebras.ai', required: false },
  { name: 'TOGETHER_API_KEY', provider: 'Together', url: 'https://together.ai', required: false },
  { name: 'DEEPSEEK_API_KEY', provider: 'DeepSeek', url: 'https://platform.deepseek.com', required: false },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2">
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
              <ScrollArea className="h-[250px] rounded-lg bg-muted/50 border border-border/50">
                <pre className="p-4 text-xs font-mono overflow-x-auto">
                  <code className="text-foreground/90">{template.code}</code>
                </pre>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DevPortal() {
  const [activeTab, setActiveTab] = useState('overview');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filteredTemplates = categoryFilter 
    ? TEMPLATES.filter(t => t.category === categoryFilter)
    : TEMPLATES;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Developer Portal — promptfluid® Substrate"
        description="Build autonomous AI systems with the promptfluid substrate. Templates, documentation, and integration guides for developers and researchers."
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
              Build with the{' '}
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
              The promptfluid® substrate provides memory, learning, security, and AI routing
              for autonomous systems. Open architecture. Bring your own keys.
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
                <strong>BYOK:</strong> Bring Your Own Keys. You must provide your own AI provider API keys.
                The substrate does not include compute resources.
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
                <BookOpen className="w-5 h-5" />
                Read Docs
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
                  { label: 'Templates', value: '12', icon: FileCode },
                  { label: 'Providers', value: '4+', icon: Server },
                ].map((stat) => (
                  <Card key={stat.label} className="text-center py-6">
                    <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </Card>
                ))}
              </div>

              {/* Module Overview */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Substrate Modules</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Brain', icon: Brain, desc: 'Memory, learning, knowledge graphs', color: 'violet' },
                    { name: 'Decode', icon: MessageSquare, desc: 'Intent decoding, chat interface', color: 'cyan' },
                    { name: 'Defense', icon: Shield, desc: 'Bot detection, threat analysis', color: 'emerald' },
                    { name: 'Nexus', icon: Network, desc: 'Multi-provider AI routing', color: 'amber' },
                    { name: 'Vision', icon: Eye, desc: 'Observability, metrics, tracing', color: 'rose' },
                    { name: 'Dream', icon: Moon, desc: 'Dream processing, synthesis', color: 'purple' },
                  ].map((mod) => (
                    <Card key={mod.name} className="p-4 hover:border-primary/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-${mod.color}-500/20 flex items-center justify-center`}>
                          <mod.icon className={`w-5 h-5 text-${mod.color}-400`} />
                        </div>
                        <div>
                          <h3 className="font-medium">{mod.name}</h3>
                          <p className="text-sm text-muted-foreground">{mod.desc}</p>
                        </div>
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
                    <CopyButton text={`import { substrate, brain, decode, nexus } from '@/lib/substrate';

// Query the brain
const memories = await brain.query('machine learning', 10);

// Chat with Decode
const reply = await decode.chat('Hello!', 'session_123');

// Route to AI provider
const response = await nexus.route('Explain quantum computing');`} />
                  </div>
                  <pre className="p-6 text-sm font-mono overflow-x-auto bg-muted/30">
{`import { substrate, brain, decode, nexus } from '@/lib/substrate';

// Query the brain
const memories = await brain.query('machine learning', 10);

// Chat with Decode
const reply = await decode.chat('Hello!', 'session_123');

// Route to AI provider
const response = await nexus.route('Explain quantum computing');`}
                  </pre>
                </Card>
              </div>
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
                  All Templates
                </Button>
                {['brain', 'decode', 'defense', 'nexus', 'vision', 'dream'].map((cat) => (
                  <Button
                    key={cat}
                    variant={categoryFilter === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter(cat)}
                    className="capitalize"
                  >
                    {cat}
                  </Button>
                ))}
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DOCS.map((doc) => (
                  <Card key={doc.id} className="group hover:border-primary/40 transition-all">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <doc.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{doc.title}</CardTitle>
                          <CardDescription className="text-sm">{doc.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
                          <a href={doc.path} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                            View
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2" asChild>
                          <a href={doc.path} download>
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Additional Resources */}
              <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/20">
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
              </div>
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
                    <strong> You must provide your own API keys</strong> for AI providers.
                    The substrate does not include compute resources or credits.
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
                            <p className="text-sm text-muted-foreground">{key.provider}</p>
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
                <h2 className="text-2xl font-bold">Installation</h2>
                <div className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: 'Clone or Fork the Repository',
                      code: 'git clone https://github.com/promptfluid/substrate.git\ncd substrate'
                    },
                    {
                      step: 2,
                      title: 'Install Dependencies',
                      code: 'npm install\n# or\nbun install'
                    },
                    {
                      step: 3,
                      title: 'Configure Environment',
                      code: `# Create .env file with your keys
GROQ_API_KEY=your_groq_key
OPENAI_API_KEY=your_openai_key  # optional
CEREBRAS_API_KEY=your_cerebras_key  # optional`
                    },
                    {
                      step: 4,
                      title: 'Deploy Edge Functions',
                      code: 'supabase functions deploy pf-substrate'
                    },
                    {
                      step: 5,
                      title: 'Start Development',
                      code: 'npm run dev'
                    }
                  ].map((item) => (
                    <Card key={item.step} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">{item.step}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium mb-2">{item.title}</h3>
                          <div className="relative">
                            <div className="absolute top-2 right-2">
                              <CopyButton text={item.code} />
                            </div>
                            <pre className="p-3 rounded-lg bg-muted/50 text-xs font-mono overflow-x-auto">
                              {item.code}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* SDK Usage */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">SDK Usage</h2>
                <Card className="relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <CopyButton text={`// Import the substrate client
import { substrate, brain, decode, defense, nexus, vision, dream, system } from '@/lib/substrate';

// All modules are pre-configured singletons
// Just import and use:

// Memory operations
await brain.learn('New information', 'user');
await brain.query('search term', 10);

// Chat interface
await decode.chat('Hello!', 'session_id');

// Security
await defense.analyze({ fingerprint: {...} });

// AI routing
await nexus.route('Generate text');

// Monitoring
await vision.healthSnapshot();`} />
                  </div>
                  <pre className="p-6 text-sm font-mono overflow-x-auto bg-muted/30">
{`// Import the substrate client
import { substrate, brain, decode, defense, nexus, vision, dream, system } from '@/lib/substrate';

// All modules are pre-configured singletons
// Just import and use:

// Memory operations
await brain.learn('New information', 'user');
await brain.query('search term', 10);

// Chat interface
await decode.chat('Hello!', 'session_id');

// Security
await defense.analyze({ fingerprint: {...} });

// AI routing
await nexus.route('Generate text');

// Monitoring
await vision.healthSnapshot();`}
                  </pre>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
