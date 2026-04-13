/**
 * Build With the Substrate Demo — Tier 1
 * SYMBIOTIC Epoch v19.0.0 — Compounding Autonomy Pipeline
 * Shows: 12 verticals × 40 primitives → autonomous product creation
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Package, Cpu, Play, Download, Globe,
  CheckCircle, Brain, Shield, Sparkles, Layers, Flame,
  Scale, Zap, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type Step = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { num: 1 as Step, label: "Discover", icon: <Brain className="w-3.5 h-3.5" /> },
  { num: 2 as Step, label: "Cure", icon: <Zap className="w-3.5 h-3.5" /> },
  { num: 3 as Step, label: "Compile", icon: <Cpu className="w-3.5 h-3.5" /> },
  { num: 4 as Step, label: "Price", icon: <Scale className="w-3.5 h-3.5" /> },
  { num: 5 as Step, label: "Export", icon: <Download className="w-3.5 h-3.5" /> },
];

const VERTICALS = [
  "Gaming", "Legal", "Health", "Finance", "Education", "Retail",
  "Logistics", "Media", "Security", "Energy", "Agriculture", "Government",
];

const PRIMITIVES_SAMPLE = [
  { name: "MEMORY", desc: "Persistent state across all cycles", icon: <Brain className="w-4 h-4" />, category: "Organ" },
  { name: "DREAM", desc: "Background synthesis — no AI inside", icon: <Sparkles className="w-4 h-4" />, category: "Engine" },
  { name: "DEFENSE", desc: "6-layer cognitive security matrix", icon: <Shield className="w-4 h-4" />, category: "Layer" },
  { name: "CONSCIENCE", desc: "Constitutional governance rails", icon: <Scale className="w-4 h-4" />, category: "Organ" },
  { name: "EVOLUTION", desc: "Self-improving patch pipeline", icon: <Zap className="w-4 h-4" />, category: "Engine" },
  { name: "MANA", desc: "Silent Layer 2 symbiont attachment", icon: <Flame className="w-4 h-4" />, category: "Engine" },
];

const EXPORT_LANGUAGES = [
  "TypeScript", "Python", "Rust", "Go", "Java", "C#",
  "Swift", "Kotlin", "Ruby", "PHP", "Dart", "Elixir",
];

interface BuildSubstrateDemoProps {
  onBack: () => void;
}

export const BuildSubstrateDemo = ({ onBack }: BuildSubstrateDemoProps) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [discovering, setDiscovering] = useState(false);
  const [discovered, setDiscovered] = useState(false);
  const [selectedVertical, setSelectedVertical] = useState<string | null>(null);

  const handleDiscover = useCallback(() => {
    setDiscovering(true);
    setTimeout(() => {
      setDiscovering(false);
      setDiscovered(true);
      setCurrentStep(2);
    }, 2000);
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none" style={{ background: "var(--gradient-mesh)" }} />

      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/30 bg-background/60 backdrop-blur-xl px-4 md:px-8 py-3 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Showcase
        </button>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-[9px] font-mono">TIER 1 · PLATFORM</Badge>
          <Badge className="text-[9px] font-mono bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">NOT AI</Badge>
        </div>
      </div>

      <div className="relative max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-foreground">Build With the Substrate</h1>
              <p className="text-xs text-muted-foreground">12 verticals · 40 primitives each · Deterministic curing</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Select a vertical → the substrate discovers capabilities across 10²³ primitive combinations → 
            cures them into production artifacts → auto-prices → exports as zero-dependency distributions. 
            <span className="font-semibold text-foreground"> No AI in the output.</span>
          </p>
        </motion.div>

        {/* Pipeline Steps */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center gap-1">
              <button
                onClick={() => discovered && setCurrentStep(s.num)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all whitespace-nowrap ${
                  currentStep === s.num
                    ? "bg-primary/10 border border-primary/20 text-primary"
                    : currentStep > s.num
                    ? "bg-primary/5 border border-primary/10 text-primary/70"
                    : "bg-muted border border-border text-muted-foreground"
                }`}
              >
                {currentStep > s.num ? <CheckCircle className="w-3 h-3" /> : s.icon}
                {s.label}
              </button>
              {i < STEPS.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Discover */}
          {currentStep === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div className="space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Step 1 — Select Vertical</p>
                <p className="text-sm text-muted-foreground">Each vertical is a complete 40-primitive substrate — 24 universal Core Spine + 16 vertical-specific expansion slots.</p>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {VERTICALS.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVertical(v)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                      selectedVertical === v
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-card/60 border-border/30 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              {selectedVertical && !discovered && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {discovering ? (
                    <div className="rounded-xl border border-border bg-card/60 p-5 text-center space-y-3">
                      <Progress value={68} className="h-2 max-w-xs mx-auto" />
                      <p className="text-xs font-mono text-muted-foreground animate-pulse">
                        Scanning 10²³ combinations across {selectedVertical} substrate…
                      </p>
                    </div>
                  ) : (
                    <Button className="gap-2" onClick={handleDiscover}>
                      <Brain className="w-4 h-4" />
                      Discover {selectedVertical} Capabilities
                    </Button>
                  )}
                </motion.div>
              )}

              {discovered && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{selectedVertical} substrate — 40 primitives active</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 2: Cure */}
          {currentStep === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div className="space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Step 2 — Deterministic Curing</p>
                <p className="text-sm text-muted-foreground">
                  CJPI scoring formula analyzes each discovery — not probabilities, not guesswork. 
                  <span className="font-semibold text-foreground"> Verifiable algorithmic analysis.</span>
                </p>
              </div>

              <div className="space-y-3">
                {PRIMITIVES_SAMPLE.map((p, i) => (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/30 bg-card/60"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {p.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{p.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{p.category}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-primary/60 shrink-0" />
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono">+ 34 more primitives active</span>
                <Button size="sm" className="gap-1.5" onClick={() => setCurrentStep(3)}>
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Compile */}
          {currentStep === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div className="space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Step 3 — Product Compiler</p>
                <p className="text-sm text-muted-foreground">
                  Discovered capabilities are assembled into deployable software products — each a standalone, IP-protected artifact.
                </p>
              </div>

              <div className="rounded-xl border border-primary/20 bg-card/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-primary uppercase">Compilation Output</span>
                  <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">patent-pending</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Products assembled", val: "7" },
                    { label: "Primitives wired", val: "40" },
                    { label: "CJPI avg score", val: "82.4" },
                    { label: "Export formats", val: "90+" },
                  ].map(({ label, val }) => (
                    <div key={label} className="px-3 py-2 rounded-lg bg-muted/50 border border-border/30">
                      <p className="text-lg font-bold text-foreground font-mono">{val}</p>
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button size="sm" className="gap-1.5" onClick={() => setCurrentStep(4)}>
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Price */}
          {currentStep === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div className="space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Step 4 — ECONOMY Auto-Pricing</p>
                <p className="text-sm text-muted-foreground">
                  The ECONOMY primitive analyzes capability density, vertical demand, and CJPI scores to auto-price between <span className="font-bold text-foreground">$10–$99</span>.
                </p>
              </div>

              <div className="rounded-xl border border-border/30 bg-card/60 overflow-hidden">
                <div className="px-4 py-2 border-b border-border/30 bg-muted/30">
                  <span className="text-[10px] font-mono text-muted-foreground">{selectedVertical ?? "Gaming"} · Marketplace Ready</span>
                </div>
                <div className="p-4 space-y-2">
                  {[
                    { name: "Adaptive State Manager", price: "$49", cjpi: 87 },
                    { name: "Threat-Aware Data Pipeline", price: "$79", cjpi: 91 },
                    { name: "Self-Healing API Gateway", price: "$99", cjpi: 94 },
                  ].map((product) => (
                    <div key={product.name} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground">CJPI: {product.cjpi}/100</p>
                      </div>
                      <span className="text-sm font-bold font-mono text-primary">{product.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button size="sm" className="gap-1.5" onClick={() => setCurrentStep(5)}>
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Export */}
          {currentStep === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div className="space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Step 5 — Zero-Dependency Export</p>
                <p className="text-sm text-muted-foreground">
                  Every product exports as a single-file, zero-dependency distribution. 
                  <span className="font-semibold text-foreground"> Runs anywhere. No vendor lock-in.</span>
                </p>
              </div>

              <div className="rounded-2xl border-2 border-primary/20 p-6 space-y-5" style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.04), hsl(var(--card)))" }}>
                <Globe className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-lg font-bold text-foreground text-center">90+ Languages Supported</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {EXPORT_LANGUAGES.map((lang) => (
                    <span key={lang} className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground">
                      {lang}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground text-center font-mono">+ 78 more · AST-validated · IP-protected</p>
              </div>

              {/* The loop */}
              <div className="rounded-xl border border-primary/15 bg-card/60 p-5 space-y-3">
                <p className="text-[10px] font-mono uppercase tracking-wider text-primary">The Compounding Loop</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {["Discover", "Score", "Classify", "Compile", "Price", "List", "Learn"].map((stage, i) => (
                    <div key={stage} className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-foreground px-2 py-1 rounded-lg bg-primary/5 border border-primary/10">
                        {stage}
                      </span>
                      {i < 6 && <ArrowRight className="w-3 h-3 text-primary/40" />}
                    </div>
                  ))}
                  <span className="text-xs text-primary font-mono">↻ repeat</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Every cycle feeds back. The substrate gets smarter, produces higher-quality software, and compounds IP — autonomously.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Business Value */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border/30 bg-card/60 p-5 space-y-4"
        >
          <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Why It Matters</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This bridges "impressive system" to "investable platform." Every app built on the substrate generates recurring revenue. 
            Every export proves independence — no vendor lock-in. The system manufactures sellable software from its own patterns.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-primary" />
              <span className="font-mono">12 verticals</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-primary" />
              <span className="font-mono">40 primitives each</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-primary" />
              <span className="font-mono">90+ languages</span>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-[9px] text-muted-foreground/40 font-mono pb-4">
          © 2025–2026 CMPSBL® · Deterministic Curing · Not AI · Confidential
        </p>
      </div>
    </div>
  );
};
