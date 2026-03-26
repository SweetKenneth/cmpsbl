/**
 * Evolution Cycle Report — 265-Run Results Dashboard
 * Batch 1 (35 runs, no context) · Batch 2 (30 runs, file context) · Batch 3 (100 runs, NEXUS) · Batch 4 (100 runs, GPT-4o-mini enforced)
 * Fully mobile-readable, zero truncation
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Zap, Brain, AlertTriangle, CheckCircle, BarChart3, Server, Shield, GitBranch, DollarSign } from 'lucide-react';
import { useState } from 'react';

const BATCH1 = { totalRuns: 35, applied: 6, failed: 29, applyRate: 17, totalTokens: 12893, totalCost: 0.005326, model: 'gpt-4o-mini' };
const BATCH2 = { totalRuns: 30, applied: 30, failed: 0, applyRate: 100, totalTokens: 40669, totalCost: 0.007668, model: 'gpt-4o-mini' };
const BATCH3 = { totalRuns: 100, applied: 56, failed: 44, applyRate: 56, totalTokens: 119735, totalCost: 0, model: 'NEXUS (Cerebras/Groq)' };
const BATCH4 = { totalRuns: 100, applied: 33, failed: 67, applyRate: 33, totalTokens: 188594, totalCost: 0.037252, model: 'gpt-4o-mini (enforced)' };

const BATCH4_PHASES = [
  { name: "Phase 1 (1–25)", applied: 18, failed: 7, total: 25, applyRate: 72 },
  { name: "Phase 2 (26–50)", applied: 5, failed: 20, total: 25, applyRate: 20 },
  { name: "Phase 3 (51–75)", applied: 8, failed: 17, total: 25, applyRate: 32 },
  { name: "Phase 4 (76–100)", applied: 2, failed: 23, total: 25, applyRate: 8 },
];

const BATCH4_FAILURES: Record<string, number> = {
  "Duplicate patch (dedup gate)": 58,
  "BEFORE===AFTER (no-op)": 8,
  "Timeout / API error": 1,
};

const BATCH4_APPLIED = [
  { file: "circuit-breaker.ts", count: 8, issues: [
    "Handle null values in circuit status", "Incorrect state handling in getCircuitStatus",
    "Incorrect type assertion for state", "Incorrect handling of auto_reset_after",
    "auto_reset_after type in getCircuitStatus", "auto_reset_after in resetCircuit",
    "Handle potential null auto_reset_after", "auto_reset_after type check"
  ]},
  { file: "regression-detection.ts", count: 5, issues: [
    "Division by zero in volatility", "Incorrect trend direction assignment",
    "Incorrect volatility calculation", "Empty array volatility handling",
    "Threshold comparison in trend direction"
  ]},
  { file: "eligibility-gate.ts", count: 5, issues: [
    "Null data in checkDependencies", "Undefined in captureBaselineHealth",
    "Missing dependency checks", "Missing health check", "Missing health check fallback"
  ]},
  { file: "dry-run-preview.ts", count: 3, issues: [
    "Division by zero in avg confidence", "Incorrect avg confidence calc", "assessRisk avg confidence"
  ]},
  { file: "evolutionTelemetry.ts", count: 4, issues: [
    "NaN in successRate", "Incorrect avgTimeToPromote", "Event type handling", "eventCounter overflow"
  ]},
  { file: "entropy-budget.ts", count: 2, issues: [
    "Undefined access in checkEntropyBudget", "Incorrect remaining calculation"
  ]},
  { file: "self-repair.ts", count: 1, issues: ["Type assertion for actions_taken"] },
  { file: "write-guard.ts", count: 1, issues: ["Write timeout logic"] },
  { file: "entropy-ledger.ts", count: 1, issues: ["Incorrect trend direction logic"] },
  { file: "snapshot-retention.ts", count: 3, issues: [
    "Undefined policy in evaluateRetention", "Incorrect retention evaluation", "maxSnapshotsPerTenant logic"
  ]},
];

// Combined from Batch 3
const BATCH3_UNIQUE_FINDINGS: Record<string, { issue: string; cat: string; risk: string }[]> = {
  "shadowExecution.ts": [{ issue: "Null pointer in detectRegressions when diff.after is undefined", cat: "fix", risk: "low" }],
  "evolutionTelemetry.ts": [
    { issue: "Switch statement optimizable with Map for O(1) lookups", cat: "optimize", risk: "low" },
    { issue: "Missing velocity_requested tracking in accumulators", cat: "harden", risk: "low" },
    { issue: "clearEvolutionTelemetry uses Object.keys cast — fragile reset", cat: "refactor", risk: "low" },
  ],
  "regression-detection.ts": [
    { issue: "Division by zero in linearTrend when denom is 0", cat: "harden", risk: "low" },
    { issue: "volatility returns NaN for single-element arrays", cat: "fix", risk: "low" },
    { issue: "detectRegression missing early return for empty array input", cat: "harden", risk: "low" },
    { issue: "consecutiveDeclines loop counts from end but doesn't cap", cat: "optimize", risk: "low" },
    { issue: "regressionScore can exceed 1.0 before final clamp", cat: "fix", risk: "low" },
    { issue: "shouldBlockPromotion doesn't check regressionScore threshold", cat: "suggest", risk: "low" },
  ],
  "rules.ts": [
    { issue: "Confidence not clamped in recordRuleOutcome", cat: "refactor", risk: "low" },
    { issue: "contributeRule doesn't validate empty repairStrategy", cat: "harden", risk: "low" },
    { issue: "applyRule always returns applied:false — dead code", cat: "refactor", risk: "low" },
    { issue: "ruleCounter never resets — grows unbounded", cat: "optimize", risk: "low" },
    { issue: "Auto-demote threshold doesn't account for low invocation count", cat: "harden", risk: "low" },
  ],
  "circuit-breaker.ts": [
    { issue: "parseInterval doesn't handle 'days' or 'seconds'", cat: "harden", risk: "low" },
    { issue: "getCircuitStatus calls resetCircuit recursively", cat: "fix", risk: "medium" },
    { issue: "tripCircuit neq filter updates ALL rows", cat: "fix", risk: "medium" },
  ],
};

const TOTAL_B3 = Object.values(BATCH3_UNIQUE_FINDINGS).reduce((s, a) => s + a.length, 0);
const TOTAL_B4 = BATCH4_APPLIED.reduce((s, f) => s + f.count, 0);

function CategoryBadge({ cat }: { cat: string }) {
  const colors: Record<string, string> = {
    fix: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    optimize: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    refactor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    harden: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    suggest: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  };
  return <Badge className={`${colors[cat] || ""} text-[11px] shrink-0`}>{cat}</Badge>;
}

function StatBox({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="text-center p-2">
      <div className="text-base sm:text-lg font-mono font-bold text-foreground break-all">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

export default function EvolutionCycleReport() {
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [expandedB4, setExpandedB4] = useState<string | null>(null);
  const combinedRuns = BATCH1.totalRuns + BATCH2.totalRuns + BATCH3.totalRuns + BATCH4.totalRuns;
  const combinedApplied = BATCH1.applied + BATCH2.applied + BATCH3.applied + BATCH4.applied;
  const combinedCost = BATCH1.totalCost + BATCH2.totalCost + BATCH3.totalCost + BATCH4.totalCost;

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 max-w-5xl mx-auto pb-8">
      {/* Header */}
      <div className="text-center space-y-1 pt-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Evolution Cycle Report</h1>
        <p className="text-xs sm:text-sm text-muted-foreground break-words">
          {combinedRuns} total cycles · {combinedApplied} patches applied · ${combinedCost.toFixed(4)} total cost
        </p>
      </div>

      {/* Grand Summary */}
      <Card className="bg-card border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary shrink-0" />
            <span className="break-words">Cumulative — {combinedRuns} Runs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatBox value={combinedRuns} label="Total runs" />
            <StatBox value={combinedApplied} label="Patches applied" />
            <StatBox value={`${Math.round((combinedApplied / combinedRuns) * 100)}%`} label="Overall apply rate" />
            <StatBox value={`$${combinedCost.toFixed(4)}`} label="Total cost" />
          </div>
        </CardContent>
      </Card>

      {/* 4 Batch Comparison */}
      <div className="grid gap-3 sm:gap-4">
        {[
          { label: "Batch 1 — No File Context", data: BATCH1, color: "border-destructive/30", icon: <TrendingDown className="w-4 h-4 text-destructive shrink-0" />, rateColor: "text-destructive" },
          { label: "Batch 2 — File Context Injected", data: BATCH2, color: "border-emerald-500/30", icon: <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />, rateColor: "text-emerald-400" },
          { label: "Batch 3 — NEXUS Free-Tier (deprecated)", data: BATCH3, color: "border-amber-500/30", icon: <Server className="w-4 h-4 text-amber-400 shrink-0" />, rateColor: "text-amber-400" },
          { label: "Batch 4 — GPT-4o-mini Enforced", data: BATCH4, color: "border-primary/30", icon: <Brain className="w-4 h-4 text-primary shrink-0" />, rateColor: "text-primary" },
        ].map((b, i) => (
          <Card key={i} className={`bg-card ${b.color}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {b.icon}
                <span className="break-words">{b.label}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-2xl sm:text-3xl font-bold ${b.rateColor}`}>{b.data.applyRate}%</span>
                <span className="text-xs text-muted-foreground">apply rate</span>
              </div>
              <Progress value={b.data.applyRate} className="h-2 mb-2" />
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span><span className="text-emerald-400 font-bold">{b.data.applied}</span> applied</span>
                <span><span className="text-red-400 font-bold">{b.data.failed}</span> failed</span>
                <span>{b.data.totalTokens.toLocaleString()} tokens</span>
                <span>${b.data.totalCost.toFixed(4)}</span>
                <span className="text-primary">{b.data.model}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Batch 4 Phase Trajectory */}
      <Card className="bg-card border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary shrink-0" />
            <span className="break-words">Batch 4 — Phase Trajectory (GPT-4o-mini)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {BATCH4_PHASES.map((p, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="text-muted-foreground break-words min-w-0">{p.name}</span>
                <span className="font-mono text-foreground shrink-0">{p.applyRate}% ({p.applied}/{p.total})</span>
              </div>
              <Progress value={p.applyRate} className="h-1.5" />
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground pt-1 break-words">
            Phase 1 found 18 unique issues. Rate declined as the dedup gate rejected repeated findings — expected exhaustion curve.
          </p>
        </CardContent>
      </Card>

      {/* Batch 4 Failure Breakdown */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-destructive shrink-0" />
            <span className="break-words">Batch 4 — Failure Breakdown ({BATCH4.failed} rejected)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(BATCH4_FAILURES).map(([reason, count], i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="font-mono text-destructive shrink-0 w-8 text-right">{count}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground break-words">{reason}</p>
                  <Progress value={Math.round((count / BATCH4.failed) * 100)} className="h-1 mt-1" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 break-words">
            87% of failures were duplicates — the model found the same issues repeatedly. Dedup gate working correctly.
          </p>
        </CardContent>
      </Card>

      {/* Batch 4 Applied Patches */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="break-words">Batch 4 — {TOTAL_B4} Patches Across 10 Files (GPT-4o-mini)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {BATCH4_APPLIED.map((f) => (
              <div key={f.file} className="border border-border/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedB4(expandedB4 === f.file ? null : f.file)}
                  className="w-full flex items-center justify-between p-2 sm:p-3 hover:bg-muted/30 transition-colors text-left"
                >
                  <span className="text-xs font-mono text-primary break-all">{f.file}</span>
                  <Badge variant="outline" className="text-[10px] shrink-0 ml-2">{f.count} fixes</Badge>
                </button>
                {expandedB4 === f.file && (
                  <div className="border-t border-border/30 p-2 sm:p-3 space-y-1">
                    {f.issues.map((issue, i) => (
                      <div key={i} className="flex items-start gap-2 p-1.5 rounded bg-muted/20">
                        <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground break-words">{issue}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Batch 3 Findings (from NEXUS — preserved for history) */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="break-words">Batch 3 — {TOTAL_B3} Findings (NEXUS, historical)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(BATCH3_UNIQUE_FINDINGS).map(([file, findings]) => (
              <div key={file} className="border border-border/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFile(expandedFile === file ? null : file)}
                  className="w-full flex items-center justify-between p-2 sm:p-3 hover:bg-muted/30 transition-colors text-left"
                >
                  <span className="text-xs font-mono text-primary break-all">{file}</span>
                  <Badge variant="outline" className="text-[10px] shrink-0 ml-2">{findings.length}</Badge>
                </button>
                {expandedFile === file && (
                  <div className="border-t border-border/30 p-2 sm:p-3 space-y-2">
                    {findings.map((f, i) => (
                      <div key={i} className="flex flex-col gap-1 p-2 rounded bg-muted/20">
                        <CategoryBadge cat={f.cat} />
                        <p className="text-xs text-foreground break-words">{f.issue}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Evolution Process Timeline */}
      <Card className="bg-card border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary shrink-0" />
            <span className="break-words">Evolution of the Evolution Process</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Batch 1: Blind prompting", detail: "No file context. GPT hallucinated issues. 17% apply rate.", icon: <AlertTriangle className="w-3 h-3 text-destructive shrink-0" /> },
            { label: "Batch 2: File context injection", detail: "Injected real source code. 100% apply rate. 5 target files.", icon: <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" /> },
            { label: "Batch 3: NEXUS free-tier (deprecated)", detail: "56 patches across 15 files via Cerebras/Groq. Deprecated — free tier not trusted for substrate.", icon: <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" /> },
            { label: "Batch 4: GPT-4o-mini enforced", detail: "Hard-locked to OpenAI. 33 patches across 10 files. $0.037 total. Dedup gate caught 58 duplicates.", icon: <CheckCircle className="w-3 h-3 text-primary shrink-0" /> },
          ].map((step, i) => (
            <div key={i} className="p-2 sm:p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-start gap-2">
                {step.icon}
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-foreground break-words">{step.label}</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground break-words">{step.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Full Trajectory */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary shrink-0" />
            <span className="break-words">Full Trajectory — All {combinedRuns} Runs</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { label: "Batch 1 (35 runs, no context)", rate: 17, color: "text-destructive" },
            { label: "Batch 2 (30 runs, file context)", rate: 100, color: "text-emerald-400" },
            { label: "Batch 3 Phase 1 (25 runs, NEXUS)", rate: 84, color: "text-emerald-400" },
            { label: "Batch 3 Phase 2 (25 runs)", rate: 56, color: "text-primary" },
            { label: "Batch 3 Phase 3 (25 runs)", rate: 48, color: "text-amber-400" },
            { label: "Batch 3 Phase 4 (25 runs)", rate: 36, color: "text-amber-400" },
            { label: "Batch 4 Phase 1 (25 runs, GPT)", rate: 72, color: "text-emerald-400" },
            { label: "Batch 4 Phase 2 (25 runs)", rate: 20, color: "text-amber-400" },
            { label: "Batch 4 Phase 3 (25 runs)", rate: 32, color: "text-amber-400" },
            { label: "Batch 4 Phase 4 (25 runs)", rate: 8, color: "text-destructive" },
          ].map((p, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="text-muted-foreground break-words min-w-0">{p.label}</span>
                <span className={`font-mono font-bold shrink-0 ${p.color}`}>{p.rate}%</span>
              </div>
              <Progress value={p.rate} className="h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Learned Constraints */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary shrink-0" />
            <span className="break-words">Adaptive Constraints (learned across {combinedRuns} runs)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {[
              "NEVER use `any` type — use specific types from existing code",
              "Do NOT add new imports from packages not already imported",
              "Reference actual variable names and line content from source",
              "Each patch must have concrete before/after code",
              "Focus on one specific, real issue per patch",
              "Do NOT change exported interfaces unless fixing a bug",
              "BEFORE block must be EXACT copy from source",
              "Do NOT suggest changes already present in the code",
              "Find a DIFFERENT issue each time (dedup gate)",
              "BEFORE and AFTER blocks must differ",
              "Do NOT hallucinate functions or variables not in the file",
              "Only fix real bugs, add real guards, or optimize real inefficiencies",
            ].map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-xs p-1.5 rounded bg-muted/20">
                <span className="text-primary font-mono shrink-0">{i + 1}.</span>
                <span className="text-muted-foreground break-words">{c}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Analysis */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="break-words">Cost Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Batch 1", cost: BATCH1.totalCost, runs: BATCH1.totalRuns },
              { label: "Batch 2", cost: BATCH2.totalCost, runs: BATCH2.totalRuns },
              { label: "Batch 3", cost: BATCH3.totalCost, runs: BATCH3.totalRuns },
              { label: "Batch 4", cost: BATCH4.totalCost, runs: BATCH4.totalRuns },
            ].map((b, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="text-sm font-bold text-foreground">{b.label}</div>
                <div className="text-xs text-muted-foreground">${b.cost.toFixed(4)} / {b.runs} runs</div>
                <div className="text-[11px] text-primary">${(b.cost / b.runs).toFixed(5)}/run</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 break-words">
            Total spend across {combinedRuns} runs: ${combinedCost.toFixed(4)} — average ${(combinedCost / combinedRuns).toFixed(5)}/run
          </p>
        </CardContent>
      </Card>

      {/* Verdict */}
      <Card className="bg-emerald-500/5 border-emerald-500/30">
        <CardContent className="p-4 space-y-2">
          <p className="text-base sm:text-lg font-bold text-emerald-400 text-center">✓ Evolution Process Validated — {combinedRuns} Runs</p>
          <div className="text-xs sm:text-sm text-muted-foreground space-y-1 break-words">
            <p>{combinedApplied} patches approved across 4 batches. GPT-4o-mini is now the permanent, enforced model for all evolution operations.</p>
            <p>Key insight: Apply rate naturally declines as novel issues per file are exhausted — the dedup gate correctly prevents redundant patches. Batch 4 found 33 unique issues across 10 new target files at $0.037 total.</p>
            <p>Next steps: Rotate to new target files to discover fresh issues. Consider increasing target file diversity or adding deeper analysis prompts for already-scanned files.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
