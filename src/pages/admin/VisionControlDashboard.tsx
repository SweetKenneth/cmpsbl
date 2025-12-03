import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/ui/StatCard";
import { MetricChart } from "@/components/admin/ui/MetricChart";
import { useCascadeStatus } from "@/hooks/admin/useCascadeStatus";
import { Brain, Zap, Database, Activity, AlertCircle, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ActionButton } from "@/components/admin/ui/ActionButton";
import { toast } from "sonner";

export default function VisionControlDashboard() {
  const { data: cascade, isLoading } = useCascadeStatus();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 gradient-text">Cascade Intelligence Control</h1>
            <p className="text-muted-foreground">Neural orchestration and learning pipeline</p>
          </div>
          <ActionButton 
            icon={Zap} 
            variant="primary"
            onClick={() => {
              toast.info("Syncing Cascade Brain - This may take a moment...");
            }}
          >
            Sync Cascade Brain
          </ActionButton>
        </div>

        {/* Neural Health Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Neural Health"
            value={`${cascade?.neuralHealth || 0}%`}
            icon={Brain}
            variant="primary"
            loading={isLoading}
            className="animate-fade-in-up stagger-1"
          >
            <Progress value={cascade?.neuralHealth || 0} className="mt-2" />
          </StatCard>
          
          <StatCard
            title="Hot Memory"
            value={cascade?.memoryHot || 0}
            change={{ value: "+8", trend: "up" }}
            icon={Database}
            variant="success"
            loading={isLoading}
            className="animate-fade-in-up stagger-2"
          />
          
          <StatCard
            title="Learning Rate"
            value={`${((cascade?.learningRate || 0) * 100).toFixed(1)}%`}
            icon={Activity}
            variant="default"
            loading={isLoading}
            className="animate-fade-in-up stagger-3"
          />
          
          <StatCard
            title="Pending Decisions"
            value={cascade?.decisionsPending || 0}
            icon={AlertCircle}
            variant="warning"
            loading={isLoading}
            className="animate-fade-in-up stagger-4"
          />
        </div>

        {/* Dream Cycle Status */}
        <Card className="glass-card border border-border/50 p-6 animate-fade-in-up stagger-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Dream Cycle Status
                <Badge variant={cascade?.dreamCycleActive ? "default" : "secondary"}>
                  {cascade?.dreamCycleActive ? "Active" : "Idle"}
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Last dream cycle: {cascade?.lastDreamCycle || "Never"}
              </p>
            </div>
            <ActionButton 
              variant="secondary"
              onClick={() => {
                toast.info("Dream cycle initiated - Brain will process overnight...");
              }}
            >
              Initiate Dream Cycle
            </ActionButton>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-2xl font-bold text-primary">{cascade?.memoryHot || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Hot Memories</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold">{cascade?.memoryCold || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Cold Storage</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-2xl font-bold text-green-500">{cascade?.insightsGenerated || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Insights</div>
            </div>
          </div>
        </Card>

        {/* Module Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card border border-border/50 p-6 animate-fade-in-up stagger-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Module Orchestration
            </h3>
            
            <div className="space-y-3">
              {(cascade?.modules || []).map((module, index) => (
                <div 
                  key={module.name} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      module.status === "active" ? "bg-green-500 animate-pulse-glow" :
                      module.status === "idle" ? "bg-yellow-500" :
                      "bg-red-500"
                    }`} />
                    <span className="font-medium">{module.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{module.lastSync}</span>
                    <Badge variant={module.status === "active" ? "default" : "secondary"} className="text-xs">
                      {module.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="glass-card border border-border/50 p-6 animate-fade-in-up stagger-7">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Decision Queue
            </h3>
            
            {cascade?.decisionsPending === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500 animate-pulse" />
                <p className="text-sm">No pending decisions</p>
                <p className="text-xs mt-1">Cascade is running autonomously</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[1, 2, 3].map((_, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium">Optimize API routing</span>
                      <Badge className="text-xs bg-yellow-500/20 text-yellow-500">Pending</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Proposed change to reduce latency by 15%
                    </p>
                    <div className="flex gap-2 mt-3">
                      <ActionButton 
                        variant="success" 
                        className="text-xs h-8 px-3"
                        onClick={() => toast.success("Decision approved")}
                      >
                        Approve
                      </ActionButton>
                      <ActionButton 
                        variant="ghost" 
                        className="text-xs h-8 px-3"
                        onClick={() => toast.info("Decision rejected")}
                      >
                        Reject
                      </ActionButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Learning Events */}
        <Card className="glass-card border border-border/50 p-6 animate-fade-in-up stagger-8">
          <h3 className="text-lg font-semibold mb-4">Recent Learning Events</h3>
          <div className="space-y-2">
            {[
              { event: "Pattern recognized", detail: "High correlation between user signup and feature usage", time: "5 min ago" },
              { event: "Model updated", detail: "Threat detection accuracy improved to 98.5%", time: "1 hour ago" },
              { event: "Memory compressed", detail: "Moved 45 hot memories to cold storage", time: "3 hours ago" },
              { event: "Insight generated", detail: "Identified potential cost optimization opportunity", time: "5 hours ago" },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 animate-pulse-glow" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{item.event}</span>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
