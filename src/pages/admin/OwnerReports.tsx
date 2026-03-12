/**
 * Owner Reports — Admin page for viewing DECODE Mode B reports
 * Governor/Admin access only
 */

/** Sanitize report HTML — strip script tags and event handlers */
function sanitizeReportHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript\s*:/gi, '');
}

import { useState } from "react";
import { FullBackupButton } from "@/components/admin/FullBackupButton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Brain,
  Shield,
  Mail,
  MailCheck,
  Download,
  RefreshCw,
  ChevronLeft,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Navigate, Link } from "react-router-dom";

interface OwnerReport {
  id: string;
  status: string;
  subject: string;
  full_html: string;
  full_plaintext: string;
  metrics: any;
  report_window_start: string;
  report_window_end: string;
  generation_time_ms: number;
  system_status: string;
  version: string;
  created_at: string;
}

const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  sent: MailCheck,
  generated: Clock,
  send_failed: AlertTriangle,
};

const STATUS_COLOR: Record<string, string> = {
  sent: "text-green-400",
  generated: "text-yellow-400",
  send_failed: "text-red-400",
};

const SYSTEM_COLOR: Record<string, string> = {
  ONLINE: "bg-green-500/20 text-green-400 border-green-500/30",
  DEGRADED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  CRITICAL: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function OwnerReports() {
  const { user, loading: authLoading } = useAuth();
  const { isGovernor, loading: roleLoading } = useUserRole();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<OwnerReport | null>(null);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["owner-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("owner_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as OwnerReport[];
    },
    enabled: !!user,
  });

  const resendMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const report = reports.find((r) => r.id === reportId);
      if (!report) throw new Error("Report not found");

      const { error } = await supabase.functions.invoke("pf-owner-report", {
        body: { resend_id: reportId },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Report resend triggered");
      queryClient.invalidateQueries({ queryKey: ["owner-reports"] });
    },
    onError: () => toast.error("Resend failed"),
  });

  const exportMarkdown = (report: OwnerReport) => {
    const blob = new Blob([report.full_plaintext], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `owner-report-${report.created_at.slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  };

  if (authLoading || roleLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (!isGovernor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-sm">
          <CardContent className="py-8 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-semibold mb-2">Governor Access Required</h2>
            <p className="text-sm text-muted-foreground">Owner Reports are restricted to Governors.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/os">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Brain className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-lg font-semibold">Owner Reports</h1>
            <p className="text-xs text-muted-foreground">DECODE Mode B — 3-Hour Intelligence Cycle</p>
          </div>
          <Badge variant="outline" className="ml-auto text-[10px]">
            {reports.length} report{reports.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        {/* Report List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading reports...</div>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Brain className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No reports generated yet.</p>
              <p className="text-xs text-muted-foreground mt-1">First report will appear after the 3-hour cycle runs.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {reports.map((report) => {
              const StatusIcon = STATUS_ICON[report.status] || Clock;
              const statusColor = STATUS_COLOR[report.status] || "text-muted-foreground";
              const sysColor = SYSTEM_COLOR[report.system_status] || SYSTEM_COLOR.ONLINE;

              return (
                <Card
                  key={report.id}
                  className="cursor-pointer hover:bg-accent/30 hover:border-primary/15 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300"
                  onClick={() => setSelectedReport(report)}
                >
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <StatusIcon className={`h-4 w-4 shrink-0 ${statusColor}`} />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{formatTime(report.created_at)}</p>
                      <p className="text-[11px] text-muted-foreground truncate font-mono tabular-nums">
                        {report.metrics?.system?.ai_calls_3h || 0} AI calls ·{" "}
                        {report.metrics?.learning?.total_events_3h || 0} CLM ·{" "}
                        {report.metrics?.security?.events_3h || 0} defense
                      </p>
                    </div>

                    <Badge variant="outline" className={`text-[10px] shrink-0 ${sysColor}`}>
                      {report.system_status}
                    </Badge>

                    <span className="text-[10px] text-muted-foreground shrink-0 font-mono tabular-nums">
                      {report.generation_time_ms}ms
                    </span>

                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(report);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          exportMarkdown(report);
                        }}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          resendMutation.mutate(report.id);
                        }}
                        disabled={resendMutation.isPending}
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${resendMutation.isPending ? "animate-spin" : ""}`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Report Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4" />
              {selectedReport && formatTime(selectedReport.created_at)}
              {selectedReport && (
                <Badge
                  variant="outline"
                  className={`text-[10px] ml-2 ${SYSTEM_COLOR[selectedReport.system_status] || ""}`}
                >
                  {selectedReport.system_status}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-80px)]">
            {selectedReport && (
              <div
                className="px-2"
                dangerouslySetInnerHTML={{ __html: sanitizeReportHtml(selectedReport.full_html) }}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
