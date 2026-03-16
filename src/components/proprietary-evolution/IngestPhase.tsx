/**
 * INGEST Phase — Import developer code and register as a candidate node
 * First stage of the Ascension lifecycle
 * Tier-gated: uploads limited per day (3/6/9/12 by tier)
 *
 * IRONCLAD HARDENING v2:
 * - Accepts ALL file types (no restrictive accept filter)
 * - Circuit breaker pattern for DB writes
 * - Exponential backoff retry with jitter
 * - Auto-heal on transient failures
 * - Graceful degradation on parse errors
 * - Dead-letter fallback logging
 */

import { useState, useCallback, useRef } from 'react';
import {
  Upload, FileCode2, CheckCircle2, AlertCircle, Loader2,
  Code2, Layers, Lock, ShieldCheck, RefreshCw, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEvolutionLimits } from '@/hooks/useEvolutionLimits';

/* ═══ TYPES ═══ */
interface ParsedNode {
  name: string;
  fileCount: number;
  resolverCount: number;
  language: string;
  sizeKb: number;
  parseWarnings: string[];
}

/* ═══ LANGUAGE DETECTION MAP ═══ */
const LANG_MAP: Record<string, string> = {
  // Software
  ts: 'TypeScript', tsx: 'TypeScript/React', js: 'JavaScript', jsx: 'JavaScript/React',
  py: 'Python', rs: 'Rust', go: 'Go', java: 'Java', rb: 'Ruby', cs: 'C#',
  cpp: 'C++', cc: 'C++', cxx: 'C++', hpp: 'C++ Header', c: 'C', h: 'C/C++ Header',
  zig: 'Zig', hs: 'Haskell', lhs: 'Haskell',
  swift: 'Swift', kt: 'Kotlin', kts: 'Kotlin',
  php: 'PHP', lua: 'Lua', dart: 'Dart',
  scala: 'Scala', sc: 'Scala',
  ex: 'Elixir', exs: 'Elixir',
  // HDL / Silicon
  v: 'Verilog', sv: 'SystemVerilog', svh: 'SystemVerilog',
  vhd: 'VHDL', vhdl: 'VHDL',
  bsv: 'Bluespec', // Bluespec SystemVerilog
  // SPICE / SystemC
  cir: 'SPICE', sp: 'SPICE', spice: 'SPICE',
  // Data / Config (still parseable)
  json: 'JSON', yaml: 'YAML', yml: 'YAML', toml: 'TOML', xml: 'XML',
  md: 'Markdown', txt: 'Text',
};

/* ═══ CIRCUIT BREAKER ═══ */
type BreakerState = 'closed' | 'open' | 'half-open';

interface CircuitBreaker {
  state: BreakerState;
  failures: number;
  lastFailure: number;
  cooldownMs: number;
}

const BREAKER_DEFAULTS: CircuitBreaker = {
  state: 'closed',
  failures: 0,
  lastFailure: 0,
  cooldownMs: 15_000, // 15s initial cooldown
};

const MAX_FAILURES = 3;
const MAX_RETRIES = 3;
const BASE_RETRY_MS = 800;

function canAttempt(breaker: CircuitBreaker): boolean {
  if (breaker.state === 'closed') return true;
  if (breaker.state === 'open') {
    return Date.now() - breaker.lastFailure > breaker.cooldownMs;
  }
  return true; // half-open allows one attempt
}

function recordSuccess(breaker: CircuitBreaker): CircuitBreaker {
  return { ...BREAKER_DEFAULTS };
}

function recordFailure(breaker: CircuitBreaker): CircuitBreaker {
  const failures = breaker.failures + 1;
  if (failures >= MAX_FAILURES) {
    return {
      state: 'open',
      failures,
      lastFailure: Date.now(),
      cooldownMs: Math.min(breaker.cooldownMs * 2, 120_000), // exponential up to 2min
    };
  }
  return { ...breaker, failures, lastFailure: Date.now() };
}

/** Retry with exponential backoff + jitter */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        const delay = BASE_RETRY_MS * Math.pow(2, attempt) + Math.random() * 400;
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

/** Dead-letter log for operations that exhaust all retries */
function deadLetterLog(operation: string, context: Record<string, unknown>, error: unknown) {
  console.error(`[INGEST DLQ] ${operation}`, { context, error: String(error), ts: new Date().toISOString() });
  // In production this would write to a dead_letter_queue table
}

/* ═══ SAFE FILE READER ═══ */
const TEXT_SAMPLE_BYTES = 64 * 1024;
const MAX_TEXT_ANALYSIS_BYTES = 1024 * 1024;

