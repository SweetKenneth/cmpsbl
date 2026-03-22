/**
 * Developer Metrics Section — External dev activity from access_developers, access_api_keys, access_usage
 * Real numbers only. No fake data.
 */

import { useState, useEffect, useCallback } from 'react';
import { Code2, Key, Activity, Users, RefreshCw, Clock, TrendingUp, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface DevMetricsData {
  totalDevs: number;
  activeDevs: number;
  totalKeys: number;
  activeKeys: number;
  totalApiCalls: number;
  totalTokensUsed: number;
  totalCostCents: number;
  devList: {
    display_name: string;
    email: string | null;
    status: string;
    created_at: string;
    key_count: number;
    usage_count: number;
    last_usage: string | null;
  }[];
  recentUsage: {
    module: string;
    action: string;
    created_at: string;
    tokens_used: number | null;
    cost_millicents: number | null;
  }[];
  usageByModule: { module: string; count: number }[];
}

export function DevMetricsSection() {
  const [data, setData] = useState<DevMetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [devsRes, keysRes, usageCountRes, usageRes, recentUsageRes] = await Promise.all([
        supabase.from('access_developers').select('id, display_name, email, status, created_at'),
        supabase.from('access_api_keys').select('id, developer_id, is_active, created_at, last_used_at'),
        supabase.from('access_usage').select('*', { count: 'exact', head: true }),
        supabase.from('access_usage').select('developer_id, module, action, tokens_used, cost_millicents, created_at').order('created_at', { ascending: false }).limit(500),
        supabase.from('access_usage').select('module, action, created_at, tokens_used, cost_millicents').order('created_at', { ascending: false }).limit(20),
      ]);

      const devs = (devsRes.data || []) as any[];
      const keys = (keysRes.data || []) as any[];
      const usage = (usageRes.data || []) as any[];

      // Build dev list with key counts and usage counts
      const devList = devs.map(d => {
        const devKeys = keys.filter((k: any) => k.developer_id === d.id);
        const devUsage = usage.filter((u: any) => u.developer_id === d.id);
        const lastUsage = devUsage.length > 0 ? devUsage[0].created_at : null;
        return {
          display_name: d.display_name || 'Unnamed',
          email: d.email,
          status: d.status,
          created_at: d.created_at,
          key_count: devKeys.length,
          usage_count: devUsage.length,
          last_usage: lastUsage,
        };
      });

      // Usage by module
      const moduleCounts = new Map<string, number>();
      usage.forEach((u: any) => {
        const mod = u.module || 'unknown';
        moduleCounts.set(mod, (moduleCounts.get(mod) || 0) + 1);
      });
      const usageByModule = Array.from(moduleCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([module, count]) => ({ module, count }));

      // Totals
      let totalTokens = 0;
      let totalCost = 0;
      usage.forEach((u: any) => {
        totalTokens += u.tokens_used || 0;
        totalCost += u.cost_millicents || 0;
      });

      setData({
        totalDevs: devs.length,
        activeDevs: devs.filter(d => d.status === 'active').length,
        totalKeys: keys.length,
        activeKeys: keys.filter((k: any) => k.is_active).length,
        totalApiCalls: usageCountRes.count ?? 0,
        totalTokensUsed: totalTokens,
        totalCostCents: Math.round(totalCost / 100),
        devList,
        recentUsage: (recentUsageRes.data || []) as any[],
        usageByModule,
      });
    } catch (err) {
      console.error('Dev metrics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fmt = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-amber/20 to-neon-amber/20 border border-neon-amber/30 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-neon-amber" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">External Developer Metrics</h2>
            <p className="text-xs text-muted-foreground font-mono">API ACCESS • REAL USAGE • LIVE DATA</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} className="gap-1.5 h-8">
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Registered Devs', value: fmt(data.totalDevs), sub: `${data.activeDevs} active`, icon: Users, border: 'border-neon-amber/30', bg: 'from-neon-amber/10 to-neon-amber/5', iconBg: 'bg-neon-amber/20 border-neon-amber/40', iconColor: 'text-neon-amber' },
              { label: 'API Keys', value: fmt(data.totalKeys), sub: `${data.activeKeys} active`, icon: Key, border: 'border-neon-amber/30', bg: 'from-neon-amber/10 to-neon-amber/5', iconBg: 'bg-neon-amber/20 border-neon-amber/40', iconColor: 'text-neon-amber' },
              { label: 'Total API Calls', value: fmt(data.totalApiCalls), sub: `${fmt(data.totalTokensUsed)} tokens`, icon: Zap, border: 'border-neon-green/30', bg: 'from-neon-green/10 to-neon-green/5', iconBg: 'bg-neon-green/20 border-neon-green/40', iconColor: 'text-neon-green' },
              { label: 'Revenue', value: data.totalCostCents > 0 ? `$${(data.totalCostCents / 100).toFixed(2)}` : '$0.00', sub: 'from API usage', icon: TrendingUp, border: 'border-neon-cyan/30', bg: 'from-neon-cyan/10 to-neon-cyan/5', iconBg: 'bg-neon-cyan/20 border-neon-cyan/40', iconColor: 'text-neon-cyan' },
            ].map((card, idx) => {
              const CardIcon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  className={cn("p-5 rounded-2xl border bg-gradient-to-br backdrop-blur-xl", card.border, card.bg)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", card.iconBg)}>
                      <CardIcon className={cn("w-4 h-4", card.iconColor)} />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono uppercase">{card.label}</span>
                  </div>
                  <p className="text-2xl font-bold font-mono tabular-nums text-foreground">{card.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{card.sub}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Developer List */}
          <motion.div
            className="p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-neon-amber" /> Registered Developers
            </h3>
            {data.devList.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No external developers registered yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-2 text-muted-foreground font-medium">Developer</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Email</th>
                      <th className="text-center py-2 text-muted-foreground font-medium">Status</th>
                      <th className="text-center py-2 text-muted-foreground font-medium">Keys</th>
                      <th className="text-center py-2 text-muted-foreground font-medium">API Calls</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Last Usage</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.devList.map((dev, idx) => (
                      <motion.tr
                        key={idx}
                        className="border-b border-border/10 hover:bg-muted/10 transition"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                      >
                        <td className="py-2.5 font-medium text-foreground">{dev.display_name}</td>
                        <td className="py-2.5 text-muted-foreground font-mono">{dev.email || '—'}</td>
                        <td className="py-2.5 text-center">
                          <Badge variant="outline" className={cn("text-[9px] font-mono",
                            dev.status === 'active' ? 'border-neon-green/40 text-neon-green' : 'border-destructive/40 text-destructive'
                          )}>
                            {dev.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-center font-mono text-foreground">{dev.key_count}</td>
                        <td className="py-2.5 text-center font-mono text-foreground">{dev.usage_count}</td>
                        <td className="py-2.5 text-right font-mono text-muted-foreground">
                          {dev.last_usage ? new Date(dev.last_usage).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="py-2.5 text-right font-mono text-muted-foreground">
                          {new Date(dev.created_at).toLocaleDateString()}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Usage by Module + Recent Activity side by side */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Usage by Module */}
            <motion.div
              className="p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent backdrop-blur-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-neon-amber" /> Usage by Module
              </h3>
              {data.usageByModule.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No API usage recorded yet</p>
              ) : (
                <div className="space-y-2">
                  {data.usageByModule.slice(0, 10).map((m, idx) => {
                    const maxCount = data.usageByModule[0]?.count || 1;
                    const pct = Math.round((m.count / maxCount) * 100);
                    return (
                      <div key={m.module} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-foreground/80 uppercase">{m.module}</span>
                          <span className="text-xs font-mono font-medium text-foreground">{m.count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-neon-amber/60 to-neon-amber/40"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Recent API Activity */}
            <motion.div
              className="p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent backdrop-blur-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-neon-green" /> Recent API Activity
              </h3>
              {data.recentUsage.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No recent API calls</p>
              ) : (
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                  {data.recentUsage.map((u, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1.5 border-b border-border/10 last:border-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] font-mono">{u.module}</Badge>
                        <span className="text-xs text-foreground/80">{u.action}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(u.created_at).toLocaleString('en-US', { hour12: false, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-8">Failed to load developer metrics</p>
      )}
    </motion.div>
  );
}
