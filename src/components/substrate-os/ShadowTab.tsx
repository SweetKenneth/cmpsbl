/**
 * ShadowTab — SHADOW Module Dashboard
 * Shadow mesh probes, divergence detection, and TSAC analytics
 * Promotes existing ShadowMeshAnalytics + ShadowMeshToggle into a first-class surface
 */

import { lazy, Suspense, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Ghost, Activity, Shield, Zap, Eye, RefreshCw, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ShadowMeshToggle = lazy(() => import('@/components/admin/ShadowMeshToggle').then(m => ({ default: m.ShadowMeshToggle })));
const ShadowMeshAnalytics = lazy(() => import('@/components/admin/ShadowMeshAnalytics').then(m => ({ default: m.ShadowMeshAnalytics })));

function Loader() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-5 h-5 text-muted-foreground/40 animate-spin" />
    </div>
  );
}

export function ShadowTab() {
  const [activeSubTab, setActiveSubTab] = useState('probes');

  // Fetch recent shadow probe data from immune_metrics
  const { data: probeStats, isLoading } = useQuery({
    queryKey: ['shadow-probe-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('immune_metrics')
        .select('executor, total_runs, repair_successes, escalations, safe_failures, repair_attempted, repair_success, run_at')
        .order('run_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      const rows = data || [];
      const totalRuns = rows.reduce((a: number, r: any) => a + (r.total_runs || 0), 0);
      const totalRepairs = rows.reduce((a: number, r: any) => a + (r.repair_successes || 0), 0);
      const totalEscalations = rows.reduce((a: number, r: any) => a + (r.escalations || 0), 0);
      const totalSafeFails = rows.reduce((a: number, r: any) => a + (r.safe_failures || 0), 0);
      const executors = [...new Set(rows.map((r: any) => r.executor))];

      return {
        totalRuns,
        totalRepairs,
        totalEscalations,
        totalSafeFails,
        executorCount: executors.length,
        repairRate: totalRuns > 0 ? Math.round((totalRepairs / totalRuns) * 100) : 0,
        lastRun: rows[0]?.run_at || null,
      };
    },
    staleTime: 30_000,
  });

  // Fetch recent escalations
  const { data: escalations = [] } = useQuery({
    queryKey: ['shadow-escalations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('immune_escalations')
        .select('executor, severity, scope, status, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      return (data || []) as any[];
    },
    staleTime: 30_000,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border border-purple-500/30 flex items-center justify-center">
            <Ghost className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold">SHADOW</h2>
            <p className="text-xs text-muted-foreground font-mono">
              Adversarial probes · Divergence detection · TSAC
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400 font-mono">
          CSZ · COVERT
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Probes', value: probeStats?.totalRuns ?? 0, icon: Activity, color: 'text-purple-400' },
          { label: 'Auto-Repairs', value: probeStats?.totalRepairs ?? 0, icon: Zap, color: 'text-emerald-400' },
          { label: 'Escalations', value: probeStats?.totalEscalations ?? 0, icon: Shield, color: probeStats?.totalEscalations ? 'text-red-400' : 'text-muted-foreground' },
          { label: 'Executors', value: probeStats?.executorCount ?? 0, icon: Eye, color: 'text-cyan-400' },
        ].map(stat => (
          <Card key={stat.label} className="border-border/20 transition-all duration-300 hover:border-primary/15 hover:-translate-y-0.5 hover:shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <stat.icon className={cn("w-3 h-3", stat.color)} />
                {stat.label}
              </div>
              <div className={cn("text-2xl font-bold font-mono tabular-nums", stat.color)}>
                {isLoading ? '—' : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-3 bg-muted/30">
          <TabsTrigger value="probes" className="gap-2">
            <Activity className="w-4 h-4" />
            Probes
          </TabsTrigger>
          <TabsTrigger value="escalations" className="gap-2">
            <Shield className="w-4 h-4" />
            Escalations
          </TabsTrigger>
          <TabsTrigger value="controls" className="gap-2">
            <Zap className="w-4 h-4" />
            Controls
          </TabsTrigger>
        </TabsList>

        {/* Probes Tab — Shadow Mesh Analytics */}
        <TabsContent value="probes" className="mt-4">
          <Suspense fallback={<Loader />}>
            <ShadowMeshAnalytics />
          </Suspense>
        </TabsContent>

        {/* Escalations */}
        <TabsContent value="escalations" className="mt-4">
          <ScrollArea className="h-[500px]">
            {escalations.length > 0 ? (
              <div className="space-y-2">
                {escalations.map((esc: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/20"
                  >
                    <div className={cn("w-2 h-2 rounded-full shrink-0",
                      esc.severity === 'critical' ? 'bg-red-500' :
                      esc.severity === 'high' ? 'bg-orange-500' :
                      esc.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{esc.executor}</span>
                        <Badge variant="outline" className={cn("text-[10px]",
                          esc.severity === 'critical' ? 'border-red-500/30 text-red-400' :
                          esc.severity === 'high' ? 'border-orange-500/30 text-orange-400' :
                          'border-amber-500/30 text-amber-400'
                        )}>
                          {esc.severity}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] border-border/30">
                          {esc.status}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{esc.scope}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                      {esc.created_at ? new Date(esc.created_at).toLocaleDateString() : '—'}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No escalations recorded</p>
                <p className="text-xs text-muted-foreground/50 mt-1">Shadow probes are operating within safe boundaries</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Controls */}
        <TabsContent value="controls" className="mt-4">
          <Suspense fallback={<Loader />}>
            <ShadowMeshToggle />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
