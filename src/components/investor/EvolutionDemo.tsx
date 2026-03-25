/**
 * Evolution Demo — Tier 1.2
 * Outcome-first: show what the system found, AI-generated patches, approve/reject.
 * Zero simulation — preloaded realistic data for investor-safe presentation.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Check, X, ChevronDown, AlertTriangle,
  FileCode, Shield, TestTube, ArrowLeft, Clock, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Patch {
  id: string;
  title: string;
  file: string;
  severity: "low" | "medium" | "high";
  category: string;
  confidence: number;
  before: string;
  after: string;
  gates: { name: string; passed: boolean }[];
  impact: string;
}

const PATCHES: Patch[] = [
  {
    id: "EVO-001",
    title: "Eliminate N+1 Query in Discovery Loader",
    file: "src/lib/substrate/memory/discoveryLoader.ts",
    severity: "high",
    category: "Performance",
    confidence: 94,
    before: `// Current: N+1 query pattern
const discoveries = await getDiscoveries();
for (const d of discoveries) {
  d.pipeline = await getPipeline(d.id);
  d.scores = await getScores(d.id);
}`,
    after: `// Optimized: Single batched query
const discoveries = await getDiscoveriesWithRelations({
  include: ['pipeline', 'scores'],
  batch: true,
});`,
    gates: [
      { name: "Lint", passed: true },
      { name: "Test", passed: true },
      { name: "Security", passed: true },
      { name: "Blast Radius", passed: true },
      { name: "Evidence", passed: true },
      { name: "Governance", passed: true },
      { name: "Production", passed: false },
    ],
    impact: "~340ms → ~45ms load time. 87% reduction.",
  },
  {
    id: "EVO-002",
    title: "Add Rate Limiting to Mesh Broadcast",
    file: "src/lib/core/mesh/broadcast.ts",
    severity: "medium",
    category: "Resilience",
    confidence: 89,
    before: `// Current: Unbounded broadcast
export async function broadcast(intent: Intent) {
  const targets = resolveTargets(intent);
  await Promise.all(
    targets.map(t => t.handle(intent))
  );
}`,
    after: `// Enhanced: Governed broadcast with backpressure
export async function broadcast(intent: Intent) {
  const targets = resolveTargets(intent);
  const governor = getVelocityGovernor();
  await governor.executeBatch(
    targets.map(t => () => t.handle(intent)),
    { maxConcurrency: 8, timeoutMs: 5000 }
  );
}`,
    gates: [
      { name: "Lint", passed: true },
      { name: "Test", passed: true },
      { name: "Security", passed: true },
      { name: "Blast Radius", passed: true },
      { name: "Evidence", passed: true },
      { name: "Governance", passed: false },
      { name: "Production", passed: false },
    ],
    impact: "Prevents cascade failures under load. P99 stabilized.",
  },
  {
    id: "EVO-003",
    title: "Strengthen Input Validation in DECODE",
    file: "src/lib/substrate/decode/inputHandler.ts",
    severity: "high",
    category: "Security",
    confidence: 97,
    before: `// Current: Basic type check
function validate(input: unknown) {
  if (typeof input !== 'string') throw new Error('Invalid');
  return input;
}`,
    after: `// Enhanced: Multi-layer validation
function validate(input: unknown) {
  const sanitized = defenseLayer.sanitize(input);
  const parsed = inputSchema.safeParse(sanitized);
  if (!parsed.success) {
    auditLog.record('validation_failure', parsed.error);
    throw new ValidationError(parsed.error);
  }
  return parsed.data;
}`,
    gates: [
      { name: "Lint", passed: true },
      { name: "Test", passed: true },
      { name: "Security", passed: true },
      { name: "Blast Radius", passed: true },
      { name: "Evidence", passed: true },
      { name: "Governance", passed: true },
      { name: "Production", passed: true },
    ],
    impact: "Closes 3 injection vectors. OWASP Top-10 compliant.",
  },
];

const severityColor = {
  low: "text-blue-500 bg-blue-500/10",
  medium: "text-amber-500 bg-amber-500/10",
  high: "text-red-500 bg-red-500/10",
};

interface EvolutionDemoProps {
  onBack: () => void;
}

export const EvolutionDemo = ({ onBack }: EvolutionDemoProps) => {
  const [selectedPatch, setSelectedPatch] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Record<string, "approved" | "rejected">>({});
  const [showCode, setShowCode] = useState(false);

  const activePatch = PATCHES.find((p) => p.id === selectedPatch);
  const gatesPassedCount = activePatch?.gates.filter((g) => g.passed).length ?? 0;
  const totalGates = activePatch?.gates.length ?? 7;

  const handleDecision = (id: string, decision: "approved" | "rejected") => {
    setDecisions((prev) => ({ ...prev, [id]: decision }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Showcase
        </button>
        <span className="text-[10px] font-mono text-muted-foreground">TIER 1 · EVOLUTION</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Evolution</h1>
              <p className="text-xs text-muted-foreground">Self-Improving Code</p>
            </div>
          </div>
        </motion.div>

        {/* Outcome Summary — what matters, first */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-5 space-y-4"
        >
          <p className="text-[10px] font-mono uppercase tracking-wider text-primary">What You're Seeing</p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            The system continuously scans its own codebase, identifies improvements, and generates
            AI-written patches. Each patch passes through a <span className="font-semibold text-foreground">7-gate SEBA pipeline</span> before
            reaching a human for one-click approval.
          </p>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Patches Ready", value: PATCHES.length.toString(), icon: <FileCode className="w-3.5 h-3.5" /> },
              { label: "Avg Confidence", value: "93%", icon: <TrendingUp className="w-3.5 h-3.5" /> },
              { label: "Avg Gate Time", value: "2.4s", icon: <Clock className="w-3.5 h-3.5" /> },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-muted/50 border border-border p-3 text-center space-y-1">
                <div className="flex items-center justify-center text-primary">{s.icon}</div>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Patch List */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">AI-Generated Patches</p>

          {PATCHES.map((patch, idx) => {
            const isSelected = selectedPatch === patch.id;
            const decision = decisions[patch.id];

            return (
              <motion.div
                key={patch.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + idx * 0.08 }}
                className={`rounded-xl border bg-card overflow-hidden transition-colors ${
                  isSelected ? "border-primary/40" : "border-border hover:border-primary/20"
                } ${decision ? "opacity-70" : ""}`}
              >
                {/* Patch Header */}
                <button
                  onClick={() => setSelectedPatch(isSelected ? null : patch.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground">{patch.id}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${severityColor[patch.severity]}`}>
                          {patch.severity}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">{patch.category}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">{patch.title}</h3>
                      <p className="text-[11px] font-mono text-muted-foreground truncate">{patch.file}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {decision && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          decision === "approved"
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}>
                          {decision}
                        </span>
                      )}
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isSelected ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </button>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                        {/* Confidence Bar */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">AI Confidence</span>
                            <span className="font-mono font-bold text-foreground">{patch.confidence}%</span>
                          </div>
                          <Progress value={patch.confidence} className="h-2" />
                        </div>

                        {/* SEBA Gates */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                            SEBA Pipeline — {gatesPassedCount}/{totalGates} gates passed
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {patch.gates.map((gate) => (
                              <div
                                key={gate.name}
                                className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-md border ${
                                  gate.passed
                                    ? "bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400"
                                    : "bg-muted border-border text-muted-foreground"
                                }`}
                              >
                                {gate.passed ? (
                                  <Check className="w-2.5 h-2.5" />
                                ) : (
                                  <Clock className="w-2.5 h-2.5" />
                                )}
                                {gate.name}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Impact */}
                        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                          <p className="text-[10px] font-mono uppercase tracking-wider text-primary mb-1">Impact</p>
                          <p className="text-xs text-foreground">{patch.impact}</p>
                        </div>

                        {/* Code Toggle */}
                        <div className="space-y-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowCode(!showCode); }}
                            className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ChevronDown className={`w-3 h-3 transition-transform ${showCode ? "rotate-180" : ""}`} />
                            {showCode ? "Hide" : "View"} AI-Generated Patch
                          </button>

                          <AnimatePresence>
                            {showCode && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="grid grid-cols-1 gap-2">
                                  <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-3">
                                    <p className="text-[10px] font-mono text-red-500 mb-2">BEFORE</p>
                                    <pre className="text-[11px] font-mono text-foreground/70 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                                      {patch.before}
                                    </pre>
                                  </div>
                                  <div className="rounded-lg bg-green-500/5 border border-green-500/10 p-3">
                                    <p className="text-[10px] font-mono text-green-600 dark:text-green-400 mb-2">AFTER</p>
                                    <pre className="text-[11px] font-mono text-foreground/70 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                                      {patch.after}
                                    </pre>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Approve / Reject */}
                        {!decision && (
                          <div className="flex gap-2 pt-1">
                            <Button
                              size="sm"
                              className="flex-1 gap-1.5"
                              onClick={(e) => { e.stopPropagation(); handleDecision(patch.id, "approved"); }}
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 gap-1.5"
                              onClick={(e) => { e.stopPropagation(); handleDecision(patch.id, "rejected"); }}
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Why It Matters + Business Value */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl border border-border bg-card p-5 space-y-4"
        >
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Why It Matters</p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              AI discovers and fixes issues autonomously. Every patch is validated through 7 independent
              gates before a human sees it. The system gets better at finding improvements over time.
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Business Value</p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Eliminates tech debt continuously. Reduces engineering costs. Scales code quality
              without scaling headcount. Every approved patch compounds system reliability.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
