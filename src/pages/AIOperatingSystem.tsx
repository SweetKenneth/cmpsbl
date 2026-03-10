/**
 * AI Operating System — Definitional glossary/landing page
 * SEO: /ai-operating-system — owns the "AI Operating System" keyword
 */

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Shield, Network, Moon, Workflow, Cpu, Layers, Zap, Target, Gamepad2, Database, Eye, Activity } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { AuthorityLinkBlock } from "@/components/seo/AuthorityLinkBlock";
import { Button } from "@/components/ui/button";

const faqItems = [
  {
    question: "What is an AI Operating System?",
    answer: "An AI Operating System is a unified software platform that provides all the cognitive infrastructure AI agents need to operate in production — persistent memory, intelligent routing, security, observability, and autonomous optimization — integrated into a single coherent runtime, much like how traditional operating systems unified file management, process scheduling, and I/O for applications."
  },
  {
    question: "How is an AI Operating System different from an AI framework?",
    answer: "AI frameworks like LangChain or CrewAI solve individual problems — chaining prompts, managing agents, or structuring outputs. An AI Operating System integrates all of these concerns (memory, routing, security, monitoring, optimization) into a single platform where nodes communicate and enhance each other. The whole is greater than the sum of its parts."
  },
  {
    question: "What problems does CMPSBL's AI Operating System solve?",
    answer: "CMPSBL solves the fragmentation problem in AI infrastructure. Instead of stitching together separate tools for memory (vector DBs), routing (API gateways), security (prompt filters), and monitoring (observability platforms), CMPSBL provides 40 nodes across 12 sectors as an integrated cognitive substrate that shares context, learns from each other, and self-optimizes."
  },
  {
    question: "Who needs an AI Operating System?",
    answer: "Any organization running AI in production — especially those managing multiple models, needing persistent agent memory, requiring AI-specific security (prompt injection defense), or wanting their AI systems to autonomously improve. Enterprise AI teams, AI-native startups, and agencies building AI products all benefit."
  },
  {
    question: "Can CMPSBL work with existing AI models and providers?",
    answer: "Yes. CMPSBL is model-agnostic and provider-agnostic. The NEXUS node intelligently routes to OpenAI, Google Gemini, Anthropic Claude, DeepSeek, Groq, or local models based on task requirements. Bring your own keys (BYOK) and your existing AI stack — CMPSBL orchestrates everything underneath."
  },
  {
    question: "What is CMPSBL's architecture?",
    answer: "The substrate is a 40-node matrix organized across 12 sectors — Kernel (CORE, SYSTEM), CCR (BRAIN, MEMORY, DREAM), OCG (RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT, NERVE), Execution (NEXUS, DECODE, ENCODE, VISION, CORTEX, ECONOMY, SANDBOX, INCLUSIVE, MEDIC, INTEGRATION), ESZ, EPZ, EMZ, CSZ zones, plus Fields (EVOLUTION, IMMUNITY, INTENT), Plane (GOVERNANCE), and Shell (DEFENSE). Weights are managed by CORE with Σ = 1.000."
  },
];

const pillars = [
  { icon: Brain, title: "Persistent Memory", description: "4-tier memory architecture (hot/warm/cold/legacy) with DREAM consolidation. Every agent remembers — free for all users.", link: "/persistent-memory" },
  { icon: Network, title: "Intelligent Routing", description: "NEXUS routes to 14+ providers based on task complexity, cost, and latency. Auto-failover. Budget-aware. Zero lock-in.", link: "/modules/nexus" },
  { icon: Shield, title: "AI-Native Security", description: "DEFENSE wraps the outer shell. Prompt injection detection, adversarial filtering, bot detection, and rate limiting built in.", link: "/modules/defense" },
  { icon: Moon, title: "Autonomous Optimization", description: "DREAM cycles consolidate memory, generate heuristics, and surface lateral insights — your AI improves overnight, autonomously.", link: "/modules/dream" },
  { icon: Workflow, title: "Meta-Orchestration", description: "CORTEX coordinates all 40 nodes as a unified intelligence. Pre-built synergy pipelines discover emergent capabilities.", link: "/modules/cortex" },
  { icon: Cpu, title: "Self-Healing Runtime", description: "CORE boots 40 nodes in dependency order with circuit breakers, weighted health scoring, and zero-downtime hot reload.", link: "/modules/core" },
];

