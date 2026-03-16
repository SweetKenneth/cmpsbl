/**
 * INGEST Phase — Import developer code and register as a candidate node
 * First stage of the Ascension lifecycle
 * Tier-gated: uploads limited per day (3/6/9/12 by tier)
 * Accepts all 25 export languages
 */

import { useState, useCallback } from 'react';
import { Upload, FileCode2, CheckCircle2, AlertCircle, Loader2, Code2, Layers, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEvolutionLimits } from '@/hooks/useEvolutionLimits';

interface ParsedNode {
  name: string;
  fileCount: number;
  resolverCount: number;
  language: string;
  sizeKb: number;
}

/** All 25 languages matching the export targets */
const ACCEPTED_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx',         // TypeScript / JavaScript
  '.py',                                 // Python
  '.go',                                 // Go
  '.rs',                                 // Rust
  '.java',                               // Java
  '.cs',                                 // C#
  '.rb',                                 // Ruby
  '.php',                                // PHP
  '.swift',                              // Swift
  '.kt', '.kts',                         // Kotlin
  '.ex', '.exs',                         // Elixir
  '.lua',                                // Lua
  '.c', '.h',                            // C
  '.cpp', '.cc', '.cxx', '.hpp',         // C++
  '.dart',                               // Dart
  '.zig',                                // Zig
  '.scala', '.sc',                       // Scala
  '.hs', '.lhs',                         // Haskell
  '.v',                                  // Verilog
  '.vhd', '.vhdl',                       // VHDL
  '.sv', '.svh',                         // SystemVerilog
  '.scala',                              // Chisel (Scala-based)
  '.py',                                 // Amaranth (Python-based)
  '.cir', '.sp', '.spice',              // SPICE
  '.cpp', '.h',                          // SystemC (C++-based)
];

const ACCEPT_STRING = ACCEPTED_EXTENSIONS.join(',');

const LANG_MAP: Record<string, string> = {
  ts: 'TypeScript', tsx: 'TypeScript/React', js: 'JavaScript', jsx: 'JavaScript/React',
  py: 'Python', rs: 'Rust', go: 'Go', java: 'Java', rb: 'Ruby', cs: 'C#',
  cpp: 'C++', cc: 'C++', cxx: 'C++', hpp: 'C++', c: 'C', h: 'C/C++',
  zig: 'Zig', hs: 'Haskell', lhs: 'Haskell',
  sv: 'SystemVerilog', svh: 'SystemVerilog', v: 'Verilog',
  vhd: 'VHDL', vhdl: 'VHDL',
  swift: 'Swift', kt: 'Kotlin', kts: 'Kotlin',
  php: 'PHP', lua: 'Lua', dart: 'Dart',
  scala: 'Scala', sc: 'Scala',
  ex: 'Elixir', exs: 'Elixir',
  cir: 'SPICE', sp: 'SPICE', spice: 'SPICE',
};

