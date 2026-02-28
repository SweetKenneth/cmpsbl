/**
 * RollbackPanel — One-click rollback UI for evolution snapshots
 * Shows snapshot history with restore confirmation dialog
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Shield, Clock, CheckCircle, Archive } from 'lucide-react';
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
import { useEvolutionSnapshots, useRestoreSnapshot } from '@/hooks/useEvolutionControlCenter';

function formatAge(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function RollbackPanel() {
  const { data: snapshots = [], isLoading } = useEvolutionSnapshots();
  const restoreMutation = useRestoreSnapshot();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Snapshot Rollback</h3>
        <p className="text-sm text-muted-foreground">Restore your system to a previous known-good state</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted/60 rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && snapshots.length === 0 && (
        <Card className="p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto">
            <Archive className="w-6 h-6 text-muted-foreground" />
          </div>
          <h4 className="text-sm font-semibold">No snapshots yet</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Snapshots are created automatically before each evolution cycle. Run an evolution to create your first snapshot.
          </p>
        </Card>
      )}

      {snapshots.map((snap) => {
        const isRestored = !!snap.restored_at;
        const preMetrics = snap.pre_metrics as Record<string, number> | null;
        
        return (
          <Card key={snap.id} className={`p-4 ${isRestored ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isRestored ? 'bg-muted' : 'bg-primary/10'}`}>
                  {isRestored ? <CheckCircle className="w-5 h-5 text-muted-foreground" /> : <Shield className="w-5 h-5 text-primary" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium font-mono">{snap.snapshot_id.slice(0, 12)}…</span>
                    {snap.restorable && !isRestored && (
                      <Badge variant="outline" className="text-[10px]">restorable</Badge>
                    )}
                    {isRestored && (
                      <Badge variant="secondary" className="text-[10px]">restored</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatAge(snap.created_at)}
                    </span>
                    {preMetrics?.health_score != null && (
                      <span>Health: {(preMetrics.health_score as number).toFixed(0)}</span>
                    )}
                    {snap.proposal_id && (
                      <span className="font-mono">Plan: {snap.proposal_id.slice(0, 8)}</span>
                    )}
                  </div>
                  {isRestored && snap.restored_at && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Restored {formatAge(snap.restored_at)} by {snap.restored_by ?? 'system'}
                    </p>
                  )}
                </div>
              </div>

              {snap.restorable && !isRestored && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-shrink-0">
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                      Restore
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Restore Snapshot?</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>This will revert the system to the state captured at <strong>{new Date(snap.created_at).toLocaleString()}</strong>.</p>
                        <p>All evolution changes applied after this snapshot will be rolled back. A fresh scan will be triggered automatically.</p>
                        {preMetrics && (
                          <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono space-y-1 mt-2">
                            <p>Health: {(preMetrics.health_score as number).toFixed(1)}</p>
                            <p>Debt Flags: {preMetrics.debt_flags_count}</p>
                            <p>Entropy: {(preMetrics.entropy_score as number).toFixed(3)}</p>
                          </div>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => restoreMutation.mutate({
                          snapshotId: snap.snapshot_id,
                          restoredBy: 'dashboard_user',
                        })}
                        disabled={restoreMutation.isPending}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        {restoreMutation.isPending ? 'Restoring...' : 'Confirm Restore'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
