/**
 * AI Operating System — Definitional SEO landing page
 * Route: /ai-operating-system — owns the "AI Operating System" keyword
 * CONTACT epoch · 40-primitive · Memory Stream narrative
 */

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  ArrowRight, Brain, Shield, Network, Moon, Workflow, Cpu,
  Layers, Zap, Target, Database, Activity, Lock, Sparkles,
  Eye, GitBranch, Terminal,
} from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { AuthorityLinkBlock } from "@/components/seo/AuthorityLinkBlock";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ── animation helpers ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

/* ── data ── */

const faqItems = [
  {
    question: "What is an AI Operating System?",
    answer: "An AI Operating System is a platform that gives AI agents everything they need to work in production — persistent memory, smart routing, built-in security, monitoring, and self-improvement — all in one place. Think of it like how Windows or macOS unified computing: CMPSBL unifies AI infrastructure.",
  },
  {
    question: "How is an AI OS different from an AI framework?",
    answer: "Frameworks like LangChain or CrewAI solve one problem at a time — chaining prompts, managing agents, or formatting outputs. An AI OS integrates all of these into a single platform where every part communicates and strengthens the others. The whole is greater than the sum of its parts.",
  },
  {
    question: "What is the Memory Stream?",
    answer: "The Memory Stream is how the system learns. Every interaction flows through it — the system finds successful patterns, packages them as reusable software, and exports them. The rarest discoveries become specs for silicon computer chips. It's the layer between AI models and your applications.",
  },
  {
    question: "What problems does CMPSBL solve?",
    answer: "CMPSBL solves the fragmentation problem in AI infrastructure. Instead of stitching together separate tools for memory, routing, security, and monitoring, the platform provides 40 integrated primitives that share context, propagate events in real time, and self-optimize automatically.",
  },
  {
    question: "Who needs an AI Operating System?",
    answer: "Any team running AI in production — especially those managing multiple models, needing persistent agent memory, requiring AI-specific security, or wanting their systems to automatically improve over time. Enterprise AI teams, AI startups, and agencies building AI products all benefit.",
  },
  {
    question: "Can CMPSBL work with existing AI models?",
    answer: "Yes. CMPSBL works with any AI model from any provider. The NEXUS Organ automatically routes to OpenAI, Google Gemini, Anthropic Claude, DeepSeek, Groq, or local models based on what works best for each task. Bring your own API keys and your existing stack — CMPSBL handles the orchestration.",
  },
  {
    question: "What is the platform architecture?",
    answer: "40 specialized primitives organized into a symmetric 12·12·8·8 matrix across 4 categories — Organs (vital infrastructure: CORE, SYSTEM, BRAIN, MEMORY, NERVE, NEXUS, IDENTITY, SOVEREIGN, ATLAS, MEDIC, RELAY, CONSCIENCE), Layers (ambient overlays: DEFENSE, IMMUNITY, GOVERNANCE, TREATY, EVOLUTION, REFLEX, COMPASS, INTEGRATION, INTENT, ACCESS, VISION, SHADOW), Engines (invoked processors: DREAM, HARVEST, FORGE, LINGUA, ECHO, PHANTOM, SANDBOX, RIPPLE), and Agents (autonomous actors: ENCODE, DECODE, AUDIT, ECONOMY, INCLUSIVE, CORTEX, ORACLE, ENGINEER). All primitives are weighted and coordinated by the CORE Organ.",
  },
];

const pillars = [
  { icon: Brain, title: "Persistent Memory", desc: "Your agents remember everything across sessions. The MEMORY Organ provides 4-tier storage (hot → warm → cold → legacy) for fast recall of recent context and long-term historical knowledge.", link: "/persistent-memory" },
  { icon: Network, title: "Smart Model Routing", desc: "The NEXUS Organ picks the best AI provider for each task — balancing speed, cost, and quality across 14+ providers. Auto-failover if one goes down. No lock-in.", link: "/architecture" },
  { icon: Shield, title: "Built-in AI Security", desc: "The DEFENSE Layer protects against prompt injection, adversarial inputs, and bot traffic — all built into the platform, not bolted on.", link: "/architecture" },
  { icon: Moon, title: "Self-Improvement Cycles", desc: "During quiet periods, the DREAM Engine consolidates what the system learned, discovers patterns, and generates new insights — all automatically.", link: "/architecture" },
  { icon: Workflow, title: "Coordinated Intelligence", desc: "The CORTEX Agent coordinates all 40 primitives so they work as one unified system. Pre-built synergies discover capabilities that no single primitive could achieve alone.", link: "/architecture" },
  { icon: Cpu, title: "Self-Healing Runtime", desc: "The CORE Organ boots all 40 primitives in a deterministic 12-stage sequence, monitors health continuously, and automatically recovers from failures — zero downtime.", link: "/architecture" },
];

