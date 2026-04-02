/**
 * Site Announcement Banner — Dismissible top-bar across all pages
 * Currently: Site redesign announcement
 */

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const DISMISS_KEY = "cmpsbl-banner-dismissed-v2";

export function NpmAnnouncementBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-[10001] overflow-hidden"
          style={{ background: 'linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)), hsl(var(--neon-magenta)))' }}
        >
          <div className="relative flex items-center justify-center gap-2 px-4 py-2 text-sm text-white">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-white/90 shrink-0" />
              <span className="font-medium">
                <span className="font-bold text-white">New look, same substrate.</span>
              </span>
              <span className="hidden sm:inline text-white/80">
                Showroom, Restoration Shop, new plans, and more.
              </span>
              <Link
                to="/changelog"
                className="inline-flex items-center gap-1 ml-2 font-semibold text-white hover:underline underline-offset-2"
              >
                See what changed
                <ArrowRight className="w-3 h-3" />
              </Link>
            </motion.div>
            <button
              onClick={handleDismiss}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Dismiss announcement"
            >
              <X className="w-3.5 h-3.5 text-white/80" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
