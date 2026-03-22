/**
 * ORACLE Tab — EPZ (Expansion Perception Zone)
 * Sub-tabs: ORACLE (Predictions), COMPASS (Simulation), ECHO (Pattern Detection)
 */

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Eye, Compass, Radio, TrendingUp, AlertTriangle,
  Target, Activity, Layers, BarChart3, Zap, Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

// Simulated prediction data based on system metrics
function usePredictions() {
  const [data, setData] = useState({
    predictions: [] as any[],
    simulations: [] as any[],
    echoPatterns: [] as any[],
    loading: true,
  });

  useEffect(() => {
    async function fetch() {
      // Pull real system data to derive predictions
      const [healthRes, usageRes, errorRes] = await Promise.all([
        supabase.from('analytics_snapshots').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('ai_usage_log').select('provider, model, success, tokens_used, created_at').order('created_at', { ascending: false }).limit(50),
        supabase.from('ai_usage_log').select('*', { count: 'exact', head: true }).eq('success', false),
      ]);

      const snapshots = healthRes.data || [];
      const usage = usageRes.data || [];

      // Derive ORACLE predictions from real data only
      const totalCalls = usage.length;
      const successCount = usage.filter(u => u.success).length;
      const failCount = totalCalls - successCount;
      const successRate = totalCalls > 0 ? successCount / totalCalls : 1;
      const errorCount = errorRes.count || 0;

      // Calculate total tokens used
      const totalTokens = usage.reduce((sum, u) => sum + (u.tokens_used || 0), 0);

      // Provider distribution
      const providerCounts: Record<string, number> = {};
      usage.forEach(u => { providerCounts[u.provider] = (providerCounts[u.provider] || 0) + 1; });
      const providerCount = Object.keys(providerCounts).length;

      const predictions = [
        {
          id: 'capacity',
          title: 'Fleet Success Rate',
          confidence: totalCalls > 0 ? Math.round(successRate * 100) : null,
          horizon: '24h',
          signal: successRate > 0.9 ? 'stable' : successRate > 0.7 ? 'caution' : 'critical',
          detail: totalCalls > 0
            ? `${Math.round(successRate * 100)}% success across ${totalCalls} recent calls (${failCount} failures)`
            : 'No recent call data available',
        },
        {
          id: 'error-trend',
          title: 'Error Rate',
          confidence: totalCalls > 0 ? Math.round(((totalCalls - errorCount) / Math.max(totalCalls, 1)) * 100) : null,
          horizon: '7d',
          signal: errorCount < 5 ? 'stable' : errorCount < 20 ? 'caution' : 'critical',
          detail: `${errorCount} total errors detected — ${errorCount < 5 ? 'within tolerance' : 'elevated'}`,
        },
        {
          id: 'token-usage',
          title: 'Token Utilization',
          confidence: totalCalls > 0 ? Math.min(100, Math.round((totalTokens / Math.max(totalCalls, 1)) / 40)) : null,
          horizon: '24h',
          signal: totalTokens > 0 ? 'stable' : 'caution',
          detail: totalCalls > 0
            ? `${totalTokens.toLocaleString()} tokens across ${totalCalls} calls (avg ${Math.round(totalTokens / totalCalls)}/call)`
            : 'No token usage data',
        },
        {
          id: 'provider-diversity',
          title: 'Provider Distribution',
          confidence: providerCount > 1 ? Math.round((1 - (Math.max(...Object.values(providerCounts)) / Math.max(totalCalls, 1))) * 100) : null,
          horizon: '48h',
          signal: providerCount > 2 ? 'stable' : providerCount > 1 ? 'caution' : 'critical',
          detail: providerCount > 0
            ? `${providerCount} provider${providerCount > 1 ? 's' : ''} active: ${Object.entries(providerCounts).map(([p, c]) => `${p} (${c})`).join(', ')}`
            : 'No provider data',
        },
      ];

      // COMPASS simulations — outcomes derived from real metrics
      const simulations = [
        { id: 'failover', name: 'Primary Provider Down', outcome: providerCount > 1 ? `${providerCount - 1} backup provider${providerCount > 2 ? 's' : ''} available for failover` : 'No backup providers configured', risk: providerCount > 1 ? 'low' : 'high', coverage: providerCount > 1 ? Math.round((1 - Math.max(...Object.values(providerCounts)) / Math.max(totalCalls, 1)) * 100) : 0 },
        { id: 'surge', name: '10x Traffic Surge', outcome: successRate > 0.9 ? 'Current success rate suggests capacity headroom' : 'Current error rate indicates limited surge capacity', risk: successRate > 0.9 ? 'medium' : 'high', coverage: Math.round(successRate * 100) },
        { id: 'error-cascade', name: 'Error Cascade', outcome: `${errorCount} errors in window — ${errorCount < 5 ? 'cascade risk minimal' : 'monitor for correlated failures'}`, risk: errorCount < 5 ? 'low' : errorCount < 20 ? 'medium' : 'high', coverage: Math.max(0, 100 - errorCount * 5) },
      ];

      // ECHO pattern detections from real usage data
      const echoPatterns: { id: string; type: string; description: string; severity: string; recurrence: number }[] = [];

      // Detect provider routing bias
      if (providerCount > 1) {
        const maxProvider = Object.entries(providerCounts).sort((a, b) => b[1] - a[1])[0];
        const dominance = maxProvider ? Math.round((maxProvider[1] / Math.max(totalCalls, 1)) * 100) : 0;
        if (dominance > 80) {
          echoPatterns.push({ id: 'affinity', type: 'Routing Bias', description: `${maxProvider[0]} handles ${dominance}% of calls — consider rebalancing`, severity: 'warn', recurrence: totalCalls });
        } else {
          echoPatterns.push({ id: 'affinity', type: 'Routing Balance', description: `${providerCount} providers with balanced distribution (max ${dominance}%)`, severity: 'info', recurrence: totalCalls });
        }
      }

      // Detect error patterns
      if (errorCount > 0) {
        echoPatterns.push({ id: 'error-pattern', type: 'Error Signal', description: `${errorCount} failed calls detected in recent window`, severity: errorCount > 10 ? 'warn' : 'info', recurrence: errorCount });
      }

      // Token efficiency
      if (totalCalls > 5) {
        const avgTokens = Math.round(totalTokens / totalCalls);
        echoPatterns.push({ id: 'token-efficiency', type: 'Token Efficiency', description: `Average ${avgTokens} tokens/call across ${totalCalls} requests`, severity: avgTokens > 4000 ? 'warn' : 'info', recurrence: totalCalls });
      }

      setData({ predictions, simulations, echoPatterns, loading: false });
    }
    fetch();
  }, []);

  return data;
}

