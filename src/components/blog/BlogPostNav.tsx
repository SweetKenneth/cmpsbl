/**
 * Blog Post Navigation — prev/next chapter links + related posts.
 * Polished card-based design with hover effects.
 */
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, BookOpen, ArrowLeft } from "lucide-react";
import { getAdjacentChapters, getRelatedChapters } from "@/data/blogChapters";
import { cn } from "@/lib/utils";

interface BlogPostNavProps {
  slug: string;
}

export function BlogPostNav({ slug }: BlogPostNavProps) {
  const { prev, next } = getAdjacentChapters(slug);
  const related = getRelatedChapters(slug);

  return (
    <nav aria-label="Blog navigation" className="mt-8 space-y-10">
      {/* Prev / Next */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {prev ? (
          <Link
            to={`/blog/${prev.slug}`}
            className={cn(
              "group flex items-center gap-3 p-4 rounded-xl",
              "border border-border/60 hover:border-primary/30",
              "bg-card/40 hover:bg-card/80",
              "transition-all duration-200 hover:-translate-y-0.5"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
              <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Previous</p>
              <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                Ch. {prev.chapter}: {prev.title}
              </p>
            </div>
          </Link>
        ) : <div />}
        {next ? (
          <Link
            to={`/blog/${next.slug}`}
            className={cn(
              "group flex items-center gap-3 p-4 rounded-xl text-right",
              "border border-border/60 hover:border-primary/30",
              "bg-card/40 hover:bg-card/80",
              "transition-all duration-200 hover:-translate-y-0.5",
              "sm:flex-row-reverse sm:text-left"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Next</p>
              <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                Ch. {next.chapter}: {next.title}
              </p>
            </div>
          </Link>
        ) : <div />}
      </div>

      {/* Related Posts */}
      {related.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" /> Related Chapters
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map(r => (
              <Link
                key={r.slug}
                to={`/blog/${r.slug}`}
                className={cn(
                  "group block p-4 rounded-xl",
                  "border border-border/50 hover:border-primary/30",
                  "bg-card/30 hover:bg-card/60",
                  "transition-all duration-200 hover:-translate-y-0.5"
                )}
              >
                <p className="text-[10px] uppercase tracking-widest text-primary/60 font-bold mb-1">
                  Chapter {r.chapter}
                </p>
                <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors mb-1.5 line-clamp-1">
                  {r.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{r.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Back to Blog */}
      <div className="text-center pt-2">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to all chapters
        </Link>
      </div>
    </nav>
  );
}
