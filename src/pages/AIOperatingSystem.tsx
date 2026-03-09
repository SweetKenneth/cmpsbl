/**
 * AI Operating System — Definitional glossary/landing page
 * SEO: /ai-operating-system — owns the "AI Operating System" keyword
 */

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Shield, Network, Moon, Workflow, Cpu, Layers, Zap, Target, Gamepad2 } from "lucide-react";
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
    answer: "AI frameworks like LangChain or CrewAI solve individual problems — chaining prompts, managing agents, or structuring outputs. An AI Operating System integrates all of these concerns (memory, routing, security, monitoring, optimization) into a single platform where modules communicate and enhance each other. The whole is greater than the sum of its parts."
  },
  {
    question: "What problems does CMPSBL's AI Operating System solve?",
    answer: "CMPSBL solves the fragmentation problem in AI infrastructure. Instead of stitching together separate tools for memory (vector DBs), routing (API gateways), security (prompt filters), and monitoring (observability platforms), CMPSBL provides all 14 subsystems as integrated modules that share context, learn from each other, and self-optimize."
  },
  {
    question: "Who needs an AI Operating System?",
    answer: "Any organization running AI in production — especially those managing multiple models, needing persistent agent memory, requiring AI-specific security (prompt injection defense), or wanting their AI systems to autonomously improve. Enterprise AI teams, AI-native startups, and agencies building AI products all benefit."
  },
  {
    question: "Can CMPSBL work with existing AI models and providers?",
    answer: "Yes. CMPSBL is model-agnostic and provider-agnostic. The NEXUS module intelligently routes to OpenAI, Google Gemini, Anthropic Claude, or local models based on task requirements. Bring your own keys (BYOK) and your existing AI stack — CMPSBL orchestrates everything underneath."
  },
  {
    question: "What is CMPSBL's architecture?",
    answer: "The substrate consists of 10 entities (CORE kernel + 8 modules + INTEGRATION), wrapped by 5 mesh overlays (DEFENSE outermost → IMMUNITY → EVOLUTION → INTENT → GOVERNANCE innermost), with 9 hot-swappable zones across CCR (SYSTEM, BRAIN, MEMORY, DREAM) and CCL (RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT)."
  },
];

const pillars = [
  { icon: Brain, title: "Persistent Memory", description: "3-tier memory architecture (hot/warm/cold) that gives AI agents long-term learning and contextual recall across sessions.", link: "/modules/brain" },
  { icon: Network, title: "Intelligent Routing", description: "Multi-provider model routing that automatically selects the optimal AI model based on task complexity, cost, and latency.", link: "/modules/nexus" },
  { icon: Shield, title: "AI-Native Security", description: "Purpose-built threat detection for AI systems — prompt injection defense, adversarial filtering, and automated incident response.", link: "/modules/defense" },
  { icon: Moon, title: "Autonomous Optimization", description: "Off-peak self-improvement cycles that analyze patterns, consolidate memory, and tune performance — your AI gets smarter overnight.", link: "/modules/dream" },
  { icon: Workflow, title: "Meta-Orchestration", description: "Cross-module orchestration coordinates execution surfaces as a unified intelligence, discovering emergent capabilities no single module possesses.", link: "/modules/cortex" },
  { icon: Cpu, title: "Self-Healing Runtime", description: "Dependency-ordered boot, health monitoring, auto-recovery, and zero-downtime hot reload — production-grade reliability built in.", link: "/modules/core" },
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
    "description": "The world's first AI Operating System — 14 integrated modules providing persistent memory, intelligent routing, AI security, autonomous optimization, and meta-orchestration for production AI systems.",
    "url": "https://cmpsbl.com/ai-operating-system",
    "applicationCategory": "AI Operating System",
    "operatingSystem": "Cloud",
    "publisher": { "@type": "Organization", "name": "CMPSBL", "url": "https://cmpsbl.com" },
  };

  return (
    <>
      <Helmet>
        <title>What is an AI Operating System? | CMPSBL — The First AI OS</title>
        <meta name="description" content="An AI Operating System unifies memory, routing, security, and orchestration into one cognitive runtime. CMPSBL is the first governed AI OS — modular, persistent, and self-improving." />
        <link rel="canonical" href="https://cmpsbl.com/ai-operating-system" />
        <meta property="og:title" content="What is an AI Operating System? | CMPSBL" />
        <meta property="og:description" content="The first AI Operating System — modular cognitive infrastructure for persistent memory, intelligent routing, AI security, and autonomous optimization." />
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
                an AI Operating System unifies the fragmented AI infrastructure stack into one platform where every subsystem 
                communicates, learns, and enhances the others.
              </p>

              <div className="flex flex-wrap gap-3 mt-10">
                <Button asChild size="lg" className="rounded-xl">
                  <Link to="/modules">Explore All 40 Nodes <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-xl">
                  <Link to="/developers">Get Started Free</Link>
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
              These tools don't talk to each other. When your security module detects a threat, your memory module doesn't learn from it. 
              When your routing module finds a cheaper model, your monitoring module doesn't know why latency changed.
            </p>
            <p className="text-foreground font-medium leading-relaxed max-w-3xl">
              An AI Operating System eliminates this fragmentation. Every module shares context, events propagate in real-time, 
              and the system self-optimizes as a unified whole.
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
                    className="group block p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full"
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

        {/* CMPSBL as the Reference Implementation */}
        <section className="py-12 sm:py-16 border-t border-border/50">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" /> CMPSBL: The First AI Operating System
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-3xl">
              The CMPSBL Substrate is the reference implementation of the Cognitive Reality category. 
              With <strong className="text-foreground">10 integrated entities</strong> organized across <strong className="text-foreground">6 architectural layers</strong>, 
              it provides the complete cognitive runtime for production AI — from the kernel event bus to meta-orchestration with 100 crystallized Crown Jewel pipelines.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {[
                { value: "10", label: "Entities" },
                { value: "6", label: "Architectural Layers" },
                { value: "24", label: "Modules" },
                { value: "360+", label: "Terminal Commands" },
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 rounded-xl border border-border bg-card">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
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
                  className="group p-5 rounded-xl border border-border bg-card"
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
            <p className="text-muted-foreground mb-8">Start building with the world's first AI OS. Free to explore.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" className="rounded-xl">
                <Link to="/start-here">Get Started Free <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl">
                <Link to="/modules">Explore All 40 Nodes</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl">
                <Link to="/gaming">Gaming AI <Gamepad2 className="w-4 h-4 ml-2" /></Link>
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
