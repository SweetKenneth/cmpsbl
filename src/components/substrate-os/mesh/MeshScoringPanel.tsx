/**
 * Intent Quality Scoring Panel
 * Shows leaderboard of best/worst intents and module rankings
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Trophy, TrendingUp, TrendingDown, Minus, RefreshCw,
  BarChart3, Target, Zap, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  getIntentLeaderboard,
  type IntentLeaderboard,
  type IntentQualityScore,
} from '@/lib/substrate/intent-mesh/intent-scoring';

const TREND_ICONS: Record<string, React.ReactNode> = {
  improving: <TrendingUp className="w-3 h-3 text-neon-green" />,
  stable: <Minus className="w-3 h-3 text-muted-foreground" />,
  declining: <TrendingDown className="w-3 h-3 text-destructive" />,
};

function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="text-muted-foreground w-16 truncate">{label}</span>
      <Progress value={score * 100} className="h-1 flex-1" />
      <span className="font-mono w-8 text-right">{(score * 100).toFixed(0)}%</span>
    </div>
  );
}

function IntentScoreCard({ score, rank }: { score: IntentQualityScore; rank?: number }) {
  return (
    <div className="p-3 rounded-lg bg-muted/20 border border-border/20 hover:border-neon-amber/20 transition-colors space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {rank != null && (
            <span className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
              rank === 0 ? "bg-neon-amber/20 text-neon-amber" :
              rank === 1 ? "bg-zinc-400/20 text-zinc-300" :
              rank === 2 ? "bg-neon-amber/20 text-neon-amber" :
              "bg-muted/30 text-muted-foreground"
            )}>
              {rank + 1}
            </span>
          )}
          <span className="text-xs font-medium">{score.intentType}</span>
          <Badge variant="outline" className="text-[9px]">{score.sourceModule}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {TREND_ICONS[score.trend]}
          <span className={cn(
            "text-sm font-bold",
            score.overallScore >= 70 ? "text-neon-green" :
            score.overallScore >= 40 ? "text-neon-amber" :
            "text-destructive"
          )}>
            {score.overallScore}
          </span>
        </div>
      </div>
      <div className="space-y-1">
        <ScoreBar score={score.resolutionRate} label="Resolution" />
        <ScoreBar score={score.responseRichness} label="Richness" />
        <ScoreBar score={score.latencyScore} label="Latency" />
        <ScoreBar score={score.crossModuleCoverage} label="Coverage" />
      </div>
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span>{score.sampleSize} samples</span>
        <span>•</span>
        <span>{score.trend}</span>
      </div>
    </div>
  );
}

export function MeshScoringPanel() {
  const [leaderboard, setLeaderboard] = useState<IntentLeaderboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'top' | 'worst' | 'improved' | 'modules'>('top');

  const loadScores = useCallback(async () => {
    setLoading(true);
    try {
      const lb = await getIntentLeaderboard();
      setLeaderboard(lb);
    } catch {
      toast.error('Failed to load intent scores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadScores(); }, [loadScores]);

  const views = [
    { key: 'top', label: 'Top Intents', icon: <Trophy className="w-3 h-3" /> },
    { key: 'worst', label: 'Needs Work', icon: <Target className="w-3 h-3" /> },
    { key: 'improved', label: 'Most Improved', icon: <TrendingUp className="w-3 h-3" /> },
    { key: 'modules', label: 'Module Rankings', icon: <BarChart3 className="w-3 h-3" /> },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {leaderboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border border-border/30 bg-muted/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-1">
                <Trophy className="h-4 w-4 text-neon-amber" />
                Top Score
              </div>
              <div className="text-xl font-bold">{leaderboard.topIntents[0]?.overallScore || '—'}</div>
            </CardContent>
          </Card>
          <Card className="border border-border/30 bg-muted/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-1">
                <Zap className="h-4 w-4 text-neon-magenta" />
                Intents Scored
              </div>
              <div className="text-xl font-bold">{leaderboard.topIntents.length + leaderboard.worstIntents.length}</div>
            </CardContent>
          </Card>
          <Card className="border border-border/30 bg-muted/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-1">
                <TrendingUp className="h-4 w-4 text-neon-green" />
                Improving
              </div>
              <div className="text-xl font-bold">{leaderboard.mostImproved.length}</div>
            </CardContent>
          </Card>
          <Card className="border border-border/30 bg-muted/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-1">
                <BarChart3 className="h-4 w-4 text-neon-cyan" />
                Modules Ranked
              </div>
              <div className="text-xl font-bold">{leaderboard.moduleRankings.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex items-center gap-1 border border-border/30 rounded-lg overflow-hidden w-fit">
        {views.map(v => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1",
              view === v.key ? 'bg-neon-amber/20 text-neon-amber' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {v.icon}{v.label}
          </button>
        ))}
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={loadScores} disabled={loading}>
          <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
        </Button>
      </div>

      {/* Content */}
      <Card className="border border-border/30 bg-muted/10">
        <CardContent className="p-4">
          <ScrollArea className="h-[450px]">
            {!leaderboard ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                {loading ? 'Calculating intent scores...' : 'No scoring data available yet. Mesh needs activity first.'}
              </p>
            ) : view === 'modules' ? (
              <div className="space-y-2">
                {leaderboard.moduleRankings.map((mr, i) => (
                  <div key={mr.module} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/20">
                    <span className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                      i === 0 ? "bg-neon-amber/20 text-neon-amber" : "bg-muted/30 text-muted-foreground"
                    )}>{i + 1}</span>
                    <Badge variant="outline" className="text-[10px] font-bold min-w-[70px] justify-center">{mr.module}</Badge>
                    <div className="flex-1">
                      <Progress value={mr.avgIntentQuality} className="h-1.5" />
                    </div>
                    <span className="text-xs font-mono font-bold">{mr.avgIntentQuality}</span>
                    <span className="text-[10px] text-muted-foreground">{mr.totalIntents} intents</span>
                  </div>
                ))}
                {leaderboard.moduleRankings.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">No module rankings yet.</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {(view === 'top' ? leaderboard.topIntents :
                  view === 'worst' ? leaderboard.worstIntents :
                  leaderboard.mostImproved
                ).map((score, i) => (
                  <IntentScoreCard key={`${score.sourceModule}:${score.intentType}`} score={score} rank={view === 'top' ? i : undefined} />
                ))}
                {(view === 'top' ? leaderboard.topIntents :
                  view === 'worst' ? leaderboard.worstIntents :
                  leaderboard.mostImproved
                ).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">No data for this view yet.</p>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
