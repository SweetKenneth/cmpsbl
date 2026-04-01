/**
 * VerticalPackSelector — Lets users pick a Vertical Pack to run
 * after the main 40-primitive Ascension completes.
 * Shows available verticals with affinity scoring and lock/unlock state.
 * Runs an animated per-primitive discovery sequence on forge execution.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Shield, Network, Coins, User, Scale, Lock, Zap, ChevronRight, Sparkles, ArrowRight, CheckCircle2, Loader2, Search } from 'lucide-react';
import forgeGraphic from '@/assets/forge-step-graphic.png';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import {
  listVerticalPacks,
  scoreVerticalAffinity,
  getReservePrimitives,
  type VerticalPack,
  type VerticalSlug,
} from '@/lib/ascension/reserve-registry';
import {
  runVerticalCollision,
  type VerticalCollisionResult,
  type VerticalDiscovery,
  type BaseDiscovery,
} from '@/lib/ascension/vertical-collision';

const ICON_MAP: Record<string, React.ElementType> = {
  Shield, Network, Coins, User, Scale,
};

/** Per-primitive scan phases shown during the forge sequence */
type PrimitiveScanPhase = 'waiting' | 'scanning' | 'analyzing' | 'complete';

interface PrimitiveScanState {
  primitiveId: string;
  primitiveName: string;
  icon: string;
  phase: PrimitiveScanPhase;
  /** Discoveries found by this primitive (populated on complete) */
  discoveries: VerticalDiscovery[];
}

interface Props {
  onComplete: (result: VerticalCollisionResult | null) => void;
  onSkip: () => void;
}

/** Delay helper */
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

