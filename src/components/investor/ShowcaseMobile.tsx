/**
 * Investor Showcase — Mobile Layout
 * Glass-morphism, gradient meshes, fluid typography, Believer Epoch aesthetic
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, Sparkles, ArrowRight, ArrowLeft, ChevronDown, Activity, Shield, Eye, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WowDemo } from "./WowDemo";
import { MemoryStreamDemo } from "./MemoryStreamDemo";
import { EvolutionDemo } from "./EvolutionDemo";
import { AscensionDemo } from "./AscensionDemo";
import { BuildSubstrateDemo } from "./BuildSubstrateDemo";
import { DreamEngineDemo } from "./DreamEngineDemo";
import { DefenseLayerDemo } from "./DefenseLayerDemo";
import { SebaPipelineDemo } from "./SebaPipelineDemo";
import { InvestorDocLibrary } from "./InvestorDocLibrary";
import { TIER_1_DEMOS, TIER_2_DEMOS, DEMO_ROUTE_MAP } from "./showcaseData";

const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const fadeUp = {
  initial: { opacity: 0, y: 20 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.5, ease: EASE },
};

export function ShowcaseMobile() {
  const [showTier2, setShowTier2] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  if (activeDemo) {
    return renderDemo(activeDemo, () => setActiveDemo(null));
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient gradient mesh background */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "var(--gradient-mesh)" }} />

      {/* Top bar — glass */}
      <div className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs font-mono font-bold tracking-wider text-foreground">CMPSBL<span className="text-primary">®</span></span>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-sm" style={{ boxShadow: "var(--shadow-glow)" }} />
          Live System
        </span>
      </div>

      <div className="relative px-4 py-6 space-y-8">
        {/* ── Hero / WOW CTA ── */}
        <motion.div {...fadeUp} className="relative rounded-2xl border border-primary/20 overflow-hidden">
          {/* Glow border effect */}
          <div className="absolute inset-0 rounded-2xl" style={{ background: "var(--gradient-primary)", opacity: 0.06 }} />
          <div className="relative p-6 text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-[10px] font-mono uppercase tracking-widest text-primary">
              <Sparkles className="w-3 h-3" />
              Investor Preview
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight leading-tight">
              See it in<br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
                30 seconds
              </span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Watch a basic script transform into production software — instantly.
            </p>
            <Button size="lg" className="w-full gap-2 rounded-xl shadow-lg" style={{ boxShadow: "var(--shadow-glow)" }} onClick={() => setActiveDemo("wow")}>
              <Sparkles className="w-4 h-4" />
              Show Me
            </Button>
            <p className="text-[10px] text-muted-foreground/60 font-mono">No setup required · Guaranteed result</p>
          </div>
        </motion.div>

        {/* ── What is CMPSBL ── */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="space-y-4">
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            A Cognitive <span className="text-primary">Operating System</span>
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            40 AI primitives that discover, improve, and export software capabilities autonomously — coordinating through a live mesh architecture.
          </p>

          {/* 3-step pipeline */}
          <div className="flex items-center justify-between py-3">
            {["Discover", "Improve", "Export"].map((step, i) => (
              <div key={step} className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30 shadow-sm">
                  <span className="text-xs font-mono font-bold text-primary">{i + 1}</span>
                  <span className="text-xs font-semibold text-foreground">{step}</span>
                </div>
                {i < 2 && <ArrowRight className="w-3 h-3 text-muted-foreground/50" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Core Demos ── */}
        <motion.section {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }} className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">Core Capabilities</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
          </div>
          <div className="space-y-3">
            {TIER_1_DEMOS.map((demo, idx) => (
              <MobileDemoCard
                key={demo.title}
                {...demo}
                index={idx}
                onClick={() => {
                  const id = DEMO_ROUTE_MAP[demo.title];
                  if (id) setActiveDemo(id);
                }}
              />
            ))}
          </div>
        </motion.section>

        {/* ── Supporting Demos ── */}
        <section className="space-y-3">
          <button
            onClick={() => setShowTier2(!showTier2)}
            className="flex items-center gap-3 w-full active:opacity-70"
          >
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground font-bold">Supporting</h2>
            <div className="flex-1 h-px bg-border/50" />
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${showTier2 ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {showTier2 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden space-y-3"
              >
                {TIER_2_DEMOS.map((demo, idx) => (
                  <MobileDemoCard
                    key={demo.title}
                    {...demo}
                    index={idx}
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

        {/* ── Investor Documents ── */}
        <motion.section {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.25 }} className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">Investor Documents</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
          </div>
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: EASE }}
            onClick={() => setActiveDemo("doc-library")}
            className="w-full rounded-xl border border-primary/20 bg-card/60 backdrop-blur-sm p-4 text-left active:scale-[0.98] transition-all duration-200 space-y-2 shadow-sm hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground text-sm">Investor Library</h3>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                    8 docs
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">Read & print due-diligence materials</p>
              </div>
              <ArrowRight className="w-4 h-4 text-primary/50 shrink-0" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Executive summary, architecture, IP defensibility, valuation, and more — printable.</p>
          </motion.button>
        </motion.section>

        {/* ── Why CMPSBL Wins ── */}
        <motion.section {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }}>
          <div className="rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-sm p-5 space-y-4 shadow-sm" style={{ background: "linear-gradient(135deg, hsl(var(--card) / 0.6), hsl(var(--primary) / 0.03))" }}>
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">Why CMPSBL Wins</h2>
            <div className="space-y-2.5">
              {[
                { label: "Self-discovering", desc: "Finds new software capabilities autonomously", color: "bg-primary" },
                { label: "Self-improving", desc: "AI patches and upgrades its own code", color: "bg-[hsl(var(--neon-cyan))]" },
                { label: "25-language export", desc: "Single-file, zero-dependency distributions", color: "bg-[hsl(var(--neon-magenta))]" },
                { label: "IP-protected", desc: "Hex-encoded proprietary logic in every export", color: "bg-[hsl(var(--neon-purple))]" },
                { label: "Governed & secure", desc: "Constitutional AI with enterprise security", color: "bg-[hsl(var(--neon-amber))]" },
              ].map(({ label, desc, color }) => (
                <div key={label} className="flex items-start gap-3 py-1">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${color}`} />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <p className="text-center text-[10px] text-muted-foreground/50 font-mono pt-4">
          © 2025–2026 CMPSBL® · Live System · Confidential
        </p>
      </div>
    </div>
  );
}

// ─── Mobile Demo Card ────────────────────────────────────────
interface MobileDemoCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tier: 1 | 2 | 3;
  status: "live" | "in-progress" | "planned";
  what: string;
  index: number;
  onClick: () => void;
}

function MobileDemoCard({ title, subtitle, icon, status, what, index, onClick }: MobileDemoCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      onClick={onClick}
      className="w-full rounded-xl border border-border/30 bg-card/60 backdrop-blur-sm p-4 text-left active:scale-[0.98] transition-all duration-200 space-y-2 shadow-sm hover:border-primary/20 hover:shadow-md"
      style={{ transition: "var(--transition-smooth)" }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground text-sm truncate">{title}</h3>
            {status === "live" && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                live
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-primary/50 shrink-0" />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{what}</p>
    </motion.button>
  );
}

// ─── Demo Renderer ───────────────────────────────────────────
function renderDemo(id: string, onBack: () => void) {
  const BackBar = ({ label = "Back" }: { label?: string }) => (
    <div className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl px-4 py-2.5 flex items-center justify-between">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        {label}
      </button>
      <span className="text-[10px] font-mono text-primary/70 uppercase tracking-wider">CMPSBL®</span>
    </div>
  );

  switch (id) {
    case "wow": return <WowDemo onBack={onBack} />;
    case "memory-stream":
      return (
        <div className="min-h-screen bg-background relative">
          <div className="fixed inset-0 pointer-events-none" style={{ background: "var(--gradient-mesh)" }} />
          <BackBar />
          <div className="relative px-4 py-6">
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
    case "doc-library": return <InvestorDocLibrary onBack={onBack} />;
    default: return null;
  }
}
