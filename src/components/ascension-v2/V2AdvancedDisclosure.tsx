/**
 * V2 Advanced Disclosure — single collapsible group for expert panels.
 *
 * Animations:
 *   • Container height transitions from 0 → measured scrollHeight (and back)
 *     using a ref so we can animate `auto` content smoothly.
 *   • Child sections stagger in via `animate-fade-in` with per-child
 *     `animationDelay` (60ms steps) so the panels feel sequenced rather than
 *     arriving in a single thump.
 *   • Honors `prefers-reduced-motion` by collapsing both effects to instant.
 *
 * © CMPSBL® — All rights reserved.
 */
import {
  useState,
  useRef,
  useEffect,
  Children,
  isValidElement,
  cloneElement,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { ChevronDown, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  /** Count of advanced panels with content for this run (header indicator). */
  readonly activeCount: number;
  /** Total advanced panels possible (for the "X of Y" indicator). */
  readonly totalCount: number;
  /** Body — kept mounted after first open so collapse can animate too. */
  readonly children: ReactNode;
  /** Whether the disclosure starts open. Defaults to closed. */
  readonly defaultOpen?: boolean;
}

const STAGGER_MS = 60;
// Persisted across reloads so power users don't re-open the panel every visit.
// Scoped to the V2 surface; cleared along with other cmpsbl_v2_* keys.
const STORAGE_KEY = 'cmpsbl_v2_advanced_disclosure_open';

function readPersistedOpen(fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === '1') return true;
    if (raw === '0') return false;
    return fallback;
  } catch {
    return fallback;
  }
}

function writePersistedOpen(open: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, open ? '1' : '0');
  } catch {
    /* non-fatal — user just doesn't get persistence */
  }
}

export function V2AdvancedDisclosure({
  activeCount,
  totalCount,
  children,
  defaultOpen = false,
}: Props) {
  // Start with `defaultOpen` for SSR/first paint determinism, then hydrate
  // from localStorage in an effect below to avoid a flash of wrong state.
  const [open, setOpen] = useState(defaultOpen);
  // Once opened, keep DOM mounted so the closing transition has something to
  // animate from. Avoids the "instant snap closed" you get when unmounting.
  const [hasOpened, setHasOpened] = useState(defaultOpen);
  const [maxHeight, setMaxHeight] = useState<number | 'auto'>(defaultOpen ? 'auto' : 0);

  // Hydrate persisted choice on mount. If the stored value differs from the
  // default we flip state — the height effect below will then animate it open.
  useEffect(() => {
    const persisted = readPersistedOpen(defaultOpen);
    if (persisted !== open) {
      setOpen(persisted);
      if (persisted) setHasOpened(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist every user-driven change.
  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      writePersistedOpen(next);
      return next;
    });
  };
  const innerRef = useRef<HTMLDivElement | null>(null);
  const pct = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

  // Drive the height animation. We snap to the measured scrollHeight on open,
  // then drop back to `auto` after the transition so dynamic child changes
  // (e.g. expanding a row inside provenance) aren't clipped.
  useEffect(() => {
    const node = innerRef.current;
    if (!node) return;

    if (open) {
      setHasOpened(true);
      // Two-step: 0 → measured → auto. Reading scrollHeight forces a flush.
      const target = node.scrollHeight;
      setMaxHeight(target);
      const t = window.setTimeout(() => setMaxHeight('auto'), 260);
      return () => window.clearTimeout(t);
    }

    // Closing: lock current measured height first so the transition has a
    // concrete starting point, then on next frame collapse to 0.
    if (hasOpened) {
      const current = node.scrollHeight;
      setMaxHeight(current);
      const raf = window.requestAnimationFrame(() => setMaxHeight(0));
      return () => window.cancelAnimationFrame(raf);
    }
  }, [open, hasOpened]);

  // Stagger each immediate child by injecting an animation-delay style.
  // Uses inline style on a wrapper so we don't require children to opt-in.
  const staggered = Children.toArray(children).map((child, i) => {
    const style: CSSProperties = {
      animationDelay: open ? `${i * STAGGER_MS}ms` : '0ms',
      animationFillMode: 'both',
    };
    if (isValidElement(child)) {
      // Wrap rather than mutate child props — keeps types safe and avoids
      // colliding with whatever className/style the child already owns.
      return (
        <div
          key={(child.key as string | number | undefined) ?? `panel-${i}`}
          className={open ? 'animate-fade-in motion-reduce:animate-none' : ''}
          style={open ? style : undefined}
        >
          {cloneElement(child)}
        </div>
      );
    }
    return (
      <div
        key={`panel-${i}`}
        className={open ? 'animate-fade-in motion-reduce:animate-none' : ''}
        style={open ? style : undefined}
      >
        {child}
      </div>
    );
  });

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
            'w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      <div
        // Animated wrapper — height transitions; overflow hidden keeps the
        // collapse clean. `motion-reduce` users get an instant change.
        className="overflow-hidden transition-[max-height] duration-300 ease-out motion-reduce:transition-none"
        style={{
          maxHeight:
            maxHeight === 'auto' ? 'none' : `${maxHeight}px`,
        }}
        aria-hidden={!open}
      >
        {hasOpened && (
          <div
            ref={innerRef}
            className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 space-y-3 sm:space-y-4 border-t border-border/40"
          >
            {staggered}
          </div>
        )}
      </div>
    </div>
  );
}
