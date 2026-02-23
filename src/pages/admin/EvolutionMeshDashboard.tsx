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
import {
  Shield, Play, GitCompare, Rocket, Activity, AlertTriangle, CheckCircle,
  Loader2, RotateCcw, ChevronRight, FlaskConical, Eye, Zap, ArrowRight,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrityService } from '@/lib/evolution-mesh/integrity-service';
import { snapshotService } from '@/lib/evolution-mesh/snapshot-service';
import { telemetryService } from '@/lib/evolution-mesh/telemetry-service';
import { mutationEngine } from '@/lib/evolution-mesh/mutation-engine';
import type { MutationProposal, MutationRun, ChangeArtifact, VerificationScan } from '@/lib/evolution-mesh/mutation-engine';
import { toast } from 'sonner';

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

function GateStateBadge({ state }: { state: string }) {
  return (
    <Badge className={`text-xs ${GATE_COLORS[state] ?? 'bg-muted text-muted-foreground'}`}>
      {state.replace(/_/g, ' ')}
    </Badge>
  );
}

// ── Pipeline Stage Visualizer ──────────────────────────────

function PipelineStages({ proposal }: { proposal: MutationProposal }) {
  const stages = ['pending', 'shadow_running', 'passed', 'canary', 'promoted'];
  const currentIdx = stages.indexOf(proposal.gate_state);
  const failed = proposal.gate_state === 'failed' || proposal.gate_state === 'rolled_back';

  return (
    <div className="flex items-center gap-1 text-xs">
      {stages.map((stage, i) => (
        <div key={stage} className="flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full ${
              failed
                ? 'bg-destructive/40'
                : i < currentIdx
                ? 'bg-primary'
                : i === currentIdx
                ? 'bg-primary animate-pulse'
                : 'bg-muted-foreground/30'
            }`}
          />
          {i < stages.length - 1 && (
            <ArrowRight className="w-2.5 h-2.5 text-muted-foreground/40" />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────

export default function EvolutionMeshDashboard() {
  const queryClient = useQueryClient();
  const [selectedMutation, setSelectedMutation] = useState<string | null>(null);
  const [scanResults, setScanResults] = useState<any[]>([]);

  // ── Data queries ──
  const { data: flags, isLoading: flagsLoading } = useQuery({
    queryKey: ['mpe', 'flags'],
    queryFn: () => mutationEngine.getMPEFlags(),
    staleTime: 10_000,
  });

  const { data: artifacts = [] } = useQuery({
    queryKey: ['mpe', 'artifacts'],
    queryFn: () => mutationEngine.listArtifacts(30),
    staleTime: 15_000,
  });

  const { data: proposals = [] } = useQuery({
    queryKey: ['mpe', 'proposals'],
    queryFn: () => mutationEngine.listProposals(30),
    staleTime: 15_000,
  });

  const { data: verifications = [] } = useQuery({
    queryKey: ['mpe', 'verifications'],
    queryFn: () => mutationEngine.listVerificationScans(undefined, 20),
    staleTime: 15_000,
  });

  const { data: pipelineStats } = useQuery({
    queryKey: ['mpe', 'stats'],
    queryFn: () => mutationEngine.getPipelineStats(),
    staleTime: 30_000,
  });

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
  const integrityScanMutation = useMutation({
    mutationFn: () => integrityService.runIntegrityScan(),
    onSuccess: (result) => {
      if (result.success) {
        setScanResults(result.findings ?? []);
        toast.success('Integrity scan completed');
        queryClient.invalidateQueries({ queryKey: ['evolution-mesh'] });
      } else {
        toast.error(`Scan failed: ${result.error}`);
      }
    },
  });

  const snapshotMutation = useMutation({
    mutationFn: () => snapshotService.createSnapshot('manual-snapshot'),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Snapshot created');
        queryClient.invalidateQueries({ queryKey: ['evolution-mesh', 'snapshots'] });
      }
    },
  });

  const shadowMutation = useMutation({
    mutationFn: (mutationId: string) => mutationEngine.runShadowEvaluation(mutationId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Shadow run complete — confidence: ${((result.run?.confidence_score ?? 0) * 100).toFixed(0)}%`);
        queryClient.invalidateQueries({ queryKey: ['mpe'] });
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
      queryClient.invalidateQueries({ queryKey: ['mpe'] });
    },
  });

  const canaryMutation = useMutation({
    mutationFn: (mutationId: string) => mutationEngine.advanceCanary(mutationId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Canary advanced to ${result.canaryPct}%`);
        queryClient.invalidateQueries({ queryKey: ['mpe'] });
      } else {
        toast.error(result.error);
      }
    },
  });

  const rollbackMutation = useMutation({
    mutationFn: (mutationId: string) => mutationEngine.rollbackMutation(mutationId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Mutation rolled back');
        queryClient.invalidateQueries({ queryKey: ['mpe'] });
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Evolution Mesh</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              MPE v1 — Artifacts → Shadow → Gate → Canary → Verify
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {pipelineStats?.totalArtifacts ?? 0} artifacts
            </Badge>
            <Badge variant="outline" className="text-xs">
              {pipelineStats?.totalProposals ?? 0} proposals
            </Badge>
          </div>
        </div>

        {/* Feature Flags */}
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> MPE Controls
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: 'mpe_mutation_intake', label: 'Mutation Intake', desc: 'Accept new proposals' },
              { key: 'mpe_auto_shadow', label: 'Auto Shadow', desc: 'Auto-run A/B on new proposals' },
              { key: 'mpe_auto_promotion', label: 'Auto Promote', desc: 'Auto-promote passing mutations', danger: true },
              { key: 'mpe_post_verification', label: 'Post-Verify', desc: 'Scan after every promotion' },
            ].map((flag) => (
              <div key={flag.key} className="flex items-center justify-between gap-2 p-2 rounded bg-muted/30">
                <div>
                  <div className="text-xs font-medium">{flag.label}</div>
                  <div className="text-xs text-muted-foreground">{flag.desc}</div>
                </div>
                <Switch
                  checked={(flags as any)?.[flag.key.replace('mpe_', '').replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())] ?? false}
                  onCheckedChange={(v) => flagMutation.mutate({ key: flag.key, enabled: v })}
                  className={flag.danger ? 'data-[state=checked]:bg-destructive' : ''}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Tabbed Views */}
        <Tabs defaultValue="pipeline" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pipeline" className="text-xs">Pipeline</TabsTrigger>
            <TabsTrigger value="artifacts" className="text-xs">Artifacts</TabsTrigger>
            <TabsTrigger value="shadow" className="text-xs">Shadow A/B</TabsTrigger>
            <TabsTrigger value="verification" className="text-xs">Verification</TabsTrigger>
            <TabsTrigger value="ops" className="text-xs">Ops</TabsTrigger>
          </TabsList>

          {/* ── Pipeline Tab ── */}
          <TabsContent value="pipeline" className="space-y-3 mt-4">
            {proposals.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground text-sm">
                No mutation proposals yet. Proposals are created when executors generate change artifacts.
              </Card>
            ) : (
              proposals.map((p) => (
                <Card
                  key={p.id}
                  className={`p-4 space-y-2 cursor-pointer transition-colors hover:bg-muted/30 ${
                    selectedMutation === p.id ? 'ring-1 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedMutation(p.id === selectedMutation ? null : p.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GateStateBadge state={p.gate_state} />
                      <span className="text-sm font-medium truncate max-w-[300px]">
                        {p.hypothesis ?? 'Unnamed mutation'}
                      </span>
                    </div>
                    <PipelineStages proposal={p} />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Risk: {((p.risk_score ?? 0) * 100).toFixed(0)}%</span>
                    <span>Canary: {p.canary_pct}%</span>
                    <span>{new Date(p.created_at).toLocaleString()}</span>
                  </div>

                  {/* Actions */}
                  {selectedMutation === p.id && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); shadowMutation.mutate(p.id); }}
                        disabled={shadowMutation.isPending || p.gate_state === 'promoted'}
                      >
                        <FlaskConical className="w-3 h-3 mr-1" /> Run Shadow
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); gateMutation.mutate(p.id); }}
                        disabled={gateMutation.isPending || p.gate_state === 'promoted'}
                      >
                        <Shield className="w-3 h-3 mr-1" /> Evaluate Gate
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); canaryMutation.mutate(p.id); }}
                        disabled={canaryMutation.isPending || !['passed', 'canary'].includes(p.gate_state)}
                      >
                        <ChevronRight className="w-3 h-3 mr-1" /> Advance Canary
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => { e.stopPropagation(); rollbackMutation.mutate(p.id); }}
                        disabled={rollbackMutation.isPending || p.gate_state === 'rolled_back'}
                      >
                        <RotateCcw className="w-3 h-3 mr-1" /> Rollback
                      </Button>
                    </div>
                  )}

                  {/* Shadow runs detail */}
                  {selectedMutation === p.id && selectedRuns.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground">Shadow Runs</h4>
                      {selectedRuns.map((run) => (
                        <div key={run.id} className="p-2 rounded bg-muted/30 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Confidence: <strong>{((run.confidence_score ?? 0) * 100).toFixed(0)}%</strong></span>
                            <span className="text-muted-foreground">{run.run_duration_ms}ms</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {Object.entries(run.metrics_delta as Record<string, number>).map(([k, v]) => (
                              <div key={k} className="flex items-center gap-1">
                                <span className="text-muted-foreground">{k}:</span>
                                <span className={v > 0 ? 'text-destructive' : 'text-emerald-400'}>
                                  {v > 0 ? '+' : ''}{typeof v === 'number' ? v.toFixed(2) : v}
                                </span>
                              </div>
                            ))}
                          </div>
                          {(run.regressions as any[])?.length > 0 && (
                            <div className="flex items-center gap-1 text-destructive">
                              <AlertTriangle className="w-3 h-3" />
                              Regressions: {(run.regressions as any[]).map((r: any) => r.metric).join(', ')}
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
            {artifacts.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground text-sm">
                No change artifacts recorded yet. Artifacts are created when executors apply changes.
              </Card>
            ) : (
              artifacts.map((a) => (
                <Card key={a.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{CATEGORY_ICONS[a.category] ?? '📦'}</span>
                      <span className="text-sm font-medium">{a.intent_summary ?? 'No summary'}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{a.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{a.actor_type}/{a.actor_id ?? 'unknown'}</span>
                    <span>{a.category}</span>
                    <span>{new Date(a.created_at).toLocaleString()}</span>
                  </div>
                  {a.diff_data && Object.keys(a.diff_data).length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        View Diff
                      </summary>
                      <pre className="mt-2 p-2 rounded bg-muted/50 overflow-auto max-h-48 text-xs font-mono">
                        {JSON.stringify(a.diff_data, null, 2)}
                      </pre>
                    </details>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          {/* ── Shadow A/B Tab ── */}
          <TabsContent value="shadow" className="space-y-3 mt-4">
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-primary" /> Shadow A/B Configuration
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2 rounded bg-muted/30">
                  <div className="text-muted-foreground">Min Shadow Runs</div>
                  <div className="font-mono font-semibold">2</div>
                </div>
                <div className="p-2 rounded bg-muted/30">
                  <div className="text-muted-foreground">Min Confidence</div>
                  <div className="font-mono font-semibold">75%</div>
                </div>
                <div className="p-2 rounded bg-muted/30">
                  <div className="text-muted-foreground">Max Error Δ</div>
                  <div className="font-mono font-semibold">2%</div>
                </div>
                <div className="p-2 rounded bg-muted/30">
                  <div className="text-muted-foreground">Max Latency Δ</div>
                  <div className="font-mono font-semibold">50ms</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-2">Canary Stages</h3>
              <div className="flex items-center gap-2 text-xs">
                {[5, 25, 50, 100].map((pct, i) => (
                  <div key={pct} className="flex items-center gap-1">
                    <div className="px-2 py-1 rounded bg-muted/50 font-mono">{pct}%</div>
                    {i < 3 && <ArrowRight className="w-3 h-3 text-muted-foreground/50" />}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* ── Verification Tab ── */}
          <TabsContent value="verification" className="space-y-3 mt-4">
            {verifications.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground text-sm">
                No verification scans yet. They trigger automatically after full promotion.
              </Card>
            ) : (
              verifications.map((v) => (
                <Card key={v.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {v.status === 'clean' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                      <span className="text-sm font-medium">
                        {v.status === 'clean' ? 'Clean' : `${v.gaps_found} gaps detected`}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">{v.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Gaps: {v.gaps_found}</span>
                    <span>Tasks Created: {v.tasks_created}</span>
                    <span>{v.completed_at ? new Date(v.completed_at).toLocaleString() : 'Running...'}</span>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* ── Ops Tab (existing functionality) ── */}
          <TabsContent value="ops" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-sm">Integrity Scan</h3>
                </div>
                <p className="text-xs text-muted-foreground">Run structural checks.</p>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => integrityScanMutation.mutate()}
                  disabled={integrityScanMutation.isPending}
                >
                  {integrityScanMutation.isPending ? (
                    <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Scanning...</>
                  ) : (
                    <><Shield className="w-3 h-3 mr-1" /> Run Scan</>
                  )}
                </Button>
              </Card>

              <Card className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-sm">Snapshot</h3>
                </div>
                <p className="text-xs text-muted-foreground">Capture current system state.</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
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

              <Card className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Generate Diff</h3>
                </div>
                <p className="text-xs text-muted-foreground">Compare snapshots.</p>
                <Button size="sm" variant="outline" className="w-full" disabled>
                  <GitCompare className="w-3 h-3 mr-1" /> Needs 2+ Snapshots
                </Button>
              </Card>

              <Card className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Promote</h3>
                </div>
                <p className="text-xs text-muted-foreground">Push validated changes (gated).</p>
                <Button size="sm" variant="outline" className="w-full" disabled>
                  <Rocket className="w-3 h-3 mr-1" /> Use Pipeline Tab
                </Button>
              </Card>
            </div>

            {/* Scan Results */}
            {scanResults.length > 0 && (
              <Card className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-foreground" />
                  <h3 className="font-semibold">Scan Results</h3>
                </div>
                <div className="space-y-2">
                  {scanResults.map((finding, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm p-2 rounded bg-muted/50">
                      {finding.severity === 'error' ? (
                        <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      ) : finding.severity === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-medium">[{finding.category}]</span> {finding.message}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Snapshots */}
            <Card className="p-4 space-y-3">
              <h3 className="font-semibold text-sm">Recent Snapshots</h3>
              {snapshots.length === 0 ? (
                <p className="text-xs text-muted-foreground">No snapshots yet.</p>
              ) : (
                <div className="space-y-1">
                  {snapshots.slice(0, 5).map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                      <span className="font-mono">{s.label ?? s.id?.slice(0, 8)}</span>
                      <span className="text-muted-foreground">
                        {s.created_at ? new Date(s.created_at).toLocaleString() : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Telemetry */}
            <Card className="p-4 space-y-3">
              <h3 className="font-semibold text-sm">Telemetry Log</h3>
              {metrics.length === 0 ? (
                <p className="text-xs text-muted-foreground">No metrics recorded yet.</p>
              ) : (
                <div className="space-y-1">
                  {metrics.slice(0, 10).map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                      <Badge variant="secondary" className="text-xs">{m.event_type}</Badge>
                      <span className="text-muted-foreground">
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
