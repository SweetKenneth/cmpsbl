/**
 * Ascension Demo — Tier 1.3
 * Shows a standard AI agent being wrapped with substrate capabilities.
 * Highlights specific code changes with inline annotations and explanations.
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowLeft, Play, CheckCircle, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const PRIMITIVES_PIPELINE = [
  { name: "DEFENSE", label: "Security Hardening", icon: "🛡️", duration: 400 },
  { name: "MEMORY", label: "Persistent Context", icon: "🧠", duration: 350 },
  { name: "GOVERNANCE", label: "Policy Enforcement", icon: "📋", duration: 300 },
  { name: "ENCODE", label: "Code Enhancement", icon: "⚡", duration: 500 },
  { name: "FORGE", label: "Package & Export", icon: "🔨", duration: 400 },
];

// ─── Code with highlight markers ─────────────────────────────
// Lines are tagged with change IDs so we can reference them in explanations

interface CodeLine {
  text: string;
  /** null = unchanged, string = change ID for highlighting */
  changeId: string | null;
  added?: boolean;
}

const BEFORE_LINES: CodeLine[] = [
  { text: "// research-agent.js", changeId: null },
  { text: "// A basic agent that searches and summarizes", changeId: null },
  { text: "", changeId: null },
  { text: "async function research(query) {", changeId: null },
  { text: "  const results = await fetch(", changeId: null },
  { text: "    `https://api.search.com?q=${query}`", changeId: null },
  { text: "  ).then(r => r.json());", changeId: null },
  { text: "", changeId: null },
  { text: "  const summary = await callLLM(", changeId: null },
  { text: "    `Summarize: ${results.text}`", changeId: null },
  { text: "  );", changeId: null },
  { text: "", changeId: null },
  { text: "  return { summary, sources: results.urls };", changeId: null },
  { text: "}", changeId: null },
  { text: "", changeId: null },
  { text: "async function callLLM(prompt) {", changeId: null },
  { text: "  const res = await fetch('https://api.openai.com/v1/chat', {", changeId: null },
  { text: "    method: 'POST',", changeId: null },
  { text: "    headers: { Authorization: `Bearer ${API_KEY}` },", changeId: null },
  { text: "    body: JSON.stringify({ model: 'gpt-4', messages: [{ role: 'user', content: prompt }] })", changeId: null },
  { text: "  });", changeId: null },
  { text: "  return res.json().then(d => d.choices[0].message.content);", changeId: null },
  { text: "}", changeId: null },
  { text: "", changeId: null },
  { text: "module.exports = { research };", changeId: null },
];

