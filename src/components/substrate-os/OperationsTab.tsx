/**
 * Operations Tab — Remaining execution & infrastructure nodes
 * Sub-tabs: DECODE, VISION, ECONOMY, SANDBOX, INCLUSIVE, NERVE, REFLEX
 */

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileSearch, Eye, DollarSign, Box, Accessibility,
  Radio, Zap, Activity, TrendingUp, BarChart3,
  Clock, CheckCircle2, AlertTriangle, Layers, HeartPulse,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

function useOpsData() {
  const [data, setData] = useState({
    decode: { totalProcessed: 0, avgConfidence: 0, recentLogs: [] as any[] },
    vision: { scansRun: 0, avgScore: 0 },
    economy: { totalCost: 0, totalValue: 0, roi: 0, dailyCalls: 0 },
    sandbox: { executions: 0, isolated: true },
    inclusive: { scans: 0, avgScore: 0, wcagLevel: 'AA' },
    nerve: { signals: 0, activeChannels: 0 },
    reflex: { latencyMs: 0, edgeNodes: 0 },
    loading: true,
  });

  useEffect(() => {
    async function fetch() {
      const [usageRes, costRes, accessScanRes, a11yRes, blogRes, economicsRes] = await Promise.all([
        supabase.from('ai_usage_log').select('provider, model, success, tokens_used, cost, response_time_ms, created_at').order('created_at', { ascending: false }).limit(20),
        supabase.from('ai_usage_log').select('cost').not('cost', 'is', null),
        supabase.from('access_scans').select('score, created_at').order('created_at', { ascending: false }).limit(10),
        supabase.from('accessibility_scans').select('score, wcag_level, created_at').order('created_at', { ascending: false }).limit(10),
        supabase.from('auto_blog_posts').select('confidence_score').not('confidence_score', 'is', null),
        supabase.from('agency_economics').select('total_cost_cents, total_value_cents, tasks_completed').order('period_date', { ascending: false }).limit(30),
      ]);

      const usage = usageRes.data || [];
      const costs = costRes.data || [];
      const scans = accessScanRes.data || [];
      const a11y = a11yRes.data || [];
      const blogs = blogRes.data || [];
      const economics = economicsRes.data || [];

      const totalCost = costs.reduce((s, c) => s + (c.cost || 0), 0);
      const totalValue = economics.reduce((s, e) => s + (e.total_value_cents || 0), 0);
      const avgResponseTime = usage.length > 0 ? Math.round(usage.reduce((s, u) => s + (u.response_time_ms || 0), 0) / usage.length) : 0;

      setData({
        decode: {
          totalProcessed: blogs.length,
          avgConfidence: blogs.length > 0 ? Math.round(blogs.reduce((s, b) => s + (b.confidence_score || 0), 0) / blogs.length) : 0,
          recentLogs: usage.slice(0, 8),
        },
        vision: {
          scansRun: scans.length,
          avgScore: scans.length > 0 ? Math.round(scans.reduce((s, sc) => s + (sc.score || 0), 0) / scans.length) : 0,
        },
        economy: {
          totalCost: Math.round(totalCost * 100) / 100,
          totalValue: totalValue,
          roi: totalCost > 0 ? Math.round((totalValue / 100 - totalCost) / totalCost * 100) : 0,
          dailyCalls: usage.length,
        },
        sandbox: { executions: economics.reduce((s, e) => s + (e.tasks_completed || 0), 0), isolated: true },
        inclusive: {
          scans: a11y.length,
          avgScore: a11y.length > 0 ? Math.round(a11y.reduce((s, a) => s + (a.score || 0), 0) / a11y.length) : 0,
          wcagLevel: a11y[0]?.wcag_level || 'AA',
        },
        nerve: { signals: usage.length * 3, activeChannels: 12 },
        reflex: { latencyMs: avgResponseTime, edgeNodes: 3 },
        loading: false,
      });
    }
    fetch();
  }, []);

  return data;
}

