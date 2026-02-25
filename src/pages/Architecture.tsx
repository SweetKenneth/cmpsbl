/**
 * Architecture — Public SEO page for CMPSBL layered cognitive kernel
 * /architecture — linked from footer "Connect" section
 */

import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { Layers, Cpu, Shield, Brain, Zap, Eye, Moon, ArrowRight, Network, Settings, Plug, Accessibility, Code2, Wand2, Target, Scale, HeartPulse, Dna, Radio, Key, Fingerprint, Send, FileCheck, Coins, FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const KERNEL = { name: "CORE", icon: Cpu, desc: "Standalone boot authority — initializes all layers, maintains canonical registry" };

const MODULES = [
  { name: "DECODE", icon: Brain, desc: "Natural language interpreter — prompt parsing, intent extraction" },
  { name: "ENCODE", icon: Code2, desc: "Code generation pipeline — fix generation, rule absorption" },
  { name: "VISION", icon: Eye, desc: "Unified observability — health aggregation, metric visualization" },
  { name: "CORTEX", icon: Wand2, desc: "Orchestrator — multi-surface coordination, task routing" },
  { name: "NEXUS", icon: Zap, desc: "AI routing gateway — provider abstraction, model selection" },
  { name: "ECONOMY", icon: Coins, desc: "Value & cost tracking — ROI calculation, usage metering" },
  { name: "SANDBOX", icon: FlaskConical, desc: "Isolated execution — safe experimentation, staged deployments" },
  { name: "INCLUSIVE", icon: Accessibility, desc: "Accessibility engine — WCAG scanning, compliance reporting" },
  { name: "INTEGRATION", icon: Plug, desc: "Dependency resolver — cross-surface binding, boots last" },
];

const MESHES = [
  { name: "DEFENSE", icon: Shield, desc: "Outermost — AI-powered security, threat analysis", position: "Outermost" },
  { name: "IMMUNITY", icon: HeartPulse, desc: "Adaptive resilience, self-healing patterns", position: "Outer" },
  { name: "EVOLUTION", icon: Dna, desc: "Self-improvement — mutation proposals, shadow A/B", position: "Middle" },
  { name: "INTENT", icon: Target, desc: "Cross-module intent routing, goal decomposition", position: "Inner" },
  { name: "GOVERNANCE", icon: Scale, desc: "Ethical constraints, veto authority, coherence", position: "Innermost" },
];

const CCR_ZONES = [
  { name: "SYSTEM", icon: Settings, desc: "Lifecycle management, diagnostics" },
  { name: "BRAIN", icon: Brain, desc: "Reasoning engine, reflection cycles" },
  { name: "MEMORY", icon: Brain, desc: "Persistent tiered storage, recall" },
  { name: "DREAM", icon: Moon, desc: "Synthesis, creative combination" },
];

const CCL_ZONES = [
  { name: "RIPPLE", icon: Radio, desc: "Signal/event bus, inter-zone communication" },
  { name: "ACCESS", icon: Key, desc: "API entitlements, rate limiting" },
  { name: "IDENTITY", icon: Fingerprint, desc: "Session management, role resolution" },
  { name: "RELAY", icon: Send, desc: "Webhook dispatch, external integrations" },
  { name: "AUDIT", icon: FileCheck, desc: "Integrity ledger, compliance logging" },
];

export default function Architecture() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Cognitive Kernel Architecture | CMPSBL"
        description="Layered cognitive kernel: CORE boot authority, execution surface modules, protective mesh overlays, and convergence zones. Hot-swappable, autonomously evolving."
        image="https://cmpsbl.com/og/architecture.jpg"
        keywords={['cognitive kernel architecture', 'AI substrate layers', 'mesh overlays', 'composable AI architecture', 'modular AI kernel']}
        breadcrumbs={[
          { name: 'Home', url: 'https://cmpsbl.com' },
          { name: 'Architecture', url: 'https://cmpsbl.com/architecture' },
        ]}
        faq={[
          { question: 'What is a cognitive kernel?', answer: 'A cognitive kernel is the boot authority that initializes all substrate layers, maintains the canonical module registry, and orchestrates lifecycle events across execution surfaces.' },
          { question: 'How many execution surfaces does CMPSBL have?', answer: 'CMPSBL has 24 execution surfaces: 10 public entities, 5 mesh overlays, and 9 convergence zones — all orchestrated by the CORE kernel.' },
          { question: 'What are mesh overlays?', answer: 'Mesh overlays are protective layers that wrap all modules: DEFENSE (outermost), IMMUNITY, EVOLUTION, INTENT, and GOVERNANCE (innermost). They provide security, resilience, and governed evolution.' },
        ]}
      />

      <PublicNav />

      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto max-w-5xl px-4 relative">
            <motion.div {...fadeUp} className="max-w-3xl">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                <Layers className="w-3 h-3 mr-2" />
                SPARTA Epoch
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Layered Cognitive Kernel
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                CMPSBL operates as a layered cognitive kernel — a production-ready AI operating system 
                that persists, heals, and evolves autonomously without human intervention.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Boot Sequence */}
        <section className="border-y border-border bg-muted/30">
          <div className="container mx-auto max-w-5xl px-4 py-16">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl font-bold mb-6">Boot Sequence</h2>
              <Card className="bg-card">
                <CardContent className="p-6">
                  <pre className="text-sm font-mono text-muted-foreground leading-relaxed overflow-x-auto">{`CORE (Standalone Kernel)
  → CCR (Layer 0): SYSTEM + BRAIN + MEMORY + DREAM
  → CCL (Layer 1): RIPPLE + ACCESS + IDENTITY + RELAY + AUDIT
  → Modules: DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE
  → INTEGRATION (boots last — dependency resolver)
  ← Mesh Overlays wrap all layers: DEFENSE (outermost) → GOVERNANCE (innermost)`}</pre>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* CORE Kernel */}
        <section className="container mx-auto max-w-5xl px-4 py-16">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-bold mb-8">CORE Kernel</h2>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <KERNEL.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{KERNEL.name}</h3>
                  <p className="text-muted-foreground">{KERNEL.desc}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Execution Surface Modules */}
        <section className="border-t border-border bg-muted/20">
          <div className="container mx-auto max-w-5xl px-4 py-16">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl font-bold mb-2">Execution Surface Modules</h2>
              <p className="text-muted-foreground mb-8">Public-facing cognitive capabilities that boot after CORE and convergence layers are online.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {MODULES.map((mod) => (
                  <Card key={mod.name} className="hover:border-primary/30 transition-colors">
                    <CardContent className="p-5 flex items-start gap-3">
                      <mod.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold font-mono text-sm">{mod.name}</span>
                        <p className="text-xs text-muted-foreground mt-1">{mod.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Mesh Overlays */}
        <section className="border-t border-border">
          <div className="container mx-auto max-w-5xl px-4 py-16">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl font-bold mb-2">Mesh Overlays</h2>
              <p className="text-muted-foreground mb-8">Protective behavioral layers that wrap all modules, ordered outermost to innermost.</p>
              <div className="space-y-3">
                {MESHES.map((mesh, i) => (
                  <Card key={mesh.name} className="hover:border-primary/30 transition-colors">
                    <CardContent className="p-5 flex items-center gap-4">
                      <Badge variant="outline" className="shrink-0 w-24 justify-center text-xs">{mesh.position}</Badge>
                      <mesh.icon className="w-5 h-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold font-mono text-sm">{mesh.name}</span>
                        <p className="text-xs text-muted-foreground">{mesh.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Hidden Convergence Zones */}
        <section className="border-t border-border bg-muted/20">
          <div className="container mx-auto max-w-5xl px-4 py-16">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl font-bold mb-2">Hidden Convergence Zones</h2>
              <p className="text-muted-foreground mb-8">Internal infrastructure zones invisible in the public entity registry but fully monitored.</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-sm text-primary tracking-wider uppercase mb-3">CCR — Layer 0 (Cognitive Reality)</h3>
                  <div className="space-y-2">
                    {CCR_ZONES.map((z) => (
                      <div key={z.name} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                        <span className="font-mono text-xs font-bold w-16">{z.name}</span>
                        <span className="text-xs text-muted-foreground">{z.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-primary tracking-wider uppercase mb-3">CCL — Layer 1 (Cognitive Lucidity)</h3>
                  <div className="space-y-2">
                    {CCL_ZONES.map((z) => (
                      <div key={z.name} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                        <span className="font-mono text-xs font-bold w-16">{z.name}</span>
                        <span className="text-xs text-muted-foreground">{z.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Key Properties */}
        <section className="border-t border-border">
          <div className="container mx-auto max-w-5xl px-4 py-16">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl font-bold mb-8">Key Properties</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "Hot-Swappable Zones", desc: "CCR/CCL zones can be independently cycled without system restart" },
                  { title: "Circuit Breaker Isolation", desc: "Every zone has independent failure tracking — degradation never cascades" },
                  { title: "Autonomous Evolution", desc: "The EVOLUTION overlay continuously improves system behavior" },
                  { title: "Shadow Training", desc: "Executors practice on real system gaps in shadow mode before production" },
                ].map((prop) => (
                  <Card key={prop.title}>
                    <CardContent className="p-5">
                      <h3 className="font-semibold mb-1">{prop.title}</h3>
                      <p className="text-sm text-muted-foreground">{prop.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-muted/30">
          <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Explore the Substrate</h2>
            <p className="text-muted-foreground mb-8">
              Dive deeper into the modules, documentation, and live infrastructure.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/modules">
                <Button className="gap-2">
                  All Modules <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/documentation">
                <Button variant="outline">Documentation</Button>
              </Link>
              <Link to="/substrate">
                <Button variant="outline">Live Dashboard</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <EnhancedFooter />
    </div>
  );
}
