/**
 * Cascade v4.0.0 - Sentience Hub Dashboard
 * Central control panel for all v4.0 intelligence features
 */

import { Brain, Shield, Lightbulb, Heart, AlertTriangle, MessageSquare, Activity, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BrainPasscode } from "@/components/BrainPasscode";
import { toast } from "sonner";
import { useState } from "react";

export default function SentienceHub() {
  const navigate = useNavigate();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: sensoryEvents } = useQuery({
    queryKey: ['sensory-events'],
    queryFn: async () => {
      const { data } = await supabase
        .from('brain_sensory_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      return (data || []) as any[];
    },
    refetchInterval: 10000
  });

  const { data: causalTraces } = useQuery({
    queryKey: ['causal-traces'],
    queryFn: async () => {
      const { data } = await supabase
        .from('causal_traces')
        .select('*')
        .order('confidence', { ascending: false })
        .limit(5);
      return (data || []) as any[];
    }
  });

  const { data: ethicalApprovals } = useQuery({
    queryKey: ['ethical-approvals'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ethical_approvals')
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });
      return (data || []) as any[];
    }
  });

  const { data: dreamSessions } = useQuery({
    queryKey: ['dream-sessions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('dream_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      return (data || []) as any[];
    }
  });

  const { data: resilienceIssues } = useQuery({
    queryKey: ['resilience-ledger'],
    queryFn: async () => {
      const { data } = await supabase
        .from('resilience_ledger')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      return (data || []) as any[];
    }
  });

  const anomalyCount = sensoryEvents?.filter(e => (e.anomaly_score || 0) > 0.7).length || 0;

  const handleDreamApprove = async (dreamId: string) => {
    setProcessingId(dreamId);
    try {
      const { error } = await supabase
        .from('dream_sessions')
        .update({ 
          approved: true,
          approved_at: new Date().toISOString()
        })
        .eq('id', dreamId);

      if (error) throw error;
      
      toast.success("Dream session approved");
      // Refetch data
      await Promise.all([
        supabase.from('dream_sessions').select('*').order('created_at', { ascending: false }).limit(5)
      ]);
    } catch (error: any) {
      toast.error("Failed to approve: " + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDreamIgnore = async (dreamId: string) => {
    setProcessingId(dreamId);
    try {
      const { error } = await supabase
        .from('dream_sessions')
        .update({ 
          ignored: true,
          ignored_at: new Date().toISOString()
        })
        .eq('id', dreamId);

      if (error) throw error;
      
      toast.success("Dream session ignored");
    } catch (error: any) {
      toast.error("Failed to ignore: " + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleEthicalApproval = async (approvalId: string, approved: boolean) => {
    setProcessingId(approvalId);
    try {
      const { error } = await supabase
        .from('ethical_approvals')
        .update({ 
          approval_status: approved ? 'approved' : 'rejected',
          admin_decision_at: new Date().toISOString()
        })
        .eq('id', approvalId);

      if (error) throw error;
      
      toast.success(`Proposal ${approved ? 'approved' : 'rejected'}`);
    } catch (error: any) {
      toast.error("Failed to update: " + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <BrainPasscode>
      <div className="space-y-6 animate-fade-in p-4">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/nexus-brain')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Brain
            </Button>
            <h1 className="text-3xl font-bold glow-text">Sentience Hub v4.0</h1>
            <p className="text-muted-foreground">Advanced intelligence, reasoning, and ethical controls</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Sensory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sensoryEvents?.length || 0}</div>
              <p className="text-xs text-muted-foreground">{anomalyCount} anomalies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-500" />
                Causal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{causalTraces?.length || 0}</div>
              <p className="text-xs text-muted-foreground">hypotheses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">corrections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                Ethics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ethicalApprovals?.length || 0}</div>
              <p className="text-xs text-muted-foreground">pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                Dreams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dreamSessions?.length || 0}</div>
              <p className="text-xs text-muted-foreground">to review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Resilience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resilienceIssues?.length || 0}</div>
              <p className="text-xs text-muted-foreground">issues</p>
            </CardContent>
          </Card>
        </div>

        {/* Ethical Approvals - Highest Priority */}
        {ethicalApprovals && ethicalApprovals.length > 0 && (
          <Card className="border-amber-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                Pending Ethical Approvals
              </CardTitle>
              <CardDescription>Gray-area proposals requiring admin decision</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ethicalApprovals.map((approval) => (
                  <div key={approval.id} className="p-4 border rounded-lg bg-amber-500/5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <Badge variant="secondary" className="mb-2">{approval.risk_level}</Badge>
                        <p className="text-sm">{approval.proposal_text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Flagged: {Array.isArray(approval.flagged_reasons) 
                            ? approval.flagged_reasons.map((r: any) => r.policy).join(', ')
                            : 'Unknown'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleEthicalApproval(approval.id, true)}
                          disabled={processingId === approval.id}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleEthicalApproval(approval.id, false)}
                          disabled={processingId === approval.id}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Causal Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Causal Reasoning Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {causalTraces?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No causal traces yet</p>
              ) : (
                causalTraces?.map((trace) => (
                  <div key={trace.id} className="p-3 border rounded-lg bg-card">
                    <p className="font-medium text-sm">{trace.hypothesis}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant={trace.confidence > 0.7 ? 'default' : 'secondary'}>
                        {(trace.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                      <span className="text-xs text-muted-foreground">{trace.validation_status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dream Sessions Review */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Creative Dream Sessions
            </CardTitle>
            <CardDescription>Review experimental thinking outputs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dreamSessions?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No dream sessions to review</p>
              ) : (
                dreamSessions?.map((dream) => (
                  <div key={dream.id} className="p-4 border rounded-lg bg-card">
                    <p className="text-sm font-medium mb-2">{dream.seed_prompt}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {dream.tags?.map((tag: string) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Cost: ${Number(dream.budget_used_usd || 0).toFixed(4)}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleDreamApprove(dream.id)}
                        disabled={processingId === dream.id}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => navigate(`/cascade-dreams?view=${dream.id}`)}
                      >
                        View Full
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDreamIgnore(dream.id)}
                        disabled={processingId === dream.id}
                      >
                        Ignore
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resilience Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Resilience & Auto-Healing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resilienceIssues?.length === 0 ? (
                <p className="text-sm text-success">All systems healthy</p>
              ) : (
                resilienceIssues?.map((issue) => (
                  <div key={issue.id} className="p-3 border rounded-lg bg-card text-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-medium">{issue.event_type}</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {issue.auto_fix_applied ? '✅ Auto-fixed' : '⏳ Awaiting fix'}
                        </p>
                      </div>
                      {issue.fix_confidence && (
                        <Badge variant="outline">
                          {(issue.fix_confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </BrainPasscode>
  );
}
