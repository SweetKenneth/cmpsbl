/**
 * PageTransition — Smooth fade-in wrapper for public pages
 * Uses pure CSS animations to avoid framer-motion forced reflows.
 */
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <div
      className={className}
      style={{
        animation: "pageFadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
      }}
    >
      {children}
    </div>
  );
}
