/**
 * Evolution Mesh Dashboard — MPE v1
 * Full mutation pipeline: Artifacts → Proposals → Shadow → Gate → Canary → Verification
 */

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Shield, Play, GitCompare, Rocket, Activity, AlertTriangle, CheckCircle,
  Loader2, RotateCcw, ChevronRight, FlaskConical, Eye, Zap, ArrowRight,
  RefreshCw, Info, Package, Gauge, TrendingUp, TrendingDown, Clock,
  Users, Cpu, XOctagon,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrityService } from '@/lib/evolution-mesh/integrity-service';
import { snapshotService } from '@/lib/evolution-mesh/snapshot-service';
import { telemetryService } from '@/lib/evolution-mesh/telemetry-service';
import { mutationEngine } from '@/lib/evolution-mesh/mutation-engine';
import { useModernizer } from '@/hooks/substrate/useModernizer';
import type { MutationProposal, MutationRun, ChangeArtifact, VerificationScan } from '@/lib/evolution-mesh/mutation-engine';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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

// ── Gate state display config ──────────────────────────────

const GATE_COLORS: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  shadow_running: 'bg-blue-500/20 text-blue-400',
  passed: 'bg-emerald-500/20 text-emerald-400',
  failed: 'bg-destructive/20 text-destructive',
  canary: 'bg-amber-500/20 text-amber-400',
  promoted: 'bg-primary/20 text-primary',
  rolled_back: 'bg-muted text-muted-foreground line-through',
};

const CATEGORY_ICONS: Record<string, string> = {
  resilience: '🛡️',
  performance: '⚡',
  security: '🔒',
  cleanup: '🧹',
  feature: '✨',
};

// ── Flag config — single source of truth ───────────────────

const MPE_FLAG_CONFIG = [
  { key: 'mpe_mutation_intake', flagKey: 'intake' as const, label: 'Mutation Intake', desc: 'Accept new proposals' },
  { key: 'mpe_auto_shadow', flagKey: 'autoShadow' as const, label: 'Auto Shadow', desc: 'Auto-run A/B on new proposals' },
  { key: 'mpe_auto_promotion', flagKey: 'autoPromotion' as const, label: 'Auto Promote', desc: 'Auto-promote passing mutations', danger: true },
  { key: 'mpe_post_verification', flagKey: 'postVerification' as const, label: 'Post-Verify', desc: 'Scan after every promotion' },
];

function GateStateBadge({ state }: { state: string }) {
  return (
    <Badge className={`text-xs whitespace-nowrap ${GATE_COLORS[state] ?? 'bg-muted text-muted-foreground'}`}>
      {state.replace(/_/g, ' ')}
    </Badge>
  );
}

// ── Skeleton loader ────────────────────────────────────────

function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4 space-y-3 animate-pulse">
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 rounded bg-muted" />
            <div className="h-4 w-48 rounded bg-muted" />
          </div>
          <div className="flex gap-4">
            <div className="h-3 w-20 rounded bg-muted/60" />
            <div className="h-3 w-16 rounded bg-muted/60" />
            <div className="h-3 w-32 rounded bg-muted/60" />
          </div>
        </Card>
      ))}
    </>
  );
}

// ── Empty State ────────────────────────────────────────────

function EmptyState({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-6 sm:p-8 text-center space-y-3 hover:border-primary/15 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">{description}</p>
    </Card>
  );
}

// ── Pipeline Stage Visualizer ──────────────────────────────

