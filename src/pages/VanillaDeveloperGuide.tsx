/**
 * Developer Guide — For developers who want to integrate directly
 * No AI agents required. Install, configure, call.
 */

import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { AuthorityLinkBlock } from "@/components/seo/AuthorityLinkBlock";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight, Terminal, Code, Package, Key, Database,
  Shield, Zap, BookOpen, Copy, CheckCircle, Layers,
  Server, Cpu, GitBranch, FileCode, Brain, Eye,
  RotateCcw, MessageSquare, Network,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

function CopyBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {label && (
        <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground">{label}</span>
          <button onClick={handleCopy} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            {copied ? <CheckCircle className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
      <pre className="p-4 text-sm font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-words">
        {code}
      </pre>
    </div>
  );
}

const MODULES = [
  { name: "BRAIN", icon: Brain, desc: "Store, recall, and search knowledge that persists across sessions.", actions: ["remember", "query", "recall", "reflect", "coherenceCheck"] },
  { name: "DECODE", icon: MessageSquare, desc: "Understand user intent, extract entities, and generate contextual responses.", actions: ["chat", "intent", "propose", "learn"] },
  { name: "NEXUS", icon: Network, desc: "Route AI requests across 13+ providers with automatic failover and cost controls.", actions: ["route", "providers", "text", "image"] },
  { name: "DEFENSE", icon: Shield, desc: "Detect bots, score threats, analyze IPs, and flag anomalies in real time.", actions: ["analyze", "reputation", "anomaly", "posture"] },
  { name: "VISION", icon: Eye, desc: "Monitor system health with metrics, logs, dashboards, and distributed tracing.", actions: ["health", "metrics", "logs", "trace", "dashboard"] },
  { name: "DREAM", icon: Zap, desc: "Run self-improvement cycles that consolidate memory and extract patterns.", actions: ["cycle", "mutate", "reflect", "mood"] },
];

const INSTALL_STEPS = [
  { step: "1", title: "Get your API key", description: "Sign up at cmpsbl.com and generate an API key from your developer dashboard." },
  { step: "2", title: "Make your first call", code: `const res = await fetch('https://api.cmpsbl.com/v1/substrate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ action: 'brain.query', query: 'hello' }),
});
const data = await res.json();` },
];

export default function VanillaDeveloperGuide() {
  return (
    <>
      <SEO
        title="Developer Guide — SDK Integration Steps | CMPSBL"
        description="Integrate CMPSBL into any TypeScript or Node.js project: install the SDK, connect persistent memory, configure NEXUS routing, and trigger DREAM cycles. Full API reference and code examples."
        canonical="https://cmpsbl.com/developers/guide"
        keywords={['SDK', 'developer guide', 'TypeScript SDK', 'API integration', 'Node.js', 'REST API']}
      />
      <PublicNav />
      <main className="min-h-screen bg-background pt-24 pb-16">

        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="container mx-auto max-w-5xl px-4 text-center mb-16 sm:mb-20">
          <motion.div {...fade} className="space-y-5">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Badge variant="outline" className="border-primary/40 text-primary text-[11px] px-2.5 py-0.5">
                <Package className="w-3 h-3 mr-1" /> SDK
              </Badge>
              <Badge variant="outline" className="text-[11px] px-2.5 py-0.5">
                <Code className="w-3 h-3 mr-1" /> TypeScript · Node.js · Deno
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
              <span className="text-foreground">Drop it in your stack.</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Ship smarter systems.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              No AI framework required. The CMPSBL SDK is a standard TypeScript library that gives your app
              persistent memory, smart AI routing, security monitoring, and self-improvement —
              all through clean, typed function calls.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <a href="#quickstart">
                  <Terminal className="w-4 h-4" />
                  Quick Start
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2 hover:border-primary/30 transition-colors">
                <Link to="/api-access">
                  <BookOpen className="w-4 h-4" />
                  Full API Reference
                </Link>
              </Button>
            </div>
          </motion.div>
        </section>

        {/* ── Why this SDK ─────────────────────────────────── */}
        <section className="container mx-auto max-w-6xl px-4 mb-16 sm:mb-20">
          <motion.div {...fade}>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 text-foreground">
              What you get
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
              One API call connects you to
              an entire cognitive backend — no infrastructure to provision, no models to host, no vector databases to manage.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map((mod, i) => (
              <motion.div
                key={mod.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <Card className="h-full border-border/50 bg-card/80 hover:border-primary/30 transition-colors group card-lift shimmer-on-hover">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <mod.icon className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-base font-bold">{mod.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{mod.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {mod.actions.map(a => (
                        <span key={a} className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                          .{a}()
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Quick Start ──────────────────────────────────── */}
        <section id="quickstart" className="container mx-auto max-w-4xl px-4 mb-16 sm:mb-20 scroll-mt-24">
          <motion.div {...fade}>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 text-foreground">
              Quick Start
            </h2>
            <p className="text-muted-foreground text-center max-w-xl mx-auto mb-10">
              Three steps to a cognitive backend. Works in any Node.js, Deno, or browser environment.
            </p>
          </motion.div>

          <div className="space-y-6">
            {INSTALL_STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex gap-4 items-start"
              >
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {step.step}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  {step.description && (
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  )}
                  {step.code && <CopyBlock code={step.code} />}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Usage Examples ───────────────────────────────── */}
        <section className="container mx-auto max-w-4xl px-4 mb-16 sm:mb-20">
          <motion.div {...fade}>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 text-foreground">
              Common Patterns
            </h2>
            <p className="text-muted-foreground text-center max-w-xl mx-auto mb-10">
              Real code for real use cases. Copy, paste, ship.
            </p>
          </motion.div>

          <Tabs defaultValue="memory" className="w-full">
            <TabsList className="w-full flex flex-wrap gap-1 bg-muted/50 p-1 mb-6 h-auto">
              <TabsTrigger value="memory" className="text-xs flex-1 min-w-[100px]">Persistent Memory</TabsTrigger>
              <TabsTrigger value="routing" className="text-xs flex-1 min-w-[100px]">AI Routing</TabsTrigger>
              <TabsTrigger value="security" className="text-xs flex-1 min-w-[100px]">Security</TabsTrigger>
              <TabsTrigger value="observability" className="text-xs flex-1 min-w-[100px]">Observability</TabsTrigger>
            </TabsList>

            <TabsContent value="memory">
              <CopyBlock label="persistent-memory.ts" code={`import { Substrate } from '@cmpsbl/sdk';

const substrate = new Substrate({ apiKey: process.env.CMPSBL_API_KEY });

// Store a memory with confidence score
await substrate.brain.remember(
  'User prefers dark mode and metric units',
  'preference',
  0.95
);

// Recall relevant memories by semantic search
const memories = await substrate.brain.query('user preferences', 5);
console.log(memories.data);

// Trigger a reflection cycle to consolidate knowledge
await substrate.brain.reflect();`} />
            </TabsContent>

            <TabsContent value="routing">
              <CopyBlock label="ai-routing.ts" code={`import { Substrate } from '@cmpsbl/sdk';

const substrate = new Substrate({ apiKey: process.env.CMPSBL_API_KEY });

// Route to the best available provider automatically
const response = await substrate.nexus.route(
  'Summarize this quarterly report in 3 bullet points'
);
console.log(response.data?.content);

// Check provider availability and latency
const providers = await substrate.nexus.providers();
// { groq: { health: 100, latency: 42 }, cerebras: { health: 95 }, ... }

// Force a specific provider
const fast = await substrate.nexus.text(
  'Write a haiku about shipping code',
  'groq'
);`} />
            </TabsContent>

            <TabsContent value="security">
              <CopyBlock label="bot-detection.ts" code={`import { Substrate } from '@cmpsbl/sdk';

const substrate = new Substrate({ apiKey: process.env.CMPSBL_API_KEY });

// Analyze an incoming request for bot signals
const result = await substrate.defense.analyze({
  fingerprint: req.headers,
  ip: req.ip
});

if (!result.data?.allowed) {
  return res.status(403).json({ error: 'Blocked' });
}

// Check IP reputation
const rep = await substrate.defense.reputation(req.ip);

// Get security posture summary
const posture = await substrate.defense.posture();
console.log(posture.data?.overall_score);`} />
            </TabsContent>

            <TabsContent value="observability">
              <CopyBlock label="health-monitoring.ts" code={`import { Substrate } from '@cmpsbl/sdk';

const substrate = new Substrate({ apiKey: process.env.CMPSBL_API_KEY });

// Quick health check — perfect for /healthz endpoints
const snapshot = await substrate.vision.healthSnapshot();
console.log(snapshot.data?.overall_health); // 0-100

// Full system metrics
const metrics = await substrate.vision.metrics();

// Stream recent logs filtered by module
const logs = await substrate.vision.logs('brain', 50);

// Distributed trace for a specific request
const trace = await substrate.vision.trace('trace-abc-123');`} />
            </TabsContent>
          </Tabs>
        </section>

        {/* ── Framework Integration ────────────────────────── */}
        <section className="container mx-auto max-w-4xl px-4 mb-16 sm:mb-20">
          <motion.div {...fade}>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 text-foreground">
              Works with your stack
            </h2>
            <p className="text-muted-foreground text-center max-w-xl mx-auto mb-10">
              The SDK is framework-agnostic. Here's how it fits into popular setups.
            </p>
          </motion.div>

          <Tabs defaultValue="express" className="w-full">
            <TabsList className="w-full flex flex-wrap gap-1 bg-muted/50 p-1 mb-6 h-auto">
              <TabsTrigger value="express" className="text-xs flex-1 min-w-[80px]">Express</TabsTrigger>
              <TabsTrigger value="nextjs" className="text-xs flex-1 min-w-[80px]">Next.js</TabsTrigger>
              <TabsTrigger value="react" className="text-xs flex-1 min-w-[80px]">React</TabsTrigger>
              <TabsTrigger value="deno" className="text-xs flex-1 min-w-[80px]">Deno</TabsTrigger>
            </TabsList>

            <TabsContent value="express">
              <CopyBlock label="server.ts — Express middleware" code={`import express from 'express';
import { Substrate } from '@cmpsbl/sdk';

const app = express();
const substrate = new Substrate({ apiKey: process.env.CMPSBL_API_KEY });

// Bot detection middleware
app.use(async (req, res, next) => {
  const check = await substrate.defense.analyze({
    fingerprint: req.headers,
    ip: req.ip
  });
  if (!check.data?.allowed) return res.status(403).end();
  next();
});

// Memory-aware chat endpoint
app.post('/api/chat', async (req, res) => {
  const context = await substrate.brain.query(req.body.message, 5);
  const reply = await substrate.nexus.route(
    req.body.message + '\\nContext: ' + JSON.stringify(context.data)
  );
  res.json(reply.data);
});

app.listen(3000);`} />
            </TabsContent>

            <TabsContent value="nextjs">
              <CopyBlock label="app/api/chat/route.ts — Next.js App Router" code={`import { Substrate } from '@cmpsbl/sdk';
import { NextResponse } from 'next/server';

const substrate = new Substrate({
  apiKey: process.env.CMPSBL_API_KEY,
});

export async function POST(req: Request) {
  const { message, sessionId } = await req.json();

  // Recall relevant context
  const context = await substrate.brain.query(message, 5);

  // Route to best AI provider
  const reply = await substrate.nexus.route(
    message + '\\nContext: ' + JSON.stringify(context.data)
  );

  // Remember this interaction
  await substrate.brain.remember(
    \`User asked: \${message} — Response: \${reply.data?.content}\`,
    'conversation',
    0.8
  );

  return NextResponse.json(reply.data);
}`} />
            </TabsContent>

            <TabsContent value="react">
              <CopyBlock label="hooks/useSubstrate.ts — React hook" code={`import { useState, useCallback } from 'react';

const API_BASE = '/api/substrate'; // Proxy to your backend

export function useSubstrate() {
  const [loading, setLoading] = useState(false);

  const call = useCallback(async (
    module: string, action: string, payload?: any
  ) => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module, action, payload }),
      });
      return await res.json();
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    brain: {
      query: (q: string, limit = 10) => call('brain', 'query', { query_text: q, limit }),
      remember: (content: string) => call('brain', 'remember', { content }),
    },
    nexus: {
      route: (prompt: string) => call('nexus', 'route', { prompt }),
    },
    vision: {
      health: () => call('vision', 'healthSnapshot'),
    },
  };
}`} />
            </TabsContent>

            <TabsContent value="deno">
              <CopyBlock label="main.ts — Deno / Edge Function" code={`import { Substrate } from 'npm:@cmpsbl/sdk';

const substrate = new Substrate({
  apiKey: Deno.env.get('CMPSBL_API_KEY')!,
});

Deno.serve(async (req) => {
  const { message } = await req.json();

  // Query memory for context
  const context = await substrate.brain.query(message, 5);

  // Route to AI
  const reply = await substrate.nexus.route(
    message + '\\nContext: ' + JSON.stringify(context.data)
  );

  return new Response(JSON.stringify(reply.data), {
    headers: { 'Content-Type': 'application/json' },
  });
});`} />
            </TabsContent>
          </Tabs>
        </section>

        {/* ── Architecture ─────────────────────────────────── */}
        <section className="container mx-auto max-w-4xl px-4 mb-16 sm:mb-20">
          <motion.div {...fade}>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 text-foreground">
              Architecture
            </h2>
            <p className="text-muted-foreground text-center max-w-xl mx-auto mb-10">
              One endpoint. 40 nodes. 12 sectors.
            </p>
          </motion.div>

          <CopyBlock label="40-Node Architecture — 12 Sectors" code={`┌──────────────────────────────────────────────────────────┐
│                     Your Application                      │
│             SDK calls  ·  REST API  ·  Webhooks           │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                ACCESS (Identity Layer)                 │ │
│  │         API Keys · Quotas · Rate Limits               │ │
│  └───────────────────────────────────────────────────────┘ │
│                            │                               │
│  ── KERNEL ────────────────────────────────────────────── │
│  │ CORE · SYSTEM · BRAIN · MEMORY · DREAM               │ │
│                            │                               │
│  ── COGNITIVE (CCR) ───────────────────────────────────── │
│  │ DECODE · NEXUS · VISION · CORTEX · ENCODE            │ │
│                            │                               │
│  ── ORCHESTRATION (OCG) ──────────────────────────────── │
│  │ RIPPLE · ACCESS · NERVE · ECONOMY                    │ │
│                            │                               │
│  ── EXECUTION ─────────────────────────────────────────── │
│  │ INCLUSIVE · INTEGRATION · EVOLUTION · CLOCKLESS       │ │
│                            │                               │
│  ── EXPANSION (ESZ·EPZ·EMZ·CSZ) ─────────────────────── │
│  │ SOVEREIGN · CONSCIENCE · SENTINEL · ORACLE           │ │
│  │ REFLEX · PERCEPTION · FORGE · FOUNDRY                │ │
│  │ PHANTOM · SHADOW · LINGUA · HARVEST · COMPASS        │ │
│  │ MEDIC                                                 │ │
│                            │                               │
│  ── FIELD · PLANE · ATLAS · SHELL ─────────────────────  │
│  │ IMMUNITY · INTENT · GOVERNANCE · DEFENSE              │ │
│  │ ENGINEER · ATLAS · ENCODE                             │ │
│                                                            │
├──────────────────────────────────────────────────────────┤
│              PostgreSQL  ·  Edge Functions                  │
│                 BYOK AI Providers                           │
└──────────────────────────────────────────────────────────┘

Σ(weights) = 1.000 — All 40 nodes weighted, coordinated, boot-sequenced.`} />
        </section>

        {/* ── BYOK Explainer ───────────────────────────────── */}
        <section className="container mx-auto max-w-4xl px-4 mb-16 sm:mb-20">
          <motion.div {...fade}>
            <Card className="border-border/50 bg-card/80">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Key className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Bring Your Own Keys</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  The substrate uses a <strong className="text-foreground">BYOK (Bring Your Own Keys)</strong> model
                  for AI providers. You register your OpenAI, Anthropic, Google, or Groq API keys and the NEXUS router
                  uses them directly. You pay the provider — the substrate adds zero markup on inference costs.
                </p>
                <p>
                  Keys are encrypted at rest. You can rotate them at any time. Usage is metered per-provider so you
                  always know exactly where your spend is going.
                </p>
                <CopyBlock label="Register your keys" code={`// Register once — stored encrypted
await substrate.keys.register('openai', process.env.OPENAI_API_KEY);
await substrate.keys.register('anthropic', process.env.ANTHROPIC_API_KEY);

// Route calls use YOUR keys automatically
const reply = await substrate.nexus.route('Summarize this doc');

// Check usage breakdown per provider
const usage = await substrate.keys.usage('openai', 30);`} />
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* ── Request / Response Format ────────────────────── */}
        <section className="container mx-auto max-w-4xl px-4 mb-16 sm:mb-20">
          <motion.div {...fade}>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 text-foreground">
              Request & Response Format
            </h2>
            <p className="text-muted-foreground text-center max-w-xl mx-auto mb-10">
              If you prefer raw HTTP over the SDK, every module is accessible via a single POST endpoint.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <CopyBlock label="Request" code={`POST /functions/v1/pf-substrate
Content-Type: application/json
Authorization: Bearer <your-jwt>

{
  "module": "brain",
  "action": "query",
  "payload": {
    "query_text": "machine learning",
    "limit": 10
  }
}`} />
            <CopyBlock label="Response" code={`{
  "success": true,
  "module": "brain",
  "action": "query",
  "data": {
    "memories": [...],
    "count": 10,
    "relevance_scores": [0.95, 0.88, ...]
  },
  "timestamp": "2026-03-01T12:00:00Z"
}`} />
          </div>
        </section>

        {/* ── Rate Limits ──────────────────────────────────── */}
        <section className="container mx-auto max-w-3xl px-4 mb-16 sm:mb-20">
          <motion.div {...fade}>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 text-foreground">
              Rate Limits
            </h2>
            <p className="text-muted-foreground text-center max-w-xl mx-auto mb-8">
              Generous defaults. Scale with your plan.
            </p>
          </motion.div>

          <Card className="border-border/50 bg-card/80 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-3 font-medium text-foreground">Scope</th>
                      <th className="text-left p-3 font-medium text-foreground">Limit</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50"><td className="p-3">IP (general)</td><td className="p-3 font-mono text-xs">100 req / 5 min</td></tr>
                    <tr className="border-b border-border/50"><td className="p-3">IP (chat)</td><td className="p-3 font-mono text-xs">20 req / 5 min</td></tr>
                    <tr className="border-b border-border/50"><td className="p-3">Authenticated</td><td className="p-3 font-mono text-xs">500 req / 5 min</td></tr>
                    <tr className="border-b border-border/50"><td className="p-3">Daily (free tier)</td><td className="p-3 font-mono text-xs">5,000 req / day</td></tr>
                    <tr><td className="p-3">Daily (paid)</td><td className="p-3 font-mono text-xs">Unlimited*</td></tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section className="container mx-auto max-w-3xl px-4 text-center">
          <motion.div {...fade} className="p-8 sm:p-12 rounded-2xl border border-border bg-muted/30">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Start building
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Free tier includes 10,000 API calls per month. No credit card required.
              Upgrade anytime for higher limits and premium features.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/register">
                  Create Account <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/api-access">
                  <BookOpen className="w-4 h-4" />
                  Full API Reference
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/evolution">
                  <Zap className="w-4 h-4" />
                  Vibe Coder? Use with AI Agent
                </Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </main>
      <AuthorityLinkBlock currentPath="/developers/guide" />
      <EnhancedFooter />
    </>
  );
}
