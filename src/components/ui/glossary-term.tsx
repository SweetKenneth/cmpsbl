/**
 * GlossaryTerm — Inline hoverable tooltip for CMPSBL terminology
 * Wraps any text with a subtle dotted underline and shows definition on hover.
 */

import { getGlossaryEntry } from "@/lib/glossary";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface GlossaryTermProps {
  /** The glossary key (e.g. "node", "memory-stream", "cjpi") */
  term: string;
  /** Override display text (defaults to the glossary term name) */
  children?: React.ReactNode;
  className?: string;
}

export function GlossaryTerm({ term, children, className }: GlossaryTermProps) {
  const entry = getGlossaryEntry(term);

  if (!entry) {
    return <span className={className}>{children || term}</span>;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "border-b border-dotted border-primary/40 cursor-help transition-colors hover:border-primary/70 hover:text-primary",
              className
            )}
          >
            {children || entry.term}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs p-3 space-y-1.5 bg-card border-border/50"
        >
          <p className="text-xs font-bold text-foreground">{entry.term}</p>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {entry.detail || entry.short}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
