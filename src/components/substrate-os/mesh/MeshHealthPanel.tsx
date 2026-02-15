/**
 * Mesh Health Panel — Real-time health monitoring with alerts
 * v10.5.0 — Shows health score, active alerts, and drift warnings
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Heart, AlertTriangle, ShieldAlert, Activity, Clock,
  RefreshCw, CheckCircle, XCircle, TrendingDown, Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  checkMeshHealth,
  onHealthAlert,
  type MeshHealthStatus,
  type MeshHealthAlert,
} from '@/lib/substrate/intent-mesh/mesh-health-monitor';

const SEVERITY_CONFIG = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: ShieldAlert },
  warning: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: AlertTriangle },
  info: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: Activity },
};

const HEALTH_COLORS = {
  healthy: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  degraded: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

export function MeshHealthPanel() {
  const [health, setHealth] = useState<MeshHealthStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const status = await checkMeshHealth();
      setHealth(status);
    } catch {
      toast.error('Health check failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Subscribe to live alerts
  useEffect(() => {
    return onHealthAlert((newAlerts) => {
      for (const alert of newAlerts) {
        if (alert.severity === 'critical') {
          toast.error(`🚨 ${alert.title}`, { description: alert.message, duration: 8000 });
        } else if (alert.severity === 'warning') {
          toast.warning(`⚠️ ${alert.title}`, { description: alert.message, duration: 6000 });
        }
      }
    });
  }, []);

  const hConfig = health ? HEALTH_COLORS[health.overall] : HEALTH_COLORS.healthy;

  return (
    <div className="space-y-4">
      {/* Health Score Card */}
      <Card className={cn("border", hConfig.border, hConfig.bg)}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", hConfig.border, hConfig.bg)}>
                <Heart className={cn("w-6 h-6", hConfig.color)} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{health?.score ?? '--'}</span>
                  <span className="text-xs text-muted-foreground">/100</span>
                  <Badge variant="outline" className={cn("text-[10px]", hConfig.border, hConfig.color, hConfig.bg)}>
                    {health?.overall?.toUpperCase() ?? 'CHECKING'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Mesh Health Score</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
          {health && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              <MiniStat label="Success Rate" value={`${(health.successRate * 100).toFixed(0)}%`} icon={<CheckCircle className="w-3 h-3 text-emerald-400" />} />
              <MiniStat label="Avg Latency" value={`${health.avgLatencyMs}ms`} icon={<Clock className="w-3 h-3 text-cyan-400" />} />
              <MiniStat label="Resolvers" value={health.activeResolvers} icon={<Wifi className="w-3 h-3 text-blue-400" />} />
              <MiniStat label="Drift Alerts" value={health.driftCount} icon={<TrendingDown className="w-3 h-3 text-amber-400" />} />
            </div>
          )}
          {health && <Progress value={health.score} className="mt-3 h-1.5" />}
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card className="border border-border/30 bg-muted/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Active Alerts
            {health && health.alerts.length > 0 && (
              <Badge variant="destructive" className="text-[10px] h-4">{health.alerts.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[300px]">
            <AnimatePresence>
              {(!health || health.alerts.length === 0) ? (
                <div className="flex items-center gap-2 py-6 justify-center text-xs text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  No active alerts — mesh is healthy
                </div>
              ) : (
                <div className="space-y-2">
                  {health.alerts.map((alert, i) => {
                    const config = SEVERITY_CONFIG[alert.severity];
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn("flex items-start gap-3 p-3 rounded-lg border", config.border, config.bg)}
                      >
                        <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", config.color)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{alert.title}</span>
                            <Badge variant="outline" className={cn("text-[8px] h-3.5", config.border, config.color)}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{alert.message}</p>
                          {alert.module && (
                            <span className="text-[10px] font-mono text-muted-foreground/60 mt-1 block">{alert.module}</span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1">{icon}<span className="text-sm font-bold">{value}</span></div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}
