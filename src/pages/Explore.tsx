/**
 * Explore — The CMPSBL Gateway
 * Comprehensive showcase of cognitive infrastructure capabilities
 * Polished for maximum conversion across gaming, dev, and enterprise audiences
 */

import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Brain, 
  Shield, 
  Zap, 
  Eye, 
  Moon, 
  Terminal, 
  MessageSquare,
  Cpu,
  Database,
  Layers,
  Code,
  Network,
  RefreshCw,
  Lock,
  Clock,
  HeartPulse,
  Workflow,
  Globe,
  Webhook,
  CheckCircle2,
  Settings,
  Fingerprint,
  BookOpen,
  ChevronDown,
  Plug,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";

// Components
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { HeroMetaSubstrate } from "@/components/hero/HeroMetaSubstrate";
import { UseCaseShowcase } from "@/components/home/UseCaseShowcase";
import { IndustryShowcase } from "@/components/home/IndustryShowcase";
import { WhySubstrate } from "@/components/home/WhySubstrate";
import { BuiltForSection } from "@/components/home/BuiltForSection";
import { TechShowcase } from "@/components/home/TechShowcase";
import { CodeLabCTA } from "@/components/codelab/CodeLabCTA";
import { SynergyDepotCTA } from "@/components/explore/SynergyDepotCTA";
import { LnchblCTA } from "@/components/LnchblCTA";

// Animated gradient orb
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

// Core Module Card - Compact
function ModuleCard({ 
  icon: Icon, 
  title, 
  description, 
  features,
  href, 
  color,
  delay = 0
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  features: string[];
  href: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
       whileHover={{ y: -5, scale: 1.02 }}
    >
      <Link to={href} className="group block h-full">
        <div className={cn(
          "relative h-full p-5 rounded-xl border transition-all duration-300",
          "bg-card/50 backdrop-blur-sm border-border/50",
          "hover:bg-card/80 hover:border-current/30 hover:shadow-lg",
          color
        )}>
           {/* Gradient overlay on hover */}
           <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-current/5 to-current/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
           
           <div className="relative z-10">
          {/* Icon */}
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
            "bg-current/10 group-hover:bg-current/20 group-hover:scale-110 transition-all"
          )}>
            <Icon className="w-5 h-5" />
          </div>
          
          <h3 className="font-bold text-base text-foreground mb-1 group-hover:text-current transition-colors">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            {description}
          </p>
          
          {/* Features */}
          <ul className="space-y-1">
            {features.slice(0, 3).map((feature, idx) => (
              <li key={idx} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-current opacity-50" />
                {feature}
              </li>
            ))}
          </ul>
           </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Capability stat
function CapabilityStat({ 
  icon: Icon, 
  value, 
  label, 
  color,
  delay = 0 
}: { 
  icon: React.ElementType;
  value: string; 
  label: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={cn("text-center p-4 sm:p-5 rounded-xl border border-border/30 bg-card/30", color)}
    >
      <div className="w-10 h-10 rounded-lg bg-current/10 flex items-center justify-center mx-auto mb-2">
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-xl sm:text-2xl font-bold text-foreground mb-0.5">
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </motion.div>
  );
}

