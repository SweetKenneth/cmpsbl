import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Copy, Download, Eye, Search, Lock, CheckCircle } from "lucide-react";
import registryData from "@/crownjewels/s-tier.registry.json";
import type { STierEntry } from "@/crownjewels/types";

const entries = registryData.entries as STierEntry[];

// Lazy-load code map for top 10
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
};

function getCJPIColor(cjpi: number): string {
  if (cjpi >= 96) return "text-yellow-400 bg-yellow-500/20 border-yellow-500/40";
  if (cjpi >= 92) return "text-orange-400 bg-orange-500/20 border-orange-500/40";
  if (cjpi >= 88) return "text-blue-400 bg-blue-500/20 border-blue-500/40";
  return "text-muted-foreground bg-muted border-border";
}

export default function STierVault() {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string | null>(null);
  const [viewingCode, setViewingCode] = useState<{ entry: STierEntry; code: string } | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);

  const modules = useMemo(() => [...new Set(entries.map(e => e.module))].sort(), []);

  const filtered = useMemo(() => {
    let result = entries;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.module.toLowerCase().includes(q));
    }
    if (moduleFilter) result = result.filter(e => e.module === moduleFilter);
    return result;
  }, [search, moduleFilter]);

  const handleViewCode = async (entry: STierEntry) => {
    const loader = CODE_FILES[entry.rank];
    if (!loader) return;
    setLoadingCode(true);
    try {
      const mod = await loader();
      setViewingCode({ entry, code: mod.default });
    } catch { setViewingCode({ entry, code: "// Code not available" }); }
    setLoadingCode(false);
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
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-yellow-400" />
            <div>
              <h1 className="text-2xl font-bold">S-Tier Crown Jewel Vault</h1>
              <p className="text-sm text-muted-foreground">{entries.length} artifacts • Ranked by CJPI descending</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportManifest}>
            <Download className="w-4 h-4 mr-2" /> Export JSON Manifest
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search artifacts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Badge variant={moduleFilter === null ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => setModuleFilter(null)}>All</Badge>
            {modules.map(m => (
              <Badge key={m} variant={moduleFilter === m ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => setModuleFilter(moduleFilter === m ? null : m)}>{m}</Badge>
            ))}
          </div>
        </div>

        {/* Table */}
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="space-y-1">
            {filtered.map(entry => (
              <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 transition-colors group">
                <div className="w-10 text-center font-mono text-sm text-muted-foreground font-bold">#{entry.rank}</div>
                <Badge variant="outline" className={`font-mono text-xs ${getCJPIColor(entry.cjpi)}`}>{entry.cjpi}</Badge>
                <Badge variant="outline" className={`text-xs border ${MODULE_COLORS[entry.module] ?? "bg-muted text-muted-foreground"}`}>{entry.module}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{entry.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{entry.description}</div>
                </div>
                <Badge variant="outline" className="text-xs">{entry.type}</Badge>
                <code className="text-xs text-muted-foreground font-mono hidden sm:block">{entry.signatureHash}</code>
                {entry.approved ? (
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                )}
                {entry.hasCode && (
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleViewCode(entry)} disabled={loadingCode}>
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Code Viewer Dialog */}
      <Dialog open={!!viewingCode} onOpenChange={() => setViewingCode(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>#{viewingCode?.entry.rank}</span>
              <span>{viewingCode?.entry.name}</span>
              <Badge variant="outline" className="text-xs">{viewingCode?.entry.module}</Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mb-2">
            <Button size="sm" variant="outline" onClick={handleCopyCode}><Copy className="w-3 h-3 mr-1.5" />Copy</Button>
            <Button size="sm" variant="outline" onClick={handleExportTS}><Download className="w-3 h-3 mr-1.5" />Export .ts</Button>
          </div>
          <ScrollArea className="h-[60vh]">
            <pre className="text-xs font-mono bg-muted/50 p-4 rounded-lg overflow-x-auto whitespace-pre">{viewingCode?.code}</pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
