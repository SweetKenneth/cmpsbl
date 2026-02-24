/**
 * CMPSBL® Patch Distribution & Governance Console
 * 
 * Unified admin console for patch lifecycle, governance stream,
 * substrate export, and download analytics.
 * 
 * @distribution CMPSBL-only
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminRoute } from '@/components/admin/AdminRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Package, Shield, Download, Eye, Send, Ban, 
  ChevronRight, Clock, CheckCircle2, XCircle, FileJson,
  GitCommit, Check, X, Rocket, Filter, Archive, 
  BookOpen, Layers, Info, ArrowUpRight, Zap
} from 'lucide-react';
import { buildSubstrateZip, downloadBlob } from '@/lib/substrate-export';
import { useSubstrateChanges, type SubstrateChange } from '@/hooks/admin/useSubstrateChanges';
import type { PatchTier, PatchStatus } from '@/lib/patches/author';
import { validatePatch } from '@/lib/patches/author';
import { DISTRIBUTION_ID } from '@/lib/distribution';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PatchRow {
  id: string;
  version: string;
  target_distribution: string;
  required_tier: string;
  engines_unlocked: string[];
  capabilities_unlocked: string[];
  changelog: string | null;
  manifest_json: any;
  signature: string | null;
  status: string;
  created_at: string;
  published_at: string | null;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function usePatches() {
  return useQuery({
    queryKey: ['cmpsbl-patches'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('cmpsbl_patches')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as PatchRow[];
    },
  });
}

function useDownloadStats() {
  return useQuery({
    queryKey: ['cmpsbl-patch-downloads'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('cmpsbl_patch_downloads')
        .select('patch_id, license_tier, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

// ─── Shared Components ──────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.2 },
};

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; icon: React.ReactNode }> = {
    draft: { bg: 'bg-muted text-muted-foreground border-border', icon: <Clock className="w-3 h-3" /> },
    published: { bg: 'bg-primary/10 text-primary border-primary/30', icon: <CheckCircle2 className="w-3 h-3" /> },
    revoked: { bg: 'bg-destructive/10 text-destructive border-destructive/30', icon: <XCircle className="w-3 h-3" /> },
  };
  const c = config[status] || config.draft;
  return (
    <Badge className={`${c.bg} border gap-1 font-medium text-[10px] uppercase tracking-wider`}>
      {c.icon} {status}
    </Badge>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const config: Record<string, string> = {
    free: 'bg-secondary text-secondary-foreground border-border',
    builder: 'bg-accent/50 text-accent-foreground border-accent/30',
    pro: 'bg-primary/15 text-primary border-primary/30',
  };
  return (
    <Badge className={`${config[tier] || config.free} border text-[10px] uppercase tracking-wider font-medium`}>
      {tier}
    </Badge>
  );
}

function GovernanceStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; icon: React.ReactNode }> = {
    pending: { bg: 'bg-accent/50 text-accent-foreground border-accent/30', icon: <Clock className="w-3 h-3" /> },
    approved: { bg: 'bg-primary/10 text-primary border-primary/30', icon: <Check className="w-3 h-3" /> },
    declined: { bg: 'bg-destructive/10 text-destructive border-destructive/30', icon: <X className="w-3 h-3" /> },
    dispatched: { bg: 'bg-secondary text-secondary-foreground border-border', icon: <Rocket className="w-3 h-3" /> },
  };
  const c = config[status] || config.pending;
  return (
    <Badge className={`${c.bg} border gap-1 font-medium text-[10px] uppercase tracking-wider`}>
      {c.icon} {status}
    </Badge>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
      <CardContent className="py-4 px-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
          {icon}
        </div>
        <div>
          <div className="text-xl font-bold text-foreground leading-none">{value}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wider">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Create Patch Dialog ────────────────────────────────────────────────────

function CreatePatchDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState('');
  const [tier, setTier] = useState<PatchTier>('free');
  const [engines, setEngines] = useState('');
  const [capabilities, setCapabilities] = useState('');
  const [changelog, setChangelog] = useState('');

  const createMutation = useMutation({
    mutationFn: async () => {
      const enginesArr = engines.split(',').map(s => s.trim()).filter(Boolean);
      const capsArr = capabilities.split(',').map(s => s.trim()).filter(Boolean);

      const validation = validatePatch({
        version,
        targetDistribution: 'LNCHBL',
        requiredTier: tier,
        enginesUnlocked: enginesArr,
        capabilitiesUnlocked: capsArr,
        changelog,
        files: [],
      });

      if (!validation.valid) {
        throw new Error(validation.errors.join('; '));
      }

      const manifest = {
        distributionId: DISTRIBUTION_ID,
        version,
        targetDistribution: 'LNCHBL',
        requiredTier: tier,
        enginesUnlocked: enginesArr,
        capabilitiesUnlocked: capsArr,
        changelog,
        createdAt: new Date().toISOString(),
      };

      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(manifest));
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { error } = await (supabase as any)
        .from('cmpsbl_patches')
        .insert({
          version,
          target_distribution: 'LNCHBL',
          required_tier: tier,
          engines_unlocked: enginesArr,
          capabilities_unlocked: capsArr,
          changelog,
          manifest_json: manifest,
          signature,
          status: 'draft',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Patch created as draft');
      queryClient.invalidateQueries({ queryKey: ['cmpsbl-patches'] });
      setOpen(false);
      setVersion(''); setEngines(''); setCapabilities(''); setChangelog('');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create patch'),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Author Patch
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> Author New Patch
          </DialogTitle>
          <DialogDescription>
            Create a patch manifest targeting LNCHBL. It starts as a draft.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Version</label>
              <Input value={version} onChange={e => setVersion(e.target.value)} placeholder="1.0.0" className="h-9" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Required Tier</label>
              <Select value={tier} onValueChange={v => setTier(v as PatchTier)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="builder">Builder</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Engines to Unlock</label>
            <Input value={engines} onChange={e => setEngines(e.target.value)} placeholder="imagination_engine, reasoning_engine" className="h-9" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Capabilities to Unlock</label>
            <Input value={capabilities} onChange={e => setCapabilities(e.target.value)} placeholder="dream_synthesis, adaptive_routing" className="h-9" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Changelog</label>
            <Textarea value={changelog} onChange={e => setChangelog(e.target.value)} placeholder="What this patch unlocks..." rows={3} />
          </div>
          <Separator />
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="w-full">
            {createMutation.isPending ? 'Creating...' : 'Create Draft Patch'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Patch Card ─────────────────────────────────────────────────────────────

function PatchCard({ patch }: { patch: PatchRow }) {
  const queryClient = useQueryClient();
  const [showManifest, setShowManifest] = useState(false);

  const updateStatus = useMutation({
    mutationFn: async (newStatus: string) => {
      const updates: any = { status: newStatus };
      if (newStatus === 'published') updates.published_at = new Date().toISOString();
      if (newStatus === 'draft') updates.published_at = null;
      const { error } = await (supabase as any)
        .from('cmpsbl_patches')
        .update(updates)
        .eq('id', patch.id);
      if (error) throw error;
    },
    onSuccess: (_, newStatus) => {
      toast.success(`Patch v${patch.version} → ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['cmpsbl-patches'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const hasUnlocks = (patch.engines_unlocked?.length > 0 || patch.capabilities_unlocked?.length > 0);

  return (
    <motion.div {...fadeUp}>
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-border/60 transition-colors">
        <CardContent className="py-4 px-4 sm:px-5 space-y-3">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded bg-primary/10 shrink-0">
                <Package className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">v{patch.version}</span>
                  <StatusBadge status={patch.status} />
                  <TierBadge tier={patch.required_tier} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {patch.changelog || 'No changelog'}
                </p>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono shrink-0 mt-1">
              {patch.id.slice(0, 8)}
            </span>
          </div>

          {/* Unlocks */}
          {hasUnlocks && (
            <div className="flex flex-wrap gap-1">
              {patch.engines_unlocked?.map(e => (
                <Badge key={e} variant="outline" className="text-[10px] font-mono gap-1">
                  <Zap className="w-2.5 h-2.5" />{e}
                </Badge>
              ))}
              {patch.capabilities_unlocked?.map(c => (
                <Badge key={c} variant="secondary" className="text-[10px] font-mono">{c}</Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/20">
            {patch.status === 'draft' && (
              <Button size="sm" onClick={() => updateStatus.mutate('published')} disabled={updateStatus.isPending} className="gap-1.5 h-7 text-xs">
                <Send className="w-3 h-3" /> Publish
              </Button>
            )}
            {patch.status === 'published' && (
              <>
                <Button size="sm" variant="outline" onClick={() => updateStatus.mutate('draft')} disabled={updateStatus.isPending} className="h-7 text-xs">
                  Unpublish
                </Button>
                <Button size="sm" variant="destructive" onClick={() => updateStatus.mutate('revoked')} disabled={updateStatus.isPending} className="gap-1.5 h-7 text-xs">
                  <Ban className="w-3 h-3" /> Revoke
                </Button>
              </>
            )}
            <Button size="sm" variant="ghost" onClick={() => setShowManifest(!showManifest)} className="gap-1.5 h-7 text-xs ml-auto">
              <FileJson className="w-3 h-3" /> {showManifest ? 'Hide' : 'Manifest'}
            </Button>
          </div>

          {/* Manifest */}
          <AnimatePresence>
            {showManifest && patch.manifest_json && (
              <motion.pre 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                className="text-[11px] bg-muted/50 p-3 rounded-lg overflow-auto max-h-48 border border-border/30 font-mono"
              >
                {JSON.stringify(patch.manifest_json, null, 2)}
              </motion.pre>
            )}
          </AnimatePresence>

          {/* Meta */}
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span>Created {new Date(patch.created_at).toLocaleDateString()}</span>
            {patch.published_at && <span>· Published {new Date(patch.published_at).toLocaleDateString()}</span>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Download Analytics ─────────────────────────────────────────────────────

function DownloadAnalytics() {
  const { data: downloads = [] } = useDownloadStats();

  const byTier = downloads.reduce((acc: Record<string, number>, d: any) => {
    acc[d.license_tier || 'unknown'] = (acc[d.license_tier || 'unknown'] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Downloads" value={downloads.length} icon={<Download className="w-4 h-4" />} />
        {Object.entries(byTier).map(([tier, count]) => (
          <StatCard key={tier} label={`${tier} tier`} value={count as number} icon={<Layers className="w-4 h-4" />} />
        ))}
      </div>

      {downloads.length > 0 && (
        <Card className="border-border/40 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {downloads.slice(0, 10).map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border/15 last:border-0">
                  <span className="font-mono text-muted-foreground">{d.patch_id?.slice(0, 8)}</span>
                  <TierBadge tier={d.license_tier || 'free'} />
                  <span className="text-muted-foreground text-[10px]">{new Date(d.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Governance Change Card ─────────────────────────────────────────────────

function ChangeCard({ change, onApprove, onDecline }: { 
  change: SubstrateChange; 
  onApprove: (id: string) => void;
  onDecline: (id: string, reason?: string) => void;
}) {
  const isPending = change.lnchbl_status === 'pending';
  
  return (
    <motion.div {...fadeUp}>
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-border/60 transition-colors">
        <CardContent className="py-3.5 px-4 space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="p-1.5 rounded bg-secondary shrink-0 mt-0.5">
                <GitCommit className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-foreground text-sm leading-tight truncate">{change.title}</h3>
                {change.description && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{change.description}</p>
                )}
              </div>
            </div>
            <GovernanceStatusBadge status={change.lnchbl_status} />
          </div>

          {change.files_changed?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {change.files_changed.slice(0, 4).map(f => (
                <Badge key={f} variant="outline" className="text-[9px] font-mono py-0 h-4">
                  {f.split('/').pop()}
                </Badge>
              ))}
              {change.files_changed.length > 4 && (
                <Badge variant="outline" className="text-[9px] py-0 h-4">
                  +{change.files_changed.length - 4}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground">
            {change.commit_hash && <span className="font-mono">{change.commit_hash.slice(0, 8)}</span>}
            {change.author && <span>by {change.author}</span>}
            <span>{new Date(change.created_at).toLocaleString()}</span>
          </div>

          {change.declined_reason && (
            <div className="text-[11px] text-destructive bg-destructive/5 rounded-md px-2.5 py-1.5 border border-destructive/15">
              {change.declined_reason}
            </div>
          )}

          {isPending && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/20">
              <Button size="sm" onClick={() => onApprove(change.id)} className="gap-1.5 h-7 text-xs">
                <Check className="w-3 h-3" /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => onDecline(change.id, 'CMPSBL-only change')} className="gap-1.5 h-7 text-xs text-destructive hover:text-destructive">
                <X className="w-3 h-3" /> Decline
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Governance Stream ──────────────────────────────────────────────────────

function GovernanceStream() {
  const [filter, setFilter] = useState<string>('all');
  const [exporting, setExporting] = useState(false);
  const { changes, isLoading, approve, decline, batchDispatch } = useSubstrateChanges(filter);

  const approvedChanges = changes.filter(c => c.lnchbl_status === 'approved');
  const counts = {
    pending: changes.filter(c => c.lnchbl_status === 'pending').length,
    approved: approvedChanges.length,
    declined: changes.filter(c => c.lnchbl_status === 'declined').length,
    dispatched: changes.filter(c => c.lnchbl_status === 'dispatched').length,
  };

  const handleDispatchApproved = async () => {
    if (approvedChanges.length === 0) {
      toast.error('No approved changes to dispatch');
      return;
    }
    try {
      await batchDispatch.mutateAsync(approvedChanges.map(c => c.id));
      toast.success(`Dispatched ${approvedChanges.length} changes to LNCHBL`);
    } catch (err: any) {
      toast.error(err.message || 'Dispatch error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[155px] h-8 text-xs">
              <Filter className="w-3 h-3 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Changes</SelectItem>
              <SelectItem value="pending">Pending ({counts.pending})</SelectItem>
              <SelectItem value="approved">Approved ({counts.approved})</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="dispatched">Dispatched</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {approvedChanges.length > 0 && (
            <Button 
              onClick={handleDispatchApproved}
              disabled={batchDispatch.isPending}
              className="gap-2 h-8 text-xs shadow-sm"
            >
              <Rocket className="w-3.5 h-3.5" />
              Push {approvedChanges.length} to LNCHBL
            </Button>
          )}
          <Button
            variant="outline"
            onClick={async () => {
              setExporting(true);
              try {
                const { blob, manifest } = await buildSubstrateZip();
                const dateStr = new Date().toISOString().slice(0, 10);
                downloadBlob(blob, `cmpsbl-substrate-${dateStr}.zip`);
                toast.success(`Exported ${manifest.totalFiles} files`);
              } catch (err: any) {
                toast.error(err.message || 'Export failed');
              } finally {
                setExporting(false);
              }
            }}
            disabled={exporting}
            className="gap-2 h-8 text-xs"
          >
            <Archive className="w-3.5 h-3.5" />
            {exporting ? 'Building...' : 'Export ZIP'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Pending" value={counts.pending} icon={<Clock className="w-4 h-4" />} />
        <StatCard label="Approved" value={counts.approved} icon={<Check className="w-4 h-4" />} />
        <StatCard label="Declined" value={counts.declined} icon={<X className="w-4 h-4" />} />
        <StatCard label="Dispatched" value={counts.dispatched} icon={<Rocket className="w-4 h-4" />} />
      </div>

      {/* Stream */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading changes...</div>
      ) : changes.length === 0 ? (
        <Card className="border-dashed border-border/40 bg-card/30">
          <CardContent className="py-16 text-center">
            <GitCommit className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No substrate changes recorded.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Changes appear here as the substrate evolves.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {changes.map(c => (
            <ChangeCard 
              key={c.id} 
              change={c}
              onApprove={(id) => {
                approve.mutate(id, {
                  onSuccess: () => toast.success('Approved for LNCHBL'),
                  onError: (err: any) => toast.error(err.message),
                });
              }}
              onDecline={(id, reason) => {
                decline.mutate({ changeId: id, reason }, {
                  onSuccess: () => toast.info('Declined — CMPSBL only'),
                  onError: (err: any) => toast.error(err.message),
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminPatches() {
  const { data: patches = [], isLoading } = usePatches();

  const draftPatches = patches.filter(p => p.status === 'draft');
  const publishedPatches = patches.filter(p => p.status === 'published');
  const revokedPatches = patches.filter(p => p.status === 'revoked');

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                Patch Distribution
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                Author, publish, and govern patches for LNCHBL.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" asChild>
                <a href="/docs/internal/governance-dashboard-capabilities.html" target="_blank" rel="noopener">
                  <BookOpen className="w-3.5 h-3.5" /> Docs <ArrowUpRight className="w-3 h-3" />
                </a>
              </Button>
              <CreatePatchDialog />
            </div>
          </div>

          {/* Canon banner */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-2.5 px-4 flex items-center gap-3">
              <Shield className="w-4 h-4 text-primary shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-foreground">Canon Lock</span>
                <span className="text-muted-foreground ml-2">
                  {DISTRIBUTION_ID} · Authority: TRUE
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Overview stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Patches" value={patches.length} icon={<Package className="w-4 h-4" />} />
            <StatCard label="Drafts" value={draftPatches.length} icon={<Clock className="w-4 h-4" />} />
            <StatCard label="Published" value={publishedPatches.length} icon={<CheckCircle2 className="w-4 h-4" />} />
            <StatCard label="Revoked" value={revokedPatches.length} icon={<XCircle className="w-4 h-4" />} />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all">
            <TabsList className="h-9 bg-muted/50 p-0.5 gap-0.5">
              <TabsTrigger value="all" className="text-xs h-8 px-3">All ({patches.length})</TabsTrigger>
              <TabsTrigger value="draft" className="text-xs h-8 px-3">Drafts ({draftPatches.length})</TabsTrigger>
              <TabsTrigger value="published" className="text-xs h-8 px-3">Published ({publishedPatches.length})</TabsTrigger>
              <TabsTrigger value="revoked" className="text-xs h-8 px-3">Revoked ({revokedPatches.length})</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs h-8 px-3 gap-1.5">
                <Eye className="w-3 h-3" /> Analytics
              </TabsTrigger>
              <TabsTrigger value="governance" className="text-xs h-8 px-3 gap-1.5">
                <GitCommit className="w-3 h-3" /> Governance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2.5 mt-4">
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground text-sm">Loading patches...</div>
              ) : patches.length === 0 ? (
                <Card className="border-dashed border-border/40 bg-card/30">
                  <CardContent className="py-16 text-center">
                    <Package className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground text-sm">No patches authored yet.</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Click "Author Patch" to create your first.</p>
                  </CardContent>
                </Card>
              ) : (
                patches.map(p => <PatchCard key={p.id} patch={p} />)
              )}
            </TabsContent>

            <TabsContent value="draft" className="space-y-2.5 mt-4">
              {draftPatches.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No draft patches.</p>
              ) : draftPatches.map(p => <PatchCard key={p.id} patch={p} />)}
            </TabsContent>

            <TabsContent value="published" className="space-y-2.5 mt-4">
              {publishedPatches.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No published patches.</p>
              ) : publishedPatches.map(p => <PatchCard key={p.id} patch={p} />)}
            </TabsContent>

            <TabsContent value="revoked" className="space-y-2.5 mt-4">
              {revokedPatches.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No revoked patches.</p>
              ) : revokedPatches.map(p => <PatchCard key={p.id} patch={p} />)}
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <DownloadAnalytics />
            </TabsContent>

            <TabsContent value="governance" className="mt-4">
              <GovernanceStream />
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}
