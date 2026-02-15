/**
 * MeshActivityTab — Real-time Intent Mesh dashboard
 * v10.1 — Live realtime feed, replay integration, pipeline crystallization
 */

import { VersionBadge } from './VersionBadge';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  RefreshCw, Network, Activity, Shield, Zap, Eye, 
  CheckCircle, XCircle, ArrowRight, Power, Radio,
  Save, Play, Bookmark, History, Layers, Lightbulb, Trophy, Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  MESH_MANIFEST,
  getMeshModules,
  useMeshToggle,
  broadcastIntent,
  getRecentReceipts,
  getMeshStats,
  type MeshReceipt,
} from '@/lib/substrate/intent-mesh';
import {
  getSavedPipelines,
  savePipelineFromReceipt,
  runSavedPipeline,
  type MeshSavedPipeline,
} from '@/lib/substrate/intent-mesh/pipelines';
import { MeshProposalsPanel } from './mesh/MeshProposalsPanel';
import { MeshScoringPanel } from './mesh/MeshScoringPanel';
import { MeshSchedulerPanel } from './mesh/MeshSchedulerPanel';
import { MeshTopologyGraph } from './mesh/MeshTopologyGraph';
import { MeshHealthPanel } from './mesh/MeshHealthPanel';
import { MeshFederationPanel } from './mesh/MeshFederationPanel';

