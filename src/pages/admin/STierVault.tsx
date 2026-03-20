import { useState, useMemo, useCallback, useEffect } from "react";
import { getFunctionalDescription, getEnrichedDescription } from '@/lib/pipeline-descriptions';
import { estimateMarketValue, formatMarketValue, getTierFromScore } from '@/lib/pipeline-valuation';
import { generatePipelineDetailsHTML } from '@/lib/export/pipeline-details-page';
import { humanizeCapabilityName } from '@/lib/export/humanize-name';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, Copy, Download, Eye, Search, Lock, CheckCircle,
  Code2, Package, ChevronDown, ChevronUp, FileCode, Globe,
  Zap, Loader2, ArrowUpDown, DollarSign, TrendingUp,
  BarChart3, ArrowUp, Filter, RefreshCw,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { AdminLayout } from "@/components/admin/AdminLayout";
import registryData from "@/crownjewels/s-tier.registry.json";
import type { STierEntry } from "@/crownjewels/types";
import {
  generateSingleExport, generateExportBundle, downloadBundle,
  getAllLanguages, getAllAdapters,
  type ExportLanguage, type ExportAdapter, type ExportableArtifact, type ExportTarget,
} from "@/lib/export/universal-adapter";
import { contextFromDiscovery, type SynthesisContext } from "@/lib/export/logic-synthesizer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePricingEngine } from "@/hooks/usePricingEngine";
import { formatPrice } from "@/lib/foundry/pricing-engine";
import type { PricingArtifact } from "@/lib/foundry/pricing-engine";

const entries = registryData.entries as STierEntry[];

const CODE_FILES: Record<number, () => Promise<{ default: string }>> = {
  1: () => import("@/crownjewels/s-tier/001-substrate-registry.ts?raw"),
  2: () => import("@/crownjewels/s-tier/002-fleet-intelligence-orchestrator.ts?raw"),
  3: () => import("@/crownjewels/s-tier/003-multi-modal-interpreter.ts?raw"),
  4: () => import("@/crownjewels/s-tier/004-autonomous-triage-engine.ts?raw"),
  5: () => import("@/crownjewels/s-tier/005-consensus-heartbeat-protocol.ts?raw"),
  6: () => import("@/crownjewels/s-tier/006-cost-aware-routing-engine.ts?raw"),
  7: () => import("@/crownjewels/s-tier/007-anomaly-correlation-engine.ts?raw"),
  8: () => import("@/crownjewels/s-tier/008-self-healing-orchestrator.ts?raw"),
  9: () => import("@/crownjewels/s-tier/009-tamper-evident-chain.ts?raw"),
  10: () => import("@/crownjewels/s-tier/010-write-ahead-log-engine.ts?raw"),
  11: () => import("@/crownjewels/s-tier/011-circuit-breaker.ts?raw"),
  12: () => import("@/crownjewels/s-tier/012-rate-limiter.ts?raw"),
  13: () => import("@/crownjewels/s-tier/013-state-machine.ts?raw"),
  14: () => import("@/crownjewels/s-tier/014-event-sourcing.ts?raw"),
  15: () => import("@/crownjewels/s-tier/015-feature-flags.ts?raw"),
  16: () => import("@/crownjewels/s-tier/016-cache-engine.ts?raw"),
  17: () => import("@/crownjewels/s-tier/017-pipeline-engine.ts?raw"),
  18: () => import("@/crownjewels/s-tier/018-consensus-engine.ts?raw"),
  19: () => import("@/crownjewels/s-tier/019-scheduler-engine.ts?raw"),
};

const MODULE_COLORS: Record<string, string> = {
  CORE: "bg-red-500/20 text-red-400 border-red-500/30",
  NEXUS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  DECODE: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  MEDIC: "bg-green-500/20 text-green-400 border-green-500/30",
  NERVE: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  VISION: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  IMMUNITY: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  AUDIT: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  MEMORY: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  BRAIN: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  CORTEX: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  DREAM: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30",
  GOVERNANCE: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  EVOLUTION: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  SYSTEM: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  DEFENSE: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  ANALYTICS: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  SOVEREIGN: "bg-amber-600/20 text-amber-300 border-amber-500/30",
  ORACLE: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  CONSCIENCE: "bg-emerald-600/20 text-emerald-300 border-emerald-500/30",
  PHANTOM: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  FORGE: "bg-orange-600/20 text-orange-300 border-orange-500/30",
  LINGUA: "bg-blue-600/20 text-blue-300 border-blue-500/30",
  COMPASS: "bg-cyan-600/20 text-cyan-300 border-cyan-500/30",
  ECHO: "bg-purple-600/20 text-purple-300 border-purple-500/30",
  TREATY: "bg-yellow-600/20 text-yellow-300 border-yellow-500/30",
  HARVEST: "bg-green-600/20 text-green-300 border-green-500/30",
  REFLEX: "bg-red-600/20 text-red-300 border-red-500/30",
};

function getCJPIColor(cjpi: number): string {
  if (cjpi >= 96) return "text-yellow-400 bg-yellow-500/20 border-yellow-500/40";
  if (cjpi >= 92) return "text-orange-400 bg-orange-500/20 border-orange-500/40";
  if (cjpi >= 88) return "text-blue-400 bg-blue-500/20 border-blue-500/40";
  return "text-muted-foreground bg-muted border-border";
}

function getTierLabel(cjpi: number): string {
  if (cjpi >= 100) return 'Apex';
  if (cjpi >= 94) return 'Mythic';
  if (cjpi >= 90) return 'Relic';
  if (cjpi >= 80) return 'Prime';
  if (cjpi >= 68) return 'Mint';
  return 'Raw';
}

const LANGUAGES = getAllLanguages();
const ADAPTERS = getAllAdapters();

