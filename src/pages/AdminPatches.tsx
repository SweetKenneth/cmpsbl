/**
 * CMPSBL® Admin Patch Management
 * 
 * Author, publish, revoke, and monitor patches for downstream distributions.
 * Admin-only, protected by AdminRoute + useAdminAuth.
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Plus, Package, Shield, Download, Eye, Send, Ban, 
  ChevronRight, Clock, CheckCircle2, XCircle, FileJson 
} from 'lucide-react';
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

// ─── Components ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    published: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    revoked: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <Badge className={`${variants[status] || variants.draft} border`}>
      {status === 'published' && <CheckCircle2 className="w-3 h-3 mr-1" />}
      {status === 'revoked' && <XCircle className="w-3 h-3 mr-1" />}
      {status === 'draft' && <Clock className="w-3 h-3 mr-1" />}
      {status.toUpperCase()}
    </Badge>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    free: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    builder: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    pro: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };
  return (
    <Badge className={`${colors[tier] || colors.free} border`}>
      {tier.toUpperCase()}
    </Badge>
  );
}

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

      // Validate
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

      // Build manifest JSON
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

      // Generate signature
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
      setVersion('');
      setEngines('');
      setCapabilities('');
      setChangelog('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create patch');
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Author Patch
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" /> Author New Patch for LNCHBL
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium text-foreground">Version</label>
            <Input value={version} onChange={e => setVersion(e.target.value)} placeholder="1.0.0" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Required Tier</label>
            <Select value={tier} onValueChange={v => setTier(v as PatchTier)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="builder">Builder</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Engines to Unlock (comma-separated)</label>
            <Input value={engines} onChange={e => setEngines(e.target.value)} placeholder="imagination_engine, reasoning_engine" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Capabilities to Unlock (comma-separated)</label>
            <Input value={capabilities} onChange={e => setCapabilities(e.target.value)} placeholder="dream_synthesis, adaptive_routing" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Changelog</label>
            <Textarea value={changelog} onChange={e => setChangelog(e.target.value)} placeholder="What this patch unlocks..." rows={4} />
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="w-full">
            {createMutation.isPending ? 'Creating...' : 'Create Draft Patch'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PatchCard({ patch }: { patch: PatchRow }) {
  const queryClient = useQueryClient();
  const [showManifest, setShowManifest] = useState(false);

  const publishMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any)
        .from('cmpsbl_patches')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', patch.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`Patch ${patch.version} published`);
      queryClient.invalidateQueries({ queryKey: ['cmpsbl-patches'] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any)
        .from('cmpsbl_patches')
        .update({ status: 'revoked' })
        .eq('id', patch.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`Patch ${patch.version} revoked`);
      queryClient.invalidateQueries({ queryKey: ['cmpsbl-patches'] });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any)
        .from('cmpsbl_patches')
        .update({ status: 'draft', published_at: null })
        .eq('id', patch.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`Patch ${patch.version} unpublished`);
      queryClient.invalidateQueries({ queryKey: ['cmpsbl-patches'] });
    },
  });

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Package className="w-5 h-5 text-primary shrink-0" />
            <CardTitle className="text-base sm:text-lg">v{patch.version}</CardTitle>
            <StatusBadge status={patch.status} />
            <TierBadge tier={patch.required_tier} />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ChevronRight className="w-3 h-3" />
            <span>→ LNCHBL</span>
          </div>
        </div>
        <CardDescription className="mt-1">
          {patch.changelog || 'No changelog'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Unlocks */}
        {(patch.engines_unlocked?.length > 0 || patch.capabilities_unlocked?.length > 0) && (
          <div className="flex flex-wrap gap-1">
            {patch.engines_unlocked?.map(e => (
              <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
            ))}
            {patch.capabilities_unlocked?.map(c => (
              <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/30">
          {patch.status === 'draft' && (
            <Button size="sm" onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending} className="gap-1">
              <Send className="w-3 h-3" /> Publish
            </Button>
          )}
          {patch.status === 'published' && (
            <>
              <Button size="sm" variant="outline" onClick={() => unpublishMutation.mutate()} disabled={unpublishMutation.isPending} className="gap-1">
                Unpublish
              </Button>
              <Button size="sm" variant="destructive" onClick={() => revokeMutation.mutate()} disabled={revokeMutation.isPending} className="gap-1">
                <Ban className="w-3 h-3" /> Revoke
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" onClick={() => setShowManifest(!showManifest)} className="gap-1 sm:ml-auto">
            <FileJson className="w-3 h-3" /> {showManifest ? 'Hide' : 'View'} Manifest
          </Button>
        </div>

        {/* Manifest Preview */}
        {showManifest && patch.manifest_json && (
          <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-auto max-h-48 border border-border/30">
            {JSON.stringify(patch.manifest_json, null, 2)}
          </pre>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
          <span>Created: {new Date(patch.created_at).toLocaleDateString()}</span>
          {patch.published_at && <span>Published: {new Date(patch.published_at).toLocaleDateString()}</span>}
          <span className="font-mono text-[10px]">{patch.id.slice(0, 8)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function DownloadAnalytics() {
  const { data: downloads = [] } = useDownloadStats();

  const byTier = downloads.reduce((acc: Record<string, number>, d: any) => {
    acc[d.license_tier || 'unknown'] = (acc[d.license_tier || 'unknown'] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-6 text-center">
            <Download className="w-8 h-8 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold text-foreground">{downloads.length}</div>
            <div className="text-sm text-muted-foreground">Total Downloads</div>
          </CardContent>
        </Card>
        {Object.entries(byTier).map(([tier, count]) => (
          <Card key={tier} className="border-border/50 bg-card/50">
            <CardContent className="pt-6 text-center">
              <TierBadge tier={tier} />
              <div className="text-2xl font-bold text-foreground mt-2">{count as number}</div>
              <div className="text-sm text-muted-foreground">{tier} tier downloads</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {downloads.length > 0 && (
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm">Recent Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {downloads.slice(0, 10).map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs border-b border-border/20 pb-1">
                  <span className="font-mono">{d.patch_id?.slice(0, 8)}</span>
                  <TierBadge tier={d.license_tier || 'free'} />
                  <span className="text-muted-foreground">{new Date(d.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <Shield className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
                Patch Distribution
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Author and manage patches for downstream distributions.
              </p>
            </div>
            <CreatePatchDialog />
          </div>

          {/* Canon Identity Banner */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-3 px-3 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <Shield className="w-5 h-5 text-primary shrink-0" />
              <div className="text-xs sm:text-sm">
                <span className="font-semibold text-foreground">Canon Lock Active</span>
                <span className="text-muted-foreground block sm:inline sm:ml-2">
                  Distribution: {DISTRIBUTION_ID} · Authority: TRUE
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="all">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="all" className="text-xs sm:text-sm">All ({patches.length})</TabsTrigger>
              <TabsTrigger value="draft" className="text-xs sm:text-sm">Drafts ({draftPatches.length})</TabsTrigger>
              <TabsTrigger value="published" className="text-xs sm:text-sm">Published ({publishedPatches.length})</TabsTrigger>
              <TabsTrigger value="revoked" className="text-xs sm:text-sm">Revoked ({revokedPatches.length})</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm">
                <Eye className="w-3 h-3 mr-1" /> Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {isLoading ? (
                <p className="text-muted-foreground">Loading patches...</p>
              ) : patches.length === 0 ? (
                <Card className="border-dashed border-border/50 bg-card/30">
                  <CardContent className="py-12 text-center">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No patches authored yet. Click "Author Patch" to create your first.</p>
                  </CardContent>
                </Card>
              ) : (
                patches.map(p => <PatchCard key={p.id} patch={p} />)
              )}
            </TabsContent>

            <TabsContent value="draft" className="space-y-4 mt-4">
              {draftPatches.map(p => <PatchCard key={p.id} patch={p} />)}
              {draftPatches.length === 0 && <p className="text-muted-foreground">No draft patches.</p>}
            </TabsContent>

            <TabsContent value="published" className="space-y-4 mt-4">
              {publishedPatches.map(p => <PatchCard key={p.id} patch={p} />)}
              {publishedPatches.length === 0 && <p className="text-muted-foreground">No published patches.</p>}
            </TabsContent>

            <TabsContent value="revoked" className="space-y-4 mt-4">
              {revokedPatches.map(p => <PatchCard key={p.id} patch={p} />)}
              {revokedPatches.length === 0 && <p className="text-muted-foreground">No revoked patches.</p>}
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <DownloadAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}
