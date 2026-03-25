/**
 * Ascension Demo — Tier 1.3
 * Before → After transformation through the 40-primitive matrix.
 * Preloaded example for zero-risk investor presentation.
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowLeft, ArrowRight, Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const PRIMITIVES_PIPELINE = [
  { name: "DEFENSE", label: "Security Scan", icon: "🛡️", duration: 400 },
  { name: "MEMORY", label: "Context Binding", icon: "🧠", duration: 350 },
  { name: "ENCODE", label: "Code Mutation", icon: "⚡", duration: 600 },
  { name: "GOVERNANCE", label: "Policy Check", icon: "📋", duration: 300 },
  { name: "FORGE", label: "Build & Export", icon: "🔨", duration: 450 },
];

const BEFORE_CODE = `// basic-auth.js — 23 lines, no tests, no types
const users = {};

function login(name, pass) {
  if (users[name] === pass) return { ok: true };
  return { ok: false };
}

function register(name, pass) {
  users[name] = pass;
  return { ok: true };
}

module.exports = { login, register };`;

const AFTER_CODE = `// auth-service.ts — Enhanced by CMPSBL Substrate
import { z } from 'zod';
import { DefenseLayer } from '@cmpsbl/defense';
import { MemoryStore } from '@cmpsbl/memory';
import { AuditTrail } from '@cmpsbl/governance';

const LoginSchema = z.object({
  username: z.string().min(3).max(64),
  password: z.string().min(8),
});

export class AuthService {
  private defense = new DefenseLayer({ mode: 'strict' });
  private memory = new MemoryStore('auth-sessions');
  private audit = new AuditTrail('auth');

  async login(input: unknown) {
    const { username, password } = LoginSchema.parse(input);
    
    // Rate limiting + threat detection
    await this.defense.evaluate({ actor: username, action: 'login' });
    
    // Secure credential verification
    const user = await this.memory.get(\`user:\${username}\`);
    if (!user || !await this.defense.verifyHash(password, user.hash)) {
      this.audit.record('login_failed', { username });
      throw new AuthError('Invalid credentials');
    }

    const session = await this.memory.createSession(user.id);
    this.audit.record('login_success', { username });
    return { token: session.token, expiresAt: session.expiresAt };
  }

  async register(input: unknown) {
    const { username, password } = LoginSchema.parse(input);
    await this.defense.evaluate({ actor: username, action: 'register' });
    
    const hash = await this.defense.hashPassword(password);
    await this.memory.set(\`user:\${username}\`, { hash, createdAt: Date.now() });
    this.audit.record('user_registered', { username });
    return { success: true };
  }
}`;

const ENHANCEMENTS = [
  "TypeScript with strict types",
  "Input validation (Zod schemas)",
  "Rate limiting + threat detection",
  "Secure password hashing",
  "Session management with TTL",
  "Full audit trail",
  "Exportable as standalone package",
];

interface AscensionDemoProps {
  onBack: () => void;
}

export const AscensionDemo = ({ onBack }: AscensionDemoProps) => {
  const [phase, setPhase] = useState<"ready" | "processing" | "complete">("ready");
  const [currentStep, setCurrentStep] = useState(-1);
  const [elapsed, setElapsed] = useState(0);

  const totalDuration = PRIMITIVES_PIPELINE.reduce((s, p) => s + p.duration, 0);
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
        <span className="text-[10px] font-mono text-muted-foreground">TIER 1 · ASCENSION</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Ascension</h1>
              <p className="text-xs text-muted-foreground">Before → After Transformation</p>
            </div>
          </div>
        </motion.div>

        {/* What You're Seeing */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <p className="text-[10px] font-mono uppercase tracking-wider text-primary mb-2">What You're Seeing</p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            A basic 23-line script enters the substrate. The 40-primitive matrix analyzes, hardens,
            and transforms it into production-ready software — with types, security, memory, and governance.
          </p>
        </motion.div>

        {/* Transformation CTA */}
        {phase === "ready" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <Button size="lg" className="gap-2" onClick={runTransformation}>
              <Play className="w-4 h-4" />
              Run Ascension
            </Button>
            <p className="text-[10px] text-muted-foreground mt-2">Preloaded example • Guaranteed result</p>
          </motion.div>
        )}

        {/* Pipeline Progress */}
        {phase !== "ready" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
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
                    className={`flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded-lg border transition-all ${
                      done
                        ? "bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400"
                        : active
                        ? "bg-primary/5 border-primary/20 text-primary animate-pulse"
                        : "bg-muted border-border text-muted-foreground"
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

        {/* Before / After Code */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: phase === "ready" ? 0.3 : 0 }}
          className="space-y-3"
        >
          <div className="grid grid-cols-1 gap-3">
            {/* Before */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-2 border-b border-border bg-muted/30 flex items-center gap-2">
                <span className="text-[10px] font-mono text-red-500">INPUT</span>
                <span className="text-[10px] font-mono text-muted-foreground">basic-auth.js</span>
              </div>
              <pre className="p-4 text-[11px] font-mono text-foreground/70 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {BEFORE_CODE}
              </pre>
            </div>

            {/* Arrow */}
            <div className="flex justify-center py-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                phase === "complete" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                <ArrowRight className="w-4 h-4 rotate-90" />
              </div>
            </div>

            {/* After */}
            <div className={`rounded-xl border overflow-hidden transition-all ${
              phase === "complete"
                ? "border-primary/30 bg-card"
                : "border-border bg-card opacity-40"
            }`}>
              <div className="px-4 py-2 border-b border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-green-600 dark:text-green-400">OUTPUT</span>
                  <span className="text-[10px] font-mono text-muted-foreground">auth-service.ts</span>
                </div>
                {phase === "complete" && (
                  <span className="text-[10px] font-mono text-primary">Enhanced in {elapsed}ms</span>
                )}
              </div>
              <pre className="p-4 text-[11px] font-mono text-foreground/70 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {AFTER_CODE}
              </pre>
            </div>
          </div>
        </motion.div>

        {/* Enhancements List — appears after completion */}
        <AnimatePresence>
          {phase === "complete" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3"
            >
              <p className="text-[10px] font-mono uppercase tracking-wider text-primary">What Changed</p>
              <div className="grid grid-cols-1 gap-1.5">
                {ENHANCEMENTS.map((e, i) => (
                  <motion.div
                    key={e}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-2 text-xs text-foreground"
                  >
                    <CheckCircle className="w-3 h-3 text-primary shrink-0" />
                    {e}
                  </motion.div>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={reset} className="mt-2">
                Run Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Why It Matters + Business Value */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-border bg-card p-5 space-y-4"
        >
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Why It Matters</p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Any code becomes production-grade. The transformation is deterministic, auditable, and
              repeatable — input basic code, output enterprise software.
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Business Value</p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Every developer becomes 10x. Every script becomes a product.
              The substrate is a software manufacturing line.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
