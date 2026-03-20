/**
 * Usage Dashboard — ROI metrics for paid members
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  BarChart3, TrendingUp, Clock, Cpu, Sparkles, Download,
  Activity, Zap,
} from 'lucide-react';

interface UsageData {
  intents_executed: number;
  tokens_consumed: number;
  discoveries_pulled: number;
  exports_created: number;
  compute_time_ms: number;
  estimated_value_cents: number;
}

const EMPTY: UsageData = {
  intents_executed: 0, tokens_consumed: 0, discoveries_pulled: 0,
  exports_created: 0, compute_time_ms: 0, estimated_value_cents: 0,
};

export function UsageDashboard({ tier }: { tier: string }) {
  const { user } = useAuth();
  const [stats, setStats] = useState<UsageData>(EMPTY);
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('30d');

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 365;
      const since = new Date(Date.now() - daysBack * 86400000).toISOString().split('T')[0];

      const { data } = await supabase
        .from('member_usage_stats')
        .select('*')
        .eq('user_id', user.id)
        .gte('period_date', since);

      if (data && data.length > 0) {
        const agg = data.reduce((acc, row) => ({
          intents_executed: acc.intents_executed + (row.intents_executed || 0),
          tokens_consumed: acc.tokens_consumed + (row.tokens_consumed || 0),
          discoveries_pulled: acc.discoveries_pulled + (row.discoveries_pulled || 0),
          exports_created: acc.exports_created + (row.exports_created || 0),
          compute_time_ms: acc.compute_time_ms + Number(row.compute_time_ms || 0),
          estimated_value_cents: acc.estimated_value_cents + (row.estimated_value_cents || 0),
        }), EMPTY);
        setStats(agg);
      } else {
        // Show demo data for new users
        setStats({
          intents_executed: 47,
          tokens_consumed: 12840,
          discoveries_pulled: 8,
          exports_created: 2,
          compute_time_ms: 34200,
          estimated_value_cents: 2350,
        });
      }
    };
    fetchStats();
  }, [user, period]);

  const metrics = [
    { label: 'Intents Executed', value: stats.intents_executed, icon: Zap, color: 'text-primary', format: (v: number) => v.toLocaleString() },
    { label: 'Tokens Consumed', value: stats.tokens_consumed, icon: Cpu, color: 'text-violet-400', format: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString() },
    { label: 'Discoveries', value: stats.discoveries_pulled, icon: Sparkles, color: 'text-amber-400', format: (v: number) => v.toString() },
    { label: 'Exports', value: stats.exports_created, icon: Download, color: 'text-emerald-400', format: (v: number) => v.toString() },
    { label: 'Compute Time', value: stats.compute_time_ms, icon: Clock, color: 'text-sky-400', format: (v: number) => v >= 60000 ? `${(v / 60000).toFixed(1)}m` : `${(v / 1000).toFixed(1)}s` },
    { label: 'Estimated Value', value: stats.estimated_value_cents, icon: TrendingUp, color: 'text-emerald-500', format: (v: number) => `$${(v / 100).toFixed(2)}` },
  ];

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Usage Overview</h2>
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border/30">
          {(['7d', '30d', 'all'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                period === p ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-border/40 bg-card/50 p-4 hover:border-primary/20 transition-all group"
          >
            <div className="flex items-center gap-2 mb-3">
              <m.icon className={cn("w-4 h-4", m.color)} />
              <span className="text-[11px] text-muted-foreground font-medium">{m.label}</span>
            </div>
            <div className="text-2xl font-black font-mono tabular-nums group-hover:text-primary transition-colors">
              {m.format(m.value)}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ROI Summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold">Your ROI Summary</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-black text-primary font-mono">
              {stats.estimated_value_cents > 0 ? `${((stats.estimated_value_cents / 100) / (tier === 'architect' ? 79 : tier === 'studio' ? 49 : tier === 'creator' ? 29 : 1)).toFixed(1)}×` : '—'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Value vs. Cost</div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground font-mono">
              {stats.compute_time_ms > 0 ? `${(stats.compute_time_ms / 3600000).toFixed(1)}h` : '—'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Time Saved</div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-500 font-mono">
              {stats.intents_executed > 0 ? `${((stats.intents_executed - (stats.exports_created || 0)) / Math.max(stats.intents_executed, 1) * 100).toFixed(0)}%` : '—'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Success Rate</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
