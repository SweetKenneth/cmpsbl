import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#7A5FFF', '#01C9E8', '#F59E0B', '#EF4444', '#10B981'];

export default function BotSniperAnalytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bot-sniper-stats', {
        body: { timeRange }
      });

      if (error) throw error;
      setStats(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const threatTypeData = stats?.threat_types
    ? Object.entries(stats.threat_types).map(([name, value]) => ({
        name,
        value
      }))
    : [];

  const actionData = stats?.actions
    ? Object.entries(stats.actions).map(([name, value]) => ({
        name,
        value: value as number
      }))
    : [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/bot-sniper')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Detailed threat intelligence and patterns</p>
            </div>
          </div>

          <div className="flex gap-2">
            {['24h', '7d', '30d'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                onClick={() => setTimeRange(range)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {range}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-lg">Loading analytics...</div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Total Requests</p>
                <p className="text-3xl font-bold">{stats?.summary?.total_requests || 0}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Bots Detected</p>
                <p className="text-3xl font-bold">{stats?.summary?.bots_detected || 0}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Bot %</p>
                <p className="text-3xl font-bold">{stats?.summary?.bot_percentage || 0}%</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Avg Threat</p>
                <p className="text-3xl font-bold">{stats?.summary?.avg_threat_score || 0}</p>
              </Card>
            </div>

            {/* Timeline Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Request Timeline</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.timeline || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="requests" fill="#7A5FFF" name="Total Requests" />
                  <Bar dataKey="bots" fill="#EF4444" name="Bots Detected" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Threat Types & Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Threat Types</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={threatTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {threatTypeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Actions Taken</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={actionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#01C9E8" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
