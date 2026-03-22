/**
 * Scan History Timeline — Gap #7
 * Shows score progression over time for a domain
 */

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ScanEntry {
  id: string;
  domain: string;
  score: number | null;
  created_at: string;
}

export function ScanHistoryTimeline({ domain }: { domain: string }) {
  const [scans, setScans] = useState<ScanEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!domain) return;
    supabase
      .from('access_scans')
      .select('id, domain, score, created_at')
      .eq('domain', domain)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setScans((data as ScanEntry[]) || []);
        setLoading(false);
      });
  }, [domain]);

  if (loading) return <div className="text-sm text-muted-foreground animate-pulse p-4">Loading history...</div>;
  if (scans.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Score History</h3>
      </div>
      <div className="relative pl-6 space-y-3">
        <div className="absolute left-2 top-1 bottom-1 w-px bg-border" />
        {scans.map((scan, i) => {
          const prev = scans[i + 1];
          const delta = prev?.score != null && scan.score != null ? scan.score - prev.score : 0;
          const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
          const trendColor = delta > 0 ? 'text-neon-green' : delta < 0 ? 'text-destructive' : 'text-muted-foreground';

          return (
            <div key={scan.id} className="relative flex items-center gap-3">
              <div className="absolute -left-4 w-3 h-3 rounded-full bg-primary/60 border-2 border-background" />
              <div className="flex-1 flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                <span className="text-sm font-mono font-semibold text-foreground">{scan.score ?? '—'}</span>
                {delta !== 0 && (
                  <span className={`flex items-center gap-0.5 text-xs ${trendColor}`}>
                    <TrendIcon className="w-3 h-3" />
                    {delta > 0 ? '+' : ''}{delta}
                  </span>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(scan.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
