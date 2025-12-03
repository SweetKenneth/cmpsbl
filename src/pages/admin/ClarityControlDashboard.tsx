import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/ui/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, CheckCircle, AlertCircle, Clock, Award, Zap, Key, ChevronDown, ChevronUp } from "lucide-react";
import { ActionButton } from "@/components/admin/ui/ActionButton";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { ClarityScanDialog } from "@/components/clarity/ClarityScanDialog";
import { ClarityAPIKeys } from "@/components/clarity/ClarityAPIKeys";
import { formatDistanceToNow } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function ClarityControlDashboard() {
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [expandedScans, setExpandedScans] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState({
    totalScans: 0,
    avgScore: 0,
    totalIssues: 0,
    complianceA: 0,
    complianceAA: 0,
    complianceAAA: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: scans } = await supabase
        .from("accessibility_scans")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (scans) {
        setRecentScans(scans);
        
        const completed = scans.filter(s => s.scan_status === "completed");
        const avgScore = completed.length > 0
          ? completed.reduce((sum, s) => sum + (s.score || 0), 0) / completed.length
          : 0;
        
        const totalIssues = completed.reduce((sum, s) => {
          return sum + (Array.isArray(s.issues) ? s.issues.length : 0);
        }, 0);

        const complianceA = completed.filter(s => s.wcag_level === "A" && s.score >= 80).length;
        const complianceAA = completed.filter(s => s.wcag_level === "AA" && s.score >= 80).length;
        const complianceAAA = completed.filter(s => s.wcag_level === "AAA" && s.score >= 80).length;

        setStats({
          totalScans: scans.length,
          avgScore: Math.round(avgScore * 10) / 10,
          totalIssues,
          complianceA,
          complianceAA,
          complianceAAA
        });
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 gradient-text">Clarity Control</h1>
            <p className="text-sm sm:text-base text-muted-foreground">WCAG accessibility scanning and compliance</p>
          </div>
          <ActionButton 
            icon={Zap} 
            variant="primary"
            onClick={() => setScanDialogOpen(true)}
          >
            New Scan
          </ActionButton>
        </div>

        <ClarityScanDialog 
          open={scanDialogOpen}
          onOpenChange={setScanDialogOpen}
          onScanComplete={loadData}
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <StatCard
            title="Scans"
            value={loading ? "..." : stats.totalScans}
            icon={Eye}
            variant="primary"
            className="animate-fade-in-up stagger-1"
          />
          
          <StatCard
            title="Avg Score"
            value={loading ? "..." : stats.avgScore.toString()}
            icon={CheckCircle}
            variant="success"
            className="animate-fade-in-up stagger-2"
          />
          
          <StatCard
            title="Issues"
            value={loading ? "..." : stats.totalIssues}
            icon={AlertCircle}
            variant="default"
            className="animate-fade-in-up stagger-3"
          />
          
          <StatCard
            title="Compliant"
            value={loading ? "..." : stats.complianceAA}
            icon={Award}
            variant="success"
            className="animate-fade-in-up stagger-4"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="scans" className="animate-fade-in-up stagger-5">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="scans" className="flex-1 sm:flex-initial">
              <Eye className="w-4 h-4 mr-2" />
              Scans
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex-1 sm:flex-initial">
              <CheckCircle className="w-4 h-4 mr-2" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="flex-1 sm:flex-initial">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scans" className="mt-6">
            <Card className="glass-card border border-border/50 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                Recent Scans
              </h3>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading scans...</div>
              ) : recentScans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No scans yet. Click "New Scan" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentScans.map((scan) => {
                    const issueCount = Array.isArray(scan.issues) ? scan.issues.length : 0;
                    const isExpanded = expandedScans[scan.id];
                    return (
                      <Collapsible key={scan.id} open={isExpanded} onOpenChange={(open) => setExpandedScans(prev => ({ ...prev, [scan.id]: open }))}>
                        <div className="rounded-lg border border-border/30 overflow-hidden">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 hover:bg-muted/30 transition-colors gap-3">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                scan.scan_status === "processing" ? "bg-blue-500/20 text-blue-500 animate-pulse" :
                                scan.score >= 90 ? "bg-green-500/20 text-green-500" :
                                scan.score >= 70 ? "bg-yellow-500/20 text-yellow-500" :
                                "bg-red-500/20 text-red-500"
                              }`}>
                                {scan.scan_status === "processing" ? (
                                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <span className="font-bold text-sm sm:text-base">{scan.score || 0}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm sm:text-base truncate">{scan.url}</div>
                                <div className="text-xs sm:text-sm text-muted-foreground">
                                  {scan.scan_status === "processing" ? "Scanning..." : `${issueCount} issues found`}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 justify-between sm:justify-end">
                              <Badge variant={scan.scan_status === "completed" ? "default" : "secondary"} className="text-xs">
                                {scan.scan_status}
                              </Badge>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })}
                              </span>
                              {scan.scan_status === "completed" && issueCount > 0 && (
                                <CollapsibleTrigger asChild>
                                  <button className="p-1 hover:bg-muted rounded">
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </button>
                                </CollapsibleTrigger>
                              )}
                            </div>
                          </div>
                          <CollapsibleContent>
                            {scan.issues && Array.isArray(scan.issues) && scan.issues.length > 0 && (
                              <div className="border-t border-border/30 p-4 bg-muted/20">
                                <h4 className="font-semibold text-sm mb-3">Issues Found</h4>
                                <div className="space-y-2">
                                  {scan.issues.map((issue: any, idx: number) => (
                                    <div key={idx} className="flex items-start gap-3 p-2 rounded bg-background/50 text-xs">
                                      <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                                        issue.severity === "critical" ? "bg-red-500" :
                                        issue.severity === "warning" ? "bg-yellow-500" :
                                        "bg-blue-500"
                                      }`} />
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium">{issue.issue || issue.type}</div>
                                        {issue.description && (
                                          <div className="text-muted-foreground mt-1">{issue.description}</div>
                                        )}
                                        {issue.wcag_criterion && (
                                          <Badge variant="outline" className="mt-2 text-xs">
                                            WCAG {issue.wcag_criterion}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  })}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="mt-6">
            <Card className="glass-card border border-border/50 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4">WCAG 2.2 Compliance Distribution</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-2xl sm:text-3xl font-bold text-green-500">Level A</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-2">{stats.complianceA} sites compliant</div>
                  <Progress value={(stats.complianceA / Math.max(stats.totalScans, 1)) * 100} className="mt-3" />
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-500">Level AA</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-2">{stats.complianceAA} sites compliant</div>
                  <Progress value={(stats.complianceAA / Math.max(stats.totalScans, 1)) * 100} className="mt-3" />
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-500">Level AAA</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-2">{stats.complianceAAA} sites compliant</div>
                  <Progress value={(stats.complianceAAA / Math.max(stats.totalScans, 1)) * 100} className="mt-3" />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="api-keys" className="mt-6">
            <ClarityAPIKeys />
          </TabsContent>
        </Tabs>

      </div>
    </AdminLayout>
  );
}