export function MeshActivityTab() {
  const { enabled, toggle } = useMeshToggle();
  const [receipts, setReceipts] = useState<MeshReceipt[]>([]);
  const [stats, setStats] = useState<{ totalIntents: number; successRate: number; topRoutes: Array<{ source: string; target: string; count: number }>; avgDurationMs: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [savedPipelines, setSavedPipelines] = useState<MeshSavedPipeline[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [pipelineName, setPipelineName] = useState('');
  const [runningPipeline, setRunningPipeline] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'live' | 'pipelines' | 'proposals' | 'scoring' | 'scheduler' | 'topology' | 'health' | 'federation'>('live');
  const scrollRef = useRef<HTMLDivElement>(null);

  const modules = getMeshModules();
  const activeResolvers = MESH_MANIFEST.filter(r => r.enabled).length;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [r, s, p] = await Promise.all([
        getRecentReceipts(30),
        getMeshStats(),
        getSavedPipelines(),
      ]);
      setReceipts(r);
      setStats(s);
      setSavedPipelines(p);
    } catch {
      // Fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // ═══ REALTIME SUBSCRIPTION ═══
  useEffect(() => {
    const channel = supabase
      .channel('mesh-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mesh_intents' },
        (payload) => {
          const newReceipt = payload.new as any;
          setReceipts(prev => {
            const updated = [newReceipt, ...prev].slice(0, 50);
            return updated;
          });
          // Flash notification for live activity
          toast.info(
            `🔗 ${newReceipt.source_module} → ${(newReceipt.resolved_by || []).join(', ')}`,
            { description: `${newReceipt.intent_type} (${newReceipt.duration_ms}ms)`, duration: 3000 }
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleToggle = () => {
    toggle();
    toast.success(enabled ? 'Intent Mesh disabled (kill switch)' : 'Intent Mesh enabled');
  };

  const handleTestBroadcast = async () => {
    if (!enabled) { toast.error('Enable the mesh first'); return; }
    setTesting(true);
    try {
      const result = await broadcastIntent({
        sourceModule: 'DEFENSE',
        intentType: 'actor_enrichment',
        domains: ['security', 'identity', 'session'],
        input: { ip: '192.168.1.1', actor_id: 'test-actor' },
        governanceMode: 'read_only',
      });
      toast.success(`Mesh resolved: ${result.resolversResponded}/${result.resolversMatched} resolvers in ${result.totalDurationMs}ms`);
    } catch {
      toast.error('Test broadcast failed');
    } finally {
      setTesting(false);
    }
  };

  const handleSavePipeline = async (receipt: MeshReceipt) => {
    const name = pipelineName.trim() || `${receipt.source_module}→${receipt.intent_type}`;
    setSavingId(receipt.id || '');
    try {
      await savePipelineFromReceipt(receipt, name);
      toast.success(`Pipeline "${name}" saved from mesh discovery`);
      setPipelineName('');
      setSavingId(null);
      const p = await getSavedPipelines();
      setSavedPipelines(p);
    } catch {
      toast.error('Failed to save pipeline');
      setSavingId(null);
    }
  };

  const handleRunPipeline = async (pipeline: MeshSavedPipeline) => {
    if (!enabled) { toast.error('Enable the mesh first'); return; }
    setRunningPipeline(pipeline.id);
    try {
      const result = await runSavedPipeline(pipeline);
      toast.success(`Pipeline "${pipeline.name}" executed: ${result.resolversResponded} resolvers in ${result.totalDurationMs}ms`);
    } catch {
      toast.error('Pipeline execution failed');
    } finally {
      setRunningPipeline(null);
    }
  };

  return (
    <motion.main
      key="mesh"
      className="container mx-auto px-4 py-6 max-w-7xl space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Network className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              Intent Mesh
              <Badge variant="outline" className={cn("text-[10px]",
                enabled 
                  ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" 
                  : "border-red-500/50 text-red-400 bg-red-500/10"
              )}>
                {enabled ? 'ACTIVE' : 'DISABLED'}
              </Badge>
              <VersionBadge className="border-amber-500/50 text-amber-400 bg-amber-500/10" />
              {/* Live indicator */}
              {enabled && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  LIVE
                </span>
              )}
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              emergent module intelligence • live feed • pipeline crystallization
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center border border-border/30 rounded-lg overflow-hidden">
            <button 
              onClick={() => setActiveView('live')}
              className={cn("px-3 py-1.5 text-xs font-medium transition-colors", activeView === 'live' ? 'bg-amber-500/20 text-amber-400' : 'text-muted-foreground hover:text-foreground')}
            >
              <Activity className="w-3 h-3 inline mr-1" />Live
            </button>
            <button 
              onClick={() => setActiveView('pipelines')}
              className={cn("px-3 py-1.5 text-xs font-medium transition-colors", activeView === 'pipelines' ? 'bg-cyan-500/20 text-cyan-400' : 'text-muted-foreground hover:text-foreground')}
            >
              <Layers className="w-3 h-3 inline mr-1" />Pipelines ({savedPipelines.length})
            </button>
            <button 
              onClick={() => setActiveView('proposals')}
              className={cn("px-3 py-1.5 text-xs font-medium transition-colors", activeView === 'proposals' ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'text-muted-foreground hover:text-foreground')}
            >
              <Lightbulb className="w-3 h-3 inline mr-1" />Proposals
            </button>
            <button 
              onClick={() => setActiveView('scoring')}
              className={cn("px-3 py-1.5 text-xs font-medium transition-colors", activeView === 'scoring' ? 'bg-amber-500/20 text-amber-400' : 'text-muted-foreground hover:text-foreground')}
            >
              <Trophy className="w-3 h-3 inline mr-1" />Scoring
            </button>
            <button 
              onClick={() => setActiveView('scheduler')}
              className={cn("px-3 py-1.5 text-xs font-medium transition-colors", activeView === 'scheduler' ? 'bg-violet-500/20 text-violet-400' : 'text-muted-foreground hover:text-foreground')}
            >
              <Timer className="w-3 h-3 inline mr-1" />Scheduler
            </button>
            <button 
              onClick={() => setActiveView('topology')}
              className={cn("px-3 py-1.5 text-xs font-medium transition-colors", activeView === 'topology' ? 'bg-emerald-500/20 text-emerald-400' : 'text-muted-foreground hover:text-foreground')}
            >
              <Network className="w-3 h-3 inline mr-1" />Topology
            </button>
            <button 
              onClick={() => setActiveView('health')}
              className={cn("px-3 py-1.5 text-xs font-medium transition-colors", activeView === 'health' ? 'bg-red-500/20 text-red-400' : 'text-muted-foreground hover:text-foreground')}
            >
              <Activity className="w-3 h-3 inline mr-1" />Health
            </button>
            <button 
              onClick={() => setActiveView('federation')}
              className={cn("px-3 py-1.5 text-xs font-medium transition-colors", activeView === 'federation' ? 'bg-cyan-500/20 text-cyan-400' : 'text-muted-foreground hover:text-foreground')}
            >
              <Network className="w-3 h-3 inline mr-1" />Federation
            </button>
          </div>
          <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/30">
            <Power className={cn("w-4 h-4", enabled ? "text-emerald-400" : "text-red-400")} />
            <span className="text-xs font-medium">Kill Switch</span>
            <Switch checked={enabled} onCheckedChange={handleToggle} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <StatCard label="Modules" value={modules.length} icon={<Radio className="h-4 w-4 text-cyan-400" />} />
        <StatCard label="Resolvers" value={activeResolvers} icon={<Zap className="h-4 w-4 text-amber-400" />} />
        <StatCard label="Intents" value={stats?.totalIntents || 0} icon={<Activity className="h-4 w-4 text-fuchsia-400" />} />
        <StatCard label="Success" value={`${((stats?.successRate || 0) * 100).toFixed(0)}%`} icon={<CheckCircle className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="Latency" value={`${stats?.avgDurationMs || 0}ms`} icon={<Eye className="h-4 w-4 text-blue-400" />} />
        <StatCard label="Saved Pipelines" value={savedPipelines.length} icon={<Bookmark className="h-4 w-4 text-orange-400" />} />
      </div>

      {activeView === 'live' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resolver Map */}
          <Card className="lg:col-span-1 border border-border/30 bg-muted/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Network className="w-4 h-4 text-amber-400" />
                Resolver Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {modules.map(mod => {
                    const resolvers = MESH_MANIFEST.filter(r => r.module === mod);
                    return (
                      <div key={mod} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-bold">{mod}</Badge>
                          <span className="text-[10px] text-muted-foreground">{resolvers.length} resolvers</span>
                        </div>
                        {resolvers.map(r => (
                          <div key={r.id} className="ml-4 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className={cn("w-1.5 h-1.5 rounded-full", r.enabled ? "bg-emerald-500" : "bg-red-500")} />
                            <span className="font-mono">{r.id.split('.')[1]}</span>
                            <Badge variant="secondary" className="text-[9px] h-4 px-1">{r.risk}</Badge>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Live Feed + Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Test Broadcast */}
            <Card className="border border-amber-500/20 bg-amber-500/5">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Test Broadcast</p>
                    <p className="text-xs text-muted-foreground">
                      Simulate DEFENSE → actor_enrichment intent (read-only, safe)
                    </p>
                  </div>
                  <Button size="sm" onClick={handleTestBroadcast} disabled={testing || !enabled} className="gap-2">
                    {testing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                    Broadcast
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Top Routes */}
            {stats && stats.topRoutes.length > 0 && (
              <Card className="border border-border/30 bg-muted/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-cyan-400" />
                    Top Routes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.topRoutes.map((route, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <Badge variant="outline" className="text-[10px] min-w-[70px] justify-center">{route.source}</Badge>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <Badge variant="outline" className="text-[10px] min-w-[70px] justify-center">{route.target}</Badge>
                        <div className="flex-1"><Progress value={Math.min(100, route.count * 10)} className="h-1.5" /></div>
                        <span className="font-mono text-muted-foreground">{route.count}x</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Live Receipts Feed */}
            <Card className="border border-border/30 bg-muted/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Live Receipts
                  <Badge variant="secondary" className="text-[10px]">{receipts.length}</Badge>
                  {enabled && (
                    <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                      streaming
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px]" ref={scrollRef}>
                  <AnimatePresence mode="popLayout">
                    {receipts.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-8">
                        No mesh receipts yet. {enabled ? 'Broadcast an intent to see activity.' : 'Enable the mesh to start.'}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {receipts.map((receipt, i) => (
                          <motion.div
                            key={receipt.id || i}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="group flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/20 hover:border-amber-500/30 transition-colors"
                          >
                            {receipt.success ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-medium">{receipt.intent_type}</span>
                                <Badge variant="outline" className="text-[9px]">{receipt.source_module}</Badge>
                                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                {(receipt.resolved_by || []).map((mod: string) => (
                                  <Badge key={mod} variant="secondary" className="text-[9px]">{mod}</Badge>
                                ))}
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                                <span>{receipt.governance_mode}</span>
                                <span>•</span>
                                <span>{receipt.duration_ms}ms</span>
                                {receipt.error_message && (
                                  <>
                                    <span>•</span>
                                    <span className="text-red-400">{receipt.error_message}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {/* Save as Pipeline button */}
                            {receipt.success && receipt.id && (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                {savingId === receipt.id ? (
                                  <div className="flex items-center gap-1">
                                    <Input
                                      value={pipelineName}
                                      onChange={e => setPipelineName(e.target.value)}
                                      placeholder="Pipeline name..."
                                      className="h-6 text-[10px] w-28"
                                      autoFocus
                                    />
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleSavePipeline(receipt)}>
                                      <Save className="w-3 h-3 text-emerald-400" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setSavingId(null)}>
                                      <XCircle className="w-3 h-3 text-muted-foreground" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button 
                                    size="sm" variant="ghost" 
                                    className="h-6 px-2 text-[10px] gap-1"
                                    onClick={() => setSavingId(receipt.id || '')}
                                  >
                                    <Bookmark className="w-3 h-3" />
                                    Save
                                  </Button>
                                )}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : activeView === 'pipelines' ? (
        /* ═══ SAVED PIPELINES VIEW ═══ */
        <div className="space-y-4">
          <Card className="border border-cyan-500/20 bg-cyan-500/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-sm font-medium">Crystallized Pipelines</p>
                  <p className="text-xs text-muted-foreground">
                    Resolver chains discovered by the mesh, saved as reusable pipelines. Replay any configuration on demand.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {savedPipelines.length === 0 ? (
            <Card className="border border-border/30 bg-muted/10">
              <CardContent className="py-12 text-center">
                <Bookmark className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No saved pipelines yet.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Hover over a successful receipt in the Live view and click "Save" to crystallize it.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedPipelines.map(pipeline => (
                <Card key={pipeline.id} className="border border-border/30 bg-muted/10 hover:border-cyan-500/30 transition-colors">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold truncate">{pipeline.name}</h3>
                      <Badge variant={pipeline.is_active ? 'default' : 'secondary'} className="text-[9px]">
                        {pipeline.is_active ? 'active' : 'inactive'}
                      </Badge>
                    </div>
                    {pipeline.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{pipeline.description}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[9px]">{pipeline.source_module}</Badge>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      {(pipeline.resolver_chain || []).map((r: string) => (
                        <Badge key={r} variant="secondary" className="text-[9px]">{r}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{pipeline.governance_mode} • {pipeline.intent_type}</span>
                      <span>{pipeline.run_count || 0} runs</span>
                    </div>
                    <Button 
                      size="sm" className="w-full gap-2"
                      onClick={() => handleRunPipeline(pipeline)}
                      disabled={runningPipeline === pipeline.id || !enabled}
                    >
                      {runningPipeline === pipeline.id ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                      Replay Pipeline
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : activeView === 'proposals' ? (
        <MeshProposalsPanel />
      ) : activeView === 'scoring' ? (
        <MeshScoringPanel />
      ) : activeView === 'scheduler' ? (
        <MeshSchedulerPanel />
      ) : activeView === 'topology' ? (
        <MeshTopologyGraph />
      ) : activeView === 'health' ? (
        <MeshHealthPanel />
      ) : activeView === 'federation' ? (
        <MeshFederationPanel />
      ) : null}
    </motion.main>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card className="border border-border/30 bg-muted/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-1">
          {icon}
          {label}
        </div>
        <div className="text-xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
