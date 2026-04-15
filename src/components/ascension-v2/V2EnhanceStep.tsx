/**
 * V2 Enhance Step — Optional Mana attachment before Ascension
 *
 * Mode A (Now): Upload SDK-built software to merge with host code
 * Mode B (Future): Browse/purchase Store add-ons (placeholder in docs)
 *
 * Skippable — user can proceed directly to Analyze.
 *
 * U.S. Patent App. No. 64/031,637 (Mana)
 * © CMPSBL® — All rights reserved.
 */

import { useState, useCallback, useRef } from 'react';
import { Upload, SkipForward, Loader2, CheckCircle2, FileCode2, Layers, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeUploadedFiles } from '@/components/proprietary-evolution/ingest-utils';
import { detectFunctionBoundaries, buildAttachmentPlan, serializeAttachmentPlan } from '@/lib/mana';

interface Props {
  onComplete: (enhanced: boolean) => void;
}

export function V2EnhanceStep({ onComplete }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [attachmentCount, setAttachmentCount] = useState(0);
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

  const handleSkip = useCallback(() => {
    onComplete(false);
  }, [onComplete]);

  const handleAttach = async () => {
    if (files.length === 0 || !user) return;
    setProcessing(true);

    try {
      const analysis = await analyzeUploadedFiles(files);

      if (analysis.ingestedFiles.length === 0) {
        toast({ title: 'No code found', description: 'Could not read source code from package.', variant: 'destructive' });
        setProcessing(false);
        return;
      }

      // Run Mana function boundary detection on the uploaded package
      const combinedSource = analysis.ingestedFiles.map(f => f.content).join('\n');
      const boundaries = detectFunctionBoundaries(combinedSource);
      // Use all 40 substrate primitives as the active set for attachment planning
      const activePrimitives = new Set([
        'DEFENSE','GOVERNANCE','CONSCIENCE','COMPASS','AUDIT','BEACON',
        'BRAIN','MEMORY','CORTEX','ORACLE','INTENT','LINGUA',
        'IDENTITY','TRUST','VERITAS','RAMPART','SIEVE','GAUNTLET',
        'BASTION','WATCHTOWER','ATLAS','RELAY','FAILSAFE','DREAM',
        'NERVE','REFLEX','EVOLUTION','VISION','ARCHITECT','MONOLITH',
        'OBSIDIAN','WRAITH','RAPTOR','PRIMITIVE','AUTOMATON','SENTINEL',
        'PHANTOM','CIPHER','NEXUS','FORGE',
      ]);
      const plan = buildAttachmentPlan(boundaries, activePrimitives);
      const serializedPlan = serializeAttachmentPlan(plan);

      // Store the enhancement in artifact_registry with Mana metadata
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('artifact_registry').insert({
        user_id: user.id,
        name: `MANA_ENHANCE_${analysis.name}`,
        slug: `v2-mana-enhance-${analysis.name.toLowerCase()}-${Date.now().toString(36)}`,
        tier: 'enhancement',
        category: 'proprietary-mana-attachment-v2',
        description: `SDK-built enhancement: ${analysis.language} — ${analysis.fileCount} files, ${boundaries.length} attachment points`,
        metadata: {
          attachment_type: 'sdk-built',
          language: analysis.language,
          file_count: analysis.fileCount,
          size_kb: analysis.sizeKb,
          function_boundaries: boundaries.length,
          attachment_plan: serializedPlan,
          mana_wrapped: true,
          pipeline_version: 'v2',
          attached_at: new Date().toISOString(),
          source_files: analysis.ingestedFiles.map(f => ({
            name: f.name,
            extension: f.extension,
            language: f.language,
            size_bytes: f.sizeBytes,
            char_count: f.charCount,
            content: f.content,
          })),
        },
      });

      if (error) throw new Error(error.message);

      setAttachmentCount(boundaries.length);
      setDone(true);
      toast({
        title: 'Enhancement attached',
        description: `${boundaries.length} function boundaries detected and wrapped.`,
      });
      setTimeout(() => onComplete(true), 600);
    } catch (err) {
      toast({ title: 'Attachment failed', description: String(err), variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 animate-in fade-in">
        <CheckCircle2 className="w-12 h-12 text-primary" />
        <p className="text-foreground font-medium">Enhancement Attached</p>
        <p className="text-muted-foreground text-xs">
          {attachmentCount} function boundaries wrapped via Mana
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Enhance with Mana</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Optionally attach SDK-built software to merge with your code before Ascension.
        </p>
      </div>

      {/* SDK Upload Zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
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
            <Package className="w-8 h-8 mx-auto text-primary" />
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
            <Layers className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="text-foreground text-sm">Drop your SDK-built package here</p>
            <p className="text-muted-foreground text-xs">
              Software built with @cmpsbl/sdk for function-boundary attachment
            </p>
          </div>
        )}
      </div>

      {/* Store Add-Ons Teaser (Future) */}
      <div className="bg-muted/20 border border-border/30 rounded-xl p-4 opacity-60">
        <div className="flex items-center gap-2 mb-1">
          <FileCode2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Substrate Store Add-Ons — Coming Soon
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Browse and purchase substrate-built capabilities (Crown Jewels, Memory Stream
          discoveries, COMPILER output) to enhance your code before Ascension.
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          onClick={handleAttach}
          disabled={files.length === 0 || processing || !user}
          className="w-full h-11 rounded-xl"
        >
          {processing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Wrapping with Mana…</>
          ) : (
            <><Upload className="w-4 h-4 mr-2" />Attach &amp; Continue</>
          )}
        </Button>

        <Button
          variant="ghost"
          onClick={handleSkip}
          className="w-full text-muted-foreground"
        >
          <SkipForward className="w-3 h-3 mr-1" />
          Skip — Ascend Without Enhancements
        </Button>
      </div>
    </div>
  );
}
