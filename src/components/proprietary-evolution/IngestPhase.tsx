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
 *
 * POST-INGEST: Displays the derived Capability Surface (Auxiliary Primitive identity)
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import {
  Upload, FileCode2, CheckCircle2, AlertCircle, Loader2,
  Code2, Layers, Lock, ShieldCheck, RefreshCw, AlertTriangle,
  Cpu, Zap, ClipboardPaste,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { OrbitalAssembly, type AssemblyState } from './OrbitalAssembly';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEvolutionLimits } from '@/hooks/useEvolutionLimits';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeUploadedFiles, analyzePastedCode, type CandidateAnalysis, LANG_MAP } from './ingest-utils';

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

// ═══ LOCAL CAPABILITY SURFACE DERIVATION (mirrors edge function logic) ═══
interface LocalCapabilitySurface {
  nodeName: string;
  capabilities: string[];
  sector: string;
  domain: string;
  description: string;
}

/** Normalize display language label → export language key (e.g. "C++" → "cpp") */
const LANG_TO_EXPORT_KEY: Record<string, string> = {
  'typescript': 'typescript', 'typescript/react': 'typescript',
  'javascript': 'typescript', 'javascript/react': 'typescript',
  'python': 'python', 'rust': 'rust', 'go': 'go', 'java': 'java',
  'c#': 'csharp', 'c++': 'cpp', 'c': 'c', 'zig': 'zig',
  'haskell': 'haskell', 'swift': 'swift', 'kotlin': 'kotlin',
  'php': 'php', 'lua': 'lua', 'dart': 'dart', 'scala': 'scala',
  'elixir': 'elixir', 'ruby': 'ruby',
  'verilog': 'verilog', 'systemverilog': 'systemverilog', 'vhdl': 'vhdl',
  'spice': 'spice', 'bluespec': 'systemverilog',
};

function resolveExportLanguageKey(langLabel: string): string {
  const key = langLabel.toLowerCase().replace(/\s+/g, '');
  return LANG_TO_EXPORT_KEY[key] || 'typescript';
}

const DOMAIN_SIGNAL_CHECKS: [string, string[]][] = [
  ['trading', ['trade', 'order', 'ticker', 'exchange', 'position', 'portfolio']],
  ['finance', ['balance', 'ledger', 'payment', 'invoice', 'accounting']],
  ['web', ['react', 'component', 'html', 'css', 'dom', 'render']],
  ['api', ['endpoint', 'fetch', 'api', 'rest', 'graphql', 'request']],
  ['data', ['dataframe', 'csv', 'transform', 'pipeline', 'etl', 'aggregate']],
  ['ml', ['model', 'train', 'predict', 'tensor', 'neural', 'loss']],
  ['security', ['encrypt', 'auth', 'token', 'jwt', 'certificate', 'firewall']],
  ['automation', ['automat', 'schedule', 'cron', 'task', 'workflow', 'queue']],
  ['iot', ['sensor', 'mqtt', 'gpio', 'device', 'telemetry', 'actuator']],
  ['game', ['game', 'sprite', 'render', 'physics', 'collision', 'player']],
  ['hardware', ['verilog', 'vhdl', 'module', 'wire', 'reg', 'clock', 'synthesis', 'fpga', 'signal', 'assign']],
];

const DOMAIN_PROFILES: Record<string, { nodeName: string; capabilities: string[]; sector: string; description: string }> = {
  trading:    { nodeName: 'TRADE_ENGINE',    capabilities: ['execute_trade', 'assess_risk', 'price_feed', 'rebalance'],     sector: 'finance',    description: 'Algorithmic trade execution engine' },
  finance:    { nodeName: 'FINANCE_CORE',    capabilities: ['calculate', 'ledger_post', 'reconcile', 'audit_trail'],        sector: 'finance',    description: 'Financial computation and ledger core' },
  web:        { nodeName: 'WEB_SERVICE',     capabilities: ['serve_request', 'route', 'authenticate', 'render'],            sector: 'web',        description: 'Web service request handler' },
  api:        { nodeName: 'API_GATEWAY',     capabilities: ['route_request', 'validate', 'transform_payload', 'rate_gate'], sector: 'api',        description: 'API gateway and request memory chain' },
  data:       { nodeName: 'DATA_PIPELINE',   capabilities: ['transform_data', 'pipeline', 'validate_schema', 'aggregate'], sector: 'data',       description: 'Data transformation memory chain' },
  ml:         { nodeName: 'ML_ENGINE',       capabilities: ['train_model', 'predict', 'evaluate', 'feature_extract'],       sector: 'ml',         description: 'Machine learning inference engine' },
  security:   { nodeName: 'SECURITY_CORE',   capabilities: ['encrypt', 'authenticate', 'authorize', 'audit_access'],       sector: 'security',   description: 'Security and access control core' },
  automation: { nodeName: 'AUTO_EXECUTOR',   capabilities: ['schedule', 'execute_task', 'monitor', 'retry_logic'],          sector: 'automation', description: 'Task automation executor' },
  iot:        { nodeName: 'IOT_BRIDGE',      capabilities: ['sense', 'transmit', 'actuate', 'calibrate'],                   sector: 'iot',        description: 'IoT device bridge and telemetry' },
  game:       { nodeName: 'GAME_RUNTIME',    capabilities: ['simulate', 'render_frame', 'handle_input', 'update_state'],    sector: 'game',       description: 'Game state and simulation runtime' },
  hardware:   { nodeName: 'HDL_SYNTHESIZER', capabilities: ['synthesize', 'simulate_circuit', 'route_signal', 'verify_timing'], sector: 'hardware', description: 'Hardware description and synthesis engine' },
  software:   { nodeName: 'CODE_MODULE',     capabilities: ['process', 'transform', 'validate', 'dispatch'],                sector: 'execution',  description: 'General-purpose code module' },
};

