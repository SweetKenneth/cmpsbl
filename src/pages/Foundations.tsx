/**
 * Foundations — The three-standard reference surface for the CMPSBL Substrate
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Layers, Shield, Brain, Zap, Eye, Globe, Network,
  Cpu, Terminal, Code, Lock, Users, DollarSign,
  ScrollText, Landmark, Radio, ArrowRight, Fingerprint,
  BookOpen, ExternalLink
} from "lucide-react";

const SECTORS = [
  { name: "SPINE", modules: ["CORE", "GOVERNANCE", "AUDIT"], desc: "Boot authority, policy enforcement, immutable logging", icon: Cpu },
  { name: "CCR", modules: ["CORTEX", "CONTEXT", "REFLEX"], desc: "Orchestration, context management, fast-path routing", icon: Brain },
  { name: "OCG", modules: ["NEXUS", "DECODE", "ENCODE"], desc: "AI routing, intent parsing, code generation", icon: Zap },
  { name: "EXECUTION", modules: ["SANDBOX", "RUNTIME", "DEPLOY"], desc: "Isolated execution, persistent runtime, deployment", icon: Terminal },
  { name: "FIELDS", modules: ["DEFENSE", "IMMUNITY", "EVOLUTION"], desc: "Security perimeter, adaptive resilience, self-improvement", icon: Shield },
  { name: "PLANE", modules: ["INTENT", "SHADOW", "ATLAS"], desc: "Goal decomposition, shadow runs, capability mapping", icon: Network },
  { name: "SHELL", modules: ["VISION", "INCLUSIVE", "INTEGRATION"], desc: "Observability, accessibility, external connectors", icon: Eye },
  { name: "ESZ", modules: ["ECONOMY", "SIGNAL", "ZERO"], desc: "Cost tracking, event propagation, zero-trust validation", icon: DollarSign },
  { name: "EPZ", modules: ["ENGINEER", "INTEL", "BRAIN"], desc: "Autonomous foundry, intelligence gathering, cognitive processing", icon: Code },
  { name: "EMZ", modules: ["MEMORY", "DREAM", "PERSIST"], desc: "Tiered memory, DREAM Engine synthesis, durable persistence", icon: Fingerprint },
  { name: "CSZ", modules: ["SCANNER", "EXPORT", "BLOG"], desc: "Vulnerability scanning, format adaptation, autonomous publishing", icon: Radio },
  { name: "NERVE", modules: ["NERVE", "MEDIC"], desc: "Health monitoring, self-healing diagnostics", icon: Landmark },
];

const PRINCIPLES = [
  { title: "Persistent Runtime", desc: "The substrate maintains continuous state across sessions. No cold starts, no context amnesia.", icon: Cpu },
  { title: "Governed Autonomy", desc: "Every mutating action passes through GOVERNANCE. Autonomy exists within deterministic policy boundaries.", icon: ScrollText },
  { title: "Immutable Audit", desc: "AUDIT records cannot be deleted, modified, or suppressed. Chain-of-custody checksums on every entry.", icon: Lock },
  { title: "Sealed Agents", desc: "Cognitive agents operate in isolated, source-blocked runtimes. No escape from designated capabilities.", icon: Shield },
  { title: "Validated Evolution", desc: "Changes reach production only after passing the 7-gate SEBA process with TSAC truth arbitration.", icon: Zap },
  { title: "Continuous Learning", desc: "CLM runs 14,400 learning cycles per day. Knowledge compounds — the system accelerates over time.", icon: Brain },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

export default function Foundations() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Foundations — Architecture & Standards | CMPSBL®"
        description="CMPSBL's foundational reference: 40-primitive architecture, agents/engines/layers/organs taxonomy, governed autonomy model, Memory Stream crystallization protocol, AIGVRN namespace, and LLMS.txt machine context."
        keywords={['CMPSBL foundations', 'architecture reference', 'AIGVRN standard', 'governed autonomy', 'substrate topology']}
        breadcrumbs={[
          { name: 'Home', url: 'https://cmpsbl.com' },
          { name: 'Foundations', url: 'https://cmpsbl.com/foundations' },
        ]}
      />

      <PublicNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-28 px-4">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.06),transparent_60%)]" />
          <div className="container mx-auto max-w-4xl text-center relative">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Layers className="w-4 h-4 text-primary" />
                <span className="text-sm font-mono text-primary">40 Primitives · 4 Categories · 3 Standards</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-[0.95]">
                Foundations
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                The architectural bedrock of the CMPSBL Substrate — a layered, governed, self-improving
                cognitive infrastructure designed for production autonomy.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline" className="font-mono">IRONCLAD Epoch</Badge>
                <Badge variant="outline" className="font-mono">SEBA Validated</Badge>
                <Badge variant="outline" className="font-mono">CLM Active</Badge>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto max-w-6xl px-4">
          {/* Core Principles */}
          <section className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Core Principles</h2>
            <p className="text-muted-foreground mb-8">Six invariants that define what the substrate is — and what it refuses to become.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRINCIPLES.map((p, i) => (
                <motion.div
                  key={p.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="p-5 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 bg-card card-lift shimmer-on-hover"
                >
                  <p.icon className="w-5 h-5 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <Separator className="mb-20" />

          {/* Primitive Taxonomy */}
          <section className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Primitive Taxonomy</h2>
            <p className="text-muted-foreground mb-8">
              40 primitives organized into 4 functional categories: Agents, Engines, Layers, and Organs. Each category is a self-contained responsibility boundary.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SECTORS.map((sector, i) => (
                <motion.div
                  key={sector.name}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="group p-5 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 bg-card card-lift"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <sector.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-mono font-bold text-sm">{sector.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {sector.modules.map((m) => (
                      <span key={m} className="px-2 py-0.5 text-xs font-mono rounded bg-muted text-muted-foreground">
                        {m}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{sector.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <Separator className="mb-20" />

          {/* Three-Standard Stack */}
          <section className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Three-Standard Stack</h2>
            <p className="text-muted-foreground mb-8">
              Three interconnected standards form the substrate's public surface — architecture, governance, and machine context.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-6 rounded-xl bg-primary/5 border-2 border-primary/20 shimmer-on-hover">
                <Layers className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-bold mb-2">Substrate Standard</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The architectural specification — 40 primitives, 4 categories, layered execution, mesh overlays, and synergy memories.
                </p>
                <Link to="/ai-operating-system" className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                  Explore Platform <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <Link to="/namespace" className="p-6 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 bg-card group card-lift">
                <Globe className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors mb-3" />
                <h3 className="font-bold mb-2">Governance Standard</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  AI Governance Reference Namespace — 12 semantic surfaces for policy interoperability and compliance.
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                  View Namespace <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
              <Link to="/llms-txt" className="p-6 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 bg-card group card-lift">
                <Terminal className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors mb-3" />
                <h3 className="font-bold mb-2">Machine Context</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  LLMS.txt — the machine-readable context format that lets AI systems understand the substrate natively.
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                  View LLMS.txt <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </section>

          <Separator className="mb-20" />

          {/* Archival Records */}
          <section className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Archival Records</h2>
            <p className="text-muted-foreground mb-8">
              Permanent records deposited with independent research archives for citation and verification.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { name: "OSF", desc: "Open Science Framework", href: "https://osf.io/ah7nx/overview" },
                { name: "Zenodo", desc: "CERN Research Archive", href: "https://zenodo.org/records/18379258" },
                { name: "ORCID", desc: "Author Identity", href: "https://orcid.org/0009-0001-4237-1243" },
              ].map((archive) => (
                <a
                  key={archive.name}
                  href={archive.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 bg-card group card-lift"
                >
                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  <div>
                    <p className="font-semibold">{archive.name}</p>
                    <p className="text-xs text-muted-foreground">{archive.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* Author */}
          <div className="mb-16 py-8 border-t border-border/30 text-center">
            <p className="text-sm text-muted-foreground">
              CMPSBL Substrate by{" "}
              <a
                href="https://orcid.org/0009-0001-4237-1243"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Kenneth E. Sweet Jr.
              </a>
              {" "}· CMPSBL® · 2026
            </p>
          </div>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
