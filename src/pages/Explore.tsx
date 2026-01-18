/**
 * Explore — The Substrate Gateway
 * Comprehensive showcase of all cognitive infrastructure capabilities
 */

import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  ArrowRight, 
  Brain, 
  Shield, 
  Zap, 
  Eye, 
  Moon, 
  Terminal, 
  MessageSquare,
  Sparkles,
  Play,
  ChevronDown,
  Cpu,
  Database,
  Lock,
  Layers,
  Code,
  Network,
  Activity,
  RefreshCw,
  Lightbulb,
  Search,
  BookOpen,
  Mail,
  Globe,
  Wand2,
  Fingerprint,
  BarChart3,
  Bot,
  Webhook,
  FileText,
  Settings,
  TrendingUp,
  HeartPulse,
  Workflow,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";

// Animated gradient orb component
function GradientOrb({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, delay, ease: "easeOut" }}
      className={cn(
        "absolute rounded-full blur-[100px] pointer-events-none",
        className
      )}
    />
  );
}

// Animated counter
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      {value}{suffix}
    </motion.span>
  );
}

// Core Module Card
function ModuleCard({ 
  icon: Icon, 
  title, 
  description, 
  features,
  href, 
  color,
  gradient,
  delay = 0
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  features: string[];
  href: string;
  color: string;
  gradient: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
    >
      <Link to={href} className="group block relative h-full">
        <div className={cn(
          "relative h-full p-6 rounded-2xl border transition-all duration-500",
          "bg-card/50 backdrop-blur-sm border-border/50",
          "hover:bg-card/80 hover:border-current/30",
          "hover:shadow-2xl hover:-translate-y-1",
          color
        )}>
          {/* Gradient glow on hover */}
          <div className={cn(
            "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 -z-10",
            gradient
          )} />
          
          {/* Icon */}
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500",
            "bg-current/10 group-hover:bg-current/20 group-hover:scale-110"
          )}>
            <Icon className="w-6 h-6" />
          </div>
          
          {/* Content */}
          <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-current transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            {description}
          </p>
          
          {/* Features list */}
          <ul className="space-y-1.5 mb-4">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-current opacity-60" />
                {feature}
              </li>
            ))}
          </ul>
          
          {/* Arrow */}
          <div className="flex items-center gap-2 text-sm font-medium mt-auto pt-2">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">Explore</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Integration/Function Card - Compact
