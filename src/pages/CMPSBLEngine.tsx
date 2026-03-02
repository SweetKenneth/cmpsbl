/**
 * CMPSBL Engine — Landing Page
 * The substrate's highest-value single artifact. Black-boxed, sealed runtime.
 * Focuses on OUTCOMES — what it does, never how it's made.
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, Zap, Brain, Activity, Lock, Eye, BarChart3, FileCheck, ArrowRight, Check, Download, ChevronDown, Target, Cpu, RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PublicNav } from "@/components/PublicNav";
import { SEO } from "@/components/SEO";

/* ── WHAT IT DOES (outcomes, not internals) ── */
const CAPABILITIES = [
  { icon: Zap, name: "INSTANT COMPREHENSION", desc: "Understands any input — text, commands, structured data — and knows exactly what to do with it", color: "from-blue-500 to-cyan-400" },
  { icon: Brain, name: "INTELLIGENT ROUTING", desc: "Automatically selects the best AI provider for every job based on cost, speed, and past performance", color: "from-purple-500 to-pink-400" },
  { icon: Activity, name: "GUARANTEED EXECUTION", desc: "Every operation completes or rolls back cleanly — no orphaned jobs, no silent failures, no data loss", color: "from-emerald-500 to-teal-400" },
  { icon: RefreshCw, name: "SELF-HEALING", desc: "Detects failures before you do and reroutes around them automatically — zero downtime, zero intervention", color: "from-orange-500 to-amber-400" },
  { icon: Shield, name: "BUILT-IN DEFENSE", desc: "Stops abuse, isolates bad actors, and protects your infrastructure from overload — out of the box", color: "from-red-500 to-rose-400" },
  { icon: TrendingUp, name: "GETS SMARTER OVER TIME", desc: "Learns from every job it processes — routing decisions, failure patterns, cost efficiency — all improve automatically", color: "from-indigo-500 to-violet-400" },
  { icon: Eye, name: "TOTAL VISIBILITY", desc: "Real-time health grades, incident correlation, and system-wide metrics without bolting on monitoring tools", color: "from-sky-500 to-blue-400" },
  { icon: FileCheck, name: "COMPLIANCE-READY", desc: "Every action is recorded in a tamper-proof audit trail — ready for enterprise governance from day one", color: "from-slate-500 to-zinc-400" },
];

const PIPELINE_OUTCOMES = [
  { label: "Understand", desc: "Accepts any input" },
  { label: "Decide", desc: "Picks the best path" },
  { label: "Execute", desc: "Runs to completion" },
  { label: "Recover", desc: "Heals on failure" },
  { label: "Protect", desc: "Blocks threats" },
  { label: "Learn", desc: "Improves every cycle" },
  { label: "Monitor", desc: "Full observability" },
  { label: "Prove", desc: "Immutable records" },
];

const OUTCOMES = [
  "Drop one file into any TypeScript project — immediately operational",
  "No dependencies to install, no frameworks to adopt, no vendor lock-in",
  "Runs in Node, Deno, Bun, or any browser environment",
  "Multiple independent instances with zero shared state",
  "Performance improves autonomously with every job processed",
  "Every action hash-chained for enterprise-grade auditability",
  "Never crashes — degrades gracefully, reroutes, escalates",
  "Replaces 8+ separate tools with a single unified runtime",
];

const USE_CASES = [
  { title: "AI-Powered Products", desc: "Route across multiple AI providers with automatic cost optimization, failover, and quality tracking. Ship in hours, not months." },
  { title: "Mission-Critical Workflows", desc: "Every operation completes or compensates. Crash recovery is built in. Your workflows survive anything." },
  { title: "Platform Infrastructure", desc: "Rate limiting, threat defense, and circuit breaking — production-grade protection without bolting on extra services." },
  { title: "Regulated Industries", desc: "Tamper-proof audit trail and full observability satisfy compliance requirements without custom tooling." },
];

