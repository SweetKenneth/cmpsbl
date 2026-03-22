/**
 * Substrate Capabilities Documentation Page
 * Full reference for all cognitive capabilities in templates
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain, MessageSquare, Shield, Eye, Moon, Network, Activity,
  ChevronRight, Code, Copy, Check, Sparkles, BookOpen, ArrowLeft,
  Search, Database, Layers, TrendingUp, Gauge, Target, Workflow,
  HeartPulse, AlertTriangle, RefreshCw, Lightbulb, Fingerprint,
  Globe, FileText, Compass, Scale, Users, Accessibility, GitBranch
} from "lucide-react";
import { toast } from "sonner";
import { CAPABILITY_CATEGORIES } from "@/components/marketplace/SubstrateCapabilities";

// Code examples for each category
const CODE_EXAMPLES: Record<string, { title: string; code: string; description: string }[]> = {
  memory: [
    {
      title: "Store a Memory",
      description: "Persist information with type and confidence scoring",
      code: `import { substrate } from '@/lib/substrate';

// Store a user preference
await substrate.brain.remember(
  'User prefers dark mode and minimal animations',
  'preference',
  0.95, // confidence
  { source: 'onboarding' }
);`
    },
    {
      title: "Recall Context",
      description: "Retrieve relevant memories for a query",
      code: `// Recall memories related to user preferences
const memories = await substrate.brain.recall(
  'user preferences',
  10 // limit
);

console.log(memories.data);
// [{ content: 'User prefers dark mode...', confidence: 0.95, tier: 'hot' }]`
    },
    {
      title: "Build Knowledge Graph",
      description: "Connect concepts with semantic relationships",
      code: `// Trigger graph building after learning
await substrate.brain.learn('Machine learning is a subset of AI');
await substrate.brain.learn('Neural networks power deep learning');

// Build connections
await substrate.brain.graphBuild();

// Query the graph
const graph = await substrate.brain.graph({ stats: true });
console.log(\`Nodes: \${graph.data.nodes}, Edges: \${graph.data.edges}\`);`
    },
  ],
  analysis: [
    {
      title: "Extract Intent",
      description: "Understand what users want from their input",
      code: `import { substrate } from '@/lib/substrate';

const result = await substrate.decode.intent(
  'I want to schedule a meeting for tomorrow at 3pm'
);

console.log(result.data);
// { intent: 'schedule', entity: 'meeting', time: 'tomorrow 3pm', confidence: 0.94 }`
    },
    {
      title: "Sentiment Analysis",
      description: "Analyze emotional tone in text",
      code: `const sentiment = await substrate.nexus.text(\`
  Analyze the sentiment of this review:
  "The product exceeded all my expectations. Absolutely love it!"
  
  Return JSON: { sentiment, score, keywords }
\`);

console.log(sentiment.data);
// { sentiment: 'positive', score: 0.92, keywords: ['exceeded', 'love'] }`
    },
    {
      title: "Detect Anomalies",
      description: "Flag unusual patterns in behavior",
      code: `// Analyze patterns over last 6 hours
const anomalies = await substrate.defense.anomaly('6h');

if (anomalies.data.detected) {
  console.log('Anomalies found:', anomalies.data.patterns);
  // Alert or take action
}`
    },
  ],
  relationships: [
    {
      title: "Build Entity Graph",
      description: "Extract and connect entities from text",
      code: `import { substrate } from '@/lib/substrate';

// Learn facts that create relationships
await substrate.brain.learn('Python was created by Guido van Rossum');
await substrate.brain.learn('Guido worked at Google and Dropbox');
await substrate.brain.learn('Python is used for machine learning');

// Build the graph
await substrate.brain.graphBuild();

// Query relationships
const summary = await substrate.brain.graphSummary();
console.log(summary.data.relationships);`
    },
    {
      title: "Traverse Connections",
      description: "Find paths between concepts",
      code: `// Query for connected concepts
const results = await substrate.brain.query('Python programming');

// Results include related concepts via graph traversal
results.data.forEach(memory => {
  console.log(memory.content, memory.relations);
});`
    },
  ],
  learning: [
    {
      title: "Adaptive Difficulty",
      description: "Scale content based on user mastery",
      code: `// Track user performance
const performance = {
  correctAnswers: 8,
  totalQuestions: 10,
  streak: 4
};

// Calculate next difficulty
const accuracy = performance.correctAnswers / performance.totalQuestions;
const nextDifficulty = accuracy > 0.8 ? 'advanced' : 
                       accuracy > 0.5 ? 'intermediate' : 'beginner';

// Reinforce successful patterns
if (accuracy > 0.7) {
  await substrate.brain.reinforce(sessionMemoryId, 1.5);
}`
    },
    {
      title: "Enable Continuous Learning",
      description: "Background learning from all interactions",
      code: `// Enable continuous learning mode
await substrate.brain.continuousLearn(true);

// Now all interactions contribute to knowledge
await substrate.decode.chat('How do I use the API?', sessionId);

// System automatically learns from the interaction
const coherence = await substrate.brain.coherenceCheck('deep');
console.log(\`Learning coherence: \${coherence.data.score}%\`);`
    },
  ],
  security: [
    {
      title: "Analyze Threats",
      description: "Evaluate requests for security risks",
      code: `import { substrate } from '@/lib/substrate';

// Analyze incoming request
const threat = await substrate.defense.analyze(
  {
    userAgent: navigator.userAgent,
    screenResolution: '1920x1080',
    timezone: 'America/New_York',
    languages: ['en-US']
  },
  '192.168.1.1' // IP address
);

if (threat.data.score > 0.7) {
  console.log('High threat detected:', threat.data.reasons);
  // Block or challenge
}`
    },
    {
      title: "Check Security Posture",
      description: "Get overall security status",
      code: `const posture = await substrate.defense.posture();

console.log({
  threatLevel: posture.data.threat_level,
  activeThreats: posture.data.active_threats,
  blockedIPs: posture.data.blocked_ips,
  recentAttacks: posture.data.recent_attacks
});`
    },
  ],
  evolution: [
    {
      title: "Trigger Dream Cycle",
      description: "Run background optimization",
      code: `import { substrate } from '@/lib/substrate';

// Trigger a dream cycle
const dream = await substrate.dream.cycle();

console.log({
  memoriesProcessed: dream.data.memories_processed,
  patternsFound: dream.data.patterns,
  improvements: dream.data.improvements
});`
    },
    {
      title: "Synthesize Insights",
      description: "Combine knowledge across domains",
      code: `// Cross-domain synthesis
const synthesis = await substrate.brain.synthesize();

console.log({
  newConnections: synthesis.data.new_connections,
  mergedConcepts: synthesis.data.merged,
  confidenceBoosts: synthesis.data.reinforced
});`
    },
  ],
  observability: [
    {
      title: "Health Check",
      description: "Quick system health snapshot",
      code: `import { substrate } from '@/lib/substrate';

const health = await substrate.vision.healthSnapshot();

console.log({
  overall: health.data.overall_health,
  modules: health.data.module_status,
  latency: health.data.avg_latency_ms
});`
    },
    {
      title: "Create Trace",
      description: "Distributed tracing for debugging",
      code: `// Start a trace
const trace = await substrate.vision.trace(undefined, {
  create: true,
  module: 'brain',
  action: 'query'
});

// Use trace ID for correlation
console.log('Trace ID:', trace.data.trace_id);

// Later: query the trace
const traceData = await substrate.vision.trace(trace.data.trace_id);`
    },
  ],
  accessibility: [
    {
      title: "Scan for Issues",
      description: "WCAG 2.2 accessibility audit",
      code: `import { substrate } from '@/lib/substrate';

// Scan current page
const scan = await substrate.inclusive.scan(window.location.href);

console.log({
  score: scan.data.score,
  level: scan.data.wcag_level,
  issues: scan.data.issues.length,
  critical: scan.data.issues.filter(i => i.severity === 'critical')
});`
    },
    {
      title: "Auto-Repair Issues",
      description: "Fix common accessibility problems",
      code: `// Get issues and repair
const scan = await substrate.inclusive.scan(url);

if (scan.data.issues.length > 0) {
  const repair = await substrate.inclusive.repair(scan.data.issues);
  
  console.log({
    fixed: repair.data.fixed_count,
    remaining: repair.data.remaining
  });
}`
    },
  ],
};

export default function SubstrateCapabilitiesDocs() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('memory');

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success('Code copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const currentCategory = CAPABILITY_CATEGORIES.find(c => c.id === activeCategory);
  const currentExamples = CODE_EXAMPLES[activeCategory] || [];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Capabilities Reference — Full SDK Catalog | CMPSBL"
        description="Complete reference for CMPSBL's substrate capabilities: memory operations, DREAM triggers, NEXUS routing, DEFENSE rules, EVOLUTION promotions, and resolver patterns with inline code examples."
        keywords={["capabilities reference", "SDK catalog", "CMPSBL documentation", "resolver patterns", "node capabilities"]}
      />
      
      <PublicNav />

      {/* Hero */}
      <section className="pt-24 pb-8 sm:pb-12 border-b border-border/50">
        <div className="container mx-auto px-4">
          <Link to="/store" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </Link>
          
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shrink-0">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <Badge className="mb-2 bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30">
                SDK Reference
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-bold">
                Substrate Capabilities
              </h1>
            </div>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-3xl">
            Every template includes <span className="text-foreground font-medium">48+ production-ready cognitive capabilities</span> from 
            the CMPSBL Substrate. Use these features via the SDK in any template.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">48+</p>
              <p className="text-xs text-muted-foreground">Capabilities</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">8</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">14</p>
              <p className="text-xs text-muted-foreground">Modules</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">TS</p>
              <p className="text-xs text-muted-foreground">Type-Safe</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-24">
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                Categories
              </h3>
              <nav className="space-y-1">
                {CAPABILITY_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeCategory === category.id;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{category.title}</span>
                      <ChevronRight className={`w-4 h-4 ml-auto shrink-0 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {currentCategory && (
              <motion.div
                key={currentCategory.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Category Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    {(() => {
                      const Icon = currentCategory.icon;
                      return (
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentCategory.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      );
                    })()}
                    <div>
                      <h2 className="text-2xl font-bold">{currentCategory.title}</h2>
                      <p className="text-muted-foreground">{currentCategory.description}</p>
                    </div>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid sm:grid-cols-2 gap-3 mb-8">
                  {currentCategory.features.map((feature, idx) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <Card key={idx} className="p-4">
                        <div className="flex items-start gap-3">
                          <FeatureIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-sm">{feature.name}</h4>
                            <p className="text-xs text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Code Examples */}
                {currentExamples.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Code className="w-5 h-5 text-primary" />
                      Code Examples
                    </h3>
                    
                    <div className="space-y-4">
                      {currentExamples.map((example, idx) => (
                        <Card key={idx} className="overflow-hidden">
                          <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border/50">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-sm font-medium">{example.title}</CardTitle>
                                <p className="text-xs text-muted-foreground">{example.description}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyCode(example.code, `${currentCategory.id}-${idx}`)}
                                className="h-8 gap-1.5"
                              >
                                {copiedCode === `${currentCategory.id}-${idx}` ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-neon-green" />
                                    <span className="text-xs">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span className="text-xs">Copy</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-0">
                            <ScrollArea className="max-h-64">
                              <pre className="p-4 text-sm font-mono overflow-x-auto">
                                <code className="text-muted-foreground">{example.code}</code>
                              </pre>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* SDK Import Note */}
                <Card className="mt-8 p-4 bg-gradient-to-r from-neon-cyan/5 to-neon-purple/5 border-neon-cyan/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-neon-cyan shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">All Templates Include the SDK</h4>
                      <p className="text-sm text-muted-foreground">
                        Every purchased or generated template includes the Substrate SDK pre-configured. 
                        Just import and use:
                      </p>
                      <code className="block mt-2 p-2 rounded bg-background text-xs font-mono">
                        import {"{ substrate }"} from '@/lib/substrate';
                      </code>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
