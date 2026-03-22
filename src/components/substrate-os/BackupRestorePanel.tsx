/**
 * Backup & Restore Panel for CMPSBL World Engine — v3.0
 * Enhanced with exportable backups, retention management, permanent failsafe,
 * and sellable package exports with install wizard
 */

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { system } from '@/lib/substrate';
import { toast } from 'sonner';
import { 
  Database, RefreshCw, Download, RotateCcw, CheckCircle2, 
  AlertTriangle, Clock, Shield, Loader2, HardDrive, Upload,
  Lock, Trash2, FileDown, Package, Key, ExternalLink, ShoppingBag
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { SubstratePackageManager } from './SubstratePackageManager';

interface Backup {
  id: string;
  backup_id: string;
  backup_date: string;
  backup_path: string;
  substrate_version: string;
  restore_point_enabled: boolean;
  status: string;
  checksum: string;
  is_permanent?: boolean;
  backup_category?: string;
  notes?: string;
  size_bytes?: number;
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

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function BackupRestorePanel({ enabled = true }: { enabled?: boolean }) {
  const queryClient = useQueryClient();
  const [confirmValue, setConfirmValue] = useState('');
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [activeTab, setActiveTab] = useState('backups');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      toast.error('Failed to create backup', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Export backup mutation - with forced download
  const exportBackup = useMutation({
    mutationFn: async ({ backupId, includeSecrets }: { backupId?: string; includeSecrets: boolean }) => {
      const { data, error } = await supabase.functions.invoke('pf-backup-export', {
        body: { 
          backup_id: backupId,
          include_secrets: includeSecrets,
          export_type: includeSecrets ? 'full' : 'portable',
        }
      });
      if (error) throw error;
      if (!data?.success && data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: async (data: any) => {
      if (data?.download_url) {
        toast.loading('Preparing download...', { id: 'backup-download' });
        try {
          // Use fetch with blob to force download instead of opening in browser
          const response = await fetch(data.download_url, {
            method: 'GET',
            mode: 'cors',
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const blob = await response.blob();
          const fileName = `substrate-backup-${data.export_token || Date.now()}.json`;
          
          // Create blob URL and force download
          const blobUrl = URL.createObjectURL(blob);
          const downloadLink = document.createElement('a');
          downloadLink.href = blobUrl;
          downloadLink.download = fileName;
          downloadLink.style.display = 'none';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          
          // Cleanup
          setTimeout(() => {
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(blobUrl);
          }, 100);
          
          toast.success('Backup downloaded!', {
            id: 'backup-download',
            description: `${fileName} (${data?.size_mb || 0} MB)`,
          });
        } catch (err) {
          console.error('Download error:', err);
          toast.error('Download failed', {
            id: 'backup-download',
            description: err instanceof Error ? err.message : 'Try again or use the export tab',
          });
        }
      } else {
        toast.error('No download URL returned', {
          description: 'The backup was created but no download link was generated',
        });
      }
    },
    onError: (error) => {
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Create failsafe mutation - triggers a REAL full-backup ZIP download (all tables, schema, storage)
  const createFailsafe = useMutation({
    mutationFn: async ({ notes, override }: { notes?: string; override?: boolean }) => {
      // If override, demote existing failsafe first
      if (override) {
        const { error: demoteError } = await supabase
          .from('daily_backups')
          .update({
            is_permanent: false,
            backup_category: 'standard',
          })
          .eq('backup_category', 'failsafe');
        
        if (demoteError) {
          console.error('Failed to demote existing failsafe:', demoteError);
        }
      }

      // Call the real full-backup edge function for a true disaster recovery ZIP
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('You must be logged in as an admin');
      }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/full-backup`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `Backup failed: HTTP ${res.status}`);
      }

      // Download the ZIP
      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition') || '';
      const filenameMatch = disposition.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `cmpsbl-failsafe-backup-${new Date().toISOString().slice(0, 10)}.zip`;

      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);

      // Record in daily_backups as permanent failsafe
      const backupId = `failsafe-${Date.now()}`;
      const { error: insertError } = await supabase
        .from('daily_backups')
        .insert({
          backup_id: backupId,
          backup_path: `downloaded/${filename}`,
          snapshot: { type: 'full-zip-download', filename } as any,
          status: 'completed',
          is_permanent: true,
          backup_category: 'failsafe',
          notes: notes || `Full failsafe backup created at ${new Date().toISOString()}`,
          expires_at: null,
          substrate_version: 'full-backup-v2.1',
          data_counts: { type: 'full-zip-download' } as any,
        });

      if (insertError) {
        console.error('Failed to record failsafe:', insertError);
        // Don't throw — the ZIP was already downloaded successfully
      }

      return { failsafe_id: backupId, success: true, wasOverride: override };
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['substrate-backups'] });
      toast.success(data?.wasOverride ? '🛡️ Failsafe overridden' : '🛡️ Permanent failsafe created', {
        description: `ID: ${data?.failsafe_id} - Protected from auto-pruning`,
      });
    },
    onError: (error) => {
      toast.error('Failed to create failsafe', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Prune backups mutation — client-side delete, skips permanent/failsafe
  const pruneBackups = useMutation({
    mutationFn: async (retentionCount: number = 3) => {
      // Fetch all non-permanent backups ordered by date
      const { data: allBackups, error: fetchErr } = await supabase
        .from('daily_backups')
        .select('id, is_permanent, backup_category, created_at')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      // Filter to only prunable (non-permanent, non-failsafe)
      const prunable = (allBackups || []).filter(
        (b) => !b.is_permanent && b.backup_category !== 'failsafe'
      );

      // Keep the most recent `retentionCount`, delete the rest
      const toDelete = prunable.slice(retentionCount);
      if (toDelete.length === 0) {
        return { pruned_count: 0 };
      }

      const idsToDelete = toDelete.map((b) => b.id);
      const { error: delErr } = await supabase
        .from('daily_backups')
        .delete()
        .in('id', idsToDelete);

      if (delErr) throw delErr;
      return { pruned_count: idsToDelete.length };
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['substrate-backups'] });
      toast.success('Backup pruning complete', {
        description: `Removed ${data?.pruned_count || 0} old backups`,
      });
    },
    onError: (error) => {
      toast.error('Prune failed', {
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
      toast.error('Failed to restore backup', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Import from file mutation
  const importBackup = useMutation({
    mutationFn: async (exportPackage: any) => {
      const { data, error } = await supabase.functions.invoke('pf-backup-import', {
        body: { 
          export_package: exportPackage,
          dry_run: false,
          clear_existing: false,
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['substrate-backups'] });
      toast.success('Import completed', {
        description: `Restored ${data?.total_restored || 0} records`,
      });
      if (data?.missing_secrets?.length > 0) {
        toast.warning('Missing secrets', {
          description: `Configure: ${data.missing_secrets.join(', ')}`,
        });
      }
    },
    onError: (error) => {
      toast.error('Import failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const exportPackage = JSON.parse(content);
        
        if (!exportPackage._meta) {
          toast.error('Invalid backup file', {
            description: 'Missing metadata - not a valid substrate export',
          });
          return;
        }

        toast.info('Backup file loaded', {
          description: `Source: v${exportPackage._meta.substrate_version} - ${exportPackage._meta.total_records} records`,
        });

        // Ask for confirmation before import
        if (confirm(`Import ${exportPackage._meta.total_records} records from v${exportPackage._meta.substrate_version}?`)) {
          importBackup.mutate(exportPackage);
        }
      } catch {
        toast.error('Invalid file', {
          description: 'Could not parse backup file',
        });
      }
    };
    reader.readAsText(file);
  };

  // Calculate stats
  const latestBackup = backups?.[0];
  const totalRecords = latestBackup?.data_counts 
    ? Object.values(latestBackup.data_counts).reduce((a, b) => a + b, 0)
    : 0;
  const permanentBackups = backups?.filter(b => b.is_permanent) || [];
  const hasFailsafe = permanentBackups.some(b => b.backup_category === 'failsafe');

  if (!enabled) {
    return (
      <Card className="border border-dashed border-neon-amber/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neon-blue/20 border border-neon-blue/40 flex items-center justify-center shrink-0">
            <Database className="w-4 h-4 text-neon-blue" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold">Backup & Restore</h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-mono truncate">
              portable exports • retention policy • permanent failsafe
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
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
            className="h-8 gap-2 bg-neon-blue/20 border border-neon-blue/40 text-neon-blue hover:bg-neon-blue/30"
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        <Card className="border border-neon-green/20 bg-white/5 dark:bg-white/[0.02] transition-all duration-300 hover:border-neon-green/30 hover:-translate-y-0.5 hover:shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Backups</p>
            <p className="text-2xl font-mono font-bold tabular-nums text-neon-green">{backups?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="border border-neon-cyan/20 bg-white/5 dark:bg-white/[0.02] transition-all duration-300 hover:border-neon-cyan/30 hover:-translate-y-0.5 hover:shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Latest</p>
            <p className="text-sm font-mono text-neon-cyan">
              {latestBackup ? formatRelative(latestBackup.created_at) : 'None'}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-neon-purple/20 bg-white/5 dark:bg-white/[0.02] transition-all duration-300 hover:border-neon-purple/30 hover:-translate-y-0.5 hover:shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Records</p>
            <p className="text-2xl font-mono font-bold tabular-nums text-neon-purple">{totalRecords.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border border-neon-amber/20 bg-white/5 dark:bg-white/[0.02] transition-all duration-300 hover:border-neon-amber/30 hover:-translate-y-0.5 hover:shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Permanent</p>
            <p className="text-2xl font-mono font-bold tabular-nums text-neon-amber">{permanentBackups.length}</p>
          </CardContent>
        </Card>
        <Card className={cn(
          "border bg-white/5 dark:bg-white/[0.02] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm",
          hasFailsafe ? "border-neon-green/20 hover:border-neon-green/30" : "border-destructive/20 hover:border-destructive/30"
        )}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Failsafe</p>
            <p className={cn(
              "text-sm font-mono font-bold",
              hasFailsafe ? "text-neon-green" : "text-destructive"
            )}>
              {hasFailsafe ? '✓ Protected' : '⚠ Not Set'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-none">
          <TabsList className="grid w-max min-w-full sm:w-full grid-cols-4 bg-white/5">
            <TabsTrigger value="backups" className="text-xs sm:text-sm px-2 sm:px-3">Backups</TabsTrigger>
            <TabsTrigger value="packages" className="gap-1 text-xs sm:text-sm px-2 sm:px-3">
              <ShoppingBag className="w-3 h-3 hidden sm:block" />
              Packages
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs sm:text-sm px-2 sm:px-3">Export/Import</TabsTrigger>
            <TabsTrigger value="retention" className="text-xs sm:text-sm px-2 sm:px-3">Retention</TabsTrigger>
          </TabsList>
        </div>

        {/* Backups Tab */}
        <TabsContent value="backups" className="space-y-4">
          <Card className="border border-white/10 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-neon-blue" />
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
                          backup.is_permanent
                            ? "border-neon-amber/40 bg-neon-amber/5"
                            : idx === 0 
                              ? "border-neon-green/30 bg-neon-green/5" 
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <code className="text-sm font-mono text-foreground">
                                {backup.backup_id}
                              </code>
                              {backup.is_permanent && (
                                <Badge className="bg-neon-amber/20 text-neon-amber border-neon-amber/40 text-[10px]">
                                  <Lock className="w-2.5 h-2.5 mr-1" />
                                  PERMANENT
                                </Badge>
                              )}
                              {backup.backup_category === 'failsafe' && (
                                <Badge className="bg-destructive/20 text-destructive border-destructive/40 text-[10px]">
                                  FAILSAFE
                                </Badge>
                              )}
                              {idx === 0 && !backup.is_permanent && (
                                <Badge className="bg-neon-green/20 text-neon-green border-neon-green/40 text-[10px]">
                                  LATEST
                                </Badge>
                              )}
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[10px]",
                                  backup.status === 'complete' 
                                    ? "border-neon-green/40 text-neon-green" 
                                    : "border-neon-amber/40 text-neon-amber"
                                )}
                              >
                                {backup.status}
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-2">
                              {formatDate(backup.created_at)} • v{backup.substrate_version}
                              {backup.size_bytes ? ` • ${formatBytes(backup.size_bytes)}` : ''}
                            </p>
                            
                            {backup.notes && (
                              <p className="text-xs text-muted-foreground/70 italic mb-2">
                                {backup.notes}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap gap-2 text-[10px]">
                              {backup.data_counts && Object.entries(backup.data_counts).slice(0, 4).map(([key, value]) => (
                                <span key={key} className="px-2 py-0.5 rounded bg-white/5 text-muted-foreground">
                                  {key.replace(/_/g, ' ')}: <span className="text-foreground">{value}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => exportBackup.mutate({ backupId: backup.backup_id, includeSecrets: false })}
                              disabled={exportBackup.isPending}
                              className="h-7 px-2 text-xs"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                            
                            {backup.restore_point_enabled && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedBackup(backup)}
                                    className="h-7 gap-1 text-xs border-neon-amber/30 text-neon-amber bg-neon-amber/10 hover:bg-neon-amber/20"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    Restore
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                      <AlertTriangle className="w-5 h-5 text-neon-amber" />
                                      Confirm Restore
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will restore the substrate to the state from{' '}
                                      <strong>{formatDate(backup.created_at)}</strong>.
                                      <br /><br />
                                      Backup ID: <code className="bg-muted px-1 rounded">{backup.backup_id}</code>
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
                                      className="bg-neon-amber/20 text-neon-amber border border-neon-amber/40 hover:bg-neon-amber/30"
                                    >
                                      {restoreBackup.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
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
        </TabsContent>

        {/* Packages Tab - Sellable Package Export */}
        <TabsContent value="packages" className="space-y-4">
          <SubstratePackageManager />
        </TabsContent>

        {/* Export/Import Tab */}
        <TabsContent value="export" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Export Options */}
            <Card className="border border-neon-blue/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileDown className="w-4 h-4 text-neon-blue" />
                  Export Backup
                </CardTitle>
                <CardDescription className="text-xs">
                  Download a portable backup file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => exportBackup.mutate({ includeSecrets: false })}
                  disabled={exportBackup.isPending}
                  className="w-full justify-start gap-2 bg-neon-blue/20 border border-neon-blue/40 text-neon-blue hover:bg-neon-blue/30"
                >
                  {exportBackup.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Package className="w-4 h-4" />
                  )}
                  Export Portable (No Secrets)
                </Button>
                <p className="text-[10px] text-muted-foreground">
                  Safe for sharing or selling — recipient configures their own API keys
                </p>
                
                <div className="border-t border-white/10 pt-3">
                  <Button
                    onClick={() => exportBackup.mutate({ includeSecrets: true })}
                    disabled={exportBackup.isPending}
                    variant="outline"
                    className="w-full justify-start gap-2 border-neon-amber/30 text-neon-amber hover:bg-neon-amber/10"
                  >
                    {exportBackup.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Key className="w-4 h-4" />
                    )}
                    Export Full (With Secrets Manifest)
                  </Button>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Includes list of required secrets — for personal use/migration only
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Import Options */}
            <Card className="border border-neon-green/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Upload className="w-4 h-4 text-neon-green" />
                  Import Backup
                </CardTitle>
                <CardDescription className="text-xs">
                  Restore from an exported backup file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importBackup.isPending}
                  className="w-full justify-start gap-2 bg-neon-green/20 border border-neon-green/40 text-neon-green hover:bg-neon-green/30"
                >
                  {importBackup.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Upload Backup File
                </Button>
                <p className="text-[10px] text-muted-foreground">
                  Select a .json export file from another project
                </p>
                
                <div className="border-t border-white/10 pt-3">
                  <div className="bg-neon-amber/10 border border-neon-amber/30 rounded-lg p-3">
                    <p className="text-xs text-neon-amber font-medium mb-1">Important</p>
                    <p className="text-[10px] text-muted-foreground">
                      After import, configure any missing API keys in your project secrets.
                      The import will show which secrets need to be set up.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Retention Tab */}
        <TabsContent value="retention" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Permanent Failsafe */}
            <Card className={cn(
              "border bg-white/5",
              hasFailsafe ? "border-neon-green/20" : "border-destructive/20"
            )}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-neon-amber" />
                  Permanent Failsafe
                </CardTitle>
                <CardDescription className="text-xs">
                  A backup that is never auto-pruned
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {hasFailsafe ? (
                  <div className="space-y-3">
                    <div className="bg-neon-green/10 border border-neon-green/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-neon-green" />
                        <span className="text-sm font-medium text-neon-green">Failsafe Active</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your permanent failsafe backup is protected and will never be deleted.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full gap-2 border-neon-amber/30 text-neon-amber hover:bg-neon-amber/10"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Override Failsafe
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-background/95 backdrop-blur-xl border-neon-amber/30">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-neon-amber" />
                            Override Failsafe Backup?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will create a new failsafe backup from the current system state. 
                            The previous failsafe will be demoted to a regular backup and may be auto-pruned.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => createFailsafe.mutate({ override: true, notes: `Failsafe override on ${new Date().toISOString()}` })}
                            disabled={createFailsafe.isPending}
                            className="bg-neon-amber/20 text-neon-amber hover:bg-neon-amber/30"
                          >
                            {createFailsafe.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Override Failsafe
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : (
                  <>
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-medium text-destructive">No Failsafe Set</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Create a permanent backup as a failsafe for disaster recovery.
                      </p>
                    </div>
                    <Button
                      onClick={() => createFailsafe.mutate({ notes: `Failsafe created on ${new Date().toISOString()}` })}
                      disabled={createFailsafe.isPending}
                      className="w-full gap-2 bg-neon-amber/20 border border-neon-amber/40 text-neon-amber hover:bg-neon-amber/30"
                    >
                      {createFailsafe.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                      Create Permanent Failsafe
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Auto-Prune */}
            <Card className="border border-neon-purple/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-neon-purple" />
                  Retention Policy
                </CardTitle>
                <CardDescription className="text-xs">
                  Keep only the most recent backups
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Auto-prune will remove old backups, keeping only the most recent ones.
                  Permanent backups are never pruned.
                </p>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => pruneBackups.mutate(3)}
                    disabled={pruneBackups.isPending}
                    className="text-xs"
                  >
                    Keep 3
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => pruneBackups.mutate(5)}
                    disabled={pruneBackups.isPending}
                    className="text-xs"
                  >
                    Keep 5
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => pruneBackups.mutate(10)}
                    disabled={pruneBackups.isPending}
                    className="text-xs"
                  >
                    Keep 10
                  </Button>
                </div>
                
                {pruneBackups.isPending && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Pruning old backups...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Card */}
          <Card className="border border-neon-blue/20 bg-neon-blue/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-neon-blue mt-0.5" />
                <div className="text-sm">
                  <p className="text-foreground font-medium mb-1">Backup Retention</p>
                  <p className="text-muted-foreground text-xs">
                    The system keeps the last 3 non-permanent backups by default. 
                    Permanent backups (including your failsafe) are never automatically deleted.
                    You can export any backup for offsite storage or migration.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
