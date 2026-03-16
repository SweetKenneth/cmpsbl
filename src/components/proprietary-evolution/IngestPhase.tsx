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
import { useAuth } from '@/contexts/AuthContext';
import { analyzeUploadedFiles, type CandidateAnalysis, LANG_MAP } from './ingest-utils';

/* ═══ TYPES ═══ */
type ParsedNode = CandidateAnalysis;

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
  cooldownMs: 15_000,
};

const MAX_FAILURES = 3;
const MAX_RETRIES = 3;
const BASE_RETRY_MS = 800;

function canAttempt(breaker: CircuitBreaker): boolean {
  if (breaker.state === 'closed') return true;
  if (breaker.state === 'open') {
    return Date.now() - breaker.lastFailure > breaker.cooldownMs;
  }
  return true;
}

function recordSuccess(): CircuitBreaker {
  return { ...BREAKER_DEFAULTS };
}

function recordFailure(breaker: CircuitBreaker): CircuitBreaker {
  const failures = breaker.failures + 1;
  if (failures >= MAX_FAILURES) {
    return {
      state: 'open',
      failures,
      lastFailure: Date.now(),
      cooldownMs: Math.min(breaker.cooldownMs * 2, 120_000),
    };
  }
  return { ...breaker, failures, lastFailure: Date.now() };
}

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
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

function deadLetterLog(operation: string, context: Record<string, unknown>, error: unknown) {
  console.error(`[INGEST DLQ] ${operation}`, { context, error: String(error), ts: new Date().toISOString() });
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
  const { user } = useAuth();
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
      console.log('[INGEST] Analyzing', files.length, 'file(s):', files.map(f => f.name).join(', '));
      const analysis = await analyzeUploadedFiles(files);
      console.log('[INGEST] Analysis complete:', {
        name: analysis.name,
        language: analysis.language,
        ingested: analysis.ingestedFiles.length,
        unreadable: analysis.unreadableFileCount,
        warnings: analysis.parseWarnings,
      });
      setParsedNode(analysis);
      if (analysis.ingestedFiles.length === 0) {
        toast({
          title: 'No code could be extracted',
          description: 'The files could not be read as text. Ensure they are valid source code files (not compiled binaries).',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('[INGEST] Analysis error:', err);
      toast({ title: 'Analysis failed', description: String(err), variant: 'destructive' });
    } finally {
      setParsing(false);
    }
  };

  /* ═══ REGISTER NODE (with circuit breaker + retry + auto-heal) ═══ */
  const handleRegisterNode = async () => {
    if (!parsedNode) return;

    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'You need to sign in before candidate nodes can be registered and persisted.',
        variant: 'destructive',
      });
      return;
    }

    if (parsedNode.ingestedFiles.length === 0) {
      toast({
        title: 'No readable code found',
        description: 'Upload at least one supported text-based source file so the candidate can ingest real code.',
        variant: 'destructive',
      });
      return;
    }

    if (!canUpload) {
      toast({
        title: 'Daily upload limit reached',
        description: `You've used all ${evolutionUploadsPerDay} uploads for today.`,
        variant: 'destructive',
      });
      return;
    }

    if (!canAttempt(breakerStatus)) {
      const waitSec = Math.ceil((breakerStatus.cooldownMs - (Date.now() - breakerStatus.lastFailure)) / 1000);
      toast({
        title: 'Circuit breaker active',
        description: `Too many failures. Auto-retry in ~${waitSec}s. The system is self-healing.`,
        variant: 'destructive',
      });
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
        const payload = {
          user_id: user.id,
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
            unreadable_file_count: parsedNode.unreadableFileCount,
            source_files: parsedNode.ingestedFiles.map(file => ({
              name: file.name,
              extension: file.extension,
              language: file.language,
              size_bytes: file.sizeBytes,
              char_count: file.charCount,
              truncated: file.truncated,
              content: file.content,
            })),
          },
        };

        console.log('[INGEST] Registering candidate node:', payload.name, 'files:', payload.metadata.source_files.length);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from('artifact_registry').insert(payload);

        if (error) {
          console.error('[INGEST] DB insert error:', error.message, error.code, error.details);
          throw new Error(`DB: ${error.message}`);
        }
      }, 2); // Only 2 retries to fail faster

      setBreakerStatus(recordSuccess());
      setRegistered(true);
      setAutoHealAttempt(0);
      await refreshUsage();
      toast({ title: 'Candidate node registered', description: `${parsedNode.name} ingested successfully and is ready for Ascension` });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const newBreaker = recordFailure(breakerStatus);
      setBreakerStatus(newBreaker);
      deadLetterLog('register_candidate_node', {
        name: parsedNode.name,
        attempt: autoHealAttempt,
        breakerState: newBreaker.state,
      }, err);

      toast({
        title: 'Registration failed',
        description: errMsg.includes('DB:') ? errMsg : `Unexpected error: ${errMsg}`,
        variant: 'destructive',
      });
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