const AFTER_LINES: CodeLine[] = [
  { text: "// research-agent.ts — Enhanced by CMPSBL Substrate", changeId: "types", added: true },
  { text: "import { z } from 'zod';", changeId: "types", added: true },
  { text: "import { DefenseGate } from '@cmpsbl/defense';", changeId: "defense", added: true },
  { text: "import { MemoryBind } from '@cmpsbl/memory';", changeId: "memory", added: true },
  { text: "import { GovernancePolicy } from '@cmpsbl/governance';", changeId: "governance", added: true },
  { text: "import { NexusRouter } from '@cmpsbl/nexus';", changeId: "routing", added: true },
  { text: "import { AuditTrail } from '@cmpsbl/audit';", changeId: "audit", added: true },
  { text: "", changeId: null },
  { text: "// ❶ Input validation — rejects malformed queries at the boundary", changeId: "types" },
  { text: "const QuerySchema = z.object({", changeId: "types", added: true },
  { text: "  query: z.string().min(1).max(2000),", changeId: "types", added: true },
  { text: "  maxSources: z.number().int().min(1).max(50).default(10),", changeId: "types", added: true },
  { text: "  language: z.enum(['en','es','fr','de','ja']).default('en'),", changeId: "types", added: true },
  { text: "});", changeId: "types", added: true },
  { text: "", changeId: null },
  { text: "export class ResearchAgent {", changeId: null },
  { text: "  // ❷ Threat scoring on every request — O(1) trie evaluation", changeId: "defense" },
  { text: "  private defense = new DefenseGate({ mode: 'strict', rateLimit: '60/min' });", changeId: "defense", added: true },
  { text: "  // ❸ Persistent memory — agent remembers past research across sessions", changeId: "memory" },
  { text: "  private memory = new MemoryBind('research-context', { ttl: '30d' });", changeId: "memory", added: true },
  { text: "  // ❹ Governance — enforces cost budgets and content policies", changeId: "governance" },
  { text: "  private policy = new GovernancePolicy('research', { maxCostPerQuery: 0.05 });", changeId: "governance", added: true },
  { text: "  // ❺ Model-agnostic routing — auto-selects best provider per task", changeId: "routing" },
  { text: "  private nexus = new NexusRouter({ fallback: 'queue' });", changeId: "routing", added: true },
  { text: "  private audit = new AuditTrail('research-agent');", changeId: "audit", added: true },
  { text: "", changeId: null },
  { text: "  async research(input: unknown) {", changeId: null },
  { text: "    const { query, maxSources, language } = QuerySchema.parse(input);", changeId: "types", added: true },
  { text: "", changeId: null },
  { text: "    // ❷ Every request scored for injection / abuse before execution", changeId: "defense" },
  { text: "    await this.defense.evaluate({ input: query, action: 'research' });", changeId: "defense", added: true },
  { text: "", changeId: null },
  { text: "    // ❸ Check memory for cached research on this topic", changeId: "memory" },
  { text: "    const cached = await this.memory.recall(query);", changeId: "memory", added: true },
  { text: "    if (cached?.fresh) return cached.data;", changeId: "memory", added: true },
  { text: "", changeId: null },
  { text: "    // ❹ Governance pre-check: budget + content policy", changeId: "governance" },
  { text: "    await this.policy.authorize({ query, estimatedCost: 0.02 });", changeId: "governance", added: true },
  { text: "", changeId: null },
  { text: "    const results = await this.fetchSources(query, maxSources);", changeId: null },
  { text: "", changeId: null },
  { text: "    // ❺ Routes to optimal model — not hardcoded to one provider", changeId: "routing" },
  { text: "    const summary = await this.nexus.complete({", changeId: "routing", added: true },
  { text: "      task: 'summarize',", changeId: "routing", added: true },
  { text: "      input: { text: results.text, language },", changeId: "routing", added: true },
  { text: "      constraints: { maxTokens: 1500, temperature: 0.3 },", changeId: "routing", added: true },
  { text: "    });", changeId: "routing", added: true },
  { text: "", changeId: null },
  { text: "    // ❸ Store in persistent memory for future queries", changeId: "memory" },
  { text: "    await this.memory.store(query, { summary, sources: results.urls });", changeId: "memory", added: true },
  { text: "    // ❻ Full audit trail — every action is logged and hash-chained", changeId: "audit" },
  { text: "    this.audit.record('research_complete', { query, sourceCount: results.urls.length });", changeId: "audit", added: true },
  { text: "", changeId: null },
  { text: "    return { summary, sources: results.urls, cached: false };", changeId: null },
  { text: "  }", changeId: null },
  { text: "}", changeId: null },
];

// ─── Change explanations keyed to changeIds ─────────────────
const CHANGE_EXPLANATIONS: { id: string; marker: string; title: string; description: string; color: string }[] = [
  {
    id: "types",
    marker: "❶",
    title: "Type Safety & Validation",
    description: "The plain JS function now has TypeScript types and Zod schema validation. Malformed inputs are rejected at the boundary — no injection attacks, no unexpected data shapes reaching business logic.",
    color: "text-neon-cyan",
  },
  {
    id: "defense",
    marker: "❷",
    title: "Threat Detection & Rate Limiting",
    description: "Every request passes through DEFENSE's O(1) trie-based threat scorer. Prompt injection attempts, abuse patterns, and rate limit violations are caught before the agent executes — 60 requests/min with automatic throttling.",
    color: "text-neon-magenta",
  },
  {
    id: "memory",
    marker: "❸",
    title: "Persistent Memory Across Sessions",
    description: "The agent now remembers past research. Previously identical queries wasted API calls every time. Now results are cached for 30 days with freshness checks — reducing cost and latency by up to 90% for repeated topics.",
    color: "text-neon-purple",
  },
  {
    id: "governance",
    marker: "❹",
    title: "Cost & Content Governance",
    description: "GOVERNANCE enforces per-query cost budgets ($0.05 cap) and content policies before execution. The agent can't accidentally run an expensive query or generate prohibited content — safety is structural, not a prompt instruction.",
    color: "text-neon-amber",
  },
  {
    id: "routing",
    marker: "❺",
    title: "Model-Agnostic AI Routing",
    description: "Instead of being hardcoded to one provider, NEXUS automatically routes to the best available model for each task. If OpenAI is slow, it falls back to Anthropic or Google. The agent is never locked to a single vendor.",
    color: "text-primary",
  },
  {
    id: "audit",
    marker: "❻",
    title: "Hash-Chained Audit Trail",
    description: "Every action the agent takes is recorded in a tamper-proof audit chain. Compliance teams can verify exactly what the agent did, when, and why — required for enterprise deployment in regulated industries.",
    color: "text-neon-green",
  },
];

