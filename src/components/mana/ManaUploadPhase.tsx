/**
 * ManaUploadPhase — Upload software for Layer 2 attachment
 * Borrows from IngestPhase pattern
 */

import { useState, useCallback, useRef } from 'react';
import { Upload, FileCode2, Loader2, ClipboardPaste } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { analyzeUploadedFiles, analyzePastedCode, type CandidateAnalysis, LANG_MAP } from '@/components/proprietary-evolution/ingest-utils';
import { useToast } from '@/hooks/use-toast';

export interface ManaUploadResult {
  name: string;
  language: string;
  fileCount: number;
  sizeKb: number;
  functionCount: number;
  sourceContent: string;
  files: Array<{ name: string; content: string; language: string }>;
}

interface Props {
  onComplete: (result: ManaUploadResult) => void;
}

export function ManaUploadPhase({ onComplete }: Props) {
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [pastedCode, setPastedCode] = useState('');
  const [pasteFilename, setPasteFilename] = useState('');
  const [parsing, setParsing] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasInput = inputMode === 'upload' ? files.length > 0 : pastedCode.trim().length > 20;

  const handleFiles = useCallback((incoming: File[]) => {
    setFiles(incoming);
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

  const handleAnalyze = async () => {
    if (inputMode === 'upload' && files.length === 0) return;
    if (inputMode === 'paste' && pastedCode.trim().length < 20) {
      toast({ title: 'Code too short', description: 'Paste at least 20 characters.', variant: 'destructive' });
      return;
    }
    setParsing(true);
    try {
      const analysis = inputMode === 'upload'
        ? await analyzeUploadedFiles(files)
        : analyzePastedCode(pastedCode, pasteFilename || undefined);

      if (analysis.ingestedFiles.length === 0) {
        toast({ title: 'No code extracted', description: 'Files could not be read as source code.', variant: 'destructive' });
        setParsing(false);
        return;
      }

      // Count rough function boundaries
      const allContent = analysis.ingestedFiles.map(f => f.content || '').join('\n');
      const fnMatches = allContent.match(/function\s|const\s+\w+\s*=\s*(?:async\s*)?\(|def\s+\w+|fn\s+\w+|func\s+\w+|public\s+\w+\s*\(|export\s+(?:async\s+)?function/g);
      const functionCount = fnMatches?.length || 1;

      const result: ManaUploadResult = {
        name: analysis.name,
        language: analysis.language,
        fileCount: analysis.fileCount,
        sizeKb: analysis.sizeKb,
        functionCount,
        sourceContent: allContent,
        files: analysis.ingestedFiles.map(f => ({
          name: f.name,
          content: f.content || '',
          language: f.language,
        })),
      };

      onComplete(result);
    } catch (err) {
      toast({ title: 'Analysis failed', description: String(err), variant: 'destructive' });
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold mb-1">Upload Legacy Host Software</h3>
        <p className="text-sm text-muted-foreground">
          Drop your source files or paste code. This becomes the Layer 1 host that Mana wraps.
        </p>
      </div>

      <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'upload' | 'paste')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="gap-1.5 text-xs">
            <Upload className="w-3.5 h-3.5" /> Upload Files
          </TabsTrigger>
          <TabsTrigger value="paste" className="gap-1.5 text-xs">
            <ClipboardPaste className="w-3.5 h-3.5" /> Paste Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all",
              dragOver
                ? "border-primary bg-primary/5 scale-[1.01]"
                : files.length > 0
                  ? "border-primary/40 bg-primary/[0.03]"
                  : "border-border/40 hover:border-border/60"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            {files.length > 0 ? (
              <>
                <FileCode2 className="w-8 h-8 mx-auto text-primary mb-3" />
                <p className="text-sm font-medium">{files.length} file{files.length > 1 ? 's' : ''} selected</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {files.map(f => f.name).slice(0, 3).join(', ')}{files.length > 3 ? ` +${files.length - 3} more` : ''}
                </p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">Drop source files here</p>
                <p className="text-xs text-muted-foreground mt-1">All languages accepted · click or drag to upload</p>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="paste" className="mt-4 space-y-3">
          <Input
            placeholder="filename.ts (optional)"
            value={pasteFilename}
            onChange={(e) => setPasteFilename(e.target.value)}
            className="text-sm"
          />
          <Textarea
            placeholder="Paste your source code here..."
            value={pastedCode}
            onChange={(e) => setPastedCode(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />
        </TabsContent>
      </Tabs>

      <Button
        onClick={handleAnalyze}
        disabled={!hasInput || parsing}
        className="w-full gap-2"
        size="lg"
      >
        {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
        {parsing ? 'Scanning function boundaries...' : 'Scan Host Software'}
      </Button>
    </div>
  );
}

// Need this import for the button icon
import { Layers } from 'lucide-react';