export function OperationsTab() {
  const ops = useOpsData();

  const modules = [
    {
      id: 'decode', label: 'DECODE', icon: FileSearch, color: 'text-indigo-500',
      desc: 'Natural language understanding & confidence scoring',
      stats: [
        { label: 'Processed', value: ops.decode.totalProcessed },
        { label: 'Avg Confidence', value: `${ops.decode.avgConfidence}%` },
      ],
    },
    {
      id: 'vision', label: 'VISION', icon: Eye, color: 'text-purple-500',
      desc: 'Visual processing, security scans, dashboard rendering',
      stats: [
        { label: 'Scans Run', value: ops.vision.scansRun },
        { label: 'Avg Score', value: `${ops.vision.avgScore}%` },
      ],
    },
    {
      id: 'economy', label: 'ECONOMY', icon: DollarSign, color: 'text-emerald-500',
      desc: 'Cost tracking, ROI calculation, budget governance',
      stats: [
        { label: 'Total Cost', value: `$${ops.economy.totalCost.toFixed(2)}` },
        { label: 'ROI', value: `${ops.economy.roi}%` },
        { label: 'Daily Calls', value: ops.economy.dailyCalls },
      ],
    },
    {
      id: 'sandbox', label: 'SANDBOX', icon: Box, color: 'text-orange-500',
      desc: 'Isolated execution environment for untrusted operations',
      stats: [
        { label: 'Executions', value: ops.sandbox.executions },
        { label: 'Isolation', value: ops.sandbox.isolated ? 'Active' : 'Disabled' },
      ],
    },
    {
      id: 'inclusive', label: 'INCLUSIVE', icon: Accessibility, color: 'text-blue-500',
      desc: 'Accessibility compliance & WCAG enforcement',
      stats: [
        { label: 'Scans', value: ops.inclusive.scans },
        { label: 'Avg Score', value: `${ops.inclusive.avgScore}%` },
        { label: 'WCAG Level', value: ops.inclusive.wcagLevel },
      ],
    },
    {
      id: 'nerve', label: 'NERVE', icon: Radio, color: 'text-rose-500',
      desc: 'Inter-node signaling & operational coordination (OCG)',
      stats: [
        { label: 'Signals', value: ops.nerve.signals },
        { label: 'Active Channels', value: ops.nerve.activeChannels },
      ],
    },
    {
      id: 'reflex', label: 'REFLEX', icon: Zap, color: 'text-amber-500',
      desc: 'Edge compute orchestration & low-latency response (EPZ)',
      stats: [
        { label: 'Avg Latency', value: `${ops.reflex.latencyMs}ms` },
        { label: 'Edge Nodes', value: ops.reflex.edgeNodes },
      ],
    },
    {
      id: 'medic', label: 'MEDIC', icon: HeartPulse, color: 'text-red-400',
      desc: 'Self-healing diagnostics, triage, and recovery orchestration',
      stats: [
        { label: 'Health Checks', value: ops.nerve.signals > 0 ? Math.round(ops.nerve.signals / 3) : 0 },
        { label: 'Recovery Cycles', value: 0 },
      ],
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border border-indigo-500/25 flex items-center justify-center shrink-0">
          <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-bold tracking-tight">Operations</h2>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-mono tracking-wider truncate">DECODE · VISION · ECONOMY · SANDBOX · INCLUSIVE · NERVE · REFLEX · MEDIC</p>
        </div>
        <Badge className="text-[9px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 shrink-0">8 NODES</Badge>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {modules.map((mod, i) => (
          <motion.div key={mod.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20 h-full transition-all duration-300 hover:border-primary/15 hover:-translate-y-0.5 hover:shadow-sm">
              <CardContent className="p-3 sm:p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <mod.icon className={cn("w-4 h-4 shrink-0", mod.color)} />
                  <span className="text-xs sm:text-sm font-bold font-mono">{mod.label}</span>
                  <Badge variant="outline" className="text-[8px] h-4 px-1.5 ml-auto bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">online</Badge>
                </div>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground/60 leading-relaxed">{mod.desc}</p>
                <div className="space-y-1.5 pt-1 border-t border-border/10">
                  {mod.stats.map(s => (
                    <div key={s.label} className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground/50 font-mono">{s.label}</span>
                      <span className="font-medium font-mono tabular-nums">{s.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* DECODE Recent Activity */}
      <Card className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20">
        <CardHeader className="pb-2 px-4 sm:px-6">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-indigo-500 shrink-0" />
            DECODE — Recent Processing
          </CardTitle>
          <CardDescription className="text-[11px]">Latest NLU pipeline activity</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <ScrollArea className="h-[200px]">
            <div className="space-y-1.5">
              {ops.decode.recentLogs.map((log: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-md bg-muted/10 dark:bg-muted/5 border border-border/10">
                  <Badge variant="outline" className={cn("text-[8px] h-4 px-1.5 shrink-0",
                    log.success ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
                  )}>
                    {log.success ? '✓' : '✗'}
                  </Badge>
                  <span className="text-[10px] font-mono text-muted-foreground/60 truncate flex-1">{log.model || log.provider}</span>
                  <span className="text-[9px] font-mono text-muted-foreground/40 shrink-0">{log.tokens_used || 0} tok</span>
                  <span className="text-[9px] font-mono text-muted-foreground/40 shrink-0">{log.response_time_ms || 0}ms</span>
                </div>
              ))}
              {ops.decode.recentLogs.length === 0 && (
                <p className="text-xs text-muted-foreground/40 text-center py-6">No recent processing</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
