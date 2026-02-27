/**
 * Developer Showcase — CMPSBL for Software Developers
 * Polished showcase with enhanced visuals
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Moon,
  Zap,
  Code,
  Terminal,
  Layers,
  MessageSquare,
  Sparkles,
  Database,
  RefreshCw,
  Network,
  Shield,
  Clock,
  Bot,
  FileCode,
  Workflow,
  Puzzle,
  GitBranch,
  Play,
  CheckCircle2,
  BookOpen,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { cn } from "@/lib/utils";

// Feature card component
function FeatureCard({
  icon: Icon,
  title,
  description,
  features,
  color,
  gradient,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
  color: string;
  gradient: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group"
    >
      <Card className={cn(
        "h-full border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden",
        "hover:border-current/30 hover:shadow-xl transition-all duration-500",
        color
      )}>
        <div className={cn("h-1 w-full bg-gradient-to-r", gradient)} />
        
        <CardHeader className="pb-3">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center mb-4",
            "bg-gradient-to-br shadow-lg",
            gradient
          )}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-xl group-hover:text-current transition-colors">
            {title}
          </CardTitle>
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

// Use case card
function UseCaseCard({
  icon: Icon,
  title,
  description,
  example,
  color,
  gradient,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  example: string;
  color: string;
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className={cn(
        "p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm",
        "hover:bg-card/60 hover:border-current/30 hover:shadow-lg transition-all duration-300",
        color
      )}>
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            "bg-gradient-to-br shadow-md",
            gradient
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1 group-hover:text-current transition-colors">{title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
            <code className="text-xs text-current/80 bg-current/5 px-3 py-1.5 rounded-md font-mono">
              {example}
            </code>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DeveloperShowcase() {
  const devFeatures = [
    {
      icon: Brain,
      title: "Persistent Memory Layer",
      description: "Give your apps 3-tier memory that survives sessions. Hot cache, warm store, cold archive with automatic migration.",
      features: [
        "Hot/warm/cold memory tiers",
        "Cross-session persistence",
        "Semantic search & recall",
        "Auto-decay & reinforcement",
      ],
      color: "text-purple-500",
      gradient: "from-purple-500 to-violet-600",
    },
    {
      icon: Moon,
      title: "Dream Cycles",
      description: "Offline processing that consolidates learnings, extracts patterns, and evolves your AI during idle periods.",
      features: [
        "Memory consolidation",
        "Pattern extraction",
        "Schema evolution",
        "Scheduled processing",
      ],
      color: "text-violet-500",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      icon: MessageSquare,
      title: "Context-Aware Decode",
      description: "Intelligent conversation layer with intent extraction, entity recognition, and memory-informed responses.",
      features: [
        "Intent classification",
        "Entity extraction",
        "Context windowing",
        "Memory integration",
      ],
      color: "text-cyan-500",
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      icon: Zap,
      title: "Smart AI Routing",
      description: "Route requests through optimal AI providers. Balance cost, latency, and capability automatically.",
      features: [
        "Multi-provider routing",
        "Cost optimization",
        "Latency-based selection",
        "BYOK architecture",
      ],
      color: "text-green-500",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      icon: Shield,
      title: "Defense Layer",
      description: "Built-in security with rate limiting, threat detection, and governance for responsible AI.",
      features: [
        "Rate limiting",
        "Threat scoring",
        "Content filtering",
        "Audit logging",
      ],
      color: "text-red-500",
      gradient: "from-red-500 to-rose-600",
    },
    {
      icon: Layers,
      title: "Event-Driven Bus",
      description: "Ripple messaging system for decoupled architecture. Events flow, modules react, state propagates.",
      features: [
        "Pub/sub messaging",
        "Event sourcing",
        "Replay capability",
        "Webhook integration",
      ],
      color: "text-amber-500",
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  const useCases = [
    {
      icon: Bot,
      title: "AI Assistants",
      description: "Build chatbots that remember context across sessions and learn from interactions.",
      example: "cmpsbl.brain.remember({ user_id, context })",
      color: "text-cyan-500",
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      icon: FileCode,
      title: "RAG Pipelines",
      description: "Intelligent document retrieval with memory-enhanced context augmentation.",
      example: "cmpsbl.brain.recall({ query, limit: 10 })",
      color: "text-purple-500",
      gradient: "from-purple-500 to-violet-600",
    },
    {
      icon: Workflow,
      title: "Agent Workflows",
      description: "Multi-step autonomous agents with persistent state and learning loops.",
      example: "cmpsbl.agency.createTask({ type, members })",
      color: "text-emerald-500",
      gradient: "from-emerald-500 to-green-600",
    },
    {
      icon: Puzzle,
      title: "Plugin Systems",
      description: "Extensible architectures with shared cognitive substrate.",
      example: "cmpsbl.core.register({ module, config })",
      color: "text-rose-500",
      gradient: "from-rose-500 to-pink-600",
    },
  ];

  const techCapabilities = [
    { icon: Database, label: "60+", sublabel: "Tables", description: "Full persistence layer" },
    { icon: Clock, label: "<100ms", sublabel: "Latency", description: "Response time" },
    { icon: Network, label: "24", sublabel: "Surfaces", description: "Complete cognitive OS" },
    { icon: GitBranch, label: "REST + SDK", sublabel: "Access", description: "Multiple integrations" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Developer Hub — SDKs & APIs | CMPSBL"
        description="Everything developers need: SDKs, REST APIs, webhooks, and integration guides for building on the composable AI substrate."
        canonical="https://cmpsbl.com/developers"
        image="https://cmpsbl.com/og/developers.jpg"
        keywords={[
          "AI development",
          "cognitive architecture",
          "LLM infrastructure",
          "AI memory",
          "developer tools",
          "RAG pipeline",
          "AI agents",
          "SDK",
        ]}
      />

      <PublicNav />

      {/* Hero Section */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
          <div className="absolute top-1/4 -left-48 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 px-4 py-1.5 bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
              <Terminal className="w-4 h-4 mr-2" />
              For Software Developers
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight">
              <span className="text-foreground">Build Apps That </span>
              <span 
                className="block sm:inline"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)), hsl(var(--neon-magenta)))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Think, Remember, Dream
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              CMPSBL gives your applications persistent memory, 
              self-improvement through dream cycles, and intelligent multi-provider AI routing.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="gap-2 h-12 px-8 text-base bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                <Link to="/codelab">
                  <Code className="w-5 h-5" />
                  Open CodeLab
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 h-12 px-8 text-base">
                <Link to="/demo">
                  <Play className="w-5 h-5" />
                  See Demo
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/50 bg-card/30 py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {techCapabilities.map((cap, idx) => (
              <motion.div
                key={cap.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-3">
                  <cap.icon className="w-6 h-6 text-cyan-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-foreground">{cap.label}</div>
                <div className="text-xs text-muted-foreground">{cap.sublabel}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <Badge variant="outline" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Core Capabilities
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              Everything Your App Needs
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              A complete cognitive infrastructure for building intelligent, adaptive applications.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devFeatures.map((feature, idx) => (
              <FeatureCard key={feature.title} {...feature} delay={idx * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <Badge variant="outline" className="mb-4">
              <Code className="w-3 h-3 mr-1" />
              Use Cases
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              Build Anything Intelligent
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              From chatbots to autonomous agents, CMPSBL powers the next generation of AI apps.
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
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <Badge variant="outline" className="mb-4">
              <Terminal className="w-3 h-3 mr-1" />
              Integration
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              Simple to Integrate
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Connect your app to CMPSBL in minutes. We handle the cognitive complexity.
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

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative p-10 sm:p-14 rounded-3xl overflow-hidden text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/60" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
              
              <div className="relative">
                <Rocket className="w-16 h-16 mx-auto mb-6 text-primary-foreground/80" />
                <h2 className="text-3xl sm:text-4xl font-black text-primary-foreground mb-4">
                  Ready to Build Smarter?
                </h2>
                <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-8">
                  Access 70+ templates, live debugger, and full documentation. 
                  Start building apps that think.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg" className="h-12 px-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold">
                    <Link to="/codelab">
                      <Rocket className="w-5 h-5 mr-2" />
                      Start in CodeLab
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12 px-8 border-white/30 text-white hover:bg-white/10">
                    <Link to="/documentation">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Read the Docs
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
