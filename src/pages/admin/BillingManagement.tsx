import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/ui/StatCard";
import { ActionButton } from "@/components/admin/ui/ActionButton";
import { CreditCard, DollarSign, TrendingUp, Users, Activity, AlertCircle, RefreshCw } from "lucide-react";
import { useBilling } from "@/hooks/admin/useBilling";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useToast } from "@/hooks/use-toast";

export default function BillingManagement() {
  const { billing, isLoading, error, refetch } = useBilling();
  const { toast } = useToast();

  const handleRefresh = async () => {
    toast({ title: "Refreshing revenue data..." });
    await refetch();
    toast({ title: "Revenue data updated", variant: "default" });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading billing analytics...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-muted-foreground">Failed to load billing data</p>
          <ActionButton onClick={handleRefresh} icon={RefreshCw}>Retry</ActionButton>
        </div>
      </AdminLayout>
    );
  }

  const metrics = billing?.metrics;
  const chartData = billing?.chart_data || [];

  const stats = [
    { 
      title: "Monthly Recurring Revenue", 
      value: `$${metrics?.mrr?.toLocaleString() || 0}`, 
      icon: DollarSign,
      trend: `+${metrics?.mrr_growth || 0}%`
    },
    { 
      title: "Active Subscribers", 
      value: metrics?.active_subscribers?.toLocaleString() || "0", 
      icon: Users,
      trend: `+${metrics?.subscriber_growth || 0}%`
    },
    { 
      title: "Total API Calls", 
      value: metrics?.total_api_calls?.toLocaleString() || "0", 
      icon: Activity, 
      trend: `+${metrics?.api_growth || 0}%` 
    },
    {
      title: "Churn Rate",
      value: `${metrics?.churn_rate || 0}%`,
      icon: TrendingUp,
      trend: metrics?.churn_rate && metrics.churn_rate < 5 ? "Healthy" : "Monitor"
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Revenue Analytics</h1>
            <p className="text-muted-foreground mt-1">Real-time billing and subscription metrics</p>
          </div>
          <ActionButton icon={RefreshCw} onClick={handleRefresh}>Refresh Data</ActionButton>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        <Card className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue & Subscriber Growth</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                  name="Revenue ($)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="subscribers" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-2))' }}
                  name="Subscribers"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass-panel p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Key Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Average Revenue per User</span>
                <span className="font-bold text-primary">
                  ${metrics?.active_subscribers ? Math.round(metrics.mrr / metrics.active_subscribers) : 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Subscriber Growth Rate</span>
                <span className="font-bold text-green-400">+{metrics?.subscriber_growth || 0}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Churn Rate</span>
                <span className={`font-bold ${(metrics?.churn_rate || 0) < 5 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {metrics?.churn_rate || 0}%
                </span>
              </div>
            </div>
          </Card>

          <Card className="glass-panel p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              API Usage
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Total API Calls</span>
                <span className="font-bold text-primary">
                  {metrics?.total_api_calls?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">API Growth</span>
                <span className="font-bold text-green-400">+{metrics?.api_growth || 0}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Avg Calls per Subscriber</span>
                <span className="font-bold text-primary">
                  {metrics?.active_subscribers ? Math.round(metrics.total_api_calls / metrics.active_subscribers) : 0}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
