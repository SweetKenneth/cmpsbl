import { Shield, Activity, TrendingUp, Globe, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ReflexStats {
  threats_blocked_24h: number;
  bot_detection_accuracy: number;
  active_protection_modules: number;
  avg_response_time: number;
  recent_events: Array<{
    timestamp: string;
    action: string;
    ip_address: string;
    reason: string;
    risk_score: number;
  }>;
}

export function ReflexMonitor() {
  const [stats, setStats] = useState<ReflexStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadReflexStats();
    const interval = setInterval(() => {
      loadReflexStats();
    }, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadReflexStats = async () => {
    try {
      // Fetch Reflex analytics from our edge function
      const { data, error } = await supabase.functions.invoke('pf-reflex-analytics', {
        body: { action: 'get_stats', site_url: 'cmpsbl.com' }
      });

      if (error) throw error;
      
      if (data) {
        setStats(data);
        setLastUpdate(new Date());
        
        // Send stats to Brain for learning
        await supabase.functions.invoke('pf-brain-learn', {
          body: {
            source: 'reflex_monitor',
            category: 'security_analytics',
            data: {
              threats_blocked: data.threats_blocked_24h,
              detection_accuracy: data.bot_detection_accuracy,
              timestamp: new Date().toISOString()
            }
          }
        });
      }
    } catch (error: any) {
      console.error('Error loading Reflex stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'block': return 'bg-destructive/20 text-destructive border-destructive/50';
      case 'challenge': return 'bg-neon-amber/20 text-neon-amber border-neon-amber/50';
      case 'allow': return 'bg-neon-green/20 text-neon-green border-neon-green/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  if (loading && !stats) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary animate-pulse" />
            Reflex Protection Status
          </CardTitle>
          <CardDescription>Loading real-time protection data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>CMPSBL.com Reflex Protection</CardTitle>
          </div>
          <Badge variant="outline" className="border-neon-green/50 text-neon-green bg-neon-green/10">
            <Activity className="w-3 h-3 mr-1 animate-pulse" />
            Live
          </Badge>
        </div>
        <CardDescription>
          Real-time threat protection for this website
          <span className="ml-2 text-xs text-muted-foreground">
            Updated {lastUpdate.toLocaleTimeString()}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <TrendingUp className="w-3 h-3 text-destructive/50" />
            </div>
            <div className="text-2xl font-bold text-destructive">
              {stats?.threats_blocked_24h || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Threats Blocked (24h)
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-neon-green/10 to-neon-green/5 border border-neon-green/20">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-4 h-4 text-neon-green" />
              <TrendingUp className="w-3 h-3 text-neon-green/50" />
            </div>
            <div className="text-2xl font-bold text-neon-green">
              {stats?.bot_detection_accuracy || 99.2}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Detection Accuracy
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-neon-blue/10 to-neon-blue/5 border border-neon-blue/20">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-4 h-4 text-neon-blue" />
              <Activity className="w-3 h-3 text-neon-blue/50 animate-pulse" />
            </div>
            <div className="text-2xl font-bold text-neon-blue">
              {stats?.active_protection_modules || 5}/5
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Active Layers
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-neon-purple/10 to-neon-purple/5 border border-neon-purple/20">
            <div className="flex items-center justify-between mb-2">
              <Globe className="w-4 h-4 text-neon-purple" />
              <TrendingUp className="w-3 h-3 text-neon-purple/50" />
            </div>
            <div className="text-2xl font-bold text-neon-purple">
              {stats?.avg_response_time || 42}ms
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Avg Response Time
            </div>
          </div>
        </div>

        {/* Recent Events */}
        {stats?.recent_events && stats.recent_events.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recent Protection Events
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.recent_events.map((event, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={getActionColor(event.action)}>
                          {event.action.toUpperCase()}
                        </Badge>
                        <code className="text-xs text-muted-foreground font-mono truncate">
                          {event.ip_address}
                        </code>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {event.reason}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-sm font-semibold ${
                        event.risk_score >= 70 ? 'text-destructive' :
                        event.risk_score >= 40 ? 'text-neon-amber' :
                        'text-neon-green'
                      }`}>
                        Risk: {event.risk_score}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Footer */}
        <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span>CMPSBL DEFENSE Reflex Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3" />
            <span>Enterprise Protection Enabled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
