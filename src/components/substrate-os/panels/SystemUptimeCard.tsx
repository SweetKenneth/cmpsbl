/**
 * System Uptime Card — Shows total online time, current session uptime, and last boot timestamp.
 * Reads from system_boot_log table, records a boot on mount.
 */
import { useState, useEffect, useRef } from 'react';
import { Clock, Power, Timer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

function formatDuration(ms: number): string {
  if (ms < 1000) return '0s';
  const seconds = Math.floor(ms / 1000);
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join(' ');
}

export function SystemUptimeCard() {
  const [loading, setLoading] = useState(true);
  const [totalUptime, setTotalUptime] = useState(0); // ms
  const [lastBootAt, setLastBootAt] = useState<string | null>(null);
  const [sessionMs, setSessionMs] = useState(0);
  const sessionStart = useRef(Date.now());
  const booted = useRef(false);

  useEffect(() => {
    async function init() {
      // Record this boot (once per mount)
      if (!booted.current) {
        booted.current = true;
        await supabase.from('system_boot_log' as any).insert({ boot_at: new Date().toISOString() } as any);
      }

      // Fetch all boots
      const { data } = await supabase
        .from('system_boot_log' as any)
        .select('boot_at')
        .order('boot_at', { ascending: true });

      if (data && data.length > 0) {
        const boots = (data as any[]).map((r: any) => new Date(r.boot_at).getTime());
        const last = boots[boots.length - 1];
        setLastBootAt(new Date(last).toISOString());

        // Estimate total uptime: sum gaps between consecutive boots (assume online between boots, cap at 24h per gap)
        let total = 0;
        const MAX_GAP = 24 * 60 * 60 * 1000;
        for (let i = 1; i < boots.length; i++) {
          const gap = boots[i] - boots[i - 1];
          total += Math.min(gap, MAX_GAP);
        }
        // Add current session
        total += Date.now() - last;
        setTotalUptime(total);
      }
      setLoading(false);
    }
    init();
  }, []);

  // Tick session timer every second
  useEffect(() => {
    const iv = setInterval(() => {
      setSessionMs(Date.now() - sessionStart.current);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const lastBootDate = lastBootAt ? new Date(lastBootAt) : null;

  return (
    <Card className="border-neon-green/15 dark:border-neon-green/10 bg-card/50 dark:bg-card/20">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-neon-green" />
          <span className="text-xs font-semibold tracking-tight">System Uptime</span>
          <span className="ml-auto flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            <span className="text-[9px] text-neon-green dark:text-neon-green font-mono">ONLINE</span>
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {/* Total Uptime */}
          <div className="p-2 rounded-lg bg-muted/10 dark:bg-muted/5 border border-border/15">
            <div className="flex items-center gap-1 mb-1">
              <Timer className="w-3 h-3 text-neon-green" />
              <span className="text-[8px] sm:text-[9px] text-muted-foreground/50 font-mono uppercase">Total</span>
            </div>
            {loading ? (
              <Skeleton className="h-4 w-14" />
            ) : (
              <span className="text-xs sm:text-sm font-bold font-mono tabular-nums">{formatDuration(totalUptime + sessionMs)}</span>
            )}
          </div>
          {/* Session Uptime */}
          <div className="p-2 rounded-lg bg-muted/10 dark:bg-muted/5 border border-border/15">
            <div className="flex items-center gap-1 mb-1">
              <Power className="w-3 h-3 text-neon-cyan" />
              <span className="text-[8px] sm:text-[9px] text-muted-foreground/50 font-mono uppercase">Session</span>
            </div>
            <span className="text-xs sm:text-sm font-bold font-mono tabular-nums">{formatDuration(sessionMs)}</span>
          </div>
          {/* Last Boot */}
          <div className="p-2 rounded-lg bg-muted/10 dark:bg-muted/5 border border-border/15">
            <div className="flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-neon-amber" />
              <span className="text-[8px] sm:text-[9px] text-muted-foreground/50 font-mono uppercase">Last Boot</span>
            </div>
            {loading ? (
              <Skeleton className="h-4 w-14" />
            ) : lastBootDate ? (
              <div>
                <span className="text-[10px] sm:text-xs font-mono tabular-nums block">{lastBootDate.toLocaleDateString()}</span>
                <span className="text-[9px] sm:text-[10px] font-mono tabular-nums text-muted-foreground/60">{lastBootDate.toLocaleTimeString()}</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground/40">—</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