// ─── Market Value (uses shared @/lib/pipeline-valuation) ────────────

type SortMode = 'cjpi' | 'market_value' | 'name' | 'category';


interface PromotedDiscovery {
  id: string;
  discovery_id: string;
  name: string;
  cjpi: number;
  category: string;
  module_chain: string[];
  description: string;
  status: string;
  tier: string;
  export_ready: boolean;
  promoted_at: string;
  run_id: string;
}

// ─── Analytics Summary Panel ────────────────────────────────────────

function AnalyticsSummary({ registryEntries, promoted }: { registryEntries: STierEntry[]; promoted: PromotedDiscovery[] }) {
  const stats = useMemo(() => {
    // Registry stats
    const byModule: Record<string, number> = {};
    const byTier = { Apex: 0, Mythic: 0, Relic: 0, Prime: 0, Mint: 0, Raw: 0 };
    let totalRegValue = 0;
    for (const e of registryEntries) {
      byModule[e.module] = (byModule[e.module] ?? 0) + 1;
      const tier = getTierLabel(e.cjpi);
      byTier[tier as keyof typeof byTier]++;
      totalRegValue += estimateMarketValue(e.cjpi, e.type, Math.max(1, e.dependencyFootprint.length));
    }

    // Promoted stats
    const promByCategory: Record<string, number> = {};
    let totalPromValue = 0;
    for (const d of promoted) {
      promByCategory[d.category] = (promByCategory[d.category] ?? 0) + 1;
      totalPromValue += estimateMarketValue(d.cjpi, d.category, (d.module_chain || []).length);
    }

    const avgCjpi = registryEntries.length > 0
      ? Math.round(registryEntries.reduce((s, e) => s + e.cjpi, 0) / registryEntries.length * 10) / 10
      : 0;

    const codeReady = registryEntries.filter(e => e.hasCode).length;
    const approved = registryEntries.filter(e => e.approved).length;
    const canonicalSet = new Set(registryData.canonicalModules as string[]);
    const totalModules = canonicalSet.size;
    const moduleCoverage = Math.min(Object.keys(byModule).filter(m => canonicalSet.has(m)).length, totalModules);

    return {
      byModule, byTier, totalRegValue, promByCategory, totalPromValue,
      avgCjpi, codeReady, approved, moduleCoverage, totalModules,
    };
  }, [registryEntries, promoted]);

  const topModules = useMemo(() =>
    Object.entries(stats.byModule).sort((a, b) => b[1] - a[1]).slice(0, 8),
    [stats.byModule]
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
      <Card className="border-border/50 hover:border-primary/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
        <CardContent className="p-3 text-center">
          <div className="text-2xl font-bold font-mono tabular-nums text-foreground">{registryEntries.length}</div>
          <div className="text-[10px] text-muted-foreground">Registry Discoveries</div>
        </CardContent>
      </Card>
      <Card className="border-border/50 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
        <CardContent className="p-3 text-center">
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-400">{promoted.length}</div>
          <div className="text-[10px] text-muted-foreground">Discovered</div>
        </CardContent>
      </Card>
      <Card className="border-border/50 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
        <CardContent className="p-3 text-center">
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">{formatMarketValue(stats.totalRegValue + stats.totalPromValue)}</div>
          <div className="text-[10px] text-muted-foreground">Total Est. Value</div>
        </CardContent>
      </Card>
      <Card className="border-border/50 hover:border-primary/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
        <CardContent className="p-3 text-center">
          <div className="text-2xl font-bold font-mono tabular-nums text-foreground">{stats.avgCjpi}</div>
          <div className="text-[10px] text-muted-foreground">Avg CJPI</div>
        </CardContent>
      </Card>
      <Card className="border-border/50 hover:border-primary/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
        <CardContent className="p-3 text-center">
          <div className="text-2xl font-bold font-mono tabular-nums text-foreground">{stats.moduleCoverage}/{stats.totalModules}</div>
          <div className="text-[10px] text-muted-foreground">Node Coverage</div>
        </CardContent>
      </Card>
      <Card className="border-border/50 hover:border-primary/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
        <CardContent className="p-3 text-center">
          <div className="text-2xl font-bold font-mono tabular-nums text-foreground">{stats.codeReady}</div>
          <div className="text-[10px] text-muted-foreground">Code Ready</div>
        </CardContent>
      </Card>

      {/* Tier breakdown */}
      <Card className="col-span-2 border-border/50 hover:border-primary/15 transition-all duration-300">
        <CardContent className="p-3">
          <div className="text-[10px] font-medium text-muted-foreground mb-2">Tier Breakdown</div>
          <div className="space-y-1">
            {Object.entries(stats.byTier).map(([tier, count]) => (
              <div key={tier} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{tier}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(count / registryEntries.length) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono tabular-nums w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top modules */}
      <Card className="col-span-2 sm:col-span-2 lg:col-span-4 border-border/50 hover:border-primary/15 transition-all duration-300">
        <CardContent className="p-3">
          <div className="text-[10px] font-medium text-muted-foreground mb-2">Top Modules</div>
          <div className="flex flex-wrap gap-1.5">
            {topModules.map(([mod, count]) => (
              <Badge key={mod} variant="outline" className={`text-[10px] ${MODULE_COLORS[mod] ?? ''}`}>
                {mod} ({count})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Discovery Card (Mobile-first, no truncation) ────────────────────

function ArtifactCard({
  entry, onViewCode, onExport, loadingCode, expanded, onToggle,
}: {
  entry: STierEntry; onViewCode: (e: STierEntry) => void; onExport: (e: STierEntry) => void;
  loadingCode: boolean; expanded: boolean; onToggle: () => void;
}) {
  const chainLength = Math.max(1, entry.dependencyFootprint.length);
  const entryValue = estimateMarketValue(entry.cjpi, entry.type, chainLength);

  return (
    <Card className="border-border/50 hover:border-border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="font-mono text-sm font-bold text-muted-foreground">#{entry.rank}</span>
          <Badge variant="outline" className={`font-mono text-xs ${getCJPIColor(entry.cjpi)}`}>{entry.cjpi}</Badge>
          <Badge variant="outline" className={`text-xs border ${MODULE_COLORS[entry.module] ?? "bg-muted text-muted-foreground"}`}>{entry.module}</Badge>
          <Badge variant="outline" className="text-xs">{entry.type}</Badge>
          <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
            <DollarSign className="w-3 h-3 mr-0.5" />
            {formatMarketValue(entryValue)}
          </Badge>
          {entry.approved ? (
            <CheckCircle className="w-4 h-4 text-green-400 ml-auto shrink-0" />
          ) : (
            <Lock className="w-4 h-4 text-muted-foreground/50 ml-auto shrink-0" />
          )}
        </div>
        <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1 break-words">{entry.name}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 break-words">{entry.description}</p>
        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mb-3">
          <code className="font-mono bg-muted/50 px-1.5 py-0.5 rounded">{entry.signatureHash}</code>
          <span>v{entry.version}</span>
          <span>{entry.exportMode === 'PureStandalone' ? '✦ Standalone' : '⚡ Adapter Required'}</span>
        </div>
        {entry.dependencyFootprint.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mb-3">
            <span className="text-xs text-muted-foreground">Deps:</span>
            {entry.dependencyFootprint.map(dep => (
              <Badge key={dep} variant="outline" className="text-[10px] px-1.5 py-0">{dep}</Badge>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {entry.hasCode && (
            <Button variant="outline" size="sm" onClick={() => onViewCode(entry)} disabled={loadingCode} className="gap-1.5 text-xs">
              <Eye className="w-3.5 h-3.5" /> View Source
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onExport(entry)} className="gap-1.5 text-xs">
            <Globe className="w-3.5 h-3.5" /> Universal Export
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggle} className="ml-auto gap-1 text-xs">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Less' : 'Details'}
          </Button>
        </div>
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-muted-foreground">ID:</span> <code className="font-mono">{entry.id}</code></div>
              <div><span className="text-muted-foreground">Rank:</span> #{entry.rank}</div>
              <div><span className="text-muted-foreground">CJPI:</span> {entry.cjpi}</div>
              <div><span className="text-muted-foreground">Node:</span> {entry.module}</div>
              <div><span className="text-muted-foreground">Type:</span> {entry.type}</div>
              <div><span className="text-muted-foreground">Export:</span> {entry.exportMode}</div>
              <div className="col-span-2"><span className="text-muted-foreground">Est. Market Value:</span> <span className="font-semibold text-emerald-400">{formatMarketValue(entryValue)}</span></div>
              <div className="col-span-2"><span className="text-muted-foreground">Signature:</span> <code className="font-mono">{entry.signatureHash}</code></div>
              <div className="col-span-2"><span className="text-muted-foreground">Generated:</span> {new Date(entry.generatedAt).toLocaleDateString()}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Promoted Discovery Card ───────────────────────────────────────

function PromotedCard({
  discovery, onExport, onPromote, expanded, onToggle, promoting,
}: {
  discovery: PromotedDiscovery; onExport: (d: PromotedDiscovery) => void;
  onPromote: (d: PromotedDiscovery) => void;
  expanded: boolean; onToggle: () => void; promoting: boolean;
}) {
  const modules = discovery.module_chain || [];
  return (
    <Card className="border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm bg-amber-500/5">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-400 bg-amber-500/10">
            <Zap className="w-3 h-3 mr-1" /> DISCOVERED
          </Badge>
          <Badge variant="outline" className={`font-mono text-xs ${getCJPIColor(discovery.cjpi)}`}>{discovery.cjpi}</Badge>
          <Badge variant="outline" className="text-xs capitalize">{discovery.category}</Badge>
          <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
            <DollarSign className="w-3 h-3 mr-0.5" />
            {formatMarketValue(estimateMarketValue(discovery.cjpi, discovery.category, modules.length))}
          </Badge>
          {discovery.export_ready && (
            <CheckCircle className="w-4 h-4 text-green-400 ml-auto shrink-0" />
          )}
        </div>
        <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1 break-words">{discovery.name}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-2 break-words">
          {getEnrichedDescription(discovery.description, discovery.name, modules)}
        </p>
        <p className="text-[10px] text-primary/70 font-mono mb-3 leading-relaxed">
          {getFunctionalDescription(discovery.name, modules)}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => onExport(discovery)} className="gap-1.5 text-xs border-amber-500/40 text-amber-400 hover:bg-amber-500/10">
            <Globe className="w-3.5 h-3.5" /> Universal Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => onPromote(discovery)} disabled={promoting} className="gap-1.5 text-xs border-green-500/40 text-green-400 hover:bg-green-500/10">
            <ArrowUp className="w-3.5 h-3.5" /> Promote to Registry
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggle} className="ml-auto gap-1 text-xs">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Less' : 'Details'}
          </Button>
        </div>
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-muted-foreground">Discovery ID:</span> <code className="font-mono text-[10px]">{discovery.discovery_id}</code></div>
              <div><span className="text-muted-foreground">CJPI:</span> {discovery.cjpi}</div>
              <div><span className="text-muted-foreground">Category:</span> {discovery.category}</div>
              <div><span className="text-muted-foreground">Tier:</span> {discovery.tier}</div>
              <div><span className="text-muted-foreground">Status:</span> {discovery.status}</div>
              <div><span className="text-muted-foreground">Export Ready:</span> {discovery.export_ready ? '✓' : '✗'}</div>
              <div className="col-span-2"><span className="text-muted-foreground">Est. Market Value:</span> <span className="font-semibold text-emerald-400">{formatMarketValue(estimateMarketValue(discovery.cjpi, discovery.category, modules.length))}</span></div>
              <div className="col-span-2"><span className="text-muted-foreground">Promoted:</span> {new Date(discovery.promoted_at).toLocaleString()}</div>
              <div className="col-span-2"><span className="text-muted-foreground">Run:</span> <code className="font-mono text-[10px]">{discovery.run_id}</code></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Export Dialog ──────────────────────────────────────────────────

function ExportDialog({
  entry, sourceCode, onClose,
}: {
  entry: { id: string; name: string; rank: number; cjpi: number; module: string; description: string; synthesisContext?: SynthesisContext };
  sourceCode: string; onClose: () => void;
}) {
  const [selectedLang, setSelectedLang] = useState<ExportLanguage>('typescript');
  const [selectedAdapter, setSelectedAdapter] = useState<ExportAdapter>('standalone');
  const [previewCode, setPreviewCode] = useState<string>('');

  // Build synthesis context for full code generation
  const synthCtx: SynthesisContext = entry.synthesisContext || {
    name: entry.name,
    description: entry.description,
    category: entry.module.toLowerCase(),
    moduleChain: [entry.module],
    entryCapability: 'input',
    exitCapability: 'output',
    errorStrategy: 'retry',
    maxExecutionMs: 30000,
    cjpi: entry.cjpi,
  };

  const artifact: ExportableArtifact = {
    id: entry.id, name: entry.name, rank: entry.rank,
    cjpi: entry.cjpi, module: entry.module,
    description: entry.description, sourceCode,
    synthesisContext: synthCtx,
  };

  const handlePreview = useCallback(() => {
    const bundle = generateSingleExport(artifact, selectedLang, selectedAdapter);
    const mainFile = bundle.files.find(f => f.language === selectedLang);
    setPreviewCode(mainFile?.content ?? bundle.files[0]?.content ?? '');
  }, [selectedLang, selectedAdapter, artifact]);

  const handleDownloadSingle = async () => {
    const bundle = generateSingleExport(artifact, selectedLang, selectedAdapter);
    await downloadBundle(bundle);
  };

  const handleDownloadAll = async () => {
    const targets: ExportTarget[] = LANGUAGES.map(l => ({ language: l.value, adapter: selectedAdapter }));
    const bundle = generateExportBundle(artifact, targets);
    await downloadBundle(bundle);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap text-base">
            <Package className="w-5 h-5 text-primary" />
            <span>Universal Export — {entry.name}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Language</label>
              <Select value={selectedLang} onValueChange={v => setSelectedLang(v as ExportLanguage)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(l => (<SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Adapter</label>
              <Select value={selectedAdapter} onValueChange={v => setSelectedAdapter(v as ExportAdapter)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ADAPTERS.map(a => (<SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={handlePreview} className="gap-1.5"><Eye className="w-3.5 h-3.5" /> Preview</Button>
            <Button size="sm" variant="outline" onClick={handleDownloadSingle} className="gap-1.5"><FileCode className="w-3.5 h-3.5" /> Download {LANGUAGES.find(l => l.value === selectedLang)?.label}</Button>
            <Button size="sm" onClick={handleDownloadAll} className="gap-1.5"><Download className="w-3.5 h-3.5" /> Download All Languages (ZIP)</Button>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Software Languages</h4>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {LANGUAGES.filter(l => !['verilog','vhdl','systemverilog','chisel','amaranth','spice','systemc'].includes(l.value)).map(l => (
                <Badge key={l.value} variant={l.value === selectedLang ? 'default' : 'outline'} className="text-[10px] cursor-pointer" onClick={() => setSelectedLang(l.value)}>{l.label}</Badge>
              ))}
            </div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Hardware / HDL (FPGA &amp; ASIC)</h4>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.filter(l => ['verilog','vhdl','systemverilog','chisel','amaranth','spice','systemc'].includes(l.value)).map(l => (
                <Badge key={l.value} variant={l.value === selectedLang ? 'default' : 'outline'} className="text-[10px] cursor-pointer border-amber-500/40 text-amber-400" onClick={() => setSelectedLang(l.value)}>⚡ {l.label}</Badge>
              ))}
            </div>
          </div>
          {previewCode && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Preview</h4>
                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(previewCode)} className="gap-1 text-xs"><Copy className="w-3 h-3" /> Copy</Button>
              </div>
              <ScrollArea className="h-[40vh] sm:h-[50vh]">
                <pre className="text-xs font-mono bg-muted/50 p-4 rounded-lg overflow-x-auto whitespace-pre break-words">{previewCode}</pre>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Vault Page ───────────────────────────────────────────────

export default function STierVault() {
  const [activeTab, setActiveTab] = useState("registry");
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string | null>(null);
  const [viewingCode, setViewingCode] = useState<{ entry: STierEntry; code: string } | null>(null);
  const [exportingEntry, setExportingEntry] = useState<{ id: string; name: string; rank: number; cjpi: number; module: string; description: string; code: string; synthesisContext?: SynthesisContext } | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showAnalytics, setShowAnalytics] = useState(true);

  // Promoted discoveries from DB
  const [promoted, setPromoted] = useState<PromotedDiscovery[]>([]);
  const [loadingPromoted, setLoadingPromoted] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('market_value');
  const [promoting, setPromoting] = useState(false);

  // Pricing engine for S-Tier repricing
  const pricingEngine = usePricingEngine();

  const handleRepriceAll = useCallback(async () => {
    // Only reprice promoted discoveries from vault_promotions that are UNPRICED.
    // Registry entries are static JS objects with no vault_id — pricing them
    // wastes API calls since results can never persist to the database.
    const artifacts: PricingArtifact[] = [];

    for (const d of promoted) {
      // Skip items that already have a price — no redundant computation
      if ((d as any).recommended_resale_price != null) continue;
      artifacts.push({
        vault_id: d.id,
        source_table: 'vault_promotions',
        pipeline_name: d.name,
        pipeline_score: d.cjpi,
        pipeline_tier: d.tier || 'Apex',
        pipeline_category: d.category,
        system_chain: d.module_chain,
        valuation_display: null,
      });
    }

    if (artifacts.length === 0) {
      toast.info('All items already priced — nothing to do');
      return;
    }

    toast.info(`Pricing ${artifacts.length} unpriced items (skipping ${promoted.length - artifacts.length} already priced)...`);
    const result = await pricingEngine.repriceAll(artifacts);
    toast.success(`Priced ${result.success} new discoveries${result.failed ? ` (${result.failed} failed)` : ''}`);
    // Reload promoted to pick up new prices
    await loadPromoted();
  }, [promoted, pricingEngine]);

  // Discovered tab filters
  const [discCategoryFilter, setDiscCategoryFilter] = useState<string | null>(null);
  const [discTierFilter, setDiscTierFilter] = useState<string | null>(null);
  const [discModuleFilter, setDiscModuleFilter] = useState<string | null>(null);

  useEffect(() => { loadPromoted(); }, []);

  const loadPromoted = async () => {
    setLoadingPromoted(true);
    try {
      const all: PromotedDiscovery[] = [];
      let from = 0;
      const pageSize = 1000;
      while (true) {
        const { data, error } = await supabase
          .from('vault_promotions')
          .select('*')
          .eq('export_ready', true)
          .order('cjpi', { ascending: false })
          .range(from, from + pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all.push(...(data as unknown as PromotedDiscovery[]));
        if (data.length < pageSize) break;
        from += pageSize;
      }
      setPromoted(all);
    } catch (err) {
      console.error('Failed to load promoted discoveries:', err);
    } finally {
      setLoadingPromoted(false);
    }
  };

  const modules = useMemo(() => [...new Set(entries.map(e => e.module))].sort(), []);

  const filtered = useMemo(() => {
    let result = entries;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) ||
        e.module.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
      );
    }
    if (moduleFilter) result = result.filter(e => e.module === moduleFilter);
    return result;
  }, [search, moduleFilter]);

  // Discovered tab: derived filter options
  const discCategories = useMemo(() => [...new Set(promoted.map(d => d.category))].sort(), [promoted]);
  const discTiers = useMemo(() => [...new Set(promoted.map(d => d.tier))].sort(), [promoted]);
  const discModules = useMemo(() => {
    const mods = new Set<string>();
    for (const d of promoted) for (const m of (d.module_chain || [])) mods.add(m);
    return [...mods].sort();
  }, [promoted]);

  const filteredPromoted = useMemo(() => {
    let result = [...promoted];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        (d.module_chain || []).some(m => m.toLowerCase().includes(q))
      );
    }
    if (discCategoryFilter) result = result.filter(d => d.category === discCategoryFilter);
    if (discTierFilter) result = result.filter(d => d.tier === discTierFilter);
    if (discModuleFilter) result = result.filter(d => (d.module_chain || []).includes(discModuleFilter));

    result.sort((a, b) => {
      switch (sortMode) {
        case 'market_value':
          return estimateMarketValue(b.cjpi, b.category, (b.module_chain || []).length) -
                 estimateMarketValue(a.cjpi, a.category, (a.module_chain || []).length);
        case 'cjpi': return b.cjpi - a.cjpi;
        case 'name': return a.name.localeCompare(b.name);
        case 'category': return a.category.localeCompare(b.category) || b.cjpi - a.cjpi;
        default: return 0;
      }
    });
    return result;
  }, [search, promoted, sortMode, discCategoryFilter, discTierFilter, discModuleFilter]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const loadSourceCode = async (entry: STierEntry): Promise<string> => {
    const loader = CODE_FILES[entry.rank];
    if (!loader) return '// Source code scaffold — export generates full implementation';
    try { const mod = await loader(); return mod.default; } catch { return '// Code not available'; }
  };

  const handleViewCode = async (entry: STierEntry) => {
    setLoadingCode(true);
    const code = await loadSourceCode(entry);
    setViewingCode({ entry, code });
    setLoadingCode(false);
  };

  const handleExport = async (entry: STierEntry) => {
    setLoadingCode(true);
    const code = await loadSourceCode(entry);
    setExportingEntry({ id: entry.id, name: entry.name, rank: entry.rank, cjpi: entry.cjpi, module: entry.module, description: entry.description, code });
    setLoadingCode(false);
  };

  const handleExportPromoted = (d: PromotedDiscovery) => {
    const primaryModule = (d.module_chain && d.module_chain[0]) || d.category.toUpperCase();
    const modules = d.module_chain || [primaryModule];
    const synthCtx = contextFromDiscovery({
      ...d,
      description: getEnrichedDescription(d.description, d.name, modules),
    });
    setExportingEntry({ id: d.discovery_id, name: d.name, rank: 0, cjpi: d.cjpi, module: primaryModule, description: getEnrichedDescription(d.description, d.name, modules), code: '', synthesisContext: synthCtx });
  };

  const handlePromoteToRegistry = async (d: PromotedDiscovery) => {
    setPromoting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('Authentication required'); return; }

      // Log the promotion as an audit event
      await supabase.from('audit_logs').insert({
        action: 'vault_promotion',
        entity_type: 'discovery',
        entity_id: d.discovery_id,
        performed_by: user.id,
        details: {
          name: d.name,
          cjpi: d.cjpi,
          category: d.category,
          module_chain: d.module_chain,
          tier: d.tier,
          promoted_from: 'discovered',
          promoted_to: 'registry',
          timestamp: new Date().toISOString(),
        },
      });

      // Update vault_promotions status
      await supabase
        .from('vault_promotions')
        .update({ status: 'registry_promoted' })
        .eq('id', d.id);

      toast.success(`"${d.name}" promoted to registry with audit trail`);
      await loadPromoted();
    } catch (err: any) {
      toast.error(`Promotion failed: ${err.message}`);
    } finally {
      setPromoting(false);
    }
  };

  const buildExportZip = async (
    discoveries: typeof promoted, languages: ExportTarget[], filename: string, label: string
  ) => {
    if (discoveries.length === 0) return;
    const [JSZipMod, runtimeMod] = await Promise.all([
      import('jszip'),
      import('@/lib/export/standalone-runtime?raw'),
    ]);
    const JSZip = JSZipMod.default;
    const zip = new JSZip();
    const root = zip.folder(filename.replace('.zip', ''))!;

    // Include the sealed Mini-Runtime™ only — Discovery Engine is substrate-only
    const coreFolder = root.folder('_runtime')!;
    coreFolder.file('standalone-runtime.ts', (runtimeMod as any).default);
    coreFolder.file('README.md', [
      '# CMPSBL® Mini-Runtime™ Engine — Sealed Distribution',
      '',
      'This directory contains the sealed CMPSBL® Mini-Runtime™ Engine.',
      'It requires **zero external dependencies** — no substrate, no database, no infrastructure.',
      '',
      '## Components',
      '',
      '- **standalone-runtime.ts** — CJPI scoring, Saga orchestrator, FSM engine, pipeline orchestration',
      '',
      '## ⚠️ Discovery Engine Not Included',
      '',
      'The Discovery Engine is a substrate-only capability and is not distributed.',
      'For full discovery capabilities, use the CMPSBL® Substrate at https://cmpsbl.com',
      '',
      '---',
      '© CMPSBL® — All rights reserved.',
    ].join('\n'));

    const { serializeCmpsblManifest } = await import('@/lib/export/cmpsbl-manifest');

    for (const d of discoveries) {
      const primaryModule = (d.module_chain && d.module_chain[0]) || d.category.toUpperCase();
      const modules = d.module_chain || [primaryModule];
      const enrichedDesc = getEnrichedDescription(d.description, d.name, modules);
      const synthCtx = contextFromDiscovery({ ...d, description: enrichedDesc });
      const artifact: ExportableArtifact = { id: d.discovery_id, name: d.name, rank: 0, cjpi: d.cjpi, module: primaryModule, description: enrichedDesc, sourceCode: '', synthesisContext: synthCtx };
      const bundle = generateExportBundle(artifact, languages);
      const slug = d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
      const folder = root.folder(slug)!;
      folder.file('README.md', bundle.readme);
      for (const file of bundle.files) folder.file(file.filename, file.content);
      folder.file('manifest.json', serializeCmpsblManifest({
        name: d.name,
        cjpi: d.cjpi,
        modules: d.module_chain || [primaryModule],
        targets: languages.map(l => l.language),
        category: d.category,
        source: 'vault-export',
      }));

      const exportChain = (d.module_chain && d.module_chain.length > 0) ? d.module_chain : [d.category.toUpperCase()];
      const detailsHTML = generatePipelineDetailsHTML({
        name: d.name,
        score: d.cjpi,
        tier: getTierFromScore(d.cjpi),
        category: d.category,
        systemChain: exportChain,
        description: d.description,
        exportLanguages: languages.map(l => l.language),
        source: 'vault-export',
      });
      folder.file('PIPELINE-DETAILS.html', detailsHTML);
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${discoveries.length} discoveries + standalone discovery engine — ${label}`);
  };

  const handleExportSoftware = () => {
    const targets: ExportTarget[] = [
      'typescript','python','go','rust','java','csharp','ruby','php','swift','kotlin','elixir','lua','c','cpp','dart','zig','scala','haskell'
    ].map(l => ({ language: l as any, adapter: 'standalone' as any }));
    buildExportZip(promoted, targets, 'discoveries-software-export.zip', '18 software languages');
  };

  const handleExportHardware = () => {
    const targets: ExportTarget[] = ['verilog','vhdl','systemverilog','chisel','amaranth','spice','systemc']
      .map(l => ({ language: l as any, adapter: 'fpga-synth' as any }));
    buildExportZip(promoted, targets, 'discoveries-hardware-export.zip', '7 hardware languages');
  };

  const handleCopyCode = () => { if (viewingCode) navigator.clipboard.writeText(viewingCode.code); };

  const handleExportTS = () => {
    if (!viewingCode) return;
    const blob = new Blob([viewingCode.code], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${viewingCode.entry.id}.ts`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportManifest = () => {
    const blob = new Blob([JSON.stringify(registryData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "s-tier-registry.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveOfflineManifest = async () => {
    // Build a comprehensive offline manifest combining registry + promoted discoveries
    const manifest = {
      _meta: {
        type: 'CMPSBL® Offline Vault Manifest',
        purpose: 'Complete disaster-recovery snapshot of all discovered and curated software. If the server is ever lost, this file contains everything needed to reconstruct the vault.',
        generatedAt: new Date().toISOString(),
        generatedBy: 'S-Tier Apex Discovery Vault — Offline Manifest System',
        copyright: '© 2025–2026 CMPSBL®. All rights reserved.',
        architect: 'Kenneth E. Sweet Jr. — ORCID 0009-0001-4237-1243',
      },
      registry: {
        version: registryData.version,
        totalArtifacts: registryData.totalArtifacts,
        canonicalModules: registryData.canonicalModules,
        entries: entries.map(e => ({
          rank: e.rank, id: e.id, name: e.name, cjpi: e.cjpi,
          module: e.module, type: e.type, description: e.description,
          dependencyFootprint: e.dependencyFootprint, exportMode: e.exportMode,
          signatureHash: e.signatureHash, version: e.version,
          approved: e.approved, hasCode: e.hasCode,
        })),
      },
      discoveries: promoted.map(d => ({
        id: d.discovery_id, name: d.name, cjpi: d.cjpi,
        category: d.category, tier: d.tier, description: d.description,
        module_chain: d.module_chain, status: d.status,
        export_ready: d.export_ready, promoted_at: d.promoted_at,
        estimatedValue: formatMarketValue(estimateMarketValue(d.cjpi, d.category, (d.module_chain || []).length)),
      })),
      summary: {
        registryDiscoveries: entries.length,
        promotedDiscoveries: promoted.length,
        totalSoftware: entries.length + promoted.length,
        tiers: {
          apex: entries.filter(e => e.cjpi >= 95).length + promoted.filter(d => d.cjpi >= 95).length,
          enterprise: entries.filter(e => e.cjpi >= 85 && e.cjpi < 95).length + promoted.filter(d => d.cjpi >= 85 && d.cjpi < 95).length,
          architect: entries.filter(e => e.cjpi >= 70 && e.cjpi < 85).length + promoted.filter(d => d.cjpi >= 70 && d.cjpi < 85).length,
        },
        exportTargets: {
          softwareLanguages: 18,
          hardwareLanguages: 7,
          totalCombinations: '25 languages × 8 adapters = 200 outputs',
        },
        categories: [...new Set(promoted.map(d => d.category))].sort(),
      },
      instructions: {
        howToUse: 'Each entry in "registry" and "discoveries" is a standalone software discovery. Use the name, description, and module_chain to understand what it does. Use the cjpi score to assess quality (0-100, higher is better).',
        howToRebuild: 'Import this manifest into any CMPSBL Substrate instance to re-score and re-tier all entries. The Mini-Runtime™ Engine (included in ZIP exports) provides CJPI scoring and pipeline orchestration.',
        howToExport: 'Each discovery can be exported to any of 25 languages (18 software + 7 hardware/HDL) using the CMPSBL® Substrate.',
      },
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cmpsbl-vault-manifest-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    // Also save to localStorage for true offline access
    try {
      localStorage.setItem('cmpsbl-vault-offline-manifest', JSON.stringify(manifest));
      toast.success(`Offline manifest saved — ${entries.length + promoted.length} artifacts cached locally + downloaded`);
    } catch {
      toast.success(`Manifest downloaded — ${entries.length + promoted.length} artifacts`);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-400 shrink-0" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">S-Tier Apex Discovery Vault</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {entries.length} registry artifacts • {promoted.length} promoted discoveries • 24 export languages
              </p>
            </div>
          </div>
          <div className="flex gap-2 self-start sm:self-auto flex-wrap">
            <Button variant="outline" size="sm" onClick={handleRepriceAll} disabled={pricingEngine.loading} className="gap-1.5">
              {pricingEngine.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {pricingEngine.loading
                ? pricingEngine.batchProgress
                  ? `${pricingEngine.batchProgress.completed}/${pricingEngine.batchProgress.total}`
                  : 'Repricing...'
                : 'Reprice All'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowAnalytics(!showAnalytics)} className="gap-1.5">
              <BarChart3 className="w-4 h-4" /> {showAnalytics ? 'Hide' : 'Show'} Stats
            </Button>
            <Button variant="outline" size="sm" onClick={handleSaveOfflineManifest} className="gap-1.5">
              <Download className="w-4 h-4" /> Offline Manifest
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportManifest} className="gap-1.5">
              <Download className="w-4 h-4" /> Registry JSON
            </Button>
          </div>
        </div>

        {/* Analytics Summary */}
        {showAnalytics && <AnalyticsSummary registryEntries={entries} promoted={promoted} />}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search artifacts by name, module, description..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="registry" className="gap-1.5"><Shield className="w-3.5 h-3.5" /> Registry ({filtered.length})</TabsTrigger>
            <TabsTrigger value="promoted" className="gap-1.5"><Zap className="w-3.5 h-3.5" /> Discovered ({filteredPromoted.length})</TabsTrigger>
          </TabsList>

          {/* ─── Registry Tab ─── */}
          <TabsContent value="registry" className="space-y-4 mt-4">
            <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
              <div className="flex gap-1.5 min-w-max pb-1">
                <Badge variant={moduleFilter === null ? "default" : "outline"} className="cursor-pointer text-xs shrink-0" onClick={() => setModuleFilter(null)}>All ({entries.length})</Badge>
                {modules.map(m => {
                  const count = entries.filter(e => e.module === m).length;
                  return (
                    <Badge key={m} variant={moduleFilter === m ? "default" : "outline"} className={`cursor-pointer text-xs shrink-0 ${moduleFilter === m ? '' : MODULE_COLORS[m] ?? ''}`} onClick={() => setModuleFilter(moduleFilter === m ? null : m)}>
                      {m} ({count})
                    </Badge>
                  );
                })}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length} of {entries.length} artifacts
              {filtered.length > 0 && (
                <> • Total est. {formatMarketValue(
                  filtered.reduce((s, e) => s + estimateMarketValue(e.cjpi, e.type, Math.max(1, e.dependencyFootprint.length)), 0)
                )}</>
              )}
            </p>
            <div className="space-y-3">
              {filtered.map(entry => (
                <ArtifactCard key={entry.id} entry={entry} onViewCode={handleViewCode} onExport={handleExport} loadingCode={loadingCode} expanded={expandedIds.has(entry.id)} onToggle={() => toggleExpand(entry.id)} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No artifacts match your search</p>
              </div>
            )}
          </TabsContent>

          {/* ─── Promoted Discoveries Tab ─── */}
          <TabsContent value="promoted" className="space-y-4 mt-4">
            {loadingPromoted ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Loading promoted discoveries...</p>
              </div>
            ) : (
              <>
                {/* Filter chips for Discovered tab */}
                {promoted.length > 0 && (
                  <div className="space-y-2">
                    {/* Category filters */}
                    {discCategories.length > 1 && (
                      <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                        <div className="flex items-center gap-1.5 min-w-max pb-1">
                          <Filter className="w-3 h-3 text-muted-foreground shrink-0" />
                          <Badge variant={discCategoryFilter === null ? "default" : "outline"} className="cursor-pointer text-xs shrink-0" onClick={() => setDiscCategoryFilter(null)}>All Categories</Badge>
                          {discCategories.map(c => (
                            <Badge key={c} variant={discCategoryFilter === c ? "default" : "outline"} className="cursor-pointer text-xs shrink-0 capitalize" onClick={() => setDiscCategoryFilter(discCategoryFilter === c ? null : c)}>
                              {c} ({promoted.filter(d => d.category === c).length})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tier filters */}
                    {discTiers.length > 1 && (
                      <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                        <div className="flex items-center gap-1.5 min-w-max pb-1">
                          <Shield className="w-3 h-3 text-muted-foreground shrink-0" />
                          <Badge variant={discTierFilter === null ? "default" : "outline"} className="cursor-pointer text-xs shrink-0" onClick={() => setDiscTierFilter(null)}>All Tiers</Badge>
                          {discTiers.map(t => (
                            <Badge key={t} variant={discTierFilter === t ? "default" : "outline"} className="cursor-pointer text-xs shrink-0 capitalize" onClick={() => setDiscTierFilter(discTierFilter === t ? null : t)}>
                              {t} ({promoted.filter(d => d.tier === t).length})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Module filters */}
                    {discModules.length > 1 && (
                      <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                        <div className="flex items-center gap-1.5 min-w-max pb-1">
                          <Zap className="w-3 h-3 text-muted-foreground shrink-0" />
                          <Badge variant={discModuleFilter === null ? "default" : "outline"} className="cursor-pointer text-xs shrink-0" onClick={() => setDiscModuleFilter(null)}>All Nodes</Badge>
                          {discModules.map(m => (
                            <Badge key={m} variant={discModuleFilter === m ? "default" : "outline"} className={`cursor-pointer text-xs shrink-0 ${discModuleFilter === m ? '' : MODULE_COLORS[m] ?? ''}`} onClick={() => setDiscModuleFilter(discModuleFilter === m ? null : m)}>
                              {m}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {promoted.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                        <Select value={sortMode} onValueChange={v => setSortMode(v as SortMode)}>
                          <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="market_value"><span className="flex items-center gap-1.5"><TrendingUp className="w-3 h-3" /> Market Value</span></SelectItem>
                            <SelectItem value="cjpi"><span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> CJPI Score</span></SelectItem>
                            <SelectItem value="name">Name (A-Z)</SelectItem>
                            <SelectItem value="category">Category</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-xs text-muted-foreground">
                          {filteredPromoted.length} discoveries
                          {sortMode === 'market_value' && filteredPromoted.length > 0 && (
                            <> • Total est. {formatMarketValue(
                              filteredPromoted.reduce((s, d) => s + estimateMarketValue(d.cjpi, d.category, (d.module_chain || []).length), 0)
                            )}</>
                          )}
                        </span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" onClick={handleExportSoftware} className="gap-1.5">
                          <Download className="w-3.5 h-3.5" /> Software ZIP ({promoted.length}) · 18 langs
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleExportHardware} className="gap-1.5">
                          <Download className="w-3.5 h-3.5" /> Hardware ZIP ({promoted.length}) · 7 HDLs
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {filteredPromoted.map(d => (
                    <PromotedCard
                      key={d.id}
                      discovery={d}
                      onExport={handleExportPromoted}
                      onPromote={handlePromoteToRegistry}
                      expanded={expandedIds.has(d.id)}
                      onToggle={() => toggleExpand(d.id)}
                      promoting={promoting}
                    />
                  ))}
                </div>

                {filteredPromoted.length === 0 && (
                  <div className="text-center py-12">
                    <Zap className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">
                      {promoted.length === 0
                        ? 'No promoted discoveries yet — run the Discovery Engine to find Apex Discoveries'
                        : 'No discoveries match your filters'}
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Code Viewer Dialog */}
      <Dialog open={!!viewingCode} onOpenChange={() => setViewingCode(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap text-base">
              <Code2 className="w-5 h-5" />
              <span>#{viewingCode?.entry.rank} — {viewingCode?.entry.name}</span>
              <Badge variant="outline" className="text-xs">{viewingCode?.entry.module}</Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mb-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={handleCopyCode} className="gap-1.5"><Copy className="w-3 h-3" />Copy</Button>
            <Button size="sm" variant="outline" onClick={handleExportTS} className="gap-1.5"><Download className="w-3 h-3" />Export .ts</Button>
            {viewingCode && (
              <Button size="sm" onClick={() => { setExportingEntry({ ...viewingCode.entry, code: viewingCode.code }); setViewingCode(null); }} className="gap-1.5">
                <Globe className="w-3 h-3" />Universal Export
              </Button>
            )}
          </div>
          <ScrollArea className="h-[60vh]">
            <pre className="text-xs font-mono bg-muted/50 p-4 rounded-lg overflow-x-auto whitespace-pre break-words">{viewingCode?.code}</pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Universal Export Dialog */}
      {exportingEntry && (
        <ExportDialog entry={exportingEntry} sourceCode={exportingEntry.code} onClose={() => setExportingEntry(null)} />
      )}
    </AdminLayout>
  );
}
