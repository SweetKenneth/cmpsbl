import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/ui/StatCard";
import { useSystemMetrics } from "@/hooks/admin/useSystemMetrics";
import { useInsights } from "@/hooks/admin/useInsights";
import { Users, DollarSign, Shield, Scan, Brain, TrendingUp, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CascadeActivityFeed } from "@/components/admin/CascadeActivityFeed";
import { Badge } from "@/components/ui/badge";

export default function OverviewDashboard() {
  const { data: metrics, isLoading } = useSystemMetrics();
  const { data: insights, isLoading: insightsLoading } = useInsights();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Hero Stats */}
        <div>
          <h1 className="text-3xl font-bold mb-2 gradient-text">Cascade Insight Dashboard</h1>
          <p className="text-muted-foreground">Live intelligence from PromptFluid's AI orchestration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={metrics?.totalUsers || 0}
            icon={Users}
            variant="primary"
            loading={isLoading}
            className="animate-fade-in-up stagger-1"
          />
          
          <StatCard
            title="Revenue (MRR)"
            value={`$${metrics?.totalRevenue.toLocaleString() || 0}`}
            change={{ value: metrics?.revenueChange || "+0%", trend: "up" }}
            icon={DollarSign}
            variant="success"
            loading={isLoading}
            className="animate-fade-in-up stagger-2"
          />
          
          <StatCard
            title="Threats Blocked"
            value={metrics?.threatsBlocked || 0}
            change={{ value: metrics?.threatsChange || "0%", trend: "down" }}
            icon={Shield}
            variant="danger"
            loading={isLoading}
            className="animate-fade-in-up stagger-3"
          />
          
          <StatCard
            title="Scans Complete"
            value={metrics?.scansCompleted || 0}
            change={{ value: metrics?.scansChange || "+0%", trend: "up" }}
            icon={Scan}
            variant="default"
            loading={isLoading}
            className="animate-fade-in-up stagger-4"
          />
        </div>


        {/* System Health */}
        <Card className="glass-card border border-border/50 p-6 animate-fade-in-up stagger-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">System Health</h3>
              <p className="text-sm text-muted-foreground">All services operational</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-500">{metrics?.systemHealth}%</div>
              <p className="text-xs text-muted-foreground">Overall uptime</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {metrics?.services.map((service, index) => (
              <div key={service.name} className="text-center animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                  service.status === "online" ? "bg-green-500/20 text-green-500" :
                  service.status === "degraded" ? "bg-yellow-500/20 text-yellow-500" :
                  "bg-red-500/20 text-red-500"
                }`}>
                  <div className="w-3 h-3 rounded-full bg-current animate-pulse-glow" />
                </div>
                <p className="text-xs font-medium">{service.name}</p>
                <p className="text-xs text-muted-foreground">{service.uptime}%</p>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass-card border border-border/50 p-6 animate-fade-in-up stagger-9">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-primary" />
              <h3 className="font-semibold">What Cascade Learned Today</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insightsLoading ? "Analyzing learning patterns..." : insights?.learned_today}
            </p>
          </Card>

          <Card className="glass-card border border-border/50 p-6 animate-fade-in-up stagger-10">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              <h3 className="font-semibold">Emerging Pattern</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insightsLoading ? "Detecting patterns..." : insights?.emerging_pattern}
            </p>
          </Card>

          <Card className="glass-card border border-border/50 p-6 animate-fade-in-up stagger-11">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              <h3 className="font-semibold">Recommended Action</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insightsLoading ? "Computing recommendations..." : insights?.recommended_action}
            </p>
          </Card>
        </div>

        {/* Ecosystem Health Grid */}
        {insights?.ecosystem_health && (
          <Card className="glass-card border border-border/50 p-6 animate-fade-in-up stagger-12">
            <h3 className="text-lg font-semibold mb-4">Ecosystem Component Health</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(insights.ecosystem_health).map(([name, health]: [string, any]) => (
                <div key={name} className="text-center">
                  <Badge 
                    className={
                      health.status === 'healthy' ? 'bg-green-500/20 text-green-500' :
                      health.status === 'degraded' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-red-500/20 text-red-500'
                    }
                  >
                    {name.toUpperCase()}
                  </Badge>
                  <div className="text-2xl font-bold mt-2">{health.score}%</div>
                  <div className="text-xs text-muted-foreground">{health.status}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="animate-fade-in-up stagger-13">
          <CascadeActivityFeed />
        </div>

      </div>
    </AdminLayout>
  );
}