export function VerticalPackSelector({ onComplete, onSkip }: Props) {
  const [selectedVertical, setSelectedVertical] = useState<VerticalSlug | null>(null);
  const [running, setRunning] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [baseDiscoveries, setBaseDiscoveries] = useState<BaseDiscovery[]>([]);
  const [finalResult, setFinalResult] = useState<VerticalCollisionResult | null>(null);

  // Animated scan state
  const [scanStates, setScanStates] = useState<PrimitiveScanState[]>([]);
  const [revealedDiscoveries, setRevealedDiscoveries] = useState<VerticalDiscovery[]>([]);
  const [scanLog, setScanLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const packs = useMemo(() => listVerticalPacks(), []);

  useEffect(() => {
    loadIngestedCode();
    loadBaseDiscoveries();
  }, []);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [scanLog]);

  const loadIngestedCode = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('artifact_registry')
      .select('metadata')
      .eq('user_id', user.id)
      .eq('category', 'proprietary-evolution')
      .eq('tier', 'candidate')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.metadata) {
      const meta = data.metadata as Record<string, unknown>;
      const sourceFiles = (meta.source_files as Array<{ content: string }>) || [];
      setCodeContent(sourceFiles.map(f => f.content || '').join('\n'));
    }
  };

  const loadBaseDiscoveries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('artifact_registry')
      .select('id, name, description, metadata')
      .eq('user_id', user.id)
      .eq('category', 'proprietary-ascended')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setBaseDiscoveries((data as Array<Record<string, unknown>>).map(d => ({
        id: String(d.id),
        name: String(d.name),
        description: String(d.description || ''),
        chain: ((d.metadata as Record<string, unknown>)?.chain as string[]) || [],
        cjpiScore: Number((d.metadata as Record<string, unknown>)?.cjpi_score || 0),
      })));
    }
  };

  const addLog = useCallback((msg: string) => {
    setScanLog(prev => [...prev, msg]);
  }, []);

  const updatePrimitivePhase = useCallback((id: string, phase: PrimitiveScanPhase, discoveries: VerticalDiscovery[] = []) => {
    setScanStates(prev => prev.map(s =>
      s.primitiveId === id ? { ...s, phase, discoveries } : s
    ));
  }, []);

  /**
   * Animated forge sequence — processes each primitive with visible stages:
   * 1. Initialize scan states for all 5 primitives
   * 2. For each primitive: scanning → analyzing → discoveries revealed → complete
   * 3. Final summary + hand-off to onComplete
   */
  const runForge = async () => {
    if (!selectedVertical) return;
    setRunning(true);
    setRevealedDiscoveries([]);
    setScanLog([]);

    const primitives = getReservePrimitives(selectedVertical);

    // Initialize all primitives as "waiting"
    const initialStates: PrimitiveScanState[] = primitives.map(p => ({
      primitiveId: p.id,
      primitiveName: p.name,
      icon: p.icon,
      phase: 'waiting' as PrimitiveScanPhase,
      discoveries: [],
    }));
    setScanStates(initialStates);

    addLog(`▸ Initializing ${selectedVertical.toUpperCase()} vertical collision engine…`);
    await wait(800);

    addLog(`▸ Loading ${primitives.length} reserve primitives…`);
    await wait(600);

    // Run the actual collision (instant) — we'll reveal results progressively
    const collisionResult = runVerticalCollision(selectedVertical, codeContent, baseDiscoveries);

    // Map discoveries to their source primitive
    const discoveryByPrimitive = new Map<string, VerticalDiscovery[]>();
    for (const d of collisionResult.discoveries) {
      const existing = discoveryByPrimitive.get(d.primitiveId) || [];
      existing.push(d);
      discoveryByPrimitive.set(d.primitiveId, existing);
    }

    // Process each primitive sequentially with animation
    for (let i = 0; i < primitives.length; i++) {
      const p = primitives[i];
      const primitiveDiscoveries = discoveryByPrimitive.get(p.id) || [];

      // Phase: Scanning
      updatePrimitivePhase(p.id, 'scanning');
      addLog(`▸ [${p.name}] Scanning code for ${p.category} patterns…`);
      await wait(1200 + Math.random() * 800);

      // Phase: Analyzing
      updatePrimitivePhase(p.id, 'analyzing');
      addLog(`▸ [${p.name}] Analyzing ${p.capabilities.length} capability vectors…`);
      await wait(1000 + Math.random() * 600);

      // Reveal discoveries one by one
      if (primitiveDiscoveries.length > 0) {
        for (const disc of primitiveDiscoveries) {
          addLog(`  ✦ ${disc.capabilityName} — CJPI ${disc.cjpiScore}`);
          setRevealedDiscoveries(prev => [...prev, disc]);
          await wait(600);
        }
        addLog(`▸ [${p.name}] ${primitiveDiscoveries.length} feature${primitiveDiscoveries.length !== 1 ? 's' : ''} discovered`);
      } else {
        addLog(`▸ [${p.name}] No high-affinity patterns — below threshold`);
      }

      // Phase: Complete
      updatePrimitivePhase(p.id, 'complete', primitiveDiscoveries);
      await wait(400);
    }

    // Final summary
    addLog('');
    addLog(`━━━ FORGE COMPLETE ━━━`);
    addLog(`▸ ${collisionResult.successfulCollisions} vertical discoveries stacked`);
    addLog(`▸ ${collisionResult.totalCollisions} total collisions processed`);
    addLog(`▸ Completed in ${Math.round(collisionResult.durationMs)}ms (engine) + animation`);

    setFinalResult(collisionResult);
    setRunning(false);
  };

  const handleConfirm = () => {
    if (finalResult) onComplete(finalResult);
  };

  const getAffinity = (slug: VerticalSlug) => {
    if (!codeContent) return 0;
    return Math.round(scoreVerticalAffinity(slug, codeContent) * 100);
  };

  const isForgeComplete = finalResult !== null;
  const showScanUI = scanStates.length > 0;

  return (
    <div className="space-y-6">
      {/* Skip banner — prominent first */}
      <div className="p-4 rounded-xl border border-border/20 bg-card/40 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">Not using agents?</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            This step is completely optional. Skip to go straight to Export.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onSkip}
          disabled={running}
          className="text-xs h-10 min-h-[44px] px-5 rounded-xl shrink-0 gap-1.5"
        >
          Skip to Export
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Header with graphic (hidden during scan) */}
      {!showScanUI && (
        <div className="text-center space-y-3">
          <img
            src={forgeGraphic}
            alt="Agent being scanned into 5 specialized capabilities"
            loading="lazy"
            width={800}
            height={600}
            className="w-48 h-auto mx-auto opacity-90"
          />
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold">
              Vertical Pack — Optional
            </span>
          </div>
           <h3 className="text-lg font-bold text-foreground">
             Upgrade to Super Agents
           </h3>
           <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
             Merge specialized agent personas into your base discoveries.
             Same {baseDiscoveries.length || 5} capabilities — each upgraded with domain expertise.
           </p>
        </div>
      )}

      {/* Vertical selection grid (hidden during/after scan) */}
      {!showScanUI && (
        <div className="grid gap-3">
          {packs.map((pack) => {
            const affinity = getAffinity(pack.slug);
            const isSelected = selectedVertical === pack.slug;
            const isLocked = !pack.available;

            return (
              <button
                key={pack.slug}
                onClick={() => !isLocked && setSelectedVertical(isSelected ? null : pack.slug)}
                disabled={isLocked || running}
                className={cn(
                  "relative w-full text-left p-4 rounded-xl border-2 transition-all duration-300",
                  "bg-card/60 backdrop-blur-sm",
                  isSelected
                    ? "border-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.15)] scale-[1.01]"
                    : isLocked
                      ? "border-border/10 opacity-50 cursor-not-allowed"
                      : "border-border/20 hover:border-border/40 hover:-translate-y-0.5",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    isSelected ? "bg-primary/15" : "bg-muted/30",
                  )}>
                    {isLocked ? (
                      <Lock className="w-4 h-4 text-muted-foreground/50" />
                    ) : (
                      <Zap className={cn("w-4 h-4", isSelected ? "text-primary" : "text-muted-foreground")} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-semibold text-sm",
                        isSelected ? "text-primary" : "text-foreground",
                      )}>
                        {pack.name}
                      </span>
                      {!isLocked && affinity > 0 && (
                        <span className={cn(
                          "text-[10px] font-mono px-1.5 py-0.5 rounded-full",
                          affinity > 60
                            ? "bg-green-500/15 text-green-400"
                            : affinity > 30
                              ? "bg-yellow-500/15 text-yellow-400"
                              : "bg-muted/30 text-muted-foreground",
                        )}>
                          {affinity}% affinity
                        </span>
                      )}
                      {isLocked && (
                        <span className="text-[10px] font-mono text-muted-foreground/50">Coming soon</span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed break-words">
                      {pack.tagline}
                    </p>

                    {pack.available && pack.primitives.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {pack.primitives.map(p => {
                          const Icon = ICON_MAP[p.icon] || Zap;
                          return (
                            <span
                              key={p.id}
                              className={cn(
                                "inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-md",
                                isSelected
                                  ? "bg-primary/10 text-primary border border-primary/20"
                                  : "bg-muted/20 text-muted-foreground border border-border/10",
                              )}
                            >
                              <Icon className="w-3 h-3" />
                              {p.name}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {!isLocked && (
                    <ChevronRight className={cn(
                      "w-4 h-4 shrink-0 transition-transform",
                      isSelected ? "text-primary rotate-90" : "text-muted-foreground/30",
                    )} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ═══ SCAN UI — shown during & after forge execution ═══ */}
      {showScanUI && (
        <div className="space-y-5 animate-fade-in">
          {/* Scan header */}
          <div className="text-center space-y-1">
             <h3 className="text-base font-bold text-foreground">
               {isForgeComplete ? 'Super Agents Forged' : 'Forging Super Agents…'}
             </h3>
             <p className="text-[11px] text-muted-foreground">
               {isForgeComplete
                 ? `${finalResult.successfulCollisions} capabilities upgraded with agent personas`
                 : 'Merging agent personas into your base discoveries'}
            </p>
          </div>

          {/* Primitive progress indicators */}
          <div className="grid gap-2.5">
            {scanStates.map((state) => {
              const Icon = ICON_MAP[state.icon] || Zap;
              return (
                <div
                  key={state.primitiveId}
                  className={cn(
                    "relative p-3 rounded-xl border transition-all duration-500",
                    state.phase === 'complete' && state.discoveries.length > 0
                      ? "bg-primary/5 border-primary/20"
                      : state.phase === 'complete'
                        ? "bg-muted/10 border-border/15"
                        : state.phase === 'scanning' || state.phase === 'analyzing'
                          ? "bg-card/80 border-primary/30 shadow-[0_0_12px_hsl(var(--primary)/0.08)]"
                          : "bg-card/40 border-border/10 opacity-50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Status icon */}
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      state.phase === 'complete' ? "bg-primary/10" : "bg-muted/20",
                    )}>
                      {state.phase === 'waiting' && <Icon className="w-3.5 h-3.5 text-muted-foreground/40" />}
                      {state.phase === 'scanning' && <Search className="w-3.5 h-3.5 text-primary animate-pulse" />}
                      {state.phase === 'analyzing' && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />}
                      {state.phase === 'complete' && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-xs font-semibold font-mono",
                          state.phase === 'complete' ? "text-foreground" : state.phase === 'waiting' ? "text-muted-foreground/50" : "text-primary",
                        )}>
                          {state.primitiveName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {state.phase === 'waiting' && 'Queued'}
                          {state.phase === 'scanning' && 'Scanning patterns…'}
                          {state.phase === 'analyzing' && 'Analyzing capabilities…'}
                          {state.phase === 'complete' && state.discoveries.length > 0
                            && `${state.discoveries.length} feature${state.discoveries.length !== 1 ? 's' : ''}`}
                          {state.phase === 'complete' && state.discoveries.length === 0
                            && 'No match'}
                        </span>
                      </div>
                      {/* Show inline discovery names for completed primitives */}
                      {state.phase === 'complete' && state.discoveries.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {state.discoveries.map(d => (
                            <span
                              key={d.id}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/15 break-words"
                            >
                              {d.capabilityName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live scan log */}
          <div
            ref={logRef}
            className="h-32 overflow-y-auto rounded-xl bg-background/80 border border-border/15 p-3 font-mono text-[10px] leading-relaxed text-muted-foreground"
          >
            {scanLog.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "animate-fade-in",
                  line.includes('✦') && 'text-primary font-semibold',
                  line.includes('FORGE COMPLETE') && 'text-foreground font-bold mt-1',
                )}
              >
                {line}
              </div>
            ))}
            {running && (
              <span className="inline-block w-1.5 h-3 bg-primary/60 animate-pulse ml-0.5" />
            )}
          </div>

          {/* Discovered features — full cards shown after completion */}
          {isForgeComplete && revealedDiscoveries.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
               <span className="text-sm font-semibold text-foreground">
                   Agent Personas Applied
                 </span>
              </div>
              <div className="grid gap-2">
                {revealedDiscoveries.map((d) => {
                  const Icon = ICON_MAP[scanStates.find(s => s.primitiveId === d.primitiveId)?.icon || ''] || Zap;
                  return (
                    <div
                      key={d.id}
                      className="p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-primary/15 animate-fade-in"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-foreground break-words">
                              {d.capabilityName}
                            </span>
                            <span className="text-[10px] font-mono text-primary shrink-0">
                              CJPI {d.cjpiScore}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed break-words">
                            {d.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground">
                              {d.primitiveName}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground">
                              {d.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center">
        {!isForgeComplete ? (
          <Button
            size="sm"
            onClick={runForge}
            disabled={!selectedVertical || running}
            className="text-xs h-11 min-h-[44px] rounded-xl w-full max-w-xs gap-1.5 shadow-[0_0_12px_hsl(var(--primary)/0.15)]"
          >
            {running ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Forging…
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                Run {selectedVertical ? packs.find(p => p.slug === selectedVertical)?.name : 'Forge'}
              </>
            )}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleConfirm}
            className="text-xs h-11 min-h-[44px] rounded-xl w-full max-w-xs gap-1.5 shadow-[0_0_12px_hsl(var(--primary)/0.15)]"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            Continue to Export with {revealedDiscoveries.length} Super Agents
          </Button>
        )}
      </div>
    </div>
  );
}
