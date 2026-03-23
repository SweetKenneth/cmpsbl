/**
 * Surface E — Observability HUD
 * Real-time status from substrate.vision
 */

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, RefreshCw, CheckCircle2, AlertTriangle, XCircle,
  Brain, Shield, MessageSquare, Zap, Eye, Moon, Settings,
  TrendingUp, Clock, Database, Network, Loader2
} from "lucide-react";
import { substrate, SubstrateModule } from "@/lib/substrate";
import { toast } from "sonner";

interface ModuleHealth {
  module: SubstrateModule;
  status: "online" | "degraded" | "offline";
  latency?: number;
  lastCheck: string;
}

interface SystemMetrics {
  brain_memories?: number;
  defense_events?: number;
  decode_conversations?: number;
  nexus_calls?: number;
  health_score?: number;
}

interface PulseData {
  ok: boolean;
  timestamp: string;
  uptime_seconds?: number;
}

const moduleConfig: { id: SubstrateModule; name: string; icon: React.ElementType; color: string; layer: string }[] = [
  // Kernel Layer
  { id: "core", name: "Core", icon: Settings, color: "text-slate-400", layer: "Kernel" },
  { id: "ripple", name: "Ripple", icon: MessageSquare, color: "text-primary", layer: "Kernel" },
  { id: "access", name: "Access", icon: Shield, color: "text-neon-amber", layer: "Kernel" },
  // Cognitive Layer
  { id: "brain", name: "Brain", icon: Brain, color: "text-neon-cyan", layer: "Cognitive" },
  { id: "decode", name: "Decode", icon: MessageSquare, color: "text-neon-purple", layer: "Cognitive" },
  { id: "dream", name: "Dream", icon: Moon, color: "text-neon-magenta", layer: "Cognitive" },
  // Operational Layer
  { id: "defense", name: "Defense", icon: Shield, color: "text-neon-amber", layer: "Operational" },
  { id: "nexus", name: "Nexus", icon: Zap, color: "text-neon-green", layer: "Operational" },
  { id: "vision", name: "Vision", icon: Eye, color: "text-neon-blue", layer: "Operational" },
  // Administrative Layer
  { id: "system", name: "System", icon: Settings, color: "text-destructive", layer: "CCR Zone" },
  { id: "evolution", name: "Evolution", icon: Zap, color: "text-neon-green", layer: "Overlay" },
];

