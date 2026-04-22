/**
 * V2 Package Overview Skeleton
 *
 * Mirrors the exact bordered card structure of the real Package overview
 * (3-tile summary row, contents preview row, capabilities row) so the swap
 * from skeleton → real content is byte-for-byte the same height. Prevents
 * any layout shift while `loading` is true in V2ResultsStep.
 *
 * Each row uses the same padding (`p-3 sm:p-4`), same divider sweep
 * placeholders, and same min-heights as the live card. The Skeleton
 * primitive carries its own pulse so we don't need extra animation here.
 *
 * © CMPSBL® — All rights reserved.
 */
import { Skeleton } from '@/components/ui/skeleton';

export function V2PackageOverviewSkeleton() {
  return (
    <section
      aria-label="Ascended package overview — loading"
      aria-busy="true"
      className="rounded-2xl border border-border bg-card/40 overflow-hidden [contain:layout_paint]"
    >
      {/* Row 1 — summary tiles. Three equal cells, same heights as live row. */}
      <div className="grid grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="p-3 sm:p-4 text-center space-y-2">
            <Skeleton className="h-6 sm:h-8 w-10 sm:w-14 mx-auto rounded-md" />
            <Skeleton className="h-2 sm:h-2.5 w-12 sm:w-16 mx-auto rounded" />
          </div>
        ))}
      </div>

      {/* Static divider — no sweep animation, just reserves the 1px line. */}
      <div aria-hidden="true" className="h-px bg-border/60" />

      {/* Row 2 — package contents preview. 6 file rows match live row count. */}
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="h-3 w-32 rounded" />
        </div>
        <div className="space-y-1 sm:space-y-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5 sm:gap-2 py-0.5 sm:py-1">
              <Skeleton className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded" />
              <Skeleton className="h-3 flex-1 max-w-[60%] rounded" />
              <Skeleton className="h-2.5 w-20 rounded hidden xs:block" />
            </div>
          ))}
        </div>
      </div>

      <div aria-hidden="true" className="h-px bg-border/60" />

      {/* Row 3 — activated capabilities. Reserves the same scrollable region
          (max-h matches the live row) so the swap doesn't change card height. */}
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="h-3 w-36 rounded" />
          <Skeleton className="h-3 w-6 rounded ml-auto" />
        </div>
        <div className="space-y-1 sm:space-y-1.5 max-h-[180px] sm:max-h-[200px] overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5 sm:gap-2 py-0.5 sm:py-1">
              <Skeleton className="w-1.5 h-1.5 rounded-full" />
              <Skeleton className="h-3 flex-1 max-w-[55%] rounded" />
              <Skeleton className="h-3 w-10 rounded" />
              <Skeleton className="h-3 w-8 rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
