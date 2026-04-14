/**
 * SimpleUploadStep — Clean, minimal code upload
 * Hides all internals (circuit breakers, capability surfaces, etc.)
 * User sees: drop zone → spinner → ✓ ready
 */

import { useState, useCallback, useRef } from 'react';
import { Upload, FileCode2, CheckCircle2, Loader2, ClipboardPaste } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeUploadedFiles, analyzePastedCode, type CandidateAnalysis } from './ingest-utils';

interface Props {
  onComplete: (analysis: CandidateAnalysis) => void;
}

export function SimpleUploadStep({ onComplete }: Props) {
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
        toast({ title: 'No code found', description: 'The files could not be read as source code.', variant: 'destructive' });
        setProcessing(false);
        return;
      }

      // Clear previous cycle
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('artifact_registry')
          .delete()
          .eq('user_id', user.id)
          .in('category', ['proprietary-evolution', 'proprietary-discovery', 'proprietary-ascended']);
      } catch { /* non-fatal */ }

      // Register candidate
      const langKey = analysis.language.toLowerCase().replace(/\s+/g, '');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('artifact_registry').insert({
        user_id: user.id,
        name: `CANDIDATE_${analysis.name}`,
        slug: `candidate-${analysis.name.toLowerCase()}-${Date.now().toString(36)}`,
        tier: 'candidate',
        category: 'proprietary-evolution',
        description: `${analysis.language} — ${analysis.fileCount} files, ${analysis.sizeKb}KB`,
        metadata: {
          phase: 'ingest',
          language: analysis.language,
          source_export_language: langKey,
          file_count: analysis.fileCount,
          resolver_count: analysis.resolverCount,
          size_kb: analysis.sizeKb,
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
        },
      });

      if (error) throw new Error(error.message);

      setDone(true);
      setTimeout(() => onComplete(analysis), 600);
    } catch (err) {
      toast({ title: 'Upload failed', description: String(err), variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground">Code uploaded successfully</p>
        <p className="text-xs text-muted-foreground">Moving to next step…</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">Upload Your Code</h2>
        <p className="text-sm text-muted-foreground">
          Drop source files or paste code. We support 90+ languages.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setMode('upload')}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-medium transition-all",
            mode === 'upload'
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Upload className="w-3.5 h-3.5 inline mr-1.5" />
          Upload Files
        </button>
        <button
          onClick={() => setMode('paste')}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-medium transition-all",
            mode === 'paste'
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ClipboardPaste className="w-3.5 h-3.5 inline mr-1.5" />
          Paste Code
        </button>
      </div>

      {mode === 'upload' ? (
        <>
          <div
            className={cn(
              "border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer",
              dragOver
                ? "border-primary bg-primary/5"
                : files.length > 0
                  ? "border-primary/30 bg-primary/[0.03]"
                  : "border-border/30 hover:border-border/50"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            {files.length > 0 ? (
              <div className="space-y-2">
                <FileCode2 className="w-8 h-8 mx-auto text-primary" />
                <p className="text-sm font-medium text-foreground">
                  {files.length} file{files.length > 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-muted-foreground">
                  {files.map(f => f.name).slice(0, 3).join(', ')}
                  {files.length > 3 && ` +${files.length - 3} more`}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop files here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground/60">
                  .ts, .py, .rs, .go, .sol, .vhdl, and 80+ more
                </p>
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
        size="lg"
        className="w-full h-12 rounded-xl text-sm font-semibold gap-2"
        disabled={!hasInput || processing || !user}
        onClick={handleSubmit}
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing…
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Analyze Code
          </>
        )}
      </Button>

      {!user && (
        <p className="text-xs text-center text-muted-foreground">
          Sign in to upload and analyze your code
        </p>
      )}
    </div>
  );
}