const signalColor = (s: string) => {
  if (s === 'stable' || s === 'low') return 'bg-neon-green/10 text-neon-green dark:text-neon-green border-neon-green/20';
  if (s === 'caution' || s === 'medium') return 'bg-neon-amber/10 text-neon-amber dark:text-neon-amber border-neon-amber/20';
  return 'bg-destructive/10 text-destructive dark:text-destructive border-destructive/20';
};

const sevColor = (s: string) => {
  if (s === 'info') return 'bg-neon-blue/10 text-neon-blue dark:text-neon-blue border-neon-blue/20';
  if (s === 'warn') return 'bg-neon-amber/10 text-neon-amber dark:text-neon-amber border-neon-amber/20';
  return 'bg-destructive/10 text-destructive dark:text-destructive border-destructive/20';
};

export function OracleTab() {
  const { predictions, simulations, echoPatterns, loading } = usePredictions();

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-neon-purple/15 to-primary/10 border border-neon-purple/25 flex items-center justify-center shrink-0">
          <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-neon-purple dark:text-neon-purple" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-bold tracking-tight">Perception Zone</h2>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-mono tracking-wider truncate">ORACLE · COMPASS · ECHO — EPZ</p>
        </div>
        <Badge className="text-[9px] bg-neon-purple/10 text-neon-purple dark:text-neon-purple border-neon-purple/20 shrink-0">EPZ</Badge>
      </div>

      <Tabs defaultValue="oracle">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-muted/15 border border-border/15 gap-0.5 w-max sm:w-auto">
            <TabsTrigger value="oracle" className="text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3 data-[state=active]:bg-neon-purple/10 data-[state=active]:text-neon-purple dark:data-[state=active]:text-neon-purple">
              <Eye className="w-3.5 h-3.5 hidden sm:block" /> ORACLE
            </TabsTrigger>
            <TabsTrigger value="compass" className="text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3 data-[state=active]:bg-neon-purple/10 data-[state=active]:text-neon-purple dark:data-[state=active]:text-neon-purple">
              <Compass className="w-3.5 h-3.5 hidden sm:block" /> COMPASS
            </TabsTrigger>
            <TabsTrigger value="echo" className="text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3 data-[state=active]:bg-neon-purple/10 data-[state=active]:text-neon-purple dark:data-[state=active]:text-neon-purple">
              <Radio className="w-3.5 h-3.5 hidden sm:block" /> ECHO
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ORACLE — Predictive Analytics */}
        <TabsContent value="oracle" className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {predictions.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20">
                  <CardContent className="p-3 sm:p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium truncate">{p.title}</p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground/50 mt-0.5">{p.detail}</p>
                      </div>
                      <Badge variant="outline" className={cn("text-[8px] h-4 px-1.5 shrink-0", signalColor(p.signal))}>
                        {p.signal}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Progress value={p.confidence} className="h-1.5" />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground/60 shrink-0">{p.confidence}%</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3 text-muted-foreground/40" />
                        <span className="text-[9px] font-mono text-muted-foreground/50">{p.horizon}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* COMPASS — Scenario Simulation */}
        <TabsContent value="compass" className="mt-4 space-y-3">
          <Card className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20">
            <CardHeader className="pb-2 px-4 sm:px-6">
              <CardTitle className="text-sm flex items-center gap-2">
                <Compass className="w-4 h-4 text-neon-purple shrink-0" />
                Scenario Simulations
              </CardTitle>
              <CardDescription className="text-[11px]">Pre-computed resilience scenarios</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-2">
                {simulations.map((sim, i) => (
                  <motion.div key={sim.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="p-3 rounded-lg bg-muted/10 dark:bg-muted/5 border border-border/10 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs sm:text-sm font-medium">{sim.name}</p>
                      <Badge variant="outline" className={cn("text-[8px] h-4 px-1.5 shrink-0", signalColor(sim.risk))}>
                        {sim.risk} risk
                      </Badge>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground/60">{sim.outcome}</p>
                    <div className="flex items-center gap-2">
                      <Progress value={sim.coverage} className="h-1 flex-1" />
                      <span className="text-[9px] font-mono text-muted-foreground/50">{sim.coverage}% covered</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ECHO — Pattern Detection */}
        <TabsContent value="echo" className="mt-4 space-y-3">
          <Card className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20">
            <CardHeader className="pb-2 px-4 sm:px-6">
              <CardTitle className="text-sm flex items-center gap-2">
                <Radio className="w-4 h-4 text-neon-purple shrink-0" />
                Detected Patterns
              </CardTitle>
              <CardDescription className="text-[11px]">Recurring signals from system telemetry</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-2">
                {echoPatterns.map((pat, i) => (
                  <motion.div key={pat.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/10 dark:bg-muted/5 border border-border/10">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium">{pat.type}</span>
                        <Badge variant="outline" className={cn("text-[8px] h-4 px-1.5", sevColor(pat.severity))}>{pat.severity}</Badge>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground/60">{pat.description}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <Activity className="w-3 h-3 text-muted-foreground/40" />
                      <span className="text-[9px] font-mono text-muted-foreground/50">×{pat.recurrence}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
