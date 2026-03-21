/**
 * NPM Announcement Banner — Permanent top-bar across all pages
 */

import { Package, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function NpmAnnouncementBanner() {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-[10001] overflow-hidden"
      style={{ background: 'linear-gradient(135deg, hsl(210, 90%, 50%), hsl(230, 85%, 55%), hsl(250, 80%, 60%))' }}
    >
      <div className="relative flex items-center justify-center gap-2 px-4 py-2 text-sm text-white">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center gap-2"
        >
          <Package className="w-4 h-4 text-white/90" />
          <span className="font-medium">
            <span className="font-bold text-white">@cmpsbl</span> is live on npm
          </span>
          <span className="hidden sm:inline text-white/70">—</span>
          <span className="hidden sm:inline text-white/80">
            11 packages. One substrate. Ship composable intelligence today.
          </span>
          <Link
            to="/documentation"
            className="inline-flex items-center gap-1 ml-2 font-semibold text-white hover:underline underline-offset-2"
          >
            Explore docs
            <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
