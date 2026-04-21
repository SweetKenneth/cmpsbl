/**
 * V2 Upload Step — Drag & drop / paste code
 * Computes fingerprint via V2 engine, stores with v2 category.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, FileCode2, ClipboardPaste, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { commitUpload, PreAscensionGateError, emitFunnelEvent, getSnapshot, initRun } from '@/lib/ascension-v2';
import { analyzeUploadedFiles, analyzePastedCode } from '@/components/proprietary-evolution/ingest-utils';
import { consumeReAscendPayload, type ReAscendPayload } from '@/lib/ascension-v2/reascend';
import { V2PreflightEstimator } from './V2PreflightEstimator';

interface Props {
  onComplete: () => void;
}

export function V2UploadStep({ onComplete }: Props) {
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [pastedCode, setPastedCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [reAscendBanner, setReAscendBanner] = useState<{ priorRunId: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) setFiles(dropped);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setFiles(Array.from(e.target.files));
  }, []);

  const hasInput = mode === 'upload' ? files.length > 0 : pastedCode.trim().length > 20;

  /**
   * Shared commit path used by manual submit AND one-click re-ascension.
   * Takes the already-analyzed source bundle (no File objects required) so
   * re-runs can replay a prior session without re-uploading.
   */
  const runIngestion = useCallback(async (
    analysis: {
      name: string;
      language: string;
      fileCount: number;
      sizeKb: number;
      resolverCount: number;
      ingestedFiles: Array<{
        name: string;
        extension: string;
        language: string;
        sizeBytes: number;
        charCount: number;
        truncated: boolean;
        content: string;
      }>;
    },
    reAscendOf?: { priorRunId: string; priorFingerprint: string | null },
  ) => {
    if (!user) return;
    setProcessing(true);
    const startedAt = Date.now();

    try {
      if (analysis.ingestedFiles.length === 0) {
        toast({ title: 'No code found', description: 'Could not read source code from input.', variant: 'destructive' });
        setProcessing(false);
        return;
      }

      const sourceFiles = analysis.ingestedFiles.map(f => ({
        name: f.name,
        content: f.content,
      }));

      // Defensive: ensure orchestrator is in `idle` before commitUpload.
      // Re-ascension can route back to /ascension-v2 without a remount, and a
      // user navigating back from Results never hits the page-level initRun.
      // Without this guard, commitUpload throws "Cannot upload in phase: done".
      if (getSnapshot().phase !== 'idle') {
        initRun();
      }

      const preRunId = getSnapshot().runId;
      void emitFunnelEvent('upload_started', {
        runId: preRunId,
        language: analysis.language,
        fileCount: sourceFiles.length,
        extras: reAscendOf ? { re_ascension_of: reAscendOf.priorRunId } : undefined,
      });

      const fp = commitUpload(sourceFiles, analysis.language);

      void emitFunnelEvent('gate_passed', {
        runId: getSnapshot().runId,
        language: analysis.language,
        fileCount: sourceFiles.length,
        fingerprint: fp.hash,
        durationMs: Date.now() - startedAt,
        extras: reAscendOf
          ? {
              re_ascension_of: reAscendOf.priorRunId,
              fingerprint_changed: reAscendOf.priorFingerprint
                ? reAscendOf.priorFingerprint !== fp.hash
                : null,
            }
          : undefined,
      });

      try {
        const previewSource = sourceFiles[0]?.content?.slice(0, 8000) ?? '';
        if (previewSource && typeof window !== 'undefined') {
          window.sessionStorage.setItem('cmpsbl:v2:source-preview', previewSource);
        }
      } catch { /* non-fatal */ }

      const slugSeed = Date.now().toString(36);
      const candidateName = `CANDIDATE_${analysis.name}`;
      const description = `${analysis.language} — ${analysis.fileCount} files, ${analysis.sizeKb}KB`;
      const baseMetadata = {
        phase: 'ingest',
        language: analysis.language,
        source_export_language: analysis.language.toLowerCase().replace(/\s+/g, ''),
        file_count: analysis.fileCount,
        resolver_count: analysis.resolverCount,
        size_kb: analysis.sizeKb,
        fingerprint_hash: fp.hash,
        fingerprint_function_count: fp.functionCount,
        ingested_at: new Date().toISOString(),
        re_ascension_of: reAscendOf?.priorRunId ?? null,
        source_files: analysis.ingestedFiles.map(f => ({
          name: f.name,
          extension: f.extension,
          language: f.language,
          size_bytes: f.sizeBytes,
          char_count: f.charCount,
          truncated: f.truncated,
          content: f.content,
        })),
      };

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('artifact_registry')
          .delete()
          .eq('user_id', user.id)
          .in('category', ['proprietary-evolution-v2', 'proprietary-discovery-v2', 'proprietary-ascended-v2', 'proprietary-mana-attachment-v2']);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('artifact_registry')
          .delete()
          .eq('user_id', user.id)
          .eq('category', 'proprietary-evolution')
          .eq('tier', 'candidate');
      } catch { /* non-fatal */ }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('artifact_registry').insert([
        {
          user_id: user.id,
          name: candidateName,
          slug: `v2-candidate-${analysis.name.toLowerCase()}-${slugSeed}`,
          tier: 'candidate',
          category: 'proprietary-evolution-v2',
          description,
          metadata: { ...baseMetadata, pipeline_version: 'v2' },
        },
        {
          user_id: user.id,
          name: candidateName,
          slug: `candidate-v2-mirror-${analysis.name.toLowerCase()}-${slugSeed}`,
          tier: 'candidate',
          category: 'proprietary-evolution',
          description,
          metadata: { ...baseMetadata, pipeline_version: 'v2-mirror', mirror_source: 'ascension-v2' },
        },
      ]);

      if (error) throw new Error(error.message);

      setDone(true);
      setTimeout(() => onComplete(), 600);
    } catch (err) {
      if (err instanceof PreAscensionGateError) {
        const first = err.errors[0];
        const more = err.errors.length > 1 ? ` (+${err.errors.length - 1} more)` : '';
        toast({
          title: `${first.code} — invalid source`,
          description: `${first.file}:${first.line}:${first.column} — ${first.message}. ${first.suggestion}${more}`,
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Upload failed', description: String(err), variant: 'destructive' });
      }
    } finally {
      setProcessing(false);
    }
  }, [user, onComplete, toast]);

  // One-click re-ascension: if Results step handed us a payload, replay it
  // immediately on mount with the prior source + language. Layers are
  // preselected by V2EnhanceStep via the reattach handoff (set in parallel).
  useEffect(() => {
    const payload: ReAscendPayload | null = consumeReAscendPayload();
    if (!payload || !user) return;

    // The page-level effect skips initRun when a re-ascension is pending, so
    // we own the run lifecycle here. Always reset to guarantee a clean chain
    // regardless of whatever phase the prior run left the orchestrator in.
    initRun();

    const analysis = {
      name: payload.files[0]?.name?.replace(/\.[^.]+$/, '') || 'reascend',
      language: payload.language,
      fileCount: payload.files.length,
      sizeKb: Math.max(1, Math.round(payload.files.reduce((n, f) => n + (f.content?.length ?? 0), 0) / 1024)),
      resolverCount: payload.files.length,
      ingestedFiles: payload.files.map((f) => ({
        name: f.name,
        extension: f.extension ?? f.name.split('.').pop() ?? '',
        language: f.language ?? payload.language,
        sizeBytes: f.sizeBytes ?? (f.content?.length ?? 0),
        charCount: f.charCount ?? (f.content?.length ?? 0),
        truncated: false,
        content: f.content,
      })),
    };

    setReAscendBanner({ priorRunId: payload.priorRunId });
    runIngestion(analysis, {
      priorRunId: payload.priorRunId,
      priorFingerprint: payload.priorFingerprint,
    }).catch(() => {
      // Surface the manual upload UI again on failure instead of stranding
      // the user on an infinite "Re-ascending…" spinner.
      setReAscendBanner(null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async () => {
    if (!hasInput || !user) return;
    const analysis = mode === 'upload'
      ? await analyzeUploadedFiles(files)
      : analyzePastedCode(pastedCode);
    await runIngestion(analysis);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 sm:py-16 animate-in fade-in">
        <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
        <p className="text-foreground font-medium text-sm sm:text-base">Code uploaded</p>
        <p className="text-muted-foreground text-xs">Moving to analysis…</p>
      </div>
    );
  }

  if (reAscendBanner && processing) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 sm:py-16 animate-in fade-in">
        <RefreshCw className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-spin" />
        <p className="text-foreground font-medium text-sm sm:text-base">Re-ascending your code</p>
        <p className="text-muted-foreground text-xs">
          Replaying your last run with the same source and layers…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-base sm:text-lg font-semibold text-foreground">Upload Your Code</h2>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Drop source files or paste code. <span className="text-foreground font-medium">{getSupportedLanguages().length} languages shipping today</span> · {getCanonicalLanguages().length} canonical, {getBetaLanguages().length} beta polyglot.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        <button
          onClick={() => setMode('upload')}
          className={cn(
            'px-3 sm:px-4 py-2 rounded-lg text-xs font-medium transition-all',
            mode === 'upload'
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Upload className="w-3 h-3 inline mr-1" />
          Upload Files
        </button>
        <button
          onClick={() => setMode('paste')}
          className={cn(
            'px-3 sm:px-4 py-2 rounded-lg text-xs font-medium transition-all',
            mode === 'paste'
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <ClipboardPaste className="w-3 h-3 inline mr-1" />
          Paste Code
        </button>
      </div>

      {mode === 'upload' ? (
        <>
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-6 sm:p-10 text-center cursor-pointer transition-all',
              dragOver ? 'border-primary bg-primary/5' :
              files.length > 0 ? 'border-primary/30 bg-primary/[0.03]' :
              'border-border/30 hover:border-border/50'
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
            {files.length > 0 ? (
              <div className="space-y-1">
                <FileCode2 className="w-7 h-7 sm:w-8 sm:h-8 mx-auto text-primary" />
                <p className="text-foreground font-medium text-xs sm:text-sm">
                  {files.length} file{files.length > 1 ? 's' : ''} selected
                </p>
                <p className="text-muted-foreground text-[10px] sm:text-xs break-all">
                  {files.map(f => f.name).slice(0, 3).join(', ')}
                  {files.length > 3 && ` +${files.length - 3} more`}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="w-7 h-7 sm:w-8 sm:h-8 mx-auto text-muted-foreground" />
                <p className="text-foreground text-xs sm:text-sm">Drag & drop files here, or click to browse</p>
                <p className="text-muted-foreground text-[10px] sm:text-xs">.ts, .py, .rs, .go, .sol, .vhdl, and 80+ more</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <Textarea
          placeholder="Paste your source code here…"
          value={pastedCode}
          onChange={(e) => setPastedCode(e.target.value)}
          className="min-h-[160px] sm:min-h-[200px] font-mono text-xs resize-none rounded-xl"
        />
      )}

      {hasInput && (
        <V2PreflightEstimator files={files} pastedCode={pastedCode} mode={mode} />
      )}

      <Button
        onClick={handleSubmit}
        disabled={!hasInput || processing || !user}
        className="w-full h-10 sm:h-11 rounded-xl text-sm"
      >
        {processing ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing…</>
        ) : (
          <><FileCode2 className="w-4 h-4 mr-2" />Analyze Code</>
        )}
      </Button>

      {!user && (
        <p className="text-center text-xs text-muted-foreground">
          Sign in to upload and analyze your code
        </p>
      )}
    </div>
  );
}