// Section divider
function SectionDivider() {
  return (
    <div className="relative py-12 sm:py-16">
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}

export default function Explore() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Core Modules - all 14 pillars (v8.0.0 SYNERGY+ kernel architecture)
  const coreModules = [
    {
      icon: Cpu,
      title: "Core",
      description: "The kernel. Scheduling, lifecycle, and configuration.",
      features: ["Boot sequence", "Job scheduling", "Module routing"],
      href: "/substrate",
      color: "text-slate-500",
    },
    {
      icon: Network,
      title: "Ripple",
      description: "Message bus for async jobs and event sourcing.",
      features: ["Job queues", "Pub/sub events", "Dead letter handling"],
      href: "/substrate",
      color: "text-teal-500",
    },
    {
      icon: Fingerprint,
      title: "Access",
      description: "Identity, API keys, quotas, and usage metering.",
      features: ["API key management", "Rate limiting", "Usage metering"],
      href: "/substrate",
      color: "text-indigo-500",
    },
    {
      icon: Brain,
      title: "Brain",
      description: "3-tier memory (Hot/Warm/Cold), learning, and knowledge graph.",
      features: ["Memory tiering", "Knowledge graph", "Reflection cycles"],
      href: "/decode",
      color: "text-cyan-500",
    },
    {
      icon: MessageSquare,
      title: "Decode",
      description: "Epistemic conversation engine with intent parsing.",
      features: ["Natural language", "Intent extraction", "Dream mode"],
      href: "/decode",
      color: "text-purple-500",
    },
    {
      icon: Shield,
      title: "Defense",
      description: "Behavioral analysis and autonomous security.",
      features: ["Request analysis", "IP reputation", "Anomaly detection"],
      href: "/substrate",
      color: "text-amber-500",
    },
    {
      icon: Zap,
      title: "Nexus",
      description: "Multi-provider AI routing with intelligent selection.",
      features: ["Smart routing", "Provider failover", "Cost optimization"],
      href: "/substrate",
      color: "text-green-500",
    },
    {
      icon: Eye,
      title: "Vision",
      description: "Unified observability with health monitoring.",
      features: ["Health dashboard", "Distributed tracing", "Audit trails"],
      href: "/os",
      color: "text-blue-500",
    },
    {
      icon: Moon,
      title: "Dream",
      description: "Nocturnal processing engine for pattern extraction.",
      features: ["Dream cycles", "Pattern extraction", "Memory consolidation"],
      href: "/feed-dream-eater",
      color: "text-violet-500",
    },
    {
      icon: Settings,
      title: "System",
      description: "Administration, diagnostics, and backup/restore.",
      features: ["Self-healing", "Backup & restore", "Full diagnostics"],
      href: "/substrate",
      color: "text-rose-500",
    },
    {
      icon: RefreshCw,
      title: "Modernizer",
      description: "Self-upgrade engine that proposes and applies improvements.",
      features: ["Code scanning", "Upgrade proposals", "Rollback safety"],
      href: "/os",
      color: "text-orange-500",
    },
    {
      icon: Plug,
      title: "Integration",
      description: "Enterprise adapters and governed LLM execution.",
      features: ["35+ adapters", "Auto-discovery", "LLM governance"],
      href: "/os",
      color: "text-emerald-500",
    },
    {
      icon: Sparkles,
      title: "Cortex",
      description: "Agency-class orchestrator for autonomous evolution.",
      features: ["Evolution planning", "Proposal dispatch", "System governance"],
      href: "/os",
      color: "text-violet-500",
    },
    {
      icon: BookOpen,
      title: "Inclusive",
      description: "Human-compatibility pipeline for WCAG/ARIA compliance.",
      features: ["Accessibility scanning", "Auto-repair", "Profile adaptation"],
      href: "/os",
      color: "text-pink-500",
    },
  ];

  // System Capabilities - aligned with public metrics store
  const capabilities = [
    { icon: Layers, value: "310+", label: "Commands", color: "text-purple-500" },
    { icon: Database, value: "147", label: "Pipelines", color: "text-green-500" },
    { icon: HeartPulse, value: "14", label: "Modules", color: "text-rose-500" },
    { icon: Clock, value: "<100ms", label: "Latency", color: "text-blue-500" },
    { icon: Lock, value: "269", label: "Capabilities", color: "text-cyan-500" },
    { icon: RefreshCw, value: "24/7", label: "Autonomous", color: "text-amber-500" },
  ];

  // BYOK Integrations
  const integrations = [
    { icon: Zap, title: "Stripe", description: "Payments, subscriptions, billing", color: "text-purple-500" },
    { icon: MessageSquare, title: "Twilio", description: "SMS, voice, messaging", color: "text-red-500" },
    { icon: Globe, title: "Shopify", description: "E-commerce, products, orders", color: "text-green-500" },
    { icon: Workflow, title: "n8n", description: "Workflow automation", color: "text-orange-500" },
    { icon: Webhook, title: "Webhooks", description: "Connect any external API", color: "text-cyan-500" },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden overflow-y-visible">
      <SEO 
        title="CMPSBL® Substrate OS v8.0.0 — 14-Module Cognitive Infrastructure"
        description="The cognitive infrastructure standard: 14 modules, 5 layers, 147 synergy pipelines, 269 capabilities, 310+ terminal commands. Free exploration tier with premium Engine subscriptions."
        canonical="https://cmpsbl.com"
        keywords={['CMPSBL', 'Substrate OS', 'v8.0.0', 'SYNERGY+', '14-module architecture', 'cognitive OS', 'AI governance', 'persistent memory', 'dream cycles', 'synergy pipelines', 'engine marketplace']}
      />

      <PublicNav />

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <GradientOrb className="w-[600px] h-[600px] -top-48 -left-48 bg-primary/10" delay={0} />
        <GradientOrb className="w-[500px] h-[500px] top-1/4 -right-48 bg-violet-500/10" delay={0.2} />
        <GradientOrb className="w-[400px] h-[400px] bottom-0 left-1/4 bg-cyan-500/8" delay={0.4} />
      </div>

      {/* Hero Section */}
      <HeroMetaSubstrate />

      {/* Synergy Pipelines & Capabilities Depot CTA */}
      <SynergyDepotCTA />

       {/* Use Case Showcase - directly under hero */}
       <UseCaseShowcase />

      {/* Scroll Indicator */}
      <section className="relative z-10 px-4 py-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground animate-bounce" style={{ animationDuration: '2s' }}>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest">Explore the Infrastructure</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </motion.div>
      </section>

      {/* Built For Section - Who is this for */}
      <BuiltForSection />

      <SectionDivider />

      {/* Why Substrate - Differentiators */}
      <WhySubstrate />

      <SectionDivider />

      {/* Tech Showcase - Code Examples */}
      <TechShowcase />

      <SectionDivider />

      {/* Industry Showcase */}
      <IndustryShowcase />

      <SectionDivider />

      {/* Core Modules Section */}
      <section className="relative z-10 px-4 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <Badge variant="outline" className="mb-4">14 Core Modules</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              The 14-Module Cognitive Substrate
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Fourteen specialized modules across five architectural layers. Each operates autonomously 
              while contributing to system-wide intelligence, self-healing, and continuous evolution.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
            {coreModules.map((module, idx) => (
              <ModuleCard 
                key={module.title}
                {...module}
                delay={idx * 0.05}
              />
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Capabilities Grid */}
      <section className="relative z-10 px-4 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <Badge variant="outline" className="mb-4">By The Numbers</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Complete Infrastructure
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              A fully-documented cognitive operating system with 14 specialized modules, 
              persistent memory architecture, and autonomous self-improvement capabilities.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {capabilities.map((cap, idx) => (
              <CapabilityStat 
                key={cap.label}
                {...cap}
                delay={idx * 0.08}
              />
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* CodeLab CTA */}
      <CodeLabCTA />

      <SectionDivider />

      {/* BYOK Integrations */}
      <section className="relative z-10 px-4 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <Badge variant="outline" className="mb-4">BYOK Integrations</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Bring Your Own Keys
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              CMPSBL integrates with your existing services using your API keys. 
              No vendor lock-in, full data sovereignty, zero intermediaries.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {integrations.map((integration, idx) => (
              <motion.div
                key={integration.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className={cn(
                  "p-4 rounded-xl border border-border/50 bg-card/30",
                  "hover:bg-card/60 hover:border-current/20 transition-all duration-300",
                  integration.color
                )}
              >
                <div className="w-9 h-9 rounded-lg bg-current/10 flex items-center justify-center mb-2">
                  <integration.icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-0.5">
                  {integration.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{integration.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Final CTA */}
      <section className="relative z-10 px-4 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative p-8 sm:p-12 md:p-16 rounded-3xl overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-violet-600 to-purple-700" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                Build AI That Remembers, Dreams, and Evolves
              </h2>
              <p className="text-white/80 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-6 sm:mb-8">
                Start with production-ready templates, dive into comprehensive documentation, 
                or see the substrate orchestrating autonomous workflows in real-time.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button asChild size="lg" className="px-6 sm:px-8 bg-white text-primary hover:bg-white/90 font-semibold">
                  <Link to="/codelab">
                    <Terminal className="w-4 h-4 mr-2" />
                    Start in CodeLab
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="px-6 sm:px-8 border-white/30 text-white hover:bg-white/10">
                  <Link to="/documentation">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Read Docs
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
