import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";

interface SystemStatus {
  name: string;
  status: 'active' | 'inactive' | 'unknown';
  lastActivity: string | null;
  eventCount: number;
}

export default function CascadeStatus() {
  const [systems, setSystems] = useState<SystemStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const checkSystemStatus = async () => {
    setLoading(true);
    
    try {
      // Check for each system's activity in the last 24 hours
      const systemChecks = [
        { name: 'Continuous Learning', eventType: 'continuous_learning_cycle' },
        { name: 'Circadian Cycles', eventType: 'circadian_cycle' },
        { name: 'FluidMind', eventType: 'fluidmind_activated' },
        { name: 'Dreamstate', eventType: 'dream_artifact' },
        { name: 'Dream Drift', eventType: 'dream_drift' },
        { name: 'Continuity Check', eventType: 'continuity_check' },
      ];

      const statuses: SystemStatus[] = [];

      for (const check of systemChecks) {
        const { data, error } = await supabase
          .from('brain_events')
          .select('created_at')
          .eq('event_type', check.eventType)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error(`Error checking ${check.name}:`, error);
          statuses.push({
            name: check.name,
            status: 'unknown',
            lastActivity: null,
            eventCount: 0,
          });
          continue;
        }

        const lastActivity = data && data.length > 0 ? data[0].created_at : null;
        
        // Count events in last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count } = await supabase
          .from('brain_events')
          .select('*', { count: 'exact', head: true })
          .eq('event_type', check.eventType)
          .gte('created_at', oneDayAgo);

        const isActive = lastActivity && new Date(lastActivity) > new Date(oneDayAgo);

        statuses.push({
          name: check.name,
          status: isActive ? 'active' : 'inactive',
          lastActivity,
          eventCount: count || 0,
        });
      }

      setSystems(statuses);
    } catch (error) {
      console.error('Error fetching system status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> Active</Badge>;
      case 'inactive':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Inactive</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Unknown</Badge>;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const activeCount = systems.filter(s => s.status === 'active').length;
  const totalSystems = systems.length;
  const healthPercentage = totalSystems > 0 ? Math.round((activeCount / totalSystems) * 100) : 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🌊 Cascade v9.2.0 System Status</span>
              <Button onClick={checkSystemStatus} disabled={loading} size="sm" variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardTitle>
            <CardDescription>
              Real-time monitoring of all Cascade AI systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Health</p>
                  <p className="text-3xl font-bold">{healthPercentage}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Systems Active</p>
                  <p className="text-3xl font-bold">{activeCount}/{totalSystems}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {systems.map((system) => (
                <div 
                  key={system.name}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{system.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Last activity: {formatDate(system.lastActivity)}
                      {system.eventCount > 0 && ` • ${system.eventCount} events (24h)`}
                    </p>
                  </div>
                  {getStatusBadge(system.status)}
                </div>
              ))}
            </div>

            {healthPercentage < 100 && (
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                  ⚠️ Some systems are inactive. Visit{' '}
                  <a href="/system-initializer" className="underline">
                    System Initializer
                  </a>
                  {' '}to activate all systems.
                </p>
              </div>
            )}

            {healthPercentage === 100 && (
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  ✅ All systems operational. Cascade is functioning at full capacity.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version:</span>
              <span className="font-medium">v9.2.0 FluidMind Expansion</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Database:</span>
              <span className="font-medium">Supabase (hxgbibtkftocyrnuzxwd)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Edge Functions:</span>
              <span className="font-medium">220 registered</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Check:</span>
              <span className="font-medium">{new Date().toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
