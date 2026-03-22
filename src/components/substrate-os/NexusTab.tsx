/**
 * NexusTab — AI Routing Dashboard
 * Multi-provider routing across 9 free-tier providers
 * Shows routing status, costs, health
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Zap, Activity, DollarSign, Loader2, RefreshCw,
  CheckCircle, XCircle, AlertTriangle, TrendingUp, Clock,
  Server, Gauge, BarChart3,
  CircuitBoard, Heart, Wifi, WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProviderHealth {
  provider: string;
  healthScore: number;
  circuitState: 'closed' | 'open' | 'half-open';
  requestsThisMinute: number;
  requestsToday: number;
  avgLatencyMs: number;
  perMinLimit: number;
  perDayLimit: number;
}

interface NexusStatus {
  version: string;
  totalRequestsToday: number;
  providers: ProviderHealth[];
}

interface CostLog {
  id: string;
  provider: string;
  latency_ms: number;
  token_count: number;
  cost_usd_est: number;
  status: string;
  created_at: string;
}

export function NexusTab() {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [nexusStatus, setNexusStatus] = useState<NexusStatus | null>(null);
  const [costLogs, setCostLogs] = useState<CostLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchNexusData();
  }, []);

  const fetchNexusData = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const [todayLogsRes] = await Promise.all([
        supabase
          .from('ai_usage_log')
          .select('provider, success, tokens_used, cost, response_time_ms, category, created_at, model')
          .gte('created_at', `${today}T00:00:00Z`)
          .order('created_at', { ascending: false })
          .limit(500),
      ]);

      const todayLogs = todayLogsRes.data || [];
      const providerMap: Record<string, { calls: number; successes: number; totalLatency: number; tokens: number }> = {};
      todayLogs.forEach((log: any) => {
        const p = log.provider || 'unknown';
        if (!providerMap[p]) providerMap[p] = { calls: 0, successes: 0, totalLatency: 0, tokens: 0 };
        providerMap[p].calls++;
        if (log.success) providerMap[p].successes++;
        providerMap[p].totalLatency += log.response_time_ms || 0;
        providerMap[p].tokens += log.tokens_used || 0;
      });

      const providerRegistry: Record<string, { perMinLimit: number; perDayLimit: number }> = {
        groq: { perMinLimit: 24, perDayLimit: 800 },
        cerebras: { perMinLimit: 24, perDayLimit: 11520 },
        google: { perMinLimit: 14, perDayLimit: 1425 },
        openrouter: { perMinLimit: 9, perDayLimit: 190 },
        novita: { perMinLimit: 19, perDayLimit: 950 },
        sambanova: { perMinLimit: 32, perDayLimit: 32 },
        hyperbolic: { perMinLimit: 48, perDayLimit: 100000 },
        deepseek: { perMinLimit: 16, perDayLimit: 100000 },
        together: { perMinLimit: 480, perDayLimit: 100000 },
      };

      const providers: ProviderHealth[] = Object.entries(providerRegistry).map(([key, limits]) => {
        const stats = providerMap[key] || { calls: 0, successes: 0, totalLatency: 0, tokens: 0 };
        const successRate = stats.calls > 0 ? stats.successes / stats.calls : 1;
        const avgLatency = stats.calls > 0 ? Math.round(stats.totalLatency / stats.calls) : 0;
        const healthScore = Math.round(successRate * 100);
        const circuitState: 'closed' | 'open' | 'half-open' = 
          healthScore >= 80 ? 'closed' : healthScore >= 50 ? 'half-open' : 'open';

        const displayName: Record<string, string> = {
          groq: 'Groq', cerebras: 'Cerebras', google: 'Google AI', openrouter: 'OpenRouter',
          novita: 'Novita', sambanova: 'SambaNova', hyperbolic: 'Hyperbolic',
          deepseek: 'DeepSeek', together: 'Together',
        };

        return {
          provider: displayName[key] || key,
          healthScore,
          circuitState,
          requestsThisMinute: 0,
          requestsToday: stats.calls,
          avgLatencyMs: avgLatency,
          perMinLimit: limits.perMinLimit,
          perDayLimit: limits.perDayLimit,
        };
      });

      setNexusStatus({
        version: '5.0.0',
        totalRequestsToday: todayLogs.length,
        providers,
      });

      setCostLogs(todayLogs.slice(0, 20).map((log: any) => ({
        id: log.created_at + log.provider,
        provider: log.provider || 'unknown',
        latency_ms: log.response_time_ms || 0,
        token_count: log.tokens_used || 0,
        cost_usd_est: log.cost || 0,
        status: log.success ? 'success' : 'failure',
        created_at: log.created_at,
      })));
    } catch (error) {
      console.error('Failed to fetch nexus data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNexusData();
    setIsRefreshing(false);
    toast.success('Nexus status refreshed');
  };

  const getCircuitIcon = (state: string) => {
    switch (state) {
      case 'closed': return <CheckCircle className="w-3 h-3 text-neon-green" />;
      case 'open': return <XCircle className="w-3 h-3 text-destructive" />;
      case 'half-open': return <AlertTriangle className="w-3 h-3 text-neon-amber" />;
      default: return <Wifi className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'bg-neon-green';
    if (score >= 70) return 'bg-neon-amber';
    return 'bg-destructive';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-neon-blue/20 border border-primary/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Nexus Router</h2>
            <p className="text-xs text-muted-foreground font-mono">
              v{nexusStatus?.version || '5.0.0'} • 9 providers • Free-tier stack
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-3 bg-muted/30">
          <TabsTrigger value="overview" className="gap-2"><Gauge className="w-4 h-4" />Overview</TabsTrigger>
          <TabsTrigger value="providers" className="gap-2"><Server className="w-4 h-4" />Providers</TabsTrigger>
          <TabsTrigger value="costs" className="gap-2"><DollarSign className="w-4 h-4" />Costs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Activity className="w-3 h-3" />Requests Today
                </div>
                <div className="text-2xl font-bold text-primary">{nexusStatus?.totalRequestsToday || 0}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-neon-green/5 to-transparent border-neon-green/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Heart className="w-3 h-3" />Avg Health
                </div>
                <div className="text-2xl font-bold text-neon-green">
                  {Math.round(nexusStatus?.providers.reduce((a, b) => a + b.healthScore, 0) / (nexusStatus?.providers.length || 1))}%
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-neon-amber/5 to-transparent border-neon-amber/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <DollarSign className="w-3 h-3" />Est. Daily Cost
                </div>
                <div className="text-2xl font-bold text-neon-amber">$0.00</div>
                <div className="text-[10px] text-muted-foreground">100% Free Tier</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CircuitBoard className="w-4 h-4 text-primary" />Safety Switch Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {nexusStatus?.providers.slice(0, 5).map((p) => (
                  <div key={p.provider} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    {getCircuitIcon(p.circuitState)}
                    <span className="text-xs truncate">{p.provider}</span>
                    <Badge variant="outline" className="text-[10px] ml-auto">{p.healthScore}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-neon-green/20 bg-neon-green/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-neon-green/20 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-neon-green" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-neon-green">100% Free-Tier Stack</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Nexus routes all AI calls through 9 free-tier providers with enterprise-grade safety switches,
                    auto-healing, and graceful degradation. Zero cost, maximum reliability.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Groq', 'Cerebras', 'Google AI', 'OpenRouter', 'Novita', 'SambaNova', 'Hyperbolic', 'DeepSeek', 'Together'].map((p) => (
                      <Badge key={p} variant="outline" className="text-[10px] bg-neon-green/10 border-neon-green/30">{p}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-4 mt-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {nexusStatus?.providers.map((provider) => (
                <Card key={provider.provider} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getCircuitIcon(provider.circuitState)}
                        <span className="font-medium">{provider.provider}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] ${
                            provider.circuitState === 'closed' 
                              ? 'border-neon-green/40 text-neon-green' 
                              : provider.circuitState === 'half-open'
                              ? 'border-neon-amber/40 text-neon-amber'
                              : 'border-destructive/40 text-destructive'
                          }`}
                        >
                          {provider.circuitState}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />{provider.avgLatencyMs}ms avg
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Health Score</span><span>{provider.healthScore}%</span>
                        </div>
                        <Progress value={provider.healthScore} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>RPM Used</span><span>{provider.requestsThisMinute}/{provider.perMinLimit}</span>
                        </div>
                        <Progress value={(provider.requestsThisMinute / provider.perMinLimit) * 100} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                      <span>Daily: {provider.requestsToday}/{provider.perDayLimit > 50000 ? '∞' : provider.perDayLimit} RPD</span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {((provider.requestsToday / Math.min(provider.perDayLimit, 1000)) * 100).toFixed(1)}% of daily
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="space-y-4 mt-4">
          <Card className="border-neon-green/20 bg-neon-green/5">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-neon-green" />
              </div>
              <h3 className="text-xl font-bold text-neon-green">$0.00 / day</h3>
              <p className="text-sm text-muted-foreground mt-2">All AI routing through 100% free-tier providers</p>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                <div className="text-center">
                  <div className="text-lg font-bold">~16,000+</div>
                  <div className="text-muted-foreground">Daily Capacity</div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <div className="text-lg font-bold">25</div>
                  <div className="text-muted-foreground">Free Images</div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <div className="text-lg font-bold">9</div>
                  <div className="text-muted-foreground">Providers</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />Recent Routing Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {costLogs.length > 0 ? (
                  <div className="space-y-2">
                    {costLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
                        <div className="flex items-center gap-2">
                          {log.status === 'success' ? (
                            <CheckCircle className="w-3 h-3 text-neon-green" />
                          ) : (
                            <XCircle className="w-3 h-3 text-destructive" />
                          )}
                          <span className="font-medium">{log.provider}</span>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span>{log.latency_ms}ms</span>
                          <span>{log.token_count} tokens</span>
                          <span className="text-neon-green">${log.cost_usd_est.toFixed(4)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">No routing events recorded yet</div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