const categories = [
  { label: "Organs", primitives: "CORE, SYSTEM, BRAIN, MEMORY, NERVE, NEXUS, IDENTITY, SOVEREIGN, ATLAS, MEDIC, RELAY, CONSCIENCE", count: 12, color: "from-neon-blue/10 to-neon-blue/5" },
  { label: "Layers", primitives: "DEFENSE, IMMUNITY, GOVERNANCE, TREATY, EVOLUTION, REFLEX, COMPASS, INTEGRATION, INTENT, ACCESS, VISION, SHADOW", count: 12, color: "from-neon-purple/10 to-neon-purple/5" },
  { label: "Engines", primitives: "DREAM, HARVEST, FORGE, LINGUA, ECHO, PHANTOM, SANDBOX, RIPPLE", count: 8, color: "from-neon-amber/10 to-neon-amber/5" },
  { label: "Agents", primitives: "ENCODE, DECODE, AUDIT, ECONOMY, INCLUSIVE, CORTEX, ORACLE, ENGINEER", count: 8, color: "from-neon-green/10 to-neon-green/5" },
];

const comparisonRows = [
  { feature: "Persistent Memory", framework: "DIY (vector DB)", aiOs: "Built-in 4-tier + auto-consolidation" },
  { feature: "Model Routing", framework: "Hardcoded switch", aiOs: "NEXUS Organ — picks best model per task" },
  { feature: "Security", framework: "Add-on tool", aiOs: "DEFENSE Layer — built into the platform" },
  { feature: "Monitoring", framework: "Separate APM tool", aiOs: "Built-in across all 40 primitives" },
  { feature: "Self-Improvement", framework: "None", aiOs: "Automatic optimization cycles" },
  { feature: "Shared Context", framework: "None", aiOs: "Real-time event propagation" },
];

/* ── component ── */

