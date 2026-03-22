/**
 * Evolution Lifecycle Tab — Self-Improvement Engine
 * Dedicated tab for substrate self-upgrade system with:
 * - Easy copy proposal IDs
 * - Working Apply/Rollback buttons
 * - Quick scan & archived function discovery
 * - Complete upgrade lifecycle management
 * - Shadow testing & validation workflow
 * - Diff view comparing shadow vs production
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Zap, Clock, Shield, AlertTriangle, CheckCircle, XCircle, Copy, Check,
  RefreshCw, Play, RotateCcw, Eye, Loader2, Lock, Trash2, Archive,
  ChevronDown, ChevronRight, Sparkles, TrendingUp, Database, 
  FlaskConical, FileCode, GitCompare, Rocket, Activity
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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

interface ValidationResult {
  check: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  details?: unknown;
}

interface TestResult {
  module: string;
  test: string;
  status: 'pass' | 'fail' | 'skip';
  latency_ms?: number;
  error?: string;
  details?: string;
}

interface DiffData {
  plan_id: string;
  created_at: string;
  scope: string;
  status: string;
  health_comparison: {
    before: number | string;
    current: number | string;
    after_estimate: number | string;
  };
  proposed_changes: Array<{
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
  affected_modules: string;
  risk_level: string;
  backup_info: {
    backup_id: string;
    can_rollback: boolean;
  };
  production_state: {
    health: number;
    modules: Record<string, unknown>;
    metrics_snapshot: Record<string, unknown>;
  };
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

interface EvolutionTabProps {
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

export function EvolutionTab({ enabled }: EvolutionTabProps) {
  const queryClient = useQueryClient();
  const { copy, copiedId } = useCopyToClipboard();
  const [selectedScope, setSelectedScope] = useState('all');
  const [notes, setNotes] = useState('');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [activeTab, setActiveTab] = useState('proposals');
  
  // Dialog states
  const [applyDialog, setApplyDialog] = useState<{ open: boolean; planId: string | null }>({ open: false, planId: null });
  const [rollbackDialog, setRollbackDialog] = useState<{ open: boolean; planId: string | null; backupId: string | null }>({ open: false, planId: null, backupId: null });
  const [validationDialog, setValidationDialog] = useState<{ open: boolean; planId: string | null }>({ open: false, planId: null });
  const [testDialog, setTestDialog] = useState<{ open: boolean; planId: string | null }>({ open: false, planId: null });
  const [diffDialog, setDiffDialog] = useState<{ open: boolean; planId: string | null }>({ open: false, planId: null });
  const [promoteDialog, setPromoteDialog] = useState<{ open: boolean; planId: string | null }>({ open: false, planId: null });
  const [confirmValue, setConfirmValue] = useState('');

  // Fetch system status
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['evolution-status'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: { module: 'evolution', action: 'status' }
      });
      if (error) throw error;
      if ((data as any)?.success === false) {
        throw new Error((data as any)?.error_message || (data as any)?.error || 'Evolution status failed');
      }
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
    queryKey: ['evolution-archived'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: { module: 'evolution', action: 'archived' }
      });
      if (error) throw error;
      if ((data as any)?.success === false) {
        throw new Error((data as any)?.error_message || (data as any)?.error || 'Archived scan failed');
      }
      return data.repurposing_opportunities as ArchivedOpportunity[];
    },
    enabled: enabled && showArchived,
  });

  // Quick scan mutation
  const scanMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: { module: 'evolution', action: 'scan' }
      });
      if (error) throw error;
      if ((data as any)?.success === false) {
        throw new Error((data as any)?.error_message || (data as any)?.error || 'Scan failed');
      }
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

  // Validate plan mutation
  const validateMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { data, error } = await supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'validate_plan', plan_id: planId }
      });
      if (error) throw error;
      return data as {
        success: boolean;
        validation_status: 'pass' | 'warning' | 'fail';
        ready_to_apply: boolean;
        summary: { passed: number; warnings: number; failed: number; total: number };
        results: ValidationResult[];
      };
    },
    onSuccess: (data) => {
      if (data.ready_to_apply) {
        toast.success('Validation passed', {
          description: `${data.summary.passed}/${data.summary.total} checks passed`
        });
      } else {
        toast.warning('Validation has issues', {
          description: `${data.summary.failed} failed, ${data.summary.warnings} warnings`
        });
      }
    },
    onError: (error) => {
      toast.error('Validation failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Test shadow mutation
  const testShadowMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { data, error } = await supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'test_shadow', plan_id: planId }
      });
      if (error) throw error;
      return data as {
        success: boolean;
        test_status: 'pass' | 'fail';
        ready_for_production: boolean;
        summary: { total_tests: number; passed: number; failed: number; avg_latency_ms: number };
        results: TestResult[];
      };
    },
    onSuccess: (data) => {
      if (data.ready_for_production) {
        toast.success('All tests passed', {
          description: `${data.summary.passed} tests, avg ${data.summary.avg_latency_ms}ms latency`
        });
      } else {
        toast.error('Tests failed', {
          description: `${data.summary.failed}/${data.summary.total_tests} tests failed`
        });
      }
    },
    onError: (error) => {
      toast.error('Test run failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Diff view mutation
  const diffViewMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { data, error } = await supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'diff_view', plan_id: planId }
      });
      if (error) throw error;
      return data as { success: boolean; diff: DiffData };
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
      queryClient.invalidateQueries({ queryKey: ['evolution-status'] });
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
      queryClient.invalidateQueries({ queryKey: ['evolution-status'] });
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

  // Promote from shadow to production mutation (governed pipeline)
  const promoteMutation = useMutation({
    mutationFn: async (planId: string) => {
      // Step 1: Run validation first
      const { data: valData, error: valError } = await supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'validate_plan', plan_id: planId }
      });
      if (valError) throw valError;
      if (!valData?.ready_to_apply) {
        throw new Error(`Pre-promotion validation failed: ${valData?.summary?.failed || 0} checks failed. Fix issues before promoting.`);
      }

      // Step 2: Run shadow tests
      const { data: testData, error: testError } = await supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'test_shadow', plan_id: planId }
      });
      if (testError) throw testError;
      if (!testData?.ready_for_production) {
        throw new Error(`Shadow tests failed: ${testData?.summary?.failed || 0}/${testData?.summary?.total_tests || 0} tests failed. Cannot promote.`);
      }

      // Step 3: Apply to production (all gates passed)
      const { data, error } = await supabase.functions.invoke('pf-substrate-upgrade', {
        body: { action: 'apply_plan', plan_id: planId }
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || data.message);
      return {
        ...data,
        validation: valData,
        shadow_tests: testData,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['upgrade-plans'] });
      queryClient.invalidateQueries({ queryKey: ['evolution-status'] });
      toast.success('Shadow → Production promotion complete', {
        description: `Validation ✓ | Shadow Tests ✓ | Health: ${data.pre_health}% → ${data.post_health}%`,
      });
      setPromoteDialog({ open: false, planId: null });
      setConfirmValue('');
    },
    onError: (error) => {
      toast.error('Promotion blocked', {
        description: error instanceof Error ? error.message : 'Safety gate prevented promotion',
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
        return <Badge variant="outline" className="border-neon-amber/50 text-neon-amber bg-neon-amber/10">Proposed</Badge>;
      case 'approved':
        return <Badge variant="outline" className="border-neon-blue/50 text-neon-blue bg-neon-blue/10">Approved</Badge>;
      case 'applied':
        return <Badge variant="outline" className="border-neon-green/50 text-neon-green bg-neon-green/10">Applied</Badge>;
      case 'rolled_back':
        return <Badge variant="outline" className="border-destructive/50 text-destructive bg-destructive/10">Rolled Back</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="border-muted-foreground/50 text-muted-foreground bg-muted/10">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return <Badge variant="destructive" className="text-[10px]">HIGH RISK</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-neon-amber/50 text-neon-amber text-[10px]">MEDIUM</Badge>;
      case 'low':
        return <Badge variant="outline" className="border-neon-green/50 text-neon-green text-[10px]">LOW</Badge>;
      default:
        return null;
    }
  };

  const getValidationIcon = (status: 'pass' | 'warning' | 'fail') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-neon-green" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-neon-amber" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  if (!enabled) {
    return (
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="rounded-xl border border-dashed border-neon-magenta/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl p-12">
          <div className="text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-lg text-muted-foreground">
              EVOLUTION requires Operator privileges
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-magenta/20 to-neon-cyan/20 border border-neon-magenta/40 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-neon-magenta" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">EVOLUTION</h2>
            <p className="text-xs text-muted-foreground font-mono">bounded self-evolution • shadow mode</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              isHealthy 
                ? "border-neon-green/50 text-neon-green bg-neon-green/10"
                : "border-neon-amber/50 text-neon-amber bg-neon-amber/10"
            )}
          >
            {healthScore}% Health
          </Badge>
          <Badge variant="outline" className="border-neon-amber/50 text-neon-amber bg-neon-amber/10">
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
          <Card className="border border-neon-magenta/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl hover:border-neon-magenta/40 transition-colors">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-2 text-neon-magenta" />
              <p className={cn(
                "text-2xl font-bold",
                healthScore >= 90 ? "text-neon-green" : healthScore >= 70 ? "text-neon-amber" : "text-destructive"
              )}>{healthScore}%</p>
              <p className="text-[10px] text-muted-foreground">System Health</p>
            </CardContent>
          </Card>
          <Card className="border border-neon-cyan/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl hover:border-neon-cyan/40 transition-colors">
            <CardContent className="p-4 text-center">
              <Database className="w-5 h-5 mx-auto mb-2 text-neon-cyan" />
              <p className="text-2xl font-bold text-foreground">{plans?.filter(p => p.status === 'proposed').length ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card className="border border-neon-green/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl hover:border-neon-green/40 transition-colors">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-5 h-5 mx-auto mb-2 text-neon-green" />
              <p className="text-2xl font-bold text-foreground">
                {plans?.filter(p => p.status === 'applied').length ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground">Applied</p>
            </CardContent>
          </Card>
          <Card className="border border-neon-amber/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl hover:border-neon-amber/40 transition-colors">
            <CardContent className="p-4 text-center">
              <RotateCcw className="w-5 h-5 mx-auto mb-2 text-neon-amber" />
              <p className="text-2xl font-bold text-foreground">
                {plans?.filter(p => p.status === 'rolled_back').length ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground">Rolled Back</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full grid grid-cols-3 sm:grid-cols-4 bg-white/5 border border-white/10">
          <TabsTrigger value="proposals" className="gap-1.5 text-xs">
            <Clock className="w-3 h-3" />
            <span className="hidden sm:inline">Proposals</span>
          </TabsTrigger>
          <TabsTrigger value="validation" className="gap-1.5 text-xs">
            <FlaskConical className="w-3 h-3" />
            <span className="hidden sm:inline">Validate</span>
          </TabsTrigger>
          <TabsTrigger value="deploy" className="gap-1.5 text-xs">
            <Rocket className="w-3 h-3" />
            <span className="hidden sm:inline">Deploy</span>
          </TabsTrigger>
          <TabsTrigger value="generate" className="gap-1.5 text-xs">
            <Zap className="w-3 h-3" />
            <span className="hidden sm:inline">Generate</span>
          </TabsTrigger>
        </TabsList>

        {/* Proposals Tab */}
        <TabsContent value="proposals" className="space-y-4">
          <Card className="border border-white/10 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-neon-amber" />
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
                <ScrollArea className="h-[400px]">
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
                          expandedPlanId === plan.id && "border-neon-magenta/30 bg-neon-magenta/5"
                        )}>
                          <CollapsibleTrigger asChild>
                            <div className="p-4 cursor-pointer hover:bg-white/5 transition-colors">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                                        <Check className="w-3 h-3 text-neon-green" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                      <span className="truncate max-w-[100px] sm:max-w-[200px]">{plan.id}</span>
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
                              
                              {/* Terminal Command Hint */}
                              <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                                <p className="text-[10px] text-muted-foreground mb-1">Terminal command:</p>
                                <code className="text-xs font-mono text-neon-green">
                                  evolution.apply {plan.id.slice(0, 8)}
                                </code>
                              </div>
                              
                              {/* Quick Actions */}
                              <div className="flex flex-wrap gap-2 pt-2">
                                {/* View Diff */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1.5 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDiffDialog({ open: true, planId: plan.id });
                                    diffViewMutation.mutate(plan.id);
                                  }}
                                >
                                  <GitCompare className="w-3 h-3" />
                                  Diff
                                </Button>
                                
                                {/* Validate */}
                                {(plan.status === 'proposed' || plan.status === 'approved') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5 border-neon-amber/30 text-neon-amber hover:bg-neon-amber/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setValidationDialog({ open: true, planId: plan.id });
                                      validateMutation.mutate(plan.id);
                                    }}
                                  >
                                    <FlaskConical className="w-3 h-3" />
                                    Validate
                                  </Button>
                                )}
                                
                                {/* Test */}
                                {(plan.status === 'proposed' || plan.status === 'approved') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5 border-neon-magenta/30 text-neon-magenta hover:bg-neon-magenta/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setTestDialog({ open: true, planId: plan.id });
                                      testShadowMutation.mutate(plan.id);
                                    }}
                                  >
                                    <Activity className="w-3 h-3" />
                                    Test
                                  </Button>
                                )}

                                {/* Apply */}
                                {(plan.status === 'proposed' || plan.status === 'approved') && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="gap-1.5 border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setApplyDialog({ open: true, planId: plan.id });
                                    }}
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                    Apply
                                  </Button>
                                )}
                                
                                {/* Rollback */}
                                {plan.status === 'applied' && plan.backup_id && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRollbackDialog({ open: true, planId: plan.id, backupId: plan.backup_id });
                                    }}
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    Rollback
                                  </Button>
                                )}
                                
                                {/* Delete */}
                                {plan.status !== 'applied' && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-4">
          <Card className="border border-white/10 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-neon-amber" />
                Validation & Testing Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Before applying an upgrade, validate the plan and run shadow tests to ensure stability.
              </p>
              
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-neon-cyan">1</span>
                    </div>
                    <p className="font-medium text-sm">Validate</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Check system health, backup status, and module availability
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-neon-magenta/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-neon-magenta">2</span>
                    </div>
                    <p className="font-medium text-sm">Test Shadow</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Run tests against all substrate modules in shadow mode
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-neon-green">3</span>
                    </div>
                    <p className="font-medium text-sm">Apply</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Push validated changes to production with auto-rollback safety
                  </p>
                </div>
              </div>

              {/* Quick Actions for Proposed Plans */}
              {plans && plans.filter(p => p.status === 'proposed' || p.status === 'approved').length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs font-medium mb-3 text-foreground">Pending Plans:</p>
                  <div className="space-y-2">
                    {plans.filter(p => p.status === 'proposed' || p.status === 'approved').map(plan => (
                      <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1.5 gap-1 font-mono text-[10px]"
                            onClick={() => copy(plan.id, plan.id)}
                          >
                            {copiedId === plan.id ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                            {plan.id.slice(0, 8)}
                          </Button>
                          {getStatusBadge(plan.status)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                            onClick={() => {
                              setValidationDialog({ open: true, planId: plan.id });
                              validateMutation.mutate(plan.id);
                            }}
                          >
                            <FlaskConical className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                            onClick={() => {
                              setTestDialog({ open: true, planId: plan.id });
                              testShadowMutation.mutate(plan.id);
                            }}
                          >
                            <Activity className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-neon-green hover:text-neon-green hover:bg-neon-green/10"
                            onClick={() => setPromoteDialog({ open: true, planId: plan.id })}
                            title="Promote to Production (governed pipeline)"
                          >
                            <Rocket className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deploy Tab */}
        <TabsContent value="deploy" className="space-y-4">
          <Card className="border border-white/10 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Rocket className="w-4 h-4 text-neon-green" />
                Deployment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Applied Upgrades */}
              {plans && plans.filter(p => p.status === 'applied').length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-foreground">Applied Upgrades:</p>
                  {plans.filter(p => p.status === 'applied').map(plan => (
                    <div key={plan.id} className="p-4 rounded-lg bg-neon-green/10 border border-neon-green/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-neon-green" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 gap-1.5 font-mono text-xs"
                            onClick={() => copy(plan.id, plan.id)}
                          >
                            {copiedId === plan.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {plan.id.slice(0, 12)}...
                          </Button>
                        </div>
                        <Badge variant="outline" className="border-neon-green/50 text-neon-green bg-neon-green/10">
                          LIVE
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span>Scope: {plan.scope}</span>
                        <span>•</span>
                        <span>{plan.diff_summary?.length || 0} changes</span>
                        <span>•</span>
                        <span>Applied {new Date(plan.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 border-neon-cyan/30 text-neon-cyan"
                          onClick={() => {
                            setDiffDialog({ open: true, planId: plan.id });
                            diffViewMutation.mutate(plan.id);
                          }}
                        >
                          <GitCompare className="w-3 h-3" />
                          View Changes
                        </Button>
                        {plan.backup_id && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 border-destructive/30 text-destructive"
                            onClick={() => setRollbackDialog({ open: true, planId: plan.id, backupId: plan.backup_id })}
                          >
                            <RotateCcw className="w-3 h-3" />
                            Rollback
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Rocket className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No upgrades deployed yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Generate and apply a proposal to deploy</p>
                </div>
              )}

              {/* Rolled Back History */}
              {plans && plans.filter(p => p.status === 'rolled_back').length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                      <ChevronRight className="w-4 h-4" />
                      Rollback History ({plans.filter(p => p.status === 'rolled_back').length})
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-3 space-y-2">
                        {plans.filter(p => p.status === 'rolled_back').map(plan => (
                          <div key={plan.id} className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs">
                            <div className="flex items-center gap-2">
                              <RotateCcw className="w-3 h-3 text-destructive" />
                              <span className="font-mono">{plan.id.slice(0, 12)}...</span>
                              <span className="text-muted-foreground">
                                {new Date(plan.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
              
              {/* All History Summary */}
              {plans && plans.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground w-full">
                      <ChevronRight className="w-4 h-4" />
                      All Activity ({plans.length} total)
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-3 space-y-2 max-h-[200px] overflow-y-auto">
                        {plans.map(plan => (
                          <div 
                            key={plan.id} 
                            className={cn(
                              "p-3 rounded-lg border text-xs flex items-center justify-between",
                              plan.status === 'applied' && "bg-neon-green/10 border-neon-green/20",
                              plan.status === 'proposed' && "bg-neon-amber/10 border-neon-amber/20",
                              plan.status === 'rolled_back' && "bg-destructive/10 border-destructive/20",
                              plan.status === 'rejected' && "bg-gray-500/10 border-gray-500/20",
                              plan.status === 'deleted' && "bg-gray-500/10 border-gray-500/20",
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {plan.status === 'applied' && <CheckCircle className="w-3 h-3 text-neon-green" />}
                              {plan.status === 'proposed' && <Clock className="w-3 h-3 text-neon-amber" />}
                              {plan.status === 'rolled_back' && <RotateCcw className="w-3 h-3 text-destructive" />}
                              {plan.status === 'rejected' && <XCircle className="w-3 h-3 text-gray-400" />}
                              <span className="font-mono">{plan.id.slice(0, 8)}</span>
                              <Badge variant="outline" className="text-[8px] h-4">{plan.scope}</Badge>
                            </div>
                            <span className="text-muted-foreground">
                              {new Date(plan.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Quick Scan */}
            <Card className="border border-neon-magenta/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-neon-magenta" />
                  Quick Scan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => scanMutation.mutate()}
                  disabled={scanMutation.isPending}
                  className="w-full bg-gradient-to-r from-neon-magenta/20 to-neon-cyan/20 border border-neon-magenta/40 hover:from-neon-magenta/30 hover:to-neon-cyan/30 transition-all"
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
                
                {scanMutation.data && scanMutation.data.proposals?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {scanMutation.data.proposals.slice(0, 3).map((proposal, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-white/5 text-xs">
                        {proposal.priority === 'critical' ? (
                          <AlertTriangle className="w-3 h-3 text-destructive shrink-0 mt-0.5" />
                        ) : (
                          <Zap className="w-3 h-3 text-neon-cyan shrink-0 mt-0.5" />
                        )}
                        <span className="text-muted-foreground">{proposal.description}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {scanMutation.data && scanMutation.data.proposals?.length === 0 && (
                  <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-neon-green/10 border border-neon-green/20">
                    <CheckCircle className="w-4 h-4 text-neon-green" />
                    <span className="text-xs text-neon-green">All systems healthy</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generate Proposal */}
            <Card className="border border-neon-cyan/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Play className="w-4 h-4 text-neon-cyan" />
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
                  className="w-full bg-gradient-to-r from-neon-cyan/20 to-neon-magenta/20 border border-neon-cyan/40 hover:from-neon-cyan/30 hover:to-neon-magenta/30"
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
                {proposeMutation.isSuccess && proposeMutation.data?.plan && (
                  <div className="mt-3 p-3 rounded-lg bg-neon-green/10 border border-neon-green/20">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-neon-green" />
                      <span className="text-xs font-medium text-neon-green">Proposal Created</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {proposeMutation.data.plan.diff_summaries?.length || 0} changes suggested
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Safety Info Card */}
            <Card className="lg:col-span-2 border border-neon-green/20 bg-gradient-to-br from-neon-green/5 to-transparent backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-neon-green shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Safety Features Active</p>
                    <div className="grid sm:grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-neon-green" />
                        <span>Pre-upgrade backup required</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-neon-green" />
                        <span>95% health threshold gate</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-neon-green" />
                        <span>Auto-rollback on degradation</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-neon-green" />
                        <span>Human approval required</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-neon-green" />
                        <span>3 upgrades/day rate limit</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-neon-green" />
                        <span>Shadow mode by default</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Archived Functions */}
            <Card className="lg:col-span-2 border border-white/10 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
              <Collapsible open={showArchived} onOpenChange={setShowArchived}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="pb-3 cursor-pointer hover:bg-white/5 transition-colors">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Archive className="w-4 h-4 text-neon-amber" />
                        Archived Functions for Repurposing
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
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}
                      </div>
                    ) : archived && archived.length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-3">
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
                                    ? "border-neon-green/50 text-neon-green"
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
                    ) : (
                      <p className="text-xs text-muted-foreground/70 text-center py-4">
                        No archived functions to repurpose
                      </p>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Validation Dialog */}
      <Dialog open={validationDialog.open} onOpenChange={(open) => {
        if (!open) setValidationDialog({ open: false, planId: null });
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-neon-amber" />
              Validation Results
            </DialogTitle>
            <DialogDescription>
              Pre-deployment validation checks for plan {validationDialog.planId?.slice(0, 8)}...
            </DialogDescription>
          </DialogHeader>
          
          {validateMutation.isPending ? (
            <div className="py-8 text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-neon-amber" />
              <p className="text-sm text-muted-foreground">Running validation checks...</p>
            </div>
          ) : validateMutation.data ? (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="text-sm font-medium">Overall Status</span>
                <Badge variant={validateMutation.data.ready_to_apply ? "default" : "destructive"}>
                  {validateMutation.data.validation_status.toUpperCase()}
                </Badge>
              </div>
              
              {/* Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{validateMutation.data.summary.passed} passed</span>
                  <span>{validateMutation.data.summary.total} total</span>
                </div>
                <Progress 
                  value={(validateMutation.data.summary.passed / validateMutation.data.summary.total) * 100} 
                  className="h-2"
                />
              </div>
              
              {/* Results */}
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {validateMutation.data.results.map((result, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-white/5">
                      {getValidationIcon(result.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{result.check.replace(/_/g, ' ')}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{result.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {validateMutation.data.ready_to_apply && (
                <Button
                  onClick={() => {
                    setValidationDialog({ open: false, planId: null });
                    if (validationDialog.planId) {
                      setPromoteDialog({ open: true, planId: validationDialog.planId });
                    }
                  }}
                  className="w-full bg-neon-green hover:bg-neon-green"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Promote to Production
                </Button>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Test Shadow Dialog */}
      <Dialog open={testDialog.open} onOpenChange={(open) => {
        if (!open) setTestDialog({ open: false, planId: null });
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-neon-magenta" />
              Shadow Test Results
            </DialogTitle>
            <DialogDescription>
              Testing all substrate modules for plan {testDialog.planId?.slice(0, 8)}...
            </DialogDescription>
          </DialogHeader>
          
          {testShadowMutation.isPending ? (
            <div className="py-8 text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-neon-magenta" />
              <p className="text-sm text-muted-foreground">Running shadow tests...</p>
            </div>
          ) : testShadowMutation.data ? (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                  <p className="text-lg font-bold text-neon-green">{testShadowMutation.data.summary.passed}</p>
                  <p className="text-[10px] text-muted-foreground">Passed</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                  <p className="text-lg font-bold text-destructive">{testShadowMutation.data.summary.failed}</p>
                  <p className="text-[10px] text-muted-foreground">Failed</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                  <p className="text-lg font-bold text-foreground">{testShadowMutation.data.summary.avg_latency_ms}ms</p>
                  <p className="text-[10px] text-muted-foreground">Avg Latency</p>
                </div>
              </div>
              
              {/* Results */}
              <ScrollArea className="h-[250px]">
                <div className="space-y-2">
                  {testShadowMutation.data.results.map((result, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {result.status === 'pass' ? (
                          <CheckCircle className="w-3 h-3 text-neon-green shrink-0" />
                        ) : (
                          <XCircle className="w-3 h-3 text-destructive shrink-0" />
                        )}
                        <span className="text-xs font-mono">{result.module}</span>
                        <span className="text-[10px] text-muted-foreground">• {result.test}</span>
                        {result.details && (
                          <Badge variant="outline" className="text-[8px] h-4 ml-1">{result.details}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {result.error && (
                          <span className="text-[9px] text-destructive truncate max-w-[80px]">{result.error}</span>
                        )}
                        {result.latency_ms && (
                          <span className="text-[10px] text-muted-foreground">{result.latency_ms}ms</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {testShadowMutation.data.ready_for_production && (
                <Button
                  onClick={() => {
                    setTestDialog({ open: false, planId: null });
                    if (testDialog.planId) {
                      setPromoteDialog({ open: true, planId: testDialog.planId });
                    }
                  }}
                  className="w-full bg-neon-green hover:bg-neon-green"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Promote to Production
                </Button>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Diff View Dialog */}
      <Dialog open={diffDialog.open} onOpenChange={(open) => {
        if (!open) setDiffDialog({ open: false, planId: null });
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-neon-cyan" />
              Diff View
            </DialogTitle>
            <DialogDescription>
              Comparing proposal with current production state
            </DialogDescription>
          </DialogHeader>
          
          {diffViewMutation.isPending ? (
            <div className="py-8 text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-neon-cyan" />
              <p className="text-sm text-muted-foreground">Loading diff...</p>
            </div>
          ) : diffViewMutation.data?.diff ? (
            <div className="space-y-4">
              {/* Health Comparison */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs font-medium mb-3 text-foreground">Health Comparison</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-muted-foreground">{diffViewMutation.data.diff.health_comparison.before}</p>
                    <p className="text-[10px] text-muted-foreground">Before</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{diffViewMutation.data.diff.health_comparison.current}</p>
                    <p className="text-[10px] text-muted-foreground">Current</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-neon-green">{diffViewMutation.data.diff.health_comparison.after_estimate}</p>
                    <p className="text-[10px] text-muted-foreground">After</p>
                  </div>
                </div>
              </div>
              
              {/* Proposed Changes */}
              {diffViewMutation.data.diff.proposed_changes.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2 text-foreground">Proposed Changes</p>
                  <div className="space-y-2">
                    {diffViewMutation.data.diff.proposed_changes.map((change, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-neon-green/10 border border-neon-green/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[9px] border-neon-green/30 text-neon-green">
                            + {change.module}
                          </Badge>
                          <Badge variant="outline" className="text-[9px]">{change.change_type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{change.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Suggested Patches */}
              {diffViewMutation.data.diff.suggested_patches.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2 text-foreground">Patches</p>
                  <div className="space-y-2">
                    {diffViewMutation.data.diff.suggested_patches.map((patch, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20">
                        <p className="text-xs font-mono text-neon-cyan mb-1">{patch.target}</p>
                        <p className="text-[10px] text-muted-foreground">{patch.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Backup Info */}
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Backup ID</span>
                  <code className="text-xs font-mono text-foreground">
                    {diffViewMutation.data.diff.backup_info.backup_id || 'N/A'}
                  </code>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Apply Dialog */}
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
              This will apply the upgrade to production. Backup is ready for rollback if needed.
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
              className="bg-neon-green hover:bg-neon-green"
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

      {/* Promote to Production Dialog */}
      <Dialog open={promoteDialog.open} onOpenChange={(open) => {
        if (!open) {
          setPromoteDialog({ open: false, planId: null });
          setConfirmValue('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-neon-green" />
              Promote Shadow → Production
            </DialogTitle>
            <DialogDescription>
              This will run the full governed promotion pipeline: Validate → Shadow Test → Apply.
              All gates must pass before changes reach production.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {/* Pipeline Steps */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-neon-cyan">1</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium">Validation Gate</p>
                  <p className="text-[10px] text-muted-foreground">Health, backup, and module checks</p>
                </div>
                {promoteMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin text-neon-cyan" />
                )}
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-full bg-neon-magenta/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-neon-magenta">2</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium">Shadow Test Gate</p>
                  <p className="text-[10px] text-muted-foreground">All module tests must pass in shadow</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-full bg-neon-green/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-neon-green">3</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium">Production Apply</p>
                  <p className="text-[10px] text-muted-foreground">Apply with auto-rollback safety net</p>
                </div>
              </div>
            </div>

            {/* Safety Notice */}
            <div className="p-3 rounded-lg bg-neon-amber/10 border border-neon-amber/30">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-neon-amber shrink-0 mt-0.5" />
                <p className="text-[10px] text-neon-amber/90">
                  Promotion will be blocked if any gate fails. A backup snapshot is taken before applying, 
                  enabling instant rollback if degradation is detected.
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Type <code className="bg-muted px-1 rounded font-mono">PROMOTE</code> to proceed:
              </p>
              <Input
                value={confirmValue}
                onChange={(e) => setConfirmValue(e.target.value)}
                placeholder="Type PROMOTE"
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setPromoteDialog({ open: false, planId: null });
                setConfirmValue('');
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={confirmValue !== 'PROMOTE' || promoteMutation.isPending || !promoteDialog.planId}
              onClick={() => promoteDialog.planId && promoteMutation.mutate(promoteDialog.planId)}
              className="bg-neon-green hover:bg-neon-green"
            >
              {promoteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Pipeline...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Promote to Production
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
