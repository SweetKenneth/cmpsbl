/**
 * Investor Showcase — 30-Second WOW Demo
 * SYMBIOTIC Epoch v19 — Cinematic before/after with curing narrative
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Check, Clock, ArrowLeft, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const BEFORE_CODE = `// logger.js — 14 lines, no protection
function log(msg) {
  console.log(msg);
}

function getUser() {
  return fetch('/api/user')
    .then(r => r.json());
}

module.exports = { log, getUser };`;

const AFTER_CODE = `// telemetry-service.ts — Cured by CMPSBL Substrate
import { MemoryBind } from '@cmpsbl/runtime';
import { DefenseGate } from '@cmpsbl/runtime/defense';
import { AuditTrail } from '@cmpsbl/runtime/audit';

interface TelemetryEvent {
  level: 'info' | 'warn' | 'error';
  message: string;
  context: Record<string, unknown>;
  timestamp: number;
  traceId: string;
}

@MemoryBind({ persist: true, ttl: '7d' })
export class TelemetryService {
  private memory = MemoryBind.create('telemetry');
  private audit = new AuditTrail('telemetry');

  async log(event: TelemetryEvent): Promise<void> {
    await DefenseGate.evaluate({
      actor: event.traceId,
      action: 'log.write',
      rateLimit: { window: '1m', max: 100 },
    });

    await this.memory.append('events', event);
    this.audit.record('event_logged', {
      level: event.level,
      traceId: event.traceId,
    });
  }

  async getUser(id: string) {
    return this.memory.cachedFetch(\`user:\${id}\`, {
      url: '/api/user',
      ttl: '5m',
      retry: { attempts: 3, backoff: 'exponential' },
    });
  }
}`;

const ENHANCEMENTS = [
  { primitive: "DEFENSE", label: "Rate limiting + threat evaluation", ms: 180 },
  { primitive: "MEMORY", label: "Persistent event store with TTL", ms: 240 },
  { primitive: "ENCODE", label: "TypeScript + strict type contracts", ms: 320 },
  { primitive: "GOVERNANCE", label: "Full audit trail on every operation", ms: 160 },
  { primitive: "FORGE", label: "Exportable service with standalone runtime", ms: 340 },
];

const TOTAL_MS = 1240;

export const WowDemo = ({ onBack }: { onBack: () => void }) => {
  const [phase, setPhase] = useState<"ready" | "processing" | "done">("ready");
  const [currentStep, setCurrentStep] = useState(0);

  const runDemo = useCallback(() => {
    setPhase("processing");
    setCurrentStep(0);
    let elapsed = 0;
    ENHANCEMENTS.forEach((e, i) => {
      elapsed += e.ms;
      setTimeout(() => setCurrentStep(i + 1), elapsed);
    });
    setTimeout(() => setPhase("done"), TOTAL_MS + 200);
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none" style={{ background: "var(--gradient-mesh)" }} />

      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/30 bg-background/60 backdrop-blur-xl px-4 sm:px-8 py-2.5 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />Back
        </button>
        <span className="text-[10px] font-mono text-primary/70 uppercase tracking-wider">CMPSBL®</span>
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-mono uppercase tracking-widest text-primary">
            <Sparkles className="w-3 h-3" />
            30-Second Proof
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Deterministic{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
              Curing
            </span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Watch a basic script transform into governed, production-ready software. Zero AI in the output — pure structural enhancement.
          </p>
        </motion.div>

        {/* Not AI Badge */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-4 text-[10px] font-mono">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary">
            <Zap className="w-3 h-3" />Zero AI in Output
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary">
            <Shield className="w-3 h-3" />Patent Pending
          </span>
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === "ready" && (
            <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-sm overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border/20 bg-muted/20 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground">INPUT — logger.js</span>
                  <span className="text-[10px] font-mono text-destructive">No types · No security · No persistence</span>
                </div>
                <pre className="p-4 text-[11px] font-mono text-foreground/70 overflow-x-auto leading-relaxed">{BEFORE_CODE}</pre>
              </div>
              <div className="flex justify-center">
                <Button size="lg" onClick={runDemo} className="gap-2 rounded-xl shadow-lg" style={{ boxShadow: "var(--shadow-glow)" }}>
                  <Sparkles className="w-4 h-4" />
                  Cure This Code
                </Button>
              </div>
            </motion.div>
          )}

          {phase === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-sm p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-semibold text-foreground">Curing with 40 primitives…</span>
                </div>
                <div className="space-y-2">
                  {ENHANCEMENTS.map((e, i) => (
                    <motion.div key={e.primitive} initial={{ opacity: 0, x: -8 }} animate={{ opacity: i < currentStep ? 1 : 0.3, x: 0 }}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border/20">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${i < currentStep ? "bg-primary/10" : "bg-muted/30"}`}>
                        {i < currentStep ? <Check className="w-3 h-3 text-primary" /> : <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                      </div>
                      <span className="text-[10px] font-mono text-primary w-28">{e.primitive}</span>
                      <span className="text-xs text-muted-foreground flex-1">{e.label}</span>
                      {i < currentStep && <span className="text-[10px] font-mono text-muted-foreground">{e.ms}ms</span>}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {phase === "done" && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="flex items-center justify-center gap-3">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-lg font-mono font-black text-primary">Cured in {TOTAL_MS.toLocaleString()}ms</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border/20 bg-card/40 overflow-hidden">
                  <div className="px-4 py-2 border-b border-border/20 bg-destructive/5">
                    <span className="text-[10px] font-mono text-destructive font-bold">BEFORE — Unprotected</span>
                  </div>
                  <pre className="p-3 text-[10px] font-mono text-foreground/50 overflow-x-auto leading-relaxed max-h-64 overflow-y-auto">{BEFORE_CODE}</pre>
                </div>
                <div className="rounded-2xl border-2 border-primary/30 bg-card/60 overflow-hidden">
                  <div className="px-4 py-2 border-b border-primary/20 bg-primary/5">
                    <span className="text-[10px] font-mono text-primary font-bold">AFTER — Cured by CMPSBL</span>
                  </div>
                  <pre className="p-3 text-[10px] font-mono text-foreground/80 overflow-x-auto leading-relaxed max-h-64 overflow-y-auto">{AFTER_CODE}</pre>
                </div>
              </div>

              {/* What Changed */}
              <div className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-sm p-5 space-y-3">
                <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold">What Changed — Deterministic, Not Probabilistic</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ENHANCEMENTS.map((e) => (
                    <div key={e.primitive} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-primary shrink-0" />
                      <span className="text-xs text-foreground"><span className="font-mono text-primary">{e.primitive}</span> — {e.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground pt-2 border-t border-border/20">
                  Original source code preserved as Layer 1. All enhancements applied as Layer 2 — removable, auditable, governed.
                </p>
              </div>

              <div className="flex justify-center">
                <Button variant="outline" onClick={onBack} className="gap-2 rounded-xl">
                  <ArrowRight className="w-4 h-4" />
                  Explore the Full System
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
