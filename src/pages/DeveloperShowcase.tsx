/**
 * Developer Showcase — CMPSBL for Software Developers
 * Updated to reflect 40-primitive architecture
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Brain, Moon, Zap, Code, Terminal, Layers,
  MessageSquare, Sparkles, Database, Network, Shield, Clock,
  Bot, FileCode, Workflow, Puzzle, GitBranch, Play,
  CheckCircle2, BookOpen, Rocket, Package, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { PageSEOBlock } from "@/components/seo/PageSEOBlock";
import { cn } from "@/lib/utils";

function FeatureCard({ icon: Icon, title, description, features, color, gradient, delay = 0 }: {
  icon: React.ElementType; title: string; description: string; features: string[];
  color: string; gradient: string; delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5, delay }} className="group">
      <Card className={cn("h-full border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden hover:border-current/30 hover:shadow-xl transition-all duration-500", color)}>
        <div className={cn("h-1 w-full bg-gradient-to-r", gradient)} />
        <CardHeader className="pb-3">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br shadow-lg", gradient)}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-xl group-hover:text-current transition-colors">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{description}</p>
          <ul className="space-y-2.5">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-current/10">
                  <CheckCircle2 className="w-3 h-3 text-current" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function UseCaseCard({ icon: Icon, title, description, example, color, gradient }: {
  icon: React.ElementType; title: string; description: string; example: string; color: string; gradient: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group">
      <div className={cn("p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/60 hover:border-current/30 hover:shadow-lg transition-all duration-300", color)}>
        <div className="flex items-start gap-4">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-md", gradient)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1 group-hover:text-current transition-colors">{title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
            <code className="text-xs text-current/80 bg-current/5 px-3 py-1.5 rounded-md font-mono">{example}</code>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DeveloperShowcase() {
  const devFeatures = [
    {
      icon: Brain, title: "Persistent Memory",
      description: "Give your apps memory that survives sessions. Four temperature tiers handle hot cache, warm storage, cold archive, and long-term recall automatically.",
      features: ["4-tier temperature management", "Cross-session persistence", "Meaning-based search & recall", "Automatic cleanup & reinforcement"],
      color: "text-neon-purple", gradient: "from-neon-purple to-neon-purple",
    },
    {
      icon: Moon, title: "Self-Improvement Cycles",
      description: "During idle periods, the system consolidates learnings, extracts patterns, and evolves your AI — without any manual intervention.",
      features: ["Memory consolidation", "Pattern extraction", "Schema evolution", "Scheduled processing"],
      color: "text-neon-purple", gradient: "from-neon-purple to-neon-purple",
    },
    {
      icon: MessageSquare, title: "Conversation Intelligence",
      description: "Add intent classification, entity extraction, and memory-informed responses to any conversational interface.",
      features: ["Intent classification", "Entity extraction", "Context windowing", "Memory-aware responses"],
      color: "text-neon-cyan", gradient: "from-neon-cyan to-neon-blue",
    },
    {
      icon: Zap, title: "Smart AI Routing",
      description: "Automatically route requests to the best AI provider based on cost, speed, and capability. Supports 13+ providers with automatic failover.",
      features: ["Multi-provider routing", "Cost optimization", "Speed-based selection", "Bring your own keys"],
      color: "text-neon-green", gradient: "from-neon-green to-neon-green",
    },
    {
      icon: Shield, title: "Built-In Security",
      description: "Rate limiting, threat detection, content filtering, and complete audit logging — all included out of the box.",
      features: ["Rate limiting", "Threat scoring", "Content filtering", "Audit logging"],
      color: "text-destructive", gradient: "from-destructive to-neon-magenta",
    },
    {
      icon: Layers, title: "Event-Driven Architecture",
      description: "Decouple your app with pub/sub messaging. Events flow through the system, primitives react, and state propagates automatically.",
      features: ["Pub/sub messaging", "Event sourcing", "Replay capability", "Webhook integration"],
      color: "text-neon-amber", gradient: "from-neon-amber to-neon-amber",
    },
  ];

  const useCases = [
    { icon: Bot, title: "AI Assistants", description: "Build chatbots that remember users across sessions and learn from every conversation.", example: "cmpsbl.brain.remember({ user_id, context })", color: "text-neon-cyan", gradient: "from-neon-cyan to-neon-blue" },
    { icon: FileCode, title: "Smart Document Search", description: "Retrieve documents with memory-enhanced context — not just keyword matching.", example: "cmpsbl.brain.recall({ query, limit: 10 })", color: "text-neon-purple", gradient: "from-neon-purple to-neon-purple" },
    { icon: Workflow, title: "Autonomous Agents", description: "Multi-step agents with persistent state, self-correction, and continuous learning.", example: "cmpsbl.agency.createTask({ type, members })", color: "text-neon-green", gradient: "from-neon-green to-neon-green" },
    { icon: Puzzle, title: "Plugin Systems", description: "Build extensible architectures where plugins share a common cognitive layer.", example: "cmpsbl.core.register({ node, config })", color: "text-neon-magenta", gradient: "from-neon-magenta to-neon-magenta" },
  ];

  const techCapabilities = [
    { icon: Database, label: "40", sublabel: "Primitives", description: "Agents, engines, layers & organs" },
    { icon: Clock, label: "12", sublabel: "Groups", description: "Organized by function" },
    { icon: Network, label: "675+", sublabel: "Capabilities", description: "Ready to use" },
    { icon: GitBranch, label: "REST + SDK", sublabel: "Access", description: "Multiple options" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Developer Hub — SDKs, APIs & Integrations | CMPSBL"
        description="Everything developers need for CMPSBL: REST APIs, TypeScript SDK, webhook integrations, resolver patterns, and step-by-step guides for persistent memory, routing, and orchestration."
        canonical="https://cmpsbl.com/developers"
        keywords={["AI development", "cognitive architecture", "LLM infrastructure", "AI memory", "developer tools", "SDK"]}
      />

      <PublicNav />

      {/* Hero */}
      <section className="relative py-20 sm:py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/5 via-transparent to-transparent" />
          <div className="absolute top-1/4 -left-48 w-[500px] h-[500px] bg-neon-cyan/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-3 sm:px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 px-4 py-1.5 bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30">
              <Terminal className="w-4 h-4 mr-2" />
              For Software Developers
            </Badge>
             <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 tracking-tight">
               <span className="text-foreground">Build Apps That </span>
               <span className="text-primary">Think &amp; Remember</span>
             </h1>
             <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
               Add persistent memory, smart AI routing, and self-improvement capabilities 
               to your applications. 40 specialized modules across 12 coordinated groups — all accessible via SDK or REST API.
             </p>
             <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
               <Button asChild size="lg" className="gap-2 h-12 px-6 sm:px-8 text-sm sm:text-base bg-gradient-to-r from-neon-cyan to-neon-blue hover:from-neon-cyan hover:to-neon-blue shadow-lg shadow-neon-cyan/15 hover:scale-[1.02] active:scale-[0.98] transition-all">
                 <Link to="/codelab"><Code className="w-5 h-5" />Open CodeLab<ArrowRight className="w-4 h-4" /></Link>
               </Button>
               <Button asChild variant="outline" size="lg" className="gap-2 h-12 px-6 sm:px-8 text-sm sm:text-base">
                <Link to="/documentation"><BookOpen className="w-5 h-5" />Documentation</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
       <section className="border-y border-border/50 bg-card/30 py-8 sm:py-10">
         <div className="container mx-auto px-3 sm:px-4">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {techCapabilities.map((cap, idx) => (
              <motion.div key={cap.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center mx-auto mb-3">
                  <cap.icon className="w-6 h-6 text-neon-cyan" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-foreground">{cap.label}</div>
                <div className="text-xs text-muted-foreground">{cap.sublabel}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
       <section className="py-16 sm:py-24">
         <div className="container mx-auto px-3 sm:px-4">
           <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10 sm:mb-14">
            <Badge variant="outline" className="mb-4"><Sparkles className="w-3 h-3 mr-1" />What You Can Build With</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4">Core Capabilities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Everything your app needs to think, remember, and improve — built on 40 specialized modules.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {devFeatures.map((feature, idx) => (
              <FeatureCard key={feature.title} {...feature} delay={idx * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <Badge variant="outline" className="mb-4"><Code className="w-3 h-3 mr-1" />What Developers Build</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">Real-World Use Cases</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              From chatbots with long-term memory to fully autonomous agent teams.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {useCases.map((useCase) => (
              <UseCaseCard key={useCase.title} {...useCase} />
            ))}
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <Badge variant="outline" className="mb-4"><Terminal className="w-3 h-3 mr-1" />Quick Start</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">Integrate in Minutes</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Connect your app with a few lines of code. We handle the infrastructure.
            </p>
          </motion.div>
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card/80 border-primary/30 overflow-hidden shadow-2xl shadow-primary/10">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/80" />
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--system-amber))]/80" />
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--system-green))]/80" />
                </div>
                <span className="text-xs text-muted-foreground/60 ml-2">app-memory.ts</span>
              </div>
              <CardContent className="p-6">
                <pre className="text-sm overflow-x-auto">
                  <code className="text-primary font-mono">{`// Initialize the CMPSBL client
import { createCmpsblClient } from '@cmpsbl/sdk';

const cmpsbl = createCmpsblClient({
  apiKey: process.env.CMPSBL_API_KEY
});

// Store a memory with semantic context
await cmpsbl.brain.remember({
  entity_id: "user_123",
  memory: {
    type: "conversation",
    content: "User prefers dark mode and concise responses",
    tags: ["preference", "ui", "communication"],
    emotional_weight: 0.8
  }
});

// Recall relevant memories for context
const memories = await cmpsbl.brain.recall({
  entity_id: "user_123", 
  query: "What are this user's preferences?",
  limit: 5
});

// Trigger dream cycle for pattern extraction
await cmpsbl.dream.cycle({
  entity_ids: ["user_123"],
  consolidate: true,
  extract_patterns: true
});`}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* NPM Packages */}
      <section className="py-16 border-t border-border/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <Badge variant="outline" className="mb-3 font-mono">@cmpsbl</Badge>
            <h2 className="text-2xl sm:text-3xl font-black mb-3">11 NPM Packages</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Modular, composable — install only what you need.</p>
          </motion.div>
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3 font-mono text-sm">
              <Terminal className="w-4 h-4 text-primary shrink-0" />
              <code className="text-foreground">npm i @cmpsbl/runtime @cmpsbl/intent @cmpsbl/react</code>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
            {[
              { pkg: '@cmpsbl/types', d: 'Shared TypeScript schemas' },
              { pkg: '@cmpsbl/runtime', d: 'Mini-Runtime™ engine' },
              { pkg: '@cmpsbl/failsafe', d: 'Zero-dep migration toolkit' },
              { pkg: '@cmpsbl/intent', d: 'Intent router & dispatch' },
              { pkg: '@cmpsbl/mesh', d: 'Mesh telemetry client' },
              { pkg: '@cmpsbl/bridge', d: 'Polyglot runtime adapters' },
              { pkg: '@cmpsbl/sdk', d: 'Authenticated engine access' },
              { pkg: '@cmpsbl/discovery', d: 'Pipeline crystallization' },
              { pkg: '@cmpsbl/cli', d: 'CLI dev tools' },
              { pkg: '@cmpsbl/react', d: 'React hooks' },
              { pkg: '@cmpsbl/test-harness', d: 'Validation suite' },
            ].map(p => (
              <div key={p.pkg} className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-card/50">
                <Package className="w-3.5 h-3.5 text-primary shrink-0" />
                <div className="min-w-0">
                  <code className="text-xs font-mono font-semibold">{p.pkg}</code>
                  <p className="text-[10px] text-muted-foreground">{p.d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-3 mt-8">
            <Button asChild size="sm" variant="outline">
              <Link to="/devtools"><Code className="w-3.5 h-3.5 mr-1.5" />DevTools</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href="https://www.npmjs.com/org/cmpsbl" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />View on NPM
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-b from-muted/20 via-primary/5 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Start Building for Free</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              No credit card required. Full access to 40 primitives.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link to="/auth"><Rocket className="w-4 h-4" />Get Started Free<ArrowRight className="w-4 h-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/api-access">API Access</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <PageSEOBlock path="/developers" title="Developer Showcase" />
      <EnhancedFooter />
    </div>
  );
}
