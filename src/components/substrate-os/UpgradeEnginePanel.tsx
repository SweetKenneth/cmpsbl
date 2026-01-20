/**
 * Upgrade Engine Panel
 * Shadow mode controls for substrate self-upgrade system
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Zap, Clock, Shield, AlertTriangle, CheckCircle, XCircle,
  RefreshCw, Play, RotateCcw, Eye, Loader2, Lock
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
  diff_summary: Array<{
    module: string;
    change_type: string;
    description: string;
    risk: string;
  }>;
  suggested_patches: Array<{
    target: string;
    action: string;
    rationale: string;
  }>;
}

interface UpgradeEnginePanelProps {
  enabled: boolean;
}

export function UpgradeEnginePanel({ enabled }: UpgradeEnginePanelProps) {
  const queryClient = useQueryClient();
  const [selectedScope, setSelectedScope] = useState('all');
  const [notes, setNotes] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [confirmValue, setConfirmValue] = useState('');

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
      if (!data.success) throw new Error(data.error || data.message);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['upgrade-plans'] });
      toast.success('Upgrade proposal generated', {
        description: `Plan ${data.plan?.plan_id} created with ${data.plan?.diff_summaries?.length || 0} suggested changes`,
      });
      setNotes('');
    },
    onError: (error) => {
      toast.error('Failed to generate proposal', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Apply plan mutation
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
      toast.success('Upgrade applied', {
        description: `Health: ${data.pre_health}% → ${data.post_health}%`,
      });
      setSelectedPlanId(null);
      setConfirmValue('');
    },
    onError: (error) => {
      toast.error('Failed to apply upgrade', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Rollback plan mutation
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
      toast.success('Rollback completed');
      setSelectedPlanId(null);
      setConfirmValue('');
    },
    onError: (error) => {
      toast.error('Rollback failed', {
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
      <div className="rounded-xl border border-dashed border-cyan-500/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl p-8">
        <div className="text-center">
          <Lock className="w-10 h-10 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground italic">
            Upgrade Engine requires Operator privileges
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 border border-cyan-500/40 flex items-center justify-center">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Upgrade Engine</h2>
            <p className="text-xs text-muted-foreground font-mono">shadow mode • propose-only</p>
          </div>
        </div>
        <Badge variant="outline" className="border-amber-500/50 text-amber-400 bg-amber-500/10">
          <Shield className="w-3 h-3 mr-1" />
          SHADOW MODE
        </Badge>
      </div>

      {/* Generate Proposal */}
      <Card className="border border-cyan-500/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Play className="w-4 h-4 text-cyan-400" />
            Generate Proposal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Select value={selectedScope} onValueChange={setSelectedScope}>
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
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
              className="flex-1 bg-white/5 border-white/10 min-h-[40px] max-h-[80px]"
            />
          </div>
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
                Generate Proposal
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Plans List */}
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
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : !plans || plans.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No upgrade proposals yet</p>
              <p className="text-xs text-muted-foreground/70">Generate a proposal to get started</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {plans.map((plan) => (
                  <div 
                    key={plan.id}
                    className={cn(
                      "p-3 rounded-lg border transition-all cursor-pointer",
                      "bg-white/5 border-white/10 hover:border-cyan-500/30 hover:bg-white/10",
                      selectedPlanId === plan.id && "border-cyan-500/50 bg-cyan-500/10"
                    )}
                    onClick={() => setSelectedPlanId(selectedPlanId === plan.id ? null : plan.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          {plan.id.slice(0, 12)}...
                        </span>
                        {getStatusBadge(plan.status)}
                        {getRiskBadge(plan.risk_level)}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(plan.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px] h-5">
                        {plan.scope}
                      </Badge>
                      <span>•</span>
                      <span>{plan.diff_summary?.length || 0} changes</span>
                      {plan.backup_id && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{plan.backup_id.slice(0, 10)}</span>
                        </>
                      )}
                    </div>
                    
                    {/* Expanded Details */}
                    {selectedPlanId === plan.id && (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                        {/* Diff Summary */}
                        {plan.diff_summary && plan.diff_summary.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-2">Suggested Changes:</p>
                            <div className="space-y-1">
                              {plan.diff_summary.map((diff, idx) => (
                                <div key={idx} className="text-xs p-2 rounded bg-white/5 flex items-start gap-2">
                                  <Badge variant="outline" className="text-[9px] shrink-0">
                                    {diff.module}
                                  </Badge>
                                  <span className="text-muted-foreground">{diff.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          {(plan.status === 'proposed' || plan.status === 'approved') && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="gap-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                                  <CheckCircle className="w-3 h-3" />
                                  Apply
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Apply Upgrade</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will apply the upgrade proposal in shadow mode. Type CONFIRM to proceed.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <Input
                                  value={confirmValue}
                                  onChange={(e) => setConfirmValue(e.target.value)}
                                  placeholder="Type CONFIRM"
                                  className="font-mono"
                                />
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setConfirmValue('')}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    disabled={confirmValue !== 'CONFIRM' || applyMutation.isPending}
                                    onClick={() => applyMutation.mutate(plan.id)}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                  >
                                    {applyMutation.isPending ? 'Applying...' : 'Apply'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          
                          {plan.status === 'applied' && plan.backup_id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10">
                                  <RotateCcw className="w-3 h-3" />
                                  Rollback
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-destructive" />
                                    Rollback Upgrade
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will restore the system from backup {plan.backup_id}. Type CONFIRM to proceed.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <Input
                                  value={confirmValue}
                                  onChange={(e) => setConfirmValue(e.target.value)}
                                  placeholder="Type CONFIRM"
                                  className="font-mono"
                                />
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setConfirmValue('')}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    disabled={confirmValue !== 'CONFIRM' || rollbackMutation.isPending}
                                    onClick={() => rollbackMutation.mutate(plan.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    {rollbackMutation.isPending ? 'Rolling back...' : 'Rollback'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Future: Auto-mode toggle (disabled) */}
      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 opacity-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Auto-apply mode</span>
          </div>
          <Badge variant="outline" className="text-[10px]">FUTURE</Badge>
        </div>
        <p className="text-xs text-muted-foreground/70 mt-2">
          Automatic upgrade application coming in a future release
        </p>
      </div>
    </div>
  );
}