export function ObservabilityHUD() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pulse, setPulse] = useState<PulseData | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [moduleHealth, setModuleHealth] = useState<ModuleHealth[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = async () => {
    setRefreshing(true);
    
    try {
      // Fetch pulse (lightweight health check)
      const pulseRes = await substrate.vision.pulse();
      if (pulseRes.success) {
        setPulse(pulseRes.data as PulseData);
      }
      
      // Fetch metrics
      const metricsRes = await substrate.vision.metrics();
      if (metricsRes.success && metricsRes.data) {
        const metricsData = metricsRes.data as { metrics?: SystemMetrics };
        setMetrics(metricsData.metrics || metricsData as SystemMetrics);
      }
      
      // Check each module's health
      const healthChecks = await Promise.all(
        moduleConfig.map(async (mod) => {
          const startTime = performance.now();
          try {
            const res = await substrate.invoke({ module: mod.id, action: "status" });
            const latency = Math.round(performance.now() - startTime);
            return {
              module: mod.id,
              status: res.success ? "online" : "degraded",
              latency,
              lastCheck: new Date().toISOString(),
            } as ModuleHealth;
          } catch {
            return {
              module: mod.id,
              status: "offline",
              lastCheck: new Date().toISOString(),
            } as ModuleHealth;
          }
        })
      );
      
      setModuleHealth(healthChecks);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("HUD fetch error:", error);
      toast.error("Failed to fetch substrate status");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const onlineCount = moduleHealth.filter(m => m.status === "online").length;
  const healthPercentage = moduleHealth.length > 0 
    ? Math.round((onlineCount / moduleHealth.length) * 100) 
    : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online": return <CheckCircle2 className="w-4 h-4 text-neon-green" />;
      case "degraded": return <AlertTriangle className="w-4 h-4 text-neon-amber" />;
      default: return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "border-neon-green/50 bg-neon-green/10";
      case "degraded": return "border-neon-amber/50 bg-neon-amber/10";
      default: return "border-destructive/50 bg-destructive/10";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-xl">Observability HUD</h2>
            <p className="text-sm text-muted-foreground">
              Real-time substrate monitoring
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-xs text-muted-foreground">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Health */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-4 flex-1 min-w-[200px]">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              pulse?.ok ? "bg-neon-green/10" : "bg-destructive/10"
            }`}>
              {pulse?.ok ? (
                <CheckCircle2 className="w-8 h-8 text-neon-green" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-destructive" />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold">
                {pulse?.ok ? "Operational" : "Issues Detected"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {onlineCount}/{moduleHealth.length} modules online
              </p>
            </div>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Health Score</span>
              <span className="text-sm font-medium">{healthPercentage}%</span>
            </div>
            <Progress value={healthPercentage} className="h-2" />
          </div>
          
          {pulse?.uptime_seconds && (
            <div className="text-center px-4">
              <div className="text-2xl font-bold">
                {Math.floor(pulse.uptime_seconds / 3600)}h
              </div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
          )}
        </div>
      </Card>

      {/* Primitive Status Grid - 4 Category Architecture */}
      <div className="space-y-4">
        {/* Layer Groups */}
        {["Kernel", "Cognitive", "Operational", "Admin"].map((layer) => {
          const layerModules = moduleConfig.filter(m => m.layer === layer);
          return (
            <div key={layer}>
              <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">{layer} Layer</h4>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {layerModules.map((mod) => {
                  const health = moduleHealth.find(h => h.module === mod.id);
                  const status = health?.status || "offline";
                  
                  return (
                    <Card 
                      key={mod.id} 
                      className={`p-3 ${getStatusColor(status)}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <mod.icon className={`w-4 h-4 ${mod.color}`} />
                        {getStatusIcon(status)}
                      </div>
                      <h5 className="font-medium text-sm">{mod.name}</h5>
                      {health?.latency && (
                        <p className="text-xs text-muted-foreground">
                          {health.latency}ms
                        </p>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-neon-cyan" />
              <div>
                <p className="text-2xl font-bold">
                  {metrics.brain_memories?.toLocaleString() || "—"}
                </p>
                <p className="text-xs text-muted-foreground">Brain Memories</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-neon-amber" />
              <div>
                <p className="text-2xl font-bold">
                  {metrics.defense_events?.toLocaleString() || "—"}
                </p>
                <p className="text-xs text-muted-foreground">Defense Events</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-neon-purple" />
              <div>
                <p className="text-2xl font-bold">
                  {metrics.decode_conversations?.toLocaleString() || "—"}
                </p>
                <p className="text-xs text-muted-foreground">Conversations</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-neon-green" />
              <div>
                <p className="text-2xl font-bold">
                  {metrics.nexus_calls?.toLocaleString() || "—"}
                </p>
                <p className="text-xs text-muted-foreground">Nexus Calls</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Activity Feed */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Network className="w-5 h-5" />
          Primitive Activity Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-medium">Module</th>
                <th className="text-left py-2 px-3 font-medium">Status</th>
                <th className="text-left py-2 px-3 font-medium">Latency</th>
                <th className="text-left py-2 px-3 font-medium">Last Check</th>
              </tr>
            </thead>
            <tbody>
              {moduleHealth.map((health) => {
                const config = moduleConfig.find(m => m.id === health.module);
                return (
                  <tr key={health.module} className="border-b last:border-0">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {config && <config.icon className={`w-4 h-4 ${config.color}`} />}
                        <span className="font-medium capitalize">{health.module}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(health.status)}
                      >
                        {health.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      {health.latency ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {health.latency}ms
                        </span>
                      ) : "—"}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {new Date(health.lastCheck).toLocaleTimeString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
