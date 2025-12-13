import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/ui/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, GitBranch, Zap, Clock, CheckCircle, AlertCircle, Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ActionButton } from "@/components/admin/ui/ActionButton";
import { toast } from "sonner";
import { useProjects } from "@/hooks/admin/useProjects";
import { formatDistanceToNow } from "date-fns";

export default function ProjectsControlDashboard() {
  const { data: projectData, isLoading } = useProjects();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 gradient-text">Ecosystem Projects</h1>
            <p className="text-muted-foreground">Live component monitoring from orchestration</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Projects"
            value={projectData?.stats.active || 0}
            icon={Briefcase}
            variant="primary"
            loading={isLoading}
            className="animate-fade-in-up stagger-1"
          />
          
          <StatCard
            title="Events (7d)"
            value={projectData?.stats.total_events || 0}
            icon={GitBranch}
            variant="success"
            loading={isLoading}
            className="animate-fade-in-up stagger-2"
          />
          
          <StatCard
            title="Avg Health"
            value={`${projectData?.stats.avg_health || 100}%`}
            icon={CheckCircle}
            variant="success"
            loading={isLoading}
            className="animate-fade-in-up stagger-3"
          />
          
          <StatCard
            title="Components"
            value={projectData?.projects.length || 6}
            icon={Zap}
            variant="default"
            loading={isLoading}
            className="animate-fade-in-up stagger-4"
          />
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projectData?.projects.map((project, index) => (
            <Card 
              key={project.id} 
              className="glass-card border border-border/50 p-6 hover:shadow-lg transition-all duration-300 animate-fade-in-up group"
              style={{ animationDelay: `${(index + 5) * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{project.description}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {project.events_count > 0 
                      ? `${project.events_count} events • Last activity: ${formatDistanceToNow(new Date(project.last_activity), { addSuffix: true })}`
                      : 'No recent activity'}
                  </p>
                </div>
                <Badge 
                  className={
                    project.status === "active" ? "bg-green-500/20 text-green-500" :
                    "bg-muted text-muted-foreground"
                  }
                >
                  {project.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Success Rate (7d)</span>
                    <span className="font-medium">{project.health_score}%</span>
                  </div>
                  <Progress value={project.health_score} className={project.health_score < 70 ? "[&>div]:bg-yellow-500" : ""} />
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Card>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
}
