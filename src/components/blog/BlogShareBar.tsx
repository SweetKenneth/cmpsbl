/**
 * BlogShareBar — Floating social share & reading progress for blog articles.
 * Appears after scrolling past the hero, sticks to the left gutter on desktop
 * and as a bottom bar on mobile.
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Twitter, Linkedin, Link2, Check, BookOpen } from "lucide-react";
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

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Desktop — Left gutter sticky */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:flex fixed left-[max(1rem,calc((100vw-768px)/2-80px))] top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-3"
          >
            {/* Progress ring */}
            <div className="relative w-10 h-10 mb-1" title={`${Math.round(progress)}% read`}>
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--border) / 0.3)" strokeWidth="2" />
                <circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeDasharray={`${progress * 0.9425} 94.25`}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>

            {shareActions.map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-lg bg-card/60 backdrop-blur-sm border border-border/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all hover:scale-110"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}

            <button
              onClick={copyLink}
              aria-label="Copy link"
              className="w-9 h-9 rounded-lg bg-card/60 backdrop-blur-sm border border-border/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all hover:scale-110"
            >
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Link2 className="w-4 h-4" />}
            </button>
          </motion.div>

          {/* Mobile — Bottom bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 safe-area-bottom"
          >
            {/* Progress line at top of bar */}
            <div className="h-[2px] bg-muted/20">
              <div
                className="h-full bg-primary transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between px-4 py-2.5 bg-card/95 backdrop-blur-md border-t border-border/30">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{Math.round(progress)}% read</span>
              </div>

              <div className="flex items-center gap-1">
                {shareActions.map(({ label, icon: Icon, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary transition-colors min-h-[44px] min-w-[44px]"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
                <button
                  onClick={copyLink}
                  aria-label="Copy link"
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary transition-colors min-h-[44px] min-w-[44px]"
                >
                  {copied ? <Check className="w-4 h-4 text-primary" /> : <Link2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
