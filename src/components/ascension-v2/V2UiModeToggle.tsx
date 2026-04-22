/**
 * V2 UI Mode Toggle — Simple vs Advanced
 *
 * Single small segmented control. Simple is the calm default; Advanced
 * unlocks the contract proof panel, per-finding policy overrides,
 * capability provenance trace, harness details, and language status notes.
 *
 * © CMPSBL® — All rights reserved.
 */
import { Sparkles, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { V2UiMode } from '@/lib/ascension-v2/ui-mode';

interface Props {
  readonly mode: V2UiMode;
  readonly onChange: (next: V2UiMode) => void;
}

export function V2UiModeToggle({ mode, onChange }: Props) {
  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/30 p-0.5"
      role="radiogroup"
      aria-label="Ascension UI mode"
    >
      <ToggleButton
        active={mode === 'simple'}
        onClick={() => onChange('simple')}
        icon={<Sparkles className="w-3 h-3" />}
        label="Simple"
        title="Calm flow — only the essentials"
      />
      <ToggleButton
        active={mode === 'advanced'}
        onClick={() => onChange('advanced')}
        icon={<Wrench className="w-3 h-3" />}
        label="Advanced"
        title="Full expert surface — contract proof, drift overrides, provenance"
      />
    </div>
  );
}

interface BtnProps {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly title: string;
}

function ToggleButton({ active, onClick, icon, label, title }: BtnProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      title={title}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors',
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {icon}
      {label}
    </button>
  );
}
