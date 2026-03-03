/**
 * GATE Engine Scoreboard — Reusable component
 * Shows pass results with status icons, timing, and notes
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Shield, Play, Loader2, CheckCircle, XCircle, SkipForward, ChevronDown, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GateRunResult, GatePassResult } from '@/lib/gate/engine';

function statusIcon(status: string) {
  if (status === 'PASS') return <CheckCircle className="w-4 h-4 text-emerald-500" />;
  if (status === 'FAIL') return <XCircle className="w-4 h-4 text-destructive" />;
  return <SkipForward className="w-4 h-4 text-muted-foreground" />;
}

function PassRow({ result }: { result: GatePassResult }) {
  return (
    <Collapsible>
      <CollapsibleTrigger className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left">
        <span className="text-xs text-muted-foreground w-6">#{result.pass}</span>
        {statusIcon(result.status)}
        <span className="flex-1 text-sm font-medium truncate">{result.name}</span>
        <span className="text-xs text-muted-foreground">{result.durationMs}ms</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground transition-transform" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-12 pr-3 pb-2">
        <div className="space-y-1">
          {result.notes.map((note, i) => (
            <p key={i} className="text-xs text-muted-foreground break-words leading-relaxed">
              {note}
            </p>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface GateScoreboardProps {
  run: GateRunResult | null;
  isRunning: boolean;
  onRun: () => void;
  compact?: boolean;
}

export function GateScoreboard({ run, isRunning, onRun, compact = false }: GateScoreboardProps) {
  return (
    <Card className={cn("border-border/30", compact && "border-0 shadow-none bg-transparent")}>
      <CardHeader className={cn(compact ? "px-0 pt-0" : "")}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-base">GATE Engine</CardTitle>
              {!compact && (
                <CardDescription className="text-xs">Substrate production validation gauntlet</CardDescription>
              )}
            </div>
          </div>
          <Button
            onClick={onRun}
            disabled={isRunning}
            size="sm"
            variant={run?.status === 'failed' ? 'destructive' : 'default'}
          >
            {isRunning ? (
              <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Running...</>
            ) : (
              <><Play className="w-3.5 h-3.5 mr-1.5" /> Run Gauntlet</>
            )}
          </Button>
        </div>

        {run && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge variant={run.status === 'passed' ? 'default' : 'destructive'} className="text-xs">
              {run.status === 'passed' ? (
                <><CheckCircle className="w-3 h-3 mr-1" /> ALL PASSED</>
              ) : (
                <><XCircle className="w-3 h-3 mr-1" /> BLOCKED</>
              )}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              {run.passedCount}/{run.totalPasses} passed
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {run.durationMs}ms
            </Badge>
          </div>
        )}
      </CardHeader>

      {run && (
        <CardContent className={cn(compact ? "px-0 pb-0" : "")}>
          <div className="space-y-0.5">
            {run.passResults.map((r) => (
              <PassRow key={r.pass} result={r} />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

interface GateHistoryProps {
  runs: GateRunResult[];
  loading: boolean;
}

export function GateHistory({ runs, loading }: GateHistoryProps) {
  if (loading) return <p className="text-xs text-muted-foreground">Loading history...</p>;
  if (runs.length === 0) return <p className="text-xs text-muted-foreground">No previous runs</p>;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Run History</h3>
      <div className="space-y-1.5">
        {runs.map((run) => (
          <div
            key={run.id ?? run.createdAt}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            {run.status === 'passed' ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">
                  {run.passedCount}/{run.totalPasses} passed
                </span>
                <span className="text-[10px] text-muted-foreground">{run.durationMs}ms</span>
              </div>
              {run.createdAt && (
                <p className="text-[10px] text-muted-foreground truncate">
                  {new Date(run.createdAt).toLocaleString()}
                </p>
              )}
            </div>
            {run.failedCount > 0 && (
              <Badge variant="destructive" className="text-[10px]">
                {run.failedCount} failed
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
