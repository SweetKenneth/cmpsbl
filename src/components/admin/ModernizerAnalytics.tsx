import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { TrendingUp, CheckCircle, XCircle, Users, Clock } from 'lucide-react';

interface Analytics {
  id: string;
  site_url: string | null;
  status: string | null;
  analysis_result: any;
  created_at: string;
}

export const ModernizerAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data, error } = await supabase
          .from('evolution_runs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30);

        if (error) throw error;
        setAnalytics(data || []);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading analytics...</div>;

  const totalJobs = analytics.length;
  const totalCompleted = analytics.filter(a => a.status === 'completed').length;
  const totalFailed = analytics.filter(a => a.status === 'failed').length;
  
  const avgA11y = analytics.reduce((sum, item) => {
    const score = item.analysis_result?.accessibility_score || 0;
    return sum + score;
  }, 0) / (analytics.length || 1);
  
  const avgSEO = analytics.reduce((sum, item) => {
    const score = item.analysis_result?.seo_score || 0;
    return sum + score;
  }, 0) / (analytics.length || 1);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Evolution Analytics</h2>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Total Jobs</div>
              <div className="text-3xl font-bold mt-1">{totalJobs}</div>
            </div>
            <TrendingUp className="h-8 w-8 text-primary opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Completed</div>
              <div className="text-3xl font-bold mt-1 text-green-600">{totalCompleted}</div>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Avg A11y Score</div>
              <div className="text-3xl font-bold mt-1">{Math.round(avgA11y)}%</div>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Avg SEO Score</div>
              <div className="text-3xl font-bold mt-1">{Math.round(avgSEO)}%</div>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600 opacity-50" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Overall Stats</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Total Sites</div>
              <div className="font-bold">{analytics.filter((item, index, self) => 
                index === self.findIndex(t => t.site_url === item.site_url)
              ).length}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Pending</div>
              <div className="font-bold">
                {analytics.filter(a => a.status === 'pending').length}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-destructive" />
            <div>
              <div className="text-sm text-muted-foreground">Failed Jobs</div>
              <div className="font-bold">{totalFailed}</div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Recent Scans</h3>
        <div className="space-y-2">
          {analytics.slice(0, 7).map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-sm truncate max-w-[200px]">{item.site_url || 'Unknown'}</span>
              <div className="flex items-center gap-4 text-sm">
                <span className={`font-medium ${item.status === 'completed' ? 'text-green-600' : item.status === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {item.status}
                </span>
                {item.analysis_result?.accessibility_score && (
                  <span className="font-medium">
                    {Math.round(item.analysis_result.accessibility_score)}% A11y
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};