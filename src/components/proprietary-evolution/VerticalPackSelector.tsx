/**
 * VerticalPackSelector — Lets users pick a Vertical Pack to run
 * after the main 40-primitive Ascension completes.
 * Shows available verticals with affinity scoring and lock/unlock state.
 */

import { useState, useEffect, useMemo } from 'react';
import { Shield, Network, Coins, User, Scale, Lock, Zap, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import {
  listVerticalPacks,
  scoreVerticalAffinity,
  type VerticalPack,
  type VerticalSlug,
} from '@/lib/ascension/reserve-registry';
import {
  runVerticalCollision,
  type VerticalCollisionResult,
  type BaseDiscovery,
} from '@/lib/ascension/vertical-collision';

const ICON_MAP: Record<string, React.ElementType> = {
  Shield, Network, Coins, User, Scale,
};

interface Props {
  onComplete: (result: VerticalCollisionResult | null) => void;
  onSkip: () => void;
}

export function VerticalPackSelector({ onComplete, onSkip }: Props) {
  const [selectedVertical, setSelectedVertical] = useState<VerticalSlug | null>(null);
  const [running, setRunning] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [baseDiscoveries, setBaseDiscoveries] = useState<BaseDiscovery[]>([]);
  const [result, setResult] = useState<VerticalCollisionResult | null>(null);

  const packs = useMemo(() => listVerticalPacks(), []);

  useEffect(() => {
    loadIngestedCode();
    loadBaseDiscoveries();
  }, []);

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

  const runForge = async () => {
    if (!selectedVertical) return;
    setRunning(true);

    // Small delay for UX feedback
    await new Promise(r => setTimeout(r, 600));

    const collisionResult = runVerticalCollision(selectedVertical, codeContent, baseDiscoveries);
    setResult(collisionResult);
    setRunning(false);
    onComplete(collisionResult);
  };

  const getAffinity = (slug: VerticalSlug) => {
    if (!codeContent) return 0;
    return Math.round(scoreVerticalAffinity(slug, codeContent) * 100);
  };

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

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold">
            Vertical Pack — Optional
          </span>
        </div>
        <h3 className="text-lg font-bold text-foreground">
          Stack Specialized Discovery
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          Run an additional 5-primitive pass tuned for a specific domain.
          Discoveries stack on top of your base Ascension results.
        </p>
      </div>

      {/* Vertical Grid */}
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
                {/* Icon cluster */}
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

                  {/* Primitive pills */}
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

      {/* Result summary */}
      {result && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {result.successfulCollisions} Vertical Discoveries
            </span>
          </div>
          <div className="grid gap-1.5">
            {result.discoveries.map(d => (
              <div key={d.id} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-mono">{d.primitiveName}</span>
                <span className="text-foreground">{d.capabilityName}</span>
                <span className="text-primary font-mono">{d.cjpiScore}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          disabled={running}
          className="text-xs h-11 min-h-[44px] rounded-xl flex-1"
        >
          Skip Vertical Pack
        </Button>
        <Button
          size="sm"
          onClick={runForge}
          disabled={!selectedVertical || running}
          className="text-xs h-11 min-h-[44px] rounded-xl flex-1 gap-1.5 shadow-[0_0_12px_hsl(var(--primary)/0.15)]"
        >
          {running ? (
            <>
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              Forging…
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              Run {selectedVertical ? packs.find(p => p.slug === selectedVertical)?.name : 'Forge'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
