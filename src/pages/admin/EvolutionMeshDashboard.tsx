/**
 * Evolution Mesh Dashboard — Admin-only, isolated route
 * Fetches data client-side. If fetch fails, shows fallback UI.
 * Never blocks main site rendering.
 */

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Play, GitCompare, Rocket, Activity, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrityService } from '@/lib/evolution-mesh/integrity-service';
import { snapshotService } from '@/lib/evolution-mesh/snapshot-service';
import { telemetryService } from '@/lib/evolution-mesh/telemetry-service';
import { toast } from 'sonner';

export default function EvolutionMeshDashboard() {
  const queryClient = useQueryClient();
  const [scanResults, setScanResults] = useState<any[]>([]);

  // Fetch latest scan — client-side only, fallback on error
  const { data: latestScan, isLoading: scanLoading } = useQuery({
    queryKey: ['evolution-mesh', 'latest-scan'],
    queryFn: () => integrityService.getLatestScan(),
    retry: 1,
    staleTime: 30_000,
  });

  // Fetch snapshots
  const { data: snapshots = [] } = useQuery({
    queryKey: ['evolution-mesh', 'snapshots'],
    queryFn: () => snapshotService.listSnapshots(10),
    retry: 1,
    staleTime: 30_000,
  });

  // Fetch metrics
  const { data: metrics = [] } = useQuery({
    queryKey: ['evolution-mesh', 'metrics'],
    queryFn: () => telemetryService.getMetrics(20),
    retry: 1,
    staleTime: 30_000,
  });

  // Run integrity scan mutation
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
    onError: () => toast.error('Scan failed unexpectedly'),
  });

  // Create snapshot mutation
  const snapshotMutation = useMutation({
    mutationFn: () => snapshotService.createSnapshot('manual-snapshot'),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Snapshot created');
        queryClient.invalidateQueries({ queryKey: ['evolution-mesh', 'snapshots'] });
      } else {
        toast.error(`Snapshot failed: ${result.error}`);
      }
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Evolution Mesh</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Governed promotion pipeline — Shadow → Integrity → Promote
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            SPARTA Epoch
          </Badge>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-sm">Integrity Scan</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Run structural checks. Never mutates state.
            </p>
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
              <h3 className="font-semibold text-sm">Shadow Run</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Simulate changes without applying to production.
            </p>
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
              <GitCompare className="w-5 h-5 text-accent-foreground" />
              <h3 className="font-semibold text-sm">Generate Diff</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Compare snapshots to preview changes.
            </p>
            <Button size="sm" variant="outline" className="w-full" disabled>
              <GitCompare className="w-3 h-3 mr-1" /> Needs 2+ Snapshots
            </Button>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-accent-foreground" />
              <h3 className="font-semibold text-sm">Promote</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Push validated shadow to production (gated).
            </p>
            <Button size="sm" variant="outline" className="w-full" disabled>
              <Rocket className="w-3 h-3 mr-1" /> Requires Scan Pass
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
                    <span className="font-medium">[{finding.category}]</span>{' '}
                    {finding.message}
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

        {/* Metrics */}
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
      </div>
    </AdminLayout>
  );
}
