import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/ui/StatCard";
import { useSystemMetrics } from "@/hooks/admin/useSystemMetrics";
import { useInsights } from "@/hooks/admin/useInsights";
import { Users, DollarSign, Shield, Eye, Brain, Moon, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DecodeActivityFeed } from "@/components/admin/DecodeActivityFeed";
import { DecodeOperativeControls } from "@/components/admin/DecodeOperativeControls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
export default function OverviewDashboard() {
  const { data: metrics, isLoading } = useSystemMetrics();
  const { data: insights, isLoading: insightsLoading } = useInsights();

  const quickLinks = [
    { 
      label: "Defense", 
      path: "/admin/defense", 
      icon: Shield, 
      color: "text-red-500",
      bg: "bg-red-500/10",
      description: "Monitor threats & security"
    },
    { 
      label: "Clarity", 
      path: "/clarity/dashboard", 
      icon: Eye, 
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      description: "Accessibility scanning"
    },
    { 
      label: "Dream Eater", 
      path: "/feed-dream-eater", 
      icon: Moon, 
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      description: "Feed the entity"
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2 gradient-text">Command Center</h1>
          <p className="text-muted-foreground">Real-time system overview</p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Card className={`glass-card border border-border/50 p-4 hover:border-primary/50 transition-all group cursor-pointer ${link.bg}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${link.bg} flex items-center justify-center`}>
                      <link.icon className={`w-5 h-5 ${link.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{link.label}</h3>
                      <p className="text-xs text-muted-foreground">{link.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Users"
            value={metrics?.totalUsers || 0}
            icon={Users}
            variant="primary"
            loading={isLoading}
          />
          <StatCard
            title="MRR"
            value={`$${metrics?.totalRevenue.toLocaleString() || 0}`}
            change={{ value: metrics?.revenueChange || "+0%", trend: "up" }}
            icon={DollarSign}
            variant="success"
            loading={isLoading}
          />
          <StatCard
            title="Threats Blocked"
            value={metrics?.threatsBlocked || 0}
            icon={Shield}
            variant="danger"
            loading={isLoading}
          />
          <StatCard
            title="System Health"
            value={`${metrics?.systemHealth || 0}%`}
            icon={Brain}
            variant="default"
            loading={isLoading}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Services */}
          <Card className="glass-card border border-border/50 p-6">
            <h3 className="text-lg font-semibold mb-4">Service Status</h3>
            <div className="grid grid-cols-3 gap-4">
              {metrics?.services.map((service) => (
                <div key={service.name} className="text-center">
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    service.status === "online" ? "bg-green-500/20" :
                    service.status === "degraded" ? "bg-yellow-500/20" :
                    "bg-red-500/20"
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      service.status === "online" ? "bg-green-500" :
                      service.status === "degraded" ? "bg-yellow-500" :
                      "bg-red-500"
                    }`} />
                  </div>
                  <p className="text-xs font-medium truncate">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.uptime}%</p>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Insights */}
          <Card className="glass-card border border-border/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">AI Insights</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Today's Learning</p>
                <p className="text-sm">{insightsLoading ? "Analyzing..." : insights?.learned_today}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Pattern Detected</p>
                <p className="text-sm">{insightsLoading ? "Detecting..." : insights?.emerging_pattern}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Recommendation</p>
                <p className="text-sm">{insightsLoading ? "Computing..." : insights?.recommended_action}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Ecosystem Health */}
        {insights?.ecosystem_health && (
          <Card className="glass-card border border-border/50 p-6">
            <h3 className="text-lg font-semibold mb-4">Ecosystem Health</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
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
                  <div className="text-xl font-bold mt-2">{health.score}%</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Decode Operative Controls */}
        <DecodeOperativeControls />

        {/* Activity Feed */}
        <DecodeActivityFeed />
      </div>
    </AdminLayout>
  );
}
