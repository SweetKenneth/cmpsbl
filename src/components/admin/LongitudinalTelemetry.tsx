/**
 * Longitudinal Telemetry Chart — 24h/7d/30d system performance trends
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import type { SystemMetricsPoint } from '@/lib/substrate/promotion-pipeline/types';

interface TelemetryChartProps {
  data24h: SystemMetricsPoint[];
  data7d: SystemMetricsPoint[];
  data30d: SystemMetricsPoint[];
}

function formatTime(iso: string, range: string): string {
  const d = new Date(iso);
  if (range === '24h') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (range === '7d') return d.toLocaleDateString([], { weekday: 'short', hour: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function prepareData(points: SystemMetricsPoint[], range: string) {
  return points.map(p => ({
    time: formatTime(p.recorded_at, range),
    successRate: p.success_rate != null ? +(p.success_rate * 100).toFixed(1) : null,
    escalationRate: p.escalation_rate != null ? +(p.escalation_rate * 100).toFixed(1) : null,
    integrityScore: p.integrity_health_score,
    ruleCount: p.rule_count,
    promotedRules: p.promoted_rule_count,
    rollbacks: p.rollback_count,
    executorHealth: p.avg_executor_health != null ? +(p.avg_executor_health * 100).toFixed(1) : null,
  }));
}

function exportJSON(data: SystemMetricsPoint[], range: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `system-metrics-${range}-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCSV(data: SystemMetricsPoint[], range: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(d => Object.values(d).join(','));
  const blob = new Blob([headers + '\n' + rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `system-metrics-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function LongitudinalTelemetry({ data24h, data7d, data30d }: TelemetryChartProps) {
  const [activeRange, setActiveRange] = useState<'24h' | '7d' | '30d'>('24h');

  const rangeData = activeRange === '24h' ? data24h : activeRange === '7d' ? data7d : data30d;
  const chartData = prepareData(rangeData, activeRange);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            System Performance Over Time
            <Badge variant="outline" className="text-[10px]">{rangeData.length} pts</Badge>
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={() => exportJSON(rangeData, activeRange)}>
              <Download className="w-3 h-3" /> JSON
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={() => exportCSV(rangeData, activeRange)}>
              <Download className="w-3 h-3" /> CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeRange} onValueChange={(v) => setActiveRange(v as any)}>
          <TabsList className="mb-4 h-8">
            <TabsTrigger value="24h" className="text-xs px-3">24h</TabsTrigger>
            <TabsTrigger value="7d" className="text-xs px-3">7d</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs px-3">30d</TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            {/* Success Rate Chart */}
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Success Rate & Escalation</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                  <Tooltip contentStyle={{ fontSize: 11, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Area type="monotone" dataKey="successRate" name="Success %" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                  <Area type="monotone" dataKey="escalationRate" name="Escalation %" stroke="#ef4444" fill="#ef4444" fillOpacity={0.05} strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Integrity & Rules Chart */}
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Integrity Health & Rule Growth</p>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ fontSize: 11, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="integrityScore" name="Integrity" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="ruleCount" name="Rules" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="promotedRules" name="Promoted" stroke="#10b981" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Tabs>

        {chartData.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No telemetry data yet. Metrics are recorded every 15 minutes and on promote/rollback events.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
