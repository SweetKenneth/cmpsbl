/**
 * Developer Showcase — CMPSBL for Software Developers
 * The cognitive backbone for intelligent applications
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
  Cpu,
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
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className={cn(
        "h-full border-border/50 bg-card/50 backdrop-blur-sm",
        "hover:border-current/30 transition-all duration-300",
        color
      )}>
        <CardHeader className="pb-2">
          <div className="w-12 h-12 rounded-xl bg-current/10 flex items-center justify-center mb-3">
            <Icon className="w-6 h-6" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <ul className="space-y-2">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-current opacity-60" />
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
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  example: string;
  color: string;
}) {
  return (
    <div className={cn(
      "p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm",
      "hover:bg-card/50 transition-all duration-300",
      color
    )}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-current/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
          <code className="text-xs text-current/80 bg-current/5 px-2 py-1 rounded">{example}</code>
        </div>
      </div>
    </div>
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
        "Memory graph relationships",
      ],
      color: "text-purple-500",
    },
    {
      icon: Moon,
      title: "Dream Cycles",
      description: "Offline processing that consolidates learnings, extracts patterns, and evolves your AI during idle periods.",
      features: [
        "Memory consolidation",
        "Pattern extraction",
        "Schema evolution",
        "Self-optimization",
        "Scheduled processing",
      ],
      color: "text-violet-500",
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
        "Multi-turn handling",
      ],
      color: "text-cyan-500",
    },
    {
      icon: Zap,
      title: "Smart AI Routing",
      description: "Route requests through optimal AI providers. Balance cost, latency, and capability automatically.",
      features: [
        "Multi-provider routing",
        "Cost optimization",
        "Latency-based selection",
        "Fallback chains",
        "BYOK architecture",
      ],
      color: "text-green-500",
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
        "Governance rules",
      ],
      color: "text-red-500",
    },
    {
      icon: Layers,
      title: "Event-Driven Bus",
      description: "Ripple messaging system for decoupled architecture. Events flow, modules react, state propagates.",
      features: [
        "Pub/sub messaging",
        "Event sourcing",
        "Replay capability",
        "Cross-module sync",
        "Webhook integration",
      ],
      color: "text-amber-500",
    },
  ];

  const useCases = [
    {
      icon: Bot,
      title: "AI Assistants",
      description: "Build chatbots that remember context across sessions and learn from interactions.",
      example: "substrate.brain.remember({ user_id, context })",
      color: "text-cyan-500",
    },
    {
      icon: FileCode,
      title: "RAG Pipelines",
      description: "Intelligent document retrieval with memory-enhanced context augmentation.",
      example: "substrate.brain.recall({ query, limit: 10 })",
      color: "text-purple-500",
    },
    {
      icon: Workflow,
      title: "Agent Workflows",
      description: "Multi-step autonomous agents with persistent state and learning loops.",
      example: "substrate.agency.createTask({ type, members })",
      color: "text-emerald-500",
    },
    {
      icon: Puzzle,
      title: "Plugin Systems",
      description: "Extensible architectures with shared cognitive substrate.",
      example: "substrate.core.register({ module, config })",
      color: "text-rose-500",
    },
  ];

  const techCapabilities = [
    { icon: Database, label: "60+ Tables", description: "Full persistence layer" },
    { icon: Clock, label: "<100ms", description: "Response latency" },
    { icon: Network, label: "11 Modules", description: "Complete cognitive OS" },
    { icon: GitBranch, label: "REST + SDK", description: "Multiple integrations" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="For Developers — Build Intelligent Apps | CMPSBL by promptfluid®"
        description="CMPSBL for software developers. Add persistent memory, dream cycles, and intelligent reasoning to any application."
        canonical="https://promptfluid.com/developers"
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
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
              <Terminal className="w-3 h-3 mr-1" />
              For Software Developers
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Build Apps That
              <br />Think, Remember, Dream
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              CMPSBL gives your applications persistent memory, 
              self-improvement through dream cycles, and intelligent multi-provider AI routing.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link to="/codelab">
                  <Code className="w-4 h-4" />
                  Open CodeLab
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/demo">
                  <Play className="w-4 h-4" />
                  See Demo
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/50 bg-card/30 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {techCapabilities.map((cap, idx) => (
              <motion.div
                key={cap.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <cap.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{cap.label}</div>
                <div className="text-xs text-muted-foreground">{cap.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything Your App Needs
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
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
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Build Anything Intelligent
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From chatbots to autonomous agents, the substrate powers the next generation of AI apps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {useCases.map((useCase) => (
              <UseCaseCard key={useCase.title} {...useCase} />
            ))}
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple Integration
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect your app to the substrate in minutes. We handle the cognitive complexity.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-black/60 border-border/50">
              <CardContent className="p-6">
                <pre className="text-sm overflow-x-auto">
                  <code className="text-green-400">{`// Initialize the substrate client
import { createSubstrateClient } from '@promptfluid/sdk';

const substrate = createSubstrateClient({
  apiKey: process.env.SUBSTRATE_API_KEY
});

// Store a memory with semantic context
await substrate.brain.remember({
  entity_id: "user_123",
  memory: {
    type: "conversation",
    content: "User prefers dark mode and concise responses",
    tags: ["preference", "ui", "communication"],
    emotional_weight: 0.8
  }
});

// Recall relevant memories for context
const memories = await substrate.brain.recall({
  entity_id: "user_123", 
  query: "What are this user's preferences?",
  limit: 5
});

// Trigger dream cycle for pattern extraction
await substrate.dream.cycle({
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
      <section className="py-20 bg-gradient-to-b from-transparent to-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Build Smarter?
            </h2>
            <p className="text-muted-foreground mb-8">
              Access 70+ templates, live debugger, and full documentation. 
              Start building apps that think.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link to="/codelab">
                  <Rocket className="w-4 h-4" />
                  Start in CodeLab
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/documentation">
                  <BookOpen className="w-4 h-4" />
                  Read the Docs
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="gap-2">
                <Link to="/use-cases">
                  <Sparkles className="w-4 h-4" />
                  Explore Use Cases
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
