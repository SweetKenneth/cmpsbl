/**
 * CCR Tab — Cognitive Core Reality
 * Sub-tabs: MEMORY (tiered memory system), DREAM (synthesis & heuristics)
 */

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  HardDrive, Sparkles, Database, Layers, TrendingUp,
  Brain, Clock, Activity, Archive, Zap, BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

function useCCRData() {
  const [data, setData] = useState({
    memory: { hot: 0, warm: 0, cold: 0, archive: 0, contradictions: 0, recallRate: 0, totalRecalls: 0 },
    dream: { heuristics: 0, dreams: 0, synthesisCycles: 0, avgConfidence: 0, recentDreams: [] as any[] },
    brainEvents: 0,
    loading: true,
  });

  useEffect(() => {
    async function fetch() {
      const [hotRes, warmRes, coldRes, archiveRes, metaRes, brainRes, dreamRes, contradictionRes] = await Promise.all([
        supabase.from('brain_memory_hot').select('*', { count: 'exact', head: true }),
        supabase.from('brain_memory_warm').select('*', { count: 'exact', head: true }),
        supabase.from('brain_memory_cold').select('*', { count: 'exact', head: true }),
        supabase.from('brain_memory_archive').select('*', { count: 'exact', head: true }),
        supabase.from('brain_memory_meta').select('*').limit(1),
        supabase.from('brain_events').select('*', { count: 'exact', head: true }),
        supabase.from('agency_dream_memory').select('id, title, improvement_type, confidence, created_at, applied').order('created_at', { ascending: false }).limit(10),
        supabase.from('brain_memory_contradictions').select('*', { count: 'exact', head: true }),
      ]);

      const meta = metaRes.data?.[0];

      setData({
        memory: {
          hot: hotRes.count || 0,
          warm: warmRes.count || 0,
          cold: coldRes.count || 0,
          archive: archiveRes.count || 0,
          contradictions: contradictionRes.count || 0,
          recallRate: meta?.recall_hit_rate ? Math.round(meta.recall_hit_rate * 100) : 0,
          totalRecalls: meta?.total_recalls || 0,
        },
        dream: {
          heuristics: dreamRes.data?.filter(d => d.applied).length || 0,
          dreams: dreamRes.data?.length || 0,
          synthesisCycles: meta?.demotions || 0,
          avgConfidence: dreamRes.data?.length
            ? Math.round((dreamRes.data.reduce((s, d) => s + (d.confidence || 0), 0) / dreamRes.data.length) * 100)
            : 0,
          recentDreams: dreamRes.data || [],
        },
        brainEvents: brainRes.count || 0,
        loading: false,
      });
    }
    fetch();
  }, []);

  return data;
}

