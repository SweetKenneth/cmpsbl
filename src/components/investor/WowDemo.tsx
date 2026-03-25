/**
 * Investor Showcase — 30-Second WOW (Preloaded Ascension Preview)
 * Shows a before/after code transformation with visible timing.
 * Uses a preloaded example — guaranteed success, no user input.
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Check, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Preloaded "before" script — simple, relatable
const BEFORE_CODE = `// basic-auth.js
function login(user, pass) {
  if (user === "admin" && pass === "1234") {
    return { ok: true };
  }
  return { ok: false };
}

module.exports = { login };`;

// Preloaded "after" — what the substrate produces
const AFTER_CODE = `// auth-service.ts — Enhanced by CMPSBL Substrate
import { MemoryBind } from '@cmpsbl/runtime';
import { DefenseGate } from '@cmpsbl/runtime/defense';

interface AuthResult {
  success: boolean;
  token?: string;
  threat_score: number;
  attempts_remaining: number;
}

@MemoryBind({ persist: true, ttl: '24h' })
@DefenseGate({ maxAttempts: 5, lockoutMs: 300000 })
export class AuthService {
  private memory = MemoryBind.create('auth');

  async authenticate(
    credentials: { user: string; pass: string }
  ): Promise<AuthResult> {
    // DEFENSE: Rate limiting + threat scoring
    const threat = await this.assessThreat(credentials);
    if (threat.score > 0.7) {
      return { success: false, threat_score: threat.score, attempts_remaining: 0 };
    }

    // Validate against secure store (not hardcoded)
    const valid = await this.validateSecure(credentials);

    // MEMORY: Track auth patterns for anomaly detection
    this.memory.record('auth_attempt', {
      success: valid,
      timestamp: Date.now(),
      risk: threat.score,
    });

    return {
      success: valid,
      token: valid ? this.issueToken(credentials.user) : undefined,
      threat_score: threat.score,
      attempts_remaining: threat.remaining,
    };
  }
}`;

const ENHANCEMENTS = [
  { primitive: "DEFENSE", label: "Threat scoring + rate limiting", ms: 180 },
  { primitive: "MEMORY", label: "Persistent auth pattern tracking", ms: 240 },
  { primitive: "ENCODE", label: "TypeScript + type safety", ms: 320 },
  { primitive: "GOVERNANCE", label: "No hardcoded credentials", ms: 160 },
  { primitive: "FORGE", label: "Exportable artifact with runtime", ms: 340 },
];

const TOTAL_MS = 1240;

export const WowDemo = ({ onBack }: { onBack: () => void }) => {
  const [phase, setPhase] = useState<"ready" | "processing" | "done">("ready");
  const [currentStep, setCurrentStep] = useState(0);

  const runDemo = useCallback(() => {
    setPhase("processing");
    setCurrentStep(0);

    // Simulate each enhancement step
    let elapsed = 0;
    ENHANCEMENTS.forEach((e, i) => {
      elapsed += e.ms;
      setTimeout(() => setCurrentStep(i + 1), elapsed);
    });

    setTimeout(() => setPhase("done"), TOTAL_MS + 200);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Showcase
        </button>
        <span className="text-[10px] font-mono text-muted-foreground">30-SECOND PREVIEW</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold text-foreground">What CMPSBL Does</h1>
          <p className="text-sm text-muted-foreground">Watch a basic script transform into production-ready software</p>
        </div>

        <AnimatePresence mode="wait">
          {phase === "ready" && (
            <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Before */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-2 border-b border-border bg-muted/30 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground">INPUT — basic-auth.js</span>
                  <span className="text-[10px] font-mono text-destructive">3 vulnerabilities · 0 tests · no types</span>
                </div>
                <pre className="p-4 text-xs font-mono text-foreground/80 overflow-x-auto leading-relaxed">
                  {BEFORE_CODE}
                </pre>
              </div>

              <div className="flex justify-center">
                <Button size="lg" onClick={runDemo} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Transform This Code
                </Button>
              </div>
            </motion.div>
          )}

          {phase === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="rounded-xl border border-primary/20 bg-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium text-foreground">Analyzing with 40 primitives...</span>
                </div>
                <div className="space-y-2">
                  {ENHANCEMENTS.map((e, i) => (
                    <motion.div
                      key={e.primitive}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: i < currentStep ? 1 : 0.3, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${i < currentStep ? "bg-primary/10" : "bg-muted"}`}>
                        {i < currentStep ? (
                          <Check className="w-3 h-3 text-primary" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-primary w-24">{e.primitive}</span>
                      <span className="text-xs text-muted-foreground flex-1">{e.label}</span>
                      {i < currentStep && (
                        <span className="text-[10px] font-mono text-muted-foreground">{e.ms}ms</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {phase === "done" && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Timing badge */}
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-mono font-bold text-primary">Enhanced in {TOTAL_MS.toLocaleString()}ms</span>
              </div>

              {/* Side by side on desktop, stacked on mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Before */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-border bg-muted/30">
                    <span className="text-[10px] font-mono text-destructive">BEFORE</span>
                  </div>
                  <pre className="p-3 text-[10px] font-mono text-foreground/60 overflow-x-auto leading-relaxed max-h-60 overflow-y-auto">
                    {BEFORE_CODE}
                  </pre>
                </div>

                {/* After */}
                <div className="rounded-xl border-2 border-primary/30 bg-card overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-primary/20 bg-primary/5">
                    <span className="text-[10px] font-mono text-primary">AFTER — CMPSBL Enhanced</span>
                  </div>
                  <pre className="p-3 text-[10px] font-mono text-foreground/80 overflow-x-auto leading-relaxed max-h-60 overflow-y-auto">
                    {AFTER_CODE}
                  </pre>
                </div>
              </div>

              {/* Enhancement summary */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-wider text-primary">What Changed</p>
                <div className="grid grid-cols-2 gap-2">
                  {ENHANCEMENTS.map((e) => (
                    <div key={e.primitive} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-primary shrink-0" />
                      <span className="text-[10px] text-foreground">{e.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <Button variant="outline" onClick={onBack} className="gap-2">
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
