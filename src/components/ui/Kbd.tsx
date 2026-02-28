/**
 * KbdShortcut — Styled keyboard shortcut badge
 */

interface KbdProps {
  keys: string[];
  className?: string;
}

export function Kbd({ keys, className = '' }: KbdProps) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {keys.map((key, i) => (
        <span key={i}>
          {i > 0 && <span className="text-muted-foreground mx-0.5">+</span>}
          <kbd className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 text-[10px] font-mono font-medium text-muted-foreground bg-muted border border-border rounded shadow-sm">
            {key}
          </kbd>
        </span>
      ))}
    </span>
  );
}
