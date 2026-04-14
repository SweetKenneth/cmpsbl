/**
 * ProcessingStep — Orchestrator-driven progress
 * 
 * D1: Calls single executeRun() — no orchestration in UI
 * D2: Uses AbortController
 * B3: Progress derived from run milestones only
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  executeRun,
  getProgressFromMilestones,
  type AscensionRun,
  type AscensionResults,
} from '@/lib/ascension/orchestrator';

interface Props {
  run: AscensionRun | null;
  onComplete: (results: AscensionResults) => void;
}

export function ProcessingStep({ run, onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Preparing…');
  const [phase, setPhase] = useState<'preparing' | 'running' | 'done'>('preparing');
  const [discovered, setDiscovered] = useState(0);
  const [topScore, setTopScore] = useState(0);
  const executedRef = useRef(false);
  const { toast } = useToast();

  const runPipeline = useCallback(async (signal: AbortSignal) => {
    if (!run) {
      toast({ title: 'No run context', variant: 'destructive' });
      return;
    }

    // A2: Prevent double invocation
    if (executedRef.current) return;
    executedRef.current = true;

    try {
      setPhase('running');

      // D1: Single entry point — UI is not a controller
      const results = await executeRun(run, {
        onRunUpdate: (updatedRun) => {
          setDiscovered(updatedRun.discoveredCount);
          setTopScore(updatedRun.topScore);
          // B3: Progress derived from milestones
          setProgress(getProgressFromMilestones(updatedRun));
        },
        onProgress: (pct, msg) => {
          setProgress(pct);
          setStatusMessage(msg);
        },
      }, signal);

      setPhase('done');

      setTimeout(() => {
        onComplete(results);
      }, 1000);
    } catch (err) {
      if (signal.aborted) return;
      toast({ title: 'Analysis error', description: String(err), variant: 'destructive' });
    }
  }, [run, toast, onComplete]);

  useEffect(() => {
    // D2: AbortController for clean cancellation
    const controller = new AbortController();
    runPipeline(controller.signal);
    return () => { controller.abort(); };
  }, [runPipeline]);

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-5 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-lg font-bold text-foreground">Analysis Complete</p>
          <p className="text-sm text-muted-foreground">
            {discovered} capabilities discovered
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-12 space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">Analyzing Your Code</h2>
        <p className="text-sm text-muted-foreground">
          Testing your code against the substrate to discover new capabilities
        </p>
      </div>

      {/* Main progress — B3: derived from milestones */}
      <div className="space-y-4">
        <Progress value={progress} className="h-3 rounded-full" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">{statusMessage}</span>
          </div>
          <span className="text-sm font-bold text-foreground tabular-nums">{progress}%</span>
        </div>
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border/20 bg-card/40 p-4 text-center">
          <Sparkles className="w-4 h-4 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-foreground tabular-nums">{discovered}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Capabilities Found</p>
        </div>
        <div className="rounded-xl border border-border/20 bg-card/40 p-4 text-center">
          <div className={cn(
            "w-4 h-4 mx-auto mb-2 rounded-full",
            topScore >= 85 ? "bg-neon-amber" : topScore >= 60 ? "bg-primary" : "bg-muted-foreground"
          )} />
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {topScore > 0 ? topScore : '—'}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Top Score</p>
        </div>
      </div>

      {/* Phase indicator */}
      <div className="text-center">
        <span className={cn(
          "text-[10px] font-mono px-3 py-1 rounded-full border",
          progress >= 75
            ? "text-primary border-primary/20 bg-primary/5"
            : "text-muted-foreground border-border/20 bg-muted/10"
        )}>
          {progress >= 75 ? 'LOCKING RESULTS' : 'DISCOVERY PHASE'}
        </span>
      </div>
    </div>
  );
}
