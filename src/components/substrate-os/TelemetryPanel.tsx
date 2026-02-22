/**
 * Longitudinal Telemetry Panel — 24h / 7d / 30d system metrics
 */

import { Download, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMetricsHistory } from '@/hooks/admin/useMetricsHistory';
import { cn } from '@/lib/utils';
import type { TimeWindow } from '@/lib/substrate/metrics-history';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend
} from 'recharts';

const WINDOW_OPTIONS: { value: TimeWindow; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
];

export function TelemetryPanel() {
  const { history, latest, isLoading, window, setWindow, exportJSON, exportCSV } = useMetricsHistory();

  const chartData = history.map((m: any) => ({
    time: new Date(m.recorded_at).toLocaleDateString(),
    success: m.success_rate ?? 0,
    escalation: m.escalation_rate ?? 0,
    integrity: m.integrity_health_score ?? 100,
    rules: m.rule_count ?? 0,
    rollbacks: m.rollback_count ?? 0,
  }));

  return (
    <div className="space-y-4">
      {/* Window Selector + Export */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {WINDOW_OPTIONS.map(opt => (
            <Button
              key={opt.value}
              size="sm"
              variant={window === opt.value ? 'default' : 'outline'}
              className={cn(
                "h-7 px-3 text-xs",
                window === opt.value && "bg-cyan-600 hover:bg-cyan-700"
              )}
              onClick={() => setWindow(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={exportJSON}>
            <Download className="w-3 h-3" /> JSON
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={exportCSV}>
            <Download className="w-3 h-3" /> CSV
          </Button>
        </div>
      </div>

      {/* Latest Metrics Summary */}
      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border border-emerald-500/20 bg-white/5">
            <CardContent className="p-3 text-center">
              <TrendingUp className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
              <p className="text-lg font-bold text-emerald-400">{(latest as any).success_rate?.toFixed(1) ?? '—'}%</p>
              <p className="text-[9px] text-muted-foreground">Success Rate</p>
            </CardContent>
          </Card>
          <Card className="border border-amber-500/20 bg-white/5">
            <CardContent className="p-3 text-center">
              <Activity className="w-4 h-4 mx-auto mb-1 text-amber-400" />
              <p className="text-lg font-bold text-amber-400">{(latest as any).escalation_rate?.toFixed(1) ?? '—'}%</p>
              <p className="text-[9px] text-muted-foreground">Escalation Rate</p>
            </CardContent>
          </Card>
          <Card className="border border-cyan-500/20 bg-white/5">
            <CardContent className="p-3 text-center">
              <BarChart3 className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
              <p className="text-lg font-bold text-cyan-400">{(latest as any).integrity_health_score ?? '—'}</p>
              <p className="text-[9px] text-muted-foreground">Integrity Score</p>
            </CardContent>
          </Card>
          <Card className="border border-red-500/20 bg-white/5">
            <CardContent className="p-3 text-center">
              <Activity className="w-4 h-4 mx-auto mb-1 text-red-400" />
              <p className="text-lg font-bold text-red-400">{(latest as any).rollback_count ?? 0}</p>
              <p className="text-[9px] text-muted-foreground">Rollbacks</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {isLoading ? (
        <Skeleton className="h-[250px] rounded-xl" />
      ) : chartData.length > 0 ? (
        <div className="space-y-4">
          {/* Success Rate + Integrity */}
          <Card className="border border-white/10 bg-white/5 dark:bg-white/[0.02]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Success Rate & Integrity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#888' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#888' }} />
                  <Tooltip 
                    contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="success" name="Success %" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="integrity" name="Integrity" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Escalation Rate */}
          <Card className="border border-white/10 bg-white/5 dark:bg-white/[0.02]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Escalation Rate & Rollbacks</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 9, fill: '#888' }} />
                  <Tooltip 
                    contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="escalation" name="Escalation %" stroke="#f59e0b" dot={false} />
                  <Line type="monotone" dataKey="rollbacks" name="Rollbacks" stroke="#ef4444" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border border-white/10 bg-white/5 dark:bg-white/[0.02]">
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No telemetry data yet</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">Metrics are recorded on promote, rollback, and periodically</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
