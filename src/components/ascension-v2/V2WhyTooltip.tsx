/**
 * V2 "Why am I seeing this?" Tooltip
 *
 * Tiny info affordance for advanced decision panels. Each advanced surface
 * (provenance, language notice, contract proof, drift hint) only renders
 * when something specific about THIS run triggered it. This component lets
 * the user click the question mark to find out why, in plain language.
 *
 * Uses shadcn Popover so it works on touch + keyboard, not just hover.
 *
 * © CMPSBL® — All rights reserved.
 */
import { HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Props {
  /** Plain-language reason this panel is on screen for this run. */
  readonly reason: string;
  /** Optional supplemental tip about what to do with the panel. */
  readonly tip?: string;
  /** Override label for screen readers. */
  readonly ariaLabel?: string;
  readonly className?: string;
}

export function V2WhyTooltip({ reason, tip, ariaLabel, className }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel ?? 'Why am I seeing this?'}
          className={cn(
            'inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-muted-foreground hover:text-foreground transition-colors',
            className,
          )}
        >
          <HelpCircle className="w-3 h-3" />
          <span className="underline decoration-dotted underline-offset-2">
            Why am I seeing this?
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-72 sm:w-80 p-3 text-[11px] leading-relaxed space-y-2"
      >
        <div>
          <p className="font-semibold text-foreground mb-1">Why this panel showed up</p>
          <p className="text-muted-foreground">{reason}</p>
        </div>
        {tip && (
          <div className="pt-1.5 border-t border-border/60">
            <p className="font-semibold text-foreground mb-1">What to do with it</p>
            <p className="text-muted-foreground">{tip}</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