function IntegrationCard({
  icon: Icon,
  title,
  description,
  count,
  color,
  delay = 0
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  count?: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "p-4 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm",
        "hover:bg-card/60 hover:border-current/20 transition-all duration-300",
        color
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-current/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm text-foreground">{title}</h4>
            {count && (
              <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                {count}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Capability stat
function CapabilityStat({ 
  icon: Icon, 
  value, 
  label, 
  description,
  color,
  delay = 0 
}: { 
  icon: React.ElementType;
  value: string; 
  label: string;
  description: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={cn("text-center p-6 rounded-2xl border border-border/30 bg-card/30", color)}
    >
      <div className="w-12 h-12 rounded-xl bg-current/10 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-current to-current/60 bg-clip-text text-transparent mb-1">
        {value}
      </div>
      <div className="font-medium text-foreground mb-1">{label}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </motion.div>
  );
}

// Section divider
function SectionDivider() {
  return (
    <div className="relative py-16">
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <motion.div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
}

export default function Explore() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  
  // Core Modules - the 7 pillars (all deployed via pf-substrate)
  const coreModules = [
    {
      icon: Brain,
      title: "Brain",
      description: "Persistent memory, learning cycles, and self-reflection. The cognitive core that remembers, learns, and evolves.",
      features: [
        "Memory query & storage",
        "Daily reflection cycles",
        "Knowledge graph summaries",
        "Session reflection",
        "Memory reinforcement",
        "Cold storage migration"
      ],
      href: "/decode",
      color: "text-cyan-500",
      gradient: "bg-cyan-500",
    },
    {
      icon: MessageSquare,
      title: "Decode",
      description: "Epistemic conversation engine. Intent parsing with contextual understanding and dream integration.",
      features: [
        "Natural language chat",
        "Intent extraction",
        "Dream mode conversations",
        "Learning from interactions",
        "Session management",
        "Cascade AI integration"
      ],
      href: "/decode",
      color: "text-purple-500",
      gradient: "bg-purple-500",
    },
    {
      icon: Shield,
      title: "Defense",
      description: "Behavioral analysis, threat detection, and autonomous security. Protects the substrate from attacks.",
      features: [
        "Request analysis",
        "IP reputation scoring",
        "Anomaly detection",
        "Security posture checks",
        "Rate limit monitoring",
        "Z-score anomaly probes"
      ],
      href: "/substrate",
      color: "text-amber-500",
      gradient: "bg-amber-500",
    },
    {
      icon: Zap,
      title: "Nexus",
      description: "Multi-provider AI routing with intelligent model selection based on task, cost, and latency.",
      features: [
        "Intelligent routing",
        "Provider availability",
        "Routing analytics",
        "Automatic failover",
        "Cost optimization",
        "BYOK support"
      ],
      href: "/substrate",
      color: "text-green-500",
      gradient: "bg-green-500",
    },
    {
      icon: Eye,
      title: "Vision",
      description: "Unified observability layer with real-time metrics, health monitoring, and comprehensive audit trails.",
      features: [
        "System health checks",
        "Dashboard data",
        "Distributed tracing",
        "Introspection",
        "AI quota monitoring",
        "Pulse heartbeats"
      ],
      href: "/os",
      color: "text-blue-500",
      gradient: "bg-blue-500",
    },
    {
      icon: Moon,
      title: "Dream",
      description: "Nocturnal processing engine. Feed dreams to the substrate and watch transformation emerge.",
      features: [
        "Dream feeding API",
        "Dream cycles",
        "Awakening sequences",
        "Sentiment analysis",
        "Pattern extraction",
        "Mutation cycles"
      ],
      href: "/feed-dream-eater",
      color: "text-violet-500",
      gradient: "bg-violet-500",
    },
    {
      icon: Settings,
      title: "System",
      description: "Administrative operations, diagnostics, healing, and backup/restore for the entire substrate.",
      features: [
        "System status",
        "Full diagnostics",
        "Self-healing",
        "Backup & restore",
        "Version management",
        "Service restart"
      ],
      href: "/substrate",
      color: "text-rose-500",
      gradient: "bg-rose-500",
    },
  ];

  // Deployed substrate actions by module (per MODULE-ACTIONS-REGISTRY.md)
  const substrateActions = [
    { icon: Brain, title: "Brain Actions", description: "query, remember, reflect, reinforce, dream, status, graphSummary, sessionReflection, learn, coldMigrate", count: "10", color: "text-cyan-500" },
    { icon: Eye, title: "Vision Actions", description: "health, healthSnapshot, dashboard, trace, introspection, pulse, quota, metrics, logs, alert, audit, monitor, resilience, analytics", count: "14", color: "text-blue-500" },
    { icon: Shield, title: "Defense Actions", description: "analyze, reputation, anomaly, anomalyProbe, limits, posture, status", count: "7", color: "text-amber-500" },
    { icon: MessageSquare, title: "Decode Actions", description: "chat, intent, dream, learn, status", count: "5", color: "text-purple-500" },
    { icon: Zap, title: "Nexus Actions", description: "route, providers, routeStats, status", count: "4", color: "text-green-500" },
    { icon: Moon, title: "Dream Actions", description: "cycle, awaken, feed", count: "3", color: "text-violet-500" },
    { icon: Settings, title: "System Actions", description: "status, health, diagnostics, heal, backup, restore, audit, version, restart", count: "9", color: "text-rose-500" },
  ];

  // System Capabilities - ACCURATE counts
  const capabilities = [
    { icon: Layers, value: "52", label: "Substrate Actions", description: "Via unified pf-substrate", color: "text-purple-500" },
    { icon: Database, value: "50+", label: "Database Tables", description: "Structured data schemas", color: "text-green-500" },
    { icon: Activity, value: "24/7", label: "Autonomous Ops", description: "Self-healing systems", color: "text-amber-500" },
    { icon: Clock, value: "<100ms", label: "Response Time", description: "Edge-optimized latency", color: "text-blue-500" },
    { icon: HeartPulse, value: "7", label: "Core Modules", description: "Brain, Decode, Defense, Nexus, Vision, Dream, System", color: "text-rose-500" },
    { icon: Lock, value: "BYOK", label: "Architecture", description: "Bring Your Own Keys", color: "text-cyan-500" },
  ];

  // Key Features
  const keyFeatures = [
    {
      icon: Lightbulb,
      title: "Self-Learning Architecture",
      description: "The substrate continuously learns from interactions, improving responses and discovering patterns autonomously. Daily reflection cycles synthesize insights.",
      color: "text-amber-500"
    },
    {
      icon: Workflow,
      title: "Autonomous Operations",
      description: "Scheduled tasks, self-healing systems, and proactive maintenance run without human intervention. The substrate manages itself.",
      color: "text-emerald-500"
    },
    {
      icon: Target,
      title: "Intent-Driven Routing",
      description: "Every request is analyzed and routed to the optimal AI model based on task complexity, cost constraints, and latency requirements.",
      color: "text-blue-500"
    },
    {
      icon: TrendingUp,
      title: "Unified Observability",
      description: "14 vision actions provide complete insight into system health, traces, metrics, AI quotas, and real-time pulse monitoring.",
      color: "text-purple-500"
    },
    {
      icon: Lock,
      title: "Defense-First Design",
      description: "Multi-layer security with behavioral analysis, anomaly detection, and IP reputation scoring protects every endpoint.",
      color: "text-rose-500"
    },
    {
      icon: Cloud,
      title: "BYOK Architecture",
      description: "Bring Your Own Keys — register your AI provider keys, connect your integrations, and pay providers directly. Zero vendor lock-in.",
      color: "text-cyan-500"
    },
  ];

  // External Integrations - BYOK services available via integration bus
  const integrations = [
    { icon: Zap, title: "Stripe", description: "Payments, subscriptions, billing — use your Stripe API keys", color: "text-purple-500" },
    { icon: MessageSquare, title: "Twilio", description: "SMS, voice, messaging — use your Twilio credentials", color: "text-red-500" },
    { icon: Globe, title: "Shopify", description: "E-commerce, products, orders — connect your store", color: "text-green-500" },
    { icon: Workflow, title: "n8n", description: "Workflow automation — trigger your n8n workflows", color: "text-orange-500" },
    { icon: Webhook, title: "Webhooks", description: "Custom endpoints — connect any external API", color: "text-cyan-500" },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-hidden">
      <SEO 
        title="promptfluid® — Cognitive Substrate Infrastructure"
        description="7 core modules, 52 substrate actions, BYOK architecture. Autonomous learning, memory persistence, AI routing, and defense-first design. Build applications that think, learn, and defend themselves."
        canonical="https://promptfluid.com"
        keywords={['cognitive substrate', 'AI infrastructure', 'autonomous AI', 'BYOK', 'memory systems', 'self-learning', 'defense AI']}
      />

      <PublicNav />

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div style={{ y: backgroundY }} className="absolute inset-0">
          <GradientOrb className="w-[600px] h-[600px] -top-48 -left-48 bg-primary/30" delay={0} />
          <GradientOrb className="w-[500px] h-[500px] top-1/3 -right-48 bg-violet-500/20" delay={0.2} />
          <GradientOrb className="w-[400px] h-[400px] bottom-0 left-1/3 bg-cyan-500/15" delay={0.4} />
        </motion.div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 px-4 pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-6 px-4 py-1.5 bg-primary/5 border-primary/30">
              <Sparkles className="w-3 h-3 mr-2 text-primary" />
              <span className="text-primary">Production-Grade Cognitive Infrastructure</span>
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              The Substrate That{" "}
              <span className="bg-gradient-to-r from-primary via-violet-500 to-cyan-500 bg-clip-text text-transparent">
                Thinks, Learns, Defends, and Dreams
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
              <strong className="text-foreground">7 core modules.</strong>{" "}
              <strong className="text-foreground">52 substrate actions.</strong>{" "}
              <strong className="text-foreground">BYOK architecture.</strong>
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
              A complete cognitive backend with persistent memory, intelligent AI routing, behavioral defense, 
              dream-state processing, and full observability—all self-healing and continuously learning.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/os">
              <Button size="lg" className="gap-2 px-8 bg-gradient-to-r from-primary to-violet-500 hover:opacity-90">
                <Terminal className="w-4 h-4" />
                Open Substrate OS
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="gap-2 px-8">
                <Play className="w-4 h-4" />
                Watch Demo
              </Button>
            </Link>
          </motion.div>
          
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-12"
          >
            {[
              { label: "Core Modules", value: "7" },
              { label: "Substrate Actions", value: "52" },
              { label: "Database Tables", value: "50+" },
              { label: "BYOK Integrations", value: "5" },
            ].map((stat, idx) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <span className="text-xs uppercase tracking-widest">Explore the Infrastructure</span>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Core Modules Section */}
      <section className="relative z-10 px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">7 Core Modules</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Cognitive Architecture</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Seven interconnected systems working in harmony. Each module operates independently 
              while contributing to the collective intelligence of the substrate.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {coreModules.map((module, idx) => (
              <ModuleCard 
                key={module.title}
                {...module}
                delay={idx * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Substrate Actions Section */}
      <section className="relative z-10 px-4 py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">Unified API</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">52 Substrate Actions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              All cognitive operations accessible through a single endpoint. Memory, chat, security, 
              AI routing, observability, dream processing, and system administration.
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {substrateActions.map((action, idx) => (
              <IntegrationCard 
                key={action.title}
                {...action}
                delay={idx * 0.05}
              />
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <Link to="/developers">
              <Button variant="outline" className="gap-2">
                <Code className="w-4 h-4" />
                View Full API Reference
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* Capabilities Grid */}
      <section className="relative z-10 px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">By The Numbers</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Production-Ready Scale</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Not a proof of concept. A fully deployed, battle-tested cognitive substrate 
              running in production 24/7.
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, idx) => (
              <CapabilityStat 
                key={cap.label}
                {...cap}
                delay={idx * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Key Features */}
      <section className="relative z-10 px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">Architecture Highlights</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Makes It Different</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Beyond traditional backends. This is infrastructure that thinks, adapts, and improves itself.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFeatures.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "p-6 rounded-2xl border border-border/50 bg-card/30",
                  feature.color
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-current/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Products Built on Substrate */}
      <section className="relative z-10 px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">BYOK Integrations</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Connect External Services</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Bring your own keys. The substrate connects to your existing services seamlessly.
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration, idx) => (
              <motion.div
                key={integration.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "p-5 rounded-xl border border-border/50 bg-card/30 transition-all duration-300",
                  "hover:bg-card/60 hover:border-current/20",
                  integration.color
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-current/10 flex items-center justify-center shrink-0">
                    <integration.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      {integration.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer CTA */}
      <section className="relative z-10 px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative p-8 md:p-16 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-violet-600 to-purple-700" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            
            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
                  <Terminal className="w-4 h-4" />
                  Open Infrastructure
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Explore the Full Substrate
                </h2>
                <p className="text-white/80 text-lg max-w-xl mb-6">
                  Access the OS dashboard, view live telemetry, trigger cognitive cycles, 
                  and witness autonomous learning in real-time.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/os">
                    <Button size="lg" className="w-full sm:w-auto px-8 bg-white text-primary hover:bg-white/90 font-semibold">
                      <Terminal className="w-4 h-4 mr-2" />
                      Open Substrate OS
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/documentation">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 border-white/30 text-white hover:bg-white/10">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Read Docs
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Code preview decoration */}
              <div className="hidden lg:block w-80 shrink-0">
                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10 font-mono text-sm">
                  <div className="flex items-center gap-2 mb-3 text-white/50">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <pre className="text-white/80 text-xs leading-relaxed overflow-hidden">
{`// Substrate SDK
import { substrate } from 'pf-sdk'

// Query the brain
const memory = await substrate
  .brain.recall({ query: "..." })
  
// Route AI requests
const result = await substrate
  .nexus.route({ 
    task: "complex reasoning",
    budget: "optimal"
  })

// Trigger learning cycle
await substrate.brain.learn()`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="p-12 md:p-16 rounded-3xl bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent border border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Experience It?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Talk to Cascade. Feed the Dream-Eater. Watch the substrate think.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/decode">
                <Button size="lg" className="px-10 bg-gradient-to-r from-primary to-violet-500 hover:opacity-90">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start a Conversation
                </Button>
              </Link>
              <Link to="/feed-dream-eater">
                <Button size="lg" variant="outline" className="px-10">
                  <Moon className="w-4 h-4 mr-2" />
                  Feed a Dream
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
