/**
 * V2 Upload Step — Drag & drop / paste code
 * Computes fingerprint via V2 engine, stores with v2 category.
 */

import { useState, useCallback, useRef } from 'react';
import { Upload, FileCode2, ClipboardPaste, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { commitUpload } from '@/lib/ascension-v2';
import { analyzeUploadedFiles, analyzePastedCode } from '@/components/proprietary-evolution/ingest-utils';

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
      const fp = commitUpload(sourceFiles, analysis.language);

      // Clear previous v2 cycle
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('artifact_registry')
          .delete()
          .eq('user_id', user.id)
          .in('category', ['proprietary-evolution-v2', 'proprietary-discovery-v2', 'proprietary-ascended-v2']);
      } catch { /* non-fatal */ }

      // Register candidate with v2 category
      const langKey = analysis.language.toLowerCase().replace(/\s+/g, '');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('artifact_registry').insert({
        user_id: user.id,
        name: `CANDIDATE_${analysis.name}`,
        slug: `v2-candidate-${analysis.name.toLowerCase()}-${Date.now().toString(36)}`,
        tier: 'candidate',
        category: 'proprietary-evolution-v2',
        description: `${analysis.language} — ${analysis.fileCount} files, ${analysis.sizeKb}KB`,
        metadata: {
          phase: 'ingest',
          language: analysis.language,
          source_export_language: langKey,
          file_count: analysis.fileCount,
          resolver_count: analysis.resolverCount,
          size_kb: analysis.sizeKb,
          fingerprint_hash: fp.hash,
          fingerprint_function_count: fp.functionCount,
          ingested_at: new Date().toISOString(),
          pipeline_version: 'v2',
          source_files: analysis.ingestedFiles.map(f => ({
            name: f.name,
            extension: f.extension,
            language: f.language,
            size_bytes: f.sizeBytes,
            char_count: f.charCount,
            truncated: f.truncated,
            content: f.content,
          })),
        },
      });

      if (error) throw new Error(error.message);

      setDone(true);
      setTimeout(() => onComplete(), 600);
    } catch (err) {
      toast({ title: 'Upload failed', description: String(err), variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 animate-in fade-in">
        <CheckCircle2 className="w-12 h-12 text-primary" />
        <p className="text-foreground font-medium">Code uploaded</p>
        <p className="text-muted-foreground text-xs">Moving to analysis…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Upload Your Code</h2>
        <p className="text-muted-foreground text-sm mt-1">Drop source files or paste code. 90+ languages supported.</p>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setMode('upload')}
          className={cn(
            'px-4 py-2 rounded-lg text-xs font-medium transition-all',
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
            'px-4 py-2 rounded-lg text-xs font-medium transition-all',
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
              'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all',
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
                <FileCode2 className="w-8 h-8 mx-auto text-primary" />
                <p className="text-foreground font-medium text-sm">
                  {files.length} file{files.length > 1 ? 's' : ''} selected
                </p>
                <p className="text-muted-foreground text-xs">
                  {files.map(f => f.name).slice(0, 3).join(', ')}
                  {files.length > 3 && ` +${files.length - 3} more`}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-foreground text-sm">Drag & drop files here, or click to browse</p>
                <p className="text-muted-foreground text-xs">.ts, .py, .rs, .go, .sol, .vhdl, and 80+ more</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <Textarea
          placeholder="Paste your source code here…"
          value={pastedCode}
          onChange={(e) => setPastedCode(e.target.value)}
          className="min-h-[200px] font-mono text-xs resize-none rounded-xl"
        />
      )}

      <Button
        onClick={handleSubmit}
        disabled={!hasInput || processing || !user}
        className="w-full h-11 rounded-xl"
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
