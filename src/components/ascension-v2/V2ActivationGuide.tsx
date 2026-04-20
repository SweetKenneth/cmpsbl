/**
 * V2 Activation Guide — post-export "what to do next" inline panel.
 *
 * Surfaces on V2ResultsStep after the user has exported. Generates run-aware
 * snippets that reference the actual ascended filename so users can copy/paste
 * directly into their project. When the run was Mana-enhanced, also shows an
 * attach() example for the layers that auto-wired in.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useMemo, useState } from 'react';
import { Rocket, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { buildActivationSnippets } from '@/lib/ascension-v2/activation-snippets';

interface Props {
  ascendedFileName: string;
  language: string;
  enhanced: boolean;
  attachedLayerIds?: string[];
}

export function V2ActivationGuide({ ascendedFileName, language, enhanced, attachedLayerIds }: Props) {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const snippets = useMemo(
    () => buildActivationSnippets({ ascendedFileName, language, enhanced, attachedLayerIds }),
    [ascendedFileName, language, enhanced, attachedLayerIds],
  );

  const handleCopy = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1800);
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Your browser blocked clipboard access.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 sm:p-4 space-y-3">
      <div className="flex items-start gap-2">
        <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-semibold text-foreground">Activate your ascended code</p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug">
            Drop <span className="font-mono">{ascendedFileName}</span> into your project, then use one of the
            snippets below. Full details are in <span className="font-mono">USER-GUIDE.html</span>.
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {snippets.map((snippet) => {
          const copied = copiedId === snippet.id;
          return (
            <div key={snippet.id} className="rounded-lg border border-border bg-background/40 overflow-hidden">
              <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border bg-muted/30">
                <span className="text-[10px] sm:text-[11px] font-medium text-foreground">{snippet.title}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(snippet.id, snippet.code)}
                  className={cn(
                    'inline-flex items-center gap-1 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md transition-colors',
                    copied
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted hover:bg-muted/70 text-muted-foreground hover:text-foreground',
                  )}
                  aria-label={copied ? 'Copied' : 'Copy snippet'}
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="px-2.5 py-2 text-[10px] sm:text-[11px] font-mono text-foreground overflow-x-auto leading-relaxed">
                <code>{snippet.code}</code>
              </pre>
            </div>
          );
        })}
      </div>
    </div>
  );
}