// ─── Highlight color map ─────────────────────────────────────
const CHANGE_COLORS: Record<string, string> = {
  types: "border-l-2 border-l-[hsl(var(--neon-cyan))] bg-[hsl(var(--neon-cyan)/.06)]",
  defense: "border-l-2 border-l-[hsl(var(--neon-magenta))] bg-[hsl(var(--neon-magenta)/.06)]",
  memory: "border-l-2 border-l-[hsl(var(--neon-purple))] bg-[hsl(var(--neon-purple)/.06)]",
  governance: "border-l-2 border-l-[hsl(var(--neon-amber))] bg-[hsl(var(--neon-amber)/.06)]",
  routing: "border-l-2 border-l-[hsl(var(--primary))] bg-[hsl(var(--primary)/.06)]",
  audit: "border-l-2 border-l-[hsl(var(--neon-green))] bg-[hsl(var(--neon-green)/.06)]",
};

// ─── Code Block Component ────────────────────────────────────
function CodeBlock({ lines, title, label, labelColor, highlight }: {
  lines: CodeLine[];
  title: string;
  label: string;
  labelColor: string;
  highlight: boolean;
}) {
  return (
    <div className={`rounded-xl border overflow-hidden transition-all ${
      highlight ? "border-primary/25 bg-card/60 backdrop-blur-sm" : "border-border/20 bg-card/40"
    }`}>
      <div className="px-4 py-2 border-b border-border/20 bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono font-bold ${labelColor}`}>{label}</span>
          <span className="text-[10px] font-mono text-muted-foreground">{title}</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-3 text-[10px] sm:text-[11px] font-mono leading-[1.7] min-w-0">
          {lines.map((line, i) => {
            const changeClass = highlight && line.changeId ? CHANGE_COLORS[line.changeId] || "" : "";
            return (
              <div
                key={i}
                className={`px-2 -mx-1 ${changeClass} ${
                  highlight && line.added ? "font-semibold" : ""
                } ${!highlight && line.changeId ? "" : ""}`}
              >
                <span className={highlight && line.changeId ? "text-foreground" : "text-foreground/60"}>
                  {line.text || "\u00A0"}
                </span>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
interface AscensionDemoProps {
  onBack: () => void;
}

export const AscensionDemo = ({ onBack }: AscensionDemoProps) => {
  const [phase, setPhase] = useState<"ready" | "processing" | "complete">("ready");
  const [currentStep, setCurrentStep] = useState(-1);
  const [elapsed, setElapsed] = useState(0);

  const progress = phase === "complete" ? 100 : phase === "ready" ? 0 :
    Math.min(100, ((currentStep + 1) / PRIMITIVES_PIPELINE.length) * 100);

  const runTransformation = useCallback(() => {
    setPhase("processing");
    setCurrentStep(0);
    const start = performance.now();

    let step = 0;
    const advance = () => {
      if (step >= PRIMITIVES_PIPELINE.length - 1) {
        setElapsed(Math.round(performance.now() - start));
        setPhase("complete");
        return;
      }
      step++;
      setCurrentStep(step);
      setTimeout(advance, PRIMITIVES_PIPELINE[step].duration);
    };
    setTimeout(advance, PRIMITIVES_PIPELINE[0].duration);
  }, []);

  const reset = () => {
    setPhase("ready");
    setCurrentStep(-1);
    setElapsed(0);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient mesh */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "var(--gradient-mesh)" }} />

      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/30 bg-background/60 backdrop-blur-xl px-4 sm:px-8 py-2.5 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <span className="text-[10px] font-mono text-primary/70 uppercase tracking-wider">CMPSBL®</span>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center" style={{ boxShadow: "var(--shadow-glow)" }}>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Ascension</h1>
              <p className="text-xs text-muted-foreground">Transform any agent into production-grade software</p>
            </div>
          </div>
        </motion.div>

        {/* Context */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <div className="rounded-xl border border-border/20 bg-card/60 backdrop-blur-sm p-4 space-y-1.5">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold">What You're Seeing</p>
            <p className="text-xs text-foreground/80 leading-relaxed">A basic research agent enters the substrate. The 40-primitive matrix wraps it with enterprise capabilities.</p>
          </div>
          <div className="rounded-xl border border-border/20 bg-card/60 backdrop-blur-sm p-4 space-y-1.5">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold">Why It Matters</p>
            <p className="text-xs text-foreground/80 leading-relaxed">Any developer's code becomes production-grade. Security, memory, governance, and routing — all wired in automatically.</p>
          </div>
          <div className="rounded-xl border border-border/20 bg-card/60 backdrop-blur-sm p-4 space-y-1.5">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold">Business Value</p>
            <p className="text-xs text-foreground/80 leading-relaxed">Every developer becomes 10x. Every agent becomes enterprise-ready. The substrate is a software manufacturing line.</p>
          </div>
        </motion.div>

        {/* Transformation CTA */}
        {phase === "ready" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-2"
          >
            <Button size="lg" className="gap-2 rounded-xl shadow-lg" style={{ boxShadow: "var(--shadow-glow)" }} onClick={runTransformation}>
              <Play className="w-4 h-4" />
              Run Ascension
            </Button>
            <p className="text-[10px] text-muted-foreground mt-2 font-mono">Preloaded example · Guaranteed result</p>
          </motion.div>
        )}

        {/* Pipeline Progress */}
        {phase !== "ready" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-muted-foreground">
                {phase === "complete" ? "Transformation Complete" : "Processing…"}
              </span>
              {phase === "complete" && (
                <span className="font-mono font-bold text-primary">{elapsed}ms</span>
              )}
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex flex-wrap gap-2">
              {PRIMITIVES_PIPELINE.map((p, i) => {
                const done = phase === "complete" || i <= currentStep;
                const active = phase === "processing" && i === currentStep;
                return (
                  <div
                    key={p.name}
                    className={`flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1.5 rounded-lg border transition-all ${
                      done
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : active
                        ? "bg-primary/5 border-primary/20 text-primary animate-pulse"
                        : "bg-muted/30 border-border/20 text-muted-foreground"
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                    {done && <CheckCircle className="w-3 h-3" />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Before Code (always visible) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: phase === "ready" ? 0.3 : 0 }}
          className="space-y-3"
        >
          <CodeBlock
            lines={BEFORE_LINES}
            title="research-agent.js — 25 lines, no types, no safety"
            label="BEFORE"
            labelColor="text-destructive"
            highlight={false}
          />

          {/* Arrow */}
          <div className="flex justify-center py-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              phase === "complete" ? "bg-primary/10 text-primary" : "bg-muted/30 text-muted-foreground"
            }`}>
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* After Code */}
          <div className={phase !== "complete" ? "opacity-40 pointer-events-none" : ""}>
            <CodeBlock
              lines={AFTER_LINES}
              title="research-agent.ts — Enhanced by CMPSBL Substrate"
              label="AFTER"
              labelColor="text-primary"
              highlight={phase === "complete"}
            />
          </div>
        </motion.div>

        {/* Change Explanations — appears after completion, references highlighted code */}
        <AnimatePresence>
          {phase === "complete" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">
                What Changed — Line by Line
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CHANGE_EXPLANATIONS.map((change, i) => (
                  <motion.div
                    key={change.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="rounded-xl border border-border/20 bg-card/60 backdrop-blur-sm p-4 space-y-2 hover:border-primary/15 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${change.color}`}>{change.marker}</span>
                      <h4 className="text-sm font-bold text-foreground">{change.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{change.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* Agent capability summary */}
              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5 sm:p-6 space-y-3">
                <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold">After Ascension, This Agent Can:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Reject malicious inputs before execution",
                    "Remember past research across sessions",
                    "Enforce per-query cost budgets ($0.05 cap)",
                    "Auto-route to the best AI provider",
                    "Rate-limit to 60 requests/minute",
                    "Log every action in a tamper-proof audit chain",
                    "Fall back gracefully if a provider is down",
                    "Export as a standalone, deployable package",
                  ].map((cap, i) => (
                    <motion.div
                      key={cap}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.04 }}
                      className="flex items-start gap-2 text-xs text-foreground"
                    >
                      <CheckCircle className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <Button variant="outline" size="sm" onClick={reset} className="gap-2 rounded-lg">
                  <Play className="w-3 h-3" />
                  Run Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
