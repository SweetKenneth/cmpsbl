/**
 * Investor Showcase — PIN-gated entry to tiered demo experience
 * Phase 0: Access shell, 30-second WOW, orientation, demo grid
 * Phase 1.1: Memory Stream demo
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Zap, Brain, ArrowRight, Sparkles, Shield, Eye, ChevronDown, Activity, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WowDemo } from "@/components/investor/WowDemo";
import { MemoryStreamDemo } from "@/components/investor/MemoryStreamDemo";

const SHOWCASE_PIN = "2026";

// ─── PIN Gate ────────────────────────────────────────────────
const PinGate = ({ onSuccess }: { onSuccess: () => void }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = () => {
    if (pin === SHOWCASE_PIN) {
      onSuccess();
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => { setError(false); setPin(""); }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-sm space-y-6 text-center ${shaking ? "animate-shake" : ""}`}
      >
        <div className="space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">CMPSBL® Investor Preview</h1>
          <p className="text-sm text-muted-foreground">Enter access code to continue</p>
        </div>

        <div className="flex gap-2 justify-center">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-12 h-14 rounded-lg border-2 flex items-center justify-center text-xl font-mono font-bold transition-colors ${
                error
                  ? "border-destructive text-destructive"
                  : pin[i]
                  ? "border-primary text-foreground"
                  : "border-border text-muted-foreground/30"
              }`}
            >
              {pin[i] ? "•" : ""}
            </div>
          ))}
        </div>

        <input
          type="tel"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          onKeyDown={(e) => e.key === "Enter" && pin.length === 4 && handleSubmit()}
          className="sr-only"
          autoFocus
        />

        <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "←"].map((key, i) => (
            <button
              key={i}
              className={`h-12 rounded-lg text-lg font-medium transition-colors ${
                key === null
                  ? "invisible"
                  : "bg-muted hover:bg-accent text-foreground active:scale-95"
              }`}
              onClick={() => {
                if (key === "←") setPin((p) => p.slice(0, -1));
                else if (key !== null && pin.length < 4) {
                  const next = pin + key;
                  setPin(next);
                  if (next.length === 4) setTimeout(() => {
                    if (next === SHOWCASE_PIN) onSuccess();
                    else {
                      setError(true);
                      setShaking(true);
                      setTimeout(() => setShaking(false), 500);
                      setTimeout(() => { setError(false); setPin(""); }, 1500);
                    }
                  }, 150);
                }
              }}
            >
              {key ?? ""}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-destructive animate-fade-in">Invalid code</p>
        )}
      </motion.div>
    </div>
  );
};

// ─── Tier Badge ──────────────────────────────────────────────
const TierBadge = ({ tier }: { tier: 1 | 2 | 3 }) => {
  const styles = {
    1: "bg-primary/10 text-primary border-primary/20",
    2: "bg-accent/10 text-accent-foreground border-accent/20",
    3: "bg-muted text-muted-foreground border-border",
  };
  const labels = { 1: "Core", 2: "Supporting", 3: "Deep System" };
  return (
    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${styles[tier]}`}>
      {labels[tier]}
    </span>
  );
};

// ─── Demo Card ───────────────────────────────────────────────
interface DemoCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tier: 1 | 2 | 3;
  status: "live" | "in-progress" | "planned";
  what: string;
  why: string;
  value: string;
}

const DemoCard = ({ title, subtitle, icon, tier, status, what, why, value }: DemoCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const statusColors = {
    live: "bg-green-500/10 text-green-600 dark:text-green-400",
    "in-progress": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    planned: "bg-muted text-muted-foreground",
  };

  return (
    <motion.div
      layout
      className="rounded-xl border border-border bg-card p-5 space-y-3 hover:border-primary/30 transition-colors cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <TierBadge tier={tier} />
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${statusColors[status]}`}>
            {status}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-border space-y-3">
              <div className="space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-wider text-primary">What You're Seeing</p>
                <p className="text-xs text-foreground/80">{what}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Why It Matters</p>
                <p className="text-xs text-foreground/80">{why}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Business Value</p>
                <p className="text-xs text-foreground/80">{value}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
        {expanded ? "Collapse" : "Tap for details"}
      </div>
    </motion.div>
  );
};

// ─── Demo Data ───────────────────────────────────────────────
const TIER_1_DEMOS: DemoCardProps[] = [
  {
    title: "Memory Stream",
    subtitle: "Autonomous Discovery",
    icon: <Brain className="w-4 h-4 text-primary" />,
    tier: 1, status: "planned",
    what: "The system observes its own behavior and discovers new software pipelines autonomously.",
    why: "No other system discovers its own capabilities. This is self-improving infrastructure.",
    value: "Every discovery is a potential product. The system generates its own IP.",
  },
  {
    title: "Evolution",
    subtitle: "Self-Improving Code",
    icon: <Zap className="w-4 h-4 text-primary" />,
    tier: 1, status: "planned",
    what: "System scans its codebase, AI generates real patches, validates, scores, approve/reject.",
    why: "Software that fixes and improves itself. The core promise.",
    value: "Reduces engineering costs, eliminates tech debt, scales without hiring.",
  },
  {
    title: "Ascension",
    subtitle: "Before → After Transformation",
    icon: <Sparkles className="w-4 h-4 text-primary" />,
    tier: 1, status: "planned",
    what: "Basic code enters. The 40-primitive matrix analyzes it. Enhanced, exportable software exits.",
    why: "The clearest proof of value — input basic code, output production software.",
    value: "Every developer becomes 10x. Every script becomes a product.",
  },
  {
    title: "Build With the Substrate",
    subtitle: "Platform Proof",
    icon: <ArrowRight className="w-4 h-4 text-primary" />,
    tier: 1, status: "planned",
    what: "One click generates a working app with memory, learning, and security already wired in.",
    why: "This bridges 'impressive system' to 'investable platform.' Apps export and run anywhere.",
    value: "Platform economics — every app built on the substrate is recurring revenue.",
  },
];

const TIER_2_DEMOS: DemoCardProps[] = [
  {
    title: "DREAM Engine",
    subtitle: "Background Learning",
    icon: <Eye className="w-4 h-4 text-primary" />,
    tier: 2, status: "planned",
    what: "The system consolidates learning during idle time — dream cycles, memory synthesis.",
    why: "Autonomous background improvement. No other system does this.",
    value: "Compound intelligence — the system gets smarter every day without intervention.",
  },
  {
    title: "DEFENSE Layer",
    subtitle: "Enterprise Security",
    icon: <Shield className="w-4 h-4 text-primary" />,
    tier: 2, status: "planned",
    what: "Live threat score calculation. O(1) Trie-based evaluation, anomaly detection.",
    why: "Enterprise-grade security baked into the substrate, not bolted on.",
    value: "Security is the #1 enterprise concern. Prerequisite for adoption.",
  },
  {
    title: "SEBA Pipeline",
    subtitle: "Governance Rails",
    icon: <Activity className="w-4 h-4 text-primary" />,
    tier: 2, status: "planned",
    what: "7-gate promotion pipeline. Real pass/fail history.",
    why: "AI mutations can't bypass governance. Safety rails are structural.",
    value: "Regulatory compliance, auditability, risk mitigation.",
  },
];

// ─── Main Showcase ───────────────────────────────────────────
const ShowcaseContent = () => {
  const [showTier2, setShowTier2] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  // ─── Individual demo views ───
  if (activeDemo === "memory-stream") {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between">
          <button onClick={() => setActiveDemo(null)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Showcase
          </button>
          <span className="text-[10px] font-mono text-muted-foreground">TIER 1 · CORE</span>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <MemoryStreamDemo />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* System confidence bar */}
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span>CMPSBL® Investor Preview</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            System: Stable
          </span>
          <span>Live — No Simulated Data</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
        {/* ── 30-Second WOW ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-8 text-center space-y-4"
        >
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-widest text-primary">First Time Here?</p>
            <h2 className="text-2xl font-bold text-foreground">See it in 30 seconds</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Watch a basic script transform into production-ready software — instantly.
            </p>
          </div>
          <Button size="lg" className="gap-2" onClick={() => setActiveDemo("wow")}>
            <Sparkles className="w-4 h-4" />
            Show Me
          </Button>
          <p className="text-[10px] text-muted-foreground">
            Preloaded example • No setup required • Guaranteed result
          </p>
        </motion.div>

        {/* ── Start Here Orientation ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">What is CMPSBL?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A cognitive operating system that discovers, improves, and exports software capabilities autonomously — using 40 specialized AI primitives that coordinate through a live mesh.
            </p>
          </div>

          {/* 3-step flow */}
          <div className="flex items-center justify-center gap-2 py-3">
            {["Discover", "Improve", "Export"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-xs font-mono text-primary font-semibold">{i + 1}</span>
                  <span className="text-xs font-medium text-foreground">{step}</span>
                </div>
                {i < 2 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Recommended: Memory Stream → Evolution → Ascension → Build
          </p>
        </motion.div>

        {/* ── Tier 1 — Core Demos ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Core</h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-3">
            {TIER_1_DEMOS.map((demo) => (
              <div key={demo.title} onClick={() => {
                if (demo.title === "Memory Stream") setActiveDemo("memory-stream");
              }}>
                <DemoCard {...demo} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Tier 2 — Supporting ── */}
        <div className="space-y-4">
          <button
            onClick={() => setShowTier2(!showTier2)}
            className="flex items-center gap-2 w-full group"
          >
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
              Supporting Demos
            </h2>
            <div className="flex-1 h-px bg-border" />
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showTier2 ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {showTier2 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-3"
              >
                {TIER_2_DEMOS.map((demo) => (
                  <DemoCard key={demo.title} {...demo} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Why CMPSBL Wins ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-border bg-card p-6 space-y-4"
        >
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Why CMPSBL Wins</h2>
          <div className="space-y-2">
            {[
              { label: "Self-discovering software", ref: "Memory Stream" },
              { label: "Self-improving software", ref: "Evolution" },
              { label: "Exportable intelligence", ref: "Ascension" },
              { label: "Developer platform", ref: "Build With Substrate" },
              { label: "Built-in governance + security", ref: "SEBA + DEFENSE" },
            ].map(({ label, ref }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{label}</span>
                <span className="text-xs font-mono text-muted-foreground">→ {ref}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-[10px] text-muted-foreground font-mono">
          © 2025–2026 CMPSBL® • Live System • Internal Use Only
        </p>
      </div>
    </div>
  );
};

// ─── Root Component ──────────────────────────────────────────
const InvestorShowcase = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [showWow, setShowWow] = useState(false);

  if (!authenticated) {
    return <PinGate onSuccess={() => setAuthenticated(true)} />;
  }

  if (showWow) {
    return <WowDemo onBack={() => setShowWow(false)} />;
  }

  return <ShowcaseContent />;
};

export default InvestorShowcase;
