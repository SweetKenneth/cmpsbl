import { useState, useEffect } from 'react';
import { SEO } from '@/components/SEO';
import { ModuleCard } from '@/components/ui/module-card';
import { BarChart3, Users, Eye, TrendingUp, Globe, Clock, Activity, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UsageMetric {
  date: string;
  calls: number;
  tokens: number;
}

interface ServiceMetric {
  name: string;
  value: number;
  color: string;
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalCalls: 0,
    totalTokens: 0,
    avgResponseTime: 0,
    successRate: 0,
    activeServices: 0
  });
  const [usageTimeSeries, setUsageTimeSeries] = useState<UsageMetric[]>([]);
  const [serviceBreakdown, setServiceBreakdown] = useState<ServiceMetric[]>([]);
  const [topCategories, setTopCategories] = useState<{ name: string; calls: number; color: string }[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchInternalMetrics();
  }, []);

  const fetchInternalMetrics = async () => {
    try {
      setLoading(true);
      
      // Fetch AI usage logs for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [usageLogs, brainMetrics, brainEvents, defenseEvents] = await Promise.all([
        supabase
          .from('ai_usage_log')
          .select('*')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false }),
        supabase
          .from('brain_metrics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('brain_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('defense_events')
          .select('*')
          .order('detected_at', { ascending: false })
          .limit(50)
      ]);

      const logs = usageLogs.data || [];
      const brainData = brainMetrics.data || [];
      const events = brainEvents.data || [];
      const defense = defenseEvents.data || [];

      // Calculate summary metrics
      const totalCalls = logs.length;
      const totalTokens = logs.reduce((sum, log) => sum + (log.tokens_used || 0), 0);
      const avgResponseTime = logs.length > 0 
        ? logs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / logs.length 
        : 0;
      const successCount = logs.filter(log => log.success === true).length;
      const successRate = logs.length > 0 ? (successCount / logs.length) * 100 : 100;

      // Get unique services/categories
      const categories = new Set(logs.map(log => log.category).filter(Boolean));

      setMetrics({
        totalCalls,
        totalTokens,
        avgResponseTime: Math.round(avgResponseTime),
        successRate: Math.round(successRate * 10) / 10,
        activeServices: categories.size
      });

      // Build time series data (last 7 days)
      const timeSeriesMap = new Map<string, { calls: number; tokens: number }>();
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        timeSeriesMap.set(dateKey, { calls: 0, tokens: 0 });
      }

      logs.forEach(log => {
        const date = new Date(log.created_at);
        const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (timeSeriesMap.has(dateKey)) {
          const current = timeSeriesMap.get(dateKey)!;
          timeSeriesMap.set(dateKey, {
            calls: current.calls + 1,
            tokens: current.tokens + (log.tokens_used || 0)
          });
        }
      });

      setUsageTimeSeries(
        Array.from(timeSeriesMap.entries()).map(([date, data]) => ({
          date,
          calls: data.calls,
          tokens: data.tokens
        }))
      );

      // Service breakdown (by provider)
      const providerCounts = new Map<string, number>();
      logs.forEach(log => {
        const provider = log.provider || 'unknown';
        providerCounts.set(provider, (providerCounts.get(provider) || 0) + 1);
      });

      const colors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(220 70% 50%)', 'hsl(280 60% 50%)', 'hsl(160 60% 45%)'];
      setServiceBreakdown(
        Array.from(providerCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, value], idx) => ({
            name,
            value,
            color: colors[idx % colors.length]
          }))
      );

      // Top categories
      const categoryCounts = new Map<string, number>();
      logs.forEach(log => {
        const category = log.category || 'general';
        categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
      });

      setTopCategories(
        Array.from(categoryCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, calls], idx) => ({
            name,
            calls,
            color: colors[idx % colors.length]
          }))
      );

      // Recent activity
      setRecentActivity([
        ...events.slice(0, 3).map(e => ({ 
          type: 'brain', 
          message: `${e.event_type}: ${e.module}`,
          time: e.created_at 
        })),
        ...defense.slice(0, 2).map(d => ({ 
          type: 'defense', 
          message: `${d.action}: ${d.endpoint}`,
          time: d.detected_at 
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5));

    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast({
        title: "Analytics Error",
        description: "Unable to fetch internal metrics.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Analytics Dashboard"
        description="Real-time internal metrics and insights for PromptFluid systems"
        noindex={true}
      />
      
      <div className="space-y-6 animate-fade-in p-6">
        <div>
          <h1 className="text-3xl font-bold glow-text mb-2">Internal Analytics</h1>
          <p className="text-muted-foreground">Real-time metrics from PromptFluid systems</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Activity className="w-8 h-8 animate-pulse text-primary" />
            <span className="ml-2 text-muted-foreground">Loading metrics...</span>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <ModuleCard
                title="Total API Calls"
                description="Last 30 days"
                icon={Activity}
                status="active"
              >
                <p className="text-4xl font-bold text-primary">{metrics.totalCalls.toLocaleString()}</p>
              </ModuleCard>

              <ModuleCard
                title="Tokens Used"
                description="Last 30 days"
                icon={Database}
                status="active"
              >
                <p className="text-4xl font-bold text-primary">{metrics.totalTokens.toLocaleString()}</p>
              </ModuleCard>

              <ModuleCard
                title="Avg. Response"
                description="Milliseconds"
                icon={Clock}
                status="active"
              >
                <p className="text-4xl font-bold text-primary">{metrics.avgResponseTime}ms</p>
              </ModuleCard>

              <ModuleCard
                title="Success Rate"
                description="API calls"
                icon={TrendingUp}
                status={metrics.successRate >= 95 ? "active" : "warning"}
              >
                <p className={`text-4xl font-bold ${metrics.successRate >= 95 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {metrics.successRate}%
                </p>
              </ModuleCard>

              <ModuleCard
                title="Active Services"
                description="Categories"
                icon={Globe}
                status="active"
              >
                <p className="text-4xl font-bold text-primary">{metrics.activeServices}</p>
              </ModuleCard>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>API Usage Trend</CardTitle>
                  <CardDescription>Calls and tokens over last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={usageTimeSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                      <Line type="monotone" dataKey="calls" stroke="hsl(var(--primary))" strokeWidth={2} name="API Calls" />
                      <Line type="monotone" dataKey="tokens" stroke="hsl(var(--accent))" strokeWidth={2} name="Tokens (÷100)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle>Provider Distribution</CardTitle>
                  <CardDescription>Calls by AI provider</CardDescription>
                </CardHeader>
                <CardContent>
                  {serviceBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={serviceBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {serviceBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No provider data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Categories */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
                <CardDescription>Most used service categories</CardDescription>
              </CardHeader>
              <CardContent>
                {topCategories.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topCategories} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="calls" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]}>
                        {topCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No category data available yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass glass-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  Recent System Activity
                </CardTitle>
                <CardDescription>Latest brain and defense events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-lg glass">
                        <div className="flex items-center gap-3">
                          {activity.type === 'brain' ? (
                            <Activity className="w-5 h-5 text-primary" />
                          ) : (
                            <Globe className="w-5 h-5 text-yellow-400" />
                          )}
                          <div>
                            <p className="font-medium">{activity.message}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(activity.time).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent activity
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-muted-foreground p-4 glass rounded-lg">
              <p>
                📊 This dashboard displays internal metrics from PromptFluid systems
              </p>
              <p className="mt-2">
                Data refreshes on page load. Last updated: {new Date().toLocaleString()}
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