export default function AIOperatingSystem() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const definitionJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "AI Operating System",
    description:
      "A unified software platform that provides all cognitive infrastructure AI agents need to operate in production — persistent memory, intelligent routing, security, observability, and autonomous optimization — integrated into a single coherent runtime.",
    url: "https://cmpsbl.com/ai-operating-system",
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "AI Infrastructure Glossary",
      url: "https://cmpsbl.com/ai-operating-system",
    },
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CMPSBL Substrate",
    description:
      "The world's first AI Operating System — 40 integrated primitives (agents, engines, layers, organs) providing persistent memory, intelligent routing, AI security, autonomous optimization, and meta-orchestration for production AI systems.",
    url: "https://cmpsbl.com/ai-operating-system",
    applicationCategory: "AI Operating System",
    operatingSystem: "Cloud",
    publisher: { "@type": "Organization", name: "CMPSBL", url: "https://cmpsbl.com" },
  };

  return (
    <>
      <Helmet>
        <title>What Is an AI Operating System? | CMPSBL</title>
        <meta
          name="description"
          content="CMPSBL defines the AI Operating System category: one unified runtime replacing fragmented AI tools. Persistent memory, NEXUS routing, DREAM synthesis, and governed evolution across 40 primitives."
        />
        <link rel="canonical" href="https://cmpsbl.com/ai-operating-system" />
        <meta property="og:title" content="What is an AI Operating System? | CMPSBL" />
        <meta
          property="og:description"
          content="The first AI Operating System — 40-primitive cognitive infrastructure for persistent memory, intelligent routing, AI security, and autonomous optimization."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cmpsbl.com/ai-operating-system" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(definitionJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(softwareJsonLd)}</script>
      </Helmet>

      <PublicNav />

      <main className="min-h-screen bg-background">
        {/* ═══════════════════ HERO ═══════════════════ */}
        <section className="relative py-20 sm:py-28 md:py-36 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[120px]" />

          <div className="container mx-auto max-w-5xl px-3 sm:px-4 relative z-10">
            <motion.div {...fadeUp()}>
              <Badge variant="outline" className="mb-5 border-primary/30 bg-primary/5 px-3 py-1.5 gap-1.5">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase">Defining a New Category</span>
              </Badge>
            </motion.div>

            <motion.h1 {...fadeUp(0.05)} className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-5 sm:mb-6 leading-[1.1]">
              What is an <span className="text-primary">AI Operating System?</span>
            </motion.h1>

            <motion.p {...fadeUp(0.1)} className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mb-4">
              An <strong className="text-foreground">AI Operating System</strong> is a platform that gives AI agents everything they need to work in production — persistent memory, smart model routing, built-in security,
              real-time monitoring, and automatic self-improvement — all in one place.
            </motion.p>

            <motion.p {...fadeUp(0.15)} className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl mb-4">
              Just as Windows or macOS unified computing for applications,
              an AI OS unifies the fragmented AI tool stack into one platform where every component
              communicates, learns, and makes the others better.
            </motion.p>

            <motion.p {...fadeUp(0.18)} className="text-sm sm:text-base text-muted-foreground/80 leading-relaxed max-w-3xl italic">
              Every interaction flows through the <strong className="text-foreground not-italic">Memory Stream</strong> — where the system automatically discovers,
              packages, and exports reusable software. The rarest discoveries become specs for silicon computer chips.
            </motion.p>

            <motion.div {...fadeUp(0.22)} className="flex flex-col sm:flex-row gap-3 mt-8 sm:mt-10">
              <Button asChild size="lg" className="gap-2 px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Link to="/architecture">
                  <Activity className="w-5 h-5" />
                  Explore Architecture
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base font-semibold rounded-xl border-border/60 hover:border-primary/30 transition-colors">
                <Link to="/foundry">
                  <Terminal className="w-5 h-5" />
                  Explore the Memory Stream
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════ FRAGMENTATION PROBLEM ═══════════════════ */}
        <section className="py-12 sm:py-16 border-t border-border/30">
          <div className="container mx-auto max-w-4xl px-3 sm:px-4">
            <motion.div {...fadeUp()}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-4 flex items-center gap-2.5 tracking-tight">
                <Target className="w-6 h-6 text-primary shrink-0" />
                The Fragmentation Problem
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-5 max-w-3xl">
                Today's AI teams stitch together separate tools for every concern — a vector database for memory,
                an API gateway for routing, a prompt filter for security, and an APM tool for monitoring.
                These tools don't share context or learn from each other.
              </p>
              <Card className="border-primary/15 bg-primary/[0.03] glass-edge">
                <CardContent className="p-4 sm:p-6">
                  <p className="text-sm sm:text-base text-foreground font-medium leading-relaxed">
                    An AI Operating System eliminates this fragmentation. Every primitive shares context, events flow through the system in real time,
                    and the platform self-improves as a unified whole — automatically.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════ COMPARISON TABLE ═══════════════════ */}
        <section className="py-12 sm:py-16 border-t border-border/30 bg-muted/20">
          <div className="container mx-auto max-w-4xl px-3 sm:px-4">
            <motion.div {...fadeUp()}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-3 tracking-tight">
                AI Framework vs. AI Operating System
              </h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-2xl">
                Frameworks solve individual problems. An AI OS integrates them all.
              </p>
            </motion.div>

            <div className="rounded-xl border border-border overflow-hidden glass-edge">
              <div className="grid grid-cols-3 bg-card/80 border-b border-border/50 px-3 sm:px-5 py-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Capability</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Framework</span>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">AI OS (CMPSBL)</span>
              </div>
              {comparisonRows.map((row, i) => (
                <motion.div
                  key={row.feature}
                  {...fadeUp(i * 0.03)}
                  className="grid grid-cols-3 px-3 sm:px-5 py-3 border-b border-border/30 last:border-0 hover:bg-primary/[0.02] transition-colors"
                >
                  <span className="text-xs sm:text-sm font-medium text-foreground">{row.feature}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground/60">{row.framework}</span>
                  <span className="text-xs sm:text-sm text-foreground font-medium">{row.aiOs}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ SIX PILLARS ═══════════════════ */}
        <section className="py-12 sm:py-20 border-t border-border/30">
          <div className="container mx-auto max-w-5xl px-3 sm:px-4">
            <motion.div {...fadeUp()} className="mb-10 sm:mb-14">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-3 flex items-center gap-2.5 tracking-tight">
                <Layers className="w-6 h-6 text-primary shrink-0" />
                The 6 Pillars of an AI Operating System
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                Every AI OS must provide these six core capabilities — integrated and working together.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {pillars.map((pillar, i) => (
                <motion.div key={i} {...fadeUp(i * 0.06)}>
                  <Link
                    to={pillar.link}
                    className="group block h-full rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 sm:p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 glass-edge card-lift shimmer-on-hover"
                  >
                    <pillar.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">{pillar.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ 40-PRIMITIVE ARCHITECTURE ═══════════════════ */}
        <section className="py-12 sm:py-20 border-t border-border/30 bg-muted/20">
          <div className="container mx-auto max-w-5xl px-3 sm:px-4">
            <motion.div {...fadeUp()} className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-3 flex items-center gap-2.5 tracking-tight">
                <Activity className="w-6 h-6 text-primary shrink-0" />
                40 Primitives · 12 Organs · 12 Layers · 8 Engines · 8 Agents
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
                The CMPSBL platform organizes 40 specialized primitives into a symmetric 12·12·8·8 matrix across four categories. Each holds a weight in the system matrix (Σ = 1.000),
                managed by the CORE Organ. Circuit breakers prevent cascading failures. Self-improvement cycles optimize autonomously.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 mb-8 sm:mb-10">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.label}
                  {...fadeUp(i * 0.03)}
                  className={`p-3 sm:p-4 rounded-xl border border-border/40 bg-gradient-to-br ${cat.color} hover:border-primary/20 transition-all duration-300 card-lift`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground">{cat.label}</h3>
                    <span className="text-[9px] sm:text-[10px] font-mono text-muted-foreground tabular-nums">{cat.count}</span>
                  </div>
                  <p className="text-[10px] sm:text-xs font-mono text-muted-foreground leading-relaxed break-words">{cat.primitives}</p>
                </motion.div>
              ))}
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                { value: "40", label: "Primitives" },
                { value: "4", label: "Categories" },
                { value: "1.000", label: "Σ Weight" },
                { value: "379", label: "Capabilities" },
              ].map((stat, i) => (
                <motion.div key={i} {...fadeUp(i * 0.05)} className="text-center p-3 sm:p-4 rounded-xl border border-border/50 bg-card/50 glass-edge">
                  <div className="text-xl sm:text-2xl md:text-3xl font-black text-primary font-mono tabular-nums">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ MEMORY STREAM ═══════════════════ */}
        <section className="py-12 sm:py-20 border-t border-border/30">
          <div className="container mx-auto max-w-4xl px-3 sm:px-4">
            <motion.div {...fadeUp()} className="text-center mb-8 sm:mb-12">
              <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 px-3 py-1.5 gap-1.5">
                <Zap className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-semibold tracking-widest uppercase">How Discovery Works</span>
              </Badge>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-3 tracking-tight">
                The Memory Stream
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                The Memory Stream captures raw system behavior and crystallizes it into production-grade exportable software memories.
                The rarest discoveries become specs for silicon computer chips.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                { icon: Eye, title: "Observe", desc: "Every interaction is captured — model calls, latency patterns, cost signals, failure modes." },
                { icon: Database, title: "Crystallize", desc: "High-scoring patterns are autonomously crystallized into memories and packaged as exportable capabilities." },
                { icon: Cpu, title: "Export", desc: "Memories ship as sealed runtimes. The rarest become silicon chip specifications." },
              ].map((step, i) => (
                <motion.div
                  key={step.title}
                  {...fadeUp(i * 0.08)}
                  className="p-5 sm:p-6 rounded-xl border border-border/50 bg-card/50 text-center glass-edge card-lift"
                >
                  <step.icon className="w-7 h-7 text-primary mx-auto mb-3" />
                  <h3 className="text-sm sm:text-base font-bold text-foreground mb-1.5">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ FAQ ═══════════════════ */}
        <section className="py-12 sm:py-20 border-t border-border/30 bg-muted/20">
          <div className="container mx-auto max-w-4xl px-3 sm:px-4">
            <motion.div {...fadeUp()}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-6 sm:mb-8 tracking-tight">
                Frequently Asked Questions
              </h2>
            </motion.div>

            <div className="space-y-3">
              {faqItems.map((item, i) => (
                <motion.details
                  key={i}
                  {...fadeUp(i * 0.04)}
                  className="group p-4 sm:p-5 rounded-xl border border-border/50 bg-card/50 hover:border-primary/20 transition-all duration-300 glass-edge"
                >
                  <summary className="font-bold text-sm sm:text-base text-foreground cursor-pointer list-none flex items-center justify-between gap-3">
                    <span>{item.question}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform shrink-0" />
                  </summary>
                  <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                </motion.details>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ CTA ═══════════════════ */}
        <section className="relative py-14 sm:py-24 border-t border-border/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto max-w-3xl px-3 sm:px-4 text-center relative z-10">
            <motion.div {...fadeUp()}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-3 sm:mb-4 tracking-tight">
                Ready to run your AI on an operating system?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto">
                Start building on the substrate. Persistent memory is free for all users.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="gap-2 px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <Link to="/auth">
                    <Sparkles className="w-5 h-5" />
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2 px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base font-semibold rounded-xl border-border/60 hover:border-primary/30 transition-colors">
                  <Link to="/architecture">
                    <Activity className="w-5 h-5" />
                    Explore Architecture
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <AuthorityLinkBlock currentPath="/ai-operating-system" />
      <EnhancedFooter />
    </>
  );
}
