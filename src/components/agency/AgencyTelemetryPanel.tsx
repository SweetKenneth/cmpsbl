/**
 * AgencyTelemetryPanel — Displays agency work metrics and verification
 */

import { useAgencyTelemetry } from '@/lib/agency/hooks/useAgencyTelemetry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RefreshCw, Activity, Globe, Database, Zap, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgencyTelemetryPanelProps {
  agencyId: string;
  className?: string;
}

export function AgencyTelemetryPanel({ agencyId, className }: AgencyTelemetryPanelProps) {
  const {
    metrics,
    agentLedgers,
    recentApiCalls,
    isLoading,
    isRefreshing,
    refresh,
    successRate,
    avgLatency,
    topSkills,
  } = useAgencyTelemetry({ agencyId, refreshInterval: 30000 });

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader><CardTitle>Loading Telemetry...</CardTitle></CardHeader>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Summary Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Work Telemetry
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={refresh} disabled={isRefreshing}>
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Tasks Completed"
              value={metrics?.tasks_completed || 0}
              icon={<CheckCircle className="h-4 w-4 text-neon-green" />}
            />
            <StatCard
              label="Websites Crawled"
              value={metrics?.websites_crawled || 0}
              icon={<Globe className="h-4 w-4 text-neon-blue" />}
            />
            <StatCard
              label="API Calls"
              value={metrics?.api_calls || 0}
              icon={<Zap className="h-4 w-4 text-neon-amber" />}
            />
            <StatCard
              label="Datasets Processed"
              value={metrics?.datasets_processed || 0}
              icon={<Database className="h-4 w-4 text-neon-purple" />}
            />
          </div>

          {/* Success Rate */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Success Rate</span>
              <span className="font-medium">{(successRate * 100).toFixed(1)}%</span>
            </div>
            <Progress value={successRate * 100} className="h-2" />
          </div>

          {/* Avg Latency */}
          {avgLatency !== null && (
            <div className="mt-2 text-sm text-muted-foreground">
              Avg Latency: <span className="font-medium">{(avgLatency / 1000).toFixed(1)}s</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Skills */}
      {topSkills.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Skills Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topSkills.map(({ skill, count }) => (
                <Badge key={skill} variant="secondary">
                  {skill}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent API Calls */}
      {recentApiCalls.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recent API Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {recentApiCalls.slice(0, 10).map((call) => (
                <div key={call.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {call.success ? (
                      <CheckCircle className="h-3 w-3 text-neon-green" />
                    ) : (
                      <XCircle className="h-3 w-3 text-destructive" />
                    )}
                    <span className="font-mono">{call.api_name}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {call.response_time_ms ? `${call.response_time_ms}ms` : '-'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
    </div>
  );
}
