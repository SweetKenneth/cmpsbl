/**
 * ScanComparison — Side-by-side diff of two scan results.
 * Shows score deltas, new/fixed issues, and trend indicators.
 */

import { useMemo } from 'react';
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScanData {
  id: string;
  domain: string;
  score: number | null;
  fixed_count: number | null;
  created_at: string;
  metadata: Record<string, any> | null;
}

interface ScanComparisonProps {
  scanA: ScanData;
  scanB: ScanData;
  className?: string;
}

function ScoreDelta({ before, after }: { before: number; after: number }) {
  const delta = after - before;
  const isPositive = delta > 0;
  const isNeutral = delta === 0;

  return (
    <div className={cn(
      "flex items-center gap-1 text-sm font-semibold",
      isPositive ? "text-green-500" : isNeutral ? "text-muted-foreground" : "text-destructive"
    )}>
      {isPositive ? <ArrowUp className="w-4 h-4" /> : isNeutral ? <Minus className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
      <span>{isPositive ? '+' : ''}{delta}</span>
    </div>
  );
}

export function ScanComparison({ scanA, scanB, className }: ScanComparisonProps) {
  const dateA = new Date(scanA.created_at).toLocaleDateString();
  const dateB = new Date(scanB.created_at).toLocaleDateString();

  const scoreA = scanA.score ?? 0;
  const scoreB = scanB.score ?? 0;
  const fixedDelta = (scanB.fixed_count ?? 0) - (scanA.fixed_count ?? 0);

  const trend = useMemo(() => {
    if (scoreB > scoreA) return 'improving';
    if (scoreB < scoreA) return 'regressing';
    return 'stable';
  }, [scoreA, scoreB]);

  return (
    <div className={cn("bg-card border border-border/50 rounded-xl p-6", className)}>
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Scan Comparison</h3>
        <div className={cn(
          "ml-auto px-2 py-0.5 rounded-full text-xs font-medium",
          trend === 'improving' ? "bg-green-500/10 text-green-500" :
          trend === 'regressing' ? "bg-destructive/10 text-destructive" :
          "bg-muted text-muted-foreground"
        )}>
          {trend === 'improving' && <TrendingUp className="w-3 h-3 inline mr-1" />}
          {trend === 'regressing' && <TrendingDown className="w-3 h-3 inline mr-1" />}
          {trend.charAt(0).toUpperCase() + trend.slice(1)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        {/* Scan A */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{dateA}</p>
          <p className="text-3xl font-light text-foreground">{scoreA}</p>
          <p className="text-xs text-muted-foreground">Score</p>
        </div>

        {/* Delta */}
        <div className="flex flex-col items-center justify-center gap-1">
          <ScoreDelta before={scoreA} after={scoreB} />
          <p className="text-xs text-muted-foreground">Change</p>
          {fixedDelta !== 0 && (
            <p className={cn(
              "text-xs",
              fixedDelta > 0 ? "text-green-500" : "text-muted-foreground"
            )}>
              {fixedDelta > 0 ? '+' : ''}{fixedDelta} fixed
            </p>
          )}
        </div>

        {/* Scan B */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{dateB}</p>
          <p className="text-3xl font-light text-foreground">{scoreB}</p>
          <p className="text-xs text-muted-foreground">Score</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/30">
        <p className="text-xs text-muted-foreground text-center">
          {scanA.domain} · Comparing {dateA} → {dateB}
        </p>
      </div>
    </div>
  );
}
