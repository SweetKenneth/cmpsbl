/**
 * DREAM Engine Demo — SYMBIOTIC Epoch v19
 * Background learning with "No AI Inside" badge and compound learning curve.
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, Moon, Sun, Brain, Sparkles, CheckCircle, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface DreamCycle {
  id: string;
  phase: string;
  title: string;
  insights: string[];
  patternsFound: number;
  memoryConsolidated: number;
  duration: string;
  improvement: string;
}

const DREAM_CYCLES: DreamCycle[] = [
  {
    id: "DC-047", phase: "REM", title: "API Pattern Consolidation",
    insights: [
      "Detected 14 similar error-handling patterns across 8 primitives",
      "Synthesized shared ErrorBoundary utility — reduces duplication by 62%",
      "Identified 3 resolver patterns ready for template extraction",
    ],
    patternsFound: 14, memoryConsolidated: 847, duration: "12m 34s", improvement: "+4.2% code reuse",
  },
  {
    id: "DC-046", phase: "Deep", title: "Security Heuristic Refinement",
    insights: [
      "Cross-referenced 2,140 DEFENSE evaluations from past 72h",
      "Reduced false positive rate from 3.1% → 1.7%",
      "New pattern: JWT bypass attempts cluster at 02:00–04:00 UTC",
    ],
    patternsFound: 7, memoryConsolidated: 2140, duration: "8m 12s", improvement: "+1.4% threat accuracy",
  },
  {
    id: "DC-045", phase: "Light", title: "Performance Baseline Update",
    insights: [
      "Recalculated P95 latency baselines across all 40 primitives",
      "Flagged NEXUS routing as 23% slower than 7-day average",
      "Recommended cache warming for MEMORY.semantic_search",
    ],
    patternsFound: 3, memoryConsolidated: 12400, duration: "4m 51s", improvement: "Baseline refresh",
  },
];

const phaseConfig = {
  REM: { icon: <Moon className="w-3.5 h-3.5" />, color: "text-[hsl(var(--neon-purple))] bg-[hsl(var(--neon-purple)/.1)] border-[hsl(var(--neon-purple)/.2)]" },
  Deep: { icon: <Brain className="w-3.5 h-3.5" />, color: "text-[hsl(var(--neon-cyan))] bg-[hsl(var(--neon-cyan)/.1)] border-[hsl(var(--neon-cyan)/.2)]" },
  Light: { icon: <Sun className="w-3.5 h-3.5" />, color: "text-[hsl(var(--neon-amber))] bg-[hsl(var(--neon-amber)/.1)] border-[hsl(var(--neon-amber)/.2)]" },
};

interface DreamEngineDemoProps { onBack: () => void; }

export const DreamEngineDemo = ({ onBack }: DreamEngineDemoProps) => {
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  const [dreaming, setDreaming] = useState(false);
  const [dreamProgress, setDreamProgress] = useState(0);

  const simulateDream = useCallback(() => {
    setDreaming(true);
    setDreamProgress(0);
    const interval = setInterval(() => {
      setDreamProgress((p) => {
        if (p >= 100) { clearInterval(interval); setTimeout(() => setDreaming(false), 500); return 100; }
        return p + 2;
      });
    }, 60);
  }, []);

  const pc = (phase: string) => phaseConfig[phase as keyof typeof phaseConfig] ?? phaseConfig.Light;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none" style={{ background: "var(--gradient-mesh)" }} />

      <div className="sticky top-0 z-40 border-b border-border/30 bg-background/60 backdrop-blur-xl px-4 sm:px-8 py-2.5 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />Back
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 uppercase tracking-wider">Confidential</span>
          <span className="text-[10px] font-mono text-primary/70 uppercase tracking-wider">CMPSBL®</span>
        </div>
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-mono uppercase tracking-widest text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Patentable
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[hsl(var(--neon-green)/.3)] bg-[hsl(var(--neon-green)/.05)] text-[10px] font-mono uppercase tracking-widest text-[hsl(var(--neon-green))]">
              <Zap className="w-3 h-3" />
              No AI Inside — Pure Algorithmic
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center" style={{ boxShadow: "var(--shadow-glow)" }}>
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">DREAM Engine</h1>
              <p className="text-sm text-muted-foreground">Background Learning & Memory Consolidation</p>
            </div>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            During idle time, the system enters dream cycles — consolidating memories, finding patterns across primitives, and synthesizing improvements. Like biological sleep, this is where learning becomes permanent. <span className="font-bold text-foreground">Zero AI calls. Pure algorithmic curing.</span>
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3">
          {[
            { label: "Dream Cycles (24h)", value: "12", icon: <Moon className="w-3.5 h-3.5" /> },
            { label: "Patterns Found", value: "24", icon: <Sparkles className="w-3.5 h-3.5" /> },
            { label: "Memories Processed", value: "15.4K", icon: <Brain className="w-3.5 h-3.5" /> },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-card/60 backdrop-blur-sm border border-border/20 p-3 text-center space-y-1">
              <div className="flex items-center justify-center text-primary">{s.icon}</div>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Trigger */}
        {dreaming ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-foreground">Dream cycle in progress…</span>
            </div>
            <Progress value={dreamProgress} className="h-2" />
            <p className="text-[10px] font-mono text-muted-foreground">
              {dreamProgress < 30 ? "Scanning recent activity…" : dreamProgress < 60 ? "Finding patterns…" : dreamProgress < 90 ? "Consolidating memories…" : "Synthesis complete"}
            </p>
          </motion.div>
        ) : (
          <div className="text-center">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={simulateDream}>
              <Moon className="w-3.5 h-3.5" />Trigger Dream Cycle
            </Button>
          </div>
        )}

        {/* Cycles */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold">Recent Dream Cycles</p>
          {DREAM_CYCLES.map((cycle, idx) => {
            const isSelected = selectedCycle === cycle.id;
            const phase = pc(cycle.phase);
            return (
              <motion.div key={cycle.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + idx * 0.08 }}
                className={`rounded-xl border bg-card/60 backdrop-blur-sm overflow-hidden transition-colors cursor-pointer ${
                  isSelected ? "border-primary/30" : "border-border/20 hover:border-primary/15"
                }`} onClick={() => setSelectedCycle(isSelected ? null : cycle.id)}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground">{cycle.id}</span>
                        <span className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border ${phase.color}`}>
                          {phase.icon}{cycle.phase}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground">{cycle.title}</h3>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{cycle.duration}</span>
                        <span className="flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" />{cycle.patternsFound} patterns</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-primary whitespace-nowrap">{cycle.improvement}</span>
                  </div>
                </div>
                <AnimatePresence>
                  {isSelected && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-3 border-t border-border/20 pt-3">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Insights Discovered</p>
                        {cycle.insights.map((insight, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                            <CheckCircle className="w-3 h-3 text-primary shrink-0 mt-0.5" />{insight}
                          </div>
                        ))}
                        <p className="text-[10px] text-muted-foreground pt-1">{cycle.memoryConsolidated.toLocaleString()} memories processed</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Why */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-sm p-5 space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold">Why It Matters</p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              The system improves during downtime — no human intervention, no cost. Pure algorithmic curing, not AI inference. Like sleep for biological brains, dream cycles consolidate learning and surface latent patterns.
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold">Compound Intelligence</p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Each cycle reduces future costs and increases capability. The system gets measurably smarter every day without hiring, without compute budgets, without AI API calls.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
