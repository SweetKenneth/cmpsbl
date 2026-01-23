/**
 * Modernizer Tab - Full Featured Self-Improvement Engine
 * Dedicated tab for substrate self-upgrade system with:
 * - Easy copy proposal IDs
 * - Working Apply/Rollback buttons
 * - Quick scan & archived function discovery
 * - Complete upgrade lifecycle management
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Zap, Clock, Shield, AlertTriangle, CheckCircle, XCircle, Copy, Check,
  RefreshCw, Play, RotateCcw, Eye, Loader2, Lock, Trash2, Archive,
  ChevronDown, ChevronRight, Sparkles, Settings, TrendingUp, Database
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UpgradePlan {
  id: string;
  created_at: string;
  mode: string;
  scope: string;
  status: string;
  risk_level: string;
  backup_id: string;
  operator_notes: string | null;
  diff_summary?: Array<{
    module: string;
    change_type: string;
    description: string;
    risk: string;
  }>;
  suggested_patches?: Array<{
    target: string;
    action: string;
    rationale: string;
  }>;
}

interface ArchivedOpportunity {
  archived_function: string;
  repurpose_for: string;
  description: string;
  value: string;
  complexity: string;
}

interface ScanResult {
  success: boolean;
  proposals: Array<{
    area: string;
    priority: string;
    description: string;
    action: string;
  }>;
  message: string;
}

interface ModernizerTabProps {
  enabled: boolean;
}

// Copy to clipboard hook with feedback
function useCopyToClipboard() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const copy = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success('Copied to clipboard', {
        description: `ID: ${text.slice(0, 8)}...`,
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }, []);
  
  return { copy, copiedId };
}

export function ModernizerTab({ enabled }: ModernizerTabProps) {
  const queryClient = useQueryClient();
  const { copy, copiedId } = useCopyToClipboard();
  const [selectedScope, setSelectedScope] = useState('all');
  const [notes, setNotes] = useState('');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  
  // Dialog states for Apply and Rollback actions
  const [applyDialog, setApplyDialog] = useState<{ open: boolean; planId: string | null }>({ open: false, planId: null });
  const [rollbackDialog, setRollbackDialog] = useState<{ open: boolean; planId: string | null; backupId: string | null }>({ open: false, planId: null, backupId: null });
  const [confirmValue, setConfirmValue] = useState('');

  // Fetch system status
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['modernizer-status'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: { module: 'modernizer', action: 'status' }
      });
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000,
    enabled,
  });

  // Fetch upgrade plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['upgrade-plans'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'list_plans' }
      });
      if (error) throw error;
      return data.plans as UpgradePlan[];
    },
    refetchInterval: 30000,
    enabled,
  });

  // Fetch archived functions
  const { data: archived, isLoading: archivedLoading } = useQuery({
    queryKey: ['modernizer-archived'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: { module: 'modernizer', action: 'archived' }
      });
      if (error) throw error;
      return data.repurposing_opportunities as ArchivedOpportunity[];
    },
    enabled: enabled && showArchived,
  });

  // Quick scan mutation
  const scanMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: { module: 'modernizer', action: 'scan' }
      });
      if (error) throw error;
      return data as ScanResult;
    },
    onSuccess: (data) => {
      if (data.proposals?.length > 0) {
        toast.info(`Found ${data.proposals.length} improvement areas`);
      } else {
        toast.success('Substrate is healthy');
      }
    },
    onError: (error) => {
      toast.error('Scan failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Generate proposal mutation
  const proposeMutation = useMutation({
    mutationFn: async ({ scope, notes }: { scope: string; notes: string }) => {
      const { data, error } = await supabase.functions.invoke('pf-substrate-upgrade', {
        body: { 
          action: 'propose',
          scope,
          notes,
          max_changes: 10,
        }
      });
      if (error) throw error;
      if (!data.success) {
        const message = data.error || data.message || 'Analysis failed';
        if (message.includes('health below threshold')) {
          throw new Error(`System health too low (${data.current_health}%). Run system.heal first.`);
        }
        if (message.includes('rate limit')) {
          throw new Error(`Daily limit reached (${data.upgrades_today}/${data.max_per_day}). Try again tomorrow.`);
        }
        if (message.includes('rollback')) {
          throw new Error('Recent rollback detected. Wait 1 hour before proposing upgrades.');
        }
        throw new Error(message);
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['upgrade-plans'] });
      const changeCount = data.plan?.diff_summaries?.length || 0;
      if (changeCount > 0) {
        toast.success('Upgrade proposal generated', {
          description: `Plan created with ${changeCount} suggested changes`,
        });
      } else {
        toast.info('Substrate is healthy', {
          description: 'No actionable improvements found',
        });
      }
      setNotes('');
    },
    onError: (error) => {
      toast.error('Analysis failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Apply plan mutation - Fixed: Uses controlled dialog instead of AlertDialog
  const applyMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { data, error } = await supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'apply_plan', plan_id: planId }
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || data.message);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['upgrade-plans'] });
      queryClient.invalidateQueries({ queryKey: ['modernizer-status'] });
      toast.success('Upgrade applied successfully', {
        description: `Health: ${data.pre_health}% → ${data.post_health}%`,
      });
      setApplyDialog({ open: false, planId: null });
      setConfirmValue('');
    },
    onError: (error) => {
      toast.error('Failed to apply upgrade', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Rollback plan mutation - Fixed: Uses controlled dialog
  const rollbackMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { data, error } = await supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'rollback_plan', plan_id: planId }
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || data.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upgrade-plans'] });
      queryClient.invalidateQueries({ queryKey: ['modernizer-status'] });
      toast.success('Rollback completed successfully');
      setRollbackDialog({ open: false, planId: null, backupId: null });
      setConfirmValue('');
    },
    onError: (error) => {
      toast.error('Rollback failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Delete/Reject plan mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ planId, reason }: { planId: string; reason?: string }) => {
      const { data, error } = await supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'delete_plan', plan_id: planId, reason }
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || data.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upgrade-plans'] });
      toast.success('Plan deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete plan', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'proposed':
        return <Badge variant="outline" className="border-amber-500/50 text-amber-400 bg-amber-500/10">Proposed</Badge>;
      case 'approved':
        return <Badge variant="outline" className="border-blue-500/50 text-blue-400 bg-blue-500/10">Approved</Badge>;
      case 'applied':
        return <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10">Applied</Badge>;
      case 'rolled_back':
        return <Badge variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10">Rolled Back</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="border-gray-500/50 text-gray-400 bg-gray-500/10">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return <Badge variant="destructive" className="text-[10px]">HIGH RISK</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-[10px]">MEDIUM</Badge>;
      case 'low':
        return <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 text-[10px]">LOW</Badge>;
      default:
        return null;
    }
  };

  if (!enabled) {
    return (
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="rounded-xl border border-dashed border-fuchsia-500/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl p-12">
          <div className="text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-lg text-muted-foreground">
              Modernizer requires Operator privileges
            </p>
          </div>
        </div>
      </main>
    );
  }

  const healthScore = status?.health?.score ?? 100;
  const isHealthy = healthScore >= 80;
  const proposalCount = scanMutation.data?.proposals?.length ?? 0;

  return (
    <main className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 border border-fuchsia-500/40 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-fuchsia-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Modernizer</h2>
            <p className="text-xs text-muted-foreground font-mono">self-improvement engine • shadow mode</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              isHealthy 
                ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                : "border-amber-500/50 text-amber-400 bg-amber-500/10"
            )}
          >
            {healthScore}% Health
          </Badge>
          <Badge variant="outline" className="border-amber-500/50 text-amber-400 bg-amber-500/10">
            <Shield className="w-3 h-3 mr-1" />
            SHADOW MODE
          </Badge>
        </div>
      </div>

      {/* Status Cards */}
      {statusLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border border-fuchsia-500/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-2 text-fuchsia-400" />
              <p className="text-2xl font-bold text-foreground">{healthScore}%</p>
              <p className="text-[10px] text-muted-foreground">System Health</p>
            </CardContent>
          </Card>
          <Card className="border border-cyan-500/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
            <CardContent className="p-4 text-center">
              <Database className="w-5 h-5 mx-auto mb-2 text-cyan-400" />
              <p className="text-2xl font-bold text-foreground">{plans?.length ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">Proposals</p>
            </CardContent>
          </Card>
          <Card className="border border-emerald-500/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-5 h-5 mx-auto mb-2 text-emerald-400" />
              <p className="text-2xl font-bold text-foreground">
                {plans?.filter(p => p.status === 'applied').length ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground">Applied</p>
            </CardContent>
          </Card>
          <Card className="border border-amber-500/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-amber-400" />
              <p className="text-2xl font-bold text-foreground">{proposalCount}</p>
              <p className="text-[10px] text-muted-foreground">Issues Found</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Actions */}
        <div className="lg:col-span-1 space-y-4">
          {/* Quick Scan */}
          <Card className="border border-fuchsia-500/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-fuchsia-400" />
                Quick Scan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => scanMutation.mutate()}
                disabled={scanMutation.isPending}
                className="w-full bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 border border-fuchsia-500/40 hover:from-fuchsia-500/30 hover:to-cyan-500/30 transition-all"
              >
                {scanMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Scan Substrate
                  </>
                )}
              </Button>
              
              {/* Scan Results */}
              {scanMutation.data && scanMutation.data.proposals?.length > 0 && (
                <div className="mt-3 space-y-2">
                  {scanMutation.data.proposals.slice(0, 3).map((proposal, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-white/5 text-xs">
                      {proposal.priority === 'critical' ? (
                        <AlertTriangle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                      ) : (
                        <Zap className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                      )}
                      <span className="text-muted-foreground">{proposal.description}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {scanMutation.data && scanMutation.data.proposals?.length === 0 && (
                <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400">All systems healthy</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Proposal */}
          <Card className="border border-cyan-500/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Play className="w-4 h-4 text-cyan-400" />
                Generate Proposal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedScope} onValueChange={setSelectedScope}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  <SelectItem value="brain">Brain</SelectItem>
                  <SelectItem value="defense">Defense</SelectItem>
                  <SelectItem value="nexus">Nexus</SelectItem>
                  <SelectItem value="vision">Vision</SelectItem>
                  <SelectItem value="dream">Dream</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <Textarea 
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-white/5 border-white/10 min-h-[60px]"
              />
              <Button 
                onClick={() => proposeMutation.mutate({ scope: selectedScope, notes })}
                disabled={proposeMutation.isPending}
                className="w-full bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 border border-cyan-500/40 hover:from-cyan-500/30 hover:to-fuchsia-500/30"
              >
                {proposeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Archived Functions */}
          <Collapsible open={showArchived} onOpenChange={setShowArchived}>
            <Card className="border border-white/10 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-white/5 transition-colors rounded-t-xl">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Archive className="w-4 h-4 text-amber-400" />
                      Archived Functions
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform",
                      showArchived && "rotate-180"
                    )} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  {archivedLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 rounded-lg" />)}
                    </div>
                  ) : archived && archived.length > 0 ? (
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {archived.map((opp, idx) => (
                          <div 
                            key={idx}
                            className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs text-foreground truncate">
                                {opp.archived_function}
                              </span>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[9px] h-4",
                                  opp.value === 'high' 
                                    ? "border-emerald-500/50 text-emerald-400"
                                    : "border-white/20"
                                )}
                              >
                                {opp.value}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              → {opp.repurpose_for}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-xs text-muted-foreground/70 text-center py-4">
                      No archived functions to repurpose
                    </p>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Right Column - Proposals List */}
        <div className="lg:col-span-2">
          <Card className="border border-white/10 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Upgrade Proposals
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['upgrade-plans'] })}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {plansLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}
                </div>
              ) : !plans || plans.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No upgrade proposals yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Generate a proposal to get started</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3 pr-4">
                    {plans.map((plan) => (
                      <Collapsible
                        key={plan.id}
                        open={expandedPlanId === plan.id}
                        onOpenChange={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                      >
                        <div className={cn(
                          "rounded-lg border transition-all",
                          "bg-white/5 border-white/10",
                          expandedPlanId === plan.id && "border-fuchsia-500/30 bg-fuchsia-500/5"
                        )}>
                          {/* Plan Header */}
                          <CollapsibleTrigger asChild>
                            <div className="p-4 cursor-pointer hover:bg-white/5 transition-colors">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  {/* ID with Copy Button - Easy to tap on mobile */}
                                  <div className="flex items-center gap-2 mb-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2 gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copy(plan.id, plan.id);
                                      }}
                                    >
                                      {copiedId === plan.id ? (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                      <span className="truncate max-w-[120px] sm:max-w-[200px]">{plan.id}</span>
                                    </Button>
                                    {getStatusBadge(plan.status)}
                                    {getRiskBadge(plan.risk_level)}
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                    <Badge variant="outline" className="text-[10px] h-5">
                                      {plan.scope}
                                    </Badge>
                                    <span>•</span>
                                    <span>{plan.diff_summary?.length || 0} changes</span>
                                    <span>•</span>
                                    <span>{new Date(plan.created_at).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                
                                <ChevronRight className={cn(
                                  "w-5 h-5 text-muted-foreground transition-transform shrink-0",
                                  expandedPlanId === plan.id && "rotate-90"
                                )} />
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          
                          {/* Expanded Details */}
                          <CollapsibleContent>
                            <div className="px-4 pb-4 space-y-4 border-t border-white/10">
                              {/* Diff Summary */}
                              {plan.diff_summary && plan.diff_summary.length > 0 && (
                                <div className="pt-4">
                                  <p className="text-xs font-medium mb-2 text-foreground">Suggested Changes:</p>
                                  <div className="space-y-2">
                                    {plan.diff_summary.map((diff, idx) => (
                                      <div key={idx} className="text-xs p-3 rounded-lg bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Badge variant="outline" className="text-[9px]">{diff.module}</Badge>
                                          <Badge variant="outline" className="text-[9px]">{diff.change_type}</Badge>
                                        </div>
                                        <p className="text-muted-foreground">{diff.description}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Suggested Patches */}
                              {plan.suggested_patches && plan.suggested_patches.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium mb-2 text-foreground">Patches:</p>
                                  <div className="space-y-2">
                                    {plan.suggested_patches.map((patch, idx) => (
                                      <div key={idx} className="text-xs p-3 rounded-lg bg-white/5 border border-white/10">
                                        <div className="font-mono text-cyan-400 mb-1">{patch.target}</div>
                                        <p className="text-muted-foreground">{patch.rationale}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Terminal Command Hint */}
                              <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                                <p className="text-[10px] text-muted-foreground mb-1">Terminal command:</p>
                                <code className="text-xs font-mono text-emerald-400">
                                  modernizer.apply {plan.id.slice(0, 8)}
                                </code>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex flex-wrap gap-2 pt-2">
                                {(plan.status === 'proposed' || plan.status === 'approved') && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="gap-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setApplyDialog({ open: true, planId: plan.id });
                                    }}
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                    Apply
                                  </Button>
                                )}
                                
                                {plan.status === 'applied' && plan.backup_id && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRollbackDialog({ open: true, planId: plan.id, backupId: plan.backup_id });
                                    }}
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    Rollback
                                  </Button>
                                )}
                                
                                {plan.status !== 'applied' && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="gap-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteMutation.mutate({ planId: plan.id });
                                    }}
                                    disabled={deleteMutation.isPending}
                                  >
                                    {deleteMutation.isPending ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3 h-3" />
                                    )}
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Apply Dialog - Controlled component to fix close-on-click issue */}
      <Dialog open={applyDialog.open} onOpenChange={(open) => {
        if (!open) {
          setApplyDialog({ open: false, planId: null });
          setConfirmValue('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Upgrade</DialogTitle>
            <DialogDescription>
              This will apply the upgrade proposal to the substrate. A backup will be created automatically before applying changes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Type <code className="bg-muted px-1 rounded font-mono">CONFIRM</code> to proceed:
            </p>
            <Input
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              placeholder="Type CONFIRM"
              className="font-mono"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setApplyDialog({ open: false, planId: null });
                setConfirmValue('');
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={confirmValue !== 'CONFIRM' || applyMutation.isPending || !applyDialog.planId}
              onClick={() => applyDialog.planId && applyMutation.mutate(applyDialog.planId)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {applyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Apply Upgrade
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rollback Dialog */}
      <Dialog open={rollbackDialog.open} onOpenChange={(open) => {
        if (!open) {
          setRollbackDialog({ open: false, planId: null, backupId: null });
          setConfirmValue('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Rollback Upgrade
            </DialogTitle>
            <DialogDescription>
              This will restore the system from backup <code className="font-mono">{rollbackDialog.backupId?.slice(0, 12)}...</code>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Type <code className="bg-muted px-1 rounded font-mono">CONFIRM</code> to proceed:
            </p>
            <Input
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              placeholder="Type CONFIRM"
              className="font-mono"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setRollbackDialog({ open: false, planId: null, backupId: null });
                setConfirmValue('');
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={confirmValue !== 'CONFIRM' || rollbackMutation.isPending || !rollbackDialog.planId}
              onClick={() => rollbackDialog.planId && rollbackMutation.mutate(rollbackDialog.planId)}
              variant="destructive"
            >
              {rollbackMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rolling back...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Rollback
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
