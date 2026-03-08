/**
 * BlogArticleLayout — Shared wrapper for all blog chapter pages.
 * Provides a polished reading experience with progress bar, refined typography,
 * social sharing, and consistent structure across all 40 chapters.
 */
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowUp, Users } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import { BlogShareBar } from "@/components/blog/BlogShareBar";
import { RewrittenNotice } from "@/components/blog/RewrittenNotice";
import { cn } from "@/lib/utils";

interface BlogArticleLayoutProps {
  slug: string;
  title: string;
  subtitle?: string;
  date: string;
  readTime: string;
  heroImage: string;
  heroAlt: string;
  chapter?: number;
  showRewrittenNotice?: boolean;
  children: React.ReactNode;
  /** Extra head elements (SEO, JSON-LD) */
  head?: React.ReactNode;
}

export function BlogArticleLayout({
  slug,
  title,
  subtitle,
  date,
  readTime,
  heroImage,
  heroAlt,
  chapter,
  showRewrittenNotice = true,
  children,
  head,
}: BlogArticleLayoutProps) {
  const [progress, setProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showShareBar, setShowShareBar] = useState(false);
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return;
      const el = articleRef.current;
      const rect = el.getBoundingClientRect();
      const total = el.scrollHeight - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      const pct = Math.min(100, (scrolled / total) * 100);
      setProgress(pct);
      setShowScrollTop(scrolled > 400);
      setShowShareBar(scrolled > 200);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {head}

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[3px]">
        <div
          className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary/60 transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <PublicNav />

      {/* Social share bar */}
      <BlogShareBar
        title={title}
        slug={slug}
        progress={progress}
        visible={showShareBar}
      />

      <main className="min-h-screen bg-background" ref={articleRef}>
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Hero image — shorter on mobile */}
          <div className="aspect-[16/9] sm:aspect-[21/9] max-h-[320px] sm:max-h-[480px] overflow-hidden relative">
            <img
              src={heroImage}
              alt={heroAlt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent" />
          </div>

          {/* Floating header — less aggressive overlap on mobile */}
          <div className="container max-w-3xl mx-auto px-5 sm:px-6 relative -mt-20 sm:-mt-32 z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {chapter && (
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 mb-3 sm:mb-4">
                  Chapter {chapter}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black leading-[1.1] tracking-tight mb-2 sm:mb-3">
                {title}
              </h1>
              {subtitle && (
                <p className="text-base sm:text-lg text-muted-foreground/80 font-medium mb-3 sm:mb-4 max-w-xl">
                  {subtitle}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {readTime}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Written by the CMPSBL team
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Article body */}
        <article className="container max-w-3xl mx-auto px-5 sm:px-6 pt-8 sm:pt-10 pb-12 sm:pb-16">
          {showRewrittenNotice && <RewrittenNotice />}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className={cn(
              "prose prose-invert max-w-none",
              "prose-headings:font-black prose-headings:tracking-tight",
              /* H2 — smaller on mobile, proper spacing */
              "prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 sm:prose-h2:mt-12 prose-h2:mb-3 sm:prose-h2:mb-4 prose-h2:text-foreground",
              "prose-h2:border-l-[3px] prose-h2:border-primary prose-h2:pl-3 sm:prose-h2:pl-4",
              /* Body text — 16px on mobile for readability, comfortable line height */
              "prose-p:text-muted-foreground prose-p:leading-[1.75] sm:prose-p:leading-[1.8]",
              "prose-p:text-[15px] sm:prose-p:text-[16px]",
              "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
              "prose-strong:text-foreground prose-strong:font-bold",
              "prose-blockquote:border-l-primary/40 prose-blockquote:bg-card/30 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-3 sm:prose-blockquote:px-4",
              "prose-img:rounded-xl",
              "prose-figcaption:text-center prose-figcaption:text-muted-foreground/60 prose-figcaption:text-xs sm:prose-figcaption:text-sm",
              /* Tighter vertical rhythm on mobile */
              "space-y-4 sm:space-y-6",
              /* Lists */
              "prose-li:text-muted-foreground prose-li:text-[15px] sm:prose-li:text-[16px] prose-li:leading-[1.75]",
              "prose-ul:pl-4 sm:prose-ul:pl-6 prose-ol:pl-4 sm:prose-ol:pl-6",
            )}
          >
            {children}
          </motion.div>

          {/* Separator */}
          <div className="mt-12 sm:mt-16 mb-0">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          <BlogPostNav slug={slug} />
        </article>

        {/* Bottom spacer for mobile share bar */}
        <div className="h-14 lg:h-0" />
      </main>

      {/* Scroll to top FAB — offset for mobile share bar */}
      <motion.button
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-16 lg:bottom-6 right-5 sm:right-6 z-50 w-10 h-10 rounded-full",
          "bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20",
          "flex items-center justify-center",
          "hover:bg-primary transition-all",
        )}
        initial={false}
        animate={{ opacity: showScrollTop ? 1 : 0, scale: showScrollTop ? 1 : 0.8 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: showScrollTop ? "auto" : "none" }}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-4 h-4" />
      </motion.button>

      <EnhancedFooter />
    </>
  );
}
