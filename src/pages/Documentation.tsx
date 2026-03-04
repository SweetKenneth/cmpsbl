/**
 * Documentation Hub
 * Complete developer documentation for CMPSBL cognitive substrate
 */

import { Link } from "react-router-dom";
import { BookOpen, Code, Zap, Shield, Database, FileText, ArrowRight, Key, Package, Globe, Bot, Sparkles, Plug } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { useMetric } from "@/stores/publicMetricsStore";
import heroImage from "@/assets/hero-substrate-neural.jpg";

export default function Documentation() {
  const version = useMetric('version');
  const modulesCount = useMetric('modulesCount');
  const capabilitiesCount = useMetric('capabilitiesCount');
  
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Memory Stream Documentation — CMPSBL"
        description="Complete technical documentation for the Memory Stream: system reference, API specs, crystallization guides, and deployment patterns."
        canonical="https://cmpsbl.com/documentation"
        image="https://cmpsbl.com/og/documentation.jpg"
        keywords={['CMPSBL documentation', 'memory stream docs', 'AI API reference', 'crystallization docs', 'signal to silicon']}
      />

      <PublicNav />

      {/* Hero with Neural Network Visual */}
      <section className="relative w-full">
        <div 
          className="absolute inset-0 h-[50vh] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        />
        <div className="absolute inset-0 h-[50vh] bg-gradient-to-b from-background/95 via-background/75 to-background dark:from-background/90 dark:via-background/60" />
        
        <div className="relative container mx-auto px-4 pt-32 pb-16">
          <nav className="mb-12">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </nav>
          
          <div className="max-w-4xl">
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
              <BookOpen className="w-3 h-3 mr-2" />
              Developer Resources
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Memory Stream Docs
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Complete guide to the CMPSBL Memory Stream. {capabilitiesCount}+ capabilities across 38 nodes and 12 sectors — everything you need to crystallize from signal to silicon.
              <span className="block mt-2 text-primary font-medium">100% BYOK — Zero compute costs for Stream operators.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Documentation Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="overview" className="space-y-8">
            {/* Mobile-optimized horizontal scrolling tabs with fade hints */}
            <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
              <div className="overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <TabsList className="inline-flex w-max md:grid md:w-full md:grid-cols-7 bg-muted/50 p-1 gap-1">
                <TabsTrigger value="overview" className="min-w-[100px] md:min-w-0 text-sm px-4 py-2.5 data-[state=active]:bg-background">Overview</TabsTrigger>
                <TabsTrigger value="byok" className="min-w-[80px] md:min-w-0 text-sm px-4 py-2.5 data-[state=active]:bg-background">BYOK</TabsTrigger>
                <TabsTrigger value="brain" className="min-w-[80px] md:min-w-0 text-sm px-4 py-2.5 data-[state=active]:bg-background">Brain</TabsTrigger>
                <TabsTrigger value="extensions" className="min-w-[100px] md:min-w-0 text-sm px-4 py-2.5 data-[state=active]:bg-background">Extensions</TabsTrigger>
                <TabsTrigger value="integrations" className="min-w-[110px] md:min-w-0 text-sm px-4 py-2.5 data-[state=active]:bg-background">Integrations</TabsTrigger>
                <TabsTrigger value="agents" className="min-w-[80px] md:min-w-0 text-sm px-4 py-2.5 data-[state=active]:bg-background">Agents</TabsTrigger>
                <TabsTrigger value="api" className="min-w-[60px] md:min-w-0 text-sm px-4 py-2.5 data-[state=active]:bg-background">API</TabsTrigger>
              </TabsList>
              </div>
              {/* Fade hints for mobile scroll */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
            </div>

            <TabsContent value="overview" className="space-y-6">
              <Card className="p-8 bg-card border-border">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Memory Stream Substrate</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  The Memory Stream is a continuous cognitive substrate that provides routing, memory, learning cycles,
                  observability, defense, and execution coordination for AI systems. Model-agnostic, provider-agnostic, evolving continuously.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: Key, title: "BYOK Architecture", desc: "Bring your own API keys, pay your own costs" },
                    { icon: Zap, title: "Brain", desc: "Adaptive AI learning core" },
                    { icon: Shield, title: "Defense", desc: "Bot protection system" },
                    { icon: Database, title: "Nexus", desc: "API orchestration mesh" },
                    { icon: Package, title: "Extensions", desc: "Custom module hooks" },
                    { icon: Bot, title: "Agents", desc: "Multi-agent orchestration" },
                    { icon: Plug, title: "Integration", desc: "Enterprise adapters & LLM governance" },
                  ].map((item) => (
                    <div key={item.title} className="p-6 bg-muted/30 rounded-lg border border-border">
                      <item.icon className="w-8 h-8 text-primary mb-3" />
                      <h3 className="font-semibold mb-1 text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="byok" className="space-y-6">
              <Card className="p-8 bg-card border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Key className="w-8 h-8 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">BYOK Architecture</h2>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  <strong>Bring Your Own Keys (BYOK)</strong> means developers register their own AI provider API keys and pay compute costs directly to providers. 
                  Zero LLM costs for substrate operators.
                </p>
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-primary bg-muted/30 rounded-r-lg">
                    <h4 className="font-semibold mb-1 text-foreground">Key Management</h4>
                    <code className="text-xs block bg-background p-3 rounded border border-border mt-2">
                      {`await substrate.keys.register('openai', 'sk-...');
await substrate.keys.list(); // Lists masked keys
await substrate.keys.rotate('openai', 'sk-new-...');
await substrate.keys.usage('openai', 30); // 30 day usage`}
                    </code>
                  </div>
                  <div className="p-4 border-l-4 border-primary bg-muted/30 rounded-r-lg">
                    <h4 className="font-semibold mb-1 text-foreground">AI Calls with Your Keys</h4>
                    <code className="text-xs block bg-background p-3 rounded border border-border mt-2">
                      {`await substrate.ai.chat(
  [{ role: 'user', content: 'Hello!' }],
  { provider: 'openai', model: 'gpt-4o' }
);`}
                    </code>
                  </div>
                  <div className="p-4 border-l-4 border-amber-500 bg-amber-500/10 rounded-r-lg">
                    <h4 className="font-semibold mb-1 text-foreground">Supported Providers</h4>
                    <p className="text-sm text-muted-foreground">
                      Groq, Cerebras, SambaNova, Google AI Studio, DeepSeek, Together, OpenRouter (BYOK: OpenAI, Anthropic, Mistral, Cohere, Fireworks)
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="brain" className="space-y-6">
              <Card className="p-8 bg-card border-border">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Brain Substrate</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  The Brain substrate is the cognitive core that learns, evolves, and optimizes system behavior through memory, learning cycles, and reinforcement.
                </p>
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-primary bg-muted/30 rounded-r-lg">
                    <h4 className="font-semibold mb-1 text-foreground">Training</h4>
                    <p className="text-sm text-muted-foreground">
                      The Brain automatically trains on system events every 4 hours via cron job.
                    </p>
                  </div>
                  <div className="p-4 border-l-4 border-primary bg-muted/30 rounded-r-lg">
                    <h4 className="font-semibold mb-1 text-foreground">Memory</h4>
                    <p className="text-sm text-muted-foreground">
                      Vector embeddings store learned patterns for instant recall and pattern matching.
                    </p>
                  </div>
                  <div className="p-4 border-l-4 border-primary bg-muted/30 rounded-r-lg">
                    <h4 className="font-semibold mb-1 text-foreground">Reinforcement</h4>
                    <p className="text-sm text-muted-foreground">
                      Successful patterns are reinforced hourly to improve accuracy over time.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="extensions" className="space-y-6">
              <Card className="p-8 bg-card border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="w-8 h-8 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">Extensions</h2>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Extend substrate functionality with custom hooks that run before or after module actions.
                </p>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2 text-foreground">Extension Types</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <code>brain_hook</code> — Memory and learning extensions</li>
                      <li>• <code>nexus_hook</code> — AI routing extensions</li>
                      <li>• <code>defense_hook</code> — Security extensions</li>
                      <li>• <code>dream_hook</code> — Dream processing extensions</li>
                      <li>• <code>vision_hook</code> — Observability extensions</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2 text-foreground">Register Extension</h4>
                    <code className="text-xs block bg-background p-3 rounded border border-border">
                      {`await substrate.extensions.register({
  name: 'my-hook',
  extension_type: 'brain_hook',
  hook_point: 'pre_query',
  endpoint_url: 'https://your-api.com/hook'
});`}
                    </code>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <Card className="p-8 bg-card border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-8 h-8 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">Integrations</h2>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Connect external services through the integration bus for payments, messaging, automation, and custom webhooks.
                </p>
                <div className="grid gap-4">
                  {[
                    { name: "Stripe", desc: "Payment processing and subscriptions" },
                    { name: "Twilio", desc: "SMS, voice, and messaging" },
                    { name: "Shopify", desc: "E-commerce and inventory" },
                    { name: "n8n", desc: "Workflow automation" },
                    { name: "Webhooks", desc: "Custom HTTP integrations" },
                  ].map((integration) => (
                    <div key={integration.name} className="p-4 bg-muted/30 rounded-lg border border-border">
                      <h4 className="font-semibold text-foreground">{integration.name}</h4>
                      <p className="text-sm text-muted-foreground">{integration.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <code className="text-xs block bg-background p-3 rounded border border-border">
                    {`await substrate.integrations.connect({
  name: 'My Stripe',
  integration_type: 'stripe',
  credentials: { api_key: 'sk_live_...' }
});

await substrate.integrations.call('integration-id', 'customers.create', { email: 'user@example.com' });`}
                  </code>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="agents" className="space-y-6">
              <Card className="p-8 bg-card border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Bot className="w-8 h-8 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">Multi-Agent Orchestration</h2>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Create and coordinate multiple AI agents using different patterns for complex tasks.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {[
                    { pattern: "Chain", desc: "Sequential execution — each agent builds on previous" },
                    { pattern: "Parallel", desc: "Concurrent execution — all agents work simultaneously" },
                    { pattern: "Supervisor", desc: "One agent manages and coordinates others" },
                    { pattern: "Debate", desc: "Agents discuss and argue to reach consensus" },
                    { pattern: "Swarm", desc: "Collaborative swarm intelligence" },
                  ].map((p) => (
                    <div key={p.pattern} className="p-4 bg-muted/30 rounded-lg border border-border">
                      <h4 className="font-semibold text-foreground">{p.pattern}</h4>
                      <p className="text-sm text-muted-foreground">{p.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <code className="text-xs block bg-background p-3 rounded border border-border">
                    {`// Create an agent
const agent = await substrate.agents.create({
  name: 'ResearchAgent',
  system_prompt: 'You are a research specialist...',
  provider: 'anthropic',
  model: 'claude-3-5-sonnet-20241022'
});

// Run agents with coordination pattern
await substrate.agents.run(
  [agent1.id, agent2.id],
  'Research quantum computing',
  { pattern: 'debate' }
);`}
                  </code>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="space-y-6">
              <Card className="p-8 bg-card border-border">
                <h2 className="text-2xl font-bold mb-4 text-foreground">API Reference</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">Authentication</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      All API requests require developer ID and app ID headers.
                    </p>
                    <code className="block bg-muted/30 p-4 rounded-lg text-xs border border-border">
                      {`X-Developer-ID: your-developer-uuid
X-App-ID: your-app-uuid
Authorization: Bearer <supabase-jwt>`}
                    </code>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">Base Endpoints</h3>
                    <div className="space-y-2 text-sm">
                      <code className="block bg-muted/30 p-3 rounded-lg border border-border">POST /functions/v1/pf-substrate — Core substrate</code>
                      <code className="block bg-muted/30 p-3 rounded-lg border border-border">POST /functions/v1/byok-proxy — BYOK AI routing</code>
                      <code className="block bg-muted/30 p-3 rounded-lg border border-border">POST /functions/v1/extension-registry — Extensions</code>
                      <code className="block bg-muted/30 p-3 rounded-lg border border-border">POST /functions/v1/integration-bus — Integrations</code>
                      <code className="block bg-muted/30 p-3 rounded-lg border border-border">POST /functions/v1/agent-mesh — Agents</code>
                    </div>
                  </div>

                  {/* Substrate Core Actions */}
                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">Core Substrate Actions</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      All actions are sent via POST to <code className="text-primary">/functions/v1/pf-substrate</code> with an <code className="text-primary">action</code> field in the JSON body.
                    </p>
                    <div className="space-y-3">
                      {[
                        { action: "brain.store", method: "POST", desc: "Store a memory with optional tags and tier", body: '{ "action": "brain.store", "content": "...", "tags": ["tag1"], "tier": "hot" }' },
                        { action: "brain.query", method: "POST", desc: "Semantic search across stored memories", body: '{ "action": "brain.query", "query": "search terms", "limit": 10, "tier": "all" }' },
                        { action: "brain.events", method: "POST", desc: "Retrieve recent brain events", body: '{ "action": "brain.events", "limit": 50 }' },
                        { action: "nexus.route", method: "POST", desc: "Route an AI request to the optimal provider", body: '{ "action": "nexus.route", "messages": [...], "task_type": "chat", "constraints": { "max_latency_ms": 3000 } }' },
                        { action: "defense.scan", method: "POST", desc: "Run a security scan on a domain or input", body: '{ "action": "defense.scan", "target": "example.com", "scan_type": "full" }' },
                        { action: "vision.metrics", method: "POST", desc: "Retrieve system health and latency metrics", body: '{ "action": "vision.metrics", "module": "brain", "period": "24h" }' },
                        { action: "dream.trigger", method: "POST", desc: "Trigger an off-cycle dream consolidation", body: '{ "action": "dream.trigger", "mode": "simnap" }' },
                        { action: "audit.query", method: "POST", desc: "Search the immutable audit ledger", body: '{ "action": "audit.query", "entity_type": "brain", "limit": 100 }' },
                      ].map((endpoint) => (
                        <div key={endpoint.action} className="p-4 bg-muted/30 rounded-lg border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px] font-mono">{endpoint.method}</Badge>
                            <code className="text-sm font-semibold text-foreground">{endpoint.action}</code>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{endpoint.desc}</p>
                          <code className="text-xs block bg-background p-3 rounded border border-border overflow-x-auto">
                            {endpoint.body}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* BYOK Proxy */}
                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">BYOK Proxy</h3>
                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px] font-mono">POST</Badge>
                        <code className="text-sm font-semibold text-foreground">/functions/v1/byok-proxy</code>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">Route AI requests through your own API keys with automatic provider selection.</p>
                      <code className="text-xs block bg-background p-3 rounded border border-border overflow-x-auto">
                        {`{
  "messages": [{ "role": "user", "content": "Hello" }],
  "provider": "openai",         // optional — auto-selects if omitted
  "model": "gpt-4o",            // optional — uses best available
  "temperature": 0.7,
  "max_tokens": 2048
}

// Response
{
  "content": "Hi! How can I help?",
  "provider": "openai",
  "model": "gpt-4o",
  "tokens_used": 42,
  "latency_ms": 820,
  "cost_millicents": 15
}`}
                      </code>
                    </div>
                  </div>

                  {/* Response Format */}
                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">Response Format</h3>
                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-2">All endpoints return a consistent envelope:</p>
                      <code className="text-xs block bg-background p-3 rounded border border-border overflow-x-auto">
                        {`// Success
{ "success": true, "data": { ... }, "meta": { "latency_ms": 42 } }

// Error
{ "success": false, "error": "Descriptive message", "code": "RATE_LIMITED" }`}
                      </code>
                    </div>
                  </div>

                  {/* Rate Limits */}
                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">Rate Limits</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { tier: "Free", rpm: "60 req/min", rpd: "1,000 req/day" },
                        { tier: "Pro", rpm: "600 req/min", rpd: "50,000 req/day" },
                        { tier: "Enterprise", rpm: "Unlimited", rpd: "Unlimited" },
                      ].map((limit) => (
                        <div key={limit.tier} className="p-4 bg-muted/30 rounded-lg border border-border text-center">
                          <div className="text-sm font-semibold text-foreground mb-1">{limit.tier}</div>
                          <div className="text-xs text-muted-foreground">{limit.rpm}</div>
                          <div className="text-xs text-muted-foreground">{limit.rpd}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Earth Window */}
      <section className="relative w-full h-[40vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-70" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <blockquote className="text-center max-w-3xl px-8">
            <p className="text-2xl md:text-4xl font-light text-primary-foreground drop-shadow-lg">
              "BYOK — Built for developers who own their infrastructure."
            </p>
          </blockquote>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Build?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Deploy your own substrate instance and start building with BYOK architecture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/developers">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Developer Portal
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
