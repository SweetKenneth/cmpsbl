/**
 * ScanTrendDashboard — Visualizes scan history, health trends, and debt reduction
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Activity, BarChart3 } from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, 
  Area, AreaChart, CartesianGrid
} from 'recharts';
import { useEvolutionReceipts, useScanHistory } from '@/hooks/useEvolutionControlCenter';

function TrendIndicator({ current, previous }: { current: number; previous: number }) {
  const delta = current - previous;
  if (Math.abs(delta) < 0.5) return <Minus className="w-3 h-3 text-muted-foreground" />;
  return delta > 0 ? <TrendingUp className="w-3 h-3 text-neon-green" /> : <TrendingDown className="w-3 h-3 text-destructive" />;
}

export function ScanTrendDashboard() {
  const { data: receipts = [], isLoading: receiptsLoading } = useEvolutionReceipts();
  const { data: snapshots = [], isLoading: snapshotsLoading } = useScanHistory();

  // Build trend data from receipts
  const trendData = receipts.map((r, i) => {
    const pre = r.pre_metrics as Record<string, number> | null;
    const post = r.post_metrics as Record<string, number> | null;
    const healthBefore = (pre?.health_score as number) ?? 0;
    const healthAfter = (post?.health_score as number) ?? healthBefore;
    const debtBefore = (pre?.debt_flags_count as number) ?? 0;
    const debtAfter = (post?.debt_flags_count as number) ?? debtBefore;
    
    return {
      index: i + 1,
      timestamp: new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      health: healthAfter,
      healthBefore,
      debt: debtAfter,
      debtBefore,
      status: r.status,
      phase: r.phase,
    };
  });

  // Build snapshot trend data
  const snapshotTrend = snapshots.map((s, i) => {
    const d = s.data as Record<string, number> | null;
    return {
      index: i + 1,
      timestamp: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      healthScore: s.health_score ?? (d?.health_score as number) ?? 0,
      errorRate: s.error_rate ?? 0,
      activeModules: s.active_modules ?? 0,
    };
  });

  const isLoading = receiptsLoading || snapshotsLoading;
  const chartData = trendData.length > 0 ? trendData : snapshotTrend;
  const hasData = chartData.length > 0;

  // Summary stats
  const latestHealth = trendData.length > 0 ? trendData[trendData.length - 1]?.health ?? 0 : 
                       snapshotTrend.length > 0 ? snapshotTrend[snapshotTrend.length - 1]?.healthScore ?? 0 : 0;
  const prevHealth = trendData.length > 1 ? trendData[trendData.length - 2]?.health ?? 0 :
                     snapshotTrend.length > 1 ? snapshotTrend[snapshotTrend.length - 2]?.healthScore ?? 0 : 0;
  const latestDebt = trendData.length > 0 ? trendData[trendData.length - 1]?.debt ?? 0 : 0;
  const prevDebt = trendData.length > 1 ? trendData[trendData.length - 2]?.debt ?? 0 : 0;
  const successCount = receipts.filter(r => r.status === 'success' || r.status === 'applied').length;
  const totalRuns = receipts.length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Scan & Evolution Trends</h3>
        <p className="text-sm text-muted-foreground">Track system improvement over time</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <span className="text-xs text-muted-foreground">Health Score</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold font-mono">{latestHealth.toFixed(0)}</span>
            <TrendIndicator current={latestHealth} previous={prevHealth} />
          </div>
        </Card>
        <Card className="p-3">
          <span className="text-xs text-muted-foreground">Debt Flags</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold font-mono">{latestDebt}</span>
            {prevDebt > 0 && (
              <Badge variant={latestDebt < prevDebt ? 'default' : 'destructive'} className="text-[10px]">
                {latestDebt < prevDebt ? `↓${prevDebt - latestDebt}` : `↑${latestDebt - prevDebt}`}
              </Badge>
            )}
          </div>
        </Card>
        <Card className="p-3">
          <span className="text-xs text-muted-foreground">Evolution Runs</span>
          <span className="text-xl font-bold font-mono block mt-1">{totalRuns}</span>
        </Card>
        <Card className="p-3">
          <span className="text-xs text-muted-foreground">Success Rate</span>
          <span className="text-xl font-bold font-mono block mt-1">
            {totalRuns > 0 ? `${((successCount / totalRuns) * 100).toFixed(0)}%` : '—'}
          </span>
        </Card>
      </div>

      {/* Health Trend Chart */}
      {hasData ? (
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Health Trend
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area 
                type="monotone" 
                dataKey={trendData.length > 0 ? 'health' : 'healthScore'} 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary) / 0.1)" 
                strokeWidth={2}
                name="Health"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      ) : (
        <Card className="p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6 text-muted-foreground" />
          </div>
          <h4 className="text-sm font-semibold">No trend data yet</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Run evolution cycles to generate health trend data. Each cycle captures before/after metrics for tracking.
          </p>
        </Card>
      )}

      {/* Debt Reduction Chart */}
      {trendData.length > 0 && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Debt Reduction
          </h4>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Line type="monotone" dataKey="debt" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} name="Debt Flags" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
