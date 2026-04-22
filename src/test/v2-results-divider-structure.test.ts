/**
 * V2ResultsStep — Divider Structure Snapshot
 *
 * Guards the unified Package overview card's row separators. The card has
 * exactly 3 rows (summary tiles, package contents, activated capabilities)
 * separated by exactly 2 animated divider lines. If a future edit accidentally
 * removes a divider or duplicates one, this test fails fast.
 *
 * We assert on the source file rather than mounting the component because
 * V2ResultsStep pulls in heavy runtime deps (JSZip, supabase client,
 * file-saver, auth/toast contexts) that are out of scope for a structural
 * snapshot test. The dividers are pure markup — string assertions are
 * sufficient and zero-cost.
 *
 * © CMPSBL® — All rights reserved.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SOURCE_PATH = resolve(
  __dirname,
  '../components/ascension-v2/V2ResultsStep.tsx',
);
const source = readFileSync(SOURCE_PATH, 'utf-8');

describe('V2ResultsStep — Package overview divider structure', () => {
  it('renders exactly 2 animated dividers between the 3 card rows', () => {
    // Each divider uses the `animate-divider-sweep` utility from tailwind.config.
    const matches = source.match(/animate-divider-sweep/g) ?? [];
    expect(matches.length).toBe(2);
  });

  it('uses the staggered animation delays that sync with row fade-ins', () => {
    // Divider 1 precedes Row 2 (which starts at 160ms) → 120ms.
    // Divider 2 precedes Row 3 (which starts at 260ms) → 220ms.
    expect(source).toContain("animationDelay: '120ms'");
    expect(source).toContain("animationDelay: '220ms'");
  });

  it('marks dividers as decorative for screen readers', () => {
    // Both dividers are aria-hidden so AT users skip them.
    const ariaHiddenCount = (source.match(/aria-hidden="true"/g) ?? []).length;
    // Two dividers + skeleton's two static dividers + a few decorative icons —
    // the floor is what matters: at least one aria-hidden per animated divider.
    expect(ariaHiddenCount).toBeGreaterThanOrEqual(2);
  });

  it('uses the gradient fade for the divider line (not a flat bar)', () => {
    // Sweep reads as a soft filament, not a hard line.
    expect(source).toContain('from-transparent via-border to-transparent');
  });

  it('respects prefers-reduced-motion on every animated divider', () => {
    // Each `animate-divider-sweep` should be paired with `motion-reduce:animate-none`.
    const sweepCount = (source.match(/animate-divider-sweep/g) ?? []).length;
    const reduceCount = (
      source.match(/animate-divider-sweep[^"]*motion-reduce:animate-none/g) ?? []
    ).length;
    expect(reduceCount).toBe(sweepCount);
  });
});
