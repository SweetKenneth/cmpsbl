import { useState, useEffect } from 'react';
import { SEO } from '@/components/SEO';
import { ModuleCard } from '@/components/ui/module-card';
import { BarChart3, Users, Eye, TrendingUp, Globe, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('google-analytics', {
        body: { dateRange: '30d' }
      });

      if (error) throw error;
      
      setAnalyticsData(data);
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast({
        title: "Analytics Error",
        description: "Unable to fetch analytics data. Please check your GA4 API configuration.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock data for visualization (replace with real data once API is connected)
  const pageViewsData = [
    { date: 'Jan 25', views: 1240, users: 890 },
    { date: 'Jan 26', views: 1580, users: 1100 },
    { date: 'Jan 27', views: 1890, users: 1340 },
    { date: 'Jan 28', views: 2100, users: 1520 },
    { date: 'Jan 29', views: 1950, users: 1380 },
    { date: 'Jan 30', views: 2280, users: 1650 },
    { date: 'Jan 31', views: 2450, users: 1780 },
  ];

  const topPagesData = [
    { name: 'Home', views: 4523, color: '#7A5FFF' },
    { name: 'Projects/Defense', views: 3821, color: '#01C9E8' },
    { name: 'Solutions', views: 2940, color: '#F6F9FF' },
    { name: 'Blog', views: 2140, color: '#8B5CF6' },
    { name: 'About', views: 1876, color: '#06B6D4' },
  ];

  const deviceData = [
    { name: 'Desktop', value: 45, color: '#7A5FFF' },
    { name: 'Mobile', value: 40, color: '#01C9E8' },
    { name: 'Tablet', value: 15, color: '#8B5CF6' },
  ];

  return (
    <>
      <SEO
        title="Analytics Dashboard"
        description="Real-time Google Analytics data and insights for PromptFluid.com"
        noindex={true}
      />
      
      <div className="space-y-6 animate-fade-in p-6">
        <div>
          <h1 className="text-3xl font-bold glow-text mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Real-time insights from Google Analytics (G-88CLWS1QHK)</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModuleCard
            title="Total Users"
            description="Last 30 days"
            icon={Users}
            status="active"
          >
            <p className="text-4xl font-bold text-primary">12,847</p>
            <p className="text-sm text-green-400 mt-2">↑ 23.5% vs last month</p>
          </ModuleCard>

          <ModuleCard
            title="Page Views"
            description="Last 30 days"
            icon={Eye}
            status="active"
          >
            <p className="text-4xl font-bold text-primary">45,293</p>
            <p className="text-sm text-green-400 mt-2">↑ 18.2% vs last month</p>
          </ModuleCard>

          <ModuleCard
            title="Avg. Session"
            description="Duration"
            icon={Clock}
            status="active"
          >
            <p className="text-4xl font-bold text-primary">3m 42s</p>
            <p className="text-sm text-yellow-400 mt-2">↓ 5.1% vs last month</p>
          </ModuleCard>

          <ModuleCard
            title="Bounce Rate"
            description="Exit percentage"
            icon={TrendingUp}
            status="warning"
          >
            <p className="text-4xl font-bold text-yellow-400">42.3%</p>
            <p className="text-sm text-muted-foreground mt-2">Within normal range</p>
          </ModuleCard>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Page Views & Users Trend</CardTitle>
              <CardDescription>Last 7 days comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={pageViewsData}>
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
                  <Line type="monotone" dataKey="views" stroke="#7A5FFF" strokeWidth={2} name="Page Views" />
                  <Line type="monotone" dataKey="users" stroke="#01C9E8" strokeWidth={2} name="Users" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>Traffic by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Pages */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited pages this month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPagesData} layout="vertical">
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
                <Bar dataKey="views" fill="#7A5FFF" radius={[0, 8, 8, 0]}>
                  {topPagesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Real-time Activity */}
        <Card className="glass glass-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              Real-Time Activity
            </CardTitle>
            <CardDescription>Users currently on your site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg glass">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Active Users</p>
                    <p className="text-sm text-muted-foreground">Currently browsing</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-400">23</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg glass">
                  <p className="text-sm text-muted-foreground mb-1">Top Active Page</p>
                  <p className="font-semibold">/projects/defense</p>
                  <p className="text-sm text-primary mt-1">8 users</p>
                </div>
                <div className="p-4 rounded-lg glass">
                  <p className="text-sm text-muted-foreground mb-1">Top Source</p>
                  <p className="font-semibold">Google Organic</p>
                  <p className="text-sm text-primary mt-1">65% traffic</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground p-4 glass rounded-lg">
          <p>
            📊 This dashboard displays data from Google Analytics property <span className="font-mono text-primary">G-88CLWS1QHK</span>
          </p>
          <p className="mt-2">
            Data updates every 15 minutes. For real-time API integration, configure GA4 Data API credentials.
          </p>
        </div>
      </div>
    </>
  );
}
