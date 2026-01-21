/**
 * Backup & Restore Panel for Substrate OS
 * Displays backups and enables restore operations
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { system } from '@/lib/substrate';
import { toast } from 'sonner';
import { 
  Database, RefreshCw, Download, RotateCcw, CheckCircle2, 
  AlertTriangle, Clock, Shield, Loader2, HardDrive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
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
import { cn } from '@/lib/utils';

interface Backup {
  id: string;
  backup_id: string;
  backup_date: string;
  backup_path: string;
  substrate_version: string;
  restore_point_enabled: boolean;
  status: string;
  checksum: string;
  data_counts: Record<string, number>;
  snapshot: {
    orchestrator?: {
      status?: string;
      health_score?: number;
      current_phase?: string;
      cycles_completed?: number;
    };
    module_state?: Record<string, { health_score?: number; status?: string }>;
    created_at?: string;
  };
  created_at: string;
  expires_at: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelative(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function BackupRestorePanel({ enabled = true }: { enabled?: boolean }) {
  const queryClient = useQueryClient();
  const [confirmValue, setConfirmValue] = useState('');
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);

  // Fetch backups from database
  const { data: backups, isLoading, refetch } = useQuery({
    queryKey: ['substrate-backups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_backups')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return (data || []) as Backup[];
    },
    refetchInterval: 60000,
  });

  // Create backup mutation
  const createBackup = useMutation({
    mutationFn: async () => {
      const result = await system.backup({ include_data: true });
      if (!result.success) {
        throw new Error(result.error || 'Backup failed');
      }
      return result.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['substrate-backups'] });
      toast.success('Backup created successfully', {
        description: `Backup ID: ${data?.backup_id || 'Created'}`,
      });
    },
    onError: (error) => {
      console.error('Backup error:', error);
      toast.error('Failed to create backup', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Restore backup mutation
  const restoreBackup = useMutation({
    mutationFn: async (backupId: string) => {
      const result = await system.restore(backupId);
      if (!result.success) {
        throw new Error(result.error || 'Restore failed');
      }
      return result.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['substrate-backups'] });
      toast.success('Restore completed', {
        description: `Restored ${data?.restored_modules?.length || 0} components`,
      });
      setSelectedBackup(null);
      setConfirmValue('');
    },
    onError: (error) => {
      console.error('Restore error:', error);
      toast.error('Failed to restore backup', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Calculate total records from latest backup
  const latestBackup = backups?.[0];
  const totalRecords = latestBackup?.data_counts 
    ? Object.values(latestBackup.data_counts).reduce((a, b) => a + b, 0)
    : 0;

  if (!enabled) {
    return (
      <Card className="border border-dashed border-amber-500/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
        <CardContent className="py-8">
          <div className="text-center">
            <Shield className="w-10 h-10 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground italic">
              Backup & Restore requires operator privileges
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Backup & Restore</h2>
            <p className="text-xs text-muted-foreground font-mono">
              substrate state persistence • disaster recovery
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-8 gap-2 border-white/10 bg-white/5 hover:bg-white/10"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => createBackup.mutate()}
            disabled={createBackup.isPending}
            className="h-8 gap-2 bg-blue-500/20 border border-blue-500/40 text-blue-400 hover:bg-blue-500/30"
          >
            {createBackup.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <HardDrive className="w-3.5 h-3.5" />
            )}
            Create Backup
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-emerald-500/20 bg-white/5 dark:bg-white/[0.02]">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Backups</p>
            <p className="text-2xl font-mono font-bold text-emerald-400">{backups?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="border border-cyan-500/20 bg-white/5 dark:bg-white/[0.02]">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Latest Backup</p>
            <p className="text-sm font-mono text-cyan-400">
              {latestBackup ? formatRelative(latestBackup.created_at) : 'None'}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-purple-500/20 bg-white/5 dark:bg-white/[0.02]">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Records Backed</p>
            <p className="text-2xl font-mono font-bold text-purple-400">{totalRecords.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border border-amber-500/20 bg-white/5 dark:bg-white/[0.02]">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Version</p>
            <p className="text-sm font-mono text-amber-400">
              {latestBackup?.substrate_version || 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Backup List */}
      <Card className="border border-white/10 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Backup History
          </CardTitle>
          <CardDescription className="text-xs">
            Recent backups with restore point capability
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : backups && backups.length > 0 ? (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {backups.map((backup, idx) => (
                  <div
                    key={backup.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all",
                      idx === 0 
                        ? "border-emerald-500/30 bg-emerald-500/5" 
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm font-mono text-foreground">
                            {backup.backup_id}
                          </code>
                          {idx === 0 && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px]">
                              LATEST
                            </Badge>
                          )}
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px]",
                              backup.status === 'complete' 
                                ? "border-emerald-500/40 text-emerald-400" 
                                : "border-amber-500/40 text-amber-400"
                            )}
                          >
                            {backup.status}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          {formatDate(backup.created_at)} • v{backup.substrate_version}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 text-[10px]">
                          {backup.data_counts && Object.entries(backup.data_counts).slice(0, 4).map(([key, value]) => (
                            <span key={key} className="px-2 py-0.5 rounded bg-white/5 text-muted-foreground">
                              {key.replace(/_/g, ' ')}: <span className="text-foreground">{value}</span>
                            </span>
                          ))}
                        </div>
                        
                        {backup.snapshot?.orchestrator && (
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Orchestrator:</span>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-[10px]",
                                (backup.snapshot.orchestrator.health_score || 0) > 0.8
                                  ? "border-emerald-500/40 text-emerald-400"
                                  : "border-amber-500/40 text-amber-400"
                              )}
                            >
                              {Math.round((backup.snapshot.orchestrator.health_score || 0) * 100)}% health
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {backup.restore_point_enabled && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedBackup(backup)}
                                className="h-8 gap-2 border-amber-500/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Restore
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                                  Confirm Restore
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will restore the substrate to the state from{' '}
                                  <strong>{formatDate(backup.created_at)}</strong>.
                                  <br /><br />
                                  Backup ID: <code className="bg-muted px-1 rounded">{backup.backup_id}</code>
                                  <br />
                                  Version: {backup.substrate_version}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              
                              <div className="py-2">
                                <p className="text-sm text-muted-foreground mb-2">
                                  Type <code className="bg-muted px-1 rounded">RESTORE</code> to confirm:
                                </p>
                                <Input
                                  value={confirmValue}
                                  onChange={(e) => setConfirmValue(e.target.value)}
                                  placeholder="Type RESTORE"
                                  className="font-mono"
                                />
                              </div>
                              
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => {
                                  setConfirmValue('');
                                  setSelectedBackup(null);
                                }}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => restoreBackup.mutate(backup.backup_id)}
                                  disabled={confirmValue !== 'RESTORE' || restoreBackup.isPending}
                                  className="bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30"
                                >
                                  {restoreBackup.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  ) : (
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                  )}
                                  Restore Backup
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <Database className="w-10 h-10 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No backups found. Create your first backup above.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="text-sm">
              <p className="text-foreground font-medium mb-1">Automated Backups Enabled</p>
              <p className="text-muted-foreground text-xs">
                The substrate automatically creates daily backups stored in the backups bucket. 
                Manual backups can be created at any time. All backups include orchestrator state, 
                module health, and data counts for validation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
