/**
 * DREAM Engine Demo — Tier 2
 * Background learning: dream cycles, memory consolidation, pattern synthesis.
 * Preloaded data for zero-risk investor presentation.
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Eye, Moon, Sun, Brain, Sparkles, TrendingUp,
  CheckCircle, Clock, Zap,
} from "lucide-react";
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
    id: "DC-047",
    phase: "REM",
    title: "API Pattern Consolidation",
    insights: [
      "Detected 14 similar error-handling patterns across 8 modules",
      "Synthesized shared ErrorBoundary utility — reduces duplication by 62%",
      "Identified 3 resolver patterns ready for template extraction",
    ],
    patternsFound: 14,
    memoryConsolidated: 847,
    duration: "12m 34s",
    improvement: "+4.2% code reuse score",
  },
  {
    id: "DC-046",
    phase: "Deep",
    title: "Security Heuristic Refinement",
    insights: [
      "Cross-referenced 2,140 DEFENSE evaluations from past 72h",
      "Reduced false positive rate from 3.1% → 1.7%",
      "New pattern: JWT validation bypass attempts cluster at 02:00–04:00 UTC",
    ],
    patternsFound: 7,
    memoryConsolidated: 2140,
    duration: "8m 12s",
    improvement: "+1.4% threat detection accuracy",
  },
  {
    id: "DC-045",
    phase: "Light",
    title: "Performance Baseline Update",
    insights: [
      "Recalculated P95 latency baselines across all 40 primitives",
      "Flagged NEXUS routing as 23% slower than 7-day average",
      "Recommended cache warming for MEMORY.semantic_search",
    ],
    patternsFound: 3,
    memoryConsolidated: 12400,
    duration: "4m 51s",
    improvement: "Baseline refresh complete",
  },
];

const phaseConfig = {
  REM: { icon: <Moon className="w-3.5 h-3.5" />, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  Deep: { icon: <Brain className="w-3.5 h-3.5" />, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  Light: { icon: <Sun className="w-3.5 h-3.5" />, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
};

interface DreamEngineDemoProps {
  onBack: () => void;
}

export const DreamEngineDemo = ({ onBack }: DreamEngineDemoProps) => {
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  const [dreaming, setDreaming] = useState(false);
  const [dreamProgress, setDreamProgress] = useState(0);

  const simulateDream = useCallback(() => {
    setDreaming(true);
    setDreamProgress(0);
    const interval = setInterval(() => {
      setDreamProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setDreaming(false), 500);
          return 100;
        }
        return p + 2;
      });
    }, 60);
  }, []);

  const activeCycle = DREAM_CYCLES.find((c) => c.id === selectedCycle);
  const pc = (phase: string) => phaseConfig[phase as keyof typeof phaseConfig] ?? phaseConfig.Light;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Showcase
        </button>
        <span className="text-[10px] font-mono text-muted-foreground">TIER 2 · DREAM ENGINE</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">DREAM Engine</h1>
              <p className="text-xs text-muted-foreground">Background Learning & Memory Consolidation</p>
            </div>
          </div>
        </motion.div>

        {/* What You're Seeing */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-primary">What You're Seeing</p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            During idle time, the system enters <span className="font-semibold text-foreground">dream cycles</span> —
            consolidating memories, finding patterns across modules, and synthesizing improvements.
            Like biological sleep, this is where learning becomes permanent.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Dream Cycles (24h)", value: "12", icon: <Moon className="w-3.5 h-3.5" /> },
              { label: "Patterns Found", value: "24", icon: <Sparkles className="w-3.5 h-3.5" /> },
              { label: "Memories Consolidated", value: "15.4K", icon: <Brain className="w-3.5 h-3.5" /> },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-muted/50 border border-border p-3 text-center space-y-1">
                <div className="flex items-center justify-center text-primary">{s.icon}</div>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trigger Dream */}
        {dreaming && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-foreground">Dream cycle in progress…</span>
            </div>
            <Progress value={dreamProgress} className="h-2" />
            <p className="text-[10px] font-mono text-muted-foreground">
              {dreamProgress < 30 ? "Scanning recent activity…" : dreamProgress < 60 ? "Finding patterns…" : dreamProgress < 90 ? "Consolidating memories…" : "Synthesis complete"}
            </p>
          </motion.div>
        )}

        {!dreaming && (
          <div className="text-center">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={simulateDream}>
              <Moon className="w-3.5 h-3.5" />
              Trigger Dream Cycle
            </Button>
          </div>
        )}

        {/* Recent Cycles */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Recent Dream Cycles</p>

          {DREAM_CYCLES.map((cycle, idx) => {
            const isSelected = selectedCycle === cycle.id;
            const phase = pc(cycle.phase);

            return (
              <motion.div
                key={cycle.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.08 }}
                className={`rounded-xl border bg-card overflow-hidden transition-colors cursor-pointer ${
                  isSelected ? "border-primary/40" : "border-border hover:border-primary/20"
                }`}
                onClick={() => setSelectedCycle(isSelected ? null : cycle.id)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground">{cycle.id}</span>
                        <span className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border ${phase.color}`}>
                          {phase.icon}
                          {cycle.phase}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">{cycle.title}</h3>
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
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Insights Discovered</p>
                        {cycle.insights.map((insight, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                            <CheckCircle className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                            {insight}
                          </div>
                        ))}
                        <div className="flex items-center gap-4 pt-1 text-[10px] text-muted-foreground">
                          <span>{cycle.memoryConsolidated.toLocaleString()} memories processed</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Why It Matters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Why It Matters</p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              The system improves during downtime — no human intervention, no cost. Like sleep for
              biological brains, dream cycles consolidate learning and surface latent patterns.
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Business Value</p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Compound intelligence. The system gets measurably smarter every day. Each dream cycle
              reduces future costs and increases capability — without hiring.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
