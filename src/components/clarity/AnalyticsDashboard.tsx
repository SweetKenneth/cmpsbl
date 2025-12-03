import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface AnalyticsData {
  totalSites: number;
  totalScans: number;
  avgComplianceScore: number;
  trendDirection: 'up' | 'down' | 'stable';
  scanHistory: { date: string; score: number; issues: number }[];
  issueBreakdown: { severity: string; count: number }[];
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: sites } = await supabase
        .from('pf_clarity_sites')
        .select('id')
        .eq('user_id', user.id);

      const { data: scans } = await supabase
        .from('pf_clarity_scans')
        .select('id, compliance_score, issues_found, completed_at, status')
        .in('site_id', sites?.map(s => s.id) || [])
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(30);

      const { data: issues } = await supabase
        .from('pf_clarity_issues')
        .select('severity')
        .in('scan_id', scans?.map(s => s.id) || []);

      const avgScore = scans && scans.length > 0
        ? scans.reduce((sum, s) => sum + s.compliance_score, 0) / scans.length
        : 0;

      const scanHistory = scans?.slice(0, 10).reverse().map(s => ({
        date: new Date(s.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: Math.round(s.compliance_score),
        issues: s.issues_found,
      })) || [];

      const issueBreakdown = issues?.reduce((acc, issue) => {
        const existing = acc.find(i => i.severity === issue.severity);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ severity: issue.severity, count: 1 });
        }
        return acc;
      }, [] as { severity: string; count: number }[]) || [];

      const trend = scanHistory.length >= 2
        ? scanHistory[scanHistory.length - 1].score > scanHistory[0].score
          ? 'up'
          : scanHistory[scanHistory.length - 1].score < scanHistory[0].score
          ? 'down'
          : 'stable'
        : 'stable';

      setAnalytics({
        totalSites: sites?.length || 0,
        totalScans: scans?.length || 0,
        avgComplianceScore: avgScore,
        trendDirection: trend,
        scanHistory,
        issueBreakdown,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return <div className="text-muted-foreground">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Avg Compliance</h3>
            {analytics.trendDirection === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
            {analytics.trendDirection === 'down' && <TrendingDown className="w-4 h-4 text-destructive" />}
            {analytics.trendDirection === 'stable' && <Activity className="w-4 h-4 text-muted-foreground" />}
          </div>
          <p className="text-3xl font-bold text-primary">{Math.round(analytics.avgComplianceScore)}%</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Sites</h3>
          <p className="text-3xl font-bold">{analytics.totalSites}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Scans</h3>
          <p className="text-3xl font-bold">{analytics.totalScans}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Compliance Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={analytics.scanHistory}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis domain={[0, 100]} className="text-xs" />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Issues by Severity</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={analytics.issueBreakdown}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="severity" className="text-xs capitalize" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
