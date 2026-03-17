/**
 * PublicBreadcrumb — Contextual wayfinding for public pages.
 * Auto-generates crumbs from URL path. Compact on mobile (last 2 segments only).
 */

import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// Human-readable overrides for path segments
const LABEL_MAP: Record<string, string> = {
  "modules": "Modules",
  "documentation": "Docs",
  "docs": "Docs",
  "substrate": "Substrate",
  "capabilities": "Capabilities",
  "admin": "Admin",
  "upgrade": "Upgrade",
  "blog": "Blog",
  "changelog": "Changelog",
  "developers": "Developers",
  "academy": "Academy",
  "composable-cognitives": "Runtime Agents",
  "persistent-memory": "MEMORY",
  "use-cases": "Use Cases",
  "auth": "Sign In",
  "intelligence": "Intelligence",
  "forge": "Forge",
  "codelab": "CodeLab",
  "devtools": "DevTools",
  "explore": "Explore",
  "showcase": "Showcase",
  "library": "Library",
  "diligence": "Diligence",
  "proof": "Proof Mode",
  "lab": "Lab",
  "start-here": "Start Here",
  "status": "Status",
  "engines": "Engines",
  "engine-marketplace": "Engine Marketplace",
  "ai-operating-system": "AI OS",
  "architecture": "Architecture",
  "evolution": "EVOLUTION",
  "scanner": "Scanner",
  "packs": "Capability Packs",
  "gaming": "World Engine",
  "pricing": "Pricing",
  "about": "About",
  "contact": "Contact",
  "solutions": "Solutions",
  "enterprise": "Enterprise",
  "integrations": "Integrations",
};

function formatSegment(seg: string): string {
  if (LABEL_MAP[seg]) return LABEL_MAP[seg];
  return seg
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface PublicBreadcrumbProps {
  className?: string;
}

export function PublicBreadcrumb({ className }: PublicBreadcrumbProps) {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  // Don't render on homepage or single-segment routes
  if (segments.length < 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto scrollbar-none", className)}
    >
      <Link
        to="/"
        className="shrink-0 hover:text-foreground transition-colors min-w-[20px] min-h-[28px] flex items-center"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {segments.map((seg, i) => {
        const path = `/${segments.slice(0, i + 1).join("/")}`;
        const isLast = i === segments.length - 1;
        // On mobile, only show last 2 segments to save space
        const hiddenOnMobile = segments.length > 2 && i < segments.length - 2;

        return (
          <span key={path} className={cn("flex items-center gap-1.5 shrink-0", hiddenOnMobile && "hidden sm:flex")}>
            <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
            {isLast ? (
              <span className="font-medium text-foreground truncate max-w-[160px]">
                {formatSegment(seg)}
              </span>
            ) : (
              <Link
                to={path}
                className="hover:text-foreground transition-colors truncate max-w-[120px]"
              >
                {formatSegment(seg)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
