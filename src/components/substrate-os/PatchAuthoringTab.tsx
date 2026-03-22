/**
 * CMPSBL® Patch Authoring Tab — Simple UI for creating LNCHBL patches
 * Governor-only. Never patched to LNCHBL — always CMPSBL-exclusive.
 * 
 * @distribution CMPSBL-only — NEVER include in downstream patches
 */

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  Package, Send, Ban, CheckCircle2, Clock, XCircle, 
  Shield, ChevronDown, ChevronUp, Sparkles, Layers, Zap
} from 'lucide-react';
import { DISTRIBUTION_ID } from '@/lib/distribution';
import { validatePatch, type PatchTier } from '@/lib/patches/author';
import { listEngines } from '@/lib/substrate/engines/registry';
import { cn } from '@/lib/utils';

// ─── Engine & Capability Data ────────────────────────────────────────────────

const ENGINE_GROUPS = [
  { label: 'Cognitive', ids: ['reasoning_engine', 'learning_engine', 'memory_engine', 'foresight_engine'] },
  { label: 'Operational', ids: ['resilience_engine', 'optimization_engine', 'orchestration_engine', 'scheduling_engine'] },
  { label: 'Intelligence', ids: ['synthesis_engine', 'adaptation_engine', 'insight_engine', 'prediction_engine'] },
  { label: 'Creativity', ids: ['imagination_engine', 'innovation_engine', 'dream_engine'] },
  { label: 'Perception', ids: ['intent_engine', 'emotion_engine', 'multimodal_engine'] },
  { label: 'Security', ids: ['threat_engine', 'defense_engine', 'trust_engine'] },
  { label: 'Governance', ids: ['compliance_engine', 'quality_engine', 'audit_engine'] },
  { label: 'Evolution', ids: ['evolution_engine', 'modernization_engine'] },
  { label: 'Resource', ids: ['budget_engine', 'quota_engine', 'entitlement_engine'] },
  { label: 'Communication', ids: ['broadcast_engine', 'event_engine'] },
  { label: 'Integration', ids: ['routing_engine', 'transformation_engine'] },
  { label: 'Analytics', ids: ['monitoring_engine', 'capacity_engine'] },
  { label: 'Experience & UI', ids: ['accessibility_engine', 'personalization_engine', 'audio_experience_engine', 'ui_theming_engine'] },
  { label: 'Knowledge', ids: ['graph_engine', 'context_engine'] },
  { label: 'Autonomy', ids: ['self_healing_engine', 'self_documentation_engine'] },
];

const POPULAR_CAPABILITIES = [
  'dream_synthesis', 'adaptive_routing', 'knowledge_graph_navigator',
  'semantic_similarity_ranker', 'memory_consolidation_engine',
  'latent_pattern_extractor', 'cognitive_load_balancer',
  'multi_intent_resolver', 'bot_defense_shield',
  'threat_intelligence_mesh', 'wcag_auto_remediation',
  'accessibility_scanner', 'nocturnal_optimization',
  'cross_domain_fusion', 'emotional_resonance_detector',
  'cost_governance_arbitrage', 'rate_limit_burst_prediction',
  'graph_topology_analyzer', 'context_window_optimizer',
  'self_healing_circuit_breaker',
];

// ─── Hooks ───────────────────────────────────────────────────────────────────

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

// ─── Components ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: typeof CheckCircle2; cls: string }> = {
    draft: { icon: Clock, cls: 'border-muted-foreground/30 text-muted-foreground bg-muted/30' },
    published: { icon: CheckCircle2, cls: 'border-neon-green/30 text-neon-green bg-neon-green/10' },
    revoked: { icon: XCircle, cls: 'border-destructive/30 text-destructive bg-destructive/10' },
  };
  const { icon: Icon, cls } = config[status] || config.draft;
  return <Badge variant="outline" className={cn('gap-1', cls)}><Icon className="w-3 h-3" />{status}</Badge>;
}

function TierBadge({ tier }: { tier: string }) {
  const cls: Record<string, string> = {
    free: 'border-neon-blue/30 text-neon-blue bg-neon-blue/10',
    builder: 'border-neon-amber/30 text-neon-amber bg-neon-amber/10',
    pro: 'border-neon-purple/30 text-neon-purple bg-neon-purple/10',
  };
  return <Badge variant="outline" className={cls[tier] || cls.free}>{tier}</Badge>;
}

// ─── Persistence Keys ────────────────────────────────────────────────────────
const PATCH_ENGINES_KEY = 'cmpsbl_patch_selected_engines';
const PATCH_CAPS_KEY = 'cmpsbl_patch_selected_caps';

import { secureGet, secureSet } from '@/lib/system/secureStorage';

function loadPersistedSet(key: string): Set<string> {
  try {
    const stored = secureGet<string[]>(key);
    if (stored) return new Set(stored);
  } catch { /* Storage unavailable — start fresh */ }
  return new Set();
}

