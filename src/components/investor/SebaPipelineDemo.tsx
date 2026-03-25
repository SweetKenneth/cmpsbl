/**
 * SEBA Pipeline Demo — Tier 2
 * 7-gate promotion pipeline with pass/fail visualization.
 * Preloaded data for investor presentation.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Activity, CheckCircle, XCircle, Clock,
  ChevronDown, Shield, TestTube, FileCode, Eye, Scale, Cpu, Rocket,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface Gate {
  id: number;
  name: string;
  icon: React.ReactNode;
  description: string;
  checkpoints: string[];
}

interface ProposalRun {
  id: string;
  title: string;
  gates: { gateId: number; passed: boolean; duration: string; detail: string }[];
  finalVerdict: "promoted" | "rejected" | "pending";
}

const GATES: Gate[] = [
  { id: 1, name: "Lint", icon: <FileCode className="w-3.5 h-3.5" />, description: "Static analysis, style conformance, dead code detection", checkpoints: ["ESLint rules", "TypeScript strict", "Import analysis"] },
  { id: 2, name: "Test", icon: <TestTube className="w-3.5 h-3.5" />, description: "Unit, integration, and regression test suites", checkpoints: ["Unit coverage > 80%", "Integration pass", "No regressions"] },
  { id: 3, name: "Security", icon: <Shield className="w-3.5 h-3.5" />, description: "Vulnerability scanning, dependency audit, injection analysis", checkpoints: ["CVE scan", "OWASP Top-10", "Dependency audit"] },
  { id: 4, name: "Blast Radius", icon: <Cpu className="w-3.5 h-3.5" />, description: "Impact analysis via BFS dependency graph traversal", checkpoints: ["Affected modules < 5", "No critical paths", "Rollback possible"] },
  { id: 5, name: "Evidence", icon: <Eye className="w-3.5 h-3.5" />, description: "Evidence bundle validation — telemetry, test data, security scans", checkpoints: ["Telemetry delta", "Test evidence", "Scan results"] },
  { id: 6, name: "Governance", icon: <Scale className="w-3.5 h-3.5" />, description: "Policy compliance, rate limits, approval requirements", checkpoints: ["Within velocity budget", "No blocked paths", "Proficiency gate"] },
  { id: 7, name: "Production", icon: <Rocket className="w-3.5 h-3.5" />, description: "Final canary deployment, health monitoring, rollback readiness", checkpoints: ["Canary healthy", "Metrics stable", "Rollback verified"] },
];

const PROPOSALS: ProposalRun[] = [
  {
    id: "PROP-089",
    title: "Batch MEMORY queries for Discovery Loader",
    gates: [
      { gateId: 1, passed: true, duration: "0.8s", detail: "0 lint errors, 0 warnings" },
      { gateId: 2, passed: true, duration: "3.2s", detail: "147/147 tests passed, 94% coverage" },
      { gateId: 3, passed: true, duration: "1.1s", detail: "0 CVEs, 0 injection vectors" },
      { gateId: 4, passed: true, duration: "0.6s", detail: "2 modules affected, no critical paths" },
      { gateId: 5, passed: true, duration: "0.3s", detail: "Evidence bundle complete, novelty: 0.72" },
      { gateId: 6, passed: true, duration: "0.2s", detail: "Within velocity budget, tier: practitioner" },
      { gateId: 7, passed: true, duration: "2.1s", detail: "Canary healthy after 2s, rollback verified" },
    ],
    finalVerdict: "promoted",
  },
  {
    id: "PROP-090",
    title: "Add WebSocket support to RELAY",
    gates: [
      { gateId: 1, passed: true, duration: "0.7s", detail: "0 lint errors" },
      { gateId: 2, passed: true, duration: "4.8s", detail: "203/203 tests passed" },
      { gateId: 3, passed: true, duration: "1.3s", detail: "0 CVEs found" },
      { gateId: 4, passed: false, duration: "0.9s", detail: "7 modules affected — exceeds threshold of 5" },
      { gateId: 5, passed: false, duration: "-", detail: "Skipped — prior gate failed" },
      { gateId: 6, passed: false, duration: "-", detail: "Skipped" },
      { gateId: 7, passed: false, duration: "-", detail: "Skipped" },
    ],
    finalVerdict: "rejected",
  },
  {
    id: "PROP-091",
    title: "Harden DECODE input sanitization",
    gates: [
      { gateId: 1, passed: true, duration: "0.6s", detail: "0 errors" },
      { gateId: 2, passed: true, duration: "2.9s", detail: "89/89 tests passed" },
      { gateId: 3, passed: true, duration: "1.0s", detail: "0 CVEs, closes 3 vectors" },
      { gateId: 4, passed: true, duration: "0.4s", detail: "1 module affected" },
      { gateId: 5, passed: true, duration: "0.3s", detail: "Full evidence bundle" },
      { gateId: 6, passed: true, duration: "0.2s", detail: "Approved — security class" },
      { gateId: 7, passed: false, duration: "—", detail: "Awaiting production slot" },
    ],
    finalVerdict: "pending",
  },
];

const verdictConfig = {
  promoted: { label: "PROMOTED", color: "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20" },
  rejected: { label: "REJECTED", color: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20" },
  pending: { label: "PENDING", color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20" },
};

interface SebaPipelineDemoProps {
  onBack: () => void;
}

export const SebaPipelineDemo = ({ onBack }: SebaPipelineDemoProps) => {
  const [selectedProposal, setSelectedProposal] = useState<string | null>("PROP-089");
  const [showGateDetail, setShowGateDetail] = useState<number | null>(null);

  const activeProposal = PROPOSALS.find((p) => p.id === selectedProposal);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Showcase
        </button>
        <span className="text-[10px] font-mono text-muted-foreground">TIER 2 · SEBA PIPELINE</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">SEBA Pipeline</h1>
              <p className="text-xs text-muted-foreground">7-Gate Governance — Nothing Ships Without Proof</p>
            </div>
          </div>
        </motion.div>

        {/* What You're Seeing */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-primary">What You're Seeing</p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Every mutation — whether AI-generated or human-written — must pass through 7 independent
            gates before reaching production. If <span className="font-semibold text-foreground">any gate fails, the pipeline stops</span>.
            No exceptions.
          </p>

          {/* Gate Pipeline Visual */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {GATES.map((gate, i) => (
              <div key={gate.id} className="flex items-center gap-1">
                <button
                  onClick={() => setShowGateDetail(showGateDetail === gate.id ? null : gate.id)}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-mono border transition-all whitespace-nowrap ${
                    showGateDetail === gate.id
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "bg-muted border-border text-muted-foreground hover:border-primary/20"
                  }`}
                >
                  {gate.icon}
                  {gate.name}
                </button>
                {i < GATES.length - 1 && <span className="text-muted-foreground text-[10px]">→</span>}
              </div>
            ))}
          </div>

          {/* Gate Detail Popover */}
          <AnimatePresence>
            {showGateDetail && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {(() => {
                  const gate = GATES.find((g) => g.id === showGateDetail);
                  if (!gate) return null;
                  return (
                    <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        {gate.icon}
                        <span className="text-xs font-semibold text-foreground">Gate {gate.id}: {gate.name}</span>
                      </div>
                      <p className="text-[11px] text-foreground/70">{gate.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {gate.checkpoints.map((cp) => (
                          <span key={cp} className="text-[10px] font-mono px-2 py-0.5 rounded bg-card border border-border text-muted-foreground">
                            {cp}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Proposal Selector */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Recent Proposals</p>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {PROPOSALS.map((p) => {
              const vc = verdictConfig[p.finalVerdict];
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProposal(p.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-mono border whitespace-nowrap transition-all ${
                    selectedProposal === p.id
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "bg-card border-border text-muted-foreground hover:border-primary/20"
                  }`}
                >
                  {p.id}
                  <span className={`px-1.5 py-0.5 rounded text-[9px] border ${vc.color}`}>{vc.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Selected Proposal Gate Results */}
        {activeProposal && (
          <motion.div key={activeProposal.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{activeProposal.title}</h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${verdictConfig[activeProposal.finalVerdict].color}`}>
                {verdictConfig[activeProposal.finalVerdict].label}
              </span>
            </div>

            <div className="space-y-1.5">
              {activeProposal.gates.map((gr, i) => {
                const gate = GATES.find((g) => g.id === gr.gateId)!;
                return (
                  <motion.div
                    key={gr.gateId}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${
                      gr.passed
                        ? "bg-green-500/5 border-green-500/15"
                        : gr.duration === "-" || gr.duration === "—"
                        ? "bg-muted/30 border-border opacity-50"
                        : "bg-red-500/5 border-red-500/15"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 w-20 shrink-0">
                      {gate.icon}
                      <span className="text-[11px] font-mono text-foreground">{gate.name}</span>
                    </div>

                    {gr.passed ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    ) : gr.duration === "-" || gr.duration === "—" ? (
                      <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    )}

                    <span className="text-[10px] text-foreground/70 flex-1 truncate">{gr.detail}</span>
                    <span className="text-[10px] font-mono text-muted-foreground w-10 text-right shrink-0">{gr.duration}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Pass Rate */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[10px] font-mono text-muted-foreground">
                {activeProposal.gates.filter((g) => g.passed).length}/{activeProposal.gates.length} gates passed
              </span>
              <Progress
                value={(activeProposal.gates.filter((g) => g.passed).length / activeProposal.gates.length) * 100}
                className="h-1.5 flex-1"
              />
            </div>
          </motion.div>
        )}

        {/* Why It Matters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Why It Matters</p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              AI mutations cannot bypass governance. Each gate is an independent verification —
              lint, test, security, blast radius, evidence, governance, production. Safety is structural.
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Business Value</p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Regulatory compliance from day one. Full auditability. Risk mitigation that scales
              with the system — more mutations means more governance, not less.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
