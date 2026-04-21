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
import { commitUpload, PreAscensionGateError, emitFunnelEvent, getSnapshot } from '@/lib/ascension-v2';
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

  const handleSubmit = async () => {
    if (!hasInput || !user) return;
    setProcessing(true);
    const startedAt = Date.now();

    try {
      const analysis = mode === 'upload'
        ? await analyzeUploadedFiles(files)
        : analyzePastedCode(pastedCode);

      if (analysis.ingestedFiles.length === 0) {
        toast({ title: 'No code found', description: 'Could not read source code from input.', variant: 'destructive' });
        setProcessing(false);
        return;
      }

      // Compute fingerprint via V2 orchestrator
      const sourceFiles = analysis.ingestedFiles.map(f => ({
        name: f.name,
        content: f.content,
      }));

      // Funnel event #1 — upload_started (fires before the gate so we capture
      // even runs that get rejected by the Pre-Ascension Gate).
      const preRunId = getSnapshot().runId;
      void emitFunnelEvent('upload_started', {
        runId: preRunId,
        language: analysis.language,
        fileCount: sourceFiles.length,
      });

      const fp = commitUpload(sourceFiles, analysis.language);

      // Funnel event #2 — gate_passed (only fires if commitUpload didn't throw)
      void emitFunnelEvent('gate_passed', {
        runId: getSnapshot().runId,
        language: analysis.language,
        fileCount: sourceFiles.length,
        fingerprint: fp.hash,
        durationMs: Date.now() - startedAt,
      });

      // Stash a small source preview for the Governance Mode step.
      // Ephemeral (sessionStorage) — never persisted server-side beyond
      // the artifact_registry record committed below.
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

      // Clear previous v2 cycle
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('artifact_registry')
          .delete()
          .eq('user_id', user.id)
          .in('category', ['proprietary-evolution-v2', 'proprietary-discovery-v2', 'proprietary-ascended-v2', 'proprietary-mana-attachment-v2']);

        // WHY: the collision engine still resolves candidate nodes from the
        // legacy category, so V2 needs a fresh mirror record there.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('artifact_registry')
          .delete()
          .eq('user_id', user.id)
          .eq('category', 'proprietary-evolution')
          .eq('tier', 'candidate');
      } catch { /* non-fatal */ }

      // Register both the V2 source-of-truth candidate and a legacy mirror
      // so the existing collision engine can actually resolve the upload.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('artifact_registry').insert([
        {
          user_id: user.id,
          name: candidateName,
          slug: `v2-candidate-${analysis.name.toLowerCase()}-${slugSeed}`,
          tier: 'candidate',
          category: 'proprietary-evolution-v2',
          description,
          metadata: {
            ...baseMetadata,
            pipeline_version: 'v2',
          },
        },
        {
          user_id: user.id,
          name: candidateName,
          slug: `candidate-v2-mirror-${analysis.name.toLowerCase()}-${slugSeed}`,
          tier: 'candidate',
          category: 'proprietary-evolution',
          description,
          metadata: {
            ...baseMetadata,
            pipeline_version: 'v2-mirror',
            mirror_source: 'ascension-v2',
          },
        },
      ]);

      if (error) throw new Error(error.message);

      setDone(true);
      setTimeout(() => onComplete(), 600);
    } catch (err) {
      if (err instanceof PreAscensionGateError) {
        // 🔒 Pre-Ascension Gate rejection — show first error with file:line:col
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-base sm:text-lg font-semibold text-foreground">Upload Your Code</h2>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Drop source files or paste code. <span className="text-foreground font-medium">9 languages shipping today</span> · others coming soon.
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