function persistSet(key: string, set: Set<string>) {
  secureSet(key, Array.from(set));
}

// ─── Create Patch Form ───────────────────────────────────────────────────────

function CreatePatchForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [version, setVersion] = useState('');
  const [tier, setTier] = useState<PatchTier>('free');
  const [selectedEngines, setSelectedEngines] = useState<Set<string>>(() => loadPersistedSet(PATCH_ENGINES_KEY));
  const [selectedCaps, setSelectedCaps] = useState<Set<string>>(() => loadPersistedSet(PATCH_CAPS_KEY));
  const [changelog, setChangelog] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleEngine = (id: string) => {
    setSelectedEngines(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      persistSet(PATCH_ENGINES_KEY, next);
      return next;
    });
  };

  const toggleCap = (id: string) => {
    setSelectedCaps(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      persistSet(PATCH_CAPS_KEY, next);
      return next;
    });
  };

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(groupLabel) ? next.delete(groupLabel) : next.add(groupLabel);
      return next;
    });
  };

  const selectAllInGroup = (ids: string[]) => {
    setSelectedEngines(prev => {
      const next = new Set(prev);
      const allSelected = ids.every(id => next.has(id));
      ids.forEach(id => allSelected ? next.delete(id) : next.add(id));
      persistSet(PATCH_ENGINES_KEY, next);
      return next;
    });
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const enginesArr = Array.from(selectedEngines);
      const capsArr = Array.from(selectedCaps);

      if (enginesArr.length === 0 && capsArr.length === 0) {
        throw new Error('Select at least one engine or capability to unlock');
      }

      const validation = validatePatch({
        version,
        targetDistribution: 'LNCHBL',
        requiredTier: tier,
        enginesUnlocked: enginesArr,
        capabilitiesUnlocked: capsArr,
        changelog,
        files: [],
      });

      if (!validation.valid) throw new Error(validation.errors.join('; '));

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
      const signature = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

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
      toast.success('Patch created as draft!');
      queryClient.invalidateQueries({ queryKey: ['cmpsbl-patches'] });
      setVersion('');
      setSelectedEngines(new Set());
      setSelectedCaps(new Set());
      setChangelog('');
      onSuccess();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create patch'),
  });

  return (
    <div className="space-y-6">
      {/* Step 1: Version & Tier */}
      <Card className="border-border/40 bg-muted/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</span>
            Version & Tier
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Patch Version</label>
            <Input value={version} onChange={e => setVersion(e.target.value)} placeholder="e.g. 1.2.0" className="bg-background" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Minimum License Tier</label>
            <Select value={tier} onValueChange={v => setTier(v as PatchTier)}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">🆓 Free — Anyone</SelectItem>
                <SelectItem value="builder">🔨 Builder — Paid</SelectItem>
                <SelectItem value="pro">⭐ Pro — Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Pick Engines */}
      <Card className="border-border/40 bg-muted/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</span>
            <Layers className="w-4 h-4" />
            Select Engines to Unlock
            {selectedEngines.size > 0 && (
              <Badge variant="outline" className="ml-2 border-primary/30 text-primary bg-primary/10">
                {selectedEngines.size} selected
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Click a category to expand, then check the engines you want to include.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {ENGINE_GROUPS.map(group => {
            const isExpanded = expandedGroups.has(group.label);
            const selectedInGroup = group.ids.filter(id => selectedEngines.has(id)).length;
            return (
              <div key={group.label} className="border border-border/30 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{group.label}</span>
                    <span className="text-xs text-muted-foreground">({group.ids.length})</span>
                    {selectedInGroup > 0 && (
                      <Badge variant="outline" className="text-[10px] border-neon-green/30 text-neon-green bg-neon-green/10">
                        {selectedInGroup} ✓
                      </Badge>
                    )}
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2 border-t border-border/20 pt-2">
                    <button
                      onClick={() => selectAllInGroup(group.ids)}
                      className="text-[10px] text-primary hover:underline"
                    >
                      {group.ids.every(id => selectedEngines.has(id)) ? 'Deselect all' : 'Select all'}
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {group.ids.map(id => (
                        <label
                          key={id}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm",
                            selectedEngines.has(id)
                              ? "bg-primary/10 border border-primary/30"
                              : "hover:bg-muted/30 border border-transparent"
                          )}
                        >
                          <Checkbox
                            checked={selectedEngines.has(id)}
                            onCheckedChange={() => toggleEngine(id)}
                          />
                          <span className="font-mono text-xs">{id.replace(/_/g, ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Step 3: Pick Capabilities */}
      <Card className="border-border/40 bg-muted/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">3</span>
            <Sparkles className="w-4 h-4" />
            Select Capabilities to Unlock
            {selectedCaps.size > 0 && (
              <Badge variant="outline" className="ml-2 border-primary/30 text-primary bg-primary/10">
                {selectedCaps.size} selected
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Pick individual capabilities to include in this patch.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
            {POPULAR_CAPABILITIES.map(id => (
              <label
                key={id}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm",
                  selectedCaps.has(id)
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-muted/30 border border-transparent"
                )}
              >
                <Checkbox
                  checked={selectedCaps.has(id)}
                  onCheckedChange={() => toggleCap(id)}
                />
                <span className="font-mono text-xs">{id.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Changelog & Submit */}
      <Card className="border-border/40 bg-muted/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">4</span>
            What does this patch do?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={changelog}
            onChange={e => setChangelog(e.target.value)}
            placeholder="Describe what this patch unlocks for LNCHBL users..."
            rows={3}
            className="bg-background"
          />
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {selectedEngines.size} engines + {selectedCaps.size} capabilities → LNCHBL ({tier} tier)
            </div>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !version || !changelog}
              className="gap-2"
            >
              {createMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Package className="w-4 h-4" />
              )}
              Create Draft Patch
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Patch List ──────────────────────────────────────────────────────────────

function PatchListItem({ patch }: { patch: PatchRow }) {
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async (newStatus: string) => {
      // LNCHBL shares the same backend — no remote dispatch needed

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
    onError: (err: any) => toast.error(err.message || 'Failed to update patch'),
  });

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-muted/5 hover:bg-muted/10 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <Package className="w-4 h-4 text-primary flex-shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-medium">v{patch.version}</span>
            <StatusBadge status={patch.status} />
            <TierBadge tier={patch.required_tier} />
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{patch.changelog || 'No description'}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {patch.engines_unlocked?.slice(0, 3).map(e => (
              <span key={e} className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">{e.replace(/_/g, ' ')}</span>
            ))}
            {(patch.engines_unlocked?.length || 0) > 3 && (
              <span className="text-[10px] text-muted-foreground">+{patch.engines_unlocked.length - 3} more</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {patch.status === 'draft' && (
          <Button size="sm" variant="outline" onClick={() => updateStatus.mutate('published')} disabled={updateStatus.isPending} className="gap-1 text-xs h-7">
            <Send className="w-3 h-3" /> Publish
          </Button>
        )}
        {patch.status === 'published' && (
          <Button size="sm" variant="outline" onClick={() => updateStatus.mutate('revoked')} disabled={updateStatus.isPending} className="gap-1 text-xs h-7 text-destructive hover:text-destructive">
            <Ban className="w-3 h-3" /> Revoke
          </Button>
        )}
        {patch.status === 'revoked' && (
          <Button size="sm" variant="outline" onClick={() => updateStatus.mutate('draft')} disabled={updateStatus.isPending} className="gap-1 text-xs h-7">
            Restore
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Main Tab ────────────────────────────────────────────────────────────────

export function PatchAuthoringTab() {
  const { data: patches = [], isLoading } = usePatches();
  const [showCreate, setShowCreate] = useState(true);

  const draftCount = patches.filter(p => p.status === 'draft').length;
  const publishedCount = patches.filter(p => p.status === 'published').length;

  return (
    <motion.main
      className="container mx-auto px-4 py-6 max-w-5xl space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            Patch Authoring
            <Badge variant="outline" className="text-[10px] border-neon-green/30 text-neon-green bg-neon-green/10">
              {DISTRIBUTION_ID} → LNCHBL
            </Badge>
          </h2>
          <p className="text-xs text-muted-foreground font-mono">
            select engines & capabilities • set tier • publish
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/30 bg-muted/10">
          <CardContent className="py-3 text-center">
            <div className="text-xl font-bold">{patches.length}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</div>
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-muted/10">
          <CardContent className="py-3 text-center">
            <div className="text-xl font-bold text-neon-amber">{draftCount}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Drafts</div>
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-muted/10">
          <CardContent className="py-3 text-center">
            <div className="text-xl font-bold text-neon-green">{publishedCount}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Published</div>
          </CardContent>
        </Card>
      </div>

      {/* Toggle */}
      <div className="flex gap-2 p-1 rounded-xl bg-muted/20 border border-border/30 w-fit">
        <button
          onClick={() => setShowCreate(true)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            showCreate
              ? "bg-primary/20 text-primary border border-primary/30"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          )}
        >
          <Zap className="w-4 h-4" /> New Patch
        </button>
        <button
          onClick={() => setShowCreate(false)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            !showCreate
              ? "bg-primary/20 text-primary border border-primary/30"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          )}
        >
          <Package className="w-4 h-4" /> All Patches ({patches.length})
        </button>
      </div>

      {/* Content */}
      {showCreate ? (
        <CreatePatchForm onSuccess={() => setShowCreate(false)} />
      ) : (
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading patches...</div>
          ) : patches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No patches yet. Create your first one!
            </div>
          ) : (
            patches.map(patch => <PatchListItem key={patch.id} patch={patch} />)
          )}
        </div>
      )}
    </motion.main>
  );
}
