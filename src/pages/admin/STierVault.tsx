import { useState, useMemo, useCallback, useEffect } from "react";
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
  Zap, Loader2,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import registryData from "@/crownjewels/s-tier.registry.json";
import type { STierEntry } from "@/crownjewels/types";
import {
  generateSingleExport, generateExportBundle, downloadFile, downloadBundle,
  getAllLanguages, getAllAdapters,
  type ExportLanguage, type ExportAdapter, type ExportableArtifact, type ExportTarget,
} from "@/lib/export/universal-adapter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
};

function getCJPIColor(cjpi: number): string {
  if (cjpi >= 96) return "text-yellow-400 bg-yellow-500/20 border-yellow-500/40";
  if (cjpi >= 92) return "text-orange-400 bg-orange-500/20 border-orange-500/40";
  if (cjpi >= 88) return "text-blue-400 bg-blue-500/20 border-blue-500/40";
  return "text-muted-foreground bg-muted border-border";
}

const LANGUAGES = getAllLanguages();
const ADAPTERS = getAllAdapters();

// ─── Types for promoted discoveries ─────────────────────────────────

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

// ─── Artifact Card (Mobile-first, no truncation) ────────────────────

function ArtifactCard({
  entry,
  onViewCode,
  onExport,
  loadingCode,
  expanded,
  onToggle,
}: {
  entry: STierEntry;
  onViewCode: (e: STierEntry) => void;
  onExport: (e: STierEntry) => void;
  loadingCode: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="border-border/50 hover:border-border transition-colors">
      <CardContent className="p-3 sm:p-4">
        {/* Top row: rank, CJPI, module, approval */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="font-mono text-sm font-bold text-muted-foreground">#{entry.rank}</span>
          <Badge variant="outline" className={`font-mono text-xs ${getCJPIColor(entry.cjpi)}`}>
            {entry.cjpi}
          </Badge>
          <Badge variant="outline" className={`text-xs border ${MODULE_COLORS[entry.module] ?? "bg-muted text-muted-foreground"}`}>
            {entry.module}
          </Badge>
          <Badge variant="outline" className="text-xs">{entry.type}</Badge>
          {entry.approved ? (
            <CheckCircle className="w-4 h-4 text-green-400 ml-auto shrink-0" />
          ) : (
            <Lock className="w-4 h-4 text-muted-foreground/50 ml-auto shrink-0" />
          )}
        </div>

        {/* Name — never truncated */}
        <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1 break-words">
          {entry.name}
        </h3>

        {/* Description — never truncated */}
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 break-words">
          {entry.description}
        </p>

        {/* Metadata row */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mb-3">
          <code className="font-mono bg-muted/50 px-1.5 py-0.5 rounded">{entry.signatureHash}</code>
          <span>v{entry.version}</span>
          <span>{entry.exportMode === 'PureStandalone' ? '✦ Standalone' : '⚡ Adapter Required'}</span>
        </div>

        {/* Dependency footprint */}
        {entry.dependencyFootprint.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mb-3">
            <span className="text-xs text-muted-foreground">Deps:</span>
            {entry.dependencyFootprint.map(dep => (
              <Badge key={dep} variant="outline" className="text-[10px] px-1.5 py-0">{dep}</Badge>
            ))}
          </div>
        )}

        {/* Actions */}
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

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-muted-foreground">ID:</span> <code className="font-mono">{entry.id}</code></div>
              <div><span className="text-muted-foreground">Rank:</span> #{entry.rank}</div>
              <div><span className="text-muted-foreground">CJPI:</span> {entry.cjpi}</div>
              <div><span className="text-muted-foreground">Module:</span> {entry.module}</div>
              <div><span className="text-muted-foreground">Type:</span> {entry.type}</div>
              <div><span className="text-muted-foreground">Export:</span> {entry.exportMode}</div>
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
  discovery,
  onExport,
  expanded,
  onToggle,
}: {
  discovery: PromotedDiscovery;
  onExport: (d: PromotedDiscovery) => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  const modules = discovery.module_chain || [];
  return (
    <Card className="border-amber-500/30 hover:border-amber-500/50 transition-colors bg-amber-500/5">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-400 bg-amber-500/10">
            <Zap className="w-3 h-3 mr-1" /> DISCOVERED
          </Badge>
          <Badge variant="outline" className={`font-mono text-xs ${getCJPIColor(discovery.cjpi)}`}>
            {discovery.cjpi}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">{discovery.category}</Badge>
          {discovery.export_ready && (
            <CheckCircle className="w-4 h-4 text-green-400 ml-auto shrink-0" />
          )}
        </div>

        <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1 break-words">
          {discovery.name}
        </h3>

        <p className="text-xs sm:text-sm text-muted-foreground mb-3 break-words">
          {discovery.description}
        </p>

        {/* Module chain */}
        {modules.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mb-3">
            <span className="text-xs text-muted-foreground">Pipeline:</span>
            {modules.map((m, i) => (
              <Badge key={`${m}-${i}`} variant="outline" className={`text-[10px] px-1.5 py-0 ${MODULE_COLORS[m] ?? ''}`}>
                {m}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => onExport(discovery)} className="gap-1.5 text-xs border-amber-500/40 text-amber-400 hover:bg-amber-500/10">
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
              <div><span className="text-muted-foreground">Discovery ID:</span> <code className="font-mono text-[10px]">{discovery.discovery_id}</code></div>
              <div><span className="text-muted-foreground">CJPI:</span> {discovery.cjpi}</div>
              <div><span className="text-muted-foreground">Category:</span> {discovery.category}</div>
              <div><span className="text-muted-foreground">Tier:</span> {discovery.tier}</div>
              <div><span className="text-muted-foreground">Status:</span> {discovery.status}</div>
              <div><span className="text-muted-foreground">Export Ready:</span> {discovery.export_ready ? '✓' : '✗'}</div>
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
  entry,
  sourceCode,
  onClose,
}: {
  entry: { id: string; name: string; rank: number; cjpi: number; module: string; description: string };
  sourceCode: string;
  onClose: () => void;
}) {
  const [selectedLang, setSelectedLang] = useState<ExportLanguage>('typescript');
  const [selectedAdapter, setSelectedAdapter] = useState<ExportAdapter>('standalone');
  const [previewCode, setPreviewCode] = useState<string>('');

  const artifact: ExportableArtifact = {
    id: entry.id,
    name: entry.name,
    rank: entry.rank,
    cjpi: entry.cjpi,
    module: entry.module,
    description: entry.description,
    sourceCode,
  };

  const handlePreview = useCallback(() => {
    const file = generateSingleExport(artifact, selectedLang, selectedAdapter);
    setPreviewCode(file.content);
  }, [selectedLang, selectedAdapter, artifact]);

  const handleDownloadSingle = () => {
    const file = generateSingleExport(artifact, selectedLang, selectedAdapter);
    downloadFile(file);
  };

  const handleDownloadAll = async () => {
    const targets: ExportTarget[] = LANGUAGES.map(l => ({
      language: l.value,
      adapter: selectedAdapter,
    }));
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
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Language</label>
              <Select value={selectedLang} onValueChange={v => setSelectedLang(v as ExportLanguage)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(l => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Adapter</label>
              <Select value={selectedAdapter} onValueChange={v => setSelectedAdapter(v as ExportAdapter)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADAPTERS.map(a => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={handlePreview} className="gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Preview
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownloadSingle} className="gap-1.5">
              <FileCode className="w-3.5 h-3.5" /> Download {LANGUAGES.find(l => l.value === selectedLang)?.label}
            </Button>
            <Button size="sm" onClick={handleDownloadAll} className="gap-1.5">
              <Download className="w-3.5 h-3.5" /> Download All Languages (ZIP)
            </Button>
          </div>

          {/* Supported targets summary */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Software Languages</h4>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {LANGUAGES.filter(l => !['verilog','vhdl','systemverilog','chisel'].includes(l.value)).map(l => (
                <Badge key={l.value} variant={l.value === selectedLang ? 'default' : 'outline'} className="text-[10px] cursor-pointer" onClick={() => setSelectedLang(l.value)}>
                  {l.label}
                </Badge>
              ))}
            </div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Hardware / HDL (FPGA &amp; ASIC)</h4>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.filter(l => ['verilog','vhdl','systemverilog','chisel'].includes(l.value)).map(l => (
                <Badge key={l.value} variant={l.value === selectedLang ? 'default' : 'outline'} className="text-[10px] cursor-pointer border-amber-500/40 text-amber-400" onClick={() => setSelectedLang(l.value)}>
                  ⚡ {l.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Code Preview */}
          {previewCode && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Preview</h4>
                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(previewCode)} className="gap-1 text-xs">
                  <Copy className="w-3 h-3" /> Copy
                </Button>
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
  const [exportingEntry, setExportingEntry] = useState<{ id: string; name: string; rank: number; cjpi: number; module: string; description: string; code: string } | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Promoted discoveries from DB
  const [promoted, setPromoted] = useState<PromotedDiscovery[]>([]);
  const [loadingPromoted, setLoadingPromoted] = useState(false);

  useEffect(() => {
    loadPromoted();
  }, []);

  const loadPromoted = async () => {
    setLoadingPromoted(true);
    try {
      // Paginate to bypass PostgREST 1000-row default limit
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
        e.name.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.module.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      );
    }
    if (moduleFilter) result = result.filter(e => e.module === moduleFilter);
    return result;
  }, [search, moduleFilter]);

  const filteredPromoted = useMemo(() => {
    if (!search) return promoted;
    const q = search.toLowerCase();
    return promoted.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      (d.module_chain || []).some(m => m.toLowerCase().includes(q))
    );
  }, [search, promoted]);

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
    try {
      const mod = await loader();
      return mod.default;
    } catch {
      return '// Code not available';
    }
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
    setExportingEntry({
      id: d.discovery_id,
      name: d.name,
      rank: 0,
      cjpi: d.cjpi,
      module: primaryModule,
      description: d.description,
      code: '',
    });
  };

  const buildExportZip = async (
    discoveries: typeof promoted,
    languages: ExportTarget[],
    filename: string,
    label: string
  ) => {
    if (discoveries.length === 0) return;
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const root = zip.folder(filename.replace('.zip', ''))!;

    for (const d of discoveries) {
      const primaryModule = (d.module_chain && d.module_chain[0]) || d.category.toUpperCase();
      const artifact: ExportableArtifact = {
        id: d.discovery_id,
        name: d.name,
        rank: 0,
        cjpi: d.cjpi,
        module: primaryModule,
        description: d.description,
        sourceCode: '',
      };

      const bundle = generateExportBundle(artifact, languages);
      const slug = d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
      const folder = root.folder(slug)!;
      folder.file('README.md', bundle.readme);
      for (const file of bundle.files) {
        folder.file(file.filename, file.content);
      }
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${discoveries.length} discoveries — ${label}`);
  };

  const handleExportSoftware = () => {
    const targets: ExportTarget[] = [
      { language: 'typescript', adapter: 'standalone' },
      { language: 'python', adapter: 'standalone' },
      { language: 'go', adapter: 'standalone' },
      { language: 'rust', adapter: 'standalone' },
      { language: 'java', adapter: 'standalone' },
      { language: 'csharp', adapter: 'standalone' },
      { language: 'ruby', adapter: 'standalone' },
      { language: 'php', adapter: 'standalone' },
      { language: 'swift', adapter: 'standalone' },
      { language: 'kotlin', adapter: 'standalone' },
      { language: 'elixir', adapter: 'standalone' },
      { language: 'lua', adapter: 'standalone' },
      { language: 'c', adapter: 'standalone' },
      { language: 'cpp', adapter: 'standalone' },
      { language: 'dart', adapter: 'standalone' },
      { language: 'zig', adapter: 'standalone' },
      { language: 'scala', adapter: 'standalone' },
      { language: 'haskell', adapter: 'standalone' },
    ];
    buildExportZip(promoted, targets, 'discoveries-software-export.zip', '18 software languages');
  };

  const handleExportHardware = () => {
    const targets: ExportTarget[] = [
      { language: 'verilog', adapter: 'fpga-synth' },
      { language: 'vhdl', adapter: 'fpga-synth' },
      { language: 'systemverilog', adapter: 'fpga-synth' },
      { language: 'chisel', adapter: 'fpga-synth' },
      { language: 'amaranth', adapter: 'fpga-synth' },
      { language: 'spice', adapter: 'fpga-synth' },
    ];
    buildExportZip(promoted, targets, 'discoveries-hardware-export.zip', '6 hardware languages');
  };

  const handleCopyCode = () => {
    if (viewingCode) navigator.clipboard.writeText(viewingCode.code);
  };

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

  return (
    <div className="min-h-screen bg-background text-foreground p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-400 shrink-0" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">S-Tier Crown Jewel Vault</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {entries.length} registry artifacts • {promoted.length} promoted discoveries • Universal export
              </p>
            </div>
          </div>
          <div className="flex gap-2 self-start sm:self-auto">
            <Button variant="outline" size="sm" onClick={handleExportManifest} className="gap-1.5">
              <Download className="w-4 h-4" /> Registry JSON
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search artifacts by name, module, description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Tabs: Registry vs Promoted */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="registry" className="gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Registry ({filtered.length})
            </TabsTrigger>
            <TabsTrigger value="promoted" className="gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Discovered ({filteredPromoted.length})
            </TabsTrigger>
          </TabsList>

          {/* ─── Registry Tab ─── */}
          <TabsContent value="registry" className="space-y-4 mt-4">
            {/* Module filters */}
            <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
              <div className="flex gap-1.5 min-w-max pb-1">
                <Badge
                  variant={moduleFilter === null ? "default" : "outline"}
                  className="cursor-pointer text-xs shrink-0"
                  onClick={() => setModuleFilter(null)}
                >
                  All ({entries.length})
                </Badge>
                {modules.map(m => {
                  const count = entries.filter(e => e.module === m).length;
                  return (
                    <Badge
                      key={m}
                      variant={moduleFilter === m ? "default" : "outline"}
                      className={`cursor-pointer text-xs shrink-0 ${moduleFilter === m ? '' : MODULE_COLORS[m] ?? ''}`}
                      onClick={() => setModuleFilter(moduleFilter === m ? null : m)}
                    >
                      {m} ({count})
                    </Badge>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Showing {filtered.length} of {entries.length} artifacts
            </p>

            <div className="space-y-3">
              {filtered.map(entry => (
                <ArtifactCard
                  key={entry.id}
                  entry={entry}
                  onViewCode={handleViewCode}
                  onExport={handleExport}
                  loadingCode={loadingCode}
                  expanded={expandedIds.has(entry.id)}
                  onToggle={() => toggleExpand(entry.id)}
                />
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
                {promoted.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      {filteredPromoted.length} export-ready discoveries • Auto-promoted from reactor (CJPI ≥ 90)
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleExportSoftware} className="gap-1.5">
                        <Download className="w-3.5 h-3.5" /> Software ZIP ({promoted.length}) · 18 langs
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleExportHardware} className="gap-1.5">
                        <Download className="w-3.5 h-3.5" /> Hardware ZIP ({promoted.length}) · 6 HDLs
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {filteredPromoted.map(d => (
                    <PromotedCard
                      key={d.id}
                      discovery={d}
                      onExport={handleExportPromoted}
                      expanded={expandedIds.has(d.id)}
                      onToggle={() => toggleExpand(d.id)}
                    />
                  ))}
                </div>

                {filteredPromoted.length === 0 && (
                  <div className="text-center py-12">
                    <Zap className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">
                      {promoted.length === 0
                        ? 'No promoted discoveries yet — run the Discovery Engine to find Crown Jewels'
                        : 'No discoveries match your search'}
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
            <Button size="sm" variant="outline" onClick={handleCopyCode} className="gap-1.5">
              <Copy className="w-3 h-3" />Copy
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportTS} className="gap-1.5">
              <Download className="w-3 h-3" />Export .ts
            </Button>
            {viewingCode && (
              <Button size="sm" onClick={() => {
                setExportingEntry({ ...viewingCode.entry, code: viewingCode.code });
                setViewingCode(null);
              }} className="gap-1.5">
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
        <ExportDialog
          entry={exportingEntry}
          sourceCode={exportingEntry.code}
          onClose={() => setExportingEntry(null)}
        />
      )}
    </div>
  );
}
