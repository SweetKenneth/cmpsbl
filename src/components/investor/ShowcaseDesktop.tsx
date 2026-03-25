/**
 * Investor Showcase — Desktop Layout
 * Wide multi-column layout with persistent sidebar navigation
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, Sparkles, ArrowRight, Eye, Shield, Activity, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WowDemo } from "./WowDemo";
import { MemoryStreamDemo } from "./MemoryStreamDemo";
import { EvolutionDemo } from "./EvolutionDemo";
import { AscensionDemo } from "./AscensionDemo";
import { BuildSubstrateDemo } from "./BuildSubstrateDemo";
import { DreamEngineDemo } from "./DreamEngineDemo";
import { DefenseLayerDemo } from "./DefenseLayerDemo";
import { SebaPipelineDemo } from "./SebaPipelineDemo";
import { TIER_1_DEMOS, TIER_2_DEMOS, DEMO_ROUTE_MAP } from "./showcaseData";

export function ShowcaseDesktop() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  // Render active demo full-width with back nav
  if (activeDemo) {
    return renderDemo(activeDemo, () => setActiveDemo(null));
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border bg-muted/30 px-6 py-2.5 flex items-center justify-between text-[11px] font-mono text-muted-foreground shrink-0">
        <span className="font-semibold tracking-wider">CMPSBL® Investor Preview</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            System: Stable
          </span>
          <span>Live — No Simulated Data</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ─── Left Sidebar ─── */}
        <aside className="w-72 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col shrink-0 overflow-y-auto">
          {/* WOW CTA */}
          <div className="p-5 border-b border-border/50">
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 space-y-3 text-center">
              <p className="text-[10px] font-mono uppercase tracking-widest text-primary">First Time?</p>
              <h3 className="text-sm font-bold text-foreground">See it in 30 seconds</h3>
              <Button size="sm" className="w-full gap-2" onClick={() => setActiveDemo("wow")}>
                <Sparkles className="w-3.5 h-3.5" />
                Show Me
              </Button>
            </div>
          </div>

          {/* Nav: Core */}
          <div className="p-4 space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Core Demos</p>
            {TIER_1_DEMOS.map((demo) => {
              const demoId = DEMO_ROUTE_MAP[demo.title];
              return (
                <button
                  key={demo.title}
                  onClick={() => demoId && setActiveDemo(demoId)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-accent/50 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    {demo.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{demo.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{demo.subtitle}</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 ml-auto shrink-0 transition-opacity" />
                </button>
              );
            })}
          </div>

          {/* Nav: Supporting */}
          <div className="p-4 pt-0 space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Supporting Demos</p>
            {TIER_2_DEMOS.map((demo) => {
              const demoId = DEMO_ROUTE_MAP[demo.title];
              return (
                <button
                  key={demo.title}
                  onClick={() => demoId && setActiveDemo(demoId)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-accent/50 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                    {demo.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{demo.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{demo.subtitle}</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 ml-auto shrink-0 transition-opacity" />
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-auto p-4 border-t border-border/50">
            <p className="text-[9px] text-muted-foreground font-mono text-center">
              © 2025–2026 CMPSBL® • Internal Use Only
            </p>
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-8 py-10 space-y-10">
            {/* Hero orientation */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                What is CMPSBL?
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                A cognitive operating system that discovers, improves, and exports software capabilities autonomously — using 40 specialized AI primitives that coordinate through a live mesh.
              </p>

              {/* 3-step flow */}
              <div className="flex items-center gap-3 pt-2">
                {["Discover", "Improve", "Export"].map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                      <span className="text-sm font-mono text-primary font-bold">{i + 1}</span>
                      <span className="text-sm font-medium text-foreground">{step}</span>
                    </div>
                    {i < 2 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── Tier 1 Grid ── */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Core Demos</h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {TIER_1_DEMOS.map((demo) => (
                  <DesktopDemoCard
                    key={demo.title}
                    {...demo}
                    onClick={() => {
                      const id = DEMO_ROUTE_MAP[demo.title];
                      if (id) setActiveDemo(id);
                    }}
                  />
                ))}
              </div>
            </section>

            {/* ── Tier 2 Grid ── */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Supporting Demos</h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {TIER_2_DEMOS.map((demo) => (
                  <DesktopDemoCard
                    key={demo.title}
                    {...demo}
                    onClick={() => {
                      const id = DEMO_ROUTE_MAP[demo.title];
                      if (id) setActiveDemo(id);
                    }}
                  />
                ))}
              </div>
            </section>

            {/* ── Why CMPSBL Wins ── */}
            <section className="rounded-xl border border-border bg-card p-8 space-y-5">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Why CMPSBL Wins</h2>
              <div className="grid grid-cols-2 gap-x-10 gap-y-3">
                {[
                  { label: "Self-discovering software", ref: "Memory Stream" },
                  { label: "Self-improving software", ref: "Evolution" },
                  { label: "Exportable intelligence", ref: "Ascension" },
                  { label: "Developer platform", ref: "Build With Substrate" },
                  { label: "Built-in governance + security", ref: "SEBA + DEFENSE" },
                ].map(({ label, ref }) => (
                  <div key={label} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-foreground font-medium">{label}</span>
                    <span className="text-xs font-mono text-muted-foreground">→ {ref}</span>
                  </div>
                ))}
              </div>
            </section>

            <p className="text-center text-[10px] text-muted-foreground font-mono pb-6">
              © 2025–2026 CMPSBL® • Live System • Internal Use Only
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Desktop Demo Card ───────────────────────────────────────
interface DesktopDemoCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tier: 1 | 2 | 3;
  status: "live" | "in-progress" | "planned";
  what: string;
  why: string;
  value: string;
  onClick: () => void;
}

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

function DesktopDemoCard({ title, subtitle, icon, tier, status, what, why, value, onClick }: DesktopDemoCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="rounded-xl border border-border bg-card p-6 space-y-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TierBadge tier={tier} />
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
            status === "live" ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-muted text-muted-foreground"
          }`}>
            {status}
          </span>
        </div>
      </div>

      <p className="text-sm text-foreground/70 leading-relaxed">{what}</p>

      <div className="pt-1 border-t border-border/50 space-y-1.5">
        <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground/80">Why it matters:</span> {why}</p>
        <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground/80">Value:</span> {value}</p>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-primary font-medium group-hover:gap-2.5 transition-all">
        <span>Open demo</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </motion.div>
  );
}

// ─── Demo Renderer ───────────────────────────────────────────
function renderDemo(id: string, onBack: () => void) {
  switch (id) {
    case "wow": return <WowDemo onBack={onBack} />;
    case "memory-stream":
      return (
        <div className="min-h-screen bg-background">
          <div className="border-b border-border bg-muted/30 px-6 py-2.5 flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Showcase
            </button>
            <span className="text-[10px] font-mono text-muted-foreground">TIER 1 · CORE</span>
          </div>
          <div className="max-w-3xl mx-auto px-6 py-10">
            <MemoryStreamDemo />
          </div>
        </div>
      );
    case "evolution": return <EvolutionDemo onBack={onBack} />;
    case "ascension": return <AscensionDemo onBack={onBack} />;
    case "build-substrate": return <BuildSubstrateDemo onBack={onBack} />;
    case "dream-engine": return <DreamEngineDemo onBack={onBack} />;
    case "defense-layer": return <DefenseLayerDemo onBack={onBack} />;
    case "seba-pipeline": return <SebaPipelineDemo onBack={onBack} />;
    default: return null;
  }
}