export function CCRTab() {
  const { memory, dream, brainEvents, loading } = useCCRData();
  const totalMemories = memory.hot + memory.warm + memory.cold + memory.archive;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-500/10 border border-cyan-500/25 flex items-center justify-center shrink-0">
          <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 dark:text-cyan-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-bold tracking-tight">Cognitive Core</h2>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-mono tracking-wider truncate">MEMORY · DREAM — CCR</p>
        </div>
        <Badge className="text-[9px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 shrink-0">CCR</Badge>
      </div>

      {/* Brain Events Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: 'Total Memories', value: totalMemories.toLocaleString(), icon: Database, color: 'text-cyan-500' },
          { label: 'Brain Events', value: brainEvents.toLocaleString(), icon: Activity, color: 'text-blue-500' },
          { label: 'Recall Rate', value: `${memory.recallRate}%`, icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Contradictions', value: memory.contradictions.toString(), icon: Zap, color: memory.contradictions > 0 ? 'text-amber-500' : 'text-emerald-500' },
        ].map(stat => (
          <Card key={stat.label} className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20 transition-all duration-300 hover:border-primary/15 hover:-translate-y-0.5 hover:shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
                <span className="text-[9px] sm:text-[10px] text-muted-foreground/50 font-mono uppercase truncate">{stat.label}</span>
              </div>
              <span className="text-lg sm:text-xl font-bold font-mono tabular-nums">{stat.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="memory">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-muted/15 border border-border/15 gap-0.5 w-max sm:w-auto">
            <TabsTrigger value="memory" className="text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3 data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-600 dark:data-[state=active]:text-cyan-400">
              <HardDrive className="w-3.5 h-3.5 hidden sm:block" /> MEMORY
            </TabsTrigger>
            <TabsTrigger value="dream" className="text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3 data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-600 dark:data-[state=active]:text-cyan-400">
              <Sparkles className="w-3.5 h-3.5 hidden sm:block" /> DREAM
            </TabsTrigger>
          </TabsList>
        </div>

        {/* MEMORY — Tiered Memory System */}
        <TabsContent value="memory" className="mt-4 space-y-3">
          <Card className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20">
            <CardHeader className="pb-2 px-4 sm:px-6">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-500 shrink-0" />
                Memory Tiers
              </CardTitle>
              <CardDescription className="text-[11px]">SM-2 spaced repetition with adaptive limits</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 space-y-3">
              {[
                { tier: 'Hot', count: memory.hot, color: 'bg-red-500', desc: 'Active context — instant recall', pct: totalMemories > 0 ? (memory.hot / totalMemories) * 100 : 0 },
                { tier: 'Warm', count: memory.warm, color: 'bg-amber-500', desc: 'Recently demoted — decay active', pct: totalMemories > 0 ? (memory.warm / totalMemories) * 100 : 0 },
                { tier: 'Cold', count: memory.cold, color: 'bg-blue-500', desc: 'Long-term — compressed summaries', pct: totalMemories > 0 ? (memory.cold / totalMemories) * 100 : 0 },
                { tier: 'Archive', count: memory.archive, color: 'bg-slate-500', desc: 'Permanent — never deleted', pct: totalMemories > 0 ? (memory.archive / totalMemories) * 100 : 0 },
              ].map((t, i) => (
                <motion.div key={t.tier} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="p-3 rounded-lg bg-muted/10 dark:bg-muted/5 border border-border/10 transition-all duration-300 hover:border-primary/15 hover:bg-muted/15">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2.5 h-2.5 rounded-full", t.color)} />
                      <span className="text-xs sm:text-sm font-medium">{t.tier}</span>
                    </div>
                    <span className="text-sm font-bold font-mono tabular-nums">{t.count.toLocaleString()}</span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground/50 mb-1.5">{t.desc}</p>
                  <Progress value={t.pct} className="h-1" />
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Card className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20 transition-all duration-300 hover:border-primary/15 hover:-translate-y-0.5 hover:shadow-sm">
              <CardContent className="p-3 text-center">
                <BarChart3 className="w-4 h-4 mx-auto mb-1.5 text-cyan-500" />
                <p className="text-lg font-bold font-mono tabular-nums">{memory.totalRecalls.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground/50 font-mono">TOTAL RECALLS</p>
              </CardContent>
            </Card>
            <Card className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20 transition-all duration-300 hover:border-primary/15 hover:-translate-y-0.5 hover:shadow-sm">
              <CardContent className="p-3 text-center">
                <Archive className="w-4 h-4 mx-auto mb-1.5 text-violet-500" />
                <p className="text-lg font-bold font-mono tabular-nums">{memory.contradictions}</p>
                <p className="text-[9px] text-muted-foreground/50 font-mono">CONTRADICTIONS</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* DREAM — Synthesis & Heuristics */}
        <TabsContent value="dream" className="mt-4 space-y-3">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: 'Dreams', value: dream.dreams, icon: Sparkles, color: 'text-violet-500' },
              { label: 'Applied', value: dream.heuristics, icon: Zap, color: 'text-emerald-500' },
              { label: 'Avg Confidence', value: `${dream.avgConfidence}%`, icon: TrendingUp, color: 'text-cyan-500' },
            ].map(stat => (
              <Card key={stat.label} className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20">
                <CardContent className="p-3 text-center">
                  <stat.icon className={cn("w-4 h-4 mx-auto mb-1.5", stat.color)} />
                  <p className="text-lg font-bold font-mono">{stat.value}</p>
                  <p className="text-[9px] text-muted-foreground/50 font-mono uppercase">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20">
            <CardHeader className="pb-2 px-4 sm:px-6">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500 shrink-0" />
                Recent Dream Synthesis
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {dream.recentDreams.map((d: any, i: number) => (
                    <motion.div key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="p-3 rounded-lg bg-muted/10 dark:bg-muted/5 border border-border/10">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium truncate">{d.title}</p>
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground/50">{d.improvement_type}</p>
                        </div>
                        <Badge variant="outline" className={cn("text-[8px] h-4 px-1.5 shrink-0",
                          d.applied ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border/20'
                        )}>
                          {d.applied ? 'applied' : 'pending'}
                        </Badge>
                      </div>
                      {d.confidence != null && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <Progress value={d.confidence * 100} className="h-1 flex-1" />
                          <span className="text-[9px] font-mono text-muted-foreground/50">{Math.round(d.confidence * 100)}%</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {dream.recentDreams.length === 0 && (
                    <p className="text-xs text-muted-foreground/40 text-center py-8">No dream cycles recorded yet</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
