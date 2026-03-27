/**
 * Ascension Demo — Tier 1.3
 * ━━━━━━━━━━━━━━━━━━━━━━━━━
 * Demonstrates the Capability Affinity System:
 *   1. Upload code → Detect archetype (Active / Passive / Hybrid)
 *   2. Filter capability pool by compatible styles
 *   3. Weighted CJPI selection → wrap software with matched capabilities
 *   4. Show annotated diff with investor-friendly explanations
 *
 * Works on both mobile and desktop viewports.
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, ArrowLeft, Play, CheckCircle, ArrowDown, 
  Zap, Shield, Eye, RotateCcw, Filter, Bot, Monitor, Workflow
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  detectArchetype,
  classifyAndSelect,
  type SubstrateCapability,
  type ArchetypeDetectionResult,
  type SoftwareArchetype,
} from "@/lib/ascension/capability-affinity";

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — EXAMPLE SOURCE CODE FOR EACH ARCHETYPE
// ═══════════════════════════════════════════════════════════════════════════════

interface ExampleSoftware {
  id: SoftwareArchetype;
  label: string;
  filename: string;
  icon: typeof Bot;
  description: string;
  code: string;
}

const EXAMPLES: ExampleSoftware[] = [
  {
    id: 'active',
    label: 'AI Agent',
    filename: 'research-agent.js',
    icon: Bot,
    description: 'An autonomous agent that searches, summarizes, and learns',
    code: `// research-agent.js
// A basic agent that searches and summarizes

async function research(query) {
  const results = await fetch(
    \`https://api.search.com?q=\${query}\`
  ).then(r => r.json());

  const summary = await callLLM(
    \`Summarize: \${results.text}\`
  );

  return { summary, sources: results.urls };
}

async function callLLM(prompt) {
  const res = await fetch('https://api.openai.com/v1/chat', {
    method: 'POST',
    headers: { Authorization: \`Bearer \${API_KEY}\` },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  return res.json().then(d => d.choices[0].message.content);
}

module.exports = { research };`,
  },
  {
    id: 'passive',
    label: 'Auth Screen',
    filename: 'LoginForm.tsx',
    icon: Monitor,
    description: 'A standard login form with email/password authentication',
    code: `// LoginForm.tsx
import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) window.location.href = '/dashboard';
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password}
        onChange={e => setPassword(e.target.value)} />
      <button type="submit">Sign In</button>
    </form>
  );
}`,
  },
  {
    id: 'hybrid',
    label: 'API Server',
    filename: 'api-server.ts',
    icon: Workflow,
    description: 'An Express middleware pipeline handling requests and responses',
    code: `// api-server.ts
import express from 'express';

const app = express();
app.use(express.json());

app.get('/api/users/:id', async (req, res) => {
  const user = await db.findUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

app.post('/api/users', async (req, res) => {
  const user = await db.createUser(req.body);
  res.status(201).json(user);
});

const handler = (req, res) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(\`\${req.method} \${req.url} \${Date.now() - start}ms\`);
  });
};

app.listen(3000);`,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — PRIMITIVE BADGE COLORS
// ═══════════════════════════════════════════════════════════════════════════════

const PRIMITIVE_COLORS: Record<string, string> = {
  DREAM: 'bg-[hsl(var(--neon-purple)/.15)] text-[hsl(var(--neon-purple))] border-[hsl(var(--neon-purple)/.25)]',
  NEXUS: 'bg-primary/10 text-primary border-primary/20',
  MEMORY: 'bg-[hsl(var(--neon-purple)/.15)] text-[hsl(var(--neon-purple))] border-[hsl(var(--neon-purple)/.25)]',
  ECHO: 'bg-[hsl(var(--neon-cyan)/.15)] text-[hsl(var(--neon-cyan))] border-[hsl(var(--neon-cyan)/.25)]',
  ORACLE: 'bg-[hsl(var(--neon-amber)/.15)] text-[hsl(var(--neon-amber))] border-[hsl(var(--neon-amber)/.25)]',
  CORTEX: 'bg-[hsl(var(--neon-magenta)/.15)] text-[hsl(var(--neon-magenta))] border-[hsl(var(--neon-magenta)/.25)]',
  HARVEST: 'bg-[hsl(var(--neon-green)/.15)] text-[hsl(var(--neon-green))] border-[hsl(var(--neon-green)/.25)]',
  DEFENSE: 'bg-[hsl(var(--neon-magenta)/.15)] text-[hsl(var(--neon-magenta))] border-[hsl(var(--neon-magenta)/.25)]',
  GOVERNANCE: 'bg-[hsl(var(--neon-amber)/.15)] text-[hsl(var(--neon-amber))] border-[hsl(var(--neon-amber)/.25)]',
  AUDIT: 'bg-[hsl(var(--neon-green)/.15)] text-[hsl(var(--neon-green))] border-[hsl(var(--neon-green)/.25)]',
  IMMUNITY: 'bg-[hsl(var(--neon-cyan)/.15)] text-[hsl(var(--neon-cyan))] border-[hsl(var(--neon-cyan)/.25)]',
  REFLEX: 'bg-primary/10 text-primary border-primary/20',
  EVOLUTION: 'bg-[hsl(var(--neon-green)/.15)] text-[hsl(var(--neon-green))] border-[hsl(var(--neon-green)/.25)]',
  IDENTITY: 'bg-[hsl(var(--neon-cyan)/.15)] text-[hsl(var(--neon-cyan))] border-[hsl(var(--neon-cyan)/.25)]',
  VISION: 'bg-[hsl(var(--neon-purple)/.15)] text-[hsl(var(--neon-purple))] border-[hsl(var(--neon-purple)/.25)]',
  INCLUSIVE: 'bg-[hsl(var(--neon-amber)/.15)] text-[hsl(var(--neon-amber))] border-[hsl(var(--neon-amber)/.25)]',
  RELAY: 'bg-primary/10 text-primary border-primary/20',
  INTEGRATION: 'bg-[hsl(var(--neon-cyan)/.15)] text-[hsl(var(--neon-cyan))] border-[hsl(var(--neon-cyan)/.25)]',
};

const ARCHETYPE_STYLES: Record<SoftwareArchetype, { color: string; bgColor: string; label: string }> = {
  active: { color: 'text-[hsl(var(--neon-green))]', bgColor: 'bg-[hsl(var(--neon-green)/.1)]', label: 'ACTION capabilities' },
  passive: { color: 'text-[hsl(var(--neon-cyan))]', bgColor: 'bg-[hsl(var(--neon-cyan)/.1)]', label: 'PASSIVE capabilities' },
  hybrid: { color: 'text-[hsl(var(--neon-amber))]', bgColor: 'bg-[hsl(var(--neon-amber)/.1)]', label: 'ACTION + PASSIVE capabilities' },
};


// ═══════════════════════════════════════════════════════════════════════════════
// §3 — MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface AscensionDemoProps {
  onBack: () => void;
}

type Phase = 'select' | 'scanning' | 'classified' | 'filtering' | 'wrapping' | 'complete';

export const AscensionDemo = ({ onBack }: AscensionDemoProps) => {
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedExample, setSelectedExample] = useState<ExampleSoftware | null>(null);
  const [detection, setDetection] = useState<ArchetypeDetectionResult | null>(null);
  const [poolSize, setPoolSize] = useState(0);
  const [excludedCount, setExcludedCount] = useState(0);
  const [selectedCaps, setSelectedCaps] = useState<SubstrateCapability[]>([]);
  const [wrapStep, setWrapStep] = useState(-1);
  const [elapsed, setElapsed] = useState(0);

  const progress = useMemo(() => {
    switch (phase) {
      case 'select': return 0;
      case 'scanning': return 15;
      case 'classified': return 30;
      case 'filtering': return 50;
      case 'wrapping': return 60 + ((wrapStep + 1) / Math.max(selectedCaps.length, 1)) * 35;
      case 'complete': return 100;
      default: return 0;
    }
  }, [phase, wrapStep, selectedCaps.length]);

  const runAscension = useCallback((example: ExampleSoftware) => {
    setSelectedExample(example);
    setPhase('scanning');
    const start = performance.now();

    // Step 1: Scan → classify
    setTimeout(() => {
      const det = detectArchetype(example.code);
      setDetection(det);
      setPhase('classified');

      // Step 2: Filter pool
      setTimeout(() => {
        const result = classifyAndSelect(example.code, 6, 42);
        setPoolSize(result.pool.length);
        setExcludedCount(result.excluded.length);
        setSelectedCaps(result.selected);
        setPhase('filtering');

        // Step 3: Wrap capabilities one at a time
        setTimeout(() => {
          setPhase('wrapping');
          setWrapStep(0);
          let step = 0;
          const advance = () => {
            if (step >= result.selected.length - 1) {
              setElapsed(Math.round(performance.now() - start));
              setPhase('complete');
              return;
            }
            step++;
            setWrapStep(step);
            setTimeout(advance, 250 + Math.random() * 150);
          };
          setTimeout(advance, 300);
        }, 600);
      }, 500);
    }, 800);
  }, []);

  const reset = () => {
    setPhase('select');
    setSelectedExample(null);
    setDetection(null);
    setPoolSize(0);
    setExcludedCount(0);
    setSelectedCaps([]);
    setWrapStep(-1);
    setElapsed(0);
  };

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

      <div className="relative max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-6">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center" style={{ boxShadow: "var(--shadow-glow)" }}>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Ascension Engine</h1>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 shrink-0 uppercase tracking-wider">
                  Confidential
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Upload code → Classify → Filter → Wrap with matched capabilities</p>
            </div>
          </div>
        </motion.div>

        {/* How It Works — always visible */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="rounded-xl border border-border/20 bg-card/60 backdrop-blur-sm p-4 space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold">How Capability Affinity Works</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { step: '1', title: 'Classify', desc: 'Code is scanned and classified into an archetype: Active, Passive, or Hybrid' },
              { step: '2', title: 'Filter Pool', desc: 'Incompatible capabilities are excluded (no DREAM states for a login form)' },
              { step: '3', title: 'Weighted Select', desc: 'CJPI-weighted random selection from the filtered pool — different every time' },
              { step: '4', title: 'Wrap & Export', desc: 'Selected capabilities are injected. Original code preserved, substrate layer added' },
            ].map((s) => (
              <div key={s.step} className="flex gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-mono font-bold text-primary">{s.step}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{s.title}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── PHASE: SELECT EXAMPLE ─── */}
        <AnimatePresence mode="wait">
          {phase === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground font-bold">Choose software to upload</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {EXAMPLES.map((ex) => {
                  const Icon = ex.icon;
                  return (
                    <button key={ex.id} onClick={() => runAscension(ex)}
                      className="text-left rounded-xl border border-border/20 bg-card/60 backdrop-blur-sm p-4 space-y-2 hover:border-primary/25 hover:bg-card/80 transition-all group active:scale-[0.98]">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-foreground">{ex.label}</span>
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground">{ex.filename}</p>
                      <p className="text-xs text-foreground/70 leading-relaxed">{ex.description}</p>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-3 h-3" />Run Ascension
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── PROCESSING PHASES ─── */}
        {phase !== 'select' && selectedExample && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-muted-foreground">
                  {phase === 'scanning' && 'Scanning source code…'}
                  {phase === 'classified' && 'Archetype detected'}
                  {phase === 'filtering' && 'Filtering capability pool…'}
                  {phase === 'wrapping' && `Wrapping capability ${wrapStep + 1}/${selectedCaps.length}…`}
                  {phase === 'complete' && 'Ascension Complete'}
                </span>
                {phase === 'complete' && <span className="font-mono font-bold text-primary">{elapsed}ms</span>}
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Source Code */}
            <div className="rounded-xl border border-border/20 bg-card/40 overflow-hidden">
              <div className="px-4 py-2 border-b border-border/20 bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-destructive">INPUT</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{selectedExample.filename}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <pre className="p-3 text-[10px] sm:text-[11px] font-mono leading-[1.7] text-foreground/60">
                  {selectedExample.code}
                </pre>
              </div>
            </div>

            {/* ─── Classification Result ─── */}
            {detection && phase !== 'scanning' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="rounded-xl border border-border/20 bg-card/60 backdrop-blur-sm p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary" />
                      <span className="text-xs font-mono font-bold text-foreground">Archetype Detected</span>
                    </div>
                    <div className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                      ARCHETYPE_STYLES[detection.archetype].bgColor
                    } ${ARCHETYPE_STYLES[detection.archetype].color}`}>
                      {detection.label} — {Math.round(detection.confidence * 100)}% confidence
                    </div>
                  </div>

                  {/* Signal breakdown */}
                  <div className="flex flex-wrap gap-1.5">
                    {detection.signals.slice(0, 12).map((s, i) => (
                      <span key={i} className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground border border-border/20">
                        {s.keyword} <span className="text-primary">+{s.weight}</span>
                      </span>
                    ))}
                  </div>

                  {/* What this means */}
                  <div className="pt-1 border-t border-border/10">
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      <span className="font-bold text-foreground">Result: </span>
                      {detection.archetype === 'active' 
                        ? 'This is an autonomous agent. The system will prioritize ACTION capabilities like DREAM states, NEXUS routing, and MEMORY persistence — things that make agents smarter and more reliable.'
                        : detection.archetype === 'passive'
                        ? 'This is a UI/form. The system will prioritize PASSIVE capabilities like IDENTITY binding, VISION accessibility, and RELAY sync — things that make interfaces more secure and accessible. DREAM states and NEXUS routing are excluded as incompatible.'
                        : 'This is a middleware pipeline. The system will pull from BOTH action and passive pools — APIs need security, routing, AND request handling capabilities.'
                      }
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── Pool Filtering Visualization ─── */}
            {(phase === 'filtering' || phase === 'wrapping' || phase === 'complete') && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="rounded-xl border border-border/20 bg-card/60 backdrop-blur-sm p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" />
                    <span className="text-xs font-mono font-bold text-foreground">Capability Pool</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="text-center p-2 rounded-lg bg-muted/20 border border-border/10">
                      <p className="text-lg font-black text-foreground">{poolSize + excludedCount}</p>
                      <p className="text-[9px] font-mono text-muted-foreground">TOTAL</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-[hsl(var(--neon-green)/.08)] border border-[hsl(var(--neon-green)/.15)]">
                      <p className="text-lg font-black text-[hsl(var(--neon-green))]">{poolSize}</p>
                      <p className="text-[9px] font-mono text-muted-foreground">COMPATIBLE</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-destructive/5 border border-destructive/15">
                      <p className="text-lg font-black text-destructive">{excludedCount}</p>
                      <p className="text-[9px] font-mono text-muted-foreground">EXCLUDED</p>
                    </div>
                  </div>

                  {excludedCount > 0 && (
                    <p className="text-[10px] text-muted-foreground italic">
                      {detection?.archetype === 'active' 
                        ? 'Excluded: IDENTITY binding, VISION accessibility, INCLUSIVE i18n, RELAY sync, INTEGRATION bridge (passive-only capabilities not useful for agents)'
                        : detection?.archetype === 'passive'
                        ? 'Excluded: DREAM states, NEXUS routing, MEMORY persistence, ECHO amplification, ORACLE prediction, CORTEX orchestration, HARVEST ingestion (action-only capabilities not useful for UIs)'
                        : 'No exclusions — hybrid software can use all capability styles'
                      }
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* ─── Selected Capabilities ─── */}
            {(phase === 'wrapping' || phase === 'complete') && selectedCaps.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
                    Capabilities Injected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCaps.map((cap, i) => {
                    const isDone = phase === 'complete' || i <= wrapStep;
                    const isActive = phase === 'wrapping' && i === wrapStep;
                    const colorClass = PRIMITIVE_COLORS[cap.primitive] || 'bg-muted/20 text-foreground border-border/20';

                    return (
                      <motion.div key={cap.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: isDone || isActive ? 1 : 0.3, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`rounded-xl border p-4 space-y-2 transition-all ${
                          isDone ? 'border-primary/15 bg-card/70 backdrop-blur-sm' 
                          : isActive ? 'border-primary/25 bg-card/60 animate-pulse'
                          : 'border-border/10 bg-card/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${colorClass}`}>
                              {cap.primitive}
                            </span>
                            <span className="text-xs font-bold text-foreground">{cap.name}</span>
                          </div>
                          {isDone && <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{cap.description}</p>
                        {isDone && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                            className="pt-1.5 border-t border-border/10">
                            <p className="text-[10px] leading-relaxed">
                              <span className="font-bold text-primary">Business Value: </span>
                              <span className="text-foreground/80">{cap.investorValue}</span>
                            </p>
                          </motion.div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-muted-foreground/60">CJPI Weight: {cap.baseWeight}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ─── Completion Summary ─── */}
            <AnimatePresence>
              {phase === 'complete' && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
                  {/* Key Insight */}
                  <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5 sm:p-6 space-y-3">
                    <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold">Why This Matters for Investors</p>
                    <div className="space-y-2 text-xs text-foreground/80 leading-relaxed">
                      <p>
                        <span className="font-bold text-foreground">The pool was filtered by archetype.</span> An {detection?.archetype === 'active' ? 'agent' : detection?.archetype === 'passive' ? 'auth screen' : 'API'} doesn't 
                        get random capabilities — it gets <span className="text-primary font-semibold">the right ones</span>. 
                        {detection?.archetype === 'active' 
                          ? ' DREAM states make sense for an agent that learns. They don\'t make sense for a login form.'
                          : detection?.archetype === 'passive'
                          ? ' IDENTITY binding makes sense for auth. DREAM states don\'t — the system knows this.'
                          : ' An API needs both security and routing — the system pulls from both pools.'
                        }
                      </p>
                      <p>
                        <span className="font-bold text-foreground">Selection is weighted, not random.</span> Higher CJPI scores 
                        = higher probability. The system learns which capability combinations work best for each software type 
                        and favors proven patterns — while still discovering new ones.
                      </p>
                      <p>
                        <span className="font-bold text-foreground">Original code is preserved.</span> The substrate wraps around 
                        the uploaded software without modifying a single line. If CMPSBL disappeared, the original code still runs.
                      </p>
                    </div>
                  </div>

                  {/* After Ascension capabilities list */}
                  <div className="rounded-xl border border-border/20 bg-card/60 backdrop-blur-sm p-4 space-y-3">
                    <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold">
                      After Ascension, {selectedExample.filename} Can:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {selectedCaps.map((cap, i) => (
                        <motion.div key={cap.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.04 }}
                          className="flex items-start gap-2 text-xs text-foreground"
                        >
                          <CheckCircle className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          <span>{cap.investorValue}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Try another */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Button variant="outline" size="sm" onClick={reset} className="gap-2 rounded-lg">
                      <RotateCcw className="w-3 h-3" />
                      Try Different Software
                    </Button>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Same code will get different capabilities each run (weighted random)
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};
