import { useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/ui/StatCard";
import { MetricChart } from "@/components/admin/ui/MetricChart";
import { useThreatMetrics } from "@/hooks/admin/useThreatMetrics";
import { Shield, AlertTriangle, Ban, Eye, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ActionButton } from "@/components/admin/ui/ActionButton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export default function DefenseControlDashboard() {
  const { data: threats, isLoading } = useThreatMetrics();
  const queryClient = useQueryClient();

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('security-events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pf_security_events'
        },
        () => {
          // Refetch when new events arrive
          queryClient.invalidateQueries({ queryKey: ['threat-metrics'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const getThreatColor = (level: string) => {
    switch (level) {
      case "critical": return "hsl(0, 84%, 60%)";
      case "high": return "hsl(25, 95%, 53%)";
      case "medium": return "hsl(48, 96%, 53%)";
      default: return "hsl(142, 76%, 46%)";
    }
  };

  const ipReputationData = [
    { name: "Trusted", value: threats?.ipReputation.trusted || 0, color: "hsl(142, 76%, 46%)" },
    { name: "Suspicious", value: threats?.ipReputation.suspicious || 0, color: "hsl(48, 96%, 53%)" },
    { name: "Blocked", value: threats?.ipReputation.blocked || 0, color: "hsl(0, 84%, 60%)" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 gradient-text">Defense Shield Control</h1>
            <p className="text-muted-foreground">Real-time threat monitoring and protection</p>
          </div>
          <ActionButton 
            icon={Shield} 
            variant="primary"
            onClick={() => {
              toast.info("Full security scan initiated - This will take several minutes...");
            }}
          >
            Run Full Scan
          </ActionButton>
        </div>

        {/* Threat Level Indicator */}
        <Card className={`glass-card border-2 p-6 animate-fade-in-up ${
          threats?.threatLevel === "critical" ? "border-red-500/50 bg-red-500/5" :
          threats?.threatLevel === "high" ? "border-orange-500/50 bg-orange-500/5" :
          threats?.threatLevel === "medium" ? "border-yellow-500/50 bg-yellow-500/5" :
          "border-green-500/50 bg-green-500/5"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                threats?.threatLevel === "critical" ? "bg-red-500/20 text-red-500" :
                threats?.threatLevel === "high" ? "bg-orange-500/20 text-orange-500" :
                threats?.threatLevel === "medium" ? "bg-yellow-500/20 text-yellow-500" :
                "bg-green-500/20 text-green-500"
              } animate-pulse-glow`}>
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold capitalize">{threats?.threatLevel || "Low"} Threat Level</h3>
                <p className="text-muted-foreground">Based on real-time analysis of {threats?.eventsToday || 0} events today</p>
              </div>
            </div>
            <Badge variant={threats?.threatLevel === "low" ? "default" : "destructive"} className="text-lg px-4 py-2">
              {threats?.eventsBlocked || 0} Blocked
            </Badge>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Events Today"
            value={threats?.eventsToday || 0}
            icon={Activity}
            variant="default"
            loading={isLoading}
            className="animate-fade-in-up stagger-1"
          />
          
          <StatCard
            title="Threats Blocked"
            value={threats?.eventsBlocked || 0}
            icon={Ban}
            variant="danger"
            loading={isLoading}
            className="animate-fade-in-up stagger-2"
          />
          
          <StatCard
            title="Monitored IPs"
            value={(threats?.ipReputation.trusted || 0) + (threats?.ipReputation.suspicious || 0) + (threats?.ipReputation.blocked || 0)}
            icon={Eye}
            variant="default"
            loading={isLoading}
            className="animate-fade-in-up stagger-3"
          />
          
          <StatCard
            title="Active Rules"
            value={47}
            icon={Shield}
            variant="success"
            loading={isLoading}
            className="animate-fade-in-up stagger-4"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MetricChart
            title="Top Threat Types"
            subtitle="Most common attack patterns"
            icon={AlertTriangle}
            className="animate-fade-in-up stagger-5"
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={threats?.topThreats || []}>
                <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {threats?.topThreats.map((entry, index) => (
                    <Cell key={index} fill={getThreatColor(entry.severity)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </MetricChart>

          <MetricChart
            title="IP Reputation"
            subtitle="Distribution of IP address trust levels"
            icon={Eye}
            className="animate-fade-in-up stagger-6"
          >
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={ipReputationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ipReputationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </MetricChart>
        </div>

        {/* Recent Events */}
        <Card className="glass-card border border-border/50 p-6 animate-fade-in-up stagger-7">
          <h3 className="text-lg font-semibold mb-4">Recent Detection Events</h3>
          <div className="space-y-2">
            {threats?.recentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <div>
                    <span className="font-medium text-sm">{event.type}</span>
                    <p className="text-xs text-muted-foreground">IP: {event.ip}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={event.action === "Blocked" ? "destructive" : "secondary"}>
                    {event.action}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