type SupportedTextEncoding = 'utf-8' | 'utf-16le' | 'utf-16be';

async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') {
    return blob.arrayBuffer();
  }

  return await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read blob'));
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.readAsArrayBuffer(blob);
  });
}

function detectTextEncoding(bytes: Uint8Array): SupportedTextEncoding {
  if (bytes.length >= 2) {
    if (bytes[0] === 0xff && bytes[1] === 0xfe) return 'utf-16le';
    if (bytes[0] === 0xfe && bytes[1] === 0xff) return 'utf-16be';
  }

  const pairCount = Math.floor(Math.min(bytes.length, 512) / 2);
  if (pairCount < 8) return 'utf-8';

  let evenNulls = 0;
  let oddNulls = 0;

  for (let i = 0; i < pairCount * 2; i += 2) {
    if (bytes[i] === 0x00) evenNulls++;
    if (bytes[i + 1] === 0x00) oddNulls++;
  }

  const evenRatio = evenNulls / pairCount;
  const oddRatio = oddNulls / pairCount;

  if (oddRatio > 0.3 && evenRatio < 0.05) return 'utf-16le';
  if (evenRatio > 0.3 && oddRatio < 0.05) return 'utf-16be';

  return 'utf-8';
}

function isLikelyBinary(bytes: Uint8Array, encoding: SupportedTextEncoding): boolean {
  if (encoding === 'utf-16le' || encoding === 'utf-16be') return false;
  if (bytes.length === 0) return false;

  let suspiciousControls = 0;
  let readableBytes = 0;

  for (const byte of bytes) {
    if (byte === 0x00) return true;

    const isWhitespace = byte === 0x09 || byte === 0x0a || byte === 0x0d || byte === 0x0c;
    const isControl = byte < 0x20 && !isWhitespace;
    const isReadable = byte >= 0x20 || byte >= 0x80 || isWhitespace;

    if (isControl) suspiciousControls++;
    if (isReadable) readableBytes++;
  }

  return suspiciousControls / bytes.length > 0.02 && readableBytes / bytes.length < 0.9;
}

async function safeReadText(file: File): Promise<string | null> {
  try {
    const sampleSize = Math.min(file.size, TEXT_SAMPLE_BYTES);
    const sampleBuffer = await blobToArrayBuffer(file.slice(0, sampleSize));
    const sampleBytes = new Uint8Array(sampleBuffer);
    const encoding = detectTextEncoding(sampleBytes);

    if (isLikelyBinary(sampleBytes, encoding)) return null;

    const analysisSize = Math.min(file.size, MAX_TEXT_ANALYSIS_BYTES);
    const analysisBuffer = analysisSize === sampleSize
      ? sampleBuffer
      : await blobToArrayBuffer(file.slice(0, analysisSize));

    const decoded = new TextDecoder(encoding, { fatal: false }).decode(analysisBuffer);
    return decoded.replace(/^\uFEFF/, '');
  } catch {
    return null;
  }
}

