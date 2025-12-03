import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/ui/StatCard";
import { DataTable } from "@/components/admin/ui/DataTable";
import { Activity, Database, Zap, Server } from "lucide-react";
import { useDiagnostics } from "@/hooks/admin/useDiagnostics";
import { Badge } from "@/components/ui/badge";

export default function DiagnosticsConsole() {
  const { health, isLoading } = useDiagnostics();

  const healthyCount = health.filter((h) => h.status === "healthy").length;
  const avgLatency = health.length > 0
    ? Math.round(health.reduce((sum, h) => sum + (h.latency_ms > 0 ? h.latency_ms : 0), 0) / health.length)
    : 0;

  const stats = [
    { title: "System Health", value: `${healthyCount}/${health.length}`, icon: Activity },
    { title: "Avg Latency", value: `${avgLatency}ms`, icon: Zap },
    { title: "Uptime", value: "99.9%", icon: Server },
  ];

  const columns = [
    { key: "service", label: "Service" },
    {
      key: "status",
      label: "Status",
      render: (val: string) => {
        const variants: Record<string, string> = {
          healthy: "bg-green-500/20 text-green-500",
          degraded: "bg-yellow-500/20 text-yellow-500",
          down: "bg-red-500/20 text-red-500",
        };
        return <Badge className={variants[val]}>{val.toUpperCase()}</Badge>;
      },
    },
    {
      key: "latency_ms",
      label: "Latency",
      render: (val: number) => (val > 0 ? `${val}ms` : "N/A"),
    },
    {
      key: "uptime_percent",
      label: "Uptime",
      render: (val: number) => `${val}%`,
    },
    {
      key: "last_check",
      label: "Last Check",
      render: (val: string) => new Date(val).toLocaleTimeString(),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Diagnostics Console</h1>
          <p className="text-muted-foreground mt-1">Monitor system health and performance</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        <div className="glass-panel p-6">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <DataTable data={health} columns={columns} />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
