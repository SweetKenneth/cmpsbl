/**
 * Documentation Hub — CMPSBL Substrate
 * Mobile-first, sidebar navigation, polished cards
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen, Code, Zap, Shield, Database, ArrowRight,
  Key, Package, Globe, Bot, Brain, Moon, Eye, Scroll,
  ChevronRight, Menu, X, Copy, Check, Terminal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { useMetric } from "@/stores/publicMetricsStore";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── Section definitions ─── */

interface DocSection {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

const sections: DocSection[] = [
  { id: "overview",     label: "Overview",      icon: BookOpen, color: "text-primary" },
  { id: "byok",         label: "BYOK",          icon: Key,      color: "text-amber-500" },
  { id: "brain",        label: "BRAIN",         icon: Brain,    color: "text-violet-500" },
  { id: "nexus",        label: "NEXUS",         icon: Zap,      color: "text-cyan-500" },
  { id: "dream",        label: "DREAM",         icon: Moon,     color: "text-indigo-500" },
  { id: "defense",      label: "DEFENSE",       icon: Shield,   color: "text-emerald-500" },
  { id: "extensions",   label: "Extensions",    icon: Package,  color: "text-orange-500" },
  { id: "agents",       label: "Agents",        icon: Bot,      color: "text-pink-500" },
  { id: "integrations", label: "Integrations",  icon: Globe,    color: "text-sky-500" },
  { id: "api",          label: "API Reference",  icon: Terminal, color: "text-primary" },
];

/* ─── Code block with copy ─── */

function CodeBlock({ children, title }: { children: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
      {title && (
        <div className="px-4 py-2 border-b border-border/40 text-xs font-mono text-muted-foreground bg-muted/30">
          {title}
        </div>
      )}
      <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed text-foreground/90">
        <code>{children}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 border border-border/40 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy code"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
    </div>
  );
}

/* ─── Info card ─── */

function InfoCard({ icon: Icon, title, children, accent = "border-primary" }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className={cn(
      "rounded-xl border bg-card/50 backdrop-blur-sm p-5 sm:p-6 card-lift gradient-border-reveal",
      "border-border/50 hover:border-primary/20 transition-all duration-500"
    )}>
      <div className="flex items-start gap-3 mb-3">
        <div className={cn("p-2 rounded-lg bg-muted/50 shrink-0", accent.replace("border-", "text-"))}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="font-semibold text-foreground text-sm sm:text-base">{title}</h3>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

/* ─── Section content components ─── */

function OverviewSection() {
  const capabilitiesCount = useMetric('capabilitiesCount');
  const systems = [
    { icon: Key,     name: "BYOK",       desc: "Bring your own API keys — zero compute costs", color: "text-amber-500" },
    { icon: Brain,   name: "BRAIN",      desc: "Persistent multi-tier memory with auto-tiering", color: "text-violet-500" },
    { icon: Zap,     name: "NEXUS",      desc: "Intelligent multi-provider AI routing", color: "text-cyan-500" },
    { icon: Moon,    name: "DREAM",      desc: "Offline synthesis and pattern consolidation", color: "text-indigo-500" },
    { icon: Shield,  name: "DEFENSE",    desc: "Bot detection, rate limiting, input sanitization", color: "text-emerald-500" },
    { icon: Eye,     name: "VISION",     desc: "System observability and health metrics", color: "text-sky-500" },
    { icon: Scroll,  name: "AUDIT",      desc: "Immutable append-only ledger for all operations", color: "text-orange-500" },
    { icon: Package, name: "DECODE",     desc: "Extension registry and custom hooks", color: "text-pink-500" },
    { icon: Bot,     name: "AGENCY",     desc: "Multi-agent orchestration patterns", color: "text-rose-500" },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Memory Stream Substrate</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          A continuous cognitive substrate providing routing, memory, learning cycles, 
          observability, defense, and execution coordination for AI systems.{" "}
          <span className="text-foreground font-medium">{capabilitiesCount}+ capabilities</span> across 38 nodes and 12 sectors.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {systems.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            <InfoCard icon={s.icon} title={s.name} accent={`border-${s.color.split("-").slice(1).join("-")}`}>
              {s.desc}
            </InfoCard>
          </motion.div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        <Button asChild size="sm" variant="outline">
          <Link to="/start-here">Quick Start <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to="/developers">Developer Portal <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Link>
        </Button>
      </div>
    </div>
  );
}

function BYOKSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">BYOK Architecture</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          <strong className="text-foreground">Bring Your Own Keys</strong> — developers register their own AI provider API keys 
          and pay compute costs directly to providers. Zero LLM costs for substrate operators.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard icon={Key} title="Key Management">
          Register, rotate, and monitor API keys for any supported provider. Keys are encrypted at rest with AES-256.
        </InfoCard>
        <InfoCard icon={Zap} title="Auto-Routing">
          When no provider is specified, NEXUS selects the optimal provider based on latency, cost, and task type.
        </InfoCard>
      </div>
      <CodeBlock title="Register & use your keys">{`// Register a provider key
await substrate.keys.register('openai', 'sk-...');

// Make an AI call — billed to YOUR account
await substrate.ai.chat(
  [{ role: 'user', content: 'Hello!' }],
  { provider: 'openai', model: 'gpt-4o' }
);

// Check usage
await substrate.keys.usage('openai', 30); // 30 day window`}</CodeBlock>
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
        <h4 className="font-semibold text-sm mb-2 text-foreground">Supported Providers</h4>
        <p className="text-sm text-muted-foreground">
          Groq · Cerebras · SambaNova · Google AI Studio · DeepSeek · Together · OpenRouter
          <span className="block mt-1 text-xs opacity-70">BYOK: OpenAI · Anthropic · Mistral · Cohere · Fireworks</span>
        </p>
      </div>
    </div>
  );
}

function BrainSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">BRAIN Substrate</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          The cognitive core — a four-tier memory system with automatic demotion, compression, 
          and DREAM-cycle consolidation. Protected memory types are locked at 1.0 value with zero decay.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard icon={Database} title="Four-Tier Memory">
          <span className="font-mono text-xs">Hot (500) → Warm (10K) → Cold (10K) → Legacy (∞)</span>
          <br />Automatic FIFO/LRU eviction with bulk demotion RPCs.
        </InfoCard>
        <InfoCard icon={Moon} title="DREAM Consolidation">
          Off-cycle pattern synthesis compresses and scores memories. Protected types bypass decay entirely.
        </InfoCard>
      </div>
      <CodeBlock title="Store and query memories">{`// Store a memory
await substrate.brain.store({
  content: "User prefers dark mode",
  tags: ["preference", "ui"],
  tier: "hot"
});

// Semantic search
const results = await substrate.brain.query({
  query: "user interface preferences",
  limit: 10,
  tier: "all"
});`}</CodeBlock>
    </div>
  );
}

function NexusSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">NEXUS Router</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          Intelligent multi-provider AI routing. NEXUS selects the optimal model based on task type, 
          latency constraints, cost budget, and provider health — with automatic failover.
        </p>
      </div>
      <CodeBlock title="Route with constraints">{`await substrate.nexus.route({
  messages: [{ role: "user", content: "Analyze this dataset" }],
  task_type: "analysis",
  constraints: {
    max_latency_ms: 3000,
    preferred_providers: ["anthropic", "openai"],
    fallback: true
  }
});`}</CodeBlock>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Task-Aware", desc: "Routes based on task type — chat, code, analysis, creative" },
          { label: "Auto-Failover", desc: "Seamless provider switching on timeout or error" },
          { label: "Cost-Optimized", desc: "Selects cheapest provider meeting quality threshold" },
        ].map(f => (
          <div key={f.label} className="p-4 rounded-xl border border-border/50 bg-card/30">
            <h4 className="font-semibold text-sm mb-1">{f.label}</h4>
            <p className="text-xs text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DreamSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">DREAM Cycles</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          Autonomous offline synthesis. During idle periods, the substrate consolidates patterns, 
          compresses redundant memories, scores relevance, and surfaces lateral insights.
        </p>
      </div>
      <CodeBlock title="Trigger a dream cycle">{`// Trigger manual dream consolidation
await substrate.dream.trigger({ mode: "simnap" });

// Full deep dream cycle
await substrate.dream.trigger({ mode: "deep" });

// Check dream status
const status = await substrate.dream.status();
// → { last_cycle: "2026-03-05T...", memories_consolidated: 847 }`}</CodeBlock>
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard icon={Moon} title="Simnap Mode">
          Quick 30-second consolidation. Compresses recent hot memories and scores relevance.
        </InfoCard>
        <InfoCard icon={Brain} title="Deep Dream Mode">
          Full cycle — cross-references all tiers, surfaces lateral insights, prunes stale patterns.
        </InfoCard>
      </div>
    </div>
  );
}

function DefenseSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">DEFENSE Module</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          Enterprise-grade security built into the substrate core. Bot detection, rate limiting, 
          input sanitization, and compliance-ready audit logging.
        </p>
      </div>
      <CodeBlock title="Run a security scan">{`await substrate.defense.scan({
  target: "example.com",
  scan_type: "full"
});`}</CodeBlock>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          "Bot Detection", "Rate Limiting", "Input Sanitization",
          "WebAuthn Auth", "Audit Logging", "SOC 2 Ready",
        ].map(f => (
          <div key={f} className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-card/30 text-sm">
            <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExtensionsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Extensions</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          Extend substrate functionality with custom hooks that run before or after system actions.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { hook: "brain_hook",   desc: "Memory and learning extensions" },
          { hook: "nexus_hook",   desc: "AI routing extensions" },
          { hook: "defense_hook", desc: "Security extensions" },
          { hook: "dream_hook",   desc: "Dream processing extensions" },
        ].map(h => (
          <div key={h.hook} className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card/30">
            <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded shrink-0">{h.hook}</code>
            <span className="text-sm text-muted-foreground">{h.desc}</span>
          </div>
        ))}
      </div>
      <CodeBlock title="Register an extension">{`await substrate.extensions.register({
  name: 'my-hook',
  extension_type: 'brain_hook',
  hook_point: 'pre_query',
  endpoint_url: 'https://your-api.com/hook'
});`}</CodeBlock>
    </div>
  );
}

function AgentsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Multi-Agent Orchestration</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          Create and coordinate AI agents using different orchestration patterns.
        </p>
      </div>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { pattern: "Chain",      desc: "Sequential" },
          { pattern: "Parallel",   desc: "Concurrent" },
          { pattern: "Supervisor", desc: "Managed" },
          { pattern: "Debate",     desc: "Consensus" },
          { pattern: "Swarm",      desc: "Collaborative" },
        ].map(p => (
          <div key={p.pattern} className="p-3 rounded-xl border border-border/50 bg-card/30 text-center">
            <div className="font-semibold text-sm mb-0.5">{p.pattern}</div>
            <div className="text-xs text-muted-foreground">{p.desc}</div>
          </div>
        ))}
      </div>
      <CodeBlock title="Create & run agents">{`const agent = await substrate.agents.create({
  name: 'ResearchAgent',
  system_prompt: 'You are a research specialist...',
  provider: 'anthropic',
  model: 'claude-sonnet'
});

await substrate.agents.run(
  [agent1.id, agent2.id],
  'Research quantum computing',
  { pattern: 'debate' }
);`}</CodeBlock>
    </div>
  );
}

function IntegrationsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Integrations</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          Connect external services through the integration bus for payments, messaging, automation, and custom webhooks.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { name: "Stripe",   desc: "Payments & subscriptions" },
          { name: "Twilio",   desc: "SMS, voice, messaging" },
          { name: "Shopify",  desc: "E-commerce & inventory" },
          { name: "n8n",      desc: "Workflow automation" },
          { name: "Webhooks", desc: "Custom HTTP integrations" },
          { name: "Email",    desc: "Transactional email" },
        ].map(i => (
          <div key={i.name} className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/30">
            <Globe className="w-4 h-4 text-sky-500 shrink-0" />
            <div>
              <div className="font-semibold text-sm">{i.name}</div>
              <div className="text-xs text-muted-foreground">{i.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <CodeBlock title="Connect an integration">{`await substrate.integrations.connect({
  name: 'My Stripe',
  integration_type: 'stripe',
  credentials: { api_key: 'sk_live_...' }
});

await substrate.integrations.call(
  'integration-id', 
  'customers.create', 
  { email: 'user@example.com' }
);`}</CodeBlock>
    </div>
  );
}

function APISection() {
  const endpoints = [
    { action: "brain.store",    method: "POST", desc: "Store a memory with tags and tier", body: '{ "action": "brain.store", "content": "...", "tags": ["tag1"], "tier": "hot" }' },
    { action: "brain.query",    method: "POST", desc: "Semantic search across memories", body: '{ "action": "brain.query", "query": "search terms", "limit": 10 }' },
    { action: "nexus.route",    method: "POST", desc: "Route AI request to optimal provider", body: '{ "action": "nexus.route", "messages": [...], "task_type": "chat" }' },
    { action: "defense.scan",   method: "POST", desc: "Run a security scan", body: '{ "action": "defense.scan", "target": "example.com" }' },
    { action: "dream.trigger",  method: "POST", desc: "Trigger dream consolidation", body: '{ "action": "dream.trigger", "mode": "simnap" }' },
    { action: "vision.metrics", method: "POST", desc: "Retrieve system health metrics", body: '{ "action": "vision.metrics", "module": "brain" }' },
    { action: "audit.query",    method: "POST", desc: "Search the audit ledger", body: '{ "action": "audit.query", "entity_type": "brain" }' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">API Reference</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          All actions are sent via POST with an <code className="text-primary text-xs bg-primary/10 px-1.5 py-0.5 rounded">action</code> field in the JSON body.
        </p>
      </div>

      {/* Auth */}
      <div>
        <h3 className="font-semibold mb-3 text-foreground">Authentication</h3>
        <CodeBlock title="Required headers">{`X-Developer-ID: your-developer-uuid
X-App-ID: your-app-uuid
Authorization: Bearer <jwt>`}</CodeBlock>
      </div>

      {/* Endpoints */}
      <div>
        <h3 className="font-semibold mb-4 text-foreground">Core Actions</h3>
        <div className="space-y-3">
          {endpoints.map(ep => (
            <div key={ep.action} className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/30">
                <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px] font-mono px-2">
                  {ep.method}
                </Badge>
                <code className="text-sm font-semibold text-foreground">{ep.action}</code>
                <span className="text-xs text-muted-foreground hidden sm:inline ml-auto">{ep.desc}</span>
              </div>
              <pre className="px-4 py-3 text-xs font-mono text-muted-foreground overflow-x-auto">
                {ep.body}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Response format */}
      <div>
        <h3 className="font-semibold mb-3">Response Format</h3>
        <CodeBlock>{`// Success
{ "success": true, "data": { ... }, "meta": { "latency_ms": 42 } }

// Error
{ "success": false, "error": "Descriptive message", "code": "RATE_LIMITED" }`}</CodeBlock>
      </div>

      {/* Rate limits */}
      <div>
        <h3 className="font-semibold mb-3">Rate Limits</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { tier: "Free",       rpm: "60/min",       rpd: "1K/day" },
            { tier: "Pro",        rpm: "600/min",      rpd: "50K/day" },
            { tier: "Enterprise", rpm: "Unlimited",    rpd: "Unlimited" },
          ].map(l => (
            <div key={l.tier} className="p-3 sm:p-4 rounded-xl border border-border/50 bg-card/30 text-center">
              <div className="font-semibold text-sm mb-1">{l.tier}</div>
              <div className="text-xs text-muted-foreground">{l.rpm}</div>
              <div className="text-xs text-muted-foreground">{l.rpd}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Section renderer ─── */

const sectionComponents: Record<string, React.FC> = {
  overview: OverviewSection,
  byok: BYOKSection,
  brain: BrainSection,
  nexus: NexusSection,
  dream: DreamSection,
  defense: DefenseSection,
  extensions: ExtensionsSection,
  agents: AgentsSection,
  integrations: IntegrationsSection,
  api: APISection,
};

/* ─── Main page ─── */

export default function Documentation() {
  const [active, setActive] = useState("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const ActiveComponent = sectionComponents[active] || OverviewSection;

  const handleNav = (id: string) => {
    setActive(id);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Substrate Documentation — CMPSBL"
        description="Complete technical documentation for the CMPSBL substrate: persistent memory, DREAM cycles, NEXUS routing, EVOLUTION, and API reference."
        canonical="https://cmpsbl.com/documentation"
        image="https://cmpsbl.com/og/documentation.jpg"
        keywords={['CMPSBL documentation', 'substrate docs', 'AI API reference', 'DREAM cycles docs', 'persistent memory API']}
      />

      <PublicNav />

      {/* Hero — compact */}
      <section className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/8 rounded-full blur-[180px]" />
        </div>
        <div className="relative container mx-auto px-4 pt-28 sm:pt-32 pb-12 sm:pb-16">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            ← Back to Home
          </Link>
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary px-3 py-1 gap-1.5">
              <BookOpen className="w-3 h-3" />
              <span className="text-xs">Developer Resources</span>
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
              Substrate{" "}
              <span style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>Documentation</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Everything you need to build on the substrate — persistent memory, DREAM cycles, 
              NEXUS routing, and governed evolution.{" "}
              <span className="text-primary font-medium">100% BYOK.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Content area — sidebar + main */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex gap-8 max-w-7xl mx-auto">
          
          {/* Desktop sidebar */}
          <nav className="hidden lg:block w-56 shrink-0 sticky top-24 self-start">
            <div className="space-y-1">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleNav(s.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 text-left",
                    active === s.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <s.icon className={cn("w-4 h-4 shrink-0", active === s.id ? "text-primary" : s.color)} />
                  <span>{s.label}</span>
                  {active === s.id && <ChevronRight className="w-3 h-3 ml-auto" />}
                </button>
              ))}
            </div>
          </nav>

          {/* Mobile nav toggle */}
          <div className="fixed bottom-6 right-6 z-50 lg:hidden">
            <Button
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg shadow-primary/20"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile nav overlay */}
          <AnimatePresence>
            {mobileNavOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-x-4 bottom-20 z-40 lg:hidden rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden"
              >
                <div className="p-2 max-h-[60vh] overflow-y-auto">
                  {sections.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleNav(s.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all",
                        active === s.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      )}
                    >
                      <s.icon className={cn("w-4 h-4", active === s.id ? "text-primary" : s.color)} />
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <ActiveComponent />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* CTA */}
      <section className="border-t border-border/30 bg-muted/20">
        <div className="container mx-auto px-4 py-16 sm:py-20 max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Build?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Deploy your own substrate instance and start building with BYOK architecture.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/developers">
                Developer Portal <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/start-here">Start Here</Link>
            </Button>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
