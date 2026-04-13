/**
 * Mana Demo — Tier 1 · "The Real Product"
 * Layer 2 Silent Software Symbiosis with Lex Governance
 * Curated presentation for investors — no live data needed.
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, ArrowLeft, Shield, Eye, Zap, Lock, AlertTriangle,
  CheckCircle, ChevronDown, Layers, Scale, Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const ATTACHMENT_PHASES = [
  { id: 1, label: "Detect", desc: "159-primitive matrix scans host codebase structure", icon: <Eye className="w-4 h-4" />, duration: 340 },
  { id: 2, label: "Classify", desc: "Archetype detection — Active, Passive, or Hybrid host", icon: <Target className="w-4 h-4" />, duration: 280 },
  { id: 3, label: "Prescribe", desc: "Layer 2 capabilities selected via CJPI scoring", icon: <Layers className="w-4 h-4" />, duration: 420 },
  { id: 4, label: "Attach", desc: "Non-invasive symbiont injection — zero source modification", icon: <Flame className="w-4 h-4" />, duration: 560 },
  { id: 5, label: "Verify", desc: "Behavioral proof — every function validated against contract", icon: <CheckCircle className="w-4 h-4" />, duration: 220 },
];

const LEX_RULES = [
  { type: "blacklist" as const, name: "Financial PII Extraction", risk: "critical", desc: "Blocks attachment patterns that could extract financial personally identifiable information" },
  { type: "blacklist" as const, name: "Auth Bypass Injection", risk: "critical", desc: "Prevents symbiont from overriding authentication gates" },
  { type: "whitelist" as const, name: "Performance Monitoring", risk: "safe", desc: "Approved attachment for runtime telemetry and latency tracking" },
  { type: "whitelist" as const, name: "Error Recovery", risk: "safe", desc: "Approved self-healing attachment for graceful degradation" },
  { type: "blacklist" as const, name: "Data Exfiltration Channel", risk: "high", desc: "Blocks covert data channels through logging or metrics endpoints" },
];

const FEAR_FLYWHEEL = [
  { step: "1", title: "Demonstrate", desc: "Show what Mana can do to unprotected software — silent, non-cooperative attachment" },
  { step: "2", title: "Fear", desc: "Organizations realize their software is vulnerable to symbiotic attachment" },
  { step: "3", title: "Shield", desc: "CMPSBL offers the Lex Registry — the only governance layer purpose-built for software symbiosis" },
  { step: "4", title: "$0 CAC", desc: "Fear is free advertising. Every demonstration drives organic demand for the antidote" },
];

interface ManaDemoProps {
  onBack: () => void;
}

export const ManaDemo = ({ onBack }: ManaDemoProps) => {
  const [attachPhase, setAttachPhase] = useState(-1);
  const [attachRunning, setAttachRunning] = useState(false);
  const [showLex, setShowLex] = useState(false);
  const [showFlywheel, setShowFlywheel] = useState(true);

  const runAttachment = useCallback(() => {
    setAttachRunning(true);
    setAttachPhase(0);
    let elapsed = 0;
    ATTACHMENT_PHASES.forEach((phase, i) => {
      elapsed += phase.duration;
      setTimeout(() => {
        setAttachPhase(i + 1);
        if (i === ATTACHMENT_PHASES.length - 1) {
          setTimeout(() => setAttachRunning(false), 400);
        }
      }, elapsed);
    });
  }, []);

  const totalMs = ATTACHMENT_PHASES.reduce((s, p) => s + p.duration, 0);
  const progress = attachPhase < 0 ? 0 : Math.min((attachPhase / ATTACHMENT_PHASES.length) * 100, 100);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none" style={{ background: "var(--gradient-mesh)" }} />

      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/30 bg-background/60 backdrop-blur-xl px-4 sm:px-8 py-2.5 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />Back
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 uppercase tracking-wider">Confidential</span>
          <span className="text-[10px] font-mono text-primary/70 uppercase tracking-wider">CMPSBL®</span>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-mono uppercase tracking-widest text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            The Real Product
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center" style={{ boxShadow: "var(--shadow-glow)" }}>
              <Flame className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Mana <span className="text-lg font-normal text-muted-foreground">+ Lex</span>
              </h1>
              <p className="text-sm text-muted-foreground">Layer 2 Silent Software Symbiosis</p>
            </div>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            Mana is the engine. It attaches to any codebase silently — granting emergent capabilities without modifying a single line of source code. Lex is the conscience — governing what Mana can and cannot do.
          </p>
        </motion.div>

        {/* Not AI Badge */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
          <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-foreground">Not AI — Deterministic Coding</p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              Mana uses lexical analysis, structural pattern matching, and CJPI scoring formulas — not neural networks, not LLMs. 
              Every attachment is verifiable, reproducible, and non-stochastic. The output is deterministic code, not probability.
            </p>
          </div>
        </motion.div>

        {/* Attachment Pipeline Demo */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-border/20 flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold">Symbiotic Attachment Pipeline</p>
            {attachPhase >= ATTACHMENT_PHASES.length && (
              <span className="text-[10px] font-mono text-primary font-bold">{totalMs}ms total</span>
            )}
          </div>
          <div className="p-5 space-y-4">
            {attachPhase < 0 ? (
              <div className="text-center py-6 space-y-3">
                <p className="text-sm text-muted-foreground">Watch Mana attach to an unprotected Express.js server</p>
                <Button onClick={runAttachment} className="gap-2">
                  <Flame className="w-4 h-4" />
                  Run Attachment
                </Button>
              </div>
            ) : (
              <>
                <Progress value={progress} className="h-2" />
                <div className="space-y-2">
                  {ATTACHMENT_PHASES.map((phase, i) => (
                    <motion.div
                      key={phase.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: i < attachPhase ? 1 : 0.3, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                        i < attachPhase
                          ? "bg-primary/5 border-primary/15"
                          : "bg-muted/20 border-border/20"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        i < attachPhase ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {i < attachPhase ? <CheckCircle className="w-4 h-4" /> : phase.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">{phase.label}</p>
                        <p className="text-[10px] text-muted-foreground">{phase.desc}</p>
                      </div>
                      {i < attachPhase && (
                        <span className="text-[10px] font-mono text-primary shrink-0">{phase.duration}ms</span>
                      )}
                    </motion.div>
                  ))}
                </div>
                {attachPhase >= ATTACHMENT_PHASES.length && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center space-y-2">
                    <p className="text-sm font-bold text-foreground">Symbiont Active</p>
                    <p className="text-xs text-muted-foreground">
                      The host codebase now has memory, self-healing, and governance — without a single line changed.
                      The developer doesn't even know it's there.
                    </p>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* Lex Governance */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-sm overflow-hidden">
          <button
            onClick={() => setShowLex(!showLex)}
            className="w-full px-5 py-3 flex items-center justify-between hover:bg-muted/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold">Lex Governance — Blacklist / Whitelist</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showLex ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {showLex && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="px-5 pb-5 space-y-2 border-t border-border/20 pt-4">
                  <p className="text-xs text-muted-foreground mb-3">
                    Lex determines what Mana is allowed to attach. Every capability must pass the constitutional governance layer.
                  </p>
                  {LEX_RULES.map((rule, i) => (
                    <motion.div
                      key={rule.name}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${
                        rule.type === "blacklist"
                          ? "bg-destructive/5 border-destructive/15"
                          : "bg-primary/5 border-primary/15"
                      }`}
                    >
                      {rule.type === "blacklist" ? (
                        <Lock className="w-4 h-4 text-destructive shrink-0" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-foreground">{rule.name}</p>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${
                            rule.risk === "critical" ? "bg-destructive/10 text-destructive border-destructive/20"
                            : rule.risk === "high" ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-primary/10 text-primary border-primary/20"
                          }`}>{rule.risk}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{rule.desc}</p>
                      </div>
                      <span className={`text-[9px] font-mono uppercase ${
                        rule.type === "blacklist" ? "text-destructive" : "text-primary"
                      }`}>{rule.type}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Fear = Free Advertising Flywheel */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          className="rounded-2xl border border-primary/20 overflow-hidden">
          <div className="absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.04), hsl(var(--neon-purple) / 0.03))" }} />
          <div className="relative px-5 py-4 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold">$0 CAC Flywheel — Fear = Free Advertising</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEAR_FLYWHEEL.map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/20"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                    <span className="text-xs font-mono font-bold text-primary">{item.step}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Why It Matters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-sm p-6 space-y-5">
          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold">Why Mana Is the Real Product</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Mana proves that software can be governed after deployment — without cooperation from the original developer. 
              This is unprecedented. The immediate question every enterprise asks: <span className="font-semibold text-foreground">"How do I protect my software from this?"</span>
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold">Business Model</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Mana Engine", desc: "Demonstrates capability — drives awareness", price: "Power" },
                { label: "Shield / Lex Registry", desc: "The antidote — governance subscription", price: "Revenue" },
                { label: "Marketplace", desc: "Curated software products from discoveries", price: "$10–$99/product" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-border/20 bg-muted/20 p-3 space-y-1">
                  <p className="text-xs font-bold text-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  <p className="text-[10px] font-mono text-primary font-bold">{item.price}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold">Patent Status</p>
            <p className="text-sm text-muted-foreground">
              U.S. App. No. <span className="font-mono font-bold text-foreground">64/031,637</span> — Software Symbiosis Engine
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