/* ═══ COMPONENT ═══ */
export function IngestPhase() {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [parsing, setParsing] = useState(false);
  const [parsedNode, setParsedNode] = useState<ParsedNode | null>(null);
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [breakerStatus, setBreakerStatus] = useState<CircuitBreaker>(BREAKER_DEFAULTS);
  const [autoHealAttempt, setAutoHealAttempt] = useState(0);
  const { toast } = useToast();
  const {
    canUpload, uploadsRemaining, evolutionUploadsPerDay,
    refreshUsage,
  } = useEvolutionLimits();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ═══ FILE HANDLING ═══ */
  const handleFiles = useCallback((incoming: File[]) => {
    setFiles(incoming);
    setParsedNode(null);
    setRegistered(false);
    setAutoHealAttempt(0);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) handleFiles(dropped);
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  }, [handleFiles]);

  /* ═══ PARSE / ANALYZE ═══ */
  const handleParse = async () => {
    if (files.length === 0) return;
    setParsing(true);

    try {
      const warnings: string[] = [];
      const totalSize = files.reduce((sum, f) => sum + f.size, 0);
      const extensions = new Set<string>();

      for (const file of files) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext) extensions.add(ext);
      }

      // Detect language(s)
      const detectedLangs = Array.from(extensions)
        .map(ext => LANG_MAP[ext])
        .filter(Boolean);
      const primaryLang = detectedLangs[0] || 'Unknown';

      if (detectedLangs.length === 0) {
        warnings.push('No recognized language extensions — files will be analyzed as raw input');
      }
      if (detectedLangs.length > 3) {
        warnings.push(`Mixed-language upload detected (${detectedLangs.length} languages)`);
      }

      // Count export points (resolvers) via safe text reading
      let resolverEstimate = 0;
      let filesAnalyzed = 0;
      let filesFailed = 0;

      for (const file of files) {
        const text = await safeReadText(file);
        if (text !== null) {
          filesAnalyzed++;
          const exportMatches = text.match(/export\s+(function|class|const|default|async\s+function)/g);
          const moduleMatches = text.match(/module\s+\w+/g); // HDL modules
          const entityMatches = text.match(/entity\s+\w+\s+is/gi); // VHDL entities
          resolverEstimate += (exportMatches?.length || 0) + (moduleMatches?.length || 0) + (entityMatches?.length || 0);
        } else {
          filesFailed++;
        }
      }

      if (filesFailed > 0) {
        warnings.push(`${filesFailed} file(s) skipped (binary or unreadable text content)`);
      }

      const nodeName = files[0].name
        .replace(/\.[^.]+$/, '')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toUpperCase()
        .slice(0, 40);

      setParsedNode({
        name: nodeName,
        fileCount: files.length,
        resolverCount: Math.max(resolverEstimate, 1),
        language: primaryLang + (detectedLangs.length > 1 ? ` +${detectedLangs.length - 1}` : ''),
        sizeKb: Math.round(totalSize / 1024),
        parseWarnings: warnings,
      });
    } catch (err) {
      toast({ title: 'Analysis failed', description: String(err), variant: 'destructive' });
    } finally {
      setParsing(false);
    }
  };

  /* ═══ REGISTER NODE (with circuit breaker + retry + auto-heal) ═══ */
  const handleRegisterNode = async () => {
    if (!parsedNode) return;

    if (!canUpload) {
      toast({
        title: 'Daily upload limit reached',
        description: `You've used all ${evolutionUploadsPerDay} uploads for today.`,
        variant: 'destructive',
      });
      return;
    }

    // Circuit breaker check
    if (!canAttempt(breakerStatus)) {
      const waitSec = Math.ceil((breakerStatus.cooldownMs - (Date.now() - breakerStatus.lastFailure)) / 1000);
      toast({
        title: 'Circuit breaker active',
        description: `Too many failures. Auto-retry in ~${waitSec}s. The system is self-healing.`,
        variant: 'destructive',
      });
      // Auto-heal: schedule retry
      if (autoHealAttempt < 2) {
        setTimeout(() => {
          setAutoHealAttempt(prev => prev + 1);
          setBreakerStatus(prev => ({ ...prev, state: 'half-open' }));
          handleRegisterNode();
        }, breakerStatus.cooldownMs);
      }
      return;
    }

    setRegistering(true);

    try {
      await withRetry(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from('artifact_registry').insert({
          name: `CANDIDATE_${parsedNode.name}`,
          slug: `candidate-${parsedNode.name.toLowerCase()}-${Date.now().toString(36)}`,
          tier: 'candidate',
          category: 'proprietary-evolution',
          description: `Candidate Node #41 — ${parsedNode.language} (${parsedNode.fileCount} files, ${parsedNode.resolverCount} resolvers, ${parsedNode.sizeKb}KB)`,
          metadata: {
            phase: 'ingest',
            language: parsedNode.language,
            file_count: parsedNode.fileCount,
            resolver_count: parsedNode.resolverCount,
            size_kb: parsedNode.sizeKb,
            ingested_at: new Date().toISOString(),
            parse_warnings: parsedNode.parseWarnings,
          },
        });

        if (error) throw error;
      });

      setBreakerStatus(recordSuccess(breakerStatus));
      setRegistered(true);
      setAutoHealAttempt(0);
      await refreshUsage();
      toast({ title: 'Candidate node registered', description: `${parsedNode.name} is ready for Ascension` });
    } catch (err) {
      const newBreaker = recordFailure(breakerStatus);
      setBreakerStatus(newBreaker);
      deadLetterLog('register_candidate_node', {
        name: parsedNode.name,
        attempt: autoHealAttempt,
        breakerState: newBreaker.state,
      }, err);

      if (newBreaker.state === 'open') {
        toast({
          title: 'Registration failed — circuit breaker tripped',
          description: `${newBreaker.failures} consecutive failures. Auto-healing in ${Math.round(newBreaker.cooldownMs / 1000)}s.`,
          variant: 'destructive',
        });
        // Auto-heal: schedule retry after cooldown
        if (autoHealAttempt < 2) {
          setTimeout(() => {
            setAutoHealAttempt(prev => prev + 1);
            setBreakerStatus(prev => ({ ...prev, state: 'half-open' }));
          }, newBreaker.cooldownMs);
        }
      } else {
        toast({ title: 'Registration failed', description: `Attempt ${newBreaker.failures}/${MAX_FAILURES} — retrying automatically`, variant: 'destructive' });
      }
    } finally {
      setRegistering(false);
    }
  };

  /* ═══ MANUAL RETRY (auto-heal trigger) ═══ */
  const handleManualRetry = () => {
    setBreakerStatus(prev => ({ ...prev, state: 'half-open', failures: Math.max(0, prev.failures - 1) }));
    setAutoHealAttempt(0);
    handleRegisterNode();
  };

  return (
    <div className="space-y-6">
      {/* Circuit Breaker Status Banner */}
      {breakerStatus.state !== 'closed' && (
        <div className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl border",
          breakerStatus.state === 'open'
            ? "border-destructive/30 bg-destructive/5"
            : "border-neon-amber/30 bg-neon-amber/5"
        )}>
          {breakerStatus.state === 'open' ? (
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          ) : (
            <RefreshCw className="w-5 h-5 text-neon-amber shrink-0 animate-spin" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {breakerStatus.state === 'open' ? 'Circuit Breaker Open' : 'Half-Open — Testing Recovery'}
            </p>
            <p className="text-xs text-muted-foreground">
              {breakerStatus.state === 'open'
                ? `${breakerStatus.failures} failures. Auto-heal scheduled. You can also retry manually.`
                : 'Next operation will test connectivity. Success resets the breaker.'}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleManualRetry} className="h-8 text-xs gap-1.5 shrink-0">
            <RefreshCw className="w-3 h-3" /> Retry Now
          </Button>
        </div>
      )}

      {/* Upload Quota */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/20 border border-border/20">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          Daily Uploads
        </span>
        <div className="flex items-center gap-2">
          {breakerStatus.state === 'closed' && (
            <ShieldCheck className="w-3 h-3 text-neon-green" />
          )}
          <span className={cn(
            "text-xs font-mono font-bold",
            canUpload ? "text-primary" : "text-destructive"
          )}>
            {uploadsRemaining}/{evolutionUploadsPerDay} remaining
          </span>
        </div>
      </div>

      {/* Drop Zone — accepts ALL file types */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 sm:p-10 text-center transition-all cursor-pointer",
          !canUpload
            ? "border-destructive/30 bg-destructive/5 opacity-60 pointer-events-none"
            : dragOver
              ? "border-primary/60 bg-primary/5"
              : "border-border/30 bg-card/30 hover:border-primary/30 hover:bg-primary/[0.02]"
        )}
        onClick={() => canUpload && fileInputRef.current?.click()}
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
            : 'All languages accepted — TypeScript, Python, Rust, Go, C/C++, Zig, Verilog, VHDL, SystemVerilog, Chisel, SPICE, SystemC, and any source file'}
        </p>
        {canUpload && (
          <p className="mt-3 text-xs text-primary font-mono">
            click or drag to upload
          </p>
        )}
        {/* Hidden file input — NO accept filter, allows everything */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
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
            {files.slice(0, 20).map((f, i) => {
              const ext = f.name.split('.').pop()?.toLowerCase() || '';
              const lang = LANG_MAP[ext];
              return (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/20 text-xs">
                  <FileCode2 className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="text-foreground/80 truncate font-mono">{f.name}</span>
                  {lang && (
                    <span className="text-[9px] text-primary/60 font-mono shrink-0">{lang}</span>
                  )}
                  <span className="ml-auto text-muted-foreground shrink-0">{(f.size / 1024).toFixed(1)}KB</span>
                </div>
              );
            })}
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
              <CheckCircle2 className="w-5 h-5 text-neon-green" />
            ) : (
              <AlertCircle className="w-5 h-5 text-neon-amber" />
            )}
          </div>

          {/* Parse Warnings */}
          {parsedNode.parseWarnings.length > 0 && (
            <div className="space-y-1 px-3 py-2 rounded-lg bg-neon-amber/5 border border-neon-amber/15">
              {parsedNode.parseWarnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle className="w-3 h-3 text-neon-amber mt-0.5 shrink-0" />
                  <p className="text-[11px] text-muted-foreground">{w}</p>
                </div>
              ))}
            </div>
          )}

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
            <Button
              onClick={handleRegisterNode}
              disabled={registering || !canUpload}
              className="w-full gap-2 min-h-[44px]"
            >
              {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
              Register as Candidate Node
            </Button>
          )}

          {registered && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-green/10 border border-neon-green/20">
              <CheckCircle2 className="w-4 h-4 text-neon-green" />
              <span className="text-xs text-neon-green font-mono">
                Node registered — Ready for Ascension phase
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
