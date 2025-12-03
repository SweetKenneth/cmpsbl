import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/ui/StatCard";
import { DataTable } from "@/components/admin/ui/DataTable";
import { ActionButton } from "@/components/admin/ui/ActionButton";
import { Rocket, GitBranch, CheckCircle, XCircle } from "lucide-react";
import { useDeployment } from "@/hooks/admin/useDeployment";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function DeploymentManager() {
  const { deployments, isLoading } = useDeployment();

  const successCount = deployments.filter((d) => d.status === "success").length;
  const failedCount = deployments.filter((d) => d.status === "failed").length;

  const stats = [
    { title: "Total Deployments", value: deployments.length, icon: Rocket },
    { title: "Successful", value: successCount, icon: CheckCircle },
    { title: "Failed", value: failedCount, icon: XCircle },
  ];

  const columns = [
    {
      key: "status",
      label: "Status",
      render: (val: string) => {
        const variants: Record<string, string> = {
          success: "bg-green-500/20 text-green-500",
          failed: "bg-red-500/20 text-red-500",
          building: "bg-yellow-500/20 text-yellow-500",
          pending: "bg-blue-500/20 text-blue-500",
        };
        return <Badge className={variants[val]}>{val.toUpperCase()}</Badge>;
      },
    },
    { key: "environment", label: "Environment" },
    {
      key: "commit_hash",
      label: "Commit",
      render: (val: string) => <code className="text-xs">{val}</code>,
    },
    {
      key: "deployed_at",
      label: "Deployed",
      render: (val: string) => new Date(val).toLocaleString(),
    },
    { key: "deployed_by", label: "By" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Deployment Manager</h1>
            <p className="text-muted-foreground mt-1">Track and manage deployments</p>
          </div>
          <ActionButton 
            icon={Rocket}
            onClick={() => {
              toast.info("Manual deployment triggered - Processing...");
            }}
          >
            Deploy Now
          </ActionButton>
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
            <DataTable data={deployments} columns={columns} />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
