/**
 * Control Plane Status Panel (Admin-Only)
 * Shows leader status, revision info, commit health, WAL depth, and restore controls.
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getPersistenceHealth,
  isLeader,
  getWalStats,
  forceCommitNow,
  getLastRevisionId,
  getLastSnapshotHash,
  isDegradedMode,
  resetDegradedMode,
} from '@/lib/control-plane';
import { listRevisions, restoreToRevision } from '@/lib/control-plane/restore';
import { getInstanceId, getEnv, getTenantId } from '@/lib/control-plane/identity';
import { Shield, Database, Radio, RotateCcw, Zap, AlertTriangle } from 'lucide-react';

export function ControlPlaneStatus() {
  const queryClient = useQueryClient();
  const [showRevisions, setShowRevisions] = useState(false);

  const healthQuery = useQuery({
    queryKey: ['cp-health'],
    queryFn: () => getPersistenceHealth(),
    refetchInterval: 5000,
  });

  const revisionsQuery = useQuery({
    queryKey: ['cp-revisions'],
    queryFn: () => listRevisions(10),
    enabled: showRevisions,
  });

  const flushMutation = useMutation({
    mutationFn: () => forceCommitNow(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cp-health'] }),
  });

  const restoreMutation = useMutation({
    mutationFn: (revId: number) => restoreToRevision(revId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cp-health'] });
      queryClient.invalidateQueries({ queryKey: ['cp-revisions'] });
    },
  });

  const health = healthQuery.data;
  const walStats = getWalStats();
  const leader = isLeader();
  const degraded = isDegradedMode();
  const instanceId = getInstanceId().slice(0, 8);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Control Plane</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={leader ? 'default' : 'secondary'} className="text-xs">
              <Radio className="h-3 w-3 mr-1" />
              {leader ? 'LEADER' : 'STANDBY'}
            </Badge>
            {degraded && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                DEGRADED
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Instance: {instanceId} | Env: {getEnv()} | Tenant: {getTenantId()}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Revision Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Revision:</span>
            <span className="ml-2 font-mono text-foreground">{health?.lastRevisionId ?? '—'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Hash:</span>
            <span className="ml-2 font-mono text-foreground text-xs">
              {health?.lastSnapshotHash ? health.lastSnapshotHash.slice(0, 12) + '…' : '—'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Commits:</span>
            <span className="ml-2 text-foreground">
              {health?.commitSuccessCount ?? 0}
              <span className="text-destructive ml-1">({health?.commitFailureCount ?? 0} failed)</span>
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">WAL:</span>
            <span className="ml-2 text-foreground">
              {walStats.buffered} buffered / {walStats.dropped} dropped
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Pending:</span>
            <span className="ml-2 text-foreground">{health?.pendingWrites ?? 0} domains</span>
          </div>
          <div>
            <span className="text-muted-foreground">Last Write:</span>
            <span className="ml-2 text-foreground">
              {health ? `${Math.round((Date.now() - health.lastWriteAt) / 1000)}s ago` : '—'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => flushMutation.mutate()}
            disabled={flushMutation.isPending}
          >
            <Zap className="h-3 w-3 mr-1" />
            Flush Now
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowRevisions(!showRevisions)}
          >
            <Shield className="h-3 w-3 mr-1" />
            {showRevisions ? 'Hide' : 'Show'} Revisions
          </Button>
          {degraded && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                resetDegradedMode();
                queryClient.invalidateQueries({ queryKey: ['cp-health'] });
              }}
            >
              Reset Degraded
            </Button>
          )}
        </div>

        {/* Revision List */}
        {showRevisions && revisionsQuery.data && (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {revisionsQuery.data.map(rev => (
              <div
                key={rev.revision_id}
                className="flex items-center justify-between px-2 py-1 rounded text-xs bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-foreground">#{rev.revision_id}</span>
                  <Badge variant={rev.status === 'committed' ? 'default' : 'destructive'} className="text-[10px]">
                    {rev.status}
                  </Badge>
                  <span className="text-muted-foreground">
                    {new Date(rev.created_at).toLocaleString()}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    if (confirm(`Restore to revision #${rev.revision_id}?`)) {
                      restoreMutation.mutate(rev.revision_id);
                    }
                  }}
                  disabled={restoreMutation.isPending}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ControlPlaneStatus;
