/**
 * RewrittenNotice — Transparency disclosure for blog posts
 * States openly that the Origin Story was rewritten from earlier posts for continuity.
 */
import { Info } from "lucide-react";

export function RewrittenNotice() {
  return (
    <aside className="my-8 p-5 rounded-xl border border-border/50 bg-card/50" role="note" aria-label="Editorial transparency notice">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground leading-relaxed">
          <p className="font-medium text-foreground mb-1">A note on this series</p>
          <p>
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
