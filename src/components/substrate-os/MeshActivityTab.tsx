/**
 * MeshActivityTab — Real-time Intent Mesh dashboard
 * Shows cross-module interactions, receipts, kill switch, and resolver map
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, Network, Activity, Shield, Zap, Eye, 
  CheckCircle, XCircle, ArrowRight, Power, Radio
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  MESH_MANIFEST,
  getMeshModules,
  useMeshToggle,
  broadcastIntent,
  getRecentReceipts,
  getMeshStats,
  type MeshReceipt,
} from '@/lib/substrate/intent-mesh';

export function MeshActivityTab() {
  const { enabled, toggle } = useMeshToggle();
  const [receipts, setReceipts] = useState<MeshReceipt[]>([]);
  const [stats, setStats] = useState<{ totalIntents: number; successRate: number; topRoutes: Array<{ source: string; target: string; count: number }>; avgDurationMs: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  const modules = getMeshModules();
  const activeResolvers = MESH_MANIFEST.filter(r => r.enabled).length;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([getRecentReceipts(20), getMeshStats()]);
      setReceipts(r);
      setStats(s);
    } catch {
      // Fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleToggle = () => {
    toggle();
    toast.success(enabled ? 'Intent Mesh disabled (kill switch)' : 'Intent Mesh enabled');
  };

  const handleTestBroadcast = async () => {
    if (!enabled) {
      toast.error('Enable the mesh first');
      return;
    }
    setTesting(true);
    try {
      const result = await broadcastIntent({
        sourceModule: 'DEFENSE',
        intentType: 'actor_enrichment',
        domains: ['security', 'identity', 'session'],
        input: { ip: '192.168.1.1', actor_id: 'test-actor' },
        governanceMode: 'read_only',
      });
      toast.success(`Mesh resolved: ${result.resolversResponded}/${result.resolversMatched} resolvers responded in ${result.totalDurationMs}ms`);
      refresh();
    } catch (err) {
      toast.error('Test broadcast failed');
    } finally {
      setTesting(false);
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
      <div className="flex items-center justify-between">
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
              <Badge variant="outline" className="text-[10px] border-amber-500/50 text-amber-400 bg-amber-500/10">
                v10.0
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              emergent module intelligence • cross-module capability composition
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Modules in Mesh" value={modules.length} icon={<Radio className="h-4 w-4 text-cyan-400" />} />
        <StatCard label="Active Resolvers" value={activeResolvers} icon={<Zap className="h-4 w-4 text-amber-400" />} />
        <StatCard label="Total Intents" value={stats?.totalIntents || 0} icon={<Activity className="h-4 w-4 text-fuchsia-400" />} />
        <StatCard label="Success Rate" value={`${((stats?.successRate || 0) * 100).toFixed(0)}%`} icon={<CheckCircle className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="Avg Latency" value={`${stats?.avgDurationMs || 0}ms`} icon={<Eye className="h-4 w-4 text-blue-400" />} />
      </div>

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
                          <Badge variant="secondary" className="text-[9px] h-4 px-1">
                            {r.risk}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Receipts + Top Routes */}
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
                <Button 
                  size="sm" 
                  onClick={handleTestBroadcast} 
                  disabled={testing || !enabled}
                  className="gap-2"
                >
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
                      <div className="flex-1">
                        <Progress value={Math.min(100, route.count * 10)} className="h-1.5" />
                      </div>
                      <span className="font-mono text-muted-foreground">{route.count}x</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Receipts */}
          <Card className="border border-border/30 bg-muted/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Receipts
                <Badge variant="secondary" className="text-[10px]">{receipts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
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
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/20"
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
