/**
 * Evolution Cycle Report — 30-Run Results Dashboard
 * Shows aggregate stats, per-run breakdown, and trend analysis
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown, Minus, Zap, DollarSign, Brain, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface CycleRun {
  run: number;
  cat: string;
  target: string;
  quality: 'apply' | 'improve' | 'reject';
  summary: string;
  tokens: number;
  cost: number;
  constraintAdded?: string;
}

interface PhaseStats {
  phase: number;
  apply: number;
  improve: number;
  reject: number;
  rate: number;
}

const REPORT_DATA = {
  summary: {
    totalRuns: 30,
    applied: 3,
    improved: 27,
    rejected: 0,
    applyRate: 10,
    totalCost: "0.004610",
    totalTokens: 11340,
    avgCostPerRun: "0.000154",
    constraintsLearned: 1,
  },
  trend: {
    phase1: { phase: 1, apply: 3, improve: 7, reject: 0, rate: 30 } as PhaseStats,
    phase2: { phase: 2, apply: 0, improve: 10, reject: 0, rate: 0 } as PhaseStats,
    phase3: { phase: 3, apply: 0, improve: 10, reject: 0, rate: 0 } as PhaseStats,
    improving: false,
  },
  runs: [
    { run: 0, cat: "fix", target: "shadowExecution.ts", quality: "improve" as const, summary: "Added input validation for mutation object null checks", tokens: 249, cost: 0.000085, constraintAdded: "Uses `any` type — avoid this pattern" },
    { run: 1, cat: "optimize", target: "evolutionTelemetry.ts", quality: "improve" as const, summary: "Optimized telemetry event handling with const declarations", tokens: 474, cost: 0.000219 },
    { run: 2, cat: "refactor", target: "probe.ts", quality: "apply" as const, summary: "Refactored executeProbe for readability + defensive checks", tokens: 381, cost: 0.000163 },
    { run: 3, cat: "harden", target: "rules.ts", quality: "apply" as const, summary: "Added input validation and error handling for rule registration", tokens: 454, cost: 0.000206 },
    { run: 4, cat: "suggest", target: "regression-detection.ts", quality: "apply" as const, summary: "Improved type safety with const + type annotations", tokens: 485, cost: 0.000225 },
    { run: 5, cat: "fix", target: "shadowExecution.ts", quality: "improve" as const, summary: "Replaced 'any' with 'unknown' + type validation for mutations", tokens: 358, cost: 0.000141 },
    { run: 6, cat: "optimize", target: "evolutionTelemetry.ts", quality: "improve" as const, summary: "Replaced 'any' with specific type definition for events", tokens: 295, cost: 0.000103 },
    { run: 7, cat: "refactor", target: "probe.ts", quality: "improve" as const, summary: "Replaced 'any' types with specific interfaces", tokens: 435, cost: 0.000186 },
    { run: 8, cat: "harden", target: "rules.ts", quality: "improve" as const, summary: "Refactored Rule interface to be generic for type-safe rules", tokens: 426, cost: 0.00018 },
    { run: 9, cat: "suggest", target: "regression-detection.ts", quality: "improve" as const, summary: "Refined types replacing 'any' with specifics + defensive code", tokens: 440, cost: 0.000189 },
    { run: 10, cat: "fix", target: "shadowExecution.ts", quality: "improve" as const, summary: "Replaced 'any' with specific types for type safety", tokens: 297, cost: 0.000104 },
    { run: 11, cat: "optimize", target: "evolutionTelemetry.ts", quality: "improve" as const, summary: "Replaced 'any' with specific types for telemetryData", tokens: 343, cost: 0.000132 },
    { run: 12, cat: "refactor", target: "probe.ts", quality: "improve" as const, summary: "Replaced any with 'unknown' + added defensive checks", tokens: 402, cost: 0.000167 },
    { run: 13, cat: "harden", target: "rules.ts", quality: "improve" as const, summary: "Used generics instead of `any` + added validation", tokens: 463, cost: 0.000202 },
    { run: 14, cat: "suggest", target: "regression-detection.ts", quality: "improve" as const, summary: "Added 'RegressionData' interface replacing 'any'", tokens: 370, cost: 0.000147 },
    { run: 15, cat: "fix", target: "shadowExecution.ts", quality: "improve" as const, summary: "Added 'Mutation' interface replacing 'any' type", tokens: 338, cost: 0.000129 },
    { run: 16, cat: "optimize", target: "evolutionTelemetry.ts", quality: "improve" as const, summary: "Replaced 'any' with specific interface for events", tokens: 354, cost: 0.000138 },
    { run: 17, cat: "refactor", target: "probe.ts", quality: "improve" as const, summary: "Added 'Candidate' type replacing 'any'", tokens: 406, cost: 0.000169 },
    { run: 18, cat: "harden", target: "rules.ts", quality: "improve" as const, summary: "Added type checks in registerRule and applyRule", tokens: 451, cost: 0.000195 },
    { run: 19, cat: "suggest", target: "regression-detection.ts", quality: "improve" as const, summary: "Replaced 'any' with specific type + added validation", tokens: 360, cost: 0.000141 },
    { run: 20, cat: "fix", target: "shadowExecution.ts", quality: "improve" as const, summary: "Replaced 'any' with specific types for correctness", tokens: 274, cost: 0.000091 },
    { run: 21, cat: "optimize", target: "evolutionTelemetry.ts", quality: "improve" as const, summary: "Added 'TelemetryEvent' interface for type safety", tokens: 317, cost: 0.000116 },
    { run: 22, cat: "refactor", target: "probe.ts", quality: "improve" as const, summary: "Added ProbeData interface + validation", tokens: 451, cost: 0.000196 },
    { run: 23, cat: "harden", target: "rules.ts", quality: "improve" as const, summary: "Replaced `any` with specific types + rule validation", tokens: 435, cost: 0.000185 },
    { run: 24, cat: "suggest", target: "regression-detection.ts", quality: "improve" as const, summary: "Replaced 'any' with specific type for data parameter", tokens: 294, cost: 0.000101 },
    { run: 25, cat: "fix", target: "shadowExecution.ts", quality: "improve" as const, summary: "Replaced 'any' with specific interfaces for clarity", tokens: 284, cost: 0.000097 },
    { run: 26, cat: "optimize", target: "evolutionTelemetry.ts", quality: "improve" as const, summary: "Replaced 'any' with specific type for event parameter", tokens: 285, cost: 0.000097 },
    { run: 27, cat: "refactor", target: "probe.ts", quality: "improve" as const, summary: "Replaced 'any' with specific candidate interface", tokens: 410, cost: 0.000171 },
    { run: 28, cat: "harden", target: "rules.ts", quality: "improve" as const, summary: "Made LearningRule generic, removing 'any' usage", tokens: 447, cost: 0.000193 },
    { run: 29, cat: "suggest", target: "regression-detection.ts", quality: "improve" as const, summary: "Replaced 'any' with Array<number> for data parameter", tokens: 362, cost: 0.000142 },
  ] as CycleRun[],
  diagnosis: {
    rootCause: "Model lacks file context — hallucinates `any` types that don't exist in the actual code, then gets stuck fixing its own hallucination.",
    fix: "Inject actual file content into the prompt so GPT patches real code, not imagined code.",
    positives: [
      "3 early patches were genuinely applicable (probe refactor, rules hardening, regression types)",
      "Zero rejected patches — JSON format compliance was 100%",
      "Cost stayed at $0.00015/run avg — 333x under $0.05 ceiling",
    ],
    negatives: [
      "Apply rate dropped from 30% → 0% across phases — model degraded",
      "Single learned constraint ('any' type) became a self-fulfilling prophecy",
      "Without file context, diversity collapsed into repetitive type-fix suggestions",
    ],
  },
};

function QualityBadge({ quality }: { quality: string }) {
  switch (quality) {
    case 'apply': return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">✓ Applied</Badge>;
    case 'improve': return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">⚠ Improve</Badge>;
    case 'reject': return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">✗ Rejected</Badge>;
    default: return <Badge variant="outline">{quality}</Badge>;
  }
}

function CategoryBadge({ cat }: { cat: string }) {
  const colors: Record<string, string> = {
    fix: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    optimize: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    refactor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    harden: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    suggest: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  };
  return <Badge className={colors[cat] || ""}>{cat}</Badge>;
}

export default function EvolutionCycleReport() {
  const d = REPORT_DATA;

  return (
    <div className="space-y-6 p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Evolution Cycle Report</h1>
        <p className="text-sm text-muted-foreground">30 GPT-4o-mini cycles · Adaptive learning · Quality gated</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{d.summary.totalRuns}</div>
            <div className="text-xs text-muted-foreground">Total Runs</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{d.summary.applied}</div>
            <div className="text-xs text-muted-foreground">Patches Applied</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{d.summary.improved}</div>
            <div className="text-xs text-muted-foreground">Needs Improvement</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">${d.summary.totalCost}</div>
            <div className="text-xs text-muted-foreground">Total Cost</div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {d.trend.improving ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
            Trend Analysis — {d.trend.improving ? "Improving" : "Degrading"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[d.trend.phase1, d.trend.phase2, d.trend.phase3].map((p) => (
            <div key={p.phase} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Phase {p.phase} (runs {(p.phase - 1) * 10}–{p.phase * 10 - 1})</span>
                <span className="font-mono text-foreground">{p.rate}% apply rate</span>
              </div>
              <Progress value={p.rate} className="h-2" />
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className="text-emerald-400">✓ {p.apply}</span>
                <span className="text-amber-400">⚠ {p.improve}</span>
                <span className="text-red-400">✗ {p.reject}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Diagnosis */}
      <Card className="bg-card border-red-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            Diagnosis & Root Cause
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm font-medium text-destructive">{d.diagnosis.rootCause}</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm font-medium text-primary flex items-center gap-2">
              <ArrowRight className="w-3 h-3" /> {d.diagnosis.fix}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Positives</p>
              {d.diagnosis.positives.map((p, i) => (
                <p key={i} className="text-xs text-muted-foreground pl-4">• {p}</p>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-amber-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Issues Found</p>
              {d.diagnosis.negatives.map((n, i) => (
                <p key={i} className="text-xs text-muted-foreground pl-4">• {n}</p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Cost Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-mono text-foreground">${d.summary.avgCostPerRun}</div>
              <div className="text-xs text-muted-foreground">Avg per run</div>
            </div>
            <div>
              <div className="text-lg font-mono text-foreground">{d.summary.totalTokens.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total tokens</div>
            </div>
            <div>
              <div className="text-lg font-mono text-emerald-400">333x</div>
              <div className="text-xs text-muted-foreground">Under $0.05 ceiling</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Runs */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> All 30 Runs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {d.runs.map((r) => (
                <div key={r.run} className="flex items-start gap-3 p-2 rounded border border-border/50 hover:bg-muted/30 transition-colors">
                  <span className="text-xs font-mono text-muted-foreground w-6 shrink-0 pt-0.5">#{r.run}</span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CategoryBadge cat={r.cat} />
                      <QualityBadge quality={r.quality} />
                      <span className="text-xs text-muted-foreground font-mono">{r.target}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{r.summary}</p>
                    {r.constraintAdded && (
                      <p className="text-[10px] text-amber-400/80 italic">+ Constraint learned: {r.constraintAdded}</p>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">${r.cost.toFixed(6)}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-card border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Next Evolution Improvement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Action Required:</strong> Inject actual file contents into the GPT prompt. 
            The model is currently operating blind — it doesn't see the real code, so it hallucinates problems 
            (like `any` types) that don't exist. With file context, the apply rate should climb from 10% to 60%+.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