export function IngestPhase() {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [parsing, setParsing] = useState(false);
  const [parsedNode, setParsedNode] = useState<ParsedNode | null>(null);
  const [registered, setRegistered] = useState(false);
  const { toast } = useToast();
  const { canUpload, uploadsRemaining, evolutionUploadsPerDay, isLoading: limitsLoading, refreshUsage } = useEvolutionLimits();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(dropped);
    setParsedNode(null);
    setRegistered(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setParsedNode(null);
      setRegistered(false);
    }
  }, []);

  const handleParse = async () => {
    if (files.length === 0) return;
    setParsing(true);

    try {
      const totalSize = files.reduce((sum, f) => sum + f.size, 0);
      const extensions = new Set(files.map(f => f.name.split('.').pop()?.toLowerCase()));
      
      const detectedLang = Array.from(extensions)
        .map(ext => LANG_MAP[ext || ''])
        .filter(Boolean)[0] || 'Unknown';

      let resolverEstimate = 0;
      for (const file of files) {
        if (file.size < 500_000) {
          const text = await file.text();
          const exportMatches = text.match(/export\s+(function|class|const|default)/g);
          resolverEstimate += exportMatches?.length || 0;
        }
      }

      setParsedNode({
        name: files[0].name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_').toUpperCase(),
        fileCount: files.length,
        resolverCount: Math.max(resolverEstimate, 1),
        language: detectedLang,
        sizeKb: Math.round(totalSize / 1024),
      });
    } catch (err) {
      toast({ title: 'Parse failed', description: String(err), variant: 'destructive' });
    } finally {
      setParsing(false);
    }
  };

  const handleRegisterNode = async () => {
    if (!parsedNode) return;

    if (!canUpload) {
      toast({
        title: 'Daily upload limit reached',
        description: `You've used all ${evolutionUploadsPerDay} uploads for today. Upgrade your tier for more capacity.`,
        variant: 'destructive',
      });
      return;
    }

    setParsing(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('artifact_registry').insert({
        name: `CANDIDATE_${parsedNode.name}`,
        slug: `candidate-${parsedNode.name.toLowerCase()}-${Date.now().toString(36)}`,
        tier: 'candidate',
        category: 'proprietary-evolution',
        description: `Candidate Node #41 — ${parsedNode.language} (${parsedNode.fileCount} files, ${parsedNode.resolverCount} resolvers)`,
        metadata: {
          phase: 'ingest',
          language: parsedNode.language,
          file_count: parsedNode.fileCount,
          resolver_count: parsedNode.resolverCount,
          size_kb: parsedNode.sizeKb,
          ingested_at: new Date().toISOString(),
        },
      });

      if (error) throw error;
      setRegistered(true);
      await refreshUsage();
      toast({ title: 'Candidate node registered', description: `${parsedNode.name} is ready for Ascension` });
    } catch (err) {
      toast({ title: 'Registration failed', description: String(err), variant: 'destructive' });
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Quota */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/20 border border-border/20">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          Daily Uploads
        </span>
        <span className={cn(
          "text-xs font-mono font-bold",
          canUpload ? "text-primary" : "text-destructive"
        )}>
          {uploadsRemaining}/{evolutionUploadsPerDay} remaining
        </span>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 sm:p-10 text-center transition-all",
          !canUpload
            ? "border-destructive/30 bg-destructive/5 opacity-60 pointer-events-none"
            : dragOver
              ? "border-primary/60 bg-primary/5"
              : "border-border/30 bg-card/30 hover:border-border/50"
        )}
      >
        {!canUpload ? (
          <Lock className="w-8 h-8 mx-auto text-destructive/50 mb-3" />
        ) : (
          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
        )}
        <p className="text-sm sm:text-base text-foreground font-medium">
          {!canUpload ? 'Upload limit reached for today' : 'Drop source files here'}
        </p>
        <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
          {!canUpload
            ? 'Upgrade your tier for more daily uploads'
            : 'All 25 export languages supported — TypeScript, Python, Rust, Go, C/C++, Zig, Verilog, VHDL, SystemVerilog, Chisel, SPICE, SystemC, and more'}
        </p>
        {canUpload && (
          <div className="mt-4">
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept={ACCEPT_STRING}
              />
              <span className="text-xs text-primary hover:underline font-mono">
                or click to browse
              </span>
            </label>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-muted-foreground">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </p>
            <Button size="sm" onClick={handleParse} disabled={parsing} className="h-8 min-h-[44px] text-xs gap-1.5">
              {parsing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Code2 className="w-3 h-3" />}
              Analyze
            </Button>
          </div>

          <div className="grid gap-1 max-h-40 overflow-y-auto">
            {files.slice(0, 20).map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/20 text-xs">
                <FileCode2 className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-foreground/80 truncate font-mono">{f.name}</span>
                <span className="ml-auto text-muted-foreground">{(f.size / 1024).toFixed(1)}KB</span>
              </div>
            ))}
            {files.length > 20 && (
              <p className="text-[10px] text-muted-foreground text-center">+{files.length - 20} more</p>
            )}
          </div>
        </div>
      )}

      {/* Parsed Node Card */}
      {parsedNode && (
        <div className="border border-border/30 rounded-xl p-5 bg-card/40 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">
                Candidate: {parsedNode.name}
              </h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                 Candidate Node • {parsedNode.language}
               </p>
            </div>
            {registered ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500" />
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Files', value: parsedNode.fileCount },
              { label: 'Resolvers', value: parsedNode.resolverCount },
              { label: 'Size', value: `${parsedNode.sizeKb}KB` },
            ].map(stat => (
              <div key={stat.label} className="px-3 py-2 rounded-lg bg-muted/20 text-center">
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{stat.label}</p>
              </div>
            ))}
          </div>

          {!registered && (
            <Button onClick={handleRegisterNode} disabled={parsing || !canUpload} className="w-full gap-2 min-h-[44px]">
              {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
              Register as Candidate Node
            </Button>
          )}

          {registered && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-600 dark:text-green-400 font-mono">
                Node registered — Ready for Ascension phase
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
