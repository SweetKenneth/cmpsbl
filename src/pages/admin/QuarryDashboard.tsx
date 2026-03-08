/**
 * Quarry — Strategic Asset Registry (Admin)
 * Internal management interface for tier assignment, visibility, and scoring
 */
import { useState, useMemo } from 'react';
import { useQuarryAssets } from '@/hooks/useQuarryAssets';
import { SidebarProvider } from '@/components/ui/sidebar';
import { UnifiedAdminSidebar } from '@/components/admin/UnifiedAdminSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  TIER_LABELS, ASSET_TYPE_LABELS, VISIBILITY_LABELS, computeAssetScore,
  type QuarryTier, type QuarryAssetType, type QuarryVisibility, type QuarryAsset,
} from '@/lib/quarry/types';
import { PackReleaseChecklist } from '@/components/admin/PackReleaseChecklist';
import {
  Search, Plus, Save, Trash2, Filter, Package, Brain,
  Cpu, Layers, Workflow, Bot, Shield, Settings, Crown, Eye, EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

const TIER_COLORS: Record<QuarryTier, string> = {
  free: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  creator: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  architect: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  enterprise: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  internal: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

const TYPE_ICONS: Partial<Record<QuarryAssetType, React.ElementType>> = {
  capability: Brain,
  engine: Cpu,
  meta_engine: Layers,
  pipeline: Workflow,
  template: Package,
  agent: Bot,
  governance_tool: Shield,
  deployment_right: Settings,
};

function AssetRow({ asset, onUpdate, onDelete }: {
  asset: QuarryAsset;
  onUpdate: (a: Partial<QuarryAsset> & { asset_key: string; asset_type: QuarryAssetType; name: string }) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [tier, setTier] = useState(asset.tier);
  const [visibility, setVisibility] = useState(asset.visibility);
  const [futureRelease, setFutureRelease] = useState(asset.future_release);
  const score = computeAssetScore(asset);
  const Icon = TYPE_ICONS[asset.asset_type] ?? Package;

  const handleSave = () => {
    onUpdate({ asset_key: asset.asset_key, asset_type: asset.asset_type, name: asset.name, tier, visibility, future_release: futureRelease });
    setEditing(false);
  };

  return (
    <div className={cn(
      "group flex items-center gap-3 px-4 py-3 rounded-lg border transition-all",
      editing ? "border-primary/50 bg-primary/5" : "border-border/50 hover:border-primary/15 hover:bg-card/80 bg-card/50"
    )}>
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{asset.name}</span>
          <Badge variant="outline" className="text-[10px]">{ASSET_TYPE_LABELS[asset.asset_type]}</Badge>
          {asset.future_release && <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">Future</Badge>}
        </div>
        {asset.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{asset.description}</p>}
      </div>

      {/* Score */}
      <div className="text-xs text-muted-foreground w-12 text-right shrink-0">
        {(score * 100).toFixed(0)}%
      </div>

      {/* Tier */}
      {editing ? (
        <Select value={tier} onValueChange={(v) => setTier(v as QuarryTier)}>
          <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(TIER_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : (
        <Badge className={cn("text-[10px] border", TIER_COLORS[asset.tier])}>{TIER_LABELS[asset.tier]}</Badge>
      )}

      {/* Visibility */}
      {editing ? (
        <Select value={visibility} onValueChange={(v) => setVisibility(v as QuarryVisibility)}>
          <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(VISIBILITY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : (
        <span className="text-xs text-muted-foreground w-20 text-center">
          {asset.visibility === 'hidden' ? <EyeOff className="w-3 h-3 inline" /> : <Eye className="w-3 h-3 inline" />}
          <span className="ml-1">{VISIBILITY_LABELS[asset.visibility]}</span>
        </span>
      )}

      {/* Future release toggle */}
      {editing && (
        <Switch checked={futureRelease} onCheckedChange={setFutureRelease} />
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {editing ? (
          <>
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleSave}><Save className="w-3 h-3" /></Button>
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setEditing(false)}>Cancel</Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="ghost" className="h-7 px-2 opacity-0 group-hover:opacity-100" onClick={() => setEditing(true)}>Edit</Button>
            <Button size="sm" variant="ghost" className="h-7 px-2 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => onDelete(asset.id)}><Trash2 className="w-3 h-3" /></Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function QuarryDashboard() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const { assets, isLoading, upsert, remove } = useQuarryAssets();

  const filtered = useMemo(() => {
    let list = assets;
    if (search) list = list.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.asset_key.toLowerCase().includes(search.toLowerCase()));
    if (typeFilter !== 'all') list = list.filter(a => a.asset_type === typeFilter);
    if (tierFilter !== 'all') list = list.filter(a => a.tier === tierFilter);
    return list;
  }, [assets, search, typeFilter, tierFilter]);

  const stats = useMemo(() => {
    const byType: Record<string, number> = {};
    const byTier: Record<string, number> = {};
    assets.forEach(a => {
      byType[a.asset_type] = (byType[a.asset_type] ?? 0) + 1;
      byTier[a.tier] = (byTier[a.tier] ?? 0) + 1;
    });
    return { byType, byTier, total: assets.length };
  }, [assets]);

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <UnifiedAdminSidebar />
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold gradient-text">Quarry</h1>
            <p className="text-sm text-muted-foreground">Strategic Asset Registry — Tier assignment, visibility, and value scoring</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(TIER_LABELS).map(([k, v]) => (
              <div key={k} className={cn("rounded-lg border p-3 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300", (TIER_COLORS[k as QuarryTier] ?? '').replace('text-', 'border-').split(' ')[2])}>
                <div className="text-2xl font-bold font-mono tabular-nums">{stats.byTier[k] ?? 0}</div>
                <div className="text-xs text-muted-foreground">{v}</div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search assets..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36 h-9"><Filter className="w-3 h-3 mr-1" /><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(ASSET_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-32 h-9"><Crown className="w-3 h-3 mr-1" /><SelectValue placeholder="Tier" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                {Object.entries(TIER_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{filtered.length} / {stats.total} assets</span>
          </div>

          {/* Pack Density / Release Checklist */}
          <PackReleaseChecklist />

          {/* Asset List */}
          <div className="space-y-1">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading Quarry...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {stats.total === 0 ? 'Quarry is empty. Seed assets from the substrate to get started.' : 'No assets match filters.'}
              </div>
            ) : (
              filtered.map(a => (
                <AssetRow
                  key={a.id}
                  asset={a}
                  onUpdate={(data) => upsert.mutate(data)}
                  onDelete={(id) => remove.mutate(id)}
                />
              ))
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
