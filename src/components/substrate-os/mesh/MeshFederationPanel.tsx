/**
 * Mesh Federation Panel — Cross-instance resolver sharing UI
 * Configure, monitor, and manage federation peers
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Globe, Wifi, WifiOff, Shield, RefreshCw, Settings,
  ChevronRight, Signal, Lock, Unlock, Server
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  getFederationConfig,
  updateFederationConfig,
  loadFederationConfig,
  getKnownPeers,
  getFederationStats,
  publishManifest,
  type FederationPeer,
  type FederationConfig,
  type FederationStats,
} from '@/lib/substrate/intent-mesh/mesh-federation';

const PEER_STATUS_CONFIG = {
  active: { color: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/30', label: 'Active' },
  degraded: { color: 'text-neon-amber', bg: 'bg-neon-amber/10', border: 'border-neon-amber/30', label: 'Degraded' },
  offline: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', label: 'Offline' },
};

export function MeshFederationPanel() {
  const [config, setConfig] = useState<FederationConfig>(loadFederationConfig());
  const [peers, setPeers] = useState<FederationPeer[]>([]);
  const [stats, setStats] = useState<FederationStats | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([getKnownPeers(), getFederationStats()]);
      setPeers(p);
      setStats(s);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleToggleFederation = () => {
    const updated = updateFederationConfig({ enabled: !config.enabled });
    setConfig(updated);
    toast.success(updated.enabled ? 'Federation enabled' : 'Federation disabled');
    if (updated.enabled) refresh();
  };

  const handleTogglePublish = () => {
    const updated = updateFederationConfig({ publishManifest: !config.publishManifest });
    setConfig(updated);
    if (updated.publishManifest) {
      publishManifest().then(r => toast.success(`Published ${r.published} resolvers across ${r.domains.length} domains`));
    }
  };

  const handleToggleAccept = () => {
    const updated = updateFederationConfig({ acceptRemoteIntents: !config.acceptRemoteIntents });
    setConfig(updated);
  };

  return (
    <div className="space-y-4">
      {/* Federation Config */}
      <Card className={cn("border", config.enabled ? "border-neon-cyan/30 bg-neon-cyan/5" : "border-border/30 bg-muted/10")}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border",
                config.enabled ? "bg-neon-cyan/20 border-neon-cyan/40" : "bg-muted/30 border-border/40"
              )}>
                <Globe className={cn("w-5 h-5", config.enabled ? "text-neon-cyan" : "text-muted-foreground")} />
              </div>
              <div>
                <h3 className="text-sm font-bold">Cross-Instance Federation</h3>
                <p className="text-[11px] text-muted-foreground">Share resolvers across substrate instances</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
              <Switch checked={config.enabled} onCheckedChange={handleToggleFederation} />
            </div>
          </div>

          {config.enabled && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/20">
                  <div className="flex items-center gap-2">
                    <Unlock className="w-3.5 h-3.5 text-neon-cyan" />
                    <span className="text-xs">Publish Manifest</span>
                  </div>
                  <Switch checked={config.publishManifest} onCheckedChange={handleTogglePublish} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/20">
                  <div className="flex items-center gap-2">
                    <Signal className="w-3.5 h-3.5 text-neon-green" />
                    <span className="text-xs">Accept Remote</span>
                  </div>
                  <Switch checked={config.acceptRemoteIntents} onCheckedChange={handleToggleAccept} />
                </div>
              </div>

              {/* Shared Domains */}
              <div className="p-3 rounded-lg bg-muted/20 border border-border/20">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Shared Domains</span>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {config.sharedDomains.map(d => (
                    <Badge key={d} variant="outline" className="text-[10px] border-neon-cyan/30 text-neon-cyan bg-neon-cyan/10">{d}</Badge>
                  ))}
                </div>
                <span className="text-[10px] font-mono text-muted-foreground/60 mt-2 block">
                  Private: {config.privateDomains.join(', ')}
                </span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      {config.enabled && stats && (
        <div className="grid grid-cols-4 gap-3">
          <StatBox label="Peers" value={stats.totalPeers} sub={`${stats.activePeers} active`} />
          <StatBox label="Remote Resolves" value={stats.remoteResolutionsTotal} sub="all time" />
          <StatBox label="Today" value={stats.remoteResolutionsToday} sub="remote" />
          <StatBox label="Avg Latency" value={`${stats.avgRemoteLatencyMs}ms`} sub="remote" />
        </div>
      )}

      {/* Peers List */}
      {config.enabled && (
        <Card className="border border-border/30 bg-muted/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-neon-cyan" />
              Federation Peers
              <Badge variant="secondary" className="text-[10px]">{peers.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[250px]">
              {peers.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No federation peers discovered</p>
              ) : (
                <div className="space-y-2">
                  {peers.map((peer, i) => {
                    const statusConfig = PEER_STATUS_CONFIG[peer.status];
                    return (
                      <motion.div
                        key={peer.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn("flex items-center gap-3 p-3 rounded-lg border", statusConfig.border, statusConfig.bg)}
                      >
                        {peer.status === 'active' ? (
                          <Wifi className={cn("w-4 h-4 shrink-0", statusConfig.color)} />
                        ) : peer.status === 'degraded' ? (
                          <Signal className={cn("w-4 h-4 shrink-0", statusConfig.color)} />
                        ) : (
                          <WifiOff className={cn("w-4 h-4 shrink-0", statusConfig.color)} />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{peer.name}</span>
                            <Badge variant="outline" className={cn("text-[8px] h-3.5", statusConfig.border, statusConfig.color)}>
                              {statusConfig.label}
                            </Badge>
                            <Badge variant="secondary" className="text-[9px] h-3.5">{peer.resolverCount} resolvers</Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-mono text-muted-foreground">{peer.latencyMs}ms</span>
                            <span className="text-[10px] text-muted-foreground">
                              Trust: {(peer.trustScore * 100).toFixed(0)}%
                            </span>
                            <div className="flex gap-1">
                              {peer.sharedDomains.map(d => (
                                <Badge key={d} variant="outline" className="text-[8px] h-3 px-1">{d}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatBox({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="p-3 rounded-lg bg-muted/20 border border-border/20 text-center">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-[9px] text-muted-foreground/60">{sub}</div>
    </div>
  );
}