const sectors = [
  { label: "Kernel", nodes: "CORE, SYSTEM", count: 2 },
  { label: "CCR", nodes: "BRAIN, MEMORY, DREAM", count: 3 },
  { label: "OCG", nodes: "RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT, NERVE", count: 6 },
  { label: "Execution", nodes: "NEXUS, DECODE, ENCODE, VISION, CORTEX, ECONOMY, SANDBOX, INCLUSIVE, MEDIC, INTEGRATION", count: 10 },
  { label: "ESZ", nodes: "COMPLIANCE, PREDICT, ETHICS, CONTRACT", count: 4 },
  { label: "EPZ", nodes: "SIMULATE, GEOSPATIAL, EDGE", count: 3 },
  { label: "EMZ", nodes: "FORGE, TRANSLATE, INGEST", count: 3 },
  { label: "CSZ", nodes: "EVOLUTION, SHADOW, PHANTOM", count: 3 },
  { label: "Fields", nodes: "EVOLUTION, IMMUNITY, INTENT", count: 3 },
  { label: "Plane", nodes: "GOVERNANCE", count: 1 },
  { label: "Atlas", nodes: "ATLAS", count: 1 },
  { label: "Shell", nodes: "DEFENSE", count: 1 },
];

export default function AIOperatingSystem() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      }
    }))
  };

  const definitionJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": "AI Operating System",
    "description": "A unified software platform that provides all cognitive infrastructure AI agents need to operate in production — persistent memory, intelligent routing, security, observability, and autonomous optimization — integrated into a single coherent runtime.",
    "url": "https://cmpsbl.com/ai-operating-system",
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "AI Infrastructure Glossary",
      "url": "https://cmpsbl.com/ai-operating-system"
    }
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CMPSBL Substrate",
    "description": "The world's first AI Operating System — 40 integrated nodes across 12 sectors providing persistent memory, intelligent routing, AI security, autonomous optimization, and meta-orchestration for production AI systems.",
    "url": "https://cmpsbl.com/ai-operating-system",
    "applicationCategory": "AI Operating System",
    "operatingSystem": "Cloud",
    "publisher": { "@type": "Organization", "name": "CMPSBL", "url": "https://cmpsbl.com" },
  };

  return (
    <>
      <Helmet>
        <title>What is an AI Operating System? | CMPSBL — The First AI OS</title>
        <meta name="description" content="An AI Operating System unifies memory, routing, security, and orchestration into one cognitive runtime. CMPSBL is the first governed AI OS — 40 nodes, 12 sectors, self-improving." />
        <link rel="canonical" href="https://cmpsbl.com/ai-operating-system" />
        <meta property="og:title" content="What is an AI Operating System? | CMPSBL" />
        <meta property="og:description" content="The first AI Operating System — 40-node cognitive infrastructure for persistent memory, intelligent routing, AI security, and autonomous optimization." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cmpsbl.com/ai-operating-system" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(definitionJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(softwareJsonLd)}</script>
      </Helmet>

      <PublicNav />

      <main className="min-h-screen bg-background">
        {/* Hero — Definition */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto max-w-4xl px-4 relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-block text-xs font-bold tracking-widest uppercase text-primary mb-4">Defining a New Category</span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                What is an{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  AI Operating System?
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mb-4">
                An <strong className="text-foreground">AI Operating System</strong> is a unified platform that provides all the cognitive infrastructure 
                AI agents need to operate in production — persistent memory, intelligent model routing, AI-native security, 
                real-time observability, and autonomous optimization — integrated into a single coherent runtime.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
                Just as traditional operating systems unified file management, process scheduling, and I/O for applications, 
                an AI Operating System unifies the fragmented AI infrastructure stack into one platform where every node 
                communicates, learns, and enhances the others.
              </p>

              <div className="flex flex-wrap gap-3 mt-10">
                <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <Link to="/modules">Explore All 40 Nodes <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-xl hover:border-primary/30 transition-colors">
                  <Link to="/persistent-memory">Try Persistent Memory (FREE)</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* The Problem */}
        <section className="py-12 sm:py-16 border-t border-border/50">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" /> The Fragmentation Problem
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-3xl">
              Today's AI teams cobble together separate tools for every concern — a vector database for memory, 
              an API gateway for routing, a prompt filter for security, an APM tool for monitoring, and manual processes for optimization. 
              These tools don't talk to each other. When DEFENSE detects a threat, BRAIN doesn't learn from it. 
              When NEXUS finds a cheaper model, VISION doesn't know why latency changed.
            </p>
            <p className="text-foreground font-medium leading-relaxed max-w-3xl">
              An AI Operating System eliminates this fragmentation. Every node shares context, events propagate through RIPPLE in real-time, 
              and the system self-optimizes as a unified whole through DREAM cycles.
            </p>
          </div>
        </section>

        {/* Six Pillars */}
        <section className="py-12 sm:py-16 bg-muted/30 border-t border-border/50">
          <div className="container mx-auto max-w-5xl px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center gap-2">
              <Layers className="w-6 h-6 text-primary" /> The 6 Pillars of an AI Operating System
            </h2>
            <p className="text-muted-foreground mb-10 max-w-2xl">
              Every AI Operating System must provide these six core capabilities, integrated and communicating.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pillars.map((pillar, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    to={pillar.link}
                    className="group block p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full shimmer-on-hover card-lift"
                  >
                    <pillar.icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold text-foreground mb-2">{pillar.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 40-Node Architecture */}
        <section className="py-12 sm:py-16 border-t border-border/50">
          <div className="container mx-auto max-w-5xl px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" /> 40-Node · 12-Sector Architecture
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-3xl">
              The CMPSBL Substrate organizes 40 specialized nodes across 12 sectors. Each node holds a weight in the system matrix (Σ = 1.000), 
              managed by CORE. Circuit breakers prevent cascading failures. DREAM cycles optimize autonomously.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sectors.map((sector, i) => (
                <motion.div
                  key={sector.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl border border-border/50 bg-card/50 hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-foreground">{sector.label}</h3>
                    <span className="text-[10px] font-mono text-muted-foreground">{sector.count} nodes</span>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground leading-relaxed">{sector.nodes}</p>
                </motion.div>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {[
                { value: "40", label: "Nodes" },
                { value: "12", label: "Sectors" },
                { value: "1.000", label: "Σ Weight" },
                { value: "360+", label: "Terminal Commands" },
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 rounded-xl border border-border bg-card">
                  <div className="text-2xl sm:text-3xl font-bold text-primary font-mono tabular-nums">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 bg-muted/30 border-t border-border/50">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map((item, i) => (
                <motion.details
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group p-5 rounded-xl border border-border bg-card hover:border-primary/15 transition-colors"
                >
                  <summary className="font-bold text-foreground cursor-pointer list-none flex items-center justify-between">
                    {item.question}
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{item.answer}</p>
                </motion.details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 sm:py-20 bg-gradient-to-b from-primary/5 to-transparent border-t border-border/50">
          <div className="container mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to run your AI on an operating system?</h2>
            <p className="text-muted-foreground mb-8">Start building with the world's first AI OS. Persistent memory is free for all users.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Link to="/persistent-memory">Get Started Free <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl hover:border-primary/30 transition-colors">
                <Link to="/modules">Explore All 40 Nodes</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <AuthorityLinkBlock currentPath="/ai-operating-system" />
      <EnhancedFooter />
    </>
  );
}
