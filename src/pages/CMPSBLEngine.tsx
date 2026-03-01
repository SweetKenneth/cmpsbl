/**
 * CMPSBL Engine — Landing Page
 * The substrate's highest-value single artifact. Black-boxed, sealed runtime.
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, Zap, Brain, Activity, Lock, Eye, BarChart3, FileCheck, ArrowRight, Check, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PublicNav } from "@/components/PublicNav";
import { SEO } from "@/components/SEO";

const ENGINES = [
  { icon: Zap, name: "TASK PROCESSOR", desc: "Universal input parsing → structured intent extraction", color: "from-blue-500 to-cyan-400" },
  { icon: Brain, name: "AI OPS PLATFORM", desc: "Multi-provider routing with learned cost controls", color: "from-purple-500 to-pink-400" },
  { icon: Activity, name: "WORKFLOW ENGINE", desc: "Durable saga execution with compensation rollback", color: "from-emerald-500 to-teal-400" },
  { icon: Shield, name: "SELF-HEALING MESH", desc: "Auto-detect, diagnose, reroute on failure", color: "from-orange-500 to-amber-400" },
  { icon: Lock, name: "THREAT DEFENSE", desc: "Rate limiting, circuit breaking, client blocking", color: "from-red-500 to-rose-400" },
  { icon: Eye, name: "KNOWLEDGE ENGINE", desc: "Self-improving provider selection from outcomes", color: "from-indigo-500 to-violet-400" },
  { icon: BarChart3, name: "OBSERVABILITY", desc: "Incident correlation, health grading, metrics", color: "from-sky-500 to-blue-400" },
  { icon: FileCheck, name: "COMPLIANCE CORE", desc: "Tamper-evident hash-chained audit trail", color: "from-slate-500 to-zinc-400" },
];

const PIPELINE_STEPS = [
  { label: "Parse", desc: "Intent extraction" },
  { label: "Route", desc: "Learned best provider" },
  { label: "Execute", desc: "Saga + WAL" },
  { label: "Heal", desc: "Auto-reroute" },
  { label: "Defend", desc: "Rate limit + circuit" },
  { label: "Learn", desc: "Outcome analysis" },
  { label: "Observe", desc: "Incident correlation" },
  { label: "Audit", desc: "Immutable chain" },
];

const FEATURES = [
  "Zero dependencies — no npm packages, no framework lock-in",
  "Pure TypeScript — works in Node, Deno, Bun, browsers",
  "Factory pattern — createCMPSBLEngine() returns self-contained instance",
  "No global state — multiple instances run independently",
  "Self-improving — gets smarter with every job processed",
  "Tamper-evident — every action hash-chained for compliance",
  "Graceful degradation — never crashes; degrades, reroutes, escalates",
  "4 autonomous feedback loops — learning, healing, circuit, incident",
];

export default function CMPSBLEngine() {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const purchased = searchParams.get("purchased") === "true";
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  useEffect(() => {
    if (purchased) {
      toast.success("Purchase complete. Your sealed runtime will be delivered to your email.");
    }
  }, [purchased]);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("cmpsbl-engine-checkout");
      if (error) throw error;
      if (data?.url) {
        window.location.assign(data.url);
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="CMPSBL Engine — Autonomous Intelligent Operations"
        description="The substrate's highest-value single artifact. 8 meta-engines fused into one zero-dependency sealed runtime. Parse, route, execute, heal, defend, learn, observe, audit."
        keywords={["AI engine", "autonomous operations", "self-healing", "intelligent routing", "substrate", "sealed runtime"]}
      />
      <div className="min-h-screen bg-background text-foreground overflow-hidden">
        <PublicNav />

        {/* ═══════════════ HERO ═══════════════ */}
        <motion.section
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative min-h-[100vh] flex items-center justify-center pt-20"
        >
          {/* Background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] dark:opacity-100 opacity-0" />
          
          {/* Radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono tracking-wider mb-8"
            >
              <Lock className="w-3 h-3" />
              SEALED RUNTIME · BLACK-BOXED · ZERO DEPENDENCIES
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[0.9] mb-6"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
                CMPSBL
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                ENGINE
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              8 meta-engines fused into one autonomous runtime.
              <br className="hidden sm:block" />
              One import. Complete intelligent operations.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                onClick={handleCheckout}
                disabled={loading}
                className="h-14 px-8 text-lg font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    Opening checkout…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Acquire for $999
                  </span>
                )}
              </Button>
              <a href="#architecture" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                Explore architecture <ChevronDown className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground font-mono"
            >
              <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Black-Boxed</span>
              <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> IP Protected</span>
              <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Zero Dependencies</span>
              <span className="flex items-center gap-1.5"><FileCheck className="w-3 h-3" /> Tamper-Evident</span>
            </motion.div>
          </div>
        </motion.section>

        {/* ═══════════════ PIPELINE ═══════════════ */}
        <section className="py-24 px-6 relative">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">The Closed-Loop Pipeline</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Every workload flows through 8 stages. Every output feeds back in. The engine gets smarter with every job.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {PIPELINE_STEPS.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="relative group"
                >
                  <div className="p-4 sm:p-5 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-all">
                    <div className="text-xs font-mono text-muted-foreground mb-1">0{i + 1}</div>
                    <div className="font-bold text-sm sm:text-base">{step.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{step.desc}</div>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <ArrowRight className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 z-10" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ 8 ENGINES ═══════════════ */}
        <section id="architecture" className="py-24 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">8 Meta-Engines. One Import.</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Each engine is a production-grade system on its own. Together, they form an autonomous operations platform.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ENGINES.map((engine, i) => (
                <motion.div
                  key={engine.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group p-5 rounded-xl border border-border/50 bg-card hover:border-primary/20 transition-all hover:shadow-md"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${engine.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <engine.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-sm tracking-wide mb-1">{engine.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{engine.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ CODE PREVIEW ═══════════════ */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Drop In. Immediately Operational.</h2>
              <p className="text-muted-foreground">Three lines to autonomous intelligent operations.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl border border-border/50 bg-card overflow-hidden"
            >
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-accent/60" />
                <div className="w-3 h-3 rounded-full bg-primary/40" />
                <span className="ml-3 text-xs text-muted-foreground font-mono">main.ts</span>
              </div>
              <pre className="p-6 text-sm sm:text-base font-mono overflow-x-auto text-foreground/90">
                <code>{`import { createCMPSBLEngine } from './cmpsbl-engine';

const engine = createCMPSBLEngine({
  name: 'my-platform',
  budgetCentsPerHour: 500,
  providers: [
    {
      id: 'primary',
      name: 'Primary Model',
      costPerCall: 0.5,
      capabilities: ['query', 'generation'],
      execute: async (input) => myAI(input),
    },
  ],
});

// One call. Full pipeline.
const job = await engine.submit('Analyze quarterly trends');

// Self-improving health
console.log(engine.status());
// → { healthGrade: 'A', threatLevel: 'none', ... }`}</code>
              </pre>
              {/* Blur overlay — black box */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ FEATURES ═══════════════ */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Design Principles</h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-3">
              {FEATURES.map((feat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-4 rounded-lg border border-border/30 bg-card"
                >
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground/80">{feat}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ ARCHITECTURE DIAGRAM ═══════════════ */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Internal Architecture</h2>
              <p className="text-muted-foreground">10 layers. 4 autonomous feedback loops. 1 sealed file.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8 font-mono text-xs sm:text-sm overflow-x-auto"
            >
              <pre className="text-muted-foreground whitespace-pre leading-relaxed">{`┌─────────────────────────────────────────────────┐
│                  Rate Limiter                    │  ← DEFENSE
│         RPM/RPH sliding window + client blocks   │
├─────────────────────────────────────────────────┤
│                 Intent Parser                    │  ← DECODE
│        Type · Entities · Complexity · Keywords   │
├─────────────────────────────────────────────────┤
│              Intelligent Router                  │  ← NEXUS + KNOWLEDGE
│   Learned affinity → Health score → Cost score   │
├─────────────────────────────────────────────────┤
│              Saga Executor + WAL                 │  ← MEMORY + BRAIK
│     Steps · Compensation · Crash recovery        │
├─────────────────────────────────────────────────┤
│           Circuit Breaker (per provider)          │  ← IMMUNITY
│      Closed → Open → Half-Open + exp backoff     │
├─────────────────────────────────────────────────┤
│              Self-Healing Engine                  │  ← IMMUNITY
│       Reroute · Degrade · Isolate · Escalate     │
├─────────────────────────────────────────────────┤
│            Knowledge + Learning                   │  ← VISION
│   EMA confidence · Intent-provider affinity map   │
├─────────────────────────────────────────────────┤
│           Incident Correlator                     │  ← VISION
│      Source · Severity · Temporal correlation     │
├─────────────────────────────────────────────────┤
│            Tamper-Evident Audit                   │  ← AUDIT
│        Hash chain · Actor · Resource · Details    │
├─────────────────────────────────────────────────┤
│              Budget Guardian                      │  ← NEXUS
│       Hourly ceiling · Burn rate tracking         │
└─────────────────────────────────────────────────┘`}</pre>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ BLACK BOX SECTION ═══════════════ */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 rounded-2xl bg-foreground/10 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-foreground/60" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Black-Boxed. IP Protected.</h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
                Delivered as a sealed runtime. Source visibility disabled. No cloning. No memory leakage.
                Tamper-evident audit trail ensures compliance without exposing orchestration logic.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-xs font-mono text-muted-foreground">
                <span className="px-3 py-1.5 rounded-full border border-border/50 bg-card">Source Sealed</span>
                <span className="px-3 py-1.5 rounded-full border border-border/50 bg-card">No Export</span>
                <span className="px-3 py-1.5 rounded-full border border-border/50 bg-card">No Clone</span>
                <span className="px-3 py-1.5 rounded-full border border-border/50 bg-card">Hash-Chained Audit</span>
                <span className="px-3 py-1.5 rounded-full border border-border/50 bg-card">IP Gatekept</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ FINAL CTA ═══════════════ */}
        <section className="py-32 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">
                Acquire the Engine.
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                One file. One import. Complete autonomous operations.
              </p>
              <div className="flex flex-col items-center gap-4">
                <Button
                  size="lg"
                  onClick={handleCheckout}
                  disabled={loading}
                  className="h-16 px-10 text-xl font-bold rounded-2xl bg-foreground text-background hover:bg-foreground/90 transition-all shadow-xl hover:shadow-2xl"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      Processing…
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <Download className="w-6 h-6" />
                      $999 · Sealed Runtime
                    </span>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  One-time purchase. Includes all 8 meta-engines. No recurring fees.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/30 py-8 px-6">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} CMPSBL® — All rights reserved.</span>
            <div className="flex items-center gap-4">
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
              <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
