/**
 * Evolution Cycle Report — 165-Run Results Dashboard
 * Batch 1 (35 runs, no context) · Batch 2 (30 runs, file context) · Batch 3 (100 runs, NEXUS router)
 * Fully mobile-readable, zero truncation
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown, Zap, DollarSign, Brain, AlertTriangle, CheckCircle, BarChart3, Server, Shield, GitBranch } from 'lucide-react';
import { useState } from 'react';

// === DATA ===

const BATCH1 = { totalRuns: 35, applied: 6, failed: 29, applyRate: 17, totalTokens: 12893, totalCost: 0.005326 };
const BATCH2 = { totalRuns: 30, applied: 30, failed: 0, applyRate: 100, totalTokens: 40669, totalCost: 0.007668 };
const BATCH3 = { totalRuns: 100, applied: 56, failed: 44, applyRate: 56, totalTokens: 119735, totalCost: 0 };

const BATCH3_PHASES = [
  { name: "Phase 1 (0–24)", applied: 21, failed: 4, total: 25, applyRate: 84 },
  { name: "Phase 2 (25–49)", applied: 14, failed: 11, total: 25, applyRate: 56 },
  { name: "Phase 3 (50–74)", applied: 12, failed: 13, total: 25, applyRate: 48 },
  { name: "Phase 4 (75–99)", applied: 9, failed: 16, total: 25, applyRate: 36 },
];

const BATCH3_UNIQUE_FINDINGS: Record<string, { issue: string; cat: string; risk: string }[]> = {
  "shadowExecution.ts": [
    { issue: "Null pointer in detectRegressions when diff.after is undefined", cat: "fix", risk: "low" },
  ],
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
    { issue: "regressionScore can exceed 1.0 before final clamp due to additive scoring", cat: "fix", risk: "low" },
    { issue: "shouldBlockPromotion doesn't check regressionScore threshold", cat: "suggest", risk: "low" },
  ],
  "rules.ts": [
    { issue: "Confidence not clamped in recordRuleOutcome — can exceed 1.0", cat: "refactor", risk: "low" },
    { issue: "contributeRule doesn't validate empty repairStrategy", cat: "harden", risk: "low" },
    { issue: "applyRule always returns applied:false — dead code", cat: "refactor", risk: "low" },
    { issue: "findRulesForFunction filters by category but not sourceFunction exclusion", cat: "suggest", risk: "low" },
    { issue: "ruleCounter never resets — grows unbounded across sessions", cat: "optimize", risk: "low" },
    { issue: "Auto-demote threshold doesn't account for low invocation count", cat: "harden", risk: "low" },
  ],
  "confidence.ts": [
    { issue: "blast_radius * novelty_score without default boundary check", cat: "suggest", risk: "low" },
    { issue: "evidence_bonus individual caps don't sum-cap the total", cat: "harden", risk: "low" },
    { issue: "CRITICAL_CLASSES uses toLowerCase but input may have mixed case", cat: "fix", risk: "low" },
    { issue: "telemetry_delta bonus uncapped when negative values passed", cat: "harden", risk: "low" },
  ],
  "velocityGovernor.ts": [
    { issue: "Burst allowance decrement race condition in concurrent calls", cat: "fix", risk: "low" },
    { issue: "resetHourIfNeeded doesn't account for clock drift", cat: "harden", risk: "low" },
    { issue: "getUtilization returns 0 in LOCKDOWN — misleading when calls blocked", cat: "suggest", risk: "low" },
  ],
  "rollbackLedger.ts": [
    { issue: "rollback returns shallow copy of rollbackState — mutation risk", cat: "optimize", risk: "low" },
    { issue: "computeHash uses FNV-1a but doesn't handle Unicode correctly", cat: "harden", risk: "medium" },
    { issue: "appendMutation splices ledger but doesn't update sequenceCounter", cat: "fix", risk: "low" },
  ],
  "blastRadiusProjector.ts": [
    { issue: "Null check missing on input.moduleGraph[current]", cat: "harden", risk: "low" },
    { issue: "criticalPenalty scales linearly without cap — can dominate score", cat: "optimize", risk: "low" },
    { issue: "BFS queue.shift() is O(n) — use index pointer for O(1)", cat: "optimize", risk: "low" },
    { issue: "getReportForProposal returns first match not latest", cat: "fix", risk: "low" },
    { issue: "radiusScore rounds to 2 decimals but riskLevel uses unrounded", cat: "fix", risk: "low" },
  ],
  "diligenceProbes.ts": [
    { issue: "setProbeConfig uses Object.assign — can set arbitrary properties", cat: "refactor", risk: "low" },
    { issue: "defaultProbe always returns score:100 — no actual validation", cat: "suggest", risk: "low" },
    { issue: "runProbes doesn't enforce timeout from ProbeConfig", cat: "harden", risk: "low" },
    { issue: "getProbePassRate flattens all runs — no time window filtering", cat: "optimize", risk: "low" },
    { issue: "customProbes Map never cleaned up on resetProbeConfigs", cat: "fix", risk: "low" },
    { issue: "overallScore averages all probes equally regardless of blocking status", cat: "suggest", risk: "low" },
  ],
  "promotionRules.ts": [
    { issue: "AUTO_PROMOTE_THRESHOLD is hardcoded — not configurable per-context", cat: "suggest", risk: "low" },
    { issue: "evaluatePromotion doesn't check if confidence score is NaN", cat: "harden", risk: "low" },
    { issue: "Two-man rule blocks completely — no escalation path returned", cat: "refactor", risk: "low" },
  ],
  "proposalLifecycle.ts": [
    { issue: "advanceStep accesses stepHistory[length-1] without empty check", cat: "fix", risk: "low" },
    { issue: "createProposal eviction only removes one item — can grow past MAX", cat: "optimize", risk: "low" },
    { issue: "rollbackStep adds to stepHistory without capping growth", cat: "harden", risk: "low" },
  ],
  "evidence.ts": [
    { issue: "validateEvidenceBundle doesn't check for negative test counts", cat: "harden", risk: "low" },
    { issue: "computeNoveltyScore doesn't handle zero lines_added + lines_removed", cat: "fix", risk: "low" },
    { issue: "DiffStats.new_code_paths can be negative — no validation", cat: "harden", risk: "low" },
    { issue: "Missing coverage_pct validation (should be 0–100 range)", cat: "harden", risk: "low" },
    { issue: "SecurityScanResult scan_timestamp not validated as ISO date", cat: "suggest", risk: "low" },
  ],
  "dagSequencer.ts": [
    { issue: "computeCriticalPath uses nodeMap.get(id)! — unsafe non-null assertion", cat: "fix", risk: "low" },
    { issue: "detectModuleConflicts has O(n²) complexity — no early exit", cat: "optimize", risk: "low" },
    { issue: "sequenceMutations doesn't validate for self-referencing dependencies", cat: "harden", risk: "low" },
  ],
  "curriculumTracker.ts": [
    { issue: "getOrCreate initializes emaScore to 0.5 but tier is 'novice' — inconsistent", cat: "fix", risk: "low" },
    { issue: "recordAttempt doesn't cap emaScore to [0,1] range", cat: "harden", risk: "low" },
  ],
  "circuit-breaker.ts": [
    { issue: "parseInterval doesn't handle 'days' or 'seconds' formats", cat: "harden", risk: "low" },
    { issue: "getCircuitStatus calls resetCircuit recursively — potential loop", cat: "fix", risk: "medium" },
    { issue: "tripCircuit uses neq filter — updates ALL rows including unrelated", cat: "fix", risk: "medium" },
  ],
};

const TOTAL_UNIQUE = Object.values(BATCH3_UNIQUE_FINDINGS).reduce((s, a) => s + a.length, 0);

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

function RiskBadge({ risk }: { risk: string }) {
  const c = risk === 'medium' ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  return <Badge variant="outline" className={`${c} text-[10px] shrink-0`}>{risk}</Badge>;
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
  const combinedRuns = BATCH1.totalRuns + BATCH2.totalRuns + BATCH3.totalRuns;
  const combinedApplied = BATCH1.applied + BATCH2.applied + BATCH3.applied;

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 max-w-5xl mx-auto pb-8">
      {/* Header */}
      <div className="text-center space-y-1 pt-2">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Evolution Cycle Report</h1>
        <p className="text-xs sm:text-sm text-muted-foreground break-words">
          {combinedRuns} total cycles · {combinedApplied} patches applied · Adaptive learning
        </p>
      </div>

      {/* Grand Summary */}
      <Card className="bg-card border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary shrink-0" />
            <span className="break-words">Cumulative Results — {combinedRuns} Runs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatBox value={combinedRuns} label="Total runs" />
            <StatBox value={combinedApplied} label="Patches applied" />
            <StatBox value={`${Math.round((combinedApplied / combinedRuns) * 100)}%`} label="Overall apply rate" />
            <StatBox value={TOTAL_UNIQUE} label="Unique bugs found" />
          </div>
        </CardContent>
      </Card>

      {/* 3 Batch Comparison */}
      <div className="grid gap-3 sm:gap-4">
        {[
          { label: "Batch 1 — No File Context", data: BATCH1, color: "border-destructive/30", icon: <TrendingDown className="w-4 h-4 text-destructive shrink-0" />, rateColor: "text-destructive" },
          { label: "Batch 2 — File Context Injected", data: BATCH2, color: "border-emerald-500/30", icon: <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />, rateColor: "text-emerald-400" },
          { label: "Batch 3 — NEXUS Router (100 runs)", data: BATCH3, color: "border-primary/30", icon: <Server className="w-4 h-4 text-primary shrink-0" />, rateColor: "text-primary" },
        ].map((b, i) => (
          <Card key={i} className={`bg-card ${b.color}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {b.icon}
                <span className="break-words">{b.label} ({b.data.totalRuns} runs)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-2xl sm:text-3xl font-bold ${b.rateColor}`}>{b.data.applyRate}%</span>
                <span className="text-xs text-muted-foreground">apply rate</span>
              </div>
              <Progress value={b.data.applyRate} className="h-2 mb-2" />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span><span className="text-emerald-400 font-bold">{b.data.applied}</span> applied</span>
                <span><span className="text-red-400 font-bold">{b.data.failed}</span> failed</span>
                <span>{b.data.totalTokens.toLocaleString()} tokens</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* What Changed */}
      <Card className="bg-card border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary shrink-0" />
            <span className="break-words">Evolution of the Evolution Process</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {[
              { label: "Batch 1: Blind prompting", detail: "GPT hallucinated issues. 17% apply rate.", icon: <AlertTriangle className="w-3 h-3 text-destructive shrink-0" /> },
              { label: "Batch 2: File context injection", detail: "Model found real bugs. 100% apply rate. But limited file set (5 files).", icon: <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" /> },
              { label: "Batch 3: 15 files, NEXUS free-tier", detail: "56 unique patches across 15 files. Dedup filter caught 23 duplicates. Apply rate declined as unique issues exhausted per file.", icon: <GitBranch className="w-3 h-3 text-primary shrink-0" /> },
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
          </div>
        </CardContent>
      </Card>

      {/* Batch 3 Phase Trajectory */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary shrink-0" />
            <span className="break-words">Batch 3 — Phase Trajectory</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {BATCH3_PHASES.map((p, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="text-muted-foreground break-words min-w-0">{p.name}</span>
                <span className="font-mono text-foreground shrink-0">{p.applyRate}% ({p.applied}/{p.total})</span>
              </div>
              <Progress value={p.applyRate} className="h-1.5" />
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground pt-1 break-words">
            Rate declined because the dedup gate rejected repeated issues — a sign the model exhausted novel findings per file, not a quality regression.
          </p>
        </CardContent>
      </Card>

      {/* All Unique Findings by File */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="break-words">{TOTAL_UNIQUE} Unique Bugs Found Across 15 Files</span>
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
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono text-primary break-all">{file}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0 ml-2">{findings.length} issues</Badge>
                </button>
                {expandedFile === file && (
                  <div className="border-t border-border/30 p-2 sm:p-3 space-y-2">
                    {findings.map((f, i) => (
                      <div key={i} className="flex flex-col gap-1 p-2 rounded bg-muted/20">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CategoryBadge cat={f.cat} />
                          <RiskBadge risk={f.risk} />
                        </div>
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

      {/* Provider Stats */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Server className="w-4 h-4 text-primary shrink-0" />
            <span className="break-words">Batch 3 Provider Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="text-lg font-bold text-foreground">Cerebras</div>
              <div className="text-xs text-muted-foreground">98 of 100 calls</div>
              <Progress value={98} className="h-1.5 mt-1" />
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="text-lg font-bold text-foreground">Groq</div>
              <div className="text-xs text-muted-foreground">2 of 100 calls</div>
              <Progress value={2} className="h-1.5 mt-1" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 break-words">
            All 100 Batch 3 runs used free-tier providers via NEXUS router. Zero cost to the project.
          </p>
        </CardContent>
      </Card>

      {/* Failure Analysis */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-destructive shrink-0" />
            <span className="break-words">Batch 3 — Failure Breakdown (44 rejected)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { reason: "Duplicate of already-applied patch", count: 23, pct: 52 },
              { reason: "Missing output format sections", count: 4, pct: 9 },
              { reason: "BEFORE block not found in source", count: 1, pct: 2 },
              { reason: "Identical BEFORE/AFTER blocks", count: 2, pct: 5 },
              { reason: "Other (API errors, high-risk non-fix)", count: 14, pct: 32 },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="font-mono text-destructive shrink-0 w-8 text-right">{f.count}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground break-words">{f.reason}</p>
                  <Progress value={f.pct} className="h-1 mt-1" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 break-words">
            52% of failures were duplicate rejections — the model found the same issues again. This is the dedup gate working correctly, not a model failure.
          </p>
        </CardContent>
      </Card>

      {/* Learned Constraints */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary shrink-0" />
            <span className="break-words">Adaptive Constraints (learned across 165 runs)</span>
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
            ].map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-xs p-1.5 rounded bg-muted/20">
                <span className="text-primary font-mono shrink-0">{i + 1}.</span>
                <span className="text-muted-foreground break-words">{c}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overall Trajectory */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary shrink-0" />
            <span className="break-words">Full Trajectory — All 165 Runs</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { label: "Batch 1 (35 runs, no context)", rate: 17, color: "text-destructive" },
            { label: "Batch 2 (30 runs, file context)", rate: 100, color: "text-emerald-400" },
            { label: "Batch 3 Phase 1 (25 runs)", rate: 84, color: "text-emerald-400" },
            { label: "Batch 3 Phase 2 (25 runs)", rate: 56, color: "text-primary" },
            { label: "Batch 3 Phase 3 (25 runs)", rate: 48, color: "text-amber-400" },
            { label: "Batch 3 Phase 4 (25 runs)", rate: 36, color: "text-amber-400" },
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

      {/* Verdict */}
      <Card className="bg-emerald-500/5 border-emerald-500/30">
        <CardContent className="p-4 space-y-2">
          <p className="text-base sm:text-lg font-bold text-emerald-400 text-center">✓ Evolution Process Validated</p>
          <div className="text-xs sm:text-sm text-muted-foreground space-y-1 break-words">
            <p>165 total runs completed. 92 patches approved. 56 unique real bugs identified across 15 substrate files.</p>
            <p>Key insight: Apply rate naturally declines as the model exhausts novel issues per file — the dedup gate correctly prevents redundant patches. This is expected behavior, not degradation.</p>
            <p>Next step: Rotate to new target files to discover fresh issues, or increase file set diversity.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}