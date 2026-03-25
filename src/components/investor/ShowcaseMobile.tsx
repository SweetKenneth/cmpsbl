/**
 * Investor Showcase — Mobile Layout
 * Single-column, touch-optimized, compact spacing
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, Sparkles, ArrowRight, Eye, Shield, Activity, ArrowLeft, ChevronDown } from "lucide-react";
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

export function ShowcaseMobile() {
  const [showTier2, setShowTier2] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  if (activeDemo) {
    return renderDemo(activeDemo, () => setActiveDemo(null));
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Compact status bar */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md px-4 py-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span className="font-semibold">CMPSBL®</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Live
        </span>
      </div>

      <div className="px-4 py-6 space-y-8">
        {/* ── WOW CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-6 text-center space-y-3"
        >
          <p className="text-[10px] font-mono uppercase tracking-widest text-primary">First Time?</p>
          <h2 className="text-xl font-bold text-foreground">See it in 30 seconds</h2>
          <p className="text-sm text-muted-foreground">
            Watch a script become production software — instantly.
          </p>
          <Button size="lg" className="w-full gap-2" onClick={() => setActiveDemo("wow")}>
            <Sparkles className="w-4 h-4" />
            Show Me
          </Button>
          <p className="text-[10px] text-muted-foreground">No setup • Guaranteed result</p>
        </motion.div>

        {/* ── What is CMPSBL ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <h2 className="text-lg font-semibold text-foreground">What is CMPSBL?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A cognitive OS that discovers, improves, and exports software autonomously — 40 AI primitives coordinating through a live mesh.
          </p>

          {/* Compact 3-step */}
          <div className="flex items-center justify-between py-2 px-1">
            {["Discover", "Improve", "Export"].map((step, i) => (
              <div key={step} className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-[11px] font-mono text-primary font-bold">{i + 1}</span>
                  <span className="text-[11px] font-medium text-foreground">{step}</span>
                </div>
                {i < 2 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Core Demos ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Core</h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-2.5">
            {TIER_1_DEMOS.map((demo) => (
              <MobileDemoCard
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

        {/* ── Supporting Demos (collapsible) ── */}
        <section className="space-y-3">
          <button
            onClick={() => setShowTier2(!showTier2)}
            className="flex items-center gap-2 w-full active:opacity-70"
          >
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Supporting
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
                className="overflow-hidden space-y-2.5"
              >
                {TIER_2_DEMOS.map((demo) => (
                  <MobileDemoCard
                    key={demo.title}
                    {...demo}
                    onClick={() => {
                      const id = DEMO_ROUTE_MAP[demo.title];
                      if (id) setActiveDemo(id);
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── Why CMPSBL Wins ── */}
        <section className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Why CMPSBL Wins</h2>
          <div className="space-y-2">
            {[
              { label: "Self-discovering", ref: "Memory Stream" },
              { label: "Self-improving", ref: "Evolution" },
              { label: "Exportable intelligence", ref: "Ascension" },
              { label: "Developer platform", ref: "Substrate" },
              { label: "Governance + security", ref: "SEBA + DEFENSE" },
            ].map(({ label, ref }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{label}</span>
                <span className="text-[10px] font-mono text-muted-foreground">→ {ref}</span>
              </div>
            ))}
          </div>
        </section>

        <p className="text-center text-[10px] text-muted-foreground font-mono">
          © 2025–2026 CMPSBL® • Live System
        </p>
      </div>
    </div>
  );
}

// ─── Mobile Demo Card (compact, touch-friendly) ──────────────
interface MobileDemoCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tier: 1 | 2 | 3;
  status: "live" | "in-progress" | "planned";
  what: string;
  onClick: () => void;
}

function MobileDemoCard({ title, subtitle, icon, status, what, onClick }: MobileDemoCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-border bg-card p-4 text-left active:scale-[0.98] transition-transform space-y-2"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-sm truncate">{title}</h3>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
              status === "live" ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-muted text-muted-foreground"
            }`}>
              {status}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>
      <p className="text-xs text-foreground/60 leading-relaxed line-clamp-2">{what}</p>
    </button>
  );
}

// ─── Demo Renderer ───────────────────────────────────────────
function renderDemo(id: string, onBack: () => void) {
  switch (id) {
    case "wow": return <WowDemo onBack={onBack} />;
    case "memory-stream":
      return (
        <div className="min-h-screen bg-background">
          <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <span className="text-[10px] font-mono text-muted-foreground">CORE</span>
          </div>
          <div className="px-4 py-6">
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
