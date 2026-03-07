/**
 * RewrittenNotice — Transparency disclosure for blog posts.
 * Refined design with subtle callout styling.
 */
import { Info } from "lucide-react";

export function RewrittenNotice() {
  return (
    <aside
      className="my-10 p-5 rounded-xl border border-primary/10 bg-primary/[0.03] relative overflow-hidden"
      role="note"
      aria-label="Editorial transparency notice"
    >
      {/* Accent stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/60 via-primary/30 to-transparent rounded-l-xl" />

      <div className="flex items-start gap-3 pl-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-primary" />
        </div>
        <div className="text-sm leading-relaxed">
          <p className="font-semibold text-foreground mb-1.5 tracking-tight">A note on this series</p>
          <p className="text-muted-foreground">
            The Substrate Origin Story has been rewritten and consolidated from earlier posts
            published under our previous branding. The technical content is the same — we've
            reorganized it into a coherent chronological narrative so new readers can follow
            the full arc of how the substrate was built. If you read the originals, you'll
            recognize the ideas. The packaging is new; the honesty isn't.
          </p>
        </div>
      </div>
    </aside>
  );
}
