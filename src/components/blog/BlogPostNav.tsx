/**
 * Blog Post Navigation — prev/next chapter links + related posts.
 * Provides internal cross-linking for SEO.
 */
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { getAdjacentChapters, getRelatedChapters, type BlogChapter } from "@/data/blogChapters";

interface BlogPostNavProps {
  slug: string;
}

export function BlogPostNav({ slug }: BlogPostNavProps) {
  const { prev, next } = getAdjacentChapters(slug);
  const related = getRelatedChapters(slug);

  return (
    <nav aria-label="Blog navigation" className="mt-16 border-t border-border pt-8 space-y-8">
      {/* Prev / Next */}
      <div className="flex justify-between gap-4">
        {prev ? (
          <Link to={`/blog/${prev.slug}`} className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <div>
              <p className="text-xs uppercase tracking-wider">Previous</p>
              <p className="font-semibold text-sm group-hover:text-primary transition-colors">Ch. {prev.chapter}: {prev.title}</p>
            </div>
          </Link>
        ) : <div />}
        {next ? (
          <Link to={`/blog/${next.slug}`} className="group flex items-center gap-2 text-right text-muted-foreground hover:text-foreground transition-colors">
            <div>
              <p className="text-xs uppercase tracking-wider">Next</p>
              <p className="font-semibold text-sm group-hover:text-primary transition-colors">Ch. {next.chapter}: {next.title}</p>
            </div>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : <div />}
      </div>

      {/* Related Posts */}
      {related.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Related Chapters
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map(r => (
              <Link
                key={r.slug}
                to={`/blog/${r.slug}`}
                className="block p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-accent/30 transition-all"
              >
                <p className="text-xs text-muted-foreground">Chapter {r.chapter}</p>
                <p className="font-semibold text-sm text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Back to Blog */}
      <div className="text-center">
        <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4">
          ← Back to all chapters
        </Link>
      </div>
    </nav>
  );
}