export default function CMPSBLEngine() {
  const [loading, setLoading] = useState(false);
  const [licensed, setLicensed] = useState(false);
  const [searchParams] = useSearchParams();
  const isLicensed = searchParams.get("licensed") === "true";
  const sessionId = searchParams.get("session_id");
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  useEffect(() => {
    if (isLicensed && sessionId) {
      setLicensed(true);
      // Verify session and trigger thank-you email
      supabase.functions.invoke("cmpsbl-engine-verify", {
        body: { session_id: sessionId },
      }).then(({ data, error }) => {
        if (error) {
          console.error("Verify error:", error);
          toast.success("License activated! Check your email for access details.");
        } else if (data?.success) {
          toast.success("License activated! A confirmation email with your docs access link has been sent.");
        }
      });
    }
  }, [isLicensed, sessionId]);

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
        description="One file. One import. Complete autonomous operations. The CMPSBL Engine handles routing, execution, healing, defense, learning, monitoring, and compliance in a single sealed runtime."
        keywords={["AI engine", "autonomous operations", "self-healing", "intelligent routing", "sealed runtime"]}
      />
      <div className="min-h-screen bg-background text-foreground overflow-hidden">
        <PublicNav />

        {/* ═══════════════ HERO ═══════════════ */}
        <motion.section
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative min-h-[100vh] flex items-center justify-center pt-20"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] dark:opacity-100 opacity-0" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono tracking-wider mb-8"
            >
              <Lock className="w-3 h-3" />
              SEALED RUNTIME · ANNUAL LICENSE · ZERO DEPENDENCIES
            </motion.div>

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

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              The only runtime that understands, routes, executes, heals, defends, learns, monitors, and audits — autonomously.
              <br className="hidden sm:block" />
              <span className="text-foreground/70 font-medium">One file. Complete operations.</span>
            </motion.p>

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
                    License for $999/yr
                  </span>
                )}
              </Button>
              <a href="#capabilities" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                See what it does <ChevronDown className="w-4 h-4" />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground font-mono"
            >
              <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Black-Boxed</span>
              <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> IP Protected</span>
              <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Zero Dependencies</span>
              <span className="flex items-center gap-1.5"><FileCheck className="w-3 h-3" /> Compliance-Ready</span>
            </motion.div>
          </div>
        </motion.section>

        {/* ═══════════════ PIPELINE — OUTCOMES ONLY ═══════════════ */}
        <section className="py-24 px-6 relative">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Happens When You Submit a Job</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Every workload flows through 8 stages. Every outcome feeds back in. The engine improves with every job — without you touching a thing.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {PIPELINE_OUTCOMES.map((step, i) => (
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
                  {i < PIPELINE_OUTCOMES.length - 1 && (
                    <ArrowRight className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 z-10" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ 8 CAPABILITIES ═══════════════ */}
        <section id="capabilities" className="py-24 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything It Does. One Import.</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Eight autonomous capabilities working in concert. Each one replaces an entire category of tooling.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CAPABILITIES.map((cap, i) => (
                <motion.div
                  key={cap.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group p-5 rounded-xl border border-border/50 bg-card hover:border-primary/20 transition-all hover:shadow-md"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cap.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <cap.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-sm tracking-wide mb-1">{cap.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cap.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ USE CASES ═══════════════ */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built For</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                From AI products to regulated enterprise infrastructure — one engine handles it all.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-4">
              {USE_CASES.map((uc, i) => (
                <motion.div
                  key={uc.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="p-6 rounded-xl border border-border/50 bg-card"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="w-5 h-5 text-primary shrink-0" />
                    <h3 className="font-bold text-lg">{uc.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{uc.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ CODE PREVIEW — USAGE ONLY ═══════════════ */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Three Lines to Full Operations</h2>
              <p className="text-muted-foreground">Drop it in. Call one function. Everything else is handled.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl border border-border/50 bg-card overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-accent/60" />
                <div className="w-3 h-3 rounded-full bg-primary/40" />
                <span className="ml-3 text-xs text-muted-foreground font-mono">your-app.ts</span>
              </div>
              <pre className="p-6 text-sm sm:text-base font-mono overflow-x-auto text-foreground/90">
                <code>{`import { createCMPSBLEngine } from './cmpsbl-engine';

const engine = createCMPSBLEngine({
  name: 'my-platform',
  providers: [ /* your AI providers */ ],
});

// Submit any job — the engine handles everything else
const result = await engine.submit('Analyze quarterly revenue');

// Check system health at any time
const health = engine.status();
// → { healthGrade: 'A', activeJobs: 3, uptime: '99.97%' }`}</code>
              </pre>
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ OUTCOMES ═══════════════ */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">What You Get</h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-3">
              {OUTCOMES.map((feat, i) => (
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
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Sealed Runtime. Protected IP.</h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
                You get the full power of the engine without seeing a single line of its internals.
                Delivered as a sealed, obfuscated module — ready to run, impossible to reverse.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-xs font-mono text-muted-foreground">
                <span className="px-3 py-1.5 rounded-full border border-border/50 bg-card">Source Sealed</span>
                <span className="px-3 py-1.5 rounded-full border border-border/50 bg-card">Obfuscated</span>
                <span className="px-3 py-1.5 rounded-full border border-border/50 bg-card">No Clone</span>
                <span className="px-3 py-1.5 rounded-full border border-border/50 bg-card">Tamper-Proof</span>
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
                License the Engine.
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                One file. One import. Complete autonomous operations. Licensed annually.
              </p>
              <div className="flex flex-col items-center gap-4">
                <Button
                  size="lg"
                  onClick={handleCheckout}
                  disabled={loading || licensed}
                  className="h-16 px-10 text-xl font-bold rounded-2xl bg-foreground text-background hover:bg-foreground/90 transition-all shadow-xl hover:shadow-2xl"
                >
                  {licensed ? (
                    <span className="flex items-center gap-3">
                      <Check className="w-6 h-6" />
                      Licensed — You're In
                    </span>
                  ) : loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      Processing…
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <Download className="w-6 h-6" />
                      $999/yr · Sealed Runtime License
                    </span>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Annual license. Full capabilities. Instant access. No account required to start.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

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
