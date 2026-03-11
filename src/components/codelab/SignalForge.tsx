/**
 * SIGNAL FORGE — Blueprint Synthesis Engine
 * 
 * Generates production-ready pipeline blueprints from the substrate's
 * combinatorial space. Auth-gated downloads with daily rate limits.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Sparkles, Dices, Download, Zap, Brain, Shield, Moon, Eye, 
  MessageSquare, Settings, Cpu, Globe, ArrowRight, Check, 
  Copy, Lock, Network, Flame, RefreshCw, LogIn, Hexagon
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { forgeSignalBatch } from "@/lib/substrate/forge/signal-forge";
import type { GeneratedTemplate } from "@/lib/discovery/template-generator";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const DAILY_LIMIT = 5;
const STORAGE_KEY = 'signal-forge-downloads';

interface DownloadRecord { date: string; count: number; }

function getTodayDownloads(): DownloadRecord {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const record: DownloadRecord = JSON.parse(raw);
      if (record.date === today) return record;
    }
  } catch {}
  return { date: today, count: 0 };
}

function incrementDownloads(): DownloadRecord {
  const record = getTodayDownloads();
  record.count++;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  return record;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  cognitive: Brain, evolution: Flame, security: Shield, routing: Network,
  learning: Brain, orchestration: Cpu, integration: Globe, observability: Eye,
  governance: Shield, compliance: Lock, prediction: Sparkles, ethics: Shield,
  privacy: Lock, synthesis: Zap, localization: Globe, geospatial: Globe,
  simulation: Cpu, contracts: Settings, acquisition: Download, edge: Zap,
};

// ═══════════════════════════════════════════════════════════════
// Forging Ritual — full-screen synthesis animation
// ═══════════════════════════════════════════════════════════════

function ForgeRitualOverlay({ onComplete }: { onComplete: () => void }) {
  const progress = useMotionValue(0);
  const displayProgress = useTransform(progress, v => Math.round(v));
  const [phase, setPhase] = useState(0);

  const phases = [
    'Scanning module space…',
    'Mapping topology combinations…',
    'Validating CJPI thresholds…',
    'Scoring blueprint integrity…',
    'Materializing blueprints…',
  ];

  useEffect(() => {
    const ctrl = animate(progress, 100, {
      duration: 2.4,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (v) => {
        const p = Math.floor((v / 100) * phases.length);
        setPhase(Math.min(p, phases.length - 1));
      },
      onComplete,
    });
    return () => ctrl.stop();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
    >
      <div className="text-center px-6 max-w-sm">
        {/* Animated forge ring */}
        <div className="relative w-28 h-28 mx-auto mb-6">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-neon-cyan/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-4 rounded-full border border-neon-purple/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-6 rounded-full bg-primary/10"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span className="text-2xl font-black font-mono text-primary tabular-nums">
              {displayProgress}
            </motion.span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-sm font-mono text-muted-foreground"
          >
            {phases[phase]}
          </motion.p>
        </AnimatePresence>

        <div className="mt-6 flex justify-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{
                y: [0, -12, 0],
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.3, 0.8],
              }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export function SignalForge() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isForging, setIsForging] = useState(false);
  const [showRitual, setShowRitual] = useState(false);
  const [forgedTemplates, setForgedTemplates] = useState<GeneratedTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<GeneratedTemplate | null>(null);
  const [downloadsToday, setDownloadsToday] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealIndex, setRevealIndex] = useState(-1);
  const pendingResult = useRef<GeneratedTemplate[] | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    setDownloadsToday(getTodayDownloads().count);
    return () => subscription.unsubscribe();
  }, []);

  const handleForge = useCallback(() => {
    setIsForging(true);
    setShowRitual(true);
    setRevealIndex(-1);
    setSelectedTemplate(null);

    requestAnimationFrame(() => {
      const result = forgeSignalBatch({
        batchSize: 12, minModules: 2, maxModules: 5,
        minCjpiTarget: 80, biasHighValue: true,
      });
      pendingResult.current = result.templates;
    });
  }, []);

  const handleRitualComplete = useCallback(() => {
    setShowRitual(false);
    setIsForging(false);
    const templates = pendingResult.current || [];
    pendingResult.current = null;
    setForgedTemplates(templates);
    toast.success(`${templates.length} blueprints forged`);
    templates.forEach((_, i) => {
      setTimeout(() => setRevealIndex(i), i * 80);
    });
  }, []);

  const handleDownload = (template: GeneratedTemplate) => {
    if (!user) { toast.error('Sign in to export blueprints'); return; }
    const record = getTodayDownloads();
    if (record.count >= DAILY_LIMIT) {
      toast.error(`Daily limit reached (${DAILY_LIMIT}/day). Come back tomorrow!`);
      return;
    }
    const content = `/**\n * ${template.namePattern}\n * SIGNAL FORGE — CMPSBL Substrate\n * Category: ${template.category}\n * Chain: ${template.modulePattern.join(' → ')}\n * ${template.rationale}\n */\n\nimport { substrate } from '@cmpsbl/sdk';\n\nconst pipeline = substrate.pipeline({\n  name: '${template.namePattern}',\n  modules: [${template.modulePattern.map(m => `'${m}'`).join(', ')}],\n  category: '${template.category}',\n  errorStrategy: '${template.errorStrategy}',\n  maxExecutionMs: ${template.maxExecutionMs},\n});\n\n${template.modulePattern.map((m, i) => `const ${m.toLowerCase()}Node = pipeline.node('${m}', { order: ${i + 1} });`).join('\n')}\n\npipeline.entry('${template.entryPattern}', ${template.modulePattern[0].toLowerCase()}Node);\n${template.modulePattern.slice(0, -1).map((m, i) => `${m.toLowerCase()}Node.pipe(${template.modulePattern[i + 1].toLowerCase()}Node);`).join('\n')}\n${template.modulePattern[template.modulePattern.length - 1].toLowerCase()}Node.exit('${template.exitPattern}');\n\nexport async function run(input: Record<string, unknown>) {\n  return pipeline.execute(input);\n}\n\nexport default pipeline;\n`;
    const blob = new Blob([content], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.namePattern.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ts`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    const updated = incrementDownloads();
    setDownloadsToday(updated.count);
    toast.success(`Exported: ${template.namePattern} (${updated.count}/${DAILY_LIMIT} today)`);
  };

  const handleCopy = (template: GeneratedTemplate) => {
    const snippet = `// ${template.namePattern} — ${template.category}\n// Modules: ${template.modulePattern.join(' → ')}\nimport { substrate } from '@cmpsbl/sdk';\nconst pipeline = substrate.pipeline({\n  name: '${template.namePattern}',\n  modules: [${template.modulePattern.map(m => `'${m}'`).join(', ')}],\n  category: '${template.category}',\n});`;
    navigator.clipboard.writeText(snippet);
    setCopiedId(template.namePattern);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Blueprint copied');
  };

  const remaining = DAILY_LIMIT - downloadsToday;

  const avgCjpi = (t: GeneratedTemplate) => {
    const b = t.baseBreakdown;
    return Math.round(
      b.strategicLeverage * 0.30 + b.recursionPotential * 0.20 +
      b.crossNodeImpact * 0.15 + b.composability * 0.15 +
      b.governanceInfluence * 0.10 + b.moatSensitivity * 0.10
    );
  };

  const STEPS = [
    { icon: Dices, label: 'Randomize', color: 'text-primary' },
    { icon: Brain, label: 'Synthesize', color: 'text-neon-cyan' },
    { icon: Zap, label: 'Validate', color: 'text-neon-amber' },
    { icon: Eye, label: 'Preview', color: 'text-neon-green' },
    { icon: Download, label: 'Export', color: 'text-neon-purple' },
  ];

  return (
    <section className="relative overflow-hidden">
      <AnimatePresence>
        {showRitual && <ForgeRitualOverlay onComplete={handleRitualComplete} />}
      </AnimatePresence>

      {/* Hero */}
      <div className="relative border-b border-border/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] md:w-[600px] h-[200px] md:h-[300px] rounded-full bg-primary/6 blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[200px] h-[200px] rounded-full bg-neon-cyan/4 blur-[80px]" />

        <div className="container mx-auto px-4 sm:px-6 pt-8 pb-8 sm:pt-12 sm:pb-10 md:pt-20 md:pb-16 relative">
          <div className="max-w-2xl mx-auto text-center">
            {/* Zone badge */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-3 sm:mb-4">
              <Badge variant="outline" className="gap-1.5 px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-mono border-primary/25 bg-primary/5 text-primary uppercase tracking-wider">
                <Hexagon className="w-3 h-3" />
                CodeLab Zone
              </Badge>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-[1.75rem] leading-[1.1] sm:text-4xl md:text-5xl lg:text-[3.5rem] font-black tracking-tight mb-2 sm:mb-3"
            >
              <span className="text-foreground">CodeLab</span>
              <span className="text-muted-foreground mx-2">—</span>
              <span className="bg-gradient-to-r from-primary via-neon-cyan to-neon-purple bg-clip-text text-transparent">
                SIGNAL FORGE
              </span>
            </motion.h1>

            {/* Tagline — the vibe */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-sm sm:text-base md:text-lg font-semibold text-foreground/90 mb-2 sm:mb-3"
            >
              The system discovered working software architectures.
            </motion.p>

            {/* Detailed description */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="text-[13px] sm:text-sm md:text-[15px] text-muted-foreground leading-relaxed mb-6 sm:mb-8 max-w-lg mx-auto"
            >
              Every blueprint below was autonomously synthesized — not hand-authored. 
              The substrate's discovery engine maps the full combinatorial space of{' '}
              <span className="text-foreground font-medium">31 nodes × 20 categories</span>, 
              scores each topology against CJPI integrity thresholds, and surfaces only 
              architectures that survive validation. What you're forging is the output of 
              a system that runs continuously, retiring exhausted combinations and evolving 
              toward higher-value pipeline configurations.
            </motion.p>

            {/* Limits badge */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.14 }} className="flex justify-center mb-4 sm:mb-6">
              <Badge variant="outline" className="text-[9px] sm:text-[10px] font-mono border-muted text-muted-foreground">
                {DAILY_LIMIT} exports / day · Autonomous Discovery
              </Badge>
            </motion.div>

            {/* Pipeline flow — responsive */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mb-6 sm:mb-8 mx-auto"
            >
              <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
                {STEPS.map((step, i) => (
                  <div key={i} className="flex items-center gap-1 sm:gap-2">
                    <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                      <div className={cn(
                        "w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg border border-border/60 bg-card/80",
                        "flex items-center justify-center transition-transform hover:scale-110"
                      )}>
                        <step.icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5", step.color)} />
                      </div>
                      <span className="text-[9px] sm:text-[10px] md:text-[11px] font-medium text-muted-foreground">{step.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-border mt-[-12px] sm:mt-[-14px] shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="space-y-2.5 sm:space-y-3"
            >
              <Button
                size="lg"
                onClick={handleForge}
                disabled={isForging}
                className="gap-2.5 sm:gap-3 px-6 sm:px-8 h-11 sm:h-13 text-sm sm:text-base font-bold shadow-xl shadow-primary/25 hover:shadow-primary/35 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Dices className="w-4 h-4 sm:w-5 sm:h-5" />
                Forge Blueprints
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>

              {forgedTemplates.length > 0 && (
                <div>
                  <Button variant="ghost" size="sm" onClick={handleForge} disabled={isForging} className="gap-2 text-muted-foreground text-xs sm:text-sm">
                    <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Re-Forge
                  </Button>
                </div>
              )}

              <p className="text-[11px] sm:text-xs text-muted-foreground">
                {user ? (
                  <span className="font-mono text-neon-green">{remaining} exports remaining today</span>
                ) : (
                  <>Forge freely · <Link to="/auth" className="text-primary hover:underline font-medium">Sign in</Link> to export</>
                )}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {forgedTemplates.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">Forged Blueprints</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">{forgedTemplates.length} autonomous discoveries — validated architectures</p>
              </div>
              <Badge variant="outline" className="text-[9px] sm:text-[10px] font-mono">CJPI VALIDATED</Badge>
            </div>

            <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {forgedTemplates.map((template, index) => {
                const Icon = CATEGORY_ICONS[template.category] || Zap;
                const cjpi = avgCjpi(template);
                const isSelected = selectedTemplate?.namePattern === template.namePattern;
                const isRevealed = index <= revealIndex;

                return (
                  <motion.div
                    key={template.namePattern + index}
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={isRevealed ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <Card
                      className={cn(
                        "p-3 sm:p-4 cursor-pointer transition-all duration-200",
                        "hover:border-primary/40 hover:shadow-md hover:shadow-primary/5",
                        isSelected && "border-primary ring-1 ring-primary/20"
                      )}
                      onClick={() => setSelectedTemplate(isSelected ? null : template)}
                    >
                      <div className="flex items-start gap-2.5 sm:gap-3 mb-2">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[13px] sm:text-sm truncate">{template.namePattern}</h3>
                          <p className="text-[10px] sm:text-[11px] text-muted-foreground capitalize">{template.category}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn("shrink-0 text-[10px] font-mono tabular-nums",
                            cjpi >= 90 ? 'text-neon-green border-neon-green/30' :
                            cjpi >= 80 ? 'text-neon-cyan border-neon-cyan/30' :
                            'text-neon-amber border-neon-amber/30'
                          )}
                        >
                          {cjpi}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {template.modulePattern.map((mod, i) => (
                          <Badge key={i} variant="secondary" className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0">{mod}</Badge>
                        ))}
                      </div>

                      <p className="text-[10px] sm:text-[11px] text-muted-foreground line-clamp-2">{template.descriptionPattern}</p>

                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3 mt-3 border-t border-border/50 space-y-3">
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                {[
                                  { v: template.baseBreakdown.strategicLeverage, l: 'Strategy' },
                                  { v: template.baseBreakdown.composability, l: 'Compose' },
                                  { v: template.baseBreakdown.crossNodeImpact, l: 'Impact' },
                                ].map((s, i) => (
                                  <div key={i} className="text-center p-1.5 rounded bg-muted/50">
                                    <p className="font-mono font-bold text-foreground tabular-nums">{s.v}</p>
                                    <p className="text-muted-foreground text-[10px]">{s.l}</p>
                                  </div>
                                ))}
                              </div>

                              <p className="text-[11px] text-muted-foreground italic">"{template.rationale}"</p>

                              <pre className="bg-muted/50 p-3 rounded text-[11px] font-mono overflow-auto max-h-32">
{`// ${template.namePattern}
import { substrate } from '@cmpsbl/sdk';

const pipeline = substrate.pipeline({
  modules: [${template.modulePattern.map(m => `'${m}'`).join(', ')}],
  category: '${template.category}',
  errorStrategy: '${template.errorStrategy}',
});`}
                              </pre>

                              <div className="flex gap-2">
                                {user ? (
                                  <Button size="sm" className="flex-1 gap-1.5" onClick={(e) => { e.stopPropagation(); handleDownload(template); }} disabled={remaining <= 0}>
                                    <Download className="w-3.5 h-3.5" />
                                    {remaining > 0 ? 'Export .ts' : 'Limit Reached'}
                                  </Button>
                                ) : (
                                  <Button asChild size="sm" className="flex-1 gap-1.5">
                                    <Link to="/auth"><LogIn className="w-3.5 h-3.5" />Sign In to Export</Link>
                                  </Button>
                                )}
                                <Button variant="outline" size="sm" className="gap-1.5" onClick={(e) => { e.stopPropagation(); handleCopy(template); }}>
                                  {copiedId === template.namePattern ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}