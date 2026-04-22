/**
 * V2 Advanced Disclosure — single collapsible group for expert panels.
 *
 * In Advanced mode the results step exposes four optional surfaces:
 *   • Capability provenance trace
 *   • Source-language status notice (Beta / pass-through)
 *   • Contract proof + per-finding policy overrides
 *   • Staged drift-decisions hint
 *
 * Rather than stack them as four loose cards, this component groups them under
 * one disclosure with a header that shows how many of the panels are actually
 * active for this run (the "progress indicator"). Users open it once when they
 * want depth, close it when they don't.
 *
 * © CMPSBL® — All rights reserved.
 */
import { useState, type ReactNode } from 'react';
import { ChevronDown, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  /** Total advanced panels available this run (panels with content to show). */
  readonly activeCount: number;
  /** Total advanced panels possible (for the "X of Y" indicator). */
  readonly totalCount: number;
  /** Render-prop body — only mounted when the disclosure is open. */
  readonly children: ReactNode;
  /** Whether the disclosure starts open. Defaults to closed. */
  readonly defaultOpen?: boolean;
}

export function V2AdvancedDisclosure({
  activeCount,
  totalCount,
  children,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const pct = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

  return (
    <div className="rounded-xl border border-border/60 bg-muted/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-muted/20 transition-colors"
      >
        <Wrench className="w-4 h-4 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold text-foreground">
            Technical details
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug">
            {activeCount} of {totalCount} expert panels active for this run
          </p>
          {/* Progress bar — visualizes how much extra context this run carries */}
          <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary/70 transition-all duration-300"
              style={{ width: `${pct}%` }}
              aria-hidden="true"
            />
          </div>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 space-y-3 sm:space-y-4 border-t border-border/40">
          {children}
        </div>
      )}
    </div>
  );
}