function deriveLocalSurface(analysis: CandidateAnalysis): LocalCapabilitySurface {
  const allContent = analysis.ingestedFiles.map(f => f.content || '').join('\n').toLowerCase();
  const nameWords = analysis.name.toLowerCase();
  const langLower = analysis.language.toLowerCase();

  const domainSignals: Record<string, number> = {};
  for (const [domain, keywords] of DOMAIN_SIGNAL_CHECKS) {
    let score = 0;
    for (const kw of keywords) {
      if (allContent.includes(kw)) score += 2;
      if (nameWords.includes(kw)) score += 3;
    }
    if (score > 0) domainSignals[domain] = score;
  }

  if (langLower.includes('verilog') || langLower.includes('vhdl') || langLower.includes('systemverilog') || langLower.includes('chisel') || langLower.includes('spice')) {
    domainSignals.hardware = (domainSignals.hardware || 0) + 10;
  }

  const sorted = Object.entries(domainSignals).sort(([,a],[,b]) => b - a);
  const domain = sorted.length > 0 ? sorted[0][0] : 'software';
  const profile = DOMAIN_PROFILES[domain] || DOMAIN_PROFILES.software;

  const cleanName = analysis.name.replace(/_/g, ' ').trim();
  const nodeName = cleanName.length > 2 && cleanName.length < 20
    ? cleanName.toUpperCase().replace(/\s+/g, '_')
    : profile.nodeName;

  return {
    nodeName,
    capabilities: profile.capabilities,
    sector: profile.sector,
    domain,
    description: profile.description,
  };
}

