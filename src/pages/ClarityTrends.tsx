import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, Minus, BarChart } from 'lucide-react';
import { LineChart, Line, BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ClarityTrends() {
  const [searchParams] = useSearchParams();
  const siteId = searchParams.get('siteId');
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState(siteId || '');
  const [period, setPeriod] = useState('30');
  const [trends, setTrends] = useState<any>(null);
  const [issueTrends, setIssueTrends] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      loadTrends();
    }
  }, [selectedSite, period]);

  const loadSites = async () => {
    const { data } = await supabase
      .from('pf_clarity_sites')
      .select('*')
      .order('created_at', { ascending: false });

    setSites(data || []);
    if (data && data.length > 0 && !selectedSite) {
      setSelectedSite(data[0].id);
    }
  };

  const loadTrends = async () => {
    if (!selectedSite) return;

    setLoading(true);

    try {
      const [trendsResponse, issuesResponse] = await Promise.all([
        supabase.functions.invoke('pf-clarity-trend-analyzer', {
          body: { action: 'get_trends', site_id: selectedSite, period: parseInt(period) },
        }),
        supabase.functions.invoke('pf-clarity-trend-analyzer', {
          body: { action: 'get_issue_trends', site_id: selectedSite, period: parseInt(period) },
        }),
      ]);

      if (trendsResponse.data?.success) {
        setTrends(trendsResponse.data.trends);
      }

      if (issuesResponse.data?.success) {
        setIssueTrends(issuesResponse.data.issue_trends);
      }
    } catch (error: any) {
      toast({ title: 'Error loading trends', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-5 w-5 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-5 w-5 text-red-500" />;
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Compliance Trends</h1>
        <BarChart className="h-8 w-8 text-primary" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Site</label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.site_url}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </CardContent>
        </Card>
      ) : trends ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold">{trends.summary.current_score}%</p>
                  {getTrendIcon(trends.summary.score_change)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Score Change</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{trends.summary.score_change > 0 ? '+' : ''}{trends.summary.score_change}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{trends.summary.total_scans}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{trends.summary.avg_score}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Score Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Score Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} name="Score %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Issues Trend Chart */}
          {issueTrends && (
            <Card>
              <CardHeader>
                <CardTitle>Issues by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBar data={issueTrends.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="critical" fill="#ef4444" name="Critical" />
                    <Bar dataKey="warning" fill="#f59e0b" name="Warning" />
                    <Bar dataKey="info" fill="#3b82f6" name="Info" />
                  </RechartsBar>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No trend data available. Run some scans first.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