function PipelineStages({ proposal }: { proposal: MutationProposal }) {
  const stages = ['pending', 'shadow_running', 'passed', 'canary', 'promoted'];
  const stageLabels = ['Pending', 'Shadow', 'Gate', 'Canary', 'Live'];
  const currentIdx = stages.indexOf(proposal.gate_state);
  const failed = proposal.gate_state === 'failed' || proposal.gate_state === 'rolled_back';

  return (
    <div className="flex items-center gap-1 text-[10px] flex-shrink-0">
      {stages.map((stage, i) => (
        <div key={stage} className="flex items-center gap-1">
          <div className="flex flex-col items-center gap-0.5">
            <div
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors ${
                failed
                  ? i <= currentIdx ? 'bg-destructive/60' : 'bg-muted-foreground/20'
                  : i < currentIdx
                  ? 'bg-primary'
                  : i === currentIdx
                  ? 'bg-primary animate-pulse'
                  : 'bg-muted-foreground/20'
              }`}
            />
            <span className="text-muted-foreground hidden sm:block">{stageLabels[i]}</span>
          </div>
          {i < stages.length - 1 && (
            <div className={`w-2 sm:w-4 h-px ${i < currentIdx ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Metric Delta Display ───────────────────────────────────

function MetricDelta({ label, value, inverse }: { label: string; value: number; inverse?: boolean }) {
  const improved = inverse ? value < 0 : value > 0;
  const degraded = inverse ? value > 0 : value < 0;
  return (
    <div className="flex items-center gap-1 min-w-0">
      <span className="text-muted-foreground truncate">{label}:</span>
      <span className={`font-mono font-medium whitespace-nowrap ${degraded ? 'text-destructive' : improved ? 'text-emerald-400' : 'text-muted-foreground'}`}>
        {value > 0 ? '+' : ''}{typeof value === 'number' ? value.toFixed(3) : value}
      </span>
      {degraded && <TrendingDown className="w-3 h-3 text-destructive flex-shrink-0" />}
      {improved && <TrendingUp className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
    </div>
  );
}

// ── Pipeline Stats Bar ─────────────────────────────────────

function PipelineStatsBar({ proposals }: { proposals: MutationProposal[] }) {
  const counts = proposals.reduce((acc, p) => {
    const state = p.gate_state;
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = proposals.length;
  if (total === 0) return null;

  const segments = [
    { key: 'pending', label: 'Pending', color: 'bg-muted-foreground/40' },
    { key: 'shadow_running', label: 'Shadow', color: 'bg-blue-500' },
    { key: 'passed', label: 'Passed', color: 'bg-emerald-500' },
    { key: 'canary', label: 'Canary', color: 'bg-amber-500' },
    { key: 'promoted', label: 'Promoted', color: 'bg-primary' },
    { key: 'failed', label: 'Failed', color: 'bg-destructive' },
    { key: 'rolled_back', label: 'Rolled Back', color: 'bg-muted-foreground/30' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex h-2 rounded-full overflow-hidden bg-muted/30">
        {segments.map(s => {
          const count = counts[s.key] || 0;
          if (count === 0) return null;
          return (
            <div key={s.key} className={`${s.color} transition-all`} style={{ width: `${(count / total) * 100}%` }} />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-3 text-[10px]">
        {segments.map(s => {
          const count = counts[s.key] || 0;
          if (count === 0) return null;
          return (
            <div key={s.key} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${s.color}`} />
              <span className="text-muted-foreground">{s.label}: {count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────

export default function EvolutionMeshDashboard() {
  const queryClient = useQueryClient();
  const [selectedMutation, setSelectedMutation] = useState<string | null>(null);
  const [scanResults, setScanResults] = useState<any[]>([]);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['mpe'] });
    queryClient.invalidateQueries({ queryKey: ['evolution-mesh'] });
  };

  // ── Data queries ──
  const { data: flags, isLoading: flagsLoading } = useQuery({
    queryKey: ['mpe', 'flags'],
    queryFn: () => mutationEngine.getMPEFlags(),
    staleTime: 10_000,
  });

  const { data: artifacts = [], isLoading: artifactsLoading } = useQuery({
    queryKey: ['mpe', 'artifacts'],
    queryFn: () => mutationEngine.listArtifacts(30),
    staleTime: 15_000,
  });

  const { data: proposals = [], isLoading: proposalsLoading } = useQuery({
    queryKey: ['mpe', 'proposals'],
    queryFn: () => mutationEngine.listProposals(30),
    staleTime: 15_000,
  });

  const { data: verifications = [], isLoading: verificationsLoading } = useQuery({
    queryKey: ['mpe', 'verifications'],
    queryFn: () => mutationEngine.listVerificationScans(undefined, 20),
    staleTime: 15_000,
  });

  const { data: allRuns = [], isLoading: runsLoading } = useQuery({
    queryKey: ['mpe', 'all-runs'],
    queryFn: () => mutationEngine.listAllRuns(50),
    staleTime: 15_000,
  });

  const { data: pipelineStats } = useQuery({
    queryKey: ['mpe', 'stats'],
    queryFn: () => mutationEngine.getPipelineStats(),
    staleTime: 30_000,
  });

  const executorSummary = mutationEngine.getExecutorCategorySummary();
  const totalExecutors = mutationEngine.getExecutorCount();

  const { data: latestScan } = useQuery({
    queryKey: ['evolution-mesh', 'latest-scan'],
    queryFn: () => integrityService.getLatestScan(),
    retry: 1,
    staleTime: 30_000,
  });

  const { data: snapshots = [] } = useQuery({
    queryKey: ['evolution-mesh', 'snapshots'],
    queryFn: () => snapshotService.listSnapshots(10),
    retry: 1,
    staleTime: 30_000,
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['evolution-mesh', 'metrics'],
    queryFn: () => telemetryService.getMetrics(20),
    retry: 1,
    staleTime: 30_000,
  });

  // ── Selected mutation detail ──
  const { data: selectedRuns = [] } = useQuery({
    queryKey: ['mpe', 'runs', selectedMutation],
    queryFn: () => selectedMutation ? mutationEngine.listRuns(selectedMutation) : Promise.resolve([]),
    enabled: !!selectedMutation,
    staleTime: 10_000,
  });

  // ── Mutations ──
  const generateProposalsFromFindings = async (findings: any[]) => {
    const actionable = findings.filter((f: any) => f.severity !== 'info' || (f.priority ?? 0) >= 5);
    const top = actionable.slice(0, 5);
    const results: string[] = [];
    for (const finding of top) {
      const artifactResult = await mutationEngine.createArtifact({
        actorType: 'integrity_scan',
        category: finding.evolutionType ?? finding.category ?? 'resilience',
        intentSummary: finding.message,
        diffData: { suggested_fix: finding.suggestedFix, severity: finding.severity, priority: finding.priority },
      });
      if (artifactResult.success && artifactResult.artifact) {
        const proposalResult = await mutationEngine.createProposal({
          artifactId: artifactResult.artifact.id,
          hypothesis: finding.suggestedFix ?? finding.message,
          riskScore: finding.severity === 'error' ? 0.7 : finding.severity === 'warning' ? 0.4 : 0.2,
          category: finding.evolutionType ?? 'resilience',
        });
        if (proposalResult.success) results.push(finding.message.slice(0, 50));
      }
    }
    return results;
  };

  const integrityScanMutation = useMutation({
    mutationFn: async () => {
      const result = await integrityService.runIntegrityScan();
      if (!result.success) throw new Error(result.error ?? 'Scan failed');
      // Auto-generate proposals from actionable findings
      const findings = result.findings ?? [];
      const proposalResults = await generateProposalsFromFindings(findings);
      return { ...result, proposalResults };
    },
    onSuccess: (result) => {
      setScanResults(result.findings ?? []);
      const proposalCount = result.proposalResults?.length ?? 0;
      toast.success(
        `Scan complete: ${result.summary?.total ?? 0} findings → ${proposalCount} proposals generated`
      );
      invalidateAll();
    },
    onError: (err: any) => {
      toast.error(`Scan failed: ${err?.message ?? 'Unknown error'}`);
    },
  });

  const generateProposalsMutation = useMutation({
    mutationFn: (findings: any[]) => generateProposalsFromFindings(findings),
    onSuccess: (results) => {
      toast.success(`Generated ${results.length} mutation proposals from scan findings`);
      invalidateAll();
    },
    onError: () => {
      toast.error('Failed to generate proposals');
    },
  });

  const resetPipelineMutation = useMutation({
    mutationFn: async () => {
      // Clear pipeline data but preserve learnings (shared rules, skill data, immune learnings)
      const tables = ['mutation_runs', 'verification_scans', 'mutation_proposals', 'change_artifacts', 'integrity_findings', 'integrity_scan_runs'];
      for (const table of tables) {
        await (supabase.from(table as any).delete() as any).neq('id', '__never__');
      }
      // Clear evolution runs but keep evolution_circuit intact
      await (supabase.from('evolution_runs' as any).delete() as any).neq('run_id', '__never__');
      // Clear telemetry but NOT immune_metrics or shared rules
      await (supabase.from('evolution_telemetry' as any).delete() as any).neq('id', '__never__');
    },
    onSuccess: () => {
      setScanResults([]);
      setSelectedMutation(null);
      toast.success('Pipeline reset — proposals, artifacts, and runs cleared. Learnings preserved.');
      invalidateAll();
    },
    onError: (err: any) => {
      toast.error(`Reset failed: ${err?.message ?? 'Unknown error'}`);
    },
  });

  const snapshotMutation = useMutation({
    mutationFn: () => snapshotService.createSnapshot('production_baseline'),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Snapshot created');
        invalidateAll();
      }
    },
  });

  const shadowMutation = useMutation({
    mutationFn: (mutationId: string) => mutationEngine.runShadowEvaluation(mutationId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Shadow run complete — confidence: ${((result.run?.confidence_score ?? 0) * 100).toFixed(0)}%`);
        invalidateAll();
      } else {
        toast.error(result.error);
      }
    },
  });

  const gateMutation = useMutation({
    mutationFn: (mutationId: string) => mutationEngine.evaluateGate(mutationId),
    onSuccess: (result) => {
      if (result.passed) {
        toast.success(result.reason);
      } else {
        toast.warning(result.reason);
      }
      invalidateAll();
    },
  });

  const canaryMutation = useMutation({
    mutationFn: (mutationId: string) => mutationEngine.advanceCanary(mutationId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Canary advanced to ${result.canaryPct}%`);
        invalidateAll();
      } else {
        toast.error(result.error);
      }
    },
  });

  const rollbackMutation = useMutation({
    mutationFn: (mutationId: string) => mutationEngine.rollbackMutation(mutationId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Mutation rolled back to stable state');
        invalidateAll();
      }
    },
  });

  const flagMutation = useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      mutationEngine.setMPEFlag(key, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mpe', 'flags'] });
    },
  });

  const modernizerHook = useModernizer();
  const abortEvolveMutation = useMutation({
    mutationFn: () => modernizerHook.evolve.mutateAsync({ target: 'abort' }),
    onSuccess: () => {
      toast.success('Evolution aborted — old proposals cleared');
      invalidateAll();
    },
    onError: (err: any) => {
      toast.error(`Abort failed: ${err?.message ?? 'Unknown error'}`);
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Evolution Mesh</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Mutation Promotion Engine — Artifacts → Shadow → Gate → Canary → Verify
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="ghost"
                onClick={invalidateAll}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
              <Badge variant="outline" className="text-[10px]">
                {pipelineStats?.totalArtifacts ?? 0} artifacts
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {pipelineStats?.totalProposals ?? 0} proposals
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {pipelineStats?.totalScans ?? 0} scans
              </Badge>
            </div>
          </div>

          {/* Top-level Controls */}
          <div className="flex flex-wrap gap-2">
            {/* Reset Pipeline — fresh state */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={resetPipelineMutation.isPending}
                  className="border-amber-500/40 text-amber-500 hover:bg-amber-500/10 gap-1.5"
                >
                  {resetPipelineMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5" />
                  )}
                  Reset Pipeline
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset evolution pipeline to fresh state?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This clears all proposals, artifacts, shadow runs, verifications, and scan results.
                    <strong className="block mt-2 text-foreground">Preserved:</strong> Shared rules, immune learnings, skill data, executor training, and knowledge packs.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => resetPipelineMutation.mutate()}
                    className="bg-amber-600 text-white hover:bg-amber-700 w-full sm:w-auto"
                  >
                    {resetPipelineMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RotateCcw className="w-3 h-3 mr-1" />}
                    Confirm Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Abort Evolution */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={abortEvolveMutation.isPending}
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 gap-1.5"
                >
                  {abortEvolveMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <XOctagon className="w-3.5 h-3.5" />
                  )}
                  Abort Evolution
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle>Abort all active evolution?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This terminates any active evolution run, including stuck cycles from the terminal
                    that may not appear in the proposals section. All in-progress shadow or canary
                    stages will be halted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => abortEvolveMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
                  >
                    {abortEvolveMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <XOctagon className="w-3 h-3 mr-1" />}
                    Confirm Abort
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Pipeline Stats Bar */}
        {proposals.length > 0 && <PipelineStatsBar proposals={proposals} />}

        {/* Feature Flags */}
        <Card className="p-3 sm:p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> MPE Controls
          </h3>
          {flagsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {MPE_FLAG_CONFIG.map((flag) => (
                <div key={flag.key} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="min-w-0">
                    <div className="text-xs font-medium flex items-center gap-1.5">
                      <span className="truncate">{flag.label}</span>
                      {flag.danger && (
                        <AlertTriangle className="w-3 h-3 text-destructive/60 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{flag.desc}</div>
                  </div>
                  <Switch
                    checked={flags?.[flag.flagKey] ?? false}
                    onCheckedChange={(v) => flagMutation.mutate({ key: flag.key, enabled: v })}
                    className={`flex-shrink-0 ${flag.danger ? 'data-[state=checked]:bg-destructive' : ''}`}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Tabbed Views */}
        <Tabs defaultValue="pipeline" className="w-full">
          <TabsList className="w-full flex overflow-x-auto gap-0.5 p-1">
            <TabsTrigger value="pipeline" className="text-xs gap-1 flex-1 min-w-0 px-2 sm:px-3">
              <Rocket className="w-3 h-3 flex-shrink-0" /> <span className="hidden sm:inline">Pipeline</span>
            </TabsTrigger>
            <TabsTrigger value="artifacts" className="text-xs gap-1 flex-1 min-w-0 px-2 sm:px-3">
              <Package className="w-3 h-3 flex-shrink-0" /> <span className="hidden sm:inline">Artifacts</span>
            </TabsTrigger>
            <TabsTrigger value="shadow" className="text-xs gap-1 flex-1 min-w-0 px-2 sm:px-3">
              <FlaskConical className="w-3 h-3 flex-shrink-0" /> <span className="hidden sm:inline">Shadow A/B</span>
            </TabsTrigger>
            <TabsTrigger value="verification" className="text-xs gap-1 flex-1 min-w-0 px-2 sm:px-3">
              <Shield className="w-3 h-3 flex-shrink-0" /> <span className="hidden sm:inline">Verify</span>
            </TabsTrigger>
            <TabsTrigger value="ops" className="text-xs gap-1 flex-1 min-w-0 px-2 sm:px-3">
              <Gauge className="w-3 h-3 flex-shrink-0" /> <span className="hidden sm:inline">Ops</span>
            </TabsTrigger>
          </TabsList>

          {/* ── Pipeline Tab ── */}
          <TabsContent value="pipeline" className="space-y-3 mt-4">
            {proposalsLoading ? (
              <CardSkeleton count={3} />
            ) : proposals.length === 0 ? (
              <EmptyState
                icon={Rocket}
                title="No mutations in the pipeline"
                description="Mutations appear here when executors create change artifacts and proposals. Enable 'Mutation Intake' above to start accepting proposals."
              />
            ) : (
              proposals.map((p) => (
                <Card
                  key={p.id}
                  className={`p-3 sm:p-4 space-y-2 cursor-pointer transition-all hover:bg-muted/20 ${
                    selectedMutation === p.id ? 'ring-1 ring-primary/50 bg-muted/10' : ''
                  }`}
                  onClick={() => setSelectedMutation(p.id === selectedMutation ? null : p.id)}
                >
                  {/* Title row — stack on mobile */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <GateStateBadge state={p.gate_state} />
                      <span className="text-xs sm:text-sm font-medium break-words line-clamp-2 sm:line-clamp-1">
                        {p.hypothesis ?? 'Unnamed mutation'}
                      </span>
                    </div>
                    <PipelineStages proposal={p} />
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      Risk: {((p.risk_score ?? 0) * 100).toFixed(0)}%
                    </span>
                    {(p.metadata as any)?.executor_count && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-primary flex-shrink-0" />
                        {(p.metadata as any).executor_count} executors
                      </span>
                    )}
                    {(p.metadata as any)?.category && (
                      <Badge variant="outline" className="text-[9px] sm:text-[10px] capitalize">
                        {(p.metadata as any).category}
                      </Badge>
                    )}
                    {p.gate_state === 'canary' && (
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3 flex-shrink-0" />
                        Canary: {p.canary_pct}%
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>
                    {p.promoted_at && (
                      <Badge variant="outline" className="text-[9px] sm:text-[10px] bg-primary/5">
                        Promoted {new Date(p.promoted_at).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>

                  {/* Canary progress bar */}
                  {p.gate_state === 'canary' && (
                    <div className="pt-1">
                      <Progress value={p.canary_pct} className="h-1.5" />
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>Rollout: {p.canary_pct}%</span>
                        <span>Next: {p.canary_pct < 100 ? [5, 25, 50, 100].find(s => s > p.canary_pct) ?? 100 : 'Fully deployed'}%</span>
                      </div>
                    </div>
                  )}

                  {/* Selected Executors */}
                  {selectedMutation === p.id && (p.metadata as any)?.selected_executors?.length > 0 && (
                    <div className="pt-2 space-y-1.5">
                      <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Cpu className="w-3 h-3 flex-shrink-0" /> Assigned Executors ({(p.metadata as any).selected_executors.length})
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {((p.metadata as any).selected_executors as Array<{ id: string; module: string; category: string }>).map((ex) => (
                          <Badge key={ex.id} variant="outline" className="text-[9px] sm:text-[10px] font-mono gap-1 max-w-full">
                            <span className="text-primary truncate">{ex.module}</span>
                            <span className="text-muted-foreground truncate">/ {ex.id.slice(0, 12)}</span>
                          </Badge>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Same executor fleet used in Immunity Mesh training — skills transfer to evolution cycles.
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {selectedMutation === p.id && (
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 pt-3 border-t border-border/30">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={(e) => { e.stopPropagation(); shadowMutation.mutate(p.id); }}
                        disabled={shadowMutation.isPending || p.gate_state === 'promoted'}
                      >
                        {shadowMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <FlaskConical className="w-3 h-3 mr-1 flex-shrink-0" />}
                        <span className="truncate">Shadow</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={(e) => { e.stopPropagation(); gateMutation.mutate(p.id); }}
                        disabled={gateMutation.isPending || p.gate_state === 'promoted'}
                      >
                        {gateMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Shield className="w-3 h-3 mr-1 flex-shrink-0" />}
                        <span className="truncate">Gate</span>
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs"
                        onClick={(e) => { e.stopPropagation(); canaryMutation.mutate(p.id); }}
                        disabled={canaryMutation.isPending || !['passed', 'canary'].includes(p.gate_state)}
                      >
                        {canaryMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <ChevronRight className="w-3 h-3 mr-1 flex-shrink-0" />}
                        <span className="truncate">Canary</span>
                      </Button>

                      {/* Rollback with confirmation */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs"
                            onClick={(e) => e.stopPropagation()}
                            disabled={rollbackMutation.isPending || p.gate_state === 'rolled_back'}
                          >
                            <RotateCcw className="w-3 h-3 mr-1 flex-shrink-0" /> <span className="truncate">Rollback</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg" onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Rollback this mutation?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will revert the mutation to its pre-promote state and mark the artifact as rolled back. 
                              This action is logged in the audit trail.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => rollbackMutation.mutate(p.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
                            >
                              {rollbackMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                              Confirm Rollback
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {/* Abort Evolution for stale proposals */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-destructive/40 text-destructive hover:bg-destructive/10 col-span-2 sm:col-span-1"
                            onClick={(e) => e.stopPropagation()}
                            disabled={abortEvolveMutation.isPending || p.gate_state === 'promoted'}
                          >
                            <XOctagon className="w-3 h-3 mr-1 flex-shrink-0" /> <span className="truncate">Abort</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg" onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Abort this evolution?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This calls modernizer.evolve abort to terminate the active evolution run associated with this proposal.
                              Any in-progress shadow or canary stages will be halted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => abortEvolveMutation.mutate()}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
                            >
                              {abortEvolveMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <XOctagon className="w-3 h-3 mr-1" />}
                              Confirm Abort
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}

                  {/* Shadow runs detail */}
                  {selectedMutation === p.id && selectedRuns.length > 0 && (
                    <div className="pt-3 space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <FlaskConical className="w-3 h-3 flex-shrink-0" /> Shadow Runs ({selectedRuns.length})
                      </h4>
                      {selectedRuns.map((run) => (
                        <div key={run.id} className="p-2.5 sm:p-3 rounded-lg bg-muted/20 border border-border/20 text-xs space-y-2 overflow-hidden">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="font-medium">
                              Confidence: <strong className={run.confidence_score >= 0.75 ? 'text-emerald-400' : 'text-amber-400'}>
                                {((run.confidence_score ?? 0) * 100).toFixed(0)}%
                              </strong>
                            </span>
                            <span className="text-muted-foreground flex items-center gap-1 text-[10px] sm:text-xs">
                              <Clock className="w-3 h-3 flex-shrink-0" /> {run.run_duration_ms}ms
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
                            {Object.entries(run.metrics_delta as Record<string, number>).map(([k, v]) => (
                              <MetricDelta
                                key={k}
                                label={k.replace(/_/g, ' ')}
                                value={v}
                                inverse={k === 'error_rate' || k === 'latency_ms' || k === 'memory_mb'}
                              />
                            ))}
                          </div>
                          {(run.regressions as any[])?.length > 0 && (
                            <div className="flex items-start gap-1.5 text-destructive bg-destructive/10 rounded px-2 py-1 text-[10px] break-words">
                              <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              <span className="break-words">Regressions: {(run.regressions as any[]).map((r: any) => r.metric.replace(/_/g, ' ')).join(', ')}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          {/* ── Artifacts Tab ── */}
          <TabsContent value="artifacts" className="space-y-3 mt-4">
            {artifactsLoading ? (
              <CardSkeleton count={3} />
            ) : artifacts.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No change artifacts recorded"
                description="Artifacts are created when executors apply changes to the system. Each artifact captures a before/after snapshot and diff for deterministic tracking."
              />
            ) : (
              artifacts.map((a) => (
                <Card key={a.id} className="p-3 sm:p-4 space-y-2 overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg flex-shrink-0">{CATEGORY_ICONS[a.category] ?? '📦'}</span>
                      <span className="text-xs sm:text-sm font-medium break-words line-clamp-2">{a.intent_summary ?? 'No summary'}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className="text-[9px] sm:text-[10px] capitalize">{a.category}</Badge>
                      <GateStateBadge state={a.status} />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 flex-shrink-0" /> {a.actor_type}
                      {a.actor_id ? `/${a.actor_id.slice(0, 8)}` : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 flex-shrink-0" /> {new Date(a.created_at).toLocaleString()}
                    </span>
                  </div>
                  {a.diff_data && Object.keys(a.diff_data).length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors py-1">
                        <GitCompare className="w-3 h-3 inline mr-1" /> View Diff
                      </summary>
                      <pre className="mt-2 p-2 sm:p-3 rounded-lg bg-muted/30 border border-border/20 overflow-x-auto max-h-48 text-[10px] sm:text-xs font-mono whitespace-pre-wrap break-all">
                        {JSON.stringify(a.diff_data, null, 2)}
                      </pre>
                    </details>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          {/* ── Shadow A/B Tab ── */}
          <TabsContent value="shadow" className="space-y-4 mt-4">
            {/* Configuration */}
            <Card className="p-3 sm:p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-primary" /> Gate Configuration
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-xs">
                {[
                  { label: 'Min Shadow Runs', value: '2', desc: 'Before gate evaluation' },
                  { label: 'Min Confidence', value: '75%', desc: 'Average across runs' },
                  { label: 'Max Error Δ', value: '2%', desc: 'Blocks on increase' },
                  { label: 'Max Latency Δ', value: '50ms', desc: 'Blocks on increase' },
                ].map(c => (
                  <div key={c.label} className="p-2 sm:p-2.5 rounded-lg bg-muted/30 border border-border/20">
                    <div className="text-muted-foreground text-[9px] sm:text-[10px]">{c.label}</div>
                    <div className="font-mono font-semibold text-sm">{c.value}</div>
                    <div className="text-muted-foreground/60 text-[8px] sm:text-[9px] mt-0.5">{c.desc}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Canary Stages */}
            <Card className="p-3 sm:p-4">
              <h3 className="font-semibold text-sm mb-3">Canary Rollout Stages</h3>
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs flex-wrap">
                {[5, 25, 50, 100].map((pct, i) => (
                  <div key={pct} className="flex items-center gap-1.5 sm:gap-2">
                    <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-muted/30 border border-border/20 font-mono font-semibold text-xs sm:text-sm">
                      {pct}%
                    </div>
                    {i < 3 && <ArrowRight className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />}
                  </div>
                ))}
              </div>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-2">
                Each stage requires manual advancement unless auto-promotion is enabled. Auto-rollback triggers on error rate spikes.
              </p>
            </Card>

            {/* All Shadow Runs */}
            <Card className="p-3 sm:p-4 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Shadow Run History
              </h3>
              {runsLoading ? (
                <CardSkeleton count={2} />
              ) : allRuns.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No shadow runs yet. Select a proposal in the Pipeline tab and click "Run Shadow" to start A/B evaluation.
                </p>
              ) : (
                <div className="space-y-2">
                  {allRuns.map((run) => (
                    <div key={run.id} className="p-2.5 sm:p-3 rounded-lg bg-muted/20 border border-border/20 text-xs space-y-2 overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[9px] sm:text-[10px] font-mono">
                            {run.mutation_id.slice(0, 8)}
                          </Badge>
                          <span className="font-medium text-[11px] sm:text-xs">
                            Confidence: <strong className={run.confidence_score >= 0.75 ? 'text-emerald-400' : 'text-amber-400'}>
                              {((run.confidence_score ?? 0) * 100).toFixed(0)}%
                            </strong>
                          </span>
                        </div>
                        <span className="text-muted-foreground flex items-center gap-1 text-[10px] sm:text-xs">
                          <Clock className="w-3 h-3 flex-shrink-0" /> {run.run_duration_ms}ms
                          <span className="ml-1 sm:ml-2">{new Date(run.created_at).toLocaleDateString()}</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
                        {Object.entries(run.metrics_delta as Record<string, number>).map(([k, v]) => (
                          <MetricDelta
                            key={k}
                            label={k.replace(/_/g, ' ')}
                            value={v}
                            inverse={k === 'error_rate' || k === 'latency_ms' || k === 'memory_mb'}
                          />
                        ))}
                      </div>
                      {(run.regressions as any[])?.length > 0 && (
                        <div className="flex items-start gap-1.5 text-destructive text-[10px] break-words">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          <span className="break-words">{(run.regressions as any[]).map((r: any) => r.metric.replace(/_/g, ' ')).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ── Verification Tab ── */}
          <TabsContent value="verification" className="space-y-3 mt-4">
            {verificationsLoading ? (
              <CardSkeleton count={2} />
            ) : verifications.length === 0 ? (
              <EmptyState
                icon={Shield}
                title="No verification scans"
                description="Verification scans trigger automatically after a mutation reaches 100% canary rollout. They detect unintended structural gaps introduced by the promotion."
              />
            ) : (
              verifications.map((v) => (
                <Card key={v.id} className="p-3 sm:p-4 space-y-2 overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {v.status === 'clean' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      )}
                      <span className="text-xs sm:text-sm font-medium break-words">
                        {v.status === 'clean' ? 'Clean — No gaps detected' : `${v.gaps_found} structural gap${v.gaps_found !== 1 ? 's' : ''} detected`}
                      </span>
                    </div>
                    <Badge variant={v.status === 'clean' ? 'default' : 'outline'} className="text-[10px] flex-shrink-0 self-start sm:self-auto">
                      {v.status === 'clean' ? '✓ Clean' : '⚠ Gaps'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
                    <span>Mutation: {v.mutation_id.slice(0, 8)}</span>
                    <span>Gaps: {v.gaps_found}</span>
                    <span>Tasks: {v.tasks_created}</span>
                    <span>{v.completed_at ? new Date(v.completed_at).toLocaleString() : 'Running...'}</span>
                  </div>
                  {v.scan_results && Object.keys(v.scan_results).length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground py-1">
                        View scan details
                      </summary>
                      <pre className="mt-2 p-2 sm:p-3 rounded-lg bg-muted/30 border border-border/20 overflow-x-auto max-h-48 text-[10px] sm:text-xs font-mono whitespace-pre-wrap break-all">
                        {JSON.stringify(v.scan_results, null, 2)}
                      </pre>
                    </details>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          {/* ── Ops Tab ── */}
          <TabsContent value="ops" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="p-3 sm:p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                  <h3 className="font-semibold text-sm">Integrity Scan</h3>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Run structural integrity checks across the system.</p>
                <Button
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => integrityScanMutation.mutate()}
                  disabled={integrityScanMutation.isPending}
                >
                  {integrityScanMutation.isPending ? (
                    <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Scanning...</>
                  ) : (
                    <><Shield className="w-3 h-3 mr-1" /> Run Scan</>
                  )}
                </Button>
                {latestScan && (
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground">
                    Last: {new Date(latestScan.created_at).toLocaleString()}
                  </div>
                )}
              </Card>

              <Card className="p-3 sm:p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary flex-shrink-0" />
                  <h3 className="font-semibold text-sm">Snapshot</h3>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Capture current system state for diff comparison.</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => snapshotMutation.mutate()}
                  disabled={snapshotMutation.isPending}
                >
                  {snapshotMutation.isPending ? (
                    <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Creating...</>
                  ) : (
                    <><Play className="w-3 h-3 mr-1" /> Create Snapshot</>
                  )}
                </Button>
              </Card>

              <Card className="p-3 sm:p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <h3 className="font-semibold text-sm">Generate Diff</h3>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Compare two snapshots to see structural changes.</p>
                <Button size="sm" variant="outline" className="w-full text-xs" disabled={snapshots.length < 2}
                  onClick={async () => {
                    if (snapshots.length < 2) return;
                    const { diffService } = await import('@/lib/evolution-mesh/diff-service');
                    const from = snapshots[1] as any;
                    const to = snapshots[0] as any;
                    const result = await diffService.generateDiff(from.id, to.id, {
                      summary: { from_type: from.type, to_type: to.type },
                    });
                    if (result.success) {
                      toast.success('Diff generated — check Ops tab for results');
                    } else {
                      toast.error(`Diff failed: ${result.error}`);
                    }
                  }}
                >
                  <GitCompare className="w-3 h-3 mr-1" />
                  {snapshots.length < 2 ? `Need ${2 - snapshots.length} more` : 'Generate Diff'}
                </Button>
              </Card>

              <Card className="p-3 sm:p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-primary flex-shrink-0" />
                  <h3 className="font-semibold text-sm">Executor Fleet</h3>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Executors</span>
                    <span className="font-mono font-semibold">{totalExecutors}</span>
                  </div>
                  {Object.entries(executorSummary).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([cat, count]) => (
                    <div key={cat} className="flex justify-between">
                      <span className="text-muted-foreground capitalize truncate mr-2">{cat.replace(/_/g, ' ')}</span>
                      <span className="font-mono flex-shrink-0">{count}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">
                  Same fleet trained in Immunity Mesh — specialties drive executor selection per evolution category.
                </p>
              </Card>
            </div>

            {/* Scan Results */}
            {scanResults.length > 0 && (
              <Card className="p-3 sm:p-4 space-y-3 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-foreground flex-shrink-0" />
                    <h3 className="font-semibold text-sm">Scan Results</h3>
                  </div>
                  <Badge variant="outline" className="text-xs self-start sm:self-auto">{scanResults.length} findings</Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
                    {['security', 'performance', 'stability', 'feature', 'cleanup', 'resilience'].map(type => {
                      const count = scanResults.filter((f: any) => f.evolutionType === type).length;
                      if (count === 0) return null;
                      return (
                        <Badge key={type} variant="outline" className="text-[9px] sm:text-[10px] capitalize">
                          {type}: {count}
                        </Badge>
                      );
                    })}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => generateProposalsMutation.mutate(scanResults)}
                    disabled={generateProposalsMutation.isPending}
                    className="gap-1 text-xs w-full sm:w-auto"
                  >
                    {generateProposalsMutation.isPending ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</>
                    ) : (
                      <><Rocket className="w-3 h-3" /> Generate Proposals</>
                    )}
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {scanResults.map((finding: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs sm:text-sm p-2 sm:p-2.5 rounded-lg bg-muted/30 border border-border/20">
                      {finding.severity === 'error' ? (
                        <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      ) : finding.severity === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-[10px] sm:text-xs">[{finding.category}]</span>
                          {finding.evolutionType && (
                            <Badge variant="outline" className="text-[8px] sm:text-[9px] capitalize">{finding.evolutionType}</Badge>
                          )}
                          {finding.priority && finding.priority >= 7 && (
                            <Badge variant="destructive" className="text-[8px] sm:text-[9px]">P{finding.priority}</Badge>
                          )}
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 break-words">{finding.message}</p>
                        {finding.suggestedFix && (
                          <p className="text-[9px] sm:text-[10px] text-primary/80 mt-1 break-words">💡 {finding.suggestedFix}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Snapshots */}
            <Card className="p-3 sm:p-4 space-y-3">
              <h3 className="font-semibold text-sm">Recent Snapshots</h3>
              {snapshots.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No snapshots yet. Create one above to start tracking state.</p>
              ) : (
                <div className="space-y-1">
                  {snapshots.slice(0, 5).map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between text-xs p-2 sm:p-2.5 rounded-lg bg-muted/20 border border-border/20 gap-2">
                      <span className="font-mono truncate">{s.label ?? s.id?.slice(0, 8)}</span>
                      <span className="text-muted-foreground text-[10px] sm:text-xs whitespace-nowrap">
                        {s.created_at ? new Date(s.created_at).toLocaleString() : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Telemetry */}
            <Card className="p-3 sm:p-4 space-y-3">
              <h3 className="font-semibold text-sm">Telemetry Log</h3>
              {metrics.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No metrics recorded yet. Actions in the pipeline generate telemetry automatically.</p>
              ) : (
                <div className="space-y-1">
                  {metrics.slice(0, 10).map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/20 gap-2">
                      <Badge variant="secondary" className="text-[9px] sm:text-[10px] truncate max-w-[50%]">{m.event_type}</Badge>
                      <span className="text-muted-foreground text-[10px] sm:text-xs whitespace-nowrap">
                        {m.created_at ? new Date(m.created_at).toLocaleString() : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
