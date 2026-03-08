/**
 * BlogShareBar — Floating social share & reading progress for blog articles.
 * Desktop: left gutter sticky column. Mobile: bottom bar with progress line.
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Twitter, Linkedin, Link2, Check, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BlogShareBarProps {
  title: string;
  slug: string;
  progress: number;
  visible: boolean;
}

const BASE_URL = "https://cmpsbl.com/blog";

export function BlogShareBar({ title, slug, progress, visible }: BlogShareBarProps) {
  const [copied, setCopied] = useState(false);
  const url = `${BASE_URL}/${slug}`;
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 2000);
  }, [url]);

  const shareActions = [
    {
      label: "Share on X",
      icon: Twitter,
      href: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      label: "Share on LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  const pct = Math.round(progress);
  const circumference = 2 * Math.PI * 15;
  const strokeOffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* ─── Desktop — Left gutter sticky ─── */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex fixed left-[max(1.25rem,calc((100vw-768px)/2-80px))] top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-2.5"
          >
            {/* Progress ring */}
            <div className="relative w-11 h-11 mb-1" title={`${pct}% read`}>
              <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted) / 0.4)" strokeWidth="2" />
                <circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 ease-out"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-muted-foreground tabular-nums">
                {pct}%
              </span>
            </div>

            <div className="w-px h-3 bg-border/30" />

            {shareActions.map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={cn(
                  "w-10 h-10 rounded-xl bg-card/70 backdrop-blur-sm border border-border/30",
                  "flex items-center justify-center text-muted-foreground",
                  "hover:text-primary hover:border-primary/40 hover:bg-primary/5",
                  "transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-primary/10"
                )}
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}

            <button
              onClick={copyLink}
              aria-label="Copy link"
              className={cn(
                "w-10 h-10 rounded-xl bg-card/70 backdrop-blur-sm border border-border/30",
                "flex items-center justify-center text-muted-foreground",
                "hover:text-primary hover:border-primary/40 hover:bg-primary/5",
                "transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-primary/10",
                copied && "border-primary/40 text-primary"
              )}
            >
              {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            </button>
          </motion.div>

          {/* ─── Mobile — Bottom bar ─── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 safe-area-bottom"
          >
            {/* Progress line */}
            <div className="h-[2px] bg-muted/20">
              <motion.div
                className="h-full bg-primary"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>

            <div className="flex items-center justify-between px-4 py-2.5 bg-card/95 backdrop-blur-md border-t border-border/30">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="tabular-nums">{pct}% read</span>
              </div>

              <div className="flex items-center gap-0.5">
                {shareActions.map(({ label, icon: Icon, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary transition-colors min-h-[44px] min-w-[44px]"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
                <button
                  onClick={copyLink}
                  aria-label="Copy link"
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary transition-colors min-h-[44px] min-w-[44px]",
                    copied && "text-primary"
                  )}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