/* ═══ COMPONENT ═══ */
export function IngestPhase() {
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [pastedCode, setPastedCode] = useState('');
  const [pasteFilename, setPasteFilename] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedNode, setParsedNode] = useState<ParsedNode | null>(null);
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [breakerStatus, setBreakerStatus] = useState<CircuitBreaker>(BREAKER_DEFAULTS);
  const [autoHealAttempt, setAutoHealAttempt] = useState(0);
  const [capSurface, setCapSurface] = useState<LocalCapabilitySurface | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    canUpload, uploadsRemaining, evolutionUploadsPerDay,
    refreshUsage,
  } = useEvolutionLimits();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasInput = inputMode === 'upload' ? files.length > 0 : pastedCode.trim().length > 20;

  /* ═══ FILE HANDLING ═══ */
  const handleFiles = useCallback((incoming: File[]) => {
    setFiles(incoming);
    setParsedNode(null);
    setRegistered(false);
    setAutoHealAttempt(0);
    setCapSurface(null);
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

    // Snap to animation area
    setTimeout(() => {
      document.getElementById('ingest-orbital')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    try {
      const analysis = await analyzeUploadedFiles(files);
      setParsedNode(analysis);

      // Derive capability surface locally for immediate display
      if (analysis.ingestedFiles.length > 0) {
        const surface = deriveLocalSurface(analysis);
        setCapSurface(surface);
      }

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

  /* ═══ REGISTER NODE ═══ */
  const handleRegisterNode = async () => {
    if (!parsedNode) return;

    if (!user) {
      toast({ title: 'Sign in required', description: 'You need to sign in before candidate nodes can be registered.', variant: 'destructive' });
      return;
    }

    if (parsedNode.ingestedFiles.length === 0) {
      toast({ title: 'No readable code found', description: 'Upload at least one supported text-based source file.', variant: 'destructive' });
      return;
    }

    if (!canUpload) {
      toast({ title: 'Daily upload limit reached', description: `You've used all ${evolutionUploadsPerDay} uploads for today.`, variant: 'destructive' });
      return;
    }

    if (!canAttempt(breakerStatus)) {
      const waitSec = Math.ceil((breakerStatus.cooldownMs - (Date.now() - breakerStatus.lastFailure)) / 1000);
      toast({ title: 'Circuit breaker active', description: `Too many failures. Auto-retry in ~${waitSec}s.`, variant: 'destructive' });
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
      // Auto-clear previous cycle's discoveries & ascensions before registering new candidate
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('artifact_registry')
          .delete()
          .eq('user_id', user.id)
          .in('category', ['proprietary-discovery', 'proprietary-ascended']);
      } catch {
        // Non-fatal — proceed even if cleanup fails
      }

      await withRetry(async () => {
        const payload = {
          user_id: user.id,
          name: `CANDIDATE_${parsedNode.name}`,
          slug: `candidate-${parsedNode.name.toLowerCase()}-${Date.now().toString(36)}`,
          tier: 'candidate',
          category: 'proprietary-evolution',
          description: capSurface
            ? `Ψ₄₁ ${capSurface.nodeName} — ${capSurface.description} (${parsedNode.language}, ${parsedNode.fileCount} files, ${parsedNode.resolverCount} resolvers)`
            : `Candidate Auxiliary Primitive — ${parsedNode.language} (${parsedNode.fileCount} files, ${parsedNode.resolverCount} resolvers, ${parsedNode.sizeKb}KB)`,
          metadata: {
            phase: 'ingest',
            language: parsedNode.language,
            // Normalized export language key — used to lock export to source language
            source_export_language: resolveExportLanguageKey(parsedNode.language),
            file_count: parsedNode.fileCount,
            resolver_count: parsedNode.resolverCount,
            size_kb: parsedNode.sizeKb,
            ingested_at: new Date().toISOString(),
            parse_warnings: parsedNode.parseWarnings,
            unreadable_file_count: parsedNode.unreadableFileCount,
            // Store derived capability surface for the edge function
            derived_surface: capSurface ? {
              nodeName: capSurface.nodeName,
              capabilities: capSurface.capabilities,
              sector: capSurface.sector,
              domain: capSurface.domain,
            } : null,
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from('artifact_registry').insert(payload);
        if (error) throw new Error(`DB: ${error.message}`);
      }, 2);

      setBreakerStatus(recordSuccess());
      setRegistered(true);
      setAutoHealAttempt(0);
      await refreshUsage();
      toast({
        title: capSurface ? `Ψ₄₁ ${capSurface.nodeName} registered` : 'Candidate node registered',
        description: `${parsedNode.name} ingested and ready for Ascension`,
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const newBreaker = recordFailure(breakerStatus);
      setBreakerStatus(newBreaker);
      deadLetterLog('register_candidate_node', { name: parsedNode.name, attempt: autoHealAttempt, breakerState: newBreaker.state }, err);
      toast({ title: 'Registration failed', description: errMsg.includes('DB:') ? errMsg : `Unexpected error: ${errMsg}`, variant: 'destructive' });
    } finally {
      setRegistering(false);
    }
  };

  const handleManualRetry = () => {
    setBreakerStatus(prev => ({ ...prev, state: 'half-open', failures: Math.max(0, prev.failures - 1) }));
    setAutoHealAttempt(0);
    handleRegisterNode();
  };

  return (
    <div className="space-y-7">
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
                ? `${breakerStatus.failures} failures. Auto-heal scheduled.`
                : 'Next operation will test connectivity.'}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleManualRetry} className="h-8 text-xs gap-1.5 shrink-0">
            <RefreshCw className="w-3 h-3" /> Retry Now
          </Button>
        </div>
      )}

      {/* Upload Quota */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/20">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Daily Uploads</span>
        <div className="flex items-center gap-2">
          {breakerStatus.state === 'closed' && <ShieldCheck className="w-3 h-3 text-neon-green" />}
          <span className={cn("text-xs font-mono font-bold", canUpload ? "text-primary" : "text-destructive")}>
            {uploadsRemaining}/{evolutionUploadsPerDay} remaining
          </span>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer",
          !canUpload
            ? "border-destructive/30 bg-destructive/5 opacity-60 pointer-events-none"
            : dragOver
              ? "border-primary/60 bg-primary/[0.06] shadow-[0_0_30px_hsl(var(--primary)/0.1)]"
              : "border-border/30 bg-card/40 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/[0.03]"
        )}
        onClick={() => canUpload && fileInputRef.current?.click()}
      >
        {!canUpload ? <Lock className="w-8 h-8 mx-auto text-destructive/50 mb-3" /> : <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />}
        <p className="text-sm sm:text-base text-foreground font-medium">
          {!canUpload ? 'Upload limit reached for today' : 'Drop source files here'}
        </p>
        <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
          {!canUpload ? 'Upgrade your tier for more daily uploads' : 'All languages accepted — TypeScript, Python, Rust, Go, Verilog, VHDL, SystemVerilog, and any source file'}
        </p>
        {canUpload && <p className="mt-3 text-xs text-primary font-mono">click or drag to upload</p>}
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-mono text-muted-foreground">{files.length} file{files.length !== 1 ? 's' : ''} selected</p>
            <Button size="sm" onClick={handleParse} disabled={parsing} className="h-10 min-h-[44px] text-xs gap-1.5 px-5">
              {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Code2 className="w-4 h-4" />}
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
                  <span className="text-foreground/80 break-words font-mono">{f.name}</span>
                  {lang && <span className="text-[9px] text-primary/60 font-mono shrink-0">{lang}</span>}
                  <span className="ml-auto text-muted-foreground shrink-0">{(f.size / 1024).toFixed(1)}KB</span>
                </div>
              );
            })}
            {files.length > 20 && <p className="text-[10px] text-muted-foreground text-center">+{files.length - 20} more</p>}
          </div>
        </div>
      )}

      {/* ═══ ORBITAL ASSEMBLY VISUALIZATION ═══ */}
      {(files.length > 0 || parsedNode) && (
        <div id="ingest-orbital">
        <OrbitalAssembly
          state={
            parsing ? 'scanning'
              : (parsedNode && capSurface) ? 'complete'
              : 'idle'
          }
          fileCount={files.length || 1}
          capabilities={capSurface?.capabilities}
          nodeName={capSurface?.nodeName}
        />
        </div>
      )}

      {/* Parsed Node Card */}
      {parsedNode && (
        <div className="border border-border/25 rounded-2xl p-5 sm:p-6 bg-card/60 backdrop-blur-sm space-y-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">
                {capSurface ? `Ψ₄₁ ${capSurface.nodeName}` : `Candidate: ${parsedNode.name}`}
              </h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {capSurface ? capSurface.description : `Candidate Node • ${parsedNode.language}`}
              </p>
            </div>
            {registered ? (
              <CheckCircle2 className="w-5 h-5 text-neon-green" />
            ) : (
              <AlertCircle className="w-5 h-5 text-neon-amber" />
            )}
          </div>

          {/* ═══ CAPABILITY SURFACE CARD ═══ */}
          {capSurface && (
            <div className="rounded-xl border border-primary/20 bg-primary/[0.04] backdrop-blur-sm p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-mono text-primary font-semibold uppercase tracking-wider">
                  Derived Capability Surface
                </span>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-foreground font-bold">
                  Ψ₄₁ {capSurface.nodeName}
                </span>
                <span className="text-[9px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted/30">
                  {capSurface.sector} sector
                </span>
                <span className="text-[9px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted/30">
                  {capSurface.domain} domain
                </span>
              </div>

              {/* Capability verbs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {capSurface.capabilities.map((verb, i) => (
                  <span key={i} className="text-[10px] font-mono text-primary/80 px-2 py-1 rounded-md bg-primary/10 border border-primary/15">
                    <Zap className="w-2.5 h-2.5 inline mr-0.5 -mt-0.5" />
                    {verb}
                  </span>
                ))}
              </div>

              <p className="text-[10px] text-muted-foreground leading-relaxed">
                This capability surface will be used as the Auxiliary Primitive in the collision engine — your code participates as a first-class peer alongside the 40 substrate primitives.
              </p>
            </div>
          )}

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
              className="w-full gap-2"
            >
              {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
              {capSurface
                ? `Register Ψ₄₁ ${capSurface.nodeName} as Auxiliary Primitive`
                : 'Register as Candidate Auxiliary Primitive'}
            </Button>
          )}

          {registered && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-neon-green/10 border border-neon-green/20">
              <CheckCircle2 className="w-4 h-4 text-neon-green shrink-0" />
              <p className="text-xs text-foreground">
                {capSurface
                  ? `Ψ₄₁ ${capSurface.nodeName} registered — proceed to Ascension to collide against 40 substrate primitives`
                  : 'Node registered — proceed to Ascension'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
