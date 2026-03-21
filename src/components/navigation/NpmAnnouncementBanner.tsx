/**
 * NPM Announcement Banner — Top-bar across all pages
 */

import { useState } from "react";
import { X, Package, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export function NpmAnnouncementBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-[10001] bg-secondary text-secondary-foreground overflow-hidden"
    >
      <div className="relative flex items-center justify-center gap-2 px-4 py-2 text-sm">
        {/* Animated marquee accent */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center gap-2"
        >
          <Package className="w-4 h-4 text-primary" />
          <span className="font-medium">
            <span className="font-bold text-primary">@cmpsbl</span> is live on npm
          </span>
          <span className="hidden sm:inline text-muted-foreground">—</span>
          <span className="hidden sm:inline">
            11 packages. One substrate. Ship composable intelligence today.
          </span>
          <Link
            to="/documentation"
            className="inline-flex items-center gap-1 ml-2 font-semibold text-primary hover:underline underline-offset-2"
          >
            Explore docs
            <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>

        <button
          onClick={onDismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted/50 transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </motion.div>
  );
}
