/**
 * Investor Showcase — Desktop Layout
 * Glass-morphism, gradient meshes, fluid typography, Believer Epoch aesthetic
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, Sparkles, ArrowRight, Shield, Activity, ArrowLeft, Eye, BookOpen } from "lucide-react";
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

export function ShowcaseDesktop() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  if (activeDemo) {
    return renderDemo(activeDemo, () => setActiveDemo(null));
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient gradient mesh */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "var(--gradient-mesh)" }} />

      {/* Top bar — glass */}
      <div className="sticky top-0 z-40 border-b border-border/30 bg-background/60 backdrop-blur-xl px-8 py-3 flex items-center justify-between">
        <span className="text-sm font-mono font-bold tracking-wider text-foreground">
          CMPSBL<span className="text-primary">®</span>
          <span className="ml-3 text-xs font-normal text-muted-foreground">Investor Preview</span>
        </span>
        <div className="flex items-center gap-5 text-xs font-mono text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ boxShadow: "var(--shadow-glow)" }} />
            System Stable
          </span>
          <span className="text-muted-foreground/50">Live Data · No Simulations</span>
        </div>
      </div>

      <div className="relative flex flex-1 min-h-[calc(100vh-49px)]">
        {/* ─── Sidebar ─── */}
        <aside className="w-72 border-r border-border/20 bg-card/30 backdrop-blur-sm flex flex-col shrink-0 overflow-y-auto">
          {/* WOW CTA */}
          <div className="p-5 border-b border-border/20">
            <div className="relative rounded-xl overflow-hidden border border-primary/20">
              <div className="absolute inset-0" style={{ background: "var(--gradient-primary)", opacity: 0.08 }} />
              <div className="relative p-4 space-y-3 text-center">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-[9px] font-mono uppercase tracking-widest text-primary">
                  <Sparkles className="w-2.5 h-2.5" />
                  Start Here
                </div>
                <h3 className="text-sm font-bold text-foreground">30-Second Demo</h3>
                <Button size="sm" className="w-full gap-2 rounded-lg" onClick={() => setActiveDemo("wow")}>
                  <Sparkles className="w-3.5 h-3.5" />
                  Show Me
                </Button>
              </div>
            </div>
          </div>

          {/* Core Nav */}
          <div className="p-4 space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-bold mb-3">Core</p>
            {TIER_1_DEMOS.map((demo) => {
              const demoId = DEMO_ROUTE_MAP[demo.title];
              return (
                <button
                  key={demo.title}
                  onClick={() => demoId && setActiveDemo(demoId)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-primary/5 transition-all group border border-transparent hover:border-primary/10"
                >
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    {demo.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{demo.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{demo.subtitle}</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-primary/40 opacity-0 group-hover:opacity-100 ml-auto shrink-0 transition-opacity" />
                </button>
              );
            })}
          </div>

          {/* Supporting Nav */}
          <div className="p-4 pt-0 space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground font-bold mb-3">Supporting</p>
            {TIER_2_DEMOS.map((demo) => {
              const demoId = DEMO_ROUTE_MAP[demo.title];
              return (
                <button
                  key={demo.title}
                  onClick={() => demoId && setActiveDemo(demoId)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-accent/5 transition-all group border border-transparent hover:border-border/30"
                >
                  <div className="w-7 h-7 rounded-md bg-muted/50 flex items-center justify-center shrink-0">
                    {demo.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{demo.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{demo.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto p-4 border-t border-border/20">
            <p className="text-[9px] text-muted-foreground/50 font-mono text-center">
              © 2025–2026 CMPSBL® · Confidential
            </p>
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-8 py-12 space-y-12">
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="space-y-5"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-mono uppercase tracking-widest text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Cognitive Infrastructure Substrate
              </div>
              <h1 className="text-4xl font-black text-foreground tracking-tight leading-tight">
                Software that discovers,<br />improves, and exports{" "}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
                  itself.
                </span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                40 specialized AI primitives coordinate through a live mesh to autonomously discover new capabilities, improve existing code, and export production-ready software.
              </p>

              {/* Pipeline flow */}
              <div className="flex items-center gap-4 pt-2">
                {[
                  { step: "Discover", desc: "Memory Stream finds patterns" },
                  { step: "Improve", desc: "Evolution patches code" },
                  { step: "Export", desc: "Ascension ships artifacts" },
                ].map(({ step, desc }, i) => (
                  <div key={step} className="flex items-center gap-4">
                    <div className="px-4 py-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold text-primary">{i + 1}</span>
                        <span className="text-sm font-bold text-foreground">{step}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    {i < 2 && <ArrowRight className="w-4 h-4 text-muted-foreground/40" />}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── Core Demos Grid ── */}
            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">Core Capabilities</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                {TIER_1_DEMOS.map((demo, i) => (
                  <DesktopDemoCard
                    key={demo.title}
                    {...demo}
                    index={i}
                    onClick={() => {
                      const id = DEMO_ROUTE_MAP[demo.title];
                      if (id) setActiveDemo(id);
                    }}
                  />
                ))}
              </div>
            </section>

            {/* ── Supporting Grid ── */}
            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground font-bold">Supporting Capabilities</h2>
                <div className="flex-1 h-px bg-border/30" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {TIER_2_DEMOS.map((demo, i) => (
                  <DesktopDemoCard
                    key={demo.title}
                    {...demo}
                    index={i}
                    onClick={() => {
                      const id = DEMO_ROUTE_MAP[demo.title];
                      if (id) setActiveDemo(id);
                    }}
                  />
                ))}
              </div>
            </section>

            {/* ── Why CMPSBL Wins ── */}
            <section className="relative rounded-2xl border border-primary/20 overflow-hidden">
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.06), hsl(var(--neon-purple) / 0.04), hsl(var(--neon-cyan) / 0.03))" }} />
              <div className="relative p-8 space-y-6">
                <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">Competitive Moat</h2>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "Self-Discovering Software", desc: "Finds new capabilities humans never programmed.", color: "bg-primary" },
                    { label: "Self-Improving Codebase", desc: "AI generates, validates, and applies its own patches.", color: "bg-[hsl(var(--neon-cyan))]" },
                    { label: "25-Language Portable Export", desc: "Single-file, zero-dependency distributions in any stack.", color: "bg-[hsl(var(--neon-magenta))]" },
                    { label: "IP-Protected Artifacts", desc: "Hex-encoded proprietary logic in every export.", color: "bg-[hsl(var(--neon-purple))]" },
                    { label: "Constitutional Governance", desc: "Safety rails are structural, not afterthoughts.", color: "bg-[hsl(var(--neon-amber))]" },
                    { label: "Enterprise Security", desc: "Defense mesh with O(1) threat scoring built in.", color: "bg-[hsl(var(--neon-green))]" },
                  ].map(({ label, desc, color }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${color}`} />
                      <div>
                        <p className="text-sm font-bold text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <p className="text-center text-[10px] text-muted-foreground/40 font-mono pb-8">
              © 2025–2026 CMPSBL® · Live System · Internal Use Only
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
  index: number;
  onClick: () => void;
}

function DesktopDemoCard({ title, subtitle, icon, tier, status, what, why, value, index, onClick }: DesktopDemoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -3 }}
      onClick={onClick}
      className="rounded-xl border border-border/20 bg-card/60 backdrop-blur-sm p-6 space-y-4 hover:border-primary/25 hover:shadow-lg transition-all cursor-pointer group"
      style={{ transition: "var(--transition-smooth)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {title === "Ascension" ? (
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
            unreleased
          </span>
        ) : status === "live" ? (
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
            live
          </span>
        ) : null}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{what}</p>

      <div className="pt-2 border-t border-border/20 space-y-1.5">
        <p className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground/80">Why:</span> {why}
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground/80">Value:</span> {value}
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-primary font-semibold group-hover:gap-2.5 transition-all">
        <span>Open demo</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </motion.div>
  );
}

// ─── Demo Renderer ───────────────────────────────────────────
function renderDemo(id: string, onBack: () => void) {
  const BackBar = () => (
    <div className="sticky top-0 z-40 border-b border-border/30 bg-background/60 backdrop-blur-xl px-8 py-3 flex items-center justify-between">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Showcase
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
          <div className="relative max-w-4xl mx-auto px-8 py-10">
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
